import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Review from "@/models/Review"
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

    const { projectId, rating, comment } = await request.json()

    if (!projectId || !rating) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    const review = new Review({
      projectId,
      sellerId: project.sellerId,
      buyerId: payload.userId,
      rating,
      comment,
      isVerifiedPurchase: true,
    })

    await review.save()

    // Update project rating
    const reviews = await Review.find({ projectId })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    project.rating = avgRating
    project.totalReviews = reviews.length
    await project.save()

    // Update seller rating
    const sellerReviews = await Review.find({ sellerId: project.sellerId })
    const sellerAvgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
    const seller = await User.findById(project.sellerId)
    if (seller) {
      seller.rating = sellerAvgRating
      seller.totalReviews = sellerReviews.length
      await seller.save()
    }

    return NextResponse.json({ message: "Review created successfully", review }, { status: 201 })
  } catch (error: any) {
    console.error("[REVIEW CREATE ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to create review" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get("projectId")
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10

    const skip = (page - 1) * limit

    const reviews = await Review.find({ projectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("buyerId", "firstName lastName profileImage")

    const total = await Review.countDocuments({ projectId })

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error("[REVIEWS GET ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to fetch reviews" }, { status: 500 })
  }
}
