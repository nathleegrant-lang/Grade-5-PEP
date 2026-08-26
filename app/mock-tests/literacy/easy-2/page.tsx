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

const g5LaEasy2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 1 then answer the question.

"On Monday morning, Grade 5 students at Hopefield Primary prepared a display for Jamaica Day. One group arranged pictures of national heroes, while another labelled traditional foods such as ackee, bammy, and festival. Their teacher reminded them that the display should help younger students learn about Jamaican culture. By lunchtime, many children had stopped to read the labels and ask questions."

What is the MAIN idea of Passage 1?`,
    options: [
      "Students prepared a display about Jamaican culture",
      "Jamaica Day is always held on a Monday",
      "Younger students prefer food displays",
      "Teachers should decorate classrooms daily",
    ],
    correctAnswer: 0,
    explanation: `The passage mainly describes students preparing a Jamaica Day display to teach others about culture.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Using Passage 1, what did one group of students arrange?`,
    options: [
      "Traditional foods",
      "Pictures of national heroes",
      "Reading books",
      "Sports equipment",
    ],
    correctAnswer: 1,
    explanation: `The passage states that one group arranged pictures of national heroes.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Author's Purpose",
    question: `Why did the author most likely include Passage 1?`,
    options: [
      "To persuade readers to celebrate Jamaica Day every Monday",
      "To inform readers about students sharing Jamaican culture through a school display",
      "To entertain readers with an imaginary story about national heroes",
      "To explain how to prepare traditional Jamaican foods",
    ],
    correctAnswer: 1,
    explanation: `Passage 1 primarily informs readers about students creating a school display to share Jamaican culture with younger students.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `What can you infer from the fact that many children stopped to read the labels?`,
    options: [
      "The display caught their interest",
      "The labels were too difficult",
      "The children were late for class",
      "The teacher gave them a test",
    ],
    correctAnswer: 0,
    explanation: `If many children stopped to read and ask questions, the display likely interested them.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `In Passage 1, the word "labelled" most nearly means:`,
    options: [
      "tasted",
      "named",
      "carried",
      "hidden",
    ],
    correctAnswer: 1,
    explanation: `To label items means to name or identify them clearly.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Text Evidence",
    question: `Which detail best shows that the display was educational?`,
    options: [
      "It was prepared on Monday morning",
      "It included labels children could read",
      "It was finished before lunchtime",
      "Many children stopped by lunchtime.",
    ],
    correctAnswer: 1,
    explanation: `Labels helped students read information and learn from the display.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Sequence",
    question: `Which happened LAST in Passage 1?`,
    options: [
      "Students arranged pictures",
      "Students labelled foods",
      "Children stopped to ask questions",
      "The teacher gave instructions",
    ],
    correctAnswer: 2,
    explanation: `The passage ends with children stopping to read and ask questions by lunchtime.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Theme",
    question: `Which theme best fits Passage 1?`,
    options: [
      "Learning can be shared with others",
      "Food should never be displayed",
      "School work is always difficult",
      "Questions should be avoided",
    ],
    correctAnswer: 0,
    explanation: `The students created a display to share learning about culture with younger students.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Which statement is a FACT from Passage 1?`,
    options: [
      "Jamaica Day is the best school event",
      "Ackee is more delicious than festival",
      "Students labelled traditional foods",
      "Every child loved the display",
    ],
    correctAnswer: 2,
    explanation: `The passage directly states that students labelled traditional foods.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Summary",
    question: `Which sentence best summarises Passage 1?`,
    options: [
      "A class created a cultural display that helped other students learn",
      "A teacher prepared food for a school celebration",
      "Younger students asked questions about their homework",
      "National heroes visited Hopefield Primary on Jamaica Day",
    ],
    correctAnswer: 0,
    explanation: `This summary includes the main action and purpose of the passage.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Main Idea",
    question: `Read Passage 2 then answer the question.

"During the dry season, the principal at Willow Park Primary spoke to students about saving water. She explained that taps should be turned off tightly after use and that students should report leaking pipes quickly. The school also placed buckets near outdoor pipes to collect water for the garden. Within two weeks, the school was using less water each day."

What is the MAIN idea of Passage 2?`,
    options: [
      "The school garden needed new flowers",
      "Students learned ways to save water at school",
      "The principal wanted fewer outdoor pipes",
      "Buckets should be kept in every classroom",
    ],
    correctAnswer: 1,
    explanation: `The passage focuses on actions taken at school to save water.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Detail",
    question: `According to Passage 2, what should students report quickly?`,
    options: [
      "Leaking pipes",
      "Empty buckets",
      "Garden flowers",
      "Quiet classrooms",
    ],
    correctAnswer: 0,
    explanation: `The principal said students should report leaking pipes quickly.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `What was one effect of the school’s water-saving actions?`,
    options: [
      "The garden stopped growing",
      "The school used less water each day",
      "Students stopped washing their hands",
      "The dry season ended immediately",
    ],
    correctAnswer: 1,
    explanation: `The passage states that within two weeks the school was using less water each day.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `What can you infer about the principal?`,
    options: [
      "She wanted students to waste water",
      "She cared about responsible water use",
      "She disliked the school garden",
      "She wanted to close the school",
    ],
    correctAnswer: 1,
    explanation: `Her advice and school actions show that she cared about saving water responsibly.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Problem and Solution",
    question: `What problem is Passage 2 mainly responding to?`,
    options: [
      "Too many students were absent",
      "The school needed to save water",
      "The garden had too many buckets",
      "The classrooms had no posters",
    ],
    correctAnswer: 1,
    explanation: `The dry season created a need for the school to use water carefully.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Read the sentence.

"The students waited patiently while the librarian searched for the missing book."

What does "patiently" mean in this sentence?`,
    options: ["without rushing", "with anger", "in a loud way", "without listening"],
    correctAnswer: 0,
    explanation: `Waiting patiently means waiting calmly without rushing or complaining.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Read the sentence.

"After the heavy rain, the football field was muddy, so the players moved cautiously."

What does "cautiously" mean?`,
    options: ["carelessly", "carefully", "quickly", "angrily"],
    correctAnswer: 1,
    explanation: `The muddy field could be slippery, so the players moved carefully.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Multiple Meaning Words",
    question: `Which sentence uses "bank" to mean land beside water?`,
    options: ["Maya saved her money in the bank.", "The goat stood near the river bank.", "The bank opened at nine o'clock.", "Dad used his bank card at the shop."],
    correctAnswer: 1,
    explanation: `A river bank is the land along the side of a river.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Prefixes",
    question: `Read the sentence.

"The teacher asked Andre to reread the instruction before answering."

What does "reread" mean?`,
    options: ["read again", "read aloud", "read quickly", "read silently"],
    correctAnswer: 0,
    explanation: `The prefix "re-" means again, so reread means to read again.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `"The classroom buzzed like a busy hive before the quiz began."

What type of figurative language is used?`,
    options: ["metaphor", "simile", "personification", "contraction"],
    correctAnswer: 1,
    explanation: `The sentence compares the classroom to a busy hive using "like," so it is a simile.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Word Meaning in Context",
    question: `Read the sentence.

"The teacher gave clear instructions so everyone understood the task."

What does "clear" mean in this sentence?`,
    options: ["easy to understand", "made of glass", "completely empty", "very quiet"],
    correctAnswer: 0,
    explanation: `Clear instructions are easy to understand.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Suffixes",
    question: `What does the suffix "-ful" help tell the reader in the word "helpful"?`,
    options: ["without", "again", "full of", "before"],
    correctAnswer: 2,
    explanation: `The suffix "-ful" means full of, so helpful means full of help or useful.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Antonyms in Context",
    question: `Read the sentence.

"Although Malik felt nervous before the race, his sister remained calm."

Which word is the opposite of "nervous"?`,
    options: ["worried", "calm", "excited", "active"],
    correctAnswer: 1,
    explanation: `The sentence shows calm as the opposite of nervous.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Shades of Meaning",
    question: `Which word suggests the STRONGEST feeling of happiness?`,
    options: ["pleased", "content", "delighted", "fine"],
    correctAnswer: 2,
    explanation: `Delighted suggests a stronger feeling of happiness than the other choices.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Read the sentence.

"The abandoned house stood silent at the end of the road."

What does "abandoned" most likely mean?`,
    options: ["newly painted", "left empty", "carefully protected", "filled with people"],
    correctAnswer: 1,
    explanation: `Abandoned means left empty or no longer in use.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Sentence Editing",
    question: `Which sentence is written correctly?`,
    options: ["The children was waiting outside.", "The children were waiting outside.", "The children is waiting outside.", "The children be waiting outside."],
    correctAnswer: 1,
    explanation: `"Children" is plural, so "were" is the correct verb.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence uses punctuation correctly?`,
    options: ["We bought mangoes bananas and oranges.", "We bought mangoes, bananas, and oranges.", "We bought, mangoes bananas and oranges.", "We bought mangoes bananas, and oranges,"],
    correctAnswer: 1,
    explanation: `Commas correctly separate items in a list.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns in Context",
    question: `Choose the word that best completes the sentence.

"Simone and ___ are preparing the poster."`,
    options: ["me", "I", "my", "mine"],
    correctAnswer: 1,
    explanation: `"I" is the correct subject pronoun in this sentence.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the correct verb.

"Yesterday, the class ___ a science experiment."`,
    options: ["conduct", "conducts", "conducted", "conducting"],
    correctAnswer: 2,
    explanation: `"Yesterday" signals past tense, so "conducted" is correct.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Capitalisation",
    question: `Which sentence is written correctly?`,
    options: ["We visited kingston during the holiday.", "We visited Kingston during the holiday.", "We visited kingston During the holiday.", "we visited Kingston during the holiday."],
    correctAnswer: 1,
    explanation: `Kingston is a proper noun and must begin with a capital letter.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Sentence Completion",
    question: `Choose the best word to complete the sentence.

"The teacher smiled ___ the students completed the task."`,
    options: ["because", "under", "slowly", "between"],
    correctAnswer: 0,
    explanation: `"Because" correctly explains the reason for the smile.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Apostrophes",
    question: `Which sentence shows possession correctly?`,
    options: ["The boys bag was torn.", "The boy's bag was torn.", "The boys's bag was torn.", "The boys' bag's was torn."],
    correctAnswer: 1,
    explanation: `The apostrophe shows that the bag belongs to the boy.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Contractions",
    question: `Which word is the correct contraction for "they are"?`,
    options: ["their", "theyre", "they're", "there"],
    correctAnswer: 2,
    explanation: `"They are" becomes "they're."`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: ["Running across the field.", "Because the rain started suddenly.", "The students packed their bags and left.", "After finishing the worksheet."],
    correctAnswer: 2,
    explanation: `A complete sentence has a subject and a complete thought.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: `Choose the best word.

"The principal asked students to speak ___ in the library."`,
    options: ["quietly", "quiet", "quieter", "quietness"],
    correctAnswer: 0,
    explanation: `An adverb is needed to describe how students should speak.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `A student writes a letter asking the principal for more shade in the play area.

What is the MAIN purpose of the letter?`,
    options: ["to entertain", "to persuade", "to describe a game", "to retell a story"],
    correctAnswer: 1,
    explanation: `The student is trying to convince the principal to make a change.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Audience",
    question: `A safety notice about wet floors is mainly written for:`,
    options: ["school visitors and students", "only the school principal", "students taking part in sports", "parents attending a scheduled meeting"],
    correctAnswer: 0,
    explanation: `A general wet-floor safety notice is for school visitors and students because anyone walking through the area may need the warning; the other audiences are too narrow.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports the topic sentence:

"Reading every day improves learning."`,
    options: ["Books come in many colours.", "Daily reading helps students build vocabulary and understanding.", "Some libraries close early.", "My favourite chair is blue."],
    correctAnswer: 1,
    explanation: `This directly supports the idea that daily reading improves learning.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Paragraph Organisation",
    question: `What should usually come after a topic sentence in a paragraph?`,
    options: ["supporting details", "a new title", "an unrelated joke", "another topic sentence"],
    correctAnswer: 0,
    explanation: `Supporting details explain and develop the main idea.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Descriptive Writing",
    question: `Which sentence uses the strongest descriptive language?`,
    options: ["The small bird flew quickly toward the tall tree.", "The bright blue bird soared gracefully across the cloudless sky.", "The colourful bird moved quietly beside the green bushes.", "The young bird rested briefly on a narrow branch."],
    correctAnswer: 1,
    explanation: `The words "bright blue," "soared gracefully," and "cloudless sky" create the clearest and most vivid picture through precise description and strong verb choice.`
  },
]

const extractPassage = (sourceQuestion: string) =>
  sourceQuestion.split("\n\n").slice(1, -1).join("\n\n")

const READING_PASSAGES = {
  1: extractPassage(g5LaEasy2Questions.find((question) => question.id === 1)!.question),
  2: extractPassage(g5LaEasy2Questions.find((question) => question.id === 11)!.question),
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

export default function G5LaEasy2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy2Questions : g5LaEasy2Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const calcScore  = (): number => answers.reduce<number>((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct   = (): number => Math.round((calcScore() / totalQuestions) * 100)

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    const completedAtIso = new Date().toISOString()
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Easy 2",
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
      ? prepareAssessment(g5LaEasy2Questions)
      : preparePreview(g5LaEasy2Questions, FREE_QUESTION_LIMIT)
    setRandomizedQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    hasSavedResult.current = false
    setShowResults(false)
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
  const showPassagePanel = Boolean(passageText && q && !PASSAGE_BEARING_QUESTION_IDS.has(q.id))
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 2</CardTitle>
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
              <p className="text-slate-600">Language Arts Easy 2</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 2</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
