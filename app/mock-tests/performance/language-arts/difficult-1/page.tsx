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
      "What is the main problem the community garden project is trying to solve?",
    options: [
      "Students do not like Science",
      "Families need more access to fresh foods and better use of empty land",
      "The school wants fewer students to work together",
      "The community has too many gardens already",
    ],
    answer: 1,
  },
  {
    question:
      "Which evidence best supports the idea that the garden can benefit both the school and the wider community?",
    options: [
      "The garden will be near the school gate",
      "Students can learn farming skills, and families may receive fresh vegetables",
      "Some students like being outside",
      "The garden may have colourful signs",
    ],
    answer: 1,
  },
  {
    question:
      "Which challenge would require the MOST planning before the garden begins?",
    options: [
      "Choosing who will water and care for the garden during weekends and holidays",
      "Choosing the colour of the watering cans",
      "Deciding if students like carrots",
      "Naming the garden after a class",
    ],
    answer: 0,
  },
  {
    question:
      "Which solution shows the BEST collaboration?",
    options: [
      "One teacher does all the work",
      "Students, parents, teachers, and community members share responsibilities",
      "Only Grade 5 students are allowed to know about the garden",
      "The garden is locked so no one can help",
    ],
    answer: 1,
  },
  {
    question:
      "Which idea is the MOST creative and practical way to encourage participation?",
    options: [
      "Cancel the project if students are busy",
      "Create class garden teams and allow students to design signs showing plant care tips",
      "Tell students the garden is only for adults",
      "Plant crops but never harvest them",
    ],
    answer: 1,
  },
  {
    question:
      "Which conclusion is best supported by the source information?",
    options: [
      "The garden will succeed without planning",
      "The garden could be useful, but it needs teamwork, planning, and regular care",
      "The garden is only useful for Science lessons",
      "The garden should not involve the community",
    ],
    answer: 1,
  },
]

const shortAnswers: ShortAnswer[] = [
  {
    question:
      "Explain TWO ways a community garden could help Grade 5 students learn.",
    answer:
      "A community garden could help Grade 5 students learn about plant growth and healthy eating. It could also teach responsibility because students would need to care for the plants regularly.",
  },
  {
    question:
      "Identify ONE possible problem with the garden project and suggest a solution.",
    answer:
      "One problem is that the plants may not be watered during weekends. A solution is to create a schedule where parents, teachers, or community volunteers take turns helping.",
  },
]

export default function PerformanceDifficult1Page() {
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
                Grade 5 Performance Task Difficult 1
              </CardTitle>
              <p className="text-slate-600">Topic: Community Garden Project</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Task Scenario
                </h3>
                <p className="text-slate-700">
                  Your school and community are considering starting a community
                  garden. The garden would be used to teach students, support
                  healthy eating, and make better use of unused land. Read the
                  information, answer the questions, and complete the writing
                  task.
                </p>
              </div>

              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  Skills Practised
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating benefits and challenges</li>
                  <li>Communication: explaining ideas with clear reasons</li>
                  <li>Collaboration: planning shared responsibilities</li>
                  <li>Creativity: suggesting practical improvements</li>
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
                Grade 5 Performance Task Difficult 1
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
                  This difficult task requires careful reading, evaluation of
                  evidence, and strong reasoning. Review the sample responses to
                  see how clear explanations, practical solutions, and evidence
                  from the source can strengthen your answers.
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
                  Dear Community Committee,

                  I believe the community garden project is a valuable idea
                  because it can help students learn while also supporting
                  families. Students can learn about plant growth, healthy
                  eating, teamwork, and responsibility by helping to care for
                  the garden.

                  However, the project will need careful planning. One possible
                  problem is that the garden may not be watered during weekends
                  or holidays. To solve this, the school could create a schedule
                  for students, parents, teachers, and community volunteers to
                  help care for the plants.

                  The garden could also become a creative learning space.
                  Students could design signs, keep plant journals, and share
                  vegetables with families when crops are ready. For these
                  reasons, I think the community garden would be a helpful and
                  meaningful project.

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
              <h1 className="font-bold">Grade 5 Performance Task Difficult 1</h1>
              <p className="text-sm text-slate-200">
                Community Garden Project
              </p>
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
                A school in the community has an unused piece of land near the
                back of the compound. Some teachers and parents suggested that
                the land could be used to create a community garden.
              </p>

              <p>
                The garden could grow vegetables, herbs, and small fruit plants.
                Students could use the garden during Science, Mathematics, and
                Language Arts lessons. For example, they could measure plant
                growth, write observation reports, and learn about healthy
                foods.
              </p>

              <p>
                Some people support the idea because it could provide fresh
                vegetables for families and teach students useful life skills.
                Others are concerned that the garden may require too much time,
                water, and supervision, especially during weekends and holidays.
              </p>

              <p>
                To succeed, the project would need careful planning, shared
                responsibilities, and support from students, teachers, parents,
                and community volunteers.
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
                Write a letter to the community committee explaining whether the
                school should start the community garden. Use evidence from the
                source, explain at least TWO benefits, identify ONE possible
                problem, and suggest ONE solution.
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
