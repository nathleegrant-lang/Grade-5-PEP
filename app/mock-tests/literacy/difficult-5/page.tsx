"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveStudentTestResult } from "@/lib/student-test-results";
import { prepareAssessment, preparePreview } from "@/lib/assessment-engine";
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
   DIFFICULT 5  ·  Passage 1: Technology and Privacy
                   Passage 2: Responsible Use of Artificial Intelligence
   ============================================================ */

const d5Passage1 = `Read the passage then answer the question.

"Renee loved the new app that let her share photos with friends, but one evening her mother asked a question that made her pause: 'Do you know who else can see what you post?' Renee had never thought about it. Together they read the app's settings and discovered that her account was public, meaning strangers could view her pictures and even her location. Rather than panic, Renee learned to protect herself. She switched her account to private, removed posts that showed her school uniform, and turned off the feature that shared where each photo was taken. She also agreed never to accept friend requests from people she did not know in real life. Renee realised that technology itself was not the danger; the real risk came from using it without understanding. Privacy, she decided, was not about fear but about making careful, informed choices over what to share and with whom."`;

const d5Passage2 = `Read the passage then answer the question.

"In Mr. Reid's class, the pupils were allowed to use an artificial intelligence helper for their projects. Some thought this meant the computer would do all their work for them. Mr. Reid set clear rules instead. The AI could suggest ideas or explain a hard word, but pupils still had to check its answers, write in their own words, and say when they had used it. One pupil copied an AI answer that turned out to be wrong, and the class discussed why machines can make mistakes too. Mr. Reid explained that an AI tool is like a calculator for thinking: useful, but only in the hands of someone who understands the task. The pupils came to see that responsible use meant staying honest, questioning what the tool produced, and never letting it replace their own learning. The goal, Mr. Reid said, was to grow smarter, not lazier."`;

const g5LaDifficult5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Inference",
    question: `${d5Passage1}

What can you infer about Renee before her mother's question?`,
    options: [
      "She thought the app was completely safe without checking its settings.",
      "She had already made her account fully private.",
      "She knew strangers could see her location but did not care.",
      "She had stopped using the photo app entirely."
    ],
    correctAnswer: 0,
    explanation:
      "The text says she had never thought about who could see her posts, implying she assumed she was safe without checking.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d5Passage1}

What caused Renee to change her account settings?`,
    options: [
      "The app deleted all of her photos by mistake.",
      "She learned that the app's default settings shared her location with strangers.",
      "Her friends asked her to share more pictures with them.",
      "Her school told her to stop using the app during the week."
    ],
    correctAnswer: 1,
    explanation:
      "Learning that her public account let strangers see her photos and location caused her to change the settings.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Supporting Details",
    question: `${d5Passage1}

Which detail shows Renee took a specific step to protect herself?`,
    options: [
      "She loved the new photo-sharing app.",
      "She had never thought about her privacy before.",
      "She turned off the feature that shared each photo's location.",
      "Her mother asked her a question one evening."
    ],
    correctAnswer: 2,
    explanation:
      "Turning off location sharing is a specific protective step; the others describe the situation, not an action.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Main Idea",
    question: `${d5Passage1}

What is the main idea of the passage?`,
    options: [
      "Photo apps should never be used by young people.",
      "Technology is always dangerous and should be feared.",
      "Strangers should be allowed to see all public posts.",
      "Privacy comes from making careful, informed choices about sharing."
    ],
    correctAnswer: 3,
    explanation:
      "Renee decides privacy is about careful, informed choices — the main idea. The others are false or too extreme.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d5Passage1}

Why does the author include Renee's mother's question?`,
    options: [
      "To prove that mothers dislike all new technology.",
      "To start Renee thinking about online safety.",
      "To explain how to take a good photograph.",
      "To show that the app was broken and needed fixing."
    ],
    correctAnswer: 1,
    explanation:
      "The mother's question prompts Renee to consider safety, which is the author's purpose for including it.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d5Passage1}

In the passage, what does "informed" most nearly mean?`,
    options: [
      "done quickly without checking the facts",
      "based on good understanding",
      "copied from someone else's work",
      "made out of sudden fear"
    ],
    correctAnswer: 1,
    explanation:
      "An informed choice is one based on understanding, which is how Renee made her decisions.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d5Passage1}

What can you conclude about Renee's view of technology by the end?`,
    options: [
      "It is safe when used with understanding.",
      "It is too dangerous to use at all.",
      "It should be controlled only by adults.",
      "It works best when accounts stay public."
    ],
    correctAnswer: 0,
    explanation:
      "Renee concludes the danger comes from using technology without understanding, implying it is safe when understood.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Point of View",
    question: `${d5Passage2}

How does Mr. Reid view the AI helper?`,
    options: [
      "As a machine that should do all the pupils' work.",
      "As something pupils should never be allowed to touch.",
      "As a replacement for their own thinking and learning.",
      "As a useful tool that must be checked and used honestly."
    ],
    correctAnswer: 3,
    explanation:
      "Mr. Reid treats the AI as a useful tool that pupils must check and use honestly, not rely on blindly.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d5Passage2}

What happened because one pupil copied an AI answer?`,
    options: [
      "The class discussed why machines can make mistakes.",
      "Mr. Reid banned the AI helper for everyone.",
      "The pupil received the highest grade in the class.",
      "The AI was upgraded to never be wrong again."
    ],
    correctAnswer: 0,
    explanation:
      "The copied wrong answer led the class to discuss why machines can make mistakes.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Details",
    question: `${d5Passage2}

Which rule did Mr. Reid set for using the AI?`,
    options: [
      "Pupils had to let the AI write the whole project.",
      "Pupils were forbidden from asking the AI anything.",
      "Pupils had to keep their AI use a secret.",
      "Pupils had to check answers and say when they used the AI."
    ],
    correctAnswer: 3,
    explanation:
      "Mr. Reid required pupils to check answers, write in their own words, and disclose AI use.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `${d5Passage2}

Which theme is best developed in the passage?`,
    options: [
      "Tools help us most when we use them honestly and thoughtfully.",
      "Machines are always smarter than the people who use them.",
      "Students should avoid all new technology in school.",
      "Copying answers is the fastest way to finish an assignment."
    ],
    correctAnswer: 0,
    explanation:
      "The passage develops the idea that responsible, honest, thoughtful use is what makes a tool helpful.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d5Passage1}

${d5Passage2}

What lesson do both passages share?`,
    options: [
      "Technology should be kept away from all young people.",
      "Photo apps and AI helpers are exactly the same tool.",
      "Adults should make every technology choice for children.",
      "Technology helps most when people understand and use it wisely."
    ],
    correctAnswer: 3,
    explanation:
      "Both passages teach that understanding and wise use make technology helpful and safe. The others are false.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `${d5Passage2}

If the AI gave a strange answer, what would Mr. Reid's pupils most likely do?`,
    options: [
      "Copy it straight into their projects without checking.",
      "Stop using any technology for the rest of the year.",
      "Question it and check whether the answer is correct.",
      "Hide that they had used the AI at all."
    ],
    correctAnswer: 2,
    explanation:
      "The pupils learned to question and check the tool, so they would verify a strange answer.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Text Evidence",
    question: `${d5Passage2}

Which sentence best supports the idea that the AI is only a helper, not a replacement?`,
    options: [
      "The pupils were allowed to use an AI helper for projects.",
      "One pupil copied an AI answer that was wrong.",
      "An AI tool is like a calculator for thinking, useful only in skilled hands.",
      "Some thought the computer would do all their work."
    ],
    correctAnswer: 2,
    explanation:
      "The calculator comparison shows the AI assists a skilled user rather than replacing them.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Inference",
    question: `${d5Passage2}

What does Mr. Reid mean by saying the goal is to grow smarter, not lazier?`,
    options: [
      "Pupils should use the tool to learn, not to avoid thinking.",
      "Pupils should let the AI complete every assignment.",
      "Pupils should stop checking the AI's answers.",
      "Pupils should never use the tool for any reason."
    ],
    correctAnswer: 0,
    explanation:
      "Growing smarter, not lazier, means using the tool to support learning rather than to escape thinking.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question:
      "Which word is the closest synonym for \"protect\" in \"learned to protect herself\"?",
    options: ["safeguard", "endanger", "share", "ignore"],
    correctAnswer: 0,
    explanation:
      "To protect is to safeguard or keep from harm.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question:
      "Renee made her account \"private.\" Which word means the OPPOSITE of \"private\"?",
    options: ["hidden", "public", "secret", "closed"],
    correctAnswer: 1,
    explanation:
      "Private means restricted to a few; its opposite is public, open to all.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Word Meaning",
    question: "In \"artificial intelligence,\" what does \"artificial\" mean?",
    options: [
      "made by people, not natural",
      "found only in animals",
      "older than human history",
      "impossible to control"
    ],
    correctAnswer: 0,
    explanation:
      "Artificial means made by human skill rather than occurring naturally.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question:
      "Add the suffix \"-ible\" or \"-able\" to \"rely\" to mean \"able to be trusted.\" The correct word is —",
    options: ["relying", "reliable", "relied", "reliance"],
    correctAnswer: 1,
    explanation:
      "'Reliable' means able to be relied on or trusted.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question:
      "\"Pupils still had to verify the AI's answers.\" Using context, \"verify\" most nearly means —",
    options: ["delete them quickly", "check whether they are true", "copy them carefully", "memorise them all"],
    correctAnswer: 1,
    explanation:
      "To verify answers is to check whether they are correct, which is what the rule required.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question:
      "Which sentence uses \"share\" in the same way as \"choices over what to share\"?",
    options: [
      "Each child received a fair share of the cake.",
      "I bought one share in the small company.",
      "They planted the field with their share of seeds.",
      "Be careful what you share with strangers online."
    ],
    correctAnswer: 3,
    explanation:
      "Here 'share' means to make information available, as online. The others mean a portion or a unit of ownership.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: "Private is to closed as public is to —",
    options: ["open", "small", "quiet", "broken"],
    correctAnswer: 0,
    explanation:
      "Private is like closed; public is like open, so 'open' completes the pair.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question:
      "Which word could best replace \"honest\" in \"staying honest\"?",
    options: ["truthful", "clever", "quiet", "quick"],
    correctAnswer: 0,
    explanation:
      "Honest means truthful; 'truthful' keeps the meaning.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the academic word \"responsible\"?",
    options: [
      "doing whatever is easiest at the moment",
      "letting others make every decision",
      "acting with care and accepting one's duties",
      "avoiding all difficult tasks"
    ],
    correctAnswer: 2,
    explanation:
      "To be responsible is to act with care and accept one's duties.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question:
      "Choose the best word: \"Because machines can make mistakes, students should _____ what an AI tells them.\"",
    options: ["trust blindly", "ignore", "question", "memorise"],
    correctAnswer: 2,
    explanation:
      "Since machines can err, students should question the output rather than accept it without thought.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "After Renee changed her settings, she felt much safer.",
      "After Renee changed her settings she felt, much safer.",
      "After, Renee changed her settings she felt much safer.",
      "After Renee changed, her settings she felt much safer."
    ],
    correctAnswer: 0,
    explanation:
      "A comma follows the introductory clause 'After Renee changed her settings'.",
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "Neither the app nor the website keep her location private.",
      "Neither the app nor the website keeps her location private.",
      "Neither the app nor the website keeping her location private.",
      "Neither the app nor the website are keeps her location private."
    ],
    correctAnswer: 1,
    explanation:
      "With 'neither...nor', the verb agrees with the nearer subject 'website', which is singular, so 'keeps' is correct.",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "The pupil copies the answer and learned it was wrong.",
      "The pupil copied the answer and learns it was wrong.",
      "The pupil copied the answer and learned it was wrong.",
      "The pupil will copy the answer and learned it was wrong."
    ],
    correctAnswer: 2,
    explanation:
      "Both verbs are past tense — copied and learned — keeping the sentence consistent.",
  },
  {
    id: 29,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "Renee and me checked the settings together.",
      "Me and Renee checked the settings together.",
      "Renee and myself checked the settings together.",
      "Renee and I checked the settings together."
    ],
    correctAnswer: 3,
    explanation:
      "The pronoun is part of the subject doing the checking, so the subject form 'I' is correct.",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"Always check the AI's answers Mr. Reid reminded the class.\"",
      "Always check the AI's answers,\" Mr. Reid reminded the class.",
      "\"Always check the AI's answers\", Mr. Reid reminded the class",
      "\"Always check the AI's answers,\" Mr. Reid reminded the class."
    ],
    correctAnswer: 3,
    explanation:
      "The quoted words are enclosed, with the comma inside the closing mark before the tag.",
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "Renee changed her settings, removing old posts, and strangers were blocked.",
      "Renee was changing her settings, old posts, and blocked strangers.",
      "Renee changed, to remove old posts, and blocking strangers.",
      "Renee changed her settings, removed old posts, and blocked strangers."
    ],
    correctAnswer: 3,
    explanation:
      "The three actions share the same past-tense form: changed, removed, blocked.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The answer was wrong the class talked about machine errors.",
      "The answer was wrong, the class talked about machine errors.",
      "The answer wrong and the class talked about errors.",
      "The answer was wrong, so the class talked about machine errors."
    ],
    correctAnswer: 3,
    explanation:
      "A comma plus 'so' correctly joins the two complete ideas.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "The account was public strangers could see her photos.",
      "Being public but strangers could see her photos.",
      "Because the account was public, strangers could see her photos.",
      "The account was public, strangers, could see her photos."
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
      "Which transition best completes the sentence? \"The AI can be helpful; _____, it can also make mistakes.\"",
    options: ["therefore", "for example", "however", "finally"],
    correctAnswer: 2,
    explanation:
      "'However' shows the contrast between being helpful and making mistakes.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Clarity",
    question: "Which sentence is the clearest and most precise?",
    options: [
      "Renee turned off the setting that shared her location.",
      "Renee changed a privacy setting because it was giving other people information about where she was.",
      "The location-sharing setting was turned off by Renee after she reviewed the account settings.",
      "Renee adjusted the setting connected with sharing her location so that the information would no longer be available."
    ],
    correctAnswer: 0,
    explanation:
      "The first sentence states the action and affected setting directly; the others are wordier, passive, or unnecessarily cumbersome.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Purpose",
    question:
      "A student wants to INFORM readers what a private account does. Which sentence best fits that purpose?",
    options: [
      "A private account limits who can see your photos and personal details.",
      "Changing privacy settings can reduce the number of people who see information from an account.",
      "Location-sharing features can reveal information about where a user is at certain times.",
      "Users can review account settings to understand what information an app is allowed to share."
    ],
    correctAnswer: 0,
    explanation:
      "The first choice most directly and completely explains the central concept of online privacy in a concise informational sentence.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Supporting Detail",
    question:
      "Which detail best supports the claim that Renee acted wisely about privacy?",
    options: [
      "She made her account private and stopped sharing her location.",
      "She reviewed several account settings after speaking with her mother.",
      "She removed some older posts that she no longer wanted strangers to view.",
      "She became more careful about deciding what personal information to share online."
    ],
    correctAnswer: 0,
    explanation:
      "Making the account private and stopping location sharing directly supports acting wisely.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question:
      "\"The AI suggested an answer. _____ the pupil checked whether it was correct.\" Which transition fits best?",
    options: ["Then,", "However,", "In contrast,", "Despite this,"],
    correctAnswer: 0,
    explanation:
      "'Then' shows the next step in the sequence of careful use.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question:
      "These sentences appear in an essay about responsible AI use. Which should be REMOVED?",
    options: [
      "AI tools can produce answers quickly when pupils enter questions or instructions.",
      "Pupils must check the AI's answers for mistakes.",
      "They should write final work in their own words.",
      "Honesty means saying when the AI was used."
    ],
    correctAnswer: 0,
    explanation:
      "The sentence describes what an AI tool can do, but it does not explain responsible behaviour such as checking answers, writing in one's own words, or being honest about AI use.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question:
      "Which conclusion best combines the passages' shared ideas about careful choices, honesty and learning when using technology?",
    options: [
      "Used with care, understanding and honesty, technology can help people stay safer and learn more effectively.",
      "Digital tools can be useful when people understand both their benefits and their risks.",
      "Online privacy and artificial intelligence both require users to make thoughtful decisions.",
      "Technology works best when users understand how its features and information affect their choices."
    ],
    correctAnswer: 0,
    explanation:
      "The keyed conclusion uniquely combines careful and responsible use, understanding, honesty, safety, and effective learning. The other conclusions are credible but express fewer parts of the passages' shared message.",
  }
];

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

export default function G5LaDifficult5MockTest() {
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
    ? g5LaDifficult5Questions
    : g5LaDifficult5Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 5",
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
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaDifficult5Questions)
      : preparePreview(g5LaDifficult5Questions, FREE_QUESTION_LIMIT);
    setRandomizedQuestions(preparedQuestions);
    setAnswers(new Array(preparedQuestions.length).fill(null));
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
                Language Arts Difficult 5
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
              <p className="text-slate-600">Language Arts Difficult 5</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 5</h1>
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
