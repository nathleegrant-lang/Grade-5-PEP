const steps = [
  { number: 1, text: "Choose a subject", tone: "bg-blue-600" },
  { number: 2, text: "Review a topic", tone: "bg-cyan-500" },
  { number: 3, text: "Complete practice activities", tone: "bg-emerald-500" },
  { number: 4, text: "Move on to mock tests", tone: "bg-yellow-400 text-slate-900" },
]

export function HowToUse() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 px-5 py-7 text-center shadow-lg shadow-blue-950/5 md:px-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border-[16px] border-white/80" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-yellow-200/35" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">PEP PRACTICE — Grade 5</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">How to Use This Site</h2>
        <p className="mt-2 text-sm text-slate-600">A simple path to purposeful Grade 5 practice.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-white/90 bg-white px-4 py-5 shadow-md shadow-blue-950/5">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${step.tone}`}>{step.number}</div>
              <p className="mt-3 text-sm font-bold text-slate-900">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
