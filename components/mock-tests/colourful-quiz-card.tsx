import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ColourfulQuizCardProps = {
  title: string
  setLabel: string
  questions: number
  description: string
  href: string
  emoji: string
  theme: "mint" | "yellow" | "blue" | "purple" | "orange" | "pink" | "rose" | "cyan"
}

const themes = {
  mint: "from-emerald-200 to-emerald-300",
  yellow: "from-yellow-200 to-lime-200",
  blue: "from-sky-200 to-blue-300",
  purple: "from-violet-200 to-purple-300",
  orange: "from-orange-200 to-amber-300",
  pink: "from-pink-200 to-rose-300",
  rose: "from-fuchsia-200 to-pink-300",
  cyan: "from-cyan-200 to-teal-300",
}

export function ColourfulQuizCard({
  title,
  setLabel,
  questions,
  description,
  href,
  emoji,
  theme,
}: ColourfulQuizCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card
        className={`relative h-full overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${themes[theme]} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/35" />
        <div className="absolute bottom-4 right-4 text-3xl text-black/20">★</div>

        <div className="relative z-10 space-y-4">
          <div className="text-3xl">{emoji}</div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
              {questions} Questions
            </span>
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
              {setLabel}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {title}
            </h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
              {description}
            </p>
          </div>

          <Button className="mt-3 w-full bg-slate-900 hover:bg-slate-800">
            Open Quiz
          </Button>
        </div>
      </Card>
    </Link>
  )
}
