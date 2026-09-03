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

const newspaperPassage = `Read the passage then answer the question.

"Every Thursday morning, the Grade 5 media club at Blue Mountain Primary prepared the school newspaper, The Mountain Voice. Jada, the student editor, checked each article against notes from interviews and reminded reporters that every fact had to be accurate. One team wrote about the new reading corner donated by parents. Another team interviewed Mr. Palmer, the groundskeeper, about the breadfruit tree he planted near the canteen ten years earlier.

The busiest desk belonged to Malik, who designed headlines. He wanted the headline for the sports report to sound exciting without making false claims. When a reporter wrote that the football team “crushed every opponent,” Jada asked for evidence. The team had won two matches and drawn one, so Malik changed the headline to “Blue Mountain Footballers Finish Unbeaten.” Before publishing, the club met with Miss Chen to arrange photographs, captions, and a notice about next week’s poetry competition. Miss Chen praised the pupils for cooperating under a deadline, but she also returned one article because it mixed opinion with news. By lunchtime, copies were pinned near the office and read aloud in several classrooms. The newspaper helped pupils celebrate school events while learning that responsible journalism depends on fairness, careful listening, and clear organisation."`;

const journalismPassage = `Read the passage then answer the question.

"In the town of Mandeville, people still depended on local journalism even though many read news on phones. The community radio station announced water disruptions, road repairs, and hurricane shelter locations. The weekly paper published photographs from market day and interviewed shopkeepers about rising prices. When rumours spread quickly online, trained reporters asked questions, checked documents, and spoke to more than one person before sharing a story.

One Saturday, reporter Keisha Brown visited Grove Road after residents complained about a blocked drain. She observed plastic bottles and leaves piled near the grille, then interviewed Mrs. Tulloch, whose yard flooded during heavy rain. Keisha also called the parish council to ask when the drain would be cleared. Her article did not blame one person; instead, it showed how littering, delayed maintenance, and heavy showers all contributed to the problem. After the report was published, a youth club organised a clean-up and the council sent workers with tools. Keisha later wrote a follow-up explaining what had improved and what still needed attention. Her work showed that local journalism can inform citizens, encourage action, and hold leaders responsible without spreading fear or unfair gossip."`;

const g5LaModerate6Questions: Question[] = [
  {id:1,type:"reading",skill:"Main Idea",question:`${newspaperPassage}\n\nWhat is the main idea of the school newspaper passage?`,options:["A student newspaper teaches pupils to report school events accurately, fairly, and clearly.","A school newspaper is mainly useful for decorating the office wall.","Sports headlines should always make teams sound unbeatable.","Interviews are less important than colourful photographs."],correctAnswer:0,explanation:"The passage focuses on interviews, evidence, headlines, publishing, fairness, and organisation in the media club."},
  {id:2,type:"reading",skill:"Supporting Details",question:`${newspaperPassage}\n\nWhat was the name of Blue Mountain Primary's newspaper?`,options:["The Mountain Voice","The Weekly Canteen","The Mandeville Monitor","The Poetry Page"],correctAnswer:0,explanation:"The passage names the school newspaper The Mountain Voice."},
  {id:3,type:"reading",skill:"Point of View",question:`${newspaperPassage}\n\nWhich statement best shows Jada's point of view about reporting?`,options:["Reporters should check notes and make sure facts are accurate.","Reporters should publish quickly even when facts are uncertain.","Opinion should be mixed into every news article.","Headlines should exaggerate results to attract readers."],correctAnswer:0,explanation:"Jada checks articles against interview notes and asks for evidence before accepting a claim."},
  {id:4,type:"reading",skill:"Supporting Details",question:`${newspaperPassage}\n\nWho did one team interview about the breadfruit tree near the canteen?`,options:["Mr. Palmer, the groundskeeper","Miss Chen, the teacher","Malik, the headline designer","A parent who donated books"],correctAnswer:0,explanation:"The passage says the pupils interviewed Mr. Palmer about the breadfruit tree he planted."},
  {id:5,type:"reading",skill:"Cause and Effect",question:`${newspaperPassage}\n\nWhy did Malik change the sports headline?`,options:["The first headline made a claim that was not fully supported by the team's record.","The football team had lost every match that term.","Miss Chen wanted the article removed from the paper.","The headline was too short to fit above the photograph."],correctAnswer:0,explanation:"The team had won two matches and drawn one, so “crushed every opponent” was not accurate."},
  {id:6,type:"reading",skill:"Sequence",question:`${newspaperPassage}\n\nWhat happened before copies were pinned near the office?`,options:["The club arranged photographs, captions, and a poetry competition notice with Miss Chen.","The parish council sent workers to clear Grove Road.","Mrs. Tulloch described floodwater in her yard.","The youth club organised a community clean-up."],correctAnswer:0,explanation:"Before publishing, the club met with Miss Chen; by lunchtime, copies were pinned near the office."},
  {id:7,type:"reading",skill:"Vocabulary in Context",question:`${newspaperPassage}\n\nIn the passage, what does “accurate” most nearly mean?`,options:["correct and based on facts","funny and surprising","written in large letters","popular with every reader"],correctAnswer:0,explanation:"Jada checks notes and evidence, so accurate means correct and factual."},
  {id:8,type:"reading",skill:"Author's Purpose",question:`${newspaperPassage}\n\nWhy does the author include the changed football headline?`,options:["To show how responsible reporters avoid exaggeration and use evidence","To explain the rules of football scoring in detail","To prove headlines are more important than articles","To show that drawn matches should not be reported"],correctAnswer:0,explanation:"The example shows pupils revising a headline so it matches the evidence."},
  {id:9,type:"reading",skill:"Text Evidence",question:`${newspaperPassage}\n\nWhich detail best supports the idea that the pupils worked as a team?`,options:["They cooperated under a deadline to arrange articles, photographs, captions, and notices.","Jada worked alone and refused help from Miss Chen.","The breadfruit tree was planted ten years earlier.","Several classrooms read copies after lunch."],correctAnswer:0,explanation:"Cooperating under a deadline directly supports teamwork."},
  {id:10,type:"reading",skill:"Theme",question:`${newspaperPassage}\n\nWhich lesson best fits the passage?`,options:["Good news writing requires responsibility, evidence, and fairness.","A deadline means writers can ignore mistakes.","The most exciting words are always the best words.","School events should not be shared with pupils."],correctAnswer:0,explanation:"The final sentence states that responsible journalism depends on fairness, listening, and organisation."},
  {id:11,type:"reading",skill:"Main Idea",question:`${journalismPassage}\n\nWhat is the main idea of the local journalism passage?`,options:["Local journalism informs communities, checks facts, and encourages responsible action.","People in Mandeville no longer need radio or newspapers.","Blocked drains are caused only by one careless resident.","Reporters should publish rumours as soon as they hear them."],correctAnswer:0,explanation:"The passage describes radio updates, fact-checking, Keisha's drain report, and community action."},
  {id:12,type:"reading",skill:"Supporting Details",question:`${journalismPassage}\n\nWhich information did the community radio station announce?`,options:["Water disruptions, road repairs, and hurricane shelter locations","Football scores from Blue Mountain Primary only","Recipes from the school canteen","The winner of a poetry competition"],correctAnswer:0,explanation:"The radio station announced water disruptions, road repairs, and hurricane shelter locations."},
  {id:13,type:"reading",skill:"Inference",question:`${journalismPassage}\n\nWhat can be inferred about Keisha Brown's reporting?`,options:["She tried to be fair by observing the drain, interviewing a resident, and contacting the council.","She blamed Mrs. Tulloch without visiting Grove Road.","She avoided speaking to officials because documents are enough.","She wanted to spread fear about every shower."],correctAnswer:0,explanation:"Keisha gathered information from the scene, a resident, and the parish council."},
  {id:14,type:"reading",skill:"Cause and Effect",question:`${journalismPassage}\n\nWhat happened after Keisha's article was published?`,options:["A youth club organised a clean-up and the council sent workers with tools.","Residents stopped reading local news completely.","The blocked drain was ignored for several years.","The weekly paper stopped interviewing shopkeepers."],correctAnswer:0,explanation:"The article led to a youth club clean-up and council workers coming with tools."},
  {id:15,type:"reading",skill:"Vocabulary in Context",question:`${journalismPassage}\n\nIn the passage, what does “contributed” mean?`,options:["helped cause something to happen","copied a story word for word","removed every problem immediately","announced news on the radio"],correctAnswer:0,explanation:"Littering, delayed maintenance, and heavy showers all helped cause the blocked-drain problem."},
  {id:16,type:"vocabulary",skill:"Journalism Vocabulary",question:"An editorial in a newspaper would most likely be—",options:["an article that gives the newspaper’s opinion about an issue","a list of football scores with no comments","a photograph caption with one name only","a weather chart from another country"],correctAnswer:0,explanation:"An editorial gives an opinion, unlike a straight news report."},
  {id:17,type:"vocabulary",skill:"Vocabulary in Context",question:"In the school newspaper passage, a “headline” is—",options:['the title that introduces a news story', 'the room where interviews are recorded', 'the person who plants trees near a canteen', 'the final paragraph in every report'],correctAnswer:0,explanation:"Malik designs headlines, including the title for the sports report."},
  {id:18,type:"vocabulary",skill:"Vocabulary in Context",question:"What does “interviewed” mean in the passage?",options:['asked someone questions to gather information', 'copied an article from a notice board', 'printed papers without reading them', 'changed a headline to a drawing'],correctAnswer:0,explanation:"The pupils interviewed Mr. Palmer by asking questions for their article."},
  {id:19,type:"vocabulary",skill:"Vocabulary in Context",question:"To “publish” a newspaper means to—",options:['prepare it so people can read it', 'hide it in a locked cupboard', 'erase every quotation', 'plant it beside a tree'],correctAnswer:0,explanation:"The club published copies by pinning them where pupils could read them."},
  {id:20,type:"vocabulary",skill:"Vocabulary in Context",question:"In context, “evidence” means—",options:['facts or details that support a claim', 'a colourful border around a page', 'a rumour repeated by many people', 'a prize for quick writing'],correctAnswer:0,explanation:"Jada asks for evidence because claims need supporting facts."},
  {id:21,type:"vocabulary",skill:"Vocabulary in Context",question:"When Keisha “observed” bottles and leaves near the grille, she—",options:['looked carefully and noticed details', 'guessed without visiting', 'announced a sports result', 'designed a school headline'],correctAnswer:0,explanation:"Observed means saw and noticed carefully."},
  {id:22,type:"vocabulary",skill:"Vocabulary in Context",question:"In the local journalism passage, “rumours” are—",options:['unconfirmed stories that may not be true', 'official council repair schedules', 'photographs from market day', 'clear facts checked by documents'],correctAnswer:0,explanation:"Reporters check documents when rumours spread, so rumours are unconfirmed stories."},
  {id:23,type:"vocabulary",skill:"Vocabulary in Context",question:"“Delayed maintenance” most nearly means—",options:['repair work that was not done on time', 'a radio programme about music', 'a clean-up that finished early', 'an interview with a shopkeeper'],correctAnswer:0,explanation:"Maintenance is care or repair work; delayed means late."},
  {id:24,type:"vocabulary",skill:"Vocabulary in Context",question:"Keisha’s “follow-up” article was written to—",options:['explain what improved and what still needed attention', 'replace all earlier facts with gossip', 'announce a school poetry contest', 'describe a football match at lunch'],correctAnswer:0,explanation:"The passage states her follow-up explained improvements and remaining concerns."},
  {id:25,type:"vocabulary",skill:"Vocabulary in Context",question:"In both passages, “community” refers to—",options:['people living, learning, or working together in an area', 'one person writing secretly', 'a single headline on a page', 'a box of unused newspapers'],correctAnswer:0,explanation:"Community means a group connected by place or shared life."},
  {id:26,type:"grammar",skill:"Subject-Verb Agreement",question:"Which sentence is written correctly?",options:['The editor checks every fact before the article is printed.', 'The editor check every fact before the article is printed.', 'The editor checking every fact before the article is printed.', 'The editor were checks every fact before printing.'],correctAnswer:0,explanation:"The singular subject editor takes the verb checks."},
  {id:27,type:"grammar",skill:"Verb Tense",question:"Which sentence uses past tense correctly?",options:['Yesterday, Keisha interviewed residents on Grove Road.', 'Yesterday, Keisha interviews residents on Grove Road.', 'Yesterday, Keisha will interview residents on Grove Road.', 'Yesterday, Keisha interviewing residents on Grove Road.'],correctAnswer:0,explanation:"Interviewed shows the action happened yesterday."},
  {id:28,type:"grammar",skill:"Pronouns",question:"Jada and ___ edited the article after school.",options:["I","me","my","mine"],correctAnswer:0,explanation:"The pronoun is part of the subject \"Jada and I,\" so the subject pronoun \"I\" is correct."},
  {id:29,type:"grammar",skill:"Punctuation",question:"Which sentence is punctuated correctly?",options:['After the interview, Malik wrote a careful headline.', 'After the interview Malik, wrote a careful headline.', 'After, the interview Malik wrote a careful headline.', 'After the interview Malik wrote, a careful headline.'],correctAnswer:0,explanation:"A comma follows the introductory phrase."},
  {id:30,type:"grammar",skill:"Quotation Marks",question:"Which sentence uses quotation marks correctly?",options:['“Please check the facts,” Miss Chen said.', 'Please check the facts, “Miss Chen said.”', '“Please check the facts, Miss Chen said.', 'Please check the facts,” Miss Chen said.”'],correctAnswer:0,explanation:"The exact words are enclosed in quotation marks."},
  {id:31,type:"grammar",skill:"Conjunctions",question:"Which conjunction best completes the sentence?\nThe article was short, ___ it included all the important facts.",options:['but', 'unless', 'because', 'while'],correctAnswer:0,explanation:"But shows contrast between being short and complete."},
  {id:32,type:"grammar",skill:"Transitions",question:"Which transition best shows a result?\nThe report explained the blocked drain clearly. ___, volunteers planned a clean-up.",options:['As a result', 'For example', 'Before that', 'In contrast'],correctAnswer:0,explanation:"As a result shows what happened because of the report."},
  {id:33,type:"grammar",skill:"Apostrophes",question:"Which sentence uses an apostrophe correctly?",options:['The reporter’s notebook was filled with interview notes.', 'The reporters notebook was filled with interview notes.', 'The reporters’ notebook was filled with interview note’s.', 'The reporter’s notebook was filled with interview note’s.'],correctAnswer:0,explanation:"Reporter’s shows one reporter owns the notebook."},
  {id:34,type:"grammar",skill:"Sentence Combining",question:"Which choice best combines the sentences?\nThe bell rang. The club continued editing.",options:['Although the bell rang, the club continued editing.', 'The bell rang the club continued editing.', 'Continued editing although the bell.', 'The club, the bell rang, continued.'],correctAnswer:0,explanation:"Although creates a smooth complex sentence."},
  {id:35,type:"grammar",skill:"Fragments",question:"Which choice is a complete sentence?",options:['The newspaper included a notice about the poetry competition.', 'Because the newspaper included a notice.', 'A notice about the poetry competition.', 'Including a notice near the photographs.'],correctAnswer:0,explanation:"A complete sentence has a subject, verb, and full thought."},
  {id:36,type:"writing",skill:"News Report Opening",question:"Which sentence best begins a newspaper report about a school clean-up?",options:["Students from Grade 5 cleaned the playfield on Friday to reduce litter before Sports Day.","Grade 5 students cleaned the playfield before Sports Day.","On Friday, pupils worked together to remove litter from part of the school grounds.","A school clean-up was held to prepare an outdoor area for an upcoming event."],correctAnswer:0,explanation:"The best opening gives who, what, where, and when."},
  {id:37,type:"writing",skill:"Headlines",question:"Which headline most accurately highlights that the team completed all three matches without losing?",options:["School Team Finishes Three Matches Without a Loss","School Footballers Complete a Strong Three-Match Run","Two Wins Help School Team Finish Series on a High","Blue Mountain Team Earns Two Wins in Three Matches"],correctAnswer:0,explanation:"It is exciting but stays true to the record."},
  {id:38,type:"writing",skill:"Interview Questions",question:"Which interview question would best help a reporter explain how the new reading corner benefits pupils?",options:["How will the new reading corner help pupils choose books?","How many books are currently displayed in the reading corner?","When was the new reading corner officially opened?","Which types of books have been placed in the reading corner?"],correctAnswer:0,explanation:"The question gathers relevant information for the article."},
  {id:39,type:"writing",skill:"Article Organisation",question:"Which order best organises a news report?",options:["Lead with the main event, add key details and quotes, then explain what happens next.","Begin with a quotation, explain background details, then reveal the main event near the end.","Give background information first, describe the main event next, then add quotations without a closing update.","Lead with the main event, explain what happens next, then add important details and quotations at the end."],correctAnswer:0,explanation:"News reports usually move from main facts to details and next steps."},
  {id:40,type:"writing",skill:"Editing a News Report",question:"Which revision makes this sentence more precise?\nThe club did a thing after school.",options:["The media club checked interview notes and edited headlines after school.","The media club completed some newspaper work after school.","After school, the club worked on several parts of the newspaper.","The club spent time checking its newspaper work after school."],correctAnswer:0,explanation:"The revision names the group and specific actions."},
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

export default function G5LaModerate6MockTest() {
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
    ? g5LaModerate6Questions
    : g5LaModerate6Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 6",
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
      ? prepareAssessment(g5LaModerate6Questions)
      : preparePreview(g5LaModerate6Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 6
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
              <p className="text-slate-600">Language Arts Moderate 6</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 6</h1>
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
