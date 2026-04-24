"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PenTool, BookOpen, Lightbulb, CheckCircle, FileText, Printer } from "lucide-react"
import Link from "next/link"

const writingPrompts = [
  {
    id: 1,
    type: "Narrative",
    title: "A Day at Dunn's River Falls",
    prompt: "Write a story about a memorable trip to Dunn's River Falls in Jamaica. Describe what you saw, heard, and felt as you climbed the waterfall with your family or friends.",
    hints: [
      "Use descriptive words to paint a picture",
      "Include dialogue between characters",
      "Describe the water, rocks, and sounds",
      "Share your feelings throughout the adventure"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  },
  {
    id: 2,
    type: "Persuasive",
    title: "School Lunch Choices",
    prompt: "Your school is thinking about changing the lunch menu. Write a letter to your principal persuading them to include healthier Jamaican foods like ackee and saltfish, callaloo, or fresh fruits in the school cafeteria.",
    hints: [
      "State your opinion clearly at the beginning",
      "Give at least 3 reasons to support your view",
      "Use words like 'firstly', 'secondly', 'finally'",
      "End with a call to action"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  },
  {
    id: 3,
    type: "Expository",
    title: "How to Prepare for PEP",
    prompt: "Write an informational essay explaining to Grade 4 students how they can best prepare for the PEP examination. Share tips and strategies that will help them succeed.",
    hints: [
      "Start with an introduction about what PEP is",
      "Organize your tips in a logical order",
      "Give specific examples for each tip",
      "Write a conclusion with encouragement"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  },
  {
    id: 4,
    type: "Descriptive",
    title: "My Favourite National Hero",
    prompt: "Choose one of Jamaica's National Heroes and write a descriptive essay about them. Describe who they were, what they did for Jamaica, and why they are important to you.",
    hints: [
      "Include facts about when they lived",
      "Describe their achievements",
      "Explain why they are considered a hero",
      "Share why you chose this person"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  },
  {
    id: 5,
    type: "Narrative",
    title: "The Hurricane",
    prompt: "Write a story about experiencing a hurricane in Jamaica. Describe how your family prepared, what happened during the storm, and how your community came together afterwards.",
    hints: [
      "Build suspense as the storm approaches",
      "Use sensory details (sounds, sights, feelings)",
      "Show how characters help each other",
      "Include a hopeful ending"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  },
  {
    id: 6,
    type: "Persuasive",
    title: "Protecting Our Environment",
    prompt: "Write a persuasive essay convincing your classmates to help protect Jamaica's environment. Focus on one issue such as beach pollution, deforestation, or protecting coral reefs.",
    hints: [
      "Explain why this issue is important",
      "Give facts and examples",
      "Suggest actions students can take",
      "Make your readers care about the issue"
    ],
    wordCount: "150-200 words",
    timeLimit: "30 minutes"
  }
]

const rubric = [
  {
    category: "Ideas & Content",
    excellent: "Clear main idea with relevant, detailed supporting points",
    good: "Main idea present with some supporting details",
    developing: "Main idea unclear or lacking sufficient details",
    points: "10 points"
  },
  {
    category: "Organization",
    excellent: "Logical sequence with clear introduction, body, and conclusion",
    good: "Some organization with recognizable structure",
    developing: "Little organization, difficult to follow",
    points: "10 points"
  },
  {
    category: "Voice & Style",
    excellent: "Engaging, appropriate tone for audience and purpose",
    good: "Appropriate tone with some personality",
    developing: "Flat or inappropriate tone",
    points: "10 points"
  },
  {
    category: "Word Choice",
    excellent: "Vivid, precise vocabulary appropriate for Grade 5",
    good: "Adequate vocabulary with some variety",
    developing: "Limited or repetitive vocabulary",
    points: "10 points"
  },
  {
    category: "Conventions",
    excellent: "Correct spelling, grammar, and punctuation throughout",
    good: "Few errors that don't affect understanding",
    developing: "Many errors that interfere with meaning",
    points: "10 points"
  }
]

export default function WritingPracticePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<typeof writingPrompts[0] | null>(null)
  const [writing, setWriting] = useState("")
  const [showRubric, setShowRubric] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const handleWritingChange = (text: string) => {
    setWriting(text)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }

  const handlePrint = () => {
    window.print()
  }

  if (selectedPrompt) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <section className="bg-[#0d4a5f] text-white py-8">
            <div className="max-w-6xl mx-auto px-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 mb-4"
                onClick={() => {
                  setSelectedPrompt(null)
                  setWriting("")
                  setWordCount(0)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Prompts
              </Button>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#f59e0b] text-white">{selectedPrompt.type}</Badge>
                <Badge variant="outline" className="text-white border-white">{selectedPrompt.timeLimit}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedPrompt.title}</h1>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Writing Area */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                      <PenTool className="w-5 h-5" />
                      Your Writing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-700 font-medium">{selectedPrompt.prompt}</p>
                    </div>
                    
                    <Textarea
                      value={writing}
                      onChange={(e) => handleWritingChange(e.target.value)}
                      placeholder="Start writing your response here..."
                      className="min-h-[400px] text-base leading-relaxed"
                    />
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${
                          wordCount >= 150 && wordCount <= 200 
                            ? "text-green-600" 
                            : wordCount > 200 
                              ? "text-orange-600" 
                              : "text-gray-600"
                        }`}>
                          Word Count: {wordCount} / {selectedPrompt.wordCount}
                        </span>
                        {wordCount >= 150 && wordCount <= 200 && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <Button onClick={handlePrint} variant="outline" className="print:hidden">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hints & Rubric Sidebar */}
              <div className="space-y-6">
                <Card className="border-2 border-[#0d9488]">
                  <CardHeader className="bg-[#0d9488] text-white">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5" />
                      Writing Hints
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {selectedPrompt.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-white text-sm flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 text-sm">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Button 
                  onClick={() => setShowRubric(!showRubric)}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showRubric ? "Hide" : "Show"} Marking Rubric
                </Button>

                {showRubric && (
                  <Card className="border-2 border-[#f59e0b]">
                    <CardHeader className="bg-[#f59e0b] text-white">
                      <CardTitle className="text-lg">Marking Rubric (50 points)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {rubric.map((item) => (
                          <div key={item.category} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-[#1e3a5f] text-sm">{item.category}</span>
                              <Badge variant="outline">{item.points}</Badge>
                            </div>
                            <div className="text-xs space-y-1">
                              <p><span className="text-green-600 font-medium">Excellent:</span> {item.excellent}</p>
                              <p><span className="text-blue-600 font-medium">Good:</span> {item.good}</p>
                              <p><span className="text-orange-600 font-medium">Developing:</span> {item.developing}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <ColorBar />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-[#0d4a5f] text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#f59e0b] flex items-center justify-center">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Writing Practice</h1>
                <p className="text-teal-200">Performance Task Writing Prompts</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Introduction */}
          <Card className="mb-8 border-2 border-[#0d9488]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-[#0d9488] flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">About Performance Task Writing</h2>
                  <p className="text-gray-600 mb-3">
                    In the PEP examination, you will be asked to write responses to real-world scenarios. 
                    These writing tasks test your ability to communicate ideas clearly, organize your thoughts, 
                    and use proper grammar and vocabulary.
                  </p>
                  <p className="text-gray-600">
                    Practice with these prompts to build your writing skills. Each prompt includes helpful hints 
                    and a rubric so you can understand how your writing will be marked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Prompts Grid */}
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Choose a Writing Prompt</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {writingPrompts.map((prompt) => (
              <Card 
                key={prompt.id}
                className="border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-[#0d9488]"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`
                      ${prompt.type === "Narrative" ? "bg-blue-500" : ""}
                      ${prompt.type === "Persuasive" ? "bg-orange-500" : ""}
                      ${prompt.type === "Expository" ? "bg-green-500" : ""}
                      ${prompt.type === "Descriptive" ? "bg-purple-500" : ""}
                    `}>
                      {prompt.type}
                    </Badge>
                    <span className="text-sm text-gray-500">{prompt.timeLimit}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{prompt.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{prompt.prompt}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#0d9488]">
                    <PenTool className="w-4 h-4" />
                    <span>{prompt.wordCount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
