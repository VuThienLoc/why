    import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v1.0.0",
    title: "Monitoring Service API",
    description:
      "Monitoring microservice for Laboratory Management System. Captures cross-service event logs and event code references.",
  },
  host: `localhost:${process.env.MONITORING_SERVICE_PORT || 5004}`,
  basePath: "/api",
  schemes: ["http", "https"],
  tags: [
    {
      name: "Event Logs",
      description: "Event logs management endpoints - Section 3.2.1",
    },
    {
      name: "Event Codes",
      description: "Event codes reference endpoints - Section 2.8",
    },
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "JWT token in format: Bearer <token>",
    },
    internalApiKey: {
      type: "apiKey",
      in: "header",
      name: "X-Internal-API-Key",
      description: "Internal service API key for trusted services",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
