"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function RegisterPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get("plan")
  const { register, isAuthenticated, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    parentName: "",
    childName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [guardianConsent, setGuardianConsent] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const postLoginPath = selectedPlan ? `/checkout?plan=${selectedPlan}` : "/mock-tests"

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(postLoginPath)
    }
  }, [isAuthenticated, isLoading, postLoginPath, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setError("")
    setIsSubmitting(true)

    try {
      if (!formData.parentName || !formData.childName || !formData.email || !formData.password) {
        setError("Please fill in all required fields.")
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      if (!guardianConsent) {
        setError("Please confirm that you are a parent or guardian registering on behalf of a child.")
        return
      }

      const result = await register({
        parentName: formData.parentName,
        childName: formData.childName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      })

      if (!result.success) {
        const rawError = result.error?.toLowerCase() || ""

        if (rawError.includes("email rate limit exceeded")) {
          setError("Too many confirmation requests were made in a short time. Please wait a few minutes and try again.")
        } else {
          setError(result.error || "We couldn’t create your account right now. Please try again.")
        }
        return
      }

      const successPath = `/register/success?next=${encodeURIComponent(postLoginPath)}`
      router.push(successPath)
    } catch (err) {
      console.error("Registration error:", err)
      setError("We couldn’t create your account right now. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card className="border-sky-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-sky-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">
                Create your PEP PRACTICE — Grade 5 parent account
              </CardTitle>
              <CardDescription>
                Set up your free parent account first, then continue to your plan or mock tests.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name</Label>
                  <Input id="parentName" name="parentName" type="text" placeholder="Enter your name" value={formData.parentName} onChange={handleChange} className="border-slate-300" disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childName">First Student Name</Label>
                  <Input id="childName" name="childName" type="text" placeholder="Enter your child's name" value={formData.childName} onChange={handleChange} className="border-slate-300" disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp Number (optional)</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="876-123-4567" value={formData.phone} onChange={handleChange} className="border-slate-300" disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="parent@email.com" value={formData.email} onChange={handleChange} className="border-slate-300" disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={handleChange} className="border-slate-300 pr-10" disabled={isSubmitting} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" disabled={isSubmitting}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className="border-slate-300" disabled={isSubmitting} />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <input id="guardianConsent" type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" disabled={isSubmitting} />
                    <label htmlFor="guardianConsent" className="text-sm text-slate-700 leading-relaxed">
                      I confirm that I am a parent or guardian registering on behalf of a child, and I have read the{" "}
                      <Link href="/privacy" className="font-medium text-sky-700 hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sky-600 mt-0.5" />
                    <p>Create your free account first. Paid access begins only after payment is verified by the admin.</p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">Sign in here</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
