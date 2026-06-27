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
    question: `${innovatorsPassage}\n\nWhat is the main idea of the jamaican inventors and innovators passage?`,
    options: [
      "The school cancels all classwork for the term.",
      "Only adults can solve problems in a school.",
      "The event is mainly about winning expensive prizes.",
      "Pupils learn useful lessons while taking part in jamaican inventors and innovators.",
    ],
    correctAnswer: 3,
    explanation: `The passage focuses on pupils participating in jamaican inventors and innovators and learning important habits and ideas.`,
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${innovatorsPassage}\n\nWhich detail is stated in the passage?`,
    options: [
      "The principal refused to let pupils participate.",
      "The activity happened during a summer holiday overseas.",
      "The pupils travelled to another country for the activity.",
      "The pupils prepared or worked in groups before sharing ideas.",
    ],
    correctAnswer: 3,
    explanation: `This detail is directly stated and supports the events described in the passage.`,
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `${innovatorsPassage}\n\nWhat can the reader infer about the teacher or organiser?`,
    options: [
      "The organiser expected pupils to work without guidance.",
      "The organiser wanted pupils to memorise facts only.",
      "The organiser disliked pupil participation.",
      "The organiser valued careful thinking and responsible action.",
    ],
    correctAnswer: 3,
    explanation: `The organiser gives guidance, sets expectations, and encourages thoughtful participation.`,
  },
  {
    id: 4,
    type: "reading",
    skill: "Author’s Purpose",
    question: `${innovatorsPassage}\n\nWhy did the author most likely write this passage?`,
    options: [
      "To list every school rule in Jamaica",
      "To advertise a product for sale",
      "To describe a sporting competition play by play",
      "To inform readers about a meaningful learning experience",
    ],
    correctAnswer: 3,
    explanation: `The passage explains an experience and what pupils learned from it.`,
  },
  {
    id: 5,
    type: "reading",
    skill: "Cause and Effect",
    question: `${innovatorsPassage}\n\nWhich cause-and-effect relationship is shown in the passage?`,
    options: [
      "Because the event was cancelled, pupils learned nothing.",
      "Because adults did all the work, pupils became less responsible.",
      "Because no one listened, the project immediately failed.",
      "Because pupils prepared and reflected, they gained confidence and understanding.",
    ],
    correctAnswer: 3,
    explanation: `The passage shows preparation and reflection leading to learning and growth.`,
  },
  {
    id: 6,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${innovatorsPassage}\n\nIn the passage, what does contributed most nearly mean?`,
    options: [
      "copied without thinking",
      "arrived late",
      "hid quietly",
      "took part or added help",
    ],
    correctAnswer: 3,
    explanation: `Contributed means took part or added ideas, effort, or help.`,
  },
  {
    id: 7,
    type: "reading",
    skill: "Sequence",
    question: `${innovatorsPassage}\n\nWhich event happened before pupils shared or displayed their final ideas?`,
    options: [
      "They ended the programme before it began.",
      "They reflected on what they had learned.",
      "They prepared, researched, or practised their ideas.",
      "They forgot the purpose of the activity.",
    ],
    correctAnswer: 2,
    explanation: `The passage describes planning or preparation before final sharing.`,
  },
  {
    id: 8,
    type: "reading",
    skill: "Text Evidence",
    question: `${innovatorsPassage}\n\nWhich detail best supports the idea that the activity required teamwork?`,
    options: [
      "Pupils worked in groups and every member had a role.",
      "The weather changed during the afternoon.",
      "One pupil owned a new notebook.",
      "The school gate was painted blue.",
    ],
    correctAnswer: 0,
    explanation: `Group work and shared roles are direct evidence of teamwork.`,
  },
  {
    id: 9,
    type: "reading",
    skill: "Theme",
    question: `${careerPassage}\n\nWhich theme is most strongly shown in the career exploration passage?`,
    options: [
      "Growth happens when people use help responsibly and respect one another.",
      "Only the oldest person in a group can learn.",
      "Good programmes never require patience.",
      "People should avoid learning from others.",
    ],
    correctAnswer: 0,
    explanation: `The passage shows people learning through support, respect, patience, and responsible choices.`,
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Details",
    question: `${careerPassage}\n\nWhich detail from the passage shows responsible behaviour?`,
    options: [
      "Pupils or community members follow guidance and help others appropriately.",
      "Everyone refuses to share materials.",
      "Someone spreads confusion without checking facts.",
      "Participants ignore instructions from adults.",
    ],
    correctAnswer: 0,
    explanation: `Following guidance and helping appropriately are responsible actions described in the passage.`,
  },
  {
    id: 11,
    type: "reading",
    skill: "Point of View",
    question: `${careerPassage}\n\nFrom which point of view is the passage told?`,
    options: [
      "Third person by a narrator outside the events",
      "First person by the main pupil",
      "Second person giving commands to you",
      "First person by a visitor",
    ],
    correctAnswer: 0,
    explanation: `The narrator uses names and words such as pupils, they, and visitors, showing third person.`,
  },
  {
    id: 12,
    type: "reading",
    skill: "Inference",
    question: `${careerPassage}\n\nWhat can be inferred from the results of the programme or event?`,
    options: [
      "The experience had a positive effect beyond one lesson.",
      "No one changed after the activity.",
      "The pupils became less interested in school.",
      "The adults wanted pupils to stop asking questions.",
    ],
    correctAnswer: 0,
    explanation: `The ending shows improvement, reflection, or new understanding after the experience.`,
  },
  {
    id: 13,
    type: "reading",
    skill: "Cause and Effect",
    question: `${careerPassage}\n\nWhat happened because people followed the guidance in the passage?`,
    options: [
      "The situation improved or people avoided a problem.",
      "The main characters lost interest immediately.",
      "The activity became unsafe for everyone.",
      "The school closed permanently.",
    ],
    correctAnswer: 0,
    explanation: `The passage shows that responsible choices led to improvement or prevented confusion.`,
  },
  {
    id: 14,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${careerPassage}\n\nIn the passage, what does genuine most nearly mean?`,
    options: [
      "hidden and silent",
      "heavy and broken",
      "real and sincere",
      "quick and careless",
    ],
    correctAnswer: 2,
    explanation: `Genuine means real, honest, or sincere in this context.`,
  },
  {
    id: 15,
    type: "reading",
    skill: "Text Evidence",
    question: `${careerPassage}\n\nWhich detail best supports the message that learning is connected to real life?`,
    options: [
      "The event has no effect after it ends.",
      "Characters apply the lesson to choices outside a single worksheet.",
      "The passage names the colour of every wall.",
      "A character refuses to try anything new.",
    ],
    correctAnswer: 1,
    explanation: `Applying the lesson to real choices shows that learning connects to life beyond the classroom.`,
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: `In the sentence, "The pupils demonstrated responsible choices," what does demonstrated mean?`,
    options: [
      "showed clearly",
      "hid carefully",
      "forgot quickly",
      "measured loudly",
    ],
    correctAnswer: 0,
    explanation: `Demonstrated means showed clearly.`,
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Which word is closest in meaning to prepare?`,
    options: [
      "damage",
      "borrow",
      "whisper",
      "plan",
    ],
    correctAnswer: 3,
    explanation: `To prepare is to get ready or plan for something.`,
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `What does evidence mean in a reading question?`,
    options: [
      "a type of pencil",
      "a loud announcement",
      "proof from the text",
      "a guess without support",
    ],
    correctAnswer: 2,
    explanation: `Evidence is information that supports an answer or idea.`,
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Multiple Meanings",
    question: `Which sentence uses source to mean where information comes from?`,
    options: [
      "The class sang the chorus twice.",
      "The website was a useful source for the project.",
      "The sauce was too spicy for lunch.",
      "The horse ran across the field.",
    ],
    correctAnswer: 1,
    explanation: `A source can mean where information comes from.`,
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Prefix",
    question: `What does the prefix re- mean in reread?`,
    options: [
      "again",
      "not",
      "before",
      "under",
    ],
    correctAnswer: 0,
    explanation: `The prefix re- means again.`,
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Suffix",
    question: `What does helpful mean?`,
    options: [
      "without any help",
      "helped yesterday",
      "one who refuses help",
      "full of help or useful",
    ],
    correctAnswer: 3,
    explanation: `The suffix -ful means full of.`,
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Antonyms",
    question: `Which word is the opposite of careful?`,
    options: [
      "thoughtful",
      "exact",
      "careless",
      "steady",
    ],
    correctAnswer: 2,
    explanation: `Careless is the opposite of careful.`,
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Synonyms",
    question: `Which word is closest in meaning to improve?`,
    options: [
      "move away",
      "make better",
      "make louder",
      "take apart",
    ],
    correctAnswer: 1,
    explanation: `Improve means to make better.`,
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Precise Word Choice",
    question: `Which word best completes the sentence: The group made a ___ plan before beginning.`,
    options: [
      "clear",
      "sleepy",
      "rusty",
      "crooked",
    ],
    correctAnswer: 0,
    explanation: `Clear describes a plan that is easy to understand.`,
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Context Clues",
    question: `"The instructions were brief, so the pupils finished reading them quickly." What does brief mean?`,
    options: [
      "angry",
      "colourful",
      "expensive",
      "short",
    ],
    correctAnswer: 3,
    explanation: `The clue quickly suggests the instructions were short.`,
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Choose the correct sentence.`,
    options: [
      "The pupils was working together.",
      "The pupils is working together.",
      "The pupils works together.",
      "The pupils work together.",
    ],
    correctAnswer: 3,
    explanation: `The plural subject pupils takes the verb work.`,
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: `Choose the sentence that correctly uses past tense.`,
    options: [
      "Yesterday, the group presents its ideas.",
      "Yesterday, the group present its ideas.",
      "Yesterday, the group will present its ideas.",
      "Yesterday, the group presented its ideas.",
    ],
    correctAnswer: 3,
    explanation: `Yesterday signals past tense, so presented is correct.`,
  },
  {
    id: 28,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence uses commas correctly?`,
    options: [
      "We packed pencils notebooks, charts and glue.",
      "We packed pencils, notebooks, charts, and glue.",
      "We packed, pencils notebooks charts and glue.",
      "We packed pencils notebooks charts, and, glue.",
    ],
    correctAnswer: 1,
    explanation: `Commas separate items in a series.`,
  },
  {
    id: 29,
    type: "grammar",
    skill: "Pronouns",
    question: `Choose the pronoun that correctly completes the sentence: "Amara shared ___ notes with the team."`,
    options: [
      "their",
      "her",
      "its",
      "his",
    ],
    correctAnswer: 1,
    explanation: `Amara is one girl, so her is correct.`,
  },
  {
    id: 30,
    type: "grammar",
    skill: "Apostrophes",
    question: `Which sentence uses an apostrophe correctly?`,
    options: [
      "The teams’ was poster colourful.",
      "The team poster’s were colourful.",
      "The teams poster was colourful.",
      "The team’s poster was colourful.",
    ],
    correctAnswer: 3,
    explanation: `Team’s shows that the poster belongs to one team.`,
  },
  {
    id: 31,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "The group planned carefully. ___, the presentation was clear."`,
    options: [
      "Instead of",
      "As a result",
      "Under",
      "Before",
    ],
    correctAnswer: 1,
    explanation: `As a result shows the outcome of careful planning.`,
  },
  {
    id: 32,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which option best joins the ideas? "The task was challenging. The pupils did not give up."`,
    options: [
      "The task was challenging, but the pupils did not give up.",
      "The task was challenging the pupils did not give up.",
      "Because but the task was challenging pupils.",
      "The pupils did not, task challenging, give up.",
    ],
    correctAnswer: 0,
    explanation: `But correctly joins contrasting ideas.`,
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Fragment",
    question: `Which option is a complete sentence?`,
    options: [
      "After the meeting ended.",
      "The pupils shared their ideas confidently.",
      "Near the display table.",
      "Because the group listened carefully.",
    ],
    correctAnswer: 1,
    explanation: `This option has a subject, verb, and complete thought.`,
  },
  {
    id: 34,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      '"Maya said, We should check our work.',
      'Maya said "We should check our work.',
      'Maya said, "We should check our work."',
      "Maya said, We should check our work.",
    ],
    correctAnswer: 2,
    explanation: `The exact words spoken are inside quotation marks.`,
  },
  {
    id: 35,
    type: "grammar",
    skill: "Editing",
    question: `Choose the best correction: "The pupils was ready for the event."`,
    options: [
      "The pupils has ready for the event.",
      "The pupils were ready for the event.",
      "The pupils is ready for the event.",
      "The pupils be ready for the event.",
    ],
    correctAnswer: 1,
    explanation: `The plural subject pupils needs were.`,
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: `Which topic sentence best begins a paragraph about jamaican inventors and innovators?`,
    options: [
      "Jamaican Inventors and Innovators taught pupils several important lessons.",
      "My shoes were under the bed.",
      "Some desks are brown and some are not.",
      "Lunch tasted better on Friday.",
    ],
    correctAnswer: 0,
    explanation: `This sentence introduces a clear main idea for the paragraph.`,
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Details",
    question: `Which detail best supports the idea that teamwork improves a project?`,
    options: [
      "The clock had two hands.",
      "A pencil rolled off the desk.",
      "The sky was sometimes cloudy.",
      "Group members shared roles and listened to one another.",
    ],
    correctAnswer: 3,
    explanation: `Shared roles and listening directly support teamwork.`,
  },
  {
    id: 38,
    type: "writing",
    skill: "Organization",
    question: `Which order is best for explaining a school project?`,
    options: [
      "Carry out the plan; identify the problem; plan later; stop",
      "Buy snacks; close books; ignore feedback; go home",
      "Identify the problem; plan a solution; carry out the plan; reflect on results",
      "Reflect on results; forget the plan; identify nothing; begin randomly",
    ],
    correctAnswer: 2,
    explanation: `This order follows a logical beginning, middle, and ending.`,
  },
  {
    id: 39,
    type: "writing",
    skill: "Transitions",
    question: `Which transition best shows contrast? "The task was difficult; ___, the pupils continued working."`,
    options: [
      "nearby",
      "however",
      "therefore",
      "for example",
    ],
    correctAnswer: 1,
    explanation: `However shows contrast between difficulty and continued effort.`,
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision",
    question: `Choose the best revision of this sentence: "The event was good and helped us a lot."`,
    options: [
      "The event helped pupils build confidence, practise teamwork, and make responsible choices.",
      "The event was good good and very nice for us.",
      "Good event helped a lot things.",
      "The event, because helped, was us.",
    ],
    correctAnswer: 0,
    explanation: `The best revision is specific, clear, and complete.`,
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
