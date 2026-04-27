"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Clock, ArrowRight, ArrowLeft, RotateCcw, Trophy, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateMockTestScore } from "@/components/progress-tracker"
import { useAuth } from "@/contexts/auth-context"
import { Crown, Lock } from "lucide-react"
import Link from "next/link"

export interface MockTestQuestion {
  id: number
  type: "multiple-choice" | "short-answer" | "performance-task"
  question: string
  context?: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  points: number
}

interface MockTestProps {
  title: string
  subject: string
  description: string
  timeLimit: number // in minutes
  questions: MockTestQuestion[]
  passingScore: number // percentage
}

export function MockTest({ title, subject, description, timeLimit, questions, passingScore }: MockTestProps) {
  const { isPremium } = useAuth()
  
  // Free users only get 5 questions preview
  const FREE_QUESTION_LIMIT = 5
  const availableQuestions = isPremium ? questions : questions.slice(0, FREE_QUESTION_LIMIT)
  const actualTimeLimit = isPremium ? timeLimit : Math.ceil(timeLimit * (FREE_QUESTION_LIMIT / questions.length))
  
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [timeRemaining, setTimeRemaining] = useState(actualTimeLimit * 60)
  const [showResults, setShowResults] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  const totalPoints = availableQuestions.reduce((sum, q) => sum + q.points, 0)

  const calculateScore = useCallback(() => {
    let earned = 0
    availableQuestions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (q.type === "multiple-choice" && userAnswer === q.correctAnswer) {
        earned += q.points
      } else if (q.type === "short-answer" || q.type === "performance-task") {
        // For written answers, give partial credit if answer exists
        if (userAnswer && String(userAnswer).trim().length > 10) {
          earned += q.points * 0.5 // 50% for attempting
        }
      }
    })
    return earned
  }, [answers, availableQuestions])

  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTestCompleted(true)
            setShowResults(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [testStarted, testCompleted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: number, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < availableQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    setTestCompleted(true)
    setShowResults(true)
    // Save progress
    const finalScore = calculateScore()
    const finalPercentage = Math.round((finalScore / totalPoints) * 100)
    updateMockTestScore(subject, finalPercentage)
  }

  const handleRestart = () => {
    setTestStarted(false)
    setTestCompleted(false)
    setCurrentQuestion(0)
    setAnswers({})
    setTimeRemaining(timeLimit * 60)
    setShowResults(false)
    setReviewMode(false)
  }

  const score = calculateScore()
  const percentage = Math.round((score / totalPoints) * 100)
  const passed = percentage >= passingScore

  // Start screen
  if (!testStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center bg-[#0d9488] text-white rounded-t-lg">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-teal-100">{subject} Mock Test</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-gray-600">{description}</p>
          
          {/* Premium upgrade banner for free users */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0d9488]/10 border border-[#f59e0b] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1e3a5f]">Free Preview Mode</p>
                  <p className="text-sm text-gray-600">
                    You can try {FREE_QUESTION_LIMIT} questions. Upgrade to access all {questions.length} questions!
                  </p>
                </div>
                <Link href="/pricing">
                  <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-semibold text-blue-900">{actualTimeLimit} Minutes</p>
              <p className="text-sm text-blue-600">Time Limit</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <p className="font-semibold text-amber-900">
                {availableQuestions.length} {!isPremium && `of ${questions.length}`} Questions
              </p>
              <p className="text-sm text-amber-600">{isPremium ? "Total Questions" : "Free Preview"}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Read each question carefully before answering.</li>
              <li>2. You can navigate between questions using the arrows.</li>
              <li>3. The test will auto-submit when time runs out.</li>
              <li>4. You need {passingScore}% to pass this test.</li>
              <li>5. Performance tasks require written responses.</li>
            </ul>
          </div>

          <Button 
            onClick={() => setTestStarted(true)} 
            className="w-full bg-[#0d9488] hover:bg-[#0a7c72] text-white py-6 text-lg"
          >
            {isPremium ? "Start Full Test" : "Start Free Preview"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Results screen
  if (showResults && !reviewMode) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className={cn(
          "text-center rounded-t-lg",
          passed ? "bg-green-600" : "bg-red-500",
          "text-white"
        )}>
          <Trophy className="w-16 h-16 mx-auto mb-2" />
          <CardTitle className="text-2xl">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </CardTitle>
          <p>{passed ? "You passed the test!" : "You can do better next time!"}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">{percentage}%</div>
            <p className="text-gray-600">Your Score: {score} / {totalPoints} points</p>
            <p className="text-sm text-gray-500">Passing Score: {passingScore}%</p>
          </div>

          <Progress value={percentage} className="h-4" />

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="font-semibold text-green-900">
                {questions.filter(q => answers[q.id] === q.correctAnswer).length}
              </p>
              <p className="text-sm text-green-600">Correct</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
              <p className="font-semibold text-red-900">
                {questions.filter(q => answers[q.id] !== q.correctAnswer).length}
              </p>
              <p className="text-sm text-red-600">Incorrect</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => setReviewMode(true)} 
              variant="outline"
              className="flex-1"
            >
              Review Answers
            </Button>
            <Button 
              onClick={handleRestart}
              className="flex-1 bg-[#0d9488] hover:bg-[#0a7c72]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Review mode
  if (reviewMode) {
    const question = availableQuestions[currentQuestion]
    const userAnswer = answers[question.id]
    const isCorrect = userAnswer === question.correctAnswer

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="bg-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Review: Question {currentQuestion + 1} of {availableQuestions.length}</CardTitle>
            <Button onClick={() => setReviewMode(false)} variant="outline" size="sm">
              Back to Results
            </Button>
          </div>
          <Progress value={((currentQuestion + 1) / availableQuestions.length) * 100} className="h-2" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {question.context && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 whitespace-pre-line">{question.context}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            
            {question.type === "multiple-choice" && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => {
                  const isUserAnswer = userAnswer === index
                  const isCorrectOption = question.correctAnswer === index
                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        isCorrectOption && "bg-green-50 border-green-500",
                        isUserAnswer && !isCorrectOption && "bg-red-50 border-red-500",
                        !isUserAnswer && !isCorrectOption && "border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {isUserAnswer && !isCorrectOption && <XCircle className="w-5 h-5 text-red-600" />}
                        <span>{option}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {(question.type === "short-answer" || question.type === "performance-task") && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Your Answer:</p>
                  <p className="text-gray-800">{userAnswer || "No answer provided"}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-1">Sample Answer:</p>
                  <p className="text-gray-800">{question.correctAnswer}</p>
                </div>
              </div>
            )}
          </div>

          <div className={cn(
            "p-4 rounded-lg",
            isCorrect ? "bg-green-50" : "bg-amber-50"
          )}>
            <p className="font-medium mb-1">
              {isCorrect ? "Correct!" : "Explanation:"}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentQuestion === availableQuestions.length - 1}
              className="bg-[#0d9488] hover:bg-[#0a7c72]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Test in progress
  const question = availableQuestions[currentQuestion]

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="bg-[#0d9488] text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Question {currentQuestion + 1} of {availableQuestions.length}</CardTitle>
            <p className="text-sm text-teal-100">{question.points} point{question.points > 1 ? "s" : ""}</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            timeRemaining < 60 ? "bg-red-500" : "bg-white/20"
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <Progress value={((currentQuestion + 1) / availableQuestions.length) * 100} className="h-2 mt-4" />
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {question.context && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-blue-800 mb-2">Read the following:</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{question.context}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{question.question}</h3>
          
          {question.type === "multiple-choice" && question.options && (
            <RadioGroup
              value={String(answers[question.id] ?? "")}
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    answers[question.id] === index
                      ? "border-[#0d9488] bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {(question.type === "short-answer" || question.type === "performance-task") && (
            <Textarea
              placeholder="Type your answer here..."
              value={String(answers[question.id] || "")}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="min-h-[150px]"
            />
          )}
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-2 justify-center py-4 border-t">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(index)}
              className={cn(
                "w-8 h-8 rounded-full text-sm font-medium transition-all",
                currentQuestion === index && "ring-2 ring-offset-2 ring-[#0d9488]",
                answers[q.id] !== undefined
                  ? "bg-[#0d9488] text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentQuestion === availableQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-[#0d9488] hover:bg-[#0a7c72]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
