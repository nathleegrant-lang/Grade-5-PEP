"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, FileText, Search } from "lucide-react"

type SubscriptionRow = {
  id?: string
  parent_name: string | null
  parent_email: string | null
  plan_code: string | null
  amount_jmd: number | null
  method: string | null
  status: string | null
  submitted_at: string | null
  verified_at: string | null
  created_at: string | null
}

const TABLE_NAME = "payments"

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("en-JM", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return "—"

  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getExpiryDate(row: SubscriptionRow) {
  const startDate = row.verified_at || row.submitted_at || row.created_at

  if (!startDate) return "—"

  const expiry = new Date(startDate)
  const plan = row.plan_code || ""

  if (plan.includes("weekly")) {
    expiry.setDate(expiry.getDate() + 7)
  } else if (plan.includes("monthly")) {
    expiry.setMonth(expiry.getMonth() + 1)
  } else if (plan.includes("termly")) {
    expiry.setMonth(expiry.getMonth() + 3)
  } else if (plan.includes("yearly") || plan.includes("annual")) {
    expiry.setFullYear(expiry.getFullYear() + 1)
  } else {
    expiry.setMonth(expiry.getMonth() + 1)
  }

  return formatDate(expiry.toISOString())
}

function getStatusBadge(status: string | null) {
  const value = status || "unknown"

  if (value === "verified") {
    return "bg-green-100 text-green-700 border-green-200"
  }

  if (value === "pending") {
    return "bg-amber-100 text-amber-700 border-amber-200"
  }

  if (value === "rejected") {
    return "bg-red-100 text-red-700 border-red-200"
  }

  return "bg-slate-100 text-slate-700 border-slate-200"
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [loadingRows, setLoadingRows] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin/subscriptions")
      return
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    async function loadReport() {
      if (!isAuthenticated || !isAdmin) return

      setLoadingRows(true)
      setError("")

     const { data, error } = await supabase
 .from("payments")
  .select(
    "id,parent_name,parent_email,plan_code,amount_jmd,method,status,submitted_at,verified_at,created_at",
  )
  .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
        setRows([])
      } else {
        setRows(data || [])
      }

      setLoadingRows(false)
    }

    loadReport()
  }, [isAuthenticated, isAdmin, supabase])

  const filteredRows = rows.filter((row) => {
    const query = search.toLowerCase()

    return (
      row.parent_name?.toLowerCase().includes(query) ||
      row.parent_email?.toLowerCase().includes(query) ||
      row.plan_code?.toLowerCase().includes(query) ||
      row.status?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading subscription report...</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
          </Link>

          <Card className="border-sky-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-slate-800">
                        Subscription Report
                      </CardTitle>
                      <CardDescription>
                        Parents, subscription plan, payment status, and expiry
                        date.
                      </CardDescription>
                    </div>
                  </div>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search parent, email, plan..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loadingRows ? (
                <p className="text-slate-600">Loading report...</p>
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                  No subscriptions found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[950px] border-collapse bg-white text-sm">
                    <thead className="bg-slate-100 text-left text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Parent</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Plan</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Method</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Verified</th>
                        <th className="px-4 py-3 font-semibold">Expiry</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows.map((row, index) => (
                        <tr
                          key={row.id || `${row.parent_email}-${index}`}
                          className="border-t border-slate-200"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {row.parent_name || "Unknown parent"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.parent_email || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {row.plan_code || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatMoney(row.amount_jmd)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {row.method || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusBadge(
                                row.status,
                              )}`}
                            >
                              {row.status || "unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(row.verified_at)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {getExpiryDate(row)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
