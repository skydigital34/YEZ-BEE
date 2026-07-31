import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await User.findById(userId)
      .populate({
        path: 'cart.product',
        select: 'name slug images variants price isActive',
      })
      .select('cart');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const cartWithDetails = user.cart.map((item) => {
      const product = item.product as unknown as {
        _id: string;
        name: string;
        slug: string;
        images: { url: string; alt: string; isPrimary: boolean }[];
        variants: { sku: string; color: string; colorHex: string; size: string; price: number; compareAtPrice?: number; stock: number; isActive: boolean }[];
        isActive: boolean;
      };

      const variant = product.variants?.find(
        (v) => v.sku === item.variantSku
      );

      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '',
          isActive: product.isActive,
        },
        variant: variant
          ? {
              sku: variant.sku,
              color: variant.color,
              colorHex: variant.colorHex,
              size: variant.size,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              stock: variant.stock,
            }
          : null,
        quantity: item.quantity,
        addedAt: item.addedAt,
      };
    });

    const subtotal = cartWithDetails.reduce((sum, item) => {
      return sum + (item.variant?.price || 0) * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        items: cartWithDetails,
        subtotal: Math.round(subtotal * 100) / 100,
        totalItems: cartWithDetails.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, variantSku, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new AppError('Product is not available', 400);
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    if (!variant.isActive) {
      throw new AppError('This variant is not available', 400);
    }

    if (variant.stock < quantity) {
      throw new AppError(`Only ${variant.stock} items available in stock`, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantSku === variantSku
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      if (variant.stock < newQuantity) {
        throw new AppError(
          `Only ${variant.stock} items available in stock. You already have ${user.cart[existingItemIndex].quantity} in cart.`,
          400
        );
      }
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId as any,
        variantSku,
        quantity,
        addedAt: new Date(),
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cartCount: user.cart.length },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      throw new AppError('Invalid request. Item ID and quantity (min 1) are required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const cartItem = (user.cart as any).id(itemId);
    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    const product = await Product.findById(cartItem.product);
    if (!product) {
      throw new AppError('Product no longer exists', 404);
    }

    const variant = product.variants.find((v) => v.sku === cartItem.variantSku);
    if (variant && variant.stock < quantity) {
      throw new AppError(`Only ${variant.stock} items available`, 400);
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { cartCount: user.cart.length },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const item = (user.cart as any).id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    item.deleteOne();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cartCount: user.cart.length },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
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

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

export const getCartCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await User.findById(userId).select('cart');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { count: user.cart.length },
    });
  } catch (error) {
    next(error);
  }
};
