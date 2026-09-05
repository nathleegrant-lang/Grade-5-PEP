import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  FileText,
  FlaskConical,
  Globe,
  Sparkles,
  Star,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const subjects = [
  {
    title: "Language Arts",
    description: "Reading, vocabulary, grammar, and writing practice for Grade 5.",
    href: "/mock-tests/language-arts",
    icon: BookOpen,
    accent: "sky",
    topBorder: "border-t-sky-400",
    iconWrap: "bg-sky-100 text-sky-600",
    titleClass: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400",
    buttonText: "View Language Arts Tests",
  },
  {
    title: "Mathematics",
    description: "Number operations, measurement, geometry, and data practice.",
    href: "/mock-tests/mathematics",
    icon: Calculator,
    accent: "amber",
    topBorder: "border-t-amber-400",
    iconWrap: "bg-amber-100 text-orange-600",
    titleClass: "text-orange-600",
    buttonClass: "bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-300",
    buttonText: "View Mathematics Tests",
  },
  {
    title: "Science",
    description: "Living things, energy, matter, earth systems, and investigation skills.",
    href: "/mock-tests/science",
    icon: FlaskConical,
    accent: "green",
    topBorder: "border-t-green-400",
    iconWrap: "bg-green-100 text-green-600",
    titleClass: "text-green-700",
    buttonClass: "bg-green-600 hover:bg-green-700 focus-visible:ring-green-300",
    buttonText: "View Science Tests",
  },
  {
    title: "Social Studies",
    description: "Jamaica, geography, history, citizenship, and community life.",
    href: "/mock-tests/social-studies",
    icon: Globe,
    accent: "purple",
    topBorder: "border-t-purple-400",
    iconWrap: "bg-purple-100 text-purple-600",
    titleClass: "text-purple-700",
    buttonClass: "bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-300",
    buttonText: "View Social Studies Tests",
  },
  {
    title: "Performance Tasks",
    description: "Source-based reading, evidence, reasoning, and written responses.",
    href: "/mock-tests/performance",
    icon: FileText,
    accent: "rose",
    topBorder: "border-t-rose-400",
    iconWrap: "bg-rose-100 text-rose-600",
    titleClass: "text-rose-600",
    buttonClass: "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-300",
    buttonText: "View Performance Tasks",
  },
]

export default function MockTestsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-24 top-28 h-64 w-64 rounded-full border border-white/15 bg-white/5" />
            <div className="absolute left-[22%] top-16 h-28 w-28 rounded-full border-[18px] border-white/5" />
            <div className="absolute right-[-5rem] top-16 h-72 w-72 rounded-full border border-white/25" />
            <div className="absolute bottom-[-7rem] left-[32%] h-56 w-56 rounded-full bg-white/10 blur-sm" />
            <Star className="absolute left-[6%] top-28 h-9 w-9 fill-yellow-300 text-yellow-300 drop-shadow" />
            <Sparkles className="absolute right-[8%] top-20 h-9 w-9 text-yellow-200" />
            <div className="absolute right-[13%] top-28 grid grid-cols-4 gap-3 opacity-60">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-full bg-white" />
              ))}
            </div>
            <span className="absolute left-[4%] bottom-20 text-5xl font-black text-white/25">+</span>
            <span className="absolute right-[18%] bottom-24 text-4xl font-black text-white/25">+</span>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="mx-auto mb-8 max-w-3xl text-center">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-yellow-300 sm:text-sm">
                PEP PRACTICE — Grade 5
              </p>
              <h1 className="text-4xl font-black tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
                Mock Tests
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-white/95 sm:text-lg">
                Choose a subject or performance task area to begin practice.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {subjects.map((subject) => {
                const Icon = subject.icon

                return (
                  <article
                    key={subject.title}
                    className={`group flex h-full flex-col rounded-2xl border border-white/70 border-t-4 ${subject.topBorder} bg-white p-5 text-center shadow-xl shadow-blue-950/15 transition duration-200 hover:-translate-y-1 hover:shadow-2xl`}
                  >
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${subject.iconWrap}`}>
                      <Icon className="h-8 w-8" strokeWidth={2.2} />
                    </div>

                    <h2 className={`text-xl font-extrabold ${subject.titleClass}`}>
                      {subject.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                      {subject.description}
                    </p>

                    <Link
                      href={subject.href}
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${subject.buttonClass}`}
                    >
                      {subject.buttonText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
