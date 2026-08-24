"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
import { prepareAssessment, preparePreview } from "@/lib/assessment-engine"
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

const P1 = `At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.`

const g5LaMix5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

What is the passage mainly about?`,
    options: [
      "How students used investigation and teamwork to improve a neglected stream",
      "Why the hardware store opened near Cedar Grove",
      "How to catch fish in a shallow river",
      "Why all environmental problems can be solved in one day"
    ],
    correctAnswer: 0,
    explanation: `The passage explains how students studied the causes of the stream’s problems and worked with the community to improve it.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

What did the students do before beginning the cleanup?`,
    options: [
      "They planted trees beside the school.",
      "They interviewed residents, studied photographs, and recorded observations.",
      "They closed the road near the bridge.",
      "They asked people to stop using the river."
    ],
    correctAnswer: 1,
    explanation: `The class first gathered information through interviews, photographs, and observations.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Why was loose soil being washed into the stream?`,
    options: [
      "The river contained too many fish.",
      "The hardware store donated tools.",
      "Bare hillside patches allowed rain to carry the soil away.",
      "Students measured the water every Friday."
    ],
    correctAnswer: 2,
    explanation: `The passage directly links the bare hillside to soil washing into the stream during rain.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Why did the class present its plan to several community groups?`,
    options: [
      "They wanted to avoid doing any work themselves.",
      "They needed permission to rename the river.",
      "They planned to turn the stream into a playground.",
      "They understood that different groups could provide different kinds of help."
    ],
    correctAnswer: 3,
    explanation: `Each group contributed something useful, such as tools, seedlings, or waste removal.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Sequence",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which event happened first?`,
    options: [
      "The students investigated the stream and its problems.",
      "Volunteers planted the bare slope.",
      "The parish council removed garbage bags.",
      "The class checked the river every Friday."
    ],
    correctAnswer: 0,
    explanation: `The investigation came before the plan, cleanup, planting, and follow-up checks.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

In the passage, the word “stable” most nearly means`,
    options: [
      "covered with flowers",
      "less likely to move or wash away",
      "hidden from the road",
      "completely dry"
    ],
    correctAnswer: 1,
    explanation: `The planted slope remained more secure and was less likely to erode after rain.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Author’s Purpose",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Why does the author mention that the water did not become clear immediately?`,
    options: [
      "To prove that the project failed",
      "To show that the students chose the wrong stream",
      "To emphasize that environmental repair requires patience and continued effort",
      "To explain why the class stopped collecting data"
    ],
    correctAnswer: 2,
    explanation: `The detail supports the lesson that restoration takes time and repeated effort.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

What can the reader conclude about Ms. Daley?`,
    options: [
      "She cared only about finishing the science textbook.",
      "She expected residents to complete the entire project.",
      "She believed photographs were more useful than action.",
      "She guided students to investigate carefully and persist when results were slow."
    ],
    correctAnswer: 3,
    explanation: `Her actions show that she valued evidence, planning, and perseverance.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evidence",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which detail best shows that the project produced measurable improvement?`,
    options: [
      "Less rubbish collected near the bridge, and the planted slope stayed more stable after rain.",
      "The students gave the project a name.",
      "Older residents remembered seeing fish.",
      "The class studied human activity."
    ],
    correctAnswer: 0,
    explanation: `This detail reports observable changes after the project.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

How did people’s view of the stream change?`,
    options: [
      "They first valued it and later ignored it.",
      "They began to see it as a shared responsibility instead of a forgotten space.",
      "They decided it belonged only to the school.",
      "They stopped believing that it could overflow."
    ],
    correctAnswer: 1,
    explanation: `The passage contrasts an ignored space with a place the community felt responsible for protecting.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which theme is best supported by the passage?`,
    options: [
      "Young people should avoid difficult community problems.",
      "Natural places repair themselves without assistance.",
      "Careful study and cooperation can lead to meaningful change.",
      "Only government agencies can protect the environment."
    ],
    correctAnswer: 2,
    explanation: `The students combined investigation, cooperation, and persistence to create improvement.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Text Structure",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which text structure is used most strongly in the passage?`,
    options: [
      "A list of unrelated facts",
      "A comparison of two schools",
      "Instructions for building a bridge",
      "A problem-and-solution account presented mainly in time order"
    ],
    correctAnswer: 3,
    explanation: `The author describes the stream’s problems, the steps taken, and the resulting changes in sequence.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Character Motivation",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Why did the students continue checking the river for six weeks?`,
    options: [
      "They wanted to track progress and see whether the improvements lasted.",
      "They were searching for a missing tool.",
      "They planned to cancel the cleanup.",
      "They wanted to avoid their regular lessons."
    ],
    correctAnswer: 0,
    explanation: `Repeated measurements and photographs allowed them to monitor change over time.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Fact and Opinion",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which statement from the passage is a fact that could be checked?`,
    options: [
      "Mango River was the most beautiful stream in Jamaica.",
      "Teams measured the water level every Friday for six weeks.",
      "The students created the perfect environmental project.",
      "Every resident felt proud of the signs."
    ],
    correctAnswer: 1,
    explanation: `The schedule and duration of the measurements are specific details that can be verified.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Summary",
    question: `Read the passage then answer the question.

At the edge of Cedar Grove stood a narrow stream called Mango River. Older residents remembered when its water ran clear enough to reveal tiny fish beneath the stones. Over time, however, plastic bottles, food containers, and soil washed from nearby slopes collected in the stream. After heavy rain, the water sometimes overflowed onto the road.

When Grade 5 students at Cedar Grove Primary began studying how human activity affects the environment, their teacher, Ms. Daley, suggested that they investigate the stream. The class did not begin by rushing outside with garbage bags. First, they interviewed residents, examined old photographs, and recorded what they observed at three different points along the river. They discovered that litter was only part of the problem. Bare patches on the hillside allowed rain to carry loose soil into the water, while a blocked drain caused water to back up near the road.

The students called their project the Mango River Guardians. They prepared a simple plan and presented it to the school principal, the citizens’ association, and a nearby hardware store. The store donated gloves and tools, residents provided seedlings, and the parish council arranged to remove the filled garbage bags. On cleanup day, volunteers separated recyclable materials from other waste. Another group planted grass and small trees on the bare slope to help hold the soil in place.

The work was not completed in one day. Every Friday for six weeks, teams measured the water level, photographed the riverbank, and checked whether new litter had appeared. They also made signs reminding people that drains and streams are not dumping grounds. At first, a few students felt disappointed because the water did not become clear immediately. Ms. Daley explained that restoring a damaged environment takes patience and repeated effort.

By the end of the term, less rubbish was collecting near the bridge, and the newly planted slope remained more stable after rain. The students could not solve every problem affecting Mango River, but their records showed noticeable improvement. More importantly, the project changed how many people viewed the stream. It was no longer treated as an ignored space behind the community. It became a shared responsibility.

The Mango River Guardians learned that useful action begins with careful observation. They also learned that lasting change is stronger when people combine knowledge, resources, and persistence. Their project started with a school lesson, but it grew into a community promise to protect a place that belonged to everyone.

Which sentence is the best summary of the passage?`,
    options: [
      "A class collected rubbish from a stream during one afternoon.",
      "Residents remembered that fish once lived in Mango River.",
      "Students investigated a damaged stream, organized community support, monitored their work, and helped create lasting responsibility for it.",
      "A hardware store gave gloves to a school."
    ],
    correctAnswer: 2,
    explanation: `This choice includes the investigation, action, monitoring, and broader community impact.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is closest in meaning to “persistent”?`,
    options: [
      "careless",
      "silent",
      "temporary",
      "determined"
    ],
    correctAnswer: 3,
    explanation: `Persistent means continuing firmly despite difficulty or delay.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is the opposite of “scarce”?`,
    options: [
      "abundant",
      "hidden",
      "costly",
      "fragile"
    ],
    correctAnswer: 0,
    explanation: `Scarce means limited or hard to find; abundant means plentiful.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `The path was so **narrow** that the hikers had to walk in a single line. What does “narrow” mean in this sentence?`,
    options: [
      "covered with stones",
      "not wide",
      "very steep",
      "poorly marked"
    ],
    correctAnswer: 1,
    explanation: `The need to walk in a single line shows that the path was not wide.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Prefixes",
    question: `What does the prefix “re-” mean in the word “rebuild”?`,
    options: [
      "before",
      "without",
      "again",
      "under"
    ],
    correctAnswer: 2,
    explanation: `The prefix re- commonly means again, so rebuild means build again.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Figurative Language",
    question: `What does the sentence “The classroom was a beehive of activity” mean?`,
    options: [
      "Bees entered the classroom.",
      "The room was completely empty.",
      "Students were afraid of being stung.",
      "Many people were busy and active."
    ],
    correctAnswer: 3,
    explanation: `A beehive is used metaphorically to describe a place filled with busy activity.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple-Meaning Words",
    question: `In which sentence does “current” mean a flow of water?`,
    options: [
      "The swimmer felt the strong current pulling toward the rocks.",
      "Please read the current issue of the magazine.",
      "The current principal greeted the visitors.",
      "We discussed current events in class."
    ],
    correctAnswer: 0,
    explanation: `In the first sentence, current refers to moving water.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Suffixes",
    question: `Which word means “a person who studies science”?`,
    options: [
      "scientific",
      "scientist",
      "scientifically",
      "science"
    ],
    correctAnswer: 1,
    explanation: `The suffix -ist can identify a person who practices or studies a field.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Idioms",
    question: `What does the idiom “lend a hand” mean?`,
    options: [
      "borrow something",
      "wave to someone",
      "give help",
      "write a note"
    ],
    correctAnswer: 2,
    explanation: `To lend a hand means to assist someone.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the most positive connotation for describing someone who saves money carefully?`,
    options: [
      "stingy",
      "miserly",
      "cheap",
      "thrifty"
    ],
    correctAnswer: 3,
    explanation: `Thrifty suggests wise and careful use of money, while the others sound more negative.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Bird is to nest as bee is to`,
    options: [
      "hive",
      "web",
      "den",
      "pond"
    ],
    correctAnswer: 0,
    explanation: `A bird lives in a nest, and a bee lives in a hive.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence has correct subject-verb agreement?`,
    options: [
      "The basket of mangoes were on the table.",
      "The basket of mangoes is on the table.",
      "The baskets of mangoes is on the table.",
      "The basket of mangoes are on the table."
    ],
    correctAnswer: 1,
    explanation: `The subject basket is singular, so it takes the singular verb is.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Pronoun Agreement",
    question: `Choose the sentence with correct pronoun agreement.`,
    options: [
      "Every student packed their books, and he left.",
      "The girls completed her project.",
      "Maria and Jada presented their poster.",
      "Neither boy remembered our lunch."
    ],
    correctAnswer: 2,
    explanation: `The plural subject Maria and Jada correctly agrees with the plural pronoun their.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After lunch we, visited the library.",
      "After lunch we visited, the library.",
      "After lunch; we visited the library.",
      "After lunch, we visited the library."
    ],
    correctAnswer: 3,
    explanation: `An introductory phrase is followed by a comma.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence is written in the past tense?`,
    options: [
      "The team completed the experiment yesterday.",
      "The team completes the experiment today.",
      "The team will complete the experiment tomorrow.",
      "The team is completing the experiment now."
    ],
    correctAnswer: 0,
    explanation: `Completed is the simple past-tense verb.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Adjectives and Adverbs",
    question: `Which sentence uses the adverb correctly?`,
    options: [
      "The careful driver stopped sudden.",
      "The careful driver stopped suddenly.",
      "The carefully driver stopped sudden.",
      "The driver sudden stopped careful."
    ],
    correctAnswer: 1,
    explanation: `Suddenly correctly describes how the driver stopped.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Sentence Types",
    question: `Which sentence is a compound sentence?`,
    options: [
      "Because the rain fell heavily.",
      "The children waiting beside the gate.",
      "The rain stopped, and the players returned to the field.",
      "Running quickly toward the shelter."
    ],
    correctAnswer: 2,
    explanation: `It joins two complete independent clauses with the coordinating conjunction and.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Capitalization",
    question: `Which sentence uses capital letters correctly?`,
    options: [
      "My aunt visited kingston in july.",
      "My Aunt visited Kingston in July.",
      "My aunt visited Kingston in july.",
      "My aunt visited Kingston in July."
    ],
    correctAnswer: 3,
    explanation: `The proper noun Kingston and the month July are capitalized; aunt is not capitalized here.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Possessive Nouns",
    question: `Which sentence correctly shows that one teacher owns the desk?`,
    options: [
      "The teacher’s desk is near the window.",
      "The teachers desk is near the window.",
      "The teachers’ desk is near the window.",
      "The teacher desk’s is near the window."
    ],
    correctAnswer: 0,
    explanation: `Teacher’s is the singular possessive form.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Conjunctions",
    question: `Choose the best conjunction: “We carried umbrellas ___ the sky looked clear.”`,
    options: [
      "because",
      "although",
      "unless",
      "so"
    ],
    correctAnswer: 1,
    explanation: `Although shows the contrast between carrying umbrellas and the clear sky.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Complete Sentences",
    question: `Which group of words is a complete sentence?`,
    options: [
      "While the choir practised.",
      "Across the busy courtyard.",
      "The audience applauded after the final song.",
      "Running toward the school bus."
    ],
    correctAnswer: 2,
    explanation: `It contains a complete subject and predicate and expresses a full thought.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which is the strongest topic sentence for a paragraph about school gardens?`,
    options: [
      "School gardens can give pupils practical experience caring for plants during the school year.",
      "Growing vegetables at school can help pupils connect classroom lessons with real activities.",
      "A school garden can provide useful produce while giving students a shared project to maintain.",
      "A well-planned school garden can provide food, practical lessons, and opportunities for teamwork."
    ],
    correctAnswer: 3,
    explanation: "The keyed topic sentence previews the full range of the paragraph: food, practical learning, and teamwork."
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports the statement “Regular reading strengthens vocabulary”?`,
    options: [
      "Readers repeatedly meet unfamiliar words in meaningful sentences and learn how those words are used.",
      "Readers can use illustrations and surrounding sentences to follow difficult parts of a story.",
      "Reading many types of texts can expose students to different topics, characters, and writing styles.",
      "Regular reading can help students become more comfortable reading longer and more complex texts."
    ],
    correctAnswer: 0,
    explanation: "The keyed detail directly explains vocabulary growth through repeated encounters with unfamiliar words in meaningful contexts."
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Choose the best transition: “The first experiment failed. ___, the team studied the results and tried a better method.”`,
    options: [
      "For example",
      "However",
      "Meanwhile",
      "Similarly"
    ],
    correctAnswer: 1,
    explanation: `However signals the contrast between failure and the decision to continue.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Organization",
    question: `Which sentence does NOT belong in a paragraph about preparing for a hurricane?

(1) Families should store clean water and non-perishable food. (2) Flashlights and batteries should be checked. (3) Some community centres are officially used as emergency shelters during hurricanes. (4) Important documents should be kept in a waterproof container.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 3",
      "Sentence 4"
    ],
    correctAnswer: 2,
    explanation: "Emergency shelters are related to hurricane safety, but the paragraph is specifically organised around steps families should take at home to prepare their own supplies, equipment, and documents."
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which is the strongest conclusion for an essay about protecting community spaces?`,
    options: [
      "Shared parks, playgrounds, and other public spaces can improve daily life when residents help keep them clean and usable.",
      "Community spaces are more likely to remain welcoming when people respect the facilities and cooperate in caring for them.",
      "Caring for shared spaces gives residents a practical way to improve the environment in which they live.",
      "When residents care for shared spaces together, they create safer, healthier places and strengthen pride in their community."
    ],
    correctAnswer: 3,
    explanation: "The keyed conclusion best synthesises cooperation, safety, health, and community pride."
  }
];

const SECTION_CONFIG = [
  { type: "reading" as const,    label: "Reading Comprehension",   note: "literal, inferential, and analytical reading across all difficulty levels" },
  { type: "vocabulary" as const, label: "Vocabulary & Word Study",  note: "word meaning, figurative language, connotation, idioms, etymology" },
  { type: "grammar" as const,    label: "Grammar & Language Use",   note: "from basic parts of speech to complex clauses and transformations" },
  { type: "writing" as const,    label: "Writing Skills",           note: "purpose, audience, technique, structure, and analytical writing" },
]

export default function G5LaMix5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const sourceQuestions = isPremium ? g5LaMix5Questions : g5LaMix5Questions.slice(0, FREE_QUESTION_LIMIT)
  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
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

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return

    hasSavedResult.current = true
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Mixed 5",
      difficulty: "Mixed",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: new Date().toISOString(),
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

  const startTest = () => {
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaMix5Questions)
      : preparePreview(g5LaMix5Questions, FREE_QUESTION_LIMIT)
    setRandomizedQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    hasSavedResult.current = false
    setStarted(true)
  }

  const handleSubmit = () => {
    setShowResults(true)
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
    setStarted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null))
    setTimeLeft(60 * 60)
    hasSavedResult.current = false
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
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 5</CardTitle>
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
              <p className="text-slate-700">This mixed-level test uses Miss Lou and Jamaican language as its central theme while assessing comprehension, vocabulary, grammar, and writing across a balanced range of Grade 5 skills.</p>
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
              <p className="text-slate-600">Language Arts Mixed 5</p>
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
            <div><h1 className="text-lg font-bold">Language Arts Mixed 5</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
