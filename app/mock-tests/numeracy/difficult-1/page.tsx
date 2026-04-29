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
