import express from "express";
import notificationRoutes from "./notification.route.js";
import authenticateUser from "../../../shared/src/middleware/authenticate.middleware.js";
import authenticateInternalApi from "../middlewares/internalApi.middleware.js";

const router = express.Router();

router.use("/notifications", authenticateUser.authenticateUser, notificationRoutes);
router.use("/internal/notifications", authenticateInternalApi, notificationRoutes);

export default router;
