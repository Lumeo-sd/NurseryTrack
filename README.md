# 🌱 NurseryTrack

> **Open Source Self-Hosted Nursery Management System**
> 
> A comprehensive mobile application for managing plant nurseries, greenhouses, and plant propagation facilities. Built with React Native, Node.js, PostgreSQL, and MinIO.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-61dafb.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)

## ✨ Features

### 📊 Dashboard & Analytics
- Real-time inventory overview
- Plant health monitoring
- Financial analytics and reports
- Sales and revenue tracking
- Growth stage distribution charts

### 📦 Inventory Management
- Plant variety catalog with detailed information
- Batch tracking with unique QR codes
- Status management (germinating, rooted, ready for sale, sold)
- Container size and location tracking
- Photo gallery for each batch
- Action history and audit logs

### 🎯 Core Operations
- **Batch Management**: Create, edit, and delete plant batches
- **Variety Management**: Maintain plant variety database
- **QR Code Generation**: Auto-generate QR codes for each batch
- **Photo Upload**: Attach photos to batches and varieties
- **Action Logging**: Track all changes with timestamps and user info
- **Status Tracking**: Monitor plant development stages

### 👥 User Management
- Role-based access control (Admin, Worker)
- User authentication with JWT
- Activity tracking and user logs
- Password reset functionality

### 🔐 Security & Compliance
- JWT-based authentication
- Encrypted password storage (bcrypt)
- CORS protection
- SQL injection prevention
- HTTPS/SSL support
- Audit logging for all database changes

### 📱 Mobile App Features
- Native iOS and Android apps via Expo
- Offline support with local caching
- QR code scanning for batch lookup
- Camera integration for photo capture
- Real-time data synchronization

### ☁️ Self-Hosted Benefits
- **Full Data Control**: Keep all data on your own servers
- **No Vendor Lock-in**: Open source, portable architecture
- **Cost-Effective**: Single server handles entire system
- **Privacy**: GDPR compliant, no external APIs
- **Reliability**: Self-managed backups and uptime
- **Customizable**: Modify code to fit your needs

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Managed React Native framework
- **React Navigation** - Navigation and routing
- **React Native Paper** - Material Design UI components
- **Axios** - HTTP client for API calls

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **MinIO** - S3-compatible object storage
- **Redis** - Caching layer (optional)
- **JWT** - Authentication tokens

#### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancing
- **Let's Encrypt** - SSL/TLS certificates

### Project Structure

```
NurseryTrack/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── server.js          # Main Express app
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.js        # Authentication
│   │   │   ├── batches.js     # Batch management
│   │   │   ├── varieties.js   # Plant varieties
│   │   │   ├── upload.js      # File uploads
│   │   │   └── actionLogs.js  # Audit logs
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.js        # JWT verification
│   │   └── db/                # Database
│   │       ├── connection.js  # PostgreSQL connection
│   │       └── migrate.js     # Schema migrations
│   ├── Dockerfile
│   └── package.json
├── api/                       # API client library
│   └── client.js             # Axios instances
├── screens/                   # React Native screens
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── ReportsScreen.js
│   ├── ProfileScreen.js
│   └── Inventory/
│       ├── BatchesListScreen.js
│       ├── BatchDetailScreen.js
│       ├── AddBatchScreen.js
│       └── VarietiesListScreen.js
├── components/               # Reusable components
│   ├── QRCodeComponent.js
│   └── PhotoGallery.js
├── navigation/              # Navigation config
│   ├── AppNavigator.js
│   └── BottomTabNavigator.js
├── App.js                   # Main app component
├── docker-compose.yml       # Container orchestration
├── nginx.conf              # Web server config
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- 2GB RAM minimum
- 5GB disk space

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-username/NurseryTrack.git
cd NurseryTrack

# 2. Setup environment
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Update .env with your settings
nano .env
nano backend/.env

# 4. Start services
docker-compose up -d

# 5. Run database migrations
docker-compose exec api npm run migrate

# 6. Create admin user (optional)
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
  console.log('Admin created: admin@nurserytrack.local / admin123');
  process.exit(0);
})();
"

# 7. Start mobile app
npm install
npm start

# 8. Access services
# API: http://localhost:3005/api/health
# MinIO: http://localhost:9001
# pgAdmin: http://localhost:5050
```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production setup with:
- SSL/HTTPS configuration
- Domain setup
- Firewall configuration
- Backup strategy
- Monitoring setup

Quick production start:

```bash
# 1. Provision a VPS (DigitalOcean, Hetzner, AWS, etc.)
# 2. SSH into server and clone repo
ssh root@your_server_ip
cd /opt && git clone https://github.com/your-username/NurseryTrack.git
cd NurseryTrack

# 3. Configure with production settings
cp .env.example .env
# Edit .env with production values (API_PORT=3005)

# 4. Setup SSL certificate
certbot certonly --standalone -d your-domain.com

# 5. Start services
docker-compose up -d

# 6. Run migrations
docker-compose exec api npm run migrate

# 7. Verify
curl https://your-domain.com/api/health
```

## 📖 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}

# Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "worker"
  },
  "session": {
    "access_token": "jwt_token_here"
  }
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

# Get Current User
GET /api/auth/me
Authorization: Bearer <token>
```

### Batches

```bash
# List all batches
GET /api/batches
Authorization: Bearer <token>

# Get batch details
GET /api/batches/:id
Authorization: Bearer <token>

# Create batch
POST /api/batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "variety_id": "uuid",
  "quantity": 100,
  "container_size": "10cm pot",
  "location": "Section A",
  "notes": "Optional notes"
}

# Update batch
PUT /api/batches/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 95,
  "status": "готово до продажу",
  "price": 15.99
}

# Delete batch
DELETE /api/batches/:id
Authorization: Bearer <token>
```

### Varieties

```bash
# List all varieties
GET /api/varieties
Authorization: Bearer <token>

# Get variety
GET /api/varieties/:id
Authorization: Bearer <token>

# Create variety (admin only)
POST /api/varieties
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rose",
  "latin_name": "Rosa sp.",
  "default_photo_url": "url_to_photo"
}

# Update variety (admin only)
PUT /api/varieties/:id
Authorization: Bearer <token>

# Delete variety (admin only)
DELETE /api/varieties/:id
Authorization: Bearer <token>
```

### File Upload

```bash
# Upload batch photo
POST /api/upload/batch/:batchId
Authorization: Bearer <token>
Content-Type: multipart/form-data

[file data]

# Response
{
  "success": true,
  "fileName": "batch-uuid-timestamp.jpg",
  "url": "http://localhost:9000/nursery-photos/batch-uuid-timestamp.jpg"
}

# Delete photo
DELETE /api/upload/:fileName
Authorization: Bearer <token>
```

### Action Logs

```bash
# Get logs for batch
GET /api/action-logs/batch/:batchId
Authorization: Bearer <token>

# Get user's logs
GET /api/action-logs/user
Authorization: Bearer <token>

# Get statistics
GET /api/action-logs/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=nurserytrack
DB_USER=nurserytrack_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=nursery-photos
MINIO_USE_SSL=false

# Server
PORT=3005
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

#### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:3005/api
REACT_APP_STORAGE_URL=http://localhost:9000
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_QR_SCAN=true
REACT_APP_DEBUG=false
```

## 📱 Mobile App Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 12+ (for iOS)
- Android: Android Studio (for Android)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start
# or with expo
expo start

# Run on Android
npm run android
# or
expo start --android

# Run on iOS
npm run ios
# or
expo start --ios

# Run on Web
npm run web
```

### Production Build

```bash
# Using Expo Application Services (recommended)
npm install -g eas-cli
eas build --platform android --auto-submit
eas build --platform ios

# Or using traditional methods
expo build:android
expo build:ios
```

## 🐳 Docker Services

The `docker-compose.yml` includes:

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Main database |
| MinIO | 9000/9001 | Object storage + console |
| Redis | 6379 | Caching layer |
| Node.js API | 3005 | Backend API server |
| Nginx | 80/443 | Reverse proxy |
| pgAdmin | 5050 | Database management (dev) |

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Execute commands
docker-compose exec api npm run migrate
docker-compose exec postgres psql -U nurserytrack

# Restart services
docker-compose restart api
docker-compose restart postgres

# Stop and remove
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('admin', 'worker')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Varieties
```sql
CREATE TABLE varieties (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  latin_name VARCHAR(255),
  default_photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Batches
```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  variety_id UUID REFERENCES varieties(id),
  quantity INTEGER,
  status VARCHAR(50),
  container_size VARCHAR(100),
  location VARCHAR(255),
  price DECIMAL(10,2),
  date_rooted TIMESTAMP,
  date_added TIMESTAMP DEFAULT NOW(),
  qr_code_value VARCHAR(255) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Action Logs
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

### Photos
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security

### Best Practices Implemented
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Environment-based secrets management
- ✅ HTTPS/SSL support
- ✅ Audit logging of all changes
- ✅ Role-based access control (RBAC)

### Security Recommendations
- Change all default passwords before production
- Use strong JWT secret (32+ characters)
- Enable firewall rules
- Set up automated backups
- Keep Docker images updated
- Monitor logs regularly
- Use HTTPS in production
- Implement rate limiting for APIs
- Regular security audits

## 📈 Performance Optimization

- Database indexes on frequently queried columns
- JWT caching with Redis
- Nginx gzip compression
- Lazy loading in mobile app
- Connection pooling (20 connections)
- MinIO async uploads
- API request throttling

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

## 🐛 Troubleshooting

### API won't start
```bash
# Check logs
docker-compose logs api

# Ensure database is ready
docker-compose logs postgres

# Restart API
docker-compose restart api
```

### Database connection error
```bash
# Verify credentials in .env
cat backend/.env | grep DB_

# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U nurserytrack -d nurserytrack
```

### MinIO issues
```bash
# Check MinIO logs
docker-compose logs minio

# Verify bucket exists
docker-compose exec minio mc ls nursery-photos

# Create bucket if needed
docker-compose exec minio mc mb nursery-photos
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Full production setup
- [API Documentation](#-api-documentation) - API endpoints
- [Database Schema](#database-schema) - Database structure
- [Contributing Guide](#-contributing) - How to contribute

## 📋 Roadmap

- [ ] Mobile app push notifications
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Automated watering/fertilizer reminders
- [ ] Integration with weather APIs
- [ ] Mobile app offline sync
- [ ] Email notifications for sales
- [ ] Integration with POS systems
- [ ] Mobile app PWA version
- [ ] GraphQL API

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

MIT License means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Liability limited
- ⚠️ Warranty not provided

## 🙏 Acknowledgments

- React Native and Expo communities
- PostgreSQL developers
- MinIO team
- Docker community
- All contributors and users

## 💬 Support & Contact

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-username/NurseryTrack/issues)
- **Discussions**: [Community discussions](https://github.com/your-username/NurseryTrack/discussions)
- **Email**: support@nurserytrack.local
- **Documentation**: [Full docs](./DEPLOYMENT.md)

## 🌟 Show Your Support

If you find this project useful, please:
- ⭐ Give it a star on GitHub
- 🐛 Report issues you find
- 💡 Suggest improvements
- 🤝 Contribute code
- 📢 Share with others

---

**Made with 🌱 by the NurseryTrack Community**

Happy growing! 🚀