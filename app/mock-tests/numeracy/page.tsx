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
    subtitle: "Confidence-building practice",
    description: [
      "More direct number and measurement questions",
      "Simple word problems and clearer distractors",
      "Good starting point for Grade 5 review",
    ],
  },
  {
    key: "moderate",
    title: "Moderate",
    subtitle: "Standard Grade 5 level",
    description: [
      "Balanced number, geometry, and data items",
      "More two-step reasoning",
      "Closer to classroom assessment level",
    ],
  },
  {
    key: "difficult",
    title: "Difficult",
    subtitle: "Higher thinking demand",
    description: [
      "Stronger distractors and richer word problems",
      "Greater emphasis on reasoning and strategy",
      "Useful for stretch practice",
    ],
  },
  {
    key: "mixed",
    title: "Mixed",
    subtitle: "Exam-style blend",
    description: [
      "Combines easy, moderate, and difficult items",
      "Builds stamina and test readiness",
      "Helpful for full mock-test practice",
    ],
  },
] as const

export default function NumeracyPage() {
  const catalog = getSubjectCatalog("numeracy")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/mock-tests" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6">
            ← Back to Grade 5 Mock Tests
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">Grade 5 Numeracy Mock Tests</h1>
            <p className="text-slate-600">
              Dynamic Grade 5 numeracy slots for easy, moderate, difficult, and mixed test sets.
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
                    subject="numeracy"
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
