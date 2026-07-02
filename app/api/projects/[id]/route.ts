import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Project from "@/models/Project"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()

    const { id } = await params
    const project = await Project.findById(id).populate(
      "sellerId",
      "firstName lastName profileImage rating totalReviews isVerifiedSeller",
    )

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("[PROJECT GET ERROR]", error)
    const message = error instanceof Error ? error.message : "Failed to fetch project"
    return NextResponse.json({ message }, { status: 500 })
  }
}

