import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
export class LearnerResultError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
export const isStudentId = (id: unknown): id is string =>
  typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
export async function ownedLearner(request: Request, studentId: unknown, parentId?: unknown) {
  const token = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") || "")?.[1]
  if (!token) throw new LearnerResultError(401, "Unauthorized")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new LearnerResultError(500, "Result service unavailable")
  const auth = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: { user }, error } = await auth.auth.getUser(token)
  if (error || !user) throw new LearnerResultError(401, "Unauthorized")
  if (!isStudentId(studentId)) throw new LearnerResultError(400, "Select a student before continuing")
  if (parentId !== undefined && parentId !== user.id) throw new LearnerResultError(403, "Contradictory parent identity")
  const db = getSupabaseAdminClient()
  const profile = await db.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile.error) throw new LearnerResultError(500, "Unable to verify Parent")
  if (profile.data?.role !== "parent") throw new LearnerResultError(403, "Parent account required")
  const student = await db.from("students").select("id, parent_id, full_name, grade_level").eq("id", studentId).eq("parent_id", user.id).maybeSingle()
  if (student.error) throw new LearnerResultError(500, "Unable to verify student")
  if (!student.data || student.data.parent_id !== user.id || student.data.id !== studentId || Number(student.data.grade_level) !== 5) throw new LearnerResultError(404, "Student not available")
  return { db, parentId: user.id, student: student.data }
}
export function belongsToLearner(row: Record<string, any>, parentId: string, studentId: string) {
  return row.parent_id === parentId && row.student_id === studentId && row.grade === "grade5"
}
export function issuedCertificateForResult(cert: Record<string, any>, result: Record<string, any>) {
  return cert.test_result_id === result.id && cert.parent_id === result.parent_id &&
    cert.student_id === result.student_id && cert.grade === "grade5" &&
    Number(result.percentage) >= 80 && Number(result.total_questions) >= 40 &&
    Number(cert.percentage) === Number(result.percentage) && Number(cert.total_questions) === Number(result.total_questions) &&
    Number(cert.score) === Number(result.score) && cert.subject === result.subject && cert.test_name === result.test_name
}
