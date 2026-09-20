"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  Globe,
  Lightbulb,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { normalizeSubject } from "@/lib/student-results"


type StudentTestResult = {
  id: string
  subject: string
  test_name: string
  score: number
  total_questions: number
  percentage: number
  completed_at: string
}

const subjects = [
  {
    name: "Language Arts",
    href: "/language-arts",
    icon: BookOpen,
    iconClass: "bg-sky-100 text-sky-700",
    accentClass: "border-sky-200 hover:border-sky-400",
    prompt: "Read, reason and communicate clearly.",
  },
  {
    name: "Mathematics",
    href: "/mathematics",
    icon: Calculator,
    iconClass: "bg-amber-100 text-amber-700",
    accentClass: "border-amber-200 hover:border-amber-400",
    prompt: "Build number sense and solve real problems.",
  },
  {
    name: "Science",
    href: "/science",
    icon: FlaskConical,
    iconClass: "bg-emerald-100 text-emerald-700",
    accentClass: "border-emerald-200 hover:border-emerald-400",
    prompt: "Explore, investigate and explain the world.",
  },
  {
    name: "Social Studies",
    href: "/social-studies",
    icon: Globe,
    iconClass: "bg-violet-100 text-violet-700",
    accentClass: "border-violet-200 hover:border-violet-400",
    prompt: "Understand Jamaica, people and communities.",
  },
]

function subjectKey(subject: string) {
  return normalizeSubject(subject)
}

export default function LearnerDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { user, isAuthenticated, isLoading, isPremium } = useAuth()

  const [results, setResults] = useState<StudentTestResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login")
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const loadResults = async () => {
      if (!user) return

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token
        if (!token) return

        const response = await fetch("/api/dashboard/results", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) return

        const data = await response.json()
        setResults((data.testResults || []) as StudentTestResult[])
      } catch (error) {
        console.error("Unable to load learner dashboard results:", error)
      } finally {
        setResultsLoading(false)
      }
    }

    void loadResults()
  }, [supabase, user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
        <p className="text-slate-600">Preparing your learning space...</p>
      </div>
    )
  }

  const learnerName = user.childName || "Learner"
  const latestResult = results[0]
  const totalTests = results.length
  const averageScore = totalTests
    ? Math.round(results.reduce((sum, result) => sum + Number(result.percentage), 0) / totalTests)
    : 0
  const bestScore = totalTests ? Math.max(...results.map((result) => Number(result.percentage))) : 0
  const masteryCount = results.filter((result) => Number(result.percentage) >= 80).length

  const progressBySubject = subjects.map((subject) => {
    const scores = results
      .filter((result) => subjectKey(result.subject) === subject.name)
      .map((result) => Number(result.percentage))

    return {
      ...subject,
      best: scores.length ? Math.max(...scores) : 0,
      attempts: scores.length,
    }
  })

  const recommendedSubject = [...progressBySubject].sort((a, b) => {
    if (a.attempts === 0 && b.attempts > 0) return -1
    if (b.attempts === 0 && a.attempts > 0) return 1
    return a.best - b.best
  })[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.5fr_1fr] md:px-10 md:py-10">
            <div>
              <Badge className="mb-4 bg-sky-100 text-sky-800 hover:bg-sky-100">
                <Sparkles className="mr-1 h-4 w-4" />
                Your Grade 5 learning space
              </Badge>

              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Welcome back, {learnerName}.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                You do not have to know everything today. Take one clear next step, learn from every attempt and keep growing.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={recommendedSubject?.href || "/language-arts"}>
                  <Button className="w-full bg-sky-700 text-white hover:bg-sky-800 sm:w-auto">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Continue learning
                  </Button>
                </Link>
                <Link href="/mock-tests">
                  <Button variant="outline" className="w-full border-sky-300 sm:w-auto">
                    <Target className="mr-2 h-5 w-5" />
                    Practise with a test
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Your next helpful step</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {recommendedSubject?.attempts === 0
                      ? `Begin ${recommendedSubject.name} and discover what you already know.`
                      : `Return to ${recommendedSubject?.name}. A little more practice can strengthen this area.`}
                  </p>
                  <Link
                    href={recommendedSubject?.href || "/language-arts"}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-amber-800 hover:underline"
                  >
                    Go to {recommendedSubject?.name || "Language Arts"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="learning-overview" className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="learning-overview" className="text-xl font-bold text-slate-900 md:text-2xl">
                Your learning at a glance
              </h2>
              <p className="mt-1 text-sm text-slate-600">Progress is more than one score. Every attempt gives you useful information.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-sky-200">
              <CardContent className="p-5">
                <Target className="h-5 w-5 text-sky-700" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{totalTests}</p>
                <p className="text-sm text-slate-500">Tests completed</p>
              </CardContent>
            </Card>
            <Card className="border-violet-200">
              <CardContent className="p-5">
                <BarChart3 className="h-5 w-5 text-violet-700" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{averageScore}%</p>
                <p className="text-sm text-slate-500">Average score</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200">
              <CardContent className="p-5">
                <Trophy className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{bestScore}%</p>
                <p className="text-sm text-slate-500">Personal best</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-5">
                <Award className="h-5 w-5 text-amber-700" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{masteryCount}</p>
                <p className="text-sm text-slate-500">Mastery results</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section aria-labelledby="choose-subject" className="mt-10">
          <h2 id="choose-subject" className="text-xl font-bold text-slate-900 md:text-2xl">
            Choose a subject
          </h2>
          <p className="mt-1 text-sm text-slate-600">Each subject gives you a clear place to learn, practise and improve.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {progressBySubject.map((subject) => (
              <Link key={subject.name} href={subject.href} className="group">
                <Card className={`h-full transition-all hover:-translate-y-0.5 hover:shadow-md ${subject.accentClass}`}>
                  <CardContent className="p-5">
                    <div className={`inline-flex rounded-xl p-3 ${subject.iconClass}`}>
                      <subject.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">{subject.name}</h3>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-slate-600">{subject.prompt}</p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {subject.attempts ? `Best: ${subject.best}%` : "Ready to begin"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Clock3 className="h-5 w-5 text-sky-700" />
                Recent learning
              </CardTitle>
              <CardDescription>Use your recent results to decide what to practise next.</CardDescription>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <p className="py-6 text-sm text-slate-500">Loading your recent learning...</p>
              ) : results.length ? (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${result.percentage >= 80 ? "text-emerald-600" : "text-amber-600"}`} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{normalizeSubject(result.subject)}</p>
                          <p className="truncate text-sm text-slate-500">{result.test_name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{result.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 p-6 text-center">
                  <p className="font-medium text-slate-800">Your learning story starts here.</p>
                  <p className="mt-1 text-sm text-slate-600">Complete a practice activity or mock test and your progress will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-emerald-200 bg-emerald-50/60">
              <CardHeader>
                <CardTitle className="text-slate-900">Latest result</CardTitle>
              </CardHeader>
              <CardContent>
                {latestResult ? (
                  <>
                    <p className="text-sm text-slate-600">{normalizeSubject(latestResult.subject)}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{latestResult.test_name}</p>
                    <p className="mt-4 text-4xl font-bold text-emerald-700">{latestResult.percentage}%</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {latestResult.percentage >= 80
                        ? "You demonstrated mastery. Well done—now keep the learning strong."
                        : "This result shows where practice can help. It is information, not a label."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">No result yet. Your first attempt will give you a starting point.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5 text-amber-700" />
                  Learning resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/mock-tests" className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Mock tests</span>
                  {isPremium ? <ArrowRight className="h-4 w-4" /> : <Lock className="h-4 w-4 text-slate-400" />}
                </Link>
                <Link href="/worksheets" className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Worksheets</span>
                  {isPremium ? <ArrowRight className="h-4 w-4" /> : <Lock className="h-4 w-4 text-slate-400" />}
                </Link>
                <Link href="/certificates" className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Certificates</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
