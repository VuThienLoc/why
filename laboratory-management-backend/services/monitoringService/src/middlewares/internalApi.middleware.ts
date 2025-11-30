import type { Request, Response, NextFunction } from "express";

const resolveInternalApiKey = (req: Request): string | undefined => {
  const headerValue = req.get("X-Internal-API-Key") ?? req.headers["x-internal-api-key"];
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }
  if (typeof headerValue === "string" && headerValue.trim().length > 0) {
    return headerValue.trim();
  }
  return undefined;
};

export const isInternalApiKeyValid = (req: Request): boolean => {
  const apiKey = resolveInternalApiKey(req);
  const expectedKey = process.env.INTERNAL_API_KEY?.trim();
  if (!expectedKey) {
    console.warn("[MonitoringService] INTERNAL_API_KEY not configured");
    return false;
  }
  return apiKey === expectedKey;
};

export const authenticateInternalApi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = resolveInternalApiKey(req);
  if (!apiKey) {
    res.status(401).json({ message: "Internal API key is required" });
    return;
  }

  if (!isInternalApiKeyValid(req)) {
    res.status(403).json({ message: "Invalid internal API key" });
    return;
  }

  next();
};
