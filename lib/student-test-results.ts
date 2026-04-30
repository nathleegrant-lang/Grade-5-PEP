import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export interface SaveStudentTestResultInput {
  parentId: string
  studentId?: string | null
  grade: "grade5"
  subject: string
  testName: string
  difficulty: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: string
}

export async function saveStudentTestResult(input: SaveStudentTestResultInput) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("student_test_results").insert({
    parent_id: input.parentId,
    student_id: input.studentId ?? null,
    grade: input.grade,
    subject: input.subject,
    test_name: input.testName,
    difficulty: input.difficulty,
    score: input.score,
    total_questions: input.totalQuestions,
    percentage: input.percentage,
    completed_at: input.completedAt,
  })

  if (error) {
    throw error
  }
}
