import express from "express";
import { authenticateInternalApi } from "../middlewares/internalApi.middleware.js";
import { getUser, searchUsersInternal } from "../controllers/user.controller.js";
import userRoutes from "./v1/user.routes.js";
import authRoutes from "./v1/auth.routes.js";
import roleRoutes from "./v1/role.routes.js";
import logRoutes from "./v1/log.routes.js"
import emailRoutes from "./v1/email.routes.js"

import authenticateUser from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// ✅ Internal routes (không yêu cầu JWT)
router.get("/internal/:id", authenticateInternalApi, getUser);
router.get("/internal/users/search", authenticateInternalApi, searchUsersInternal);

router.use("/", authRoutes);
router.use("/reset-password", emailRoutes);
router.use("/user", authenticateUser.authenticateUser as any, userRoutes);
router.use("/role", authenticateUser.authenticateUser as any, roleRoutes);
router.use("/log", authenticateUser.authenticateUser as any, logRoutes);


export default router;
