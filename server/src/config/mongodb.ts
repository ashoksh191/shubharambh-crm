import mongoose from 'mongoose';

/**
 * Enterprise Production MongoDB Connection Manager with Mongoose
 */
export const connectMongoDB = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shubharambh_crm';

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} / database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Failed to connect to ${mongoUri}:`, error);
    // Return mock connection or throw depending on environment
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected successfully.');
};

export default connectMongoDB;
