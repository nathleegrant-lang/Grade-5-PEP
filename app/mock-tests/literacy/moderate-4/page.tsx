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

const g5LaMod4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Character Analysis",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

What does the passage suggest about how Garvey viewed Black people?`,
    options: [
      "He believed Black people were inferior",
      "He believed Black people were equal, proud, and deserving of freedom and self-determination",
      "He thought Black people should remain in slavery",
      "He only cared about Jamaican people",
    ],
    correctAnswer: 1,
    explanation: `Garvey's message was that Black people were not inferior, that Africa was a source of pride, and that self-reliance could bring freedom — a positive, empowering view.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The word 'transformative' in the passage most nearly means:`,
    options: [
      "complicated",
      "causing deep and significant change",
      "confusing and unclear",
      "popular and well-liked",
    ],
    correctAnswer: 1,
    explanation: `'Transformative' describes something that causes profound, fundamental change — Garvey's message changed how people saw themselves.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Author's Technique",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

Why does the author list three things Garvey told Black people: that they were not inferior, that Africa was their homeland, and that unity was key?`,
    options: [
      "To show the author did research",
      "To create a complete picture of the core elements of Garvey's message through the rule of three",
      "To confuse the reader",
      "To suggest Garvey was wrong",
    ],
    correctAnswer: 1,
    explanation: `Listing three core elements of Garvey's message creates a comprehensive, balanced portrait and uses the rhetorical power of three.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

What does Garvey's slogan 'One God, One Aim, One Destiny' suggest about his message?`,
    options: [
      "He believed in many different goals for different people",
      "He wanted unity and a shared purpose among Black people worldwide",
      "He was only interested in religion",
      "He did not believe in individual freedom",
    ],
    correctAnswer: 1,
    explanation: `The repetition of 'One' emphasises oneness and unity — a shared purpose and direction for Black people globally.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Legacy",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

According to the passage, Garvey's ideas influenced THREE specific movements or faiths. What were they?`,
    options: [
      "Slavery, colonialism, and independence",
      "The civil rights movement, Caribbean independence movements, and the Rastafari faith",
      "Science, religion, and art",
      "Education, sport, and culture",
    ],
    correctAnswer: 1,
    explanation: `The passage directly states these three areas of influence.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Balanced Perspective",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The passage acknowledges that Garvey was 'sometimes controversial.' Why does the author include this detail?`,
    options: [
      "To undermine Garvey's importance",
      "To show the author dislikes Garvey",
      "To present a balanced and honest account of Garvey, acknowledging challenges alongside his greatness",
      "To suggest Garvey broke the law deliberately",
    ],
    correctAnswer: 2,
    explanation: `Including controversy shows the author is balanced — acknowledging reality rather than presenting only a one-sided portrait.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The phrase 'prophet of Black consciousness' suggests Garvey was:`,
    options: [
      "A religious leader only",
      "Someone who predicted the future",
      "A visionary who expressed and awakened awareness of Black identity and pride",
      "A controversial politician only",
    ],
    correctAnswer: 2,
    explanation: `'Black consciousness' refers to an awareness and affirmation of Black identity. Calling Garvey its 'prophet' means he was a visionary who spoke it into existence before others understood it.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The CENTRAL theme of this passage is:`,
    options: [
      "Jamaica's history of colonialism",
      "The impact of religion on politics",
      "Marcus Garvey's powerful message of Black pride, unity, and self-reliance, and his global legacy",
      "The history of the UNIA organisation",
    ],
    correctAnswer: 2,
    explanation: `All elements of the passage focus on Garvey's message, its content, its reach, and its legacy — this is the central theme.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The MAIN purpose of this passage is to:`,
    options: [
      "Argue that Garvey was wrong",
      "Entertain readers with a biographical story",
      "Inform readers about Garvey's life, message, and lasting global influence",
      "Explain the Rastafari faith",
    ],
    correctAnswer: 2,
    explanation: `The passage presents biographical information alongside analysis of Garvey's message and influence — an informative and celebratory purpose.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Figurative Language",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The author calls Garvey 'a prophet of Black consciousness.' How does the word 'prophet' add meaning?`,
    options: [
      "It suggests Garvey could predict lottery numbers",
      "It implies Garvey had a powerful, visionary voice that spoke truth before others understood it",
      "It suggests he was a religious leader only",
      "It implies he made mistakes",
    ],
    correctAnswer: 1,
    explanation: `'Prophet' carries connotations of vision, truth-speaking, and foresight — suggesting Garvey saw and expressed truths about identity and justice before mainstream recognition.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

Why might Garvey have been controversial in the United States?`,
    options: [
      "Because he was from Jamaica",
      "Because his message of Black pride and self-determination challenged the racial power structures of the time",
      "Because he was not a citizen",
      "Because he refused to work",
    ],
    correctAnswer: 1,
    explanation: `His message of Black equality and self-determination was threatening to the racial hierarchies of the early 20th century United States — making him a target for opposition.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Summarise",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

Which BEST summarises this passage?`,
    options: [
      "Garvey was a Jamaican politician who made speeches",
      "Marcus Garvey was a visionary Jamaican leader whose message of Black pride, unity, and self-reliance had a lasting global impact on civil rights and Black consciousness",
      "Garvey was controversial and faced problems in America",
      "Garvey founded an organisation called UNIA",
    ],
    correctAnswer: 1,
    explanation: `This captures his identity, message, and global legacy — the full content of the passage.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Tone",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

The tone of this passage is BEST described as:`,
    options: [
      "Critical and disapproving",
      "Neutral and scientific",
      "Admiring and informative",
      "Humorous and light",
    ],
    correctAnswer: 2,
    explanation: `The writer clearly admires Garvey — describing him as 'influential,' 'transformative,' and a 'fighter for justice' — while also informing the reader.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Text Evidence",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

Which evidence from the passage BEST supports the claim that Garvey had global influence?`,
    options: [
      "He was born in St. Ann",
      "He faced legal challenges in the United States",
      "His ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith",
      "He had a slogan",
    ],
    correctAnswer: 2,
    explanation: `The breadth of Garvey's influence — spanning continents and multiple movements — is the strongest evidence of global impact.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Implied Meaning",
    question: `Read the passage then answer the question.

"Marcus Mosiah Garvey was born in St. Ann, Jamaica, in 1887. He became one of the most influential political thinkers of the twentieth century. Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 and used it to champion the rights of Black people across the globe. His message was powerful and transformative: he told Black people that they were not inferior, that Africa was their homeland and a source of pride, and that unity and self-reliance were the keys to freedom. His slogan 'One God, One Aim, One Destiny' became one of the most recognised political phrases of his era. Garvey's ideas influenced the civil rights movement, Caribbean independence movements, and the Rastafari faith. Though he was sometimes controversial and faced legal challenges in the United States, he is remembered in Jamaica and around the world as a prophet of Black consciousness and a fighter for justice."

When the passage says Garvey 'told Black people that they were not inferior,' what does this imply about the world Garvey lived in?`,
    options: [
      "Black people were universally respected",
      "Society told Black people they were inferior — Garvey's message was a direct challenge to this",
      "Garvey was arrogant",
      "Nobody had prejudice against Black people",
    ],
    correctAnswer: 1,
    explanation: `The need to say 'you are not inferior' implies that others were telling Black people the opposite — Garvey's message was a direct counter to racial prejudice of the era.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Connotation — Positive vs Negative",
    question: `The words 'determined' and 'stubborn' describe similar traits. What is the difference?`,
    options: [
      "They are exact synonyms",
      "'Determined' has a positive connotation (admirable persistence) while 'stubborn' has a negative one (unreasonable refusal)",
      "'Stubborn' is more positive",
      "They have completely different meanings",
    ],
    correctAnswer: 1,
    explanation: `Both describe someone who will not give up, but 'determined' implies admirable persistence while 'stubborn' implies inflexible, unreasonable behaviour.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Idiom",
    question: `'She burned the midnight oil to finish her assignment.' This means:`,
    options: [
      "She accidentally started a fire",
      "She worked very late into the night",
      "She wasted her time",
      "She cooked at midnight",
    ],
    correctAnswer: 1,
    explanation: `'Burn the midnight oil' means to work or study very late at night.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `'Justice is blind.' This metaphor means:`,
    options: [
      "The legal system cannot see",
      "Justice should be impartial and not influenced by who a person is",
      "Blind people are most fair",
      "The law is ineffective",
    ],
    correctAnswer: 1,
    explanation: `The metaphor suggests justice should apply equally to all people, without being influenced by personal characteristics — like a blind person who cannot see differences.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question: `His RELENTLESS determination meant he never gave up, no matter how many times he failed. 'Relentless' means:`,
    options: [
      "occasional and irregular",
      "weak and uncertain",
      "persistent and never stopping",
      "cheerful and positive",
    ],
    correctAnswer: 2,
    explanation: `'Relentless' means never stopping or weakening — persistent and unceasing.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Synonyms",
    question: `A SYNONYM for 'persuade' is:`,
    options: [
      "force",
      "convince",
      "command",
      "threaten",
    ],
    correctAnswer: 1,
    explanation: `'Convince' means to cause someone to believe something through reasoning or argument — a synonym for persuade.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Figurative Language — Metaphor",
    question: `Which sentence contains a METAPHOR?`,
    options: [
      "He ran like the wind",
      "The wind blew strongly",
      "He was a storm of energy and movement",
      "It was very windy outside",
    ],
    correctAnswer: 2,
    explanation: `'He was a storm of energy and movement' directly states he IS a storm — a metaphor, not a simile.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Meaning",
    question: `The word 'advocate' (verb) means:`,
    options: [
      "to oppose strongly",
      "to publicly support or recommend",
      "to ignore completely",
      "to investigate carefully",
    ],
    correctAnswer: 1,
    explanation: `To advocate means to publicly support or champion a cause or person.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Prefix over-",
    question: `The prefix 'over-' in 'overestimate' means:`,
    options: [
      "under",
      "again",
      "not",
      "too much",
    ],
    correctAnswer: 3,
    explanation: `'Over-' means too much or excessively. Overestimate = estimate too high.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The LEGACY of the great leader lived on long after his death. 'Legacy' means:`,
    options: [
      "a type of speech",
      "something handed down or remembered after a person dies",
      "a legal document",
      "a ceremony",
    ],
    correctAnswer: 1,
    explanation: `A legacy is what someone leaves behind after they die — their lasting impact, achievements, or influence.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Which pair shows a CAUSE and EFFECT relationship in vocabulary?`,
    options: [
      "rain / water",
      "smile / happiness",
      "doctor / hospital",
      "book / library",
    ],
    correctAnswer: 1,
    explanation: `'Smile' is often an effect of 'happiness' — there is a clear cause-and-effect relationship between the two.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Reported Speech — Complex",
    question: `Change to REPORTED SPEECH: 'I have never been to Kingston,' he said.`,
    options: [
      "He said that he had never been to Kingston",
      "He said that he has never been to Kingston",
      "He said I had never been to Kingston",
      "He told that he never been to Kingston",
    ],
    correctAnswer: 0,
    explanation: `In reported speech, present perfect (have been) shifts to past perfect (had been). 'He' replaces 'I.'`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Clauses — Relative",
    question: `Which sentence contains a DEFINING relative clause (essential to meaning)?`,
    options: [
      "My sister, who lives in Kingston, is a teacher.",
      "The book that I borrowed is on the table.",
      "The car, which was red, sped past.",
      "Marcus Garvey, who was born in St. Ann, changed history.",
    ],
    correctAnswer: 1,
    explanation: `A defining (restrictive) relative clause is essential — removing it changes the meaning. 'That I borrowed' identifies WHICH book, so it is defining.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Active/Passive Choice",
    question: `The passive voice is MOST appropriate in which situation?`,
    options: [
      "When describing your personal feelings",
      "When writing a formal science report where the process is more important than who did it",
      "When telling a personal story",
      "When writing an informal email",
    ],
    correctAnswer: 1,
    explanation: `In formal scientific writing, the passive voice ('The experiment was conducted') focuses on the process, not the person — the conventional style in science.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Tense Consistency",
    question: `Which sentence shows INCORRECT tense consistency?`,
    options: [
      "She walked in, sat down, and began to work.",
      "He is very talented and will succeed.",
      "She arrives at school, and then she had eaten breakfast.",
      "The match ended and the crowd cheered.",
    ],
    correctAnswer: 2,
    explanation: `'Arrives' (present) and 'had eaten' (past perfect) are inconsistent. The sentence mixes tenses incorrectly.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation — Hyphen",
    question: `A HYPHEN is used to:`,
    options: [
      "separate a subordinate clause",
      "show a pause or explanation",
      "join compound adjectives before a noun (e.g., well-known)",
      "indicate possession",
    ],
    correctAnswer: 2,
    explanation: `A hyphen joins compound adjectives placed before a noun: 'well-known leader,' 'five-year plan.'`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Modal Verbs",
    question: `Which modal verb expresses POSSIBILITY (something that might happen)?`,
    options: [
      "must",
      "should",
      "will",
      "might",
    ],
    correctAnswer: 3,
    explanation: `'Might' expresses possibility — something that could but is not certain to happen. 'Must' shows obligation; 'will' shows certainty.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which BEST combines: 'She was tired.' and 'She finished the race.'?`,
    options: [
      "She was tired and she finished the race",
      "Although she was tired, she finished the race",
      "She was tired finishing the race",
      "She finished the race, tired",
    ],
    correctAnswer: 1,
    explanation: `'Although' introduces a concessive clause, showing contrast between tiredness and completion — the most effective combination.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Direct and Indirect Object",
    question: `Identify the INDIRECT OBJECT in: 'She gave her teacher the letter.'`,
    options: [
      "gave",
      "her teacher",
      "the letter",
      "she",
    ],
    correctAnswer: 1,
    explanation: `The indirect object is the recipient of the action. 'Her teacher' receives the letter — indirect object.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Interrogative Pronouns",
    question: `Which word is an INTERROGATIVE PRONOUN?`,
    options: [
      "he",
      "whose",
      "mine",
      "herself",
    ],
    correctAnswer: 1,
    explanation: `Interrogative pronouns begin questions: who, whom, whose, what, which. 'Whose' asks about possession.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Concord — Inverted Sentences",
    question: `Choose the correct form: 'Rarely ___ she spoken about her past.'`,
    options: [
      "has",
      "have",
      "had",
      "is",
    ],
    correctAnswer: 0,
    explanation: `In inverted sentences (rarely + inverted subject-verb), use 'has' for third person singular — 'Rarely has she spoken.'`
  },
  {
    id: 36,
    type: "writing",
    skill: "Emotive Language",
    question: `A writer uses the phrase 'innocent children suffering needlessly' in a persuasive text. The purpose is to:`,
    options: [
      "Provide factual data",
      "Use emotive language to create an emotional response in the reader",
      "Summarise the main argument",
      "Give a counterargument",
    ],
    correctAnswer: 1,
    explanation: `Emotive language uses words that trigger emotional responses — 'innocent' and 'needlessly' are designed to create sympathy and outrage.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Structuring Arguments",
    question: `In a persuasive essay, the MOST EFFECTIVE argument should be placed:`,
    options: [
      "At the very beginning",
      "In the middle",
      "At the very end, to leave the strongest impression",
      "It does not matter where",
    ],
    correctAnswer: 2,
    explanation: `Writers typically save their strongest argument for last — a technique called climactic order, leaving the reader with the most compelling point.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Critical Response",
    question: `When asked to EVALUATE a writer's effectiveness, a student should:`,
    options: [
      "Simply say whether they liked the text",
      "Identify what the writer does, explain how it works, and judge whether it achieves its purpose",
      "Copy sentences from the text",
      "Write a summary only",
    ],
    correctAnswer: 1,
    explanation: `Evaluation means making a judgement about effectiveness — assessing WHAT the writer does, HOW it works, and WHETHER it succeeds.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Planning a Narrative",
    question: `Which element is MOST important to establish at the very start of a narrative?`,
    options: [
      "The resolution",
      "The setting and main character, to ground the reader",
      "The moral or theme",
      "The climax",
    ],
    correctAnswer: 1,
    explanation: `Establishing setting and character early grounds readers in the story world, giving them context before the plot develops.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision vs Proofreading",
    question: `What is the difference between REVISING and PROOFREADING?`,
    options: [
      "They are exactly the same thing",
      "Revising focuses on content, structure, and clarity; proofreading focuses on surface errors (spelling, grammar, punctuation)",
      "Revising finds spelling mistakes; proofreading improves ideas",
      "Proofreading is done first, revising comes after",
    ],
    correctAnswer: 1,
    explanation: `Revision is a higher-level process reviewing ideas, organisation, and clarity. Proofreading is a final check for surface-level errors.`
  }
]

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "inference, author's craft, theme, tone, text analysis, figurative language" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "connotation, idioms, word relationships, advanced figurative language" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "clauses, passive voice, reported speech, complex sentences, punctuation" },
  { type: "writing" as const,    label: "Writing Skills",           note: "persuasive devices, analytical writing, register, planning, technique" },
]

export default function G5LaMod4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5LaMod4Questions : g5LaMod4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 4",
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Moderate 4</CardTitle>
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
              <p className="text-slate-600">Language Arts Moderate 4</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Moderate 4</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
