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
    "question": "According to the source, what cultural influences have shaped Jamaica's heritage?",
    "options": [
      "Only African and European",
      "African, European, Taino, East Indian, and Chinese influences",
      "Only the Taino people",
      "Only modern American culture"
    ],
    "answer": 1
  },
  {
    "question": "What does the source suggest is an opportunity for schools to celebrate Jamaican culture?",
    "options": [
      "Independence Day only",
      "Heritage Month in October",
      "The Christmas holidays",
      "Sports Day only"
    ],
    "answer": 1
  },
  {
    "question": "Which school activity does the source mention as a way to celebrate Jamaican culture?",
    "options": [
      "Only standardised tests",
      "Cultural fairs featuring traditional foods, crafts, music, and dance",
      "Studying only foreign literature",
      "Banning Creole language"
    ],
    "answer": 1
  },
  {
    "question": "According to the source, why are community elders and artists valuable for cultural education?",
    "options": [
      "They are cheaper than teachers",
      "They give students direct access to living cultural traditions through their knowledge and skills",
      "They make school easier",
      "They only talk about history"
    ],
    "answer": 1
  },
  {
    "question": "Which organisation does the source mention that schools can partner with for cultural programmes?",
    "options": [
      "The Ministry of Agriculture",
      "The Jamaica Cultural Development Commission (JCDC)",
      "The National Water Commission",
      "The Jamaica Tourist Board"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain why it is important for students to learn about Jamaica's cultural heritage.",
    "answer": "Learning about Jamaica's cultural heritage helps students develop a strong sense of national identity and pride. Understanding how different groups \u2014 African, Taino, European, East Indian, and Chinese \u2014 have contributed to Jamaican culture helps students appreciate diversity and the meaning of the national motto 'Out of Many, One People.'"
  },
  {
    "question": "Describe ONE way a school could invite the community to participate in a cultural celebration.",
    "answer": "A school could invite community elders, musicians, or traditional craft makers to attend a cultural fair and demonstrate their skills or share stories from Jamaica's history, creating a meaningful link between the school and the broader community while giving students authentic cultural experiences."
  }
]

export default function PerformanceModerate8Page() {
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
              <CardTitle className="text-2xl text-amber-800">Grade 5 Performance Task Moderate 8</CardTitle>
              <p className="text-slate-600">Topic: Celebrating Jamaican Cultural Heritage at School</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Overview</h3>
                <p className="text-slate-700">Your school wants to strengthen students' connection to Jamaican culture. Read the information and complete all parts of the task.</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills Assessed</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating information and forming supported opinions</li>
                  <li>Communication: explaining reasons clearly</li>
                  <li>Collaboration: considering how people work together</li>
                  <li>Creativity: suggesting useful ways to improve the initiative</li>
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
              <p className="text-slate-600">Grade 5 Performance Task Moderate 8</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">{score}/{mcqs.length}</p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
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
                          <p className="mt-1 text-sm text-slate-600">Your answer: <span className={isCorrect ? "font-medium text-green-700" : "font-medium text-red-700"}>{answers[index] !== undefined ? q.options[answers[index]] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.answer]}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Model Short Answers</h3>
                {shortAnswers.map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-medium text-slate-800">{index + 1}. {item.question}</p>
                    <p className="mt-1 text-sm text-slate-700 italic">Model answer: {item.answer}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-600"><Printer className="mr-2 h-4 w-4" />Print Report</Button>
                <Link href="/mock-tests/performance" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Performance Tasks</Button>
                </Link>
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
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4 text-white">
            <div>
              <h1 className="font-bold">Grade 5 Performance Task Moderate 8</h1>
              <p className="text-sm text-slate-200">Celebrating Jamaican Cultural Heritage at School</p>
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
              <p>Jamaica's cultural heritage is rich and diverse, drawing from African, European, Taino, East Indian, and Chinese influences that have shaped the island's music, food, language, and traditions over centuries. Understanding this heritage helps young Jamaicans develop a strong sense of identity and pride in their country. National events such as Heritage Month (October) provide an opportunity for schools to celebrate and teach about Jamaica's history and culture.</p>
              <p>Schools can celebrate Jamaican culture through a variety of activities: cultural fairs that showcase traditional foods, crafts, music, and dance; performances featuring folk songs and storytelling; and lessons that integrate Jamaican history, literature, and Creole language. These activities help students appreciate the contributions of different groups to Jamaican society and understand that 'Out of Many, One People' means valuing every cultural thread.</p>
              <p>Community elders, artists, and performers are valuable resources for cultural education. Inviting them into the school to share their knowledge, stories, and skills gives students direct access to living cultural traditions. Schools that partner with organisations such as the Jamaica Cultural Development Commission (JCDC) can access resources and guidance for running cultural programmes that are authentic and educational.</p>
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
              <p className="text-slate-700">Write a speech you could deliver at your school's Heritage Month assembly. Explain why celebrating Jamaican cultural heritage is important and suggest TWO activities the school should include in its Heritage Month programme. Use examples from the source to support your ideas.</p>
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
