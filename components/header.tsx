"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Crown, User, LogOut, LayoutDashboard, ShieldCheck, Menu, X, Home, BookOpen, Calculator, FlaskConical, Globe, ClipboardList, FileText, DollarSign, Info } from "lucide-react"
import { getPlanLabel } from "@/lib/subscriptions"

const GRADE_4_URL = "https://grade-4-pep.vercel.app/"
const BRAND_LOGO = "/images/pep-practice-grade5-primary.jpg"
const navItems = [
  { href: "/", label: "Home", Icon: Home }, { href: "/language-arts", label: "Language Arts", Icon: BookOpen }, { href: "/mathematics", label: "Mathematics", Icon: Calculator }, { href: "/science", label: "Science", Icon: FlaskConical }, { href: "/social-studies", label: "Social Studies", Icon: Globe }, { href: "/performance-tasks", label: "Performance Tasks", Icon: ClipboardList }, { href: "/mock-tests", label: "Mock Tests", Icon: FileText }, { href: "/pricing", label: "Pricing", Icon: DollarSign }, { href: "/about", label: "About", Icon: Info },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isPremium, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { setMobileOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [mobileOpen])
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  return <>
    <header className="border-b border-slate-200 bg-white text-[#102f57]">
      <div className="container mx-auto px-3 py-2 lg:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link href="/" className="block min-w-0 shrink" aria-label="PEP PRACTICE Grade 5 home">
            <Image src={BRAND_LOGO} alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence" width={700} height={251} className="h-auto w-[132px] object-contain min-[390px]:w-[145px] sm:h-[86px] sm:w-auto" priority />
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex items-center gap-2"><a href={GRADE_4_URL} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Grade 4</a><button type="button" disabled className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">Grade 6 Soon</button></div>
            {isAuthenticated && user ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="flex items-center gap-2 px-2 text-[#102f57] hover:bg-slate-100"><div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">{isPremium ? <Crown className="h-4 w-4 text-amber-300" /> : <User className="h-4 w-4" />}</div><span className="hidden sm:inline">{user.childName}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64"><div className="px-2 py-1.5"><p className="text-sm font-medium">{user.parentName}</p><p className="text-xs text-slate-500">{user.email}</p><span className="inline-flex items-center gap-1 text-xs text-slate-600 mt-1">{isPremium ? <Crown className="h-3 w-3 text-amber-600" /> : <User className="h-3 w-3" />}{getPlanLabel(user.subscriptionTier)}</span></div><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>{isAdmin && <DropdownMenuItem asChild><Link href="/admin" className="text-blue-700"><ShieldCheck className="mr-2 h-4 w-4" />Admin Dashboard</Link></DropdownMenuItem>}{!isPremium && <DropdownMenuItem asChild><Link href="/pricing" className="text-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Link></DropdownMenuItem>}<DropdownMenuSeparator /><DropdownMenuItem onClick={() => void logout()} className="text-red-600"><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <div className="hidden sm:flex items-center gap-2"><Link href="/login"><Button variant="ghost" size="sm" className="text-[#102f57]">Sign In</Button></Link><Link href="/register"><Button size="sm" className="bg-amber-400 text-[#102f57] hover:bg-amber-500">Create Account</Button></Link></div>}
            <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)} className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-slate-100">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {!isAuthenticated && <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-2 sm:hidden"><Link href="/login"><Button variant="ghost" size="sm" className="text-[#102f57]">Sign In</Button></Link><Link href="/register"><Button size="sm" className="bg-amber-400 text-[#102f57] hover:bg-amber-500">Create Account</Button></Link></div>}
      </div>
    </header>
    <nav className="hidden lg:block border-b border-[#0b5963] bg-[#0b3555] text-white shadow-sm"><div className="container mx-auto px-4 py-1"><ul className="flex flex-wrap gap-1">{navItems.map(({href,label}) => <li key={href}><Link href={href} className={cn("inline-block rounded px-4 py-2 text-sm font-medium hover:bg-[#0d6f70]", isActive(href) && "bg-[#0d6f70]")}>{label}</Link></li>)}</ul></div></nav>
    <div aria-hidden onClick={() => setMobileOpen(false)} className={cn("fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden", mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} />
    <aside aria-label="Mobile navigation" className={cn("fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0b3555] flex flex-col shadow-2xl transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-white"><Image src={BRAND_LOGO} alt="PEP PRACTICE Grade 5" width={700} height={251} className="h-14 w-auto object-contain" /><button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-md text-[#102f57]"><X className="h-5 w-5" /></button></div>
      <div className="px-4 py-3 border-b border-white/10"><p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Select grade</p><div className="flex gap-2"><a href={GRADE_4_URL} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Grade 4</a><span className="flex-1 text-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-400">Grade 6 Soon</span></div></div>
      <nav className="flex-1 overflow-y-auto py-2"><ul>{navItems.map(({href,label,Icon}) => <li key={href}><Link href={href} className={cn("flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-l-4", isActive(href) ? "border-amber-400 bg-[#0d6f70] text-white" : "border-transparent text-slate-300 hover:bg-white/10 hover:text-white")}><span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", isActive(href) ? "bg-amber-400/20" : "bg-white/10")}><Icon className={cn("h-4 w-4", isActive(href) ? "text-amber-400" : "text-slate-400")} /></span>{label}</Link></li>)}</ul></nav>
      <div className="px-4 py-4 border-t border-white/10">{isAuthenticated && user ? <div className="space-y-2"><div className="flex items-center gap-3 px-2 py-1.5"><div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">{isPremium ? <Crown className="h-4 w-4 text-amber-300" /> : <User className="h-4 w-4 text-white" />}</div><div className="min-w-0"><p className="text-sm font-medium text-white truncate">{user.childName}</p><p className="text-xs text-slate-400 truncate">{user.email}</p></div></div><button onClick={() => void logout()} className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400"><LogOut className="h-4 w-4" />Sign Out</button></div> : <div className="flex gap-2"><Link href="/login" className="flex-1"><Button variant="outline" className="w-full border-white/20 bg-white/5 text-white">Sign In</Button></Link><Link href="/register" className="flex-1"><Button className="w-full bg-amber-400 text-[#102f57]">Create Account</Button></Link></div>}</div>
    </aside>
  </>
}
