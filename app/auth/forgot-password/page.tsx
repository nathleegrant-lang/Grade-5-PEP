"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const neutralMessage = "If that email is eligible for password recovery, we’ve sent the next step. Please check your inbox and spam/junk folder."

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setMessage("")

    try {
      const siteUrl = window.location.origin.replace(/\/$/, "")
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      })
      if (error) console.error("Password recovery request failed:", error)
      setMessage(neutralMessage)
    } catch (error) {
      console.error("Unexpected password recovery error:", error)
      setMessage(neutralMessage)
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
          <CardTitle className="text-2xl text-[#1e3a5f]">Forgot Password</CardTitle>
          <CardDescription>Enter your email address and we’ll send the next step where eligible.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="parent@example.com" className="pl-10" disabled={isSubmitting} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0d7a6f]" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Password Reset Email"}
            </Button>
          </form>

          {message && <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-slate-700">{message}</div>}

          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <Link href="/login" className="font-semibold text-[#0d6f70] hover:underline">Go to Sign In</Link>
            <Link href="/auth/resend-confirmation" className="font-semibold text-[#0d6f70] hover:underline">Resend Confirmation Email</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
