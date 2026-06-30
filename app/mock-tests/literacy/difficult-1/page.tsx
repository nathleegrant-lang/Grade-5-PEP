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
   DIFFICULT 1  ·  Passage 1: Youth Entrepreneurship
                   Passage 2: Community Service Project
   ============================================================ */

const d1Passage1 = `Read the passage then answer the question.

"Twelve-year-old Kemar noticed that pupils at his school often went hungry because the tuck shop sold only sweets and sugary drinks. Instead of complaining, he surveyed forty classmates and learned that most of them wanted affordable, healthy snacks. Kemar used his savings to buy fruit and oats from a nearby farmer and began selling small bags of granola before school. His first batch sold out quickly, but several customers complained that the price was too high. Rather than ignore them, Kemar reduced the portion size, lowered the price, and kept a simple notebook recording his costs and profits. Within a month he earned enough to reinvest in supplies and even donate a little to the school garden. His teacher observed that Kemar's success came not from a clever idea alone, but from listening to customers, studying his numbers, and adjusting his plan whenever the evidence pointed to a problem."`;

const d1Passage2 = `Read the passage then answer the question.

"When flooding damaged the footbridge linking Rose Town to the main road, residents could no longer reach the clinic or market easily. A group of secondary students, led by sixteen-year-old Aaliyah, decided to act. They could not rebuild the bridge alone, so they organised the community instead: older residents described the original bridge, parents collected materials, and the students wrote letters asking a local hardware company for help. Some neighbours doubted that young people could manage such a project, yet Aaliyah insisted that the work belonged to everyone. The group divided the tasks, recorded every donation, and thanked each contributor in public. The rebuilt crossing was plain, but it reopened within three weeks. Aaliyah later explained that the bridge itself mattered less than what the village had discovered: that cooperation, careful planning, and respect for every contributor could solve a problem too large for any single person."`;

const g5LaDifficult1Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `${d1Passage1}

What is the main idea of the passage?`,
    options: [
      "Kemar succeeded by listening to feedback and adjusting his plan.",
      "The tuck shop refused to change its menu, so Kemar started his own business.",
      "Kemar became wealthy by selling healthy snacks to his classmates.",
      "A local farmer gave Kemar the idea to sell granola at the school."
    ],
    correctAnswer: 0,
    explanation:
      "The main idea is stated by the teacher at the end: success came from listening, studying the numbers, and adjusting. The other choices are either false or are small details, not the central point.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d1Passage1}

What caused Kemar to lower his price?`,
    options: [
      "He realised that making granola took too much of his time.",
      "The farmer told him the fruit was too expensive to buy.",
      "His teacher suggested that lower prices would attract more pupils.",
      "Several customers complained that the price was too high."
    ],
    correctAnswer: 3,
    explanation:
      "The passage links the price change directly to customer complaints. The other options name causes the text never mentions.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `${d1Passage1}

What can you infer about how Kemar makes decisions?`,
    options: [
      "He has saved enough money from his previous sales to cover any loss.",
      "He asks his teacher to step in and solve the problem for him.",
      "He quickly changes his plan based on what the customers are telling him.",
      "He depends mostly on luck instead of keeping careful records."
    ],
    correctAnswer: 2,
    explanation:
      "His survey, notebook, and willingness to adjust show evidence-based decisions rather than luck or relying on others.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Supporting Details",
    question: `${d1Passage1}

Which detail best shows that Kemar managed his business responsibly?`,
    options: [
      "He noticed that the tuck shop sold mostly sugary drinks to the pupils.",
      "He kept a notebook recording his costs and profits.",
      "He was only twelve years old when he started the business.",
      "His first batch of granola sold out very quickly on the first day."
    ],
    correctAnswer: 1,
    explanation:
      "Recording costs and profits is the clearest evidence of responsible management. The other details are true but do not show careful management.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d1Passage1}

In the passage, what does the word "reinvest" most nearly mean?`,
    options: [
      "to put money back into the business to keep it going",
      "to spend all of the profits on personal items right away",
      "to hide the extra money in a safe place at home",
      "to give the remaining earnings to a local charity"
    ],
    correctAnswer: 0,
    explanation:
      "The prefix 're-' means again, and the text says he earned enough to reinvest in supplies — putting earnings back into the business.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d1Passage1}

Why does the author include the teacher's observation at the end?`,
    options: [
      "To explain the step-by-step process of making granola from oats.",
      "To show that teachers should take over when a student struggles.",
      "To suggest that Kemar's idea was actually a failure in the end.",
      "To highlight the main reason Kemar's business worked."
    ],
    correctAnswer: 3,
    explanation:
      "The teacher's comment points to the lesson of the passage — success came from listening and adjusting. The other choices misread the purpose.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Prediction",
    question: `${d1Passage1}

If Kemar noticed that his profits were dropping even though sales stayed the same, what would he most likely do first?`,
    options: [
      "Assume that the pupils were simply tired of eating granola.",
      "Stop selling food altogether and return his supplies to the farmer.",
      "Raise the price sharply to make up for the money he was losing.",
      "Look closely at his costs to find out where the money was going."
    ],
    correctAnswer: 3,
    explanation:
      "Because he keeps a notebook of costs and profits, looking closely at his costs is the logical first step when profits drop despite steady sales.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `${d1Passage1}

Which sentence best supports the idea that Kemar cared about more than profit?`,
    options: [
      "He surveyed forty classmates to find out what they wanted to buy.",
      "He donated a little of his earnings to the school garden.",
      "His first batch of granola sold out on the very first day.",
      "He bought fruit and oats from a nearby farmer in the area."
    ],
    correctAnswer: 1,
    explanation:
      "Donating to the school garden shows concern beyond personal profit. The other details show business activity, not generosity.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Point of View",
    question: `${d1Passage2}

How does Aaliyah view the role of young people in the community?`,
    options: [
      "She believes young people can lead and that the work belongs to everyone.",
      "She thinks that young people should only help when adults ask them to.",
      "She feels that the bridge was too simple to be considered a real success.",
      "She wants the community to wait for the government to fix the bridge."
    ],
    correctAnswer: 0,
    explanation:
      "Aaliyah insists the work belonged to everyone and leads the effort, showing she values shared youth-led action.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `${d1Passage2}

Which theme is best developed in the passage?`,
    options: [
      "Cooperation and planning can solve problems too big for one person.",
      "Strong individuals should always work alone to get the best results.",
      "Communities should wait for the government to fix every problem.",
      "Young people should avoid difficult tasks until they are much older."
    ],
    correctAnswer: 0,
    explanation:
      "Aaliyah's closing reflection states the theme directly: cooperation and planning solved a problem too large for any single person.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d1Passage2}

What can you conclude about the doubting neighbours by the end?`,
    options: [
      "They were proven right because the rebuilt crossing was very plain.",
      "The completed bridge showed that their doubts were mistaken.",
      "They forced the students to stop working after the first week.",
      "They took over the project and finished it without the students."
    ],
    correctAnswer: 1,
    explanation:
      "The crossing reopened in three weeks despite the doubts, so the conclusion is that the doubters were proven wrong.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d1Passage1}

${d1Passage2}

What do Kemar's notebook and Aaliyah's record of donations have in common?`,
    options: [
      "Both show that keeping track of details helped make their projects successful.",
      "Both responded to a real problem with careful planning instead of complaint.",
      "Both were used to prove that adults could not be trusted with important tasks.",
      "Both were required by their teachers before they were allowed to start."
    ],
    correctAnswer: 0,
    explanation:
      "Kemar's notebook and Aaliyah's donation records both show how careful tracking contributed to their success.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d1Passage2}

Why did the residents struggle after the flooding?`,
    options: [
      "The flooding destroyed the clinic and the market completely.",
      "The hardware company refused to donate any materials to the town.",
      "The students decided to move away from Rose Town for their safety.",
      "The damaged footbridge made it hard to reach the clinic and market."
    ],
    correctAnswer: 3,
    explanation:
      "The text says the damaged bridge cut off easy access to the clinic and market. The other options state things the passage never says.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Supporting Details",
    question: `${d1Passage2}

Which detail shows the students valued every helper?`,
    options: [
      "They recorded every donation and thanked each contributor in public.",
      "They wrote letters to a local hardware company asking for supplies.",
      "They made sure that adults were not allowed to help with the work.",
      "The rebuilt crossing was finished and reopened within three weeks."
    ],
    correctAnswer: 0,
    explanation:
      "Recording donations and publicly thanking contributors shows they valued every helper. The other details describe the process, not gratitude.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Inference",
    question: `${d1Passage2}

Why does Aaliyah say the bridge itself "mattered less" than what the village discovered?`,
    options: [
      "Bridges should always be built from expensive materials to last a long time.",
      "She realised that the real achievement was learning how to work together.",
      "She was disappointed that the crossing did not look as good as the old one.",
      "She wanted to make sure the hardware company did not take the credit."
    ],
    correctAnswer: 1,
    explanation:
      "She says the bridge mattered less than what the village discovered about cooperation, implying the process mattered most.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question:
      "In the sentence \"Kemar surveyed his classmates,\" which word is the closest synonym for \"surveyed\"?",
    options: ["observed", "ignored", "comforted", "questioned"],
    correctAnswer: 3,
    explanation:
      "To survey people is to question or poll them, so 'questioned' is the closest match.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question:
      "Some neighbours \"doubted\" the students. Which word means the OPPOSITE of \"doubted\"?",
    options: ["trusted", "feared", "delayed", "questioned"],
    correctAnswer: 0,
    explanation:
      "Doubt means a lack of belief, so its opposite is to trust or believe. 'Questioned' is a near-synonym, not an antonym.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question:
      "The prefix in \"reinvest\" means \"again.\" Which word also uses this prefix to mean doing something again?",
    options: ["remove", "react", "rebuild", "relax"],
    correctAnswer: 2,
    explanation:
      "'Rebuild' means to build again, matching the 'again' meaning. In 'remove', 're-' means back, not again.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Context Clues",
    question:
      "\"The crossing was plain, but it reopened within three weeks.\" In this sentence, \"plain\" most nearly means —",
    options: ["flat", "simple", "honest", "clear"],
    correctAnswer: 1,
    explanation:
      "Describing a bridge as plain here means simple or basic. The contrast with 'reopened' shows it worked despite being simple.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question:
      "Which sentence uses \"batch\" in the same way as \"His first batch of granola sold out\"?",
    options: [
      "The teacher placed the students in a batch for the art project.",
      "The rain fell in a heavy batch during the night.",
      "The baker pulled a fresh batch of bread from the oven.",
      "Aaliyah wrote a batch to the hardware company asking for help."
    ],
    correctAnswer: 2,
    explanation:
      "A 'batch' is a quantity made at one time, as with bread. The other sentences misuse the word.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Suffix",
    question:
      "Add a suffix to \"donate\" to name the act of giving. The correct word is —",
    options: ["donating", "donated", "donates", "donation"],
    correctAnswer: 3,
    explanation:
      "The suffix '-ion' turns the verb 'donate' into the noun 'donation', the name of the act.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question:
      "Profit is to gain as loss is to —",
    options: ["savings", "shortfall", "donation", "supply"],
    correctAnswer: 1,
    explanation:
      "Profit means a gain, so the matching pair for loss is a shortfall, which means money missing or lost.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question:
      "Which word could best replace \"organised\" in \"they organised the community\" without changing the meaning?",
    options: ["coordinated", "scattered", "ignored", "interrupted"],
    correctAnswer: 0,
    explanation:
      "Organising the community means coordinating people to act together; 'coordinated' keeps the meaning.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question:
      "Which meaning best fits the academic word \"contributor\"?",
    options: [
      "a person who watches a project but never offers any help",
      "a person who is paid to manage a shop or a business",
      "a person who gives help, money, or effort to something",
      "a person who refuses to join a group or support a cause"
    ],
    correctAnswer: 2,
    explanation:
      "A contributor is one who contributes — gives help, money, or effort to a shared effort.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question:
      "Choose the best word: \"Because the evidence was clear, Kemar felt _____ in changing his plan.\"",
    options: ["confused", "careless", "fearful", "confident"],
    correctAnswer: 3,
    explanation:
      "Clear evidence would make someone feel confident. The other words contradict having clear information.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The group of students record every donation carefully.",
      "The group of students records every donation carefully.",
      "The group of students recording every donation carefully.",
      "The group of students were records every donation carefully."
    ],
    correctAnswer: 1,
    explanation:
      "The subject 'group' is singular and takes the singular verb 'records', even though 'students' follows it.",
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the verb tense consistent?",
    options: [
      "Last week Kemar surveys his class and lowered his prices.",
      "Last week Kemar will survey his class and lowered his prices.",
      "Last week Kemar surveyed his class and lowered his prices.",
      "Last week Kemar surveyed his class and lowers his prices."
    ],
    correctAnswer: 2,
    explanation:
      "'Last week' signals the past, so both verbs must be past tense: surveyed and lowered.",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "Aaliyah and her wrote letters to the hardware company.",
      "Her and Aaliyah wrote letters to the hardware company.",
      "Aaliyah and herself wrote letters to the hardware company.",
      "Aaliyah and she wrote letters to the hardware company."
    ],
    correctAnswer: 3,
    explanation:
      "The pronoun is a subject doing the writing, so the subject form 'she' is correct.",
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "After the flood damaged the bridge, the residents needed help.",
      "After the flood damaged the bridge the residents, needed help.",
      "After, the flood damaged the bridge the residents needed help.",
      "After the flood, damaged the bridge the residents needed help."
    ],
    correctAnswer: 0,
    explanation:
      "A comma belongs after the introductory clause 'After the flood damaged the bridge'.",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"The work belongs to everyone Aaliyah said.\"",
      "The work belongs to everyone,\" Aaliyah said.",
      "\"The work belongs to everyone,\" Aaliyah said.",
      "\"The work belongs to everyone\" Aaliyah said?"
    ],
    correctAnswer: 2,
    explanation:
      "The spoken words sit inside the quotation marks with a comma before the closing mark and the tag.",
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "Kemar bought supplies, recording costs, and profits were donated.",
      "Kemar bought supplies, recorded costs, and donated profits.",
      "Kemar bought his supplies, recorded the costs, and donated his profits.",
      "Kemar bought, to record costs, and donating profits."
    ],
    correctAnswer: 1,
    explanation:
      "The three actions share the same past-tense form: bought, recorded, donated.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The bridge was damaged the students decided to act.",
      "The bridge was damaged, the students decided to act.",
      "The bridge was damaged, and the students decided to act.",
      "The bridge was damaged, so the students decided to act."
    ],
    correctAnswer: 3,
    explanation:
      "A comma plus 'so' correctly joins the two complete ideas as cause and effect.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "Although the project seemed large, the community completed it together.",
      "The project seemed large the community completed it together.",
      "Although the project seemed large, it was completed by the community together.",
      "The project seemed large, but the community, it was completed by them."
    ],
    correctAnswer: 0,
    explanation:
      "'Although' joins the contrasting ideas into one clear, correct sentence.",
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question:
      "Which transition best completes the sentence? \"Kemar's price was too high; _____, he lowered it.\"",
    options: ["however", "for example", "therefore", "meanwhile"],
    correctAnswer: 2,
    explanation:
      "'Therefore' shows the result of the high price. The high price caused the lowering, so a cause-result transition fits.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Clarity",
    question: "Which sentence is the clearest and most precise?",
    options: [
      "The students made some letters that were about the materials they needed from the company.",
      "The students wrote letters asking the company for building materials.",
      "Letters were written by the students to the company for the purpose of materials.",
      "The students and the company and the letters and the materials were all connected."
    ],
    correctAnswer: 1,
    explanation:
      "Precise nouns and verbs make the second sentence clear; the others are vague, wordy, or confusing.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Best Introduction",
    question:
      "Which sentence is the best introduction for an essay about young people solving community problems?",
    options: [
      "Young people often face many different problems in their communities today.",
      "In this essay, I am going to write about two young people who did things.",
      "Careful planning and teamwork allow young people to solve difficult community problems.",
      "There are many young people, and some of them live in places with bridges and shops."
    ],
    correctAnswer: 2,
    explanation:
      "A strong introduction states a clear, specific main idea that previews the essay. The others are vague or off-topic.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Supporting Detail",
    question:
      "Which detail best supports the idea that Kemar ran his business carefully?",
    options: [
      "He was twelve years old and went to a primary school in his neighbourhood.",
      "Granola can be made from fruit and oats mixed together in a simple way.",
      "Some pupils at the school liked buying sugary drinks from the tuck shop.",
      "He kept a notebook of costs and profits and adjusted his plan when needed."
    ],
    correctAnswer: 3,
    explanation:
      "Tracking costs and adjusting the plan directly supports the claim of careful management; the others are unrelated facts.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question:
      "Read these sentences: \"Some neighbours doubted the students. _____ the bridge reopened in three weeks.\" Which transition fits best?",
    options: ["For instance,", "Similarly,", "Nevertheless,", "In addition,"],
    correctAnswer: 2,
    explanation:
      "The result contrasts with the doubt, so 'Nevertheless' (showing contrast) is the best transition.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question:
      "A report on the bridge project includes these sentences. Which one should be REMOVED to keep the report focused?",
    options: [
      "The students wrote letters requesting materials from a local hardware store.",
      "Parents helped to collect the necessary supplies for the building work.",
      "Aaliyah's favourite colour is bright green, which she also painted her room.",
      "The new crossing reopened for the whole community within three short weeks."
    ],
    correctAnswer: 2,
    explanation:
      "Aaliyah's favourite colour has nothing to do with the project and should be removed; the others all advance the report.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question:
      "Which sentence is the best conclusion for an essay about these two projects?",
    options: [
      "As you can see, bridges and granola are two things that can help a town.",
      "Both stories show that planning and teamwork let young people make a real difference.",
      "In conclusion, these two projects happened and then they were completely finished.",
      "To sum up, young people should always try to help out when they see a problem."
    ],
    correctAnswer: 1,
    explanation:
      "A strong conclusion restates the main idea with purpose; the first choice ties both examples to the central point.",
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
