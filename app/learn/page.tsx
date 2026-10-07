"use client"

import "./learning.css"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LearningShell } from "@/components/learning/learning-shell"
import { grade5Manifest, grade5PracticeProvider } from "@/lib/learning/grade5/manifest"

export default function LearnPage() {
  return <div className="flex min-h-screen flex-col bg-slate-50">
    <Header />
    <main className="flex-1">
      <LearningShell grade={grade5Manifest} provider={grade5PracticeProvider} />
    </main>
    <Footer />
  </div>
}
