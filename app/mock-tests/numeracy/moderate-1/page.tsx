"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { saveStudentTestResult } from "@/lib/student-test-results"
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock,
  Crown,
} from "lucide-react"

const FREE_QUESTIONS_LIMIT = 5

// ✅ KEEP YOUR EXISTING QUESTIONS (unchanged)
const questions = [/* KEEP YOUR CURRENT QUESTIONS */]

export default function Page() {
  const { isPremium, user } = useAuth()

  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [time, setTime] = useState(3600)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const hasSavedResult = useRef(false)

  const qList = isPremium ? questions : questions.slice(0, 5)
  const q = qList[current]

  useEffect(() => {
    if (!started || done) return
    const t = setInterval(() => {
      setTime((p) => {
        if (p <= 1) {
          clearInterval(t)
          void submit()
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [started, done])

  const select = (i: number) => {
    const copy = [...answers]
    copy[current] = i
    setAnswers(copy)
  }

  const calculateScore = () => {
    let s = 0
    qList.forEach((q, i) => {
      if (answers[i] === q.answer) s++
    })
    return s
  }

  const getScorePercentage = () => Math.round((calculateScore() / qList.length) * 100)

  const submit = async () => {
    const s = calculateScore()
    setScore(s)

    if (user?.id && !hasSavedResult.current) {
      hasSavedResult.current = true
      const completedAtIso = new Date().toISOString()
      try {
        await saveStudentTestResult({
          parentId: user.id,
          studentName: user?.childName ?? "Student",
          grade: "grade5",
          subject: "Numeracy",
          testName: "Moderate 1",
          difficulty: "Moderate",
          score: s,
          totalQuestions: qList.length,
          percentage: getScorePercentage(),
          completedAt: completedAtIso,
        })
      } catch {
        hasSavedResult.current = false
      }
    }

    setDone(true)
  }

  if (!started) {
    return (
      <div className="p-10 text-center">
        {!isPremium && (
          <div className="bg-yellow-100 p-4 mb-4">
            Free preview: 5 questions
          </div>
        )}
        <Button onClick={() => setStarted(true)}>Start Test</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="p-10 text-center">
        <h2>{score}/{qList.length}</h2>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex justify-between mb-4">
        <span>{current + 1}/{qList.length}</span>
        <span>{Math.floor(time / 60)}:{time % 60}</span>
      </div>

      <Progress value={(answers.length / qList.length) * 100} />

      <Card className="mt-6">
        <CardContent className="p-6">
          <p className="mb-4">{q.question}</p>

          {q.options.map((o: string, i: number) => (
            <button
              key={i}
              onClick={() => select(i)}
              className={`block w-full p-3 border mb-2 ${
                answers[current] === i ? "bg-yellow-100" : ""
              }`}
            >
              {o}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button onClick={() => setCurrent((p) => p - 1)} disabled={current === 0}>
          <ChevronLeft /> Prev
        </Button>

        {current === qList.length - 1 ? (
          <Button onClick={() => void submit()}>Submit</Button>
        ) : (
          <Button onClick={() => setCurrent((p) => p + 1)}>
            Next <ChevronRight />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-10 gap-2 mt-6">
        {qList.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={current === i ? "bg-black text-white" : "bg-gray-200"}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
