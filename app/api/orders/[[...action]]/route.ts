import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"
import Order from "@/models/Order"
import Product from "@/models/Product"
import User from "@/models/User"
import { type NextRequest, NextResponse } from "next/server"

// Handles:
// - GET /api/orders
// - POST /api/orders/purchase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action?: string[] }> },
) {
  const { action } = await params
  const op = action?.[0]

  if (op) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

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
        select:
          "firstName lastName email phoneNumber altPhoneNumber registerNumber department year section collegeName",
      })
      .sort({ createdAt: -1 })

    const ordersWithDetails = orders.map((order: any) => {
      const orderObj = order.toObject()
      if (
        orderObj.status === "completed" &&
        orderObj.sellerId &&
        typeof orderObj.sellerId === "object"
      ) {
        orderObj.sellerDetails = {
          fullName: `${orderObj.sellerId.firstName || ""} ${orderObj.sellerId.lastName || ""}`.trim(),
          email: orderObj.sellerId.email || "",
          phoneNumber: orderObj.sellerId.phoneNumber || "",
          altPhoneNumber: orderObj.sellerId.altPhoneNumber || "",
          registerNumber: orderObj.sellerId.registerNumber || "",
          department: orderObj.sellerId.department || "",
          year: orderObj.sellerId.year || "",
          section: orderObj.sellerId.section || "",
          collegeName: orderObj.sellerId.collegeName || "",
        }
      } else {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action?: string[] }> },
) {
  const { action } = await params
  const op = action?.[0]

  if (op !== "purchase") {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

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

    const {
      productId,
      orderType,
      rentalDays,
      paymentMethod,
      upiId,
      pickupLocation,
    } = await request.json()

    if (!pickupLocation || !pickupLocation.trim()) {
      return NextResponse.json({ message: "Pickup location is required" }, { status: 400 })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    if (product.sellerId.toString() === decoded.userId) {
      return NextResponse.json(
        { message: "You cannot purchase your own product" },
        { status: 400 },
      )
    }

    const buyer = await User.findById(decoded.userId)
    if (!buyer) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (orderType === "purchase" && product.stock <= 0) {
      return NextResponse.json({ message: "Product is out of stock" }, { status: 400 })
    }

    if (orderType === "rental") {
      const activeRentals = await Order.find({
        productId,
        orderType: "rental",
        status: { $in: ["pending", "completed"] },
        rentalEndDate: { $gt: new Date() },
      })

      const stock = product.stock || 1
      if (activeRentals.length >= stock) {
        return NextResponse.json(
          { message: "Product is currently rented and unavailable" },
          { status: 400 },
        )
      }
    }

    let amount = 0
    let rentalEndDate: Date | null = null

    if (orderType === "purchase") {
      amount = product.price || 0
    } else if (orderType === "rental") {
      amount = (product.rentalPrice || 0) * (rentalDays || 1)
      rentalEndDate = new Date(
        Date.now() + (rentalDays || 1) * 24 * 60 * 60 * 1000,
      )
    }

    const validPaymentMethods = ["wallet", "upi"]
    const selectedPaymentMethod = paymentMethod || "upi"
    if (!validPaymentMethods.includes(selectedPaymentMethod)) {
      return NextResponse.json({ message: "Invalid payment method" }, { status: 400 })
    }

    if (selectedPaymentMethod === "wallet") {
      if (buyer.walletBalance < amount) {
        return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 })
      }
    }

    const orderData: any = {
      productId,
      buyerId: decoded.userId,
      sellerId: product.sellerId,
      orderType,
      amount,
      rentalEndDate,
      paymentMethod: selectedPaymentMethod,
      transactionId: `TXN-${Date.now()}`,
      pickupLocation,
      buyerContact: buyer.email,
    }

    if (selectedPaymentMethod === "wallet" || selectedPaymentMethod === "upi") {
      orderData.status = "completed"
      if (selectedPaymentMethod === "upi" && upiId) {
        orderData.buyerUPI = upiId
      }
    } else {
      orderData.status = "pending"
    }

    const order = new Order(orderData)
    await order.save()

    if (selectedPaymentMethod === "wallet") {
      buyer.walletBalance -= amount
      await buyer.save()

      const seller = await User.findById(product.sellerId)
      if (seller) {
        seller.walletBalance += amount
        await seller.save()
      }
    }

    if (orderType === "purchase") {
      product.purchaseCount += 1
      product.stock -= 1
    } else {
      product.rentalCount += 1
    }
    await product.save()

    return NextResponse.json({ message: "Order created successfully", order }, { status: 201 })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

