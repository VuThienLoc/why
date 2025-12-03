import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "../../shared/src/config/database.config.js";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { errorHandler, notFoundHandler } from "../../shared/src/utils/error.util.js";

import http from "http";
import { Server } from "socket.io";
import { handleNotificationSocketConnection } from "./controllers/notification.socket.controller.js";

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { corsOptions } from "../../shared/src/utils/cors.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cookieParser from "cookie-parser";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      (corsOptions as any).origin(origin, callback);
    },
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
  },
});

app.set("io", io);

handleNotificationSocketConnection(io);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Notification Service is running!");
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4002;
server.listen(port, () => {
  console.log(`Message Service listening on http://localhost:${port}`);
});

