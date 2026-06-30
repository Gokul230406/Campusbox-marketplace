"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Flame, Package, Sparkles, Star, TrendingUp, Trophy } from "lucide-react"
import type { FeaturedProduct } from "@/lib/stats"

export type TrendMotion = "sales" | "trending" | "deals" | "featured"

type ProductMarqueeProps = {
  products: FeaturedProduct[]
  motion: TrendMotion
}

const MOTION_CONFIG: Record<
  TrendMotion,
  {
    direction: "ltr" | "rtl"
    pxPerSecond: number
    stepPx: number
  }
> = {
  sales: { direction: "rtl", pxPerSecond: 18, stepPx: 340 },
  trending: { direction: "rtl", pxPerSecond: 0, stepPx: 340 },
  deals: { direction: "ltr", pxPerSecond: 0, stepPx: 340 },
  featured: { direction: "rtl", pxPerSecond: 0, stepPx: 340 },
}

function formatPrice(product: FeaturedProduct) {
  if (product.type === "rent" && product.rentalPrice) return `₹${product.rentalPrice}/day`
  if (product.price) return `₹${product.price}`
  if (product.rentalPrice) return `₹${product.rentalPrice}/day`
  return "Ask"
}

const PLACEHOLDER_ITEMS: FeaturedProduct[] = [
  { id: "p1", title: "Engineering Notes", category: "Books & Notes", type: "sell", condition: "good", sellerName: "Campus", rating: 4.5, price: 299, badge: "Soon" },
  { id: "p2", title: "Scientific Calculator", category: "Calculators", type: "both", condition: "like-new", sellerName: "Campus", rating: 4.8, rentalPrice: 30, badge: "Soon" },
  { id: "p3", title: "USB-C Hub", category: "Tech Gadgets", type: "sell", condition: "new", sellerName: "Campus", rating: 4.2, price: 899, badge: "Soon" },
  { id: "p4", title: "Lab Coat", category: "Essentials", type: "rent", condition: "good", sellerName: "Campus", rating: 4.0, rentalPrice: 25, badge: "Soon" },
  { id: "p5", title: "Drawing Kit", category: "Stationery", type: "sell", condition: "good", sellerName: "Campus", rating: 4.6, price: 450, badge: "Soon" },
  { id: "p6", title: "Wireless Mouse", category: "Accessories", type: "sell", condition: "like-new", sellerName: "Campus", rating: 4.3, price: 350, badge: "Soon" },
]

function MarqueeCard({
  product,
  index,
  motion,
}: {
  product: FeaturedProduct
  index: number
  motion: TrendMotion
}) {
  const isPlaceholder = product.id.startsWith("p") && product.badge === "Soon"

  const content = (
    <article
      className={`trend-card trend-card--${motion}`}
      style={{ "--card-index": index % 8 } as CSSProperties}
    >
      <div className="trend-card-inner">
        {product.badge && <span className="trend-card-badge">{product.badge}</span>}
        <div className="trend-card-image">
          {product.image ? (
            <img src={product.image} alt={product.title} loading="lazy" />
          ) : (
            <Package className="h-8 w-8 text-[var(--trend-muted)]" />
          )}
        </div>
        <div className="trend-card-body">
          <p className="trend-card-category">{product.category}</p>
          <h3 className="trend-card-title">{product.title}</h3>
          <div className="trend-card-meta">
            <span className="trend-card-price">{formatPrice(product)}</span>
            <span className="trend-card-rating">
              <Star className="h-3 w-3 fill-[var(--trend-gold)] text-[var(--trend-gold)]" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )

  if (isPlaceholder) return content

  return (
    <Link href={`/products/${product.id}`} className="trend-card-link">
      {content}
    </Link>
  )
}

export function ProductMarquee({ products, motion }: ProductMarqueeProps) {
  const source = products.length > 0 ? products : PLACEHOLDER_ITEMS
  const track = useMemo(() => [...source, ...source], [source])
  const cfg = MOTION_CONFIG[motion]
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const mountedAtRef = useRef<number>(Date.now())
  const pauseUntilRef = useRef<number>(0)

  const scrollBy = (delta: number) => {
    const el = viewportRef.current
    if (!el) return
    pauseUntilRef.current = Date.now() + 260
    el.scrollBy({ left: delta, behavior: "smooth" })
  }

  const scrollPrev = () => scrollBy(-cfg.stepPx)
  const scrollNext = () => scrollBy(cfg.stepPx)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    // Start near the middle so both directions feel natural.
    const half = el.scrollWidth / 2
    if (half > 0) el.scrollLeft = cfg.direction === "rtl" ? half : 0

    const tick = (ts: number) => {
      if (!viewportRef.current) return
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05)
      lastTsRef.current = ts

      const viewport = viewportRef.current
      const isTemporarilyPaused = Date.now() < pauseUntilRef.current
      if (!viewport || isTemporarilyPaused) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const elapsed = Date.now() - mountedAtRef.current
      const introBoost = motion === "sales" && elapsed < 1200 ? 1.04 : 1
      const delta = cfg.pxPerSecond * introBoost * dt * (cfg.direction === "rtl" ? 1 : -1)
      viewport.scrollLeft += delta

      // Loop seamlessly by snapping back within the duplicated content.
      const max = viewport.scrollWidth - viewport.clientWidth
      const mid = viewport.scrollWidth / 2
      if (viewport.scrollLeft <= 0) viewport.scrollLeft += mid
      if (viewport.scrollLeft >= max) viewport.scrollLeft -= mid

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [cfg.direction, cfg.pxPerSecond, motion])

  return (
    <div className={`trend-marquee trend-marquee--${motion}`}>
      <button type="button" className="trend-marquee-nav trend-marquee-nav--left" onClick={scrollPrev} aria-label="Scroll left">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" className="trend-marquee-nav trend-marquee-nav--right" onClick={scrollNext} aria-label="Scroll right">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={viewportRef}
        className="trend-marquee-viewport"
      >
        <div className={`trend-marquee-track trend-marquee-track--${motion}`}>
          {track.map((product, index) => (
            <MarqueeCard key={`${product.id}-${index}`} product={product} index={index} motion={motion} />
          ))}
        </div>
      </div>
    </div>
  )
}

const SECTION_ICONS = {
  sales: Trophy,
  trending: TrendingUp,
  deals: Flame,
  featured: Sparkles,
} as const

type MarqueeSectionProps = {
  eyebrow: string
  title: string
  subtitle?: string
  products: FeaturedProduct[]
  variant: TrendMotion
}

export function MarqueeSection({ eyebrow, title, subtitle, products, variant }: MarqueeSectionProps) {
  const Icon = SECTION_ICONS[variant]

  return (
    <section className={`trend-section trend-section--${variant}`}>
      <div className="trend-section-header">
        <div className="grid w-full grid-cols-1 items-end gap-4 px-3 sm:px-5 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="trend-eyebrow mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {eyebrow}
            </p>
            <h2 className="trend-section-title">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-[var(--trend-muted)]">{subtitle}</p>}
          </div>
          <Link href="/products" className="trend-btn-outline hidden shrink-0 text-sm sm:inline-flex">
            View all
          </Link>
        </div>
      </div>
      <div className="trend-section-content">
        <ProductMarquee products={products} motion={variant} />
      </div>
    </section>
  )
}
