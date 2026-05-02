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

const g5MathEasy3Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 12,450 + 3,675?`,
    options: [
      "16,025",
      "16,125",
      "16,025",
      "16,225",
    ],
    correctAnswer: 1,
    explanation: `12,450 + 3,675 = 16,125.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 10,000 - 4,382?`,
    options: [
      "5,518",
      "5,618",
      "5,628",
      "6,618",
    ],
    correctAnswer: 1,
    explanation: `10,000 - 4,382 = 5,618.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 57 x 6?`,
    options: [
      "332",
      "342",
      "352",
      "342",
    ],
    correctAnswer: 1,
    explanation: `57 x 6: (50 x 6) + (7 x 6) = 300 + 42 = 342.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 840 ÷ 7?`,
    options: [
      "110",
      "115",
      "120",
      "125",
    ],
    correctAnswer: 2,
    explanation: `840 ÷ 7 = 120. Check: 120 x 7 = 840.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 3/5 of 45?`,
    options: [
      "21",
      "24",
      "27",
      "30",
    ],
    correctAnswer: 2,
    explanation: `3/5 of 45 = (3 x 45) ÷ 5 = 135 ÷ 5 = 27.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 4/6 - 1/6?`,
    options: [
      "3/6",
      "3/12",
      "1/2",
      "1/3",
    ],
    correctAnswer: 2,
    explanation: `4/6 - 1/6 = 3/6 = 1/2.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 50% of 120?`,
    options: [
      "40",
      "50",
      "60",
      "70",
    ],
    correctAnswer: 2,
    explanation: `50% of 120 = 120 ÷ 2 = 60.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 0.45 as a fraction in simplest form.`,
    options: [
      "45/10",
      "9/20",
      "45/100",
      "5/9",
    ],
    correctAnswer: 1,
    explanation: `0.45 = 45/100 = 9/20. Divide by 5.`
  },
  {
    id: 9,
    type: "number",
    question: `What is the place value of 8 in 382,916?`,
    options: [
      "8,000",
      "80,000",
      "800",
      "8",
    ],
    correctAnswer: 1,
    explanation: `In 382,916 the 8 is in the ten-thousands place. Its value = 80,000.`
  },
  {
    id: 10,
    type: "number",
    question: `Which is the smallest: 0.6, 0.55, 0.605, 0.56?`,
    options: [
      "0.6",
      "0.55",
      "0.605",
      "0.56",
    ],
    correctAnswer: 1,
    explanation: `0.55 < 0.56 < 0.6 < 0.605. Smallest is 0.55.`
  },
  {
    id: 11,
    type: "number",
    question: `A school collects 240 cans. 1/4 are donated to charity. How many remain?`,
    options: [
      "60",
      "120",
      "180",
      "210",
    ],
    correctAnswer: 2,
    explanation: `Donated = 1/4 x 240 = 60. Remaining = 240 - 60 = 180.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the HCF of 30 and 45?`,
    options: [
      "5",
      "10",
      "15",
      "30",
    ],
    correctAnswer: 2,
    explanation: `Factors of 30: 1,2,3,5,6,10,15,30. Factors of 45: 1,3,5,9,15,45. HCF = 15.`
  },
  {
    id: 13,
    type: "number",
    question: `Which number is a multiple of both 6 and 9?`,
    options: [
      "12",
      "18",
      "24",
      "36",
    ],
    correctAnswer: 1,
    explanation: `18 = 6x3 and 18 = 9x2. 18 is a multiple of both.`
  },
  {
    id: 14,
    type: "number",
    question: `A number pattern: 2, 4, 8, 16, ___. What is the next term?`,
    options: [
      "20",
      "24",
      "32",
      "48",
    ],
    correctAnswer: 2,
    explanation: `Each number doubles. 16 x 2 = 32.`
  },
  {
    id: 15,
    type: "number",
    question: `Maria saved $35 per week for 6 weeks. How much did she save altogether?`,
    options: [
      "$180",
      "$200",
      "$210",
      "$220",
    ],
    correctAnswer: 2,
    explanation: `6 x $35 = $210.`
  },
  {
    id: 16,
    type: "measurement",
    question: `A wall is 4.5 m long. What is its length in centimetres?`,
    options: [
      "45 cm",
      "405 cm",
      "450 cm",
      "4,500 cm",
    ],
    correctAnswer: 2,
    explanation: `4.5 m x 100 = 450 cm.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a square with sides of 11 cm?`,
    options: [
      "44 cm²",
      "88 cm²",
      "121 cm²",
      "111 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area = 11 x 11 = 121 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `A rectangular room is 8 m long and 6 m wide. What is its perimeter?`,
    options: [
      "14 m",
      "28 m",
      "48 m",
      "56 m",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 2 x (8 + 6) = 2 x 14 = 28 m.`
  },
  {
    id: 19,
    type: "measurement",
    question: `A jug contains 3.5 L of juice. How many 500 mL glasses can be filled?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 2,
    explanation: `3.5 L = 3,500 mL. 3,500 ÷ 500 = 7 glasses.`
  },
  {
    id: 20,
    type: "measurement",
    question: `Convert 2 hours 15 minutes to minutes.`,
    options: [
      "115 min",
      "125 min",
      "130 min",
      "135 min",
    ],
    correctAnswer: 3,
    explanation: `2 hours = 120 minutes. 120 + 15 = 135 minutes.`
  },
  {
    id: 21,
    type: "measurement",
    question: `Which is the best unit for measuring the mass of a watermelon?`,
    options: [
      "mg",
      "g",
      "kg",
      "t",
    ],
    correctAnswer: 2,
    explanation: `A watermelon weighs a few kilograms. kg is the best unit.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A train departs at 11:45 AM and arrives at 3:15 PM. How long is the journey?`,
    options: [
      "3 h",
      "3 h 30 min",
      "3 h 15 min",
      "4 h",
    ],
    correctAnswer: 1,
    explanation: `11:45 to 3:15: 11:45 to 12:45 = 1 h, 12:45 to 3:15 = 2 h 30 min. Total = 3 h 30 min.`
  },
  {
    id: 23,
    type: "measurement",
    question: `The perimeter of a regular hexagon is 54 cm. What is the length of one side?`,
    options: [
      "6 cm",
      "8 cm",
      "9 cm",
      "12 cm",
    ],
    correctAnswer: 2,
    explanation: `One side = 54 ÷ 6 = 9 cm.`
  },
  {
    id: 24,
    type: "measurement",
    question: `Temperature dropped from 28°C to 14°C overnight. By how much did it drop?`,
    options: [
      "12°C",
      "14°C",
      "16°C",
      "18°C",
    ],
    correctAnswer: 1,
    explanation: `28 - 14 = 14°C.`
  },
  {
    id: 25,
    type: "measurement",
    question: `How many months are in 4 years?`,
    options: [
      "24",
      "36",
      "48",
      "60",
    ],
    correctAnswer: 2,
    explanation: `1 year = 12 months. 4 x 12 = 48 months.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Two angles are supplementary. One is 70°. What is the other?`,
    options: [
      "20°",
      "100°",
      "110°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `Supplementary angles add to 180°. 180 - 70 = 110°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many edges does a triangular prism have?`,
    options: [
      "6",
      "8",
      "9",
      "12",
    ],
    correctAnswer: 2,
    explanation: `A triangular prism has 9 edges: 3 on each triangular face and 3 connecting them.`
  },
  {
    id: 28,
    type: "geometry",
    question: `What type of triangle has two equal sides?`,
    options: [
      "Scalene",
      "Equilateral",
      "Isosceles",
      "Right-angled",
    ],
    correctAnswer: 2,
    explanation: `An isosceles triangle has exactly two equal sides.`
  },
  {
    id: 29,
    type: "geometry",
    question: `A shape is rotated 90° clockwise around a fixed point. This is a:`,
    options: [
      "Translation",
      "Reflection",
      "Rotation",
      "Enlargement",
    ],
    correctAnswer: 2,
    explanation: `Turning a shape around a fixed point is called rotation.`
  },
  {
    id: 30,
    type: "geometry",
    question: `The coordinates of a point are (4, 2). Which direction is the x-axis?`,
    options: [
      "Vertical",
      "Horizontal",
      "Diagonal",
      "Circular",
    ],
    correctAnswer: 1,
    explanation: `The x-axis is horizontal. The y-axis is vertical.`
  },
  {
    id: 31,
    type: "geometry",
    question: `How many right angles does a rectangle have?`,
    options: [
      "2",
      "3",
      "4",
      "6",
    ],
    correctAnswer: 2,
    explanation: `A rectangle has 4 right angles (90° each).`
  },
  {
    id: 32,
    type: "geometry",
    question: `A cube has sides of 5 cm. What is the total surface area?`,
    options: [
      "25 cm²",
      "75 cm²",
      "100 cm²",
      "150 cm²",
    ],
    correctAnswer: 3,
    explanation: `A cube has 6 faces. Each face area = 5 x 5 = 25 cm². Total = 6 x 25 = 150 cm².`
  },
  {
    id: 33,
    type: "geometry",
    question: `How many lines of symmetry does a rectangle (non-square) have?`,
    options: [
      "1",
      "2",
      "4",
      "0",
    ],
    correctAnswer: 1,
    explanation: `A non-square rectangle has 2 lines of symmetry.`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 14, 18, 22, 26.`,
    options: [
      "18",
      "19",
      "20",
      "21",
    ],
    correctAnswer: 2,
    explanation: `Mean = (14+18+22+26) ÷ 4 = 80 ÷ 4 = 20.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 4, 6, 8, 10, 12, 14?`,
    options: [
      "8",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 1,
    explanation: `With 6 values, median = average of 3rd and 4th = (8+10)/2 = 9.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Scores: 3, 5, 3, 8, 3, 7, 5, 6. What is the mode?`,
    options: [
      "3",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 0,
    explanation: `3 appears 3 times. Mode = 3.`
  },
  {
    id: 37,
    type: "statistics",
    question: `What is the range of: 33, 18, 47, 9, 25?`,
    options: [
      "28",
      "38",
      "47",
      "9",
    ],
    correctAnswer: 1,
    explanation: `Range = 47 - 9 = 38.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A bar chart: Science 30, Maths 25, English 20, Art 15. What fraction chose Maths?`,
    options: [
      "1/3",
      "1/4",
      "5/18",
      "5/16",
    ],
    correctAnswer: 1,
    explanation: `Total = 90. Maths = 25. 25/90 = 5/18.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A bag has 3 red, 3 blue, and 4 green balls. What is P(green)?`,
    options: [
      "1/4",
      "2/5",
      "3/10",
      "4/10",
    ],
    correctAnswer: 1,
    explanation: `P(green) = 4/10 = 2/5.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The mean of 4 numbers is 15. Three are 12, 18, and 14. What is the fourth?`,
    options: [
      "14",
      "15",
      "16",
      "17",
    ],
    correctAnswer: 2,
    explanation: `Total = 4 x 15 = 60. 60 - 12 - 18 - 14 = 16.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy3MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy3Questions : g5MathEasy3Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 3</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 3</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 3 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 3</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
