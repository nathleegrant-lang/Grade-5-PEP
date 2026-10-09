import { NextRequest, NextResponse } from "next/server"
import { belongsToLearner, issuedCertificateForResult, LearnerResultError, ownedLearner } from "@/lib/learner-result-security"
import { normalizeSubject } from "@/lib/student-results"
export async function GET(request: NextRequest) {
  try {
    const requestedStudent = new URL(request.url).searchParams.get("student_id")
    const { db, parentId, student } = await ownedLearner(request, requestedStudent)
    const [results, certificates] = await Promise.all([
      db.from("student_test_results").select("*").eq("parent_id", parentId).eq("student_id", student.id).eq("grade", "grade5"),
      db.from("certificates").select("*").eq("parent_id", parentId).eq("student_id", student.id).eq("grade", "grade5"),
    ])
    if (results.error || certificates.error) throw new LearnerResultError(500, "Unable to load student results")
    const rows = (results.data || []).filter((r: any) => belongsToLearner(r, parentId, student.id))
    const byId = new Map<string, any>(rows.map((r: any) => [r.id, r]))
    const mapped = rows.map((r: any) => ({
      id: String(r.id), student_id: student.id, parent_id: parentId,
      subject: normalizeSubject(String(r.subject || "")), test_name: String(r.test_name || ""),
      difficulty: r.difficulty ?? null, score: Number(r.score ?? r.correct_answers ?? 0),
      total_questions: Number(r.total_questions ?? 0),
      percentage: Number(r.percentage ?? (Number(r.total_questions) > 0 ? Math.round(Number(r.score) / Number(r.total_questions) * 100) : 0)),
      completed_at: r.completed_at || r.created_at, category: r.category ?? null,
    })).sort((a: any,b: any) => Date.parse(b.completed_at) - Date.parse(a.completed_at))
    const certs = (certificates.data || []).filter((c: any) =>
      belongsToLearner(c, parentId, student.id) && byId.has(c.test_result_id) && issuedCertificateForResult(c, byId.get(c.test_result_id))
    ).map((c: any) => ({
      id: String(c.id), student_id: student.id, parent_id: parentId, test_result_id: c.test_result_id,
      student_name: student.full_name, subject: normalizeSubject(String(c.subject || "")),
      test_name: String(c.test_name || ""), score: Number(c.score), total_questions: Number(c.total_questions),
      percentage: Number(c.percentage), certificate_title: String(c.certificate_title || "Certificate of Achievement"),
      issued_at: c.issued_at || c.created_at,
    })).sort((a: any,b: any) => Date.parse(b.issued_at) - Date.parse(a.issued_at))
    return NextResponse.json({ testResults: mapped, earnedCertificates: certs, selectedStudent: student, student_id: student.id },
      { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof LearnerResultError ? error.message : "Unable to load student results" },
      { status: error instanceof LearnerResultError ? error.status : 500, headers: { "Cache-Control": "no-store" } })
  }
}
