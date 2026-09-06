"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type {
  RegisterResult,
  StudentRecord,
  SubscriptionRecord,
  User,
  PlanCode,
  AuthState,
} from "@/lib/types"
import { isPaymentAccessActive, isSubscriptionActive } from "@/lib/subscriptions"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<RegisterResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  addStudent: (childName: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  parentName: string
  childName: string
  email: string
  phone?: string
  password: string
}

interface SupabaseProfileRow {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: "admin" | "parent"
  created_at: string
}

interface SupabaseStudentRow {
  id: string
  full_name: string
  grade_level: number
  subscription_id: string | null
  created_at: string
}


interface SupabasePaymentRow {
  id: string
  parent_id: string
  grade: "grade4" | "grade5"
  plan_code: PlanCode
  amount_jmd: number
  method: string
  reference_code: string | null
  proof_url: string | null
  note: string | null
  status: "pending" | "verified" | "rejected" | "expired"
  submitted_at: string
  verified_at: string | null
  rejection_reason: string | null
}

interface SupabaseSubscriptionRow {
  id: string
  parent_id: string
  grade: "grade4" | "grade5"
  plan_code: PlanCode
  status: "pending" | "active" | "expired" | "cancelled" | "suspended"
  starts_at: string | null
  expires_at: string | null
  max_students: number
  payment_id: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const PENDING_CHILD_PREFIX = "grade5_pending_child_"

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapStudent = (row: SupabaseStudentRow): StudentRecord => ({
    id: row.id,
    fullName: row.full_name,
    gradeLevel: row.grade_level,
    subscriptionId: row.subscription_id,
    createdAt: row.created_at,
  })

  const mapSubscription = (row: SupabaseSubscriptionRow | null): SubscriptionRecord | null => {
    if (!row) return null
    return {
      id: row.id,
      parentId: row.parent_id,
      grade: row.grade,
      planCode: row.plan_code,
      status: row.status,
      startsAt: row.starts_at,
      expiresAt: row.expires_at,
      maxStudents: row.max_students,
      paymentId: row.payment_id,
    }
  }


  const mapPayment = (row: SupabasePaymentRow | null) => {
    if (!row) return null
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
    }
  }
  const persistPendingChild = (email: string, childName: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem(`${PENDING_CHILD_PREFIX}${email.toLowerCase()}`, childName)
  }

  const readPendingChild = (email: string) => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(`${PENDING_CHILD_PREFIX}${email.toLowerCase()}`)
  }

  const clearPendingChild = (email: string) => {
    if (typeof window === "undefined") return
    localStorage.removeItem(`${PENDING_CHILD_PREFIX}${email.toLowerCase()}`)
  }

  const loadUser = async (session: Session | null) => {
    try {
      if (!session?.user) {
        setUser(null)
        setStudents([])
        setActiveSubscription(null)
        return
      }

      const authUser = session.user

      const [
        { data: profile, error: profileError },
        { data: subscriptionRows, error: subscriptionError },
        { data: studentRows, error: studentError },
        { data: paymentRows, error: paymentError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, phone, role, created_at")
          .eq("id", authUser.id)
          .maybeSingle<SupabaseProfileRow>(),
        supabase
          .from("subscriptions")
          .select("id, parent_id, grade, plan_code, status, starts_at, expires_at, max_students, payment_id")
          .eq("parent_id", authUser.id)
          .eq("grade", "grade5")
          .in("status", ["active", "pending"])
          .order("starts_at", { ascending: false }),
        supabase
          .from("students")
          .select("id, full_name, grade_level, subscription_id, created_at")
          .eq("parent_id", authUser.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("payments")
          .select("id, parent_id, grade, plan_code, amount_jmd, method, reference_code, proof_url, note, status, submitted_at, verified_at, rejection_reason")
          .eq("parent_id", authUser.id)
          .eq("grade", "grade5")
          .eq("status", "verified")
          .order("verified_at", { ascending: false, nullsFirst: false })
          .order("submitted_at", { ascending: false })
          .limit(1),
      ])

      if (profileError) {
        console.error("Could not load profile:", profileError)
      }
      if (subscriptionError) {
        console.error("Could not load subscriptions:", subscriptionError)
      }
      if (studentError) {
        console.error("Could not load students:", studentError)
      }
      if (paymentError) {
        console.error("Could not load payments:", paymentError)
      }

      let resolvedStudents = (studentRows ?? []).map((row) => mapStudent(row as SupabaseStudentRow))

      const pendingChild = authUser.email ? readPendingChild(authUser.email) : null


      if (resolvedStudents.length === 0) {
        const [{ data: resultNameRows }, { data: certificateNameRows }] = await Promise.all([
          supabase
            .from("student_test_results")
            .select("student_name")
            .eq("parent_id", authUser.id)
            .not("student_name", "is", null),
          supabase
            .from("certificates")
            .select("student_name")
            .eq("parent_id", authUser.id)
            .not("student_name", "is", null),
        ])

        const names = new Set<string>()
        for (const row of [...(resultNameRows ?? []), ...(certificateNameRows ?? [])] as Array<{ student_name?: string | null }>) {
          const trimmed = row.student_name?.trim()
          if (trimmed) names.add(trimmed)
        }

        if (names.size > 0) {
          const { data: insertedStudents, error: insertBackfillError } = await supabase
            .from("students")
            .insert(
              Array.from(names).map((name) => ({
                parent_id: authUser.id,
                full_name: name,
                grade_level: 5,
              })),
            )
            .select("id, full_name, grade_level, subscription_id, created_at")

          if (insertBackfillError) {
            console.error("Could not backfill students from existing records:", insertBackfillError)
          }

          if (insertedStudents?.length) {
            resolvedStudents = insertedStudents.map((row) => mapStudent(row as SupabaseStudentRow))
          }
        }
      }

      if (resolvedStudents.length === 0 && pendingChild) {
        const { data: insertedStudent, error: insertStudentError } = await supabase
          .from("students")
          .insert({
            parent_id: authUser.id,
            full_name: pendingChild,
            grade_level: 5,
          })
          .select("id, full_name, grade_level, subscription_id, created_at")
          .single<SupabaseStudentRow>()

        if (insertStudentError) {
          console.error("Could not create pending child record:", insertStudentError)
        }

        if (insertedStudent) {
          resolvedStudents = [mapStudent(insertedStudent)]
          if (authUser.email) clearPendingChild(authUser.email)
        }
      }

      const now = new Date()
      const effectiveSubscription = (subscriptionRows ?? []).find((candidate) => {
        const row = candidate as SupabaseSubscriptionRow
        return (
          row.status === "active" &&
          (!row.starts_at || new Date(row.starts_at) <= now) &&
          Boolean(row.expires_at && new Date(row.expires_at) > now)
        )
      }) as SupabaseSubscriptionRow | undefined
      const subscription = mapSubscription(effectiveSubscription ?? null)
      const latestVerifiedPayment = mapPayment((paymentRows?.[0] as SupabasePaymentRow | undefined) ?? null)
      const active = isSubscriptionActive(subscription) || isPaymentAccessActive(latestVerifiedPayment)

      const effectivePlanCode = active
        ? (subscription?.planCode ?? latestVerifiedPayment?.planCode ?? "free")
        : "free"
      const effectiveExpiry = active
        ? (subscription?.expiresAt
          ? new Date(subscription.expiresAt)
          : latestVerifiedPayment?.verifiedAt
            ? calculatePaymentExpiry(latestVerifiedPayment.planCode, latestVerifiedPayment.verifiedAt)
            : latestVerifiedPayment?.submittedAt
              ? calculatePaymentExpiry(latestVerifiedPayment.planCode, latestVerifiedPayment.submittedAt)
              : undefined)
        : undefined

      setStudents(resolvedStudents)
      setActiveSubscription(subscription)
      setUser({
        id: authUser.id,
        parentName: profile?.full_name ?? authUser.user_metadata?.full_name ?? "Parent",
        childName: resolvedStudents[0]?.fullName ?? "Student",
        email: profile?.email ?? authUser.email ?? "",
        role: profile?.role ?? "parent",
        subscriptionTier: effectivePlanCode,
        subscriptionExpiry: effectiveExpiry,
        createdAt: profile?.created_at ? new Date(profile.created_at) : undefined,
        maxStudents: subscription?.maxStudents ?? 1,
      })
    } catch (err) {
      console.error("Unexpected auth loading error:", err)
      setUser(null)
      setStudents([])
      setActiveSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Could not get session:", error)
        }
        if (!mounted) return
        await loadUser(data.session)
      } catch (err) {
        console.error("Session initialization error:", err)
        if (mounted) {
          setUser(null)
          setStudents([])
          setActiveSubscription(null)
          setIsLoading(false)
        }
      }
    }

    void initialize()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session) => {
        if (!mounted) return
        setIsLoading(true)

        setTimeout(() => {
          if (!mounted) return
          void loadUser(session)
        }, 0)
      },
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Login failed:", error)
        return false
      }

      return true
    } catch (err) {
      console.error("Unexpected login error:", err)
      return false
    }
  }

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    persistPendingChild(data.email, data.childName)

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin

    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${siteUrl}/login`,
        data: {
          full_name: data.parentName,
          phone: data.phone ?? null,
          role: "parent",
        },
      },
    })

    if (error) {
      const rawError = error.message?.toLowerCase() || ""

      if (rawError.includes("email rate limit exceeded")) {
        return {
          success: false,
          error:
            "This email may already be registered, or too many confirmation requests were made in a short time. Please sign in if you already have an account, or wait a few minutes and try again.",
        }
      }

      if (rawError.includes("user already registered")) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        }
      }

      if (rawError.includes("invalid email")) {
        return {
          success: false,
          error: "Please enter a valid email address.",
        }
      }

      if (rawError.includes("password")) {
        return {
          success: false,
          error: "Please use a stronger password and try again.",
        }
      }

      return {
        success: false,
        error: "We couldn’t create your account right now. Please try again.",
      }
    }

    if (result.session) {
      await loadUser(result.session)
    }

    return {
      success: true,
      needsEmailConfirmation: !result.session,
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStudents([])
    setActiveSubscription(null)
  }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Could not refresh session:", error)
      }
      await loadUser(data.session)
    } catch (err) {
      console.error("Refresh user error:", err)
      setUser(null)
      setStudents([])
      setActiveSubscription(null)
      setIsLoading(false)
    }
  }


  const calculatePaymentExpiry = (planCode: PlanCode, startAt: string) => {
    const date = new Date(startAt)
    if (Number.isNaN(date.getTime())) return undefined

    if (planCode === "standard_weekly") {
      date.setDate(date.getDate() + 7)
      return date
    }

    if (planCode === "standard_monthly" || planCode === "premium_family_monthly") {
      date.setMonth(date.getMonth() + 1)
      return date
    }

    if (planCode === "standard_yearly" || planCode === "premium_family_yearly") {
      date.setMonth(date.getMonth() + 12)
      return date
    }

    return undefined
  }

  const addStudent = async (childName: string) => {
    if (!user) return { success: false, error: "Please sign in first." }
    if (!childName.trim()) return { success: false, error: "Enter a student name." }

    const allowed = activeSubscription?.maxStudents ?? 1
    if (students.length >= allowed) {
      return {
        success: false,
        error: `This plan allows up to ${allowed} student${allowed === 1 ? "" : "s"}.`,
      }
    }

    const { error } = await supabase.from("students").insert({
      parent_id: user.id,
      subscription_id: activeSubscription?.id ?? null,
      full_name: childName.trim(),
      grade_level: 5,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    await refreshUser()
    return { success: true }
  }

  const isPremium =
    !isLoading &&
    !!user &&
    user.subscriptionTier !== "free"
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        students,
        activeSubscription,
        isLoading,
        isAuthenticated: !!user,
        isPremium,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        addStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
