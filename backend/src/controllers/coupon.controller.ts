import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, subtotal, userId, items } = req.body;

    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 404);
    }

    if (!coupon.isValid()) {
      throw new AppError('This coupon has expired or is no longer valid', 400);
    }

    if (subtotal && subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Minimum order value of ₹${coupon.minOrderValue} required`,
        400
      );
    }

    if (coupon.isFirstOrderOnly && userId) {
      const existingOrders = await Order.countDocuments({ user: userId });
      if (existingOrders > 0) {
        throw new AppError('This coupon is valid for first order only', 400);
      }
    }

    if (userId) {
      const usedCount = coupon.usedBy.filter(
        (u) => u.user.toString() === userId
      ).length;
      if (usedCount >= coupon.perUserLimit) {
        throw new AppError('You have already used this coupon the maximum number of times', 400);
      }
    }

    if (items && items.length > 0 && coupon.minItems > 0) {
      if (items.length < coupon.minItems) {
        throw new AppError(
          `Minimum ${coupon.minItems} items required for this coupon`,
          400
        );
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount > 0
        ? Math.min(calculatedDiscount, coupon.maxDiscount)
        : calculatedDiscount;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal || Infinity);
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

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startsAt: { $lte: now },
      expiresAt: { $gte: now },
    })
      .select('code description discountType discountValue maxDiscount minOrderValue minItems isFirstOrderOnly')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter: Record<string, unknown> = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.code) {
      filter.code = { $regex: req.query.code, $options: 'i' };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: coupons,
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

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const couponData = req.body;

    const existing = await Coupon.findOne({
      code: couponData.code.toUpperCase(),
    });
    if (existing) {
      throw new AppError('Coupon code already exists', 409);
    }

    const coupon = new Coupon({
      ...couponData,
      code: couponData.code.toUpperCase(),
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existing = await Coupon.findOne({
        code: updateData.code,
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Coupon code already exists', 409);
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
