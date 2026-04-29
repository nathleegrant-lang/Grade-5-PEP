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

const g5MathMod2Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Integers",
    question: `-9 + 14 = ?`,
    options: [
      "5",
      "6",
      "23",
      "-5",
    ],
    correctAnswer: 0,
    explanation: `-9+14=5. Moving 14 places right from -9.`
  },
  {
    id: 2,
    type: "number",
    skill: "Integers",
    question: `-6 × 4 = ?`,
    options: [
      "-24",
      "-10",
      "10",
      "24",
    ],
    correctAnswer: 0,
    explanation: `Negative × positive = negative. 6×4=24. Answer=-24.`
  },
  {
    id: 3,
    type: "number",
    skill: "Multiplication",
    question: `235 × 7 = ?`,
    options: [
      "1,555",
      "1,645",
      "1,685",
      "1,745",
    ],
    correctAnswer: 1,
    explanation: `200×7=1400, 35×7=245. Total=1,645.`
  },
  {
    id: 4,
    type: "number",
    skill: "Division",
    question: `1,440 ÷ 12 = ?`,
    options: [
      "110",
      "115",
      "120",
      "125",
    ],
    correctAnswer: 2,
    explanation: `1,440÷12=120. Check: 120×12=1,440.`
  },
  {
    id: 5,
    type: "number",
    skill: "Unlike Fractions",
    question: `2/3 + 3/8 = ?`,
    options: [
      "5/11",
      "25/24",
      "1 1/24",
      "1 3/8",
    ],
    correctAnswer: 2,
    explanation: `LCD=24: 16/24+9/24=25/24=1 1/24.`
  },
  {
    id: 6,
    type: "number",
    skill: "Subtract Mixed",
    question: `4 1/2 - 1 3/4 = ?`,
    options: [
      "2 1/4",
      "2 3/4",
      "3 1/4",
      "3 3/4",
    ],
    correctAnswer: 1,
    explanation: `9/2-7/4=18/4-7/4=11/4=2 3/4.`
  },
  {
    id: 7,
    type: "number",
    skill: "Percentage Increase",
    question: `Increase $240 by 25%.`,
    options: [
      "$260",
      "$280",
      "$290",
      "$300",
    ],
    correctAnswer: 3,
    explanation: `25%×240=$60. $240+$60=$300.`
  },
  {
    id: 8,
    type: "number",
    skill: "Ratio Share",
    question: `Share $180 in ratio 2:3. Larger share =`,
    options: [
      "$72",
      "$90",
      "$108",
      "$120",
    ],
    correctAnswer: 2,
    explanation: `Parts=5, each=$36. Larger=3×$36=$108.`
  },
  {
    id: 9,
    type: "number",
    skill: "HCF",
    question: `HCF of 36 and 54 =`,
    options: [
      "6",
      "9",
      "12",
      "18",
    ],
    correctAnswer: 3,
    explanation: `Factors of 36:…18. Factors of 54:…18. HCF=18.`
  },
  {
    id: 10,
    type: "number",
    skill: "Proportion Word",
    question: `5 workers take 12 days. 10 workers take =`,
    options: [
      "5 days",
      "6 days",
      "8 days",
      "10 days",
    ],
    correctAnswer: 1,
    explanation: `Inverse proportion: 5×12=60 person-days. 60÷10=6 days.`
  },
  {
    id: 11,
    type: "number",
    skill: "Fraction × Whole",
    question: `3/7 of 49 = ?`,
    options: [
      "15",
      "18",
      "21",
      "27",
    ],
    correctAnswer: 2,
    explanation: `3/7×49=(3×49)÷7=147÷7=21.`
  },
  {
    id: 12,
    type: "number",
    skill: "Percentage of Fraction",
    question: `Write 9/20 as a percentage.`,
    options: [
      "40%",
      "42%",
      "45%",
      "48%",
    ],
    correctAnswer: 2,
    explanation: `9÷20×100=45%.`
  },
  {
    id: 13,
    type: "number",
    skill: "Power",
    question: `4³ = ?`,
    options: [
      "16",
      "48",
      "64",
      "256",
    ],
    correctAnswer: 2,
    explanation: `4×4×4=64.`
  },
  {
    id: 14,
    type: "number",
    skill: "Order of Ops",
    question: `(6+4)×3 - 12÷4 = ?`,
    options: [
      "24",
      "27",
      "28",
      "30",
    ],
    correctAnswer: 1,
    explanation: `Brackets: 10×3=30. 12÷4=3. 30-3=27.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `Tickets cost $18 each. A group buys 9. Total cost:`,
    options: [
      "$142",
      "$152",
      "$162",
      "$172",
    ],
    correctAnswer: 2,
    explanation: `9×$18=$162.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Composite Area",
    question: `L-shape: outer rectangle 10×8m, inner rectangular cut 4×3m. Area =`,
    options: [
      "44 m²",
      "56 m²",
      "68 m²",
      "80 m²",
    ],
    correctAnswer: 2,
    explanation: `10×8=80. 4×3=12. 80-12=68 m².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Cylinder Volume",
    question: `Cylinder radius 5cm, height 10cm. Volume (π=3.14):`,
    options: [
      "157 cm³",
      "314 cm³",
      "785 cm³",
      "1,570 cm³",
    ],
    correctAnswer: 2,
    explanation: `π×25×10=3.14×250=785 cm³.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed Distance",
    question: `Car at 80 km/h for 2.5 hours. Distance =`,
    options: [
      "160 km",
      "180 km",
      "200 km",
      "220 km",
    ],
    correctAnswer: 2,
    explanation: `80×2.5=200 km.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Conversion kg",
    question: `5 kg 300 g in grams =`,
    options: [
      "5,030 g",
      "5,300 g",
      "53,000 g",
      "530 g",
    ],
    correctAnswer: 1,
    explanation: `5×1000+300=5,300 g.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Money Profit",
    question: `Buy at $60 each, sell at $75 each. Profit on 20 items =`,
    options: [
      "$250",
      "$275",
      "$300",
      "$325",
    ],
    correctAnswer: 2,
    explanation: `Profit per item=$15. 20×$15=$300.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time Seconds",
    question: `3 minutes 45 seconds in seconds =`,
    options: [
      "205 s",
      "215 s",
      "225 s",
      "235 s",
    ],
    correctAnswer: 2,
    explanation: `3×60+45=180+45=225 s.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Capacity",
    question: `How many 250 mL cups from 3.5 L?`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 2,
    explanation: `3,500÷250=14 cups.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Triangle Area",
    question: `Triangle: base 14 cm, height 9 cm. Area =`,
    options: [
      "54 cm²",
      "63 cm²",
      "126 cm²",
      "252 cm²",
    ],
    correctAnswer: 1,
    explanation: `½×14×9=63 cm².`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Conversion km",
    question: `7,500 m = ? km`,
    options: [
      "0.75 km",
      "7.5 km",
      "75 km",
      "750 km",
    ],
    correctAnswer: 1,
    explanation: `7,500÷1,000=7.5 km.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Perimeter Equilateral",
    question: `Perimeter of equilateral triangle, side 11 cm =`,
    options: [
      "22 cm",
      "30 cm",
      "33 cm",
      "44 cm",
    ],
    correctAnswer: 2,
    explanation: `3×11=33 cm.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angle Sum Triangle",
    question: `Two angles of a triangle are 48° and 72°. Third angle =`,
    options: [
      "50°",
      "60°",
      "70°",
      "80°",
    ],
    correctAnswer: 1,
    explanation: `180-48-72=60°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Quadrilateral Angles",
    question: `Three angles of a quadrilateral: 95°, 85°, 100°. Fourth =`,
    options: [
      "70°",
      "80°",
      "90°",
      "100°",
    ],
    correctAnswer: 1,
    explanation: `360-95-85-100=80°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Interior Angle Pentagon",
    question: `Sum of interior angles of a pentagon =`,
    options: [
      "360°",
      "450°",
      "540°",
      "720°",
    ],
    correctAnswer: 2,
    explanation: `(5-2)×180=540°.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Lines of Symmetry",
    question: `Lines of symmetry of a regular hexagon =`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 2,
    explanation: `A regular hexagon has 6 lines of symmetry.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Coordinates Translate",
    question: `Point (2,5) translated 3 right and 4 down gives:`,
    options: [
      "(5,1)",
      "(5,9)",
      "-1,5)",
      "(2,1)",
    ],
    correctAnswer: 0,
    explanation: `x:2+3=5, y:5-4=1. New=(5,1).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Reflection",
    question: `Point (4,2) reflected in the y-axis gives:`,
    options: [
      "(-4,2)",
      "(4,-2)",
      "(-4,-2)",
      "(2,4)",
    ],
    correctAnswer: 0,
    explanation: `Reflection in y-axis: x changes sign. (-4,2).`
  },
  {
    id: 32,
    type: "geometry",
    skill: "3D Faces",
    question: `Faces on a triangular prism:`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 2,
    explanation: `2 triangular + 3 rectangular = 5 faces.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Exterior Angle",
    question: `Exterior angle of a regular square =`,
    options: [
      "45°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `360÷4=90° each exterior angle.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Median Odd",
    question: `Median of: 7, 12, 3, 19, 5, 14, 9 =`,
    options: [
      "7",
      "9",
      "12",
      "14",
    ],
    correctAnswer: 1,
    explanation: `Sorted: 3,5,7,9,12,14,19. Middle=9.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Mode",
    question: `Data: 5,8,5,12,8,5,9,8,5. Mode =`,
    options: [
      "5",
      "8",
      "9",
      "12",
    ],
    correctAnswer: 0,
    explanation: `5 appears 4 times. Mode=5.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Range Decimals",
    question: `Range of: 3.4, 7.8, 1.6, 9.2, 4.5 =`,
    options: [
      "6.0",
      "7.6",
      "7.9",
      "8.0",
    ],
    correctAnswer: 1,
    explanation: `9.2-1.6=7.6.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Mean Find Missing",
    question: `Mean of 5 numbers is 12. Four numbers are 10,14,8,16. Fifth =`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 1,
    explanation: `Total=60. Known=10+14+8+16=48. Fifth=12.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Pie Chart Fraction",
    question: `Pie chart: Science=120°, Other=240°. Fraction choosing Science =`,
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
    id: 39,
    type: "statistics",
    skill: "Probability Even",
    question: `A die is rolled. P(even) =`,
    options: [
      "1/6",
      "1/3",
      "1/2",
      "2/3",
    ],
    correctAnswer: 2,
    explanation: `Even:2,4,6=3 outcomes. P=3/6=1/2.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Expected Frequency",
    question: `P(win)=0.2. Expected wins in 60 trials =`,
    options: [
      "8",
      "10",
      "12",
      "15",
    ],
    correctAnswer: 2,
    explanation: `0.2×60=12.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod2Questions : g5MathMod2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 2</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 2</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 2</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
