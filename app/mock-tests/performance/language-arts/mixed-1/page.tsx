"use client"

// AI Marking types
interface ShortAnswerFb {
  score: number
  maxScore: number
  grade: string
  strengths: string
  improvements: string
  missedKey: string
}
interface ExtCrit { score: number; maxScore: number; feedback: string }
interface ParaFb  { paragraphNum: number; preview: string; feedback: string }
interface ExtWritingFb {
  totalScore: number
  maxScore: number
  grade: string
  criteria: {
    content: ExtCrit
    organisation: ExtCrit
    language: ExtCrit
    criticalThinking: ExtCrit
  }
  paragraphFeedback: ParaFb[]
  overallComment: string
  keyStrength: string
  priorityImprovement: string
}
interface AiResult {
  shortAnswers: ShortAnswerFb[]
  extendedWriting: ExtWritingFb
}


import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/utils/supabase/client"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react"

type MCQ = {
  question: string
  options: string[]
  answer: number
}

type ShortAnswer = {
  question: string
  answer: string
}

const mcqs: MCQ[] = [
  {
    "question": "What is rainwater harvesting, according to the source?",
    "options": [
      "Drinking rainwater directly from the sky",
      "Collecting and storing rainwater in tanks for later use",
      "A type of drought",
      "A method of purifying sea water"
    ],
    "answer": 1
  },
  {
    "question": "Which evidence best supports the idea that rainwater harvesting is especially useful in Jamaica?",
    "options": [
      "Jamaica has many rivers",
      "Some areas in Jamaica experience water shortages during the dry season",
      "Jamaica receives very little rain",
      "Water tanks are colourful"
    ],
    "answer": 1
  },
  {
    "question": "Which action shows the BEST collaboration between students and the community in a rainwater project?",
    "options": [
      "Students keeping the project secret",
      "Students learning how the system works and teaching community members about its benefits",
      "Only adults maintaining the tank",
      "Students using the water only for themselves"
    ],
    "answer": 1
  },
  {
    "question": "Which is the MOST creative way a school could use a rainwater harvesting system?",
    "options": [
      "Only storing water and never using it",
      "Using collected rainwater to grow a school vegetable garden and share the produce with families",
      "Selling the water to other schools",
      "Keeping the water tanks locked away"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "State TWO benefits of a rainwater harvesting system for a school.",
    "answer": "A rainwater system can help the school maintain its garden and keep bathrooms clean even when pipe-borne water pressure is low. It can also save money on water bills over time."
  },
  {
    "question": "Explain ONE way students can contribute to making the rainwater harvesting project a success.",
    "answer": "Students can learn how the system works and share that knowledge with their families and the wider community, encouraging more households to adopt rainwater harvesting."
  }
]

export default function PerformanceMixed1Page() {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [saTexts, setSaTexts] = useState<string[]>(["",""])
  const [ewText, setEwText] = useState("")
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const sourceBodyText = `Rainwater harvesting is the collection and storage of rainwater for later use. Simple systems involve gutters on a roof that direct rainwater into a large tank or barrel. This stored water can be used for watering plants, cleaning, and — after proper treatment — for drinking. In Jamaica, some areas experience water shortages during the dry season. Rainwater harvesting can reduce dependence on pipe-borne water and help families and schools save money on water bills. Schools that collect rainwater can use it to maintain gardens and keep bathrooms clean even when water pressure is low. Setting up a rainwater harvesting system requires an initial investment in gutters and storage tanks. However, the long-term savings and environmental benefits make it a worthwhile project. Students can contribute by learning how the system works, maintaining it, and teaching others in the community about its benefits.`
  const writingPromptText = `Write a short letter to your school principal recommending that the school install a rainwater harvesting system. Give TWO reasons why the project is a good idea and suggest ONE way students can be involved.`

  useEffect(() => {
    if (!started || showResults) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setShowResults(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, showResults])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleSelect = (qIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[qIndex] = optionIndex
    setAnswers(updated)
  }

  const calculateScore = () => {
    let total = 0
    mcqs.forEach((q, i) => { if (answers[i] === q.answer) total++ })
    setScore(total)
  }

  const handleSubmit = async () => {
    let total = 0
    mcqs.forEach((q, i) => { if (answers[i] === q.answer) total++ })
    setScore(total)
    setAiLoading(true)
    setShowResults(true)
    try {
      const label = shortAnswers[0]?.question?.substring(0, 40) ?? "Task"
      const [sa1, sa2, ew] = await Promise.all([
        fetch("/api/mark-response", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "short-answer", question: shortAnswers[0].question, modelAnswer: shortAnswers[0].answer, studentResponse: saTexts[0] || "[no answer]", taskTitle: label }) }).then(r => r.json()),
        fetch("/api/mark-response", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "short-answer", question: shortAnswers[1]?.question ?? shortAnswers[0].question, modelAnswer: shortAnswers[1]?.answer ?? shortAnswers[0].answer, studentResponse: saTexts[1] || "[no answer]", taskTitle: label }) }).then(r => r.json()),
        fetch("/api/mark-response", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "extended-writing", prompt: writingPromptText, sourceText: sourceBodyText, studentResponse: ewText || "[no answer]", taskTitle: label }) }).then(r => r.json()),
      ])
      setAiResult({ shortAnswers: [sa1, sa2], extendedWriting: ew })
      // Save result to Supabase after marking completes
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const totalScore = mcqTotal + (sa1?.score ?? 0) + (sa2?.score ?? 0) + (ew?.totalScore ?? 0)
          const percentage = Math.round((totalScore / 21) * 100)
          await supabase.from("student_test_results").insert({
            student_id: user.id,
            subject: "Language Arts",
            test_name: "Performance Task - Mixed 1",
            score: percentage,
            total_questions: 1,
            correct_answers: percentage,
            difficulty: "Mixed",
            category: "performance-task",
            completed_at: new Date().toISOString(),
          })
        }
      } catch (saveError) {
        console.error("Supabase save error:", saveError)
      }
    } catch(e) { console.error("AI marking error:", e) }
    setAiLoading(false)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/performance/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Language Arts Performance Task Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">Grade 5 Language Arts Performance Task Mixed 1</CardTitle>
              <p className="text-slate-600">Topic: Rainwater Harvesting</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Scenario</h3>
                <p className="text-slate-700">Your school and community are exploring rainwater harvesting as a way to save water. Read the information, answer the questions, and complete the writing task.</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Skills Practised</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: using evidence to support ideas</li>
                  <li>Communication: explaining reasoning clearly</li>
                  <li>Collaboration: considering shared responsibilities</li>
                  <li>Creativity: suggesting practical improvements</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">{mcqs.length}</p>
                  <p className="text-sm text-slate-600">Multiple Choice</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>
              <Button onClick={() => setStarted(true)} className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600">Start Task</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (aiLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">Claude AI is marking your responses</h2>
          <p className="text-sm text-slate-500">Analysing short answers and extended writing paragraph by paragraph…</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">Performance Task Completed</CardTitle>
              <p className="text-slate-600">Grade 5 Language Arts Performance Task Mixed 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">{score}/{mcqs.length}</p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">Review your answers carefully. A strong mixed-level response should show both direct recall of information and thoughtful reasoning. Use evidence from the source and explain your ideas in complete sentences.</p>
              </div>
              <div className="space-y-4">
                {mcqs.map((q, index) => {
                  const correct = answers[index] === q.answer
                  return (
                    <div key={index} className={`rounded-lg border-2 p-4 ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-semibold text-slate-800">Question {index + 1}</p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: {answers[index] !== undefined ? q.options[answers[index]] : "Not answered"}</p>
                          <p className="text-sm text-green-700">Correct answer: {q.options[q.answer]}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 font-semibold text-blue-800">Sample Short Responses</h3>
                <div className="space-y-3">
                  {shortAnswers.map((item, index) => (
                    <div key={index} className="rounded bg-white p-3">
                      <p className="font-medium text-slate-800">{item.question}</p>
                      <p className="mt-1 text-sm text-slate-700">Sample answer: {item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Extended Writing Model Answer</h3>
                <p className="whitespace-pre-line text-slate-700">Dear Principal,

I am writing to recommend that our school install a rainwater harvesting system. I believe this project would benefit both our school and our community.

First, the system would help our school save water during the dry season. Some areas in Jamaica face water shortages, and having a stored supply of rainwater would ensure that our garden and bathrooms stay functional even when pipe-borne water is limited. Second, it would reduce our school's water bills over time. Although there is an initial cost to set up the system, the long-term savings would be significant.

Students could play an active role by learning how the system works and creating posters to teach the community about rainwater harvesting. This would turn the project into a real learning experience as well as a practical benefit.

I hope you will consider this proposal.

Yours respectfully,
A Grade 5 Student</p>
              </div>
              {/* AI Feedback — Short Answers */}
              {aiResult && !aiLoading && (
                <div className="space-y-4">
                  <h3 className="border-t pt-4 text-base font-bold text-slate-800">AI Marking — Short Answers</h3>
                  {aiResult.shortAnswers.map((fb, idx) => (
                    <div key={idx} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">Short Answer {idx + 1}</span>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${fb.score >= 2 ? "bg-green-100 text-green-700" : fb.score === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{fb.score}/{fb.maxScore} marks — {fb.grade}</span>
                      </div>
                      <p className="mb-2 text-sm font-medium text-slate-700">{shortAnswers[idx]?.question}</p>
                      <div className="space-y-1 text-xs">
                        {fb.strengths && <p><span className="font-semibold text-green-700">Strengths: </span><span className="text-slate-600">{fb.strengths}</span></p>}
                        {fb.improvements && <p><span className="font-semibold text-amber-700">To improve: </span><span className="text-slate-600">{fb.improvements}</span></p>}
                        {fb.missedKey && <p><span className="font-semibold text-red-600">Key point missed: </span><span className="text-slate-600">{fb.missedKey}</span></p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* AI Feedback — Extended Writing */}
              {aiResult?.extendedWriting && !aiLoading && (
                <div className="space-y-3">
                  <h3 className="border-t pt-4 text-base font-bold text-slate-800">AI Marking — Extended Writing</h3>
                  <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">Extended Writing</span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${aiResult.extendedWriting.totalScore >= 8 ? "bg-green-100 text-green-700" : aiResult.extendedWriting.totalScore >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{aiResult.extendedWriting.totalScore}/{aiResult.extendedWriting.maxScore} marks — {aiResult.extendedWriting.grade}</span>
                    </div>
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.entries(aiResult.extendedWriting.criteria).map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">{k === "content" ? "Content & Ideas" : k === "organisation" ? "Organisation" : k === "language" ? "Language" : "Critical Thinking"}</span>
                            <span className="text-xs font-bold text-blue-700">{v.score}/{v.maxScore}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{v.feedback}</p>
                        </div>
                      ))}
                    </div>
                    {aiResult.extendedWriting.paragraphFeedback?.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 text-xs font-semibold text-slate-700">Paragraph-by-paragraph feedback:</p>
                        <div className="space-y-2">
                          {aiResult.extendedWriting.paragraphFeedback.map((p, i) => (
                            <div key={i} className="border-l-2 border-blue-300 py-1 pl-3">
                              <p className="mb-0.5 text-xs italic text-slate-400">Para {p.paragraphNum}: &ldquo;{p.preview}&hellip;&rdquo;</p>
                              <p className="text-xs text-slate-600">{p.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiResult.extendedWriting.overallComment && <p className="mb-2 border-t pt-2 text-xs text-slate-600">{aiResult.extendedWriting.overallComment}</p>}
                    {aiResult.extendedWriting.keyStrength && <p className="mb-1 text-xs"><span className="font-semibold text-green-700">Key strength: </span><span className="text-slate-600">{aiResult.extendedWriting.keyStrength}</span></p>}
                    {aiResult.extendedWriting.priorityImprovement && <p className="text-xs"><span className="font-semibold text-amber-700">Priority improvement: </span><span className="text-slate-600">{aiResult.extendedWriting.priorityImprovement}</span></p>}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-600"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={() => { setStarted(false); setShowResults(false); setAnswers([]); setScore(0); setTimeLeft(60 * 60) }} variant="outline" className="flex-1">Try Again</Button>
                <Link href="/mock-tests/performance/language-arts" className="flex-1"><Button variant="outline" className="w-full">Back to Performance Tasks</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4 text-white">
            <div>
              <h1 className="font-bold">Grade 5 Language Arts Performance Task Mixed 1</h1>
              <p className="text-sm text-slate-200">Rainwater Harvesting</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />{formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(answers.filter((a) => a !== undefined).length / mcqs.length) * 100} className="h-2" />
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>Rainwater harvesting is the collection and storage of rainwater for later use. Simple systems involve gutters on a roof that direct rainwater into a large tank or barrel. This stored water can be used for watering plants, cleaning, and — after proper treatment — for drinking.</p>
              <p>In Jamaica, some areas experience water shortages during the dry season. Rainwater harvesting can reduce dependence on pipe-borne water and help families and schools save money on water bills. Schools that collect rainwater can use it to maintain gardens and keep bathrooms clean even when water pressure is low.</p>
              <p>Setting up a rainwater harvesting system requires an initial investment in gutters and storage tanks. However, the long-term savings and environmental benefits make it a worthwhile project. Students can contribute by learning how the system works, maintaining it, and teaching others in the community about its benefits.</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Multiple-Choice Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {mcqs.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-semibold text-slate-800">{qIndex + 1}. {q.question}</p>
                  <div className="grid gap-3">
                    {q.options.map((option, optionIndex) => (
                      <button key={optionIndex} onClick={() => handleSelect(qIndex, optionIndex)} className={`rounded-lg border-2 p-3 text-left transition ${answers[qIndex] === optionIndex ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300"}`}>
                        <span className="mr-2 font-bold text-amber-700">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-sky-200">
            <CardHeader className="bg-sky-50">
              <CardTitle className="text-sky-800">Short Response Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {shortAnswers.map((item, index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <p className="font-medium text-slate-800">{index + 1}. {item.question}</p>
                  <textarea className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm" placeholder="Write your answer here..." value={saTexts[index]} onChange={e => setSaTexts(prev => { const next=[...prev]; next[index]=e.target.value; return next })} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">Extended Writing Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">Write a short letter to your school principal recommending that the school install a rainwater harvesting system. Give TWO reasons why the project is a good idea and suggest ONE way students can be involved.</p>
              <textarea className="min-h-[220px] w-full rounded-lg border p-3 text-sm" placeholder="Write your response here..." value={ewText} onChange={e => setEwText(e.target.value)} />
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600">Submit Task</Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
