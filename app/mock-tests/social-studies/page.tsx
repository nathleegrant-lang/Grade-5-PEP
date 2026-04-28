import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export default function SocialStudiesCategoryPage() {
  const catalog = getSubjectCatalog("social-studies")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              Social Studies Mock Tests
            </h1>
            <p className="text-slate-600">
              Strengthen geography, history, citizenship, and community understanding with levelled practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubjectLevelCard
              subject="social-studies"
              level="easy"
              availableTests={catalog.easy}
              questions={40}
              minutes={60}
              description={[
                "More direct questions about people, places, and community life",
                "Simple map and fact-based items",
                "Clear text clues and recall practice",
              ]}
            />

            <SubjectLevelCard
              subject="social-studies"
              level="moderate"
              availableTests={catalog.moderate}
              questions={40}
              minutes={60}
              description={[
                "Closer to standard Grade 5 level",
                "Balanced geography, civics, and history questions",
                "Some interpretation and comparison",
              ]}
            />

            <SubjectLevelCard
              subject="social-studies"
              level="difficult"
              availableTests={catalog.difficult}
              questions={40}
              minutes={60}
              description={[
                "More reasoning-based social studies questions",
                "Stronger source and scenario thinking",
                "More comparison, cause, and effect",
              ]}
            />

            <SubjectLevelCard
              subject="social-studies"
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
