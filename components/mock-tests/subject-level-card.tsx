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
    card: "border-sky-300 shadow-sky-100",
    band: "border-sky-300 bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100",
    stat: "border-sky-200 bg-sky-50",
    statNumber: "text-blue-700",
    link: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white",
  },
  numeracy: {
    card: "border-amber-300 shadow-amber-100",
    band: "border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100",
    stat: "border-amber-200 bg-amber-50",
    statNumber: "text-amber-700",
    link: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-500 hover:text-white",
  },
  science: {
    card: "border-emerald-300 shadow-emerald-100",
    band: "border-emerald-300 bg-gradient-to-r from-emerald-100 via-green-50 to-emerald-100",
    stat: "border-emerald-200 bg-emerald-50",
    statNumber: "text-emerald-700",
    link: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white",
  },
  "social-studies": {
    card: "border-violet-300 shadow-violet-100",
    band: "border-violet-300 bg-gradient-to-r from-violet-100 via-purple-50 to-violet-100",
    stat: "border-violet-200 bg-violet-50",
    statNumber: "text-violet-700",
    link: "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-600 hover:text-white",
  },
  performance: {
    card: "border-rose-300 shadow-rose-100",
    band: "border-rose-300 bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100",
    stat: "border-rose-200 bg-rose-50",
    statNumber: "text-rose-700",
    link: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white",
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
    <div className={`overflow-hidden rounded-xl border-2 bg-white shadow-md ${styles.card}`}>
      <div className={`border-b px-4 py-3 ${styles.band}`}>
        <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
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
          <div className={`rounded-lg border p-4 text-center ${styles.stat}`}>
            <p className={`text-2xl font-bold ${styles.statNumber}`}>{questions}</p>
            <p className="text-xs text-slate-600">Questions</p>
          </div>

          <div className={`rounded-lg border p-4 text-center ${styles.stat}`}>
            <p className={`text-2xl font-bold ${styles.statNumber}`}>{minutes}</p>
            <p className="text-xs text-slate-600">Minutes</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Available Tests</p>
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
                  className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold transition-colors ${styles.link}`}
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
