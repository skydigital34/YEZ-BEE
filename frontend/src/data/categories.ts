export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string;
  image: string;
  itemCount: string;
  subcategories: string[];
}

export const YEZBEE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'maternity-kurtis',
    name: 'Maternity Kurtis',
    slug: 'maternity-kurtis',
    path: '/category/maternity-kurtis',
    description: 'Comfortable and stylish maternity kurtis designed for pregnancy. Features breathable cottons, rayon, A-line and Anarkali silhouettes with generous bump space.',
    image: '/images/categories/maternity-kurtis.jpg',
    itemCount: '24 Styles Available',
    subcategories: ['Cotton Kurtis', 'Rayon Kurtis', 'A-Line Kurtis', 'Anarkali Kurtis', 'Festive Kurtis'],
  },
  {
    id: 'maternity-feeding-loungewears',
    name: 'Maternity Feeding Loungewears',
    slug: 'maternity-feeding-loungewears',
    path: '/category/maternity-feeding-loungewears',
    description: 'Pregnancy & breastfeeding-friendly lounge sets, feeding night suits, nursing tops, and relaxed maternity home dresses with concealed zip access.',
    image: '/images/categories/maternity-feeding-loungewears.jpg',
    itemCount: '18 Styles Available',
    subcategories: ['Feeding Night Suits', 'Nursing Lounge Sets', 'Feeding Tops', 'Maternity Lounge Dresses'],
  },
  {
    id: 'maternity-intimatewears',
    name: 'Maternity Intimatewears',
    slug: 'maternity-intimatewears',
    path: '/category/maternity-intimatewears',
    description: 'Maternity & nursing bras, stretch pregnancy innerwear, nursing camisoles, and comfort support essentials designed for pregnancy & postpartum.',
    image: '/images/categories/maternity-intimatewears.jpg',
    itemCount: '15 Styles Available',
    subcategories: ['Nursing Bras', 'Maternity Bras', 'Nursing Camisoles', 'Pregnancy Briefs'],
  },
  {
    id: 'non-maternity-kurtis-dresses',
    name: 'Non-Maternity Kurtis & Dresses',
    slug: 'non-maternity-kurtis-dresses',
    path: '/category/non-maternity-kurtis-dresses',
    description: 'Everyday women\'s fashion kurtis, printed flared dresses, A-line midi dresses, and casual office wear crafted with normal non-maternity silhouettes.',
    image: '/images/categories/non-maternity-kurtis-dresses.jpg',
    itemCount: '32 Styles Available',
    subcategories: ['Printed Kurtis', 'A-Line Kurtis', 'Casual Dresses', 'Maxi Dresses', 'Office Wear'],
  },
  {
    id: 'kids-clothing',
    name: 'Kids Clothing',
    slug: 'kids-clothing',
    path: '/category/kids-clothing',
    description: 'Age-appropriate children\'s clothing including girls cotton dresses, boys casual outfits, kids nightwear, and festive wear from 0-1Y to 12-14Y.',
    image: '/images/categories/kids-clothing.jpg',
    itemCount: '22 Styles Available',
    subcategories: ['Girls Dresses', 'Boys Outfits', 'Kids Nightwear', 'Ethnic Outfits'],
  },
  {
    id: 'loungewear',
    name: 'Loungewear',
    slug: 'loungewear',
    path: '/category/loungewear',
    description: 'General comfortable home & sleep wear including pure cotton night suits, relaxed pajama sets, oversized lounge tops, and cozy home dresses.',
    image: '/images/categories/loungewear.jpg',
    itemCount: '20 Styles Available',
    subcategories: ['Cotton Night Suits', 'Pajama Sets', 'Oversized Lounge Tops', 'Sleepwear'],
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  const normalized = slug.toLowerCase().trim();
  return YEZBEE_CATEGORIES.find(
    (c) => c.slug === normalized || c.id === normalized
  );
}
