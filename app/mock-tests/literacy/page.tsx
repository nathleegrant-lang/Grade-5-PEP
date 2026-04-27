import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TestSlotGrid } from "@/components/mock-tests/test-slot-grid"
import { getSubjectCatalog } from "@/lib/mock-catalog"

const levels = [
  {
    key: "easy",
    title: "Easy",
    subtitle: "Confidence-building practice",
    description: [
      "Shorter passages and more direct questions",
      "Clearer grammar and vocabulary choices",
      "Gentler writing prompts",
    ],
  },
  {
    key: "moderate",
    title: "Moderate",
    subtitle: "Standard Grade 5 level",
    description: [
      "Balanced reading and language practice",
      "More inference and text evidence",
      "Stronger writing expectations",
    ],
  },
  {
    key: "difficult",
    title: "Difficult",
    subtitle: "Higher thinking demand",
    description: [
      "Longer passages and stronger distractors",
      "Deeper interpretation and comparison",
      "More developed writing responses",
    ],
  },
  {
    key: "mixed",
    title: "Mixed",
    subtitle: "Exam-style blend",
    description: [
      "Combination of easy, moderate, and difficult items",
      "Useful for stamina and test-readiness",
      "Best for overall mock-test practice",
    ],
  },
] as const

export default function LiteracyPage() {
  const catalog = getSubjectCatalog("literacy")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/mock-tests" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6">
            ← Back to Grade 5 Mock Tests
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">Grade 5 Literacy Mock Tests</h1>
            <p className="text-slate-600">
              Build out Grade 5 literacy tests one slot at a time. Active numbers open live routes; missing ones stay greyed out.
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
                    subject="literacy"
                    level={level.key}
                    availableTests={catalog[level.key]}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
