import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export interface ValidatedRequest<T = any> extends NextRequest {
  validatedData?: T;
}

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: ValidatedRequest<T>) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: any;

      // Parse request body based on content type
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else if (contentType?.includes('multipart/form-data')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        // Try to parse as JSON by default
        try {
          data = await request.json();
        } catch {
          data = {};
        }
      }

      // Validate data with schema
      const validatedData = schema.parse(data);

      // Add validated data to request
      const validatedRequest = request as ValidatedRequest<T>;
      validatedRequest.validatedData = validatedData;

      return await handler(validatedRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: formattedErrors,
          },
          { status: 400 }
        );
      }

      console.error('[Validation Middleware] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (handler: (req: ValidatedRequest<T>) => Promise<NextResponse>) => {
    return withValidation(schema, handler);
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (handler: (req: ValidatedRequest<T>) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // `request.url` may be a relative path (e.g. '/api/menu') in some runtimes.
        // new URL(...) will throw for relative URLs, so provide a fallback base.
        let urlObj: URL;
        try {
          urlObj = new URL(request.url);
        } catch (e) {
          const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
          urlObj = new URL(request.url, base);
        }

        const queryParams = Object.fromEntries(urlObj.searchParams.entries());
        
        const validatedData = schema.parse(queryParams);
        
        const validatedRequest = request as ValidatedRequest<T>;
        validatedRequest.validatedData = validatedData;
        
        return await handler(validatedRequest);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));

          return NextResponse.json(
            {
              success: false,
              error: 'Query validation failed',
              details: formattedErrors,
            },
            { status: 400 }
          );
        }

        console.error('[Query Validation Middleware] Error:', error);
        return NextResponse.json(
          { success: false, error: 'Invalid query parameters' },
          { status: 400 }
        );
      }
    };
  };
}
