import express from "express";
import { sendEmail, resetPassword } from "../../controllers/email.controller.js";
import { validateEmailLink, validateResetPassword } from "../../middlewares/validate.middleware.js";

/*
  #swagger.tags = ['Audit Logs']
  #swagger.security = [{"apiKeyAuth": []}]
*/

const router = express.Router();

router.post('/request', validateEmailLink, sendEmail);
router.post('/confirm', validateResetPassword, resetPassword);

export default router;