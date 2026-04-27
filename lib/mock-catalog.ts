import fs from "fs"
import path from "path"

export type SubjectKey = "literacy" | "numeracy" | "performance"
export type DifficultyKey = "easy" | "moderate" | "difficult" | "mixed"
export type SubjectCatalog = Record<DifficultyKey, number[]>

export const MAX_TEST_SLOTS = 10

const DIFFICULTIES: DifficultyKey[] = ["easy", "moderate", "difficult", "mixed"]

function emptyCatalog(): SubjectCatalog {
  return {
    easy: [],
    moderate: [],
    difficult: [],
    mixed: [],
  }
}

function getSubjectBasePath(subject: SubjectKey) {
  return path.join(process.cwd(), "app", "mock-tests", subject)
}

function scanSubjectCatalog(subject: SubjectKey): SubjectCatalog {
  const basePath = getSubjectBasePath(subject)
  const catalog = emptyCatalog()

  if (!fs.existsSync(basePath)) return catalog

  const entries = fs.readdirSync(basePath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const match = entry.name.match(/^(easy|moderate|difficult|mixed)-(\d+)$/)
    if (!match) continue

    const difficulty = match[1] as DifficultyKey
    const testNumber = Number(match[2])

    if (!Number.isNaN(testNumber)) {
      catalog[difficulty].push(testNumber)
    }
  }

  for (const difficulty of DIFFICULTIES) {
    catalog[difficulty].sort((a, b) => a - b)
  }

  return catalog
}

export function getSubjectCatalog(subject: SubjectKey): SubjectCatalog {
  return scanSubjectCatalog(subject)
}

export function getTestHref(subject: SubjectKey, difficulty: DifficultyKey, testNumber: number) {
  return `/mock-tests/${subject}/${difficulty}-${testNumber}`
}
