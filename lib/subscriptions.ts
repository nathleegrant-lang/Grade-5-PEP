import type { PlanCode, SubscriptionRecord } from "@/lib/types"

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

export function isSubscriptionActive(subscription: SubscriptionRecord | null | undefined): boolean {
  if (!subscription) return false
  if (subscription.status !== "active") return false
  if (subscription.startsAt && new Date(subscription.startsAt) > new Date()) return false
  if (!subscription.expiresAt) return false
  return new Date(subscription.expiresAt) > new Date()
}
