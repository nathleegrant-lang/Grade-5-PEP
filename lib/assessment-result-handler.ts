import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { LearnerResultError, ownedLearner } from "@/lib/learner-result-security"
function resultId(source: string) {
  const h = createHash("sha256").update(source).digest("hex")
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`
}
function sameRow(existing: Record<string, any>, row: Record<string, any>) {
  return Object.entries(row).every(([key, value]) =>
    key === "completed_at" || key === "issued_at" ? Date.parse(existing[key]) === Date.parse(value as string) : existing[key] === value)
}
async function insertOnce(db: any, table: string, row: Record<string, any>) {
  const existing = await db.from(table).select("*").eq("id", row.id).maybeSingle()
  if (existing.error) throw new LearnerResultError(500, "Unable to check result")
  if (existing.data) {
    if (!sameRow(existing.data, row)) throw new LearnerResultError(409, "Conflicting assessment retry")
    return existing.data
  }
  const inserted = await db.from(table).insert(row).select("*").single()
  if (!inserted.error) return inserted.data
  if (inserted.error.code === "23505") {
    const concurrent = await db.from(table).select("*").eq("id", row.id).maybeSingle()
    if (!concurrent.error && concurrent.data && sameRow(concurrent.data, row)) return concurrent.data
    throw new LearnerResultError(409, "Conflicting assessment retry")
  }
  throw new LearnerResultError(500, "Result could not be saved; retry this attempt")
}
export async function submitAssessmentResult(request: Request, performance = false) {
  try {
    let body
    try { body = await request.json() } catch { throw new LearnerResultError(400, "Invalid result request") }
    if (!body || typeof body !== "object") throw new LearnerResultError(400, "Invalid result request")
    const { db, parentId, student } = await ownedLearner(request, body.studentId !== undefined ? body.studentId : body.student_id, body.parentId !== undefined ? body.parentId : body.parent_id)
    if (body.studentId !== undefined && body.student_id !== undefined && body.studentId !== body.student_id) throw new LearnerResultError(400, "Contradictory student identity")
    if (body.parentId !== undefined && body.parent_id !== undefined && body.parentId !== body.parent_id) throw new LearnerResultError(403, "Contradictory parent identity")
    const percentage = Number(body.percentage)
    const score = performance ? Math.round(percentage) : Number(body.score)
    const total = performance ? 1 : Number(body.totalQuestions)
    const completedAt = body.completedAt ?? body.completed_at
    const subject = body.subject
    const testName = body.testName ?? body.test_name
    if (![percentage, score, total].every(Number.isFinite) || percentage < 0 || percentage > 100 || score < 0 ||
      !Number.isInteger(total) || total < 1 || (!performance && score > total) ||
      typeof completedAt !== "string" || !Number.isFinite(Date.parse(completedAt)) ||
      typeof subject !== "string" || !subject.trim() || typeof testName !== "string" || !testName.trim() ||
      (body.grade !== undefined && body.grade !== "grade5")) throw new LearnerResultError(400, "Invalid result payload")
    const row: Record<string, any> = {
      id: resultId(JSON.stringify([parentId, student.id, subject, testName, completedAt])),
      parent_id: parentId, student_id: student.id, grade: "grade5", subject,
      test_name: testName, difficulty: body.difficulty ?? null, score, total_questions: total,
      percentage: performance ? Math.round(percentage) : percentage, completed_at: completedAt,
    }
    if (performance) { row.correct_answers = row.percentage; if (body.category !== undefined) row.category = body.category }
    const result = await insertOnce(db, "student_test_results", row)
    if (row.percentage >= 80 && total >= 40) {
      await insertOnce(db, "certificates", {
        id: resultId("certificate:" + row.id), parent_id: parentId, student_id: student.id,
        test_result_id: row.id, grade: "grade5", student_name: student.full_name,
        subject, test_name: testName, score, total_questions: total, percentage: row.percentage, issued_at: completedAt,
      })
    }
    return NextResponse.json({ success: true, result, student_id: student.id }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof LearnerResultError ? error.message : "Result service unavailable" },
      { status: error instanceof LearnerResultError ? error.status : 500, headers: { "Cache-Control": "no-store" } })
  }
}
