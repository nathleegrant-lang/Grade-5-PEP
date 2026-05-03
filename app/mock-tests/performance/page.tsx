import Link from "next/link"
import { BookOpen, Calculator } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Grade 5 PEP Performance Task Mock Tests",
  description:
    "Choose Language Arts or Mathematics performance tasks for Grade 5 PEP practice.",
}

export default function PerformanceCategoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/mock-tests"
            className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-800"
          >
            ← Back to Mock Tests
          </Link>

          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Performance Task Mock Tests
            </h1>
            <p className="text-slate-600">
              Choose a subject area to start child-friendly performance task practice.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
                  <BookOpen className="h-7 w-7 text-sky-600" />
                </div>
                <CardTitle className="text-slate-800">
                  Language Arts Performance Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Practice reading sources, finding evidence, and writing clear responses.
                </p>
                <Link href="/mock-tests/performance/language-arts">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Language Arts Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <Calculator className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-slate-800">
                  Mathematics Performance Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Solve real-world math problems and explain your thinking step by step.
                </p>
                <Link href="/mock-tests/performance/mathematics">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Mathematics Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
