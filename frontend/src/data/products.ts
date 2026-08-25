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

export const INITIAL_PRODUCTS: CatalogProduct[] = [
  {
    id: 'mat-kurti-1',
    slug: 'floral-cotton-feeding-casual-kurti',
    name: 'Floral Cotton A-Line Feeding Casual Kurti',
    category: 'casuals',
    categoryName: 'CASUALS',
    productType: 'FEEDING',
    subcategory: 'Feeding',
    shortDescription: 'Breathable pure cotton A-line casual kurti with discreet feeding access.',
    description: 'Designed for everyday comfort, this floral print A-line kurti is crafted from 100% breathable Mulberry cotton. Features dual concealed vertical zips for seamless feeding access.',
    highlights: [
      '100% breathable Mulberry cotton',
      'Discreet feeding zipper access',
      'Relaxed body silhouette',
      'Hypoallergenic soft skin feel',
    ],
    price: 1899,
    compareAtPrice: 2499,
    costPrice: 950,
    discountPercentage: 24,
    currency: 'INR',
    images: [
      '/images/hero/hero1.png',
      '/images/hero/hero2.png',
    ],
    thumbnail: '/images/hero/hero1.png',
    colors: [
      { name: 'Peach Floral', hex: '#FFDAB9' },
      { name: 'Navy Blue', hex: '#1B2A4A' },
      { name: 'Sage Green', hex: '#8FBC8F' },
    ],
    variants: [
      { color: 'Peach Floral', size: 'S', sku: 'YZB-CAS-F1-PCH-S', stock: 8, isActive: true },
      { color: 'Peach Floral', size: 'M', sku: 'YZB-CAS-F1-PCH-M', stock: 12, isActive: true },
      { color: 'Peach Floral', size: 'L', sku: 'YZB-CAS-F1-PCH-L', stock: 5, isActive: true },
      { color: 'Navy Blue', size: 'M', sku: 'YZB-CAS-F1-NAV-M', stock: 10, isActive: true },
    ],
    fabric: '100% Pure Cotton',
    fit: 'Relaxed A-Line Silhouette',
    pattern: 'Floral Print',
    neckStyle: 'Mandarin Collar',
    sleeveLength: '3/4th Sleeve',
    length: 'Calf Length (46")',
    occasion: 'Everyday & Office Wear',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 35,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 42,
    tags: ['casuals', 'feeding', 'kurti', 'cotton', 'office wear'],
    careInstructions: 'Machine wash cold inside out with gentle detergent.',
    shippingInfo: 'Dispatched within 24 hours. Free delivery nationwide.',
    returnPolicy: '7-day doorstep exchange and return policy.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Floral Cotton A-Line Feeding Casual Kurti | YEZ BEE Fashion',
      description: 'Shop comfortable 100% cotton floral casual kurti with concealed feeding access.',
    },
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },

  {
    id: 'non-mat-1',
    slug: 'printed-a-line-non-feeding-casual-kurti',
    name: 'Printed A-Line Non-Feeding Casual Kurti',
    category: 'casuals',
    categoryName: 'CASUALS',
    productType: 'NON-FEEDING',
    subcategory: 'Non-Feeding',
    shortDescription: 'Classic non-feeding printed cotton casual kurti for daily wear and office.',
    description: 'Tailored with crisp non-feeding silhouettes, this chic A-line casual kurti features geometric motif prints, Mandarin collar, and 3/4th sleeves.',
    highlights: ['100% fine cotton', 'Tailored non-feeding fit', 'Office & everyday casual'],
    price: 1499,
    compareAtPrice: 1999,
    costPrice: 650,
    discountPercentage: 25,
    currency: 'INR',
    images: [
      '/images/hero/hero2.png',
      '/images/hero/hero1.png',
    ],
    thumbnail: '/images/hero/hero2.png',
    colors: [
      { name: 'Indigo Blue', hex: '#3F51B5' },
      { name: 'Mustard Yellow', hex: '#FFC107' },
    ],
    variants: [
      { color: 'Indigo Blue', size: 'S', sku: 'YZB-CAS-NF1-IND-S', stock: 7, isActive: true },
      { color: 'Indigo Blue', size: 'M', sku: 'YZB-CAS-NF1-IND-M', stock: 12, isActive: true },
      { color: 'Mustard Yellow', size: 'M', sku: 'YZB-CAS-NF1-MUS-M', stock: 8, isActive: true },
    ],
    fabric: '100% Fine Cotton',
    fit: 'Standard Women\'s Fit',
    pattern: 'Geometric Print',
    neckStyle: 'Mandarin Collar',
    sleeveLength: '3/4th Sleeve',
    length: 'Knee Length',
    occasion: 'Office & Casual',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 27,
    lowStockThreshold: 5,
    rating: 4.6,
    reviewCount: 31,
    tags: ['casuals', 'non-feeding', 'kurti', 'printed', 'cotton'],
    careInstructions: 'Machine wash cold.',
    shippingInfo: 'Free shipping on orders above ₹999.',
    returnPolicy: '7-day doorstep return.',
    featured: true,
    bestseller: false,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Printed A-Line Non-Feeding Casual Kurti | YEZ BEE Fashion',
      description: 'Stylish non-feeding printed A-line casual kurti for office & daily wear.',
    },
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-08-02T14:00:00Z',
  },

  {
    id: 'party-feed-1',
    slug: 'anarkali-gold-print-feeding-party-dress',
    name: 'Anarkali Gold Print Feeding Party Dress',
    category: 'party-wear',
    categoryName: 'PARTY WEAR',
    productType: 'FEEDING',
    subcategory: 'Feeding',
    shortDescription: 'Festive flare Anarkali party gown with hidden feeding access.',
    description: 'Crafted from soft modal rayon, this flared Anarkali party gown offers effortless movement and elegant drape for festive celebrations with concealed feeding access.',
    highlights: ['Modal rayon fluid drape', 'Concealed feeding access', 'Festive gold prints'],
    price: 2299,
    compareAtPrice: 2999,
    costPrice: 1100,
    discountPercentage: 23,
    currency: 'INR',
    images: [
      '/images/hero/hero3.png',
      '/images/hero/hero2.png',
    ],
    thumbnail: '/images/hero/hero3.png',
    colors: [
      { name: 'Maroon Gold', hex: '#800000' },
      { name: 'Teal Blue', hex: '#008080' },
    ],
    variants: [
      { color: 'Maroon Gold', size: 'M', sku: 'YZB-PW-F1-MAR-M', stock: 6, isActive: true },
      { color: 'Maroon Gold', size: 'L', sku: 'YZB-PW-F1-MAR-L', stock: 4, isActive: true },
      { color: 'Teal Blue', size: 'M', sku: 'YZB-PW-F1-TEA-M', stock: 8, isActive: true },
    ],
    fabric: 'Soft Premium Rayon',
    fit: 'Empire Waist Flared Fit',
    pattern: 'Gold Ethnic Block Print',
    neckStyle: 'Round Neck with V-Cut',
    sleeveLength: '3/4th Sleeve',
    length: 'Ankle Length (52")',
    occasion: 'Festive & Party Wear',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 18,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 28,
    tags: ['party wear', 'feeding', 'anarkali', 'festive'],
    careInstructions: 'Dry clean recommended or hand wash cold.',
    shippingInfo: 'Express 2-day delivery available.',
    returnPolicy: '7-day easy return policy.',
    featured: true,
    bestseller: false,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Anarkali Gold Print Feeding Party Dress | YEZ BEE Fashion',
      description: 'Elegant flared Anarkali feeding party dress for festive celebrations.',
    },
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-08-02T11:00:00Z',
  },

  {
    id: 'party-nonfeed-1',
    slug: 'sequin-embroidered-non-feeding-party-gown',
    name: 'Sequin Embroidered Non-Feeding Party Gown',
    category: 'party-wear',
    categoryName: 'PARTY WEAR',
    productType: 'NON-FEEDING',
    subcategory: 'Non-Feeding',
    shortDescription: 'Luxury silk-blend sequin party gown for grand evening events.',
    description: 'Elevate your evening wardrobe with this exquisite sequin embroidered non-feeding party gown crafted with a flared fluid silhouette.',
    highlights: ['Silk-blend sequin embellishment', 'Fluid grand flare', 'Full satin lining'],
    price: 3499,
    compareAtPrice: 4999,
    costPrice: 1700,
    discountPercentage: 30,
    currency: 'INR',
    images: [
      '/images/hero/hero4.png',
      '/images/hero/hero3.png',
    ],
    thumbnail: '/images/hero/hero4.png',
    colors: [
      { name: 'Royal Emerald', hex: '#004B23' },
      { name: 'Midnight Black', hex: '#0B090A' },
    ],
    variants: [
      { color: 'Royal Emerald', size: 'M', sku: 'YZB-PW-NF1-EME-M', stock: 5, isActive: true },
      { color: 'Midnight Black', size: 'L', sku: 'YZB-PW-NF1-BLK-L', stock: 7, isActive: true },
    ],
    fabric: 'Silk Georgette Blend',
    fit: 'Flared Evening Silhouette',
    pattern: 'Sequin Embroidery',
    neckStyle: 'Sweetheart Neck',
    sleeveLength: 'Full Sleeve',
    length: 'Floor Length',
    occasion: 'Grand Party & Gala',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    lowStockThreshold: 3,
    rating: 5.0,
    reviewCount: 19,
    tags: ['party wear', 'non-feeding', 'gown', 'sequin'],
    careInstructions: 'Dry clean only.',
    shippingInfo: 'Insured luxury delivery.',
    returnPolicy: '7-day doorstep return.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Sequin Embroidered Non-Feeding Party Gown | YEZ BEE Fashion',
      description: 'Luxury sequin embroidered non-feeding party gown for evening celebrations.',
    },
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
  },

  {
    id: 'ethnic-1',
    slug: 'handcrafted-banarasi-silk-ethnic-saree',
    name: 'Handcrafted Banarasi Silk Ethnic Saree',
    category: 'ethnic-wear',
    categoryName: 'ETHNIC WEAR',
    productType: 'NON-FEEDING',
    subcategory: 'Non-Feeding',
    shortDescription: 'Pure handwoven Banarasi silk saree with ornate zari borders.',
    description: 'Heritage handwoven Banarasi silk saree woven with gold zari weaves. Comes with unstitched blouse piece.',
    highlights: ['Pure Banarasi Silk', 'Handcrafted zari weave', 'Unstitched matching blouse included'],
    price: 4599,
    compareAtPrice: 5999,
    costPrice: 2200,
    discountPercentage: 23,
    currency: 'INR',
    images: [
      '/images/hero/hero2.png',
      '/images/hero/hero1.png',
    ],
    thumbnail: '/images/hero/hero2.png',
    colors: [
      { name: 'Crimson Red', hex: '#990000' },
      { name: 'Royal Gold', hex: '#DAA520' },
    ],
    variants: [
      { color: 'Crimson Red', size: 'Free Size', sku: 'YZB-ETH-1-RED-FS', stock: 12, isActive: true },
      { color: 'Royal Gold', size: 'Free Size', sku: 'YZB-ETH-1-GLD-FS', stock: 9, isActive: true },
    ],
    fabric: 'Pure Banarasi Silk',
    fit: 'Classic Saree Drape',
    pattern: 'Gold Zari Brocade',
    occasion: 'Weddings & Festive',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['Free Size'],
    stock: 21,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 38,
    tags: ['ethnic wear', 'saree', 'banarasi', 'silk', 'wedding', 'non-feeding'],
    careInstructions: 'Dry clean only.',
    shippingInfo: 'Dispatched in rigid protective box.',
    returnPolicy: '7-day easy exchange.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Handcrafted Banarasi Silk Ethnic Saree | YEZ BEE Fashion',
      description: 'Authentic Banarasi silk ethnic saree with gold zari weave.',
    },
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },

  {
    id: 'feed-ethnic-1',
    slug: 'embroidered-festive-feeding-silk-anarkali-set',
    name: 'Embroidered Festive Feeding Silk Anarkali Set',
    category: 'ethnic-wear',
    categoryName: 'ETHNIC WEAR',
    productType: 'FEEDING',
    subcategory: 'Feeding',
    shortDescription: 'Exquisite silk blend Anarkali ethnic suit set with hidden nursing access.',
    description: 'Festive pure silk blend Anarkali suit styled with heavy gold zari embroidery on yoke and hem. Features dual concealed vertical feeding zippers for nursing ease during celebrations.',
    highlights: ['Concealed vertical feeding zips', 'Rich zari embroidered yoke', 'Complete kurta, pant & dupatta set'],
    price: 3899,
    compareAtPrice: 5299,
    costPrice: 1700,
    discountPercentage: 26,
    currency: 'INR',
    images: [
      '/images/hero/hero1.png',
      '/images/hero/hero2.png',
    ],
    thumbnail: '/images/hero/hero1.png',
    colors: [
      { name: 'Maroon Gold', hex: '#800000' },
      { name: 'Teal Blue', hex: '#008080' },
    ],
    variants: [
      { color: 'Maroon Gold', size: 'M', sku: 'YZB-ETH-F1-MRN-M', stock: 10, isActive: true },
      { color: 'Maroon Gold', size: 'L', sku: 'YZB-ETH-F1-MRN-L', stock: 8, isActive: true },
      { color: 'Teal Blue', size: 'M', sku: 'YZB-ETH-F1-TEL-M', stock: 6, isActive: true },
    ],
    fabric: 'Art Silk Blend',
    fit: 'Flared Anarkali Fit',
    pattern: 'Zari Embroidery',
    occasion: 'Weddings & Celebrations',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 24,
    lowStockThreshold: 4,
    rating: 4.9,
    reviewCount: 42,
    tags: ['ethnic wear', 'feeding', 'anarkali', 'silk', 'festive'],
    careInstructions: 'Dry clean recommended.',
    shippingInfo: 'Free express shipping nationwide.',
    returnPolicy: '7-day easy return policy.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
const INITIAL_PRODUCTS: CatalogProduct[] = [];

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
