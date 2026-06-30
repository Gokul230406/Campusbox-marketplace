import type { SVGProps } from "react"

export function CampusBoxIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M32 6L56 18L32 30L8 18L32 6Z" fill="currentColor" />
      <path d="M8 18V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="26" r="2" fill="currentColor" />
      <path d="M18 30L32 37L32 56L18 49V30Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M32 37L46 30V49L32 56V37Z" fill="currentColor" fillOpacity="0.7" />
      <path d="M18 30L32 23L46 30L32 37L18 30Z" fill="currentColor" fillOpacity="0.55" />
    </svg>
  )
}
