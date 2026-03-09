const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const batchesRoutes = require('./routes/batches');
const varietiesRoutes = require('./routes/varieties');
const uploadRoutes = require('./routes/upload');
const actionLogsRoutes = require('./routes/actionLogs');

// Import middleware
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/varieties', varietiesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/action-logs', actionLogsRoutes);

// Static files for MinIO objects (optional proxy)
app.get('/storage/:bucket/*', (req, res) => {
  const { bucket } = req.params;
  const fileName = req.params[0];

  // Proxy to MinIO or redirect
  const minioUrl = `http://${process.env.MINIO_ENDPOINT}/${bucket}/${fileName}`;
  res.redirect(minioUrl);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     NurseryTrack Backend Server        ║
║     Running on port ${PORT}              ║
╚════════════════════════════════════════╝
  `);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database:', `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
