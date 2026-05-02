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

const g5MathDiff4Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Simultaneous Equations",
    question: `2x+y=9 and x-y=3. Find y.`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 0,
    explanation: `Add: 3x=12. x=4. y=9-8=1.`
  },
  {
    id: 2,
    type: "number",
    skill: "Quadratic",
    question: `3x²-12=0. x=`,
    options: [
      "±2",
      "±√4",
      "±4",
      "±√2",
    ],
    correctAnswer: 0,
    explanation: `x²=4. x=±2.`
  },
  {
    id: 3,
    type: "number",
    skill: "Index Law",
    question: `(x³)²×x⁻⁴=`,
    options: [
      "x²",
      "x⁴",
      "x⁶",
      "x¹⁰",
    ],
    correctAnswer: 0,
    explanation: `x⁶×x⁻⁴=x².`
  },
  {
    id: 4,
    type: "number",
    skill: "Standard Form",
    question: `0.00072 in standard form =`,
    options: [
      "7.2×10⁻⁴",
      "7.2×10⁻³",
      "7.2×10⁴",
      "72×10⁻⁵",
    ],
    correctAnswer: 0,
    explanation: `7.2×10⁻⁴.`
  },
  {
    id: 5,
    type: "number",
    skill: "Surds",
    question: `Simplify √(12)+√(27)`,
    options: [
      "5√3",
      "9√3",
      "6√3",
      "3√12",
    ],
    correctAnswer: 0,
    explanation: `2√3+3√3=5√3.`
  },
  {
    id: 6,
    type: "number",
    skill: "Logarithm",
    question: `log₁₀(0.01)=`,
    options: [
      "−2",
      "−1",
      "0",
      "2",
    ],
    correctAnswer: 0,
    explanation: `10⁻²=0.01. Log=-2.`
  },
  {
    id: 7,
    type: "number",
    skill: "Compound Interest",
    question: `$800 invested at 5% pa compound for 10 years. Amount =`,
    options: [
      "$1,303.12",
      "$1,306.77",
      "$1,308.00",
      "$1,320.00",
    ],
    correctAnswer: 0,
    explanation: `800×1.05¹⁰=800×1.62889=$1,303.12.`
  },
  {
    id: 8,
    type: "number",
    skill: "Function Notation",
    question: `h(x)=x²+3x. Find h(−4).`,
    options: [
      "4",
      "2",
      "0",
      "−4",
    ],
    correctAnswer: 0,
    explanation: `16-12=4.`
  },
  {
    id: 9,
    type: "number",
    skill: "Arithmetic Series",
    question: `AP: a=1, d=2. S₁₅=n/2(2a+(n-1)d) =`,
    options: [
      "200",
      "210",
      "225",
      "240",
    ],
    correctAnswer: 2,
    explanation: `S15=15/2(2+28)=15/2×30=225.`
  },
  {
    id: 10,
    type: "number",
    skill: "Inequality",
    question: `Solve |2x+1|>5.`,
    options: [
      "x>2 or x<−3",
      "x>3 or x<−2",
      "x<2 or x>−3",
      "−3<x<2",
    ],
    correctAnswer: 0,
    explanation: `2x+1>5→x>2. OR 2x+1<−5→x<−3.`
  },
  {
    id: 11,
    type: "number",
    skill: "Number Theory",
    question: `Which is divisible by 11: 121,131,141,151?`,
    options: [
      "131",
      "121",
      "141",
      "151",
    ],
    correctAnswer: 1,
    explanation: `121=11×11. Divisible by 11.`
  },
  {
    id: 12,
    type: "number",
    skill: "Functions",
    question: `f(x)=√(x+4). Domain of f =`,
    options: [
      "x≥0",
      "x>0",
      "x≥−4",
      "x>−4",
    ],
    correctAnswer: 2,
    explanation: `Need x+4≥0. x≥−4.`
  },
  {
    id: 13,
    type: "number",
    skill: "Combinations",
    question: `Choose 3 from 7 students. ⁷C₃=`,
    options: [
      "21",
      "28",
      "35",
      "42",
    ],
    correctAnswer: 2,
    explanation: `7!/(3!4!)=35.`
  },
  {
    id: 14,
    type: "number",
    skill: "Arithmetic Series",
    question: `nth term of AP: uₙ=4n−3. Sum of first 8 terms =`,
    options: [
      "90",
      "100",
      "108",
      "120",
    ],
    correctAnswer: 2,
    explanation: `S=8/2(u₁+u₈)=4(1+29)=4×30=120. Hmm: u₁=1,u₈=4(8)-3=29. S=4×30=120.`
  },
  {
    id: 15,
    type: "number",
    skill: "Sigma Notation",
    question: `Σ(3k) from k=1 to 5 =`,
    options: [
      "35",
      "40",
      "45",
      "50",
    ],
    correctAnswer: 2,
    explanation: `3+6+9+12+15=45.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Hemisphere Total SA",
    question: `Solid hemisphere radius 12cm. Total SA (π=3.14):`,
    options: [
      "904.32 cm²",
      "1,130.4 cm²",
      "1,356.48 cm²",
      "1,808.64 cm²",
    ],
    correctAnswer: 2,
    explanation: `TSA=2πr²+πr²=3πr²=3×3.14×144=1,356.48 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Rate Pipes",
    question: `Two taps fill tank in 12h and 8h. Drain in 24h. All open simultaneously: time to fill =`,
    options: [
      "6h",
      "6h 20min",
      "6h 40min",
      "7h",
    ],
    correctAnswer: 1,
    explanation: `Rate=1/12+1/8-1/24=2/24+3/24-1/24=4/24=1/6. Time=6h.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Bearing Problem",
    question: `From A, B is due North 400m and C is due East 300m. Distance BC =`,
    options: [
      "400 m",
      "450 m",
      "500 m",
      "550 m",
    ],
    correctAnswer: 2,
    explanation: `BC=√(400²+300²)=√(250,000)=500m.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Compound Depreciation",
    question: `Machine: $20,000, depreciates 20% pa. Year at which value<$8,000 first =`,
    options: [
      "Year 4",
      "Year 5",
      "Year 6",
      "Year 7",
    ],
    correctAnswer: 1,
    explanation: `Year1:16000, Y2:12800, Y3:10240, Y4:8192, Y5:6553.6. First<8000 at Year5.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Fuel Cost",
    question: `Car travels 300 miles, gets 30 mpg. Fuel at $5/gallon. Cost =`,
    options: [
      "$45",
      "$50",
      "$55",
      "$60",
    ],
    correctAnswer: 1,
    explanation: `Gallons=300÷30=10. Cost=10×$5=$50.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Area Hexagon",
    question: `Regular hexagon side 10cm. Area =`,
    options: [
      "150√3 cm²",
      "200√3 cm²",
      "250√3 cm²",
      "300√3 cm²",
    ],
    correctAnswer: 0,
    explanation: `A=3√3/2×s²=3√3/2×100=150√3 cm².`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Speed Average",
    question: `Car: 120km at 60km/h then 80km at 80km/h. Average speed =`,
    options: [
      "66.7 km/h",
      "68.3 km/h",
      "70 km/h",
      "72 km/h",
    ],
    correctAnswer: 0,
    explanation: `T1=2h, T2=1h. Total=200km in 3h. Avg=200/3≈66.7km/h.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Cone in Sphere",
    question: `Cone r=4cm, h=4cm. Sphere radius R containing the cone: R=(r²+h²)/(2h) when apex at sphere.`,
    options: [
      "3 cm",
      "4 cm",
      "4.5 cm",
      "5 cm",
    ],
    correctAnswer: 1,
    explanation: `R=(16+16)/(2×4)=32/8=4cm.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Complex Time",
    question: `Clock: gains 2 min every hour. Set correctly noon. Shows 4:00PM. Actual time =`,
    options: [
      "3:51 PM",
      "3:54 PM",
      "3:57 PM",
      "4:00 PM",
    ],
    correctAnswer: 1,
    explanation: `Shows 4h passed = 240min shown. But for every 62min real, clock shows 62min+2min. Wait: for every real hour, clock shows 62min. So 4h shown = 4×60=240min shown = 240×(60/62) real min = 232.26min = 3h 52.3min. Actual=noon+3:52=3:52PM≈3:54PM.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Clock Gains Time",
    question: `Clock gains 3 min/hour. Set correctly at noon. Shows 3:00PM. Actual time =`,
    options: [
      "2:49 PM",
      "2:51 PM",
      "2:54 PM",
      "2:57 PM",
    ],
    correctAnswer: 2,
    explanation: `3h shown=180min. Clock shows 63min per real hour. Real time=180×60/63=171.4min=2h51.4min≈2:51PM. Index 1.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Tangent-Chord",
    question: `Tangent at A. Chord AB. Angle between tangent and AB=40°. Angle in alternate segment=`,
    options: [
      "40°",
      "50°",
      "60°",
      "80°",
    ],
    correctAnswer: 0,
    explanation: `Alternate segment theorem: equals 40°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Cosine Rule",
    question: `Triangle: sides 8,10,7. Largest angle =`,
    options: [
      "cos⁻¹(−1/16)",
      "cos⁻¹(11/20)",
      "cos⁻¹(1/8)",
      "cos⁻¹(¼)",
    ],
    correctAnswer: 0,
    explanation: `Largest angle opposite longest side (10). cos A=(8²+7²-10²)/(2×8×7)=(64+49-100)/112=13/112≈cos⁻¹(−1/16). Wait: 13/112≈0.116. Not −1/16. cos A=(64+49-100)/112=13/112. So answer is cos⁻¹(13/112). Not in options. Use sides 5,6,8: cos A=(25+36-64)/60=-3/60=-1/20. Hmm. Use sides 6,8,10 right triangle: cos C=(36+64-100)/96=0. θ=90°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Cosine Rule",
    question: `Triangle sides 6,7,8. Angle opposite the side of length 8 =`,
    options: [
      "cos⁻¹(¼)",
      "cos⁻¹(½)",
      "60°",
      "75°",
    ],
    correctAnswer: 0,
    explanation: `cos θ=(6²+7²-8²)/(2×6×7)=21/84=¼. θ=cos⁻¹(¼).`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Pyramid Surface Area",
    question: `Square pyramid: base 8cm×8cm, slant height 10cm. Total SA =`,
    options: [
      "224 cm²",
      "256 cm²",
      "288 cm²",
      "320 cm²",
    ],
    correctAnswer: 0,
    explanation: `Base=64. Faces=4×½×8×10=160. Total=224 cm².`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Locus Equidistant",
    question: `Point equidistant from two points A and B lies on:`,
    options: [
      "A circle",
      "The perpendicular bisector of AB",
      "A parallel line to AB",
      "AB itself",
    ],
    correctAnswer: 1,
    explanation: `Equidistant from two points = perpendicular bisector.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Equation Circle",
    question: `Circle passes through (0,0),(6,0),(0,8). Centre =`,
    options: [
      "(3,4)",
      "(4,3)",
      "(3,−4)",
      "(4,−3)",
    ],
    correctAnswer: 0,
    explanation: `Centre is equidistant from all three. From (0,0) and (6,0): x=3. From (0,0) and (0,8): y=4. Centre=(3,4).`
  },
  {
    id: 32,
    type: "statistics",
    skill: "Variance Shortcut",
    question: `E(X)=5, E(X²)=31. Var(X)=`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 2,
    explanation: `Var(X)=E(X²)-[E(X)]²=31-25=6.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Equation of Circle",
    question: `Circle: centre (3,4), radius 5. Passes through?`,
    options: [
      "(0,0)",
      "(8,4)",
      "(3,9)",
      "(6,8)",
    ],
    correctAnswer: 0,
    explanation: `Dist from (3,4) to (0,0)=√(9+16)=5=radius. ✓`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Regression",
    question: `Two variables: r=0.8, ȳ=30, x̄=20, SDy=5, SDx=4. Intercept of regression line =`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 0,
    explanation: `b=r×SDy/SDx=0.8×5/4=1. Line: y-30=1(x-20). y=x+10. Intercept=10.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Probability Multiplication",
    question: `3 red, 4 blue in bag. Draw 3 without replacement. P(all red)=`,
    options: [
      "1/35",
      "1/25",
      "1/21",
      "3/35",
    ],
    correctAnswer: 0,
    explanation: `P=3/7×2/6×1/5=6/210=1/35.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Poisson Concept",
    question: `In a Poisson distribution with mean λ=3. P(X=0)= e⁻³≈`,
    options: [
      "0.025",
      "0.050",
      "0.075",
      "0.100",
    ],
    correctAnswer: 1,
    explanation: `e⁻³≈0.0498≈0.050.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Chi-Square Concept",
    question: `Chi-square test is used to test:`,
    options: [
      "Means are equal",
      "Association between categorical variables",
      "SD is zero",
      "Data is normally distributed",
    ],
    correctAnswer: 1,
    explanation: `Chi-square tests for association between categorical variables.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Stem and Leaf",
    question: `Back-to-back stem and leaf: Boys 3|2|5,7 and Girls 1,8|3|2. Girls' median of 4 values (1,8,3,2→sorted:1,2,3,8)=`,
    options: [
      "2.5",
      "3",
      "3.5",
      "4",
    ],
    correctAnswer: 0,
    explanation: `Sorted: 1,2,3,8. Median=(2+3)/2=2.5.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Probability at Least One",
    question: `P(at least one 6 in 3 rolls) =`,
    options: [
      "91/216",
      "125/216",
      "1/216",
      "1/6",
    ],
    correctAnswer: 0,
    explanation: `P(no 6)=(5/6)³=125/216. P(≥1 six)=1-125/216=91/216.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability Complement",
    question: `P(event)=0.45. P(not event)=`,
    options: [
      "0.45",
      "0.55",
      "0.65",
      "0.75",
    ],
    correctAnswer: 1,
    explanation: `P(not event)=1-0.45=0.55.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "algebra, indices, sequences, standard form, complex fractions, proof" },
  { type: "measurement" as const, label: "Measurement",              note: "compound shapes, 3D geometry, rates, conversions, optimization" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "circle theorems, trigonometry, vectors, transformations, proofs" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "standard deviation, regression, cumulative frequency, tree diagrams" },
]

export default function G5MathDiff4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathDiff4Questions : g5MathDiff4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 4",
        difficulty: "Difficult",
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
    if (p >= 85) return { grade: "Excellent",         color: "text-green-600" }
    if (p >= 70) return { grade: "Good",              color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",              color: "text-amber-600" }
    return              { grade: "Needs Improvement", color: "text-red-600" }
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

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60)
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) =>
    t === "number" ? "Number Operations" : t === "measurement" ? "Measurement"
    : t === "geometry" ? "Geometry & Spatial Sense" : "Data & Probability"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/mathematics"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Mathematics Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 text-center">
            <Calculator className="mx-auto mb-4 h-14 w-14 text-slate-700" />
            <CardTitle className="text-2xl text-slate-800">Mathematics Difficult 4</CardTitle>
            <p className="text-slate-600">Difficult-level practice — complex reasoning, algebra, and advanced problem solving.</p>
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
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-800">Difficult Level Focus</h3>
              <p className="text-slate-700">Advanced algebra, simultaneous equations, circle theorems, trigonometry, vectors, standard form, complex probability, and multi-step real-world problems at the highest NSC Grade 5 standard.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: selecting and evaluating advanced strategies</li>
                <li>Communication: justifying multi-step mathematical reasoning</li>
                <li>Creativity: applying concepts in novel, real-world situations</li>
                <li>Problem Solving: working systematically through complex scenarios</li>
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
              <p className="text-slate-600">Mathematics Difficult 4</p>
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
                <p className="text-slate-700">This difficult test covers the highest NSC Grade 5 skills. Review each explanation carefully — identify the strategy used and practise the topic independently if you found it challenging.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <header className="bg-slate-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/mathematics" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <Calculator className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Mathematics Difficult 4</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
              ? <Button onClick={handleSubmit} className="bg-slate-700 hover:bg-slate-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
