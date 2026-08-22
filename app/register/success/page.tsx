import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

type RegisterSuccessPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

export default async function RegisterSuccessPage({
  searchParams,
}: RegisterSuccessPageProps) {
  const params = await searchParams
  const nextPath = params?.next
  const signInHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login"

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
          <div className="bg-[#072247] px-6 py-10 flex justify-center">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <Image
                src="/images/pep-practice-grade5-primary.jpg"
                alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence"
                width={700}
                height={251}
                className="h-auto w-[280px] object-contain"
                priority
              />
            </div>
          </div>

          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Account Created
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-8 text-slate-600">
              Your account was created. Please confirm your email if prompted,
              then sign in to continue. If you already have an account, please
              sign in instead.
            </p>

            <div className="mt-8">
              <Link href={signInHref}>
                <Button className="w-full max-w-md bg-slate-700 hover:bg-slate-800 text-white text-base py-6 rounded-xl">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
