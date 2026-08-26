import { getDb } from '../config/firebase';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants';
import { generateOrderNumber } from '../utils/helpers';

export interface IOrderItem {
  product: string; // Product ID
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

export interface IOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  user: string; // User ID
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrderModel {
  private static collectionName = 'orders';

  public static async findById(id: string): Promise<IOrder | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as IOrder;
  }

  public static async findOne(query: Record<string, any>): Promise<IOrder | null> {
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
    return { _id: doc.id, id: doc.id, ...doc.data() } as IOrder;
  }

  public static async find(query: Record<string, any> = {}, options: { skip?: number; limit?: number } = {}): Promise<IOrder[]> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }

    if (options.skip) ref = ref.offset(options.skip);
    if (options.limit) ref = ref.limit(options.limit);

    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as IOrder));
  }

  public static async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const items = await this.find(query);
    return items.length;
  }

  public static async create(data: Partial<IOrder>): Promise<IOrder> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const newOrder: IOrder = {
      orderNumber: data.orderNumber || generateOrderNumber(),
      user: data.user || '',
      items: data.items || [],
      shippingAddress: data.shippingAddress!,
      billingAddress: data.billingAddress!,
      paymentInfo: data.paymentInfo || { method: 'cod', status: 'pending' },
      shippingMethod: data.shippingMethod || { name: 'Standard Delivery', price: 0, estimatedDays: '3-5 business days' },
      subtotal: data.subtotal || 0,
      shipping: data.shipping || 0,
      discount: data.discount || 0,
      tax: data.tax || 0,
      total: data.total || 0,
      roundOff: data.roundOff || 0,
      coupon: data.coupon,
      status: data.status || ORDER_STATUS.PENDING,
      trackingNumber: data.trackingNumber || '',
      trackingUrl: data.trackingUrl || '',
      notes: data.notes || '',
      estimatedDelivery: data.estimatedDelivery,
      deliveredAt: data.deliveredAt,
      cancellationReason: data.cancellationReason || '',
      returnReason: data.returnReason || '',
      refundAmount: data.refundAmount || 0,
      refundedAt: data.refundedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newOrder);
    return { _id: docRef.id, id: docRef.id, ...newOrder };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
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
const Order = OrderModel;
export default Order;
