"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d4a5f] to-[#0d9488] p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Image
              src="/images/logo.png"
              alt="Grade 5 PEP Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#1e3a5f]">Account Created!</CardTitle>
          <CardDescription>Please verify your email to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">We&apos;ve sent a verification email to:</p>
              <p className="text-blue-700 break-all">{email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Next steps:</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return here to sign in</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <p>
              <span className="font-semibold">Didn&apos;t receive the email?</span> Check your spam folder or
              contact us at grade5pep@gmail.com
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login">
              <Button className="w-full bg-[#0d9488] hover:bg-[#0d7a6f]">Go to Sign In</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#0d4a5f] to-[#0d9488]" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
