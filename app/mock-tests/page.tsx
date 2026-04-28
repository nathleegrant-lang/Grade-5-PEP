import Link from "next/link"
import { BookOpen, Calculator, FlaskConical, Globe } from "lucide-react"
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
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6"
          >
            ← Back to Home
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              Grade 5 Mock Tests
            </h1>
            <p className="text-slate-600">
              Choose a subject to open its mock test area.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mb-3">
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
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Calculator className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-slate-800">Mathematics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Number operations, measurement, geometry, and data practice for Grade 5.
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
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
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
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
