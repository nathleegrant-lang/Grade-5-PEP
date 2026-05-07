import { NextResponse } from "next/server"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getId, getString, resolveResultStudentMatch } from "@/lib/result-matching"

type GenericRow = Record<string, unknown>
type ParentReport = { id: string; name: string; email: string; accessStatus: string; studentsCount: number; resultsCount: number; certificatesCount: number }
type StudentReport = { id: string; name: string; grade: string; parentId: string; resultsCount: number; certificatesCount: number; latestResult: string; missingParentId: boolean }

type AdminProfile = { id: string; role: string | null }

const formatDateTime = (value: unknown) => {
  if (typeof value !== "string") return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toISOString()
}

export async function GET() {
  try {
    const serverClient = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await serverClient.auth.getUser()

    console.log("[admin/reports] auth user id", user?.id ?? null)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getSupabaseAdminClient()
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle<AdminProfile>()

    console.log("[admin/reports] fetched profile", profile ?? null)
    console.log("[admin/reports] detected role", profile?.role ?? null)

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [profilesRes, studentsRes, resultsRes, certsRes, paymentsRes, subscriptionsRes] = await Promise.all([
      db.from("profiles").select("*"),
      db.from("students").select("*"),
      db.from("student_test_results").select("*"),
      db.from("certificates").select("*"),
      db.from("payments").select("*"),
      db.from("subscriptions").select("*"),
    ])

    const profileRows = (profilesRes.data || []) as GenericRow[]
    const studentRows = (studentsRes.data || []) as GenericRow[]
    const resultRows = (resultsRes.data || []) as GenericRow[]
    const certRows = (certsRes.data || []) as GenericRow[]
    const paymentRows = (paymentsRes.data || []) as GenericRow[]
    const subscriptionRows = (subscriptionsRes.data || []) as GenericRow[]

    const parentMap = new Map<string, ParentReport>()
    for (const [i, profileRow] of profileRows.entries()) {
      const id = getId(profileRow, ["id"], "profile", i)
      if (getString(profileRow, ["role"]) !== "parent") continue
      parentMap.set(id, { id, name: getString(profileRow, ["full_name", "name", "parent_name"], "Unknown parent"), email: getString(profileRow, ["email"], "No email"), accessStatus: "No payment", studentsCount: 0, resultsCount: 0, certificatesCount: 0 })
    }

    const accessMap = new Map<string, string>()
    for (const payment of paymentRows) {
      const parentId = getString(payment, ["parent_id", "user_id"])
      if (parentId) accessMap.set(parentId, getString(payment, ["status"], "unknown"))
    }
    for (const subscription of subscriptionRows) {
      const parentId = getString(subscription, ["parent_id", "user_id"])
      if (parentId && !accessMap.has(parentId)) accessMap.set(parentId, getString(subscription, ["status"], "unknown"))
    }

    const studentsById = new Map<string, GenericRow>()
    const studentsByNameAndParent = new Map<string, string>()
    const studentIdsByName = new Map<string, string[]>()
    const studentIdsByParent = new Map<string, string[]>()

    for (const [index, student] of studentRows.entries()) {
      const sid = getId(student, ["id", "student_id"], "student", index)
      studentsById.set(sid, student)
      const parentId = getString(student, ["parent_id"]) || "MISSING_PARENT_ID"
      const normalizedName = getString(student, ["full_name", "student_name", "name"]).toLowerCase()
      if (normalizedName) {
        studentsByNameAndParent.set(`${parentId}::${normalizedName}`, sid)
        studentIdsByName.set(normalizedName, [...(studentIdsByName.get(normalizedName) || []), sid])
      }
      studentIdsByParent.set(parentId, [...(studentIdsByParent.get(parentId) || []), sid])
      const parent = parentMap.get(parentId)
      if (parent) parent.studentsCount += 1
    }

    const studentResultCount = new Map<string, number>()
    const studentCertCount = new Map<string, number>()
    const studentLatestResult = new Map<string, string>()

    for (const result of resultRows) {
      const resultParentId = getString(result, ["parent_id"])
      const matched = resolveResultStudentMatch(result, studentsById, studentsByNameAndParent)
      const resultStudentId = matched?.matchedStudentId || getString(result, ["student_id"])
      const createdAt = getString(result, ["created_at", "submitted_at", "taken_at", "completed_at"])

      for (const [parentId, parent] of parentMap.entries()) {
        const parentStudentIds = studentIdsByParent.get(parentId) || []
        if (resultParentId === parentId || (resultStudentId && parentStudentIds.includes(resultStudentId))) parent.resultsCount += 1
      }

      if (resultStudentId) {
        studentResultCount.set(resultStudentId, (studentResultCount.get(resultStudentId) || 0) + 1)
        const currentLatest = studentLatestResult.get(resultStudentId)
        if (!currentLatest || new Date(createdAt) > new Date(currentLatest)) studentLatestResult.set(resultStudentId, createdAt)
      }
    }

    for (const cert of certRows) {
      const certStudentId = getString(cert, ["student_id"])
      const certParentId = getString(cert, ["parent_id"])
      const certStudentName = getString(cert, ["student_name", "name"]).toLowerCase()

      for (const [parentId, parent] of parentMap.entries()) {
        const parentStudentIds = studentIdsByParent.get(parentId) || []
        const matchedByName = certStudentName
          ? parentStudentIds.some((sid) => getString(studentsById.get(sid) || {}, ["full_name", "student_name", "name"]).toLowerCase() === certStudentName)
          : false
        if (certParentId === parentId || (certStudentId && parentStudentIds.includes(certStudentId)) || matchedByName) parent.certificatesCount += 1
      }

      let matchedStudentId = certStudentId
      if (!matchedStudentId && certStudentName) {
        const candidates = studentIdsByName.get(certStudentName) || []
        if (candidates.length === 1) matchedStudentId = candidates[0]
      }
      if (matchedStudentId) studentCertCount.set(matchedStudentId, (studentCertCount.get(matchedStudentId) || 0) + 1)
    }

    for (const parent of parentMap.values()) parent.accessStatus = accessMap.get(parent.id) || parent.accessStatus

    const studentReports: StudentReport[] = studentRows.map((student, index) => {
      const id = getId(student, ["id", "student_id"], "student", index)
      const parentId = getString(student, ["parent_id"], "MISSING_PARENT_ID")
      return { id, name: getString(student, ["full_name", "student_name", "name"], "Unknown student"), grade: getString(student, ["grade", "grade_level"], "Unknown"), parentId, resultsCount: studentResultCount.get(id) || 0, certificatesCount: studentCertCount.get(id) || 0, latestResult: formatDateTime(studentLatestResult.get(id)), missingParentId: parentId === "MISSING_PARENT_ID" }
    })

    return NextResponse.json({ totalParents: parentMap.size, totalStudents: studentRows.length, totalTestResults: resultRows.length, totalCertificates: certRows.length, parents: Array.from(parentMap.values()), students: studentReports, debug: { resultRows: resultRows.slice(0, 5), profileRows: profileRows.slice(0, 3), studentRows: studentRows.slice(0, 3) } })
  } catch (error) {
    console.error("[admin/reports]", error)
    return NextResponse.json({ error: "Failed to load admin reports" }, { status: 500 })
  }
}
