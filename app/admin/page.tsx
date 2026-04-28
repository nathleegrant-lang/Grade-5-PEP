"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ShieldCheck, CreditCard, Tags } from "lucide-react"

export default function AdminHomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin")
      return
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading admin area...</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-sky-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Manage Grade 5 payments and pricing from one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-sky-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-slate-800">Payment Management</CardTitle>
                <CardDescription>
                  Review payment submissions, verify payments, and manage approval workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/payments">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                    Open Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-sky-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Tags className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-slate-800">Pricing Management</CardTitle>
                <CardDescription>
                  Create, edit, activate, or remove pricing plans shown on the public site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/pricing">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Open Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
