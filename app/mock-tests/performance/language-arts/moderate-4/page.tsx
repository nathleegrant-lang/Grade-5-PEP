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


import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
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
    "question": "According to the source, what is ONE educational benefit of a school garden?",
    "options": [
      "Students learn to cook",
      "Students develop a better understanding of where food comes from",
      "Students avoid doing homework",
      "Students learn to sell produce only"
    ],
    "answer": 1
  },
  {
    "question": "What does the source say is needed for a successful school garden?",
    "options": [
      "A very large budget",
      "Planning, cooperation, a suitable location, sunlight, and water access",
      "Only the principal's involvement",
      "A professional gardener"
    ],
    "answer": 1
  },
  {
    "question": "How can teachers connect the school garden to classroom learning?",
    "options": [
      "They cannot \u2014 gardening is separate from lessons",
      "By measuring plant growth in Maths, studying biology in Science, and writing journals in Language Arts",
      "Only Science teachers can use the garden",
      "By replacing all lessons with gardening"
    ],
    "answer": 1
  },
  {
    "question": "According to the passage, how can surplus vegetables from the garden benefit the school?",
    "options": [
      "They are thrown away",
      "They are only for teachers to eat",
      "They can be sold at a small market to raise funds for the school",
      "They must be sent to another school"
    ],
    "answer": 2
  },
  {
    "question": "Which action BEST demonstrates collaboration in the school garden initiative?",
    "options": [
      "Only students work in the garden",
      "Parents, community volunteers, teachers, and students all contribute tools, seeds, time, and care",
      "Only the gardening club is involved",
      "The garden runs itself"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain TWO ways a school garden can benefit students beyond growing food.",
    "answer": "A school garden helps students learn practical skills by integrating subjects like Mathematics and Science into real activities. It also encourages healthier eating habits, as students who grow their own vegetables are more likely to eat them."
  },
  {
    "question": "How could parents and community members support the school garden?",
    "answer": "Parents and community members could donate gardening tools and seeds to reduce costs, and volunteer their time to help students plant and maintain the garden, strengthening ties between the school and the wider community."
  }
]

export default function PerformanceModerate4Page() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [saTexts, setSaTexts] = useState<string[]>(["",""])
  const [ewText, setEwText] = useState("")
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const sourceBodyText = `Growing vegetables at school has become increasingly popular across Jamaica. A school garden gives students the opportunity to learn about plants, healthy food, and environmental responsibility in a practical, hands-on way. Studies show that students who grow their own food are more willing to eat vegetables and develop a better understanding of where food comes from. A successful school garden requires planning and cooperation. The garden needs a suitable location with good sunlight and access to water. Teachers can integrate the garden into lessons — for example, measuring plant growth in Mathematics, studying plant biology in Science, and writing garden journals in Language Arts. Students can take turns caring for the plants before and after school. The vegetables grown in a school garden can supplement the meals served in the school canteen, reducing costs and improving nutrition. Surplus produce can be sold at a small market to raise funds for the school. Parents and community volunteers can also support the garden by donating tools, seeds, and time, strengthening the link between the school and its community.`
  const writingPromptText = `Write a proposal to your school principal recommending that the school start a vegetable garden. Include at least TWO benefits of the garden and explain how students, teachers, and parents can each play a role in making it successful.`


  const handleSelect = (qIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[qIndex] = optionIndex
    setAnswers(updated)
  }

  const handleSubmit = async () => {
    let total = 0
    mcqs.forEach((q, i) => { if (answers[i] === q.answer) total++ })
    setScore(total)
    setAiLoading(true)
    setSubmitted(true)
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
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const totalScore = total + (sa1?.score ?? 0) + (sa2?.score ?? 0) + (ew?.totalScore ?? 0)
          const percentage = Math.round((totalScore / 21) * 100)
          await supabase.from("student_test_results").insert({
            student_id: user.id,
            subject: "Language Arts",
            test_name: "Performance Task - Moderate 4",
            score: percentage,
            total_questions: 1,
            correct_answers: percentage,
            difficulty: "Moderate",
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 pb-10 pt-32 lg:pt-10">
          <Link href="/mock-tests/performance/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Language Arts Performance Tasks
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-blue-300 shadow-lg">
            <CardHeader className="bg-blue-700 text-center rounded-t-lg">
              <CardTitle className="text-2xl text-white">Language Arts Performance Task Moderate 4</CardTitle>
              <p className="text-blue-100 text-sm mt-1">Topic: School Vegetable Garden Initiative</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Overview</h3>
                <p className="text-slate-700">Your class has been asked to help launch a "Keep Our School Clean" campaign. Read the information, answer the questions, and complete the writing task.</p>
              </div>
              <div className="rounded-lg rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">21st-Century Skills Assessed</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating information and forming supported opinions</li>
                  <li>Communication: explaining reasons clearly</li>
                  <li>Collaboration: considering how people work together</li>
                  <li>Creativity: suggesting useful ways to improve the initiative</li>
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-bold text-blue-700 text-xl">{mcqs.length} MCQs</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-bold text-blue-700 text-xl">{shortAnswers.length} Short Answers</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-bold text-blue-700 text-xl">1 Extended Writing</p>
                </div>
              </div>
              <Button onClick={() => setStarted(true)} className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg">Start Task</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (aiLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 pb-20 pt-32 text-center lg:pt-20">
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 pb-10 pt-32 lg:pt-10">
          <Card className="mx-auto max-w-4xl border-blue-300 shadow-lg">
            <CardHeader className="bg-blue-700 text-center rounded-t-lg">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-blue-700" />
              <CardTitle className="text-2xl text-white">Model Answers & AI Feedback — Language Arts Performance Task Moderate 4</CardTitle>
              <p className="text-blue-100 text-sm mt-1">Language Arts Performance Task Moderate 4</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-blue-700">{score}/{mcqs.length}</p>
                <p className="mt-2 text-blue-100 text-sm mt-1">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">Review your answers carefully. A strong Grade 5 response should use evidence from the source, explain ideas clearly, and show thoughtful reasoning about how the initiative could help students and the community.</p>
              </div>
              <div className="space-y-4">
                {mcqs.map((q, index) => {
                  const isCorrect = answers[index] === q.answer
                  return (
                    <div key={index} className={`rounded-lg border-2 p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-semibold text-slate-800">Q{index + 1}: {q.question}</p>
                          <p className="mt-1 text-sm text-blue-100 text-sm mt-1">Your answer: <span className={isCorrect ? "font-medium text-green-700" : "font-medium text-red-700"}>{answers[index] !== undefined ? q.options[answers[index]] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.answer]}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-white">Model Short Answers</h3>
                {shortAnswers.map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-medium text-slate-800">{index + 1}. {item.question}</p>
                    <p className="mt-1 text-sm text-slate-700 italic">Model answer: {item.answer}</p>
                  </div>
                ))}
              </div>
              {/* AI Feedback — Short Answers */}
              {aiResult && !aiLoading && (
                <div className="space-y-4">
                  <h3 className="border-t pt-4 text-base font-bold text-slate-800">AI Marking — Short Answers</h3>
                  {aiResult.shortAnswers.map((fb, idx) => (
                    <div key={idx} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">Short Answer {idx + 1}</span>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${fb.score >= 2 ? "bg-green-100 text-green-700" : fb.score === 1 ? "bg-amber-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{fb.score}/{fb.maxScore} marks — {fb.grade}</span>
                      </div>
                      <p className="mb-2 text-sm font-medium text-slate-700">{shortAnswers[idx]?.question}</p>
                      <div className="space-y-1 text-xs">
                        {fb.strengths && <p><span className="font-semibold text-green-700">Strengths: </span><span className="text-blue-100 text-sm mt-1">{fb.strengths}</span></p>}
                        {fb.improvements && <p><span className="font-semibold text-blue-700">To improve: </span><span className="text-blue-100 text-sm mt-1">{fb.improvements}</span></p>}
                        {fb.missedKey && <p><span className="font-semibold text-red-600">Key point missed: </span><span className="text-blue-100 text-sm mt-1">{fb.missedKey}</span></p>}
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
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${aiResult.extendedWriting.totalScore >= 8 ? "bg-green-100 text-green-700" : aiResult.extendedWriting.totalScore >= 5 ? "bg-amber-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{aiResult.extendedWriting.totalScore}/{aiResult.extendedWriting.maxScore} marks — {aiResult.extendedWriting.grade}</span>
                    </div>
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.entries(aiResult.extendedWriting.criteria).map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">{k === "content" ? "Content & Ideas" : k === "organisation" ? "Organisation" : k === "language" ? "Language" : "Critical Thinking"}</span>
                            <span className="text-xs font-bold text-blue-700">{v.score}/{v.maxScore}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-blue-100 text-sm mt-1">{v.feedback}</p>
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
                              <p className="text-xs text-blue-100 text-sm mt-1">{p.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiResult.extendedWriting.overallComment && <p className="mb-2 border-t pt-2 text-xs text-blue-100 text-sm mt-1">{aiResult.extendedWriting.overallComment}</p>}
                    {aiResult.extendedWriting.keyStrength && <p className="mb-1 text-xs"><span className="font-semibold text-green-700">Key strength: </span><span className="text-blue-100 text-sm mt-1">{aiResult.extendedWriting.keyStrength}</span></p>}
                    {aiResult.extendedWriting.priorityImprovement && <p className="text-xs"><span className="font-semibold text-blue-700">Priority improvement: </span><span className="text-blue-100 text-sm mt-1">{aiResult.extendedWriting.priorityImprovement}</span></p>}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => window.print()} className="flex-1 bg-blue-500 hover:bg-amber-600"><Printer className="mr-2 h-4 w-4" />Print Report</Button>
                <Link href="/mock-tests/performance/language-arts" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Language Arts Tasks</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (started && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 pb-8 pt-32 lg:pt-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <CardHeader className="rounded-t-2xl border-b border-blue-200 bg-blue-400 py-4">
              <CardTitle className="text-white">Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>Keeping a school clean is important for the health and happiness of everyone who uses it. When classrooms, corridors, and school grounds are tidy, students find it easier to focus on their work and feel proud of their school. A clean environment also reduces the spread of germs and illness among students and teachers.</p>
              <p>Simple habits can make a big difference. Putting litter in the bin, wiping down desks after lunch, and avoiding eating in classrooms all help keep the school tidy. Many schools appoint student monitors whose job is to remind their classmates about cleanliness and report any problems to a teacher.</p>
              <p>A successful cleanliness campaign involves the whole school community — students, teachers, parents, and cleaning staff. When students understand why cleanliness matters and feel responsible for their school environment, they are more likely to take care of it. Schools that run regular campaigns, poster competitions, and class challenges report lasting improvements in their school's appearance and atmosphere.</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
            <CardHeader className="rounded-t-2xl border-b border-amber-200 bg-amber-400 py-4">
              <CardTitle className="text-amber-950">Multiple-Choice Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {mcqs.map((q, qIndex) => (
                <div key={qIndex} className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="text-lg font-bold text-slate-900">{qIndex + 1}. {q.question}</p>
                  <div className="grid gap-3">
                    {q.options.map((option, optionIndex) => (
                      <button key={optionIndex} onClick={() => handleSelect(qIndex, optionIndex)} className={`rounded-lg border p-3 text-left transition ${answers[qIndex] === optionIndex ? "border-amber-500 bg-amber-100 ring-2 ring-amber-300" : "border-slate-200 bg-white hover:border-amber-300"}`}>
                        <span className="mr-2 font-bold text-blue-700">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
            <CardHeader className="rounded-t-2xl border-b border-sky-200 bg-cyan-300 py-4">
              <CardTitle className="text-cyan-950">Short Response Practice</CardTitle>
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
          <Card className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <CardHeader className="rounded-t-2xl border-b border-purple-200 bg-violet-400 py-4">
              <CardTitle className="text-white">Extended Writing Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">Write a persuasive letter to your school principal recommending that the school launch a 'Keep Our School Clean' campaign. Give at least TWO reasons why the campaign is important and suggest ONE specific activity that could be part of the campaign.</p>
              <textarea className="min-h-[220px] w-full rounded-lg border p-3 text-sm" placeholder="Write your response here..." value={ewText} onChange={e => setEwText(e.target.value)} />
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg">Submit Task</Button>
        </div>
      </main>
      <Footer />
    </div>
    )
  }
}
