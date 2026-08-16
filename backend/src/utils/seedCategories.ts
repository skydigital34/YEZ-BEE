import Category from '../models/Category';
import Product from '../models/Product';
import { logger, slugify } from './helpers';

export const SEED_CATEGORIES = [
  {
    name: 'CASUALS',
    slug: 'casuals',
    description: 'Effortless everyday styles designed for comfort and elegance.',
    image: '/images/categories/maternity-kurtis.jpg',
    banner: '/images/categories/maternity-kurtis.jpg',
    displayOrder: 1,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'casuals-feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'casuals-non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'PARTY WEAR',
    slug: 'party-wear',
    description: 'Glamorous evening dresses, flared gowns, and festive party outfits.',
    image: '/images/maternity/slide3.jpg',
    banner: '/images/maternity/slide3.jpg',
    displayOrder: 2,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'party-wear-feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'party-wear-non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'ETHNIC WEAR',
    slug: 'ethnic-wear',
    description: 'Timeless traditional ethnic silk sarees, lehengas, and handcrafted ethnic ensembles.',
    image: '/images/categories/non-maternity-kurtis-dresses.jpg',
    banner: '/images/categories/non-maternity-kurtis-dresses.jpg',
    displayOrder: 3,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'ethnic-wear-feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'ethnic-wear-non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'LOUNGE WEAR',
    slug: 'lounge-wear',
    description: 'Pure cotton night suits, comfortable lounge sets, and cozy home wear.',
    image: '/images/categories/maternity-feeding-loungewears.jpg',
    banner: '/images/categories/maternity-feeding-loungewears.jpg',
    displayOrder: 4,
    hasFeedingSplit: false,
    subcategories: [],
  },
  {
    name: 'PEPLUM TOPS',
    slug: 'peplum-tops',
    description: 'Chic flared peplum tops, tunics, and modern waist-accentuated tops.',
    image: '/images/maternity/slide1.jpg',
    banner: '/images/maternity/slide1.jpg',
    displayOrder: 5,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'peplum-tops-feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'peplum-tops-non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'KIDS WEAR',
    slug: 'kids-wear',
    description: 'Soft hypoallergenic children outfits, cotton dresses, and festive wear.',
    image: '/images/categories/kids-clothing.jpg',
    banner: '/images/categories/kids-clothing.jpg',
    displayOrder: 6,
    hasFeedingSplit: false,
    subcategories: [],
  },
];

export async function seedCategoriesAndMigrateProducts(): Promise<void> {
  try {
    logger.info('Starting YEZ BEE Category Taxonomy Seeding & Product Migration...');

    const categoryMap = new Map<string, any>();

    for (const catData of SEED_CATEGORIES) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = new Category({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          image: catData.image,
          banner: catData.banner,
          displayOrder: catData.displayOrder,
          hasFeedingSplit: catData.hasFeedingSplit,
          subcategories: catData.subcategories,
          isActive: true,
        });
        await category.save();
        logger.info(`Created category: ${catData.name}`);
      } else {
        category.name = catData.name;
        category.displayOrder = catData.displayOrder;
        category.hasFeedingSplit = catData.hasFeedingSplit;
        category.subcategories = catData.subcategories;
        await category.save();
        logger.info(`Updated category: ${catData.name}`);
      }
      categoryMap.set(catData.slug, category);
    }

    // Migrate & normalize existing products referencing old/new taxonomy
    const products = await Product.find({}).populate('category');

    for (const product of products) {
      let updated = false;
      const catObj = product.category as any;
      const currentCatSlug = catObj?.slug || '';

      // 1. Legacy category slug migrations
      if (currentCatSlug === 'maternity-kurtis') {
        product.category = categoryMap.get('casuals')._id;
        product.productType = 'FEEDING';
        product.subcategory = 'Feeding';
        updated = true;
      } else if (currentCatSlug === 'maternity-feeding-loungewears' || currentCatSlug === 'maternity-intimatewears' || currentCatSlug === 'loungewear') {
        product.category = categoryMap.get('lounge-wear')._id;
        product.productType = null;
        product.subcategory = null as any;
        updated = true;
      } else if (currentCatSlug === 'non-maternity-kurtis-dresses') {
        product.category = categoryMap.get('casuals')._id;
        product.productType = 'NON-FEEDING';
        product.subcategory = 'Non-Feeding';
        updated = true;
      } else if (currentCatSlug === 'kids-clothing') {
        product.category = categoryMap.get('kids-wear')._id;
        product.productType = null;
        product.subcategory = null as any;
        updated = true;
      }

      // 2. Normalize standalone categories (LOUNGE WEAR & KIDS WEAR) -> clear productType & subcategory
      if (currentCatSlug === 'lounge-wear' || currentCatSlug === 'kids-wear') {
        if (product.productType !== null || product.subcategory) {
          product.productType = null;
          product.subcategory = null as any;
          updated = true;
        }
      }

      // 3. Normalize dual-subcategory categories (ETHNIC WEAR, CASUALS, PARTY WEAR, PEPLUM TOPS)
      if (currentCatSlug === 'ethnic-wear') {
        if (!product.productType || (product.productType !== 'FEEDING' && product.productType !== 'NON-FEEDING')) {
          const isFeeding = /feeding|nursing/i.test(`${product.name} ${product.description} ${(product.tags || []).join(' ')}`);
          product.productType = isFeeding ? 'FEEDING' : 'NON-FEEDING';
          product.subcategory = isFeeding ? 'Feeding' : 'Non-Feeding';
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        logger.info(`Migrated/Normalized product "${product.name}" to new taxonomy.`);
      }
    }

    logger.info('Category seeding & product migration completed successfully.');
  } catch (error) {
    logger.error('Error during category seeding/migration:', error);
  }
}
