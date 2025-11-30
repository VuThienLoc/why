import express from "express";
import {
  getAllEventCodes,
  getEventCodeByCode,
  createEventCode,
  updateEventCode,
  deleteEventCode,
} from "../../controllers/eventCode.controller.js";
import authenticateUser from "../../middlewares/authenticate.middleware.js";
import { isInternalApiKeyValid } from "../../middlewares/internalApi.middleware.js";

const router = express.Router();

// Allow writing with either internal API key or authenticated user token
const authorizeEventCodeWrite = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (isInternalApiKeyValid(req)) {
    next();
    return;
  }

  authenticateUser.authenticateUser(req, res, next);
};

// Explicit internal-only middleware when needed
const requireInternalApiKey = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!isInternalApiKeyValid(req)) {
    res.status(403).json({ message: "Forbidden: Internal API access only" });
    return;
  }
  next();
};

// Public routes (require authentication)
router.get("/", authenticateUser.authenticateUser, getAllEventCodes);
router.get("/:code", authenticateUser.authenticateUser, getEventCodeByCode);

// Mutations accept either internal API key or authenticated user
router.post("/", authorizeEventCodeWrite, createEventCode);
router.put("/:code", authorizeEventCodeWrite, updateEventCode);

// Deactivation still reserved for internal API usage
router.delete("/:code", requireInternalApiKey, deleteEventCode);

export default router;
