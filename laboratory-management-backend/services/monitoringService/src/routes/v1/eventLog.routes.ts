import express from "express";
import {
  createEventLog,
  getAllEventLogs,
  getEventLogById,
  getEventStatistics,
  deleteEventLog,
} from "../../controllers/eventLog.controller.js";
import authenticateUser from "../../middlewares/authenticate.middleware.js";
import { authenticateInternalApi, isInternalApiKeyValid } from "../../middlewares/internalApi.middleware.js";

const router = express.Router();

// Public routes (with authentication)
router.get("/", authenticateUser.authenticateUser, getAllEventLogs);
router.get("/statistics", authenticateUser.authenticateUser, getEventStatistics);
router.get("/:id", authenticateUser.authenticateUser, getEventLogById);

// Internal route for creating event logs
router.post("/", authenticateInternalApi, createEventLog);

const attachUserContextFromHeaders = (req: express.Request): void => {
  const rawUserId = req.headers["x-user-id"] ?? req.headers["x-operator-id"] ?? req.headers["x-actor-id"];
  const rawUserEmail =
    req.headers["x-user-email"] ?? req.headers["x-operator-email"] ?? req.headers["x-actor-email"];

  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  const userEmail = Array.isArray(rawUserEmail) ? rawUserEmail[0] : rawUserEmail;

  if (typeof userId === "string" && userId.trim().length > 0) {
    (req as any).userId = userId.trim();
  }

  if (typeof userEmail === "string" && userEmail.trim().length > 0) {
    (req as any).userEmail = userEmail.trim();
  }
};

const hasUserToken = (req: express.Request): boolean => {
  const bearer = typeof req.headers.authorization === "string" && req.headers.authorization.trim().length > 0;
  const accessHeader = typeof req.headers["x-access-token"] === "string" &&
    req.headers["x-access-token"].trim().length > 0;
  const cookieTokenSource = (req as any).cookies?.accessToken;
  const cookieToken = typeof cookieTokenSource === "string" && cookieTokenSource.trim().length > 0;
  return Boolean(bearer || accessHeader || cookieToken);
};

const authorizeDeleteAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  attachUserContextFromHeaders(req);

  if (isInternalApiKeyValid(req)) {
    next();
    return;
  }

  if (hasUserToken(req)) {
    authenticateUser.authenticateUser(req, res, next);
    return;
  }

  authenticateInternalApi(req, res, next);
};

router.delete("/:id", authorizeDeleteAccess, deleteEventLog);

export default router;
