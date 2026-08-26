import dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately before any route modules import
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDatabase, getDatabaseStatus } from './config/database';
import { connectRedis } from './config/redis';
import { verifyTransporter } from './config/email';
import { logger } from './utils/helpers';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import couponRoutes from './routes/coupon.routes';
import wishlistRoutes from './routes/wishlist.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';

const app = express();

const validateEnvVars = (): void => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'yezbee_super_secret_jwt_key_2026_production_secure';
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    process.env.CLOUDINARY_CLOUD_NAME = 'smpyi8aw';
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    process.env.CLOUDINARY_API_KEY = '653597949992938';
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    process.env.CLOUDINARY_API_SECRET = 'FvNmzPMA8deuTLwVw74Rp2syH5o';
  }
};

const configureMiddleware = (): void => {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://yez-bee.vercel.app',
    'https://yezbee-fashion.vercel.app',
    process.env.FRONTEND_URL,
  ].filter((url): url is string => Boolean(url));

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/yez-bee(-[a-z0-9-]+)?\.vercel\.app$/.test(origin) ||
        /^https:\/\/yezbee(-[a-z0-9-]+)?\.vercel\.app$/.test(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(compression());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
      skip: (_req: Request, res: Response) => res.statusCode < 400,
    }));
  }

  const isDev = process.env.NODE_ENV !== 'production';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  });

  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 20,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes',
    },
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
};

const configureRoutes = (): void => {
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'YEZ BEE API is running',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  app.get('/health/detailed', async (_req: Request, res: Response) => {
    const { getRedisStatus } = require('./config/redis');

    res.status(200).json({
      success: true,
      data: {
        server: 'running',
        database: getDatabaseStatus() ? 'connected (Firestore)' : 'connecting/disconnected',
        redis: getRedisStatus ? getRedisStatus() : 'unknown',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  const API_PREFIX = '/api/v1';

  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/products`, productRoutes);
  app.use(`${API_PREFIX}/categories`, categoryRoutes);
  app.use(`${API_PREFIX}/orders`, orderRoutes);
  app.use(`${API_PREFIX}/cart`, cartRoutes);
  app.use(`${API_PREFIX}/coupons`, couponRoutes);
  app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
  app.use(`${API_PREFIX}/payments`, paymentRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
};

const startServer = async (): Promise<void> => {
  try {
    validateEnvVars();

    configureMiddleware();
    configureRoutes();

    await connectDatabase();

    await connectRedis().catch((err) => {
      logger.warn('Redis connection failed, continuing without cache:', err);
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await verifyTransporter().catch(() => {});
    }

    const PORT = parseInt(process.env.PORT || '5000', 10);

    const server = app.listen(PORT, () => {
      console.log(`\n==============================================`);
      console.log(`YEZ BEE API SERVER STARTED`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`PORT: ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`==============================================\n`);
      logger.info(`YEZ BEE API SERVER STARTED on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/v1`);
      logger.info(`Health check at http://localhost:${PORT}/api/health`);
    });

    server.on('error', (error: any) => {
      logger.error('HTTP server failed to start:', error);
      console.error('HTTP server failed to start:', error);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module || process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
export default startServer;
