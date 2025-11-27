import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AFH Hunting Engine API',
      version: '1.0.0',
      description: 'API for the 10-step hunting model business development platform',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.huntingplatform.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Hunt: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            subChannel: { type: 'string' },
            markets: { type: 'array', items: { type: 'string' } },
            focusBrands: { type: 'array', items: { type: 'string' } },
            accounts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Account' },
            },
            huntResult: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                totalAccounts: { type: 'number' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            markets: { type: 'array', items: { type: 'string' } },
            segment: { type: 'string' },
            score: { type: 'number', minimum: 0, maximum: 100 },
            currentStep: { type: 'number', minimum: 1, maximum: 10 },
            rationale: { type: 'string' },
            ideas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            stage: { type: 'string' },
            steps: {
              type: 'array',
              items: { $ref: '#/components/schemas/Step' },
            },
          },
        },
        Step: {
          type: 'object',
          properties: {
            step: { type: 'number', minimum: 1, maximum: 10 },
            name: { type: 'string' },
            note: { type: 'string' },
          },
        },
        Playbook: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            subChannel: { type: 'string' },
            version: { type: 'number' },
            contentMd: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/hunts': {
        post: {
          summary: 'Create a new hunt',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    subChannel: { type: 'string' },
                    markets: { type: 'array', items: { type: 'string' } },
                    focusBrands: { type: 'array', items: { type: 'string' } },
                    maxAccounts: { type: 'number' },
                  },
                  required: ['subChannel', 'markets', 'focusBrands'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Hunt created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Hunt' },
                },
              },
            },
            400: { description: 'Invalid input' },
          },
        },
        get: {
          summary: 'List all hunts',
          parameters: [
            {
              name: 'subChannel',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'number', default: 20 },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'number', default: 0 },
            },
          ],
          responses: {
            200: {
              description: 'List of hunts',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Hunt' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          limit: { type: 'number' },
                          offset: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const specs = swaggerJsdoc(options);
