import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import Category from '../models/Category';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger, slugify, parsePagination, parseSort } from '../utils/helpers';
import { getFromCache, setToCache, delFromCache } from '../config/redis';
import { CACHE_KEYS, DEFAULT_TTL, CATEGORY_CONFIG } from '../utils/constants';
import { uploadToCloudinary, deleteFromCloudinary, getCategoryFolderPath } from '../config/cloudinary';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const sort = parseSort(req.query.sort as string);

    const filter: Record<string, unknown> = {};


    if (req.query.category && req.query.category !== 'all') {
      const categoryQuery = (req.query.category as string).trim();
      const isObjId = Boolean(categoryQuery && categoryQuery.length >= 10);

      if (isObjId) {
        filter.$or = [
          { category: categoryQuery },
          { parentCategory: categoryQuery },
        ];
      } else {
        const categoryDoc = await Category.findOne({
          $or: [{ slug: categoryQuery.toLowerCase() }, { name: new RegExp(`^${categoryQuery}$`, 'i') }],
        });

        const categoryMatches: Record<string, unknown>[] = [
          { subcategory: new RegExp(categoryQuery, 'i') },
          { categorySlug: categoryQuery.toLowerCase() },
          { 'category.slug': categoryQuery.toLowerCase() },
        ];

        if (categoryDoc) {
          categoryMatches.push({ category: categoryDoc._id });
          categoryMatches.push({ parentCategory: categoryDoc._id });
        }

        filter.$or = categoryMatches;
      }
    }

    if (req.query.productType) {
      filter.productType = (req.query.productType as string).toUpperCase();
    }

    if (req.query.subcategory) {
      filter.subcategory = new RegExp(req.query.subcategory as string, 'i');
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
      filter.tags = { $in: tags.map((t) => t.trim().toLowerCase()) };
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
      filter.fabric = new RegExp(req.query.fabric as string, 'i');
    }

    if (req.query.fit) {
      filter.fit = new RegExp(req.query.fit as string, 'i');
    }

    if (req.query.occasion) {
      filter.occasion = new RegExp(req.query.occasion as string, 'i');
    }

    if (req.query.isNew === 'true' || req.query.newArrival === 'true') filter.newArrival = true;
    if (req.query.isTrending === 'true') filter.isTrending = true;
    if (req.query.isBestSeller === 'true' || req.query.bestSeller === 'true') filter.bestSeller = true;
    if (req.query.featured === 'true') filter.featured = true;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
      ];
    }

    // Build Firestore query using Product model with sorting, pagination
    let products = await Product.find(filter, {}, { sort, skip, limit });
    // Manually populate category for each product
    products = await Promise.all(
      products.map(async (p) => {
        if (p.category) {
          const cat = await Category.findById(p.category);
          if (cat) {
            p.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
          }
        }
        return p;
      })
    );
    const total = await Product.countDocuments(filter);

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

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    // Populate category manually
    if (product.category) {
      const cat = await Category.findById(product.category);
      if (cat) {
        product.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
      }
    }
    res.status(200).json({ success: true, data: product });
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
    const paramValue = req.params.slug;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(paramValue);
    const isAdminRequest = (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) || req.query.admin === 'true';

    // Fast-path cache for public requests by slug
    if (!isAdminRequest && !isMongoId) {
      const cacheKey = CACHE_KEYS.PRODUCT_BY_SLUG(paramValue);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        res.status(200).json({ success: true, data: cached });
        return;
      }
    }

    const identifierFilter = isMongoId
      ? { $or: [{ _id: paramValue }, { slug: paramValue }] }
      : { slug: paramValue };

    let queryFilter: Record<string, unknown> = identifierFilter;
    if (!isAdminRequest && !isMongoId) {
      const statusFilter = {
        $or: [{ status: 'PUBLISHED' }, { isActive: true }, { status: { $exists: false } }],
      };
      queryFilter = { $and: [identifierFilter, statusFilter] };
    }

    const productDoc = await Product.findOne(queryFilter);
    if (!productDoc) {
      throw new AppError('Product not found', 404);
    }
    // Manually populate category
    const categoryDoc = await Category.findById(productDoc.category as any);
    const product = { ...productDoc, category: categoryDoc } as any;

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!isAdminRequest && !isMongoId) {
      const cacheKey = CACHE_KEYS.PRODUCT_BY_SLUG(paramValue);
      await setToCache(cacheKey, product, DEFAULT_TTL.PRODUCT);
    }

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
  const newlyUploadedPublicIds: string[] = [];
  try {
    const { name, variants, categoryName, categorySlug, images: bodyImages, ...productData } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError('Product name is required', 400);
    }

    let slug = slugify(name);
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    if (variants && Array.isArray(variants)) {
      const skus = variants.map((v: { sku: string }) => v?.sku).filter(Boolean);
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        logger.warn('Duplicate SKUs found in variant payload, proceeding with normalization');
      }
    }

    let categoryId = productData.category;
    let resolvedCategoryName = categoryName || categorySlug || 'general';

    if (categoryId && typeof categoryId === 'string' && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      let categoryDoc = await Category.findOne({
        $or: [{ slug: categoryId }, { name: new RegExp(`^${categoryId}$`, 'i') }],
      });
      if (!categoryDoc) {
        try {
          categoryDoc = await Category.create({
            name: categoryId.toUpperCase(),
            slug: categoryId.toLowerCase(),
            description: `${categoryId} Collection`,
          });
        } catch (e) {
          logger.warn('Failed to auto-create category in DB, using fallback category');
        }
      }
      if (categoryDoc) {
        categoryId = categoryDoc._id;
        resolvedCategoryName = categoryDoc.name || categoryDoc.slug;
      } else {
        const anyCat = await Category.findOne();
        if (anyCat) {
          categoryId = anyCat._id;
          resolvedCategoryName = anyCat.name || anyCat.slug;
        }
      }
    }

    const folderPath = getCategoryFolderPath(resolvedCategoryName);

    const uploadedImages: { url: string; publicId: string; alt: string; isPrimary: boolean; color?: string; sortOrder?: number }[] = [];

    if (Array.isArray(bodyImages)) {
      bodyImages.forEach((img: any, idx: number) => {
        if (typeof img === 'string') {
          uploadedImages.push({
            url: img,
            publicId: '',
            alt: name,
            isPrimary: idx === 0,
            sortOrder: idx + 1,
          });
        } else if (img && (img.url || img.secure_url)) {
          uploadedImages.push({
            url: img.secure_url || img.url,
            publicId: img.publicId || img.public_id || '',
            alt: img.alt || name,
            isPrimary: Boolean(img.isPrimary || idx === 0),
            color: img.color || img.colorAssigned,
            sortOrder: img.sortOrder || idx + 1,
          });
        }
      });
    }

    if (req.files) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFiles = [...(filesObj.image || []), ...(filesObj.images || [])];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new AppError(`Unsupported image file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP`, 400);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new AppError(`File ${file.originalname} exceeds 5MB limit.`, 400);
        }

        const result = await uploadToCloudinary(file.buffer, { folder: folderPath });
        newlyUploadedPublicIds.push(result.public_id);
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: name,
          isPrimary: uploadedImages.length === 0,
          sortOrder: uploadedImages.length + 1,
        });
      }
    }

    let categoryDocForValidation = null;
    if (categoryId) {
      categoryDocForValidation = await Category.findById(categoryId);
    }
    if (!categoryDocForValidation && typeof categoryId === 'string') {
      categoryDocForValidation = await Category.findOne({
        $or: [{ slug: categoryId }, { name: new RegExp(`^${categoryId}$`, 'i') }],
      });
    }
    const catSlug = (categoryDocForValidation?.slug || (typeof categoryId === 'string' ? categoryId : '')).toLowerCase();
    const config = (CATEGORY_CONFIG as Record<string, any>)[catSlug];

    let finalProductType: 'FEEDING' | 'NON-FEEDING' | null = null;
    let finalSubcategory: string | null = null;

    if (config) {
      if (config.subcategories.length > 0) {
        const rawType = productData.productType || productData.subcategory;
        const upperType = (rawType || '').toString().toUpperCase();
        if (upperType === 'FEEDING' || upperType === 'NON-FEEDING') {
          finalProductType = upperType as 'FEEDING' | 'NON-FEEDING';
          finalSubcategory = upperType === 'FEEDING' ? 'Feeding' : 'Non-Feeding';
        } else {
          throw new AppError(
            `Category "${config.label}" requires a valid subcategory selection: "feeding" or "non-feeding".`,
            400
          );
        }
      } else {
        finalProductType = null;
        finalSubcategory = null;
      }
    } else {
      const upperType = (productData.productType || '').toString().toUpperCase();
      if (upperType === 'FEEDING' || upperType === 'NON-FEEDING') {
        finalProductType = upperType as 'FEEDING' | 'NON-FEEDING';
        finalSubcategory = upperType === 'FEEDING' ? 'Feeding' : 'Non-Feeding';
      }
    }

    const initialStatus = (productData.status || 'PUBLISHED').toUpperCase();

    const product = await Product.create({
      name,
      slug,
      variants,
      ...productData,
      category: categoryId,
      productType: finalProductType,
      subcategory: finalSubcategory,
      images: uploadedImages,
      status: initialStatus,
      isActive: initialStatus === 'PUBLISHED',
    });

    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(201).json({
      success: true,
      message: 'Product created and published successfully',
      data: product,
    });
  } catch (error) {
    if (newlyUploadedPublicIds.length > 0) {
      logger.warn(`Cleaning up ${newlyUploadedPublicIds.length} orphan Cloudinary images due to product creation failure`);
      for (const pubId of newlyUploadedPublicIds) {
        await deleteFromCloudinary(pubId).catch(() => {});
      }
    }
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
        updateData.slug = `${updateData.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    if (updateData.variants && Array.isArray(updateData.variants)) {
      const skus = updateData.variants.map((v: { sku: string }) => v?.sku).filter(Boolean);
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        throw new AppError('Duplicate variant SKUs found in update payload', 400);
      }
    }

    if (req.files) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFiles = [...(filesObj.image || []), ...(filesObj.images || [])];

      if (imageFiles.length > 0) {
        const categoryDoc = await Category.findById(product.category);
        const folderPath = getCategoryFolderPath(categoryDoc?.slug || categoryDoc?.name || 'general');
        const uploadedImages: { url: string; publicId: string; alt: string; isPrimary: boolean }[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const result = await uploadToCloudinary(file.buffer, { folder: folderPath });
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: product.name,
            isPrimary: i === 0,
          });
        }
        updateData.images = uploadedImages;
      }
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      const newPublicIds = new Set(updateData.images.map((img: any) => img.publicId || img.public_id).filter(Boolean));
      for (const oldImg of product.images || []) {
        const oldPublicId = oldImg.publicId || (oldImg.url ? oldImg.url.match(/\/v\d+\/(.+?)\./)?.[1] : null);
        if (oldPublicId && !newPublicIds.has(oldPublicId)) {
          logger.info(`Cleaning replaced Cloudinary image: ${oldPublicId}`);
          await deleteFromCloudinary(oldPublicId).catch(() => {});
        }
      }
    }

    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
      updateData.isActive = updateData.status === 'PUBLISHED';
    }

    if (updateData.category !== undefined || updateData.productType !== undefined || updateData.subcategory !== undefined) {
      const targetCatId = updateData.category || product.category;
      let categoryDoc = null;
      if (targetCatId) {
        categoryDoc = await Category.findById(targetCatId);
      }
      if (!categoryDoc && typeof targetCatId === 'string') {
        categoryDoc = await Category.findOne({
          $or: [{ slug: targetCatId }, { name: new RegExp(`^${targetCatId}$`, 'i') }],
        });
      }

      if (categoryDoc) {
        updateData.category = categoryDoc._id;
      }

      const catSlug = (categoryDoc?.slug || (typeof targetCatId === 'string' ? targetCatId : '')).toLowerCase();
      const config = (CATEGORY_CONFIG as Record<string, any>)[catSlug];

      if (config) {
        if (config.subcategories.length > 0) {
          const rawType = updateData.productType !== undefined ? updateData.productType : (product.productType || updateData.subcategory);
          const upperType = (rawType || '').toString().toUpperCase();
          if (upperType === 'FEEDING' || upperType === 'NON-FEEDING') {
            updateData.productType = upperType;
            updateData.subcategory = upperType === 'FEEDING' ? 'Feeding' : 'Non-Feeding';
          } else {
            throw new AppError(
              `Category "${config.label}" requires a valid subcategory selection: "feeding" or "non-feeding".`,
              400
            );
          }
        } else {
          updateData.productType = null;
          updateData.subcategory = null;
        }
      }
    }

    const updatedProductDoc = await Product.findByIdAndUpdate(id, updateData);

    if (!updatedProductDoc) {
      throw new AppError('Product not found for update', 404);
    }

    if (updatedProductDoc.category) {
      const cat = await Category.findById(updatedProductDoc.category);
      if (cat) {
        updatedProductDoc.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
      }
    }
    const updatedProduct = updatedProductDoc;

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    if (updatedProduct.slug !== product.slug) {
      await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(updatedProduct.slug));
    }
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
      product: updatedProduct,
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

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (product) {
      await Review.deleteMany({ product: product._id }).catch(() => {});

      const publicIdsToDelete: string[] = [];

      for (const image of product.images || []) {
        if (image) {
          const pid = image.publicId || (image.url ? image.url.match(/\/v\d+\/(.+?)\./)?.[1] : null);
          if (pid) publicIdsToDelete.push(pid);
        }
      }

      for (const variant of product.variants || []) {
        for (const vImg of variant.images || []) {
          if (vImg) {
            const pid = vImg.publicId || (vImg.url ? vImg.url.match(/\/v\d+\/(.+?)\./)?.[1] : null);
            if (pid) publicIdsToDelete.push(pid);
          }
        }
      }

      for (const pubId of Array.from(new Set(publicIdsToDelete))) {
        await deleteFromCloudinary(pubId).catch((err) => {
          logger.warn(`Failed to delete Cloudinary asset ${pubId} during product deletion:`, err);
        });
      }

      await Product.findByIdAndDelete(product._id);

      await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug)).catch(() => {});
      await delFromCache(CACHE_KEYS.PRODUCTS_ALL).catch(() => {});
    }

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

    const searchStr = (q as string).trim();
    const searchRegex = new RegExp(searchStr, 'i');
    
    const orConditions: any[] = [
      { name: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
      { brand: searchRegex },
      { subcategory: searchRegex },
      { fabric: searchRegex },
      { occasion: searchRegex },
    ];

    if (/feeding/i.test(searchStr) && !/non-feeding/i.test(searchStr)) {
      orConditions.push({ productType: 'FEEDING' });
    } else if (/non-feeding/i.test(searchStr)) {
      orConditions.push({ productType: 'NON-FEEDING' });
    }

    const filter = {
      isActive: true,
      $or: orConditions,
    };

    const productsList = await Product.find(filter, { sort: { soldCount: -1 }, skip, limit });
    const total = await Product.countDocuments(filter);

    const products = await Promise.all(
      productsList.map(async (p) => {
        if (p.category) {
          const cat = await Category.findById(p.category);
          if (cat) {
            p.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
          }
        }
        return p;
      })
    );

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

    let product = null;
    if (id) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
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

    const rawReviews = await Review.find(filter);
    // manual sort, skip, limit if not handled fully by simple find, but since we have them in array let's slice
    // Simple mock or manual slice:
    const sortedReviews = rawReviews.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    const slicedReviews = sortedReviews.slice(skip, skip + limit);

    const reviews = await Promise.all(
      slicedReviews.map(async (r: any) => {
        if (r.user) {
          const userDoc = await User.findById(r.user);
          if (userDoc) {
            r.user = { _id: userDoc._id, name: userDoc.name, avatar: userDoc.avatar } as any;
          }
        }
        return r;
      })
    );
    const total = rawReviews.length;

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

    let product = null;
    if (id) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
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

    const review = await Review.create(reviewData);

    const allReviews = await Review.find({ product: id, isApproved: true });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    const ratings = {
      average: Math.round(avgRating * 10) / 10,
      count: allReviews.length,
      distribution,
    };
    const reviewCount = allReviews.length;
    await Product.findByIdAndUpdate(product._id || product.id, { ratings, reviewCount });

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

    let product = null;
    if (id) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const related = await Product.find({
      category: product.category,
      isActive: true,
    }, { limit: 6 });

    res.status(200).json({
      success: true,
      data: related.filter((p) => p._id !== id && p.id !== id),
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
    const productsList = await Product.find({ isActive: true }, { sort: { featuredOrder: 1, createdAt: -1 }, limit: 8 });

    const products = await Promise.all(
      productsList.map(async (p) => {
        if (p.category) {
          const cat = await Category.findById(p.category);
          if (cat) {
            p.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
          }
        }
        return p;
      })
    );

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort as string);

    const filter: Record<string, unknown> = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = (req.query.status as string).toUpperCase();
    }

    if (req.query.category && req.query.category !== 'all') {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: req.query.category }, { name: new RegExp(`^${req.query.category}$`, 'i') }],
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    if (req.query.productType && req.query.productType !== 'all') {
      filter.productType = (req.query.productType as string).toUpperCase();
    }

    if (req.query.featured === 'yes') filter.featured = true;
    if (req.query.featured === 'no') filter.featured = false;

    if (req.query.search) {
      const q = (req.query.search as string).trim();
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
        { 'variants.sku': searchRegex },
      ];
    }

    const productsList = await Product.find(filter, { sort, skip, limit });
    const total = await Product.countDocuments(filter);

    const products = await Promise.all(
      productsList.map(async (p) => {
        if (p.category) {
          const cat = await Category.findById(p.category);
          if (cat) {
            p.category = { _id: cat._id, name: cat.name, slug: cat.slug } as any;
          }
        }
        return p;
      })
    );

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

export const updateProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock, variantSku } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      throw new AppError('Valid stock number is required', 400);
    }

    let product = null;
    if (id) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const stockNum = Math.max(0, Number(stock));

    if (variantSku) {
      const variant = product.variants.find((v) => v.sku === variantSku);
      if (variant) {
        variant.stock = stockNum;
      }
    } else {
      product.variants.forEach((v) => {
        v.stock = stockNum;
      });
    }

    await Product.findByIdAndUpdate(product._id || product.id, { variants: product.variants });
    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
    const uppercaseStatus = (status as string || '').toUpperCase();

    if (!validStatuses.includes(uppercaseStatus)) {
      throw new AppError('Invalid product status. Must be DRAFT, PUBLISHED, or ARCHIVED', 400);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { status: uppercaseStatus, isActive: uppercaseStatus === 'PUBLISHED' }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: `Product status updated to ${uppercaseStatus}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { status: 'ARCHIVED', isActive: false }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await delFromCache(CACHE_KEYS.PRODUCT_BY_SLUG(product.slug));
    await delFromCache(CACHE_KEYS.PRODUCTS_ALL);

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, published, draft, archived, featured] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'PUBLISHED' }),
      Product.countDocuments({ status: 'DRAFT' }),
      Product.countDocuments({ status: 'ARCHIVED' }),
      Product.countDocuments({ featured: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        published,
        draft,
        archived,
        lowStock: 0,
        outOfStock: 0,
        featured,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file || (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).image?.[0]) || (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).images?.[0]) || (Array.isArray(req.files) ? req.files[0] : null);

    if (!file) {
      throw new AppError('No image file provided. Expected field: "image" or "images"', 400);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(`Unsupported image format: ${file.mimetype}. Allowed formats: JPEG, JPG, PNG, WEBP`, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError('Image file is too large. Maximum size is 5MB', 400);
    }

    const categoryHint = req.body?.category || req.body?.categorySlug || req.query?.category || req.query?.categorySlug;
    const folderPath = getCategoryFolderPath(categoryHint as string);

    logger.info(`[Backend API] Processing product image upload. File name: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size} bytes, Folder: ${folderPath}`);

    const result = await uploadToCloudinary(file.buffer, {
      folder: folderPath,
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      data: {
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let filesList: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      filesList = req.files;
    } else if (req.files && typeof req.files === 'object') {
      const obj = req.files as { [fieldname: string]: Express.Multer.File[] };
      filesList = obj.images || obj.image || [];
    } else if (req.file) {
      filesList = [req.file];
    }

    if (filesList.length === 0) {
      throw new AppError('No image files provided for batch upload', 400);
    }

    const categoryHint = req.body?.category || req.body?.categorySlug || req.query?.category || req.query?.categorySlug;
    const folderPath = getCategoryFolderPath(categoryHint as string);

    const uploadedAssets = [];
    for (const file of filesList) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) continue;

      const result = await uploadToCloudinary(file.buffer, { folder: folderPath });
      uploadedAssets.push({
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedAssets.length} images uploaded to Cloudinary successfully`,
      data: uploadedAssets,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { publicId } = req.body || req.params;

    if (!publicId) {
      throw new AppError('Public ID is required for image deletion', 400);
    }

    await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted from Cloudinary successfully',
    });
  } catch (error) {
    next(error);
  }
};
