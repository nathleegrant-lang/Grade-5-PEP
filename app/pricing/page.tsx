"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  PRICING_TIERS,
  FREE_EXCLUDED_FEATURES,
  type PlanCode,
  type PricingTier,
} from "@/lib/types"
import { Check, X, Landmark, Mail, Shield, Users } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

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

const SUPPORT_EMAIL = "shazincorps@gmail.com"

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

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [selectedPlan, setSelectedPlan] = useState<PlanCode | null>(null)
  const [tiers, setTiers] = useState<PricingTier[]>(PRICING_TIERS)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  useEffect(() => {
    const loadPricingPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("pricing_plans")
          .select(
            "code, grade, name, price_jmd, period, description, features, max_students, badge_text, popular, is_active",
          )
          .eq("grade", "grade5")
          .eq("is_active", true)
          .order("price_jmd", { ascending: true })

        if (error) {
          console.error("Could not load pricing plans:", error)
          return
        }

        if (data && data.length > 0) {
          setTiers((data as PricingPlanRow[]).map(mapPlanRowToTier))
        }
      } catch (err) {
        console.error("Unexpected pricing load error:", err)
      } finally {
        setIsLoadingPlans(false)
      }
    }

    void loadPricingPlans()
  }, [supabase])

  const handleSelectPlan = (planId: PlanCode) => {
    setSelectedPlan(planId)

    if (planId === "free") {
      router.push(isAuthenticated ? "/dashboard" : "/register")
      return
    }

    if (!isAuthenticated) {
      router.push(`/register?plan=${planId}`)
      return
    }

    router.push(`/checkout?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">PEP PRACTICE — Grade 5 Pricing</h1>
          <p className="text-lg text-slate-600">
            Each Grade 5 plan is sold separately and applies to this Grade 5 programme only.
            It does not include Grade 4 or future Grade 6 access.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-amber-300 bg-amber-50 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-slate-700 font-medium">
                Free = sample access only. Paid access starts after payment verification.
              </p>
            </CardContent>
          </Card>
        </div>

        {!isAuthenticated && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg text-center">
            <p className="text-sky-800">
              Please{" "}
              <Link href="/login" className="font-semibold text-sky-700 hover:underline">
                sign in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-semibold text-sky-700 hover:underline">
                create an account
              </Link>{" "}
              before selecting a paid Grade 5 plan.
            </p>
          </div>
        )}

        {isLoadingPlans ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <p className="text-slate-600">Loading pricing plans...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-6xl mx-auto">
            {tiers.map((tier) => {
              const isCurrent = user?.subscriptionTier === tier.id

              return (
                <Card
                  key={tier.id}
                  className={`relative border-2 ${
                    tier.popular ? "border-amber-400 shadow-xl" : "border-sky-200"
                  }`}
                >
                  {tier.badgeText && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-white border-0 px-3 py-1">
                        {tier.badgeText}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2 pt-6">
                    <CardTitle className="text-xl text-slate-800">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-slate-800">
                          {tier.priceJMD === 0 ? "Free" : `$${tier.priceJMD.toLocaleString()}`}
                        </span>
                      </div>

                      {tier.priceJMD > 0 && (
                        <p className="text-sm text-slate-500 mt-1">JMD {tier.period}</p>
                      )}

                      <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        Up to {tier.maxStudents} student{tier.maxStudents === 1 ? "" : "s"}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}

                      {tier.id === "free" &&
                        FREE_EXCLUDED_FEATURES.map((feature, index) => (
                          <li key={`excluded-${index}`} className="flex items-start gap-2">
                            <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-400 line-through">{feature}</span>
                          </li>
                        ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(tier.id)}
                      disabled={selectedPlan === tier.id || isCurrent}
                      className={`w-full ${
                        tier.popular
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : tier.id === "premium_family_monthly" || tier.id === "premium_family_yearly"
                          ? "bg-sky-600 hover:bg-sky-700 text-white"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      }`}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : tier.id === "free"
                        ? isAuthenticated
                          ? "Go to Dashboard"
                          : "Start Free Practice"
                        : `Choose ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-sky-200 bg-sky-50/70">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-800 text-center mb-6">
                How payment works
              </h3>

              <div className="grid md:grid-cols-3 gap-5">
                <div className="rounded-xl bg-white p-5 border border-sky-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Landmark className="h-5 w-5 text-sky-600" />
                    <p className="font-semibold text-slate-800">Secure payment instructions</p>
                  </div>

                  <div className="text-sm text-slate-600 space-y-2">
                    <p>
                      Bank transfer details are shared only after plan selection or direct support
                      confirmation.
                    </p>
                    <p>
                      For security, banking details are not displayed publicly on this page.
                    </p>
                    <p>
                      Please choose a plan and continue to checkout, or email us for payment
                      assistance.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-sky-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-sky-600" />
                    <p className="font-semibold text-slate-800">Submit payment</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Create your free account, select a plan, then submit your payment reference on
                    the checkout page. Admin approval activates access automatically.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-5 border border-sky-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-sky-600" />
                    <p className="font-semibold text-slate-800">Email support</p>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    For payment guidance, receipt submission, and account support, please email your
                    receipt along with your child&apos;s name, grade, and selected plan.
                  </p>

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sm font-semibold text-sky-700 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
