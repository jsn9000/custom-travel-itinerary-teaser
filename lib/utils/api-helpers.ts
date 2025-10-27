/**
 * API Helper Utilities
 *
 * Utility functions for API routes including validation, error handling,
 * and response formatting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
  code?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates request body against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or throws validation error
 *
 * @example
 * ```ts
 * const body = await validateBody(request, createTripSchema);
 * ```
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request body', error.issues);
    }
    throw new Error('Failed to parse request body');
  }
}

/**
 * Validates query parameters against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or throws validation error
 *
 * @example
 * ```ts
 * const params = validateQuery(request, paginationSchema);
 * ```
 */
export function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObject = Object.fromEntries(searchParams.entries());
    return schema.parse(queryObject);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid query parameters', error.issues);
    }
    throw error;
  }
}

/**
 * Validates URL path parameters against a Zod schema
 *
 * @param params - Path parameters (from Next.js route)
 * @param schema - Zod schema to validate against
 * @returns Validated data or throws validation error
 *
 * @example
 * ```ts
 * const { tripId } = await validateParams(params, getTripSchema);
 * ```
 */
export async function validateParams<T extends z.ZodType>(
  params: Promise<Record<string, string>> | Record<string, string>,
  schema: T
): Promise<z.infer<T>> {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    return schema.parse(resolvedParams);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid path parameters', error.issues);
    }
    throw error;
  }
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error for not found resources
 */
export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Custom error for unauthorized access
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Custom error for forbidden access
 */
export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Response Functions
// ============================================================================

/**
 * Returns a successful JSON response
 *
 * @param data - Data to return
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 *
 * @example
 * ```ts
 * return successResponse({ trip: tripData }, 'Trip created successfully', 201);
 * ```
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Returns an error JSON response
 *
 * @param error - Error message or Error object
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details
 *
 * @example
 * ```ts
 * return errorResponse('Trip not found', 404);
 * ```
 */
export function errorResponse(
  error: string | Error,
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  const message = typeof error === 'string' ? error : error.message;

  const response: ApiError = {
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handles errors and returns appropriate response
 *
 * @param error - Error to handle
 * @returns Next.js response with appropriate status code
 *
 * @example
 * ```ts
 * try {
 *   // ... api logic
 * } catch (error) {
 *   return handleError(error);
 * }
 * ```
 */
export function handleError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error);

  // Validation errors
  if (error instanceof ValidationError) {
    return errorResponse('Validation failed', 400, error.details);
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return errorResponse(error.message, 404);
  }

  // Unauthorized errors
  if (error instanceof UnauthorizedError) {
    return errorResponse(error.message, 401);
  }

  // Forbidden errors
  if (error instanceof ForbiddenError) {
    return errorResponse(error.message, 403);
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    return errorResponse(error.message, 429);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse('Validation failed', 400, error.issues);
  }

  // Generic errors
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  // Unknown errors
  return errorResponse('An unexpected error occurred', 500);
}

// ============================================================================
// Middleware Utilities
// ============================================================================

/**
 * Wraps an API handler with try-catch and error handling
 *
 * @param handler - Async function to wrap
 * @returns Wrapped function with error handling
 *
 * @example
 * ```ts
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return successResponse(data);
 * });
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

/**
 * Creates a validated API handler
 *
 * @param schema - Zod schema for validation
 * @param handler - Handler function that receives validated data
 * @returns API route handler
 *
 * @example
 * ```ts
 * export const POST = createValidatedHandler(
 *   createTripSchema,
 *   async (validatedData, request) => {
 *     const trip = await createTrip(validatedData);
 *     return successResponse(trip, 'Trip created', 201);
 *   }
 * );
 * ```
 */
export function createValidatedHandler<T extends z.ZodType>(
  schema: T,
  handler: (
    validatedData: z.infer<T>,
    request: NextRequest
  ) => Promise<NextResponse>
) {
  return withErrorHandling(async (request: NextRequest) => {
    const validatedData = await validateBody(request, schema);
    return handler(validatedData, request);
  });
}

// ============================================================================
// Rate Limiting Utilities
// ============================================================================

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware
 *
 * @param key - Unique key for rate limiting (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 *
 * @example
 * ```ts
 * const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
 * checkRateLimit(clientIp, 10, 60000); // 10 requests per minute
 * ```
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): void {
  if (!rateLimiter.check(key, maxRequests, windowMs)) {
    throw new RateLimitError(
      `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`
    );
  }
}
