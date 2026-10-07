import type { GradeManifest, LearningScope } from "./contracts"
export interface LearningNavigation {
  subjectId?: string
  termId?: string
  topicId?: string
  view: "learning" | "practice"
}
export const initialNavigation: LearningNavigation = { view: "learning" }
export type NavigationAction =
  | { type: "grade" }
  | { type: "subject"; id: string }
  | { type: "term"; id: string }
  | { type: "topic"; id: string }
  | { type: "practice" }
  | { type: "review-topic" }
  | { type: "choose-another-topic" }
export function navigate(grade: GradeManifest, state: LearningNavigation, action: NavigationAction): LearningNavigation {
  const subject = grade.subjects.find(s => s.id === state.subjectId)
  const term = subject?.terms.find(t => t.id === state.termId)
  const topic = term?.topics.find(t => t.id === state.topicId)
  switch (action.type) {
    case "grade": return initialNavigation
    case "subject": return grade.subjects.some(s => s.id === action.id) ? { subjectId: action.id, view: "learning" } : state
    case "term": return subject?.terms.some(t => t.id === action.id) ? { subjectId: subject.id, termId: action.id, view: "learning" } : state
    case "topic": return term?.topics.some(t => t.id === action.id) ? { subjectId: subject?.id, termId: term.id, topicId: action.id, view: "learning" } : state
    case "practice": return topic ? { ...state, view: "practice" } : state
    case "review-topic": return topic ? { ...state, view: "learning" } : state
    case "choose-another-topic": return { subjectId: subject?.id, termId: term?.id, view: "learning" }
  }
}
export function selectedScope(grade: GradeManifest, state: LearningNavigation): LearningScope | null {
  const subject = grade.subjects.find(s => s.id === state.subjectId)
  const term = subject?.terms.find(t => t.id === state.termId)
  const topic = term?.topics.find(t => t.id === state.topicId)
  return subject && term && topic ? { gradeId: grade.id, subjectId: subject.id, termId: term.id, topicId: topic.id } : null
}
