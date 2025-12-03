import 'dotenv/config';
import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from "./config/database.config.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json"};

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import { corsOptions } from "../../shared/src/utils/cors.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app
const app: Express = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get port from environment variable or default to 8000
    const PORT = process.env.PORT_CHAT || 8000;
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Chat service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();


// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'chat-service' });
});

// API routes
app.use('/api', routes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

