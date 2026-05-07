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
import { getString } from "@/lib/result-matching"

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

export default function AdminReportsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [loadingData, setLoadingData] = useState(true)
  const [parents, setParents] = useState<ParentReport[]>([])
  const [students, setStudents] = useState<StudentReport[]>([])
  const [resultDebugRows, setResultDebugRows] = useState<GenericRow[]>([])
  const [summary, setSummary] = useState({
    totalParents: 0,
    totalStudents: 0,
    totalResults: 0,
    totalCertificates: 0,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?next=/admin/reports")
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token

        if (!token) {
          throw new Error("No session token found")
        }

        const response = await fetch("/api/admin/reports", {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed with ${response.status}`)
        }

        const data = await response.json()

        setParents(data.parents || [])
        setStudents(data.students || [])
        setResultDebugRows(data.debug?.resultRows || [])

        setSummary({
          totalParents: data.totalParents || 0,
          totalStudents: data.totalStudents || 0,
          totalResults: data.totalTestResults || 0,
          totalCertificates: data.totalCertificates || 0,
        })
      } catch (error) {
        console.error("Failed loading admin report data:", error)

        setParents([])
        setStudents([])
        setResultDebugRows([])

        setSummary({
          totalParents: 0,
          totalStudents: 0,
          totalResults: 0,
          totalCertificates: 0,
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (!isLoading && isAuthenticated && isAdmin) {
      void loadData()
    }
  }, [isLoading, isAuthenticated, isAdmin, supabase])

  if (isLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading reports...
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-sky-50">
      <Header />

      <main className="container mx-auto max-w-7xl space-y-6 px-4 py-10">
        <Link href="/admin">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <FileText className="text-sky-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            Parent & Student Reports
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              Total Parents
              <br />
              <b>{summary.totalParents}</b>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              Total Students
              <br />
              <b>{summary.totalStudents}</b>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              Total Test Results
              <br />
              <b>{summary.totalResults}</b>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              Total Certificates
              <br />
              <b>{summary.totalCertificates}</b>
            </CardContent>
          </Card>
        </div>

       

        <Card>
          <CardHeader>
            <CardTitle>Parents</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th>Parent Name</th>
                  <th>Parent Email</th>
                  <th>Plan/Access Status</th>
                  <th># Students</th>
                  <th># Test Results</th>
                  <th># Certificates</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className="border-b">
                    <td>{parent.name}</td>
                    <td>{parent.email}</td>
                    <td>
                      <Badge>{parent.accessStatus}</Badge>
                    </td>
                    <td>{parent.studentsCount}</td>
                    <td>{parent.resultsCount}</td>
                    <td>{parent.certificatesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Parent ID</th>
                  <th># Results</th>
                  <th># Certificates</th>
                  <th>Latest Result</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td>{student.name}</td>
                    <td>{student.grade}</td>
                    <td>
                      {student.parentId}
                      {student.missingParentId && (
                        <span className="ml-2 text-xs font-semibold text-red-600">
                          Missing parent_id
                        </span>
                      )}
                    </td>
                    <td>{student.resultsCount}</td>
                    <td>{student.certificatesCount}</td>
                    <td>{student.latestResult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
