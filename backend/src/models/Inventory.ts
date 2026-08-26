import { getDb } from '../config/firebase';

export interface IInventory {
  _id?: string;
  id?: string;
  product: string; // Product ID
  variantSku: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  location?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InventoryModel {
  private static collectionName = 'inventories';

  public static async findById(id: string): Promise<IInventory | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as IInventory;
  }

  public static async findOne(query: Record<string, any>): Promise<IInventory | null> {
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
    return { _id: doc.id, id: doc.id, ...doc.data() } as IInventory;
  }

  public static async find(query: Record<string, any> = {}): Promise<IInventory[]> {
    const db = getDb();
    let ref: FirebaseFirestore.Query = db.collection(this.collectionName);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        ref = ref.where(key, '==', value);
      }
    }

    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as IInventory));
  }

  public static async create(data: Partial<IInventory>): Promise<IInventory> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const newInventory: IInventory = {
      product: data.product || '',
      variantSku: data.variantSku || '',
      stock: data.stock || 0,
      reservedStock: data.reservedStock || 0,
      lowStockThreshold: data.lowStockThreshold || 5,
      location: data.location || 'Main Warehouse',
      updatedBy: data.updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newInventory);
    return { _id: docRef.id, id: docRef.id, ...newInventory };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<IInventory>): Promise<IInventory | null> {
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
const Inventory = InventoryModel;
export default Inventory;
