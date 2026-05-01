"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useProgress } from "@/contexts/progress-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { PaymentRecord } from "@/lib/types"
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  FileText,
  ArrowRight,
  Award,
  Clock,
  Target,
  CheckCircle2,
  Lock,
  User,
  Crown,
  ShieldCheck,
  Users,
} from "lucide-react"
import { getPlanLabel } from "@/lib/subscriptions"

export default function DashboardPage() {
  const router = useRouter()
  const {
    user,
    students,
    isAuthenticated,
    isLoading,
    isPremium,
    activeSubscription,
    addStudent,
    refreshUser,
  } = useAuth()
  const { progress, getTopicProgress, getCertificates } = useProgress()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [latestPayment, setLatestPayment] = useState<PaymentRecord | null>(null)
  const [latestTest, setLatestTest] = useState<any>(null)
  const [testStats, setTestStats] = useState({
  total: 0,
  average: 0,
  best: 0,
})
  const [newStudentName, setNewStudentName] = useState("")
  const [studentMessage, setStudentMessage] = useState("")
  const [studentError, setStudentError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const loadLatestPayment = async () => {
      if (!user) return

      const { data } = await supabase
        .from("payments")
        .select(
          "id, parent_id, grade, plan_code, amount_jmd, method, reference_code, proof_url, note, status, submitted_at, verified_at, rejection_reason",
        )
        .eq("parent_id", user.id)
        .eq("grade", "grade5")
        .order("submitted_at", { ascending: false })
        .limit(1)

      if (!data?.[0]) return

      const row = data[0]
      setLatestPayment({
        id: row.id,
        parentId: row.parent_id,
        grade: row.grade,
        planCode: row.plan_code,
        amountJmd: row.amount_jmd,
        method: row.method,
        referenceCode: row.reference_code,
        proofUrl: row.proof_url,
        note: row.note,
        status: row.status,
        submittedAt: row.submitted_at,
        verifiedAt: row.verified_at,
        rejectionReason: row.rejection_reason,
      })
    }

    void loadLatestPayment()
  }, [supabase, user])

  useEffect(() => {
  const loadLatestTest = async () => {
    if (!user) return

    const { data } = await supabase
      .from("student_test_results")
     .select("score, percentage")
      .eq("parent_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
  setLatestTest(data[0])

  const total = data.length
  const average =
    data.reduce((sum, item) => sum + item.percentage, 0) / total
  const best = Math.max(...data.map((item) => item.percentage))

  setTestStats({
    total,
    average: Math.round(average),
    best,
  })
}
  }

  void loadLatestTest()
}, [supabase, user])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const quickLinks = [
    { href: "/language-arts", icon: BookOpen, label: "Language Arts", color: "bg-sky-100 text-sky-600" },
    { href: "/mathematics", icon: Calculator, label: "Mathematics", color: "bg-amber-100 text-amber-600" },
    { href: "/science", icon: FlaskConical, label: "Science", color: "bg-green-100 text-green-600" },
    { href: "/social-studies", icon: Globe, label: "Social Studies", color: "bg-purple-100 text-purple-600" },
  ]

  const premiumLinks = [
    { href: "/mock-tests", icon: FileText, label: "Mock Tests", color: "bg-sky-100 text-sky-600" },
    { href: "/worksheets", icon: FileText, label: "Worksheets", color: "bg-amber-100 text-amber-600" },
    { href: "/certificates", icon: Award, label: "Certificates", color: "bg-purple-100 text-purple-600" },
  ]

  const languageArtsProgress = getTopicProgress("language-arts")
  const mathematicsProgress = getTopicProgress("mathematics")
  const certificates = getCertificates()
  const totalQuizzes = progress?.totalQuizzesTaken || 0
  const totalMockTests = progress?.totalMockTestsTaken || 0
  const averageScore = progress?.averageScore || 0

  const handleAddStudent = async () => {
    setStudentMessage("")
    setStudentError("")

    const result = await addStudent(newStudentName)

    if (!result.success) {
      setStudentError(result.error || "Unable to add student.")
      return
    }

    setNewStudentName("")
    setStudentMessage("Student added successfully.")
    await refreshUser()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
              <User className="h-8 w-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Welcome back, {user.parentName}!
              </h1>
              <p className="text-slate-600">Primary student: {user.childName}</p>
            </div>
          </div>

          <Badge
            className={
              isPremium
                ? "bg-amber-100 text-amber-700 border-amber-300"
                : "bg-slate-100 text-slate-700"
            }
          >
            {isPremium ? <Crown className="h-4 w-4 mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
            {getPlanLabel(user.subscriptionTier)}
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{testStats.total}</p>
<p className="text-xs text-slate-500">Tests Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalQuizzes}</p>
<p className="text-xs text-slate-500">Quizzes Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                <p className="text-2xl font-bold text-slate-800">{testStats.total}</p>
<p className="text-xs text-slate-500">Tests Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{certificates.length}</p>
                  <p className="text-xs text-slate-500">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Progress Overview</CardTitle>
                <CardDescription>
                  Track your child&apos;s learning progress across Grade 5 topics.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {[
                  { label: "Language Arts", value: languageArtsProgress.bestScore || 0 },
                  { label: "Mathematics", value: mathematicsProgress.bestScore || 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.value}% best score</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-600" />
                  Student Profiles
                </CardTitle>
                <CardDescription>Add students up to your plan limit.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {students.map((student) => (
                    <div key={student.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                      <p className="font-medium text-slate-800">{student.fullName}</p>
                      <p className="text-sm text-slate-500">Grade {student.gradeLevel}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <p className="text-sm text-slate-700">
                    Current limit: <span className="font-semibold">{user.maxStudents}</span> student
                    {user.maxStudents === 1 ? "" : "s"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Enter another student name"
                    />
                    <Button
                      onClick={() => void handleAddStudent()}
                      className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      Add Student
                    </Button>
                  </div>

                  {studentMessage && <p className="text-sm text-green-700">{studentMessage}</p>}
                  {studentError && <p className="text-sm text-red-700">{studentError}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Access Status
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Plan</span>
                  <Badge>{getPlanLabel(user.subscriptionTier)}</Badge>
                </div>

                {activeSubscription?.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Expires</span>
                    <span className="text-slate-700">
                      {new Date(activeSubscription.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {!isPremium && (
                  <Link href="/pricing" className="block">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      Upgrade Access
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-sky-600" />
                  Latest Payment
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                {latestPayment ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Plan</span>
                      <span className="text-slate-700">{getPlanLabel(latestPayment.planCode)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status</span>
                      <Badge variant={latestPayment.status === "verified" ? "default" : "secondary"}>
                        {latestPayment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Submitted</span>
                      <span className="text-slate-700">
                        {new Date(latestPayment.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {latestPayment.referenceCode && (
                      <div>
                        <span className="text-slate-500 block mb-1">Reference</span>
                        <span className="text-slate-700">{latestPayment.referenceCode}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">No payment submitted yet. Choose a plan to start.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Latest Test Result
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                {latestTest ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subject</span>
                      <span className="text-slate-700">{latestTest.subject}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Test</span>
                      <span className="text-slate-700">{latestTest.test_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Score</span>
                      <span className="text-slate-700">
                        {latestTest.score}/{latestTest.total_questions}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Percentage</span>
                      <span className="text-slate-700">{latestTest.percentage}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Completed</span>
                      <span className="text-slate-700">
                        {new Date(latestTest.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-center py-4 text-sm">
                    No test results yet. Start a mock test!
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>

              <CardContent>
                {progress && progress.quizAttempts.length > 0 ? (
                  <div className="space-y-3">
                    {progress.quizAttempts
                      .slice(-5)
                      .reverse()
                      .map((attempt) => (
                        <div key={attempt.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                attempt.percentage >= 80
                                  ? "text-green-500"
                                  : attempt.percentage >= 60
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            />
                            <span className="text-slate-700">{attempt.topic}</span>
                          </div>
                          <span className="text-slate-500">{attempt.percentage}%</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4 text-sm">
                    No activity yet. Start a quiz!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-slate-800 mt-10 mb-4">Continue Learning</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border-sky-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{link.label}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-slate-800 mt-10 mb-4 flex items-center gap-2">
          Paid Resources {!isPremium && <Lock className="h-4 w-4 text-slate-400" />}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {premiumLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card
                className={`border-sky-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer h-full ${
                  !isPremium ? "opacity-75" : ""
                }`}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{link.label}</p>
                  </div>
                  {isPremium ? (
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
