export type LearnerAttempt = { parentId: string; studentId: string; completedAt: string | null }
export function beginLearnerAttempt(parentId: string, studentId: string): LearnerAttempt {
  if (parentId && !studentId) throw new Error("Choose a student before starting.")
  return { parentId, studentId, completedAt: null }
}
export function completeLearnerAttempt(attempt: LearnerAttempt | null, parentId: string, now = () => new Date().toISOString()) {
  if (!attempt || !parentId || attempt.parentId !== parentId || !attempt.studentId) throw new Error("Restart with a selected student in this Parent session.")
  attempt.completedAt ??= now()
  return attempt
}
