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

const g5LaEasy7Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

What is the main idea of the passage?`,
    options: [
      "The school library started a reading challenge to encourage steady reading.",
      "The pupils were learning how to repair damaged library shelves.",
      "The librarian cancelled all reading activities for the month.",
      "The class with the loudest readers would win a sports prize.",
    ],
    correctAnswer: 0,
    explanation: `The whole passage focuses on the School Library Reading Challenge and how it encouraged pupils to read steadily.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

What did each Grade 5 pupil record on a chart?`,
    options: [
      "The number of snacks sold at break",
      "The titles of books younger children donated",
      "The reading minutes spent on the challenge",
      "The names of pupils absent from devotion",
    ],
    correctAnswer: 2,
    explanation: `The passage says each Grade 5 pupil recorded reading minutes on a chart.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

What can the reader infer about the challenge?`,
    options: [
      "It was meant to build regular reading habits.",
      "It was designed to stop pupils from borrowing books.",
      "It required pupils to read only difficult books.",
      "It took place because the library had no books.",
    ],
    correctAnswer: 0,
    explanation: `Because pupils tracked minutes, chose suitable books, and wrote comments, the challenge was meant to build regular reading habits.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

In the passage, what does “comfortable level” most likely mean?`,
    options: [
      "A book that is suitable for the pupil to read",
      "A shelf that is soft enough to sit on",
      "A prize that costs very little money",
      "A comment that is written in red ink",
    ],
    correctAnswer: 0,
    explanation: `In this context, a comfortable level means a book that matches the pupil’s reading ability.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

Why did the author most likely write this passage?`,
    options: [
      "To explain how a reading challenge worked at school",
      "To persuade pupils never to visit a library",
      "To describe rules for a football competition",
      "To entertain readers with a mystery story",
    ],
    correctAnswer: 0,
    explanation: `The author gives facts about the reading challenge, so the purpose is to explain how it worked.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

What happened after pupils finished a book?`,
    options: [
      "They wrote a short comment.",
      "They closed the library for the day.",
      "They received the new novels immediately.",
      "They stopped recommending stories.",
    ],
    correctAnswer: 0,
    explanation: `The passage states that everyone had to write a short comment after finishing a book.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

What would cause a class to receive the new set of novels?`,
    options: [
      "Having the most steady reading by the end of the month",
      "Choosing only books with the longest titles",
      "Reading aloud at Monday devotion",
      "Writing no comments after reading",
    ],
    correctAnswer: 0,
    explanation: `The passage says the class with the most steady reading would receive a new set of novels.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"At Monday devotion, the librarian announced a School Library Reading Challenge. Each Grade 5 pupil chose a book at a comfortable level and recorded reading minutes on a chart. Friends recommended stories to one another, but everyone had to write a short comment after finishing a book. At the end of the month, the class with the most steady reading would receive a new set of novels."

Which detail best shows that pupils had to think about what they read?`,
    options: [
      "They had to write a short comment after finishing a book.",
      "The announcement was made at Monday devotion.",
      "The prize was a new set of novels.",
      "Each pupil chose a book at school.",
    ],
    correctAnswer: 0,
    explanation: `Writing a short comment after finishing a book shows that pupils had to think about their reading.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

What is the main idea of the passage?`,
    options: [
      "A book donation drive helped younger students enjoy reading.",
      "The student council planned a race for the infant department.",
      "Grade 5 pupils threw away all used picture books.",
      "Younger children chose books to sell at a market.",
    ],
    correctAnswer: 0,
    explanation: `The passage is mainly about donating and sharing books so younger students can enjoy reading.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

What did pupils do before sorting the donated books?`,
    options: [
      "They wiped the covers.",
      "They painted the classroom corner.",
      "They counted money from ticket sales.",
      "They wrote novels for Grade 5.",
    ],
    correctAnswer: 0,
    explanation: `The passage says pupils wiped the covers before sorting the books by topic.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

What can the reader infer about the Grade 5 volunteers?`,
    options: [
      "They cared about helping younger children read.",
      "They wanted to keep every book for themselves.",
      "They did not understand why books matter.",
      "They planned to close the classroom corner.",
    ],
    correctAnswer: 0,
    explanation: `The volunteers read aloud and helped younger children choose books, which shows they cared about helping them read.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

In the passage, what does “gently used” mean?`,
    options: [
      "Used before but still in good condition",
      "So old that no one can read it",
      "Brand new and wrapped in plastic",
      "Too dirty to place on a shelf",
    ],
    correctAnswer: 0,
    explanation: `Gently used books have been used before but are still suitable to share.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

Why did the author most likely include the last sentence?`,
    options: [
      "To show the positive lesson learned from the drive",
      "To explain why picture books should be hidden",
      "To prove that only older pupils like reading",
      "To list every book donated by the student council",
    ],
    correctAnswer: 0,
    explanation: `The last sentence explains that sharing books can make reading enjoyable for everyone, which is the positive lesson of the drive.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Compare Ideas",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

How were donating books and reading aloud similar in the passage?`,
    options: [
      "Both actions helped younger students enjoy books.",
      "Both actions were done only by the librarian.",
      "Both actions happened after the classroom corner closed.",
      "Both actions stopped pupils from sharing.",
    ],
    correctAnswer: 0,
    explanation: `Donating books and reading aloud both supported younger students and helped them enjoy reading.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Problem and Solution",
    question: `Read the passage then answer the question.

"The student council organized a Book Donation Drive for the infant department. Pupils brought gently used picture books and wiped the covers before sorting them by topic. On Friday, Grade 5 volunteers read aloud to younger children and helped them choose books to keep in their classroom corner. The drive showed that sharing books can make reading enjoyable for everyone."

Which problem and solution are shown in the passage?`,
    options: [
      "Younger students needed books, so pupils donated and shared picture books.",
      "The library had too many chairs, so pupils planted flowers.",
      "The Grade 5 pupils lost a chart, so they cancelled reading.",
      "The infant department wanted uniforms, so pupils sorted shoes.",
    ],
    correctAnswer: 0,
    explanation: `The passage shows pupils solving a need for books by donating, sorting, and sharing picture books.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “steady” as it is used in the Easy 7 reading passages.`,
    options: [
      "continuing regularly",
      "changing often",
      "stopping frequently",
      "happening only once",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “steady” means continuing regularly.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “recommended” as it is used in the Easy 7 reading passages.`,
    options: [
      "suggested as a good choice",
      "required by a rule",
      "borrowed temporarily",
      "recorded in writing",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “recommended” means suggested as a good choice.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “novels” as it is used in the Easy 7 reading passages.`,
    options: [
      "long fictional stories",
      "collections of poems",
      "short factual notices",
      "picture labels",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “novels” means long fictional stories.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “organized” as it is used in the Easy 7 reading passages.`,
    options: [
      "planned and arranged",
      "delayed",
      "copied",
      "cancelled",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “organized” means planned and arranged.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “infant department” as it is used in the Easy 7 reading passages.`,
    options: [
      "section for younger children",
      "staff office",
      "upper-grade block",
      "sports area",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “infant department” means section for younger children.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “topic” as it is used in the Easy 7 reading passages.`,
    options: [
      "subject or main idea",
      "author's name",
      "page number",
      "illustration",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “topic” means subject or main idea.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “volunteers” as it is used in the Easy 7 reading passages.`,
    options: [
      "people who choose to help",
      "paid employees",
      "spectators",
      "people receiving assistance",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “volunteers” means people who choose to help.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “enjoyable” as it is used in the Easy 7 reading passages.`,
    options: [
      "pleasant or fun",
      "difficult to understand",
      "expensive",
      "unfinished",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “enjoyable” means pleasant or fun.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “challenge” as it is used in the Easy 7 reading passages.`,
    options: [
      "task requiring effort",
      "reward for winning",
      "timetable",
      "classroom rule",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “challenge” means task requiring effort.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Choose the best meaning of “donation” as it is used in the Easy 7 reading passages.`,
    options: [
      "something given to help",
      "something borrowed",
      "something sold for profit",
      "something returned to its owner",
    ],
    correctAnswer: 0,
    explanation: `In the reading context, “donation” means something given to help.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      "The librarian announces the challenge on Monday.",
      "The librarian announce the challenge on Monday.",
      "The librarians announces the challenge on Monday.",
      "The pupil read the books every day.",
    ],
    correctAnswer: 0,
    explanation: `“The librarian” is singular, so the verb “announces” agrees with it.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the correct verb to complete the sentence: Yesterday, Grade 5 pupils ___ the donated books.`,
    options: [
      "sorted",
      "sort",
      "sorting",
      "sorts",
    ],
    correctAnswer: 0,
    explanation: `“Yesterday” shows past time, so “sorted” is the correct past-tense verb.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `Choose the best pronoun: Maya chose a book because ___ wanted to join the challenge.`,
    options: [
      "she",
      "they",
      "it",
      "we",
    ],
    correctAnswer: 0,
    explanation: `“Maya” names one girl, so the pronoun “she” is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "“Please return the book,” said Miss Lee.",
      "“Please return the book” said Miss Lee.",
      "Please return the book,” said Miss Lee.",
      "“Please return the book, said Miss Lee.”",
    ],
    correctAnswer: 0,
    explanation: `The correct sentence uses quotation marks and a comma before the speech tag.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Adjective Use",
    question: `Choose the sentence with the best describing word.`,
    options: [
      "The colourful poster invited pupils to donate books.",
      "The poster colourful invited pupils to donate books.",
      "Colourful invited the poster pupils donate books.",
      "The poster invited colourful pupils to donate books.",
    ],
    correctAnswer: 0,
    explanation: `“Colourful” correctly describes the noun “poster” before the noun.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best word to complete the sentence: We brought extra books ___ the younger students needed more choices.`,
    options: [
      "because",
      "but",
      "or",
      "although",
    ],
    correctAnswer: 0,
    explanation: `“Because” correctly shows the reason pupils brought extra books.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Complete Sentence",
    question: `Which option is a complete sentence?`,
    options: [
      "The volunteers read aloud to the younger children.",
      "After the reading challenge in the library.",
      "Because the books on the table.",
      "The colourful chart near the door.",
    ],
    correctAnswer: 0,
    explanation: `The correct option has a subject and predicate and expresses a complete thought.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Comma in a Series",
    question: `Which sentence uses commas correctly in a series?`,
    options: [
      "We sorted stories, poems, picture books, and magazines.",
      "We sorted stories poems, picture books and magazines.",
      "We sorted, stories poems picture books, and magazines.",
      "We sorted stories, poems picture books and, magazines.",
    ],
    correctAnswer: 0,
    explanation: `Commas correctly separate the items in the series: stories, poems, picture books, and magazines.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Possessive Noun",
    question: `Choose the correct possessive form.`,
    options: [
      "The class’s reading chart was full.",
      "The classes reading chart was full.",
      "The class reading chart’s was full.",
      "The classs reading chart was full.",
    ],
    correctAnswer: 0,
    explanation: `“Class’s” correctly shows that the reading chart belongs to the class.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which sentence best combines the ideas: The pupils collected books. They shared them with younger students.`,
    options: [
      "The pupils collected books and shared them with younger students.",
      "The pupils collected books, younger students.",
      "Shared them with younger students the pupils collected books.",
      "The pupils collected and younger students books shared.",
    ],
    correctAnswer: 0,
    explanation: `The correct option joins the two ideas clearly with “and.”`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a notice about the School Library Reading Challenge. What should you include?`,
    options: [
      "A clear heading, the dates, what pupils must do, and polite language",
      "A heading and picture about reading, but no dates",
      "The dates and a slogan, but no instructions for pupils",
      "A description of the activity, but no sign-up information",
    ],
    correctAnswer: 0,
    explanation: `A notice should give clear details such as the heading, dates, actions, and polite language for readers.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Organization",
    question: `Which opening sentence best begins a paragraph about the Book Donation Drive?`,
    options: [
      "Our school’s Book Donation Drive helped younger students enjoy reading.",
      "Donated books were placed on tables in the hall.",
      "Volunteers counted the books after lunch.",
      "Younger pupils selected books to take to class.",
    ],
    correctAnswer: 0,
    explanation: `The correct opening sentence clearly introduces the topic of the paragraph.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports a report about sharing books with younger students?`,
    options: [
      "Grade 5 volunteers read aloud and helped children choose books.",
      "Volunteers sorted donated books into boxes.",
      "The donation poster was displayed near the library.",
      "Many donated books had colourful covers.",
    ],
    correctAnswer: 0,
    explanation: `The detail about volunteers reading aloud directly supports the report about sharing books.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Revision",
    question: `Which sentence is the best revision of “The drive was good”?`,
    options: [
      "The book drive was successful because many pupils donated clean picture books.",
      "The drive was good because many books were there.",
      "The book drive was successful, and it was a good drive.",
      "Many pupils donated books, and the drive went well.",
    ],
    correctAnswer: 0,
    explanation: `The revised sentence is clearer and gives a specific reason the drive was successful.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Conclusion",
    question: `Which sentence would make the best conclusion for a paragraph about Easy 7’s book themes?`,
    options: [
      "Reading and sharing books can help the whole school community learn together.",
      "Posters about the drive were displayed near the library.",
      "Volunteers sorted the donated books into groups.",
      "The school plans another reading activity next term.",
    ],
    correctAnswer: 0,
    explanation: `The correct conclusion sums up the idea that reading and sharing books help the school community.`
  },
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy7Questions : g5LaEasy7Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 7",
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
      ? prepareAssessment(g5LaEasy7Questions)
      : preparePreview(g5LaEasy7Questions, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 7</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 7</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 7</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
