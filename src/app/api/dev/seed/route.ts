import { NextResponse } from 'next/server';
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
