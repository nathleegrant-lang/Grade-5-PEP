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

const g5MathEasy9Questions: Question[] = [
  {
    id: 1,
    type: "number",
    question: `What is 234,567 + 78,943?`,
    options: [
      "313,310",
      "313,410",
      "313,510",
      "314,410",
    ],
    correctAnswer: 2,
    explanation: `234,567 + 78,943 = 313,510.`
  },
  {
    id: 2,
    type: "number",
    question: `What is 500,000 - 187,432?`,
    options: [
      "312,468",
      "312,568",
      "312,668",
      "313,568",
    ],
    correctAnswer: 1,
    explanation: `500,000 - 187,432 = 312,568.`
  },
  {
    id: 3,
    type: "number",
    question: `What is 246 x 5?`,
    options: [
      "1,200",
      "1,230",
      "1,280",
      "1,300",
    ],
    correctAnswer: 1,
    explanation: `246 x 5: 200x5=1,000, 46x5=230. 1,000+230=1,230.`
  },
  {
    id: 4,
    type: "number",
    question: `What is 4,536 ÷ 14?`,
    options: [
      "314",
      "322",
      "324",
      "334",
    ],
    correctAnswer: 2,
    explanation: `4,536 ÷ 14 = 324. Check: 324 x 14=4,536.`
  },
  {
    id: 5,
    type: "number",
    question: `What is 3/5 + 7/10?`,
    options: [
      "10/15",
      "11/10",
      "13/10",
      "12/10",
    ],
    correctAnswer: 1,
    explanation: `LCD=10: 3/5=6/10. 6/10+7/10=13/10.`
  },
  {
    id: 6,
    type: "number",
    question: `What is 2½ + 1¾?`,
    options: [
      "3¼",
      "4¼",
      "4½",
      "3¾",
    ],
    correctAnswer: 1,
    explanation: `2½=10/4, 1¾=7/4. Sum=17/4=4¼.`
  },
  {
    id: 7,
    type: "number",
    question: `What is 35% of 80?`,
    options: [
      "22",
      "24",
      "26",
      "28",
    ],
    correctAnswer: 3,
    explanation: `35% of 80=0.35x80=28.`
  },
  {
    id: 8,
    type: "number",
    question: `What is the ratio 15:45 in simplest form?`,
    options: [
      "1:3",
      "2:5",
      "3:9",
      "5:15",
    ],
    correctAnswer: 0,
    explanation: `GCF=15. 15÷15:45÷15=1:3.`
  },
  {
    id: 9,
    type: "number",
    question: `Order from greatest to least: 0.6, 3/5, 0.65, 62%.`,
    options: [
      "0.65, 62%, 0.6, 3/5",
      "62%, 0.65, 3/5, 0.6",
      "0.65, 62%, 3/5, 0.6",
      "3/5, 0.65, 0.6, 62%",
    ],
    correctAnswer: 0,
    explanation: `As decimals: 0.65, 0.62, 0.60, 0.60. Greatest to least: 0.65, 0.62, 0.60, 0.60.`
  },
  {
    id: 10,
    type: "number",
    question: `A discount of 25% is given on $160. What is the sale price?`,
    options: [
      "$110",
      "$115",
      "$120",
      "$125",
    ],
    correctAnswer: 2,
    explanation: `Discount=25%x160=$40. Sale=$160-$40=$120.`
  },
  {
    id: 11,
    type: "number",
    question: `If 3:x = 12:20, find x.`,
    options: [
      "4",
      "5",
      "6",
      "8",
    ],
    correctAnswer: 1,
    explanation: `3/x=12/20=3/5. x=5.`
  },
  {
    id: 12,
    type: "number",
    question: `What is 4³?`,
    options: [
      "12",
      "48",
      "64",
      "96",
    ],
    correctAnswer: 2,
    explanation: `4³=4x4x4=64.`
  },
  {
    id: 13,
    type: "number",
    question: `What is the LCM of 12, 15, 20?`,
    options: [
      "30",
      "60",
      "90",
      "120",
    ],
    correctAnswer: 1,
    explanation: `LCM(12,15)=60. LCM(60,20)=60.`
  },
  {
    id: 14,
    type: "number",
    question: `A sequence: 1, 1, 2, 3, 5, 8, ___.`,
    options: [
      "11",
      "13",
      "14",
      "15",
    ],
    correctAnswer: 1,
    explanation: `Each term is the sum of the previous two. 5+8=13.`
  },
  {
    id: 15,
    type: "number",
    question: `A trader buys at $80 and sells at $100. What is the profit percentage?`,
    options: [
      "20%",
      "25%",
      "30%",
      "35%",
    ],
    correctAnswer: 1,
    explanation: `Profit=$20. %=(20/80)x100=25%.`
  },
  {
    id: 16,
    type: "measurement",
    question: `A circle has circumference 44 cm. What is its diameter? (π=22/7)`,
    options: [
      "7 cm",
      "14 cm",
      "22 cm",
      "28 cm",
    ],
    correctAnswer: 1,
    explanation: `C=πd. d=44÷(22/7)=44x7/22=14 cm.`
  },
  {
    id: 17,
    type: "measurement",
    question: `A swimming pool is 50m x 25m x 2m. What is its volume?`,
    options: [
      "2,500 m³",
      "5,000 m³",
      "7,500 m³",
      "2,000 m³",
    ],
    correctAnswer: 0,
    explanation: `V=50x25x2=2,500 m³.`
  },
  {
    id: 18,
    type: "measurement",
    question: `A rectangle has area 60 cm² and perimeter 32 cm. What are its dimensions?`,
    options: [
      "6x10",
      "8x8",
      "5x12",
      "4x15",
    ],
    correctAnswer: 0,
    explanation: `Area=60, Perimeter=32→2(l+w)=32→l+w=16. l+w=16, lxw=60. l=6,w=10.`
  },
  {
    id: 19,
    type: "measurement",
    question: `How many 330 mL cans fill a 9.9 L cooler?`,
    options: [
      "20",
      "25",
      "30",
      "35",
    ],
    correctAnswer: 2,
    explanation: `9.9 L=9,900 mL. 9,900÷330=30.`
  },
  {
    id: 20,
    type: "measurement",
    question: `A car averages 80 km/h. How far does it travel in 2h 30min?`,
    options: [
      "150 km",
      "160 km",
      "180 km",
      "200 km",
    ],
    correctAnswer: 3,
    explanation: `2.5 h x 80=200 km.`
  },
  {
    id: 21,
    type: "measurement",
    question: `A cuboid is 15 cm x 10 cm x 8 cm. What is its surface area?`,
    options: [
      "620 cm²",
      "700 cm²",
      "740 cm²",
      "760 cm²",
    ],
    correctAnswer: 2,
    explanation: `SA=2(15x10+10x8+8x15)=2(150+80+120)=2x350=700. Wait: 2(150+80+120)=2x350=700. Recalculate: 150+80+120=350. 350x2=700.`
  },
  {
    id: 22,
    type: "measurement",
    question: `A map scale is 1:50,000. A distance of 4 cm on the map represents:`,
    options: [
      "2 km",
      "2.5 km",
      "20 km",
      "25 km",
    ],
    correctAnswer: 0,
    explanation: `4 x 50,000=200,000 cm=2 km.`
  },
  {
    id: 23,
    type: "measurement",
    question: `Fencing costs $12 per metre. A rectangular field is 18 m x 14 m. Total fencing cost:`,
    options: [
      "$768",
      "$780",
      "$756",
      "$840",
    ],
    correctAnswer: 0,
    explanation: `Perimeter=2(18+14)=64 m. Cost=64x$12=$768.`
  },
  {
    id: 24,
    type: "measurement",
    question: `A tank is 3/4 full and contains 270 L. What is the full capacity?`,
    options: [
      "340 L",
      "350 L",
      "360 L",
      "370 L",
    ],
    correctAnswer: 2,
    explanation: `3/4=270L. Full=270÷(3/4)=270x4/3=360 L.`
  },
  {
    id: 25,
    type: "measurement",
    question: `Convert 2.8 hours to minutes.`,
    options: [
      "148 min",
      "162 min",
      "168 min",
      "172 min",
    ],
    correctAnswer: 2,
    explanation: `2.8 x 60=168 minutes.`
  },
  {
    id: 26,
    type: "geometry",
    question: `Find the area of a circle with diameter 14 cm. (π=22/7)`,
    options: [
      "44 cm²",
      "88 cm²",
      "154 cm²",
      "308 cm²",
    ],
    correctAnswer: 2,
    explanation: `r=7. Area=22/7 x 49=154 cm².`
  },
  {
    id: 27,
    type: "geometry",
    question: `A prism has a triangular cross-section with base 6 cm and height 4 cm. The prism is 10 cm long. Volume:`,
    options: [
      "60 cm³",
      "100 cm³",
      "120 cm³",
      "240 cm³",
    ],
    correctAnswer: 2,
    explanation: `V=(½x6x4)x10=12x10=120 cm³.`
  },
  {
    id: 28,
    type: "geometry",
    question: `The angles of a quadrilateral are in ratio 1:2:3:4. Largest angle:`,
    options: [
      "80°",
      "100°",
      "120°",
      "144°",
    ],
    correctAnswer: 3,
    explanation: `Sum=360°. Parts=10. Each=36°. Largest=4x36=144°.`
  },
  {
    id: 29,
    type: "geometry",
    question: `Find the hypotenuse of a right triangle with legs 9 cm and 12 cm.`,
    options: [
      "13 cm",
      "15 cm",
      "17 cm",
      "18 cm",
    ],
    correctAnswer: 1,
    explanation: `√(9²+12²)=√(81+144)=√225=15 cm.`
  },
  {
    id: 30,
    type: "geometry",
    question: `What is the interior angle of a regular decagon (10 sides)?`,
    options: [
      "144°",
      "150°",
      "156°",
      "162°",
    ],
    correctAnswer: 0,
    explanation: `Sum=(10-2)x180=1440°. Each=1440÷10=144°.`
  },
  {
    id: 31,
    type: "geometry",
    question: `Enlargement scale factor 3. Original area 12 cm². New area:`,
    options: [
      "36 cm²",
      "72 cm²",
      "108 cm²",
      "144 cm²",
    ],
    correctAnswer: 2,
    explanation: `Area scale factor = 3²=9. New area=9x12=108 cm².`
  },
  {
    id: 32,
    type: "geometry",
    question: `In which quadrant is the point (-4, 3)?`,
    options: [
      "I",
      "II",
      "III",
      "IV",
    ],
    correctAnswer: 1,
    explanation: `(-,+) is Quadrant II.`
  },
  {
    id: 33,
    type: "geometry",
    question: `Two angles are vertically opposite. One is 72°. The other is:`,
    options: [
      "18°",
      "72°",
      "108°",
      "118°",
    ],
    correctAnswer: 1,
    explanation: `Vertically opposite angles are equal. Both are 72°.`
  },
  {
    id: 34,
    type: "statistics",
    question: `The mean of 8 numbers is 15. A 9th number of 30 is added. New mean:`,
    options: [
      "16",
      "17",
      "18",
      "19",
    ],
    correctAnswer: 1,
    explanation: `Old sum=120. New sum=150. New mean=150÷9≈16.67≈17.`
  },
  {
    id: 35,
    type: "statistics",
    question: `Median of: 4.2, 1.8, 6.5, 3.1, 7.4, 2.9, 5.6, 4.8.`,
    options: [
      "4.2",
      "4.5",
      "4.8",
      "5.0",
    ],
    correctAnswer: 1,
    explanation: `Arranged: 1.8,2.9,3.1,4.2,4.8,5.6,6.5,7.4. Median=(4.2+4.8)/2=4.5.`
  },
  {
    id: 36,
    type: "statistics",
    question: `A frequency distribution: 2(f=3), 4(f=5), 6(f=4), 8(f=3). What is the mode?`,
    options: [
      "2",
      "4",
      "6",
      "8",
    ],
    correctAnswer: 1,
    explanation: `Mode is the value with highest frequency. f=5 for value 4. Mode=4.`
  },
  {
    id: 37,
    type: "statistics",
    question: `Interquartile range (IQR) of: 3,5,7,9,11,13,15.`,
    options: [
      "4",
      "6",
      "8",
      "10",
    ],
    correctAnswer: 2,
    explanation: `Q1=5, Q3=13. IQR=13-5=8.`
  },
  {
    id: 38,
    type: "statistics",
    question: `In a class of 30: 40% play sports, of these 50% play football. How many play football?`,
    options: [
      "4",
      "5",
      "6",
      "7",
    ],
    correctAnswer: 2,
    explanation: `Sports=40%x30=12. Football=50%x12=6.`
  },
  {
    id: 39,
    type: "statistics",
    question: `P(at least one head) when 2 coins are tossed:`,
    options: [
      "1/4",
      "1/2",
      "3/4",
      "1",
    ],
    correctAnswer: 2,
    explanation: `P(no heads)=1/4. P(at least one head)=1-1/4=3/4.`
  },
  {
    id: 40,
    type: "statistics",
    question: `The mean weight of 5 boys is 48 kg. When a 6th boy joins, the mean rises to 50 kg. The 6th boy's weight:`,
    options: [
      "58 kg",
      "60 kg",
      "62 kg",
      "64 kg",
    ],
    correctAnswer: 1,
    explanation: `Old sum=240. New sum=300. 6th=300-240=60 kg.`
  }
]

const SECTION_CONFIG = [
  { type: "number" as const,      label: "Number Operations",      note: "whole numbers, fractions, decimals, percentages, ratio, and integers" },
  { type: "measurement" as const, label: "Measurement",             note: "length, mass, capacity, area, perimeter, volume, time, and money" },
  { type: "geometry" as const,    label: "Geometry & Spatial Sense",note: "shapes, angles, 3D solids, transformations, and coordinates" },
  { type: "statistics" as const,  label: "Data & Probability",      note: "mean, median, mode, range, graphs, and probability" },
]

export default function G5MathEasy9MockTest() {
  const { isPremium, user } = useAuth()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [showReview, setShowReview] = useState(false)
  const [completedAt, setCompletedAt] = useState("")

  const availableQuestions = isPremium ? g5MathEasy9Questions : g5MathEasy9Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <CardTitle className="text-2xl text-blue-800">Mathematics Easy 9</CardTitle>
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
              <p className="text-gray-600 mt-2">Grade 5 PEP Mathematics Easy 9</p>
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
                    <CardTitle className="text-2xl text-blue-800 mt-1">Grade 5 PEP Mathematics Easy 9 Report</CardTitle>
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
              <div><h1 className="text-lg font-bold">Mathematics Easy 9</h1><p className="text-sky-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
