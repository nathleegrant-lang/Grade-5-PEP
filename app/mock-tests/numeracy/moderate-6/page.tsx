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

const g5MathMod6Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Algebra",
    question: `7x - 3 = 4x + 9. x = ?`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 1,
    explanation: `3x=12. x=4.`
  },
  {
    id: 2,
    type: "number",
    skill: "Sequences",
    question: `GP: 2, 6, 18, 54, ___.`,
    options: [
      "108",
      "126",
      "162",
      "216",
    ],
    correctAnswer: 2,
    explanation: `×3 each time. 54×3=162.`
  },
  {
    id: 3,
    type: "number",
    skill: "Fractions",
    question: `(5/6) ÷ (5/18) = ?`,
    options: [
      "1/3",
      "1",
      "3",
      "5/3",
    ],
    correctAnswer: 2,
    explanation: `5/6×18/5=90/30=3.`
  },
  {
    id: 4,
    type: "number",
    skill: "Percentages",
    question: `VAT at 16.5% on $800. VAT amount =`,
    options: [
      "$120",
      "$130",
      "$132",
      "$140",
    ],
    correctAnswer: 2,
    explanation: `0.165×800=$132.`
  },
  {
    id: 5,
    type: "number",
    skill: "Ratio Proportion",
    question: `Map 1:25,000. Real distance 10km. Map distance in cm =`,
    options: [
      "4 cm",
      "10 cm",
      "40 cm",
      "400 cm",
    ],
    correctAnswer: 2,
    explanation: `10km=1,000,000cm. ÷25,000=40cm.`
  },
  {
    id: 6,
    type: "number",
    skill: "Powers",
    question: `(3²)³ = ?`,
    options: [
      "27",
      "81",
      "243",
      "729",
    ],
    correctAnswer: 3,
    explanation: `3²=9. 9³=729.`
  },
  {
    id: 7,
    type: "number",
    skill: "Number Line",
    question: `Order from least to greatest: -3, 2, -5, 0, 4.`,
    options: [
      "−5,−3,0,2,4",
      "−3,−5,0,2,4",
      "0,−3,−5,2,4",
      "2,4,0,−3,−5",
    ],
    correctAnswer: 0,
    explanation: `On number line: -5<-3<0<2<4.`
  },
  {
    id: 8,
    type: "number",
    skill: "Fraction Equation",
    question: `x/4 = 3/8. x = ?`,
    options: [
      "3/2",
      "6/4",
      "3/4",
      "6/8",
    ],
    correctAnswer: 0,
    explanation: `x=4×3/8=12/8=3/2.`
  },
  {
    id: 9,
    type: "number",
    skill: "Percentage Problem",
    question: `60% of a class passed. 18 students passed. Total class size =`,
    options: [
      "25",
      "28",
      "30",
      "32",
    ],
    correctAnswer: 2,
    explanation: `60%=18. 100%=18÷0.6=30.`
  },
  {
    id: 10,
    type: "number",
    skill: "Compound",
    question: `A car travels 150km then 200km. Average speed for whole trip if times are 2h and 2.5h:`,
    options: [
      "75 km/h",
      "77.8 km/h",
      "80 km/h",
      "85 km/h",
    ],
    correctAnswer: 1,
    explanation: `Total=350km. Time=4.5h. 350÷4.5≈77.8km/h.`
  },
  {
    id: 11,
    type: "number",
    skill: "HCF LCM",
    question: `HCF of 60 and 90 =`,
    options: [
      "10",
      "15",
      "18",
      "30",
    ],
    correctAnswer: 3,
    explanation: `60=2²×3×5. 90=2×3²×5. HCF=2×3×5=30.`
  },
  {
    id: 12,
    type: "number",
    skill: "Square Root",
    question: `√(100 + 44) = ?`,
    options: [
      "10",
      "11",
      "12",
      "13",
    ],
    correctAnswer: 2,
    explanation: `√144=12.`
  },
  {
    id: 13,
    type: "number",
    skill: "Word Problem",
    question: `3 workers build a wall in 8 days. 4 workers take how many days?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 2,
    explanation: `Person-days=24. 24÷4=6 days.`
  },
  {
    id: 14,
    type: "number",
    skill: "Decimal Operations",
    question: `0.4 × 0.25 = ?`,
    options: [
      "0.001",
      "0.01",
      "0.1",
      "1",
    ],
    correctAnswer: 2,
    explanation: `4×25=100. 3 decimal places: 0.100=0.1.`
  },
  {
    id: 15,
    type: "number",
    skill: "Substitution",
    question: `m=−3, n=4. Find m² − 2n.`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 0,
    explanation: `9-8=1.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Area Ring",
    question: `Annulus: outer r=10cm, inner r=6cm (π=3.14). Area =`,
    options: [
      "100.48 cm²",
      "150.72 cm²",
      "200.96 cm²",
      "251.2 cm²",
    ],
    correctAnswer: 2,
    explanation: `π(10²-6²)=3.14×64=200.96 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Volume Cone",
    question: `Cone: r=6cm, h=14cm (V=⅓πr², π=22/7). Volume =`,
    options: [
      "264 cm³",
      "528 cm³",
      "792 cm³",
      "1,056 cm³",
    ],
    correctAnswer: 1,
    explanation: `⅓×(22/7)×36×14=⅓×1,584=528 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Compound Rate",
    question: `Pipe fills 80L/min. Drain empties 35L/min. Net fill per hour =`,
    options: [
      "2,400 L/h",
      "2,700 L/h",
      "3,000 L/h",
      "3,600 L/h",
    ],
    correctAnswer: 1,
    explanation: `Net=45L/min. 45×60=2,700L/h.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Path Area",
    question: `Rectangular garden 12m×8m. A 2m wide path runs around the outside. Path area =`,
    options: [
      "80 m²",
      "84 m²",
      "88 m²",
      "96 m²",
    ],
    correctAnswer: 2,
    explanation: `Outer=(12+4)×(8+4)=16×12=192. Garden=96. Path=192-96=96. Wait: 96. Index 3.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Money Exchange",
    question: `US$1=JMD$155. How many USD for JMD$6,200?`,
    options: [
      "$36",
      "$40",
      "$44",
      "$48",
    ],
    correctAnswer: 1,
    explanation: `6,200÷155=$40.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Sector Perimeter",
    question: `Sector: radius 9cm, angle 120° (π=3.14). Perimeter =`,
    options: [
      "36.84 cm",
      "37.68 cm",
      "38.52 cm",
      "39.36 cm",
    ],
    correctAnswer: 0,
    explanation: `Arc=(120/360)×2π×9=(1/3)×56.52=18.84. Total=18.84+9+9=36.84 cm.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Conversion",
    question: `5.4 km in metres =`,
    options: [
      "54 m",
      "540 m",
      "5,400 m",
      "54,000 m",
    ],
    correctAnswer: 2,
    explanation: `5.4×1000=5,400m.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Speed",
    question: `Cyclist: 48km in 1h 20min. Average speed =`,
    options: [
      "30 km/h",
      "32 km/h",
      "36 km/h",
      "40 km/h",
    ],
    correctAnswer: 2,
    explanation: `1h20min=4/3h. 48÷(4/3)=48×3/4=36km/h.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Temperature Change",
    question: `-8°C rises 23°. New temperature =`,
    options: [
      "13°C",
      "14°C",
      "15°C",
      "16°C",
    ],
    correctAnswer: 2,
    explanation: `-8+23=15°C.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Volume Conversion",
    question: `A tank 2m×1.5m×0.8m. Volume in litres =`,
    options: [
      "1,200 L",
      "2,000 L",
      "2,400 L",
      "3,000 L",
    ],
    correctAnswer: 2,
    explanation: `V=2×1.5×0.8=2.4m³=2,400L.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles",
    question: `Sum of angles at a point =`,
    options: [
      "180°",
      "270°",
      "360°",
      "540°",
    ],
    correctAnswer: 2,
    explanation: `Angles at a point always sum to 360°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Similar Shapes",
    question: `Rectangle enlarged by scale factor 3. Original perimeter 20 cm. New perimeter =`,
    options: [
      "40 cm",
      "60 cm",
      "80 cm",
      "100 cm",
    ],
    correctAnswer: 1,
    explanation: `New perimeter=20×3=60 cm.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry",
    question: `Right triangle: opposite=5cm, hyp=13cm. sin(angle)=`,
    options: [
      "5/13",
      "12/13",
      "5/12",
      "13/5",
    ],
    correctAnswer: 0,
    explanation: `sin=opposite/hypotenuse=5/13.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Angle Bisector",
    question: `Angle bisector divides angle of 84° into two equal parts. Each =`,
    options: [
      "32°",
      "38°",
      "42°",
      "48°",
    ],
    correctAnswer: 2,
    explanation: `84÷2=42°.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "3D Surface Area",
    question: `Cube side 8cm. Total surface area =`,
    options: [
      "64 cm²",
      "192 cm²",
      "320 cm²",
      "384 cm²",
    ],
    correctAnswer: 3,
    explanation: `6×8×8=384 cm².`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Coordinate Distance",
    question: `Distance between (1,1) and (4,5):`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 2,
    explanation: `√((4-1)²+(5-1)²)=√(9+16)=√25=5.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Angles Pentagon",
    question: `Sum of exterior angles of any convex polygon =`,
    options: [
      "180°",
      "270°",
      "360°",
      "540°",
    ],
    correctAnswer: 2,
    explanation: `Sum of exterior angles of any convex polygon=360°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Bearing",
    question: `Bearing of 270° is due:`,
    options: [
      "North",
      "South",
      "East",
      "West",
    ],
    correctAnswer: 3,
    explanation: `270° bearing is due West.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean Grouped",
    question: `Classes: 10-20(f=5,midpt=15),20-30(f=10,midpt=25),30-40(f=5,midpt=35). Estimated mean =`,
    options: [
      "22",
      "25",
      "27",
      "30",
    ],
    correctAnswer: 1,
    explanation: `(5×15+10×25+5×35)÷20=(75+250+175)÷20=500÷20=25.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "IQR",
    question: `Ordered data: 6,8,11,14,17,20,23. IQR =`,
    options: [
      "11",
      "12",
      "13",
      "14",
    ],
    correctAnswer: 1,
    explanation: `Q1=8, Q3=20. IQR=20-8=12.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability Tree",
    question: `Bag:3red,2blue. Pick one, replace, pick again. P(red then blue)=`,
    options: [
      "6/25",
      "4/25",
      "6/10",
      "2/25",
    ],
    correctAnswer: 0,
    explanation: `3/5×2/5=6/25.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Normal Dist Concept",
    question: `In a normal distribution, mean=median=mode. This data is =`,
    options: [
      "Skewed left",
      "Skewed right",
      "Symmetric",
      "Bimodal",
    ],
    correctAnswer: 2,
    explanation: `Equal mean/median/mode indicates symmetric distribution.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Frequency",
    question: `Bar chart: A=24,B=36,C=18,D=12. Total =`,
    options: [
      "80",
      "85",
      "90",
      "95",
    ],
    correctAnswer: 2,
    explanation: `24+36+18+12=90.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Correlation",
    question: `Height and shoe size: as height increases, shoe size increases. This is:`,
    options: [
      "Negative correlation",
      "No correlation",
      "Positive correlation",
      "Random",
    ],
    correctAnswer: 2,
    explanation: `Both increase together = positive correlation.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability",
    question: `Letters A,B,C,D each written on separate cards. P(vowel drawn)=`,
    options: [
      "1/4",
      "2/4",
      "1/2",
      "3/4",
    ],
    correctAnswer: 0,
    explanation: `Vowels: A=1. Total=4. P=1/4.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod6MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod6Questions : g5MathMod6Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 6</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 6</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 6</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
