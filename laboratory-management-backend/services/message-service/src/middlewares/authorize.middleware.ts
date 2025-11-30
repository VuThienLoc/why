import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/src/utils/error.util.js";

export const authorizeRoles = (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as { role?: string[] };

    if (!auth?.role || !Array.isArray(auth.role)) {
      return next(new AppError(403, "Forbidden permission"));
    }

    const hasRole = auth.role.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return next(new AppError(403, "You are not allowed to access chat"));
    }

    next();
  };