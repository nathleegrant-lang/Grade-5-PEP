import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeName } from "@/lib/result-matching"

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
  const filters = [`parent_id.eq.${options.userId}`]
  if (options.studentId) filters.push(`student_id.eq.${options.studentId}`)
  if (options.studentName) filters.push(`student_name.eq.${options.studentName}`, `name.eq.${options.studentName}`, `full_name.eq.${options.studentName}`, `learner_name.eq.${options.studentName}`)

  const { data } = await supabase
    .from("student_test_results")
    .select("*")
    .or(filters.join(","))
    .order("completed_at", { ascending: false })

  const rows = (data || []) as any[]
  const selectedName = options.studentName ? normalizeName(options.studentName) : null

  const filteredRows = rows.filter((r) => {
    if (options.studentId && r.student_id === options.studentId) return true

    const hasParentOrStudentId = Boolean(r.parent_id || r.student_id)
    const rowName = normalizeName(String(r.student_name || r.full_name || r.name || r.learner_name || ""))

    if (!hasParentOrStudentId) {
      if (!selectedName) return true
      return rowName === selectedName
    }

    if (r.parent_id === options.userId) {
      // If row has only parent_id and no name, still count it for this parent's selected student.
      if (!rowName) return true
      if (!selectedName) return true
      return rowName === selectedName
    }

    if (selectedName) return rowName === selectedName
    return false
  })

  console.log("[Dashboard] student_test_results sample row:", rows[0] ?? null)
  console.log("[Dashboard] matched student name/id:", options.studentName ?? null, options.studentId ?? null)
  console.log("[Dashboard] matched results count:", filteredRows.length)

  return filteredRows.map((r) => {
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
