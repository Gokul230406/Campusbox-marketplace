import mongoose, { Schema, type Document } from "mongoose"

export interface IDispute extends Document {
  orderId: string
  reporterId: string
  defenderId: string
  reason: string
  description: string
  status: "open" | "resolved" | "closed"
  resolution?: string
  adminId?: string
  createdAt: Date
  updatedAt: Date
}

const disputeSchema = new Schema<IDispute>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    defenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["open", "resolved", "closed"],
      default: "open",
    },
    resolution: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", disputeSchema)
