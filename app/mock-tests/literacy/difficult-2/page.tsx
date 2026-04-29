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

const g5LaDiff2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Rhetorical Analysis",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'Freedom is not given; it is taken, and in the taking, it is made real.' What rhetorical technique does this opening use?`,
    options: [
      "It begins with a definition",
      "It uses antithesis and chiasmus to challenge the idea that freedom is passive — it must be actively claimed",
      "It asks a rhetorical question",
      "It begins with a personal story",
    ],
    correctAnswer: 1,
    explanation: `The sentence uses antithesis (not given vs. taken) and the reversal of ideas to make an emphatic, memorable claim — freedom is active, not passive.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Extended Metaphor",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'Freedom requires a carrier.' What does the metaphor of 'carrying' freedom suggest?`,
    options: [
      "Freedom is a heavy physical object",
      "Freedom is something that must be actively taken up and transported by individuals willing to bear its weight and risk",
      "Freedom is easy to find",
      "Only one person can carry freedom at a time",
    ],
    correctAnswer: 1,
    explanation: `The carrier metaphor suggests freedom is not abstract — it needs embodiment in real people who choose to hold it, bear it, and move it forward despite the cost.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Tone and Purpose",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

This passage reads more like a philosophical essay than a story. What effect does this have?`,
    options: [
      "It makes it boring",
      "It positions the reader as a thoughtful person invited to grapple with a serious idea",
      "It makes it inaccessible to most readers",
      "It is less effective than a narrative would be",
    ],
    correctAnswer: 1,
    explanation: `The philosophical register invites intellectual engagement — positioning the reader not as a passive receiver of a story but as an active thinker wrestling with a complex idea.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

What is the CENTRAL argument of this passage?`,
    options: [
      "Freedom was granted by governments and should be protected by law",
      "Freedom is freely available to anyone who wants it",
      "Freedom must be actively claimed by each generation — it is never permanently won and always requires someone to carry the cost of claiming it",
      "History has ended and freedom is now complete",
    ],
    correctAnswer: 2,
    explanation: `The passage argues freedom is perpetually unfinished — an active practice, not a final achievement. Every generation must claim it again.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Irony",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'History answers this in blood and song and law and silence.' What is the effect of including 'silence' alongside 'blood,' 'song,' and 'law'?`,
    options: [
      "Silence is a mistake",
      "The four words have no relationship",
      "The unexpected inclusion of 'silence' forces the reader to think about what has been suppressed or unrecorded — history's absences are as meaningful as its events",
      "Silence simply means peaceful times",
    ],
    correctAnswer: 2,
    explanation: `Silence as a historical 'answer' is powerfully ironic — it points to everything erased, suppressed, or unrecorded. The absences in history are themselves a form of testimony.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'The ones who wait politely for it to arrive discover that it does not travel alone.' What does this imply about passive waiting?`,
    options: [
      "Patience is rewarded",
      "Polite waiting is the best approach",
      "Freedom does not come on its own — those who wait passively for it to be given are waiting in vain",
      "Freedom always arrives eventually",
    ],
    correctAnswer: 2,
    explanation: `The passage argues passivity is futile — freedom does not arrive without carriers. Those who 'wait politely' will wait indefinitely.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Language Analysis",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

The phrase 'as though for the first time' is used at the end. What does this repetition of the 'first time' suggest?`,
    options: [
      "That freedom has never been won before",
      "That each generation experiences freedom's struggle freshly, without inheriting the victory — the work is always new",
      "That freedom is impossible",
      "That history repeats exactly",
    ],
    correctAnswer: 1,
    explanation: `Each generation must earn freedom anew — the phrase captures both the cyclical nature of the struggle and the fact that no generation can fully inherit what previous generations won.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

This passage seems to be addressed directly to 'us.' Who is the implied audience?`,
    options: [
      "A specific political party",
      "Only historians",
      "All people — but particularly those living now who can still act on the freedom question",
      "People in the past",
    ],
    correctAnswer: 2,
    explanation: `The use of 'us' and 'every generation' positions all readers as implicated — the passage has no limited audience. It speaks to whoever is alive now.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'Freedom is never finished.' The word 'finished' here means:`,
    options: [
      "complete and ready to be displayed",
      "destroyed and gone",
      "permanently secured and settled for all time",
      "broken",
    ],
    correctAnswer: 2,
    explanation: `'Finished' means permanently accomplished and no longer requiring effort. The passage argues freedom is never in that state — it always requires ongoing work.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Critical Evaluation",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

A student argues: 'This passage is too vague — it never gives a specific example of freedom being won or lost.' Is this a valid criticism?`,
    options: [
      "Yes — specific examples are always required",
      "Yes — the passage proves nothing without examples",
      "The criticism has some validity, but the passage deliberately operates at a philosophical level — its generality is intentional, inviting readers to apply it to their own historical knowledge",
      "No — the passage is perfect as it is",
    ],
    correctAnswer: 2,
    explanation: `The criticism has some merit — evidence strengthens argument. However, the passage is intentionally philosophical and universal, trusting the reader to supply historical examples. Acknowledging both is a sophisticated response.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'History answers this in blood and song and law and silence.' Why does the writer use four different nouns?`,
    options: [
      "To fill space in the sentence",
      "The four nouns cover the full range of human responses to freedom's struggle — violence, art, justice, and suppression",
      "They all mean the same thing",
      "The writer preferred the number four",
    ],
    correctAnswer: 1,
    explanation: `The four nouns represent different registers of historical response: 'blood' (sacrifice), 'song' (culture/resistance), 'law' (institutional change), 'silence' (erasure). Together they give a complete picture.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Close Reading",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

'Here is where it begins.' Why does the writer use fragmented, simple sentences at this point?`,
    options: [
      "Because they ran out of ideas",
      "The short sentences are grammatically incorrect",
      "The simple, direct sentences mirror the directness and courage of the act they describe — freedom starting right here, right now, simply",
      "Simple sentences are always best",
    ],
    correctAnswer: 2,
    explanation: `The simple sentences enact what they describe — the directness of saying 'here' and 'now' to freedom. The syntax mirrors the act.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

The author argues that asking 'whether freedom exists somewhere out there, abstract and promised' is the WRONG question. The RIGHT question is:`,
    options: [
      "Whether freedom is guaranteed by law",
      "Whether everyone deserves freedom",
      "Who will carry freedom and at what personal cost",
      "Whether governments will grant it",
    ],
    correctAnswer: 2,
    explanation: `The passage explicitly states: 'The question is always: who will carry it, and at what cost?' — shifting from the abstract to the personal and costly.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summary",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

Which statement BEST summarises the central argument of this passage?`,
    options: [
      "Freedom is given to deserving people by generous leaders",
      "Freedom is a natural right that exists without effort",
      "Freedom must be actively claimed by individuals in every generation — it is an ongoing practice, not a permanent achievement",
      "Freedom is impossible to achieve",
    ],
    correctAnswer: 2,
    explanation: `This captures the passage's core claim: freedom requires carriers, costs something, and must be won anew by every generation.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Comparative",
    question: `Read the passage then answer the question.

"Freedom is not given; it is taken, and in the taking, it is made real. The ones who wait politely for it to arrive discover that it does not travel alone — it requires a carrier. It requires someone to hold out their hands and say: here. Here is where it begins. And so the question is never whether freedom exists somewhere out there, abstract and promised. The question is always: who will carry it, and at what cost? History answers this in blood and song and law and silence. And it keeps answering, because freedom is never finished. Every generation must take it again, as though for the first time."

This passage could BEST be read alongside which type of text?`,
    options: [
      "A recipe book",
      "A sports report",
      "A historical account of a freedom struggle such as the Haitian Revolution or Jamaica's independence movement",
      "A geography textbook",
    ],
    correctAnswer: 2,
    explanation: `The passage's abstract argument about freedom gains power when read alongside specific historical examples of freedom struggles — the two types of text illuminate each other.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Etymology",
    question: `The word 'democracy' comes from the Greek 'demos' (people) and 'kratos' (power/rule). What does this etymology tell us?`,
    options: [
      "Democracy is a type of religion",
      "Democracy literally means rule by the people",
      "Democracy was invented by the Greeks only",
      "Democracy and monarchy have the same root",
    ],
    correctAnswer: 1,
    explanation: `Etymology reveals that 'democracy' literally means 'people's rule' — understanding word roots deepens vocabulary and meaning.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Nuanced Connotation",
    question: `Which sentence uses the word 'calculated' with a NEGATIVE connotation?`,
    options: [
      "His calculated approach to solving the problem impressed everyone",
      "She made a calculated decision based on evidence",
      "His cold, calculated manipulation of the situation shocked his colleagues",
      "The scientist's calculated observations led to a breakthrough",
    ],
    correctAnswer: 2,
    explanation: `'Calculated' here implies deliberate and cold manipulation of others — a negative, sinister connotation.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Irony in Language",
    question: `'Oh, what a wonderful day!' said as it poured rain. This is an example of:`,
    options: [
      "Hyperbole",
      "Simile",
      "Verbal irony / sarcasm",
      "Personification",
    ],
    correctAnswer: 2,
    explanation: `Verbal irony means saying the opposite of what you mean for effect. Calling a rainy day 'wonderful' is verbal irony or sarcasm.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Extended Metaphor Analysis",
    question: `A poet describes life as a river: 'It begins in rushing, impatient youth, grows wide and slow in middle age, and finally flows quietly into the sea.' The sea likely represents:`,
    options: [
      "The ocean literally",
      "Wealth and prosperity",
      "Death and the end of life's journey",
      "A holiday destination",
    ],
    correctAnswer: 2,
    explanation: `In extended metaphors about life and rivers, the sea typically symbolises death — the final destination where the journey ends.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `In academic writing, 'substantiate' means:`,
    options: [
      "to undermine completely",
      "to provide evidence that supports a claim",
      "to ignore a point",
      "to make something smaller",
    ],
    correctAnswer: 1,
    explanation: `To substantiate is to provide concrete evidence or proof to support a claim or argument.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Figurative Language — Juxtaposition",
    question: `A writer places a description of a lavish royal feast immediately next to a description of starving peasants. This technique is called:`,
    options: [
      "Alliteration",
      "Simile",
      "Juxtaposition",
      "Onomatopoeia",
    ],
    correctAnswer: 2,
    explanation: `Juxtaposition places contrasting elements side by side to highlight the contrast between them.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning — Nuance",
    question: `Which sentence uses 'notorious' correctly?`,
    options: [
      "She was notorious for her generous charity work",
      "He was notorious for breaking the law repeatedly",
      "The school was notorious for its excellent exam results",
      "She was notorious for being very kind",
    ],
    correctAnswer: 1,
    explanation: `'Notorious' means famous for something BAD. It is always negative — unlike 'famous' or 'renowned.'`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Figurative Language — Paradox",
    question: `'The silence was deafening.' This is a paradox because:`,
    options: [
      "Silence and sound are not related",
      "It combines two contradictory ideas — silence cannot literally be deafening — to express overwhelming quiet",
      "The sentence is grammatically wrong",
      "Deafening is not a real word",
    ],
    correctAnswer: 1,
    explanation: `A paradox contains contradictory elements that reveal a deeper truth. The overwhelming silence had the impact of loud noise.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Connotation — Register",
    question: `Which word carries the MOST formal register?`,
    options: [
      "kids",
      "youngsters",
      "children",
      "youths",
    ],
    correctAnswer: 2,
    explanation: `'Children' is the standard formal register. 'Kids' is informal/colloquial; 'youngsters' is semi-informal; 'youths' has neutral-to-negative connotations in some contexts.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Figurative Language — Euphemism",
    question: `A euphemism is used when a writer:`,
    options: [
      "Uses very direct, blunt language",
      "Exaggerates for effect",
      "Replaces harsh or uncomfortable language with a milder alternative",
      "Uses rhyme to create rhythm",
    ],
    correctAnswer: 2,
    explanation: `A euphemism softens uncomfortable truths — e.g., 'passed away' instead of 'died.'`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subjunctive Mood",
    question: `Which sentence correctly uses the SUBJUNCTIVE mood?`,
    options: [
      "If I was you, I would apologise",
      "If I were you, I would apologise",
      "If I am you, I apologise",
      "If I be you, I will apologise",
    ],
    correctAnswer: 1,
    explanation: `The subjunctive uses 'were' (not 'was') for hypothetical or contrary-to-fact conditions: 'If I were you...'`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Inversion for Emphasis",
    question: `Which sentence uses INVERSION for emphasis?`,
    options: [
      "She had never seen such beauty before",
      "Never had she seen such beauty",
      "She never saw such beauty",
      "Such beauty she had never seen before",
    ],
    correctAnswer: 1,
    explanation: `Inversion places the auxiliary verb before the subject after a negative adverb: 'Never had she seen...' — a formal literary device.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Complex Tense — Future Perfect Continuous",
    question: `Which sentence uses the FUTURE PERFECT CONTINUOUS tense?`,
    options: [
      "She will finish by then",
      "She has been working for three hours",
      "By next year, she will have been teaching for twenty years",
      "She will be working tomorrow",
    ],
    correctAnswer: 2,
    explanation: `Future perfect continuous: will have been + -ing. Shows an ongoing action that will be in progress up to a future point.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Dangling Modifier",
    question: `Identify the DANGLING MODIFIER in: 'Walking through the park, the rain began to fall.'`,
    options: [
      "Walking through the park",
      "the rain began to fall",
      "began to fall",
      "through the park",
    ],
    correctAnswer: 0,
    explanation: `'Walking through the park' is a dangling modifier — it implies the rain was walking, which is illogical. The subject it modifies (a person) is missing.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Ellipsis in Grammar",
    question: `In grammar, ELLIPSIS refers to:`,
    options: [
      "The punctuation mark (…)",
      "The deliberate omission of words that are understood from context",
      "A type of relative clause",
      "A figure of speech",
    ],
    correctAnswer: 1,
    explanation: `Grammatical ellipsis omits words that the reader can infer from context: 'She can swim and [she can] dive.'`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Cleft Sentences",
    question: `Which is a CLEFT SENTENCE (used to emphasise one element)?`,
    options: [
      "She gave the book to Maria yesterday",
      "It was Maria whom she gave the book to",
      "She gave the book",
      "Maria received the book",
    ],
    correctAnswer: 1,
    explanation: `A cleft sentence splits a clause into two to highlight one element: 'It was Maria whom...' emphasises who received the book.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Nominalisations",
    question: `Nominalisation converts a verb into a noun. Which shows nominalisation of 'decide'?`,
    options: [
      "deciding",
      "decided",
      "decision",
      "decisive",
    ],
    correctAnswer: 2,
    explanation: `'Decision' is the noun form of 'decide' — a nominalisation. Nominalisations are common in formal/academic writing.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Fronting for Emphasis",
    question: `'This book I have read three times.' In this sentence, 'this book' is moved to the front to:`,
    options: [
      "Correct a grammar mistake",
      "Create confusion",
      "Emphasise the object by placing it before the subject",
      "Show the book is important physically",
    ],
    correctAnswer: 2,
    explanation: `Fronting moves a sentence element to the beginning for emphasis. 'This book' (normally the object) is fronted to highlight it.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Complex Conditional — Third",
    question: `Which is a THIRD CONDITIONAL sentence?`,
    options: [
      "If it rains, I stay inside",
      "If it rained, I would stay inside",
      "If it had rained, I would have stayed inside",
      "I will stay inside if it rains",
    ],
    correctAnswer: 2,
    explanation: `Third conditional: if + past perfect, would have + past participle. Describes an unreal past condition and its imagined result.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Cohesive Devices",
    question: `Which sentence uses a COHESIVE DEVICE (other than a conjunction) to link ideas?`,
    options: [
      "She was tired. She slept.",
      "She was tired, so she slept",
      "She was tired. Consequently, she slept.",
      "She was tired and sleepy",
    ],
    correctAnswer: 2,
    explanation: `'Consequently' is a cohesive adverb that explicitly shows the logical relationship (cause-effect) between sentences.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Literary Criticism — Purpose",
    question: `When writing a literary critical essay, the writer's PRIMARY purpose is:`,
    options: [
      "To retell the story in their own words",
      "To share personal feelings about the characters",
      "To analyse how the writer uses language and technique to create meaning and affect the reader",
      "To describe what happens in each chapter",
    ],
    correctAnswer: 2,
    explanation: `Literary criticism analyses HOW texts work — techniques, effects, and meanings — not just WHAT happens.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Point-Evidence-Explanation",
    question: `In the PEE paragraph structure, the EXPLANATION step requires the writer to:`,
    options: [
      "Simply quote from the text",
      "State the next point",
      "Analyse how the quoted evidence supports the point and what effect it creates",
      "Summarise the whole text",
    ],
    correctAnswer: 2,
    explanation: `The explanation unpacks the evidence — explaining HOW the technique works and WHY it creates a particular effect on the reader.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Evaluating Effectiveness",
    question: `When a student writes 'The writer uses a metaphor,' this response is:`,
    options: [
      "Complete — identifying the technique is enough",
      "Incomplete — the student must also identify which metaphor, explain its effect, and evaluate its success",
      "Too detailed",
      "Incorrect — metaphors are not relevant to analysis",
    ],
    correctAnswer: 1,
    explanation: `Identifying a technique alone is insufficient. Effective literary analysis requires: technique + evidence (quotation) + effect + evaluation.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Thesis Statement",
    question: `Which is the STRONGEST thesis statement for an essay arguing that social media harms young people?`,
    options: [
      "Social media is used by many young people around the world",
      "Social media can be both good and bad for young people",
      "Unrestricted social media use significantly harms young people's mental health, social development, and academic performance",
      "Young people use social media every day",
    ],
    correctAnswer: 2,
    explanation: `A strong thesis makes a specific, arguable claim that the essay will prove. Option C is precise, arguable, and names three specific areas.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Synthesising Sources",
    question: `When a writer SYNTHESISES multiple sources, they:`,
    options: [
      "Copy information from each source in turn",
      "Simply list what each source says",
      "Weave together ideas from different sources to build a coherent, original argument",
      "Use only one source at a time",
    ],
    correctAnswer: 2,
    explanation: `Synthesis integrates ideas from multiple sources into an original argument — not a series of summaries, but a woven, analytical whole.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literary criticism, complex inference, authorial intent, irony, subtext" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "etymology, nuanced connotation, complex figurative language, academic vocabulary" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "subjunctive, complex transformations, ellipsis, advanced punctuation, style" },
  { type: "writing" as const,    label: "Writing Skills",           note: "literary analysis, extended argument, evaluating effectiveness, complex technique" },
]

export default function G5LaDiff2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaDiff2Questions : g5LaDiff2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Difficult 2</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Difficult Level</p>
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
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-800">Difficult Level Focus</h3>
              <p className="text-slate-700">This test requires literary criticism, complex inference, evaluation of authorial technique, advanced grammar transformations, and sophisticated analytical writing — the highest NSC Grade 5 Language Arts standard.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: evaluating how language constructs meaning</li>
                <li>Communication: producing sophisticated written and analytical responses</li>
                <li>Creativity: recognising and evaluating complex literary technique</li>
                <li>Collaboration: understanding how texts position and persuade audiences</li>
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
              <p className="text-slate-600">Language Arts Difficult 2</p>
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
                <p className="text-slate-700">This difficult test requires literary analysis and advanced language skills. For each question you found challenging, study the explanation carefully — focus on identifying the technique, understanding its effect, and practising applying this to new texts.</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Difficult 2</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
