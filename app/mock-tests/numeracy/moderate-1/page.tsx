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
  // 1–10 (existing improved)
  {
    question: "48 × 12 = ?",
    options: ["480", "516", "576", "608"],
    answer: 2,
    explanation: "48 × 12 = 576.",
    skill: "Multiplication",
  },
  {
    question: "$5,000 - ($1,275 + $850) = ?",
    options: ["$2,875", "$3,125", "$3,275", "$3,725"],
    answer: 0,
    explanation: "Remaining = $2,875.",
    skill: "Money",
  },
  {
    question: "Which is greater: 3/4 or 5/8?",
    options: ["3/4", "5/8", "Equal", "Cannot compare"],
    answer: 0,
    explanation: "3/4 = 6/8, so greater.",
    skill: "Fractions",
  },
  {
    question: "36/40 as %?",
    options: ["80%", "85%", "90%", "95%"],
    answer: 2,
    explanation: "36 ÷ 40 = 90%.",
    skill: "Percentages",
  },
  {
    question: "Area: 15 × 8",
    options: ["23", "46", "120", "150"],
    answer: 2,
    explanation: "120 m².",
    skill: "Area",
  },
  {
    question: "3:45–5:20 duration?",
    options: ["1h25", "1h35", "1h45", "2h25"],
    answer: 1,
    explanation: "1h35m.",
    skill: "Time",
  },
  {
    question: "Pattern: +5 → next after 19?",
    options: ["22", "23", "24", "25"],
    answer: 2,
    explanation: "24.",
    skill: "Patterns",
  },
  {
    question: "24 + 36 + 40",
    options: ["90", "96", "100", "106"],
    answer: 2,
    explanation: "100.",
    skill: "Data",
  },
  {
    question: "Angle >90 <180?",
    options: ["Acute", "Right", "Obtuse", "Straight"],
    answer: 2,
    explanation: "Obtuse.",
    skill: "Geometry",
  },
  {
    question: "Mean: 6,8,10,12",
    options: ["8", "9", "10", "11"],
    answer: 1,
    explanation: "9.",
    skill: "Mean",
  },

  // 11–20
  {
    question: "25 × 16",
    options: ["350", "375", "400", "425"],
    answer: 2,
    explanation: "400.",
    skill: "Multiplication",
  },
  {
    question: "144 ÷ 12",
    options: ["10", "11", "12", "13"],
    answer: 2,
    explanation: "12.",
    skill: "Division",
  },
  {
    question: "1/2 + 1/4",
    options: ["1/2", "3/4", "2/6", "1"],
    answer: 1,
    explanation: "3/4.",
    skill: "Fractions",
  },
  {
    question: "0.5 as %",
    options: ["25%", "50%", "75%", "100%"],
    answer: 1,
    explanation: "50%.",
    skill: "Decimals",
  },
  {
    question: "Perimeter: 10 × 6 rectangle",
    options: ["16", "32", "60", "120"],
    answer: 1,
    explanation: "32.",
    skill: "Perimeter",
  },
  {
    question: "1.5 × 10",
    options: ["0.15", "1.5", "15", "150"],
    answer: 2,
    explanation: "15.",
    skill: "Decimals",
  },
  {
    question: "75% of 80",
    options: ["40", "50", "60", "70"],
    answer: 2,
    explanation: "60.",
    skill: "Percentages",
  },
  {
    question: "Next: 2,4,8,16",
    options: ["18", "24", "32", "36"],
    answer: 2,
    explanation: "×2 → 32.",
    skill: "Patterns",
  },
  {
    question: "Range: 10,20,35,50",
    options: ["20", "30", "40", "50"],
    answer: 2,
    explanation: "50-10=40.",
    skill: "Data",
  },
  {
    question: "Square number?",
    options: ["12", "18", "25", "30"],
    answer: 2,
    explanation: "25.",
    skill: "Squares",
  },

  // 21–30
  {
    question: "1/3 of 90",
    options: ["20", "25", "30", "35"],
    answer: 2,
    explanation: "30.",
    skill: "Fractions",
  },
  {
    question: "Convert 2 km to m",
    options: ["200", "2,000", "20,000", "200,000"],
    answer: 1,
    explanation: "2,000.",
    skill: "Conversion",
  },
  {
    question: "Mean: 5,7,9",
    options: ["6", "7", "8", "9"],
    answer: 1,
    explanation: "7.",
    skill: "Mean",
  },
  {
    question: "50% of 160",
    options: ["60", "70", "80", "90"],
    answer: 2,
    explanation: "80.",
    skill: "Percentages",
  },
  {
    question: "3/5 as %",
    options: ["40%", "50%", "60%", "70%"],
    answer: 2,
    explanation: "60%.",
    skill: "Fractions",
  },
  {
    question: "Volume: 4×5×3",
    options: ["60", "50", "40", "30"],
    answer: 0,
    explanation: "60.",
    skill: "Volume",
  },
  {
    question: "25 × 4 ÷ 5",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "20.",
    skill: "Order",
  },
  {
    question: "0.2 × 50",
    options: ["5", "10", "15", "20"],
    answer: 1,
    explanation: "10.",
    skill: "Decimals",
  },
  {
    question: "8²",
    options: ["16", "32", "64", "128"],
    answer: 2,
    explanation: "64.",
    skill: "Squares",
  },
  {
    question: "LCM of 3 & 4",
    options: ["6", "9", "12", "15"],
    answer: 2,
    explanation: "12.",
    skill: "Factors",
  },

  // 31–40
  {
    question: "20% of 150",
    options: ["20", "25", "30", "35"],
    answer: 2,
    explanation: "30.",
    skill: "Percentages",
  },
  {
    question: "3² + 4²",
    options: ["12", "20", "25", "30"],
    answer: 2,
    explanation: "25.",
    skill: "Squares",
  },
  {
    question: "0.25 × 100",
    options: ["10", "20", "25", "50"],
    answer: 2,
    explanation: "25.",
    skill: "Decimals",
  },
  {
    question: "4/5 of 100",
    options: ["60", "70", "80", "90"],
    answer: 2,
    explanation: "80.",
    skill: "Fractions",
  },
  {
    question: "Mean: 2,4,6,8",
    options: ["4", "5", "6", "7"],
    answer: 1,
    explanation: "5.",
    skill: "Mean",
  },
  {
    question: "7 × 6 + 8",
    options: ["40", "42", "50", "56"],
    answer: 2,
    explanation: "50.",
    skill: "Order",
  },
  {
    question: "9 × 8 - 12",
    options: ["60", "62", "64", "72"],
    answer: 0,
    explanation: "60.",
    skill: "Order",
  },
  {
    question: "12 ÷ 0.5",
    options: ["6", "12", "24", "36"],
    answer: 2,
    explanation: "24.",
    skill: "Decimals",
  },
  {
    question: "Cube of 2",
    options: ["4", "6", "8", "16"],
    answer: 2,
    explanation: "8.",
    skill: "Powers",
  },
  {
    question: "100 - (20 × 3)",
    options: ["20", "30", "40", "60"],
    answer: 2,
    explanation: "40.",
    skill: "Order",
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
