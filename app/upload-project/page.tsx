"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, FileCheck } from "lucide-react"

export default function UploadProjectPage() {
  const [step, setStep] = useState(1)
  const [projectType, setProjectType] = useState("both")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    salePrice: "",
    rentalPrice: "",
    maxRentalDays: "30",
    technologies: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")

  const categories = [
    "Web Development",
    "Mobile Apps",
    "Data Science",
    "Machine Learning",
    "Backend Systems",
    "UI/UX Design",
  ]

  const subCategories: Record<string, string[]> = {
    "Web Development": ["React", "Vue", "Angular", "Next.js", "Full Stack"],
    "Mobile Apps": ["iOS", "Android", "React Native", "Flutter"],
    "Data Science": ["Analysis", "Visualization", "Prediction", "Statistics"],
    "Machine Learning": ["NLP", "Computer Vision", "Classification", "Regression"],
    "Backend Systems": ["APIs", "Databases", "Authentication", "Microservices"],
    "UI/UX Design": ["Web UI", "Mobile UI", "Prototypes", "Design Systems"],
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const validateStep1 = () => {
    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all fields")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (projectType === "both" || projectType === "sale") {
      if (!formData.salePrice || Number.parseInt(formData.salePrice) <= 0) {
        setError("Please enter a valid sale price")
        return false
      }
    }
    if (projectType === "both" || projectType === "rental") {
      if (!formData.rentalPrice || Number.parseInt(formData.rentalPrice) <= 0) {
        setError("Please enter a valid rental price")
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (files.length === 0) {
      setError("Please upload at least one file")
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
    try {
      setError("")
      // TODO: Call upload API
      const formDataToSend = new FormData()
      formDataToSend.append(
        "data",
        JSON.stringify({
          ...formData,
          projectType,
        }),
      )
      files.forEach((file) => {
        formDataToSend.append("files", file)
      })

      const response = await fetch("/api/projects/upload", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      window.location.href = "/my-projects"
    } catch (err: any) {
      setError(err.message || "An error occurred")
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upload Your Project</h1>
          <p className="text-muted-foreground mt-2">Share your academic work with the community</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <Card>
          {error && (
            <div className="m-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Tell us about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="E.g., E-Commerce Platform"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your project, features, and tech stack..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    rows={5}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={!formData.category}
                      className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50"
                    >
                      <option value="">Select Subcategory</option>
                      {formData.category &&
                        subCategories[formData.category]?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    name="technologies"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.technologies}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Pricing & Access</CardTitle>
                <CardDescription>Set how your project will be available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Availability Type</Label>
                  <div className="space-y-3 mt-3">
                    {["sale", "rental", "both"].map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value={type}
                          checked={projectType === type}
                          onChange={(e) => setProjectType(e.target.value)}
                        />
                        <span className="capitalize font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(projectType === "sale" || projectType === "both") && (
                  <div>
                    <Label htmlFor="salePrice">Sale Price (₹)</Label>
                    <Input
                      id="salePrice"
                      name="salePrice"
                      type="number"
                      placeholder="2999"
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                )}

                {(projectType === "rental" || projectType === "both") && (
                  <>
                    <div>
                      <Label htmlFor="rentalPrice">Rental Price per Day (₹)</Label>
                      <Input
                        id="rentalPrice"
                        name="rentalPrice"
                        type="number"
                        placeholder="99"
                        value={formData.rentalPrice}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxRentalDays">Max Rental Days</Label>
                      <Input
                        id="maxRentalDays"
                        name="maxRentalDays"
                        type="number"
                        value={formData.maxRentalDays}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </>
          )}

          {/* Step 3: Upload Files */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Upload Project Files</CardTitle>
                <CardDescription>Upload your project code and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
                  <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">Drag and drop files here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to select files</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
                    <div className="space-y-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded">
                          <FileCheck className="w-4 h-4 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Buttons */}
          <CardContent className="border-t border-border pt-6 flex gap-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === 3 ? "Submit Project" : "Next"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
