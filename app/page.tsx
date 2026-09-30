import Link from "next/link"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WelcomeCard } from "@/components/welcome-card"
import { HowToUse } from "@/components/how-to-use"
import { SubjectCards } from "@/components/subject-cards"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, FileText, ClipboardCheck, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-emerald-50/50">
        <HeroSection />

        <div className="relative">
          <div className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-cyan-100/50 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 top-[34rem] h-64 w-64 rounded-full bg-emerald-100/50 blur-2xl" aria-hidden="true" />

          <section className="relative mx-auto max-w-6xl px-4 pb-6 pt-9"><WelcomeCard /></section>
          <section className="relative mx-auto max-w-6xl px-4 pb-10"><HowToUse /></section>

          <div className="relative mx-auto max-w-6xl space-y-10 px-4 pb-12">
            <SubjectCards />
            <section className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-950/5 md:p-8">
              <div className="mb-7 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600"><Sparkles className="h-5 w-5" /></div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Keep building</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">More Grade 5 Practice Resources</h2>
                <p className="mx-auto mt-2 max-w-2xl text-slate-600">Writing practice, printable resources and full mock examination preparation when your learner is ready for more.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <Link href="/writing-practice"><Card className="h-full cursor-pointer border border-slate-100 border-t-4 border-t-rose-400 bg-white shadow-md shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600"><PenTool className="h-8 w-8" /></div><h3 className="mb-2 text-lg font-extrabold text-rose-600">Writing Practice</h3><p className="mb-4 text-sm leading-6 text-slate-600">Performance task writing prompts with hints and marking rubrics.</p><Button className="w-full bg-rose-500 font-bold text-white hover:bg-rose-600">Start Writing</Button></CardContent></Card></Link>
                <Link href="/worksheets"><Card className="h-full cursor-pointer border border-slate-100 border-t-4 border-t-amber-400 bg-white shadow-md shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-orange-600"><FileText className="h-8 w-8" /></div><h3 className="mb-2 text-lg font-extrabold text-orange-600">Printable Worksheets</h3><p className="mb-4 text-sm leading-6 text-slate-600">Download and print worksheets for additional offline practice.</p><Button className="w-full bg-orange-500 font-bold text-white hover:bg-orange-600">View Worksheets</Button></CardContent></Card></Link>
                <Link href="/full-mock-exam"><Card className="h-full cursor-pointer border border-slate-100 border-t-4 border-t-blue-400 bg-white shadow-md shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"><ClipboardCheck className="h-8 w-8" /></div><h3 className="mb-2 text-lg font-extrabold text-blue-700">Full Mock Exam</h3><p className="mb-4 text-sm leading-6 text-slate-600">Complete PEP-style examination covering the supported Grade 5 areas.</p><Button className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700">Take Full Exam</Button></CardContent></Card></Link>
              </div>
            </section>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-500 text-white"><div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border-[24px] border-white/10" aria-hidden="true" /><div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-yellow-300">PEP PRACTICE — Grade 5</p><h2 className="mt-2 text-2xl font-black">Ready for the next practice session?</h2><p className="mt-1 text-sm font-medium text-white/90">Practice • Review • Confidence</p></div><Link href="/mock-tests"><Button className="bg-yellow-300 px-7 font-bold text-slate-900 shadow-lg shadow-blue-950/10 hover:bg-yellow-200">Start Practice</Button></Link></div></section>
        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
