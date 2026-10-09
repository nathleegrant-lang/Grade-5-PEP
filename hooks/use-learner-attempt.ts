"use client"
import { useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { beginLearnerAttempt, completeLearnerAttempt, type LearnerAttempt } from "@/lib/learner-attempt"
export function useLearnerAttempt() {
  const { user, selectedStudentId } = useAuth()
  const attempt = useRef<LearnerAttempt | null>(null)
  return {
    capture: () => {
      if (user && !selectedStudentId) return false
      attempt.current = beginLearnerAttempt(user?.id || "", selectedStudentId || "")
      return true
    },
    get studentId() { return completeLearnerAttempt(attempt.current, user?.id || "").studentId },
    completedAt: () => completeLearnerAttempt(attempt.current, user?.id || "").completedAt!,
  }
}
