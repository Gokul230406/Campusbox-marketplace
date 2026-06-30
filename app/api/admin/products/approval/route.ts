import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

const ADMIN_IDS = process.env.ADMIN_IDS?.split(",") || []

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !ADMIN_IDS.includes(decoded.userId)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    const products = await Product.find({ isApproved: status === "approved" })
      .populate("sellerId", "firstName lastName email registerNumber")
      .sort({ createdAt: -1 })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get pending products error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !ADMIN_IDS.includes(decoded.userId)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { productId, approved, rejectionReason } = await request.json()

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        isApproved: approved,
        rejectionReason: !approved ? rejectionReason : null,
      },
      { new: true },
    )

    return NextResponse.json({
      message: approved ? "Product approved" : "Product rejected",
      product,
    })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
