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
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface ResearchQuestion {
  id: number
  scenario: string
  source?: { title: string; content: string }
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const researchQuestions: ResearchQuestion[] = [
  {
    id: 1,
    scenario:
      "Your teacher asks you to find information about Jamaica's national bird.",
    question: "Which would be the BEST source to find accurate information?",
    options: [
      "A social media post from a friend",
      "The Jamaica Information Service website",
      "A cartoon about birds",
      "A video game about animals",
    ],
    correctAnswer: 1,
    explanation:
      "Official government websites provide accurate, reliable information about national symbols.",
  },
  {
    id: 2,
    scenario: "You need to write a report about hurricanes in Jamaica.",
    source: {
      title: "Jamaica's Hurricane Season",
      content:
        "Jamaica's official hurricane season runs from June 1 to November 30. The country has experienced several major hurricanes. The Office of Disaster Preparedness and Emergency Management helps Jamaicans prepare for storms.",
    },
    question: "According to the passage, when does hurricane season in Jamaica begin?",
    options: ["January 1", "June 1", "September 1", "November 30"],
    correctAnswer: 1,
    explanation:
      "The passage states that Jamaica's official hurricane season begins on June 1.",
  },
  {
    id: 3,
    scenario:
      "You are reading a book about Jamaican heroes for a school project.",
    source: {
      title: "Marcus Garvey - National Hero",
      content:
        "Marcus Mosiah Garvey was born in St. Ann's Bay, Jamaica. He founded the Universal Negro Improvement Association and inspired many people around the world. He is one of Jamaica's National Heroes.",
    },
    question: "What is a fact you can find in this passage?",
    options: [
      "Marcus Garvey was the best leader ever",
      "Everyone loved Marcus Garvey",
      "Marcus Garvey was born in St. Ann's Bay",
      "Marcus Garvey's birthday should be a holiday",
    ],
    correctAnswer: 2,
    explanation:
      "A fact can be proven true. The passage states that Marcus Garvey was born in St. Ann's Bay.",
  },
  {
    id: 4,
    scenario:
      "You want to learn about traditional Jamaican foods for a cultural presentation.",
    question: "What is the FIRST step in doing research?",
    options: [
      "Start writing your presentation immediately",
      "Decide what specific questions you want to answer",
      "Copy information from the first website you find",
      "Ask a friend what they think",
    ],
    correctAnswer: 1,
    explanation:
      "Good research starts with deciding what questions you need to answer.",
  },
  {
    id: 5,
    scenario:
      "You found two sources about the Blue Mountains. One is from a travel blog, and one is from a respected educational publication.",
    question:
      "Which source is more likely to have accurate, well-researched information?",
    options: [
      "The travel blog because it is more fun to read",
      "The educational publication because it is more likely to be checked by editors or experts",
      "Both are always equally reliable",
      "Neither can ever be trusted",
    ],
    correctAnswer: 1,
    explanation:
      "A respected educational publication is usually more reliable because information is more likely to be checked before publishing.",
  },
  {
    id: 6,
    scenario:
      "You are taking notes from an encyclopedia article about Jamaican music.",
    question: "What is the best way to record information from a source?",
    options: [
      "Copy everything word for word",
      "Write the main ideas in your own words and note where you found them",
      "Only remember it in your head",
      "Take a photo and forget about it",
    ],
    correctAnswer: 1,
    explanation:
      "Writing main ideas in your own words shows understanding. Recording the source helps you give credit.",
  },
  {
    id: 7,
    scenario:
      "You are using a book about Jamaica and want to find information about traditional music and dances.",
    source: {
      title: "Table of Contents",
      content:
        "Chapter 1: Jamaica's Geography... page 5\nChapter 2: Jamaica's History... page 23\nChapter 3: Jamaica's Government... page 45\nChapter 4: Jamaica's Culture... page 67\nChapter 5: Jamaica's Economy... page 89",
    },
    question: "Which chapter would most likely have this information?",
    options: [
      "Chapter 1: Geography",
      "Chapter 2: History",
      "Chapter 4: Culture",
      "Chapter 5: Economy",
    ],
    correctAnswer: 2,
    explanation:
      "Traditional music and dances are part of culture, so Chapter 4 is the best place to look.",
  },
  {
    id: 8,
    scenario: "Your assignment is to compare two Jamaican parishes.",
    question: "What kind of information would be most useful for a comparison?",
    options: [
      "Your personal feelings about each parish",
      "Facts such as population, size, main industries, and landmarks",
      "Which parish sounds nicer",
      "Made-up information",
    ],
    correctAnswer: 1,
    explanation:
      "A good comparison uses facts and data that can be checked, such as population, size, industries, and landmarks.",
  },
]

export default function ResearchSkillsPage() {
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  const question = researchQuestions[currentQuestion]

  const handleAnswerSelect = (index: number) => {
    if (showResult) return

    setSelectedAnswer(index)
    setShowResult(true)

    if (index === question.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < researchQuestions.length - 1) {
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Search className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Research Skills
            </h2>
            <p className="text-gray-600">
              Learn to find, evaluate, and use information.
            </p>
          </div>
        </div>

        {!started && (
          <div className="space-y-6">
            <Card className="border-amber-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  What are Research Skills?
                </CardTitle>
                <CardDescription>
                  Important skills for Grade 5 Performance Tasks.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Research skills help you find accurate information,
                  understand what you read, and use that information to complete
                  tasks. In Grade 5 PEP Performance Tasks, you may need to read
                  sources and answer questions based on what you learn.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-amber-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-amber-800">
                      <BookOpen className="h-4 w-4" />
                      Types of Sources
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li>Books and encyclopedias</li>
                      <li>Official websites</li>
                      <li>News articles</li>
                      <li>Interviews with experts</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-sky-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-sky-800">
                      <Search className="h-4 w-4" />
                      Research Steps
                    </h4>
                    <ul className="space-y-1 text-sm text-emerald-700">
                      <li>1. Identify your question</li>
                      <li>2. Find reliable sources</li>
                      <li>3. Read and take notes</li>
                      <li>4. Use information correctly</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => setStarted(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  Start Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="h-5 w-5" />
                  Research Tips
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>1. Check if a source is reliable before using it.</li>
                  <li>2. Look for facts, not only opinions.</li>
                  <li>3. Use headings, contents, and indexes to find details.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {started && !quizComplete && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Badge className="bg-amber-500">Research Skills</Badge>
              <span className="text-gray-600">
                Question {currentQuestion + 1} of {researchQuestions.length}
              </span>
            </div>

            <Progress
              value={(currentQuestion / researchQuestions.length) * 100}
              className="mb-6 h-3"
            />

            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-800">
                    Research Question
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="border-amber-600 text-amber-600"
                  >
                    Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-medium text-blue-800">Scenario:</p>
                  <p className="text-blue-700">{question.scenario}</p>
                </div>

                {question.source && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-2 font-medium text-gray-800">
                      {question.source.title}
                    </p>
                    <p className="whitespace-pre-line text-sm text-gray-700">
                      {question.source.content}
                    </p>
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
                        "border-gray-200 hover:border-amber-400 hover:bg-amber-50"
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
                        ? "Correct!"
                        : "Not quite."}
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
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {currentQuestion < researchQuestions.length - 1
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
            <Card className="border-amber-200 text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                  <Trophy className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-slate-800">
                  Well Done!
                </CardTitle>
                <CardDescription>
                  You completed the Research Skills practice.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-5xl font-bold text-amber-500">
                  {score}/{researchQuestions.length}
                </div>

                <p className="text-gray-600">
                  {score === researchQuestions.length
                    ? "Perfect! You are a research expert!"
                    : score >= researchQuestions.length * 0.8
                      ? "Excellent! You know how to find and use information!"
                      : score >= researchQuestions.length * 0.6
                        ? "Good job! Keep practising your research skills."
                        : "Keep trying! Research skills improve with practice."}
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={resetQuiz}
                    className="bg-amber-500 hover:bg-amber-600"
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
