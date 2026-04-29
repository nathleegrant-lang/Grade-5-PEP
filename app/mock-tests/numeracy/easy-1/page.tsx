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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const FREE_QUESTIONS_LIMIT = 5

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
  skill: string
}

// ✅ KEEP YOUR SAME 40 QUESTIONS
const questions: Question[] = [
  // 👇 KEEP YOUR ORIGINAL QUESTIONS HERE (unchanged)
]

export default function NumeracyEasy1Page() {
  const { isPremium } = useAuth()

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

  // ================= START =================
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <Calculator className="mx-auto h-14 w-14 text-amber-600" />
              <CardTitle>Grade 5 Mathematics Easy 1</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              {!isPremium && (
                <div className="bg-amber-50 border p-4 rounded-lg">
                  <p>You can try {FREE_QUESTIONS_LIMIT} questions free.</p>
                  <Link href="/pricing">
                    <Button className="mt-2">Upgrade</Button>
                  </Link>
                </div>
              )}

              <Button
                onClick={() => setStarted(true)}
                className="w-full"
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
      <div className="min-h-screen bg-sky-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Card className="max-w-3xl mx-auto text-center">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Completed</h2>
              <p className="text-4xl">
                {score}/{availableQuestions.length}
              </p>

              <Button onClick={resetTest}>Retry</Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  // ================= TEST =================
  return (
    <div className="min-h-screen bg-sky-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">

        <div className="flex justify-between bg-slate-800 text-white p-4 rounded-lg">
          <span>
            {currentQuestion + 1}/{availableQuestions.length}
          </span>
          <span>{formatTime(timeLeft)}</span>
        </div>

        <Progress value={(answeredCount / availableQuestions.length) * 100} />

        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">

            <p className="font-semibold">{question.question}</p>

            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full p-3 border rounded ${
                  answers[currentQuestion] === i
                    ? "bg-amber-100"
                    : ""
                }`}
              >
                {opt}
              </button>
            ))}

          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ChevronLeft /> Prev
          </Button>

          {currentQuestion === availableQuestions.length - 1 ? (
            <Button onClick={handleSubmit}>Submit</Button>
          ) : (
            <Button onClick={handleNext}>
              Next <ChevronRight />
            </Button>
          )}
        </div>

        {/* Navigator */}
        <div className="grid grid-cols-10 gap-2 mt-6">
          {availableQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`p-2 text-sm ${
                currentQuestion === i ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  )
}
