"use client"

import type { RefObject } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Clock, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FocusedAssessmentQuestion {
  id: number
  question: string
  options: string[]
}

interface FocusedAssessmentStimulus {
  title: string
  content: string
}

interface FocusedActiveRunnerProps {
  assessmentName: string
  question: FocusedAssessmentQuestion
  questions: FocusedAssessmentQuestion[]
  currentQuestion: number
  answers: (number | null)[]
  timeLeft: number
  formatTime: (seconds: number) => string
  sectionLabel: string
  skill: string
  sectionClassName: string
  onAnswer: (optionIndex: number) => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onNavigate?: (questionIndex: number) => void
  stimulus?: FocusedAssessmentStimulus
  questionTopRef?: RefObject<HTMLElement | null>
  previewNotice?: string
}

export function FocusedActiveRunner({
  assessmentName,
  question,
  questions,
  currentQuestion,
  answers,
  timeLeft,
  formatTime,
  sectionLabel,
  skill,
  sectionClassName,
  onAnswer,
  onPrevious,
  onNext,
  onSubmit,
  onNavigate,
  stimulus,
  questionTopRef,
  previewNotice,
}: FocusedActiveRunnerProps) {
  const totalQuestions = questions.length
  const answeredCount = answers.filter((answer) => answer !== null).length
  const answeredPercentage = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-blue-700 bg-blue-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10" aria-hidden="true">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-blue-200">
                PEP PRACTICE · Grade 5 · Language Arts
              </p>
              <h1 className="truncate text-base font-bold sm:text-lg">{assessmentName}</h1>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-sm text-blue-100">
              <span className="font-semibold text-white">Question {currentQuestion + 1}</span> of {totalQuestions}
            </div>
            <div
              className={cn(
                "flex min-w-[7.25rem] items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-base font-bold tabular-nums",
                timeLeft <= 300 ? "bg-red-500" : "bg-blue-700",
              )}
              aria-label={`Time remaining ${formatTime(timeLeft)}`}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[113px] z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur sm:top-[73px]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-1 text-sm text-slate-600">
            <span>{answeredCount} of {totalQuestions} answered</span>
            <span>{answeredPercentage}% complete</span>
          </div>
          <Progress value={answeredPercentage} className="h-2" aria-label={`${answeredPercentage}% complete`} />
        </div>
      </div>

      <main ref={questionTopRef} className="mx-auto max-w-7xl scroll-mt-40 px-4 py-5 sm:px-6 sm:py-7">
        {previewNotice ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {previewNotice}
          </p>
        ) : null}

        <div className={cn("grid gap-5", stimulus ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start" : "mx-auto max-w-4xl")}>
          {stimulus ? (
            <Card className="border-blue-200 shadow-sm lg:sticky lg:top-32">
              <CardHeader className="border-b border-blue-100 bg-blue-50 px-5 py-4">
                <h2 className="flex items-center gap-2 font-semibold text-blue-900">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  {stimulus.title}
                </h2>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="whitespace-pre-line text-[0.95rem] leading-7 text-slate-700 sm:text-base">
                  {stimulus.content}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="min-w-0">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className={cn("rounded-t-xl px-5 py-3", sectionClassName)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wide">{skill}</span>
                  <span className="text-xs uppercase tracking-wide opacity-75">{sectionLabel}</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <p className="mb-6 whitespace-pre-line text-base font-medium leading-7 text-slate-800">
                  {question.question}
                </p>
                <div className="space-y-3" role="radiogroup" aria-label={question.question}>
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[currentQuestion] === optionIndex
                    return (
                      <button
                        key={`${question.id}-${optionIndex}`}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onAnswer(optionIndex)}
                        className={cn(
                          "flex min-h-14 w-full items-start rounded-xl border-2 p-4 text-left leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                          selected
                            ? "border-blue-600 bg-blue-50 text-slate-900"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50",
                        )}
                      >
                        <span className="mr-3 font-semibold text-blue-700" aria-hidden="true">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <Button variant="outline" onClick={onPrevious} disabled={currentQuestion === 0}>
                <ChevronLeft className="mr-1 h-4 w-4 sm:mr-2" aria-hidden="true" />
                Previous
              </Button>
              {currentQuestion === totalQuestions - 1 ? (
                <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
                  <Flag className="mr-1 h-4 w-4 sm:mr-2" aria-hidden="true" />
                  Submit Test
                </Button>
              ) : (
                <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ChevronRight className="ml-1 h-4 w-4 sm:ml-2" aria-hidden="true" />
                </Button>
              )}
            </div>

            {onNavigate ? (
              <Card className="mt-5 border-blue-100">
                <CardHeader className="px-5 py-3">
                  <h2 className="text-sm font-semibold text-blue-800">Question Navigator</h2>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-5 gap-2 min-[420px]:grid-cols-8 sm:grid-cols-10">
                    {questions.map((navigatorQuestion, questionIndex) => (
                      <button
                        key={navigatorQuestion.id}
                        type="button"
                        aria-label={`Go to question ${questionIndex + 1}`}
                        aria-current={currentQuestion === questionIndex ? "step" : undefined}
                        onClick={() => onNavigate(questionIndex)}
                        className={cn(
                          "h-10 w-10 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                          currentQuestion === questionIndex
                            ? "bg-blue-600 text-white"
                            : answers[questionIndex] !== null
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        )}
                      >
                        {questionIndex + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-600" />Current</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-100" />Answered</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-100" />Unanswered</span>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
