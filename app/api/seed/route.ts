import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import User from "@/models/User"
import { NextResponse } from "next/server"

const demoProducts = [
  {
    title: "Introduction to Algorithms - CLRS",
    description: "Classic computer science textbook in excellent condition. Perfect for CS students studying algorithms and data structures. Barely used, no highlights or notes.",
    category: "Books & Notes",
    type: "both",
    condition: "like-new",
    price: 1200,
    rentalPrice: 50,
    rentalDuration: 30,
    stock: 2,
    images: ["/placeholder.svg"],
    rating: 4.8,
    totalReviews: 12,
    isApproved: true,
  },
  {
    title: "Casio FX-991EX Scientific Calculator",
    description: "Advanced scientific calculator with 552 functions. Perfect for engineering students. Works perfectly, comes with original box and manual.",
    category: "Calculators",
    type: "both",
    condition: "good",
    price: 850,
    rentalPrice: 30,
    rentalDuration: 14,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.5,
    totalReviews: 8,
    isApproved: true,
  },
  {
    title: "Organic Chemistry Notes - Complete Set",
    description: "Comprehensive handwritten notes covering all organic chemistry topics. Well-organized with diagrams and reaction mechanisms. Perfect for exam preparation.",
    category: "Books & Notes",
    type: "rent",
    condition: "good",
    rentalPrice: 40,
    rentalDuration: 21,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.7,
    totalReviews: 5,
    isApproved: true,
  },
  {
    title: "Laptop Stand - Adjustable Aluminum",
    description: "Ergonomic laptop stand for better posture. Adjustable height, lightweight and portable. Great for dorm rooms and study spaces.",
    category: "Accessories",
    type: "sell",
    condition: "like-new",
    price: 450,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.6,
    totalReviews: 3,
    isApproved: true,
  },
  {
    title: "Mechanical Engineering Drawing Set",
    description: "Complete drawing set with compass, protractor, rulers, and templates. Barely used, all pieces included. Essential for ME students.",
    category: "Stationery",
    type: "both",
    condition: "good",
    price: 350,
    rentalPrice: 25,
    rentalDuration: 7,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.4,
    totalReviews: 6,
    isApproved: true,
  },
  {
    title: "Physics Lab Manual - 2nd Year",
    description: "Complete lab manual with all experiments documented. Includes solutions and reference materials. Very helpful for lab exams.",
    category: "Books & Notes",
    type: "rent",
    condition: "fair",
    rentalPrice: 35,
    rentalDuration: 14,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.2,
    totalReviews: 4,
    isApproved: true,
  },
  {
    title: "Wireless Mouse - Logitech M705",
    description: "Ergonomic wireless mouse with long battery life. Perfect for presentations and daily use. Works flawlessly.",
    category: "Tech Gadgets",
    type: "sell",
    condition: "good",
    price: 1200,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.9,
    totalReviews: 15,
    isApproved: true,
  },
  {
    title: "Backpack - College Edition",
    description: "Spacious backpack with laptop compartment and multiple pockets. Water-resistant material. Great condition, perfect for carrying books and laptop.",
    category: "Essentials",
    type: "sell",
    condition: "like-new",
    price: 800,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.5,
    totalReviews: 7,
    isApproved: true,
  },
  {
    title: "Calculus Textbook - Stewart 8th Edition",
    description: "University-level calculus textbook. Comprehensive coverage of single and multivariable calculus. Some highlighting but all pages intact.",
    category: "Books & Notes",
    type: "both",
    condition: "good",
    price: 1500,
    rentalPrice: 60,
    rentalDuration: 30,
    stock: 1,
    images: ["/placeholder.svg"],
    rating: 4.7,
    totalReviews: 10,
    isApproved: true,
  },
  {
    title: "USB-C Hub with HDMI",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery. Perfect for connecting multiple devices to laptop.",
    category: "Tech Gadgets",
    type: "sell",
    condition: "new",
    price: 950,
    stock: 2,
    images: ["/placeholder.svg"],
    rating: 4.8,
    totalReviews: 9,
    isApproved: true,
  },
]

export async function GET() {
  try {
    await connectDB()

    // Check if demo products already exist
    const existingCount = await Product.countDocuments({ isApproved: true })
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Found ${existingCount} existing products. Products already seeded.`,
        count: existingCount,
      })
    }

    // Get or create a demo user
    let demoUser = await User.findOne({ email: "demo@college.edu" })
    if (!demoUser) {
      demoUser = new User({
        email: "demo@college.edu",
        password: "demo123", // Will be hashed by pre-save hook
        firstName: "Demo",
        lastName: "Seller",
        registerNumber: "DEMO001",
        department: "Computer Science",
        collegeName: "Demo College",
        isVerified: true,
        isVerifiedSeller: true,
        walletBalance: 5000,
        rating: 4.5,
        totalReviews: 20,
      })
      await demoUser.save()
    }

    // Create demo products
    const products = demoProducts.map((product) => ({
      ...product,
      sellerId: demoUser._id,
      sellerName: `${demoUser.firstName} ${demoUser.lastName}`,
    }))

    await Product.insertMany(products)

    return NextResponse.json({
      message: `Successfully seeded ${products.length} demo products!`,
      count: products.length,
      demoUser: {
        email: demoUser.email,
        id: demoUser._id,
      },
    })
  } catch (error: any) {
    console.error("Error seeding products:", error)
    return NextResponse.json(
      { message: "Error seeding products", error: error.message },
      { status: 500 },
    )
  }
}
