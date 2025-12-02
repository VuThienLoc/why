// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const PORT = 5001;

const doc = {
  info: {
    version: "v1.0.0",
    title: "Patient Service API",
    description:
      "Patient Management Microservice for Laboratory Information Management System. Handles patient demographics, medical records, and access audit logs.",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${PORT}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  tags: [
    {
      name: "Patients",
      description: "Patient management operations (requires authentication)",
    },
    {
      name: "Patient Medical Records",
      description:
        "Sensitive medical record operations for authorized personnel",
    },
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description:
        "JWT access token stored in HTTP-only cookie. Set automatically on login from IAM Service.",
    },
    internalApiKey: {
      type: "apiKey",
      in: "header",
      name: "x-internal-api-key",
      description:
        "Internal microservice API key. Required for create/update/delete patient endpoints.",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
