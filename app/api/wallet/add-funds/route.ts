import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // In production, integrate with Razorpay here
    // For now, directly add funds (demo mode)
    const currentBalance = user.walletBalance || 0
    user.walletBalance = currentBalance + Number(amount)
    await user.save()

    return NextResponse.json({
      message: "Funds added successfully",
      newBalance: user.walletBalance,
    })
  } catch (error) {
    console.error("Add funds error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
