// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const PORT = 5004;

const doc = {
  info: {
    version: "v1.0.0",
    title: "Monitoring Service API",
    description:
      "Monitoring microservice for Laboratory Management System. Captures cross-service event logs and event code references.",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${PORT}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
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
