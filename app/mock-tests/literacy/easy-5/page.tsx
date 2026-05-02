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

const g5LaEasy5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

What is this passage MAINLY about?`,
    options: [
      "The smell of freshly baked bread",
      "The local market as a place of community, commerce, and connection",
      "How mangoes are grown",
      "The best time to buy vegetables",
    ],
    correctAnswer: 1,
    explanation: `The passage describes the market as more than just a shop — it is a place where community gathers and connects. This is the main idea.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

What do vendors do to attract buyers?`,
    options: [
      "They offer free samples",
      "They arrange their stalls and call out prices",
      "They close early",
      "They only sell vegetables",
    ],
    correctAnswer: 1,
    explanation: `The passage states vendors 'arrange their stalls carefully, calling out prices to attract buyers.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

What can you INFER about the market from the phrase 'more than just a place to shop'?`,
    options: [
      "The market is very expensive",
      "The market has deep social and community value beyond buying and selling",
      "The market sells only crafts",
      "The market is only open on weekdays",
    ],
    correctAnswer: 1,
    explanation: `'More than just a place to shop' implies the market has value beyond commerce — it is central to community life.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

The word 'mingles' in the passage most nearly means:`,
    options: [
      "separates",
      "disappears",
      "mixes together",
      "replaces",
    ],
    correctAnswer: 2,
    explanation: `'Mingles' means mixes or blends together. The smells of bread and mango mix in the air.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Sensory Details",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

The author describes smells in the passage. What effect does this have?`,
    options: [
      "It makes the passage about food only",
      "It helps the reader imagine being at the market through sensory experience",
      "It tells us the market is a restaurant",
      "It shows the vendors are good cooks",
    ],
    correctAnswer: 1,
    explanation: `Using sensory details like smell (bread, mango, spices) makes the scene vivid and immersive for the reader.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

'The market comes alive.' This phrase is an example of:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 2,
    explanation: `The market is given the human quality of coming alive — this is personification.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

The author ends with 'it is where the community gathers and connects.' Why?`,
    options: [
      "To list all the things sold at the market",
      "To end with the market's deeper significance — its role as a community hub",
      "To show the market is crowded",
      "To advertise the market",
    ],
    correctAnswer: 1,
    explanation: `The final sentence shifts from description to meaning — revealing that the author sees the market as a social and cultural heart of the community.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

The tone of this passage is BEST described as:`,
    options: [
      "Negative and critical",
      "Warm and celebratory",
      "Factual and scientific",
      "Confused and uncertain",
    ],
    correctAnswer: 1,
    explanation: `The rich, colourful description and positive language ('alive,' 'gathers and connects') create a warm, celebratory tone.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

Which BEST summarises this passage?`,
    options: [
      "Markets sell food and crafts",
      "A local Saturday market is a vibrant hub of activity where the community comes together",
      "Vendors work hard on Saturdays",
      "Shoppers fill their baskets with vegetables",
    ],
    correctAnswer: 1,
    explanation: `This captures both the surface (market activity) and deeper meaning (community gathering) of the passage.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

Which phrase BEST shows the market's importance to the community?`,
    options: [
      "Vendors arrange their stalls carefully",
      "Shoppers move through the narrow lanes",
      "The market is more than just a place to shop — it is where the community gathers and connects",
      "The smell of freshly baked bread mingles with spices",
    ],
    correctAnswer: 2,
    explanation: `This phrase directly states the market's community significance — the strongest textual evidence.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

What do shoppers do AFTER moving through the lanes?`,
    options: [
      "They go home immediately",
      "They call out prices",
      "They fill their baskets with fruits, vegetables, and crafts",
      "They arrange stalls",
    ],
    correctAnswer: 2,
    explanation: `The passage says shoppers 'move through the narrow lanes, filling their baskets' — filling baskets happens as they move.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

The word 'vibrant' would BEST describe the market scene because:`,
    options: [
      "The market is dull and quiet",
      "The market is full of colour, energy, and life",
      "The market is very expensive",
      "The market is dangerous",
    ],
    correctAnswer: 1,
    explanation: `'Vibrant' means full of energy and colour — which perfectly describes this busy, colourful, lively market.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

Which statement is an OPINION about the market?`,
    options: [
      "Vendors call out prices",
      "The market smells of bread and mangoes",
      "The market is the best place to spend a Saturday morning",
      "Shoppers buy fruits and vegetables",
    ],
    correctAnswer: 2,
    explanation: `This is a personal judgement — an opinion. The others are directly stated facts from the passage.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Character",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

Based on the passage, how would you describe the vendors?`,
    options: [
      "Lazy and uninterested",
      "Energetic and engaged in their work",
      "Quiet and shy",
      "Angry at the buyers",
    ],
    correctAnswer: 1,
    explanation: `Vendors 'arrange their stalls carefully' and 'call out prices' — showing energy and engagement in their work.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the question.

"Every Saturday morning, the local market comes alive with colour, noise, and activity. Vendors arrange their stalls carefully, calling out prices to attract buyers. The smell of freshly baked bread mingles with the scent of ripe mangoes and spices. Shoppers move through the narrow lanes, filling their baskets with fruits, vegetables, and local crafts. The market is more than just a place to shop — it is where the community gathers and connects."

This passage was MOST LIKELY written for:`,
    options: [
      "Scientists studying markets",
      "A general audience, possibly students, to appreciate community and local culture",
      "Economists studying trade",
      "Market vendors only",
    ],
    correctAnswer: 1,
    explanation: `The warm, descriptive language and celebration of community life suggest an audience of general readers or students.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'vibrant'?`,
    options: [
      "dull",
      "colourless",
      "lively",
      "quiet",
    ],
    correctAnswer: 2,
    explanation: `'Lively' means full of energy and colour — a synonym for 'vibrant.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'plentiful' is:`,
    options: [
      "abundant",
      "scarce",
      "generous",
      "rich",
    ],
    correctAnswer: 1,
    explanation: `'Scarce' means in short supply — the opposite of 'plentiful' (abundant).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The vendor HAGGLED with the buyer until they agreed on a fair price. 'Haggled' means:`,
    options: [
      "shouted angrily",
      "bargained or negotiated back and forth",
      "refused to sell",
      "gave a discount immediately",
    ],
    correctAnswer: 1,
    explanation: `'Haggle' means to negotiate or bargain — going back and forth on a price until both sides agree.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The market is the heartbeat of our community.' This is an example of:`,
    options: [
      "Simile",
      "Alliteration",
      "Metaphor",
      "Personification",
    ],
    correctAnswer: 2,
    explanation: `The market is directly called 'the heartbeat' — comparing it to a vital organ through metaphor, not using 'like' or 'as.'`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'commerce' means:`,
    options: [
      "community events",
      "buying and selling of goods and services",
      "cooking and food preparation",
      "growing crops",
    ],
    correctAnswer: 1,
    explanation: `'Commerce' refers to trade — the buying and selling of goods and services.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses the word 'stall' to mean a vendor's stand at a market?`,
    options: [
      "The engine will stall if you do not keep it moving",
      "She set up her stall and arranged her mangoes neatly",
      "The negotiations stalled for three hours",
      "He tried to stall for time",
    ],
    correctAnswer: 1,
    explanation: `'Stall' meaning a market stand is a noun. 'She set up her stall' uses this meaning.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix inter-",
    question: `The prefix 'inter-' in 'interact' means:`,
    options: [
      "above",
      "against",
      "between or among",
      "again",
    ],
    correctAnswer: 2,
    explanation: `'Inter-' means between or among. 'Interact' = act between people — engage with each other.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -ful",
    question: `Which word uses '-ful' to mean 'full of colour'?`,
    options: [
      "colourless",
      "colourful",
      "recolour",
      "colouring",
    ],
    correctAnswer: 1,
    explanation: `'-ful' means full of. 'Colourful' = full of colour.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Business was as slow as a tortoise that morning.' This is a:`,
    options: [
      "Metaphor",
      "Personification",
      "Simile",
      "Hyperbole",
    ],
    correctAnswer: 2,
    explanation: `It uses 'as...as' to compare business to a tortoise — a simile.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The mango was RIPE — soft, golden-yellow, and dripping with sweet juice. 'Ripe' means:`,
    options: [
      "unready for eating",
      "fully grown and ready to eat",
      "too old and rotten",
      "unripe and hard",
    ],
    correctAnswer: 1,
    explanation: `'Ripe' describes fruit at its peak, ready to eat — supported by 'soft, golden-yellow, and sweet.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Common vs Proper Nouns",
    question: `Which sentence contains a PROPER NOUN?`,
    options: [
      "The dog chased the ball",
      "She visited the park",
      "He travelled to Montego Bay for the weekend",
      "A man walked past the shop",
    ],
    correctAnswer: 2,
    explanation: `'Montego Bay' is a proper noun — the specific name of a place. It begins with a capital letter.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Action Verbs",
    question: `Which sentence contains an ACTION VERB?`,
    options: [
      "The soup is hot",
      "She seems nervous",
      "He jumped over the fence",
      "The sky looks dark",
    ],
    correctAnswer: 2,
    explanation: `'Jumped' is an action verb — it describes a physical movement performed by the subject.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives",
    question: `Which word is an ADJECTIVE in: 'The elderly vendor arranged her colourful stall.'?`,
    options: [
      "arranged",
      "vendor",
      "stall",
      "colourful",
    ],
    correctAnswer: 3,
    explanation: `'Colourful' describes the stall — it is an adjective.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is an EXCLAMATION?`,
    options: [
      "Are you going to the market?",
      "Buy some mangoes please",
      "What a beautiful morning it is!",
      "She sells vegetables every Saturday",
    ],
    correctAnswer: 2,
    explanation: `An exclamation expresses strong feeling and ends with an exclamation mark.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is correctly punctuated?`,
    options: [
      "The market sells fruit, vegetables, and crafts.",
      "The market sells fruit vegetables and crafts.",
      "The market, sells fruit vegetables and crafts.",
      "The market sells fruit, vegetables and, crafts.",
    ],
    correctAnswer: 0,
    explanation: `Items in a list are separated by commas. Option A correctly uses commas between all three items.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Simple Past Tense",
    question: `Choose the correct PAST TENSE: 'Last week, she ___ vegetables at the market.'`,
    options: [
      "sells",
      "is selling",
      "will sell",
      "sold",
    ],
    correctAnswer: 3,
    explanation: `'Last week' signals the simple past tense. 'Sold' is the past tense of 'sell.'`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Personal Pronouns",
    question: `Replace 'The vendors' with the correct pronoun: 'The vendors called out to the buyers.'`,
    options: [
      "It",
      "She",
      "They",
      "He",
    ],
    correctAnswer: 2,
    explanation: `'The vendors' is plural (more than one person) — replace with 'They.'`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: 'Every stall at the market ___ a story.'`,
    options: [
      "tell",
      "are",
      "have",
      "tells",
    ],
    correctAnswer: 3,
    explanation: `'Every stall' is singular. Use the singular verb 'tells.'`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Apostrophe — Possession",
    question: `Which shows the stall BELONGING to the vendor?`,
    options: [
      "the vendors stall",
      "the vendor stall",
      "the vendor's stall",
      "the vendors' stall",
    ],
    correctAnswer: 2,
    explanation: `For a singular noun (vendor), add apostrophe + s. 'The vendor's stall' is correct.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Compound Sentences",
    question: `Which is a COMPOUND sentence?`,
    options: [
      "She sells mangoes at the market.",
      "She sells mangoes and her sister sells vegetables.",
      "She sells mangoes because they are in season.",
      "Selling mangoes is her job.",
    ],
    correctAnswer: 1,
    explanation: `A compound sentence joins two independent clauses with a conjunction. 'She sells mangoes AND her sister sells vegetables' joins two main clauses.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose of Descriptive Writing",
    question: `A student writes a description of a busy market for a travel magazine. The PRIMARY purpose is to:`,
    options: [
      "Give directions to the market",
      "Persuade readers not to shop at the market",
      "Describe the market so vividly that readers feel they are there",
      "List everything sold at the market",
    ],
    correctAnswer: 2,
    explanation: `Descriptive travel writing aims to evoke a place so richly that readers feel transported there — creating an experience, not just a list.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Sensory Language",
    question: `Which sentence uses the MOST effective sensory language?`,
    options: [
      "The market was big",
      "There were many people and things",
      "The air buzzed with vendors' calls, thick with the scent of pepper and ripe mango",
      "It was a Saturday market",
    ],
    correctAnswer: 2,
    explanation: `Effective sensory writing engages multiple senses (sound: 'buzzed,' smell: 'pepper and mango') to create an immersive experience.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which would make the BEST topic sentence for a paragraph about why local markets matter?`,
    options: [
      "Markets sell vegetables",
      "Local markets are busy on Saturdays",
      "Local markets are vital centres of community life, trade, and cultural identity",
      "People go to the market to buy food",
    ],
    correctAnswer: 2,
    explanation: `A strong topic sentence makes a clear, arguable claim about the paragraph's subject. Option C is specific and substantive.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Audience",
    question: `A student writes a report on local markets for a school newsletter. Which language is MOST appropriate?`,
    options: [
      "Very formal academic language with technical terms",
      "Casual slang and informal expressions",
      "Clear, organised, semi-formal language accessible to fellow students and parents",
      "One very long sentence covering all the facts",
    ],
    correctAnswer: 2,
    explanation: `A school newsletter requires language that is clear and accessible to students and parents — not overly formal or too casual.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding Sentence",
    question: `Which BEST concludes a paragraph arguing that markets are important community spaces?`,
    options: [
      "Markets sell many things",
      "There are different stalls at the market",
      "Markets are therefore not simply places of commerce — they are the living, breathing heart of community life",
      "People should visit the market more often",
    ],
    correctAnswer: 2,
    explanation: `A concluding sentence wraps up the argument powerfully. This sentence restates the key idea (community heart) in a memorable way.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy5Questions : g5LaEasy5Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 5</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 5</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 5</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
