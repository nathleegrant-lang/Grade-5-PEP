export type AppRole = "admin" | "parent"
export type GradeProduct = "grade4" | "grade5"
export type PlanCode = "free" | "standard_weekly" | "standard_monthly" | "standard_yearly" | "premium_family_monthly" | "premium_family_yearly"
export type PaymentStatus = "pending" | "verified" | "rejected" | "expired"
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled" | "suspended"

export interface StudentRecord {
  id: string
  fullName: string
  gradeLevel: number
  subscriptionId?: string | null
  createdAt?: string
}

export interface SubscriptionRecord {
  id: string
  parentId: string
  grade: GradeProduct
  planCode: PlanCode
  status: SubscriptionStatus
  startsAt?: string | null
  expiresAt?: string | null
  maxStudents: number
  paymentId?: string | null
}

export interface PaymentRecord {
  id: string
  parentId: string
  grade: GradeProduct
  planCode: PlanCode
  amountJmd: number
  method: string
  referenceCode?: string | null
  proofUrl?: string | null
  note?: string | null
  status: PaymentStatus
  submittedAt: string
  verifiedAt?: string | null
  rejectionReason?: string | null
  currency?: string
  paidAt?: string | null
  verifiedBy?: string | null
  expectedAmountJmd?: number | null
  actualAmountJmd?: number | null
  receiptNumber?: string | null
  parentEmail?: string | null
  parentName?: string | null
}

export interface User {
  id: string
  parentName: string
  childName: string
  email: string
  role: AppRole
  subscriptionTier: PlanCode
  subscriptionExpiry?: Date
  createdAt?: Date
  maxStudents: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isPremium: boolean
  isAdmin: boolean
  students: StudentRecord[]
  activeSubscription: SubscriptionRecord | null
}

export interface RegisterResult {
  success: boolean
  error?: string
  needsEmailConfirmation?: boolean
}

export interface PricingTier {
  id: PlanCode
  name: string
  priceJMD: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  maxStudents: number
  badgeText?: string | null
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    priceJMD: 0,
    period: "Free forever",
    description: "Explore selected lessons and sample practice before upgrading.",
    maxStudents: 1,
    features: [
      "Selected lessons and sample practice",
      "Free account dashboard",
      "Basic progress tracking",
      "One student profile",
    ],
  },
  {
    id: "standard_weekly",
    name: "Standard Weekly",
    priceJMD: 1000,
    period: "per 7 days",
    description: "Full Grade 5 access for one student for one week.",
    maxStudents: 1,
    badgeText: "Popular",
    popular: true,
    features: [
      "Full Grade 5 access",
      "Unlimited quizzes and mock tests",
      "Worksheets, study guides, and certificates",
      "Payment approval sets expiry automatically",
    ],
  },
  {
    id: "standard_monthly",
    name: "Standard Monthly",
    priceJMD: 3000,
    period: "per month",
    description: "Full Grade 5 access for one student for one month.",
    maxStudents: 1,
    badgeText: "Best Value",
    features: [
      "Everything in Standard Weekly",
      "One calendar month of access after approval",
      "Detailed progress review",
      "One student included",
    ],
  },
  {
    id: "standard_yearly",
    name: "Standard Yearly",
    priceJMD: 30000,
    period: "per 12 months",
    description: "Full Grade 5 access for one student for 12 calendar months.",
    maxStudents: 1,
    badgeText: "Yearly Value",
    features: ["Full Grade 5 access", "12 calendar months, prepaid", "No automatic renewal", "One student included"],
  },
  {
    id: "premium_family_monthly",
    name: "Premium Family Monthly",
    priceJMD: 10000,
    period: "per month",
    description: "Full Grade 5 access for up to 4 students in one household.",
    maxStudents: 4,
    features: [
      "Full Grade 5 access for up to 4 students",
      "Family-friendly monthly plan",
      "All premium resources included",
      "Great for siblings in one household",
    ],
  },
  {
    id: "premium_family_yearly",
    name: "Premium Family Yearly",
    priceJMD: 100000,
    period: "per 12 months",
    description: "Full Grade 5 access for up to 4 students for 12 calendar months.",
    maxStudents: 4,
    features: ["Full Grade 5 access for up to 4 students", "12 calendar months, prepaid", "No automatic renewal", "All premium resources included"],
  },
]

export const FREE_EXCLUDED_FEATURES = [
  "Full mock exams",
  "Printable worksheets",
  "Study guides",
  "Certificates",
  "Multiple student profiles",
]

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  category: "language-arts" | "mathematics" | "science" | "social-studies" | "mock-test"
  topic: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
  timeSpent?: number
}

export interface Certificate {
  id: string
  userId: string
  type: "quiz" | "mock-test" | "achievement"
  title: string
  description: string
  score: number
  earnedAt: Date
  quizId?: string
}

export interface UserProgress {
  userId: string
  totalQuizzesTaken: number
  totalMockTestsTaken: number
  averageScore: number
  quizAttempts: QuizAttempt[]
  certificates: Certificate[]
  streakDays: number
  lastActivityDate: Date
}

export interface TopicProgress {
  topic: string
  category: string
  attempts: number
  bestScore: number
  lastAttempt?: Date
}
