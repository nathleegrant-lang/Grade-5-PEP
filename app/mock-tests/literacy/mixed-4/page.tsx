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

const g5LaMix4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

What is this passage MAINLY about?`,
    options: [
      "Miss Lou's personal life",
      "A famous Jamaican comedian",
      "Miss Lou's deliberate use of Jamaican Creole as a political and cultural act of resistance",
      "The history of the Jamaican language",
    ],
    correctAnswer: 2,
    explanation: `The passage focuses on Miss Lou's choice to write and perform in Patois as a political and cultural decision — this is the central subject.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

What was the common criticism of Jamaican Creole at the time Miss Lou was performing?`,
    options: [
      "It was too difficult to learn",
      "It was a lesser language unfit for literature",
      "It was only spoken by older people",
      "It was too similar to English",
    ],
    correctAnswer: 1,
    explanation: `The passage states Jamaican Creole was 'dismissed by many as a lesser language unworthy of literature or performance.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

The phrase 'act of resistance' in the passage means:`,
    options: [
      "A theatre performance",
      "A criminal action",
      "A deliberate challenge to an established power or norm",
      "An act of self-defence",
    ],
    correctAnswer: 2,
    explanation: `'Act of resistance' means a deliberate, principled challenge to something in power — here, Miss Lou challenged the colonial idea that Patois was inferior.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Literal Comprehension",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

According to the passage, Miss Lou's face appears on:`,
    options: [
      "The Jamaican flag",
      "Jamaican currency",
      "The cover of a famous book",
      "A statue in Kingston",
    ],
    correctAnswer: 1,
    explanation: `The passage states 'her face appears on Jamaican currency.'`
  },
  {
    id: 5,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

Which statement is an OPINION?`,
    options: [
      "Miss Lou's work is studied as literature",
      "Her face appears on Jamaican currency",
      "Miss Lou was the greatest artist Jamaica ever produced",
      "Her recordings are archived as cultural treasures",
    ],
    correctAnswer: 2,
    explanation: `'Greatest artist Jamaica ever produced' is a subjective judgement — an opinion. The others are factual statements from the passage.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

What does the passage imply about the political context in which Miss Lou performed?`,
    options: [
      "Jamaica was fully independent and culturally confident",
      "There was no pressure to conform to any particular language standard",
      "Colonial values about language and culture still strongly influenced what was considered legitimate — Miss Lou's choice was therefore bold",
      "Everyone supported Patois performance",
    ],
    correctAnswer: 2,
    explanation: `By describing the pressure to use Standard English and Miss Lou's choice as 'political,' the passage implies colonial values still dominated — making her choice genuinely courageous.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

Why does the author emphasise that Miss Lou's language choice was 'not simply a stylistic choice' but 'a political and cultural act of resistance'?`,
    options: [
      "To suggest she was breaking the law",
      "To correct a possible misreading — readers might see her Patois as a quirk rather than a deliberate, principled decision",
      "To argue all writers should use Patois",
      "To praise her style only",
    ],
    correctAnswer: 1,
    explanation: `The author pre-empts a shallow reading by insisting the choice was political — elevating Miss Lou from entertainer to cultural activist.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

What was the EFFECT of Miss Lou's decision to perform in Patois?`,
    options: [
      "She became unpopular with all audiences",
      "Nothing changed",
      "She demonstrated that Jamaican language was a rich, valid medium — contributing to the recognition of Jamaican culture as worthy of celebration and study",
      "The government was angry",
    ],
    correctAnswer: 2,
    explanation: `Miss Lou's long-term effect was to legitimise Patois as a cultural and literary medium — her legacy is now studied, archived, and appears on currency.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

The tone of the passage is BEST described as:`,
    options: [
      "Critical of Miss Lou's choices",
      "Completely neutral with no perspective",
      "Admiring and celebratory — presenting Miss Lou as a cultural hero whose choices had lasting significance",
      "Dismissive of Jamaican Creole",
    ],
    correctAnswer: 2,
    explanation: `The rich, positive language ('beloved,' 'treasures,' 'celebrated') and the presentation of Miss Lou's legacy shows clear admiration.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

The CENTRAL theme of this passage is:`,
    options: [
      "The history of the Jamaican entertainment industry",
      "Why Patois is easier than Standard English",
      "Language is not merely a communication tool — it is a site of power, identity, and resistance, and Miss Lou's choice to use it was a profound cultural act",
      "Miss Lou was very popular",
    ],
    correctAnswer: 2,
    explanation: `The passage consistently argues that language choices are political — Miss Lou's Patois was not just a way of speaking but an assertion of cultural identity and dignity.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

A critical reader might ask: 'Was Miss Lou the only person performing in Patois, or were there others?' What would this question reveal?`,
    options: [
      "It reveals the reader is disrespectful",
      "It is irrelevant to the passage",
      "It probes the passage's tendency to individualise what might have been a broader cultural movement — asking whether Miss Lou was unique or representative",
      "It suggests Miss Lou was not important",
    ],
    correctAnswer: 2,
    explanation: `Critical reading questions whether the passage oversimplifies by focusing on one individual — was Miss Lou exceptional, or part of a broader cultural shift?`
  },
  {
    id: 12,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

What is the author's IMPLICIT argument about what Miss Lou's legacy proves?`,
    options: [
      "That performers should always entertain",
      "That Patois is better than Standard English",
      "That cultural forms created by ordinary people and in everyday language can achieve lasting, legitimate artistic and political significance",
      "That only famous people create lasting culture",
    ],
    correctAnswer: 2,
    explanation: `Miss Lou's archive status, currency image, and academic study prove her implicit argument: grassroots, vernacular culture has enduring value.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

The word 'vernacular' (related to the passage's theme) means:`,
    options: [
      "foreign and imported",
      "formal and official",
      "the language or dialect spoken by ordinary people in a particular region",
      "academic and technical",
    ],
    correctAnswer: 2,
    explanation: `'Vernacular' refers to the native language of a place or community — the language of ordinary people, as opposed to formal or official language.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

Which BEST summarises the passage?`,
    options: [
      "Miss Lou was a funny performer",
      "Miss Lou used Jamaican Creole because she could not speak Standard English",
      "Miss Lou was a pioneering cultural figure whose deliberate choice to perform in Jamaican Creole was a political act that validated ordinary Jamaican identity and left a lasting cultural legacy",
      "Miss Lou was very popular in Jamaica",
    ],
    correctAnswer: 2,
    explanation: `This captures who she was, what she did, why it mattered, and her legacy — a complete summary of the passage's argument.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Louise Bennett-Coverley — Miss Lou — was one of Jamaica's most beloved cultural figures. She performed, taught, and wrote at a time when Jamaican Creole (Patois) was dismissed by many as a lesser language unworthy of literature or performance. Miss Lou disagreed. She saw Jamaican language as a rich, living, and powerful medium for poetry, comedy, and cultural truth. Her decision to write and perform in Patois was not simply a stylistic choice — it was a political and cultural act of resistance. She insisted that ordinary Jamaican people deserved to see themselves and their language celebrated on stage. Today, her work is studied as literature, her face appears on Jamaican currency, and her recordings are archived as treasures of Caribbean cultural heritage."

When the passage says Miss Lou 'insisted that ordinary Jamaican people deserved to see themselves and their language celebrated,' the word 'deserved' implies:`,
    options: [
      "It was a privilege, not a right",
      "That ordinary Jamaicans were superior to others",
      "That the celebration of ordinary Jamaican identity was a matter of justice — not a gift but something owed",
      "That only unusual people deserve celebration",
    ],
    correctAnswer: 2,
    explanation: `'Deserved' frames cultural recognition as a matter of justice and dignity — not a favour granted but a right belonging to ordinary people.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'resist'?`,
    options: [
      "accept",
      "surrender",
      "oppose",
      "welcome",
    ],
    correctAnswer: 2,
    explanation: `'Oppose' means to actively work against something — a synonym for 'resist.'`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `The ANTONYM of 'suppress' is:`,
    options: [
      "hide",
      "oppress",
      "silence",
      "liberate",
    ],
    correctAnswer: 3,
    explanation: `'Liberate' means to set free — the direct opposite of 'suppress' (to hold down or silence).`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The artist's work was SUBVERSIVE — it challenged the dominant culture in ways that made the authorities uncomfortable. 'Subversive' means:`,
    options: [
      "very popular with everyone",
      "approved by the government",
      "deliberately undermining established power or values",
      "simple and traditional",
    ],
    correctAnswer: 2,
    explanation: `'Subversive' describes work that quietly or openly challenges and undermines established authority or conventional values.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Idiom",
    question: `'Miss Lou held her ground despite pressure to conform.' 'Held her ground' means:`,
    options: [
      "She stood still physically",
      "She refused to change her position or give in to pressure",
      "She was afraid",
      "She agreed with everyone",
    ],
    correctAnswer: 1,
    explanation: `'Holding one's ground' means maintaining one's position and principles despite pressure to change or give way.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Language is the blood of culture — when it stops flowing, the culture dies.' What does this extended metaphor argue?`,
    options: [
      "Language and blood are both liquids",
      "Culture is not important",
      "Language is as essential to cultural life as blood is to physical life — without it, the culture cannot survive",
      "Only some languages matter",
    ],
    correctAnswer: 2,
    explanation: `The metaphor equates language with blood: just as blood circulates life through a body, language carries a culture's vitality. Without it, the culture perishes.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the MOST positive connotation when describing someone who speaks their mind?`,
    options: [
      "rude",
      "outspoken",
      "loud",
      "aggressive",
    ],
    correctAnswer: 1,
    explanation: `'Outspoken' suggests confident, honest expression of views — a positive quality. The others suggest negativity.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'heritage' as used in cultural contexts means:`,
    options: [
      "a financial inheritance",
      "old buildings only",
      "the traditions, values, and history passed from one generation to the next",
      "government property",
    ],
    correctAnswer: 2,
    explanation: `'Cultural heritage' refers to what a community inherits from the past — language, customs, values, art, and history.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Juxtaposition",
    question: `A writer places a description of a grand colonial theatre next to a description of Miss Lou performing in a small village yard. This contrast is called:`,
    options: [
      "Alliteration",
      "Simile",
      "Juxtaposition — to highlight the difference between elite, official culture and the vibrant, grassroots culture Miss Lou championed",
      "Metaphor",
    ],
    correctAnswer: 2,
    explanation: `Juxtaposition places contrasting elements side by side to highlight a meaningful difference — here, between high and low culture.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'dialect' comes from the Greek 'dialektos' meaning 'conversation' or 'way of speaking.' This etymology suggests:`,
    options: [
      "Dialects are wrong versions of language",
      "A dialect is simply a way of speaking — as natural and legitimate as any other variety of language",
      "Only educated people speak dialects",
      "Dialects are used only in poetry",
    ],
    correctAnswer: 1,
    explanation: `The etymology reveals that a dialect is simply 'a way of speaking' — not inferior, just different. This supports Miss Lou's argument that Patois is a legitimate language.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In formal writing, 'albeit' means:`,
    options: [
      "therefore",
      "in addition",
      "although or even though",
      "because",
    ],
    correctAnswer: 2,
    explanation: `'Albeit' is a formal conjunction meaning 'although' — 'The protest was peaceful, albeit disruptive.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Parts of Speech",
    question: `Which word is an ADVERB in: 'Miss Lou boldly chose to perform in Jamaican dialect.'?`,
    options: [
      "chose",
      "boldly",
      "dialect",
      "perform",
    ],
    correctAnswer: 1,
    explanation: `'Boldly' describes HOW she chose — it is an adverb modifying the verb 'chose.'`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verbs",
    question: `Which sentence uses a STATE VERB (not an action)?`,
    options: [
      "She performed on stage every weekend",
      "She believed in the power of her language",
      "She wrote new poems for the performance",
      "She taught students across Jamaica",
    ],
    correctAnswer: 1,
    explanation: `'Believed' is a state verb — it describes a mental state, not a physical action. State verbs are not usually used in continuous tenses.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence punctuates a DIRECT QUOTE correctly?`,
    options: [
      "Miss Lou said \"I will not apologise for speaking my language\".",
      "Miss Lou said, \"I will not apologise for speaking my language.\"",
      "Miss Lou said \"I will not apologise, for speaking my language.\"",
      "Miss Lou said. \"I will not apologise for speaking my language\"",
    ],
    correctAnswer: 1,
    explanation: `Direct speech: comma after reporting verb, opening quote, capital letter, closing punctuation BEFORE final quote mark.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Passive Voice",
    question: `Change to PASSIVE VOICE: 'Scholars around the world now study Miss Lou's poetry.'`,
    options: [
      "Miss Lou's poetry has been studied by scholars",
      "Miss Lou's poetry is now studied by scholars around the world",
      "Scholars study Miss Lou's poetry now",
      "Miss Lou's poetry was studied around the world",
    ],
    correctAnswer: 1,
    explanation: `Passive (present): subject (Miss Lou's poetry) + is + past participle (studied) + by agent.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'Language is our greatest inheritance,' Miss Lou once said.`,
    options: [
      "Miss Lou once said language is our greatest inheritance",
      "Miss Lou once said that language was their greatest inheritance",
      "Miss Lou once said that language is our greatest inheritance",
      "Miss Lou told language was our greatest inheritance",
    ],
    correctAnswer: 1,
    explanation: `Reported speech: tense shifts back ('is' → 'was'); 'our' shifts to 'their' since the speaker changes. 'That' introduces the reported clause.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conditional — Third",
    question: `Which sentence uses the THIRD CONDITIONAL correctly?`,
    options: [
      "If Miss Lou had not performed in Patois, Caribbean literature would be very different",
      "If Miss Lou didn't perform in Patois, Caribbean literature would be different",
      "If Miss Lou performs in Patois, Caribbean literature changes",
      "Miss Lou performed in Patois and changed Caribbean literature",
    ],
    correctAnswer: 0,
    explanation: `Third conditional: if + past perfect, would have + past participle. 'Had not performed... would be' — a mixed form is acceptable for expressing a hypothetical past effect on the present.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Inversion",
    question: `Which sentence uses INVERSION for emphasis?`,
    options: [
      "Miss Lou never stopped believing in her language",
      "Never did Miss Lou stop believing in her language",
      "She never stopped believing in her language",
      "Her belief in her language never stopped",
    ],
    correctAnswer: 1,
    explanation: `'Never did Miss Lou stop...' places the auxiliary (did) before the subject (Miss Lou) after the negative adverb 'Never' — a formal inversion for emphasis.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Gerunds and Infinitives",
    question: `Which sentence correctly uses a GERUND after a preposition?`,
    options: [
      "She was known for to perform in Patois",
      "She was known for performing in Patois",
      "She was known for perform in Patois",
      "She was known for performed in Patois",
    ],
    correctAnswer: 1,
    explanation: `After prepositions, use a gerund (-ing form): 'known FOR performing' is correct.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Complex Sentences",
    question: `Which sentence uses a CONCESSIVE CLAUSE correctly?`,
    options: [
      "Although critics dismissed Patois, Miss Lou continued to write in it",
      "Although critics dismissed Patois. Miss Lou continued",
      "Miss Lou continued to write despite, critics dismissed Patois",
      "Although, critics dismissed Patois, Miss Lou continued",
    ],
    correctAnswer: 0,
    explanation: `A concessive clause uses 'although/though/even though' + subject + verb: 'Although critics dismissed Patois, Miss Lou continued...'`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Nominalisation",
    question: `Which correctly uses NOMINALISATION to create a more formal sentence?`,
    options: [
      "She performed and this resistance was important",
      "Her performance was an act of important resistance",
      "She resisted by performing",
      "She was performing resistance",
    ],
    correctAnswer: 1,
    explanation: `'Her performance was an act of resistance' nominalisations 'performed' → 'performance' and 'resisted' → 'resistance' — creating a formal, abstract academic style.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Register",
    question: `Miss Lou performed in Jamaican Creole at a time when it was not considered 'proper.' A student writing about this should use:`,
    options: [
      "Only Jamaican Creole throughout the essay",
      "Standard English for clarity, but can quote Miss Lou's Patois where appropriate",
      "Only Standard English and never quote Patois",
      "Whichever register comes naturally",
    ],
    correctAnswer: 1,
    explanation: `Academic writing typically uses Standard English, but quoting Miss Lou's language in Patois where relevant preserves authenticity and avoids erasure of the very thing being discussed.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Thesis Statement",
    question: `Which is the STRONGEST thesis for an essay arguing Miss Lou should be recognised as a political figure, not just an entertainer?`,
    options: [
      "Miss Lou was very funny",
      "Miss Lou performed in Jamaican Creole",
      "Miss Lou was not merely an entertainer — her deliberate choice to write and perform in Jamaican Creole was a political act that challenged colonial ideas about language and culture",
      "Miss Lou was a National Hero",
    ],
    correctAnswer: 2,
    explanation: `This thesis is specific, arguable, and makes a claim about WHY Miss Lou's work was political — it gives the essay a clear, defensible position.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Analytical Writing — Point-Evidence-Explanation",
    question: `A student writes: 'Miss Lou used Jamaican Creole as a political act. She wrote in Patois. This was resistance.' Identify the weakness:`,
    options: [
      "The point is wrong",
      "The writing is too formal",
      "The analysis is incomplete — the student states a point and gives evidence but fails to explain HOW the use of Patois constitutes resistance and WHY that matters",
      "The student uses too many sentences",
    ],
    correctAnswer: 2,
    explanation: `The missing step is EXPLANATION — the student says what she did but not how it works as resistance or why it was politically significant. PEE requires all three steps.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Evaluating Argument",
    question: `A student argues: 'Miss Lou's work shows that language is a site of political struggle.' Evaluate this claim.`,
    options: [
      "This is factually wrong",
      "This is too vague — all language is used for communication",
      "This is a sophisticated, well-supported claim — language choices reflect and enact power relations, and Miss Lou's Patois was a deliberate intervention in those relations",
      "This requires no evidence",
    ],
    correctAnswer: 2,
    explanation: `The claim is evaluable: it connects the specific (Miss Lou's language choice) to the general (language as a political site) — a sophisticated thesis that can be supported with textual evidence.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Synthesising Ideas",
    question: `An essay uses Miss Lou's work, Louise Bennett's scholarship, and academic research on Caribbean linguistics. A student SYNTHESISES these by:`,
    options: [
      "Listing what each source says in separate paragraphs",
      "Copying from each source in turn",
      "Weaving ideas from all three sources into a coherent argument that goes beyond any single source",
      "Using only one source at a time",
    ],
    correctAnswer: 2,
    explanation: `Synthesis integrates multiple sources into a new, original argument — it is the highest-order writing skill, going beyond summary to create something new from the combined material.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMix4Questions : g5LaMix4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 4",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 4</CardTitle>
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
              <p className="text-slate-600">Language Arts Mixed 4</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 4</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
