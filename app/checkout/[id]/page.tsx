"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Star,
  Wallet,
} from "lucide-react"
import { PageContainer, PageHeader, PageLoading, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

function getDefaultOrderType(product: { type?: string }): "purchase" | "rental" {
  if (product.type === "rent") return "rental"
  return "purchase"
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [orderType, setOrderType] = useState<"purchase" | "rental">("purchase")
  const [rentalDays, setRentalDays] = useState("7")
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi">("upi")
  const [upiId, setUpiId] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error("Product not found")
        const data = await res.json()
        setProduct(data)
        setOrderType(getDefaultOrderType(data))
      } catch (err: any) {
        setError(err.message || "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchProduct()
  }, [params.id, user, router])

  const calculateTotal = () => {
    if (!product) return 0
    if (orderType === "purchase") return product.price || 0
    return (product.rentalPrice || 0) * Number.parseInt(rentalDays || "1", 10)
  }

  const handleCheckout = async () => {
    if (!user || !product) return

    if (paymentMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID")
      return
    }

    if (!pickupLocation.trim()) {
      setError("Please enter pickup location")
      return
    }

    setProcessing(true)
    setError("")

    try {
      const res = await fetch("/api/orders/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: params.id,
          orderType,
          rentalDays: orderType === "rental" ? Number.parseInt(rentalDays, 10) : undefined,
          paymentMethod,
          upiId: paymentMethod === "upi" ? upiId : undefined,
          pickupLocation,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to complete purchase")
      }

      router.push("/dashboard?tab=orders")
    } catch (err: any) {
      setError(err.message || "Failed to complete purchase")
    } finally {
      setProcessing(false)
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

  const total = calculateTotal()
  const canBuy = product.type === "sell" || product.type === "both"
  const canRent = product.type === "rent" || product.type === "both"
  const walletBalance = user?.walletBalance || 0
  const insufficientWallet = paymentMethod === "wallet" && walletBalance < total

  return (
    <PageShell>
      <PageContainer size="wide">
        <ScrollReveal>
          <Link href={`/products/${params.id}`} className="app-link mb-6 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to product
          </Link>
          <PageHeader
            eyebrow="Secure checkout"
            title="Checkout"
            subtitle="Complete your order — seller contact details unlock in your dashboard after purchase"
          />
        </ScrollReveal>

        {error && (
          <ScrollReveal delay={40}>
            <div className="app-alert-error mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          </ScrollReveal>
        )}

        <div className="app-checkout-layout">
          <div className="app-checkout-main space-y-4">
            <ScrollReveal delay={60}>
              <div className="app-card">
                <div className="app-card-header">
                  <h2 className="app-card-title">Product Details</h2>
                </div>
                <div className="app-card-body">
                  <div className="app-checkout-product">
                    <div className="app-checkout-product-image">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      ) : (
                        <Package className="h-8 w-8 text-[var(--app-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="app-eyebrow !mb-1 !text-[0.65rem]">{product.category}</p>
                      <h3 className="font-serif text-lg text-[var(--app-ink)]">{product.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--app-muted)]">{product.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[var(--app-gold)] text-[var(--app-gold)]" />
                          {product.rating}
                        </span>
                        <span className="app-badge app-badge--warning capitalize">{product.condition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={90}>
              <div className="app-card">
                <div className="app-card-header">
                  <h2 className="app-card-title">Order Type</h2>
                  <p className="app-card-desc">Choose to buy or rent this item</p>
                </div>
                <div className="app-card-body space-y-3">
                  {canBuy && (
                    <button
                      type="button"
                      className={`app-checkout-option${orderType === "purchase" ? " is-selected" : ""}`}
                      onClick={() => setOrderType("purchase")}
                    >
                      <span className="app-checkout-option-radio" />
                      <span className="flex-1 text-left">
                        <span className="block font-semibold text-[var(--app-ink)]">Buy Now</span>
                        <span className="text-sm text-[var(--app-muted)]">One-time purchase</span>
                      </span>
                      <span className="font-serif text-lg text-[var(--app-ink)]">₹{product.price}</span>
                    </button>
                  )}
                  {canRent && (
                    <div className={`app-checkout-option-wrap${orderType === "rental" ? " is-selected" : ""}`}>
                      <button
                        type="button"
                        className={`app-checkout-option w-full${orderType === "rental" ? " is-selected" : ""}`}
                        onClick={() => setOrderType("rental")}
                      >
                        <span className="app-checkout-option-radio" />
                        <span className="flex-1 text-left">
                          <span className="block font-semibold text-[var(--app-ink)]">Rent</span>
                          <span className="text-sm text-[var(--app-muted)]">Pay per day</span>
                        </span>
                        <span className="font-serif text-lg text-[var(--app-ink)]">₹{product.rentalPrice}/day</span>
                      </button>
                      {orderType === "rental" && (
                        <div className="app-checkout-option-extra">
                          <label htmlFor="rentalDays" className="app-label">
                            Duration (days)
                          </label>
                          <input
                            id="rentalDays"
                            type="number"
                            min="1"
                            max={product.rentalDuration || 30}
                            value={rentalDays}
                            onChange={(e) => setRentalDays(e.target.value)}
                            className="app-input"
                          />
                          <p className="app-hint">Max rental period: {product.rentalDuration || 30} days</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="app-card">
                <div className="app-card-header">
                  <h2 className="app-card-title">Payment Method</h2>
                  <p className="app-card-desc">Choose how you want to pay</p>
                </div>
                <div className="app-card-body space-y-3">
                  <button
                    type="button"
                    className={`app-checkout-option${paymentMethod === "upi" ? " is-selected" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <span className="app-checkout-option-radio" />
                    <span className="flex-1 text-left">
                      <span className="block font-semibold text-[var(--app-ink)]">UPI Payment</span>
                      <span className="text-sm text-[var(--app-muted)]">Pay via UPI before pickup</span>
                    </span>
                  </button>
                  {paymentMethod === "upi" && (
                    <div className="app-field !mb-0 pl-1">
                      <label htmlFor="upiId" className="app-label">
                        UPI ID *
                      </label>
                      <input
                        id="upiId"
                        placeholder="yourname@paytm / yourname@ybl"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="app-input"
                      />
                      <p className="app-hint">Seller will send a payment request to this UPI ID</p>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`app-checkout-option${paymentMethod === "wallet" ? " is-selected" : ""}`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <span className="app-checkout-option-radio" />
                    <span className="flex-1 text-left">
                      <span className="block font-semibold text-[var(--app-ink)]">Wallet Payment</span>
                      <span className="text-sm text-[var(--app-muted)]">
                        ₹{walletBalance.toLocaleString()} available
                      </span>
                    </span>
                    <Wallet className="h-4 w-4 text-[var(--app-gold)]" />
                  </button>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="app-card">
                <div className="app-card-header">
                  <h2 className="app-card-title flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[var(--app-gold)]" />
                    Pickup Location
                  </h2>
                  <p className="app-card-desc">Where would you like to collect the item?</p>
                </div>
                <div className="app-card-body">
                  <div className="app-field !mb-0">
                    <label htmlFor="pickupLocation" className="app-label">
                      Pickup Location *
                    </label>
                    <input
                      id="pickupLocation"
                      placeholder="e.g., College Main Gate, Library Entrance, Hostel Block A"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="app-input"
                    />
                    <p className="app-hint">You&apos;ll coordinate the exact time with the seller after ordering</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <div className="app-card app-checkout-steps">
                <div className="app-card-body">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--app-ink)]">
                    <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
                    Next Steps
                  </h3>
                  <ol className="app-checkout-steps-list">
                    <li>Click &quot;Place Order&quot; to confirm</li>
                    <li>Seller contact details appear in your dashboard once the order completes</li>
                    <li>Coordinate pickup time and location with the seller</li>
                    <li>
                      {paymentMethod === "upi"
                        ? "Complete UPI payment when the seller sends the request"
                        : "Payment is deducted from your wallet automatically"}
                    </li>
                    <li>Collect the item and you&apos;re done</li>
                  </ol>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={100} className="app-checkout-sidebar">
            <div className="app-card app-checkout-summary">
              <div className="app-card-header">
                <h2 className="app-card-title">Order Summary</h2>
              </div>
              <div className="app-card-body space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--app-muted)]">
                      {orderType === "purchase" ? "Purchase price" : `Rental (${rentalDays} days)`}
                    </span>
                    <span className="font-medium text-[var(--app-ink)]">
                      ₹
                      {orderType === "purchase"
                        ? product.price
                        : (product.rentalPrice || 0) * Number.parseInt(rentalDays || "1", 10)}
                    </span>
                  </div>
                  {orderType === "rental" && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--app-muted)]">Per day</span>
                      <span className="font-medium text-[var(--app-ink)]">₹{product.rentalPrice}</span>
                    </div>
                  )}
                  <div className="app-checkout-summary-total">
                    <span>Total</span>
                    <span className="app-checkout-summary-amount">₹{total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={processing || total <= 0 || insufficientWallet}
                  className="app-btn-primary app-btn-primary--block"
                >
                  {processing ? "Processing..." : "Place Order"}
                </button>

                {insufficientWallet && (
                  <p className="text-center text-xs text-[#b42318]">
                    Insufficient wallet balance. Add funds or choose UPI.
                  </p>
                )}

                <button type="button" onClick={() => router.back()} className="app-btn-outline app-btn-outline--block">
                  Cancel
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </PageContainer>
    </PageShell>
  )
}
