# Umbra România - Standalone Setup (fără Kliv)

## 1) Instalare
```bash
npm install
```

## 2) Rulează backend-ul
```bash
npm run server
```

## 3) Rulează frontend-ul (alt terminal)
```bash
npm run dev
```

## 4) Login admin demo
- email: `admin@umbra.local`
- parola: `Admin12345!`

## 5) Build producție
```bash
npm run build
NODE_ENV=production npm run server
```

## Ce include acum
- `server.js` backend Node + Express
- `database.sqlite` se creează automat
- auth real (signup/signin/signout/getUser)
- CRUD real pentru toate tabelele de joc prin `/api/v2/database/:table`
- persistență reală în SQLite
