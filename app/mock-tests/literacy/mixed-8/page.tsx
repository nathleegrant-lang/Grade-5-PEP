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

const g5LaMix8Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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

"Music has always been more than entertainment. For enslaved Africans in Jamaica, music was a means of communication, resistance, and spiritual survival. Work songs, drumming, and the ceremonies of Kumina and Jonkanoo allowed communities to maintain cultural identity under conditions designed to strip them of everything. After emancipation, music continued to evolve — from mento to ska to rocksteady to reggae — each new form reflecting the social conditions of its time. Bob Marley took reggae to the world, but he was part of a long tradition of musicians using sound as a vehicle for truth, protest, and connection. Today, dancehall and Afrobeats continue this tradition, connecting Jamaica to a global conversation about Black identity, joy, and resistance."

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
    question: `Which word is a SYNONYM for 'resistance'?`,
    options: [
      "surrender",
      "submission",
      "compliance",
      "defiance",
    ],
    correctAnswer: 3,
    explanation: `'Defiance' means bold refusal to obey or submit — a synonym for 'resistance.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'oppression' is:`,
    options: [
      "control",
      "domination",
      "liberation",
      "suppression",
    ],
    correctAnswer: 2,
    explanation: `'Liberation' means freedom from oppression — the direct opposite.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Enslaved Africans used music as a form of COVERT communication. 'Covert' means:`,
    options: [
      "loud and open",
      "official and legal",
      "secret and hidden",
      "traditional and ancient",
    ],
    correctAnswer: 2,
    explanation: `'Covert' means done secretly — hidden from those who held power over the enslaved people.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'Bob Marley carried the torch for Jamaican music globally.' 'Carried the torch' means:`,
    options: [
      "He literally used fire",
      "He performed outdoors",
      "He continued and advanced a tradition or cause, keeping it alive and visible",
      "He was the first to use music",
    ],
    correctAnswer: 2,
    explanation: `'Carrying the torch' means continuing and championing a tradition or cause — keeping it alive for others to see.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Music was the lifeblood of resistance.' What does this metaphor argue?`,
    options: [
      "Blood was used in musical rituals",
      "Music was only one of many tools",
      "Music was as essential to the survival of resistance as blood is to the body — without it, resistance could not live",
      "Music is only for entertainment",
    ],
    correctAnswer: 2,
    explanation: `Calling music 'lifeblood' equates it with the essential force keeping resistance alive — it was not peripheral but central and vital.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which phrase has the MOST empowering connotation for a community facing oppression?`,
    options: [
      "singing sad songs",
      "cultural preservation",
      "cultural resistance through music",
      "musical entertainment",
    ],
    correctAnswer: 2,
    explanation: `'Cultural resistance through music' frames music as an act of defiance — powerfully positive and empowering, not passive.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `In the context of this passage, 'protest music' means:`,
    options: [
      "music that is very loud",
      "music played at official protests only",
      "music that uses sound as a vehicle for expressing social critique, demanding change, or bearing witness to injustice",
      "music that breaks rules",
    ],
    correctAnswer: 2,
    explanation: `'Protest music' uses the art form to challenge power, express grievances, and demand social change — it is inherently political.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Symbolism",
    question: `In Caribbean music, the drum is often used as a symbol of:`,
    options: [
      "warfare and conflict",
      "European musical tradition",
      "connection to African heritage, community identity, and resistance",
      "a simple musical instrument only",
    ],
    correctAnswer: 2,
    explanation: `The drum carries profound symbolic weight in African diaspora culture — representing ancestral connection, community, and resistance to cultural erasure.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'rhythm' comes from the Greek 'rhythmos' meaning 'measured motion or flow.' This etymology suggests:`,
    options: [
      "Rhythm is only for musicians",
      "Rhythm is simply noise",
      "Rhythm is a fundamental principle of movement and time — present in music, speech, nature, and life itself",
      "Rhythm was invented in Greece",
    ],
    correctAnswer: 2,
    explanation: `'Measured motion' reveals rhythm as a universal principle — it organises time and sound, reflecting deeper patterns in nature and human experience.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In academic writing, 'to substantiate' means:`,
    options: [
      "to disprove",
      "to ignore",
      "to provide evidence supporting a claim",
      "to simplify",
    ],
    correctAnswer: 2,
    explanation: `'Substantiate' means to support a claim with concrete evidence — to give it substance and credibility.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Collective Nouns",
    question: `Which is a COLLECTIVE NOUN for musicians?`,
    options: [
      "a band",
      "musicians",
      "a musical",
      "some players",
    ],
    correctAnswer: 0,
    explanation: `'A band' names a collective group of musicians — it is a collective noun.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Phrases",
    question: `Which contains a VERB PHRASE (auxiliary + main verb)?`,
    options: [
      "She sang beautifully",
      "The music was being used as resistance",
      "Resistance is important",
      "Music matters to communities",
    ],
    correctAnswer: 1,
    explanation: `'Was being used' is a verb phrase — past continuous passive (was + being + past participle).`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation — Parentheses",
    question: `Which correctly uses PARENTHESES?`,
    options: [
      "Drumming (an African tradition) was used for communication during slavery",
      "Drumming — an African tradition — was used for communication",
      "Drumming, (an African tradition,) was used",
      "Drumming an African tradition was used for communication",
    ],
    correctAnswer: 0,
    explanation: `Parentheses enclose supplementary information. Option A correctly adds 'an African tradition' as a non-essential aside.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Rewrite in PASSIVE: 'Enslaved Africans used music as a tool of resistance.'`,
    options: [
      "Music was used by enslaved Africans as a tool of resistance",
      "Enslaved Africans were using music",
      "Music used enslaved Africans",
      "Enslaved Africans' music resisted",
    ],
    correctAnswer: 0,
    explanation: `Passive: object (music) becomes subject + was + past participle (used) + by + agent.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conditional — Mixed",
    question: `'If reggae had not reached global audiences, the movement for social justice might be less visible today.' This is a:`,
    options: [
      "First conditional",
      "Second conditional",
      "Third conditional",
      "Mixed conditional — past condition, present result",
    ],
    correctAnswer: 3,
    explanation: `Mixed conditional: if + past perfect (hypothetical past), would/might + infinitive (present result). Shows a past event's hypothetical effect on the present.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Relative Clauses",
    question: `Which correctly distinguishes between WHO and WHICH?`,
    options: [
      "Bob Marley, who was born in St. Ann, created music which changed the world",
      "Bob Marley, which was born in St. Ann, created music who changed the world",
      "Bob Marley who was from Jamaica created music that who changed the world",
      "Bob Marley which was born in St. Ann created music",
    ],
    correctAnswer: 0,
    explanation: `'Who' for people (Bob Marley); 'which' for things (music). Option A is correct.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Inversion",
    question: `'Not only did reggae entertain, ___ it also carried a powerful political message.'`,
    options: [
      "but",
      "and",
      "so",
      "because",
    ],
    correctAnswer: 0,
    explanation: `'Not only... but also' is the paired conjunction used with inversion. 'Not only did it entertain, but it also...'`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Reported Speech — Statement with Tense Shift",
    question: `Change to REPORTED SPEECH: 'Music has always been our most powerful weapon,' he said.`,
    options: [
      "He said that music has always been their most powerful weapon",
      "He said that music had always been their most powerful weapon",
      "He said music always is their most powerful weapon",
      "He told music had been their weapon",
    ],
    correctAnswer: 1,
    explanation: `Present perfect ('has always been') → past perfect ('had always been') in reported speech; 'our' → 'their.'`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Gerund vs Infinitive",
    question: `Which sentence is grammatically correct?`,
    options: [
      "She continued singing despite the opposition",
      "She continued to singing despite the opposition",
      "She avoided to sing in public",
      "She refused singing publicly",
    ],
    correctAnswer: 0,
    explanation: `After 'continue,' both gerund and infinitive are acceptable. After 'avoid,' only gerund: 'avoided singing.' After 'refuse,' only infinitive: 'refused to sing.'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cleft for Emphasis",
    question: `Which CLEFT SENTENCE emphasises WHY music mattered?`,
    options: [
      "Music mattered because it preserved identity",
      "It was because it preserved identity that music mattered so profoundly",
      "Music preserved identity and that is why it mattered",
      "The reason was music preserved identity",
    ],
    correctAnswer: 1,
    explanation: `'It was because... that...' is a cleft structure emphasising the reason — the 'because' clause is highlighted.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose of Narrative in Argument",
    question: `A student opens a persuasive essay about music's social power with a story about a community choir that brought a divided neighbourhood together. This technique:`,
    options: [
      "Distracts from the argument",
      "Is only appropriate for fiction",
      "Makes the abstract argument concrete and emotionally resonant before the analytical case is presented",
      "Is a factual statement",
    ],
    correctAnswer: 2,
    explanation: `Opening with a narrative humanises the argument — it engages readers emotionally before presenting evidence and analysis.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Writing About Music as Culture",
    question: `An analytical essay about reggae as social protest should:`,
    options: [
      "Describe the music's sound only",
      "Focus only on Bob Marley",
      "Analyse how specific musical and lyrical choices reflect social conditions and carry political meaning",
      "List the most popular songs",
    ],
    correctAnswer: 2,
    explanation: `Cultural analysis of music examines how formal choices (rhythm, melody, lyrics) express social meaning — not just what music sounds like, but what it says and does.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Thesis Statement — Cultural Essay",
    question: `Which is the STRONGEST thesis for an essay arguing music is a form of resistance?`,
    options: [
      "Music is very popular",
      "Reggae is Jamaican music",
      "Music has historically served as one of the most powerful and accessible forms of resistance available to oppressed communities, creating spaces for identity, protest, and survival when other avenues were closed",
      "Bob Marley was very famous",
    ],
    correctAnswer: 2,
    explanation: `This thesis is broad (historical scope), specific (music as resistance), and makes a nuanced claim about WHY music matters — the inaccessibility of other forms of resistance.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Analytical Paragraph",
    question: `A student writes: 'The use of the drum in slave communities was not merely musical — it was a coded language that allowed communication beyond the surveillance of enslavers.' Evaluate this analytical claim.`,
    options: [
      "This is a factual error",
      "This is an interesting but poorly supported claim",
      "This is a sophisticated analytical claim that reframes music as a strategic, coded communicative act — it interprets evidence in light of a broader argument about resistance and surveillance",
      "This is too complex for an essay",
    ],
    correctAnswer: 2,
    explanation: `The claim is specific, evidenced (drums as coded communication), and analytical (positioned within an argument about resistance) — excellent literary/cultural analysis.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Evaluating Cultural Writing",
    question: `A student argues: 'To understand Bob Marley, you must understand the history of slavery, colonialism, and Rastafari in Jamaica.' Evaluate this claim.`,
    options: [
      "Context is irrelevant to understanding art",
      "This is an obvious statement requiring no analysis",
      "This is a sophisticated and defensible position — art is inseparable from its historical, cultural, and political context, and understanding that context deepens interpretation",
      "Artists create meaning independently of their context",
    ],
    correctAnswer: 2,
    explanation: `The claim argues for contextual reading — that historical and cultural knowledge enhances understanding. This is a sound and sophisticated critical position.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix8Questions : g5LaMix8Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 8",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 8</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 8</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 8</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
