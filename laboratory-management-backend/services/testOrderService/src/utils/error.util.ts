import type { Response } from "express";

export const errorHandler = (res: Response, error: unknown): void => {
  console.error("Error:", error);

  if (error instanceof Error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } else {
    res.status(500).json({
      message: "An unknown error occurred",
    });
  }
};
