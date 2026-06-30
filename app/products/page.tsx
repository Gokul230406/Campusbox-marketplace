"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Star } from "lucide-react"
import Link from "next/link"
import { YourItemsSection } from "@/components/browse/your-items-section"
import { PageContainer, PageHeader, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

const CATEGORIES = ["Books & Notes", "Calculators", "Accessories", "Essentials", "Tech Gadgets", "Stationery"]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [type, setType] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const { user } = useAuth()

  const searchParams = useSearchParams()

  useEffect(() => {
    const initialCategory = searchParams.get("category") || "all"
    if (initialCategory) setCategory(initialCategory)
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (category !== "all") params.append("category", category)
        if (type !== "all") params.append("type", type)
        if (search.trim()) params.append("search", search.trim())
        if (user?.id) params.append("excludeSellerId", user.id)
        params.append("page", pagination.page.toString())

        const res = await fetch(`/api/products?${params}`)
        const data = await res.json()
        setProducts(data.products)
        setPagination(data.pagination)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => fetchProducts(), search ? 500 : 0)
    return () => clearTimeout(timeoutId)
  }, [category, type, search, pagination.page, user?.id])

  const marketplaceProducts = useMemo(() => products, [products])

  return (
    <PageShell>
      <PageContainer>
        <ScrollReveal>
          <PageHeader
            eyebrow="Marketplace"
            title="Browse Products"
            subtitle="Find books, calculators, gadgets, and essentials from students on your campus"
          />
        </ScrollReveal>

        {user?.id && <YourItemsSection userId={user.id} className="browse-your-listings" />}

        <ScrollReveal delay={60}>
          <div className="mb-6">
            <p className="app-eyebrow">Campus marketplace</p>
            <h2 className="font-serif text-xl text-[var(--app-ink)]">All Listings</h2>
          </div>
          <div className="app-filters">
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className="app-input"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="app-select-trigger">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="app-select-trigger">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sell">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="both">Buy & Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="app-empty">Loading products...</div>
        ) : marketplaceProducts.length === 0 ? (
          <div className="app-empty">
            {products.length > 0 && user?.id
              ? "No other listings match your filters. Your items are shown above."
              : "No products found"}
          </div>
        ) : (
          <>
            <div className="app-product-grid app-stagger browse-products-grid">
              {marketplaceProducts.map((product) => (
                <article key={product._id} className="app-product-card">
                  <Link href={`/products/${product._id}`}>
                    <div className="app-product-card-image">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[var(--app-muted)]">No image</div>
                      )}
                    </div>
                    <div className="app-product-card-body">
                      <h3 className="app-product-card-title">{product.title}</h3>
                      <div className="app-product-card-meta flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[var(--app-gold)] text-[var(--app-gold)]" />
                        <span>{product.rating}</span>
                        <span>({product.totalReviews})</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(product.type === "sell" || product.type === "both") && (
                          <span className="app-product-card-price">₹{product.price}</span>
                        )}
                        {(product.type === "rent" || product.type === "both") && (
                          <span className="app-product-card-meta flex items-center gap-1">
                            <Clock className="h-3 w-3" />₹{product.rentalPrice}/day
                          </span>
                        )}
                      </div>
                      <p className="app-product-card-meta mt-1 capitalize">{product.condition}</p>
                      {!product.rentalAvailable && product.earliestRentalEndDate && (
                        <p className="mt-1 text-xs text-[#8a6d2f]">Rented — available soon</p>
                      )}
                    </div>
                  </Link>
                  <div className="app-product-card-actions">
                    {(product.type === "sell" || product.type === "both") && product.stock > 0 && (
                      <Link href={`/checkout/${product._id}`} className="app-btn-primary app-btn-primary--block text-center">
                        Buy Now
                      </Link>
                    )}
                    {(product.type === "rent" || product.type === "both") && (
                      <Link
                        href={product.rentalAvailable ? `/checkout/${product._id}` : "#"}
                        onClick={(e) => !product.rentalAvailable && e.preventDefault()}
                        className={`app-btn-outline app-btn-outline--block text-center${!product.rentalAvailable ? " pointer-events-none opacity-50" : ""}`}
                      >
                        {product.rentalAvailable ? "Rent Now" : "Unavailable"}
                      </Link>
                    )}
                    {product.stock <= 0 && <p className="text-center text-xs text-[#b42318]">Out of stock</p>}
                  </div>
                </article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="app-pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`app-pagination-btn${page === pagination.page ? " is-active" : ""}`}
                    onClick={() => setPagination((p) => ({ ...p, page }))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </PageContainer>
    </PageShell>
  )
}
