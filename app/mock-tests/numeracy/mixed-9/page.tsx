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

const g5MathMixed9Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Operations",
    question: `(45 + 15) × 2 - 30 ÷ 5 = ?`,
    options: [
      "108",
      "114",
      "116",
      "120",
    ],
    correctAnswer: 1,
    explanation: `(60)×2-6=120-6=114.`
  },
  {
    id: 2,
    type: "number",
    skill: "Fractions",
    question: `9/10 - 3/5 = ?`,
    options: [
      "3/10",
      "6/5",
      "3/5",
      "6/10",
    ],
    correctAnswer: 0,
    explanation: `3/5=6/10. 9/10-6/10=3/10.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentages",
    question: `Increase 80 by 35%.`,
    options: [
      "104",
      "106",
      "108",
      "110",
    ],
    correctAnswer: 2,
    explanation: `35%×80=28. 80+28=108.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `Mix red:blue paint 3:7. Need 40L total. Litres of red =`,
    options: [
      "10 L",
      "12 L",
      "14 L",
      "16 L",
    ],
    correctAnswer: 1,
    explanation: `Red=3/10×40=12L.`
  },
  {
    id: 5,
    type: "number",
    skill: "Algebra",
    question: `5x + 3 = 28. x = ?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `5x=25. x=5.`
  },
  {
    id: 6,
    type: "number",
    skill: "Algebra",
    question: `x² = 144. x = ?`,
    options: [
      "11",
      "12",
      "13",
      "14",
    ],
    correctAnswer: 1,
    explanation: `√144=12.`
  },
  {
    id: 7,
    type: "number",
    skill: "Proportion",
    question: `y inversely proportional to x. y=8 when x=3. y when x=6 =`,
    options: [
      "2",
      "3",
      "4",
      "6",
    ],
    correctAnswer: 2,
    explanation: `y×x=constant=24. y=24÷6=4.`
  },
  {
    id: 8,
    type: "number",
    skill: "Sequences",
    question: `Geometric: first term 2, ratio 3. 5th term =`,
    options: [
      "48",
      "54",
      "162",
      "486",
    ],
    correctAnswer: 2,
    explanation: `2,6,18,54,162. 5th=162.`
  },
  {
    id: 9,
    type: "number",
    skill: "Powers",
    question: `(2³)² = ?`,
    options: [
      "32",
      "64",
      "128",
      "256",
    ],
    correctAnswer: 1,
    explanation: `(8)²=64.`
  },
  {
    id: 10,
    type: "number",
    skill: "Problem Solving",
    question: `12% tax on $850. Total =`,
    options: [
      "$942",
      "$952",
      "$962",
      "$972",
    ],
    correctAnswer: 1,
    explanation: `12%×850=$102. $850+$102=$952.`
  },
  {
    id: 11,
    type: "number",
    skill: "Fractions",
    question: `3½ - 1¾ = ?`,
    options: [
      "1¾",
      "1½",
      "2",
      "2¼",
    ],
    correctAnswer: 0,
    explanation: `7/2-7/4=14/4-7/4=7/4=1¾.`
  },
  {
    id: 12,
    type: "number",
    skill: "LCM",
    question: `LCM of 4,6,9 =`,
    options: [
      "18",
      "24",
      "36",
      "72",
    ],
    correctAnswer: 2,
    explanation: `LCM(4,6)=12. LCM(12,9)=36.`
  },
  {
    id: 13,
    type: "number",
    skill: "Number",
    question: `Which is divisible by both 3 and 8?`,
    options: [
      "20",
      "24",
      "36",
      "40",
    ],
    correctAnswer: 1,
    explanation: `24÷3=8, 24÷8=3. Both work.`
  },
  {
    id: 14,
    type: "number",
    skill: "Estimation",
    question: `Estimate 48.6 × 9.8 ≈`,
    options: [
      "450",
      "480",
      "490",
      "500",
    ],
    correctAnswer: 1,
    explanation: `≈50×10=500. More precisely 49×10=490.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `A pump fills 45L in 9min. How long for 120L?`,
    options: [
      "24 min",
      "26 min",
      "28 min",
      "30 min",
    ],
    correctAnswer: 0,
    explanation: `Rate=5L/min. 120÷5=24 min.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Area",
    question: `Area of kite: diagonals 12cm and 18cm =`,
    options: [
      "54 cm²",
      "108 cm²",
      "144 cm²",
      "216 cm²",
    ],
    correctAnswer: 1,
    explanation: `A=(d₁×d₂)/2=(12×18)/2=108 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume",
    question: `Cylinder diameter 10cm, height 15cm. Volume (π=3.14):`,
    options: [
      "785 cm³",
      "1,177.5 cm³",
      "3,141.5 cm³",
      "4,710 cm³",
    ],
    correctAnswer: 1,
    explanation: `r=5. V=3.14×25×15=1,177.5 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Compound Measure",
    question: `Power=Energy÷Time. Energy=600J, Time=30s. Power=`,
    options: [
      "15 W",
      "20 W",
      "25 W",
      "30 W",
    ],
    correctAnswer: 1,
    explanation: `600÷30=20W.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Conversion",
    question: `Convert 72 km/h to m/s.`,
    options: [
      "18 m/s",
      "20 m/s",
      "25 m/s",
      "30 m/s",
    ],
    correctAnswer: 1,
    explanation: `72÷3.6=20 m/s.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Money",
    question: `Original $320, after 25% increase. New price:`,
    options: [
      "$380",
      "$390",
      "$400",
      "$410",
    ],
    correctAnswer: 2,
    explanation: `25%×320=$80. $320+$80=$400.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time",
    question: `Event: 3h 45min. Start 10:30AM. End time:`,
    options: [
      "1:45 PM",
      "2:00 PM",
      "2:15 PM",
      "2:30 PM",
    ],
    correctAnswer: 2,
    explanation: `10:30+3h=13:30. +45min=14:15=2:15PM.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Scale",
    question: `Scale 1:500,000. Real distance 25km. Map distance in cm:`,
    options: [
      "5 cm",
      "10 cm",
      "25 cm",
      "50 cm",
    ],
    correctAnswer: 0,
    explanation: `25km=2,500,000cm. ÷500,000=5cm.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Surface Area",
    question: `Total SA of cuboid 10×6×4cm:`,
    options: [
      "208 cm²",
      "248 cm²",
      "288 cm²",
      "328 cm²",
    ],
    correctAnswer: 1,
    explanation: `SA=2(10×6+6×4+4×10)=2(60+24+40)=2×124=248 cm².`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Length",
    question: `A ladder 5m long leans against wall, foot 3m from wall. Height up wall:`,
    options: [
      "3m",
      "4m",
      "5m",
      "6m",
    ],
    correctAnswer: 1,
    explanation: `√(25-9)=√16=4m.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Conversion",
    question: `1 mile ≈ 1.6km. Distance 8 miles in km:`,
    options: [
      "10km",
      "12.8km",
      "14.4km",
      "16km",
    ],
    correctAnswer: 1,
    explanation: `8×1.6=12.8km.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles",
    question: `Angles of quadrilateral: 95°,85°,110°,___.`,
    options: [
      "60°",
      "70°",
      "80°",
      "90°",
    ],
    correctAnswer: 1,
    explanation: `360-95-85-110=70°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Circles",
    question: `Tangent to circle from external point. Angle between tangent and radius =`,
    options: [
      "45°",
      "60°",
      "90°",
      "180°",
    ],
    correctAnswer: 2,
    explanation: `Tangent is perpendicular to radius at point of contact: 90°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Triangles",
    question: `Angles of triangle in ratio 2:3:7. Largest angle:`,
    options: [
      "42°",
      "63°",
      "105°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Sum=12 parts. Each=15°. Largest=7×15=105°.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Bearings",
    question: `Walk 5km North then 12km East. Distance from start:`,
    options: [
      "13km",
      "14km",
      "15km",
      "16km",
    ],
    correctAnswer: 0,
    explanation: `√(25+144)=√169=13km.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformations",
    question: `Reflection of (4,2) in line y=x gives:`,
    options: [
      "(2,4)",
      "(4,2)",
      "(-4,2)",
      "(4,-2)",
    ],
    correctAnswer: 0,
    explanation: `Reflection in y=x: swap coordinates. (4,2)→(2,4).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Area",
    question: `Area of equilateral triangle with side 10cm (A=s²√3/4, √3≈1.73):`,
    options: [
      "37.2 cm²",
      "39.2 cm²",
      "41.2 cm²",
      "43.3 cm²",
    ],
    correctAnswer: 3,
    explanation: `(100×1.73)/4=43.25≈43.3 cm².`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Interior Angle",
    question: `Interior angle of regular pentagon:`,
    options: [
      "100°",
      "104°",
      "108°",
      "110°",
    ],
    correctAnswer: 2,
    explanation: `(5-2)×180÷5=540÷5=108°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Vectors",
    question: `Vector AB=(6,-8). |AB|=`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 1,
    explanation: `√(36+64)=√100=10.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Mean of 9 numbers is 14. Total sum =`,
    options: [
      "112",
      "116",
      "126",
      "136",
    ],
    correctAnswer: 2,
    explanation: `9×14=126.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median",
    question: `Median of: 3,7,5,9,1,6,8,4,2 =`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `Sorted: 1,2,3,4,5,6,7,8,9. Middle=5.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability",
    question: `Letters: A,A,B,C,C,C,D. P(vowel)=`,
    options: [
      "2/7",
      "3/7",
      "4/7",
      "5/7",
    ],
    correctAnswer: 0,
    explanation: `Vowels: A,A=2. P=2/7.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Cumulative",
    question: `Median from cumulative: 20 values, 10th and 11th both fall in class 15-20.`,
    options: [
      "15",
      "17.5",
      "20",
      "22.5",
    ],
    correctAnswer: 1,
    explanation: `When 10th and 11th both in 15-20, median is midpoint of class: 17.5.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Frequency",
    question: `Scores: 3(f=4),4(f=6),5(f=5),6(f=5). Mean score =`,
    options: [
      "4.2",
      "4.4",
      "4.5",
      "4.8",
    ],
    correctAnswer: 1,
    explanation: `(12+24+25+30)÷20=91÷20=4.55. Closest: 4.5.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Probability",
    question: `P(A)=1/3, P(B)=1/4, independent. P(A and B)=`,
    options: [
      "1/12",
      "1/7",
      "7/12",
      "1",
    ],
    correctAnswer: 0,
    explanation: `1/3×1/4=1/12.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Data",
    question: `Which average is most affected by extreme values?`,
    options: [
      "Mode",
      "Median",
      "Mean",
      "Range",
    ],
    correctAnswer: 2,
    explanation: `The mean is most affected by extreme values (outliers).`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed9MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed9Questions
    : g5MathMixed9Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 9</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 9</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 9</h1>
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
