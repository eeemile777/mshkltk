const express = require('express');
const router = express.Router();
const { uploadBase64Image, uploadMultipleBase64Images, isConfigured } = require('../utils/cloudStorage');
const { authMiddleware } = require('../middleware/auth');
const { single, array } = require('../middleware/upload');

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload a single file (image, video, or audio)
 *     description: Upload a file using multipart/form-data OR base64-encoded data via JSON
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (photo, video, or audio)
 *               folder:
 *                 type: string
 *                 description: Target folder in cloud storage
 *                 default: "uploads"
 *                 example: "reports"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - base64Data
 *             properties:
 *               base64Data:
 *                 type: string
 *                 description: Base64-encoded file data (with or without data URL prefix)
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *               folder:
 *                 type: string
 *                 description: Target folder in cloud storage
 *                 default: "uploads"
 *                 example: "reports"
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Missing required file or base64Data
 *       401:
 *         description: Unauthorized - authentication required
 *       413:
 *         description: File too large (max 50MB)
 *       503:
 *         description: Cloud Storage not configured (returns base64 as fallback)
 *       500:
 *         description: Server error
 */
router.post('/upload', authMiddleware, (req, res, next) => {
  // Check content type to determine how to handle the upload
  const contentType = req.get('Content-Type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle file upload with multer
    single('file')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'uploads';

        // Convert file buffer to base64 for cloud storage
        const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        if (!isConfigured()) {
          return res.status(503).json({ 
            error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
            fallback: true,
            url: base64Data,
          });
        }

        const publicUrl = await uploadBase64Image(base64Data, folder);
        res.json({ 
          url: publicUrl,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    });
  } else {
    // Handle base64 JSON upload (existing functionality)
    (async () => {
      try {
        const { base64Data, folder = 'uploads' } = req.body;

        if (!base64Data) {
          return res.status(400).json({ error: 'base64Data is required' });
        }

        if (!isConfigured()) {
          return res.status(503).json({ 
            error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
            fallback: true,
            url: base64Data,
          });
        }

        const publicUrl = await uploadBase64Image(base64Data, folder);
        res.json({ url: publicUrl });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload media' });
      }
    })();
  }
});

/**
 * @swagger
 * /api/media/upload-multiple:
 *   post:
 *     summary: Upload multiple files (images, videos, or audio)
 *     description: Upload multiple files using multipart/form-data OR base64-encoded array via JSON
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files to upload (max 10 files, 50MB each)
 *               folder:
 *                 type: string
 *                 description: Target folder in cloud storage
 *                 default: "uploads"
 *                 example: "reports"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - base64Array
 *             properties:
 *               base64Array:
 *                 type: array
 *                 description: Array of base64-encoded files
 *                 items:
 *                   type: string
 *                 example: ["data:image/jpeg;base64,/9j/4AAQ...", "data:image/png;base64,iVBORw0KG..."]
 *               folder:
 *                 type: string
 *                 description: Target folder in cloud storage
 *                 default: "uploads"
 *                 example: "reports"
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Public URLs of the uploaded files
 *                   example: ["https://storage.googleapis.com/bucket/image1.jpg", "https://storage.googleapis.com/bucket/image2.jpg"]
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       mimetype:
 *                         type: string
 *                       size:
 *                         type: integer
 *       400:
 *         description: Missing required files or base64Array
 *       401:
 *         description: Unauthorized - authentication required
 *       413:
 *         description: File too large (max 50MB per file)
 *       503:
 *         description: Cloud Storage not configured (returns base64 array as fallback)
 *       500:
 *         description: Server error
 */
router.post('/upload-multiple', authMiddleware, (req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle multiple file uploads with multer
    array('files', 10)(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'One or more files are too large. Maximum size is 50MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum is 10 files per request.' });
        }
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
        }

        const folder = req.body.folder || 'uploads';

        // Convert all files to base64
        const base64Array = req.files.map(file => 
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
        );

        if (!isConfigured()) {
          return res.status(503).json({ 
            error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
            fallback: true,
            urls: base64Array,
          });
        }

        const publicUrls = await uploadMultipleBase64Images(base64Array, folder);
        
        res.json({ 
          urls: publicUrls,
          files: req.files.map((file, index) => ({
            url: publicUrls[index],
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          }))
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
      }
    });
  } else {
    // Handle base64 JSON upload (existing functionality)
    (async () => {
      try {
        const { base64Array, folder = 'uploads' } = req.body;

        if (!base64Array || !Array.isArray(base64Array)) {
          return res.status(400).json({ error: 'base64Array is required and must be an array' });
        }

        if (!isConfigured()) {
          return res.status(503).json({ 
            error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
            fallback: true,
            urls: base64Array,
          });
        }

        const publicUrls = await uploadMultipleBase64Images(base64Array, folder);
        res.json({ urls: publicUrls });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload multiple media' });
      }
    })();
  }
});

/**
 * @swagger
 * /api/media/status:
 *   get:
 *     summary: Check Cloud Storage status
 *     description: Check if Cloud Storage is configured and ready for uploads
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Cloud Storage status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configured:
 *                   type: boolean
 *                   description: Whether Cloud Storage is configured
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Status message
 *                   example: "Cloud Storage is configured and ready"
 */
router.get('/status', (req, res) => {
  const configured = isConfigured();
  res.json({ 
    configured,
    message: configured 
      ? 'Cloud Storage is configured and ready' 
      : 'Cloud Storage is not configured. Media will be stored as base64 data URLs.'
  });
});

module.exports = router;
