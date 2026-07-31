import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await User.findById(userId)
      .populate({
        path: 'wishlist',
        select: 'name slug images variants.price variants.compareAtPrice brand ratings.average isNew isActive',
        match: { isActive: true },
      })
      .select('wishlist');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user.wishlist,
      count: user.wishlist.length,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new AppError('Product is not available', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      throw new AppError('Product already in wishlist', 409);
    }

    user.wishlist.push(productId as any);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      data: { wishlistCount: user.wishlist.length },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const index = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      throw new AppError('Product not in wishlist', 404);
    }

    user.wishlist.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      data: { wishlistCount: user.wishlist.length },
    });
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { variantSku } = req.body;

    if (!variantSku) {
      throw new AppError('Variant SKU is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const wishlistIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (wishlistIndex === -1) {
      throw new AppError('Product not in wishlist', 404);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not available', 404);
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    if (variant.stock < 1) {
      throw new AppError('Product is out of stock', 400);
    }

    const existingCartItem = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantSku === variantSku
    );

    if (existingCartItem > -1) {
      if (variant.stock < user.cart[existingCartItem].quantity + 1) {
        throw new AppError('Insufficient stock', 400);
      }
      user.cart[existingCartItem].quantity += 1;
    } else {
      user.cart.push({
        product: productId as any,
        variantSku,
        quantity: 1,
        addedAt: new Date(),
      });
    }

    user.wishlist.splice(wishlistIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product moved to cart',
      data: {
        wishlistCount: user.wishlist.length,
        cartCount: user.cart.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const isInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const user = await User.findById(userId).select('wishlist');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const inWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    res.status(200).json({
      success: true,
      data: { inWishlist },
    });
  } catch (error) {
    next(error);
  }
};
