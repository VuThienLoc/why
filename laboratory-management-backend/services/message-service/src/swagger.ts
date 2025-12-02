// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const PORT = 4001;

const doc = {
  info: {
    version: "v1.0.0",
    title: "Laboratory Information Management System API",
    description: "Laboratory Information Management System API",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${PORT}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  tags: [
    {
      name: "Message Service",
      description: "Message service operations (requires authentication)",
    },
    {
      name: "Room Service",
      description: "Room service operations (requires authentication)",
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
