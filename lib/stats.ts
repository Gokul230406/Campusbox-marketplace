import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import User from "@/models/User"

export const PRODUCT_CATEGORIES = [
  "Books & Notes",
  "Calculators",
  "Accessories",
  "Essentials",
  "Tech Gadgets",
  "Stationery",
  "Other",
] as const

export type HomepageCategory = {
  name: string
  count: number
}

export type FeaturedProduct = {
  id: string
  title: string
  category: string
  price?: number
  rentalPrice?: number
  type: string
  condition: string
  image?: string
  sellerName: string
  rating: number
  purchaseCount?: number
  rentalCount?: number
  badge?: string
}

const PRODUCT_SELECT =
  "title category price rentalPrice type condition images sellerName rating purchaseCount rentalCount"

function mapProduct(product: {
  _id: { toString(): string }
  title: string
  category: string
  price?: number
  rentalPrice?: number
  type: string
  condition: string
  images?: string[]
  sellerName: string
  rating?: number
  purchaseCount?: number
  rentalCount?: number
}, badge?: string): FeaturedProduct {
  return {
    id: product._id.toString(),
    title: product.title,
    category: product.category,
    price: product.price,
    rentalPrice: product.rentalPrice,
    type: product.type,
    condition: product.condition,
    image: product.images?.[0],
    sellerName: product.sellerName,
    rating: product.rating ?? 0,
    purchaseCount: product.purchaseCount ?? 0,
    rentalCount: product.rentalCount ?? 0,
    badge,
  }
}

async function queryProducts(
  sort: Record<string, 1 | -1>,
  limit = 12,
  badge?: string,
): Promise<FeaturedProduct[]> {
  await connectDB()

  const products = await Product.find({ isApproved: true, stock: { $gt: 0 } })
    .sort(sort)
    .limit(limit)
    .select(PRODUCT_SELECT)
    .lean()

  return products.map((p) => mapProduct(p, badge))
}

export async function getHomepageStats() {
  await connectDB()

  const [categoryCounts, totalProducts, totalUsers] = await Promise.all([
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { isApproved: true, stock: { $gt: 0 } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
    Product.countDocuments({ isApproved: true, stock: { $gt: 0 } }),
    User.countDocuments(),
  ])

  const countByCategory = Object.fromEntries(
    categoryCounts.map(({ _id, count }) => [_id, count]),
  )

  const categories: HomepageCategory[] = PRODUCT_CATEGORIES.map((name) => ({
    name,
    count: countByCategory[name] ?? 0,
  }))

  return { categories, totalProducts, totalUsers }
}

export async function getFeaturedProducts(limit = 6, mode: "fresh" | "rated" = "fresh"): Promise<FeaturedProduct[]> {
  const sort =
    mode === "rated"
      ? { rating: -1, totalReviews: -1, createdAt: -1 as const }
      : { createdAt: -1 as const }
  return queryProducts(sort, limit, mode === "rated" ? "Featured" : undefined)
}

export async function getTopSalesProducts(limit = 12): Promise<FeaturedProduct[]> {
  return queryProducts({ purchaseCount: -1, rentalCount: -1, rating: -1 }, limit, "Top Sale")
}

export async function getTrendingProducts(limit = 12): Promise<FeaturedProduct[]> {
  return queryProducts({ createdAt: -1, purchaseCount: -1, rating: -1 }, limit, "Trending")
}

export async function getHotDealsProducts(limit = 12): Promise<FeaturedProduct[]> {
  await connectDB()

  const products = await Product.find({ isApproved: true, stock: { $gt: 0 } })
    .sort({ rentalPrice: 1, price: 1, createdAt: -1 })
    .limit(limit)
    .select(PRODUCT_SELECT)
    .lean()

  return products.map((p) => {
    const badge =
      p.type === "rent" || p.type === "both"
        ? "Hot Rent"
        : p.price && p.price <= 500
          ? "Hot Deal"
          : "Discount"
    return mapProduct(p, badge)
  })
}
