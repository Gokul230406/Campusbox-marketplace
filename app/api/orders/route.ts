import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

// Get orders for the current user (as buyer)
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

    const orders = await Order.find({ buyerId: decoded.userId })
      .populate("productId", "title images price rentalPrice")
      .populate({
        path: "sellerId",
        select: "firstName lastName email phoneNumber altPhoneNumber registerNumber department year section collegeName",
      })
      .sort({ createdAt: -1 })

    // Only include seller contact details if order is completed
    const ordersWithDetails = orders.map((order: any) => {
      const orderObj = order.toObject()
      // Check if order is completed and sellerId is populated
      if (orderObj.status === "completed" && orderObj.sellerId && typeof orderObj.sellerId === 'object') {
        // Include full seller details for completed orders
        orderObj.sellerDetails = {
          fullName: `${orderObj.sellerId.firstName || ''} ${orderObj.sellerId.lastName || ''}`.trim(),
          email: orderObj.sellerId.email || '',
          phoneNumber: orderObj.sellerId.phoneNumber || '',
          altPhoneNumber: orderObj.sellerId.altPhoneNumber || '',
          registerNumber: orderObj.sellerId.registerNumber || '',
          department: orderObj.sellerId.department || '',
          year: orderObj.sellerId.year || '',
          section: orderObj.sellerId.section || '',
          collegeName: orderObj.sellerId.collegeName || '',
        }
      } else {
        // Hide contact details for pending orders
        orderObj.sellerDetails = null
      }
      return orderObj
    })

    return NextResponse.json({ orders: ordersWithDetails })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
