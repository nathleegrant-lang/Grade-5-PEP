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

const hurricanePassage = `Read the passage then answer the question.

"At the start of hurricane season, the principal of Cedar Grove Primary invited the parish disaster coordinator to speak at devotion. She told pupils that preparedness begins before dark clouds appear. Families should listen to official weather reports, store clean water, check flashlights, and keep important documents in a waterproof bag. She also explained that trimming weak branches and clearing drains could reduce damage when heavy rain arrived.

Grade 5 decided to create a hurricane readiness checklist for their homes. In groups, pupils listed supplies such as canned food, batteries, a first-aid kit, and medicine for family members who needed it. They also drew a simple map showing the safest room in a house and the nearest community shelter. At first, Jason thought the activity was only another school assignment. That evening, however, he noticed that his grandmother's radio had no batteries and that a drain behind the house was blocked with leaves. His family fixed both problems before the weekend. When a tropical storm passed near Jamaica two weeks later, Cedar Grove families felt calmer because they had already planned. The pupils learned that preparation does not stop every danger, but it can help people respond wisely and protect one another."`;

const resiliencePassage = `Read the passage then answer the question.

"After three days of heavy rain, the river near Bell Plain rose over its banks and covered the main road with muddy water. Although the flood damaged some gardens and forced school to close for two days, residents quickly began helping one another. The community emergency team checked on elderly neighbours first. Then volunteers used wheelbarrows to move wet furniture into the sun and shared cooked meals at the church hall.

The clean-up was not easy. Silt covered yards, and several families needed safe drinking water. Instead of waiting for one person to solve every problem, the citizens' association divided the work. Young adults cleared small drains, farmers lent tools, and teachers organised children to sort donated clothing by size. The health nurse reminded everyone to wash hands often and avoid playing in dirty water. By the next week, most families had returned home, and the school reopened with a short assembly about safety. Bell Plain did more than repair buildings; it strengthened trust among neighbours. Residents decided to plant vetiver grass along the riverbank and practise an emergency drill each term. Their response showed community resilience: the ability to recover, learn, and prepare better for the future."`;

const g5LaModerate4Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `${hurricanePassage}\n\nWhich statement best tells what the hurricane preparedness passage is mainly about?`,
    options: ["Cedar Grove pupils learn that planning before a storm helps families respond safely.", "Jason’s grandmother buys a new radio after a tropical storm passes.", "A disaster coordinator explains why all drains in Jamaica are blocked.", "Grade 5 pupils visit every community shelter in the parish."],
    correctAnswer: 0,
    explanation: "The whole passage shows the coordinator, checklist activity, Jason’s discoveries, and the later storm proving that early planning helps families respond wisely.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${hurricanePassage}\n\nAccording to the coordinator, what should families keep in a waterproof bag?`,
    options: ["Important documents", "Canned food and batteries", "A map of the school grounds", "Branches trimmed from trees"],
    correctAnswer: 0,
    explanation: "The coordinator specifically says families should keep important documents in a waterproof bag.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Sequence",
    question: `${hurricanePassage}\n\nWhat did Jason do after he first thought the checklist was only another school assignment?`,
    options: ["He noticed the radio had no batteries and a drain was blocked at home.", "He drew the map of the nearest community shelter during devotion.", "He invited the parish disaster coordinator back to school.", "He waited until the tropical storm arrived to begin planning."],
    correctAnswer: 0,
    explanation: "After school, Jason saw two real problems at home: his grandmother’s radio had no batteries and the drain behind the house was blocked.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Cause and Effect",
    question: `${hurricanePassage}\n\nWhy did Cedar Grove families feel calmer when a tropical storm passed near Jamaica?`,
    options: ["They had already checked supplies, solved problems, and made plans.", "The storm destroyed the community shelter before it reached them.", "The principal cancelled the checklist before pupils took it home.", "They learned that preparation could stop every danger completely."],
    correctAnswer: 0,
    explanation: "The passage says families felt calmer because they had already planned before the tropical storm passed near Jamaica.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Inference",
    question: `${hurricanePassage}\n\nWhy did Jason’s opinion about the activity most likely change?`,
    options: ["He saw that the school checklist helped his own family find and fix real safety problems.", "He learned that school assignments never affect life at home.", "He discovered that hurricane season had already ended.", "He was told that only his grandmother needed to prepare."],
    correctAnswer: 0,
    explanation: "Jason first dismissed the activity, but at home the checklist helped him notice missing batteries and a blocked drain, so it became useful to him.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${hurricanePassage}\n\nIn the passage, what does “preparedness” most nearly mean?`,
    options: ["Being ready before a possible danger happens", "Being surprised after every problem is solved", "Being careless when the weather is calm", "Being certain no storm will ever cause damage"],
    correctAnswer: 0,
    explanation: "The coordinator explains preparedness as actions done before dark clouds appear, such as storing water and checking flashlights.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Text Evidence",
    question: `${hurricanePassage}\n\nWhich detail best supports the idea that Grade 5 connected the lesson to their own homes?`,
    options: ["Jason found his grandmother’s radio had no batteries and the drain behind the house was blocked.", "The principal invited the parish disaster coordinator to devotion.", "The coordinator spoke about official weather reports.", "The pupils learned the word preparation at school."],
    correctAnswer: 0,
    explanation: "Jason’s discoveries at home are the clearest evidence that the classroom checklist was applied to a real household.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Supporting Details",
    question: `${hurricanePassage}\n\nWhich pair of supplies did the pupils include on their readiness checklist?`,
    options: ["Canned food and a first-aid kit", "Kites and cricket bats", "Paint and gardening gloves", "Textbooks and report cards"],
    correctAnswer: 0,
    explanation: "The passage lists supplies including canned food, batteries, a first-aid kit, and medicine.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Sequence",
    question: `${hurricanePassage}\n\nWhat happened immediately after Jason’s family found the radio and drain problems?`,
    options: ["They fixed both problems before the weekend.", "The tropical storm passed near Jamaica two weeks earlier.", "The school reopened with a safety assembly.", "The coordinator drew a map of Jason’s house."],
    correctAnswer: 0,
    explanation: "The passage states that Jason’s family fixed both problems before the weekend.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `${hurricanePassage}\n\nWhich lesson best fits the hurricane preparedness passage?`,
    options: ["Small actions taken early can help people protect one another during danger.", "Only trained coordinators should learn about storms.", "School projects are useful only when they win prizes.", "Families should wait for bad weather before making decisions."],
    correctAnswer: 0,
    explanation: "The passage ends by showing that preparation cannot stop every danger, but it helps people respond wisely and protect one another.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Author\u2019s Purpose",
    question: `${hurricanePassage}\n\nWhy does the author include Jason’s discovery about the batteries and blocked drain?`,
    options: ["To show how the checklist revealed real problems that could be fixed before a storm", "To prove that radios are never useful during hurricane season", "To explain why pupils should avoid helping at home", "To show that the disaster coordinator made an incorrect speech"],
    correctAnswer: 0,
    explanation: "Jason’s discovery gives a concrete example of preparedness moving from a school lesson to practical action at home.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Supporting Details",
    question: `${hurricanePassage}\n\nWhat did pupils draw to help families know where to go during an emergency?`,
    options: ["A simple map showing the safest room and nearest community shelter", "A poster advertising canned food in shops", "A diagram of a tropical storm over the ocean", "A picture of all weak branches in the parish"],
    correctAnswer: 0,
    explanation: "The passage says pupils drew a simple map showing the safest room in a house and the nearest community shelter.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `${hurricanePassage}\n\nAccording to the passage, why could trimming weak branches and clearing drains reduce damage?`,
    options: ["They lessen problems caused by heavy rain and dangerous branches during storms.", "They make batteries last longer in a radio.", "They prevent pupils from needing a checklist.", "They cause the official weather reports to change."],
    correctAnswer: 0,
    explanation: "The coordinator connects trimming branches and clearing drains with reducing damage when heavy rain arrives.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `${hurricanePassage}\n\nWhat can be inferred about the school’s approach to safety education?`,
    options: ["It wanted pupils to practise steps they could share with their families.", "It believed pupils were too young to learn about emergencies.", "It focused only on memorising definitions for a test.", "It expected the community shelter to replace home planning."],
    correctAnswer: 0,
    explanation: "Grade 5 created home checklists and maps, showing the school expected pupils to use and share safety steps beyond the classroom.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${hurricanePassage}\n\nIn the sentence “respond wisely and protect one another,” what does “respond” mean?`,
    options: ["Act or react in a helpful way", "Hide all information from others", "Forget the plan completely", "Create the storm"],
    correctAnswer: 0,
    explanation: "In context, families respond wisely by using their plans and supplies when danger comes.",
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which word best means “able to get good results without wasting time or supplies”?",
    options: ["efficient", "fragile", "ordinary", "distant"],
    correctAnswer: 0,
    explanation: "Efficient describes doing a task well without wasting resources.",
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which sentence uses “observe” correctly?",
    options: ["Students observe the sky before deciding whether outdoor practice is safe.", "Students observe a pencil into a desk.", "Students observe loudly across the classroom.", "Students observe a sandwich for lunch."],
    correctAnswer: 0,
    explanation: "Observe means to watch or notice carefully.",
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "A “resourceful” person would most likely—",
    options: ["find useful ways to solve problems with what is available", "give up whenever a tool is missing", "ignore every suggestion from a team", "make a simple task more confusing"],
    correctAnswer: 0,
    explanation: "Resourceful means able to deal with problems in practical, clever ways.",
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which word is closest in meaning to “protect”?",
    options: ["guard", "delay", "scatter", "confuse"],
    correctAnswer: 0,
    explanation: "To protect means to guard or keep safe.",
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which word best describes an “inventive” idea?",
    options: ["creative", "careless", "silent", "unrelated"],
    correctAnswer: 0,
    explanation: "Inventive means creative or good at making new ideas.",
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "What is a “solution”?",
    options: ["A way to fix or deal with a problem", "A question no one can read", "A warning that is ignored", "A tool that must be broken"],
    correctAnswer: 0,
    explanation: "A solution is a way to solve or deal with a problem.",
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which word is an antonym for “carefully”?",
    options: ["recklessly", "neatly", "quietly", "steadily"],
    correctAnswer: 0,
    explanation: "Recklessly means without care, which is the opposite of carefully.",
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "To “encourage” classmates means to—",
    options: ["give them support or confidence", "hide helpful information", "make their work harder on purpose", "refuse to listen to them"],
    correctAnswer: 0,
    explanation: "Encourage means to support or give confidence.",
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which word best means “a duty someone should take seriously”?",
    options: ["responsibility", "celebration", "distance", "decoration"],
    correctAnswer: 0,
    explanation: "A responsibility is a duty or something one is expected to do.",
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Vocabulary",
    question: "Which sentence uses “respond” correctly?",
    options: ["The team will respond to the problem by testing a safer design.", "The team will respond the ruler inside the box.", "The team will respond blue because the poster is tall.", "The team will respond the chair under the rain."],
    correctAnswer: 0,
    explanation: "Respond means to answer or act in reaction to something.",
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "The emergency coordinator checks the shelter list each month.",
      "The emergency coordinator check the shelter list each month.",
      "The emergency coordinator checking the shelter list each month.",
      "The emergency coordinator were checks the shelter list each month.",
    ],
    correctAnswer: 0,
    explanation: `The singular subject “coordinator” takes the singular verb “checks.”`,
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence uses the past tense correctly?",
    options: ["Yesterday, the pupils reviewed their safety plans.", "Yesterday, the pupils review their safety plans.", "Yesterday, the pupils will review their safety plans.", "Yesterday, the pupils reviewing their safety plans."],
    correctAnswer: 0,
    explanation: "“Reviewed” correctly shows that the action happened yesterday.",
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: `Maya and ___ packed the supplies carefully.`,
    options: [
      "I",
      "me",
      "my",
      "mine",
    ],
    correctAnswer: 0,
    explanation: `The pronoun is part of the subject, so the subject pronoun “I” is correct.`,
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: ["Before the rain began, Dad checked the flashlight.", "Before the rain began Dad checked, the flashlight.", "Before, the rain began Dad checked the flashlight.", "Before the rain began Dad, checked the flashlight."],
    correctAnswer: 0,
    explanation: "A comma should follow the introductory phrase “Before the rain began.”",
  },
  {
    id: 30,
    type: "grammar",
    skill: "Conjunctions",
    question: "Which conjunction best completes the sentence?\nThe class wanted to finish the poster, ___ the bell rang before they could colour it.",
    options: ["but", "because", "unless", "while"],
    correctAnswer: 0,
    explanation: "“But” shows a contrast between wanting to finish and being stopped by the bell.",
  },
  {
    id: 31,
    type: "grammar",
    skill: "Transitions",
    question: "Which transition best shows a next step?\nFirst, read the notice carefully. ___, place the emergency numbers near the phone.",
    options: ["Next", "However", "For example", "In conclusion"],
    correctAnswer: 0,
    explanation: "“Next” signals the step that follows the first one.",
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the sentences?\nThe rain stopped. The volunteers cleared the drain.",
    options: ["When the rain stopped, the volunteers cleared the drain.", "The rain stopped the volunteers cleared the drain.", "Stopped the rain, and the volunteers cleared.", "The volunteers, the rain stopped, cleared."],
    correctAnswer: 0,
    explanation: "The correct choice combines the ideas smoothly with a dependent clause.",
  },
  {
    id: 33,
    type: "grammar",
    skill: "Fragments",
    question: "Which choice is a complete sentence?",
    options: ["The nurse explained the safety rule to the pupils.", "Because the nurse explained the safety rule.", "The safety rule near the classroom door.", "Explaining carefully to the pupils."],
    correctAnswer: 0,
    explanation: "A complete sentence has a subject and a complete verb and expresses a full thought.",
  },
  {
    id: 34,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: ["“Keep the radio nearby,” Aunt June said.", "Keep the radio nearby, “Aunt June said.”", "“Keep the radio nearby, Aunt June said.", "Keep the radio nearby,” Aunt June said.”"],
    correctAnswer: 0,
    explanation: "The speaker’s exact words are enclosed in quotation marks, and the comma is placed inside them.",
  },
  {
    id: 35,
    type: "grammar",
    skill: "Editing",
    question: "Which sentence is edited correctly?",
    options: ["The students carried batteries, water, and bandages to the table.", "The students carried batteries water and, bandages to the table.", "The students carried, batteries, water and bandages to the table.", "The students carried batteries water, and, bandages to the table."],
    correctAnswer: 0,
    explanation: "Commas correctly separate three items in a series.",
  },
  {
    id: 36,
    type: "writing",
    skill: "Emergency Notice",
    question: "Which notice would be best for families before a hurricane?",
    options: ["Store clean water, check flashlights, listen to official reports, and keep documents dry.", "Bring party games to school and wait for neighbours to decide everything.", "Ignore weather reports until the wind becomes strong.", "Place important papers near an open window for easy finding."],
    correctAnswer: 0,
    explanation: "The best notice gives clear, practical actions from the passage: water, flashlights, official reports, and dry documents.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: "Which detail best supports a paragraph about hurricane preparedness?",
    options: ["Families should clear drains before heavy rain blocks the waterway.", "Pupils should choose the brightest colour for a poster border.", "The school hall has many chairs for assembly.", "Grandmothers often enjoy listening to music on radios."],
    correctAnswer: 0,
    explanation: "Clearing drains is a specific preparedness action that can reduce flooding damage.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Organisation",
    question: "Which sentence should come first in a paragraph explaining an emergency response plan?",
    options: ["Every family should make a simple plan before hurricane season begins.", "Finally, thank everyone after the storm has passed.", "For example, our documents stayed dry in the bag.", "This is why the last step was useful."],
    correctAnswer: 0,
    explanation: "A topic sentence introducing the plan should come before examples and closing comments.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Revision",
    question: `Which revision makes this sentence clearer?
Bad weather can be dangerous and things should be done.`,
    options: [
      "Before a hurricane, families should store water, check flashlights, and listen to official reports.",
      "Before bad weather, families should make several important preparations.",
      "Storms can be dangerous, so people should get ready carefully.",
      "Families should prepare before a hurricane so they can be safer.",
    ],
    correctAnswer: 0,
    explanation: `The revision replaces vague words with clear hurricane-preparedness actions.`,
  },
  {
    id: 40,
    type: "writing",
    skill: "Paragraph Improvement",
    question: "Which sentence best concludes a paragraph about Jason’s family preparing for the storm?",
    options: ["By fixing the radio and drain early, Jason’s family showed that preparation can make people safer and calmer.", "Jason had homework in many subjects that week.", "The weekend was near, and many people like weekends.", "Radios sometimes play music, news, and advertisements."],
    correctAnswer: 0,
    explanation: "This conclusion connects Jason’s specific actions to the larger idea of safety and calm preparedness.",
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

export default function G5LaModerate4MockTest() {
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
    ? g5LaModerate4Questions
    : g5LaModerate4Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 4",
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
      ? prepareAssessment(g5LaModerate4Questions)
      : preparePreview(g5LaModerate4Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 4
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
              <p className="text-slate-600">Language Arts Moderate 4</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 4</h1>
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
