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

const g5MathMixed6Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Order of Operations",
    question: `12 + 4 × 3 - 6 ÷ 2 = ?`,
    options: [
      "15",
      "17",
      "21",
      "23",
    ],
    correctAnswer: 2,
    explanation: `BODMAS: 4×3=12, 6÷2=3. 12+12-3=21.`
  },
  {
    id: 2,
    type: "number",
    skill: "Fractions",
    question: `5/12 + 7/12 = ?`,
    options: [
      "1",
      "12/24",
      "2",
      "1/12",
    ],
    correctAnswer: 0,
    explanation: `5/12+7/12=12/12=1.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentages",
    question: `Increase $350 by 12%.`,
    options: [
      "$378",
      "$382",
      "$390",
      "$392",
    ],
    correctAnswer: 3,
    explanation: `12%×350=$42. $350+$42=$392.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `Ratio 4:7. Total 88. Larger share =`,
    options: [
      "48",
      "49",
      "56",
      "44",
    ],
    correctAnswer: 2,
    explanation: `Parts=11, each=8. Larger=7×8=56.`
  },
  {
    id: 5,
    type: "number",
    skill: "Decimals",
    question: `Round 7.4567 to 2 decimal places.`,
    options: [
      "7.45",
      "7.46",
      "7.47",
      "7.50",
    ],
    correctAnswer: 1,
    explanation: `Third decimal is 6 (≥5). Round up: 7.46.`
  },
  {
    id: 6,
    type: "number",
    skill: "Powers",
    question: `5³ - 4² = ?`,
    options: [
      "89",
      "109",
      "111",
      "125",
    ],
    correctAnswer: 1,
    explanation: `125-16=109.`
  },
  {
    id: 7,
    type: "number",
    skill: "Sequences",
    question: `Pattern: 100, 91, 82, 73, ___.`,
    options: [
      "64",
      "65",
      "66",
      "67",
    ],
    correctAnswer: 0,
    explanation: `Decreases by 9. 73-9=64.`
  },
  {
    id: 8,
    type: "number",
    skill: "LCM",
    question: `LCM of 12, 15 =`,
    options: [
      "30",
      "40",
      "60",
      "75",
    ],
    correctAnswer: 2,
    explanation: `LCM(12,15)=60.`
  },
  {
    id: 9,
    type: "number",
    skill: "HCF",
    question: `HCF of 56 and 84 =`,
    options: [
      "12",
      "14",
      "21",
      "28",
    ],
    correctAnswer: 3,
    explanation: `56=2³×7. 84=2²×3×7. HCF=2²×7=28.`
  },
  {
    id: 10,
    type: "number",
    skill: "Problem Solving",
    question: `A car uses 8 L per 100 km. Fuel for 350 km =`,
    options: [
      "24 L",
      "28 L",
      "30 L",
      "32 L",
    ],
    correctAnswer: 1,
    explanation: `350÷100×8=28 L.`
  },
  {
    id: 11,
    type: "number",
    skill: "Simple Interest",
    question: `P=$800, R=5%, T=4 yrs. Total amount =`,
    options: [
      "$960",
      "$980",
      "$1,000",
      "$1,040",
    ],
    correctAnswer: 0,
    explanation: `I=800×0.05×4=$160. Total=$800+$160=$960.`
  },
  {
    id: 12,
    type: "number",
    skill: "Fractions",
    question: `3½ ÷ 1¾ = ?`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `7/2÷7/4=7/2×4/7=4/2=2.`
  },
  {
    id: 13,
    type: "number",
    skill: "Proportions",
    question: `Map scale 1:50,000. Distance 8 cm on map =`,
    options: [
      "2 km",
      "4 km",
      "8 km",
      "40 km",
    ],
    correctAnswer: 1,
    explanation: `8×50,000=400,000 cm=4 km.`
  },
  {
    id: 14,
    type: "number",
    skill: "Percentages",
    question: `$600 after 25% discount. Original price =`,
    options: [
      "$750",
      "$800",
      "$850",
      "$900",
    ],
    correctAnswer: 1,
    explanation: `75%=$600. 100%=$800.`
  },
  {
    id: 15,
    type: "number",
    skill: "Sequences",
    question: `nth term: 3n-1. When n=8 =`,
    options: [
      "22",
      "23",
      "24",
      "25",
    ],
    correctAnswer: 1,
    explanation: `3(8)-1=24-1=23.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Length",
    question: `Convert 3.2 km to metres.`,
    options: [
      "32 m",
      "320 m",
      "3,200 m",
      "32,000 m",
    ],
    correctAnswer: 2,
    explanation: `3.2×1,000=3,200 m.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Area",
    question: `Area of circle radius 10 cm (π=3.14):`,
    options: [
      "31.4 cm²",
      "62.8 cm²",
      "314 cm²",
      "628 cm²",
    ],
    correctAnswer: 2,
    explanation: `3.14×100=314 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Volume",
    question: `Volume of cube with side 7 cm =`,
    options: [
      "49 cm³",
      "147 cm³",
      "343 cm³",
      "441 cm³",
    ],
    correctAnswer: 2,
    explanation: `7³=343 cm³.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Speed",
    question: `Speed = 120 km, time = 1.5 h. Speed =`,
    options: [
      "60 km/h",
      "80 km/h",
      "90 km/h",
      "100 km/h",
    ],
    correctAnswer: 1,
    explanation: `120÷1.5=80 km/h.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Time",
    question: `How many minutes in 2 days?`,
    options: [
      "480",
      "1,440",
      "2,880",
      "4,320",
    ],
    correctAnswer: 2,
    explanation: `2×24×60=2,880 minutes.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Money",
    question: `Buy at $45 each, sell at $60 each. Profit on 20 items:`,
    options: [
      "$150",
      "$200",
      "$300",
      "$450",
    ],
    correctAnswer: 2,
    explanation: `Profit per item=$15. 20×$15=$300.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Perimeter",
    question: `Perimeter of triangle with sides 7,9,12 cm:`,
    options: [
      "18 cm",
      "21 cm",
      "26 cm",
      "28 cm",
    ],
    correctAnswer: 3,
    explanation: `7+9+12=28 cm.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Surface Area",
    question: `Cylinder radius 3cm, height 10cm. Curved SA (π=3.14):`,
    options: [
      "56.52 cm²",
      "94.2 cm²",
      "188.4 cm²",
      "282.6 cm²",
    ],
    correctAnswer: 2,
    explanation: `CSA=2πrh=2×3.14×3×10=188.4 cm².`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Exchange",
    question: `£1=JMD$220. Convert £35 to JMD:`,
    options: [
      "$5,500",
      "$6,600",
      "$7,700",
      "$8,800",
    ],
    correctAnswer: 2,
    explanation: `35×$220=$7,700 JMD.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Compound",
    question: `Density=8g/cm³, Volume=25cm³. Mass=`,
    options: [
      "150 g",
      "175 g",
      "200 g",
      "225 g",
    ],
    correctAnswer: 2,
    explanation: `Mass=8×25=200 g.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles",
    question: `Sum of angles in a hexagon:`,
    options: [
      "540°",
      "600°",
      "720°",
      "800°",
    ],
    correctAnswer: 2,
    explanation: `(6-2)×180=720°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Triangles",
    question: `All three angles equal in a triangle =`,
    options: [
      "Scalene",
      "Isosceles",
      "Equilateral",
      "Right",
    ],
    correctAnswer: 2,
    explanation: `All angles equal (60°) = equilateral triangle.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Circles",
    question: `Arc length with radius 6 cm and angle 120° (π=3.14):`,
    options: [
      "6.28 cm",
      "12.56 cm",
      "18.84 cm",
      "25.12 cm",
    ],
    correctAnswer: 1,
    explanation: `(120/360)×2π×6=(1/3)×37.68=12.56 cm.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Coordinates",
    question: `Midpoint of (-2,4) and (6,-2):`,
    options: [
      "(2,1)",
      "(4,2)",
      "(2,2)",
      "(4,1)",
    ],
    correctAnswer: 0,
    explanation: `((-2+6)/2,(4-2)/2)=(2,1).`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformation",
    question: `Point (5,3) reflected in y-axis gives:`,
    options: [
      "(-5,3)",
      "(5,-3)",
      "(-5,-3)",
      "(3,5)",
    ],
    correctAnswer: 0,
    explanation: `Reflection in y-axis: x changes sign. (-5,3).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Interior Angles",
    question: `Each interior angle of regular decagon:`,
    options: [
      "140°",
      "144°",
      "150°",
      "160°",
    ],
    correctAnswer: 1,
    explanation: `(10-2)×180÷10=1440÷10=144°.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Pythagoras",
    question: `Right triangle: legs 9 cm and 12 cm. Hypotenuse =`,
    options: [
      "13 cm",
      "15 cm",
      "17 cm",
      "21 cm",
    ],
    correctAnswer: 1,
    explanation: `√(81+144)=√225=15 cm.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "3D",
    question: `Vertices of a hexagonal prism:`,
    options: [
      "6",
      "8",
      "10",
      "12",
    ],
    correctAnswer: 3,
    explanation: `2 hexagonal faces × 6 vertices each = 12 vertices.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Scores: 22,18,30,26,24. Mean =`,
    options: [
      "23",
      "24",
      "25",
      "26",
    ],
    correctAnswer: 1,
    explanation: `(22+18+30+26+24)÷5=120÷5=24.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median",
    question: `Median of: 14,7,19,3,11,22,9:`,
    options: [
      "9",
      "11",
      "13",
      "14",
    ],
    correctAnswer: 1,
    explanation: `Ordered: 3,7,9,11,14,19,22. Middle=11.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Mode",
    question: `Data: 4,6,4,8,6,4,9,6,4. Mode =`,
    options: [
      "4",
      "6",
      "8",
      "9",
    ],
    correctAnswer: 0,
    explanation: `4 appears 4 times. Mode=4.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Range",
    question: `Range of: 8.2, 3.6, 12.5, 0.9, 7.1 =`,
    options: [
      "11.3",
      "11.6",
      "12.1",
      "12.5",
    ],
    correctAnswer: 1,
    explanation: `12.5-0.9=11.6.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Probability",
    question: `Deck of 52. P(king or queen)=`,
    options: [
      "2/13",
      "4/52",
      "8/52",
      "1/13",
    ],
    correctAnswer: 2,
    explanation: `Kings+Queens=4+4=8. P=8/52=2/13. Index 2 has 8/52.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Expected Value",
    question: `P(win)=0.2. Play 250 times. Expected wins=`,
    options: [
      "40",
      "50",
      "60",
      "70",
    ],
    correctAnswer: 1,
    explanation: `0.2×250=50.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Bar Chart",
    question: `Bar chart: 15+20+25+30+10 = ?`,
    options: [
      "90",
      "95",
      "100",
      "110",
    ],
    correctAnswer: 2,
    explanation: `15+20+25+30+10=100.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed6Questions
    : g5MathMixed6Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 6</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 6</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 6</h1>
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
