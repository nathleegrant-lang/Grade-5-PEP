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

const g5LaMix10Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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

"Anansi, the spider, is one of the most important characters in Jamaican and Caribbean folklore. Originally a figure from Akan mythology brought to Jamaica by enslaved Ghanaians, Anansi became a symbol of wit, survival, and resistance. In story after story, Anansi outwits those more powerful than himself — gods, kings, animals — using intelligence and creativity rather than strength. For enslaved Africans, Anansi's stories were not merely entertainment. They were a philosophy: the small and powerless could survive and prevail through cleverness. The Anansi tradition also gave rise to a particular style of storytelling in Jamaica — the 'Anancy story' — characterised by trickery, surprise, and moral complexity. Today, Anansi lives on in children's books, films, and the work of writers like Neil Gaiman, who brought the character to a global audience in his novel 'American Gods.'"

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
    question: `Which word is a SYNONYM for 'cunning'?`,
    options: [
      "honest",
      "straightforward",
      "devious",
      "innocent",
    ],
    correctAnswer: 2,
    explanation: `'Devious' means cleverly deceptive — a synonym for 'cunning.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'prevail' is:`,
    options: [
      "succeed",
      "triumph",
      "win",
      "fail",
    ],
    correctAnswer: 3,
    explanation: `'Fail' means to be unsuccessful — the opposite of 'prevail' (to succeed or prove stronger).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The Anansi stories had a SUBVERSIVE quality — they challenged the idea that power always belongs to the strong. 'Subversive' means:`,
    options: [
      "traditional and obedient",
      "completely obvious",
      "deliberately undermining the established order",
      "very entertaining",
    ],
    correctAnswer: 2,
    explanation: `'Subversive' describes something that quietly challenges or undermines accepted power structures — exactly what Anansi stories do.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'Anansi always had an ace up his sleeve.' This idiom means:`,
    options: [
      "Anansi wore unusual clothing",
      "Anansi kept a card game hidden",
      "Anansi always had a secret plan or advantage that others did not know about",
      "Anansi played card games",
    ],
    correctAnswer: 2,
    explanation: `'An ace up one's sleeve' means having a hidden, powerful advantage kept in reserve for the right moment.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Anansi's stories were a philosophy wrapped in a story.' What does this metaphor argue?`,
    options: [
      "Stories and philosophy are opposites",
      "Anansi's tales were just entertainment",
      "The Anansi stories contained deep ideas about survival and power, concealed within the entertaining form of a folk tale",
      "Philosophy should be told as stories",
    ],
    correctAnswer: 2,
    explanation: `'Wrapped in a story' suggests the philosophy is the content and the story is the container — the wisdom is encoded within the entertainment.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the MOST positive connotation when describing intelligence used to overcome challenges?`,
    options: [
      "cunning",
      "deceptive",
      "manipulative",
      "resourceful",
    ],
    correctAnswer: 3,
    explanation: `'Resourceful' suggests using available means cleverly and constructively — positive. The others imply dishonesty or manipulation.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `'Mythology' refers to:`,
    options: [
      "made-up stories with no value",
      "a type of history book",
      "a collection of traditional stories that explain the beliefs, values, and origins of a culture",
      "scientific facts about the past",
    ],
    correctAnswer: 2,
    explanation: `'Mythology' is the body of traditional stories belonging to a culture — often explaining origins, values, and the nature of the world.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Extended Metaphor",
    question: `If Anansi is described as 'a mirror in which the powerless see themselves reflected in triumph,' the mirror represents:`,
    options: [
      "literal reflection",
      "a tool for vanity",
      "the stories as a way for the powerless to see their own potential for victory and dignity",
      "glass-making",
    ],
    correctAnswer: 2,
    explanation: `The mirror metaphor suggests the stories serve a reflective function — showing oppressed people an image of themselves succeeding, which affirms their dignity and capacity.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'folklore' comes from 'folk' (ordinary people) and 'lore' (traditional knowledge). This etymology tells us:`,
    options: [
      "Folklore is only for children",
      "Folklore is academic and complex",
      "Folklore is the traditional knowledge, stories, and culture belonging to and created by ordinary people",
      "Folklore is European in origin",
    ],
    correctAnswer: 2,
    explanation: `'Folk' = common people, 'lore' = knowledge/tradition. Folklore literally belongs to and comes from ordinary people — not elites or institutions.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `'Seminal' in academic writing means:`,
    options: [
      "recent and trendy",
      "controversial and disputed",
      "highly influential and foundational — having a major impact on what came after",
      "unimportant and overlooked",
    ],
    correctAnswer: 2,
    explanation: `A 'seminal' work is one that was so influential it shaped an entire field or tradition — foundational and generative of further development.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Parts of Speech",
    question: `In 'Anansi cleverly outwitted the powerful god,' which word is an ADVERB?`,
    options: [
      "Anansi",
      "cleverly",
      "outwitted",
      "powerful",
    ],
    correctAnswer: 1,
    explanation: `'Cleverly' describes HOW Anansi outwitted — it is an adverb modifying the verb.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the sentence with an EFFECTIVE chain of adjectives:`,
    options: [
      "The clever, resourceful, powerless spider defeated the mighty god",
      "The spider defeated the god",
      "Anansi was clever",
      "The spider was very good",
    ],
    correctAnswer: 0,
    explanation: `A chain of adjectives ('clever, resourceful, powerless') creates a vivid, complex characterisation of Anansi.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation — Dash for Parenthetical",
    question: `Which correctly uses a DASH to add explanatory information?`,
    options: [
      "Anansi — the spider — is one of the most important figures in Caribbean folklore",
      "Anansi the spider — is one of the most important figures — in Caribbean folklore",
      "Anansi the spider is — one of the most important figures — in Caribbean folklore",
      "Anansi — the spider is one of the most important figures in Caribbean folklore",
    ],
    correctAnswer: 0,
    explanation: `Dashes enclose a parenthetical explanation (an aside). 'The spider' is the aside, correctly enclosed by two dashes.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Which uses the PASSIVE VOICE with a modal verb?`,
    options: [
      "Anansi must be understood as a symbol of resistance",
      "Anansi represents resistance",
      "We must understand Anansi as a symbol",
      "Anansi's stories must convey resistance",
    ],
    correctAnswer: 0,
    explanation: `Modal passive: modal (must) + be + past participle (understood). Option A is correct.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conditional — Mixed",
    question: `'If Anansi had not become part of Caribbean folklore, the tradition of resistance through wit might not exist today.' This is a:`,
    options: [
      "First conditional",
      "Second conditional",
      "Third conditional",
      "Mixed conditional — past hypothetical condition, present result",
    ],
    correctAnswer: 3,
    explanation: `Mixed conditional: if + past perfect (past hypothetical), would/might + infinitive (present consequence).`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Clauses — Defining vs Non-Defining",
    question: `Which sentence uses the distinction correctly?`,
    options: [
      "Anansi who was brought from West Africa represents resistance",
      "Anansi, who was originally an Akan figure from West Africa, became a symbol of Caribbean resistance",
      "The spider which was named Anansi is important",
      "Anansi that came from West Africa is important",
    ],
    correctAnswer: 1,
    explanation: `Non-defining (commas + who) for people: adds non-essential detail about Anansi's origin without defining which Anansi is meant.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'Anansi always wins because he thinks, not because he fights,' said the storyteller.`,
    options: [
      "The storyteller said Anansi always won because he thought, not because he fought",
      "The storyteller said that Anansi always wins because he thinks",
      "The storyteller told Anansi wins because he thinks",
      "The storyteller said Anansi always won not because he fought",
    ],
    correctAnswer: 0,
    explanation: `Reported speech: present tenses shift to past; 'always wins' → 'always won'; 'thinks' → 'thought'; 'fights' → 'fought.'`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Subjunctive",
    question: `'It is fitting that folklore BE preserved and taught in schools.' The subjunctive 'be' is used because:`,
    options: [
      "'Be' is always correct after 'that'",
      "After expressions of appropriateness/necessity, the subjunctive uses the base form 'be' (not 'is')",
      "It is a grammatical error",
      "'Preserved' requires 'be' before it",
    ],
    correctAnswer: 1,
    explanation: `After 'It is fitting/necessary/important that...', the subjunctive uses the base form: 'be preserved' (not 'is preserved').`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Inversion for Literary Effect",
    question: `'Never before had a spider so small outsmarted gods so powerful.' What does the inversion achieve?`,
    options: [
      "It corrects a grammar mistake",
      "It is simply an alternative word order",
      "It creates dramatic emphasis — the extraordinary nature of Anansi's achievement is highlighted by the formal, literary inversion",
      "It makes the sentence shorter",
    ],
    correctAnswer: 2,
    explanation: `Inversion after 'Never' ('had a spider... outsmarted') creates a formal, literary effect — emphasising the extraordinary by giving it an elevated grammatical structure.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cohesive Devices",
    question: `Which uses multiple COHESIVE DEVICES most effectively?`,
    options: [
      "Anansi is clever. He wins. Stories are important.",
      "Anansi wins. This is why stories matter. Stories help.",
      "Anansi's cleverness repeatedly triumphs over brute strength; consequently, the stories argue that intelligence is the most powerful form of resistance. Furthermore, they suggest this is a philosophy available to anyone, regardless of their power or status.",
      "Anansi wins because he is clever and the stories are about this and they argue intelligence matters.",
    ],
    correctAnswer: 2,
    explanation: `Multiple cohesive devices: precise noun ('cleverness'), conjunctive adverb ('consequently'), logical argument, 'furthermore' for addition — sophisticated academic prose.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose of Folklore Writing",
    question: `A student writes a creative retelling of an Anansi story for younger children. The PRIMARY purpose is:`,
    options: [
      "To demonstrate academic knowledge",
      "To criticise the original folklore",
      "To entertain while passing on cultural values and wisdom embedded in the story",
      "To write an essay about folklore",
    ],
    correctAnswer: 2,
    explanation: `Creative retellings of folklore entertain while transmitting cultural values — the two purposes work together.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Narrative Technique — Trickster",
    question: `When writing a trickster story, the most important element to establish early is:`,
    options: [
      "The moral lesson, stated directly",
      "The trickster's physical appearance only",
      "The power imbalance — showing that the trickster is outmatched in strength but potentially superior in wit",
      "The story's setting in careful geographic detail",
    ],
    correctAnswer: 2,
    explanation: `The trickster genre depends on the tension between power and cleverness — the reader must feel the protagonist is genuinely outmatched before experiencing the pleasure of the reversal.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Analytical Claim — Folklore",
    question: `A student writes: 'Anansi stories gave the powerless a framework for survival — not by denying oppression, but by imagining its defeat.' Evaluate this claim.`,
    options: [
      "This is an incorrect interpretation of folklore",
      "This is too philosophical for analysis",
      "This is a sophisticated and well-founded claim — it correctly identifies both the realism of the stories (acknowledging oppression) and their function (imagining and rehearsing victory)",
      "This needs no evaluation — it is obviously true",
    ],
    correctAnswer: 2,
    explanation: `The claim is analytical: it identifies both what the stories acknowledge (oppression is real) and what they do (rehearse victory). It is specific, arguable, and deeply insightful.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Thesis — Cultural Argument",
    question: `Which is the STRONGEST thesis for an essay arguing Anansi stories have contemporary relevance?`,
    options: [
      "Anansi is a spider who plays tricks",
      "Anansi stories are from West Africa",
      "The Anansi tradition remains profoundly relevant because its central argument — that wit and creativity can overcome brute power — speaks directly to any community that faces systemic disadvantage",
      "Anansi is still told in some places",
    ],
    correctAnswer: 2,
    explanation: `This thesis argues for contemporary relevance with a specific reason (the argument about wit vs power), and positions the stories as broadly applicable — a strong, arguable, specific claim.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Synthesis in Literary Analysis",
    question: `An analytical essay uses the Anansi stories, Miss Lou's Patois poetry, and reggae music as examples. A student synthesises them by:`,
    options: [
      "Treating each separately in three disconnected paragraphs",
      "Summarising each one in turn",
      "Drawing out the connecting argument — that Caribbean cultural forms consistently use creativity, language, and wit as tools of resistance — with each example deepening the analysis",
      "Writing about one at a time without connecting them",
    ],
    correctAnswer: 2,
    explanation: `Synthesis finds the argument that unifies multiple examples — here, 'creativity as resistance' connects Anansi, Miss Lou, and reggae into a coherent cultural argument that is stronger than any one example alone.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix10MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix10Questions : g5LaMix10Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 10</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 10</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 10</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
