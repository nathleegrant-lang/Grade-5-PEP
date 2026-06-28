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

const entrepreneurshipPassage = `Read the passage then answer the question.

"At Blue Mountain Primary, twelve Grade 5 pupils formed the Bright Ideas Club to design small businesses for Market Day. Their teacher, Mr. Allen, emphasised that youth entrepreneurship was not simply selling snacks; it required identifying a need, calculating costs, listening to customers, and acting honestly. Nia suggested reusable lunch bags after noticing plastic wrappers blowing across the playing field. Kareem proposed herb seedlings because several parents wanted affordable seasonings for home gardens. The club investigated prices at three shops, compared cloth and soil costs, and kept a careful record of every receipt. When early customers said the first lunch bags were too small, the pupils redesigned them with wider straps and stronger stitching. On Market Day, the herb seedlings sold quickly, but the bags earned more profit because the materials lasted longer. At the end, the club donated part of its earnings to buy bins for the school yard. Mr. Allen told them that an innovative business should solve a problem and contribute to the community, not only make money."`;

const servicePassage = `Read the passage then answer the question.

"The Riverside Service Team noticed that the lane beside the clinic flooded whenever heavy rain carried leaves into the drain. Instead of complaining, the students interviewed nurses, shopkeepers, and elderly residents to understand the problem from different perspectives. They learned that patients sometimes stepped into muddy water and that delivery cyclists avoided the lane after storms. The team created a plan: clean the drain with adult supervision, paint warning stones, and ask the parish office for a covered rubbish bin. Some classmates wanted to finish in one afternoon, but Amara argued that reliable service requires follow-up. For four Saturdays, volunteers recorded how much litter was removed and whether water flowed better after rain. Their chart showed less flooding after the drain was cleared, yet wrappers returned when the nearby shop became busy. The team concluded that signs alone were not enough, so they prepared a short presentation asking shop owners to remind customers to dispose of rubbish properly. The project taught them that community service works best when evidence, cooperation, and responsibility are combined."`;

const g5LaDifficult1Questions: Question[] = [
  {id:1,type:"reading",skill:"Inference",question:`${entrepreneurshipPassage}

Why did Mr. Allen say entrepreneurship was not simply selling snacks?`,options:["He wanted pupils to understand planning, customer needs, costs, and honesty.","He believed Grade 5 pupils should never earn money at school.","He thought snacks were the only products customers would buy.","He wanted the club to avoid speaking to customers."],correctAnswer:0,explanation:'Mr. Allen lists deeper business skills, so the passage presents entrepreneurship as thoughtful problem-solving.'},
  {id:2,type:"reading",skill:"Cause and Effect",question:`${entrepreneurshipPassage}

What caused Nia to suggest reusable lunch bags?`,options:["She noticed plastic wrappers blowing across the playing field.","She found herb seedlings growing beside the classroom.","She wanted to copy the product that sold quickest.","She was told that cloth was free at every shop."],correctAnswer:0,explanation:'The litter on the field directly led Nia to propose a reusable product.'},
  {id:3,type:"reading",skill:"Text Evidence",question:`${entrepreneurshipPassage}

Which detail best proves that the club made decisions using evidence?`,options:["The pupils investigated prices at three shops and kept receipts.","The pupils named their group the Bright Ideas Club.","Market Day was held at Blue Mountain Primary.","Mr. Allen spoke to the class at the end."],correctAnswer:0,explanation:'Checking prices and recording receipts are concrete evidence of careful decision-making.'},
  {id:4,type:"reading",skill:"Drawing Conclusions",question:`${entrepreneurshipPassage}

What conclusion can be drawn from the bags earning more profit than the seedlings?`,options:["A product with higher lasting value can earn more even if it sells more slowly.","The seedlings were a failure because no one wanted seasonings.","The pupils should have ignored customer comments about bag size.","The club made no effort to compare costs before selling."],correctAnswer:0,explanation:'The seedlings sold quickly, but the bags had better profit because materials lasted longer.'},
  {id:5,type:"reading",skill:"Vocabulary in Context",question:`${entrepreneurshipPassage}

In the passage, “innovative” most nearly means—`,options:["creative and useful in a new way","expensive and impossible to sell","copied without permission","careless about community needs"],correctAnswer:0,explanation:'Mr. Allen connects innovation with solving a problem and helping the community.'},
  {id:6,type:"reading",skill:"Supporting Details",question:`${entrepreneurshipPassage}

Which detail shows the pupils responded to feedback?`,options:["They redesigned the lunch bags with wider straps and stronger stitching.","They donated part of their earnings to buy school bins.","They formed a club with twelve Grade 5 pupils.","They sold herb seedlings to parents."],correctAnswer:0,explanation:'Customers said the bags were too small, and the pupils improved the design.'},
  {id:7,type:"reading",skill:"Theme",question:`${entrepreneurshipPassage}

Which theme is best supported by the passage?`,options:["Successful ideas often combine careful planning with service to others.","Making money is always more important than solving problems.","Children should avoid changing a plan once it begins.","A business succeeds only when it sells food."],correctAnswer:0,explanation:'The club plans carefully, adjusts products, earns profit, and donates to improve the yard.'},
  {id:8,type:"reading",skill:"Compare and Contrast",question:`${entrepreneurshipPassage}

How were the two business ideas different?`,options:["The seedlings sold quickly, while the bags earned more profit because they lasted longer.","The bags were never changed, while the seedlings were redesigned twice.","The seedlings solved litter, while the bags helped home gardens.","Both products failed because customers refused to buy them."],correctAnswer:0,explanation:'The passage explicitly contrasts quick seedling sales with greater bag profit.'},
  {id:9,type:"reading",skill:"Main Idea",question:`${servicePassage}

What is the main idea of the community service passage?`,options:["Students used evidence and cooperation to reduce flooding and litter near the clinic.","Students painted stones because they wanted to decorate a lane.","Shopkeepers solved the problem without help from anyone else.","The clinic closed because cyclists avoided the flooded lane."],correctAnswer:0,explanation:'The whole passage focuses on investigating, acting, measuring results, and involving the community.'},
  {id:10,type:"reading",skill:"Inference",question:`${servicePassage}

What can be inferred about Amara?`,options:["She understands that lasting service requires checking whether a solution continues to work.","She wants the group to stop helping after one afternoon.","She thinks evidence is less useful than guessing.","She believes residents should not share their perspectives."],correctAnswer:0,explanation:'Amara argues for follow-up, showing she values reliable, lasting improvement.'},
  {id:11,type:"reading",skill:"Supporting Details",question:`${servicePassage}

Which group was interviewed by the Riverside Service Team?`,options:["Nurses, shopkeepers, and elderly residents","Only delivery cyclists from another town","A group of tourists visiting the beach","Only students from a high school science club"],correctAnswer:0,explanation:'The passage names nurses, shopkeepers, and elderly residents as interviewees.'},
  {id:12,type:"reading",skill:"Drawing Conclusions",question:`${servicePassage}

What conclusion did the team reach after wrappers returned?`,options:["Cleaning and signs were helpful but community reminders were also needed.","The drain should be blocked so leaves could not enter it.","The project had completely solved every problem forever.","The clinic lane did not need any further attention."],correctAnswer:0,explanation:'Wrappers returned when the shop was busy, so the team planned to involve shop owners.'},
  {id:13,type:"reading",skill:"Author’s Purpose",question:`${servicePassage}

Why does the author include the chart of litter and water flow?`,options:["To show that the students evaluated their project with evidence","To prove that charts are more important than service","To explain why the volunteers stopped working immediately","To show that rain never returned after the first Saturday"],correctAnswer:0,explanation:'The chart demonstrates evidence-based evaluation of the service project.'},
  {id:14,type:"reading",skill:"Prediction",question:`${servicePassage}

What is most likely to happen if shop owners remind customers to use the bin?`,options:["Fewer wrappers will enter the drain after busy shopping times.","Patients will have to step into deeper muddy water.","The volunteers will no longer need adult supervision.","The warning stones will disappear from the lane."],correctAnswer:0,explanation:'Customer reminders target the source of returning wrappers, so litter should decrease.'},
  {id:15,type:"reading",skill:"Inference",question:`${servicePassage}

Why was it important to interview people with different perspectives?`,options:["Different people experienced the flooding problem in different ways.","The students needed to make the project take longer for no reason.","Only one resident knew everything about the lane.","The parish office refused to listen to students."],correctAnswer:0,explanation:'Nurses, residents, and cyclists each revealed different effects of the flooded lane.'},
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
  {id:36,type:"writing",skill:"Best Introduction",question:`Which introduction best fits an essay about youth entrepreneurship and community service?`,options:["Youth entrepreneurship and community service can solve real problems when people study evidence, plan carefully, and explain their decisions.","This essay is about things that happened and some people.","There are many topics in the world, and this is one of them.","I am writing because the teacher said to write."],correctAnswer:0,explanation:'The best introduction states a clear focus and previews important ideas.'},
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
