import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  title: string
  description: string
  category: string
  sellerId: mongoose.Types.ObjectId
  sellerName: string
  price?: number
  rentalPrice?: number
  rentalDuration?: number
  type: "sell" | "rent" | "both"
  condition: "new" | "like-new" | "good" | "fair"
  images: string[]
  rating: number
  totalReviews: number
  isApproved: boolean
  rejectionReason?: string
  purchaseCount: number
  rentalCount: number
  stock: number
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Books & Notes", "Calculators", "Accessories", "Essentials", "Tech Gadgets", "Stationery", "Other"],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: String,
    price: Number,
    rentalPrice: Number,
    rentalDuration: Number,
    type: {
      type: String,
      enum: ["sell", "rent", "both"],
      default: "sell",
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair"],
      default: "good",
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: String,
    purchaseCount: {
      type: Number,
      default: 0,
    },
    rentalCount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
)

productSchema.index({ category: 1, createdAt: -1 })
productSchema.index({ sellerId: 1 })
productSchema.index({ title: "text", description: "text" })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema)
