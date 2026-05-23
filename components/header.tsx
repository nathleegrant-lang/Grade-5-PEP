"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Crown,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Home,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  ClipboardList,
  FileText,
  DollarSign,
  Info,
} from "lucide-react"
import { getPlanLabel } from "@/lib/subscriptions"

const GRADE_4_URL = "https://grade-4-pep.vercel.app/"

const navItems = [
  { href: "/",                  label: "Home",              Icon: Home          },
  { href: "/language-arts",     label: "Language Arts",     Icon: BookOpen      },
  { href: "/mathematics",       label: "Mathematics",       Icon: Calculator    },
  { href: "/science",           label: "Science",           Icon: FlaskConical  },
  { href: "/social-studies",    label: "Social Studies",    Icon: Globe         },
  { href: "/performance-tasks", label: "Performance Tasks", Icon: ClipboardList },
  { href: "/mock-tests",        label: "Mock Tests",        Icon: FileText      },
  { href: "/pricing",           label: "Pricing",           Icon: DollarSign    },
  { href: "/about",             label: "About",             Icon: Info          },
]

export function Header() {
  const pathname  = usePathname()
  const { user, isAuthenticated, isPremium, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="bg-[#1e5b8f] text-white">
        <div className="container mx-auto px-3 py-3 lg:px-4 lg:py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="block rounded-xl p-1.5 shrink-0">
                <Image
                  src="/images/Shazonique-trans-logo.png"
                  alt="Grade 5 PEP Logo"
                  width={80}
                  height={80}
                  className="h-16 w-auto lg:h-16"
                  priority
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight lg:text-3xl">
                  Grade 5 PEP
                </h1>
                <p className="text-sky-200 text-xs lg:text-sm whitespace-nowrap">
                  Jamaica Primary Exit Profile
                </p>
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-2">

              {/* Grade switchers — desktop only */}
              <div className="hidden lg:flex items-center gap-2">
                <a
                  href={GRADE_4_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
                >
                  Grade 4
                </a>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed"
                >
                  Grade 6 Soon
                </button>
              </div>

              {/* Auth area */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                        {isPremium
                          ? <Crown className="h-4 w-4 text-amber-300" />
                          : <User  className="h-4 w-4" />}
                      </div>
                      <span className="hidden sm:inline">{user.childName}</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.parentName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 mt-1">
                        {isPremium
                          ? <Crown className="h-3 w-3 text-amber-600" />
                          : <User  className="h-3 w-3" />}
                        {getPlanLabel(user.subscriptionTier)}
                      </span>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-sky-700">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {!isPremium && (
                      <DropdownMenuItem asChild>
                        <Link href="/pricing" className="cursor-pointer text-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade Access
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => void logout()}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Sign In hidden on mobile — available in drawer */}
                  <Link href="/login" className="hidden lg:block">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  {/* Sign Up always visible — primary CTA */}
                  <Link href="/register">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Hamburger — mobile only */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Desktop nav bar ────────────────────────────────────── */}
      <nav className="hidden lg:block bg-[#1e5b8f] text-white border-t border-white/10">
        <div className="container mx-auto px-4 py-1">
          <ul className="flex flex-wrap gap-1">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "inline-block px-4 py-2 rounded-t text-sm font-medium transition-colors hover:bg-white/20",
                    isActive(href) && "bg-white/20",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Mobile navigation"
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0f2d52] flex flex-col",
          "shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-[#1e5b8f]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1">
              <Image
                src="/images/logo.png"
                alt="Grade 5 PEP Logo"
                width={40}
                height={40}
                className="h-9 w-auto"
              />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Grade 5 PEP</p>
              <p className="text-sky-300 text-xs">Jamaica Primary Exit Profile</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grade switchers */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Select grade
          </p>
          <div className="flex gap-2">
            <a
              href={GRADE_4_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Grade 4
            </a>
            <span className="flex-1 text-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed select-none">
              Grade 6 Soon
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {navItems.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors",
                    "border-l-4",
                    isActive(href)
                      ? "border-amber-400 bg-white/10 text-white"
                      : "border-transparent text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isActive(href) ? "bg-amber-400/20" : "bg-white/8",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive(href) ? "text-amber-400" : "text-slate-400",
                      )}
                    />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer — auth actions */}
        <div className="px-4 py-4 border-t border-white/10">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center shrink-0">
                  {isPremium
                    ? <Crown className="h-4 w-4 text-amber-300" />
                    : <User  className="h-4 w-4 text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.childName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => void logout()}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:bg-white/15"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
