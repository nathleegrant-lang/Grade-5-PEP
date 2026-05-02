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

const g5MathEasy10Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 1,000,000 - 456,789?`,
    options: [
      "543,111",
      "543,211",
      "544,111",
      "543,211",
    ],
    correctAnswer: 0,
    explanation: `1,000,000 - 456,789 = 543,211.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 365 x 24?`,
    options: [
      "8,660",
      "8,760",
      "8,860",
      "8,960",
    ],
    correctAnswer: 1,
    explanation: `365 x 24 = 365 x 20 + 365 x 4 = 7,300 + 1,460 = 8,760.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 8,280 ÷ 15?`,
    options: [
      "548",
      "552",
      "558",
      "562",
    ],
    correctAnswer: 1,
    explanation: `8,280 ÷ 15 = 552. Check: 552 x 15=8,280.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 2¼ × 1⅓?`,
    options: [
      "2",
      "2½",
      "3",
      "3½",
    ],
    correctAnswer: 2,
    explanation: `2¼=9/4, 1⅓=4/3. (9/4)x(4/3)=36/12=3.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 5/6 ÷ 5/12?`,
    options: [
      "1/2",
      "1",
      "2",
      "5/72",
    ],
    correctAnswer: 2,
    explanation: `5/6 ÷ 5/12 = 5/6 x 12/5 = 60/30 = 2.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 18% of 350?`,
    options: [
      "58",
      "60",
      "62",
      "63",
    ],
    correctAnswer: 3,
    explanation: `18% of 350=0.18 x 350=63.`
  },
  {
    id: 7,
    type: "number",
    question: `A price of $240 is increased by 15%. New price:`,
    options: [
      "$256",
      "$274",
      "$276",
      "$285",
    ],
    correctAnswer: 2,
    explanation: `15% of 240=$36. New=$240+$36=$276.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 1.375 as a mixed number in simplest form.`,
    options: [
      "1 3/8",
      "1 4/8",
      "1 375/100",
      "1 3/4",
    ],
    correctAnswer: 0,
    explanation: `0.375=375/1000=3/8. So 1.375=1 3/8.`
  },
  {
    id: 9,
    type: "number",
    question: `What is √(36 + 64)?`,
    options: [
      "8",
      "10",
      "√100",
      "14",
    ],
    correctAnswer: 1,
    explanation: `36+64=100. √100=10.`
  },
  {
    id: 10,
    type: "number",
    question: `If x:15 = 4:5, find x.`,
    options: [
      "12",
      "11",
      "10",
      "9",
    ],
    correctAnswer: 0,
    explanation: `x/15=4/5. x=4x15/5=12.`
  },
  {
    id: 11,
    type: "number",
    question: `A discount of 30% reduces a price to $210. What was the original price?`,
    options: [
      "$270",
      "$280",
      "$290",
      "$300",
    ],
    correctAnswer: 3,
    explanation: `70% = $210. 100% = $210/0.7 = $300.`
  },
  {
    id: 12,
    type: "number",
    question: `What is 12 - 3 × 4 + 6 ÷ 2? (Order of operations)`,
    options: [
      "3",
      "9",
      "12",
      "15",
    ],
    correctAnswer: 0,
    explanation: `3x4=12, 6÷2=3. 12-12+3=3.`
  },
  {
    id: 13,
    type: "number",
    question: `What is 5.4 × 0.06?`,
    options: [
      "0.0324",
      "0.324",
      "3.24",
      "32.4",
    ],
    correctAnswer: 1,
    explanation: `5.4 x 6=32.4. Place 3 decimal places: 0.324.`
  },
  {
    id: 14,
    type: "number",
    question: `A car's fuel consumption is 12 km per litre. How many litres for a 300 km trip?`,
    options: [
      "20 L",
      "22 L",
      "25 L",
      "30 L",
    ],
    correctAnswer: 2,
    explanation: `300 ÷ 12 = 25 litres.`
  },
  {
    id: 15,
    type: "number",
    question: `Find the value: 3² × (4 + 2) - 18 ÷ 3.`,
    options: [
      "42",
      "48",
      "50",
      "54",
    ],
    correctAnswer: 1,
    explanation: `3²=9. (4+2)=6. 18÷3=6. 9x6-6=54-6=48.`
  },
  {
    id: 16,
    type: "measurement",
    question: `A circular pool has radius 7 m. What is its circumference? (π=22/7)`,
    options: [
      "22 m",
      "44 m",
      "66 m",
      "88 m",
    ],
    correctAnswer: 1,
    explanation: `C=2πr=2x(22/7)x7=44 m.`
  },
  {
    id: 17,
    type: "measurement",
    question: `A field is a parallelogram with base 20 m and height 12 m. Area:`,
    options: [
      "120 m²",
      "200 m²",
      "240 m²",
      "280 m²",
    ],
    correctAnswer: 2,
    explanation: `Area=base x height=20 x 12=240 m².`
  },
  {
    id: 18,
    type: "measurement",
    question: `A right triangle has hypotenuse 13 cm and one leg 5 cm. Other leg:`,
    options: [
      "8 cm",
      "10 cm",
      "12 cm",
      "11 cm",
    ],
    correctAnswer: 2,
    explanation: `√(13²-5²)=√(169-25)=√144=12 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `A pipe flows at 15 L per minute. How long to fill a 750 L tank?`,
    options: [
      "45 min",
      "50 min",
      "55 min",
      "60 min",
    ],
    correctAnswer: 1,
    explanation: `750 ÷ 15 = 50 minutes.`
  },
  {
    id: 20,
    type: "measurement",
    question: `Convert 4 hours 48 minutes to minutes.`,
    options: [
      "268 min",
      "278 min",
      "288 min",
      "298 min",
    ],
    correctAnswer: 2,
    explanation: `4 x 60 + 48 = 240 + 48 = 288 minutes.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cuboid has dimensions 12 cm x 8 cm x 5 cm. Total surface area:`,
    options: [
      "352 cm²",
      "392 cm²",
      "492 cm²",
      "292 cm²",
    ],
    correctAnswer: 1,
    explanation: `SA=2(12x8+8x5+5x12)=2(96+40+60)=2x196=392 cm².`
  },
  {
    id: 22,
    type: "measurement",
    question: `Speed = distance ÷ time. A cyclist covers 45 km in 1.5 hours. Speed in km/h:`,
    options: [
      "25",
      "28",
      "30",
      "35",
    ],
    correctAnswer: 2,
    explanation: `45 ÷ 1.5 = 30 km/h.`
  },
  {
    id: 23,
    type: "measurement",
    question: `A path 2 m wide runs around the outside of a 10 m x 6 m garden. What is the area of the path only?`,
    options: [
      "36 m²",
      "48 m²",
      "60 m²",
      "80 m²",
    ],
    correctAnswer: 3,
    explanation: `Outer=(10+4)x(6+4)=14x10=140. Garden=10x6=60. Path=140-60=80 m².`
  },
  {
    id: 24,
    type: "measurement",
    question: `A train travels at 90 km/h. How far in 40 minutes?`,
    options: [
      "50 km",
      "55 km",
      "60 km",
      "65 km",
    ],
    correctAnswer: 2,
    explanation: `40 min = 2/3 h. Distance=90 x 2/3=60 km.`
  },
  {
    id: 25,
    type: "measurement",
    question: `Density = mass ÷ volume. A rock has mass 240 g and volume 80 cm³. Density:`,
    options: [
      "2 g/cm³",
      "3 g/cm³",
      "4 g/cm³",
      "5 g/cm³",
    ],
    correctAnswer: 1,
    explanation: `Density = 240 ÷ 80 = 3 g/cm³.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Find the area of a sector with radius 6 cm and angle 90°. (π=3.14)`,
    options: [
      "14.13 cm²",
      "28.26 cm²",
      "56.52 cm²",
      "9.42 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area=(90/360)x3.14x36=(1/4)x113.04=28.26 cm².`
  },
  {
    id: 27,
    type: "geometry",
    question: `A cylinder has radius 5 cm and height 12 cm. Curved surface area: (π=3.14)`,
    options: [
      "314 cm²",
      "376.8 cm²",
      "534.8 cm²",
      "628 cm²",
    ],
    correctAnswer: 1,
    explanation: `CSA=2πrh=2x3.14x5x12=376.8 cm².`
  },
  {
    id: 28,
    type: "geometry",
    question: `Three angles of a quadrilateral are 75°, 110°, 85°. Fourth angle:`,
    options: [
      "80°",
      "90°",
      "95°",
      "100°",
    ],
    correctAnswer: 1,
    explanation: `360-75-110-85=90°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `A pentagon has interior angles summing to 540°. Four angles are 100°, 110°, 120°, 95°. Fifth angle:`,
    options: [
      "105°",
      "110°",
      "115°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `540-100-110-120-95=115°.`
  },
  {
    id: 30,
    type: "geometry",
    question: `If ABCD is a rectangle and diagonal BD=13 cm, BC=5 cm. Length AB:`,
    options: [
      "8 cm",
      "10 cm",
      "12 cm",
      "13 cm",
    ],
    correctAnswer: 2,
    explanation: `In right triangle ABD: AB=√(BD²-AD²). Wait: In rectangle, diagonal²=l²+w². 13²=AB²+5². AB²=169-25=144. AB=12 cm.`
  },
  {
    id: 31,
    type: "geometry",
    question: `A circle with diameter 10 cm. What is the area of the semicircle? (π=3.14)`,
    options: [
      "39.25 cm²",
      "78.5 cm²",
      "157 cm²",
      "314 cm²",
    ],
    correctAnswer: 0,
    explanation: `Area=½πr²=½x3.14x25=39.25 cm².`
  },
  {
    id: 32,
    type: "geometry",
    question: `The bearing of a point is 270°. This means it is due:`,
    options: [
      "North",
      "South",
      "East",
      "West",
    ],
    correctAnswer: 3,
    explanation: `270° bearing is due West.`
  },
  {
    id: 33,
    type: "geometry",
    question: `A regular polygon has 12 sides. Each interior angle:`,
    options: [
      "150°",
      "155°",
      "160°",
      "165°",
    ],
    correctAnswer: 0,
    explanation: `Sum=(12-2)x180=1800°. Each=1800÷12=150°.`
  },
  {
    id: 34,
    type: "statistics",
    question: `The mean of 10 scores is 72. The mean of a different group of 15 scores is 78. Combined mean:`,
    options: [
      "75",
      "75.6",
      "76",
      "76.5",
    ],
    correctAnswer: 1,
    explanation: `Sum1=720, Sum2=1170. Combined=1890÷25=75.6.`
  },
  {
    id: 35,
    type: "statistics",
    question: `Lower quartile of: 5,8,12,15,18,22,25,30.`,
    options: [
      "10",
      "11",
      "12",
      "13",
    ],
    correctAnswer: 0,
    explanation: `Q1 = median of lower half (5,8,12,15) = (8+12)/2=10.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Frequency table: x=2(f=3), x=4(f=5), x=6(f=7), x=8(f=5). Mean:`,
    options: [
      "5.0",
      "5.2",
      "5.4",
      "5.6",
    ],
    correctAnswer: 2,
    explanation: `(6+20+42+40)/20=108/20=5.4.`
  },
  {
    id: 37,
    type: "statistics",
    question: `P(sum=8 with two dice):`,
    options: [
      "4/36",
      "5/36",
      "6/36",
      "7/36",
    ],
    correctAnswer: 1,
    explanation: `Pairs: (2,6),(3,5),(4,4),(5,3),(6,2)=5 pairs. P=5/36.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A sample of 200: 35% scored above 80. How many scored 80 or below?`,
    options: [
      "60",
      "80",
      "120",
      "130",
    ],
    correctAnswer: 3,
    explanation: `Above 80=70. At or below=200-70=130.`
  },
  {
    id: 39,
    type: "statistics",
    question: `Upper quartile (Q3) of: 10, 14, 18, 22, 26, 30, 34.`,
    options: [
      "24",
      "26",
      "28",
      "30",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 10,14,18,22,26,30,34. Upper half: 26,30,34. Q3=30.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The probability of an event is 0.4. How many times would you expect it to occur in 500 trials?`,
    options: [
      "150",
      "180",
      "200",
      "250",
    ],
    correctAnswer: 2,
    explanation: `0.4 x 500 = 200.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy10MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy10Questions : g5MathEasy10Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 10</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 10</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 10 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 10</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
