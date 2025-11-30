import express from "express";
import {
	createPatient,
	deletePatient,
	getAllPatients,
	getPatientById,
	updatePatient,
	softDeletePatientByUserId,
} from "../../controllers/patient.controller.js";
import authenticateUser from "../../middlewares/authenticate.middleware.js";
import { isInternalApiKeyValid } from "../../middlewares/internalApi.middleware.js";

const router = express.Router();

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

// Allow internal microservice key or fallback to JWT cookies for mutations
const authorizeWriteAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	attachUserContextFromHeaders(req);

	if (isInternalApiKeyValid(req)) {
		if (hasUserToken(req)) {
			authenticateUser.authenticateUser(req, res, next);
			return;
		}
		next();
		return;
	}

	authenticateUser.authenticateUser(req, res, next);
};

// Internal API only middleware
const requireInternalApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	attachUserContextFromHeaders(req);

	if (!isInternalApiKeyValid(req)) {
		res.status(403).json({ message: "Forbidden: Internal API access only" });
		return;
	}

	if (hasUserToken(req)) {
		authenticateUser.authenticateUser(req, res, next);
		return;
	}
	next();
};

// [GET] List patients with pagination and search
router.get("/getAll/", getAllPatients);

// [GET] View patient detail
router.get("/viewDetail/:id", getPatientById);

// [POST] Create patient (IAM internal use)
router.post("/create/", authorizeWriteAccess, createPatient);

// [PUT] Update patient
router.put("/update/:id", authorizeWriteAccess, updatePatient);

// [DELETE] Delete patient
router.delete("/delete/:id", authorizeWriteAccess, deletePatient);

// [DELETE] Soft delete patient by user ID (Internal API only)
router.delete("/soft-delete-by-user/:userId", requireInternalApiKey, softDeletePatientByUserId);

export default router;
