import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export default function MathematicsCategoryPage() {
  const catalog = getSubjectCatalog("numeracy")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              Mathematics Mock Tests
            </h1>
            <p className="text-slate-600">
              Build confidence in number work, measurement, geometry, and data handling with levelled practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubjectLevelCard
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
