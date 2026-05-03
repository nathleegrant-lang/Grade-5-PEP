"use client"

// AI Marking types — declared above all imports (never inside an import block)
interface QuestionFb {
  score: number
  maxScore: number
  grade: string
  strengths: string
  improvements: string
  missedKey: string
}
interface AiResult {
  questions: QuestionFb[]
  totalScore: number
  maxScore: number
  percentage: number
}

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Calculator, Printer } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const taskData = {
  "scenarioTitle": "The Community Garden Project",
  "scenario": "Your school class is building a community garden in the schoolyard. You are designing the layout.",
  "parts": [
    {
      "num": 1,
      "title": "Designing the Garden Beds",
      "context": "The garden has 6 identical rectangular beds.\nEach bed is 4.5 m long and 2 m wide.",
      "questions": [
        {
          "num": 1,
          "strand": "Measurement",
          "objective": "Calculate area; multiply decimals by whole numbers",
          "prompt": "(a) What is the area of ONE garden bed?\n(b) What is the TOTAL area of all 6 garden beds?\n\nShow ALL your working.",
          "modelWorking": "(a) Area of one bed = 4.5 \u00d7 2 = 9 m\u00b2\n(b) Total area = 9 \u00d7 6 = 54 m\u00b2",
          "modelAnswer": "(a) 9 m\u00b2  (b) 54 m\u00b2 total"
        },
        {
          "num": 2,
          "strand": "Measurement",
          "objective": "Calculate perimeter; multiply decimals",
          "prompt": "What is the perimeter of ONE garden bed?\n\nShow ALL your working.",
          "modelWorking": "Perimeter = 2 \u00d7 (4.5 + 2) = 2 \u00d7 6.5 = 13 m",
          "modelAnswer": "Perimeter = 13 m"
        }
      ]
    },
    {
      "num": 2,
      "title": "Soil Needed",
      "context": "Each garden bed needs soil to a depth of 20 cm (0.2 m).\nVolume of soil needed = length \u00d7 width \u00d7 depth.",
      "questions": [
        {
          "num": 3,
          "strand": "Measurement",
          "objective": "Calculate volume of rectangular prisms",
          "prompt": "Calculate the volume of soil needed for ONE bed.\nGive your answer in cubic metres (m\u00b3).\n\nShow ALL your working.",
          "modelWorking": "Volume = length \u00d7 width \u00d7 depth\n       = 4.5 \u00d7 2 \u00d7 0.2\n       = 9 \u00d7 0.2\n       = 1.8 m\u00b3 per bed",
          "modelAnswer": "1.8 m\u00b3 per bed"
        },
        {
          "num": 4,
          "strand": "Measurement",
          "objective": "Multiply to find total volume",
          "prompt": "What is the TOTAL volume of soil needed for ALL 6 beds?\n\nShow ALL your working.",
          "modelWorking": "Total volume = 6 \u00d7 1.8 m\u00b3 = 10.8 m\u00b3",
          "modelAnswer": "10.8 m\u00b3"
        }
      ]
    },
    {
      "num": 3,
      "title": "Cost of Soil",
      "context": "Soil is sold in bags. Each bag contains 0.3 m\u00b3 and costs $420.",
      "questions": [
        {
          "num": 5,
          "strand": "Number",
          "objective": "Solve multi-step problems: division and multiplication of decimals",
          "prompt": "(a) How many bags of soil are needed for the whole garden?\n(b) What is the total cost?\n\nShow ALL your working.",
          "modelWorking": "(a) Total soil needed = 10.8 m\u00b3\n    Bags needed = 10.8 \u00f7 0.3 = 36 bags\n    Check: 36 \u00d7 0.3 = 10.8 \u2713\n(b) Cost = 36 \u00d7 $420 = $15,120",
          "modelAnswer": "(a) 36 bags  (b) $15,120"
        }
      ]
    }
  ],
  "strands": [
    "Measurement",
    "Number"
  ],
  "totalQuestions": 5
}

export default function MathPerfModerate7Page() {
  // Rule 4: create supabase inside the component
  const supabase = getSupabaseBrowserClient()

  const allQuestions = taskData.parts.flatMap((p: any) => p.questions)
  const totalQ = allQuestions.length

  const [started,     setStarted]     = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [workings,    setWorkings]    = useState<string[]>(Array(totalQ).fill(""))
  const [finalAns,    setFinalAns]    = useState<string[]>(Array(totalQ).fill(""))
  const [aiResult,    setAiResult]    = useState<AiResult | null>(null)

  const setWorking = (i: number, val: string) =>
    setWorkings(prev => { const n = [...prev]; n[i] = val; return n })
  const setAnswer  = (i: number, val: string) =>
    setFinalAns(prev => { const n = [...prev]; n[i] = val; return n })

  const handleSubmit = async () => {
    setAiLoading(true)
    setShowResults(true)

    try {
      // Rule 7: call /api/mark-response for every question in parallel
      const calls = allQuestions.map((q: any, i: number) =>
        fetch("/api/mark-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "short-answer",
            question: q.prompt,
            modelAnswer: `Model working:\n${q.modelWorking}\n\nModel answer: ${q.modelAnswer}`,
            studentResponse: (workings[i] || "[no working]") + "\n\nFinal answer: " + (finalAns[i] || "[no answer]"),
            taskTitle: "Performance Task - Moderate 7",
          }),
        }).then(r => r.json())
      )

      const results: QuestionFb[] = await Promise.all(calls)
      const totalScore = results.reduce((s, r) => s + (r.score ?? 0), 0)
      const maxScore   = results.reduce((s, r) => s + (r.maxScore ?? 3), 0)
      const percentage = Math.round((totalScore / maxScore) * 100)

      setAiResult({ questions: results, totalScore, maxScore, percentage })

      // Rule 8: save to student_test_results
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("student_test_results").insert({
            student_id: user.id,
            subject: "Mathematics",
            test_name: "Performance Task - Moderate 7",
            score: percentage,
            total_questions: 1,
            correct_answers: percentage,
            difficulty: "Moderate",
            category: "performance-task",
            completed_at: new Date().toISOString(),
          })
        }
      } catch (saveErr) {
        console.error("Supabase save error:", saveErr)
      }
    } catch (e) {
      console.error("AI marking error:", e)
    }

    setAiLoading(false)
  }

  // ── Intro screen ───────────────────────────────────────────────────────────
  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/performance/mathematics">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Mathematics Performance Tasks
          </Button>
        </Link>
        <Card className="mx-auto max-w-3xl border-blue-300 shadow-lg">
          <CardHeader className="bg-blue-700 text-center rounded-t-lg">
            <Calculator className="mx-auto mb-3 h-12 w-12 text-white" />
            <CardTitle className="text-2xl text-white">Mathematics Performance Task Moderate 7</CardTitle>
            <p className="text-blue-100 text-sm mt-1">Grade 5 PEP Mathematics Performance Task</p>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-bold text-blue-900 text-lg mb-2">{taskData.scenarioTitle}</h3>
              <p className="text-slate-700 leading-relaxed">{taskData.scenario}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h3 className="font-semibold text-amber-800 mb-2">Your Task</h3>
              <ul className="space-y-1">
                {taskData.parts.map((p: any) => (
                  <li key={p.num} className="text-slate-700 text-sm flex items-start gap-2">
                    <span className="font-bold text-blue-700 min-w-[60px]">Part {p.num}:</span>
                    <span>{p.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-700 mb-2 text-sm">NSC Strands Assessed</h3>
              <div className="flex flex-wrap gap-2">
                {taskData.strands.map((s: string) => (
                  <span key={s} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">{s}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-gray-50 p-3"><p className="font-bold text-blue-700 text-xl">{totalQ}</p><p className="text-slate-500">Questions</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="font-bold text-blue-700 text-xl">{taskData.parts.length}</p><p className="text-slate-500">Parts</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="font-bold text-blue-700 text-xl">60</p><p className="text-slate-500">Minutes</p></div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <strong>Instructions:</strong> Read each part carefully. Show ALL your working clearly. Write your final answer in the answer box. You may use pencil and paper for calculations.
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg">Start Task</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (aiLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">Claude AI is marking your working</h2>
          <p className="text-sm text-slate-500">Checking each question against the model working and answer…</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  // ── Results screen ─────────────────────────────────────────────────────────
  if (showResults) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-4xl border-blue-300 shadow-lg">
          <CardHeader className="bg-blue-700 text-center rounded-t-lg">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-white" />
            <CardTitle className="text-xl text-white">Model Answers & AI Feedback — Mathematics Performance Task Moderate 7</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">

            {/* Score summary */}
            {aiResult && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-3xl font-bold text-blue-700">{aiResult.totalScore}/{aiResult.maxScore}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Score</p>
                </div>
                <div className={`rounded-xl border p-4 ${aiResult.percentage >= 75 ? "bg-green-50 border-green-200" : aiResult.percentage >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
                  <p className={`text-3xl font-bold ${aiResult.percentage >= 75 ? "text-green-700" : aiResult.percentage >= 50 ? "text-amber-700" : "text-red-700"}`}>{aiResult.percentage}%</p>
                  <p className="text-xs text-slate-500 mt-1">Percentage</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-3xl font-bold text-slate-700">{aiResult.percentage >= 75 ? "Good" : aiResult.percentage >= 50 ? "Fair" : "Needs Work"}</p>
                  <p className="text-xs text-slate-500 mt-1">Grade</p>
                </div>
              </div>
            )}

            {/* Per-question model answers + AI feedback */}
            {taskData.parts.map((part: any) => {
              let qOffset = 0
              taskData.parts.forEach((p: any, pi: number) => {
                if (p.num < part.num) qOffset += p.questions.length
              })
              return (
                <div key={part.num}>
                  <div className="mb-3 rounded-lg bg-blue-700 px-4 py-2">
                    <h2 className="font-bold text-white">Part {part.num} — {part.title}</h2>
                  </div>
                  {part.context && (
                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-slate-700 text-sm whitespace-pre-line">{part.context}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {part.questions.map((q: any, qi: number) => {
                      const globalIdx = qOffset + qi
                      const fb = aiResult?.questions[globalIdx]
                      return (
                        <div key={q.num} className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="rounded-full bg-blue-700 px-3 py-0.5 text-xs font-bold text-white">Strand: {q.strand}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs text-slate-600">{q.objective}</span>
                            {fb && (
                              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${fb.score >= 2 ? "bg-green-100 text-green-700" : fb.score === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {fb.score}/{fb.maxScore} marks — {fb.grade}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 mb-3 whitespace-pre-line">Question {q.num}: {q.prompt}</p>

                          {/* Student's work */}
                          <div className="mb-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Your working:</p>
                            <p className="text-sm text-slate-700 whitespace-pre-line font-mono">{workings[globalIdx] || "(no working entered)"}</p>
                          </div>
                          <div className="mb-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Your answer:</p>
                            <p className="text-sm text-slate-700">{finalAns[globalIdx] || "(no answer entered)"}</p>
                          </div>

                          {/* Model answer */}
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-3">
                            <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">Model Working:</p>
                            <p className="text-sm text-slate-700 whitespace-pre-line font-mono leading-relaxed">{q.modelWorking}</p>
                            <div className="mt-2 border-t border-green-200 pt-2">
                              <p className="text-xs font-bold text-green-800">Model Answer: <span className="font-mono text-green-900">{q.modelAnswer}</span></p>
                            </div>
                          </div>

                          {/* AI feedback */}
                          {fb && (
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-1 text-xs">
                              {fb.strengths    && <p><span className="font-semibold text-green-700">Strengths: </span><span className="text-slate-600">{fb.strengths}</span></p>}
                              {fb.improvements && <p><span className="font-semibold text-amber-700">To improve: </span><span className="text-slate-600">{fb.improvements}</span></p>}
                              {fb.missedKey    && <p><span className="font-semibold text-red-600">Key point missed: </span><span className="text-slate-600">{fb.missedKey}</span></p>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => window.print()} className="flex-1 bg-blue-700 hover:bg-blue-800">
                <Printer className="mr-2 h-4 w-4" />Print Report
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                setStarted(false); setShowResults(false); setAiResult(null)
                setWorkings(Array(totalQ).fill("")); setFinalAns(Array(totalQ).fill(""))
              }}>Try Again</Button>
              <Link href="/mock-tests/performance/mathematics" className="flex-1">
                <Button variant="outline" className="w-full">Back to Mathematics Tasks</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  // ── Task screen ────────────────────────────────────────────────────────────
  let questionCounter = 0
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <header className="bg-blue-700 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/mock-tests/performance/mathematics" className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Calculator className="h-7 w-7" />
          <div>
            <h1 className="font-bold text-sm">Mathematics Performance Task Moderate 7</h1>
            <p className="text-blue-200 text-xs">{taskData.scenarioTitle}</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="font-bold text-blue-900 text-lg mb-2">{taskData.scenarioTitle}</h2>
            <p className="text-slate-700 leading-relaxed">{taskData.scenario}</p>
          </div>
          {taskData.parts.map((part: any) => (
            <div key={part.num} className="space-y-5">
              <div className="rounded-lg bg-blue-700 px-5 py-3">
                <h2 className="font-bold text-white text-lg">Part {part.num} — {part.title}</h2>
              </div>
              {part.context && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{part.context}</p>
                </div>
              )}
              {part.questions.map((q: any) => {
                const idx = questionCounter++
                return (
                  <Card key={q.num} className="border-blue-100 shadow-sm">
                    <CardHeader className="bg-slate-50 rounded-t-lg py-3 px-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-700 px-3 py-0.5 text-xs font-bold text-white">Strand: {q.strand}</span>
                        <span className="rounded-full bg-slate-200 px-3 py-0.5 text-xs text-slate-700">{q.objective}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <p className="font-semibold text-slate-800 whitespace-pre-line leading-relaxed">Question {q.num}: {q.prompt}</p>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Show your working here:</label>
                        <textarea
                          className="w-full min-h-[140px] rounded-lg border-2 border-slate-200 p-3 text-sm font-mono focus:border-blue-400 focus:outline-none resize-y"
                          placeholder="Write all your steps here..."
                          value={workings[idx]}
                          onChange={e => setWorking(idx, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">My Answer:</label>
                        <input
                          type="text"
                          className="w-full rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                          placeholder="Write your final answer here..."
                          value={finalAns[idx]}
                          onChange={e => setAnswer(idx, e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ))}
          <Button onClick={handleSubmit} className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg">
            Submit & Get AI Feedback
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
