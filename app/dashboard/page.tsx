"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardContent from "@/components/dashboard-content"
import { PageLoading } from "@/components/layout/page-shell"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) return <PageLoading />

  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardContent user={user} />
    </Suspense>
  )
}
