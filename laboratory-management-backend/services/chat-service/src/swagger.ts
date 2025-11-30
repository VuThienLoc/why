import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v1.0.0',
    title: 'AI Chat Service API',
    description: 'AI Chat Service API'
  },
  host: `localhost:${process.env.PORT_CHAT || 8000}`,
  basePath: '/api',
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'AI Chat',
      description: 'AI Chat operations'
    }
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'JWT access token stored in HTTP-only cookie. Set automatically on login.'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
