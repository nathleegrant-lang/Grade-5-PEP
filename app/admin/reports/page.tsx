"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, FileText } from "lucide-react"
import { getId, getString, resolveResultStudentMatch } from "@/lib/result-matching"

type GenericRow = Record<string, unknown>
type ParentReport = { id: string; name: string; email: string; accessStatus: string; studentsCount: number; resultsCount: number; certificatesCount: number }
type StudentReport = { id: string; name: string; grade: string; parentId: string; resultsCount: number; certificatesCount: number; latestResult: string; missingParentId: boolean }

const formatDateTime = (value: unknown) => { if (typeof value !== "string") return "—"; const date = new Date(value); if (Number.isNaN(date.getTime())) return "—"; return date.toLocaleString() }

export default function AdminReportsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [loadingData, setLoadingData] = useState(true)
  const [parents, setParents] = useState<ParentReport[]>([])
  const [students, setStudents] = useState<StudentReport[]>([])
  const [summary, setSummary] = useState({ totalParents: 0, totalStudents: 0, totalResults: 0, totalCertificates: 0 })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login?next=/admin/reports")
    if (!isLoading && isAuthenticated && !isAdmin) router.push("/dashboard")
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      const [profilesRes, studentsRes, resultsRes, certsRes, paymentsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("students").select("*"),
        supabase.from("student_test_results").select("*"),
        supabase.from("certificates").select("*"),
        supabase.from("payments").select("*").eq("grade", "grade5"),
      ])
      const profileRows = (profilesRes.data || []) as GenericRow[]
      const studentRows = (studentsRes.data || []) as GenericRow[]
      const resultRows = (resultsRes.data || []) as GenericRow[]
      const certRows = (certsRes.data || []) as GenericRow[]
      const paymentRows = (paymentsRes.data || []) as GenericRow[]
      const parentMap = new Map<string, ParentReport>()
      for (const [i, profile] of profileRows.entries()) {
        const id = getId(profile, ["id", "user_id", "parent_id"], "profile", i)
        parentMap.set(id, { id, name: getString(profile, ["full_name", "name", "parent_name"], "Unknown parent"), email: getString(profile, ["email"], "No email"), accessStatus: "No payment", studentsCount: 0, resultsCount: 0, certificatesCount: 0 })
      }
      const accessMap = new Map<string, string>()
      for (const payment of paymentRows) {
        const parentId = getString(payment, ["parent_id", "user_id"])
        if (!parentId) continue
        accessMap.set(parentId, getString(payment, ["status"], "unknown"))
      }
      const studentsById = new Map<string, GenericRow>()
      const studentsByNameAndParent = new Map<string, string>()
      for (const [index, student] of studentRows.entries()) {
        const sid = getId(student, ["id", "student_id"], "student", index)
        studentsById.set(sid, student)
        const parentId = getString(student, ["parent_id"]) || "MISSING_PARENT_ID"
        const normalizedName = getString(student, ["full_name", "student_name", "name"]).toLowerCase()
        if (normalizedName && parentId) studentsByNameAndParent.set(`${parentId}::${normalizedName}`, sid)
        const parent = parentMap.get(parentId)
        if (parent) parent.studentsCount += 1
      }
      const studentResultCount = new Map<string, number>()
      const studentCertCount = new Map<string, number>()
      const studentLatestResult = new Map<string, string>()
      const syntheticStudents: GenericRow[] = []
      const ensureSyntheticStudent = (parentId: string, studentName: string) => {
        const normalized = studentName.toLowerCase()
        const key = `${parentId}::${normalized}`
        const existingId = studentsByNameAndParent.get(key)
        if (existingId) return existingId

        const syntheticId = `synthetic-${parentId}-${normalized.replace(/[^a-z0-9]+/g, "-")}`
        const synthetic = { id: syntheticId, parent_id: parentId, full_name: studentName, grade_level: 5 }
        syntheticStudents.push(synthetic)
        studentsById.set(syntheticId, synthetic)
        studentsByNameAndParent.set(key, syntheticId)
        if (parentMap.has(parentId)) parentMap.get(parentId)!.studentsCount += 1
        return syntheticId
      }
      console.log("[AdminReports] student_test_results columns:", resultRows[0] ? Object.keys(resultRows[0]) : [])
      console.log("[AdminReports] student_test_results sample row:", resultRows[0] ?? null)

      for (const result of resultRows) {
        const pid = getString(result, ["parent_id"])
        const fallbackName = getString(result, ["student_name", "full_name", "name", "student", "learner_name"])
        const matched = resolveResultStudentMatch(result, studentsById, studentsByNameAndParent)
        let matchedStudentId = matched?.matchedStudentId || ""

        if (!matchedStudentId && pid && fallbackName) {
          matchedStudentId = ensureSyntheticStudent(pid, fallbackName)
        }

        if (matchedStudentId) {
          studentResultCount.set(matchedStudentId, (studentResultCount.get(matchedStudentId) || 0) + 1)
          const createdAt = getString(result, ["created_at", "submitted_at", "taken_at", "completed_at"])
          const currentLatest = studentLatestResult.get(matchedStudentId)
          if (!currentLatest || new Date(createdAt) > new Date(currentLatest)) studentLatestResult.set(matchedStudentId, createdAt)
        }

        const parentId = pid || (matchedStudentId ? getString(studentsById.get(matchedStudentId) || {}, ["parent_id"]) : "")
        if (parentId && parentMap.has(parentId)) parentMap.get(parentId)!.resultsCount += 1
      }
      for (const cert of certRows) {
        const sid = getString(cert, ["student_id"])
        const pid = getString(cert, ["parent_id"])
        const studentName = getString(cert, ["student_name", "name"])
        let matchedStudentId = sid
        if (!matchedStudentId && studentName && pid) matchedStudentId = ensureSyntheticStudent(pid, studentName)
        if (matchedStudentId) studentCertCount.set(matchedStudentId, (studentCertCount.get(matchedStudentId) || 0) + 1)
        const parentId = pid || (matchedStudentId ? getString(studentsById.get(matchedStudentId) || {}, ["parent_id"]) : "")
        if (parentId && parentMap.has(parentId)) parentMap.get(parentId)!.certificatesCount += 1
      }
      for (const parent of parentMap.values()) parent.accessStatus = accessMap.get(parent.id) || parent.accessStatus
      const reportStudentRows = [...studentRows, ...syntheticStudents]
      const studentReports: StudentReport[] = reportStudentRows.map((student, index) => {
        const id = getId(student, ["id", "student_id"], "student", index)
        const parentId = getString(student, ["parent_id"], "MISSING_PARENT_ID")
        const name = getString(student, ["full_name", "student_name", "name"], "Unknown student")
        const resultsCount = studentResultCount.get(id) || 0
        console.log("[AdminReports] matched student name/id/results:", name, id, resultsCount)
        return { id, name, grade: getString(student, ["grade", "grade_level"], "Unknown"), parentId, resultsCount, certificatesCount: studentCertCount.get(id) || 0, latestResult: formatDateTime(studentLatestResult.get(id)), missingParentId: parentId === "MISSING_PARENT_ID" }
      })
      setParents(Array.from(parentMap.values()))
      setStudents(studentReports)
      setSummary({ totalParents: parentMap.size, totalStudents: reportStudentRows.length, totalResults: resultRows.length, totalCertificates: certRows.length })
      setLoadingData(false)
    }
    if (!isLoading && isAuthenticated && isAdmin) void loadData()
  }, [isLoading, isAuthenticated, isAdmin, supabase])

  if (isLoading || loadingData) return <div className="min-h-screen flex items-center justify-center">Loading reports...</div>
  if (!isAuthenticated || !isAdmin) return null

  return <div className="min-h-screen bg-sky-50"><Header /><main className="container mx-auto px-4 py-10 max-w-7xl space-y-6"><Link href="/admin"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link><div className="flex items-center gap-3"><FileText className="text-sky-600" /><h1 className="text-3xl font-bold text-slate-800">Parent & Student Reports</h1></div><div className="grid md:grid-cols-4 gap-4"><Card><CardContent className="p-4 text-center">Total Parents<br /><b>{summary.totalParents}</b></CardContent></Card><Card><CardContent className="p-4 text-center">Total Students<br /><b>{summary.totalStudents}</b></CardContent></Card><Card><CardContent className="p-4 text-center">Total Test Results<br /><b>{summary.totalResults}</b></CardContent></Card><Card><CardContent className="p-4 text-center">Total Certificates<br /><b>{summary.totalCertificates}</b></CardContent></Card></div><Card><CardHeader><CardTitle>Parents</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th>Parent Name</th><th>Parent Email</th><th>Plan/Access Status</th><th># Students</th><th># Test Results</th><th># Certificates</th></tr></thead><tbody>{parents.map((parent) => <tr key={parent.id} className="border-b"><td>{parent.name}</td><td>{parent.email}</td><td><Badge>{parent.accessStatus}</Badge></td><td>{parent.studentsCount}</td><td>{parent.resultsCount}</td><td>{parent.certificatesCount}</td></tr>)}</tbody></table></CardContent></Card><Card><CardHeader><CardTitle>Students</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th>Student Name</th><th>Grade</th><th>Parent ID</th><th># Results</th><th># Certificates</th><th>Latest Result</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b"><td>{student.name}</td><td>{student.grade}</td><td>{student.parentId}{student.missingParentId && <span className="ml-2 text-xs text-red-600 font-semibold">Missing parent_id</span>}</td><td>{student.resultsCount}</td><td>{student.certificatesCount}</td><td>{student.latestResult}</td></tr>)}</tbody></table></CardContent></Card></main><Footer /></div>
}
