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

const g5LaMod3Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

What does the student council president's quote suggest about how young leaders respond to being trusted?`,
    options: [
      "They become arrogant",
      "They feel pressured and anxious",
      "They rise to the occasion and work harder not to disappoint",
      "They refuse greater responsibility",
    ],
    correctAnswer: 2,
    explanation: `'We step up' and 'we do not want to let anyone down' show that trust and genuine responsibility motivates young leaders to perform well.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

The phrase 'token roles' in the passage means:`,
    options: [
      "Important leadership positions",
      "Roles that are given as recognition only, without real power or responsibility",
      "Positions that require special training",
      "Elected positions in a government",
    ],
    correctAnswer: 1,
    explanation: `'Token' roles are symbolic — given to appear inclusive without offering real decision-making power.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Critical Analysis",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

What is the critics' concern about student leadership in some schools?`,
    options: [
      "That young people are too busy",
      "That leadership positions are used as academic rewards, not genuine development opportunities",
      "That student councils cost too much money",
      "That too many students want to be leaders",
    ],
    correctAnswer: 1,
    explanation: `Critics argue positions are given for academic merit rather than as meaningful development opportunities.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

The CENTRAL theme of this passage is:`,
    options: [
      "Young people should not be in leadership positions",
      "Student leadership is only for academically gifted students",
      "Genuine youth leadership requires real responsibility and trust to be effective",
      "Jamaica has too many youth organisations",
    ],
    correctAnswer: 2,
    explanation: `Every part of the passage argues that true leadership requires genuine responsibility — this is the central theme.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

Why does the author include a direct quote from a student council president?`,
    options: [
      "To fill space",
      "To make the passage longer",
      "To give authenticity and a real voice to the young leader's perspective",
      "To show that students cannot write well",
    ],
    correctAnswer: 2,
    explanation: `A direct quote from a young person experiencing leadership gives the argument credibility and brings a real voice into the discussion.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

According to the passage, giving young people 'genuine responsibility' CAUSES them to develop:`,
    options: [
      "Greater academic results only",
      "Stronger communication skills, empathy, and civic responsibility",
      "Better physical fitness",
      "More competitive attitudes",
    ],
    correctAnswer: 1,
    explanation: `The passage states research links genuine responsibility to stronger communication skills, empathy, and civic responsibility.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

'Civic responsibility' in the passage means:`,
    options: [
      "paying taxes on time",
      "a sense of duty and commitment to one's community and society",
      "physical fitness",
      "being responsible for household chores",
    ],
    correctAnswer: 1,
    explanation: `Civic responsibility refers to understanding and fulfilling one's duties as a member of a community or society.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

When the passage says leadership must offer 'real choices, real challenges, and real consequences,' it implies that:`,
    options: [
      "Leadership is always dangerous",
      "Without actual decision-making power, leadership is not meaningful",
      "Young people should face punishment for mistakes",
      "Only difficult tasks should be assigned to students",
    ],
    correctAnswer: 1,
    explanation: `The use of 'real' three times emphasises that meaningful leadership must involve actual stakes — not just the appearance of responsibility.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

The tone of this passage is BEST described as:`,
    options: [
      "Entirely supportive of youth leadership",
      "Entirely critical of youth leadership",
      "Balanced — presenting both the value of youth leadership and a concern about how it is practised",
      "Indifferent and uninterested",
    ],
    correctAnswer: 2,
    explanation: `The passage celebrates genuine youth leadership while acknowledging critics' concerns — a balanced, thoughtful tone.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

What is the MAIN purpose of this passage?`,
    options: [
      "To list all student leadership programmes in Jamaica",
      "To argue that schools should be abolished",
      "To explore the conditions under which youth leadership is genuinely effective",
      "To praise all student council presidents",
    ],
    correctAnswer: 2,
    explanation: `The passage analyses what makes youth leadership meaningful — exploring conditions for genuine effectiveness.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

Which BEST summarises this passage?`,
    options: [
      "Young people in Jamaica are lazy and uninterested",
      "Young people are natural leaders",
      "Youth leadership is valuable when it involves genuine responsibility and real decision-making, not just symbolic roles",
      "Academic achievement is the most important qualification for leadership",
    ],
    correctAnswer: 2,
    explanation: `This captures the key argument: genuine leadership (with real responsibility) vs. symbolic leadership.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Evidence",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

Which detail from the passage BEST supports the idea that youth leadership has real developmental benefits?`,
    options: [
      "The student council president is from Kingston",
      "Research suggests young people given genuine responsibility develop stronger communication skills and empathy",
      "Some schools give leadership as a reward",
      "Student councils exist across Jamaica",
    ],
    correctAnswer: 1,
    explanation: `Research evidence linking genuine responsibility to developmental benefits most strongly supports the claim.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

Based on the passage, which student is MOST LIKELY to benefit from leadership?`,
    options: [
      "A student given a title but no decision-making power",
      "A student elected to a position that involves planning real school events and solving actual problems",
      "A student who wins a prize for good grades",
      "A student who is asked to read the morning announcements",
    ],
    correctAnswer: 1,
    explanation: `Real decision-making and problem-solving — as opposed to symbolic or academic roles — are what the passage argues develop genuine leadership skills.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

The word 'empathy' in the passage means:`,
    options: [
      "competitive drive",
      "physical strength",
      "the ability to understand and share others' feelings",
      "intelligence and academic skill",
    ],
    correctAnswer: 2,
    explanation: `Empathy is the capacity to understand and share what others feel — a key interpersonal skill developed through leadership.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

"Across Jamaica, young people are increasingly taking on leadership roles in their communities. Student councils, environmental clubs, community clean-up campaigns, and youth parliaments give students the opportunity to develop skills that go far beyond the classroom. Research suggests that young people who are given genuine responsibility — not just token roles — develop stronger communication skills, greater empathy, and a deeper sense of civic responsibility. One student council president from Kingston said, 'When adults actually listen to us and trust us with real decisions, we step up. We do not want to let anyone down.' Critics argue, however, that some schools use student leadership positions as rewards for academic achievement rather than as genuine development opportunities. For student leadership to be meaningful, it must offer real choices, real challenges, and real consequences."

How does the author structure the argument in this passage?`,
    options: [
      "By listing unconnected facts",
      "By presenting only one viewpoint",
      "By presenting the value of youth leadership, a supporting voice, a critical perspective, then a conclusion about what makes leadership meaningful",
      "By giving a personal story then a conclusion",
    ],
    correctAnswer: 2,
    explanation: `The passage moves through value → evidence (quote) → criticism → conclusion — a structured analytical approach.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the most NEGATIVE connotation when describing someone's behaviour?`,
    options: [
      "assertive",
      "confident",
      "pushy",
      "determined",
    ],
    correctAnswer: 2,
    explanation: `'Pushy' implies aggression and selfishness — a negative connotation. The others describe similar traits more positively.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Idiom",
    question: `'The new student was a fish out of water on his first day.' This idiom means:`,
    options: [
      "He was an excellent swimmer",
      "He felt uncomfortable and out of place",
      "He was very happy and confident",
      "He was very quiet",
    ],
    correctAnswer: 1,
    explanation: `'A fish out of water' describes someone who feels awkward or uncomfortable in an unfamiliar environment.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Figurative Language — Simile",
    question: `'Her laughter was like a melody that filled the room.' This is a:`,
    options: [
      "Metaphor",
      "Personification",
      "Simile",
      "Alliteration",
    ],
    correctAnswer: 2,
    explanation: `A simile compares two things using 'like.' Her laughter is compared to a melody using 'like.'`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The principal spoke with AUTHORITY, and everyone in the room fell silent. 'Authority' in this context means:`,
    options: [
      "confusion",
      "anger",
      "the power and confidence to be obeyed",
      "a type of punishment",
    ],
    correctAnswer: 2,
    explanation: `'Authority' here means the power and commanding presence that causes others to listen and comply.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'consequence' means:`,
    options: [
      "a reward for good behaviour",
      "a cause of something",
      "a result or outcome of an action",
      "an intention or plan",
    ],
    correctAnswer: 2,
    explanation: `A consequence is a result that follows from an action — it can be positive or negative.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Synonyms",
    question: `A SYNONYM for 'significant' is:`,
    options: [
      "trivial",
      "tiny",
      "important",
      "unclear",
    ],
    correctAnswer: 2,
    explanation: `'Significant' means important or meaningful. 'Important' is a synonym.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Figurative Language — Extended Metaphor",
    question: `A writer describes a school as a 'garden where young minds are planted and grown.' The teacher is compared to:`,
    options: [
      "a student",
      "a gardener who tends and nurtures students",
      "a building",
      "a flower",
    ],
    correctAnswer: 1,
    explanation: `In this extended metaphor, if students are plants being grown, the teacher logically takes the role of the gardener who tends them.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Negative Prefix",
    question: `Which word uses a prefix to mean 'NOT responsible'?`,
    options: [
      "responsible",
      "overresponsible",
      "irresponsible",
      "responsibly",
    ],
    correctAnswer: 2,
    explanation: `The prefix 'ir-' means not. 'Irresponsible' = not responsible.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The research was INCONCLUSIVE — scientists could not agree on what the results meant. 'Inconclusive' means:`,
    options: [
      "very exciting",
      "not leading to a definite answer",
      "completely false",
      "extremely important",
    ],
    correctAnswer: 1,
    explanation: `'Inconclusive' means unable to produce a clear, definite conclusion or answer.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Proverb",
    question: `'Two heads are better than one' means:`,
    options: [
      "Having two leaders causes confusion",
      "Collaboration and sharing ideas produces better results than working alone",
      "You need two people to count",
      "Heads are important parts of the body",
    ],
    correctAnswer: 1,
    explanation: `This proverb suggests that working together and combining ideas leads to better outcomes than working in isolation.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Conditional — Second",
    question: `Which is a SECOND CONDITIONAL sentence (imaginary/unlikely situation)?`,
    options: [
      "If it rains, I will stay inside",
      "If it rained, I would stay inside",
      "I stayed inside because it rained",
      "I hope it does not rain",
    ],
    correctAnswer: 1,
    explanation: `Second conditional: if + past tense, would + infinitive. Used for unlikely or hypothetical situations.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Passive Voice — Purpose",
    question: `When is PASSIVE VOICE most appropriately used?`,
    options: [
      "When the action is more important than who performed it",
      "When the writer is unsure of grammar rules",
      "When the writing needs to be longer",
      "When the subject is a person",
    ],
    correctAnswer: 0,
    explanation: `Passive voice is used when the focus is on the action/result rather than on the person performing it.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Reported Speech — Commands",
    question: `Change to REPORTED SPEECH: 'Sit down!' the teacher said.`,
    options: [
      "The teacher said to sit down",
      "The teacher said that sit down",
      "The teacher told to sit down",
      "The teacher said sit down",
    ],
    correctAnswer: 0,
    explanation: `Reported commands use 'told + object + to + infinitive' or 'said + to + infinitive.' 'The teacher said to sit down' is correct.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation — Parentheses",
    question: `Parentheses (brackets) are used to:`,
    options: [
      "show possession",
      "add extra, non-essential information to a sentence",
      "list items",
      "show contrast",
    ],
    correctAnswer: 1,
    explanation: `Parentheses enclose additional information that is not essential to the main sentence but adds clarification or interest.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Ellipsis",
    question: `An ELLIPSIS (…) is used to:`,
    options: [
      "show that a list continues or that words have been omitted",
      "indicate possession",
      "end an exclamation",
      "add extra information",
    ],
    correctAnswer: 0,
    explanation: `An ellipsis shows that words have been left out, or that a thought trails off or continues.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Verb Phrase",
    question: `Which underlined group of words is a VERB PHRASE? 'She [has been working] very hard.'`,
    options: [
      "She",
      "has been working",
      "very hard",
      "hard",
    ],
    correctAnswer: 1,
    explanation: `'Has been working' is a verb phrase — the complete verb including auxiliary verbs (has been) and the main verb (working).`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Gerunds",
    question: `In the sentence 'Swimming is great exercise,' 'Swimming' is:`,
    options: [
      "A verb",
      "A noun (gerund)",
      "An adjective",
      "An adverb",
    ],
    correctAnswer: 1,
    explanation: `A gerund is a verb form ending in -ing that functions as a noun. 'Swimming' is the subject here — a gerund.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Pronoun — Reflexive",
    question: `Which sentence uses a REFLEXIVE PRONOUN correctly?`,
    options: [
      "Myself went to the shop",
      "She hurt herself during practice",
      "He gave the prize to himself and me",
      "Themselves completed the project",
    ],
    correctAnswer: 1,
    explanation: `'Herself' is the reflexive pronoun referring back to the subject 'she.' Reflexive pronouns end in -self/-selves.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Clauses — Adverbial",
    question: `Identify the ADVERBIAL CLAUSE in: 'She studied harder than she ever had before because the exam was tomorrow.'`,
    options: [
      "She studied harder",
      "than she ever had before",
      "because the exam was tomorrow",
      "harder than she ever had before",
    ],
    correctAnswer: 2,
    explanation: `An adverbial clause modifies the verb and is introduced by a subordinating conjunction. 'Because the exam was tomorrow' explains WHY she studied harder.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Agreement — Neither/Nor",
    question: `Choose the correct form: 'Neither the manager nor his assistant ___ informed of the change.'`,
    options: [
      "were",
      "are",
      "was",
      "have been",
    ],
    correctAnswer: 2,
    explanation: `With 'neither…nor,' the verb agrees with the noun closest to it — 'assistant' is singular. Use 'was.'`
  },
  {
    id: 36,
    type: "writing",
    skill: "Rhetorical Questions",
    question: `A rhetorical question in persuasive writing is used to:`,
    options: [
      "Ask for factual information from the reader",
      "Create a dramatic effect and engage the reader without requiring a literal answer",
      "Find out the reader's opinion",
      "Begin a formal essay",
    ],
    correctAnswer: 1,
    explanation: `Rhetorical questions engage the reader by making them think, without needing a real answer. They add persuasive impact.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Purpose of Evidence",
    question: `Why should a persuasive writer include EVIDENCE such as statistics, research, or examples?`,
    options: [
      "To make the writing longer",
      "To confuse the reader",
      "To support arguments and make claims more convincing and credible",
      "To avoid giving their own opinion",
    ],
    correctAnswer: 2,
    explanation: `Evidence adds credibility — it shows claims are based on fact rather than mere opinion, making arguments more persuasive.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Voice and Tone",
    question: `A student writes a diary entry about feeling anxious before an exam. The tone should be:`,
    options: [
      "Formal and impersonal",
      "Personal, reflective, and honest",
      "Academic and objective",
      "Persuasive and argumentative",
    ],
    correctAnswer: 1,
    explanation: `A diary entry is a personal, private form of writing. The tone should be honest, reflective, and personal.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Planning — Essay Outline",
    question: `An essay OUTLINE helps a writer by:`,
    options: [
      "Giving them the final draft",
      "Making the writing shorter",
      "Organising main ideas and supporting points before drafting",
      "Correcting grammar errors",
    ],
    correctAnswer: 2,
    explanation: `An outline maps out the structure of an essay — main points, supporting details — before the writer begins drafting.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Cohesion",
    question: `Which device helps create COHESION (flow and connection) in a piece of writing?`,
    options: [
      "Writing in very short sentences",
      "Changing topic in every paragraph",
      "Using linking words and pronouns to connect ideas across sentences and paragraphs",
      "Avoiding all punctuation",
    ],
    correctAnswer: 2,
    explanation: `Cohesion is created when sentences and paragraphs are clearly connected — through linking words (however, therefore, furthermore) and pronoun reference.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "inference, author's craft, theme, tone, text analysis, figurative language" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "connotation, idioms, word relationships, advanced figurative language" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "clauses, passive voice, reported speech, complex sentences, punctuation" },
  { type: "writing" as const,    label: "Writing Skills",           note: "persuasive devices, analytical writing, register, planning, technique" },
]

export default function G5LaMod3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMod3Questions : g5LaMod3Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 3",
        difficulty: "Moderate",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Moderate 3</CardTitle>
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
              <p className="text-slate-600">Language Arts Moderate 3</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Moderate 3</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
