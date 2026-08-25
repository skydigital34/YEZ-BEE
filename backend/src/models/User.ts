import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { USER_ROLES, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../utils/constants';
import { generateReferralCode } from '../utils/helpers';

export interface IAddress {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
}

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variantSku: string;
  quantity: number;
  addedAt: Date;
}

export interface IRecentlyViewed {
  product: mongoose.Types.ObjectId;
  viewedAt: Date;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'customer' | 'admin' | 'superadmin';
  avatar?: { url: string; publicId: string };
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  cart: ICartItem[];
  compareList: mongoose.Types.ObjectId[];
  recentlyViewed: IRecentlyViewed[];
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  generatePasswordResetToken(): string;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  },
  { _id: true }
);

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const recentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,15}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
    compareList: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    recentlyViewed: {
      type: [recentlyViewedSchema],
      default: [],
    },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, any>;
        delete obj.password;
        delete obj.refreshToken;
        delete obj.resetPasswordToken;
        delete obj.resetPasswordExpires;
        delete obj.passwordChangedAt;
        delete obj.__v;
        return obj;
      },
    },
  }
);

userSchema.index({ 'addresses.pincode': 1 });

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

userSchema.pre<IUserDocument>('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refreshsecret',
    { expiresIn: (JWT_REFRESH_EXPIRES_IN || '30d') as any }
  );
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 3600000);
  return resetToken;
};

userSchema.statics.findByEmail = function (
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
