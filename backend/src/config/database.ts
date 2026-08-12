import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from '../utils/helpers';

// Configure DNS for MongoDB SRV record resolution on Windows / local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore DNS set failures
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  dbName: 'yezbee',
};

let retryCount = 0;
let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yezbee';

  const connectWithRetry = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, connectionOptions);
      isConnected = true;
      retryCount = 0;
      logger.info('MongoDB Atlas connected successfully to "yezbee" database');
    } catch (error) {
      retryCount++;
      // Safe error message without exposing connection credentials
      const safeErrorMessage = error instanceof Error ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : String(error);
      logger.error(`MongoDB connection attempt ${retryCount} failed: ${safeErrorMessage}`);

      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying MongoDB connection in ${RETRY_DELAY / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return connectWithRetry();
      }

      logger.error('Max retries reached. Could not connect to MongoDB Atlas.');
      // In server environments, throw error instead of crashing if imported
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  const safeErr = err?.message?.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') || 'Database error';
  logger.error('Mongoose connection error:', safeErr);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected');
  isConnected = true;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed due to app termination');
  process.exit(0);
});

export default mongoose;
