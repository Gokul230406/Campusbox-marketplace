"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Phone, Shield, Star, Wallet } from "lucide-react"
import Link from "next/link"
import { PageContainer, PageHeader, PageLoading, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

function getAvatarSrc(user: { profileImage?: string; email: string }) {
  if (user.profileImage) return user.profileImage
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
}

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", bio: "" })

  useEffect(() => {
    if (!loading && !user) router.push("/login")
    else if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
      })
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Update failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image under 2 MB")
      return
    }

    try {
      setIsUploadingPhoto(true)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result)
          else reject(new Error("Failed to read image"))
        }
        reader.onerror = () => reject(new Error("Failed to read image"))
        reader.readAsDataURL(file)
      })

      await updateProfile({ ...formData, profileImage: base64 })
    } catch (error) {
      console.error("Photo upload failed:", error)
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (loading) return <PageLoading />
  if (!user) return null

  return (
    <PageShell>
      <PageContainer size="wide">
        <ScrollReveal>
          <PageHeader eyebrow="Your account" title="Profile" subtitle="Manage your Campus-Box profile and wallet" />
        </ScrollReveal>

        <ScrollReveal delay={80}>
        <Tabs defaultValue="overview" className="w-full gap-6">
          <TabsList className="grid-cols-2">
            <TabsTrigger value="overview">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="app-card">
              <div className="app-card-body flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <div className="app-avatar-ring">
                      <img src={getAvatarSrc(user)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      className="app-avatar-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      title="Change profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div>
                    <h2 className="app-card-title">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="app-card-desc">{user.email}</p>
                    {user.phoneNumber && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--app-ink)]">
                        <Phone className="h-3.5 w-3.5 text-[var(--app-gold)]" />
                        +91 {user.phoneNumber}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.floor(user.rating) ? "fill-[var(--app-gold)] text-[var(--app-gold)]" : "text-[var(--app-muted)]"}`}
                        />
                      ))}
                      <span className="ml-1.5 text-sm font-semibold">{user.rating.toFixed(1)}</span>
                    </div>
                    {isUploadingPhoto && (
                      <p className="mt-2 text-xs text-[var(--app-muted)]">Uploading photo…</p>
                    )}
                  </div>
                </div>
                <button type="button" className="app-btn-outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title">Profile Information</h2>
              </div>
              <div className="app-card-body">
                <div className="app-field-row app-field-row--2">
                  <div className="app-field">
                    <label htmlFor="firstName" className="app-label">
                      First Name
                    </label>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} className="app-input" />
                  </div>
                  <div className="app-field">
                    <label htmlFor="lastName" className="app-label">
                      Last Name
                    </label>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} className="app-input" />
                  </div>
                </div>
                <div className="app-field-row app-field-row--2">
                  <div className="app-field">
                    <label htmlFor="email" className="app-label">
                      Email
                    </label>
                    <input id="email" value={user.email} disabled className="app-input" />
                  </div>
                  <div className="app-field">
                    <label htmlFor="phone" className="app-label">
                      Mobile Number
                    </label>
                    <input
                      id="phone"
                      value={user.phoneNumber ? `+91 ${user.phoneNumber}` : "Not provided"}
                      disabled
                      className="app-input"
                    />
                  </div>
                </div>
                <div className="app-field">
                  <label htmlFor="bio" className="app-label">
                    Bio
                  </label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} disabled={!isEditing} className="app-textarea" rows={3} placeholder="Tell us about yourself..." />
                </div>
                {isEditing && (
                  <div className="app-actions-row">
                    <button type="button" onClick={handleSave} disabled={isSaving} className="app-btn-primary">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="app-btn-outline">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#16a34a]" />
                  Verification Status
                </h2>
              </div>
              <div className="app-card-body">
                <div className="app-divider-row">
                  <span className="text-sm">College Email Verified</span>
                  <span className="app-badge app-badge--success">Verified</span>
                </div>
                <div className="app-divider-row">
                  <span className="text-sm">Seller Status</span>
                  <span className={`app-badge ${user.isVerifiedSeller ? "app-badge--success" : "app-badge--warning"}`}>
                    {user.isVerifiedSeller ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="app-card">
              <div className="app-card-header">
                <h2 className="app-card-title flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Balance
                </h2>
              </div>
              <div className="app-card-body space-y-6">
                <div className="app-wallet-banner">
                  <p className="text-sm text-[var(--app-muted)]">Available Balance</p>
                  <p className="app-wallet-amount">₹{user.walletBalance.toLocaleString()}</p>
                </div>
                <div className="app-actions-row">
                  <Link href="/wallet" className="app-btn-primary text-center">
                    Add Funds
                  </Link>
                  <button type="button" className="app-btn-outline">
                    View Transactions
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </ScrollReveal>
      </PageContainer>
    </PageShell>
  )
}
