import mongoose, { Model, Document, Schema } from 'mongoose';

declare global {
  var __mongoose: { 
    conn?: typeof mongoose | null; 
    promise?: Promise<typeof mongoose> | null;
  };
}

// For development, use a mock database if MONGODB_URI is not provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-ai';

// Connection options
const mongooseOptions: Parameters<typeof mongoose.connect>[1] = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
};

// Mock Database class (for development or testing)
class MockDatabase {
  private static instance: MockDatabase;
  private collections: Map<string, any[]>;

  private constructor() {
    this.collections = new Map();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  public getCollection(name: string): any[] {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
    return this.collections.get(name) || [];
  }

  public addToCollection(name: string, document: any): any {
    const collection = this.getCollection(name);
    const id = Math.random().toString(36).substring(2, 15);
    const newDoc = { ...document, _id: id };
    collection.push(newDoc);
    this.collections.set(name, collection);
    return newDoc;
  }

  public findInCollection(name: string, query: any): any[] {
    const collection = this.getCollection(name);
    return collection.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  public updateInCollection(name: string, query: any, update: any): any {
    const collection = this.getCollection(name);
    const index = collection.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      collection[index] = { ...collection[index], ...update };
      this.collections.set(name, collection);
      return collection[index];
    }
    return null;
  }
}

declare global {
  var __mockDatabase: MockDatabase;
}

if (!global.__mockDatabase) {
  global.__mockDatabase = MockDatabase.getInstance();
}

async function dbConnect(): Promise<typeof mongoose> {
  // Check for cached connection
  if (global.__mongoose && global.__mongoose.conn) {
    return global.__mongoose.conn;
  }

  // Wait for connection promise if it's being established
  if (global.__mongoose && global.__mongoose.promise) {
    return global.__mongoose.promise;
  }

  // If MongoDB URI isn't provided, fall back to the mock database
  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/restaurant-ai') {
    console.warn('Using mock database because MONGODB_URI is not provided or is default');
    return mongoose;
  }

  const connectionPromise = mongoose.connect(MONGODB_URI, mongooseOptions)
    .then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      global.__mongoose = { conn: null, promise: null };
      throw err;
    });

  global.__mongoose = { conn: null, promise: connectionPromise };

  try {
    const mongooseConnection = await connectionPromise;
    global.__mongoose = { conn: mongooseConnection, promise: null };
    return mongooseConnection;
  } catch (error) {
    throw error;
  }
}

// Setup mock models to simulate Mongoose behavior when DB is unavailable
function setupMockModels() {
  // Define a mock model object with common Mongoose methods
  const mockModelObj = {
    findOne: (query: any) => {
      const results = global.__mockDatabase.findInCollection('users', query);
      const result = results[0] || null;
      return {
        lean: () => Promise.resolve(result),
        exec: () => Promise.resolve(result),
      };
    },
    find: (query: any = {}) => {
      const results = global.__mockDatabase.findInCollection('users', query);
      return {
        lean: () => Promise.resolve(results),
        exec: () => Promise.resolve(results),
      };
    },
    create: (doc: any) => {
      return Promise.resolve(global.__mockDatabase.addToCollection('users', doc));
    },
    updateOne: (query: any, update: any) => {
      const result = global.__mockDatabase.updateInCollection('users', query, update);
      return Promise.resolve({ modifiedCount: result ? 1 : 0 });
    },
  };

  // Overriding mongoose.model to return the mock model for testing
  mongoose.model = function mockModel(name: string, schema?: any): Model<Document> {
    // If schema is provided, this would normally create a Mongoose model, 
    // but in mock mode we simply return a mock object.
    if (!schema) {
      return mockModelObj as any; // Return mock model object
    }

    // If schema is provided (which we ignore in the mock), just return the mock object
    return mockModelObj as any;
  };

  console.log('Using mock database for development');
}

// Initialize mock database with some sample data for testing
function initializeMockData() {
  const mockDb = global.__mockDatabase;

  // Sample menu items (mock data for testing)
  if (mockDb.getCollection('menuitems').length === 0) {
    console.log('Adding sample menu items to mock database');
    const sampleMenuItems = [
      { 
        _id: '1', 
        name: 'Margherita Pizza', 
        price: 12.99, 
        category: 'Pizza', 
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        tags: ['vegetarian', 'popular'],
        imageUrl: 'https://example.com/pizza.jpg',
        active: true,
        restaurantId: 'main',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isPopular: true,
        sortOrder: 1
      },
      { 
        _id: '2', 
        name: 'Chicken Burger', 
        price: 9.99, 
        category: 'Burgers', 
        description: 'Juicy chicken burger with lettuce, tomato, and special sauce',
        tags: ['meat', 'popular'],
        imageUrl: 'https://example.com/burger.jpg',
        active: true,
        restaurantId: 'main',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isPopular: true,
        sortOrder: 2
      },
      // Add more items here
    ];
    sampleMenuItems.forEach(item => mockDb.addToCollection('menuitems', item));
  }

  // Add sample admin user if not exists
  if (mockDb.getCollection('users').length === 0) {
    console.log('Adding sample admin user to mock database');
    mockDb.addToCollection('users', {
      _id: 'admin1',
      email: 'dev.admin@example.com',
      password: '$2a$10$ixLPY5d.QTLaZRlZu5A.dOXsjwYHZ0q.oO5/W1lFjX0olFzLHz2EC', // admin123
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

// Initialize the mock data when necessary
initializeMockData();

export default dbConnect;
export { MockDatabase };
