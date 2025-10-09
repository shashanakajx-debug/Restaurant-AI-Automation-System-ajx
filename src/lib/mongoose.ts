import mongoose from 'mongoose';

declare global {
  // allow global var in dev to preserve cached connection
  // eslint-disable-next-line no-var
  var __mongoose: { 
    conn?: typeof mongoose | null; 
    promise?: Promise<typeof mongoose> | null;
  };
}
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Connection options
const mongooseOptions: Parameters<typeof mongoose.connect>[1] = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  // Write concern can be provided via connection string; omit explicit 'w' to satisfy types
};

async function dbConnect(): Promise<typeof mongoose> {
  // Check if we have a cached connection
  if (global.__mongoose && global.__mongoose.conn) {
    return global.__mongoose.conn;
  }

  // Initialize global mongoose object if it doesn't exist
  if (!global.__mongoose) {
    global.__mongoose = { conn: null, promise: null };
  }

  // Create connection promise if it doesn't exist
  if (!global.__mongoose.promise) {
    global.__mongoose.promise = mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    global.__mongoose.conn = await global.__mongoose.promise;
    return global.__mongoose.conn;
  } catch (error) {
    global.__mongoose.promise = null;
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default dbConnect;
