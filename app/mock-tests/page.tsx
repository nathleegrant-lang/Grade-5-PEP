import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getSubjectCatalog } from "@/lib/mock-catalog"

function getTotal(subject: "literacy" | "numeracy" | "performance") {
  const catalog = getSubjectCatalog(subject)
  return catalog.easy.length + catalog.moderate.length + catalog.difficult.length + catalog.mixed.length
}

export default function MockTestsPage() {
  const literacyTotal = getTotal("literacy")
  const numeracyTotal = getTotal("numeracy")
  const performanceTotal = getTotal("performance")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6">
            ← Back to Home
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">Grade 5 Mock Tests</h1>
            <p className="text-slate-600">
              Choose a subject to open its categories and dynamic numbered slots.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Literacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Reading, vocabulary, grammar, and writing practice for Grade 5.
                </p>
                <p className="text-sm font-medium text-slate-700">Current active test slots: {literacyTotal}</p>
                <Link href="/mock-tests/literacy">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">Open Literacy</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Numeracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Number operations, measurement, geometry, and data practice for Grade 5.
                </p>
                <p className="text-sm font-medium text-slate-700">Current active test slots: {numeracyTotal}</p>
                <Link href="/mock-tests/numeracy">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">Open Numeracy</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Source-based performance tasks with easy, moderate, difficult, and mixed levels.
                </p>
                <p className="text-sm font-medium text-slate-700">Current active task slots: {performanceTotal}</p>
                <Link href="/mock-tests/performance">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">Open Performance</Button>
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
