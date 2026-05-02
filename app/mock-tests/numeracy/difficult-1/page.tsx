"use client"

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

// 🔴 KEEP YOUR SAME 40 QUESTIONS ARRAY HERE (UNCHANGED)
const questions: Question[] = [
  // PASTE YOUR EXISTING QUESTIONS HERE
]

export default function NumeracyDifficult1Page() {
  const { isPremium, user } = useAuth()

  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
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
          handleSubmit()
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

  const handleSelect = (optionIndex: number) => {
    const updated = [...answers]
    updated[currentQuestion] = optionIndex
    setAnswers(updated)
  }

  const handleNext = () => {
    if (currentQuestion < availableQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let total = 0
    availableQuestions.forEach((q, i) => {
      if (answers[i] === q.answer) total++
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
    setCurrentQuestion(0)
    setShowResults(false)
    setScore(0)
  }

  const answeredCount = answers.filter((a) => a !== undefined).length
  const question = availableQuestions[currentQuestion]
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
                One question at a time · Multi-step reasoning practice
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 text-amber-600" />
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
                    Upgrade to Premium to unlock all 40 questions.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {availableQuestions.map((q, index) => {
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
                            Question {index + 1} · {q.skill}
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
                          <p className="mt-1 text-sm text-slate-700">
                            Explanation: {q.explanation}
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

                <Button onClick={resetTest} variant="outline" className="flex-1">
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

      <header className="sticky top-0 z-10 bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Grade 5 Mathematics Difficult 1</h1>
              <p className="text-xs text-sky-100">
                Question {currentQuestion + 1} of {availableQuestions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
              Progress: {answeredCount}/{availableQuestions.length} answered
            </span>
            <span>
              {Math.round((answeredCount / availableQuestions.length) * 100)}%
              complete
            </span>
          </div>
          <Progress
            value={(answeredCount / availableQuestions.length) * 100}
            className="h-2"
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <Card className="mb-6">
            <CardHeader className="bg-amber-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium uppercase text-amber-700">
                  {question.skill}
                </span>
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <p className="mb-6 text-lg font-medium text-gray-800">
                {question.question}
              </p>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      answers[currentQuestion] === index
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                    }`}
                  >
                    <span className="mr-3 font-medium text-amber-700">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestion === availableQuestions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-slate-700 hover:bg-slate-800"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-slate-700 hover:bg-slate-800"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <Card className="mt-6">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? "bg-slate-700 text-white"
                        : answers[index] !== undefined
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-slate-700"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-blue-100"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-gray-100"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
