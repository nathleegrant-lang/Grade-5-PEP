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
    question:
      "Why is recycling important based on the information provided?",
    options: [
      "It makes the school look colourful",
      "It reduces waste and helps protect the environment",
      "It gives students more homework",
      "It increases the use of plastic",
    ],
    answer: 1,
  },
  {
    question:
      "Which item would be BEST to place in a recycling bin?",
    options: [
      "Plastic bottle",
      "Food waste",
      "Dirty tissue",
      "Broken glass mixed with food",
    ],
    answer: 0,
  },
  {
    question:
      "What skill is MOST important when working together on a recycling project?",
    options: [
      "Ignoring others",
      "Working alone only",
      "Collaboration and teamwork",
      "Guessing answers",
    ],
    answer: 2,
  },
]

const shortAnswers: ShortAnswer[] = [
  {
    question:
      "State ONE benefit of recycling for the school.",
    answer:
      "Recycling reduces waste and helps keep the school environment clean.",
  },
  {
    question:
      "Give ONE responsibility students have in a recycling programme.",
    answer:
      "Students must sort waste into the correct recycling bins.",
  },
]

export default function PerformanceEasy1Page() {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!started || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowResults(true)
          return 0
        }
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
    mcqs.forEach((q, i) => {
      if (answers[i] === q.answer) total++
    })
    setScore(total)
  }

  const handleSubmit = () => {
    calculateScore()
    setShowResults(true)
  }
    if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/performance/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Performance Task Mock Tests
            </Button>
          </Link>

          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">
                Grade 5 Performance Task Easy 1
              </CardTitle>
              <p className="text-slate-600">
                Topic: School Recycling Programme
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Task Scenario
                </h3>
                <p className="text-slate-700">
                  Your school wants to start a recycling programme to reduce
                  waste and protect the environment. Read the information,
                  answer the questions, and complete the writing task.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: choosing the best solution</li>
                  <li>Communication: explaining ideas clearly</li>
                  <li>Collaboration: thinking about teamwork</li>
                  <li>Creativity: suggesting useful improvements</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">
                    {mcqs.length}
                  </p>
                  <p className="text-sm text-slate-600">Multiple Choice</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>

              <Button
                onClick={() => setStarted(true)}
                className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600"
              >
                Start Task
              </Button>
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
              <CardTitle className="text-2xl text-amber-800">
                Performance Task Completed
              </CardTitle>
              <p className="text-slate-600">
                Grade 5 Performance Task Easy 1
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">
                  {score}/{mcqs.length}
                </p>
                <p className="mt-2 text-slate-600">
                  Multiple-choice score
                </p>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Teacher-Style Feedback
                </h3>
                <p className="text-slate-700">
                  Review your multiple-choice answers and compare your written
                  responses with the sample answers. Strong Grade 5 performance
                  should show clear evidence, complete sentences, and thoughtful
                  ideas.
                </p>
              </div>

              <div className="space-y-4">
                {mcqs.map((q, index) => {
                  const correct = answers[index] === q.answer

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border-2 p-4 ${
                        correct
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {correct ? (
                          <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-red-600" />
                        )}

                        <div>
                          <p className="font-semibold text-slate-800">
                            Question {index + 1}
                          </p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            {answers[index] !== undefined
                              ? q.options[answers[index]]
                              : "Not answered"}
                          </p>
                          <p className="text-sm text-green-700">
                            Correct answer: {q.options[q.answer]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 font-semibold text-blue-800">
                  Sample Short Responses
                </h3>
                <div className="space-y-3">
                  {shortAnswers.map((item, index) => (
                    <div key={index} className="rounded bg-white p-3">
                      <p className="font-medium text-slate-800">
                        {item.question}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Sample answer: {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">
                  Extended Writing Model Answer
                </h3>
                <p className="whitespace-pre-line text-slate-700">
                  Dear Principal,

                  I think the school recycling programme is a good idea because
                  it will help to reduce waste and keep our school environment
                  cleaner. Students can work together to sort paper and plastic
                  into the correct bins.

                  This programme will also teach students responsibility and
                  teamwork. Each class could have a recycling monitor to remind
                  students what to do. I believe this project will help our
                  school become cleaner, healthier, and more environmentally
                  friendly.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>

                <Button
                  onClick={() => {
                    setStarted(false)
                    setShowResults(false)
                    setAnswers([])
                    setScore(0)
                    setTimeLeft(60 * 60)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>

                <Link href="/mock-tests/performance/language-arts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Performance Tasks
                  </Button>
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

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4 text-white">
            <div>
              <h1 className="font-bold">Grade 5 Performance Task Easy 1</h1>
              <p className="text-sm text-slate-200">
                School Recycling Programme
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={(answers.filter((a) => a !== undefined).length / mcqs.length) * 100}
            className="h-2"
          />

          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">
                Source Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>
                Recycling means collecting and reusing materials instead of
                throwing them away. Common recyclable items include paper,
                cardboard, plastic bottles, and some metal containers.
              </p>
              <p>
                At school, recycling can help reduce waste, keep the compound
                clean, and teach students responsibility. A successful recycling
                programme needs teamwork. Students, teachers, and cleaners must
                all understand what should go into each bin.
              </p>
              <p>
                Some schools create posters, appoint class recycling monitors,
                and hold competitions to encourage students to participate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">
                Multiple-Choice Questions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {mcqs.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-semibold text-slate-800">
                    {qIndex + 1}. {q.question}
                  </p>

                  <div className="grid gap-3">
                    {q.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleSelect(qIndex, optionIndex)}
                        className={`rounded-lg border-2 p-3 text-left transition ${
                          answers[qIndex] === optionIndex
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <span className="mr-2 font-bold text-amber-700">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-sky-200">
            <CardHeader className="bg-sky-50">
              <CardTitle className="text-sky-800">
                Short Response Practice
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              {shortAnswers.map((item, index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <p className="font-medium text-slate-800">
                    {index + 1}. {item.question}
                  </p>
                  <textarea
                    className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm"
                    placeholder="Write your answer here..."
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">
                Extended Writing Task
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">
                Write a short letter to your principal explaining why the school
                recycling programme is a good idea. Give at least TWO reasons.
              </p>

              <textarea
                className="min-h-[220px] w-full rounded-lg border p-3 text-sm"
                placeholder="Write your letter here..."
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600"
          >
            Submit Task
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
