import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema } from 'mongoose';
import dns from 'dns';

const PRIMARY_MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sbfashionamazon:dharu1234@yez-bee.pnmkrhi.mongodb.net/yezbee?retryWrites=true&w=majority';

const DIRECT_MONGODB_URI =
  'mongodb://sbfashionamazon:dharu1234@ac-gvh0e4p-shard-00-01.pnmkrhi.mongodb.net:27017,ac-gvh0e4p-shard-00-00.pnmkrhi.mongodb.net:27017,ac-gvh0e4p-shard-00-02.pnmkrhi.mongodb.net:27017/yezbee?ssl=true&replicaSet=atlas-pu06nj-shard-0&authSource=admin&retryWrites=true&w=majority';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore DNS set failures
}

// In-Memory Fast Cache for Instant Product Responses (< 1ms)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 1000; // 5 seconds fast TTL for live DB sync

function getCachedData(key: string): any | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedData(key: string, data: any): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

function clearProductCache(): void {
  memoryCache.clear();
}

let isConnecting = false;

async function connectDB() {
  if (Number(mongoose.connection.readyState) === 1) {
    return;
  }

  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 10) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (Number(mongoose.connection.readyState) === 1) return;
  }

  isConnecting = true;
  try {
    await mongoose.connect(PRIMARY_MONGODB_URI, {
      dbName: 'yezbee',
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
  } catch (err: any) {
    console.warn('Primary SRV connection failed, trying Direct Mongo URI...', err?.message || err);
    try {
      await mongoose.connect(DIRECT_MONGODB_URI, {
        dbName: 'yezbee',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });
    } catch (directErr: any) {
      console.error('Direct Mongo URI connection error:', directErr?.message || directErr);
    }
  } finally {
    isConnecting = false;
  }
}

function getProductModel(): any {
  if (mongoose.models && mongoose.models.Product) {
    return mongoose.models.Product;
  }
  const ProductSchema = new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      description: { type: String, default: '' },
      shortDescription: { type: String, default: '' },
      category: { type: Schema.Types.Mixed },
      subcategory: { type: String, default: 'General' },
      productType: { type: String, default: null },
      brand: { type: String, default: 'YEZ BEE' },
      price: { type: Number, default: 0 },
      compareAtPrice: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED' },
      featured: { type: Boolean, default: false },
      bestSeller: { type: Boolean, default: false },
      newArrival: { type: Boolean, default: false },
      tags: [{ type: String }],
      images: [{ type: Schema.Types.Mixed }],
      variants: [{ type: Schema.Types.Mixed }],
      fabric: { type: String, default: 'Pure Cotton' },
      fit: { type: String, default: 'Regular' },
      pattern: { type: String, default: 'Printed' },
      occasion: { type: String, default: 'Casual' },
      careInstructions: [{ type: String }],
      seo: { type: Schema.Types.Mixed },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, strict: false }
  );
  return mongoose.model('Product', ProductSchema);
}

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export async function OPTIONS() {
  return corsResponse({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');
  const Product = getProductModel();

  try {
    if (path === 'health') {
      const dbConnected = Number(mongoose.connection.readyState) === 1;
      return corsResponse({
        success: true,
        message: dbConnected ? 'YEZ BEE API is running & Mongoose Connected' : 'YEZ BEE API is running (Connecting DB...)',
        dbConnected,
        databaseState: mongoose.connection.readyState === 1 ? 'CONNECTED (1)' : `CONNECTING (${mongoose.connection.readyState})`,
        databaseName: 'yezbee',
        timestamp: new Date().toISOString(),
      });
    }

    if (path === 'debug') {
      const dbConnected = Number(mongoose.connection.readyState) === 1;
      let colNames: string[] = [];
      let productCountInDb = 0;
      let sampleProducts: any[] = [];
      if (dbConnected && mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        colNames = collections.map((c) => c.name);
        if (Product) {
          productCountInDb = await Product.countDocuments({});
          sampleProducts = await Product.find({}).limit(5).lean();
        }
      }
      return corsResponse({
        success: true,
        dbConnected,
        colNames,
        productCountInDb,
        sampleProducts: sampleProducts.map((p) => ({ id: p._id, name: p.name, category: p.category, images: p.images })),
        timestamp: new Date().toISOString(),
      });
    }


    const cacheKey = `req_${request.url}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return corsResponse(cached);
    }

    if (path === 'products/admin/all') {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const skip = (page - 1) * limit;

      const [items, total] = Product
        ? await Promise.all([
            Product.find({})
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .lean(),

            Product.countDocuments({}),
          ])
        : [[], 0];

      const resData = {
        success: true,
        data: items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    if (path === 'products/admin/stats') {
      if (!Product) {
        return corsResponse({
          success: true,
          data: { total: 0, published: 0, draft: 0, archived: 0, lowStock: 0, outOfStock: 0, featured: 0 },
        });
      }

      const [total, published, draft, archived, featured] = await Promise.all([
        Product.countDocuments({}),
        Product.countDocuments({ status: 'PUBLISHED' }),
        Product.countDocuments({ status: 'DRAFT' }),
        Product.countDocuments({ status: 'ARCHIVED' }),
        Product.countDocuments({ featured: true }),
      ]);

      const resData = {
        success: true,
        data: { total, published, draft, archived, lowStock: 0, outOfStock: 0, featured },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    if (path === 'categories') {
      const categoriesData = {
        success: true,
        data: [
          { _id: 'cat-1', name: 'CASUALS', slug: 'casuals', hasFeedingSplit: true },
          { _id: 'cat-2', name: 'PARTY WEAR', slug: 'party-wear', hasFeedingSplit: true },
          { _id: 'cat-3', name: 'ETHNIC WEAR', slug: 'ethnic-wear', hasFeedingSplit: true },
          { _id: 'cat-4', name: 'LOUNGE WEAR', slug: 'lounge-wear', hasFeedingSplit: false },
          { _id: 'cat-5', name: 'PEPLUM TOPS', slug: 'peplum-tops', hasFeedingSplit: true },
          { _id: 'cat-6', name: 'KIDS WEAR', slug: 'kids-wear', hasFeedingSplit: false },
        ],
      };
      setCachedData(cacheKey, categoriesData);
      return corsResponse(categoriesData);
    }

function getCategoryModel(): any {
  if (mongoose.models && mongoose.models.Category) {
    return mongoose.models.Category;
  }
  const CategorySchema = new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, strict: false }
  );
  return mongoose.model('Category', CategorySchema);
}

    if (path === 'products' || path === 'products/featured') {
      const url = new URL(request.url);
      const isNew = url.searchParams.get('isNew') === 'true' || url.searchParams.get('newArrival') === 'true';
      const isBestSeller = url.searchParams.get('isBestSeller') === 'true' || url.searchParams.get('bestSeller') === 'true';
      const category = url.searchParams.get('category');
      const productType = url.searchParams.get('productType');
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};

      if (isNew) {
        filter.$or = [
          { newArrival: true },
          { isNewProduct: true },
          { isNew: true },
        ];
      }
      if (isBestSeller) {
        filter.$or = [
          { bestSeller: true },
          { isBestSeller: true },
          { bestseller: true },
        ];
      }
      if (productType && productType !== 'all') {
        filter.productType = productType.toUpperCase();
      }
      if (category && category.toLowerCase() !== 'all') {
        const normCat = category.toLowerCase().trim().replace(/[_\s]+/g, '-');
        const isObjId = mongoose.Types.ObjectId.isValid(category);
        const orConditions: any[] = [
          { categorySlug: new RegExp(normCat, 'i') },
          { 'category.slug': new RegExp(normCat, 'i') },
          { subcategory: new RegExp(normCat, 'i') },
          { categoryName: new RegExp(normCat, 'i') },
        ];
        if (isObjId) {
          orConditions.unshift({ category: category });
        } else {
          try {
            const Category = getCategoryModel();
            if (Category) {
              const catDocs = await Category.find({
                $or: [
                  { slug: new RegExp(normCat, 'i') },
                  { name: new RegExp(normCat, 'i') },
                ],
              }).lean();
              catDocs.forEach((cd: any) => {
                if (cd && cd._id) {
                  orConditions.unshift({ category: cd._id });
                  orConditions.unshift({ parentCategory: cd._id });
                }
              });
            }
          } catch (catErr) {
            console.warn('Category ObjectId resolution warning:', catErr);
          }
        }
        filter.$or = orConditions;
      }

      let [items, total] = Product
        ? await Promise.all([
            Product.find(filter)
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .lean(),
            Product.countDocuments(filter),
          ])
        : [[], 0];

      if ((!items || items.length === 0) && Product) {
        const [allDbItems, allTotal] = await Promise.all([
          Product.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Product.countDocuments({}),
        ]);
        if (allDbItems && allDbItems.length > 0) {
          items = allDbItems;
          total = allTotal;
        }
      }



      const resData = {
        success: true,
        data: items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }


    if (path.startsWith('products/')) {
      const idOrSlug = path.replace('products/', '').replace('id/', '');
      let item = null;
      if (Product) {
        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
          item = await Product.findById(idOrSlug).lean();
        }
        if (!item) {
          item = await Product.findOne({ slug: idOrSlug }).lean();
        }
        if (!item) {
          item = await Product.findOne({ name: new RegExp(`^${idOrSlug}$`, 'i') }).lean();
        }
      }
      if (!item) {
        return corsResponse({ success: false, message: 'Product not found' }, 404);
      }
      const resData = { success: true, data: item, product: item };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    return corsResponse({ success: true, message: 'API V1 Active', timestamp: new Date().toISOString() });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message || 'Server error' }, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');
  const Product = getProductModel();

  try {
    if (path === 'products/upload-image' || path === 'products/upload-images') {
      try {
        const formData = await request.formData();
        const file = (formData.get('image') as File) || (formData.get('images') as File);
        if (file) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          let processedBuffer = buffer;
          let mimeType = file.type || 'image/jpeg';

          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const sharp = require('sharp');
            processedBuffer = await sharp(buffer)
              .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toBuffer();
            mimeType = 'image/jpeg';
          } catch (sharpErr) {
            console.warn('Sharp compression fallback:', sharpErr);
          }

          const base64 = `data:${mimeType};base64,${processedBuffer.toString('base64')}`;
          return corsResponse({
            success: true,
            message: 'Image uploaded successfully',
            data: {
              url: base64,
              secure_url: base64,
              public_id: `upload-${Date.now()}`,
              publicId: `upload-${Date.now()}`,
            },
          });
        }
      } catch (e: any) {
        console.warn('FormData parse error in upload route:', e);
      }
      return corsResponse({
        success: false,
        message: 'No image file provided for upload',
      }, 400);
    }

    if (path === 'payments/create-order' || path === 'payment/create-order') {
      const body = await request.json();
      const amount = body.amount || 100;
      const currency = body.currency || 'INR';

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TTw5p1xB5oHjpM';
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y';

      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
          }),
        });

        const order = await rzpResponse.json();

        if (!rzpResponse.ok) {
          throw new Error(order.error?.description || 'Razorpay order creation failed');
        }

        return corsResponse({
          success: true,
          data: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
          },
        });
      } catch (rzpErr: any) {
        console.error('Razorpay Order Error:', rzpErr);
        return corsResponse({
          success: false,
          message: rzpErr.message || 'Razorpay order creation failed',
        }, 500);
      }
    }

    if (path === 'payments/verify' || path === 'payment/verify') {
      const body = await request.json();
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

      const keySecret = process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y';

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        return corsResponse({
          success: true,
          message: 'Payment verified successfully!',
          data: { isVerified: true, razorpayOrderId, razorpayPaymentId },
        });
      } else {
        return corsResponse({
          success: false,
          message: 'Invalid payment signature',
        }, 400);
      }
    }

    if (path === 'products') {
      const body = await request.json();
      if (!Product) {
        return corsResponse({ success: false, message: 'Database model not initialized' }, 500);
      }

      let slug = body.slug || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${Date.now()}`);
      try {
        const existing = await Product.findOne({ slug });
        if (existing) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }
      } catch (e) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const newProduct = new Product({
        ...body,
        slug,
        status: body.status || 'PUBLISHED',
      });
      const saved = await newProduct.save();
      clearProductCache();
      return corsResponse(
        {
          success: true,
          data: saved,
          message: 'Product created successfully in MongoDB Atlas!',
        },
        201
      );
    }

    return corsResponse({ success: false, message: 'Route not found' }, 404);
  } catch (err: any) {
    console.error('POST Error:', err);
    return corsResponse({ success: false, message: err.message || 'Error processing request' }, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');
  const Product = getProductModel();

  try {
    if (path.startsWith('products/')) {
      const productId = path.replace('products/', '');
      const body = await request.json();
      const updated = Product ? await Product.findByIdAndUpdate(productId, body, { new: true }).lean() : null;
      clearProductCache();
      return corsResponse({
        success: true,
        data: updated,
        message: 'Product updated successfully in MongoDB Atlas!',
      });
    }
    return corsResponse({ success: false, message: 'Route not found' }, 404);
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');
  const Product = getProductModel();

  try {
    if (path.includes('/status')) {
      const productId = path.split('/')[1];
      const { status } = await request.json();
      const updated = Product ? await Product.findByIdAndUpdate(productId, { status }, { new: true }).lean() : null;
      clearProductCache();
      return corsResponse({ success: true, data: updated });
    }

    if (path.includes('/archive')) {
      const productId = path.split('/')[1];
      const updated = Product ? await Product.findByIdAndUpdate(productId, { status: 'ARCHIVED' }, { new: true }).lean() : null;
      clearProductCache();
      return corsResponse({ success: true, data: updated });
    }

    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');
  const Product = getProductModel();

  try {
    if (path.startsWith('products/')) {
      const productId = path.replace('products/', '');
      if (Product) await Product.findByIdAndDelete(productId);
      clearProductCache();
      return corsResponse({ success: true, message: 'Product deleted' });
    }
    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message }, 500);
  }
}
