require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://huntingplatform.netlify.app';

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://huntingplatform.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AFH Hunting Engine API',
      version: '1.0.0',
      description: 'API for the 10-step hunting model business development platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: [],
};

const specs = swaggerJsdoc(swaggerOptions);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Placeholder routes
app.post('/api/hunts', (req, res) => {
  res.status(201).json({
    message: 'Hunt creation endpoint',
    received: req.body,
  });
});

app.get('/api/hunts', (req, res) => {
  res.json({
    data: [],
    pagination: {
      total: 0,
      limit: 20,
      offset: 0,
    },
  });
});

app.post('/api/playbooks/:subChannel', (req, res) => {
  res.status(201).json({
    message: 'Playbook generation endpoint',
    subChannel: req.params.subChannel,
  });
});

app.get('/api/playbooks/:subChannel', (req, res) => {
  res.json({
    message: 'Playbook retrieval endpoint',
    subChannel: req.params.subChannel,
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AFH Hunting Engine API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      hunts: '/api/hunts',
      playbooks: '/api/playbooks/:subChannel',
      docs: '/api/docs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
