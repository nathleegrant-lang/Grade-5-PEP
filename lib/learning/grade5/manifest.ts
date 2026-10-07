import taxonomy from "./as003-taxonomy.json"
import type { GradeManifest } from "../contracts"
import { createCertifiedPracticeProvider } from "../practice-provider"
const subjects = [
  { id: "language-arts", label: "Language Arts" },
  { id: "mathematics", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "social-studies", label: "Social Studies" },
]
/** AS-003 organizes navigation only. Portfolio has approved no lesson or question mappings. */
export const grade5Manifest: GradeManifest = {
  id: "G5", label: "Grade 5",
  subjects: subjects.map(subject => ({
    ...subject,
    legacyLearning: { href: `/${subject.id}`, label: `Existing ${subject.label} lessons (not term-specific)` },
    mockTest: { href: `/${subject.id}/mock-test`, label: `${subject.label} Mock Test` },
    terms: [1, 2, 3].map(term => ({
      id: `T${term}`, label: `Term ${term}`,
      topics: taxonomy.filter(row => row.Subject === subject.label && row.Term === term).map(row => ({
        id: row["Curriculum ID"], label: row["Learner-Facing Label"],
        authoritativeIdentity: row["Authoritative Curriculum Identity"],
        objectives: [row["Objective/Outcome Summary"]],
        activities: [],
        practiceEligibility: { status: "missing" as const },
      })),
    })),
  })),
}
// No AS-002-CORR-001 eligibility assertion is supplied. There is deliberately no bank import.
export const grade5PracticeProvider = createCertifiedPracticeProvider([], [])
