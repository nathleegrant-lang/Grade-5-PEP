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

const g5MathMod3Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Simple Algebra",
    question: `3x + 5 = 20. x = ?`,
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
    id: 2,
    type: "number",
    skill: "Algebra 2",
    question: `2(x - 3) = 14. x = ?`,
    options: [
      "8",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 2,
    explanation: `2x-6=14. 2x=20. x=10.`
  },
  {
    id: 3,
    type: "number",
    skill: "Substitution",
    question: `a=4, b=3. Find 2a + 3b.`,
    options: [
      "17",
      "18",
      "19",
      "21",
    ],
    correctAnswer: 0,
    explanation: `2(4)+3(3)=8+9=17.`
  },
  {
    id: 4,
    type: "number",
    skill: "Nth Term",
    question: `nth term = 4n - 1. When n = 6:`,
    options: [
      "22",
      "23",
      "24",
      "25",
    ],
    correctAnswer: 1,
    explanation: `4(6)-1=24-1=23.`
  },
  {
    id: 5,
    type: "number",
    skill: "Large Multiplication",
    question: `345 × 14 = ?`,
    options: [
      "4,730",
      "4,830",
      "4,930",
      "5,030",
    ],
    correctAnswer: 1,
    explanation: `345×14: 345×10=3450, 345×4=1380. 3450+1380=4,830.`
  },
  {
    id: 6,
    type: "number",
    skill: "Long Division",
    question: `3,528 ÷ 14 = ?`,
    options: [
      "242",
      "252",
      "262",
      "272",
    ],
    correctAnswer: 1,
    explanation: `3,528÷14=252. Check: 252×14=3,528.`
  },
  {
    id: 7,
    type: "number",
    skill: "Multiply Fractions",
    question: `3/5 × 5/9 = ?`,
    options: [
      "1/3",
      "8/14",
      "15/45",
      "3/4",
    ],
    correctAnswer: 0,
    explanation: `(3×5)÷(5×9)=15÷45=1/3.`
  },
  {
    id: 8,
    type: "number",
    skill: "Divide Fractions",
    question: `3/4 ÷ 3/8 = ?`,
    options: [
      "1/2",
      "1",
      "2",
      "3",
    ],
    correctAnswer: 2,
    explanation: `3/4×8/3=24/12=2.`
  },
  {
    id: 9,
    type: "number",
    skill: "Compound Percentage",
    question: `Price $400 increased 10% then decreased 10%. Final price:`,
    options: [
      "$390",
      "$396",
      "$400",
      "$404",
    ],
    correctAnswer: 1,
    explanation: `After 10% up: $440. After 10% down: $440×0.9=$396.`
  },
  {
    id: 10,
    type: "number",
    skill: "Percentage Reverse",
    question: `After 20% discount, price is $480. Original price:`,
    options: [
      "$560",
      "$580",
      "$600",
      "$640",
    ],
    correctAnswer: 2,
    explanation: `80%=$480. 100%=$480÷0.8=$600.`
  },
  {
    id: 11,
    type: "number",
    skill: "Ratio 3 parts",
    question: `Ratio 3:4:5. Total 360. Largest part =`,
    options: [
      "90",
      "108",
      "150",
      "180",
    ],
    correctAnswer: 2,
    explanation: `Parts=12, each=30. Largest=5×30=150.`
  },
  {
    id: 12,
    type: "number",
    skill: "Number Sequence",
    question: `Sequence: 2, 5, 10, 17, 26, ___.`,
    options: [
      "35",
      "37",
      "39",
      "41",
    ],
    correctAnswer: 1,
    explanation: `Differences: 3,5,7,9,11. Next=26+11=37.`
  },
  {
    id: 13,
    type: "number",
    skill: "Prime Factorisation",
    question: `Prime factorisation of 84 =`,
    options: [
      "2²×3×7",
      "2×3²×7",
      "2²×3²×7",
      "2³×3×7",
    ],
    correctAnswer: 0,
    explanation: `84=4×21=2²×3×7.`
  },
  {
    id: 14,
    type: "number",
    skill: "Square and Cube",
    question: `2³ + 3² = ?`,
    options: [
      "15",
      "17",
      "19",
      "20",
    ],
    correctAnswer: 1,
    explanation: `8+9=17.`
  },
  {
    id: 15,
    type: "number",
    skill: "Profit Percentage",
    question: `Cost $80, selling price $100. Profit % =`,
    options: [
      "20%",
      "25%",
      "30%",
      "35%",
    ],
    correctAnswer: 1,
    explanation: `Profit=$20. %=20/80×100=25%.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Surface Area Cuboid",
    question: `Cuboid 6×4×3 cm. Surface area =`,
    options: [
      "72 cm²",
      "96 cm²",
      "108 cm²",
      "144 cm²",
    ],
    correctAnswer: 2,
    explanation: `SA=2(6×4+4×3+3×6)=2(24+12+18)=2×54=108 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Circle Circumference",
    question: `Circumference of circle radius 7 cm (π=22/7):`,
    options: [
      "22 cm",
      "44 cm",
      "66 cm",
      "154 cm",
    ],
    correctAnswer: 1,
    explanation: `C=2πr=2×(22/7)×7=44 cm.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Circle Area",
    question: `Area of circle diameter 14 cm (π=22/7):`,
    options: [
      "44 cm²",
      "77 cm²",
      "154 cm²",
      "308 cm²",
    ],
    correctAnswer: 2,
    explanation: `r=7. A=πr²=(22/7)×49=154 cm².`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Speed Time",
    question: `Distance 360 km, speed 90 km/h. Time taken =`,
    options: [
      "3h",
      "3h 30min",
      "4h",
      "4h 30min",
    ],
    correctAnswer: 2,
    explanation: `360÷90=4 hours.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Scale Drawing",
    question: `Scale 1:50,000. Map distance 4 cm. Real distance =`,
    options: [
      "2 km",
      "4 km",
      "8 km",
      "20 km",
    ],
    correctAnswer: 0,
    explanation: `4×50,000=200,000cm=2 km.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Compound Cost",
    question: `Fencing costs $12/m. Rectangular field 18×14m. Total cost =`,
    options: [
      "$768",
      "$800",
      "$836",
      "$864",
    ],
    correctAnswer: 0,
    explanation: `Perimeter=2(18+14)=64m. 64×$12=$768.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Volume Prism",
    question: `Triangular prism: triangle area 24 cm², length 10 cm. Volume =`,
    options: [
      "120 cm³",
      "240 cm³",
      "360 cm³",
      "480 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=24×10=240 cm³.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Tank Capacity",
    question: `Tank is 3/4 full with 270 L. Full capacity =`,
    options: [
      "340 L",
      "350 L",
      "360 L",
      "380 L",
    ],
    correctAnswer: 2,
    explanation: `3/4=270L. Full=270÷(3/4)=360 L.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Conversion Tonnes",
    question: `3.5 tonnes in kg =`,
    options: [
      "350 kg",
      "3,500 kg",
      "35,000 kg",
      "350,000 kg",
    ],
    correctAnswer: 1,
    explanation: `1 tonne=1,000 kg. 3.5×1,000=3,500 kg.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Compound Measure",
    question: `Water flows at 6 L/min. Time to fill 330 L tank =`,
    options: [
      "50 min",
      "55 min",
      "60 min",
      "65 min",
    ],
    correctAnswer: 1,
    explanation: `330÷6=55 minutes.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angle Relationships",
    question: `Two angles are supplementary. One is 64°. Other =`,
    options: [
      "26°",
      "106°",
      "116°",
      "126°",
    ],
    correctAnswer: 2,
    explanation: `180-64=116°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Complementary Angles",
    question: `Two angles are complementary. One is 37°. Other =`,
    options: [
      "43°",
      "53°",
      "63°",
      "73°",
    ],
    correctAnswer: 1,
    explanation: `90-37=53°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Vertically Opposite",
    question: `Vertically opposite angles are always:`,
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
    id: 29,
    type: "geometry",
    skill: "Interior Angle Hexagon",
    question: `Each interior angle of a regular hexagon =`,
    options: [
      "100°",
      "110°",
      "120°",
      "130°",
    ],
    correctAnswer: 2,
    explanation: `(6-2)×180÷6=720÷6=120°.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Rotation",
    question: `Point (3,4) rotated 90° anticlockwise about origin gives:`,
    options: [
      "(-4,3)",
      "(4,-3)",
      "(-3,-4)",
      "(3,-4)",
    ],
    correctAnswer: 0,
    explanation: `90° anticlockwise: (x,y)→(-y,x). (3,4)→(-4,3).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Enlargement",
    question: `Shape enlarged scale factor 3. Original area 8 cm². New area =`,
    options: [
      "24 cm²",
      "48 cm²",
      "72 cm²",
      "96 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area scale factor=3²=9. 8×9=72 cm².`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Kite Diagonals",
    question: `Kite diagonals 16 cm and 10 cm. Area =`,
    options: [
      "40 cm²",
      "80 cm²",
      "100 cm²",
      "160 cm²",
    ],
    correctAnswer: 1,
    explanation: `A=(d₁×d₂)÷2=(16×10)÷2=80 cm².`
  },
  {
    id: 33,
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
    id: 34,
    type: "statistics",
    skill: "Frequency Mean",
    question: `Score(f): 4(f=5), 6(f=8), 8(f=7). Mean score =`,
    options: [
      "5.8",
      "6.2",
      "6.4",
      "6.6",
    ],
    correctAnswer: 1,
    explanation: `(4×5+6×8+8×7)÷20=(20+48+56)÷20=124÷20=6.2.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median Even",
    question: `Median of: 11, 3, 7, 15, 9, 13 =`,
    options: [
      "9",
      "10",
      "11",
      "12",
    ],
    correctAnswer: 1,
    explanation: `Sorted: 3,7,9,11,13,15. Middle two: 9,11. Mean=(9+11)/2=10.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Mode Multimodal",
    question: `Data: 3,5,7,3,9,7,3,7. Mode(s) =`,
    options: [
      "3 only",
      "7 only",
      "3 and 7",
      "5",
    ],
    correctAnswer: 2,
    explanation: `3 appears 3 times, 7 appears 3 times. Both are modes.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "IQR",
    question: `IQR of: 5,10,15,20,25,30,35 =`,
    options: [
      "15",
      "20",
      "25",
      "30",
    ],
    correctAnswer: 1,
    explanation: `Q1=10, Q3=30. IQR=30-10=20.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Probability Not",
    question: `Bag: 4 red, 3 blue, 3 green. P(not blue) =`,
    options: [
      "3/10",
      "7/10",
      "3/7",
      "4/10",
    ],
    correctAnswer: 1,
    explanation: `P(not blue)=7/10.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Compound Probability",
    question: `Bag: 5 red, 5 blue. Pick two with replacement. P(both red) =`,
    options: [
      "1/4",
      "1/3",
      "1/2",
      "2/5",
    ],
    correctAnswer: 0,
    explanation: `P=1/2×1/2=1/4.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Grouped Frequency",
    question: `Classes: 10-20(f=4),20-30(f=9),30-40(f=12),40-50(f=5). Modal class =`,
    options: [
      "10-20",
      "20-30",
      "30-40",
      "40-50",
    ],
    correctAnswer: 2,
    explanation: `Modal class has highest frequency=12. It's 30-40.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod3Questions : g5MathMod3Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (!started || showResults) return
    const t = setInterval(() => setTimeLeft((p) => { if (p <= 1) { setShowResults(true); return 0 } return p - 1 }), 1000)
    return () => clearInterval(t)
  }, [started, showResults])

  const handleAnswer = (idx: number) => { const a = [...answers]; a[currentQuestion] = idx; setAnswers(a) }

  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

  const getGrade = () => {
    const p = scorePct()
    if (p >= 85) return { grade: "Excellent",          color: "text-green-600" }
    if (p >= 70) return { grade: "Good",               color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",               color: "text-amber-600" }
    return              { grade: "Needs Improvement",  color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => { const i = availableQuestions.findIndex((x) => x.id === q.id); return answers[i] === q.correctAnswer }).length
    const total = sq.length
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Fair" : "Needs Improvement"
    const color  = pct >= 85 ? "text-green-600" : pct >= 70 ? "text-blue-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage: pct, rating, ratingColor: color }
  }

  const resetTest = () => { setStarted(false); setShowResults(false); setCurrentQuestion(0); setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60) }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) => t === "number" ? "Number Operations" : t === "measurement" ? "Measurement" : t === "geometry" ? "Geometry & Spatial Sense" : "Data & Probability"

  /* ── INTRO ──────────────────────────────────────────────────── */
  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/mathematics"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Mathematics Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 text-center">
            <Calculator className="mx-auto mb-4 h-14 w-14 text-slate-700" />
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 3</CardTitle>
            <p className="text-slate-600">Moderate-level practice — multi-step reasoning and real-world problem solving.</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isPremium && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Free Preview Mode</p>
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Moderate Level Focus</h3>
              <p className="text-slate-700">Multi-step operations, fraction and percentage problem solving, composite measurement, angle relationships, and data interpretation — all set at a solid NSC Grade 5 standard.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: selecting and applying the right strategy</li>
                <li>Communication: interpreting multi-step word problems</li>
                <li>Creativity: recognising number patterns and relationships</li>
                <li>Problem Solving: applying maths in realistic contexts</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-slate-700">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-slate-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-slate-700 py-6 text-lg hover:bg-slate-800">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  /* ── RESULTS ────────────────────────────────────────────────── */
  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <CardTitle className="text-2xl text-slate-800">Mathematics Test Completed</CardTitle>
              <p className="text-slate-600">Mathematics Moderate 3</p>
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
                  <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
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
                <p className="text-slate-700">This moderate test requires multi-step thinking. Review each explanation to identify which strategies you used correctly and which topics need more practice before moving to difficult level.</p>
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-sky-700">{q.skill}</span></p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.correctAnswer]}</p>
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

  /* ── TEST ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <header className="bg-slate-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/mathematics" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <Calculator className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Mathematics Moderate 3</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-green-600")}>
            <Clock className="h-5 w-5" />{formatTime(timeLeft)}
          </div>
        </div>
      </header>
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
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p>
              <p className="text-sm text-amber-700">Upgrade to Premium to access the full test.</p>
            </div>
          )}
          <Card className="mb-6 border-slate-200">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-sky-700 uppercase tracking-wide">{q.skill}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">{secLabel(q.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-lg font-medium text-slate-800 mb-6">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className={cn("w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx ? "border-slate-700 bg-slate-50" : "border-gray-200 hover:border-slate-400 hover:bg-slate-50/50")}>
                    <span className="font-medium text-slate-700 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={() => { setShowResults(true) }} className="bg-slate-700 hover:bg-slate-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-slate-700 hover:bg-slate-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-slate-200">
            <CardHeader className="py-3"><CardTitle className="text-sm text-slate-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-slate-700 text-white"
                      : answers[idx] !== null ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
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
