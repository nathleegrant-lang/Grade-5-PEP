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

const g5MathEasy8Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 143,285 + 56,841?`,
    options: [
      "200,126",
      "200,236",
      "200,126",
      "199,136",
    ],
    correctAnswer: 0,
    explanation: `143,285 + 56,841 = 200,126.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 100,000 - 37,658?`,
    options: [
      "62,232",
      "62,342",
      "62,442",
      "63,342",
    ],
    correctAnswer: 1,
    explanation: `100,000 - 37,658 = 62,342.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 135 x 6?`,
    options: [
      "780",
      "800",
      "810",
      "820",
    ],
    correctAnswer: 2,
    explanation: `135 x 6: 100x6=600, 35x6=210. 600+210=810.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 2,880 ÷ 12?`,
    options: [
      "220",
      "230",
      "240",
      "250",
    ],
    correctAnswer: 2,
    explanation: `2,880 ÷ 12 = 240. Check: 240 x 12 = 2,880.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 7/8 of 64?`,
    options: [
      "49",
      "54",
      "56",
      "60",
    ],
    correctAnswer: 2,
    explanation: `7/8 of 64 = (7 x 64)÷8 = 448÷8 = 56.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 5/6 - 1/3?`,
    options: [
      "4/3",
      "1/2",
      "4/6",
      "1/6",
    ],
    correctAnswer: 1,
    explanation: `1/3=2/6. 5/6-2/6=3/6=1/2.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 15% of 200?`,
    options: [
      "25",
      "30",
      "35",
      "40",
    ],
    correctAnswer: 1,
    explanation: `15% of 200=0.15 x 200=30.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 5/8 as a decimal.`,
    options: [
      "0.58",
      "0.625",
      "0.65",
      "0.75",
    ],
    correctAnswer: 1,
    explanation: `5÷8=0.625.`
  },
  {
    id: 9,
    type: "number",
    question: `What is 2³ × 3²?`,
    options: [
      "36",
      "54",
      "72",
      "108",
    ],
    correctAnswer: 2,
    explanation: `2³=8. 3²=9. 8 x 9=72.`
  },
  {
    id: 10,
    type: "number",
    question: `What is the ratio 12:20 in simplest form?`,
    options: [
      "3:5",
      "2:4",
      "4:6",
      "6:10",
    ],
    correctAnswer: 0,
    explanation: `GCF(12,20)=4. 12÷4=3, 20÷4=5. Ratio=3:5.`
  },
  {
    id: 11,
    type: "number",
    question: `A class has 35 students. The ratio of boys to girls is 3:4. How many boys?`,
    options: [
      "14",
      "15",
      "16",
      "21",
    ],
    correctAnswer: 1,
    explanation: `Parts=7. Each=5. Boys=3x5=15.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 9, 12, 18?`,
    options: [
      "36",
      "54",
      "72",
      "108",
    ],
    correctAnswer: 0,
    explanation: `LCM(9,12)=36. LCM(36,18)=36.`
  },
  {
    id: 13,
    type: "number",
    question: `Which number is a perfect square AND a perfect cube?`,
    options: [
      "8",
      "27",
      "64",
      "36",
    ],
    correctAnswer: 2,
    explanation: `64=8²=4³. 64 is both.`
  },
  {
    id: 14,
    type: "number",
    question: `A pattern: 1, 3, 6, 10, 15, ___.`,
    options: [
      "18",
      "20",
      "21",
      "24",
    ],
    correctAnswer: 2,
    explanation: `Differences: 2,3,4,5,6. Next=15+6=21.`
  },
  {
    id: 15,
    type: "number",
    question: `Oranges are 3 for $15. What is the cost of 12 oranges?`,
    options: [
      "$50",
      "$55",
      "$60",
      "$65",
    ],
    correctAnswer: 2,
    explanation: `Cost per orange=$5. 12 x $5=$60.`
  },
  {
    id: 16,
    type: "measurement",
    question: `Convert 8,750 m to km.`,
    options: [
      "0.875 km",
      "8.75 km",
      "87.5 km",
      "875 km",
    ],
    correctAnswer: 1,
    explanation: `8,750÷1,000=8.75 km.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a trapezoid with parallel sides 8 cm and 12 cm, height 5 cm?`,
    options: [
      "25 cm²",
      "40 cm²",
      "50 cm²",
      "55 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area = ½(a+b)h = ½(8+12)x5 = ½x20x5 = 50 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `A rectangle has perimeter 54 cm and length 16 cm. What is its width?`,
    options: [
      "9 cm",
      "10 cm",
      "11 cm",
      "12 cm",
    ],
    correctAnswer: 2,
    explanation: `2(16+w)=54. 16+w=27. w=11 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `Express 185 minutes in hours and minutes.`,
    options: [
      "2h 55min",
      "3h 5min",
      "3h 15min",
      "3h 25min",
    ],
    correctAnswer: 1,
    explanation: `185÷60=3 remainder 5. = 3h 5min.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A car travels 60 km in 45 minutes. What is its speed in km/h?`,
    options: [
      "70",
      "75",
      "80",
      "85",
    ],
    correctAnswer: 2,
    explanation: `Rate=distance/time=60/(45/60)=60/0.75=80 km/h.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cylinder has radius 5 cm and height 10 cm. What is its volume? (Use π=3.14)`,
    options: [
      "785 cm³",
      "854 cm³",
      "1,570 cm³",
      "2,355 cm³",
    ],
    correctAnswer: 0,
    explanation: `V=πr²h=3.14x25x10=785 cm³.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A flight departs 8:40 AM and arrives at 11:10 AM. What is the flight duration?`,
    options: [
      "2h 10min",
      "2h 20min",
      "2h 30min",
      "2h 40min",
    ],
    correctAnswer: 2,
    explanation: `8:40 to 11:10=2h 30min.`
  },
  {
    id: 23,
    type: "measurement",
    question: `How many tiles of 25 cm x 25 cm are needed to cover a floor 5 m x 3 m?`,
    options: [
      "200",
      "220",
      "240",
      "260",
    ],
    correctAnswer: 0,
    explanation: `Floor=500x300=150,000 cm². Tile=625 cm². 150,000÷625=240.`
  },
  {
    id: 24,
    type: "measurement",
    question: `Convert 2.5 tonnes to kg.`,
    options: [
      "250 kg",
      "2,500 kg",
      "25,000 kg",
      "250,000 kg",
    ],
    correctAnswer: 1,
    explanation: `1 tonne=1,000 kg. 2.5 x 1,000=2,500 kg.`
  },
  {
    id: 25,
    type: "measurement",
    question: `Find the volume of a triangular prism with base area 24 cm² and length 10 cm.`,
    options: [
      "120 cm³",
      "240 cm³",
      "140 cm³",
      "80 cm³",
    ],
    correctAnswer: 1,
    explanation: `V=base area x length=24 x 10=240 cm³.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Angles at a point add up to:`,
    options: [
      "90°",
      "180°",
      "270°",
      "360°",
    ],
    correctAnswer: 3,
    explanation: `Angles at a point always sum to 360°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many vertices does a hexagonal prism have?`,
    options: [
      "6",
      "8",
      "10",
      "12",
    ],
    correctAnswer: 3,
    explanation: `2 hexagonal faces x 6 vertices = 12 vertices.`
  },
  {
    id: 28,
    type: "geometry",
    question: `Two angles of a triangle are 65° and 75°. What is the third?`,
    options: [
      "30°",
      "35°",
      "40°",
      "45°",
    ],
    correctAnswer: 2,
    explanation: `180-65-75=40°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `The area of a circle with radius 7 cm is: (Use π=22/7)`,
    options: [
      "44 cm²",
      "77 cm²",
      "154 cm²",
      "308 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area=π r²=(22/7)x49=154 cm².`
  },
  {
    id: 30,
    type: "geometry",
    question: `A kite has diagonals of 10 cm and 8 cm. Its area is:`,
    options: [
      "18 cm²",
      "40 cm²",
      "80 cm²",
      "160 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area=(d₁ x d₂)/2=(10x8)/2=40 cm².`
  },
  {
    id: 31,
    type: "geometry",
    question: `What are the new coordinates when (5, 3) is rotated 90° anticlockwise about the origin?`,
    options: [
      "(-3, 5)",
      "(3, -5)",
      "(3, 5)",
      "(-5, 3)",
    ],
    correctAnswer: 0,
    explanation: `90° anticlockwise: (x,y)→(-y,x). (5,3)→(-3,5).`
  },
  {
    id: 32,
    type: "geometry",
    question: `A rhombus has diagonals of 12 cm and 16 cm. Its area is:`,
    options: [
      "48 cm²",
      "96 cm²",
      "192 cm²",
      "144 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area=(d₁ x d₂)/2=(12x16)/2=96 cm².`
  },
  {
    id: 33,
    type: "geometry",
    question: `The exterior angle of a regular polygon is 40°. How many sides does it have?`,
    options: [
      "7",
      "8",
      "9",
      "10",
    ],
    correctAnswer: 2,
    explanation: `Sides = 360÷40 = 9 sides.`
  },
  {
    id: 34,
    type: "statistics",
    question: `Mean of: 4.5, 6.5, 8.5, 10.5.`,
    options: [
      "6.5",
      "7.5",
      "8.0",
      "8.5",
    ],
    correctAnswer: 1,
    explanation: `Mean=(4.5+6.5+8.5+10.5)÷4=30÷4=7.5.`
  },
  {
    id: 35,
    type: "statistics",
    question: `Median of: 32, 17, 45, 28, 53, 21, 39.`,
    options: [
      "28",
      "32",
      "35",
      "39",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 17,21,28,32,39,45,53. Middle=32.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Data: 5,8,8,3,5,8,9,5,8. Mode:`,
    options: [
      "5",
      "8",
      "3",
      "9",
    ],
    correctAnswer: 1,
    explanation: `8 appears 4 times. Mode=8.`
  },
  {
    id: 37,
    type: "statistics",
    question: `Range of: 45, 32, 78, 19, 64:`,
    options: [
      "49",
      "57",
      "59",
      "64",
    ],
    correctAnswer: 2,
    explanation: `78-19=59.`
  },
  {
    id: 38,
    type: "statistics",
    question: `In a survey: 40% prefer Maths, 25% Science, 20% English, 15% Art. Total = 200 students. How many prefer Science?`,
    options: [
      "40",
      "45",
      "50",
      "55",
    ],
    correctAnswer: 2,
    explanation: `25% of 200=50.`
  },
  {
    id: 39,
    type: "statistics",
    question: `Two dice are rolled. P(sum=7):`,
    options: [
      "1/6",
      "4/36",
      "5/36",
      "6/36",
    ],
    correctAnswer: 0,
    explanation: `Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)=6 pairs. P=6/36=1/6.`
  },
  {
    id: 40,
    type: "statistics",
    question: `If the mode is 8 and the range is 12 with minimum 3, what is the maximum value?`,
    options: [
      "12",
      "14",
      "15",
      "18",
    ],
    correctAnswer: 2,
    explanation: `Maximum=minimum+range=3+12=15.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy8MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy8Questions : g5MathEasy8Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 8</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 8</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 8 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 8</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
