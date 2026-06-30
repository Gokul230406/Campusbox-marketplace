import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { generateToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, firstName, lastName, registerNumber, department, collegeName } = await request.json()

    if (!email || !password || !firstName || !lastName || !registerNumber || !department || !collegeName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { registerNumber }],
    })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      registerNumber,
      department,
      collegeName,
      isVerified: false,
    })

    await user.save()

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    })

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
        token,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error)
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 500 })
  }
}
