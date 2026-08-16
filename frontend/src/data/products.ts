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
  category: string; // One of the 6 exact category slugs ('casuals', 'party-wear', 'ethnic-wear', 'lounge-wear', 'peplum-tops', 'kids-wear')
  categoryName: string; // Exact customer-facing category name
  productType?: 'FEEDING' | 'NON-FEEDING' | null; // Product-level feeding classification
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
  active: boolean; // Computed or alias for status === 'published'
  seo?: ProductSeo;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_PRODUCTS: CatalogProduct[] = [
  // ── CATEGORY 1: CASUALS → FEEDING ──────────────────────────────────────────
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
      '/images/categories/maternity-kurtis.jpg',
    ],
    thumbnail: '/images/categories/maternity-kurtis.jpg',
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

  // ── CATEGORY 1: CASUALS → NON-FEEDING ──────────────────────────────────────
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
    images: ['/images/categories/non-maternity-kurtis-dresses.jpg'],
    thumbnail: '/images/categories/non-maternity-kurtis-dresses.jpg',
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

  // ── CATEGORY 2: PARTY WEAR → FEEDING ──────────────────────────────────────
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
    images: ['/images/categories/maternity-kurtis.jpg'],
    thumbnail: '/images/categories/maternity-kurtis.jpg',
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

  // ── CATEGORY 2: PARTY WEAR → NON-FEEDING ──────────────────────────────────
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
    images: ['/images/luxury_featured_collection.jpg'],
    thumbnail: '/images/luxury_featured_collection.jpg',
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

  // ── CATEGORY 3: ETHNIC WEAR → NON-FEEDING ────────────────────────────────
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
    images: ['/images/luxury_featured_collection.jpg'],
    thumbnail: '/images/luxury_featured_collection.jpg',
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

  // ── CATEGORY 3: ETHNIC WEAR → FEEDING ────────────────────────────────────
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
    images: ['/images/categories/non-maternity-kurtis-dresses.jpg'],
    thumbnail: '/images/categories/non-maternity-kurtis-dresses.jpg',
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
    seo: {
      title: 'Embroidered Festive Feeding Silk Anarkali Set | YEZ BEE Fashion',
      description: 'Festive nursing friendly ethnic silk Anarkali suit set with invisible zips.',
    },
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },

  // ── CATEGORY 4: LOUNGE WEAR (STANDALONE) ──────────────────────────────────
  {
    id: 'feed-lounge-1',
    slug: 'soft-modal-everyday-lounge-set',
    name: 'Soft Modal Everyday Lounge Set',
    category: 'lounge-wear',
    categoryName: 'LOUNGE WEAR',
    productType: null,
    subcategory: 'Lounge Wear',
    shortDescription: 'Ultrasoft modal cotton two-piece pyjama lounge set for everyday relaxation.',
    description: 'Designed specifically for home and sleep comfort. Crafted from 95% modal knit stretch fabric with relaxed elasticated waistband.',
    highlights: ['95% Modal Cotton stretch', 'Relaxed waistband with drawstring', 'Breathable ultra-soft knit'],
    price: 1999,
    compareAtPrice: 2699,
    costPrice: 900,
    discountPercentage: 25,
    currency: 'INR',
    images: ['/images/categories/maternity-feeding-loungewears.jpg'],
    thumbnail: '/images/categories/maternity-feeding-loungewears.jpg',
    colors: [
      { name: 'Blush Pink', hex: '#FFB6C1' },
      { name: 'Lavender', hex: '#E6E6FA' },
    ],
    variants: [
      { color: 'Blush Pink', size: 'S', sku: 'YZB-LW-1-BLU-S', stock: 10, isActive: true },
      { color: 'Blush Pink', size: 'M', sku: 'YZB-LW-1-BLU-M', stock: 14, isActive: true },
      { color: 'Lavender', size: 'M', sku: 'YZB-LW-1-LAV-M', stock: 12, isActive: true },
    ],
    fabric: '95% Modal Cotton, 5% Elastane',
    fit: 'Relaxed Lounge Fit',
    pattern: 'Solid Pastel',
    neckStyle: 'Round Neck',
    sleeveLength: 'Short Sleeve',
    length: 'Regular Lounge Top & Pajama',
    occasion: 'Home & Sleepwear',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 36,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 64,
    tags: ['lounge wear', 'night suit', 'modal', 'cotton'],
    careInstructions: 'Machine wash gentle. Do not bleach.',
    shippingInfo: 'Free express shipping nationwide.',
    returnPolicy: '7-day easy return policy.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Soft Modal Everyday Lounge Set | YEZ BEE Fashion',
      description: 'Ultra soft modal cotton pyjama loungewear set for women.',
    },
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-08-03T09:00:00Z',
  },

  {
    id: 'lounge-1',
    slug: 'relaxed-cotton-pajama-lounge-set',
    name: 'Relaxed Cotton Pajama Lounge Set',
    category: 'lounge-wear',
    categoryName: 'LOUNGE WEAR',
    productType: null,
    subcategory: 'Lounge Wear',
    shortDescription: 'Everyday comfortable cotton lounge top and pajama set.',
    description: 'Women\'s loungewear set crafted from combed cotton knit. Designed for relaxing at home, weekend downtime, and comfortable sleep.',
    highlights: ['Combed cotton knit stretch', 'Elastic waistband with drawstring', 'Deep side pockets'],
    price: 1599,
    compareAtPrice: 2099,
    costPrice: 700,
    discountPercentage: 24,
    currency: 'INR',
    images: ['/images/categories/loungewear.jpg'],
    thumbnail: '/images/categories/loungewear.jpg',
    colors: [
      { name: 'Sage Green', hex: '#87A96B' },
      { name: 'Charcoal Grey', hex: '#36454F' },
    ],
    variants: [
      { color: 'Sage Green', size: 'S', sku: 'YZB-LW-NF1-SAG-S', stock: 9, isActive: true },
      { color: 'Sage Green', size: 'M', sku: 'YZB-LW-NF1-SAG-M', stock: 15, isActive: true },
      { color: 'Charcoal Grey', size: 'M', sku: 'YZB-LW-NF1-CHR-M', stock: 8, isActive: true },
    ],
    fabric: '100% Combed Cotton',
    fit: 'Regular Fit',
    pattern: 'Solid Heather',
    neckStyle: 'Crew Neck',
    sleeveLength: 'Short Sleeve',
    length: 'Regular Top & Straight Pajama',
    occasion: 'Lounge & Sleep',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 32,
    lowStockThreshold: 5,
    rating: 4.7,
    reviewCount: 45,
    tags: ['lounge wear', 'cotton pajama', 'casual loungewear'],
    careInstructions: 'Machine wash warm.',
    shippingInfo: 'Dispatched within 24 hours.',
    returnPolicy: '7-day doorstep return.',
    featured: true,
    bestseller: true,
    newArrival: false,
    status: 'published',
    active: true,
    seo: {
      title: 'Relaxed Cotton Pajama Non-Feeding Lounge Set | YEZ BEE Fashion',
      description: 'Comfortable pure cotton non-feeding loungewear set with pockets for home & sleep.',
    },
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },

  // ── CATEGORY 5: PEPLUM TOPS → FEEDING ─────────────────────────────────────
  {
    id: 'peplum-feed-1',
    slug: 'flared-cotton-feeding-peplum-top',
    name: 'Flared Cotton Feeding Peplum Top',
    category: 'peplum-tops',
    categoryName: 'PEPLUM TOPS',
    productType: 'FEEDING',
    subcategory: 'Feeding',
    shortDescription: 'Trendy waist-accentuated peplum top with hidden feeding access.',
    description: 'Chic flared peplum top crafted from breathable cotton, designed with concealed nursing zips to offer stylish nursing on the go.',
    highlights: ['Concealed nursing zips', 'Flared peplum cinch waist', 'Breathable cotton fabric'],
    price: 1699,
    compareAtPrice: 2199,
    costPrice: 750,
    discountPercentage: 23,
    currency: 'INR',
    images: ['/images/categories/maternity-kurtis.jpg'],
    thumbnail: '/images/categories/maternity-kurtis.jpg',
    colors: [
      { name: 'Blush Pink', hex: '#FFB6C1' },
      { name: 'Navy Blue', hex: '#1B2A4A' },
    ],
    variants: [
      { color: 'Blush Pink', size: 'S', sku: 'YZB-PEP-F1-BLU-S', stock: 8, isActive: true },
      { color: 'Blush Pink', size: 'M', sku: 'YZB-PEP-F1-BLU-M', stock: 11, isActive: true },
      { color: 'Navy Blue', size: 'M', sku: 'YZB-PEP-F1-NAV-M', stock: 9, isActive: true },
    ],
    fabric: '100% Pure Cotton',
    fit: 'Peplum Cinch Waist',
    pattern: 'Printed Tunic',
    neckStyle: 'V-Neck',
    sleeveLength: '3/4th Sleeve',
    length: 'Hip Length Peplum',
    occasion: 'Casual & Outings',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 28,
    lowStockThreshold: 5,
    rating: 4.7,
    reviewCount: 26,
    tags: ['peplum tops', 'feeding', 'cotton top', 'tunic'],
    careInstructions: 'Machine wash cold with like colors.',
    shippingInfo: 'Fast dispatch within 24 hours.',
    returnPolicy: '7-day easy doorstep returns.',
    featured: true,
    bestseller: false,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Flared Cotton Feeding Peplum Top | YEZ BEE Fashion',
      description: 'Chic cotton peplum tunic top with concealed nursing zips.',
    },
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-05T14:00:00Z',
  },

  // ── CATEGORY 5: PEPLUM TOPS → NON-FEEDING ─────────────────────────────────
  {
    id: 'peplum-nonfeed-1',
    slug: 'embroidered-cotton-non-feeding-peplum-top',
    name: 'Embroidered Cotton Non-Feeding Peplum Top',
    category: 'peplum-tops',
    categoryName: 'PEPLUM TOPS',
    productType: 'NON-FEEDING',
    subcategory: 'Non-Feeding',
    shortDescription: 'Modern embroidered non-feeding peplum tunic for western casual styling.',
    description: 'Chic non-feeding peplum tunic styled with schiffli embroidery and gathered waist silhouette.',
    highlights: ['Fine schiffli embroidery', 'Flared peplum hem', 'Regular non-feeding waist'],
    price: 1599,
    compareAtPrice: 1999,
    costPrice: 680,
    discountPercentage: 20,
    currency: 'INR',
    images: ['/images/categories/non-maternity-kurtis-dresses.jpg'],
    thumbnail: '/images/categories/non-maternity-kurtis-dresses.jpg',
    colors: [
      { name: 'Off White', hex: '#FAF9F6' },
      { name: 'Coral Pink', hex: '#FF6F61' },
    ],
    variants: [
      { color: 'Off White', size: 'S', sku: 'YZB-PEP-NF1-WHT-S', stock: 6, isActive: true },
      { color: 'Off White', size: 'M', sku: 'YZB-PEP-NF1-WHT-M', stock: 10, isActive: true },
      { color: 'Coral Pink', size: 'M', sku: 'YZB-PEP-NF1-CRL-M', stock: 7, isActive: true },
    ],
    fabric: 'Schiffli Cotton',
    fit: 'Standard Peplum Fit',
    pattern: 'Schiffli Embroidered',
    neckStyle: 'Square Neck',
    sleeveLength: 'Puff Short Sleeve',
    length: 'Waist Length',
    occasion: 'Casual & Brunch Wear',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 23,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 22,
    tags: ['peplum tops', 'non-feeding', 'embroidered', 'casual top'],
    careInstructions: 'Gentle hand wash.',
    shippingInfo: 'Dispatched within 24 hours.',
    returnPolicy: '7-day easy returns.',
    featured: false,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Embroidered Cotton Non-Feeding Peplum Top | YEZ BEE Fashion',
      description: 'Trendy schiffli embroidered non-feeding peplum tunic top for women.',
    },
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-06T10:00:00Z',
  },

  // ── CATEGORY 6: KIDS WEAR ─────────────────────────────────────────────────
  {
    id: 'kids-1',
    slug: 'floral-cotton-girls-party-dress',
    name: 'Floral Printed Cotton Girls Party Dress',
    category: 'kids-wear',
    categoryName: 'KIDS WEAR',
    productType: null,
    subcategory: 'Kids Wear',
    shortDescription: 'Charming pure cotton girls flared dress with soft cotton lining.',
    description: 'Crafted with hypoallergenic 100% cotton fabric and zero scratchy seams. Perfect for kids birthday parties, family gatherings, and everyday play.',
    highlights: ['100% hypoallergenic cotton', 'Zero scratchy seams', 'Comfort flared skirt'],
    price: 999,
    compareAtPrice: 1499,
    costPrice: 420,
    discountPercentage: 33,
    currency: 'INR',
    images: ['/images/categories/kids-clothing.jpg'],
    thumbnail: '/images/categories/kids-clothing.jpg',
    colors: [
      { name: 'Coral Pink', hex: '#FF6F61' },
      { name: 'Sunshine Yellow', hex: '#FFD700' },
    ],
    variants: [
      { color: 'Coral Pink', size: '1-2Y', sku: 'YZB-KD1-PNK-1Y', stock: 6, isActive: true },
      { color: 'Coral Pink', size: '2-3Y', sku: 'YZB-KD1-PNK-2Y', stock: 10, isActive: true },
      { color: 'Coral Pink', size: '3-4Y', sku: 'YZB-KD1-PNK-3Y', stock: 8, isActive: true },
      { color: 'Sunshine Yellow', size: '2-3Y', sku: 'YZB-KD1-YEL-2Y', stock: 7, isActive: true },
    ],
    fabric: '100% Soft Cotton',
    fit: 'Comfortable Kids Fit',
    pattern: 'Floral Print',
    neckStyle: 'Round Neck',
    sleeveLength: 'Cap Sleeve',
    length: 'Knee Length',
    occasion: 'Party & Casual',
    gender: 'Girls',
    ageGroup: '1Y to 6Y',
    maternity: false,
    feedingFriendly: false,
    sizes: ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y'],
    stock: 31,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 22,
    tags: ['kids wear', 'girls dress', 'cotton kids'],
    careInstructions: 'Gentle machine wash.',
    shippingInfo: 'Standard 3-day delivery.',
    returnPolicy: '7-day easy exchange.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Floral Printed Cotton Girls Dress | YEZ BEE Fashion',
      description: 'Hypoallergenic soft cotton party dress for young girls.',
    },
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-08-01T16:00:00Z',
  },
];

// ── Persistent Product Catalog Store (Single Source of Truth) ────────────────
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
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: CatalogProduct[] = INITIAL_PRODUCTS;
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }

    const mapped = list.map((p: any) => {
      const catConfig = getCategoryBySlug(p.category) || (p.categoryName ? getCategoryBySlug(p.categoryName) : undefined);
      const categorySlug = catConfig?.slug || (typeof p.category === 'string' && !p.category.match(/^[0-9a-fA-F]{24}$/) ? p.category.toLowerCase().trim() : 'casuals');
      const categoryName = catConfig?.name || p.categoryName || getCategoryNameBySlug(categorySlug);
      return {
        ...p,
        category: categorySlug,
        categoryName,
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
      return '/images/categories/maternity-kurtis.jpg';
    }
    return url;
  };

  return {
    ...p,
    thumbnail: sanitizeUrl(p.thumbnail),
    images: Array.isArray(p.images) ? p.images.map(sanitizeUrl) : p.images,
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

  // Check if legacy slug passed
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

// ── Admin Store Operations ───────────────────────────────────────────────────

function safeImg(url: any, fallback: string = ''): string {
  if (!url) return fallback;
  let raw: any = url;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.secure_url || raw.url || raw.publicId || raw.public_id || fallback;
  }
  if (typeof raw !== 'string' || !raw.trim() || raw.startsWith('blob:')) return fallback;
  let trimmed = raw.trim();
  if (trimmed.startsWith('http://') && trimmed.includes('cloudinary.com')) {
    trimmed = trimmed.replace('http://', 'https://');
  }
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:')
  ) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'smpyi8aw';
    trimmed = `https://res.cloudinary.com/${cloudName}/image/upload/${trimmed}`;
  }
  return trimmed;
}

export function saveOrUpdateProduct(productData: Partial<CatalogProduct>): CatalogProduct {
  const products = getAllProducts();

  const id = productData.id || `PRD-${Date.now()}`;
  const now = new Date().toISOString();

  // Compute total stock from variants if available
  let computedStock = productData.stock || 0;
  if (productData.variants && productData.variants.length > 0) {
    computedStock = productData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }

  // Derive discount percentage
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
