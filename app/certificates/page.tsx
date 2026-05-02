"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Award, ArrowLeft, Printer, Star } from "lucide-react"

// ── Normalises raw DB subject values to clean display labels ──────────────────
function displaySubject(subject: string): string {
  if (!subject) return subject
  const s = subject.toLowerCase()
  if (s === "numeracy" || s === "mathematics") return "Mathematics"
  if (s === "literacy" || s === "language arts" || s === "language-arts") return "Language Arts"
  return subject
}

// ── Type ──────────────────────────────────────────────────────────────────────
type CertificateRecord = {
  id: string
  student_name: string
  subject: string
  test_name: string
  score: number
  total_questions: number
  percentage: number
  certificate_title: string
  issued_at: string
}

// ── Colour accent per subject ─────────────────────────────────────────────────
function subjectAccent(subject: string): { border: string; badge: string; text: string } {
  const label = displaySubject(subject)
  switch (label) {
    case "Mathematics":
      return { border: "border-amber-300", badge: "bg-amber-100 text-amber-700", text: "text-amber-700" }
    case "Language Arts":
      return { border: "border-sky-300", badge: "bg-sky-100 text-sky-700", text: "text-sky-700" }
    case "Science":
      return { border: "border-green-300", badge: "bg-green-100 text-green-700", text: "text-green-700" }
    case "Social Studies":
      return { border: "border-purple-300", badge: "bg-purple-100 text-purple-700", text: "text-purple-700" }
    default:
      return { border: "border-slate-300", badge: "bg-slate-100 text-slate-700", text: "text-slate-700" }
  }
}

// ── Print-friendly certificate panel ─────────────────────────────────────────
function CertificatePrintView({ cert }: { cert: CertificateRecord }) {
  const accent = subjectAccent(cert.subject)

  return (
    <div
      className={`rounded-2xl border-4 ${accent.border} bg-white p-8 text-center space-y-5 shadow-md print:shadow-none`}
    >
      {/* Decorative header */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Award className="h-8 w-8 text-amber-500" />
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Certificate of Achievement
      </p>

      <h2 className="text-2xl font-bold text-slate-800 leading-tight">
        {cert.certificate_title}
      </h2>

      <p className="text-slate-500 text-sm">This is awarded to</p>

      <p className="text-3xl font-extrabold text-slate-800">{cert.student_name}</p>

      <p className="text-slate-500 text-sm">
        for successfully completing
      </p>

      <div className="space-y-1">
        {/* displaySubject applied — "Numeracy" → "Mathematics" etc. */}
        <p className="text-lg font-semibold text-slate-700">{displaySubject(cert.subject)}</p>
        <p className="text-slate-500 text-sm">{cert.test_name}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[...Array(Math.min(5, Math.round(cert.percentage / 20)))].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <div className="inline-block rounded-full bg-amber-50 border border-amber-200 px-6 py-2">
        <p className="text-2xl font-bold text-amber-700">{cert.percentage}%</p>
        <p className="text-xs text-amber-600">
          {cert.score} / {cert.total_questions} correct
        </p>
      </div>

      <p className="text-xs text-slate-400">
        Issued {new Date(cert.issued_at).toLocaleDateString("en-JM", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <p className="text-xs font-semibold tracking-widest text-slate-300 uppercase">
        Grade 5 PEP Prep Platform
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [certificates, setCertificates] = useState<CertificateRecord[]>([])
  const [fetching, setFetching] = useState(true)
  const [selected, setSelected] = useState<CertificateRecord | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login")
  }, [isLoading, isAuthenticated, router])

  // ── Fetch all certificates for this parent ──────────────────────────────────
  useEffect(() => {
    const loadCertificates = async () => {
      if (!user) return
      setFetching(true)

      const { data } = await supabase
        .from("certificates")
        .select(
          "id, student_name, subject, test_name, score, total_questions, percentage, certificate_title, issued_at",
        )
        .eq("parent_id", user.id)
        .order("issued_at", { ascending: false })

      setCertificates((data || []) as CertificateRecord[])
      setFetching(false)
    }

    void loadCertificates()
  }, [supabase, user])

  // ── Print handler ───────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading || fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading certificates…</p>
      </div>
    )
  }

  if (!user) return null

  // ── Print mode — render only the selected certificate ──────────────────────
  if (selected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        {/* Hide header/footer when printing */}
        <div className="print:hidden">
          <Header />
        </div>

        <main className="container mx-auto px-4 py-10 max-w-2xl">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Certificates
            </Button>

            <Button
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>

          {/* The printable certificate */}
          <div ref={printRef}>
            <CertificatePrintView cert={selected} />
          </div>
        </main>

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    )
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        {/* Page title */}
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-7 w-7 text-amber-500" />
              Certificates
            </h1>
            <p className="text-slate-500 mt-1">
              Earned by scoring 80% or higher on a full mock test.
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Empty state */}
        {certificates.length === 0 ? (
          <Card className="border-sky-200 max-w-xl mx-auto">
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700">No certificates yet</p>
              <p className="text-slate-500 text-sm max-w-sm">
                Score 80% or higher on a full mock test to earn your first certificate.
              </p>
              <Link href="/mock-tests">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white mt-2">
                  Try a Mock Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const accent = subjectAccent(cert.subject)
              return (
                <Card
                  key={cert.id}
                  className={`border-2 ${accent.border} hover:shadow-md transition-shadow`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-slate-800 leading-snug">
                        {cert.certificate_title}
                      </CardTitle>
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Student */}
                    <p className="text-sm font-medium text-slate-700">{cert.student_name}</p>

                    {/* Subject + test — displaySubject applied */}
                    <div className="space-y-1">
                      <Badge className={`${accent.badge} text-xs`}>
                        {displaySubject(cert.subject)}
                      </Badge>
                      <p className="text-xs text-slate-500">{cert.test_name}</p>
                    </div>

                    {/* Score row */}
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-bold text-lg ${accent.text}`}>
                        {cert.percentage}%
                      </span>
                      <span className="text-slate-400 text-xs">
                        {cert.score}/{cert.total_questions} correct
                      </span>
                    </div>

                    {/* Star rating */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(cert.percentage / 20)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Issued date */}
                    <p className="text-xs text-slate-400">
                      Issued {new Date(cert.issued_at).toLocaleDateString("en-JM", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {/* View button */}
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                      size="sm"
                      onClick={() => setSelected(cert)}
                    >
                      View Certificate
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
