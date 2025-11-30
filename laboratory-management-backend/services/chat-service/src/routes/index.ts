import express from "express";
import chatRouter from "./chat.route.js";
import authenticateUser from "../../../shared/src/middleware/authenticate.middleware.js"

const router = express.Router();

router.use("/chat", authenticateUser.authenticateUser, chatRouter);

export default router;
