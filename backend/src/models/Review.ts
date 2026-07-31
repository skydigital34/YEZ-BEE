import mongoose, { Document, Schema } from 'mongoose';
import { RATING_VALUES } from '../utils/constants';

export interface IReviewImage {
  url: string;
  alt: string;
}

export interface IReviewResponse {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IReviewDocument extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  images: IReviewImage[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportedCount: number;
  responses: IReviewResponse[];
}

const reviewImageSchema = new Schema<IReviewImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const reviewResponseSchema = new Schema<IReviewResponse>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const reviewSchema = new Schema<IReviewDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: RATING_VALUES.MIN,
      max: RATING_VALUES.MAX,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      maxlength: [5000, 'Review body cannot exceed 5000 characters'],
    },
    images: [reviewImageSchema],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true, index: true },
    helpfulCount: { type: Number, default: 0, min: 0 },
    reportedCount: { type: Number, default: 0, min: 0 },
    responses: [reviewResponseSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);

export default Review;
