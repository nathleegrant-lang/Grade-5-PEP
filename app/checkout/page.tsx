"use client"

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { PRICING_TIERS, type PlanCode, type PricingTier } from "@/lib/types"
import { Crown, ArrowLeft, Landmark, MessageCircleMore, ShieldCheck } from "lucide-react"
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/site-config"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type PendingPayment = {
  id: string
  status: "pending"
  submitted_at: string
  plan_code: PlanCode
  reference_code: string | null
}

type ActiveSubscription = {
  id: string
  status: "active"
  expires_at: string | null
  max_students: number
}

type PricingPlanRow = {
  code: PlanCode
  grade: "grade4" | "grade5"
  name: string
  price_jmd: number
  period: string
  description: string | null
  features: unknown
  max_students: number
  badge_text: string | null
  popular: boolean
  is_active: boolean
}

function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : []
    } catch {
      return []
    }
  }

  return []
}

function mapPlanRowToTier(row: PricingPlanRow): PricingTier {
  return {
    id: row.code,
    name: row.name,
    priceJMD: Number(row.price_jmd),
    period: row.period,
    description: row.description || "",
    features: normalizeFeatures(row.features),
    popular: row.popular,
    maxStudents: row.max_students,
    badgeText: row.badge_text,
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [referenceCode, setReferenceCode] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null)
  const [plan, setPlan] = useState<PricingTier | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

  const hasPendingPayment = Boolean(pendingPayment)
  const hasActiveSubscription = Boolean(activeSubscription)
  const formLocked = submitting || checkingStatus || hasPendingPayment

  const planId = searchParams.get("plan") as PlanCode | null

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        setPlan(null)
        setLoadingPlan(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("pricing_plans")
          .select(
            "code, grade, name, price_jmd, period, description, features, max_students, badge_text, popular, is_active",
          )
          .eq("grade", "grade5")
          .eq("code", planId)
          .eq("is_active", true)
          .maybeSingle()

        if (error) {
          console.error("Could not load checkout plan:", error)
        }

        if (data) {
          setPlan(mapPlanRowToTier(data as PricingPlanRow))
          return
        }

        const fallbackPlan =
          PRICING_TIERS.find((tier) => tier.id === planId) ?? null
        setPlan(fallbackPlan)
      } catch (err) {
        console.error("Unexpected checkout plan load error:", err)
        const fallbackPlan =
          PRICING_TIERS.find((tier) => tier.id === planId) ?? null
        setPlan(fallbackPlan)
      } finally {
        setLoadingPlan(false)
      }
    }

    void loadPlan()
  }, [planId, supabase])

  const getExistingSubmissionState = async (parentId: string) => {
    const [
      { data: pendingData, error: pendingError },
      { data: subscriptionData, error: subscriptionError },
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("id, status, submitted_at, plan_code, reference_code")
        .eq("parent_id", parentId)
        .eq("grade", "grade5")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("id, status, expires_at, max_students")
        .eq("parent_id", parentId)
        .eq("grade", "grade5")
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (pendingError) {
      console.error("Could not load pending payment:", pendingError)
    }

    if (subscriptionError) {
      console.error("Could not load active subscription:", subscriptionError)
    }

    const validActiveSubscription =
      subscriptionData?.expires_at &&
      new Date(subscriptionData.expires_at) > new Date()
        ? (subscriptionData as ActiveSubscription)
        : null

    return {
      pendingPayment: (pendingData as PendingPayment | null) ?? null,
      activeSubscription: validActiveSubscription,
    }
  }

  const loadSubmissionState = async () => {
    if (!user) {
      setPendingPayment(null)
      setActiveSubscription(null)
      setCheckingStatus(false)
      return
    }

    setCheckingStatus(true)
    const result = await getExistingSubmissionState(user.id)
    setPendingPayment(result.pendingPayment)
    setActiveSubscription(result.activeSubscription)
    setCheckingStatus(false)
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/register?plan=${planId ?? ""}`)
      return
    }

    if (!isLoading && isAuthenticated && user) {
      void loadSubmissionState()
    }
  }, [isLoading, isAuthenticated, user, planId, router])

  const handleSubmitPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user || !plan || plan.id === "free") return

    setSubmitting(true)
    setError("")
    setSuccess("")

    const latestState = await getExistingSubmissionState(user.id)
    setPendingPayment(latestState.pendingPayment)
    setActiveSubscription(latestState.activeSubscription)

    if (latestState.pendingPayment) {
      setError(
        "Your payment submission has already been received and is awaiting verification.",
      )
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from("payments").insert({
  parent_id: user.id,
  grade: "grade5",
  plan_code: plan.id,
  amount_jmd: plan.priceJMD,
  method: "bank_transfer",
  reference_code: referenceCode || null,
  note: note || null,
  status: "pending",
  parent_name: user.parentName,
  parent_email: user.email,
})

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You already have a payment submission awaiting verification.")
      } else {
        setError(
          "We couldn’t submit your payment details right now. Please try again or contact support on WhatsApp.",
        )
      }
      setSubmitting(false)
      return
    }

    await loadSubmissionState()
    await refreshUser()

    setSuccess(
      "Your payment submission was received. We will verify it and activate your Grade 5 access after confirmation.",
    )
    setSubmitting(false)
  }

  if (isLoading || loadingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!plan || plan.id === "free") {
    router.push("/pricing")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <Link href="/pricing">
          <Button variant="ghost" className="mb-6 text-slate-700 hover:text-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-sky-200 shadow-lg">
            <CardHeader className="text-center border-b">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">
                PEP PRACTICE — Grade 5 Payment
              </CardTitle>
              <CardDescription>
                {plan.name} for {user?.childName ?? "your student"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Plan Summary</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">{plan.name}</span>
                  <span className="font-medium text-slate-800">
                    ${plan.priceJMD.toLocaleString()} JMD
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Coverage</span>
                  <span>
                    Up to {plan.maxStudents} student{plan.maxStudents === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">
                      Admin approval activates access
                    </p>
                    <p className="text-sm text-slate-600">
                      Contact us on WhatsApp to receive payment instructions securely,
                      then submit your payment reference on this page. Once approved,
                      your subscription start date and expiry date are set automatically.
                    </p>
                  </div>
                </div>
              </div>

              {hasPendingPayment && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-slate-800 mb-1">
                    Payment already submitted
                  </p>
                  <p className="text-sm text-slate-600">
                    Your payment submission has already been received and is awaiting verification.
                    Please wait for confirmation before sending another one.
                  </p>
                  {pendingPayment?.reference_code && (
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="font-medium text-slate-700">Reference:</span>{" "}
                      {pendingPayment.reference_code}
                    </p>
                  )}
                </div>
              )}

              {hasActiveSubscription && (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-emerald-600 bg-emerald-100 p-5 shadow-md">
                    <p className="text-lg font-extrabold text-emerald-900 mb-2">
                      Access currently active
                    </p>
                    <p className="text-sm text-emerald-900">
                      Your Grade 5 access is already active.
                      {activeSubscription?.expires_at && (
                        <>
                          {" "}It is active until{" "}
                          <span className="font-bold">
                            {new Date(activeSubscription.expires_at).toLocaleDateString()}
                          </span>.
                        </>
                      )}
                    </p>
                  </div>

                </div>
              )}
              <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-sky-100 bg-white p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Landmark className="h-5 w-5 text-sky-600" />
                        <h4 className="font-semibold text-slate-800">Step 1</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Contact us on WhatsApp to receive the payment instructions securely.
                      </p>
                    </div>

                    <div className="rounded-xl border border-sky-100 bg-white p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-5 w-5 text-sky-600" />
                        <h4 className="font-semibold text-slate-800">Step 2</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Make the payment, then record the transfer reference, deposit slip number,
                        or any note that will help you match it later.
                      </p>
                    </div>

                    <div className="rounded-xl border border-sky-100 bg-white p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircleMore className="h-5 w-5 text-sky-600" />
                        <h4 className="font-semibold text-slate-800">Step 3</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        Submit the reference below and optionally send your receipt by WhatsApp.
                      </p>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-sky-700 hover:underline"
                      >
                        WhatsApp: {WHATSAPP_DISPLAY}
                      </a>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmitPayment}
                    className={`space-y-4 ${formLocked ? "opacity-60" : ""}`}
                  >
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                        {success}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="referenceCode">
                        Payment reference or deposit slip number
                      </Label>
                      <Input
                        id="referenceCode"
                        value={referenceCode}
                        onChange={(e) => setReferenceCode(e.target.value)}
                        placeholder="Enter your transfer or receipt reference"
                        disabled={formLocked}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note">Optional note</Label>
                      <Textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add any helpful note for payment verification"
                        rows={4}
                        disabled={formLocked}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/pricing" className="flex-1">
                        <Button variant="outline" className="w-full">
                          Choose Another Plan
                        </Button>
                      </Link>

                      <Button
                        type="submit"
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white"
                        disabled={formLocked}
                      >
                        {checkingStatus
                          ? "Checking status..."
                          : hasPendingPayment
                          ? "Awaiting Verification"
                          : submitting
                          ? "Submitting..."
                          : "Submit Payment Details"}
                      </Button>
                    </div>
                  </form>
              </>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
