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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
          Start Practicing
        </h3>
        <p className="text-gray-600">
          Choose a subject below to begin your review and online practice.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link key={subject.title} href={subject.href}>
            <Card className="border border-gray-200 hover:border-[#0d4a5f] hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${subject.iconBg} flex items-center justify-center mb-4`}>
                  <subject.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-[#0d4a5f] mb-2">
                  {subject.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {subject.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
