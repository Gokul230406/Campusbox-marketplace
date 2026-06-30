import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"

export function PageShell({
  children,
  center = false,
  className = "",
}: {
  children: ReactNode
  center?: boolean
  className?: string
}) {
  return <main className={`app-page${center ? " app-page--center" : ""} ${className}`.trim()}>{children}</main>
}

export function PageContainer({
  children,
  size = "default",
}: {
  children: ReactNode
  size?: "default" | "narrow" | "medium" | "wide"
}) {
  const sizeClass =
    size === "narrow"
      ? "app-container--narrow"
      : size === "medium"
        ? "app-container--medium"
        : size === "wide"
          ? "app-container--wide"
          : ""

  return <div className={`app-container ${sizeClass}`.trim()}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  return (
    <div className={center ? "app-page-header app-page-header--center" : "app-page-header"}>
      {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
      <h1 className="app-title">{title}</h1>
      {subtitle && <p className="app-subtitle">{subtitle}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <main className="app-loading">
      <Loader2 className="h-8 w-8 animate-spin" />
    </main>
  )
}
