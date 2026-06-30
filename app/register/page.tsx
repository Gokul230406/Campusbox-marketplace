"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { PageContainer, PageHeader, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    registerNumber: "",
    department: "",
    year: "",
    section: "",
    phoneNumber: "",
    altPhoneNumber: "",
  })

  const departments = [
    "Computer Science",
    "Electronics & Communication",
    "Information Technology",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Business Administration",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.registerNumber || !formData.phoneNumber) {
      setError("Please fill in all required fields")
      return false
    }
    if (!formData.department) {
      setError("Please select a department")
      return false
    }
    if (!formData.year) {
      setError("Please select your year")
      return false
    }
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number")
      return false
    }
    if (formData.altPhoneNumber && !phoneRegex.test(formData.altPhoneNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit alternate phone number")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      await register(formData)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <PageContainer size="medium">
        <ScrollReveal>
          <PageHeader
            center
            eyebrow="Get started"
            title="Create Your Account"
            subtitle="Join Campus-Box and start buying/selling items"
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
        <div className="app-progress">
          <div className={`app-progress-step${step >= 1 ? " is-active" : ""}`} />
          <div className={`app-progress-step${step >= 2 ? " is-active" : ""}`} />
        </div>
        </ScrollReveal>

        <ScrollReveal delay={140}>
        <div className="app-card app-enter">
          <div className="app-card-header">
            <h2 className="app-card-title">{step === 1 ? "Email & Password" : "Personal Information"}</h2>
            <p className="app-card-desc">
              {step === 1 ? "Create secure login credentials" : "Verify your college details"}
            </p>
          </div>

          <div className="app-card-body">
            {error && (
              <div className="app-alert-error">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="app-field">
                  <label htmlFor="email" className="app-label">
                    College Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="app-input"
                  />
                  <p className="app-hint">We&apos;ll verify your college affiliation via email</p>
                </div>

                <div className="app-field">
                  <label htmlFor="password" className="app-label">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="app-input"
                  />
                </div>

                <div className="app-field">
                  <label htmlFor="confirmPassword" className="app-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="app-input"
                  />
                </div>

                <button type="button" onClick={handleNext} className="app-btn-primary app-btn-primary--block">
                  Next
                </button>
              </>
            ) : (
              <>
                <div className="app-field-row app-field-row--2">
                  <div className="app-field">
                    <label htmlFor="firstName" className="app-label">
                      First Name
                    </label>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="app-input" />
                  </div>
                  <div className="app-field">
                    <label htmlFor="lastName" className="app-label">
                      Last Name
                    </label>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="app-input" />
                  </div>
                </div>

                <div className="app-field">
                  <label htmlFor="registerNumber" className="app-label">
                    Register Number
                  </label>
                  <input id="registerNumber" name="registerNumber" value={formData.registerNumber} onChange={handleChange} className="app-input" />
                </div>

                <div className="app-field">
                  <label htmlFor="department" className="app-label">
                    Department
                  </label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange} className="app-select">
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="app-field-row app-field-row--2">
                  <div className="app-field">
                    <label htmlFor="year" className="app-label">
                      Year *
                    </label>
                    <select id="year" name="year" value={formData.year} onChange={handleChange} className="app-select">
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="app-field">
                    <label htmlFor="section" className="app-label">
                      Section
                    </label>
                    <input id="section" name="section" value={formData.section} onChange={handleChange} className="app-input" />
                  </div>
                </div>

                <div className="app-field">
                  <label htmlFor="phoneNumber" className="app-label">
                    Phone Number *
                  </label>
                  <input id="phoneNumber" name="phoneNumber" type="tel" maxLength={10} value={formData.phoneNumber} onChange={handleChange} className="app-input" />
                </div>

                <div className="app-field">
                  <label htmlFor="altPhoneNumber" className="app-label">
                    Alternate Phone Number
                  </label>
                  <input id="altPhoneNumber" name="altPhoneNumber" type="tel" maxLength={10} value={formData.altPhoneNumber} onChange={handleChange} className="app-input" />
                </div>

                <div className="app-actions-row">
                  <button type="button" onClick={() => setStep(1)} className="app-btn-outline">
                    Back
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={loading} className="app-btn-primary">
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </>
            )}

            <p className="app-form-footer">
              Already have an account?{" "}
              <Link href="/login" className="app-link">
                Login
              </Link>
            </p>
          </div>
        </div>
        </ScrollReveal>
      </PageContainer>
    </PageShell>
  )
}
