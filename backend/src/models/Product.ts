import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../utils/helpers';
import { RATING_VALUES } from '../utils/constants';

export interface IProductImage {
  url: string;
  publicId?: string;
  alt: string;
  isPrimary: boolean;
  order?: number;
  sortOrder?: number;
}

export interface IProductVideo {
  url: string;
  thumbnail: string;
}

export interface IProductVariant {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: IProductImage[];
  isActive: boolean;
}

export interface IModelInfo {
  height: string;
  sizeWorn: string;
  fitType: string;
}

export interface ISeo {
  title: string;
  description: string;
  ogImage: string;
}

export interface IRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface IShippingInfo {
  free: boolean;
  estimatedDays: string;
  weight: number;
}

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  parentCategory?: mongoose.Types.ObjectId | null;
  subcategory: string;
  productType?: 'FEEDING' | 'NON-FEEDING' | null;
  brand: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tags: string[];
  images: IProductImage[];
  videos: IProductVideo[];
  variants: IProductVariant[];
  fabric: string;
  fit: string;
  neckStyle: string;
  sleeveLength: string;
  pattern: string;
  length: string;
  occasion: string;
  modelInfo: IModelInfo;
  careInstructions: string[];
  washCare: string;
  features: string[];
  specifications: Map<string, string>;
  seo: ISeo;
  ratings: { average: number; count: number; distribution: IRatingDistribution };
  reviewCount: number;
  soldCount: number;
  isNewProduct: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  featuredOrder: number;
  returnPolicy: string;
  shippingInfo: IShippingInfo;
  taxRate?: number;
  imageUrl?: string;
  imagePublicId?: string;
  isPublished?: boolean;
  getDiscountedPrice(variantSku: string): number | null;
  isInStock(variantSku: string): boolean;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productVideoSchema = new Schema<IProductVideo>(
  {
    url: { type: String, required: true },
    thumbnail: { type: String },
  },
  { _id: false }
);

const variantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, default: '#000000' },
    size: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [productImageSchema],
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const modelInfoSchema = new Schema<IModelInfo>(
  {
    height: { type: String },
    sizeWorn: { type: String },
    fitType: { type: String },
  },
  { _id: false }
);

const seoSchema = new Schema<ISeo>(
  {
    title: { type: String },
    description: { type: String },
    ogImage: { type: String },
  },
  { _id: false }
);

const ratingDistributionSchema = new Schema<IRatingDistribution>(
  {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },
  { _id: false }
);

const shippingInfoSchema = new Schema<IShippingInfo>(
  {
    free: { type: Boolean, default: false },
    estimatedDays: { type: String },
    weight: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    subcategory: { type: String, trim: true },
    productType: { type: String, enum: ['FEEDING', 'NON-FEEDING', null], default: null },
    brand: { type: String, trim: true, default: 'YEZ BEE' },
    price: { type: Number, default: 0, min: 0 },
    compareAtPrice: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    tags: [{ type: String, lowercase: true, trim: true, index: true }],
    images: [productImageSchema],
    videos: [productVideoSchema],
    variants: [variantSchema],
    fabric: { type: String },
    fit: { type: String },
    neckStyle: { type: String },
    sleeveLength: { type: String },
    pattern: { type: String },
    length: { type: String },
    occasion: { type: String },
    modelInfo: modelInfoSchema,
    careInstructions: [{ type: String }],
    washCare: { type: String },
    features: [{ type: String }],
    specifications: { type: Map, of: String, default: new Map() },
    seo: seoSchema,
    ratings: {
      type: new Schema(
        {
          average: { type: Number, default: 0, min: 0, max: 5 },
          count: { type: Number, default: 0, min: 0 },
          distribution: ratingDistributionSchema,
        },
        { _id: false }
      ),
      default: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    },
    reviewCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    isNewProduct: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    featuredOrder: { type: Number, default: 0 },
    returnPolicy: { type: String },
    shippingInfo: shippingInfoSchema,
    taxRate: { type: Number, default: 0.18 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ parentCategory: 1, status: 1 });
productSchema.index({ category: 1, productType: 1, status: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'variants.size': 1, status: 1 });
productSchema.index({ 'variants.colorHex': 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ soldCount: -1 });
productSchema.index({ featuredOrder: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ 'variants.size': 1, isActive: 1 });

productSchema.pre<IProductDocument>('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

productSchema.methods.getDiscountedPrice = function (
  variantSku: string
): number | null {
  const variant = this.variants.find(
    (v: IProductVariant) => v.sku === variantSku
  );
  if (!variant || !variant.compareAtPrice || variant.compareAtPrice <= variant.price) {
    return null;
  }
  const discountPercent =
    ((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100;
  return Math.round(discountPercent * 100) / 100;
};

productSchema.methods.isInStock = function (variantSku: string): boolean {
  const variant = this.variants.find(
    (v: IProductVariant) => v.sku === variantSku
  );
  return variant ? variant.stock > 0 : false;
};

productSchema.virtual('discountPercent').get(function (this: IProductDocument) {
  if (!this.variants || !this.variants.length) return 0;
  const minPrice = Math.min(...this.variants.map((v: IProductVariant) => v.price));
  const maxCompare = Math.max(
    ...this.variants.map((v: IProductVariant) => v.compareAtPrice || 0)
  );
  if (maxCompare > minPrice) {
    return Math.round(((maxCompare - minPrice) / maxCompare) * 100);
  }
  return 0;
});

productSchema.virtual('minPrice').get(function (this: IProductDocument) {
  if (!this.variants || !this.variants.length) return 0;
  const activeVariants = this.variants.filter((v: IProductVariant) => v.isActive);
  return Math.min(...activeVariants.map((v: IProductVariant) => v.price));
});

productSchema.virtual('imageUrl').get(function (this: IProductDocument) {
  if (this.images && this.images.length > 0 && this.images[0].url) {
    return this.images[0].url;
  }
  return '';
});

productSchema.virtual('imagePublicId').get(function (this: IProductDocument) {
  if (this.images && this.images.length > 0 && this.images[0].publicId) {
    return this.images[0].publicId;
  }
  return '';
});

productSchema.virtual('isPublished').get(function (this: IProductDocument) {
  return this.status === 'PUBLISHED' && this.isActive === true;
});

const Product = mongoose.model<IProductDocument>('Product', productSchema);

export default Product;
