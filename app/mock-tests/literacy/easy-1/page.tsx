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
    question: `Read Passage 1 then answer the question.

"On Thursday, Class 5 at Seaview Primary visited the fishing beach in Old Harbour Bay. Mr. Grant, a local fisherman, showed them how he checks his nets at sunrise. He explained that small fish are returned to the sea so they can grow. The students recorded notes and later made posters about protecting sea life."

What is the MAIN idea of Passage 1?`,
    options: [
      "Class 5 learned about responsible fishing at the beach",
      "Old Harbour Bay has many large fishing boats",
      "Students preferred drawing posters to taking notes",
      "Mr. Grant only fishes at night",
    ],
    correctAnswer: 0,
    explanation: `The passage mainly explains a learning trip about responsible fishing and sea-life protection.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Using Passage 1, what did Mr. Grant do at sunrise?`,
    options: [
      "Sold fish at the market",
      "Checked his nets",
      "Painted his boat",
      "Taught in a classroom",
    ],
    correctAnswer: 1,
    explanation: `The passage states that he showed them how he checks his nets at sunrise.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Cause and Effect",
    question: `In Passage 1, why are small fish returned to the sea?`,
    options: [
      "To keep the nets clean",
      "To reduce boat fuel use",
      "So the fish can grow",
      "So students can count them",
    ],
    correctAnswer: 2,
    explanation: `Mr. Grant explained that small fish are returned so they can grow.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Sequence",
    question: `Which happened LAST in Passage 1?`,
    options: [
      "Class 5 arrived at school",
      "Mr. Grant checked his nets",
      "Students visited Old Harbour Bay",
      "Students made posters about protecting sea life",
    ],
    correctAnswer: 3,
    explanation: `After taking notes, students later created posters, which was the final event mentioned.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `In Passage 1, the word "recorded" most nearly means:`,
    options: [
      "wrote down",
      "threw away",
      "sang loudly",
      "argued about",
    ],
    correctAnswer: 0,
    explanation: `Here, "recorded notes" means students wrote down information.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `What can you infer about Mr. Grant from Passage 1?`,
    options: [
      "He dislikes children visiting the beach",
      "He cares about protecting sea life",
      "He wants students to stop fishing",
      "He only works during storms",
    ],
    correctAnswer: 1,
    explanation: `Returning small fish to the sea suggests he fishes responsibly and cares for marine life.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: `Why did the author most likely include Passage 1?`,
    options: [
      "To entertain with a beach mystery",
      "To compare beaches in Jamaica",
      "To inform readers about a class learning experience",
      "To advertise fish for sale",
    ],
    correctAnswer: 2,
    explanation: `The passage gives factual information about what students learned on the trip.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Which statement is an OPINION about Passage 1?`,
    options: [
      "Class 5 visited Old Harbour Bay",
      "Students made posters later",
      "Mr. Grant checked nets at sunrise",
      "The beach trip was the most exciting lesson of the term",
    ],
    correctAnswer: 3,
    explanation: `"Most exciting" is a personal judgement, not a provable fact.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Theme",
    question: `Which theme best fits Passage 1?`,
    options: [
      "Teamwork and caring for nature",
      "Winning every competition",
      "Avoiding all ocean activities",
      "Keeping schoolwork secret",
    ],
    correctAnswer: 0,
    explanation: `Students learned together and focused on protecting sea life.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Text Evidence",
    question: `Which detail from Passage 1 best supports the idea of conservation?`,
    options: [
      "The visit happened on Thursday",
      "Small fish were returned to the sea",
      "The class travelled by bus",
      "Students used coloured markers",
    ],
    correctAnswer: 1,
    explanation: `Returning small fish directly shows protection of future sea life.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 2 then answer the question.

"At Riverside Basic School, the Grade 5 students started a 'Reading Buddy' programme with Grade 1. Every Tuesday afternoon, each older student sat with a younger child to read short storybooks. At first, some little ones struggled with new words, but the older buddies used pictures and sound clues to help. By the end of the month, the younger children were reading with more confidence."

What is the MAIN idea of Passage 2?`,
    options: [
      "Grade 5 students only read to each other",
      "Tuesday is the busiest day at Riverside",
      "A buddy programme helped younger children read better",
      "Storybooks should have fewer pictures",
    ],
    correctAnswer: 2,
    explanation: `The passage focuses on how the Reading Buddy programme improved younger students' reading confidence.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Detail",
    question: `How often did the Reading Buddy programme take place?`,
    options: [
      "Every Tuesday afternoon",
      "Every school morning",
      "Twice each month",
      "Only at exam time",
    ],
    correctAnswer: 0,
    explanation: `The passage clearly says the sessions happened every Tuesday afternoon.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Problem and Solution",
    question: `What problem is described in Passage 2?`,
    options: [
      "Older students arrived late",
      "The library was closed",
      "Some younger children struggled with new words",
      "Teachers cancelled story time",
    ],
    correctAnswer: 2,
    explanation: `The text states that some little ones had difficulty with new words.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `What can you infer about the Grade 5 buddies?`,
    options: [
      "They were unwilling to help",
      "They preferred only sports activities",
      "They finished quickly and left early",
      "They were patient and supportive readers",
    ],
    correctAnswer: 3,
    explanation: `Using pictures and sound clues to help younger readers shows patience and support.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Summarise",
    question: `Which sentence best summarises Passage 2?`,
    options: [
      "Grade 5 students helped Grade 1 readers improve through weekly buddy sessions",
      "Riverside Basic School changed all its textbooks this month",
      "Grade 1 students read faster than Grade 5 students",
      "Teachers replaced reading with spelling games",
    ],
    correctAnswer: 0,
    explanation: `This option includes the key people, activity, and result from the passage.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The coach told the team to be "alert" during the match. What does "alert" mean here?`,
    options: [
      "Asleep",
      "Ready and watchful",
      "Very noisy",
      "Late for practice",
    ],
    correctAnswer: 1,
    explanation: `In this context, "alert" means paying close attention and being ready.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Choose the word that is closest in meaning to "rapid."`,
    options: [
      "slow",
      "quiet",
      "fast",
      "rough",
    ],
    correctAnswer: 2,
    explanation: `"Rapid" and "fast" have similar meanings.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is the opposite of "generous"?`,
    options: [
      "kind",
      "helpful",
      "friendly",
      "selfish",
    ],
    correctAnswer: 3,
    explanation: `"Selfish" is the antonym of "generous."`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Bread is to bakery as medicine is to:`,
    options: [
      "pharmacy",
      "stadium",
      "harbour",
      "museum",
    ],
    correctAnswer: 0,
    explanation: `A bakery is where bread is sold or made, and a pharmacy is where medicine is sold.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Prefixes",
    question: `What does the prefix "re-" mean in the word "rewrite"?`,
    options: [
      "without",
      "again",
      "before",
      "under",
    ],
    correctAnswer: 1,
    explanation: `The prefix "re-" means again, so "rewrite" means write again.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Suffixes",
    question: `Adding "-ful" to "care" forms "careful." What does "careful" mean?`,
    options: [
      "full of care",
      "without care",
      "care from long ago",
      "care that is broken",
    ],
    correctAnswer: 0,
    explanation: `The suffix "-ful" means full of, so "careful" means showing care.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `Which sentence uses "light" to mean "not heavy"?`,
    options: [
      "Please light the candle.",
      "The light from the lamp is bright.",
      "We will light fireworks tonight.",
      "Her bag is light, so she can carry it easily.",
    ],
    correctAnswer: 3,
    explanation: `In option B, "light" describes weight.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `"My backpack is as heavy as a rock." This is an example of:`,
    options: [
      "metaphor",
      "personification",
      "simile",
      "alliteration",
    ],
    correctAnswer: 2,
    explanation: `A simile compares two things using "as" or "like."`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `"The hall was silent during the performance." What does "silent" mean?`,
    options: [
      "crowded",
      "colourful",
      "moving",
      "quiet",
    ],
    correctAnswer: 3,
    explanation: `"Silent" means very quiet with little or no sound.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Shades of Meaning",
    question: `Which word shows a stronger feeling than "tired"?`,
    options: [
      "exhausted",
      "sleepy",
      "calm",
      "steady",
    ],
    correctAnswer: 0,
    explanation: `"Exhausted" means extremely tired, so it is stronger than "tired."`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Sentence Correction",
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      "The players on the field runs quickly.",
      "The players on the field run quickly.",
      "The players on the field is running quickly.",
      "The players on the field was quick.",
    ],
    correctAnswer: 1,
    explanation: `"Players" is plural, so the correct verb is "run."`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence uses end punctuation correctly?`,
    options: [
      "What time does the bus leave.",
      "Please pack your lunch?",
      "Our class visited the museum.",
      "Watch out for that puddle,",
    ],
    correctAnswer: 2,
    explanation: `Option C is a complete statement ending with a period.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the correct pronoun: "Keisha and ___ will present the project."`,
    options: [
      "me",
      "my",
      "mine",
      "I",
    ],
    correctAnswer: 3,
    explanation: `The pronoun is part of the subject, so "I" is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Tense",
    question: `Select the sentence in past tense.`,
    options: [
      "We visited Devon House last Saturday.",
      "We visit Devon House each term.",
      "We are visiting Devon House now.",
      "We will visit Devon House next term.",
    ],
    correctAnswer: 0,
    explanation: `"Visited" shows an action completed in the past.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Commas in a Series",
    question: `Which sentence uses commas correctly in a list?`,
    options: [
      "I packed pencils erasers and a ruler.",
      "I packed pencils, erasers, and a ruler.",
      "I packed, pencils erasers and a ruler.",
      "I packed pencils, erasers and, a ruler.",
    ],
    correctAnswer: 1,
    explanation: `Items in a list should be separated clearly by commas.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Contractions",
    question: `Which word correctly completes the sentence? "They ___ coming after lunch."`,
    options: [
      "theyre",
      "their",
      "they're",
      "there",
    ],
    correctAnswer: 2,
    explanation: `"They're" is the contraction of "they are."`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Capitalisation",
    question: `Which sentence is capitalised correctly?`,
    options: [
      "on monday we visited spanish town.",
      "On monday we visited Spanish town.",
      "on Monday we visited spanish Town.",
      "On Monday we visited Spanish Town.",
    ],
    correctAnswer: 3,
    explanation: `Days of the week and place names must begin with capital letters.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Apostrophes",
    question: `Which sentence uses an apostrophe correctly to show possession?`,
    options: [
      "The teachers book is on the desk.",
      "The teacher's book is on the desk.",
      "The teachers' book is on the desk" ,
      "The teacher book's is on the desk.",
    ],
    correctAnswer: 1,
    explanation: `"Teacher's" correctly shows that one teacher owns the book.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the adjective in this sentence: "The bright kite flew high."`,
    options: [
      "flew",
      "high",
      "kite",
      "bright",
    ],
    correctAnswer: 3,
    explanation: `"Bright" describes the noun "kite," so it is the adjective.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Run-on Sentences",
    question: `Which option fixes this run-on sentence? "The rain stopped we went outside."`,
    options: [
      "The rain stopped, we went outside.",
      "The rain stopped and we went outside.",
      "The rain stopped we, went outside.",
      "The rain, stopped we went outside.",
    ],
    correctAnswer: 1,
    explanation: `Adding "and" joins the two complete thoughts correctly for this level.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `Your class wants cleaner bathrooms at school. Which writing purpose fits a letter to the principal?`,
    options: [
      "to persuade",
      "to entertain",
      "to retell a story",
      "to describe a football match",
    ],
    correctAnswer: 0,
    explanation: `A letter asking for change should persuade the reader to act.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which is the BEST topic sentence for a paragraph about healthy lunches?`,
    options: [
      "My lunchbox is blue and wide.",
      "Healthy lunches help students learn and stay active.",
      "Yesterday I traded my juice for water.",
      "Chicken patties are sold near the gate.",
    ],
    correctAnswer: 1,
    explanation: `A good topic sentence states the main idea of the whole paragraph.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail BEST supports this idea: "Reading daily improves vocabulary"?`,
    options: [
      "My cousin prefers cricket to netball.",
      "Our classroom walls are painted cream.",
      "Daily reading introduces readers to many new words.",
      "Some books have glossy covers.",
    ],
    correctAnswer: 2,
    explanation: `This detail directly explains how daily reading can build vocabulary.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Audience",
    question: `You are writing instructions for Grade 1 students. Which sentence is most suitable?`,
    options: [
      "Commence the procedure by securing required materials.",
      "It is incumbent upon pupils to comply immediately.",
      "First, take your pencil and write your name.",
      "The aforementioned sequence should then be executed.",
    ],
    correctAnswer: 2,
    explanation: `This option uses clear, simple words appropriate for younger readers.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Conclusion",
    question: `Which concluding sentence best ends a paragraph about saving water at school?`,
    options: [
      "Water flows through pipes under the road.",
      "My friend forgot his bottle yesterday.",
      "Some taps are silver and some are white.",
      "If we all save water, our school and community will benefit.",
    ],
    correctAnswer: 3,
    explanation: `A conclusion should wrap up the main idea and leave a clear final thought.`
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
    const completedAtIso = new Date().toISOString()
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
      completedAt: completedAtIso,
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
