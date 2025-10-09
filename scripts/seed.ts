import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import models
import User from '../src/models/User';
import MenuItem from '../src/models/MenuItem';
import Restaurant from '../src/models/Restaurant';
import Order from '../src/models/Order';
import Reservation from '../src/models/Reservation';
import AISession from '../src/models/AISession';
import Review from '../src/models/Review';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    MenuItem.deleteMany({}),
    Restaurant.deleteMany({}),
    Order.deleteMany({}),
    Reservation.deleteMany({}),
    AISession.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('✅ Database cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      email: 'admin@restaurant.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin' as const,
      isActive: true,
      emailVerified: true,
    },
    {
      email: 'staff@restaurant.com',
      name: 'Staff User',
      password: 'staff123',
      role: 'staff' as const,
      isActive: true,
      emailVerified: true,
    },
    {
      email: 'customer@example.com',
      name: 'John Customer',
      password: 'customer123',
      role: 'customer' as const,
      isActive: true,
      emailVerified: true,
      phone: '+1-555-0123',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        favoriteCategories: ['appetizers', 'desserts'],
        notificationSettings: {
          email: true,
          sms: false,
          push: true,
        },
        language: 'en',
        currency: 'USD',
      },
    },
    {
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
      password: 'password123',
      role: 'customer' as const,
      isActive: true,
      emailVerified: true,
      phone: '+1-555-0456',
      preferences: {
        dietaryRestrictions: ['gluten-free'],
        favoriteCategories: ['main-courses'],
        notificationSettings: {
          email: true,
          sms: true,
          push: true,
        },
        language: 'en',
        currency: 'USD',
      },
    },
  ];

  // Hash passwords
  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 12);
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedRestaurant() {
  console.log('🏪 Seeding restaurant...');
  
  const restaurant = {
    name: 'AI-Powered Bistro',
    description: 'A modern restaurant featuring AI-powered recommendations and seamless ordering experience. We serve fresh, locally-sourced ingredients with innovative culinary techniques.',
    address: {
      street: '456 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    phone: '+1-555-0789',
    email: 'info@aipoweredbistro.com',
    website: 'https://aipoweredbistro.com',
    cuisine: ['american', 'fusion', 'modern'],
    priceRange: '$$' as const,
    operatingHours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
    settings: {
      allowReservations: true,
      allowDelivery: true,
      allowPickup: true,
      maxPartySize: 8,
      advanceBookingDays: 30,
      cancellationPolicy: '24 hours notice required',
      paymentMethods: ['card', 'digital_wallet'],
      taxRate: 0.0875,
      serviceCharge: 0.18,
      tipEnabled: true,
      aiChatEnabled: true,
      reviewEnabled: true,
    },
    active: true,
    ownerId: 'admin-user-id', // Will be updated with actual admin user ID
  };

  const createdRestaurant = await Restaurant.create(restaurant);
  console.log('✅ Created restaurant');
  return createdRestaurant;
}

async function seedMenuItems(restaurantId: string) {
  console.log('🍽️ Seeding menu items...');
  
  const menuItems = [
    // Appetizers
    {
      name: 'Truffle Arancini',
      description: 'Crispy risotto balls filled with truffle and parmesan, served with aioli',
      price: 14.99,
      category: 'Appetizers',
      tags: ['vegetarian', 'popular'],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      active: true,
      restaurantId,
      ingredients: ['risotto', 'truffle oil', 'parmesan', 'breadcrumbs'],
      allergens: ['dairy', 'gluten'],
      nutritionalInfo: {
        calories: 320,
        protein: 12,
        carbs: 28,
        fat: 18,
        fiber: 2,
        sodium: 450,
      },
      preparationTime: 15,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isPopular: true,
      sortOrder: 1,
    },
    {
      name: 'Crispy Calamari',
      description: 'Fresh squid rings lightly battered and fried, served with marinara and lemon',
      price: 16.99,
      category: 'Appetizers',
      tags: ['seafood', 'crispy'],
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
      active: true,
      restaurantId,
      ingredients: ['squid', 'flour', 'eggs', 'marinara sauce'],
      allergens: ['gluten', 'eggs'],
      preparationTime: 12,
      spiceLevel: 1,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isPopular: true,
      sortOrder: 2,
    },
    
    // Main Courses
    {
      name: 'AI-Recommended Burger',
      description: 'Our signature burger with AI-optimized flavor profile, grass-fed beef, aged cheddar, and house-made pickles',
      price: 22.99,
      category: 'Main Courses',
      tags: ['beef', 'popular', 'signature'],
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      active: true,
      restaurantId,
      ingredients: ['grass-fed beef', 'cheddar cheese', 'lettuce', 'tomato', 'pickles', 'brioche bun'],
      allergens: ['dairy', 'gluten'],
      nutritionalInfo: {
        calories: 650,
        protein: 35,
        carbs: 45,
        fat: 32,
        fiber: 4,
        sodium: 890,
      },
      preparationTime: 20,
      spiceLevel: 2,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isPopular: true,
      sortOrder: 10,
    },
    {
      name: 'Quinoa Power Bowl',
      description: 'Nutrient-packed bowl with quinoa, roasted vegetables, avocado, and tahini dressing',
      price: 18.99,
      category: 'Main Courses',
      tags: ['vegetarian', 'vegan', 'healthy'],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      active: true,
      restaurantId,
      ingredients: ['quinoa', 'sweet potato', 'broccoli', 'avocado', 'tahini', 'lemon'],
      allergens: [],
      nutritionalInfo: {
        calories: 420,
        protein: 15,
        carbs: 55,
        fat: 18,
        fiber: 12,
        sodium: 320,
      },
      preparationTime: 25,
      spiceLevel: 1,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isPopular: false,
      sortOrder: 11,
    },
    {
      name: 'Pan-Seared Salmon',
      description: 'Atlantic salmon with herb crust, served with seasonal vegetables and lemon butter sauce',
      price: 28.99,
      category: 'Main Courses',
      tags: ['fish', 'healthy', 'popular'],
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      active: true,
      restaurantId,
      ingredients: ['atlantic salmon', 'herbs', 'seasonal vegetables', 'butter', 'lemon'],
      allergens: ['dairy', 'fish'],
      nutritionalInfo: {
        calories: 480,
        protein: 42,
        carbs: 8,
        fat: 28,
        fiber: 3,
        sodium: 520,
      },
      preparationTime: 18,
      spiceLevel: 1,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isPopular: true,
      sortOrder: 12,
    },
    
    // Desserts
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 12.99,
      category: 'Desserts',
      tags: ['chocolate', 'popular', 'warm'],
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      active: true,
      restaurantId,
      ingredients: ['dark chocolate', 'butter', 'eggs', 'sugar', 'flour', 'vanilla ice cream'],
      allergens: ['dairy', 'eggs', 'gluten'],
      nutritionalInfo: {
        calories: 520,
        protein: 8,
        carbs: 65,
        fat: 28,
        fiber: 4,
        sodium: 180,
      },
      preparationTime: 30,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isPopular: true,
      sortOrder: 20,
    },
    {
      name: 'Vegan Chocolate Mousse',
      description: 'Silky smooth chocolate mousse made with aquafaba, topped with fresh berries',
      price: 10.99,
      category: 'Desserts',
      tags: ['vegan', 'chocolate', 'healthy'],
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      active: true,
      restaurantId,
      ingredients: ['dark chocolate', 'aquafaba', 'coconut cream', 'berries'],
      allergens: [],
      nutritionalInfo: {
        calories: 280,
        protein: 6,
        carbs: 35,
        fat: 18,
        fiber: 8,
        sodium: 45,
      },
      preparationTime: 15,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isPopular: false,
      sortOrder: 21,
    },
    
    // Beverages
    {
      name: 'Craft Cocktail - AI Mix',
      description: 'Our AI-optimized signature cocktail with seasonal ingredients and perfect balance',
      price: 15.99,
      category: 'Beverages',
      tags: ['alcoholic', 'signature', 'seasonal'],
      imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400',
      active: true,
      restaurantId,
      ingredients: ['gin', 'elderflower', 'lime', 'cucumber', 'mint'],
      allergens: [],
      preparationTime: 5,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isPopular: true,
      sortOrder: 30,
    },
    {
      name: 'Fresh Green Smoothie',
      description: 'Blend of spinach, kale, apple, banana, and coconut water',
      price: 8.99,
      category: 'Beverages',
      tags: ['healthy', 'vegan', 'fresh'],
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
      active: true,
      restaurantId,
      ingredients: ['spinach', 'kale', 'apple', 'banana', 'coconut water'],
      allergens: [],
      nutritionalInfo: {
        calories: 120,
        protein: 3,
        carbs: 28,
        fat: 1,
        fiber: 6,
        sodium: 85,
      },
      preparationTime: 3,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isPopular: false,
      sortOrder: 31,
    },
  ];

  const createdMenuItems = await MenuItem.insertMany(menuItems);
  console.log(`✅ Created ${createdMenuItems.length} menu items`);
  return createdMenuItems;
}

async function seedOrders(users: any[], menuItems: any[], restaurantId: string) {
  console.log('📦 Seeding orders...');
  
  const orders = [
    {
      userId: users[2]._id, // Customer user
      customerInfo: {
        name: 'John Customer',
        email: 'customer@example.com',
        phone: '+1-555-0123',
      },
      items: [
        {
          menuItemId: menuItems[0]._id, // Truffle Arancini
          name: 'Truffle Arancini',
          price: 14.99,
          quantity: 1,
        },
        {
          menuItemId: menuItems[2]._id, // AI-Recommended Burger
          name: 'AI-Recommended Burger',
          price: 22.99,
          quantity: 1,
        },
      ],
      subtotal: 37.98,
      tax: 3.32,
      tip: 7.00,
      total: 48.30,
      status: 'delivered',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      restaurantId,
      specialInstructions: 'Please make the burger medium rare',
    },
    {
      userId: users[3]._id, // Jane Doe
      customerInfo: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0456',
      },
      items: [
        {
          menuItemId: menuItems[3]._id, // Quinoa Power Bowl
          name: 'Quinoa Power Bowl',
          price: 18.99,
          quantity: 1,
        },
        {
          menuItemId: menuItems[7]._id, // Vegan Chocolate Mousse
          name: 'Vegan Chocolate Mousse',
          price: 10.99,
          quantity: 1,
        },
      ],
      subtotal: 29.98,
      tax: 2.62,
      tip: 5.00,
      total: 37.60,
      status: 'preparing',
      paymentStatus: 'completed',
      paymentMethod: 'digital_wallet',
      restaurantId,
    },
  ];

  const createdOrders = await Order.insertMany(orders);
  console.log(`✅ Created ${createdOrders.length} orders`);
  return createdOrders;
}

async function seedReservations(users: any[], restaurantId: string) {
  console.log('📅 Seeding reservations...');
  
  const reservations = [
    {
      customerInfo: {
        name: 'John Customer',
        email: 'customer@example.com',
        phone: '+1-555-0123',
      },
      partySize: 2,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '19:00',
      status: 'confirmed',
      restaurantId,
      userId: users[2]._id,
      specialRequests: 'Anniversary dinner, please make it special',
    },
    {
      customerInfo: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0456',
      },
      partySize: 4,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      time: '20:30',
      status: 'pending',
      restaurantId,
      userId: users[3]._id,
    },
  ];

  const createdReservations = await Reservation.insertMany(reservations);
  console.log(`✅ Created ${createdReservations.length} reservations`);
  return createdReservations;
}

async function seedReviews(users: any[], orders: any[], restaurantId: string) {
  console.log('⭐ Seeding reviews...');
  
  const reviews = [
    {
      userId: users[2]._id,
      customerName: 'John Customer',
      customerEmail: 'customer@example.com',
      orderId: orders[0]._id,
      rating: 5,
      title: 'Amazing AI-powered experience!',
      comment: 'The AI recommendations were spot on! The truffle arancini was incredible and the burger was perfectly cooked. The service was excellent and the atmosphere was perfect for our date night.',
      foodRating: 5,
      serviceRating: 5,
      ambianceRating: 5,
      helpful: 12,
      verified: true,
      restaurantId,
    },
    {
      userId: users[3]._id,
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      rating: 4,
      title: 'Great healthy options',
      comment: 'Loved the quinoa power bowl! As someone with dietary restrictions, I appreciate the clear labeling and variety of options. The vegan chocolate mousse was a perfect ending.',
      foodRating: 4,
      serviceRating: 4,
      ambianceRating: 4,
      helpful: 8,
      verified: true,
      restaurantId,
    },
  ];

  const createdReviews = await Review.insertMany(reviews);
  console.log(`✅ Created ${createdReviews.length} reviews`);
  return createdReviews;
}

async function seedAISessions(users: any[], restaurantId: string) {
  console.log('🤖 Seeding AI sessions...');
  
  const sessions = [
    {
      userId: users[2]._id,
      sessionId: 'ai_session_001',
      messages: [
        {
          id: 'msg_001',
          role: 'user',
          content: 'I\'m looking for a vegetarian appetizer that\'s not too heavy',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: 'msg_002',
          role: 'assistant',
          content: 'I\'d recommend our Truffle Arancini! It\'s a crispy risotto ball with truffle and parmesan - perfect for vegetarians and not too heavy. It\'s one of our most popular appetizers.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 30 seconds later
        },
      ],
      context: {
        restaurantId,
        preferences: ['vegetarian'],
        dietaryRestrictions: [],
        budget: 50,
        partySize: 2,
      },
      isActive: true,
    },
  ];

  const createdSessions = await AISession.insertMany(sessions);
  console.log(`✅ Created ${createdSessions.length} AI sessions`);
  return createdSessions;
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const restaurant = await seedRestaurant();
    
    // Update restaurant with actual admin user ID
    restaurant.ownerId = String((users[0] as any)._id);
    await restaurant.save();
    
    const menuItems = await seedMenuItems(String((restaurant as any)._id));
    const orders = await seedOrders(users, menuItems, String((restaurant as any)._id));
    const reservations = await seedReservations(users, String((restaurant as any)._id));
    const reviews = await seedReviews(users, orders, String((restaurant as any)._id));
    const aiSessions = await seedAISessions(users, String((restaurant as any)._id));
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏪 Restaurants: 1`);
    console.log(`   🍽️ Menu Items: ${menuItems.length}`);
    console.log(`   📦 Orders: ${orders.length}`);
    console.log(`   📅 Reservations: ${reservations.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log(`   🤖 AI Sessions: ${aiSessions.length}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: admin@restaurant.com / admin123');
    console.log('   Staff: staff@restaurant.com / staff123');
    console.log('   Customer: customer@example.com / customer123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  main();
}

export default main;
