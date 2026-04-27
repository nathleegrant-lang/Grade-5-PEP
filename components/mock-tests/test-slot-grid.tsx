import Link from "next/link"
import { getTestHref, MAX_TEST_SLOTS, type DifficultyKey, type SubjectKey } from "@/lib/mock-catalog"

interface TestSlotGridProps {
  subject: SubjectKey
  level: DifficultyKey
  availableTests: number[]
}

export function TestSlotGrid({ subject, level, availableTests }: TestSlotGridProps) {
  const available = new Set(availableTests)
  const slots = Array.from({ length: MAX_TEST_SLOTS }, (_, index) => index + 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          Available tests: {availableTests.length}/{MAX_TEST_SLOTS}
        </span>
        <span className="text-slate-500">Click an active number to open</span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {slots.map((testNumber) => {
          const isAvailable = available.has(testNumber)

          if (!isAvailable) {
            return (
              <button
                key={testNumber}
                type="button"
                disabled
                className="h-10 rounded-lg border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-400 cursor-not-allowed"
                aria-disabled="true"
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
              className="flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
              title={`Open ${subject} ${level} ${testNumber}`}
            >
              {testNumber}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
