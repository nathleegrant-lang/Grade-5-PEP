"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X, User, LogOut, Crown } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/language-arts", label: "Language Arts" },
  { href: "/mathematics", label: "Mathematics" },
  { href: "/science", label: "Science" },
  { href: "/social-studies", label: "Social Studies" },
  { href: "/writing-practice", label: "Writing" },
  { href: "/full-mock-exam", label: "Mock Exam" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isPremium, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="w-full">
      {/* Top banner with logo */}
      <div className="bg-white py-3 px-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Grade 5 PEP Logo"
              width={100}
              height={80}
              className="w-[100px] h-20 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">Grade 5 PEP</h1>
              <p className="text-sm text-[#0d9488]">Jamaica Primary Exit Profile</p>
            </div>
          </Link>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0d9488] rounded-full flex items-center justify-center text-white">
                      {user.childName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.childName}</span>
                    {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {!isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex items-center gap-2 cursor-pointer text-amber-600">
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#0d9488] hover:bg-[#0d7a6f]">Sign Up Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-[#0d4a5f] text-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 hover:bg-[#1a6b85] transition-colors text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="text-sm font-medium">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-[#1a6b85] rounded"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <ul className="md:hidden pb-4">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2 hover:bg-[#1a6b85] transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-white/20 mt-2 pt-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 hover:bg-[#1a6b85] transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#1a6b85] transition-colors text-sm text-red-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-[#1a6b85] transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-[#1a6b85] transition-colors text-sm text-amber-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}
