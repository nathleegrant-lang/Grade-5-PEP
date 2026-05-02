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

const g5MathEasy1Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 4,563 + 2,847?`,
    options: [
      "7,310",
      "7,410",
      "7,310",
      "7,400",
    ],
    correctAnswer: 1,
    explanation: `Add column by column: ones 3+7=10 (write 0 carry 1), tens 6+4+1=11 (write 1 carry 1), hundreds 5+8+1=14 (write 4 carry 1), thousands 4+2+1=7. Answer = 7,410.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 8,000 - 3,456?`,
    options: [
      "4,444",
      "4,544",
      "4,454",
      "4,644",
    ],
    correctAnswer: 1,
    explanation: `8,000 - 3,456 = 4,544. Check: 3,456 + 4,544 = 8,000.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 63 x 9?`,
    options: [
      "557",
      "567",
      "577",
      "587",
    ],
    correctAnswer: 1,
    explanation: `63 x 9: (60 x 9) + (3 x 9) = 540 + 27 = 567.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 432 ÷ 6?`,
    options: [
      "62",
      "70",
      "72",
      "74",
    ],
    correctAnswer: 2,
    explanation: `432 ÷ 6 = 72. Check: 72 x 6 = 432.`
  },
  {
    id: 5,
    type: "number",
    question: `What fraction of 20 is 5?`,
    options: [
      "1/5",
      "1/4",
      "1/3",
      "1/2",
    ],
    correctAnswer: 1,
    explanation: `5 out of 20 = 5/20 = 1/4.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 1/3 + 1/3?`,
    options: [
      "2/6",
      "2/3",
      "1/6",
      "1/3",
    ],
    correctAnswer: 1,
    explanation: `Same denominator: 1/3 + 1/3 = 2/3.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 25% of 80?`,
    options: [
      "15",
      "20",
      "25",
      "30",
    ],
    correctAnswer: 1,
    explanation: `25% of 80 = 80/4 = 20.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 0.6 as a fraction in simplest form.`,
    options: [
      "6/100",
      "6/10",
      "3/5",
      "3/10",
    ],
    correctAnswer: 2,
    explanation: `0.6 = 6/10 = 3/5. Divide by 2.`
  },
  {
    id: 9,
    type: "number",
    question: `What is the value of the digit 7 in 57,384?`,
    options: [
      "7",
      "700",
      "7,000",
      "70,000",
    ],
    correctAnswer: 2,
    explanation: `In 57,384 the 7 is in the thousands place. Its value is 7,000.`
  },
  {
    id: 10,
    type: "number",
    question: `Round 34,756 to the nearest thousand.`,
    options: [
      "34,000",
      "34,800",
      "35,000",
      "34,700",
    ],
    correctAnswer: 2,
    explanation: `The hundreds digit is 7 (≥5), so round up. 34,756 → 35,000.`
  },
  {
    id: 11,
    type: "number",
    question: `A school has 1,250 students. 2/5 are in upper school. How many is that?`,
    options: [
      "400",
      "450",
      "500",
      "550",
    ],
    correctAnswer: 2,
    explanation: `2/5 of 1,250 = (2 × 1,250) ÷ 5 = 2,500 ÷ 5 = 500.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 4 and 6?`,
    options: [
      "8",
      "10",
      "12",
      "24",
    ],
    correctAnswer: 2,
    explanation: `Multiples of 4: 4, 8, 12. Multiples of 6: 6, 12. LCM = 12.`
  },
  {
    id: 13,
    type: "number",
    question: `Which number is a factor of both 18 and 24?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 1,
    explanation: `Factors of 18: 1,2,3,6,9,18. Factors of 24: 1,2,3,4,6,8,12,24. Common factor = 6.`
  },
  {
    id: 14,
    type: "number",
    question: `What is the next number in the pattern: 5, 10, 20, 40, ___?`,
    options: [
      "60",
      "70",
      "80",
      "100",
    ],
    correctAnswer: 2,
    explanation: `Each number doubles. 40 x 2 = 80.`
  },
  {
    id: 15,
    type: "number",
    question: `Kevin earns $12 per hour. He works 8 hours. How much does he earn?`,
    options: [
      "$86",
      "$96",
      "$98",
      "$106",
    ],
    correctAnswer: 1,
    explanation: `8 x $12 = $96.`
  },
  {
    id: 16,
    type: "measurement",
    question: `How many centimetres are in 3.5 metres?`,
    options: [
      "35 cm",
      "305 cm",
      "350 cm",
      "3,500 cm",
    ],
    correctAnswer: 2,
    explanation: `1 m = 100 cm. 3.5 x 100 = 350 cm.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a rectangle 9 cm long and 6 cm wide?`,
    options: [
      "30 cm²",
      "54 cm²",
      "27 cm²",
      "45 cm²",
    ],
    correctAnswer: 1,
    explanation: `Area = length x width = 9 x 6 = 54 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `What is the perimeter of a square with sides of 8 cm?`,
    options: [
      "16 cm",
      "24 cm",
      "32 cm",
      "64 cm",
    ],
    correctAnswer: 2,
    explanation: `Perimeter = 4 x 8 = 32 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `A class starts at 8:30 AM and ends at 2:30 PM. How long is the class?`,
    options: [
      "5 hours",
      "6 hours",
      "6.5 hours",
      "7 hours",
    ],
    correctAnswer: 1,
    explanation: `8:30 AM to 2:30 PM = 6 hours.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A bag of rice weighs 2 kg 500 g. What is its mass in grams?`,
    options: [
      "2,050 g",
      "2,500 g",
      "25,000 g",
      "250 g",
    ],
    correctAnswer: 1,
    explanation: `2 kg = 2,000 g. 2,000 + 500 = 2,500 g.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A bottle contains 1.5 litres. How many millilitres is that?`,
    options: [
      "150 mL",
      "1,050 mL",
      "1,500 mL",
      "15,000 mL",
    ],
    correctAnswer: 2,
    explanation: `1 litre = 1,000 mL. 1.5 x 1,000 = 1,500 mL.`
  },
  {
    id: 22,
    type: "measurement",
    question: `How many days are in 3 weeks and 4 days?`,
    options: [
      "21",
      "24",
      "25",
      "28",
    ],
    correctAnswer: 2,
    explanation: `3 weeks = 21 days. 21 + 4 = 25 days.`
  },
  {
    id: 23,
    type: "measurement",
    question: `A rectangular garden is 12 m long and 5 m wide. What is its perimeter?`,
    options: [
      "17 m",
      "34 m",
      "60 m",
      "70 m",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 2 x (12 + 5) = 2 x 17 = 34 m.`
  },
  {
    id: 24,
    type: "measurement",
    question: `Which is the best estimate for the length of a classroom?`,
    options: [
      "6 mm",
      "6 cm",
      "6 m",
      "6 km",
    ],
    correctAnswer: 2,
    explanation: `A classroom is approximately 6 metres long. Metres is the correct unit.`
  },
  {
    id: 25,
    type: "measurement",
    question: `The temperature was 30°C at noon and dropped 8°C by evening. What was the evening temperature?`,
    options: [
      "18°C",
      "20°C",
      "22°C",
      "25°C",
    ],
    correctAnswer: 2,
    explanation: `30 - 8 = 22°C.`
  },
  {
    id: 26,
    type: "geometry",
    question: `How many sides does a hexagon have?`,
    options: [
      "5",
      "6",
      "7",
      "8",
    ],
    correctAnswer: 1,
    explanation: `A hexagon has 6 sides.`
  },
  {
    id: 27,
    type: "geometry",
    question: `What type of angle is exactly 90°?`,
    options: [
      "Acute",
      "Right",
      "Obtuse",
      "Reflex",
    ],
    correctAnswer: 1,
    explanation: `A right angle measures exactly 90°.`
  },
  {
    id: 28,
    type: "geometry",
    question: `What is the sum of the interior angles of a triangle?`,
    options: [
      "90°",
      "120°",
      "180°",
      "360°",
    ],
    correctAnswer: 2,
    explanation: `The interior angles of any triangle add up to 180°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `How many vertices does a cube have?`,
    options: [
      "6",
      "8",
      "10",
      "12",
    ],
    correctAnswer: 1,
    explanation: `A cube has 8 vertices.`
  },
  {
    id: 30,
    type: "geometry",
    question: `Which shape has exactly one pair of parallel sides?`,
    options: [
      "Square",
      "Rhombus",
      "Trapezoid",
      "Rectangle",
    ],
    correctAnswer: 2,
    explanation: `A trapezoid has exactly one pair of parallel sides.`
  },
  {
    id: 31,
    type: "geometry",
    question: `A line of symmetry divides a shape into:`,
    options: [
      "Two equal halves",
      "Three equal parts",
      "Four quarters",
      "Unequal sections",
    ],
    correctAnswer: 0,
    explanation: `A line of symmetry divides a shape into two equal mirror-image halves.`
  },
  {
    id: 32,
    type: "geometry",
    question: `What is the name of a triangle with all three sides equal?`,
    options: [
      "Scalene",
      "Isosceles",
      "Equilateral",
      "Right-angled",
    ],
    correctAnswer: 2,
    explanation: `An equilateral triangle has all three sides equal and all angles are 60°.`
  },
  {
    id: 33,
    type: "geometry",
    question: `Which transformation slides a shape without turning or flipping it?`,
    options: [
      "Rotation",
      "Reflection",
      "Translation",
      "Enlargement",
    ],
    correctAnswer: 2,
    explanation: `A translation slides a shape to a new position without changing its orientation.`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 6, 8, 10, 12.`,
    options: [
      "8",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 1,
    explanation: `Mean = (6 + 8 + 10 + 12) ÷ 4 = 36 ÷ 4 = 9.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 3, 7, 9, 11, 15?`,
    options: [
      "7",
      "9",
      "10",
      "11",
    ],
    correctAnswer: 1,
    explanation: `The middle value of 5 numbers in order is the 3rd value = 9.`
  },
  {
    id: 36,
    type: "statistics",
    question: `What is the mode of: 4, 7, 7, 9, 4, 7, 3?`,
    options: [
      "3",
      "4",
      "7",
      "9",
    ],
    correctAnswer: 2,
    explanation: `7 appears 3 times, which is the most frequent. Mode = 7.`
  },
  {
    id: 37,
    type: "statistics",
    question: `What is the range of: 15, 28, 6, 41, 20?`,
    options: [
      "25",
      "35",
      "41",
      "6",
    ],
    correctAnswer: 1,
    explanation: `Range = highest - lowest = 41 - 6 = 35.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A bar chart shows: Cricket = 20, Football = 35, Netball = 15, Volleyball = 10. How many students were surveyed?`,
    options: [
      "70",
      "75",
      "80",
      "85",
    ],
    correctAnswer: 2,
    explanation: `20 + 35 + 15 + 10 = 80 students.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A bag has 5 red and 5 blue counters. What is the probability of picking red?`,
    options: [
      "1/5",
      "1/4",
      "1/3",
      "1/2",
    ],
    correctAnswer: 3,
    explanation: `P(red) = 5/10 = 1/2.`
  },
  {
    id: 40,
    type: "statistics",
    question: `A pictograph shows each symbol = 4 students. If there are 6 symbols, how many students are represented?`,
    options: [
      "10",
      "18",
      "24",
      "28",
    ],
    correctAnswer: 2,
    explanation: `6 x 4 = 24 students.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy1MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy1Questions : g5MathEasy1Questions.slice(0, FREE_QUESTION_LIMIT)
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

 const handleSubmit = async () => {
  const now = new Date().toLocaleString()
  setCompletedAt(now)
  setTestCompleted(true)

  try {
    if (user?.id) {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        studentId: null,
        grade: "grade5",
        subject: "Mathematics",
        testName: "Easy 1",
        difficulty: "Easy",
        score: calculateScore(),
        totalQuestions: totalQuestions,
        percentage: getScorePercentage(),
        completedAt: now,
      })
    }
  } catch (err) {
    console.error("Error saving result:", err)
  }
}

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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 1</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 1</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 1 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 1</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
