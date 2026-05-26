#!/bin/bash

# UMBRA ROMÂNIEI - Script Instalare Rapidă
# Pentru Ubuntu/Debian servers

echo "🎮 Instalare UMBRA ROMÂNIEI MMORPG..."

# Verificări
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Rulează cu sudo!" 
  exit 1
fi

# Update system
apt update && apt upgrade -y

# Instalare Node.js și npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalare PostgreSQL
apt install -y postgresql postgresql-contrib

# Instalare Nginx
apt install -y nginx

# Instalare PM2
npm install -g pm2

# Download și extract game
cd /var/www
mkdir -p umbra
cd umbra

# Aici ar trebui să extragi arhiva
# tar -xzf umbra-romaniei-game.tar.gz

# Install dependențe
npm install

# Build producție
npm run build

# Configurare Nginx
cat > /etc/nginx/sites-available/umbra <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/umbra/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/umbra /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart Nginx
systemctl restart nginx

# Start application cu PM2
pm2 start npm --name "umbra" -- start
pm2 save
pm2 startup

echo "✅ Instalare completă!"
echo "🌐 Accesează serverul la: http://$(hostname -I | awk '{print $1}')"
echo "📚 Vezi INSTALLARE.md pentru detalii"