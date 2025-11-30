import type { Request, Response, NextFunction } from "express";

const getInternalApiKeyFromRequest = (req: Request): string | undefined => {
  const rawHeader = req.headers["x-internal-api-key"] ?? req.headers["X-Internal-API-Key"];
  return Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
};

export const isInternalApiKeyValid = (req: Request): boolean => {
  const expectedKey = process.env.INTERNAL_API_KEY?.trim();
  if (!expectedKey) {
    return false;
  }

  const apiKey = getInternalApiKeyFromRequest(req)?.trim();
  return Boolean(apiKey) && apiKey === expectedKey;
};

const authenticateInternalApi = (req: Request, res: Response, next: NextFunction): void => {
  const expectedKey = process.env.INTERNAL_API_KEY?.trim();

  if (!expectedKey) {
    res.status(500).json({ message: "Internal API not configured" });
    return;
  }

  if (!isInternalApiKeyValid(req)) {
    res.status(401).json({ message: "Invalid or missing internal API key" });
    return;
  }

  next();
};

export default authenticateInternalApi;
