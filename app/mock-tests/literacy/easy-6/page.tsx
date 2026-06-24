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

const g5LaEasy6Questions: Question[] = [
  {
    id: 1,
    type: `reading`,
    skill: `Main Idea`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

What is the passage mainly about?`,
    options: [
      `A teacher planning a sports match`,
      `Pupils working together to care for the school environment`,
      `A class learning how to paint a fence`,
      `Families cleaning a community centre`,
    ],
    correctAnswer: 1,
    explanation: `The whole passage focuses on the Environmental Club planting trees, making a care schedule, and picking up litter at school.`,
  },
  {
    id: 2,
    type: `reading`,
    skill: `Detail`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

Where did the School Environmental Club meet?`,
    options: [
      `Behind the Grade 5 block`,
      `At the community centre`,
      `Near the bus stop`,
      `Inside the library`,
    ],
    correctAnswer: 0,
    explanation: `The passage says the club met behind the Grade 5 block on Friday morning.`,
  },
  {
    id: 3,
    type: `reading`,
    skill: `Detail`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

What did Mrs. Reid show the pupils how to do before planting the trees?`,
    options: [
      `Tie ribbons to the fence`,
      `Loosen the soil`,
      `Sweep the sidewalks`,
      `Hand out gloves`,
    ],
    correctAnswer: 1,
    explanation: `Mrs. Reid showed the pupils how to loosen the soil before placing the young trees near the fence.`,
  },
  {
    id: 4,
    type: `reading`,
    skill: `Cause and Effect`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

Why did the pupils add dry leaves around each tree?`,
    options: [
      `To make the trees look taller`,
      `To keep the ground moist`,
      `To hide litter from visitors`,
      `To mark the end of the fence`,
    ],
    correctAnswer: 1,
    explanation: `The passage directly states that the pupils added dry leaves around each tree to keep the ground moist.`,
  },
  {
    id: 5,
    type: `reading`,
    skill: `Inference`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

What can you infer from the club making a schedule before leaving?`,
    options: [
      `They wanted the trees and grounds to be cared for regularly`,
      `They did not enjoy the activity`,
      `They planned to stop helping after Friday`,
      `They forgot where the trees were planted`,
    ],
    correctAnswer: 0,
    explanation: `A schedule for different classes to check trees and pick up litter shows that the club planned regular care.`,
  },
  {
    id: 6,
    type: `reading`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

In the passage, the word "moist" most nearly means:`,
    options: [
      `slightly wet`,
      `very noisy`,
      `full of stones`,
      `completely dry`,
    ],
    correctAnswer: 0,
    explanation: `The dry leaves helped keep water in the soil, so "moist" means slightly wet.`,
  },
  {
    id: 7,
    type: `reading`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

In the passage, the word "loosen" most nearly means:`,
    options: [
      `make less tight or packed`,
      `paint with bright colours`,
      `carry to another place`,
      `cover completely`,
    ],
    correctAnswer: 0,
    explanation: `The pupils loosened the soil before planting, which means they made the packed soil less tight.`,
  },
  {
    id: 8,
    type: `reading`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

In the passage, the word "schedule" means:`,
    options: [
      `a list showing when people should do tasks`,
      `a tool used to dig holes`,
      `a prize for the best class`,
      `a bag for collecting leaves`,
    ],
    correctAnswer: 0,
    explanation: `The schedule showed different classes when to check the trees and pick up litter.`,
  },
  {
    id: 9,
    type: `reading`,
    skill: `Sequence`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

Which event happened last in the passage?`,
    options: [
      `Mrs. Reid showed pupils how to loosen soil.`,
      `Each group watered one tree.`,
      `The club made a schedule for different classes.`,
      `The club met behind the Grade 5 block.`,
    ],
    correctAnswer: 2,
    explanation: `The final sentence says that before leaving, the club made a schedule for different classes.`,
  },
  {
    id: 10,
    type: `reading`,
    skill: `Author’s Purpose`,
    question: `Read the passage then answer the question.

"The School Environmental Club met behind the Grade 5 block on Friday morning. Mrs. Reid showed the pupils how to loosen the soil before placing young trees near the fence. Each group watered one tree and added dry leaves around it to keep the ground moist. Before leaving, the club made a schedule so that different classes would check the trees and pick up litter around the school grounds."

Why did the author most likely write this passage?`,
    options: [
      `To describe how pupils helped improve their school grounds`,
      `To persuade readers to buy young trees`,
      `To explain how to bake sweet potato pudding`,
      `To tell a funny story about a lost rake`,
    ],
    correctAnswer: 0,
    explanation: `The passage describes the club’s actions to plant trees, water them, and keep the grounds clean.`,
  },
  {
    id: 11,
    type: `reading`,
    skill: `Main Idea`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

What is the passage mainly about?`,
    options: [
      `Volunteers working together to clean and beautify a community area`,
      `A bus stop being moved to a new road`,
      `Mr. Brown teaching families to cook lunch`,
      `Children playing games at the community centre`,
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on families volunteering to clean sidewalks, clear a drain, plant flowers, and keep the community clean.`,
  },
  {
    id: 12,
    type: `reading`,
    skill: `Detail`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

What did Mr. Brown hand out?`,
    options: [
      `Paint, brushes, and ladders`,
      `Gloves, garbage bags, and rakes`,
      `Books, pencils, and rulers`,
      `Seeds, baskets, and tickets`,
    ],
    correctAnswer: 1,
    explanation: `The passage says Mr. Brown handed out gloves, garbage bags, and rakes.`,
  },
  {
    id: 13,
    type: `reading`,
    skill: `Detail`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

What did teams remove from the drain?`,
    options: [
      `Plastic bottles`,
      `Bright flowers`,
      `Young trees`,
      `Bus tickets`,
    ],
    correctAnswer: 0,
    explanation: `The passage states that teams removed plastic bottles from the drain.`,
  },
  {
    id: 14,
    type: `reading`,
    skill: `Sequence`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

When did the area look neat and welcoming?`,
    options: [
      `Before sunrise`,
      `By noon`,
      `Late at night`,
      `The next Friday morning`,
    ],
    correctAnswer: 1,
    explanation: `The passage says, "By noon, the area looked neat and welcoming."`,
  },
  {
    id: 15,
    type: `reading`,
    skill: `Inference`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

What can you infer about the volunteers?`,
    options: [
      `They cared about making their community cleaner`,
      `They wanted the community centre to close`,
      `They refused to work in teams`,
      `They only came to watch Mr. Brown`,
    ],
    correctAnswer: 0,
    explanation: `Their cleaning, planting, and promise to keep working together show that they cared about the community.`,
  },
  {
    id: 16,
    type: `vocabulary`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

In the passage, the word "volunteers" means people who:`,
    options: [
      `help willingly without being forced`,
      `sell tickets at a gate`,
      `drive buses every morning`,
      `write signs for homework`,
    ],
    correctAnswer: 0,
    explanation: `The families helped clean the area and promised to keep working together, so "volunteers" means people who help willingly.`,
  },
  {
    id: 17,
    type: `vocabulary`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

In the passage, "welcoming" most nearly means:`,
    options: [
      `friendly and pleasant to enter`,
      `locked and dangerous`,
      `dark and empty`,
      `noisy and confusing`,
    ],
    correctAnswer: 0,
    explanation: `After the clean-up, the area looked neat and welcoming, meaning it seemed friendly and pleasant.`,
  },
  {
    id: 18,
    type: `vocabulary`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

In the passage, "gathered" most nearly means:`,
    options: [
      `came together in one place`,
      `ran away quickly`,
      `argued loudly`,
      `fell asleep`,
    ],
    correctAnswer: 0,
    explanation: `Families gathered at the community centre, meaning they came together there for Clean-Up Day.`,
  },
  {
    id: 19,
    type: `vocabulary`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

What happened because the teams cleaned and planted flowers?`,
    options: [
      `The area looked neat and welcoming`,
      `The community centre disappeared`,
      `The bus stop was closed forever`,
      `Mr. Brown cancelled Clean-Up Day`,
    ],
    correctAnswer: 0,
    explanation: `The teams swept, removed bottles, and planted flowers; as a result, the area looked neat and welcoming by noon.`,
  },
  {
    id: 20,
    type: `vocabulary`,
    skill: `Vocabulary in Context`,
    question: `Read the passage then answer the question.

"On Saturday, families gathered at the community centre for Clean-Up Day. Mr. Brown handed out gloves, garbage bags, and rakes. Teams swept the sidewalks, removed plastic bottles from the drain, and planted bright flowers near the bus stop. By noon, the area looked neat and welcoming. The volunteers promised to keep working together so the community would stay clean."

Which lesson best fits the passage?`,
    options: [
      `Working together can improve a shared space`,
      `Only one person should do community work`,
      `Clean places do not need regular care`,
      `Flowers should never be planted near roads`,
    ],
    correctAnswer: 0,
    explanation: `The volunteers worked as teams and promised continued effort, showing that cooperation can improve a shared space.`,
  },
  {
    id: 21,
    type: `vocabulary`,
    skill: `Synonyms`,
    question: `Which word is closest in meaning to "protect" in this sentence? The club wanted to protect the young trees.`,
    options: [
      `Guard`,
      `Forget`,
      `Damage`,
      `Hide`,
    ],
    correctAnswer: 0,
    explanation: `To protect something means to guard it or keep it safe.`,
  },
  {
    id: 22,
    type: `vocabulary`,
    skill: `Antonyms`,
    question: `Which word is the opposite of "clean"?`,
    options: [
      `Neat`,
      `Dirty`,
      `Fresh`,
      `Tidy`,
    ],
    correctAnswer: 1,
    explanation: `Dirty is the opposite of clean.`,
  },
  {
    id: 23,
    type: `vocabulary`,
    skill: `Word Meaning`,
    question: `What does "recycle" mean?`,
    options: [
      `To throw useful materials into the sea`,
      `To use materials again in a new way`,
      `To leave litter on the ground`,
      `To cut down every tree`,
    ],
    correctAnswer: 1,
    explanation: `Recycle means to process or use materials again instead of wasting them.`,
  },
  {
    id: 24,
    type: `vocabulary`,
    skill: `Context Clues`,
    question: `Choose the best meaning of "supplies" in this sentence: Mr. Brown handed out supplies such as gloves and garbage bags.`,
    options: [
      `Things needed for a job`,
      `Songs for a programme`,
      `Places to visit`,
      `Rules for a race`,
    ],
    correctAnswer: 0,
    explanation: `Gloves and garbage bags are things the volunteers needed for the clean-up job.`,
  },
  {
    id: 25,
    type: `vocabulary`,
    skill: `Multiple Meaning Words`,
    question: `In the sentence "The class will check the trees each week," what does "check" mean?`,
    options: [
      `To examine or look at carefully`,
      `A mark on a paper`,
      `A bill at a restaurant`,
      `To stop playing`,
    ],
    correctAnswer: 0,
    explanation: `Here, check means to examine the trees to see how they are growing.`,
  },
  {
    id: 26,
    type: `grammar`,
    skill: `Complete Sentence`,
    question: `Which option is a complete sentence?`,
    options: [
      `After the clean-up day.`,
      `Because the pupils watered the trees.`,
      `The volunteers swept the sidewalks.`,
      `Near the fence behind the Grade 5 block.`,
    ],
    correctAnswer: 2,
    explanation: `"The volunteers swept the sidewalks" has a subject and a complete predicate.`,
  },
  {
    id: 27,
    type: `grammar`,
    skill: `Adjectives`,
    question: `Which word is an adjective in this sentence? The bright flowers grew near the bus stop.`,
    options: [
      `bright`,
      `grew`,
      `near`,
      `stop`,
    ],
    correctAnswer: 0,
    explanation: `"Bright" describes the noun "flowers," so it is an adjective.`,
  },
  {
    id: 28,
    type: `grammar`,
    skill: `Conjunctions`,
    question: `Choose the best word to join the ideas: The club planted trees, ___ the classes checked them later.`,
    options: [
      `or`,
      `but`,
      `and`,
      `because`,
    ],
    correctAnswer: 2,
    explanation: `"And" correctly joins two related actions that both happened.`,
  },
  {
    id: 29,
    type: `grammar`,
    skill: `Comparative Adjectives`,
    question: `Choose the sentence that uses a comparative adjective correctly.`,
    options: [
      `The school yard looked cleaner after the club worked.`,
      `The school yard looked cleanest than before.`,
      `The school yard looked more cleanest after work.`,
      `The school yard looked clean than before.`,
    ],
    correctAnswer: 0,
    explanation: `"Cleaner" correctly compares how the school yard looked after the work with how it looked before.`,
  },
  {
    id: 30,
    type: `grammar`,
    skill: `Apostrophes`,
    question: `Choose the sentence with the apostrophe used correctly.`,
    options: [
      `The clubs schedule was helpful.`,
      `The club’s schedule was helpful.`,
      `The clubs’ schedule were helpful.`,
      `The club schedule’s was helpful.`,
    ],
    correctAnswer: 1,
    explanation: `"Club’s" correctly shows that the schedule belonged to one club.`,
  },
  {
    id: 31,
    type: `grammar`,
    skill: `Subject-Verb Agreement`,
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      `The volunteers collects litter near the drain.`,
      `The volunteers collect litter near the drain.`,
      `The volunteers collecting litter near the drain.`,
      `The volunteers has collect litter near the drain.`,
    ],
    correctAnswer: 1,
    explanation: `The plural subject "volunteers" agrees with the verb "collect."`,
  },
  {
    id: 32,
    type: `grammar`,
    skill: `Verb Tense`,
    question: `Choose the sentence written in the future tense.`,
    options: [
      `The club watered the trees yesterday.`,
      `The club waters the trees every Friday.`,
      `The club will water the trees tomorrow.`,
      `The club is watering the trees now.`,
    ],
    correctAnswer: 2,
    explanation: `The words "will water" show an action that is going to happen in the future.`,
  },
  {
    id: 33,
    type: `grammar`,
    skill: `Pronouns`,
    question: `Choose the best pronoun to complete the sentence: Amara and Jayden picked up litter, and ___ placed it in a bag.`,
    options: [
      `he`,
      `she`,
      `they`,
      `it`,
    ],
    correctAnswer: 2,
    explanation: `"They" correctly refers to the two people, Amara and Jayden.`,
  },
  {
    id: 34,
    type: `grammar`,
    skill: `Commas in a Series`,
    question: `Choose the sentence with commas used correctly in a series.`,
    options: [
      `The students brought gloves bags and rakes.`,
      `The students brought gloves, bags, and rakes.`,
      `The students brought, gloves bags, and rakes.`,
      `The students, brought gloves bags and rakes.`,
    ],
    correctAnswer: 1,
    explanation: `Commas separate the items in the list: gloves, bags, and rakes.`,
  },
  {
    id: 35,
    type: `grammar`,
    skill: `Adverbs`,
    question: `Which word is an adverb in this sentence? The volunteers worked carefully near the busy road.`,
    options: [
      `volunteers`,
      `worked`,
      `carefully`,
      `road`,
    ],
    correctAnswer: 2,
    explanation: `"Carefully" is an adverb because it tells how the volunteers worked.`,
  },
  {
    id: 36,
    type: `writing`,
    skill: `Relevant Detail`,
    question: `Which detail should be included in a paragraph about Community Clean-Up Day?`,
    options: [
      `Volunteers planted bright flowers near the bus stop.`,
      `A student forgot a math book at home.`,
      `The beach waves were very high.`,
      `A puppy learned a new trick.`,
    ],
    correctAnswer: 0,
    explanation: `Planting bright flowers near the bus stop is directly related to Community Clean-Up Day.`,
  },
  {
    id: 37,
    type: `writing`,
    skill: `Audience and Purpose`,
    question: `You are writing a notice asking students to join the Environmental Club. Which sentence is best?`,
    options: [
      `Join us on Friday to plant trees and help keep our school grounds clean.`,
      `The trees near the fence are not all the same height.`,
      `I once saw a rake beside a classroom.`,
      `Some students have green school bags.`,
    ],
    correctAnswer: 0,
    explanation: `The best notice clearly invites students to join and explains the helpful activity.`,
  },
  {
    id: 38,
    type: `writing`,
    skill: `Order of Ideas`,
    question: `Which sentence should come first in a paragraph explaining how the club planted trees?`,
    options: [
      `First, Mrs. Reid showed the pupils how to loosen the soil.`,
      `Finally, the classes checked the trees later.`,
      `After that, each group watered one tree.`,
      `In the end, the club made a schedule.`,
    ],
    correctAnswer: 0,
    explanation: `The word "First" and the action of preparing the soil make this the best opening step.`,
  },
  {
    id: 39,
    type: `writing`,
    skill: `Clear Sentence`,
    question: `Which sentence is clearest?`,
    options: [
      `The teams swept the sidewalks and put the litter in garbage bags.`,
      `Swept sidewalks teams litter bags the.`,
      `The sidewalks, because teams and bags.`,
      `Garbage bags were teams sweeping in them.`,
    ],
    correctAnswer: 0,
    explanation: `The clearest sentence has a logical word order and clearly explains what the teams did.`,
  },
  {
    id: 40,
    type: `writing`,
    skill: `Formal Tone`,
    question: `Which sentence has the best formal tone for a school report?`,
    options: [
      `The Environmental Club planted young trees to improve the school grounds.`,
      `The club did some cool stuff by the fence.`,
      `Those kids were kinda messing with dirt.`,
      `It was like, trees and things everywhere.`,
    ],
    correctAnswer: 0,
    explanation: `A school report needs clear, respectful language; this sentence is formal and specific.`,
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

export default function G5LaEasy6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy6Questions : g5LaEasy6Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Easy 6",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 6</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 6</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 6</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
