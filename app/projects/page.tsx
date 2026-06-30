"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, Star, Clock, ShoppingCart, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("-createdAt")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { user } = useAuth()

  const categories = [
    "Web Development",
    "Mobile Apps",
    "Data Science",
    "Machine Learning",
    "Backend Systems",
    "UI/UX Design",
  ]

  useEffect(() => {
    fetchProjects()
  }, [selectedCategory, sortBy, page])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/projects?${params}`)
      if (!response.ok) throw new Error("Failed to fetch projects")

      const data = await response.json()
      setProjects(data.projects)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = (projectId: string, type: string) => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/checkout?projectId=${projectId}&type=${type}`)
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Projects</h1>
          <p className="text-muted-foreground">Find the academic projects you need</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <Label>Category</Label>
                  <div className="space-y-2 mt-3">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                          className="rounded"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="-createdAt">Newest</option>
                    <option value="-purchaseCount">Most Popular</option>
                    <option value="-rating">Top Rated</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No projects found. Try adjusting your filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project._id} className="overflow-hidden hover:border-primary/50 transition">
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="text-xs">by {project.sellerName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-medium">{project.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({project.totalReviews})</span>
                        </div>
                        <span className="px-2 py-1 bg-muted rounded text-xs">{project.category}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {project.tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="border-t border-border pt-4">
                        {project.type === "both" ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Purchase:</span>
                              <span className="font-bold">₹{project.price}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Rent (per day):</span>
                              <span className="font-bold">₹{project.rentalPrice}</span>
                            </div>
                          </div>
                        ) : project.type === "sell" ? (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-bold">₹{project.price}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Per Day:</span>
                            <span className="font-bold">₹{project.rentalPrice}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {project.type !== "rent" && (
                          <Button className="flex-1" size="sm" onClick={() => handleBuy(project._id, "purchase")}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy
                          </Button>
                        )}
                        {project.type !== "sell" && (
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            size="sm"
                            onClick={() => handleBuy(project._id, "rental")}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Rent
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
