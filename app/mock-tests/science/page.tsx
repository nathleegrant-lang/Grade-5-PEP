import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export default function ScienceCategoryPage() {
  const catalog = getSubjectCatalog("science")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              Science Mock Tests
            </h1>
            <p className="text-slate-600">
              Strengthen scientific knowledge, observation, reasoning, and application with levelled practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubjectLevelCard
              subject="science"
              level="easy"
              availableTests={catalog.easy}
              questions={40}
              minutes={60}
              description={[
                "More direct science facts and observations",
                "Simple everyday science situations",
                "Clear answer choices and recall items",
              ]}
            />

            <SubjectLevelCard
              subject="science"
              level="moderate"
              availableTests={catalog.moderate}
              questions={40}
              minutes={60}
              description={[
                "Closer to standard Grade 5 level",
                "Balanced knowledge and application",
                "Some interpretation of diagrams and data",
              ]}
            />

            <SubjectLevelCard
              subject="science"
              level="difficult"
              availableTests={catalog.difficult}
              questions={40}
              minutes={60}
              description={[
                "More reasoning-based questions",
                "Greater use of evidence and explanation",
                "Stronger distractors and deeper thinking",
              ]}
            />

            <SubjectLevelCard
              subject="science"
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
