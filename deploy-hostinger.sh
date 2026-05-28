#!/bin/bash

# 🎮 UMBRA ROMÂNIEI - Script Deploy Hostinger VPS
# Pentru Ubuntu/Debian pe Hostinger

set -e

echo "🎮 DEPLOY UMBRA ROMÂNIEI PE HOSTINGER VPS"
echo "===================================="

# 1. Update system
echo "📦 Actualizare system..."
apt update && apt upgrade -y

# 2. Instalare Node.js 18
echo "📦 Instalare Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js deja instalat: $(node --version)"
fi

# 3. Instalare PM2
echo "📦 Instalare PM2..."
npm install -g pm2

# 4. Instalare Nginx
echo "📦 Instalare Nginx..."
apt install -y nginx

# 5. Creare directory pentru joc
echo "📁 Creare director joc..."
mkdir -p /var/www/umbra
cd /var/www/umbra

# 6. Copiere fișiere locale (dacă ești în docker/local)
echo "📋 Copiere fișiere joc..."
# Aici ar trebui să copiem fișierele din locația curentă
# Momentan doar creăm structura

# 7. Configurare Nginx
echo "⚙️ Configurare Nginx..."
cat > /etc/nginx/sites-available/umbra << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/umbra/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 8. Activează site
ln -sf /etc/nginx/sites-available/umbra /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 9 Restart Nginx
echo "🔄 Restart Nginx..."
nginx -t || echo "⚠️  Nginx config are erori, verifică manual"
systemctl restart nginx

echo ""
echo "✅ Deploy finalizat!"
echo "🌐 Site accesibil la: http://$(hostname -I | awk '{print $1}')"
echo "📋 Următor: /var/www/umbra"
echo ""
echo "⚠️ IMPORTANT:"
echo "1. Trebuie să uploadezi fișierele jocului în /var/www/umbra"
echo "2. Sau clone din Git repository"
echo "3. Sau descarcă arhiva .tar.gz și extrage-o"
echo ""
echo "📖 Vezi README-FINAL.md pentru detalii complete"