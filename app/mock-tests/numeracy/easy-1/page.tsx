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
  // 1–10 (your current ones improved)
  {
    question: "4,236 + 1,452 = ?",
    options: ["5,588", "5,688", "5,788", "6,688"],
    answer: 1,
    explanation: "5,688",
    skill: "Addition",
  },
  {
    question: "180 ÷ 6 = ?",
    options: ["20", "25", "30", "36"],
    answer: 2,
    explanation: "30",
    skill: "Division",
  },
  {
    question: "Equivalent to 1/2?",
    options: ["2/3", "2/4", "3/5", "4/6"],
    answer: 1,
    explanation: "2/4 = 1/2",
    skill: "Fractions",
  },
  {
    question: "25% of 80?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "20",
    skill: "Percentages",
  },
  {
    question: "Perimeter: 8 and 5",
    options: ["13", "26", "40", "80"],
    answer: 1,
    explanation: "26",
    skill: "Measurement",
  },
  {
    question: "Mass unit?",
    options: ["ml", "kg", "cm", "L"],
    answer: 1,
    explanation: "kg",
    skill: "Units",
  },
  {
    question: "Pattern: +5 after 20?",
    options: ["21", "22", "25", "30"],
    answer: 2,
    explanation: "25",
    skill: "Patterns",
  },
  {
    question: "12 + 15 = ?",
    options: ["23", "25", "27", "30"],
    answer: 2,
    explanation: "27",
    skill: "Addition",
  },
  {
    question: "5-sided shape?",
    options: ["Triangle", "Square", "Pentagon", "Hexagon"],
    answer: 2,
    explanation: "Pentagon",
    skill: "Geometry",
  },
  {
    question: "Range: 8,12,15,20?",
    options: ["8", "10", "12", "20"],
    answer: 2,
    explanation: "12",
    skill: "Data",
  },

  // 11–20
  {
    question: "6 × 7",
    options: ["36", "42", "48", "56"],
    answer: 1,
    explanation: "42",
    skill: "Multiplication",
  },
  {
    question: "81 ÷ 9",
    options: ["7", "8", "9", "10"],
    answer: 2,
    explanation: "9",
    skill: "Division",
  },
  {
    question: "1/4 of 40",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10",
    skill: "Fractions",
  },
  {
    question: "10% of 100",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10",
    skill: "Percentages",
  },
  {
    question: "Area: 6 × 4",
    options: ["10", "20", "24", "30"],
    answer: 2,
    explanation: "24",
    skill: "Area",
  },
  {
    question: "2:00 → 3:15",
    options: ["1h", "1h15", "1h30", "2h"],
    answer: 1,
    explanation: "1h15",
    skill: "Time",
  },
  {
    question: "Next: 2,4,6",
    options: ["7", "8", "9", "10"],
    answer: 1,
    explanation: "8",
    skill: "Patterns",
  },
  {
    question: "20 + 30",
    options: ["40", "50", "60", "70"],
    answer: 1,
    explanation: "50",
    skill: "Addition",
  },
  {
    question: "Square shape sides?",
    options: ["3", "4", "5", "6"],
    answer: 1,
    explanation: "4",
    skill: "Geometry",
  },
  {
    question: "Mean of 2,4,6",
    options: ["3", "4", "5", "6"],
    answer: 1,
    explanation: "4",
    skill: "Mean",
  },

  // 21–30
  {
    question: "5 × 5",
    options: ["20", "25", "30", "35"],
    answer: 1,
    explanation: "25",
    skill: "Multiplication",
  },
  {
    question: "100 ÷ 10",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10",
    skill: "Division",
  },
  {
    question: "1/2 of 20",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10",
    skill: "Fractions",
  },
  {
    question: "50% of 60",
    options: ["20", "30", "40", "50"],
    answer: 1,
    explanation: "30",
    skill: "Percentages",
  },
  {
    question: "Area: 5 × 5",
    options: ["10", "20", "25", "30"],
    answer: 2,
    explanation: "25",
    skill: "Area",
  },
  {
    question: "1:00 → 2:00",
    options: ["30m", "1h", "2h", "3h"],
    answer: 1,
    explanation: "1h",
    skill: "Time",
  },
  {
    question: "Next: 10,20,30",
    options: ["35", "40", "45", "50"],
    answer: 1,
    explanation: "40",
    skill: "Patterns",
  },
  {
    question: "40 + 10",
    options: ["45", "50", "55", "60"],
    answer: 1,
    explanation: "50",
    skill: "Addition",
  },
  {
    question: "Triangle sides?",
    options: ["3", "4", "5", "6"],
    answer: 0,
    explanation: "3",
    skill: "Geometry",
  },
  {
    question: "Mean of 10,20",
    options: ["10", "15", "20", "25"],
    answer: 1,
    explanation: "15",
    skill: "Mean",
  },

  // 31–40
  {
    question: "3 × 4",
    options: ["10", "12", "14", "16"],
    answer: 1,
    explanation: "12",
    skill: "Multiplication",
  },
  {
    question: "60 ÷ 5",
    options: ["10", "12", "15", "20"],
    answer: 1,
    explanation: "12",
    skill: "Division",
  },
  {
    question: "1/5 of 25",
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "5",
    skill: "Fractions",
  },
  {
    question: "20% of 50",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10",
    skill: "Percentages",
  },
  {
    question: "Area: 3 × 3",
    options: ["6", "9", "12", "15"],
    answer: 1,
    explanation: "9",
    skill: "Area",
  },
  {
    question: "2:00 → 2:30",
    options: ["15m", "20m", "30m", "45m"],
    answer: 2,
    explanation: "30m",
    skill: "Time",
  },
  {
    question: "Next: 1,2,3",
    options: ["4", "5", "6", "7"],
    answer: 0,
    explanation: "4",
    skill: "Patterns",
  },
  {
    question: "10 + 10",
    options: ["15", "20", "25", "30"],
    answer: 1,
    explanation: "20",
    skill: "Addition",
  },
  {
    question: "Square corners?",
    options: ["2", "3", "4", "5"],
    answer: 2,
    explanation: "4",
    skill: "Geometry",
  },
  {
    question: "Mean of 6,8",
    options: ["6", "7", "8", "9"],
    answer: 1,
    explanation: "7",
    skill: "Mean",
  },
]

export default function NumeracyEasy1Page() {
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

          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <Calculator className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">
                Grade 5 Mathematics Easy 1
              </CardTitle>
              <p className="text-slate-600">
                Direct calculations, simple word problems, and basic reasoning.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This easy-level Grade 5 Mathematics practice checks basic
                  number operations, fractions, percentages, measurement,
                  geometry, patterns, and data handling.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: choosing the correct operation</li>
                  <li>Communication: reading word problems carefully</li>
                  <li>Creativity: seeing patterns and relationships</li>
                  <li>Problem Solving: applying mathematics to everyday life</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">
                    {questions.length}
                  </p>
                  <p className="text-sm text-slate-600">Questions</p>
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
          <Card className="mx-auto max-w-4xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">
                Mathematics Test Completed
              </CardTitle>
              <p className="text-slate-600">Grade 5 Mathematics Easy 1</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">
                  {score}/{questions.length}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Teacher-Style Feedback
                </h3>
                <p className="text-slate-700">
                  Review each explanation carefully. Strong Mathematics
                  performance comes from reading the question, choosing the
                  correct operation, and checking whether the answer makes sense.
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
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
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
              <h1 className="font-bold">Grade 5 Mathematics Easy 1</h1>
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

          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">
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

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600"
          >
            Submit Test
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
