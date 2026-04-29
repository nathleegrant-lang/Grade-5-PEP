"use client"

import { useState, useEffect, useCallback } from "react"
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

const g5LaEasy10Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

What is this passage MAINLY about?`,
    options: [
      "Something unrelated",
      "The topic described in the caring for the environment passage",
      "A completely different subject",
      "A character only",
    ],
    correctAnswer: 1,
    explanation: `The passage is centred on caring for the environment — this is the main topic.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

Which statement is directly supported by details in the passage?`,
    options: [
      "The passage gives no details",
      "All details are opinions",
      "The passage includes specific factual details",
      "Only one fact is given",
    ],
    correctAnswer: 2,
    explanation: `The passage includes multiple specific details that directly support the topic.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

What can you INFER from reading this passage?`,
    options: [
      "The author has no opinion",
      "The topic is unimportant",
      "The author finds the topic significant and wants the reader to understand it",
      "The passage is unfinished",
    ],
    correctAnswer: 2,
    explanation: `The amount of detail and language used suggest the author finds this topic important.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

The word 'unique' most nearly means:`,
    options: [
      "ordinary and common",
      "found everywhere",
      "one-of-a-kind and special",
      "large and impressive",
    ],
    correctAnswer: 2,
    explanation: `'Unique' means one-of-a-kind — unlike anything else.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

What causes the events or situation described in the passage?`,
    options: [
      "Nothing — events happen randomly",
      "Human actions or natural forces described in the passage",
      "External events not mentioned",
      "Only luck",
    ],
    correctAnswer: 1,
    explanation: `The passage describes specific causes that lead to the events or situation it discusses.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

The MAIN purpose of this passage is to:`,
    options: [
      "Entertain with fiction",
      "Give instructions",
      "Inform the reader about the topic",
      "Advertise a product",
    ],
    correctAnswer: 2,
    explanation: `The passage conveys information about a topic in a clear, explanatory way.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

Which statement BEST summarises this passage?`,
    options: [
      "Only one idea matters",
      "The passage has no clear message",
      "The passage conveys information about a specific topic in a structured way",
      "The passage is too short to summarise",
    ],
    correctAnswer: 2,
    explanation: `A good summary captures the main topic and structure of the passage.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

The tone of this passage is BEST described as:`,
    options: [
      "Angry",
      "Informative and thoughtful",
      "Completely humorous",
      "Fearful",
    ],
    correctAnswer: 1,
    explanation: `The language is measured and purposeful — informative and thoughtful.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

How is the information in this passage MAINLY organised?`,
    options: [
      "In random order",
      "By listing unrelated facts",
      "In a logical sequence that builds understanding",
      "By arguing two opposite points",
    ],
    correctAnswer: 2,
    explanation: `The passage builds information logically, moving from one idea to the next.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Literal",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

What is ONE specific fact stated directly in the passage?`,
    options: [
      "An opinion about the topic",
      "A personal story",
      "A verifiable detail that appears in the passage",
      "A prediction about the future",
    ],
    correctAnswer: 2,
    explanation: `The passage contains at least one verifiable, directly stated fact about the topic.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

A writer uses vivid descriptions in the passage. This technique helps readers to:`,
    options: [
      "Feel confused",
      "Stop reading",
      "Form a clear mental image",
      "Focus only on facts",
    ],
    correctAnswer: 2,
    explanation: `Vivid descriptions create mental images that help readers engage with and understand the text.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

The word 'essential' most nearly means:`,
    options: [
      "unnecessary",
      "unimportant",
      "extremely important and needed",
      "slightly useful",
    ],
    correctAnswer: 2,
    explanation: `'Essential' means absolutely necessary or extremely important.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

Based on this passage, what can you conclude about the topic?`,
    options: [
      "It is trivial and unimportant",
      "It is complex but understandable when explained clearly",
      "It is impossible to understand",
      "It is only relevant to adults",
    ],
    correctAnswer: 1,
    explanation: `The passage presents a topic in a way that makes it accessible — showing it can be understood when explained well.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

This passage was MOST LIKELY written for:`,
    options: [
      "Only experts in the field",
      "Young students studying the topic",
      "Government officials",
      "Scientists with advanced degrees",
    ],
    correctAnswer: 1,
    explanation: `The language and content are pitched at a student level, suggesting the audience is young learners.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Comparing Ideas",
    question: `Read the passage then answer the questions.

"The environment around us needs our care and attention. Every time someone drops litter on the street or in a river, they cause harm to plants, animals, and other people who use those spaces. Simple actions — like putting rubbish in bins, turning off taps when they are not needed, and planting trees — can make a real difference. When students learn to respect the environment from an early age, they grow into adults who make better choices for the planet."

How are different ideas or details in the passage connected?`,
    options: [
      "They are unrelated",
      "They contradict each other",
      "They all support the main topic",
      "They are from different sources",
    ],
    correctAnswer: 2,
    explanation: `All details and ideas in the passage relate to and support the central topic.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `A SYNONYM for 'courageous' is:`,
    options: [
      "fearful",
      "cowardly",
      "brave",
      "timid",
    ],
    correctAnswer: 2,
    explanation: `'Brave' and 'courageous' both mean willing to face danger or difficulty.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'victory' is:`,
    options: [
      "success",
      "triumph",
      "win",
      "defeat",
    ],
    correctAnswer: 3,
    explanation: `The opposite of victory (winning) is defeat (losing).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The teacher spoke in a HUSHED voice during the test. 'Hushed' means:`,
    options: [
      "very loud",
      "whispering and quiet",
      "angry and firm",
      "slow and confused",
    ],
    correctAnswer: 1,
    explanation: `'Hushed' describes a very quiet, soft voice — appropriate for not disturbing a test.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Life is a journey.' This is an example of:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 1,
    explanation: `A metaphor directly states one thing IS another. Life is directly compared to a journey.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'preserve' means:`,
    options: [
      "to destroy",
      "to forget",
      "to keep safe and protect",
      "to ignore completely",
    ],
    correctAnswer: 2,
    explanation: `'Preserve' means to protect or maintain something so it is not lost or damaged.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'wave' as a VERB?`,
    options: [
      "The wave crashed against the rocks",
      "She gave a little wave goodbye",
      "He began to wave his hand to get attention",
      "The wave was enormous",
    ],
    correctAnswer: 2,
    explanation: `In 'began to wave his hand,' 'wave' is a verb — it describes an action.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix dis-",
    question: `The prefix 'dis-' in 'disagree' means:`,
    options: [
      "again",
      "very",
      "not or opposite",
      "before",
    ],
    correctAnswer: 2,
    explanation: `'Dis-' means not or the opposite of. Disagree = not agree.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -ly",
    question: `Adding '-ly' to 'quiet' creates 'quietly', which is:`,
    options: [
      "A noun",
      "An adjective",
      "A verb",
      "An adverb",
    ],
    correctAnswer: 3,
    explanation: `The suffix '-ly' typically turns adjectives into adverbs. 'Quietly' tells HOW something is done.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The old house groaned in the wind.' This is:`,
    options: [
      "Simile",
      "Hyperbole",
      "Personification",
      "Metaphor",
    ],
    correctAnswer: 2,
    explanation: `The house is given the human action of groaning — this is personification.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The chef created an ELABORATE meal with many courses. 'Elaborate' means:`,
    options: [
      "simple and quick",
      "very detailed and complex",
      "plain and tasteless",
      "small and basic",
    ],
    correctAnswer: 1,
    explanation: `An elaborate meal is complex, detailed, and carefully prepared — not simple.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Noun Types",
    question: `Which word is a COLLECTIVE NOUN?`,
    options: [
      "teacher",
      "run",
      "flock",
      "blue",
    ],
    correctAnswer: 2,
    explanation: `A collective noun names a group. 'Flock' names a group of birds.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Types",
    question: `Which sentence uses a HELPING VERB?`,
    options: [
      "She runs fast",
      "The bird sings",
      "He has finished his work",
      "They played football",
    ],
    correctAnswer: 2,
    explanation: `'Has' is the helping (auxiliary) verb. 'Has finished' = helping + main verb.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives — Superlative",
    question: `Choose the SUPERLATIVE form of 'good':`,
    options: [
      "gooder",
      "more good",
      "better",
      "best",
    ],
    correctAnswer: 3,
    explanation: `The superlative form of 'good' is 'best' — used to compare three or more things.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Adverbs — Frequency",
    question: `Which word is an ADVERB OF FREQUENCY?`,
    options: [
      "quickly",
      "beautiful",
      "always",
      "run",
    ],
    correctAnswer: 2,
    explanation: `Adverbs of frequency say how often something happens. 'Always' tells us frequency.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Question Mark",
    question: `Which sentence requires a QUESTION MARK?`,
    options: [
      "She went to the shop",
      "Open the window",
      "How many books did she read",
      "What a great day",
    ],
    correctAnswer: 2,
    explanation: `'How many books did she read' is a question — it requires a question mark (?)`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Present Perfect Tense",
    question: `Which sentence is in the PRESENT PERFECT tense?`,
    options: [
      "She sang a song",
      "She has sung a song",
      "She will sing a song",
      "She sings a song",
    ],
    correctAnswer: 1,
    explanation: `'Has sung' uses the present perfect form: has/have + past participle.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Pronouns — Possessive",
    question: `Which is a POSSESSIVE PRONOUN?`,
    options: [
      "I",
      "me",
      "mine",
      "myself",
    ],
    correctAnswer: 2,
    explanation: `Possessive pronouns show ownership without needing a noun: mine, yours, his, hers, ours, theirs.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions — Subordinating",
    question: `Which is a SUBORDINATING CONJUNCTION?`,
    options: [
      "and",
      "or",
      "but",
      "because",
    ],
    correctAnswer: 3,
    explanation: `'Because' introduces a subordinate clause explaining why. It is a subordinating conjunction.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Direct Speech",
    question: `Which sentence correctly punctuates DIRECT SPEECH?`,
    options: [
      "She said, \"I am ready.\"",
      "She said \"I am ready\"",
      "She said, I am ready.",
      "She said \"I am ready.\"",
    ],
    correctAnswer: 0,
    explanation: `Direct speech requires a comma after the reporting verb, and the spoken words are enclosed in quotation marks.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Types — Compound",
    question: `A COMPOUND SENTENCE contains:`,
    options: [
      "One main clause only",
      "One main clause and one subordinate clause",
      "Two or more main clauses joined by a conjunction",
      "A question and a command",
    ],
    correctAnswer: 2,
    explanation: `A compound sentence joins two or more independent (main) clauses, usually with conjunctions like 'and,' 'but,' or 'so.'`
  },
  {
    id: 36,
    type: "writing",
    skill: "Persuasive Techniques",
    question: `Which technique is used in PERSUASIVE writing?`,
    options: [
      "Using only personal stories",
      "Avoiding any facts",
      "Presenting evidence and strong reasons to convince the reader",
      "Describing characters in great detail",
    ],
    correctAnswer: 2,
    explanation: `Persuasive writing uses evidence, reasons, and arguments to convince the reader to agree with a point of view.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Narrative Elements",
    question: `Which element is NOT part of a narrative?`,
    options: [
      "Characters",
      "Plot",
      "Bibliography",
      "Setting",
    ],
    correctAnswer: 2,
    explanation: `A bibliography lists sources — it is not part of a narrative. Characters, plot, and setting are narrative elements.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Conclusion",
    question: `A well-written conclusion should:`,
    options: [
      "Introduce a brand new idea",
      "Copy the introduction exactly",
      "Summarise the main points and leave the reader with a final thought",
      "List all the facts again in full detail",
    ],
    correctAnswer: 2,
    explanation: `A conclusion wraps up the writing by summarising key points and offering a closing thought.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Register",
    question: `A student writes a formal letter to a company. Which greeting is MOST appropriate?`,
    options: [
      "Hey there!",
      "Yo, what's up?",
      "Dear Sir or Madam,",
      "Hi friend,",
    ],
    correctAnswer: 2,
    explanation: `'Dear Sir or Madam' is the correct formal greeting for a letter to an unknown recipient.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Purpose of Paragraphs",
    question: `WHY do writers divide their writing into paragraphs?`,
    options: [
      "To fill more pages",
      "To confuse the reader",
      "To organise ideas clearly and make the text easier to read",
      "To use more words",
    ],
    correctAnswer: 2,
    explanation: `Paragraphs group related ideas together, making writing organised and easier to follow.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy10MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy10Questions : g5LaEasy10Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 10</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 10</p>
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
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">You completed the free preview.</p>
                  <p className="text-sm text-amber-700">Upgrade to unlock all 40 questions.</p>
                  <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link>
                </div>
              )}
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
                <p className="text-slate-700">Review each explanation to understand why the correct answer is right. Focus on the sections where your score was lowest — re-reading passages carefully and practising grammar rules will help improve your performance.</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 10</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p>
              <p className="text-sm text-amber-700">Upgrade to Premium to access the full test.</p>
            </div>
          )}
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
              ? <Button onClick={() => setShowResults(true)} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
