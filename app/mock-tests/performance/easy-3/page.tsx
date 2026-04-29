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
    "question": "According to the source, what is ONE benefit of using the school library?",
    "options": [
      "It replaces classroom lessons",
      "It helps students develop stronger vocabularies",
      "It allows students to watch videos",
      "It gives students free time"
    ],
    "answer": 1
  },
  {
    "question": "What role does the librarian play, according to the source?",
    "options": [
      "Marking students' homework",
      "Helping students find books and search for information",
      "Teaching Mathematics",
      "Keeping students quiet only"
    ],
    "answer": 1
  },
  {
    "question": "Which 21st-century skill does library research MOST develop?",
    "options": [
      "Memorising facts quickly",
      "Critical thinking and communication",
      "Drawing pictures",
      "Playing games"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "State ONE reason why the school library is important for students.",
    "answer": "The library gives students access to books and resources that help them learn beyond what is taught in the classroom."
  },
  {
    "question": "Give ONE way a student can make good use of the school library.",
    "answer": "A student can visit the library regularly to borrow books related to their schoolwork or to read for pleasure."
  }
]

export default function PerformanceEasy3Page() {
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Performance Task Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">Grade 5 Performance Task Easy 3</CardTitle>
              <p className="text-slate-600">Topic: The School Library</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Scenario</h3>
                <p className="text-slate-700">Your school wants to encourage more students to use the library. Read the information, answer the questions, and complete the writing task.</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Skills Practised</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: choosing the best solution</li>
                  <li>Communication: explaining ideas clearly</li>
                  <li>Collaboration: thinking about teamwork</li>
                  <li>Creativity: suggesting useful improvements</li>
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
              <p className="text-slate-600">Grade 5 Performance Task Easy 3</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">{score}/{mcqs.length}</p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">Review your multiple-choice answers and compare your written responses with the sample answers. Strong Grade 5 performance should show clear evidence, complete sentences, and thoughtful ideas.</p>
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
                <p className="whitespace-pre-line text-slate-700">Good morning, students!

I want to talk to you about one of the most useful places in our school — the library.

The library is not just a room full of books. It is a place where you can grow as a learner. First, reading regularly in the library helps you build your vocabulary and become a stronger writer. The more you read, the better you communicate in class and on tests. Second, the library teaches you how to find information for yourself. This skill — searching for answers — is something you will use for the rest of your life.

I encourage every student to visit the library at least once a week. Ask the librarian to recommend a book. You might be surprised how much you enjoy it. Let us make our library the busiest and most exciting place in school!</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-600">
                  <Printer className="mr-2 h-4 w-4" />Print / Save Report
                </Button>
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
              <h1 className="font-bold">Grade 5 Performance Task Easy 3</h1>
              <p className="text-sm text-slate-200">The School Library</p>
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
              <p>A library is a place where books, magazines, and other learning materials are stored for people to read and borrow. School libraries are important because they give students access to information that helps them learn beyond the classroom.</p>
              <p>Using the library regularly can improve reading skills, help with research, and introduce students to new ideas and stories. Libraries also provide a quiet space where students can focus and think carefully about what they are reading.</p>
              <p>Students who visit the library often tend to develop stronger vocabularies and perform better in their schoolwork. Librarians help students find the right books and teach them how to search for information. A well-used library is a sign of a school that values learning.</p>
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
              <p className="text-slate-700">Write a short paragraph to be read at school assembly encouraging your classmates to use the school library. Give at least TWO reasons why the library is valuable and explain how it can help them as students.</p>
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
