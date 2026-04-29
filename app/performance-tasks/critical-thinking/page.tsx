"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface ThinkingQuestion {
  id: number
  type: "pattern" | "logic" | "problem" | "analyze"
  scenario?: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const thinkingQuestions: ThinkingQuestion[] = [
  {
    id: 1,
    type: "pattern",
    question: "What comes next in this pattern? 5, 10, 15, 20, ___",
    options: ["22", "24", "25", "30"],
    correctAnswer: 2,
    explanation: "The pattern adds 5 each time, so 20 + 5 = 25.",
  },
  {
    id: 2,
    type: "logic",
    scenario: "All bananas are fruits. Fruits are sold at the market.",
    question: "Which conclusion is correct?",
    options: [
      "All markets sell only bananas",
      "Bananas can be sold at the market",
      "All fruits are bananas",
      "Bananas are vegetables",
    ],
    correctAnswer: 1,
    explanation:
      "Since bananas are fruits and fruits are sold at the market, bananas can be sold at the market.",
  },
  {
    id: 3,
    type: "problem",
    scenario:
      "A class collected 36 bottles on Monday, 48 on Tuesday, and 52 on Wednesday.",
    question: "How many bottles did they collect altogether?",
    options: ["126", "136", "146", "156"],
    correctAnswer: 1,
    explanation: "36 + 48 + 52 = 136 bottles.",
  },
  {
    id: 4,
    type: "analyze",
    scenario:
      "A student scored high in homework but low in timed tests.",
    question: "What is the best conclusion?",
    options: [
      "The student does not understand the work",
      "The student may need more practice working under time limits",
      "The homework was too easy",
      "The teacher made a mistake",
    ],
    correctAnswer: 1,
    explanation:
      "The student seems to understand the work but may need practice answering faster during timed tests.",
  },
]

const questionTypeLabels = {
  pattern: { label: "Pattern Recognition", color: "bg-blue-500" },
  logic: { label: "Logical Thinking", color: "bg-sky-500" },
  problem: { label: "Problem Solving", color: "bg-amber-500" },
  analyze: { label: "Analysis", color: "bg-purple-500" },
}

export default function CriticalThinkingPage() {
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  const question = thinkingQuestions[currentQuestion]

  const handleAnswerSelect = (index: number) => {
    if (showResult) return

    setSelectedAnswer(index)
    setShowResult(true)

    if (index === question.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < thinkingQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizComplete(false)
    setStarted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <Link href="/performance-tasks">
          <Button
            variant="ghost"
            className="mb-6 text-slate-700 hover:bg-sky-100 hover:text-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Performance Tasks
          </Button>
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Lightbulb className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Critical Thinking
            </h2>
            <p className="text-gray-600">
              Develop Grade 5 reasoning and problem-solving skills
            </p>
          </div>
        </div>

        {!started && (
          <div className="space-y-6">
            <Card className="border-purple-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  What is Critical Thinking?
                </CardTitle>
                <CardDescription>
                  Using evidence, logic, and reasoning to choose the best answer.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Critical thinking helps students read carefully, identify
                  patterns, compare information, solve problems, and avoid
                  guessing. These skills are important for Grade 5 PEP
                  Performance Tasks.
                </p>

                <Button
                  onClick={() => setStarted(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Start Thinking Challenge
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="h-5 w-5" />
                  Thinking Tips
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>1. Read the question carefully.</li>
                  <li>2. Look for clues in the information given.</li>
                  <li>3. Eliminate answers that do not make sense.</li>
                  <li>4. Choose the answer that is best supported by facts.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {started && !quizComplete && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Badge className={questionTypeLabels[question.type].color}>
                {questionTypeLabels[question.type].label}
              </Badge>
              <span className="text-gray-600">
                Question {currentQuestion + 1} of {thinkingQuestions.length}
              </span>
            </div>

            <Progress
              value={(currentQuestion / thinkingQuestions.length) * 100}
              className="mb-6 h-3"
            />

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Think Carefully
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {question.scenario && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-1 font-medium text-blue-800">
                      Information:
                    </p>
                    <p className="text-blue-700">{question.scenario}</p>
                  </div>
                )}

                <p className="text-lg font-medium text-gray-700">
                  {question.question}
                </p>

                <div className="grid gap-3">
                  {question.options.map((option, index) => {
                    let buttonClass =
                      "rounded-lg border-2 p-4 text-left transition-all "

                    if (showResult) {
                      if (index === question.correctAnswer) {
                        buttonClass +=
                          "border-sky-500 bg-sky-50 text-sky-800"
                      } else if (
                        index === selectedAnswer &&
                        index !== question.correctAnswer
                      ) {
                        buttonClass +=
                          "border-red-500 bg-red-50 text-red-800"
                      } else {
                        buttonClass +=
                          "border-gray-200 bg-gray-50 text-gray-500"
                      }
                    } else {
                      buttonClass +=
                        "border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-medium">{option}</span>

                          {showResult &&
                            index === question.correctAnswer && (
                              <CheckCircle className="ml-auto h-5 w-5 flex-shrink-0 text-sky-500" />
                            )}

                          {showResult &&
                            index === selectedAnswer &&
                            index !== question.correctAnswer && (
                              <XCircle className="ml-auto h-5 w-5 flex-shrink-0 text-red-500" />
                            )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResult && (
                  <div
                    className={`rounded-lg p-4 ${
                      selectedAnswer === question.correctAnswer
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <p className="font-medium">
                      {selectedAnswer === question.correctAnswer
                        ? "Excellent thinking!"
                        : "Not quite right."}
                    </p>
                    <p className="mt-1 text-sm">{question.explanation}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={resetQuiz}>
                    Start Over
                  </Button>

                  {showResult && (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {currentQuestion < thinkingQuestions.length - 1
                        ? "Next Question"
                        : "See Results"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {quizComplete && (
          <div className="mx-auto max-w-md">
            <Card className="border-purple-200 text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                  <Trophy className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-slate-800">
                  Challenge Complete!
                </CardTitle>
                <CardDescription>
                  You finished the Critical Thinking challenge.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-5xl font-bold text-purple-600">
                  {score}/{thinkingQuestions.length}
                </div>

                <Button
                  onClick={resetQuiz}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Link href="/performance-tasks">
                  <Button variant="outline" className="w-full">
                    Back to Performance Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
