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

const g5LaMix7Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What is the CENTRAL subject of this passage?`,
    options: [
      "An unrelated topic",
      "A minor background detail",
      "The main topic of the passage, explored through evidence and argument",
      "The writer's personal history",
    ],
    correctAnswer: 2,
    explanation: `The passage introduces its subject and builds a sustained argument about its significance — the central subject unifies all the details.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

Which specific detail from the passage directly supports the main argument?`,
    options: [
      "An opening sentence only",
      "The passage contains no specific details",
      "At least one verifiable, specific detail that supports the main claim",
      "Only the final sentence",
    ],
    correctAnswer: 2,
    explanation: `Details in a well-constructed passage serve the central argument — identifying the most supportive detail shows purposeful reading.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

Based on context, what does the MOST IMPORTANT descriptive word or phrase in the passage convey?`,
    options: [
      "A minor physical characteristic",
      "An irrelevant quality",
      "A quality central to the passage's argument — significant, complex, or uniquely valuable",
      "A technical scientific term with no broader meaning",
    ],
    correctAnswer: 2,
    explanation: `The most important word in an analytical passage carries the argument — it signals the quality that makes the subject matter.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

Which statement is DIRECTLY stated in the passage?`,
    options: [
      "A personal opinion of the reader",
      "An inference not supported by the text",
      "A verifiable fact explicitly present in the passage",
      "An idea completely absent from the passage",
    ],
    correctAnswer: 2,
    explanation: `Literal comprehension distinguishes between what is stated and what is inferred — the skill is identifying what is explicitly present in the text.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What specific cause-and-effect relationship does the passage describe?`,
    options: [
      "Events happen without causes",
      "All events are equally important",
      "A specific condition or action leads to a significant outcome that the writer considers important",
      "The writer makes no causal claims",
    ],
    correctAnswer: 2,
    explanation: `Strong analytical passages identify causation — showing HOW one thing leads to another, not just that two things exist.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What does the passage IMPLY but not directly state?`,
    options: [
      "Nothing — the passage states everything explicitly",
      "An unrelated idea",
      "A deeper significance beyond the surface facts — something the reader must infer from the language, structure, or argument",
      "That the writer has no opinion",
    ],
    correctAnswer: 2,
    explanation: `Inference is the skill of reading beyond explicit statements — identifying what the text suggests through its choices.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

How does the author make their argument more persuasive?`,
    options: [
      "By presenting only one fact",
      "By using emotional language alone",
      "Through a combination of specific evidence, precise language, and a logical structure that builds to a conclusion",
      "By avoiding any clear argument",
    ],
    correctAnswer: 2,
    explanation: `Persuasive analytical writing works through evidence + precision + structure — all three are needed for a strong argument.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

The MAIN purpose of this passage is to:`,
    options: [
      "Simply entertain with stories",
      "Give instructions for a practical task",
      "Inform readers about a significant subject while making an argument about its importance",
      "List unrelated facts",
    ],
    correctAnswer: 2,
    explanation: `Analytical passages always have a double purpose: informing readers about the topic AND arguing for a specific perspective on its significance.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

The author's tone throughout this passage is BEST described as:`,
    options: [
      "Indifferent and uninvested",
      "Purely emotional with no evidence",
      "Intellectually engaged — the writer takes a clear, supported position on the topic",
      "Angry and accusatory",
    ],
    correctAnswer: 2,
    explanation: `Good analytical writing is characterised by intellectual engagement — a clear position held with evidence and nuance.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What SIGNIFICANT HUMAN THEME does this passage engage with?`,
    options: [
      "A trivial technical matter",
      "A topic irrelevant to human experience",
      "A meaningful theme about identity, justice, knowledge, community, power, or cultural value",
      "A theme only relevant to specialists",
    ],
    correctAnswer: 2,
    explanation: `The best analytical passages connect their specific subject to a broader human theme — showing why it matters beyond its immediate context.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What question would a CRITICAL READER ask when engaging with this passage?`,
    options: [
      "Nothing — all claims are obviously true",
      "Only questions about the writer's credentials",
      "What evidence supports the key claims? What perspective might be missing? What assumptions does the argument rest on?",
      "Whether the passage is interesting",
    ],
    correctAnswer: 2,
    explanation: `Critical reading is active — it interrogates evidence, identifies omissions, and examines the assumptions underlying the argument.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What IMPLICIT ARGUMENT does the author make in this passage?`,
    options: [
      "No argument is made",
      "The topic is unimportant",
      "The subject is more significant, complex, or valuable than it might initially appear — and readers should care about it",
      "Arguments are only explicit in persuasive essays",
    ],
    correctAnswer: 2,
    explanation: `Analytical passages always carry an implicit argument — the writer's position on WHY the topic matters and what the reader should understand differently.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Language Analysis",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

Why does the author choose SPECIFIC, PRECISE language throughout the passage?`,
    options: [
      "To show off their vocabulary",
      "By accident",
      "Precise language signals the writer's authority and guides the reader toward the intended interpretation — vague language would weaken the argument",
      "Precise language has no special function",
    ],
    correctAnswer: 2,
    explanation: `Word choice in analytical writing is deliberate — precision signals expertise, builds credibility, and shapes the reader's interpretation.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

Which statement BEST summarises the MAIN ARGUMENT of this passage?`,
    options: [
      "The topic exists and has some properties",
      "The writer has no clear position",
      "The passage makes a specific, supported argument that its subject is significant in ways that go beyond first appearances — and that readers should understand it differently as a result",
      "The passage has no conclusion",
    ],
    correctAnswer: 2,
    explanation: `A good summary captures the argument, not just the topic — what the writer claims and why it matters.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Jamaica's economy depends on several key industries — tourism, agriculture, bauxite mining, and remittances from Jamaicans living abroad. Each of these carries both opportunity and risk. Tourism brings foreign exchange but can make the economy vulnerable to external shocks, as the COVID-19 pandemic demonstrated dramatically. Agriculture employs many people but faces challenges from climate change, soil degradation, and competition from cheaper imported food. Bauxite mining generates revenue but damages ecosystems and leaves communities with long-term environmental costs. Remittances provide vital income to families, but they also reflect the fact that many talented Jamaicans have left the island in search of better opportunities. Building a resilient economy requires addressing these structural challenges with creativity, investment, and long-term planning."

What does the FINAL SENTENCE or ENDING of the passage suggest the reader should feel or do differently?`,
    options: [
      "Nothing — the ending is random",
      "The reader should simply stop reading",
      "The ending invites the reader to see the topic in a new way, feel its urgency, or commit to a different way of thinking about it",
      "The ending restates the introduction with no new thought",
    ],
    correctAnswer: 2,
    explanation: `Strong endings in analytical writing leave the reader with the most resonant, important thought — they change something in the reader's perspective or feeling.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'resilient'?`,
    options: [
      "fragile",
      "weak",
      "adaptable",
      "rigid",
    ],
    correctAnswer: 2,
    explanation: `'Adaptable' — able to adjust and recover — is a synonym for 'resilient.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'export' is:`,
    options: [
      "trade",
      "sell",
      "ship",
      "import",
    ],
    correctAnswer: 3,
    explanation: `'Import' means to bring goods IN from another country — the opposite of 'export' (to send OUT).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Jamaica's economy has shown remarkable VOLATILITY in recent decades. 'Volatility' means:`,
    options: [
      "steady and predictable growth",
      "rapid and unpredictable change — rising and falling sharply",
      "very slow development",
      "complete economic stability",
    ],
    correctAnswer: 1,
    explanation: `'Volatility' describes rapid, unpredictable change — an economy that is hard to forecast because it shifts dramatically.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'The tourism industry keeps Jamaica's economy afloat.' 'Keeps afloat' means:`,
    options: [
      "Jamaica is surrounded by water",
      "tourism prevents the economy from sinking by providing essential support",
      "tourism is a luxury",
      "the industry involves boats",
    ],
    correctAnswer: 1,
    explanation: `'Keeps afloat' means prevents from sinking — it sustains something that might otherwise fail.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The economy is a ship with too many holes.' What does this extended metaphor suggest?`,
    options: [
      "Ships are important for trade",
      "The economy has minor problems",
      "The economy faces multiple, serious structural problems that collectively threaten to sink it",
      "Only the captain (government) can fix it",
    ],
    correctAnswer: 2,
    explanation: `The 'ship with holes' metaphor suggests multiple simultaneous vulnerabilities — each hole (problem) alone might be managed, but together they threaten the whole vessel.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which phrase has the MOST optimistic connotation?`,
    options: [
      "economic challenges",
      "structural vulnerabilities",
      "declining productivity",
      "economic resilience",
    ],
    correctAnswer: 3,
    explanation: `'Economic resilience' — the ability to recover from shocks — carries a positive, forward-looking connotation of strength and adaptability.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `'Remittances' (mentioned in the passage) are:`,
    options: [
      "government tax revenues",
      "foreign investment in local businesses",
      "money sent home by people working in another country",
      "tourist spending in Jamaica",
    ],
    correctAnswer: 2,
    explanation: `Remittances are money sent by individuals working abroad back to their families in their home country — a significant income source for Jamaica.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Paradox",
    question: `'Brain drain is Jamaica's greatest investment in its own underdevelopment.' This paradox argues:`,
    options: [
      "Brain drain helps Jamaica",
      "Education is pointless",
      "The exodus of educated Jamaicans abroad simultaneously represents talent gained elsewhere and capacity lost at home",
      "Jamaica should stop educating people",
    ],
    correctAnswer: 2,
    explanation: `The paradox captures the tragic irony: Jamaica invests in educating people who then leave, making the investment benefit other economies.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'economy' comes from the Greek 'oikonomia' — 'oikos' (household) + 'nomos' (management). This suggests:`,
    options: [
      "Economics is only about household spending",
      "Economy is literally about managing resources — from the household to the nation",
      "Economics is a modern invention",
      "Only governments study economics",
    ],
    correctAnswer: 1,
    explanation: `The etymology reveals that 'economy' is fundamentally about managing resources wisely — from the household to the national scale.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In formal writing, 'albeit' means:`,
    options: [
      "therefore",
      "in addition",
      "although/even though",
      "because",
    ],
    correctAnswer: 2,
    explanation: `'Albeit' is a formal conjunction meaning 'although' — used to introduce a qualification or concession.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Parts of Speech",
    question: `Which word functions as a NOUN in: 'The resilience of Jamaica's economy is remarkable.'?`,
    options: [
      "remarkable",
      "functions",
      "resilience",
      "Jamaica's",
    ],
    correctAnswer: 2,
    explanation: `'Resilience' names an abstract quality — it is the subject of the sentence and functions as a noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the sentence with the MOST effective use of adjectives:`,
    options: [
      "The economy had problems",
      "Jamaica's fragile, tourism-dependent economy faced severe shocks during the pandemic",
      "Economy was bad",
      "The Jamaica economy faced problems",
    ],
    correctAnswer: 1,
    explanation: `Precise adjectives ('fragile,' 'tourism-dependent,' 'severe') give the sentence meaning, specificity, and analytical power.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Semicolons and Colons",
    question: `Which uses a SEMICOLON correctly?`,
    options: [
      "Jamaica's economy depends on tourism; bauxite mining; and agriculture.",
      "Tourism is valuable; but volatile.",
      "Tourism brings foreign exchange; however, it also creates economic vulnerability.",
      "Jamaica's economy; depends on several industries.",
    ],
    correctAnswer: 2,
    explanation: `A semicolon + conjunctive adverb ('however') correctly joins two independent clauses showing contrast.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Which sentence correctly uses the PASSIVE VOICE in the PAST PERFECT?`,
    options: [
      "The economy had been damaged by the pandemic before recovery began",
      "The economy was damaged by the pandemic",
      "The pandemic had damaged the economy",
      "The economy is damaged by the pandemic",
    ],
    correctAnswer: 0,
    explanation: `Past perfect passive: had been + past participle. 'Had been damaged before recovery began' — action completed before another past event.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conditional — Second",
    question: `'If Jamaica diversified its economy, it would be less vulnerable to external shocks.' This is a:`,
    options: [
      "Zero conditional",
      "First conditional",
      "Second conditional — hypothetical present",
      "Third conditional",
    ],
    correctAnswer: 2,
    explanation: `Second conditional: if + past simple, would + infinitive. Hypothetical situation — Jamaica has not yet fully diversified.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Clauses — Non-Defining",
    question: `Which is a NON-DEFINING relative clause?`,
    options: [
      "The industries that generate most revenue are tourism and remittances",
      "Tourism, which is Jamaica's largest earner, faces risks from climate change",
      "Industries which generate revenue are important",
      "Jamaica's tourism industry which is important generates significant revenue",
    ],
    correctAnswer: 1,
    explanation: `Non-defining: adds non-essential information, enclosed in commas. 'Which is Jamaica's largest earner' can be removed without changing the core meaning.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'We must invest in our own people,' the economist argued.`,
    options: [
      "The economist argued that we must invest in our own people",
      "The economist argued that they must invest in their own people",
      "The economist argued to invest in our people",
      "The economist said we must invest in our own people",
    ],
    correctAnswer: 1,
    explanation: `Reported: 'we' → 'they'; 'must' stays (or changes to 'had to' in formal reported speech). 'Their' replaces 'our.'`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subjunctive",
    question: `'It is essential that Jamaica DIVERSIFY its economic base.' The subjunctive 'diversify' (not 'diversifies') is used because:`,
    options: [
      "It is a typo",
      "After expressions of necessity, the subjunctive uses the base form",
      "Diversify is always in base form",
      "The sentence is in the future tense",
    ],
    correctAnswer: 1,
    explanation: `After 'It is essential/important/vital/necessary that...', the subjunctive uses the base form (diversify, not diversifies).`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Nominalisation",
    question: `Which uses NOMINALISATION to create a more academic style?`,
    options: [
      "The economy fluctuates and this creates problems",
      "The economy's fluctuation creates significant structural problems",
      "The economy is fluctuating and it is a problem",
      "The problem is that the economy fluctuates",
    ],
    correctAnswer: 1,
    explanation: `'Fluctuation' nominalises 'fluctuates' — converting the verb to a noun creates a more formal, abstract academic register.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cohesion",
    question: `Which sentence uses a COHESIVE DEVICE to signal a CONCESSION?`,
    options: [
      "Jamaica's economy is growing. Tourism is important.",
      "Tourism generates revenue. Bauxite generates revenue.",
      "Tourism generates significant revenue. Nevertheless, its dependence on external conditions creates dangerous vulnerability.",
      "Tourism and bauxite both generate revenue.",
    ],
    correctAnswer: 2,
    explanation: `'Nevertheless' concedes the value of tourism while introducing a contrasting concern — a sophisticated cohesive device.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Analytical Writing — Economics",
    question: `An essay arguing that Jamaica's economy needs structural reform should:`,
    options: [
      "List every economic problem without any argument",
      "Express only personal feelings about the economy",
      "Present specific evidence of structural weaknesses, analyse their causes and effects, and argue for a specific, reasoned approach to reform",
      "Blame other countries for Jamaica's problems",
    ],
    correctAnswer: 2,
    explanation: `A strong economic argument uses specific evidence, causal analysis, and a reasoned, specific proposed solution — not just a list of problems or blame.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Objectivity vs Bias",
    question: `When writing about a complex topic like Jamaica's economy, a writer should:`,
    options: [
      "Present only the most positive aspects",
      "Present only the most negative aspects",
      "Acknowledge complexity — presenting evidence fairly while being transparent about their own argument and its limitations",
      "Avoid taking any position",
    ],
    correctAnswer: 2,
    explanation: `Good analytical writing is transparent — it presents evidence honestly, acknowledges complexity, and is clear about what the writer argues and why.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Cohesion in Extended Writing",
    question: `Which technique creates COHESION across multiple paragraphs?`,
    options: [
      "Beginning each paragraph with 'firstly,' 'secondly,' 'thirdly'",
      "Using the same word in every sentence",
      "Using consistent argument threads — referring back to the thesis, using cohesive adverbs, and ensuring each paragraph explicitly builds on the previous",
      "Writing very short paragraphs",
    ],
    correctAnswer: 2,
    explanation: `True cohesion comes from argument threads, not just transitional words — the reader must feel the argument is building coherently toward a conclusion.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Rhetorical Device — Tricolon",
    question: `'Jamaica's economy needs diversification, investment, and political will.' This is called:`,
    options: [
      "Alliteration",
      "Juxtaposition",
      "Tricolon — three parallel items creating rhythm and comprehensiveness",
      "Hyperbole",
    ],
    correctAnswer: 2,
    explanation: `A tricolon uses three parallel grammatical items ('diversification, investment, and political will') — the rhythm makes the claim memorable and suggests completeness.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Evaluating an Argument",
    question: `A student argues: 'Economic over-reliance on tourism is Jamaica's greatest structural vulnerability.' Another student responds: 'Remittances are equally vulnerable.' Evaluate both positions.`,
    options: [
      "The first student is simply right",
      "The second student is simply right",
      "Both positions have merit — a sophisticated evaluation acknowledges that Jamaica's structural vulnerabilities are multiple and interconnected, not a single cause",
      "Neither position is valid without statistics",
    ],
    correctAnswer: 2,
    explanation: `Sophisticated evaluation holds multiple views simultaneously — acknowledging what is valid in each position before making a reasoned judgement about their relative strength.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix7MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix7Questions : g5LaMix7Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 7</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 7</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 7</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
