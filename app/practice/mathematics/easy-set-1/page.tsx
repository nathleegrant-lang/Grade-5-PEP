import InteractiveQuiz from "@/components/interactive-quiz"
import { mathematicsEasySet1 } from "@/lib/quiz-data"

export const metadata = {
  title: "Grade 5 PEP Mathematics Easy Set 1",
  description:
    "Interactive Grade 5 PEP Mathematics practice with instant feedback.",
}

export default function MathematicsEasySet1Page() {
  return (
    <main className="min-h-screen bg-green-50 px-4 py-10">
      <InteractiveQuiz
        title="Grade 5 PEP Mathematics - Easy Set 1"
        questions={mathematicsEasySet1}
      />
    </main>
  )
}
