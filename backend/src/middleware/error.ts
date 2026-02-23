import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Custom error classes for better error handling
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err.name, err.message);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      details: err.issues,
    });
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === "P2002") {
      return res.status(409).json({
        message: "A record with this value already exists",
        code: "DUPLICATE_ERROR",
        field: prismaError.meta?.target?.[0],
      });
    }
    if (prismaError.code === "P2025") {
      return res.status(404).json({
        message: "Record not found",
        code: "NOT_FOUND",
      });
    }
  }

  // Default error response
  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
