import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../utils/helpers';

export interface ISubcategory {
  name: string;
  slug: string;
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

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  subcategories: ISubcategory[];
  filters: IFilterOption[];
  isActive: boolean;
  displayOrder: number;
  seo: ICategorySeo;
}

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
  },
  { _id: false }
);

const filterOptionSchema = new Schema<IFilterOption>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['checkbox', 'range', 'swatch'], required: true },
    options: [{ type: String }],
  },
  { _id: false }
);

const categorySeoSchema = new Schema<ICategorySeo>(
  {
    title: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, maxlength: [500, 'Description cannot exceed 500 characters'] },
    image: { type: String },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    subcategories: [subcategorySchema],
    filters: [filterOptionSchema],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    seo: categorySeoSchema,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ displayOrder: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

categorySchema.pre<ICategoryDocument>('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;
