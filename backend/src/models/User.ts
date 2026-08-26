import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../config/firebase';
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
  product: string; // Product ID
  variantSku: string;
  quantity: number;
  addedAt: Date;
}

export interface IRecentlyViewed {
  product: string; // Product ID
  viewedAt: Date;
}

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'customer' | 'admin' | 'superadmin';
  avatar?: { url: string; publicId: string };
  addresses: IAddress[];
  wishlist: string[];
  cart: ICartItem[];
  compareList: string[];
  recentlyViewed: IRecentlyViewed[];
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: string;
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  private static collectionName = 'users';

  public static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
    if (!hash) return false;
    return bcrypt.compare(candidatePassword, hash);
  }

  public static generateAuthToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id || user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
    );
  }

  public static generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { id: user._id || user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refreshsecret',
      { expiresIn: (JWT_REFRESH_EXPIRES_IN || '30d') as any }
    );
  }

  public static generatePasswordResetToken(): { resetToken: string; hashedToken: string; expires: Date } {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000);
    return { resetToken, hashedToken, expires };
  }

  public static async findByEmail(email: string): Promise<IUser | null> {
    const db = getDb();
    const snapshot = await db.collection(this.collectionName)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { _id: doc.id, id: doc.id, ...doc.data() } as IUser;
  }

  public static async findById(id: string): Promise<IUser | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as IUser;
  }

  public static async findOne(query: Record<string, any>): Promise<IUser | null> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      ref = ref.where(key, '==', value);
    }

    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { _id: doc.id, id: doc.id, ...doc.data() } as IUser;
  }

  public static async create(data: Partial<IUser>): Promise<IUser> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();
    
    let hashedPassword = data.password;
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const newUser: IUser = {
      name: data.name || '',
      email: (data.email || '').toLowerCase(),
      phone: data.phone || '',
      password: hashedPassword,
      role: data.role || USER_ROLES.CUSTOMER,
      avatar: data.avatar,
      addresses: data.addresses || [],
      wishlist: data.wishlist || [],
      cart: data.cart || [],
      compareList: data.compareList || [],
      recentlyViewed: data.recentlyViewed || [],
      loyaltyPoints: data.loyaltyPoints || 0,
      referralCode: data.referralCode || generateReferralCode(),
      referredBy: data.referredBy,
      isVerified: data.isVerified || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newUser);
    return { _id: docRef.id, id: docRef.id, ...newUser };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (!id) return null;
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const payload = {
      ...updateData,
      updatedAt: new Date(),
    };

    await docRef.set(payload, { merge: true });
    return this.findById(id);
  }

  public static async findByIdAndDelete(id: string): Promise<boolean> {
    if (!id) return false;
    const db = getDb();
    await db.collection(this.collectionName).doc(id).delete();
    return true;
  }
}

// Compatibility export
const User = UserModel;
export default User;
