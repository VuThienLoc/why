import "./config/env.config.js";
import express from "express";
import cors from "cors";

import connectDB from "./config/database.config.js";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { errorHandler, notFoundHandler } from "../../shared/src/utils/error.util.js";

import http from "http";
import { Server } from "socket.io";
import { handleSocketConnection } from "./controllers/socket.controller.js";

import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: process.env.WEB_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: process.env.WEB_URL || "http://localhost:5173",
    // credentials: true,
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  },
});

handleSocketConnection(io);

connectDB();

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Message Service is running!");
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4001;
server.listen(port, () => {
  console.log(`Message Service listening on http://localhost:${port}`);
});

