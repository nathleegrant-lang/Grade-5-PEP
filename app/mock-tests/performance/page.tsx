import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export const metadata = {
  title: "Grade 5 PEP Performance Task Mock Tests",
  description:
    "Grade 5 PEP Performance Task practice with easy, moderate, difficult, and mixed levels.",
}

export default function PerformanceCategoryPage() {
  const catalog = getSubjectCatalog("performance")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Performance Task Mock Tests
            </h1>
            <p className="text-slate-600">
              Build reading, evidence, reasoning, and writing skills through
              levelled Grade 5 PEP performance tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubjectLevelCard
              grade="grade5"
              subject="performance"
              level="easy"
              availableTests={catalog.easy}
              questions={1}
              minutes={90}
              description={[
                "Stronger focus on direct information",
                "Guided short responses",
                "Simple structured writing",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="performance"
              level="moderate"
              availableTests={catalog.moderate}
              questions={1}
              minutes={90}
              description={[
                "Closer to standard Grade 5 PEP level",
                "Evidence from sources",
                "More developed written responses",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="performance"
              level="difficult"
              availableTests={catalog.difficult}
              questions={1}
              minutes={90}
              description={[
                "More reasoning-based responses",
                "Stronger use of evidence",
                "More careful organization and writing",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="performance"
              level="mixed"
              availableTests={catalog.mixed}
              questions={1}
              minutes={90}
              description={[
                "Blend of easy, moderate, and difficult skills",
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
