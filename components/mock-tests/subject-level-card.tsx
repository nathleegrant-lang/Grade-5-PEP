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

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
          {levelTitle}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <ul className="space-y-1 text-sm text-slate-600 min-h-[72px]">
          {description.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{questions}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
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
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
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
