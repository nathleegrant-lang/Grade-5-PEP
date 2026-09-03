"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RotateCcw, ChevronRight } from "lucide-react"

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizProps {
  questions: Question[]
  title: string
}

export function Quiz({ questions, title }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return
    setSelectedAnswer(answerIndex)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return
    setAnswered(true)
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setShowResult(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswered(false)
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="border-2 border-[#0d9488]">
        <CardContent className="p-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">PEP PRACTICE — Grade 5</p>
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
            percentage >= 70 ? "bg-green-100" : percentage >= 50 ? "bg-yellow-100" : "bg-red-100"
          }`}>
            <span className={`text-3xl font-bold ${
              percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {percentage}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">
            {percentage >= 70 ? "Great Job!" : percentage >= 50 ? "Good Effort!" : "Keep Practising!"}
          </h3>
          <p className="text-gray-600 mb-6">
            You scored {score} out of {questions.length} questions correctly.
          </p>
          <Button onClick={handleRestart} className="bg-[#0d9488] hover:bg-[#0d4a5f]">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">PEP PRACTICE Grade 5 · {title}</div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-[#0d9488]">
            Score: {score}/{questions.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-[#0d9488] h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-6">
          {question.question}
        </h3>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all "
            
            if (answered) {
              if (index === question.correctAnswer) {
                buttonClass += "border-green-500 bg-green-50 text-green-700"
              } else if (index === selectedAnswer) {
                buttonClass += "border-red-500 bg-red-50 text-red-700"
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-400"
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += "border-[#0d9488] bg-teal-50 text-[#0d4a5f]"
              } else {
                buttonClass += "border-gray-200 hover:border-[#0d9488] hover:bg-gray-50"
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={answered}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {answered && index === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
                  )}
                  {answered && index === selectedAnswer && index !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 ml-auto text-red-500" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className={`font-medium ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
              {isCorrect ? "Correct!" : "Not quite right."}
            </p>
            <p className="text-gray-600 text-sm mt-1">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!answered ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white"
            >
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="flex-1 bg-[#0d9488] hover:bg-[#0d4a5f] text-white"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
