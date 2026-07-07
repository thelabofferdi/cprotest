# 🚀 Guide de Déploiement VPS - C'PRO Backend V2

Guide complet pour déployer le backend C'PRO sur un VPS Ubuntu 22.04 LTS.

---

## 📋 Prérequis VPS

### Spécifications Minimales

- **OS**: Ubuntu 22.04 LTS
- **RAM**: 2 GB minimum (4 GB recommandé)
- **CPU**: 2 cores minimum
- **Disque**: 20 GB SSD
- **Réseau**: IPv4 publique
- **Fournisseurs recommandés**:
  - Contabo: ~5€/mois (VPS M)
  - Hetzner: ~6€/mois (CX21)
  - OVH: ~7€/mois (VPS Starter)
  - DigitalOcean: $12/mois (Basic Droplet)

---

## 🛠️ PARTIE 1 : Setup Initial du VPS

### 1.1 Connexion SSH

```bash
ssh root@VOTRE_IP_VPS
```

### 1.2 Mise à jour du système

```bash
apt update && apt upgrade -y
```

### 1.3 Créer utilisateur non-root

```bash
# Créer utilisateur cpro
adduser cpro

# Ajouter aux sudoers
usermod -aG sudo cpro

# Copier clé SSH (optionnel)
rsync --archive --chown=cpro:cpro ~/.ssh /home/cpro
```

### 1.4 Configurer le Firewall (UFW)

```bash
# Activer UFW
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Vérifier
ufw status
```

### 1.5 Configurer le Hostname

```bash
hostnamectl set-hostname cpro-api
echo "127.0.0.1 cpro-api" >> /etc/hosts
```

---

## 📦 PARTIE 2 : Installation des Dépendances

### 2.1 Installer Node.js 20

```bash
# Se connecter en tant que cpro
su - cpro

# Installer Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 2.2 Installer PostgreSQL 16

```bash
# Ajouter repo PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Vérifier
sudo systemctl status postgresql
```

### 2.3 Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer base de données et utilisateur
CREATE DATABASE cpro;
CREATE USER cpro WITH PASSWORD 'MOT_DE_PASSE_SECURISE_ICI';
GRANT ALL PRIVILEGES ON DATABASE cpro TO cpro;
\q

# Configurer l'authentification (autoriser connexions locales)
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Ajouter cette ligne AVANT les autres règles:
```
local   cpro            cpro                                    md5
```

Redémarrer PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 2.4 Installer Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.5 Installer PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 2.6 Installer Redis (optionnel - cache)

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2.7 Installer Git

```bash
sudo apt install -y git
```

---

## 📂 PARTIE 3 : Déploiement de l'Application

### 3.1 Cloner le Repository

```bash
cd /home/cpro
git clone https://github.com/VOTRE_ORG/cpro-backend.git backend-v2
cd backend-v2
```

### 3.2 Installer les Dépendances

```bash
npm install --production
```

### 3.3 Configurer les Variables d'Environnement

```bash
cp .env.example .env
nano .env
```

Éditer avec les valeurs production:

```env
# Database
DATABASE_URL="postgresql://cpro:MOT_DE_PASSE@localhost:5432/cpro?schema=public"

# JWT (GÉNÉRER DES CLÉS SÉCURISÉES)
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="production"
PORT=3000
API_PREFIX="api/v1"

# Email (Resend)
RESEND_API_KEY="re_votre_cle_resend"
FROM_EMAIL="C'PRO <noreply@cpro.app>"

# Storage (Cloudflare R2)
R2_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="votre_access_key"
R2_SECRET_ACCESS_KEY="votre_secret_key"
R2_BUCKET_NAME="cpro-documents"
R2_PUBLIC_URL="https://files.cpro.app"

# Firebase Cloud Messaging
FCM_PROJECT_ID="cpro-prod"
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL="firebase-adminsdk@cpro-prod.iam.gserviceaccount.com"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Sentry (monitoring)
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**IMPORTANT** : Générer des secrets JWT sécurisés:
```bash
openssl rand -hex 32
```

### 3.4 Générer Prisma Client

```bash
npm run prisma:generate
```

### 3.5 Exécuter les Migrations

```bash
npm run prisma:migrate deploy
```

### 3.6 Seed les Données de Configuration

```bash
npm run prisma:seed
```

### 3.7 Build l'Application

```bash
npm run build
```

### 3.8 Tester le Démarrage

```bash
npm run start:prod
```

Vérifier que l'API répond:
```bash
curl http://localhost:3000/api/v1/health
```

Arrêter (Ctrl+C).

---

## 🔄 PARTIE 4 : Configuration PM2

### 4.1 Créer le fichier PM2 Ecosystem

```bash
nano ecosystem.config.js
```

Contenu:
```javascript
module.exports = {
  apps: [{
    name: 'cpro-api',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/cpro/logs/cpro-api-error.log',
    out_file: '/home/cpro/logs/cpro-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

### 4.2 Créer dossier logs

```bash
mkdir -p /home/cpro/logs
```

### 4.3 Démarrer avec PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Copier et exécuter la commande générée par `pm2 startup`**

### 4.4 Commandes PM2 Utiles

```bash
# Voir les processus
pm2 list

# Logs en temps réel
pm2 logs cpro-api

# Restart
pm2 restart cpro-api

# Stop
pm2 stop cpro-api

# Reload sans downtime
pm2 reload cpro-api

# Monitoring
pm2 monit
```

---

## 🌐 PARTIE 5 : Configuration Nginx (Reverse Proxy)

### 5.1 Créer le fichier de configuration

```bash
sudo nano /etc/nginx/sites-available/cpro-api
```

Contenu:
```nginx
server {
    listen 80;
    server_name api.cpro.app;

    # Logs
    access_log /var/log/nginx/cpro-access.log;
    error_log /var/log/nginx/cpro-error.log;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=cpro_limit:10m rate=10r/s;
    limit_req zone=cpro_limit burst=20 nodelay;

    # Proxy vers Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (pas de rate limit)
    location /api/v1/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # Bloquer .env et fichiers sensibles
    location ~ /\. {
        deny all;
    }
}
```

### 5.2 Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/cpro-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 PARTIE 6 : Configuration SSL (Let's Encrypt)

### 6.1 Installer Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtenir le certificat SSL

**Prérequis**: Le domaine `api.cpro.app` doit pointer vers l'IP du VPS (DNS A record).

```bash
sudo certbot --nginx -d api.cpro.app
```

Suivre les instructions interactives.

### 6.3 Auto-renouvellement

Certbot configure automatiquement le renouvellement. Tester:

```bash
sudo certbot renew --dry-run
```

---

## 📊 PARTIE 7 : Monitoring & Maintenance

### 7.1 Monitoring avec Netdata (optionnel)

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Dashboard accessible sur `http://VOTRE_IP:19999`

### 7.2 Logs Système

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/cpro-error.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Logs PM2
pm2 logs cpro-api

# Logs système
journalctl -u nginx -f
```

### 7.3 Backup Base de Données

**Script de backup automatique**:

```bash
sudo nano /home/cpro/backup-db.sh
```

Contenu:
```bash
#!/bin/bash
BACKUP_DIR="/home/cpro/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cpro_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Dump PostgreSQL
pg_dump -U cpro -d cpro -F c -f $BACKUP_FILE

# Garder seulement 7 derniers backups
find $BACKUP_DIR -name "cpro_backup_*.sql" -mtime +7 -delete

echo "Backup créé: $BACKUP_FILE"
```

Rendre exécutable et ajouter au cron:
```bash
chmod +x /home/cpro/backup-db.sh

# Cron: tous les jours à 2h du matin
crontab -e
```

Ajouter:
```
0 2 * * * /home/cpro/backup-db.sh >> /home/cpro/logs/backup.log 2>&1
```

### 7.4 Mise à jour de l'Application

```bash
cd /home/cpro/backend-v2

# Pull latest code
git pull origin main

# Installer nouvelles dépendances
npm install --production

# Migrations database
npm run prisma:migrate deploy

# Rebuild
npm run build

# Reload PM2 (zero downtime)
pm2 reload cpro-api
```

---

## 🔧 PARTIE 8 : Optimisations

### 8.1 Compression Nginx

Ajouter dans `/etc/nginx/nginx.conf`:

```nginx
http {
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # ... reste de la config
}
```

### 8.2 PostgreSQL Tuning

Éditer `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Pour VPS 2GB RAM
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 4MB
max_connections = 100
```

Redémarrer:
```bash
sudo systemctl restart postgresql
```

### 8.3 Swap (si <4GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🚨 PARTIE 9 : Sécurité Avancée

### 9.1 Fail2Ban (protection brute-force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 9.2 Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 9.3 Changer le port SSH (optionnel)

```bash
sudo nano /etc/ssh/sshd_config
```

Changer `Port 22` vers `Port 2222` (ou autre).

Puis:
```bash
sudo ufw allow 2222/tcp
sudo systemctl restart sshd
```

---

## 📋 PARTIE 10 : Checklist de Mise en Production

- [ ] VPS provisionné et accessible
- [ ] Utilisateur non-root créé
- [ ] Firewall UFW configuré
- [ ] Node.js 20 installé
- [ ] PostgreSQL 16 installé et configuré
- [ ] Nginx installé
- [ ] PM2 installé globalement
- [ ] Code déployé depuis Git
- [ ] `.env` configuré avec secrets sécurisés
- [ ] Prisma migrations exécutées
- [ ] Seed données de config
- [ ] Application build
- [ ] PM2 ecosystem configuré
- [ ] PM2 startup activé
- [ ] Nginx reverse proxy configuré
- [ ] DNS A record pointé vers VPS IP
- [ ] SSL Let's Encrypt configuré
- [ ] Backup automatique configuré
- [ ] Monitoring (Netdata/Sentry) configuré
- [ ] Tests API endpoints
- [ ] Logs vérifiés

---

## 🆘 Troubleshooting

### API ne répond pas

```bash
# Vérifier PM2
pm2 list
pm2 logs cpro-api

# Vérifier port
netstat -tuln | grep 3000

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Erreur Database Connection

```bash
# Tester connexion PostgreSQL
psql -U cpro -d cpro -h localhost

# Vérifier pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### SSL ne fonctionne pas

```bash
# Vérifier certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Vérifier config Nginx
sudo nginx -t
```

---

## 📞 Support

Pour toute question:
- Email: dev@cpro.app
- Documentation: https://docs.cpro.app

---

**Guide préparé pour C'PRO Backend V2 - Déploiement VPS Production**
