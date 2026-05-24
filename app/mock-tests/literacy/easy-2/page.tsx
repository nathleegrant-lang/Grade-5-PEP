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

const g5LaEasy2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

What is the MAIN idea of this passage?`,
    options: [
      "The beach is dangerous",
      "Kezia and her family enjoyed a wonderful day at the beach",
      "Kezia's brother loves building sandcastles",
      "St. Mary is the best parish in Jamaica",
    ],
    correctAnswer: 1,
    explanation: `The passage is mainly about the family's enjoyable day at the beach.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

What colour was the water at the beach?`,
    options: [
      "Deep blue",
      "Bright green",
      "Turquoise",
      "Dark grey",
    ],
    correctAnswer: 2,
    explanation: `The passage states the water was 'a brilliant shade of turquoise.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

What can you INFER about how Kezia felt at the end of the day?`,
    options: [
      "She was bored and tired",
      "She was grateful and happy",
      "She was sad to leave",
      "She was angry with her brother",
    ],
    correctAnswer: 1,
    explanation: `Kezia said it was the best day of her holiday — this shows she felt grateful and happy.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

The word 'waded' in the passage means:`,
    options: [
      "swam underwater",
      "jumped in quickly",
      "walked through shallow water",
      "ran along the shore",
    ],
    correctAnswer: 2,
    explanation: `To 'wade' means to walk through shallow water.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

What did Kezia do AFTER entering the sea?`,
    options: [
      "She built sandcastles",
      "She relaxed under a palm tree",
      "She watched tiny fish between her feet",
      "She drove home",
    ],
    correctAnswer: 2,
    explanation: `After wading in, Kezia 'watched tiny silver fish dart between her feet.'`
  },
  {
    id: 6,
    type: "reading",
    skill: "Setting",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

Where did the family go?`,
    options: [
      "A river in Portland",
      "A beach in St. Mary",
      "A pool in Kingston",
      "A lake in the Blue Mountains",
    ],
    correctAnswer: 1,
    explanation: `The passage says 'Kezia and her family drove to a beach in St. Mary.'`
  },
  {
    id: 7,
    type: "reading",
    skill: "Character",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

What was Kezia's brother doing while she was in the sea?`,
    options: [
      "Playing with fish",
      "Building sandcastles",
      "Swimming",
      "Relaxing under a tree",
    ],
    correctAnswer: 1,
    explanation: `'Her younger brother built sandcastles near the shore.'`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

The tone of the passage is BEST described as:`,
    options: [
      "Fearful",
      "Joyful and descriptive",
      "Informative and scientific",
      "Sad and reflective",
    ],
    correctAnswer: 1,
    explanation: `The vivid descriptions and Kezia's happy ending create a joyful, descriptive tone.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

'The white sand sparkled in the sunshine.' What does this description help you to imagine?`,
    options: [
      "The sand was very hot",
      "The sand shone and glittered in the light",
      "The sand was wet and sticky",
      "The sand was dark and rough",
    ],
    correctAnswer: 1,
    explanation: `'Sparkled' paints a picture of the sand shining and glittering in sunlight.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

WHY did the parents relax under a palm tree?`,
    options: [
      "They were bored",
      "They wanted shade from the sun",
      "They were watching the children swim",
      "The passage does not say why",
    ],
    correctAnswer: 3,
    explanation: `The passage does not give a specific reason for this — only describes what they did.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

Which sentence BEST summarises this passage?`,
    options: [
      "The beach in St. Mary is the most beautiful in Jamaica",
      "A family had an enjoyable beach day full of swimming, playing, and relaxing",
      "Kezia is afraid of fish",
      "Sandcastles are difficult to build",
    ],
    correctAnswer: 1,
    explanation: `This captures the key events and the overall experience of the family's day.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

Based on the passage, how would you describe Kezia's family?`,
    options: [
      "Sad and quiet",
      "Fun-loving and close",
      "Loud and argumentative",
      "Serious and busy",
    ],
    correctAnswer: 1,
    explanation: `The family spent the day together enjoying the beach and each other's company — suggesting a loving, fun family.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

Why did the author include the detail that the fish were 'tiny and silver'?`,
    options: [
      "To confuse the reader",
      "To make the description more vivid and interesting",
      "To teach the reader about marine life",
      "To show Kezia was afraid",
    ],
    correctAnswer: 1,
    explanation: `Specific sensory details like 'tiny and silver' make the description more vivid and engaging.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

The word 'brilliant' as used in the passage means:`,
    options: [
      "Very intelligent",
      "Bright and vivid",
      "Quiet and calm",
      "Large and deep",
    ],
    correctAnswer: 1,
    explanation: `'A brilliant shade of turquoise' means a bright, vivid blue-green colour.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Feature",
    question: `Read the passage then answer the questions.

"Last Saturday, Kezia and her family drove to a beach in St. Mary. The water was a brilliant shade of turquoise, and the white sand sparkled in the sunshine. Kezia waded into the warm sea and watched tiny silver fish dart between her feet. Her younger brother built sandcastles near the shore while her parents relaxed under a palm tree. On the drive home, Kezia said it was the best day of her holiday."

The passage ends with Kezia speaking. What does this add?`,
    options: [
      "It creates confusion",
      "It ends the passage abruptly",
      "It shows her feelings directly, making the story more personal",
      "It is unnecessary",
    ],
    correctAnswer: 2,
    explanation: `Ending with Kezia's own words gives the reader a direct sense of her feelings, making the story more personal.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'brave'?`,
    options: [
      "Fearful",
      "Timid",
      "Courageous",
      "Weak",
    ],
    correctAnswer: 2,
    explanation: `'Courageous' means having bravery. It is a synonym for 'brave.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'generous' is:`,
    options: [
      "Kind",
      "Giving",
      "Selfish",
      "Warm",
    ],
    correctAnswer: 2,
    explanation: `An antonym is the opposite. 'Selfish' is the opposite of 'generous.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The athlete SPRINTED across the finish line. What does 'sprinted' most likely mean?`,
    options: [
      "Walked slowly",
      "Stopped suddenly",
      "Ran very fast",
      "Jumped high",
    ],
    correctAnswer: 2,
    explanation: `'Sprinted' means running at full speed. The context of finishing a race supports this.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Her voice was music to my ears.' This is an example of:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 1,
    explanation: `This is a metaphor — it directly states her voice WAS music, without using 'like' or 'as.'`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'investigate' means:`,
    options: [
      "To ignore something",
      "To examine or look into something carefully",
      "To destroy something",
      "To celebrate something",
    ],
    correctAnswer: 1,
    explanation: `To 'investigate' means to examine carefully, often to find out the truth.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses the word 'light' to describe weight?`,
    options: [
      "She turned on the light",
      "The feather was so light it floated away",
      "The light from the sun is warm",
      "He needs a light to see in the dark",
    ],
    correctAnswer: 1,
    explanation: `In this sentence, 'light' means not heavy — describing the feather's weight.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix un-",
    question: `The prefix 'un-' changes a word to mean its opposite. Which word means NOT comfortable?`,
    options: [
      "recomfort",
      "comfort",
      "uncomfortable",
      "comforting",
    ],
    correctAnswer: 2,
    explanation: `Un + comfortable = uncomfortable = not comfortable.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -ful",
    question: `Adding '-ful' to 'colour' creates 'colourful', which means:`,
    options: [
      "without colour",
      "having lots of colour",
      "becoming coloured",
      "colouring again",
    ],
    correctAnswer: 1,
    explanation: `The suffix '-ful' means full of or having a lot of. Colourful = having lots of colour.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The thunder roared like an angry lion.' This is a:`,
    options: [
      "Metaphor",
      "Simile",
      "Hyperbole",
      "Personification",
    ],
    correctAnswer: 1,
    explanation: `It uses 'like' to compare thunder to a lion, making it a simile.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The playground was DESERTED after the storm. 'Deserted' means:`,
    options: [
      "full of children",
      "flooded with water",
      "completely empty",
      "very noisy",
    ],
    correctAnswer: 2,
    explanation: `'Deserted' means abandoned or completely empty — supported by the storm context.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Proper Nouns",
    question: `Which word is a PROPER NOUN?`,
    options: [
      "city",
      "school",
      "Jamaica",
      "teacher",
    ],
    correctAnswer: 2,
    explanation: `A proper noun names a specific person, place, or thing and begins with a capital letter. 'Jamaica' is a specific country.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verbs",
    question: `Which sentence contains an ACTION VERB?`,
    options: [
      "The sky is blue",
      "She seems tired",
      "The dog chased the ball",
      "It is very hot today",
    ],
    correctAnswer: 2,
    explanation: `'Chased' is an action verb — it shows what the dog did.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the sentence that contains TWO adjectives.`,
    options: [
      "The dog ran fast",
      "The tall, thin man walked slowly",
      "She laughed loudly",
      "He carried the box",
    ],
    correctAnswer: 1,
    explanation: `'Tall' and 'thin' both describe the man. These are two adjectives.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is an EXCLAMATION?`,
    options: [
      "Are you coming to the party?",
      "Come inside right now",
      "What a wonderful surprise!",
      "I like mango juice",
    ],
    correctAnswer: 2,
    explanation: `An exclamation expresses strong emotion and ends with an exclamation mark. 'What a wonderful surprise!' does this.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Full Stops",
    question: `Which sentence is correctly punctuated?`,
    options: [
      "We went to market on Saturday.",
      "We went to market on Saturday",
      "We, went to market on Saturday.",
      "We went to market on Saturday!",
    ],
    correctAnswer: 0,
    explanation: `A statement ends with a full stop. Option A is correctly punctuated.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Past Tense",
    question: `Choose the correct PAST TENSE form: 'Yesterday, the children ___ in the park.'`,
    options: [
      "plays",
      "playing",
      "played",
      "will play",
    ],
    correctAnswer: 2,
    explanation: `Yesterday indicates past tense. 'Played' is the simple past of 'play.'`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Pronouns",
    question: `Which pronoun correctly replaces the underlined words? 'John and Mary went to the shop.'`,
    options: [
      "They",
      "Them",
      "Their",
      "We",
    ],
    correctAnswer: 0,
    explanation: `'John and Mary' refers to two people (third-person plural). Replace with 'They.'`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: 'The books on the shelf ___ very old.'`,
    options: [
      "is",
      "was",
      "are",
      "has",
    ],
    correctAnswer: 2,
    explanation: `'Books' is plural, so use the plural verb 'are.'`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Apostrophe Contraction",
    question: `Which word is a CONTRACTION of 'do not'?`,
    options: [
      "dont",
      "do'nt",
      "don't",
      "doesn't",
    ],
    correctAnswer: 2,
    explanation: `A contraction removes letters and replaces them with an apostrophe. 'Do not' → 'don't.'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Correction",
    question: `Which sentence is CORRECT?`,
    options: [
      "Him and me went swimming",
      "He and I went swimming",
      "He and me went swimming",
      "Him and I went swimming",
    ],
    correctAnswer: 1,
    explanation: `Use subject pronouns (I, he) when they are the subject. 'He and I went swimming' is correct.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Planning",
    question: `Before writing a story, which step helps a writer organise their ideas?`,
    options: [
      "Writing the conclusion first",
      "Making a plan or mind map",
      "Choosing a title only",
      "Starting immediately without thinking",
    ],
    correctAnswer: 1,
    explanation: `Planning or creating a mind map helps organise ideas before writing, making the writing clearer.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Descriptive Writing",
    question: `Which sentence uses the BEST descriptive language?`,
    options: [
      "The dog ran.",
      "The dog moved.",
      "The shaggy golden dog sprinted joyfully across the green lawn.",
      "There was a dog.",
    ],
    correctAnswer: 2,
    explanation: `Descriptive writing uses specific adjectives and adverbs to create a vivid image. Option C is far more descriptive.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which makes the BEST topic sentence for a paragraph about recycling?`,
    options: [
      "Some things can be recycled",
      "Recycling helps to protect the environment and reduce waste",
      "I have a blue recycling bin",
      "Paper is one thing you can recycle",
    ],
    correctAnswer: 1,
    explanation: `This clearly states the main idea of a paragraph about recycling.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Audience",
    question: `A student is writing a warning notice about strong currents at a beach. The BEST audience for this notice is:`,
    options: [
      "Scientists studying ocean currents",
      "Beach visitors who need to stay safe",
      "Teachers in a classroom",
      "Historians studying the sea",
    ],
    correctAnswer: 1,
    explanation: `A warning notice about beach currents is most useful to visitors who need to know how to stay safe.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Coherence",
    question: `In a well-written paragraph, all sentences should:`,
    options: [
      "Be very long and detailed",
      "Include dialogue",
      "Relate to the main idea stated in the topic sentence",
      "Use rhyme",
    ],
    correctAnswer: 2,
    explanation: `A coherent paragraph has all sentences supporting the topic sentence — the main idea.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy2Questions : g5LaEasy2Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

  useEffect(() => {
    setCurrentQuestion((prev) => Math.min(prev, Math.max(totalQuestions - 1, 0)))
  }, [totalQuestions])

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

  const handleSubmit = () => {
    setShowResults(true)
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-xl border-amber-200">
            <CardHeader className="bg-amber-50"><CardTitle className="text-amber-800">Preview Complete</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">You completed the free preview for this test. Upgrade to Premium to unlock all 40 questions.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                <Link href="/mock-tests/language-arts"><Button variant="outline">Back to Language Arts Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 2</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 2</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 2</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => Math.max(p - 1, 0))} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => Math.min(p + 1, totalQuestions - 1))} className="bg-blue-600 hover:bg-blue-700">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
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
