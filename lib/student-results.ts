import type { SupabaseClient } from "@supabase/supabase-js"

export type CompletedResult = {
  id: string
  subject: string
  test_name: string
  difficulty: string | null
  score: number
  total_questions: number
  percentage: number
  completed_at: string
  category?: string | null
}

export function normalizeSubject(subject: string): string {
  const s = (subject || "").toLowerCase().trim()
  if (s === "numeracy" || s === "mathematics") return "Mathematics"
  if (s === "literacy" || s === "language arts" || s === "language-arts") return "Language Arts"
  if (s === "science") return "Science"
  if (s === "social studies" || s === "social-studies") return "Social Studies"
  return subject
}

export async function fetchCompletedStudentResults(
  supabase: SupabaseClient,
  options: { userId: string; studentId?: string | null; studentName?: string | null },
): Promise<CompletedResult[]> {
  const filters = [`parent_id.eq.${options.userId}`, `student_id.eq.${options.userId}`]

  if (options.studentId) filters.push(`student_id.eq.${options.studentId}`)
  if (options.studentName) filters.push(`student_name.eq.${options.studentName}`)

  const { data } = await supabase
    .from("student_test_results")
    .select("id, subject, test_name, difficulty, score, total_questions, percentage, completed_at, category")
    .or(filters.join(","))
    .order("completed_at", { ascending: false })

  return ((data || []) as any[]).map((r) => {
    const pct = Number(r.percentage)
    const fallback = Number(r.score)

    return {
      id: r.id,
      subject: normalizeSubject(r.subject),
      test_name: r.test_name,
      difficulty: r.difficulty ?? null,
      score: Number(r.score) || 0,
      total_questions: Number(r.total_questions) || 0,
      percentage: Number.isFinite(pct) ? pct : Number.isFinite(fallback) ? fallback : 0,
      completed_at: r.completed_at,
      category: r.category ?? null,
    }
  })
}
