import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/user';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredRole?: UserRole
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

    // Debug: log token summary to help diagnose permission issues in dev
      try {
      // Avoid logging sensitive full token in production
      const tokenSummary = { id: token.id, email: token.email, role: token.role };
      const logger = require('../lib/logger').default;
      logger.info('[Auth Middleware] Token summary:', tokenSummary);
    } catch (e) {
      // ignore
    }

    // Check if user has required role
    if (requiredRole && token.role !== requiredRole) {
      // Check role hierarchy
      const roleHierarchy: Record<UserRole, number> = {
        customer: 1,
        staff: 2,
        admin: 3,
      };

      const userRoleLevel = roleHierarchy[token.role as UserRole] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as UserRole,
    };

    return await handler(authenticatedRequest);
  } catch (error) {
    const logger = require('../lib/logger').default;
    logger.error('[Auth Middleware] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export function requireAuth(requiredRole?: UserRole) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withAuth(request, handler, requiredRole);
  };
}

export function requireAdmin() {
  return requireAuth('admin');
}

export function requireStaff() {
  return requireAuth('staff');
}

export function requireCustomer() {
  return requireAuth('customer');
}

// Add a specific middleware for admin routes
export async function withAdminAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, handler, 'admin');
}
