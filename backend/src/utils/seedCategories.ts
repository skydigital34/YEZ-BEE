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
        category = await Category.create({
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
        logger.info(`Created category: ${catData.name}`);
      } else {
        await Category.findByIdAndUpdate(category._id || category.id || '', {
          name: catData.name,
          displayOrder: catData.displayOrder,
          hasFeedingSplit: catData.hasFeedingSplit,
          subcategories: catData.subcategories,
        });
        logger.info(`Updated category: ${catData.name}`);
      }
      categoryMap.set(catData.slug, category);
    }

    const products = await Product.find({});

    for (const product of products) {
      let updated = false;
      let categoryId = product.category;
      let productType = product.productType;
      let subcategory = product.subcategory;

      let currentCatSlug = '';
      if (categoryId) {
        const cat = await Category.findById(categoryId);
        if (cat) {
          currentCatSlug = cat.slug || '';
        }
      }

      if (currentCatSlug === 'maternity-kurtis') {
        categoryId = categoryMap.get('casuals')._id || categoryMap.get('casuals').id;
        productType = 'FEEDING';
        subcategory = 'Feeding';
        updated = true;
      } else if (currentCatSlug === 'maternity-feeding-loungewears' || currentCatSlug === 'maternity-intimatewears' || currentCatSlug === 'loungewear') {
        categoryId = categoryMap.get('lounge-wear')._id || categoryMap.get('lounge-wear').id;
        productType = null;
        subcategory = null as any;
        updated = true;
      } else if (currentCatSlug === 'non-maternity-kurtis-dresses') {
        categoryId = categoryMap.get('casuals')._id || categoryMap.get('casuals').id;
        productType = 'NON-FEEDING';
        subcategory = 'Non-Feeding';
        updated = true;
      } else if (currentCatSlug === 'kids-clothing') {
        categoryId = categoryMap.get('kids-wear')._id || categoryMap.get('kids-wear').id;
        productType = null;
        subcategory = null as any;
        updated = true;
      }

      if (currentCatSlug === 'lounge-wear' || currentCatSlug === 'kids-wear') {
        if (product.productType !== null || product.subcategory) {
          productType = null;
          subcategory = null as any;
          updated = true;
        }
      }

      if (currentCatSlug === 'ethnic-wear') {
        if (!product.productType || (product.productType !== 'FEEDING' && product.productType !== 'NON-FEEDING')) {
          const isFeeding = /feeding|nursing/i.test(`${product.name} ${product.description} ${(product.tags || []).join(' ')}`);
          productType = isFeeding ? 'FEEDING' : 'NON-FEEDING';
          subcategory = isFeeding ? 'Feeding' : 'Non-Feeding';
          updated = true;
        }
      }

      if (updated) {
        await Product.findByIdAndUpdate(product._id || product.id || '', {
          category: categoryId,
          productType,
          subcategory,
        });
        logger.info(`Migrated/Normalized product "${product.name}" to new taxonomy.`);
      }
    }

    logger.info('Category seeding & product migration completed successfully.');
  } catch (error) {
    logger.error('Error during category seeding/migration:', error);
  }
}
