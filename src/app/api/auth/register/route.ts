import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { registerSchema } from '@/schemas/auth';
import { withCors, withValidation, rateLimits } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';

export const POST = withCors({ origin: true, methods: ['POST'], credentials: false })(
  withValidation(
    registerSchema,
    rateLimits.general(async (request: NextRequest) => {
      try {
        console.log('[Auth API] Starting registration process');
        
        // Ensure database connection
        try {
          await dbConnect();
          console.log('[Auth API] Database connected successfully');
        } catch (dbError) {
          console.error('[Auth API] Database connection error:', dbError);
          return NextResponse.json(
            createApiError('Database connection failed. Please try again later.'),
            { status: 503 }
          );
        }
        
        // Get validated data from middleware
        const { email, password, name, role = 'customer' } = (request as any).validatedData;
        console.log('[Auth API] Processing registration for email:', email);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log('[Auth API] User already exists with email:', email);
          return NextResponse.json(
            createApiError('User with this email already exists'),
            { status: 409 }
          );
        }
        
        // Create new user
        const user = new User({
          email,
          password, // Password will be hashed by the User model pre-save hook
          name,
          role
        });
        
        // Save user with better error handling
        try {
          console.log('[Auth API] Attempting to save new user');
          await user.save();
          console.log('[Auth API] User saved successfully');
        } catch (saveError: any) {
          console.error('[Auth API] User save error:', saveError);
          
          // Check for MongoDB duplicate key error (code 11000)
          if (saveError.code === 11000) {
            return NextResponse.json(
              createApiError('User with this email already exists'),
              { status: 409 }
            );
          }
          
          // Check for validation errors
          if (saveError instanceof Error && 'errors' in (saveError as any)) {
            const validationErrors = Object.values((saveError as any).errors)
              .map((err: any) => err.message)
              .join(', ');
            return NextResponse.json(
              createApiError(`Validation error: ${validationErrors}`),
              { status: 400 }
            );
          }
          
          // Handle other specific errors
          if (saveError.name === 'ValidationError') {
            return NextResponse.json(
              createApiError('Invalid user data provided'),
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            createApiError('Failed to create user account'),
            { status: 500 }
          );
        }
        
        // Return success response without sensitive data
        const userResponse = {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: (user as any).createdAt
        };
        
        console.log('[Auth API] Registration successful for:', email);
        return NextResponse.json(
          createApiResponse(userResponse, 'User registered successfully'),
          { status: 201 }
        );
      } catch (error) {
        console.error('[Auth API] Registration error:', error);
        // Provide more specific error message if possible
        const errorMessage = error instanceof Error ? error.message : 'Failed to register user';
        return NextResponse.json(
          createApiError(errorMessage),
          { status: 500 }
        );
      }
    })
  )
);