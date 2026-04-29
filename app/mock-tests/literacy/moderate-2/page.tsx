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

const g5LaMod2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Metaphor Analysis",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

Why does the author call coral reefs 'the rainforests of the sea'?`,
    options: [
      "Because coral reefs look like trees",
      "Because both are rich, diverse ecosystems that support enormous numbers of species",
      "Because the ocean is like a forest",
      "Because coral reefs are found in tropical areas only",
    ],
    correctAnswer: 1,
    explanation: `The metaphor compares coral reefs to rainforests because both are exceptionally biodiverse ecosystems despite covering a relatively small area.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

What percentage of marine species do coral reefs support?`,
    options: [
      "Less than 1%",
      "About 10%",
      "Approximately 25%",
      "More than 50%",
    ],
    correctAnswer: 2,
    explanation: `The passage states reefs 'support approximately twenty-five percent of all marine species.'`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

The word 'expel' in the passage most nearly means:`,
    options: [
      "invite in",
      "keep safe",
      "force out",
      "transform",
    ],
    correctAnswer: 2,
    explanation: `'Expel' means to force out or eject. The corals force out the algae during bleaching.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

What CAUSES coral bleaching?`,
    options: [
      "Overfishing in reef areas",
      "Pollution from coastal development",
      "Rising ocean temperatures caused by climate change",
      "Storm damage to coastlines",
    ],
    correctAnswer: 2,
    explanation: `The passage directly states that 'rising ocean temperatures caused by climate change are causing coral bleaching.'`
  },
  {
    id: 5,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

Why does the author include the statistics about coral reefs covering 'less than one percent' of the ocean but supporting '25% of species'?`,
    options: [
      "To confuse the reader with numbers",
      "To show the contrast between the small size and enormous importance of coral reefs",
      "To prove the ocean is very large",
      "To suggest that statistics are unreliable",
    ],
    correctAnswer: 1,
    explanation: `The contrast between the tiny area (1%) and huge biodiversity benefit (25% of species) emphasises how critically important reefs are.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

What can you infer from the scientist's warning about 'current trends'?`,
    options: [
      "Scientists are pleased with progress on climate change",
      "Not enough is currently being done to protect reefs",
      "The reefs will definitely survive",
      "Scientists disagree about whether reefs are in danger",
    ],
    correctAnswer: 1,
    explanation: `The warning implies current actions are insufficient — trends must change to prevent severe reef damage.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

What is the CENTRAL theme of this passage?`,
    options: [
      "Jamaica's fishing industry is very successful",
      "Coral reefs are beautiful but unimportant",
      "Coral reefs are vital ecosystems under serious threat that require urgent protection",
      "Climate change only affects the ocean",
    ],
    correctAnswer: 2,
    explanation: `The passage establishes reefs' importance and their threat, then calls for protection — this is the central theme.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

The word 'ecosystems' in the passage refers to:`,
    options: [
      "systems of government",
      "communities of living organisms and their environment",
      "types of ocean currents",
      "methods of fishing",
    ],
    correctAnswer: 1,
    explanation: `An ecosystem is a community of plants, animals, and their environment functioning as a system.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Multi-Cause",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

According to the passage, what THREE local actions damage coral reefs?`,
    options: [
      "Climate change, tourism, fishing",
      "Pollution, overfishing, and coastal development",
      "Storm damage, bleaching, and algae",
      "Cold water, darkness, and pressure",
    ],
    correctAnswer: 1,
    explanation: `The passage lists 'pollution, overfishing, and coastal development' as local threats that require local effort to address.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

This passage was MOST LIKELY written for:`,
    options: [
      "Deep-sea scientists only",
      "A general audience concerned about the environment",
      "Only Jamaican fishermen",
      "Government ministers only",
    ],
    correctAnswer: 1,
    explanation: `The accessible language and range of concerns (tourism, jobs, coastlines, species) suggest a general, concerned audience.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

Which BEST summarises this passage?`,
    options: [
      "Coral reefs are beautiful and people should visit them",
      "Coral reefs are critically important ecosystems facing serious threats from climate change and local activities, and need both global and local protection",
      "Fishing in Jamaica is very successful",
      "Climate change makes the ocean warmer",
    ],
    correctAnswer: 1,
    explanation: `This captures importance, threats, and the need for action — the full message of the passage.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

Which is a FACT from the passage?`,
    options: [
      "Coral reefs are the most beautiful places on Earth",
      "Protecting reefs is easy if people care",
      "Coral reefs support approximately 25% of all marine species",
      "Jamaica has the best coral reefs in the Caribbean",
    ],
    correctAnswer: 2,
    explanation: `This is a stated statistic from the passage — verifiable. The others are opinions.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

The MAIN purpose of this passage is to:`,
    options: [
      "Persuade tourists to visit Jamaican reefs",
      "Entertain readers with an underwater adventure",
      "Inform readers about coral reefs and persuade them of the urgency of protecting them",
      "Argue that climate change does not exist",
    ],
    correctAnswer: 2,
    explanation: `The passage informs about reefs and their threats, using evidence to create a sense of urgency about protection.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference — Action",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

The passage suggests that protecting coral reefs requires:`,
    options: [
      "Action at only the local level",
      "Action at only the global level",
      "Both global action on climate change AND local action to reduce pollution and overfishing",
      "No action — the reefs will recover on their own",
    ],
    correctAnswer: 2,
    explanation: `The final sentence explicitly states protection 'requires both global action on climate change and local efforts.'`
  },
  {
    id: 15,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Coral reefs are often called the rainforests of the sea. They cover less than one percent of the ocean floor, yet they support approximately twenty-five percent of all marine species. In Jamaica, coral reefs provide food and income for fishing communities, protect coastlines from storm damage, and attract tourists whose spending supports thousands of jobs. However, rising ocean temperatures caused by climate change are causing coral bleaching — a process in which corals expel the algae living inside them and turn white, eventually dying if conditions do not improve. Scientists warn that if current trends continue, many of Jamaica's reefs could be severely damaged within decades. Protecting these ecosystems requires both global action on climate change and local efforts to reduce pollution, overfishing, and coastal development."

'Coral reefs are often called the rainforests of the sea.' What effect does this metaphor have?`,
    options: [
      "It confuses readers who have never seen a reef",
      "It helps readers understand the rich biodiversity of reefs by comparing them to a familiar ecosystem",
      "It suggests that coral reefs grow trees",
      "It means coral reefs are found near rainforests",
    ],
    correctAnswer: 1,
    explanation: `Comparing reefs to rainforests — a well-known biodiversity hotspot — instantly communicates their ecological richness to the reader.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the most POSITIVE connotation?`,
    options: [
      "cunning",
      "devious",
      "clever",
      "sneaky",
    ],
    correctAnswer: 2,
    explanation: `'Clever' suggests intelligence in a positive way. The others imply dishonesty or manipulation.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Idiom",
    question: `'She let the cat out of the bag.' This idiom means:`,
    options: [
      "She found a stray cat",
      "She accidentally revealed a secret",
      "She opened a shopping bag",
      "She was generous",
    ],
    correctAnswer: 1,
    explanation: `'Let the cat out of the bag' means to accidentally reveal information that was meant to be kept secret.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Figurative Language — Hyperbole",
    question: `'I have told you a million times!' This is an example of:`,
    options: [
      "A simile",
      "Personification",
      "Hyperbole",
      "Alliteration",
    ],
    correctAnswer: 2,
    explanation: `Hyperbole is deliberate exaggeration for effect. The speaker has not literally said it a million times.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The scientist's findings were GROUNDBREAKING — they changed the way people understood the disease. 'Groundbreaking' means:`,
    options: [
      "dangerous and risky",
      "dull and unimportant",
      "completely new and innovative",
      "carefully planned",
    ],
    correctAnswer: 2,
    explanation: `'Groundbreaking' describes something that is pioneering — introducing new ideas that change existing understanding.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is an ANTONYM of 'transparent'?`,
    options: [
      "clear",
      "obvious",
      "opaque",
      "visible",
    ],
    correctAnswer: 2,
    explanation: `'Transparent' means see-through or clear. 'Opaque' means not transparent — blocking light. They are antonyms.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is a SYNONYM for 'courageous'?`,
    options: [
      "timid",
      "cowardly",
      "valiant",
      "fearful",
    ],
    correctAnswer: 2,
    explanation: `'Valiant' means brave and determined — a synonym for courageous.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Figurative Language — Personification",
    question: `'The ocean whispered secrets to the shore.' What technique is used?`,
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Hyperbole",
    ],
    correctAnswer: 2,
    explanation: `The ocean is given the human ability to whisper — this is personification.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Word Meaning in Context",
    question: `The report was AMBIGUOUS — different people interpreted it in completely different ways. 'Ambiguous' means:`,
    options: [
      "perfectly clear",
      "open to more than one interpretation",
      "very exciting",
      "completely wrong",
    ],
    correctAnswer: 1,
    explanation: `'Ambiguous' describes something that can be understood in more than one way — lacking clear meaning.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Word Families",
    question: `Which set are all forms of the same word?`,
    options: [
      "run, jog, sprint, dash",
      "happy, joyful, glad, pleased",
      "beauty, beautiful, beautify, beautician",
      "red, green, blue, purple",
    ],
    correctAnswer: 2,
    explanation: `All four words (beauty, beautiful, beautify, beautician) share the root 'beaut-' — they belong to the same word family.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Proverb",
    question: `What does 'a stitch in time saves nine' mean?`,
    options: [
      "Sewing is an important skill",
      "Acting early to fix a small problem prevents it from becoming a bigger one",
      "Nine is an important number",
      "You should always carry a needle and thread",
    ],
    correctAnswer: 1,
    explanation: `This proverb advises that addressing a small problem promptly (one stitch) prevents a much larger problem later (nine stitches).`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Clause Types",
    question: `Which sentence contains a NOUN CLAUSE?`,
    options: [
      "She walked quickly to school",
      "The boy who won the race was tall",
      "What she said surprised everyone",
      "She arrived before the bell rang",
    ],
    correctAnswer: 2,
    explanation: `A noun clause functions as a noun. 'What she said' acts as the subject — it is a noun clause.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Passive Voice",
    question: `Rewrite in PASSIVE VOICE: 'The chef cooked the meal.'`,
    options: [
      "The meal was cooked by the chef",
      "The chef will cook the meal",
      "The meal cooked the chef",
      "The meal has been cooking",
    ],
    correctAnswer: 0,
    explanation: `Passive voice moves the object to subject position: 'The meal was cooked by the chef.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Reported Speech — Question",
    question: `Change to REPORTED SPEECH: 'Are you coming to the party?' he asked.`,
    options: [
      "He asked that are you coming to the party",
      "He asked whether I was coming to the party",
      "He asked if I am coming to the party",
      "He asked if you are coming to the party",
    ],
    correctAnswer: 1,
    explanation: `Reported questions use 'whether' or 'if,' and the tense shifts back (am → was).`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation — Dash",
    question: `A DASH is used to:`,
    options: [
      "End a sentence",
      "Show possession",
      "Introduce an explanation or aside, or show a pause",
      "Separate items in a list (instead of commas)",
    ],
    correctAnswer: 2,
    explanation: `A dash can introduce additional information, an explanation, or show a dramatic pause in a sentence.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Participle Phrases",
    question: `Identify the PARTICIPLE PHRASE in: 'Running late, she grabbed her bag and rushed out.'`,
    options: [
      "she grabbed her bag",
      "Running late",
      "rushed out",
      "grabbed her bag",
    ],
    correctAnswer: 1,
    explanation: `'Running late' is a participial phrase — it modifies the subject 'she' and uses the present participle 'running.'`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Tense — Future Perfect",
    question: `Which sentence uses the FUTURE PERFECT tense?`,
    options: [
      "She will finish by tomorrow",
      "She has finished the work",
      "She will have finished by tomorrow",
      "She finished yesterday",
    ],
    correctAnswer: 2,
    explanation: `Future perfect = will have + past participle. 'Will have finished' describes something completed before a future time.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `In 'When Maya met Aisha, she was very nervous,' who was nervous?`,
    options: [
      "Maya",
      "Aisha",
      "Both of them",
      "It is unclear from the sentence",
    ],
    correctAnswer: 3,
    explanation: `The pronoun 'she' is ambiguous — it could refer to either Maya or Aisha. This is a grammatical ambiguity.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Variety",
    question: `Which pair of sentences could BEST be combined into ONE complex sentence?`,
    options: [
      "She likes mangoes. Mangoes are yellow.",
      "It rained. She stayed inside because it was raining.",
      "She was tired. She went to sleep.",
      "The car was red. The car was fast.",
    ],
    correctAnswer: 2,
    explanation: `'She was tired. She went to sleep.' can become 'She went to sleep because she was tired' — a complex sentence using a subordinating conjunction.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Concord — Collective Nouns",
    question: `Choose the correct verb: 'The committee ___ divided on the issue.'`,
    options: [
      "is",
      "are",
      "was",
      "were",
    ],
    correctAnswer: 0,
    explanation: `In British/Caribbean English, collective nouns like 'committee' can take plural verbs when members act individually. 'The committee are divided' is also acceptable, but 'is' is the standard form in formal writing.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Punctuation — Inverted Commas",
    question: `Inverted commas (quotation marks) are used to:`,
    options: [
      "Show possession",
      "Mark the title of a chapter or article (as an alternative to italics) or enclose direct speech",
      "End a sentence",
      "Separate items in a list",
    ],
    correctAnswer: 1,
    explanation: `Inverted commas enclose direct speech and can also mark titles or words used in a special sense.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Analysing Techniques",
    question: `When asked to analyse a writer's use of figurative language, a student should:`,
    options: [
      "Simply say whether they liked the writing",
      "Identify the technique, quote it, and explain its effect on the reader",
      "Only count how many similes are in the text",
      "Rewrite the text in their own words",
    ],
    correctAnswer: 1,
    explanation: `Literary analysis requires identifying techniques (what), quoting them (where), and explaining their effect on the reader (why it matters).`
  },
  {
    id: 37,
    type: "writing",
    skill: "Formal Essay Structure",
    question: `Which feature is ESSENTIAL in a formal essay but NOT in an informal personal narrative?`,
    options: [
      "A conclusion",
      "Use of descriptive language",
      "A bibliography or reference list",
      "Paragraphs",
    ],
    correctAnswer: 2,
    explanation: `A formal essay — especially a research-based one — requires a bibliography listing sources. Informal narratives do not.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Persuasive Language",
    question: `'Surely no reasonable person could disagree that…' This phrase is an example of:`,
    options: [
      "Factual evidence",
      "Alliteration",
      "Rhetorical assumption that makes the reader feel they must agree",
      "A direct counterargument",
    ],
    correctAnswer: 2,
    explanation: `This technique assumes the reader already agrees, putting social pressure on them to accept the argument — a form of rhetorical manipulation.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Drafting and Editing",
    question: `Which describes the EDITING stage of the writing process?`,
    options: [
      "Generating first ideas freely",
      "Writing the first version of the text",
      "Reviewing for errors in grammar, clarity, spelling, and structure",
      "Choosing your topic",
    ],
    correctAnswer: 2,
    explanation: `Editing involves reviewing a draft to correct errors and improve clarity, grammar, structure, and style.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Linking Words",
    question: `Which linking word BEST shows CONTRAST between two ideas?`,
    options: [
      "Furthermore",
      "In addition",
      "However",
      "Therefore",
    ],
    correctAnswer: 2,
    explanation: `'However' introduces a contrasting or opposing idea. 'Furthermore' and 'In addition' add similar ideas; 'Therefore' shows result.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "inference, author's craft, theme, tone, text analysis, figurative language" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "connotation, idioms, word relationships, advanced figurative language" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "clauses, passive voice, reported speech, complex sentences, punctuation" },
  { type: "writing" as const,    label: "Writing Skills",           note: "persuasive devices, analytical writing, register, planning, technique" },
]

export default function G5LaMod2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMod2Questions : g5LaMod2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Moderate 2</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Moderate Level</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Moderate Level Focus</h3>
              <p className="text-slate-700">This test requires deeper analysis of texts — understanding inference, author's craft, figurative language, complex grammar structures, and effective writing techniques at a solid NSC Grade 5 standard.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: analysing how language creates meaning</li>
                <li>Communication: understanding purpose, audience, and register</li>
                <li>Creativity: recognising how writers use technique for effect</li>
                <li>Collaboration: understanding how writing connects with readers</li>
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
              <p className="text-slate-600">Language Arts Moderate 2</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Moderate 2</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
