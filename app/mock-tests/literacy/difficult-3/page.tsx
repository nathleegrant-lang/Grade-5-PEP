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
   DIFFICULT 3  ·  Passage 1: Climate Change and Farming
                   Passage 2: Food Security
   ============================================================ */

const d3Passage1 = `Read the passage then answer the question.

"For thirty years, Mr. Campbell grew the same crops on his small farm in Manchester, planting by a calendar his grandfather had used. Lately the rains arrived later and ended sooner, and a long dry spell ruined two seasons of yams. Instead of trusting the old calendar, Mr. Campbell began keeping his own rainfall records and visited an agricultural officer for advice. He learned to plant drought-resistant crops, to cover the soil with mulch so it held moisture, and to dig small channels that guided rainwater to his fields. His neighbours laughed at first, but when the next dry season came, his crops survived while theirs withered. Mr. Campbell explained that the climate had changed, so a wise farmer could not simply repeat the past; he had to observe, learn, and adapt his methods to the conditions in front of him."`;

const d3Passage2 = `Read the passage then answer the question.

"A community group in St. Thomas worried that families spent too much on imported food that often spoiled before it could be eaten. They started a project to grow vegetables on unused land beside the school. At first they planted whatever seeds they could find, but many crops failed in the poor soil. Rather than abandon the plan, the group tested the soil, added compost made from kitchen scraps, and chose plants suited to the local climate. They also taught families how to store and preserve part of each harvest so nothing went to waste. Within a year the garden supplied fresh produce to dozens of homes and even to the school kitchen. The leaders argued that true food security does not come only from growing more; it comes from growing wisely, sharing knowledge, and making sure good food is not lost."`;

const g5LaDifficult3Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Inference",
    question: `${d3Passage1}\n\nWhat can you infer about why Mr. Campbell stopped trusting the old calendar?`,
    options: [
      "The weather no longer matched the patterns the calendar assumed.",
      "His grandfather told him the calendar was wrong.",
      "The agricultural officer destroyed the old calendar.",
      "His neighbours forced him to throw the calendar away.",
    ],
    correctAnswer: 0,
    explanation:
      "The rains changed and the calendar failed, so he stopped trusting it. The other reasons are not in the text.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d3Passage1}\n\nWhat caused Mr. Campbell to lose two seasons of yams?`,
    options: [
      "A long dry spell ruined the crops.",
      "His neighbours stole the yams from his fields.",
      "He planted too many crops in one season.",
      "The agricultural officer gave him bad seeds.",
    ],
    correctAnswer: 0,
    explanation:
      "The passage names a long dry spell as the cause of the ruined yams.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Supporting Details",
    question: `${d3Passage1}\n\nWhich detail shows Mr. Campbell used evidence to make decisions?`,
    options: [
      "He kept his own rainfall records.",
      "He had farmed the land for thirty years.",
      "His grandfather had used the same calendar.",
      "His neighbours laughed at his new methods.",
    ],
    correctAnswer: 0,
    explanation:
      "Keeping rainfall records is the detail that shows decisions based on evidence.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d3Passage1}\n\nWhat can you conclude about the neighbours who laughed?`,
    options: [
      "Their methods failed because they did not adapt like Mr. Campbell.",
      "They had a better harvest than Mr. Campbell that year.",
      "They taught Mr. Campbell how to dig water channels.",
      "They stopped farming and moved to the city.",
    ],
    correctAnswer: 0,
    explanation:
      "Their crops withered while his survived, so we conclude their unchanged methods failed.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Main Idea",
    question: `${d3Passage1}\n\nWhat is the main idea of the passage?`,
    options: [
      "A wise farmer must observe, learn, and adapt as the climate changes.",
      "Old farming calendars are always better than new methods.",
      "Yams are the most important crop a farmer can plant.",
      "Farmers should never ask experts for advice.",
    ],
    correctAnswer: 0,
    explanation:
      "Mr. Campbell's closing statement gives the main idea: observe, learn, and adapt. The others are false or too narrow.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d3Passage1}\n\nIn the passage, what does "adapt" most nearly mean?`,
    options: [
      "to change methods to fit new conditions",
      "to repeat the same actions every year",
      "to give up and stop trying",
      "to copy a neighbour exactly",
    ],
    correctAnswer: 0,
    explanation:
      "He adapted his methods to the conditions in front of him — changing to fit new conditions.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d3Passage1}\n\nWhy does the author describe the neighbours laughing and then their crops withering?`,
    options: [
      "To show that adapting was wiser than repeating old habits.",
      "To prove that farming is an impossible job.",
      "To explain how to build channels for rainwater.",
      "To suggest the neighbours were Mr. Campbell's enemies.",
    ],
    correctAnswer: 0,
    explanation:
      "The contrast shows the value of adapting over repeating habits, which is the author's point.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Point of View",
    question: `${d3Passage2}\n\nHow do the project leaders define true food security?`,
    options: [
      "Growing wisely, sharing knowledge, and preventing waste.",
      "Buying as much imported food as possible.",
      "Growing the largest amount of any single crop.",
      "Keeping all farming methods a secret.",
    ],
    correctAnswer: 0,
    explanation:
      "The leaders argue food security comes from growing wisely, sharing knowledge, and not losing good food.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d3Passage2}\n\nWhy did many of the group's first crops fail?`,
    options: [
      "They planted in poor soil without preparing it.",
      "Families refused to eat the vegetables.",
      "The school kitchen used up all the produce.",
      "Heavy rain flooded the entire garden.",
    ],
    correctAnswer: 0,
    explanation:
      "The text says the first crops failed in the poor soil, which they later improved with compost.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Details",
    question: `${d3Passage2}\n\nWhich detail shows the group reduced waste?`,
    options: [
      "They taught families to store and preserve part of each harvest.",
      "They planted vegetables on unused land beside the school.",
      "They worried about the cost of imported food.",
      "The garden supplied produce within a single year.",
    ],
    correctAnswer: 0,
    explanation:
      "Teaching families to store and preserve harvests is the detail that directly addresses reducing waste.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `${d3Passage2}\n\nWhich theme is best developed in the passage?`,
    options: [
      "Solving a community problem requires knowledge, effort, and sharing.",
      "Imported food is always better than locally grown food.",
      "A garden can only succeed if experts plant every seed.",
      "Communities should keep useful knowledge to themselves.",
    ],
    correctAnswer: 0,
    explanation:
      "The garden's success rests on tested knowledge, hard work, and sharing — the central theme.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d3Passage1}\n\n${d3Passage2}\n\nHow are Mr. Campbell and the community group alike?`,
    options: [
      "Both tested ideas and changed their methods after early failure.",
      "Both grew yams to sell at the local market.",
      "Both gave up after their first crops failed.",
      "Both refused help from any outside experts.",
    ],
    correctAnswer: 0,
    explanation:
      "Both responded to failure by testing and adapting. The other choices fit only one passage or neither.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `${d3Passage2}\n\nIf a new pest attacked the garden, what would the group most likely do?`,
    options: [
      "Study the problem and try a solution suited to local conditions.",
      "Abandon the garden and go back to imported food.",
      "Plant the same way and hope the pest disappears.",
      "Blame the school and stop sharing knowledge.",
    ],
    correctAnswer: 0,
    explanation:
      "Their pattern is to test and adapt, so they would study the pest and seek a fitting solution.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Text Evidence",
    question: `${d3Passage2}\n\nWhich sentence best supports the idea that the project benefited many people?`,
    options: [
      "The garden supplied fresh produce to dozens of homes and the school kitchen.",
      "They started a project on unused land beside the school.",
      "Many crops failed in the poor soil at first.",
      "They added compost made from kitchen scraps.",
    ],
    correctAnswer: 0,
    explanation:
      "Supplying dozens of homes and the school kitchen is direct evidence of wide benefit.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Inference",
    question: `${d3Passage2}\n\nWhat can you infer about why the group made compost from kitchen scraps?`,
    options: [
      "They wanted a low-cost way to improve the poor soil.",
      "They had no other use for the scraps at all.",
      "An expert ordered them to stop buying fertiliser.",
      "They wanted to keep the scraps away from animals.",
    ],
    correctAnswer: 0,
    explanation:
      "Compost from scraps is a cheap way to enrich soil, which is why the group used it after their crops failed.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question:
      "Which word is the closest synonym for \"withered\" in \"their crops withered\"?",
    options: ["shrivelled", "bloomed", "ripened", "grew"],
    correctAnswer: 0,
    explanation:
      "Withered means dried up and shrank, so 'shrivelled' is the closest match.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question:
      "The soil was \"poor.\" Which word means the OPPOSITE of \"poor\" when describing soil?",
    options: ["fertile", "dry", "rocky", "shallow"],
    correctAnswer: 0,
    explanation:
      "Poor soil grows little; fertile soil grows much, so 'fertile' is the opposite.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question:
      "The word \"imported\" begins with \"im-,\" meaning \"into.\" Imported food is food that is —",
    options: [
      "brought into the country from elsewhere",
      "grown only in the local village",
      "thrown out before it is eaten",
      "stored for many years at a time",
    ],
    correctAnswer: 0,
    explanation:
      "'Im-' means into, so imported food is brought into the country from abroad.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question:
      "Add the suffix \"-ance\" to \"resist\" to form a noun. The correct word is —",
    options: ["resistance", "resisting", "resisted", "resistful"],
    correctAnswer: 0,
    explanation:
      "'-ance' forms the noun 'resistance', as in drought resistance.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question:
      "\"They added compost so the soil could hold moisture.\" Using context, \"moisture\" most nearly means —",
    options: ["small amounts of water", "thick layers of mud", "tiny insects", "dry dust"],
    correctAnswer: 0,
    explanation:
      "Soil that holds moisture holds water, so 'small amounts of water' fits the context.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question:
      "Which sentence uses \"spell\" in the same way as \"a long dry spell\"?",
    options: [
      "We expect a cold spell later this week.",
      "Please spell your full name for the record.",
      "The teacher asked her to spell the word aloud.",
      "He read a magic spell from the old book.",
    ],
    correctAnswer: 0,
    explanation:
      "Here 'spell' means a period of weather, as in 'a cold spell'. The others use different meanings.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: "Drought is to dry as flood is to —",
    options: ["wet", "warm", "windy", "empty"],
    correctAnswer: 0,
    explanation:
      "A drought is a time of dryness; a flood is a time of too much water, so 'wet' completes the pair.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question:
      "Which word could best replace \"preserve\" in \"store and preserve part of each harvest\"?",
    options: ["protect", "waste", "sell", "plant"],
    correctAnswer: 0,
    explanation:
      "To preserve food is to protect it from spoiling; 'protect' keeps the meaning.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the academic word \"adapt\"?",
    options: [
      "to change to suit new conditions",
      "to refuse to make any change",
      "to copy something exactly",
      "to forget what was learned",
    ],
    correctAnswer: 0,
    explanation:
      "To adapt is to adjust or change so as to fit new conditions.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question:
      "Choose the best word: \"Because the rains had become unpredictable, the farmer had to plan more _____.\"",
    options: ["carefully", "carelessly", "rarely", "loudly"],
    correctAnswer: 0,
    explanation:
      "Unpredictable rains demand careful planning; the other words do not fit the meaning.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "Mr. Campbell observed the weather and changed his crops.",
      "Mr. Campbell observes the weather and changed his crops.",
      "Mr. Campbell observed the weather and changes his crops.",
      "Mr. Campbell will observe the weather and changed his crops.",
    ],
    correctAnswer: 0,
    explanation:
      "Both verbs are past tense — observed and changed — keeping the sentence consistent.",
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "Each of the crops needs the right kind of soil.",
      "Each of the crops need the right kind of soil.",
      "Each of the crops needing the right kind of soil.",
      "Each of the crops are needs the right kind of soil.",
    ],
    correctAnswer: 0,
    explanation:
      "'Each' is singular and takes the singular verb 'needs'.",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "The officer gave advice to Mr. Campbell and them.",
      "The officer gave advice to Mr. Campbell and they.",
      "The officer gave advice to he and them.",
      "The officer gave advice to Mr. Campbell and theirselves.",
    ],
    correctAnswer: 0,
    explanation:
      "The pronoun is an object of 'to', so the object form 'them' is correct.",
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "When the dry season came, his crops survived.",
      "When the dry season came his crops, survived.",
      "When, the dry season came his crops survived.",
      "When the dry season, came his crops survived.",
    ],
    correctAnswer: 0,
    explanation:
      "A comma follows the introductory clause 'When the dry season came'.",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"A wise farmer must adapt,\" Mr. Campbell said.",
      "\"A wise farmer must adapt Mr. Campbell said.\"",
      "A wise farmer must adapt,\" Mr. Campbell said.",
      "\"A wise farmer must adapt\" Mr. Campbell said!",
    ],
    correctAnswer: 0,
    explanation:
      "The quoted words are enclosed, with the comma inside the closing mark before the tag.",
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "The group tested the soil, added compost, and chose suitable plants.",
      "The group tested the soil, adding compost, and plants were chosen.",
      "The group was testing the soil, compost, and chose plants.",
      "The group tested, to add compost, and choosing plants.",
    ],
    correctAnswer: 0,
    explanation:
      "The three actions share the same past-tense form: tested, added, chose.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The soil was poor, so the group added compost to it.",
      "The soil was poor the group added compost to it.",
      "The soil was poor, the group added compost to it.",
      "The soil poor and the group added compost.",
    ],
    correctAnswer: 0,
    explanation:
      "A comma plus 'so' correctly joins the two complete ideas.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "After the group tested the soil, they added compost to improve it.",
      "The group tested the soil they added compost to improve it.",
      "Testing the soil but adding compost to improve it.",
      "The group tested the soil, they, added compost.",
    ],
    correctAnswer: 0,
    explanation:
      "'After' joins the two actions into one clear, ordered sentence.",
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question:
      "Which transition best completes the sentence? \"The first seeds failed; _____, the group did not give up.\"",
    options: ["nevertheless", "therefore", "for example", "first"],
    correctAnswer: 0,
    explanation:
      "'Nevertheless' shows the contrast between failure and continuing the project.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Clarity",
    question: "Which sentence is the clearest and most precise?",
    options: [
      "The farmer dug channels to guide rainwater into his fields.",
      "The farmer did some digging for water in the field area.",
      "There was digging and water and fields all at once.",
      "Channels and water and the farmer were a thing that happened.",
    ],
    correctAnswer: 0,
    explanation:
      "The first sentence uses precise nouns and verbs; the others are vague.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Best Introduction",
    question:
      "Which sentence is the best introduction for an essay about adapting to a changing climate?",
    options: [
      "As the climate changes, farmers who observe and adapt can protect their crops and their communities.",
      "Farming is a job that some people do in the countryside.",
      "This essay will talk about a few things to do with farms.",
      "There is soil and rain and many plants in the world.",
    ],
    correctAnswer: 0,
    explanation:
      "A strong introduction states a clear, specific main idea; the others are vague or off-topic.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Audience",
    question:
      "A student is writing for young children about saving food. Which sentence best suits that audience?",
    options: [
      "Don't waste food — save what you can't eat now so you can enjoy it later!",
      "Optimising household consumption reduces aggregate nutritional shortfalls.",
      "Food security frameworks require systemic agricultural reform.",
      "The preservation of surplus produce mitigates economic loss.",
    ],
    correctAnswer: 0,
    explanation:
      "Simple, friendly wording suits young children; the other choices use difficult adult vocabulary.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question:
      "\"The garden's soil was poor. _____ the group enriched it with compost.\" Which transition fits best?",
    options: ["Therefore,", "However,", "For example,", "Meanwhile,"],
    correctAnswer: 0,
    explanation:
      "'Therefore' shows the action that resulted from the poor soil.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question:
      "These sentences appear in a report about the community garden. Which should be REMOVED?",
    options: [
      "The school's football team won a match last Friday.",
      "The group tested the soil before planting.",
      "Compost was made from kitchen scraps.",
      "Families learned how to preserve their harvest.",
    ],
    correctAnswer: 0,
    explanation:
      "A football result has nothing to do with the garden report and should be removed.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question:
      "Which sentence is the best conclusion for an essay about these two stories?",
    options: [
      "Both stories show that observing, adapting, and sharing can help communities feed themselves.",
      "And that is the whole story about food and farming, the end.",
      "Yams and gardens are two different things in the world.",
      "So they grew food and the essay is now finished here.",
    ],
    correctAnswer: 0,
    explanation:
      "A strong conclusion restates the shared main idea with purpose, as the first choice does.",
  },
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

export default function G5LaDifficult3MockTest() {
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
    ? g5LaDifficult3Questions
    : g5LaDifficult3Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 3",
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
                Language Arts Difficult 3
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
              <p className="text-slate-600">Language Arts Difficult 3</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 3</h1>
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
