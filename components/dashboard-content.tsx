"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, ShoppingCart, Star, Trash2, Clock, Package, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ContactInfoGrid } from "@/components/contact-info-grid"
import { PageContainer, PageHeader, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"

interface User {
  id?: string
  _id?: string
  firstName: string
  walletBalance: number
  rating: number
}

export default function DashboardContent({ user }: { user: User | null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [sales, setSales] = useState<any[]>([])
  const [loadingSales, setLoadingSales] = useState(false)

  useEffect(() => {
    const userId = user?.id || user?._id
    if (userId) {
      fetchUserProducts()
      fetchOrders()
      fetchSales()
    }
  }, [user?.id, user?._id])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.replace(`/dashboard?tab=${value}`, { scroll: false })
  }

  const fetchUserProducts = async () => {
    const userId = user?.id || user?._id
    if (!userId) return
    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/products?sellerId=${userId}`)
      const data = await res.json()
      setUserProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch user products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchSales = async () => {
    setLoadingSales(true)
    try {
      const res = await fetch("/api/sales")
      const data = await res.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error("Failed to fetch sales:", error)
    } finally {
      setLoadingSales(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchUserProducts()
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const totalEarned = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0)

  const stats = [
    {
      title: "Wallet Balance",
      value: `₹${user?.walletBalance || 0}`,
      change: "Available for withdrawal",
      icon: DollarSign,
    },
    {
      title: "Rating",
      value: `${user?.rating || 0}/5.0`,
      change: "Based on customer reviews",
      icon: Star,
    },
    {
      title: "Items Listed",
      value: userProducts.length.toString(),
      change: "Active products",
      icon: ShoppingCart,
    },
    {
      title: "Total Earned",
      value: `₹${totalEarned}`,
      change: "From all transactions",
      icon: TrendingUp,
    },
  ]

  return (
    <PageShell>
      <PageContainer>
        <ScrollReveal>
          <PageHeader
            eyebrow="Dashboard"
            title={`Welcome, ${user?.firstName}!`}
            subtitle="Here's your marketplace dashboard"
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
        <div className="app-stat-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="app-stat-card">
                <div className="flex items-center justify-between">
                  <p className="app-stat-card-label">{stat.title}</p>
                  <Icon className="h-4 w-4 text-[var(--app-gold)]" />
                </div>
                <p className="app-stat-card-value">{stat.value}</p>
                <p className="app-stat-card-hint">{stat.change}</p>
              </div>
            )
          })}
        </div>
        </ScrollReveal>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-6">
          <TabsList className="grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">My Items</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="app-tab-panel space-y-6">
            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">Quick Actions</h2>
              </div>
              <div className="app-card-body">
                <div className="app-actions-row">
                  <Link href="/sell" className="app-btn-primary text-center">
                    Sell New Item
                  </Link>
                  <Link href="/products" className="app-btn-outline text-center">
                    Browse Items
                  </Link>
                  <Link href="/wallet" className="app-btn-outline text-center">
                    Add Funds
                  </Link>
                </div>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">Recent Activity</h2>
              </div>
              <div className="app-card-body">
                <p className="text-sm text-[var(--app-muted)]">No recent activity yet</p>
              </div>
            </div>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products" className="app-tab-panel">
            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">My Items for Sale</h2>
                <p className="app-card-desc">Manage your products and listings</p>
              </div>
              <div className="app-card-body">
                {loadingProducts ? (
                  <p className="text-sm text-[var(--app-muted)]">Loading...</p>
                ) : userProducts.length === 0 ? (
                  <>
                    <p className="mb-4 text-sm text-[var(--app-muted)]">No items listed yet</p>
                    <Link href="/sell" className="app-btn-primary inline-flex">
                      List Your First Item
                    </Link>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="app-product-grid dashboard-myitems-grid">
                      {userProducts.map((product) => (
                        <article key={product._id} className="app-product-card">
                          <div className="app-product-card-image">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.title} onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-[var(--app-muted)]">No image</div>
                            )}
                          </div>
                          <div className="app-product-card-body">
                            <h3 className="app-product-card-title">{product.title}</h3>
                            <p className="app-product-card-meta line-clamp-2">{product.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="app-product-card-price text-sm">
                                {product.type === "sell" || product.type === "both"
                                  ? `₹${product.price}`
                                  : product.type === "rent"
                                    ? `₹${product.rentalPrice}/day`
                                    : `₹${product.price} / ₹${product.rentalPrice}/day`}
                              </span>
                              <span className={`app-badge ${product.isApproved ? "app-badge--success" : "app-badge--warning"}`}>
                                {product.isApproved ? "Live" : "Pending"}
                              </span>
                            </div>
                          </div>
                          <div className="app-product-card-actions flex-row">
                            <Link href={`/products/${product._id}`} className="app-btn-outline flex-1 text-center text-sm">
                              View
                            </Link>
                            <button type="button" className="app-btn-danger" onClick={() => handleDeleteProduct(product._id)}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <Link href="/sell" className="app-btn-primary app-btn-primary--block text-center">
                      List New Item
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="app-tab-panel">
            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">Your Orders</h2>
                <p className="app-card-desc">Items you&apos;ve purchased or rented</p>
              </div>
              <div className="app-card-body">
                {loadingOrders ? (
                  <p className="text-sm text-[var(--app-muted)]">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="app-empty">
                    <Package className="mx-auto mb-4 h-12 w-12 text-[var(--app-muted)]" />
                    <p className="mb-4">No orders yet</p>
                    <Link href="/products" className="app-btn-primary inline-flex">Browse Products</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="app-list-item">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--app-gold)_12%,transparent)]">
                            {order.productId?.images?.[0] ? (
                              <img src={order.productId.images[0]} alt={order.productId.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                            ) : (
                              <div className="flex h-full items-center justify-center"><Package className="h-8 w-8 text-[var(--app-muted)]" /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-serif text-lg">{order.productId?.title || "Product"}</h3>
                                <p className="text-sm text-[var(--app-muted)]">Seller: {order.sellerId?.firstName} {order.sellerId?.lastName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">₹{order.amount}</p>
                                <span className={`app-badge ${order.status === "completed" ? "app-badge--success" : order.status === "cancelled" ? "app-badge--danger" : "app-badge--warning"}`}>{order.status}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--app-muted)]">
                              {order.orderType === "rental" ? (
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Rental{order.rentalEndDate && ` · Ends ${format(new Date(order.rentalEndDate), "MMM dd, yyyy")}`}</span>
                              ) : (
                                <span>Purchase</span>
                              )}
                              <span>·</span>
                              <span>{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {order.status === "completed" && order.sellerDetails && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button type="button" className="app-btn-outline text-sm"><User className="mr-2 h-4 w-4 inline" />Seller Info</button>
                                  </DialogTrigger>
                                  <DialogContent className="app-dialog-content max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Seller Contact Information</DialogTitle>
                                      <DialogDescription>Contact details for {order.sellerDetails.fullName}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                      <ContactInfoGrid details={order.sellerDetails} />
                                      {order.pickupLocation && (
                                        <div className="app-contact-pickup">
                                          <p className="app-contact-item-label">Pickup Location</p>
                                          <p className="app-contact-item-value">{order.pickupLocation}</p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Link href={`/products/${order.productId?._id}`} className="app-btn-outline text-sm">View Product</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="app-tab-panel">
            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">Your Sales</h2>
                <p className="app-card-desc">Track your earnings from sold/rented items</p>
              </div>
              <div className="app-card-body">
                {loadingSales ? (
                  <p className="text-sm text-[var(--app-muted)]">Loading sales...</p>
                ) : sales.length === 0 ? (
                  <div className="app-empty">
                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-[var(--app-muted)]" />
                    <p className="mb-4">No sales yet</p>
                    <Link href="/sell" className="app-btn-primary inline-flex">List Your First Item</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="app-wallet-banner mb-4 flex items-center justify-between">
                      <span className="text-sm text-[var(--app-muted)]">Total Earnings</span>
                      <span className="app-wallet-amount text-2xl">₹{totalEarned}</span>
                    </div>
                    {sales.map((sale) => (
                      <div key={sale._id} className="app-list-item">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--app-gold)_12%,transparent)]">
                            {sale.productId?.images?.[0] ? (
                              <img src={sale.productId.images[0]} alt={sale.productId.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                            ) : (
                              <div className="flex h-full items-center justify-center"><Package className="h-8 w-8 text-[var(--app-muted)]" /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-serif text-lg">{sale.productId?.title || "Product"}</h3>
                                <p className="text-sm text-[var(--app-muted)]">Buyer: {sale.buyerId?.firstName} {sale.buyerId?.lastName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-[#16a34a]">+₹{sale.amount}</p>
                                <span className={`app-badge ${sale.status === "completed" ? "app-badge--success" : sale.status === "cancelled" ? "app-badge--danger" : "app-badge--warning"}`}>{sale.status}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--app-muted)]">
                              {sale.orderType === "rental" ? (
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Rental{sale.rentalEndDate && ` · Ends ${format(new Date(sale.rentalEndDate), "MMM dd, yyyy")}`}</span>
                              ) : (
                                <span>Purchase</span>
                              )}
                              <span>·</span>
                              <span>{format(new Date(sale.createdAt), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {sale.status === "completed" && sale.buyerDetails && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button type="button" className="app-btn-outline text-sm"><User className="mr-2 h-4 w-4 inline" />Buyer Info</button>
                                  </DialogTrigger>
                                  <DialogContent className="app-dialog-content max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Buyer Contact Information</DialogTitle>
                                      <DialogDescription>Contact details for {sale.buyerDetails.fullName}</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-2">
                                      <ContactInfoGrid details={sale.buyerDetails} />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Link href={`/products/${sale.productId?._id}`} className="app-btn-outline text-sm">View Product</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </PageShell>
  )
}
