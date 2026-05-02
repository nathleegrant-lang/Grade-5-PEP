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

const g5LaDiff1Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Literary Technique",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

The mango tree is compared to 'the arms of a grandmother.' What effect does this simile create?`,
    options: [
      "It makes the tree seem dangerous",
      "It creates a sense of warmth, welcome, and nurturing care — connecting nature with family and community",
      "It suggests the tree is very old",
      "It makes the reader feel sad about old trees",
    ],
    correctAnswer: 1,
    explanation: `The simile connects the tree to the warmth and security of family, making it symbolise community and belonging — far beyond just being a fruit tree.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Symbolism",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

What does the mango tree symbolise in this passage?`,
    options: [
      "Property and money",
      "Community, generosity, shared life, and connection to place",
      "A legal dispute",
      "The landlord's authority",
    ],
    correctAnswer: 1,
    explanation: `The tree's spreading arms, shared fruit, and central role in the yard's life make it a symbol of community, belonging, and generational connection.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference — Character",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

What does Miss Ivy's gesture of placing her hand on the bark tell us?`,
    options: [
      "She is checking if the tree is healthy",
      "She has a deep, almost spiritual connection to the tree — treating it as a living presence worthy of comfort",
      "She wants to climb the tree",
      "She is angry at the landlord",
    ],
    correctAnswer: 1,
    explanation: `Placing a hand on bark as if listening to a heartbeat implies Miss Ivy relates to the tree as a living, feeling entity with whom she has a profound bond.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Ambiguity",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

'Nobody knew if she was comforting the tree or herself.' Why does the author end on this ambiguity?`,
    options: [
      "Because the author doesn't know what happened",
      "To show Miss Ivy was confused",
      "To invite the reader to reflect on the nature of loss, attachment, and who truly needs comfort when something beloved is threatened",
      "To show the story is unfinished",
    ],
    correctAnswer: 2,
    explanation: `The ambiguity makes the reader think — both possibilities are emotionally true. The uncertain boundary between self and beloved place is the passage's deepest insight.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

The tone of this passage is BEST described as:`,
    options: [
      "Angry and political",
      "Clinical and detached",
      "Tender and elegiac — full of quiet love for something that is about to be lost",
      "Comical and light",
    ],
    correctAnswer: 2,
    explanation: `'Elegiac' means expressing sorrow for something lost or passing. The tender imagery, shared fruit, and quiet final moment create this tone.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Narrative Voice",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

The narrator describes the tree with great warmth and detail. What does this suggest about the narrator's relationship with the subject?`,
    options: [
      "The narrator is completely objective",
      "The narrator is hostile to Miss Ivy",
      "The narrator is emotionally invested — this is a community perspective, not a detached observer's",
      "The narrator knows nothing about the community",
    ],
    correctAnswer: 2,
    explanation: `The richness of detail and warmth of language signals a narrator embedded in this community, not standing outside it.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Craft",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

Why does the author describe the fruit as being shared in a specific order — children first, then neighbours, then passers-by?`,
    options: [
      "To show there is never enough fruit",
      "To show the hierarchy of need — those closest and most vulnerable first, then outward to the wider community",
      "To show Miss Ivy is very organised",
      "To prove mango trees produce very little fruit",
    ],
    correctAnswer: 1,
    explanation: `The sharing sequence reveals an ethic of care that radiates outward from the most vulnerable — children first — to the wider community. It reflects values of generosity and priority.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Figurative Language — Personification",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

How does the phrase 'as though listening to a heartbeat' personify the tree?`,
    options: [
      "It means trees have hearts",
      "It suggests Miss Ivy thought the tree was an animal",
      "It gives the tree a pulse and inner life, making it a living, breathing presence rather than just a plant",
      "It shows Miss Ivy has medical training",
    ],
    correctAnswer: 2,
    explanation: `The heartbeat metaphor personifies the tree — attributing to it the most fundamental sign of animal life and making Miss Ivy's connection to it feel like a bond between living beings.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

What is the CENTRAL theme of this passage?`,
    options: [
      "The economics of property development",
      "The deep human connection to place and natural community, and the loss that comes when they are threatened",
      "The importance of sharing fruit",
      "Landlord-tenant disputes",
    ],
    correctAnswer: 1,
    explanation: `The threat to the tree is really a threat to a whole community's identity and shared life — the passage is about the human meaning of place.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Irony",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

What is ironic about the landlord's plan to build a concrete wall where the tree stands?`,
    options: [
      "Walls are cheaper than trees",
      "There is no irony — it makes practical sense",
      "The wall — a barrier that divides — will replace the tree, which was the central symbol of sharing and community connection",
      "Concrete is bad for the environment",
    ],
    correctAnswer: 2,
    explanation: `The irony is that a tree representing openness, sharing, and welcome will be replaced by a wall — the most literal symbol of division and exclusion.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Language Choice",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

The author uses the word 'quietly' twice — 'she said, quietly enough for only the tree to hear.' What does this repetition suggest?`,
    options: [
      "The author made a mistake",
      "Miss Ivy has a very soft voice",
      "The quietness is deliberate — the moment is private, intimate, and not for the public or the landlord to witness",
      "The landlord cannot hear well",
    ],
    correctAnswer: 2,
    explanation: `The repeated quietness makes the moment sacred and intimate — a private communication between Miss Ivy and the tree that excludes the commercial world threatening it.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Critical Reading",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

A reader says: 'This passage is sentimental — it is simply telling us to feel sad about a tree.' Is this a fair criticism?`,
    options: [
      "Yes — the passage is only about sadness",
      "Yes — feeling sad about trees is unreasonable",
      "No — the passage uses the tree to explore deeper themes of community, identity, and what is lost when development replaces living culture",
      "Yes — Miss Ivy should have fought the landlord",
    ],
    correctAnswer: 2,
    explanation: `The criticism is too shallow. A critical reader recognises the tree as a literary device through which the author explores profound themes about community, belonging, and the cost of development.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Comparative Reading",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

How is Miss Ivy's relationship with the tree SIMILAR to a person's relationship with their homeland?`,
    options: [
      "It is not similar",
      "Both involve fruit",
      "Both involve a deep, personal connection to a place that carries emotional memory, identity, and shared history",
      "Only old people feel connected to places",
    ],
    correctAnswer: 2,
    explanation: `Miss Ivy's bond with the tree — rooted in shared memory, community, and identity — mirrors the way people feel about their homeland. Both involve love for a place that shapes who you are.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

What does the phrase 'she did not argue or beg' tell us about Miss Ivy's character?`,
    options: [
      "She is weak and defeated",
      "She does not care about the tree",
      "She has a quiet dignity — she will not demean herself by pleading, but her response reveals the depth of her feeling",
      "She agrees with the landlord",
    ],
    correctAnswer: 2,
    explanation: `Not arguing or begging shows dignity and self-respect. She expresses her grief privately and on her own terms — a quiet strength.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Close Reading",
    question: `Read the passage then answer the question.

"The mango tree in Miss Ivy's yard had been there longer than anyone could remember. Its branches spread wide like the arms of a grandmother welcoming you home, and its fruit, when it fell, was always shared — first with the children of the yard, then with the neighbours, then with whoever happened to walk past at the right moment. When the landlord announced he would cut it down to build a concrete wall, Miss Ivy did not argue or beg. She simply went to the tree, placed her hand on its bark as though listening to a heartbeat, and said, quietly enough for only the tree to hear: 'We will be all right.' Nobody knew if she was comforting the tree or herself."

'Its fruit, when it fell, was always shared.' The use of 'always' is significant because:`,
    options: [
      "It means the tree produces fruit every day",
      "It suggests the sharing was a matter of choice",
      "'Always' makes the sharing an unbreakable tradition — a cultural and moral given in this community",
      "It means Miss Ivy never kept any fruit herself",
    ],
    correctAnswer: 2,
    explanation: `'Always' elevates the sharing from a choice to a tradition — a community norm so deep it needs no explanation or enforcement. This is the power of the word.`
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

export default function G5LaDiff1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaDiff1Questions : g5LaDiff1Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 1",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Difficult 1</CardTitle>
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
              <p className="text-slate-600">Language Arts Difficult 1</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Difficult 1</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
