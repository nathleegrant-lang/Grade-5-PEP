"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { saveStudentTestResult } from "@/lib/student-test-results"

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

const g5LaEasy1Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the questions.

"The students at Meadowbrook Primary decided to start a school garden. They cleared a patch of land near the back of the school and planted vegetables, herbs, and fruit trees. Every morning before class, a small group of students watered the plants and pulled out weeds. Within three months, the garden was producing fresh tomatoes, callaloo, and peppers, which the cook used in the school canteen."

What is the MAIN idea of this passage?`,
    options: [
      "Students enjoy eating vegetables",
      "Students at Meadowbrook Primary started and maintained a school garden",
      "The cook uses fresh vegetables in the canteen",
      "Weeding is an important skill",
    ],
    correctAnswer: 1,
    explanation: `The passage is about students starting a school garden — this is the central topic of the whole text.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the questions.

"The students at Meadowbrook Primary decided to start a school garden. They cleared a patch of land near the back of the school and planted vegetables, herbs, and fruit trees. Every morning before class, a small group of students watered the plants and pulled out weeds. Within three months, the garden was producing fresh tomatoes, callaloo, and peppers, which the cook used in the school canteen."

Where was the garden started?`,
    options: [
      "In the school canteen",
      "Near the front gate",
      "Near the back of the school",
      "In a classroom",
    ],
    correctAnswer: 2,
    explanation: `The passage states the students 'cleared a patch of land near the back of the school.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the questions.

"The students at Meadowbrook Primary decided to start a school garden. They cleared a patch of land near the back of the school and planted vegetables, herbs, and fruit trees. Every morning before class, a small group of students watered the plants and pulled out weeds. Within three months, the garden was producing fresh tomatoes, callaloo, and peppers, which the cook used in the school canteen."

What did the students do FIRST when starting the garden?`,
    options: [
      "Planted vegetables",
      "Watered the plants",
      "Cleared a patch of land",
      "Pulled out weeds",
    ],
    correctAnswer: 2,
    explanation: `The passage says they first 'cleared a patch of land' before planting.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the questions.

"The students at Meadowbrook Primary decided to start a school garden. They cleared a patch of land near the back of the school and planted vegetables, herbs, and fruit trees. Every morning before class, a small group of students watered the plants and pulled out weeds. Within three months, the garden was producing fresh tomatoes, callaloo, and peppers, which the cook used in the school canteen."

What can you INFER about the students who watered the plants each morning?`,
    options: [
      "They were forced to water the plants",
      "They were dedicated and responsible",
      "They only came on Fridays",
      "They disliked gardening",
    ],
    correctAnswer: 1,
    explanation: `Coming every morning before class to water and weed suggests the students were dedicated and responsible.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the questions.

"The students at Meadowbrook Primary decided to start a school garden. They cleared a patch of land near the back of the school and planted vegetables, herbs, and fruit trees. Every morning before class, a small group of students watered the plants and pulled out weeds. Within three months, the garden was producing fresh tomatoes, callaloo, and peppers, which the cook used in the school canteen."

The word 'producing' in the passage most nearly means:`,
    options: [
      "destroying",
      "selling",
      "growing and giving",
      "planting only",
    ],
    correctAnswer: 2,
    explanation: `In this context, 'producing' means the garden was growing and giving food — tomatoes, callaloo, and peppers.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Purpose",
    question: `Why does the author mention that the cook used the vegetables in the school canteen?`,
    options: [
      "To show that the canteen was very large",
      "To show that the garden was successful and useful",
      "To explain how to cook callaloo",
      "To describe the canteen menu",
    ],
    correctAnswer: 1,
    explanation: `Mentioning the cook using the produce shows the garden was productive and benefiting the school community.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Which statement from the passage is a FACT?`,
    options: [
      "The garden was beautiful",
      "Gardening is the best hobby",
      "Within three months the garden produced tomatoes, callaloo, and peppers",
      "The students were very talented",
    ],
    correctAnswer: 2,
    explanation: `This is a fact stated directly in the passage. The others are opinions or judgements.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Structure",
    question: `How is the passage mainly organised?`,
    options: [
      "By listing problems and solutions",
      "By giving reasons for and against gardening",
      "By describing events in the order they happened",
      "By comparing different types of gardens",
    ],
    correctAnswer: 2,
    explanation: `The passage follows a sequence — clear land, plant, water, then harvest — showing chronological order.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Character",
    question: `Based on the passage, how would you describe the students involved in the garden?`,
    options: [
      "Lazy and uninterested",
      "Hardworking and committed",
      "Selfish and unkind",
      "Confused and unsure",
    ],
    correctAnswer: 1,
    explanation: `The students cleared land, planted, watered daily, and pulled weeds — all evidence of hardworking, committed behaviour.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Context",
    question: `The phrase 'pulling out weeds' in the passage means:`,
    options: [
      "Planting new seeds",
      "Removing unwanted plants",
      "Watering the garden",
      "Cutting the herbs",
    ],
    correctAnswer: 1,
    explanation: `Weeds are unwanted plants, and 'pulling them out' means removing them from the garden.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Cause and Effect",
    question: `What was the EFFECT of the students watering the plants daily?`,
    options: [
      "The weeds grew faster",
      "The cook started gardening",
      "Within three months the garden produced fresh vegetables",
      "The school canteen was renovated",
    ],
    correctAnswer: 2,
    explanation: `The cause (daily care) led directly to the effect — within three months the garden was producing vegetables.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Audience",
    question: `This passage was MOST LIKELY written for:`,
    options: [
      "Young students learning about environmental responsibility",
      "Adults learning to start a farm",
      "Canteen cooks learning new recipes",
      "Scientists studying plant growth",
    ],
    correctAnswer: 0,
    explanation: `The topic, language, and focus on a school setting suggest it is aimed at young students.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Summarise",
    question: `Which sentence BEST summarises the passage?`,
    options: [
      "The canteen cook likes fresh vegetables",
      "Students planted a school garden that produced vegetables used in the school canteen",
      "Weeding and watering are difficult tasks",
      "Herbs grow faster than fruit trees",
    ],
    correctAnswer: 1,
    explanation: `This sentence captures the who, what, and result — the essential elements of a good summary.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Which vegetables are mentioned in the passage?`,
    options: [
      "Carrots, yam, breadfruit",
      "Tomatoes, callaloo, peppers",
      "Corn, potatoes, peas",
      "Lettuce, onions, thyme",
    ],
    correctAnswer: 1,
    explanation: `The passage directly names 'fresh tomatoes, callaloo, and peppers.'`
  },
  {
    id: 15,
    type: "reading",
    skill: "Tone",
    question: `The tone of this passage is BEST described as:`,
    options: [
      "Angry and critical",
      "Sad and disappointed",
      "Positive and informative",
      "Humorous and playful",
    ],
    correctAnswer: 2,
    explanation: `The passage describes a successful, cooperative project in a straightforward and positive way.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'happy'?`,
    options: [
      "Sad",
      "Joyful",
      "Angry",
      "Tired",
    ],
    correctAnswer: 1,
    explanation: `A synonym is a word with a similar meaning. 'Joyful' means very happy.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is an ANTONYM for 'ancient'?`,
    options: [
      "Old",
      "Traditional",
      "Modern",
      "Historical",
    ],
    correctAnswer: 2,
    explanation: `An antonym is a word with the opposite meaning. 'Modern' is the opposite of 'ancient.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The teacher was very PATIENT with the students who were learning slowly. What does 'patient' mean in this sentence?`,
    options: [
      "In a hurry",
      "Calm and willing to wait",
      "Strict and firm",
      "Confused",
    ],
    correctAnswer: 1,
    explanation: `'Patient' here means staying calm and not rushing students who needed more time.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The rain fell like a curtain of silver.' What type of figurative language is this?`,
    options: [
      "Metaphor",
      "Simile",
      "Personification",
      "Hyperbole",
    ],
    correctAnswer: 1,
    explanation: `A simile compares two things using 'like' or 'as.' The rain is compared to a curtain using 'like.'`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'enormous' means:`,
    options: [
      "Very small",
      "Extremely large",
      "Slightly warm",
      "Quite loud",
    ],
    correctAnswer: 1,
    explanation: `'Enormous' means extremely large or huge.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses the word 'bank' to mean a place that holds money?`,
    options: [
      "She sat on the bank of the river",
      "He went to the bank to deposit his savings",
      "The aircraft made a steep bank to the left",
      "They bank on winning the match",
    ],
    correctAnswer: 1,
    explanation: `In this sentence, 'bank' refers to a financial institution where money is kept.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefixes",
    question: `The prefix 'un-' in the word 'unhappy' means:`,
    options: [
      "very",
      "again",
      "not",
      "before",
    ],
    correctAnswer: 2,
    explanation: `The prefix 'un-' means not. 'Unhappy' = not happy.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffixes",
    question: `Adding '-ness' to the word 'kind' creates:`,
    options: [
      "unkind",
      "kindly",
      "kindness",
      "kinder",
    ],
    correctAnswer: 2,
    explanation: `The suffix '-ness' changes an adjective into a noun. 'Kindness' = the quality of being kind.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The stars danced in the night sky.' What type of figurative language is used?`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 2,
    explanation: `Personification gives human qualities (dancing) to non-human things (stars).`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Vocabulary in Context",
    question: `The new student felt ANXIOUS before her first day at school. 'Anxious' means:`,
    options: [
      "Very excited",
      "Worried and nervous",
      "Bored and uninterested",
      "Happy and confident",
    ],
    correctAnswer: 1,
    explanation: `'Anxious' describes a feeling of worry or nervousness about something that is going to happen.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `Which word in this sentence is a NOUN? 'The children played in the park.'`,
    options: [
      "played",
      "the",
      "children",
      "in",
    ],
    correctAnswer: 2,
    explanation: `A noun names a person, place, thing, or idea. 'Children' names the people; 'park' names the place. Both are nouns, but 'children' is the subject noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verbs",
    question: `Which word is the VERB in this sentence? 'Maria runs to school every morning.'`,
    options: [
      "Maria",
      "every",
      "school",
      "runs",
    ],
    correctAnswer: 3,
    explanation: `A verb shows action or state. 'Runs' is the action verb in this sentence.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Adjectives",
    question: `Which word is an ADJECTIVE in this sentence? 'The tall boy kicked the red ball.'`,
    options: [
      "kicked",
      "boy",
      "tall",
      "ball",
    ],
    correctAnswer: 2,
    explanation: `An adjective describes a noun. 'Tall' describes what kind of boy.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is a QUESTION?`,
    options: [
      "Close the door please",
      "The dog barked loudly",
      "Did you finish your homework",
      "What a beautiful sunset",
    ],
    correctAnswer: 2,
    explanation: `A question ends with a question mark and asks for information. Only option C does this.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence uses a COMMA correctly?`,
    options: [
      "We bought bread milk and eggs.",
      "We bought bread, milk, and eggs.",
      "We, bought bread milk and eggs.",
      "We bought bread milk, and, eggs.",
    ],
    correctAnswer: 1,
    explanation: `Commas are used to separate items in a list. Option B correctly separates the three items.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Tense",
    question: `Change to PAST TENSE: 'She walks to school every day.'`,
    options: [
      "She will walk to school every day",
      "She walked to school every day",
      "She walking to school every day",
      "She is walking to school every day",
    ],
    correctAnswer: 1,
    explanation: `The past tense of 'walks' is 'walked.' Past tense refers to actions already completed.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Pronoun",
    question: `Choose the correct PRONOUN: 'Marcus and ___ went to the library.'`,
    options: [
      "me",
      "I",
      "my",
      "him",
    ],
    correctAnswer: 1,
    explanation: `When a pronoun is used as the subject of a sentence, use 'I' not 'me.' (Marcus and I = two subjects.)`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: 'The group of students ___ ready to begin.'`,
    options: [
      "are",
      "were",
      "is",
      "have",
    ],
    correctAnswer: 2,
    explanation: `'Group' is a singular collective noun. Use the singular verb 'is.' (The group IS ready.)`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Apostrophe",
    question: `Which sentence correctly uses an APOSTROPHE to show possession?`,
    options: [
      "The girls' book is red",
      "The girls's book is red",
      "The girl book is red",
      "The girls book's is red",
    ],
    correctAnswer: 0,
    explanation: `For possession: add apostrophe + s for singular ('girl's'), or just apostrophe after s for plural ('girls'). 'The girls' book' correctly shows the book belongs to the girls.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Correction",
    question: `Which sentence is written CORRECTLY?`,
    options: [
      "He don't know the answer",
      "They was very happy",
      "She plays football every Friday",
      "Us went to the market",
    ],
    correctAnswer: 2,
    explanation: `Subject-verb agreement: 'She plays' is correct. The others have errors: don't→doesn't, was→were, Us→We.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `A student wants to convince her principal to start a school library. What type of writing should she use?`,
    options: [
      "Narrative writing",
      "Descriptive writing",
      "Persuasive writing",
      "Expository writing",
    ],
    correctAnswer: 2,
    explanation: `Persuasive writing is used to convince someone to agree with your point of view or take action.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Audience",
    question: `Which opening sentence is BEST suited for a letter to a younger child?`,
    options: [
      "As per the statistical data, literacy rates indicate...",
      "Have you ever wondered why reading is so much fun?",
      "The aforementioned evidence supports the assertion...",
      "In conclusion, one may surmise that...",
    ],
    correctAnswer: 1,
    explanation: `Simple, engaging language like a question suits a young child reader. The other options are too formal or complex.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which sentence would make the BEST topic sentence for a paragraph about exercise?`,
    options: [
      "I like running",
      "There are many types of exercise",
      "Regular exercise is important for keeping the body healthy",
      "Exercise includes running and swimming",
    ],
    correctAnswer: 2,
    explanation: `A topic sentence states the main idea clearly and broadly. Option C does this best.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Paragraph Structure",
    question: `What should come AFTER the topic sentence in a well-written paragraph?`,
    options: [
      "Another topic sentence",
      "Supporting details and examples",
      "A title",
      "A new paragraph immediately",
    ],
    correctAnswer: 1,
    explanation: `After the topic sentence, supporting details and examples provide evidence and explanation of the main idea.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Writing Technique",
    question: `A writer describes the smell, sound, and colour of a morning market in detail. This technique is called:`,
    options: [
      "Summarising",
      "Persuading",
      "Descriptive writing",
      "Comparing",
    ],
    correctAnswer: 2,
    explanation: `Using sensory details (smell, sound, colour) is a characteristic of descriptive writing.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const hasSavedResult = useRef(false)

  const availableQuestions = isPremium ? g5LaEasy1Questions : g5LaEasy1Questions.slice(0, FREE_QUESTION_LIMIT)
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

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Easy 1",
      difficulty: "Easy",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: new Date().toISOString(),
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

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
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60); hasSavedResult.current = false
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 1</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 1</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 1</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
