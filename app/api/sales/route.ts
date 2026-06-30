import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

// Get sales for the current user (as seller)
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

    const sales = await Order.find({ sellerId: decoded.userId })
      .populate("productId", "title images price rentalPrice")
      .populate({
        path: "buyerId",
        select: "firstName lastName email phoneNumber altPhoneNumber registerNumber department year section collegeName",
      })
      .sort({ createdAt: -1 })

    // Only include buyer contact details if order is completed
    const salesWithDetails = sales.map((sale: any) => {
      const saleObj = sale.toObject()
      // Check if order is completed and buyerId is populated
      if (saleObj.status === "completed" && saleObj.buyerId && typeof saleObj.buyerId === 'object') {
        // Include full buyer details for completed orders
        saleObj.buyerDetails = {
          fullName: `${saleObj.buyerId.firstName || ''} ${saleObj.buyerId.lastName || ''}`.trim(),
          email: saleObj.buyerId.email || '',
          phoneNumber: saleObj.buyerId.phoneNumber || '',
          altPhoneNumber: saleObj.buyerId.altPhoneNumber || '',
          registerNumber: saleObj.buyerId.registerNumber || '',
          department: saleObj.buyerId.department || '',
          year: saleObj.buyerId.year || '',
          section: saleObj.buyerId.section || '',
          collegeName: saleObj.buyerId.collegeName || '',
        }
      } else {
        // Hide contact details for pending orders
        saleObj.buyerDetails = null
      }
      return saleObj
    })

    return NextResponse.json({ sales: salesWithDetails })
  } catch (error) {
    console.error("Get sales error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
