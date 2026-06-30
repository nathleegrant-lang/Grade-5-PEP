"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveStudentTestResult } from "@/lib/student-test-results";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
  BookOpen,
  RotateCcw,
  Home,
  Lock,
  Crown,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const FREE_QUESTION_LIMIT = 5;

interface Question {
  id: number;
  type: "reading" | "vocabulary" | "grammar" | "writing";
  skill: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const difficult1Passage = `Read the passage then answer the question.

"Maya and Denzel started a youth entrepreneurship club after noticing that many classmates bought imported snacks after school. Instead of copying another business, they investigated what pupils wanted and discovered a significant demand for affordable fruit cups made with local mangoes, pineapples, and melon. Their teacher asked them to justify every decision with reliable evidence, so they compared prices at the market, surveyed students, and calculated how many reusable containers were essential. When the first batch sold slowly, Maya interpreted the feedback: the cups were too large for younger children. The team created a smaller option, emphasised cleanliness, and used profits to buy a cooler. By the end of the month, the club had earned enough to contribute seedlings to the school garden and had learned that innovative ideas still need careful records, honest discussion, and respect for customers."`;

const difficult1SecondPassage = `Read the passage then answer the question.

"At Harbour View Primary, the service club planned to restore a neglected reading corner at the clinic. Some volunteers wanted to paint bright murals immediately, while others argued that patients first needed comfortable chairs and labelled books. To understand the community's perspective, the pupils interviewed nurses, parents, and children waiting for appointments. A leaking window forced them to adjust the schedule, but it also illustrated why planning matters. The group repaired shelves, sorted donated books by age level, and wrote polite signs asking readers to return materials. During the opening, a nurse said children were calmer when they had stories to read. The pupils concluded that service is not simply doing what feels exciting; it is listening carefully, choosing sustainable solutions, and measuring whether the work truly helps."`;

const g5LaDifficult1Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Inference",
    question: `${difficult1Passage}\n\nWhat can be inferred about the main student leader?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${difficult1Passage}\n\nWhich detail gives the strongest evidence of careful planning?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 3,
    type: "reading",
    skill: "Cause and Effect",
    question: `${difficult1Passage}\n\nWhat caused the team to change its first plan?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 4,
    type: "reading",
    skill: "Main Idea",
    question: `${difficult1Passage}\n\nWhat is the main idea of the passage?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 5,
    type: "reading",
    skill: "Text Evidence",
    question: `${difficult1Passage}\n\nWhich detail best supports the idea that evidence guided decisions?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 6,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${difficult1Passage}\n\nWhich conclusion is best supported by the passage?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 7,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${difficult1Passage}\n\nIn the passage, what does “significant” most nearly mean?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 8,
    type: "reading",
    skill: "Prediction",
    question: `${difficult1Passage}\n\nWhat will most likely happen if the group repeats the project?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to youth entrepreneurship.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the youth entrepreneurship passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 9,
    type: "reading",
    skill: "Theme",
    question: `${difficult1SecondPassage}\n\nWhich theme is best developed in the second passage?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 10,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${difficult1SecondPassage}\n\nHow are the two main groups in the passage alike?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 11,
    type: "reading",
    skill: "Author's Purpose",
    question: `${difficult1SecondPassage}\n\nWhy does the author include the unexpected problem?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `${difficult1SecondPassage}\n\nWhat can be inferred about the volunteers?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 13,
    type: "reading",
    skill: "Supporting Details",
    question: `${difficult1SecondPassage}\n\nWhich detail best shows that the project benefited the community?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 14,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${difficult1SecondPassage}\n\nWhat conclusion can readers draw about teamwork?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 15,
    type: "reading",
    skill: "Inference",
    question: `${difficult1SecondPassage}\n\nWhat does the final paragraph suggest about future action?`,
    options: [
      "It shows students must analyse evidence, justify choices, and contribute responsibly to community service project.",
      "It shows that adults should make every decision without listening to students.",
      "It suggests that careful records and community feedback are unnecessary.",
      "It mainly proves that the project succeeded because no challenges appeared."
    ],
    correctAnswer: 0,
    explanation: "The correct answer fits specific details in the community service project passage and requires using evidence rather than choosing a simple fact."
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “interpret” as used in the passages?",
    options: [
      "explain the meaning of information",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “interpret” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “justify” as used in the passages?",
    options: [
      "give good reasons or evidence",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “justify” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “illustrate” as used in the passages?",
    options: [
      "show or explain with an example",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “illustrate” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “emphasise” as used in the passages?",
    options: [
      "give special importance to an idea",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “emphasise” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “perspective” as used in the passages?",
    options: [
      "a way of thinking about something",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “perspective” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “essential” as used in the passages?",
    options: [
      "absolutely necessary",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “essential” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “contribute” as used in the passages?",
    options: [
      "give help, ideas, or effort",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “contribute” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “investigate” as used in the passages?",
    options: [
      "study carefully to find facts",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “investigate” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “reliable” as used in the passages?",
    options: [
      "able to be trusted",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “reliable” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the word “innovative” as used in the passages?",
    options: [
      "new and useful in approach",
      "guess quickly without support",
      "repeat words without understanding",
      "avoid making a decision"
    ],
    correctAnswer: 0,
    explanation: "In context, “innovative” is used as academic vocabulary connected to careful thinking and effective action."
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The committee reviews the evidence before it decides.",
      "The committee review the evidence before it decides.",
      "The committee reviewing the evidence before it decides.",
      "The committee were reviews the evidence before it decides."
    ],
    correctAnswer: 0,
    explanation: "The singular collective noun committee takes the verb reviews here."
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "Yesterday, the pupils collected data and presented their findings.",
      "Yesterday, the pupils collect data and presented their findings.",
      "Yesterday, the pupils will collect data and presented their findings.",
      "Yesterday, the pupils collected data and present their findings."
    ],
    correctAnswer: 0,
    explanation: "Both verbs correctly show completed past actions."
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "The mentor asked Jada and me to revise the report.",
      "The mentor asked Jada and I to revise the report.",
      "The mentor asked she and me to revise the report.",
      "The mentor asked I and Jada to revise the report."
    ],
    correctAnswer: 0,
    explanation: "Me is the correct object pronoun after asked."
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "After the survey ended, the class compared the results.",
      "After the survey ended the class, compared the results.",
      "After, the survey ended the class compared the results.",
      "After the survey, ended the class compared the results."
    ],
    correctAnswer: 0,
    explanation: "A comma follows the introductory clause."
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "“We need stronger evidence,” the captain said.",
      "“We need stronger evidence, the captain said.",
      "We need stronger evidence,” the captain said.",
      "“We need stronger evidence” the captain said?"
    ],
    correctAnswer: 0,
    explanation: "The spoken words are inside quotation marks, with comma placement correct."
  },
  {
    id: 31,
    type: "grammar",
    skill: "Editing",
    question: "Which sentence is clearest and most precise?",
    options: [
      "The students revised the plan after reviewing reliable feedback.",
      "The students did stuff after looking at some things.",
      "The plan was good because it was nice.",
      "Feedback happened and then things changed."
    ],
    correctAnswer: 0,
    explanation: "Precise verbs and nouns make the sentence clearer."
  },
  {
    id: 32,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "The team planned the route, gathered supplies, and recorded results.",
      "The team planned the route, gathering supplies, and results were recorded.",
      "The team was planning the route, supplies, and recorded results.",
      "The team planned, to gather supplies, and results."
    ],
    correctAnswer: 0,
    explanation: "The three verb phrases have the same grammatical form."
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the sentences?",
    options: [
      "The prototype failed at first, but the group improved it with new evidence.",
      "The prototype failed at first the group improved it with new evidence.",
      "Failing at first but improved with new evidence.",
      "The prototype failed at first, the evidence."
    ],
    correctAnswer: 0,
    explanation: "But correctly joins two related complete ideas."
  },
  {
    id: 34,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The report was detailed, so the judges understood the recommendation.",
      "The report was detailed the judges understood the recommendation.",
      "The report was detailed, the judges understood the recommendation.",
      "The report detailed and judges understood."
    ],
    correctAnswer: 0,
    explanation: "The comma and so correctly connect cause and result."
  },
  {
    id: 35,
    type: "grammar",
    skill: "Transitions",
    question: "Which transition best shows contrast?",
    options: [
      "However",
      "Therefore",
      "For example",
      "Next"
    ],
    correctAnswer: 0,
    explanation: "However signals a contrast between ideas."
  },
  {
    id: 36,
    type: "writing",
    skill: "Best Introduction",
    question: "Which introduction would best prepare readers for an essay about the project?",
    options: [
      "The project mattered because students used reliable evidence to solve a real problem and explain their decisions to an audience.",
      "This thing was nice and many people were there doing stuff.",
      "I like projects because projects can be project-like at times.",
      "There are many colours in the world, and some pencils are blue."
    ],
    correctAnswer: 0,
    explanation: "The best writing choice is specific, purposeful, and connected to evidence from the task."
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Evidence",
    question: "Which sentence provides the strongest supporting evidence?",
    options: [
      "The project mattered because students used reliable evidence to solve a real problem and explain their decisions to an audience.",
      "This thing was nice and many people were there doing stuff.",
      "I like projects because projects can be project-like at times.",
      "There are many colours in the world, and some pencils are blue."
    ],
    correctAnswer: 0,
    explanation: "The best writing choice is specific, purposeful, and connected to evidence from the task."
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Revision",
    question: "Which revision makes the writing more precise and convincing?",
    options: [
      "The project mattered because students used reliable evidence to solve a real problem and explain their decisions to an audience.",
      "This thing was nice and many people were there doing stuff.",
      "I like projects because projects can be project-like at times.",
      "There are many colours in the world, and some pencils are blue."
    ],
    correctAnswer: 0,
    explanation: "The best writing choice is specific, purposeful, and connected to evidence from the task."
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question: "Which sentence should be removed to keep a report focused?",
    options: [
      "The project mattered because students used reliable evidence to solve a real problem and explain their decisions to an audience.",
      "This thing was nice and many people were there doing stuff.",
      "I like projects because projects can be project-like at times.",
      "There are many colours in the world, and some pencils are blue."
    ],
    correctAnswer: 0,
    explanation: "The best writing choice is specific, purposeful, and connected to evidence from the task."
  },
  {
    id: 40,
    type: "writing",
    skill: "Conclusion",
    question: "Which conclusion best evaluates the importance of the project?",
    options: [
      "The project mattered because students used reliable evidence to solve a real problem and explain their decisions to an audience.",
      "This thing was nice and many people were there doing stuff.",
      "I like projects because projects can be project-like at times.",
      "There are many colours in the world, and some pencils are blue."
    ],
    correctAnswer: 0,
    explanation: "The best writing choice is specific, purposeful, and connected to evidence from the task."
  }
];

const shuffleAnswerOptions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const optionsWithOriginalIndex = question.options.map((option, index) => ({
      option,
      index,
    }));

    for (let i = optionsWithOriginalIndex.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [
        optionsWithOriginalIndex[j],
        optionsWithOriginalIndex[i],
      ];
    }

    const correctAnswer = optionsWithOriginalIndex.findIndex(
      (item) => item.index === question.correctAnswer,
    );

    return {
      ...question,
      options: optionsWithOriginalIndex.map((item) => item.option),
      correctAnswer,
    };
  });
};

const SECTION_CONFIG = [
  {
    type: "reading" as const,
    label: "Reading Comprehension",
    note: "main idea, details, inference, purpose, point of view, evidence",
  },
  {
    type: "vocabulary" as const,
    label: "Vocabulary & Word Study",
    note: "meaning in context, synonyms, antonyms, connotation, precise word choice",
  },
  {
    type: "grammar" as const,
    label: "Grammar & Language Use",
    note: "agreement, tense, punctuation, pronouns, sentence structure, transitions",
  },
  {
    type: "writing" as const,
    label: "Writing Skills",
    note: "topic sentences, support, organization, transitions, revision",
  },
];

export default function G5LaDifficult1MockTest() {
  const { isPremium, user } = useAuth();
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>(
    [],
  );
  const hasSavedResult = useRef(false);

  const sourceQuestions = isPremium
    ? g5LaDifficult1Questions
    : g5LaDifficult1Questions.slice(0, FREE_QUESTION_LIMIT);
  const availableQuestions =
    randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions;
  const totalQuestions = availableQuestions.length;

  useEffect(() => {
    if (answers.length !== totalQuestions)
      setAnswers(new Array(totalQuestions).fill(null));
  }, [totalQuestions, answers.length]);

  useEffect(() => {
    setCurrentQuestion((prev) =>
      Math.min(prev, Math.max(totalQuestions - 1, 0)),
    );
  }, [totalQuestions]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!started || showResults) return;
    const t = setInterval(
      () =>
        setTimeLeft((p) => {
          if (p <= 1) {
            setShowResults(true);
            return 0;
          }
          return p - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [started, showResults]);

  const handleAnswer = (idx: number) => {
    const a = [...answers];
    a[currentQuestion] = idx;
    setAnswers(a);
  };

  const calcScore = () =>
    answers.reduce<number>(
      (c, a, i) =>
        i < totalQuestions && a === availableQuestions[i].correctAnswer
          ? c + 1
          : c,
      0,
    );
  const scorePct = () => Math.round((calcScore() / totalQuestions) * 100);

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return;

    hasSavedResult.current = true;
    const completedAtIso = new Date().toISOString();
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Difficult 1",
      difficulty: "Difficult",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: completedAtIso,
    }).catch(() => {
      hasSavedResult.current = false;
    });
  }, [showResults, user?.id, user?.childName, totalQuestions, answers]);

  const getGrade = () => {
    const p = scorePct();
    if (p >= 85) return { grade: "Excellent", color: "text-green-600" };
    if (p >= 70) return { grade: "Good", color: "text-blue-600" };
    if (p >= 50) return { grade: "Fair", color: "text-amber-600" };
    return { grade: "Needs Improvement", color: "text-red-600" };
  };

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type);
    const correct = sq.filter((q) => {
      const i = availableQuestions.findIndex((x) => x.id === q.id);
      return answers[i] === q.correctAnswer;
    }).length;
    const total = sq.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const rating =
      pct >= 85
        ? "Excellent"
        : pct >= 70
          ? "Good"
          : pct >= 50
            ? "Fair"
            : "Needs Improvement";
    const color =
      pct >= 85
        ? "text-green-600"
        : pct >= 70
          ? "text-blue-600"
          : pct >= 50
            ? "text-amber-600"
            : "text-red-600";
    return { correct, total, percentage: pct, rating, ratingColor: color };
  };

  const startTest = () => {
    const shuffledQuestions = shuffleAnswerOptions(sourceQuestions);
    setRandomizedQuestions(shuffledQuestions);
    setAnswers(new Array(shuffledQuestions.length).fill(null));
    setCurrentQuestion(0);
    setTimeLeft(60 * 60);
    setShowResults(false);
    hasSavedResult.current = false;
    setStarted(true);
  };

  const resetTest = () => {
    setStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setRandomizedQuestions([]);
    setAnswers(new Array(sourceQuestions.length).fill(null));
    setTimeLeft(60 * 60);
    hasSavedResult.current = false;
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const q = availableQuestions[currentQuestion];
  const answeredCount = answers.filter((a) => a !== null).length;

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-xl border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Preview Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">
                You completed the free preview for this test. Upgrade to Premium
                to unlock all 40 questions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link href="/mock-tests/language-arts">
                  <Button variant="outline">Back to Language Arts Tests</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  const secLabel = (t: Question["type"]) =>
    t === "reading"
      ? "Reading Comprehension"
      : t === "vocabulary"
        ? "Vocabulary & Word Study"
        : t === "grammar"
          ? "Grammar & Language Use"
          : "Writing Skills";
  const secColor = (t: Question["type"]) =>
    t === "reading"
      ? "bg-blue-50 text-blue-700"
      : t === "vocabulary"
        ? "bg-purple-50 text-purple-700"
        : t === "grammar"
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700";

  if (!started)
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Language Arts Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <BookOpen className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Language Arts Difficult 1
              </CardTitle>
              <p className="text-slate-600">
                Grade 5 PEP Language Arts · Difficult Level
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Free Preview Mode
                      </p>
                      <p className="text-sm text-amber-700">
                        Try {FREE_QUESTION_LIMIT} questions free. Upgrade to
                        unlock all 40.
                      </p>
                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This Grade 5 Language Arts test covers reading comprehension,
                  vocabulary in context, grammar and language use, and writing
                  skills — all aligned to the NSC curriculum.
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  21st-Century Skills
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>
                    Critical Thinking: analysing texts and evaluating language
                    choices
                  </li>
                  <li>
                    Communication: understanding how language works in context
                  </li>
                  <li>
                    Creativity: recognising and applying effective writing
                    techniques
                  </li>
                  <li>
                    Collaboration: understanding how writers address their
                    audience
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {totalQuestions}
                  </p>
                  <p className="text-sm text-slate-600">
                    Questions {!isPremium && "(Preview)"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>
              <Button
                onClick={startTest}
                className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );

  if (showResults) {
    const sc = calcScore();
    const pct = scorePct();
    const { grade, color } = getGrade();
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Language Arts Test Completed
              </CardTitle>
              <p className="text-slate-600">Language Arts Difficult 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-blue-600">
                  {sc}/{totalQuestions}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-3xl font-bold text-blue-600">{pct}%</p>
                  <p className="text-sm text-slate-600">Score</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className={cn("text-2xl font-bold", color)}>{grade}</p>
                  <p className="text-sm text-slate-600">Performance</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">
                    You completed the free preview.
                  </p>
                  <p className="text-sm text-amber-700">
                    Upgrade to unlock all 40 questions.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => {
                  const st = getSectionStats(s.type);
                  return (
                    <div
                      key={s.type}
                      className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                    >
                      <p className="font-semibold text-blue-800">{s.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          {st.correct}/{st.total} correct
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            st.ratingColor,
                          )}
                        >
                          {st.rating}
                        </span>
                      </div>
                      <Progress value={st.percentage} className="h-2 mt-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        {st.percentage}%
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "rounded-lg border-2 p-4",
                        correct
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {correct ? (
                          <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">
                            Q{i + 1} ·{" "}
                            <span className="text-blue-700">{q.skill}</span>
                          </p>
                          <p className="mt-1 text-slate-700 text-sm">
                            {q.question}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            <span
                              className={
                                correct
                                  ? "text-green-700 font-medium"
                                  : "text-red-700 font-medium"
                              }
                            >
                              {answers[i] !== null
                                ? q.options[answers[i]!]
                                : "Not answered"}
                            </span>
                          </p>
                          <p className="text-sm text-green-700">
                            Correct: {q.options[q.correctAnswer]}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            Explanation: {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>
                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Link href="/mock-tests/language-arts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Language Arts Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <header className="bg-blue-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/mock-tests/language-arts"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold">Language Arts Difficult 1</h1>
              <p className="text-blue-100 text-xs">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
              timeLeft <= 300 ? "bg-red-500" : "bg-green-600",
            )}
          >
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Progress: {answeredCount}/{totalQuestions} answered
            </span>
            <span>
              {Math.round((answeredCount / totalQuestions) * 100)}% complete
            </span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className="h-2"
          />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Free Preview: {FREE_QUESTION_LIMIT} of 40 questions
              </p>
              <p className="text-sm text-amber-700">
                Upgrade to Premium to access the full test.
              </p>
            </div>
          )}
          <Card className="mb-6 border-blue-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {q.skill}
                </span>
                <span className="text-xs uppercase tracking-wide opacity-70">
                  {secLabel(q.type)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">
                {q.question}
              </p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
                    )}
                  >
                    <span className="font-medium text-blue-700 mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((p) => Math.max(p - 1, 0))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Flag className="h-4 w-4 mr-2" />
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion((p) => Math.min(p + 1, totalQuestions - 1))
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
          <Card className="border-blue-100">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-blue-700">
                Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(Math.max(idx, 0), totalQuestions - 1),
                      )
                    }
                    className={cn(
                      "w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx
                        ? "bg-blue-600 text-white"
                        : answers[idx] !== null
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-600" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-100" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
