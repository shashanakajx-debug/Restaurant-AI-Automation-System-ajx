import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AuthenticatedRequest } from '@/middleware/auth';

/**
 * Admin authentication middleware
 * This middleware checks if the user is authenticated and has admin role
 */
export async function adminAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as 'admin',
    };

    return await handler(authenticatedRequest);
  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Admin authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Admin route handler wrapper
 * Use this to protect admin routes
 */
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return (request: NextRequest) => adminAuth(request, handler);
}