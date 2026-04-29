"use client"

import { useState, useEffect, useCallback } from "react"
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

const g5MathMixed7Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Operations",
    question: `3,456 - 1,789 + 2,345 = ?`,
    options: [
      "3,912",
      "4,002",
      "4,012",
      "4,112",
    ],
    correctAnswer: 2,
    explanation: `3,456-1,789=1,667. 1,667+2,345=4,012.`
  },
  {
    id: 2,
    type: "number",
    skill: "Fractions",
    question: `7/8 - 5/12 = ?`,
    options: [
      "2/24",
      "11/24",
      "13/24",
      "19/24",
    ],
    correctAnswer: 1,
    explanation: `LCD=24: 7/8=21/24, 5/12=10/24. 21/24-10/24=11/24.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentages",
    question: `Decrease 250 by 16%:`,
    options: [
      "200",
      "205",
      "210",
      "215",
    ],
    correctAnswer: 2,
    explanation: `16%×250=40. 250-40=210.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `6 pens cost $42. Cost of 10 pens:`,
    options: [
      "$60",
      "$65",
      "$70",
      "$75",
    ],
    correctAnswer: 2,
    explanation: `$42÷6=$7 each. 10×$7=$70.`
  },
  {
    id: 5,
    type: "number",
    skill: "Integers",
    question: `-15 × (-4) = ?`,
    options: [
      "60",
      "55",
      "50",
      "45",
    ],
    correctAnswer: 0,
    explanation: `Negative × negative = positive. 15×4=60.`
  },
  {
    id: 6,
    type: "number",
    skill: "Fractions",
    question: `Which is equivalent to 4/6?`,
    options: [
      "2/4",
      "6/9",
      "8/10",
      "3/4",
    ],
    correctAnswer: 1,
    explanation: `6/9: divide by 3 = 2/3 = 4/6. Yes, 6/9=4/6.`
  },
  {
    id: 7,
    type: "number",
    skill: "Powers",
    question: `√(49 × 4) = ?`,
    options: [
      "7",
      "10",
      "14",
      "28",
    ],
    correctAnswer: 2,
    explanation: `49×4=196. √196=14.`
  },
  {
    id: 8,
    type: "number",
    skill: "Problem Solving",
    question: `A train travels 480 km in 4 hours. Speed in m/s:`,
    options: [
      "33.3 m/s",
      "24 m/s",
      "30 m/s",
      "36 m/s",
    ],
    correctAnswer: 0,
    explanation: `480÷4=120 km/h. ÷3.6=33.3 m/s.`
  },
  {
    id: 9,
    type: "number",
    skill: "Percentages",
    question: `Mark-up of 40% on cost of $75. Selling price:`,
    options: [
      "$100",
      "$105",
      "$110",
      "$115",
    ],
    correctAnswer: 1,
    explanation: `40%×75=$30. SP=$75+$30=$105.`
  },
  {
    id: 10,
    type: "number",
    skill: "Number Theory",
    question: `Sum of first 10 natural numbers:`,
    options: [
      "45",
      "50",
      "55",
      "60",
    ],
    correctAnswer: 2,
    explanation: `n(n+1)/2=10×11/2=55.`
  },
  {
    id: 11,
    type: "number",
    skill: "Algebra",
    question: `If 3x+5=20, x = ?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `3x=15. x=5.`
  },
  {
    id: 12,
    type: "number",
    skill: "Sequences",
    question: `Arithmetic sequence: a=4, d=7. 6th term =`,
    options: [
      "38",
      "39",
      "39",
      "40",
    ],
    correctAnswer: 1,
    explanation: `a+(n-1)d=4+(5)7=4+35=39.`
  },
  {
    id: 13,
    type: "number",
    skill: "Proportion",
    question: `y is directly proportional to x. y=12 when x=4. y when x=9 =`,
    options: [
      "24",
      "27",
      "30",
      "36",
    ],
    correctAnswer: 1,
    explanation: `y/x=3. y=3×9=27.`
  },
  {
    id: 14,
    type: "number",
    skill: "Fractions",
    question: `4 ÷ ⅔ = ?`,
    options: [
      "2⅔",
      "4",
      "6",
      "8",
    ],
    correctAnswer: 2,
    explanation: `4÷(2/3)=4×3/2=6.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `Cost of 1 notebook: $45. Cost of 8: ?`,
    options: [
      "$350",
      "$360",
      "$370",
      "$380",
    ],
    correctAnswer: 1,
    explanation: `8×$45=$360.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Volume",
    question: `Water tank 2m×1.5m×0.8m. Volume in litres:`,
    options: [
      "2,400 L",
      "2,800 L",
      "3,200 L",
      "3,600 L",
    ],
    correctAnswer: 0,
    explanation: `V=2×1.5×0.8=2.4 m³=2,400 L.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Area",
    question: `Area of parallelogram base 15cm, height 9cm:`,
    options: [
      "67.5 cm²",
      "120 cm²",
      "135 cm²",
      "270 cm²",
    ],
    correctAnswer: 2,
    explanation: `A=15×9=135 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed",
    question: `Car travels 300 km at 75 km/h. Time taken:`,
    options: [
      "3h",
      "3h 30min",
      "4h",
      "4h 30min",
    ],
    correctAnswer: 2,
    explanation: `300÷75=4 hours.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Conversion",
    question: `5 gallons = ? litres (1 gallon ≈ 4.55 L):`,
    options: [
      "22.25 L",
      "22.75 L",
      "23.00 L",
      "23.25 L",
    ],
    correctAnswer: 1,
    explanation: `Actually 5×4.55=22.75 L.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Money",
    question: `Exchange rate: US$1=JMD$152. JMD$3,800=how many USD?`,
    options: [
      "$23",
      "$24",
      "$25",
      "$26",
    ],
    correctAnswer: 2,
    explanation: `3800÷152=25.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time",
    question: `Olympic marathon record: 2h 1min 39s. Total seconds:`,
    options: [
      "7,254",
      "7,299",
      "7,384",
      "7,500",
    ],
    correctAnswer: 1,
    explanation: `2×3600+1×60+39=7200+60+39=7,299 s.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Perimeter",
    question: `Perimeter of sector radius 8cm angle 90° (π=3.14):`,
    options: [
      "28.56 cm",
      "30.56 cm",
      "32.56 cm",
      "34.56 cm",
    ],
    correctAnswer: 1,
    explanation: `Arc=(90/360)×2π×8=(1/4)×50.24=12.56. Perimeter=12.56+8+8=28.56 cm.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Surface Area",
    question: `Open cylinder radius 4cm height 10cm. Curved surface area (π=3.14):`,
    options: [
      "125.6 cm²",
      "251.2 cm²",
      "502.4 cm²",
      "628 cm²",
    ],
    correctAnswer: 1,
    explanation: `CSA=2πrh=2×3.14×4×10=251.2 cm².`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Weight",
    question: `A box weighs 14.7 kg. Rounded to nearest kg =`,
    options: [
      "14 kg",
      "15 kg",
      "16 kg",
      "17 kg",
    ],
    correctAnswer: 1,
    explanation: `0.7≥0.5, round up. 15 kg.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Length",
    question: `Sum of 3.4 m, 125 cm, and 460 mm. Total in cm:`,
    options: [
      "71 cm",
      "501 cm",
      "511 cm",
      "543 cm",
    ],
    correctAnswer: 2,
    explanation: `3.4m=340cm, 125cm, 460mm=46cm. Total=340+125+46=511 cm.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angle",
    question: `Co-interior angles (parallel lines) sum to:`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 1,
    explanation: `Co-interior angles are supplementary: sum=180°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Circles",
    question: `Angle at centre = 110°. Reflex angle at centre =`,
    options: [
      "250°",
      "260°",
      "270°",
      "280°",
    ],
    correctAnswer: 0,
    explanation: `360-110=250°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Similarity",
    question: `Triangles similar ratio 2:5. Smaller area 12 cm². Larger area:`,
    options: [
      "30 cm²",
      "60 cm²",
      "75 cm²",
      "150 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area ratio=(2:5)²=4:25. (25/4)×12=75 cm².`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Loci",
    question: `Locus of centre of a circle of radius 3 rolling along a straight line:`,
    options: [
      "A circle",
      "A straight line parallel to and 3 cm above the original line",
      "A curved path",
      "A zigzag",
    ],
    correctAnswer: 1,
    explanation: `The centre traces a parallel line 3 cm from the original.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Vectors",
    question: `Vector A=(3,4). Magnitude of A =`,
    options: [
      "3",
      "4",
      "5",
      "7",
    ],
    correctAnswer: 2,
    explanation: `√(9+16)=√25=5.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Transformations",
    question: `Enlargement: centre (0,0), scale factor 2. Point (3,4) maps to:`,
    options: [
      "(1.5,2)",
      "(5,6)",
      "(6,8)",
      "(9,12)",
    ],
    correctAnswer: 2,
    explanation: `Each coordinate ×2: (6,8).`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Angles",
    question: `Vertically opposite angles when two lines cross are:`,
    options: [
      "Supplementary",
      "Complementary",
      "Equal",
      "Reflex",
    ],
    correctAnswer: 2,
    explanation: `Vertically opposite angles are always equal.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Prisms",
    question: `Volume of triangular prism: triangle base 6cm, height 4cm, prism length 10cm:`,
    options: [
      "60 cm³",
      "120 cm³",
      "240 cm³",
      "480 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=½×6×4×10=120 cm³.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `6 numbers, mean=15. Another number, 21, added. New mean=`,
    options: [
      "15",
      "16",
      "17",
      "18",
    ],
    correctAnswer: 1,
    explanation: `Old sum=90. New sum=111. 111÷7=15.86≈16.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Grouped Data",
    question: `Classes: 0-10(5), 10-20(8), 20-30(12), 30-40(5). Modal class:`,
    options: [
      "0-10",
      "10-20",
      "20-30",
      "30-40",
    ],
    correctAnswer: 2,
    explanation: `Modal class has highest frequency=12. It's 20-30.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability",
    question: `P(A)=0.3, P(B)=0.5, independent. P(A and B)=`,
    options: [
      "0.15",
      "0.20",
      "0.80",
      "1.0",
    ],
    correctAnswer: 0,
    explanation: `P(A∩B)=0.3×0.5=0.15.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Correlation",
    question: `Points on scatter graph slope upward left to right. Correlation is:`,
    options: [
      "Negative",
      "Positive",
      "Zero",
      "Perfect",
    ],
    correctAnswer: 1,
    explanation: `Upward slope = positive correlation.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Frequency",
    question: `Mean from table: 2(f=5),4(f=3),6(f=7),8(f=5). Mean=`,
    options: [
      "4",
      "4.8",
      "5",
      "5.2",
    ],
    correctAnswer: 2,
    explanation: `(10+12+42+40)÷20=104÷20=5.2. Closest: 5.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Box Plot",
    question: `Lower quartile of: 3,5,7,9,11,13,15 =`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 0,
    explanation: `Lower half: 3,5,7. Q1=5.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Sampling",
    question: `A stratified sample of 50 from 200 students (100 boys, 100 girls). Boys in sample:`,
    options: [
      "20",
      "25",
      "30",
      "35",
    ],
    correctAnswer: 1,
    explanation: `100/200×50=25 boys.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed7MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed7Questions
    : g5MathMixed7Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 7</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 7</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 7</h1>
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
