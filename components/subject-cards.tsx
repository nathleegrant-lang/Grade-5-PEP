import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calculator, FlaskConical, Globe } from "lucide-react"

const subjects = [
  { title: "Language Arts (Literacy)", description: "Reading comprehension, vocabulary, grammar, and writing skills practice.", icon: BookOpen, href: "/language-arts", topBorder: "border-t-sky-400", iconWrap: "bg-sky-100 text-sky-600", titleClass: "text-blue-700" },
  { title: "Mathematics (Numeracy)", description: "Number operations, problem solving, measurement, and geometry practice.", icon: Calculator, href: "/mathematics", topBorder: "border-t-amber-400", iconWrap: "bg-amber-100 text-orange-600", titleClass: "text-orange-600" },
  { title: "Science", description: "Explore living things, matter, energy, and the environment through interactive lessons.", icon: FlaskConical, href: "/science", topBorder: "border-t-green-400", iconWrap: "bg-green-100 text-green-600", titleClass: "text-green-700" },
  { title: "Social Studies", description: "Learn about Jamaica, Caribbean history, geography, and civic responsibilities.", icon: Globe, href: "/social-studies", topBorder: "border-t-purple-400", iconWrap: "bg-purple-100 text-purple-600", titleClass: "text-purple-700" },
]

export function SubjectCards() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-950/10 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border-[22px] border-cyan-100/70" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-emerald-100/70" />
      <div className="relative mb-7 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Choose your next challenge</p>
        <h3 className="mt-2 text-2xl font-black text-slate-900">Start Practising</h3>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">Choose a subject below to begin your review and purposeful Grade 5 practice.</p>
      </div>
      <div className="relative grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <Link key={subject.title} href={subject.href}>
            <Card className={`h-full cursor-pointer border border-slate-100 border-t-4 ${subject.topBorder} bg-white shadow-md shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
              <CardContent className="p-6">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${subject.iconWrap}`}><subject.icon className="h-7 w-7" /></div>
                <h4 className={`mb-2 text-lg font-extrabold ${subject.titleClass}`}>{subject.title}</h4>
                <p className="text-sm leading-6 text-slate-600">{subject.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
