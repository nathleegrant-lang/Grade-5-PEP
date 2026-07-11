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

/* ============================================================
   DIFFICULT 2  ·  Passage 1: Renewable Energy
                   Passage 2: Scientific Discovery
   ============================================================ */

const d2Passage1 = `Read the passage then answer the question.

"At Windward Primary, a science team investigated renewable energy after the computer lab lost power twice in one week. They compared solar, wind, and hydro power, then built a small solar oven from foil, cardboard, and a clear plastic cover. At first the oven barely warmed a cup of water. Instead of giving up, the pupils interpreted the thermometer readings and noticed that passing clouds and a loose cover were letting heat escape. They tightened the cover, changed the oven's angle toward the sun, and recorded data every ten minutes. Their final report emphasised that sustainable energy can reduce pollution, but it also needs thoughtful design and a way to store power for cloudy days. The principal praised the team because they did more than build a model; they justified their conclusions with measurements and explained both the benefits and the limits of renewable energy."`;

const d2Passage2 = `Read the passage then answer the question.

"Dr. Nia Blake visited the school to describe a discovery she made while studying coral reefs near Port Royal. Her team expected warmer water to damage every coral sample in the same way, yet one group of coral survived far longer than predicted. Rather than announce a conclusion too quickly, the scientists investigated the water temperature, the algae, the sunlight, and the coral's exact location. A microscope finally revealed a tiny organism living inside the stronger coral, offering a possible explanation. Dr. Blake told the pupils that discovery often begins with a surprising observation and continues through repeated tests. She also warned that honest science must admit what is still uncertain. By sharing her evidence with other researchers, she allowed them to compare results, challenge her interpretation, and add new ideas. The pupils left understanding that a discovery becomes powerful only when evidence, patience, and cooperation support it."`;

const g5LaDifficult2Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d2Passage1}

What first caused the team to investigate renewable energy?`,
    options: [
      "The principal ordered them to investigate different types of pollution.",
      "A scientist visited the school to teach them about solar ovens.",
      "The computer lab lost power twice in one week.",
      "They needed a new project to present at the island's science fair."
    ],
    correctAnswer: 2,
    explanation:
      "The passage opens by saying the team began their work after the lab lost power twice. The other options are not the starting cause.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `${d2Passage1}

What can you infer about how the pupils respond to unexpected results?`,
    options: [
      "They prefer to build a completely new model rather than fix a broken one.",
      "They treat unexpected results as clues to improve their design.",
      "They wait for an adult to tell them exactly what to change.",
      "They change their main goal completely whenever something goes wrong."
    ],
    correctAnswer: 1,
    explanation:
      "When the oven barely worked, they used the poor results to find the problem (heat escaping) and fix it, showing they treat failures as clues.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Supporting Details",
    question: `${d2Passage1}

Which detail shows the pupils collected reliable data?`,
    options: [
      "They compared solar, wind, and hydro power before building the oven.",
      "They used foil, cardboard, and a clear plastic cover for the oven.",
      "The principal praised them for doing more than just building a model.",
      "They recorded the oven's temperature every ten minutes to track changes."
    ],
    correctAnswer: 3,
    explanation:
      "Recording readings at regular intervals is the detail that shows reliable data collection; the others do not.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Main Idea",
    question: `${d2Passage1}

What is the main idea of the passage?`,
    options: [
      "Renewable energy can reduce pollution but requires careful design and storage solutions.",
      "Solar ovens are easy to build and always work perfectly on the first try.",
      "Building models is more important than understanding why they work or fail.",
      "Cloudy weather makes it impossible to use any type of renewable energy."
    ],
    correctAnswer: 0,
    explanation:
      "The report's central point is that sustainable energy reduces pollution but needs thoughtful design and storage. The others are too narrow or false.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d2Passage1}

In the passage, what does "justified" most nearly mean?`,
    options: [
      "argued about loudly with the other students in the class",
      "supported with good reasons and clear measurements",
      "changed without giving any explanation to the teacher",
      "copied from another team's report to save time"
    ],
    correctAnswer: 1,
    explanation:
      "They justified their conclusions with measurements, meaning they supported them with evidence.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d2Passage1}

Why does the author mention that the team explained the LIMITS of renewable energy?`,
    options: [
      "To prove that the solar oven was a complete failure.",
      "To explain how to build a better oven out of stronger cardboard.",
      "To show that their conclusion was honest and based on the whole truth.",
      "To suggest that renewable energy should not be used in schools."
    ],
    correctAnswer: 2,
    explanation:
      "Noting both benefits and limits shows balanced, honest reasoning, which is why the principal praised them.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Prediction",
    question: `${d2Passage1}

If the team built a new device that did not work well at first, what would they most likely do?`,
    options: [
      "Assume it works perfectly and skip the testing phase entirely.",
      "Present it to the principal without making any adjustments.",
      "Refuse to share their findings with the rest of the class.",
      "Look for flaws, test it, and record the results before drawing conclusions."
    ],
    correctAnswer: 3,
    explanation:
      "Their established method is to test, find the problem, and record data, so they would repeat that careful approach.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Point of View",
    question: `${d2Passage2}

How does Dr. Blake view scientific discovery?`,
    options: [
      "As a careful process that requires evidence, patience, and cooperation to succeed.",
      "As a quick event that happens by luck and needs no follow-up.",
      "As something only experienced adult scientists are able to achieve.",
      "As private work that should be hidden from other researchers."
    ],
    correctAnswer: 0,
    explanation:
      "She tells the pupils discovery is powerful only when evidence, patience, and cooperation support it.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d2Passage2}

Why did Dr. Blake's team avoid announcing a conclusion quickly?`,
    options: [
      "They had already lost all of their coral samples in the warm water.",
      "They wanted to study multiple factors before deciding on a reason.",
      "Another team of scientists had ordered them to stay silent.",
      "The microscope they needed to use was broken at the time."
    ],
    correctAnswer: 1,
    explanation:
      "The text says rather than conclude quickly, they investigated temperature, algae, sunlight, and location first.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d2Passage2}

What can you conclude about why the stronger coral survived?`,
    options: [
      "The warmer water caused the coral to grow much faster than normal.",
      "The other samples were simply older and weaker than this one.",
      "A tiny organism inside it offered a possible reason for its strength.",
      "Other researchers had secretly moved it to a cooler location."
    ],
    correctAnswer: 2,
    explanation:
      "The microscope revealed a tiny organism inside the stronger coral, offering the explanation for its survival.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `${d2Passage2}

Which statement best expresses a theme of the passage?`,
    options: [
      "Scientists should keep surprising results a secret from the public.",
      "The very first idea a scientist has is always the correct one.",
      "Working completely alone is the fastest way to make a discovery.",
      "Honest discovery relies on patience, careful evidence, and teamwork."
    ],
    correctAnswer: 3,
    explanation:
      "The passage repeatedly stresses patience, evidence, and cooperation as what makes discovery trustworthy.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d2Passage1}

${d2Passage2}

What do the science team and Dr. Blake's team have in common?`,
    options: [
      "Both discovered new types of coral living near Port Royal.",
      "Both delayed final conclusions until they had tested multiple ideas.",
      "Both built models using cardboard, foil, and plastic covers.",
      "Both decided to hide their findings from other researchers."
    ],
    correctAnswer: 1,
    explanation:
      "Both groups relied on testing variables and delayed conclusions. The other choices describe only one passage or neither.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Evidence",
    question: `${d2Passage2}

Which sentence best supports the idea that Dr. Blake values honesty in science?`,
    options: [
      "She warned that honest science must admit what is still uncertain.",
      "She visited the school to describe a discovery she had made.",
      "Her team studied how warmer water affected the coral samples.",
      "A microscope finally revealed a tiny organism inside the coral."
    ],
    correctAnswer: 0,
    explanation:
      "Admitting uncertainty is the clearest evidence of valuing honesty; the others are facts about the study.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `${d2Passage2}

Why did Dr. Blake share her evidence with other researchers?`,
    options: [
      "So they could take all the credit for her hard work.",
      "So she would never have to study coral reefs again.",
      "So they could test her ideas and help make the science stronger.",
      "So the pupils would stop asking her so many questions."
    ],
    correctAnswer: 2,
    explanation:
      "The text says sharing let others compare results, challenge her interpretation, and add ideas — improving the science.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d2Passage2}

In the passage, what does "interpretation" most nearly mean?`,
    options: [
      "a list of all the equipment used during the study",
      "a refusal to look at any of the data collected",
      "a quick guess made with no supporting information",
      "an explanation of what the evidence seems to show"
    ],
    correctAnswer: 3,
    explanation:
      "Others could challenge her interpretation — her explanation of what the evidence meant.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Context Clues",
    question:
      "\"The pupils interpreted the thermometer readings.\" Using context, \"interpreted\" most nearly means —",
    options: [
      "memorised the numbers without thinking about them",
      "worked out and explained the meaning of",
      "changed to match what they wanted to see",
      "copied carefully into a new notebook"
    ],
    correctAnswer: 1,
    explanation:
      "To interpret readings is to work out and explain what they mean.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonym",
    question:
      "Which word is the closest synonym for \"sustainable\" as used in the passage?",
    options: [
      "damaged beyond repair",
      "very expensive to build",
      "able to be maintained over time",
      "harmful to the environment"
    ],
    correctAnswer: 2,
    explanation:
      "Sustainable energy is energy that can last or be kept up over time, so 'able to be maintained' fits best.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Antonym",
    question:
      "The report praised \"reliable\" data. Which word means the OPPOSITE of \"reliable\"?",
    options: ["untrustworthy", "consistent", "careful", "exact"],
    correctAnswer: 0,
    explanation:
      "Reliable means trustworthy, so its opposite is untrustworthy. The other choices are near-synonyms.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Prefix",
    question:
      "In \"renewable,\" the prefix \"re-\" means \"again.\" Which word uses \"re-\" with the same meaning?",
    options: ["reduce", "remain", "respect", "recharge"],
    correctAnswer: 3,
    explanation:
      "'Recharge' means to charge again, matching the 'again' meaning of 're-'.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Suffix",
    question:
      "The suffix \"-able\" in \"renewable\" means \"able to be.\" What does \"renewable\" describe?",
    options: [
      "the act of renewing something once",
      "something that can be renewed or replaced",
      "a person who is skilled at renewing items",
      "something that has already been removed"
    ],
    correctAnswer: 1,
    explanation:
      "'-able' means able to be, so renewable means something that can be renewed.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question:
      "Which sentence uses \"store\" in the same way as \"a way to store power for cloudy days\"?",
    options: [
      "We bought our snacks at the corner store.",
      "She works at a clothing store downtown.",
      "A battery can store energy to be used later.",
      "The new store opened early on Saturday morning."
    ],
    correctAnswer: 2,
    explanation:
      "Here 'store' means to keep for later, as a battery stores energy. The others use 'store' to mean a shop.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: "Evidence is to proof as guess is to —",
    options: ["estimate", "measurement", "report", "record"],
    correctAnswer: 0,
    explanation:
      "Evidence and proof are close in meaning; a guess is close to an estimate.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question:
      "Which word could best replace \"investigated\" in \"the scientists investigated the water\"?",
    options: ["avoided carefully", "cleaned thoroughly", "created from scratch", "studied closely"],
    correctAnswer: 3,
    explanation:
      "To investigate is to examine carefully; 'studied closely' keeps the meaning.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the academic word \"emphasise\"?",
    options: [
      "to remove an idea from a report entirely",
      "to give special importance to a particular point",
      "to repeat a word without understanding it",
      "to hide an idea from the reader on purpose"
    ],
    correctAnswer: 1,
    explanation:
      "To emphasise is to stress or give special importance to something.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question:
      "Choose the best word: \"Because the result was surprising, the team decided to _____ it with more tests.\"",
    options: ["ignore", "hide", "double-check", "forget"],
    correctAnswer: 2,
    explanation:
      "A surprising result should be double-checked, or verified, with more tests; the other words contradict careful science.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The team of pupils records data every ten minutes.",
      "The team of pupils record data every ten minutes.",
      "The team of pupils recording data every ten minutes.",
      "The team of pupils are records data every ten minutes."
    ],
    correctAnswer: 0,
    explanation:
      "'Team' is singular, so it takes the singular verb 'records'.",
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "The scientists study the coral and recorded the results.",
      "The scientists studied the coral and record the results.",
      "The scientists will study the coral and recorded the results.",
      "The scientists studied the coral and recorded the results."
    ],
    correctAnswer: 3,
    explanation:
      "Both verbs are in the past tense, keeping the sentence consistent.",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "Dr. Blake shared her results with the other researchers and we.",
      "Dr. Blake shared her results with the other researchers and us.",
      "Dr. Blake shared she results with the other researchers and us.",
      "Dr. Blake shared her results with the other researchers and ourselves."
    ],
    correctAnswer: 1,
    explanation:
      "The pronoun is an object of 'with', so the object form 'us' is correct.",
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "Before the cover was tightened the oven lost, heat quickly.",
      "Before, the cover was tightened the oven lost heat quickly.",
      "Before the cover was tightened, the oven lost heat quickly.",
      "Before the cover, was tightened the oven lost heat quickly."
    ],
    correctAnswer: 2,
    explanation:
      "A comma follows the introductory clause 'Before the cover was tightened'.",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"Honest science admits uncertainty,\" Dr. Blake explained.",
      "\"Honest science admits uncertainty Dr. Blake explained.\"",
      "Honest science admits uncertainty,\" Dr. Blake explained.",
      "\"Honest science admits uncertainty\", Dr. Blake explained,"
    ],
    correctAnswer: 0,
    explanation:
      "The quoted words are enclosed, with the comma inside the closing quotation mark before the tag.",
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "The team tightened the cover, changing the angle, and data was recorded.",
      "The team was tightening the cover, the angle, and recorded data.",
      "The team tightened, to change the angle, and recording data.",
      "The team tightened the cover, changed the angle, and recorded the data."
    ],
    correctAnswer: 3,
    explanation:
      "The three actions use the same past-tense form: tightened, changed, recorded.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The oven lost heat the pupils tightened the cover.",
      "The oven lost heat, so the pupils tightened the cover.",
      "The oven lost heat, the pupils tightened the cover.",
      "The oven losing heat and pupils tightened cover."
    ],
    correctAnswer: 1,
    explanation:
      "A comma plus 'so' correctly joins the two complete ideas.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "One coral survived the scientists searched for an explanation.",
      "Surviving coral but searching for an explanation by scientists.",
      "Because one coral survived, the scientists searched for an explanation.",
      "One coral survived, the scientists, searched for an explanation."
    ],
    correctAnswer: 2,
    explanation:
      "'Because' joins the cause and effect into one clear sentence.",
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question:
      "Which transition best completes the sentence? \"The first design failed; _____, the team did not give up.\"",
    options: ["however", "therefore", "for example", "finally"],
    correctAnswer: 0,
    explanation:
      "'However' shows the contrast between failure and continuing to work.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question:
      "Which word choice is most precise for a science report? \"The team _____ the temperature every ten minutes.\"",
    options: ["watched", "guessed", "noticed", "measured"],
    correctAnswer: 3,
    explanation:
      "'Measured' is precise and scientific; the other choices are vague.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question:
      "A student wants to PERSUADE readers to support renewable energy. Which sentence fits that purpose best?",
    options: [
      "Renewable energy is a type of energy that comes from nature.",
      "We must choose renewable energy because it protects our health and our future.",
      "Here are the steps for building a solar oven from cardboard.",
      "Once upon a time, a science team built a small oven."
    ],
    correctAnswer: 1,
    explanation:
      "A persuasive purpose calls for an opinion with reasons; the others inform, instruct, or tell a story instead.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Supporting Detail",
    question:
      "Which detail best supports the claim that the pupils were thorough scientists?",
    options: [
      "They built the oven from foil and cardboard.",
      "The computer lab had lost power that week.",
      "They recorded measurements every ten minutes and adjusted their design.",
      "The principal smiled when he heard the report."
    ],
    correctAnswer: 2,
    explanation:
      "Regular measurement and adjustment is strong evidence of thoroughness; the others are weaker or unrelated.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question:
      "\"The oven barely worked at first. _____ the pupils improved it through testing.\" Which transition fits best?",
    options: ["Eventually,", "For example,", "In contrast,", "Similarly,"],
    correctAnswer: 0,
    explanation:
      "'Eventually' shows the passage of time from failure to success, which fits the sequence.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question:
      "These sentences appear in a report on the solar oven. Which should be REMOVED to keep it focused?",
    options: [
      "The pupils tightened the loose plastic cover.",
      "They changed the oven's angle toward the sun.",
      "They recorded temperature data every ten minutes.",
      "The school cafeteria serves lunch at noon each day."
    ],
    correctAnswer: 3,
    explanation:
      "Lunch times are unrelated to the solar oven study and should be removed; the others belong in the report.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question:
      "Which sentence is the best conclusion for an essay about these two science stories?",
    options: [
      "In conclusion, both renewable energy and coral reefs are very interesting topics to study.",
      "Both stories show that real science depends on evidence, patience, and honest testing.",
      "These examples prove that students should always wait for adults to do the hard work.",
      "As the passages show, the only way to do science is to build a model or use a microscope."
    ],
    correctAnswer: 1,
    explanation:
      "A strong conclusion restates the shared main idea with purpose; the second choice ties both examples to the central point.",
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

export default function G5LaDifficult2MockTest() {
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
    ? g5LaDifficult2Questions
    : g5LaDifficult2Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 2",
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
                Language Arts Difficult 2
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
              <p className="text-slate-600">Language Arts Difficult 2</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 2</h1>
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
