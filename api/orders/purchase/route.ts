import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Project from "@/models/Project"
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

    const { projectId, orderType } = await request.json()

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    const buyer = await User.findById(payload.userId)
    if (!buyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 })
    }

    const amount = orderType === "purchase" ? project.price : project.rentalPrice

    // Check wallet balance
    if (buyer.walletBalance < amount) {
      return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 })
    }

    // Create order
    const order = new Order({
      projectId,
      buyerId: payload.userId,
      sellerId: project.sellerId,
      orderType,
      amount,
      rentalEndDate:
        orderType === "rental" ? new Date(Date.now() + project.rentalDuration * 24 * 60 * 60 * 1000) : null,
      status: "completed",
      paymentMethod: "wallet",
    })

    await order.save()

    // Deduct from buyer wallet
    buyer.walletBalance -= amount
    await buyer.save()

    // Add to seller wallet
    const seller = await User.findById(project.sellerId)
    if (seller) {
      seller.walletBalance += amount
      await seller.save()
    }

    // Update project counts
    if (orderType === "purchase") {
      project.purchaseCount += 1
    } else {
      project.rentalCount += 1
    }
    await project.save()

    return NextResponse.json({ message: "Order created successfully", order }, { status: 201 })
  } catch (error: any) {
    console.error("[ORDER CREATE ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 500 })
  }
}
