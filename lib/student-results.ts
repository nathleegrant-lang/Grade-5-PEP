import type { SupabaseClient } from "@supabase/supabase-js"
export type CompletedResult = {
  id: string; student_id: string; parent_id: string; subject: string; test_name: string
  difficulty: string | null; score: number; total_questions: number; percentage: number
  completed_at: string; category?: string | null
}
export function normalizeSubject(subject: string): string {
  const s = (subject || "").toLowerCase().trim()
  if (s === "numeracy" || s === "mathematics") return "Mathematics"
  if (s === "literacy" || s === "language arts" || s === "language-arts") return "Language Arts"
  if (s === "science") return "Science"
  if (s === "social studies" || s === "social-studies") return "Social Studies"
  return subject
}
export async function fetchLearnerDashboard(supabase: SupabaseClient, studentId: string, signal?: AbortSignal) {
  if (!studentId) throw new Error("Choose a student.")
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.access_token) throw new Error("Sign in to view results.")
  const response = await fetch("/api/dashboard/results?student_id=" + encodeURIComponent(studentId), {
    method: "GET", cache: "no-store", signal, headers: { Authorization: `Bearer ${session.access_token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Unable to load results.")
  if (data.student_id !== studentId || data.selectedStudent?.id !== studentId) throw new Error("Student response mismatch.")
  return data
}
export async function fetchCompletedStudentResults(supabase: SupabaseClient, options: { userId: string; studentId: string; studentName?: string | null }): Promise<CompletedResult[]> {
  const data = await fetchLearnerDashboard(supabase, options.studentId)
  if (data.selectedStudent.parent_id !== options.userId) throw new Error("Parent response mismatch.")
  return data.testResults
}
