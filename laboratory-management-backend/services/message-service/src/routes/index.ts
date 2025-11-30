
import express from "express";
import messageRoutes from "./message.route.js";
import roomRoutes from "./room.route.js";
import authenticateUser from "../../../shared/src/middleware/authenticate.middleware.js";

const router = express.Router();

router.use("/messages", authenticateUser.authenticateUser, messageRoutes);
router.use("/rooms", authenticateUser.authenticateUser, roomRoutes);

export default router;
