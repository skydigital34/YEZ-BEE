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

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    // Manually populate wishlist with product details
    const wishlistProductIds = user.wishlist || [];
    const wishlistProducts = await Promise.all(
      wishlistProductIds.map(async (pid) => {
        const prod = await Product.findById(pid as any);
        if (!prod || !prod.isActive) return null;
        // Return only needed fields
        return {
          _id: prod.id,
          name: prod.name,
          slug: prod.slug,
          images: prod.images,
          price: prod.variants?.[0]?.price,
          compareAtPrice: prod.variants?.[0]?.compareAtPrice,
          brand: prod.brand,
          ratings: prod.ratings,
          isNew: prod.isNewProduct,
          isActive: prod.isActive,
        };
      })
    ).filter(Boolean);
    const populatedUser = { ...user, wishlist: wishlistProducts };

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: populatedUser.wishlist,
      count: populatedUser.wishlist.length,
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
      res.status(200).json({
        success: true,
        message: 'Product already in wishlist',
        data: { wishlistCount: user.wishlist.length },
      });
      return;
    }

    const updatedWishlist = [...(user.wishlist || []), productId];
    await User.findByIdAndUpdate(userId, { wishlist: updatedWishlist });

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

    const newWishlist = [...user.wishlist];
    newWishlist.splice(index, 1);
    await User.findByIdAndUpdate(userId, { wishlist: newWishlist });

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      data: { wishlistCount: newWishlist.length },
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

    const wishlistIndex = (user.wishlist || []).findIndex(
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
      throw new AppError('Variant SKU not found', 404);
    }

    if (variant.stock < 1) {
      throw new AppError('Product is out of stock', 400);
    }

    const existingCartItem = (user.cart || []).findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantSku === variantSku
    );

    const updatedCart = [...(user.cart || [])];
    if (existingCartItem > -1) {
      if (variant.stock < updatedCart[existingCartItem].quantity + 1) {
        throw new AppError('Insufficient stock', 400);
      }
      updatedCart[existingCartItem].quantity += 1;
    } else {
      updatedCart.push({
        product: productId as any,
        variantSku,
        quantity: 1,
        addedAt: new Date(),
      });
    }

    const updatedWishlist = [...user.wishlist];
    updatedWishlist.splice(wishlistIndex, 1);

    // Update user document with new wishlist and cart
    await User.findByIdAndUpdate(userId, { wishlist: updatedWishlist, cart: updatedCart });

    res.status(200).json({
      success: true,
      message: 'Product moved to cart',
      data: {
        wishlistCount: updatedWishlist.length,
        cartCount: updatedCart.length,
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

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const inWishlist = (user.wishlist || []).some(
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
