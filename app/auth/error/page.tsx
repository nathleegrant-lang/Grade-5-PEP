import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d4a5f] to-[#0d9488] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Image src="/images/pep-practice-grade5-primary.jpg" alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence" width={700} height={251} className="h-auto w-[230px] object-contain" />
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#1e3a5f]">This Link Can’t Be Used</CardTitle>
          <CardDescription>The confirmation or recovery link is invalid, expired or already consumed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Request a new email if you still need to confirm access or reset your password. For privacy, we won’t disclose account status here.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/auth/resend-confirmation"><Button className="w-full bg-[#0d9488] hover:bg-[#0d7a6f]">Request New Confirmation Email</Button></Link>
            <Link href="/auth/forgot-password"><Button variant="outline" className="w-full">Forgot Password</Button></Link>
            <Link href="/login"><Button variant="ghost" className="w-full">Go to Sign In</Button></Link>
          </div>
          <p className="text-xs text-gray-500 text-center pt-2">
            Need help? Contact us at{" "}
            <a href="mailto:grade5pep@gmail.com" className="text-[#0d9488] hover:underline">grade5pep@gmail.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
