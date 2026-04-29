"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react"

type MCQ = {
  question: string
  options: string[]
  answer: number
}

type ShortAnswer = {
  question: string
  answer: string
}

const mcqs: MCQ[] = [
  {
    question:
      "What is the main goal of the Student Wellness Day?",
    options: [
      "To cancel all classes permanently",
      "To help students learn about healthy habits, teamwork, and emotional well-being",
      "To make students compete all day without rest",
      "To replace all school subjects",
    ],
    answer: 1,
  },
  {
    question:
      "Which activity would best support both physical health and collaboration?",
    options: [
      "A team relay where students encourage each other and practise fair play",
      "A silent test with no movement",
      "A competition where only one student is allowed to participate",
      "A snack sale with only sugary drinks",
    ],
    answer: 0,
  },
  {
    question:
      "Which evidence suggests that Wellness Day can improve communication skills?",
    options: [
      "Students will sit alone",
      "Students may share ideas in group discussions and present posters",
      "Students will ignore instructions",
      "Students will avoid speaking",
    ],
    answer: 1,
  },
  {
    question:
      "Which challenge would need careful planning?",
    options: [
      "Making sure activities are safe, organized, and suitable for all students",
      "Choosing one colour only for the posters",
      "Stopping students from drinking water",
      "Keeping all parents away from the event",
    ],
    answer: 0,
  },
  {
    question:
      "Which creative idea could make Wellness Day more meaningful?",
    options: [
      "Let students design wellness posters, healthy menu cards, and kindness messages",
      "Give no instructions",
      "Cancel all group activities",
      "Ask students not to participate",
    ],
    answer: 0,
  },
  {
    question:
      "Which conclusion is best supported by the source?",
    options: [
      "Wellness Day can help students if it is planned carefully and everyone works together",
      "Wellness Day has no connection to learning",
      "Only teachers should participate",
      "Healthy habits are not important for students",
    ],
    answer: 0,
  },
]

const shortAnswers: ShortAnswer[] = [
  {
    question:
      "State TWO ways Student Wellness Day could help Grade 5 students.",
    answer:
      "Student Wellness Day could help Grade 5 students learn about healthy habits and practise teamwork. It could also help students understand ways to manage feelings and encourage others.",
  },
  {
    question:
      "Identify ONE problem that may happen during Wellness Day and suggest a solution.",
    answer:
      "One problem is that some activities may become disorganized. A solution is to create a clear schedule and assign teachers or student leaders to guide each activity.",
  },
]

export default function PerformanceMixed1Page() {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

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
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleSelect = (qIndex: number, optionIndex: number) => {
    const updated = [...answers]
    updated[qIndex] = optionIndex
    setAnswers(updated)
  }

  const calculateScore = () => {
    let total = 0

    mcqs.forEach((q, i) => {
      if (answers[i] === q.answer) total++
    })

    setScore(total)
  }

  const handleSubmit = () => {
    calculateScore()
    setShowResults(true)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/performance">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Performance Task Mock Tests
            </Button>
          </Link>

          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">
                Grade 5 Performance Task Mixed 1
              </CardTitle>
              <p className="text-slate-600">Topic: Student Wellness Day</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Task Scenario
                </h3>
                <p className="text-slate-700">
                  Your school is planning a Student Wellness Day. The day will
                  include activities about healthy eating, exercise, teamwork,
                  kindness, and emotional well-being. Read the information,
                  answer the questions, and complete the writing task.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating benefits and challenges</li>
                  <li>Communication: explaining ideas clearly</li>
                  <li>Collaboration: planning teamwork and shared roles</li>
                  <li>Creativity: designing useful wellness ideas</li>
                </ul>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="mb-2 font-semibold text-purple-800">
                  Mixed-Level Practice
                </h3>
                <p className="text-sm text-slate-700">
                  This task includes a blend of easier recall, moderate
                  interpretation, and difficult reasoning questions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">
                    {mcqs.length}
                  </p>
                  <p className="text-sm text-slate-600">Multiple Choice</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>

              <Button
                onClick={() => setStarted(true)}
                className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600"
              >
                Start Task
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
          <Card className="mx-auto max-w-4xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-amber-600" />
              <CardTitle className="text-2xl text-amber-800">
                Performance Task Completed
              </CardTitle>
              <p className="text-slate-600">
                Grade 5 Performance Task Mixed 1
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">
                  {score}/{mcqs.length}
                </p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Teacher-Style Feedback
                </h3>
                <p className="text-slate-700">
                  This mixed task checks recall, interpretation, and reasoning.
                  A strong response should use source information, give clear
                  reasons, and suggest practical ideas that support student
                  wellness.
                </p>
              </div>

              <div className="space-y-4">
                {mcqs.map((q, index) => {
                  const correct = answers[index] === q.answer

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
                            Question {index + 1}
                          </p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            {answers[index] !== undefined
                              ? q.options[answers[index]]
                              : "Not answered"}
                          </p>
                          <p className="text-sm text-green-700">
                            Correct answer: {q.options[q.answer]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 font-semibold text-blue-800">
                  Sample Short Responses
                </h3>

                <div className="space-y-3">
                  {shortAnswers.map((item, index) => (
                    <div key={index} className="rounded bg-white p-3">
                      <p className="font-medium text-slate-800">
                        {item.question}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Sample answer: {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">
                  Extended Writing Model Answer
                </h3>

                <p className="whitespace-pre-line text-slate-700">
                  Dear Principal,

                  I believe Student Wellness Day would be helpful for our
                  school because it can teach students how to take better care of
                  their bodies and minds. Activities about healthy eating,
                  exercise, kindness, and teamwork can help students build good
                  habits.

                  One benefit is that students can learn how to work together
                  during team activities. Another benefit is that students can
                  learn ways to manage their feelings and encourage others. This
                  can help create a kinder and healthier school environment.

                  A possible challenge is that the day may become disorganized
                  if there is no clear plan. To solve this, the school could
                  create a schedule and assign teachers, student leaders, and
                  parent volunteers to help with each activity.

                  Yours respectfully,
                  A Grade 5 Student
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>

                <Button
                  onClick={() => {
                    setStarted(false)
                    setShowResults(false)
                    setAnswers([])
                    setScore(0)
                    setTimeLeft(60 * 60)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>

                <Link href="/mock-tests/performance" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Performance Tasks
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
              <h1 className="font-bold">Grade 5 Performance Task Mixed 1</h1>
              <p className="text-sm text-slate-200">Student Wellness Day</p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={
              (answers.filter((a) => a !== undefined).length / mcqs.length) *
              100
            }
            className="h-2"
          />

          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">
                Source Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>
                The school plans to host a Student Wellness Day for Grade 5
                students. The day would include activities about healthy eating,
                physical activity, kindness, teamwork, and emotional well-being.
              </p>

              <p>
                Some suggested activities include a team relay, a healthy snack
                station, a kindness wall, group discussions, poster making, and
                short talks from teachers or community health workers.
              </p>

              <p>
                Supporters believe the event could help students make better
                choices, communicate more clearly, and work together. However,
                teachers say the event will need careful planning so that each
                activity is safe, organized, and useful for all students.
              </p>

              <p>
                Students may also be invited to create posters, menu cards, and
                wellness messages to share with their classmates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">
                Multiple-Choice Questions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {mcqs.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-semibold text-slate-800">
                    {qIndex + 1}. {q.question}
                  </p>

                  <div className="grid gap-3">
                    {q.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleSelect(qIndex, optionIndex)}
                        className={`rounded-lg border-2 p-3 text-left transition ${
                          answers[qIndex] === optionIndex
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <span className="mr-2 font-bold text-amber-700">
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

          <Card className="border-sky-200">
            <CardHeader className="bg-sky-50">
              <CardTitle className="text-sky-800">
                Short Response Practice
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              {shortAnswers.map((item, index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <p className="font-medium text-slate-800">
                    {index + 1}. {item.question}
                  </p>
                  <textarea
                    className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm"
                    placeholder="Write your answer here..."
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">
                Extended Writing Task
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">
                Write a letter to your principal explaining why the school
                should host Student Wellness Day. Use information from the
                source, give at least TWO benefits, identify ONE possible
                challenge, and suggest ONE solution.
              </p>

              <textarea
                className="min-h-[220px] w-full rounded-lg border p-3 text-sm"
                placeholder="Write your letter here..."
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600"
          >
            Submit Task
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
