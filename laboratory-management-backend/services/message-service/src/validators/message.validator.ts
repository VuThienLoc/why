// role.validator.ts
import Joi from "joi";

export const createMessageSchema = Joi.object({
  text: Joi.string().required().messages({
    "string.empty": "Can not send an empty message",
    "any.required": "Message content is required",
  }),
});

export const updateMessageSchema = Joi.object({
  text: Joi.string().messages({
    "string.empty": "Can not send an empty message",
    "any.required": "Message content is required",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  })
  .options({ abortEarly: false });
