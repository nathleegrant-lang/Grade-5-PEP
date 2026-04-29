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

const g5LaEasy3Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

What is the MAIN idea of this passage?`,
    options: [
      "Reading makes students lazy",
      "Books are very expensive",
      "Regular reading is valuable and improves many skills",
      "Only Language Arts students need to read",
    ],
    correctAnswer: 2,
    explanation: `The passage explains how reading benefits vocabulary, spelling, expression, and performance in school — making reading's value the main idea.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

According to the passage, which skills improve when you read regularly?`,
    options: [
      "Drawing and painting",
      "Vocabulary, spelling, and expressing ideas",
      "Speed and agility",
      "Cooking and crafts",
    ],
    correctAnswer: 1,
    explanation: `The passage specifically states reading improves vocabulary, spelling, and ability to express ideas.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

What does the passage suggest about students who do NOT read widely?`,
    options: [
      "They are lazy",
      "They may not perform as well in their subjects",
      "They are more creative",
      "They do not like Language Arts",
    ],
    correctAnswer: 1,
    explanation: `The passage says students who read widely tend to perform better — implying those who don't read may not perform as well.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

'Travel to new places…without leaving your chair.' What literary technique is used?`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Hyperbole",
    ],
    correctAnswer: 3,
    explanation: `Hyperbole or imaginative language — the idea is exaggerated for effect to show the power of reading.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

The word 'valuable' in the passage most nearly means:`,
    options: [
      "costly",
      "worthless",
      "very useful and important",
      "boring",
    ],
    correctAnswer: 2,
    explanation: `'Valuable' in this context means extremely useful and important, not necessarily expensive.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Purpose",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

The MAIN purpose of this passage is to:`,
    options: [
      "Entertain with an interesting story",
      "Describe a character",
      "Persuade readers that reading is important",
      "Explain how books are made",
    ],
    correctAnswer: 2,
    explanation: `The passage aims to convince readers of the benefits of reading — this is a persuasive purpose.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

Which sentence from the passage BEST supports the idea that books are educational?`,
    options: [
      "Books allow you to travel to new places",
      "Reading is one of the most valuable skills",
      "Students who read widely perform better in all subjects",
      "When you read, your vocabulary grows",
    ],
    correctAnswer: 2,
    explanation: `Option C directly connects reading to improved performance across all school subjects.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

According to the passage, what CAUSES students to perform better in all subjects?`,
    options: [
      "Playing sport",
      "Attending extra lessons",
      "Reading widely",
      "Having good teachers",
    ],
    correctAnswer: 2,
    explanation: `The passage states 'Students who read widely tend to perform better in all of their subjects.'`
  },
  {
    id: 9,
    type: "reading",
    skill: "Author's Opinion",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

Does the author think reading is important? How do you know?`,
    options: [
      "No — the author ignores reading",
      "No — the author says books are boring",
      "Yes — the author calls it 'one of the most valuable skills'",
      "We cannot tell from the passage",
    ],
    correctAnswer: 2,
    explanation: `The very first sentence states reading is 'one of the most valuable skills' — showing the author's positive opinion.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

The phrase 'expressing your ideas' means:`,
    options: [
      "drawing your ideas",
      "keeping your ideas secret",
      "communicating your thoughts clearly in words",
      "copying ideas from others",
    ],
    correctAnswer: 2,
    explanation: `'Expressing ideas' means communicating or sharing your thoughts clearly, usually in speech or writing.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

Why does the author mention that reading lets you 'travel to new places… without leaving your chair'?`,
    options: [
      "To show that travelling is dangerous",
      "To suggest reading is lazy",
      "To make reading sound exciting and imaginative",
      "To discourage students from going outside",
    ],
    correctAnswer: 2,
    explanation: `This imaginative image makes reading sound exciting — helping persuade the reader that books are enjoyable and worthwhile.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

According to the passage, what do books allow you to learn about?`,
    options: [
      "Only stories",
      "Only Science",
      "Events in history, new places, and interesting characters",
      "Only Language Arts topics",
    ],
    correctAnswer: 2,
    explanation: `The passage lists 'new places, interesting characters, and events in history' as things books allow you to explore.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

The tone of this passage is:`,
    options: [
      "Negative and discouraging",
      "Enthusiastic and persuasive",
      "Worried and uncertain",
      "Casual and unimportant",
    ],
    correctAnswer: 1,
    explanation: `The writer enthusiastically promotes reading using strong, positive language — making the tone persuasive and enthusiastic.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

Which statement BEST summarises this passage?`,
    options: [
      "Books are very expensive and hard to find",
      "Reading regularly improves many skills and helps students succeed in school",
      "Only Language Arts teachers read books",
      "Students should only read for fun, not to improve",
    ],
    correctAnswer: 1,
    explanation: `This captures the key message: regular reading leads to multiple improvements and school success.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the questions.

"Reading is one of the most valuable skills a person can develop. When you read regularly, your vocabulary grows, your spelling improves, and you become better at expressing your ideas. Books allow you to travel to new places, meet interesting characters, and learn about events in history — all without leaving your chair. Students who read widely tend to perform better in all of their subjects, not just Language Arts."

This passage was MOST LIKELY written for:`,
    options: [
      "Librarians buying new books",
      "Students and young people to encourage reading",
      "Scientists studying literacy",
      "Book publishers",
    ],
    correctAnswer: 1,
    explanation: `The encouraging tone and focus on student performance suggest this was written for students and young readers.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `A SYNONYM for 'brave' is:`,
    options: [
      "cowardly",
      "timid",
      "bold",
      "fearful",
    ],
    correctAnswer: 2,
    explanation: `'Bold' means having courage — it is a synonym for brave.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'noisy' is:`,
    options: [
      "loud",
      "quiet",
      "busy",
      "messy",
    ],
    correctAnswer: 1,
    explanation: `The opposite of noisy (full of sound) is quiet (little or no sound).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The crowd APPLAUDED at the end of the performance. 'Applauded' means:`,
    options: [
      "booed and left",
      "clapped to show appreciation",
      "shouted in anger",
      "fell asleep",
    ],
    correctAnswer: 1,
    explanation: `Applauding means clapping to show approval or appreciation, which makes sense at the end of a performance.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'He was a lion in the game.' What type of figurative language is this?`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 1,
    explanation: `This is a metaphor — it directly says he WAS a lion, comparing him to one without using 'like' or 'as.'`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `'Transparent' means:`,
    options: [
      "completely dark",
      "see-through and clear",
      "very heavy",
      "bright and shiny",
    ],
    correctAnswer: 1,
    explanation: `Transparent means allowing light to pass through so objects can be seen clearly — like glass.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'spring' to mean a season?`,
    options: [
      "The spring in the mattress broke",
      "In spring, the flowers bloom",
      "Water springs up from the ground",
      "The cat made a spring toward the mouse",
    ],
    correctAnswer: 1,
    explanation: `'In spring, the flowers bloom' uses 'spring' as the season between winter and summer.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix re-",
    question: `The prefix 're-' in 'rewrite' means:`,
    options: [
      "not",
      "before",
      "again",
      "without",
    ],
    correctAnswer: 2,
    explanation: `'Re-' means again. 'Rewrite' = write again.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -less",
    question: `Adding '-less' to 'care' creates 'careless', meaning:`,
    options: [
      "full of care",
      "very careful",
      "without care",
      "more careful",
    ],
    correctAnswer: 2,
    explanation: `The suffix '-less' means without. Careless = without care.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The wind whispered through the trees.' This is an example of:`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Hyperbole",
    ],
    correctAnswer: 2,
    explanation: `The wind is given the human action of whispering — this is personification.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The scientist used PRECISE measurements in her experiment. 'Precise' means:`,
    options: [
      "rough and approximate",
      "exact and accurate",
      "large and heavy",
      "quick and careless",
    ],
    correctAnswer: 1,
    explanation: `'Precise' means exact and accurate, especially in measurements or details.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `Which word in the following sentence is a NOUN? 'The teacher read a story to the class.'`,
    options: [
      "read",
      "to",
      "teacher",
      "The",
    ],
    correctAnswer: 2,
    explanation: `'Teacher' is a noun (a person). 'Class' is also a noun (a group of people/a thing).`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the ADJECTIVE in: 'She wore a beautiful dress to the party.'`,
    options: [
      "wore",
      "party",
      "she",
      "beautiful",
    ],
    correctAnswer: 3,
    explanation: `'Beautiful' is an adjective — it describes the dress (a noun).`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adverbs",
    question: `Choose the ADVERB in: 'He ran quickly to catch the bus.'`,
    options: [
      "ran",
      "quickly",
      "catch",
      "bus",
    ],
    correctAnswer: 1,
    explanation: `'Quickly' is an adverb — it describes HOW he ran.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is a COMMAND?`,
    options: [
      "Where are you going?",
      "She is going to the park",
      "Sit down and open your books",
      "What a great idea!",
    ],
    correctAnswer: 2,
    explanation: `A command gives an instruction or order. 'Sit down and open your books' does this.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Capital Letters",
    question: `Which sentence uses capital letters CORRECTLY?`,
    options: [
      "My mother went to Kingston on tuesday",
      "my mother went to Kingston on Tuesday",
      "My mother went to Kingston on Tuesday",
      "my Mother went to Kingston on tuesday",
    ],
    correctAnswer: 2,
    explanation: `Proper nouns (Kingston) and the names of days (Tuesday) begin with capital letters. 'My' begins the sentence.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Present Tense",
    question: `Choose the correct PRESENT TENSE form: 'Every day, the farmers ___ their crops.'`,
    options: [
      "watered",
      "will water",
      "water",
      "were watering",
    ],
    correctAnswer: 2,
    explanation: `'Every day' signals a habitual action in the present. 'Water' is the simple present form.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Possessive Nouns",
    question: `Which shows POSSESSIVE correctly: the book belonging to the boy?`,
    options: [
      "the boys book",
      "the boys's book",
      "the boy's book",
      "the boys' book",
    ],
    correctAnswer: 2,
    explanation: `For a singular noun (boy), add apostrophe + s to show possession: boy's book.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the CONJUNCTION in: 'I wanted to go swimming but it was raining.'`,
    options: [
      "swimming",
      "wanted",
      "but",
      "raining",
    ],
    correctAnswer: 2,
    explanation: `'But' is a conjunction — it joins two contrasting ideas in a sentence.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: 'Neither the students nor the teacher ___ late.'`,
    options: [
      "were",
      "are",
      "is",
      "have been",
    ],
    correctAnswer: 2,
    explanation: `When using 'neither…nor,' the verb agrees with the noun closest to it — 'teacher' (singular). Use 'is.'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Structure",
    question: `A sentence that has one main clause and one subordinate clause is called:`,
    options: [
      "A simple sentence",
      "A compound sentence",
      "A complex sentence",
      "A fragment",
    ],
    correctAnswer: 2,
    explanation: `A complex sentence contains one main (independent) clause and at least one subordinate (dependent) clause.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `A student writes a story about a brave young girl who saves her village. The purpose is MOST LIKELY to:`,
    options: [
      "inform readers about safety rules",
      "persuade readers to visit the village",
      "entertain readers with an exciting narrative",
      "describe how to be brave",
    ],
    correctAnswer: 2,
    explanation: `Narratives (stories) are primarily written to entertain readers.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Organisation",
    question: `Which order should a narrative follow?`,
    options: [
      "Conclusion, Middle, Beginning",
      "Middle, Beginning, End",
      "Beginning, Middle, End",
      "End, Beginning, Middle",
    ],
    correctAnswer: 2,
    explanation: `A narrative is organised into Beginning (introduction), Middle (events/climax), and End (resolution/conclusion).`
  },
  {
    id: 38,
    type: "writing",
    skill: "Descriptive Details",
    question: `Why do writers include sensory details (sight, sound, smell) in their writing?`,
    options: [
      "To make the writing longer",
      "To confuse the reader",
      "To help readers imagine the scene more clearly",
      "To avoid having a plot",
    ],
    correctAnswer: 2,
    explanation: `Sensory details make writing vivid and help readers picture and experience the scene.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Word Choice",
    question: `Which sentence uses the MOST precise and interesting vocabulary?`,
    options: [
      "The man walked to the shop",
      "The man moved somewhere",
      "The elderly gentleman strode purposefully toward the market stall",
      "There was a man",
    ],
    correctAnswer: 2,
    explanation: `Precise, vivid words like 'elderly,' 'strode,' and 'purposefully' make the writing more engaging and clear.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding Sentence",
    question: `A concluding sentence in a paragraph should:`,
    options: [
      "Introduce a new, unrelated topic",
      "Repeat the topic sentence word for word",
      "Summarise or reinforce the main idea of the paragraph",
      "Be very long and detailed",
    ],
    correctAnswer: 2,
    explanation: `A concluding sentence wraps up the paragraph by summarising or reinforcing the main point.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaEasy3Questions : g5LaEasy3Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 3</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 3</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 3</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
