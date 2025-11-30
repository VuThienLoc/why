import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/database.config.js";
import routes from "./routes/index.js";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load monitoring service specific .env with override
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env"), override: true });

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Internal-API-Key", "X-Access-Token"],
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Monitoring Service is running!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Monitoring Service Started Successfully!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📍 Server URL:     http://localhost:${PORT}`);
  console.log(`📚 Swagger UI:     http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API Endpoint:   http://localhost:${PORT}/api`);
  console.log(`💾 Database:       Monitoring Service`);
  console.log(`${"=".repeat(60)}\n`);
});

export default app;
