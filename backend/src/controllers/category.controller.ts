import { Request, Response, NextFunction } from 'express';
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

    const categories = await Category.find({ isActive: true });
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

    let category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      const formattedName = slug.toUpperCase().replace(/-/g, ' ');
      category = {
        _id: `cat-${slug}`,
        name: formattedName,
        slug,
        description: `${formattedName} Collection`,
        isActive: true,
        hasFeedingSplit: true,
        subcategories: [],
        filters: [],
        displayOrder: 0,
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

    let category = await Category.findOne({ slug, isActive: true });
    let productTypeFilter: string | null = (req.query.productType as string) || null;

    if (!category && slug.includes('-')) {
      const parts = slug.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart === 'feeding' || (parts.length >= 2 && parts.slice(-2).join('-') === 'non-feeding')) {
        const subType = slug.endsWith('non-feeding') ? 'NON-FEEDING' : 'FEEDING';
        const parentSlug = slug.replace(/-feeding$/, '').replace(/-non-feeding$/, '');
        category = await Category.findOne({ slug: parentSlug, isActive: true });
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
        hasFeedingSplit: true,
        subcategories: [],
        filters: [],
        displayOrder: 0,
      } as any;
    }

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    if (productTypeFilter) {
      filter.productType = productTypeFilter.toUpperCase();
    }

    const products = await Product.find(filter, { skip, limit });
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

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

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409);
    }

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
      parent: parent || null,
      ...categoryData,
    });

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

    let category = await Category.findById(id);
    if (!category) {
      category = await Category.findOne({ slug: id });
    }
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (updateData.name && updateData.name !== category.name) {
      updateData.slug = slugify(updateData.name);
    }

    if (updateData.parent && updateData.parent === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }

    const updated = await Category.findByIdAndUpdate(category._id || id, updateData);

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

    let category = await Category.findById(id);
    if (!category) {
      category = await Category.findOne({ slug: id });
    }
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const targetId = category._id || id;
    const childCount = (await Category.find({ parent: targetId })).length;
    if (childCount > 0) {
      throw new AppError(
        `Cannot delete category with ${childCount} subcategories. Remove or reassign them first.`,
        400
      );
    }

    const productCount = await Product.countDocuments({ category: targetId });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} products. Remove or reassign them first.`,
        400
      );
    }

    await Category.findByIdAndDelete(targetId);

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
      const catParentId = cat.parent ? String(cat.parent) : null;
      return parentId === null
        ? catParentId === null || catParentId === undefined
        : catParentId === parentId;
    })
    .map((cat) => ({
      ...cat,
      children: buildCategoryHierarchy(categories, String(cat._id || cat.id)),
    }));
};
