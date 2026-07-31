import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import Category from '../models/Category';
import { AppError } from '../middleware/errorHandler';
import { logger, slugify, parsePagination, parseSort } from '../utils/helpers';
import { getFromCache, setToCache, delFromCache, DEFAULT_TTL } from '../config/redis';
import { CACHE_KEYS } from '../utils/constants';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort as string);

    const filter: Record<string, unknown> = { isActive: true };

    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        filter.category = category._id;
      }
    }

    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory;
    }

    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: 'i' };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter['variants.price'] = {};
      if (req.query.minPrice) {
        (filter['variants.price'] as Record<string, unknown>).$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        (filter['variants.price'] as Record<string, unknown>).$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',');
      filter.tags = { $in: tags };
    }

    if (req.query.colors) {
      const colors = (req.query.colors as string).split(',');
      filter['variants.colorHex'] = { $in: colors };
    }

    if (req.query.sizes) {
      const sizes = (req.query.sizes as string).split(',');
      filter['variants.size'] = { $in: sizes };
    }

    if (req.query.fabric) {
      filter.fabric = req.query.fabric;
    }

    if (req.query.fit) {
      filter.fit = req.query.fit;
    }

    if (req.query.occasion) {
      filter.occasion = req.query.occasion;
    }

    if (req.query.isNew === 'true') filter.isNew = true;
    if (req.query.isTrending === 'true') filter.isTrending = true;
    if (req.query.isBestSeller === 'true') filter.isBestSeller = true;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_SLUG(req.params.slug);
    const cached = await getFromCache(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await setToCache(cacheKey, product, DEFAULT_TTL.PRODUCT);

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, variants, ...productData } = req.body;

    const slug = slugify(name);
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      throw new AppError('A product with this name already exists', 409);
    }

    if (variants) {
      const skus = variants.map((v: { sku: string }) => v.sku);
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        throw new AppError('Duplicate variant SKUs found', 400);
      }
    }

    const product = new Product({
      name,
      slug,
      variants,
      ...productData,
    });

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedImages: { url: string; alt: string; isPrimary: boolean }[] = [];

      if (files.images) {
        for (let i = 0; i < files.images.length; i++) {
          const result = await uploadToCloudinary(files.images[i].buffer, {
            folder: 'yezbee-fashion/products',
          });
          uploadedImages.push({
            url: result.url,
            alt: name,
            isPrimary: i === 0,
          });
        }
      }

      product.images = uploadedImages;
    }

    await product.save();

    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (updateData.name && updateData.name !== product.name) {
      updateData.slug = slugify(updateData.name);
      const existingSlug = await Product.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existingSlug) {
        throw new AppError('A product with this name already exists', 409);
      }
    }

    if (updateData.variants) {
      const skus = updateData.variants.map((v: { sku: string }) => v.sku);
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        throw new AppError('Duplicate variant SKUs found', 400);
      }
    }

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedImages: { url: string; alt: string; isPrimary: boolean }[] = [];

      if (files.images) {
        for (let i = 0; i < files.images.length; i++) {
          const result = await uploadToCloudinary(files.images[i].buffer, {
            folder: 'yezbee-fashion/products',
          });
          uploadedImages.push({
            url: result.url,
            alt: product.name,
            isPrimary: i === 0,
          });
        }
      }

      if (uploadedImages.length > 0) {
        updateData.images = uploadedImages;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await Review.deleteMany({ product: id });

    for (const image of product.images) {
      if (image.url) {
        const publicId = image.url.match(/\/v\d+\/(.+?)\./)?.[1];
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(() => {});
        }
      }
    }

    await Product.findByIdAndDelete(id);

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || (q as string).trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }

    const { page, limit, skip } = parsePagination(req.query);

    const searchRegex = new RegExp((q as string).trim(), 'i');
    const filter = {
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
        { subcategory: searchRegex },
        { fabric: searchRegex },
        { occasion: searchRegex },
      ],
    };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('name slug images variants.price brand category ratings.average')
        .sort({ soldCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const filter: Record<string, unknown> = { product: id, isApproved: true };

    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating as string, 10);
    }

    if (req.query.hasImages === 'true') {
      filter['images.0'] = { $exists: true };
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, body } = req.body;
    const userId = req.user!.id;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existingReview = await Review.findOne({ product: id, user: userId });
    if (existingReview) {
      throw new AppError('You have already reviewed this product', 409);
    }

    const reviewData: Record<string, unknown> = {
      product: id,
      user: userId,
      rating,
      title,
      body,
    };

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const uploadedImages: { url: string; alt: string }[] = [];

      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'yezbee-fashion/reviews',
        });
        uploadedImages.push({ url: result.url, alt: title || '' });
      }

      reviewData.images = uploadedImages;
    }

    const review = new Review(reviewData);
    await review.save();

    const allReviews = await Review.find({ product: id, isApproved: true });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    product.ratings = {
      average: Math.round(avgRating * 10) / 10,
      count: allReviews.length,
      distribution,
    };
    product.reviewCount = allReviews.length;
    await product.save();

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const related = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
    })
      .select('name slug images variants.price brand ratings.average')
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug')
      .lean();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
