import Joi from "joi";

export const createInstrumentSchema = Joi.object({
  instrument_name: Joi.string().trim().max(255).required(),
  instrument_type: Joi.string().trim().max(100).required(),
  manufacturer: Joi.string().trim().max(100).allow(""),
  location: Joi.string().trim().max(255).allow(""),
});

export const getInstrumentsSchema = Joi.object({
  status: Joi.string()
    .valid("Ready", "Processing", "Inactive")
    .optional(),
  is_active: Joi.boolean().optional(),
  manufacturer: Joi.string().trim().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
    .valid("created_at", "instrument_name")
    .default("created_at"),
});

export const updateInstrumentSchema = Joi.object({
  instrument_name: Joi.string().trim().max(255).optional(),
  instrument_type: Joi.string().trim().max(100).optional(),
  manufacturer: Joi.string().trim().max(100).optional(),
  location: Joi.string().trim().max(255).optional(),
  status: Joi.string()
    .valid("Ready", "Processing", "Inactive")
    .optional(),
  is_active: Joi.boolean().optional(),
}).min(1);
