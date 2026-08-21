import Image from "next/image"
import Link from "next/link"
import { VisitorCounter } from "@/components/visitor-counter"

const GRADE_4_URL = "https://grade-4-pep.vercel.app/"
const SUPPORT_EMAIL = "shazincorps@gmail.com"
const BRAND_LOGO = "/images/pep-practice-grade5-primary.jpg"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-[#102f57]">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <Image src={BRAND_LOGO} alt="PEP PRACTICE Grade 5 — Practice, Review, Confidence" width={700} height={251} className="h-auto w-[260px] sm:w-[300px]" />
            <div><p className="text-sm font-semibold">by Shazonique&apos;s Inspiration</p><p className="mt-1 text-sm text-slate-500">Different grade. Different developmental stage. Same PEP PRACTICE.</p></div>
            <div className="w-full max-w-xs space-y-2 pt-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Explore Other Grades</p><a href={GRADE_4_URL} target="_blank" rel="noreferrer" className="block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 text-center">Visit PEP PRACTICE — Grade 4</a><button type="button" disabled className="block w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed border border-slate-200">Grade 6 — Coming Soon</button></div>
          </div>
          <div className="text-center md:text-left"><h3 className="text-sm font-semibold uppercase tracking-wide">Quick Links</h3><ul className="mt-4 space-y-2 text-sm text-slate-600"><li><Link href="/mock-tests" className="hover:text-blue-700">Start Practice</Link></li><li><Link href="/pricing" className="hover:text-blue-700">View Pricing</Link></li><li><Link href="/login" className="hover:text-blue-700">Sign In</Link></li><li><Link href="/register" className="hover:text-blue-700">Create Account</Link></li><li><Link href="/about" className="hover:text-blue-700">About PEP PRACTICE</Link></li></ul></div>
          <div className="text-center md:text-left"><h3 className="text-sm font-semibold uppercase tracking-wide">Grade 5 Learning</h3><div className="mt-4 space-y-3 text-sm text-slate-600"><p>Language Arts, Mathematics, Science, Social Studies, Performance Tasks and mock-test practice in one focused Grade 5 experience.</p><p>Develop skills. Increase challenge. Grow independence.</p><a href={`mailto:${SUPPORT_EMAIL}`} className="inline-block font-medium text-blue-700 hover:underline">{SUPPORT_EMAIL}</a></div></div>
        </div>
      </div>
      <div className="bg-[#173f82] px-4 py-5 text-center text-xs text-white"><p>© {new Date().getFullYear()} Shazonique&apos;s Inspiration. PEP PRACTICE — Grade 5.</p><div className="mt-2 text-blue-100"><VisitorCounter /></div></div>
    </footer>
  )
}
