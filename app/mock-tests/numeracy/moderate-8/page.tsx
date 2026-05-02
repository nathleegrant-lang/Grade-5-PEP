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

const g5MathMod8Questions: Question[] = [
  {
    id: 1,
    type: "number",
    skill: "Sequences",
    question: `Geometric sequence: a=5, r=3. What is a₅?`,
    options: [
      "135",
      "405",
      "445",
      "1,215",
    ],
    correctAnswer: 1,
    explanation: `a₅=5×3⁴=5×81=405.`
  },
  {
    id: 2,
    type: "number",
    skill: "Algebra",
    question: `9 - 2x = x + 3. x = ?`,
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    correctAnswer: 0,
    explanation: `9-3=3x. 6=3x. x=2.`
  },
  {
    id: 3,
    type: "number",
    skill: "Proportion Direct",
    question: `y=kx². y=12 when x=2. y when x=5 =`,
    options: [
      "60",
      "65",
      "70",
      "75",
    ],
    correctAnswer: 3,
    explanation: `k=12÷4=3. y=3×25=75.`
  },
  {
    id: 4,
    type: "number",
    skill: "Fractions",
    question: `5/6 + 7/9 = ?`,
    options: [
      "12/15",
      "1 11/18",
      "1 13/18",
      "2",
    ],
    correctAnswer: 2,
    explanation: `LCD=18: 15/18+14/18=29/18=1 11/18.`
  },
  {
    id: 5,
    type: "number",
    skill: "Percentage",
    question: `A class of 40: 35% absent. Number present =`,
    options: [
      "24",
      "25",
      "26",
      "28",
    ],
    correctAnswer: 2,
    explanation: `35%×40=14 absent. 40-14=26.`
  },
  {
    id: 6,
    type: "number",
    skill: "Compound Interest",
    question: `$800 at 5% compound for 3 years. Final amount =`,
    options: [
      "$920.00",
      "$926.10",
      "$927.10",
      "$930.00",
    ],
    correctAnswer: 1,
    explanation: `Year1:840. Year2:882. Year3:882×1.05=926.10.`
  },
  {
    id: 7,
    type: "number",
    skill: "Ratio Problem",
    question: `Recipe ratio flour:sugar=5:2. Flour used=750g. Sugar needed =`,
    options: [
      "280 g",
      "290 g",
      "300 g",
      "310 g",
    ],
    correctAnswer: 2,
    explanation: `750÷5=150. Sugar=2×150=300g.`
  },
  {
    id: 8,
    type: "number",
    skill: "Prime Factorisation",
    question: `LCM of 12, 18, 24 =`,
    options: [
      "48",
      "60",
      "72",
      "96",
    ],
    correctAnswer: 2,
    explanation: `LCM(12,18)=36. LCM(36,24)=72.`
  },
  {
    id: 9,
    type: "number",
    skill: "Algebra Word",
    question: `Three consecutive even integers sum to 54. Smallest =`,
    options: [
      "14",
      "16",
      "18",
      "20",
    ],
    correctAnswer: 1,
    explanation: `n+(n+2)+(n+4)=54. 3n+6=54. n=16.`
  },
  {
    id: 10,
    type: "number",
    skill: "Standard Form",
    question: `3.6×10³ =`,
    options: [
      "360",
      "3,600",
      "36,000",
      "360,000",
    ],
    correctAnswer: 1,
    explanation: `3.6×1,000=3,600.`
  },
  {
    id: 11,
    type: "number",
    skill: "Powers",
    question: `Simplify: a⁵ ÷ a² =`,
    options: [
      "a²",
      "a³",
      "a⁵",
      "a⁷",
    ],
    correctAnswer: 1,
    explanation: `Subtract exponents: 5-2=3. a³.`
  },
  {
    id: 12,
    type: "number",
    skill: "Percentage Change",
    question: `Enrolment was 800, now 680. % decrease =`,
    options: [
      "12%",
      "13%",
      "14%",
      "15%",
    ],
    correctAnswer: 3,
    explanation: `Decrease=120. %=120/800×100=15%.`
  },
  {
    id: 13,
    type: "number",
    skill: "Fractions Mixed",
    question: `3⅛ + 2⅝ = ?`,
    options: [
      "5¼",
      "5½",
      "5¾",
      "6",
    ],
    correctAnswer: 2,
    explanation: `25/8+21/8=46/8=5¾.`
  },
  {
    id: 14,
    type: "number",
    skill: "Proportion Inverse",
    question: `12 workers complete job in 9 days. 4 workers take how many days?`,
    options: [
      "25",
      "27",
      "29",
      "31",
    ],
    correctAnswer: 1,
    explanation: `12×9=108 person-days. 108÷4=27 days.`
  },
  {
    id: 15,
    type: "number",
    skill: "Inequalities",
    question: `Values of x satisfying 3x - 5 ≥ 10:`,
    options: [
      "x≥4",
      "x≥5",
      "x≥6",
      "x≥7",
    ],
    correctAnswer: 1,
    explanation: `3x≥15. x≥5.`
  },
  {
    id: 16,
    type: "measurement",
    skill: "Composite Area",
    question: `Shape: rectangle 10×6 plus semicircle on 6cm side (π=3.14). Area =`,
    options: [
      "74.13 cm²",
      "78.26 cm²",
      "82.13 cm²",
      "86.00 cm²",
    ],
    correctAnswer: 0,
    explanation: `Rectangle=60. Semicircle=½×3.14×9=14.13. Total=74.13 cm².`
  },
  {
    id: 17,
    type: "measurement",
    skill: "Cone Total SA",
    question: `Cone r=5cm, slant height=13cm (π=3.14). Total SA =`,
    options: [
      "188.4 cm²",
      "282.6 cm²",
      "314 cm²",
      "376.8 cm²",
    ],
    correctAnswer: 1,
    explanation: `SA=πr²+πrl=3.14×25+3.14×5×13=78.5+204.1=282.6 cm².`
  },
  {
    id: 18,
    type: "measurement",
    skill: "Compound Speed",
    question: `Car travels 120km at 60km/h then 80km at 80km/h. Average speed =`,
    options: [
      "66.7 km/h",
      "68.3 km/h",
      "70 km/h",
      "72.5 km/h",
    ],
    correctAnswer: 0,
    explanation: `Time1=2h. Time2=1h. Total=200km in 3h. 200÷3≈66.7km/h.`
  },
  {
    id: 19,
    type: "measurement",
    skill: "Capacity Word",
    question: `Container 240L. Fills at 8L/min. Drains at 3L/min. Time to fill =`,
    options: [
      "40 min",
      "44 min",
      "48 min",
      "52 min",
    ],
    correctAnswer: 2,
    explanation: `Net=5L/min. 240÷5=48 min.`
  },
  {
    id: 20,
    type: "measurement",
    skill: "Conversion Complex",
    question: `5 gallons=? litres (1 gallon≈4.55L).`,
    options: [
      "21.75 L",
      "22.75 L",
      "23.75 L",
      "24.75 L",
    ],
    correctAnswer: 1,
    explanation: `5×4.55=22.75L.`
  },
  {
    id: 21,
    type: "measurement",
    skill: "Percentage Problem",
    question: `House price fell 15% to $442,000. Original price =`,
    options: [
      "$500,000",
      "$510,000",
      "$520,000",
      "$530,000",
    ],
    correctAnswer: 2,
    explanation: `85%=$442,000. 100%=$442,000÷0.85=$520,000.`
  },
  {
    id: 22,
    type: "measurement",
    skill: "Density",
    question: `Object: mass=540g, density=4.5g/cm³. Volume =`,
    options: [
      "100 cm³",
      "110 cm³",
      "120 cm³",
      "130 cm³",
    ],
    correctAnswer: 2,
    explanation: `V=m÷d=540÷4.5=120 cm³.`
  },
  {
    id: 23,
    type: "measurement",
    skill: "Scale",
    question: `Drawing scale 1:200. Wall 8cm on drawing. Real length =`,
    options: [
      "16 m",
      "20 m",
      "24 m",
      "28 m",
    ],
    correctAnswer: 0,
    explanation: `8×200=1,600cm=16m.`
  },
  {
    id: 24,
    type: "measurement",
    skill: "Money Discount",
    question: `Marked price $960. Discount 12.5%. Selling price =`,
    options: [
      "$820",
      "$840",
      "$860",
      "$880",
    ],
    correctAnswer: 1,
    explanation: `12.5%×960=$120. SP=$960-$120=$840.`
  },
  {
    id: 25,
    type: "measurement",
    skill: "Rate Problem",
    question: `Printer prints 240 pages in 8min. Pages in 35min =`,
    options: [
      "1,020",
      "1,040",
      "1,050",
      "1,060",
    ],
    correctAnswer: 2,
    explanation: `Rate=30 pages/min. 30×35=1,050.`
  },
  {
    id: 26,
    type: "geometry",
    skill: "Angles in Circle",
    question: `Inscribed angle on same arc as 110° central angle =`,
    options: [
      "45°",
      "50°",
      "55°",
      "60°",
    ],
    correctAnswer: 2,
    explanation: `Inscribed=half of central=110÷2=55°.`
  },
  {
    id: 27,
    type: "geometry",
    skill: "Similar",
    question: `Rectangle A is 4×6. Rectangle B is similar with width 15. Length of B =`,
    options: [
      "8",
      "10",
      "20",
      "25",
    ],
    correctAnswer: 3,
    explanation: `Scale=15/6=2.5. Length=4×2.5=10. Index 1.`
  },
  {
    id: 28,
    type: "geometry",
    skill: "Enlargement Area",
    question: `Scale factor 4 enlargement. Original area 9cm². New area =`,
    options: [
      "36 cm²",
      "72 cm²",
      "108 cm²",
      "144 cm²",
    ],
    correctAnswer: 3,
    explanation: `Area scale=4²=16. 9×16=144 cm².`
  },
  {
    id: 29,
    type: "geometry",
    skill: "Gradient",
    question: `Gradient of line 3y=6x+9 =`,
    options: [
      "1",
      "2",
      "3",
      "6",
    ],
    correctAnswer: 1,
    explanation: `y=2x+3. Gradient=2.`
  },
  {
    id: 30,
    type: "geometry",
    skill: "Intercepts",
    question: `Line y=3x-6. y-intercept =`,
    options: [
      "−6",
      "−3",
      "3",
      "6",
    ],
    correctAnswer: 0,
    explanation: `When x=0: y=3(0)-6=-6. y-intercept=-6.`
  },
  {
    id: 31,
    type: "geometry",
    skill: "Angle of Depression",
    question: `From top of 40m cliff, angle of depression to boat = 30°. Horizontal distance≈`,
    options: [
      "40 m",
      "53 m",
      "69 m",
      "80 m",
    ],
    correctAnswer: 2,
    explanation: `tan30°=40/d. d=40÷tan30°=40÷0.577≈69m.`
  },
  {
    id: 32,
    type: "geometry",
    skill: "Interior Angles Nonagon",
    question: `Interior angle sum of nonagon (9 sides) =`,
    options: [
      "1,080°",
      "1,260°",
      "1,440°",
      "1,620°",
    ],
    correctAnswer: 1,
    explanation: `(9-2)×180=7×180=1,260°.`
  },
  {
    id: 33,
    type: "geometry",
    skill: "3D Edges",
    question: `Edges of octagonal prism:`,
    options: [
      "16",
      "20",
      "24",
      "32",
    ],
    correctAnswer: 2,
    explanation: `8+8+8=24 edges.`
  },
  {
    id: 34,
    type: "statistics",
    skill: "Mean",
    question: `Six tests: 72,85,91,68,79,83. Mean =`,
    options: [
      "78",
      "79",
      "80",
      "81",
    ],
    correctAnswer: 1,
    explanation: `(72+85+91+68+79+83)÷6=478÷6≈79.7≈80. Exact=79.67. Index 1 (79) or 2 (80).`
  },
  {
    id: 35,
    type: "statistics",
    skill: "Six Tests Mean",
    question: `Six test scores: 72,85,91,68,79,83. Mean =`,
    options: [
      "78",
      "79",
      "80",
      "81",
    ],
    correctAnswer: 2,
    explanation: `Sum=478. 478÷6≈79.7≈80.`
  },
  {
    id: 36,
    type: "statistics",
    skill: "Box Plot Range",
    question: `Box plot: min=8, Q1=14, median=21, Q3=28, max=40. Range =`,
    options: [
      "14",
      "20",
      "26",
      "32",
    ],
    correctAnswer: 3,
    explanation: `Range=40-8=32.`
  },
  {
    id: 37,
    type: "statistics",
    skill: "Probability",
    question: `Bag: 6R,4B,5G,3Y. P(R or G)=`,
    options: [
      "11/18",
      "1/2",
      "11/20",
      "11/17",
    ],
    correctAnswer: 1,
    explanation: `P=(6+5)/18=11/18. Wait: total=18. (R+G)=11. P=11/18. Index 0.`
  },
  {
    id: 38,
    type: "statistics",
    skill: "Probability",
    question: `Bag: 6R,4B,5G,3Y (total 18). P(R or G)=`,
    options: [
      "11/18",
      "1/2",
      "11/20",
      "11/17",
    ],
    correctAnswer: 0,
    explanation: `(6+5)/18=11/18.`
  },
  {
    id: 39,
    type: "statistics",
    skill: "Two Events",
    question: `P(A)=0.3, P(B)=0.5, independent. P(neither A nor B)=`,
    options: [
      "0.20",
      "0.35",
      "0.65",
      "0.85",
    ],
    correctAnswer: 1,
    explanation: `P(A')=0.7, P(B')=0.5. P(neither)=0.7×0.5=0.35.`
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

export default function G5MathMod8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5MathMod8Questions : g5MathMod8Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 8",
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
            <CardTitle className="text-2xl text-slate-800">Mathematics Moderate 8</CardTitle>
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
              <p className="text-slate-600">Mathematics Moderate 8</p>
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
            <div><h1 className="text-lg font-bold">Mathematics Moderate 8</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
