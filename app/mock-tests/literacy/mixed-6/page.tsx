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

const g5LaMix6Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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

"The Taino were the first people to inhabit Jamaica, arriving on the island approximately 2,500 years ago from South America. They called the island 'Xaymaca,' meaning 'Land of Wood and Water.' They were skilled farmers, fishers, and craftspeople, and their society was organised into villages led by chiefs called caciques. When Spanish colonisers arrived in 1494, the Taino population, estimated at around 60,000, was devastated by disease, forced labour, and violence. Within fifty years, the Taino had largely disappeared as a distinct people. Yet their legacy lives on in Jamaica — in place names like Ocho Rios and Negril, in foods like cassava and barbecue, and in the very name 'Jamaica' itself, derived from 'Xaymaca.'"

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
    question: `Which word is a SYNONYM for 'indigenous'?`,
    options: [
      "foreign",
      "colonial",
      "imported",
      "native",
    ],
    correctAnswer: 3,
    explanation: `'Native' means originating from a particular place — a synonym for 'indigenous.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'flourish' is:`,
    options: [
      "thrive",
      "prosper",
      "grow",
      "decline",
    ],
    correctAnswer: 3,
    explanation: `'Decline' means to grow weaker or smaller — the opposite of 'flourish' (to grow and thrive).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The INDIGENOUS community had lived in the valley for thousands of years before the arrival of outsiders. 'Indigenous' means:`,
    options: [
      "recently arrived",
      "foreign in origin",
      "originating and living naturally in a particular region",
      "educated and literate",
    ],
    correctAnswer: 2,
    explanation: `'Indigenous' describes peoples or organisms that are native to and naturally originating from a specific place.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'The Taino's way of life was wiped off the map.' This idiom means:`,
    options: [
      "Their maps were destroyed",
      "Their territory was removed from official maps",
      "Their entire culture and existence was eliminated",
      "They moved to a different location",
    ],
    correctAnswer: 2,
    explanation: `'Wiped off the map' means completely erased from existence — destroyed so thoroughly that no trace remains.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'The names the Taino gave to this island live on like seeds in the soil.' What does this simile suggest?`,
    options: [
      "Seeds grow quickly",
      "Taino names are buried and forgotten",
      "Taino names endure beneath the surface of Jamaican culture, quietly alive and continuing to grow",
      "Seeds cannot grow in Jamaica",
    ],
    correctAnswer: 2,
    explanation: `The simile compares Taino cultural legacy to seeds — present underground (in language and place names), still alive, and capable of growth.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `The word 'devastated' carries which connotation?`,
    options: [
      "mildly inconvenienced",
      "somewhat reduced",
      "slightly changed",
      "completely and catastrophically destroyed",
    ],
    correctAnswer: 3,
    explanation: `'Devastated' implies complete destruction — it is one of the strongest words for expressing total loss or ruin.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'legacy' means:`,
    options: [
      "a type of ancient map",
      "something left behind by a person or culture that continues to have influence",
      "a financial debt",
      "a colonial law",
    ],
    correctAnswer: 1,
    explanation: `A 'legacy' is what is left behind after someone or something is gone — continuing influence, traditions, or effects.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Symbol",
    question: `In Caribbean literature, the 'sea' often symbolises:`,
    options: [
      "fish and food",
      "danger only",
      "the Middle Passage, freedom, connection to Africa, or the unknown",
      "trade and commerce only",
    ],
    correctAnswer: 2,
    explanation: `The sea is a rich, multi-layered symbol in Caribbean writing — associated with forced migration (Middle Passage), freedom, connection to African origins, and the unknown.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'colony' comes from the Latin 'colonia' meaning 'settlement' or 'farm.' This etymology reveals:`,
    options: [
      "Colonies were peaceful agricultural settlements",
      "The word's origins mask its political reality — a 'colony' was a settlement of people imposed on a territory already inhabited",
      "Colonialism was primarily about farming",
      "Latin was the first language of Jamaica",
    ],
    correctAnswer: 1,
    explanation: `The agricultural etymology obscures the political violence of colonialism — 'colony' sounds benign but represented imposed control over occupied territories.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In academic writing, 'in contrast' is used to:`,
    options: [
      "add a supporting point",
      "show cause and effect",
      "introduce something that is different from what was just described",
      "conclude an argument",
    ],
    correctAnswer: 2,
    explanation: `'In contrast' signals that what follows is different from or opposite to what preceded — a comparison of differences.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Nouns",
    question: `Which is a COLLECTIVE NOUN for a group of settlers?`,
    options: [
      "herd",
      "colony",
      "team",
      "pack",
    ],
    correctAnswer: 1,
    explanation: `A 'colony' names a group of settlers — it is a collective noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tenses",
    question: `Which sentence uses the PAST CONTINUOUS correctly?`,
    options: [
      "The Taino were living on the island when Europeans arrived",
      "The Taino had lived on the island",
      "The Taino lived on the island",
      "The Taino was living on the island",
    ],
    correctAnswer: 0,
    explanation: `Past continuous (was/were + -ing) describes an ongoing past action interrupted by another: 'were living when Europeans arrived.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Which correctly punctuates a LIST with a COLON?`,
    options: [
      "Jamaica has three Taino-derived place names: Ocho Rios, Negril, and Xaymaca.",
      "Jamaica has: three Taino-derived place names, Ocho Rios, Negril, and Xaymaca.",
      "Jamaica has three Taino-derived place names, Ocho Rios: Negril and Xaymaca.",
      "Jamaica: has three Taino-derived place names, Ocho Rios, Negril and Xaymaca.",
    ],
    correctAnswer: 0,
    explanation: `A colon after a complete clause introduces the list. Items are separated by commas. Option A is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Active/Passive",
    question: `Change to ACTIVE VOICE: 'The Taino population was devastated by disease and violence.'`,
    options: [
      "Disease and violence devastated the Taino population",
      "The population was being devastated",
      "The Taino devastated by disease and violence",
      "Devastation of the Taino population by disease and violence",
    ],
    correctAnswer: 0,
    explanation: `Active: subject (disease and violence) performs action (devastated) on object (the Taino population).`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Relative Clauses",
    question: `Which correctly uses WHO (for people) and WHICH (for things)?`,
    options: [
      "The Taino who lived in Jamaica, which were known as Xaymaca, were skilled farmers",
      "The Taino, who lived in Jamaica, called the island Xaymaca, which means 'Land of Wood and Water'",
      "The Taino which lived in Jamaica were known as Xaymaca",
      "The island which the Taino who named it Xaymaca was their home",
    ],
    correctAnswer: 1,
    explanation: `'Who' for people (Taino), 'which' for things (Xaymaca/island). Option B uses both correctly.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Tense Sequence",
    question: `Which sentence shows correct TENSE SEQUENCE?`,
    options: [
      "The Taino had already settled the island before the Spanish arrived",
      "The Taino settled the island before the Spanish had arrived",
      "The Taino are settling the island before the Spanish arrived",
      "The Taino settled the island after the Spanish arrived",
    ],
    correctAnswer: 0,
    explanation: `The past perfect ('had already settled') shows the Taino settlement was completed BEFORE the Spanish arrival (simple past).`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'We call this island Xaymaca,' the cacique said.`,
    options: [
      "The cacique said that they call this island Xaymaca",
      "The cacique said that they called that island Xaymaca",
      "The cacique said we call this island Xaymaca",
      "The cacique told that island was called Xaymaca",
    ],
    correctAnswer: 1,
    explanation: `Reported speech: 'we' → 'they'; 'call' → 'called'; 'this' → 'that.' 'That' introduces the reported clause.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Conditional — Third",
    question: `'If the Spanish had never arrived, the Taino civilisation would have continued to flourish.' This is a:`,
    options: [
      "First conditional",
      "Second conditional",
      "Third conditional — past hypothetical",
      "Zero conditional",
    ],
    correctAnswer: 2,
    explanation: `Third conditional: if + past perfect, would have + past participle. Imagines an alternative history.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Inversion",
    question: `'Seldom ___ a civilisation so completely transformed so quickly by outside contact.'`,
    options: [
      "is",
      "has been",
      "have",
      "had been",
    ],
    correctAnswer: 1,
    explanation: `After 'Seldom', inversion places 'has been' before the subject: 'Seldom has a civilisation been...'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cleft Sentences",
    question: `Which CLEFT SENTENCE emphasises what the Taino named the island?`,
    options: [
      "The Taino named the island Xaymaca",
      "It was the Taino who named the island Xaymaca",
      "It was Xaymaca that the Taino named the island",
      "The island Xaymaca was named by the Taino",
    ],
    correctAnswer: 2,
    explanation: `'It was Xaymaca that...' emphasises the name by placing it in the cleft position.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Informative Writing",
    question: `An informative essay about the Taino people should:`,
    options: [
      "Use only one source of information",
      "Include only what the writer finds interesting",
      "Present accurate, well-organised historical information with evidence, showing respect for the Taino as a complex and significant civilisation",
      "Argue that the Taino were more important than the Spanish",
    ],
    correctAnswer: 2,
    explanation: `Good informative historical writing presents accurate, evidenced, balanced information — treating its subjects with scholarly respect.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Historical Writing Register",
    question: `Which sentence is MOST appropriate for a formal historical essay?`,
    options: [
      "The Taino were, like, really important in Jamaica's history",
      "The Taino people are widely recognised as the first inhabitants of Jamaica, arriving approximately 2,500 years ago",
      "Taino people came to Jamaica a long time ago",
      "The Taino were important and then they were gone",
    ],
    correctAnswer: 1,
    explanation: `Formal historical writing uses precise dates, measured language, and specific claims. Option B exemplifies this register.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Writing About Loss",
    question: `A student writes about the disappearance of the Taino. Which approach is MOST appropriate?`,
    options: [
      "Describe it without any feeling",
      "Blame only the Spanish with no nuance",
      "Acknowledge the causes (disease, violence, forced labour) with accuracy while conveying the enormity of what was lost — a civilisation erased",
      "Argue that the Taino brought it on themselves",
    ],
    correctAnswer: 2,
    explanation: `Writing about historical tragedy requires accuracy (naming real causes), nuance (not simplifying), and awareness of the human scale of the loss.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Thesis for Historical Argument",
    question: `Which is the STRONGEST thesis for an essay about the Taino legacy?`,
    options: [
      "The Taino lived in Jamaica before the Spanish",
      "Jamaica's Taino heritage is well-documented",
      "Though the Taino people were largely destroyed within fifty years of European contact, their cultural legacy endures in Jamaica's language, food, and place names — a testament to the persistence of culture even in the face of catastrophic loss",
      "The Taino were a peaceful people",
    ],
    correctAnswer: 2,
    explanation: `This thesis makes a specific, supported, arguable claim — the paradox of physical destruction yet cultural survival — which gives the essay a compelling central argument.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Analytical Writing",
    question: `A student writes: 'The persistence of Taino words in Jamaican place names suggests that language outlives even the most violent attempts at cultural erasure.' Evaluate this claim.`,
    options: [
      "This is an interesting but unsubstantiated opinion",
      "This is factually wrong — Taino names were all replaced",
      "This is a sophisticated analytical claim that connects specific evidence (Taino place names) to a broader idea about cultural resilience and the limits of colonial power",
      "This is too simple for analysis",
    ],
    correctAnswer: 2,
    explanation: `The claim moves from evidence (place names) to interpretation (cultural persistence despite erasure) — this is analytical thinking at its most sophisticated.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix6Questions : g5LaMix6Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Language Arts",
        testName: "Mixed 6",
        difficulty: "Mixed",
        score: calcScore(),
        totalQuestions,
        percentage: scorePct(),
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    }
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 6</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 6</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 6</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
