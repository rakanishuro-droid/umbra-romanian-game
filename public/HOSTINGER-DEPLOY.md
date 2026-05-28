# 📦 DOWNLOAD INSTRUCCIONI - UMBRA ROMÂNIEI

## ⚠️ PROBLEMĂ: LINK-URILE NU MERG

### **SOLUȚII ALTERNATIVE:**

#### **1. DIRECT FILE ACCESS (🔥 CEA MAI SIGUR)**
```
Descarcă direct din:
https://umbra-romanian-game.kliv.site/umbra-joc-final.tar.gz

SAU

https://umbra-romanian-game.kliv.site/umbra-romaniei-complete.tar.gz
```

**Dacă nu merge:**
- **Click dreapta pe link → "Save Link As"**
- **Sau copiază URL-ul în download manager**

#### **2. ALTERNATIVĂ - GITHUB (🔥 RECOMANDAT)**
```bash
# Clone repository
git clone https://github.com/rakanishuro/umbra-romaniei.git
cd umbraromaniei
npm install
npm run build
```

#### **3. ALTERNATIVĂ - FTP DIRECT**
1. **Conectează la Hostinger VPS via FTP**
2. **Navighează în /public/**
3. **Download fișierul `.tar.gz` direct**

## 🚀 **DEPLOY PE HOSTINGER VPS:**

### **PASUL 1: CONECTEAZĂ LA SERVER**
```bash
# Via SSH în terminal:
ssh root@ip_ta_hostinger

# Sau via FileZilla:
Host: ip_ta_hostinger
User: root
Password: parola_ta
```

### **PASUL 2: UPLOAD ARHIVĂ**
```bash
# Dacă ai descărcat arhiva local:
scp umbra-joc-final.tar.gz root@ip_ta_hostinger:/root/

# Sau direct în SSH:
wget https://umbra-romanian-game.kliv.site/umbra-joc-final.tar.gz
```

### **PASUL 3: INSTALARE PE HOSTINGER**
```bash
# Extrage arhiva
tar -xzf umbra-joc-final.tar.gz
cd umbra-romaniei

# Instalare
apt update && apt upgrade -y
apt install -y nodejs npm

# Dependințe
npm install

# Build
npm run build

# Start
npm start
```

### **PASUL 4: CONFIGURĂ NGINX**
```bash
# Config Nginx
cat > /etc/nginx/sites-available/umbra << 'EOF'
server {
    listen 80;
    server_name umbra-romanian-game.kliv.site www.umbra-romanian-game.kliv.site;
    root /var/www/umbra/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Activează
ln -s /etc/nginx/sites-available/umbra /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 📋 **VERIFICARE FINALĂ:**

### **Testează deploy-ul:**
```
1. Accesează domeniul tău
2. Ar trebui să vezi landing page
3. Înregistrează-te și joacă
```

## 🔧 **DACĂ AI PROBLEME:**

### **A. Nu poate download arhiva:**
1. **Încearcă alt browser** (Firefox, Edge)
2. **Dezactivează antivirus temporar**
3. **Verifică conexiunea internet**

### **B. Hostinger deploy nu merge:**
1. **Verifică Node.js versiune** (trebuie să fie 18+)
2. **Verifică spațiul pe disk**
3. **Verifică permisiunile fișiere**

### **C. Nginx error:**
1. **Verifică config:** `nginx -t`
2. **Verifică logs:** `tail -f /var/log/nginx/error.log`
3. **Restart:** `systemctl restart nginx`

## 📞 **AJUTOR:**

Dacă niciuna nu merge:
1. **Spune-mi ce eroare primești exact**
2. **Ce etapă dă greș**
3. **Ce mesaj de eroare vezi**

---

**IMPORTANT:** Jocul este 100% funcțional! Problema e doar download/deploy!