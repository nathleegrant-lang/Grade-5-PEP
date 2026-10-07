import type { CertifiedPracticeSet, LearningScope, PracticeEligibilityRef, PracticeProvider, PracticeResolution } from "./contracts"

export function sameScope(a: LearningScope, b: LearningScope): boolean {
  return a.gradeId === b.gradeId && a.subjectId === b.subjectId && a.termId === b.termId && a.topicId === b.topicId
}
/** Registry must be supplied by the separately approved semantic process, never taxonomy. */
export function createCertifiedPracticeProvider(
  sets: readonly CertifiedPracticeSet[],
  approvedCertificationIds: readonly string[],
  now: () => number = Date.now,
): PracticeProvider {
  const registry = structuredClone(sets)
  const approvals = new Set(approvedCertificationIds)
  return {
    async resolve(scope, reference, signal) {
      if (signal?.aborted) return { status: "unavailable", reason: "provider-error" }
      if (reference.status !== "certified") return { status: "unavailable", reason: reference.status }
      if (!approvals.has(reference.certificationId)) return { status: "unavailable", reason: "unknown" }
      const matches = registry.filter(set => sameScope(set.scope, scope) &&
        set.reference.setId === reference.setId && set.reference.revision === reference.revision &&
        set.reference.certificationId === reference.certificationId)
      if (matches.length !== 1) return { status: "unavailable", reason: "unknown" }
      const set = matches[0]
      if (set.semanticStatus !== "certified") return { status: "unavailable", reason: set.semanticStatus }
      if (!Number.isFinite(set.expiresAt) || set.expiresAt <= now()) return { status: "unavailable", reason: "stale" }
      if (set.mode !== "topic-practice" || !set.questions.length || set.questions.some(q =>
        !q.question || !q.explanation || !q.options.length || !q.options.every(option => typeof option === "string") ||
        !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length)) {
        return { status: "unavailable", reason: "invalid-set" }
      }
      return { status: "available", scope: { ...scope }, reference: { ...reference }, questions: structuredClone([...set.questions]) }
    },
  }
}
/** Bound provider calls even when an adapter ignores AbortSignal. No retries or fallback banks. */
export async function resolvePractice(
  provider: PracticeProvider, scope: LearningScope, reference: PracticeEligibilityRef,
  signal: AbortSignal, timeoutMs = 10000,
): Promise<PracticeResolution> {
  if (reference.status !== "certified") return { status: "unavailable", reason: reference.status }
  if (signal.aborted) return { status: "unavailable", reason: "provider-error" }
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  let abort: (() => void) | undefined
  try {
    const stopped = new Promise<PracticeResolution>(resolve => {
      abort = () => { controller.abort(); resolve({ status: "unavailable", reason: "provider-error" }) }
      signal.addEventListener("abort", abort, { once: true })
      timer = setTimeout(abort, timeoutMs)
    })
    const resolution = await Promise.race([provider.resolve(scope, reference, controller.signal), stopped])
    if (resolution.status === "available" && (!sameScope(resolution.scope, scope) ||
      resolution.reference.setId !== reference.setId || resolution.reference.revision !== reference.revision ||
      resolution.reference.certificationId !== reference.certificationId || !resolution.questions.length)) {
      return { status: "unavailable", reason: "invalid-set" }
    }
    return resolution
  } catch {
    return { status: "unavailable", reason: "provider-error" }
  } finally {
    clearTimeout(timer)
    if (abort) signal.removeEventListener("abort", abort)
  }
}
