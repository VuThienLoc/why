// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const PORT = 5003;

const doc = {
  info: {
    version: "v1.0.0",
    title: "Warehouse Service API",
    description:
      "Inventory, instrument, and reagent management microservice for the Laboratory Information Management System.",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${PORT}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  tags: [
    {
      name: "Instruments",
    },
  ],
  securityDefinitions: {
    internalApiKey: {
      type: "apiKey",
      in: "header",
      name: "x-internal-api-key",
      description: "Internal microservice API key provided by IAM Service.",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
