export interface SocialStudiesAssessmentQuestion {
  id: number
  type: "history" | "geography" | "civics" | "economics"
  options: string[]
  correctAnswer: number
}

export type SocialStudiesRandomSource = () => number

const SECTION_ORDER = ["history", "geography", "civics", "economics"] as const

function shuffleArray<T>(items: readonly T[], random: SocialStudiesRandomSource): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function shuffleOptions<T extends SocialStudiesAssessmentQuestion>(
  question: T,
  random: SocialStudiesRandomSource,
): T {
  const indexedOptions = question.options.map((option, originalIndex) => ({
    option,
    isCorrect: originalIndex === question.correctAnswer,
  }))
  const shuffledOptions = shuffleArray(indexedOptions, random)
  const correctAnswer = shuffledOptions.findIndex((item) => item.isCorrect)

  if (correctAnswer < 0) {
    throw new Error(`Question ${question.id} has no valid correct answer.`)
  }

  return {
    ...question,
    options: shuffledOptions.map((item) => item.option),
    correctAnswer,
  }
}

export function prepareSocialStudiesAssessment<T extends SocialStudiesAssessmentQuestion>(
  questions: readonly T[],
  random: SocialStudiesRandomSource = Math.random,
): T[] {
  return SECTION_ORDER.flatMap((type) =>
    shuffleArray(
      questions.filter((question) => question.type === type),
      random,
    ).map((question) => shuffleOptions(question, random)),
  )
}

export function prepareSocialStudiesPreview<T extends SocialStudiesAssessmentQuestion>(
  questions: readonly T[],
  limit = 5,
  random: SocialStudiesRandomSource = Math.random,
): T[] {
  if (limit !== 5) {
    throw new Error("The Social Studies preview requires exactly five questions.")
  }

  const eligibleBonusSections = SECTION_ORDER.filter(
    (type) => questions.filter((question) => question.type === type).length >= 2,
  )

  if (eligibleBonusSections.length === 0) {
    throw new Error("No Social Studies section can supply a second preview question.")
  }

  const bonusSection = eligibleBonusSections[
    Math.floor(random() * eligibleBonusSections.length)
  ]

  return SECTION_ORDER.flatMap((type) => {
    const count = type === bonusSection ? 2 : 1
    return shuffleArray(
      questions.filter((question) => question.type === type),
      random,
    )
      .slice(0, count)
      .map((question) => shuffleOptions(question, random))
  })
}
