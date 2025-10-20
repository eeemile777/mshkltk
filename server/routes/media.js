const express = require('express');
const router = express.Router();
const { uploadBase64Image, uploadMultipleBase64Images, isConfigured } = require('../utils/cloudStorage');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/media/upload
 * Upload a single base64 image to Cloud Storage
 */
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const { base64Data, folder = 'uploads' } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    if (!isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
        fallback: true,
        url: base64Data, // Return the original base64 as fallback
      });
    }

    const publicUrl = await uploadBase64Image(base64Data, folder);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

/**
 * POST /api/media/upload-multiple
 * Upload multiple base64 images to Cloud Storage
 */
router.post('/upload-multiple', authMiddleware, async (req, res) => {
  try {
    const { base64Array, folder = 'uploads' } = req.body;

    if (!base64Array || !Array.isArray(base64Array)) {
      return res.status(400).json({ error: 'base64Array is required and must be an array' });
    }

    if (!isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloud Storage is not configured. Using base64 data URLs as fallback.',
        fallback: true,
        urls: base64Array, // Return the original base64 array as fallback
      });
    }

    const publicUrls = await uploadMultipleBase64Images(base64Array, folder);
    res.json({ urls: publicUrls });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

/**
 * GET /api/media/status
 * Check if Cloud Storage is configured
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
