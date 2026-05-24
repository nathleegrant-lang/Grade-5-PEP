"use client"

import { useState, useEffect, useCallback } from "react"
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

const g5LaEasy7Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

What is this passage MAINLY about?`,
    options: [
      "The Jamaican hutia's diet",
      "Jamaica's unique wildlife and the importance of protecting it",
      "The largest snake in the world",
      "How to become a wildlife ranger",
    ],
    correctAnswer: 1,
    explanation: `The passage introduces several unique Jamaican animals and argues for the importance of protecting them — this is the main idea.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

Where is the Yellow-billed Parrot mainly found?`,
    options: [
      "In coastal areas",
      "In the island's mountains",
      "Near rivers and lakes",
      "In residential gardens",
    ],
    correctAnswer: 1,
    explanation: `The passage states the Yellow-billed Parrot is 'found mainly in the island's mountains.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

The word 'unique' in the passage means:`,
    options: [
      "common and widespread",
      "found everywhere in the world",
      "one-of-a-kind, found nowhere else",
      "dangerous and rare",
    ],
    correctAnswer: 2,
    explanation: `'Unique' means one-of-a-kind. The passage uses it to explain that these animals are found nowhere else on Earth.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

Why does the author include the detail that the Jamaican boa is 'harmless to humans'?`,
    options: [
      "To prove snakes are friendly",
      "To correct a common fear — many people are scared of snakes, but this one is not dangerous",
      "To encourage people to keep snakes as pets",
      "To show the snake is weak",
    ],
    correctAnswer: 1,
    explanation: `Mentioning it is harmless addresses likely reader fear and encourages protection rather than avoidance or killing of the snake.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

According to the passage, WHY is it important to protect Jamaica's animals?`,
    options: [
      "So that tourists will visit",
      "So that scientists can study them",
      "So that future generations can enjoy Jamaica's natural heritage",
      "So that they can be kept in zoos",
    ],
    correctAnswer: 2,
    explanation: `The passage directly states the importance of protection 'so that future generations can enjoy Jamaica's natural heritage.'`
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

The MAIN purpose of this passage is to:`,
    options: [
      "Scare readers about snakes",
      "Entertain readers with animal stories",
      "Inform readers about unique Jamaican animals and persuade them that conservation is important",
      "Provide a scientific classification of animals",
    ],
    correctAnswer: 2,
    explanation: `The passage informs readers about unique animals and makes a case for their protection — informative and persuasive.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

How is this passage mainly organised?`,
    options: [
      "As a story with a beginning, middle, and end",
      "By comparing Jamaican animals to animals in other countries",
      "By describing animals one by one and ending with a broader argument for conservation",
      "As a list of instructions",
    ],
    correctAnswer: 2,
    explanation: `The passage introduces three animals, then broadens to a general argument about protecting all of them — a logical, purposeful structure.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

The word 'heritage' in the passage most nearly means:`,
    options: [
      "government rules",
      "the natural and cultural legacy passed from one generation to the next",
      "a type of animal habitat",
      "a national park",
    ],
    correctAnswer: 1,
    explanation: `Heritage refers to what is passed on from previous generations — here, Jamaica's natural world is described as a heritage for future generations.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

Which statement is a FACT from the passage?`,
    options: [
      "The Jamaican boa is the most beautiful snake on the island",
      "The hutia is the most interesting rodent in the Caribbean",
      "The Yellow-billed Parrot is found mainly in the island's mountains",
      "Jamaica's animals are the most unique in the world",
    ],
    correctAnswer: 2,
    explanation: `This is a directly stated, verifiable fact from the passage. The other options are opinions.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

The tone of this passage is BEST described as:`,
    options: [
      "Fearful and alarming",
      "Informative and conservationist — encouraging care for wildlife",
      "Humorous and playful",
      "Critical of people who harm animals",
    ],
    correctAnswer: 1,
    explanation: `The language is informative about the animals and ends with a clear, caring message about conservation.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

What can you infer about the Jamaican hutia's habitat?`,
    options: [
      "It lives in open grasslands",
      "It lives in the sea",
      "It lives in forested areas, so deforestation would threaten it",
      "It lives underground only",
    ],
    correctAnswer: 2,
    explanation: `The passage says the hutia 'lives in forested areas' — so if those areas are destroyed, the hutia would lose its home.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

Which BEST summarises this passage?`,
    options: [
      "Jamaica has many types of birds",
      "Three unique Jamaican animals — the hutia, the Yellow-billed Parrot, and the boa — are introduced, and the passage argues for their conservation",
      "Snakes are harmless to humans",
      "Jamaica is a popular tourist destination",
    ],
    correctAnswer: 1,
    explanation: `This captures both the informational content (three animals) and the argument (conservation).`
  },
  {
    id: 13,
    type: "reading",
    skill: "Character of Author",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

Based on the passage, how does the author feel about Jamaica's wildlife?`,
    options: [
      "Indifferent and uninterested",
      "Afraid of the animals",
      "Proud and concerned — wanting readers to value and protect Jamaica's natural heritage",
      "Angry at people who visit the island",
    ],
    correctAnswer: 1,
    explanation: `The celebratory language ('unique,' 'natural heritage') and the conservation argument show the author's pride in and concern for Jamaica's wildlife.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

The phrase 'found nowhere else on Earth' is used to emphasise:`,
    options: [
      "that the animals are very old",
      "that Jamaica is a very small island",
      "just how special and irreplaceable Jamaica's unique animals are",
      "that scientists have not explored other countries",
    ],
    correctAnswer: 2,
    explanation: `The phrase highlights the uniqueness and irreplaceability of Jamaica's endemic species — making the case for conservation more urgent.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Jamaica is home to many unique animals found nowhere else on Earth. The Jamaican hutia is a small rodent that lives in forested areas, and the Yellow-billed Parrot is a rare and colourful bird found mainly in the island's mountains. The Jamaican boa, sometimes called the yellow snake, is the largest snake on the island and is harmless to humans. Protecting these animals and their habitats is important so that future generations can enjoy Jamaica's natural heritage."

According to the passage, what is another name for the Jamaican boa?`,
    options: [
      "The green snake",
      "The mountain snake",
      "The yellow snake",
      "The island serpent",
    ],
    correctAnswer: 2,
    explanation: `The passage states the boa is 'sometimes called the yellow snake.'`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'preserve'?`,
    options: [
      "destroy",
      "abandon",
      "protect",
      "ignore",
    ],
    correctAnswer: 2,
    explanation: `'Protect' means to keep safe from harm — a synonym for 'preserve.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'harmless' is:`,
    options: [
      "safe",
      "gentle",
      "dangerous",
      "friendly",
    ],
    correctAnswer: 2,
    explanation: `'Dangerous' means causing harm — the opposite of 'harmless.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The bird was ENDEMIC to the island — no other place on Earth was its home. 'Endemic' means:`,
    options: [
      "common everywhere",
      "naturally restricted to a specific geographic area",
      "recently introduced from another country",
      "protected by law",
    ],
    correctAnswer: 1,
    explanation: `'Endemic' means found naturally in only one specific place — the island is the bird's only home.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The forest is the lungs of the Earth.' This metaphor suggests forests:`,
    options: [
      "look like lungs",
      "are underground",
      "breathe oxygen in and carbon dioxide out, keeping the planet healthy",
      "are dangerous to enter",
    ],
    correctAnswer: 2,
    explanation: `Like lungs, forests take in carbon dioxide and release oxygen — the metaphor highlights their life-giving, respiratory function for the planet.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'habitat' means:`,
    options: [
      "a type of animal",
      "the natural environment where an organism lives and thrives",
      "a kind of food",
      "a protective covering",
    ],
    correctAnswer: 1,
    explanation: `'Habitat' is the natural home environment of an animal or plant — where it finds food, shelter, and mates.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses 'reserve' to mean a protected wildlife area?`,
    options: [
      "Please reserve a table for us",
      "She has no money in reserve",
      "Visitors must stay on the path in the nature reserve",
      "He played it with great reserve",
    ],
    correctAnswer: 2,
    explanation: `'Nature reserve' uses 'reserve' to mean a protected area set aside for wildlife conservation.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Prefix bio-",
    question: `The prefix 'bio-' in 'biodiversity' means:`,
    options: [
      "life",
      "water",
      "earth",
      "sound",
    ],
    correctAnswer: 0,
    explanation: `'Bio-' comes from Greek meaning life. 'Biodiversity' = the variety of life forms in an ecosystem.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Suffix -tion",
    question: `Adding '-tion' to 'conserve' gives 'conservation', which is:`,
    options: [
      "a verb",
      "an adjective",
      "an adverb",
      "a noun",
    ],
    correctAnswer: 3,
    explanation: `'-tion' creates nouns from verbs. 'Conservation' = the act or process of conserving or protecting.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The last hutia in Jamaica would be the silent end of a song that began millions of years ago.' This is a:`,
    options: [
      "Simile",
      "Metaphor — comparing the species' history to a song",
      "Personification",
      "Alliteration",
    ],
    correctAnswer: 1,
    explanation: `The metaphor compares the species' evolutionary history to a song — making its potential extinction feel like the ending of something beautiful and ancient.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Scientists described the discovery as UNPRECEDENTED — nothing like it had ever been recorded before. 'Unprecedented' means:`,
    options: [
      "very common",
      "seen many times before",
      "happening for the very first time, with no prior example",
      "slightly unusual",
    ],
    correctAnswer: 2,
    explanation: `'Unprecedented' means without precedent — no previous example of this exists.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Collective Nouns",
    question: `Which word is a COLLECTIVE NOUN for a group of birds?`,
    options: [
      "team",
      "herd",
      "flock",
      "pack",
    ],
    correctAnswer: 2,
    explanation: `'Flock' is the collective noun for a group of birds.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Helping Verbs",
    question: `Which sentence uses a HELPING VERB?`,
    options: [
      "The boa slides through the grass",
      "The parrot sings at dawn",
      "The hutia has been spotted in the forest",
      "Researchers study the species",
    ],
    correctAnswer: 2,
    explanation: `'Has been' is the helping (auxiliary) verb. 'Has been spotted' = auxiliary + main verb.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Comparative Adjectives",
    question: `Choose the COMPARATIVE form of 'rare':`,
    options: [
      "rarest",
      "more rarer",
      "rarer",
      "most rare",
    ],
    correctAnswer: 2,
    explanation: `For two-syllable or short adjectives, add '-er' to compare. 'Rarer' is the comparative of 'rare.'`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Adverbs of Frequency",
    question: `Which word is an ADVERB OF FREQUENCY?`,
    options: [
      "slowly",
      "red",
      "rarely",
      "clever",
    ],
    correctAnswer: 2,
    explanation: `'Rarely' tells how often something happens — it is an adverb of frequency.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Colon",
    question: `Which sentence correctly uses a COLON?`,
    options: [
      "Jamaica has: many unique animals",
      "The island is home to three rare species: the hutia, the parrot, and the boa",
      "The hutia: lives in forested areas",
      "Rare animals: are found in Jamaica",
    ],
    correctAnswer: 1,
    explanation: `A colon introduces a list or explanation. 'Three rare species:' correctly introduces the list that follows.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Present Perfect Tense",
    question: `Which sentence is in the PRESENT PERFECT tense?`,
    options: [
      "Scientists discovered the hutia",
      "Scientists are discovering the hutia",
      "Scientists have discovered many facts about the hutia",
      "Scientists will discover more soon",
    ],
    correctAnswer: 2,
    explanation: `Present perfect = has/have + past participle. 'Have discovered' is correct.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Relative Clauses",
    question: `Which sentence contains a RELATIVE CLAUSE?`,
    options: [
      "The parrot lives in the mountains",
      "The parrot sings loudly every morning",
      "The parrot, which is yellow-billed, is found in Jamaica's mountains",
      "The parrot eats fruit",
    ],
    correctAnswer: 2,
    explanation: `'Which is yellow-billed' is a relative clause — it gives extra information about the parrot using a relative pronoun.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct verb: 'The group of scientists ___ studying the boa.'`,
    options: [
      "are",
      "is",
      "have",
      "were",
    ],
    correctAnswer: 0,
    explanation: `'Group' is a collective noun — typically singular in formal writing. 'Is studying' is standard, but 'are studying' is also acceptable in Caribbean English when members act individually. 'Are' is the better answer here.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Possessive Pronouns",
    question: `Which sentence correctly uses a POSSESSIVE PRONOUN?`,
    options: [
      "The habitat belongs to the boa. It is the boas.",
      "The habitat is its.",
      "The habitat belongs to the boa. It is hers.",
      "The habitat is the boa's",
    ],
    correctAnswer: 1,
    explanation: `'Its' is the possessive pronoun for a non-human animal or thing. 'The habitat is its' is correct.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Correction",
    question: `Which sentence is CORRECT?`,
    options: [
      "The hutia live in the forest since many years",
      "The hutia has lived in the forest for many years",
      "The hutia living in the forest since years",
      "The hutia lived in forest for many year",
    ],
    correctAnswer: 1,
    explanation: `'Has lived... for many years' is the correct present perfect construction indicating an ongoing state.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose — Informative Writing",
    question: `An informative article about endangered animals should MAINLY:`,
    options: [
      "Use emotional language to make readers cry",
      "Present accurate facts and evidence to educate readers about the topic",
      "Give only the writer's personal opinion",
      "Entertain with fictional stories about animals",
    ],
    correctAnswer: 1,
    explanation: `Informative writing educates readers with accurate, well-organised facts and evidence — its primary purpose is to inform.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Text Features",
    question: `Which text feature BEST helps readers navigate a long informative article?`,
    options: [
      "Writing in one continuous paragraph",
      "Using different fonts randomly",
      "Subheadings that clearly signal each section's topic",
      "Making every sentence very short",
    ],
    correctAnswer: 2,
    explanation: `Subheadings guide readers through a text by clearly signalling what each section covers — an essential navigation tool for informative writing.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Formal Language",
    question: `Which sentence is written in the MOST formal register for an environmental report?`,
    options: [
      "The animals are dying because of us",
      "People need to stop messing up the environment",
      "Human activities are contributing significantly to habitat loss and species extinction",
      "It's really bad what we're doing to animals",
    ],
    correctAnswer: 2,
    explanation: `Formal writing uses precise, measured vocabulary and avoids contractions and casual language. Option C exemplifies formal register.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Using Evidence",
    question: `When writing about conservation, including a STATISTIC is useful because:`,
    options: [
      "It makes the writing longer",
      "Statistics are always 100% accurate",
      "A specific number or percentage makes the argument more concrete and credible",
      "Readers prefer numbers to words",
    ],
    correctAnswer: 2,
    explanation: `Evidence like statistics gives arguments credibility — concrete data is more convincing than vague general claims.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding with a Call to Action",
    question: `A conservation article BEST ends with:`,
    options: [
      "A summary of problems with no solution suggested",
      "A call to action that tells readers what they can do to help",
      "A long list of all endangered species",
      "A personal story about the writer's pet",
    ],
    correctAnswer: 1,
    explanation: `Ending with a call to action empowers readers — it turns awareness into a practical invitation to make a difference.`
  }
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

  const availableQuestions = isPremium ? g5LaEasy7Questions : g5LaEasy7Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
