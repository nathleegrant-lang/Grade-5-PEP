import Link from "next/link"
import {
  getTestHref,
  MAX_TEST_SLOTS,
  type DifficultyKey,
  type SubjectKey,
} from "@/lib/mock-catalog"

interface SubjectLevelCardProps {
  subject: SubjectKey
  level: DifficultyKey
  availableTests: number[]
  questions: number
  minutes: number
  description: string[]
}

const subjectStyles: Record<SubjectKey, {
  card: string
  band: string
  stat: string
  statNumber: string
  link: string
}> = {
  literacy: {
    card: "border-blue-500 shadow-blue-200",
    band: "border-blue-600 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400",
    stat: "border-blue-300 bg-blue-100",
    statNumber: "text-blue-800",
    link: "border-blue-600 bg-blue-600 text-white hover:bg-blue-800",
  },
  numeracy: {
    card: "border-amber-500 shadow-amber-200",
    band: "border-amber-600 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400",
    stat: "border-amber-300 bg-amber-100",
    statNumber: "text-amber-800",
    link: "border-amber-600 bg-amber-500 text-slate-950 hover:bg-amber-700 hover:text-white",
  },
  science: {
    card: "border-emerald-500 shadow-emerald-200",
    band: "border-emerald-600 bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400",
    stat: "border-emerald-300 bg-emerald-100",
    statNumber: "text-emerald-800",
    link: "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-800",
  },
  "social-studies": {
    card: "border-violet-500 shadow-violet-200",
    band: "border-violet-700 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500",
    stat: "border-violet-300 bg-violet-100",
    statNumber: "text-violet-800",
    link: "border-violet-700 bg-violet-600 text-white hover:bg-violet-800",
  },
  performance: {
    card: "border-rose-500 shadow-rose-200",
    band: "border-rose-700 bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-400",
    stat: "border-rose-300 bg-rose-100",
    statNumber: "text-rose-800",
    link: "border-rose-700 bg-rose-600 text-white hover:bg-rose-800",
  },
}

export default function SubjectLevelCard({
  subject,
  level,
  availableTests,
  questions,
  minutes,
  description,
}: SubjectLevelCardProps) {
  const slots = Array.from({ length: MAX_TEST_SLOTS }, (_, index) => index + 1)
  const available = new Set(availableTests)
  const levelTitle = level.charAt(0).toUpperCase() + level.slice(1)
  const styles = subjectStyles[subject]

  return (
    <div className={`overflow-hidden rounded-xl border-2 bg-white shadow-lg ${styles.card}`}>
      <div className={`border-b px-4 py-3 ${styles.band}`}>
        <span className="inline-flex rounded-full border-2 border-white/90 bg-white px-3 py-1 text-sm font-bold text-slate-800 shadow-md">
          {levelTitle}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <ul className="space-y-1 text-sm text-slate-700 min-h-[72px]">
          {description.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-lg border-2 p-4 text-center ${styles.stat}`}>
            <p className={`text-2xl font-extrabold ${styles.statNumber}`}>{questions}</p>
            <p className="text-xs font-medium text-slate-700">Questions</p>
          </div>

          <div className={`rounded-lg border-2 p-4 text-center ${styles.stat}`}>
            <p className={`text-2xl font-extrabold ${styles.statNumber}`}>{minutes}</p>
            <p className="text-xs font-medium text-slate-700">Minutes</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">Available Tests</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((testNumber) => {
              const isAvailable = available.has(testNumber)

              if (!isAvailable) {
                return (
                  <button
                    key={testNumber}
                    type="button"
                    disabled
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-400 cursor-not-allowed"
                    title="Coming soon"
                  >
                    {testNumber}
                  </button>
                )
              }

              return (
                <Link
                  key={testNumber}
                  href={getTestHref(subject, level, testNumber)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-extrabold shadow-sm transition-colors ${styles.link}`}
                  title={`Open ${levelTitle} Test ${testNumber}`}
                >
                  {testNumber}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
