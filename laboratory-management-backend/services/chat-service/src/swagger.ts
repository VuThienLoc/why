// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const PORT = 8000;

const doc = {
  info: {
    version: "v1.0.0",
    title: "AI Chat Service API",
    description: "AI Chat Service API",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${PORT}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  tags: [
    {
      name: "AI Chat",
      description: "AI Chat operations",
    },
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description:
        "JWT access token stored in HTTP-only cookie. Set automatically on login.",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
