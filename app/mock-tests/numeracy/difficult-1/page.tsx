"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card""use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
  Lock,
  Crown,
} from "lucide-react"

const FREE_QUESTIONS_LIMIT = 5

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
  skill: string
}

const questions: Question[] = [
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
    explanation: "3/4 = 9/12, 2/3 = 8/12, so 17/12 = 1 5/12.",
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
    explanation: "18 × 5 = 90. 12 + 16 + 20 + 22 = 70. So x = 20.",
    skill: "Mean",
  },
  {
    question: "A bus travelled from 7:35 a.m. to 10:10 a.m. How long was the journey?",
    options: ["2h 25m", "2h 35m", "2h 45m", "3h"],
    answer: 1,
    explanation: "7:35 to 9:35 is 2 hours, then 35 minutes to 10:10.",
    skill: "Time",
  },
  {
    question: "3, 6, 12, 24, __",
    options: ["30", "36", "42", "48"],
    answer: 3,
    explanation: "Each number is multiplied by 2. 24 × 2 = 48.",
    skill: "Patterns",
  },
  {
    question: "A bag costs $2,500. It has a 10% discount. What is the sale price?",
    options: ["$2,000", "$2,250", "$2,400", "$2,450"],
    answer: 1,
    explanation: "10% of $2,500 is $250. $2,500 - $250 = $2,250.",
    skill: "Percentages / Money",
  },
  {
    question: "A triangle has angles 45° and 65°. What is the third angle?",
    options: ["60°", "70°", "80°", "90°"],
    answer: 1,
    explanation: "45 + 65 = 110. 180 - 110 = 70°.",
    skill: "Angles",
  },
  {
    question: "2.5 litres of juice serves 10 students. How many litres are needed for 30 students?",
    options: ["5 L", "6.5 L", "7.5 L", "10 L"],
    answer: 2,
    explanation: "30 is 3 times 10, so 2.5 × 3 = 7.5 L.",
    skill: "Ratio",
  },
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
    explanation: "Multiply the numerators and denominators: 1 × 3 over 2 × 5 = 3/10.",
    skill: "Fractions",
  },
  {
    question: "0.75 as a fraction is:",
    options: ["3/4", "2/3", "1/2", "4/5"],
    answer: 0,
    explanation: "0.75 = 75/100 = 3/4.",
    skill: "Decimals",
  },
  {
    question: "A rectangle is 18 cm long and 9 cm wide. What is its area?",
    options: ["162 cm²", "152 cm²", "171 cm²", "180 cm²"],
    answer: 0,
    explanation: "Area = length × width = 18 × 9 = 162 cm².",
    skill: "Area",
  },
  {
    question: "What is the mean of 10, 20, and 30?",
    options: ["15", "20", "25", "30"],
    answer: 1,
    explanation: "10 + 20 + 30 = 60. 60 ÷ 3 = 20.",
    skill: "Mean",
  },
  {
    question: "1.2 × 10 = ?",
    options: ["0.12", "1.2", "12", "120"],
    answer: 2,
    explanation: "Multiplying by 10 moves the decimal one place to the right: 12.",
    skill: "Decimals",
  },
  {
    question: "75% of 200 = ?",
    options: ["100", "120", "150", "175"],
    answer: 2,
    explanation: "75% is 3/4. 3/4 of 200 = 150.",
    skill: "Percentages",
  },
  {
    question: "What is the perimeter of a rectangle with length 10 cm and width 6 cm?",
    options: ["16 cm", "32 cm", "60 cm", "120 cm"],
    answer: 1,
    explanation: "Perimeter = 10 + 6 + 10 + 6 = 32 cm.",
    skill: "Perimeter",
  },
  {
    question: "8² = ?",
    options: ["16", "32", "64", "128"],
    answer: 2,
    explanation: "8² means 8 × 8 = 64.",
    skill: "Squares",
  },
  {
    question: "What is the LCM of 4 and 6?",
    options: ["8", "10", "12", "24"],
    answer: 2,
    explanation: "The smallest number both 4 and 6 divide into is 12.",
    skill: "Factors",
  },
  {
    question: "1/3 of 90 = ?",
    options: ["20", "25", "30", "35"],
    answer: 2,
    explanation: "90 ÷ 3 = 30.",
    skill: "Fractions",
  },
  {
    question: "Convert 2.5 km to metres.",
    options: ["250 m", "2,500 m", "25,000 m", "250,000 m"],
    answer: 1,
    explanation: "1 km = 1,000 m, so 2.5 km = 2,500 m.",
    skill: "Conversion",
  },
  {
    question: "What is the mean of 5, 7, 9, and 11?",
    options: ["6", "7", "8", "9"],
    answer: 2,
    explanation: "5 + 7 + 9 + 11 = 32. 32 ÷ 4 = 8.",
    skill: "Mean",
  },
  {
    question: "50% of 180 = ?",
    options: ["60", "80", "90", "100"],
    answer: 2,
    explanation: "50% means half. Half of 180 is 90.",
    skill: "Percentages",
  },
  {
    question: "What is the next number? 2, 5, 11, 23, ___",
    options: ["35", "47", "49", "50"],
    answer: 1,
    explanation: "The pattern adds 3, then 6, then 12, so next add 24. 23 + 24 = 47.",
    skill: "Patterns",
  },
  {
    question: "2/5 = ?",
    options: ["20%", "25%", "40%", "50%"],
    answer: 2,
    explanation: "2 ÷ 5 = 0.4 = 40%.",
    skill: "Fractions to Percentages",
  },
  {
    question: "What is the volume of a cuboid measuring 5 cm × 4 cm × 3 cm?",
    options: ["60 cm³", "50 cm³", "40 cm³", "30 cm³"],
    answer: 0,
    explanation: "Volume = 5 × 4 × 3 = 60 cm³.",
    skill: "Volume",
  },
  {
    question: "What is the range of 5, 10, 15, and 25?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "Range = highest - lowest = 25 - 5 = 20.",
    skill: "Data",
  },
  {
    question: "25 × 4 ÷ 2 = ?",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "25 × 4 = 100. 100 ÷ 2 = 50.",
    skill: "Order of Operations",
  },
  {
    question: "Convert 3/5 to a decimal.",
    options: ["0.3", "0.5", "0.6", "0.8"],
    answer: 2,
    explanation: "3 ÷ 5 = 0.6.",
    skill: "Decimals",
  },
  {
    question: "15% of 400 = ?",
    options: ["40", "50", "60", "80"],
    answer: 2,
    explanation: "10% of 400 is 40 and 5% is 20. Total = 60.",
    skill: "Percentages",
  },
  {
    question: "3² + 4² = ?",
    options: ["12", "20", "25", "30"],
    answer: 2,
    explanation: "3² = 9 and 4² = 16. 9 + 16 = 25.",
    skill: "Squares",
  },
  {
    question: "0.25 × 80 = ?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "0.25 is one quarter. One quarter of 80 is 20.",
    skill: "Decimals",
  },
  {
    question: "4/5 of 200 = ?",
    options: ["120", "140", "160", "180"],
    answer: 2,
    explanation: "200 ÷ 5 = 40, and 40 × 4 = 160.",
    skill: "Fractions",
  },
  {
    question: "What is the mean of 2, 4, 6, 8, and 10?",
    options: ["4", "5", "6", "7"],
    answer: 2,
    explanation: "2 + 4 + 6 + 8 + 10 = 30. 30 ÷ 5 = 6.",
    skill: "Mean",
  },
  {
    question: "7 × 8 + 6 = ?",
    options: ["50", "56", "62", "64"],
    answer: 2,
    explanation: "7 × 8 = 56. 56 + 6 = 62.",
    skill: "Order of Operations",
  },
  {
    question: "9 × 9 - 18 = ?",
    options: ["63", "72", "81", "90"],
    answer: 0,
    explanation: "9 × 9 = 81. 81 - 18 = 63.",
    skill: "Order of Operations",
  },
  {
    question: "12 ÷ 0.5 = ?",
    options: ["6", "12", "24", "36"],
    answer: 2,
    explanation: "Dividing by 0.5 is the same as doubling. 12 × 2 = 24.",
    skill: "Decimals",
  },
  {
    question: "What is the cube of 3?",
    options: ["6", "9", "18", "27"],
    answer: 3,
    explanation: "3³ = 3 × 3 × 3 = 27.",
    skill: "Powers",
  },
  {
    question: "100 - (25 × 2) = ?",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "25 × 2 = 50. 100 - 50 = 50.",
    skill: "Order of Operations",
  },
]

export default function NumeracyDifficult1Page() {
  const { isPremium } = useAuth()

  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? questions
    : questions.slice(0, FREE_QUESTIONS_LIMIT)

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

    availableQuestions.forEach((question, index) => {
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
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Free Preview Mode
                      </p>
                      <p className="text-sm text-amber-700">
                        You can try {FREE_QUESTIONS_LIMIT} questions for free.
                        Upgrade to Premium to unlock all 40 questions.
                      </p>

                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

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
                    {availableQuestions.length}
                  </p>
                  <p className="text-sm text-slate-600">
                    Questions {!isPremium && "(Preview)"}
                  </p>
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
                  {score}/{availableQuestions.length}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>

              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">
                    You completed the free preview.
                  </p>
                  <p className="text-sm text-amber-700">
                    Upgrade to Premium to unlock all 40 questions in this
                    difficult Mathematics mock test.
                  </p>

                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                </div>
              )}

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
                {availableQuestions.map((question, index) => {
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
                Question progress: {answeredCount}/{availableQuestions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={(answeredCount / availableQuestions.length) * 100}
            className="h-2"
          />

          {!isPremium && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Free Preview: {FREE_QUESTIONS_LIMIT} of 40 questions
              </p>
              <p className="text-sm text-amber-700">
                Upgrade to Premium to access the full test.
              </p>
            </div>
          )}

          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">
                Multiple-Choice Questions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {availableQuestions.map((question, questionIndex) => (
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
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
  Lock,
  Crown,
} from "lucide-react"

const FREE_QUESTIONS_LIMIT = 5

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
  skill: string
}

// 🔴 KEEP YOUR SAME QUESTIONS ARRAY HERE (no change)
const questions: Question[] = [/* KEEP YOUR EXISTING 40 QUESTIONS */]

export default function NumeracyDifficult1Page() {
  const { isPremium } = useAuth()

  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? questions
    : questions.slice(0, FREE_QUESTIONS_LIMIT)

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
    availableQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) total++
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

  const answeredCount = answers.filter((a) => a !== undefined).length

  // ================= START SCREEN =================
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
                Multi-step reasoning and deeper problem solving.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <Lock className="text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Free Preview Mode
                      </p>
                      <p className="text-sm text-amber-700">
                        Try {FREE_QUESTIONS_LIMIT} questions free. Upgrade for all 40.
                      </p>

                      <Link href="/pricing">
                        <Button className="mt-3 bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {availableQuestions.length}
                  </p>
                  <p className="text-sm">Questions</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">60</p>
                  <p className="text-sm">Minutes</p>
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

  // ================= RESULTS =================
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl shadow-lg">
            <CardContent className="p-6 space-y-6 text-center">
              <h2 className="text-2xl font-bold">Test Completed</h2>

              <p className="text-4xl font-bold text-amber-600">
                {score}/{availableQuestions.length}
              </p>

              {!isPremium && (
                <div className="bg-amber-50 border p-4 rounded-lg">
                  <p className="text-amber-800">
                    Upgrade to unlock full test and improve your score.
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-2 bg-amber-500">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}

              <Button onClick={resetTest}>Try Again</Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  // ================= TEST =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="flex justify-between bg-slate-800 text-white p-4 rounded-lg">
            <p>{answeredCount}/{availableQuestions.length}</p>
            <p>{formatTime(timeLeft)}</p>
          </div>

          <Progress value={(answeredCount / availableQuestions.length) * 100} />

          {availableQuestions.map((q, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <p className="font-semibold">{i + 1}. {q.question}</p>

                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, j)}
                    className={`block w-full text-left p-3 border rounded ${
                      answers[i] === j ? "bg-amber-50 border-amber-400" : ""
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-500 py-6 text-lg"
          >
            Submit Test
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
