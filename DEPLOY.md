# UMBRA ROMÂNIEI - Deploy Guide

## 🚀 Deploy pe Platforme Populare

### 1. Vercel (Recomandat)

```bash
# Instalare Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy din rădăcină proiectului
cd /app/umbra-romaniei
vercel

# Deploy pe producție
vercel --prod
```

**Configurare Vercel:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "DATABASE_URL": "@database_url",
    "AUTH_SECRET": "@auth_secret"
  }
}
```

### 2. Netlify

```bash
# Instalare Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Configurare netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

```bash
# Clone repo
git clone <your-repo>
cd umbra-romaniei

# Install și build
npm install
npm run build

# Push la gh-pages
git subtree push --prefix dist origin gh-pages
```

### 4. Server VPS Propriu

```bash
# Pe server (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Clone și instalare
git clone <repo>
cd umbra-romaniei
npm install
npm run build

# Instalare PM2
npm i -g pm2

# Start server
pm2 start npm --name "umbra" -- start

# Setup proxy (Nginx)
sudo nano /etc/nginx/sites-available/umbra
```

**Config Nginx:**
```nginx
server {
    listen 80;
    server_name umbra.tau.com;
    root /var/www/umbra/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🗄️ Configurare Bază de Date

### PostgreSQL (Recomandat pentru Producție)

```bash
# Instalare PostgreSQL
sudo apt install postgresql postgresql-contrib

# Creare user și database
sudo -u postgres createuser umbra_user
sudo -u postgres createdb umbra_db -O umbra_user

# Conectare și migrare schema
psql -U umbra_user -d umbra_db < schema.sql

# Configurare connection string
export DATABASE_URL="postgresql://umbra_user:password@localhost:5432/umbra_db"
```

### SQLite (Development)

```bash
# Funcționează automat în Kliv
# Backup manual:
sqlite3 umbra.db .backup > backup.sql
```

## 🔐 Securitate în Producție

### SSL/TLS
```bash
# Certbot pentru Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d umbra.tau.com
```

### Environment Variables
```bash
# Folositi .env file în producție
echo "DATABASE_URL=postgresql://..." > .env
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Proteja .env
chmod 600 .env
```

### Firewall
```bash
# Allow doar porturi necesare
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 📊 Monitoring

### Uptime Monitoring
- **UptimeRobot** - uptime.robot
- **StatusCake** - statuscake.com
- **Pingdom** - pingdom.com

### Analytics
- **Plausible** - plausible.io (privacy-friendly)
- **Google Analytics** - analytics.google.com
- **Mixpanel** - mixpanel.com

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 💡 Tips Producție

### 1. Cache Headers
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 2. Gzip Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. Rate Limiting
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;
```

## 🚨 Troubleshooting

### Probleme Comune

**1. Build eșuează:**
```bash
# Curățațe cache
rm -rf node_modules dist
npm install
npm run build
```

**2. Database connection error:**
```bash
# Verifica DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**3. Auth tokens expiră:**
```bash
# Set AUTH_SECRET la nouă valoare
export AUTH_SECRET=$(openssl rand -base64 32)
```

## 📈 Scalabilitate

### Vertical Scaling
- 2 vCPU, 4GB RAM - până la 1000 jucători
- 4 vCPU, 8GB RAM - până la 5000 jucători

### Horizontal Scaling
- Load balancer (Nginx)
- Multiple server instances
- Database replication

### CDN
- Cloudflare (gratuit)
- AWS CloudFront
- Fastly CDN