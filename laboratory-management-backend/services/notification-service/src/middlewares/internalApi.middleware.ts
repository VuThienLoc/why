import type { Request, Response, NextFunction } from "express";

export const authenticateInternalApi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = (req.get("X-Internal-API-Key") || req.headers["x-internal-api-key"]) as
    | string
    | undefined;
  const expectedApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";

  if (!apiKey) {
    res.status(401).json({
      message: "Internal API key is required",
      error: "INTERNAL_API_KEY_MISSING",
    });
    return;
  }

  if (apiKey !== expectedApiKey) {
    res.status(403).json({
      message: "Invalid internal API key",
      error: "INVALID_INTERNAL_API_KEY",
    });
    return;
  }

  next();
};

export default authenticateInternalApi;
