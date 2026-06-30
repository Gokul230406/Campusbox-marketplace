"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageContainer, PageHeader, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

const CATEGORIES = ["Books & Notes", "Calculators", "Accessories", "Essentials", "Tech Gadgets", "Stationery"]
const CONDITIONS = ["new", "like-new", "good", "fair"]

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "good",
    type: "sell",
    price: "",
    rentalPrice: "",
    rentalDuration: "7",
    stock: "1",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(files)
      const previews: string[] = []
      for (const file of files) {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
        previews.push(preview)
      }
      setImagePreviews(previews)
    }
  }

  const validateStep1 = () => {
    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.type === "sell" || formData.type === "both") {
      if (!formData.price || Number.parseFloat(formData.price) <= 0) {
        setError("Please enter a valid sale price")
        return false
      }
    }
    if (formData.type === "rent" || formData.type === "both") {
      if (!formData.rentalPrice || Number.parseFloat(formData.rentalPrice) <= 0) {
        setError("Please enter a valid rental price")
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (images.length === 0) {
      setError("Please upload at least one image")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
    else if (step === 3 && validateStep3()) handleSubmit()
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const imageUrls: string[] = []
      for (const imageFile of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result)
            else reject(new Error("Failed to convert image"))
          }
          reader.onerror = () => reject(new Error("Failed to read image"))
          reader.readAsDataURL(imageFile)
        })
        imageUrls.push(base64)
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.type === "sell" || formData.type === "both" ? Number.parseFloat(formData.price) : undefined,
          rentalPrice:
            formData.type === "rent" || formData.type === "both" ? Number.parseFloat(formData.rentalPrice) : undefined,
          rentalDuration:
            formData.type === "rent" || formData.type === "both" ? Number.parseInt(formData.rentalDuration) : undefined,
          stock: Number.parseInt(formData.stock),
          images: imageUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to list item")
      }

      router.push("/dashboard?tab=products")
    } catch (err: any) {
      setError(err.message || "Failed to list item")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <PageShell center>
        <PageContainer size="narrow">
          <div className="app-card">
            <div className="app-card-body text-center">
              <p className="app-subtitle">Please log in to sell items</p>
              <button type="button" className="app-btn-primary app-btn-primary--block mt-4" onClick={() => router.push("/login")}>
                Go to Login
              </button>
            </div>
          </div>
        </PageContainer>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageContainer size="wide">
        <ScrollReveal>
          <PageHeader eyebrow="List an item" title="Sell Your Item" subtitle="List a product for sale or rent on Campus-Box" />
        </ScrollReveal>

        <ScrollReveal delay={80}>
        <div className="app-progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`app-progress-step${step >= s ? " is-active" : ""}`} />
          ))}
        </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
        <div className="app-card app-enter">
          {error && (
            <div className="app-card-body pb-0">
              <div className="app-alert-error">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="app-card-header">
                <h2 className="app-card-title">Item Details</h2>
                <p className="app-card-desc">Tell us about what you&apos;re selling</p>
              </div>
              <div className="app-card-body">
                <div className="app-field">
                  <label htmlFor="title" className="app-label">
                    Item Title
                  </label>
                  <input id="title" name="title" value={formData.title} onChange={handleChange} className="app-input" placeholder="E.g., Physics Textbook" />
                </div>
                <div className="app-field">
                  <label htmlFor="description" className="app-label">
                    Description
                  </label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="app-textarea" rows={5} />
                </div>
                <div className="app-field-row app-field-row--2">
                  <div className="app-field">
                    <label htmlFor="category" className="app-label">
                      Category
                    </label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="app-select">
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="app-field">
                    <label htmlFor="condition" className="app-label">
                      Condition
                    </label>
                    <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className="app-select">
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond.charAt(0).toUpperCase() + cond.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="app-card-header">
                <h2 className="app-card-title">Pricing & Availability</h2>
                <p className="app-card-desc">Set how your item will be available</p>
              </div>
              <div className="app-card-body">
                <div className="app-field">
                  <span className="app-label">Type of Sale</span>
                  <div className="mt-3 space-y-3">
                    {["sell", "rent", "both"].map((type) => (
                      <label key={type} className="flex cursor-pointer items-center gap-3">
                        <input type="radio" name="type" value={type} checked={formData.type === type} onChange={handleChange} />
                        <span className="font-medium capitalize">
                          {type === "both" ? "Buy & Rent" : type === "sell" ? "Buy Only" : "Rent Only"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {(formData.type === "sell" || formData.type === "both") && (
                  <div className="app-field">
                    <label htmlFor="price" className="app-label">
                      Sale Price (₹)
                    </label>
                    <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="app-input" />
                  </div>
                )}
                {(formData.type === "rent" || formData.type === "both") && (
                  <>
                    <div className="app-field">
                      <label htmlFor="rentalPrice" className="app-label">
                        Rental Price per Day (₹)
                      </label>
                      <input id="rentalPrice" name="rentalPrice" type="number" value={formData.rentalPrice} onChange={handleChange} className="app-input" />
                    </div>
                    <div className="app-field">
                      <label htmlFor="rentalDuration" className="app-label">
                        Max Rental Duration (days)
                      </label>
                      <input id="rentalDuration" name="rentalDuration" type="number" value={formData.rentalDuration} onChange={handleChange} className="app-input" />
                    </div>
                  </>
                )}
                <div className="app-field">
                  <label htmlFor="stock" className="app-label">
                    Quantity Available
                  </label>
                  <input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} className="app-input" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="app-card-header">
                <h2 className="app-card-title">Upload Images</h2>
                <p className="app-card-desc">Add clear photos of your item</p>
              </div>
              <div className="app-card-body">
                <div className="app-upload-zone">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="block cursor-pointer">
                    <Upload className="mx-auto mb-3 h-12 w-12 text-[var(--app-muted)]" />
                    <p className="font-medium">Upload photos</p>
                    <p className="app-hint">Click to select images</p>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--app-gold)_25%,transparent)]">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="aspect-square w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="app-card-footer">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="app-btn-outline flex-1">
                Back
              </button>
            )}
            <button type="button" onClick={handleNext} disabled={loading} className="app-btn-primary flex-1">
              {loading ? "Uploading..." : step === 3 ? "List Item" : "Next"}
            </button>
          </div>
        </div>
        </ScrollReveal>
      </PageContainer>
    </PageShell>
  )
}
