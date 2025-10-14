import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Update the path below if 'options' is not located at 'src/lib/auth/options.ts'
// Update the path below to the correct location of 'options.ts'
import authOptions from '@/lib/auth/options';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
  await dbConnect();
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
  const userId = session.user.id ?? session.user.email;
    const query: Record<string, unknown> = { userId };
    
    if (status) {
      query.status = status;
    }
    
    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      orders: orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error fetching customer orders:', message);
    return NextResponse.json({ error: message || 'Failed to fetch orders' }, { status: 500 });
  }
}