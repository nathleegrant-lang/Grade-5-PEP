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

const g5MathMixed5Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Number Sense",
    question: `Which is the largest: 0.75, 3/5, 70%, 7/10?`,
    options: [
      "0.75",
      "3/5",
      "70%",
      "7/10",
    ],
    correctAnswer: 0,
    explanation: `0.75=75%, 3/5=60%, 70%=70%, 7/10=70%. Largest = 0.75.`
  },
  {
    id: 2,
    type: "number",
    skill: "Operations",
    question: `999 × 11 = ?`,
    options: [
      "9,989",
      "10,878",
      "10,989",
      "10,999",
    ],
    correctAnswer: 2,
    explanation: `999×11=(1000-1)×11=11000-11=10,989.`
  },
  {
    id: 3,
    type: "number",
    skill: "Long Division",
    question: `8,856 ÷ 24 = ?`,
    options: [
      "359",
      "369",
      "379",
      "389",
    ],
    correctAnswer: 1,
    explanation: `8,856÷24=369. Check: 369×24=8,856.`
  },
  {
    id: 4,
    type: "number",
    skill: "Mixed Numbers",
    question: `3⅕ × 2½ = ?`,
    options: [
      "7",
      "7½",
      "8",
      "8½",
    ],
    correctAnswer: 2,
    explanation: `3⅕=16/5, 2½=5/2. Product=80/10=8.`
  },
  {
    id: 5,
    type: "number",
    skill: "Percentages",
    question: `Cost price $250, selling price $300. Profit %:`,
    options: [
      "15%",
      "20%",
      "22%",
      "25%",
    ],
    correctAnswer: 1,
    explanation: `Profit=$50. %=50/250×100=20%.`
  },
  {
    id: 6,
    type: "number",
    skill: "Proportion",
    question: `If 8 workers build a wall in 15 days, 12 workers take how many days?`,
    options: [
      "8",
      "10",
      "12",
      "20",
    ],
    correctAnswer: 1,
    explanation: `Person-days=120. 120÷12=10 days.`
  },
  {
    id: 7,
    type: "number",
    skill: "Ratio",
    question: `Gold:Silver = 5:3. Total 240 g. Mass of gold:`,
    options: [
      "90g",
      "100g",
      "120g",
      "150g",
    ],
    correctAnswer: 3,
    explanation: `Parts=8. Each=30g. Gold=5×30=150g.`
  },
  {
    id: 8,
    type: "number",
    skill: "Powers & Roots",
    question: `√225 + 4² = ?`,
    options: [
      "29",
      "31",
      "33",
      "41",
    ],
    correctAnswer: 1,
    explanation: `√225=15. 4²=16. 15+16=31.`
  },
  {
    id: 9,
    type: "number",
    skill: "Sequences",
    question: `nth term formula 2n+3. Value when n=7:`,
    options: [
      "14",
      "17",
      "18",
      "20",
    ],
    correctAnswer: 1,
    explanation: `2(7)+3=14+3=17.`
  },
  {
    id: 10,
    type: "number",
    skill: "Problem Solving",
    question: `A pool is 40m×25m×2m. Volume in kL:`,
    options: [
      "200 kL",
      "1,000 kL",
      "2,000 kL",
      "4,000 kL",
    ],
    correctAnswer: 2,
    explanation: `V=40×25×2=2,000 m³=2,000 kL.`
  },
  {
    id: 11,
    type: "number",
    skill: "Fractions to Decimals",
    question: `Write 5/8 as a decimal.`,
    options: [
      "0.58",
      "0.625",
      "0.65",
      "0.75",
    ],
    correctAnswer: 1,
    explanation: `5÷8=0.625.`
  },
  {
    id: 12,
    type: "number",
    skill: "Interest",
    question: `$1,200 at 8% per annum for 2 years. Simple interest=`,
    options: [
      "$192",
      "$180",
      "$170",
      "$160",
    ],
    correctAnswer: 0,
    explanation: `I=1200×0.08×2=$192.`
  },
  {
    id: 13,
    type: "number",
    skill: "Prime Factorisation",
    question: `Prime factors of 60:`,
    options: [
      "2²×3×5",
      "2×3×5²",
      "2³×3×5",
      "2×3²×5",
    ],
    correctAnswer: 0,
    explanation: `60=2²×3×5.`
  },
  {
    id: 14,
    type: "number",
    skill: "HCF",
    question: `HCF of 72 and 96:`,
    options: [
      "12",
      "16",
      "18",
      "24",
    ],
    correctAnswer: 3,
    explanation: `Both divide by 24. 72÷24=3, 96÷24=4. HCF=24.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `Shirt discounted 25% to $120. Original price:`,
    options: [
      "$150",
      "$160",
      "$170",
      "$180",
    ],
    correctAnswer: 1,
    explanation: `75%=$120. 100%=$120÷0.75=$160.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Area",
    question: `Area of an equilateral triangle with side 8 cm (A=s²√3/4, √3≈1.73):`,
    options: [
      "27.68 cm²",
      "28.00 cm²",
      "55.36 cm²",
      "64 cm²",
    ],
    correctAnswer: 0,
    explanation: `A=(64×1.73)/4=110.72/4=27.68 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume",
    question: `A cone with base radius 6 cm and height 14 cm. Volume (π=22/7):`,
    options: [
      "264 cm³",
      "528 cm³",
      "792 cm³",
      "1,056 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=⅓πr²h=⅓×(22/7)×36×14=⅓×1584=528 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed",
    question: `Light travels at 300,000 km/s. Distance in 3 seconds:`,
    options: [
      "300,000 km",
      "600,000 km",
      "900,000 km",
      "1,200,000 km",
    ],
    correctAnswer: 2,
    explanation: `300,000×3=900,000 km.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Compound Measure",
    question: `Pressure = Force÷Area. Force=200N, Area=50cm². Pressure=`,
    options: [
      "2 N/cm²",
      "4 N/cm²",
      "8 N/cm²",
      "10 N/cm²",
    ],
    correctAnswer: 1,
    explanation: `200÷50=4 N/cm².`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Exchange Rate",
    question: `$1 USD = $155 JMD. Convert $40 USD to JMD:`,
    options: [
      "$5,850",
      "$6,200",
      "$6,400",
      "$6,750",
    ],
    correctAnswer: 1,
    explanation: `40×155=$6,200 JMD.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Circle Area",
    question: `Area of ring: outer radius 10cm, inner radius 6cm (π=3.14):`,
    options: [
      "200.96 cm²",
      "113.04 cm²",
      "314 cm²",
      "502.4 cm²",
    ],
    correctAnswer: 0,
    explanation: `π(10²-6²)=3.14(100-36)=3.14×64=200.96 cm².`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Time Calculation",
    question: `Event starts 14:45, lasts 3h 50min. End time:`,
    options: [
      "18:25",
      "18:35",
      "19:25",
      "19:35",
    ],
    correctAnswer: 1,
    explanation: `14:45+3h=17:45. 17:45+50min=18:35.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Conversion",
    question: `1 inch = 2.54 cm. Length of 12 inches in cm:`,
    options: [
      "24.50 cm",
      "25.40 cm",
      "28.48 cm",
      "30.48 cm",
    ],
    correctAnswer: 3,
    explanation: `12×2.54=30.48 cm.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Problem Solving",
    question: `Petrol costs $200/L. Car gets 15 km/L. Cost of 180 km trip:`,
    options: [
      "$2,000",
      "$2,400",
      "$2,500",
      "$3,000",
    ],
    correctAnswer: 1,
    explanation: `Litres=180÷15=12L. Cost=12×$200=$2,400.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Perimeter",
    question: `Semi-circle of diameter 20 cm. Perimeter (π=3.14):`,
    options: [
      "51.4 cm",
      "62.8 cm",
      "71.4 cm",
      "82.8 cm",
    ],
    correctAnswer: 0,
    explanation: `Half circumference=π×10=31.4. Diameter=20. Total=51.4 cm.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angle Types",
    question: `Angle between clock hands at 3:00:`,
    options: [
      "45°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Each hour mark = 30°. 3 hour marks = 90°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "3D Nets",
    question: `A cone's net consists of:`,
    options: [
      "A circle and a rectangle",
      "A circle and a sector",
      "Two circles only",
      "Two triangles",
    ],
    correctAnswer: 1,
    explanation: `A cone's net = a circular base + a sector (curved surface).`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Transformations",
    question: `Shape rotated 180° about origin. Point (4,-3) becomes:`,
    options: [
      "(-4,3)",
      "-4,-3)",
      "(4,3)",
      "(-3,4)",
    ],
    correctAnswer: 0,
    explanation: `180° rotation: (x,y)→(-x,-y). (4,-3)→(-4,3).`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Trigonometry Concept",
    question: `In a right triangle, sin(angle) = ?`,
    options: [
      "Adjacent÷Hypotenuse",
      "Opposite÷Adjacent",
      "Opposite÷Hypotenuse",
      "Hypotenuse÷Opposite",
    ],
    correctAnswer: 2,
    explanation: `sin = Opposite ÷ Hypotenuse (SOH).`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Circle Theorems",
    question: `Angle in a semicircle is always:`,
    options: [
      "45°",
      "60°",
      "90°",
      "180°",
    ],
    correctAnswer: 2,
    explanation: `Angle in a semicircle = 90° (Thales' theorem).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Construction",
    question: `The perpendicular from a point to a line meets the line at:`,
    options: [
      "Any point",
      "The midpoint",
      "A right angle",
      "The endpoint",
    ],
    correctAnswer: 2,
    explanation: `By definition, a perpendicular meets the line at a right angle (90°).`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Coordinates",
    question: `Gradient of line through (1,2) and (5,10):`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `Gradient=(10-2)÷(5-1)=8÷4=2.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Angles in Circles",
    question: `Central angle is twice the inscribed angle on the same arc. Inscribed angle = 35°. Central angle =`,
    options: [
      "35°",
      "45°",
      "60°",
      "70°",
    ],
    correctAnswer: 3,
    explanation: `Central = 2×35 = 70°.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Histogram",
    question: `Histogram bars (class width 5): 5-10(f=4), 10-15(f=7), 15-20(f=9), 20-25(f=5). Total frequency=`,
    options: [
      "20",
      "22",
      "25",
      "30",
    ],
    correctAnswer: 2,
    explanation: `4+7+9+5=25.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Mean from Frequency",
    question: `Score(f): 5(3),6(4),7(5),8(4),9(4). Mean=`,
    options: [
      "6.8",
      "7.0",
      "7.1",
      "7.2",
    ],
    correctAnswer: 1,
    explanation: `(15+24+35+32+36)÷20=142÷20=7.1. Closest: 7.0. Exact=7.1.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability",
    question: `Cards 1-10. P(prime or even)=`,
    options: [
      "4/10",
      "6/10",
      "7/10",
      "8/10",
    ],
    correctAnswer: 2,
    explanation: `Primes:2,3,5,7(4). Evens:2,4,6,8,10(5). Union=2,3,4,5,6,7,8,10=8 cards. P=8/10.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Normal Distribution Concept",
    question: `Most values in a normal distribution cluster around:`,
    options: [
      "The minimum",
      "The maximum",
      "The mean",
      "The range",
    ],
    correctAnswer: 2,
    explanation: `In a normal distribution, data clusters symmetrically around the mean.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Scatter Graph",
    question: `Scatter graph shows height vs shoe size with an upward trend. This suggests:`,
    options: [
      "No relationship",
      "Negative correlation",
      "Positive correlation",
      "Random distribution",
    ],
    correctAnswer: 2,
    explanation: `An upward trend indicates positive correlation.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Box Plot",
    question: `Box plot: min=5, Q1=10, median=15, Q3=22, max=30. IQR=`,
    options: [
      "10",
      "12",
      "15",
      "25",
    ],
    correctAnswer: 1,
    explanation: `IQR=Q3-Q1=22-10=12.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability",
    question: `P(A)=0.4, P(B)=0.3, A and B mutually exclusive. P(A or B)=`,
    options: [
      "0.12",
      "0.58",
      "0.70",
      "1.0",
    ],
    correctAnswer: 2,
    explanation: `P(A∪B)=P(A)+P(B)=0.4+0.3=0.7.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed5Questions
    : g5MathMixed5Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 5</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 5</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 5</h1>
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
