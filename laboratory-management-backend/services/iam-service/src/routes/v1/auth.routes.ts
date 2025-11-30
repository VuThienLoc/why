import { refreshToken, loginUser, logoutUser, registerUser } from "../../controllers/auth.controller.js";
import { googleLogin, googleCallback, getOAuthStatus, linkOAuthAccount } from "../../controllers/oauth.controller.js";
import { validateCreateUser } from "../../middlewares/validate.middleware.js";
import express from "express";
import authenticateUser from "../../middlewares/authenticate.middleware.js";


const router = express.Router();

router.post("/register", validateCreateUser, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", authenticateUser.refreshTokenValidation, refreshToken);

// Google OAuth routes
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/oauth/status", authenticateUser.authenticateUser, getOAuthStatus);
router.post("/oauth/link", authenticateUser.authenticateUser, linkOAuthAccount);

export default router;