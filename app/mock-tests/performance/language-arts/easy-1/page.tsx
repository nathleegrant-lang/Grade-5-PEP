"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, CheckCircle, Printer, XCircle } from "lucide-react"

interface ShortAnswerFb {
  score: number
  maxScore: number
  grade: string
  strengths: string
  improvements: string
  missedKey: string
}
interface ExtCrit { score: number; maxScore: number; feedback: string }
interface ParaFb { paragraphNum: number; preview: string; feedback: string }
interface ExtWritingFb {
  totalScore: number
  maxScore: number
  grade: string
  criteria: { content: ExtCrit; organisation: ExtCrit; language: ExtCrit; criticalThinking: ExtCrit }
  paragraphFeedback: ParaFb[]
  overallComment: string
  keyStrength: string
  priorityImprovement: string
}
interface AiResult { shortAnswers: ShortAnswerFb[]; extendedWriting: ExtWritingFb }

type MCQ = { question: string; options: string[]; answer: number }
type ShortAnswer = { question: string; answer: string }

const mcqs: MCQ[] = [
  { question: "According to the source, why is a clean school important?", options: ["It makes the school look more modern", "It helps students focus, feel proud, and reduces the spread of illness", "It reduces the cost of running the school", "It allows teachers to teach more subjects"], answer: 1 },
  { question: "Which student habit does the source mention as helping keep the school tidy?", options: ["Eating lunch in the classroom", "Leaving bags in the corridor", "Putting litter in the bin and wiping down desks after lunch", "Decorating the classroom with artwork"], answer: 2 },
  { question: "What is the role of student monitors, according to the source?", options: ["To punish students who drop litter", "To clean the school themselves without any help", "To remind classmates about cleanliness and report problems to a teacher", "To only monitor the school grounds during break time"], answer: 2 },
  { question: "According to the source, when are students MOST likely to take care of their school environment?", options: ["When they are given rewards for cleanliness", "When teachers clean the school for them", "When they understand why cleanliness matters and feel personally responsible for their school", "When cleaning monitors check on them every hour"], answer: 2 },
  { question: "Based on the source, which approach is MOST effective for creating lasting improvements in school cleanliness?", options: ["Telling students to clean once and never mentioning it again", "A whole-school approach involving students, teachers, parents, and cleaning staff, with campaigns and challenges to maintain engagement", "Only having the cleaning staff responsible for all tidiness", "Making only Grade 6 students responsible for the entire school"], answer: 1 },
]

const shortAnswers: ShortAnswer[] = [
  { question: "State TWO simple habits students can practise to help keep the school clean.", answer: "Students can put their litter in the bin rather than dropping it on the floor, and they can wipe down their desks after eating lunch so the classroom remains tidy for the next lesson." },
  { question: "Explain why involving parents in a school cleanliness campaign is useful.", answer: "When parents are involved in the campaign, they reinforce the cleanliness message at home, encouraging students to carry the same habits and values outside school. This creates a consistent standard that makes the campaign more effective and longer-lasting." },
]

const sourceText = [
  "Keeping a school clean is important for the health and happiness of everyone who uses it. When classrooms, corridors, and school grounds are tidy, students find it easier to focus on their work and feel proud of their school. A clean environment also reduces the spread of germs and illness among students and teachers.",
  "Simple habits can make a big difference. Putting litter in the bin, wiping down desks after lunch, and avoiding eating in classrooms all help keep the school tidy. Many schools appoint student monitors whose job is to remind their classmates about cleanliness and report any problems to a teacher.",
  "A successful cleanliness campaign involves the whole school community — students, teachers, parents, and cleaning staff. When students understand why cleanliness matters and feel responsible for their school environment, they are more likely to take care of it. Schools that run regular campaigns, poster competitions, and class challenges report lasting improvements in their school's appearance and atmosphere.",
]

export default function PerformanceEasy1Page() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [saTexts, setSaTexts] = useState<string[]>(["", ""])
  const [ewText, setEwText] = useState("")
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [markingError, setMarkingError] = useState<string | null>(null)

  const toGrade = (earned: number, maxScore: number) => {
    const ratio = maxScore === 0 ? 0 : earned / maxScore
    if (ratio >= 0.85) return "Excellent"
    if (ratio >= 0.65) return "Good"
    if (ratio >= 0.45) return "Developing"
    return "Needs Support"
  }

  const markShortAnswerLocal = (studentResponse: string, modelAnswer: string): ShortAnswerFb => {
    const cleanResponse = studentResponse.trim()
    const responseWords = cleanResponse.toLowerCase().split(/\W+/).filter(Boolean)
    const keyWords = Array.from(new Set(modelAnswer.toLowerCase().split(/\W+/).filter((w) => w.length > 4)))
    const overlap = keyWords.filter((word) => responseWords.includes(word))
    const hasAny = cleanResponse.length > 0
    const coverage = keyWords.length ? overlap.length / keyWords.length : 0
    let earned = 0
    if (!hasAny) earned = 0
    else if (coverage >= 0.5) earned = 3
    else if (coverage >= 0.25) earned = 2
    else earned = 1
    const missed = keyWords.filter((word) => !responseWords.includes(word)).slice(0, 3)
    return {
      score: earned,
      maxScore: 3,
      grade: toGrade(earned, 3),
      strengths: hasAny ? "You included relevant ideas from the source and attempted to explain your thinking." : "No response was provided yet.",
      improvements: earned >= 2 ? "Add one more specific detail from the source to make your explanation stronger." : "Use clearer evidence from the source and explain how it supports your point.",
      missedKey: missed.length > 0 ? `Try to include key ideas such as: ${missed.join(", ")}.` : "No major key point was missed.",
    }
  }

  const markExtendedWritingLocal = (studentResponse: string): ExtWritingFb => {
    const cleanResponse = studentResponse.trim()
    const paragraphs = cleanResponse ? cleanResponse.split(/\n+/).map((p) => p.trim()).filter(Boolean) : []
    const lower = cleanResponse.toLowerCase()
    const reasonSignals = ["because", "important", "health", "focus", "proud", "germs", "illness", "community"]
    const activitySignals = ["campaign", "challenge", "poster", "monitor", "activity", "competition"]
    const hasGreeting = /dear\s+principal|dear\s+sir|dear\s+madam/.test(lower)
    const hasClosing = /yours sincerely|sincerely|from/.test(lower)
    const reasonHits = reasonSignals.filter((s) => lower.includes(s)).length
    const activityHits = activitySignals.filter((s) => lower.includes(s)).length
    const wordCount = cleanResponse.split(/\s+/).filter(Boolean).length
    const contentScore = cleanResponse.length === 0 ? 0 : Math.min(3, (reasonHits >= 2 ? 2 : 1) + (activityHits >= 1 ? 1 : 0))
    const organisationScore = cleanResponse.length === 0 ? 0 : (paragraphs.length >= 2 ? 2 : 1) + (hasGreeting || hasClosing ? 1 : 0)
    const languageScore = cleanResponse.length === 0 ? 0 : wordCount >= 90 ? 2 : wordCount >= 40 ? 1 : 0
    const criticalScore = cleanResponse.length === 0 ? 0 : reasonHits >= 3 ? 2 : reasonHits >= 1 ? 1 : 0
    const totalScore = contentScore + organisationScore + languageScore + criticalScore
    return {
      totalScore,
      maxScore: 10,
      grade: toGrade(totalScore, 10),
      criteria: {
        content: { score: contentScore, maxScore: 3, feedback: contentScore >= 2 ? "Clear reasons are given for why the campaign matters." : "Add at least two clear reasons and one specific campaign activity." },
        organisation: { score: organisationScore, maxScore: 3, feedback: organisationScore >= 2 ? "Your writing has a clear letter structure and ideas are grouped logically." : "Use a stronger letter format with an opening, body, and closing." },
        language: { score: languageScore, maxScore: 2, feedback: languageScore >= 1 ? "Language is mostly clear and understandable." : "Expand your response with fuller sentences and clearer vocabulary." },
        criticalThinking: { score: criticalScore, maxScore: 2, feedback: criticalScore >= 1 ? "You show reasoning about why actions can improve the school environment." : "Explain how your suggested actions lead to better outcomes." },
      },
      paragraphFeedback: (paragraphs.length > 0 ? paragraphs : [""]).map((p, i) => ({ paragraphNum: i + 1, preview: p.slice(0, 40) || "No paragraph written", feedback: p ? "This paragraph communicates an idea. Strengthen it with direct evidence and a clearer impact statement." : "Start by writing a greeting and your main recommendation to the principal." })),
      overallComment: cleanResponse ? "This is a promising persuasive response. To improve further, make each reason explicit and connect it to student outcomes." : "No writing was submitted yet. Start with a brief letter that gives two reasons and one campaign activity.",
      keyStrength: cleanResponse ? "You attempted to present a recommendation to the principal." : "You can improve quickly by adding even a short first draft.",
      priorityImprovement: "Include at least two well-explained reasons and one practical campaign activity with expected impact.",
    }
  }

  const handleSelect = (qIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[qIndex] = optionIndex
    setAnswers(updated)
  }

  const savePerformanceResult = async (percentage: number, totalScore: number, maxScore: number) => {
    const supabase = getSupabaseBrowserClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("Performance task save skipped: no logged-in user", userError)
      return
    }
    const { data: studentRows, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, grade_level")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
    if (studentError) console.error("Could not fetch student for performance result:", studentError)
    const student = studentRows?.[0] ?? null
    const payload = {
      parent_id: user.id,
      student_id: student?.id ?? null,
      student_name: student?.full_name ?? null,
      grade: "grade5",
      subject: "Language Arts",
      test_name: "Performance Task - Easy 1",
      difficulty: "Easy",
      score: totalScore,
      total_questions: maxScore,
      correct_answers: totalScore,
      percentage,
      category: "performance-task",
      completed_at: new Date().toISOString(),
    }
    const { error: insertError } = await supabase.from("student_test_results").insert(payload)
    if (insertError) console.error("Supabase performance task save error:", insertError, payload)
    else console.log("Performance task saved:", payload)
  }

  const handleSubmit = async () => {
    let mcqScore = 0
    mcqs.forEach((q, i) => { if (answers[i] === q.answer) mcqScore++ })
    setScore(mcqScore)
    setAiLoading(true)
    setMarkingError(null)
    setSubmitted(true)
    try {
      const sa1 = markShortAnswerLocal(saTexts[0], shortAnswers[0].answer)
      const sa2 = markShortAnswerLocal(saTexts[1], shortAnswers[1].answer)
      const extendedWriting = markExtendedWritingLocal(ewText)
      const totalScore = mcqScore + sa1.score + sa2.score + extendedWriting.totalScore
      const maxScore = mcqs.length + sa1.maxScore + sa2.maxScore + extendedWriting.maxScore
      const percentage = Math.round((totalScore / maxScore) * 100)
      setAiResult({ shortAnswers: [sa1, sa2], extendedWriting })
      await savePerformanceResult(percentage, totalScore, maxScore)
    } catch (e) {
      console.error("Smart marking error:", e)
      setMarkingError("An unexpected error occurred while generating smart feedback. Please try submitting again.")
    } finally {
      setAiLoading(false)
    }
  }

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50"><Header /><main className="container mx-auto px-4 pb-10 pt-32 lg:pt-10"><Link href="/mock-tests/performance/language-arts"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Language Arts Performance Tasks</Button></Link><Card className="mx-auto max-w-3xl border-blue-300 shadow-lg"><CardHeader className="rounded-t-lg bg-blue-700 text-center"><CardTitle className="text-2xl text-white">Language Arts Performance Task Easy 1</CardTitle><p className="mt-1 text-sm text-blue-100">Topic: Keeping Our School Clean</p></CardHeader><CardContent className="space-y-6 p-6"><div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="mb-2 font-semibold text-slate-800">Task Overview</h3><p className="text-slate-700">Your class has been asked to help launch a "Keep Our School Clean" campaign. Read the information, answer the questions, and complete the writing task.</p></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="mb-2 font-semibold text-blue-800">21st-Century Skills Assessed</h3><ul className="space-y-1 text-sm text-slate-700"><li>Critical Thinking: evaluating information and forming supported opinions</li><li>Communication: explaining reasons clearly</li><li>Collaboration: considering how people work together</li><li>Creativity: suggesting useful ways to improve the initiative</li></ul></div><div className="grid grid-cols-3 gap-3 text-center text-sm"><div className="rounded-lg bg-gray-50 p-3"><p className="text-xl font-bold text-blue-700">{mcqs.length}</p><p className="text-slate-500">MCQs</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xl font-bold text-blue-700">{shortAnswers.length}</p><p className="text-slate-500">Short Answers</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xl font-bold text-blue-700">1</p><p className="text-slate-500">Extended Writing</p></div></div><Button onClick={() => setStarted(true)} className="w-full bg-blue-700 py-6 text-lg hover:bg-blue-800">Start Task</Button></CardContent></Card></main><Footer /></div>
  )

  if (aiLoading) return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50"><Header /><main className="container mx-auto px-4 pb-20 pt-32 text-center lg:pt-20"><div className="mx-auto max-w-sm"><div className="mb-6 flex justify-center"><div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div><h2 className="mb-2 text-xl font-bold text-slate-800">Smart Feedback is marking your responses</h2><p className="text-sm text-slate-500">Analysing short answers and extended writing paragraph by paragraph…</p></div></main><Footer /></div>

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50"><Header /><main className="container mx-auto px-4 pb-10 pt-32 lg:pt-10"><Card className="mx-auto max-w-4xl border-blue-300 shadow-lg"><CardHeader className="rounded-t-lg bg-blue-700 text-center"><CheckCircle className="mx-auto mb-4 h-14 w-14 text-white" /><CardTitle className="text-2xl text-white">Model Answers & Smart Feedback — Language Arts Performance Task Easy 1</CardTitle><p className="mt-1 text-sm text-blue-100">Language Arts Performance Task Easy 1</p></CardHeader><CardContent className="space-y-6 p-6"><div className="rounded-lg bg-gray-50 p-6 text-center"><p className="text-5xl font-bold text-blue-700">{score}/{mcqs.length}</p><p className="mt-2 text-sm text-slate-500">Multiple-choice score</p></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="mb-2 font-semibold text-blue-800">Teacher-Style Feedback</h3><p className="text-slate-700">Review your answers carefully. A strong Grade 5 response should use evidence from the source, explain ideas clearly, and show thoughtful reasoning about how the initiative could help students and the community.</p></div><div className="space-y-4">{mcqs.map((q, index) => { const isCorrect = answers[index] === q.answer; return <div key={index} className={`rounded-lg border-2 p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}><div className="flex items-start gap-3">{isCorrect ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}<div><p className="font-semibold text-slate-800">Q{index + 1}: {q.question}</p><p className="mt-1 text-sm text-slate-700">Your answer: <span className={isCorrect ? "font-medium text-green-700" : "font-medium text-red-700"}>{answers[index] !== undefined ? q.options[answers[index]] : "Not answered"}</span></p><p className="text-sm text-green-700">Correct: {q.options[q.answer]}</p></div></div></div> })}</div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="mb-2 font-semibold text-blue-800">Model Short Answers</h3>{shortAnswers.map((item, index) => <div key={index} className="mb-4"><p className="font-medium text-slate-800">{index + 1}. {item.question}</p><p className="mt-1 text-sm italic text-slate-700">Model answer: {item.answer}</p></div>)}</div>{aiResult && <div className="space-y-4"><h3 className="border-t pt-4 text-base font-bold text-slate-800">Smart Marking — Short Answers</h3>{aiResult.shortAnswers.map((fb, idx) => <div key={idx} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">Short Answer {idx + 1}</span><span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${fb.score >= 2 ? "bg-green-100 text-green-700" : fb.score === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{fb.score}/{fb.maxScore} marks — {fb.grade}</span></div><p className="mb-2 text-sm font-medium text-slate-700">{shortAnswers[idx]?.question}</p><div className="space-y-1 text-xs text-slate-700"><p><span className="font-semibold text-green-700">Strengths: </span>{fb.strengths}</p><p><span className="font-semibold text-blue-700">To improve: </span>{fb.improvements}</p><p><span className="font-semibold text-red-600">Key point missed: </span>{fb.missedKey}</p></div></div>)}</div>}<div className="space-y-3"><h3 className="border-t pt-4 text-base font-bold text-slate-800">Smart Feedback — Extended Writing</h3>{aiResult?.extendedWriting && !markingError ? <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm"><div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">Extended Writing</span><span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${aiResult.extendedWriting.totalScore >= 8 ? "bg-green-100 text-green-700" : aiResult.extendedWriting.totalScore >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{aiResult.extendedWriting.totalScore}/{aiResult.extendedWriting.maxScore} marks — {aiResult.extendedWriting.grade}</span></div><div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{Object.entries(aiResult.extendedWriting.criteria).map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 p-3"><div className="mb-1 flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{k === "content" ? "Content & Ideas" : k === "organisation" ? "Organisation" : k === "language" ? "Language" : "Critical Thinking"}</span><span className="text-xs font-bold text-blue-700">{v.score}/{v.maxScore}</span></div><p className="text-xs leading-relaxed text-slate-600">{v.feedback}</p></div>)}</div>{aiResult.extendedWriting.paragraphFeedback?.length > 0 && <div className="mb-3"><p className="mb-2 text-xs font-semibold text-slate-700">Paragraph-by-paragraph feedback:</p><div className="space-y-2">{aiResult.extendedWriting.paragraphFeedback.map((p, i) => <div key={i} className="border-l-2 border-blue-300 py-1 pl-3"><p className="mb-0.5 text-xs italic text-slate-400">Para {p.paragraphNum}: &ldquo;{p.preview}&hellip;&rdquo;</p><p className="text-xs text-slate-600">{p.feedback}</p></div>)}</div></div>}<p className="mb-2 border-t pt-2 text-xs text-slate-600">{aiResult.extendedWriting.overallComment}</p><p className="mb-1 text-xs"><span className="font-semibold text-green-700">Key strength: </span><span className="text-slate-600">{aiResult.extendedWriting.keyStrength}</span></p><p className="text-xs"><span className="font-semibold text-blue-700">Priority improvement: </span><span className="text-slate-600">{aiResult.extendedWriting.priorityImprovement}</span></p></div> : <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{markingError || "Extended writing feedback could not be loaded. Please try submitting again."}</div>}</div><div className="flex gap-3"><Button onClick={() => window.print()} className="flex-1 bg-blue-500 hover:bg-blue-600"><Printer className="mr-2 h-4 w-4" />Print Report</Button><Link href="/mock-tests/performance/language-arts" className="flex-1"><Button variant="outline" className="w-full">Back to Language Arts Tasks</Button></Link></div></CardContent></Card></main><Footer /></div>
  )

  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50"><Header /><main className="container mx-auto px-4 pb-8 pt-32 lg:pt-8"><div className="mx-auto max-w-4xl space-y-6"><Card className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"><CardHeader className="rounded-t-2xl border-b border-blue-200 bg-blue-400 py-4"><CardTitle className="text-white">Source Information</CardTitle></CardHeader><CardContent className="space-y-4 p-6 text-slate-700">{sourceText.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</CardContent></Card><Card className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"><CardHeader className="rounded-t-2xl border-b border-amber-200 bg-amber-400 py-4"><CardTitle className="text-amber-950">Multiple-Choice Questions</CardTitle></CardHeader><CardContent className="space-y-6 p-6">{mcqs.map((q, qIndex) => <div key={qIndex} className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4"><p className="text-lg font-bold text-slate-900">{qIndex + 1}. {q.question}</p><div className="grid gap-3">{q.options.map((option, optionIndex) => <button key={optionIndex} onClick={() => handleSelect(qIndex, optionIndex)} className={`rounded-lg border p-3 text-left transition ${answers[qIndex] === optionIndex ? "border-amber-500 bg-amber-100 ring-2 ring-amber-300" : "border-slate-200 bg-white hover:border-amber-300"}`}><span className="mr-2 font-bold text-blue-700">{String.fromCharCode(65 + optionIndex)}.</span>{option}</button>)}</div></div>)}</CardContent></Card><Card className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm"><CardHeader className="rounded-t-2xl border-b border-sky-200 bg-cyan-300 py-4"><CardTitle className="text-cyan-950">Short Response Practice</CardTitle></CardHeader><CardContent className="space-y-4 p-6">{shortAnswers.map((item, index) => <div key={index} className="rounded-lg border bg-white p-4"><p className="font-medium text-slate-800">{index + 1}. {item.question}</p><textarea className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm" placeholder="Write your answer here..." value={saTexts[index]} onChange={(e) => setSaTexts((prev) => { const next = [...prev]; next[index] = e.target.value; return next })} /></div>)}</CardContent></Card><Card className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm"><CardHeader className="rounded-t-2xl border-b border-purple-200 bg-violet-400 py-4"><CardTitle className="text-white">Extended Writing Task</CardTitle></CardHeader><CardContent className="space-y-4 p-6"><p className="text-slate-700">Write a persuasive letter to your school principal recommending that the school launch a 'Keep Our School Clean' campaign. Give at least TWO reasons why the campaign is important and suggest ONE specific activity that could be part of the campaign.</p><textarea className="min-h-[220px] w-full rounded-lg border p-3 text-sm" placeholder="Write your response here..." value={ewText} onChange={(e) => setEwText(e.target.value)} /></CardContent></Card><Button onClick={handleSubmit} className="w-full bg-blue-700 py-6 text-lg hover:bg-blue-800">Submit Task</Button></div></main><Footer /></div>
}
