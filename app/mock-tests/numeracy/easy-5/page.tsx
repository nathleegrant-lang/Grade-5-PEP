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

const g5MathEasy5Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 45,231 + 8,769?`,
    options: [
      "53,900",
      "54,000",
      "54,100",
      "54,200",
    ],
    correctAnswer: 1,
    explanation: `45,231 + 8,769 = 54,000.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 20,000 - 7,354?`,
    options: [
      "12,546",
      "12,646",
      "12,656",
      "13,646",
    ],
    correctAnswer: 1,
    explanation: `20,000 - 7,354 = 12,646.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 73 x 6?`,
    options: [
      "428",
      "438",
      "448",
      "458",
    ],
    correctAnswer: 1,
    explanation: `73 x 6: (70 x 6) + (3 x 6) = 420 + 18 = 438.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 945 ÷ 5?`,
    options: [
      "179",
      "183",
      "189",
      "191",
    ],
    correctAnswer: 2,
    explanation: `945 ÷ 5 = 189. Check: 189 x 5 = 945.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 4/5 of 60?`,
    options: [
      "42",
      "44",
      "46",
      "48",
    ],
    correctAnswer: 3,
    explanation: `4/5 of 60 = (4 x 60) ÷ 5 = 240 ÷ 5 = 48.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 3/4 - 1/4?`,
    options: [
      "2/0",
      "2/4",
      "1/2",
      "2/8",
    ],
    correctAnswer: 2,
    explanation: `3/4 - 1/4 = 2/4 = 1/2.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 75% of 80?`,
    options: [
      "50",
      "55",
      "60",
      "65",
    ],
    correctAnswer: 2,
    explanation: `75% of 80 = 3/4 x 80 = 60.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 7/8 as a decimal.`,
    options: [
      "0.78",
      "0.875",
      "0.87",
      "0.88",
    ],
    correctAnswer: 1,
    explanation: `7 ÷ 8 = 0.875.`
  },
  {
    id: 9,
    type: "number",
    question: `In 2,845,603, what is the value of the digit 8?`,
    options: [
      "8,000",
      "80,000",
      "800,000",
      "8,000,000",
    ],
    correctAnswer: 2,
    explanation: `8 is in the hundred-thousands place. Value = 800,000.`
  },
  {
    id: 10,
    type: "number",
    question: `Which decimal is greatest: 0.7, 0.73, 0.709, 0.73?`,
    options: [
      "0.7",
      "0.709",
      "0.73",
      "All equal",
    ],
    correctAnswer: 2,
    explanation: `0.730 > 0.709 > 0.700. Greatest = 0.73.`
  },
  {
    id: 11,
    type: "number",
    question: `A school day is 6 hours. A student spends 2/6 on lunch and breaks. How many hours are lessons?`,
    options: [
      "2 h",
      "3 h",
      "4 h",
      "5 h",
    ],
    correctAnswer: 2,
    explanation: `Lesson time = 6 - (2/6 x 6) = 6 - 2 = 4 hours.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 4, 6, and 8?`,
    options: [
      "16",
      "20",
      "24",
      "48",
    ],
    correctAnswer: 2,
    explanation: `LCM(4,6)=12. LCM(12,8)=24.`
  },
  {
    id: 13,
    type: "number",
    question: `Which is a perfect cube?`,
    options: [
      "8",
      "9",
      "12",
      "16",
    ],
    correctAnswer: 0,
    explanation: `2 x 2 x 2 = 8. 8 is a perfect cube.`
  },
  {
    id: 14,
    type: "number",
    question: `A pattern: 1, 4, 9, 16, ___. What is the next term?`,
    options: [
      "20",
      "23",
      "25",
      "36",
    ],
    correctAnswer: 2,
    explanation: `This is the sequence of perfect squares: 1², 2², 3², 4², 5² = 25.`
  },
  {
    id: 15,
    type: "number",
    question: `A vendor sells 8 mangoes per box. She sells 24 boxes. How many mangoes is that?`,
    options: [
      "182",
      "192",
      "202",
      "212",
    ],
    correctAnswer: 1,
    explanation: `24 x 8 = 192 mangoes.`
  },
  {
    id: 16,
    type: "measurement",
    question: `Convert 6,500 m to km.`,
    options: [
      "0.65 km",
      "6.5 km",
      "65 km",
      "650 km",
    ],
    correctAnswer: 1,
    explanation: `6,500 ÷ 1,000 = 6.5 km.`
  },
  {
    id: 17,
    type: "measurement",
    question: `The area of a triangle is 48 cm² and its base is 12 cm. What is its height?`,
    options: [
      "4 cm",
      "6 cm",
      "8 cm",
      "10 cm",
    ],
    correctAnswer: 2,
    explanation: `Area = ½ x base x h. 48 = ½ x 12 x h = 6h. h = 8 cm.`
  },
  {
    id: 18,
    type: "measurement",
    question: `A room is 5 m long and 4 m wide. What is the cost to carpet it at $8 per m²?`,
    options: [
      "$120",
      "$160",
      "$180",
      "$200",
    ],
    correctAnswer: 1,
    explanation: `Area = 5 x 4 = 20 m². Cost = 20 x $8 = $160.`
  },
  {
    id: 19,
    type: "measurement",
    question: `How many hours are in 1 week?`,
    options: [
      "24 h",
      "72 h",
      "168 h",
      "192 h",
    ],
    correctAnswer: 2,
    explanation: `1 week = 7 days. 7 x 24 = 168 hours.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A beaker contains 450 mL. After drinking 125 mL, how much remains?`,
    options: [
      "225 mL",
      "275 mL",
      "300 mL",
      "325 mL",
    ],
    correctAnswer: 3,
    explanation: `450 - 125 = 325 mL.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cube has a side of 4 cm. What is its volume?`,
    options: [
      "12 cm³",
      "48 cm³",
      "64 cm³",
      "96 cm³",
    ],
    correctAnswer: 2,
    explanation: `Volume = 4 x 4 x 4 = 64 cm³.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A bus departs at 7:20 AM. If the journey takes 2 h 45 min, when does it arrive?`,
    options: [
      "9:45 AM",
      "10:05 AM",
      "10:15 AM",
      "10:25 AM",
    ],
    correctAnswer: 1,
    explanation: `7:20 + 2 h = 9:20. 9:20 + 45 min = 10:05 AM.`
  },
  {
    id: 23,
    type: "measurement",
    question: `What is the perimeter of a regular octagon with sides of 7 cm?`,
    options: [
      "49 cm",
      "56 cm",
      "63 cm",
      "70 cm",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 8 x 7 = 56 cm.`
  },
  {
    id: 24,
    type: "measurement",
    question: `Convert 3.75 kg to grams.`,
    options: [
      "375 g",
      "3,075 g",
      "3,750 g",
      "37,500 g",
    ],
    correctAnswer: 2,
    explanation: `3.75 x 1,000 = 3,750 g.`
  },
  {
    id: 25,
    type: "measurement",
    question: `A swimming pool is 50 m long, 20 m wide, and 2 m deep. What is its volume?`,
    options: [
      "1,000 m³",
      "2,000 m³",
      "3,000 m³",
      "4,000 m³",
    ],
    correctAnswer: 1,
    explanation: `Volume = 50 x 20 x 2 = 2,000 m³.`
  },
  {
    id: 26,
    type: "geometry",
    question: `What is the exterior angle of a regular triangle (equilateral)?`,
    options: [
      "60°",
      "90°",
      "120°",
      "150°",
    ],
    correctAnswer: 2,
    explanation: `Exterior angle = 180° - 60° = 120°. Or: 360° ÷ 3 = 120°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many vertices does a square-based pyramid have?`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 1,
    explanation: `A square-based pyramid has 4 base vertices + 1 apex = 5 vertices.`
  },
  {
    id: 28,
    type: "geometry",
    question: `What is the sum of interior angles of a pentagon?`,
    options: [
      "360°",
      "450°",
      "540°",
      "720°",
    ],
    correctAnswer: 2,
    explanation: `(5-2) x 180° = 3 x 180° = 540°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `A shape is enlarged so its sides are twice as long. The area is multiplied by:`,
    options: [
      "2",
      "3",
      "4",
      "6",
    ],
    correctAnswer: 2,
    explanation: `When linear dimensions double, area increases by 2² = 4.`
  },
  {
    id: 30,
    type: "geometry",
    question: `The point (0, 0) on a coordinate grid is called the:`,
    options: [
      "Origin",
      "Vertex",
      "Centre",
      "Midpoint",
    ],
    correctAnswer: 0,
    explanation: `The point (0, 0) on a coordinate grid is called the origin.`
  },
  {
    id: 31,
    type: "geometry",
    question: `Which quadrilateral has both pairs of opposite sides parallel and all angles 90°?`,
    options: [
      "Rhombus",
      "Rectangle",
      "Trapezoid",
      "Kite",
    ],
    correctAnswer: 1,
    explanation: `A rectangle has both pairs of opposite sides parallel and all angles = 90°.`
  },
  {
    id: 32,
    type: "geometry",
    question: `What is the total number of edges on a rectangular prism?`,
    options: [
      "8",
      "10",
      "12",
      "14",
    ],
    correctAnswer: 2,
    explanation: `A rectangular prism has 12 edges.`
  },
  {
    id: 33,
    type: "geometry",
    question: `A triangle has angles of 55°, 75°, and ___°.`,
    options: [
      "40°",
      "45°",
      "50°",
      "55°",
    ],
    correctAnswer: 2,
    explanation: `180° - 55° - 75° = 50°.`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 3, 9, 15, 21, 12.`,
    options: [
      "10",
      "12",
      "14",
      "15",
    ],
    correctAnswer: 1,
    explanation: `Mean = (3+9+15+21+12) ÷ 5 = 60 ÷ 5 = 12.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 22, 15, 30, 8, 19, 27, 12?`,
    options: [
      "15",
      "19",
      "22",
      "27",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 8, 12, 15, 19, 22, 27, 30. Middle (4th) = 19.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Scores: 7, 7, 8, 9, 7, 6, 8, 9. What is the mode?`,
    options: [
      "6",
      "7",
      "8",
      "9",
    ],
    correctAnswer: 1,
    explanation: `7 appears 3 times. Mode = 7.`
  },
  {
    id: 37,
    type: "statistics",
    question: `What is the range of: 0.5, 2.8, 1.4, 3.9, 0.7?`,
    options: [
      "3.0",
      "3.2",
      "3.4",
      "3.6",
    ],
    correctAnswer: 2,
    explanation: `Range = 3.9 - 0.5 = 3.4.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A line graph shows: Jan=20, Feb=25, Mar=30. What was the total for Jan-Mar?`,
    options: [
      "60",
      "65",
      "70",
      "75",
    ],
    correctAnswer: 3,
    explanation: `20 + 25 + 30 = 75.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A bag has 2 red, 4 blue, and 4 green marbles. What is the probability of NOT picking blue?`,
    options: [
      "2/5",
      "3/5",
      "4/10",
      "1/2",
    ],
    correctAnswer: 0,
    explanation: `P(not blue) = 1 - 4/10 = 6/10 = 3/5.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The mean of 6 numbers is 9. When a 7th number is added, the mean becomes 10. What is the 7th number?`,
    options: [
      "14",
      "15",
      "16",
      "17",
    ],
    correctAnswer: 2,
    explanation: `Original sum = 54. New sum = 70. 7th number = 70 - 54 = 16.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy5MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy5Questions : g5MathEasy5Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 5</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 5</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 5 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 5</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
