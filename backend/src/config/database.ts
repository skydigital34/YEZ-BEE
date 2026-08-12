import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from '../utils/helpers';

// Configure DNS for MongoDB SRV record resolution on Windows / local networks
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {
    // Ignore DNS set failures
  }
}

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  dbName: 'yezbee',
};

let retryCount = 0;
let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://sbfashionamazon:dharu1234@yez-bee.pnmkrhi.mongodb.net/yezbee?retryWrites=true&w=majority';

  if (process.env.VERCEL) {
    try {
      await mongoose.connect(uri, connectionOptions);
      isConnected = true;
      logger.info('MongoDB Atlas connected on Vercel Serverless');
    } catch (error) {
      logger.error('Vercel MongoDB connection failed:', error instanceof Error ? error.message : error);
      throw error;
    }
    return;
  }

  const connectWithRetry = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, connectionOptions);
      isConnected = true;
      retryCount = 0;
      logger.info('MongoDB Atlas connected successfully to "yezbee" database');
    } catch (error) {
      retryCount++;
      const safeErrorMessage = error instanceof Error ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : String(error);
      logger.error(`MongoDB connection attempt ${retryCount} failed: ${safeErrorMessage}`);

      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying MongoDB connection in ${RETRY_DELAY / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return connectWithRetry();
      }

      logger.error('Max retries reached. Could not connect to MongoDB Atlas.');
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
