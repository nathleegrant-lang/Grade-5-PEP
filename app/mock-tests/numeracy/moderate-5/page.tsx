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

const g5MathMod5Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Operations",
    question: `(8+7)×4 - 20÷5 = ?`,
    options: [
      "52",
      "56",
      "60",
      "64",
    ],
    correctAnswer: 1,
    explanation: `Brackets:15×4=60. 20÷5=4. 60-4=56.`
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
      "17/24",
    ],
    correctAnswer: 1,
    explanation: `LCD=24: 21/24-10/24=11/24.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentages",
    question: `A price of $650 is reduced by 18%. Sale price =`,
    options: [
      "$513",
      "$523",
      "$533",
      "$543",
    ],
    correctAnswer: 2,
    explanation: `18%×650=$117. $650-$117=$533.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `Share 560 in ratio 3:4:7. Largest share =`,
    options: [
      "168",
      "224",
      "280",
      "196",
    ],
    correctAnswer: 2,
    explanation: `Parts=14, each=40. Largest=7×40=280.`
  },
  {
    id: 5,
    type: "number",
    skill: "Powers",
    question: `5² + 2⁴ - 3³ = ?`,
    options: [
      "10",
      "12",
      "14",
      "18",
    ],
    correctAnswer: 2,
    explanation: `25+16-27=14.`
  },
  {
    id: 6,
    type: "number",
    skill: "Proportion",
    question: `If 3 kg of rice costs $120, 8 kg costs:`,
    options: [
      "$290",
      "$300",
      "$310",
      "$320",
    ],
    correctAnswer: 3,
    explanation: `$120÷3=$40/kg. 8×$40=$320.`
  },
  {
    id: 7,
    type: "number",
    skill: "Integers",
    question: `(-5)² - (-3)³ = ?`,
    options: [
      "2",
      "25+27=52",
      "52",
      "25",
    ],
    correctAnswer: 2,
    explanation: `(-5)²=25. (-3)³=-27. 25-(-27)=52.`
  },
  {
    id: 8,
    type: "number",
    skill: "Algebraic",
    question: `Solve: 3(2x-1) = 15. x = ?`,
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    correctAnswer: 1,
    explanation: `6x-3=15. 6x=18. x=3.`
  },
  {
    id: 9,
    type: "number",
    skill: "Sequences",
    question: `AP: first term 6, common difference 5. 8th term =`,
    options: [
      "40",
      "41",
      "42",
      "43",
    ],
    correctAnswer: 1,
    explanation: `a+(n-1)d=6+7×5=6+35=41.`
  },
  {
    id: 10,
    type: "number",
    skill: "Percentage",
    question: `Price increased from $80 to $100. % increase =`,
    options: [
      "20%",
      "25%",
      "30%",
      "40%",
    ],
    correctAnswer: 1,
    explanation: `Increase=$20. %=20/80×100=25%.`
  },
  {
    id: 11,
    type: "number",
    skill: "Fraction Problem",
    question: `A school day is 7 hours. 2/7 of the day is breaks. Hours of lessons =`,
    options: [
      "4 h",
      "5 h",
      "6 h",
      "7 h",
    ],
    correctAnswer: 1,
    explanation: `Breaks=2/7×7=2h. Lessons=7-2=5h.`
  },
  {
    id: 12,
    type: "number",
    skill: "Mixed Number",
    question: `2⅔ × 1½ = ?`,
    options: [
      "3",
      "4",
      "4½",
      "5",
    ],
    correctAnswer: 1,
    explanation: `8/3×3/2=24/6=4.`
  },
  {
    id: 13,
    type: "number",
    skill: "Compound Interest",
    question: `$600 at 5% compound for 2 years. Final amount =`,
    options: [
      "$661.50",
      "$662.50",
      "$663.50",
      "$664.50",
    ],
    correctAnswer: 0,
    explanation: `Year1: 630. Year2: 630×1.05=661.50.`
  },
  {
    id: 14,
    type: "number",
    skill: "Division Decimals",
    question: `6.4 ÷ 0.8 = ?`,
    options: [
      "0.8",
      "8",
      "80",
      "800",
    ],
    correctAnswer: 1,
    explanation: `6.4÷0.8=64÷8=8.`
  },
  {
    id: 15,
    type: "number",
    skill: "Number Theory",
    question: `Identify the prime: 91, 97, 99, 111.`,
    options: [
      "91",
      "97",
      "99",
      "111",
    ],
    correctAnswer: 1,
    explanation: `97 has no factors other than 1 and itself.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Composite Perimeter",
    question: `A semi-circle of diameter 20cm. Perimeter (π=3.14):`,
    options: [
      "51.4 cm",
      "60 cm",
      "62.8 cm",
      "71.4 cm",
    ],
    correctAnswer: 0,
    explanation: `Half circumference=π×10=31.4. Plus diameter=20. Total=51.4 cm.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume Rectangular",
    question: `Cuboid 12×8×5cm. Volume =`,
    options: [
      "160 cm³",
      "320 cm³",
      "480 cm³",
      "960 cm³",
    ],
    correctAnswer: 2,
    explanation: `12×8×5=480 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed ms",
    question: `90 km/h in m/s =`,
    options: [
      "15 m/s",
      "20 m/s",
      "25 m/s",
      "30 m/s",
    ],
    correctAnswer: 2,
    explanation: `90÷3.6=25 m/s.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Mass Units",
    question: `Which is heaviest: 2.5 kg, 2,400 g, 0.003 tonnes, 2,350 g?`,
    options: [
      "2.5 kg",
      "2,400 g",
      "0.003 tonnes",
      "2,350 g",
    ],
    correctAnswer: 2,
    explanation: `0.003 tonnes=3,000g. This is the heaviest.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Percentage Area",
    question: `Room 10m×8m. Carpet covers 3/4 of floor. Carpet area =`,
    options: [
      "50 m²",
      "60 m²",
      "70 m²",
      "80 m²",
    ],
    correctAnswer: 1,
    explanation: `Total=80m². 3/4×80=60 m².`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Rate",
    question: `Tap fills 5L/min. Time to fill 300L tank =`,
    options: [
      "55 min",
      "60 min",
      "65 min",
      "70 min",
    ],
    correctAnswer: 1,
    explanation: `300÷5=60 minutes.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Conversion",
    question: `1 mile=1.6 km. 12 miles in km =`,
    options: [
      "18.2 km",
      "19.2 km",
      "20.2 km",
      "21.2 km",
    ],
    correctAnswer: 1,
    explanation: `12×1.6=19.2 km.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Profit Margin",
    question: `Cost $250, revenue $325. Profit margin %=`,
    options: [
      "25%",
      "28%",
      "30%",
      "35%",
    ],
    correctAnswer: 2,
    explanation: `Profit=$75. %=75/250×100=30%.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Surface Area Cylinder",
    question: `Cylinder r=4cm, h=9cm. Total SA (π=3.14):`,
    options: [
      "326.56 cm²",
      "351.68 cm²",
      "376.80 cm²",
      "401.92 cm²",
    ],
    correctAnswer: 0,
    explanation: `SA=2πr(r+h)=2×3.14×4×13=326.56 cm².`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Speed Problem",
    question: `Train 300m long passes pole in 15s. Speed in m/s =`,
    options: [
      "15 m/s",
      "20 m/s",
      "25 m/s",
      "30 m/s",
    ],
    correctAnswer: 1,
    explanation: `300÷15=20 m/s.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles on Line",
    question: `Two angles on a straight line: one is 127°. Other =`,
    options: [
      "43°",
      "53°",
      "63°",
      "73°",
    ],
    correctAnswer: 1,
    explanation: `180-127=53°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Quadrilateral",
    question: `Parallelogram angles: one angle is 70°. Adjacent angle =`,
    options: [
      "70°",
      "100°",
      "110°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Adjacent angles in parallelogram are supplementary. 180-70=110°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Interior Angle",
    question: `Interior angle of regular octagon =`,
    options: [
      "120°",
      "130°",
      "135°",
      "140°",
    ],
    correctAnswer: 2,
    explanation: `(8-2)×180÷8=1080÷8=135°.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Chord",
    question: `Chord in circle radius 10cm, distance 6cm from centre. Chord length =`,
    options: [
      "8 cm",
      "14 cm",
      "16 cm",
      "20 cm",
    ],
    correctAnswer: 2,
    explanation: `Half-chord=√(100-36)=√64=8. Chord=16 cm.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Prism Edges",
    question: `Edges of a pentagonal prism:`,
    options: [
      "10",
      "12",
      "15",
      "20",
    ],
    correctAnswer: 2,
    explanation: `5 on each pentagonal face (×2) + 5 lateral = 15 edges.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Transformations",
    question: `Scale factor ½, centre origin. (8,6) maps to:`,
    options: [
      "(4,3)",
      "(16,12)",
      "(4,6)",
      "(8,3)",
    ],
    correctAnswer: 0,
    explanation: `Each coord×½: (4,3).`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Angle Triangle",
    question: `Triangle angles in ratio 1:2:3. Largest =`,
    options: [
      "30°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `6 parts=180°. Each=30°. Largest=3×30=90°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Coordinates Midpoint",
    question: `Midpoint of (1,7) and (9,3) =`,
    options: [
      "(4,5)",
      "(5,5)",
      "(5,4)",
      "(4,4)",
    ],
    correctAnswer: 1,
    explanation: `((1+9)/2,(7+3)/2)=(5,5).`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Weights: 48,52,55,49,56,50. Mean =`,
    options: [
      "51",
      "52",
      "53",
      "54",
    ],
    correctAnswer: 1,
    explanation: `(48+52+55+49+56+50)÷6=310÷6≈51.7≈52.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Median Even Set",
    question: `Median of: 4,7,10,13,16,19,22,25 =`,
    options: [
      "13",
      "14",
      "14.5",
      "15",
    ],
    correctAnswer: 2,
    explanation: `8 values. Middle two: 13 and 16. Median=(13+16)/2=14.5.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Frequency Table",
    question: `x:1(f=3),2(f=7),3(f=5),4(f=5). Mode =`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `Mode=value with highest frequency. f=7 for x=2. Mode=2.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability Complement",
    question: `P(event)=3/7. P(not event)=`,
    options: [
      "4/7",
      "3/4",
      "7/3",
      "1/7",
    ],
    correctAnswer: 0,
    explanation: `P(not)=1-3/7=4/7.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Combined Mean",
    question: `Group A: n=8, mean=15. Group B: n=12, mean=20. Combined mean =`,
    options: [
      "16",
      "17",
      "18",
      "19",
    ],
    correctAnswer: 2,
    explanation: `(8×15+12×20)÷20=(120+240)÷20=360÷20=18.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Scatter Graph",
    question: `Scatter graph: points slope downward left to right. Correlation =`,
    options: [
      "Positive",
      "Negative",
      "Zero",
      "Perfect positive",
    ],
    correctAnswer: 1,
    explanation: `Downward slope = negative correlation.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability",
    question: `Standard deck 52 cards. P(red king)=`,
    options: [
      "1/26",
      "1/13",
      "2/52",
      "1/52",
    ],
    correctAnswer: 0,
    explanation: `Red kings=2. P=2/52=1/26.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod5Questions : g5MathMod5Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Mathematics",
        testName: "Moderate 5",
        difficulty: "Moderate",
        score: calcScore(),
        totalQuestions,
        percentage: scorePct(),
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    }
  }

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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 5</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 5</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 5</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
