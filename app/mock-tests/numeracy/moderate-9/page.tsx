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

const g5MathMod9Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Algebra",
    question: `3x² = 75. x = ?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 1,
    explanation: `x²=25. x=5.`
  },
  {
    id: 2,
    type: "number",
    skill: "Simultaneous",
    question: `x+y=10 and x-y=4. x=?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 2,
    explanation: `Add: 2x=14. x=7.`
  },
  {
    id: 3,
    type: "number",
    skill: "Complex Fractions",
    question: `(3/4 - 1/3) ÷ (1/2 + 1/6) = ?`,
    options: [
      "5/8",
      "¾",
      "1",
      "5/6",
    ],
    correctAnswer: 0,
    explanation: `Numerator: 9/12-4/12=5/12. Denominator: 3/6+1/6=4/6=2/3. (5/12)÷(2/3)=5/12×3/2=15/24=5/8.`
  },
  {
    id: 4,
    type: "number",
    skill: "Indices",
    question: `x⁴ × x⁻² = ?`,
    options: [
      "x²",
      "x⁶",
      "x⁻⁸",
      "1/x²",
    ],
    correctAnswer: 0,
    explanation: `Add exponents: 4+(-2)=2. x².`
  },
  {
    id: 5,
    type: "number",
    skill: "Percentage Compound",
    question: `Price rises 10% per year. Current price $500. Price in 2 years =`,
    options: [
      "$600",
      "$602",
      "$605",
      "$610",
    ],
    correctAnswer: 2,
    explanation: `Year1:550. Year2:550×1.1=605.`
  },
  {
    id: 6,
    type: "number",
    skill: "Proportion",
    question: `Speed directly proportional to engine power. At 80kW speed=120km/h. Speed at 100kW =`,
    options: [
      "140 km/h",
      "145 km/h",
      "150 km/h",
      "160 km/h",
    ],
    correctAnswer: 2,
    explanation: `120/80=1.5km/h per kW. 100×1.5=150km/h.`
  },
  {
    id: 7,
    type: "number",
    skill: "Number Theory",
    question: `n is a positive integer. n(n+1) is always:`,
    options: [
      "Prime",
      "Even",
      "Odd",
      "A perfect square",
    ],
    correctAnswer: 1,
    explanation: `Product of consecutive integers is always even.`
  },
  {
    id: 8,
    type: "number",
    skill: "Real World",
    question: `Salary $3,600/month. Income tax 25%. Net monthly salary =`,
    options: [
      "$2,500",
      "$2,700",
      "$2,750",
      "$2,800",
    ],
    correctAnswer: 1,
    explanation: `Tax=25%×3600=$900. Net=3600-900=$2,700.`
  },
  {
    id: 9,
    type: "number",
    skill: "Inequality",
    question: `Solve 5-2x>1.`,
    options: [
      "x>2",
      "x<2",
      "x>-2",
      "x<-2",
    ],
    correctAnswer: 1,
    explanation: `−2x>-4. x<2 (dividing by negative flips).`
  },
  {
    id: 10,
    type: "number",
    skill: "Factorisation",
    question: `Factorise 6x+9 =`,
    options: [
      "3(2x+3)",
      "6(x+3)",
      "3(2x+9)",
      "2(3x+9)",
    ],
    correctAnswer: 0,
    explanation: `GCF=3. 3(2x+3).`
  },
  {
    id: 11,
    type: "number",
    skill: "Proportion",
    question: `If 1 kg of apples costs $120, cost of 750g =`,
    options: [
      "$80",
      "$85",
      "$90",
      "$95",
    ],
    correctAnswer: 2,
    explanation: `750g=¾kg. ¾×120=$90.`
  },
  {
    id: 12,
    type: "number",
    skill: "Fraction Equation",
    question: `3/(x+2)=1/4. x=?`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 1,
    explanation: `4×3=x+2. 12=x+2. x=10.`
  },
  {
    id: 13,
    type: "number",
    skill: "Interest",
    question: `Loan $2,400 at 8% per annum simple interest. Interest for 18 months =`,
    options: [
      "$268",
      "$276",
      "$288",
      "$296",
    ],
    correctAnswer: 2,
    explanation: `I=2400×0.08×1.5=$288.`
  },
  {
    id: 14,
    type: "number",
    skill: "Largest Fraction",
    question: `Largest of: 7/9, 5/6, 11/15, 4/5 =`,
    options: [
      "7/9",
      "5/6",
      "11/15",
      "4/5",
    ],
    correctAnswer: 1,
    explanation: `LCD=90: 70/90,75/90,66/90,72/90. Largest=75/90=5/6.`
  },
  {
    id: 15,
    type: "number",
    skill: "Word Problem",
    question: `A train 200m long travels at 72km/h. Time to pass a point =`,
    options: [
      "8 s",
      "10 s",
      "12 s",
      "15 s",
    ],
    correctAnswer: 1,
    explanation: `72km/h=20m/s. 200÷20=10s.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Volume Compound",
    question: `A swimming pool: rectangular base 25m×10m, depth 2m at shallow, 3m at deep. Average depth=2.5m. Volume =`,
    options: [
      "500 m³",
      "625 m³",
      "750 m³",
      "875 m³",
    ],
    correctAnswer: 1,
    explanation: `V=25×10×2.5=625 m³.`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Triangular Prism SA",
    question: `Right-triangle prism: legs 3cm & 4cm, hyp 5cm, length 10cm. Total SA =`,
    options: [
      "108 cm²",
      "112 cm²",
      "120 cm²",
      "132 cm²",
    ],
    correctAnswer: 3,
    explanation: `2×(½×3×4)+10×(3+4+5)=12+120=132 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Speed Conversion",
    question: `A runner's pace is 5 minutes per km. Speed in km/h =`,
    options: [
      "10 km/h",
      "12 km/h",
      "15 km/h",
      "20 km/h",
    ],
    correctAnswer: 1,
    explanation: `60÷5=12 km/h.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Percentage",
    question: `House valued $840,000. Agent charges 2.5%. Commission =`,
    options: [
      "$20,000",
      "$21,000",
      "$22,000",
      "$24,000",
    ],
    correctAnswer: 1,
    explanation: `2.5%×840,000=$21,000.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Area Compound",
    question: `Regular hexagon with side 8cm (area=6×⅔×s²×sin60°). Area≈`,
    options: [
      "166 cm²",
      "175 cm²",
      "183 cm²",
      "196 cm²",
    ],
    correctAnswer: 0,
    explanation: `A=3√3/2×s²=3×1.732/2×64=2.598×64≈166 cm².`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Time Word",
    question: `Work shifts: Mon-Fri 7.5h, Sat 5h. Weekly hours =`,
    options: [
      "40 h",
      "42 h",
      "42.5 h",
      "45 h",
    ],
    correctAnswer: 2,
    explanation: `5×7.5=37.5. +5=42.5h.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Conversion Volume",
    question: `Convert 4.5 kL to mL.`,
    options: [
      "4,500 mL",
      "45,000 mL",
      "450,000 mL",
      "4,500,000 mL",
    ],
    correctAnswer: 3,
    explanation: `4.5kL=4,500L=4,500,000mL.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Profit Loss",
    question: `Bought for $1,200, sold for $960. % loss =`,
    options: [
      "15%",
      "17%",
      "20%",
      "22%",
    ],
    correctAnswer: 2,
    explanation: `Loss=$240. %=240/1200×100=20%.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Scale Factor Area",
    question: `Two similar fields. Linear scale 1:4. Smaller area 50m². Larger area =`,
    options: [
      "200 m²",
      "400 m²",
      "600 m²",
      "800 m²",
    ],
    correctAnswer: 3,
    explanation: `Area scale=4²=16. 50×16=800 m².`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Complex Time",
    question: `Start 08:45, work 6h 45min, break 30min, then work 2h 15min. Finish time =`,
    options: [
      "5:45 PM",
      "6:00 PM",
      "6:15 PM",
      "6:30 PM",
    ],
    correctAnswer: 2,
    explanation: `08:45+6h45min=15:30. +30min break=16:00. +2h15min=18:15=6:15PM.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Tangent-Radius",
    question: `Tangent from external point=15cm, radius=9cm. Distance from point to centre =`,
    options: [
      "14 cm",
      "17 cm",
      "18 cm",
      "24 cm",
    ],
    correctAnswer: 1,
    explanation: `d=√(15²+9²)=√(225+81)=√306≈17.5≈17 cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Composite Transformation",
    question: `Point (2,3): reflect in x-axis → rotate 90° anticlockwise. Final position =`,
    options: [
      "(3,2)",
      "(3,-2)",
      "(-3,2)",
      "(-3,-2)",
    ],
    correctAnswer: 0,
    explanation: `(2,3)→reflect x-axis→(2,-3)→rotate 90° CCW: (x,y)→(-y,x)→(3,2).`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry",
    question: `In right triangle: cos(30°)=√3/2. If hyp=20cm, adjacent =`,
    options: [
      "10 cm",
      "10√3 cm",
      "15 cm",
      "17.32 cm",
    ],
    correctAnswer: 1,
    explanation: `adj=20×(√3/2)=10√3≈17.32cm. Index 1 (10√3).`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Congruence",
    question: `Two triangles with same angles but different side lengths are:`,
    options: [
      "Congruent",
      "Similar",
      "Identical",
      "Neither",
    ],
    correctAnswer: 1,
    explanation: `Same angles, different sizes = similar triangles.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Circle Chord Length",
    question: `Circle radius 13cm. Chord is 5cm from centre. Chord length =`,
    options: [
      "12 cm",
      "20 cm",
      "24 cm",
      "26 cm",
    ],
    correctAnswer: 2,
    explanation: `Half-chord=√(169-25)=√144=12. Full chord=24 cm.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Exterior Angle",
    question: `Exterior angle of a polygon = 24°. Number of sides =`,
    options: [
      "12",
      "14",
      "15",
      "18",
    ],
    correctAnswer: 2,
    explanation: `360÷24=15.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "3D",
    question: `Hemisphere sits on cylinder, both radius 5cm. Cylinder height 8cm. Total volume (π=3.14):`,
    options: [
      "523+261=784 cm³",
      "628+261=889 cm³",
      "628+523=1,151 cm³",
      "1,256 cm³",
    ],
    correctAnswer: 1,
    explanation: `Cylinder=π×25×8=628cm³. Hemisphere=⅔π×125=261.67cm³. Total≈628+262=890. Closest: 628+261=889 cm³.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Coordinate Proof",
    question: `Gradient of line through A(2,5) and B(6,1) =`,
    options: [
      "−1",
      "1",
      "−2",
      "2",
    ],
    correctAnswer: 0,
    explanation: `(1-5)÷(6-2)=-4÷4=-1.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Grouped Mean",
    question: `Classes: 0-10(f=4),10-20(f=8),20-30(f=6),30-40(f=2). Estimated mean =`,
    options: [
      "15",
      "16",
      "18",
      "20",
    ],
    correctAnswer: 2,
    explanation: `(4×5+8×15+6×25+2×35)÷20=(20+120+150+70)÷20=360÷20=18.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Probability",
    question: `Two dice rolled. P(total>9)=`,
    options: [
      "1/6",
      "1/5",
      "1/4",
      "1/3",
    ],
    correctAnswer: 0,
    explanation: `Totals>9: (4,6),(5,5),(5,6),(6,4),(6,5),(6,6)=6 pairs. P=6/36=1/6.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Standard Deviation",
    question: `Set with values all equal to 7. Standard deviation =`,
    options: [
      "0",
      "1",
      "7",
      "14",
    ],
    correctAnswer: 0,
    explanation: `All values are the same — no spread. SD=0.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Sampling Bias",
    question: `A survey conducted only online may be biased because:`,
    options: [
      "Too many questions",
      "It excludes people without internet access",
      "Online surveys are always wrong",
      "Computers cannot do surveys",
    ],
    correctAnswer: 1,
    explanation: `People without internet are excluded, making the sample unrepresentative.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Normal Distribution",
    question: `In normal distribution, 68% of data lies within ___ of mean.`,
    options: [
      "1 SD",
      "2 SD",
      "3 SD",
      "4 SD",
    ],
    correctAnswer: 0,
    explanation: `68% of data falls within 1 standard deviation of the mean.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Regression",
    question: `Line of best fit: y=−2x+30. When x=7, y=`,
    options: [
      "14",
      "16",
      "18",
      "20",
    ],
    correctAnswer: 1,
    explanation: `y=-2(7)+30=30-14=16.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Data Interpretation",
    question: `A survey of 40 students: 15 prefer Maths, 12 English, 8 Science, 5 Art. Most popular subject =`,
    options: [
      "Maths",
      "English",
      "Science",
      "Art",
    ],
    correctAnswer: 0,
    explanation: `15 is the highest frequency. Most popular = Maths.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "multi-step operations, fractions, decimals, percentages, ratio, proportion, integers" },
  { type: "measurement" as const, label: "Measurement",              note: "composite area, volume, speed, time, money, conversions" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "angle relationships, 2D & 3D shapes, coordinates, transformations" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "mean, median, mode, range, frequency tables, probability" },
]

export default function G5MathMod9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod9Questions : g5MathMod9Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 9",
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 9</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 9</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 9</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
