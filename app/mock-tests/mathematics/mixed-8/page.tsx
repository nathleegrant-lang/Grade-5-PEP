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

const g5MathMixed8Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Addition",
    question: `56,789 + 34,567 = ?`,
    options: [
      "90,256",
      "91,256",
      "91,356",
      "92,256",
    ],
    correctAnswer: 2,
    explanation: `56,789+34,567=91,356.`
  },
  {
    id: 2,
    type: "number",
    skill: "Subtraction",
    question: `200,000 - 87,654 = ?`,
    options: [
      "112,246",
      "112,346",
      "112,446",
      "113,346",
    ],
    correctAnswer: 1,
    explanation: `200,000-87,654=112,346.`
  },
  {
    id: 3,
    type: "number",
    skill: "Multiplication",
    question: `304 × 25 = ?`,
    options: [
      "7,500",
      "7,600",
      "7,900",
      "8,000",
    ],
    correctAnswer: 1,
    explanation: `304×25=7,600. (300×25=7500, 4×25=100. 7500+100=7600.)`
  },
  {
    id: 4,
    type: "number",
    skill: "Division",
    question: `5,625 ÷ 25 = ?`,
    options: [
      "215",
      "220",
      "225",
      "230",
    ],
    correctAnswer: 2,
    explanation: `5,625÷25=225.`
  },
  {
    id: 5,
    type: "number",
    skill: "Fractions",
    question: `11/12 - 5/12 = ?`,
    options: [
      "1/2",
      "6/12",
      "6/0",
      "1/3",
    ],
    correctAnswer: 0,
    explanation: `11/12-5/12=6/12=1/2.`
  },
  {
    id: 6,
    type: "number",
    skill: "Percentages",
    question: `Find 8% of 600.`,
    options: [
      "44",
      "48",
      "52",
      "56",
    ],
    correctAnswer: 1,
    explanation: `8%×600=0.08×600=48.`
  },
  {
    id: 7,
    type: "number",
    skill: "Ratio",
    question: `Share 560 in ratio 3:5. Smaller share =`,
    options: [
      "180",
      "200",
      "210",
      "240",
    ],
    correctAnswer: 2,
    explanation: `Parts=8, each=70. Smaller=3×70=210.`
  },
  {
    id: 8,
    type: "number",
    skill: "Decimals",
    question: `3.6 × 1.5 = ?`,
    options: [
      "4.8",
      "5.0",
      "5.4",
      "5.6",
    ],
    correctAnswer: 2,
    explanation: `3.6×1.5=5.4.`
  },
  {
    id: 9,
    type: "number",
    skill: "LCM",
    question: `LCM of 8, 10, 15 =`,
    options: [
      "40",
      "60",
      "80",
      "120",
    ],
    correctAnswer: 1,
    explanation: `LCM(8,10)=40, LCM(40,15)=120. Wait: LCM(8,10,15). 8=2³,10=2×5,15=3×5. LCM=2³×3×5=120.`
  },
  {
    id: 10,
    type: "number",
    skill: "Problem Solving",
    question: `12 items at $35 each. 15% discount. Total cost:`,
    options: [
      "$321",
      "$342",
      "$357",
      "$378",
    ],
    correctAnswer: 3,
    explanation: `12×35=$420. 15%off=63. $420-63=$357.`
  },
  {
    id: 11,
    type: "number",
    skill: "Proportion",
    question: `y∝x². When x=3, y=18. Find y when x=5.`,
    options: [
      "40",
      "45",
      "50",
      "60",
    ],
    correctAnswer: 2,
    explanation: `y=kx². 18=9k. k=2. y=2×25=50.`
  },
  {
    id: 12,
    type: "number",
    skill: "Algebra",
    question: `2x - 7 = 13. x = ?`,
    options: [
      "8",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 2,
    explanation: `2x=20. x=10.`
  },
  {
    id: 13,
    type: "number",
    skill: "Algebra",
    question: `3(x+4) = 27. x = ?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `x+4=9. x=5.`
  },
  {
    id: 14,
    type: "number",
    skill: "Sequences",
    question: `2,5,11,23,___. (each×2+1)`,
    options: [
      "45",
      "47",
      "49",
      "51",
    ],
    correctAnswer: 1,
    explanation: `23×2+1=47.`
  },
  {
    id: 15,
    type: "number",
    skill: "Prime Factors",
    question: `Factors of 120: prime factorisation =`,
    options: [
      "2²×3×5",
      "2³×3×5",
      "2×3²×5",
      "2²×3²×5",
    ],
    correctAnswer: 1,
    explanation: `120=8×15=2³×3×5.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Area",
    question: `Area of sector angle 90°, radius 14cm (π=22/7):`,
    options: [
      "44 cm²",
      "77 cm²",
      "154 cm²",
      "308 cm²",
    ],
    correctAnswer: 2,
    explanation: `(1/4)×(22/7)×196=(1/4)×616=154 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume",
    question: `Sphere radius 6cm (V=4/3πr³, π=3.14):`,
    options: [
      "603.19 cm³",
      "904.32 cm³",
      "1,205.76 cm³",
      "2,411.52 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=4/3×3.14×216=904.32 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed",
    question: `Distance 150km, time 2h30min. Average speed =`,
    options: [
      "50 km/h",
      "55 km/h",
      "60 km/h",
      "65 km/h",
    ],
    correctAnswer: 2,
    explanation: `2.5h. 150÷2.5=60 km/h.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Conversion",
    question: `A container holds 3.75 kL. Volume in litres:`,
    options: [
      "375 L",
      "3,750 L",
      "37,500 L",
      "375,000 L",
    ],
    correctAnswer: 1,
    explanation: `1kL=1,000L. 3.75×1000=3,750L.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Money",
    question: `Buy 3 items at $120 each. Pay with $500. Change =`,
    options: [
      "$50",
      "$140",
      "$210",
      "$260",
    ],
    correctAnswer: 1,
    explanation: `3×$120=$360. $500-$360=$140.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time",
    question: `Flight departs 06:45, duration 8h 20min. Arrival time:`,
    options: [
      "14:55",
      "15:05",
      "15:15",
      "15:25",
    ],
    correctAnswer: 1,
    explanation: `06:45+8h=14:45. +20min=15:05.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Compound",
    question: `Water flows at 5L/min. Time to fill 350L tank:`,
    options: [
      "60 min",
      "65 min",
      "70 min",
      "80 min",
    ],
    correctAnswer: 2,
    explanation: `350÷5=70 minutes.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Scale",
    question: `Drawing scale 1:200. Real length 8m. Drawing length in cm:`,
    options: [
      "4 cm",
      "8 cm",
      "40 cm",
      "400 cm",
    ],
    correctAnswer: 0,
    explanation: `800cm÷200=4cm.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Mass",
    question: `3 bags: 2.4kg, 1.85kg, 0.75kg. Total =`,
    options: [
      "4.9kg",
      "5.0kg",
      "5.1kg",
      "5.2kg",
    ],
    correctAnswer: 1,
    explanation: `2.4+1.85+0.75=5.0kg.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Perimeter",
    question: `An isosceles triangle has base 10cm and equal sides 13cm. Perimeter =`,
    options: [
      "26 cm",
      "33 cm",
      "36 cm",
      "46 cm",
    ],
    correctAnswer: 2,
    explanation: `10+13+13=36 cm.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles",
    question: `Angles on a straight line: one is 143°. Other =`,
    options: [
      "27°",
      "37°",
      "47°",
      "57°",
    ],
    correctAnswer: 1,
    explanation: `180-143=37°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Transformations",
    question: `Scale factor 0.5, centre (0,0). Point (10,6) maps to:`,
    options: [
      "(5,3)",
      "(20,12)",
      "(10,6)",
      "(5,6)",
    ],
    correctAnswer: 0,
    explanation: `Each coord ×0.5: (5,3).`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Area",
    question: `Area of rhombus: diagonals 16cm and 10cm:`,
    options: [
      "40 cm²",
      "80 cm²",
      "100 cm²",
      "160 cm²",
    ],
    correctAnswer: 1,
    explanation: `A=(d₁×d₂)/2=(16×10)/2=80 cm².`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Nets",
    question: `Net of triangular prism has: 2 triangles + ___ rectangles.`,
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    correctAnswer: 1,
    explanation: `A triangular prism has 3 rectangular faces.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Circle",
    question: `Area of annulus: outer r=8cm, inner r=5cm (π=3.14):`,
    options: [
      "122.46 cm²",
      "128.46 cm²",
      "200.96 cm²",
      "308.96 cm²",
    ],
    correctAnswer: 0,
    explanation: `π(8²-5²)=3.14(64-25)=3.14×39=122.46 cm².`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Interior Angle",
    question: `Interior angle of regular nonagon (9 sides):`,
    options: [
      "135°",
      "140°",
      "145°",
      "160°",
    ],
    correctAnswer: 1,
    explanation: `(9-2)×180÷9=1260÷9=140°.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Pythagoras",
    question: `Right triangle hypotenuse 26cm, one leg 10cm. Other leg =`,
    options: [
      "20 cm",
      "22 cm",
      "24 cm",
      "28 cm",
    ],
    correctAnswer: 2,
    explanation: `√(676-100)=√576=24 cm.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Coordinates",
    question: `Line through (0,3) and (4,7). Gradient =`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 0,
    explanation: `(7-3)÷(4-0)=4÷4=1.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Weighted mean: 10(w=4), 20(w=6). Mean =`,
    options: [
      "14",
      "15",
      "16",
      "17",
    ],
    correctAnswer: 2,
    explanation: `(40+120)÷10=160÷10=16.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median",
    question: `Median of 8 values: 4,7,9,11,14,17,20,23 =`,
    options: [
      "11",
      "12",
      "12.5",
      "13",
    ],
    correctAnswer: 2,
    explanation: `Middle two: 11 and 14. Mean=(11+14)/2=12.5.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability",
    question: `Bag: 5red,3blue,2green. P(not red)=`,
    options: [
      "1/2",
      "3/5",
      "5/10",
      "2/5",
    ],
    correctAnswer: 0,
    explanation: `P(not red)=(3+2)/10=5/10=1/2.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Frequency Table",
    question: `x: 1(f=2),2(f=5),3(f=4),4(f=3),5(f=6). Mode =`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 2,
    explanation: `f=6 for x=5. Mode=5.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Bar Chart",
    question: `Bar chart total: A=15,B=25,C=20,D=10,E=30. P(randomly selecting E)=`,
    options: [
      "3/10",
      "1/3",
      "1/4",
      "2/5",
    ],
    correctAnswer: 0,
    explanation: `Total=100. E=30. P=30/100=3/10.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Cumulative",
    question: `Cumulative freq at 20: classes 0-10(f=6),10-20(f=9),20-30(f=12) =`,
    options: [
      "6",
      "9",
      "15",
      "21",
    ],
    correctAnswer: 2,
    explanation: `0-10+10-20=6+9=15.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Sample Space",
    question: `Two dice. P(sum=9) =`,
    options: [
      "3/36",
      "4/36",
      "5/36",
      "6/36",
    ],
    correctAnswer: 1,
    explanation: `Pairs:(3,6),(4,5),(5,4),(6,3)=4. P=4/36.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed8MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed8Questions
    : g5MathMixed8Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 8</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 8</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 8</h1>
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
