import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    const user = await User.findById(payload.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // TODO: Integrate with payment gateway (Stripe, Razorpay, etc.)
    user.walletBalance += amount
    await user.save()

    return NextResponse.json({ message: "Funds added successfully", balance: user.walletBalance }, { status: 200 })
  } catch (error: any) {
    console.error("[WALLET ADD FUNDS ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to add funds" }, { status: 500 })
  }
}
