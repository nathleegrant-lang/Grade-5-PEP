import Link from "next/link"
import { Calculator, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Grade 5 PEP Mathematics Performance Tasks",
  description: "Choose Easy, Moderate, Difficult, or Mixed Mathematics performance tasks.",
}

const difficulties = ["easy", "moderate", "difficult", "mixed"]

export default function MathematicsPerformanceTasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/performance">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Performance Tasks
          </Button>
        </Link>

        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-slate-800">
            Mathematics Performance Tasks
          </h1>
          <p className="text-slate-600">
            Choose a difficulty level, then select a task.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {difficulties.map((difficulty) => (
            <Card key={difficulty} className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <Calculator className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="capitalize text-slate-800">
                  {difficulty} Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <Link
                    key={i}
                    href={`/mock-tests/performance/mathematics/${difficulty}-${i + 1}`}
                  >
                    <Button variant="outline" className="w-full">
                      {i + 1}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
