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

const g5MathEasy6Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 56,000 + 4,375?`,
    options: [
      "60,275",
      "60,375",
      "60,475",
      "60,575",
    ],
    correctAnswer: 1,
    explanation: `56,000 + 4,375 = 60,375.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 30,000 - 8,642?`,
    options: [
      "21,258",
      "21,358",
      "21,458",
      "22,358",
    ],
    correctAnswer: 1,
    explanation: `30,000 - 8,642 = 21,358.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 86 x 7?`,
    options: [
      "592",
      "602",
      "592",
      "612",
    ],
    correctAnswer: 1,
    explanation: `86 x 7: (80 x 7) + (6 x 7) = 560 + 42 = 602.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 1,080 ÷ 9?`,
    options: [
      "110",
      "115",
      "120",
      "130",
    ],
    correctAnswer: 2,
    explanation: `1,080 ÷ 9 = 120. Check: 120 x 9 = 1,080.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 3/7 of 49?`,
    options: [
      "18",
      "21",
      "24",
      "27",
    ],
    correctAnswer: 1,
    explanation: `3/7 of 49 = (3 x 49) ÷ 7 = 147 ÷ 7 = 21.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 7/10 - 2/10?`,
    options: [
      "5/0",
      "5/10",
      "5/20",
      "1/2",
    ],
    correctAnswer: 1,
    explanation: `7/10 - 2/10 = 5/10 = 1/2.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 40% of 90?`,
    options: [
      "30",
      "36",
      "40",
      "45",
    ],
    correctAnswer: 1,
    explanation: `40% of 90 = 0.4 x 90 = 36.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 4/5 as a percentage.`,
    options: [
      "45%",
      "50%",
      "80%",
      "85%",
    ],
    correctAnswer: 2,
    explanation: `4/5 x 100 = 80%.`
  },
  {
    id: 9,
    type: "number",
    question: `In 4,568,201, what is the value of the digit 6?`,
    options: [
      "6,000",
      "60,000",
      "600,000",
      "6,000,000",
    ],
    correctAnswer: 1,
    explanation: `6 is in the ten-thousands place. Value = 60,000.`
  },
  {
    id: 10,
    type: "number",
    question: `Which pair of numbers has an LCM of 12?`,
    options: [
      "3 and 4",
      "4 and 5",
      "5 and 6",
      "6 and 8",
    ],
    correctAnswer: 0,
    explanation: `Multiples of 3: 3,6,9,12. Multiples of 4: 4,8,12. LCM = 12.`
  },
  {
    id: 11,
    type: "number",
    question: `A recipe needs 2/3 cup sugar. For triple the recipe, how much sugar?`,
    options: [
      "1 cup",
      "1⅓ cups",
      "2 cups",
      "2⅓ cups",
    ],
    correctAnswer: 2,
    explanation: `3 x 2/3 = 6/3 = 2 cups.`
  },
  {
    id: 12,
    type: "number",
    question: `Which is a prime number between 20 and 30?`,
    options: [
      "21",
      "23",
      "25",
      "27",
    ],
    correctAnswer: 1,
    explanation: `23 has no factors other than 1 and itself. 23 is prime.`
  },
  {
    id: 13,
    type: "number",
    question: `What is 3 squared + 4 squared?`,
    options: [
      "7",
      "14",
      "25",
      "30",
    ],
    correctAnswer: 2,
    explanation: `3² = 9. 4² = 16. 9 + 16 = 25.`
  },
  {
    id: 14,
    type: "number",
    question: `A number pattern: 81, 72, 63, 54, ___.`,
    options: [
      "44",
      "45",
      "46",
      "47",
    ],
    correctAnswer: 1,
    explanation: `Each term decreases by 9. 54 - 9 = 45.`
  },
  {
    id: 15,
    type: "number",
    question: `A market stall earns $45 per day. How much does it earn in 5 days?`,
    options: [
      "$220",
      "$225",
      "$230",
      "$235",
    ],
    correctAnswer: 1,
    explanation: `5 x $45 = $225.`
  },
  {
    id: 16,
    type: "measurement",
    question: `A wall is 2.8 m high. What is its height in centimetres?`,
    options: [
      "28 cm",
      "280 cm",
      "2,800 cm",
      "28,000 cm",
    ],
    correctAnswer: 1,
    explanation: `2.8 m x 100 = 280 cm.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a right-angled triangle with legs 6 cm and 8 cm?`,
    options: [
      "14 cm²",
      "24 cm²",
      "48 cm²",
      "28 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area = ½ x 6 x 8 = 24 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `A rectangle has area 84 cm² and length 12 cm. What is its width?`,
    options: [
      "6 cm",
      "7 cm",
      "8 cm",
      "9 cm",
    ],
    correctAnswer: 1,
    explanation: `Width = 84 ÷ 12 = 7 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `How many minutes are in 2.5 hours?`,
    options: [
      "120 min",
      "130 min",
      "145 min",
      "150 min",
    ],
    correctAnswer: 3,
    explanation: `2.5 x 60 = 150 minutes.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A rope is 7.2 m long. It is cut into pieces of 60 cm each. How many pieces?`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 1,
    explanation: `7.2 m = 720 cm. 720 ÷ 60 = 12 pieces.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cuboid box is 5 cm x 4 cm x 3 cm. What is its volume?`,
    options: [
      "12 cm³",
      "36 cm³",
      "60 cm³",
      "72 cm³",
    ],
    correctAnswer: 2,
    explanation: `Volume = 5 x 4 x 3 = 60 cm³.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A race starts at 10:50 AM and finishes at 1:20 PM. How long is the race?`,
    options: [
      "2 h 20 min",
      "2 h 30 min",
      "2 h 40 min",
      "3 h",
    ],
    correctAnswer: 1,
    explanation: `10:50 to 1:20: from 10:50 to 12:50 = 2 h, 12:50 to 1:20 = 30 min. Total = 2 h 30 min.`
  },
  {
    id: 23,
    type: "measurement",
    question: `The perimeter of a square is 72 cm. What is the area?`,
    options: [
      "18 cm²",
      "144 cm²",
      "288 cm²",
      "324 cm²",
    ],
    correctAnswer: 3,
    explanation: `Side = 72 ÷ 4 = 18 cm. Area = 18 x 18 = 324 cm².`
  },
  {
    id: 24,
    type: "measurement",
    question: `Convert 5 kg 250 g to grams.`,
    options: [
      "5,025 g",
      "5,250 g",
      "52,500 g",
      "525 g",
    ],
    correctAnswer: 1,
    explanation: `5 kg = 5,000 g. 5,000 + 250 = 5,250 g.`
  },
  {
    id: 25,
    type: "measurement",
    question: `Temperature fell from 5°C to -7°C. What was the change?`,
    options: [
      "2°C",
      "10°C",
      "12°C",
      "5°C",
    ],
    correctAnswer: 2,
    explanation: `5 - (-7) = 5 + 7 = 12°C drop.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Angles on a straight line add up to:`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 1,
    explanation: `Angles on a straight line always sum to 180°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many edges does a square pyramid have?`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 3,
    explanation: `A square pyramid has 4 base edges + 4 slant edges = 8 edges.`
  },
  {
    id: 28,
    type: "geometry",
    question: `A quadrilateral has all sides equal but no right angles. This is a:`,
    options: [
      "Square",
      "Rectangle",
      "Rhombus",
      "Trapezoid",
    ],
    correctAnswer: 2,
    explanation: `A rhombus has all sides equal but angles are not necessarily 90°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `What are the coordinates of the origin?`,
    options: [
      "(1, 0)",
      "(0, 1)",
      "(0, 0)",
      "(1, 1)",
    ],
    correctAnswer: 2,
    explanation: `The origin is the intersection of the axes at (0, 0).`
  },
  {
    id: 30,
    type: "geometry",
    question: `What is the interior angle of a regular octagon?`,
    options: [
      "120°",
      "125°",
      "130°",
      "135°",
    ],
    correctAnswer: 3,
    explanation: `Sum = (8-2) x 180 = 1,080°. Each = 1,080 ÷ 8 = 135°.`
  },
  {
    id: 31,
    type: "geometry",
    question: `How many lines of symmetry does an equilateral triangle have?`,
    options: [
      "1",
      "2",
      "3",
      "6",
    ],
    correctAnswer: 2,
    explanation: `An equilateral triangle has 3 lines of symmetry.`
  },
  {
    id: 32,
    type: "geometry",
    question: `Which pair of lines never intersect?`,
    options: [
      "Perpendicular",
      "Parallel",
      "Intersecting",
      "Diagonal",
    ],
    correctAnswer: 1,
    explanation: `Parallel lines never meet.`
  },
  {
    id: 33,
    type: "geometry",
    question: `A point (2, 5) is translated 3 right and 2 down. What are the new coordinates?`,
    options: [
      "(5, 3)",
      "(5, 7)",
      "(-1, 7)",
      "-1, 3)",
    ],
    correctAnswer: 0,
    explanation: `x: 2+3=5. y: 5-2=3. New point = (5, 3).`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 11, 17, 9, 15, 13.`,
    options: [
      "12",
      "13",
      "14",
      "15",
    ],
    correctAnswer: 1,
    explanation: `Mean = (11+17+9+15+13) ÷ 5 = 65 ÷ 5 = 13.`
  },
  {
    id: 35,
    type: "statistics",
    question: `Median of: 6, 14, 8, 20, 10, 16, 12.`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 6, 8, 10, 12, 14, 16, 20. Middle (4th) = 12.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Data: 5, 8, 5, 12, 5, 8, 9. What is the mode?`,
    options: [
      "5",
      "8",
      "9",
      "12",
    ],
    correctAnswer: 0,
    explanation: `5 appears 3 times. Mode = 5.`
  },
  {
    id: 37,
    type: "statistics",
    question: `Range of: 1.2, 3.5, 2.8, 0.9, 4.1 is:`,
    options: [
      "3.0",
      "3.2",
      "3.3",
      "3.5",
    ],
    correctAnswer: 1,
    explanation: `Range = 4.1 - 0.9 = 3.2.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A pie chart: Reading=90°, Science=120°, Art=60°, Music=90°. What fraction chose Science?`,
    options: [
      "1/3",
      "1/4",
      "2/5",
      "3/10",
    ],
    correctAnswer: 0,
    explanation: `Science = 120° out of 360°. Fraction = 120/360 = 1/3.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A bag has 4 red, 2 blue, 3 green, 1 yellow. What is P(yellow)?`,
    options: [
      "1/4",
      "1/10",
      "1/5",
      "2/10",
    ],
    correctAnswer: 1,
    explanation: `P(yellow) = 1/10.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The median of 7 numbers is 18. What position is the median?`,
    options: [
      "3rd",
      "4th",
      "5th",
      "6th",
    ],
    correctAnswer: 1,
    explanation: `With 7 values, the median is the 4th value (middle position).`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy6MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy6Questions : g5MathEasy6Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 6</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 6</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 6 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 6</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
