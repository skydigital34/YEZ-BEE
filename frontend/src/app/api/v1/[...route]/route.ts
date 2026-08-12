import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema } from 'mongoose';

// MongoDB Atlas connection string
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sbfashionamazon:dharu1234@yez-bee.pnmkrhi.mongodb.net/yezbee?retryWrites=true&w=majority';

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'yezbee',
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
  } catch (err) {
    console.error('Next.js API MongoDB connection failed:', err);
  }
}

// Reuse or register Product Schema
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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

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

  try {
    // 1. GET /api/v1/products/admin/all
    if (path === 'products/admin/all') {
      const items = await Product.find({}).sort({ createdAt: -1 }).lean();
      return corsResponse({
        success: true,
        data: items,
        pagination: { total: items.length, page: 1, limit: 100 },
      });
    }

    // 2. GET /api/v1/products/admin/stats
    if (path === 'products/admin/stats') {
      const items = await Product.find({}).lean();
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
          { _id: 'cat-1', name: 'Maternity Kurtis', slug: 'maternity-kurtis', hasFeedingSplit: true },
          { _id: 'cat-2', name: 'Feed Maternity Maxis', slug: 'feed-maternity-maxis', hasFeedingSplit: true },
          { _id: 'cat-3', name: 'Maternity Bottom Wear', slug: 'maternity-bottom-wear', hasFeedingSplit: false },
          { _id: 'cat-4', name: 'Feeding Tops & Shirts', slug: 'feeding-tops-shirts', hasFeedingSplit: true },
          { _id: 'cat-5', name: 'Nursing Wear', slug: 'nursing-wear', hasFeedingSplit: true },
          { _id: 'cat-6', name: 'Kids Wear', slug: 'kids-wear', hasFeedingSplit: false },
        ],
      });
    }

    // 4. GET /api/v1/products
    if (path === 'products' || path === 'products/featured') {
      const items = await Product.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).lean();
      return corsResponse({
        success: true,
        data: items,
        pagination: { total: items.length, page: 1, limit: 100 },
      });
    }

    // 5. GET /api/v1/products/:slugOrId
    if (path.startsWith('products/')) {
      const idOrSlug = path.replace('products/', '');
      const item =
        (await Product.findOne({ slug: idOrSlug }).lean()) ||
        (mongoose.Types.ObjectId.isValid(idOrSlug) ? await Product.findById(idOrSlug).lean() : null);
      if (!item) {
        return corsResponse({ success: false, message: 'Product not found' }, 404);
      }
      return corsResponse({ success: true, data: item });
    }

    return corsResponse({ success: true, message: 'API V1 Active' });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message || 'Server error' }, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  await connectDB();
  const { route } = await params;
  const path = (route || []).join('/');

  try {
    // 1. POST /api/v1/products/upload-image
    if (path === 'products/upload-image' || path === 'products/upload-images') {
      try {
        const formData = await request.formData();
        const file = formData.get('image') as File || formData.get('images') as File;
        if (file) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
          return corsResponse({
            success: true,
            data: {
              url: base64,
              secure_url: base64,
              public_id: `upload-${Date.now()}`,
              publicId: `upload-${Date.now()}`,
            },
          });
        }
      } catch {
        // Fallback for JSON base64 upload
      }
      return corsResponse({
        success: true,
        data: {
          url: '/images/categories/maternity-kurtis.jpg',
          secure_url: '/images/categories/maternity-kurtis.jpg',
          publicId: `img-${Date.now()}`,
        },
      });
    }

    // 2. POST /api/v1/products (Create Product)
    if (path === 'products') {
      const body = await request.json();
      const newProduct = new Product({
        ...body,
        status: body.status || 'PUBLISHED',
      });
      const saved = await newProduct.save();
      return corsResponse({
        success: true,
        data: saved,
        message: 'Product created successfully in MongoDB Atlas!',
      }, 201);
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

  try {
    if (path.startsWith('products/')) {
      const productId = path.replace('products/', '');
      const body = await request.json();
      const updated = await Product.findByIdAndUpdate(productId, body, { new: true }).lean();
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

  try {
    if (path.includes('/status')) {
      const productId = path.split('/')[1];
      const { status } = await request.json();
      const updated = await Product.findByIdAndUpdate(productId, { status }, { new: true }).lean();
      return corsResponse({ success: true, data: updated });
    }

    if (path.includes('/archive')) {
      const productId = path.split('/')[1];
      const updated = await Product.findByIdAndUpdate(productId, { status: 'ARCHIVED' }, { new: true }).lean();
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

  try {
    if (path.startsWith('products/')) {
      const productId = path.replace('products/', '');
      await Product.findByIdAndDelete(productId);
      return corsResponse({ success: true, message: 'Product deleted' });
    }
    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ success: false, message: err.message }, 500);
  }
}
