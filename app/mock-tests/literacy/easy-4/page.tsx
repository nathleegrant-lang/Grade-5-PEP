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

const g5LaEasy4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What is this passage MAINLY about?`,
    options: [
      "The dangers of hurricanes in the Caribbean",
      "A family preparing for a hurricane together",
      "Mr. Williams's skills in building",
      "The importance of canned food",
    ],
    correctAnswer: 1,
    explanation: `The passage describes the Williams family working together to prepare for a hurricane — this is the main topic.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What did Mr. Williams do to the windows?`,
    options: [
      "Painted them",
      "Nailed wooden boards over them",
      "Replaced them with new glass",
      "Left them open for air",
    ],
    correctAnswer: 1,
    explanation: `The passage says Mr. Williams 'nailed wooden boards over the windows.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What can you infer about the Williams family based on this passage?`,
    options: [
      "They were not worried about the storm",
      "They were well-organised and worked as a team",
      "Only Mr. Williams prepared for the storm",
      "They left the house before the storm arrived",
    ],
    correctAnswer: 1,
    explanation: `Every family member had a specific role — showing they were organised and worked as a team.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

The word 'stocked' in the passage means:`,
    options: [
      "emptied out",
      "broke apart",
      "filled up with supplies",
      "cleaned thoroughly",
    ],
    correctAnswer: 2,
    explanation: `'Stocked shelves with canned food' means filling the shelves with supplies in preparation.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

WHY did the family board up the windows?`,
    options: [
      "To keep cool",
      "To prevent hurricane damage",
      "Because the glass was broken",
      "To block out the sunlight",
    ],
    correctAnswer: 1,
    explanation: `Boarding up windows is a standard hurricane preparation to protect against high winds and flying objects.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What did Mrs. Williams do BEFORE stocking the shelves with canned food?`,
    options: [
      "She boarded up the windows",
      "She helped the children",
      "She filled containers with drinking water",
      "She brought in the furniture",
    ],
    correctAnswer: 2,
    explanation: `The passage says she 'filled containers with drinking water AND stocked shelves with canned food' — water came first in the sentence.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Character",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

How would you describe the Williams family's response to the hurricane warning?`,
    options: [
      "Slow and confused",
      "Frightened and helpless",
      "Calm, organised, and cooperative",
      "Unconcerned and unprepared",
    ],
    correctAnswer: 2,
    explanation: `Each person had tasks and carried them out efficiently — calm, organised, and cooperative.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What did the children help gather?`,
    options: [
      "Furniture",
      "Boards and nails",
      "Candles, flashlights, and blankets",
      "Canned food",
    ],
    correctAnswer: 2,
    explanation: `'The children helped by gathering candles, flashlights, and blankets.'`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

The tone of this passage is BEST described as:`,
    options: [
      "Panicked and fearful",
      "Calm and informative",
      "Humorous",
      "Critical and negative",
    ],
    correctAnswer: 1,
    explanation: `The family responds logically and without panic — the tone is calm and matter-of-fact.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

Which sentence BEST summarises this passage?`,
    options: [
      "Hurricanes are very dangerous storms",
      "The Williams family calmly and efficiently prepared their home for a hurricane",
      "Mr. Williams is very good at building",
      "Canned food is important during a storm",
    ],
    correctAnswer: 1,
    explanation: `This captures the who, what, and result of the passage.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

The phrase 'as ready as they could be' suggests:`,
    options: [
      "The family was completely unprepared",
      "The family had done everything possible to prepare",
      "The storm was not dangerous",
      "The family was scared",
    ],
    correctAnswer: 1,
    explanation: `This phrase means they had done all they could — they were as prepared as possible.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

Which statement is an OPINION?`,
    options: [
      "The children gathered candles and blankets",
      "Mrs. Williams filled containers with water",
      "Mr. Williams is the best father in Jamaica",
      "A hurricane warning was announced",
    ],
    correctAnswer: 2,
    explanation: `This is an opinion — a personal judgement that cannot be verified. The others are facts from the passage.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

Why did the author write this passage?`,
    options: [
      "To scare readers about hurricanes",
      "To teach readers how to prepare for a hurricane",
      "To entertain readers with a funny family story",
      "To describe hurricane damage",
    ],
    correctAnswer: 1,
    explanation: `The passage shows step-by-step how a family prepares — the purpose is informative/instructional.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

What does the passage suggest about hurricane preparation?`,
    options: [
      "It is unnecessary",
      "It should be done alone",
      "It is easier and more effective when everyone helps",
      "Only adults should prepare",
    ],
    correctAnswer: 2,
    explanation: `Every family member contributed — suggesting preparation is easier and more effective as a team.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the questions.

"When a hurricane warning was announced on the radio, the Williams family worked quickly to prepare their home. Mr. Williams brought the outdoor furniture inside and nailed wooden boards over the windows. Mrs. Williams filled containers with drinking water and stocked shelves with canned food. The children helped by gathering candles, flashlights, and blankets. By the time the storm arrived, the family felt as ready as they could be."

Which detail BEST shows that the family took the hurricane seriously?`,
    options: [
      "Mrs. Williams cooked a meal",
      "The radio made the announcement",
      "Every family member had a specific preparation task",
      "They locked the front door",
    ],
    correctAnswer: 2,
    explanation: `Each person completing assigned tasks shows the family recognised the severity of the storm.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `A SYNONYM for 'determined' is:`,
    options: [
      "confused",
      "weak",
      "persistent",
      "relaxed",
    ],
    correctAnswer: 2,
    explanation: `'Persistent' means continuing despite difficulty — similar to 'determined.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'expensive' is:`,
    options: [
      "costly",
      "valuable",
      "cheap",
      "luxurious",
    ],
    correctAnswer: 2,
    explanation: `The opposite of expensive (high-priced) is cheap (low-priced).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The river was MURKY after the heavy rain. 'Murky' most likely means:`,
    options: [
      "clear and bright",
      "dark and cloudy",
      "warm and shallow",
      "cool and flowing",
    ],
    correctAnswer: 1,
    explanation: `Rain stirs up sediment, making water dark and cloudy — murky.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'He ran as fast as the wind.' This is a:`,
    options: [
      "Metaphor",
      "Simile",
      "Personification",
      "Hyperbole",
    ],
    correctAnswer: 1,
    explanation: `It uses 'as…as' to compare his speed to the wind — a simile.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'anxious' means:`,
    options: [
      "excited and happy",
      "worried and nervous",
      "calm and peaceful",
      "tired and bored",
    ],
    correctAnswer: 1,
    explanation: `'Anxious' describes feeling worried or nervous, especially about something uncertain.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'fair' to mean equal or just?`,
    options: [
      "She has fair skin",
      "The school fair was held on Friday",
      "The judge's decision was fair to both sides",
      "She has fair hair",
    ],
    correctAnswer: 2,
    explanation: `'Fair' meaning equal/just describes the judge's decision being unbiased.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix mis-",
    question: `The prefix 'mis-' in 'mistake' means:`,
    options: [
      "again",
      "not",
      "wrongly",
      "before",
    ],
    correctAnswer: 2,
    explanation: `'Mis-' means wrongly or incorrectly. A mistake is something done wrongly.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -tion",
    question: `Adding '-tion' to 'educate' creates 'education', which is:`,
    options: [
      "A verb",
      "An adjective",
      "A noun",
      "An adverb",
    ],
    correctAnswer: 2,
    explanation: `'-tion' turns a verb into a noun. Education is the noun form of educate.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The classroom was a zoo after lunch.' This is a:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 1,
    explanation: `It directly compares the classroom to a zoo without using 'like' or 'as' — a metaphor.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The athlete was EXHAUSTED after the long race. 'Exhausted' means:`,
    options: [
      "energetic",
      "angry",
      "extremely tired",
      "very hungry",
    ],
    correctAnswer: 2,
    explanation: `After a long race, an athlete would be extremely tired — exhausted.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Types of Nouns",
    question: `Which noun is an ABSTRACT NOUN?`,
    options: [
      "table",
      "teacher",
      "happiness",
      "book",
    ],
    correctAnswer: 2,
    explanation: `Abstract nouns name things we cannot physically touch or see. 'Happiness' is a feeling — abstract.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verbs",
    question: `Which sentence contains a LINKING VERB?`,
    options: [
      "She runs every morning",
      "The soup smells delicious",
      "He threw the ball",
      "They played in the rain",
    ],
    correctAnswer: 1,
    explanation: `'Smells' is a linking verb — it connects the subject (soup) to a description (delicious).`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives — Comparative",
    question: `Choose the COMPARATIVE form of 'tall':`,
    options: [
      "tallest",
      "more tall",
      "taller",
      "tallly",
    ],
    correctAnswer: 2,
    explanation: `To compare two things, add '-er' to short adjectives. 'Taller' compares two heights.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Adverbs",
    question: `Which word is an ADVERB in: 'She spoke quietly to her friend.'?`,
    options: [
      "spoke",
      "friend",
      "quietly",
      "she",
    ],
    correctAnswer: 2,
    explanation: `'Quietly' is an adverb — it tells HOW she spoke.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Comma",
    question: `Which sentence uses a comma CORRECTLY after an introductory phrase?`,
    options: [
      "After the game we ate lunch",
      "After the game, we ate lunch",
      "After, the game we ate lunch",
      "After the game we, ate lunch",
    ],
    correctAnswer: 1,
    explanation: `A comma is placed after an introductory phrase to separate it from the main clause.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Tense — Future",
    question: `Which sentence is in the FUTURE TENSE?`,
    options: [
      "She baked a cake",
      "She bakes a cake",
      "She will bake a cake",
      "She is baking a cake",
    ],
    correctAnswer: 2,
    explanation: `'Will bake' is the future tense — it describes something that has not happened yet.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Pronouns — Object",
    question: `Choose the correct OBJECT PRONOUN: 'The teacher gave the award to ___ .'`,
    options: [
      "I",
      "we",
      "them",
      "they",
    ],
    correctAnswer: 2,
    explanation: `Object pronouns (me, him, her, them, us) come after a verb or preposition. 'Them' is correct.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions",
    question: `Which conjunction shows CONTRAST?`,
    options: [
      "and",
      "because",
      "so",
      "but",
    ],
    correctAnswer: 3,
    explanation: `'But' joins two contrasting ideas (e.g., 'I wanted to go but it was raining').`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Apostrophe — Possession (plural)",
    question: `Which shows correct possession for several girls?`,
    options: [
      "the girl's bag",
      "the girls's bag",
      "the girls' bags",
      "the girls bags",
    ],
    correctAnswer: 2,
    explanation: `For a plural noun ending in s, add only an apostrophe: girls' bags.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Fragments",
    question: `Which is a COMPLETE SENTENCE?`,
    options: [
      "Running in the park",
      "Because she was tired",
      "The students completed the project on time",
      "After the heavy rain",
    ],
    correctAnswer: 2,
    explanation: `A complete sentence has a subject and a predicate. 'The students completed the project on time' has both.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `A student writes an article for the school newspaper about how plastic waste harms marine life. The purpose is to:`,
    options: [
      "Entertain readers with a funny story",
      "Persuade and inform readers about an environmental problem",
      "Describe how plastic is made",
      "Tell the history of the ocean",
    ],
    correctAnswer: 1,
    explanation: `An article about environmental harm aims to inform and persuade readers to care about the issue.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Planning — Brainstorm",
    question: `When a writer BRAINSTORMS ideas, they are:`,
    options: [
      "Editing their completed work",
      "Jotting down any and all ideas before organising them",
      "Writing their final draft",
      "Proofreading for errors",
    ],
    correctAnswer: 1,
    explanation: `Brainstorming is the creative phase where a writer generates many ideas freely before deciding which to use.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Paragraph Structure",
    question: `Which element CORRECTLY identifies the THREE main parts of a paragraph?`,
    options: [
      "Introduction, climax, resolution",
      "Topic sentence, supporting details, concluding sentence",
      "Title, body, bibliography",
      "Hook, plot, theme",
    ],
    correctAnswer: 1,
    explanation: `A well-structured paragraph has a topic sentence (main idea), supporting details (evidence/examples), and a concluding sentence.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Audience",
    question: `A student writes a poster to warn young children about road safety. Which language is MOST appropriate?`,
    options: [
      "Use long, complex sentences with technical vocabulary",
      "Use simple words, short sentences, and bright colours",
      "Use academic references and footnotes",
      "Use mostly numbers and statistics",
    ],
    correctAnswer: 1,
    explanation: `For young children, simple, clear language and visual appeal are most effective.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Editing",
    question: `After finishing a first draft, a writer should:`,
    options: [
      "Submit it immediately without reading it again",
      "Delete the whole piece and start again",
      "Read it carefully and make improvements",
      "Ask someone else to rewrite it completely",
    ],
    correctAnswer: 2,
    explanation: `Reviewing and improving a first draft is called editing — it is an essential step in producing quality writing.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy4MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy4Questions : g5LaEasy4Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 4</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 4</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 4</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
