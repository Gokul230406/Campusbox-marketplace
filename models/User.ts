import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  registerNumber: string
  department: string
  collegeName: string
  year?: string
  section?: string
  phoneNumber: string
  altPhoneNumber?: string
  profileImage?: string
  bio?: string
  isVerified: boolean
  verificationToken?: string
  verificationExpiresAt?: Date
  rating: number
  totalReviews: number
  isVerifiedSeller: boolean
  walletBalance: number
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    collegeName: {
      type: String,
      required: false,
    },
    year: String,
    section: String,
    phoneNumber: {
      type: String,
      required: true,
    },
    altPhoneNumber: String,
    profileImage: String,
    bio: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpiresAt: Date,
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
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema)
