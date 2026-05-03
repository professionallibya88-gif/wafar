# دليل النشر - Deployment Guide

## المتطلبات

### الخادم (Server)
- Ubuntu 20.04+ أو CentOS 8+
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Nginx (اختياري للـ reverse proxy)
- PM2 لإدارة العمليات

### قاعدة البيانات
- PostgreSQL 14+
- 2GB RAM على الأقل
- 20GB مساحة تخزين

## خطوات النشر

### 1. إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت Python
sudo apt install -y python3 python3-pip python3-venv

# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# تثبيت Nginx
sudo apt install -y nginx

# تثبيت PM2
sudo npm install -g pm2
```

### 2. إعداد قاعدة البيانات

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء قاعدة البيانات
CREATE DATABASE libya_spare_parts;
CREATE USER waffer WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE libya_spare_parts TO waffer;
\q
```

### 3. نشر الكود

```bash
# استنساخ المشروع
git clone <repository-url> /var/www/waffer
cd /var/www/waffer

# تثبيت التبعيات
npm run install:all

# تثبيت تبعيات Python
cd apps/backend/python-service
pip install -r requirements.txt
cd ../..
```

### 4. إعداد ملف البيئة

```bash
cd apps/backend
cp .env.example .env
nano .env
```

عدّل الإعدادات:
```env
NODE_ENV=production
PORT=5050
DB_HOST=localhost
DB_PORT=5432
DB_NAME=libya_spare_parts
DB_USER=waffer
DB_PASSWORD=strong_password_here
JWT_SECRET=change-this-to-a-very-strong-secret
PYTHON_SERVICE_URL=http://localhost:5051
PYTHON_SERVICE_PORT=5051
```

### 5. بناء التطبيقات

```bash
cd /var/www/waffer
npm run build
```

### 6. إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/waffer
```

أضف التالي:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/waffer/apps/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

تفعيل الموقع:

```bash
sudo ln -s /etc/nginx/sites-available/waffer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. إعداد PM2

```bash
cd /var/www/waffer

# إنشاء ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'waffer-backend',
      script: 'apps/backend/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5050
      }
    },
    {
      name: 'waffer-python',
      script: 'apps/backend/python-service/app.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PYTHON_SERVICE_PORT: 5051
      }
    }
  ]
};
EOF

# تشغيل التطبيقات
npm run build
pm2 start ecosystem.config.js

# حفظ التكوين
pm2 save

# تشغيل عند إعادة التشغيل
pm2 startup
```

### 8. إعداد SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

### 9. إعداد النسخ الاحتياطي

```bash
# إنشاء script للنسخ الاحتياطي
cat > /var/www/waffer/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/waffer
mkdir -p \$BACKUP_DIR

# نسخ قاعدة البيانات
pg_dump -U waffer libya_spare_parts > \$BACKUP_DIR/db_\$DATE.sql

# نسخ الملفات المرفوعة
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz /var/www/waffer/apps/backend/uploads

# حذف النسخ القديمة (أكثر من 7 أيام)
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /var/www/waffer/backup.sh

# إضافة إلى cron
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/waffer/backup.sh") | crontab -
```

### 10. المراقبة (Monitoring)

```bash
# تثبيت مكونات المراقبة
npm install -g pm2-logrotate

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## الأمان

### 1. إعداد Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. تأمين PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

غيّر الإعدادات لاستخدام md5:

```
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

إعادة تشغيل PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. تغيير JWT Secret

تأكد من استخدام JWT secret قوي في ملف .env:

```bash
# إنشاء secret عشوائي
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## الصيانة

### تحديث المشروع

```bash
cd /var/www/waffer
git pull origin main
npm run install:all
cd apps/frontend && npm run build && cd ../..
pm2 restart all
```

### عرض السجلات

```bash
# سجلات Backend
pm2 logs waffer-backend

# سجلات Python Service
pm2 logs waffer-python

# سجلات Nginx
sudo tail -f /var/log/nginx/error.log
```

### إعادة تشغيل الخدمات

```bash
pm2 restart waffer-backend
pm2 restart waffer-python
sudo systemctl restart nginx
```

## استكشاف الأخطاء

### المشاكل الشائعة

1. **Backend لا يعمل**
   ```bash
   pm2 logs waffer-backend
   # تحقق من اتصال قاعدة البيانات
   # تحقق من ملف .env
   ```

2. **Python Service لا يعمل**
   ```bash
   pm2 logs waffer-python
   # تحقق من تبعيات Python
   # تحقق من المنفذ 5051
   ```

3. **قاعدة البيانات لا تتصل**
   ```bash
   sudo -u postgres psql -d libya_spare_parts
   # تحقق من صلاحيات المستخدم
   # تحقق من إعدادات pg_hba.conf
   ```

4. **Nginx 502 Bad Gateway**
   ```bash
   # تحقق من أن Backend يعمل
   pm2 status
   # تحقق من إعدادات proxy في Nginx
   sudo nginx -t
   ```

## الموارد

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
