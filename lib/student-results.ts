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
  if (s === "literacy" || s === "language arts" || s === "language-arts") {
    return "Language Arts"
  }
  if (s === "science") return "Science"
  if (s === "social studies" || s === "social-studies") return "Social Studies"

  return subject
}

export async function fetchCompletedStudentResults(
  supabase: SupabaseClient,
  options: {
    userId: string
    studentId?: string | null
    studentName?: string | null
  },
): Promise<CompletedResult[]> {
  const filters = [`parent_id.eq.${options.userId}`]

  if (options.studentId) {
    filters.push(`student_id.eq.${options.studentId}`)
  }

  if (options.studentName) {
    filters.push(
      `student_name.eq.${options.studentName}`,
      `name.eq.${options.studentName}`,
      `full_name.eq.${options.studentName}`,
      `learner_name.eq.${options.studentName}`,
    )
  }

  const { data, error } = await supabase
    .from("student_test_results")
    .select("*")
    .or(filters.join(","))
    .order("completed_at", { ascending: false })

  if (error) {
    console.error("[Dashboard] student_test_results fetch error:", error)
    return []
  }

  const rows = (data || []) as any[]
  const selectedName = options.studentName ? normalizeName(options.studentName) : null

  const filteredRows = rows.filter((r) => {
    if (options.studentId && r.student_id === options.studentId) {
      return true
    }

    if (r.parent_id === options.userId) {
      return true
    }

    if (selectedName) {
      const rowName = normalizeName(
        String(
          r.student_name ||
            r.full_name ||
            r.name ||
            r.learner_name ||
            "",
        ),
      )

      if (rowName === selectedName) {
        return true
      }
    }

    return false
  })

  console.log("[Dashboard] student_test_results sample row:", rows[0] ?? null)
  console.log(
    "[Dashboard] matched student name/id:",
    options.studentName ?? null,
    options.studentId ?? null,
  )
  console.log("[Dashboard] matched results count:", filteredRows.length)

  return filteredRows.map((r) => {
    const pct = Number(r.percentage)
    const score = Number(r.score)
    const totalQuestions = Number(r.total_questions)

    let percentage = 0

    if (Number.isFinite(pct)) {
      percentage = pct
    } else if (
      Number.isFinite(score) &&
      Number.isFinite(totalQuestions) &&
      totalQuestions > 0
    ) {
      percentage = Math.round((score / totalQuestions) * 100)
    } else if (Number.isFinite(score)) {
      percentage = score
    }

    return {
      id: String(r.id),
      subject: normalizeSubject(String(r.subject || "")),
      test_name: String(r.test_name || ""),
      difficulty: r.difficulty ?? null,
      score: Number.isFinite(score) ? score : 0,
      total_questions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
      percentage,
      completed_at:
        r.completed_at ||
        r.created_at ||
        r.submitted_at ||
        r.taken_at ||
        new Date().toISOString(),
      category: r.category ?? null,
    }
  })
}
