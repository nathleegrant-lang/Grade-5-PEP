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
import { getPlanLabel } from "@/lib/subscriptions"
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
  receipt_number: string | null
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
    receiptNumber: row.receipt_number,
    parentEmail: row.parent_email,
    parentName: row.parent_name,
  }
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
  const [cash, setCash] = useState({
    parentId: "",
    planCode: "standard_yearly" as PlanCode,
    actualAmountJmd: "30000",
    currency: "JMD",
    paidAt: new Date().toISOString().slice(0, 10),
    offlineReference: "",
    note: "",
    studentIds: "",
  })

  const callAdminAction = async (body: object) => {
    const { data } = await supabase.auth.getSession()
    const response = await fetch("/api/admin/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token || ""}`,
      },
      body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || "Payment operation failed.")
    return payload.result
  }

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
      const result = await callAdminAction({ action: "activate", paymentId: payment.id })
      setMessage(`Payment approved. Receipt ${result.receiptNumber}.`)
      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve payment.")
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

    try {
      await callAdminAction({ action: "reject", paymentId: payment.id, reason })
      setMessage("Payment rejected.")
      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reject payment.")
    } finally {
      setWorkingId(null)
    }
  }

  const handleRecordCash = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorkingId("cash")
    setMessage("")
    setError("")
    try {
      const result = await callAdminAction({
        action: "record_cash",
        ...cash,
        actualAmountJmd: Number(cash.actualAmountJmd),
        paidAt: new Date(`${cash.paidAt}T12:00:00Z`).toISOString(),
        studentIds: cash.studentIds.split(",").map((id) => id.trim()).filter(Boolean),
      })
      setMessage(`Offline Cash payment recorded and activated. Receipt ${result.receiptNumber}.`)
      setCash((value) => ({ ...value, parentId: "", offlineReference: "", note: "", studentIds: "" }))
      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record Cash payment.")
    } finally {
      setWorkingId(null)
    }
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

        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle>Record Offline Payment</CardTitle>
            <CardDescription>Exceptional administrator-only Cash recording. The reference is the permanent idempotency key.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordCash} className="grid gap-3 md:grid-cols-2">
              <input className="rounded-md border p-2" required placeholder="Parent UUID" value={cash.parentId} onChange={(e) => setCash({ ...cash, parentId: e.target.value })} />
              <select className="rounded-md border p-2" value={cash.planCode} onChange={(e) => setCash({ ...cash, planCode: e.target.value as PlanCode, actualAmountJmd: e.target.value.includes("family") ? (e.target.value.includes("yearly") ? "100000" : "10000") : (e.target.value.includes("yearly") ? "30000" : e.target.value.includes("monthly") ? "3000" : "1000") })}>
                <option value="standard_weekly">Standard Weekly</option>
                <option value="standard_monthly">Standard Monthly</option>
                <option value="standard_yearly">Standard Yearly</option>
                <option value="premium_family_monthly">Premium Family Monthly</option>
                <option value="premium_family_yearly">Premium Family Yearly</option>
              </select>
              <input className="rounded-md border p-2" required type="number" min="0" step="0.01" placeholder="Actual amount (JMD)" value={cash.actualAmountJmd} onChange={(e) => setCash({ ...cash, actualAmountJmd: e.target.value })} />
              <input className="rounded-md border p-2" required value={cash.currency} onChange={(e) => setCash({ ...cash, currency: e.target.value.toUpperCase() })} aria-label="Currency" />
              <input className="rounded-md border p-2" required type="date" value={cash.paidAt} onChange={(e) => setCash({ ...cash, paidAt: e.target.value })} />
              <input className="rounded-md border p-2" required placeholder="Unique Cash reference" value={cash.offlineReference} onChange={(e) => setCash({ ...cash, offlineReference: e.target.value })} />
              <input className="rounded-md border p-2 md:col-span-2" placeholder="Applicable student UUIDs, comma-separated" value={cash.studentIds} onChange={(e) => setCash({ ...cash, studentIds: e.target.value })} />
              <textarea className="rounded-md border p-2 md:col-span-2" placeholder="Audit note (optional)" value={cash.note} onChange={(e) => setCash({ ...cash, note: e.target.value })} />
              <Button type="submit" disabled={workingId === "cash"} className="md:col-span-2">{workingId === "cash" ? "Recording..." : "Record and Activate Cash Payment"}</Button>
            </form>
          </CardContent>
        </Card>

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
                {payment.receiptNumber && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <span className="font-medium text-emerald-900">Receipt:</span>{" "}
                    <span className="font-mono text-emerald-800">{payment.receiptNumber}</span>
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
