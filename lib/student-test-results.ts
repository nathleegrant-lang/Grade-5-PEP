import { getSupabaseBrowserClient } from "@/lib/supabase/client"
export interface SaveStudentTestResultInput {
  parentId: string
  studentId: string
  studentName?: string | null
  grade: "grade5"
  subject: string
  testName: string
  difficulty: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: string
}
async function submit(path: string, input: Record<string, unknown>) {
  if (!input.studentId) throw new Error("Select a student before saving this result.")
  const supabase = getSupabaseBrowserClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.access_token) throw new Error("Sign in to save this result.")
  const response = await fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(input),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Unable to save this result.")
  if (data.student_id !== input.studentId) throw new Error("Result student mismatch.")
  return data.result
}
export const saveStudentTestResult = (input: SaveStudentTestResultInput) => submit("/api/assessment/results", { ...input })
export const savePerformanceTaskResult = (input: Record<string, unknown> & { studentId: string; parentId: string }) =>
  submit("/api/performance/save-result", { ...input, percentage: input.percentage ?? input.score })
