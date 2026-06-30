import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Order from "@/models/Order"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const sellerId = searchParams.get("sellerId")
    const excludeSellerId = searchParams.get("excludeSellerId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 15
    const skip = (page - 1) * limit

    const query: any = {}
    
    // If sellerId is provided, show all products (including unapproved) for that seller
    // Otherwise, only show approved products
    if (sellerId) {
      query.sellerId = sellerId
    } else {
      query.isApproved = true
      if (excludeSellerId) {
        query.sellerId = { $ne: excludeSellerId }
      }
    }

    if (category && category !== "all") {
      // Handle case-insensitive category matching
      // Convert lowercase to title case for matching
      const categoryMap: { [key: string]: string } = {
        "books & notes": "Books & Notes",
        "calculators": "Calculators",
        "accessories": "Accessories",
        "essentials": "Essentials",
        "tech gadgets": "Tech Gadgets",
        "stationery": "Stationery",
      }
      const normalizedCategory = categoryMap[category.toLowerCase()] || category
      query.category = normalizedCategory
    }

    if (type && type !== "all" && ["sell", "rent", "both"].includes(type)) {
      query.type = { $in: [type, "both"] }
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    // Filter out fully purchased products (stock = 0) from browse
    // Only apply this filter when not viewing a specific seller's products
    if (!sellerId) {
      query.stock = { $gt: 0 }
    }

    const products = await Product.find(query)
      .populate("sellerId", "firstName lastName rating isVerifiedSeller")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get active rentals for all products
    const productIds = products.map((p) => p._id)
    const activeRentals = await Order.find({
      productId: { $in: productIds },
      orderType: "rental",
      status: { $in: ["pending", "completed"] },
      rentalEndDate: { $gt: new Date() },
    })

    // Group rentals by productId and find earliest end date for each
    const rentalsByProduct: { [key: string]: { count: number; earliestEnd: Date | null } } = {}
    
    activeRentals.forEach((rental) => {
      const productId = rental.productId.toString()
      if (!rentalsByProduct[productId]) {
        rentalsByProduct[productId] = { count: 0, earliestEnd: null }
      }
      rentalsByProduct[productId].count++
      if (
        !rentalsByProduct[productId].earliestEnd ||
        (rental.rentalEndDate && rental.rentalEndDate < rentalsByProduct[productId].earliestEnd!)
      ) {
        rentalsByProduct[productId].earliestEnd = rental.rentalEndDate || null
      }
    })

    // Add rental availability info to each product
    const productsWithRentalInfo = products.map((product) => {
      const productData = product.toObject()
      const productId = product._id.toString()
      const rentalInfo = rentalsByProduct[productId] || { count: 0, earliestEnd: null }
      
      // Check if rental is available (for rent or both type products)
      if (product.type === "rent" || product.type === "both") {
        const stock = product.stock || 1
        productData.rentalAvailable = rentalInfo.count < stock
        productData.activeRentalCount = rentalInfo.count
        productData.earliestRentalEndDate = 
          rentalInfo.count >= stock ? rentalInfo.earliestEnd : null
      } else {
        productData.rentalAvailable = true
        productData.activeRentalCount = 0
        productData.earliestRentalEndDate = null
      }

      return productData
    })

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products: productsWithRentalInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
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

    const { verifyToken } = await import("@/lib/jwt")
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const User = (await import("@/models/User")).default
    const user = await User.findById(decoded.userId)

    const { title, description, category, type, condition, price, rentalPrice, rentalDuration, images, stock } =
      await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const product = new Product({
      title,
      description,
      category,
      type,
      condition,
      price,
      rentalPrice,
      rentalDuration,
      images,
      stock: stock || 1,
      sellerId: decoded.userId,
      sellerName: `${user.firstName} ${user.lastName}`,
      isApproved: true, // Auto-approve products so they appear immediately
    })

    await product.save()

    return NextResponse.json(
      {
        message: "Product uploaded successfully and is now live!",
        product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
