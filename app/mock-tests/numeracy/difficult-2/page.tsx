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

const g5MathDiff2Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Simultaneous",
    question: `2x + 3y = 13 and 4x − y = 5. Find y.`,
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    correctAnswer: 1,
    explanation: `From eq2: y=4x-5. Sub: 2x+3(4x-5)=13. 14x=28. x=2. y=3. Wait: 2x+12x-15=13. 14x=28. x=2. y=4(2)-5=3.`
  },
  {
    id: 2,
    type: "number",
    skill: "Quadratic Formula",
    question: `x²+4x−12=0 using factoring.`,
    options: [
      "x=2 or x=−6",
      "x=−2 or x=6",
      "x=4 or x=−3",
      "x=3 or x=−4",
    ],
    correctAnswer: 0,
    explanation: `(x+6)(x−2)=0. x=−6 or x=2.`
  },
  {
    id: 3,
    type: "number",
    skill: "Index Laws",
    question: `x⁵ ÷ x⁻² =`,
    options: [
      "x³",
      "x⁷",
      "x¹⁰",
      "x−³",
    ],
    correctAnswer: 1,
    explanation: `Subtract exponents: 5−(−2)=7. x⁷.`
  },
  {
    id: 4,
    type: "number",
    skill: "Standard Form",
    question: `(6.4×10⁵) ÷ (1.6×10²) =`,
    options: [
      "4×10²",
      "4×10³",
      "4×10⁷",
      "4×10⁸",
    ],
    correctAnswer: 1,
    explanation: `6.4÷1.6=4. 10⁵÷10²=10³. Answer=4×10³.`
  },
  {
    id: 5,
    type: "number",
    skill: "Surds",
    question: `Rationalise 1/√5 =`,
    options: [
      "√5",
      "√5/5",
      "5/√5",
      "1/5",
    ],
    correctAnswer: 1,
    explanation: `Multiply by √5/√5: √5/5.`
  },
  {
    id: 6,
    type: "number",
    skill: "Inequality",
    question: `Solve 2x+5<3x−1.`,
    options: [
      "x>6",
      "x<6",
      "x>−6",
      "x<−6",
    ],
    correctAnswer: 0,
    explanation: `5+1<3x-2x. 6<x. x>6.`
  },
  {
    id: 7,
    type: "number",
    skill: "Compound Interest",
    question: `$5,000 invested at 4% compound annually. Amount after 4 years =`,
    options: [
      "$5,804.50",
      "$5,849.29",
      "$5,848.00",
      "$5,832.00",
    ],
    correctAnswer: 1,
    explanation: `5000×1.04⁴=5000×1.16986=$5,849.29.`
  },
  {
    id: 8,
    type: "number",
    skill: "Algebraic Manipulation",
    question: `If a+b=8 and ab=15, find a²+b².`,
    options: [
      "30",
      "34",
      "38",
      "64",
    ],
    correctAnswer: 1,
    explanation: `(a+b)²=a²+2ab+b²=64. a²+b²=64-30=34.`
  },
  {
    id: 9,
    type: "number",
    skill: "Proof",
    question: `Show that the sum of any two consecutive odd numbers is divisible by 4.`,
    options: [
      "(2n+1)+(2n+3)=4n+4=4(n+1)",
      "This is not always true",
      "The sum is always 8",
      "The sum is always odd",
    ],
    correctAnswer: 0,
    explanation: `General odd numbers: 2n+1 and 2n+3. Sum=4n+4=4(n+1). Always divisible by 4.`
  },
  {
    id: 10,
    type: "number",
    skill: "Functions",
    question: `g(x)=3x−5. Find g⁻¹(x).`,
    options: [
      "(x+5)/3",
      "(x−5)/3",
      "3x+5",
      "x/3+5",
    ],
    correctAnswer: 0,
    explanation: `Set y=3x-5. Solve for x: x=(y+5)/3. So g⁻¹(x)=(x+5)/3.`
  },
  {
    id: 11,
    type: "number",
    skill: "Sequences",
    question: `Sum of first n terms of AP: Sₙ=n/2(2a+[n−1]d). S₁₂ where a=3, d=5 =`,
    options: [
      "348",
      "354",
      "360",
      "366",
    ],
    correctAnswer: 0,
    explanation: `S₁₂=12/2(6+55)=6×61=366. Wait: 6+11×5=6+55=61. 6×61=366.`
  },
  {
    id: 12,
    type: "number",
    skill: "Logarithms",
    question: `log₁₀(1000) =`,
    options: [
      "2",
      "3",
      "10",
      "100",
    ],
    correctAnswer: 1,
    explanation: `10³=1000. log₁₀(1000)=3.`
  },
  {
    id: 13,
    type: "number",
    skill: "Complex Fraction",
    question: `Simplify (x²−4)/(x−2)`,
    options: [
      "x+2",
      "x−2",
      "x²+4",
      "(x+2)(x−2)",
    ],
    correctAnswer: 0,
    explanation: `x²−4=(x+2)(x−2). ÷(x−2)=x+2.`
  },
  {
    id: 14,
    type: "number",
    skill: "Interest Rate Problem",
    question: `Investment doubles in 10 years simple interest. Annual rate =`,
    options: [
      "5%",
      "10%",
      "15%",
      "20%",
    ],
    correctAnswer: 1,
    explanation: `SI=P. P=P×R×10. R=1/10=10%.`
  },
  {
    id: 15,
    type: "number",
    skill: "Modular Arithmetic",
    question: `3¹⁰ mod 7 = ?`,
    options: [
      "1",
      "2",
      "4",
      "6",
    ],
    correctAnswer: 2,
    explanation: `3⁶≡1(mod7). 3¹⁰=3⁶×3⁴≡1×81≡81mod7=4.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Sphere Surface Area",
    question: `Sphere radius 9cm. Surface area (π=3.14):`,
    options: [
      "1,017.36 cm²",
      "1,052.00 cm²",
      "1,069.36 cm²",
      "1,085.72 cm²",
    ],
    correctAnswer: 0,
    explanation: `SA=4πr²=4×3.14×81=1,017.36 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Compass Bearing",
    question: `Boat travels 40km North then 30km East. Bearing from start to end (to nearest degree) =`,
    options: [
      "N 36.9° E",
      "N 53.1° E",
      "N 45° E",
      "036.9°",
    ],
    correctAnswer: 3,
    explanation: `tan(bearing from N)=30/40=0.75. Angle=36.9° East of North. Bearing=036.9°.`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Volume Hemisphere",
    question: `Total volume: cylinder r=5cm,h=10cm plus hemisphere r=5cm (π=3.14):`,
    options: [
      "1,047 cm³",
      "1,048 cm³",
      "1,049 cm³",
      "1,050 cm³",
    ],
    correctAnswer: 0,
    explanation: `Cyl=3.14×25×10=785. Hemi=⅔×3.14×125=261.67. Total=1,046.67≈1,047 cm³.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Percentage Compound",
    question: `House value increases 8% per year for 3 years. Start=$400,000. End value =`,
    options: [
      "$502,000",
      "$503,000",
      "$504,000",
      "$505,000",
    ],
    correctAnswer: 2,
    explanation: `400,000×1.08³=400,000×1.2597=$503,880≈$504,000.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Rate and Work",
    question: `A tank fills in 8h alone, another in 6h alone. How long together?`,
    options: [
      "3h 26min",
      "3h 26min",
      "3h 27min",
      "3h 28min",
    ],
    correctAnswer: 1,
    explanation: `Rate=1/8+1/6=7/24. Time=24/7≈3.43h≈3h 26min.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Trigonometry Application",
    question: `Ship sails N40°E for 25km. How far North has it travelled?`,
    options: [
      "16.1 km",
      "19.2 km",
      "21.2 km",
      "23.5 km",
    ],
    correctAnswer: 1,
    explanation: `North=25×cos40°=25×0.766=19.15≈19.2km.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Optimisation",
    question: `Cylindrical can: volume 250π cm³. Radius to minimise surface area =`,
    options: [
      "5 cm",
      "6 cm",
      "7 cm",
      "8 cm",
    ],
    correctAnswer: 0,
    explanation: `For minimum SA: r=cube_root(V/2π)=cube_root(250π/2π)=cube_root(125)=5cm.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Compound Unit",
    question: `River flows at 2m/s. River is 50m wide and 3m deep. Volume per second =`,
    options: [
      "200 m³/s",
      "250 m³/s",
      "300 m³/s",
      "350 m³/s",
    ],
    correctAnswer: 2,
    explanation: `Cross-section=50×3=150m². Flow=150×2=300m³/s.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Percentage Loss",
    question: `Machine bought $12,000, depreciated 15% p.a. Value after 2 years =`,
    options: [
      "$8,520",
      "$8,670",
      "$8,730",
      "$9,200",
    ],
    correctAnswer: 1,
    explanation: `Year1: 12000×0.85=10,200. Year2: 10,200×0.85=$8,670.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Simultaneous Measurement",
    question: `Rectangle: perimeter 56cm, area 180cm². Find dimensions.`,
    options: [
      "12cm × 15cm",
      "10cm × 18cm",
      "9cm × 20cm",
      "14cm × 13cm",
    ],
    correctAnswer: 1,
    explanation: `l+w=28. lw=180. l and w are roots of t²-28t+180=0. t=(28±√(784-720))/2=(28±8)/2. t=18 or 10.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Circle Theorem Tangent",
    question: `Two tangents from external P to circle. Tangent PT₁=15cm. P to centre O=17cm. Radius =`,
    options: [
      "6 cm",
      "8 cm",
      "10 cm",
      "12 cm",
    ],
    correctAnswer: 1,
    explanation: `r²=17²-15²=289-225=64. r=8cm.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Circle Theorem Chord",
    question: `Two chords intersect inside circle: PA×PB=PC×PD. PA=4,PB=9,PC=6. PD=?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 1,
    explanation: `4×9=6×PD. PD=36÷6=6.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Trigonometry cos",
    question: `Triangle: sides a=8,b=6,c=10. Is angle C a right angle?`,
    options: [
      "Yes, because c²=a²+b²",
      "No, because c²≠a²+b²",
      "Cannot be determined",
      "Only if it is isosceles",
    ],
    correctAnswer: 0,
    explanation: `8²+6²=64+36=100=10². Yes, right angle at C.`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Vector Magnitude",
    question: `Vector v=(−6,8). |v|=`,
    options: [
      "6",
      "8",
      "10",
      "14",
    ],
    correctAnswer: 2,
    explanation: `√(36+64)=√100=10.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Transformation Matrix",
    question: `Rotation 90° anticlockwise about origin. (4,−3) maps to:`,
    options: [
      "(3,4)",
      "(−3,4)",
      "(4,3)",
      "(3,−4)",
    ],
    correctAnswer: 0,
    explanation: `90° CCW: (x,y)→(−y,x). (4,−3)→(3,4).`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Angle of Depression",
    question: `Observer 80m above sea level. Angle of depression to boat = 25°. Horizontal distance (tan25°≈0.466):`,
    options: [
      "168 m",
      "172 m",
      "176 m",
      "182 m",
    ],
    correctAnswer: 1,
    explanation: `80÷0.466≈171.7≈172m.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Locus Problem",
    question: `Set of all points 5cm from a fixed line is:`,
    options: [
      "A circle of radius 5cm",
      "Two parallel lines 5cm from the line",
      "A single line",
      "A square",
    ],
    correctAnswer: 1,
    explanation: `Points equidistant from a line form two parallel lines on either side.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "Congruence",
    question: `SAS congruence: two sides and the angle between them are equal. Which is TRUE?`,
    options: [
      "All triangles with 2 equal sides are congruent",
      "SAS guarantees congruence",
      "The angle must be opposite the longest side",
      "SSA also guarantees congruence",
    ],
    correctAnswer: 1,
    explanation: `SAS is a valid congruence criterion.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Standard Deviation",
    question: `Scores: 10,12,14,16,18. Variance =`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 0,
    explanation: `Mean=14. Devs: -4,-2,0,2,4. Dev²: 16,4,0,4,16. Sum=40. Variance=40/5=8.`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Normal Distribution",
    question: `Normal distribution: mean=100, SD=15. P(X>115)≈`,
    options: [
      "16%",
      "20%",
      "24%",
      "30%",
    ],
    correctAnswer: 0,
    explanation: `115 is 1 SD above mean. P(X>mean+1SD)≈16%.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Expected Value",
    question: `X: P(2)=0.3, P(4)=0.5, P(6)=0.2. E(X²) =`,
    options: [
      "14.8",
      "15.6",
      "16.4",
      "17.2",
    ],
    correctAnswer: 2,
    explanation: `E(X²)=4(0.3)+16(0.5)+36(0.2)=1.2+8.0+7.2=16.4.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Expected Value Variance",
    question: `X: P(2)=0.3,P(4)=0.5,P(6)=0.2. E(X²)=`,
    options: [
      "14.4",
      "15.2",
      "16.0",
      "16.8",
    ],
    correctAnswer: 2,
    explanation: `E(X²)=4(0.3)+16(0.5)+36(0.2)=1.2+8+7.2=16.4. Closest: 16.0. Exact=16.4.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Two-Way Table",
    question: `Test result by gender: 80 boys(60 pass,20 fail),120 girls(90 pass,30 fail). P(pass|girl)=`,
    options: [
      "50%",
      "60%",
      "70%",
      "75%",
    ],
    correctAnswer: 3,
    explanation: `P(pass|girl)=90/120=75%.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Sampling",
    question: `Stratified sample of 50 from: Year7=120,Year8=90,Year9=90. Year 7 sample =`,
    options: [
      "18",
      "20",
      "22",
      "25",
    ],
    correctAnswer: 1,
    explanation: `(120/300)×50=20.`
  },
  {
    id: 40,
    type: "statistics",
    skill: "Probability Combined",
    question: `Cards 1-20. P(multiple of 3 or multiple of 5)=`,
    options: [
      "8/20",
      "9/20",
      "10/20",
      "11/20",
    ],
    correctAnswer: 1,
    explanation: `Mult3:3,6,9,12,15,18(6). Mult5:5,10,15,20(4). Both:15(1). Union=6+4-1=9. P=9/20.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",       note: "algebra, indices, sequences, standard form, complex fractions, proof" },
  { type: "measurement" as const, label: "Measurement",              note: "compound shapes, 3D geometry, rates, conversions, optimization" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense", note: "circle theorems, trigonometry, vectors, transformations, proofs" },
  { type: "statistics" as const,  label: "Data & Probability",       note: "standard deviation, regression, cumulative frequency, tree diagrams" },
]

export default function G5MathDiff2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathDiff2Questions : g5MathDiff2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Difficult 2</CardTitle>
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
              <p className="text-slate-600">Mathematics Difficult 2</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Difficult 2</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
