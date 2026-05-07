import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

type GenericRow = Record<string, any>

function normalizeSubject(subject: string): string {
  const s = (subject || "").toLowerCase().trim()

  if (s === "numeracy" || s === "mathematics") return "Mathematics"
  if (s === "literacy" || s === "language arts" || s === "language-arts") return "Language Arts"
  if (s === "science") return "Science"
  if (s === "social studies" || s === "social-studies") return "Social Studies"

  return subject
}

function toPercentage(row: GenericRow): number {
  const pct = Number(row.percentage)
  if (Number.isFinite(pct)) return Math.round(pct)

  const score = Number(row.score ?? row.correct_answers ?? 0)
  const total = Number(row.total_questions ?? 0)

  if (Number.isFinite(score) && Number.isFinite(total) && total > 0) {
    return Math.round((score / total) * 100)
  }

  if (Number.isFinite(score)) return Math.round(score)

  return 0
}

function mapResult(row: GenericRow) {
  const score = Number(row.score ?? row.correct_answers ?? 0)
  const totalQuestions = Number(row.total_questions ?? 0)

  return {
    id: String(row.id),
    subject: normalizeSubject(String(row.subject || "")),
    test_name: String(row.test_name || ""),
    difficulty: row.difficulty ?? null,
    score: Number.isFinite(score) ? score : 0,
    total_questions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
    percentage: toPercentage(row),
    completed_at:
      row.completed_at ||
      row.created_at ||
      row.submitted_at ||
      row.taken_at ||
      new Date().toISOString(),
    category: row.category ?? null,
  }
}

function mapCertificate(row: GenericRow) {
  return {
    id: String(row.id),
    student_name: String(row.student_name || row.name || ""),
    subject: normalizeSubject(String(row.subject || "")),
    test_name: String(row.test_name || ""),
    score: Number(row.score ?? 0),
    total_questions: Number(row.total_questions ?? 0),
    percentage: Number(row.percentage ?? row.score ?? 0),
    certificate_title: String(row.certificate_title || "Certificate of Achievement"),
    issued_at: row.issued_at || row.created_at || new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Supabase public environment variables are missing" },
        { status: 500 },
      )
    }

    const authClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getSupabaseAdminClient()

    const [studentsRes, resultsRes, certsRes] = await Promise.all([
      db.from("students").select("*").eq("parent_id", user.id),
      db.from("student_test_results").select("*"),
      db.from("certificates").select("*"),
    ])

    const students = (studentsRes.data || []) as GenericRow[]
    const allResults = (resultsRes.data || []) as GenericRow[]
    const allCertificates = (certsRes.data || []) as GenericRow[]

    const studentIds = new Set(students.map((s) => String(s.id)))
    const studentNames = new Set(
      students
        .map((s) => String(s.full_name || s.student_name || s.name || "").toLowerCase())
        .filter(Boolean),
    )

    const matchedResults = allResults
      .filter((row) => {
        const parentMatch = row.parent_id === user.id
        const studentIdMatch = row.student_id && studentIds.has(String(row.student_id))
        const studentName = String(row.student_name || row.full_name || row.name || "").toLowerCase()
        const studentNameMatch = studentName && studentNames.has(studentName)

        return parentMatch || studentIdMatch || studentNameMatch
      })
      .map(mapResult)
      .sort(
        (a, b) =>
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
      )

    const matchedCertificates = allCertificates
      .filter((row) => {
        const parentMatch = row.parent_id === user.id
        const studentIdMatch = row.student_id && studentIds.has(String(row.student_id))
        const studentName = String(row.student_name || row.name || "").toLowerCase()
        const studentNameMatch = studentName && studentNames.has(studentName)

        return parentMatch || studentIdMatch || studentNameMatch
      })
      .map(mapCertificate)
      .sort(
        (a, b) =>
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
      )

    return NextResponse.json({
      testResults: matchedResults,
      earnedCertificates: matchedCertificates,
      selectedStudent: students[0] || null,
    })
  } catch (error) {
    console.error("[dashboard/results]", error)
    return NextResponse.json(
      { error: "Failed to load dashboard results" },
      { status: 500 },
    )
  }
}
