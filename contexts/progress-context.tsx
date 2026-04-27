"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react"
import type { QuizAttempt, Certificate, UserProgress, TopicProgress } from "@/lib/types"
import { useAuth } from "./auth-context"

interface ProgressContextType {
  progress: UserProgress | null
  isLoading: boolean
  recordQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "userId" | "completedAt">) => void
  canTakeQuiz: (quizId: string) => boolean
  getQuizAttempts: (quizId: string) => QuizAttempt[]
  getTopicProgress: (category: string) => TopicProgress[]
  earnCertificate: (cert: Omit<Certificate, "id" | "userId" | "earnedAt">) => void
  getCertificates: () => Certificate[]
  hasCertificate: (quizId: string) => boolean
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

const PROGRESS_KEY = "grade5_pep_progress"

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isPremium } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${PROGRESS_KEY}_${user.id}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          parsed.quizAttempts = parsed.quizAttempts.map((a: QuizAttempt) => ({
            ...a,
            completedAt: new Date(a.completedAt),
          }))
          parsed.certificates = parsed.certificates.map((c: Certificate) => ({
            ...c,
            earnedAt: new Date(c.earnedAt),
          }))
          parsed.lastActivityDate = new Date(parsed.lastActivityDate)
          setProgress(parsed)
        } catch {
          initializeProgress()
        }
      } else {
        initializeProgress()
      }
    } else {
      setProgress(null)
    }
    setIsLoading(false)
  }, [user])

  const initializeProgress = () => {
    if (!user) return

    const newProgress: UserProgress = {
      userId: user.id,
      totalQuizzesTaken: 0,
      totalMockTestsTaken: 0,
      averageScore: 0,
      quizAttempts: [],
      certificates: [],
      streakDays: 0,
      lastActivityDate: new Date(),
    }

    setProgress(newProgress)
    saveProgress(newProgress)
  }

  const saveProgress = (data: UserProgress) => {
    if (!user) return
    localStorage.setItem(`${PROGRESS_KEY}_${user.id}`, JSON.stringify(data))
    setProgress(data)
  }

  const recordQuizAttempt = useCallback(
    (attemptData: Omit<QuizAttempt, "id" | "userId" | "completedAt">) => {
      if (!progress || !user) return

      const attempt: QuizAttempt = {
        ...attemptData,
        id: crypto.randomUUID(),
        userId: user.id,
        completedAt: new Date(),
      }

      const updatedProgress: UserProgress = {
        ...progress,
        quizAttempts: [...progress.quizAttempts, attempt],
        totalQuizzesTaken:
          attemptData.category === "mock-test"
            ? progress.totalQuizzesTaken
            : progress.totalQuizzesTaken + 1,
        totalMockTestsTaken:
          attemptData.category === "mock-test"
            ? progress.totalMockTestsTaken + 1
            : progress.totalMockTestsTaken,
        lastActivityDate: new Date(),
      }

      const allScores = updatedProgress.quizAttempts.map((a) => a.percentage)
      updatedProgress.averageScore =
        allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0

      saveProgress(updatedProgress)
    },
    [progress, user],
  )

  const canTakeQuiz = useCallback(
    (quizId: string): boolean => {
      if (isPremium) return true
      if (!progress) return true

      const attempts = progress.quizAttempts.filter((a) => a.quizId === quizId)
      return attempts.length === 0
    },
    [isPremium, progress],
  )

  const getQuizAttempts = useCallback(
    (quizId: string): QuizAttempt[] => {
      if (!progress) return []
      return progress.quizAttempts.filter((a) => a.quizId === quizId)
    },
    [progress],
  )

  const getTopicProgress = useCallback(
    (category: string): TopicProgress[] => {
      if (!progress) return []

      const topicMap = new Map<string, TopicProgress>()

      progress.quizAttempts
        .filter((a) => a.category === category)
        .forEach((attempt) => {
          const existing = topicMap.get(attempt.topic)

          if (existing) {
            existing.attempts++
            existing.bestScore = Math.max(existing.bestScore, attempt.percentage)
            if (!existing.lastAttempt || attempt.completedAt > existing.lastAttempt) {
              existing.lastAttempt = attempt.completedAt
            }
          } else {
            topicMap.set(attempt.topic, {
              topic: attempt.topic,
              category: attempt.category,
              attempts: 1,
              bestScore: attempt.percentage,
              lastAttempt: attempt.completedAt,
            })
          }
        })

      return Array.from(topicMap.values())
    },
    [progress],
  )

  const earnCertificate = useCallback(
    (certData: Omit<Certificate, "id" | "userId" | "earnedAt">) => {
      if (!progress || !user) return

      const existing = progress.certificates.find(
        (c) => c.quizId === certData.quizId && c.type === certData.type,
      )
      if (existing) return

      const certificate: Certificate = {
        ...certData,
        id: crypto.randomUUID(),
        userId: user.id,
        earnedAt: new Date(),
      }

      const updatedProgress: UserProgress = {
        ...progress,
        certificates: [...progress.certificates, certificate],
      }

      saveProgress(updatedProgress)
    },
    [progress, user],
  )

  const getCertificates = useCallback((): Certificate[] => {
    return progress?.certificates || []
  }, [progress])

  const hasCertificate = useCallback(
    (quizId: string): boolean => {
      return progress?.certificates.some((c) => c.quizId === quizId) || false
    },
    [progress],
  )

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        recordQuizAttempt,
        canTakeQuiz,
        getQuizAttempts,
        getTopicProgress,
        earnCertificate,
        getCertificates,
        hasCertificate,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider")
  }
  return context
}
