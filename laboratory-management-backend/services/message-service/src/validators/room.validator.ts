// role.validator.ts
import Joi from "joi";

export const createRoomSchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Room name is required',
    'any.required': 'Room name is required'
  }),
  participants: Joi.array().required().messages({
    'array.empty': 'Participants are required',
    'any.required': 'Participants are required'
  }),
})

export const updateRoomSchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Room name is required',
    'any.required': 'Room name is required'
  }),
  participants: Joi.array().messages({
    'array.empty': 'Participants are required',
    'any.required': 'Participants are required'
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update'
  })
  .options({ abortEarly: false });
