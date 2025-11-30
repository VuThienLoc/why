import type {Request, Response, NextFunction} from "express";
import type { Schema } from "joi";

type ValidationSource = "body" | "query" | "params";

export const createValidator = (schema: Schema, source: ValidationSource = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const valueToValidate = (req as any)[source];
    const { error } = schema.validate(valueToValidate);

    if (error?.details?.[0]?.message) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next();
  };
