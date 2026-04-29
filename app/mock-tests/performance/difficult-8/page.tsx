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
    "question": "What are non-communicable diseases (NCDs), according to the source?",
    "options": [
      "Diseases spread from person to person easily",
      "Diseases that develop over time, often linked to lifestyle choices",
      "Diseases caused only by pollution",
      "Diseases that affect only adults"
    ],
    "answer": 1
  },
  {
    "question": "Which evidence BEST supports the idea that schools are important for public health?",
    "options": [
      "Schools have large buildings",
      "Schools promote physical activity, nutrition, clean water, and safe environments",
      "Schools sell food",
      "Schools have many rooms"
    ],
    "answer": 1
  },
  {
    "question": "Why is promoting healthy habits among young people described as especially effective for reducing NCDs?",
    "options": [
      "Because young people run faster",
      "Because habits formed in childhood influence health throughout a person's life",
      "Because only children get NCDs",
      "Because adults cannot change their habits"
    ],
    "answer": 1
  },
  {
    "question": "Which group is identified as having the LEAST access to healthcare in Jamaica?",
    "options": [
      "Urban residents near hospitals",
      "Rural and lower-income communities",
      "Private school students",
      "Tourists"
    ],
    "answer": 1
  },
  {
    "question": "Which conclusion is BEST supported by the source?",
    "options": [
      "Good health is always guaranteed",
      "NCDs can be prevented entirely without effort",
      "Schools, communities, and government must work together to improve public health",
      "Diet has no effect on health"
    ],
    "answer": 2
  },
  {
    "question": "Which school initiative would MOST effectively contribute to better public health?",
    "options": [
      "Removing all sport from school",
      "Partnering with a local health centre to run regular health checks and nutrition workshops",
      "Only teaching health theory",
      "Selling sugary snacks at lunch"
    ],
    "answer": 1
  }
]

const shortAnswers: ShortAnswer[] = [
  {
    "question": "Explain TWO ways schools can contribute to better public health in their communities.",
    "answer": "Schools can promote physical activity through PE lessons and sports, which helps students maintain a healthy weight and reduce their risk of NCDs. Schools can also teach students about balanced nutrition so they make better food choices throughout their lives."
  },
  {
    "question": "Identify ONE challenge related to unequal healthcare access in Jamaica and suggest ONE way to address it.",
    "answer": "People in rural communities may have to travel long distances to see a doctor, meaning they delay treatment until they are very ill. Mobile health clinics that travel to rural areas could provide check-ups and basic care without requiring people to travel far."
  }
]

export default function PerformanceDifficult8Page() {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!started || showResults) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setShowResults(true); return 0 }
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
    mcqs.forEach((q, i) => { if (answers[i] === q.answer) total++ })
    setScore(total)
  }

  const handleSubmit = () => { calculateScore(); setShowResults(true) }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/performance">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Performance Task Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 text-center">
              <CardTitle className="text-2xl text-amber-800">Grade 5 Performance Task Difficult 8</CardTitle>
              <p className="text-slate-600">Topic: Public Health and Healthy Communities</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">Task Scenario</h3>
                <p className="text-slate-700">Jamaica faces several public health challenges including non-communicable diseases and poor access to healthcare in some areas. Read the source, evaluate the evidence, and complete all tasks.</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Skills Practised</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Critical Thinking: evaluating benefits and challenges</li>
                  <li>Communication: explaining ideas with clear reasons</li>
                  <li>Collaboration: planning shared responsibilities</li>
                  <li>Creativity: suggesting practical improvements</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">{mcqs.length}</p>
                  <p className="text-sm text-slate-600">Multiple Choice</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-amber-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>
              <Button onClick={() => setStarted(true)} className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600">Start Task</Button>
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
              <CardTitle className="text-2xl text-amber-800">Performance Task Completed</CardTitle>
              <p className="text-slate-600">Grade 5 Performance Task Difficult 8</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-amber-600">{score}/{mcqs.length}</p>
                <p className="mt-2 text-slate-600">Multiple-choice score</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">This difficult task requires careful reading, evaluation of evidence, and strong reasoning. Review the sample responses to see how clear explanations, practical solutions, and evidence from the source can strengthen your answers.</p>
              </div>
              <div className="space-y-4">
                {mcqs.map((q, index) => {
                  const correct = answers[index] === q.answer
                  return (
                    <div key={index} className={`rounded-lg border-2 p-4 ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-semibold text-slate-800">Question {index + 1}</p>
                          <p className="mt-1 text-slate-700">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: {answers[index] !== undefined ? q.options[answers[index]] : "Not answered"}</p>
                          <p className="text-sm text-green-700">Correct answer: {q.options[q.answer]}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 font-semibold text-blue-800">Sample Short Responses</h3>
                <div className="space-y-3">
                  {shortAnswers.map((item, index) => (
                    <div key={index} className="rounded bg-white p-3">
                      <p className="font-medium text-slate-800">{item.question}</p>
                      <p className="mt-1 text-sm text-slate-700">Sample answer: {item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Extended Writing Model Answer</h3>
                <p className="whitespace-pre-line text-slate-700">PROPOSAL: A SCHOOL HEALTH PROGRAMME FOR OUR COMMUNITY

TO: The Principal
FROM: A Grade 5 Student

INTRODUCTION
I am writing to propose the creation of a School Health Programme. Public health is one of the most pressing issues in Jamaica today. Non-communicable diseases such as diabetes and hypertension are responsible for a large proportion of deaths in our country, and many of these conditions are linked to habits formed during childhood. Our school has a unique opportunity — and responsibility — to help.

WHY PUBLIC HEALTH MATTERS
According to what I have studied, NCDs develop over time as a result of poor diet, inactivity, and unhealthy lifestyle choices. Schools that promote healthy habits can have a long-lasting impact on students' health and on the health of our wider community.

INITIATIVE 1: WEEKLY PHYSICAL ACTIVITY AND NUTRITION LESSONS
I propose that every class participate in a minimum of two structured physical activity sessions per week, combined with a monthly lesson on nutrition. Students who understand which foods nourish their bodies and who develop the habit of regular exercise are less likely to develop NCDs as adults. This initiative is low-cost and can be led by existing teachers with some professional development support.

INITIATIVE 2: SCHOOL-HEALTH CENTRE PARTNERSHIP
I recommend that our school partner with the nearest health centre to provide termly health checks for students. Trained nurses could visit the school to measure weight, check eyesight, and screen for common conditions. Catching problems early leads to better outcomes and teaches students the importance of regular check-ups.

Together, these two initiatives would make our school a centre for healthy living — benefiting not just students, but families and our whole community.

Respectfully submitted,
A Grade 5 Student</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-600"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={() => { setStarted(false); setShowResults(false); setAnswers([]); setScore(0); setTimeLeft(60 * 60) }} variant="outline" className="flex-1">Try Again</Button>
                <Link href="/mock-tests/performance" className="flex-1"><Button variant="outline" className="w-full">Back to Performance Tasks</Button></Link>
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
              <h1 className="font-bold">Grade 5 Performance Task Difficult 8</h1>
              <p className="text-sm text-slate-200">Public Health and Healthy Communities</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono">
              <Clock className="h-5 w-5" />{formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(answers.filter((a) => a !== undefined).length / mcqs.length) * 100} className="h-2" />
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-slate-700">
              <p>Public health refers to the efforts taken by governments, organisations, and communities to protect and improve the health of all people. In Jamaica, public health challenges include high rates of non-communicable diseases (NCDs) such as diabetes, hypertension, and heart disease, which are linked to poor diet, physical inactivity, and lifestyle choices.</p>
              <p>NCDs are responsible for a large proportion of deaths and hospitalisations in Jamaica. Unlike infectious diseases, NCDs are not passed from person to person. They develop over time, often as a result of habits formed from childhood. This means that promoting healthy habits among young people is one of the most effective strategies for reducing NCDs in the future.</p>
              <p>Access to healthcare is not equal across Jamaica. Rural communities and lower-income populations may have limited access to doctors, nurses, and health facilities. This means some people only seek help when they are already seriously ill, making treatment harder and more expensive.</p>
              <p>Schools can play a powerful role in public health by promoting physical activity, teaching nutrition, providing clean water and sanitation, and creating environments where students feel safe and supported. When schools partner with health organisations, the impact on communities can be significant and long-lasting.</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Multiple-Choice Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {mcqs.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-semibold text-slate-800">{qIndex + 1}. {q.question}</p>
                  <div className="grid gap-3">
                    {q.options.map((option, optionIndex) => (
                      <button key={optionIndex} onClick={() => handleSelect(qIndex, optionIndex)} className={`rounded-lg border-2 p-3 text-left transition ${answers[qIndex] === optionIndex ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300"}`}>
                        <span className="mr-2 font-bold text-amber-700">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-sky-200">
            <CardHeader className="bg-sky-50">
              <CardTitle className="text-sky-800">Short Response Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {shortAnswers.map((item, index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <p className="font-medium text-slate-800">{index + 1}. {item.question}</p>
                  <textarea className="mt-3 min-h-[90px] w-full rounded-lg border p-3 text-sm" placeholder="Write your answer here..." />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">Extended Writing Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">Write a proposal to your school principal recommending a School Health Programme. Explain WHY public health matters using evidence from the source, describe TWO specific health initiatives for the school, and explain how each would benefit students and the community.</p>
              <textarea className="min-h-[220px] w-full rounded-lg border p-3 text-sm" placeholder="Write your response here..." />
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full bg-amber-500 py-6 text-lg hover:bg-amber-600">Submit Task</Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
