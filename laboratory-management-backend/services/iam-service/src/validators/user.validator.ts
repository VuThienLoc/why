import Joi from "joi";
import { validateRole } from "../utils/validation.util.js";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
  fullName: Joi.string().min(1).required().messages({
    "string.min": "Full name must be at least 1 character long",
    "any.required": "Full name is required",
  }),
  identityNumber: Joi.string().min(9).max(12).required().messages({
    "string.min": "Identity number must be at least 9 characters long",
    "string.max": "Identity number must be at most 12 characters long",
    "any.required": "Identity number is required",
  }),
  gender: Joi.string().valid("Male", "Female", "Other", "MALE", "FEMALE", "OTHER").required().messages({
    "string.valid": "Invalid gender",
    "any.required": "Gender is required",
  }),
  age: Joi.number().integer().min(0).required().messages({
    "number.integer": "Age must be an integer",
    "number.min": "Age must be at least 0",
    "any.required": "Age is required",
  }),
  dateOfBirth: Joi.date().required().messages({
    "date.base": "Invalid date of birth",
    "any.required": "Date of birth is required",
  }),
  phoneNumber: Joi.string()
    .regex(/^[0-9]{10}$/)
    .min(1)
    .required()
    .messages({
      "string.min": "Phone number must be at least 1 character long",
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be 10 digits",
    }),
  address: Joi.string().min(1).required().messages({
    "string.min": "Address must be at least 1 character long",
    "any.required": "Address is required",
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
  role: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!validateRole(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
    )
    .messages({
      "any.invalid": "Invalid role code",
    }),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.email": "Invalid email address",
  }),
  fullName: Joi.string().min(1).messages({
    "string.min": "Full name must be at least 1 character long",
  }),
  identityNumber: Joi.string().min(9).max(12).messages({
    "string.min": "Identity number must be at least 9 characters long",
    "string.max": "Identity number must be at most 12 characters long",
  }),
  gender: Joi.string().valid("Male", "Female", "Other", "MALE", "FEMALE", "OTHER").messages({
    "string.valid": "Invalid gender",
  }),
  age: Joi.number().integer().min(0).messages({
    "number.integer": "Age must be an integer",
    "number.min": "Age must be at least 0",
  }),
  avatar: Joi.string().messages({
    "string.base": "Avatar must be a string",
  }),
  dateOfBirth: Joi.date().messages({
    "date.base": "Invalid date of birth",
  }),
  phoneNumber: Joi.string()
    .regex(/^[0-9]{10}$/)
    .min(1)
    .messages({
      "string.min": "Phone number must be at least 1 character long",
      "string.pattern.base": "Phone number must be 10 digits",
    }),
  address: Joi.string().min(1).messages({
    "string.min": "Address must be at least 1 character long",
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/)
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 30 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  }),
  isActive: Joi.boolean().default(true),
  role: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!validateRole(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
    )
    .messages({
      "any.invalid": "Invalid role code",
    }),
}).min(1);
