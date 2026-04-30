import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WelcomeCard } from "@/components/welcome-card"
import { HowToUse } from "@/components/how-to-use"
import { SubjectCards } from "@/components/subject-cards"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, FileText, ClipboardCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <HeroSection />

        <section className="max-w-5xl mx-auto px-4 pt-8">
         <div className="grid gap-5 md:grid-cols-3 items-stretch">
    <div className="md:col-span-1">
      <WelcomeCard />
    </div>
           <div className="md:col-span-2 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
            <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/images/student_withworksheet.jpg"
                alt="Grade 5 student practising online PEP questions on a laptop"
                width={200}
                height={400}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="grid gap-6">
              <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/images/parent-support-section.jpg"
                  alt="Parent supporting child while reviewing online PEP progress"
                  width={100}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>

              <HowToUse />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
              
          <SubjectCards />

          <section>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                Learning That Feels Real and Supportive
              </h2>
              <p className="text-gray-600">
                Students can practise online, complete worksheets, and review progress with family support.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/images/home/student_inclass1.png"
                alt="Jamaican students using laptops for online PEP practice in class"
                width={700}
                height={200}
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2 text-center">
              More Practice Resources
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Additional tools to help you prepare for the PEP examination
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/writing-practice">
                <Card className="border-2 border-gray-200 hover:border-[#0d9488] hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <PenTool className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                      Writing Practice
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Performance task writing prompts with hints and marking rubrics
                    </p>
                    <Button className="bg-[#0d9488] hover:bg-[#0b7c7b] text-white w-full">
                      Start Writing
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/worksheets">
                <Card className="border-2 border-gray-200 hover:border-[#f59e0b] hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                      Printable Worksheets
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Download and print worksheets for offline practice
                    </p>
                    <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white w-full">
                      View Worksheets
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/full-mock-exam">
                <Card className="border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <ClipboardCheck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                      Full Mock Exam
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Complete PEP-style examination covering all subjects
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                      Take Full Exam
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        </div>

        <ColorBar />
      </main>

      <Footer />
    </div>
  )
}
