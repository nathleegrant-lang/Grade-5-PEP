import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export const metadata = {
  title: "Grade 5 PEP Language Arts Mock Tests",
  description:
    "Grade 5 PEP Language Arts mock tests with easy, moderate, difficult, and mixed practice levels.",
}

export default function LanguageArtsCategoryPage() {
  const catalog = getSubjectCatalog("literacy")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Language Arts Mock Tests
            </h1>
            <p className="text-slate-600">
              Strengthen reading, vocabulary, grammar, and writing with
              levelled Grade 5 PEP practice.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubjectLevelCard
              grade="grade5"
              subject="literacy"
              level="easy"
              availableTests={catalog.easy}
              questions={40}
              minutes={60}
              description={[
                "Shorter passages",
                "Direct recall",
                "Clear text clues",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="literacy"
              level="moderate"
              availableTests={catalog.moderate}
              questions={40}
              minutes={60}
              description={[
                "Closer to standard Grade 5 PEP level",
                "More inference and main idea",
                "Some two-step thinking",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="literacy"
              level="difficult"
              availableTests={catalog.difficult}
              questions={40}
              minutes={60}
              description={[
                "More reasoning-based",
                "Stronger distractors",
                "Closer reading and editing in context",
              ]}
            />

            <SubjectLevelCard
              grade="grade5"
              subject="literacy"
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
