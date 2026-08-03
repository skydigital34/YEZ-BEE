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
  category: string; // One of the 6 exact category slugs
  categoryName: string; // Exact category display name
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
  // ── CATEGORY 1: MATERNITY KURTIS ───────────────────────────────────────────
  {
    id: 'mat-kurti-1',
    slug: 'floral-cotton-maternity-kurti',
    name: 'Floral Cotton A-Line Maternity Kurti',
    category: 'maternity-kurtis',
    categoryName: 'Maternity Kurtis',
    subcategory: 'Cotton Kurtis',
    shortDescription: 'Breathable pure cotton A-line maternity kurti with generous pregnancy bump room.',
    description: 'Designed for ultimate comfort during pregnancy, this floral print A-line kurti is crafted from 100% breathable Mulberry cotton. Features side gathers that expand gracefully with your growing bump.',
    highlights: [
      '100% breathable Mulberry cotton',
      'Side gathers for pregnancy bump expansion',
      'Discreet feeding zipper access',
      'Hypoallergenic soft skin feel',
    ],
    price: 1899,
    compareAtPrice: 2499,
    costPrice: 950,
    discountPercentage: 24,
    currency: 'INR',
    images: [
      '/images/categories/maternity-kurtis.jpg',
      '/images/maternity/slide1.jpg',
    ],
    thumbnail: '/images/categories/maternity-kurtis.jpg',
    colors: [
      { name: 'Peach Floral', hex: '#FFDAB9' },
      { name: 'Navy Blue', hex: '#1B2A4A' },
      { name: 'Sage Green', hex: '#8FBC8F' },
    ],
    variants: [
      { color: 'Peach Floral', size: 'S', sku: 'YZB-MK1-PCH-S', stock: 8, isActive: true },
      { color: 'Peach Floral', size: 'M', sku: 'YZB-MK1-PCH-M', stock: 12, isActive: true },
      { color: 'Peach Floral', size: 'L', sku: 'YZB-MK1-PCH-L', stock: 5, isActive: true },
      { color: 'Peach Floral', size: 'XL', sku: 'YZB-MK1-PCH-XL', stock: 0, isActive: true },
      { color: 'Navy Blue', size: 'M', sku: 'YZB-MK1-NAV-M', stock: 10, isActive: true },
      { color: 'Navy Blue', size: 'L', sku: 'YZB-MK1-NAV-L', stock: 7, isActive: true },
      { color: 'Navy Blue', size: 'XL', sku: 'YZB-MK1-NAV-XL', stock: 3, isActive: true },
      { color: 'Navy Blue', size: '2XL', sku: 'YZB-MK1-NAV-2XL', stock: 2, isActive: true },
      { color: 'Sage Green', size: 'S', sku: 'YZB-MK1-SAG-S', stock: 6, isActive: true },
      { color: 'Sage Green', size: 'M', sku: 'YZB-MK1-SAG-M', stock: 9, isActive: true },
      { color: 'Sage Green', size: 'L', sku: 'YZB-MK1-SAG-L', stock: 0, isActive: true },
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
    stock: 62,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 42,
    tags: ['maternity', 'kurti', 'cotton', 'office wear'],
    careInstructions: 'Machine wash cold inside out with gentle detergent.',
    shippingInfo: 'Dispatched within 24 hours. Free delivery nationwide.',
    returnPolicy: '7-day doorstep exchange and return policy.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Floral Cotton A-Line Maternity Kurti | YEZ BEE Fashion',
      description: 'Shop comfortable 100% cotton floral maternity kurti with bump expansion and feeding access.',
    },
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'mat-kurti-2',
    slug: 'anarkali-rayon-maternity-kurti',
    name: 'Anarkali Printed Rayon Maternity Kurti',
    category: 'maternity-kurtis',
    categoryName: 'Maternity Kurtis',
    subcategory: 'Anarkali Kurtis',
    shortDescription: 'Festive flare Anarkali maternity kurti with fluid drape and empire waist.',
    description: 'Crafted from soft modal rayon, this flared Anarkali maternity kurti offers effortless movement and elegant drape for festive celebrations and family occasions.',
    highlights: ['Modal rayon fluid drape', 'Empire waist maternity flare', 'Festive gold prints'],
    price: 2299,
    compareAtPrice: 2999,
    costPrice: 1100,
    discountPercentage: 23,
    currency: 'INR',
    images: ['/images/maternity/slide3.jpg', '/images/categories/maternity-kurtis.jpg'],
    thumbnail: '/images/maternity/slide3.jpg',
    colors: [
      { name: 'Maroon Gold', hex: '#800000' },
      { name: 'Teal Blue', hex: '#008080' },
    ],
    variants: [
      { color: 'Maroon Gold', size: 'M', sku: 'YZB-MK2-MAR-M', stock: 6, isActive: true },
      { color: 'Maroon Gold', size: 'L', sku: 'YZB-MK2-MAR-L', stock: 4, isActive: true },
      { color: 'Maroon Gold', size: 'XL', sku: 'YZB-MK2-MAR-XL', stock: 2, isActive: true },
      { color: 'Teal Blue', size: 'S', sku: 'YZB-MK2-TEA-S', stock: 5, isActive: true },
      { color: 'Teal Blue', size: 'M', sku: 'YZB-MK2-TEA-M', stock: 8, isActive: true },
      { color: 'Teal Blue', size: '2XL', sku: 'YZB-MK2-TEA-2XL', stock: 3, isActive: true },
    ],
    fabric: 'Soft Premium Rayon',
    fit: 'Empire Waist Flared Fit',
    pattern: 'Gold Ethnic Block Print',
    neckStyle: 'Round Neck with V-Cut',
    sleeveLength: '3/4th Sleeve',
    length: 'Ankle Length (52")',
    occasion: 'Festive & Celebration',
    gender: 'Women',
    maternity: true,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 32,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 28,
    tags: ['maternity', 'anarkali', 'festive', 'rayon'],
    careInstructions: 'Dry clean recommended or hand wash cold.',
    shippingInfo: 'Express 2-day delivery available.',
    returnPolicy: '7-day easy return policy.',
    featured: true,
    bestseller: false,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Anarkali Printed Rayon Maternity Kurti | YEZ BEE Fashion',
      description: 'Elegant flared Anarkali maternity kurti for festive celebrations.',
    },
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-08-02T11:00:00Z',
  },

  // ── CATEGORY 2: MATERNITY FEEDING LOUNGEWEARS ──────────────────────────────
  {
    id: 'feed-lounge-1',
    slug: 'soft-modal-nursing-lounge-set',
    name: 'Soft Modal Nursing & Feeding Lounge Set',
    category: 'maternity-feeding-loungewears',
    categoryName: 'Maternity Feeding Loungewears',
    subcategory: 'Nursing Lounge Sets',
    shortDescription: 'Ultrasoft nursing lounge set with dual concealed zippers for easy breastfeeding.',
    description: 'Designed specifically for pregnancy through postpartum nursing. Features invisible 2-way zippers on both sides for discreet and effortless breastfeeding access.',
    highlights: ['Concealed 2-way nursing zippers', '95% Modal Cotton stretch', 'Postpartum relaxed waistband'],
    price: 1999,
    compareAtPrice: 2699,
    costPrice: 900,
    discountPercentage: 25,
    currency: 'INR',
    images: ['/images/categories/maternity-feeding-loungewears.jpg', '/images/maternity/slide2.jpg'],
    thumbnail: '/images/categories/maternity-feeding-loungewears.jpg',
    colors: [
      { name: 'Blush Pink', hex: '#FFB6C1' },
      { name: 'Lavender', hex: '#E6E6FA' },
      { name: 'Mint Green', hex: '#98FF98' },
    ],
    variants: [
      { color: 'Blush Pink', size: 'S', sku: 'YZB-FL1-BLU-S', stock: 10, isActive: true },
      { color: 'Blush Pink', size: 'M', sku: 'YZB-FL1-BLU-M', stock: 14, isActive: true },
      { color: 'Blush Pink', size: 'L', sku: 'YZB-FL1-BLU-L', stock: 8, isActive: true },
      { color: 'Lavender', size: 'M', sku: 'YZB-FL1-LAV-M', stock: 12, isActive: true },
      { color: 'Lavender', size: 'XL', sku: 'YZB-FL1-LAV-XL', stock: 6, isActive: true },
      { color: 'Mint Green', size: 'L', sku: 'YZB-FL1-MNT-L', stock: 5, isActive: true },
      { color: 'Mint Green', size: '2XL', sku: 'YZB-FL1-MNT-2XL', stock: 3, isActive: true },
    ],
    fabric: '95% Modal Cotton, 5% Elastane',
    fit: 'Relaxed Postpartum Fit',
    pattern: 'Solid Pastel',
    neckStyle: 'Round Neck',
    sleeveLength: 'Short Sleeve',
    length: 'Regular Lounge Top & Pajama',
    occasion: 'Home & Sleepwear',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 58,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 64,
    tags: ['nursing', 'feeding', 'loungewear', 'postpartum'],
    careInstructions: 'Machine wash gentle. Do not bleach.',
    shippingInfo: 'Free express shipping nationwide.',
    returnPolicy: '7-day easy return policy.',
    featured: true,
    bestseller: true,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Soft Modal Nursing Lounge Set | YEZ BEE Fashion',
      description: 'Breastfeeding-friendly lounge set with invisible side zips.',
    },
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-08-03T09:00:00Z',
  },

  // ── CATEGORY 3: MATERNITY INTIMATEWEARS ────────────────────────────────────
  {
    id: 'mat-inti-1',
    slug: 'seamless-nursing-bra-pack-of-2',
    name: 'Seamless Stretch Nursing Bra (Pack of 2)',
    category: 'maternity-intimatewears',
    categoryName: 'Maternity Intimatewears',
    subcategory: 'Nursing Bras',
    shortDescription: 'Wire-free seamless maternity and nursing bra with one-hand drop-down clips.',
    description: 'Unbelievably soft wire-free nursing bra pack offering 360-degree stretch to adapt to breast size changes during pregnancy and lactating stages. Features front drop-down clips.',
    highlights: ['Wire-free 360-degree stretch', 'One-hand front nursing clip', 'Removable breathable pads'],
    price: 1299,
    compareAtPrice: 1799,
    costPrice: 550,
    discountPercentage: 27,
    currency: 'INR',
    images: ['/images/categories/maternity-intimatewears.jpg'],
    thumbnail: '/images/categories/maternity-intimatewears.jpg',
    colors: [
      { name: 'Nude & Black', hex: '#E3C1B4' },
      { name: 'Blush & White', hex: '#FDE8E8' },
    ],
    variants: [
      { color: 'Nude & Black', size: 'M', sku: 'YZB-MI1-NB-M', stock: 15, isActive: true },
      { color: 'Nude & Black', size: 'L', sku: 'YZB-MI1-NB-L', stock: 18, isActive: true },
      { color: 'Nude & Black', size: 'XL', sku: 'YZB-MI1-NB-XL', stock: 10, isActive: true },
      { color: 'Nude & Black', size: '2XL', sku: 'YZB-MI1-NB-2XL', stock: 6, isActive: true },
      { color: 'Blush & White', size: 'M', sku: 'YZB-MI1-BW-M', stock: 12, isActive: true },
      { color: 'Blush & White', size: 'L', sku: 'YZB-MI1-BW-L', stock: 14, isActive: true },
    ],
    fabric: 'Microfiber Nylon & Spandex',
    fit: 'Wire-Free Support',
    pattern: 'Solid Seamless',
    occasion: 'Daily Intimate Essential',
    gender: 'Women',
    maternity: true,
    feedingFriendly: true,
    sizes: ['M', 'L', 'XL', '2XL'],
    stock: 75,
    lowStockThreshold: 10,
    rating: 4.9,
    reviewCount: 92,
    tags: ['nursing bra', 'intimatewear', 'seamless', 'support'],
    careInstructions: 'Hand wash cold. Line dry in shade.',
    shippingInfo: 'Hygiene sealed packaging.',
    returnPolicy: 'Non-returnable for hygiene reasons unless defective.',
    featured: true,
    bestseller: true,
    newArrival: false,
    status: 'published',
    active: true,
    seo: {
      title: 'Seamless Stretch Nursing Bra Pack of 2 | YEZ BEE Fashion',
      description: 'Wire-free seamless nursing bra with one-hand drop-down clips.',
    },
    createdAt: '2026-07-12T10:00:00Z',
    updatedAt: '2026-08-01T15:00:00Z',
  },

  // ── CATEGORY 4: NON-MATERNITY KURTIS & DRESSES ─────────────────────────────
  {
    id: 'non-mat-1',
    slug: 'printed-a-line-everyday-kurti',
    name: 'Printed A-Line Everyday Cotton Kurti',
    category: 'non-maternity-kurtis-dresses',
    categoryName: 'Non-Maternity Kurtis & Dresses',
    subcategory: 'Printed Kurtis',
    shortDescription: 'Classic non-maternity printed cotton kurti for daily wear and office.',
    description: 'Tailored for standard women\'s silhouettes, this chic A-line kurti features geometric motif prints, Mandarin collar, and 3/4th sleeves.',
    highlights: ['100% fine cotton', 'Tailored non-maternity fit', 'Office & everyday casual'],
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
      { color: 'Indigo Blue', size: 'S', sku: 'YZB-NM1-IND-S', stock: 7, isActive: true },
      { color: 'Indigo Blue', size: 'M', sku: 'YZB-NM1-IND-M', stock: 12, isActive: true },
      { color: 'Indigo Blue', size: 'L', sku: 'YZB-NM1-IND-L', stock: 9, isActive: true },
      { color: 'Mustard Yellow', size: 'S', sku: 'YZB-NM1-MUS-S', stock: 5, isActive: true },
      { color: 'Mustard Yellow', size: 'M', sku: 'YZB-NM1-MUS-M', stock: 8, isActive: true },
      { color: 'Mustard Yellow', size: 'XL', sku: 'YZB-NM1-MUS-XL', stock: 3, isActive: true },
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
    stock: 44,
    lowStockThreshold: 5,
    rating: 4.6,
    reviewCount: 31,
    tags: ['kurti', 'non-maternity', 'printed', 'cotton'],
    careInstructions: 'Machine wash cold.',
    shippingInfo: 'Free shipping on orders above ₹999.',
    returnPolicy: '7-day doorstep return.',
    featured: true,
    bestseller: false,
    newArrival: true,
    status: 'published',
    active: true,
    seo: {
      title: 'Printed A-Line Everyday Cotton Kurti | YEZ BEE Fashion',
      description: 'Stylish non-maternity printed A-line kurti for office & casual wear.',
    },
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-08-02T14:00:00Z',
  },

  // ── CATEGORY 5: KIDS CLOTHING ──────────────────────────────────────────────
  {
    id: 'kids-1',
    slug: 'floral-cotton-girls-dress',
    name: 'Floral Printed Cotton Girls Party Dress',
    category: 'kids-clothing',
    categoryName: 'Kids Clothing',
    subcategory: 'Girls Dresses',
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
      { color: 'Coral Pink', size: '5-6Y', sku: 'YZB-KD1-PNK-5Y', stock: 4, isActive: true },
      { color: 'Sunshine Yellow', size: '2-3Y', sku: 'YZB-KD1-YEL-2Y', stock: 7, isActive: true },
      { color: 'Sunshine Yellow', size: '4-5Y', sku: 'YZB-KD1-YEL-4Y', stock: 5, isActive: true },
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
    stock: 40,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 22,
    tags: ['kids dress', 'girls clothing', 'cotton kids'],
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

  // ── CATEGORY 6: LOUNGEWEAR ────────────────────────────────────────────────
  {
    id: 'lounge-1',
    slug: 'relaxed-cotton-pajama-lounge-set',
    name: 'Relaxed Cotton Pajama Lounge Set',
    category: 'loungewear',
    categoryName: 'Loungewear',
    subcategory: 'Pajama Sets',
    shortDescription: 'Everyday comfortable cotton lounge top and pajama set for women.',
    description: 'General women\'s non-maternity loungewear set crafted from combed cotton knit. Designed for relaxing at home, weekend downtime, and comfortable sleep.',
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
      { color: 'Sage Green', size: 'S', sku: 'YZB-LG1-SAG-S', stock: 9, isActive: true },
      { color: 'Sage Green', size: 'M', sku: 'YZB-LG1-SAG-M', stock: 15, isActive: true },
      { color: 'Sage Green', size: 'L', sku: 'YZB-LG1-SAG-L', stock: 11, isActive: true },
      { color: 'Charcoal Grey', size: 'M', sku: 'YZB-LG1-CHR-M', stock: 8, isActive: true },
      { color: 'Charcoal Grey', size: 'XL', sku: 'YZB-LG1-CHR-XL', stock: 6, isActive: true },
    ],
    fabric: 'Combed Cotton Knit',
    fit: 'Relaxed Casual Fit',
    pattern: 'Solid Colour',
    neckStyle: 'Crew Neck',
    sleeveLength: 'Half Sleeve',
    length: 'Full Length Pajama',
    occasion: 'Home & Sleepwear',
    gender: 'Women',
    maternity: false,
    feedingFriendly: false,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 49,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 45,
    tags: ['loungewear', 'pajama set', 'cotton night suit'],
    careInstructions: 'Machine wash cold.',
    shippingInfo: 'Dispatched within 24 hours.',
    returnPolicy: '7-day doorstep return.',
    featured: true,
    bestseller: true,
    newArrival: false,
    status: 'published',
    active: true,
    seo: {
      title: 'Relaxed Cotton Pajama Lounge Set | YEZ BEE Fashion',
      description: 'Comfortable pure cotton loungewear set with pockets for home & sleep.',
    },
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },
];

// ── Persistent Product Catalog Store (Single Source of Truth) ────────────────
const STORAGE_KEY = 'yezbee_admin_products_v1';

export function getAllProducts(): CatalogProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Failed to parse catalog products from storage:', err);
    return INITIAL_PRODUCTS;
  }
}

export const CATALOG_PRODUCTS: CatalogProduct[] = typeof window !== 'undefined' ? getAllProducts() : INITIAL_PRODUCTS;

function saveProductsToStorage(products: CatalogProduct[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('yezbee_products_updated'));
  } catch (err) {
    console.error('Failed to save catalog products:', err);
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

export function getProductsByCategory(categorySlug: string): CatalogProduct[] {
  const normalized = categorySlug.toLowerCase().trim();
  const products = getAllProducts().filter((p) => p.status === 'published');
  if (normalized === 'all') return products;
  return products.filter((p) => p.category === normalized);
}

// ── Admin Store Operations ───────────────────────────────────────────────────

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

  const fullProduct: CatalogProduct = {
    id,
    slug: productData.slug || slugify(productData.name || 'product'),
    name: productData.name || 'Untitled Product',
    category: productData.category || 'maternity-kurtis',
    categoryName: productData.categoryName || getCategoryNameBySlug(productData.category || 'maternity-kurtis'),
    subcategory: productData.subcategory || 'General',
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    highlights: productData.highlights || [],
    price: productData.price || 0,
    compareAtPrice: productData.compareAtPrice || null,
    costPrice: productData.costPrice || 0,
    discountPercentage,
    currency: 'INR',
    images: productData.images && productData.images.length > 0 ? productData.images : ['/images/categories/maternity-kurtis.jpg'],
    thumbnail: productData.thumbnail || (productData.images && productData.images[0]) || '/images/categories/maternity-kurtis.jpg',
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
    maternity: !!productData.maternity,
    feedingFriendly: !!productData.feedingFriendly,
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
  const products = getAllProducts().filter((p) => p.id !== id);
  saveProductsToStorage(products);
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
    'maternity-kurtis': 'Maternity Kurtis',
    'maternity-feeding-loungewears': 'Maternity Feeding Loungewears',
    'maternity-intimatewears': 'Maternity Intimatewears',
    'non-maternity-kurtis-dresses': 'Non-Maternity Kurtis & Dresses',
    'kids-clothing': 'Kids Clothing',
    'loungewear': 'Loungewear',
  };
  return map[slug] || 'Maternity Kurtis';
}
