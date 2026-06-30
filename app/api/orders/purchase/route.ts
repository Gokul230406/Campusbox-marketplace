import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
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

    const { productId, orderType, rentalDays, paymentMethod, upiId, pickupLocation, contactPhone } = await request.json()

    if (!pickupLocation || !pickupLocation.trim()) {
      return NextResponse.json(
        { message: "Pickup location is required" },
        { status: 400 }
      )
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Prevent users from purchasing their own products
    if (product.sellerId.toString() === decoded.userId) {
      return NextResponse.json(
        { message: "You cannot purchase your own product" },
        { status: 400 }
      )
    }

    const buyer = await User.findById(decoded.userId)
    if (!buyer) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check stock availability for purchases
    if (orderType === "purchase" && product.stock <= 0) {
      return NextResponse.json(
        { message: "Product is out of stock" },
        { status: 400 }
      )
    }

    // Check rental availability for rentals
    if (orderType === "rental") {
      const Order = (await import("@/models/Order")).default
      const activeRentals = await Order.find({
        productId: productId,
        orderType: "rental",
        status: { $in: ["pending", "completed"] },
        rentalEndDate: { $gt: new Date() },
      })

      const stock = product.stock || 1
      if (activeRentals.length >= stock) {
        return NextResponse.json(
          { message: "Product is currently rented and unavailable" },
          { status: 400 }
        )
      }
    }

    let amount = 0
    let rentalEndDate = null

    if (orderType === "purchase") {
      amount = product.price || 0
    } else if (orderType === "rental") {
      amount = (product.rentalPrice || 0) * (rentalDays || 1)
      rentalEndDate = new Date(Date.now() + (rentalDays || 1) * 24 * 60 * 60 * 1000)
    }

    // Validate payment method
    const validPaymentMethods = ["wallet", "upi"]
    const selectedPaymentMethod = paymentMethod || "upi"
    
    if (!validPaymentMethods.includes(selectedPaymentMethod)) {
      return NextResponse.json({ message: "Invalid payment method" }, { status: 400 })
    }

    // For wallet payment, check balance
    if (selectedPaymentMethod === "wallet") {
      if (buyer.walletBalance < amount) {
        return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 })
      }
    }

    // Create order with appropriate status
    const orderData: any = {
      productId,
      buyerId: decoded.userId,
      sellerId: product.sellerId,
      orderType,
      amount,
      rentalEndDate,
      paymentMethod: selectedPaymentMethod,
      transactionId: `TXN-${Date.now()}`,
      pickupLocation: pickupLocation,
      // Store additional payment info
      buyerContact: buyer.email,
    }

    // Set status based on payment method
    // Wallet and UPI payments are marked as completed immediately
    if (selectedPaymentMethod === "wallet" || selectedPaymentMethod === "upi") {
      orderData.status = "completed"
      if (selectedPaymentMethod === "upi" && upiId) {
        orderData.buyerUPI = upiId
      }
    } else {
      orderData.status = "pending" // Other payment methods are pending
    }

    const order = new Order(orderData)
    await order.save()

    // Process wallet and UPI payments immediately
    if (selectedPaymentMethod === "wallet") {
      // Update wallet balance
      buyer.walletBalance -= amount
      await buyer.save()

      // Add to seller wallet
      const seller = await User.findById(product.sellerId)
      if (seller) {
        seller.walletBalance += amount
        await seller.save()
      }
    } else if (selectedPaymentMethod === "upi") {
      // For UPI, mark as completed (payment will be processed externally)
      // Seller will receive payment via UPI
    }

    // Update product counts and stock
    if (orderType === "purchase") {
      product.purchaseCount += 1
      product.stock -= 1 // Decrease stock when purchased
    } else {
      product.rentalCount += 1
      // For rentals, we don't decrease stock but check availability separately
    }
    await product.save()

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
