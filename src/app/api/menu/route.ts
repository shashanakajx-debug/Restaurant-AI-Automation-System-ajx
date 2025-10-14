import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MenuItem from '@/models/MenuItem';
import { menuFilterSchema, menuItemSchema } from '@/schemas/menu';
import { withCorsAuthAndValidation, rateLimits, withAuth } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { ZodError } from 'zod';

// GET /api/menu - Get menu items with filtering and pagination
export const GET = withCorsAuthAndValidation(
  menuFilterSchema,
  { origin: true, methods: ['GET'], credentials: false }
)(
  rateLimits.general(
    async (request) => {
      try {
        await dbConnect();
        
        const {
          category,
          tags,
          priceRange,
          search,
          active = true,
          isVegetarian,
          isVegan,
          isGlutenFree,
          spiceLevel,
          sortBy = 'name',
          sortOrder = 'asc',
          page = 1,
          limit = 20,
        } = (request as any).validatedData!;

        // Build query
        const query: any = { active };
        
        if (category) {
          query.category = new RegExp(category, 'i');
        }
        
        if (tags && tags.length > 0) {
          query.tags = { $in: tags };
        }
        
        if (priceRange) {
          query.price = {
            $gte: priceRange.min,
            $lte: priceRange.max,
          };
        }
        
        if (search) {
          query.$text = { $search: search };
        }
        
        if (isVegetarian !== undefined) {
          query.isVegetarian = isVegetarian;
        }
        
        if (isVegan !== undefined) {
          query.isVegan = isVegan;
        }
        
        if (isGlutenFree !== undefined) {
          query.isGlutenFree = isGlutenFree;
        }
        
        if (spiceLevel !== undefined) {
          query.spiceLevel = spiceLevel;
        }

        // Build sort object
        const sort: any = {};
        if (search && query.$text) {
          sort.score = { $meta: 'textScore' };
        } else {
          switch (sortBy) {
            case 'name':
              sort.name = sortOrder === 'asc' ? 1 : -1;
              break;
            case 'price':
              sort.price = sortOrder === 'asc' ? 1 : -1;
              break;
            case 'popularity':
              sort.isPopular = -1;
              sort.name = 1;
              break;
            case 'newest':
              sort.createdAt = sortOrder === 'asc' ? 1 : -1;
              break;
            default:
              sort.name = 1;
          }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const [items, total] = await Promise.all([
          MenuItem.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          MenuItem.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json(
          createApiResponse({
            items,
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          })
        );
      } catch (error) {
        console.error('[Menu API] Error:', error);
        return NextResponse.json(
          createApiError('Failed to fetch menu items'),
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/menu - Create new menu item (All users)
export async function POST(request: NextRequest) {
  // Admin-only: create new menu item
  return withAuth(request, async (authReq) => {
    try {
      // Debug: log authenticated user info to help diagnose 403
      try {
        console.log('[Menu API] Authenticated request user:', authReq.user);
      } catch (e) { /* ignore */ }

      // Require admin role (defensive check)
      if (!authReq.user || authReq.user.role !== 'admin') {
        return NextResponse.json(createApiError('Insufficient permissions'), { status: 403 });
      }

      await dbConnect();

      // Use the authenticated request for body parsing (some middleware may wrap request)
      const body = await authReq.json();

      // Validate input
      let validated;
      try {
        validated = menuItemSchema.parse(body);
      } catch (err) {
        if (err instanceof ZodError) {
          const details = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
          return NextResponse.json({ success: false, error: 'Validation failed', details }, { status: 400 });
        }
        throw err;
      }

      const menuItem = new MenuItem(validated);
      await menuItem.save();

      return NextResponse.json(createApiResponse(menuItem, 'Menu item created successfully'), { status: 201 });
    } catch (error: any) {
      console.error('[Menu API] Create error:', error);
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return NextResponse.json(createApiError('Menu item with this name already exists'), { status: 409 });
      }
      return NextResponse.json(createApiError('Failed to create menu item'), { status: 500 });
    }
  }, 'admin');
}
