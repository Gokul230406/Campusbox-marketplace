import mongoose, { Schema, type Document } from "mongoose"

export interface IOrder extends Document {
  productId: mongoose.Types.ObjectId
  buyerId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  orderType: "purchase" | "rental"
  amount: number
  rentalEndDate?: Date
  status: "pending" | "completed" | "cancelled" | "refunded"
  paymentMethod: string
  transactionId?: string
  buyerContact?: string
  buyerUPI?: string
  pickupLocation: string
  createdAt?: Date
  updatedAt?: Date
}

const orderSchema = new Schema<IOrder>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderType: {
      type: String,
      enum: ["purchase", "rental"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    rentalEndDate: Date,
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    transactionId: String,
    buyerContact: String,
    buyerUPI: String,
    pickupLocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

orderSchema.index({ buyerId: 1, createdAt: -1 })
orderSchema.index({ sellerId: 1, createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema)
