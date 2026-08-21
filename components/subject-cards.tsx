import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calculator, FlaskConical, Globe } from "lucide-react"

const subjects = [
  {
    title: "Language Arts (Literacy)",
    description: "Reading comprehension, vocabulary, grammar, and writing skills practice.",
    icon: BookOpen,
    href: "/language-arts",
    iconBg: "bg-[#0d4a5f]",
  },
  {
    title: "Mathematics (Numeracy)",
    description: "Number operations, problem solving, measurement, and geometry practice.",
    icon: Calculator,
    href: "/mathematics",
    iconBg: "bg-[#f59e0b]",
  },
  {
    title: "Science",
    description: "Explore living things, matter, energy, and the environment through interactive lessons.",
    icon: FlaskConical,
    href: "/science",
    iconBg: "bg-[#0d9488]",
  },
  {
    title: "Social Studies",
    description: "Learn about Jamaica, Caribbean history, geography, and civic responsibilities.",
    icon: Globe,
    href: "/social-studies",
    iconBg: "bg-[#6366f1]",
  },
]

export function SubjectCards() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-[#dff7ff] via-[#e8fff7] to-[#fff4cc] p-6 shadow-sm md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/25" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cyan-400/15" />
      <div className="relative mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Choose your next challenge</p>
        <h3 className="mt-2 text-2xl font-bold text-[#102f57]">Start Practicing</h3>
        <p className="mt-2 text-slate-600">Choose a subject below to begin your review and purposeful Grade 5 practice.</p>
      </div>

      <div className="relative grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <Link key={subject.title} href={subject.href}>
            <Card className="h-full cursor-pointer border border-white bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${subject.iconBg}`}>
                  <subject.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-[#0d4a5f]">{subject.title}</h4>
                <p className="text-sm text-gray-600">{subject.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
