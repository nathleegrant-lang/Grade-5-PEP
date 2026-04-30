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

      await supabase.from("subscriptions").insert({
        parent_id: payment.parentId,
        grade: "grade5",
        plan_code: payment.planCode,
        status: "active",
        starts_at: now.toISOString(),
        expires_at: expiresAt?.toISOString() || null,
        max_students: getMaxStudents(payment.planCode),
        payment_id: payment.id,
      })

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
    <div className="min-h-screen bg-sky-50">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck /> Grade 5 Payment Management
        </h1>

        {message && <div className="text-green-600">{message}</div>}
        {error && <div className="text-red-600">{error}</div>}

        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <CardTitle>{getPlanLabel(payment.planCode)}</CardTitle>
              <CardDescription>
                {payment.parentName} • {payment.parentEmail}
              </CardDescription>
              <Badge>{payment.status}</Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>JMD ${payment.amountJmd}</div>

              {payment.rejectionReason && (
                <div className="text-red-600">
                  Rejected: {payment.rejectionReason}
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
                    className="w-full border p-2 rounded"
                  />

                  <div className="flex gap-3">
                    <Button onClick={() => handleApprove(payment)}>
                      <CheckCircle2 className="mr-1" /> Approve
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleReject(payment)}
                    >
                      <XCircle className="mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </main>

      <Footer />
    </div>
  )
}
