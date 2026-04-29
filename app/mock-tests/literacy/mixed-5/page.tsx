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

const g5LaMix5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

What is this passage MAINLY about?`,
    options: [
      "Water chemistry",
      "The general importance of water",
      "Jamaica's water scarcity crisis, its causes, and the solutions that exist if the political will is present",
      "How rainfall works",
    ],
    correctAnswer: 2,
    explanation: `The passage covers the crisis, its causes (climate, infrastructure, pollution), and solutions — framed as a question of political will.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

According to the passage, which group is particularly affected by water scarcity in Jamaica?`,
    options: [
      "Urban communities",
      "Coastal fishing communities",
      "Rural communities, where drought and aging infrastructure reduce access",
      "School children",
    ],
    correctAnswer: 2,
    explanation: `The passage states water scarcity 'affects thousands of communities — particularly in rural areas.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The word 'commodity' in the passage means:`,
    options: [
      "a natural right belonging to everyone",
      "a scientific element",
      "something bought and sold on the market — implying value defined by price rather than need",
      "a type of water source",
    ],
    correctAnswer: 0,
    explanation: `The passage contrasts treating water as a 'right' versus a 'commodity' (something sold) — the distinction is central to the argument.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

Which of the following does the passage list as a solution to water scarcity?`,
    options: [
      "Building desalination plants",
      "Importing water from other countries",
      "Rainwater harvesting, watershed protection, and repairing leaking pipes",
      "Restricting water use entirely",
    ],
    correctAnswer: 2,
    explanation: `The passage specifically lists 'rainwater harvesting, watershed protection, and repairing leaking pipes' as available solutions.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

According to the passage, what will climate change do to Jamaica's water supplies?`,
    options: [
      "Improve them through more rainfall",
      "Have no effect",
      "Worsen them through longer dry seasons, intense storms, and rising sea levels threatening freshwater",
      "Only affect coastal areas",
    ],
    correctAnswer: 2,
    explanation: `The passage lists specific climate impacts: 'longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies.'`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

What does the phrase 'the challenge is not technology — it is will, funding, and political commitment' imply?`,
    options: [
      "Jamaica lacks the technology to solve the water crisis",
      "The solutions to the water crisis are technically available — the barrier is human decision-making, not capability",
      "Technology is not relevant to water problems",
      "Politicians are unaware of the crisis",
    ],
    correctAnswer: 1,
    explanation: `The passage implies that the technical solutions exist — the barrier is human choice: whether governments choose to prioritise and fund them.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

Why does the author frame water as a 'right rather than a commodity' at the end?`,
    options: [
      "To explain water chemistry",
      "To confuse readers",
      "To elevate the argument from a technical problem to a moral one — framing water access as a matter of justice, not just efficiency",
      "To argue against water pricing",
    ],
    correctAnswer: 2,
    explanation: `Framing water as a right (not a commodity) shifts the argument from technical to moral — it implies denial of water access is not just a failure but an injustice.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The MAIN purpose of this passage is to:`,
    options: [
      "Explain the water cycle",
      "Scare readers about drought",
      "Inform readers about Jamaica's water crisis and persuade them — and decision-makers — that political commitment is the key to solving it",
      "Advertise water treatment products",
    ],
    correctAnswer: 2,
    explanation: `The passage builds from problem to solutions, ending with a moral argument — its purpose is both informative and persuasive.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The tone of this passage is BEST described as:`,
    options: [
      "Hopeless — the problem is too large to solve",
      "Angry at specific politicians",
      "Urgently concerned but ultimately hopeful — solutions exist if the will to use them is present",
      "Entirely neutral and scientific",
    ],
    correctAnswer: 2,
    explanation: `The passage is urgent (crisis is real) but not hopeless (solutions exist) — a balanced, engaged tone.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The author argues that 'the challenge is political commitment.' A critical reader would ask:`,
    options: [
      "Why is water important?",
      "Is water expensive in Jamaica?",
      "What specific political actions would constitute this commitment, and what barriers prevent politicians from taking them?",
      "Are the solutions mentioned proven to work?",
    ],
    correctAnswer: 2,
    explanation: `A critical reader moves from identification of the problem to specific analysis of the solution — what would political commitment actually require, and what stands in the way?`
  },
  {
    id: 11,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

'A leaking pipe wastes more water than a drought.' Even if not in the exact passage, this type of comparison would be used to:`,
    options: [
      "Confuse readers",
      "Compare unrelated things randomly",
      "Dramatise the scale of preventable waste by comparing man-made inefficiency to a natural disaster",
      "Make the passage longer",
    ],
    correctAnswer: 2,
    explanation: `This comparison makes the scale of preventable water loss vivid — if a man-made problem is worse than a natural disaster, the urgency of fixing it is clear.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The CENTRAL theme of this passage is:`,
    options: [
      "Climate science and rainfall patterns",
      "Water is a technical engineering problem",
      "Access to clean water is a matter of justice and political will, not just technology — and the solutions exist if decision-makers choose to act",
      "Water crises are inevitable and unavoidable",
    ],
    correctAnswer: 2,
    explanation: `The passage consistently argues that water access is about choices (political will, funding) — linking resource management to justice.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

Which BEST summarises this passage?`,
    options: [
      "Water is important to life",
      "Jamaica has rivers and rainfall",
      "Jamaica faces a water scarcity crisis driven by climate change, aging infrastructure, and pollution — but solutions exist if there is political will to treat water as a right, not a commodity",
      "Water pricing is too high in Jamaica",
    ],
    correctAnswer: 2,
    explanation: `This captures the crisis, causes, solutions, and the framing around rights — the full argument of the passage.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

When the author says solutions 'exist' but the challenge is 'will, funding, and political commitment,' they imply:`,
    options: [
      "The crisis cannot be solved",
      "The crisis is not real",
      "The water crisis is a political failure, not a technological inevitability — those in power are responsible for acting",
      "Only individuals can solve the water crisis",
    ],
    correctAnswer: 2,
    explanation: `Saying solutions exist but political will is lacking makes a clear argument: the crisis is a choice — a political failure — not an unavoidable fate.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Water covers seventy percent of the Earth's surface, yet fresh, clean water is one of the most precious and threatened resources on the planet. In Jamaica, water scarcity affects thousands of communities — particularly in rural areas — where drought, aging infrastructure, and pollution have made access to clean water unreliable. Scientists warn that climate change will make this worse: longer dry seasons, more intense storms, and rising sea levels will threaten freshwater supplies across the Caribbean. Yet solutions exist. Rainwater harvesting, watershed protection, and repairing leaking pipes can all significantly reduce water loss. The challenge is not technology — it is will, funding, and the political commitment to treat water as a right rather than a commodity."

The writer uses figurative language to describe the topic. What is the effect?`,
    options: [
      "It makes the writing unnecessarily long",
      "It confuses readers",
      "It makes abstract or complex ideas vivid and concrete, creating emotional resonance",
      "Figurative language has no place in informative writing",
    ],
    correctAnswer: 2,
    explanation: `In informative writing, figurative language brings ideas to life — it makes the abstract tangible and the distant immediate.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'scarce'?`,
    options: [
      "abundant",
      "plentiful",
      "rare",
      "common",
    ],
    correctAnswer: 2,
    explanation: `'Rare' means not found in large quantities — a synonym for 'scarce.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'pollute' is:`,
    options: [
      "contaminate",
      "poison",
      "dirty",
      "purify",
    ],
    correctAnswer: 3,
    explanation: `'Purify' means to make clean or pure — the opposite of 'pollute.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The government declared water INFRASTRUCTURE to be a priority. 'Infrastructure' means:`,
    options: [
      "the decorative features of a system",
      "the basic physical systems — pipes, treatment plants, networks — that support a service",
      "the financial cost of water",
      "the scientists who study water",
    ],
    correctAnswer: 1,
    explanation: `'Infrastructure' refers to the basic physical systems and structures that a service or society depends on to function.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'We are running out of time to address this problem.' 'Running out of time' means:`,
    options: [
      "jogging away from problems",
      "time is literally ending",
      "the time available to take action is rapidly decreasing",
      "there is plenty of time still",
    ],
    correctAnswer: 2,
    explanation: `'Running out of time' means the available time is being exhausted — urgency is building.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Every drop of clean water is a gift we are squandering.' What does 'squandering' suggest?`,
    options: [
      "Using water carefully",
      "Wasting something precious through carelessness",
      "Giving water to people who need it",
      "Saving water for emergencies",
    ],
    correctAnswer: 1,
    explanation: `'Squandering' means wasting a valuable resource through carelessness — the metaphor of a 'gift' makes the waste seem morally irresponsible.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which phrase has the MOST urgent and alarming connotation?`,
    options: [
      "water management challenges",
      "water access issues",
      "water crisis",
      "water planning needs",
    ],
    correctAnswer: 2,
    explanation: `'Crisis' implies immediate danger and severe consequence — the strongest, most alarming connotation of the four options.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'commodity' means:`,
    options: [
      "a gift or donation",
      "something produced for sale or trade, often implying it has a market value",
      "a government service",
      "a natural right",
    ],
    correctAnswer: 1,
    explanation: `A 'commodity' is a product or resource that is bought and sold — treating water as a commodity means valuing it by market price rather than as a human right.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Metaphor",
    question: `'The pipeline of political will is the most critical one to fix.' In this metaphor, 'political will' is compared to:`,
    options: [
      "a broken water pipe",
      "a river",
      "water flowing through pipes — suggesting political commitment is the resource most urgently needed",
      "an election",
    ],
    correctAnswer: 0,
    explanation: `The metaphor extends the water-system imagery to politics: just as pipes carry water, political will 'carries' the commitment needed for reform.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'aquifer' comes from Latin 'aqua' (water) and 'ferre' (to carry). This etymology tells us:`,
    options: [
      "An aquifer is a type of pipe",
      "An aquifer carries water — it is an underground rock layer that holds and carries groundwater",
      "Aquifers are only found in deserts",
      "Aquifers are artificial",
    ],
    correctAnswer: 1,
    explanation: `'Aqua' = water, 'ferre' = to carry. An aquifer is literally something that carries water — an underground reservoir.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In a persuasive essay, 'moreover' is used to:`,
    options: [
      "contradict the previous argument",
      "end the essay",
      "introduce an additional and stronger supporting point",
      "ask the reader a question",
    ],
    correctAnswer: 2,
    explanation: `'Moreover' adds a stronger, additional point — 'and what is more, here is an even more compelling reason.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is IMPERATIVE?`,
    options: [
      "Is water a human right?",
      "Water is a human right",
      "Treat water as a human right, not a commodity!",
      "Water should be a human right",
    ],
    correctAnswer: 2,
    explanation: `An imperative gives a command. 'Treat water as a human right' is a direct command addressed to the reader.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the SUPERLATIVE form of 'precious':`,
    options: [
      "more precious",
      "most precious",
      "precious-est",
      "preciouser",
    ],
    correctAnswer: 1,
    explanation: `For longer adjectives, use 'most' to form the superlative: 'most precious.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation — Semicolon",
    question: `Which correctly uses a SEMICOLON?`,
    options: [
      "Water is scarce; but we waste it daily.",
      "Water is scarce; we waste it daily.",
      "Water; is scarce and we waste it daily.",
      "Water is scarce and; we waste it daily.",
    ],
    correctAnswer: 1,
    explanation: `A semicolon joins two independent clauses without a conjunction. 'Water is scarce; we waste it daily' — both are complete clauses.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Active and Passive",
    question: `Choose the PASSIVE sentence:`,
    options: [
      "Communities waste millions of litres daily",
      "Millions of litres are wasted by communities daily",
      "Communities are wasting water",
      "The wastage is enormous",
    ],
    correctAnswer: 1,
    explanation: `Passive: subject (millions of litres) receives the action (are wasted) performed by an agent (communities).`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Relative Clauses",
    question: `Which correctly uses a DEFINING relative clause?`,
    options: [
      "Fresh water, which is essential for life, is becoming scarce",
      "Fresh water which is essential for life is becoming scarce",
      "Communities that lack access to clean water face serious health risks",
      "Communities, that lack clean water, face health risks",
    ],
    correctAnswer: 2,
    explanation: `A defining relative clause identifies WHICH communities are meant — no commas, as it is essential to the meaning.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Modal Verbs — Necessity",
    question: `Which modal expresses NECESSITY most strongly?`,
    options: [
      "could",
      "might",
      "should",
      "must",
    ],
    correctAnswer: 3,
    explanation: `'Must' expresses the strongest obligation or necessity — something that is absolutely required.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Reported Speech — Question",
    question: `Change to INDIRECT SPEECH: 'Is water a human right or a commodity?' the activist asked.`,
    options: [
      "The activist asked is water a human right or a commodity",
      "The activist asked whether water was a human right or a commodity",
      "The activist questioned water is a human right",
      "The activist asked that water is a human right",
    ],
    correctAnswer: 1,
    explanation: `Indirect questions use 'whether/if' and shift tenses: 'is' → 'was.' No question mark in reported speech.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conditional",
    question: `'If we do not act now, future generations will inherit a water crisis.' This is a:`,
    options: [
      "Zero conditional (always true)",
      "First conditional (realistic future)",
      "Second conditional (hypothetical)",
      "Third conditional (past hypothetical)",
    ],
    correctAnswer: 1,
    explanation: `First conditional: if + present simple, will + infinitive. Realistic, foreseeable future consequence.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Inversion",
    question: `'Only by conserving water now ___ we secure supplies for the future.'`,
    options: [
      "will",
      "are",
      "have",
      "do",
    ],
    correctAnswer: 0,
    explanation: `After 'Only by...', inversion places the modal auxiliary before the subject: 'Only by conserving... will we secure...'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Ellipsis",
    question: `In 'Some communities have water; others do not,' what has been omitted?`,
    options: [
      "have water",
      "some communities",
      "others",
      "communities do not",
    ],
    correctAnswer: 0,
    explanation: `'Have water' is omitted from the second clause (understood from context): 'others do not [have water].' This is grammatical ellipsis.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Persuasive Purpose",
    question: `A student writes a letter to a water authority demanding improved access to clean water for rural communities. The PRIMARY purpose is:`,
    options: [
      "To entertain the authority with a story",
      "To describe what rural communities look like",
      "To persuade the authority to take specific action by presenting evidence of need and injustice",
      "To inform the authority about water chemistry",
    ],
    correctAnswer: 2,
    explanation: `The letter is a persuasive instrument — its purpose is to move the authority to action by combining evidence with moral argument.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Formal Letter Structure",
    question: `Which is an ESSENTIAL feature of a formal persuasive letter?`,
    options: [
      "A casual, friendly greeting",
      "No clear structure",
      "A formal salutation, clearly organised paragraphs, a specific request or demand, and a formal closing",
      "A long list of facts with no argument",
    ],
    correctAnswer: 2,
    explanation: `A formal persuasive letter requires professional structure: proper salutation, organised evidence-based paragraphs, a specific request, and formal closing.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Evidence and Argument",
    question: `Which BEST supports the argument that water access is a human rights issue?`,
    options: [
      "Water tastes good",
      "Some people do not have clean water",
      "Data showing that rural communities in Jamaica have significantly higher rates of waterborne disease due to lack of clean water infrastructure",
      "Water is important to most people",
    ],
    correctAnswer: 2,
    explanation: `Specific, data-backed evidence directly links lack of water access to health consequences — making the human rights argument concrete and hard to dismiss.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Rhetorical Devices in Persuasion",
    question: `'Thousands of children go to school without a clean glass of water to drink. Thousands of adults work without adequate sanitation. Thousands of elderly people suffer preventable illness.' What persuasive device is used?`,
    options: [
      "Alliteration",
      "A rhetorical question",
      "Anaphora — the repetition of 'Thousands' at the beginning of each clause to create emphasis and cumulative impact",
      "A simile",
    ],
    correctAnswer: 2,
    explanation: `Anaphora (repetition at the start of consecutive clauses) creates rhythm, emphasis, and cumulative emotional weight — a powerful persuasive technique.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Evaluating Persuasive Writing",
    question: `A student argues: 'The most effective persuasive writers are those who acknowledge the opposing view before demolishing it.' Evaluate this claim.`,
    options: [
      "This is completely wrong",
      "Acknowledging the opposing view weakens the argument",
      "This is a sophisticated and well-founded claim — acknowledging counterarguments shows intellectual honesty, pre-empts objections, and strengthens the overall argument by showing its superior reasoning",
      "Only experts should acknowledge opposing views",
    ],
    correctAnswer: 2,
    explanation: `Engaging with counterarguments is a hallmark of sophisticated persuasion — it demonstrates that the writer has considered the issue fully and shows confidence in the strength of their own position.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix5MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix5Questions : g5LaMix5Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 5</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 5</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 5</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
