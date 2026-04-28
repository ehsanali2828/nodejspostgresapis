const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Retail System API using Node Js Postgres',
      version: '1.0.0',
      description:
        'A RESTful API for a retail system with JWT authentication. ' +
        'Use the **Authorize** button to enter your Bearer token after logging in.',
      contact: { name: 'Retail API Support', email: 'ealipk2727@gmail.com' },
    },
    servers: [{ url: 'http://localhost:3000/api', description: 'Local Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 1 },
            name:       { type: 'string',  example: 'Jane Doe' },
            email:      { type: 'string',  example: 'jane@example.com' },
            role:       { type: 'string',  enum: ['admin', 'customer'] },
            created_at: { type: 'string',  format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            name:        { type: 'string',  example: 'Electronics' },
            description: { type: 'string',  example: 'Gadgets and devices' },
            created_at:  { type: 'string',  format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            name:        { type: 'string',  example: 'Wireless Headphones' },
            description: { type: 'string',  example: 'Noise-cancelling headphones' },
            price:       { type: 'number',  example: 89.99 },
            stock:       { type: 'integer', example: 50 },
            category_id: { type: 'integer', example: 1 },
            image_url:   { type: 'string',  example: 'https://example.com/img.jpg' },
            created_at:  { type: 'string',  format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            user_id:      { type: 'integer', example: 2 },
            status:       { type: 'string',  enum: ['pending','confirmed','shipped','delivered','cancelled'] },
            total_amount: { type: 'number',  example: 179.98 },
            notes:        { type: 'string',  example: 'Leave at door' },
            created_at:   { type: 'string',  format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
