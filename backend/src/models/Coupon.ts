import { getDb } from '../config/firebase';
import { DISCOUNT_TYPES } from '../utils/constants';

export interface ICouponUsedBy {
  user: string;
  usedAt: Date;
}

export interface ICoupon {
  _id?: string;
  id?: string;
  code: string;
  description?: string;
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
  applicableCategories: string[];
  applicableProducts: string[];
  minItems: number;
  isFirstOrderOnly: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CouponModel {
  private static collectionName = 'coupons';

  public static isValid(coupon: ICoupon): boolean {
    const now = new Date();
    if (!coupon.isActive) return false;
    if (new Date(coupon.startsAt) > now || new Date(coupon.expiresAt) < now) return false;
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
  }

  public static async findById(id: string): Promise<ICoupon | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as ICoupon;
  }

  public static async findOne(query: Record<string, any>): Promise<ICoupon | null> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }

    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { _id: doc.id, id: doc.id, ...doc.data() } as ICoupon;
  }

  public static async find(query: Record<string, any> = {}): Promise<ICoupon[]> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }

    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as ICoupon));
  }

  public static async create(data: Partial<ICoupon>): Promise<ICoupon> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const newCoupon: ICoupon = {
      code: (data.code || '').toUpperCase().trim(),
      description: data.description || '',
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || 0,
      minOrderValue: data.minOrderValue || 0,
      maxDiscount: data.maxDiscount || 0,
      usageLimit: data.usageLimit || 0,
      usedCount: data.usedCount || 0,
      perUserLimit: data.perUserLimit || 1,
      usedBy: data.usedBy || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      minItems: data.minItems || 0,
      isFirstOrderOnly: data.isFirstOrderOnly || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newCoupon);
    return { _id: docRef.id, id: docRef.id, ...newCoupon };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    if (!id) return null;
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc(id);

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
const Coupon = CouponModel;
export default Coupon;
