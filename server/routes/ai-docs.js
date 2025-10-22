/**
 * @swagger
 * tags:
 *   - name: AI
 *     description: AI-powered endpoints using Gemini
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Reports
 *     description: Report management endpoints
 *   - name: Comments
 *     description: Comment management endpoints
 *   - name: Notifications
 *     description: Notification endpoints
 *   - name: Users
 *     description: User management endpoints
 *   - name: Media
 *     description: Media upload endpoints
 */

/**
 * @swagger
 * /api/ai/analyze-media:
 *   post:
 *     summary: Analyze media using AI
 *     description: Uses Gemini AI to analyze images and extract information like category, severity, and description
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
 *               - prompt
 *               - imageParts
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to the AI
 *                 example: "Analyze this image and extract report details"
 *               imageParts:
 *                 type: array
 *                 description: Array of image data
 *                 items:
 *                   type: object
 *                   properties:
 *                     inlineData:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: string
 *                           description: Base64 encoded image data
 *                         mimeType:
 *                           type: string
 *                           example: "image/jpeg"
 *     responses:
 *       200:
 *         description: AI analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                 severity:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/ai/transcribe-audio:
 *   post:
 *     summary: Transcribe audio using AI
 *     description: Uses Gemini AI to transcribe audio recordings
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
 *               - prompt
 *               - audioPart
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Transcribe this audio"
 *               audioPart:
 *                 type: object
 *                 properties:
 *                   inlineData:
 *                     type: object
 *                     properties:
 *                       data:
 *                         type: string
 *                         description: Base64 encoded audio data
 *                       mimeType:
 *                         type: string
 *                         example: "audio/webm"
 *     responses:
 *       200:
 *         description: Transcription result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transcription:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/ai/detect-municipality:
 *   post:
 *     summary: Detect municipality from location data
 *     description: Uses Gemini AI to determine the municipality from coordinates or address
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
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "What municipality is located at coordinates 33.888630, 35.495480?"
 *     responses:
 *       200:
 *         description: Municipality detection result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 municipality:
 *                   type: string
 *       400:
 *         description: Missing prompt
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/ai/translate-text:
 *   post:
 *     summary: Translate text using AI
 *     description: Uses Gemini AI to translate text to the target language
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
 *               - text
 *               - targetLanguage
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hello, how are you?"
 *               targetLanguage:
 *                 type: string
 *                 description: Target language for translation
 *                 example: "Arabic"
 *     responses:
 *       200:
 *         description: Translation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

module.exports = {};
