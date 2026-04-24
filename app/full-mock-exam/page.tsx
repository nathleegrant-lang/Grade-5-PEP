"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, Calculator, FlaskConical, Globe, Play, Trophy } from "lucide-react"
import Link from "next/link"

const examSections = [
  {
    id: "language-arts",
    title: "Language Arts",
    icon: BookOpen,
    color: "bg-blue-500",
    duration: "45 minutes",
    questions: 15,
    description: "Reading comprehension, vocabulary, grammar, and writing"
  },
  {
    id: "mathematics",
    title: "Mathematics",
    icon: Calculator,
    color: "bg-orange-500",
    duration: "60 minutes",
    questions: 20,
    description: "Number operations, measurement, geometry, and statistics"
  },
  {
    id: "science",
    title: "Science",
    icon: FlaskConical,
    color: "bg-green-500",
    duration: "45 minutes",
    questions: 20,
    description: "Living things, matter, energy, and Earth science"
  },
  {
    id: "social-studies",
    title: "Social Studies",
    icon: Globe,
    color: "bg-purple-500",
    duration: "45 minutes",
    questions: 20,
    description: "Geography, history, civics, and Jamaican culture"
  }
]

export default function FullMockExamPage() {
  const [examStarted, setExamStarted] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Full PEP Mock Examination</h1>
                <p className="text-purple-200">Complete practice exam covering all subjects</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Exam Overview */}
          <Card className="mb-8 border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-[#1e3a5f]">Examination Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">4</p>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">75</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">3.25</p>
                  <p className="text-sm text-gray-600">Hours Total</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">60%</p>
                  <p className="text-sm text-gray-600">Pass Mark</p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">Important Instructions</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>- Complete each section within the allocated time</li>
                  <li>- Read each question carefully before answering</li>
                  <li>- You can take breaks between sections</li>
                  <li>- Your progress will be saved automatically</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subject Sections */}
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Exam Sections</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {examSections.map((section) => (
              <Card key={section.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1e3a5f] mb-1">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {section.duration}
                        </Badge>
                        <span className="text-gray-500">{section.questions} questions</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/${section.id}/mock-test`}>
                    <Button className="w-full mt-4 bg-[#0d4a5f] hover:bg-[#0a3d4e]">
                      <Play className="w-4 h-4 mr-2" />
                      Start Section
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start */}
          <Card className="border-2 border-[#0d9488]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Ready to Begin?</h3>
                  <p className="text-gray-600">
                    Start with any section and work through all four subjects at your own pace.
                  </p>
                </div>
                <Link href="/language-arts/mock-test">
                  <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Play className="w-5 h-5 mr-2" />
                    Start with Language Arts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
