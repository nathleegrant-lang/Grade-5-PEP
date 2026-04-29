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

const g5MathDiff5Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Algebra",
    question: `Solve: x²−x−6=0.`,
    options: [
      "x=3,x=−2",
      "x=−3,x=2",
      "x=2,x=3",
      "x=6,x=−1",
    ],
    correctAnswer: 0,
    explanation: `(x−3)(x+2)=0.`
  },
  {
    id: 2,
    type: "number",
    skill: "Simultaneous",
    question: `2x-y=5 and x+y=4. Find x.`,
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    correctAnswer: 1,
    explanation: `Add: 3x=9. x=3. y=1.`
  },
  {
    id: 3,
    type: "number",
    skill: "Standard Form",
    question: `(3.6×10⁻³)+(4.4×10⁻³)=`,
    options: [
      "8.0×10⁻³",
      "8.0×10⁻⁶",
      "8.0×10³",
      "80×10⁻⁴",
    ],
    correctAnswer: 0,
    explanation: `(3.6+4.4)×10⁻³=8.0×10⁻³.`
  },
  {
    id: 4,
    type: "number",
    skill: "Index Laws",
    question: `Simplify 4x³ × 3x²`,
    options: [
      "7x⁵",
      "7x⁶",
      "12x⁵",
      "12x⁶",
    ],
    correctAnswer: 2,
    explanation: `4×3=12. x³×x²=x⁵. 12x⁵.`
  },
  {
    id: 5,
    type: "number",
    skill: "Surds",
    question: `Expand (√5+2)²`,
    options: [
      "9",
      "9+4√5",
      "5+4√5",
      "4√5+9",
    ],
    correctAnswer: 1,
    explanation: `5+4√5+4=9+4√5.`
  },
  {
    id: 6,
    type: "number",
    skill: "Logs",
    question: `If log₁₀(x)=2, x=`,
    options: [
      "20",
      "100",
      "200",
      "1000",
    ],
    correctAnswer: 1,
    explanation: `10²=100.`
  },
  {
    id: 7,
    type: "number",
    skill: "Compound Interest",
    question: `$4,000 at 3.5% pa compound for 5 years. Amount≈`,
    options: [
      "$4,751.31",
      "$4,734.00",
      "$4,700.00",
      "$4,628.00",
    ],
    correctAnswer: 0,
    explanation: `4000×1.035⁵=4000×1.18769=$4,750.76≈$4,751.31.`
  },
  {
    id: 8,
    type: "number",
    skill: "Functions",
    question: `f(x)=x²−4. f(x+2)=`,
    options: [
      "x²+4x",
      "x²+4x+4",
      "x²+4x−4",
      "x²",
    ],
    correctAnswer: 0,
    explanation: `(x+2)²-4=x²+4x+4-4=x²+4x.`
  },
  {
    id: 9,
    type: "number",
    skill: "Sequences",
    question: `GP sum: a=1,r=3,n=6. Sₙ=a(rⁿ-1)/(r-1)=`,
    options: [
      "364",
      "365",
      "366",
      "729",
    ],
    correctAnswer: 0,
    explanation: `(3⁶-1)/2=728/2=364.`
  },
  {
    id: 10,
    type: "number",
    skill: "Inequality",
    question: `Solve: x²<25.`,
    options: [
      "x<5",
      "−5<x<5",
      "x>−5",
      "x<−5 or x>5",
    ],
    correctAnswer: 1,
    explanation: `x²<25 means |x|<5. −5<x<5.`
  },
  {
    id: 11,
    type: "number",
    skill: "Number Theory",
    question: `Product of two consecutive integers n(n+1) is always:`,
    options: [
      "Prime",
      "Odd",
      "Divisible by 2",
      "Divisible by 4",
    ],
    correctAnswer: 2,
    explanation: `One of two consecutive integers is even. Product always divisible by 2.`
  },
  {
    id: 12,
    type: "number",
    skill: "Functions Composite",
    question: `f(x)=x+3, g(x)=x². g(f(x))=`,
    options: [
      "x²+3",
      "(x+3)²",
      "x²+6x+9",
      "x+9",
    ],
    correctAnswer: 1,
    explanation: `g(f(x))=g(x+3)=(x+3)².`
  },
  {
    id: 13,
    type: "number",
    skill: "Permutations",
    question: `Arrange 4 letters from MATHS (no repetition). Ways =`,
    options: [
      "60",
      "120",
      "240",
      "360",
    ],
    correctAnswer: 1,
    explanation: `⁵P₄=5×4×3×2=120.`
  },
  {
    id: 14,
    type: "number",
    skill: "Binomial Expansion",
    question: `Coefficient of x³ in (1+x)⁶=`,
    options: [
      "15",
      "20",
      "15",
      "6",
    ],
    correctAnswer: 1,
    explanation: `⁶C₃=20.`
  },
  {
    id: 15,
    type: "number",
    skill: "Real World Algebra",
    question: `Cost $C for n items: C=5n+20. Items when C=$95 =`,
    options: [
      "13",
      "15",
      "17",
      "20",
    ],
    correctAnswer: 1,
    explanation: `5n+20=95. 5n=75. n=15.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Frustum SA",
    question: `Frustum: top r=3cm, bottom r=6cm, slant=5cm. Curved SA (π=3.14):`,
    options: [
      "141.3 cm²",
      "165.9 cm²",
      "188.4 cm²",
      "212.0 cm²",
    ],
    correctAnswer: 0,
    explanation: `π(r₁+r₂)×l=3.14×9×5=141.3 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Compound Rate",
    question: `Pump fills 120L/min. Drain removes 45L/min. Tank 4,500L. Start empty. Time to fill =`,
    options: [
      "40 min",
      "50 min",
      "60 min",
      "70 min",
    ],
    correctAnswer: 2,
    explanation: `Net=75L/min. 4500÷75=60min.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Surveying",
    question: `From A, angles to target T: 60° at A and 45° at B, 100m apart. Distance AT (sine rule, sin75°≈0.966):`,
    options: [
      "73 m",
      "82 m",
      "89 m",
      "95 m",
    ],
    correctAnswer: 0,
    explanation: `Angle at T=75°. AT/sin45°=100/sin75°. AT=100×0.707/0.966≈73m.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Percentage Complex",
    question: `Item costs $C. After 30% markup then 20% discount. Net change = ?`,
    options: [
      "4% increase",
      "4% decrease",
      "5% increase",
      "5% decrease",
    ],
    correctAnswer: 0,
    explanation: `1.3×0.8=1.04. Net 4% increase.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Scale Factor Volume",
    question: `Ratio of surface areas of similar spheres = 4:9. Volume ratio =`,
    options: [
      "4:9",
      "8:27",
      "16:81",
      "64:729",
    ],
    correctAnswer: 1,
    explanation: `Linear ratio=2:3. Volume ratio=2³:3³=8:27.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Speed Problem",
    question: `Object thrown upward: height h=20t-5t². Max height =`,
    options: [
      "15 m",
      "20 m",
      "25 m",
      "30 m",
    ],
    correctAnswer: 1,
    explanation: `Max at t=2. h=40-20=20m.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Conversion Complex",
    question: `Speed 180km/h. In miles per hour (1km≈0.621miles):`,
    options: [
      "111.8 mph",
      "112.4 mph",
      "115.8 mph",
      "118.4 mph",
    ],
    correctAnswer: 0,
    explanation: `180×0.621=111.78≈111.8mph.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Area Optimization",
    question: `Fixed perimeter 100m. Circle vs square: which has larger area?`,
    options: [
      "Square",
      "Circle",
      "Equal",
      "Depends on shape",
    ],
    correctAnswer: 1,
    explanation: `Circle always encloses more area for a given perimeter.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Compound Problem",
    question: `Income $6,000/month: 25% tax, 8% pension, 3% NIS. Net income =`,
    options: [
      "$3,480",
      "$3,840",
      "$3,960",
      "$4,080",
    ],
    correctAnswer: 1,
    explanation: `Deductions=36%×6000=$2,160. Net=$3,840.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Inclined Plane",
    question: `Slope 30°, horizontal distance 80m. Vertical height (tan30°=1/√3≈0.577):`,
    options: [
      "46.2 m",
      "47.2 m",
      "48.2 m",
      "49.2 m",
    ],
    correctAnswer: 0,
    explanation: `h=80×tan30°=80×0.577=46.2m.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Sector Arc",
    question: `Sector angle 270°, radius 6cm. Arc length (π=3.14):`,
    options: [
      "18.84 cm",
      "28.26 cm",
      "37.68 cm",
      "56.52 cm",
    ],
    correctAnswer: 1,
    explanation: `(270/360)×2×3.14×6=(3/4)×37.68=28.26 cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Cyclic Quad",
    question: `Cyclic quadrilateral angles: 70°, 85°, x°, y°. x+y=`,
    options: [
      "180°",
      "185°",
      "190°",
      "205°",
    ],
    correctAnswer: 3,
    explanation: `Opposite angles sum to 180°. (70°+x°)=180° and (85°+y°)=180°. x+y=110+95=205°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry cos",
    question: `cos(A)=3/5 in right triangle. sin(A)=`,
    options: [
      "4/5",
      "3/4",
      "5/4",
      "3/5",
    ],
    correctAnswer: 0,
    explanation: `sin²+cos²=1. sin²=1-9/25=16/25. sin=4/5.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Vector Resultant",
    question: `Forces: F₁=(3,4)N and F₂=(−1,2)N. Resultant magnitude =`,
    options: [
      "√(8)",
      "√(36)",
      "√(40)",
      "√(52)",
    ],
    correctAnswer: 2,
    explanation: `R=(2,6). |R|=√(4+36)=√40.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Coordinate Geometry",
    question: `Line through (4,3) perpendicular to y=2x+1. Equation =`,
    options: [
      "y=−½x+5",
      "y=−½x+3",
      "y=2x−5",
      "y=½x+1",
    ],
    correctAnswer: 0,
    explanation: `Perpendicular gradient=−½. y−3=−½(x−4). y=−½x+5.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Angle of Elevation",
    question: `From ground, elevation to top of building=40°. Distance from base=30m. Height (tan40°≈0.839):`,
    options: [
      "25.2 m",
      "26.2 m",
      "27.2 m",
      "25.0 m",
    ],
    correctAnswer: 0,
    explanation: `h=30×tan40°=30×0.839=25.2m.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Circle Theorems",
    question: `Angle at centre 80°, angle at circumference = ?`,
    options: [
      "40°",
      "60°",
      "80°",
      "120°",
    ],
    correctAnswer: 0,
    explanation: `Angle at circumference = half central angle = 40°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Similar Triangles",
    question: `Triangles similar scale 3:5. Smaller perimeter 24cm. Larger perimeter =`,
    options: [
      "35 cm",
      "40 cm",
      "45 cm",
      "50 cm",
    ],
    correctAnswer: 1,
    explanation: `(5/3)×24=40cm.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Variance from Data",
    question: `Dataset: 2,4,6,8,10. SD=`,
    options: [
      "2√2",
      "2",
      "√8",
      "4",
    ],
    correctAnswer: 0,
    explanation: `Mean=6. Devs: -4,-2,0,2,4. Var=40/5=8. SD=√8=2√2.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Normal Z-Score",
    question: `X~N(μ=70,σ=5). P(X<80)=P(Z<2)≈`,
    options: [
      "95%",
      "97.5%",
      "99%",
      "99.7%",
    ],
    correctAnswer: 1,
    explanation: `P(Z<2)≈97.5%.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Regression Predict",
    question: `Line: ŷ=0.8x+5. When x=20, ŷ=`,
    options: [
      "18",
      "21",
      "22",
      "25",
    ],
    correctAnswer: 1,
    explanation: `0.8(20)+5=16+5=21.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Conditional Probability",
    question: `P(A)=0.5, P(B)=0.4, P(A∩B)=0.2. P(A|B)=`,
    options: [
      "0.4",
      "0.5",
      "0.6",
      "0.8",
    ],
    correctAnswer: 1,
    explanation: `P(A|B)=P(A∩B)/P(B)=0.2/0.4=0.5.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Expected Value",
    question: `Raffle: win $100 with P=0.01, win $10 with P=0.1. E(winnings)=`,
    options: [
      "$1",
      "$2",
      "$3",
      "$4",
    ],
    correctAnswer: 1,
    explanation: `100(0.01)+10(0.1)=1+1=$2.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Hypothesis",
    question: `z=2.3 for two-tailed test at 5% level (critical value ±1.96). Conclusion:`,
    options: [
      "Reject H₀",
      "Do not reject H₀",
      "Accept H₀",
      "Insufficient data",
    ],
    correctAnswer: 0,
    explanation: `2.3>1.96. Reject H₀ at 5% significance.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Poisson",
    question: `Poisson λ=2. P(X=2)=e⁻²×2²/2!≈`,
    options: [
      "0.135",
      "0.271",
      "0.406",
      "0.271",
    ],
    correctAnswer: 1,
    explanation: `e⁻²≈0.135. P(X=2)=0.135×4/2=0.271.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "algebra, indices, sequences, standard form, complex fractions, proof" },
  { type: "measurement" as const, label: "Measurement",              note: "compound shapes, 3D geometry, rates, conversions, optimization" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "circle theorems, trigonometry, vectors, transformations, proofs" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "standard deviation, regression, cumulative frequency, tree diagrams" },
]

export default function G5MathDiff5MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathDiff5Questions : g5MathDiff5Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Difficult 5</CardTitle>
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
              <p className="text-slate-600">Mathematics Difficult 5</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Difficult 5</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
              ? <Button onClick={() => setShowResults(true)} className="bg-slate-700 hover:bg-slate-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
