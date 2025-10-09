import { NextRequest, NextResponse } from 'next/server';

interface CorsConfig {
  // Allow boolean true for permissive dev mode, string, array of strings, or a function
  origin?: boolean | string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultConfig: CorsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function withCors(config: Partial<CorsConfig> = {}) {
  const corsConfig = { ...defaultConfig, ...config };

  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const origin = request.headers.get('origin');
      const method = request.method;

      // Handle preflight requests
      if (method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        setCorsHeaders(response, origin, corsConfig);
        return response;
      }

      // Execute handler
      const response = await handler(request);

      // Set CORS headers
      setCorsHeaders(response, origin, corsConfig);

      return response;
    };
  };
}

function setCorsHeaders(response: NextResponse, origin: string | null, config: CorsConfig) {
  // Set Access-Control-Allow-Origin
  if (config.origin) {
    if (typeof config.origin === 'string') {
      response.headers.set('Access-Control-Allow-Origin', config.origin);
    } else if (Array.isArray(config.origin)) {
      if (origin && config.origin.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    } else if (typeof config.origin === 'function' && origin) {
      if (config.origin(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    } else if (config.origin === true) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
  }

  // Set other CORS headers
  if (config.methods) {
    response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
  }

  if (config.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  }

  if (config.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  }

  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }
}

// Predefined CORS configurations
export const corsConfigs = {
  // Default CORS for most endpoints
  default: withCors(),

  // Strict CORS for sensitive endpoints
  strict: withCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),

  // Public CORS for public endpoints
  public: withCors({
    origin: true,
    methods: ['GET', 'POST'],
    credentials: false,
  }),

  // Admin CORS for admin endpoints
  admin: withCors({
    origin: process.env.ADMIN_ORIGINS?.split(',') || process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
};
