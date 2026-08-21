import Image from "next/image"
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

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-7 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Grow &amp; Challenge</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1e3a5f]">Grade 5 practice for growing learners</h2>
            <p className="mx-auto mt-3 max-w-3xl text-gray-600">Build stronger skills across the Grade 5 programme while encouraging more independent practice, thoughtful challenge and confidence.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <WelcomeCard />
            <div className="space-y-5">
              <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-md">
                <Image src="/images/student_withworksheet.jpg" alt="Grade 5 learner practising independently with digital and written learning resources" width={900} height={600} className="h-full w-full object-cover" priority />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-6 pt-20 text-white"><p className="text-xl font-bold">Challenge yourself. Learn from every attempt.</p><p className="mt-1 text-sm text-slate-100">Purposeful practice across a broader Grade 5 programme.</p></div>
              </div>
              <HowToUse />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-12 px-4 pb-12">
          <SubjectCards />

          <section className="rounded-3xl bg-slate-50 p-6 md:p-8">
            <div className="grid items-center gap-7 md:grid-cols-2">
              <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">Parent Support</p><h2 className="mt-2 text-2xl font-bold text-[#1e3a5f]">Support progress without taking over the practice</h2><p className="mt-3 leading-relaxed text-gray-600">Encourage regular practice, review the progress information already available and help your child choose an appropriate level of challenge as confidence grows.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard"><Button className="bg-blue-700 text-white hover:bg-blue-800">View Dashboard</Button></Link><Link href="/pricing"><Button variant="outline">View Pricing</Button></Link></div></div>
              <div className="relative h-[300px] overflow-hidden rounded-2xl shadow-md"><Image src="/images/parent-support-section.jpg" alt="Parent supporting an older primary learner while the child works independently" width={800} height={600} className="h-full w-full object-cover" /></div>
            </div>
          </section>

          <section>
            <div className="mb-8 text-center"><h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">More Grade 5 Practice Resources</h2><p className="text-gray-600">Keep the broader Grade 5 experience: writing, printable practice and full mock examination preparation.</p></div>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/writing-practice"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-blue-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600"><PenTool className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Writing Practice</h3><p className="mb-4 text-sm text-gray-600">Performance task writing prompts with hints and marking rubrics.</p><Button className="w-full bg-blue-700 text-white hover:bg-blue-800">Start Writing</Button></CardContent></Card></Link>
              <Link href="/worksheets"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-amber-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500"><FileText className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Printable Worksheets</h3><p className="mb-4 text-sm text-gray-600">Download and print worksheets for additional offline practice.</p><Button className="w-full bg-amber-500 text-white hover:bg-amber-600">View Worksheets</Button></CardContent></Card></Link>
              <Link href="/full-mock-exam"><Card className="h-full cursor-pointer border-2 border-gray-200 transition-all hover:border-purple-500 hover:shadow-lg"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-purple-600"><ClipboardCheck className="h-8 w-8 text-white" /></div><h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">Full Mock Exam</h3><p className="mb-4 text-sm text-gray-600">Complete PEP-style examination covering the supported Grade 5 areas.</p><Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Take Full Exam</Button></CardContent></Card></Link>
            </div>
          </section>
        </div>
        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
