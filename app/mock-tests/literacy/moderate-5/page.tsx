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

const innovatorsPassage = `Read the passage then answer the question.

"For Heritage Week, Grade 5 researched Jamaican inventors and innovators. Their teacher, Mr. Lewis, explained that innovation does not always mean creating a machine no one has ever imagined. Sometimes it means improving an idea so that it solves a local problem. One group studied farmers who designed simple drip systems to water crops during dry months. Another group learned about young programmers who built apps to share community notices and homework reminders.

The class invited Mrs. Grant, a food technologist, to speak about turning local fruits into products that could last longer on shop shelves. She described testing recipes, recording results, and changing one ingredient at a time. Pupils were surprised to hear that many experiments fail before an idea succeeds. Mrs. Grant told them that curiosity, patience, and careful observation are as important as expensive equipment. After the visit, each group designed a model invention using recycled materials. Some ideas were practical, such as a rainwater gauge for school gardens; others needed more work. During the display, pupils explained the problem their invention addressed and how they would improve it. The project helped them see Jamaican innovators as problem solvers who use knowledge, creativity, and persistence to serve their communities."`;

const careerPassage = `Read the passage then answer the question.

"On Career Exploration Day, visitors filled the school hall with displays, tools, uniforms, and stories about their work. Grade 5 pupils rotated through stations every fifteen minutes. At one table, a nurse demonstrated how to read a thermometer and explained that caring for patients requires kindness as well as science. At another, a marine biologist showed photographs of coral reefs and described how protecting the sea supports fishing and tourism. A carpenter let pupils examine a measuring tape, level, and small model roof.

Before the event, some pupils believed a career was simply a job adults chose once and kept forever. The visitors helped them think differently. They explained that people build careers by learning skills, accepting feedback, and making responsible choices over time. Several speakers also said that reading, mathematics, teamwork, and clear communication are useful in almost every field. During reflection, Amara wrote that she was interested in architecture because she enjoyed drawing and solving problems. Daniel, who loved football, realised that sports careers include coaching, physiotherapy, journalism, and event management. The day did not force pupils to choose their future immediately. Instead, it encouraged them to notice their strengths, ask questions, and connect school subjects with real opportunities."`;

const g5LaModerate5Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: `${innovatorsPassage}\n\nWhat is the main idea of the innovators passage?`,
    options: ["Innovation can solve local problems when people test ideas, learn from failure, and improve designs.", "Heritage Week is mainly about decorating the school hall with recycled materials.", "Mrs. Grant believes expensive equipment is the only path to success.", "The class learns that inventions should not be changed once they are made."],
    correctAnswer: 0,
    explanation: "The passage presents drip systems, apps, food technology, failed experiments, recycled models, and improvement as parts of useful innovation.",
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${innovatorsPassage}\n\nWhat did Mr. Lewis say innovation sometimes means?`,
    options: ["Improving an idea so it solves a local problem", "Copying a machine without understanding it", "Buying the newest equipment for every group", "Choosing a career before leaving primary school"],
    correctAnswer: 0,
    explanation: "Mr. Lewis explains that innovation may mean improving an idea to solve a local problem.",
  },
  {
    id: 3,
    type: "reading",
    skill: "Supporting Details",
    question: `${innovatorsPassage}\n\nWhich problem did the simple drip systems help farmers address?`,
    options: ["Watering crops during dry months", "Sorting donated clothing by size", "Protecting coral reefs from tourists", "Reading thermometers in a hospital"],
    correctAnswer: 0,
    explanation: "One group studied farmers who designed simple drip systems to water crops during dry months.",
  },
  {
    id: 4,
    type: "reading",
    skill: "Sequence",
    question: `${innovatorsPassage}\n\nWhat happened after Mrs. Grant spoke to the class?`,
    options: ["Each group designed a model invention using recycled materials.", "Mr. Lewis cancelled the Heritage Week project.", "The pupils stopped recording results in their notebooks.", "The farmers removed all drip systems from their fields."],
    correctAnswer: 0,
    explanation: "After Mrs. Grant’s visit, the groups designed model inventions with recycled materials.",
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `${innovatorsPassage}\n\nWhy were pupils surprised during Mrs. Grant’s talk?`,
    options: ["They learned that many experiments fail before an idea succeeds.", "They were told every recipe works perfectly the first time.", "They discovered local fruits cannot be used in shops.", "They found out observation is less important than equipment."],
    correctAnswer: 0,
    explanation: "The passage states pupils were surprised to hear that many experiments fail before an idea succeeds.",
  },
  {
    id: 6,
    type: "reading",
    skill: "Inference",
    question: `${innovatorsPassage}\n\nWhat can be inferred about Mrs. Grant’s method of testing recipes?`,
    options: ["She used careful records and changed one ingredient at a time to know what worked.", "She guessed randomly and never wrote down her results.", "She depended only on pupils to choose ingredients.", "She refused to improve a recipe after one failure."],
    correctAnswer: 0,
    explanation: "Her method involved recording results and changing one ingredient at a time, showing careful testing.",
  },
  {
    id: 7,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${innovatorsPassage}\n\nIn the passage, what does “innovation” most nearly mean?`,
    options: ["Creating or improving ideas to solve problems", "Repeating a mistake without learning", "Collecting tools that no one uses", "Avoiding local needs and questions"],
    correctAnswer: 0,
    explanation: "The passage defines innovation as creating or improving ideas so they solve problems.",
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `${innovatorsPassage}\n\nWhich detail best supports the idea that innovators keep improving their work?`,
    options: ["During the display, pupils explained how they would improve their inventions.", "Visitors filled the school hall with uniforms and stories.", "A carpenter let pupils examine a level and measuring tape.", "Some pupils rotated through stations every fifteen minutes."],
    correctAnswer: 0,
    explanation: "The display required pupils to explain not only the problem addressed but also how they would improve the invention.",
  },
  {
    id: 9,
    type: "reading",
    skill: "Supporting Details",
    question: `${innovatorsPassage}\n\nWhich model invention is specifically named in the passage?`,
    options: ["A rainwater gauge for school gardens", "A solar-powered football scoreboard", "A wooden model roof for a carpenter", "A thermometer for reading patients’ temperatures"],
    correctAnswer: 0,
    explanation: "The passage names a rainwater gauge for school gardens as one practical model idea.",
  },
  {
    id: 10,
    type: "reading",
    skill: "Theme",
    question: `${innovatorsPassage}\n\nWhich lesson best fits the innovators passage?`,
    options: ["Useful inventions often grow from curiosity, patience, observation, and persistence.", "A good invention must be perfect before anyone discusses it.", "Only adults with costly tools can solve community problems.", "Creative projects should avoid practical problems."],
    correctAnswer: 0,
    explanation: "Mrs. Grant highlights curiosity, patience, observation, and failed experiments, while the class improves models for community needs.",
  },
  {
    id: 11,
    type: "reading",
    skill: "Author\u2019s Purpose",
    question: `${innovatorsPassage}\n\nWhy does the author mention apps for community notices and homework reminders?`,
    options: ["To show that innovation can include digital tools that meet everyday community needs", "To prove programmers never help schools or communities", "To explain why farming tools are no longer useful", "To suggest pupils should stop using notices"],
    correctAnswer: 0,
    explanation: "The apps are an example of young programmers solving communication problems in the community.",
  },
  {
    id: 12,
    type: "reading",
    skill: "Supporting Details",
    question: `${innovatorsPassage}\n\nWhat did Mrs. Grant say was as important as expensive equipment?`,
    options: ["Curiosity, patience, and careful observation", "Uniforms, displays, and school bells", "Tourism, fishing, and coral reefs", "Homework reminders and community shelters"],
    correctAnswer: 0,
    explanation: "Mrs. Grant specifically names curiosity, patience, and careful observation as important qualities.",
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `${innovatorsPassage}\n\nWhat happened because each group had to explain the problem its invention addressed?`,
    options: ["Pupils had to connect their model to a real need instead of only showing an object.", "Pupils were allowed to ignore how their invention worked.", "The teacher decided not to let pupils use recycled materials.", "Mrs. Grant stopped testing recipes with local fruits."],
    correctAnswer: 0,
    explanation: "Explaining the addressed problem made pupils think about purpose and usefulness, not just appearance.",
  },
  {
    id: 14,
    type: "reading",
    skill: "Inference",
    question: `${innovatorsPassage}\n\nWhat can be inferred about the project’s view of Jamaican innovators?`,
    options: ["They are problem solvers who use knowledge and creativity to serve communities.", "They are people who avoid testing ideas after failure.", "They work only with imported materials and never with local needs.", "They succeed by keeping their ideas secret from others."],
    correctAnswer: 0,
    explanation: "The final sentence directly presents Jamaican innovators as problem solvers serving their communities through knowledge, creativity, and persistence.",
  },
  {
    id: 15,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${innovatorsPassage}\n\nIn the final sentence, what does “persistence” mean?`,
    options: ["Continuing to try even when work is difficult", "Finishing quickly without checking mistakes", "Throwing away an idea after one attempt", "Depending on luck instead of effort"],
    correctAnswer: 0,
    explanation: "The passage links persistence with experiments that may fail and inventions that need more work, so it means continuing to try.",
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
    question: "Which sentence is written correctly?",
    options: ["The emergency coordinator checks the shelter list each month.", "The emergency coordinator check the shelter list each month.", "The emergency coordinator checking the shelter list each month.", "The emergency coordinator were checks the shelter list each month."],
    correctAnswer: 0,
    explanation: "The singular subject “coordinator” takes the singular verb “checks.”",
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
    question: "Maya and ___ packed the supplies carefully.",
    options: ["I", "me", "my", "mine"],
    correctAnswer: 0,
    explanation: "The pronoun is part of the subject, so the subject pronoun “I” is correct.",
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
    skill: "Writing About an Invention",
    question: "Which opening sentence best begins a paragraph about a useful invention?",
    options: ["A rainwater gauge can help a school garden team know when plants need more water.", "Many objects are made of different colours and sizes.", "Some students like lunch more than science class.", "An invention is a thing that is somewhere."],
    correctAnswer: 0,
    explanation: "The best opening names a specific invention and explains the problem it helps solve.",
  },
  {
    id: 37,
    type: "writing",
    skill: "Paragraph Improvement",
    question: "Which sentence best improves a paragraph about innovation?",
    options: ["Inventors often test, record results, and improve a design after an experiment fails.", "Inventors often begin with ideas for things that people may find useful.", "Many inventions are displayed after the design has been completed.", "A useful invention can help solve a problem in a community."],
    correctAnswer: 0,
    explanation: "This sentence gives precise actions that match the passage’s ideas about testing and improving.",
  },
  {
    id: 38,
    type: "writing",
    skill: "Organisation",
    question: "Which order best organises a career reflection that begins with a pupil\'s interests, connects those interests to a possible career, and then explains how school skills can help?",
    options: ["Name an interest, connect it to a career, then explain which school skills can help.", "Name a career, list useful school skills, then explain the personal interest.", "Explain useful school skills, name an interest, then connect it to a career.", "Name an interest, explain school skills first, then identify a possible career."],
    correctAnswer: 0,
    explanation: "A clear reflection moves from personal interest to a possible career and helpful skills.",
  },
  {
    id: 39,
    type: "writing",
    skill: "Supporting Details",
    question: "Which detail best supports a paragraph about a model invention for a community problem?",
    options: ["The model uses recycled bottles to drip water slowly onto dry garden beds.", "The group painted the title in very large purple letters.", "The table was next to the classroom window during the display.", "Several students smiled while standing in line."],
    correctAnswer: 0,
    explanation: "The recycled-bottle drip system explains how the invention addresses a real dry-garden problem.",
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision",
    question: "Which revision makes this informational sentence stronger?\nPeople make inventions and they are useful.",
    options: ["Innovators design and improve inventions to solve problems such as watering crops during dry months.", "Inventors make useful things to solve different kinds of problems.", "People create inventions because useful ideas can help communities.", "Inventions are designed by people who want to improve how things work."],
    correctAnswer: 0,
    explanation: "The revision adds specific information about innovation and the crop-watering problem from the passage.",
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

export default function G5LaModerate5MockTest() {
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
    ? g5LaModerate5Questions
    : g5LaModerate5Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 5",
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
      ? prepareAssessment(g5LaModerate5Questions)
      : preparePreview(g5LaModerate5Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 5
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
              <p className="text-slate-600">Language Arts Moderate 5</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 5</h1>
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
