import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("token")

    return NextResponse.json({ message: "Logout successful" }, { status: 200 })
  } catch (error: any) {
    console.error("[LOGOUT ERROR]", error)
    return NextResponse.json({ message: error.message || "Logout failed" }, { status: 500 })
  }
}
