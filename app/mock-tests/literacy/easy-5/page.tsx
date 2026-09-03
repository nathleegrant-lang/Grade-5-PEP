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

const g5LaEasy5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 1, then answer the question.

Passage 1: Sports Day Helpers

On Thursday morning, Grade 5 students at Seaview Primary met under the almond tree to prepare for Sports Day. Their teacher, Mr. Grant, gave each group a task. One group checked the lane markers on the field, another filled water bottles, and a third group made signs for the class tents. Before they began, Talia read the safety rules aloud so everyone would know how to move around the field.

During practice, Dwayne noticed that the water table was too close to the running lane. He asked two classmates to help him move it nearer to the shade. Mr. Grant thanked him for thinking ahead. By lunch time, the field looked neat, and the students felt proud of their work.

The next day, families arrived with folding chairs and umbrellas. The races were exciting, but the best part for Grade 5 was seeing how their careful planning helped the day run smoothly.

What is Passage 1 mainly about?`,
    options: [
      "Grade 5 students preparing carefully for Sports Day",
      "Families buying chairs for a school event",
      "A teacher running in a race with students",
      "Students choosing new uniforms for school",
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on Grade 5 students planning, organising, and helping Sports Day run smoothly.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Detail",
    question: `Read Passage 1, then answer the question.

Which task did one group do before Sports Day?`,
    options: [
      "They sold tickets at the gate.",
      "They painted a classroom wall.",
      "They cooked lunch for visitors.",
      "They filled water bottles.",
    ],
    correctAnswer: 3,
    explanation: `The passage states that one group filled water bottles as part of the preparations.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read Passage 1, then answer the question.

Why did Dwayne move the water table?`,
    options: [
      "He wanted to hide it from the visitors.",
      "He thought the bottles were empty.",
      "He believed it would be safer away from the running lane.",
      "He wanted his group to stop working early.",
    ],
    correctAnswer: 2,
    explanation: `Dwayne noticed the table was too close to the lane, so moving it helped prevent problems during races.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Sequence",
    question: `Read Passage 1, then answer the question.

What happened before the groups began their tasks?`,
    options: [
      "Families arrived with umbrellas.",
      "The races began on the field.",
      "The students ate lunch together.",
      "Talia read the safety rules aloud.",
    ],
    correctAnswer: 3,
    explanation: `The passage says Talia read the safety rules before the students began their preparation tasks.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Character Trait",
    question: `Read Passage 1, then answer the question.

Which word best describes Dwayne?`,
    options: [
      "Thoughtful",
      "Careless",
      "Forgetful",
      "Jealous",
    ],
    correctAnswer: 0,
    explanation: `Dwayne noticed a possible safety problem and acted before it caused trouble, which shows thoughtfulness.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read Passage 1, then answer the question.

In the sentence "Mr. Grant thanked him for thinking ahead," what does "thinking ahead" mean?`,
    options: [
      "Remembering an old story",
      "Guessing the winner of a race",
      "Looking across the playing field",
      "Planning for what might happen later",
    ],
    correctAnswer: 3,
    explanation: `Dwayne planned for safety before the races, so "thinking ahead" means considering what may happen later.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read Passage 1, then answer the question.

What was one effect of the students' careful planning?`,
    options: [
      "The families cancelled the event.",
      "The field became too crowded to use.",
      "Sports Day ran more smoothly.",
      "The students forgot the safety rules.",
    ],
    correctAnswer: 2,
    explanation: `The passage says the students' careful planning helped the day run smoothly.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Theme",
    question: `Read Passage 1, then answer the question.

Which lesson best fits Passage 1?`,
    options: [
      "Winning every race is the only thing that matters.",
      "Students should never help with school events.",
      "Outdoor events do not need rules.",
      "Teamwork and preparation can help an event succeed.",
    ],
    correctAnswer: 3,
    explanation: `The students shared duties, followed rules, and prepared carefully, showing the value of teamwork and preparation.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 2, then answer the question.

Passage 2: The Safe Walk

After devotion on Monday, Constable Lewis visited Grade 5 to speak about road safety. She drew a simple map of the road outside the school gate. The map showed the crossing, the bus stop, and the corner where drivers sometimes turned quickly. She reminded the students to stop, look both ways, listen, and wait for the crossing guard's signal.

Later that week, the class practised the safe route to the bus stop. Rohan wanted to run ahead when he saw his bus, but his friend Amaya touched his shoulder and pointed to the road. Rohan stopped at the kerb and waited with the group. The bus driver smiled when the students boarded in a line instead of pushing.

On Friday, Mrs. Henry asked the class what they had learned. Amaya said that being careful for a few extra seconds was better than rushing into danger. The class agreed to remind younger students to use the crossing every afternoon.

What is Passage 2 mainly about?`,
    options: [
      "A class learning and practising safe road habits",
      "A bus driver repairing a school bus",
      "Students planning a Friday concert",
      "A teacher drawing pictures for an art lesson",
    ],
    correctAnswer: 0,
    explanation: `The whole passage is about students learning road safety rules and practising them near school.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Detail",
    question: `Read Passage 2, then answer the question.

What did Constable Lewis draw for the class?`,
    options: [
      "A picture of the school garden",
      "A timetable for the school buses",
      "A poster about healthy snacks",
      "A simple map of the road outside the school gate",
    ],
    correctAnswer: 3,
    explanation: `The passage states that Constable Lewis drew a simple map of the road outside the school gate.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read Passage 2, then answer the question.

Why did Amaya touch Rohan's shoulder?`,
    options: [
      "She wanted him to carry her schoolbag.",
      "She was telling him the bus was late.",
      "She wanted to remind him to stop and be safe.",
      "She was asking him to change seats.",
    ],
    correctAnswer: 2,
    explanation: `Rohan wanted to run ahead, and Amaya pointed to the road, so she was reminding him to act safely.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read Passage 2, then answer the question.

In the passage, the word "kerb" means:`,
    options: [
      "the seat at the back of a bus",
      "the bell used by the crossing guard",
      "the edge of the pavement beside the road",
      "the gate at the front of the school",
    ],
    correctAnswer: 2,
    explanation: `Rohan stopped at the kerb before crossing, so it means the edge of the pavement next to the road.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Evidence",
    question: `Read Passage 2, then answer the question.

Which detail best shows that the students used good bus safety?`,
    options: [
      "Constable Lewis visited after devotion.",
      "The corner had drivers who sometimes turned quickly.",
      "Mrs. Henry asked what the class had learned.",
      "The students boarded in a line instead of pushing.",
    ],
    correctAnswer: 3,
    explanation: `Boarding in a line instead of pushing is the clearest evidence that the students practised safe bus behaviour.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read Passage 2, then answer the question.

Why did the author most likely include Amaya's final statement?`,
    options: [
      "To show the lesson that safety is worth a short wait",
      "To explain how to repair a bus door",
      "To list every road near the school",
      "To prove that running is always safer than walking",
    ],
    correctAnswer: 0,
    explanation: `Amaya's statement sums up the safety lesson: it is better to wait briefly than rush into danger.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Read Passage 2, then answer the question.

Which statement is an opinion about the road safety lesson?`,
    options: [
      "The class practised the safe route to the bus stop.",
      "The safety talk was the most useful lesson of the week.",
      "The students waited for the crossing guard's signal.",
      "Constable Lewis drew a map of the road.",
    ],
    correctAnswer: 1,
    explanation: `Calling the talk "the most useful lesson" is a personal judgement, so it is an opinion.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The lane markers were aligned before Sports Day, so each runner could stay in a straight path. What does "aligned" mean?`,
    options: [
      "placed in a proper line",
      "covered with bright paint",
      "removed from the field",
      "shared among the teams",
    ],
    correctAnswer: 0,
    explanation: `The clue "straight path" shows that aligned means placed neatly in line.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonym in Context",
    question: `Maya gave a brief reminder before the race began. Which word is closest in meaning to "brief"?`,
    options: [
      "loud",
      "short",
      "angry",
      "secret",
    ],
    correctAnswer: 1,
    explanation: `A brief reminder is a short reminder, not a long speech.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Antonym in Context",
    question: `The students were cautious near the road. Which word is the opposite of "cautious"?`,
    options: [
      "careful",
      "patient",
      "reckless",
      "quiet",
    ],
    correctAnswer: 2,
    explanation: `Cautious means careful; reckless means not careful, so it is the opposite.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `Which sentence uses "line" to mean people standing one behind another?`,
    options: [
      "Draw a line under the title.",
      "The poem's first line is short.",
      "The fishing line broke in the river.",
      "The students formed a line at the bus stop.",
    ],
    correctAnswer: 3,
    explanation: `Students forming a line means they stood one behind another.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `"The whistle sliced through the noisy field." What does this sentence help the reader imagine?`,
    options: [
      "A sharp sound heard clearly",
      "A whistle being cut in half",
      "A field with no students on it",
      "A runner carrying a knife",
    ],
    correctAnswer: 0,
    explanation: `The figurative phrase suggests the whistle made a sharp, clear sound above the noise.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The crossing guard signalled, and the children proceeded across the road. What does "proceeded" mean?`,
    options: [
      "turned back",
      "moved forward",
      "waited silently",
      "dropped their bags",
    ],
    correctAnswer: 1,
    explanation: `After the signal, the children crossed, so proceeded means moved forward.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix",
    question: `In the word "unsafe," the prefix "un-" means:`,
    options: [
      "again",
      "before",
      "not",
      "many",
    ],
    correctAnswer: 2,
    explanation: `The prefix "un-" means not, so unsafe means not safe.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix",
    question: `Which word means "full of care"?`,
    options: [
      "careless",
      "caring",
      "recare",
      "careful",
    ],
    correctAnswer: 3,
    explanation: `The suffix "-ful" means full of, so careful means full of care.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Word Choice",
    question: `Before the practice race began, the teacher gave clear ___ so runners knew what to do.`,
    options: [
      "instructions",
      "equipment",
      "scores",
      "results",
    ],
    correctAnswer: 0,
    explanation: `Instructions tell the runners what they are expected to do before the activity begins.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The crowd applauded when the final runner crossed the finish line. What does "applauded" mean?`,
    options: [
      "waited",
      "clapped",
      "whispered",
      "complained",
    ],
    correctAnswer: 1,
    explanation: `At an event, a crowd applauds by clapping to show approval or support.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      "The students waits at the crossing.",
      "The buses stops near the gate.",
      "The crossing guard wave every morning.",
      "The teacher reminds the class about safety.",
    ],
    correctAnswer: 3,
    explanation: `"Teacher" is singular, so the verb "reminds" agrees with it.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the correct verb: Yesterday, the team ______ the field for Sports Day.`,
    options: [
      "prepared",
      "prepare",
      "prepares",
      "will prepare",
    ],
    correctAnswer: 0,
    explanation: `"Yesterday" shows past time, so the past-tense verb "prepared" is correct.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the correct pronoun: Amaya and Rohan waited until ______ saw the signal.`,
    options: [
      "she",
      "they",
      "he",
      "it",
    ],
    correctAnswer: 1,
    explanation: `Amaya and Rohan are two people, so the plural pronoun "they" is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Adjectives",
    question: `Which word is an adjective in this sentence? The careful students crossed the busy road.`,
    options: [
      "crossed",
      "students",
      "careful",
      "road",
    ],
    correctAnswer: 2,
    explanation: `"Careful" describes the students, so it is an adjective.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is correctly punctuated?`,
    options: [
      "Bring water a cap and your house shirt.",
      "Bring water, a cap, and your house shirt.",
      "Bring water, a cap and, your house shirt.",
      "Bring, water a cap, and your house shirt.",
    ],
    correctAnswer: 1,
    explanation: `Commas separate the items in the list: water, a cap, and your house shirt.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Capitalisation",
    question: `Which sentence uses capital letters correctly?`,
    options: [
      "on friday, our class practised road safety.",
      "On Friday, our class practised road safety.",
      "On friday, our Class practised Road safety.",
      "on Friday, Our class practised road Safety.",
    ],
    correctAnswer: 1,
    explanation: `The first word and the day of the week should be capitalised: On Friday.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: [
      "Near the school gate.",
      "Before the bell rang.",
      "The runners waited at the starting line.",
      "With two full water bottles.",
    ],
    correctAnswer: 2,
    explanation: `This option has a subject and a verb and expresses a complete thought.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best conjunction: The sun was hot, ______ the students drank water after the race.`,
    options: [
      "because",
      "so",
      "although",
      "unless",
    ],
    correctAnswer: 1,
    explanation: `"So" shows the result: the sun was hot, so the students drank water.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Apostrophes",
    question: `Which phrase correctly shows that the whistle belongs to the teacher?`,
    options: [
      "the whistle teacher",
      "the teachers whistle",
      "the teacher's whistle",
      "the teachers' whistle's",
    ],
    correctAnswer: 2,
    explanation: `For one teacher, use apostrophe + s: the teacher's whistle.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which sentence best combines these ideas? The bus arrived. The students boarded calmly.`,
    options: [
      "The bus arrived, and the students boarded calmly.",
      "The bus arrived the students boarded calmly.",
      "The bus arrived because calmly.",
      "Boarded calmly the bus arrived students.",
    ],
    correctAnswer: 0,
    explanation: `The sentence correctly joins two complete ideas with a comma and the conjunction "and."`
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `A student is writing a paragraph about staying safe after school. Which is the best topic sentence?`,
    options: [
      "After-school safety is important because students must make careful choices near roads and buses.",
      "The bus is yellow and parks near the gate.",
      "I saw three students yesterday afternoon.",
      "Roads can be long, short, wide, or narrow.",
    ],
    correctAnswer: 0,
    explanation: `The sentence clearly states the paragraph's main idea about after-school safety.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports a paragraph about preparing for Sports Day?`,
    options: [
      "My favourite fruit is pineapple.",
      "The students checked lane markers and filled water bottles.",
      "The library has many storybooks.",
      "Rain sometimes falls in the afternoon.",
    ],
    correctAnswer: 1,
    explanation: `Checking lane markers and filling water bottles directly supports the idea of preparing for Sports Day.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Audience and Tone",
    question: `You are writing a notice to Grade 5 students about bus safety. Which tone is most suitable?`,
    options: [
      "Formal and strict",
      "Friendly and playful",
      "Clear, polite, and helpful",
      "Casual and humorous",
    ],
    correctAnswer: 2,
    explanation: `A school notice should give information in a clear, polite, and helpful tone.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Revision",
    question: `A student wrote: "Sports Day was nice." Which revision gives the clearest detail?`,
    options: [
      "Sports Day was enjoyable because several races were held.",
      "Sports Day was lively because pupils gathered on the field for events.",
      "Sports Day was memorable because each house took part in activities.",
      "Sports Day was exciting because students cheered, raced, and helped their teams.",
    ],
    correctAnswer: 3,
    explanation: `The revision gives clear details that explain why Sports Day was exciting.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding Sentence",
    question: `Which sentence best concludes a paragraph about road safety?`,
    options: [
      "Students should look both ways before crossing the road.",
      "Therefore, taking a few careful seconds can help students get home safely.",
      "Road safety includes several rules that students should learn.",
      "First, wait until the road is clear before stepping from the curb.",
    ],
    correctAnswer: 1,
    explanation: `This sentence wraps up the paragraph by restating the importance of careful road-safety choices.`
  }
]

const extractPassage = (sourceQuestion: string) =>
  sourceQuestion.split("\n\n").slice(1, -1).join("\n\n")

const extractQuestionStem = (sourceQuestion: string) => {
  const parts = sourceQuestion.split("\n\n")
  return parts[parts.length - 1]
}

const READING_PASSAGES = {
  1: extractPassage(g5LaEasy5Questions.find((question) => question.id === 1)!.question),
  2: extractPassage(g5LaEasy5Questions.find((question) => question.id === 9)!.question),
}

const PASSAGE_BEARING_QUESTION_IDS = new Set([1, 9])

const getPassageNumber = (question?: Question): 1 | 2 | null => {
  if (question?.type !== "reading") return null
  return question.id <= 8 ? 1 : 2
}

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
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy5Questions : g5LaEasy5Questions.slice(0, FREE_QUESTION_LIMIT)
  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
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

  const calcScore  = () => answers.reduce<number>((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
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
      testName: "Easy 5",
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

  const startTest = () => {
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaEasy5Questions)
      : preparePreview(g5LaEasy5Questions, FREE_QUESTION_LIMIT)
    setRandomizedQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    hasSavedResult.current = false
    setStarted(true)
  }

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null)); setTimeLeft(60 * 60); hasSavedResult.current = false
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const q = availableQuestions[currentQuestion]
  const passageNumber = getPassageNumber(q)
  const passageText = passageNumber ? READING_PASSAGES[passageNumber] : null
  const showPassagePanel = Boolean(passageText && q)
  const displayedQuestion = q && PASSAGE_BEARING_QUESTION_IDS.has(q.id)
    ? extractQuestionStem(q.question)
    : q?.question
  const answeredCount = answers.filter((a) => a !== null).length

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-xl border-amber-200">
            <CardHeader className="bg-amber-50"><CardTitle className="text-amber-800">Preview Complete</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">You completed the free preview for this test. Upgrade Access to unlock all 40 questions.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Button></Link>
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
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade Access to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Button></Link>
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
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">You completed the free preview.</p><p className="text-sm text-amber-700">Upgrade Access to unlock all 40 questions.</p><Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade Access</Button></Link></div>)}
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
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade Access to access the full test.</p></div>)}
          <Card className="mb-6 border-blue-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">{q.skill}</span>
                <span className="text-xs uppercase tracking-wide opacity-70">{secLabel(q.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showPassagePanel && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
                  <p className="mb-2 text-sm font-semibold text-blue-900">Passage {passageNumber}</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">{passageText}</p>
                </div>
              )}
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">{displayedQuestion}</p>
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
                  <button key={idx} onClick={() => setCurrentQuestion(Math.min(Math.max(idx, 0), totalQuestions - 1))}
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
