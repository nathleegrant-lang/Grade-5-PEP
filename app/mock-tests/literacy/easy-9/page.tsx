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

const g5LaEasy9Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

What is the main idea of the passage?`,
    options: [
      "Grade 5 pupils learned about business by preparing and selling products at a fair.",
      "The pupils spent the whole day playing games in the school yard.",
      "The fair was cancelled because no products were ready.",
      "Only teachers were allowed to speak to customers at the fair.",
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on pupils planning small businesses, selling products, and learning what a good business needs.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

Which product was made by one of the groups?`,
    options: [
      "toy cars",
      "bookmarks",
      "school shoes",
      "painted desks",
    ],
    correctAnswer: 1,
    explanation: `The passage states that one group made bookmarks from bright card.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

What did each team do before the fair opened?`,
    options: [
      "They counted costs and decided on fair prices.",
      "They hid their products in the library.",
      "They asked customers to leave the school.",
      "They stopped working and went home early.",
    ],
    correctAnswer: 0,
    explanation: `The passage says each team counted its costs and decided on fair prices before the fair opened.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

What can the reader infer about the pupils?`,
    options: [
      "They were careless with money and materials.",
      "They worked together and took the fair seriously.",
      "They did not understand why customers came.",
      "They wanted the fair to happen without any planning.",
    ],
    correctAnswer: 1,
    explanation: `The pupils planned in teams, counted costs, set prices, and spoke politely, so they worked responsibly together.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

What does costs mean in the passage?`,
    options: [
      "songs sung during the fair",
      "materials needed to play a game",
      "money spent to make the products",
      "names of pupils on each team",
    ],
    correctAnswer: 2,
    explanation: `The teams counted costs before setting prices, so costs means the money spent to make the products.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

Why did the author most likely write this passage?`,
    options: [
      "to explain how a class learned business skills at a fair",
      "to persuade pupils never to work in groups",
      "to describe a race between three schools",
      "to list rules for borrowing library books",
    ],
    correctAnswer: 0,
    explanation: `The author informs readers about the fair and the business skills pupils learned from it.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

What happened because the pupils counted costs before setting prices?`,
    options: [
      "They could choose fair prices for their products.",
      "They had to throw away every greeting card.",
      "They forgot how their products were made.",
      "They stopped customers from visiting their tables.",
    ],
    correctAnswer: 0,
    explanation: `Counting costs helped the pupils decide on fair prices for the items they were selling.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"Grade 5 prepared for the Junior Entrepreneurship Fair by planning small businesses in teams. One group made bookmarks from bright card, another mixed fruit cups, and a third designed greeting cards. Before the fair opened, each team counted its costs and decided on fair prices. At the tables, pupils greeted customers politely and explained how their products were made. By the end of the day, they learned that a good business needs planning, teamwork, honesty, and helpful service."

Which detail best supports the idea that the pupils practised good customer service?`,
    options: [
      "They made bookmarks from bright card.",
      "They greeted customers politely and explained their products.",
      "The fair took place at school.",
      "The pupils were in Grade 5.",
    ],
    correctAnswer: 1,
    explanation: `Greeting customers politely and explaining products are examples of helpful customer service.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

What is the main idea of the passage?`,
    options: [
      "Students sold handmade products to raise money for a children's home.",
      "Students visited a children's home to borrow art supplies.",
      "Customers came to school only to watch a concert.",
      "The project was about throwing reusable materials away.",
    ],
    correctAnswer: 0,
    explanation: `Most details describe students making products, selling them, and using the money to help a children's home.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

What would the money help buy?`,
    options: [
      "sports trophies",
      "new school buses",
      "art supplies",
      "musical instruments for a parade",
    ],
    correctAnswer: 2,
    explanation: `The sign explained that the money would help buy art supplies for a nearby children's home.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

Which product did the students make?`,
    options: [
      "glass windows",
      "bead bracelets",
      "bicycle helmets",
      "computer tablets",
    ],
    correctAnswer: 1,
    explanation: `The passage lists bead bracelets as one of the products the students made.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

What can the reader infer about the students?`,
    options: [
      "They cared about helping others.",
      "They wanted to keep all the money for themselves.",
      "They were angry that customers visited the sale.",
      "They did not know the purpose of the project.",
    ],
    correctAnswer: 0,
    explanation: `The students raised money for a children's home and thanked supporters, showing that they cared about helping others.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

What does charity mean in the passage?`,
    options: [
      "an effort to help people in need",
      "a rule that stops people from sharing",
      "a game played only during lunchtime",
      "a shop that sells broken items",
    ],
    correctAnswer: 0,
    explanation: `The project raised money to help a children's home, so charity means an effort to help people in need.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

Why were customers pleased?`,
    options: [
      "The products were useful and the purpose was kind.",
      "The students refused to explain the project.",
      "The sale ended before customers arrived.",
      "The money was hidden and never counted.",
    ],
    correctAnswer: 0,
    explanation: `The passage says customers were pleased because the products were useful and the purpose was kind.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"For their charity project, students created simple products to sell after school. They made bead bracelets, small plant pots, and paper gift bags from clean reusable materials. A sign explained that the money would help buy art supplies for a nearby children's home. Customers were pleased because the products were useful and the purpose was kind. When the sale ended, the students counted the money carefully and thanked everyone who supported the project."

Which detail shows that the students handled the money responsibly?`,
    options: [
      "They used clean reusable materials.",
      "They made small plant pots.",
      "They counted the money carefully after the sale.",
      "Customers were pleased by the products.",
    ],
    correctAnswer: 2,
    explanation: `Counting the money carefully after the sale shows responsible handling of the money collected.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Choose the word that means nearly the same as purchase.

The pupils hoped many visitors would purchase their fruit cups.`,
    options: [
      "buy",
      "hide",
      "drop",
      "forget",
    ],
    correctAnswer: 0,
    explanation: `Purchase means buy.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Choose the word that means the opposite of profit.

After paying for materials, the team wanted to make a profit.`,
    options: [
      "gain",
      "loss",
      "plan",
      "price",
    ],
    correctAnswer: 1,
    explanation: `A profit is money gained; the opposite is a loss.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `What does promote mean in the sentence?

The class made posters to promote the charity sale so more customers would come.`,
    options: [
      "to advertise or support",
      "to cancel suddenly",
      "to whisper quietly",
      "to make dirty",
    ],
    correctAnswer: 0,
    explanation: `The posters were made so more customers would come, so promote means advertise or support.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `Which meaning of change is used in the sentence?

Maya gave the customer the correct change after he paid for a bookmark.`,
    options: [
      "money returned after payment",
      "to become different",
      "a fresh set of clothes",
      "to move to another seat",
    ],
    correctAnswer: 0,
    explanation: `In this sentence, change means the money returned to a customer after payment.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Prefixes",
    question: `What does reusable mean?`,
    options: [
      "able to be used again",
      "unable to be opened",
      "used only once",
      "full of noise",
    ],
    correctAnswer: 0,
    explanation: `The prefix re- means again, so reusable means able to be used again.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Suffixes",
    question: `What does the suffix -ful mean in helpful?`,
    options: [
      "without",
      "full of",
      "before",
      "one who",
    ],
    correctAnswer: 1,
    explanation: `The suffix -ful means full of, so helpful means full of help or useful assistance.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Compound Words",
    question: `Which word is a compound word?`,
    options: [
      "bookmark",
      "kind",
      "price",
      "team",
    ],
    correctAnswer: 0,
    explanation: `Bookmark is made from two smaller words: book and mark.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `What does customer mean?`,
    options: [
      "a person who buys goods or services",
      "a person who sweeps the classroom",
      "a place where books are kept",
      "a rule written on a poster",
    ],
    correctAnswer: 0,
    explanation: `A customer is a person who buys goods or services.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `What does donated mean in the sentence?

Several parents donated craft paper for the charity project.`,
    options: [
      "gave to help",
      "took back angrily",
      "counted twice",
      "painted blue",
    ],
    correctAnswer: 0,
    explanation: `Because parents provided craft paper for the project, donated means gave to help.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is the opposite of polite?`,
    options: [
      "careful",
      "rude",
      "honest",
      "useful",
    ],
    correctAnswer: 1,
    explanation: `Polite means showing good manners; rude means the opposite.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `The student teams ___ fruit cups at the fair.`,
    options: [
      "sell",
      "sells",
      "selling",
      "has sold",
    ],
    correctAnswer: 0,
    explanation: `The plural subject "teams" agrees with the plural verb "sell."`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the sentence written in the past tense.`,
    options: [
      "The pupils count the money.",
      "The pupils counted the money.",
      "The pupils will count the money.",
      "The pupils are counting the money.",
    ],
    correctAnswer: 1,
    explanation: `Counted shows that the action happened in the past.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Choose the sentence with correct punctuation.`,
    options: [
      "What price did you choose?",
      "What price did you choose.",
      "What price did you choose!",
      "What price did you choose,",
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
      "on monday, we prepared posters for the fair.",
      "On monday, we prepared posters for the fair.",
      "On Monday, we prepared posters for the fair.",
      "on Monday, we prepared Posters for the fair.",
    ],
    correctAnswer: 2,
    explanation: `The first word of the sentence and the day Monday should begin with capital letters.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the pronoun that best completes the sentence.

Alicia made gift bags, and _____ sold them after school.`,
    options: [
      "she",
      "him",
      "they",
      "us",
    ],
    correctAnswer: 0,
    explanation: `She is the correct subject pronoun to refer to Alicia.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Adjectives",
    question: `Which word is an adjective in the sentence?

The honest pupils counted the money carefully.`,
    options: [
      "honest",
      "counted",
      "money",
      "carefully",
    ],
    correctAnswer: 0,
    explanation: `Honest describes the noun pupils, so it is an adjective.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Adverbs",
    question: `Which word is an adverb in the sentence?

The customers waited patiently at the table.`,
    options: [
      "customers",
      "waited",
      "patiently",
      "table",
    ],
    correctAnswer: 2,
    explanation: `Patiently tells how the customers waited, so it is an adverb.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conjunctions",
    question: `The bracelets were colourful, ___ they did not sell as quickly as the plant pots.`,
    options: [
      "and",
      "but",
      "because",
      "although",
    ],
    correctAnswer: 1,
    explanation: `But correctly joins two related ideas with a contrast.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Commas",
    question: `Choose the sentence that uses commas correctly in a list.`,
    options: [
      "We sold bookmarks fruit cups and cards.",
      "We sold bookmarks, fruit cups, and cards.",
      "We sold, bookmarks fruit cups, and cards.",
      "We sold bookmarks fruit cups, and, cards.",
    ],
    correctAnswer: 1,
    explanation: `Commas are used to separate the items in the list: bookmarks, fruit cups, and cards.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: [
      "After the charity sale.",
      "Because the posters were bright.",
      "The students thanked their customers.",
      "Counting money carefully.",
    ],
    correctAnswer: 2,
    explanation: `The students thanked their customers has a subject and predicate and expresses a complete thought.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which sentence would be the best topic sentence for a paragraph about the Junior Entrepreneurship Fair?`,
    options: [
      "The Junior Entrepreneurship Fair helped Grade 5 pupils learn useful business skills.",
      "Students sold fruit cups, bracelets, and plant pots at the fair.",
      "Pupils counted the money after customers bought their products.",
      "The class gave part of the money earned to charity.",
    ],
    correctAnswer: 0,
    explanation: `A topic sentence should introduce the main idea of the paragraph, which is learning business skills at the fair.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports this topic sentence?

The charity sale was carefully organized.`,
    options: [
      "Students labelled prices, arranged products, and counted the money after the sale.",
      "The charity sale was held during the school fair.",
      "Students sold fruit cups, bracelets, cards, and plant pots.",
      "Many customers visited the tables during the sale.",
    ],
    correctAnswer: 0,
    explanation: `Labelling prices, arranging products, and counting money are details that show the sale was organized.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Sentence Order",
    question: `Choose the best order for these sentences.

1. Finally, they thanked the customers for supporting the charity.
2. First, the students made bead bracelets and gift bags.
3. Next, they displayed the products on a table after school.`,
    options: [
      "2, 3, 1",
      "1, 2, 3",
      "3, 1, 2",
      "2, 1, 3",
    ],
    correctAnswer: 0,
    explanation: `The logical order is first making products, next displaying them, and finally thanking customers.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Concluding Sentence",
    question: `Which sentence is the best conclusion for a paragraph about selling products to help charity?`,
    options: [
      "The project showed that small acts of teamwork can make a kind difference.",
      "Students made bracelets and cards before the sale.",
      "The charity sale took place during the school fair.",
      "First, the pupils arranged their products on the tables.",
    ],
    correctAnswer: 0,
    explanation: `This sentence wraps up the paragraph by restating the value of teamwork and kindness in the charity project.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Revise for Clarity",
    question: `Choose the clearest sentence.`,
    options: [
      "We sold the cards, and then we recorded the amount earned.",
      "After we sold the cards, we wrote down how much money there was.",
      "We sold the cards and recorded the amount, which was the amount earned.",
      "The amount earned from the cards was recorded after they were sold by us.",
    ],
    correctAnswer: 0,
    explanation: `The correct sentence clearly explains that the cards were sold and the amount earned was recorded.`
  },
]

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
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaEasy9Questions)
      : preparePreview(g5LaEasy9Questions, FREE_QUESTION_LIMIT)
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
