import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema } from 'mongoose';
import dns from 'dns';

// MongoDB Atlas connection strings
const PRIMARY_MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sbfashionamazon:dharu1234@yez-bee.pnmkrhi.mongodb.net/yezbee?retryWrites=true&w=majority';

const DIRECT_MONGODB_URI =
  'mongodb://sbfashionamazon:dharu1234@ac-gvh0e4p-shard-00-01.pnmkrhi.mongodb.net:27017,ac-gvh0e4p-shard-00-00.pnmkrhi.mongodb.net:27017,ac-gvh0e4p-shard-00-02.pnmkrhi.mongodb.net:27017/yezbee?ssl=true&replicaSet=atlas-pu06nj-shard-0&authSource=admin&retryWrites=true&w=majority';

// Configure DNS for MongoDB SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore DNS set failures
}

let isConnecting = false;

async function connectDB() {
  if (Number(mongoose.connection.readyState) === 1) {
    return;
  }

  if (isConnecting) {
    while (isConnecting) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (Number(mongoose.connection.readyState) === 1) return;
  }

  isConnecting = true;
  try {
    try {
      await mongoose.connect(PRIMARY_MONGODB_URI, {
        dbName: 'yezbee',
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
        bufferCommands: false,
      });
    } catch (srvErr: any) {
      console.warn('Primary SRV connection failed, attempting direct cluster nodes...');
      await mongoose.connect(DIRECT_MONGODB_URI, {
        dbName: 'yezbee',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        bufferCommands: false,
      });
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

// CORS Headers helper
function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // 0. GET /api/v1/health
    if (path === 'health') {
      return corsResponse({
        success: true,
        message: 'YEZ BEE API is running',
        timestamp: new Date().toISOString(),
      });
    }

    // 1. GET /api/v1/products/admin/all
    if (path === 'products/admin/all') {
      const items = Product ? await Product.find({}).sort({ createdAt: -1 }).lean() : [];
      return corsResponse({
        success: true,
        data: items,
        pagination: { total: items.length, page: 1, limit: 100 },
      });
    }

    // 2. GET /api/v1/products/admin/stats
    if (path === 'products/admin/stats') {
      const items = Product ? await Product.find({}).lean() : [];
      const total = items.length;
      const published = items.filter((p: any) => p.status === 'PUBLISHED').length;
      const draft = items.filter((p: any) => p.status === 'DRAFT').length;
      const archived = items.filter((p: any) => p.status === 'ARCHIVED').length;
      const lowStock = items.filter((p: any) => {
        const stock = (p.variants || []).reduce((s: number, v: any) => s + (v.stock || 0), 0);
        return stock > 0 && stock <= 5;
      }).length;
      const outOfStock = items.filter((p: any) => {
        const stock = (p.variants || []).reduce((s: number, v: any) => s + (v.stock || 0), 0);
        return stock === 0;
      }).length;
      const featured = items.filter((p: any) => Boolean(p.featured)).length;

      return corsResponse({
        success: true,
        data: { total, published, draft, archived, lowStock, outOfStock, featured },
      });
    }

    // 3. GET /api/v1/categories
    if (path === 'categories') {
      return corsResponse({
        success: true,
        data: [
          { _id: 'cat-1', name: 'CASUALS', slug: 'casuals', hasFeedingSplit: true },
          { _id: 'cat-2', name: 'PARTY WEAR', slug: 'party-wear', hasFeedingSplit: true },
          { _id: 'cat-3', name: 'ETHNIC WEAR', slug: 'ethnic-wear', hasFeedingSplit: true },
          { _id: 'cat-4', name: 'LOUNGE WEAR', slug: 'lounge-wear', hasFeedingSplit: false },
          { _id: 'cat-5', name: 'PEPLUM TOPS', slug: 'peplum-tops', hasFeedingSplit: true },
          { _id: 'cat-6', name: 'KIDS WEAR', slug: 'kids-wear', hasFeedingSplit: false },
        ],
      });
    }

    // 4. GET /api/v1/products
    if (path === 'products' || path === 'products/featured') {
      const url = new URL(request.url);
      const isNew = url.searchParams.get('isNew') === 'true' || url.searchParams.get('newArrival') === 'true';
      const isBestSeller = url.searchParams.get('isBestSeller') === 'true' || url.searchParams.get('bestSeller') === 'true';
      const category = url.searchParams.get('category');
      const productType = url.searchParams.get('productType');
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);

      const filter: Record<string, any> = {
        $or: [{ status: 'PUBLISHED' }, { status: { $exists: false }, isActive: true }],
      };

      if (isNew) filter.newArrival = true;
      if (isBestSeller) filter.bestSeller = true;
      if (productType && productType !== 'all') filter.productType = productType.toUpperCase();
      if (category && category !== 'all') {
        filter.$and = [
          {
            $or: [
              { category: category },
              { categorySlug: category },
              { 'category.slug': category },
              { subcategory: new RegExp(category, 'i') },
            ],
          },
        ];
      }

      let query = Product ? Product.find(filter).sort({ createdAt: -1 }).limit(limit).lean() : [];
      let items = Product ? await query : [];

      // Fallback: If filtered returned 0 products (e.g. initial setup), return all published products
      if (items.length === 0 && Product) {
        items = await Product.find({
          $or: [{ status: 'PUBLISHED' }, { status: { $exists: false }, isActive: true }],
        }).sort({ createdAt: -1 }).limit(limit).lean();
      }

      return corsResponse({
        success: true,
        data: items,
        pagination: { total: items.length, page: 1, limit },
      });
    }

    // 5. GET /api/v1/products/:slugOrId
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
      return corsResponse({ success: true, data: item, product: item });
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
    // 1. POST /api/v1/products/upload-image
    if (path === 'products/upload-image' || path === 'products/upload-images') {
      try {
        const formData = await request.formData();
        const file = (formData.get('image') as File) || (formData.get('images') as File);
        if (file) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
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

    // 2. POST /api/v1/products (Create Product)
    if (path === 'products') {
      const body = await request.json();
      if (!Product) {
        return corsResponse({ success: false, message: 'Database model not initialized' }, 500);
      }
      const newProduct = new Product({
        ...body,
        status: body.status || 'PUBLISHED',
      });
      const saved = await newProduct.save();
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
      return corsResponse({ success: true, data: updated });
    }

    if (path.includes('/archive')) {
      const productId = path.split('/')[1];
      const updated = Product ? await Product.findByIdAndUpdate(productId, { status: 'ARCHIVED' }, { new: true }).lean() : null;
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
      return corsResponse({ success: true, message: 'Product deleted' });
    }
    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message }, 500);
  }
}
