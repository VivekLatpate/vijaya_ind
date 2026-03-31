import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const databaseUrl = process.env.DATABASE_URL ?? process.env.MONGO_URI;
  if (!databaseUrl) {
    throw new Error("Missing MongoDB connection string. Set DATABASE_URL or MONGO_URI.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(databaseUrl, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
