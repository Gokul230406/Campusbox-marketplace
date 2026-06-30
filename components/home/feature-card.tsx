import type { LucideIcon } from "lucide-react"

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="home-feature-card">
      <Icon className="mb-4 h-10 w-10 text-[var(--home-gold)]" strokeWidth={1.5} />
      <h3 className="font-serif text-xl text-[var(--home-ink)]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">{description}</p>
    </div>
  )
}
