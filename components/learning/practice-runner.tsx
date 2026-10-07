"use client"

import { useState } from "react"
import type { PracticeQuestion, PracticeResult } from "../../lib/learning/contracts"

interface PracticeRunnerProps {
  gradeLabel: string
  title: string
  questions: readonly PracticeQuestion[]
  onReviewTopic: () => void
  onChooseAnotherTopic: () => void
  onComplete: (result: PracticeResult) => void
  onRestart: () => void
}
/** Transient execution only. Certification and curriculum selection belong outside the runner. */
export function PracticeRunner({ gradeLabel, title, questions, onReviewTopic, onChooseAnotherTopic, onComplete, onRestart }: PracticeRunnerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const question = questions[currentQuestion]
  const reset = () => {
    setCurrentQuestion(0); setSelectedAnswer(null); setAnswered(false); setScore(0); setShowResult(false)
    onRestart()
  }
  if (!question) return <p role="status">Practice is not yet available.</p>
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100)
    return <section aria-label="Practice results" className="rounded-xl border border-teal-200 bg-white p-6 text-center">
      <p className="text-sm font-bold text-blue-700">PEP PRACTICE · {gradeLabel} · {title}</p>
      <p className="my-4 text-4xl font-bold">{percentage}%</p>
      <h2 className="text-2xl font-bold">{percentage >= 70 ? "Great Job!" : percentage >= 50 ? "Good Effort!" : "Keep Practising!"}</h2>
      <p className="my-4">You scored {score} out of {questions.length} questions correctly.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="learn-control" onClick={reset}>Try Again</button>
        <button type="button" className="learn-control" onClick={onReviewTopic}>Review Topic</button>
        <button type="button" className="learn-control" onClick={onChooseAnotherTopic}>Choose Another Topic</button>
      </div>
    </section>
  }
  return <section aria-label="Topic Practice" className="rounded-xl border border-slate-200 bg-white p-6">
    <p className="text-sm font-bold text-blue-700">PEP PRACTICE · {gradeLabel} · {title}</p>
    <p className="my-4">Question {currentQuestion + 1} of {questions.length} · Score: {score}/{questions.length}</p>
    <h2 className="mb-4 text-xl font-semibold">{question.question}</h2>
    <div className="grid gap-3">{question.options.map((option, index) => <button type="button" key={index}
      disabled={answered} aria-pressed={selectedAnswer === index}
      className={`rounded-lg border-2 p-4 text-left ${answered && index === question.correctAnswer ? "border-green-600 bg-green-50" : selectedAnswer === index ? "border-blue-700 bg-blue-50" : "border-slate-200"}`}
      onClick={() => { if (!answered) setSelectedAnswer(index) }}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
    {answered ? <div role="status" className="my-4 rounded-lg bg-slate-50 p-4">
      <p className="font-semibold">{selectedAnswer === question.correctAnswer ? "Correct!" : "Not quite right."}</p>
      <p>{question.explanation}</p>
    </div> : null}
    {!answered ? <button type="button" className="learn-control mt-4" disabled={selectedAnswer === null} onClick={() => {
      if (selectedAnswer === null || answered) return
      setAnswered(true)
      if (selectedAnswer === question.correctAnswer) setScore(score + 1)
    }}>Check Answer</button> : <button type="button" className="learn-control mt-4" onClick={() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1); setSelectedAnswer(null); setAnswered(false)
      } else {
        setShowResult(true)
        onComplete({ score, total: questions.length, percentage: Math.round((score / questions.length) * 100) })
      }
    }}>{currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}</button>}
  </section>
}
