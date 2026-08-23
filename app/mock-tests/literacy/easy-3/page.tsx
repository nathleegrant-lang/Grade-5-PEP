"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

const g5LaEasy3Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

What is the main idea of the passage?`,
    options: [
      "A Grade 5 class organised a recycling drive to help their school reduce waste",
      "The principal wanted students to stop using the library",
      "Students collected snack wrappers because they liked colourful packages",
      "Ms. Brown's class spent the whole week making art projects",
    ],
    correctAnswer: 0,
    explanation: `The whole passage focuses on the class planning and carrying out a recycling drive to reduce waste at school.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

Where did the students place the labelled bins?`,
    options: [
      "Beside the football field and office",
      "Near the canteen and library",
      "Near the classroom and canteen.",
      "Near the library and school office.",
    ],
    correctAnswer: 1,
    explanation: `The passage states that the labelled bins were placed near the canteen and library.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

What did the students do BEFORE making posters?`,
    options: [
      "They announced the final total",
      "They praised the principal",
      "They counted the waste thrown away in one week",
      "They moved the library shelves",
    ],
    correctAnswer: 2,
    explanation: `The word "First" shows that counting the waste happened before the students made posters.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

What can you infer about the students?`,
    options: [
      "They wanted to leave school early every day",
      "They disliked working with classmates",
      "They thought recycling was too difficult to try",
      "They cared about improving their school environment",
    ],
    correctAnswer: 3,
    explanation: `The students counted waste, taught others, and collected recyclables, so it is reasonable to infer that they cared about improving the school environment.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

Why did the students make posters?`,
    options: [
      "To explain which items could be reused or recycled",
      "To invite parents to a concert at school",
      "To cover the windows during lunch time",
      "To advertise a new library book sale",
    ],
    correctAnswer: 0,
    explanation: `The passage says the posters explained which items could be reused or recycled.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Fact vs Opinion",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

Which statement from the passage is a fact?`,
    options: [
      "Recycling is the most exciting school activity",
      "The school collected six large bags of recyclable materials",
      "Every student loves making posters",
      "The canteen is the best place for a recycling bin",
    ],
    correctAnswer: 1,
    explanation: `The amount collected can be checked or counted, so it is a fact rather than an opinion.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

In the passage, the word "labelled" most nearly means:`,
    options: [
      "hidden carefully",
      "painted blue",
      "marked with words or signs",
      "filled to the top",
    ],
    correctAnswer: 2,
    explanation: `The bins were labelled so students would know what to put in them, meaning they were marked with words or signs.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

"Ms. Brown's Grade 5 class wanted to reduce waste at Seaview Primary. First, the students counted how many plastic bottles, paper scraps, and snack wrappers were thrown away in one week. Next, they made posters explaining which items could be reused or recycled. They placed labelled bins near the canteen and library. On Friday, the class announced that the school had collected six large bags of recyclable materials. The principal praised the students for helping the school become cleaner and more responsible."

The author's main purpose is to:`,
    options: [
      "describe how to bake snacks for the canteen",
      "compare two schools in different towns",
      "tell a funny story about a messy classroom",
      "show how students helped their school by recycling",
    ],
    correctAnswer: 3,
    explanation: `The passage explains the steps students took to help their school through a recycling drive.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

What is the main idea of this passage?`,
    options: [
      "Students should never listen to weather reports",
      "Homes and schools can prepare carefully for hurricane season",
      "Hurricanes only happen when classrooms are untidy",
      "Nia wanted to miss school during stormy weather",
    ],
    correctAnswer: 1,
    explanation: `The passage is mainly about steps a class and family take to prepare safely for hurricane season.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

Which item did the teacher say families should keep in a safe place?`,
    options: [
      "A blanket",
      "A first-aid kit",
      "A raincoat",
      "A toolbox",
    ],
    correctAnswer: 1,
    explanation: `The teacher listed water, canned food, batteries, and a first-aid kit as supplies to keep in a safe place.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

Why did Nia feel ready when the storm watch was announced?`,
    options: [
      "She wanted the storm to arrive quickly",
      "She had never heard of a hurricane before",
      "Her family and school had made careful plans",
      "Her teacher cancelled all homework",
    ],
    correctAnswer: 2,
    explanation: `The passage directly says Nia felt ready because her family and school had made careful plans.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Summary",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

Which sentence best summarizes the passage?`,
    options: [
      "Nia's family prepared supplies after hearing a storm watch.",
      "Mr. Clarke's class learned mainly how to protect classroom windows.",
      "Students and families discussed different dangers caused by storms.",
      "Mr. Clarke's class and Nia's family prepared for hurricane season by making safety plans.",
    ],
    correctAnswer: 3,
    explanation: `The correct option best summarizes the whole passage because it includes both Mr. Clarke's class and Nia's family preparing safety plans for hurricane season, rather than focusing on only one detail.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

What happened AFTER the students checked the classroom windows?`,
    options: [
      "They helped make a list of emergency phone numbers",
      "They planted a new tree near the roof",
      "They threw away all the canned food",
      "They ignored the teacher's advice",
    ],
    correctAnswer: 0,
    explanation: `The passage says the students checked the windows and helped make a list of emergency phone numbers.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

What can you infer about Mr. Clarke?`,
    options: [
      "He thinks safety planning is important",
      "He wants students to be afraid of every cloud",
      "He dislikes teaching during June",
      "He believes emergency phone numbers are useless",
    ],
    correctAnswer: 0,
    explanation: `Mr. Clarke teaches students about supplies, windows, and emergency numbers, showing that he thinks safety planning is important.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

"In June, Mr. Clarke's class learned how to prepare for hurricane season. The teacher explained that families should keep water, canned food, batteries, and a first-aid kit in a safe place. Students checked the classroom windows and helped make a list of emergency phone numbers. At home, Nia reminded her family to trim branches near the roof and charge their flashlights. When a storm watch was announced, Nia felt nervous, but she also felt ready because her family and school had made careful plans."

Which theme best fits the passage?`,
    options: [
      "Being prepared can help people feel safer",
      "Storms are exciting games for children",
      "Classrooms should never discuss weather",
      "Families should wait until danger arrives to plan",
    ],
    correctAnswer: 0,
    explanation: `The passage shows that planning before hurricane season helped Nia feel safer and ready.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question: `Maya was reluctant to speak at assembly, so her teacher gently encouraged her until she felt ready. What does "reluctant" mean in this sentence?`,
    options: [
      "eager and excited",
      "already finished",
      "loud and rude",
      "unwilling or unsure",
    ],
    correctAnswer: 3,
    explanation: `Maya needed encouragement before speaking, so "reluctant" means she was unwilling or unsure at first.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Multiple-Meaning Words",
    question: `Which sentence uses "watch" to mean a warning that weather conditions may become dangerous?`,
    options: [
      "Dad bought a new watch with a blue strap",
      "The class will watch a video after lunch",
      "A hurricane watch was announced for the coast",
      "Please watch the baby while I get water",
    ],
    correctAnswer: 2,
    explanation: `In weather reports, a "watch" means conditions may become dangerous and people should stay alert.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The class had to reorganize the supply shelf after the cans fell. What does the prefix "re-" help you understand about "reorganize"?`,
    options: [
      "organize before school starts",
      "organize in the wrong way",
      "organize again",
      "organize without help",
    ],
    correctAnswer: 2,
    explanation: `The prefix "re-" means again, so "reorganize" means organize again.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The signs near the bins were useful because they told students where each item belonged. What does the suffix "-ful" mean in "useful"?`,
    options: [
      "without",
      "before",
      "again",
      "full of or having",
    ],
    correctAnswer: 3,
    explanation: `The suffix "-ful" means full of or having, so "useful" means having use or being helpful.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `After the recycling drive, the classroom sparkled like a clean window. What does the figurative phrase help the reader understand?`,
    options: [
      "The classroom looked very clean",
      "The classroom was made of glass",
      "The students washed every window",
      "The bins were impossible to see",
    ],
    correctAnswer: 0,
    explanation: `The comparison to a clean window helps readers picture a classroom that looked very clean.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Shades of Meaning",
    question: `Which word best completes the sentence?

The principal did not shout; she _____ reminded students to use the recycling bins.`,
    options: [
      "angrily",
      "wildly",
      "carelessly",
      "calmly",
    ],
    correctAnswer: 3,
    explanation: `"Calmly" fits because the sentence says the principal did not shout.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The emergency kit was stored in a sturdy box that did not bend or break when it was carried. What does "sturdy" mean?`,
    options: [
      "colourful",
      "empty",
      "strong",
      "tiny",
    ],
    correctAnswer: 2,
    explanation: `The clue "did not bend or break" shows that "sturdy" means strong.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Multiple-Meaning Words",
    question: `Which sentence uses "charge" to mean add power to a device?`,
    options: [
      "The shop will charge two dollars for the notebook",
      "The bull began to charge across the field",
      "The captain led a brave charge up the hill",
      "Remember to charge the flashlight before the storm",
    ],
    correctAnswer: 3,
    explanation: `In this sentence, "charge" means to add power to the flashlight's battery.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The students sorted the materials into separate bins: paper in one, plastic in another, and cans in a third. What does "sorted" mean here?`,
    options: [
      "mixed everything together",
      "placed items into groups",
      "carried items home",
      "counted only the cans",
    ],
    correctAnswer: 1,
    explanation: `The examples of paper, plastic, and cans in different bins show that "sorted" means placed items into groups.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `When the rain began, the sky grumbled above the school. What type of figurative language is used?`,
    options: [
      "simile",
      "metaphor",
      "personification",
      "rhyme",
    ],
    correctAnswer: 2,
    explanation: `The sky is given the human action of grumbling, so the sentence uses personification.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Capitalisation",
    question: `Choose the sentence with correct capitalisation.`,
    options: [
      "On Monday, Grade 5 visited Seaview Primary's recycling centre.",
      "on Monday, Grade 5 visited Seaview Primary's recycling centre.",
      "On monday, Grade 5 visited seaview primary's recycling centre.",
      "On Monday, grade 5 visited Seaview primary's Recycling Centre.",
    ],
    correctAnswer: 0,
    explanation: `The first word, the day Monday, and the proper name Seaview Primary are correctly capitalised.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Punctuation",
    question: `Choose the sentence with correct punctuation.`,
    options: [
      "Please bring water batteries and canned food.",
      "Please bring water, batteries, and canned food.",
      "Please bring, water batteries, and canned food",
      "Please bring water batteries, and canned food?",
    ],
    correctAnswer: 1,
    explanation: `Commas separate the items in the list, and the sentence ends with a period.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the pronoun that best completes the sentence.

Nia and I checked the flashlights before _____ packed them in the kit.`,
    options: [
      "us",
      "them",
      "we",
      "her",
    ],
    correctAnswer: 2,
    explanation: `"We" is the subject pronoun needed before the verb "packed."`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the correct verb tense.

Yesterday, the students _____ posters for the recycling drive.`,
    options: [
      "make",
      "makes",
      "will make",
      "made",
    ],
    correctAnswer: 3,
    explanation: `"Yesterday" shows past time, so the past-tense verb "made" is correct.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the sentence with correct subject-verb agreement.`,
    options: [
      "The boxes of bottles are beside the door.",
      "The boxes of bottles is beside the door.",
      "The box of bottles are beside the door.",
      "The students in the class helps after lunch.",
    ],
    correctAnswer: 0,
    explanation: `The subject "boxes" is plural, so it needs the plural verb "are."`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Apostrophes",
    question: `Choose the sentence that uses an apostrophe correctly.`,
    options: [
      "The students bins were full by Friday.",
      "The student's' bins were full by Friday.",
      "The students' bins were full by Friday.",
      "The students's bins were full by Friday.",
    ],
    correctAnswer: 2,
    explanation: `Because the bins belong to more than one student, the plural possessive form is "students'."`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which option is a complete sentence?`,
    options: [
      "After the storm warning on the radio.",
      "The emergency kit in the cupboard.",
      "Because the wind was strong outside.",
      "Our class reviewed the safety plan before lunch.",
    ],
    correctAnswer: 3,
    explanation: `This option has a subject, a verb, and a complete thought.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Word Choice",
    question: `Choose the clearest word to complete the sentence.

The teacher asked us to _____ the paper and plastic into different bins.`,
    options: [
      "separate",
      "scatter",
      "forget",
      "damage",
    ],
    correctAnswer: 0,
    explanation: `"Separate" clearly means to put the paper and plastic into different bins.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Punctuation",
    question: `Choose the sentence with the correct end punctuation.`,
    options: [
      "Where should we store the first-aid kit.",
      "Where should we store the first-aid kit?",
      "Where should we store the first-aid kit!",
      "Where should we store the first-aid kit,",
    ],
    correctAnswer: 1,
    explanation: `The sentence asks a question, so it should end with a question mark.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the sentence in which the pronoun clearly refers to Nia.`,
    options: [
      "Nia told Sara that she should charge the flashlight.",
      "After Nia checked the kit, she charged the flashlight.",
      "Nia and Sara found the kit when she opened it.",
      "When Sara helped Nia, she smiled at her.",
    ],
    correctAnswer: 1,
    explanation: `In this sentence, "she" clearly refers to Nia because Nia is the only named person in the sentence.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question: `Jaden wants classmates to join a clean-up day after the recycling drive. Which purpose best fits his flyer?`,
    options: [
      "To persuade students to help clean the school grounds",
      "To tell a make-believe story about a talking bottle",
      "To list every book in the school library",
      "To explain how hurricanes are named",
    ],
    correctAnswer: 0,
    explanation: `A flyer asking classmates to join a clean-up day is meant to persuade students to help.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Audience",
    question: `Leah is writing a note to Grade 5 families about hurricane supplies to keep at home. Which greeting best matches her audience?`,
    options: [
      "Dear Grade 5 students,",
      "Dear Grade 5 families,",
      "Attention Grade 5 teachers,",
      "Dear members of the school sports team,",
    ],
    correctAnswer: 1,
    explanation: `"Dear Grade 5 families" directly and appropriately addresses the specified audience: families of Grade 5 students.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports this topic sentence?

Our class recycling drive made the school cleaner.`,
    options: [
      "The music club practised three new songs",
      "Some students wore red shirts on Friday",
      "We collected bottles and paper that had been left near the canteen",
      "The library has many interesting storybooks",
    ],
    correctAnswer: 2,
    explanation: `Collecting bottles and paper near the canteen directly supports the idea that the recycling drive made the school cleaner.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Paragraph Organisation",
    question: `Which sentence would make the best closing sentence for a paragraph about hurricane preparation?`,
    options: [
      "Families should keep water and batteries in an emergency kit.",
      "That is why planning early can help families stay safe during a storm.",
      "Hurricane season usually requires several kinds of preparation.",
      "First, families should check that emergency supplies are ready.",
    ],
    correctAnswer: 1,
    explanation: `The correct option concludes the paragraph by drawing together its main idea about early planning and safety. The other choices function as a supporting detail, a general introductory statement, or a sequencing sentence.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Descriptive Writing",
    question: `Which sentence uses the best descriptive details for a story about a stormy afternoon at school?`,
    options: [
      "Grey clouds covered the school while students hurried inside.",
      "Heavy rain fell steadily across the wet schoolyard.",
      "Strong wind shook the trees beside the classroom block.",
      "Dark clouds rolled over the roof while rain tapped against the classroom windows.",
    ],
    correctAnswer: 3,
    explanation: `The correct option creates the strongest vivid image through specific details—dark clouds rolling over the roof and rain tapping against the classroom windows—rather than relying on sentence length.`
  }
]


const shuffleAnswerOptions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const optionsWithOriginalIndex = question.options.map((option, index) => ({ option, index }))

    for (let i = optionsWithOriginalIndex.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [optionsWithOriginalIndex[j], optionsWithOriginalIndex[i]]
    }

    const correctAnswer = optionsWithOriginalIndex.findIndex((item) => item.index === question.correctAnswer)

    return {
      ...question,
      options: optionsWithOriginalIndex.map((item) => item.option),
      correctAnswer,
    }
  })
}

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",  note: "main idea, inference, author's purpose, tone, text structure" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study", note: "context clues, synonyms, antonyms, figurative language, word meaning" },
  { type: "grammar" as const,    label: "Grammar & Language Use",  note: "parts of speech, sentence structure, punctuation, tense, agreement" },
  { type: "writing" as const,    label: "Writing Skills",          note: "paragraph structure, purpose, audience, techniques, planning" },
]

export default function G5LaEasy3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]             = useState(false)
  const [showResults, setShowResults]     = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]             = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]           = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaEasy3Questions : g5LaEasy3Questions.slice(0, FREE_QUESTION_LIMIT)
  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

  useEffect(() => {
    setCurrentQuestion((prev) => Math.min(prev, Math.max(totalQuestions - 1, 0)))
  }, [totalQuestions])

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

  const calcScore  = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct   = () => Math.round((calcScore() / totalQuestions) * 100)

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    const completedAtIso = new Date().toISOString()
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Easy 3",
      difficulty: "Easy",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: completedAtIso,
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

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

  const startTest = () => {
    const shuffledQuestions = shuffleAnswerOptions(sourceQuestions)
    setRandomizedQuestions(shuffledQuestions)
    setAnswers(new Array(shuffledQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    hasSavedResult.current = false
    setStarted(true)
  }

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null)); setTimeLeft(60 * 60); hasSavedResult.current = false
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-xl border-amber-200">
            <CardHeader className="bg-amber-50"><CardTitle className="text-amber-800">Preview Complete</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">You completed the free preview for this test. Upgrade to Premium to unlock all 40 questions.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                <Link href="/mock-tests/language-arts"><Button variant="outline">Back to Language Arts Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Easy 3</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Easy Level</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
              <p className="text-slate-700">This Grade 5 Language Arts test covers reading comprehension, vocabulary in context, grammar and language use, and writing skills — all aligned to the NSC curriculum.</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4">
              <h3 className="mb-2 font-semibold text-sky-800">21st-Century Skills</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Critical Thinking: analysing texts and evaluating language choices</li>
                <li>Communication: understanding how language works in context</li>
                <li>Creativity: recognising and applying effective writing techniques</li>
                <li>Collaboration: understanding how writers address their audience</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-blue-600">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={startTest} className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700">Start Test</Button>
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
              <p className="text-slate-600">Language Arts Easy 3</p>
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
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">You completed the free preview.</p>
                  <p className="text-sm text-amber-700">Upgrade to unlock all 40 questions.</p>
                  <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link>
                </div>
              )}
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
                <p className="text-slate-700">Review each explanation to understand why the correct answer is right. Focus on the sections where your score was lowest — re-reading passages carefully and practising grammar rules will help improve your performance.</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Easy 3</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p>
              <p className="text-sm text-amber-700">Upgrade to Premium to access the full test.</p>
            </div>
          )}
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
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => Math.max(p - 1, 0))} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => Math.min(p + 1, totalQuestions - 1))} className="bg-blue-600 hover:bg-blue-700">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-blue-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-blue-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(Math.min(Math.max(idx, 0), totalQuestions - 1))}
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
