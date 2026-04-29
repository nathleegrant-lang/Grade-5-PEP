"use client"

import { useState } from "react"

type Question = {
  id: number
  question: string
  options: string[]
  answer: string
  explanation: string
}

export default function InteractiveQuiz({
  title,
  questions,
}: {
  title: string
  questions: Question[]
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState("")
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [finished, setFinished] = useState(false)

  const question = questions[current]
  const isCorrect = selected === question.answer

  function checkAnswer() {
    if (!selected) return

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setShowFeedback(true)
  }

  function nextQuestion() {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1)
      setSelected("")
      setShowFeedback(false)
    } else {
      setFinished(true)
    }
  }

  function restartQuiz() {
    setCurrent(0)
    setSelected("")
    setScore(0)
    setShowFeedback(false)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center shadow">
        <h1 className="text-2xl font-bold text-green-700">{title}</h1>

        <p className="mt-4 text-xl font-semibold">
          Your Score: {score} / {questions.length}
        </p>

        <p className="mt-2 text-gray-600">
          {score === questions.length
            ? "Excellent work! You got everything correct."
            : score >= questions.length / 2
            ? "Good effort! Review the explanations and try again."
            : "Keep practising. You are improving with every attempt."}
        </p>

        <button
          onClick={restartQuiz}
          className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-green-700">{title}</h1>

      <p className="mt-2 text-sm text-gray-500">
        Question {current + 1} of {questions.length}
      </p>

      <h2 className="mt-6 text-lg font-semibold text-gray-900">
        {question.question}
      </h2>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => !showFeedback && setSelected(option)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              selected === option
                ? "border-green-700 bg-green-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div
          className={`mt-5 rounded-xl p-4 ${
            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <p className="font-bold">
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {!showFeedback ? (
          <button
            onClick={checkAnswer}
            disabled={!selected}
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            {current + 1 === questions.length ? "Finish Quiz" : "Next Question"}
          </button>
        )}

        <p className="self-center text-sm font-medium text-gray-600">
          Score: {score}
        </p>
      </div>
    </div>
  )
}
