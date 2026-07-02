import { connectDB } from "@/lib/mongodb"
import { generateToken } from "@/lib/jwt"
import User from "@/models/User"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action?: string[] }> },
) {
  const { action } = await params
  const op = action?.[0]

  try {
    if (op === "logout") {
      const response = NextResponse.json({ message: "Logged out successfully" })
      response.cookies.set("token", "", { maxAge: 0 })
      return response
    }

    await connectDB()

    if (op === "login") {
      const { email, password } = await request.json()

      if (!email || !password) {
        return NextResponse.json(
          { message: "Email and password required" },
          { status: 400 },
        )
      }

      const user = await User.findOne({ email })
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      })

      const response = NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          bio: user.bio,
          rating: user.rating,
          walletBalance: user.walletBalance,
          isVerifiedSeller: user.isVerifiedSeller,
        },
      })

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      })

      return response
    }

    if (op === "register") {
      const {
        email,
        password,
        firstName,
        lastName,
        registerNumber,
        department,
        collegeName,
        year,
        section,
        phoneNumber,
        altPhoneNumber,
      } = await request.json()

      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !registerNumber ||
        !department ||
        !phoneNumber
      ) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
      }

      if (!email.includes("@")) {
        return NextResponse.json(
          { message: "Please use a valid college email" },
          { status: 400 },
        )
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 })
      }

      const existingReg = await User.findOne({ registerNumber })
      if (existingReg) {
        return NextResponse.json(
          { message: "Register number already used" },
          { status: 409 },
        )
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        registerNumber,
        department,
        collegeName: collegeName || "",
        year,
        section,
        phoneNumber,
        altPhoneNumber,
        isVerified: true,
      })

      await user.save()

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      })

      const response = NextResponse.json(
        {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            rating: user.rating,
            walletBalance: user.walletBalance,
            isVerifiedSeller: user.isVerifiedSeller,
          },
        },
        { status: 201 },
      )

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      })

      return response
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

