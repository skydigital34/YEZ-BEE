export interface SubcategoryConfig {
  id: string;
  name: string;
  slug: string;
  path: string;
  productType: 'FEEDING' | 'NON-FEEDING';
  description: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string;
  image: string;
  banner?: string;
  sortOrder: number;
  hasFeedingSplit: boolean;
  subcategories: SubcategoryConfig[];
  itemCount?: string;
}

export const YEZBEE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'casuals',
    name: 'CASUALS',
    slug: 'casuals',
    path: '/category/casuals',
    description: 'Effortless everyday styles designed for comfort and elegance.',
    image: '/images/categories/maternity-kurtis.jpg',
    banner: '/images/categories/maternity-kurtis.jpg',
    sortOrder: 1,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'casuals-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/casuals/feeding',
        productType: 'FEEDING',
        description: 'Everyday casual outfits crafted with discreet concealed feeding zippers.',
      },
      {
        id: 'casuals-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/casuals/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Everyday casual kurtis, tops, and dresses with standard non-feeding silhouettes.',
      },
    ],
  },
  {
    id: 'party-wear',
    name: 'PARTY WEAR',
    slug: 'party-wear',
    path: '/category/party-wear',
    description: 'Glamorous evening dresses, flared gowns, and festive party outfits.',
    image: '/images/maternity/slide3.jpg',
    banner: '/images/maternity/slide3.jpg',
    sortOrder: 2,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'party-wear-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/party-wear/feeding',
        productType: 'FEEDING',
        description: 'Elegant party wear featuring hidden nursing access for celebrations.',
      },
      {
        id: 'party-wear-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/party-wear/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Designer party dresses and gowns with regular silhouettes.',
      },
    ],
  },
  {
    id: 'ethnic-wear',
    name: 'ETHNIC WEAR',
    slug: 'ethnic-wear',
    path: '/category/ethnic-wear',
    description: 'Timeless traditional ethnic silk sarees, lehengas, and handcrafted ethnic ensembles.',
    image: '/images/categories/non-maternity-kurtis-dresses.jpg',
    banner: '/images/categories/non-maternity-kurtis-dresses.jpg',
    sortOrder: 3,
    hasFeedingSplit: false,
    subcategories: [],
  },
  {
    id: 'lounge-wear',
    name: 'LOUNGE WEAR',
    slug: 'lounge-wear',
    path: '/category/lounge-wear',
    description: 'Pure cotton night suits, comfortable lounge sets, and cozy home wear.',
    image: '/images/categories/maternity-feeding-loungewears.jpg',
    banner: '/images/categories/maternity-feeding-loungewears.jpg',
    sortOrder: 4,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'lounge-wear-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/lounge-wear/feeding',
        productType: 'FEEDING',
        description: 'Ultra-soft night suits and lounge sets with 2-way nursing zipper access.',
      },
      {
        id: 'lounge-wear-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/lounge-wear/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Relaxed home dresses and pajama sets in comfortable stretch cottons.',
      },
    ],
  },
  {
    id: 'peplum-tops',
    name: 'PEPLUM TOPS',
    slug: 'peplum-tops',
    path: '/category/peplum-tops',
    description: 'Chic flared peplum tops, tunics, and modern waist-accentuated tops.',
    image: '/images/maternity/slide1.jpg',
    banner: '/images/maternity/slide1.jpg',
    sortOrder: 5,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'peplum-tops-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/peplum-tops/feeding',
        productType: 'FEEDING',
        description: 'Peplum tunics with discrete nursing zips for seamless feeding access.',
      },
      {
        id: 'peplum-tops-non-feeding',
        name: 'PEPLUM NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/peplum-tops/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Contemporary peplum tops designed for standard styling.',
      },
    ],
  },
  {
    id: 'kids-wear',
    name: 'KIDS WEAR',
    slug: 'kids-wear',
    path: '/category/kids-wear',
    description: 'Soft hypoallergenic children outfits, cotton dresses, and festive wear.',
    image: '/images/categories/kids-clothing.jpg',
    banner: '/images/categories/kids-clothing.jpg',
    sortOrder: 6,
    hasFeedingSplit: false,
    subcategories: [],
  },
];

// Legacy slug redirection map for backward compatibility
const LEGACY_SLUG_MAP: Record<string, { categorySlug: string; productType?: 'FEEDING' | 'NON-FEEDING' }> = {
  'maternity-kurtis': { categorySlug: 'casuals', productType: 'FEEDING' },
  'maternity-feeding-loungewears': { categorySlug: 'lounge-wear', productType: 'FEEDING' },
  'maternity-intimatewears': { categorySlug: 'lounge-wear', productType: 'FEEDING' },
  'non-maternity-kurtis-dresses': { categorySlug: 'casuals', productType: 'NON-FEEDING' },
  'kids-clothing': { categorySlug: 'kids-wear' },
  'loungewear': { categorySlug: 'lounge-wear', productType: 'NON-FEEDING' },
};

export function resolveLegacyCategorySlug(slug: string): { categorySlug: string; productType?: 'FEEDING' | 'NON-FEEDING' } | undefined {
  const normalized = slug.toLowerCase().trim();
  return LEGACY_SLUG_MAP[normalized];
}

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  const normalized = slug.toLowerCase().trim();
  const directMatch = YEZBEE_CATEGORIES.find(
    (c) => c.slug === normalized || c.id === normalized
  );
  if (directMatch) return directMatch;

  const legacy = resolveLegacyCategorySlug(normalized);
  if (legacy) {
    return YEZBEE_CATEGORIES.find((c) => c.slug === legacy.categorySlug);
  }
  return undefined;
}

export function getCategoryWithSubcategory(
  categorySlug: string,
  subSlug?: string
): { category: CategoryConfig; subcategory?: SubcategoryConfig } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;

  if (!subSlug) return { category };

  const subNormalized = subSlug.toLowerCase().trim();
  const subcategory = category.subcategories.find(
    (s) => s.slug === subNormalized || s.id === subNormalized || s.productType.toLowerCase() === subNormalized
  );

  return { category, subcategory };
}

export function hasFeedingSplit(categorySlug: string): boolean {
  const cat = getCategoryBySlug(categorySlug);
  return cat ? cat.hasFeedingSplit : false;
}

export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  YEZBEE_CATEGORIES.forEach((cat) => {
    slugs.push(cat.slug);
    cat.subcategories.forEach((sub) => {
      slugs.push(`${cat.slug}/${sub.slug}`);
    });
  });
  return slugs;
}
