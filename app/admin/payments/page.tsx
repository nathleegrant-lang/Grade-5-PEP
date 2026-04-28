"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { calculateExpiry, getPlanLabel } from "@/lib/subscriptions"
import type { PaymentRecord, PlanCode, PaymentStatus } from "@/lib/types"
import { ShieldCheck, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

type PaymentRow = {
  id: string
  parent_id: string
  grade: "grade4" | "grade5"
  plan_code: PlanCode
  amount_jmd: number
  method: string
  reference_code: string | null
  proof_url: string | null
  note: string | null
  status: PaymentStatus
  submitted_at: string
  verified_at: string | null
  rejection_reason: string | null
  parent_email: string | null
  parent_name: string | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

function mapPaymentRow(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    parentId: row.parent_id,
    grade: row.grade,
    planCode: row.plan_code,
    amountJmd: Number(row.amount_jmd),
    method: row.method,
    referenceCode: row.reference_code,
    proofUrl: row.proof_url,
    note: row.note,
    status: row.status,
    submittedAt: row.submitted_at,
    verifiedAt: row.verified_at,
    rejectionReason: row.rejection_reason,
    parentEmail: row.parent_email,
    parentName: row.parent_name,
  }
}

function getMaxStudents(planCode: PlanCode) {
  switch (planCode) {
    case "premium_family_monthly":
      return 4
    case "free":
    case "standard_weekly":
    case "standard_monthly":
    default:
      return 1
  }
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({})
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin/payments")
      return
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  const loadPayments = async () => {
    setLoadingPayments(true)
    setMessage("")
    setError("")

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("grade", "grade5")
      .order("submitted_at", { ascending: false })

    if (error) {
      setError("Could not load payment submissions.")
      setLoadingPayments(false)
      return
    }

    const normalized = ((data || []) as PaymentRow[]).map(mapPaymentRow)
    setPayments(normalized)

    const parentIds = Array.from(new Set(normalized.map((p) => p.parentId).filter(Boolean)))

    if (parentIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", parentIds)

      if (profileData) {
        const profileMap: Record<string, ProfileRow> = {}
        for (const profile of profileData as ProfileRow[]) {
          profileMap[profile.id] = profile
        }
        setProfiles(profileMap)
      }
    }

    setLoadingPayments(false)
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      void loadPayments()
    }
  }, [isLoading, isAuthenticated, isAdmin])

  const handleApprove = async (payment: PaymentRecord) => {
    const confirmed = window.confirm(
      `Approve ${getPlanLabel(payment.planCode)} for this parent?`,
    )
    if (!confirmed) return

    setWorkingId(payment.id)
    setMessage("")
    setError("")

    try {
      const now = new Date()
      const expiresAt = calculateExpiry(payment.planCode)

      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          status: "verified",
          verified_at: now.toISOString(),
          rejection_reason: null,
        })
        .eq("id", payment.id)

      if (paymentUpdateError) {
        setError(paymentUpdateError.message || "Could not approve payment.")
        return
      }

      const { error: subscriptionInsertError } = await supabase
        .from("subscriptions")
        .insert({
          parent_id: payment.parentId,
          grade: "grade5",
          plan_code: payment.planCode,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expiresAt?.toISOString() || null,
          max_students: getMaxStudents(payment.planCode),
          payment_id: payment.id,
        })

      if (subscriptionInsertError) {
        setError(subscriptionInsertError.message || "Payment approved, but subscription could not be created.")
        return
      }

      setMessage("Payment approved and Grade 5 access activated.")
      await loadPayments()
    } finally {
      setWorkingId(null)
    }
  }

  const handleReject = async (payment: PaymentRecord) => {
    const reason = window.prompt("Enter a reason for rejection:", "Rejected by admin")
    if (reason === null) return

    setWorkingId(payment.id)
    setMessage("")
    setError("")

    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          rejection_reason: reason.trim() || "Rejected by admin",
        })
        .eq("id", payment.id)

      if (error) {
        setError(error.message || "Could not reject payment.")
        return
      }

      setMessage("Payment rejected.")
      await loadPayments()
    } finally {
      setWorkingId(null)
    }
  }

  if (isLoading || loadingPayments) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading payments...</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-sky-600" />
                Grade 5 Payment Management
              </h1>
              <p className="text-slate-600 mt-1">
                Review payment submissions and activate Grade 5 access.
              </p>
            </div>

            <Button variant="outline" onClick={() => void loadPayments()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {message && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {payments.length === 0 ? (
              <Card className="border-sky-200">
                <CardContent className="p-6">
                  <p className="text-slate-500">No Grade 5 payment submissions found.</p>
                </CardContent>
              </Card>
            ) : (
              payments.map((payment) => {
                const profile = profiles[payment.parentId]

                return (
                  <Card key={payment.id} className="border-sky-200">
                    <CardHeader>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle className="text-slate-800">
                            {getPlanLabel(payment.planCode)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {profile?.full_name || payment.parentName || "Unknown parent"} • {profile?.email || payment.parentEmail || payment.parentId}
                          </CardDescription>
                        </div>

                        <Badge
                          className={
                            payment.status === "verified"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : payment.status === "rejected"
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-slate-500">Amount</p>
                          <p className="font-medium text-slate-800">
                            ${Number(payment.amountJmd).toLocaleString()} JMD
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-slate-500">Method</p>
                          <p className="font-medium text-slate-800">{payment.method}</p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-slate-500">Submitted</p>
                          <p className="font-medium text-slate-800">
                            {new Date(payment.submittedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-slate-500">Reference</p>
                          <p className="font-medium text-slate-800">
                            {payment.referenceCode || "—"}
                          </p>
                        </div>
                      </div>

                      {payment.note && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-sm text-slate-500 mb-1">Parent Note</p>
                          <p className="text-sm text-slate-700">{payment.note}</p>
                        </div>
                      )}

                      {payment.rejectionReason && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Rejection Reason:</span>{" "}
                            {payment.rejectionReason}
                          </p>
                        </div>
                      )}

                      {payment.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => void handleApprove(payment)}
                            disabled={workingId === payment.id}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {workingId === payment.id ? "Processing..." : "Approve"}
                          </Button>

                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => void handleReject(payment)}
                            disabled={workingId === payment.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
