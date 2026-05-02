import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Grade 5 PEP Mathematics Performance Tasks",
  description: "Mathematics performance task route placeholder.",
}

export default function MathematicsPerformanceTasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-3xl font-bold text-slate-800">Mathematics Performance Tasks</h1>
          <p className="text-slate-600">This section is being prepared and will be available soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
