import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ClipboardList,
  ArrowLeft,
  Search,
  FileEdit,
  Lightbulb,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const topics = [
  {
    title: "Research Skills",
    description:
      "Learn how to find, read, and use information from different sources.",
    icon: Search,
    href: "/performance-tasks/research",
  },
  {
    title: "Writing Tasks",
    description:
      "Practice writing reports, letters, and responses based on given scenarios.",
    icon: FileEdit,
    href: "/performance-tasks/writing-tasks",
  },
  {
    title: "Critical Thinking",
    description:
      "Develop skills to analyze information and make logical conclusions.",
    icon: Lightbulb,
    href: "/performance-tasks/critical-thinking",
  },
  {
    title: "Task Completion",
    description:
      "Practice completing multi-step tasks within time limits.",
    icon: CheckCircle,
    href: "/performance-tasks/task-completion",
  },
]

export const metadata = {
  title: "Grade 5 PEP Performance Tasks",
  description:
    "Grade 5 PEP Performance Task practice to build reading, reasoning, and writing skills.",
}

export default function PerformanceTasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-light/30 to-gold-light/20">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold to-gold-light text-navy py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Performance Tasks
              </h2>
              <p className="text-navy/70">
                Apply your skills to real-world Grade 5 scenarios
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 text-navy hover:bg-sky-light/30 hover:text-navy-light"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Introduction */}
        <Card className="mb-8 border-gold/30 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-navy">
              About Performance Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">
              Performance Tasks are an important part of the Grade 5 PEP
              preparation process. These tasks test your ability to apply what
              you have learned in Language Arts and Mathematics to solve
              real-world problems. You will read information, think critically,
              and complete activities that show your understanding. The content
              is aligned with the National Standards Curriculum (NSC).
            </p>
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card className="mb-8 border-gold/30 bg-gold-light/30">
          <CardHeader>
            <CardTitle className="text-navy">What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-gold">1.</span>
                <span>
                  <strong className="text-navy">
                    Language Arts Performance Task:
                  </strong>{" "}
                  Read passages and complete reading, writing, and research
                  activities.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-gold">2.</span>
                <span>
                  <strong className="text-navy">
                    Mathematics Performance Task:
                  </strong>{" "}
                  Solve multi-step problems using real-life situations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-gold">3.</span>
                <span>
                  <strong className="text-navy">Timed Tasks:</strong> Practice
                  working within time limits to build confidence.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Topics */}
        <h3 className="mb-6 text-xl font-semibold text-navy">
          Skills to Practice
        </h3>

        <div className="mb-10 grid gap-6 md:grid-cols-2">
          {topics.map((topic) => {
            const Icon = topic.icon
            return (
              <Card
                key={topic.title}
                className="border-gold/20 transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light text-navy">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg text-navy">
                      {topic.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {topic.description}
                  </CardDescription>

                  <Link href={topic.href}>
                    <Button className="mt-4 bg-gold text-navy hover:bg-gold/80">
                      Start Practice
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <Card className="border-gold/30 bg-gold-light/30">
          <CardHeader>
            <CardTitle className="text-navy">
              Ready for a Mock Test?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-foreground">
              Test your knowledge with a full practice examination that covers
              all Performance Tasks topics.
            </p>

            <Link href="/mock-tests/performance/language-arts">
              <Button className="bg-gold text-navy hover:bg-gold/80">
                Start Sample Task
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
