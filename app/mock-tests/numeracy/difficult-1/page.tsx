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
  // 1–10 (existing style, expanded difficulty)
  {
    question: "125 × 85 = ?",
    options: ["10,125", "10,625", "11,625", "12,625"],
    answer: 1,
    explanation: "125 × 85 = 10,625.",
    skill: "Multiplication",
  },
  {
    question: "36 × 24 = ?",
    options: ["720", "864", "960", "1,024"],
    answer: 1,
    explanation: "36 × 24 = 864.",
    skill: "Multiplication",
  },
  {
    question: "3/4 + 2/3 = ?",
    options: ["1 1/12", "1 5/12", "1 7/12", "2"],
    answer: 1,
    explanation: "3/4 = 9/12, 2/3 = 8/12 → 17/12 = 1 5/12.",
    skill: "Fractions",
  },
  {
    question: "42 out of 50 as a percentage is:",
    options: ["80%", "82%", "84%", "86%"],
    answer: 2,
    explanation: "42 ÷ 50 = 0.84 = 84%.",
    skill: "Percentages",
  },
  {
    question: "Mean of 12, 16, 20, 22, x is 18. Find x.",
    options: ["18", "20", "22", "24"],
    answer: 1,
    explanation: "Total = 18×5 = 90. Known = 70 → x = 20.",
    skill: "Mean",
  },
  {
    question: "7:35 to 10:10 duration?",
    options: ["2h 25m", "2h 35m", "2h 45m", "3h"],
    answer: 1,
    explanation: "2h 35m.",
    skill: "Time",
  },
  {
    question: "3, 6, 12, 24, __",
    options: ["30", "36", "42", "48"],
    answer: 3,
    explanation: "×2 pattern → 48.",
    skill: "Patterns",
  },
  {
    question: "10% discount on $2,500 = sale price?",
    options: ["$2,000", "$2,250", "$2,400", "$2,450"],
    answer: 1,
    explanation: "$250 discount → $2,250.",
    skill: "Percentages",
  },
  {
    question: "Triangle: 45° + 65° → third angle?",
    options: ["60°", "70°", "80°", "90°"],
    answer: 1,
    explanation: "180 - 110 = 70°.",
    skill: "Angles",
  },
  {
    question: "2.5L for 10 → 30 students?",
    options: ["5", "6.5", "7.5", "10"],
    answer: 2,
    explanation: "×3 → 7.5L.",
    skill: "Ratio",
  },

  // 11–20 (multi-step)
  {
    question: "480 ÷ 12 = ?",
    options: ["30", "35", "40", "45"],
    answer: 2,
    explanation: "480 ÷ 12 = 40.",
    skill: "Division",
  },
  {
    question: "1/2 × 3/5 = ?",
    options: ["3/10", "3/7", "5/10", "6/10"],
    answer: 0,
    explanation: "Multiply → 3/10.",
    skill: "Fractions",
  },
  {
    question: "0.75 as a fraction?",
    options: ["3/4", "2/3", "1/2", "4/5"],
    answer: 0,
    explanation: "0.75 = 3/4.",
    skill: "Decimals",
  },
  {
    question: "Area: 18 × 9 = ?",
    options: ["162", "152", "171", "180"],
    answer: 0,
    explanation: "162.",
    skill: "Area",
  },
  {
    question: "Mean of 10, 20, 30?",
    options: ["15", "20", "25", "30"],
    answer: 1,
    explanation: "60 ÷ 3 = 20.",
    skill: "Mean",
  },
  {
    question: "1.2 × 10 = ?",
    options: ["0.12", "1.2", "12", "120"],
    answer: 2,
    explanation: "Shift decimal → 12.",
    skill: "Decimals",
  },
  {
    question: "75% of 200?",
    options: ["100", "120", "150", "175"],
    answer: 2,
    explanation: "3/4 × 200 = 150.",
    skill: "Percentages",
  },
  {
    question: "Perimeter: 10, 6 rectangle?",
    options: ["16", "32", "60", "120"],
    answer: 1,
    explanation: "2(10+6)=32.",
    skill: "Perimeter",
  },
  {
    question: "8² = ?",
    options: ["16", "32", "64", "128"],
    answer: 2,
    explanation: "8×8 = 64.",
    skill: "Squares",
  },
  {
    question: "LCM of 4 and 6?",
    options: ["8", "10", "12", "24"],
    answer: 2,
    explanation: "LCM = 12.",
    skill: "Factors",
  },

  // 21–30 (reasoning)
  {
    question: "1/3 of 90?",
    options: ["20", "25", "30", "35"],
    answer: 2,
    explanation: "90 ÷ 3 = 30.",
    skill: "Fractions",
  },
  {
    question: "Convert 2.5km to m",
    options: ["250", "2,500", "25,000", "250,000"],
    answer: 1,
    explanation: "×1000 = 2,500.",
    skill: "Conversion",
  },
  {
    question: "Mean: 5, 7, 9, 11?",
    options: ["6", "7", "8", "9"],
    answer: 2,
    explanation: "32 ÷ 4 = 8.",
    skill: "Mean",
  },
  {
    question: "50% of 180?",
    options: ["60", "80", "90", "100"],
    answer: 2,
    explanation: "Half = 90.",
    skill: "Percentages",
  },
  {
    question: "Next: 2, 5, 11, 23?",
    options: ["35", "47", "49", "50"],
    answer: 1,
    explanation: "+3, +6, +12 → +24 = 47.",
    skill: "Patterns",
  },
  {
    question: "2/5 = ?%",
    options: ["20%", "25%", "40%", "50%"],
    answer: 2,
    explanation: "2/5 = 40%.",
    skill: "Fractions to %",
  },
  {
    question: "Volume: 5×4×3",
    options: ["60", "50", "40", "30"],
    answer: 0,
    explanation: "60.",
    skill: "Volume",
  },
  {
    question: "Range: 5, 10, 15, 25?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "25-5=20.",
    skill: "Data",
  },
  {
    question: "25 × 4 ÷ 2",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "100 ÷ 2 = 50.",
    skill: "Order",
  },
  {
    question: "Convert 3/5 to decimal",
    options: ["0.3", "0.5", "0.6", "0.8"],
    answer: 2,
    explanation: "3 ÷ 5 = 0.6.",
    skill: "Decimals",
  },

  // 31–40 (hardest reasoning)
  {
    question: "15% of 400?",
    options: ["40", "50", "60", "80"],
    answer: 2,
    explanation: "10% = 40, 5% = 20 → 60.",
    skill: "Percentages",
  },
  {
    question: "3² + 4² = ?",
    options: ["12", "20", "25", "30"],
    answer: 2,
    explanation: "9+16=25.",
    skill: "Squares",
  },
  {
    question: "0.25 × 80?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "¼ of 80 = 20.",
    skill: "Decimals",
  },
  {
    question: "4/5 of 200?",
    options: ["120", "140", "160", "180"],
    answer: 2,
    explanation: "200 × 4/5 = 160.",
    skill: "Fractions",
  },
  {
    question: "Mean: 2,4,6,8,10?",
    options: ["4", "5", "6", "7"],
    answer: 2,
    explanation: "30 ÷ 5 = 6.",
    skill: "Mean",
  },
  {
    question: "7 × 8 + 6",
    options: ["50", "56", "62", "64"],
    answer: 2,
    explanation: "56 + 6 = 62.",
    skill: "Order",
  },
  {
    question: "9 × 9 - 18",
    options: ["63", "72", "81", "90"],
    answer: 0,
    explanation: "81 - 18 = 63.",
    skill: "Order",
  },
  {
    question: "12 ÷ 0.5",
    options: ["6", "12", "24", "36"],
    answer: 2,
    explanation: "Dividing by 0.5 doubles → 24.",
    skill: "Decimals",
  },
  {
    question: "Cube of 3?",
    options: ["6", "9", "18", "27"],
    answer: 3,
    explanation: "3³ = 27.",
    skill: "Powers",
  },
  {
    question: "100 - (25 × 2)",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "100 - 50 = 50.",
    skill: "Order",
  },
]

export default function NumeracyDifficult1Page() {
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
                Grade 5 Mathematics Difficult 1
              </CardTitle>
              <p className="text-slate-600">
                Multi-step reasoning, stronger distractors, and careful problem
                solving.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This difficult-level Grade 5 Mathematics practice includes
                  multi-step problems, fractions, percentages, mean, time,
                  geometry, and proportional reasoning.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: selecting the best strategy</li>
                  <li>Communication: interpreting longer word problems</li>
                  <li>Creativity: seeing relationships between quantities</li>
                  <li>Problem Solving: applying multiple steps accurately</li>
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
              <p className="text-slate-600">Grade 5 Mathematics Difficult 1</p>
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
                  Difficult Mathematics questions require careful reading,
                  multiple steps, and checking your final answer. Review each
                  explanation to identify whether the error was in operation,
                  calculation, comparison, or reasoning.
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
              <h1 className="font-bold">Grade 5 Mathematics Difficult 1</h1>
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
                  <p className="text-sm font-semibold text-amber-700">
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
