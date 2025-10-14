import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import authOptions from '@/lib/auth/options';
import User from '@/models/User';
import { withCors, withValidation, rateLimits } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { userPreferencesSchema } from '@/schemas/auth';

// GET handler to retrieve user preferences
export const GET = withCors({ origin: true, methods: ['GET'], credentials: true })(
  rateLimits.general(async (request: NextRequest) => {
    try {
      // Get the user session
      const session = await getServerSession(authOptions as any);
      if (!session || !(session as any).user || !(session as any).user.email) {
        return NextResponse.json(
          createApiError('Unauthorized'),
          { status: 401 }
        );
      }

      // Connect to database
      await dbConnect();

      // Find the user
  const user = await User.findOne({ email: (session as any).user.email });
      if (!user) {
        return NextResponse.json(
          createApiError('User not found'),
          { status: 404 }
        );
      }

      // Return user preferences (access defensively)
      const prefs: any = user.preferences || {};
      return NextResponse.json(
        createApiResponse({
          dietaryRestrictions: prefs.dietaryRestrictions || [],
          favoriteCategories: prefs.favoriteCategories || [],
          spiceLevel: prefs.spiceLevel || 'medium',
          budget: prefs.budget || 0
        }, 'User preferences retrieved successfully'),
        { status: 200 }
      );
    } catch (error) {
      console.error('[User API] Error retrieving preferences:', error);
      return NextResponse.json(
        createApiError('Failed to retrieve user preferences'),
        { status: 500 }
      );
    }
  })
);

// PUT handler to update user preferences
export const PUT = withCors({ origin: true, methods: ['PUT'], credentials: true })(
  withValidation(
    userPreferencesSchema,
    rateLimits.general(async (request: NextRequest) => {
      try {
        // Get the user session
        const session = await getServerSession(authOptions as any);
        if (!session || !(session as any).user || !(session as any).user.email) {
          return NextResponse.json(
            createApiError('Unauthorized'),
            { status: 401 }
          );
        }

        // Connect to database
        await dbConnect();

        // Get validated data from middleware
  const { dietaryRestrictions, favoriteCategories, spiceLevel, budget } = (request as any).validatedData;

        // Find and update the user
        const user = await User.findOneAndUpdate(
          { email: (session as any).user.email },
          { 
            'preferences.dietaryRestrictions': dietaryRestrictions,
            'preferences.favoriteCategories': favoriteCategories,
            'preferences.spiceLevel': spiceLevel,
            'preferences.budget': budget
          },
          { new: true }
        );

        if (!user) {
          return NextResponse.json(
            createApiError('User not found'),
            { status: 404 }
          );
        }

        // Return updated preferences (defensive)
        const prefs: any = user.preferences || {};
        return NextResponse.json(
          createApiResponse({
            dietaryRestrictions: prefs.dietaryRestrictions || [],
            favoriteCategories: prefs.favoriteCategories || [],
            spiceLevel: prefs.spiceLevel || 'medium',
            budget: prefs.budget || 0
          }, 'User preferences updated successfully'),
          { status: 200 }
        );
      } catch (error) {
        console.error('[User API] Error updating preferences:', error);
        return NextResponse.json(
          createApiError('Failed to update user preferences'),
          { status: 500 }
        );
      }
    })
  )
);