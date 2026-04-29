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

const g5LaMix3Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

What is the MAIN topic of this passage?`,
    options: [
      "A minor fact about bamboo",
      "Bamboo as a plant with no particular significance",
      "Bamboo as a remarkable, versatile plant with properties that make it valuable for sustainable development",
      "Bamboo farming techniques only",
    ],
    correctAnswer: 2,
    explanation: `The passage covers bamboo's remarkable growth, strength, historical uses in Jamaica, and potential as a sustainable material — making its value the main topic.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

According to the passage, how fast can some species of bamboo grow?`,
    options: [
      "A centimetre a day",
      "Up to a metre a day",
      "Ten centimetres a week",
      "A metre a month",
    ],
    correctAnswer: 1,
    explanation: `The passage states 'some species can grow as much as a metre in a single day.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

The word 'sequesters' in the passage most nearly means:`,
    options: [
      "releases",
      "burns",
      "stores and removes from the atmosphere",
      "destroys",
    ],
    correctAnswer: 2,
    explanation: `'Sequesters carbon' means captures and stores carbon dioxide — removing it from the atmosphere. This is a key environmental benefit.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

Which of the following is NOT mentioned as a use of bamboo in Jamaica?`,
    options: [
      "Construction",
      "Crafts",
      "The bamboo flute",
      "Bamboo paper",
    ],
    correctAnswer: 3,
    explanation: `The passage mentions construction, crafts, and the bamboo flute as Jamaican uses — but not bamboo paper.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Comparison",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

How does the passage contrast bamboo with concrete?`,
    options: [
      "Bamboo is weaker and cheaper",
      "Concrete is better for the environment",
      "Bamboo grows quickly and sequesters carbon, whereas concrete requires enormous energy to produce",
      "They are exactly the same in their environmental impact",
    ],
    correctAnswer: 2,
    explanation: `The passage directly contrasts the two: bamboo is renewably grown and carbon-sequestering; concrete is energy-intensive to produce.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

What does the phrase 'scientists and architects are rediscovering bamboo' suggest?`,
    options: [
      "Bamboo is a new plant",
      "Bamboo was unknown before this century",
      "Bamboo's value has been overlooked and is now being appreciated again after a period of neglect",
      "Bamboo was only recently imported to Jamaica",
    ],
    correctAnswer: 2,
    explanation: `'Rediscovering' implies bamboo was known, then overlooked, and is now being valued again — particularly for sustainable construction.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

Why does the author include the statistic that bamboo can grow 'a metre in a single day'?`,
    options: [
      "To suggest bamboo is out of control",
      "To make the passage seem scientific",
      "To immediately capture the reader's attention with a striking, concrete fact that demonstrates bamboo's exceptional nature",
      "To explain why bamboo is dangerous",
    ],
    correctAnswer: 2,
    explanation: `A vivid statistic at the opening grabs attention and gives the reader a concrete, memorable image of bamboo's remarkable speed.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

The MAIN purpose of this passage is to:`,
    options: [
      "Argue that concrete should be banned",
      "Entertain readers with interesting plant facts",
      "Inform readers about bamboo's properties while arguing for its potential as a sustainable solution to real global problems",
      "Teach readers how to grow bamboo",
    ],
    correctAnswer: 2,
    explanation: `The passage informs (properties, uses) while building an argument (bamboo as a sustainable solution to housing and climate challenges).`
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

According to the passage, WHY is bamboo a good material for addressing climate change?`,
    options: [
      "It is very colourful",
      "It grows in tropical regions",
      "It can be harvested without killing the plant, grows quickly, and sequesters carbon — unlike energy-intensive concrete",
      "It is cheaper than other materials",
    ],
    correctAnswer: 2,
    explanation: `The passage links bamboo's environmental benefits directly to climate change solutions: fast growth, carbon sequestration, and renewable harvesting.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

The tone of this passage is BEST described as:`,
    options: [
      "Dismissive of traditional building materials",
      "Purely objective with no opinion",
      "Enthusiastically informative — the writer clearly believes in bamboo's potential and wants to persuade readers of its significance",
      "Alarmed and fearful about the housing crisis",
    ],
    correctAnswer: 2,
    explanation: `The writer's admiration for bamboo ('remarkable,' 'astonishing') and the case built for its potential shows an enthusiastic, informative tone with a persuasive edge.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

A sceptical reader might challenge the passage by asking which question?`,
    options: [
      "Is bamboo really a plant?",
      "Is bamboo available in Jamaica?",
      "Does bamboo actually perform as well as concrete in all building contexts, or are there limitations not mentioned here?",
      "Is concrete used in Jamaica?",
    ],
    correctAnswer: 2,
    explanation: `Critical reading questions the limits of claims — bamboo may not be superior in all conditions. The passage does not acknowledge any weaknesses.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

The CENTRAL theme of this passage is:`,
    options: [
      "The history of construction in Jamaica",
      "Climate science and its implications",
      "Nature provides sustainable solutions to modern problems — if we look carefully at what is already around us",
      "Bamboo is better than all other plants",
    ],
    correctAnswer: 2,
    explanation: `The passage uses bamboo as a case study for a broader idea: natural, renewable materials can address modern challenges in ways that industrial materials cannot.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

'Stronger than many types of wood, yet flexible enough to bend without breaking in strong winds.' What quality does this suggest bamboo has?`,
    options: [
      "Weakness",
      "Brittle rigidity",
      "Resilience — strength combined with adaptability, able to withstand force without snapping",
      "Only physical strength",
    ],
    correctAnswer: 2,
    explanation: `The combination of strength and flexibility defines resilience — the ability to withstand force through adaptation rather than rigid resistance.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

Which BEST summarises this passage?`,
    options: [
      "Bamboo is a fast-growing plant",
      "Bamboo has been used in Jamaica for crafts",
      "Bamboo is a remarkable, fast-growing material with great strength and environmental benefits that make it a potential solution to both housing and climate challenges",
      "Bamboo is better than concrete for all purposes",
    ],
    correctAnswer: 2,
    explanation: `This captures bamboo's key properties (fast growth, strength, environmental benefit) and the argument about its potential — a complete summary.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Bamboo is one of the most versatile and remarkable plants on Earth. It grows faster than any other plant — some species can grow as much as a metre in a single day. It is stronger than many types of wood, yet flexible enough to bend without breaking in strong winds. In Jamaica, bamboo has been used for centuries in construction, crafts, and even as a musical instrument (the bamboo flute). Today, scientists and architects around the world are rediscovering bamboo as a sustainable building material that could help address both the housing crisis and climate change. Where concrete consumes enormous amounts of energy to produce, bamboo grows quickly, sequesters carbon, and can be harvested without killing the plant."

When the passage says bamboo 'can be harvested without killing the plant,' it implies:`,
    options: [
      "Bamboo is not really a plant",
      "Harvesting trees and other materials kills them — bamboo offers a genuinely renewable alternative",
      "Bamboo grows back immediately after harvesting",
      "Bamboo harvesting is too difficult",
    ],
    correctAnswer: 1,
    explanation: `The implication is that most building materials (timber, concrete raw materials) involve destructive extraction — bamboo stands apart as truly renewable.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'durable'?`,
    options: [
      "fragile",
      "delicate",
      "weak",
      "long-lasting",
    ],
    correctAnswer: 3,
    explanation: `'Long-lasting' means able to withstand use over time — a synonym for 'durable.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'flexible' is:`,
    options: [
      "adaptable",
      "rigid",
      "elastic",
      "bendable",
    ],
    correctAnswer: 1,
    explanation: `'Rigid' means stiff and unable to bend or adapt — the opposite of 'flexible.'`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The building material was highly SUSTAINABLE — it could be produced indefinitely without depleting natural resources. 'Sustainable' means:`,
    options: [
      "expensive and rare",
      "fast to produce",
      "able to be maintained without causing permanent harm to the environment",
      "very strong and durable",
    ],
    correctAnswer: 2,
    explanation: `'Sustainable' describes something that can continue without exhausting resources or causing lasting damage.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'We should strike while the iron is hot.' This idiom means:`,
    options: [
      "Blacksmiths work quickly",
      "Act immediately while conditions are favourable",
      "Iron is dangerous when heated",
      "Wait for the right season",
    ],
    correctAnswer: 1,
    explanation: `'Strike while the iron is hot' advises acting at the right moment, when conditions are most favourable for success.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Bamboo bends in the storm but never breaks.' What quality does this image suggest?`,
    options: [
      "Bamboo is weak and easily damaged",
      "Bamboo is rigid and cannot move",
      "Resilience — the ability to adapt to pressure without being destroyed",
      "Bamboo is not useful as a material",
    ],
    correctAnswer: 2,
    explanation: `Bending without breaking is a classic image of resilience — strength through flexibility rather than rigid resistance.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `The word 'ancient' can be used positively or negatively. Which sentence uses it POSITIVELY?`,
    options: [
      "The ancient, crumbling building was an eyesore",
      "The ancient traditions of the community carried centuries of wisdom",
      "The ancient road was impossible to drive on",
      "Their ancient equipment could not compete with modern technology",
    ],
    correctAnswer: 1,
    explanation: `'Ancient traditions carrying wisdom' values age — it is a positive connotation suggesting depth and accumulated knowledge.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'versatile' means:`,
    options: [
      "expensive and rare",
      "able to be used in many different ways",
      "extremely strong",
      "quick to grow",
    ],
    correctAnswer: 1,
    explanation: `'Versatile' describes something capable of doing or being used for many different things — multi-purpose.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Symbolism",
    question: `In environmental writing, the destruction of a forest is often used as a symbol for:`,
    options: [
      "economic development",
      "political freedom",
      "the loss of natural heritage and the consequences of human short-sightedness",
      "ancient history",
    ],
    correctAnswer: 2,
    explanation: `Destroyed forests symbolise the cost of prioritising short-term gain over long-term environmental health — a powerful symbol of loss.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'ecology' comes from the Greek 'oikos' (house) and 'logos' (study). This etymology tells us:`,
    options: [
      "Ecology is about household chores",
      "Ecology is the study of the natural home — the environment as a living system",
      "Ecology is only relevant to scientists",
      "Logos means writing",
    ],
    correctAnswer: 1,
    explanation: `'Oikos' = home/house. Ecology literally means the study of our natural home — the environment as a system of interrelated parts.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In academic writing, 'nevertheless' is used to:`,
    options: [
      "add a supporting point",
      "show cause and effect",
      "introduce a contrasting idea despite what was just said",
      "ask a question",
    ],
    correctAnswer: 2,
    explanation: `'Nevertheless' introduces a contrast or qualification — 'despite what I just said, consider this opposing point.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `Which sentence uses a COLLECTIVE NOUN correctly?`,
    options: [
      "A flock of birds migrate south each year",
      "The birds flock was flying south",
      "Flock birds were flying south",
      "A flock migrate south",
    ],
    correctAnswer: 0,
    explanation: `'A flock of birds' correctly uses the collective noun. Note: 'A flock... migrates' (singular) is standard, but 'migrate' is accepted in some dialects.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Comparative Adjectives",
    question: `Which correctly uses the COMPARATIVE form?`,
    options: [
      "Bamboo is more stronger than wood",
      "Bamboo is strongest than wood",
      "Bamboo is stronger than many types of wood",
      "Bamboo is more strong than wood",
    ],
    correctAnswer: 2,
    explanation: `For short adjectives like 'strong', add '-er' for comparison. 'Stronger than' is correct.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation — Colon",
    question: `Which sentence correctly uses a COLON?`,
    options: [
      "Bamboo has many uses: construction, crafts, and music",
      "Bamboo has: many uses including construction",
      "Bamboo: is used in construction, crafts, and music",
      "Bamboo has many: uses in Jamaica",
    ],
    correctAnswer: 0,
    explanation: `A colon introduces a list or explanation after a complete clause. Option A does this correctly.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Which sentence correctly uses the PASSIVE VOICE in the present perfect tense?`,
    options: [
      "Scientists discovered bamboo's benefits",
      "Scientists have discovered bamboo's benefits",
      "Bamboo's benefits have been discovered by scientists",
      "Scientists discovering bamboo's benefits",
    ],
    correctAnswer: 2,
    explanation: `Present perfect passive: have/has been + past participle. 'Have been discovered by scientists' is correct.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conditional — Second",
    question: `Which is a SECOND CONDITIONAL sentence?`,
    options: [
      "If we use bamboo, we will reduce emissions",
      "If we used bamboo more, we would reduce emissions significantly",
      "We used bamboo to reduce emissions",
      "If we had used bamboo, we would have reduced emissions",
    ],
    correctAnswer: 1,
    explanation: `Second conditional: if + past simple, would + infinitive. Used for hypothetical or unlikely situations.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Clauses",
    question: `Which correctly uses a NON-DEFINING relative clause?`,
    options: [
      "The bamboo that grows in Jamaica is used for construction",
      "Bamboo which is versatile is used widely",
      "Bamboo, which can grow a metre a day, is one of the fastest-growing plants on Earth",
      "The bamboo growing in the garden is tall",
    ],
    correctAnswer: 2,
    explanation: `A non-defining relative clause adds non-essential information, enclosed in commas. 'Which can grow a metre a day' is extra information — the sentence makes sense without it.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Dangling Modifiers",
    question: `Identify the DANGLING MODIFIER: 'Growing at extraordinary speed, the engineers used bamboo to build bridges.'`,
    options: [
      "Growing at extraordinary speed",
      "the engineers",
      "used bamboo",
      "to build bridges",
    ],
    correctAnswer: 0,
    explanation: `'Growing at extraordinary speed' should describe bamboo, not the engineers. This is a dangling modifier — the subject it modifies (bamboo) is missing from the main clause.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Cleft Sentences",
    question: `Which is a CLEFT SENTENCE emphasising the location?`,
    options: [
      "Bamboo grows very fast in tropical regions",
      "It is in tropical regions that bamboo grows most rapidly",
      "Tropical regions have fast-growing bamboo",
      "Bamboo, which grows rapidly, is found in tropical regions",
    ],
    correctAnswer: 1,
    explanation: `'It is in tropical regions that...' is a cleft structure emphasising the location — the prepositional phrase is highlighted.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Subjunctive",
    question: `Which correctly uses the SUBJUNCTIVE?`,
    options: [
      "It is vital that everyone knows about bamboo",
      "It is vital that everyone know about bamboo",
      "Everyone should know about bamboo",
      "Knowing about bamboo is vital",
    ],
    correctAnswer: 1,
    explanation: `The subjunctive uses the base form of the verb after expressions of necessity: 'It is vital that everyone KNOW' (not 'knows').`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cohesive Devices",
    question: `Which sentence uses a COHESIVE DEVICE to link ideas?`,
    options: [
      "Bamboo grows quickly. It is very strong.",
      "Bamboo grows quickly. Bamboo is very strong.",
      "Bamboo grows quickly; moreover, it is among the strongest natural materials available.",
      "Bamboo is strong. Bamboo grows fast.",
    ],
    correctAnswer: 2,
    explanation: `'Moreover' is a conjunctive adverb that adds a further supporting point — it creates cohesion by explicitly connecting and relating the two clauses.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Informative Writing",
    question: `An informative leaflet about bamboo should include:`,
    options: [
      "Only the writer's opinions about bamboo",
      "Fiction stories about bamboo forests",
      "Accurate factual information clearly organised, with headings, to educate readers about bamboo's properties and uses",
      "As much technical language as possible",
    ],
    correctAnswer: 2,
    explanation: `Informative writing prioritises accurate, well-organised facts — headings help readers navigate and find information quickly.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Descriptive Language",
    question: `Which sentence uses MOST effective descriptive language?`,
    options: [
      "Bamboo grows quickly",
      "Bamboo is tall and green",
      "Shooting upward with extraordinary speed, bamboo rises from the earth like a living tower — patient, flexible, and astonishing",
      "Bamboo is a type of plant",
    ],
    correctAnswer: 2,
    explanation: `Precise verbs ('shooting,' 'rises'), a simile ('like a living tower'), and adjectives ('patient, flexible, astonishing') create a vivid, dynamic description.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Extended Argument",
    question: `When building a SUSTAINED argument over several paragraphs, a writer should:`,
    options: [
      "Start a new argument in each paragraph",
      "Use the same evidence repeatedly",
      "Ensure each paragraph adds a new, distinct point that advances the overall argument, while linking back to the thesis",
      "Write very short paragraphs with no evidence",
    ],
    correctAnswer: 2,
    explanation: `An extended argument progresses — each paragraph adds something new while the whole remains unified by the central thesis.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Rhetorical Devices",
    question: `'If bamboo can hold up a house, why can we not trust it to hold up our future?' This rhetorical question:`,
    options: [
      "Asks for a literal answer about engineering",
      "Has no persuasive purpose",
      "Engages readers' reasoning and creates a sense of urgency — challenging them to question their own assumptions about sustainable materials",
      "Is grammatically incorrect",
    ],
    correctAnswer: 2,
    explanation: `The rhetorical question invites readers to reason alongside the writer — it creates engagement and challenges a sceptical assumption.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Literary Analysis",
    question: `A student writes: 'The writer uses the metaphor of bamboo bending without breaking to argue that resilience is more powerful than rigid strength.' Evaluate this analysis.`,
    options: [
      "It is incorrect — bamboo is not a metaphor",
      "It is complete and sophisticated — it identifies the technique, explains the argument it carries, and connects it to a broader idea",
      "It is too long",
      "It needs more quotations",
    ],
    correctAnswer: 1,
    explanation: `This analysis correctly identifies the technique (metaphor), explains its meaning (bending = adapting), and draws a conclusion about the argument it supports — this is strong literary analysis.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix3Questions : g5LaMix3Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 3</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 3</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 3</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
