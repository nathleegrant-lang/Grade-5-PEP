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
    question: "What is the main purpose of the school breakfast club?",
    options: [
      "To give students extra homework",
      "To help students start the day with a healthy meal",
      "To replace all school lunches",
      "To make students arrive late",
    ],
    answer: 1,
  },
  {
    question:
      "Which evidence best supports the idea that breakfast can help students learn?",
    options: [
      "Students like talking with friends",
      "Healthy food gives the body energy and helps students focus",
      "The tuck shop sells snacks",
      "Some students walk to school",
    ],
    answer: 1,
  },
  {
    question: "Which action would show collaboration in the breakfast club?",
    options: [
      "One student doing all the work alone",
      "Students taking turns to help serve and clean up",
      "Students refusing to share ideas",
      "Students ignoring the teacher",
    ],
    answer: 1,
  },
  {
    question:
      "Which creative idea could encourage more students to join the breakfast club?",
    options: [
      "Hide the breakfast area",
      "Create posters and a weekly healthy menu challenge",
      "Serve breakfast only once per year",
      "Tell students not to participate",
    ],
    answer: 1,
  },
  {
    question:
      "What problem might the school need to solve before starting the breakfast club?",
    options: [
      "How to organize food, helpers, and serving time",
      "How to cancel all classes",
      "How to stop students from eating",
      "How to remove all healthy foods",
    ],
    answer: 0,
  },
]

const shortAnswers: ShortAnswer[] = [
  {
    question: "State TWO benefits of a school breakfast club.",
    answer:
      "A breakfast club can help students get a healthy meal and have more energy to focus in class.",
  },
  {
    question:
      "Explain ONE way students could work together to make the breakfast club successful.",
    answer:
      "Students could take turns helping to serve breakfast, clean the area, and remind others to use good manners.",
  },
]

export default function PerformanceModerate1Page() {
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
          <Link href="/mock-tests/performance/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Performance Task Mock Tests
            </Button>
          </Link>

          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">
                Grade 5 Performance Task Moderate 1
              </CardTitle>
              <p className="text-slate-600">Topic: School Breakfast Club</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Task Scenario
                </h3>
                <p className="text-slate-700">
                  Your school is thinking about starting a breakfast club to
                  help students begin the day with a healthy meal. Read the
                  information, answer the questions, and complete the writing
                  task.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: using evidence to make decisions</li>
                  <li>Communication: explaining reasons clearly</li>
                  <li>Collaboration: considering how people work together</li>
                  <li>Creativity: suggesting useful ways to improve the club</li>
                </ul>
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
                Grade 5 Performance Task Moderate 1
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
                  Review your answers carefully. A strong Grade 5 response
                  should use evidence from the source, explain ideas clearly,
                  and show thoughtful reasoning about how the breakfast club
                  could help students.
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

                  I believe our school should start a breakfast club because
                  some students come to school without eating. A healthy
                  breakfast can give students energy and help them focus better
                  in class.

                  The breakfast club can also teach students about healthy
                  eating and responsibility. Students could help by taking turns
                  to serve, keeping the area clean, and encouraging classmates
                  to make good food choices.

                  Yours respectfully, A Grade 5 Student
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

                <Link href="/mock-tests/performance/language-arts" className="flex-1">
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
              <h1 className="font-bold">Grade 5 Performance Task Moderate 1</h1>
              <p className="text-sm text-slate-200">School Breakfast Club</p>
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
                Some Grade 5 students arrive at school without eating
                breakfast. When students are hungry, they may feel tired,
                distracted, or unable to focus well during lessons.
              </p>

              <p>
                A school breakfast club would allow students to receive a simple
                healthy meal before classes begin. Foods could include fruits,
                porridge, whole wheat sandwiches, or other nutritious options.
              </p>

              <p>
                To make the club successful, students, teachers, parents, and
                community members would need to work together. Students could
                help by keeping the area clean, serving respectfully, and
                encouraging others to make healthy choices.
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
                Write a short letter to your principal explaining why the school
                should start a breakfast club. Give at least TWO reasons and
                suggest ONE way students can help.
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
