"use client"

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
} from "lucide-react"
import { getPlanLabel } from "@/lib/subscriptions"

const GRADE_4_URL = "https://grade-4-pep.vercel.app/"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/language-arts", label: "Language Arts" },
  { href: "/mathematics", label: "Mathematics" },
  { href: "/science", label: "Science" },
  { href: "/social-studies", label: "Social Studies" },
  { href: "/performance-tasks", label: "Performance Tasks" },
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isPremium, isAdmin, logout } = useAuth()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <>
      <header className="bg-[#1e5b8f] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="block bg-white rounded-lg p-1">
                <Image
                  src="/images/logo.png"
                  alt="Grade 5 PEP Logo"
                  width={80}
                  height={80}
                  className="h-14 w-auto md:h-16"
                  priority
                />
              </Link>

              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Grade 5 PEP
                </h1>
                <p className="text-sky-light text-sm">
                  Jamaica Primary Exit Profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                        {isPremium ? (
                          <Crown className="h-4 w-4 text-amber-300" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <span className="hidden sm:inline">{user.childName}</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.parentName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 mt-1">
                        {isPremium ? (
                          <Crown className="h-3 w-3 text-amber-600" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
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
                        <Link
                          href="/pricing"
                          className="cursor-pointer text-amber-600"
                        >
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
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-[#1e5b8f] text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <ul className="flex flex-wrap gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-block px-4 py-2 hover:bg-sky/30 rounded-t transition-colors font-medium text-sm",
                      isActive(item.href) && "bg-sky/30",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 lg:hidden">
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
          </div>
        </div>
      </nav>
    </>
  )
}
