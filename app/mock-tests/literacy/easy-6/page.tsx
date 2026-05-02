"use client"

import { useState, useEffect, useCallback } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
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

const g5LaEasy6Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

What is this passage MAINLY about?`,
    options: [
      "Miss Campbell's grocery shopping",
      "How Donovan showed kindness and felt proud as a result",
      "Sweet potato pudding",
      "Elderly people needing help",
    ],
    correctAnswer: 1,
    explanation: `The passage is about Donovan's act of kindness, Miss Campbell's gratitude, and his mother's affirmation — the main idea is kindness and its rewards.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

What did Donovan notice?`,
    options: [
      "Miss Campbell was cooking",
      "Miss Campbell was struggling to carry her groceries up the steps",
      "Miss Campbell had dropped her purse",
      "Miss Campbell was lost",
    ],
    correctAnswer: 1,
    explanation: `The passage states 'Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

What does 'without being asked' tell us about Donovan?`,
    options: [
      "He was told to help",
      "He helped only because he wanted food",
      "He was genuinely kind — he helped spontaneously, not because someone told him to",
      "He was bored and had nothing to do",
    ],
    correctAnswer: 2,
    explanation: `Acting without being asked shows that Donovan's kindness was genuine and came from his own values, not external instruction.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

The phrase 'a glow of pride' suggests Donovan felt:`,
    options: [
      "embarrassed",
      "warm, happy satisfaction in having done something good",
      "tired and hungry",
      "nervous and worried",
    ],
    correctAnswer: 1,
    explanation: `A 'glow of pride' describes a warm inner feeling of satisfaction — Donovan felt good about his kind action.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

BECAUSE Donovan helped Miss Campbell, she:`,
    options: [
      "called his mother",
      "gave him a slice of sweet potato pudding and thanked him warmly",
      "carried the groceries herself",
      "asked him to come back later",
    ],
    correctAnswer: 1,
    explanation: `The passage says Miss Campbell 'thanked him warmly and offered him a slice of sweet potato pudding' as a result of his help.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Character",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

Based on the passage, how would you describe Donovan?`,
    options: [
      "Selfish and uninterested in others",
      "Kind, helpful, and caring",
      "Shy and nervous around adults",
      "Greedy — he only helped for the pudding",
    ],
    correctAnswer: 1,
    explanation: `Donovan helped without being asked, which shows genuine kindness and care for others.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

What theme does this passage MOST clearly express?`,
    options: [
      "Old people need a lot of help",
      "Kindness to others brings inner satisfaction and is always the right choice",
      "Sweet potato pudding is delicious",
      "Groceries are heavy",
    ],
    correctAnswer: 1,
    explanation: `The passage ends with both Donovan's pride and his mother's affirmation that 'kindness is always the right choice' — this is the clear theme.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

The tone of this passage is BEST described as:`,
    options: [
      "Sad and lonely",
      "Warm and uplifting",
      "Humorous and playful",
      "Tense and frightening",
    ],
    correctAnswer: 1,
    explanation: `The passage describes a heartwarming act of kindness and its positive outcome — creating a warm, uplifting tone.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

The MAIN purpose of this passage is to:`,
    options: [
      "Entertain readers with an exciting adventure",
      "Teach readers about grocery shopping",
      "Show the value and reward of helping others",
      "Describe the neighbourhood where Donovan lives",
    ],
    correctAnswer: 2,
    explanation: `The passage uses a simple narrative to illustrate the value of kindness — its purpose is both to tell a story and to teach.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

The word 'elderly' in the passage means:`,
    options: [
      "young",
      "very tall",
      "old",
      "unfriendly",
    ],
    correctAnswer: 2,
    explanation: `'Elderly' describes someone who is old. Miss Campbell is described as Donovan's elderly neighbour.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

Which BEST summarises this passage?`,
    options: [
      "Donovan is very hungry after school",
      "An eight-year-old boy spontaneously helps his elderly neighbour with groceries and feels proud after his mother praises his kindness",
      "Miss Campbell is a good cook",
      "Donovan's mother likes sweet potato pudding",
    ],
    correctAnswer: 1,
    explanation: `This captures the key events and the central message — the act of kindness and its reward.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

When Donovan's mother said 'kindness is always the right choice,' she was:`,
    options: [
      "criticising Donovan for being late",
      "rewarding him with a gift",
      "affirming that his kind action was morally correct and praising his character",
      "telling him to help Miss Campbell again",
    ],
    correctAnswer: 2,
    explanation: `The mother's words affirm the moral value of Donovan's action — confirming that kindness matters, regardless of any reward received.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

Which detail BEST shows that Miss Campbell was grateful?`,
    options: [
      "She gave him pudding and thanked him warmly",
      "She told Donovan's mother",
      "She went inside quickly",
      "She was struggling with her bags",
    ],
    correctAnswer: 0,
    explanation: `Offering food and thanking him warmly are the direct, explicit signs of Miss Campbell's gratitude.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

What does the passage suggest about the relationship between Donovan and Miss Campbell?`,
    options: [
      "They did not know each other",
      "They were family",
      "They were neighbours who knew and respected each other",
      "Miss Campbell was Donovan's teacher",
    ],
    correctAnswer: 2,
    explanation: `Donovan recognised her and described her as his neighbour — they had an established, respectful neighbourly relationship.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"One afternoon, eight-year-old Donovan noticed that his elderly neighbour, Miss Campbell, was struggling to carry her groceries up the front steps. Without being asked, he ran over and helped her with the heavy bags. Miss Campbell thanked him warmly and offered him a slice of sweet potato pudding. Donovan felt a glow of pride as he walked home. His mother smiled when he told her what he had done and said that kindness is always the right choice."

'Donovan felt a glow of pride.' This is an example of:`,
    options: [
      "Simile",
      "Metaphor",
      "Alliteration",
      "Onomatopoeia",
    ],
    correctAnswer: 1,
    explanation: `Pride is compared to warmth (a glow) through metaphor — giving an abstract feeling a concrete, sensory quality.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'generous'?`,
    options: [
      "selfish",
      "stingy",
      "charitable",
      "mean",
    ],
    correctAnswer: 2,
    explanation: `'Charitable' means willing to give or help — a synonym for 'generous.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'grateful' is:`,
    options: [
      "thankful",
      "appreciative",
      "indifferent",
      "warm",
    ],
    correctAnswer: 2,
    explanation: `'Indifferent' means uncaring or unfeeling — the opposite of grateful (appreciative).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The boy's act of COMPASSION moved everyone in the room to tears. 'Compassion' means:`,
    options: [
      "anger and frustration",
      "indifference and coldness",
      "deep sympathy and care for others' suffering",
      "pride and arrogance",
    ],
    correctAnswer: 2,
    explanation: `'Compassion' is deep sympathy and a desire to help those who suffer — a warm, caring response.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Her kindness was a warm blanket on a cold day.' This is a:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Onomatopoeia",
    ],
    correctAnswer: 1,
    explanation: `'Was a warm blanket' directly compares kindness to a blanket — a metaphor.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'volunteer' means:`,
    options: [
      "someone paid to do a job",
      "someone who helps of their own free will, without being asked or paid",
      "someone who refuses to help",
      "a type of community leader",
    ],
    correctAnswer: 1,
    explanation: `A 'volunteer' offers help freely and without payment — acting from choice, not obligation.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'kind' as a NOUN (meaning a type or category)?`,
    options: [
      "She was kind to her neighbour",
      "What kind of mango is this?",
      "He gave a kind smile",
      "Kindness matters",
    ],
    correctAnswer: 1,
    explanation: `'What kind of mango' uses 'kind' as a noun meaning a type or variety.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix em-",
    question: `The prefix 'em-' in 'empathy' means:`,
    options: [
      "without",
      "above",
      "into or within — causing feeling from inside",
      "before",
    ],
    correctAnswer: 2,
    explanation: `'Em-/en-' puts one inside something. Empathy means feeling INTO another's experience from within.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -ment",
    question: `Adding '-ment' to 'encourage' creates:`,
    options: [
      "encourages",
      "encouraged",
      "encouragement",
      "encouraging",
    ],
    correctAnswer: 2,
    explanation: `'-ment' turns a verb into a noun. 'Encouragement' = the act or result of encouraging.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Helping others is planting seeds for tomorrow.' This is a:`,
    options: [
      "Simile",
      "Personification",
      "Metaphor",
      "Hyperbole",
    ],
    correctAnswer: 2,
    explanation: `It directly compares helping to planting seeds — a metaphor suggesting small acts of kindness grow into future benefits.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The crowd ERUPTED in applause when the winner was announced. 'Erupted' means:`,
    options: [
      "whispered gently",
      "disappeared quietly",
      "burst out suddenly and powerfully",
      "waited patiently",
    ],
    correctAnswer: 2,
    explanation: `'Erupted' means broke out suddenly and forcefully — like a volcano, the applause was immediate and overwhelming.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Abstract Nouns",
    question: `Which is an ABSTRACT NOUN?`,
    options: [
      "pudding",
      "steps",
      "kindness",
      "neighbour",
    ],
    correctAnswer: 2,
    explanation: `Abstract nouns name things we cannot physically see or touch. 'Kindness' is a quality — an abstract noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Linking Verbs",
    question: `Which sentence contains a LINKING VERB?`,
    options: [
      "She ran to the shop",
      "He kicked the ball",
      "The pudding smells delicious",
      "She carried the bags upstairs",
    ],
    correctAnswer: 2,
    explanation: `'Smells' links the subject (pudding) to a description (delicious) — it is a linking verb.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives — Superlative",
    question: `Choose the SUPERLATIVE form of 'good':`,
    options: [
      "more good",
      "gooder",
      "better",
      "best",
    ],
    correctAnswer: 3,
    explanation: `The superlative of 'good' is 'best' — used to compare three or more things.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Adverbs of Manner",
    question: `Which word is an ADVERB OF MANNER in: 'Donovan ran quickly to help his neighbour.'?`,
    options: [
      "ran",
      "neighbour",
      "Donovan",
      "quickly",
    ],
    correctAnswer: 3,
    explanation: `'Quickly' tells HOW Donovan ran — it is an adverb of manner.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Exclamation Mark",
    question: `Which sentence correctly uses an EXCLAMATION MARK?`,
    options: [
      "She helped the neighbour.",
      "Did you help her?",
      "What a kind thing to do!",
      "Go to the shop",
    ],
    correctAnswer: 2,
    explanation: `Exclamation marks express strong emotion. 'What a kind thing to do!' expresses admiration or surprise.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Future Tense",
    question: `Choose the correct FUTURE TENSE form: 'Tomorrow, she ___ her neighbour with the garden.'`,
    options: [
      "helped",
      "helps",
      "will help",
      "was helping",
    ],
    correctAnswer: 2,
    explanation: `'Tomorrow' signals the future. 'Will help' is the simple future tense.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Object Pronouns",
    question: `Choose the correct OBJECT PRONOUN: 'Miss Campbell thanked ___ for his help.'`,
    options: [
      "he",
      "his",
      "him",
      "himself",
    ],
    correctAnswer: 2,
    explanation: `After a verb, use an object pronoun. 'Him' is the object pronoun referring to Donovan.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Verb Tense Consistency",
    question: `Which sentence has CONSISTENT tenses?`,
    options: [
      "She walked over and offers to help",
      "She walks over and offered to help",
      "She walked over and offered to help",
      "She walks over and offer to help",
    ],
    correctAnswer: 2,
    explanation: `All verbs must be in the same tense. 'Walked and offered' are both past tense — consistent.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Prepositions",
    question: `Identify the PREPOSITION in: 'Donovan walked home with a warm feeling of pride.'`,
    options: [
      "walked",
      "warm",
      "with",
      "feeling",
    ],
    correctAnswer: 2,
    explanation: `A preposition shows a relationship between words. 'With' shows what accompanied Donovan — it is a preposition.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Complex Sentences",
    question: `Which is a COMPLEX sentence?`,
    options: [
      "Donovan helped his neighbour",
      "Donovan helped and Miss Campbell thanked him",
      "Although he was young, Donovan helped without being asked",
      "He helped and he was proud",
    ],
    correctAnswer: 2,
    explanation: `A complex sentence has one main clause + a subordinate clause. 'Although he was young' is the subordinate clause.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Narrative Voice",
    question: `When writing a personal narrative about a kind act, which point of view is MOST common?`,
    options: [
      "Third person (he/she)",
      "Second person (you)",
      "First person (I/me) — the narrator tells their own story",
      "No particular point of view",
    ],
    correctAnswer: 2,
    explanation: `Personal narratives are told from the first person (I) — the narrator shares their own experience directly.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Show Don't Tell",
    question: `Which sentence SHOWS the character's feeling rather than just telling us?`,
    options: [
      "She was happy",
      "She felt very good",
      "Her face broke into a wide smile and her heart felt light as a feather",
      "She had positive emotions",
    ],
    correctAnswer: 2,
    explanation: `'Show don't tell' uses specific actions and physical sensations (smile, heart feeling light) to convey emotion rather than naming it.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Beginning of a Story",
    question: `Which is the MOST effective opening sentence for a story about a kind act?`,
    options: [
      "This story is about kindness",
      "I will tell you about when I helped someone",
      "Nobody expected much from an ordinary Tuesday afternoon — until eight-year-old Marcus spotted the old woman struggling at the gate",
      "Once upon a time there was a boy",
    ],
    correctAnswer: 2,
    explanation: `A strong narrative opening creates immediate interest through specific detail, a specific time, and a hint of something about to happen.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Building to a Climax",
    question: `In a narrative, the CLIMAX is:`,
    options: [
      "The beginning of the story",
      "The background information about characters",
      "The most exciting or significant moment — when the central action or decision occurs",
      "The final sentence",
    ],
    correctAnswer: 2,
    explanation: `The climax is the turning point or peak of the story — the moment of greatest tension or significance.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Moral of the Story",
    question: `When a writer includes a MORAL in a narrative, they are:`,
    options: [
      "Adding unnecessary extra information",
      "Only writing for young children",
      "Using the story to convey a deeper lesson or truth about life",
      "Ending the story abruptly",
    ],
    correctAnswer: 2,
    explanation: `A moral is a lesson conveyed through the story — a truth about life or human values that the narrative illustrates.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy6Questions : g5LaEasy6Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const calcScore  = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct   = () => Math.round((calcScore() / totalQuestions) * 100)

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
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 6</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Easy Level</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isPremium && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Free Preview Mode</p>
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
              <p className="text-slate-700">This Grade 5 Language Arts test covers reading comprehension, vocabulary in context, grammar and language use, and writing skills — all aligned to the NSC curriculum.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: analysing texts and evaluating language choices</li>
                <li>Communication: understanding how language works in context</li>
                <li>Creativity: recognising and applying effective writing techniques</li>
                <li>Collaboration: understanding how writers address their audience</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700">Start Test</Button>
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
              <p className="text-slate-600">Language Arts Easy 6</p>
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
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">You completed the free preview.</p><p className="text-sm text-amber-700">Upgrade to unlock all 40 questions.</p><Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 6</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade to Premium to access the full test.</p></div>)}
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
