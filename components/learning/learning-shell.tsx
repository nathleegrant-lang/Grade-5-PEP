"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { GradeManifest, LearningActivity, LearnerContextRef, PracticeProvider, PracticeResolution, ProgressEvent, ProgressEventSink } from "../../lib/learning/contracts"
import { noOpProgressEventSink } from "../../lib/learning/contracts"
import { initialNavigation, navigate, selectedScope } from "../../lib/learning/navigation"
import type { NavigationAction } from "../../lib/learning/navigation"
import { resolvePractice, sameScope } from "../../lib/learning/practice-provider"
import { PracticeRunner } from "./practice-runner"

interface LearningShellProps {
  grade: GradeManifest
  provider: PracticeProvider
  initialSubjectId?: string
  learner?: LearnerContextRef
  progressSink?: ProgressEventSink
  renderGuidedActivity?: (slotId: string, onCompleted: () => void) => ReactNode
}
const unavailableMessages = {
  missing: "Certified Practice is not yet available for this topic.",
  held: "Practice is not yet available for this topic.",
  stale: "Practice is not yet available for this topic.",
  unknown: "Certified Practice is not yet available for this topic.",
  "invalid-set": "Practice is temporarily unavailable. Return to learning or choose another topic.",
  "provider-error": "Practice is temporarily unavailable. Return to learning or choose another topic.",
}
function ActivityView({ activity, renderGuidedActivity, onCompleted }: {
  activity: LearningActivity
  renderGuidedActivity?: LearningShellProps["renderGuidedActivity"]
  onCompleted: () => void
}) {
  return <article className="rounded-xl border border-slate-200 bg-white p-6">
    <h3 className="mb-3 text-xl font-semibold">{activity.title}</h3>
    {activity.kind === "explanation" ? <p className="whitespace-pre-line">{activity.text}</p> : null}
    {activity.kind === "worked-example" ? <><p className="whitespace-pre-line">{activity.text}</p><p className="mt-3 font-semibold">{activity.prompt}</p><p>{activity.answer}</p></> : null}
    {activity.kind === "resource" ? <a className="underline" href={activity.href}>Open {activity.title}</a> : null}
    {activity.kind === "guided-interaction" ? renderGuidedActivity?.(activity.slotId, onCompleted) ?? <p role="status">This learning activity is not yet available.</p> : null}
  </article>
}
/** Curriculum and approved providers are inputs. There is no identity lookup, storage or bank fallback. */
export function LearningShell({ grade, provider, initialSubjectId, learner, progressSink = noOpProgressEventSink, renderGuidedActivity }: LearningShellProps) {
  const [navigation, setNavigation] = useState(() => initialSubjectId ? navigate(grade, initialNavigation, { type: "subject", id: initialSubjectId }) : initialNavigation)
  const [practice, setPractice] = useState<PracticeResolution | null>(null)
  const subject = grade.subjects.find(s => s.id === navigation.subjectId)
  const term = subject?.terms.find(t => t.id === navigation.termId)
  const topic = term?.topics.find(t => t.id === navigation.topicId)
  const scope = selectedScope(grade, navigation)
  const emit = (event: ProgressEvent) => { try { progressSink(event) } catch { /* Optional integration must not break navigation. */ } }
  const go = (action: NavigationAction) => {
    const next = navigate(grade, navigation, action)
    if (next.subjectId === navigation.subjectId && next.termId === navigation.termId &&
      next.topicId === navigation.topicId && next.view === navigation.view) return
    setPractice(null)
    setNavigation(next)
  }

  useEffect(() => {
    const currentScope = selectedScope(grade, navigation)
    if (currentScope && navigation.view === "learning") {
      try { progressSink({ ...currentScope, learner, type: "topic-viewed" }) } catch { /* No persistence fallback. */ }
    }
  }, [grade, navigation.subjectId, navigation.termId, navigation.topicId, navigation.view, learner, progressSink])

  useEffect(() => {
    const controller = new AbortController()
    setPractice(null)
    const currentScope = selectedScope(grade, navigation)
    if (navigation.view === "practice" && currentScope && topic) {
      void resolvePractice(provider, currentScope, topic.practiceEligibility, controller.signal).then(result => {
        if (controller.signal.aborted) return
        setPractice(result)
        if (result.status === "available") {
          try { progressSink({ ...currentScope, learner, type: "practice-started", setId: result.reference.setId }) } catch { /* No persistence fallback. */ }
        }
      })
    }
    return () => controller.abort()
  }, [grade, provider, navigation.subjectId, navigation.termId, navigation.topicId, navigation.view, topic, learner, progressSink])

  return <div className="mx-auto max-w-5xl px-4 py-8 text-slate-800">
    <nav aria-label="Learning location" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <button type="button" className="underline" onClick={() => go({ type: "grade" })}>{grade.label}</button>
      {subject ? <><span aria-hidden="true">/</span><button type="button" className="underline" onClick={() => go({ type: "subject", id: subject.id })}>{subject.label}</button></> : null}
      {term ? <><span aria-hidden="true">/</span><button type="button" className="underline" onClick={() => go({ type: "term", id: term.id })}>{term.label}</button></> : null}
      {topic ? <><span aria-hidden="true">/</span><span aria-current="page">{topic.label}</span></> : null}
    </nav>
    <h1 className="mb-4 text-3xl font-bold text-[#1e3a5f]">{topic?.label ?? term?.label ?? subject?.label ?? `${grade.label} Learning`}</h1>
    {subject ? <aside className="mb-6 flex flex-wrap gap-4 rounded-lg bg-blue-50 p-4" aria-label="Separate learning and assessment areas">
      {subject.legacyLearning ? <a className="underline" href={subject.legacyLearning.href}>{subject.legacyLearning.label}</a> : null}
      {subject.mockTest ? <a className="underline" href={subject.mockTest.href}>{subject.mockTest.label} (separate assessment)</a> : null}
    </aside> : null}
    {!subject ? <><h2 className="mb-4 text-xl font-semibold">Choose a Subject</h2>{!grade.subjects.length ? <p role="status">Subjects are not yet available.</p> : <div className="grid gap-4 sm:grid-cols-2">{grade.subjects.map(s => <button type="button" key={s.id} className="learn-control" onClick={() => go({ type: "subject", id: s.id })}>{s.label}</button>)}</div>}</> : null}
    {subject && !term ? <><h2 className="mb-4 text-xl font-semibold">Choose a Term</h2>{!subject.terms.length ? <p role="status">Terms are not yet configured for this subject.</p> : <div className="flex flex-wrap gap-3">{subject.terms.map(t => <button type="button" key={t.id} className="learn-control" onClick={() => go({ type: "term", id: t.id })}>{t.label}</button>)}</div>}</> : null}
    {term && !topic ? <><h2 className="mb-4 text-xl font-semibold">Choose a Topic</h2>{!term.topics.length ? <p role="status">Topics are not yet configured for this term.</p> : <div className="grid gap-4 sm:grid-cols-2">{term.topics.map(t => <button type="button" key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-blue-600" onClick={() => go({ type: "topic", id: t.id })}><span className="block text-lg font-semibold">{t.label}</span><span className="mt-2 block text-sm text-slate-600">{t.authoritativeIdentity}</span></button>)}</div>}</> : null}
    {topic && scope ? <>
      <div className="mb-6 flex flex-wrap gap-3">
        <button type="button" className="learn-control" aria-pressed={navigation.view === "learning"} onClick={() => go({ type: "review-topic" })}>Learning Activities</button>
        <button type="button" className="learn-control" aria-pressed={navigation.view === "practice"} onClick={() => go({ type: "practice" })}>Practice</button>
        <button type="button" className="learn-control" onClick={() => go({ type: "choose-another-topic" })}>Back to Topics</button>
      </div>
      {navigation.view === "learning" ? <section aria-label="Learning Activities" className="space-y-4">
        <p className="text-sm text-slate-600">{topic.authoritativeIdentity}</p>
        {!topic.activities.length ? <div role="status" className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Learning Activities are not yet available.</h2><p className="mt-2">You can choose another topic or return to the subject.</p></div> : topic.activities.map(activity => <ActivityView key={activity.id} activity={activity} renderGuidedActivity={renderGuidedActivity} onCompleted={() => emit({ ...scope, learner, type: "activity-completed", activityId: activity.id })} />)}
      </section> : practice?.status === "available" && sameScope(practice.scope, scope) ? <PracticeRunner key={`${scope.gradeId}/${scope.subjectId}/${scope.termId}/${scope.topicId}/${practice.reference.setId}/${practice.reference.revision}`}
        gradeLabel={grade.label} title={topic.label} questions={practice.questions}
        onReviewTopic={() => go({ type: "review-topic" })}
        onChooseAnotherTopic={() => go({ type: "choose-another-topic" })}
        onRestart={() => emit({ ...scope, learner, type: "practice-started", setId: practice.reference.setId })}
        onComplete={result => emit({ ...scope, learner, type: "practice-completed", setId: practice.reference.setId, result })}
      /> : <div role="status" className="rounded-xl border border-slate-200 bg-white p-6">{practice?.status === "unavailable" ? unavailableMessages[practice.reason] : "Checking Practice availability…"}</div>}
    </> : null}
  </div>
}
