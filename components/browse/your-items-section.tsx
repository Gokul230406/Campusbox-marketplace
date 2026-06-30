"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BarChart3, Package, Star } from "lucide-react"
import { ScrollReveal } from "@/components/layout/scroll-reveal"

type YourItemsSectionProps = {
  userId: string
  className?: string
}

type Sale = {
  productId?: { _id?: string } | string
  amount?: number
  status?: string
}

function getProductId(sale: Sale) {
  if (!sale.productId) return ""
  if (typeof sale.productId === "string") return sale.productId
  return sale.productId._id?.toString() || ""
}

export function YourItemsSection({ userId, className = "" }: YourItemsSectionProps) {
  const [items, setItems] = useState<any[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [productsRes, salesRes] = await Promise.all([
          fetch(`/api/products?sellerId=${userId}`),
          fetch("/api/sales"),
        ])
        const productsData = await productsRes.json()
        const salesData = await salesRes.json()

        if (cancelled) return
        setItems(productsData.products || [])
        setSales(salesData.sales || [])
      } catch (error) {
        console.error("Failed to load your items:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const revenueByProduct = useMemo(() => {
    const map: Record<string, number> = {}
    sales
      .filter((s) => s.status === "completed")
      .forEach((sale) => {
        const id = getProductId(sale)
        if (id) map[id] = (map[id] || 0) + (sale.amount || 0)
      })
    return map
  }, [sales])

  const orderCountByProduct = useMemo(() => {
    const map: Record<string, number> = {}
    sales.forEach((sale) => {
      const id = getProductId(sale)
      if (id) map[id] = (map[id] || 0) + 1
    })
    return map
  }, [sales])

  if (loading || items.length === 0) return null

  const totalRevenue = Object.values(revenueByProduct).reduce((a, b) => a + b, 0)

  return (
    <ScrollReveal className="mb-6">
      <section className={`app-your-items-section ${className}`.trim()}>
        <div className="app-your-items-header">
          <div>
            <p className="app-eyebrow !mb-0.5 !text-[0.65rem]">Your listings</p>
            <h2 className="app-your-items-title">Your Items</h2>
            <p className="app-your-items-meta">
              {items.length} {items.length === 1 ? "item" : "items"} · ₹{totalRevenue} revenue
            </p>
          </div>
          <div className="app-your-items-actions">
            <Link href="/dashboard?tab=products" className="app-btn-outline !px-3 !py-1.5 !text-xs">
              Manage
            </Link>
            <Link href="/sell" className="app-btn-primary !px-3 !py-1.5 !text-xs">
              + List
            </Link>
          </div>
        </div>

        <div className="app-your-items-list">
          {items.map((item, index) => {
            const id = item._id
            const revenue = revenueByProduct[id] || 0
            const orders = orderCountByProduct[id] || 0

            return (
              <article
                key={id}
                className="app-your-item-card"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <Link href={`/products/${id}`} className="app-your-item-main">
                  <div className="app-your-item-thumb">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} />
                    ) : (
                      <Package className="h-4 w-4 text-[var(--app-muted)]" />
                    )}
                  </div>
                  <div className="app-your-item-info">
                    <div className="app-your-item-top">
                      <h3 className="app-your-item-name">{item.title}</h3>
                      <span className={`app-badge app-badge--sm ${item.isApproved ? "app-badge--success" : "app-badge--warning"}`}>
                        {item.isApproved ? "Live" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="app-your-item-metrics">
                    <div className="app-your-item-metric">
                      <span className="app-your-item-metric-label">Revenue</span>
                      <span className="app-your-item-metric-value">₹{revenue}</span>
                    </div>
                    <div className="app-your-item-metric">
                      <span className="app-your-item-metric-label">Orders</span>
                      <span className="app-your-item-metric-value">{orders}</span>
                    </div>
                    <div className="app-your-item-metric">
                      <span className="app-your-item-metric-label">Stock</span>
                      <span className="app-your-item-metric-value">{item.stock ?? 0}</span>
                    </div>
                    <div className="app-your-item-metric">
                      <span className="app-your-item-metric-label">Rating</span>
                      <span className="app-your-item-metric-value app-your-item-metric-value--rating">
                        <Star className="h-3 w-3 fill-[var(--app-gold)] text-[var(--app-gold)]" />
                        {item.rating ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
                <Link href={`/products/${id}`} className="app-your-item-link" title="View insights">
                  <BarChart3 className="h-3.5 w-3.5" />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </ScrollReveal>
  )
}
