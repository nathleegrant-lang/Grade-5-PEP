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
   DIFFICULT 4  ·  Passage 1: Jamaican Heroes and Civic Responsibility
                   Passage 2: Student Leadership and National Service
   ============================================================ */

const d4Passage1 = `Read the passage then answer the question.

"On Heroes' Day, Tanya's class studied the lives of Jamaica's National Heroes. She learned that Nanny of the Maroons led her people to freedom through courage and clever strategy, and that Sam Sharpe used his voice to demand justice. At first Tanya thought heroes were only people from long ago who did enormous things. Then her teacher asked a harder question: what does it mean to be a good citizen today? The class discussed picking up litter, helping a struggling classmate, telling the truth, and speaking up against unfairness. Tanya realised that the heroes she admired had each started by caring about other people and refusing to accept what was wrong. She decided that civic responsibility was not only about famous deeds in the past; it was about the small, brave choices ordinary people make to improve their community every single day."`;

const d4Passage2 = `Read the passage then answer the question.

"When Marcus was chosen as head boy, he expected the role to be about giving orders and wearing a special badge. He soon discovered it was something else entirely. A younger pupil was being teased, the school gate was rusting dangerously, and many students dropped litter in the yard. Marcus could have ignored these problems, but instead he organised a buddy system to support younger pupils, reported the broken gate to the office, and started a weekly clean-up team. Some classmates complained that a leader should not have to do ordinary chores, yet Marcus believed leadership meant serving others, not standing above them. By the end of the term, more students joined his efforts than he had ever expected. Marcus learned that true national service begins small: a leader earns respect not by his title, but by the example he sets and the people he is willing to help."`;

const g5LaDifficult4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `${d4Passage1}

What is the main idea of the passage?`,
    options: [
      "Being a good citizen means making small, brave choices every day.",
      "Civic duty is only about completing large, famous deeds.",
      "Studying history is the only way to truly honour our National Heroes.",
      "Picking up litter is the single most important duty a person has."
    ],
    correctAnswer: 0,
    explanation:
      "Tanya's realisation gives the main idea: civic responsibility is about small, brave daily choices. The others are too narrow or false.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `${d4Passage1}

What can you infer changed in Tanya's thinking during the lesson?`,
    options: [
      "She realised that famous heroes probably never did ordinary tasks.",
      "She concluded that only adults, not children, can show true courage.",
      "She began to see that ordinary people doing small things can be heroic.",
      "She decided that studying history was the only way to learn about bravery."
    ],
    correctAnswer: 2,
    explanation:
      "Tanya moves from thinking heroes are only famous figures to seeing everyday choices as brave, an inference about her changed view.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Supporting Details",
    question: `${d4Passage1}

Which detail does the passage give about Nanny of the Maroons?`,
    options: [
      "She organised a weekly clean-up team at a local school.",
      "She led her people to freedom with courage and clever strategy.",
      "She taught Tanya's class how to write essays on Heroes' Day.",
      "She wrote a book explaining the importance of civic responsibility."
    ],
    correctAnswer: 1,
    explanation:
      "The passage states Nanny led her people to freedom through courage and strategy; the other options are not in the text.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d4Passage1}

Why does the teacher ask what it means to be a good citizen today?`,
    options: [
      "To prove that modern citizens are not as strong as heroes from the past.",
      "To test whether the pupils could memorise the names of every National Hero.",
      "To explain the exact history of how Heroes' Day became a public holiday.",
      "To help pupils connect past heroes to their own actions now."
    ],
    correctAnswer: 3,
    explanation:
      "The question links the heroes of the past to the pupils' present choices, which is the author's purpose.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d4Passage1}

In the passage, what does "civic" most nearly mean?`,
    options: [
      "relating only to ancient history or old traditions",
      "relating to one's community or society",
      "relating strictly to a single family's private matters",
      "relating to the grades a student earns in school"
    ],
    correctAnswer: 1,
    explanation:
      "Civic responsibility concerns duties to the community, so 'relating to one's community' fits.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d4Passage1}

What conclusion can you draw about what the heroes had in common?`,
    options: [
      "Each cared about others and refused to accept what was wrong.",
      "Each became well-known by writing books about their experiences.",
      "Each lived in exactly the same area of Jamaica during the same era.",
      "Each was officially appointed as a leader by the government of their time."
    ],
    correctAnswer: 0,
    explanation:
      "Tanya realises the heroes shared caring for others and refusing to accept wrong, which is the conclusion.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Point of View",
    question: `${d4Passage1}

How does Tanya come to view civic responsibility by the end?`,
    options: [
      "As a duty that belongs only to teachers and school staff.",
      "As a topic that is far too difficult for young pupils to understand.",
      "As everyday brave choices, not only famous past deeds.",
      "As something that only National Heroes are truly able to practise."
    ],
    correctAnswer: 2,
    explanation:
      "Tanya decides civic responsibility is about small brave choices ordinary people make daily.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Inference",
    question: `${d4Passage2}

What can you infer about Marcus's first idea of being head boy?`,
    options: [
      "He thought it would be an easy way to avoid doing regular classwork.",
      "He believed the role would require him to teach the younger pupils every day.",
      "He thought the responsibilities would be too difficult for a student to handle.",
      "He thought it was mostly about having authority and a special badge."
    ],
    correctAnswer: 3,
    explanation:
      "He expected giving orders and a special badge, suggesting he first saw the role as authority and status.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d4Passage2}

What was the effect of Marcus's actions by the end of the term?`,
    options: [
      "The school decided to replace him with an older, more experienced pupil.",
      "More students joined his efforts than he had ever expected.",
      "The younger pupils stopped attending the school altogether.",
      "The broken gate forced the school yard to close for repairs."
    ],
    correctAnswer: 1,
    explanation:
      "The passage says more students joined his efforts than he had ever expected.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `${d4Passage2}

Which theme is best developed in the passage?`,
    options: [
      "True leadership means serving others, not standing above them.",
      "A good leader should avoid ordinary tasks to maintain the respect of others.",
      "Having an important title is enough to make someone a strong leader.",
      "Younger pupils should always be left to solve their own problems."
    ],
    correctAnswer: 0,
    explanation:
      "Marcus believes leadership means serving others, which the passage develops as its theme.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Supporting Details",
    question: `${d4Passage2}

Which detail shows Marcus took action to help younger pupils?`,
    options: [
      "He wore a special badge to show he was the head boy.",
      "He reported the dangerous, rusting gate to the school office.",
      "He started a weekly clean-up team for the school yard.",
      "He organised a buddy system to support them."
    ],
    correctAnswer: 3,
    explanation:
      "The buddy system is the action aimed specifically at supporting younger pupils. The clean-up and gate address other problems.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d4Passage1}

${d4Passage2}

How are Tanya's lesson and Marcus's experience alike?`,
    options: [
      "Both become head pupils of their respective schools to test their skills.",
      "Both study the lives of the Maroons in their history classes to find ideas.",
      "Both learn that serving others matters more than having a famous title.",
      "Both decide that taking on a leadership role is too much responsibility."
    ],
    correctAnswer: 2,
    explanation:
      "Both passages teach that caring for and serving others matters more than status. The other choices fit only one passage.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `${d4Passage2}

If a new problem appeared at school, what would Marcus most likely do?`,
    options: [
      "Step in to help and encourage others to join him.",
      "Wait for a teacher to notice and fix the problem alone.",
      "Ignore it because he believes leaders should avoid ordinary work.",
      "Complain to the principal that the problem is not his responsibility."
    ],
    correctAnswer: 0,
    explanation:
      "Marcus's pattern is to act and rally others, so he would likely help and encourage participation.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Text Evidence",
    question: `${d4Passage2}

Which sentence best supports the idea that Marcus led by example?`,
    options: [
      "He expected the role to be about giving orders and wearing a badge.",
      "He earns respect not by his title, but by the example he sets.",
      "The school gate was rusting dangerously and needed immediate repairs.",
      "Some classmates complained that he was doing too many ordinary chores."
    ],
    correctAnswer: 1,
    explanation:
      "The closing line directly states he earned respect through his example, supporting the idea.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d4Passage2}

Why did some classmates complain about Marcus?`,
    options: [
      "They believed he was not being strict enough with the younger pupils.",
      "They wanted to be chosen as head boy in his place.",
      "They felt that doing chores was beneath someone with his title.",
      "They thought the buddy system took too much time away from regular classes."
    ],
    correctAnswer: 2,
    explanation:
      "The text says classmates complained that a leader should not have to do ordinary chores.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question:
      "Which word is the closest synonym for \"courage\" as used in the first passage?",
    options: ["weakness", "silence", "doubt", "bravery"],
    correctAnswer: 3,
    explanation:
      "Courage means bravery, the willingness to face danger or difficulty.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question:
      "Marcus chose to serve rather than rule. Which word means the OPPOSITE of \"serve\" here?",
    options: ["assist", "dominate", "support", "help"],
    correctAnswer: 1,
    explanation:
      "To serve is to help others; its opposite here is to dominate or rule over them.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question:
      "The word \"unfairness\" begins with \"un-,\" meaning \"not.\" \"Unfairness\" describes a situation that is —",
    options: ["fully fair", "fair again", "not fair", "able to be fair"],
    correctAnswer: 2,
    explanation:
      "'Un-' means not, so unfairness is the state of not being fair.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question:
      "Add the suffix \"-ship\" to \"leader\" to name the role or quality. The correct word is —",
    options: ["leadership", "leading", "leaderly", "leaders"],
    correctAnswer: 0,
    explanation:
      "'-ship' forms 'leadership', meaning the position or quality of a leader.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question:
      "\"Marcus organised a buddy system to support younger pupils.\" Using context, \"support\" most nearly means —",
    options: ["help and encourage", "stand on top of", "argue against", "ignore completely"],
    correctAnswer: 0,
    explanation:
      "Supporting younger pupils means helping and encouraging them, shown by the buddy system.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question:
      "Which sentence uses \"example\" in the same way as \"the example he sets\"?",
    options: [
      "Give me one example of a noun, please.",
      "For example, oranges grow well in warm places.",
      "A good captain is an example for the whole team.",
      "This is just an example question on the practice test."
    ],
    correctAnswer: 2,
    explanation:
      "Here 'example' means a model others follow, as a captain is an example. The others mean a sample or instance.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: "Hero is to brave as coward is to —",
    options: ["kind", "fearful", "strong", "honest"],
    correctAnswer: 1,
    explanation:
      "A hero is brave; a coward is fearful, so 'fearful' completes the relationship.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question:
      "Which word could best replace \"admired\" in \"the heroes she admired\"?",
    options: ["respected", "feared", "forgot", "blamed"],
    correctAnswer: 0,
    explanation:
      "To admire someone is to respect them; 'respected' keeps the meaning.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the academic word \"responsibility\"?",
    options: [
      "a duty to act correctly or care for something",
      "a reward given for good behaviour",
      "a punishment for breaking a rule",
      "a story told about the past"
    ],
    correctAnswer: 0,
    explanation:
      "Responsibility is the duty to act correctly or to take care of something.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question:
      "Choose the best word: \"A good leader is willing to _____ others rather than command them.\"",
    options: ["scold", "avoid", "serve", "outrank"],
    correctAnswer: 2,
    explanation:
      "The passage's idea of leadership is serving others; 'serve' fits the meaning best.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "The teacher praised Marcus and I for our service.",
      "The teacher praised he and me for our service.",
      "The teacher praised I and Marcus for our service.",
      "The teacher praised Marcus and me for our service."
    ],
    correctAnswer: 3,
    explanation:
      "The pronoun is an object of 'praised', so the object form 'me' is correct.",
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The teacher honours the National Heroes each year.",
      "The teacher honour the National Heroes each year.",
      "The teacher honouring the National Heroes each year.",
      "The teacher are honours the National Heroes each year."
    ],
    correctAnswer: 0,
    explanation:
      "The singular subject \"teacher\" takes the singular verb \"honours.\"",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "Marcus reports the gate and started a clean-up team.",
      "Marcus reported the gate and starts a clean-up team.",
      "Marcus reported the gate and started a clean-up team.",
      "Marcus will report the gate and started a clean-up team."
    ],
    correctAnswer: 2,
    explanation:
      "Both verbs are past tense — reported and started — keeping the sentence consistent.",
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "On Heroes' Day, the class studied Jamaica's National Heroes.",
      "On Heroes' Day the class, studied Jamaica's National Heroes.",
      "On, Heroes' Day the class studied Jamaica's National Heroes.",
      "On Heroes' Day the class studied Jamaica's, National Heroes."
    ],
    correctAnswer: 0,
    explanation:
      "A comma follows the introductory phrase 'On Heroes' Day'.",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"Leadership means serving others,\" Marcus said.",
      "\"Leadership means serving others Marcus said.\"",
      "Leadership means serving others,\" Marcus said.",
      "\"Leadership means serving others\" Marcus said."
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
      "Marcus supported pupils, reporting the gate, and clean-ups were led.",
      "Marcus supported pupils, reported the gate, and led clean-ups.",
      "Marcus was supporting pupils, the gate, and led clean-ups.",
      "Marcus supported, to report the gate, and leading clean-ups."
    ],
    correctAnswer: 1,
    explanation:
      "The three actions share the same past-tense form: supported, reported, led.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The gate was rusting Marcus reported it to the office.",
      "The gate was rusting, Marcus reported it to the office.",
      "The gate was rusting, so Marcus reported it to the office.",
      "The gate rusting and Marcus reported it."
    ],
    correctAnswer: 2,
    explanation:
      "A comma plus 'so' correctly joins the two complete ideas.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "Although classmates complained, Marcus continued to serve the school.",
      "Classmates complained Marcus continued to serve the school.",
      "Complaining classmates but Marcus continued serving.",
      "Classmates complained, Marcus, continued to serve."
    ],
    correctAnswer: 0,
    explanation:
      "'Although' joins the contrasting ideas into one clear sentence.",
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question:
      "Which transition best completes the sentence? \"Marcus saw several problems; _____, he decided to act.\"",
    options: ["however", "therefore", "for example", "meanwhile"],
    correctAnswer: 1,
    explanation:
      "'Therefore' shows the result of seeing the problems — deciding to act.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question:
      "Which word choice is most precise? \"Marcus _____ a weekly clean-up team to keep the yard tidy.\"",
    options: ["got", "made up", "did", "organised"],
    correctAnswer: 3,
    explanation:
      "'Organised' precisely describes setting up a team; the others are vague.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Organisation",
    question:
      "A student is writing an essay about being a good citizen. Which sentence should come FIRST as a topic sentence?",
    options: [
      "For example, they pick up litter on the way to school.",
      "They also help classmates who are struggling with their work.",
      "Good citizens improve their community through small, everyday actions.",
      "Finally, they speak the truth even when it is difficult."
    ],
    correctAnswer: 2,
    explanation:
      "The topic sentence states the main idea; the others are supporting examples that follow it.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Supporting Detail",
    question:
      "Which detail best supports the idea that Marcus was a serving leader?",
    options: [
      "He started a buddy system and a clean-up team to help others.",
      "He was chosen as head boy of the school at the start of the term.",
      "He expected to wear a special badge to show his new position.",
      "Some classmates complained that he was doing too many ordinary chores."
    ],
    correctAnswer: 0,
    explanation:
      "Starting programmes to help others directly supports the claim of a serving leader.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question:
      "\"Marcus expected to give orders. _____ he found that leading meant helping.\" Which transition fits best?",
    options: ["Therefore,", "Instead,", "For example,", "Similarly,"],
    correctAnswer: 1,
    explanation:
      "'Instead' shows the contrast between what he expected and what he found.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question:
      "These sentences appear in an essay about civic responsibility. Which should be REMOVED?",
    options: [
      "Good citizens care deeply about the people around them.",
      "They are willing to speak up against unfairness when they see it.",
      "Even small, brave actions can slowly improve a whole community.",
      "Citizens may learn about national figures by reading biographies and visiting historical sites."
    ],
    correctAnswer: 3,
    explanation:
      "Learning about national figures is related to citizenship, but it does not develop the paragraph's focus on the actions and qualities of responsible citizens.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question:
      "Which sentence is the best conclusion for an essay about heroes and service?",
    options: [
      "Whether famous or ordinary, true heroes serve others and stand up for what is right.",
      "Jamaica's National Heroes and student leaders both show that leadership can influence other people.",
      "Heroes are remembered because their actions affect communities and sometimes the whole country.",
      "Learning about heroes can encourage young people to think about their own responsibilities as citizens."
    ],
    correctAnswer: 0,
    explanation:
      "A strong conclusion synthesises both passages around service and moral courage, as the first choice does.",
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

export default function G5LaDifficult4MockTest() {
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
    ? g5LaDifficult4Questions
    : g5LaDifficult4Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 4",
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
      ? prepareAssessment(g5LaDifficult4Questions)
      : preparePreview(g5LaDifficult4Questions, FREE_QUESTION_LIMIT);
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
                You completed the free preview for this test. Upgrade Access
                to unlock all 40 questions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Access
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
                Language Arts Difficult 4
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
                        Try {FREE_QUESTION_LIMIT} questions free. Upgrade Access to
                        unlock all 40.
                      </p>
                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade Access
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
              <p className="text-slate-600">Language Arts Difficult 4</p>
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
                    Upgrade Access to unlock all 40 questions.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade Access
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
              <h1 className="text-lg font-bold">Language Arts Difficult 4</h1>
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
                Upgrade Access to access the full test.
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
