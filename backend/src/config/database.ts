import mongoose from 'mongoose';
import { logger } from '../utils/helpers';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

let retryCount = 0;

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yezbee-fashion';

  const connectWithRetry = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, connectionOptions);
      logger.info('MongoDB connected successfully');
      retryCount = 0;
    } catch (error) {
      retryCount++;
      logger.error(`MongoDB connection attempt ${retryCount} failed:`, error);

      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_DELAY / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return connectWithRetry();
      }

      logger.error('Max retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  };

  await connectWithRetry();
};

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed due to app termination');
  process.exit(0);
});

export default mongoose;
