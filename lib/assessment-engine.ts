export interface AssessmentQuestion {
  id: number
  options: string[]
  correctAnswer: number
}

/**
 * Returns a new shuffled array without mutating the source array.
 * Fisher-Yates gives each item an equal chance of appearing in each position.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Shuffles a question's answer choices and safely remaps correctAnswer.
 * The original question object and options array are never mutated.
 */
export function shuffleQuestionOptions<T extends AssessmentQuestion>(question: T): T {
  const indexedOptions = question.options.map((option, originalIndex) => ({
    option,
    isCorrect: originalIndex === question.correctAnswer,
  }))

  const shuffledOptions = shuffleArray(indexedOptions)
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

export interface PrepareAssessmentOptions {
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
}

/**
 * Creates a fresh assessment attempt. Call this once when an attempt begins,
 * not during render, so questions and choices remain stable while answering.
 */
export function prepareAssessment<T extends AssessmentQuestion>(
  questions: readonly T[],
  {
    shuffleQuestions = true,
    shuffleOptions = true,
  }: PrepareAssessmentOptions = {},
): T[] {
  const prepared = shuffleOptions
    ? questions.map((question) => shuffleQuestionOptions(question))
    : questions.map((question) => ({ ...question, options: [...question.options] }))

  return shuffleQuestions ? shuffleArray(prepared) : prepared
}

/**
 * Creates a free preview that still samples across the assessment rather than
 * always exposing the same first questions.
 */
export function preparePreview<T extends AssessmentQuestion>(
  questions: readonly T[],
  limit: number,
): T[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Preview limit must be a positive whole number.")
  }

  return prepareAssessment(shuffleArray(questions).slice(0, limit))
}

export function calculateAssessmentScore<T extends AssessmentQuestion>(
  questions: readonly T[],
  answers: readonly (number | null)[],
): number {
  return questions.reduce(
    (score, question, index) => score + (answers[index] === question.correctAnswer ? 1 : 0),
    0,
  )
}
