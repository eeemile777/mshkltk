# Swagger UI Documentation

## Overview

The Mshkltk backend API is now fully documented using Swagger/OpenAPI 3.0. This provides an interactive interface to explore and test all available API endpoints.

## Accessing Swagger UI

Once your server is running, you can access the Swagger UI at:

```
http://localhost:3001/api-docs
```

## Features

### 1. **Interactive API Explorer**
   - Browse all available endpoints organized by tags (Auth, Reports, Comments, Users, etc.)
   - View detailed information about each endpoint including:
     - HTTP method (GET, POST, PUT, DELETE)
     - Request parameters and body schema
     - Response schemas and status codes
     - Authentication requirements

### 2. **Try It Out**
   - Click "Try it out" on any endpoint
   - Fill in the required parameters
   - Execute the request directly from the browser
   - View the response in real-time

### 3. **Authentication**
   - Click the "Authorize" button at the top of the page
   - Enter your JWT token in the format: `Bearer <your-token>`
   - All authenticated requests will automatically include this token

## Getting Started

### Step 1: Start the Server

```bash
cd server
npm start
```

The server should be running on `http://localhost:3001`

### Step 2: Open Swagger UI

Open your browser and navigate to:
```
http://localhost:3001/api-docs
```

### Step 3: Authenticate (for protected endpoints)

1. First, register a new account or login:
   - Find the **Auth** section
   - Expand `POST /api/auth/register` or `POST /api/auth/login`
   - Click "Try it out"
   - Enter your credentials
   - Click "Execute"
   - Copy the `token` from the response

2. Authorize your session:
   - Click the green "Authorize" button at the top right
   - Enter: `Bearer <paste-your-token-here>`
   - Click "Authorize"
   - Click "Close"

### Step 4: Test Endpoints

Now you can test any endpoint:
- Expand the endpoint you want to test
- Click "Try it out"
- Fill in the required parameters
- Click "Execute"
- View the response below

## API Sections

### 🔐 Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### 📋 Reports
- `POST /api/reports` - Create a new report
- `GET /api/reports` - Get all reports (with filters)
- `GET /api/reports/nearby` - Find reports near a location
- `GET /api/reports/:id` - Get a specific report
- `PUT /api/reports/:id` - Update a report
- `POST /api/reports/:id/confirm` - Confirm a report
- `DELETE /api/reports/:id` - Delete a report

### 💬 Comments
- `GET /api/comments/report/:reportId` - Get comments for a report
- `POST /api/comments` - Add a new comment

### 👤 Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### 🔔 Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### 🤖 AI
- `POST /api/ai/analyze-media` - Analyze images with AI
- `POST /api/ai/transcribe-audio` - Transcribe audio
- `POST /api/ai/detect-municipality` - Detect location municipality
- `POST /api/ai/translate-text` - Translate text

### 📸 Media
- `POST /api/media/upload` - Upload media files

## Downloading OpenAPI Spec

You can download the OpenAPI specification in JSON format:

```
http://localhost:3001/api-docs.json
```

This can be imported into other tools like:
- Postman
- Insomnia
- REST Client extensions
- Code generators (swagger-codegen, openapi-generator)

## Tips

1. **Use the Filter Box**: At the top of the Swagger UI, use the filter box to quickly find specific endpoints

2. **Schemas**: Scroll down to see all data models/schemas used in the API

3. **Response Examples**: Each endpoint shows example responses for different status codes

4. **Model Schemas**: Click on "Schema" tabs to see the expected data structure

5. **Export/Import**: You can export your API spec and import it into tools like Postman for testing

## Customization

The Swagger configuration is located in:
```
server/swagger.js
```

API documentation annotations are in:
```
server/routes/*.js
server/index.js
```

To add documentation to a new endpoint, use JSDoc comments with `@swagger` annotations:

```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/example', (req, res) => {
  res.json({ message: 'Hello' });
});
```

## Troubleshooting

### Swagger UI not loading
- Check that the server is running on port 3001
- Clear your browser cache
- Check the console for errors

### Authentication not working
- Make sure you're using the format: `Bearer <token>`
- Ensure your token hasn't expired
- Try logging in again to get a fresh token

### Endpoints not showing up
- Make sure your route files have proper `@swagger` annotations
- Check that routes are included in `swagger.js` apis array
- Restart the server after adding new documentation

## Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JSDoc for Swagger](https://github.com/Surnet/swagger-jsdoc)
