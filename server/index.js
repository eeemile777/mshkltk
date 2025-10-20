const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); // To handle large base64 images

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const commentsRoutes = require('./routes/comments');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');

// --- Gemini AI Setup ---
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not defined in the environment variables.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  res.send('Mshkltk Backend is running!');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/media', mediaRoutes);

// --- AI Proxy Endpoints ---

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
