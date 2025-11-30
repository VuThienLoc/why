import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v1.0.0',
    title: 'Laboratory Information Management System API',
    description: 'Laboratory Information Management System API'
  },
  host: `localhost:${process.env.PORT || 4001}`,
  basePath: '/api',
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'Message Service',
      description: 'Message service operations (requires authentication)'
    },
    {
      name: 'Room Service',
      description: 'Room service operations (requires authentication)'
    },
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
