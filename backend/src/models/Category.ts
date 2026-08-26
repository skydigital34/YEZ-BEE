import { getDb } from '../config/firebase';
import { slugify } from '../utils/helpers';

export interface ISubcategory {
  name: string;
  slug: string;
  productType?: 'FEEDING' | 'NON-FEEDING';
}

export interface IFilterOption {
  key: string;
  label: string;
  type: 'checkbox' | 'range' | 'swatch';
  options: string[];
}

export interface ICategorySeo {
  title: string;
  description: string;
}

export interface ICategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  parent?: string | null;
  hasFeedingSplit: boolean;
  subcategories: ISubcategory[];
  filters: IFilterOption[];
  isActive: boolean;
  displayOrder: number;
  seo?: ICategorySeo;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CategoryModel {
  private static collectionName = 'categories';

  private static getFieldValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    if (path === '_id' || path === 'id') {
      return obj._id || obj.id;
    }
    if (path.includes('.')) {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (Array.isArray(current)) {
          return current.map(item => this.getFieldValue(item, part)).flat();
        }
        current = current[part];
      }
      return current;
    }
    return obj[path];
  }

  private static matchValue(value: any, target: any): boolean {
    if (target instanceof RegExp) {
      return target.test(String(value));
    }
    if (target && typeof target === 'object' && !(target instanceof Date)) {
      if (target.$regex) {
        const flags = target.$options || '';
        const regex = new RegExp(target.$regex, flags);
        return regex.test(String(value));
      }
      let matches = true;
      if (target.$gte !== undefined) matches = matches && (Number(value) >= Number(target.$gte));
      if (target.$lte !== undefined) matches = matches && (Number(value) <= Number(target.$lte));
      if (target.$gt !== undefined) matches = matches && (Number(value) > Number(target.$gt));
      if (target.$lt !== undefined) matches = matches && (Number(value) < Number(target.$lt));
      if (target.$ne !== undefined) matches = matches && (value !== target.$ne);
      if (target.$exists !== undefined) matches = matches && ((value !== undefined && value !== null) === Boolean(target.$exists));
      if (target.$in !== undefined && Array.isArray(target.$in)) {
        const valArr = Array.isArray(value) ? value : [value];
        matches = matches && valArr.some(v =>
          target.$in.some((t: any) => {
            if (t instanceof RegExp) return t.test(String(v));
            return String(v).toLowerCase() === String(t).toLowerCase();
          })
        );
      }
      return matches;
    }
    if (Array.isArray(value)) {
      return value.includes(target);
    }
    return value === target;
  }

  private static matchQuery(category: ICategory, query: Record<string, any>): boolean {
    if (query.$or && Array.isArray(query.$or)) {
      if (!query.$or.some((subQuery: any) => this.matchQuery(category, subQuery))) {
        return false;
      }
    }
    if (query.$and && Array.isArray(query.$and)) {
      if (!query.$and.every((subQuery: any) => this.matchQuery(category, subQuery))) {
        return false;
      }
    }

    for (const [key, target] of Object.entries(query)) {
      if (key === '$or' || key === '$and') continue;
      const value = this.getFieldValue(category, key);
      if (Array.isArray(value)) {
        const matches = value.some(v => this.matchValue(v, target));
        if (!matches) return false;
      } else {
        if (!this.matchValue(value, target)) return false;
      }
    }
    return true;
  }

  public static async findById(id: string): Promise<ICategory | null> {
    if (!id) return null;
    const db = getDb();
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() } as ICategory;
  }

  public static async findOne(query: Record<string, any>): Promise<ICategory | null> {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  public static async find(query: Record<string, any> = {}): Promise<ICategory[]> {
    const db = getDb();
    const snapshot = await db.collection(this.collectionName).get();
    let categories = snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() } as ICategory));

    if (Object.keys(query).length > 0) {
      categories = categories.filter(category => this.matchQuery(category, query));
    }

    return categories;
  }

  public static async create(data: Partial<ICategory>): Promise<ICategory> {
    const db = getDb();
    const docRef = db.collection(this.collectionName).doc();

    const name = data.name || '';
    const slug = data.slug || slugify(name);

    const newCategory: ICategory = {
      name,
      slug,
      description: data.description || '',
      image: data.image || '',
      banner: data.banner || '',
      parent: data.parent || null,
      hasFeedingSplit: data.hasFeedingSplit || false,
      subcategories: data.subcategories || [],
      filters: data.filters || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder || 0,
      seo: data.seo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newCategory);
    return { _id: docRef.id, id: docRef.id, ...newCategory };
  }

  public static async findByIdAndUpdate(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
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
const Category = CategoryModel;
export default Category;
