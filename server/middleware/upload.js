/**
 * File Upload Middleware using Multer
 * Handles multipart/form-data file uploads
 * Supports photos, videos, and audio files
 */

const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (files stored in memory as Buffer)
// This allows us to process files before saving to cloud storage
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  const allowedAudioTypes = /mp3|wav|ogg|m4a|aac/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  // Check file type
  const isImage = allowedImageTypes.test(ext) || mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(ext) || mimetype.startsWith('video/');
  const isAudio = allowedAudioTypes.test(ext) || mimetype.startsWith('audio/');

  if (isImage || isVideo || isAudio) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${ext}. Allowed: images, videos, audio files`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Max 10 files per request
  }
});

// Export different upload configurations
module.exports = {
  // Single file upload
  single: (fieldName = 'file') => upload.single(fieldName),
  
  // Multiple files upload (same field name)
  array: (fieldName = 'files', maxCount = 10) => upload.array(fieldName, maxCount),
  
  // Multiple files upload (different field names)
  fields: (fields) => upload.fields(fields),
  
  // Raw multer instance for custom configurations
  upload
};
