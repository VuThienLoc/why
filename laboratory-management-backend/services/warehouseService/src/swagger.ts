import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v1.0.0',
    title: 'Warehouse Service API',
    description: 'Inventory, instrument, and reagent management microservice for the Laboratory Information Management System.'
  },
  host: `localhost:${process.env.WAREHOUSE_SERVICE_PORT || 5003}`,
  basePath: '/api',
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'Instruments',
    }
  ],
  securityDefinitions: {
    internalApiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'x-internal-api-key',
      description: 'Internal microservice API key provided by IAM Service.'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
