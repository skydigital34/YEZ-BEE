import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryDocument extends Document {
  product: mongoose.Types.ObjectId;
  variantSku: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  location?: string;
  updatedBy?: mongoose.Types.ObjectId;
}

const inventorySchema = new Schema<IInventoryDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantSku: {
      type: String,
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    location: {
      type: String,
      default: 'Main Warehouse',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ product: 1, variantSku: 1 }, { unique: true });

const Inventory = mongoose.model<IInventoryDocument>('Inventory', inventorySchema);

export default Inventory;
