import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Project from "@/models/Project"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 12
    const sort = searchParams.get("sort") || "-createdAt"

    const query: any = { isApproved: true }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

    const skip = (page - 1) * limit

    const projects = await Project.find(query).sort(sort).skip(skip).limit(limit).lean()

    const total = await Project.countDocuments(query)

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("[PROJECTS GET ERROR]", error)
    return NextResponse.json({ message: error.message || "Failed to fetch projects" }, { status: 500 })
  }
}
