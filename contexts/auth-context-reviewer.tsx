"use client"

import { useEffect, useState } from "react"
import {
  AuthProvider,
  useAuth as useBaseAuth,
} from "./auth-context"

export { AuthProvider }

/**
 * Extends the normal authentication state with temporary reviewer access.
 * The reviewer cookie remains HTTP-only; the browser only receives a boolean
 * from the server-side status endpoint.
 */
export function useAuth() {
  const auth = useBaseAuth()
  const [reviewerAccess, setReviewerAccess] = useState(false)
  const [reviewerStatusLoaded, setReviewerStatusLoaded] = useState(false)

  useEffect(() => {
    let active = true

    const checkReviewerAccess = async () => {
      try {
        const response = await fetch("/api/reviewer/status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Unable to verify reviewer access.")
        }

        const data = (await response.json()) as { reviewerAccess?: boolean }

        if (active) {
          setReviewerAccess(data.reviewerAccess === true)
        }
      } catch (error) {
        console.error("Reviewer access check failed:", error)

        if (active) {
          setReviewerAccess(false)
        }
      } finally {
        if (active) {
          setReviewerStatusLoaded(true)
        }
      }
    }

    void checkReviewerAccess()

    return () => {
      active = false
    }
  }, [])

  return {
    ...auth,
    isPremium: auth.isPremium || reviewerAccess,
    isLoading: auth.isLoading || !reviewerStatusLoaded,
    reviewerAccess,
  }
}
