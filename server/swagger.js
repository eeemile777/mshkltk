const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mshkltk API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Mshkltk civic engagement platform',
      contact: {
        name: 'Mshkltk Development Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.mshkltk.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            full_name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+212-6-12-34-56-78' },
            municipality: { type: 'string', example: 'Casablanca' },
            role: { type: 'string', enum: ['citizen', 'portal_admin', 'super_admin'], example: 'citizen' },
            portal_access_level: { type: 'string', enum: ['read_only', 'read_write'], nullable: true, example: null },
            total_points: { type: 'integer', example: 150 },
            reports_count: { type: 'integer', example: 12 },
            created_at: { type: 'string', format: 'date-time', example: '2025-09-01T10:00:00Z' },
          },
          example: {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            full_name: 'John Doe',
            role: 'citizen',
            total_points: 150,
            reports_count: 12,
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 123 },
            title: { type: 'string', example: 'Broken streetlight on Main Street' },
            description: { type: 'string', example: 'The streetlight has been out for 3 days' },
            category: { type: 'string', example: 'Lighting' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'rejected'], example: 'open' },
            municipality: { type: 'string', example: 'Casablanca' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' }, example: [-7.5898, 33.5731] },
              },
            },
            address: { type: 'string', example: '123 Main Street, Casablanca' },
            photo_urls: { type: 'array', items: { type: 'string' }, example: ['https://example.com/photo1.jpg'] },
            created_by: { type: 'integer', example: 1 },
            confirmations: { type: 'integer', example: 5 },
            portal_notes: { type: 'string', nullable: true, example: null },
            resolution_proof: { type: 'array', items: { type: 'string' }, example: [] },
            created_at: { type: 'string', format: 'date-time', example: '2025-10-21T10:30:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2025-10-21T10:30:00Z' },
          },
          example: {
            id: 123,
            title: 'Broken streetlight on Main Street',
            description: 'The streetlight has been out for 3 days',
            category: 'Lighting',
            status: 'open',
            municipality: 'Casablanca',
            confirmations: 5,
            created_at: '2025-10-21T10:30:00Z',
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 456 },
            report_id: { type: 'integer', example: 123 },
            user_id: { type: 'integer', example: 1 },
            text: { type: 'string', example: 'I can confirm this issue exists' },
            created_at: { type: 'string', format: 'date-time', example: '2025-10-21T11:00:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2025-10-21T11:00:00Z' },
          },
          example: {
            id: 456,
            report_id: 123,
            user_id: 1,
            text: 'I can confirm this issue exists',
            created_at: '2025-10-21T11:00:00Z',
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 789 },
            user_id: { type: 'integer', example: 1 },
            type: { type: 'string', example: 'comment' },
            title: { type: 'string', example: 'New comment on your report' },
            message: { type: 'string', example: 'John Doe commented on Broken streetlight' },
            is_read: { type: 'boolean', example: false },
            related_id: { type: 'integer', nullable: true, example: 123 },
            created_at: { type: 'string', format: 'date-time', example: '2025-10-21T11:30:00Z' },
          },
          example: {
            id: 789,
            type: 'comment',
            title: 'New comment on your report',
            message: 'John Doe commented on Broken streetlight',
            is_read: false,
          },
        },
        ReportHistory: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            report_id: { type: 'integer', example: 123 },
            changed_by: { type: 'integer', example: 5 },
            field_name: { type: 'string', example: 'status' },
            old_value: { type: 'string', example: 'open' },
            new_value: { type: 'string', example: 'in_progress' },
            changed_at: { type: 'string', format: 'date-time', example: '2025-10-21T12:00:00Z' },
          },
          example: {
            id: 1,
            report_id: 123,
            field_name: 'status',
            old_value: 'open',
            new_value: 'resolved',
            changed_at: '2025-10-21T12:00:00Z',
          },
        },
        DynamicCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name_en: { type: 'string', example: 'Lighting' },
            name_ar: { type: 'string', example: 'إضاءة' },
            icon: { type: 'string', example: '💡' },
            color: { type: 'string', example: '#FFC107' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00Z' },
          },
          example: {
            id: 1,
            name_en: 'Lighting',
            name_ar: 'إضاءة',
            icon: '💡',
            color: '#FFC107',
            is_active: true,
          },
        },
        DynamicBadge: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name_en: { type: 'string', example: 'First Report' },
            name_ar: { type: 'string', example: 'أول بلاغ' },
            description_en: { type: 'string', example: 'Submit your first report' },
            description_ar: { type: 'string', example: 'قدم بلاغك الأول' },
            icon: { type: 'string', example: '🏅' },
            condition_type: { type: 'string', example: 'reports_count' },
            condition_value: { type: 'integer', example: 1 },
            points_reward: { type: 'integer', example: 10 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00Z' },
          },
          example: {
            id: 1,
            name_en: 'First Report',
            name_ar: 'أول بلاغ',
            icon: '🏅',
            condition_type: 'reports_count',
            condition_value: 1,
            points_reward: 10,
          },
        },
        GamificationSettings: {
          type: 'object',
          properties: {
            points_per_report: { type: 'integer', example: 10 },
            points_per_confirmation: { type: 'integer', example: 5 },
            points_per_comment: { type: 'integer', example: 2 },
            points_per_resolution: { type: 'integer', example: 20 },
          },
          example: {
            points_per_report: 10,
            points_per_confirmation: 5,
            points_per_comment: 2,
            points_per_resolution: 20,
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 5 },
            action: { type: 'string', example: 'UPDATE_REPORT_STATUS' },
            resource_type: { type: 'string', example: 'report' },
            resource_id: { type: 'integer', example: 123 },
            details: { type: 'object', example: { status: 'resolved' } },
            ip_address: { type: 'string', example: '192.168.1.1' },
            created_at: { type: 'string', format: 'date-time', example: '2025-10-21T12:00:00Z' },
          },
          example: {
            id: 1,
            user_id: 5,
            action: 'UPDATE_REPORT_STATUS',
            resource_type: 'report',
            resource_id: 123,
            created_at: '2025-10-21T12:00:00Z',
          },
        },
        Municipality: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name_en: { type: 'string', example: 'Casablanca' },
            name_ar: { type: 'string', example: 'الدار البيضاء' },
            region: { type: 'string', example: 'Casablanca-Settat' },
            is_active: { type: 'boolean', example: true },
          },
          example: {
            id: 1,
            name_en: 'Casablanca',
            name_ar: 'الدار البيضاء',
            region: 'Casablanca-Settat',
            is_active: true,
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 50 },
                total: { type: 'integer', example: 250 },
                totalPages: { type: 'integer', example: 5 },
              },
            },
          },
          example: {
            data: [],
            pagination: {
              page: 1,
              limit: 50,
              total: 250,
              totalPages: 5,
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
          example: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 1,
              username: 'john_doe',
              email: 'john@example.com',
              role: 'citizen',
            },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://s3.amazonaws.com/mshkltk/reports/abc123.jpg' },
            message: { type: 'string', nullable: true, example: null },
          },
          example: {
            url: 'https://s3.amazonaws.com/mshkltk/reports/abc123.jpg',
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation error' },
            message: { type: 'string', example: 'Username is required' },
          },
          example: {
            error: 'Validation error',
            message: 'Username is required',
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './index.js',
    './routes/ai-docs.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
