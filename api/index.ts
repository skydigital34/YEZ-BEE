import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { connectDatabase } from '../backend/src/config/database';

// Import routes
import authRoutes from '../backend/src/routes/auth.routes';
import productRoutes from '../backend/src/routes/product.routes';
import categoryRoutes from '../backend/src/routes/category.routes';
import orderRoutes from '../backend/src/routes/order.routes';
import cartRoutes from '../backend/src/routes/cart.routes';
import couponRoutes from '../backend/src/routes/coupon.routes';
import wishlistRoutes from '../backend/src/routes/wishlist.routes';
import paymentRoutes from '../backend/src/routes/payment.routes';
import userRoutes from '../backend/src/routes/user.routes';
import { errorHandler, notFoundHandler } from '../backend/src/middleware/errorHandler';

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health checks
const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'YEZ BEE API is running', timestamp: new Date().toISOString() });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Routes
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

export default async function handler(req: Request, res: Response) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('MongoDB serverless connection error:', err);
  }
  return app(req, res);
}
