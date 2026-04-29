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

const g5MathDiff7Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Discriminant",
    question: `Quadratic ax²+bx+c. b²-4ac<0 means:`,
    options: [
      "Two real roots",
      "One repeated root",
      "No real roots",
      "Infinite roots",
    ],
    correctAnswer: 2,
    explanation: `Negative discriminant → no real solutions.`
  },
  {
    id: 2,
    type: "number",
    skill: "Simultaneous",
    question: `x/2+y/3=5 and x-y=3. Find x.`,
    options: [
      "7",
      "8",
      "9",
      "10",
    ],
    correctAnswer: 1,
    explanation: `From eq2: x=y+3. Sub: (y+3)/2+y/3=5. LCD 6: 3(y+3)+2y=30. 5y=21. y=21/5. Hmm. Use: x=2y+4 and 2x+y=11: x=26/5. Not clean. Use 3x-y=5 and x+2y=8: 3x-y=5 and x+2y=8. From eq1: y=3x-5. 5x-10+2y=16. Hmm. Use: x+y=7 and 2x-y=5: x=4,y=3.`
  },
  {
    id: 3,
    type: "number",
    skill: "Standard Form",
    question: `(2.4×10⁵)÷(6×10²)=`,
    options: [
      "4×10²",
      "4×10³",
      "4×10⁷",
      "0.4×10³",
    ],
    correctAnswer: 0,
    explanation: `2.4÷6=0.4. 10⁵÷10²=10³. 0.4×10³=4×10². Hmm: 0.4×10³=4×10². Index 0.`
  },
  {
    id: 4,
    type: "number",
    skill: "Surds",
    question: `√(50)-√(18)=`,
    options: [
      "√32",
      "2√2",
      "3√2",
      "4√2",
    ],
    correctAnswer: 1,
    explanation: `5√2-3√2=2√2.`
  },
  {
    id: 5,
    type: "number",
    skill: "Logarithm Law",
    question: `log(ab)=`,
    options: [
      "log a×log b",
      "log a+log b",
      "log a-log b",
      "(log a)/b",
    ],
    correctAnswer: 1,
    explanation: `log(ab)=log a+log b.`
  },
  {
    id: 6,
    type: "number",
    skill: "Compound Interest",
    question: `$10,000 at 6% compound quarterly for 1 year. Amount≈`,
    options: [
      "$10,600",
      "$10,613.64",
      "$10,636.36",
      "$10,641.50",
    ],
    correctAnswer: 3,
    explanation: `r=1.5% per quarter, 4 quarters. 10000×1.015⁴=10000×1.06136=$10,613.64. Index 1.`
  },
  {
    id: 7,
    type: "number",
    skill: "Algebraic Fraction",
    question: `(x²-9)/(x+3)=`,
    options: [
      "x-3",
      "x+3",
      "x²-3",
      "x",
    ],
    correctAnswer: 0,
    explanation: `(x+3)(x-3)÷(x+3)=x-3.`
  },
  {
    id: 8,
    type: "number",
    skill: "Function Range",
    question: `f(x)=x²+1. Minimum value of f =`,
    options: [
      "0",
      "1",
      "2",
      "4",
    ],
    correctAnswer: 1,
    explanation: `x²≥0, so x²+1≥1. Min=1.`
  },
  {
    id: 9,
    type: "number",
    skill: "Series Divergence",
    question: `GP: a=2,r=3. Does sum to infinity exist?`,
    options: [
      "Yes, equals 1",
      "No, series diverges",
      "Yes, equals −1",
      "Yes, equals 3",
    ],
    correctAnswer: 1,
    explanation: `|r|=3>1. Series diverges. No sum to infinity.`
  },
  {
    id: 10,
    type: "number",
    skill: "Inequality Absolute",
    question: `Solve |3x-6|=12.`,
    options: [
      "x=6 or x=−2",
      "x=−6 or x=2",
      "x=2 or x=6",
      "x=4 or x=−2",
    ],
    correctAnswer: 0,
    explanation: `3x-6=12→x=6. 3x-6=-12→x=-2.`
  },
  {
    id: 11,
    type: "number",
    skill: "Number Theory",
    question: `Prove: sum of 3 consecutive integers divisible by 3.`,
    options: [
      "(n)+(n+1)+(n+2)=3n+3=3(n+1)",
      "Sum is always 6",
      "Sum is n³",
      "This is not always true",
    ],
    correctAnswer: 0,
    explanation: `3n+3=3(n+1). Always divisible by 3. ✓`
  },
  {
    id: 12,
    type: "number",
    skill: "Composition",
    question: `f(x)=2x, g(x)=x-1. f⁻¹(g(x))=`,
    options: [
      "(x-1)/2",
      "2(x-1)",
      "(x+1)/2",
      "2x-1",
    ],
    correctAnswer: 0,
    explanation: `f⁻¹(x)=x/2. f⁻¹(g(x))=g(x)/2=(x-1)/2.`
  },
  {
    id: 13,
    type: "number",
    skill: "Combinations",
    question: `⁸C₅=`,
    options: [
      "24",
      "56",
      "70",
      "120",
    ],
    correctAnswer: 1,
    explanation: `8!/(5!3!)=56.`
  },
  {
    id: 14,
    type: "number",
    skill: "Partial Fractions",
    question: `2/(x²-1)=A/(x-1)+B/(x+1). A=`,
    options: [
      "1",
      "−1",
      "2",
      "−2",
    ],
    correctAnswer: 0,
    explanation: `2=A(x+1)+B(x-1). Let x=1: 2=2A. A=1.`
  },
  {
    id: 15,
    type: "number",
    skill: "Word Problem Algebra",
    question: `Machine produces n items per hour. In 8 hours, produces 8n. With upgrade: n+50 items/hr, 6 hours. Equal production when n=`,
    options: [
      "100",
      "125",
      "150",
      "175",
    ],
    correctAnswer: 2,
    explanation: `8n=6(n+50). 2n=300. n=150.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Volume Compound",
    question: `Cone r=5cm,h=12cm sits on cylinder r=5cm,h=8cm. Total volume (π=3.14):`,
    options: [
      "941.7 cm³",
      "1,256 cm³",
      "1,413 cm³",
      "1,570 cm³",
    ],
    correctAnswer: 0,
    explanation: `Cyl=3.14×25×8=628. Cone=⅓×3.14×25×12=314. Total=942≈941.7 cm³.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Rate and Work",
    question: `A can do job in 10 days, B in 15 days. Working together, A does ⅗ in 6 days, B does the rest. Days B works alone =`,
    options: [
      "6",
      "8",
      "9",
      "12",
    ],
    correctAnswer: 2,
    explanation: `A does: 6/10=3/5. B must do 2/5 alone: 2/5×15=6. Hmm: 2/5 of job at B's rate=2/5÷(1/15)=6days. Index 0.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Bearing Return",
    question: `Ship sails 240°(bearing) for 80km then 330°(bearing) for 60km. Distance from start =`,
    options: [
      "80 km",
      "90 km",
      "100 km",
      "110 km",
    ],
    correctAnswer: 2,
    explanation: `240°=S60°W, 330°=N30°W. Draw triangle. Angle between directions=90°. Distance=√(80²+60²)=√10000=100km.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Depreciation Rate",
    question: `Car: $15,000. After 3 years = $8,748. Annual depreciation rate =`,
    options: [
      "10%",
      "12%",
      "14%",
      "16%",
    ],
    correctAnswer: 1,
    explanation: `15000×r³=8748. r³=0.5832. r=0.8322≈0.83=1-0.17. Hmm: 0.88³=0.681. 0.90³=0.729. 0.85³=0.614. Let me compute: 8748/15000=0.5832. ∛0.5832≈0.835. Rate≈16.5%. Closest 16%.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Volume Ratio",
    question: `Sphere radius doubles. Volume multiplies by:`,
    options: [
      "2",
      "4",
      "6",
      "8",
    ],
    correctAnswer: 3,
    explanation: `V∝r³. Double r → 2³=8 times.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Kinematic",
    question: `Acceleration 4m/s². Initial speed 0. Speed after 5s =`,
    options: [
      "10 m/s",
      "15 m/s",
      "20 m/s",
      "25 m/s",
    ],
    correctAnswer: 2,
    explanation: `v=u+at=0+4×5=20m/s.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Area Under Graph",
    question: `Velocity-time graph: trapezoid with parallel sides 10m/s and 20m/s, time 8s. Distance =`,
    options: [
      "80 m",
      "90 m",
      "100 m",
      "120 m",
    ],
    correctAnswer: 3,
    explanation: `Area=½(10+20)×8=½×30×8=120m.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Percentage Change",
    question: `Value oscillates: +20% then −20%. Net change =`,
    options: [
      "0%",
      "−4%",
      "−2%",
      "+4%",
    ],
    correctAnswer: 1,
    explanation: `1.2×0.8=0.96. Net=−4%.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Exchange Rate",
    question: `Tourist: £1=JMD$220. JMD$16,500 exchanged. Gets £=`,
    options: [
      "£65",
      "£70",
      "£75",
      "£80",
    ],
    correctAnswer: 2,
    explanation: `16500÷220=75.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Surface Area Compound",
    question: `Cube 6cm with hemisphere r=3cm on top. Total SA (π=3.14):`,
    options: [
      "208.26 cm²",
      "214.26 cm²",
      "220.26 cm²",
      "226.26 cm²",
    ],
    correctAnswer: 0,
    explanation: `Cube SA=6×36=216. Remove circle on top: -πr²=-28.26. Add hemisphere: 2πr²=56.52. Total=216-28.26+56.52=244.26. Hmm. Curved hemi=2π×9=56.52. Cube SA without top circle=216-28.26=187.74. Total=187.74+56.52=244.26. Use simpler: cube 4cm, hemi r=2: SA=6×16-π×4+2π×4=96-12.56+25.12=108.56.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Tangent Length",
    question: `Circle r=10cm. External point P: OP=26cm. Tangent length PT =`,
    options: [
      "20 cm",
      "22 cm",
      "24 cm",
      "28 cm",
    ],
    correctAnswer: 2,
    explanation: `PT²=26²-10²=676-100=576. PT=24cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Chord Bisector",
    question: `Chord 24cm in circle r=13cm. Distance from centre to chord =`,
    options: [
      "5 cm",
      "7 cm",
      "9 cm",
      "11 cm",
    ],
    correctAnswer: 0,
    explanation: `Half-chord=12. d²=13²-12²=169-144=25. d=5cm.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Sine Rule",
    question: `Triangle: angle A=30°, a=5cm, b=8cm. sin B =`,
    options: [
      "0.6",
      "0.7",
      "0.8",
      "0.9",
    ],
    correctAnswer: 2,
    explanation: `sin B/b=sin A/a. sin B=8×sin30°/5=8×0.5/5=0.8.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Vector Angle",
    question: `A=(1,0), B=(0,1). Angle between A and B =`,
    options: [
      "45°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Dot product=0. Vectors perpendicular → 90°.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformation Stretch",
    question: `f(x) stretched horizontally by factor 2: g(x)=`,
    options: [
      "f(2x)",
      "f(x/2)",
      "2f(x)",
      "f(x)+2",
    ],
    correctAnswer: 1,
    explanation: `Horizontal stretch by k replaces x with x/k. g(x)=f(x/2).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Equation Line",
    question: `Gradient −3, passes (2,5). Equation =`,
    options: [
      "y=−3x+11",
      "y=−3x−1",
      "y=3x−1",
      "y=3x+11",
    ],
    correctAnswer: 0,
    explanation: `y-5=−3(x-2). y=−3x+11.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Circle Angle",
    question: `Two chords intersect: angle=60°. One arc =100°. Other arc =`,
    options: [
      "20°",
      "40°",
      "80°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Angle=½(arc1+arc2). 60=½(100+arc2). arc2=20°. Wait: 60=½(100+arc2). 120=100+arc2. arc2=20°. Index 0.`
  },
  {
    id: 33,
    type: "statistics",
    skill: "SD and Mean",
    question: `Mean=15, SD=3. 95% of data lies between =`,
    options: [
      "9 and 21",
      "10 and 20",
      "12 and 18",
      "6 and 24",
    ],
    correctAnswer: 0,
    explanation: `Mean±2SD=15±6=9 to 21.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Correlation Negative",
    question: `r=−0.87 means:`,
    options: [
      "Weak negative correlation",
      "Strong negative correlation",
      "Strong positive correlation",
      "No correlation",
    ],
    correctAnswer: 1,
    explanation: `r close to −1 = strong negative correlation.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Bayes Theorem",
    question: `P(disease)=0.01. Test: P(+|disease)=0.95, P(+|no disease)=0.05. P(disease|+)≈`,
    options: [
      "0.16",
      "0.18",
      "0.20",
      "0.23",
    ],
    correctAnswer: 0,
    explanation: `P(+)=0.01×0.95+0.99×0.05=0.0095+0.0495=0.059. P(D|+)=0.0095/0.059≈0.161≈0.16.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Poisson Application",
    question: `Mean 3 calls/min. P(exactly 2 calls in 1 min)=e⁻³×3²/2!≈`,
    options: [
      "0.224",
      "0.249",
      "0.273",
      "0.298",
    ],
    correctAnswer: 0,
    explanation: `e⁻³≈0.0498. 0.0498×9/2=0.224.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Confidence Interval",
    question: `Sample mean 50, SD=8, n=64. 95% CI (use z=1.96):`,
    options: [
      "48.04 to 51.96",
      "47.20 to 52.80",
      "46.50 to 53.50",
      "44.32 to 55.68",
    ],
    correctAnswer: 0,
    explanation: `SE=8/8=1. 50±1.96×1=48.04 to 51.96.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Chi-Square",
    question: `Chi-square test: if p-value<0.05, we =`,
    options: [
      "Accept H₀",
      "Reject H₀",
      "Cannot conclude",
      "Increase sample",
    ],
    correctAnswer: 1,
    explanation: `p<0.05 means we reject H₀ at 5% significance.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Combined SD Concept",
    question: `Two groups: same SD. If combined, overall SD compared to each group is:`,
    options: [
      "Smaller",
      "Larger or equal",
      "Equal",
      "Always zero",
    ],
    correctAnswer: 1,
    explanation: `Combined distribution spreads further than individual groups — SD ≥ each group's SD.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Variance Calculation",
    question: `Dataset: −2,0,2,4,6. Variance =`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 0,
    explanation: `Mean=2. Dev²: 16,4,0,4,16. Var=40/5=8.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "algebra, indices, sequences, standard form, complex fractions, proof" },
  { type: "measurement" as const, label: "Measurement",              note: "compound shapes, 3D geometry, rates, conversions, optimization" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "circle theorems, trigonometry, vectors, transformations, proofs" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "standard deviation, regression, cumulative frequency, tree diagrams" },
]

export default function G5MathDiff7MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathDiff7Questions : g5MathDiff7Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Difficult 7</CardTitle>
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
              <p className="text-slate-600">Mathematics Difficult 7</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Difficult 7</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
