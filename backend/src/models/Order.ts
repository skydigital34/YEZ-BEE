import mongoose, { Document, Schema } from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants';
import { generateOrderNumber } from '../utils/helpers';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: { sku: string; color: string; size: string };
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IPaymentInfo {
  method: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface IShippingMethod {
  name: string;
  price: number;
  estimatedDays: string;
}

export interface ICouponInfo {
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  paymentInfo: IPaymentInfo;
  shippingMethod: IShippingMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  roundOff: number;
  coupon?: ICouponInfo;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancellationReason?: string;
  returnReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: {
      sku: { type: String, required: true },
      color: { type: String, required: true },
      size: { type: String, required: true },
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const paymentInfoSchema = new Schema<IPaymentInfo>(
  {
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { _id: false }
);

const shippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    estimatedDays: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: { type: orderAddressSchema, required: true },
    billingAddress: { type: orderAddressSchema, required: true },
    paymentInfo: paymentInfoSchema,
    shippingMethod: shippingMethodSchema,
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    roundOff: { type: Number, default: 0 },
    coupon: {
      code: { type: String },
      discountAmount: { type: Number },
      discountType: { type: String, enum: ['percentage', 'fixed'] },
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    notes: { type: String, maxlength: 1000 },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    cancellationReason: { type: String },
    returnReason: { type: String },
    refundAmount: { type: Number, min: 0 },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.razorpayOrderId': 1 });

orderSchema.pre<IOrderDocument>('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

orderSchema.pre<IOrderDocument>('save', function (next) {
  if (this.isModified('status') && this.status === ORDER_STATUS.DELIVERED) {
    this.deliveredAt = new Date();
  }
  next();
});

const Order = mongoose.model<IOrderDocument>('Order', orderSchema);

export default Order;
