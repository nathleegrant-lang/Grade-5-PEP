import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"

type RegisterSuccessPageProps = { searchParams?: Promise<{ next?: string }> }

export default async function RegisterSuccessPage({ searchParams }: RegisterSuccessPageProps) {
  const params = await searchParams
  const nextPath = params?.next
  const signInHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
          <div className="bg-[#072247] px-6 py-10 flex justify-center">
            <div className="rounded-xl bg-white p-4 shadow-lg"><Image src="/images/pep-practice-grade5-primary.jpg" alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence" width={700} height={251} className="h-auto w-[280px] object-contain" priority /></div>
          </div>
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100"><MailCheck className="h-10 w-10 text-sky-700" /></div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Check Your Email</h1>
            <p className="mx-auto max-w-xl text-lg leading-8 text-slate-600">We&apos;ll send the next step where applicable. Please check the inbox and spam/junk folder for the email address you provided.</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">If you don&apos;t receive a message, you can resend the confirmation email or use Forgot Password.</p>
            <div className="mx-auto mt-8 grid max-w-md gap-3">
              <Link href={signInHref}><Button className="w-full bg-slate-700 hover:bg-slate-800 text-white">Go to Sign In</Button></Link>
              <Link href="/auth/resend-confirmation"><Button variant="outline" className="w-full">Resend Confirmation Email</Button></Link>
              <Link href="/auth/forgot-password"><Button variant="ghost" className="w-full text-[#0d6f70]">Forgot Password</Button></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
