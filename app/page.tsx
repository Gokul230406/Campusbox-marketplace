import { HomePage } from "@/components/home/home-page"
import { getFeaturedProducts, getHomepageStats } from "@/lib/stats"
import "./home.css"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [stats, featuredProducts] = await Promise.all([getHomepageStats(), getFeaturedProducts(6)])

  return (
    <HomePage
      categories={stats.categories}
      totalProducts={stats.totalProducts}
      totalUsers={stats.totalUsers}
      featuredProducts={featuredProducts}
    />
  )
}
