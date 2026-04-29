"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Calculator, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "number" | "measurement" | "geometry" | "statistics"
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5MathEasy7Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 72,485 + 14,736?`,
    options: [
      "87,121",
      "87,221",
      "87,211",
      "87,321",
    ],
    correctAnswer: 1,
    explanation: `72,485 + 14,736 = 87,221.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 50,000 - 18,753?`,
    options: [
      "31,147",
      "31,247",
      "31,347",
      "32,247",
    ],
    correctAnswer: 1,
    explanation: `50,000 - 18,753 = 31,247.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 125 x 4?`,
    options: [
      "400",
      "450",
      "480",
      "500",
    ],
    correctAnswer: 3,
    explanation: `125 x 4 = 500.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 1,260 ÷ 6?`,
    options: [
      "190",
      "200",
      "210",
      "220",
    ],
    correctAnswer: 2,
    explanation: `1,260 ÷ 6 = 210. Check: 210 x 6 = 1,260.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 5/6 of 36?`,
    options: [
      "25",
      "28",
      "30",
      "35",
    ],
    correctAnswer: 2,
    explanation: `5/6 of 36 = (5 x 36) ÷ 6 = 180 ÷ 6 = 30.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 2/3 + 1/6?`,
    options: [
      "3/9",
      "4/6",
      "5/6",
      "1/2",
    ],
    correctAnswer: 2,
    explanation: `LCD=6: 2/3=4/6. 4/6 + 1/6 = 5/6.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 60% of 150?`,
    options: [
      "80",
      "85",
      "90",
      "95",
    ],
    correctAnswer: 2,
    explanation: `60% of 150 = 0.6 x 150 = 90.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 0.125 as a fraction in simplest form.`,
    options: [
      "1/4",
      "1/8",
      "1/5",
      "125/100",
    ],
    correctAnswer: 1,
    explanation: `0.125 = 125/1000 = 1/8.`
  },
  {
    id: 9,
    type: "number",
    question: `What is 5² + 3³?`,
    options: [
      "52",
      "52",
      "52",
      "52",
    ],
    correctAnswer: 0,
    explanation: `5² = 25. 3³ = 27. 25 + 27 = 52.`
  },
  {
    id: 10,
    type: "number",
    question: `Which of these is divisible by both 3 and 7?`,
    options: [
      "21",
      "28",
      "42",
      "63",
    ],
    correctAnswer: 2,
    explanation: `42 = 3 x 14 and 42 = 7 x 6. Both divide evenly.`
  },
  {
    id: 11,
    type: "number",
    question: `A ratio of boys to girls is 3:4. There are 28 girls. How many boys?`,
    options: [
      "18",
      "21",
      "22",
      "24",
    ],
    correctAnswer: 1,
    explanation: `3:4, girls=28. Boys = 3/4 x 28 = 21.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 8, 12?`,
    options: [
      "16",
      "20",
      "24",
      "48",
    ],
    correctAnswer: 2,
    explanation: `LCM(8,12)=24.`
  },
  {
    id: 13,
    type: "number",
    question: `What is the HCF of 48 and 72?`,
    options: [
      "6",
      "12",
      "18",
      "24",
    ],
    correctAnswer: 3,
    explanation: `Factors of 48: ...24. Factors of 72: ...24. HCF = 24.`
  },
  {
    id: 14,
    type: "number",
    question: `A pattern: 2, 6, 18, 54, ___.`,
    options: [
      "162",
      "108",
      "72",
      "216",
    ],
    correctAnswer: 0,
    explanation: `Each term is multiplied by 3. 54 x 3 = 162.`
  },
  {
    id: 15,
    type: "number",
    question: `A farmer packs 144 mangoes into crates of 12. How many crates?`,
    options: [
      "10",
      "11",
      "12",
      "13",
    ],
    correctAnswer: 2,
    explanation: `144 ÷ 12 = 12 crates.`
  },
  {
    id: 16,
    type: "measurement",
    question: `The area of a square is 196 cm². What is its side length?`,
    options: [
      "13 cm",
      "14 cm",
      "15 cm",
      "16 cm",
    ],
    correctAnswer: 1,
    explanation: `√196 = 14 cm. Check: 14 x 14 = 196.`
  },
  {
    id: 17,
    type: "measurement",
    question: `A rectangular field is 25 m x 16 m. What is its area?`,
    options: [
      "400 m²",
      "350 m²",
      "450 m²",
      "300 m²",
    ],
    correctAnswer: 0,
    explanation: `Area = 25 x 16 = 400 m².`
  },
  {
    id: 18,
    type: "measurement",
    question: `What is the perimeter of a regular pentagon with sides of 11 cm?`,
    options: [
      "44 cm",
      "55 cm",
      "66 cm",
      "77 cm",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 5 x 11 = 55 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `Convert 4,200 mL to litres.`,
    options: [
      "0.42 L",
      "4.2 L",
      "42 L",
      "420 L",
    ],
    correctAnswer: 1,
    explanation: `4,200 ÷ 1,000 = 4.2 L.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A journey takes 5 h 20 min. At 60 km/h, how far is the journey?`,
    options: [
      "300 km",
      "310 km",
      "320 km",
      "330 km",
    ],
    correctAnswer: 2,
    explanation: `5 h 20 min = 5⅓ h. 5⅓ x 60 = 320 km.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cube has sides of 6 cm. What is its total surface area?`,
    options: [
      "36 cm²",
      "144 cm²",
      "216 cm²",
      "288 cm²",
    ],
    correctAnswer: 2,
    explanation: `6 faces x (6 x 6) = 6 x 36 = 216 cm².`
  },
  {
    id: 22,
    type: "measurement",
    question: `What is 3 weeks and 5 days expressed in days?`,
    options: [
      "24",
      "26",
      "28",
      "30",
    ],
    correctAnswer: 1,
    explanation: `3 x 7 + 5 = 21 + 5 = 26 days.`
  },
  {
    id: 23,
    type: "measurement",
    question: `A rectangular prism has dimensions 8 x 5 x 4 cm. What is its volume?`,
    options: [
      "120 cm³",
      "140 cm³",
      "160 cm³",
      "180 cm³",
    ],
    correctAnswer: 2,
    explanation: `V = 8 x 5 x 4 = 160 cm³.`
  },
  {
    id: 24,
    type: "measurement",
    question: `A thermometer reads -5°C. It rises 18°. What is the new reading?`,
    options: [
      "12°C",
      "13°C",
      "14°C",
      "15°C",
    ],
    correctAnswer: 1,
    explanation: `-5 + 18 = 13°C.`
  },
  {
    id: 25,
    type: "measurement",
    question: `How many cm in 7.3 m?`,
    options: [
      "73 cm",
      "703 cm",
      "730 cm",
      "7,300 cm",
    ],
    correctAnswer: 2,
    explanation: `7.3 x 100 = 730 cm.`
  },
  {
    id: 26,
    type: "geometry",
    question: `The exterior angle of a regular hexagon is:`,
    options: [
      "45°",
      "50°",
      "60°",
      "72°",
    ],
    correctAnswer: 2,
    explanation: `Exterior angle = 360° ÷ 6 = 60°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many faces does a pentagonal prism have?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 2,
    explanation: `2 pentagonal faces + 5 rectangular faces = 7 faces.`
  },
  {
    id: 28,
    type: "geometry",
    question: `Two parallel lines are cut by a transversal. Alternate interior angles are:`,
    options: [
      "Supplementary",
      "Complementary",
      "Equal",
      "Reflex",
    ],
    correctAnswer: 2,
    explanation: `Alternate interior angles are equal when lines are parallel.`
  },
  {
    id: 29,
    type: "geometry",
    question: `A rectangle is 10 cm x 6 cm. What is the length of its diagonal?`,
    options: [
      "8 cm",
      "10 cm",
      "√136 cm",
      "12 cm",
    ],
    correctAnswer: 2,
    explanation: `Diagonal = √(10² + 6²) = √(100+36) = √136 cm.`
  },
  {
    id: 30,
    type: "geometry",
    question: `What is the interior angle of a regular pentagon?`,
    options: [
      "100°",
      "104°",
      "108°",
      "112°",
    ],
    correctAnswer: 2,
    explanation: `Sum=(5-2)x180=540°. Each=540÷5=108°.`
  },
  {
    id: 31,
    type: "geometry",
    question: `A point is reflected across the y-axis from (-3, 4). New coordinates:`,
    options: [
      "(3, 4)",
      "(-3, -4)",
      "(3, -4)",
      "(-3, 4)",
    ],
    correctAnswer: 0,
    explanation: `Reflecting across y-axis changes sign of x. (-3,4) → (3,4).`
  },
  {
    id: 32,
    type: "geometry",
    question: `Which solid has 5 faces, 8 edges, and 5 vertices?`,
    options: [
      "Cube",
      "Triangular prism",
      "Square pyramid",
      "Cone",
    ],
    correctAnswer: 2,
    explanation: `Square pyramid: 5 faces (1 square base + 4 triangles), 8 edges, 5 vertices.`
  },
  {
    id: 33,
    type: "geometry",
    question: `A scalene triangle has:`,
    options: [
      "All sides equal",
      "Two sides equal",
      "All sides different",
      "No angles",
    ],
    correctAnswer: 2,
    explanation: `A scalene triangle has all three sides of different lengths.`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 21, 17, 25, 19, 23.`,
    options: [
      "19",
      "21",
      "23",
      "25",
    ],
    correctAnswer: 1,
    explanation: `Mean=(21+17+25+19+23)÷5=105÷5=21.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 5, 13, 3, 11, 9, 7, 15?`,
    options: [
      "9",
      "10",
      "11",
      "7",
    ],
    correctAnswer: 0,
    explanation: `Arranged: 3,5,7,9,11,13,15. Middle=9.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Data: 12, 15, 12, 18, 15, 12, 20. Mode:`,
    options: [
      "12",
      "15",
      "18",
      "20",
    ],
    correctAnswer: 0,
    explanation: `12 appears 3 times. Mode=12.`
  },
  {
    id: 37,
    type: "statistics",
    question: `Range of: 3.6, 7.8, 2.1, 9.4, 5.5:`,
    options: [
      "6.8",
      "7.3",
      "7.4",
      "7.6",
    ],
    correctAnswer: 1,
    explanation: `9.4 - 2.1 = 7.3.`
  },
  {
    id: 38,
    type: "statistics",
    question: `In a class of 40: 16 chose cricket, 12 chose football, 8 volleyball, 4 netball. What % chose cricket?`,
    options: [
      "30%",
      "35%",
      "40%",
      "45%",
    ],
    correctAnswer: 2,
    explanation: `16/40 x 100 = 40%.`
  },
  {
    id: 39,
    type: "statistics",
    question: `P(drawing an ace from a standard deck of 52 cards):`,
    options: [
      "1/13",
      "1/12",
      "4/52",
      "1/4",
    ],
    correctAnswer: 0,
    explanation: `4 aces in 52 cards. P = 4/52 = 1/13.`
  },
  {
    id: 40,
    type: "statistics",
    question: `If the mean of 5 numbers is 14 and four of them are 12, 16, 10, 18, what is the fifth?`,
    options: [
      "13",
      "14",
      "15",
      "16",
    ],
    correctAnswer: 1,
    explanation: `Total=70. Known sum=56. Fifth=70-56=14.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy7MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy7Questions : g5MathEasy7Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => { if (answers.length !== totalQuestions) { setAnswers(new Array(totalQuestions).fill(null)) } }, [totalQuestions, answers.length])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => { if (prev <= 1) { setCompletedAt(new Date().toLocaleString()); setTestCompleted(true); return 0 } return prev - 1 })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [testStarted, testCompleted, timeRemaining])

  const handleAnswer = (answerIndex: number) => { const a = [...answers]; a[currentQuestion] = answerIndex; setAnswers(a) }

  const calculateScore = () => { let c = 0; answers.forEach((a, i) => { if (i < availableQuestions.length && a === availableQuestions[i].correctAnswer) c++ }); return c }
  const getScorePercentage = () => Math.round((calculateScore() / totalQuestions) * 100)

  const getGrade = () => {
    const p = getScorePercentage()
    if (p >= 85) return { grade: "Excellent", color: "text-green-600" }
    if (p >= 70) return { grade: "Good", color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair", color: "text-amber-600" }
    return { grade: "Needs Improvement", color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => { const i = availableQuestions.findIndex((x) => x.id === q.id); return answers[i] === q.correctAnswer }).length
    const total = sq.length
    const percentage = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = percentage >= 85 ? "Excellent" : percentage >= 70 ? "Good" : percentage >= 50 ? "Fair" : "Needs Improvement"
    const ratingColor = percentage >= 85 ? "text-green-600" : percentage >= 70 ? "text-blue-600" : percentage >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage, rating, ratingColor }
  }

  const handleSubmit = () => { setCompletedAt(new Date().toLocaleString()); setTestCompleted(true) }

  const restartTest = () => { setTestStarted(false); setTestCompleted(false); setCurrentQuestion(0); setAnswers(new Array(totalQuestions).fill(null)); setTimeRemaining(isPremium ? 60 * 60 : 10 * 60); setShowReview(false); setCompletedAt("") }

  const question = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const sectionLabel = (t: Question["type"]) => t === "number" ? "Number Operations" : t === "measurement" ? "Measurement" : t === "geometry" ? "Geometry & Spatial Sense" : "Data & Probability"

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/mathematics" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back to Mathematics Mock Tests</Link>
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="text-center bg-blue-50 rounded-t-lg">
              <div className="mx-auto mb-4 rounded-xl bg-black p-3 w-fit shadow-sm"><Image src="/images/shazoniques-inspiration-logo.png" alt="Shazonique's Inspiration logo" width={220} height={100} className="h-auto w-[180px] sm:w-[220px]" priority /></div>
              <Calculator className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 7</CardTitle>
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics · Easy Level</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-2xl font-bold text-blue-600">{totalQuestions}</p><p className="text-sm text-gray-600">Questions {!isPremium && "(Preview)"}</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-2xl font-bold text-blue-600">{isPremium ? 60 : 10}</p><p className="text-sm text-gray-600">Minutes</p></div>
                </div>
                {!isPremium && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3"><Lock className="h-5 w-5 text-amber-600 flex-shrink-0" /><div><p className="font-medium text-amber-800">Free Preview Mode</p><p className="text-sm text-amber-700">You can try {FREE_QUESTION_LIMIT} questions for free. Upgrade to Premium for the full 40-question test with reports and explanations.</p></div></div>
                    <Link href="/pricing" className="block mt-3"><Button className="w-full bg-amber-500 hover:bg-amber-600 text-white"><Crown className="h-4 w-4 mr-2" />Upgrade to Premium</Button></Link>
                  </div>
                )}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Easy Level Focus:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>- Whole numbers, fractions, decimals, and percentages</li>
                    <li>- Measurement, time, money, and capacity</li>
                    <li>- Shapes, angles, and basic geometry</li>
                    <li>- Reading graphs and finding mean, median, mode · 40 Questions</li>
                  </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">Instructions:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>- Read each question carefully.</li>
                    <li>- Choose the best answer for each item.</li>
                    <li>- You may move between questions before submitting.</li>
                    <li>- The test will submit automatically when time runs out.</li>
                  </ul>
                </div>
                <Button onClick={() => setTestStarted(true)} className="w-full bg-slate-700 hover:bg-slate-800 text-lg py-6">Start Test</Button>
                <Link href="/mock-tests/mathematics"><Button variant="outline" className="w-full">Back to Mathematics Mock Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (testCompleted && !showReview) {
    const score = calculateScore(); const percentage = getScorePercentage(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="max-w-3xl mx-auto shadow-lg">
            <CardHeader className="text-center bg-blue-50 rounded-t-lg border-b">
              <div className="mx-auto mb-4 rounded-xl bg-black p-3 w-fit shadow-sm"><Image src="/images/shazoniques-inspiration-logo.png" alt="Shazonique's Inspiration logo" width={220} height={100} className="h-auto w-[180px] sm:w-[220px]" priority /></div>
              <CheckCircle className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl text-blue-800">Mock Test Completed</CardTitle>
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 7</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg"><p className="text-5xl font-bold text-blue-600">{score}/{totalQuestions}</p><p className="text-gray-600 mt-2">Questions Correct</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-3xl font-bold text-blue-600">{percentage}%</p><p className="text-sm text-gray-600">Score</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className={`text-2xl font-bold ${color}`}>{grade}</p><p className="text-sm text-gray-600">Performance</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm font-semibold text-slate-700">{completedAt || new Date().toLocaleDateString()}</p><p className="text-sm text-gray-600">Completed</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (<div key={s.type} className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-semibold text-blue-800">{s.label}</p><p className="text-sm text-slate-600 mt-1">{s.note}</p><div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span><span className={`text-sm font-semibold ${st.ratingColor}`}>{st.rating}</span></div></div>) })}
                </div>
                <div className="space-y-3">
                  <Button onClick={() => setShowReview(true)} className="w-full bg-slate-700 hover:bg-slate-800">Review Answers &amp; Report</Button>
                  <Button onClick={restartTest} variant="outline" className="w-full"><RotateCcw className="h-4 w-4 mr-2" />Take Test Again</Button>
                  <Link href="/mock-tests/mathematics"><Button variant="outline" className="w-full"><Home className="h-4 w-4 mr-2" />Back to Mathematics Mock Tests</Button></Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (showReview) {
    const score = calculateScore(); const percentage = getScorePercentage(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <style jsx global>{`@media print { header, footer, .no-print { display: none !important; } body { background: #ffffff !important; } .report-sheet { box-shadow: none !important; border: none !important; } }`}</style>
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="max-w-5xl mx-auto report-sheet shadow-lg">
            <CardHeader className="bg-white border-b rounded-t-lg">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-black p-3 shadow-sm"><Image src="/images/shazoniques-inspiration-logo.png" alt="Shazonique's Inspiration logo" width={220} height={100} className="h-auto w-[180px] sm:w-[220px]" priority /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Managed by Shazonique&apos;s Inspiration</p>
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 7 Report</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Student: <span className="font-medium">{user?.childName ?? "Student"}</span></p>
                    <p className="text-sm text-gray-600">Completed: <span className="font-medium">{completedAt || new Date().toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-blue-50 p-4 min-w-[90px]"><p className="text-2xl font-bold text-blue-700">{score}/{totalQuestions}</p><p className="text-xs text-slate-600">Score</p></div>
                  <div className="rounded-lg bg-blue-50 p-4 min-w-[90px]"><p className="text-2xl font-bold text-blue-700">{percentage}%</p><p className="text-xs text-slate-600">Percent</p></div>
                  <div className="rounded-lg bg-blue-50 p-4 min-w-[90px]"><p className={`text-lg font-bold ${color}`}>{grade}</p><p className="text-xs text-slate-600">Performance</p></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5"><h3 className="text-lg font-semibold text-blue-800 mb-2">Performance Summary</h3><p className="text-sm text-slate-700">This report shows the student&apos;s overall result, section-by-section performance, and a full question-by-question review with explanations.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (<div key={s.type} className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-semibold text-blue-800">{s.label}</p><p className="text-sm text-slate-600 mt-1">{s.note}</p><div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span><span className={`text-sm font-semibold ${st.ratingColor}`}>{st.rating}</span></div><div className="mt-2"><Progress value={st.percentage} className="h-2" /><p className="text-xs text-slate-500 mt-1">{st.percentage}%</p></div></div>) })}
              </div>
              <div className="space-y-6">
                {availableQuestions.map((q, index) => {
                  const isCorrect = answers[index] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("p-5 rounded-xl border-2", isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2"><p className="font-semibold text-slate-800">Question {index + 1}</p><span className="text-xs uppercase tracking-wide rounded-full bg-white px-2 py-1 text-slate-600 border">{sectionLabel(q.type)}</span></div>
                          <p className="text-slate-800 mb-3">{q.question}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-700"><span className="font-medium">Student&apos;s Answer:</span> <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[index] !== null ? q.options[answers[index]!] : "Not answered"}</span></p>
                            <p className="text-green-700"><span className="font-medium">Correct Answer:</span> {q.options[q.correctAnswer]}</p>
                            <p className="text-slate-700 mt-2"><span className="font-medium">Explanation:</span> {q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-8 pt-6 border-t text-center text-sm text-slate-500">Managed by Shazonique&apos;s Inspiration · A heart&apos;s home of hope</div>
            </CardContent>
          </Card>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 no-print max-w-5xl mx-auto">
            <Button onClick={() => window.print()} className="flex-1 bg-slate-700 hover:bg-slate-800"><Printer className="h-4 w-4 mr-2" />Download / Print Report</Button>
            <Button onClick={restartTest} variant="outline" className="flex-1"><RotateCcw className="h-4 w-4 mr-2" />Take Test Again</Button>
            <Link href="/mock-tests/mathematics" className="flex-1"><Button variant="outline" className="w-full"><Home className="h-4 w-4 mr-2" />Back to Mathematics Mock Tests</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <header className="bg-slate-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/mock-tests/mathematics" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Exit Test"><ArrowLeft className="h-5 w-5" /></Link>
              <Calculator className="h-8 w-8" />
              <div><h1 className="text-lg font-bold">Mathematics Easy 7</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
            </div>
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeRemaining <= 300 ? "bg-red-500" : "bg-green-600")}><Clock className="h-5 w-5" />{formatTime(timeRemaining)}</div>
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2"><span>Progress: {answeredCount}/{totalQuestions} answered</span><span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span></div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="bg-blue-50">
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-blue-700 uppercase">{sectionLabel(question.type)}</span><span className="text-sm text-gray-500">Question {currentQuestion + 1}</span></div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-lg font-medium text-gray-800 mb-6">{question.question}</p>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(index)} className={cn("w-full p-4 text-left rounded-lg border-2 transition-all", answers[currentQuestion] === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50")}>
                    <span className="font-medium text-blue-700 mr-3">{String.fromCharCode(65 + index)}.</span>{option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentQuestion((prev) => prev - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            <div className="flex items-center gap-2">
              {currentQuestion === totalQuestions - 1 ? (<Button onClick={handleSubmit} className="bg-slate-700 hover:bg-slate-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>) : (<Button onClick={() => setCurrentQuestion((prev) => prev + 1)} className="bg-slate-700 hover:bg-slate-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>)}
            </div>
          </div>
          <Card className="mt-6">
            <CardHeader className="py-3"><CardTitle className="text-sm">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, index) => (<button key={index} onClick={() => setCurrentQuestion(index)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentQuestion === index ? "bg-slate-700 text-white" : answers[index] !== null ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{index + 1}</button>))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-700"></div><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-100"></div><span>Answered</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100"></div><span>Unanswered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
