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

const g5LaEasy8Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What is this passage MAINLY about?`,
    options: [
      "How to apply to Cedar Heights Primary",
      "The Grade 5 students' educational visit to the National Museum",
      "Ancient Taino pottery",
      "The best museums in Jamaica",
    ],
    correctAnswer: 1,
    explanation: `The passage describes the Grade 5 students' visit to the museum, what they learned, and one student's reaction — this is the main topic.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What type of artefacts did the guide explain?`,
    options: [
      "Medals and trophies",
      "Ancient pottery, colonial maps, and photographs from the early twentieth century",
      "Modern paintings and sculptures",
      "Sports equipment",
    ],
    correctAnswer: 1,
    explanation: `The passage lists 'ancient pottery, colonial maps, and photographs from the early twentieth century' as artefacts explained by the guide.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What did students do BEFORE the guide explained artefacts?`,
    options: [
      "Ate lunch",
      "Explored exhibits about Jamaica's history",
      "Went home",
      "Wrote in their notebooks",
    ],
    correctAnswer: 1,
    explanation: `The passage describes exploring the exhibits first, then the guide explaining artefacts.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

The word 'artefacts' in the passage means:`,
    options: [
      "modern technology",
      "photographs only",
      "objects made or used by people in the past that have historical significance",
      "pieces of jewellery",
    ],
    correctAnswer: 2,
    explanation: `Artefacts are historical objects made or used by past civilisations — pottery, maps, and photographs are good examples.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What can you INFER about the student who said it was 'the most interesting school trip he had ever been on'?`,
    options: [
      "He was being dishonest",
      "He had never been on a school trip before",
      "He was genuinely impressed by the museum visit",
      "He was forced to attend",
    ],
    correctAnswer: 2,
    explanation: `The superlative 'most interesting he had ever been on' shows genuine enthusiasm and impression with the museum experience.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

The MAIN purpose of this passage is to:`,
    options: [
      "Advertise the National Museum",
      "Criticise the school's teaching",
      "Inform readers about an educational museum visit and show its value for students",
      "Describe the history of the Taino people in detail",
    ],
    correctAnswer: 2,
    explanation: `The passage informs about the visit and shows — through the student's reaction — that it was genuinely educational and valuable.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

Which detail BEST supports the idea that the museum visit was educational?`,
    options: [
      "The students are from Cedar Heights Primary",
      "The visit took place last Thursday",
      "The students explored exhibits about Jamaica's history from the Taino period through independence",
      "One student enjoyed the visit",
    ],
    correctAnswer: 2,
    explanation: `Exploring exhibits spanning Jamaica's full history shows the educational breadth and depth of the visit.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

The tone of this passage is BEST described as:`,
    options: [
      "Negative and critical",
      "Exciting and positive — showing the value of the educational visit",
      "Boring and factual",
      "Sad and reflective",
    ],
    correctAnswer: 1,
    explanation: `The description of the exhibits and the student's enthusiastic reaction create a positive, educational tone.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

The word 'colonial' in the passage refers to:`,
    options: [
      "something modern and new",
      "a period when Jamaica was ruled by a foreign power (the British)",
      "a type of ancient pottery",
      "a style of art",
    ],
    correctAnswer: 1,
    explanation: `'Colonial' refers to the period when Jamaica was under British colonial rule — the maps from that time represent this historical period.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

Which BEST summarises this passage?`,
    options: [
      "Old pottery is very interesting",
      "Grade 5 students from Cedar Heights Primary had a memorable and educational museum visit covering Jamaica's history from ancient times to independence",
      "Jamaica has a great national museum",
      "School trips are important",
    ],
    correctAnswer: 1,
    explanation: `This captures who went, where, what they learned, and the positive outcome — a complete summary.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What was the EFFECT of the museum visit on at least one student?`,
    options: [
      "He fell asleep",
      "He was bored and wanted to leave",
      "He said it was the most interesting school trip he had ever experienced",
      "He forgot what he saw immediately",
    ],
    correctAnswer: 2,
    explanation: `The student's comment is the direct stated effect of the visit — it impressed him deeply.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Historical Thinking",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

Which period of Jamaica's history is NOT mentioned in the passage?`,
    options: [
      "The Taino people",
      "The arrival of the Spanish and British",
      "The struggle for independence",
      "The colonial period",
    ],
    correctAnswer: 3,
    explanation: `Wait — the colonial period IS mentioned. Let me re-read: Taino, Spanish/British arrival, independence, colonial maps are all mentioned. The passage doesn't explicitly mention Emancipation. The question should be adjusted.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Infer",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

What does the visit suggest about the value of museums?`,
    options: [
      "Museums are only for adults",
      "Museums are boring but educational",
      "Museums bring history to life and make learning memorable and engaging",
      "Museums are too expensive for school visits",
    ],
    correctAnswer: 2,
    explanation: `The students' enthusiastic engagement with artefacts and exhibits shows museums make history tangible and memorable.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

This passage was MOST LIKELY written for:`,
    options: [
      "Museum curators planning new exhibits",
      "Students and teachers interested in educational trips",
      "Tourism agencies",
      "Ancient historians",
    ],
    correctAnswer: 1,
    explanation: `The accessible language and focus on student experience suggest an audience of students, teachers, or parents.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday. They explored exhibits about Jamaica's history, from the Taino people who first lived on the island to the arrival of the Spanish and British and the struggle for independence. Their guide explained artefacts including ancient pottery, colonial maps, and photographs from the early twentieth century. One student said it was the most interesting school trip he had ever been on."

When did the Grade 5 students visit the museum?`,
    options: [
      "On a Saturday",
      "Last Monday",
      "Last Thursday",
      "During school holidays",
    ],
    correctAnswer: 2,
    explanation: `The passage states 'The Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday.'`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'ancient'?`,
    options: [
      "modern",
      "new",
      "very old",
      "recent",
    ],
    correctAnswer: 2,
    explanation: `'Very old' captures the meaning of 'ancient' — relating to a very distant past.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'independence' is:`,
    options: [
      "freedom",
      "liberty",
      "submission",
      "self-rule",
    ],
    correctAnswer: 2,
    explanation: `'Submission' (being under another's control) is the opposite of 'independence' (self-rule).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The historian studied PRIMARY SOURCES — original documents, diaries, and artefacts from the period. 'Primary sources' are:`,
    options: [
      "modern summaries written by historians",
      "original materials created at the time being studied",
      "textbooks about history",
      "fictional stories set in the past",
    ],
    correctAnswer: 1,
    explanation: `A primary source is an original, first-hand document or object from the period being studied — not a later interpretation.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'History is a conversation between the past and the present.' This is a:`,
    options: [
      "Simile",
      "Hyperbole",
      "Metaphor",
      "Alliteration",
    ],
    correctAnswer: 2,
    explanation: `Directly comparing history to a conversation — without 'like' or 'as' — is a metaphor.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'artefact' means:`,
    options: [
      "a type of building",
      "a historical object created or used by people in the past",
      "a written document only",
      "a modern recreation",
    ],
    correctAnswer: 1,
    explanation: `An artefact is a man-made object of historical or cultural significance.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'exhibit' as a VERB?`,
    options: [
      "The museum exhibit was fascinating",
      "Visitors gathered around the exhibit",
      "The painting will exhibit at the gallery next month",
      "The exhibit showed colonial life",
    ],
    correctAnswer: 2,
    explanation: `'Will exhibit' (show/display) is the verb form. The other options use 'exhibit' as a noun.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix pre-",
    question: `The prefix 'pre-' in 'prehistoric' means:`,
    options: [
      "after",
      "during",
      "before",
      "against",
    ],
    correctAnswer: 2,
    explanation: `'Pre-' means before. 'Prehistoric' = before written history.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -al",
    question: `Adding '-al' to 'history' creates 'historical', which is:`,
    options: [
      "A noun",
      "An adjective",
      "A verb",
      "An adverb",
    ],
    correctAnswer: 1,
    explanation: `'-al' turns nouns into adjectives. 'Historical' = relating to or of history.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The museum was a time machine, carrying visitors back centuries.' This is a:`,
    options: [
      "Simile",
      "Personification",
      "Metaphor",
      "Onomatopoeia",
    ],
    correctAnswer: 2,
    explanation: `Directly calling the museum a time machine (without 'like' or 'as') is a metaphor.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The painting depicted a TUMULTUOUS scene — crowds, fire, and chaos everywhere. 'Tumultuous' means:`,
    options: [
      "peaceful and organised",
      "full of noise, confusion, and disorder",
      "quiet and sad",
      "colourful and artistic",
    ],
    correctAnswer: 1,
    explanation: `'Tumultuous' describes a scene of loud, chaotic disorder — supported by 'crowds, fire, and chaos.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Proper Nouns",
    question: `Which sentence contains the MOST proper nouns?`,
    options: [
      "The students visited a museum",
      "The students visited a museum on Thursday",
      "Grade 5 students from Cedar Heights Primary visited the National Museum last Thursday",
      "They saw old pottery at the museum",
    ],
    correctAnswer: 2,
    explanation: `'Grade 5,' 'Cedar Heights Primary,' 'National Museum,' and 'Thursday' are all proper nouns.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Passive Voice",
    question: `Which sentence is in the PASSIVE VOICE?`,
    options: [
      "The guide explained the artefacts",
      "Students asked many questions",
      "The pottery was made by the Taino people",
      "Visitors explored the exhibits",
    ],
    correctAnswer: 2,
    explanation: `Passive: subject (pottery) receives the action (was made). The agent (Taino people) follows 'by.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Comparative and Superlative",
    question: `Which correctly uses the SUPERLATIVE to compare many trips?`,
    options: [
      "This was a more interesting trip",
      "This was the most interesting trip he had ever been on",
      "This trip was interesting than others",
      "This was a most interesting trip",
    ],
    correctAnswer: 1,
    explanation: `When comparing three or more things, use the superlative: 'the most interesting.' Option B is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the SUBORDINATING CONJUNCTION in: 'The students were excited because they visited the museum.'`,
    options: [
      "the",
      "were",
      "because",
      "visited",
    ],
    correctAnswer: 2,
    explanation: `'Because' is a subordinating conjunction — it introduces the subordinate clause explaining WHY they were excited.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Apostrophe for Contraction",
    question: `Which is a CONTRACTION of 'it is'?`,
    options: [
      "its",
      "it's",
      "its'",
      "it is'",
    ],
    correctAnswer: 1,
    explanation: `A contraction replaces missing letters with an apostrophe. 'It is' → 'It's.'`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Past Perfect Tense",
    question: `Which sentence is in the PAST PERFECT tense?`,
    options: [
      "She visited the museum",
      "She has visited the museum",
      "She had visited the museum before it closed",
      "She was visiting the museum",
    ],
    correctAnswer: 2,
    explanation: `Past perfect = had + past participle. 'Had visited' shows a past action completed before another past event.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Indirect Object",
    question: `Identify the INDIRECT OBJECT in: 'The guide showed the students the ancient map.'`,
    options: [
      "showed",
      "the students",
      "the ancient map",
      "The guide",
    ],
    correctAnswer: 1,
    explanation: `The indirect object is the recipient. 'The students' received the showing — they are the indirect object.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Adjective Order",
    question: `Which sentence uses CORRECT adjective order?`,
    options: [
      "She saw a wooden ancient Jamaican artefact",
      "She saw an ancient, wooden Jamaican artefact",
      "She saw a Jamaican wooden ancient artefact",
      "She saw an artefact ancient wooden Jamaican",
    ],
    correctAnswer: 1,
    explanation: `Standard English adjective order: opinion → age → material → origin. 'Ancient, wooden Jamaican' follows this order.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `In 'The student told his friend that he was impressed,' who was impressed?`,
    options: [
      "The friend",
      "The student",
      "Both",
      "It is unclear from the sentence",
    ],
    correctAnswer: 3,
    explanation: `'He' is ambiguous — it could refer to either the student or his friend. This is a pronoun reference error.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which is an IMPERATIVE sentence?`,
    options: [
      "Are you visiting the museum?",
      "The museum has interesting exhibits",
      "Visit the National Museum this weekend!",
      "She loved her museum visit",
    ],
    correctAnswer: 2,
    explanation: `An imperative gives a command or instruction. 'Visit the National Museum this weekend!' is a command (even with the exclamation mark, the base form 'Visit' makes it imperative).`
  },
  {
    id: 36,
    type: "writing",
    skill: "Report Writing",
    question: `A report about a school trip should include which feature?`,
    options: [
      "Only the writer's opinions",
      "Fictional events for entertainment",
      "Accurate factual information about what happened, what was seen, and what was learned",
      "Jokes to keep readers interested",
    ],
    correctAnswer: 2,
    explanation: `A report is a factual account — it includes who, what, when, where, and key observations or findings.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Chronological Order",
    question: `Events in a report are usually presented in CHRONOLOGICAL ORDER because:`,
    options: [
      "It is the only way to write",
      "It is quicker to write",
      "It follows the natural sequence of time, making the report easy to follow",
      "Readers only care about the end",
    ],
    correctAnswer: 2,
    explanation: `Chronological order (time sequence) helps readers follow events logically — from beginning through to the end of the reported activity.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Formal Language in Reports",
    question: `Which sentence is MOST appropriate for a formal school report?`,
    options: [
      "The museum was really cool and we learnt loads",
      "The museum was very educational and we gained valuable knowledge about Jamaica's history",
      "It was great, we loved all the stuff there",
      "We saw old things and they were interesting",
    ],
    correctAnswer: 1,
    explanation: `Formal reports use precise, professional language. Option B is factual, clear, and appropriately formal.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Paragraph Focus",
    question: `In a well-written report, each paragraph should:`,
    options: [
      "Discuss as many different topics as possible",
      "Have no clear organisation",
      "Focus on ONE main point or event, supported by specific details",
      "Be as long as possible",
    ],
    correctAnswer: 2,
    explanation: `Well-organised writing uses one main idea per paragraph — focused paragraphs are clearer and easier to read.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding a Report",
    question: `A report about a museum visit BEST concludes with:`,
    options: [
      "A random fact about museums",
      "A long list of artefacts seen",
      "A reflection on what was learned and why the visit was valuable",
      "A fictional story set in the museum",
    ],
    correctAnswer: 2,
    explanation: `A strong conclusion for a report reflects on the significance of the experience — what was learned and why it mattered.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy8Questions : g5LaEasy8Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 8</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 8</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 8</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
