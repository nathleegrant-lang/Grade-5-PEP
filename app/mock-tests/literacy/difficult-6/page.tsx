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

const g5LaDiff6Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Literary Technique",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

How does the writer use language to make an abstract idea feel immediate and personal?`,
    options: [
      "By using only statistics",
      "By using passive constructions",
      "Through vivid, specific word choices and direct address that draw the reader into the argument",
      "By avoiding all figurative language",
    ],
    correctAnswer: 2,
    explanation: `Abstract arguments become powerful through concrete language, direct address, and specific detail — techniques all skilled writers use to connect intellectual ideas to human feeling.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Author's Argument",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

What is the CENTRAL claim the author is making in this passage?`,
    options: [
      "The topic is unimportant",
      "There is no clear argument",
      "The author makes a specific, arguable claim that challenges a conventional assumption about the topic",
      "The author simply describes the topic",
    ],
    correctAnswer: 2,
    explanation: `Difficult passages always contain a central argument — a position the writer takes that is specific, arguable, and supported by the language of the text.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

What does the passage imply about the relationship between the topic and power?`,
    options: [
      "The topic has nothing to do with power",
      "Power is irrelevant to understanding the topic",
      "The topic is not politically or socially neutral — it is shaped by and shapes relationships of power",
      "Only governments are interested in the topic",
    ],
    correctAnswer: 2,
    explanation: `Difficult texts consistently reveal that their topics are entangled with questions of power — who decides, who is heard, who is erased.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

The tone of this passage is BEST described as:`,
    options: [
      "Angry and dismissive",
      "Entirely neutral and objective",
      "Intellectually engaged and critically rigorous — the writer takes a clear position while acknowledging complexity",
      "Humorous and ironic",
    ],
    correctAnswer: 2,
    explanation: `Difficult analytical passages are characterised by intellectual rigour — a clear position held with nuance and awareness of counter-positions.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

Identify a KEY figurative or rhetorical technique in this passage and explain its purpose.`,
    options: [
      "There is no figurative language",
      "Figurative language is used randomly",
      "A specific figurative technique is used deliberately to make an abstract argument more vivid, concrete, or emotionally resonant",
      "The passage is too difficult to analyse",
    ],
    correctAnswer: 2,
    explanation: `All difficult texts use figurative or rhetorical language purposefully — the skill is identifying the technique, locating it in the text, and explaining its specific function.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

The writer chooses specific academic vocabulary throughout. What effect does this have?`,
    options: [
      "It makes the passage inaccessible",
      "It shows off the writer's vocabulary",
      "It signals the register and intended audience — positioning this as a serious intellectual argument for a thoughtful reader",
      "Academic vocabulary has no effect",
    ],
    correctAnswer: 2,
    explanation: `Register and vocabulary choices signal the text's seriousness and its intended audience — a sophisticated reader capable of engaging with complex ideas.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

What might a critical reader ask about the argument presented in this passage?`,
    options: [
      "Critical readers simply accept all arguments",
      "A critical reader would ask: Is there evidence for this? What perspective is missing? What assumptions does the writer make?",
      "Critical reading is too difficult at this level",
      "Critical readers find no value in questioning texts",
    ],
    correctAnswer: 1,
    explanation: `Critical reading means interrogating texts: asking about evidence, perspective, assumptions, and what has been left out. These are higher-order reading skills.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

The CENTRAL theme of this passage concerns which fundamental human question?`,
    options: [
      "A minor practical concern",
      "A question about food or sport",
      "A fundamental question about identity, power, knowledge, or justice",
      "A topic with no relevance to human life",
    ],
    correctAnswer: 2,
    explanation: `Difficult passages always engage with fundamental human themes — identity, power, truth, justice, belonging — even when their surface topic appears specific.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

How does the writer structure their argument?`,
    options: [
      "Randomly, with no organisation",
      "By simply listing unrelated facts",
      "By establishing a position, complicating or challenging assumptions, and building toward a conclusion that reframes the opening question",
      "By presenting only one side of a debate",
    ],
    correctAnswer: 2,
    explanation: `Sophisticated arguments are structured: they begin with a position, develop through evidence and complexity, and conclude with the position deepened or reframed.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

What does the passage ultimately suggest the reader should DO or THINK differently?`,
    options: [
      "Nothing — the passage is purely descriptive",
      "The reader should simply agree with the author",
      "The passage invites the reader to question an assumption, see something familiar in a new way, or feel the urgency of an issue they may have taken for granted",
      "The reader should ignore the topic",
    ],
    correctAnswer: 2,
    explanation: `The highest purpose of analytical writing is to change how the reader thinks or sees — to shift a perspective or heighten awareness.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Author's Craft — Sentence Level",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

Why might the writer vary their sentence length in this passage?`,
    options: [
      "By accident",
      "Short sentences are always better",
      "Varied sentence length creates rhythm, emphasis, and pace — short sentences punch key ideas; longer ones develop complexity",
      "Long sentences are always more impressive",
    ],
    correctAnswer: 2,
    explanation: `Sentence variety is a deliberate craft choice — short sentences land key points with impact; longer sentences build argument and texture.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Evidence and Credibility",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

Does the author provide sufficient evidence for their claims in this passage?`,
    options: [
      "Yes — the author's opinions are always sufficient",
      "No evidence of any kind is given",
      "The passage provides reasoning and illustrative detail, but a critical reader would benefit from verifiable evidence to support the most significant claims",
      "Evidence is unnecessary for good writing",
    ],
    correctAnswer: 2,
    explanation: `Strong critical reading acknowledges what the text does well while identifying where more evidence would strengthen the argument — this is sophisticated analysis.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Audience and Purpose",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

What type of reader is this passage MOST designed for?`,
    options: [
      "Children under ten",
      "People who already fully agree with the argument",
      "A thoughtful reader capable of engaging with complex ideas and willing to have their assumptions questioned",
      "People who know nothing about the topic",
    ],
    correctAnswer: 2,
    explanation: `The vocabulary, structure, and level of assumed knowledge all point to a reader comfortable with intellectual complexity — not necessarily an expert, but a serious, curious thinker.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

Which statement BEST summarises the MAIN argument of this passage?`,
    options: [
      "The passage simply describes a topic without argument",
      "The topic is not important",
      "The passage makes a specific, challenging argument about its topic that invites the reader to reconsider a familiar assumption",
      "The passage has no clear conclusion",
    ],
    correctAnswer: 2,
    explanation: `Difficult passages always have a central, arguable claim — the skill is identifying it clearly and concisely.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Close Reading — Final Sentence",
    question: `Read the passage then answer the question.

"The oldest story about truth is that it is singular and patient — that it sits somewhere, waiting to be found, like a coin at the bottom of a well. But the more closely one examines the stories human beings tell each other — the histories they write, the courts they build, the news they broadcast — the more clearly one sees that truth is always partial, always perspectival, always contested. This is not to say there is no truth. It is to say that the process of finding it is never innocent. Every story told from one point of view is, by definition, not told from another. The question is not: what is the truth? The question is: whose truth is this, and what has been left out?"

The final sentence of the passage typically performs which function?`,
    options: [
      "It introduces a new, unrelated topic",
      "It simply restates the first sentence",
      "It either resolves the argument, deepens the central question, or opens onto something larger — leaving the reader with the most resonant thought",
      "It summarises the passage's evidence",
    ],
    correctAnswer: 2,
    explanation: `In analytical writing, the final sentence carries particular weight — it is the last thing the reader hears and should leave them with the passage's most powerful insight.`
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

export default function G5LaDiff6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaDiff6Questions : g5LaDiff6Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 6",
        difficulty: "Difficult",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Difficult 6</CardTitle>
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
              <p className="text-slate-600">Language Arts Difficult 6</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Difficult 6</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
