import { Sparkles, Star } from "lucide-react"

export const grade5Visual = {
  navyText: "text-slate-900",
  mutedText: "text-slate-600",
  eyebrow: "text-blue-700",
  whiteSurface: "border border-white/80 bg-white shadow-xl shadow-blue-950/10",
  primaryButton: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400",
  goldButton: "bg-yellow-300 text-slate-900 hover:bg-yellow-200 focus-visible:ring-yellow-200",
} as const

export function Grade5EnergyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 top-24 h-64 w-64 rounded-full border border-white/15 bg-white/5" />
      <div className="absolute left-[22%] top-14 h-28 w-28 rounded-full border-[18px] border-white/5" />
      <div className="absolute -right-20 top-14 h-72 w-72 rounded-full border border-white/25" />
      <div className="absolute -bottom-28 left-[34%] h-56 w-56 rounded-full bg-white/10 blur-sm" />
      <Star className="absolute left-[6%] top-24 h-8 w-8 fill-yellow-300 text-yellow-300 drop-shadow" />
      <Sparkles className="absolute right-[8%] top-16 h-8 w-8 text-yellow-200" />
      <div className="absolute right-[13%] top-24 grid grid-cols-4 gap-3 opacity-50">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>
      <span className="absolute bottom-14 left-[4%] text-5xl font-black text-white/25">+</span>
      <span className="absolute bottom-16 right-[18%] text-4xl font-black text-white/25">+</span>
    </div>
  )
}
