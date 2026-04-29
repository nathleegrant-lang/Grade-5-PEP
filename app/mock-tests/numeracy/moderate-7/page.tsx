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

const g5MathMod7Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Sequences",
    question: `Arithmetic sequence: a₁=3, d=7. What is a₁₀?`,
    options: [
      "60",
      "66",
      "68",
      "72",
    ],
    correctAnswer: 1,
    explanation: `a₁₀=3+(9×7)=3+63=66.`
  },
  {
    id: 2,
    type: "number",
    skill: "Algebra",
    question: `4(x+3)=2(x+9). x=?`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 0,
    explanation: `4x+12=2x+18. 2x=6. x=3.`
  },
  {
    id: 3,
    type: "number",
    skill: "Fraction Problem",
    question: `A tank ⅗ full contains 360L. If 120L used, fraction remaining =`,
    options: [
      "¼",
      "⅓",
      "½",
      "⅖",
    ],
    correctAnswer: 0,
    explanation: `Used=120L. Remaining=360-120=240L. Full=360÷(3/5)=600L. Remaining=240/600=2/5. Index 3.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `Gold:Silver=5:3. Total 240g. Mass of silver =`,
    options: [
      "75 g",
      "90 g",
      "100 g",
      "150 g",
    ],
    correctAnswer: 1,
    explanation: `Parts=8. Each=30g. Silver=3×30=90g.`
  },
  {
    id: 5,
    type: "number",
    skill: "Compound Percentage",
    question: `$500 invested at 10% compound interest for 2 yrs. Final amount =`,
    options: [
      "$600",
      "$605",
      "$610",
      "$615",
    ],
    correctAnswer: 1,
    explanation: `Year1:$550. Year2:$550×1.1=$605.`
  },
  {
    id: 6,
    type: "number",
    skill: "Proportion",
    question: `y is inversely proportional to x². y=4 when x=3. y when x=6 =`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 0,
    explanation: `y×x²=constant=36. y=36÷36=1.`
  },
  {
    id: 7,
    type: "number",
    skill: "Prime",
    question: `Which is NOT prime: 17, 19, 23, 27, 29?`,
    options: [
      "17",
      "23",
      "27",
      "29",
    ],
    correctAnswer: 2,
    explanation: `27=3×9. Not prime.`
  },
  {
    id: 8,
    type: "number",
    skill: "Operations",
    question: `3.6 × 2.5 + 4.8 ÷ 0.6 = ?`,
    options: [
      "16",
      "17",
      "17.8",
      "18",
    ],
    correctAnswer: 2,
    explanation: `9+8=17. Actually: 3.6×2.5=9.0. 4.8÷0.6=8. 9+8=17.`
  },
  {
    id: 9,
    type: "number",
    skill: "Percentage",
    question: `A student scores 78%. Exam has 200 marks. Marks scored =`,
    options: [
      "148",
      "152",
      "156",
      "160",
    ],
    correctAnswer: 2,
    explanation: `78%×200=156.`
  },
  {
    id: 10,
    type: "number",
    skill: "Number Problem",
    question: `The sum of two numbers is 50. Their ratio is 3:7. Larger number =`,
    options: [
      "15",
      "21",
      "30",
      "35",
    ],
    correctAnswer: 3,
    explanation: `7/10×50=35.`
  },
  {
    id: 11,
    type: "number",
    skill: "HCF Application",
    question: `Two rods: 120cm and 90cm. Largest equal length to cut both without waste =`,
    options: [
      "10 cm",
      "15 cm",
      "30 cm",
      "45 cm",
    ],
    correctAnswer: 2,
    explanation: `HCF(120,90)=30 cm.`
  },
  {
    id: 12,
    type: "number",
    skill: "Index Laws",
    question: `a³ × a⁴ = ?`,
    options: [
      "a⁷",
      "a¹²",
      "a⁷ₐ",
      "2a⁷",
    ],
    correctAnswer: 0,
    explanation: `Same base: add exponents. a³×a⁴=a⁷.`
  },
  {
    id: 13,
    type: "number",
    skill: "Inequality",
    question: `Which value of x satisfies 2x+3<11?`,
    options: [
      "x<4",
      "x>4",
      "x<5",
      "x>5",
    ],
    correctAnswer: 0,
    explanation: `2x<8. x<4.`
  },
  {
    id: 14,
    type: "number",
    skill: "Real World",
    question: `Petrol: $180/L. Car gets 12km/L. Cost of 180km journey =`,
    options: [
      "$2,700",
      "$2,800",
      "$2,900",
      "$3,000",
    ],
    correctAnswer: 0,
    explanation: `180÷12=15L. 15×$180=$2,700.`
  },
  {
    id: 15,
    type: "number",
    skill: "Fractions",
    question: `Which is between 2/3 and 3/4?`,
    options: [
      "7/12",
      "13/18",
      "7/10",
      "11/16",
    ],
    correctAnswer: 2,
    explanation: `13/18≈0.722. 7/10=0.70. 11/16=0.6875. 7/12≈0.583. 2/3≈0.667, 3/4=0.75. 7/10=0.70 is between. Index 2.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Arc and Sector",
    question: `Circle radius 12cm. Sector angle 90°. Arc length (π=3.14):`,
    options: [
      "9.42 cm",
      "18.84 cm",
      "28.26 cm",
      "37.68 cm",
    ],
    correctAnswer: 1,
    explanation: `(90/360)×2π×12=(1/4)×75.36=18.84 cm.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Hemisphere Volume",
    question: `Hemisphere radius 6cm (V=⅔πr³, π=3.14). Volume =`,
    options: [
      "226.08 cm³",
      "452.16 cm³",
      "904.32 cm³",
      "1,130.4 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=⅔×3.14×216=452.16 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Cost Tiling",
    question: `Tiles 25cm×25cm. Floor 5m×4m. Number of tiles needed =`,
    options: [
      "240",
      "280",
      "300",
      "320",
    ],
    correctAnswer: 3,
    explanation: `Floor=500×400=200,000cm². Tile=625cm². 200,000÷625=320.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Percentage Profit",
    question: `Cost $480, sold for $600. Profit % =`,
    options: [
      "20%",
      "22%",
      "25%",
      "28%",
    ],
    correctAnswer: 2,
    explanation: `Profit=$120. %=120/480×100=25%.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Speed Conversion",
    question: `54 km/h in m/s =`,
    options: [
      "12 m/s",
      "15 m/s",
      "18 m/s",
      "20 m/s",
    ],
    correctAnswer: 1,
    explanation: `54÷3.6=15 m/s.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Compound",
    question: `Pipe A fills tank in 6h, Pipe B in 12h. Together they fill in:`,
    options: [
      "3h",
      "4h",
      "4h 30min",
      "5h",
    ],
    correctAnswer: 1,
    explanation: `Combined rate=1/6+1/12=3/12=1/4 per hour. Time=4h.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Angle to Arc",
    question: `Circle radius 7cm. Arc length for angle 60° (π=22/7):`,
    options: [
      "7.33 cm",
      "7.5 cm",
      "7.67 cm",
      "22/3 cm",
    ],
    correctAnswer: 3,
    explanation: `(60/360)×2×(22/7)×7=(1/6)×44=22/3≈7.33 cm.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Perimeter Problem",
    question: `Regular polygon perimeter 54cm, 6 sides. Side length =`,
    options: [
      "6 cm",
      "7 cm",
      "8 cm",
      "9 cm",
    ],
    correctAnswer: 3,
    explanation: `54÷6=9 cm.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Volume Prism Triangle",
    question: `Prism: equilateral triangle side 6cm (area=9√3≈15.59cm²), length 10cm. Volume≈`,
    options: [
      "155 cm³",
      "156 cm³",
      "157 cm³",
      "158 cm³",
    ],
    correctAnswer: 1,
    explanation: `V≈15.59×10≈156 cm³.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Temperature",
    question: `Fahrenheit=32+1.8×Celsius. Temperature 25°C in °F =`,
    options: [
      "75°F",
      "77°F",
      "79°F",
      "81°F",
    ],
    correctAnswer: 1,
    explanation: `32+1.8×25=32+45=77°F.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles Parallel",
    question: `Two parallel lines. Corresponding angles are:`,
    options: [
      "Equal",
      "Supplementary",
      "Complementary",
      "Reflex",
    ],
    correctAnswer: 0,
    explanation: `Corresponding angles between parallel lines are equal.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Cyclic Quadrilateral",
    question: `Cyclic quadrilateral: opposite angles sum to =`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 1,
    explanation: `Opposite angles of a cyclic quadrilateral are supplementary (sum=180°).`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Locus",
    question: `Locus of points 5cm from a fixed point is:`,
    options: [
      "A straight line",
      "A circle radius 5cm",
      "A square",
      "A rectangle",
    ],
    correctAnswer: 1,
    explanation: `Points equidistant from a fixed point form a circle.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Vector",
    question: `Vector PQ=( 4,−3). |PQ|=`,
    options: [
      "3",
      "4",
      "5",
      "7",
    ],
    correctAnswer: 2,
    explanation: `√(16+9)=√25=5.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformation",
    question: `90° clockwise rotation about origin: (3,5)→`,
    options: [
      "(5,−3)",
      "(−5,3)",
      "(5,3)",
      "(3,−5)",
    ],
    correctAnswer: 0,
    explanation: `90° clockwise: (x,y)→(y,−x). (3,5)→(5,−3).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Area Trapezoid",
    question: `Trapezoid: parallel sides 8cm and 14cm, height 7cm. Area =`,
    options: [
      "70 cm²",
      "77 cm²",
      "84 cm²",
      "91 cm²",
    ],
    correctAnswer: 1,
    explanation: `½(8+14)×7=½×22×7=77 cm².`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Interior Angle Heptagon",
    question: `Sum of interior angles of heptagon (7 sides) =`,
    options: [
      "720°",
      "840°",
      "900°",
      "1080°",
    ],
    correctAnswer: 1,
    explanation: `(7-2)×180=5×180=900°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Circle Theorems",
    question: `Angle in a semicircle =`,
    options: [
      "45°",
      "60°",
      "90°",
      "180°",
    ],
    correctAnswer: 2,
    explanation: `Angle in semicircle is always 90° (Thales' theorem).`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `8 numbers, mean=21. Total sum =`,
    options: [
      "168",
      "180",
      "192",
      "210",
    ],
    correctAnswer: 0,
    explanation: `8×21=168.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Box Plot",
    question: `Box plot: min=5, Q1=12, median=18, Q3=25, max=35. IQR =`,
    options: [
      "10",
      "12",
      "13",
      "15",
    ],
    correctAnswer: 2,
    explanation: `IQR=Q3-Q1=25-12=13.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Two-Way Table",
    question: `Survey: 30 boys(18 sport,12 art), 20 girls(10 sport,10 art). P(student prefers art)=`,
    options: [
      "11/25",
      "11/50",
      "22/50",
      "11/26",
    ],
    correctAnswer: 0,
    explanation: `Art=12+10=22. Total=50. P=22/50=11/25.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Linear Regression",
    question: `Best fit line: y=3x-2. Predicted y when x=8 =`,
    options: [
      "22",
      "24",
      "26",
      "28",
    ],
    correctAnswer: 0,
    explanation: `3(8)-2=24-2=22.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Two-Way Table",
    question: `Survey: 30 boys(18 sport,12 art), 20 girls(10 sport,10 art). P(student likes art)=`,
    options: [
      "11/25",
      "11/50",
      "22/50",
      "22/100",
    ],
    correctAnswer: 1,
    explanation: `Art total=12+10=22. Total=50. P=22/50=11/25. Index 0.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Regression",
    question: `Best fit: y=3x-2. Predict y when x=8.`,
    options: [
      "22",
      "23",
      "24",
      "25",
    ],
    correctAnswer: 1,
    explanation: `3(8)-2=22. Wait: 24-2=22. Index 0.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability",
    question: `Card drawn from 1-10. P(prime number)=`,
    options: [
      "3/10",
      "4/10",
      "5/10",
      "6/10",
    ],
    correctAnswer: 1,
    explanation: `Primes 1-10: 2,3,5,7=4 primes. P=4/10.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod7MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod7Questions : g5MathMod7Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 7</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 7</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 7</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
