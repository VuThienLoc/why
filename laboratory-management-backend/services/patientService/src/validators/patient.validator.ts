import Joi from "joi";

export const createPatientSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name cannot exceed 100 characters",
  }),
  identityNumber: Joi.string().required().messages({
    "string.empty": "Identity number is required",
  }),
  email: Joi.string().email().optional().allow("").messages({
    "string.email": "Invalid email format",
  }),
  phoneNumber: Joi.string().optional().allow(""),
  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "Gender must be male, female, or other",
    "string.empty": "Gender is required",
  }),
  age: Joi.number().integer().min(0).max(150).required().messages({
    "number.base": "Age must be a number",
    "number.min": "Age must be at least 0",
    "number.max": "Age cannot exceed 150",
  }),
  dateOfBirth: Joi.date().required().messages({
    "date.base": "Invalid date of birth format",
  }),
  address: Joi.string().optional().allow(""),
  city: Joi.string().optional().allow(""),
  country: Joi.string().optional().allow(""),
  emergencyContact: Joi.object({
    name: Joi.string().optional().allow(""),
    relationship: Joi.string().optional().allow(""),
    phoneNumber: Joi.string().optional().allow(""),
  }).optional(),
  medicalHistory: Joi.string().optional().allow(""),
  allergies: Joi.array().items(Joi.string()).optional(),
  bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "").optional(),
  insurance: Joi.object({
    provider: Joi.string().optional().allow(""),
    policyNumber: Joi.string().optional().allow(""),
    expiryDate: Joi.date().optional(),
  }).optional(),
});

export const updatePatientSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional().allow(""),
  phoneNumber: Joi.string().optional().allow(""),
  gender: Joi.string().valid("male", "female", "other").optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional().allow(""),
  city: Joi.string().optional().allow(""),
  country: Joi.string().optional().allow(""),
  emergencyContact: Joi.object({
    name: Joi.string().optional().allow(""),
    relationship: Joi.string().optional().allow(""),
    phoneNumber: Joi.string().optional().allow(""),
  }).optional(),
  medicalHistory: Joi.string().optional().allow(""),
  allergies: Joi.array().items(Joi.string()).optional(),
  bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "").optional(),
  insurance: Joi.object({
    provider: Joi.string().optional().allow(""),
    policyNumber: Joi.string().optional().allow(""),
    expiryDate: Joi.date().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});
