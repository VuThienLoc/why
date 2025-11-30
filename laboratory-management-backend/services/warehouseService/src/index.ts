import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import connectDB from "./config/database.config.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDB();

// Swagger documentation
const swaggerDocument = JSON.parse(
  readFileSync(resolve(__dirname, "./swagger-output.json"), "utf-8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({
    message: "Warehouse Service Running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.WAREHOUSE_SERVICE_PORT || 5003;
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Warehouse Service Started Successfully!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📍 Server URL:     http://localhost:${PORT}`);
  console.log(`📚 Swagger UI:     http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API Endpoint:   http://localhost:${PORT}/api`);
  console.log(`💾 Database:       Warehouse Service`);
  console.log(`${"=".repeat(60)}\n`);
});
