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

const recyclingPassage = `Read the passage then answer the question.

"At Hopefield Primary, the Grade 5 environmental club noticed that many plastic bottles and juice boxes were being thrown into the same bins as lunch scraps. After speaking with the principal, the club launched a school recycling programme. First, members placed labelled containers near the canteen, classrooms, and playing field. Next, they explained at devotion why clean paper, bottles, and cans should be separated from food waste. Some pupils forgot at first, so the club created bright reminder posters and appointed two monitors for each lunch period.

By the end of the first month, the school had collected twelve large bags of recyclable materials. The caretaker said the compound looked tidier, and the canteen workers found fewer bottles mixed with garbage. However, the club learned that recycling was not only about collecting items. They had to rinse containers, flatten boxes, and keep careful records before the parish recycling truck arrived on Fridays. Although the work required patience, the pupils felt proud because their small actions helped protect gullies, beaches, and marine life around Jamaica."`;

const gardenPassage = `Read the passage then answer the question.

"Beside the community centre in Linstead was an empty lot where weeds grew taller than the fence. During a citizens' association meeting, Mrs. Campbell suggested turning the space into a community garden. At first, some residents doubted the plan because the soil was dry and the area had little shade. Still, volunteers arrived the following Saturday with forks, gloves, seedlings, and two drums for storing rainwater. The youth club cleared stones while older farmers showed children how to mix compost into the soil.

Over the next six weeks, the garden slowly changed. Rows of callaloo, tomato, pepper, and thyme appeared where rubbish had once been scattered. Families agreed on a watering schedule, and a carpenter built a small sign asking visitors not to trample the beds. When the first vegetables were ready, the group shared them with elderly residents and sold a few bundles to buy more seeds. The project did more than provide food. It gave neighbours a reason to work together, taught children practical skills, and turned an ignored space into a place of pride."`;

const g5LaModerate1Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `${recyclingPassage}\n\nWhat is the main idea of the passage?`,
    options: [
      "A student club starts and maintains a recycling programme that improves the school environment.",
      "The school canteen stops selling drinks because pupils make too much waste.",
      "The parish truck visits Hopefield Primary every day to collect lunch scraps.",
      "The principal teaches Grade 5 pupils how to build new classrooms.",
    ],
    correctAnswer: 0,
    explanation: `The passage focuses on how the environmental club organises recycling and how the programme helps the school and wider environment.`,
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${recyclingPassage}\n\nWhere did club members place labelled containers?`,
    options: [
      "Only inside the principal's office",
      "Near the canteen, classrooms, and playing field",
      "Beside the parish recycling truck",
      "At the beach and near the gullies",
    ],
    correctAnswer: 1,
    explanation: `The passage states that labelled containers were placed near the canteen, classrooms, and playing field.`,
  },
  {
    id: 3,
    type: "reading",
    skill: "Sequence",
    question: `${recyclingPassage}\n\nWhat happened after some pupils forgot to use the bins correctly?`,
    options: [
      "The recycling programme ended immediately.",
      "The caretaker removed all the containers.",
      "The club made reminder posters and appointed lunch-period monitors.",
      "The principal cancelled devotion for the week.",
    ],
    correctAnswer: 2,
    explanation: `After pupils forgot, the club responded by making bright posters and appointing monitors.`,
  },
  {
    id: 4,
    type: "reading",
    skill: "Cause and Effect",
    question: `${recyclingPassage}\n\nWhat was one effect of the recycling programme by the end of the first month?`,
    options: [
      "The school stopped producing any waste at all.",
      "Every pupil joined the environmental club.",
      "The canteen workers refused to help.",
      "The school collected twelve large bags of recyclable materials.",
    ],
    correctAnswer: 3,
    explanation: `The passage directly says twelve large bags of recyclable materials had been collected by the end of the first month.`,
  },
  {
    id: 5,
    type: "reading",
    skill: "Inference",
    question: `${recyclingPassage}\n\nWhat can the reader infer about the environmental club members?`,
    options: [
      "They were organised and willing to solve problems.",
      "They wanted to avoid doing any extra work.",
      "They thought posters were more important than recycling.",
      "They expected the caretaker to do everything alone.",
    ],
    correctAnswer: 0,
    explanation: `They planned locations, explained the programme, made posters, used monitors, rinsed items, and kept records, showing organisation and effort.`,
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${recyclingPassage}\n\nIn the passage, what does compound most nearly mean?`,
    options: [
      "A mixture used in science class",
      "The school grounds or property",
      "A difficult mathematics problem",
      "A container for plastic bottles",
    ],
    correctAnswer: 1,
    explanation: `The caretaker says the compound looked tidier, so compound means the school grounds or property.`,
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: `${recyclingPassage}\n\nWhy did the author most likely write this passage?`,
    options: [
      "To entertain readers with a fantasy about talking bottles",
      "To persuade pupils to stop eating lunch at school",
      "To inform readers how pupils created a useful recycling programme",
      "To explain how trucks are repaired on Fridays",
    ],
    correctAnswer: 2,
    explanation: `The author explains the steps and results of a school recycling programme, so the purpose is mainly to inform.`,
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `${recyclingPassage}\n\nWhich detail BEST supports the idea that recycling required more than placing items in bins?`,
    options: [
      "The programme began after speaking with the principal.",
      "Containers were placed near the playing field.",
      "The school collected twelve large bags in one month.",
      "Pupils had to rinse containers, flatten boxes, and keep records.",
    ],
    correctAnswer: 3,
    explanation: `This detail proves that extra preparation and record keeping were needed after items were collected.`,
  },
  {
    id: 9,
    type: "reading",
    skill: "Theme",
    question: `${gardenPassage}\n\nWhich theme is MOST strongly shown in the community garden passage?`,
    options: [
      "Working together can turn a problem into something valuable.",
      "Empty lots should always remain untouched.",
      "Children should never learn from older people.",
      "Vegetables grow best when no one cares for them.",
    ],
    correctAnswer: 0,
    explanation: `Residents cooperate to transform an ignored lot into a productive garden, showing the value of teamwork.`,
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Details",
    question: `${gardenPassage}\n\nWhat did volunteers bring on the first Saturday?`,
    options: [
      "Paint, desks, and library books",
      "Forks, gloves, seedlings, and two drums for rainwater",
      "A new fence and playground swings",
      "Bags of cooked food for sale",
    ],
    correctAnswer: 1,
    explanation: `The passage lists forks, gloves, seedlings, and two drums for storing rainwater.`,
  },
  {
    id: 11,
    type: "reading",
    skill: "Point of View",
    question: `${gardenPassage}\n\nFrom which point of view is the passage told?`,
    options: [
      "First person, by Mrs. Campbell",
      "Second person, giving direct instructions",
      "Third person, by a narrator outside the events",
      "First person, by a child in the youth club",
    ],
    correctAnswer: 2,
    explanation: `The narrator uses names and words such as residents, volunteers, and they, showing third-person narration.`,
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `${gardenPassage}\n\nWhy did some residents probably doubt the plan at first?`,
    options: [
      "They disliked all vegetables from Linstead.",
      "They had already built a garden there.",
      "They wanted the youth club to leave the community.",
      "The lot seemed difficult to use because it was dry, weedy, and had little shade.",
    ],
    correctAnswer: 3,
    explanation: `The dry soil, tall weeds, and lack of shade made the project seem challenging.`,
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `${gardenPassage}\n\nWhat happened when the first vegetables were ready?`,
    options: [
      "The group shared some with elderly residents and sold a few bundles for more seeds.",
      "The carpenter removed the sign from the garden.",
      "The citizens' association closed the community centre.",
      "The children stopped learning practical skills.",
    ],
    correctAnswer: 0,
    explanation: `The passage says the vegetables were shared with elderly residents and some were sold to buy more seeds.`,
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${gardenPassage}\n\nWhat does trample mean in the sentence about the garden sign?`,
    options: [
      "Water carefully in the morning",
      "Step heavily on and damage",
      "Plant neatly in rows",
      "Share fairly with neighbours",
    ],
    correctAnswer: 1,
    explanation: `The sign asks visitors not to trample the beds, meaning not to step on and damage the plants.`,
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Evidence",
    question: `${gardenPassage}\n\nWhich sentence BEST shows that the garden benefited the community in more than one way?`,
    options: [
      "Beside the community centre was an empty lot.",
      "Some residents doubted the plan.",
      "The youth club cleared stones.",
      "It provided food, encouraged teamwork, taught skills, and created pride.",
    ],
    correctAnswer: 3,
    explanation: `This option combines several benefits named at the end of the passage.`,
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `In the sentence, "The recycling monitors reminded pupils to separate bottles from lunch scraps," what does separate mean?`,
    options: [
      "to keep apart",
      "to decorate brightly",
      "to count quickly",
      "to throw away secretly",
    ],
    correctAnswer: 0,
    explanation: `To separate items is to keep them apart or place them into different groups.`,
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `The garden slowly changed from an ignored lot into a place of pride. What does ignored mean?`,
    options: [
      "washed every morning",
      "not noticed or cared for",
      "covered with expensive tiles",
      "visited by tourists daily",
    ],
    correctAnswer: 1,
    explanation: `An ignored place is one that people do not notice, value, or care for.`,
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Context Clues",
    question: `"The club launched a recycling programme after receiving permission." Which word could replace launched?`,
    options: ["ended", "hid", "started", "forgot"],
    correctAnswer: 2,
    explanation: `In this context, launched means started or began.`,
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `"The volunteers stored rainwater in drums during the dry week." What are drums in this sentence?`,
    options: [
      "musical instruments used at festival",
      "deep holes in the soil",
      "painted signs for visitors",
      "large containers for holding liquid",
    ],
    correctAnswer: 3,
    explanation: `Because rainwater was stored in them, drums means large containers.`,
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Synonyms in Context",
    question: `Which word is closest in meaning to tidy in "the compound looked tidier"?`,
    options: ["neater", "louder", "heavier", "drier"],
    correctAnswer: 0,
    explanation: `Tidier means cleaner or neater in appearance.`,
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Antonyms in Context",
    question: `Which word is the opposite of doubted in "some residents doubted the plan"?`,
    options: ["questioned", "trusted", "delayed", "measured"],
    correctAnswer: 1,
    explanation: `To doubt is to feel unsure; to trust or believe is the opposite in this context.`,
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `"The club appointed two monitors for each lunch period." What does appointed mean?`,
    options: ["painted", "ignored", "chosen for a duty", "sent home early"],
    correctAnswer: 2,
    explanation: `Appointed means selected or chosen to perform a role.`,
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `"The project gave neighbours a reason to work together." Which word best describes neighbours in this sentence?`,
    options: [
      "strangers from another country",
      "only the youngest pupils",
      "tools used for farming",
      "people who live near one another",
    ],
    correctAnswer: 3,
    explanation: `Neighbours are people who live near each other in a community.`,
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Connotation",
    question: `Which word has the most positive meaning in the sentence, "The pupils felt ___ of their small actions"?`,
    options: ["proud", "annoyed", "careless", "ashamed"],
    correctAnswer: 0,
    explanation: `Proud is positive and fits the idea that pupils valued their helpful work.`,
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `"The farmers showed children how to mix compost into the soil." Compost is best understood as:`,
    options: [
      "a plastic sign",
      "decayed plant material used to enrich soil",
      "a type of school uniform",
      "a sharp tool for cutting metal",
    ],
    correctAnswer: 1,
    explanation: `Compost is organic material added to soil to help plants grow.`,
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct sentence for a report about the recycling programme.`,
    options: [
      "The pupils separates bottles every Friday.",
      "The pupils was separating bottles every Friday.",
      "The pupils separate bottles every Friday.",
      "The pupils is separating bottles every Friday.",
    ],
    correctAnswer: 2,
    explanation: `The plural subject pupils needs the plural verb separate.`,
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the sentence that correctly uses past tense.`,
    options: [
      "Yesterday, the youth club clear stones from the empty lot.",
      "Yesterday, the youth club will clear stones from the empty lot.",
      "Yesterday, the youth club is clearing stones from the empty lot.",
      "Yesterday, the youth club cleared stones from the empty lot.",
    ],
    correctAnswer: 3,
    explanation: `Yesterday signals past time, so cleared is correct.`,
  },
  {
    id: 28,
    type: "grammar",
    skill: "Commas in a Series",
    question: `Which sentence uses commas correctly?`,
    options: [
      "The garden grew callaloo, tomato, pepper, and thyme.",
      "The garden grew callaloo tomato, pepper and, thyme.",
      "The garden grew, callaloo tomato pepper and thyme.",
      "The garden, grew callaloo, tomato pepper and thyme.",
    ],
    correctAnswer: 0,
    explanation: `Commas correctly separate the items in the list: callaloo, tomato, pepper, and thyme.`,
  },
  {
    id: 29,
    type: "grammar",
    skill: "Pronoun Reference",
    question: `Choose the pronoun that correctly completes the sentence: "Mrs. Campbell shared ___ idea at the meeting."`,
    options: ["their", "her", "his", "its"],
    correctAnswer: 1,
    explanation: `Mrs. Campbell is one female person, so her is the correct pronoun.`,
  },
  {
    id: 30,
    type: "grammar",
    skill: "Complex Sentence",
    question: `Which option best joins the ideas into one complex sentence? "The soil was dry. Volunteers still planted seedlings."`,
    options: [
      "The soil was dry volunteers still planted seedlings.",
      "Although the soil was dry, volunteers still planted seedlings.",
      "The soil was dry, and, because volunteers still planted seedlings.",
      "Volunteers still planted seedlings the soil was dry although.",
    ],
    correctAnswer: 1,
    explanation: `Although creates a clear complex sentence showing contrast between the dry soil and the volunteers' action.`,
  },
  {
    id: 31,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      "Mrs. Campbell said, Let us plant callaloo.",
      "\"Mrs. Campbell said, Let us plant callaloo.\"",
      "Mrs. Campbell said, \"Let us plant callaloo.\"",
      "Mrs. Campbell said, \"Let us plant callaloo.",
    ],
    correctAnswer: 2,
    explanation: `The exact words spoken are enclosed in quotation marks, with punctuation inside the closing mark.`,
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Fragment",
    question: `Which option is a complete sentence?`,
    options: [
      "Because the recycling truck arrived on Friday.",
      "After the pupils rinsed the bottles.",
      "Near the canteen and playing field.",
      "The monitors checked the bins after lunch.",
    ],
    correctAnswer: 3,
    explanation: `This option has a subject, verb, and complete thought.`,
  },
  {
    id: 33,
    type: "grammar",
    skill: "Adjectives",
    question: `Choose the adjective that best completes the sentence: "The ___ posters reminded pupils where to place bottles."`,
    options: ["bright", "quickly", "collect", "Friday"],
    correctAnswer: 0,
    explanation: `Bright describes the noun posters, so it functions as an adjective.`,
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transition Words",
    question: `Which transition best completes the sentence? "The club labelled the bins. ___, members explained the rules at devotion."`,
    options: ["Never", "Next", "Under", "Almost"],
    correctAnswer: 1,
    explanation: `Next shows the order of steps in the programme.`,
  },
  {
    id: 35,
    type: "grammar",
    skill: "Apostrophes",
    question: `Which sentence uses an apostrophe correctly?`,
    options: [
      "The pupils poster's were bright.",
      "The pupil's shared their bottles.",
      "The clubs' is meeting today.",
      "The club's posters were bright.",
    ],
    correctAnswer: 3,
    explanation: `Club's correctly shows that the posters belonged to one club.`,
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which topic sentence best begins a paragraph about the community garden?`,
    options: [
      "The community garden improved the neighbourhood in several important ways.",
      "Volunteers brought tools, seedlings, and rainwater drums to the empty lot.",
      "Families shared some of the first vegetables with elderly residents.",
      "A carpenter built a sign asking visitors not to trample the beds.",
    ],
    correctAnswer: 0,
    explanation: `This sentence introduces the main idea that the paragraph can develop with several benefits of the garden.`,
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `A pupil writes, "Recycling helps our school." Which detail best supports this idea?`,
    options: [
      "The programme reduced bottles mixed with garbage and made the compound tidier.",
      "The environmental club placed labelled containers around the school.",
      "The parish recycling truck arrived on Fridays.",
      "Pupils rinsed containers before the materials were collected.",
    ],
    correctAnswer: 0,
    explanation: `This detail directly explains how recycling helped the school.`,
  },
  {
    id: 38,
    type: "writing",
    skill: "Organization",
    question: `Which order is best for a paragraph explaining how the recycling programme began?`,
    options: [
      "Collect bags; ask permission; notice the problem; place bins",
      "Place bins; collect bags; notice the problem; ask permission",
      "Notice the problem; ask permission; place labelled bins; explain the rules",
      "Explain the rules; sell vegetables; build a sign; rinse bottles",
    ],
    correctAnswer: 2,
    explanation: `This order follows the logical sequence from identifying the problem to starting and explaining the programme.`,
  },
  {
    id: 39,
    type: "writing",
    skill: "Transitions",
    question: `Which transition best shows a result? "The monitors reminded pupils daily; ___, fewer bottles were mixed with garbage."`,
    options: ["for example", "before", "nearby", "as a result"],
    correctAnswer: 3,
    explanation: `As a result shows that fewer mixed bottles happened because of the reminders.`,
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision",
    question: `Choose the best revision of this sentence: "The garden was good and helped people and it was nice."`,
    options: [
      "The garden strengthened the community by providing food, teaching skills, and creating pride.",
      "The garden was useful because it helped people in the community.",
      "The garden was a good project that brought neighbours together.",
      "The garden helped people, and many residents were pleased with it.",
    ],
    correctAnswer: 0,
    explanation: `The best revision is clear and specific, naming exactly how the garden helped the community.`,
  },
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

export default function G5LaModerate1MockTest() {
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
    ? g5LaModerate1Questions
    : g5LaModerate1Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 1",
      difficulty: "Moderate",
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
      ? prepareAssessment(g5LaModerate1Questions)
      : preparePreview(g5LaModerate1Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 1
              </CardTitle>
              <p className="text-slate-600">
                Grade 5 PEP Language Arts · Moderate Level
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
              <p className="text-slate-600">Language Arts Moderate 1</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 1</h1>
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
