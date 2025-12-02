require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// MongoDB Schemas
const huntSchema = new mongoose.Schema({
  subChannel: { type: String, required: true },
  markets: [String],
  focusBrands: [String],
  maxAccounts: { type: Number, default: 10 },
  currentStep: { type: Number, default: 1, min: 1, max: 10 },
  accounts: [{
    name: String,
    score: Number,
    step: Number,
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Hunt = mongoose.model('Hunt', huntSchema);

// Helper function to format hunt response
const formatHuntResponse = (hunt) => {
  return {
    id: hunt._id.toString(),
    subChannel: hunt.subChannel,
    markets: hunt.markets,
    focusBrands: hunt.focusBrands,
    accounts: hunt.accounts,
    huntResult: {
      summary: `Hunt for ${hunt.subChannel}`,
      totalAccounts: hunt.accounts.length
    },
    createdAt: hunt.createdAt
  };
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

// Create a new hunt
app.post('/api/hunts', async (req, res) => {
  try {
    const { subChannel, markets, focusBrands, maxAccounts } = req.body;

    if (!subChannel) {
      return res.status(400).json({ error: 'Sub-channel is required' });
    }

    let marketsList = [];
    let brandsList = [];
    
    if (typeof markets === 'string') {
      marketsList = markets.split(',').map(m => m.trim()).filter(m => m);
    } else if (Array.isArray(markets)) {
      marketsList = markets;
    }
    
    if (typeof focusBrands === 'string') {
      brandsList = focusBrands.split(',').map(b => b.trim()).filter(b => b);
    } else if (Array.isArray(focusBrands)) {
      brandsList = focusBrands;
    }

    const hunt = new Hunt({
      subChannel,
      markets: marketsList,
      focusBrands: brandsList,
      maxAccounts: maxAccounts || 10,
      currentStep: 1,
      accounts: []
    });

    await hunt.save();

    console.log(`✓ Hunt created: ${subChannel}`);
    res.status(201).json(formatHuntResponse(hunt));
  } catch (error) {
    console.error('Error creating hunt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all hunts
app.get('/api/hunts', async (req, res) => {
  try {
    const hunts = await Hunt.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: hunts.map(formatHuntResponse),
      pagination: {
        total: hunts.length,
        limit: 20,
        offset: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching hunts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific hunt
app.get('/api/hunts/:id', async (req, res) => {
  try {
    const hunt = await Hunt.findById(req.params.id);
    
    if (!hunt) {
      return res.status(404).json({ error: 'Hunt not found' });
    }

    res.json(formatHuntResponse(hunt));
  } catch (error) {
    console.error('Error fetching hunt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hunt step
app.put('/api/hunts/:id/step', async (req, res) => {
  try {
    const { step } = req.body;

    const hunt = await Hunt.findByIdAndUpdate(
      req.params.id,
      { 
        currentStep: step,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!hunt) {
      return res.status(404).json({ error: 'Hunt not found' });
    }

    res.json(formatHuntResponse(hunt));
  } catch (error) {
    console.error('Error updating hunt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add account to hunt
app.post('/api/hunts/:id/accounts', async (req, res) => {
  try {
    const { name, score, step, notes } = req.body;

    const hunt = await Hunt.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          accounts: { name, score, step, notes }
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!hunt) {
      return res.status(404).json({ error: 'Hunt not found' });
    }

    res.json(formatHuntResponse(hunt));
  } catch (error) {
    console.error('Error adding account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate playbook
app.post('/api/playbooks/:subChannel', async (req, res) => {
  try {
    const { subChannel } = req.params;
    const hunt = await Hunt.findOne({ subChannel });

    if (!hunt) {
      return res.status(404).json({ error: 'Hunt not found' });
    }

    const contentMd = `# ${subChannel} Hunting Playbook\n\n## Overview\nHunt for ${subChannel} with focus on ${hunt.focusBrands.join(', ')} in ${hunt.markets.join(', ')}.\n\n## 10-Step Hunting Model\n\n1. **Define Opportunity** - Clarify sub-channel: ${subChannel}\n2. **Scan Universe** - Build long-list of potential customers\n3. **Prioritise & Score** - Rank targets on scale and reach\n4. **Insight & Hypothesis** - Form hypotheses on needs\n5. **PepsiCo Value Proposition** - Design platform ideas\n6. **Internal Alignment** - Identify BU engagement\n7. **Approach Plan** - Define route in\n8. **Discovery & Qualification** - First contact\n9. **Proposal & Negotiation** - Shape proposal\n10. **Pilot & Learn** - Pilot design\n\n## Accounts (${hunt.accounts.length})\n${hunt.accounts.length > 0 ? hunt.accounts.map((a, i) => `${i + 1}. ${a.name} (Score: ${a.score})`).join('\n') : 'No accounts yet'}`;

    res.status(201).json({
      id: hunt._id.toString(),
      subChannel,
      version: 1,
      contentMd,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error generating playbook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get playbook
app.get('/api/playbooks/:subChannel', async (req, res) => {
  try {
    const { subChannel } = req.params;
    const hunt = await Hunt.findOne({ subChannel });

    if (!hunt) {
      return res.status(404).json({ error: 'Hunt not found' });
    }

    const contentMd = `# ${subChannel} Hunting Playbook\n\n## Overview\nHunt for ${subChannel} with focus on ${hunt.focusBrands.join(', ')} in ${hunt.markets.join(', ')}.\n\n## 10-Step Hunting Model\n\n1. **Define Opportunity** - Clarify sub-channel: ${subChannel}\n2. **Scan Universe** - Build long-list of potential customers\n3. **Prioritise & Score** - Rank targets on scale and reach\n4. **Insight & Hypothesis** - Form hypotheses on needs\n5. **PepsiCo Value Proposition** - Design platform ideas\n6. **Internal Alignment** - Identify BU engagement\n7. **Approach Plan** - Define route in\n8. **Discovery & Qualification** - First contact\n9. **Proposal & Negotiation** - Shape proposal\n10. **Pilot & Learn** - Pilot design\n\n## Accounts (${hunt.accounts.length})\n${hunt.accounts.length > 0 ? hunt.accounts.map((a, i) => `${i + 1}. ${a.name} (Score: ${a.score})`).join('\n') : 'No accounts yet'}`;

    res.json({
      id: hunt._id.toString(),
      subChannel,
      version: 1,
      contentMd,
      createdAt: hunt.createdAt
    });
  } catch (error) {
    console.error('Error fetching playbook:', error);
    res.status(500).json({ error: error.message });
  }
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
    await connectDB();
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
