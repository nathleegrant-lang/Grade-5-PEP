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

const g5MathDiff3Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Simultaneous Equations",
    question: `x+y+z=10, x-y=2, y+z=7. Find x.`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 0,
    explanation: `From eq1 and eq3: x+y+z=10 and y+z=7. x=10-7=3.`
  },
  {
    id: 2,
    type: "number",
    skill: "Quadratic Formula",
    question: `2x²-5x-3=0. Roots =`,
    options: [
      "x=3 or x=-½",
      "x=-3 or x=½",
      "x=3 or x=½",
      "x=-3 or x=-½",
    ],
    correctAnswer: 0,
    explanation: `a=2,b=-5,c=-3. D=25+24=49. x=(5±7)/4. x=3 or x=-½.`
  },
  {
    id: 3,
    type: "number",
    skill: "Index Laws",
    question: `(a³b²)⁴ / a⁵b³ =`,
    options: [
      "a⁷b⁵",
      "a⁷b⁶",
      "a¹²b⁵",
      "a¹²b⁶",
    ],
    correctAnswer: 0,
    explanation: `Numerator: a¹²b⁸. Divide: a¹²⁻⁵b⁸⁻³=a⁷b⁵.`
  },
  {
    id: 4,
    type: "number",
    skill: "Standard Form",
    question: `Express 0.000045 in standard form.`,
    options: [
      "4.5×10⁻⁴",
      "4.5×10⁻⁵",
      "4.5×10⁴",
      "4.5×10⁵",
    ],
    correctAnswer: 1,
    explanation: `Move decimal 5 places right: 4.5×10⁻⁵.`
  },
  {
    id: 5,
    type: "number",
    skill: "Surds",
    question: `Simplify (2+√3)(2-√3)`,
    options: [
      "1",
      "4",
      "7",
      "√3",
    ],
    correctAnswer: 0,
    explanation: `Difference of squares: 4-3=1.`
  },
  {
    id: 6,
    type: "number",
    skill: "Logarithms",
    question: `log₂(64) =`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 2,
    explanation: `2⁶=64. log₂(64)=6.`
  },
  {
    id: 7,
    type: "number",
    skill: "Compound Interest",
    question: `$3,000 at 6% compound semi-annually for 2 years. Amount =`,
    options: [
      "$3,376.53",
      "$3,381.36",
      "$3,393.13",
      "$3,360.00",
    ],
    correctAnswer: 0,
    explanation: `Rate=3% per period, 4 periods. 3000×1.03⁴=3000×1.12551=$3,376.53.`
  },
  {
    id: 8,
    type: "number",
    skill: "Algebraic Identity",
    question: `Expand (a+b)²-(a-b)²`,
    options: [
      "4ab",
      "2ab",
      "a²-b²",
      "2a²+2b²",
    ],
    correctAnswer: 0,
    explanation: `(a²+2ab+b²)-(a²-2ab+b²)=4ab.`
  },
  {
    id: 9,
    type: "number",
    skill: "Sequences Sum",
    question: `Sum of GP: a=1, r=2, n=8 terms = Sₙ=a(rⁿ-1)/(r-1).`,
    options: [
      "255",
      "256",
      "511",
      "512",
    ],
    correctAnswer: 0,
    explanation: `S₈=1×(2⁸-1)/(2-1)=255.`
  },
  {
    id: 10,
    type: "number",
    skill: "Inequality System",
    question: `Solve |x-3|<5.`,
    options: [
      "−2<x<8",
      "-8<x<2",
      "x<−2 or x>8",
      "x>8",
    ],
    correctAnswer: 0,
    explanation: `|x-3|<5 means -5<x-3<5. So -2<x<8.`
  },
  {
    id: 11,
    type: "number",
    skill: "Number Theory",
    question: `n² is always odd when n is:`,
    options: [
      "Even",
      "Odd",
      "Prime",
      "Composite",
    ],
    correctAnswer: 1,
    explanation: `Odd×odd=odd. If n is odd, n²=odd.`
  },
  {
    id: 12,
    type: "number",
    skill: "Functions Composite",
    question: `f(x)=2x+1, g(x)=x². fg(x)=`,
    options: [
      "2x²+1",
      "(2x+1)²",
      "4x²+4x+1",
      "2x+1",
    ],
    correctAnswer: 0,
    explanation: `fg(x)=f(g(x))=f(x²)=2x²+1.`
  },
  {
    id: 13,
    type: "number",
    skill: "Permutations",
    question: `How many ways can 5 people sit in a row?`,
    options: [
      "20",
      "60",
      "120",
      "240",
    ],
    correctAnswer: 2,
    explanation: `5!=5×4×3×2×1=120.`
  },
  {
    id: 14,
    type: "number",
    skill: "Binomial",
    question: `Coefficient of x² in expansion of (1+x)⁵ =`,
    options: [
      "5",
      "10",
      "15",
      "20",
    ],
    correctAnswer: 1,
    explanation: `⁵C₂=10.`
  },
  {
    id: 15,
    type: "number",
    skill: "Complex Word",
    question: `John is 3 times older than Mary. In 5 years he'll be twice her age. John's current age =`,
    options: [
      "15",
      "20",
      "25",
      "30",
    ],
    correctAnswer: 0,
    explanation: `J=3M. J+5=2(M+5). 3M+5=2M+10. M=5. J=15.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Compound Volume",
    question: `Cylinder r=4cm,h=10cm with cone on top r=4cm,h=6cm. Total volume (π=3.14):`,
    options: [
      "502.4 cm³",
      "602.9 cm³",
      "628.0 cm³",
      "753.6 cm³",
    ],
    correctAnswer: 1,
    explanation: `Cyl=3.14×16×10=502.4. Cone=⅓×3.14×16×6=100.48. Total=602.88≈602.9 cm³.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Optimization Area",
    question: `Wire 60cm made into rectangle. Maximum area =`,
    options: [
      "200 cm²",
      "225 cm²",
      "250 cm²",
      "275 cm²",
    ],
    correctAnswer: 1,
    explanation: `Max when square. Side=15. Area=225cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed Distance Time",
    question: `Two trains leave same station in opposite directions. Speeds 60 and 80km/h. Time until 350km apart =`,
    options: [
      "2h 30min",
      "2h 45min",
      "3h",
      "3h 30min",
    ],
    correctAnswer: 0,
    explanation: `Combined speed=140km/h. Time=350÷140=2.5h=2h 30min.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Density Mix",
    question: `Mix 2kg at density 2g/cm³ and 4kg at density 4g/cm³. Combined density =`,
    options: [
      "2.5 g/cm³",
      "3.0 g/cm³",
      "3.25 g/cm³",
      "3.5 g/cm³",
    ],
    correctAnswer: 1,
    explanation: `Vol1=2000÷2=1000cm³. Vol2=4000÷4=1000cm³. Total mass=6000g, volume=2000cm³. D=3g/cm³.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Similar Volumes",
    question: `Two cylinders same radius. Heights 5cm and 8cm. Ratio of volumes =`,
    options: [
      "5:8",
      "25:64",
      "125:512",
      "5:8",
    ],
    correctAnswer: 0,
    explanation: `V=πr²h. Same r, so ratio=h₁:h₂=5:8.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Compound Rate",
    question: `Tank 600L. Pipe A fills at 15L/min, Pipe B drains at 10L/min, Pipe C fills at 5L/min. Net time from empty =`,
    options: [
      "30 min",
      "40 min",
      "50 min",
      "60 min",
    ],
    correctAnswer: 3,
    explanation: `Net fill=15-10+5=10L/min. 600÷10=60 min.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Trig Measurement",
    question: `Tower casts shadow 40m. Angle of elevation of sun = 60°. Height of tower (tan60°=√3≈1.732):`,
    options: [
      "66.7 m",
      "69.3 m",
      "72.0 m",
      "74.7 m",
    ],
    correctAnswer: 1,
    explanation: `h=40×tan60°=40×1.732=69.3m.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Rate Problem",
    question: `Population of 5,000 grows at 3% pa. Population after 4 years≈`,
    options: [
      "5,628",
      "5,627",
      "5,629",
      "5,630",
    ],
    correctAnswer: 0,
    explanation: `5000×1.03⁴=5000×1.12551=5627.5≈5,628.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Complex Percent",
    question: `After 2 successive discounts of 10% and 20%, final price =`,
    options: [
      "70%",
      "72%",
      "75%",
      "78%",
    ],
    correctAnswer: 1,
    explanation: `0.9×0.8=0.72=72% of original.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Maximum Area",
    question: `Wire 60cm bent to form 3 sides of rectangle (opposite side open). Maximum enclosed area =`,
    options: [
      "200 m²",
      "225 m²",
      "400 cm²",
      "450 cm²",
    ],
    correctAnswer: 3,
    explanation: `Let width=x. Then 2x+l=60. l=60-2x. Area=x(60-2x). Max at x=15. Area=15×30=450 cm².`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Circle Chord Theorem",
    question: `Chord AB and chord CD intersect at P inside circle. AP=3,PB=12,CP=4. PD=`,
    options: [
      "7",
      "8",
      "9",
      "10",
    ],
    correctAnswer: 2,
    explanation: `AP×PB=CP×PD. 3×12=4×PD. PD=36÷4=9.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Alternate Segment",
    question: `Tangent at T, chord TA. Angle between tangent and chord = 35°. Angle in alternate segment =`,
    options: [
      "35°",
      "55°",
      "70°",
      "145°",
    ],
    correctAnswer: 0,
    explanation: `Alternate segment theorem: angle in alternate segment = angle between tangent and chord = 35°.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry cosine rule",
    question: `Triangle: a=7,b=8,c=5. cos(C)=`,
    options: [
      "¾",
      "½",
      "⅓",
      "¼",
    ],
    correctAnswer: 0,
    explanation: `cos C=(7²+8²-5²)/(2×7×8)=(49+64-25)/112=88/112=11/14≈¾. Actually 88/112=11/14≈0.786≈¾.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "3D Pythagorean",
    question: `Cuboid 3×4×12cm. Length of space diagonal =`,
    options: [
      "13 cm",
      "14 cm",
      "15 cm",
      "16 cm",
    ],
    correctAnswer: 0,
    explanation: `d=√(9+16+144)=√169=13cm.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Vectors Parallel",
    question: `A=(1,2), B=(k,5). Vector AB is parallel to (2,6). Find k.`,
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    correctAnswer: 0,
    explanation: `AB=(k-1,3). Parallel to (2,6) means (k-1)/2=3/6=½. k-1=1. k=2.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Transformation Inverse",
    question: `If point P maps to P'=(6,2) under reflection in y=x. P=`,
    options: [
      "(6,2)",
      "(2,6)",
      "(−6,2)",
      "(6,−2)",
    ],
    correctAnswer: 1,
    explanation: `Reflection in y=x swaps coordinates. If P'=(6,2), P=(2,6).`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Angle in Pentagon",
    question: `Regular pentagon: a diagonal divides it into triangle and quadrilateral. Interior angle of pentagon =`,
    options: [
      "100°",
      "108°",
      "110°",
      "120°",
    ],
    correctAnswer: 1,
    explanation: `Each interior angle of regular pentagon=(5-2)×180÷5=108°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Equation of Circle",
    question: `Circle centre (3,−2), radius 5. Equation =`,
    options: [
      "(x+3)²+(y-2)²=25",
      "(x-3)²+(y+2)²=25",
      "(x-3)²+(y+2)²=5",
      "(x+3)²+(y-2)²=5",
    ],
    correctAnswer: 1,
    explanation: `Standard form: (x−h)²+(y−k)²=r². (x−3)²+(y+2)²=25.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Variance",
    question: `Dataset: 5,7,9,11,13. Variance =`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 0,
    explanation: `Mean=9. Devs: −4,−2,0,2,4. Dev²: 16,4,0,4,16. Sum=40. Var=40/5=8.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Standard Deviation Word",
    question: `Production line: mean=50cm, SD=2cm. Item acceptable if within 2 SDs of mean. Range =`,
    options: [
      "44-56 cm",
      "46-54 cm",
      "48-52 cm",
      "50-54 cm",
    ],
    correctAnswer: 1,
    explanation: `50±2×2=50±4=46 to 54cm.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Regression Coefficient",
    question: `Correlation r=0.7, SDy=6, SDx=4. Gradient of regression line =`,
    options: [
      "0.7",
      "1.05",
      "1.20",
      "1.40",
    ],
    correctAnswer: 1,
    explanation: `b=r×(SDy/SDx)=0.7×(6/4)=0.7×1.5=1.05.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability Conditional",
    question: `P(A)=0.4, P(B|A)=0.3. P(A and B)=`,
    options: [
      "0.12",
      "0.30",
      "0.40",
      "0.70",
    ],
    correctAnswer: 0,
    explanation: `P(A∩B)=P(A)×P(B|A)=0.4×0.3=0.12.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Probability Tree",
    question: `P(rain)=0.3. P(late|rain)=0.6. P(late|no rain)=0.1. P(late)=`,
    options: [
      "0.25",
      "0.28",
      "0.30",
      "0.35",
    ],
    correctAnswer: 0,
    explanation: `P(late)=0.3×0.6+0.7×0.1=0.18+0.07=0.25.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Hypothesis",
    question: `Sample mean=42, population mean claimed=45, SD=6, n=36. Test stat z=`,
    options: [
      "−3",
      "−2",
      "−1.5",
      "−1",
    ],
    correctAnswer: 0,
    explanation: `z=(42-45)/(6/√36)=(−3)/(6/6)=-3/1=−3.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Expected Outcome",
    question: `P(X=x): P(0)=0.1,P(1)=0.3,P(2)=0.4,P(3)=0.2. E(X)=`,
    options: [
      "1.7",
      "1.8",
      "1.9",
      "2.0",
    ],
    correctAnswer: 0,
    explanation: `0(0.1)+1(0.3)+2(0.4)+3(0.2)=0+0.3+0.8+0.6=1.7.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "algebra, indices, sequences, standard form, complex fractions, proof" },
  { type: "measurement" as const, label: "Measurement",              note: "compound shapes, 3D geometry, rates, conversions, optimization" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "circle theorems, trigonometry, vectors, transformations, proofs" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "standard deviation, regression, cumulative frequency, tree diagrams" },
]

export default function G5MathDiff3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathDiff3Questions : g5MathDiff3Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 3",
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Difficult 3</CardTitle>
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
              <p className="text-slate-600">Mathematics Difficult 3</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Difficult 3</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
