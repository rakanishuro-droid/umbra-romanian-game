# UMBRA ROMÂNIEI - MMORPG Browser
## Instalare Completă

### 📦 Conținut Arhivă
- **Cod sursă complet** - `/app/src/`
- **Bază de date** - migrări și RLS
- **Edge functions** - API endpoints
- **Assets** - imagini, fișiere statice
- **Configurare** - package.json, vite.config

### 🚀 Instalare Rapidă

#### 1. Server Standard (Vercel/Netlify)
```bash
# Instalare dependențe
npm install

# Build producție
npm run build

# Deploy pe Vercel
vercel deploy

# Deploy pe Netlify
netlify deploy --prod
```

#### 2. Server Propriu
```bash
# Clone și instalare
git clone <repo>
cd umbra-romaniei
npm install
npm run build

# Start server
npm start
```

### 🗄️ Bază de Date

#### Configurare SQLite (Development)
```javascript
// Funcționează automat în Kliv platform
// Nu necesită configurare manuală
```

#### Migrare la PostgreSQL
```sql
-- Export schemă
sqlite3 umbra.db .schema > schema.sql

-- Import în PostgreSQL
psql -d umbra_db < schema.sql
```

### 🔐 Variabile de Mediu

```bash
# Kliv Platform (Automatic)
DATABASE_URL="auto"
AUTH_SECRET="auto"
PLATFORM_TOKEN="auto"

# Custom Server
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="your-secret-key"
```

### 🌐 URL-uri

**Development:**
- Local: `http://localhost:5173`
- Preview: `https://umbra-romanian-game.kliv.site`

**Production:**
- Custom: `https://domeniultau.com`

### 📮 Suport
- Email: rakanishuro@gmail.com
- Platform: Kliv.dev
- Versiune: 1.0.0

### ⚡ Performanțe
- **Build time:** ~45 secunde
- **Bundle size:** ~2.5MB
- **Load time:** <2 secunde
- **SEO:** Optimizat

### 🎮 Caracteristici
✅ 18 Sisteme complete
✅ Auth & Player management  
✅ Crime, PvP, Gangs
✅ Shop, Bank, Casino
✅ Politics & Elections
✅ Admin panel complet
✅ Responsive design
✅ Dark mode optimizat