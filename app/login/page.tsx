"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { PageContainer, PageHeader, PageShell } from "@/components/layout/page-shell"
import { ScrollReveal } from "@/components/layout/scroll-reveal"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Please fill in all fields")
        return
      }

      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell center>
      <PageContainer size="narrow">
        <ScrollReveal>
          <PageHeader
            center
            eyebrow="Welcome back"
            title="Sign in to Campus-Box"
            subtitle="Login to your Campus-Box account"
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
        <div className="app-card app-enter">
          <div className="app-card-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="app-alert-error">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="app-field">
                <label htmlFor="email" className="app-label">
                  College Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input"
                />
              </div>

              <div className="app-field">
                <label htmlFor="password" className="app-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input"
                />
              </div>

              <button type="submit" disabled={loading} className="app-btn-primary app-btn-primary--block">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="app-form-footer">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="app-link">
                Register
              </Link>
            </p>
          </div>
        </div>
        </ScrollReveal>
      </PageContainer>
    </PageShell>
  )
}
