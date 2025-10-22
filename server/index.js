const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); // To handle large base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from public directory
app.use('/test', express.static(path.join(__dirname, 'public')));

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const commentsRoutes = require('./routes/comments');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const aiRoutes = require('./routes/ai');
const configRoutes = require('./routes/config');
const auditLogsRoutes = require('./routes/auditLogs');

// --- Gemini AI Setup ---
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not defined in the environment variables.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- Helper for safe JSON parsing ---
const safeParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Mshkltk Backend is running! Visit <a href="/api-docs">/api-docs</a> for API documentation.');
});

// --- Swagger Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Mshkltk API Documentation',
}));

// Serve swagger spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// --- Legacy AI Endpoints (for backward compatibility) ---

const handleAiRequest = async (res, content, isJson = true) => {
  try {
    const result = await aiModel.generateContent(content);
    const text = result.response.text();
    
    if (isJson) {
      const jsonResponse = safeParseJson(text);
      if (jsonResponse) {
        res.json(jsonResponse);
      } else {
        console.error('AI response was not valid JSON:', text);
        res.status(500).json({ error: 'AI response was not valid JSON.' });
      }
    } else {
      res.json({ text });
    }
  } catch (error) {
    console.error('Error during AI request:', error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
};

app.post('/api/ai/analyze-media', async (req, res) => {
  const { prompt, imageParts } = req.body;
  if (!prompt || !imageParts) {
    return res.status(400).json({ error: 'Missing prompt or imageParts.' });
  }
  await handleAiRequest(res, [prompt, ...imageParts], true);
});

app.post('/api/ai/transcribe-audio', async (req, res) => {
  const { prompt, audioPart } = req.body;
  if (!prompt || !audioPart) {
    return res.status(400).json({ error: 'Missing prompt or audioPart.' });
  }
  await handleAiRequest(res, [prompt, audioPart], true);
});

app.post('/api/ai/detect-municipality', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt.' });
  }
  await handleAiRequest(res, prompt, true);
});

app.post('/api/ai/translate-text', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or targetLanguage.' });
  }
  const prompt = `Translate the following text to ${targetLanguage}. Respond with ONLY the translated text, no extra formatting or explanations. Text to translate: "${text}"`;
  await handleAiRequest(res, prompt, false);
});


app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
