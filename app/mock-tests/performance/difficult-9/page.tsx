"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
    "question": "What does 'civic responsibility' mean, according to the source?",
    "options": [
      "Only paying taxes",
      "Fulfilling duties as a member of a community, including respecting laws, helping others, and caring for public spaces",
      "Only voting in elections",
      "Only following school rules"
    ],
    "answer": 1
  },
  {
    "question": "Which evidence BEST supports the idea that young people can create real community change?",
    "options": [
      "Young people are younger than adults",
      "Young people have historically organised, marched, and advocated for justice and equality",
      "Students like outdoor activities",
      "Young people go to school"
    ],
    "answer": 1
  },
  {
    "question": "Which leadership skills are described in the source as developable through practice?",
    "options": [
      "Only memorising facts",
      "Communication, problem-solving, empathy, and decision-making",
      "Only physical fitness",
      "Art and music only"
    ],
    "answer": 1
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
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

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

  const handleSubmit = () => { calculateScore(); setShowResults(true) }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/performance">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Performance Task Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">Grade 5 Performance Task Difficult 9</CardTitle>
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

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">Performance Task Completed</CardTitle>
              <p className="text-slate-600">Grade 5 Performance Task Difficult 9</p>
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-600"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={() => { setStarted(false); setShowResults(false); setAnswers([]); setScore(0); setTimeLeft(60 * 60) }} variant="outline" className="flex-1">Try Again</Button>
                <Link href="/mock-tests/performance" className="flex-1"><Button variant="outline" className="w-full">Back to Performance Tasks</Button></Link>
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
              <h1 className="font-bold">Grade 5 Performance Task Difficult 9</h1>
              <p className="text-sm text-slate-200">Youth Leadership and Civic Responsibility</p>
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
                  <textarea className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm" placeholder="Write your answer here..." />
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
              <textarea className="min-h-[220px] w-full rounded-lg border p-3 text-sm" placeholder="Write your response here..." />
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600">Submit Task</Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
