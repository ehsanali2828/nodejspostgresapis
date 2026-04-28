require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const swaggerUi      = require('swagger-ui-express');
const swaggerSpec    = require('./config/swagger');

const authRoutes     = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes  = require('./routes/products');
const orderRoutes    = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ───────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Retail API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Retail API running at http://localhost:${PORT}`);
  console.log(`📖  Swagger docs  →  http://localhost:${PORT}/api-docs`);
  console.log(`❤️   Health check  →  http://localhost:${PORT}/health\n`);
});

module.exports = app;
