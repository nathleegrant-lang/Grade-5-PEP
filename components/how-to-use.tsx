const steps = [
  { number: 1, text: "Choose a subject" },
  { number: 2, text: "Review a topic" },
  { number: 3, text: "Complete practice activities" },
  { number: 4, text: "Move on to mock tests" },
]

export function HowToUse() {
  return (
    <section className="rounded-2xl bg-white py-2 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d6f70]">PEP PRACTICE — Grade 5</p>
      <h2 className="mt-2 text-2xl font-bold text-[#0b3555]">How to Use This Site</h2>
      <p className="mt-2 text-sm text-slate-600">A simple path to purposeful Grade 5 practice.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number} className="rounded-xl border border-teal-100 bg-white px-4 py-5 shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#0d6f70] text-sm font-bold text-white">{step.number}</div>
            <p className="mt-3 text-sm font-semibold text-[#0b3555]">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
