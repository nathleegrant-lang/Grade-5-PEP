"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { PlusCircle, Save, Trash2, RefreshCw, ShieldCheck } from "lucide-react"

type PricingPlanRow = {
  id: string
  code: "free" | "standard_weekly" | "standard_monthly" | "standard_yearly" | "premium_family_monthly" | "premium_family_yearly"
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
  created_at?: string
  updated_at?: string
}

type FormState = {
  code: "free" | "standard_weekly" | "standard_monthly" | "standard_yearly" | "premium_family_monthly" | "premium_family_yearly"
  grade: "grade4" | "grade5"
  name: string
  price_jmd: string
  period: string
  description: string
  featuresText: string
  max_students: string
  badge_text: string
  popular: boolean
  is_active: boolean
}

const emptyForm: FormState = {
  code: "free",
  grade: "grade5",
  name: "",
  price_jmd: "0",
  period: "",
  description: "",
  featuresText: "",
  max_students: "1",
  badge_text: "",
  popular: false,
  is_active: true,
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

export default function AdminPricingPage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  const [plans, setPlans] = useState<PricingPlanRow[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin/pricing")
      return
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  const loadPlans = async () => {
    setLoadingPlans(true)
    setError("")

    const { data, error } = await supabase
      .from("pricing_plans")
      .select(
        "id, code, grade, name, price_jmd, period, description, features, max_students, badge_text, popular, is_active, created_at, updated_at",
      )
      .eq("grade", "grade5")
      .order("price_jmd", { ascending: true })

    if (error) {
      setError("Could not load pricing plans.")
      setLoadingPlans(false)
      return
    }

    setPlans((data as PricingPlanRow[]) ?? [])
    setLoadingPlans(false)
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      void loadPlans()
    }
  }, [isLoading, isAuthenticated, isAdmin])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setMessage("")
    setError("")
  }

  const startEdit = (plan: PricingPlanRow) => {
    setEditingId(plan.id)
    setForm({
      code: plan.code,
      grade: plan.grade,
      name: plan.name,
      price_jmd: String(plan.price_jmd),
      period: plan.period,
      description: plan.description || "",
      featuresText: normalizeFeatures(plan.features).join("\n"),
      max_students: String(plan.max_students),
      badge_text: plan.badge_text || "",
      popular: plan.popular,
      is_active: plan.is_active,
    })
    setMessage("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    try {
      if (!form.name || !form.period || !form.code) {
        setError("Please complete the required fields.")
        return
      }

      const features = form.featuresText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)

      const payload = {
        code: form.code,
        grade: form.grade,
        name: form.name.trim(),
        price_jmd: Number(form.price_jmd || 0),
        period: form.period.trim(),
        description: form.description.trim() || null,
        features,
        max_students: Number(form.max_students || 1),
        badge_text: form.badge_text.trim() || null,
        popular: form.popular,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from("pricing_plans")
          .update(payload)
          .eq("id", editingId)

        if (error) {
          setError(error.message || "Could not update pricing plan.")
          return
        }

        setMessage("Pricing plan updated successfully.")
      } else {
        const { error } = await supabase.from("pricing_plans").insert(payload)

        if (error) {
          setError(error.message || "Could not create pricing plan.")
          return
        }

        setMessage("Pricing plan created successfully.")
      }

      await loadPlans()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this pricing plan?")
    if (!confirmed) return

    setDeletingId(id)
    setMessage("")
    setError("")

    try {
      const { error } = await supabase.from("pricing_plans").delete().eq("id", id)

      if (error) {
        setError(error.message || "Could not delete pricing plan.")
        return
      }

      if (editingId === id) {
        resetForm()
      }

      setMessage("Pricing plan deleted.")
      await loadPlans()
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading || loadingPlans) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading pricing admin...</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-sky-600" />
                Grade 5 Pricing Manager
              </h1>
              <p className="text-slate-600 mt-1">
                Manage the pricing plans shown on the public pricing and checkout pages.
              </p>
            </div>

            <Button variant="outline" onClick={() => void loadPlans()} className="w-full md:w-auto">
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

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  {editingId ? "Edit Pricing Plan" : "Create Pricing Plan"}
                </CardTitle>
                <CardDescription>
                  One feature per line in the features box.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Plan Code</Label>
                      <select
                        id="code"
                        value={form.code}
                        onChange={(e) => setField("code", e.target.value as FormState["code"])}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        disabled={saving || !!editingId}
                      >
                        <option value="free">free</option>
                        <option value="standard_weekly">standard_weekly</option>
                        <option value="standard_monthly">standard_monthly</option>
                        <option value="standard_yearly">standard_yearly</option>
                        <option value="premium_family_monthly">premium_family_monthly</option>
                        <option value="premium_family_yearly">premium_family_yearly</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <select
                        id="grade"
                        value={form.grade}
                        onChange={(e) => setField("grade", e.target.value as FormState["grade"])}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        disabled={saving}
                      >
                        <option value="grade5">grade5</option>
                        <option value="grade4">grade4</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Standard Weekly"
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_jmd">Price (JMD)</Label>
                      <Input
                        id="price_jmd"
                        type="number"
                        min="0"
                        value={form.price_jmd}
                        onChange={(e) => setField("price_jmd", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="period">Period</Label>
                      <Input
                        id="period"
                        value={form.period}
                        onChange={(e) => setField("period", e.target.value)}
                        placeholder="per month"
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_students">Max Students</Label>
                      <Input
                        id="max_students"
                        type="number"
                        min="1"
                        value={form.max_students}
                        onChange={(e) => setField("max_students", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge_text">Badge Text</Label>
                    <Input
                      id="badge_text"
                      value={form.badge_text}
                      onChange={(e) => setField("badge_text", e.target.value)}
                      placeholder="Popular"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Short summary of the plan"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Features</Label>
                    <Textarea
                      id="features"
                      rows={8}
                      value={form.featuresText}
                      onChange={(e) => setField("featuresText", e.target.value)}
                      placeholder={"Full Grade 5 access\nUnlimited quizzes and mock tests"}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={form.popular}
                        onChange={(e) => setField("popular", e.target.checked)}
                        disabled={saving}
                      />
                      <span className="text-sm text-slate-700">Mark as popular</span>
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setField("is_active", e.target.checked)}
                        disabled={saving}
                      />
                      <span className="text-sm text-slate-700">Active on public pages</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-900 text-white"
                      disabled={saving}
                    >
                      {editingId ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Saving..." : "Update Plan"}
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {saving ? "Creating..." : "Create Plan"}
                        </>
                      )}
                    </Button>

                    <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Existing Plans</CardTitle>
                <CardDescription>
                  Edit, review, or remove pricing plans already in the database.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {plans.length === 0 ? (
                  <p className="text-sm text-slate-500">No pricing plans found.</p>
                ) : (
                  plans.map((plan) => {
                    const features = normalizeFeatures(plan.features)

                    return (
                      <div
                        key={plan.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-800">{plan.name}</h3>
                              <Badge variant="secondary">{plan.grade}</Badge>
                              <Badge variant="outline">{plan.code}</Badge>
                              {plan.popular && <Badge className="bg-amber-500 text-white">Popular</Badge>}
                              {!plan.is_active && <Badge variant="destructive">Inactive</Badge>}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(plan)}>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => void handleDelete(plan.id)}
                              disabled={deletingId === plan.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deletingId === plan.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                            <p className="text-slate-500">Price</p>
                            <p className="font-medium text-slate-800">
                              {plan.price_jmd === 0 ? "Free" : `$${Number(plan.price_jmd).toLocaleString()} JMD`}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                            <p className="text-slate-500">Period</p>
                            <p className="font-medium text-slate-800">{plan.period}</p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                            <p className="text-slate-500">Max Students</p>
                            <p className="font-medium text-slate-800">{plan.max_students}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Features</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                            {features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
