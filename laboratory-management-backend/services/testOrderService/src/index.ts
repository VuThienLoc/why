import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import connectDB from "./config/database.config.js";
import testOrderRoutes from "./routes/testOrder.routes.js";
import testItemRoutes from "./routes/testItem.routes.js"
import testResultRoutes from "./routes/testResult.routes.js"
import { writeFileSync } from "fs";
import yaml from 'js-yaml';
// Load environment variables
dotenv.config({ path: "./services/testOrderService/.env" });

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDB();
// Đọc và parse YAML
const swaggerYaml = readFileSync("./services/testOrderService/src/swagger.yaml", "utf-8");
const swaggerDocument = yaml.load(swaggerYaml) as Record<string, any>;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Routes
app.use("/api", testOrderRoutes);
app.use("/api", testItemRoutes);
app.use("/api/testResult", testResultRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "TestOrder Service Running",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.TESTORDER_SERVICE_PORT || 5002;
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TestOrder Service Started Successfully!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📍Server URL:     http://localhost:${PORT}`);
  console.log(`📚Swagger UI:     http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API Endpoint:   http://localhost:${PORT}/api`);
  console.log(`🔗Database:       TestOrder Service`);
  console.log(`${"=".repeat(60)}\n`);
});
