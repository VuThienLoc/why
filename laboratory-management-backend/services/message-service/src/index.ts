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
import { corsOptions } from "../../shared/src/utils/cors.util.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Reuse same logic as corsOptions.origin
      (corsOptions as any).origin(origin, callback);
    },
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
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

