import { connectDB } from "@/lib/mongodb"
import Review from "@/models/Review"
import Product from "@/models/Product"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 })
    }

    const reviews = await Review.find({ productId })
      .populate("buyerId", "firstName lastName profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Get reviews error:", error)
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
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { productId, rating, comment } = await request.json()

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 })
    }

    // Check if product exists and is a rental product
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Only allow reviews for rental products (rent or both type)
    if (product.type !== "rent" && product.type !== "both") {
      return NextResponse.json(
        { message: "Reviews are only allowed for rental products" },
        { status: 400 }
      )
    }

    const review = new Review({
      productId,
      sellerId: product.sellerId,
      buyerId: decoded.userId,
      rating,
      comment,
    })

    await review.save()

    // Update product rating
    const allReviews = await Review.find({ productId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    product.rating = Math.round(avgRating * 10) / 10
    product.totalReviews = allReviews.length
    await product.save()

    return NextResponse.json(
      {
        message: "Review added successfully",
        review,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
