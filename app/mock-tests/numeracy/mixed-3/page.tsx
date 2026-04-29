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

const g5MathMixed3Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Integers",
    question: `What is -8 + 15?`,
    options: [
      "7",
      "8",
      "23",
      "-7",
    ],
    correctAnswer: 0,
    explanation: `-8+15=7. Moving 15 places right from -8 on the number line.`
  },
  {
    id: 2,
    type: "number",
    skill: "Integers",
    question: `-12 - (-5) = ?`,
    options: [
      "17",
      "-7",
      "-17",
      "7",
    ],
    correctAnswer: 1,
    explanation: `-12-(-5)=-12+5=-7.`
  },
  {
    id: 3,
    type: "number",
    skill: "Multiplication",
    question: `247 × 6 = ?`,
    options: [
      "1,462",
      "1,482",
      "1,492",
      "1,502",
    ],
    correctAnswer: 1,
    explanation: `247×6: 200×6=1200, 47×6=282. 1200+282=1,482.`
  },
  {
    id: 4,
    type: "number",
    skill: "Division",
    question: `1,323 ÷ 9 = ?`,
    options: [
      "143",
      "147",
      "153",
      "163",
    ],
    correctAnswer: 1,
    explanation: `1,323÷9=147. Check: 147×9=1,323.`
  },
  {
    id: 5,
    type: "number",
    skill: "Fractions",
    question: `5/6 - 1/3 = ?`,
    options: [
      "4/3",
      "1/2",
      "4/6",
      "1/6",
    ],
    correctAnswer: 1,
    explanation: `1/3=2/6. 5/6-2/6=3/6=1/2.`
  },
  {
    id: 6,
    type: "number",
    skill: "Mixed Numbers",
    question: `2¾ + 1½ = ?`,
    options: [
      "3¾",
      "4",
      "4¼",
      "4½",
    ],
    correctAnswer: 2,
    explanation: `2¾=11/4, 1½=6/4. Sum=17/4=4¼.`
  },
  {
    id: 7,
    type: "number",
    skill: "Percentages",
    question: `A shirt costs $800. VAT is 15%. Total price:`,
    options: [
      "$920",
      "$880",
      "$840",
      "$860",
    ],
    correctAnswer: 0,
    explanation: `VAT=15%×$800=$120. Total=$800+$120=$920.`
  },
  {
    id: 8,
    type: "number",
    skill: "Ratio",
    question: `Share $360 in ratio 2:3:4. Largest share:`,
    options: [
      "$80",
      "$120",
      "$160",
      "$200",
    ],
    correctAnswer: 2,
    explanation: `Parts=9. Each=$40. Largest=4×$40=$160.`
  },
  {
    id: 9,
    type: "number",
    skill: "Powers",
    question: `2⁴ + 3² = ?`,
    options: [
      "20",
      "22",
      "25",
      "28",
    ],
    correctAnswer: 2,
    explanation: `2⁴=16. 3²=9. 16+9=25.`
  },
  {
    id: 10,
    type: "number",
    skill: "Order of Operations",
    question: `(3+7) × 4 - 8 ÷ 2 = ?`,
    options: [
      "34",
      "36",
      "38",
      "40",
    ],
    correctAnswer: 2,
    explanation: `Brackets:10. 10×4=40. 8÷2=4. 40-4=36.`
  },
  {
    id: 11,
    type: "number",
    skill: "Proportion",
    question: `If 5 pens cost $35, what do 9 pens cost?`,
    options: [
      "$63",
      "$70",
      "$72",
      "$80",
    ],
    correctAnswer: 0,
    explanation: `Price per pen=$7. 9×$7=$63.`
  },
  {
    id: 12,
    type: "number",
    skill: "Fractions to %",
    question: `Write 7/20 as a percentage.`,
    options: [
      "25%",
      "30%",
      "35%",
      "40%",
    ],
    correctAnswer: 2,
    explanation: `7÷20×100=35%.`
  },
  {
    id: 13,
    type: "number",
    skill: "Prime Numbers",
    question: `Which is prime?`,
    options: [
      "27",
      "33",
      "37",
      "49",
    ],
    correctAnswer: 2,
    explanation: `37 has no factors other than 1 and 37. It is prime.`
  },
  {
    id: 14,
    type: "number",
    skill: "Square Roots",
    question: `√169 = ?`,
    options: [
      "11",
      "12",
      "13",
      "14",
    ],
    correctAnswer: 2,
    explanation: `13×13=169. √169=13.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `A shop sells 48 items per day. How many in 2 weeks?`,
    options: [
      "624",
      "666",
      "672",
      "700",
    ],
    correctAnswer: 2,
    explanation: `14×48=672 items.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Area of Composite",
    question: `An L-shaped field: outer rectangle 12×8, inner cut 4×3. Area:`,
    options: [
      "60 m²",
      "72 m²",
      "84 m²",
      "96 m²",
    ],
    correctAnswer: 3,
    explanation: `Outer=96. Cut=12. Area=96-12=84 m².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Perimeter",
    question: `Perimeter of a regular octagon with sides 6 cm:`,
    options: [
      "36 cm",
      "40 cm",
      "48 cm",
      "56 cm",
    ],
    correctAnswer: 2,
    explanation: `8×6=48 cm.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Volume",
    question: `Volume of a cylinder with radius 5 cm and height 8 cm (π=3.14):`,
    options: [
      "314 cm³",
      "502 cm³",
      "628 cm³",
      "1,256 cm³",
    ],
    correctAnswer: 2,
    explanation: `V=π×25×8=3.14×200=628 cm³.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Scale Drawing",
    question: `Map scale 1:25,000. Map distance 6 cm = real distance:`,
    options: [
      "150 km",
      "1.5 km",
      "15 km",
      "0.15 km",
    ],
    correctAnswer: 1,
    explanation: `6×25,000=150,000 cm=1.5 km.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Speed",
    question: `A cyclist rides 72 km in 2.5 hours. Speed =`,
    options: [
      "25 km/h",
      "28 km/h",
      "28.8 km/h",
      "30 km/h",
    ],
    correctAnswer: 2,
    explanation: `72÷2.5=28.8 km/h.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Surface Area",
    question: `Surface area of a cube with sides 5 cm:`,
    options: [
      "25 cm²",
      "100 cm²",
      "125 cm²",
      "150 cm²",
    ],
    correctAnswer: 3,
    explanation: `6 faces × 5×5=6×25=150 cm².`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Money",
    question: `After 20% discount, a bag costs $640. Original price:`,
    options: [
      "$800",
      "$760",
      "$768",
      "$850",
    ],
    correctAnswer: 0,
    explanation: `80%=$640. 100%=$640÷0.8=$800.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Time",
    question: `Convert 245 minutes to hours and minutes.`,
    options: [
      "3h 55min",
      "4h 5min",
      "4h 25min",
      "4h 45min",
    ],
    correctAnswer: 1,
    explanation: `245÷60=4 r5. =4h 5min.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Density",
    question: `Density=mass÷volume. Mass=180g, Volume=60cm³. Density=`,
    options: [
      "2 g/cm³",
      "3 g/cm³",
      "4 g/cm³",
      "5 g/cm³",
    ],
    correctAnswer: 1,
    explanation: `180÷60=3 g/cm³.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Capacity",
    question: `A tank is ¾ full with 450 L. Full capacity:`,
    options: [
      "540 L",
      "560 L",
      "600 L",
      "640 L",
    ],
    correctAnswer: 2,
    explanation: `¾=450L. Full=450÷¾=600L.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles in Polygon",
    question: `Sum of interior angles of a pentagon:`,
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
    id: 27,
    type: "geometry",
    skill: "Transformations",
    question: `Point (3,-2) reflected across x-axis gives:`,
    options: [
      "(-3,-2)",
      "(3,2)",
      "-3,2)",
      "(2,3)",
    ],
    correctAnswer: 1,
    explanation: `Reflecting across x-axis flips y sign. (3,-2)→(3,2).`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Pythagoras",
    question: `Right triangle legs: 6 cm and 8 cm. Hypotenuse =`,
    options: [
      "10 cm",
      "12 cm",
      "14 cm",
      "√48 cm",
    ],
    correctAnswer: 0,
    explanation: `√(36+64)=√100=10 cm.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Bearings",
    question: `A bearing of 180° is due:`,
    options: [
      "North",
      "South",
      "East",
      "West",
    ],
    correctAnswer: 1,
    explanation: `180° bearing = due South.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Area of Sector",
    question: `Sector with radius 6 cm and angle 60°. Area (π=3.14):`,
    options: [
      "9.42 cm²",
      "18.84 cm²",
      "28.26 cm²",
      "56.52 cm²",
    ],
    correctAnswer: 1,
    explanation: `(60/360)×3.14×36=(1/6)×113.04=18.84 cm².`
  },
  {
    id: 31,
    type: "geometry",
    skill: "3D Shapes",
    question: `Edges on a square pyramid:`,
    options: [
      "4",
      "6",
      "8",
      "12",
    ],
    correctAnswer: 2,
    explanation: `4 base edges+4 slant edges=8 edges.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Interior Angles",
    question: `Each interior angle of a regular octagon:`,
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
    id: 33,
    type: "geometry",
    skill: "Coordinates",
    question: `Which quadrant contains (-3, -5)?`,
    options: [
      "I",
      "II",
      "III",
      "IV",
    ],
    correctAnswer: 2,
    explanation: `(-,-) is Quadrant III.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Mean weight of 6 bags: 12,14,16,18,10,14 =`,
    options: [
      "14",
      "13",
      "15",
      "12",
    ],
    correctAnswer: 0,
    explanation: `(12+14+16+18+10+14)÷6=84÷6=14.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "IQR",
    question: `IQR of: 4,8,12,16,20,24,28 =`,
    options: [
      "12",
      "14",
      "16",
      "18",
    ],
    correctAnswer: 2,
    explanation: `Q1=8, Q3=24. IQR=24-8=16.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Frequency",
    question: `Frequency table: x=2(f=4),x=4(f=6),x=6(f=5),x=8(f=5). Mean x=`,
    options: [
      "4.8",
      "5.0",
      "5.2",
      "5.4",
    ],
    correctAnswer: 1,
    explanation: `(8+24+30+40)÷20=102÷20=5.1. Closest: 5.0.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability",
    question: `Die rolled. P(number > 4)=`,
    options: [
      "1/3",
      "1/2",
      "2/3",
      "1/6",
    ],
    correctAnswer: 0,
    explanation: `Numbers>4: 5,6. P=2/6=1/3.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Combined Mean",
    question: `Mean of 4 numbers is 10. A 5th number of 20 added. New mean=`,
    options: [
      "12",
      "13",
      "14",
      "15",
    ],
    correctAnswer: 0,
    explanation: `Old sum=40. New sum=60. 60÷5=12.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Pie Chart",
    question: `Pie chart: Sport=120°, Reading=90°, Music=60°, TV=90°. % prefer Sport:`,
    options: [
      "25%",
      "30%",
      "33%",
      "40%",
    ],
    correctAnswer: 2,
    explanation: `120÷360×100=33.3%≈33%.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Expected Frequency",
    question: `P(event)=0.25. Expected occurrences in 400 trials:`,
    options: [
      "80",
      "90",
      "100",
      "110",
    ],
    correctAnswer: 2,
    explanation: `0.25×400=100.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed3Questions
    : g5MathMixed3Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 3</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 3</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 3</h1>
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
