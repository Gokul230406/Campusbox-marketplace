"use client"

import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import type { FeaturedProduct, HomepageCategory } from "@/lib/stats"
import { CountUp } from "@/components/home/count-up"
import { FeatureCard } from "@/components/home/feature-card"
import { ScrollReveal } from "@/components/home/scroll-reveal"
import { CampusBoxIcon } from "@/components/campus-box-icon"
import { Backpack, TrendingUp, Shield, Award } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type HomePageProps = {
  categories: HomepageCategory[]
  totalProducts: number
  totalUsers: number
  featuredProducts: FeaturedProduct[]
}

const features = [
  {
    icon: Backpack,
    title: "College-Exclusive",
    description: "A verified student community built for your campus.",
  },
  {
    icon: TrendingUp,
    title: "Flexible Options",
    description: "Buy permanently or rent for a semester.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Wallet-based payments with seller verification.",
  },
  {
    icon: Award,
    title: "Trusted Network",
    description: "Ratings and reviews that build real credibility.",
  },
]

function formatPrice(product: FeaturedProduct) {
  if (product.type === "rent" && product.rentalPrice) {
    return `₹${product.rentalPrice}/wk`
  }
  if (product.price) return `₹${product.price}`
  if (product.rentalPrice) return `₹${product.rentalPrice}/wk`
  return "Price on request"
}

export function HomePage({ categories, totalProducts, totalUsers, featuredProducts }: HomePageProps) {
  const { user } = useAuth()

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-orb home-orb--1" aria-hidden="true" />
        <div className="home-orb home-orb--2" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="home-fade-up mb-6 flex items-center gap-2 text-[#1a2744] dark:text-[var(--home-gold)]">
            <CampusBoxIcon className="h-10 w-10" />
            <span className="home-eyebrow">Campus-Box Marketplace</span>
          </div>

          <h1 className="home-fade-up home-fade-up-delay-1 font-serif text-4xl leading-tight text-[var(--home-ink)] sm:text-5xl lg:text-7xl">
            Your Campus.
            <br />
            <span className="text-[var(--home-gold)]">Your Marketplace.</span>
          </h1>

          <p className="home-fade-up home-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--home-muted)]">
            Buy, sell, and rent student essentials with classmates you trust — books, calculators, gadgets, and more.
          </p>

          <div className="home-fade-up home-fade-up-delay-3 mt-10 flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="home-btn-primary">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/products" className="home-btn-outline">
                  Browse Products
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="home-btn-primary">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/products" className="home-btn-outline">
                  Browse Products
                </Link>
              </>
            )}
          </div>

          <div className="home-fade-up home-fade-up-delay-4 mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="home-stat col-span-2 sm:col-span-1">
              <p className="home-eyebrow mb-1">Products</p>
              <p className="font-serif text-3xl text-[var(--home-ink)]">
                <CountUp end={totalProducts} />
              </p>
            </div>
            <div className="home-stat">
              <p className="home-eyebrow mb-1">Students</p>
              <p className="font-serif text-3xl text-[var(--home-ink)]">
                <CountUp end={totalUsers} />
              </p>
            </div>
            <div className="home-stat">
              <p className="home-eyebrow mb-1">Categories</p>
              <p className="font-serif text-3xl text-[var(--home-ink)]">
                <CountUp end={categories.filter((c) => c.count > 0).length || categories.length} />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-14 text-center">
          <p className="home-eyebrow mb-3">Why Campus-Box</p>
          <h2 className="home-section-title">Built for the way students actually trade</h2>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <FeatureCard {...feature} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="home-categories-section py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-14 text-center">
            <p className="home-eyebrow mb-3">Browse by category</p>
            <h2 className="home-section-title">What are you looking for?</h2>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <ScrollReveal key={cat.name} delay={index * 80}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                  className="home-category group block"
                >
                  <h3 className="font-serif text-xl text-[var(--home-ink)] transition group-hover:text-[var(--home-gold)]">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--home-muted)]">
                    {cat.count} {cat.count === 1 ? "item" : "items"} available
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="home-eyebrow mb-3">Fresh listings</p>
            <h2 className="home-section-title">Featured on campus</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/trending" className="home-btn-outline text-sm">
              See trending <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products" className="home-btn-outline text-sm">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 90}>
                <Link href={`/products/${product.id}`} className="home-product-card block h-full">
                  <div className="home-product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.title} loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-[var(--home-muted)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--home-gold)]">{product.category}</p>
                    <h3 className="mt-2 font-serif text-lg text-[var(--home-ink)] line-clamp-2">{product.title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-[#1a2744] dark:text-[var(--home-gold)]">{formatPrice(product)}</span>
                      <span className="flex items-center gap-1 text-sm text-[var(--home-muted)]">
                        <Star className="h-3.5 w-3.5 fill-[var(--home-gold)] text-[var(--home-gold)]" />
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--home-muted)]">by {product.sellerName}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--home-gold)_30%,transparent)] bg-white/60 px-8 py-16 text-center dark:bg-white/5">
              <p className="font-serif text-2xl text-[var(--home-ink)]">No listings yet</p>
              <p className="mx-auto mt-3 max-w-md text-[var(--home-muted)]">
                Be the first to list a product on Campus-Box and help build your campus marketplace.
              </p>
              <Link href={user ? "/sell" : "/register"} className="home-btn-primary mt-8 inline-flex">
                {user ? "List an item" : "Create account & sell"}
              </Link>
            </div>
          </ScrollReveal>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="home-cta relative px-8 py-16 text-center sm:px-16 sm:py-20">
            <p className="home-eyebrow mb-4 text-[color-mix(in_srgb,var(--home-gold)_90%,white)]">Join the community</p>
            <h2 className="font-serif text-3xl sm:text-4xl">
              {totalUsers > 0
                ? `Join ${totalUsers} ${totalUsers === 1 ? "student" : "students"} on Campus-Box`
                : "Start your campus marketplace today"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color-mix(in_srgb,#f7f3eb_80%,transparent)]">
              List what you don&apos;t need. Find what you do. Every deal stays within your college community.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={user ? "/sell" : "/register"}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--home-gold)] px-7 py-3.5 font-semibold text-[var(--home-ink)] transition hover:brightness-110"
              >
                {user ? "Start Selling" : "Create Your Account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  )
}
