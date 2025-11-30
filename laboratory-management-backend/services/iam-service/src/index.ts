import "./config/env.config.js";

import express from "express";
import passport from "passport";

import routes from "./routes/index.js";

import connectDB from "./config/database.config.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json"};

import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

// Import OAuth config to initialize Passport strategies
import "./config/oauth.config.js";

console.log('[IAM Service] Environment loaded:');
console.log('[IAM Service] PORT:', process.env.PORT);
console.log('[IAM Service] INTERNAL_API_KEY:', process.env.INTERNAL_API_KEY ? '***' + process.env.INTERNAL_API_KEY.slice(-4) : 'NOT SET');
console.log('[IAM Service] PATIENT_SERVICE_URL:', process.env.PATIENT_SERVICE_URL);

// Add error handlers early for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();
const corsOptions = {
  origin: process.env.WEB_URL,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


connectDB();

app.use(express.json());
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

app.use("/api", routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("JWT Authentication System is running!");
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
