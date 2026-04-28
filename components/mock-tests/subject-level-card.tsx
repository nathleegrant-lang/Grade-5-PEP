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

const levelStyles: Record<
  DifficultyKey,
  {
    headerBg: string
    statBg: string
    activeBg: string
    activeHover: string
    activeText: string
  }
> = {
  easy: {
    headerBg: "bg-emerald-50 border-emerald-100",
    statBg: "bg-slate-50",
    activeBg: "bg-emerald-500",
    activeHover: "hover:bg-emerald-600",
    activeText: "text-white",
  },
  moderate: {
    headerBg: "bg-blue-50 border-blue-100",
    statBg: "bg-slate-50",
    activeBg: "bg-blue-500",
    activeHover: "hover:bg-blue-600",
    activeText: "text-white",
  },
  difficult: {
    headerBg: "bg-amber-50 border-amber-100",
    statBg: "bg-slate-50",
    activeBg: "bg-orange-500",
    activeHover: "hover:bg-orange-600",
    activeText: "text-white",
  },
  mixed: {
    headerBg: "bg-slate-100 border-slate-200",
    statBg: "bg-slate-50",
    activeBg: "bg-slate-600",
    activeHover: "hover:bg-slate-700",
    activeText: "text-white",
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
  const styles = levelStyles[level]
  const slots = Array.from({ length: MAX_TEST_SLOTS }, (_, index) => index + 1)
  const available = new Set(availableTests)

  const levelTitle =
    level.charAt(0).toUpperCase() + level.slice(1)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`border-b px-4 py-3 ${styles.headerBg}`}>
        <h2 className="text-lg font-semibold text-slate-800">{levelTitle}</h2>
      </div>

      <div className="p-4 space-y-5">
        <ul className="space-y-1 text-sm text-slate-600 min-h-[72px]">
          {description.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-lg border border-slate-200 p-4 text-center ${styles.statBg}`}>
            <p className="text-2xl font-bold text-slate-800">{questions}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>

          <div className={`rounded-lg border border-slate-200 p-4 text-center ${styles.statBg}`}>
            <p className="text-2xl font-bold text-slate-800">{minutes}</p>
            <p className="text-xs text-slate-500">Minutes</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Available Tests</p>

          <div className="flex flex-wrap gap-2">
            {slots.map((testNumber) => {
              const isAvailable = available.has(testNumber)

              if (!isAvailable) {
                return (
                  <button
                    key={testNumber}
                    type="button"
                    disabled
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed"
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
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${styles.activeBg} ${styles.activeHover} ${styles.activeText}`}
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
