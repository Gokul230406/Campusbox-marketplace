import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Order from "@/models/Order"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const product = await Product.findById(id).populate(
      "sellerId",
      "firstName lastName rating isVerifiedSeller",
    )

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check for active rentals (rentals that haven't ended yet)
    const activeRentals = await Order.find({
      productId: id,
      orderType: "rental",
      status: { $in: ["pending", "completed"] },
      rentalEndDate: { $gt: new Date() }, // Rental hasn't ended yet
    }).sort({ rentalEndDate: 1 }) // Sort by earliest end date

    // Calculate availability for rentals
    const rentalAvailable = product.type === "rent" || product.type === "both"
      ? activeRentals.length < (product.stock || 1)
      : true

    // Get the earliest rental end date if all items are rented
    const earliestRentalEndDate = activeRentals.length > 0 && activeRentals.length >= (product.stock || 1)
      ? activeRentals[0].rentalEndDate
      : null

    const productData = product.toObject()
    productData.rentalAvailable = rentalAvailable
    productData.activeRentalCount = activeRentals.length
    productData.earliestRentalEndDate = earliestRentalEndDate

    const token = request.cookies.get("token")?.value
    if (token) {
      const { verifyToken } = await import("@/lib/jwt")
      const decoded = verifyToken(token)
      const sellerId = product.sellerId?._id?.toString() || product.sellerId?.toString()

      if (decoded && sellerId === decoded.userId) {
        const orders = await Order.find({ productId: id }).sort({ createdAt: -1 }).limit(20)
        const completed = orders.filter((o) => o.status === "completed")

        productData.isOwner = true
        productData.insights = {
          stock: product.stock,
          isApproved: product.isApproved,
          purchaseCount: product.purchaseCount ?? 0,
          rentalCount: product.rentalCount ?? 0,
          totalReviews: product.totalReviews ?? 0,
          rating: product.rating ?? 0,
          totalOrders: orders.length,
          completedOrders: completed.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          totalRevenue: completed.reduce((sum, o) => sum + (o.amount || 0), 0),
          purchases: completed.filter((o) => o.orderType === "purchase").length,
          rentals: completed.filter((o) => o.orderType === "rental").length,
          activeRentals: activeRentals.length,
          listedAt: product.createdAt,
          recentOrders: orders.slice(0, 5).map((o) => ({
            id: o._id.toString(),
            orderType: o.orderType,
            amount: o.amount,
            status: o.status,
            createdAt: o.createdAt,
          })),
        }
      }
    }

    return NextResponse.json(productData)
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { verifyToken } = await import("@/lib/jwt")
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    if (product.sellerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const updates = await request.json()
    Object.assign(product, updates)
    await product.save()

    return NextResponse.json(product)
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { verifyToken } = await import("@/lib/jwt")
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    if (product.sellerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
