# 🌱 NurseryTrack Self-Hosted Deployment Guide

## Overview

This guide will help you deploy NurseryTrack as a complete self-hosted open-source solution using Docker and PostgreSQL instead of Firebase.

## Architecture

```
┌─────────────────────────────────────────┐
│   React Native Mobile App               │
│   (Expo / iOS / Android)                │
└─────────────┬───────────────────────────┘
              │ HTTP/REST API
              ▼
┌─────────────────────────────────────────┐
│   Node.js Backend (Express)             │
│   Port: 3000                            │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┬──────────┐
    ▼         ▼         ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│PostgreSQL│ │MinIO  │ │Redis   │ │Nginx   │
│Database  │ │Storage│ │Cache   │ │Proxy   │
└────────┘ └────────┘ └────────┘ └────────┘
```

## Prerequisites

- **Server**: VPS with at least 2GB RAM (Hetzner, DigitalOcean, AWS, Linode, etc.)
- **OS**: Ubuntu 20.04+ or Debian 11+
- **Docker**: Docker and Docker Compose installed
- **Domain**: Optional but recommended (for HTTPS)
- **Email**: Optional (for notifications)

## Step 1: Server Setup

### 1.1 SSH into your server

```bash
ssh root@your_server_ip
```

### 1.2 Update system packages

```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install Git and clone the repository

```bash
apt install git -y
cd /opt
git clone https://github.com/your-username/NurseryTrack.git
cd NurseryTrack
```

## Step 2: Configure Environment

### 2.1 Create .env file from example

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2.2 Edit .env with production values

```bash
nano .env
```

Update the following variables:

```env
# Production Database Credentials
DB_USER=nurserytrack_prod
DB_PASSWORD=your_very_secure_password_here_at_least_32_chars_long
DB_NAME=nurserytrack

# Generate JWT Secret (use this command)
# openssl rand -base64 32
JWT_SECRET=your_generated_jwt_secret_here

# MinIO Credentials
MINIO_ACCESS_KEY=nursery_access_key_here
MINIO_SECRET_KEY=your_minio_secret_key_at_least_32_chars

# Node Environment
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com

# API Port
API_PORT=3000

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
```

### 2.3 Edit backend/.env

```bash
nano backend/.env
```

Update it with the same credentials as .env

## Step 3: Set up SSL Certificate (HTTPS)

### 3.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 3.2 Request SSL Certificate

```bash
# Replace your-domain.com with your actual domain
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

This will create certificates in `/etc/letsencrypt/live/your-domain.com/`

### 3.3 Copy certificates to project

```bash
mkdir -p /opt/NurseryTrack/certs
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/NurseryTrack/certs/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/NurseryTrack/certs/
sudo chown -R $USER:$USER /opt/NurseryTrack/certs
```

### 3.4 Auto-renew SSL certificates

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Step 4: Create Nginx Configuration

Create `/opt/NurseryTrack/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # API Server
    upstream api {
        server api:3000;
    }

    # MinIO Server
    upstream minio {
        server minio:9000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API Proxy
        location /api/ {
            proxy_pass http://api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }

        # MinIO Proxy (optional)
        location /minio/ {
            proxy_pass http://minio/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Root location
        location / {
            return 200 "NurseryTrack API Server";
            add_header Content-Type text/plain;
        }
    }
}
```

## Step 5: Start Services with Docker Compose

### 5.1 Create necessary directories

```bash
mkdir -p postgres_data minio_data redis_data
```

### 5.2 Start all services

```bash
cd /opt/NurseryTrack
docker-compose up -d
```

### 5.3 Check service status

```bash
docker-compose ps

# Expected output:
# NAME                    STATUS
# nurserytrack-postgres   Up (healthy)
# nurserytrack-redis      Up (healthy)
# nurserytrack-minio      Up (healthy)
# nurserytrack-api        Up (healthy)
# nurserytrack-pgadmin    Up
# nurserytrack-nginx      Up
```

### 5.4 View logs

```bash
docker-compose logs -f api
docker-compose logs -f postgres
```

## Step 6: Database Migration

### 6.1 Run database migrations

```bash
docker-compose exec api npm run migrate
```

### 6.2 Verify database

```bash
# Enter PostgreSQL container
docker-compose exec postgres psql -U nurserytrack -d nurserytrack

# List tables
\dt

# Exit
\q
```

## Step 7: Create Admin User

### 7.1 Enter API container

```bash
docker-compose exec api node
```

### 7.2 Run this code in Node REPL

```javascript
const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
  const adminId = uuidv4();
  const email = 'admin@nurserytrack.local';
  const password = 'change_me_in_production'; // Change this!
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
    [adminId, email, hashedPassword, 'Admin', 'admin']
  );

  console.log('Admin user created!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('IMPORTANT: Change password after first login!');
}

createAdmin();
```

Type `.exit` to exit Node REPL.

## Step 8: Access Your Services

### 8.1 API Server
```
https://your-domain.com/api/health
```

### 8.2 MinIO Console (Storage Management)
```
http://your-domain.com:9001
Access Key: your-minio-access-key
Secret Key: your-minio-secret-key
```

### 8.3 pgAdmin (Database Management) - Development Only
```
http://your-domain.com:5050
Email: admin@nurserytrack.local
Password: admin
```

## Step 9: Configure Mobile App

### 9.1 Update app environment

In your React Native app, create `.env` or update configuration:

```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_STORAGE_URL=https://your-domain.com/minio
```

### 9.2 Build and deploy

```bash
# For Android
expo build:android

# For iOS
expo build:ios

# Or use EAS Build
eas build --platform android
eas build --platform ios
```

## Step 10: Backup Strategy

### 10.1 Automated daily backup

Create `/opt/NurseryTrack/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/NurseryTrack/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"
MINIO_BACKUP="$BACKUP_DIR/minio_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U nurserytrack nurserytrack > $DB_BACKUP
gzip $DB_BACKUP

# Backup MinIO data
tar -czf $MINIO_BACKUP minio_data/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed at $DATE"
```

### 10.2 Add to crontab

```bash
chmod +x /opt/NurseryTrack/backup.sh

# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * cd /opt/NurseryTrack && ./backup.sh >> /var/log/nurserytrack-backup.log 2>&1
```

## Step 11: Monitoring and Maintenance

### 11.1 Check container health

```bash
docker-compose ps
```

### 11.2 View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
```

### 11.3 Restart services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### 11.4 Update services

```bash
# Pull latest code
cd /opt/NurseryTrack
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Step 12: Firewall Configuration

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow Docker ports (internal only)
ufw allow from 172.17.0.0/16 to any port 5432
ufw allow from 172.17.0.0/16 to any port 9000
ufw allow from 172.17.0.0/16 to any port 6379

# Enable firewall
ufw enable
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database connection error

```bash
# Check if postgres is running
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres

# Check credentials in .env
grep DB_ .env
```

### MinIO bucket permission error

```bash
# Check MinIO logs
docker-compose logs minio

# Restart MinIO
docker-compose restart minio
```

### SSL certificate issues

```bash
# Renew certificates
sudo certbot renew --dry-run

# Check certificate expiration
openssl x509 -noout -dates -in /etc/letsencrypt/live/your-domain.com/fullchain.pem
```

## Performance Optimization

### 1. Database Indexing

```sql
-- Already included in migrations, but verify:
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

### 2. Redis Caching

Redis is included in docker-compose. To use it:

```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache API responses
app.use((req, res, next) => {
  const cacheKey = `${req.method}:${req.path}`;
  client.get(cacheKey, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    next();
  });
});
```

### 3. Database Connection Pooling

Configured in `backend/src/db/connection.js` with max 20 connections.

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall
- [ ] Configure SSL/HTTPS
- [ ] Set up regular backups
- [ ] Enable JWT secret in .env
- [ ] Disable pgAdmin in production (use `docker-compose --profile dev`)
- [ ] Implement rate limiting on API
- [ ] Enable CORS restrictions
- [ ] Monitor server resources
- [ ] Keep Docker images updated
- [ ] Use strong database passwords
- [ ] Configure automated certificate renewal

## Support & Contributing

For issues and questions:
- GitHub Issues: https://github.com/your-username/NurseryTrack/issues
- Email: support@nurserytrack.local
- Documentation: https://nurserytrack.gitbook.io

## License

MIT License - See LICENSE file for details

## Credits

NurseryTrack Contributors & Community