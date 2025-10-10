import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or another persistent store
const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => {
      try {
        // Guard against req or headers being undefined (some middleware wrappers may call without a NextRequest)
        const headers = (req as any)?.headers;
        if (!headers) return 'unknown';
        return headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
      } catch (e) {
        return 'unknown';
      }
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Safely derive a key for rate limiting. Some middleware wrappers may call
      // the composed function without a proper NextRequest, so guard access.
      let key = 'unknown';
      try {
        if (request && (request as any).headers) {
          key = keyGenerator(request as NextRequest) || 'unknown';
        }
      } catch (e) {
        // If keyGenerator throws, fall back to 'unknown'
        key = 'unknown';
      }
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up expired entries
      for (const [k, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
            },
          }
        );
      }

      // Increment counter
      entry.count++;

      // Execute handler
      const response = await handler(request);

      // Update headers
      const remaining = Math.max(0, maxRequests - entry.count);
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

      // Skip counting based on response status
      if (skipSuccessfulRequests && response.status < 400) {
        entry.count--;
      }
      if (skipFailedRequests && response.status >= 400) {
        entry.count--;
      }

      return response;
    };
  };
}

// Predefined rate limit configurations
export const rateLimits = {
  // General API endpoints
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),

  // Authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  }),

  // AI endpoints (more restrictive)
  ai: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
  }),

  // File upload endpoints
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  }),

  // Admin endpoints
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
  }),
};

// Helper function to create custom rate limits
export function createRateLimit(windowMs: number, maxRequests: number) {
  return rateLimit({ windowMs, maxRequests });
}
