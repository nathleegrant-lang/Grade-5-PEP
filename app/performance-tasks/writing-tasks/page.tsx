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
  FileEdit,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface WritingTask {
  id: number
  title: string
  type: "response" | "report" | "letter" | "explanation"
  source: {
    title: string
    content: string
  }
  prompt: string
  guidelines: string[]
  checklist: string[]
  wordRange: { min: number; max: number }
}

const writingTasks: WritingTask[] = [
  {
    id: 1,
    title: "Responding to a Passage",
    type: "response",
    source: {
      title: "The Importance of Trees",
      content:
        "Trees are very important to our environment. They provide oxygen for us to breathe by taking in carbon dioxide and releasing oxygen. Trees also give shade and help keep the air cool. Many animals make their homes in trees, including birds and insects. Trees can also prevent soil erosion by holding the soil together with their roots. In Jamaica, the Blue Mahoe is our national tree.",
    },
    prompt:
      "Based on the passage, explain THREE ways that trees help the environment. Use information from the passage in your answer.",
    guidelines: [
      "Read the passage carefully before writing",
      "Find THREE different ways trees help",
      "Use your own words but include facts from the passage",
      "Write in complete sentences",
    ],
    checklist: [
      "I mentioned that trees provide oxygen",
      "I mentioned that trees provide shade or cool air",
      "I mentioned that trees are homes for animals",
      "I mentioned that trees prevent soil erosion",
      "I wrote in complete sentences",
      "I used information from the passage",
    ],
    wordRange: { min: 50, max: 100 },
  },
  {
    id: 2,
    title: "Writing a Report",
    type: "report",
    source: {
      title: "Survey Results: Favourite School Subjects",
      content:
        "A survey of 100 Grade 5 students was conducted to find their favourite school subjects.\n\nResults:\n- Mathematics: 35 students\n- Language Arts: 25 students\n- Science: 20 students\n- Social Studies: 12 students\n- Physical Education: 8 students",
    },
    prompt:
      "Write a short report about the survey results. Include which subject is most popular, which is least popular, and what you notice about the results.",
    guidelines: [
      "Start with a sentence introducing what the survey was about",
      "State the most popular subject and how many students chose it",
      "State the least popular subject",
      "Write one observation about the data",
      "End with a concluding sentence",
    ],
    checklist: [
      "I introduced the survey topic",
      "I stated the most popular subject",
      "I stated the least popular subject",
      "I made an observation about the data",
      "I included numbers from the survey",
      "I wrote a concluding sentence",
    ],
    wordRange: { min: 60, max: 120 },
  },
  {
    id: 3,
    title: "Writing to Persuade",
    type: "letter",
    source: {
      title: "School Recycling Program",
      content:
        "Your school is considering starting a recycling program. The program would involve placing recycling bins in classrooms for paper and plastic. Students would be responsible for sorting their waste. The school hopes this will reduce the amount of garbage sent to landfills and teach students about protecting the environment.",
    },
    prompt:
      "Write a letter to your principal explaining why you think the recycling program is a good idea. Give at least TWO reasons to support your opinion.",
    guidelines: [
      "Start with a proper greeting",
      "State your opinion clearly",
      "Give at least two reasons to support your opinion",
      "End with a proper closing",
      "Remember to sign your name",
    ],
    checklist: [
      "I used a proper greeting",
      "I clearly stated my opinion",
      "I gave at least two reasons",
      "I explained why recycling is important",
      "I used a proper closing",
      "I signed my name",
    ],
    wordRange: { min: 70, max: 130 },
  },
  {
    id: 4,
    title: "Explaining a Process",
    type: "explanation",
    source: {
      title: "How Plants Grow",
      content:
        "Plants need sunlight, water, soil, and air to grow. A seed is planted in soil. When the seed gets water and warmth, it begins to sprout. The roots grow down into the soil to get water and nutrients. The stem grows up toward the light. Leaves appear and use sunlight to make food for the plant through photosynthesis. If the plant gets everything it needs, it will continue to grow and may produce flowers or fruit.",
    },
    prompt:
      "Using information from the passage, explain the steps of how a plant grows from a seed. Write the steps in order.",
    guidelines: [
      "Start by mentioning what plants need to grow",
      "Describe what happens first",
      "Explain what happens next in order",
      "Use sequence words such as first, then, next, and finally",
      "End by explaining what happens when the plant has what it needs",
    ],
    checklist: [
      "I mentioned what plants need",
      "I explained that the seed is planted first",
      "I described the roots growing down",
      "I described the stem growing up",
      "I mentioned leaves and photosynthesis",
      "I used sequence words",
      "My steps are in the correct order",
    ],
    wordRange: { min: 60, max: 120 },
  },
]

const taskTypeColors: Record<string, string> = {
  response: "bg-blue-500",
  report: "bg-sky-500",
  letter: "bg-amber-500",
  explanation: "bg-purple-500",
}

export default function WritingTasksPage() {
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null)
  const [userWriting, setUserWriting] = useState("")
  const [showChecklist, setShowChecklist] = useState(false)
  const [checklistItems, setChecklistItems] = useState<boolean[]>([])
  const [submitted, setSubmitted] = useState(false)

  const wordCount = userWriting.trim()
    ? userWriting.trim().split(/\s+/).length
    : 0

  const handleSelectTask = (task: WritingTask) => {
    setSelectedTask(task)
    setUserWriting("")
    setShowChecklist(false)
    setChecklistItems([])
    setSubmitted(false)
  }

  const handleSubmit = () => {
    if (selectedTask) {
      setShowChecklist(true)
      setChecklistItems(new Array(selectedTask.checklist.length).fill(false))
      setSubmitted(true)
    }
  }

  const toggleChecklistItem = (index: number) => {
    const newItems = [...checklistItems]
    newItems[index] = !newItems[index]
    setChecklistItems(newItems)
  }

  const handleReset = () => {
    setUserWriting("")
    setShowChecklist(false)
    setChecklistItems([])
    setSubmitted(false)
  }

  const goToTaskSelection = () => {
    setSelectedTask(null)
    handleReset()
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <FileEdit className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Writing Tasks
            </h2>
            <p className="text-gray-600">
              Practice writing responses based on given information.
            </p>
          </div>
        </div>

        {!selectedTask && (
          <div className="space-y-6">
            <Card className="border-sky-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Choose a Writing Task
                </CardTitle>
                <CardDescription>
                  Select a task to practise your Grade 5 writing skills.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {writingTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={`rounded-lg p-6 text-left text-white transition-transform hover:scale-105 ${taskTypeColors[task.type]}`}
                    >
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-white/20 text-white"
                      >
                        {task.type.charAt(0).toUpperCase() +
                          task.type.slice(1)}
                      </Badge>
                      <h3 className="mb-2 text-xl font-bold">{task.title}</h3>
                      <p className="text-sm text-white/90">
                        {task.wordRange.min}-{task.wordRange.max} words
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-sky-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="h-5 w-5" />
                  Writing Task Tips
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>1. Read the source material carefully.</li>
                  <li>2. Answer all parts of the question.</li>
                  <li>3. Use information from the passage.</li>
                  <li>4. Check spelling, punctuation, and sentence structure.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTask && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge className={taskTypeColors[selectedTask.type]}>
                {selectedTask.type.charAt(0).toUpperCase() +
                  selectedTask.type.slice(1)}
              </Badge>
              <h3 className="text-xl font-bold text-slate-800">
                {selectedTask.title}
              </h3>
            </div>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <BookOpen className="h-5 w-5" />
                  Read This First
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-bold text-blue-800">
                    {selectedTask.source.title}
                  </h4>
                  <p className="whitespace-pre-line text-blue-700">
                    {selectedTask.source.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Your Task</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-lg font-medium text-gray-700">
                  {selectedTask.prompt}
                </p>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-800">
                    Guidelines:
                  </h4>
                  <ul className="space-y-1">
                    {selectedTask.guidelines.map((guideline, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="font-bold text-sky-500">
                          {index + 1}.
                        </span>
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-200">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-slate-800">
                    Your Writing
                  </CardTitle>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        wordCount >= selectedTask.wordRange.min &&
                        wordCount <= selectedTask.wordRange.max
                          ? "text-sky-600"
                          : wordCount > selectedTask.wordRange.max
                            ? "text-amber-600"
                            : "text-gray-500"
                      }`}
                    >
                      {wordCount} / {selectedTask.wordRange.min}-
                      {selectedTask.wordRange.max} words
                    </span>

                    <Progress
                      value={Math.min(
                        (wordCount / selectedTask.wordRange.max) * 100,
                        100
                      )}
                      className="h-2 w-24"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Textarea
                  value={userWriting}
                  onChange={(e) => setUserWriting(e.target.value)}
                  placeholder="Start writing your response here..."
                  className="min-h-[200px] text-lg leading-relaxed"
                  disabled={submitted}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goToTaskSelection}>
                    Choose Different Task
                  </Button>

                  {!submitted ? (
                    <Button
                      onClick={handleSubmit}
                      className="bg-slate-700 hover:bg-slate-800"
                      disabled={wordCount < selectedTask.wordRange.min}
                    >
                      Submit for Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleReset} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Write Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {showChecklist && (
              <Card className="border-sky-200 bg-sky-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <CheckCircle className="h-5 w-5" />
                    Self-Assessment: Check Your Work
                  </CardTitle>
                  <CardDescription>
                    Review your writing and check each item you included.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {selectedTask.checklist.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleChecklistItem(index)}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors ${
                        checklistItems[index]
                          ? "border-sky-500 bg-sky-100"
                          : "border-gray-200 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          checklistItems[index]
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {checklistItems[index] && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>

                      <span
                        className={
                          checklistItems[index]
                            ? "text-sky-800"
                            : "text-gray-700"
                        }
                      >
                        {item}
                      </span>
                    </button>
                  ))}

                  <div className="border-t border-sky-200 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sky-800">
                        You checked {checklistItems.filter(Boolean).length} of{" "}
                        {selectedTask.checklist.length} items
                      </p>

                      {checklistItems.filter(Boolean).length ===
                        selectedTask.checklist.length && (
                        <Badge className="bg-sky-500">Complete!</Badge>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-emerald-700">
                      {checklistItems.filter(Boolean).length ===
                      selectedTask.checklist.length
                        ? "Excellent! Your writing includes all the important elements."
                        : "Look at the unchecked items to see what you might add or improve."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
