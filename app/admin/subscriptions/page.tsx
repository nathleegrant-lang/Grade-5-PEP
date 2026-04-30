"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, FileText, Search, Download } from "lucide-react"

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

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-JM", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatMoney(value: number | null) {
  if (!value) return "—"
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getExpiryDate(row: SubscriptionRow) {
  const startDate = row.verified_at || row.submitted_at || row.created_at
  if (!startDate) return null

  const expiry = new Date(startDate)
  const plan = row.plan_code || ""

  if (plan.includes("weekly")) expiry.setDate(expiry.getDate() + 7)
  else if (plan.includes("monthly")) expiry.setMonth(expiry.getMonth() + 1)
  else expiry.setMonth(expiry.getMonth() + 1)

  return expiry
}

function isExpired(row: SubscriptionRow) {
  const expiry = getExpiryDate(row)
  if (!expiry) return false
  return new Date() > expiry
}

function getStatusBadge(status: string | null) {
  if (status === "verified") return "bg-green-100 text-green-700"
  if (status === "pending") return "bg-amber-100 text-amber-700"
  if (status === "rejected") return "bg-red-100 text-red-700"
  return "bg-slate-100 text-slate-700"
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin/subscriptions")
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("grade", "grade5")

      setRows((data || []) as SubscriptionRow[])
    }

    if (isAuthenticated && isAdmin) load()
  }, [isAuthenticated, isAdmin, supabase])

  const filtered = rows.filter((row) =>
    `${row.parent_name} ${row.parent_email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  // 📊 SUMMARY STATS
  const total = rows.length
  const active = rows.filter((r) => !isExpired(r)).length
  const expired = rows.filter((r) => isExpired(r)).length

  // 📥 CSV EXPORT
  function exportCSV() {
    const csv = [
      ["Parent", "Email", "Plan", "Status", "Expiry"],
      ...rows.map((r) => [
        r.parent_name,
        r.parent_email,
        r.plan_code,
        r.status,
        formatDate(getExpiryDate(r)?.toISOString() || null),
      ]),
    ]

    const blob = new Blob([csv.map((r) => r.join(",")).join("\n")])
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "subscriptions.csv"
    a.click()
  }

  if (isLoading) return null
  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-sky-50">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        {/* SUMMARY */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center">Total<br /><b>{total}</b></CardContent></Card>
          <Card><CardContent className="p-4 text-center text-green-600">Active<br /><b>{active}</b></CardContent></Card>
          <Card><CardContent className="p-4 text-center text-red-600">Expired<br /><b>{expired}</b></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-purple-600" />
              <div>
                <CardTitle>Subscription Report</CardTitle>
                <CardDescription>Full overview</CardDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded"
              />

              <Button onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>Parent</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Expiry</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, i) => {
                  const expired = isExpired(row)

                  return (
                    <tr key={i} className="border-b">
                      <td>{row.parent_name}</td>
                      <td>{row.parent_email}</td>

                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>

                      <td>
                        <span className={expired ? "text-red-600 font-semibold" : "text-green-600"}>
                          {formatDate(getExpiryDate(row)?.toISOString() || null)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
