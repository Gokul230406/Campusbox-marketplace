"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  AlertCircle,
  BarChart3,
  Clock,
  LayoutDashboard,
  Package,
  Star,
  TrendingUp,
  Trash2,
} from "lucide-react"
import { PageContainer, PageLoading, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

type ProductInsights = {
  stock: number
  isApproved: boolean
  purchaseCount: number
  rentalCount: number
  totalReviews: number
  rating: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
  purchases: number
  rentals: number
  activeRentals: number
  listedAt: string
  recentOrders: {
    id: string
    orderType: string
    amount: number
    status: string
    createdAt: string
  }[]
}

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [error, setError] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const isOwner = Boolean(product?.isOwner)

  useEffect(() => {
    if (!productId) return

    const fetchData = async () => {
      try {
        const [productRes, reviewRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/reviews?productId=${productId}`),
        ])
        const productData = await productRes.json()
        const reviewData = await reviewRes.json()

        if (!productRes.ok) {
          setError(productData.message || "Product not found")
          setProduct(null)
        } else {
          setProduct(productData)
        }
        setReviews(Array.isArray(reviewData) ? reviewData : [])
      } catch {
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  useEffect(() => {
    if (!product?.earliestRentalEndDate) {
      setTimeRemaining("")
      return
    }

    const updateTimer = () => {
      const difference = new Date(product.earliestRentalEndDate).getTime() - Date.now()
      if (difference <= 0) {
        setTimeRemaining("")
        fetch(`/api/products/${productId}`)
          .then((res) => res.json())
          .then((data) => setProduct(data))
        return
      }

      const days = Math.floor(difference / 86400000)
      const hours = Math.floor((difference % 86400000) / 3600000)
      const minutes = Math.floor((difference % 3600000) / 60000)
      setTimeRemaining(days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [product?.earliestRentalEndDate, productId])

  const handleReview = async () => {
    if (!user || !reviewComment.trim() || isOwner) return

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: reviewRating, comment: reviewComment }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to add review")
      }
      setReviewComment("")
      setReviewRating(5)
      const [productRes, reviewRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/reviews?productId=${productId}`),
      ])
      setProduct(await productRes.json())
      setReviews(await reviewRes.json())
    } catch (err: any) {
      setError(err.message || "Failed to add review")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this listing permanently?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete")
      }
      router.push("/dashboard?tab=products")
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />

  if (!product) {
    return (
      <PageShell center>
        <PageContainer size="narrow">
          <div className="app-card app-enter">
            <div className="app-card-body text-center">
              <p className="text-[#b42318]">{error || "Product not found"}</p>
              <Link href="/products" className="app-btn-outline mt-4 inline-flex">
                Back to Browse
              </Link>
            </div>
          </div>
        </PageContainer>
      </PageShell>
    )
  }

  const images: string[] = product.images?.length ? product.images : []
  const insights: ProductInsights | undefined = product.insights

  return (
    <PageShell>
      <PageContainer size="wide">
        <ScrollReveal>
          <Link href="/products" className="app-link mb-6 inline-flex text-sm">
            ← Back to Browse
          </Link>
        </ScrollReveal>

        <div className="app-product-hero">
          <ScrollReveal className="app-enter">
            <div>
              <div className="app-product-gallery-main">
                {images[activeImage] ? (
                  <img src={images[activeImage]} alt={product.title} />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--app-muted)]">No image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="app-product-thumbs">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`app-product-thumb${activeImage === idx ? " is-active" : ""}`}
                      onClick={() => setActiveImage(idx)}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          <div>
            <ScrollReveal delay={80}>
              <p className="app-eyebrow">{product.category}</p>
              <h1 className="app-title">{product.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-[var(--app-gold)] text-[var(--app-gold)]" />
                  <strong>{product.rating}</strong>
                  <span className="text-[var(--app-muted)]">({product.totalReviews} reviews)</span>
                </span>
                <span className="app-badge app-badge--warning capitalize">{product.condition}</span>
                {isOwner && (
                  <span className={`app-badge ${product.isApproved ? "app-badge--success" : "app-badge--warning"}`}>
                    {product.isApproved ? "Live" : "Pending approval"}
                  </span>
                )}
              </div>
              <p className="app-subtitle mt-4">{product.description}</p>
            </ScrollReveal>

            {error && (
              <div className="app-alert-error mt-6 app-enter">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {isOwner && insights ? (
              <ScrollReveal delay={120} className="mt-6">
                <div className="app-card">
                  <div className="app-card-header">
                    <h2 className="app-card-title flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[var(--app-gold)]" />
                      Listing Insights
                    </h2>
                    <p className="app-card-desc">Performance overview for your item</p>
                  </div>
                  <div className="app-card-body space-y-6">
                    <div className="app-insight-grid">
                      <div className="app-insight-tile">
                        <p className="app-insight-label">Revenue</p>
                        <p className="app-insight-value">₹{insights.totalRevenue}</p>
                      </div>
                      <div className="app-insight-tile">
                        <p className="app-insight-label">Orders</p>
                        <p className="app-insight-value">{insights.totalOrders}</p>
                      </div>
                      <div className="app-insight-tile">
                        <p className="app-insight-label">In Stock</p>
                        <p className="app-insight-value">{insights.stock}</p>
                      </div>
                      <div className="app-insight-tile">
                        <p className="app-insight-label">Purchases</p>
                        <p className="app-insight-value">{insights.purchases}</p>
                      </div>
                      <div className="app-insight-tile">
                        <p className="app-insight-label">Rentals</p>
                        <p className="app-insight-value">{insights.rentals}</p>
                      </div>
                      <div className="app-insight-tile">
                        <p className="app-insight-label">Active Rentals</p>
                        <p className="app-insight-value">{insights.activeRentals}</p>
                      </div>
                    </div>

                    <div className="app-divider-row">
                      <span className="text-sm text-[var(--app-muted)]">Listed on</span>
                      <span className="text-sm font-medium">{format(new Date(insights.listedAt), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="app-divider-row">
                      <span className="text-sm text-[var(--app-muted)]">Pending orders</span>
                      <span className="text-sm font-medium">{insights.pendingOrders}</span>
                    </div>

                    {insights.recentOrders.length > 0 && (
                      <div>
                        <p className="app-insight-label mb-3">Recent activity</p>
                        <div className="space-y-2">
                          {insights.recentOrders.map((order) => (
                            <div key={order.id} className="app-list-item flex items-center justify-between gap-3 py-3">
                              <div>
                                <p className="text-sm font-medium capitalize">{order.orderType}</p>
                                <p className="text-xs text-[var(--app-muted)]">
                                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{order.amount}</p>
                                <span className={`app-badge ${order.status === "completed" ? "app-badge--success" : "app-badge--warning"}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="app-actions-row">
                      <Link href="/dashboard?tab=products" className="app-btn-primary text-center">
                        <LayoutDashboard className="h-4 w-4" />
                        Manage in Dashboard
                      </Link>
                      <Link href="/dashboard?tab=sales" className="app-btn-outline text-center">
                        <TrendingUp className="h-4 w-4" />
                        View Sales
                      </Link>
                      <button type="button" className="app-btn-danger" onClick={handleDelete} disabled={deleting}>
                        <Trash2 className="h-4 w-4" />
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ) : (
              <ScrollReveal delay={120} className="mt-6">
                <div className="app-product-buy-panel space-y-4">
                  <div className="app-card app-product-price-card">
                    <div className="app-card-body">
                      <div className="app-product-price-grid">
                        {(product.type === "sell" || product.type === "both") && product.price != null && (
                          <div className="app-product-price-block">
                            <p className="app-product-price-label">Purchase Price</p>
                            <p className="app-product-price-value">₹{product.price}</p>
                          </div>
                        )}
                        {(product.type === "rent" || product.type === "both") && product.rentalPrice != null && (
                          <div className="app-product-price-block">
                            <p className="app-product-price-label">Rental Price</p>
                            <p className="app-product-price-value">₹{product.rentalPrice}<span className="app-product-price-unit">/day</span></p>
                          </div>
                        )}
                      </div>
                      <div className="app-product-meta-row">
                        <span className="app-badge app-badge--warning capitalize">{product.condition}</span>
                        <span className="text-sm text-[var(--app-muted)]">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                      </div>
                    </div>
                  </div>

                  {!product.rentalAvailable && product.earliestRentalEndDate && (
                    <div className="app-product-rental-notice">
                      <Clock className="h-4 w-4 shrink-0 text-[var(--app-gold)]" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--app-ink)]">Currently rented</p>
                        <p className="text-xs text-[var(--app-muted)]">Available again in {timeRemaining || "..."}</p>
                      </div>
                    </div>
                  )}

                  <div className="app-product-cta-stack">
                    {!user && (
                      <Link href="/login" className="app-btn-primary app-btn-primary--block text-center">
                        Login to place order
                      </Link>
                    )}
                    {user && (product.type === "sell" || product.type === "both") && product.price != null && (
                      <Link
                        href={`/checkout/${productId}`}
                        className={`app-btn-primary app-btn-primary--block text-center${product.stock <= 0 ? " pointer-events-none opacity-50" : ""}`}
                      >
                        Buy Now — ₹{product.price}
                      </Link>
                    )}
                    {user && (product.type === "rent" || product.type === "both") && product.rentalPrice != null && (
                      <Link
                        href={product.rentalAvailable ? `/checkout/${productId}` : "#"}
                        className={`app-btn-outline app-btn-outline--block text-center${!product.rentalAvailable || product.stock <= 0 ? " pointer-events-none opacity-50" : ""}`}
                      >
                        <Clock className="inline h-4 w-4" />
                        {product.rentalAvailable ? `Rent — ₹${product.rentalPrice}/day` : "Unavailable for rent"}
                      </Link>
                    )}
                    {product.stock <= 0 && <p className="text-center text-sm text-[#b42318]">Out of stock</p>}
                  </div>

                  <p className="text-center text-xs text-[var(--app-muted)]">
                    Seller contact details are shared in your dashboard after you complete a purchase.
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>

        <ScrollReveal>
          <div className="app-card">
            <div className="app-card-header">
              <h2 className="app-card-title">Reviews ({product.totalReviews})</h2>
            </div>
            <div className="app-card-body space-y-6">
              {user && !isOwner && (product.type === "rent" || product.type === "both") && (
                <div className="border-b border-[color-mix(in_srgb,var(--app-gold)_14%,transparent)] pb-6">
                  <h3 className="mb-3 font-semibold">Write a Review</h3>
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setReviewRating(r)} className="p-1">
                        <Star className={`h-6 w-6 transition ${reviewRating >= r ? "fill-[var(--app-gold)] text-[var(--app-gold)]" : "text-[var(--app-muted)]"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="app-textarea"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                  <button type="button" onClick={handleReview} className="app-btn-primary mt-3" disabled={!reviewComment.trim()}>
                    Submit Review
                  </button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-[var(--app-muted)]">No reviews yet</p>
              ) : (
                <div>
                  {reviews.map((review, idx) => (
                    <div key={review._id} className="app-review-item" style={{ animationDelay: `${idx * 0.08}s` }}>
                      <p className="font-semibold">
                        {review.buyerId?.firstName} {review.buyerId?.lastName}
                      </p>
                      <div className="my-1 flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-[var(--app-gold)] text-[var(--app-gold)]" : "text-[var(--app-muted)]"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-[var(--app-muted)]">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </PageContainer>
    </PageShell>
  )
}
