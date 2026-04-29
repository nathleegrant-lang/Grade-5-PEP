"use client"

import { useState, useEffect, useCallback } from "react"
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
  CheckCircle,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  AlertCircle,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TaskStep {
  id: number
  type: "multiple-choice" | "ordering"
  question: string
  options?: string[]
  correctAnswer?: number
  items?: { id: string; text: string }[]
  correctOrder?: string[]
}

interface FullTask {
  id: number
  title: string
  description: string
  timeLimit: number
  source: {
    title: string
    content: string
  }
  steps: TaskStep[]
}

const sampleTask: FullTask = {
  id: 1,
  title: "Planning a School Garden",
  description: "Read about starting a school garden and complete the activities.",
  timeLimit: 15,
  source: {
    title: "Starting a School Garden",
    content: `Many schools in Jamaica are starting their own gardens. A school garden can teach students about plants, healthy eating, and taking care of the environment.

To start a school garden, you need to follow these steps:

1. Choose a sunny location that gets at least 6 hours of sunlight per day.
2. Prepare the soil by removing weeds and adding compost.
3. Decide what plants to grow based on the season and available space.
4. Plant seeds or seedlings at the right depth and spacing.
5. Water the plants regularly, especially during dry periods.
6. Weed the garden to help plants grow without competition.
7. Harvest crops when they are ready.

Good plants for beginners include tomatoes, peppers, lettuce, and herbs like mint and basil.

Benefits of a school garden:
- Students learn where food comes from
- Promotes healthy eating habits
- Teaches responsibility and teamwork
- Provides fresh vegetables for school meals
- Helps the environment`,
  },
  steps: [
    {
      id: 1,
      type: "multiple-choice",
      question:
        "According to the passage, how many hours of sunlight does a garden location need?",
      options: [
        "At least 2 hours",
        "At least 4 hours",
        "At least 6 hours",
        "At least 8 hours",
      ],
      correctAnswer: 2,
    },
    {
      id: 2,
      type: "multiple-choice",
      question: "What should you add to the soil when preparing it for planting?",
      options: ["Sand", "Compost", "Rocks", "Salt"],
      correctAnswer: 1,
    },
    {
      id: 3,
      type: "multiple-choice",
      question: "Which of these is NOT mentioned as a benefit of a school garden?",
      options: [
        "Students learn where food comes from",
        "Teaches responsibility",
        "Makes students faster runners",
        "Helps the environment",
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      type: "ordering",
      question: "Put these garden steps in the correct order.",
      items: [
        { id: "a", text: "Water the plants regularly" },
        { id: "b", text: "Choose a sunny location" },
        { id: "c", text: "Plant seeds or seedlings" },
        { id: "d", text: "Prepare the soil" },
      ],
      correctOrder: ["b", "d", "c", "a"],
    },
    {
      id: 5,
      type: "multiple-choice",
      question: "Why is weeding important for a garden?",
      options: [
        "It makes the garden look pretty",
        "It helps plants grow without competition",
        "It adds more flowers",
        "It brings more insects",
      ],
      correctAnswer: 1,
    },
    {
      id: 6,
      type: "multiple-choice",
      question:
        "Based on the passage, which would be a good first plant for a new garden?",
      options: ["Mango tree", "Tomatoes", "Coconut palm", "Breadfruit"],
      correctAnswer: 1,
    },
  ],
}

export default function TaskCompletionPage() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(sampleTask.timeLimit * 60)
  const [showResults, setShowResults] = useState(false)
  const [orderingAnswers, setOrderingAnswers] = useState<string[]>([])

  const step = sampleTask.steps[currentStep]

  const calculateScore = useCallback(() => {
    let correct = 0

    sampleTask.steps.forEach((step) => {
      if (
        step.type === "multiple-choice" &&
        answers[step.id] === step.correctAnswer
      ) {
        correct++
      }

      if (step.type === "ordering") {
        const userOrder = answers[step.id] as string[]
        if (
          userOrder &&
          step.correctOrder &&
          JSON.stringify(userOrder) === JSON.stringify(step.correctOrder)
        ) {
          correct++
        }
      }
    })

    return correct
  }, [answers])

  useEffect(() => {
    if (started && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }

    if (timeLeft === 0 && started && !showResults) {
      setShowResults(true)
    }
  }, [timeLeft, started, showResults])

  useEffect(() => {
    if (step?.type === "ordering" && step.items) {
      const currentAnswer = answers[step.id] as string[] | undefined
      setOrderingAnswers(currentAnswer ?? step.items.map((item) => item.id))
    }
  }, [step, answers])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartTask = () => {
    setStarted(true)
    setTimeLeft(sampleTask.timeLimit * 60)
  }

  const handleMultipleChoiceAnswer = (value: string) => {
    setAnswers({ ...answers, [step.id]: Number.parseInt(value) })
  }

  const handleOrderingMove = (fromIndex: number, direction: "up" | "down") => {
    const newOrder = [...orderingAnswers]
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1

    if (toIndex >= 0 && toIndex < newOrder.length) {
      ;[newOrder[fromIndex], newOrder[toIndex]] = [
        newOrder[toIndex],
        newOrder[fromIndex],
      ]
      setOrderingAnswers(newOrder)
      setAnswers({ ...answers, [step.id]: newOrder })
    }
  }

  const handleNextStep = () => {
    if (currentStep < sampleTask.steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const resetTask = () => {
    setStarted(false)
    setCurrentStep(0)
    setAnswers({})
    setTimeLeft(sampleTask.timeLimit * 60)
    setShowResults(false)
    setOrderingAnswers([])
  }

  const score = calculateScore()
  const totalQuestions = sampleTask.steps.length

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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Task Completion
            </h2>
            <p className="text-gray-600">
              Practice completing multi-step Grade 5 tasks within time limits.
            </p>
          </div>
        </div>

        {!started && (
          <div className="space-y-6">
            <Card className="border-sky-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  {sampleTask.title}
                </CardTitle>
                <CardDescription>{sampleTask.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">
                      {sampleTask.timeLimit} minutes
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-sky-600" />
                    <span className="font-medium">
                      {sampleTask.steps.length} questions
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">
                        Before you begin:
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-amber-700">
                        <li>Read the passage and answer the questions.</li>
                        <li>The timer starts when you click Begin Task.</li>
                        <li>You can go back to previous questions.</li>
                        <li>Try to finish before time runs out.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleStartTask}
                  className="w-full bg-slate-700 hover:bg-slate-800"
                  size="lg"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Begin Task
                </Button>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-sky-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="h-5 w-5" />
                  Task Completion Tips
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>1. Read the passage carefully.</li>
                  <li>2. Watch the timer, but do not rush.</li>
                  <li>3. Skip and return to harder questions if needed.</li>
                  <li>4. Check your answers if time remains.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {started && !showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-5 w-5 ${
                    timeLeft <= 60 ? "text-red-500" : "text-sky-600"
                  }`}
                />
                <span
                  className={`text-lg font-bold ${
                    timeLeft <= 60 ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              <span className="text-gray-600">
                Question {currentStep + 1} of {sampleTask.steps.length}
              </span>
            </div>

            <Progress
              value={((currentStep + 1) / sampleTask.steps.length) * 100}
              className="h-3"
            />

            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-800">
                  Reference: {sampleTask.source.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="max-h-48 overflow-y-auto rounded-lg bg-blue-50 p-4 text-sm">
                  <p className="whitespace-pre-line text-blue-700">
                    {sampleTask.source.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Question {currentStep + 1}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-lg font-medium text-gray-700">
                  {step.question}
                </p>

                {step.type === "multiple-choice" && step.options && (
                  <RadioGroup
                    value={answers[step.id]?.toString() || ""}
                    onValueChange={handleMultipleChoiceAnswer}
                    className="space-y-3"
                  >
                    {step.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {step.type === "ordering" && step.items && (
                  <div className="space-y-2">
                    {orderingAnswers.map((itemId, index) => {
                      const item = step.items?.find((i) => i.id === itemId)

                      return (
                        <div
                          key={itemId}
                          className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="flex-1">{item?.text}</span>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderingMove(index, "up")}
                              disabled={index === 0}
                            >
                              Up
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderingMove(index, "down")}
                              disabled={index === orderingAnswers.length - 1}
                            >
                              Down
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNextStep}
                    className="bg-slate-700 hover:bg-slate-800"
                  >
                    {currentStep === sampleTask.steps.length - 1
                      ? "Finish Task"
                      : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showResults && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card className="border-sky-200 text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                  <Trophy className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-slate-800">
                  Task Complete!
                </CardTitle>
                <CardDescription>
                  {timeLeft > 0
                    ? `You finished with ${formatTime(timeLeft)} remaining!`
                    : "Time ran out, but here are your results."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-5xl font-bold text-sky-600">
                  {score}/{totalQuestions}
                </div>

                <p className="text-gray-600">
                  {score === totalQuestions
                    ? "Perfect! You completed the task excellently!"
                    : score >= totalQuestions * 0.8
                      ? "Great job! You understood the passage well."
                      : score >= totalQuestions * 0.6
                        ? "Good effort! Review the passage for missed questions."
                        : "Keep practising! Read each passage carefully before answering."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Review Your Answers
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {sampleTask.steps.map((reviewStep, index) => {
                  const userAnswer = answers[reviewStep.id]
                  let isCorrect = false

                  if (reviewStep.type === "multiple-choice") {
                    isCorrect = userAnswer === reviewStep.correctAnswer
                  }

                  if (reviewStep.type === "ordering") {
                    isCorrect =
                      JSON.stringify(userAnswer) ===
                      JSON.stringify(reviewStep.correctOrder)
                  }

                  return (
                    <div
                      key={reviewStep.id}
                      className={`rounded-lg border-2 p-4 ${
                        isCorrect
                          ? "border-sky-200 bg-sky-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-500" />
                        ) : (
                          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        )}

                        <div>
                          <p className="font-medium text-gray-800">
                            Question {index + 1}: {reviewStep.question}
                          </p>

                          {reviewStep.type === "multiple-choice" &&
                            reviewStep.options && (
                              <p
                                className={`mt-1 text-sm ${
                                  isCorrect
                                    ? "text-emerald-700"
                                    : "text-red-700"
                                }`}
                              >
                                {isCorrect
                                  ? `Correct: ${
                                      reviewStep.options[
                                        reviewStep.correctAnswer as number
                                      ]
                                    }`
                                  : `Your answer: ${
                                      userAnswer !== undefined
                                        ? reviewStep.options[
                                            userAnswer as number
                                          ]
                                        : "No answer"
                                    } | Correct: ${
                                      reviewStep.options[
                                        reviewStep.correctAnswer as number
                                      ]
                                    }`}
                              </p>
                            )}

                          {reviewStep.type === "ordering" && (
                            <p
                              className={`mt-1 text-sm ${
                                isCorrect ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              Correct order:{" "}
                              {reviewStep.correctOrder
                                ?.map(
                                  (id) =>
                                    reviewStep.items?.find(
                                      (item) => item.id === id
                                    )?.text
                                )
                                .join(" → ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                onClick={resetTask}
                className="bg-slate-700 hover:bg-slate-800"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Link href="/performance-tasks">
                <Button variant="outline" className="w-full">
                  Back to Performance Tasks
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
