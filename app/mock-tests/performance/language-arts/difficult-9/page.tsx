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
    "question": "Based on the source, what can you INFER about communities where young people are given no role in decision-making?",
    "options": [
      "Those communities make objectively better decisions without the distraction of youth input",
      "Youth involvement is only relevant once people reach the age of 18",
      "Those communities miss critical perspectives and may fail to address issues most relevant to young people — also losing the opportunity to develop the civic skills young leaders will need as adults",
      "Communities function equally well with or without youth participation in decisions"
    ],
    "answer": 2
  },
  {
    "question": "The source suggests that leadership skills develop through practice, not only through instruction. Which activity BEST applies this principle?",
    "options": [
      "Attending lectures delivered by famous leaders",
      "Reading biographies of historical national heroes",
      "Operating a student council where young people make real decisions about school policies — practising negotiation, accountability, and collective problem-solving in authentic situations",
      "Writing essays analysing the qualities of effective leaders"
    ],
    "answer": 2
  },
  {
    "question": "A student argues young people should focus only on studies and leave leadership to adults. Using the source, evaluate this claim.",
    "options": [
      "The source fully supports this position — youth should focus only on academic achievement",
      "The source shows that youth leadership and academic success are mutually exclusive pursuits",
      "The source contradicts this view — developing civic engagement alongside academic learning produces more capable well-rounded citizens, and youth perspectives improve community decisions in ways adults alone cannot replicate",
      "The source does not address the relationship between youth leadership and educational attainment"
    ],
    "answer": 2
  },
  {
    "question": "Which challenge to youth leadership is identified in the source?",
    "options": [
      "Young people being too talented",
      "Young people sometimes not being taken seriously and lacking access to mentors and resources",
      "Schools being too large",
      "Young people not liking teamwork"
    ],
    "answer": 1
  },
  {
    "question": "Which conclusion is BEST supported by the source?",
    "options": [
      "Youth leadership develops automatically without support",
      "Adults should make all decisions for young people",
      "Youth leadership requires both opportunity and adult support to be effective",
      "Young people cannot solve community problems"
    ],
    "answer": 2
  },
  {
    "question": "Which would BEST demonstrate strong youth civic leadership?",
    "options": [
      "Staying silent about community problems",
      "A student identifying a problem in the school, researching solutions, and presenting a proposal to the principal",
      "Only following what teachers say",
      "Waiting until adulthood to participate"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain TWO ways schools can develop leadership skills in their students.",
    "answer": "Schools can appoint class representatives and prefects who are given real responsibilities, helping students practise decision-making and communication. Schools can also provide students with project committees where they plan and manage activities, building problem-solving and teamwork skills."
  },
  {
    "question": "Identify ONE challenge young leaders face and suggest ONE way adults can help address it.",
    "answer": "Young leaders are sometimes not taken seriously by adults, which can discourage them. Adults can help by genuinely listening to students' ideas, providing mentorship, and giving young people real responsibilities with meaningful outcomes."
  }
]

export default function PerformanceDifficult9Page() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [saTexts, setSaTexts] = useState<string[]>(["",""])
  const [ewText, setEwText] = useState("")
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const sourceBodyText = `Civic responsibility means understanding and fulfilling one's duties as a member of a community or country. This includes respecting the law, participating in democratic processes, caring for public spaces, and helping others. In Jamaica, civic responsibility is considered an essential part of good citizenship from an early age. Young people have historically played important roles in community change. During the Civil Rights Movement and in post-independence Jamaica, young people organised, marched, and advocated for justice and equality. Today, students can make a difference through school councils, community projects, environmental campaigns, and youth parliaments. Leadership skills such as communication, problem-solving, empathy, and decision-making can be developed through practice. Schools that provide students with opportunities to lead — through house captains, prefects, class representatives, and project committees — are building the next generation of community leaders. However, youth leadership is not without challenges. Young people are sometimes not taken seriously by adults, may lack experience, or may not have access to resources and mentors. Supportive adults, meaningful opportunities, and genuine respect for young people's ideas are essential to developing youth leadership effectively.`
  const writingPromptText = `Write a speech to be delivered at a Youth Leadership Conference. Explain what civic responsibility means, give TWO examples of how young Jamaicans can lead in their communities, and address ONE challenge young leaders face. End with an inspiring call to action.`


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
          const totalScore = mcqTotal + (sa1?.score ?? 0) + (sa2?.score ?? 0) + (ew?.totalScore ?? 0)
          const percentage = Math.round((totalScore / 21) * 100)
          await supabase.from("student_test_results").insert({
            student_id: user.id,
            subject: "Language Arts",
            test_name: "Performance Task - Difficult 9",
            score: percentage,
            total_questions: 1,
            correct_answers: percentage,
            difficulty: "Difficult",
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
              <CardTitle className="text-2xl text-amber-800">Grade 5 Language Arts Performance Task Difficult 9</CardTitle>
              <p className="text-slate-600">Topic: Youth Leadership and Civic Responsibility</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Scenario</h3>
                <p className="text-slate-700">Young people in Jamaica have the potential to be powerful leaders and active citizens. Read the source, evaluate the evidence, and complete all tasks.</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Skills Practised</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating benefits and challenges</li>
                  <li>Communication: explaining ideas with clear reasons</li>
                  <li>Collaboration: planning shared responsibilities</li>
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">Performance Task Completed</CardTitle>
              <p className="text-slate-600">Grade 5 Language Arts Performance Task Difficult 9</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">{score}/{mcqs.length}</p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">This difficult task requires careful reading, evaluation of evidence, and strong reasoning. Review the sample responses to see how clear explanations, practical solutions, and evidence from the source can strengthen your answers.</p>
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
                <p className="whitespace-pre-line text-slate-700">Good morning, fellow young leaders.

My name is Damaris, and I am proud to stand before you as a Grade 5 student who believes — deeply — that young people can change the world. But first, we have to understand what we are changing it for.

Civic responsibility means being an active, caring, and committed member of our community. It means not just following the rules, but taking action to make our schools, neighbourhoods, and nation better. It means seeing a problem and asking: what can I do?

Here are two ways young Jamaicans are already leading.

First, environmental action. Students across Jamaica are joining clean-up campaigns, planting trees, and advocating for cleaner rivers and beaches. These young people are not waiting for adults to act — they are leading the way. Second, school representation. When a class representative brings students' concerns to teachers and administrators, they are practising democracy. They are learning that their voice matters and that change happens through engagement, not silence.

But I will be honest with you. Youth leadership is not always easy. One of the biggest challenges we face is not being taken seriously. Sometimes adults dismiss our ideas simply because of our age. My message to every young leader here is this: do not let that stop you. Prepare. Research. Present your ideas clearly and confidently. When you come with evidence and a plan, it is much harder to be ignored.

And to the adults in this room: give us real responsibilities. Listen to us. Trust us. Because we are not just the leaders of tomorrow — we are the leaders of today.

Thank you.

Damaris, Grade 5 Student</p>
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
                <Button onClick={() => { setStarted(false); setSubmitted(false); setAnswers([]); setScore(0) }} variant="outline" className="flex-1">Try Again</Button>
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
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>Civic responsibility means understanding and fulfilling one's duties as a member of a community or country. This includes respecting the law, participating in democratic processes, caring for public spaces, and helping others. In Jamaica, civic responsibility is considered an essential part of good citizenship from an early age.</p>
              <p>Young people have historically played important roles in community change. During the Civil Rights Movement and in post-independence Jamaica, young people organised, marched, and advocated for justice and equality. Today, students can make a difference through school councils, community projects, environmental campaigns, and youth parliaments.</p>
              <p>Leadership skills such as communication, problem-solving, empathy, and decision-making can be developed through practice. Schools that provide students with opportunities to lead — through house captains, prefects, class representatives, and project committees — are building the next generation of community leaders.</p>
              <p>However, youth leadership is not without challenges. Young people are sometimes not taken seriously by adults, may lack experience, or may not have access to resources and mentors. Supportive adults, meaningful opportunities, and genuine respect for young people's ideas are essential to developing youth leadership effectively.</p>
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
              <p className="text-slate-700">Write a speech to be delivered at a Youth Leadership Conference. Explain what civic responsibility means, give TWO examples of how young Jamaicans can lead in their communities, and address ONE challenge young leaders face. End with an inspiring call to action.</p>
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
