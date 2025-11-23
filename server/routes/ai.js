const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { single } = require('../middleware/upload');

// Import Gemini AI (you'll need to install this)
// npm install @google/generative-ai
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * @swagger
 * /api/ai/analyze-media:
 *   post:
 *     summary: Analyze media (photo/video) using AI
 *     description: Uses Google Gemini AI to analyze uploaded media and suggest report category, title, and description. Supports both file upload and base64 data.
 *     tags: [AI]
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
 *                 description: Image or video file to analyze
 *               language:
 *                 type: string
 *                 description: Language for AI response (en or ar)
 *                 example: "en"
 *               availableCategories:
 *                 type: string
 *                 description: JSON array of valid categories (comma-separated string)
 *                 example: "Lighting,Roads,Water,Waste"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaData
 *               - mimeType
 *             properties:
 *               mediaData:
 *                 type: string
 *                 description: Base64 encoded media data (without data:image prefix)
 *                 example: "/9j/4AAQSkZJRgABAQAAAQABAAD..."
 *               mimeType:
 *                 type: string
 *                 description: MIME type of the media
 *                 example: "image/jpeg"
 *               language:
 *                 type: string
 *                 description: Language for AI response (en or ar)
 *                 example: "en"
 *               availableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of valid categories to choose from
 *                 example: ["Lighting", "Roads", "Water", "Waste"]
 *     responses:
 *       200:
 *         description: AI analysis successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   example: "Lighting"
 *                 title:
 *                   type: string
 *                   example: "Broken streetlight"
 *                 description:
 *                   type: string
 *                   example: "Streetlight appears to be non-functional"
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: AI service not configured (GEMINI_API_KEY not set)
 *       500:
 *         description: AI analysis failed
 */
router.post('/analyze-media', authMiddleware, (req, res, next) => {
  const contentType = req.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload
    single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.status(503).json({
            error: 'AI service not configured',
            message: 'GEMINI_API_KEY environment variable not set'
          });
        }

        const language = req.body.language || 'en';
        const categoriesString = req.body.availableCategories || '';
        const availableCategories = categoriesString ? categoriesString.split(',') : [];

        // Use Gemini 2.5 Flash (stable)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = language === 'ar'
          ? `حلل هذه الصورة/الفيديو وحدد:
1. الفئة الأنسب من هذه القائمة: ${availableCategories.join(', ')}
2. عنوان مختصر للمشكلة (5-10 كلمات)
3. وصف تفصيلي للمشكلة
4. درجة الخطورة: "low" (منخفض), "medium" (متوسط), أو "high" (عالي)

أجب بتنسيق JSON فقط:
{
  "category": "الفئة",
  "title": "العنوان",
  "description": "الوصف",
  "severity": "low|medium|high"
}`
          : `Analyze this image/video and determine:
1. The most appropriate category from this list: ${availableCategories.join(', ')}
2. A short title for the issue (5-10 words)
3. A detailed description of the issue
4. The severity level: "low", "medium", or "high"

Respond in JSON format only:
{
  "category": "category",
  "title": "title",
  "description": "description",
  "severity": "low|medium|high"
}`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: req.file.buffer.toString('base64'),
              mimeType: req.file.mimetype
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          // Ensure severity is included, default to medium if not provided
          if (!analysis.severity) {
            analysis.severity = 'medium';
          }
          res.json(analysis);
        } else {
          res.json({
            category: availableCategories[0] || 'Other',
            title: 'Issue detected',
            description: text,
            severity: 'medium'
          });
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
          error: 'Failed to analyze media',
          details: error.message,
          hint: 'Check if GEMINI_API_KEY is valid and has proper permissions'
        });
      }
    });
  } else {
    // Handle base64 JSON upload (existing functionality)
    (async () => {
      try {
        const { mediaData, mimeType, language = 'en', availableCategories = [] } = req.body;

        if (!mediaData || !mimeType) {
          return res.status(400).json({ error: 'mediaData and mimeType are required' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.status(503).json({
            error: 'AI service not configured',
            message: 'GEMINI_API_KEY environment variable not set'
          });
        }

        // Use Gemini 2.5 Flash (stable)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = language === 'ar'
          ? `حلل هذه الصورة وحدد:
1. الفئة الأنسب من هذه القائمة: ${availableCategories.join(', ')}
2. عنوان مختصر للمشكلة
3. وصف تفصيلي للمشكلة

أجب بتنسيق JSON:
{
  "category": "الفئة",
  "title": "العنوان",
  "description": "الوصف"
}`
          : `Analyze this image and determine:
1. The most appropriate category from: ${availableCategories.join(', ')}
2. A short title for the issue
3. A detailed description of the problem

Respond in JSON format:
{
  "category": "category",
  "title": "title",
  "description": "description"
}`;

        const result = await model.generateContent([
          {
            inlineData: {
              data: mediaData,
              mimeType: mimeType,
            },
          },
          prompt,
        ]);

        const response = result.response;
        const text = response.text();

        // Extract JSON from response (Gemini sometimes wraps it in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return res.status(500).json({
            error: 'Failed to parse AI response',
            rawResponse: text
          });
        }

        const analysis = JSON.parse(jsonMatch[0]);

        res.json(analysis);
      } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({
          error: 'AI analysis failed',
          message: error.message
        });
      }
    })();
  }
});

/**
 * @swagger
 * /api/ai/detect-municipality:
 *   post:
 *     summary: Detect municipality from location
 *     description: Uses reverse geocoding to determine municipality from GPS coordinates
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 33.5731
 *               longitude:
 *                 type: number
 *                 example: -7.5898
 *     responses:
 *       200:
 *         description: Municipality detected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 municipality:
 *                   type: string
 *                   example: "Casablanca"
 *                 region:
 *                   type: string
 *                   example: "Casablanca-Settat"
 *                 address:
 *                   type: string
 *                   example: "Boulevard Mohammed V, Casablanca"
 *       400:
 *         description: Missing coordinates
 *       500:
 *         description: Detection failed
 */
router.post('/detect-municipality', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
      {
        headers: {
          'User-Agent': 'Mshkltk/1.0 (civic engagement platform)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    // Extract municipality from address components
    const municipality = data.address?.city ||
      data.address?.town ||
      data.address?.municipality ||
      data.address?.county ||
      'beirut'; // Default fallback

    res.json({ municipality: municipality.toLowerCase() });
  } catch (error) {
    console.error('Municipality detection error:', error);
    res.json({ municipality: 'beirut' }); // Fallback instead of error
  }
});

/**
 * @swagger
 * /api/ai/transcribe-audio:
 *   post:
 *     summary: Transcribe audio to text
 *     description: Uses Google Gemini AI to transcribe audio recordings. Supports both file upload and base64 data.
 *     tags: [AI]
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
 *                 description: Audio file to transcribe (MP3, WAV, WEBM, etc.)
 *               language:
 *                 type: string
 *                 description: Expected language (en or ar)
 *                 example: "en"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audioData
 *               - mimeType
 *             properties:
 *               audioData:
 *                 type: string
 *                 description: Base64 encoded audio data
 *                 example: "UklGRiQAAABXQVZFZm10IBAAAAABAA..."
 *               mimeType:
 *                 type: string
 *                 description: Audio MIME type
 *                 example: "audio/webm"
 *               language:
 *                 type: string
 *                 description: Expected language (en or ar)
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Transcription successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   example: "The streetlight on Main Street has been broken for three days"
 *       400:
 *         description: Missing required fields
 *       503:
 *         description: AI service not configured
 *       500:
 *         description: Transcription failed
 */
router.post('/transcribe-audio', authMiddleware, (req, res, next) => {
  const contentType = req.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload
    single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No audio file uploaded' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.status(503).json({
            error: 'AI service not configured',
            message: 'GEMINI_API_KEY environment variable not set'
          });
        }

        const language = req.body.language || 'en';
        // Use Gemini 2.5 Flash (stable)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = language === 'ar'
          ? 'استمع إلى هذا التسجيل الصوتي أو الفيديو واكتب نصه بالكامل.'
          : 'Listen to this audio/video recording and transcribe the audio to text.';

        // Handle webm files - they can be audio or video
        let mimeType = req.file.mimetype;
        if (mimeType === 'video/webm') {
          // WebM is supported by Gemini for audio transcription
          mimeType = 'audio/webm';
        }

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: req.file.buffer.toString('base64'),
              mimeType: mimeType,
            },
          },
        ]);

        const response = result.response;
        const text = response.text();

        res.json({ text });
      } catch (error) {
        console.error('Audio transcription error:', error);
        console.error('File mimetype:', req.file?.mimetype);
        console.error('File size:', req.file?.size);
        res.status(500).json({
          error: 'Transcription failed',
          message: error.message
        });
      }
    });
  } else {
    // Handle base64 JSON upload (existing functionality)
    (async () => {
      try {
        const { audioData, mimeType, language = 'en' } = req.body;

        if (!audioData || !mimeType) {
          return res.status(400).json({ error: 'audioData and mimeType are required' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.status(503).json({
            error: 'AI service not configured',
            message: 'GEMINI_API_KEY environment variable not set'
          });
        }

        // Use Gemini 2.5 Flash (stable)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = language === 'ar'
          ? 'استمع إلى هذا التسجيل الصوتي واكتب نصه بالكامل.'
          : 'Listen to this audio recording and transcribe it to text.';

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: audioData,
              mimeType: mimeType,
            },
          },
        ]);

        const response = result.response;
        const text = response.text();

        res.json({ text });
      } catch (error) {
        console.error('Audio transcription error:', error);
        res.status(500).json({
          error: 'Transcription failed',
          message: error.message
        });
      }
    })();
  }
});

module.exports = router;
