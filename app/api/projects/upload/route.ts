import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"
import Project from "@/models/Project"
import User from "@/models/User"

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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const type = formData.get("type") as string
    const price = formData.get("price") ? Number(formData.get("price")) : 0
    const rentalPrice = formData.get("rentalPrice") ? Number(formData.get("rentalPrice")) : 0
    const rentalDuration = formData.get("rentalDuration") ? Number(formData.get("rentalDuration")) : 0
    const tags = (formData.get("tags") as string)?.split(",") || []

    if (!title || !description || !category || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // TODO: Upload file(s) to a storage service
    const fileUrl = `/uploads/${Date.now()}-project-file`

    const project = new Project({
      title,
      description,
      category,
      sellerId: payload.userId,
      sellerName: `${user.firstName} ${user.lastName}`,
      price: type !== "rent" ? price : 0,
      rentalPrice: type !== "sell" ? rentalPrice : 0,
      rentalDuration,
      type,
      fileUrl,
      tags,
      isApproved: false,
    })

    await project.save()

    return NextResponse.json(
      {
        message: "Project uploaded successfully. Awaiting admin approval.",
        projectId: project._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[PROJECT UPLOAD ERROR]", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ message }, { status: 500 })
  }
}

