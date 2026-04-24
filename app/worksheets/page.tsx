"use client"

import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Printer, BookOpen, Calculator, FlaskConical, Globe, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const worksheets = [
  {
    subject: "Language Arts",
    icon: BookOpen,
    color: "bg-blue-500",
    sheets: [
      { title: "Reading Comprehension - The Jamaican Market", level: "Easy", pages: 2 },
      { title: "Vocabulary Building - Synonyms & Antonyms", level: "Medium", pages: 2 },
      { title: "Grammar Practice - Subject-Verb Agreement", level: "Medium", pages: 3 },
      { title: "Writing Practice - Narrative Prompts", level: "Hard", pages: 2 },
      { title: "Parts of Speech Review", level: "Easy", pages: 2 },
    ]
  },
  {
    subject: "Mathematics",
    icon: Calculator,
    color: "bg-orange-500",
    sheets: [
      { title: "Number Operations - BODMAS Practice", level: "Medium", pages: 3 },
      { title: "Fractions & Decimals Workbook", level: "Hard", pages: 4 },
      { title: "Measurement Conversions", level: "Medium", pages: 2 },
      { title: "Geometry - Area & Perimeter", level: "Medium", pages: 3 },
      { title: "Word Problems Practice", level: "Hard", pages: 3 },
    ]
  },
  {
    subject: "Science",
    icon: FlaskConical,
    color: "bg-green-500",
    sheets: [
      { title: "Living Things - Food Chains & Webs", level: "Easy", pages: 2 },
      { title: "States of Matter Worksheet", level: "Medium", pages: 2 },
      { title: "Energy & Forces Review", level: "Medium", pages: 3 },
      { title: "Human Body Systems", level: "Hard", pages: 3 },
      { title: "The Water Cycle", level: "Easy", pages: 2 },
    ]
  },
  {
    subject: "Social Studies",
    icon: Globe,
    color: "bg-purple-500",
    sheets: [
      { title: "Jamaica's 14 Parishes Map Activity", level: "Easy", pages: 2 },
      { title: "National Heroes of Jamaica", level: "Medium", pages: 3 },
      { title: "Government & Civics Review", level: "Hard", pages: 2 },
      { title: "Caribbean History Timeline", level: "Medium", pages: 3 },
      { title: "Jamaican Culture & Traditions", level: "Easy", pages: 2 },
    ]
  }
]

export default function WorksheetsPage() {
  const { isPremium } = useAuth()

  const handlePrint = (sheetTitle: string) => {
    if (!isPremium) {
      alert("Upgrade to Premium to download and print worksheets!")
      return
    }
    // In a real implementation, this would generate/open a PDF
    alert(`Preparing "${sheetTitle}" for printing... \n\nIn the full version, this would generate a printable PDF worksheet.`)
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Printable Worksheets</h1>
                <p className="text-teal-200">Practice offline with these worksheets</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Premium Banner */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0d9488]/10 border-2 border-[#f59e0b] rounded-lg p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f]">Premium Feature</h3>
                  <p className="text-gray-600">Printable worksheets are available for premium members. Upgrade to download and print all worksheets!</p>
                </div>
                <Link href="/pricing">
                  <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade - $1,000 JMD/month
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Introduction */}
          <Card className="mb-8 border-2 border-[#0d9488]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Printer className="w-8 h-8 text-[#0d9488] flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Practice Anytime, Anywhere</h2>
                  <p className="text-gray-600">
                    These printable worksheets allow you to practice without a computer. 
                    Print them out and work through the exercises at your own pace. 
                    Great for homework, revision, or extra practice before the PEP examination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Worksheets by Subject */}
          <div className="space-y-8">
            {worksheets.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center`}>
                    <subject.icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">{subject.subject}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subject.sheets.map((sheet, index) => (
                    <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className={`
                            ${sheet.level === "Easy" ? "text-green-600 border-green-300" : ""}
                            ${sheet.level === "Medium" ? "text-orange-600 border-orange-300" : ""}
                            ${sheet.level === "Hard" ? "text-red-600 border-red-300" : ""}
                          `}>
                            {sheet.level}
                          </Badge>
                          <span className="text-xs text-gray-500">{sheet.pages} pages</span>
                        </div>
                        <h3 className="font-semibold text-[#1e3a5f] mb-3 text-sm">
                          {sheet.title}
                        </h3>
                        <Button 
                          onClick={() => handlePrint(sheet.title)}
                          variant="outline" 
                          size="sm"
                          className={`w-full ${!isPremium ? "opacity-70" : ""}`}
                        >
                          {isPremium ? (
                            <Printer className="w-4 h-4 mr-2" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          {isPremium ? "Print Worksheet" : "Premium Only"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
