# 🎮 UMBRA ROMÂNIEI - MMORPG Browser

## Descriere
Un MMORPG noir browser complet funcțional, set în România coruptă. Jucătorii pot comite crime, forma găști, participa în lupte PvP, candida politic, și multe altele.

## ✨ Caracteristici

### Sisteme de Joc (18 tab-uri complete)
- 🔫 **Crime System** - 10 tipuri de crime cu heat mechanic
- ⚔️ **PvP System** - Lupte între jucători cu bounties
- 🤝 **Gang System** - Creează găști, cucerește teritorii
- 🏪 **Shop System** - 17 item-uri diverse
- 🏦 **Bank System** - Economie cu dobândă 1%
- 🎰 **Casino** - 3 jocuri de noroc
- 📋 **Missions** - 9 misiuni progresive
- 🏆 **Achievements** - 8 realizări deblocabile
- 🏛️ **Politics** - Alegeri prezidențiale și legi
- 🏠 **Properties** - 12 proprietăți diferite
- 🎯 **PvE Bosses** - 3 boss-uri PvE cu loot
- ⚔️ **Gang Warfare** - Războaie pentru teritorii
- 📢 **Politics Advanced** - Taxe și corupție
- 🚔 **Police Raids** - Sistem polițienesc
- 🌍 **World Events** - Evenimente globale
- 💎 **Premium Shop** - Micro-tranzacții
- 🎫 **Support System** - Tichete și bug-uri
- 🔐 **Admin Panel** - Control complet server

### Tehnologii
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + Radix UI
- **Database:** SQLite/PostgreSQL cu RLS
- **Auth:** Custom JWT cu email verification
- **Platform:** Kliv.dev edge functions

## 🚀 Instalare Rapidă

### Opțiunea 1: Platformă Găzduită (Recomandat)
```bash
# 1. Download arhivă
wget umbra-romaniei-complete.tar.gz

# 2. Extrage
tar -xzf umbra-romaniei-complete.tar.gz
cd umbra-romaniei

# 3. Install dependențe
npm install

# 4. Build
npm run build

# 5. Deploy pe Vercel
vercel deploy
```

### Opțiunea 2: Server Propriu
```bash
# 1. Clone repository
git clone <repository-url>
cd umbra-romaniei

# 2. Install
./install.sh

# 3. Configurare database
cp .env.example .env
# Edit .env cu credențialele tale

# 4. Start
npm start
```

## 📖 Documentație

- **INSTALLARE.md** - Ghid detaliat instalare
- **TEHNIC.md** - Documentație tehnică completă
- **DEPLOY.md** - Ghid deployment pe platforme

## 🎮 Cum Se Joacă

1. **Înregistrează-te** - Click "Înregistrare"
2. **Începe crimele** - Tab "Crime" pentru activități ilegale
3. **Formează o gască** - Tab "Gangs" pentru organizare
4. **Luptă PvP** - Tab "PvP" pentru atacuri
5. **Avansează** - Level up, deblochează itemi, cumpără proprietăți

## 🔧 Configurare

### Variabile de Mediu
```bash
DATABASE_URL="sqlite:///umbra.db"  # Sau PostgreSQL
AUTH_SECRET="secret-256-bit-key"
PLATFORM_TOKEN="kliv-platform-token"
```

### Bază de Date
- **Development:** SQLite local (automat)
- **Production:** PostgreSQL recomandat

## 📊 Statistici Inițiale

- **10,000+** Jucători posibili
- **50+** Crime disponibile
- **6** Orașe majore
- **18** Sisteme de joc
- **∞** Posibilități

## 🆘 Suport

- **Email:** rakanishuro@gmail.com
- **Platform:** Kliv.dev
- **Versiune:** 1.0.0
- **Status:** Production Ready

## 📜 Licență

© 2026 Umbra României. Toate drepturile rezervate.

---

**NOTĂ:** Acesta este versiunea completă funcțională. Include toate sistemele de joc, baza de date, și interfața admin completă. Gata pentru deployment imediat!

**Enjoy the game!** 🎮✨
