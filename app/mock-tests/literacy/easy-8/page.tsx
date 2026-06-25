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

const g5LaEasy8Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

What is the main idea of the passage?`,
    options: [
      "Grade 5 celebrated Jamaica Heritage Day by learning and sharing parts of Jamaican culture.",
      "The pupils spent the morning practising for a football competition.",
      "The school hall was closed because the tables were missing.",
      "Jamaica Heritage Day was mainly about choosing the fastest drummer.",
    ],
    correctAnswer: 0,
    explanation: `The whole passage focuses on pupils sharing music, food, heroes, customs, and respect during Jamaica Heritage Day.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

Which traditional food was named in the passage?`,
    options: [
      "pizza",
      "bammy",
      "ice cream",
      "hamburger",
    ],
    correctAnswer: 1,
    explanation: `The passage lists ackee, bammy, and sweet potato pudding as traditional foods on the labelled tables.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

What can the reader infer about the pupils?`,
    options: [
      "They were not allowed to speak during the programme.",
      "They knew nothing about Jamaica before the day started.",
      "They took an active part in teaching others about culture.",
      "They wanted the celebration to end before it began.",
    ],
    correctAnswer: 2,
    explanation: `The pupils displayed work and explained customs, so they were actively helping others learn about Jamaican culture.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

What does displayed mean in the passage?`,
    options: [
      "hid from everyone",
      "threw away quickly",
      "copied without reading",
      "showed for people to see",
    ],
    correctAnswer: 3,
    explanation: `The pupils put their drawings where others could see them, so displayed means showed for people to see.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

Why did the author most likely write this passage?`,
    options: [
      "to inform readers about a school celebration of Jamaican heritage",
      "to persuade readers to stop learning about the past",
      "to explain how to cook every Jamaican dish",
      "to describe a problem with a broken drum",
    ],
    correctAnswer: 0,
    explanation: `The passage gives information about what happened at the celebration and what pupils learned from it.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

What happened after the pupils displayed drawings and labelled tables?`,
    options: [
      "The drums began echoing across the hall.",
      "Each group explained a custom from a different parish.",
      "The pupils forgot why they came to the hall.",
      "The school cancelled Jamaica Heritage Day.",
    ],
    correctAnswer: 1,
    explanation: `The passage says that during the celebration, after the displays were prepared, each group explained a parish custom.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

What was one effect of the Heritage Day activities?`,
    options: [
      "The pupils understood that heritage is still shared today.",
      "The pupils decided that customs were unimportant.",
      "The tables were removed before anyone saw them.",
      "The national heroes were replaced with cartoons.",
    ],
    correctAnswer: 0,
    explanation: `Because pupils took part in the activities, they learned that heritage includes things people continue to share.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Jamaica Heritage Day began with drums echoing across the school hall. Grade 5 pupils wore bandana colours, displayed drawings of national heroes, and labelled tables with traditional foods such as ackee, bammy, and sweet potato pudding. During the celebration, each group explained a custom from a different parish. By the end of the morning, the pupils understood that heritage is more than old stories; it is the music, food, language, and respect people continue to share."

Which detail best supports the idea that the pupils shared Jamaican culture?`,
    options: [
      "The hall was part of the school building.",
      "The morning eventually came to an end.",
      "Each group explained a custom from a different parish.",
      "Some words in the passage are longer than others.",
    ],
    correctAnswer: 2,
    explanation: `Explaining customs from different parishes is direct evidence that pupils shared Jamaican culture.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

What is the main idea of this passage?`,
    options: [
      "A class visit to a historical site helped pupils learn about people and objects from the past.",
      "Mr. Henry took the pupils to buy new clay pots for the classroom.",
      "The bus ride was longer and more important than the site visit.",
      "The pupils went to a park only to play games outdoors.",
    ],
    correctAnswer: 0,
    explanation: `Most details describe the visit, the historical objects, and what the pupils learned about the past.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

Who led the class around the historical site?`,
    options: [
      "a market vendor",
      "Daniel",
      "a guide",
      "Amara",
    ],
    correctAnswer: 2,
    explanation: `The passage says a guide led the pupils past stone ruins, old maps, and other objects.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

Why did the pupils move quietly?`,
    options: [
      "They were bored and wanted to sleep.",
      "They were showing care around breakable historical objects.",
      "They were trying to hide from Mr. Henry.",
      "They had been told not to learn anything.",
    ],
    correctAnswer: 1,
    explanation: `The objects were fragile, so moving quietly suggests the pupils were being careful and respectful.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Character Response",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

What does fragile mean in the passage?`,
    options: [
      "easy to break",
      "newly painted",
      "very noisy",
      "too heavy to see",
    ],
    correctAnswer: 0,
    explanation: `The pupils moved quietly around the objects because fragile means easy to break or damage.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

Why did the author most likely include Amara and Daniel in the passage?`,
    options: [
      "to show examples of how pupils recorded what they learned",
      "to prove that only two pupils went on the trip",
      "to explain why the guide left the park early",
      "to make the historical objects seem unimportant",
    ],
    correctAnswer: 0,
    explanation: `Amara sketched and Daniel wrote notes, which are examples of pupils recording information during the visit.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Compare Ideas",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

How were Amara and Daniel alike during the visit?`,
    options: [
      "Both ignored the guide's directions.",
      "Both used a way to record information about the visit.",
      "Both repaired the stone ruins.",
      "Both traded goods with people from long ago.",
    ],
    correctAnswer: 1,
    explanation: `Amara sketched an object and Daniel wrote notes, so both recorded information in different ways.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"On Friday, Mr. Henry took the class to the Seville Heritage Park. A guide led them past stone ruins, old maps, and a small room filled with clay pots and tools. The pupils moved quietly because the objects were fragile. Amara sketched a tiny pot while Daniel wrote notes about how people traded goods long ago. On the ride back to school, the class agreed that visiting a historical site helped them imagine real people from the past."

Which sentence best states a problem and solution from the passage?`,
    options: [
      "The pupils were hungry, so they bought lunch at the park.",
      "The maps were lost, so Daniel drew new ones.",
      "The objects were fragile, so the pupils moved quietly around them.",
      "The bus was late, so the guide cancelled the visit.",
    ],
    correctAnswer: 2,
    explanation: `Fragile objects could be damaged, and the pupils helped solve that problem by moving quietly and carefully.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `During Heritage Day, the choir sang a lively folk song that made the audience clap along. What does lively mean?`,
    options: [
      "full of energy",
      "almost silent",
      "made of stone",
      "difficult to spell",
    ],
    correctAnswer: 0,
    explanation: `The audience clapped along, so lively means full of energy in this sentence.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonym",
    question: `Choose the word that means nearly the same as celebrate in this sentence: We celebrate Jamaica's heritage with songs and stories.`,
    options: [
      "hide",
      "honour",
      "forget",
      "measure",
    ],
    correctAnswer: 1,
    explanation: `To celebrate heritage is to honour or show respect for it.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word is the opposite of ancient in the phrase ancient stone ruins?`,
    options: [
      "old",
      "broken",
      "modern",
      "rough",
    ],
    correctAnswer: 2,
    explanation: `Ancient means very old, so modern is the opposite.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The guide asked the class to observe the carvings closely before writing notes. What does observe mean?`,
    options: [
      "look at carefully",
      "paint over quickly",
      "carry away",
      "laugh loudly",
    ],
    correctAnswer: 0,
    explanation: `Writing notes after looking closely shows that observe means look at carefully.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `In the sentence, The guide pointed to the model of an old market, what does model mean?`,
    options: [
      "a person showing clothing",
      "a small copy of something",
      "a rule for behaviour",
      "a type of notebook",
    ],
    correctAnswer: 1,
    explanation: `At a museum or historical site, a model of a market is a small copy that shows what the market looked like.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The labels gave brief facts about each national hero, so visitors could read them quickly. What does brief mean?`,
    options: [
      "wet",
      "short",
      "angry",
      "hidden",
    ],
    correctAnswer: 1,
    explanation: `Visitors could read the facts quickly because brief means short.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `Which meaning best fits the word preserve in this sentence: Museums preserve objects from the past?`,
    options: [
      "protect and keep safe",
      "mix with sugar",
      "throw into a bin",
      "guess without looking",
    ],
    correctAnswer: 0,
    explanation: `Museums preserve objects by protecting them and keeping them safe for people to study.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The class admired the intricate pattern on the clay pot because it had many tiny shapes and lines. What does intricate mean?`,
    options: [
      "plain and empty",
      "carelessly broken",
      "detailed and complex",
      "too bright to see",
    ],
    correctAnswer: 2,
    explanation: `Many tiny shapes and lines are clues that intricate means detailed and complex.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word means nearly the same as custom in the sentence, Each parish shared a special custom?`,
    options: [
      "mistake",
      "tradition",
      "machine",
      "weather",
    ],
    correctAnswer: 1,
    explanation: `A custom is a tradition or usual way of doing something in a group or place.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word is the opposite of respect in the sentence, The pupils showed respect for the old objects?`,
    options: [
      "care",
      "interest",
      "disrespect",
      "attention",
    ],
    correctAnswer: 2,
    explanation: `Disrespect is the opposite of respect.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: The class ___ the museum every year.`,
    options: [
      "visit",
      "visits",
      "visiting",
      "were visit",
    ],
    correctAnswer: 1,
    explanation: `The singular subject The class takes the verb visits.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the correct verb: Yesterday, the pupils ___ their Heritage Day poems.`,
    options: [
      "performed",
      "perform",
      "performs",
      "performing",
    ],
    correctAnswer: 0,
    explanation: `Yesterday signals past tense, so performed is correct.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `Choose the pronoun that best completes the sentence: Amara brought her notebook because ___ wanted to sketch the pot.`,
    options: [
      "he",
      "it",
      "she",
      "they",
    ],
    correctAnswer: 2,
    explanation: `Amara is one girl, so she is the correct pronoun.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Capitalization",
    question: `Which sentence uses capital letters correctly?`,
    options: [
      `"Please walk carefully," said the guide.`,
      `"Please walk carefully" said the guide.`,
      `Please walk carefully," said the guide.`,
      `"Please walk carefully, said the guide."`,
    ],
    correctAnswer: 0,
    explanation: `The correct sentence uses quotation marks and a comma before said the guide.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Adjective Use",
    question: `Choose the sentence with the best adjective placement.`,
    options: [
      "The fragile pot was kept behind glass.",
      "The pot fragile was kept behind glass.",
      "Fragile was kept the pot behind glass.",
      "The pot was behind fragile glass kept.",
    ],
    correctAnswer: 0,
    explanation: `Fragile correctly describes pot when it is placed before the noun.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best word: The pupils took notes ___ they wanted to remember the guide's facts.`,
    options: [
      "but",
      "because",
      "or",
      "although",
    ],
    correctAnswer: 1,
    explanation: `Because gives the reason the pupils took notes.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best word: The pupils observed the pottery, ___ they wrote notes.`,
    options: [
      "because",
      "but",
      "or",
      "although",
    ],
    correctAnswer: 0,
    explanation: `Because correctly explains why the pupils wrote notes after observing the pottery.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Comma Use",
    question: `Which sentence uses a comma correctly in a list?`,
    options: [
      "We saw drums, maps, pots, and tools.",
      "We saw drums maps, pots and tools.",
      "We saw, drums maps pots, and tools.",
      "We saw drums, maps pots and, tools.",
    ],
    correctAnswer: 0,
    explanation: `Commas correctly separate the items drums, maps, pots, and tools in a series.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Possessive Apostrophes",
    question: `Which option is a complete sentence?`,
    options: [
      "The guides badge was blue.",
      "The guide's badge was blue.",
      "The guides' badge's was blue.",
      "The guide badge's was blue.",
    ],
    correctAnswer: 1,
    explanation: `The badge belongs to one guide, so guide's is the correct possessive form.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which sentence best combines these ideas? The class visited the site. The class learned about history.`,
    options: [
      "The class visited the site and learned about history.",
      "Visited the class site history learned.",
      "The class learned because visited and history.",
      "The site history the class and learned visited.",
    ],
    correctAnswer: 0,
    explanation: `The first option combines both ideas clearly with and.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose and Audience",
    question: `You are writing a notice inviting Grade 5 pupils to a Jamaica Heritage Day celebration. What should you include?`,
    options: [
      "the date, time, place, activities, and polite instructions",
      "only a joke about the drums",
      "a secret message with no location",
      "a list of unrelated football scores",
    ],
    correctAnswer: 0,
    explanation: `A notice should clearly give important details such as date, time, place, activities, and instructions for its audience.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which is the best topic sentence for a paragraph about a museum visit?`,
    options: [
      "The bus had windows and seats.",
      "Our visit to the museum taught us many facts about Jamaica's past.",
      "I sharpened my pencil before lunch.",
      "The sky was blue on Tuesday.",
    ],
    correctAnswer: 1,
    explanation: `The best topic sentence clearly introduces the main idea of learning about Jamaica's past at the museum.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports this sentence? Heritage Day helped our class appreciate Jamaican culture.`,
    options: [
      "We learned folk songs and explained customs from several parishes.",
      "The classroom door was painted brown.",
      "My pencil case has three zippers.",
      "The rain stopped before bedtime.",
    ],
    correctAnswer: 0,
    explanation: `Learning folk songs and explaining customs directly supports the idea of appreciating Jamaican culture.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Revision",
    question: `Which revision makes this sentence clearer? We went there and saw things.`,
    options: [
      "We went and there saw and things.",
      "Things saw us when we went there.",
      "Our class visited Seville Heritage Park and saw clay pots, old maps, and stone ruins.",
      "We went there things saw.",
    ],
    correctAnswer: 2,
    explanation: `The correct revision adds specific details that make the sentence clear and informative.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding Sentence",
    question: `Which sentence would best conclude a report about the historical site visit?`,
    options: [
      "In conclusion, the visit helped us understand and respect Jamaica's history.",
      "The bus tyres were round and black.",
      "My friend forgot a red pencil at home.",
      "Next week I might eat a sandwich.",
    ],
    correctAnswer: 0,
    explanation: `A concluding sentence should sum up the report's main idea, and this option restates what the class learned from the visit.`
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

export default function G5LaEasy8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy8Questions : g5LaEasy8Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 8",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 8</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 8</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 8</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
