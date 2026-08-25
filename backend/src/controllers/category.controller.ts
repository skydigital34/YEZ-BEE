import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { slugify } from '../utils/helpers';
import { getFromCache, setToCache, delFromCache } from '../config/redis';
import { CACHE_KEYS, DEFAULT_TTL } from '../utils/constants';

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cacheKey = CACHE_KEYS.CATEGORIES_ALL;
    const cached = await getFromCache(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate('children', 'name slug image')
      .populate('productCount')
      .lean();

    const hierarchy = buildCategoryHierarchy(categories);

    await setToCache(cacheKey, hierarchy, DEFAULT_TTL.CATEGORY);

    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const cacheKey = CACHE_KEYS.CATEGORY_BY_SLUG(slug);
    const cached = await getFromCache(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    let category = await Category.findOne({ slug, isActive: true })
      .populate('children', 'name slug image description')
      .lean();

    if (!category) {
      const formattedName = slug.toUpperCase().replace(/-/g, ' ');
      category = {
        _id: `cat-${slug}`,
        name: formattedName,
        slug,
        description: `${formattedName} Collection`,
        isActive: true,
        children: [],
      } as any;
    }

    await setToCache(cacheKey, category, DEFAULT_TTL.CATEGORY);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryWithProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    const formattedName = slug.toUpperCase().replace(/-/g, ' ');
    const fallbackCategory = {
      _id: `cat-${slug}`,
      name: formattedName,
      slug,
      description: `${formattedName} Collection`,
      isActive: true,
    };

    let category = await Category.findOne({ slug, isActive: true }).lean();
    let productTypeFilter: string | null = (req.query.productType as string) || null;

    if (!category && slug.includes('-')) {
      const parts = slug.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart === 'feeding' || (parts.length >= 2 && parts.slice(-2).join('-') === 'non-feeding')) {
        const subType = slug.endsWith('non-feeding') ? 'NON-FEEDING' : 'FEEDING';
        const parentSlug = slug.replace(/-feeding$/, '').replace(/-non-feeding$/, '');
        category = await Category.findOne({ slug: parentSlug, isActive: true }).lean();
        if (category) {
          productTypeFilter = subType;
        }
      }
    }

    if (!category) {
      const formattedName = slug.toUpperCase().replace(/-/g, ' ');
      category = {
        _id: `cat-${slug}`,
        name: formattedName,
        slug,
        description: `${formattedName} Collection`,
        isActive: true,
      } as any;
    }

    const filter: Record<string, unknown> = {
      $or: [
        { category: category._id },
        { subcategory: new RegExp(slug, 'i') },
        { categorySlug: slug.toLowerCase() },
        { 'category.slug': slug.toLowerCase() },
      ],
      isActive: true,
    };

    if (productTypeFilter) {
      filter.productType = productTypeFilter.toUpperCase();
    }

    const sortField = (req.query.sort as string) || 'newest';
    let sort: Record<string, 1 | -1> = { createdAt: -1 };

    switch (sortField) {
      case 'price_asc': sort = { 'variants.price': 1 }; break;
      case 'price_desc': sort = { 'variants.price': -1 }; break;
      case 'name_asc': sort = { name: 1 }; break;
      case 'name_desc': sort = { name: -1 }; break;
      case 'best_seller': sort = { soldCount: -1 }; break;
      default: sort = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name slug images variants.price variants.compareAtPrice brand ratings.average isNew isTrending')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, parent, ...categoryData } = req.body;

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409);
    }

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = new Category({
      name,
      slug: slugify(name),
      parent: parent || null,
      ...categoryData,
    });

    await category.save();
    await delFromCache(CACHE_KEYS.CATEGORIES_ALL);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let category = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      category = await Category.findOne({ slug: id });
    }
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (updateData.name && updateData.name !== category.name) {
      updateData.slug = slugify(updateData.name);
      const existing = await Category.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('A category with this name already exists', 409);
      }
    }

    if (updateData.parent && updateData.parent === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    await delFromCache(CACHE_KEYS.CATEGORIES_ALL);
    await delFromCache(CACHE_KEYS.CATEGORY_BY_SLUG(category.slug));

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    let category = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      category = await Category.findOne({ slug: id });
    }
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const childCount = await Category.countDocuments({ parent: id });
    if (childCount > 0) {
      throw new AppError(
        `Cannot delete category with ${childCount} subcategories. Remove or reassign them first.`,
        400
      );
    }

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} products. Remove or reassign them first.`,
        400
      );
    }

    await Category.findByIdAndDelete(id);

    await delFromCache(CACHE_KEYS.CATEGORIES_ALL);
    await delFromCache(CACHE_KEYS.CATEGORY_BY_SLUG(category.slug));

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const buildCategoryHierarchy = (categories: any[], parentId: string | null = null): any[] => {
  return categories
    .filter((cat) => {
      const catParentId = cat.parent ? cat.parent.toString() : null;
      return parentId === null
        ? catParentId === null || catParentId === undefined
        : catParentId === parentId;
    })
    .map((cat) => ({
      ...cat,
      children: buildCategoryHierarchy(categories, cat._id.toString()),
    }));
};
