/** Shared contracts contain no grade-specific curriculum or persistence implementation. */
export interface PracticeQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}
export interface LearningScope {
  gradeId: string
  subjectId: string
  termId: string
  topicId: string
}
export type LearningActivity =
  | { id: string; kind: "explanation"; title: string; text: string }
  | { id: string; kind: "worked-example"; title: string; text: string; prompt: string; answer: string }
  | { id: string; kind: "resource"; title: string; href: string }
  | { id: string; kind: "guided-interaction"; title: string; slotId: string }
export type PracticeEligibilityRef =
  | { status: "certified"; setId: string; revision: string; certificationId: string }
  | { status: "missing" | "held" | "stale" | "unknown" }
export interface TopicManifest {
  id: string
  label: string
  authoritativeIdentity: string
  objectives: readonly string[]
  activities: readonly LearningActivity[]
  practiceEligibility: PracticeEligibilityRef
}
export interface TermManifest { id: string; label: string; topics: readonly TopicManifest[] }
export interface SubjectManifest {
  id: string
  label: string
  terms: readonly TermManifest[]
  legacyLearning?: { href: string; label: string }
  mockTest?: { href: string; label: string }
}
export interface GradeManifest { id: string; label: string; subjects: readonly SubjectManifest[] }
export interface LearnerContextRef { parentId: string; learnerId: string; resolution: "explicit" }
export type ResultContext =
  | { mode: "transient"; learner?: LearnerContextRef }
  | { mode: "stored"; learner: LearnerContextRef }
export interface PracticeResult { score: number; total: number; percentage: number }
export type ProgressEvent = LearningScope & { learner?: LearnerContextRef } & (
  | { type: "topic-viewed" }
  | { type: "activity-completed"; activityId: string }
  | { type: "practice-started"; setId: string }
  | { type: "practice-completed"; setId: string; result: PracticeResult }
)
/** An optional integration hook, not a history store or completion ledger. */
export type ProgressEventSink = (event: ProgressEvent) => void
export const noOpProgressEventSink: ProgressEventSink = () => {}
export type PracticeUnavailableReason = "missing" | "held" | "stale" | "unknown" | "provider-error" | "invalid-set"
export type PracticeResolution =
  | { status: "available"; scope: LearningScope; reference: Extract<PracticeEligibilityRef, { status: "certified" }>; questions: PracticeQuestion[] }
  | { status: "unavailable"; reason: PracticeUnavailableReason }
export interface PracticeProvider {
  resolve(scope: LearningScope, reference: PracticeEligibilityRef, signal?: AbortSignal): Promise<PracticeResolution>
}
export interface CertifiedPracticeSet {
  scope: LearningScope
  reference: Extract<PracticeEligibilityRef, { status: "certified" }>
  semanticStatus: "certified" | "held" | "stale" | "unknown"
  mode: "topic-practice" | "mock-test"
  expiresAt: number
  questions: readonly PracticeQuestion[]
}
