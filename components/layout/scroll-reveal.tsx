"use client"

import { useEffect, useRef, type ReactNode } from "react"

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.style.transitionDelay = `${delay}ms`
          node.classList.add("is-visible")
          observer.unobserve(node)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`app-reveal ${className}`}>
      {children}
    </div>
  )
}
