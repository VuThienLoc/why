import type { Response } from "express";

export const errorHandler = (res: Response, error: unknown): void => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } else {
    console.error("Unknown error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: String(error),
    });
  }
};
