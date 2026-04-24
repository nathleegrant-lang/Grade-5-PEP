import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Lightbulb, Target, TrendingUp } from "lucide-react"
import Image from "next/image"

const values = [
  {
    icon: Heart,
    title: "Uplift & Empower",
    description: "Providing resources that help young learners grow academically and build confidence in their abilities.",
    iconBg: "bg-[#0d9488]",
  },
  {
    icon: Lightbulb,
    title: "Inspire Learning",
    description: "Creating an interactive and supportive environment where students can explore and discover.",
    iconBg: "bg-[#f59e0b]",
  },
  {
    icon: Target,
    title: "Build Confidence",
    description: "Helping students practice and strengthen their skills to feel prepared for the PEP examination.",
    iconBg: "bg-[#0d9488]",
  },
  {
    icon: TrendingUp,
    title: "Reach Full Potential",
    description: "Supporting every student on their journey to academic success and personal growth.",
    iconBg: "bg-[#f59e0b]",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-[#0d4a5f] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              About the Creator
            </h1>
            <p className="text-lg text-teal-100">
              The story behind this learning platform
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Creator card */}
          <Card className="border-2 border-gray-200 mb-12">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <Image
                    src="/images/creator.jpg"
                    alt="Nathlee R. Grant - Creator of Grade 5 PEP"
                    width={350}
                    height={350}
                    className="rounded-lg shadow-lg object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
                  Nathlee R. Grant
                </h3>
                <p className="text-[#0d9488] italic mb-6">
                  &quot;Circumstances dictate the narrative, but choices determine the Outcome.&quot;
                </p>

                <div className="max-w-2xl space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    This AI-powered platform was created by <strong>Nathlee R. Grant</strong>, 
                    inspired by the message of encouragement and motivation shared through 
                    <strong> Shazonique&apos;s Inspirations</strong>. The vision behind this space is to 
                    uplift and empower young learners by providing resources that help them 
                    grow academically and confidently.
                  </p>
                  <p>
                    Through this AI-powered learning platform, students preparing for the 
                    <strong> Grade 5 PEP examination</strong> can practice, explore, and strengthen 
                    their skills in an interactive and supportive environment.
                  </p>
                  <p>
                    The goal is simple: <em>to inspire learning, build confidence, and help 
                    every student reach their full potential.</em>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value) => (
              <Card key={value.title} className="border border-gray-200">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${value.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <value.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e3a5f] mb-1">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
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
