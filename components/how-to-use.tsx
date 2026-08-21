const steps = [
  { number: 1, text: "Choose a subject", tone: "bg-pink-500" },
  { number: 2, text: "Review a topic", tone: "bg-blue-600" },
  { number: 3, text: "Complete practice activities", tone: "bg-emerald-600" },
  { number: 4, text: "Move on to mock tests", tone: "bg-amber-500" },
]

export function HowToUse() {
  return (
    <section className="py-2 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">PEP PRACTICE — Grade 5</p>
      <h2 className="mt-2 text-2xl font-bold text-[#102f57]">How to Use This Site</h2>
      <p className="mt-2 text-sm text-slate-600">A simple path to purposeful Grade 5 practice.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number} className="rounded-xl border border-sky-100 bg-slate-50 px-4 py-5 shadow-sm">
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${step.tone}`}>{step.number}</div>
            <p className="mt-3 text-sm font-semibold text-[#102f57]">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
