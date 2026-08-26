import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export const metadata = {
  title: "Grade 5 PEP Science Mock Tests",
  description:
    "Grade 5 PEP Science mock tests with easy, moderate, difficult, and mixed practice levels.",
}

export default function ScienceCategoryPage() {
  const catalog = getSubjectCatalog("science")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Science Mock Tests
            </h1>
            <p className="text-slate-600">
              Strengthen scientific knowledge, observation, reasoning, and
              application with levelled Grade 5 PEP practice.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubjectLevelCard
              grade="grade5"
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
              grade="grade5"
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
              grade="grade5"
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
              grade="grade5"
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
