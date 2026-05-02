"use client"

import { useState, useEffect, useCallback } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle,
  Calculator, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "number" | "measurement" | "geometry" | "statistics"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5MathMixed1Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Addition",
    question: `4,236 + 1,452 = ?`,
    options: [
      "5,588",
      "5,688",
      "5,788",
      "6,688",
    ],
    correctAnswer: 1,
    explanation: `4,236 + 1,452 = 5,688.`
  },
  {
    id: 2,
    type: "measurement",
    skill: "Division & Time",
    question: `180 ÷ 6 = ?`,
    options: [
      "20",
      "25",
      "30",
      "36",
    ],
    correctAnswer: 2,
    explanation: `180 ÷ 6 = 30.`
  },
  {
    id: 3,
    type: "number",
    skill: "Fractions",
    question: `Which fraction is equivalent to 1/2?`,
    options: [
      "2/3",
      "2/4",
      "3/5",
      "4/6",
    ],
    correctAnswer: 1,
    explanation: `2/4 simplifies to 1/2 because both numerator and denominator divide by 2.`
  },
  {
    id: 4,
    type: "number",
    skill: "Percentages",
    question: `25% of 80 = ?`,
    options: [
      "10",
      "15",
      "20",
      "25",
    ],
    correctAnswer: 2,
    explanation: `25% means one quarter. 80 ÷ 4 = 20.`
  },
  {
    id: 5,
    type: "measurement",
    skill: "Perimeter",
    question: `A rectangle is 8 cm long and 5 cm wide. What is its perimeter?`,
    options: [
      "13 cm",
      "26 cm",
      "40 cm",
      "80 cm",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 8 + 5 + 8 + 5 = 26 cm.`
  },
  {
    id: 6,
    type: "number",
    skill: "Multiplication",
    question: `A school bought 48 packs of pencils. Each pack has 12 pencils. How many pencils were bought?`,
    options: [
      "480",
      "516",
      "576",
      "608",
    ],
    correctAnswer: 2,
    explanation: `48 × 12 = 576 pencils.`
  },
  {
    id: 7,
    type: "geometry",
    skill: "Angles",
    question: `Which angle is greater than 90° but less than 180°?`,
    options: [
      "Acute",
      "Right",
      "Obtuse",
      "Straight",
    ],
    correctAnswer: 2,
    explanation: `An obtuse angle is greater than 90° and less than 180°.`
  },
  {
    id: 8,
    type: "statistics",
    skill: "Mean",
    question: `The mean of 6, 8, 10, and 12 is:`,
    options: [
      "8",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 1,
    explanation: `6 + 8 + 10 + 12 = 36. 36 ÷ 4 = 9.`
  },
  {
    id: 9,
    type: "number",
    skill: "Patterns",
    question: `The pattern is 4, 9, 14, 19, ___. What comes next?`,
    options: [
      "22",
      "23",
      "24",
      "25",
    ],
    correctAnswer: 2,
    explanation: `The pattern increases by 5 each time. 19 + 5 = 24.`
  },
  {
    id: 10,
    type: "statistics",
    skill: "Data Handling",
    question: `A class collected 24 bottles on Monday, 36 on Tuesday, and 40 on Wednesday. How many altogether?`,
    options: [
      "90",
      "96",
      "100",
      "106",
    ],
    correctAnswer: 2,
    explanation: `24 + 36 + 40 = 100.`
  },
  {
    id: 11,
    type: "number",
    skill: "Percentages",
    question: `A student scored 36 out of 40. What percentage is this?`,
    options: [
      "80%",
      "85%",
      "90%",
      "95%",
    ],
    correctAnswer: 2,
    explanation: `36 ÷ 40 = 0.9 = 90%.`
  },
  {
    id: 12,
    type: "measurement",
    skill: "Area",
    question: `A rectangular garden is 15 m long and 8 m wide. What is its area?`,
    options: [
      "23 m²",
      "46 m²",
      "120 m²",
      "150 m²",
    ],
    correctAnswer: 2,
    explanation: `Area = length × width = 15 × 8 = 120 m².`
  },
  {
    id: 13,
    type: "number",
    skill: "Comparing Fractions",
    question: `3/4 is greater than which fraction?`,
    options: [
      "7/8",
      "5/8",
      "9/10",
      "4/4",
    ],
    correctAnswer: 1,
    explanation: `3/4 = 6/8, which is greater than 5/8 but less than 7/8.`
  },
  {
    id: 14,
    type: "measurement",
    skill: "Time",
    question: `A movie started at 3:45 PM and ended at 5:20 PM. How long did it last?`,
    options: [
      "1h 25min",
      "1h 35min",
      "1h 45min",
      "2h 25min",
    ],
    correctAnswer: 1,
    explanation: `3:45 to 4:45 = 1 hour. 4:45 to 5:20 = 35 minutes. Total = 1h 35min.`
  },
  {
    id: 15,
    type: "measurement",
    skill: "Money",
    question: `A shopkeeper had $5,000. She spent $1,275 and $850. How much was left?`,
    options: [
      "$2,875",
      "$3,125",
      "$3,275",
      "$3,725",
    ],
    correctAnswer: 0,
    explanation: `$1,275 + $850 = $2,125. $5,000 - $2,125 = $2,875.`
  },
  {
    id: 16,
    type: "geometry",
    skill: "Angles",
    question: `A triangle has angles 45° and 65°. What is the third angle?`,
    options: [
      "60°",
      "70°",
      "80°",
      "90°",
    ],
    correctAnswer: 1,
    explanation: `45 + 65 = 110. 180 - 110 = 70°.`
  },
  {
    id: 17,
    type: "number",
    skill: "Percentages & Money",
    question: `10% discount on $2,500 gives what sale price?`,
    options: [
      "$2,000",
      "$2,250",
      "$2,400",
      "$2,490",
    ],
    correctAnswer: 1,
    explanation: `10% of $2,500 = $250. $2,500 - $250 = $2,250.`
  },
  {
    id: 18,
    type: "number",
    skill: "Fractions",
    question: `3/4 + 2/3 = ?`,
    options: [
      "1 1/12",
      "1 5/12",
      "1 7/12",
      "2",
    ],
    correctAnswer: 1,
    explanation: `3/4 = 9/12 and 2/3 = 8/12. Total = 17/12 = 1 5/12.`
  },
  {
    id: 19,
    type: "statistics",
    skill: "Mean",
    question: `The mean of five numbers is 18. Four numbers are 12, 16, 20, and 22. What is the fifth?`,
    options: [
      "18",
      "20",
      "22",
      "24",
    ],
    correctAnswer: 1,
    explanation: `18 × 5 = 90. Known total = 12+16+20+22 = 70. Fifth = 90 - 70 = 20.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Time",
    question: `A bus left at 7:35 AM and arrived at 10:10 AM. How long was the trip?`,
    options: [
      "2h 25min",
      "2h 35min",
      "2h 45min",
      "3h 35min",
    ],
    correctAnswer: 1,
    explanation: `7:35 to 9:35 = 2 hours. 9:35 to 10:10 = 35 minutes. Total = 2h 35min.`
  },
  {
    id: 21,
    type: "number",
    skill: "Patterns",
    question: `The pattern is 3, 6, 12, 24, ___.`,
    options: [
      "30",
      "36",
      "42",
      "48",
    ],
    correctAnswer: 3,
    explanation: `Each term is multiplied by 2. 24 × 2 = 48.`
  },
  {
    id: 22,
    type: "number",
    skill: "Ratio & Proportion",
    question: `2.5 litres of juice serves 10 students. How many litres are needed for 30 students?`,
    options: [
      "5 L",
      "6.5 L",
      "7.5 L",
      "10 L",
    ],
    correctAnswer: 2,
    explanation: `30 is 3 times 10, so 2.5 × 3 = 7.5 L.`
  },
  {
    id: 23,
    type: "number",
    skill: "Decimals & Fractions",
    question: `0.75 is equal to which fraction?`,
    options: [
      "1/2",
      "2/3",
      "3/4",
      "4/5",
    ],
    correctAnswer: 2,
    explanation: `0.75 = 75/100 = 3/4.`
  },
  {
    id: 24,
    type: "statistics",
    skill: "Data",
    question: `The range of 5, 10, 15, and 25 is:`,
    options: [
      "10",
      "15",
      "20",
      "25",
    ],
    correctAnswer: 2,
    explanation: `Range = highest - lowest = 25 - 5 = 20.`
  },
  {
    id: 25,
    type: "number",
    skill: "Percentages",
    question: `20% of 150 = ?`,
    options: [
      "20",
      "25",
      "30",
      "35",
    ],
    correctAnswer: 2,
    explanation: `10% of 150 = 15, so 20% = 30.`
  },
  {
    id: 26,
    type: "number",
    skill: "Factors & Multiples",
    question: `LCM of 3 and 4 is:`,
    options: [
      "6",
      "9",
      "12",
      "15",
    ],
    correctAnswer: 2,
    explanation: `The smallest number both 3 and 4 divide into evenly is 12.`
  },
  {
    id: 27,
    type: "measurement",
    skill: "Perimeter",
    question: `A field is 36 m long and 24 m wide. How much fencing is needed around it?`,
    options: [
      "60 m",
      "120 m",
      "864 m",
      "1,728 m",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 36 + 24 + 36 + 24 = 120 m.`
  },
  {
    id: 28,
    type: "number",
    skill: "Percentages",
    question: `42 out of 50 as a percentage is:`,
    options: [
      "80%",
      "82%",
      "84%",
      "86%",
    ],
    correctAnswer: 2,
    explanation: `42 ÷ 50 = 0.84 = 84%.`
  },
  {
    id: 29,
    type: "number",
    skill: "Fractions",
    question: `4/5 of 200 = ?`,
    options: [
      "120",
      "140",
      "160",
      "180",
    ],
    correctAnswer: 2,
    explanation: `200 × 4 ÷ 5 = 800 ÷ 5 = 160.`
  },
  {
    id: 30,
    type: "number",
    skill: "Decimals",
    question: `12 ÷ 0.5 = ?`,
    options: [
      "6",
      "12",
      "24",
      "36",
    ],
    correctAnswer: 2,
    explanation: `Dividing by 0.5 is the same as multiplying by 2. 12 × 2 = 24.`
  },
  {
    id: 31,
    type: "number",
    skill: "Order of Operations",
    question: `100 - (25 × 2) = ?`,
    options: [
      "25",
      "50",
      "75",
      "100",
    ],
    correctAnswer: 1,
    explanation: `Brackets first: 25 × 2 = 50. Then 100 - 50 = 50.`
  },
  {
    id: 32,
    type: "number",
    skill: "Ratio & Proportion",
    question: `A recipe uses 4 cups of flour for 8 cakes. How many cups for 24 cakes?`,
    options: [
      "8",
      "10",
      "12",
      "16",
    ],
    correctAnswer: 2,
    explanation: `24 ÷ 8 = 3. So 4 × 3 = 12 cups.`
  },
  {
    id: 33,
    type: "measurement",
    skill: "Volume",
    question: `A cube has side length 3 cm. What is its volume?`,
    options: [
      "9 cm³",
      "18 cm³",
      "27 cm³",
      "36 cm³",
    ],
    correctAnswer: 2,
    explanation: `Volume = 3 × 3 × 3 = 27 cm³.`
  },
  {
    id: 34,
    type: "number",
    skill: "Square Numbers",
    question: `Which number is a perfect square?`,
    options: [
      "18",
      "24",
      "36",
      "50",
    ],
    correctAnswer: 2,
    explanation: `36 = 6 × 6. It is a perfect square.`
  },
  {
    id: 35,
    type: "number",
    skill: "Percentages",
    question: `15% of 400 = ?`,
    options: [
      "40",
      "50",
      "60",
      "80",
    ],
    correctAnswer: 2,
    explanation: `10% of 400 = 40 and 5% = 20. Total = 60.`
  },
  {
    id: 36,
    type: "number",
    skill: "Multiplication",
    question: `A student read 18 pages each day for 7 days. How many pages altogether?`,
    options: [
      "116",
      "124",
      "126",
      "136",
    ],
    correctAnswer: 2,
    explanation: `18 × 7 = 126 pages.`
  },
  {
    id: 37,
    type: "number",
    skill: "Squares",
    question: `3² + 4² = ?`,
    options: [
      "12",
      "20",
      "25",
      "30",
    ],
    correctAnswer: 2,
    explanation: `3² = 9 and 4² = 16. 9 + 16 = 25.`
  },
  {
    id: 38,
    type: "measurement",
    skill: "Money & Discount",
    question: `A bag costs $3,600 after a 10% discount. The original price was $4,000. What was the discount amount?`,
    options: [
      "$200",
      "$300",
      "$400",
      "$600",
    ],
    correctAnswer: 2,
    explanation: `$4,000 - $3,600 = $400 discount.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Mean",
    question: `Mean of 10, 20, 30, and 40 is:`,
    options: [
      "20",
      "25",
      "30",
      "35",
    ],
    correctAnswer: 1,
    explanation: `10 + 20 + 30 + 40 = 100. 100 ÷ 4 = 25.`
  },
  {
    id: 40,
    type: "number",
    skill: "Fractions",
    question: `A class has 32 students. 3/8 are boys. How many boys?`,
    options: [
      "8",
      "10",
      "12",
      "16",
    ],
    correctAnswer: 2,
    explanation: `32 ÷ 8 = 4. 4 × 3 = 12 boys.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed1Questions
    : g5MathMixed1Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) {
      setAnswers(new Array(totalQuestions).fill(null))
    }
  }, [totalQuestions, answers.length])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (!started || showResults) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setShowResults(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, showResults])

  const handleAnswer = (index: number) => {
    const a = [...answers]; a[currentQuestion] = index; setAnswers(a)
  }

  const calculateScore = () => {
    let c = 0
    answers.forEach((a, i) => { if (i < totalQuestions && a === availableQuestions[i].correctAnswer) c++ })
    return c
  }

  const getScorePercentage = () => Math.round((calculateScore() / totalQuestions) * 100)

  const getGrade = () => {
    const p = getScorePercentage()
    if (p >= 85) return { grade: "Excellent", color: "text-green-600" }
    if (p >= 70) return { grade: "Good",      color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",      color: "text-amber-600" }
    return { grade: "Needs Improvement", color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => {
      const i = availableQuestions.findIndex((x) => x.id === q.id)
      return answers[i] === q.correctAnswer
    }).length
    const total = sq.length
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Fair" : "Needs Improvement"
    const color  = pct >= 85 ? "text-green-600" : pct >= 70 ? "text-blue-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage: pct, rating, ratingColor: color }
  }

  const handleSubmit = () => { setScore(calculateScore()); setShowResults(true) }

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60); setScore(0)
  }

  const question = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const sectionLabel = (t: Question["type"]) =>
    t === "number" ? "Number Operations" : t === "measurement" ? "Measurement"
    : t === "geometry" ? "Geometry & Spatial Sense" : "Data & Probability"

  /* ── INTRO SCREEN ─────────────────────────────────────────── */
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/mathematics">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Mathematics Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 text-center">
              <Calculator className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 1</CardTitle>
              <p className="text-slate-600">Mixed exam-style practice across easy, moderate, and challenging skills.</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">Free Preview Mode</p>
                      <p className="text-sm text-amber-700">
                        You can try {FREE_QUESTION_LIMIT} questions for free. Upgrade to unlock all 40 questions.
                      </p>
                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
                <p className="text-slate-700">
                  This mixed Grade 5 Mathematics practice includes number operations, fractions,
                  percentages, measurement, geometry, data handling, time, patterns, and problem solving.
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Skills Practised</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: choosing suitable strategies</li>
                  <li>Communication: interpreting word problems accurately</li>
                  <li>Creativity: noticing patterns and relationships</li>
                  <li>Problem Solving: applying Mathematics in real situations</li>
                </ul>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="mb-2 font-semibold text-purple-800">Mixed-Level Practice</h3>
                <p className="text-sm text-slate-700">
                  This set blends direct recall, multi-step reasoning, and more challenging problem-solving items — one question at a time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-slate-700">{totalQuestions}</p>
                  <p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-slate-700">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>
              <Button onClick={() => setStarted(true)} className="w-full bg-slate-700 py-6 text-lg hover:bg-slate-800">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── RESULTS SCREEN ───────────────────────────────────────── */
  if (showResults) {
    const sc = calculateScore(); const pct = getScorePercentage(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <CardTitle className="text-2xl text-slate-800">Mathematics Test Completed</CardTitle>
              <p className="text-slate-600">Mathematics Mixed 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-slate-700">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-slate-700">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">You completed the free preview.</p>
                  <p className="text-sm text-amber-700">Upgrade to Premium to unlock all 40 questions.</p>
                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button>
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-800">{s.label}</p>
                    <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span>
                      <span className={cn("text-sm font-semibold", st.ratingColor)}>{st.rating}</span>
                    </div>
                    <Progress value={st.percentage} className="h-2 mt-2" />
                    <p className="text-xs text-slate-500 mt-1">{st.percentage}%</p>
                  </div>
                )})}
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">This mixed test checks a wide range of Grade 5 Mathematics skills. Review each explanation below to identify your strongest areas and the topics that need more practice.</p>
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-semibold text-slate-800">Question {i + 1} · <span className="text-sky-700">{q.skill}</span></p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct answer: {q.options[q.correctAnswer]}</p>
                          <p className="mt-1 text-sm text-slate-700">Explanation: {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-slate-700 hover:bg-slate-800"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/mathematics" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Mathematics Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── TEST SCREEN ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      {/* Sticky header */}
      <header className="bg-slate-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/mock-tests/mathematics" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Exit Test">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Calculator className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-bold">Mathematics Mixed 1</h1>
                <p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-green-600")}>
              <Clock className="h-5 w-5" />{formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {answeredCount}/{totalQuestions} answered</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">

          {/* Free preview banner */}
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p>
              <p className="text-sm text-amber-700">Upgrade to Premium to access the full test.</p>
            </div>
          )}

          {/* Question card */}
          <Card className="mb-6 border-slate-200">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-sky-700 uppercase tracking-wide">{question.skill}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">{sectionLabel(question.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-lg font-medium text-slate-800 mb-6">{question.question}</p>
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx
                        ? "border-slate-700 bg-slate-50"
                        : "border-gray-200 hover:border-slate-400 hover:bg-slate-50/50"
                    )}
                  >
                    <span className="font-medium text-slate-700 mr-3">{String.fromCharCode(65 + idx)}.</span>{option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Previous / Next / Submit */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />Previous
            </Button>
            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={handleSubmit} className="bg-slate-700 hover:bg-slate-800">
                <Flag className="h-4 w-4 mr-2" />Submit Test
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-slate-700 hover:bg-slate-800">
                Next<ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Question navigator */}
          <Card className="border-slate-200">
            <CardHeader className="py-3"><CardTitle className="text-sm text-slate-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={cn(
                      "w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx
                        ? "bg-slate-700 text-white"
                        : answers[idx] !== null
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-700" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-100" /><span>Answered</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /><span>Unanswered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
