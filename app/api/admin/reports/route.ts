import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getId, getString, resolveResultStudentMatch } from "@/lib/result-matching"

type GenericRow = Record<string, unknown>

type ParentReport = {
  id: string
  name: string
  email: string
  accessStatus: string
  studentsCount: number
  resultsCount: number
  certificatesCount: number
}

type StudentReport = {
  id: string
  name: string
  grade: string
  parentId: string
  resultsCount: number
  certificatesCount: number
  latestResult: string
  missingParentId: boolean
}

type AdminProfile = {
  id: string
  role: string | null
}

const formatDateTime = (value: unknown) => {
  if (typeof value !== "string") return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toISOString()
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

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle<AdminProfile>()

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

   const [
  profilesRes,
  studentsRes,
  resultsRes,
  certsRes,
  paymentsRes,
  subscriptionsRes,
  visitsRes,
] = await Promise.all([
  db.from("profiles").select("*"),
  db.from("students").select("*"),
  db.from("student_test_results").select("*"),
  db.from("certificates").select("*"),
  db.from("payments").select("*"),
  db.from("subscriptions").select("*"),
  db.from("site_visits").select("*"),
])

    const profileRows = (profilesRes.data || []) as GenericRow[]
    const studentRows = (studentsRes.data || []) as GenericRow[]
    const resultRows = (resultsRes.data || []) as GenericRow[]
    const certRows = (certsRes.data || []) as GenericRow[]
    const paymentRows = (paymentsRes.data || []) as GenericRow[]
    const subscriptionRows = (subscriptionsRes.data || []) as GenericRow[]
    const visitRows = ((visitsRes.data || []) as GenericRow[]).filter(
  (visit) => !String(visit.page_path || "").startsWith("/admin"),
)

    const parentMap = new Map<string, ParentReport>()

    for (const [i, profileRow] of profileRows.entries()) {
      if (getString(profileRow, ["role"]) !== "parent") continue

      const id = getId(profileRow, ["id"], "profile", i)

      parentMap.set(id, {
        id,
        name: getString(profileRow, ["full_name", "name", "parent_name"], "Unknown parent"),
        email: getString(profileRow, ["email"], "No email"),
        accessStatus: "No payment",
        studentsCount: 0,
        resultsCount: 0,
        certificatesCount: 0,
      })
    }

    const accessMap = new Map<string, string>()

    for (const payment of paymentRows) {
      const parentId = getString(payment, ["parent_id", "user_id"])
      if (parentId) accessMap.set(parentId, getString(payment, ["status"], "unknown"))
    }

    for (const subscription of subscriptionRows) {
      const parentId = getString(subscription, ["parent_id", "user_id"])
      if (parentId && !accessMap.has(parentId)) {
        accessMap.set(parentId, getString(subscription, ["status"], "unknown"))
      }
    }

    const studentsById = new Map<string, GenericRow>()
    const studentsByNameAndParent = new Map<string, string>()
    const studentIdsByName = new Map<string, string[]>()
    const studentIdsByParent = new Map<string, string[]>()

    for (const [index, student] of studentRows.entries()) {
      const sid = getId(student, ["id", "student_id"], "student", index)
      const parentId = getString(student, ["parent_id"]) || "MISSING_PARENT_ID"
      const normalizedName = getString(student, ["full_name", "student_name", "name"]).toLowerCase()

      studentsById.set(sid, student)

      if (normalizedName) {
        studentsByNameAndParent.set(`${parentId}::${normalizedName}`, sid)
        studentIdsByName.set(normalizedName, [
          ...(studentIdsByName.get(normalizedName) || []),
          sid,
        ])
      }

      studentIdsByParent.set(parentId, [
        ...(studentIdsByParent.get(parentId) || []),
        sid,
      ])

      const parent = parentMap.get(parentId)
      if (parent) parent.studentsCount += 1
    }

    const studentResultCount = new Map<string, number>()
    const studentCertCount = new Map<string, number>()
    const studentLatestResult = new Map<string, string>()

    for (const result of resultRows) {
      const resultParentId = getString(result, ["parent_id"])
      const matched = resolveResultStudentMatch(result, studentsById, studentsByNameAndParent)

      let resultStudentId =
        matched?.matchedStudentId || getString(result, ["student_id"])

      const createdAt = getString(result, [
        "completed_at",
        "created_at",
        "submitted_at",
        "taken_at",
      ])

      if (resultParentId && parentMap.has(resultParentId)) {
        parentMap.get(resultParentId)!.resultsCount += 1
      }

      if (!resultStudentId && resultParentId) {
        const studentIdsForParent = studentIdsByParent.get(resultParentId) || []
        if (studentIdsForParent.length === 1) {
          resultStudentId = studentIdsForParent[0]
        }
      }

      if (resultStudentId) {
        studentResultCount.set(
          resultStudentId,
          (studentResultCount.get(resultStudentId) || 0) + 1,
        )

        const currentLatest = studentLatestResult.get(resultStudentId)
        if (!currentLatest || new Date(createdAt) > new Date(currentLatest)) {
          studentLatestResult.set(resultStudentId, createdAt)
        }
      }
    }

    for (const cert of certRows) {
      const certStudentId = getString(cert, ["student_id"])
      const certParentId = getString(cert, ["parent_id"])
      const certStudentName = getString(cert, ["student_name", "name"]).toLowerCase()

      if (certParentId && parentMap.has(certParentId)) {
        parentMap.get(certParentId)!.certificatesCount += 1
      }

      let matchedStudentId = certStudentId

      if (!matchedStudentId && certStudentName && certParentId) {
        matchedStudentId =
          studentsByNameAndParent.get(`${certParentId}::${certStudentName}`) || ""
      }

      if (!matchedStudentId && certStudentName) {
        const candidates = studentIdsByName.get(certStudentName) || []
        if (candidates.length === 1) matchedStudentId = candidates[0]
      }

      if (!matchedStudentId && certParentId) {
        const studentIdsForParent = studentIdsByParent.get(certParentId) || []
        if (studentIdsForParent.length === 1) {
          matchedStudentId = studentIdsForParent[0]
        }
      }

      if (matchedStudentId) {
        studentCertCount.set(
          matchedStudentId,
          (studentCertCount.get(matchedStudentId) || 0) + 1,
        )
      }
    }

    for (const parent of parentMap.values()) {
      parent.accessStatus = accessMap.get(parent.id) || parent.accessStatus
    }

    const studentReports: StudentReport[] = studentRows.map((student, index) => {
      const id = getId(student, ["id", "student_id"], "student", index)
      const parentId = getString(student, ["parent_id"], "MISSING_PARENT_ID")

      return {
        id,
        name: getString(student, ["full_name", "student_name", "name"], "Unknown student"),
        grade: getString(student, ["grade", "grade_level"], "Unknown"),
        parentId,
        resultsCount: studentResultCount.get(id) || 0,
        certificatesCount: studentCertCount.get(id) || 0,
        latestResult: formatDateTime(studentLatestResult.get(id)),
        missingParentId: parentId === "MISSING_PARENT_ID",
      }
    })
    const totalVisits = visitRows.length

const uniqueVisitors = new Set(
  visitRows.map((visit) => String(visit.session_id || "")),
).size

const visitorSummary = Object.values(
  visitRows.reduce<Record<string, {
    session_id: string
    total_views: number
    last_page: string
    last_seen_at: string
  }>>((acc, visit) => {
    const key = String(visit.session_id || "unknown")

    if (!acc[key]) {
      acc[key] = {
        session_id: key,
        total_views: 0,
        last_page: String(visit.page_path || "/"),
        last_seen_at: String(visit.created_at || new Date().toISOString()),
      }
    }

    acc[key].total_views += 1

    if (new Date(String(visit.created_at)) > new Date(acc[key].last_seen_at)) {
      acc[key].last_page = String(visit.page_path || "/")
      acc[key].last_seen_at = String(visit.created_at || new Date().toISOString())
    }

    return acc
  }, {}),
).sort(
  (a, b) =>
    new Date(b.last_seen_at).getTime() -
    new Date(a.last_seen_at).getTime(),
)

    return NextResponse.json({
      totalParents: parentMap.size,
      totalStudents: studentRows.length,
      totalTestResults: resultRows.length,
      totalCertificates: certRows.length,
      totalVisits,
uniqueVisitors,
recentVisits: visitRows.slice(0, 20),
visitorSummary,
      parents: Array.from(parentMap.values()),
      students: studentReports,
      debug: {
        resultRows: resultRows.slice(0, 5),
        profileRows: profileRows.slice(0, 3),
        studentRows: studentRows.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("[admin/reports]", error)
    return NextResponse.json(
      { error: "Failed to load admin reports" },
      { status: 500 },
    )
  }
}
