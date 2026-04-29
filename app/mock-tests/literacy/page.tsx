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
    emoji: "🌱",
    theme: "from-emerald-200 to-emerald-300",
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
    emoji: "🧩",
    theme: "from-sky-200 to-blue-300",
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
    emoji: "🔥",
    theme: "from-orange-200 to-amber-300",
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
    emoji: "🎯",
    theme: "from-fuchsia-200 to-pink-300",
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
          <Link
            href="/mock-tests"
            className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-800"
          >
            ← Back to Grade 5 Mock Tests
          </Link>

          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Grade 5 Literacy Mock Tests
            </h1>
            <p className="text-slate-600">
              Choose a level and practise reading, vocabulary, grammar, and writing skills.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {levels.map((level) => (
              <Card
                key={level.key}
                className={`relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${level.theme} shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/35" />
                <div className="absolute bottom-4 right-4 text-3xl text-black/20">
                  ★
                </div>

                <CardHeader className="relative z-10">
                  <div className="mb-2 text-3xl">{level.emoji}</div>
                  <CardTitle className="text-2xl font-extrabold text-slate-900">
                    {level.title}
                  </CardTitle>
                  <p className="text-sm font-semibold text-slate-700">
                    {level.subtitle}
                  </p>
                </CardHeader>

                <CardContent className="relative z-10 space-y-5">
                  <ul className="space-y-1 text-sm font-semibold leading-6 text-slate-800">
                    {level.description.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>

                  <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                    <TestSlotGrid
                      subject="literacy"
                      level={level.key}
                      availableTests={catalog[level.key]}
                    />
                  </div>
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
