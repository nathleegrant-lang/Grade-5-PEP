"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { saveStudentTestResult } from "@/lib/student-test-results"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "number" | "measurement" | "geometry" | "statistics"
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5MathEasy2Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 6,412 + 1,938?`,
    options: [
      "8,250",
      "8,350",
      "8,340",
      "8,450",
    ],
    correctAnswer: 1,
    explanation: `6,412 + 1,938 = 8,350. Check: 8,350 - 1,938 = 6,412.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 5,000 - 1,876?`,
    options: [
      "3,024",
      "3,124",
      "3,134",
      "3,224",
    ],
    correctAnswer: 1,
    explanation: `5,000 - 1,876 = 3,124. Check: 3,124 + 1,876 = 5,000.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 48 x 7?`,
    options: [
      "326",
      "336",
      "336",
      "346",
    ],
    correctAnswer: 1,
    explanation: `48 x 7: (40 x 7) + (8 x 7) = 280 + 56 = 336.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 756 ÷ 9?`,
    options: [
      "74",
      "82",
      "84",
      "88",
    ],
    correctAnswer: 2,
    explanation: `756 ÷ 9 = 84. Check: 84 x 9 = 756.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 3/8 of 40?`,
    options: [
      "10",
      "12",
      "14",
      "15",
    ],
    correctAnswer: 3,
    explanation: `3/8 x 40 = (3 x 40) ÷ 8 = 120 ÷ 8 = 15.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 2/5 + 1/5?`,
    options: [
      "3/10",
      "3/5",
      "4/10",
      "1/5",
    ],
    correctAnswer: 1,
    explanation: `Same denominator: 2/5 + 1/5 = 3/5.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 10% of 350?`,
    options: [
      "30",
      "35",
      "40",
      "45",
    ],
    correctAnswer: 1,
    explanation: `10% of 350 = 350 ÷ 10 = 35.`
  },
  {
    id: 8,
    type: "number",
    question: `Write 3/4 as a decimal.`,
    options: [
      "0.25",
      "0.34",
      "0.75",
      "7.4",
    ],
    correctAnswer: 2,
    explanation: `3 ÷ 4 = 0.75. Or: 3/4 = 75/100 = 0.75.`
  },
  {
    id: 9,
    type: "number",
    question: `What is the value of the digit 5 in 285,603?`,
    options: [
      "5",
      "500",
      "5,000",
      "50,000",
    ],
    correctAnswer: 2,
    explanation: `In 285,603 the 5 is in the thousands place. Its value is 5,000.`
  },
  {
    id: 10,
    type: "number",
    question: `What is the HCF of 24 and 36?`,
    options: [
      "4",
      "6",
      "8",
      "12",
    ],
    correctAnswer: 3,
    explanation: `Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. HCF = 12.`
  },
  {
    id: 11,
    type: "number",
    question: `A jar has 120 sweets. 1/3 are red. How many red sweets are there?`,
    options: [
      "30",
      "36",
      "40",
      "50",
    ],
    correctAnswer: 2,
    explanation: `1/3 of 120 = 120 ÷ 3 = 40.`
  },
  {
    id: 12,
    type: "number",
    question: `What is the LCM of 5 and 8?`,
    options: [
      "20",
      "30",
      "40",
      "80",
    ],
    correctAnswer: 2,
    explanation: `Multiples of 5: 5,10,15,20,25,30,35,40. Multiples of 8: 8,16,24,32,40. LCM = 40.`
  },
  {
    id: 13,
    type: "number",
    question: `Which of these is NOT a prime number?`,
    options: [
      "13",
      "17",
      "21",
      "23",
    ],
    correctAnswer: 2,
    explanation: `21 = 3 x 7, so it has factors other than 1 and itself. 21 is not prime.`
  },
  {
    id: 14,
    type: "number",
    question: `A pattern: 100, 91, 82, 73, ___. What is the next term?`,
    options: [
      "60",
      "62",
      "63",
      "64",
    ],
    correctAnswer: 3,
    explanation: `The pattern decreases by 9 each time. 73 - 9 = 64.`
  },
  {
    id: 15,
    type: "number",
    question: `5 books cost $85. What is the cost of 1 book?`,
    options: [
      "$15",
      "$17",
      "$19",
      "$21",
    ],
    correctAnswer: 1,
    explanation: `$85 ÷ 5 = $17 per book.`
  },
  {
    id: 16,
    type: "measurement",
    question: `How many metres are in 4.2 km?`,
    options: [
      "42 m",
      "420 m",
      "4,200 m",
      "42,000 m",
    ],
    correctAnswer: 2,
    explanation: `1 km = 1,000 m. 4.2 x 1,000 = 4,200 m.`
  },
  {
    id: 17,
    type: "measurement",
    question: `What is the area of a triangle with base 10 cm and height 6 cm?`,
    options: [
      "30 cm²",
      "60 cm²",
      "16 cm²",
      "32 cm²",
    ],
    correctAnswer: 0,
    explanation: `Area of triangle = ½ x base x height = ½ x 10 x 6 = 30 cm².`
  },
  {
    id: 18,
    type: "measurement",
    question: `What is the perimeter of a rectangle 14 cm long and 7 cm wide?`,
    options: [
      "21 cm",
      "42 cm",
      "49 cm",
      "98 cm",
    ],
    correctAnswer: 1,
    explanation: `Perimeter = 2 x (14 + 7) = 2 x 21 = 42 cm.`
  },
  {
    id: 19,
    type: "measurement",
    question: `Convert 250 minutes to hours and minutes.`,
    options: [
      "3 h 10 min",
      "4 h 10 min",
      "4 h 25 min",
      "5 h 10 min",
    ],
    correctAnswer: 1,
    explanation: `250 ÷ 60 = 4 remainder 10. So 4 hours 10 minutes.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A box has a mass of 3 kg 750 g. What is its mass in grams?`,
    options: [
      "3,075 g",
      "3,750 g",
      "37,500 g",
      "375 g",
    ],
    correctAnswer: 1,
    explanation: `3 kg = 3,000 g. 3,000 + 750 = 3,750 g.`
  },
  {
    id: 21,
    type: "measurement",
    question: `How many 250 mL cups can be filled from a 2-litre bottle?`,
    options: [
      "4",
      "6",
      "8",
      "10",
    ],
    correctAnswer: 2,
    explanation: `2 L = 2,000 mL. 2,000 ÷ 250 = 8 cups.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A trip started at 9:15 AM and ended at 12:45 PM. How long was the trip?`,
    options: [
      "2 h 30 min",
      "3 h",
      "3 h 15 min",
      "3 h 30 min",
    ],
    correctAnswer: 3,
    explanation: `9:15 to 12:15 = 3 h. 12:15 to 12:45 = 30 min. Total = 3 h 30 min.`
  },
  {
    id: 23,
    type: "measurement",
    question: `A square has a perimeter of 40 cm. What is its area?`,
    options: [
      "100 cm²",
      "80 cm²",
      "40 cm²",
      "160 cm²",
    ],
    correctAnswer: 0,
    explanation: `Side = 40 ÷ 4 = 10 cm. Area = 10 x 10 = 100 cm².`
  },
  {
    id: 24,
    type: "measurement",
    question: `Which is the best unit for measuring the capacity of a bathtub?`,
    options: [
      "mL",
      "L",
      "g",
      "km",
    ],
    correctAnswer: 1,
    explanation: `A bathtub holds hundreds of litres. Litres (L) is the best unit.`
  },
  {
    id: 25,
    type: "measurement",
    question: `What time is 4 hours 30 minutes after 7:00 AM?`,
    options: [
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
    ],
    correctAnswer: 2,
    explanation: `7:00 + 4 h = 11:00. 11:00 + 30 min = 11:30 AM.`
  },
  {
    id: 26,
    type: "geometry",
    question: `An angle greater than 180° but less than 360° is called:`,
    options: [
      "Acute",
      "Obtuse",
      "Straight",
      "Reflex",
    ],
    correctAnswer: 3,
    explanation: `A reflex angle is between 180° and 360°.`
  },
  {
    id: 27,
    type: "geometry",
    question: `How many faces does a rectangular prism have?`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 2,
    explanation: `A rectangular prism has 6 faces.`
  },
  {
    id: 28,
    type: "geometry",
    question: `What type of triangle has all three angles less than 90°?`,
    options: [
      "Obtuse",
      "Right",
      "Acute",
      "Equilateral",
    ],
    correctAnswer: 2,
    explanation: `An acute triangle has all three angles less than 90°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `What is the size of each interior angle of a regular hexagon?`,
    options: [
      "90°",
      "100°",
      "108°",
      "120°",
    ],
    correctAnswer: 3,
    explanation: `Sum of interior angles of hexagon = (6-2) x 180 = 720°. Each = 720 ÷ 6 = 120°.`
  },
  {
    id: 30,
    type: "geometry",
    question: `How many lines of symmetry does a regular pentagon have?`,
    options: [
      "3",
      "4",
      "5",
      "6",
    ],
    correctAnswer: 2,
    explanation: `A regular pentagon has 5 lines of symmetry.`
  },
  {
    id: 31,
    type: "geometry",
    question: `On a coordinate grid, the point (3, 5) is located:`,
    options: [
      "3 right, 5 up",
      "5 right, 3 up",
      "3 up, 5 right",
      "5 up, 3 right",
    ],
    correctAnswer: 0,
    explanation: `Coordinates are written as (x, y). (3, 5) means 3 right and 5 up.`
  },
  {
    id: 32,
    type: "geometry",
    question: `A shape is flipped over a mirror line. This is called a:`,
    options: [
      "Translation",
      "Rotation",
      "Reflection",
      "Enlargement",
    ],
    correctAnswer: 2,
    explanation: `Flipping a shape over a line is a reflection.`
  },
  {
    id: 33,
    type: "geometry",
    question: `Which 3D shape has a circular base and comes to a point?`,
    options: [
      "Cylinder",
      "Sphere",
      "Cone",
      "Pyramid",
    ],
    correctAnswer: 2,
    explanation: `A cone has a circular base and one curved surface that meets at a point (apex).`
  },
  {
    id: 34,
    type: "statistics",
    question: `Find the mean of: 8, 12, 16, 20, 4.`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 1,
    explanation: `Mean = (8+12+16+20+4) ÷ 5 = 60 ÷ 5 = 12.`
  },
  {
    id: 35,
    type: "statistics",
    question: `What is the median of: 11, 3, 7, 15, 9?`,
    options: [
      "7",
      "9",
      "11",
      "3",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 3, 7, 9, 11, 15. Middle value = 9.`
  },
  {
    id: 36,
    type: "statistics",
    question: `Data: 5, 8, 3, 8, 2, 6, 8, 1. What is the mode?`,
    options: [
      "2",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 3,
    explanation: `8 appears 3 times, more than any other value. Mode = 8.`
  },
  {
    id: 37,
    type: "statistics",
    question: `The range of: 24, 8, 36, 12, 45 is:`,
    options: [
      "28",
      "37",
      "45",
      "8",
    ],
    correctAnswer: 1,
    explanation: `Range = 45 - 8 = 37.`
  },
  {
    id: 38,
    type: "statistics",
    question: `A pie chart has 4 equal sections. What angle does each section make?`,
    options: [
      "45°",
      "60°",
      "90°",
      "120°",
    ],
    correctAnswer: 2,
    explanation: `360° ÷ 4 = 90° each.`
  },
  {
    id: 39,
    type: "statistics",
    question: `A fair coin is flipped. What is the probability of getting heads?`,
    options: [
      "1/4",
      "1/3",
      "1/2",
      "2/3",
    ],
    correctAnswer: 2,
    explanation: `A coin has 2 equally likely outcomes. P(heads) = 1/2.`
  },
  {
    id: 40,
    type: "statistics",
    question: `A frequency table shows: Red=12, Blue=8, Green=5, Yellow=5. What fraction preferred red?`,
    options: [
      "1/3",
      "4/10",
      "2/5",
      "12/30",
    ],
    correctAnswer: 2,
    explanation: `Total = 30. Red = 12. Fraction = 12/30 = 2/5.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy2MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")
  const hasSavedResult = useRef(false)

  const availableQuestions = isPremium ? g5MathEasy2Questions : g5MathEasy2Questions.slice(0, FREE_QUESTION_LIMIT)
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

  useEffect(() => {
    if (!testCompleted || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    const completedAtIso = new Date().toISOString()
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Mathematics",
      testName: "Easy 2",
      difficulty: "Easy",
      score: calculateScore(),
      totalQuestions,
      percentage: getScorePercentage(),
      completedAt: completedAtIso,
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [testCompleted, user?.id, user?.childName, totalQuestions, answers])


  const restartTest = () => { setTestStarted(false); setTestCompleted(false); setCurrentQuestion(0); setAnswers(new Array(totalQuestions).fill(null)); setTimeRemaining(isPremium ? 60 * 60 : 10 * 60); setShowReview(false); setCompletedAt(""); hasSavedResult.current = false }

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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 2</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 2</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 2 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 2</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
