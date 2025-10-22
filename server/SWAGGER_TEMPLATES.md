# Swagger Documentation Template

Use these templates to quickly add Swagger documentation to your remaining endpoints.

## Basic GET Endpoint

```javascript
/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     description: Retrieve detailed information about a specific resource
 *     tags: [ResourceName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceName'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
```

## Basic POST Endpoint

```javascript
/**
 * @swagger
 * /api/resource:
 *   post:
 *     summary: Create a new resource
 *     description: Add a new resource to the system
 *     tags: [ResourceName]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 example: "Example value"
 *               field2:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceName'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
```

## Basic PUT/PATCH Endpoint

```javascript
/**
 * @swagger
 * /api/resource/{id}:
 *   put:
 *     summary: Update a resource
 *     description: Update an existing resource
 *     tags: [ResourceName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceName'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
```

## Basic DELETE Endpoint

```javascript
/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a resource
 *     description: Remove a resource from the system
 *     tags: [ResourceName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
```

## Example: Comments Endpoint

```javascript
/**
 * @swagger
 * /api/comments/report/{reportId}:
 *   get:
 *     summary: Get all comments for a report
 *     description: Retrieve all comments associated with a specific report
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get('/report/:reportId', async (req, res) => {
  // ... implementation
});
```

## Example: Notifications Endpoint

```javascript
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of notifications to return
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req, res) => {
  // ... implementation
});
```

## Query Parameters Examples

```javascript
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: Page number
  - in: query
    name: limit
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 20
    description: Items per page
  - in: query
    name: sort
    schema:
      type: string
      enum: [asc, desc]
      default: desc
    description: Sort order
  - in: query
    name: filter
    schema:
      type: string
    description: Search filter
```

## Response with Pagination

```javascript
responses:
  200:
    description: Paginated results
    content:
      application/json:
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/ResourceName'
            pagination:
              type: object
              properties:
                total:
                  type: integer
                page:
                  type: integer
                limit:
                  type: integer
                totalPages:
                  type: integer
```

## File Upload Endpoint

```javascript
/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload media files
 *     description: Upload images or videos
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://cdn.example.com/image.jpg"
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Upload failed
 */
```

## Adding New Schema to swagger.js

```javascript
// In server/swagger.js, add to components.schemas:

NewResourceName: {
  type: 'object',
  properties: {
    id: { 
      type: 'string', 
      format: 'uuid',
      description: 'Unique identifier' 
    },
    name: { 
      type: 'string',
      example: 'Example Name' 
    },
    created_at: { 
      type: 'string', 
      format: 'date-time',
      description: 'Creation timestamp' 
    },
    status: { 
      type: 'string',
      enum: ['active', 'inactive'],
      description: 'Current status' 
    },
  },
  required: ['id', 'name'],
},
```

## Tips

1. **Use $ref for schemas** - Reference common schemas instead of repeating them
2. **Add examples** - Users love seeing example values
3. **Document errors** - Include all possible error responses
4. **Be consistent** - Use the same structure across all endpoints
5. **Use enums** - For fields with limited options
6. **Add descriptions** - Explain what each field does
7. **Group by tags** - Keep related endpoints together

## Testing Your Documentation

After adding documentation:
1. Restart the server
2. Refresh http://localhost:3001/api-docs
3. Check the endpoint appears correctly
4. Try the "Try it out" feature
5. Verify request/response examples

## Common Data Types

- **UUID**: `type: string, format: uuid`
- **Date**: `type: string, format: date-time`
- **Email**: `type: string, format: email`
- **URL**: `type: string, format: uri`
- **Password**: `type: string, format: password`
- **Binary**: `type: string, format: binary`
- **Array**: `type: array, items: { type: string }`
- **Object**: `type: object, properties: { ... }`
