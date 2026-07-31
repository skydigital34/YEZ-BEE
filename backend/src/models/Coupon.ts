import mongoose, { Document, Schema } from 'mongoose';
import { DISCOUNT_TYPES } from '../utils/constants';

export interface ICouponUsedBy {
  user: mongoose.Types.ObjectId;
  usedAt: Date;
}

export interface ICouponDocument extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  usedBy: ICouponUsedBy[];
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableProducts: mongoose.Types.ObjectId[];
  minItems: number;
  isFirstOrderOnly: boolean;
  isValid(): boolean;
}

const couponUsedBySchema = new Schema<ICouponUsedBy>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    usedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, maxlength: 500 },
    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPES),
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 1,
    },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    usedBy: [couponUsedBySchema],
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    minItems: { type: Number, default: 0, min: 0 },
    isFirstOrderOnly: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ expiresAt: 1 });

couponSchema.methods.isValid = function (): boolean {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startsAt || now > this.expiresAt) return false;
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return false;
  return true;
};

const Coupon = mongoose.model<ICouponDocument>('Coupon', couponSchema);

export default Coupon;
