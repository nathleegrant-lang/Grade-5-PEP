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

const stemPassage = `Read the passage then answer the question.

"Grade 5 at Mandeville Primary entered a parish STEM Challenge called Build a Better Bridge. Each team received craft sticks, string, tape, two small weights, and a planning sheet. Mr. Gordon, the science teacher, reminded the class that engineers do not simply build and hope. They investigate a problem, design a solution, test it, and improve it.

Kayla’s team wanted their bridge to hold the weights while stretching across two desks. At first, they copied a flat design from a picture, but the middle bent as soon as one weight was placed on it. Instead of arguing, the group studied the weak area. Dwayne suggested adding triangle shapes because he had seen them on a metal bridge near Spur Tree. Kayla measured the craft sticks, while Renaldo tied string under the centre for extra support.

During the second test, the bridge held one weight but twisted when the second was added. The team changed the tape positions and made both sides equal. Their final prototype held the two weights for ten seconds. It was not the neatest bridge in the room, but the judges praised the team’s notes because each change was explained clearly. Kayla wrote that failure helped them see what to improve. By the end of the challenge, the pupils understood that STEM is not only about getting the right answer quickly. It is about careful thinking, teamwork, and learning from evidence."`;

const roboticsPassage = `Read the passage then answer the question.

"On Saturday, students from several primary schools gathered at the Montego Bay Robotics Competition. The task was to program a small robot to carry a sponge cube through a model disaster zone and deliver it to a paper shelter. The course included a cardboard bridge, a narrow turn, and a black line that the robot’s sensor had to follow.

The Hopewell Primary team named their robot Rio. Before the first round, captain Nia checked the wheels while Omar reviewed the code on a tablet. Their robot moved well at first, but it stopped at the narrow turn and dropped the cube. Some team members groaned, yet their coach, Miss Lee, asked them to observe before changing anything. They noticed that the sensor was reading a shiny patch of tape as part of the black line. Omar adjusted the code so Rio would slow down near the turn, and Nia moved the cube holder slightly higher.

In the second round, Rio crossed the cardboard bridge and reached the shelter, but it arrived two seconds after the time limit. The team decided not to make the robot faster because that might cause another drop. Instead, they made the path smoother by removing loose tape from the course with a judge’s permission. In the final round, Rio delivered the cube on time. The team did not win the tallest trophy, but they earned a special award for problem solving. Their presentation explained the sensor problem, the code change, and the reason for each decision."`;

const g5LaModerate9Questions: Question[] = [
  {id:1,type:"reading",skill:"Cause and Effect",question:`${stemPassage}\n\nWhy did Kayla’s team add triangle shapes to the bridge?`,options:["The flat middle bent during the first test.","The judges required every bridge to be triangular.","They wanted to use fewer craft sticks.","The planning sheet told them to stop testing."],correctAnswer:0,explanation:"After the flat design bent, Dwayne suggested triangles to strengthen the weak area."},
  {id:2,type:"reading",skill:"Vocabulary in Context",question:`${stemPassage}\n\nIn the passage, what does “prototype” mean?`,options:["a first model built to test and improve a design","a final trophy given to the neatest team","a string used only for decoration","a picture copied without changes"],correctAnswer:0,explanation:"The bridge was a model tested and improved during the challenge."},
  {id:3,type:"reading",skill:"Point of View",question:`${stemPassage}\n\nWhich statement best shows Mr. Gordon’s point of view about engineering?`,options:["Engineers should investigate, design, test, and improve solutions.","Engineers should build quickly without planning.","A neat bridge is always better than a tested bridge.","Team notes are less important than arguing."],correctAnswer:0,explanation:"Mr. Gordon directly reminds pupils of the engineering process."},
  {id:4,type:"reading",skill:"Supporting Details",question:`${stemPassage}\n\nWhat did Renaldo do to help the bridge?`,options:["He tied string under the centre for extra support.","He judged the other teams’ bridges.","He removed tape from a robotics course.","He programmed a sensor to follow a line."],correctAnswer:0,explanation:"The passage says Renaldo tied string under the centre of the bridge."},
  {id:5,type:"reading",skill:"Inference",question:`${stemPassage}\n\nWhat can be inferred from the judges praising the team’s notes?`,options:["They valued clear evidence of testing and improvement.","They cared only about how colourful the bridge looked.","They thought the bridge never had any problems.","They wanted the pupils to hide their failed tests."],correctAnswer:0,explanation:"The notes explained each change clearly, showing the team learned from evidence."},
  {id:6,type:"reading",skill:"Sequence",question:`${stemPassage}\n\nWhat happened immediately after the second test showed the bridge twisted?`,options:["The team changed the tape positions and made both sides equal.","The team entered the robotics competition.","The judges gave a special award.","Mr. Gordon cancelled the challenge."],correctAnswer:0,explanation:"After the second test, they adjusted the tape and balanced the sides."},
  {id:7,type:"reading",skill:"Theme",question:`${stemPassage}\n\nWhich lesson best fits the STEM Challenge passage?`,options:["Mistakes can guide improvement when a team studies evidence carefully.","The first design is usually perfect.","Winning matters more than learning.","Only one person should make all design decisions."],correctAnswer:0,explanation:"Kayla writes that failure helped the team see what to improve."},
  {id:8,type:"reading",skill:"Main Idea",question:`${roboticsPassage}\n\nWhat is the main idea of the robotics passage?`,options:["A robotics team solved problems by observing, adjusting, and explaining its decisions.","A robot named Rio won every trophy without difficulty.","Students gathered only to watch a cardboard bridge.","The competition was about drawing paper shelters."],correctAnswer:0,explanation:"The passage follows the team as they observe problems, change code and equipment, and present their reasoning."},
  {id:9,type:"reading",skill:"Text Evidence",question:`${roboticsPassage}\n\nWhich detail best proves that Rio had a sensor problem?`,options:["The sensor read a shiny patch of tape as part of the black line.","The robot carried a sponge cube through a disaster zone.","Students gathered in Montego Bay on Saturday.","The team did not win the tallest trophy."],correctAnswer:0,explanation:"The shiny tape being read as the line is direct evidence of the sensor problem."},
  {id:10,type:"reading",skill:"Author's Purpose",question:`${roboticsPassage}\n\nWhy does the author describe the first failed round in detail?`,options:["To show how the team identified the problem before changing the robot","To prove the team should have quit immediately","To explain that competitions should not have time limits","To show that the sponge cube was too heavy for all robots"],correctAnswer:0,explanation:"The first round sets up the sensor and cube-holder problems that the team later solves."},
  {id:11,type:"reading",skill:"Supporting Details",question:`${roboticsPassage}\n\nWhat two things did Omar and Nia change after the first round?`,options:["Omar adjusted the code, and Nia raised the cube holder.","Omar painted the shelter, and Nia changed schools.","Omar removed the bridge, and Nia rewrote the rules.","Omar built a new trophy, and Nia stopped the competition."],correctAnswer:0,explanation:"Omar made Rio slow down near the turn, and Nia moved the holder higher."},
  {id:12,type:"reading",skill:"Cause and Effect",question:`${roboticsPassage}\n\nWhy did the team choose not to make Rio faster after the second round?`,options:["A faster robot might drop the cube again.","The judge refused to let the robot move.","The sensor could not follow any black line.","The paper shelter had disappeared."],correctAnswer:0,explanation:"The team reasoned that extra speed might cause another dropped cube."},
  {id:13,type:"reading",skill:"Vocabulary in Context",question:`${roboticsPassage}\n\nIn the passage, what does “adjusted” mean?`,options:["changed slightly to make something work better","copied without understanding","threw away completely","decorated for a photograph"],correctAnswer:0,explanation:"Omar changed the code slightly so Rio would slow near the turn."},
  {id:14,type:"reading",skill:"Inference",question:`${roboticsPassage}\n\nWhat can be inferred about Miss Lee from her advice to observe before changing anything?`,options:["She wanted students to use evidence rather than guess.","She wanted the team to ignore the robot.","She believed the first run had gone perfectly.","She thought the competition was only about speed."],correctAnswer:0,explanation:"Miss Lee’s advice led the team to identify the shiny tape and make targeted changes."},
  {id:15,type:"reading",skill:"Text Evidence",question:`${roboticsPassage}\n\nWhich detail shows that the team communicated its problem-solving process?`,options:["Their presentation explained the sensor problem, the code change, and each decision.","The robot was named Rio before the first round.","Several schools gathered at the competition.","The course included a cardboard bridge."],correctAnswer:0,explanation:"The presentation directly communicated the team’s process and reasoning."},
  {id:16,type:"vocabulary",skill:"Vocabulary in Context",question:"In the STEM passage, “engineers” are people who—",options:["design and improve solutions to practical problems","judge only the colour of craft sticks","carry sponge cubes for robots","write stories about lunch boxes"],correctAnswer:0,explanation:"Mr. Gordon describes engineers as people who investigate, design, test, and improve."},
  {id:17,type:"vocabulary",skill:"Vocabulary in Context",question:"In the STEM passage, to “investigate” means to—",options:["study carefully to find information","guess without looking closely","decorate a bridge with string","win a prize before testing"],correctAnswer:0,explanation:"The teams investigate problems before designing solutions."},
  {id:18,type:"vocabulary",skill:"Vocabulary in Context",question:"A “solution” in the STEM passage is—",options:["a way to solve a problem","a mistake that must be hidden","a trophy from Montego Bay","a loose piece of shiny tape"],correctAnswer:0,explanation:"The bridge design is a solution to the problem of holding weights across two desks."},
  {id:19,type:"vocabulary",skill:"Vocabulary in Context",question:"In the robotics passage, a “sensor” is—",options:["a device that detects information such as a line on the course","a sponge cube carried by students","a paper shelter at the finish","a judge’s permission slip"],correctAnswer:0,explanation:"Rio’s sensor had to follow the black line and misread shiny tape."},
  {id:20,type:"vocabulary",skill:"Vocabulary in Context",question:"In the STEM passage, “evidence” means—",options:["information from tests or observations","a guess made before planning","a craft stick with no purpose","a prize for the fastest robot"],correctAnswer:0,explanation:"The pupils learned from test results and observations."},
  {id:21,type:"vocabulary",skill:"Vocabulary in Context",question:"To “collaborate” means to—",options:["work together toward a goal","work alone without speaking","copy a design and refuse changes","stop a project after one mistake"],correctAnswer:0,explanation:"Both passages show teams sharing tasks and decisions."},
  {id:22,type:"vocabulary",skill:"Vocabulary in Context",question:"In the robotics passage, “code” means—",options:["instructions that tell the robot what to do","a cardboard bridge on the course","a sponge cube in a shelter","a trophy for presentation skills"],correctAnswer:0,explanation:"Omar reviewed and adjusted the code controlling Rio."},
  {id:23,type:"vocabulary",skill:"Vocabulary in Context",question:"In the STEM passage, “improve” means—",options:["make better","make weaker on purpose","leave unchanged","measure once and stop"],correctAnswer:0,explanation:"Teams improve designs after tests reveal problems."},
  {id:24,type:"vocabulary",skill:"Vocabulary in Context",question:"In the robotics passage, “presentation” means—",options:["a spoken or displayed explanation shared with others","a robot wheel that follows a line","a hidden mistake in the code","a narrow turn on the course"],correctAnswer:0,explanation:"The team’s presentation explained their problem-solving decisions."},
  {id:25,type:"vocabulary",skill:"Vocabulary in Context",question:"In the STEM passage, “design” means—",options:["a plan for how something will be made or work","a random pile of materials","a time limit in a competition","a mistake that cannot be fixed"],correctAnswer:0,explanation:"The bridge design guided how the team arranged materials."},
  {id:26,type:"grammar",skill:"Subject-Verb Agreement",question:"Which sentence is written correctly?",options:["The robot follows the black line around the turn.","The robot follow the black line around the turn.","The robot following the black line around the turn.","The robot were follows the black line around the turn."],correctAnswer:0,explanation:"The singular subject robot takes follows."},
  {id:27,type:"grammar",skill:"Verb Tense",question:"Which sentence uses future tense correctly?",options:["Tomorrow, the team will test the new bridge design.","Tomorrow, the team tested the new bridge design.","Tomorrow, the team testing the new bridge design.","Tomorrow, the team tests yesterday's bridge design."],correctAnswer:0,explanation:"Will test correctly shows future time."},
  {id:28,type:"grammar",skill:"Pronouns",question:"Choose the sentence with the correct pronoun.",options:["Miss Lee asked Omar and me to observe the robot.","Miss Lee asked Omar and I to observe the robot.","Me and Omar asked she to observe the robot.","Miss Lee asked I and Omar to observe the robot."],correctAnswer:0,explanation:"Me is the correct object pronoun after asked."},
  {id:29,type:"grammar",skill:"Punctuation",question:"Which sentence is punctuated correctly?",options:["After the bridge twisted, the team changed the tape positions.","After the bridge twisted the team, changed the tape positions.","After, the bridge twisted the team changed the tape positions.","After the bridge twisted the team changed, the tape positions."],correctAnswer:0,explanation:"A comma follows the introductory clause."},
  {id:30,type:"grammar",skill:"Quotation Marks",question:"Which sentence uses quotation marks correctly?",options:["“Observe before changing the code,” Miss Lee reminded the team.","Observe before changing the code, “Miss Lee reminded the team.”","“Observe before changing the code, Miss Lee reminded the team.","Observe before changing the code,” Miss Lee reminded the team."],correctAnswer:0,explanation:"The spoken words are correctly enclosed in quotation marks."},
  {id:31,type:"grammar",skill:"Conjunctions",question:"Which conjunction best completes the sentence?\nThe bridge looked neat, ___ it could not hold the second weight.",options:["but","because","unless","so"],correctAnswer:0,explanation:"But shows contrast between appearance and performance."},
  {id:32,type:"grammar",skill:"Transitions",question:"Which transition best shows the next step?\nFirst, the team tested the flat bridge. ___, they added triangles for support.",options:["Next","However","In conclusion","For example"],correctAnswer:0,explanation:"Next shows the following step in the process."},
  {id:33,type:"grammar",skill:"Apostrophes",question:"Which sentence uses an apostrophe correctly?",options:["Kayla’s measurements helped the team balance the bridge.","Kaylas measurements helped the team balance the bridge.","Kayla’s measurements helped the teams’ balance the bridge.","Kaylas’ measurement’s helped the team balance the bridge."],correctAnswer:0,explanation:"Kayla’s shows possession by one person."},
  {id:34,type:"grammar",skill:"Sentence Combining",question:"Which choice best combines the sentences?\nThe sensor saw shiny tape. The robot stopped at the turn.",options:["When the sensor saw shiny tape, the robot stopped at the turn.","The sensor saw shiny tape the robot stopped at the turn.","Stopped at the turn because shiny.","The robot, the sensor saw, tape stopped."],correctAnswer:0,explanation:"When clearly combines the cause and event."},
  {id:35,type:"grammar",skill:"Fragments",question:"Which choice is a complete sentence, not a fragment?",options:["The team explained its changes during the presentation.","Because the team explained its changes.","During the presentation about changes.","Explaining the robot's sensor problem."],correctAnswer:0,explanation:"It includes a subject, verb, and complete thought."},
  {id:36,type:"writing",skill:"Report Topic Sentence",question:"Which sentence best begins a report about a STEM challenge?",options:["Our team improved a bridge design by testing it, studying weak points, and making balanced changes.","Our team built a bridge from craft materials and tested how much weight it could hold.","The first bridge design twisted when the team added more weight.","Triangles were added to some parts of the bridge during later tests."],correctAnswer:0,explanation:"It clearly previews the engineering process used by the team."},
  {id:37,type:"writing",skill:"Supporting Evidence",question:"Which detail best supports a paragraph about problem solving in robotics?",options:["The team discovered that shiny tape confused the sensor, so Omar changed the code.","The robot stopped at a narrow turn during one test.","The team observed the robot carefully during each practice run.","Omar adjusted part of the robot's program before another trial."],correctAnswer:0,explanation:"This detail connects a specific problem with a specific solution."},
  {id:38,type:"writing",skill:"Organisation",question:"Which order best organises an engineering report?",options:["Describe the challenge, explain each test result, then discuss improvements and final performance.","Describe the final design, explain the challenge, then list earlier test results and improvements.","Explain the first test, describe the final result, then introduce the original challenge and design changes.","Describe the challenge, discuss the final performance, then explain the tests and changes that produced it."],correctAnswer:0,explanation:"A strong report follows the design process from challenge to tests to improvements."},
  {id:39,type:"writing",skill:"Revision",question:"Which revision makes this sentence stronger?\nThe robot had a problem.",options:["Rio stopped at the narrow turn because its sensor mistook shiny tape for the black line.","Rio had trouble at the narrow turn because something affected its sensor.","The robot stopped at one part of the course when the sensor read the line incorrectly.","Rio experienced a sensor problem while trying to complete the narrow turn."],correctAnswer:0,explanation:"The revision names the robot, the location, the cause, and the sensor issue."},
  {id:40,type:"writing",skill:"Presentation Closing",question:"Which closing sentence best fits a team presentation about invention?",options:["Our results show that careful testing and teamwork can turn a weak design into a stronger solution.","Our team completed several tests and made changes before the final presentation.","The final design performed better than the first design during testing.","Testing helped our group discover weaknesses and make useful improvements."],correctAnswer:0,explanation:"It reflects on testing, teamwork, and improvement, which match both STEM passages."},
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

export default function G5LaModerate9MockTest() {
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
    ? g5LaModerate9Questions
    : g5LaModerate9Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 9",
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
      ? prepareAssessment(g5LaModerate9Questions)
      : preparePreview(g5LaModerate9Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 9
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
              <p className="text-slate-600">Language Arts Moderate 9</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 9</h1>
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
