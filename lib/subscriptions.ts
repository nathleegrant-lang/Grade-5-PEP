import type { PaymentRecord, PlanCode, SubscriptionRecord } from "@/lib/types"

export function getPlanLabel(plan: PlanCode): string {
  switch (plan) {
    case "standard_weekly":
      return "Standard Weekly"
    case "standard_monthly":
      return "Standard Monthly"
    case "standard_yearly":
      return "Standard Yearly"
    case "premium_family_monthly":
      return "Premium Family Monthly"
    case "premium_family_yearly":
      return "Premium Family Yearly"
    default:
      return "Free"
  }
}

export function formatPlanPeriod(plan: PlanCode) {
  switch (plan) {
    case "standard_weekly":
      return "7 days"
    case "standard_monthly":
    case "premium_family_monthly":
      return "1 month"
    case "standard_yearly":
    case "premium_family_yearly":
      return "12 months"
    default:
      return "Free access"
  }
}

export function calculateExpiry(planCode: PlanCode): Date | undefined {
  const now = new Date()

  if (planCode === "standard_weekly") {
    now.setDate(now.getDate() + 7)
    return now
  }

  if (planCode === "standard_monthly" || planCode === "premium_family_monthly") {
    now.setMonth(now.getMonth() + 1)
    return now
  }

  if (planCode === "standard_yearly" || planCode === "premium_family_yearly") {
    now.setMonth(now.getMonth() + 12)
    return now
  }

  return undefined
}

export function isSubscriptionActive(subscription: SubscriptionRecord | null | undefined): boolean {
  if (!subscription) return false
  if (subscription.status !== "active") return false
  if (subscription.startsAt && new Date(subscription.startsAt) > new Date()) return false
  if (!subscription.expiresAt) return false
  return new Date(subscription.expiresAt) > new Date()
}


export function isPaymentAccessActive(payment: PaymentRecord | null | undefined): boolean {
  if (!payment) return false
  if (payment.status !== "verified") return false

  const start = payment.verifiedAt ?? payment.submittedAt
  if (!start) return false

  const expiresAt = calculateExpiryFromStart(payment.planCode, start)
  if (!expiresAt) return false

  return expiresAt > new Date()
}

function calculateExpiryFromStart(planCode: PlanCode, startAt: string): Date | undefined {
  const start = new Date(startAt)

  if (Number.isNaN(start.getTime())) return undefined

  if (planCode === "standard_weekly") {
    start.setDate(start.getDate() + 7)
    return start
  }

  if (planCode === "standard_monthly" || planCode === "premium_family_monthly") {
    start.setMonth(start.getMonth() + 1)
    return start
  }

  if (planCode === "standard_yearly" || planCode === "premium_family_yearly") {
    start.setMonth(start.getMonth() + 12)
    return start
  }

  return undefined
}
