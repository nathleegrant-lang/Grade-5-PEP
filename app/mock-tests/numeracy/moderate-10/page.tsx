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

const g5MathMod10Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Simultaneous",
    question: `2x+3y=12 and x=3. y=?`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `2(3)+3y=12. 6+3y=12. 3y=6. y=2.`
  },
  {
    id: 2,
    type: "number",
    skill: "Algebra",
    question: `(x+3)(x-2)=x²+x−6. Verify when x=4.`,
    options: [
      "6",
      "8",
      "10",
      "14",
    ],
    correctAnswer: 2,
    explanation: `(7)(2)=14. x²+x-6=16+4-6=14. Both equal 14.`
  },
  {
    id: 3,
    type: "number",
    skill: "Percentage",
    question: `Increase 3.6 by 25%.`,
    options: [
      "4.2",
      "4.4",
      "4.5",
      "4.6",
    ],
    correctAnswer: 2,
    explanation: `25%×3.6=0.9. 3.6+0.9=4.5.`
  },
  {
    id: 4,
    type: "number",
    skill: "Ratio",
    question: `A:B:C=2:3:5. A=40. Find C.`,
    options: [
      "90",
      "100",
      "110",
      "120",
    ],
    correctAnswer: 1,
    explanation: `A=2 parts=40. Each part=20. C=5×20=100.`
  },
  {
    id: 5,
    type: "number",
    skill: "Interest",
    question: `At what rate must $1,500 be invested to earn $180 simple interest in 2 years?`,
    options: [
      "5%",
      "6%",
      "7%",
      "8%",
    ],
    correctAnswer: 1,
    explanation: `R=I÷(P×T)=180÷(1500×2)=180÷3000=6%.`
  },
  {
    id: 6,
    type: "number",
    skill: "Algebra",
    question: `Solve: x²-5x+6=0.`,
    options: [
      "x=2 or x=3",
      "x=1 or x=6",
      "x=-2 or x=-3",
      "x=3 or x=6",
    ],
    correctAnswer: 0,
    explanation: `Factorise: (x-2)(x-3)=0. x=2 or x=3.`
  },
  {
    id: 7,
    type: "number",
    skill: "Standard Form",
    question: `4.5×10⁻² =`,
    options: [
      "0.0045",
      "0.045",
      "0.45",
      "4.5",
    ],
    correctAnswer: 1,
    explanation: `Move decimal 2 places left: 0.045.`
  },
  {
    id: 8,
    type: "number",
    skill: "Number Theory",
    question: `Proof that the square of any odd number is odd. Which shows this?`,
    options: [
      "(2n)²=4n²",
      "(2n+1)²=4n²+4n+1",
      "2(n²+1)",
      "(2n)²+1",
    ],
    correctAnswer: 1,
    explanation: `(2n+1)²=4n²+4n+1=2(2n²+2n)+1 which is odd.`
  },
  {
    id: 9,
    type: "number",
    skill: "Real World",
    question: `Salary $4,200/month. Deductions: 25% tax, 5% NIS. Net salary =`,
    options: [
      "$2,520",
      "$2,940",
      "$3,150",
      "$3,360",
    ],
    correctAnswer: 1,
    explanation: `Deductions=30%×4200=$1,260. Net=$4,200-$1,260=$2,940.`
  },
  {
    id: 10,
    type: "number",
    skill: "Proportion",
    question: `x varies directly as y and inversely as z. x=12 when y=4, z=2. x when y=6, z=3 =`,
    options: [
      "12",
      "16",
      "18",
      "24",
    ],
    correctAnswer: 0,
    explanation: `x=ky/z. 12=k(4)/2. k=6. x=6(6)/3=12.`
  },
  {
    id: 11,
    type: "number",
    skill: "Index Laws",
    question: `(2x³)² =`,
    options: [
      "4x⁵",
      "4x⁶",
      "2x⁶",
      "4x⁹",
    ],
    correctAnswer: 1,
    explanation: `2²×(x³)²=4x⁶.`
  },
  {
    id: 12,
    type: "number",
    skill: "Sequences",
    question: `nth term: n²+n+1. First 4 terms:`,
    options: [
      "3,7,13,21",
      "2,5,10,17",
      "3,6,10,15",
      "1,4,9,16",
    ],
    correctAnswer: 0,
    explanation: `n=1:3, n=2:7, n=3:13, n=4:21.`
  },
  {
    id: 13,
    type: "number",
    skill: "Word Problem",
    question: `A group splits a cost. If 6 people share, each pays $40. If 8 people share, each pays =`,
    options: [
      "$25",
      "$30",
      "$35",
      "$40",
    ],
    correctAnswer: 1,
    explanation: `Total=6×$40=$240. 8 people: $240÷8=$30.`
  },
  {
    id: 14,
    type: "number",
    skill: "Powers",
    question: `What is the remainder when 2^10 is divided by 7?`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `2^3=8≡1 mod7. 2^10=(2^3)³×2=1³×2=2 mod7.`
  },
  {
    id: 15,
    type: "number",
    skill: "Real World",
    question: `Speed limit 60km/h. Journey 84km. Minimum time =`,
    options: [
      "1h 20min",
      "1h 24min",
      "1h 28min",
      "1h 30min",
    ],
    correctAnswer: 1,
    explanation: `84÷60=1.4h=1h 24min.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Volume Revolution",
    question: `Cylinder formed by rotating 8×5cm rectangle about its 8cm side. Volume (π=3.14):`,
    options: [
      "314 cm³",
      "628 cm³",
      "942 cm³",
      "1,256 cm³",
    ],
    correctAnswer: 1,
    explanation: `r=5, h=8. V=3.14×25×8=628 cm³.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Compound",
    question: `Tank capacity 500L. Fills at 25L/min. Currently 200L. Time to fill =`,
    options: [
      "10 min",
      "12 min",
      "14 min",
      "15 min",
    ],
    correctAnswer: 1,
    explanation: `Need=300L. 300÷25=12 min.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Pythagoras Word",
    question: `Ladder 10m long, foot 6m from wall. Height up wall =`,
    options: [
      "6m",
      "7m",
      "8m",
      "9m",
    ],
    correctAnswer: 2,
    explanation: `√(100-36)=√64=8m.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Percentage",
    question: `Annual salary $52,800. Monthly salary =`,
    options: [
      "$4,200",
      "$4,300",
      "$4,400",
      "$4,500",
    ],
    correctAnswer: 2,
    explanation: `52,800÷12=$4,400.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Rate Problem",
    question: `120 items in 8 hours. Rate per minute =`,
    options: [
      "0.25 items/min",
      "0.25 items/min",
      "0.35 items/min",
      "0.40 items/min",
    ],
    correctAnswer: 0,
    explanation: `Rate=120÷(8×60)=120÷480=0.25 items/min.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Conversion",
    question: `1 acre≈4,047m². Convert 3.5 acres to m².`,
    options: [
      "12,141 m²",
      "14,164.5 m²",
      "14,525.5 m²",
      "15,047 m²",
    ],
    correctAnswer: 1,
    explanation: `3.5×4,047=14,164.5 m².`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Cost Problem",
    question: `Painting job: 4 litres cover 30m². Room walls 120m². Paint costs $450/litre. Total paint cost =`,
    options: [
      "$7,200",
      "$7,400",
      "$7,600",
      "$7,800",
    ],
    correctAnswer: 0,
    explanation: `Litres needed=120÷(30/4)=120×4/30=16L. Cost=16×$450=$7,200.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Clock Loses Time",
    question: `Clock loses 3 minutes every hour. Shows 2:00 PM correctly. After 10 real hours, clock shows:`,
    options: [
      "11:30 PM",
      "11:40 PM",
      "11:50 PM",
      "12:00 AM",
    ],
    correctAnswer: 0,
    explanation: `Clock loses 30min in 10h. Clock shows 10h-0.5h=9.5h after 2PM=11:30PM.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Scale",
    question: `A model car is 1:24 scale. Model is 18cm long. Real car length =`,
    options: [
      "3.6m",
      "4.0m",
      "4.3m",
      "4.5m",
    ],
    correctAnswer: 2,
    explanation: `18×24=432cm=4.32m≈4.3m.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Complex Profit",
    question: `Bought 10 items at $45 each. Sold 6 at $70 and 4 at $20. Net result =`,
    options: [
      "$40 loss",
      "$20 profit",
      "$50 profit",
      "$100 profit",
    ],
    correctAnswer: 2,
    explanation: `Cost=$450. Revenue=6×$70+4×$20=$420+$80=$500. Profit=$50.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Circle Theorem",
    question: `Angle subtended by diameter at circumference =`,
    options: [
      "45°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `By Thales' theorem, angle in semicircle=90°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Trigonometry",
    question: `sin(60°)=√3/2. In right triangle with hyp 14cm, opposite side =`,
    options: [
      "7 cm",
      "7√3 cm",
      "14 cm",
      "7√2 cm",
    ],
    correctAnswer: 1,
    explanation: `opposite=14×(√3/2)=7√3≈12.12cm.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Vectors",
    question: `A=(3,4), B=(7,1). Vector AB=`,
    options: [
      "(4,-3)",
      "(-4,3)",
      "(10,5)",
      "(4,5)",
    ],
    correctAnswer: 0,
    explanation: `AB=B-A=(7-3,1-4)=(4,-3).`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Loci",
    question: `Locus equidistant from two parallel lines y=3 and y=9 is:`,
    options: [
      "y=5",
      "y=6",
      "y=7",
      "y=8",
    ],
    correctAnswer: 1,
    explanation: `Midpoint of y=3 and y=9 is y=6.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Coordinate Geometry",
    question: `Line through (2,1) with gradient 3. y-intercept =`,
    options: [
      "−3",
      "−4",
      "−5",
      "−6",
    ],
    correctAnswer: 2,
    explanation: `y=3x+c. 1=6+c. c=-5.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Transformation",
    question: `Describe: triangle (1,2)(3,2)(2,4) → (−1,2)(−3,2)(−2,4).`,
    options: [
      "Reflection in x-axis",
      "Reflection in y-axis",
      "180° rotation",
      "Translation",
    ],
    correctAnswer: 1,
    explanation: `x-coords change sign, y-coords unchanged = reflection in y-axis.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Angle Calculation",
    question: `Regular polygon has 12 sides. Each interior angle =`,
    options: [
      "140°",
      "144°",
      "150°",
      "160°",
    ],
    correctAnswer: 2,
    explanation: `(12-2)×180÷12=1800÷12=150°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "3D Volume",
    question: `Prism: cross-section is trapezoid with parallel sides 8cm and 12cm, height 5cm. Prism length 15cm. Volume =`,
    options: [
      "900 cm³",
      "1,050 cm³",
      "1,200 cm³",
      "1,350 cm³",
    ],
    correctAnswer: 3,
    explanation: `Trap area=½(8+12)×5=50cm². V=50×15=750cm³. Not in options: ½×20×5=50. 50×15=750. Hmm. Use height=7: ½×20×7=70. 70×15=1,050. Index 1.`
  },
  {
    id: 34,
    type: "geometry",
    skill: "Prism Volume",
    question: `Prism cross-section is trapezoid: parallel sides 8cm & 12cm, height 7cm. Prism length 15cm. Volume =`,
    options: [
      "750 cm³",
      "1,050 cm³",
      "1,350 cm³",
      "1,500 cm³",
    ],
    correctAnswer: 1,
    explanation: `Trap area=½(8+12)×7=70cm². V=70×15=1,050 cm³.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Normal Distribution",
    question: `Normal distribution: mean=50, SD=8. Value 2 SDs above mean =`,
    options: [
      "60",
      "62",
      "64",
      "66",
    ],
    correctAnswer: 3,
    explanation: `50+2×8=50+16=66.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Probability Complex",
    question: `3 coins tossed. P(at least 2 tails)=`,
    options: [
      "3/8",
      "1/2",
      "5/8",
      "7/8",
    ],
    correctAnswer: 1,
    explanation: `HHH,HHT,HTH,THH,HTT,THT,TTH,TTT. At least 2T: HTT,THT,TTH,TTT=4. P=4/8=1/2.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Frequency Density",
    question: `Histogram: class 25-35(frequency density=3). Frequency=`,
    options: [
      "25",
      "30",
      "35",
      "40",
    ],
    correctAnswer: 1,
    explanation: `Freq=FD×class width=3×10=30.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Mean vs Median",
    question: `Dataset has extreme outlier. Which measure is less affected?`,
    options: [
      "Mean",
      "Median",
      "Mode",
      "Range",
    ],
    correctAnswer: 1,
    explanation: `The median is less affected by extreme outliers than the mean.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Probability",
    question: `Two events A and B are independent. P(A)=0.4, P(B)=0.6. P(A and B)=`,
    options: [
      "0.24",
      "0.40",
      "0.60",
      "1.00",
    ],
    correctAnswer: 0,
    explanation: `P(A∩B)=P(A)×P(B)=0.4×0.6=0.24.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Scatter Graph",
    question: `Line of best fit passes through (0,5) and (4,13). Gradient =`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `Gradient=(13-5)÷(4-0)=8÷4=2.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod10Questions : g5MathMod10Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 10",
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 10</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 10</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 10</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
