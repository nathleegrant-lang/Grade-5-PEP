"use client"

import { useState, useEffect, useCallback } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
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

const g5MathEasy4Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 23,456 + 4,789?`,
    options: [
      "28,145",
      "28,245",
      "28,235",
      "28,345",
    ],
    correctAnswer: 1,
    explanation: `23,456 + 4,789 = 28,245.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 15,000 - 6,437?`,
    options: [
      "8,453",
      "8,563",
      "8,573",
      "9,563",
    ],
    correctAnswer: 1,
    explanation: `15,000 - 6,437 = 8,563.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 94 x 8?`,
    options: [
      "742",
      "752",
      "762",
      "772",
    ],
    correctAnswer: 1,
    explanation: `94 x 8: (90 x 8) + (4 x 8) = 720 + 32 = 752.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 624 ÷ 8?`,
    options: [
      "68",
      "74",
      "76",
      "78",
    ],
    correctAnswer: 3,
    explanation: `624 ÷ 8 = 78. Check: 78 x 8 = 624.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 2/3 of 36?`,
    options: [
      "18",
      "20",
      "22",
      "24",
    ],
    correctAnswer: 3,
    explanation: `2/3 of 36 = (2 x 36) ÷ 3 = 72 ÷ 3 = 24.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 5/8 + 1/8?`,
    options: [
      "6/16",
      "6/8",
      "7/8",
      "3/4",
    ],
    correctAnswer: 1,
    explanation: `5/8 + 1/8 = 6/8 = 3/4. But as a fraction out of 8, it is 6/8.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 20% of 150?`,
    options: [
      "25",
      "30",
      "35",
      "40",
    ],
    correctAnswer: 1,
    explanation: `20% of 150 = 150 x 0.20 = 30.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 0.8 as a percentage.`,
    options: [
      "8%",
      "0.8%",
      "80%",
      "800%",
    ],
    correctAnswer: 2,
    explanation: `0.8 x 100 = 80%.`
  },
  {
    id: 9,
    type: "number",
    question: `What is the place value of 4 in 1,472,830?`,
    options: [
      "4,000",
      "40,000",
      "400,000",
      "4,000,000",
    ],
    correctAnswer: 2,
    explanation: `In 1,472,830 the 4 is in the hundred-thousands place. Value = 400,000.`
  },
  {
    id: 10,
    type: "number",
    question: `Which shows these fractions from least to greatest: 1/2, 2/3, 3/8?`,
    options: [
      "1/2, 2/3, 3/8",
      "3/8, 1/2, 2/3",
      "2/3, 1/2, 3/8",
      "3/8, 2/3, 1/2",
    ],
    correctAnswer: 1,
    explanation: `LCD=24: 1/2=12/24, 2/3=16/24, 3/8=9/24. Least to greatest: 3/8, 1/2, 2/3.`
  },
  {
    id: 11,
    type: "number",
    question: `A shop has 360 items. 5/9 are sold. How many remain?`,
    options: [
      "160",
      "200",
      "240",
      "180",
    ],
    correctAnswer: 0,
    explanation: `Sold = 5/9 x 360 = 200. Remaining = 360 - 200 = 160.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 6 and 10?`,
    options: [
      "20",
      "30",
      "40",
      "60",
    ],
    correctAnswer: 1,
    explanation: `Multiples of 6: 6,12,18,24,30. Multiples of 10: 10,20,30. LCM = 30.`
  },
  {
    id: 13,
    type: "number",
    question: `Which is a square number?`,
    options: [
      "18",
      "24",
      "36",
      "48",
    ],
    correctAnswer: 2,
    explanation: `6 x 6 = 36. 36 is a perfect square.`
  },
  {
    id: 14,
    type: "number",
    question: `A pattern: 3, 6, 12, 24, ___. What is the next term?`,
    options: [
      "30",
      "36",
      "42",
      "48",
    ],
    correctAnswer: 3,
    explanation: `Each number doubles. 24 x 2 = 48.`
  },
  {
    id: 15,
    type: "number",
    question: `Tickets cost $18 each. A group buys 9 tickets. What is the total cost?`,
    options: [
      "$152",
      "$162",
      "$172",
      "$182",
    ],
    correctAnswer: 1,
    explanation: `9 x $18 = $162.`
  },
  {
    id: 16,
    type: "measurement",
    question: `How many grams in 2.4 kg?`,
    options: [
      "24 g",
      "240 g",
      "2,400 g",
      "24,000 g",
    ],
    correctAnswer: 2,
    explanation: `1 kg = 1,000 g. 2.4 x 1,000 = 2,400 g.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a parallelogram with base 12 cm and height 5 cm?`,
    options: [
      "34 cm²",
      "60 cm²",
      "85 cm²",
      "120 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area = base x height = 12 x 5 = 60 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `What is the perimeter of an equilateral triangle with sides of 9 cm?`,
    options: [
      "18 cm",
      "24 cm",
      "27 cm",
      "36 cm",
    ],
    correctAnswer: 2,
    explanation: `Perimeter = 3 x 9 = 27 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `A movie starts at 6:45 PM and lasts 2 hours 30 minutes. When does it end?`,
    options: [
      "8:45 PM",
      "9:00 PM",
      "9:15 PM",
      "9:30 PM",
    ],
    correctAnswer: 2,
    explanation: `6:45 + 2 h = 8:45. 8:45 + 30 min = 9:15 PM.`
  },
  {
    id: 20,
    type: "measurement",
    question: `Which is heavier: 3.5 kg or 3,450 g?`,
    options: [
      "3.5 kg",
      "3,450 g",
      "They are equal",
      "Cannot tell",
    ],
    correctAnswer: 0,
    explanation: `3.5 kg = 3,500 g. 3,500 g > 3,450 g. So 3.5 kg is heavier.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A swimming pool holds 25,000 litres. How many kilolitres is that?`,
    options: [
      "250 kL",
      "2,500 kL",
      "25 kL",
      "2.5 kL",
    ],
    correctAnswer: 2,
    explanation: `1 kL = 1,000 L. 25,000 ÷ 1,000 = 25 kL.`
  },
  {
    id: 22,
    type: "measurement",
    question: `How many seconds are in 3 minutes?`,
    options: [
      "18 s",
      "30 s",
      "180 s",
      "300 s",
    ],
    correctAnswer: 2,
    explanation: `1 minute = 60 seconds. 3 x 60 = 180 seconds.`
  },
  {
    id: 23,
    type: "measurement",
    question: `What is the volume of a cuboid 6 cm x 4 cm x 3 cm?`,
    options: [
      "13 cm³",
      "48 cm³",
      "72 cm³",
      "96 cm³",
    ],
    correctAnswer: 2,
    explanation: `Volume = length x width x height = 6 x 4 x 3 = 72 cm³.`
  },
  {
    id: 24,
    type: "measurement",
    question: `A piece of fabric is 5 m 60 cm long. What is its length in cm?`,
    options: [
      "506 cm",
      "560 cm",
      "5,600 cm",
      "56 cm",
    ],
    correctAnswer: 1,
    explanation: `5 m = 500 cm. 500 + 60 = 560 cm.`
  },
  {
    id: 25,
    type: "measurement",
    question: `Temperature rises from -3°C to 18°C. What is the rise in temperature?`,
    options: [
      "15°C",
      "18°C",
      "21°C",
      "24°C",
    ],
    correctAnswer: 2,
    explanation: `-3 to 18: 18 - (-3) = 18 + 3 = 21°C.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Two angles are complementary. One is 35°. What is the other?`,
    options: [
      "45°",
      "55°",
      "65°",
      "75°",
    ],
    correctAnswer: 1,
    explanation: `Complementary angles add to 90°. 90 - 35 = 55°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many faces does a triangular pyramid (tetrahedron) have?`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 1,
    explanation: `A triangular pyramid has 4 triangular faces.`
  },
  {
    id: 28,
    type: "geometry",
    question: `An angle between 90° and 180° is called:`,
    options: [
      "Acute",
      "Right",
      "Obtuse",
      "Reflex",
    ],
    correctAnswer: 2,
    explanation: `An obtuse angle is between 90° and 180°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `What is the sum of interior angles of a quadrilateral?`,
    options: [
      "180°",
      "270°",
      "360°",
      "540°",
    ],
    correctAnswer: 2,
    explanation: `The interior angles of any quadrilateral sum to 360°.`
  },
  {
    id: 30,
    type: "geometry",
    question: `On a coordinate grid, what is the y-coordinate of the point (5, 3)?`,
    options: [
      "5",
      "3",
      "8",
      "2",
    ],
    correctAnswer: 1,
    explanation: `Coordinates are (x, y). In (5, 3), the y-coordinate is 3.`
  },
  {
    id: 31,
    type: "geometry",
    question: `A regular polygon has all sides and all angles equal. Which is NOT regular?`,
    options: [
      "Equilateral triangle",
      "Square",
      "Rectangle",
      "Regular hexagon",
    ],
    correctAnswer: 2,
    explanation: `A rectangle has equal angles (90° each) but not necessarily equal sides. It is not always regular.`
  },
  {
    id: 32,
    type: "geometry",
    question: `What is the name of a solid with 2 circular faces and 1 curved surface?`,
    options: [
      "Cone",
      "Cylinder",
      "Sphere",
      "Prism",
    ],
    correctAnswer: 1,
    explanation: `A cylinder has 2 circular faces and 1 curved surface.`
  },
  {
    id: 33,
    type: "geometry",
    question: `A point is reflected across the x-axis from (3, 4). What are the new coordinates?`,
    options: [
      "(-3, 4)",
      "(3, -4)",
      "(-3, -4)",
      "(4, 3)",
    ],
    correctAnswer: 1,
    explanation: `Reflecting across the x-axis changes the sign of the y-coordinate. (3, 4) → (3, -4).`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 5, 10, 15, 20, 25.`,
    options: [
      "12",
      "13",
      "15",
      "18",
    ],
    correctAnswer: 2,
    explanation: `Mean = (5+10+15+20+25) ÷ 5 = 75 ÷ 5 = 15.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 7, 2, 9, 4, 11, 6, 8?`,
    options: [
      "6",
      "7",
      "8",
      "9",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 2, 4, 6, 7, 8, 9, 11. Middle (4th) = 7.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Data: 6, 9, 9, 4, 7, 9, 4, 5. What is the mode?`,
    options: [
      "4",
      "5",
      "7",
      "9",
    ],
    correctAnswer: 3,
    explanation: `9 appears 3 times. Mode = 9.`
  },
  {
    id: 37,
    type: "statistics",
    question: `What is the range of: 52, 31, 78, 14, 65?`,
    options: [
      "47",
      "55",
      "64",
      "78",
    ],
    correctAnswer: 2,
    explanation: `Range = 78 - 14 = 64.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A survey of 50 students: 20 like cricket, 15 like football, 15 like netball. What percentage like cricket?`,
    options: [
      "20%",
      "25%",
      "40%",
      "50%",
    ],
    correctAnswer: 2,
    explanation: `20/50 x 100 = 40%.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A die is rolled. What is the probability of getting an even number?`,
    options: [
      "1/6",
      "1/3",
      "1/2",
      "2/3",
    ],
    correctAnswer: 2,
    explanation: `Even numbers on a die: 2, 4, 6. P = 3/6 = 1/2.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The mean of 5 numbers is 12. What is the total sum of all 5 numbers?`,
    options: [
      "12",
      "50",
      "60",
      "70",
    ],
    correctAnswer: 2,
    explanation: `Total = mean x count = 12 x 5 = 60.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy4MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy4Questions : g5MathEasy4Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 4</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 4</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 4 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 4</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
