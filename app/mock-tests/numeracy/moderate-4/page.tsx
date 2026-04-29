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

const g5MathMod4Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Algebra Solve",
    question: `5x - 8 = 27. x = ?`,
    options: [
      "6",
      "7",
      "8",
      "9",
    ],
    correctAnswer: 1,
    explanation: `5x=35. x=7.`
  },
  {
    id: 2,
    type: "number",
    skill: "Algebra Expand",
    question: `Expand 4(3x + 2) =`,
    options: [
      "12x+6",
      "12x+8",
      "7x+6",
      "12x+2",
    ],
    correctAnswer: 1,
    explanation: `4×3x=12x, 4×2=8. Answer: 12x+8.`
  },
  {
    id: 3,
    type: "number",
    skill: "Substitute",
    question: `p=5, q=-2. Find 3p - 4q.`,
    options: [
      "7",
      "19",
      "23",
      "28",
    ],
    correctAnswer: 2,
    explanation: `3(5)-4(-2)=15+8=23.`
  },
  {
    id: 4,
    type: "number",
    skill: "Number Pattern",
    question: `Pattern: 1,4,9,16,25,___.`,
    options: [
      "30",
      "34",
      "36",
      "40",
    ],
    correctAnswer: 2,
    explanation: `Square numbers: 6²=36.`
  },
  {
    id: 5,
    type: "number",
    skill: "Proportion Direct",
    question: `y∝x. y=15 when x=5. y when x=9 =`,
    options: [
      "27",
      "25",
      "20",
      "18",
    ],
    correctAnswer: 0,
    explanation: `y/x=3. y=3×9=27.`
  },
  {
    id: 6,
    type: "number",
    skill: "Proportion Inverse",
    question: `y∝1/x. y=8 when x=3. y when x=12 =`,
    options: [
      "2",
      "3",
      "4",
      "6",
    ],
    correctAnswer: 0,
    explanation: `y×x=constant=24. y=24÷12=2.`
  },
  {
    id: 7,
    type: "number",
    skill: "Compound Fraction",
    question: `(3/4 + 1/2) × 8 = ?`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 1,
    explanation: `3/4+1/2=5/4. 5/4×8=10.`
  },
  {
    id: 8,
    type: "number",
    skill: "Percentage Of",
    question: `A school has 600 students. 35% are in upper school. How many?`,
    options: [
      "180",
      "190",
      "200",
      "210",
    ],
    correctAnswer: 3,
    explanation: `35%×600=0.35×600=210.`
  },
  {
    id: 9,
    type: "number",
    skill: "Ratio Comparison",
    question: `Two numbers in ratio 5:8. Smaller is 35. Larger =`,
    options: [
      "48",
      "52",
      "56",
      "60",
    ],
    correctAnswer: 2,
    explanation: `5 parts=35. Each=7. Larger=8×7=56.`
  },
  {
    id: 10,
    type: "number",
    skill: "Simple Interest",
    question: `P=$1,200, R=8%, T=3 yrs. Total amount =`,
    options: [
      "$1,440",
      "$1,488",
      "$1,488",
      "$1,500",
    ],
    correctAnswer: 1,
    explanation: `I=1200×0.08×3=$288. Total=$1200+$288=$1,488.`
  },
  {
    id: 11,
    type: "number",
    skill: "LCM Word",
    question: `Traffic lights: one changes every 4min, another every 6min, third every 9min. LCM =`,
    options: [
      "18",
      "24",
      "36",
      "54",
    ],
    correctAnswer: 2,
    explanation: `LCM(4,6,9)=36 minutes.`
  },
  {
    id: 12,
    type: "number",
    skill: "HCF Application",
    question: `Tiles 36cm×24cm. Largest square tile that fits both =`,
    options: [
      "4 cm",
      "6 cm",
      "8 cm",
      "12 cm",
    ],
    correctAnswer: 3,
    explanation: `HCF(36,24)=12 cm.`
  },
  {
    id: 13,
    type: "number",
    skill: "Number Theory",
    question: `Sum of first 10 odd numbers =`,
    options: [
      "90",
      "95",
      "100",
      "110",
    ],
    correctAnswer: 2,
    explanation: `n²=10²=100.`
  },
  {
    id: 14,
    type: "number",
    skill: "Powers",
    question: `√(9²+12²) =`,
    options: [
      "13",
      "15",
      "17",
      "21",
    ],
    correctAnswer: 1,
    explanation: `81+144=225. √225=15.`
  },
  {
    id: 15,
    type: "number",
    skill: "Multi-Step Word Problem",
    question: `A car uses 9 L per 100 km. Fuel costs $18/L. Cost of 300 km trip =`,
    options: [
      "$438",
      "$486",
      "$540",
      "$630",
    ],
    correctAnswer: 1,
    explanation: `Fuel needed=9×3=27L. Cost=27×$18=$486.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Arc Length",
    question: `Arc length: radius 6 cm, angle 90° (π=3.14):`,
    options: [
      "3.14 cm",
      "6.28 cm",
      "9.42 cm",
      "12.57 cm",
    ],
    correctAnswer: 2,
    explanation: `(90/360)×2π×6=(1/4)×37.68=9.42 cm.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Sector Area",
    question: `Sector area: radius 6cm, angle 60° (π=3.14):`,
    options: [
      "9.42 cm²",
      "18.84 cm²",
      "28.26 cm²",
      "56.52 cm²",
    ],
    correctAnswer: 1,
    explanation: `(60/360)×π×36=(1/6)×113.04=18.84 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Sphere Volume",
    question: `Sphere radius 3cm. Volume (V=4/3πr³, π=3.14):`,
    options: [
      "28.26 cm³",
      "56.52 cm³",
      "113.04 cm³",
      "339.12 cm³",
    ],
    correctAnswer: 2,
    explanation: `4/3×3.14×27=4/3×84.78=113.04 cm³.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Exchange Rate",
    question: `£1=JMD$220. Convert JMD$8,800 to £:`,
    options: [
      "£35",
      "£40",
      "£45",
      "£50",
    ],
    correctAnswer: 1,
    explanation: `8,800÷220=£40.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Density",
    question: `Density=mass÷vol. Mass=360g, Volume=120cm³. Density =`,
    options: [
      "2 g/cm³",
      "3 g/cm³",
      "4 g/cm³",
      "5 g/cm³",
    ],
    correctAnswer: 1,
    explanation: `360÷120=3 g/cm³.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Compound Cost",
    question: `3 shirts at $85 each and 2 pairs of trousers at $120 each. Total =`,
    options: [
      "$375",
      "$435",
      "$475",
      "$495",
    ],
    correctAnswer: 3,
    explanation: `3×$85=$255. 2×$120=$240. Total=$255+$240=$495.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Time Zone",
    question: `Jamaica UTC-5, London UTC+0. London time when Jamaica is 2 PM =`,
    options: [
      "7 PM",
      "8 PM",
      "9 PM",
      "10 PM",
    ],
    correctAnswer: 0,
    explanation: `2 PM + 5h = 7 PM London.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Mass Conversion",
    question: `4 bags: 1.2kg, 0.85kg, 2.3kg, 1.65kg. Total mass =`,
    options: [
      "5.8 kg",
      "6.0 kg",
      "6.2 kg",
      "6.4 kg",
    ],
    correctAnswer: 1,
    explanation: `1.2+0.85+2.3+1.65=6.0 kg.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Compound Speed",
    question: `Walk 4km at 5km/h then 6km at 3km/h. Total time =`,
    options: [
      "2h 30min",
      "2h 48min",
      "3h",
      "3h 12min",
    ],
    correctAnswer: 3,
    explanation: `Time1=4÷5=0.8h=48min. Time2=6÷3=2h. Total=2h 48min.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Percentage Mark-Up",
    question: `Cost price $350. Mark-up 40%. Selling price =`,
    options: [
      "$420",
      "$460",
      "$490",
      "$500",
    ],
    correctAnswer: 2,
    explanation: `40%×$350=$140. SP=$350+$140=$490.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angle Parallel Lines",
    question: `Parallel lines cut by transversal. Alternate angles are:`,
    options: [
      "Supplementary",
      "Complementary",
      "Equal",
      "Reflex",
    ],
    correctAnswer: 2,
    explanation: `Alternate interior/exterior angles between parallel lines are equal.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Circle Angle",
    question: `Angle at centre = 140°. Angle at circumference on same arc =`,
    options: [
      "40°",
      "60°",
      "70°",
      "80°",
    ],
    correctAnswer: 2,
    explanation: `Angle at circumference = ½ angle at centre = 70°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Bearing",
    question: `Walk due North 6 km then due East 8 km. Distance from start =`,
    options: [
      "10 km",
      "12 km",
      "14 km",
      "16 km",
    ],
    correctAnswer: 0,
    explanation: `√(6²+8²)=√(36+64)=√100=10 km.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Gradient",
    question: `Gradient of line through (0,2) and (5,12):`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `(12-2)÷(5-0)=10÷5=2.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Similar Triangles",
    question: `Triangles similar, ratio 2:5. Small area=16 cm². Large area =`,
    options: [
      "40 cm²",
      "80 cm²",
      "100 cm²",
      "200 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area ratio=(2:5)²=4:25. 16×25÷4=100 cm².`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Rhombus Area",
    question: `Rhombus diagonals 18cm and 12cm. Area =`,
    options: [
      "54 cm²",
      "108 cm²",
      "144 cm²",
      "216 cm²",
    ],
    correctAnswer: 1,
    explanation: `A=(18×12)÷2=108 cm².`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Isosceles Triangle",
    question: `Isosceles triangle: two equal angles 55° each. Third angle =`,
    options: [
      "50°",
      "60°",
      "70°",
      "80°",
    ],
    correctAnswer: 2,
    explanation: `180-55-55=70°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "3D Vertices",
    question: `Vertices of a hexagonal prism:`,
    options: [
      "6",
      "8",
      "10",
      "12",
    ],
    correctAnswer: 3,
    explanation: `2×6=12 vertices.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean From Frequency",
    question: `Values: 2(f=4), 4(f=6), 6(f=5), 8(f=5). Mean =`,
    options: [
      "4.9",
      "5.1",
      "5.3",
      "5.5",
    ],
    correctAnswer: 1,
    explanation: `(8+24+30+40)÷20=102÷20=5.1.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Cumulative Frequency",
    question: `Classes: 0-10(f=5),10-20(f=8),20-30(f=12). Cumulative freq at 20 =`,
    options: [
      "5",
      "8",
      "13",
      "25",
    ],
    correctAnswer: 2,
    explanation: `5+8=13.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability Addition",
    question: `P(A)=0.4, P(B)=0.3, mutually exclusive. P(A or B)=`,
    options: [
      "0.12",
      "0.58",
      "0.70",
      "1.0",
    ],
    correctAnswer: 2,
    explanation: `P(A∪B)=0.4+0.3=0.7.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability Multiplication",
    question: `P(A)=0.5, P(B)=0.6, independent. P(A and B)=`,
    options: [
      "0.30",
      "0.35",
      "0.40",
      "1.10",
    ],
    correctAnswer: 0,
    explanation: `P(A∩B)=0.5×0.6=0.30.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Stem and Leaf",
    question: `Stem and leaf: 2|3,5,8 and 3|1,4,6,9. Median of 7 values =`,
    options: [
      "31",
      "34",
      "36",
      "39",
    ],
    correctAnswer: 1,
    explanation: `Values: 23,25,28,31,34,36,39. Middle=34.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Histogram",
    question: `Histogram: 0-5(f=4),5-10(f=9),10-15(f=11),15-20(f=6). Total =`,
    options: [
      "25",
      "28",
      "30",
      "35",
    ],
    correctAnswer: 2,
    explanation: `4+9+11+6=30.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Expected Value",
    question: `Spinner: P(1)=0.25,P(2)=0.35,P(3)=0.40. Spin 200 times. Expected 3s =`,
    options: [
      "70",
      "75",
      "80",
      "85",
    ],
    correctAnswer: 2,
    explanation: `0.40×200=80.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod4MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod4Questions : g5MathMod4Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 4</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 4</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 4</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
