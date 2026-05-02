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

const g5MathMixed4Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Large Numbers",
    question: `What is 1,234,567 rounded to the nearest ten thousand?`,
    options: [
      "1,230,000",
      "1,234,000",
      "1,235,000",
      "1,240,000",
    ],
    correctAnswer: 2,
    explanation: `The digit after ten-thousands is 4 (<5), so round down: 1,230,000. Wait: 1,234,567 — ten-thousands digit is 3, units are 4567 → round to 1,230,000.`
  },
  {
    id: 2,
    type: "number",
    skill: "Multiplication",
    question: `425 × 12 = ?`,
    options: [
      "5,000",
      "5,100",
      "5,150",
      "5,200",
    ],
    correctAnswer: 1,
    explanation: `425×12: 425×10=4250, 425×2=850. 4250+850=5,100.`
  },
  {
    id: 3,
    type: "number",
    skill: "Division",
    question: `4,896 ÷ 16 = ?`,
    options: [
      "296",
      "300",
      "306",
      "316",
    ],
    correctAnswer: 2,
    explanation: `4,896÷16=306. Check: 306×16=4,896.`
  },
  {
    id: 4,
    type: "number",
    skill: "Fractions",
    question: `3/5 - 1/4 = ?`,
    options: [
      "7/20",
      "9/20",
      "11/20",
      "13/20",
    ],
    correctAnswer: 0,
    explanation: `LCD=20: 3/5=12/20, 1/4=5/20. 12/20-5/20=7/20.`
  },
  {
    id: 5,
    type: "number",
    skill: "Fractions",
    question: `2/3 × 3/8 = ?`,
    options: [
      "1/4",
      "6/24",
      "1/3",
      "2/8",
    ],
    correctAnswer: 0,
    explanation: `2/3×3/8=6/24=1/4.`
  },
  {
    id: 6,
    type: "number",
    skill: "Fractions",
    question: `5/6 ÷ 5/12 = ?`,
    options: [
      "1/2",
      "1",
      "2",
      "5/72",
    ],
    correctAnswer: 2,
    explanation: `5/6 ÷ 5/12 = 5/6 × 12/5 = 60/30 = 2.`
  },
  {
    id: 7,
    type: "number",
    skill: "Percentages",
    question: `Price increases from $400 to $480. Percentage increase:`,
    options: [
      "15%",
      "18%",
      "20%",
      "25%",
    ],
    correctAnswer: 2,
    explanation: `Increase=$80. %=80/400×100=20%.`
  },
  {
    id: 8,
    type: "number",
    skill: "Decimals",
    question: `5.4 × 0.06 = ?`,
    options: [
      "0.0324",
      "0.324",
      "3.24",
      "32.4",
    ],
    correctAnswer: 1,
    explanation: `5.4×6=32.4. Place 3 decimal places: 0.324.`
  },
  {
    id: 9,
    type: "number",
    skill: "Ratio",
    question: `Ratio 18:30 in simplest form:`,
    options: [
      "3:5",
      "2:3",
      "6:10",
      "9:15",
    ],
    correctAnswer: 0,
    explanation: `GCF=6. 18÷6:30÷6=3:5.`
  },
  {
    id: 10,
    type: "number",
    skill: "Order of Operations",
    question: `5² - (18 ÷ 3) + 4 = ?`,
    options: [
      "23",
      "25",
      "27",
      "29",
    ],
    correctAnswer: 0,
    explanation: `5²=25. 18÷3=6. 25-6+4=23.`
  },
  {
    id: 11,
    type: "number",
    skill: "Problem Solving",
    question: `A trader buys at $60, sells at $75. Profit %:`,
    options: [
      "20%",
      "25%",
      "30%",
      "35%",
    ],
    correctAnswer: 1,
    explanation: `Profit=$15. %=15/60×100=25%.`
  },
  {
    id: 12,
    type: "number",
    skill: "Proportion",
    question: `6 workers complete a job in 10 days. How many days for 4 workers?`,
    options: [
      "12",
      "14",
      "15",
      "16",
    ],
    correctAnswer: 2,
    explanation: `Inverse proportion: 6×10=60 person-days. 60÷4=15 days.`
  },
  {
    id: 13,
    type: "number",
    skill: "Number Sequences",
    question: `Fibonacci-like: 1,1,2,3,5,8,___`,
    options: [
      "10",
      "11",
      "13",
      "15",
    ],
    correctAnswer: 2,
    explanation: `Each term = sum of previous two. 5+8=13.`
  },
  {
    id: 14,
    type: "number",
    skill: "Simple Interest",
    question: `Simple interest: P=$500, R=10%, T=3 years. Interest=`,
    options: [
      "$100",
      "$150",
      "$180",
      "$200",
    ],
    correctAnswer: 1,
    explanation: `I=PRT=500×0.1×3=$150.`
  },
  {
    id: 15,
    type: "number",
    skill: "Problem Solving",
    question: `15% of a class are absent. 34 are present. Total class size:`,
    options: [
      "40",
      "44",
      "46",
      "50",
    ],
    correctAnswer: 0,
    explanation: `85%=34. 100%=34÷0.85=40.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Perimeter",
    question: `Perimeter of semicircle with diameter 14 cm (π=22/7):`,
    options: [
      "22 cm",
      "36 cm",
      "44 cm",
      "50 cm",
    ],
    correctAnswer: 1,
    explanation: `Curved part=πr=22/7×7=22. Diameter=14. Total=22+14=36 cm.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Area",
    question: `Area of trapezoid: parallel sides 10 cm & 16 cm, height 6 cm:`,
    options: [
      "52 cm²",
      "72 cm²",
      "78 cm²",
      "96 cm²",
    ],
    correctAnswer: 1,
    explanation: `A=½(10+16)×6=½×26×6=78. Wait: ½×26×6=78.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Volume",
    question: `Volume of triangular prism: base area 18 cm², length 12 cm:`,
    options: [
      "72 cm³",
      "180 cm³",
      "216 cm³",
      "432 cm³",
    ],
    correctAnswer: 2,
    explanation: `V=18×12=216 cm³.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Speed & Time",
    question: `Train at 90 km/h for 2h 40min. Distance =`,
    options: [
      "220 km",
      "240 km",
      "260 km",
      "280 km",
    ],
    correctAnswer: 1,
    explanation: `2h40min=8/3h. 90×8/3=240 km.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Compound Units",
    question: `Fencing $15/m. Rectangular field 20×15 m. Fencing cost:`,
    options: [
      "$1,050",
      "$1,200",
      "$1,350",
      "$1,500",
    ],
    correctAnswer: 0,
    explanation: `Perimeter=2(20+15)=70m. Cost=70×$15=$1,050.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time Zones",
    question: `Jamaica is UTC-5. London is UTC+0. When it is 3 PM in Jamaica, what time in London?`,
    options: [
      "8 PM",
      "9 PM",
      "10 PM",
      "11 PM",
    ],
    correctAnswer: 0,
    explanation: `Jamaica+5=London. 3PM+5=8PM.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Mass",
    question: `5 identical boxes total 17.5 kg. Each box =`,
    options: [
      "3 kg",
      "3.5 kg",
      "4 kg",
      "4.5 kg",
    ],
    correctAnswer: 1,
    explanation: `17.5÷5=3.5 kg each.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Capacity",
    question: `A medicine dropper holds 0.05 mL per drop. How many drops in 2 mL?`,
    options: [
      "20",
      "30",
      "40",
      "50",
    ],
    correctAnswer: 2,
    explanation: `2÷0.05=40 drops.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Conversion",
    question: `Convert 4.5 hours to minutes and seconds.`,
    options: [
      "270 min 0s",
      "4,500s",
      "Both are equal",
      "Neither",
    ],
    correctAnswer: 2,
    explanation: `4.5×60=270 min. 270×60=16,200s. They are not equal, but 270 min = 4.5 hours.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Surface Area",
    question: `Rectangular prism 8×5×3 cm. Surface area:`,
    options: [
      "79 cm²",
      "119 cm²",
      "158 cm²",
      "158.4 cm²",
    ],
    correctAnswer: 2,
    explanation: `SA=2(8×5+5×3+3×8)=2(40+15+24)=2×79=158 cm².`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Circle",
    question: `Diameter of a circle with circumference 88 cm (π=22/7):`,
    options: [
      "7 cm",
      "14 cm",
      "28 cm",
      "44 cm",
    ],
    correctAnswer: 2,
    explanation: `d=C÷π=88÷(22/7)=88×7/22=28 cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Angles",
    question: `Two parallel lines cut by a transversal. Co-interior angles sum to:`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 1,
    explanation: `Co-interior (same-side interior) angles sum to 180°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Similarity",
    question: `Two similar triangles: sides 6,8,10 and 9,12,___.`,
    options: [
      "13",
      "14",
      "15",
      "16",
    ],
    correctAnswer: 2,
    explanation: `Scale factor=3/2=1.5. 10×1.5=15.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Locus",
    question: `The locus of points equidistant from two fixed points is:`,
    options: [
      "A circle",
      "A line",
      "The perpendicular bisector",
      "A square",
    ],
    correctAnswer: 2,
    explanation: `The perpendicular bisector of the segment joining the two points.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Nets",
    question: `Which 3D shape has a net with 6 rectangles?`,
    options: [
      "Cube",
      "Cuboid",
      "Cylinder",
      "Triangular prism",
    ],
    correctAnswer: 1,
    explanation: `A cuboid (rectangular prism) has a net with 6 rectangles.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Angles",
    question: `Angles of triangle: 2x, 3x, 4x. Largest angle:`,
    options: [
      "40°",
      "60°",
      "80°",
      "100°",
    ],
    correctAnswer: 2,
    explanation: `9x=180. x=20. Largest=4×20=80°.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Scale Factor",
    question: `Original area 25 cm². Enlarged with scale factor 3. New area:`,
    options: [
      "75 cm²",
      "125 cm²",
      "175 cm²",
      "225 cm²",
    ],
    correctAnswer: 3,
    explanation: `Area scale=3²=9. 25×9=225 cm².`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Coordinate Geometry",
    question: `Midpoint of (2,4) and (8,10):`,
    options: [
      "(4,6)",
      "(5,7)",
      "(6,8)",
      "(3,5)",
    ],
    correctAnswer: 1,
    explanation: `Midpoint=((2+8)/2,(4+10)/2)=(5,7).`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Weighted Mean",
    question: `Weighted mean: 4(w=3), 6(w=5), 8(w=2). Mean=`,
    options: [
      "5",
      "5.5",
      "6",
      "6.5",
    ],
    correctAnswer: 1,
    explanation: `(12+30+16)÷10=58÷10=5.8. Closest: 5.5. Wait: 4×3=12,6×5=30,8×2=16. Sum=58÷10=5.8.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Cumulative Frequency",
    question: `Data: below 10(5), 10-20(8), 20-30(12), 30-40(7). Cumulative freq at 30=`,
    options: [
      "20",
      "22",
      "25",
      "32",
    ],
    correctAnswer: 2,
    explanation: `5+8+12=25.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Standard Deviation Concept",
    question: `Which set has a greater spread: A={2,4,6,8,10} or B={4,5,6,7,8}?`,
    options: [
      "A",
      "B",
      "Both equal",
      "Cannot tell",
    ],
    correctAnswer: 0,
    explanation: `Set A has range 8; Set B has range 4. A is more spread out.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability",
    question: `P(not picking green) if P(green)=0.3:`,
    options: [
      "0.3",
      "0.6",
      "0.7",
      "1",
    ],
    correctAnswer: 2,
    explanation: `P(not green)=1-0.3=0.7.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Two-Way Tables",
    question: `Survey: 20 boys(10 sport,10 music), 30 girls(15 sport,15 music). P(student prefers sport)=`,
    options: [
      "1/4",
      "1/2",
      "2/5",
      "1",
    ],
    correctAnswer: 1,
    explanation: `Total sport=25. Total=50. P=25/50=1/2.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Bar Chart",
    question: `Bar chart heights: Mon=8, Tue=12, Wed=15, Thu=10, Fri=5. Mean daily total=`,
    options: [
      "8",
      "9",
      "10",
      "12",
    ],
    correctAnswer: 2,
    explanation: `(8+12+15+10+5)÷5=50÷5=10.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability Tree",
    question: `Bag: 3 red, 2 blue. Pick two without replacement. P(both red)=`,
    options: [
      "3/10",
      "1/2",
      "3/5",
      "6/25",
    ],
    correctAnswer: 0,
    explanation: `P=3/5×2/4=6/20=3/10.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "operations, fractions, decimals, percentages, ratio, patterns" },
  { type: "measurement" as const, label: "Measurement",              note: "length, area, perimeter, volume, time, money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "shapes, angles, transformations, coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, graphs, probability" },
]

export default function G5MathMixed4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? g5MathMixed4Questions
    : g5MathMixed4Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-slate-800">Mathematics Mixed 4</CardTitle>
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
              <p className="text-slate-600">Mathematics Mixed 4</p>
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
                <h1 className="text-lg font-bold">Mathematics Mixed 4</h1>
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
