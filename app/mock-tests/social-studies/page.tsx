import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SubjectLevelCard from "@/components/mock-tests/subject-level-card"
import { getSubjectCatalog } from "@/lib/mock-catalog"

export const metadata = {
  title: "PEP PRACTICE — Grade 5 Social Studies Mock Tests",
  description: "PEP PRACTICE — Grade 5 Social Studies mock tests with easy, moderate, difficult, and mixed practice levels.",
}

export default function SocialStudiesCategoryPage() {
  const catalog = getSubjectCatalog("social-studies")
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-gradient-to-br from-[#047857] via-[#10B981] to-[#2DD4BF] px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center text-white">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-50">PEP PRACTICE — Grade 5</p>
            <p className="mb-2 text-lg font-extrabold text-fuchsia-200 sm:text-xl">Social Studies</p>
            <h1 className="mb-3 text-4xl font-extrabold text-white sm:text-5xl">Mock Tests</h1>
            <p className="mx-auto max-w-2xl text-emerald-50">Strengthen geography, history, citizenship, and community understanding with levelled Grade 5 practice.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubjectLevelCard grade="grade5" subject="social-studies" level="easy" availableTests={catalog.easy} questions={40} minutes={60} description={["More direct questions about people, places, and community life", "Simple map and fact-based items", "Clear text clues and recall practice"]} />
            <SubjectLevelCard grade="grade5" subject="social-studies" level="moderate" availableTests={catalog.moderate} questions={40} minutes={60} description={["Closer to standard Grade 5 level", "Balanced geography, civics, and history questions", "Some interpretation and comparison"]} />
            <SubjectLevelCard grade="grade5" subject="social-studies" level="difficult" availableTests={catalog.difficult} questions={40} minutes={60} description={["More reasoning-based social studies questions", "Stronger source and scenario thinking", "More comparison, cause, and effect"]} />
            <SubjectLevelCard grade="grade5" subject="social-studies" level="mixed" availableTests={catalog.mixed} questions={40} minutes={60} description={["Blend of easy, moderate, and difficult items", "Best exam-style simulation", "Strong preparation for formal assessment"]} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
