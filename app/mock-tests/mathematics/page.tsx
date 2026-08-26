import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export const metadata = {
  title: "PEP PRACTICE — Grade 5 Mathematics Mock Tests",
  description:
    "PEP PRACTICE — Grade 5 Mathematics mock tests with easy, moderate, difficult, and mixed practice levels.",
}

export default function MathematicsCategoryPage() {
  const catalog = getSubjectCatalog("numeracy")

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">PEP PRACTICE — Grade 5</p>
            <p className="mb-2 font-semibold text-amber-700">Mathematics</p>
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Mock Tests
            </h1>
            <p className="text-slate-600">
              Build confidence in number work, measurement, geometry, and data
              handling with levelled Grade 5 practice.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubjectLevelCard
              grade="grade5"
              subject="numeracy"
              level="easy"
              availableTests={catalog.easy}
              questions={40}
              minutes={60}
              description={[
                "More direct number questions",
                "Basic operations and simple word problems",
                "Clear working steps",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="numeracy"
              level="moderate"
              availableTests={catalog.moderate}
              questions={40}
              minutes={60}
              description={[
                "Closer to standard Grade 5 PEP level",
                "Balanced number, geometry, and data items",
                "Some two-step reasoning",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="numeracy"
              level="difficult"
              availableTests={catalog.difficult}
              questions={40}
              minutes={60}
              description={[
                "More reasoning-based questions",
                "Stronger distractors",
                "Longer word problems and strategy use",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="numeracy"
              level="mixed"
              availableTests={catalog.mixed}
              questions={40}
              minutes={60}
              description={[
                "Blend of easy, moderate, and difficult items",
                "Best exam-style simulation",
                "Strong preparation for formal assessment",
              ]}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
