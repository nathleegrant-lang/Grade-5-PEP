import Link from "next/link"
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  FileText,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MockTestsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-800"
          >
            ← Back to Home
          </Link>

          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-slate-800">
              Grade 5 Mock Tests
            </h1>
            <p className="text-slate-600">
              Choose a subject or performance task area to begin practice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
                  <BookOpen className="h-7 w-7 text-sky-600" />
                </div>
                <CardTitle className="text-slate-800">Language Arts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Reading, vocabulary, grammar, and writing practice for Grade 5.
                </p>
                <Link href="/mock-tests/language-arts">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Language Arts
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <Calculator className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-slate-800">Mathematics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Number operations, measurement, geometry, and data practice.
                </p>
                <Link href="/mock-tests/mathematics">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Mathematics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <FlaskConical className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-slate-800">Science</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Living things, energy, matter, earth systems, and investigation skills.
                </p>
                <Link href="/mock-tests/science">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Science
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                  <Globe className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-slate-800">Social Studies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Jamaica, geography, history, citizenship, and community life.
                </p>
                <Link href="/mock-tests/social-studies">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Social Studies
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                  <FileText className="h-7 w-7 text-rose-600" />
                </div>
                <CardTitle className="text-slate-800">Performance Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Source-based reading, evidence, reasoning, and written responses.
                </p>
                <Link href="/mock-tests/performance">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900">
                    Open Performance Task
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
