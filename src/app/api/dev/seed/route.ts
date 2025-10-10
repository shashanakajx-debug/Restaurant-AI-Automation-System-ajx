import { NextResponse } from 'next/server';
// The scripts folder is at the project root. Use a relative path from this file to that script.
import seed from '../../../../../scripts/seed';

// POST /api/dev/seed - Run DB seed (development only)
export async function POST(request: Request) {
  try {
    const env = process.env.NODE_ENV || 'development';
    const devKey = process.env.DEV_SEED_KEY || '';

    if (env !== 'development' && env !== 'test') {
      return NextResponse.json({ success: false, error: 'Seeding is disabled in production' }, { status: 403 });
    }

    const providedKey = request.headers.get('x-dev-seed-key') || '';
    if (devKey && providedKey !== devKey) {
      return NextResponse.json({ success: false, error: 'Invalid seed key' }, { status: 401 });
    }

    await seed();

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    console.error('[Dev Seed API] Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Seed failed' }, { status: 500 });
  }
}
// NextResponse already imported above
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MenuItem from '@/models/MenuItem';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'seed only allowed in development' }, { status: 403 });
  }

  try {
    await dbConnect();

    await User.deleteMany({});
    await MenuItem.deleteMany({});

    const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'demoPass123';
    const admin = await User.create({
      email: 'shashankajx@gmail.com',
      name: 'Demo Admin',
      password: adminPassword,
      role: 'admin'
    });

    const items = [
      { name: 'Margherita Pizza', price: 499.99, category: 'Pizza', tags: ['veg'] },
      { name: 'Pepperoni Pizza', price: 399.99, category: 'Pizza', tags: ['meat'] },
      { name: 'Veggie Burger', price: 299.50, category: 'Burgers', tags: ['veg'] },
      { name: 'Caesar Salad', price: 199.00, category: 'Salads', tags: ['light'] },
      { name: 'French Fries', price: 99.50, category: 'Sides', tags: ['snack'] },
      { name: 'Chocolate Brownie', price: 902.00, category: 'Desserts', tags: ['sweet'] }
    ];

    await MenuItem.insertMany(items);

    return NextResponse.json({ ok: true, admin: { email: admin.email } });
  } catch (err) {
    console.error('seed error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
