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

const g5MathMixed2Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Addition",
    question: `34,567 + 12,876 = ?`,
    options: [
      "46,343",
      "47,343",
      "47,443",
      "48,343",
    ],
    correctAnswer: 2,
    explanation: `34,567 + 12,876 = 47,443.`
  },
  {
    id: 2,
    type: "number",
    skill: "Subtraction",
    question: `50,000 - 23,648 = ?`,
    options: [
      "26,252",
      "26,352",
      "26,452",
      "27,352",
    ],
    correctAnswer: 1,
    explanation: `50,000 - 23,648 = 26,352.`
  },
  {
    id: 3,
    type: "number",
    skill: "Multiplication",
    question: `76 × 8 = ?`,
    options: [
      "596",
      "608",
      "616",
      "628",
    ],
    correctAnswer: 1,
    explanation: `76 × 8: (70×8)+(6×8) = 560+48 = 608.`
  },
  {
    id: 4,
    type: "number",
    skill: "Division",
    question: `952 ÷ 7 = ?`,
    options: [
      "126",
      "134",
      "136",
      "144",
    ],
    correctAnswer: 2,
    explanation: `952 ÷ 7 = 136. Check: 136×7 = 952.`
  },
  {
    id: 5,
    type: "number",
    skill: "Fractions",
    question: `What is 2/3 of 90?`,
    options: [
      "45",
      "55",
      "60",
      "75",
    ],
    correctAnswer: 2,
    explanation: `2/3 × 90 = 180 ÷ 3 = 60.`
  },
  {
    id: 6,
    type: "number",
    skill: "Fractions",
    question: `1/4 + 3/8 = ?`,
    options: [
      "4/12",
      "5/8",
      "7/12",
      "7/8",
    ],
    correctAnswer: 1,
    explanation: `LCD=8: 1/4=2/8. 2/8+3/8=5/8.`
  },
  {
    id: 7,
    type: "number",
    skill: "Percentages",
    question: `30% of 200 = ?`,
    options: [
      "40",
      "50",
      "60",
      "80",
    ],
    correctAnswer: 2,
    explanation: `10%=20, so 30%=60.`
  },
  {
    id: 8,
    type: "number",
    skill: "Decimals",
    question: `Write 0.35 as a percentage.`,
    options: [
      "0.35%",
      "3.5%",
      "35%",
      "350%",
    ],
    correctAnswer: 2,
    explanation: `0.35 × 100 = 35%.`
  },
  {
    id: 9,
    type: "number",
    skill: "Place Value",
    question: `In 4,523,816, what is the value of the digit 5?`,
    options: [
      "5,000",
      "50,000",
      "500,000",
      "5,000,000",
    ],
    correctAnswer: 2,
    explanation: `5 is in the hundred-thousands place. Value = 500,000.`
  },
  {
    id: 10,
    type: "number",
    skill: "Comparing Fractions",
    question: `Which is greatest: 2/3, 3/4, 5/8?`,
    options: [
      "2/3",
      "3/4",
      "5/8",
      "All equal",
    ],
    correctAnswer: 1,
    explanation: `LCD=24: 2/3=16/24, 3/4=18/24, 5/8=15/24. Greatest = 3/4.`
  },
  {
    id: 11,
    type: "number",
    skill: "Ratio",
    question: `A ratio of red to blue beads is 2:5. There are 35 blue beads. How many red?`,
    options: [
      "12",
      "14",
      "16",
      "18",
    ],
    correctAnswer: 1,
    explanation: `Parts: blue=5→7 each. Red=2×7=14.`
  },
  {
    id: 12,
    type: "number",
    skill: "LCM",
    question: `LCM of 6 and 9 is:`,
    options: [
      "18",
      "27",
      "36",
      "54",
    ],
    correctAnswer: 0,
    explanation: `LCM(6,9)=18. Both 6 and 9 divide 18 evenly.`
  },
  {
    id: 13,
    type: "number",
    skill: "HCF",
    question: `HCF of 36 and 48 is:`,
    options: [
      "6",
      "8",
      "12",
      "18",
    ],
    correctAnswer: 2,
    explanation: `Factors of 36:...12. Factors of 48:...12. HCF=12.`
  },
  {
    id: 14,
    type: "number",
    skill: "Patterns",
    question: `Pattern: 5, 10, 20, 40, ___.`,
    options: [
      "60",
      "70",
      "80",
      "100",
    ],
    correctAnswer: 2,
    explanation: `Each term doubles. 40×2=80.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `A vendor earns $65 per hour. She works 8 hours. How much does she earn?`,
    options: [
      "$480",
      "$510",
      "$520",
      "$540",
    ],
    correctAnswer: 2,
    explanation: `8×$65=$520.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Measurement",
    question: `Convert 5,200 m to km.`,
    options: [
      "0.52 km",
      "5.2 km",
      "52 km",
      "520 km",
    ],
    correctAnswer: 1,
    explanation: `5,200÷1,000=5.2 km.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Area",
    question: `Area of a triangle with base 14 cm and height 8 cm:`,
    options: [
      "56 cm²",
      "80 cm²",
      "112 cm²",
      "224 cm²",
    ],
    correctAnswer: 0,
    explanation: `Area=½×14×8=56 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Perimeter",
    question: `Perimeter of a regular hexagon with sides of 9 cm:`,
    options: [
      "45 cm",
      "54 cm",
      "63 cm",
      "72 cm",
    ],
    correctAnswer: 1,
    explanation: `6×9=54 cm.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Time",
    question: `How many minutes in 3.5 hours?`,
    options: [
      "180",
      "200",
      "210",
      "240",
    ],
    correctAnswer: 2,
    explanation: `3.5×60=210 minutes.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Mass",
    question: `A parcel weighs 4 kg 750 g. Total mass in grams:`,
    options: [
      "4,075 g",
      "4,750 g",
      "47,500 g",
      "475 g",
    ],
    correctAnswer: 1,
    explanation: `4,000+750=4,750 g.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Capacity",
    question: `How many 400 mL cups from a 3.2 L jug?`,
    options: [
      "6",
      "7",
      "8",
      "9",
    ],
    correctAnswer: 2,
    explanation: `3,200÷400=8 cups.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Time",
    question: `Start 9:40 AM, duration 3h 25min. End time:`,
    options: [
      "12:55 PM",
      "1:05 PM",
      "1:15 PM",
      "1:25 PM",
    ],
    correctAnswer: 1,
    explanation: `9:40+3h=12:40. 12:40+25min=1:05 PM.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Volume",
    question: `Volume of a cuboid 10×6×4 cm:`,
    options: [
      "24 cm³",
      "60 cm³",
      "120 cm³",
      "240 cm³",
    ],
    correctAnswer: 3,
    explanation: `V=10×6×4=240 cm³.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Temperature",
    question: `Temperature drops from 22°C to -3°C. How much did it drop?`,
    options: [
      "18°C",
      "19°C",
      "25°C",
      "22°C",
    ],
    correctAnswer: 2,
    explanation: `22-(-3)=22+3=25°C drop.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Speed",
    question: `Distance 240 km in 3 hours. Speed in km/h:`,
    options: [
      "60",
      "70",
      "80",
      "90",
    ],
    correctAnswer: 2,
    explanation: `Speed=240÷3=80 km/h.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles",
    question: `Sum of interior angles of a quadrilateral:`,
    options: [
      "180°",
      "270°",
      "360°",
      "540°",
    ],
    correctAnswer: 2,
    explanation: `All quadrilaterals have angles summing to 360°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "3D Shapes",
    question: `Faces on a pentagonal prism:`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 2,
    explanation: `2 pentagonal+5 rectangular=7 faces.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Triangles",
    question: `A triangle with all sides different is:`,
    options: [
      "Isosceles",
      "Equilateral",
      "Scalene",
      "Right-angled",
    ],
    correctAnswer: 2,
    explanation: `A scalene triangle has all three sides of different lengths.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Coordinates",
    question: `Point (4,3) translated 2 left and 3 up gives:`,
    options: [
      "(2,6)",
      "(6,0)",
      "(2,0)",
      "(6,6)",
    ],
    correctAnswer: 0,
    explanation: `x:4-2=2, y:3+3=6. New point=(2,6).`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Circles",
    question: `Circumference of circle with diameter 14 cm (π=22/7):`,
    options: [
      "22 cm",
      "44 cm",
      "66 cm",
      "88 cm",
    ],
    correctAnswer: 1,
    explanation: `C=πd=(22/7)×14=44 cm.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Symmetry",
    question: `Lines of symmetry of a square:`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 3,
    explanation: `A square has 4 lines of symmetry.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Area",
    question: `Area of a circle with radius 7 cm (π=22/7):`,
    options: [
      "44 cm²",
      "77 cm²",
      "154 cm²",
      "308 cm²",
    ],
    correctAnswer: 2,
    explanation: `A=πr²=(22/7)×49=154 cm².`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Angles",
    question: `Exterior angle of a regular hexagon:`,
    options: [
      "45°",
      "50°",
      "60°",
      "72°",
    ],
    correctAnswer: 2,
    explanation: `Exterior=360°÷6=60°.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Mean of: 12, 18, 24, 30, 6 =`,
    options: [
      "16",
      "18",
      "20",
      "22",
    ],
    correctAnswer: 1,
    explanation: `(12+18+24+30+6)÷5=90÷5=18.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median",
    question: `Median of: 9, 3, 15, 6, 21, 12, 18 =`,
    options: [
      "12",
      "13",
      "15",
      "9",
    ],
    correctAnswer: 0,
    explanation: `Ordered: 3,6,9,12,15,18,21. Middle=12.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Mode",
    question: `Data: 7,9,7,11,9,7,13. Mode =`,
    options: [
      "7",
      "9",
      "11",
      "13",
    ],
    correctAnswer: 0,
    explanation: `7 appears 3 times. Mode=7.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Range",
    question: `Range of: 4.5, 9.2, 1.8, 7.6, 3.1 =`,
    options: [
      "7.2",
      "7.4",
      "7.6",
      "8.0",
    ],
    correctAnswer: 1,
    explanation: `9.2-1.8=7.4.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Probability",
    question: `A bag has 4 red, 3 blue, 3 green. P(blue)=`,
    options: [
      "3/10",
      "1/3",
      "3/4",
      "1/10",
    ],
    correctAnswer: 0,
    explanation: `P(blue)=3/10.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Graphs",
    question: `A pie chart: Maths=90°, English=120°, Science=60°, Art=90°. Fraction for English:`,
    options: [
      "1/3",
      "1/4",
      "2/5",
      "3/10",
    ],
    correctAnswer: 0,
    explanation: `120÷360=1/3.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Compound Probability",
    question: `Two coins tossed. P(both heads)=`,
    options: [
      "1/4",
      "1/2",
      "3/4",
      "1",
    ],
    correctAnswer: 0,
    explanation: `P=½×½=1/4.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed2Questions
    : g5MathMixed2Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 2</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 2</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 2</h1>
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
