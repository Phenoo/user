import { NextResponse } from "next/server";

/**
 * Standardized API Response Helpers
 * Use these to ensure consistent response formats across all API routes
 */

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create a standardized error response
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details for debugging
 * @param code - Machine-readable error code
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
      ...(code ? { code } : {}),
    },
    { status }
  );
}

/**
 * Create a standardized success response
 * @param data - Response data
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Common HTTP error responses
 */
export const CommonErrors = {
  badRequest: (message: string = "Bad request", details?: unknown) =>
    errorResponse(message, 400, details, "BAD_REQUEST"),

  unauthorized: (message: string = "Unauthorized", details?: unknown) =>
    errorResponse(message, 401, details, "UNAUTHORIZED"),

  forbidden: (message: string = "Forbidden", details?: unknown) =>
    errorResponse(message, 403, details, "FORBIDDEN"),

  notFound: (message: string = "Resource not found", details?: unknown) =>
    errorResponse(message, 404, details, "NOT_FOUND"),

  conflict: (message: string = "Conflict", details?: unknown) =>
    errorResponse(message, 409, details, "CONFLICT"),

  unprocessableEntity: (
    message: string = "Unprocessable entity",
    details?: unknown
  ) => errorResponse(message, 422, details, "UNPROCESSABLE_ENTITY"),

  tooManyRequests: (
    message: string = "Too many requests",
    details?: unknown
  ) => errorResponse(message, 429, details, "TOO_MANY_REQUESTS"),

  internalServerError: (
    message: string = "Internal server error",
    details?: unknown
  ) => errorResponse(message, 500, details, "INTERNAL_SERVER_ERROR"),

  notImplemented: (message: string = "Not implemented", details?: unknown) =>
    errorResponse(message, 501, details, "NOT_IMPLEMENTED"),

  serviceUnavailable: (
    message: string = "Service unavailable",
    details?: unknown
  ) => errorResponse(message, 503, details, "SERVICE_UNAVAILABLE"),
};

/**
 * Handle errors in a consistent way
 * @param error - The error to handle
 * @param fallbackMessage - Fallback message if error is not an Error instance
 */
export function handleApiError(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred"
): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("ECONNREFUSED")) {
      return CommonErrors.serviceUnavailable(
        "Unable to connect to required service"
      );
    }

    if (error.message.includes("timeout")) {
      return errorResponse("Request timeout", 504, error.message, "TIMEOUT");
    }

    return errorResponse(error.message, 500, undefined, "ERROR");
  }

  return errorResponse(fallbackMessage, 500);
}

/**
 * Validate required fields in request body
 * @param body - Request body
 * @param requiredFields - Array of required field names
 * @returns Error response if validation fails, null otherwise
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): NextResponse<ApiErrorResponse> | null {
  const missingFields = requiredFields.filter(
    (field) => !body[field] || (typeof body[field] === "string" && body[field] === "")
  );

  if (missingFields.length > 0) {
    return CommonErrors.badRequest(
      `Missing required fields: ${missingFields.join(", ")}`,
      { missingFields }
    );
  }

  return null;
}

/**
 * Async error handler wrapper for API routes
 * Automatically catches errors and returns standardized error responses
 * @param handler - The async function to wrap
 * @returns Wrapped function that handles errors
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}

