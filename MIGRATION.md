# 🔄 Firebase to Self-Hosted Migration Guide

## Overview

This document outlines the complete migration from Firebase to a self-hosted open-source stack for NurseryTrack.

## What Changed

### Before (Firebase)
```
React Native App → Firebase (Firestore, Auth, Storage)
- Vendor lock-in
- Proprietary pricing
- Limited control
- Data in Google's cloud
```

### After (Self-Hosted)
```
React Native App → REST API (Node.js + Express)
                 → PostgreSQL (Database)
                 → MinIO (File Storage)
                 → Redis (Cache - optional)
- Full control
- Open source
- Data on your server
- Lower costs at scale
```

## Architecture Changes

### Frontend (React Native)
**No breaking changes** - The app remains the same!

### Backend Changes

#### Authentication

**Firebase:**
```javascript
// Old way
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const handleLogin = async () => {
  await signInWithEmailAndPassword(auth, email, password);
};
```

**Self-Hosted:**
```javascript
// New way
import { authAPI } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleLogin = async () => {
  const response = await authAPI.login(email, password);
  await AsyncStorage.setItem("authToken", response.data.session.access_token);
};
```

#### Database

**Firebase Firestore:**
- NoSQL document database
- Real-time updates via listeners
- Collection-based structure

**PostgreSQL:**
- Relational database
- ACID compliance
- Powerful querying with SQL

#### Storage

**Firebase Storage:**
- Managed by Google
- Limited to 5GB free tier
- Integrated authentication

**MinIO:**
- Self-hosted S3-compatible storage
- Unlimited capacity
- Full control

## Migration Steps

### 1. Data Migration (If You Have Existing Data)

```bash
# Export Firestore data
firebase firestore:delete --all --yes

# Or use a migration script to export to JSON and import to PostgreSQL
node scripts/migrate-firestore-to-postgres.js
```

### 2. Update Frontend

```bash
# Install new dependencies
npm install axios @react-native-async-storage/async-storage

# Remove Firebase dependencies
npm uninstall firebase

# Update API configuration in .env
echo "REACT_APP_API_URL=http://localhost:3000/api" >> .env
```

### 3. Deploy Backend

```bash
# Using Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate

# Create admin user
docker-compose exec api node scripts/create-admin.js
```

### 4. Configure Frontend

Update your app to use the REST API:

```javascript
// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
};

export const batchesAPI = {
  getAll: () => api.get('/batches'),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
};

// ... more API methods
```

## File Structure Changes

### Old Structure (Firebase)
```
NurseryTrack/
├── App.js
├── firebase.js                    ← Firebase config
├── screens/
├── components/
├── utils/
└── package.json
```

### New Structure (Self-Hosted)
```
NurseryTrack/
├── backend/                       ← NEW: Node.js API server
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db/
│   ├── package.json
│   └── Dockerfile
├── api/                           ← NEW: API client library
│   └── client.js
├── screens/
├── components/
├── docker-compose.yml             ← NEW: Docker configuration
├── DEPLOYMENT.md                  ← NEW: Deployment guide
├── CONTRIBUTING.md                ← NEW: Contributing guide
├── LICENSE                        ← NEW: MIT license
└── package.json
```

## API Endpoint Mapping

### Authentication

```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name"
}

// Get current user
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Batches

```javascript
// List
GET /api/batches
Headers: { Authorization: "Bearer <token>" }

// Get by ID
GET /api/batches/:id
Headers: { Authorization: "Bearer <token>" }

// Create
POST /api/batches
Headers: { Authorization: "Bearer <token>" }
Body: { variety_id, quantity, container_size, location, notes }

// Update
PUT /api/batches/:id
Headers: { Authorization: "Bearer <token>" }
Body: { quantity, status, price, ... }

// Delete
DELETE /api/batches/:id
Headers: { Authorization: "Bearer <token>" }
```

### Varieties

```javascript
// List
GET /api/varieties

// Get by ID
GET /api/varieties/:id

// Create (admin)
POST /api/varieties
Body: { name, latin_name, default_photo_url }

// Update (admin)
PUT /api/varieties/:id

// Delete (admin)
DELETE /api/varieties/:id
```

### File Upload

```javascript
// Upload photo
POST /api/upload/batch/:batchId
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "multipart/form-data"
}
Form Data: { file: <binary> }

// Delete photo
DELETE /api/upload/:fileName
Headers: { Authorization: "Bearer <token>" }
```

## Database Schema Changes

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'worker',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Varieties Table
```sql
CREATE TABLE varieties (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  latin_name VARCHAR(255),
  default_photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Batches Table
```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  variety_id UUID REFERENCES varieties(id),
  quantity INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'укорінення',
  container_size VARCHAR(100),
  location VARCHAR(255),
  price DECIMAL(10,2),
  date_rooted TIMESTAMP,
  date_added TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  qr_code_value VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Action Logs Table
```sql
CREATE TABLE action_logs (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50),
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Photos Table
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration Files

### .env (Frontend)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_STORAGE_URL=http://localhost:9000
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_QR_SCAN=true
REACT_APP_DEBUG=false
```

### backend/.env
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=nurserytrack
DB_USER=nurserytrack_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=nursery-photos
MINIO_USE_SSL=false

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  api:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - minio
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      MINIO_ENDPOINT: minio:9000
      # ... other env vars

volumes:
  postgres_data:
  minio_data:
```

## Breaking Changes for Developers

### 1. Firebase Imports Removed
```javascript
// ❌ Old
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

// ✅ New
import { authAPI, batchesAPI } from "../api/client";
```

### 2. Real-time Listeners Changed
```javascript
// ❌ Old
const unsubscribe = db.collection('batches').onSnapshot(snapshot => {
  const batches = snapshot.docs.map(doc => doc.data());
});

// ✅ New
const response = await batchesAPI.getAll();
const batches = response.data;
```

### 3. File Upload Process
```javascript
// ❌ Old
await storage.ref(`batches/${batchId}/${file.name}`).put(file);

// ✅ New
const response = await uploadAPI.uploadBatchPhoto(batchId, fileUri);
const photoUrl = response.data.url;
```

## Benefits of Migration

### Cost
- **Firebase**: Pay per read/write ($1 per million reads)
- **Self-Hosted**: Fixed server cost (~$5-20/month on VPS)

### Data Ownership
- Firebase: Google owns your data
- Self-Hosted: You own your data

### Scalability
- Firebase: Limited to their quotas
- Self-Hosted: Scale as needed

### Customization
- Firebase: Limited to Firebase features
- Self-Hosted: Build anything you want

### Privacy
- Firebase: Data in Google's cloud
- Self-Hosted: Data on your servers (GDPR compliant)

## Troubleshooting

### API Connection Error
```javascript
// Check API is running
curl http://localhost:3000/api/health

// Check .env REACT_APP_API_URL
cat .env | grep API_URL

// Check backend logs
docker-compose logs api
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check credentials in backend/.env
cat backend/.env | grep DB_

# Test connection
docker-compose exec postgres psql -U nurserytrack -d nurserytrack
```

### Authentication Not Working
```bash
# Check JWT_SECRET is set
cat backend/.env | grep JWT_SECRET

# Check token is saved
# In React DevTools: AsyncStorage.getItem('authToken')

# Verify login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### File Upload Issues
```bash
# Check MinIO is running
docker-compose ps minio

# Verify bucket exists
docker-compose exec minio mc ls nursery-photos

# Check permissions
docker-compose logs minio
```

## Next Steps

1. **Update your React Native app** to use the new API client
2. **Deploy backend** using Docker Compose
3. **Configure domain** and SSL certificate
4. **Set up automated backups**
5. **Monitor** server resources
6. **Test thoroughly** before production

## Support

- 📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- 🤝 See [CONTRIBUTING.md](./CONTRIBUTING.md) for development
- 🐛 Report issues on [GitHub Issues](https://github.com/Lumeo-sd/NurseryTrack/issues)

## Rollback (If Needed)

If you need to rollback to Firebase:

1. Keep the old Firebase code in a separate branch
2. Firebase data is still accessible via Firebase Console
3. Restore from backups if needed

However, we strongly recommend staying with self-hosted for:
- Full data control
- Better long-term costs
- No vendor lock-in
- Open source benefits

---

**Welcome to the self-hosted future of NurseryTrack! 🌱**