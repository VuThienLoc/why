import type { Request, Response, NextFunction } from "express";
import type { Schema } from "joi";

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      res.status(400).json({
        message: "Validation failed",
        errors,
      });
      return;
    }

    req.body = value;
    next();
  };
};
