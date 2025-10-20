const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

// Initialize Google Cloud Storage
// In production, this will use Application Default Credentials
// For local development, you can set GOOGLE_APPLICATION_CREDENTIALS env variable
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'mshkltk-media';

/**
 * Upload a base64 image to Google Cloud Storage
 * @param {string} base64Data - The base64 encoded image data (with or without data URL prefix)
 * @param {string} folder - The folder/prefix to store the file under (e.g., 'reports', 'avatars')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadBase64Image = async (base64Data, folder = 'uploads') => {
  try {
    // Extract the actual base64 data and MIME type
    let mimeType = 'image/jpeg'; // default
    let base64String = base64Data;

    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64String = matches[2];
      }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Generate a unique filename
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    // Get bucket reference
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true, // Make the file publicly accessible
    });

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Cloud Storage:', error);
    throw error;
  }
};

/**
 * Upload multiple base64 images
 * @param {string[]} base64Array - Array of base64 encoded images
 * @param {string} folder - The folder/prefix to store the files under
 * @returns {Promise<string[]>} - Array of public URLs
 */
const uploadMultipleBase64Images = async (base64Array, folder = 'uploads') => {
  const uploadPromises = base64Array.map(base64 => uploadBase64Image(base64, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloud Storage
 * @param {string} fileUrl - The public URL of the file to delete
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract the file path from the URL
    const urlPattern = new RegExp(`https://storage.googleapis.com/${bucketName}/(.+)`);
    const matches = fileUrl.match(urlPattern);

    if (!matches) {
      throw new Error('Invalid Cloud Storage URL');
    }

    const filePath = matches[1];
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.delete();
    console.log(`File ${filePath} deleted successfully`);
  } catch (error) {
    console.error('Error deleting from Cloud Storage:', error);
    throw error;
  }
};

/**
 * Check if Cloud Storage is configured
 */
const isConfigured = () => {
  return !!(process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS);
};

module.exports = {
  uploadBase64Image,
  uploadMultipleBase64Images,
  deleteFile,
  isConfigured,
};
