"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
import { prepareAssessment, preparePreview } from "@/lib/assessment-engine"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle,
  BookOpen, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "reading" | "vocabulary" | "grammar" | "writing"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const P1 = `In 1865, Paul Bogle led hundreds of men and women from Stony Gut to Morant Bay courthouse to protest against poverty, injustice, and the brutality of the colonial justice system. What began as a protest became a rebellion that changed Jamaican history. Though Bogle was captured and executed, the aftermath of the Morant Bay Rebellion forced the British government to take notice. Jamaica's status was changed from a self-governing colony to a Crown Colony under direct British rule — a step backward in some ways, but one that led to important social reforms. Paul Bogle was later declared one of Jamaica's seven National Heroes, remembered as a man who gave his life in the pursuit of justice for ordinary people.`

const g5LaMix1Questions: Question[] = [  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

${P1}

What is this passage MAINLY about?`,
    options: [
      "The Morant Bay Rebellion and Paul Bogle's role in Jamaican history",
      "Paul Bogle's family life",
      "How the British governed Jamaica",
      "The location of Stony Gut",
    ],
    correctAnswer: 0,
    explanation: `The passage traces Bogle's protest, the rebellion it sparked, its political consequences, and his legacy as a National Hero.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P1}

What did Paul Bogle protest against?`,
    options: [
      "Bad weather conditions",
      "Poverty, injustice, and colonial brutality",
      "Poor road conditions",
      "The lack of churches",
    ],
    correctAnswer: 1,
    explanation: `The passage lists 'poverty, injustice, and the brutality of the colonial justice system' as Bogle's targets.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

${P1}

What happened to Paul Bogle after the rebellion?`,
    options: [
      "He escaped to England",
      "He became a government official",
      "He was captured and executed",
      "He led another rebellion",
    ],
    correctAnswer: 2,
    explanation: `The passage directly states Bogle 'was captured and executed.'`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

${P1}

The word 'aftermath' in the passage most nearly means:`,
    options: [
      "the cause",
      "the beginning",
      "a type of punishment",
      "the result or consequences that follow an event",
    ],
    correctAnswer: 3,
    explanation: `'Aftermath' refers to the consequences or effects that follow a significant event.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Fact Check",
    question: `Read the passage then answer the question.

${P1}

According to the passage, how many National Heroes does Jamaica have?`,
    options: [
      "Seven",
      "Five",
      "Six",
      "Eight",
    ],
    correctAnswer: 0,
    explanation: `The passage states Bogle 'was later declared one of Jamaica's seven National Heroes.'`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

The passage says Jamaica's change to Crown Colony status was 'a step backward in some ways.' What does this imply?`,
    options: [
      "The British were being generous",
      "Jamaica lost some self-governing power it previously had",
      "Crown Colony was better for ordinary Jamaicans",
      "Bogle wanted Crown Colony status",
    ],
    correctAnswer: 1,
    explanation: `'A step backward' implies Jamaica had previously enjoyed some degree of self-governance that was reduced under Crown Colony rule.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

${P1}

Why does the author describe Bogle's memorial as a man who 'gave his life in the pursuit of justice for ordinary people'?`,
    options: [
      "To make readers feel sad",
      "To show he was famous",
      "To emphasise that his sacrifice was for the benefit of regular people, not personal glory",
      "To suggest he had no choice",
    ],
    correctAnswer: 2,
    explanation: `This framing positions Bogle as a selfless champion of ordinary people — emphasising his moral purpose rather than just his historical role.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

${P1}

What was the DIRECT cause of Jamaica's change to Crown Colony status?`,
    options: [
      "Paul Bogle's execution",
      "The Jamaican government requested direct British rule",
      "A natural disaster",
      "The Morant Bay Rebellion forced the British government to take notice and act",
    ],
    correctAnswer: 3,
    explanation: `The passage states the 'aftermath of the Morant Bay Rebellion forced the British government to take notice' — leading directly to the change in status.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

${P1}

The tone of this passage is BEST described as:`,
    options: [
      "Respectful and historically informative — presenting Bogle as a significant and admirable figure",
      "Critical of Paul Bogle",
      "Entirely neutral with no perspective",
      "Humorous and light",
    ],
    correctAnswer: 0,
    explanation: `The language is historically engaged and respectful — presenting Bogle's actions as significant and his designation as a National Hero as deserved.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

${P1}

What THEME does this passage MOST clearly express?`,
    options: [
      "Violence is never the answer",
      "Courage in the pursuit of justice can create lasting historical change even at great personal cost",
      "Colonial rule was always fair",
      "Jamaica has too many National Heroes",
    ],
    correctAnswer: 1,
    explanation: `Bogle's sacrifice led to real change — the passage illustrates how courageous action for justice can alter history.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

${P1}

The passage says the change to Crown Colony was 'a step backward in some ways, but one that led to important social reforms.' What does this tension reveal?`,
    options: [
      "The British were confused about what to do",
      "Crown Colony status was entirely positive",
      "Historical change is never straightforward — events can simultaneously represent loss and progress",
      "The reforms were unimportant",
    ],
    correctAnswer: 2,
    explanation: `The 'both/and' framing shows sophisticated historical thinking — acknowledging that significant events can be simultaneously regressive and progressive.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

${P1}

What implicit argument does the author make about why Bogle should be remembered?`,
    options: [
      "Because he organised a large march",
      "Because he was a religious leader",
      "Because he was famous in his time",
      "Because he sacrificed his life fighting for justice for ordinary people — the test of true heroism",
    ],
    correctAnswer: 3,
    explanation: `The passage implies heroism is defined by sacrifice for others, not personal gain — positioning Bogle's execution as evidence of genuine heroism.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

${P1}

When the passage says Bogle 'gave his life in the pursuit of justice,' the word 'pursuit' suggests:`,
    options: [
      "That justice was an active, ongoing struggle he consciously chose to chase at personal cost",
      "That justice was easy to find",
      "That he accidentally died",
      "That he was running away",
    ],
    correctAnswer: 0,
    explanation: `'Pursuit' implies active, conscious chasing of a goal — suggesting justice required deliberate effort and sacrifice, not passive hoping.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

${P1}

Which statement BEST summarises this passage?`,
    options: [
      "Paul Bogle was a man who organised a protest",
      "Paul Bogle's courageous rebellion against injustice changed Jamaican history and earned him recognition as a National Hero",
      "The British changed Jamaica's colonial status",
      "The Morant Bay Rebellion failed completely",
    ],
    correctAnswer: 1,
    explanation: `This captures the rebellion, its consequences, and Bogle's lasting legacy — all the key elements of the passage.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

${P1}

When the passage notes Jamaica's status changed from 'self-governing colony to a Crown Colony under direct British rule,' it implies that Bogle's rebellion:`,
    options: [
      "Had no political consequences",
      "Was entirely successful in achieving its goals",
      "Had unintended political consequences — some of which were negative — alongside positive reforms",
      "Was ignored by the British",
    ],
    correctAnswer: 2,
    explanation: `The change to Crown Colony was an unintended consequence of the rebellion — a paradox where resistance led to both regression and reform.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'protest'?`,
    options: [
      "support",
      "ignore",
      "celebrate",
      "demonstrate",
    ],
    correctAnswer: 3,
    explanation: `'Demonstrate' (to publicly show opposition or support) is a synonym for 'protest.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'brutal' is:`,
    options: [
      "gentle",
      "cruel",
      "harsh",
      "fierce",
    ],
    correctAnswer: 0,
    explanation: `'Brutal' means savagely cruel. 'Gentle' — mild and kind — is its antonym.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The judge's VERDICT surprised everyone in the courtroom. 'Verdict' means:`,
    options: [
      "the judge's costume",
      "an official decision or judgement",
      "a type of evidence",
      "the sentence imposed",
    ],
    correctAnswer: 1,
    explanation: `A 'verdict' is the formal decision made by a judge or jury — the official judgement in a legal case.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'He faced the music after his mistake.' This idiom means:`,
    options: [
      "He listened to a song",
      "He ran away from the consequences",
      "He accepted and faced the consequences of his actions",
      "He made beautiful music",
    ],
    correctAnswer: 2,
    explanation: `'Facing the music' means accepting and dealing with the consequences of one's actions — however unpleasant.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Justice is blind.' This metaphor suggests:`,
    options: [
      "Legal proceedings take place in the dark",
      "The law cannot see anything",
      "Judges have poor eyesight",
      "Justice should apply equally to everyone, regardless of who they are",
    ],
    correctAnswer: 3,
    explanation: `The metaphor implies justice should be impartial — blind to a person's status, wealth, or identity.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the MOST negative connotation when describing a political leader?`,
    options: [
      "ruthless",
      "strong",
      "decisive",
      "firm",
    ],
    correctAnswer: 0,
    explanation: `'Ruthless' implies willingness to cause harm without mercy — a strongly negative connotation.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'sovereignty' means:`,
    options: [
      "a type of ceremony",
      "the right to self-govern — supreme power over a country or territory",
      "a national holiday",
      "a form of protest",
    ],
    correctAnswer: 1,
    explanation: `'Sovereignty' is the supreme authority of a nation to govern itself — independence and self-rule.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Leader is to group as captain is to`,
    options: [
      "harbour",
      "ocean",
      "ship",
      "anchor",
    ],
    correctAnswer: 2,
    explanation: `A leader guides a group, just as a captain guides a ship.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Prefix",
    question: `The word "injustice" begins with the prefix "in-." What does "injustice" mean?`,
    options: [
      "a fair decision",
      "a written law",
      "a peaceful protest",
      "the absence of fairness or justice",
    ],
    correctAnswer: 3,
    explanation: `The prefix "in-" can mean "not." Injustice therefore means a condition that is not fair or just.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: `Choose the best word to complete the sentence: "Paul Bogle showed great ______ when he stood against injustice."`,
    options: [
      "courage",
      "confusion",
      "silence",
      "carelessness",
    ],
    correctAnswer: 0,
    explanation: `"Courage" precisely describes the bravery needed to stand against injustice despite danger.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `Which word is a PROPER NOUN?`,
    options: [
      "court",
      "Morant Bay",
      "rebellion",
      "protest",
    ],
    correctAnswer: 1,
    explanation: `'Morant Bay' names a specific place — it is a proper noun and begins with capital letters.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the ADJECTIVE in: 'The brave leader organised the march.'`,
    options: [
      "organised",
      "leader",
      "brave",
      "the",
    ],
    correctAnswer: 2,
    explanation: `'Brave' describes what kind of leader — it is an adjective.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is correctly punctuated?`,
    options: [
      "Paul Bogle a Baptist deacon led the rebellion.",
      "Paul Bogle, a Baptist deacon led the rebellion.",
      "Paul Bogle a Baptist deacon, led the rebellion.",
      "Paul Bogle, a Baptist deacon, led the rebellion.",
    ],
    correctAnswer: 3,
    explanation: `A non-essential phrase ('a Baptist deacon') is enclosed in commas on both sides.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The procession of protesters was moving toward Morant Bay.",
      "The procession of protesters were moving toward Morant Bay.",
      "The procession of protesters have moved toward Morant Bay.",
      "The procession of protesters are moving toward Morant Bay."
    ],
    correctAnswer: 0,
    explanation: "The singular subject \"procession\" takes the singular verb form \"was.\""
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      `We deserve justice," the people declared."`,
      `"We deserve justice," the people declared.`,
      `"We deserve justice" the people declared.`,
      `"We deserve justice, the people declared."`,
    ],
    correctAnswer: 1,
    explanation: `The spoken words are enclosed in quotation marks, and the comma appears inside the closing quotation mark before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence uses a relative pronoun correctly?`,
    options: [
      "Paul Bogle, which led the protest, became a National Hero.",
      "Paul Bogle, whom led the protest, became a National Hero.",
      "Paul Bogle, who led the protest, became a National Hero.",
      "Paul Bogle, whose led the protest, became a National Hero.",
    ],
    correctAnswer: 2,
    explanation: `"Who" correctly refers to a person and acts as the subject of the relative clause.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "The people marched to Morant Bay and demand justice.",
      "The people march to Morant Bay and demanded justice.",
      "The people will march to Morant Bay and demanded justice.",
      "The people marched to Morant Bay and demanded justice.",
    ],
    correctAnswer: 3,
    explanation: `Both "marched" and "demanded" are in the past tense, so the sentence is consistent.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which choice best combines the ideas? "The protest began peacefully. It later became a rebellion."`,
    options: [
      "Although the protest began peacefully, it later became a rebellion.",
      "The protest began peacefully, it later became a rebellion.",
      "The protest began peacefully but later becoming a rebellion.",
      "Although the protest began peacefully, but it later became a rebellion.",
    ],
    correctAnswer: 0,
    explanation: `"Although" correctly shows the contrast and joins the dependent and independent clauses without creating a run-on.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "Bogle was executed; ______, his struggle for justice continued to influence Jamaica."`,
    options: [
      "for example",
      "however",
      "meanwhile",
      "therefore",
    ],
    correctAnswer: 1,
    explanation: `"However" shows the contrast between Bogle's death and the continued influence of his struggle.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Precise Word Choice",
    question: `Which word most precisely completes the sentence? "The rebellion ______ the British government to examine conditions in Jamaica."`,
    options: [
      "made",
      "did",
      "forced",
      "got",
    ],
    correctAnswer: 2,
    explanation: `"Forced" precisely shows that the rebellion created strong pressure for the government to respond.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `A student is writing a biographical article about Paul Bogle. The PRIMARY purpose is to:`,
    options: [
      "Entertain with a fictional adventure",
      "Persuade readers that all rebellions are justified",
      "Describe what Jamaica looks like",
      "Inform readers about Bogle's life, actions, and historical significance",
    ],
    correctAnswer: 3,
    explanation: `A biographical article's primary purpose is to inform readers about a person's life and significance.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Evidence in Persuasive Writing",
    question: `Which type of evidence MOST strengthens a persuasive argument?`,
    options: [
      "Specific verified facts, statistics, or expert opinion",
      "A personal opinion",
      "General knowledge",
      "A story about the writer's own experience",
    ],
    correctAnswer: 0,
    explanation: `Verified facts and expert opinions are the strongest evidence — they are objective and harder to dispute than personal opinion.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition best connects these ideas? "Bogle was captured and executed. ______, his actions helped bring attention to injustice in Jamaica."`,
    options: [
      "For example",
      "Nevertheless",
      "Similarly",
      "First",
    ],
    correctAnswer: 1,
    explanation: `"Nevertheless" shows that, despite Bogle's execution, his actions still had an important effect.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Read the paragraph. Which sentence should be removed because it does not belong?

(1) Paul Bogle is remembered for standing against injustice. (2) He led people from Stony Gut to Morant Bay in 1865. (3) Other important events also took place in Jamaica during the nineteenth century. (4) His sacrifice later earned him recognition as a National Hero.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 3",
      "Sentence 4",
    ],
    correctAnswer: 2,
    explanation: "Sentence 3 is historically related to Jamaica, but it does not develop the paragraph's focus on Paul Bogle, his actions, and his legacy."
  },
  {
    id: 40,
    type: "writing",
    skill: "Thesis Statement",
    question: `Which is the STRONGEST thesis for an essay arguing Paul Bogle should be celebrated as a hero?`,
    options: [
      "Paul Bogle should be remembered as a hero because he showed courage when ordinary Jamaicans faced unfair treatment.",
      "Paul Bogle deserves recognition because his leadership at Morant Bay made him an important figure in Jamaica's struggle against injustice.",
      "Paul Bogle should be celebrated because his actions drew national attention to unfair conditions faced by many Jamaicans.",
      "Paul Bogle deserves recognition as a National Hero because his courageous protest against injustice, though brutally suppressed, directly contributed to political reforms that improved the lives of ordinary Jamaicans."
    ],
    correctAnswer: 3,
    explanation: "The keyed thesis makes a specific arguable claim and supports it with Bogle's courage, resistance to injustice, and historical impact."
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaMix1Questions : g5LaMix1Questions.slice(0, FREE_QUESTION_LIMIT)
  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (!started || showResults) return
    const t = setInterval(() => setTimeLeft((p) => { if (p <= 1) { setShowResults(true); return 0 } return p - 1 }), 1000)
    return () => clearInterval(t)
  }, [started, showResults])

  const handleAnswer = (idx: number) => { const a = [...answers]; a[currentQuestion] = idx; setAnswers(a) }

  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Mixed 1",
      difficulty: "Mixed",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: new Date().toISOString(),
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

  const startTest = () => {
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaMix1Questions)
      : preparePreview(g5LaMix1Questions, FREE_QUESTION_LIMIT)
    setRandomizedQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    hasSavedResult.current = false
    setStarted(true)
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const getGrade = () => {
    const p = scorePct()
    if (p >= 85) return { grade: "Excellent",         color: "text-green-600" }
    if (p >= 70) return { grade: "Good",              color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",              color: "text-amber-600" }
    return              { grade: "Needs Improvement", color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => { const i = availableQuestions.findIndex((x) => x.id === q.id); return answers[i] === q.correctAnswer }).length
    const total = sq.length
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Fair" : "Needs Improvement"
    const color  = pct >= 85 ? "text-green-600" : pct >= 70 ? "text-blue-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage: pct, rating, ratingColor: color }
  }

  const resetTest = () => {
    setStarted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null))
    setTimeLeft(60 * 60)
    hasSavedResult.current = false
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) =>
    t === "reading" ? "Reading Comprehension" : t === "vocabulary" ? "Vocabulary & Word Study"
    : t === "grammar" ? "Grammar & Language Use" : "Writing Skills"
  const secColor = (t: Question["type"]) =>
    t === "reading" ? "bg-blue-50 text-blue-700" : t === "vocabulary" ? "bg-purple-50 text-purple-700"
    : t === "grammar" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/language-arts"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Language Arts Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 text-center">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-blue-600" />
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 1</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Mixed Level Practice</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isPremium && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Free Preview Mode</p>
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade Access to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Button></Link>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This test blends easy, moderate, and challenging questions across reading, vocabulary, grammar, and writing — giving you a complete picture of your Grade 5 Language Arts skills.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">What to Expect</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Reading: literal comprehension → inference → literary analysis</li>
                <li>Vocabulary: word meaning → figurative language → nuanced connotation</li>
                <li>Grammar: basic parts of speech → complex clauses and transformations</li>
                <li>Writing: paragraph structure → persuasive technique → analytical writing</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={startTest} className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">Language Arts Test Completed</CardTitle>
              <p className="text-slate-600">Language Arts Mixed 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-blue-600">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-blue-600">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade Access to unlock all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Button></Link></div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="font-semibold text-blue-800">{s.label}</p>
                    <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span>
                      <span className={cn("text-sm font-semibold", st.ratingColor)}>{st.rating}</span>
                    </div>
                    <Progress value={st.percentage} className="h-2 mt-2" />
                    <p className="text-xs text-slate-500 mt-1">{st.percentage}%</p>
                  </div>
                )})}
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">This mixed test spans all difficulty levels. Review each explanation carefully — questions you found challenging reveal which areas to focus on as you prepare for the PEP Language Arts paper.</p>
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-blue-700">{q.skill}</span></p>
                          <p className="mt-1 text-slate-700 text-sm">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.correctAnswer]}</p>
                          <p className="mt-1 text-sm text-slate-700">Explanation: {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-blue-600 hover:bg-blue-700"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/language-arts" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Language Arts Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <header className="bg-blue-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/language-arts" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <BookOpen className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Language Arts Mixed 1</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-green-600")}>
            <Clock className="h-5 w-5" />{formatTime(timeLeft)}
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {answeredCount}/{totalQuestions} answered</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade Access for full access.</p></div>)}
          <Card className="mb-6 border-blue-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">{q.skill}</span>
                <span className="text-xs uppercase tracking-wide opacity-70">{secLabel(q.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className={cn("w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50")}>
                    <span className="font-medium text-blue-700 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-blue-600 hover:bg-blue-700">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-blue-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-blue-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-blue-600 text-white"
                      : answers[idx] !== null ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-600" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-100" /><span>Answered</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /><span>Unanswered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
