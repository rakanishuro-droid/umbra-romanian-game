const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v2/database';

const buildUrl = (table: string, params: Record<string, any> = {}) => {
  const url = new URL(`${API_BASE}/${encodeURIComponent(table)}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
};

const request = async (method: string, table: string, params = {}, body: any = null) => {
  const res = await fetch(buildUrl(table, params), {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'database_error');
  return data;
};

const db = {
  query: (table: string, params = {}) => request('GET', table, params),
  insert: (table: string, data: any) => request('POST', table, {}, data),
  update: (table: string, params: any, data: any) => request('PUT', table, params, data),
  delete: (table: string, params: any) => request('DELETE', table, params),
  count: async (table: string, params = {}) => {
    const out = await request('GET', table, { ...params, select: 'count' });
    return out.count || 0;
  },
};

export default db;
