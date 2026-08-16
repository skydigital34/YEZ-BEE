import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Category from '../models/Category';
import Product from '../models/Product';
import User from '../models/User';
import { slugify } from '../utils/helpers';

const CATEGORIES_DATA = [
  {
    name: 'CASUALS',
    slug: 'casuals',
    description: 'Effortless everyday styles designed for comfort and elegance.',
    image: '/images/categories/maternity-kurtis.jpg',
    banner: '/images/categories/maternity-kurtis.jpg',
    sortOrder: 1,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'PARTY WEAR',
    slug: 'party-wear',
    description: 'Glamorous evening dresses, flared gowns, and festive party outfits.',
    image: '/images/maternity/slide3.jpg',
    banner: '/images/maternity/slide3.jpg',
    sortOrder: 2,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'ETHNIC WEAR',
    slug: 'ethnic-wear',
    description: 'Timeless traditional ethnic silk sarees, lehengas, and handcrafted ethnic ensembles.',
    image: '/images/categories/non-maternity-kurtis-dresses.jpg',
    banner: '/images/categories/non-maternity-kurtis-dresses.jpg',
    sortOrder: 3,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'LOUNGE WEAR',
    slug: 'lounge-wear',
    description: 'Pure cotton night suits, comfortable lounge sets, and cozy home wear.',
    image: '/images/categories/maternity-feeding-loungewears.jpg',
    banner: '/images/categories/maternity-feeding-loungewears.jpg',
    sortOrder: 4,
    hasFeedingSplit: false,
    subcategories: [],
  },
  {
    name: 'PEPLUM TOPS',
    slug: 'peplum-tops',
    description: 'Chic flared peplum tops, tunics, and modern waist-accentuated tops.',
    image: '/images/maternity/slide1.jpg',
    banner: '/images/maternity/slide1.jpg',
    sortOrder: 5,
    hasFeedingSplit: true,
    subcategories: [
      { name: 'FEEDING', slug: 'feeding', productType: 'FEEDING' as const },
      { name: 'NON-FEEDING', slug: 'non-feeding', productType: 'NON-FEEDING' as const },
    ],
  },
  {
    name: 'KIDS WEAR',
    slug: 'kids-wear',
    description: 'Soft hypoallergenic children outfits, cotton dresses, and festive wear.',
    image: '/images/categories/kids-clothing.jpg',
    banner: '/images/categories/kids-clothing.jpg',
    sortOrder: 6,
    hasFeedingSplit: false,
    subcategories: [],
  },
];

const INITIAL_PRODUCTS_SEED = [
  {
    name: 'Floral Anarkali Maternity Feeding Kurti',
    slug: 'floral-anarkali-maternity-feeding-kurti',
    categorySlug: 'casuals',
    productType: 'FEEDING',
    description: 'Beautiful printed cotton Anarkali maternity kurti featuring dual concealed vertical nursing zips, tiered flared hem line, and soft breathable fabric for all day comfort.',
    shortDescription: 'Dual zip cotton feeding Anarkali kurti',
    brand: 'YEZ BEE',
    price: 1299,
    compareAtPrice: 1999,
    discount: 35,
    status: 'PUBLISHED',
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['feeding', 'casual', 'cotton', 'anarkali', 'maternity'],
    fabric: 'Pure Cotton',
    fit: 'Flared Regular Fit',
    pattern: 'Floral Print',
    occasion: 'Casual Wear',
    careInstructions: ['Hand wash cold', 'Iron inside out'],
    images: [
      { url: '/images/categories/maternity-kurtis.jpg', alt: 'Floral Anarkali Maternity Feeding Kurti', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-FL-CAS-S-BLK', color: 'Midnight Black', colorHex: '#1A1A1A', size: 'S', price: 1299, compareAtPrice: 1999, stock: 12, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-FL-CAS-M-BLK', color: 'Midnight Black', colorHex: '#1A1A1A', size: 'M', price: 1299, compareAtPrice: 1999, stock: 8, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-FL-CAS-L-BLK', color: 'Midnight Black', colorHex: '#1A1A1A', size: 'L', price: 1299, compareAtPrice: 1999, stock: 4, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-FL-CAS-XL-BLK', color: 'Midnight Black', colorHex: '#1A1A1A', size: 'XL', price: 1299, compareAtPrice: 1999, stock: 0, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-FL-CAS-M-RED', color: 'Wine Red', colorHex: '#722F37', size: 'M', price: 1299, compareAtPrice: 1999, stock: 15, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-FL-CAS-L-RED', color: 'Wine Red', colorHex: '#722F37', size: 'L', price: 1299, compareAtPrice: 1999, stock: 9, lowStockThreshold: 5, isActive: true },
    ],
    seo: { title: 'Floral Anarkali Maternity Feeding Kurti | YEZ BEE', description: 'Shop cotton dual zip nursing Anarkali kurti online at YEZ BEE Fashion.' },
  },
  {
    name: 'Embroidered Velvet Party Dress',
    slug: 'embroidered-velvet-party-dress',
    categorySlug: 'party-wear',
    productType: 'FEEDING',
    description: 'Luxurious velvet evening gown styled with delicate gold zari embroidery on neck and sleeves, equipped with hidden nursing access.',
    shortDescription: 'Zari embroidered velvet party dress with nursing access',
    brand: 'YEZ BEE',
    price: 2499,
    compareAtPrice: 3499,
    discount: 28,
    status: 'PUBLISHED',
    featured: true,
    bestSeller: false,
    newArrival: true,
    tags: ['party', 'velvet', 'feeding', 'gowns', 'embroidery'],
    fabric: 'Micro Velvet',
    fit: 'A-Line',
    pattern: 'Embroidered',
    occasion: 'Party Wear',
    careInstructions: ['Dry clean only'],
    images: [
      { url: '/images/categories/maternity-kurtis.jpg', alt: 'Embroidered Velvet Party Dress', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-VEL-PTY-S-EMR', color: 'Emerald Green', colorHex: '#046307', size: 'S', price: 2499, compareAtPrice: 3499, stock: 6, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-VEL-PTY-M-EMR', color: 'Emerald Green', colorHex: '#046307', size: 'M', price: 2499, compareAtPrice: 3499, stock: 10, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-VEL-PTY-L-EMR', color: 'Emerald Green', colorHex: '#046307', size: 'L', price: 2499, compareAtPrice: 3499, stock: 3, lowStockThreshold: 3, isActive: true },
    ],
    seo: { title: 'Embroidered Velvet Party Dress | YEZ BEE Fashion', description: 'Designer velvet party gown with nursing access.' },
  },
  {
    name: 'Chanderi Silk Ethnic Festive Kurta Set',
    slug: 'chanderi-silk-ethnic-festive-kurta-set',
    categorySlug: 'ethnic-wear',
    productType: 'NON-FEEDING',
    description: 'Graceful Chanderi silk kurta set paired with hand block printed dupatta and tailored trousers.',
    shortDescription: 'Chanderi silk festive kurta set with dupatta',
    brand: 'YEZ BEE',
    price: 3299,
    compareAtPrice: 4500,
    discount: 26,
    status: 'PUBLISHED',
    featured: false,
    bestSeller: true,
    newArrival: false,
    tags: ['ethnic', 'silk', 'festive', 'chanderi', 'kurta-set'],
    fabric: 'Chanderi Silk',
    fit: 'Straight Fit',
    pattern: 'Woven Zari Motif',
    occasion: 'Festive Wear',
    careInstructions: ['Dry clean recommended'],
    images: [
      { url: '/images/categories/non-maternity-kurtis-dresses.jpg', alt: 'Chanderi Silk Kurta Set', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-CHN-ETH-M-GLD', color: 'Mustard Gold', colorHex: '#DAA520', size: 'M', price: 3299, compareAtPrice: 4500, stock: 7, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-CHN-ETH-L-GLD', color: 'Mustard Gold', colorHex: '#DAA520', size: 'L', price: 3299, compareAtPrice: 4500, stock: 5, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-CHN-ETH-XL-GLD', color: 'Mustard Gold', colorHex: '#DAA520', size: 'XL', price: 3299, compareAtPrice: 4500, stock: 2, lowStockThreshold: 3, isActive: true },
    ],
    seo: { title: 'Chanderi Silk Festive Kurta Set | YEZ BEE', description: 'Shop silk festive ethnic wear.' },
  },
  {
    name: 'Embroidered Festive Feeding Silk Anarkali Set',
    slug: 'embroidered-festive-feeding-silk-anarkali-set',
    categorySlug: 'ethnic-wear',
    productType: 'FEEDING',
    description: 'Exquisite silk blend Anarkali ethnic suit set with intricate zari embroidery and hidden nursing zippers for elegant celebratory ease.',
    shortDescription: 'Silk embroidered festive Anarkali suit with concealed feeding access',
    brand: 'YEZ BEE',
    price: 3899,
    compareAtPrice: 5299,
    discount: 26,
    status: 'PUBLISHED',
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['ethnic', 'silk', 'festive', 'anarkali', 'feeding'],
    fabric: 'Art Silk Blend',
    fit: 'Flared Anarkali',
    pattern: 'Zari Embroidery',
    occasion: 'Weddings & Celebrations',
    careInstructions: ['Dry clean recommended'],
    images: [
      { url: '/images/luxury_featured_collection.jpg', alt: 'Festive Feeding Silk Anarkali Set', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-ETH-FED-M-MRN', color: 'Maroon Gold', colorHex: '#800000', size: 'M', price: 3899, compareAtPrice: 5299, stock: 8, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-ETH-FED-L-MRN', color: 'Maroon Gold', colorHex: '#800000', size: 'L', price: 3899, compareAtPrice: 5299, stock: 6, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-ETH-FED-XL-MRN', color: 'Maroon Gold', colorHex: '#800000', size: 'XL', price: 3899, compareAtPrice: 5299, stock: 4, lowStockThreshold: 2, isActive: true },
    ],
    seo: { title: 'Festive Feeding Silk Anarkali Set | YEZ BEE', description: 'Designer ethnic feeding festive wear.' },
  },
  {
    name: 'Organic Cotton Everyday Loungewear Pyjama Set',
    slug: 'organic-cotton-everyday-loungewear-pyjama-set',
    categorySlug: 'lounge-wear',
    productType: null,
    description: 'Super soft 100% organic cotton two-piece pyjama lounge set for relaxed downtime and peaceful sleep.',
    shortDescription: 'Organic cotton lounge set with pyjama',
    brand: 'YEZ BEE',
    price: 1149,
    compareAtPrice: 1599,
    discount: 28,
    status: 'PUBLISHED',
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['loungewear', 'cotton', 'pyjamas', 'nightwear'],
    fabric: '100% Organic Knit Cotton',
    fit: 'Relaxed Fit',
    pattern: 'Pastel Stripes',
    occasion: 'Lounge Wear',
    careInstructions: ['Machine wash warm', 'Tumble dry low'],
    images: [
      { url: '/images/categories/maternity-feeding-loungewears.jpg', alt: 'Organic Cotton Lounge Set', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-LNG-FED-S-PNK', color: 'Blush Pink', colorHex: '#FFB6C1', size: 'S', price: 1149, compareAtPrice: 1599, stock: 14, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-LNG-FED-M-PNK', color: 'Blush Pink', colorHex: '#FFB6C1', size: 'M', price: 1149, compareAtPrice: 1599, stock: 18, lowStockThreshold: 5, isActive: true },
      { sku: 'YB-LNG-FED-L-PNK', color: 'Blush Pink', colorHex: '#FFB6C1', size: 'L', price: 1149, compareAtPrice: 1599, stock: 9, lowStockThreshold: 5, isActive: true },
    ],
    seo: { title: 'Organic Cotton Everyday Lounge Set | YEZ BEE', description: 'Soft loungewear pyjama sets online.' },
  },
  {
    name: 'Printed Flared Peplum Top with Nursing Access',
    slug: 'printed-flared-peplum-top-with-nursing-access',
    categorySlug: 'peplum-tops',
    productType: 'FEEDING',
    description: 'Chic waist-flared peplum tunic top crafted in soft rayon slub fabric, fitted with discrete feeding zips.',
    shortDescription: 'Rayon flared peplum top with hidden zips',
    brand: 'YEZ BEE',
    price: 899,
    compareAtPrice: 1299,
    discount: 30,
    status: 'PUBLISHED',
    featured: false,
    bestSeller: false,
    newArrival: true,
    tags: ['peplum', 'top', 'feeding', 'rayon', 'casual'],
    fabric: 'Rayon Slub',
    fit: 'Peplum Flare',
    pattern: 'Geometric Print',
    occasion: 'Casual Wear',
    careInstructions: ['Machine wash gentle'],
    images: [
      { url: '/images/categories/maternity-kurtis.jpg', alt: 'Flared Peplum Top', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-PEP-FED-S-NVY', color: 'Navy Blue', colorHex: '#000080', size: 'S', price: 899, compareAtPrice: 1299, stock: 8, lowStockThreshold: 4, isActive: true },
      { sku: 'YB-PEP-FED-M-NVY', color: 'Navy Blue', colorHex: '#000080', size: 'M', price: 899, compareAtPrice: 1299, stock: 11, lowStockThreshold: 4, isActive: true },
      { sku: 'YB-PEP-FED-L-NVY', color: 'Navy Blue', colorHex: '#000080', size: 'L', price: 899, compareAtPrice: 1299, stock: 6, lowStockThreshold: 4, isActive: true },
    ],
    seo: { title: 'Printed Flared Peplum Top | YEZ BEE', description: 'Stylish nursing peplum tops online.' },
  },
  {
    name: 'Kids Hypoallergenic Cotton Floral Dress',
    slug: 'kids-hypoallergenic-cotton-floral-dress',
    categorySlug: 'kids-wear',
    productType: null,
    description: 'Ultra-soft 100% hypoallergenic cotton frock for kids, featuring breathable lining, soft elastic waist, and floral embroidery.',
    shortDescription: 'Hypoallergenic cotton kids floral dress',
    brand: 'YEZ BEE Kids',
    price: 799,
    compareAtPrice: 1099,
    discount: 27,
    status: 'PUBLISHED',
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['kids', 'cotton', 'dress', 'frock', 'children'],
    fabric: '100% Cotton',
    fit: 'Fit & Flare',
    pattern: 'Floral Print',
    occasion: 'Casual / Party',
    careInstructions: ['Machine wash cold'],
    images: [
      { url: '/images/categories/kids-clothing.jpg', alt: 'Kids Cotton Floral Dress', isPrimary: true, sortOrder: 1 },
    ],
    variants: [
      { sku: 'YB-KID-DRS-2-3Y', color: 'Peach Coral', colorHex: '#FF7F50', size: '2-3Y', price: 799, compareAtPrice: 1099, stock: 10, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-KID-DRS-4-5Y', color: 'Peach Coral', colorHex: '#FF7F50', size: '4-5Y', price: 799, compareAtPrice: 1099, stock: 8, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-KID-DRS-6-7Y', color: 'Peach Coral', colorHex: '#FF7F50', size: '6-7Y', price: 799, compareAtPrice: 1099, stock: 5, lowStockThreshold: 3, isActive: true },
      { sku: 'YB-KID-DRS-8-9Y', color: 'Peach Coral', colorHex: '#FF7F50', size: '8-9Y', price: 799, compareAtPrice: 1099, stock: 3, lowStockThreshold: 3, isActive: true },
    ],
    seo: { title: 'Kids Cotton Floral Dress | YEZ BEE Kids', description: 'Hypoallergenic children clothing.' },
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting YEZ BEE MongoDB Atlas Database Seeder...');

    await connectDatabase();

    // 1. Seed Categories
    console.log('📁 Seeding Categories...');
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const catData of CATEGORIES_DATA) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = new Category({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          image: catData.image,
          banner: catData.banner,
          sortOrder: catData.sortOrder,
          hasFeedingSplit: catData.hasFeedingSplit,
          subcategories: catData.subcategories,
          isActive: true,
        });
        await cat.save();
        console.log(`  + Created Category: ${cat.name}`);
      } else {
        cat.description = catData.description;
        cat.image = catData.image;
        cat.banner = catData.banner;
        cat.hasFeedingSplit = catData.hasFeedingSplit;
        cat.subcategories = catData.subcategories;
        await cat.save();
        console.log(`  ~ Updated Category: ${cat.name}`);
      }
      categoryMap.set(catData.slug, cat._id as mongoose.Types.ObjectId);
    }

    // 2. Seed Products
    console.log('🛍️ Seeding Products...');
    for (const prodData of INITIAL_PRODUCTS_SEED) {
      const categoryId = categoryMap.get(prodData.categorySlug);
      if (!categoryId) {
        console.warn(`  ! Category not found for slug: ${prodData.categorySlug}`);
        continue;
      }

      let product = await Product.findOne({ slug: prodData.slug });

      const productPayload = {
        name: prodData.name,
        slug: prodData.slug,
        category: categoryId,
        productType: prodData.productType,
        description: prodData.description,
        shortDescription: prodData.shortDescription,
        brand: prodData.brand,
        price: prodData.price,
        compareAtPrice: prodData.compareAtPrice,
        discount: prodData.discount,
        status: prodData.status,
        featured: prodData.featured,
        bestSeller: prodData.bestSeller,
        newArrival: prodData.newArrival,
        tags: prodData.tags,
        fabric: prodData.fabric,
        fit: prodData.fit,
        pattern: prodData.pattern,
        occasion: prodData.occasion,
        careInstructions: prodData.careInstructions,
        images: prodData.images,
        variants: prodData.variants,
        seo: prodData.seo,
        isActive: true,
      };

      if (!product) {
        product = new Product(productPayload);
        await product.save();
        console.log(`  + Created Product: ${product.name}`);
      } else {
        Object.assign(product, productPayload);
        await product.save();
        console.log(`  ~ Updated Product: ${product.name}`);
      }
    }

    // 3. Create Admin User if not exists
    console.log('👤 Checking Admin User...');
    const adminEmail = 'admin@yezbee.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'YEZ BEE Admin',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
        isVerified: true,
      });
      await admin.save();
      console.log(`  + Created Admin Account: ${adminEmail}`);
    } else {
      console.log(`  ✓ Admin Account exists: ${adminEmail}`);
    }

    console.log('✅ YEZ BEE Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
