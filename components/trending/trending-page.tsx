"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { FeaturedProduct } from "@/lib/stats"
import { MarqueeSection } from "@/components/trending/product-marquee"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { PageHeader, PageShell } from "@/components/layout/page-shell"

type TrendingPageProps = {
  topSales: FeaturedProduct[]
  trending: FeaturedProduct[]
  hotDeals: FeaturedProduct[]
  featuredProducts: FeaturedProduct[]
}

export function TrendingPage({ topSales, trending, hotDeals, featuredProducts }: TrendingPageProps) {
  return (
    <PageShell className="trend-page">
      <div className="trend-page-shell">
        <ScrollReveal>
          <PageHeader
            eyebrow="Live marketplace"
            title="Trending"
            subtitle="Top sales, hot deals, and campus favorites — each row moves in its own style"
          />
        </ScrollReveal>

        <div className="trend-stack">
          <MarqueeSection
            variant="sales"
            eyebrow="Top Sales"
            title="Campus bestsellers"
            subtitle="Most purchased essentials across campus"
            products={topSales}
          />
          <MarqueeSection
            variant="trending"
            eyebrow="Trending Buys"
            title="What students are grabbing now"
            subtitle="Fast-moving picks that are popular this week"
            products={trending}
          />
          <MarqueeSection
            variant="deals"
            eyebrow="Hot Discounts"
            title="Steals & deals"
            subtitle="Best value offers from active sellers"
            products={hotDeals}
          />
          <MarqueeSection
            variant="featured"
            eyebrow="Featured"
            title="Hand-picked for you"
            subtitle="Curated recommendations from trusted listings"
            products={featuredProducts}
          />
        </div>

        <ScrollReveal delay={120} className="mt-12 text-center">
          <Link href="/products" className="trend-btn-primary inline-flex">
            Browse full marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </PageShell>
  )
}
