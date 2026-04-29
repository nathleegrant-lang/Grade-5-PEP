"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
  Lock,
  Crown,
} from "lucide-react"

const FREE_QUESTIONS_LIMIT = 5

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
  skill: string
}

const questions: Question[] = [
  {
    question: "4,236 + 1,452 = ?",
    options: ["5,588", "5,688", "5,788", "6,688"],
    answer: 1,
    explanation: "4,236 + 1,452 = 5,688.",
    skill: "Addition",
  },
  {
    question: "180 ÷ 6 = ?",
    options: ["20", "25", "30", "36"],
    answer: 2,
    explanation: "180 ÷ 6 = 30.",
    skill: "Division",
  },
  {
    question: "Which fraction is equivalent to 1/2?",
    options: ["2/3", "2/4", "3/5", "4/6"],
    answer: 1,
    explanation: "2/4 simplifies to 1/2.",
    skill: "Fractions",
  },
  {
    question: "25% of 80 = ?",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "25% means one quarter. One quarter of 80 is 20.",
    skill: "Percentages",
  },
  {
    question: "A rectangle is 8 cm long and 5 cm wide. What is its perimeter?",
    options: ["13 cm", "26 cm", "40 cm", "80 cm"],
    answer: 1,
    explanation: "Perimeter = 8 + 5 + 8 + 5 = 26 cm.",
    skill: "Perimeter",
  },
  {
    question:
      "A school bought 48 packs of pencils. Each pack has 12 pencils. How many pencils were bought?",
    options: ["480", "516", "576", "608"],
    answer: 2,
    explanation: "48 × 12 = 576 pencils.",
    skill: "Multiplication",
  },
  {
    question: "Which angle is greater than 90° but less than 180°?",
    options: ["Acute", "Right", "Obtuse", "Straight"],
    answer: 2,
    explanation: "An obtuse angle is greater than 90° and less than 180°.",
    skill: "Geometry",
  },
  {
    question: "The mean of 6, 8, 10, and 12 is:",
    options: ["8", "9", "10", "11"],
    answer: 1,
    explanation: "6 + 8 + 10 + 12 = 36. 36 ÷ 4 = 9.",
    skill: "Mean",
  },
  {
    question: "The pattern is 4, 9, 14, 19, ___. What comes next?",
    options: ["22", "23", "24", "25"],
    answer: 2,
    explanation: "The pattern increases by 5. 19 + 5 = 24.",
    skill: "Patterns",
  },
  {
    question:
      "A class collected 24 bottles on Monday, 36 on Tuesday, and 40 on Wednesday. How many altogether?",
    options: ["90", "96", "100", "106"],
    answer: 2,
    explanation: "24 + 36 + 40 = 100.",
    skill: "Data Handling",
  },
  {
    question: "A student scored 36 out of 40. What percentage is this?",
    options: ["80%", "85%", "90%", "95%"],
    answer: 2,
    explanation: "36 ÷ 40 = 0.9 = 90%.",
    skill: "Percentages",
  },
  {
    question: "A rectangular garden is 15 m long and 8 m wide. What is its area?",
    options: ["23 m²", "46 m²", "120 m²", "150 m²"],
    answer: 2,
    explanation: "Area = length × width = 15 × 8 = 120 m².",
    skill: "Area",
  },
  {
    question: "3/4 is greater than which fraction?",
    options: ["7/8", "5/8", "9/10", "4/4"],
    answer: 1,
    explanation: "3/4 = 6/8, which is greater than 5/8.",
    skill: "Comparing Fractions",
  },
  {
    question:
      "A movie started at 3:45 p.m. and ended at 5:20 p.m. How long did it last?",
    options: ["1h 25m", "1h 35m", "1h 45m", "2h 25m"],
    answer: 1,
    explanation: "3:45 to 4:45 is 1 hour, then 35 minutes to 5:20.",
    skill: "Time",
  },
  {
    question:
      "A shopkeeper had $5,000. She spent $1,275 and $850. How much was left?",
    options: ["$2,875", "$3,125", "$3,275", "$3,725"],
    answer: 0,
    explanation: "$1,275 + $850 = $2,125. $5,000 - $2,125 = $2,875.",
    skill: "Money",
  },
  {
    question: "A triangle has angles 45° and 65°. What is the third angle?",
    options: ["60°", "70°", "80°", "90°"],
    answer: 1,
    explanation: "45 + 65 = 110. 180 - 110 = 70°.",
    skill: "Angles",
  },
  {
    question: "10% discount on $2,500 gives what sale price?",
    options: ["$2,000", "$2,250", "$2,400", "$2,490"],
    answer: 1,
    explanation: "10% of $2,500 is $250. $2,500 - $250 = $2,250.",
    skill: "Percentages / Money",
  },
  {
    question: "3/4 + 2/3 = ?",
    options: ["1 1/12", "1 5/12", "1 7/12", "2"],
    answer: 1,
    explanation: "3/4 = 9/12 and 2/3 = 8/12. Total = 17/12 = 1 5/12.",
    skill: "Fractions",
  },
  {
    question:
      "The mean of five numbers is 18. Four numbers are 12, 16, 20, and 22. What is the fifth?",
    options: ["18", "20", "22", "24"],
    answer: 1,
    explanation: "18 × 5 = 90. Known total = 70. Fifth number = 20.",
    skill: "Mean",
  },
  {
    question:
      "A bus left at 7:35 a.m. and arrived at 10:10 a.m. How long was the trip?",
    options: ["2h 25m", "2h 35m", "2h 45m", "3h 35m"],
    answer: 1,
    explanation: "7:35 to 9:35 is 2 hours, then 35 minutes to 10:10.",
    skill: "Time",
  },
  {
    question: "The pattern is 3, 6, 12, 24, ___.",
    options: ["30", "36", "42", "48"],
    answer: 3,
    explanation: "Each term is multiplied by 2. 24 × 2 = 48.",
    skill: "Patterns",
  },
  {
    question:
      "2.5 litres of juice serves 10 students. How many litres are needed for 30 students?",
    options: ["5 L", "6.5 L", "7.5 L", "10 L"],
    answer: 2,
    explanation: "30 is 3 times 10, so 2.5 × 3 = 7.5 L.",
    skill: "Ratio / Proportion",
  },
  {
    question: "0.75 is equal to which fraction?",
    options: ["1/2", "2/3", "3/4", "4/5"],
    answer: 2,
    explanation: "0.75 = 75/100 = 3/4.",
    skill: "Decimals / Fractions",
  },
  {
    question: "The range of 5, 10, 15, and 25 is:",
    options: ["10", "15", "20", "25"],
    answer: 2,
    explanation: "Range = highest - lowest = 25 - 5 = 20.",
    skill: "Data",
  },
  {
    question: "20% of 150 = ?",
    options: ["20", "25", "30", "35"],
    answer: 2,
    explanation: "10% of 150 is 15, so 20% is 30.",
    skill: "Percentages",
  },
  {
    question: "LCM of 3 and 4 is:",
    options: ["6", "9", "12", "15"],
    answer: 2,
    explanation: "The smallest number both 3 and 4 divide into is 12.",
    skill: "Factors / Multiples",
  },
  {
    question: "A field is 36 m long and 24 m wide. How much fencing is needed around it?",
    options: ["60 m", "120 m", "864 m", "1,728 m"],
    answer: 1,
    explanation: "Perimeter = 36 + 24 + 36 + 24 = 120 m.",
    skill: "Perimeter",
  },
  {
    question: "42 out of 50 as a percentage is:",
    options: ["80%", "82%", "84%", "86%"],
    answer: 2,
    explanation: "42 ÷ 50 = 0.84 = 84%.",
    skill: "Percentages",
  },
  {
    question: "4/5 of 200 = ?",
    options: ["120", "140", "160", "180"],
    answer: 2,
    explanation: "200 × 4/5 = 160.",
    skill: "Fractions",
  },
  {
    question: "12 ÷ 0.5 = ?",
    options: ["6", "12", "24", "36"],
    answer: 2,
    explanation: "Dividing by 0.5 is the same as doubling. 12 × 2 = 24.",
    skill: "Decimals",
  },
  {
    question: "100 - (25 × 2) = ?",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "25 × 2 = 50. 100 - 50 = 50.",
    skill: "Order of Operations",
  },
  {
    question:
      "A recipe uses 4 cups of flour for 8 cakes. How many cups are needed for 24 cakes?",
    options: ["8", "10", "12", "16"],
    answer: 2,
    explanation: "24 is 3 times 8, so 4 × 3 = 12 cups.",
    skill: "Ratio / Proportion",
  },
  {
    question: "A cube has side length 3 cm. What is its volume?",
    options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"],
    answer: 2,
    explanation: "Volume = 3 × 3 × 3 = 27 cm³.",
    skill: "Volume",
  },
  {
    question: "Which number is a square number?",
    options: ["18", "24", "36", "50"],
    answer: 2,
    explanation: "36 is 6 × 6.",
    skill: "Square Numbers",
  },
  {
    question: "15% of 400 = ?",
    options: ["40", "50", "60", "80"],
    answer: 2,
    explanation: "10% is 40 and 5% is 20. Total = 60.",
    skill: "Percentages",
  },
  {
    question: "A student read 18 pages each day for 7 days. How many pages did the student read?",
    options: ["116", "124", "126", "136"],
    answer: 2,
    explanation: "18 × 7 = 126.",
    skill: "Multiplication",
  },
  {
    question: "3² + 4² = ?",
    options: ["12", "20", "25", "30"],
    answer: 2,
    explanation: "3² = 9 and 4² = 16. 9 + 16 = 25.",
    skill: "Squares",
  },
  {
    question:
      "A bag costs $3,600 after a 10% discount. What was the discount amount if the original price was $4,000?",
    options: ["$200", "$300", "$400", "$600"],
    answer: 2,
    explanation: "$4,000 - $3,600 = $400.",
    skill: "Money / Discount",
  },
  {
    question: "Mean of 10, 20, 30, and 40 is:",
    options: ["20", "25", "30", "35"],
    answer: 1,
    explanation: "10 + 20 + 30 + 40 = 100. 100 ÷ 4 = 25.",
    skill: "Mean",
  },
  {
    question: "A class has 32 students. 3/8 are boys. How many boys are in the class?",
    options: ["8", "10", "12", "16"],
    answer: 2,
    explanation: "32 ÷ 8 = 4, then 4 × 3 = 12.",
    skill: "Fractions",
  },
]

export default function NumeracyMixed1Page() {
  const { isPremium } = useAuth()
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const availableQuestions = isPremium
    ? questions
    : questions.slice(0, FREE_QUESTIONS_LIMIT)

  useEffect(() => {
    if (!started || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowResults(true)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[questionIndex] = optionIndex
    setAnswers(updated)
  }

  const calculateScore = () => {
    let total = 0

    availableQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        total++
      }
    })

    setScore(total)
  }

  const handleSubmit = () => {
    calculateScore()
    setShowResults(true)
  }

  const resetTest = () => {
    setStarted(false)
    setTimeLeft(60 * 60)
    setAnswers([])
    setShowResults(false)
    setScore(0)
  }

  const answeredCount = answers.filter((answer) => answer !== undefined).length

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/mathematics">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mathematics Mock Tests
            </Button>
          </Link>

          <Card className="mx-auto max-w-3xl border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 text-center">
              <Calculator className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <CardTitle className="text-2xl text-slate-800">
                Grade 5 Mathematics Mixed 1
              </CardTitle>
              <p className="text-slate-600">
                Mixed exam-style practice across easy, moderate, and difficult
                skills.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Free Preview Mode
                      </p>
                      <p className="text-sm text-amber-700">
                        You can try {FREE_QUESTIONS_LIMIT} questions for free.
                        Upgrade to unlock all 40 questions and full exam
                        practice.
                      </p>

                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This mixed Grade 5 Mathematics practice includes number
                  operations, fractions, percentages, measurement, geometry,
                  data handling, time, patterns, and problem solving.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: choosing suitable strategies</li>
                  <li>Communication: interpreting word problems accurately</li>
                  <li>Creativity: noticing patterns and relationships</li>
                  <li>Problem Solving: applying Mathematics in real situations</li>
                </ul>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="mb-2 font-semibold text-purple-800">
                  Mixed-Level Practice
                </h3>
                <p className="text-sm text-slate-700">
                  This set includes a blend of direct recall, multi-step
                  reasoning, and more challenging problem-solving items.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-slate-700">
                    {availableQuestions.length}
                  </p>
                  <p className="text-sm text-slate-600">
                    Questions {!isPremium && "(Preview)"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-slate-700">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>

              <Button
                onClick={() => setStarted(true)}
                className="w-full bg-slate-700 py-6 text-lg hover:bg-slate-800"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <CardTitle className="text-2xl text-slate-800">
                Mathematics Test Completed
              </CardTitle>
              <p className="text-slate-600">Grade 5 Mathematics Mixed 1</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-slate-700">
                  {score}/{availableQuestions.length}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>

              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">
                    You completed the free preview.
                  </p>
                  <p className="text-sm text-amber-700">
                    Upgrade to Premium to unlock all 40 questions in this mixed
                    Mathematics mock test.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                </div>
              )}

              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Teacher-Style Feedback
                </h3>
                <p className="text-slate-700">
                  This mixed test checks a wide range of Grade 5 Mathematics
                  skills. Review each explanation to identify your strongest
                  areas and the topics that need more practice.
                </p>
              </div>

              <div className="space-y-4">
                {availableQuestions.map((question, index) => {
                  const correct = answers[index] === question.answer

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border-2 p-4 ${
                        correct
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {correct ? (
                          <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-red-600" />
                        )}

                        <div>
                          <p className="font-semibold text-slate-800">
                            Question {index + 1} · {question.skill}
                          </p>
                          <p className="mt-1 text-slate-700">
                            {question.question}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            {answers[index] !== undefined
                              ? question.options[answers[index]]
                              : "Not answered"}
                          </p>
                          <p className="text-sm text-green-700">
                            Correct answer: {question.options[question.answer]}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            Explanation: {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-700 hover:bg-slate-800"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>

                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>

                <Link href="/mock-tests/mathematics" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Mathematics Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4 text-white">
            <div>
              <h1 className="font-bold">Grade 5 Mathematics Mixed 1</h1>
              <p className="text-sm text-slate-200">
                Question progress: {answeredCount}/{availableQuestions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={(answeredCount / availableQuestions.length) * 100}
            className="h-2"
          />

          {!isPremium && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Free Preview: {FREE_QUESTIONS_LIMIT} of 40 questions
              </p>
              <p className="text-sm text-amber-700">
                Upgrade to Premium to access the full test.
              </p>
            </div>
          )}

          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-slate-800">
                Multiple-Choice Questions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {availableQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3">
                  <p className="text-sm font-semibold text-sky-700">
                    {question.skill}
                  </p>

                  <p className="font-semibold text-slate-800">
                    {questionIndex + 1}. {question.question}
                  </p>

                  <div className="grid gap-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() =>
                          handleSelect(questionIndex, optionIndex)
                        }
                        className={`rounded-lg border-2 p-3 text-left transition ${
                          answers[questionIndex] === optionIndex
                            ? "border-slate-700 bg-slate-50"
                            : "border-gray-200 hover:border-slate-400"
                        }`}
                      >
                        <span className="mr-2 font-bold text-slate-700">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            className="w-full bg-slate-700 py-6 text-lg hover:bg-slate-800"
          >
            Submit Test
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
