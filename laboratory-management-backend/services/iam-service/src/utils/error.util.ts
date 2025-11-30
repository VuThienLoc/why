import type { Request, Response, NextFunction } from "express";


export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// export const errorHandler = (res: Response, error: any) => {
//   const status = typeof error?.status === "number" ? error.status : 500;
//   const message = error?.message || "Server Error!";

//   console.error('Error details:', error);

//   res.status(status).json({
//     error: error?.message ?? message
//   });
// };