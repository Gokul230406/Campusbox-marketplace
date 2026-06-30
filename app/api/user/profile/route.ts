import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      registerNumber: user.registerNumber,
      department: user.department,
      collegeName: user.collegeName,
      phoneNumber: user.phoneNumber,
      altPhoneNumber: user.altPhoneNumber,
      profileImage: user.profileImage,
      bio: user.bio,
      rating: user.rating,
      totalReviews: user.totalReviews,
      walletBalance: user.walletBalance,
      isVerifiedSeller: user.isVerifiedSeller,
      isVerified: user.isVerified,
    })
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { firstName, lastName, bio, profileImage } = await request.json()

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { firstName, lastName, bio, profileImage },
      { new: true },
    )

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        registerNumber: user.registerNumber,
        department: user.department,
        collegeName: user.collegeName,
        phoneNumber: user.phoneNumber,
        altPhoneNumber: user.altPhoneNumber,
        profileImage: user.profileImage,
        bio: user.bio,
        rating: user.rating,
        totalReviews: user.totalReviews,
        walletBalance: user.walletBalance,
        isVerifiedSeller: user.isVerifiedSeller,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
