// role.validator.ts
import Joi from "joi";
import { validatePrivileges } from "../utils/validation.util.js";
import { isValidRoleCode } from "../constants/roles.constant.js";

export const createRoleSchema = Joi.object({
  roleCode: Joi.string().required().messages({
    'string.empty': 'Role code is required',
    'any.required': 'Role code is required'
  }).custom((value, helpers) => {
    if (!isValidRoleCode(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  roleName: Joi.string().required().messages({
    'string.empty': 'Role name is required',
    'any.required': 'Role name is required'
  }),
  description: Joi.string().allow('').optional(),
  isSystemRole: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  privileges: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!validatePrivileges(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .default([])
    .messages({
      'any.invalid': 'Invalid privilege code: {{#value}}',
      'array.base': 'Privileges must be an array of strings'
    })
}).options({ abortEarly: false });

export const updateRoleSchema = Joi.object({
  roleCode: Joi.string().messages({
    'string.empty': 'Role code cannot be empty'
  }).custom((value, helpers) => {
    if (!isValidRoleCode(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  roleName: Joi.string().messages({
    'string.empty': 'Role name cannot be empty'
  }),
  description: Joi.string().allow('').optional(),
  isSystemRole: Joi.boolean(),
  isActive: Joi.boolean(),
  privileges: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!validatePrivileges(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .messages({
      'any.invalid': 'Invalid privilege code: {{#value}}',
      'array.base': 'Privileges must be an array of strings'
    })
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update'
  })
  .options({ abortEarly: false });