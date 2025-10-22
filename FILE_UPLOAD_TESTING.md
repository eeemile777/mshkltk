# 📸 File Upload Testing Guide - Swagger UI

Your Swagger UI now supports **REAL FILE UPLOADS**! You can upload actual photos, videos, and audio files directly from your computer.

---

## ✅ What's New

### Supported File Types

#### 📷 Images
- JPEG/JPG
- PNG
- GIF
- WebP

#### 🎥 Videos
- MP4
- MOV
- AVI
- MKV
- WebM

#### 🎵 Audio
- MP3
- WAV
- OGG
- M4A
- AAC

### File Limits
- **Max file size:** 50MB per file
- **Max files per request:** 10 files (for bulk upload)

---

## 🚀 How to Upload Files in Swagger UI

### Method 1: Upload a Single File

1. **Open Swagger UI:** http://localhost:3001/api-docs
2. **Login first:**
   - Go to `POST /api/auth/login`
   - Click "Try it out"
   - Enter username/password
   - Copy the token
   - Click 🔓 Authorize button
   - Enter `Bearer YOUR_TOKEN`

3. **Upload a file:**
   - Find `POST /api/media/upload`
   - Click **"Try it out"**
   - You'll see **TWO tabs**: `multipart/form-data` and `application/json`
   - **Select `multipart/form-data` tab**
   - Click **"Choose File"** button under `file` field
   - Select a photo/video/audio from your computer
   - (Optional) Enter a folder name (e.g., "reports")
   - Click **"Execute"**
   
4. **Response:**
   ```json
   {
     "url": "https://storage.googleapis.com/bucket/image.jpg",
     "filename": "my-photo.jpg",
     "mimetype": "image/jpeg",
     "size": 1024567
   }
   ```

---

### Method 2: Upload Multiple Files

1. **Find** `POST /api/media/upload-multiple`
2. Click **"Try it out"**
3. Select **`multipart/form-data` tab**
4. Click **"Choose Files"** under `files` field
5. **Select multiple files** (hold Ctrl/Cmd to select multiple)
6. Click **"Execute"**

**Response:**
```json
{
  "urls": [
    "https://storage.googleapis.com/bucket/image1.jpg",
    "https://storage.googleapis.com/bucket/image2.jpg"
  ],
  "files": [
    {
      "url": "https://storage.googleapis.com/bucket/image1.jpg",
      "filename": "photo1.jpg",
      "mimetype": "image/jpeg",
      "size": 1024567
    },
    {
      "url": "https://storage.googleapis.com/bucket/image2.jpg",
      "filename": "photo2.jpg",
      "mimetype": "image/png",
      "size": 2048123
    }
  ]
}
```

---

### Method 3: AI Media Analysis with Real Files

Upload a photo and get AI analysis!

1. **Find** `POST /api/ai/analyze-media`
2. Click **"Try it out"**
3. Select **`multipart/form-data` tab**
4. **Upload a photo** of a civic issue (broken streetlight, pothole, etc.)
5. **Set language:**
   - Enter `en` for English
   - Or `ar` for Arabic
6. **Set categories:**
   - Enter comma-separated list: `Lighting,Roads,Water,Waste`
7. Click **"Execute"**

**Response:**
```json
{
  "category": "Lighting",
  "title": "Broken streetlight",
  "description": "The streetlight appears to be non-functional. The bulb seems broken or the fixture may need repair."
}
```

---

## 🎯 Complete Testing Flow

### Test Case 1: Upload Photos for a Report

**Scenario:** User reports a pothole with 3 photos

1. **Login** and get token
2. **Upload 3 photos:**
   ```
   POST /api/media/upload-multiple
   - multipart/form-data
   - Select 3 photos of the pothole
   - folder: "reports"
   ```
3. **Get URLs back:**
   ```json
   {
     "urls": ["url1", "url2", "url3"]
   }
   ```
4. **Create report:**
   ```
   POST /api/reports
   {
     "title": "Large pothole on Main Street",
     "description": "Dangerous pothole near intersection",
     "category": "Roads",
     "municipality": "Casablanca",
     "location": {
       "type": "Point",
       "coordinates": [-7.5898, 33.5731]
     },
     "photo_urls": ["url1", "url2", "url3"]
   }
   ```

---

### Test Case 2: AI-Powered Report Creation

**Scenario:** User uploads a photo, AI analyzes it, then creates report

1. **Login**
2. **Upload & analyze photo:**
   ```
   POST /api/ai/analyze-media
   - multipart/form-data
   - Upload photo of broken light
   - language: "en"
   - availableCategories: "Lighting,Roads,Water,Waste"
   ```
3. **Get AI suggestions:**
   ```json
   {
     "category": "Lighting",
     "title": "Broken streetlight",
     "description": "Streetlight not working..."
   }
   ```
4. **Upload photo to storage:**
   ```
   POST /api/media/upload
   - Upload the same photo
   - Get permanent URL
   ```
5. **Create report with AI data:**
   ```
   POST /api/reports
   - Use AI-suggested title, description, category
   - Add photo URL
   ```

---

### Test Case 3: Video Evidence Upload

**Scenario:** User records video of flooding

1. **Login**
2. **Upload video:**
   ```
   POST /api/media/upload
   - multipart/form-data
   - Upload MP4 video (e.g., flooding.mp4)
   - folder: "reports"
   ```
3. **Create report:**
   ```
   POST /api/reports
   {
     "title": "Severe flooding on Avenue Mohammed V",
     "category": "Water",
     "video_urls": ["https://.../flooding.mp4"]
   }
   ```

---

### Test Case 4: Audio Transcription (Future)

**Scenario:** User records voice description

1. **Upload audio:**
   ```
   POST /api/media/upload
   - Upload M4A/MP3 audio file
   ```
2. **Transcribe (when AI configured):**
   ```
   POST /api/ai/transcribe-audio
   - Send audio for transcription
   ```

---

## 🔧 Backend Changes Made

### 1. Multer Middleware (`middleware/upload.js`)
- Handles multipart/form-data uploads
- Validates file types (images, videos, audio)
- Max 50MB per file
- Max 10 files per request
- Stores files in memory as Buffer

### 2. Updated Routes

#### `routes/media.js`
- **POST /api/media/upload** - Now accepts BOTH:
  - `multipart/form-data` with `file` field
  - `application/json` with `base64Data` (backward compatible)
- **POST /api/media/upload-multiple** - Now accepts BOTH:
  - `multipart/form-data` with `files[]` array
  - `application/json` with `base64Array` (backward compatible)

#### `routes/ai.js`
- **POST /api/ai/analyze-media** - Now accepts BOTH:
  - `multipart/form-data` with `file` field
  - `application/json` with `mediaData` + `mimeType`

### 3. How It Works

```javascript
// For file uploads:
1. User selects file in Swagger UI
2. Browser sends multipart/form-data request
3. Multer middleware intercepts request
4. File is stored in req.file.buffer (as Buffer)
5. Server converts Buffer to base64
6. Uploads to cloud storage (or returns base64 if not configured)
7. Returns public URL

// For base64 (backward compatible):
1. Frontend sends JSON with base64Data
2. Server receives base64 string directly
3. Uploads to cloud storage
4. Returns public URL
```

---

## 📝 Important Notes

### Cloud Storage Required
- File uploads work immediately in Swagger
- But without cloud storage configured, files are returned as base64 (fallback mode)
- To use real cloud storage:
  1. Set up Google Cloud Storage or AWS S3
  2. Configure environment variables
  3. Files will be uploaded and get permanent URLs

### File Validation
- Only allowed file types are accepted
- Files larger than 50MB are rejected with `413 Payload Too Large`
- More than 10 files rejected with `400 Bad Request`

### Security
- All upload endpoints require authentication (Bearer token)
- File types are validated server-side
- MIME types are checked

---

## 🧪 Testing Checklist

### Basic Upload Tests
- [ ] Upload single JPEG image
- [ ] Upload single PNG image
- [ ] Upload single MP4 video
- [ ] Upload multiple images (3-5 files)
- [ ] Upload files with special characters in filename
- [ ] Upload file with spaces in filename

### Error Handling Tests
- [ ] Try uploading without authentication (should get 401)
- [ ] Try uploading file > 50MB (should get 413)
- [ ] Try uploading > 10 files (should get 400)
- [ ] Try uploading invalid file type (.exe, .zip) (should get 400)
- [ ] Try uploading without selecting file (should get 400)

### AI Integration Tests
- [ ] Upload photo of streetlight → Analyze → Should detect "Lighting"
- [ ] Upload photo of road → Analyze → Should detect "Roads"
- [ ] Upload in Arabic → Get Arabic response
- [ ] Upload in English → Get English response

### Full Workflow Tests
- [ ] Complete report creation with photo upload
- [ ] Complete report creation with multiple photos
- [ ] Complete report creation with video
- [ ] AI analysis → Upload → Create report (full flow)

---

## 🎉 You Can Now Test With Real Files!

**Before:** You had to convert images to base64 strings manually  
**Now:** Just click "Choose File" and upload from your computer!

**Try it now:**
1. Open http://localhost:3001/api-docs
2. Login to get token
3. Find `POST /api/media/upload`
4. Click "Try it out"
5. **Select `multipart/form-data` tab**
6. Click "Choose File"
7. Upload a photo from your computer
8. See the response with the URL!

---

## 🔮 Next Steps

1. **Configure Cloud Storage** (optional but recommended)
   - Set up Google Cloud Storage or AWS S3
   - Add credentials to `.env`
   - Files will get permanent URLs instead of base64

2. **Add GEMINI_API_KEY** (for AI features)
   - Get API key from Google AI Studio
   - Add to `.env`: `GEMINI_API_KEY=your-key-here`
   - Test AI media analysis

3. **Test in Production**
   - Deploy backend to production server
   - Test file uploads with larger files
   - Verify cloud storage integration

---

**Happy Testing! 🚀**
