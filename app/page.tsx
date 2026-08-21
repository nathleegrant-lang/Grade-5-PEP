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
import { PenTool, FileText, ClipboardCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />

        <section className="mx-auto max-w-6xl px-4 py-9">
          <WelcomeCard />
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 pb-10">
          <SubjectCards />

          <section>
            <div className="mb-7 text-center"><h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">More Grade 5 Practice Resources</h2><p className="text-gray-600">Writing practice, printable resources and full mock examination preparation when your learner is ready for more.</p></div>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/writing-practice"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-blue-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600"><PenTool className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Writing Practice</h3><p className="mb-4 text-sm text-gray-600">Performance task writing prompts with hints and marking rubrics.</p><Button className="w-full bg-blue-700 text-white hover:bg-blue-800">Start Writing</Button></CardContent></Card></Link>
              <Link href="/worksheets"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-amber-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500"><FileText className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Printable Worksheets</h3><p className="mb-4 text-sm text-gray-600">Download and print worksheets for additional offline practice.</p><Button className="w-full bg-amber-500 text-white hover:bg-amber-600">View Worksheets</Button></CardContent></Card></Link>
              <Link href="/full-mock-exam"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-purple-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-purple-600"><ClipboardCheck className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Full Mock Exam</h3><p className="mb-4 text-sm text-gray-600">Complete PEP-style examination covering the supported Grade 5 areas.</p><Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Take Full Exam</Button></CardContent></Card></Link>
            </div>
          </section>

          <HowToUse />
        </div>

        <section className="bg-[#172d63] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">PEP PRACTICE — Grade 5</p><h2 className="mt-2 text-2xl font-bold">Ready for the next practice session?</h2><p className="mt-1 text-sm text-blue-100">Practice • Review • Confidence</p></div>
            <Link href="/mock-tests"><Button className="bg-amber-400 px-7 text-[#102f57] hover:bg-amber-500">Start Practice</Button></Link>
          </div>
        </section>

        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
