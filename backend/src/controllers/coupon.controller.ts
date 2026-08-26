import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/firebase';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

// Helper to convert Firestore doc to plain object
const toCoupon = (doc: any) => ({ id: doc.id, ...doc.data() });

export const validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, subtotal, userId, items } = req.body;
    if (!code) throw new AppError('Coupon code is required', 400);
    const couponSnap = await getDb().collection('coupons').where('code', '==', code.toUpperCase()).limit(1).get();
    const coupon = couponSnap.empty ? null : toCoupon(couponSnap.docs[0]);
    if (!coupon) throw new AppError('Invalid coupon code', 404);
    if (!coupon.isValid) throw new AppError('This coupon has expired or is no longer valid', 400);
    if (subtotal && subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value of ₹${coupon.minOrderValue} required`, 400);
    }
    if (coupon.isFirstOrderOnly && userId) {
      const ordersSnap = await getDb().collection('orders').where('user', '==', userId).get();
      if (!ordersSnap.empty) throw new AppError('This coupon is valid for first order only', 400);
    }
    if (userId) {
      const usedCount = (coupon.usedBy || []).filter((u: any) => u.user === userId).length;
      if (usedCount >= coupon.perUserLimit) throw new AppError('You have already used this coupon the maximum number of times', 400);
    }
    if (items && items.length > 0 && coupon.minItems && items.length < coupon.minItems) {
      throw new AppError(`Minimum ${coupon.minItems} items required for this coupon`, 400);
    }
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const calc = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount > 0 ? Math.min(calc, coupon.maxDiscount) : calc;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal ?? Infinity);
    }
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: Math.round(discountAmount * 100) / 100,
          maxDiscount: coupon.maxDiscount,
          minOrderValue: coupon.minOrderValue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const snaps = await getDb().collection('coupons').where('isActive', '==', true).get();
    const coupons = snaps.docs.map(toCoupon);
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    let query: any = getDb().collection('coupons');
    if (req.query.isActive !== undefined) {
      const isActive = req.query.isActive === 'true';
      query = query.where('isActive', '==', isActive);
    }
    const allSnap = await query.get();
    const all = allSnap.docs.map(toCoupon);
    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const data = all.slice(skip, skip + limit);
    res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const couponData = req.body;
    const existingSnap = await getDb().collection('coupons').where('code', '==', couponData.code.toUpperCase()).limit(1).get();
    if (!existingSnap.empty) throw new AppError('Coupon code already exists', 409);
    const ref = await getDb().collection('coupons').add({ ...couponData, code: couponData.code.toUpperCase() });
    const snap = await ref.get();
    const coupon = toCoupon(snap);
    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existingSnap = await getDb().collection('coupons').where('code', '==', updateData.code).limit(1).get();
      const existing = existingSnap.empty ? null : toCoupon(existingSnap.docs[0]);
      if (existing && existing.id !== id) throw new AppError('Coupon code already exists', 409);
    }
    const ref = getDb().collection('coupons').doc(id);
    await ref.update(updateData);
    const snap = await ref.get();
    const coupon = snap.exists ? toCoupon(snap) : null;
    if (!coupon) throw new AppError('Coupon not found', 404);
    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const ref = getDb().collection('coupons').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new AppError('Coupon not found', 404);
    await ref.delete();
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
