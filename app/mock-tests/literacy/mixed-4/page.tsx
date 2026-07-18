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

const P1 = `Louise Bennett-Coverley, affectionately known as Miss Lou, became one of Jamaica’s most important cultural voices. She was born in Kingston in 1919 and grew up hearing Jamaican Creole, also called Patois, spoken in homes, markets, yards, and communities. At that time, many people believed that only Standard English belonged in classrooms, books, theatres, and formal public life.

Miss Lou challenged that belief. She wrote poems, performed on stage and radio, taught audiences, and used humour to show that Jamaican Creole could carry intelligence, emotion, history, and truth. Her work did not reject Standard English. Instead, it showed that Jamaicans could value both language forms and use each one appropriately.

Through her performances, Miss Lou allowed ordinary Jamaicans to hear familiar speech presented with pride rather than shame. Her characters spoke in ways that sounded like real people. They joked, questioned authority, told stories, and commented on social issues. Audiences laughed, but they also recognised themselves and thought more deeply about Jamaican life.

Miss Lou’s work helped preserve expressions, rhythms, proverbs, and ways of speaking that might otherwise have been ignored. She demonstrated that language is closely connected to identity. When people are taught that their home language is inferior, they may begin to feel that their culture and experiences are inferior too. By celebrating Jamaican Creole, she encouraged people to value their heritage.

Her influence extended far beyond entertainment. She became a teacher, cultural ambassador, writer, broadcaster, and performer. Her poems are studied in schools and universities, her recordings are preserved, and her contribution is recognised nationally. Her image appears on Jamaican currency, showing how greatly the country values her legacy.

Miss Lou’s achievement was not simply that she made people laugh. She changed how many people understood Jamaican language and culture. She proved that a language spoken by ordinary people could also belong in literature, education, and national life. Her courage helped future generations speak with greater confidence about who they are.`

const g5LaMix4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

${P1}

What is the passage mainly about?`,
    options: [
      "How Miss Lou used Jamaican Creole to strengthen cultural pride and identity",
      "Miss Lou’s childhood games",
      "Why Standard English should disappear",
      "The history of Jamaican currency"
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on Miss Lou’s use of Jamaican Creole and her lasting cultural influence.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P1}

Where was Miss Lou born?`,
    options: [
      "Montego Bay",
      "Kingston",
      "Spanish Town",
      "Port Antonio"
    ],
    correctAnswer: 1,
    explanation: `The passage states that Miss Lou was born in Kingston.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

Why did Miss Lou’s work require courage?`,
    options: [
      "She performed without an audience.",
      "She refused to learn any language.",
      "She challenged the belief that Jamaican Creole did not belong in formal spaces.",
      "She wrote only about foreign countries."
    ],
    correctAnswer: 2,
    explanation: `She challenged widely accepted attitudes about which language forms were considered respectable.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

${P1}

Why does the author explain that Miss Lou did not reject Standard English?`,
    options: [
      "To prove that Jamaican Creole is not useful",
      "To suggest she stopped using Patois",
      "To explain why she became a teacher",
      "To show that she valued both language forms appropriately"
    ],
    correctAnswer: 3,
    explanation: `The detail prevents the reader from assuming that valuing Creole required rejecting Standard English.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

${P1}

What was one effect of Miss Lou presenting familiar Jamaican speech with pride?`,
    options: [
      "People could recognise themselves and value their heritage.",
      "Audiences became ashamed of their culture.",
      "Schools stopped teaching language.",
      "Jamaican proverbs disappeared."
    ],
    correctAnswer: 0,
    explanation: `Her performances helped people see their language and culture as worthy of pride.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P1}

How did Miss Lou’s characters differ from formal public speech of the time?`,
    options: [
      "They never discussed Jamaican life.",
      "They used familiar Jamaican speech and sounded like ordinary people.",
      "They spoke only in silence.",
      "They avoided humour and stories."
    ],
    correctAnswer: 1,
    explanation: `Her characters sounded like real Jamaicans rather than using only formal Standard English.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P1}

What can the reader conclude about Miss Lou’s humour?`,
    options: [
      "It was used only to entertain.",
      "It prevented people from understanding her message.",
      "It helped audiences laugh while also thinking about serious social issues.",
      "It was unrelated to Jamaican culture."
    ],
    correctAnswer: 2,
    explanation: `The passage says audiences laughed but also thought more deeply about Jamaican life.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

${P1}

In the passage, “heritage” most nearly means`,
    options: [
      "money earned from work",
      "a type of school subject",
      "a public performance",
      "traditions and culture passed from earlier generations"
    ],
    correctAnswer: 3,
    explanation: `Heritage refers to inherited culture, traditions, and identity.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P1}

Which detail best shows Miss Lou’s national importance?`,
    options: [
      "Her image appears on Jamaican currency.",
      "She enjoyed telling jokes.",
      "She heard Patois in markets.",
      "She wrote about ordinary people."
    ],
    correctAnswer: 0,
    explanation: `Appearing on national currency is strong evidence of national recognition.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

${P1}

Which word best describes the tone of the passage?`,
    options: [
      "Mocking",
      "Admiring",
      "Uncertain",
      "Angry"
    ],
    correctAnswer: 1,
    explanation: `The author presents Miss Lou with respect and admiration.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

${P1}

Which theme is best supported by the passage?`,
    options: [
      "Only formal speech has value.",
      "Humour should never address serious topics.",
      "Language can shape identity and cultural pride.",
      "Education must use one language form only."
    ],
    correctAnswer: 2,
    explanation: `The passage repeatedly connects language with identity, dignity, and heritage.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Read the passage then answer the question.

${P1}

Which statement is an opinion?`,
    options: [
      "Miss Lou was born in Kingston in 1919.",
      "Her image appears on Jamaican currency.",
      "Her recordings are preserved.",
      "Miss Lou was the most entertaining person in Jamaican history."
    ],
    correctAnswer: 3,
    explanation: `“Most entertaining” is a personal judgement that cannot be proved as a fact.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

${P1}

How is the passage mainly organised?`,
    options: [
      "It describes a problem, explains Miss Lou’s response, and shows her lasting influence.",
      "It gives instructions for writing a poem.",
      "It tells events from one single day.",
      "It compares two countries without a conclusion."
    ],
    correctAnswer: 0,
    explanation: `The passage explains negative attitudes, Miss Lou’s challenge to them, and her legacy.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Synthesis",
    question: `Read the passage then answer the question.

${P1}

Which statement best combines two important ideas from the passage?`,
    options: [
      "Miss Lou used only Standard English in public.",
      "Miss Lou used humour and Jamaican Creole to entertain while also strengthening cultural confidence.",
      "Miss Lou believed language had nothing to do with identity.",
      "Miss Lou’s work mattered only during her lifetime."
    ],
    correctAnswer: 1,
    explanation: `This choice combines her entertaining style with her deeper cultural purpose.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Summary",
    question: `Read the passage then answer the question.

${P1}

Which sentence best summarises the passage?`,
    options: [
      "Miss Lou became famous only because her image appears on money.",
      "Miss Lou rejected education and formal language.",
      "Miss Lou helped Jamaicans value their language and culture through writing, teaching, humour, and performance.",
      "Miss Lou wrote only for children."
    ],
    correctAnswer: 2,
    explanation: `This sentence captures her methods and lasting cultural contribution.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is closest in meaning to “preserve”?`,
    options: [
      "destroy",
      "forget",
      "scatter",
      "protect"
    ],
    correctAnswer: 3,
    explanation: `To preserve means to protect or keep safe.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word is the opposite of “inferior”?`,
    options: [
      "superior",
      "lesser",
      "ordinary",
      "similar"
    ],
    correctAnswer: 0,
    explanation: `Superior is the opposite of inferior.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `What does the prefix “re-” mean in “recognised” when thinking of “recognise again”?`,
    options: [
      "before",
      "again",
      "under",
      "without"
    ],
    correctAnswer: 1,
    explanation: `The prefix re- commonly means again.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `What does the suffix “-ful” suggest in “powerful”?`,
    options: [
      "without power",
      "before power",
      "full of power",
      "against power"
    ],
    correctAnswer: 2,
    explanation: `Powerful means full of power or strength.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In the passage, “formal public life” refers to`,
    options: [
      "private conversations at home",
      "games played by children",
      "shopping in a market",
      "official settings such as schools, theatres, and public events"
    ],
    correctAnswer: 3,
    explanation: `The surrounding examples show that formal public life means official or recognised settings.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses “voice” in the same way as “cultural voice”?`,
    options: [
      "The writer became a strong voice for young people.",
      "She lost her voice after shouting.",
      "His voice was very soft.",
      "The singer warmed up her voice."
    ],
    correctAnswer: 0,
    explanation: `Here, voice means a person who represents or speaks for ideas and people.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Poet is to poem as musician is to`,
    options: [
      "stage",
      "song",
      "audience",
      "book"
    ],
    correctAnswer: 1,
    explanation: `A poet creates a poem, while a musician creates or performs a song.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase best replaces “ordinary people”?`,
    options: [
      "royal leaders only",
      "foreign visitors",
      "people from everyday life",
      "famous performers"
    ],
    correctAnswer: 2,
    explanation: `Ordinary people means people from everyday life.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `What does “identity” mean?`,
    options: [
      "a list of school rules",
      "a type of currency",
      "a public holiday",
      "the qualities and beliefs that help define who a person or group is"
    ],
    correctAnswer: 3,
    explanation: `Identity refers to who a person or group is.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Precise Word Choice",
    question: `Which word best completes the sentence? “Miss Lou _____ Jamaican Creole through poetry and performance.”`,
    options: [
      "celebrated",
      "hid",
      "weakened",
      "avoided"
    ],
    correctAnswer: 0,
    explanation: `Celebrated precisely shows that she honoured and valued the language.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "A collection of Miss Lou’s poems are on the shelf.",
      "A collection of Miss Lou’s poems is on the shelf.",
      "A collection of Miss Lou’s poems were on the shelf.",
      "A collection of Miss Lou’s poems be on the shelf."
    ],
    correctAnswer: 1,
    explanation: `The subject collection is singular, so it takes is.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Pronouns",
    question: `Which sentence uses the pronoun correctly?`,
    options: [
      "Me and Alana read the poem.",
      "Her and Alana read the poem.",
      "Alana and I read the poem.",
      "Alana gave I the book."
    ],
    correctAnswer: 2,
    explanation: `I is the correct subject pronoun.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Miss Lou wrote poems and performs them.",
      "Miss Lou writes poems and performed them.",
      "Miss Lou will write poems and performed them.",
      "Miss Lou wrote poems and performed them."
    ],
    correctAnswer: 3,
    explanation: `Wrote and performed are both past tense.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After the performance, the audience applauded.",
      "After the performance the audience applauded.",
      "After, the performance the audience applauded.",
      "After the performance the audience, applauded."
    ],
    correctAnswer: 0,
    explanation: `A comma follows the introductory phrase.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      "\"That poem was funny\" Dario said.",
      "\"That poem was funny,\" Dario said.",
      "That poem was funny,\" Dario said.",
      "\"That poem was funny, Dario said.\""
    ],
    correctAnswer: 1,
    explanation: `The spoken words are enclosed correctly, with a comma before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence uses a relative pronoun correctly?`,
    options: [
      "The poem who we read was humorous.",
      "The radio programme which host spoke clearly was popular.",
      "The poet who inspired the class was Miss Lou.",
      "The students which performed were confident."
    ],
    correctAnswer: 2,
    explanation: `Who correctly refers to a person.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which sentence best combines the ideas? “Miss Lou entertained audiences. She also taught them.”`,
    options: [
      "Miss Lou entertained audiences, she also taught them.",
      "Miss Lou entertained audiences also teaching.",
      "Because Miss Lou entertained audiences but taught them.",
      "Miss Lou entertained audiences and also taught them."
    ],
    correctAnswer: 3,
    explanation: `And also correctly joins the two related actions.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which sentence correctly repairs the run-on? “The poem was humorous it carried a serious message.”`,
    options: [
      "The poem was humorous, but it carried a serious message.",
      "The poem was humorous, it carried a serious message.",
      "The poem humorous and carried a serious message.",
      "Being humorous it carried serious."
    ],
    correctAnswer: 0,
    explanation: `The comma and conjunction but correctly join the contrasting clauses.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? “Many people dismissed Patois; _____, Miss Lou celebrated it.”`,
    options: [
      "therefore",
      "however",
      "for example",
      "similarly"
    ],
    correctAnswer: 1,
    explanation: `However introduces the contrast.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Precise Word Choice",
    question: `Which verb is most precise? “The class _____ how language shapes identity.”`,
    options: [
      "did",
      "looked",
      "analysed",
      "made"
    ],
    correctAnswer: 2,
    explanation: `Analysed precisely describes careful examination.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which is the strongest introduction for a paragraph about Miss Lou?`,
    options: [
      "Miss Lou was a person.",
      "I will now write about Miss Lou.",
      "Jamaica has many people.",
      "Through courage, humour, and language, Miss Lou helped Jamaicans see their culture with greater pride."
    ],
    correctAnswer: 3,
    explanation: `This sentence clearly introduces the topic and central idea.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which detail best supports the topic sentence “Miss Lou strengthened Jamaican cultural pride”?`,
    options: [
      "She performed familiar Jamaican speech on stage with confidence.",
      "She was born in 1919.",
      "Some poems are short.",
      "Currency is used to buy things."
    ],
    correctAnswer: 0,
    explanation: `This detail directly shows how she publicly valued Jamaican culture.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition best adds another contribution? “Miss Lou wrote poetry. _____, she taught and performed for audiences.”`,
    options: [
      "However",
      "Furthermore",
      "Instead",
      "Otherwise"
    ],
    correctAnswer: 1,
    explanation: `Furthermore adds another related point.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Which sentence should be removed?

(1) Miss Lou used Jamaican Creole in poetry and performance. (2) Her work helped people value their language. (3) Blue whales are the largest animals on Earth. (4) Her influence is still recognised today.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 3",
      "Sentence 4"
    ],
    correctAnswer: 2,
    explanation: `Sentence 3 is unrelated to Miss Lou’s cultural influence.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which is the strongest conclusion for an essay about Miss Lou?`,
    options: [
      "That is all about Miss Lou.",
      "Miss Lou performed many times.",
      "Everyone should become a poet.",
      "By honouring Jamaican language and ordinary people, Miss Lou helped a nation speak about itself with greater confidence and pride."
    ],
    correctAnswer: 3,
    explanation: `This conclusion restates the central idea in a thoughtful, memorable way.`
  }
];

const shuffleAnswerOptions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const optionsWithOriginalIndex = question.options.map((option, index) => ({
      option,
      index,
    }))

    for (let i = optionsWithOriginalIndex.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [
        optionsWithOriginalIndex[j],
        optionsWithOriginalIndex[i],
      ]
    }

    const correctAnswer = optionsWithOriginalIndex.findIndex(
      (item) => item.index === question.correctAnswer,
    )

    return {
      ...question,
      options: optionsWithOriginalIndex.map((item) => item.option),
      correctAnswer,
    }
  })
}

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaMix4Questions : g5LaMix4Questions.slice(0, FREE_QUESTION_LIMIT)
  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
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

  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Mixed 4",
      difficulty: "Mixed",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: new Date().toISOString(),
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

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

  const handleSubmit = () => {
    setShowResults(true)
  }

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
    setStarted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null))
    setTimeLeft(60 * 60)
    hasSavedResult.current = false
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 4</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Mixed Level Practice</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This mixed-level test uses Miss Lou and Jamaican language as its central theme while assessing comprehension, vocabulary, grammar, and writing across a balanced range of Grade 5 skills.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">What to Expect</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Reading: literal comprehension → inference → literary analysis</li>
                <li>Vocabulary: word meaning → figurative language → nuanced connotation</li>
                <li>Grammar: basic parts of speech → complex clauses and transformations</li>
                <li>Writing: paragraph structure → persuasive technique → analytical writing</li>
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
              <p className="text-slate-600">Language Arts Mixed 4</p>
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
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade to access all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
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
                <p className="text-slate-700">This mixed test spans all difficulty levels. Review each explanation carefully — questions you found challenging reveal which areas to focus on as you prepare for the PEP Language Arts paper.</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 4</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade to Premium for full access.</p></div>)}
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
