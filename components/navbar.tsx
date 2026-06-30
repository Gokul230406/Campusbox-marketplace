"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut, Menu, User, Wallet, X } from "lucide-react"
import { CampusBoxBrand } from "@/components/campus-box-brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import "./navbar.css"

function NavLink({
  href,
  children,
  onClick,
  mobile = false,
}: {
  href: string
  children: ReactNode
  onClick?: () => void
  mobile?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={mobile ? `site-nav-mobile-link${isActive ? " is-active" : ""}` : `site-nav-link${isActive ? " is-active" : ""}`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    await logout()
    closeMenu()
    router.push("/")
  }

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <div className="site-nav-row">
          <CampusBoxBrand onClick={closeMenu} />

          <div className="site-nav-links">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/trending">Trending</NavLink>
            <NavLink href="/products">Browse</NavLink>
            {user && (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/sell">Sell</NavLink>
              </>
            )}
          </div>

          <div className="site-nav-actions">
            <ThemeToggle className="site-nav-icon-btn" />
            {user ? (
              <>
                <Link href="/wallet" className="site-nav-wallet">
                  <Wallet className="h-3.5 w-3.5" />
                  ₹{user.walletBalance}
                </Link>
                <Link href="/profile" className="site-nav-ghost-btn">
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <button type="button" className="site-nav-btn-outline" onClick={handleLogout}>
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="site-nav-btn-outline">
                  Login
                </Link>
                <Link href="/register" className="site-nav-btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="site-nav-menu-btn"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="site-nav-mobile md:hidden">
            <NavLink href="/" mobile onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink href="/trending" mobile onClick={closeMenu}>
              Trending
            </NavLink>
            <NavLink href="/products" mobile onClick={closeMenu}>
              Browse
            </NavLink>
            {user && (
              <>
                <NavLink href="/dashboard" mobile onClick={closeMenu}>
                  Dashboard
                </NavLink>
                <NavLink href="/sell" mobile onClick={closeMenu}>
                  Sell Items
                </NavLink>
                <NavLink href="/profile" mobile onClick={closeMenu}>
                  Profile
                </NavLink>
                <NavLink href="/wallet" mobile onClick={closeMenu}>
                  Wallet · ₹{user.walletBalance}
                </NavLink>
              </>
            )}
            <div className="site-nav-mobile-actions">
              <ThemeToggle className="site-nav-icon-btn" />
              {user ? (
                <button type="button" className="site-nav-btn-outline flex-1" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="site-nav-btn-outline flex-1 text-center" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link href="/register" className="site-nav-btn-primary flex-1 text-center" onClick={closeMenu}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
