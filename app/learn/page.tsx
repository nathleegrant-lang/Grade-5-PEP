"use client"

import "./learning.css"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LearningShell } from "@/components/learning/learning-shell"
import { grade5Manifest, grade5PracticeProvider } from "@/lib/learning/grade5/manifest"

function SubjectLearning() {
  const subjectId = useSearchParams().get("subject") ?? undefined
  return <LearningShell key={subjectId ?? "all-subjects"} grade={grade5Manifest} provider={grade5PracticeProvider} initialSubjectId={subjectId} />
}

export default function LearnPage() {
  return <div className="flex min-h-screen flex-col bg-slate-50">
    <Header />
    <main className="flex-1">
      <Suspense fallback={<p role="status" className="p-8">Loading learning topics…</p>}><SubjectLearning /></Suspense>
    </main>
    <Footer />
  </div>
}
