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
    "question": "According to the WHO recommendation mentioned in the source, how much physical activity should children aged 5\u201317 get daily?",
    "options": [
      "30 minutes",
      "45 minutes",
      "At least 60 minutes of moderate to vigorous activity",
      "2 hours only on weekends"
    ],
    "answer": 2
  },
  {
    "question": "According to the source, why do many Jamaican students not meet the recommended activity target?",
    "options": [
      "Schools are too cold for exercise",
      "Students are too busy with homework only",
      "Sedentary lifestyles, increased screen time, and reduced outdoor play opportunities",
      "There are no sports in Jamaica"
    ],
    "answer": 2
  },
  {
    "question": "Which of the following does the source suggest as a way to add physical activity to school life WITHOUT formal sport?",
    "options": [
      "Cancelling all lessons",
      "Replacing lunch with a longer sports session",
      "Active lessons, activity breaks between classes, and lunchtime recreational activities",
      "Only running races every morning"
    ],
    "answer": 2
  },
  {
    "question": "According to the source, what academic benefit is linked to regular physical activity?",
    "options": [
      "Students need less sleep",
      "Students need fewer teachers",
      "Active students tend to have better concentration and higher academic achievement",
      "Physical activity makes mathematics easier only"
    ],
    "answer": 2
  },
  {
    "question": "How does the source suggest schools can involve parents in physical activity initiatives?",
    "options": [
      "By requiring parents to teach PE",
      "Through family fitness events or walking challenges",
      "By making parents attend all sports days",
      "By sending weekly exercise worksheets home"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain TWO benefits of regular physical activity for students beyond physical fitness.",
    "answer": "Regular physical activity improves mental health by reducing stress and improving mood, which helps students feel more positive about school. It also enhances academic performance by improving concentration and focus, meaning students are better able to engage with lessons and retain what they learn."
  },
  {
    "question": "Describe ONE creative way a school with limited space could encourage students to be more active.",
    "answer": "A school with limited space could create an activity corner in a corridor or covered area where students can stretch, skip rope, or play simple movement games during breaks, ensuring even those without access to a large field can meet their daily activity needs."
  }
]

export default function PerformanceMixed3Page() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [saTexts, setSaTexts] = useState<string[]>(["",""])
  const [ewText, setEwText] = useState("")
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const sourceBodyText = `Regular physical activity is essential for children's physical and mental health. The World Health Organisation recommends that children aged 5–17 engage in at least 60 minutes of moderate to vigorous physical activity every day. Despite this, many Jamaican students do not meet this target because of sedentary lifestyles, increased screen time, and reduced opportunities for outdoor play. Schools play a crucial role in helping students meet their daily activity goals. Physical activity does not need to mean formal sport. Schools can encourage movement through active lessons where students stand and move during learning, scheduled activity breaks between classes, and lunchtime recreational activities. Walking or cycling to school — for those who live close enough — is another way to add physical activity to a student's daily routine. Schools with limited space can still create activity corners where students stretch, skip, or play simple games. The benefits of regular physical activity extend far beyond physical fitness. Active students tend to have better concentration, improved mood, lower levels of stress, and higher academic achievement. Schools that make physical activity a visible priority send a clear message that student wellbeing matters. Involving parents in physical activity initiatives — through family fitness events or walking challenges — strengthens the link between school health programmes and home habits.`
  const writingPromptText = `Write a proposal to your school principal recommending a new physical activity initiative for your school. Suggest at least TWO specific activities or changes and explain how they would benefit students' health and academic performance. Consider how students, teachers, and parents can each be involved.`


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
            test_name: "Performance Task - Mixed 3",
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
              <CardTitle className="text-2xl text-white">Language Arts Performance Task Mixed 3</CardTitle>
              <p className="text-blue-100 text-sm mt-1">Topic: Promoting Physical Activity at School</p>
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
              <CardTitle className="text-2xl text-white">Model Answers & AI Feedback — Language Arts Performance Task Mixed 3</CardTitle>
              <p className="text-blue-100 text-sm mt-1">Language Arts Performance Task Mixed 3</p>
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
