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

const g5MathMixed10Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Operations",
    question: `3⁴ - 2⁵ = ?`,
    options: [
      "49",
      "50",
      "51",
      "81",
    ],
    correctAnswer: 0,
    explanation: `81-32=49.`
  },
  {
    id: 2,
    type: "number",
    skill: "Fractions",
    question: `(2/3)² = ?`,
    options: [
      "2/6",
      "4/9",
      "4/6",
      "2/9",
    ],
    correctAnswer: 1,
    explanation: `(2/3)²=4/9.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentages",
    question: `Price was $600. After 15% increase then 10% decrease. Final price:`,
    options: [
      "$558.00",
      "$594.00",
      "$621.00",
      "$648.00",
    ],
    correctAnswer: 2,
    explanation: `15% increase: $600×1.15=$690. 10% decrease: $690×0.9=$621.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `Salaries ratio 5:8. Difference is $9,000. Smaller salary:`,
    options: [
      "$12,000",
      "$15,000",
      "$18,000",
      "$24,000",
    ],
    correctAnswer: 1,
    explanation: `3 parts=$9,000. Each=$3,000. Smaller=5×$3,000=$15,000.`
  },
  {
    id: 5,
    type: "number",
    skill: "Algebra",
    question: `4x - 3 = 2x + 9. x = ?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 2,
    explanation: `2x=12. x=6.`
  },
  {
    id: 6,
    type: "number",
    skill: "Algebra",
    question: `y = 3x² when x = -2. y = ?`,
    options: [
      "12",
      "16",
      "18",
      "24",
    ],
    correctAnswer: 0,
    explanation: `3×(-2)²=3×4=12.`
  },
  {
    id: 7,
    type: "number",
    skill: "Proportion",
    question: `Distance∝Time. 90km in 1.5h. How far in 4h?`,
    options: [
      "200km",
      "220km",
      "230km",
      "240km",
    ],
    correctAnswer: 3,
    explanation: `Rate=60km/h. 4×60=240km.`
  },
  {
    id: 8,
    type: "number",
    skill: "Sequences",
    question: `Sum of first n odd numbers = n². Sum of first 9 odd numbers =`,
    options: [
      "72",
      "81",
      "90",
      "99",
    ],
    correctAnswer: 1,
    explanation: `9²=81.`
  },
  {
    id: 9,
    type: "number",
    skill: "Compound Interest",
    question: `$500 at 10% compound for 2 yrs. Amount =`,
    options: [
      "$590",
      "$600",
      "$605",
      "$610",
    ],
    correctAnswer: 2,
    explanation: `Year1: $550. Year2: $550×1.1=$605.`
  },
  {
    id: 10,
    type: "number",
    skill: "Problem Solving",
    question: `A car park: 60% of spaces taken. 180 empty. Total spaces:`,
    options: [
      "400",
      "420",
      "450",
      "500",
    ],
    correctAnswer: 2,
    explanation: `40%=180. 100%=180÷0.4=450.`
  },
  {
    id: 11,
    type: "number",
    skill: "Algebraic Expressions",
    question: `Expand 3(2x-4)=`,
    options: [
      "6x-12",
      "6x-4",
      "6x-7",
      "3x-12",
    ],
    correctAnswer: 0,
    explanation: `3×2x=6x, 3×-4=-12. Answer: 6x-12.`
  },
  {
    id: 12,
    type: "number",
    skill: "Substitution",
    question: `a=3, b=-2. Find 2a² - 3b.`,
    options: [
      "20",
      "21",
      "22",
      "24",
    ],
    correctAnswer: 3,
    explanation: `2×9-3×(-2)=18+6=24.`
  },
  {
    id: 13,
    type: "number",
    skill: "Fractions",
    question: `Simplify (3/4)÷(9/16):`,
    options: [
      "3/4",
      "4/3",
      "1⅓",
      "2",
    ],
    correctAnswer: 1,
    explanation: `3/4×16/9=48/36=4/3=1⅓.`
  },
  {
    id: 14,
    type: "number",
    skill: "Problem Solving",
    question: `Apples cost $x each. 15 apples cost $180. 9 more bought. Total cost:`,
    options: [
      "$288",
      "$290",
      "$292",
      "$294",
    ],
    correctAnswer: 0,
    explanation: `$180÷15=$12 each. 9×$12=$108. Total=$180+$108=$288.`
  },
  {
    id: 15,
    type: "number",
    skill: "Arithmetic Progression",
    question: `AP: a=7, d=4. Sum of first 6 terms =`,
    options: [
      "102",
      "108",
      "114",
      "120",
    ],
    correctAnswer: 0,
    explanation: `S=6/2×(2×7+5×4)=3×34=102.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Compound",
    question: `A car travels at 90km/h. Distance in 1h 20min =`,
    options: [
      "110km",
      "120km",
      "125km",
      "130km",
    ],
    correctAnswer: 1,
    explanation: `1h20min=4/3h. 90×4/3=120km.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume",
    question: `Volume of hemisphere radius 9cm (V=2/3πr³, π=3.14):`,
    options: [
      "763.02 cm³",
      "1,526.04 cm³",
      "3,052.08 cm³",
      "4,578.12 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=⅔×3.14×9³=⅔×3.14×729=⅔×2,289.06=1,526.04 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Conversion",
    question: `Change 5,400 seconds to hours and minutes.`,
    options: [
      "1h 25min",
      "1h 30min",
      "1h 35min",
      "2h 5min",
    ],
    correctAnswer: 1,
    explanation: `5400÷60=90 minutes=1h 30min.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Rate",
    question: `Pool fills at 80L/min and drains at 35L/min. Net fill rate per hour:`,
    options: [
      "2,400 L/h",
      "2,700 L/h",
      "3,200 L/h",
      "4,200 L/h",
    ],
    correctAnswer: 1,
    explanation: `Net=45L/min. 45×60=2,700L/h.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Money",
    question: `Profit margin = profit÷cost×100. Cost=$250, profit=$50. Margin:`,
    options: [
      "15%",
      "20%",
      "25%",
      "30%",
    ],
    correctAnswer: 1,
    explanation: `50÷250×100=20%.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Area",
    question: `Area of ring: outer diameter 20cm, inner diameter 12cm (π=3.14):`,
    options: [
      "125.6 cm²",
      "200.96 cm²",
      "251.2 cm²",
      "314 cm²",
    ],
    correctAnswer: 1,
    explanation: `π(10²-6²)=3.14×(100-36)=3.14×64=200.96 cm².`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Time",
    question: `Total study time: 45min daily for 18 days. Total in hours:`,
    options: [
      "13h 30min",
      "13h 45min",
      "14h",
      "14h 30min",
    ],
    correctAnswer: 0,
    explanation: `45×18=810min=13h 30min.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Conversion",
    question: `5 litres of paint covers 40m². Coverage per litre:`,
    options: [
      "6 m²/L",
      "7 m²/L",
      "8 m²/L",
      "10 m²/L",
    ],
    correctAnswer: 2,
    explanation: `40÷5=8 m²/L.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Speed",
    question: `Train passes 200m platform in 20s. Train is 100m long. Speed in m/s:`,
    options: [
      "10 m/s",
      "12 m/s",
      "15 m/s",
      "20 m/s",
    ],
    correctAnswer: 2,
    explanation: `Total distance=300m. Speed=300÷20=15 m/s.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Compound",
    question: `Tap leaks 0.5L per hour. Total leak in 1 week (litres):`,
    options: [
      "72 L",
      "84 L",
      "90 L",
      "96 L",
    ],
    correctAnswer: 1,
    explanation: `0.5×24×7=84L.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Circle",
    question: `Chord length in circle radius 10cm, perpendicular distance 6cm from centre:`,
    options: [
      "8cm",
      "14cm",
      "16cm",
      "20cm",
    ],
    correctAnswer: 2,
    explanation: `Half-chord=√(100-36)=√64=8. Chord=16cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Enlargement",
    question: `Triangle enlarged: sides doubled, angles ___ .`,
    options: [
      "Double",
      "Halve",
      "Stay the same",
      "Triple",
    ],
    correctAnswer: 2,
    explanation: `Enlargement changes lengths but not angles.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry",
    question: `In right triangle: adjacent=8cm, hyp=10cm. cos(angle)=`,
    options: [
      "0.6",
      "0.8",
      "1.0",
      "1.25",
    ],
    correctAnswer: 1,
    explanation: `cos=adj/hyp=8/10=0.8.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Angles",
    question: `Polygon with interior angle sum 1800°. Number of sides:`,
    options: [
      "12",
      "13",
      "14",
      "15",
    ],
    correctAnswer: 0,
    explanation: `n=1800÷180+2=10+2=12.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformations",
    question: `Rotation 270° clockwise = rotation ___ anticlockwise.`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 0,
    explanation: `270° clockwise = 90° anticlockwise.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Circles",
    question: `Two tangents from external point to circle. Angle between them = 40°. Arc angle between tangent points:`,
    options: [
      "70°",
      "120°",
      "140°",
      "160°",
    ],
    correctAnswer: 2,
    explanation: `Angle between tangents+arc=180°. 40°+arc=180°. Arc=140°.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Coordinates",
    question: `Point P(3,5), Q(7,2). Distance PQ =`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `√((7-3)²+(2-5)²)=√(16+9)=√25=5.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Angles",
    question: `In a regular polygon, each exterior angle = 24°. Number of sides:`,
    options: [
      "14",
      "15",
      "16",
      "17",
    ],
    correctAnswer: 1,
    explanation: `360÷24=15.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Combined mean: group A(n=10,mean=8), group B(n=15,mean=12). Combined mean=`,
    options: [
      "10",
      "10.4",
      "10.8",
      "11",
    ],
    correctAnswer: 1,
    explanation: `(80+180)÷25=260÷25=10.4.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Standard Deviation",
    question: `Which data set has ZERO standard deviation?`,
    options: [
      "1,2,3,4,5",
      "2,4,6,8,10",
      "5,5,5,5,5",
      "1,1,2,2,3",
    ],
    correctAnswer: 2,
    explanation: `All values identical → zero spread → SD=0.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability",
    question: `3 coins tossed. P(exactly 2 heads)=`,
    options: [
      "1/8",
      "3/8",
      "1/2",
      "5/8",
    ],
    correctAnswer: 1,
    explanation: `HHT,HTH,THH = 3 ways. P=3/8.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Regression",
    question: `Best fit line: y=2x+5. When x=7, predicted y=`,
    options: [
      "17",
      "19",
      "21",
      "24",
    ],
    correctAnswer: 1,
    explanation: `2(7)+5=19.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Hypothesis",
    question: `A student claims average score is 75. Sample mean is 72. This is an example of:`,
    options: [
      "Confirmation",
      "Statistical testing",
      "Certainty",
      "Coincidence",
    ],
    correctAnswer: 1,
    explanation: `Comparing sample mean to claimed value is statistical testing / hypothesis testing.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Frequency",
    question: `Class 20-30 has frequency 15. Class width 10. Frequency density=`,
    options: [
      "1.5",
      "1.8",
      "2.0",
      "2.5",
    ],
    correctAnswer: 0,
    explanation: `FD=15÷10=1.5.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability",
    question: `From 1-20, P(multiple of 3 or 5)=`,
    options: [
      "8/20",
      "9/20",
      "10/20",
      "11/20",
    ],
    correctAnswer: 1,
    explanation: `Multiples of 3: 3,6,9,12,15,18(6). Of 5: 5,10,15,20(4). Of both(15): 1. Union=6+4-1=9. P=9/20.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed10MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed10Questions
    : g5MathMixed10Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 10</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 10</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 10</h1>
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
