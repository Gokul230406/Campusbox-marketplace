"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      // Check if user is admin (in production, verify this on backend)
      fetchPendingProducts()
    }
  }, [user, loading, router])

  const fetchPendingProducts = async () => {
    try {
      setFetchLoading(true)
      const res = await fetch("/api/admin/products/approval?status=pending")
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to load pending products")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleApprove = async (productId: string) => {
    try {
      const res = await fetch("/api/admin/products/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          approved: true,
        }),
      })

      if (!res.ok) throw new Error("Failed to approve")

      setProducts(products.filter((p) => p._id !== productId))
    } catch (err) {
      console.error("Approve error:", err)
    }
  }

  const handleReject = async (productId: string) => {
    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason")
      return
    }

    try {
      const res = await fetch("/api/admin/products/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          approved: false,
          rejectionReason,
        }),
      })

      if (!res.ok) throw new Error("Failed to reject")

      setProducts(products.filter((p) => p._id !== productId))
      setSelectedProduct(null)
      setRejectionReason("")
    } catch (err) {
      console.error("Reject error:", err)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the platform and approve products</p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Pending Products ({products.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Products Approval */}
          <TabsContent value="products" className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {fetchLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No pending products</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {products.map((product) => (
                    <Card
                      key={product._id}
                      className={`cursor-pointer transition ${selectedProduct === product._id ? "border-primary" : ""}`}
                      onClick={() => setSelectedProduct(product._id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{product.title}</h3>
                            <p className="text-sm text-muted-foreground">by {product.sellerName}</p>
                          </div>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <p className="text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedProduct && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Product</CardTitle>
                      <CardDescription>Approve or reject this product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(() => {
                        const product = products.find((p) => p._id === selectedProduct)
                        return (
                          <>
                            <div>
                              <h3 className="font-semibold mb-2">{product?.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{product?.description}</p>

                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Seller:</span> {product?.sellerName}
                                </p>
                                <p>
                                  <span className="font-medium">Category:</span> {product?.category}
                                </p>
                                <p>
                                  <span className="font-medium">Type:</span> {product?.type}
                                </p>
                                {product?.price && (
                                  <p>
                                    <span className="font-medium">Price:</span> ₹{product?.price}
                                  </p>
                                )}
                                {product?.rentalPrice && (
                                  <p>
                                    <span className="font-medium">Rental:</span> ₹{product?.rentalPrice}/day
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="rejection">Rejection Reason (if rejecting)</Label>
                              <Textarea
                                id="rejection"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-2 text-sm"
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(product?._id)}
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button onClick={() => handleApprove(product?._id)} className="flex-1">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold mt-2">0</p>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold mt-2">0</p>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold mt-2">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
