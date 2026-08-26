import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger, parsePagination, calculateDiscount, calculateTax, roundOff, generateOrderNumber } from '../utils/helpers';
import { sendEmail, getOrderConfirmationEmailHtml } from '../config/email';
import { getDb } from '../config/firebase';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants';
import { IOrder, IOrderItem } from '../models/Order';
import { IProduct, IProductVariant, IProductImage } from '../models/Product';
import { ICoupon } from '../models/Coupon';
import { IUser } from '../models/User';

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

    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const productSnap = await getDb().collection('products').doc(item.productId).get();
      const product = productSnap.exists ? ({ id: productSnap.id, ...productSnap.data() } as IProduct) : null;
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      const variant = product.variants?.find(
        (v: IProductVariant) => v.sku === item.variantSku
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

      const primaryImage = product.images?.find((img: IProductImage) => img.isPrimary) || product.images?.[0];

      const itemSubtotal = variant.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product.id || productSnap.id,
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
    let couponData: { code: string; discountAmount: number; discountType: 'percentage' | 'fixed' } | undefined;

    if (couponCode) {
      const couponSnap = await getDb().collection('coupons').where('code', '==', couponCode.toUpperCase()).limit(1).get();
      const coupon = couponSnap.empty ? null : ({ id: couponSnap.docs[0].id, ...couponSnap.docs[0].data() } as ICoupon);

      if (!coupon) {
        throw new AppError('Invalid or expired coupon code', 400);
      }

      if (subtotal < coupon.minOrderValue) {
        throw new AppError(
          `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
          400
        );
      }

      if (coupon.isFirstOrderOnly) {
        const existingOrdersSnap = await getDb().collection('orders').where('user', '==', userId).get();
        const existingOrders = existingOrdersSnap.size;
        if (existingOrders > 0) {
          throw new AppError('This coupon is valid for first order only', 400);
        }
      }

      const usedCount = (coupon.usedBy || []).filter((u: any) => u.user === userId).length;
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

      await getDb().collection('coupons').doc(coupon.id || couponSnap.docs[0].id).update({
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

    const orderPayload: Partial<IOrder> = {
      orderNumber: generateOrderNumber(),
      user: userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod || PAYMENT_METHODS.COD,
        status: paymentStatus as any,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderRef = await getDb().collection('orders').add(orderPayload);
    const orderSnap = await orderRef.get();
    const order = { id: orderSnap.id, ...orderSnap.data() } as IOrder;

    await getDb().runTransaction(async (t) => {
      for (const item of items) {
        const docRef = getDb().collection('products').doc(item.productId);
        const productDoc = await t.get(docRef);
        if (!productDoc.exists) continue;
        const productData = productDoc.data() as any;
        if (!productData) continue;
        const variant = productData.variants?.find((v: any) => v.sku === item.variantSku);
        if (variant) {
          if (variant.stock < item.quantity) {
            throw new AppError('Stock mismatch during transaction', 400);
          }
          variant.stock -= item.quantity;
          productData.soldCount = (productData.soldCount || 0) + item.quantity;
          if (variant.stock <= (variant.lowStockThreshold || 5)) {
            logger.warn(`Low stock alert: ${productData.name} - ${variant.sku}`);
          }
          t.update(docRef, productData);
        }
      }
    });

    const orderDoc = await getDb().collection('orders').doc(order.id || orderRef.id).get();
    const populatedOrder = orderDoc.exists ? ({ id: orderDoc.id, ...orderDoc.data() } as any) : null;
    if (populatedOrder && Array.isArray(populatedOrder.items)) {
      const itemsWithProducts = await Promise.all(
        populatedOrder.items.map(async (it: any) => {
          const prodSnap = await getDb().collection('products').doc(it.product).get();
          const prod = prodSnap.exists ? (prodSnap.data() as any) : null;
          return {
            ...it,
            product: prod ? { name: prod.name, slug: prod.slug, images: prod.images } : null,
          };
        })
      );
      populatedOrder.items = itemsWithProducts;
    }

    try {
      const userSnap = await getDb().collection('users').doc(userId).get();
      const user = userSnap.exists ? ({ id: userSnap.id, ...userSnap.data() } as IUser) : null;
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

    await getDb().collection('users').doc(userId).update({ cart: [] });

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

    let query: FirebaseFirestore.Query = getDb().collection('orders');
    query = query.where('user', '==', userId);

    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }

    const ordersSnap = await query.orderBy('createdAt', 'desc').offset(skip).limit(limit).get();
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const totalSnap = await query.get();
    const total = totalSnap.size;
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

    const orderSnap = await getDb().collection('orders').doc(id).get();
    const order = orderSnap.exists ? ({ id: orderSnap.id, ...orderSnap.data() } as any) : null;
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.user !== userId && userRole === 'customer') {
      throw new AppError('Not authorized to view this order', 403);
    }
    // Manually populate product details for each item
    if (Array.isArray(order.items)) {
      const itemsWithProducts = await Promise.all(
        order.items.map(async (it: any) => {
          const prodSnap = await getDb().collection('products').doc(it.product).get();
          const prod = prodSnap.exists ? (prodSnap.data() as any) : null;
          return {
            ...it,
            product: prod ? { name: prod.name, slug: prod.slug, images: prod.images } : null,
          };
        })
      );
      order.items = itemsWithProducts;
    }

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

    const orderSnap = await getDb().collection('orders').doc(id).get();
    const order = orderSnap.exists ? ({ id: orderSnap.id, ...orderSnap.data() } as any) : null;
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
    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }

    order.status = ORDER_STATUS.CANCELLED;
    if (reason) order.cancellationReason = reason;

    // Restore stock via transaction
    if (Array.isArray(order.items)) {
      await getDb().runTransaction(async (t) => {
        for (const item of order.items) {
          const docRef = getDb().collection('products').doc(item.product);
          const productDoc = await t.get(docRef);
          if (!productDoc.exists) continue;
          const productData = productDoc.data() as any;
          if (!productData) continue;
          const variant = productData.variants?.find((v: any) => v.sku === item.variant?.sku);
          if (variant) {
            variant.stock += item.quantity;
            productData.soldCount = Math.max(0, (productData.soldCount || 0) - item.quantity);
            t.update(docRef, productData);
          }
        }
      });
    }

    await getDb().collection('orders').doc(id).update({
      status: order.status,
      cancellationReason: order.cancellationReason || '',
      updatedAt: new Date(),
    });

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

    const orderSnap = await getDb().collection('orders').doc(id).get();
    const order = orderSnap.exists ? ({ id: orderSnap.id, ...orderSnap.data() } as any) : null;
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.user !== userId) {
      throw new AppError('Not authorized to return this order', 403);
    }
    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw new AppError('Only delivered orders can be returned', 400);
    }
    order.status = ORDER_STATUS.RETURNED;
    if (reason) order.returnReason = reason;
    await getDb().collection('orders').doc(id).update({
      status: order.status,
      returnReason: order.returnReason || '',
      updatedAt: new Date(),
    });

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
    let query: FirebaseFirestore.Query = getDb().collection('orders');

    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
    if (req.query.search) {
      query = query.where('orderNumber', '==', req.query.search as string);
    }
    if (req.query.startDate && req.query.endDate) {
      const gteDate = new Date(req.query.startDate as string);
      const lteDate = new Date(req.query.endDate as string);
      query = query.where('createdAt', '>=', gteDate).where('createdAt', '<=', lteDate);
    }

    const ordersSnap = await query.orderBy('createdAt', 'desc').offset(skip).limit(limit).get();
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const totalSnap = await query.get();
    const total = totalSnap.size;
    const totalPages = Math.ceil(total / limit);

    // Manually populate user details
    const ordersWithUser = await Promise.all(
      orders.map(async (ord: any) => {
        if (!ord.user) return { ...ord, user: null };
        const userSnap = await getDb().collection('users').doc(ord.user).get();
        const user = userSnap.exists ? ({ id: userSnap.id, ...userSnap.data() } as any) : null;
        return {
          ...ord,
          user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
        };
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
    const orderSnap = await getDb().collection('orders').doc(id).get();
    const order = orderSnap.exists ? ({ id: orderSnap.id, ...orderSnap.data() } as any) : null;
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
    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(status);
    if (newIndex < currentIndex && status !== ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.REFUNDED) {
      throw new AppError('Cannot move order to a previous status', 400);
    }
    const updatePayload: any = {
      status,
      updatedAt: new Date(),
    };
    if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
    if (trackingUrl) updatePayload.trackingUrl = trackingUrl;
    if (estimatedDelivery) updatePayload.estimatedDelivery = new Date(estimatedDelivery);
    if (status === ORDER_STATUS.DELIVERED) {
      updatePayload.deliveredAt = new Date();
      updatePayload['paymentInfo.status'] = PAYMENT_STATUS.PAID;
      // Update user loyalty points
      if (order.user) {
        const userSnap = await getDb().collection('users').doc(order.user).get();
        const user = userSnap.exists ? ({ id: userSnap.id, ...userSnap.data() } as any) : null;
        if (user) {
          await getDb().collection('users').doc(user.id).update({
            loyaltyPoints: (user.loyaltyPoints || 0) + Math.floor((order.total || 0) / 100),
          });
        }
      }
    }
    await getDb().collection('orders').doc(id).update(updatePayload);
    const updatedSnap = await getDb().collection('orders').doc(id).get();
    const updatedOrder = updatedSnap.exists ? ({ id: updatedSnap.id, ...updatedSnap.data() } as any) : null;
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
