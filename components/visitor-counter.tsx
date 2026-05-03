"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const SESSION_STORAGE_KEY = "g5pep-visitor-session-id"
const TRACKED_VISITS_KEY = "g5pep-tracked-visit-paths"

function getSessionId() {
  const existingId = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (existingId) {
    return existingId
  }

  const newId = crypto.randomUUID()
  sessionStorage.setItem(SESSION_STORAGE_KEY, newId)
  return newId
}

function getTrackedPaths() {
  const stored = sessionStorage.getItem(TRACKED_VISITS_KEY)
  if (!stored) {
    return new Set<string>()
  }

  try {
    return new Set<string>(JSON.parse(stored) as string[])
  } catch {
    return new Set<string>()
  }
}

function saveTrackedPaths(paths: Set<string>) {
  sessionStorage.setItem(TRACKED_VISITS_KEY, JSON.stringify(Array.from(paths)))
}

export function VisitorCounter() {
  const pathname = usePathname()
  const [totalVisits, setTotalVisits] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function trackVisit() {
      const sessionId = getSessionId()
      const trackedPaths = getTrackedPaths()
      const alreadyTracked = trackedPaths.has(pathname)

      const response = await fetch("/api/track-visit", {
        method: alreadyTracked ? "GET" : "POST",
        headers: alreadyTracked
          ? undefined
          : {
              "Content-Type": "application/json",
            },
        body: alreadyTracked
          ? undefined
          : JSON.stringify({
              page_path: pathname,
              session_id: sessionId,
              user_agent: navigator.userAgent,
            }),
      })

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as { totalVisits?: number }

      if (!cancelled && typeof data.totalVisits === "number") {
        setTotalVisits(data.totalVisits)
      }

      if (!alreadyTracked) {
        trackedPaths.add(pathname)
        saveTrackedPaths(trackedPaths)
      }
    }

    trackVisit().catch((error) => {
      console.error("Failed to track visit", error)
    })

    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <p className="text-xs text-slate-400" aria-live="polite">
      Total Visits: {totalVisits ?? "..."}
    </p>
  )
}
