const express = require('express');
const multer = require('multer');
const { Client } = require('minio');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed.'));
    }
  }
});

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true' || false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = 'nursery-photos';

// Ensure bucket exists
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    console.error('MinIO error:', err);
    return;
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) {
        console.error('Error creating bucket:', err);
      } else {
        console.log('Bucket created successfully');
      }
    });
  }
});

// Upload photo for batch
router.post('/batch/:batchId', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { batchId } = req.params;
    const fileName = `batch-${batchId}-${uuidv4()}${path.extname(req.file.originalname)}`;

    minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype },
      (err, etag) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(500).json({ error: 'Failed to upload photo' });
        }

        const photoUrl = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`;

        res.json({
          success: true,
          fileName,
          url: photoUrl,
          uploadedAt: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload variety photo
router.post('/variety/:varietyId', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { varietyId } = req.params;
    const fileName = `variety-${varietyId}-${uuidv4()}${path.extname(req.file.originalname)}`;

    minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype },
      (err, etag) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(500).json({ error: 'Failed to upload photo' });
        }

        const photoUrl = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`;

        res.json({
          success: true,
          fileName,
          url: photoUrl,
          uploadedAt: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete photo
router.delete('/:fileName', authMiddleware, async (req, res) => {
  try {
    const { fileName } = req.params;

    minioClient.removeObject(bucketName, fileName, (err) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Failed to delete photo' });
      }

      res.json({ success: true, message: 'Photo deleted successfully' });
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get presigned URL for photo
router.get('/url/:fileName', authMiddleware, async (req, res) => {
  try {
    const { fileName } = req.params;
    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      24 * 60 * 60 // 24 hours
    );

    res.json({ url: presignedUrl });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
