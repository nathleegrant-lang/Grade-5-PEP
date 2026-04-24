"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Loader2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"

export default function PaymentSuccessPage() {
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const activate = async () => {
      await refreshUser()
      setStatus("success")
    }
    activate()
  }, [refreshUser])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          {status === "loading" ? (
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#0d9488]" />
              <p className="mt-4 text-gray-600">Processing your payment...</p>
            </CardContent>
          ) : status === "success" ? (
            <>
              <CardHeader className="text-center bg-gradient-to-r from-[#0d9488] to-[#059669] text-white rounded-t-lg">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-[#f59e0b]/10 text-[#f59e0b] px-4 py-2 rounded-full font-semibold mb-4">
                    <Crown className="w-5 h-5" />
                    Premium Member
                  </div>
                  <p className="text-gray-600">
                    Thank you for your purchase! Your account has been upgraded to Premium.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-[#1e3a5f]">You now have access to:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Unlimited quizzes on all topics</li>
                    <li>• Full mock exams (15-20 questions each)</li>
                    <li>• Printable worksheets (PDF)</li>
                    <li>• Writing practice with rubrics</li>
                    <li>• Detailed progress tracking</li>
                    <li>• Achievement certificates</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link href="/dashboard" className="block">
                    <Button className="w-full bg-[#0d9488] hover:bg-[#0a7c72] text-white">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Something went wrong. Please contact support.</p>
              <Link href="/pricing">
                <Button className="mt-4">Try Again</Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  )
}
