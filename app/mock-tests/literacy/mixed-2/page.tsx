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

const P1 = `Reading widely is one of the most valuable habits a young person can develop. Each book opens a doorway into a different world—a different time, a different culture, or a different way of thinking. Students who read for pleasure often develop larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own.

Research suggests that reading for even twenty minutes each day can support learning across several subjects. A student who reads a science article may encounter new facts and technical words. A historical novel may help the reader imagine how people lived in another period. A biography can show how a real person responded to difficulty, failure, or opportunity.

However, developing a reading habit is not always easy. Screens, games, social media, chores, and other activities compete for attention. Some students also believe they dislike reading because they have not yet found material that matches their interests. A child who avoids long novels may enjoy short mysteries, comics, sports reports, magazines, or audiobooks.

Many educators therefore argue that technology should not be treated only as an enemy of reading. E-books can make many titles available on one device. Audiobooks allow students to listen while following the written text. Reading apps can help readers set goals, learn unfamiliar words, and track progress. These tools are most helpful when they support focused reading rather than constantly interrupting it.

The type of book matters less than the quality of attention the reader gives it. Reading should not become a race to finish the greatest number of pages. Strong readers pause to ask questions, make predictions, connect ideas, and reconsider what they think. They sometimes reread a difficult paragraph instead of rushing past it.

A lasting reading habit is usually built through small, regular choices. Setting aside a quiet time, keeping a book nearby, visiting a library, and sharing recommendations with friends can all help. Twenty thoughtful minutes may seem small, but repeated day after day, those minutes can open many doors.`

const g5LaMix2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

${P1}

What is the passage mainly about?`,
    options: [
      "The benefits of reading and practical ways to build a lasting reading habit",
      "Why printed books should replace technology",
      "How students can finish books as quickly as possible",
      "Why every student should read the same kind of book"
    ],
    correctAnswer: 0,
    explanation: `The passage explains the benefits of reading, acknowledges barriers, and suggests practical ways to develop the habit.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P1}

Which benefit of reading is directly mentioned in the passage?`,
    options: [
      "Improved athletic ability",
      "Stronger writing skills",
      "Faster running speed",
      "Better eyesight"
    ],
    correctAnswer: 1,
    explanation: `The passage states that students who read for pleasure often develop stronger writing skills.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

Why might a student who says, “I do not like reading,” change that opinion?`,
    options: [
      "The student may be forced to read longer novels.",
      "The student may stop using all technology.",
      "The student may discover reading material that matches personal interests.",
      "The student may avoid visiting libraries."
    ],
    correctAnswer: 2,
    explanation: `The passage suggests that some students have not yet found material suited to their interests.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

${P1}

Why does the author mention comics, sports reports, magazines, and audiobooks?`,
    options: [
      "To prove that novels are no longer useful",
      "To argue that students should avoid challenging texts",
      "To advertise particular products",
      "To show that worthwhile reading can take different forms"
    ],
    correctAnswer: 3,
    explanation: `These examples show that students can build reading habits through many kinds of material.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

${P1}

According to the passage, what is one likely effect of reading a biography?`,
    options: [
      "The reader may understand how a real person handled challenges.",
      "The reader will automatically become famous.",
      "The reader will no longer need teachers.",
      "The reader will learn only scientific vocabulary."
    ],
    correctAnswer: 0,
    explanation: `The passage says biographies can show how real people responded to difficulty, failure, or opportunity.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P1}

How does the passage compare focused reading with racing through pages?`,
    options: [
      "Both are described as equally useful.",
      "Focused reading involves thinking, while racing values speed over understanding.",
      "Racing is recommended for difficult books.",
      "Focused reading requires reading only printed books."
    ],
    correctAnswer: 1,
    explanation: `The author values questioning, predicting, connecting, and rereading rather than simply finishing quickly.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P1}

What can the reader conclude about technology from the passage?`,
    options: [
      "Technology always prevents students from learning.",
      "Technology should replace libraries completely.",
      "Technology can support reading when it is used carefully and purposefully.",
      "Technology is useful only for listening to books."
    ],
    correctAnswer: 2,
    explanation: `The passage presents e-books, audiobooks, and apps as useful when they support focused reading.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

${P1}

In the final sentence, the phrase “open many doors” suggests that reading can`,
    options: [
      "teach readers how to build doors",
      "make every task easy",
      "replace all other school subjects",
      "create many opportunities for learning and growth"
    ],
    correctAnswer: 3,
    explanation: `The phrase is figurative and refers to new opportunities, ideas, and experiences.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P1}

Which detail best supports the claim that small daily choices can build a reading habit?`,
    options: [
      "Twenty thoughtful minutes repeated each day can make a difference.",
      "Some books are very long.",
      "Libraries contain many shelves.",
      "Students sometimes use social media."
    ],
    correctAnswer: 0,
    explanation: `The final paragraph directly explains how regular daily reading builds a lasting habit.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.

${P1}

What would the author most likely recommend to a student who struggles with long novels?`,
    options: [
      "Stop reading until secondary school",
      "Try shorter texts or formats connected to the student's interests",
      "Read only dictionaries",
      "Choose the longest available book"
    ],
    correctAnswer: 1,
    explanation: `The passage recommends alternatives such as mysteries, comics, reports, magazines, and audiobooks.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

${P1}

Which word best describes the tone of the passage?`,
    options: [
      "Mocking",
      "Angry",
      "Encouraging",
      "Hopeless"
    ],
    correctAnswer: 2,
    explanation: `The author acknowledges challenges but offers practical, hopeful strategies.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Read the passage then answer the question.

${P1}

Which statement is presented as an opinion or recommendation rather than a directly testable fact?`,
    options: [
      "Audiobooks contain recorded speech.",
      "Some reading apps track progress.",
      "Books can be stored on electronic devices.",
      "Students should give careful attention to what they read."
    ],
    correctAnswer: 3,
    explanation: `The claim about what students should do is a recommendation rather than a directly testable fact.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

${P1}

How is the passage mainly organised?`,
    options: [
      "A problem is described, benefits are explained, and practical solutions are offered.",
      "Events are presented in the order they happened during one day.",
      "Two fictional characters argue throughout the passage.",
      "Instructions are given without any explanation."
    ],
    correctAnswer: 0,
    explanation: `The passage explains benefits, identifies barriers, and then offers strategies and solutions.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Synthesis",
    question: `Read the passage then answer the question.

${P1}

Which statement best combines two major ideas from the passage?`,
    options: [
      "Reading matters only when students choose printed novels.",
      "Reading is valuable, and technology can help when used with focus.",
      "Technology makes thoughtful reading impossible.",
      "The number of pages read is more important than understanding."
    ],
    correctAnswer: 1,
    explanation: `The passage supports reading while explaining that carefully used technology can strengthen the habit.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Summary",
    question: `Read the passage then answer the question.

${P1}

Which sentence is the best summary of the passage?`,
    options: [
      "Reading twenty minutes daily guarantees perfect grades.",
      "Students should remove every screen from their homes.",
      "Regular, thoughtful reading in suitable formats can strengthen skills, understanding, and empathy.",
      "Only difficult books help young people learn."
    ],
    correctAnswer: 2,
    explanation: `This choice captures the passage's central ideas without adding unsupported claims.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is closest in meaning to “valuable”?`,
    options: [
      "costly",
      "hidden",
      "ordinary",
      "useful"
    ],
    correctAnswer: 3,
    explanation: `In the passage, valuable means useful or important.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word is the opposite of “focused”?`,
    options: [
      "distracted",
      "attentive",
      "careful",
      "prepared"
    ],
    correctAnswer: 0,
    explanation: `Focused means giving close attention; distracted means unable to keep attention on the task.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The prefix “re-” in “reread” means`,
    options: [
      "before",
      "again",
      "without",
      "under"
    ],
    correctAnswer: 1,
    explanation: `To reread means to read again.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The suffix “-ful” in “thoughtful” suggests`,
    options: [
      "without thought",
      "able to read quickly",
      "full of thought or careful consideration",
      "related to technology"
    ],
    correctAnswer: 2,
    explanation: `Thoughtful means showing careful thought or consideration.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In the passage, “compete for attention” means that several activities`,
    options: [
      "work together quietly",
      "are all completed at once",
      "become easier with practice",
      "try to gain a person's limited time and focus"
    ],
    correctAnswer: 3,
    explanation: `Games, social media, chores, and other activities all try to take the student's attention.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses “track” in the same way as “track progress”?`,
    options: [
      "The teacher used a chart to track each student's reading.",
      "The runners trained on the track.",
      "The animal left tracks in the mud.",
      "The train moved along the track."
    ],
    correctAnswer: 0,
    explanation: `Here, track means to monitor or record progress over time.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Library is to books as gallery is to`,
    options: [
      "readers",
      "paintings",
      "shelves",
      "stories"
    ],
    correctAnswer: 1,
    explanation: `A library contains and displays books, while a gallery contains and displays paintings or other artworks.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase could best replace “set aside” in “setting aside a quiet time”?`,
    options: [
      "cancel completely",
      "forget about",
      "reserve for a purpose",
      "divide into pieces"
    ],
    correctAnswer: 2,
    explanation: `Set aside means to reserve time for a particular purpose.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `What does “recommendation” mean?`,
    options: [
      "a rule that must never be questioned",
      "a list of difficult words",
      "a record of past mistakes",
      "a suggestion about what may be useful or suitable"
    ],
    correctAnswer: 3,
    explanation: `A recommendation is advice or a suggestion about a suitable choice.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Precise Word Choice",
    question: `Which word best completes the sentence? “The student _____ the difficult paragraph to understand it better.”`,
    options: [
      "reread",
      "ignored",
      "rushed",
      "removed"
    ],
    correctAnswer: 0,
    explanation: `Reread precisely describes reading the paragraph again for better understanding.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "A collection of short stories are on the table.",
      "A collection of short stories is on the table.",
      "A collection of short stories were on the table.",
      "A collection of short stories be on the table."
    ],
    correctAnswer: 1,
    explanation: `The subject collection is singular, so it takes the singular verb is.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Pronouns",
    question: `Which sentence uses the pronoun correctly?`,
    options: [
      "Me and Jada visited the library.",
      "Her and Jada visited the library.",
      "Jada and I visited the library.",
      "Jada gave I the book."
    ],
    correctAnswer: 2,
    explanation: `I is the correct subject pronoun in the compound subject Jada and I.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Mika chose a book and begins reading.",
      "Mika chooses a book and began reading.",
      "Mika will choose a book and began reading.",
      "Mika chose a book and began reading."
    ],
    correctAnswer: 3,
    explanation: `Chose and began are both past-tense verbs.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After reading for twenty minutes, Kofi closed the book.",
      "After reading for twenty minutes Kofi closed the book.",
      "After, reading for twenty minutes Kofi closed the book.",
      "After reading, for twenty minutes, Kofi closed the book."
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
      "\"This story is exciting\" Maya said.",
      "\"This story is exciting,\" Maya said.",
      "This story is exciting,\" Maya said.",
      "\"This story is exciting, Maya said.\""
    ],
    correctAnswer: 1,
    explanation: `The spoken words are enclosed in quotation marks, and the comma appears before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence contains a correctly used relative pronoun?`,
    options: [
      "The book who I borrowed was exciting.",
      "The librarian which helped me was kind.",
      "The story that won the prize was written by a student.",
      "The student which read aloud spoke clearly."
    ],
    correctAnswer: 2,
    explanation: `That correctly introduces a clause describing the story.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which sentence best combines the ideas? “The book was long. It remained interesting.”`,
    options: [
      "The book was long, it remained interesting.",
      "Although the book was long, but it remained interesting.",
      "The book long and remained interesting.",
      "Although the book was long, it remained interesting."
    ],
    correctAnswer: 3,
    explanation: `Although correctly shows contrast and avoids a run-on sentence.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which sentence correctly repairs the run-on? “I finished the chapter I wrote a summary.”`,
    options: [
      "I finished the chapter and wrote a summary.",
      "I finished the chapter, I wrote a summary.",
      "I finished the chapter wrote a summary.",
      "Finishing the chapter and I wrote a summary."
    ],
    correctAnswer: 0,
    explanation: `The conjunction and correctly joins the related actions.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? “Printed books are useful; _____, e-books can also support reading.”`,
    options: [
      "however",
      "similarly",
      "for example",
      "because"
    ],
    correctAnswer: 1,
    explanation: `Similarly shows that e-books can provide a comparable benefit.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Precise Word Choice",
    question: `Which verb is most precise? “The class _____ the author's main argument.”`,
    options: [
      "looked",
      "found",
      "analysed",
      "did"
    ],
    correctAnswer: 2,
    explanation: `Analysed precisely describes careful examination of the author's argument.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which is the strongest introduction for a paragraph about daily reading?`,
    options: [
      "A regular reading routine can help students practise skills they use across many school subjects.",
      "Students who make time for reading each day encounter a wide range of ideas, words, and stories.",
      "Choosing suitable books and setting aside a quiet time can make reading easier to continue each day.",
      "Just twenty thoughtful minutes of reading each day can strengthen a student's skills and imagination."
    ],
    correctAnswer: 3,
    explanation: "The keyed introduction is concise and engaging, and it previews both skill growth and imagination rather than only routine or process."
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which detail best supports the topic sentence “Reading helps students understand other people”?`,
    options: [
      "Stories allow readers to experience situations from another person's point of view.",
      "Readers often discover unfamiliar words when they read stories from different settings.",
      "Characters may face problems that keep readers interested in what happens next.",
      "Books can introduce readers to places and events that they have never experienced themselves."
    ],
    correctAnswer: 0,
    explanation: "The keyed detail directly supports understanding other people by showing how stories let readers experience another person's perspective."
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition best adds another benefit? “Reading develops vocabulary. _____, it can strengthen writing skills.”`,
    options: [
      "However",
      "Furthermore",
      "Instead",
      "Otherwise"
    ],
    correctAnswer: 1,
    explanation: `Furthermore adds another related supporting point.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Which sentence should be removed from this paragraph?

(1) A quiet reading routine can improve concentration. (2) Choosing a regular time helps the habit become familiar. (3) The school library displays student book reviews near the entrance. (4) Turning off unnecessary notifications can reduce distractions.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 3",
      "Sentence 4"
    ],
    correctAnswer: 2,
    explanation: "The library display is related to reading generally, but it does not explain how a student can build and maintain a focused reading routine."
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which is the strongest conclusion for an essay about developing a reading habit?`,
    options: [
      "A regular reading routine can strengthen useful skills that students continue using as they grow.",
      "Choosing books carefully and making time to read can help students become more confident readers.",
      "Reading regularly can expose students to new ideas and encourage them to keep learning beyond the classroom.",
      "By choosing suitable material and reading thoughtfully each day, students can build a habit that continues opening doors throughout life."
    ],
    correctAnswer: 3,
    explanation: "The keyed conclusion best synthesises suitable material, thoughtful daily practice, and the long-term value of reading."
  }
];

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaMix2Questions : g5LaMix2Questions.slice(0, FREE_QUESTION_LIMIT)
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
      testName: "Mixed 2",
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
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaMix2Questions)
      : preparePreview(g5LaMix2Questions, FREE_QUESTION_LIMIT)
    setRandomizedQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 2</CardTitle>
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
              <p className="text-slate-700">This mixed-level test uses reading as its central theme while assessing comprehension, vocabulary, grammar, and writing across a balanced range of Grade 5 skills.</p>
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
              <p className="text-slate-600">Language Arts Mixed 2</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 2</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
