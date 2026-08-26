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

const g5LaEasy4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 1, then answer the question.

Passage 1: The Garden Morning

On Friday morning, Grade 5 Blue gathered near the fence behind the canteen. Their teacher, Miss Brown, explained that the class would turn the dusty patch into a small school garden. Some students carried bags of soil, while others sorted seedlings of pak choi, tomato, and sweet pepper. Before anyone began digging, Jada read the planting plan aloud so each group knew its task.

Malik noticed that the youngest seedlings were wilting in the sun. He suggested moving them under the ackee tree until the holes were ready. Miss Brown smiled and asked him to explain his idea to the class. By break time, the students had planted two neat rows and placed labelled sticks beside each seedling.

The project was not finished in one morning. The class made a watering schedule and agreed to check the garden after lunch each day. Miss Brown reminded them that a garden grows best when people care for it regularly, not just when it is new.

What is the passage mainly about?`,
    options: [
      "A class preparing and beginning a school garden project",
      "A canteen selling more vegetables to students",
      "A teacher choosing a new class monitor",
      "A storm damaging seedlings behind the school",
    ],
    correctAnswer: 0,
    explanation: `The whole passage focuses on Grade 5 Blue planning, planting, and arranging care for a school garden.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Detail",
    question: `Read Passage 1, then answer the question.

Which crops did the students sort before planting?`,
    options: [
      "Yam, corn, and pumpkin",
      "Pak choi, tomato, and sweet pepper",
      "Banana, mango, and ackee",
      "Callaloo, carrot, and beetroot",
    ],
    correctAnswer: 1,
    explanation: `The passage says the students sorted seedlings of pak choi, tomato, and sweet pepper.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read Passage 1, then answer the question.

Why did Malik suggest moving the seedlings under the ackee tree?`,
    options: [
      "He wanted to hide them from the teacher.",
      "He thought the soil bags were too heavy.",
      "He wanted to protect them from the hot sun.",
      "He planned to take them home after school.",
    ],
    correctAnswer: 2,
    explanation: `Malik noticed the seedlings were wilting in the sun, so shade under the ackee tree would help protect them.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Sequence",
    question: `Read Passage 1, then answer the question.

What happened before the students began digging?`,
    options: [
      "They checked the garden after lunch.",
      "They harvested tomatoes for the canteen.",
      "They painted the fence near the canteen.",
      "Jada read the planting plan aloud.",
    ],
    correctAnswer: 3,
    explanation: `The passage states that before anyone began digging, Jada read the planting plan aloud.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read Passage 1, then answer the question.

In the sentence "Malik noticed that the youngest seedlings were wilting in the sun," what does "wilting" mean?`,
    options: [
      "Drooping because they needed care",
      "Growing taller very quickly",
      "Changing into bright flowers",
      "Being washed away by rain",
    ],
    correctAnswer: 0,
    explanation: `The seedlings were in the sun and needed shade, so "wilting" means drooping or becoming weak.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Character Trait",
    question: `Read Passage 1, then answer the question.

Which word best describes Malik in the passage?`,
    options: [
      "Careless",
      "Observant",
      "Boastful",
      "Impatient",
    ],
    correctAnswer: 1,
    explanation: `Malik noticed a problem with the seedlings and suggested a helpful solution, showing he was observant.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read Passage 1, then answer the question.

Why did the class make a watering schedule?`,
    options: [
      "To decide who would sell vegetables at break",
      "To choose which students would skip lunch",
      "To make sure the garden received regular care",
      "To keep students away from the ackee tree",
    ],
    correctAnswer: 2,
    explanation: `The schedule helped the students care for the garden regularly after the first planting day.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Theme",
    question: `Read Passage 1, then answer the question.

Which lesson best fits Passage 1?`,
    options: [
      "Plants grow better when they are left alone.",
      "The fastest student should make every decision.",
      "Outdoor work is always easier than classroom work.",
      "Teamwork and steady care help a project succeed.",
    ],
    correctAnswer: 3,
    explanation: `The students shared tasks and planned regular care, showing that teamwork and consistency help projects succeed.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Text Evidence",
    question: `Read Passage 1, then answer the question.

Which detail best shows that the garden work was organised?`,
    options: [
      "Jada read the planting plan so each group knew its task.",
      "The garden was near the fence behind the canteen.",
      "The seedlings were young and stood in the sun.",
      "Break time came after the class planted two rows.",
    ],
    correctAnswer: 0,
    explanation: `A planting plan with tasks for each group is the clearest evidence that the work was organised.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read Passage 1, then answer the question.

Why did the author most likely include Miss Brown's reminder at the end?`,
    options: [
      "To explain why students should avoid gardening",
      "To show that continued responsibility matters",
      "To prove that vegetables grow in one morning",
      "To describe the taste of pak choi and tomatoes",
    ],
    correctAnswer: 1,
    explanation: `Miss Brown's reminder stresses that the garden needs regular care, so it points to continued responsibility.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 2, then answer the question.

Passage 2: The Library Drive

At the start of Literacy Week, Mr. Clarke opened the school library during lunch and after school. He wanted more students to borrow books, but many shelves were nearly empty. The reading club decided to hold a book donation drive. They made posters, visited classes, and asked families to send gently used storybooks, poems, and information books.

By Wednesday, a box near the library door was half full. Nia checked each book for torn pages, while Andre wrote the titles in a notebook. Some books were too damaged to use, so the club set them aside for recycling. On Friday, Mr. Clarke displayed the donated books on a front table with a sign that said, "Choose one new adventure."

The next week, more students visited the library. Some came for Anansi stories, and others searched for books about animals, football, and space. The reading club felt proud because their work had helped classmates find books they wanted to read.

What is Passage 2 mainly about?`,
    options: [
      "Students learning to repair every damaged book",
      "A football team using the library after practice",
      "A reading club helping the library get more useful books",
      "Mr. Clarke closing the library during Literacy Week",
    ],
    correctAnswer: 2,
    explanation: `The passage is mainly about the reading club organising donations so the library has more books for students.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Supporting Detail",
    question: `Read Passage 2, then answer the question.

What did Andre do with the donated books?`,
    options: [
      "He sold them at the front gate.",
      "He repaired all the torn pages.",
      "He read each one aloud at lunch.",
      "He wrote the titles in a notebook.",
    ],
    correctAnswer: 3,
    explanation: `The passage states that Andre wrote the titles of the donated books in a notebook.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Inference",
    question: `Read Passage 2, then answer the question.

What can you infer about the books placed on the front table?`,
    options: [
      "They were ready for students to choose and borrow.",
      "They were too damaged for anyone to read.",
      "They belonged only to Mr. Clarke.",
      "They were being hidden from younger students.",
    ],
    correctAnswer: 0,
    explanation: `The sign invited students to choose an adventure, so the displayed books were ready for students to select.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read Passage 2, then answer the question.

In the phrase "gently used storybooks," what does "gently used" suggest?`,
    options: [
      "Books written only for quiet students",
      "Books that are still in good condition",
      "Books that must be read very slowly",
      "Books kept outside in gentle rain",
    ],
    correctAnswer: 1,
    explanation: `"Gently used" means the books have been used before but are still in good enough condition to donate.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read Passage 2, then answer the question.

What happened because of the donation drive?`,
    options: [
      "Students stopped visiting the library.",
      "The school cancelled Literacy Week.",
      "Every student chose the same Anansi story.",
      "More students visited the library the next week.",
    ],
    correctAnswer: 3,
    explanation: `After the donated books were displayed, the passage says more students visited the library the next week.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `During the garden project, Tasha handled the tiny seedlings carefully because they were delicate. What does "delicate" mean in this sentence?`,
    options: [
      "Easy to damage",
      "Very noisy",
      "Too expensive",
      "Full of mud",
    ],
    correctAnswer: 0,
    explanation: `Tasha handled the seedlings carefully, which shows that "delicate" means easy to damage.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The library was usually quiet, but it became lively when the reading club displayed the new books. What does "lively" mean here?`,
    options: [
      "Locked and empty",
      "Full of energy and interest",
      "Dark and difficult to see",
      "Late for an appointment",
    ],
    correctAnswer: 1,
    explanation: `The new books attracted students, so "lively" means full of energy and interest.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Dwayne gave a brief report about the class garden; he spoke for only two minutes. What does "brief" mean?`,
    options: [
      "Funny",
      "Confusing",
      "Short",
      "Loud",
    ],
    correctAnswer: 2,
    explanation: `The clue "only two minutes" shows that "brief" means short.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The book cover was faded, but the story inside was still exciting. What does "faded" mean?`,
    options: [
      "Newly printed",
      "Covered with glue",
      "Heavy to carry",
      "Less bright than before",
    ],
    correctAnswer: 3,
    explanation: `A faded cover has lost some of its colour or brightness over time.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Synonym in Context",
    question: `Miss Brown asked the group to inspect the seedlings for insects. Which word is closest in meaning to "inspect"?`,
    options: [
      "Examine",
      "Forget",
      "Drop",
      "Borrow",
    ],
    correctAnswer: 0,
    explanation: `To inspect something is to examine or look at it carefully.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Antonym in Context",
    question: `The first poster was dull, so the club added colour to make it attractive. Which word is the opposite of "dull" as used here?`,
    options: [
      "Plain",
      "Bright",
      "Torn",
      "Careful",
    ],
    correctAnswer: 1,
    explanation: `In this sentence, dull means not bright or interesting; the opposite is bright.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Multiple-Meaning Words",
    question: `Which sentence uses "patch" to mean a small area of land?`,
    options: [
      "Grandma sewed a patch on my uniform.",
      "The nurse put a patch over the cut.",
      "The class planted vegetables in a patch behind the canteen.",
      "The technician installed a patch for the computer program.",
    ],
    correctAnswer: 2,
    explanation: `In the garden sentence, "patch" means a small piece or area of land.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `Nia said, "This new book is a treasure." What does she mean?`,
    options: [
      "The book is locked in a chest.",
      "The book is printed on gold paper.",
      "The book cannot be borrowed.",
      "The book is valuable and special to her.",
    ],
    correctAnswer: 3,
    explanation: `Nia is using a metaphor to show that the book is very valuable or special to her.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Word Parts",
    question: `The students reread the instructions before planting the seedlings. What does the prefix "re-" in "reread" mean?`,
    options: [
      "Again",
      "Not",
      "Before",
      "Wrongly",
    ],
    correctAnswer: 0,
    explanation: `The prefix "re-" means again, so reread means read again.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The donated books were arranged in categories such as stories, poems, and information books. What does "categories" mean?`,
    options: [
      "Secret messages",
      "Groups with similar features",
      "Damaged pages",
      "Very difficult words",
    ],
    correctAnswer: 1,
    explanation: `Stories, poems, and information books are groups of similar items, so "categories" means groups with similar features.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the sentence that is written correctly.`,
    options: [
      "The students waters the garden every morning.",
      "The students water the garden every morning.",
      "The students watering the garden every morning.",
      "The students has watered the garden every morning.",
    ],
    correctAnswer: 1,
    explanation: `The plural subject "students" agrees with the verb "water."`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the best verb to complete the sentence: Yesterday, the reading club ___ posters near the library.`,
    options: [
      "hang",
      "hangs",
      "hung",
      "will hang",
    ],
    correctAnswer: 2,
    explanation: `"Yesterday" shows past time, so the correct past-tense verb is "hung."`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronoun Agreement",
    question: `The students brought ___ own water bottles.`,
    options: [
      "their",
      "our",
      "your",
      "its",
    ],
    correctAnswer: 0,
    explanation: `The plural noun "students" agrees with the plural possessive word "their."`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence uses commas correctly in a list?`,
    options: [
      "We planted tomatoes, pak choi, and sweet peppers.",
      "We planted, tomatoes pak choi and sweet peppers.",
      "We planted tomatoes pak choi, and sweet peppers.",
      "We planted tomatoes, pak choi and, sweet peppers.",
    ],
    correctAnswer: 0,
    explanation: `Commas separate the items in the list: tomatoes, pak choi, and sweet peppers.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Capitalisation",
    question: `Choose the sentence with correct capitalisation.`,
    options: [
      "mr. clarke opened the library on monday.",
      "Mr. Clarke opened the library on Monday.",
      "Mr. clarke opened the Library on monday.",
      "mr. Clarke opened the library on Monday.",
    ],
    correctAnswer: 1,
    explanation: `Names, titles with names, and days of the week need capital letters: Mr. Clarke and Monday.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: [
      "After lunch near the library.",
      "Because the seedlings needed water.",
      "The class checked the garden after lunch.",
      "Carrying the box of donated books.",
    ],
    correctAnswer: 2,
    explanation: `"The class checked the garden after lunch" has a subject and a complete predicate.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Apostrophes",
    question: `Choose the sentence that shows possession correctly.`,
    options: [
      "The clubs posters were bright.",
      "The clubs' poster's were bright.",
      "The club poster's were bright.",
      "The club's posters were bright.",
    ],
    correctAnswer: 3,
    explanation: `"Club's" shows that the posters belong to one club.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Adjectives in Context",
    question: `Choose the best adjective to complete the sentence: The ___ seedlings needed shade and water.`,
    options: [
      "fragile",
      "quickly",
      "plant",
      "under",
    ],
    correctAnswer: 0,
    explanation: `"Fragile" is an adjective that describes the seedlings as easily damaged.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best word to join the ideas: The library had few books, ___ the club held a donation drive.`,
    options: [
      "or",
      "so",
      "but",
      "although",
    ],
    correctAnswer: 1,
    explanation: `"So" shows the result: because the library had few books, the club held a donation drive.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Editing for Clarity",
    question: `Which revision best fixes the sentence? "The students put labels beside the plants they were neat."`,
    options: [
      "The students put labels beside the plants, they were neat.",
      "The students put labels beside the plants they neat were.",
      "The students put neat labels beside the plants.",
      "The students neat put labels beside the plants.",
    ],
    correctAnswer: 2,
    explanation: `The revision clearly says that the labels were neat and removes the confusing wording.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Audience and Purpose",
    question: `Your class is making a poster to ask families to donate gently used books. Which sentence is best for the poster?`,
    options: [
      "Please send clean, gently used books to help our library grow.",
      "Books have been part of human history for many centuries.",
      "Some shelves are made from wood, metal, or plastic.",
      "I once read a funny book during the holiday.",
    ],
    correctAnswer: 0,
    explanation: `The best poster sentence clearly asks families to donate books and explains the helpful purpose.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which topic sentence best begins a paragraph about caring for the school garden?`,
    options: [
      "Tomatoes can be red, green, or yellow.",
      "Our school garden needs daily care from responsible students.",
      "The canteen opens when the bell rings.",
      "My favourite lunch is rice and peas.",
    ],
    correctAnswer: 1,
    explanation: `This sentence gives the main idea of a paragraph about caring for the school garden.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `A student writes: "The book donation drive was successful." Which detail best supports this idea?`,
    options: [
      "The library door is painted blue.",
      "Mr. Clarke wears glasses at school.",
      "By Friday, students had donated three boxes of useful books.",
      "The reading club meets near the office.",
    ],
    correctAnswer: 2,
    explanation: `Three boxes of useful donated books is specific evidence that the drive was successful.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Ordering Ideas",
    question: `Which order makes the most sense for instructions on planting a seedling?`,
    options: [
      "Water the plant, choose a spot, dig a hole, place the seedling.",
      "Place the seedling, cover the roots, choose a spot, dig a hole.",
      "Cover the roots, water the plant, choose a spot, dig a hole.",
      "Choose a spot, dig a hole, place the seedling, cover the roots.",
    ],
    correctAnswer: 3,
    explanation: `The logical order is to choose where to plant, dig the hole, place the seedling, and then cover the roots.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision",
    question: `A student wrote: "The library is good." Which revision gives the clearest detail?`,
    options: [
      "The library has new storybooks, quiet tables, and a helpful reading club.",
      "The library has several books and tables where students can read.",
      "The library gives students a quiet place to read and borrow books.",
      "The library has a reading club that meets with students after class.",
    ],
    correctAnswer: 0,
    explanation: `The revision gives specific details that explain what makes the library useful.`
  }
]

const extractPassage = (sourceQuestion: string) =>
  sourceQuestion.split("\n\n").slice(1, -1).join("\n\n")

const extractQuestionStem = (sourceQuestion: string) => {
  const parts = sourceQuestion.split("\n\n")
  return parts[parts.length - 1]
}

const READING_PASSAGES = {
  1: extractPassage(g5LaEasy4Questions.find((question) => question.id === 1)!.question),
  2: extractPassage(g5LaEasy4Questions.find((question) => question.id === 11)!.question),
}

const PASSAGE_BEARING_QUESTION_IDS = new Set([1, 11])

const getPassageNumber = (question?: Question): 1 | 2 | null => {
  if (question?.type !== "reading") return null
  return question.id <= 10 ? 1 : 2
}

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy4Questions : g5LaEasy4Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 4",
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
      ? prepareAssessment(g5LaEasy4Questions)
      : preparePreview(g5LaEasy4Questions, FREE_QUESTION_LIMIT)
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
