import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TestSlotGrid } from "@/components/mock-tests/test-slot-grid"
import { getSubjectCatalog } from "@/lib/mock-catalog"

const levels = [
  {
    key: "easy",
    title: "Easy",
    subtitle: "Direct source use",
    description: [
      "More guided reading and response writing",
      "Clearer source connections",
      "Good starter task set for Grade 5",
    ],
  },
  {
    key: "moderate",
    title: "Moderate",
    subtitle: "Standard Grade 5 level",
    description: [
      "Balanced evidence use and short responses",
      "Some inference across sources",
      "Stronger paragraph writing expectations",
    ],
  },
  {
    key: "difficult",
    title: "Difficult",
    subtitle: "Higher thinking demand",
    description: [
      "Deeper connections across sources",
      "More developed evidence-based writing",
      "Stronger independence in task completion",
    ],
  },
  {
    key: "mixed",
    title: "Mixed",
    subtitle: "Exam-style blend",
    description: [
      "Blend of direct and deeper task parts",
      "Helps with performance-task stamina",
      "Best for realistic mock preparation",
    ],
  },
] as const

export default function PerformancePage() {
  const catalog = getSubjectCatalog("performance")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/mock-tests" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6">
            ← Back to Grade 5 Mock Tests
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">Grade 5 Performance Tasks</h1>
            <p className="text-slate-600">
              Dynamic Grade 5 performance-task slots with easy, moderate, difficult, and mixed levels.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {levels.map((level) => (
              <Card key={level.key} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800">{level.title}</CardTitle>
                  <p className="text-sm text-slate-500">{level.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-1 text-sm text-slate-600">
                    {level.description.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>

                  <TestSlotGrid
                    subject="performance"
                    level={level.key}
                    availableTests={catalog[level.key]}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
