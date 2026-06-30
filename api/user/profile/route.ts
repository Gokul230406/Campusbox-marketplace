import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const user = await User.findById(payload.userId).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error: any) {
    console.error("[PROFILE GET ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { firstName, lastName, bio, profileImage } = await request.json()

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { firstName, lastName, bio, profileImage },
      { new: true },
    ).select("-password")

    return NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 })
  } catch (error: any) {
    console.error("[PROFILE UPDATE ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to update profile" }, { status: 500 })
  }
}
