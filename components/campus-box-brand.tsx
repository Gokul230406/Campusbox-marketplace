import Link from "next/link"
import { CampusBoxIcon } from "@/components/campus-box-icon"

type CampusBoxBrandProps = {
  onClick?: () => void
}

export function CampusBoxBrand({ onClick }: CampusBoxBrandProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2.5 text-[#1a2744] transition hover:opacity-90 dark:text-[#f2efe8]"
    >
      <CampusBoxIcon className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <span className="truncate font-serif text-base leading-none tracking-tight sm:text-xl">
        Campus-Box{" "}
        <span className="site-nav-brand-subtitle hidden sm:inline">: Marketplace</span>
      </span>
    </Link>
  )
}
