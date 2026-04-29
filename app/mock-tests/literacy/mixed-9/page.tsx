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

const g5LaMix9Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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

"Climate change is not a future threat — it is a present reality in Jamaica and across the Caribbean. Sea levels have risen by approximately fifteen centimetres over the past century, threatening low-lying coastal communities. Coral reefs, which protect coastlines from wave damage and support fishing communities, are bleaching and dying at alarming rates. Hurricane seasons are becoming more intense, and the island's water supplies are increasingly disrupted by drought. The people who contributed least to global greenhouse gas emissions — Caribbean islanders — are among those facing the most severe consequences. This moral imbalance lies at the heart of the international climate justice movement: those who caused the crisis must be held responsible for helping those who are suffering its effects."

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
    question: `Which word is a SYNONYM for 'severe'?`,
    options: [
      "mild",
      "gentle",
      "slight",
      "intense",
    ],
    correctAnswer: 3,
    explanation: `'Intense' — extreme in degree — is a synonym for 'severe.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'vulnerable' is:`,
    options: [
      "exposed",
      "at risk",
      "defenceless",
      "protected",
    ],
    correctAnswer: 3,
    explanation: `'Protected' means defended from harm — the opposite of 'vulnerable' (exposed to harm or risk).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The small island nation was DISPROPORTIONATELY affected by climate change given its minimal contribution to emissions. 'Disproportionately' means:`,
    options: [
      "equally and fairly",
      "in a way that is balanced and proportional",
      "to a degree far greater than would be fair or expected given its level of responsibility",
      "slightly",
    ],
    correctAnswer: 2,
    explanation: `'Disproportionately' means the impact is far greater than the island's contribution would justify — an unfair distribution of consequences.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'Caribbean nations are caught between a rock and a hard place on climate change.' This idiom means:`,
    options: [
      "They are surrounded by rocks and water",
      "They have easy choices to make",
      "They face a situation with no good options — harmed whether they act or not",
      "They should move their countries",
    ],
    correctAnswer: 2,
    explanation: `'Between a rock and a hard place' describes an impossible dilemma where all options are bad — often applied to situations of no good choices.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Rising seas are writing the final chapter of coastal communities.' This metaphor argues:`,
    options: [
      "Communities need better libraries",
      "Sea levels are rising slowly",
      "The destruction of coastal communities by rising seas is as inevitable and irreversible as the final pages of a book approaching its end",
      "Communities should build sea walls",
    ],
    correctAnswer: 2,
    explanation: `The metaphor frames sea-level rise as an authorial force writing an ending — powerful and perhaps inevitable — for these communities.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `The phrase 'climate justice' carries which connotation?`,
    options: [
      "a technical scientific term",
      "an emotionally neutral descriptor",
      "a morally charged phrase demanding accountability and fairness",
      "a phrase used only by politicians",
    ],
    correctAnswer: 2,
    explanation: `'Justice' adds a moral dimension — it implies wrongdoing, responsibility, and the need for remedy, not just a neutral environmental discussion.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `In the passage, 'emissions' refers to:`,
    options: [
      "money paid to governments",
      "goods exported by countries",
      "greenhouse gases released into the atmosphere, particularly from burning fossil fuels",
      "wildlife displaced by development",
    ],
    correctAnswer: 2,
    explanation: `'Emissions' in environmental contexts means gases (especially carbon dioxide) released into the atmosphere — the primary cause of climate change.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Irony",
    question: `It is ironic that Caribbean islands — contributing least to climate change — suffer its worst effects. This irony is called:`,
    options: [
      "Dramatic irony",
      "Verbal irony",
      "Situational irony — the outcome is the opposite of what fairness would dictate",
      "Comic irony",
    ],
    correctAnswer: 2,
    explanation: `Situational irony occurs when what happens is the opposite of what justice or expectation would suggest — those least responsible suffer most.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'climate' comes from the Greek 'klima' meaning 'slope' or 'zone' — referring to the slope of the Earth from equator to poles. This etymology reveals:`,
    options: [
      "Climate is only about temperature",
      "Climate was always understood as a geographic phenomenon tied to Earth's regions and their relationship to the sun",
      "Climate is a modern concept",
      "Only tropical zones have climates",
    ],
    correctAnswer: 1,
    explanation: `The etymology reveals that 'climate' originally described geographic zones — the ancient Greeks understood that location relative to the sun determines weather patterns.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In academic writing, 'to attribute' means:`,
    options: [
      "to create something new",
      "to connect a cause, quality, or work to its source or reason",
      "to copy without credit",
      "to ignore the source",
    ],
    correctAnswer: 1,
    explanation: `'Attribute' means to connect something to its cause or origin — 'The temperature rise is attributed to increased carbon emissions.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `'The injustice of climate change falls disproportionately on the Caribbean.' The word 'injustice' is:`,
    options: [
      "A verb",
      "An adjective",
      "An abstract noun",
      "A proper noun",
    ],
    correctAnswer: 2,
    explanation: `'Injustice' names an abstract concept (the quality of being unjust) — it is an abstract noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Comparative/Superlative",
    question: `Which uses the SUPERLATIVE correctly?`,
    options: [
      "Caribbean nations are most affected than any other region",
      "Caribbean nations are more affected than other regions",
      "Caribbean nations are among the most severely affected regions on Earth",
      "Caribbean nations are more severely than other regions",
    ],
    correctAnswer: 2,
    explanation: `For multi-syllable adverbs, use 'most' for superlative: 'most severely affected.' Option C is correct.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation — Colon and Semicolon",
    question: `Which sentence uses BOTH a colon and semicolon correctly?`,
    options: [
      "Caribbean nations face three main threats: rising seas; intensifying hurricanes; and prolonged droughts.",
      "Caribbean: nations face rising seas; hurricanes; and droughts.",
      "Caribbean nations face: rising seas; hurricanes and droughts.",
      "Caribbean nations; face three threats: seas, hurricanes, droughts.",
    ],
    correctAnswer: 0,
    explanation: `Colon introduces the list; semicolons separate complex list items. Option A uses both correctly.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice — Complex",
    question: `Which correctly uses the PASSIVE VOICE in the PRESENT PERFECT PASSIVE?`,
    options: [
      "Rising sea levels have caused coastal damage",
      "Coastal areas have been damaged by rising sea levels",
      "Rising sea levels caused coastal damage",
      "The sea is damaging coastal areas",
    ],
    correctAnswer: 1,
    explanation: `Present perfect passive: have/has been + past participle. 'Have been damaged by' is correct.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conditional — Third",
    question: `'If Caribbean nations had contributed more emissions, the moral argument for climate justice would be more complex.' This is a:`,
    options: [
      "First conditional",
      "Second conditional",
      "Third conditional",
      "Zero conditional",
    ],
    correctAnswer: 2,
    explanation: `Third conditional: if + past perfect, would have + past participle. Imagines an alternative past.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Inversion — Formal",
    question: `'Rarely ___ a crisis been so clearly predicted yet so inadequately addressed.'`,
    options: [
      "has",
      "have",
      "had",
      "is",
    ],
    correctAnswer: 0,
    explanation: `After 'Rarely', inversion: 'Rarely has a crisis been...' — formal literary or academic register.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Choose the correct relative pronoun: 'The island nations, ___ contributions to emissions are minimal, face the most severe consequences.'`,
    options: [
      "that",
      "who",
      "whose",
      "which",
    ],
    correctAnswer: 2,
    explanation: `'Whose' is the possessive relative pronoun. 'Nations whose contributions are minimal' — the contributions belong to the nations.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Reported Speech — Complex",
    question: `Change to REPORTED SPEECH: 'We are suffering the consequences of other people's choices,' the prime minister stated.`,
    options: [
      "The prime minister stated that they were suffering the consequences of other people's choices",
      "The prime minister stated that we are suffering the consequences of other people's choices",
      "The prime minister stated they suffer the consequences",
      "The prime minister told that they were suffering",
    ],
    correctAnswer: 0,
    explanation: `'We' → 'they'; present continuous 'are suffering' → past continuous 'were suffering'; 'other people's' remains unchanged.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Subjunctive — Formal",
    question: `Which correctly uses the SUBJUNCTIVE?`,
    options: [
      "It is imperative that every nation is held accountable",
      "It is imperative that every nation be held accountable",
      "It is imperative every nation should be held accountable",
      "Every nation must be held accountable — it is imperative",
    ],
    correctAnswer: 1,
    explanation: `After 'It is imperative that...', the subjunctive uses the base form: 'be held' (not 'is held').`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cohesive Devices",
    question: `Which sentence uses COHESIVE DEVICES most effectively to build an argument?`,
    options: [
      "Climate change is bad. Island nations suffer. We must act.",
      "Climate change threatens island nations. They suffer. Action must be taken.",
      "Climate change disproportionately harms island nations; consequently, those responsible must be held accountable for the damage they have caused.",
      "Climate change is a problem for island nations who suffer and need help.",
    ],
    correctAnswer: 2,
    explanation: `'Disproportionately' (precise modifier) + 'consequently' (causal connector) + clear logical structure — sophisticated, cohesive academic writing.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Persuasive Purpose — Climate",
    question: `A student writes a speech to the United Nations about climate justice for Caribbean nations. The PRIMARY goal is:`,
    options: [
      "To describe Jamaica's geography",
      "To entertain delegates with stories",
      "To persuade world leaders that those responsible for climate change must take urgent, concrete action to protect the most vulnerable nations",
      "To explain the science of climate change",
    ],
    correctAnswer: 2,
    explanation: `A climate justice speech aims to persuade powerful actors to take specific action — combining moral argument with evidence.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Emotional and Logical Appeal",
    question: `Which BEST combines EMOTIONAL and LOGICAL appeal?`,
    options: [
      "Stop climate change immediately",
      "Caribbean islands did not cause this crisis. Data shows they produce less than 1% of global emissions yet face sea level rise, intensifying hurricanes, and water scarcity. This is not bad luck — it is injustice.",
      "Climate change is really bad and we should do something",
      "Statistics show that emissions cause climate change",
    ],
    correctAnswer: 1,
    explanation: `Option B combines specific data (logical appeal) with clear moral indignation (emotional appeal) — the most effective persuasive combination.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Structural Argument",
    question: `A student argues for climate justice. Which structure is MOST effective for a formal speech?`,
    options: [
      "Start with the conclusion",
      "Present arguments in random order",
      "Open with a compelling hook, build the argument with evidence, address counterarguments, and close with a specific call to action",
      "List all possible solutions first",
    ],
    correctAnswer: 2,
    explanation: `A well-structured persuasive speech: hook → evidence-based argument → counterargument → call to action. Each step builds toward the conclusion.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Irony as a Writing Technique",
    question: `'The nations that did least to create this crisis are being asked to pay most to survive it.' What technique does this sentence use?`,
    options: [
      "Alliteration",
      "A rhetorical question",
      "Antithesis — placing contrasting ideas in parallel to highlight the injustice",
      "An anecdote",
    ],
    correctAnswer: 2,
    explanation: `Antithesis places opposing ideas in parallel structure ('did least' vs 'pay most') — the contrast highlights the injustice more powerfully than a straightforward statement would.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Evaluating a Climate Justice Argument",
    question: `A student argues: 'The moral case for climate justice is unanswerable.' A critical reader might challenge this by saying:`,
    options: [
      "The moral case is clear — no challenge is needed",
      "Morality is always simple and clear",
      "Even strong moral cases can be complicated by questions of causation, political feasibility, and disagreement about who exactly owes what to whom",
      "Climate science is disputed",
    ],
    correctAnswer: 2,
    explanation: `Even the strongest moral arguments have complications — a critical reader identifies where the argument might be contested. This is not a rejection of climate justice, but intellectual rigour.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix9MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix9Questions : g5LaMix9Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 9</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 9</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 9</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
