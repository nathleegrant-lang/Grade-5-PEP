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

const g5LaMod8Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

What does the passage suggest about the deeper significance of the topic described?`,
    options: [
      "The topic is purely decorative",
      "The topic is significant only to a small group",
      "The passage reveals a deeper human, social, or cultural significance beneath the surface",
      "The passage has no deeper meaning",
    ],
    correctAnswer: 2,
    explanation: `Good passages operate on multiple levels — the surface topic and a deeper human significance that the writer invites the reader to notice.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Author's Craft",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

How does the author make the writing vivid and engaging?`,
    options: [
      "By using only facts and statistics",
      "Through the use of sensory details, specific examples, and carefully chosen language",
      "By writing very long sentences",
      "By including only opinions",
    ],
    correctAnswer: 1,
    explanation: `Vivid, engaging writing uses sensory details and precise word choices to bring the subject to life for the reader.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

In the passage, the word or phrase 'resilience' (or a similar theme word) most nearly means:`,
    options: [
      "a type of food",
      "the ability to recover and continue despite difficulty",
      "a musical style",
      "a geographical feature",
    ],
    correctAnswer: 1,
    explanation: `In passages about challenging human situations, resilience refers to the ability to face difficulty and keep going.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

What is the CENTRAL theme of this passage?`,
    options: [
      "A minor detail about Jamaica",
      "Something irrelevant to daily life",
      "A significant aspect of Jamaican life, identity, or challenge that reveals human depth",
      "An argument that Jamaica is inferior",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages are structured around a significant human theme — the surface topic reveals deeper meaning.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

Identify a figurative technique used in the passage and explain its effect.`,
    options: [
      "The passage contains no figurative language",
      "Figurative language is used to confuse the reader",
      "Figurative language is used to create vivid images, emotional resonance, or deeper meaning",
      "The passage only uses facts",
    ],
    correctAnswer: 2,
    explanation: `Writers use figurative language — metaphors, similes, personification — to deepen meaning and engage readers emotionally.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

What cause-and-effect relationship does the passage describe?`,
    options: [
      "Events in the passage happen randomly",
      "Actions or conditions in the passage lead to specific outcomes described by the writer",
      "The passage describes only effects without causes",
      "No relationships are described",
    ],
    correctAnswer: 1,
    explanation: `Moderate passages trace cause-and-effect relationships — understanding these is central to comprehending the argument or narrative.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

The MAIN purpose of this passage is:`,
    options: [
      "To entertain with a fictional story only",
      "To inform or persuade readers about a significant topic, often with an implicit argument",
      "To advertise a product",
      "To give instructions",
    ],
    correctAnswer: 1,
    explanation: `Moderate informational passages typically inform readers while also carrying an implicit argument or perspective.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

The tone of this passage is BEST described as:`,
    options: [
      "Angry and hostile",
      "Completely neutral with no feeling",
      "Thoughtful and engaged — the writer clearly cares about the topic",
      "Bored and uninterested",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages are written with engagement and care — the writer's concern for the topic is evident in their language choices.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Critical Thinking",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

Which of the following BEST reflects a critical reading of this passage?`,
    options: [
      "Accepting everything the writer says as completely true",
      "Finding the passage too difficult to understand",
      "Identifying the writer's perspective, examining the evidence, and considering what might have been left out",
      "Simply retelling what the passage says",
    ],
    correctAnswer: 2,
    explanation: `Critical reading involves evaluating the author's perspective, evidence, and potential gaps or biases — not just accepting the text at face value.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

Which statement BEST summarises the MAIN ARGUMENT or MESSAGE of this passage?`,
    options: [
      "The passage has no clear message",
      "The topic discussed is straightforward and has no complexity",
      "The passage reveals a significant truth about the topic — that it is more complex, important, or meaningful than it first appears",
      "The passage argues that the topic should be ignored",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages typically have a central insight that deepens the reader's understanding of the topic.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

How does the author STRUCTURE the passage?`,
    options: [
      "Randomly with no organisation",
      "By listing unrelated facts",
      "By building from a surface observation to a deeper insight or argument",
      "By presenting only one-sided facts",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages often move from the observable to the deeper — from surface description to significance.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Evidence",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

Which type of evidence does the author use to support the main point?`,
    options: [
      "No evidence at all",
      "Only personal opinion",
      "A combination of specific details, examples, and observations that build the argument",
      "Only statistics and numbers",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages use layered evidence — details, examples, and observations — to build a convincing argument.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

The phrase 'beneath the vibrant surface' (or similar) in the passage is used to:`,
    options: [
      "Describe the colour of something",
      "Signal that there is more depth and meaning beyond what first appears",
      "Confuse the reader",
      "Describe a physical location",
    ],
    correctAnswer: 1,
    explanation: `Phrases like 'beneath the surface' signal to the reader that the writer is about to reveal a deeper layer of meaning.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Audience",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

This passage was MOST LIKELY written for:`,
    options: [
      "Only specialists in the field",
      "A general, thoughtful audience interested in Jamaican life and culture",
      "Young children learning basic literacy",
      "Government officials only",
    ],
    correctAnswer: 1,
    explanation: `The language and content suggest a general, educated audience — not specialists, but thoughtful readers.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"The rapid expansion of digital technology in Jamaican classrooms has sparked considerable debate. Advocates argue that tablets, laptops, and internet access transform passive learners into active researchers, allowing students to explore beyond the textbook and develop the digital skills the modern economy demands. Critics, however, warn of a widening 'digital divide': students in well-funded urban schools may have access to the latest technology, while those in rural communities struggle with poor connectivity or no devices at all. There is also the question of distraction — unsupervised screen time can easily shift from educational to recreational. The consensus among educators is that technology, like any tool, is only as effective as the hands and minds that use it."

What does the passage IMPLY about the importance of this topic to Jamaican society?`,
    options: [
      "The topic is unimportant",
      "The topic affects only a small minority",
      "The topic is central to understanding Jamaican identity, economy, culture, or wellbeing",
      "The topic should be forgotten",
    ],
    correctAnswer: 2,
    explanation: `Moderate passages consistently signal that their topic matters deeply — to individuals, communities, or the nation.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which sentence uses the word 'ambitious' with a NEGATIVE connotation?`,
    options: [
      "She was an ambitious young teacher who wanted to inspire her students",
      "His ambitious plan to rebuild the community inspired everyone",
      "His ruthlessly ambitious nature led him to betray his colleagues",
      "The ambitious project created jobs for hundreds",
    ],
    correctAnswer: 2,
    explanation: `'Ruthlessly ambitious' shows ambition leading to harmful behaviour — a negative connotation.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Idiom",
    question: `'Don't count your chickens before they hatch.' This proverb means:`,
    options: [
      "Chicken farming is unpredictable",
      "Do not rely on something that has not yet happened",
      "Count all animals carefully",
      "Hatch eggs quickly",
    ],
    correctAnswer: 1,
    explanation: `The proverb warns against assuming a positive outcome before it is confirmed.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Extended Metaphor",
    question: `In the passage about technology in education, the writer uses extended description to suggest that:`,
    options: [
      "The topic is boring",
      "The topic is complex and carries deeper human meaning than its surface appearance suggests",
      "The topic is only important for tourists",
      "The passage is about something completely different",
    ],
    correctAnswer: 1,
    explanation: `Extended description in moderate passages reveals layers of meaning — the topic is always richer than it first appears.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The community was RESILIENT, bouncing back from the storm far more quickly than anyone expected. 'Resilient' means:`,
    options: [
      "easily defeated",
      "slow to change",
      "able to recover quickly from difficulties",
      "very noisy",
    ],
    correctAnswer: 2,
    explanation: `'Resilient' describes the ability to recover from setbacks — bouncing back from the storm supports this meaning.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'advocate' as a NOUN means:`,
    options: [
      "someone who opposes a cause",
      "someone who publicly supports or defends a cause",
      "a type of government",
      "an academic researcher",
    ],
    correctAnswer: 1,
    explanation: `An advocate (noun) is a person who actively supports or defends a particular cause or policy.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Figurative Language — Symbol",
    question: `In literature, the SEA is often used as a symbol for:`,
    options: [
      "nothing significant",
      "clarity and logic",
      "vastness, freedom, danger, or the unknown",
      "money and wealth",
    ],
    correctAnswer: 2,
    explanation: `The sea is a rich literary symbol often representing freedom, the unknown, vastness, or unpredictable danger.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Families",
    question: `Which set all belongs to the same word family?`,
    options: [
      "act, action, active, activate",
      "fast, quickly, speed, hurry",
      "house, home, shelter, dwelling",
      "write, read, speak, listen",
    ],
    correctAnswer: 0,
    explanation: `All four words (act, action, active, activate) share the root 'act' — they belong to the same word family.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Prefix trans-",
    question: `The prefix 'trans-' in 'transform' means:`,
    options: [
      "above",
      "across or beyond",
      "before",
      "not",
    ],
    correctAnswer: 1,
    explanation: `'Trans-' means across or beyond. Transform = change across/beyond the original form.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The artist's work was PROVOCATIVE, stirring debate and strong reactions wherever it was displayed. 'Provocative' means:`,
    options: [
      "calm and uncontroversial",
      "causing strong reactions or debate",
      "too expensive",
      "very colourful",
    ],
    correctAnswer: 1,
    explanation: `'Provocative' describes something that deliberately stimulates reaction or controversy — supported by 'stirring debate.'`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Proverb",
    question: `'Smooth seas never made a skilled sailor.' This proverb means:`,
    options: [
      "Always choose the easiest path",
      "Avoid the ocean if possible",
      "Challenges and difficulties are what develop skill, strength, and character",
      "Sailing is a dangerous sport",
    ],
    correctAnswer: 2,
    explanation: `The proverb uses seafaring as a metaphor for life — difficulties and hardship are what build genuine capability.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Complex Sentence",
    question: `Which sentence is a COMPLEX sentence?`,
    options: [
      "She studied hard",
      "She and her brother studied hard",
      "She studied hard because the exam was tomorrow",
      "She studied and her brother studied",
    ],
    correctAnswer: 2,
    explanation: `A complex sentence has one main clause and at least one subordinate clause. 'Because the exam was tomorrow' is the subordinate clause.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Passive Voice",
    question: `Identify the sentence in PASSIVE VOICE.`,
    options: [
      "The students completed the assignment",
      "The assignment was completed by the students",
      "Students work on assignments every day",
      "She handed in her assignment late",
    ],
    correctAnswer: 1,
    explanation: `Passive: subject (assignment) receives action (was completed). The agent 'students' follows 'by.'`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Reported Speech",
    question: `Change to REPORTED SPEECH: 'We are leaving tomorrow,' they said.`,
    options: [
      "They said that they were leaving the next day",
      "They said that we are leaving tomorrow",
      "They told that they leaving the next day",
      "They said we were leaving tomorrow",
    ],
    correctAnswer: 0,
    explanation: `Reported speech: 'we' → 'they'; present continuous → past continuous; 'tomorrow' → 'the next day.'`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation — Semicolon vs Comma",
    question: `Choose the correctly punctuated sentence.`,
    options: [
      "She loves reading, however she rarely has time for it",
      "She loves reading; however, she rarely has time for it",
      "She loves reading; however she rarely has time for it",
      "She loves reading however; she rarely has time for it",
    ],
    correctAnswer: 1,
    explanation: `A semicolon precedes 'however' when used as a conjunctive adverb, and a comma follows it.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence uses WHO correctly?`,
    options: [
      "The book who I read was excellent",
      "The teacher who I admire is retiring",
      "The school who won the competition was famous",
      "The prize who she won was large",
    ],
    correctAnswer: 1,
    explanation: `'Who' refers to people. 'The teacher who I admire' correctly uses 'who' to refer to a person.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Tense — Present Perfect vs Past Simple",
    question: `Which sentence correctly uses the PRESENT PERFECT?`,
    options: [
      "She lived in Jamaica for ten years (she no longer does)",
      "She has lived in Jamaica for ten years (she still does)",
      "She was living in Jamaica when I met her",
      "She will live in Jamaica",
    ],
    correctAnswer: 1,
    explanation: `Present perfect is used for actions that started in the past and continue to now. 'Has lived for ten years' still ongoing is present perfect.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Modal Verbs",
    question: `'You should exercise daily.' The modal 'should' expresses:`,
    options: [
      "certainty",
      "ability",
      "advice or recommendation",
      "permission",
    ],
    correctAnswer: 2,
    explanation: `'Should' expresses recommendation or advice — what is considered the right thing to do.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Participle Phrases",
    question: `Which sentence correctly uses a PARTICIPIAL PHRASE?`,
    options: [
      "Finishing the race, which was very long",
      "Having studied all night, she felt ready for the exam",
      "Running fast is good for health",
      "The running athlete was exhausted",
    ],
    correctAnswer: 1,
    explanation: `'Having studied all night' is a participial phrase that correctly modifies the subject 'she.'`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Punctuation — Apostrophe Types",
    question: `Which sentence correctly uses BOTH types of apostrophe (possession AND contraction)?`,
    options: [
      "Its raining and the dog's bowl is full",
      "It's raining and the dogs bowl is full",
      "It's raining and the dog's bowl is full",
      "Its raining and the dogs' bowl is full",
    ],
    correctAnswer: 2,
    explanation: `'It's' = it is (contraction). 'The dog's bowl' = bowl belonging to the dog (possession). Both are correctly used.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Sentence Variety",
    question: `Which technique creates the MOST effective sentence variety in a paragraph?`,
    options: [
      "Writing every sentence the same length",
      "Beginning every sentence with 'I'",
      "Using a mix of simple, compound, and complex sentences of varying lengths",
      "Avoiding all punctuation",
    ],
    correctAnswer: 2,
    explanation: `Varied sentence structures and lengths create rhythm, maintain interest, and show grammatical sophistication.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Analysing Language",
    question: `When asked to analyse HOW a writer creates a particular effect, a student should:`,
    options: [
      "Simply retell the plot",
      "State what happens without explaining the language",
      "Identify a specific technique, quote it, and explain what it makes the reader think or feel",
      "Say whether they liked the text",
    ],
    correctAnswer: 2,
    explanation: `Effective analysis: technique + quotation + effect on the reader. All three elements are essential.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Argument vs Assertion",
    question: `What is the difference between an ARGUMENT and an ASSERTION in writing?`,
    options: [
      "They are exactly the same",
      "An argument is supported by evidence and reasoning; an assertion is a claim stated without support",
      "An assertion is stronger than an argument",
      "Arguments are used only in formal essays",
    ],
    correctAnswer: 1,
    explanation: `An assertion states a position; an argument SUPPORTS that position with evidence and reasoning.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Register — Formal vs Informal",
    question: `Which feature is CHARACTERISTIC of formal written English?`,
    options: [
      "Contractions like 'don't' and 'won't'",
      "First person ('I feel that...')",
      "Complete sentences, precise vocabulary, and avoidance of slang",
      "Short, chatty sentences",
    ],
    correctAnswer: 2,
    explanation: `Formal writing avoids contractions and slang, uses complete sentences, and employs precise, varied vocabulary.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Openings",
    question: `Which type of OPENING is MOST effective for a persuasive speech?`,
    options: [
      "'In this essay I will argue...'",
      "A powerful rhetorical question or striking statement that immediately engages the audience",
      "Starting with 'My name is and I am going to talk about'",
      "A very long introduction with background information",
    ],
    correctAnswer: 1,
    explanation: `A striking opening — a rhetorical question, bold statement, or anecdote — immediately engages and hooks the audience.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Concluding Techniques",
    question: `Which is the MOST powerful way to END a persuasive essay?`,
    options: [
      "Introduce a brand new argument",
      "Repeat the introduction word for word",
      "End with a call to action or a memorable statement that reinforces the main message",
      "Simply stop writing after the last argument",
    ],
    correctAnswer: 2,
    explanation: `A strong conclusion reinforces the argument and often ends with a call to action or memorable statement that leaves a lasting impression.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "inference, author's craft, theme, tone, text analysis, figurative language" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "connotation, idioms, word relationships, advanced figurative language" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "clauses, passive voice, reported speech, complex sentences, punctuation" },
  { type: "writing" as const,    label: "Writing Skills",           note: "persuasive devices, analytical writing, register, planning, technique" },
]

export default function G5LaMod8MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMod8Questions : g5LaMod8Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Moderate 8</CardTitle>
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
              <p className="text-slate-600">Language Arts Moderate 8</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Moderate 8</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
