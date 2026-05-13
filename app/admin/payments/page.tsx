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
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react"

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
  return planCode === "premium_family_monthly" ? 4 : 1
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})

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

    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("grade", "grade5")
      .order("submitted_at", { ascending: false })

    const normalized = ((data || []) as PaymentRow[]).map(mapPaymentRow)
    setPayments(normalized)

    setLoadingPayments(false)
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      void loadPayments()
    }
  }, [isLoading, isAuthenticated, isAdmin])

  const handleApprove = async (payment: PaymentRecord) => {
    setWorkingId(payment.id)
    setMessage("")
    setError("")

    try {
      const now = new Date()
      const expiresAt = calculateExpiry(payment.planCode)

      await supabase
        .from("payments")
        .update({
          status: "verified",
          verified_at: now.toISOString(),
          rejection_reason: null,
        })
        .eq("id", payment.id)

      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("parent_id", payment.parentId)
        .eq("grade", "grade5")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const subscriptionPayload = {
        parent_id: payment.parentId,
        grade: "grade5" as const,
        plan_code: payment.planCode,
        status: "active" as const,
        starts_at: now.toISOString(),
        expires_at: expiresAt?.toISOString() || null,
        max_students: getMaxStudents(payment.planCode),
        payment_id: payment.id,
      }

      if (existingSubscription?.id) {
        await supabase.from("subscriptions").update(subscriptionPayload).eq("id", existingSubscription.id)
      } else {
        await supabase.from("subscriptions").insert(subscriptionPayload)
      }

      setMessage("Payment approved and access activated.")
      await loadPayments()
    } finally {
      setWorkingId(null)
    }
  }

  const handleReject = async (payment: PaymentRecord) => {
    const reason = rejectNotes[payment.id]?.trim()

    if (!reason) {
      setError("Please enter a rejection reason before rejecting.")
      return
    }

    setWorkingId(payment.id)
    setMessage("")
    setError("")

    await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
      })
      .eq("id", payment.id)

    setMessage("Payment rejected.")
    await loadPayments()
    setWorkingId(null)
  }

  if (isLoading || loadingPayments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payments...
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-sky-600" />
            Grade 5 Payment Admin
          </h1>
          <p className="text-slate-600 mt-2">
            Verify or reject payments and add comments for parents.
          </p>
        </div>

        {message && <div className="text-green-600">{message}</div>}
        {error && <div className="text-red-600">{error}</div>}

        <Card className="border-sky-200">
          <CardHeader>
            <CardTitle>Pending and recent payments</CardTitle>
            <CardDescription>
              Approve valid payments or reject submissions with a clear reason.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {payment.parentName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {payment.parentEmail}
                    </p>
                  </div>

                  <Badge
                    className={
                      payment.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : payment.status === "verified"
                        ? "bg-blue-900 text-white"
                        : ""
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-slate-500">Plan</p>
                    <p>{getPlanLabel(payment.planCode)}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p>JMD ${payment.amountJmd}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Submitted</p>
                    <p>{new Date(payment.submittedAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Reference</p>
                    <p>{payment.referenceCode}</p>
                  </div>
                </div>

                {payment.rejectionReason && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
                    Rejection Reason: {payment.rejectionReason}
                  </div>
                )}

                {payment.status === "pending" && (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Enter rejection reason"
                      value={rejectNotes[payment.id] || ""}
                      onChange={(e) =>
                        setRejectNotes({
                          ...rejectNotes,
                          [payment.id]: e.target.value,
                        })
                      }
                      className="w-full border rounded p-2"
                    />

                    <div className="flex gap-3">
                      <Button onClick={() => handleApprove(payment)}>
                        <CheckCircle2 className="mr-2" /> Approve
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleReject(payment)}
                      >
                        <XCircle className="mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
