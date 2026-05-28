import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'umbra-dev-secret-change-me';
const CLIENT_URL = process.env.CLIENT_URL || '*';

const db = new Database(path.join(__dirname, 'database.sqlite'));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL === '*' ? true : CLIENT_URL, credentials: true }));

const now = () => new Date().toISOString();
const uid = () => `u_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;

const parseFilter = (value) => {
  if (typeof value !== 'string') return { op: 'eq', val: value };
  const [op, ...rest] = value.split('.');
  return { op, val: rest.join('.') };
};

const toNumberIfPossible = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
};

const pass = (fieldValue, op, rawVal) => {
  const val = toNumberIfPossible(rawVal);
  const cur = fieldValue ?? null;
  if (op === 'eq') return String(cur) === String(val);
  if (op === 'neq') return String(cur) !== String(val);
  if (op === 'gt') return Number(cur) > Number(val);
  if (op === 'gte') return Number(cur) >= Number(val);
  if (op === 'lt') return Number(cur) < Number(val);
  if (op === 'lte') return Number(cur) <= Number(val);
  if (op === 'like') return String(cur).toLowerCase().includes(String(val).toLowerCase());
  return true;
};

const bootstrap = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      _row_id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      data TEXT NOT NULL,
      _created_by TEXT,
      _created_at TEXT NOT NULL,
      _updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_records_table ON records(table_name);
    CREATE INDEX IF NOT EXISTS idx_records_created_by ON records(_created_by);
  `);

  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@umbra.local');
  if (!adminExists) {
    const password_hash = bcrypt.hashSync('Admin12345!', 10);
    db.prepare('INSERT INTO users (id, email, password_hash, first_name, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uid(), 'admin@umbra.local', password_hash, 'Admin');
  }
};

bootstrap();

const getUserFromReq = (req) => {
  const token = req.cookies?.umbra_token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'unauthorized' });
  req.user = user;
  next();
};

app.post('/api/v2/auth/signup', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'missing_fields' });
  if (String(password).length < 8) return res.status(400).json({ message: 'insufficient_password' });

  try {
    const id = uid();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, email, password_hash, first_name, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, email.toLowerCase(), hash, name || email.split('@')[0], now());

    const user = { userUuid: id, email: email.toLowerCase(), firstName: name || email.split('@')[0] };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('umbra_token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 86400000 });
    return res.json({ user });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ message: 'email_exists' });
    return res.status(500).json({ message: 'signup_failed' });
  }
});

app.post('/api/v2/auth/signin', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase());
  if (!row) return res.status(401).json({ message: 'bad_credentials' });
  if (!bcrypt.compareSync(password || '', row.password_hash)) return res.status(401).json({ message: 'bad_credentials' });

  const user = { userUuid: row.id, email: row.email, firstName: row.first_name };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('umbra_token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 86400000 });
  return res.json({ user });
});

app.post('/api/v2/auth/signout', (_req, res) => {
  res.clearCookie('umbra_token');
  res.json({ success: true });
});

app.get('/api/v2/auth/user', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'not_authenticated' });
  res.json({ user });
});

app.get('/api/v2/database', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT table_name FROM records ORDER BY table_name').all();
  res.json({ tables: rows.map((r) => r.table_name) });
});

app.get('/api/v2/database/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const rows = db.prepare('SELECT * FROM records WHERE table_name = ?').all(table);
  let mapped = rows.map((r) => ({ _row_id: r._row_id, _created_by: r._created_by, _created_at: r._created_at, _updated_at: r._updated_at, ...JSON.parse(r.data) }));

  const { order, limit, select, ...filters } = req.query;
  Object.entries(filters).forEach(([key, raw]) => {
    const { op, val } = parseFilter(raw);
    mapped = mapped.filter((item) => pass(item[key], op, val));
  });

  if (order && typeof order === 'string') {
    const [field, direction] = order.split('.');
    mapped.sort((a, b) => {
      if (a[field] === b[field]) return 0;
      const res = a[field] > b[field] ? 1 : -1;
      return direction === 'desc' ? -res : res;
    });
  }

  if (limit) mapped = mapped.slice(0, Number(limit));
  if (select === 'count') return res.json({ count: mapped.length });
  return res.json(mapped);
});

app.post('/api/v2/database/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const payload = req.body || {};
  const _created_at = now();
  const _updated_at = _created_at;
  const result = db.prepare('INSERT INTO records (table_name, data, _created_by, _created_at, _updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(table, JSON.stringify(payload), req.user.userUuid, _created_at, _updated_at);

  const created = { _row_id: result.lastInsertRowid, _created_by: req.user.userUuid, _created_at, _updated_at, ...payload };
  res.json(created);
});

app.put('/api/v2/database/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const updates = req.body || {};
  const filters = req.query || {};
  const rows = db.prepare('SELECT * FROM records WHERE table_name = ?').all(table);
  let updatedCount = 0;
  let last = null;

  rows.forEach((row) => {
    const data = JSON.parse(row.data);
    const rowData = { _row_id: row._row_id, _created_by: row._created_by, ...data };
    const match = Object.entries(filters).every(([key, raw]) => {
      const { op, val } = parseFilter(raw);
      return pass(rowData[key], op, val);
    });

    if (match) {
      const merged = { ...data, ...updates };
      const ts = now();
      db.prepare('UPDATE records SET data = ?, _updated_at = ? WHERE _row_id = ?').run(JSON.stringify(merged), ts, row._row_id);
      updatedCount += 1;
      last = { _row_id: row._row_id, _created_by: row._created_by, _created_at: row._created_at, _updated_at: ts, ...merged };
    }
  });

  res.json(last || { updated: updatedCount });
});

app.delete('/api/v2/database/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const filters = req.query || {};
  const rows = db.prepare('SELECT * FROM records WHERE table_name = ?').all(table);
  let deleted = 0;

  rows.forEach((row) => {
    const data = JSON.parse(row.data);
    const rowData = { _row_id: row._row_id, _created_by: row._created_by, ...data };
    const match = Object.entries(filters).every(([key, raw]) => {
      const { op, val } = parseFilter(raw);
      return pass(rowData[key], op, val);
    });

    if (match) {
      db.prepare('DELETE FROM records WHERE _row_id = ?').run(row._row_id);
      deleted += 1;
    }
  });

  res.json({ success: true, deleted });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Umbra backend live on http://localhost:${PORT}`);
});