import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = "statusCode" in err && err.statusCode ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  const code = "code" in err ? err.code : undefined;
  const details = "details" in err ? err.details : undefined;

  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    path: req.path,
    method: req.method,
    code,
    details,
  });

  if (req.originalUrl === "/favicon.ico") {
    return res.status(statusCode).end();
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      code,
      details,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Not Found - ${req.method} ${req.originalUrl}`));
};
