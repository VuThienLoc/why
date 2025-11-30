import express from "express";
import eventLogRoutes from "./v1/eventLog.routes.js";
import eventCodeRoutes from "./v1/eventCode.routes.js";

const router = express.Router();

// Mount routes
router.use("/event-logs", eventLogRoutes);
router.use("/event-codes", eventCodeRoutes);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Monitoring Service",
    timestamp: new Date().toISOString(),
  });
});

export default router;
