import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calculator, FlaskConical, Globe } from "lucide-react"

const subjects = [
  { title: "Language Arts (Literacy)", description: "Reading comprehension, vocabulary, grammar, and writing skills practice.", icon: BookOpen, href: "/language-arts", iconBg: "bg-[#0d4a5f]" },
  { title: "Mathematics (Numeracy)", description: "Number operations, problem solving, measurement, and geometry practice.", icon: Calculator, href: "/mathematics", iconBg: "bg-[#f59e0b]" },
  { title: "Science", description: "Explore living things, matter, energy, and the environment through interactive lessons.", icon: FlaskConical, href: "/science", iconBg: "bg-[#0d9488]" },
  { title: "Social Studies", description: "Learn about Jamaica, Caribbean history, geography, and civic responsibilities.", icon: Globe, href: "/social-studies", iconBg: "bg-[#6366f1]" },
]

export function SubjectCards() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-teal-700 bg-gradient-to-br from-[#0d9488] via-[#0f827b] to-[#0d6f70] p-6 shadow-md md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/15" />
      <div className="relative mb-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Choose your next challenge</p>
        <h3 className="mt-2 text-2xl font-bold">Start Practising</h3>
        <p className="mt-2 text-teal-50">Choose a subject below to begin your review and purposeful Grade 5 practice.</p>
      </div>
      <div className="relative grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <Link key={subject.title} href={subject.href}>
            <Card className="h-full cursor-pointer border border-white/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${subject.iconBg}`}><subject.icon className="h-6 w-6 text-white" /></div>
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
