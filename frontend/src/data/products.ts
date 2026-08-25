import { getSafeImageUrl } from '@/lib/utils';
import { getCategoryBySlug } from './categories';

export interface ProductVariant {
  id?: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  price?: number;
  compareAtPrice?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface ProductSeo {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  productType?: 'FEEDING' | 'NON-FEEDING' | null;
  subcategory: string;
  shortDescription: string;
  description: string;
  highlights?: string[];
  price: number;
  compareAtPrice: number | null;
  costPrice?: number;
  discountPercentage: number;
  currency: string;
  images: string[];
  thumbnail: string;
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  fabric: string;
  fit: string;
  pattern?: string;
  neckStyle?: string;
  sleeveLength?: string;
  length?: string;
  occasion: string;
  gender: string;
  ageGroup?: string;
  maternity: boolean;
  feedingFriendly: boolean;
  sizes: string[];
  stock: number;
  lowStockThreshold?: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  status: 'published' | 'draft' | 'archived';
  active: boolean;
  seo?: ProductSeo;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_PRODUCTS: CatalogProduct[] = [];


const STORAGE_KEY = 'yezbee_admin_products_v2';
const DELETED_KEYS = 'yezbee_deleted_product_ids_v1';

export function getDeletedProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DELETED_KEYS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markProductAsDeleted(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getDeletedProductIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_KEYS, JSON.stringify(deleted));
    }
  } catch (err) {
    console.error('Failed to mark product as deleted:', err);
  }
}

export function getAllProducts(): CatalogProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const deletedIds = getDeletedProductIds();
  try {
    const keysToCheck = [
      'yezbee_admin_products_v2',
      'yezbee_admin_products_v1',
      'yezbee_admin_products',
      'yezbee_products',
      'yezbee_catalog',
    ];

    let allCustomProducts: any[] = [];
    keysToCheck.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              if (p && (p.id || p.name) && !allCustomProducts.some((exist) => (exist.id && exist.id === p.id) || (exist.slug && exist.slug === p.slug))) {
                allCustomProducts.push(p);
              }
            });
          }
        }
      } catch (e) {}
    });

    const combined = [...allCustomProducts];
    INITIAL_PRODUCTS.forEach((ip) => {
      if (!combined.some((p: any) => (p.id && p.id === ip.id) || (p.slug && p.slug === ip.slug))) {
        combined.push(ip);
      }
    });

    const mapped = combined.map((p: any) => {
      const catConfig = getCategoryBySlug(p.category) || (p.categoryName ? getCategoryBySlug(p.categoryName) : undefined);
      const categorySlug = catConfig?.slug || (typeof p.category === 'string' && !p.category.match(/^[0-9a-fA-F]{24}$/) ? p.category.toLowerCase().trim() : 'casuals');
      const categoryName = catConfig?.name || p.categoryName || getCategoryNameBySlug(categorySlug);
      return {
        ...p,
        id: p.id || p._id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
        category: categorySlug,
        categoryName,
        price: Number(p.price) || 999,
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        discountPercentage: p.discountPercentage || 0,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []),
        thumbnail: p.thumbnail || (Array.isArray(p.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url || p.images[0]?.secure_url || '') : ''),
        stock: typeof p.stock === 'number' ? p.stock : 10,
        colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Standard', hex: '#000000' }],
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
        status: 'published',
        active: true,
      };
    });

    return mapped.filter((p) => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  } catch (err) {
    console.error('Failed to parse catalog products from storage:', err);
    return INITIAL_PRODUCTS.filter((p) => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  }
}

export const CATALOG_PRODUCTS: CatalogProduct[] = INITIAL_PRODUCTS;

function sanitizeProductForStorage(p: CatalogProduct): CatalogProduct {
  const sanitizeUrl = (url: any) => {
    if (typeof url === 'string' && url.startsWith('data:image/') && url.length > 250000) {
      return '';
    }
    return typeof url === 'string' ? url : '';
  };

  return {
    ...p,
    thumbnail: sanitizeUrl(p.thumbnail),
    images: Array.isArray(p.images) ? p.images.map(sanitizeUrl).filter(Boolean) : [],
  };
}

function saveProductsToStorage(products: CatalogProduct[]) {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = products.map(sanitizeProductForStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('yezbee_products_updated'));
  } catch (err) {
    console.warn('LocalStorage quota warning, compressing image data and retrying:', err);
    try {
      const stripped = products.map((p) => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map((img: any) => (typeof img === 'string' && img.startsWith('data:') ? '' : img)).filter(Boolean)
          : [],
        thumbnail: typeof p.thumbnail === 'string' && p.thumbnail.startsWith('data:') ? '' : p.thumbnail,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      window.dispatchEvent(new Event('yezbee_products_updated'));
    } catch (finalErr) {
      console.error('Could not save product catalog to localStorage:', finalErr);
    }
  }
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  const products = getAllProducts();
  return products.find((p) => (p.slug === slug || p.id === slug) && p.status !== 'archived');
}

export function getProductById(id: string): CatalogProduct | undefined {
  const products = getAllProducts();
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string, productType?: 'FEEDING' | 'NON-FEEDING' | string | null): CatalogProduct[] {
  const normalizedCat = categorySlug.toLowerCase().trim();
  const products = getAllProducts().filter((p) => (p.status || 'published').toLowerCase() === 'published');
  
  if (normalizedCat === 'all') return products;

  const legacyMap: Record<string, { cat: string; type?: 'FEEDING' | 'NON-FEEDING' }> = {
    'maternity-kurtis': { cat: 'casuals', type: 'FEEDING' },
    'maternity-feeding-loungewears': { cat: 'lounge-wear', type: 'FEEDING' },
    'maternity-intimatewears': { cat: 'lounge-wear', type: 'FEEDING' },
    'non-maternity-kurtis-dresses': { cat: 'casuals', type: 'NON-FEEDING' },
    'kids-clothing': { cat: 'kids-wear' },
    'loungewear': { cat: 'lounge-wear', type: 'NON-FEEDING' },
  };

  let targetCat = normalizedCat;
  let targetType = productType;

  if (legacyMap[normalizedCat]) {
    targetCat = legacyMap[normalizedCat].cat;
    if (!targetType) {
      targetType = legacyMap[normalizedCat].type;
    }
  }

  const categoryConfig = getCategoryBySlug(targetCat);
  const targetCategorySlug = categoryConfig?.slug || targetCat;
  const targetCategoryName = (categoryConfig?.name || targetCat).toLowerCase();

  return products.filter((p) => {
    const rawCat = typeof p.category === 'string' ? p.category : (p.category as any)?.slug || (p.category as any)?.name || '';
    const rawCatName = (p.categoryName || '').toLowerCase().trim();

    const catSlug = rawCat.toLowerCase().trim().replace(/\s+/g, '-');
    const catNameSlug = rawCatName.replace(/\s+/g, '-');

    const matchesCat =
      catSlug === targetCategorySlug ||
      catNameSlug === targetCategorySlug ||
      rawCatName === targetCategoryName ||
      catSlug.includes(targetCategorySlug) ||
      targetCategorySlug.includes(catSlug) ||
      (categoryConfig && (p.category === categoryConfig.id || p.category === categoryConfig.slug));

    if (!matchesCat) return false;

    if (targetType && targetType !== 'all') {
      const normType = targetType.toUpperCase();
      return (p.productType || '').toUpperCase() === normType;
    }

    return true;
  });
}

function safeImg(url?: any): string {
  if (!url) return '';
  let raw: any = url;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.secure_url || raw.url || raw.publicId || raw.public_id || '';
  }
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const trimmed = raw.trim();
  if (
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]' ||
    trimmed === 'none' ||
    trimmed.startsWith('blob:')
  ) {
    return '';
  }
  return trimmed;
}

export function saveOrUpdateProduct(productData: Partial<CatalogProduct>): CatalogProduct {
  const products = getAllProducts();

  const id = productData.id || `PRD-${Date.now()}`;
  const now = new Date().toISOString();

  let computedStock = productData.stock || 0;
  if (productData.variants && productData.variants.length > 0) {
    computedStock = productData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }

  let discountPercentage = productData.discountPercentage || 0;
  if (productData.price && productData.compareAtPrice && productData.compareAtPrice > productData.price) {
    discountPercentage = Math.round(((productData.compareAtPrice - productData.price) / productData.compareAtPrice) * 100);
  }

  const existingIndex = products.findIndex((p) => p.id === id);

  const rawCat = productData.category || 'casuals';
  const catConfig = getCategoryBySlug(rawCat) || (productData.categoryName ? getCategoryBySlug(productData.categoryName) : undefined);
  const normalizedCategorySlug = catConfig?.slug || (typeof rawCat === 'string' && !rawCat.match(/^[0-9a-fA-F]{24}$/) ? rawCat.toLowerCase().trim() : 'casuals');
  const normalizedCategoryName = catConfig?.name || productData.categoryName || getCategoryNameBySlug(normalizedCategorySlug);

  const fullProduct: CatalogProduct = {
    id,
    slug: productData.slug || slugify(productData.name || 'product'),
    name: productData.name || 'Untitled Product',
    category: normalizedCategorySlug,
    categoryName: normalizedCategoryName,
    productType: productData.productType || null,
    subcategory: productData.subcategory || (productData.productType === 'FEEDING' ? 'Feeding' : productData.productType === 'NON-FEEDING' ? 'Non-Feeding' : 'General'),
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    highlights: productData.highlights || [],
    price: productData.price || 0,
    compareAtPrice: productData.compareAtPrice || null,
    costPrice: productData.costPrice || 0,
    discountPercentage,
    currency: productData.currency || 'INR',
    images: (productData.images && productData.images.length > 0)
      ? productData.images.map((img: any) => safeImg(img)).filter(Boolean)
      : [],
    thumbnail: safeImg(productData.thumbnail || (productData.images && productData.images[0])),
    colors: productData.colors || [{ name: 'Default', hex: '#000000' }],
    variants: productData.variants || [],
    fabric: productData.fabric || '100% Pure Cotton',
    fit: productData.fit || 'Regular Fit',
    pattern: productData.pattern || 'Printed',
    neckStyle: productData.neckStyle || 'Round Neck',
    sleeveLength: productData.sleeveLength || '3/4th Sleeve',
    length: productData.length || 'Regular',
    occasion: productData.occasion || 'Everyday',
    gender: productData.gender || 'Women',
    ageGroup: productData.ageGroup || '',
    maternity: productData.productType === 'FEEDING' || !!productData.maternity,
    feedingFriendly: productData.productType === 'FEEDING' || !!productData.feedingFriendly,
    sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
    stock: computedStock,
    lowStockThreshold: productData.lowStockThreshold || 5,
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 0,
    tags: productData.tags || [],
    careInstructions: productData.careInstructions || 'Machine wash cold.',
    shippingInfo: productData.shippingInfo || 'Dispatched within 24 hours.',
    returnPolicy: productData.returnPolicy || '7-day easy returns.',
    featured: !!productData.featured,
    bestseller: !!productData.bestseller,
    newArrival: !!productData.newArrival,
    status: productData.status || 'published',
    active: (productData.status || 'published') === 'published',
    seo: productData.seo || {
      title: `${productData.name || 'Product'} | YEZ BEE Fashion`,
      description: productData.shortDescription || 'Shop YEZ BEE Fashion.',
    },
    createdAt: existingIndex >= 0 ? products[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    products[existingIndex] = fullProduct;
  } else {
    products.unshift(fullProduct);
  }

  saveProductsToStorage(products);
  return fullProduct;
}

export function updateProductStatus(id: string, newStatus: 'published' | 'draft' | 'archived'): boolean {
  const products = getAllProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) return false;

  products[index].status = newStatus;
  products[index].active = newStatus === 'published';
  products[index].updatedAt = new Date().toISOString();

  saveProductsToStorage(products);
  return true;
}

export function duplicateProduct(id: string): CatalogProduct | null {
  const original = getProductById(id);
  if (!original) return null;

  const newId = `PRD-${Date.now()}`;
  const copy: CatalogProduct = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    status: 'draft',
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: original.variants.map((v) => ({
      ...v,
      sku: `${v.sku}-COPY`,
    })),
  };

  return saveOrUpdateProduct(copy);
}

export function deleteOrArchiveProduct(id: string): boolean {
  return updateProductStatus(id, 'archived');
}

export function permanentDeleteProduct(id: string): boolean {
  markProductAsDeleted(id);
  const products = getAllProducts().filter((p) => p.id !== id && p.slug !== id);
  saveProductsToStorage(products);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yezbee_products_updated'));
  }
  return true;
}


export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getCategoryNameBySlug(slug: string): string {
  const map: Record<string, string> = {
    'casuals': 'CASUALS',
    'party-wear': 'PARTY WEAR',
    'ethnic-wear': 'ETHNIC WEAR',
    'lounge-wear': 'LOUNGE WEAR',
    'peplum-tops': 'PEPLUM TOPS',
    'kids-wear': 'KIDS WEAR',
  };
  return map[slug] || 'CASUALS';
}
