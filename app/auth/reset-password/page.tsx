"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type RecoveryState = "checking" | "ready" | "invalid" | "complete"

export default function ResetPasswordPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [state, setState] = useState<RecoveryState>("checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === "PASSWORD_RECOVERY" && session) setState("ready")
    })

    const establishRecoverySession = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""))
      const isImplicitRecovery = hashParams.get("type") === "recovery"
      const accessToken = isImplicitRecovery ? hashParams.get("access_token") : null
      const refreshToken = isImplicitRecovery ? hashParams.get("refresh_token") : null

      try {
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError || !data.session) {
            if (mounted) setState("invalid")
            return
          }
          url.searchParams.delete("code")
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
          if (mounted) setState("ready")
          return
        }

        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (sessionError || !data.session) {
            if (mounted) setState("invalid")
            return
          }
          window.history.replaceState({}, "", `${url.pathname}${url.search}`)
          if (mounted) setState("ready")
          return
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (!mounted) return
        if (!sessionError && data.session) {
          setState("ready")
          return
        }
        setState("invalid")
      } catch (sessionError) {
        console.error("Could not establish recovery session:", sessionError)
        if (mounted) setState("invalid")
      }
    }

    void establishRecoverySession()
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting || state !== "ready") return
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        setState("invalid")
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        console.error("Password update failed:", updateError)
        setError("We couldn’t update your password from this link. Please request a new password reset email.")
        return
      }

      await supabase.auth.signOut()
      setState("complete")
    } catch (updateError) {
      console.error("Unexpected password update error:", updateError)
      setError("We couldn’t update your password from this link. Please request a new password reset email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d4a5f] to-[#0d9488] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Image src="/images/pep-practice-grade5-primary.jpg" alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence" width={700} height={251} className="h-auto w-[230px] object-contain" priority />
          </Link>
          <CardTitle className="text-2xl text-[#1e3a5f]">{state === "complete" ? "Password Updated" : state === "invalid" ? "This Link Can’t Be Used" : "Set New Password"}</CardTitle>
          <CardDescription>{state === "complete" ? "Your password has been updated. You can now sign in with your new password." : state === "invalid" ? "This recovery link may be invalid, expired or already used. Request a new password reset email to continue." : "Choose a new password for your PEP PRACTICE — Grade 5 account."}</CardDescription>
        </CardHeader>
        <CardContent>
          {state === "checking" && <p className="text-center text-sm text-slate-600">Checking your recovery link...</p>}
          {state === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div className="space-y-2"><Label htmlFor="password">New Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10 pr-10" disabled={isSubmitting} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isSubmitting} required /></div>
              <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0d7a6f]" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Set New Password"}</Button>
            </form>
          )}
          {(state === "invalid" || state === "complete") && <div className="grid gap-3">{state === "invalid" && <Link href="/auth/forgot-password"><Button className="w-full bg-[#0d9488] hover:bg-[#0d7a6f]">Request New Password Reset</Button></Link>}<Link href="/login"><Button variant={state === "complete" ? "default" : "outline"} className="w-full">Go to Sign In</Button></Link></div>}
        </CardContent>
      </Card>
    </div>
  )
}
