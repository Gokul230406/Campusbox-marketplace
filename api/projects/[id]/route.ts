import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Project from "@/models/Project"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const project = await Project.findById(params.id).populate(
      "sellerId",
      "firstName lastName profileImage rating totalReviews isVerifiedSeller",
    )

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error: any) {
    console.error("[PROJECT GET ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to fetch project" }, { status: 500 })
  }
}
