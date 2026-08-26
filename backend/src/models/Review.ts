import { getDb } from '../config/firebase';
import { RATING_VALUES } from '../utils/constants';

export interface IReviewImage {
  url: string;
  alt: string;
}

export interface IReviewResponse {
  user: string;
  text: string;
  createdAt: Date;
}

export interface IReview {
  _id?: string;
  id?: string;
  product: string; // Product ID
  user: string; // User ID
  order?: string;
  rating: number;
  title?: string;
  body: string;
  images: IReviewImage[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportedCount: number;
  responses: IReviewResponse[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ReviewModel {
  private static collectionName = 'reviews';

  public static async findById(id: string): Promise<IReview | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as IReview;
  }

  public static async findOne(query: Record<string, any>): Promise<IReview | null> {
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
    return { _id: doc.id, id: doc.id, ...doc.data() } as IReview;
  }

  public static async find(query: Record<string, any> = {}): Promise<IReview[]> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }

    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as IReview));
  }

  public static async create(data: Partial<IReview>): Promise<IReview> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const newReview: IReview = {
      product: data.product || '',
      user: data.user || '',
      order: data.order,
      rating: data.rating || RATING_VALUES.MAX,
      title: data.title || '',
      body: data.body || '',
      images: data.images || [],
      isVerifiedPurchase: data.isVerifiedPurchase || false,
      isApproved: data.isApproved !== undefined ? data.isApproved : true,
      helpfulCount: data.helpfulCount || 0,
      reportedCount: data.reportedCount || 0,
      responses: data.responses || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newReview);
    return { _id: docRef.id, id: docRef.id, ...newReview };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<IReview>): Promise<IReview | null> {
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

  public static async deleteMany(filter: Record<string, any>): Promise<boolean> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }
    const snapshot = await ref.get();
    if (snapshot.empty) return true;
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return true;
  }
}

// Compatibility export
const Review = ReviewModel;
export default Review;
