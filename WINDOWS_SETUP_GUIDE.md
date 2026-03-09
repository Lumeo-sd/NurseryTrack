# 🪟 Windows Setup Guide for NurseryTrack

**Last Updated:** March 9, 2026  
**Platform:** Windows 10/11  
**Status:** ✅ Ready

---

## 📋 Quick Start (5 minutes)

### Step 1: Navigate to Project Directory
```powershell
cd "C:\Users\Admin\Documents\test\Nursery test\NurseryTrack"
```

### Step 2: Check Git Branch
```powershell
git status
```

You should see: `On branch localhost`

### Step 3: Start Docker Services
```powershell
docker-compose up -d
```

### Step 4: Test API
```powershell
curl http://localhost:3005/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"2026-03-09T..."}
```

---

## ✅ Prerequisites (Check Before Starting)

### Required Software
- [ ] **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
  - Required for Windows 10/11
  - Includes Docker & Docker Compose
  
- [ ] **Git for Windows** - [Download](https://git-scm.com/download/win)
  - For version control

- [ ] **Node.js** (Optional) - [Download](https://nodejs.org/)
  - Only if you want to run backend outside Docker
  - Recommended version: 18 LTS or higher

- [ ] **PowerShell** or **Command Prompt**
  - Already included in Windows

### System Requirements
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** 5GB free space
- **Port 3005:** Must be available (check instructions below)

### Check If Ports Are Available

```powershell
# Check if port 3005 is in use
netstat -ano | findstr :3005

# If nothing shows up, port is free ✅
# If something shows up, you need to close that application

# Check other ports
netstat -ano | findstr :5432    # PostgreSQL
netstat -ano | findstr :9000    # MinIO
netstat -ano | findstr :9001    # MinIO Console
```

---

## 🚀 Full Setup Instructions

### 1. Clone/Update Repository

```powershell
# Navigate to test directory
cd "C:\Users\Admin\Documents\test\Nursery test"

# If you haven't cloned yet:
git clone https://github.com/Lumeo-sd/NurseryTrack.git
cd NurseryTrack

# If you already have it, update it:
cd NurseryTrack
git pull origin localhost
git checkout localhost
```

### 2. Verify Files Exist

```powershell
# Check that migration files are there
ls PORT_*.md
ls docker-compose.yml
ls .env.example
```

You should see:
```
PORT_3005_QUICK_REFERENCE.md
PORT_MIGRATION_INDEX.md
PORT_MIGRATION_REPORT.md
PORT_MIGRATION_SUMMARY.txt
docker-compose.yml
.env.example
```

### 3. Setup Environment Files

```powershell
# Copy environment files
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env

# Edit .env (optional - for custom settings)
notepad .env
```

Leave defaults if you don't need custom settings.

### 4. Start Docker Services

```powershell
# Start all services in background
docker-compose up -d

# Wait 30 seconds for services to start
Start-Sleep -Seconds 30

# Check status
docker-compose ps
```

You should see all services as "Up":
```
NAME                 STATUS
nurserytrack-postgres   Up
nurserytrack-minio      Up
nurserytrack-redis      Up
nurserytrack-api        Up (healthy)
nurserytrack-pgadmin    Up
```

### 5. Initialize Database

```powershell
# Run migrations
docker-compose exec api npm run migrate

# You should see: ✓ Database initialized
```

### 6. Create Admin User (Optional)

```powershell
# Create admin user
docker-compose exec api node -e "
const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await pool.query(
    'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
    [uuidv4(), 'admin@nurserytrack.local', hashedPassword, 'Admin', 'admin']
  );
  console.log('✓ Admin created: admin@nurserytrack.local / admin123');
  process.exit(0);
})();
"
```

### 7. Test API

```powershell
# Test health endpoint
curl http://localhost:3005/api/health

# Test login
curl -X POST http://localhost:3005/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@nurserytrack.local",
    "password": "admin123"
  }'
```

---

## 🌐 Access Services

Once everything is running, access:

| Service | URL | Login |
|---------|-----|-------|
| **API Health** | http://localhost:3005/api/health | N/A |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
| **pgAdmin** | http://localhost:5050 | admin@nurserytrack.local / admin |
| **PostgreSQL** | localhost:5432 | nurserytrack / nurserytrack_secure_password |

---

## 📖 Documentation

### For Getting Started
👉 **Read:** `PORT_MIGRATION_INDEX.md`
- Navigation to all documents
- Which file to read for your needs

### For Quick Commands
👉 **Read:** `PORT_3005_QUICK_REFERENCE.md`
- Essential Docker commands
- API endpoint examples
- Troubleshooting tips

### For Technical Details
👉 **Read:** `PORT_MIGRATION_REPORT.md`
- Complete migration information
- File changes
- Production checklist

### For Project Overview
👉 **Read:** `README.md`
- Project features
- Architecture overview
- API documentation

---

## 🔧 Useful PowerShell Commands

### Docker Management

```powershell
# View all running containers
docker-compose ps

# View logs for API service
docker-compose logs -f api

# View logs for all services
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: removes all data!)
docker-compose down -v

# Restart a service
docker-compose restart api

# Enter a container shell
docker-compose exec api sh

# View container resource usage
docker stats
```

### Database Access

```powershell
# Access PostgreSQL directly
docker-compose exec postgres psql -U nurserytrack -d nurserytrack

# Common PostgreSQL commands:
# \dt                   - List all tables
# SELECT * FROM users;  - List users
# \q                    - Exit

# Backup database
docker-compose exec postgres pg_dump -U nurserytrack nurserytrack > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nurserytrack nurserytrack < backup.sql
```

### API Testing

```powershell
# Health check
curl http://localhost:3005/api/health

# Get all batches
curl http://localhost:3005/api/batches `
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a batch
curl -X POST http://localhost:3005/api/batches `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "variety_id": "uuid-here",
    "quantity": 50,
    "status": "rooting"
  }'
```

### File Operations

```powershell
# List files in current directory
ls
# or
dir

# List hidden files
ls -Force

# Search for files
ls -Recurse -Filter "PORT_*"

# View file content
Get-Content filename.md

# Edit file
notepad filename.md

# Copy file
Copy-Item source.txt destination.txt
```

---

## 🐛 Troubleshooting on Windows

### Problem: "Docker command not found"

**Solution:**
```powershell
# Docker Desktop might not be in PATH
# Open PowerShell as Administrator and add Docker to PATH:

$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Or restart PowerShell after installing Docker
```

### Problem: "Port 3005 already in use"

**Solution:**
```powershell
# Find what's using port 3005
netstat -ano | findstr :3005

# Kill the process (replace PID with the number from output)
taskkill /PID 1234 /F

# Or use different port:
$env:API_PORT = 3010
docker-compose up -d
```

### Problem: "docker-compose.yml not found"

**Solution:**
```powershell
# Make sure you're in the right directory
pwd  # Should show: C:\Users\Admin\Documents\test\Nursery test\NurseryTrack

# List files to verify
ls docker-compose.yml
```

### Problem: "Permission denied" errors

**Solution:**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → Run as Administrator

# Then try again:
docker-compose up -d
```

### Problem: Database connection error

**Solution:**
```powershell
# Check if PostgreSQL container is healthy
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Wait 10 seconds for it to start
Start-Sleep -Seconds 10

# Try again
docker-compose exec api npm run migrate
```

### Problem: API returns "503 Service Unavailable"

**Solution:**
```powershell
# Check if all services are healthy
docker-compose ps

# View API logs for errors
docker-compose logs api

# Restart API
docker-compose restart api

# Wait for it to start
Start-Sleep -Seconds 5

# Test health endpoint
curl http://localhost:3005/api/health
```

### Problem: "Unexpected character" in PowerShell

**Solution:**
If you get encoding errors, use backticks for line continuation:

```powershell
# Correct:
curl -X POST http://localhost:3005/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"pass"}'

# Windows Command Prompt (cmd.exe) alternative:
curl -X POST http://localhost:3005/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"pass\"}"
```

---

## 📊 Verify Installation

Run this checklist to verify everything works:

```powershell
# 1. Check Docker is running
docker --version
# Should show: Docker version 20.10+ or higher

# 2. Check Docker Compose
docker-compose --version
# Should show: Docker Compose version 1.29+ or higher

# 3. Check all services are running
docker-compose ps
# All should show "Up"

# 4. Test API
curl http://localhost:3005/api/health
# Should return: {"status":"OK",...}

# 5. Check MinIO
Invoke-WebRequest http://localhost:9001 -UseBasicParsing
# Should return: Status 200

# 6. Check database
docker-compose exec postgres psql -U nurserytrack -d nurserytrack -c "SELECT COUNT(*) FROM users;"
# Should return: count = 1 (or more)

# 7. Check files exist
Test-Path "PORT_MIGRATION_INDEX.md"
# Should return: True
```

---

## 🚀 Next Steps

### Today
1. ✅ Follow Quick Start (5 min)
2. ✅ Verify all services running
3. ✅ Test API endpoint

### This Week
1. Read `PORT_3005_QUICK_REFERENCE.md`
2. Test all API endpoints
3. Create test users
4. Explore MinIO console

### For Development
1. Read `README.md` for API documentation
2. Read `CONTRIBUTING.md` for development guidelines
3. Check `backend/src/routes/` for API implementation
4. Modify and test endpoints

---

## 💡 Pro Tips for Windows Users

### 1. Use Windows Terminal (Recommended)
- Download from Microsoft Store
- Better PowerShell experience
- Built-in multiple tabs

### 2. Create PowerShell Profile
```powershell
# Create profile
New-Item -Path $PROFILE -Type File -Force

# Edit profile
notepad $PROFILE

# Add these aliases for easier use:
function start-app { docker-compose up -d }
function stop-app { docker-compose down }
function show-logs { docker-compose logs -f }
function test-api { curl http://localhost:3005/api/health }
```

### 3. Use VS Code
- Download: https://code.microsoft.com/
- Install Docker extension
- Install REST Client extension for testing APIs
- Open project folder: `code .`

### 4. Keyboard Shortcuts
```
Ctrl+C         - Stop running command
Clear          - Clear screen
Exit           - Close PowerShell
Tab            - Auto-complete
Up/Down Arrows - Command history
```

### 5. Common Directory Navigation
```powershell
# Go to Documents
cd ~/Documents

# Go to Desktop
cd ~/Desktop

# Go to project
cd "C:\Users\Admin\Documents\test\Nursery test\NurseryTrack"

# Go back
cd ..

# Go to home
cd ~
```

---

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/Lumeo-sd/NurseryTrack
- **Docker Documentation:** https://docs.docker.com/
- **Node.js Documentation:** https://nodejs.org/docs/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **MinIO Documentation:** https://min.io/docs/

---

## 📞 Getting Help

### If you get stuck:

1. **Check Troubleshooting section** above (most common issues)
2. **Read logs:**
   ```powershell
   docker-compose logs api
   ```
3. **Check documentation:**
   - `PORT_3005_QUICK_REFERENCE.md` - Commands & examples
   - `PORT_MIGRATION_REPORT.md` - Technical details
4. **Review GitHub:**
   - https://github.com/Lumeo-sd/NurseryTrack/issues

---

## ✅ Success Checklist

When everything is working, you should have:

- [ ] Docker Desktop installed and running
- [ ] Git repository cloned locally
- [ ] All Docker containers running (`docker-compose ps`)
- [ ] API responding at http://localhost:3005/api/health
- [ ] MinIO console accessible at http://localhost:9001
- [ ] pgAdmin accessible at http://localhost:5050
- [ ] Database initialized with migrations
- [ ] Admin user created (optional)
- [ ] Documentation files readable
- [ ] Ready to start development

---

**Status:** ✅ Ready for Windows Development

**Version:** 1.0.0  
**License:** MIT  
**Last Updated:** March 9, 2026

🌱 **Happy Coding with NurseryTrack on Windows!** 🌱