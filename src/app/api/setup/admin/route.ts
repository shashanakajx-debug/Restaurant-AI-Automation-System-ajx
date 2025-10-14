import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { MockDatabase } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { withAuth } from '@/middleware/auth';

// This endpoint creates an admin user for development purposes
// Only accessible in development mode or by existing admins
export async function GET(request: NextRequest) {
  // Prevent access in production unless by an admin
  if (process.env.NODE_ENV === 'production') {
    return withAuth(async () => {
      return setupAdminUser(request);
    }, { requiredRole: 'admin' })(request);
  }
  
  // In development, allow direct access
  return setupAdminUser(request);
}

async function setupAdminUser(request: NextRequest) {
  try {
    // Try to connect to MongoDB
    try {
      await dbConnect();
    } catch (error) {
      console.log('Using mock database instead');
    }
    
    const email = 'dev.admin@example.com';
    const password = 'admin123';
    
    // Create admin user directly in memory if MongoDB connection fails
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        // Update existing user
        user.role = 'admin';
        user.isActive = true;
        user.emailVerified = true;
        await user.save();
        
        return NextResponse.json({
          success: true,
          message: 'Admin user updated successfully',
          user: { email: user.email, role: user.role }
        });
      } else {
        // Create new admin user
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        user = await User.create({
          email,
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          isActive: true,
          emailVerified: true,
          lastLogin: new Date()
        });
        
        return NextResponse.json({
          success: true,
          message: 'Admin user created successfully',
          user: { email: user.email, role: user.role }
        });
      }
    } catch (dbError) {
      console.error('Database operation failed, using mock data:', dbError);
      
      // Use mock database as fallback
      const mockDb = global.__mockDatabase;
      
      // Check if admin user exists in mock DB
      const users = mockDb.findInCollection('users', { email });
      
      if (users.length > 0) {
        // Update existing user
        const updatedUser = mockDb.updateInCollection('users', { email }, { 
          role: 'admin',
          isActive: true,
          emailVerified: true,
          lastLogin: new Date()
        });
        
        return NextResponse.json({
          success: true,
          message: 'Admin user updated successfully in mock database',
          user: { email, role: 'admin' },
          mockDatabase: true
        });
      } else {
        // Create new admin user in mock DB
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = mockDb.addToCollection('users', {
          email,
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          isActive: true,
          emailVerified: true,
          lastLogin: new Date()
        });
        
        return NextResponse.json({
          success: true,
          message: 'Admin user created successfully in mock database',
          user: { email, role: 'admin' },
          mockDatabase: true
        });
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: (error as Error).message
    }, { status: 500 });
  }
}