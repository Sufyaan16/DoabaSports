import { NextResponse } from "next/server";
import { ZodError } from "zod";
import * as Sentry from "@sentry/nextjs";
import { ErrorCode, ErrorStatusCode, ErrorMessage } from "./error-codes";
import { logger } from "@/lib/logger";

/**
 * Standard API Error Response Format
 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

/**
 * API Success Response Format
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Configuration for error responses
 */
interface ErrorResponseOptions {
  code: ErrorCode;
  message?: string; // Override default message
  details?: any; // Additional context (hidden in production for 5xx errors)
  logError?: boolean; // Whether to log to console (default: true for 5xx)
  path?: string; // API endpoint path
  requestId?: string; // Request tracking ID
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if error should expose details based on status code
 * 5xx errors hide details in production for security
 */
function shouldExposeDetails(statusCode: number): boolean {
  return isDevelopment() || statusCode < 500;
}

/**
 * Create a standardized error response
 * @param options - Error configuration
 * @returns NextResponse with formatted error
 */
export function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const {
    code,
    message,
    details,
    logError = false,
    path,
    requestId,
  } = options;

  const statusCode = ErrorStatusCode[code];
  const defaultMessage = ErrorMessage[code];
  const finalMessage = message || defaultMessage;

  // Determine if we should include details
  const shouldIncludeDetails = shouldExposeDetails(statusCode) && details;

  // Build error response
  const errorResponse: ApiErrorResponse = {
    error: {
      code,
      message: finalMessage,
      ...(shouldIncludeDetails && { details }),
      timestamp: new Date().toISOString(),
      ...(path && { path }),
      ...(requestId && { requestId }),
    },
  };

  // Log errors based on severity
  if (logError || statusCode >= 500) {
    logger.error("API Error", {
      code,
      statusCode,
      message: finalMessage,
      details,
      path,
    });

    // Report 5xx errors to Sentry
    if (statusCode >= 500) {
      Sentry.captureMessage(`API Error: ${code}`, {
        level: "error",
        extra: { code, statusCode, message: finalMessage, details, path },
      });
    }
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create a success response
 * @param data - Response data
 * @param meta - Optional metadata
 * @returns NextResponse with formatted success
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta && {
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    }),
  };

  return NextResponse.json(response);
}

/**
 * Handle Zod validation errors
 * @param error - ZodError instance
 * @returns Formatted error response
 */
export function handleZodError(error: ZodError): NextResponse {
  const fieldErrors = error.flatten().fieldErrors;
  
  return createErrorResponse({
    code: ErrorCode.VALIDATION_FAILED,
    message: "Request validation failed",
    details: isDevelopment()
      ? { fields: fieldErrors, issues: error.issues }
      : { fields: fieldErrors },
  });
}

/**
 * Handle database errors
 * @param error - Database error
 * @param context - Additional context
 * @returns Formatted error response
 */
export function handleDatabaseError(error: any, context?: string): NextResponse {
  const isDev = isDevelopment();
  
  // Check for specific database constraint violations
  if (error.code === "23505") {
    // Unique constraint violation
    return createErrorResponse({
      code: ErrorCode.VALIDATION_DUPLICATE,
      details: isDev ? { constraint: error.constraint, detail: error.detail } : undefined,
      logError: true,
    });
  }

  if (error.code === "23503") {
    // Foreign key constraint violation
    return createErrorResponse({
      code: ErrorCode.VALIDATION_FAILED,
      message: "Invalid reference to related resource",
      details: isDev ? { constraint: error.constraint, detail: error.detail } : undefined,
      logError: true,
    });
  }

  // Generic database error
  return createErrorResponse({
    code: ErrorCode.DATABASE_ERROR,
    details: isDev ? { message: error.message, code: error.code, context } : undefined,
    logError: true,
  });
}

/**
 * Handle JSON parse errors
 * @returns Formatted error response
 */
export function handleJsonParseError(): NextResponse {
  return createErrorResponse({
    code: ErrorCode.MALFORMED_JSON,
    message: "Request body contains invalid JSON",
  });
}

/**
 * Handle unexpected errors
 * @param error - Unknown error
 * @param context - Additional context
 * @returns Formatted error response
 */
export function handleUnexpectedError(error: unknown, context?: string): NextResponse {
  const isDev = isDevelopment();
  
  let errorMessage = "An unexpected error occurred";
  let errorDetails: any = undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = isDev
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
          context,
        }
      : undefined;

    // Report to Sentry
    Sentry.captureException(error, { extra: { context } });
  } else {
    errorDetails = isDev ? { error: String(error), context } : undefined;
    Sentry.captureMessage(`Unexpected non-Error thrown: ${String(error)}`, {
      level: "error",
      extra: { context },
    });
  }

  return createErrorResponse({
    code: ErrorCode.SERVER_ERROR,
    message: isDev ? errorMessage : ErrorMessage[ErrorCode.SERVER_ERROR],
    details: errorDetails,
    logError: true,
  });
}

/**
 * Safe async handler wrapper for API routes
 * Catches errors and returns formatted responses
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Handle known error types
      if (error instanceof ZodError) {
        return handleZodError(error);
      }

      // Handle unexpected errors
      return handleUnexpectedError(error, `Handler: ${handler.name}`);
    }
  }) as T;
}
