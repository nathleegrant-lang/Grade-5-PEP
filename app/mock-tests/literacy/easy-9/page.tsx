"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

const g5LaEasy9Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "to entertain with a fantasy adventure",
      "to describe the pupils’ organized school activity",
      "to explain why sports day was postponed",
      "to list rules for a spelling contest",
    ],
    correctAnswer: 0,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "They cancelled the activity after assembly.",
      "They used a schedule or record to guide the activity.",
      "They sold tickets at the gate.",
      "They worked alone without a teacher.",
    ],
    correctAnswer: 1,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "Only adults did the work.",
      "The pupils were careless.",
      "The school was closed.",
      "The activity was planned and helpful.",
    ],
    correctAnswer: 2,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "comfortable means suitable for the person",
      "comfortable means broken into pieces",
      "comfortable means very expensive",
      "comfortable means impossible to find",
    ],
    correctAnswer: 3,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "to persuade readers to avoid school clubs",
      "to inform readers about a useful school event",
      "to describe a storm at school",
      "to compare two famous athletes",
    ],
    correctAnswer: 0,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "First they went home; then they listened to directions.",
      "First they received prizes; then they began planning.",
      "First visitors left; then the event opened.",
      "First pupils planned; then they carried out the task.",
    ],
    correctAnswer: 1,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "Because the bell rang, the trees became taller.",
      "Because pupils worked together, the activity was successful.",
      "Because no one listened, the fair opened early.",
      "Because it rained indoors, the books disappeared.",
    ],
    correctAnswer: 2,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. The pupils learned that a good business needs planning, teamwork, and polite service."

Which answer best matches the passage?`,
    options: [
      "A sentence about teamwork and careful records supports the answer.",
      "A sentence about a football match supports the answer.",
      "A sentence about a lost puppy supports the answer.",
      "A sentence about a birthday party supports the answer.",
    ],
    correctAnswer: 3,
    explanation: `The passage shows junior entrepreneurship fair as a planned, helpful activity involving pupils.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The community activity helped others through shared effort.",
      "The event was mainly about buying new uniforms.",
      "The children avoided helping younger pupils.",
      "The passage focuses on a private family trip.",
    ],
    correctAnswer: 0,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The children avoided helping younger pupils.",
      "The event was mainly about buying new uniforms.",
      "The passage focuses on a private family trip.",
      "The community activity helped others through shared effort.",
    ],
    correctAnswer: 1,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The passage focuses on a private family trip.",
      "The community activity helped others through shared effort.",
      "The children avoided helping younger pupils.",
      "The event was mainly about buying new uniforms.",
    ],
    correctAnswer: 2,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The community activity helped others through shared effort.",
      "The event was mainly about buying new uniforms.",
      "The children avoided helping younger pupils.",
      "The passage focuses on a private family trip.",
    ],
    correctAnswer: 3,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The community activity helped others through shared effort.",
      "The event was mainly about buying new uniforms.",
      "The children avoided helping younger pupils.",
      "The passage focuses on a private family trip.",
    ],
    correctAnswer: 0,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Compare Ideas",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The children avoided helping younger pupils.",
      "The event was mainly about buying new uniforms.",
      "The passage focuses on a private family trip.",
      "The community activity helped others through shared effort.",
    ],
    correctAnswer: 1,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Problem and Solution",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind."

What does the passage help the reader understand?`,
    options: [
      "The passage focuses on a private family trip.",
      "The community activity helped others through shared effort.",
      "The children avoided helping younger pupils.",
      "The event was mainly about buying new uniforms.",
    ],
    correctAnswer: 2,
    explanation: `The details show charity products project brought people together for a helpful purpose.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “steady” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “steady” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 3,
    explanation: `Context clues in the school or community situation show that “steady” has the practical meaning used in the correct option.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “gently” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “gently” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 0,
    explanation: `Context clues in the school or community situation show that “gently” has the practical meaning used in the correct option.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “bright” is used in context. Which option gives the best meaning?`,
    options: [
      "It names a place far from the school.",
      "It means the opposite of what the sentence suggests.",
      "It means a loud sound made by traffic.",
      "In the sentence, “bright” means a sensible meaning that fits the activity.",
    ],
    correctAnswer: 1,
    explanation: `Context clues in the school or community situation show that “bright” has the practical meaning used in the correct option.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “careful” is used in context. Which option gives the best meaning?`,
    options: [
      "It means a loud sound made by traffic.",
      "In the sentence, “careful” means a sensible meaning that fits the activity.",
      "It names a place far from the school.",
      "It means the opposite of what the sentence suggests.",
    ],
    correctAnswer: 2,
    explanation: `Context clues in the school or community situation show that “careful” has the practical meaning used in the correct option.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “useful” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “useful” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 3,
    explanation: `Context clues in the school or community situation show that “useful” has the practical meaning used in the correct option.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “purpose” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “purpose” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 0,
    explanation: `Context clues in the school or community situation show that “purpose” has the practical meaning used in the correct option.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “encouraged” is used in context. Which option gives the best meaning?`,
    options: [
      "It names a place far from the school.",
      "It means the opposite of what the sentence suggests.",
      "It means a loud sound made by traffic.",
      "In the sentence, “encouraged” means a sensible meaning that fits the activity.",
    ],
    correctAnswer: 1,
    explanation: `Context clues in the school or community situation show that “encouraged” has the practical meaning used in the correct option.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “materials” is used in context. Which option gives the best meaning?`,
    options: [
      "It means a loud sound made by traffic.",
      "In the sentence, “materials” means a sensible meaning that fits the activity.",
      "It names a place far from the school.",
      "It means the opposite of what the sentence suggests.",
    ],
    correctAnswer: 2,
    explanation: `Context clues in the school or community situation show that “materials” has the practical meaning used in the correct option.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “displayed” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “displayed” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 3,
    explanation: `Context clues in the school or community situation show that “displayed” has the practical meaning used in the correct option.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In a passage about student business fair, the word “pride” is used in context. Which option gives the best meaning?`,
    options: [
      "In the sentence, “pride” means a sensible meaning that fits the activity.",
      "It means the opposite of what the sentence suggests.",
      "It names a place far from the school.",
      "It means a loud sound made by traffic.",
    ],
    correctAnswer: 0,
    explanation: `Context clues in the school or community situation show that “pride” has the practical meaning used in the correct option.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `The club ___ the plants every Wednesday.`,
    options: [
      "watering",
      "water",
      "were water",
      "waters",
    ],
    correctAnswer: 1,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Yesterday, the pupils ___ their display.`,
    options: [
      "preparing",
      "prepared",
      "prepares",
      "prepare",
    ],
    correctAnswer: 2,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `Maya lent Jada a ruler because ___ had an extra one.`,
    options: [
      "she",
      "they",
      "it",
      "we",
    ],
    correctAnswer: 3,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "“Please bring gloves,” said Mr. Brown.",
      "“Please bring gloves” said Mr. Brown.",
      "Please bring gloves, said Mr. Brown.",
      "“Please bring gloves said Mr. Brown.”",
    ],
    correctAnswer: 0,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Adjective Use",
    question: `Choose the sentence with the best describing word.`,
    options: [
      "Neatly poster caught the visitors.",
      "The poster caught attention neat.",
      "The poster neat caught attention.",
      "The neat poster caught the visitors’ attention.",
    ],
    correctAnswer: 1,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best word: We packed water ___ the afternoon was hot.`,
    options: [
      "so",
      "because",
      "or",
      "but",
    ],
    correctAnswer: 2,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Complete Sentence",
    question: `Which is a complete sentence?`,
    options: [
      "The students shared books with Grade 1.",
      "After the bell near the gate.",
      "Because the table with cards.",
      "The clean bags on Saturday.",
    ],
    correctAnswer: 3,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Comma in a Series",
    question: `Which sentence uses commas correctly?`,
    options: [
      "We need pencils, glue, paper, and string.",
      "We need pencils glue, paper and string.",
      "We need, pencils glue paper, and string.",
      "We need pencils, glue paper and, string.",
    ],
    correctAnswer: 0,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Possessive Noun",
    question: `Choose the correct possessive form.`,
    options: [
      "The classes chart was full.",
      "The class chart’s was full.",
      "The classs chart was full.",
      "The class’s chart was full.",
    ],
    correctAnswer: 1,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which combines the ideas best?`,
    options: [
      "The event went because carefully pupils.",
      "The pupils planned carefully, and the event went well.",
      "Planning carefully and event went.",
      "The pupils planned carefully the event went well.",
    ],
    correctAnswer: 2,
    explanation: `The correct option follows standard sentence grammar and fits the context clearly.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a notice for pupils about the event connected to selling simple products for charity. What is the best approach?`,
    options: [
      "Use a clear heading, important details, and polite language for a notice for pupils about the event.",
      "Hide the date and place so readers must guess.",
      "Use only jokes and leave out the main message.",
      "Write one very long sentence with no punctuation.",
    ],
    correctAnswer: 3,
    explanation: `Effective writing matches the purpose and audience with clear details and appropriate language.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a friendly letter thanking helpers connected to selling simple products for charity. What is the best approach?`,
    options: [
      "Use a clear heading, important details, and polite language for a friendly letter thanking helpers.",
      "Hide the date and place so readers must guess.",
      "Use only jokes and leave out the main message.",
      "Write one very long sentence with no punctuation.",
    ],
    correctAnswer: 0,
    explanation: `Effective writing matches the purpose and audience with clear details and appropriate language.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a school announcement for assembly connected to selling simple products for charity. What is the best approach?`,
    options: [
      "Use only jokes and leave out the main message.",
      "Hide the date and place so readers must guess.",
      "Write one very long sentence with no punctuation.",
      "Use a clear heading, important details, and polite language for a school announcement for assembly.",
    ],
    correctAnswer: 1,
    explanation: `Effective writing matches the purpose and audience with clear details and appropriate language.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a poster for the community project connected to selling simple products for charity. What is the best approach?`,
    options: [
      "Write one very long sentence with no punctuation.",
      "Use a clear heading, important details, and polite language for a poster for the community project.",
      "Use only jokes and leave out the main message.",
      "Hide the date and place so readers must guess.",
    ],
    correctAnswer: 2,
    explanation: `Effective writing matches the purpose and audience with clear details and appropriate language.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a short report for the school newsletter connected to selling simple products for charity. What is the best approach?`,
    options: [
      "Use a clear heading, important details, and polite language for a short report for the school newsletter.",
      "Hide the date and place so readers must guess.",
      "Use only jokes and leave out the main message.",
      "Write one very long sentence with no punctuation.",
    ],
    correctAnswer: 3,
    explanation: `Effective writing matches the purpose and audience with clear details and appropriate language.`
  },
]

const shuffleAnswerOptions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const optionsWithOriginalIndex = question.options.map((option, index) => ({ option, index }))

    for (let i = optionsWithOriginalIndex.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [optionsWithOriginalIndex[j], optionsWithOriginalIndex[i]]
    }

    const correctAnswer = optionsWithOriginalIndex.findIndex((item) => item.index === question.correctAnswer)

    return {
      ...question,
      options: optionsWithOriginalIndex.map((item) => item.option),
      correctAnswer,
    }
  })
}

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy9Questions : g5LaEasy9Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 9",
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
    const shuffledQuestions = shuffleAnswerOptions(sourceQuestions)
    setRandomizedQuestions(shuffledQuestions)
    setAnswers(new Array(shuffledQuestions.length).fill(null))
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 9</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 9</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 9</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
