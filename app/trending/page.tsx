import { TrendingPage } from "@/components/trending/trending-page"
import {
  getFeaturedProducts,
  getHotDealsProducts,
  getTopSalesProducts,
  getTrendingProducts,
} from "@/lib/stats"
import "./trending.css"

export default async function Page() {
  const [topSales, trending, hotDeals, featuredProducts] = await Promise.all([
    getTopSalesProducts(12),
    getTrendingProducts(12),
    getHotDealsProducts(12),
    getFeaturedProducts(12, "rated"),
  ])

  return (
    <TrendingPage
      topSales={topSales}
      trending={trending}
      hotDeals={hotDeals}
      featuredProducts={featuredProducts}
    />
  )
}
