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

const g5LaEasy10Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

What is the main idea of the passage?`,
    options: [
      "Grade 5 pupils used planned investigations to learn and share science ideas.",
      "The school cancelled the fair because no one finished a project.",
      "Visitors taught pupils how to play new games after lunch.",
      "The bean plants were the only project at the science fair.",
    ],
    correctAnswer: 0,
    explanation: `The passage is mainly about pupils planning investigations, recording results, and explaining science projects at the fair.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

Which project did one team complete?`,
    options: [
      "a model of the moon made from cheese",
      "a simple water filter",
      "a new set of football rules",
      "a recipe book for the canteen",
    ],
    correctAnswer: 1,
    explanation: `The passage states that one team built a simple water filter.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

What did each group record results in?`,
    options: [
      "a notebook",
      "a lunch box",
      "a library card",
      "a sports timetable",
    ],
    correctAnswer: 0,
    explanation: `The passage says each group recorded results in a notebook.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

What can the reader infer about the pupils?`,
    options: [
      "They guessed answers without testing anything.",
      "They worked carefully and could explain what they learned.",
      "They wanted visitors to ignore their display boards.",
      "They copied projects without understanding them.",
    ],
    correctAnswer: 1,
    explanation: `Because the pupils followed steps, recorded results, and explained evidence, they worked carefully and understood their projects.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

What does evidence mean in the passage?`,
    options: [
      "proof or information that supports an idea",
      "a loud noise made during assembly",
      "a prize given for neat handwriting",
      "a place where pupils store lunch kits",
    ],
    correctAnswer: 0,
    explanation: `Visitors asked pupils to explain their evidence, so evidence means proof or information from their tests that supports their ideas.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

Why did the author most likely write this passage?`,
    options: [
      "to inform readers about how pupils prepared and presented science projects",
      "to persuade readers to stop asking questions",
      "to describe a holiday trip to the beach",
      "to explain how to win a football match",
    ],
    correctAnswer: 0,
    explanation: `The author gives information about the science fair and how pupils prepared and presented their work.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

Which event happened before visitors asked questions?`,
    options: [
      "Pupils made display boards and recorded their results.",
      "The canteen labelled balanced lunches.",
      "Pupils promised to exercise every week.",
      "The guidance counsellor spoke about sleep.",
    ],
    correctAnswer: 0,
    explanation: `The groups prepared their boards and results before fair day, when visitors asked questions.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the School Science Fair by working in small teams. One team tested which soil helped bean plants grow tallest, another built a simple water filter, and a third measured how shadows changed during the day. Each group wrote a question, listed materials, followed steps, and recorded results in a notebook. On fair day, visitors studied the display boards and asked pupils to explain their evidence. The fair showed that careful observation and honest reporting help scientists learn."

Why could pupils explain their projects clearly to visitors?`,
    options: [
      "They had followed steps and recorded evidence from their tests.",
      "They had hidden their notebooks under the tables.",
      "They had refused to list their materials.",
      "They had left their projects at home.",
    ],
    correctAnswer: 0,
    explanation: `Following steps and recording evidence gave pupils information to use when explaining their projects.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

What is the main idea of the passage?`,
    options: [
      "A school campaign encouraged pupils to build healthy daily habits.",
      "The student council planned a concert for Monday morning.",
      "The canteen removed every lunch choice from the school.",
      "Pupils learned only about painting posters.",
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on a campaign that encouraged healthy habits such as water, food choices, rest, hygiene, and exercise.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

Which habit was shown on the posters?`,
    options: [
      "drink water",
      "skip sleep",
      "avoid handwashing",
      "sit still all day",
    ],
    correctAnswer: 0,
    explanation: `The posters reminded pupils to drink water, along with other healthy habits.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

Who led the five-minute stretch at break time?`,
    options: [
      "prefects",
      "bus drivers",
      "visiting farmers",
      "the football team from another school",
    ],
    correctAnswer: 0,
    explanation: `The passage says prefects led a five-minute stretch at break time.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

What can the reader infer about the campaign?`,
    options: [
      "It gave pupils practical actions they could try at school and at home.",
      "It was designed to make pupils less focused in class.",
      "It told pupils that exercise and rest were unimportant.",
      "It lasted only because no one understood the posters.",
    ],
    correctAnswer: 0,
    explanation: `The campaign gave simple actions, and pupils promised to try healthier habits each week, so it was practical.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

What does balanced mean in the passage?`,
    options: [
      "having a healthy mix of different foods",
      "falling off a chair during lunch",
      "written in very tiny letters",
      "made only from sweets and soda",
    ],
    correctAnswer: 0,
    explanation: `Balanced lunch choices are presented as healthy, so balanced means having a healthy mix of foods.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

According to the passage, what can small daily habits improve?`,
    options: [
      "focus in class",
      "the colour of the school gate",
      "the number of desks in the room",
      "the length of the lunch bell",
    ],
    correctAnswer: 0,
    explanation: `The guidance counsellor explained that small daily habits can protect the body and improve focus in class.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"The student council launched a Healthy Living and Wellness Campaign on Monday morning. Posters reminded pupils to drink water, eat fruits and vegetables, sleep well, wash their hands, and exercise safely. At break time, prefects led a five-minute stretch, and the canteen placed colourful labels beside balanced lunch choices. The guidance counsellor explained that small daily habits can protect the body and improve focus in class. Many pupils promised to try one healthier habit each week."

Which detail best shows pupils planned to continue the healthy habits?`,
    options: [
      "Many pupils promised to try one healthier habit each week.",
      "Posters were placed around the school.",
      "The campaign began on Monday morning.",
      "The canteen used colourful labels.",
    ],
    correctAnswer: 0,
    explanation: `Promising to try one healthier habit each week shows that pupils planned to continue practising healthy choices.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Choose the word that means nearly the same as observe.

The pupils observe the bean plants each morning.`,
    options: [
      "watch carefully",
      "hide quickly",
      "paint brightly",
      "forget completely",
    ],
    correctAnswer: 0,
    explanation: `Observe means to watch carefully, especially to learn information.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Choose the word that means the opposite of honest.

Scientists should give honest results.`,
    options: [
      "truthful",
      "careful",
      "dishonest",
      "helpful",
    ],
    correctAnswer: 2,
    explanation: `Honest means truthful; dishonest is the opposite.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `What does filter mean in the sentence?

The team used clean sand and cloth to filter muddy water.`,
    options: [
      "to clean by passing through material",
      "to make a poster larger",
      "to count money after a sale",
      "to run quickly across a field",
    ],
    correctAnswer: 0,
    explanation: `The sand and cloth were used to clean muddy water, so filter means to clean by passing through material.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `Which meaning of fair is used in the sentence?

Each group decided on a fair way to share the table space.`,
    options: [
      "just and equal",
      "an event with displays",
      "light in colour",
      "a type of weather",
    ],
    correctAnswer: 0,
    explanation: `Here fair describes a just and equal way to share space, not the event itself.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Prefixes",
    question: `What does unsafe mean?`,
    options: [
      "not safe",
      "safe again",
      "full of safety",
      "one who keeps safe",
    ],
    correctAnswer: 0,
    explanation: `The prefix un- means not, so unsafe means not safe.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Suffixes",
    question: `What does the suffix -less mean in careless?`,
    options: [
      "without",
      "full of",
      "before",
      "able to",
    ],
    correctAnswer: 0,
    explanation: `The suffix -less means without, so careless means without care.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Compound Words",
    question: `Which word is a compound word?`,
    options: [
      "notebook",
      "healthy",
      "stretch",
      "visitor",
    ],
    correctAnswer: 0,
    explanation: `Notebook is a compound word made from note and book.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `What does wellness mean?`,
    options: [
      "the state of being healthy in body and mind",
      "a machine used to measure shadows",
      "a mistake in a science notebook",
      "a prize for the loudest speaker",
    ],
    correctAnswer: 0,
    explanation: `Wellness means being healthy in body and mind.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `What does launched mean in the sentence?

The student council launched the campaign on Monday morning.`,
    options: [
      "started",
      "washed",
      "dropped",
      "forgot",
    ],
    correctAnswer: 0,
    explanation: `Launched means started in this sentence because the campaign began on Monday morning.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is the opposite of improve?`,
    options: [
      "better",
      "weaken",
      "help",
      "polish",
    ],
    correctAnswer: 1,
    explanation: `Improve means to make better; weaken means to make worse or less strong.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      "The teams records their results daily.",
      "The team record their results daily.",
      "The teams record their results daily.",
      "The teams recording their results daily.",
    ],
    correctAnswer: 2,
    explanation: `The plural subject teams agrees with the plural verb record.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the sentence written in the future tense.`,
    options: [
      "The pupils tested the water filter.",
      "The pupils test the water filter.",
      "The pupils will test the water filter.",
      "The pupils are testing the water filter.",
    ],
    correctAnswer: 2,
    explanation: `Will test shows that the action will happen in the future.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Choose the sentence with correct punctuation.`,
    options: [
      "Did you record the results?",
      "Did you record the results.",
      "Did you record the results!",
      "Did you record the results,",
    ],
    correctAnswer: 0,
    explanation: `A direct question should end with a question mark.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Capitalization",
    question: `Choose the sentence with correct capitalization.`,
    options: [
      "on monday, the wellness campaign began.",
      "On monday, the wellness campaign began.",
      "On Monday, the wellness campaign began.",
      "on Monday, the Wellness campaign began.",
    ],
    correctAnswer: 2,
    explanation: `The first word of the sentence and the day Monday should begin with capital letters.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the pronoun that best completes the sentence.

Jada brought a water bottle because _____ wanted to stay hydrated.`,
    options: [
      "she",
      "him",
      "they",
      "us",
    ],
    correctAnswer: 0,
    explanation: `She is the correct subject pronoun to refer to Jada.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Adjectives",
    question: `Which word is an adjective in the sentence?

The careful pupils labelled each display board.`,
    options: [
      "careful",
      "labelled",
      "display",
      "each",
    ],
    correctAnswer: 0,
    explanation: `Careful describes the noun pupils, so it is an adjective.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Adverbs",
    question: `Which word is an adverb in the sentence?

The presenter spoke clearly to the visitors.`,
    options: [
      "presenter",
      "spoke",
      "clearly",
      "visitors",
    ],
    correctAnswer: 2,
    explanation: `Clearly tells how the presenter spoke, so it is an adverb.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the conjunction that best completes the sentence.

The poster was colourful, _____ the message was easy to read.`,
    options: [
      "and",
      "under",
      "quickly",
      "beside",
    ],
    correctAnswer: 0,
    explanation: `And correctly joins two related ideas that both describe the poster.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Commas",
    question: `Choose the sentence that uses commas correctly in a list.`,
    options: [
      "We need water fruits vegetables and rest.",
      "We need water, fruits, vegetables, and rest.",
      "We need, water fruits, vegetables and rest.",
      "We need water fruits, vegetables, and, rest.",
    ],
    correctAnswer: 1,
    explanation: `Commas separate the items in the list: water, fruits, vegetables, and rest.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: [
      "After the science fair.",
      "Because the display board.",
      "The pupils explained their evidence.",
      "Recording results carefully.",
    ],
    correctAnswer: 2,
    explanation: `The pupils explained their evidence has a subject and predicate and expresses a complete thought.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which sentence would be the best topic sentence for a paragraph about the School Science Fair?`,
    options: [
      "The School Science Fair helped pupils practise asking questions and using evidence.",
      "My shoes were beside the classroom door.",
      "The mango tree dropped leaves near the gate.",
      "A puppy slept under the library steps.",
    ],
    correctAnswer: 0,
    explanation: `A topic sentence should introduce the main idea, which is pupils learning science skills through the fair.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports this topic sentence?

The wellness campaign taught pupils simple healthy habits.`,
    options: [
      "Posters reminded pupils to drink water, eat fruits and vegetables, rest, and exercise.",
      "The library shelf has many storybooks.",
      "A bird flew over the playground fence.",
      "The school bell rang loudly at noon.",
    ],
    correctAnswer: 0,
    explanation: `The poster details directly support the idea that pupils learned simple healthy habits.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Sentence Order",
    question: `Choose the best order for these sentences.

1. Finally, they explained their results to visitors.
2. First, the group wrote a science question.
3. Next, they tested their idea and recorded observations.`,
    options: [
      "2, 3, 1",
      "1, 2, 3",
      "3, 1, 2",
      "2, 1, 3",
    ],
    correctAnswer: 0,
    explanation: `The logical order is to write a question first, test and record next, and explain results finally.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Concluding Sentence",
    question: `Which sentence is the best conclusion for a paragraph about the wellness campaign?`,
    options: [
      "Small healthy choices each day can help pupils feel ready to learn.",
      "The blue pencil rolled across the desk.",
      "My cousin likes cartoons on Saturdays.",
      "The classroom window was open during rain.",
    ],
    correctAnswer: 0,
    explanation: `This sentence wraps up the paragraph by restating the importance of daily healthy choices.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Revise for Clarity",
    question: `Choose the clearest sentence.`,
    options: [
      "We labelled the lunch choices so pupils could identify balanced meals.",
      "Lunch choices pupils identify labelled balanced so meals.",
      "Balanced so choices the pupils lunch labelled identify.",
      "We meals choices because balanced labelled pupils.",
    ],
    correctAnswer: 0,
    explanation: `The correct sentence clearly explains what was labelled and why.`
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

export default function G5LaEasy10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy10Questions : g5LaEasy10Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 10",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 10</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 10</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 10</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
