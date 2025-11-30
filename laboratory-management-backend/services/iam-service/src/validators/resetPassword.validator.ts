import Joi from "joi";

export const emailLinkSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
});

export const resetPasswordSchema = Joi.object({
  dedicatedToken: Joi.string().required().messages({
    "any.required": "Dedicated token is required",
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/)
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 30 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  }),
});
