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
    "question": "According to the source, which groups of Jamaicans benefit from tourism employment?",
    "options": [
      "Only hotel managers",
      "Hotel workers, tour guides, taxi drivers, craft vendors, and restaurant staff",
      "Only foreign investors",
      "Government ministers only"
    ],
    "answer": 1
  },
  {
    "question": "Which evidence BEST supports the concern that some resorts limit benefits to local communities?",
    "options": [
      "Resorts are very large",
      "All-inclusive resorts keep most spending within their own facilities, limiting money to local businesses",
      "Tourists prefer resorts",
      "Resorts have swimming pools"
    ],
    "answer": 1
  },
  {
    "question": "What is 'community tourism' and why is it presented positively?",
    "options": [
      "Tourism in city centres only",
      "Tourism that connects visitors with local culture and keeps money in communities",
      "A type of expensive holiday",
      "Tourism that builds large hotels"
    ],
    "answer": 1
  },
  {
    "question": "Which challenge to tourism requires the MOST environmental consideration?",
    "options": [
      "Tourists getting sunburnt",
      "Large resort developments damaging coral reefs and mangrove forests",
      "Tourists buying crafts",
      "Hotels having restaurants"
    ],
    "answer": 1
  },
  {
    "question": "Which conclusion is BEST supported by the source?",
    "options": [
      "Tourism is always harmful",
      "Tourism is always beneficial",
      "Jamaica needs a balanced approach — attracting tourists while protecting communities and nature",
      "Tourism should be banned"
    ],
    "answer": 2
  },
  {
    "question": "Which would be the MOST creative and sustainable action for a school community to promote local tourism?",
    "options": [
      "Discourage tourists",
      "Create a student-led guide to local cultural heritage sites and present it to a tourism board",
      "Ignore tourism issues",
      "Only visit foreign countries"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain TWO ways community tourism is more beneficial than all-inclusive resort tourism for local Jamaicans.",
    "answer": "Community tourism keeps money within local communities by encouraging tourists to buy food, crafts, and services from local businesses. It also helps preserve Jamaican cultural traditions by connecting visitors with authentic music, food, and heritage."
  },
  {
    "question": "Identify ONE environmental risk of large-scale tourism in Jamaica and suggest ONE way to reduce this risk.",
    "answer": "Large resort developments can damage coral reefs and mangrove forests, which protect coastlines and support marine life. This risk could be reduced by requiring environmental impact assessments before approving coastal construction."
  }
]

export default function PerformanceDifficult7Page() {
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
          <Link href="/mock-tests/performance/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Performance Task Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">Grade 5 Performance Task Difficult 7</CardTitle>
              <p className="text-slate-600">Topic: Tourism and Jamaica's Economy</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Scenario</h3>
                <p className="text-slate-700">Tourism is one of Jamaica's largest industries, but it also brings challenges. Read the source, evaluate the evidence, and complete all tasks.</p>
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
              <p className="text-slate-600">Grade 5 Performance Task Difficult 7</p>
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
                <p className="whitespace-pre-line text-slate-700">JAMAICA'S TOURISM FUTURE: WHY COMMUNITY COMES FIRST

Jamaica is one of the most visited destinations in the Caribbean, and for good reason. Our beaches, music, food, and culture are world-class. But there is an important question we must ask: who truly benefits from the tourists who come?

Too often, the answer is: not local Jamaicans. All-inclusive resorts — while attractive to visitors — tend to keep tourist spending locked within their own facilities. Local craft vendors, small restaurants, tour guides, and community businesses see little of the billions that tourism brings to the island.

Community tourism offers a better model. First, it puts money directly into local pockets. When a tourist eats at a family-owned jerk centre, buys a painting from a local artist, or joins a community tour of the Blue Mountains, that money stays in the community and strengthens the local economy. Second, community tourism helps preserve our culture. Visitors who engage authentically with Jamaican music, dance, food, and history take home a deeper appreciation — and Jamaica preserves the very traditions that make it unique.

There are real concerns about current tourism too. Resort construction on our coastlines has damaged coral reefs and mangrove forests — ecosystems that protect our beaches and support fishermen. A sustainable tourism model must take environmental care seriously.

Here is one idea: schools across Jamaica could partner with tourism boards to create community heritage guides — student-produced booklets and walking tours of local cultural sites. This would educate students, celebrate local identity, and offer tourists an experience money cannot buy elsewhere.

Jamaica's greatest tourism asset is its people and culture. Let us make sure our tourism model reflects that.

Written by a Grade 5 Student</p>
              </div>
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
              <h1 className="font-bold">Grade 5 Performance Task Difficult 7</h1>
              <p className="text-sm text-slate-200">Tourism and Jamaica's Economy</p>
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
              <p>Tourism is one of the most important industries in Jamaica, contributing billions of dollars to the economy each year. Tourists come from around the world to enjoy Jamaica's beaches, culture, music, and cuisine. The industry employs hundreds of thousands of Jamaicans directly or indirectly, including hotel workers, tour guides, taxi drivers, craft vendors, and restaurant staff.</p>
              <p>However, tourism also brings challenges. Large resort developments can damage fragile coastal ecosystems, including coral reefs and mangrove forests. Some all-inclusive resorts keep most tourist spending within their own facilities, limiting the money that reaches local communities and small businesses.</p>
              <p>There is growing interest in 'community tourism' — a form of travel that connects tourists with local Jamaican culture, food, crafts, and natural areas. Community tourism keeps more money within local communities, helps preserve cultural traditions, and encourages environmentally responsible travel.</p>
              <p>A balanced approach to tourism is essential. Jamaica must attract visitors while protecting its natural resources, ensuring that local communities benefit fairly, and preserving the cultural identity that makes Jamaica such a unique destination. Students who understand these issues can become informed advocates for sustainable tourism.</p>
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
              <p className="text-slate-700">Write a persuasive article for a tourism magazine arguing that Jamaica should develop more community tourism. Use evidence from the source to explain TWO benefits, address ONE concern about current tourism, and propose ONE creative idea that schools could support.</p>
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
