export interface AssessmentQuestion {
  id: number
  options: string[]
  correctAnswer: number
}

const STANDARD_SECTION_ORDER = ["reading", "vocabulary", "grammar", "writing"] as const

type SectionAwareQuestion = AssessmentQuestion & { type?: string }

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
  preserveSectionOrder?: boolean
}

function usesStandardSections<T extends AssessmentQuestion>(questions: readonly T[]): boolean {
  return questions.some((question) =>
    STANDARD_SECTION_ORDER.includes((question as SectionAwareQuestion).type as typeof STANDARD_SECTION_ORDER[number]),
  )
}

function shuffleWithinSections<T extends AssessmentQuestion>(questions: readonly T[]): T[] {
  const sectioned = questions as readonly (T & SectionAwareQuestion)[]
  const ordered = STANDARD_SECTION_ORDER.flatMap((type) =>
    shuffleArray(sectioned.filter((question) => question.type === type)),
  )
  const recognisedIds = new Set(ordered.map((question) => question.id))
  const unrecognised = shuffleArray(sectioned.filter((question) => !recognisedIds.has(question.id)))

  return [...ordered, ...unrecognised] as T[]
}

/**
 * Creates a fresh assessment attempt. Answer choices are shuffled for every
 * attempt. For standard Language Arts papers, questions are shuffled inside
 * their sections while the section order remains Reading, Vocabulary,
 * Grammar, then Writing. This prevents a non-reading question from appearing
 * before students have seen the passage.
 */
export function prepareAssessment<T extends AssessmentQuestion>(
  questions: readonly T[],
  {
    shuffleQuestions = true,
    shuffleOptions = true,
    preserveSectionOrder = true,
  }: PrepareAssessmentOptions = {},
): T[] {
  const prepared = shuffleOptions
    ? questions.map((question) => shuffleQuestionOptions(question))
    : questions.map((question) => ({ ...question, options: [...question.options] }))

  if (!shuffleQuestions) return prepared

  if (preserveSectionOrder && usesStandardSections(prepared)) {
    return shuffleWithinSections(prepared)
  }

  return shuffleArray(prepared)
}

/**
 * Creates a free preview. Section-aware papers include questions from each
 * available section while preserving the normal section order. With a
 * five-question Language Arts preview, students receive two Reading questions
 * followed by one Vocabulary, one Grammar, and one Writing question.
 */
export function preparePreview<T extends AssessmentQuestion>(
  questions: readonly T[],
  limit: number,
): T[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Preview limit must be a positive whole number.")
  }

  const prepared = prepareAssessment(questions)

  if (!usesStandardSections(prepared)) {
    return prepared.slice(0, limit)
  }

  const sectioned = prepared as readonly (T & SectionAwareQuestion)[]
  const availableSections = STANDARD_SECTION_ORDER.filter((type) =>
    sectioned.some((question) => question.type === type),
  )

  const selected: T[] = []
  const allocation = new Map<string, number>()

  for (const type of availableSections) {
    if (selected.length >= limit) break
    allocation.set(type, 1)
    selected.push(sectioned.find((question) => question.type === type) as T)
  }

  let sectionIndex = 0
  while (selected.length < limit && availableSections.length > 0) {
    const type = availableSections[sectionIndex % availableSections.length]
    const alreadyTaken = allocation.get(type) ?? 0
    const candidates = sectioned.filter((question) => question.type === type)

    if (alreadyTaken < candidates.length) {
      selected.push(candidates[alreadyTaken] as T)
      allocation.set(type, alreadyTaken + 1)
    }

    sectionIndex += 1
    if (sectionIndex > questions.length * availableSections.length) break
  }

  return STANDARD_SECTION_ORDER.flatMap((type) =>
    selected.filter((question) => (question as T & SectionAwareQuestion).type === type),
  ).slice(0, limit)
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
