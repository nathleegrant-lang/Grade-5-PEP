import Link from "next/link"
import { BookOpen, Calculator, FileText } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "PEP PRACTICE — Grade 5 Performance Tasks",
  description: "Choose Language Arts or Mathematics Performance Tasks within PEP PRACTICE — Grade 5.",
}

const taskAreas = [
  {
    href: "/mock-tests/performance/language-arts",
    title: "Language Arts Performance Tasks",
    description: "Practice reading sources, finding evidence, and writing clear responses.",
    cta: "View Language Arts Tasks",
    icon: BookOpen,
  },
  {
    href: "/mock-tests/performance/mathematics",
    title: "Mathematics Performance Tasks",
    description: "Solve real-world math problems and explain your thinking step by step.",
    cta: "View Mathematics Tasks",
    icon: Calculator,
  },
]

export default function PerformanceCategoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-gradient-to-br from-[#047857] via-[#10B981] to-[#2DD4BF] px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/mock-tests" className="mb-7 inline-flex rounded-md bg-white/15 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">← Back to Mock Tests</Link>

          <div className="mb-10 text-center text-white">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-50">PEP PRACTICE — Grade 5</p>
            <div className="mb-2 flex items-center justify-center gap-2 text-lg font-extrabold text-pink-200 sm:text-xl"><FileText className="h-5 w-5" aria-hidden="true" />Performance Tasks</div>
            <h1 className="mb-3 text-4xl font-extrabold text-white sm:text-5xl">Choose a Task Area</h1>
            <p className="mx-auto max-w-2xl text-emerald-50">Choose a subject area to begin Performance Task practice.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {taskAreas.map(({ href, title, description, cta, icon: Icon }) => (
              <article key={href} className="overflow-hidden rounded-xl border-2 border-rose-500 bg-white shadow-lg shadow-rose-200/60">
                <div className="bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-400 px-5 py-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-white text-rose-600 shadow-md"><Icon className="h-7 w-7" aria-hidden="true" /></div>
                </div>
                <div className="space-y-5 p-6">
                  <h2 className="text-xl font-extrabold text-rose-700">{title}</h2>
                  <p className="min-h-[48px] text-sm leading-6 text-slate-700">{description}</p>
                  <Link href={href} className="flex min-h-11 w-full items-center justify-center rounded-lg border border-rose-700 bg-rose-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">{cta}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
