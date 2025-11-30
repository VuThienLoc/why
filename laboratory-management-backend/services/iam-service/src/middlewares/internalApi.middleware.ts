import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to authenticate internal API calls from other microservices
 * Uses X-Internal-API-Key header for authentication
 */
export const authenticateInternalApi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Express lower-cases incoming header keys; use req.get which is case-insensitive
  const apiKey = (req.get("X-Internal-API-Key") || req.headers["x-internal-api-key"]) as string | undefined;
  const expectedApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
console.log("🔑 Internal API middleware triggered");
console.log("Header key:", req.headers["X-Internal-API-Key"]);
console.log("Expected key:", expectedApiKey);
console.log("ENV INTERNAL_API_KEY =", process.env.INTERNAL_API_KEY);


  if (!apiKey) {
    res.status(401).json({ 
      message: "Internal API key is required",
      error: "INTERNAL_API_KEY_MISSING" 
    });
    return;
  }

  if (apiKey !== expectedApiKey) {
    res.status(403).json({ 
      message: "Invalid internal API key",
      error: "INVALID_INTERNAL_API_KEY" 
    });
    return;
  }

  // API key is valid, proceed to next middleware/controller
  next();
};

export default authenticateInternalApi;
