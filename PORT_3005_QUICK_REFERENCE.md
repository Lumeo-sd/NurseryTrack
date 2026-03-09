# 🚀 Port 3005 Quick Reference Guide

**Last Updated:** March 2026  
**Status:** ✅ Active  
**API Version:** 1.0.0

---

## 📍 Quick Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **API Health** | `http://localhost:3005/api/health` | — |
| **MinIO Console** | `http://localhost:9001` | minioadmin / minioadmin |
| **pgAdmin** | `http://localhost:5050` | admin@nurserytrack.local / admin |
| **PostgreSQL** | `localhost:5432` | nurserytrack / nurserytrack_secure_password |
| **Redis** | `localhost:6379` | — |

---

## 🎯 Essential Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
```

### Check Status
```bash
docker-compose ps
```

### Run Database Migrations
```bash
docker-compose exec api npm run migrate
```

### Create Admin User
```bash
docker-compose exec api node -e "
const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await pool.query(
    'INSERT INTO users (id, email, password_hash, name, role) VALUES (\$1, \$2, \$3, \$4, \$5)',
    [uuidv4(), 'admin@test.local', hashedPassword, 'Admin', 'admin']
  );
  console.log('✓ Admin created: admin@test.local / admin123');
  process.exit(0);
})();
"
```

---

## 🔌 API Endpoints

### Authentication
```bash
# Register
POST http://localhost:3005/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Login
POST http://localhost:3005/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Get Current User
GET http://localhost:3005/api/auth/me
Authorization: Bearer {token}
```

### Batches
```bash
# Get All Batches
GET http://localhost:3005/api/batches
Authorization: Bearer {token}

# Get Batch by ID
GET http://localhost:3005/api/batches/{id}
Authorization: Bearer {token}

# Create Batch
POST http://localhost:3005/api/batches
Authorization: Bearer {token}
Content-Type: application/json

{
  "variety_id": "{uuid}",
  "quantity": 50,
  "status": "rooting",
  "location": "Greenhouse A"
}

# Update Batch
PUT http://localhost:3005/api/batches/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 45,
  "status": "growing"
}

# Delete Batch (Admin)
DELETE http://localhost:3005/api/batches/{id}
Authorization: Bearer {admin_token}
```

### Varieties
```bash
# Get All Varieties
GET http://localhost:3005/api/varieties
Authorization: Bearer {token}

# Create Variety (Admin)
POST http://localhost:3005/api/varieties
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Tomato",
  "latin_name": "Solanum lycopersicum"
}

# Update Variety
PUT http://localhost:3005/api/varieties/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cherry Tomato"
}
```

### File Upload
```bash
# Upload Batch Photo
POST http://localhost:3005/api/upload/batch/{batchId}
Authorization: Bearer {token}
Content-Type: multipart/form-data

[Form Data: photo file]

# Delete Photo
DELETE http://localhost:3005/api/upload/{photoId}
Authorization: Bearer {token}
```

### Action Logs
```bash
# Get Batch Logs
GET http://localhost:3005/api/action-logs/batch/{batchId}
Authorization: Bearer {token}

# Get User Logs
GET http://localhost:3005/api/action-logs/user
Authorization: Bearer {token}

# Get Statistics
GET http://localhost:3005/api/action-logs/stats?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer {token}
```

---

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`)**
```env
# Server
PORT=3005
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=nurserytrack
DB_USER=nurserytrack
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=7d

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=nursery-photos
MINIO_USE_SSL=false

# CORS
CORS_ORIGIN=http://localhost:19000
```

**Frontend (`.env`)**
```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_STORAGE_URL=http://localhost:9000
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_QR_SCANNER=true
REACT_APP_DEBUG=false
```

---

## 🐳 Docker Cheat Sheet

### Container Management
```bash
# View all containers
docker-compose ps

# Enter container shell
docker-compose exec api sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U nurserytrack -d nurserytrack

# Backup database
docker-compose exec postgres pg_dump -U nurserytrack nurserytrack > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nurserytrack nurserytrack < backup.sql
```

### MinIO Operations
```bash
# Access MinIO console
# Open: http://localhost:9001
# Login: minioadmin / minioadmin

# Create bucket via API
curl http://localhost:9000/nursery-photos
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3005/api/health
# Expected: {"status":"OK","timestamp":"2026-03-XX..."}
```

### Test Login
```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nurserytrack.local",
    "password": "admin123"
  }'
```

### Test with Auth Token
```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3005/api/batches \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### API Won't Start
```bash
# Check if port 3005 is in use
lsof -i :3005          # macOS/Linux
netstat -ano | findstr :3005  # Windows

# View API logs
docker-compose logs api

# Restart API
docker-compose restart api
```

### Database Connection Error
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U nurserytrack -d nurserytrack -c "SELECT 1;"

# Reinitialize database
docker-compose down -v  # ⚠️ Removes all data!
docker-compose up -d
docker-compose exec api npm run migrate
```

### MinIO Access Issues
```bash
# Check MinIO status
docker-compose ps minio

# View MinIO logs
docker-compose logs minio

# Check S3 connectivity
curl http://localhost:9000/minio/health/live
```

### Mobile App Can't Connect
```bash
# Verify API is running
curl http://localhost:3005/api/health

# Check .env configuration
cat .env | grep REACT_APP_API_URL

# Ensure correct URL in .env:
# REACT_APP_API_URL=http://localhost:3005/api
```

---

## 📊 Database Schema Quick Reference

### Users Table
```sql
SELECT * FROM users;
```

### Batches Table
```sql
SELECT * FROM batches;
SELECT * FROM batches WHERE status = 'rooting';
SELECT * FROM batches WHERE variety_id = 'uuid';
```

### Varieties Table
```sql
SELECT * FROM varieties;
```

### Action Logs
```sql
SELECT * FROM action_logs WHERE batch_id = 'uuid';
SELECT * FROM action_logs WHERE user_id = 'uuid';
```

### Photos
```sql
SELECT * FROM photos WHERE batch_id = 'uuid';
```

---

## 🔐 Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Use strong JWT_SECRET in production
- ⚠️ Change default MinIO credentials
- ⚠️ Enable HTTPS in production (Let's Encrypt)
- ⚠️ Keep backups of PostgreSQL data
- ⚠️ Regularly update Docker images

---

## 📈 Performance Tips

1. **Database**: Use indexes on frequently queried columns ✓
2. **Caching**: Redis is available for session storage
3. **API**: Gzip compression is enabled
4. **Storage**: MinIO supports S3 lifecycle policies
5. **Monitoring**: Use health check endpoints

---

## 🚀 Production Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Monitor CPU/Memory usage
- [ ] Set up error tracking (Sentry)
- [ ] Configure email notifications
- [ ] Test disaster recovery

---

## 📞 Getting Help

1. **Check Documentation**: See `README.md` and `DEPLOYMENT.md`
2. **Check Logs**: `docker-compose logs -f [service]`
3. **Read Migration Report**: `PORT_MIGRATION_REPORT.md`
4. **GitHub Issues**: Report bugs on GitHub
5. **Community**: Ask on GitHub Discussions

---

## 🎯 Common Tasks

### Change API Port
```bash
# Use environment variable
API_PORT=3010 docker-compose up -d

# Or update .env:
API_PORT=3010
docker-compose up -d
```

### Backup Everything
```bash
# Backup database
docker-compose exec postgres pg_dump -U nurserytrack nurserytrack > db_backup_$(date +%Y%m%d).sql

# Backup MinIO data
docker cp nurserytrack-minio:/data ./minio_backup_$(date +%Y%m%d)
```

### Reset Everything
```bash
# ⚠️ WARNING: This removes ALL data!
docker-compose down -v
docker-compose up -d
docker-compose exec api npm run migrate
```

### Update Configuration
```bash
# Edit .env
nano .env

# Restart services
docker-compose restart api
```

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview & quick start |
| `DEPLOYMENT.md` | Production deployment guide |
| `MIGRATION.md` | Firebase to self-hosted migration |
| `PROJECT_STATUS.md` | Implementation status |
| `PORT_MIGRATION_REPORT.md` | Port 3000→3005 migration details |
| `CONTRIBUTING.md` | Contributing guidelines |

---

## ✨ Tips & Tricks

### Quick Development Server Startup
```bash
bash QUICKSTART.sh
```

### Monitor All Services Real-Time
```bash
docker-compose logs -f
```

### Access Database GUI
```
http://localhost:5050
Email: admin@nurserytrack.local
Password: admin
```

### View MinIO Files
```
http://localhost:9001
Username: minioadmin
Password: minioadmin
```

---

## 🎉 You're All Set!

Your NurseryTrack instance is running on **port 3005** and ready to use.

**Next Steps:**
1. Test API: `curl http://localhost:3005/api/health`
2. Access MinIO: `http://localhost:9001`
3. Create admin user: See "Create Admin User" command above
4. Connect mobile app: Update API URL in .env
5. Start building! 🚀

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**License:** MIT  
🌱 **NurseryTrack - Open Source Nursery Management System**