# Swagger UI Quick Start Guide

## ✅ Swagger UI Successfully Installed!

Your API documentation is now available at: **http://localhost:3001/api-docs**

## 🚀 What's Been Set Up

1. **Swagger UI Express** - Interactive API documentation interface
2. **Swagger JSDoc** - Automatic OpenAPI spec generation from code comments
3. **Complete API Documentation** - All endpoints documented with:
   - Request/response schemas
   - Authentication requirements
   - Example values
   - Error responses

## 📖 Quick Start

### 1. Start the Server

```bash
cd server
node index.js
```

### 2. Open Swagger UI

Navigate to: **http://localhost:3001/api-docs**

You should see a beautiful interactive API documentation interface!

### 3. Test an Endpoint

#### Try the Login Flow:

1. **Register a new user:**
   - Find the `POST /api/auth/register` endpoint under the **Auth** section
   - Click "Try it out"
   - Fill in the request body:
     ```json
     {
       "username": "testuser",
       "password": "password123",
       "first_name": "Test",
       "last_name": "User"
     }
     ```
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize your session:**
   - Click the green "Authorize" button (🔓) at the top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize" then "Close"

3. **Create a report:**
   - Find `POST /api/reports` under **Reports**
   - Click "Try it out"
   - Fill in the sample data
   - Click "Execute"
   - See your report created!

## 📚 What's Documented

### ✅ Fully Documented Sections:
- **Auth** - Register, Login
- **Reports** - Create, List, Get Nearby, Get by ID
- **AI** - Media Analysis, Audio Transcription, Municipality Detection, Translation

### 🔨 To Be Documented:
- Comments (structure exists, add @swagger comments)
- Users (structure exists, add @swagger comments)
- Notifications (structure exists, add @swagger comments)
- Media (structure exists, add @swagger comments)

## 🎨 Features Available

- ✅ Interactive "Try it out" for all endpoints
- ✅ JWT Bearer token authentication
- ✅ Request/Response schemas with examples
- ✅ OpenAPI 3.0 spec export (`/api-docs.json`)
- ✅ Clean, organized by tags
- ✅ Model schemas for all data types
- ✅ Error response documentation

## 📝 Adding More Documentation

To document a new endpoint, add JSDoc comments above the route:

```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     description: Detailed description here
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/example', (req, res) => {
  res.json({ message: 'Hello' });
});
```

## 🔧 Configuration Files

- `server/swagger.js` - Main Swagger configuration
- `server/index.js` - Server setup with Swagger UI middleware
- `server/routes/*.js` - Individual route files with @swagger annotations

## 🌐 Export & Share

### Download OpenAPI Spec:
```
http://localhost:3001/api-docs.json
```

### Import to Other Tools:
- Postman: Import → Link → Paste the JSON URL
- Insomnia: Import/Export → Import Data → From URL
- VS Code REST Client: Use OpenAPI extension

## 💡 Pro Tips

1. **Search**: Use Ctrl/Cmd + F in Swagger UI to quickly find endpoints
2. **Expand All**: Click "List Operations" to see all endpoints at once
3. **Dark Mode**: Swagger UI respects your system theme
4. **Download Spec**: Use `/api-docs.json` for code generation tools

## 🎯 Next Steps

1. Document remaining routes (comments, users, notifications, media)
2. Add more detailed examples to existing documentation
3. Add response schemas for all endpoints
4. Configure production server URL in `swagger.js`

## 🐛 Troubleshooting

### Swagger UI not loading?
- Check server is running: `http://localhost:3001`
- Clear browser cache
- Check console for errors

### Changes not showing?
- Restart the server (nodemon should auto-restart)
- Clear browser cache
- Check your JSDoc syntax

### Authentication issues?
- Format must be: `Bearer <token>` (note the space)
- Token expires - get a fresh one from login
- Make sure you clicked "Authorize" after pasting token

---

## 📖 Full Documentation

See `server/SWAGGER.md` for complete documentation and advanced usage.

Enjoy your new interactive API documentation! 🎉
