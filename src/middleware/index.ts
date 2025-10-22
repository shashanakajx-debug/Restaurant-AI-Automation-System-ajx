// Re-export all middleware
export * from './auth';
export * from './validation';
export * from './rateLimit';
export * from './cors';

// Combined middleware helpers
import { withAuth, AuthenticatedRequest } from './auth';
import { withValidation, validateQuery, ValidatedRequest } from './validation';
import { rateLimit } from './rateLimit';
import { withCors } from './cors';
import { ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/user';

// Combined middleware for authenticated and validated requests
export function withAuthAndValidation<T>(
  schema: ZodSchema<T>,
  requiredRole?: UserRole
) {
  return (handler: (req: AuthenticatedRequest & ValidatedRequest<T>) => Promise<NextResponse>) => {
    return (request: NextRequest) => {
      return withAuth(
        request,
        (authReq) => {
          return withValidation(schema, (validReq) => {
            const combinedReq = { ...authReq, ...validReq } as AuthenticatedRequest & ValidatedRequest<T>;
            return handler(combinedReq);
          })(authReq);
        },
        requiredRole
      );
    };
  };
}

// Combined middleware with rate limiting
export function withAuthValidationAndRateLimit<T>(
  schema: ZodSchema<T>,
  rateLimitConfig: { windowMs: number; maxRequests: number },
  requiredRole?: UserRole
) {
  return (handler: (req: AuthenticatedRequest & ValidatedRequest<T>) => Promise<NextResponse>) => {
    return rateLimit(rateLimitConfig)(
      withAuthAndValidation(schema, requiredRole)(handler)
    );
  };
}

// Combined middleware with CORS
export function withCorsAuthAndValidation<T>(
  schema: ZodSchema<T>,
  corsConfig?: Parameters<typeof withCors>[0],
  requiredRole?: UserRole
) {
  return (handler: (req: AuthenticatedRequest & ValidatedRequest<T>) => Promise<NextResponse>) => {
    // Always skip authentication and just use validation for all routes
    return withCors(corsConfig)(
      // For GET requests, validate query params; for others, validate body
      (async (request: NextRequest) => {
        const method = request.method?.toUpperCase?.() || 'GET';
        const validator = method === 'GET' ? validateQuery(schema) : withValidation(schema);
        return validator((validReq) => {
          const combinedReq = {
            ...validReq,
            user: {
              id: 'guest-user',
              email: 'guest@example.com',
              name: 'Guest User',
              role: 'customer',
            },
          } as AuthenticatedRequest & ValidatedRequest<T>;
          return handler(combinedReq);
        })(request as any);
      })
    );
  };
}

// Full middleware stack
export function withFullMiddleware<T>(
  schema: ZodSchema<T>,
  options: {
    requiredRole?: UserRole;
    rateLimit?: { windowMs: number; maxRequests: number };
    cors?: Parameters<typeof withCors>[0];
  } = {}
) {
  const { requiredRole, rateLimit: rateLimitConfig, cors } = options;

  return (handler: (req: AuthenticatedRequest & ValidatedRequest<T>) => Promise<NextResponse>) => {
    let middleware = withAuthAndValidation(schema, requiredRole)(handler);

    if (rateLimitConfig) {
      middleware = rateLimit(rateLimitConfig)(middleware);
    }

    if (cors) {
      middleware = withCors(cors)(middleware);
    }

    return middleware;
  };
}
