import mongoose from 'mongoose';

declare global {
  // allow global var in dev to preserve cached connection
  // eslint-disable-next-line no-var
  var __mongoose: { conn?: typeof mongoose | null; promise?: Promise<typeof mongoose> | null };
}

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function dbConnect() {
  // @ts-ignore
  if (global.__mongoose && global.__mongoose.conn) {
    return global.__mongoose.conn;
  }

  if (!global.__mongoose) global.__mongoose = { conn: null, promise: null };

  if (!global.__mongoose.promise) {
    const opts = {
      bufferCommands: false,
      // add any mongoose options you need
    };
    global.__mongoose.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
  }
  global.__mongoose.conn = await global.__mongoose.promise;
  return global.__mongoose.conn;
}

export default dbConnect;
