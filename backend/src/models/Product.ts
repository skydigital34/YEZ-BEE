import { getDb } from '../config/firebase';
import { slugify } from '../utils/helpers';

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

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string; // Category ID or name
  parentCategory?: string | null;
  subcategory?: string;
  productType?: 'FEEDING' | 'NON-FEEDING' | null;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tags: string[];
  images: IProductImage[];
  videos?: IProductVideo[];
  variants: IProductVariant[];
  fabric?: string;
  fit?: string;
  neckStyle?: string;
  sleeveLength?: string;
  pattern?: string;
  length?: string;
  occasion?: string;
  modelInfo?: IModelInfo;
  careInstructions?: string[];
  washCare?: string;
  features?: string[];
  specifications?: Record<string, string>;
  seo?: ISeo;
  ratings?: { average: number; count: number; distribution: IRatingDistribution };
  reviewCount?: number;
  soldCount?: number;
  isNewProduct?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  featuredOrder?: number;
  returnPolicy?: string;
  shippingInfo?: IShippingInfo;
  taxRate?: number;
  imageUrl?: string;
  imagePublicId?: string;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductModel {
  private static collectionName = 'products';

  private static getFieldValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    if (path === '_id' || path === 'id') {
      return obj._id || obj.id;
    }
    if (path.includes('.')) {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (Array.isArray(current)) {
          return current.map(item => this.getFieldValue(item, part)).flat();
        }
        current = current[part];
      }
      return current;
    }
    return obj[path];
  }

  private static matchValue(value: any, target: any): boolean {
    if (target instanceof RegExp) {
      return target.test(String(value));
    }
    if (target && typeof target === 'object' && !(target instanceof Date)) {
      if (target.$regex) {
        const flags = target.$options || '';
        const regex = new RegExp(target.$regex, flags);
        return regex.test(String(value));
      }
      let matches = true;
      if (target.$gte !== undefined) matches = matches && (Number(value) >= Number(target.$gte));
      if (target.$lte !== undefined) matches = matches && (Number(value) <= Number(target.$lte));
      if (target.$gt !== undefined) matches = matches && (Number(value) > Number(target.$gt));
      if (target.$lt !== undefined) matches = matches && (Number(value) < Number(target.$lt));
      if (target.$ne !== undefined) matches = matches && (value !== target.$ne);
      if (target.$exists !== undefined) matches = matches && ((value !== undefined && value !== null) === Boolean(target.$exists));
      if (target.$in !== undefined && Array.isArray(target.$in)) {
        const valArr = Array.isArray(value) ? value : [value];
        matches = matches && valArr.some(v =>
          target.$in.some((t: any) => {
            if (t instanceof RegExp) return t.test(String(v));
            return String(v).toLowerCase() === String(t).toLowerCase();
          })
        );
      }
      return matches;
    }
    if (Array.isArray(value)) {
      return value.includes(target);
    }
    return value === target;
  }

  private static matchQuery(product: IProduct, query: Record<string, any>): boolean {
    if (query.$or && Array.isArray(query.$or)) {
      if (!query.$or.some((subQuery: any) => this.matchQuery(product, subQuery))) {
        return false;
      }
    }
    if (query.$and && Array.isArray(query.$and)) {
      if (!query.$and.every((subQuery: any) => this.matchQuery(product, subQuery))) {
        return false;
      }
    }

    for (const [key, target] of Object.entries(query)) {
      if (key === '$or' || key === '$and') continue;
      const value = this.getFieldValue(product, key);
      if (Array.isArray(value)) {
        const matches = value.some(v => this.matchValue(v, target));
        if (!matches) return false;
      } else {
        if (!this.matchValue(value, target)) return false;
      }
    }
    return true;
  }

  public static async findById(id: string): Promise<IProduct | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return { _id: doc.id, id: doc.id, ...data } as IProduct;
  }

  public static async findOne(query: Record<string, any>): Promise<IProduct | null> {
    const items = await this.find(query, {}, { limit: 1 });
    return items.length > 0 ? items[0] : null;
  }

  public static async find(query: Record<string, any> = {}, options: { sort?: any; skip?: number; limit?: number } = {}, legacyOptions?: { sort?: any; skip?: number; limit?: number }): Promise<IProduct[]> {
    const db = getDb();
    const snapshot = await db.collection(this.collectionName).get();
    let products = snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as IProduct));

    // Handle legacy signature where options is passed as third parameter
    const opts = legacyOptions || options || {};

    if (Object.keys(query).length > 0) {
      products = products.filter(product => this.matchQuery(product, query));
    }

    if (opts.sort) {
      const sortEntries = Object.entries(opts.sort);
      products.sort((a, b) => {
        for (const [field, direction] of sortEntries) {
          const valA = this.getFieldValue(a, field);
          const valB = this.getFieldValue(b, field);
          const dir = direction === -1 || direction === 'desc' ? -1 : 1;
          if (valA === undefined && valB !== undefined) return 1;
          if (valA !== undefined && valB === undefined) return -1;
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
        }
        return 0;
      });
    }

    if (opts.skip) {
      products = products.slice(opts.skip);
    }
    if (opts.limit) {
      products = products.slice(0, opts.limit);
    }

    return products;
  }

  public static async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const items = await this.find(query);
    return items.length;
  }

  public static async create(data: Partial<IProduct>): Promise<IProduct> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const name = data.name || '';
    const slug = data.slug || slugify(name);

    const newProduct: IProduct = {
      name,
      slug,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      category: data.category || '',
      parentCategory: data.parentCategory || null,
      subcategory: data.subcategory || 'General',
      productType: data.productType || null,
      brand: data.brand || 'YEZ BEE',
      price: data.price || 0,
      compareAtPrice: data.compareAtPrice || 0,
      discount: data.discount || 0,
      status: data.status || 'PUBLISHED',
      featured: data.featured || false,
      bestSeller: data.bestSeller || false,
      newArrival: data.newArrival || false,
      tags: data.tags || [],
      images: data.images || [],
      videos: data.videos || [],
      variants: data.variants || [],
      fabric: data.fabric || '',
      fit: data.fit || '',
      neckStyle: data.neckStyle || '',
      sleeveLength: data.sleeveLength || '',
      pattern: data.pattern || '',
      length: data.length || '',
      occasion: data.occasion || '',
      modelInfo: data.modelInfo,
      careInstructions: data.careInstructions || [],
      washCare: data.washCare || '',
      features: data.features || [],
      specifications: data.specifications || {},
      seo: data.seo,
      ratings: data.ratings || { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      reviewCount: data.reviewCount || 0,
      soldCount: data.soldCount || 0,
      isNewProduct: data.isNewProduct || false,
      isTrending: data.isTrending || false,
      isBestSeller: data.isBestSeller || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      featuredOrder: data.featuredOrder || 0,
      returnPolicy: data.returnPolicy || '',
      shippingInfo: data.shippingInfo,
      taxRate: data.taxRate || 0.18,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newProduct);
    return { _id: docRef.id, id: docRef.id, ...newProduct };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    if (!id) return null;
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc(id);

    const payload = {
      ...updateData,
      updatedAt: new Date(),
    };

    await docRef.set(payload, { merge: true });
    return this.findById(id);
  }

  public static async findByIdAndDelete(id: string): Promise<boolean> {
    if (!id) return false;
    const db = getDb();
    await db.collection(this.collectionName).doc(id).delete();
    return true;
  }
}

// Compatibility export
const Product = ProductModel;
export default Product;
