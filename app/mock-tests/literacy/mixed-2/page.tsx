"use client"

import { useState, useEffect, useCallback } from "react"
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

const g5LaMix2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

What is this passage MAINLY about?`,
    options: [
      "How to use e-books",
      "The benefits of reading widely and how to build the reading habit in a digital world",
      "Why schools fail to teach reading",
      "The history of books",
    ],
    correctAnswer: 1,
    explanation: `The passage argues for the value of reading, presents evidence of its benefits, then addresses the challenge of building the habit in a digital era.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

According to the passage, how long should a student read daily to significantly improve academic performance?`,
    options: [
      "One hour",
      "Thirty minutes",
      "Twenty minutes",
      "Ten minutes",
    ],
    correctAnswer: 2,
    explanation: `The passage states 'reading for just twenty minutes a day significantly improves academic performance across all subjects.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

The word 'empathy' in the passage means:`,
    options: [
      "academic skill",
      "physical strength",
      "the ability to understand and share the feelings of others",
      "speed of reading",
    ],
    correctAnswer: 2,
    explanation: `'Empathy' is the capacity to understand and share what others feel — the passage links it to reading about different lives.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

Which of the following does the passage NOT mention as a benefit of reading?`,
    options: [
      "Larger vocabulary",
      "Better writing skills",
      "Improved athletic performance",
      "Deeper empathy",
    ],
    correctAnswer: 2,
    explanation: `The passage lists vocabulary, writing skills, and empathy as benefits — but never mentions athletic performance.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

Which statement from the passage is a FACT that could be tested?`,
    options: [
      "Reading is the most powerful habit a young person can develop",
      "Reading for twenty minutes a day significantly improves academic performance",
      "E-books are better than printed books",
      "Finding time to read is a serious challenge",
    ],
    correctAnswer: 1,
    explanation: `The twenty-minutes claim is presented as research-backed — a verifiable factual claim. The others are opinions or judgements.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

What does the phrase 'a doorway into a different world' suggest about books?`,
    options: [
      "Books are physically large",
      "Books are expensive",
      "Reading transports the reader into new experiences, perspectives, and realities",
      "Books are about travel",
    ],
    correctAnswer: 2,
    explanation: `The doorway metaphor implies books are portals — they provide access to entirely different worlds of experience and understanding.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

The author presents a problem (screens and social media) and then a solution (technology used wisely). Why is this structure effective?`,
    options: [
      "It makes the passage longer",
      "It confuses the reader",
      "It acknowledges a real obstacle and then offers a practical, balanced response — making the argument more credible",
      "It avoids the main point",
    ],
    correctAnswer: 2,
    explanation: `Presenting a problem then a nuanced solution shows intellectual honesty — the author doesn't ignore obstacles but addresses them constructively.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

The tone of this passage is BEST described as:`,
    options: [
      "Angry at screen users",
      "Entirely negative about technology",
      "Balanced and encouraging — making a case for reading while acknowledging real challenges",
      "Indifferent to the topic",
    ],
    correctAnswer: 2,
    explanation: `The passage is positive about reading, honest about challenges, and ends with a practical solution — a balanced, constructive tone.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

According to the passage, what effect does reading widely have on empathy?`,
    options: [
      "No effect",
      "Reading widely decreases empathy",
      "Students develop deeper empathy for people whose lives differ from their own",
      "Only some students develop empathy through reading",
    ],
    correctAnswer: 2,
    explanation: `The passage directly links wide reading to 'deeper empathy for people whose lives differ from their own.'`
  },
  {
    id: 10,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

'Each book opens a doorway into a different world.' What is this figure of speech?`,
    options: [
      "Simile",
      "Alliteration",
      "Metaphor — directly comparing a book to a doorway without using 'like' or 'as'",
      "Personification",
    ],
    correctAnswer: 2,
    explanation: `This is a metaphor — 'is a doorway' directly compares the book to a door, without 'like' or 'as.'`
  },
  {
    id: 11,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

A sceptical reader might challenge the claim that 'reading for twenty minutes a day significantly improves academic performance.' What question would they ask?`,
    options: [
      "Is twenty minutes too short?",
      "Was this research conducted in Jamaica specifically, and are those findings applicable here?",
      "Should students read less?",
      "Are books expensive?",
    ],
    correctAnswer: 1,
    explanation: `A critical reader questions the applicability of research — is this finding universal or context-specific? Were Jamaican students part of the study?`
  },
  {
    id: 12,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

What is the author's IMPLICIT argument about technology?`,
    options: [
      "Technology is destroying literacy",
      "Technology and reading are incompatible",
      "Technology is not inherently the enemy of reading — it depends on how it is used",
      "All students prefer technology to books",
    ],
    correctAnswer: 2,
    explanation: `The author's suggestion to use e-books and audiobooks implies technology can support reading — the problem is careless use, not technology itself.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

The CENTRAL theme of this passage is:`,
    options: [
      "Technology is dangerous",
      "School is the most important place to learn",
      "The habit of reading, built wisely and consistently, is one of the most valuable investments a young person can make",
      "Only long books have value",
    ],
    correctAnswer: 2,
    explanation: `The passage consistently argues for reading's profound value and argues that the habit can be built even in a digital age.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

Which BEST summarises this passage?`,
    options: [
      "Students should avoid all technology",
      "Reading books is boring but useful",
      "Wide reading builds vocabulary, empathy, and academic skills, and technology — used wisely — can help build the reading habit",
      "Academic performance is not important",
    ],
    correctAnswer: 2,
    explanation: `This captures the benefits, the challenge, and the solution — the complete arc of the passage's argument.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Reading widely is one of the most powerful habits a young person can develop. Each book opens a doorway into a different world — a different time, a different culture, a different way of thinking. Students who read for pleasure tend to have larger vocabularies, stronger writing skills, and deeper empathy for people whose lives differ from their own. Research consistently shows that reading for just twenty minutes a day significantly improves academic performance across all subjects. Yet in a world of screens and social media, finding time and motivation to read can feel like a challenge. The answer, many educators argue, is not to fight technology, but to use it wisely — e-books, audiobooks, and reading apps can all help build the habit."

When the author says the answer is 'not to fight technology, but to use it wisely,' they imply:`,
    options: [
      "Technology is always harmful",
      "Fighting technology is always the best approach",
      "A rigid anti-technology stance misses the opportunity technology provides to support positive habits like reading",
      "Students should use only social media",
    ],
    correctAnswer: 2,
    explanation: `'Not to fight but to use wisely' implies that the problem is not technology itself but the absence of intentionality — a nuanced, practical position.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'extensive'?`,
    options: [
      "limited",
      "narrow",
      "short",
      "wide-ranging",
    ],
    correctAnswer: 3,
    explanation: `'Wide-ranging' means covering a large area or many topics — a synonym for 'extensive.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'motivate' is:`,
    options: [
      "inspire",
      "encourage",
      "discourage",
      "energise",
    ],
    correctAnswer: 2,
    explanation: `'Discourage' means to reduce someone's confidence or willingness — the opposite of 'motivate.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The teacher used INNOVATIVE methods that students had never experienced before. 'Innovative' means:`,
    options: [
      "old-fashioned and proven",
      "creative, new, and original",
      "strict and traditional",
      "simple and repetitive",
    ],
    correctAnswer: 1,
    explanation: `'Innovative' describes new and creative approaches — methods that break from tradition to try something fresh.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'She devoured every book she could find.' The word 'devoured' here means:`,
    options: [
      "ate the books literally",
      "read the books very quickly and eagerly",
      "destroyed the books",
      "collected the books",
    ],
    correctAnswer: 1,
    explanation: `'Devoured' is a metaphor for reading eagerly and quickly — like consuming food enthusiastically.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Words are the building blocks of the mind.' This metaphor suggests:`,
    options: [
      "Words are made of concrete",
      "The mind is a physical building",
      "Words are the fundamental materials from which thought and intelligence are constructed",
      "Only writers need words",
    ],
    correctAnswer: 2,
    explanation: `Like building blocks that construct structures, words are the basic units from which ideas, knowledge, and thinking are built.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which sentence uses the word 'curious' with a POSITIVE connotation?`,
    options: [
      "That's a curious smell — something must have gone wrong",
      "His curious questions led to groundbreaking discoveries",
      "She gave a curious look and quickly walked away",
      "The curious stain appeared on the wall",
    ],
    correctAnswer: 1,
    explanation: `'Curious questions' here means driven by intellectual curiosity — a positive, admirable quality linked to discovery.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'literacy' means:`,
    options: [
      "the ability to do mathematics",
      "skill in reading and writing",
      "knowledge of science",
      "physical fitness",
    ],
    correctAnswer: 1,
    explanation: `'Literacy' refers to the ability to read and write — and more broadly, to competence in using written language.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Extended Metaphor",
    question: `A writer describes the mind as a 'garden: some thoughts are flowers, others are weeds.' In this metaphor, 'weeding' the garden would represent:`,
    options: [
      "physical gardening",
      "random thinking",
      "deliberately removing harmful or unproductive thoughts from the mind",
      "adding more information",
    ],
    correctAnswer: 2,
    explanation: `The extended metaphor maps garden maintenance onto mental activity — weeding = removing negative or unhelpful thoughts.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'educate' comes from the Latin 'educere' meaning 'to lead out.' This suggests:`,
    options: [
      "Education means teaching facts",
      "Education is simply instruction from teacher to student",
      "True education draws out what is already within the learner — it reveals potential rather than just filling a vessel",
      "Education is always formal",
    ],
    correctAnswer: 2,
    explanation: `The etymology reveals that education is about drawing out, not filling up — a philosophy that prioritises the student's inner capacity.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In an essay, 'furthermore' is used to:`,
    options: [
      "contradict the previous point",
      "end the essay",
      "add an additional point that supports the same argument",
      "introduce a counterargument",
    ],
    correctAnswer: 2,
    explanation: `'Furthermore' adds supporting information — it means 'and in addition, here is more evidence for the same point.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Verbs",
    question: `Which sentence contains an ACTION VERB?`,
    options: [
      "The book seems interesting",
      "She appears confident",
      "Reading improves vocabulary",
      "The library is quiet",
    ],
    correctAnswer: 2,
    explanation: `'Improves' is an action verb — it describes what reading does.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adverbs",
    question: `Which word is an ADVERB in: 'Students who read regularly perform consistently better.'?`,
    options: [
      "students",
      "perform",
      "better",
      "regularly",
    ],
    correctAnswer: 3,
    explanation: `'Regularly' describes HOW students read — it is an adverb of frequency modifying 'read.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which is a COMPLEX sentence?`,
    options: [
      "She reads every night",
      "She reads every night and she sleeps well",
      "Although she was tired, she finished her book",
      "Reading and sleeping are both important",
    ],
    correctAnswer: 2,
    explanation: `A complex sentence = main clause + subordinate clause. 'Although she was tired' is the subordinate clause.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Rewrite in ACTIVE VOICE: 'Books are read by millions of students every day.'`,
    options: [
      "Millions of students are reading books every day",
      "Millions of students read books every day",
      "Books will be read by millions",
      "Reading is done by millions daily",
    ],
    correctAnswer: 1,
    explanation: `Active: subject (millions of students) performs the action (read) on the object (books).`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'Reading has changed my life,' she told her teacher.`,
    options: [
      "She told her teacher that reading has changed her life",
      "She told her teacher that reading had changed her life",
      "She told her teacher reading changes life",
      "She said reading changes my life",
    ],
    correctAnswer: 1,
    explanation: `Reported speech shifts 'has changed' (present perfect) to 'had changed' (past perfect) and 'my' to 'her.'`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conditional Sentence",
    question: `Which is a FIRST CONDITIONAL sentence (realistic future)?`,
    options: [
      "If she reads, she will improve",
      "If she read, she would improve",
      "If she had read, she would have improved",
      "She improves when she reads",
    ],
    correctAnswer: 0,
    explanation: `First conditional: if + present simple, will + infinitive. Shows a realistic future outcome.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Gerunds",
    question: `In 'Reading widely expands the mind,' 'Reading' functions as:`,
    options: [
      "a verb",
      "an adjective",
      "a noun (gerund) — the subject of the sentence",
      "an adverb",
    ],
    correctAnswer: 2,
    explanation: `A gerund is a verb form (-ing) acting as a noun. 'Reading' is the subject here.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Fronting for Emphasis",
    question: `'Only by reading widely can a student truly develop empathy.' What grammatical feature does this sentence use?`,
    options: [
      "A relative clause",
      "Passive voice",
      "Inversion — the auxiliary 'can' comes before the subject for emphasis",
      "A conditional structure",
    ],
    correctAnswer: 2,
    explanation: `Inversion after a negative or restrictive adverb ('Only by...') places the auxiliary before the subject: 'can a student' instead of 'a student can.'`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Ellipsis",
    question: `In 'She prefers fiction, her brother non-fiction,' words have been left out. What is missing?`,
    options: [
      "She prefers",
      "her brother prefers",
      "fiction and",
      "her brother reading",
    ],
    correctAnswer: 1,
    explanation: `The second clause omits 'prefers' (understood from context): 'her brother [prefers] non-fiction.' This is grammatical ellipsis.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Nominalisation",
    question: `Which sentence uses NOMINALISATION (converting a verb to a noun)?`,
    options: [
      "She improved significantly after reading more",
      "Her improvement was significant after reading more",
      "She reads and improves her skills",
      "Reading made her improve",
    ],
    correctAnswer: 1,
    explanation: `'Improvement' is the nominalised form of 'improved' — converting the verb to a noun makes the sentence more formal and abstract.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Audience and Register",
    question: `A student writes a reading list recommendation for peers her own age. Which tone is MOST appropriate?`,
    options: [
      "Very formal academic language",
      "Casual, enthusiastic, and accessible — like a recommendation from a trusted friend",
      "Extremely technical literary analysis",
      "Impersonal and detached",
    ],
    correctAnswer: 1,
    explanation: `A recommendation to peers should be warm, accessible, and enthusiastic — formal language would create distance.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Persuasive Technique — Anecdote",
    question: `A persuasive essay opens with a short story about a student who struggled until she started reading for pleasure. This technique is called:`,
    options: [
      "A rhetorical question",
      "A statistic",
      "An anecdote — a brief personal story used to make an argument feel real and relatable",
      "An extended metaphor",
    ],
    correctAnswer: 2,
    explanation: `An anecdote opens with a human story — making the argument immediately concrete, relatable, and emotionally engaging.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Linking Ideas",
    question: `Which sentence BEST links a paragraph arguing that reading improves vocabulary to a new paragraph about academic performance?`,
    options: [
      "Reading is also good for other things",
      "These vocabulary gains do not stand alone — they translate directly into stronger academic performance across all subjects.",
      "Next I will talk about academic performance",
      "Academic performance is also improved",
    ],
    correctAnswer: 1,
    explanation: `'These vocabulary gains do not stand alone' creates cohesion — it connects the previous point to the next while signalling the argument is building.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Counter-Argument",
    question: `A student argues 'reading is always better than screen time.' A stronger essay would:`,
    options: [
      "Ignore all opposing views",
      "Only quote experts who agree",
      "Acknowledge that screens can support reading (e-books, audiobooks) before explaining why the reading habit matters regardless of format",
      "Argue that screens are evil",
    ],
    correctAnswer: 2,
    explanation: `Acknowledging and addressing a counterargument shows intellectual honesty and strengthens the overall argument — it shows the writer has considered multiple views.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Evaluating a Text",
    question: `When EVALUATING whether a writer is effective in persuading readers to value reading, a student should:`,
    options: [
      "Simply say whether they liked the text",
      "Count how many sentences the writer uses",
      "Identify specific techniques the writer uses, explain their effect, and judge how successfully the writer achieves their purpose",
      "Summarise the entire text",
    ],
    correctAnswer: 2,
    explanation: `Evaluation = identification of technique + effect + judgement of success. All three steps are required for a complete evaluative response.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix2Questions : g5LaMix2Questions.slice(0, FREE_QUESTION_LIMIT)
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
              <p className="text-slate-700">This test blends easy, moderate, and challenging questions across reading, vocabulary, grammar, and writing — giving you a complete picture of your Grade 5 Language Arts skills.</p>
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
              ? <Button onClick={() => setShowResults(true)} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
