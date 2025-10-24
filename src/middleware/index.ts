// Re-export all middleware
export * from './auth';
export * from './validation';
export * from './rateLimit';
export * from './cors';

import { withAuth, AuthenticatedRequest } from './auth';
import { withValidation, validateQuery, ValidatedRequest } from './validation';
import { rateLimit } from './rateLimit';
import { withCors } from './cors';
import { ZodType, z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/user';

// ✅ Combined middleware for authenticated and validated requests
export function withAuthAndValidation<T extends ZodType<any, any, any>>(
  schema: T,
  requiredRole?: UserRole
) {
  return (
    handler: (req: AuthenticatedRequest & ValidatedRequest<z.infer<T>>) => Promise<NextResponse>
  ) => {
    return (request: NextRequest) => {
      return withAuth(
        request,
        (authReq) => {
          return withValidation(schema)((validReq) => {
            const combinedReq = {
              ...authReq,
              ...validReq,
            } as AuthenticatedRequest & ValidatedRequest<z.infer<T>>;
            return handler(combinedReq);
          })(authReq);
        },
        requiredRole
      );
    };
  };
}

// ✅ Combined middleware with rate limiting
export function withAuthValidationAndRateLimit<T extends ZodType<any, any, any>>(
  schema: T,
  rateLimitConfig: { windowMs: number; maxRequests: number },
  requiredRole?: UserRole
) {
  return (
    handler: (req: AuthenticatedRequest & ValidatedRequest<z.infer<T>>) => Promise<NextResponse>
  ) => {
    return rateLimit(rateLimitConfig)(
      withAuthAndValidation(schema, requiredRole)(handler)
    );
  };
}

// ✅ Combined middleware with CORS (no authentication, guest user)
export function withCorsAuthAndValidation<T extends ZodType<any, any, any>>(
  schema: T,
  corsConfig?: Parameters<typeof withCors>[0],
  requiredRole?: UserRole
) {
  return (
    handler: (req: AuthenticatedRequest & ValidatedRequest<z.infer<T>>) => Promise<NextResponse>
  ) => {
    return withCors(corsConfig)(
      async (request: NextRequest) => {
        const method = request.method?.toUpperCase?.() || 'GET';

        // For GET requests: validate query
        if (method === 'GET') {
          return validateQuery(schema)((validReq) => {
            const combinedReq = {
              ...validReq,
              user: {
                id: 'guest-user',
                email: 'guest@example.com',
                name: 'Guest User',
                role: 'customer',
              },
            } as AuthenticatedRequest & ValidatedRequest<z.infer<T>>;
            return handler(combinedReq);
          })(request);
        }

        // For POST/PUT etc: validate body
        return withValidation(schema)((validReq) => {
          const combinedReq = {
            ...validReq,
            user: {
              id: 'guest-user',
              email: 'guest@example.com',
              name: 'Guest User',
              role: 'customer',
            },
          } as AuthenticatedRequest & ValidatedRequest<z.infer<T>>;
          return handler(combinedReq);
        })(request);
      }
    );
  };
}

// ✅ Full middleware stack (Auth + Validation + Rate Limit + CORS)
export function withFullMiddleware<T extends ZodType<any, any, any>>(
  schema: T,
  options: {
    requiredRole?: UserRole;
    rateLimit?: { windowMs: number; maxRequests: number };
    cors?: Parameters<typeof withCors>[0];
  } = {}
) {
  const { requiredRole, rateLimit: rateLimitConfig, cors } = options;

  return (
    handler: (req: AuthenticatedRequest & ValidatedRequest<z.infer<T>>) => Promise<NextResponse>
  ) => {
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
