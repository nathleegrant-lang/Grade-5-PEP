"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
} from "lucide-react"

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
  skill: string
}

const questions: Question[] = [
  {
    question:
      "A school bought 48 packs of pencils. Each pack has 12 pencils. How many pencils were bought altogether?",
    options: ["480", "516", "576", "608"],
    answer: 2,
    explanation: "48 × 12 = 576 pencils.",
    skill: "Multiplication",
  },
  {
    question:
      "A shopkeeper had $5,000. She spent $1,275 on books and $850 on bags. How much money was left?",
    options: ["$2,875", "$3,125", "$3,275", "$3,725"],
    answer: 0,
    explanation: "$1,275 + $850 = $2,125. Then $5,000 - $2,125 = $2,875.",
    skill: "Money / Multi-step Problem",
  },
  {
    question: "Which fraction is greater: 3/4 or 5/8?",
    options: ["3/4", "5/8", "They are equal", "Cannot be compared"],
    answer: 0,
    explanation: "3/4 = 6/8. Since 6/8 is greater than 5/8, 3/4 is greater.",
    skill: "Fractions",
  },
  {
    question:
      "A student scored 36 out of 40 on a test. What percentage did the student score?",
    options: ["80%", "85%", "90%", "95%"],
    answer: 2,
    explanation: "36 out of 40 = 36 ÷ 40 = 0.9 = 90%.",
    skill: "Percentages",
  },
  {
    question:
      "A rectangular garden is 15 m long and 8 m wide. What is its area?",
    options: ["23 m²", "46 m²", "120 m²", "150 m²"],
    answer: 2,
    explanation: "Area = length × width = 15 × 8 = 120 m².",
    skill: "Measurement / Area",
  },
  {
    question:
      "A movie started at 3:45 p.m. and ended at 5:20 p.m. How long did it last?",
    options: ["1 hour 25 minutes", "1 hour 35 minutes", "1 hour 45 minutes", "2 hours 25 minutes"],
    answer: 1,
    explanation: "From 3:45 to 4:45 is 1 hour. From 4:45 to 5:20 is 35 minutes. Total = 1 hour 35 minutes.",
    skill: "Time",
  },
  {
    question:
      "The pattern is 4, 9, 14, 19, ___. What is the next number?",
    options: ["22", "23", "24", "25"],
    answer: 2,
    explanation: "The pattern increases by 5 each time. 19 + 5 = 24.",
    skill: "Patterns",
  },
  {
    question:
      "A class collected bottles for recycling. Monday: 24, Tuesday: 36, Wednesday: 40. How many bottles were collected altogether?",
    options: ["90", "96", "100", "106"],
    answer: 2,
    explanation: "24 + 36 + 40 = 100 bottles.",
    skill: "Data Handling",
  },
  {
    question:
      "Which angle is greater than 90° but less than 180°?",
    options: ["Acute angle", "Right angle", "Obtuse angle", "Straight angle"],
    answer: 2,
    explanation: "An obtuse angle is greater than 90° but less than 180°.",
    skill: "Geometry",
  },
  {
    question:
      "The mean of 6, 8, 10, and 12 is:",
    options: ["8", "9", "10", "11"],
    answer: 1,
    explanation: "6 + 8 + 10 + 12 = 36. Then 36 ÷ 4 = 9.",
    skill: "Statistics / Mean",
  },
]

export default function NumeracyModerate1Page() {
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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[questionIndex] = optionIndex
    setAnswers(updated)
  }

  const calculateScore = () => {
    let total = 0

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        total++
      }
    })

    setScore(total)
  }

  const handleSubmit = () => {
    calculateScore()
    setShowResults(true)
  }

  const resetTest = () => {
    setStarted(false)
    setTimeLeft(60 * 60)
    setAnswers([])
    setShowResults(false)
    setScore(0)
  }

  const answeredCount = answers.filter((answer) => answer !== undefined).length

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/mathematics">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mathematics Mock Tests
            </Button>
          </Link>

          <Card className="mx-auto max-w-3xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <Calculator className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Grade 5 Mathematics Moderate 1
              </CardTitle>
              <p className="text-slate-600">
                Multi-step questions, reasoning, and applied problem-solving.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This moderate-level Grade 5 Mathematics practice includes
                  multi-step word problems, fractions, percentages, time,
                  measurement, geometry, patterns, and data handling.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: deciding which operation to use</li>
                  <li>Communication: reading details carefully</li>
                  <li>Creativity: seeing number patterns and relationships</li>
                  <li>Problem Solving: applying Mathematics to daily situations</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {questions.length}
                  </p>
                  <p className="text-sm text-slate-600">Questions</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>

              <Button
                onClick={() => setStarted(true)}
                className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              >
                Start Test
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
          <Card className="mx-auto max-w-4xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Mathematics Test Completed
              </CardTitle>
              <p className="text-slate-600">Grade 5 Mathematics Moderate 1</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-blue-600">
                  {score}/{questions.length}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Teacher-Style Feedback
                </h3>
                <p className="text-slate-700">
                  Moderate questions require careful reading and more than one
                  step. Review your explanations to see where you needed to add,
                  subtract, multiply, divide, compare, or interpret data.
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const correct = answers[index] === question.answer

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
                            Question {index + 1} · {question.skill}
                          </p>
                          <p className="mt-1 text-slate-700">
                            {question.question}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            {answers[index] !== undefined
                              ? question.options[answers[index]]
                              : "Not answered"}
                          </p>
                          <p className="text-sm text-green-700">
                            Correct answer: {question.options[question.answer]}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            Explanation: {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>

                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>

                <Link href="/mock-tests/mathematics" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Mathematics Tests
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
              <h1 className="font-bold">Grade 5 Mathematics Moderate 1</h1>
              <p className="text-sm text-slate-200">
                Question progress: {answeredCount}/{questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={(answeredCount / questions.length) * 100}
            className="h-2"
          />

          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">
                Multiple-Choice Questions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3">
                  <p className="text-sm font-semibold text-sky-700">
                    {question.skill}
                  </p>

                  <p className="font-semibold text-slate-800">
                    {questionIndex + 1}. {question.question}
                  </p>

                  <div className="grid gap-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() =>
                          handleSelect(questionIndex, optionIndex)
                        }
                        className={`rounded-lg border-2 p-3 text-left transition ${
                          answers[questionIndex] === optionIndex
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <span className="mr-2 font-bold text-blue-700">
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

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
          >
            Submit Test
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
