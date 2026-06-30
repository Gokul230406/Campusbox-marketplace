import mongoose, { Schema, type Document } from "mongoose"

export interface IReview extends Document {
  productId: string
  sellerId: string
  buyerId: string
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

reviewSchema.index({ productId: 1 })
reviewSchema.index({ sellerId: 1 })
reviewSchema.index({ buyerId: 1 })

export default mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema)
