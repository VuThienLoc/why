// @ts-ignore - swagger-autogen doesn't have TypeScript definitions
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v1.0.0",
    title: "Laboratory Information Management System API",
    description: "Laboratory Information Management System API",
  },
  host:
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HOST
      : `localhost:${process.env.PORT || 3000}`,
  basePath: "/api",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  tags: [
    {
      name: "User CRUD",
      description: "User management operations (requires authentication)",
    },
    {
      name: "Role CRUD",
      description: "Role management operations (requires authentication)",
    },
    {
      name: "Audit Logs",
      description: "Audit log operations (requires admin authentication)",
    },
    {
      name: "Email Service",
      description: "Send reset password through email",
    },
    {
      name: "User Profile",
      description: "User profile operations (requires authentication)",
    },
    {
      name: "Authentication",
      description: "Authentication and authorization operations",
    },
    {
      name: "Additional",
      description:
        "Additional functions operations (requires authentication) (use if needed)",
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
