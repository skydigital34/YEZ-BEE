import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger, parsePagination, calculateDiscount, calculateTax, roundOff } from '../utils/helpers';
import { sendEmail, getOrderConfirmationEmailHtml } from '../config/email';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants';

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    const orderItems: {
      product: string;
      variant: { sku: string; color: string; size: string };
      name: string;
      image: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      const variant = product.variants.find(
        (v) => v.sku === item.variantSku
      );
      if (!variant) {
        throw new AppError(`Variant ${item.variantSku} not found for ${product.name}`, 404);
      }

      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} (${variant.color}, ${variant.size})`,
          400
        );
      }

      const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

      const itemSubtotal = variant.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id?.toString() ?? product.id,
        variant: {
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
        },
        name: product.name,
        image: primaryImage?.url || '',
        price: variant.price,
        quantity: item.quantity,
        subtotal: roundOff(itemSubtotal),
      });
    }

    let discount = 0;
    let couponData: { code: string; discountAmount: number; discountType: string } | undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon || !Coupon.isValid(coupon)) {
        throw new AppError('Invalid or expired coupon code', 400);
      }

      if (subtotal < coupon.minOrderValue) {
        throw new AppError(
          `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
          400
        );
      }

      if (coupon.isFirstOrderOnly) {
        const existingOrders = await Order.countDocuments({ user: userId });
        if (existingOrders > 0) {
          throw new AppError('This coupon is valid for first order only', 400);
        }
      }

      const usedCount = coupon.usedBy.filter((u) => u.user === userId).length;
      if (usedCount >= coupon.perUserLimit) {
        throw new AppError('Coupon usage limit reached', 400);
      }

      const calculatedDiscount = calculateDiscount(
        subtotal,
        coupon.discountType,
        coupon.discountValue,
        coupon.maxDiscount || undefined
      );

      discount = calculatedDiscount;

      couponData = {
        code: coupon.code,
        discountAmount: discount,
        discountType: coupon.discountType,
      };

      await Coupon.findByIdAndUpdate(coupon._id?.toString() ?? coupon.id, {
        usedCount: (coupon.usedCount || 0) + 1,
        usedBy: [...(coupon.usedBy || []), { user: userId, usedAt: new Date() }],
      });
    }

    const taxableAmount = subtotal - discount;
    const tax = calculateTax(taxableAmount);
    const shipping = req.body.shipping || 0;
    const totalBeforeRound = taxableAmount + tax + shipping;
    const roundOffValue = roundOff(totalBeforeRound) - totalBeforeRound;
    const total = roundOff(totalBeforeRound);

    const paymentStatus =
      paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING;

    let order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod || PAYMENT_METHODS.COD,
        status: paymentStatus,
      },
      shippingMethod: { name: 'Standard', price: shipping, estimatedDays: '5-7' },
      subtotal: roundOff(subtotal),
      shipping,
      discount: roundOff(discount),
      tax: roundOff(tax),
      total: roundOff(total),
      roundOff: roundOffValue,
      ...(couponData && { coupon: couponData }),
      status: ORDER_STATUS.PENDING,
      notes,
    });

    await getDb().runTransaction(async (t) => {
      for (const item of items) {
        const productRef = t.get(Product.collection().doc(item.productId));
        const productDoc = await productRef;
        if (!productDoc.exists) continue;
        const productData = productDoc.data();
        const variant = productData?.variants?.find((v: any) => v.sku === item.variantSku);
        if (variant) {
          if (variant.stock < item.quantity) {
            throw new AppError('Stock mismatch during transaction', 400);
          }
          variant.stock -= item.quantity;
          productData.soldCount = (productData.soldCount || 0) + item.quantity;
          if (variant.stock <= variant.lowStockThreshold) {
            logger.warn(`Low stock alert: ${productData.name} - ${variant.sku}`);
          }
          t.update(Product.collection().doc(item.productId), productData);
        }
      }
    });

    const populatedOrder = await Order.findById(order._id);
    if (populatedOrder) {
      const itemsWithProducts = await Promise.all(
        populatedOrder.items.map(async (it: any) => {
          const prod = await Product.findById(it.product);
          return {
            ...it,
            product: prod ? { name: prod.name, slug: prod.slug, images: prod.images } : null,
          };
        })
      );
      populatedOrder.items = itemsWithProducts;
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: `Order Confirmed - ${order.orderNumber}`,
          html: getOrderConfirmationEmailHtml(
            user.name,
            order.orderNumber,
            orderItems.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
            total
          ),
        });
      }
    } catch (emailError) {
      logger.warn('Order confirmation email failed:', emailError);
    }

    await User.findByIdAndUpdate(userId, {
      cart: []
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page, limit, skip } = parsePagination(req.query);

    const filter: Record<string, unknown> = { user: userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter, {}, { skip, limit, sort: { createdAt: -1 } });
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.user !== userId && userRole === 'customer') {
      throw new AppError('Not authorized to view this order', 403);
    }
    // Manually populate product details for each item
    const itemsWithProducts = await Promise.all(
      order.items.map(async (it: any) => {
        const prod = await Product.findById(it.product);
        return {
          ...it,
          product: prod ? { name: prod.name, slug: prod.slug, images: prod.images } : null,
        };
      })
    );
    order.items = itemsWithProducts as any;

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.user !== userId) {
      throw new AppError('Not authorized to cancel this order', 403);
    }

    const cancellableStatuses = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
    ];
    if (!cancellableStatuses.includes(order.status as any)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }

    order.status = ORDER_STATUS.CANCELLED as any;
    if (reason) order.cancellationReason = reason;

    // Restore stock via transaction
    await getDb().runTransaction(async (t) => {
      for (const item of order.items) {
        const productRef = t.get(Product.collection().doc(item.product));
        const productDoc = await productRef;
        if (!productDoc.exists) continue;
        const productData = productDoc.data();
        const variant = productData?.variants?.find((v: any) => v.sku === item.variant.sku);
        if (variant) {
          variant.stock += item.quantity;
          productData.soldCount = Math.max(0, (productData.soldCount || 0) - item.quantity);
          t.update(Product.collection().doc(item.product), productData);
        }
      }
    });

    await Order.findByIdAndUpdate(id, { status: order.status, cancellationReason: order.cancellationReason });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.user !== userId) {
      throw new AppError('Not authorized to return this order', 403);
    }
    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw new AppError('Only delivered orders can be returned', 400);
    }
    order.status = ORDER_STATUS.RETURNED as any;
    if (reason) order.returnReason = reason;
    await Order.findByIdAndUpdate(id, { status: order.status, returnReason: order.returnReason });

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    // Simple search on orderNumber only (Firestore lacks $or)
    if (req.query.search) {
      filter.orderNumber = req.query.search as string;
    }
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }
    const orders = await Order.find(filter, {}, { skip, limit, sort: { createdAt: -1 } });
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    // Manually populate user details
    const ordersWithUser = await Promise.all(
      orders.map(async (ord: any) => {
        const user = await User.findById(ord.user);
        return { ...ord, user: user ? { name: user.name, email: user.email, phone: user.phone } : null };
      })
    );
    res.status(200).json({
      success: true,
      data: ordersWithUser,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }
    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const statusFlow = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
    ];
    const currentIndex = statusFlow.indexOf(order.status as any);
    const newIndex = statusFlow.indexOf(status);
    if (newIndex < currentIndex && status !== ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.REFUNDED) {
      throw new AppError('Cannot move order to a previous status', 400);
    }
    const updatePayload: any = {
      status,
    };
    if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
    if (trackingUrl) updatePayload.trackingUrl = trackingUrl;
    if (estimatedDelivery) updatePayload.estimatedDelivery = new Date(estimatedDelivery);
    if (status === ORDER_STATUS.DELIVERED) {
      updatePayload.deliveredAt = new Date();
      updatePayload['paymentInfo.status'] = PAYMENT_STATUS.PAID;
      // Update user loyalty points
      const user = await User.findById(order.user);
      if (user) {
        await User.findByIdAndUpdate(user._id?.toString() ?? user.id, {
          loyaltyPoints: (user.loyaltyPoints || 0) + Math.floor(order.total / 100),
        });
      }
    }
    await Order.findByIdAndUpdate(id, updatePayload);
    const updatedOrder = await Order.findById(id);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
