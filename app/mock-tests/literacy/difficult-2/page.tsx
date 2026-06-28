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

const renewablePassage = `Read the passage then answer the question.

"At Harbour View Primary, the science club investigated renewable energy after the school’s electricity bill increased during a hot term. Their mentor, Ms. Blake, explained that renewable energy comes from sources that are naturally replaced, such as sunlight, wind, and moving water. The students compared a small solar panel, a hand-cranked generator, and a model wind turbine. On sunny days, the solar panel powered a fan for the longest time, but during a cloudy lunch period its output dropped sharply. The wind turbine worked best near the playing field where the sea breeze was steady, while the hand-cranked generator depended on human effort and quickly tired the volunteers. The club calculated that solar panels would cost more at first but could reduce bills over several years. They also noted that saving energy was essential: open windows, shaded classrooms, and switched-off lights made any energy plan more sustainable. In their report, the students recommended starting with one solar-powered library fan and an energy-saving campaign before asking for a larger system."`;

const discoveryPassage = `Read the passage then answer the question.

"When Dr. Simone Harris visited the school, she described how scientific discovery often begins with a question that seems simple. As a child, she wondered why some mangrove seedlings survived storms while others washed away. Years later, she and her research team investigated roots in different coastal areas. They measured water depth, soil firmness, and the number of young fish sheltering among the roots. At first, their results seemed confusing because one site with strong roots had fewer seedlings. Instead of ignoring the contradiction, the team returned after heavy rain and discovered that goats had been eating new plants near that site. This evidence changed their conclusion. They realised that protecting mangroves required both healthy coastal conditions and control of grazing animals. Dr. Harris told the pupils that reliable discoveries depend on patience, repeated observations, and the courage to revise an explanation. She encouraged them to ask careful questions because even a Grade 5 investigation can contribute to science when evidence is recorded honestly."`;

const g5LaDifficult2Questions: Question[] = [
  {id:1,type:"reading",skill:"Cause and Effect",question:`${renewablePassage}

Why did the science club begin investigating renewable energy?`,options:["The school’s electricity bill increased during a hot term.","The hand-cranked generator won a national competition.","The wind turbine stopped all sea breezes near the field.","The library already had many solar-powered fans."],correctAnswer:0,explanation:'The rising bill caused the club to look for energy solutions.'},
  {id:2,type:"reading",skill:"Inference",question:`${renewablePassage}

Why did the students recommend one solar-powered library fan before a larger system?`,options:["They wanted to test a practical first step before spending more money.","They believed renewable energy never works in schools.","They wanted to avoid using any evidence from their investigation.","They thought the hand-cranked generator was perfect for every classroom."],correctAnswer:0,explanation:'Starting small fits the evidence about cost and allows the school to evaluate results.'},
  {id:3,type:"reading",skill:"Supporting Details",question:`${renewablePassage}

Where did the model wind turbine work best?`,options:["Near the playing field where the sea breeze was steady","Inside the library during a cloudy lunch period","Beside closed windows in a shaded classroom","Only while volunteers turned a handle by hand"],correctAnswer:0,explanation:'The passage states the turbine worked best near the breezy playing field.'},
  {id:4,type:"reading",skill:"Compare and Contrast",question:`${renewablePassage}

How did the solar panel and hand-cranked generator differ?`,options:["The solar panel used sunlight, while the hand-cranked generator depended on human effort.","Both worked only when goats were kept away.","The hand-cranked generator reduced bills over several years, while the panel tired volunteers.","The solar panel needed soil firmness, while the generator needed moving water."],correctAnswer:0,explanation:'The passage distinguishes the energy sources and limitations of each device.'},
  {id:5,type:"reading",skill:"Drawing Conclusions",question:`${renewablePassage}

What conclusion is best supported by the energy investigation?`,options:["Renewable energy works best when paired with energy-saving habits.","The school should buy the largest system immediately.","Cloudy weather proves solar energy is never useful.","Students should ignore costs when making recommendations."],correctAnswer:0,explanation:'The report recommends both a solar fan and an energy-saving campaign.'},
  {id:6,type:"reading",skill:"Vocabulary in Context",question:`${renewablePassage}

In the passage, “sustainable” means—`,options:["able to continue over time without wasting resources","too costly for anyone to discuss","powered only by tired volunteers","unrelated to future planning"],correctAnswer:0,explanation:'The passage connects sustainability with saving energy and long-term use.'},
  {id:7,type:"reading",skill:"Author’s Purpose",question:`${renewablePassage}

Why does the author include the cloudy lunch period?`,options:["To show a limitation the students had to consider when evaluating solar power","To prove that sunlight is never a renewable energy source","To explain why the school stopped using fans completely","To show that cloudy weather made the wind turbine useless"],correctAnswer:0,explanation:'The cloudy period provides evidence about when solar output decreases.'},
  {id:8,type:"reading",skill:"Text Evidence",question:`${renewablePassage}

Which detail best supports the recommendation for an energy-saving campaign?`,options:["Open windows, shaded classrooms, and switched-off lights made any plan more sustainable.","The mentor’s name was Ms. Blake.","The students compared three devices.","The school was called Harbour View Primary."],correctAnswer:0,explanation:'This detail directly supports reducing energy use alongside renewable energy.'},
  {id:9,type:"reading",skill:"Main Idea",question:`${discoveryPassage}

What is the main idea of the scientific discovery passage?`,options:["Scientific conclusions become stronger when researchers investigate evidence and revise ideas.","Mangrove roots are useful only because young fish hide near them.","Dr. Harris discovered that goats should live in every coastal area.","Grade 5 pupils cannot learn anything about scientific research."],correctAnswer:0,explanation:'The passage emphasizes questions, measurements, contradictions, new evidence, and revised conclusions.'},
  {id:10,type:"reading",skill:"Inference",question:`${discoveryPassage}

What can be inferred about Dr. Harris as a scientist?`,options:["She values honest evidence more than keeping her first explanation.","She ignores results that do not match her expectation.","She believes simple questions cannot lead to discoveries.","She thinks repeated observations waste time."],correctAnswer:0,explanation:'She returned to investigate confusing results and changed her conclusion.'},
  {id:11,type:"reading",skill:"Supporting Details",question:`${discoveryPassage}

What did the research team measure?`,options:["Water depth, soil firmness, and young fish among the roots","Solar output, fan speed, and classroom shade","The cost of library fans and school lights","The number of pupils at Harbour View Primary"],correctAnswer:0,explanation:'These measurements are listed in the passage.'},
  {id:12,type:"reading",skill:"Drawing Conclusions",question:`${discoveryPassage}

What conclusion did new evidence about goats help the team draw?`,options:["Mangrove protection required healthy conditions and control of grazing animals.","Strong roots always guarantee many seedlings.","Heavy rain was the only danger to mangrove plants.","Young fish caused seedlings to wash away."],correctAnswer:0,explanation:'The goats explained the contradiction and broadened the team’s conclusion.'},
  {id:13,type:"reading",skill:"Theme",question:`${discoveryPassage}

Which lesson best fits Dr. Harris’s message?`,options:["Careful questions and honest records can lead to meaningful discoveries.","A scientist should never change an explanation.","Discoveries happen only when results are simple.","Children should avoid asking questions about nature."],correctAnswer:0,explanation:'Dr. Harris encourages careful questions, patience, repeated observations, and honest evidence.'},
  {id:14,type:"reading",skill:"Prediction",question:`${discoveryPassage}

What would Dr. Harris most likely advise a pupil whose results seem confusing?`,options:["Repeat the observations and look for evidence that explains the difference.","Erase the confusing results from the notebook.","Choose the answer that sounds easiest.","Stop the investigation and avoid asking for help."],correctAnswer:0,explanation:'Her own team investigated a contradiction instead of ignoring it.'},
  {id:15,type:"reading",skill:"Inference",question:`${discoveryPassage}

Why is the childhood question about seedlings important?`,options:["It shows that curiosity can grow into serious scientific investigation.","It proves children already know every scientific answer.","It shows that storms are never connected to research.","It explains why Dr. Harris disliked coastal areas."],correctAnswer:0,explanation:'The question from childhood later became the basis for her research.'},
  {id:16,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “interpret”?`,options:["explain the meaning of information carefully","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“interpret” means explain the meaning of information carefully.'},
  {id:17,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “justify”?`,options:["give reasons or evidence for a decision","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“justify” means give reasons or evidence for a decision.'},
  {id:18,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “significant”?`,options:["important enough to make a difference","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“significant” means important enough to make a difference.'},
  {id:19,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “reliable”?`,options:["able to be trusted","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“reliable” means able to be trusted.'},
  {id:20,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “innovative”?`,options:["new and creative","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“innovative” means new and creative.'},
  {id:21,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “essential”?`,options:["absolutely necessary","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“essential” means absolutely necessary.'},
  {id:22,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “perspective”?`,options:["a way of thinking about something","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“perspective” means a way of thinking about something.'},
  {id:23,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “contribute”?`,options:["help to cause or improve something","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“contribute” means help to cause or improve something.'},
  {id:24,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “investigate”?`,options:["study carefully to discover facts","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“investigate” means study carefully to discover facts.'},
  {id:25,type:"vocabulary",skill:"Academic Vocabulary",question:`Which meaning best fits the word “sustainable”?`,options:["able to continue without being wasteful","quickly copy someone else’s answer","avoid thinking about a problem","make a choice without evidence"],correctAnswer:0,explanation:'“sustainable” means able to continue without being wasteful.'},
  {id:26,type:"grammar",skill:"Subject-Verb Agreement",question:`Which sentence is written correctly?`,options:["The team of pupils presents its plan clearly.","The team of pupils present its plan clearly.","The team of pupils presenting its plan clearly.","The team of pupils were presents its plan clearly."],correctAnswer:0,explanation:'The singular subject “team” takes the singular verb “presents.”'},
  {id:27,type:"grammar",skill:"Verb Tense",question:`Which sentence keeps the verb tense consistent?`,options:["Yesterday, Nia recorded the results and shared them with the class.","Yesterday, Nia records the results and shared them with the class.","Yesterday, Nia will record the results and shared them with the class.","Yesterday, Nia recording the results and shares them with the class."],correctAnswer:0,explanation:'Both actions happened yesterday, so both verbs should be past tense.'},
  {id:28,type:"grammar",skill:"Pronouns",question:`Choose the sentence with the correct pronoun.`,options:["The teacher asked Jamal and me to revise the report.","The teacher asked Jamal and I to revise the report.","The teacher asked he and me to revise the report.","The teacher asked I and Jamal to revise the report."],correctAnswer:0,explanation:'“Me” is the correct object pronoun after “asked.”'},
  {id:29,type:"grammar",skill:"Punctuation",question:`Which sentence is punctuated correctly?`,options:["After the evidence was checked, the group changed its conclusion.","After the evidence was checked the group, changed its conclusion.","After, the evidence was checked the group changed its conclusion.","After the evidence, was checked the group changed its conclusion."],correctAnswer:0,explanation:'A comma follows the introductory clause.'},
  {id:30,type:"grammar",skill:"Quotation Marks",question:`Which sentence uses quotation marks correctly?`,options:["“We need stronger evidence,” said Maya.","“We need stronger evidence, said Maya.”","We need stronger evidence,” said Maya.","“We need stronger evidence” said Maya."],correctAnswer:0,explanation:'The spoken words are inside quotation marks, with the comma before the closing quotation mark.'},
  {id:31,type:"grammar",skill:"Parallel Structure",question:`Which sentence uses parallel structure?`,options:["The committee planned the schedule, printed the flyers, and welcomed the guests.","The committee planned the schedule, printing the flyers, and guests were welcomed.","The committee was planning, printed flyers, and to welcome guests.","The committee planned, the flyers were printed, and welcoming guests."],correctAnswer:0,explanation:'The three actions use the same verb form.'},
  {id:32,type:"grammar",skill:"Sentence Combining",question:`Which choice best combines the sentences?
The report was detailed. It was easy to understand.`,options:["The report was detailed and easy to understand.","The report was detailed it was easy to understand.","Detailed, and it was easy to understand the report.","Because the report was detailed and."],correctAnswer:0,explanation:'“And” combines two related descriptions into one complete sentence.'},
  {id:33,type:"grammar",skill:"Run-on Correction",question:`Which sentence corrects the run-on?`,options:["The students collected data, and they explained their findings.","The students collected data they explained their findings.","The students collected data, they explained their findings.","The students collected data and explained, their findings."],correctAnswer:0,explanation:'A comma plus “and” correctly joins the two independent clauses.'},
  {id:34,type:"grammar",skill:"Transitions",question:`Which transition best completes the sentence?
The first plan was too costly. ___, the group designed a simpler solution.`,options:["Therefore","Similarly","For example","Meanwhile only"],correctAnswer:0,explanation:'“Therefore” shows the result of the first problem.'},
  {id:35,type:"grammar",skill:"Clarity and Word Choice",question:`Which sentence is clearest?`,options:["The evidence from the survey supports the group’s recommendation.","The stuff from the thing helps the group’s idea.","It was good and there were things about it.","The recommendation had evidence or something."],correctAnswer:0,explanation:'Precise words make the meaning clear.'},
  {id:36,type:"writing",skill:"Best Introduction",question:`Which introduction best fits an essay about renewable energy and scientific discovery?`,options:["Renewable energy and scientific discovery can solve real problems when people study evidence, plan carefully, and explain their decisions.","This essay is about things that happened and some people.","There are many topics in the world, and this is one of them.","I am writing because the teacher said to write."],correctAnswer:0,explanation:'The best introduction states a clear focus and previews important ideas.'},
  {id:37,type:"writing",skill:"Strongest Supporting Evidence",question:`Which sentence gives the strongest support for a recommendation?`,options:["The survey showed that 32 of 40 residents preferred the plan because it saved money and time.","Many people might like the plan because it seems nice.","The plan is good, and everyone should know that.","I think the plan works because I like it."],correctAnswer:0,explanation:'Specific evidence with numbers and reasons is strongest.'},
  {id:38,type:"writing",skill:"Best Revision",question:`Which revision improves the sentence?
The project was good and helped people.`,options:["The project improved the community by solving a clear problem and encouraging residents to work together.","The project was very, very good and nice for people.","It was a good project that was good in a good way.","People had a project and it did things."],correctAnswer:0,explanation:'The revision uses precise details and explains impact.'},
  {id:39,type:"writing",skill:"Sentence to Remove",question:`Which sentence should be removed from a paragraph about a school project?`,options:["My favourite snack is cheese crackers with pepper sauce.","Students met every Friday to review their progress.","The teacher helped the group check its evidence.","The final poster explained the problem and solution."],correctAnswer:0,explanation:'The snack sentence is unrelated to the paragraph’s topic.'},
  {id:40,type:"writing",skill:"Best Conclusion",question:`Which conclusion is strongest?`,options:["For these reasons, the evidence shows that careful planning and teamwork can create lasting improvements.","That is the end of my writing, so there is nothing else to say.","Projects are things, and people do them sometimes.","I hope you liked all the sentences I wrote."],correctAnswer:0,explanation:'A strong conclusion restates the main idea and leaves a clear final thought.'},
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
