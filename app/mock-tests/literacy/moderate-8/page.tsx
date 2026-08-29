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

const healthyPassage = `Read the passage then answer the question.

"On Wednesday morning, Nurse Williams visited Seaview Primary in St. Ann to help Grade 5 launch its Healthy Communities project. She did not begin with a long speech. Instead, she placed three lunch boxes on the desk: one with fried snacks and soda, one with rice and peas plus vegetables, and one with fruit, water, and a chicken sandwich. “A healthy community is built by daily choices,” she told the class.

The pupils walked around the school compound with checklists. Malik noticed that the football field had no shaded water station, so players often waited until break to drink. Jada wrote that the tuck shop sold fruit on Fridays only. Near the hand-washing sink, Tiana found that the soap container was empty. The class discussed how small problems could lead to tiredness, germs, or poor concentration.

After lunch, groups proposed practical solutions. One group asked the principal to place a covered water cooler near the field. Another group designed a fruit-and-water chart for the tuck shop. Tiana’s group made reminder cards saying, “Wash for twenty seconds before you eat.” Nurse Williams praised the pupils because their ideas were realistic, not expensive. By Friday, the principal had ordered soap refills, and the class agreed to track improvements for a month. They learned that health is not only a clinic matter; it is a shared habit at school, at home, and in the community."`;

const campaignPassage = `Read the passage then answer the question.

"The Brown’s Town Health Centre planned a Public Health Campaign for the first week of June. Its goal was to help families prevent mosquito-borne illnesses before the heavy rains arrived. Community health aide Mr. Powell met with students from Harmony Primary because he knew children could carry clear messages home. He unfolded a map showing lanes where old tyres, uncovered drums, and blocked drains often collected water.

Mr. Powell explained that mosquitoes breed in still water, even in a bottle cap. He asked the students to create notices that were accurate and respectful. “Do not shame your neighbours,” he said. “Teach them what to check.” The campaign team divided the work carefully. Amara and Joel recorded a short radio message for the community station. Shanice drew a poster showing a family covering a water barrel. Other students prepared a checklist for Saturday’s clean-up: empty containers, clear drains, cover tanks, and wear long sleeves at dusk.

On Saturday, parents, shopkeepers, and students met near the market clock. They removed water from flowerpots behind Miss Ivy’s stall and reported a blocked drain to the parish office. Some residents were surprised that such small containers could cause a big problem. At the end of the campaign, Mr. Powell reminded everyone that prevention works best before people become sick. The campaign succeeded because it gave the community simple actions, reliable information, and a reason to work together."`;

const g5LaModerate8Questions: Question[] = [
  {id:1,type:"reading",skill:"Inference",question:`${healthyPassage}\n\nWhy did Nurse Williams begin with three lunch boxes instead of a long speech?`,options:["She wanted pupils to compare real food choices and think for themselves.","She had forgotten the topic of the visit.","She wanted the class to eat before the project began.","She believed speeches are never useful in schools."],correctAnswer:0,explanation:"The lunch boxes made healthy and less healthy choices visible, helping pupils understand her message through examples."},
  {id:2,type:"reading",skill:"Supporting Details",question:`${healthyPassage}\n\nWhat problem did Malik notice on the football field?`,options:["There was no shaded water station for players.","The field was closed for repairs.","The tuck shop sold too many fruits.","The soap container was full."],correctAnswer:0,explanation:"Malik observed that players had no shaded water station and often waited until break to drink."},
  {id:3,type:"reading",skill:"Cause and Effect",question:`${healthyPassage}\n\nAccording to the class discussion, what could empty soap containers lead to?`,options:["The spread of germs before meals","More shade on the football field","Better radio messages","A fruit sale every Friday"],correctAnswer:0,explanation:"The passage connects missing soap with germs, one of the health problems the pupils discussed."},
  {id:4,type:"reading",skill:"Sequence",question:`${healthyPassage}\n\nWhat happened after the pupils used checklists around the compound?`,options:["Groups proposed practical solutions to the problems they found.","The principal cancelled the project.","Nurse Williams left without speaking.","The tuck shop stopped selling lunch."],correctAnswer:0,explanation:"After observing with checklists, the pupils discussed problems and then proposed solutions after lunch."},
  {id:5,type:"reading",skill:"Theme",question:`${healthyPassage}\n\nWhich lesson best fits the Healthy Communities passage?`,options:["Good health improves when people notice problems and build better daily habits together.","Only nurses can make schools healthy.","Healthy food matters only on Fridays.","Children should avoid giving ideas to adults."],correctAnswer:0,explanation:"The final sentence says health is a shared habit at school, home, and in the community."},
  {id:6,type:"reading",skill:"Vocabulary in Context",question:`${healthyPassage}\n\nIn the passage, what does “realistic” mean when Nurse Williams praises the ideas?`,options:["possible to carry out with available resources","too costly for the school to try","made only for a drawing competition","copied exactly from a clinic poster"],correctAnswer:0,explanation:"The ideas, such as soap refills and a water cooler, were practical and not expensive."},
  {id:7,type:"reading",skill:"Text Evidence",question:`${healthyPassage}\n\nWhich detail best shows that the school began acting on the pupils’ ideas quickly?`,options:["By Friday, the principal had ordered soap refills.","Nurse Williams placed lunch boxes on the desk.","Jada wrote about fruit being sold only on Fridays.","The class walked around with checklists."],correctAnswer:0,explanation:"The principal ordering soap refills by Friday is evidence that action began soon after the project."},
  {id:8,type:"reading",skill:"Main Idea",question:`${campaignPassage}\n\nWhat is the main idea of the Public Health Campaign passage?`,options:["A community campaign used clear information and shared action to prevent mosquito-borne illness.","Students visited a market only to buy supplies for school.","Mosquitoes are useful because they breed in bottle caps.","Radio messages are the only way to keep families healthy."],correctAnswer:0,explanation:"The passage focuses on prevention through maps, notices, radio messages, checklists, and a clean-up."},
  {id:9,type:"reading",skill:"Author's Purpose",question:`${campaignPassage}\n\nWhy does the author include Mr. Powell’s instruction, “Do not shame your neighbours”?`,options:["To show that public health messages should teach respectfully","To suggest that the campaign should avoid speaking to residents","To prove the students were causing the problem","To explain why drains should stay blocked"],correctAnswer:0,explanation:"Mr. Powell wants accurate, respectful notices that teach people what to check."},
  {id:10,type:"reading",skill:"Supporting Details",question:`${campaignPassage}\n\nWhich pair of students recorded a radio message?`,options:["Amara and Joel","Malik and Jada","Tiana and Nurse Williams","Miss Ivy and Shanice"],correctAnswer:0,explanation:"The passage states that Amara and Joel recorded a short message for the community station."},
  {id:11,type:"reading",skill:"Cause and Effect",question:`${campaignPassage}\n\nWhy was the campaign planned before the heavy rains arrived?`,options:["Rain could leave still water where mosquitoes breed.","The market clock would stop during dry weather.","Students would not need checklists after June.","Long sleeves are only worn at school."],correctAnswer:0,explanation:"Mr. Powell explains that mosquitoes breed in still water, and heavy rains could create more of it."},
  {id:12,type:"reading",skill:"Point of View",question:`${campaignPassage}\n\nWhich statement best shows Mr. Powell’s point of view?`,options:["Prevention is strongest when people learn simple actions before illness spreads.","Families should wait until many people are sick before acting.","Children should not be involved in community messages.","Small containers are too tiny to matter."],correctAnswer:0,explanation:"Mr. Powell says prevention works best before people become sick and asks students to share clear actions."},
  {id:13,type:"reading",skill:"Vocabulary in Context",question:`${campaignPassage}\n\nIn the passage, what does “accurate” mean?`,options:["correct and reliable","colourful but confusing","rude and embarrassing","quick but unfinished"],correctAnswer:0,explanation:"Mr. Powell wants notices that teach neighbours the correct things to check."},
  {id:14,type:"reading",skill:"Text Evidence",question:`${campaignPassage}\n\nWhich detail shows that small objects can create a serious health risk?`,options:["Mosquitoes can breed in still water, even in a bottle cap.","Students met near the market clock on Saturday.","Shanice drew a family covering a barrel.","A radio message was recorded for the station."],correctAnswer:0,explanation:"The bottle cap example shows that even tiny amounts of still water can allow mosquitoes to breed."},
  {id:15,type:"reading",skill:"Inference",question:`${campaignPassage}\n\nWhat can be inferred from residents being surprised at the small containers?`,options:["Some people did not realise tiny amounts of water could help mosquitoes breed.","Residents already knew every campaign message before Saturday.","The students had given incorrect information.","The market had no flowerpots or drains."],correctAnswer:0,explanation:"Their surprise suggests the campaign taught them something new about small containers and mosquito prevention."},
  {id:16,type:"vocabulary",skill:"Vocabulary in Context",question:"In the healthy communities passage, “community” most nearly means—",options:["people who live, learn, or work in the same area","a single lunch box on a desk","a private notebook used by one pupil","a kind of fried snack"],correctAnswer:0,explanation:"The passage discusses school, home, and local people working together."},
  {id:17,type:"vocabulary",skill:"Vocabulary in Context",question:"In the campaign passage, a “campaign” is—",options:["an organised effort to share a message and encourage action","a container left outside after rain","a meal served at the tuck shop","a football match after school"],correctAnswer:0,explanation:"The health centre organised messages, posters, and a clean-up to prevent illness."},
  {id:18,type:"vocabulary",skill:"Vocabulary in Context",question:"“Prevention” in the campaign passage means—",options:["stopping a problem before it happens","waiting until a sickness spreads","decorating a school notice board","buying snacks from a stall"],correctAnswer:0,explanation:"Mr. Powell says prevention works best before people become sick."},
  {id:19,type:"vocabulary",skill:"Vocabulary in Context",question:"A “checklist” is—",options:["a list used to make sure important tasks are completed","a bottle cap filled with rainwater","a speech with no examples","a type of school uniform"],correctAnswer:0,explanation:"Students used checklists to inspect the school and prepare for the clean-up."},
  {id:20,type:"vocabulary",skill:"Health Vocabulary",question:"“Hygiene” would best describe—",options:["clean habits such as washing hands before eating","running fastest on the football field","recording a radio advertisement","drawing a parish map"],correctAnswer:0,explanation:"The reminder cards about washing hands for twenty seconds are about hygiene."},
  {id:21,type:"vocabulary",skill:"Vocabulary in Context",question:"In the campaign passage, “respectful” means—",options:["showing consideration for other people","trying to embarrass neighbours","leaving drains blocked","refusing to share information"],correctAnswer:0,explanation:"Mr. Powell tells students not to shame neighbours but to teach them."},
  {id:22,type:"vocabulary",skill:"Vocabulary in Context",question:"In the healthy communities passage, “concentration” means—",options:["the ability to pay attention","a covered water cooler","a fruit-and-water chart","an empty soap container"],correctAnswer:0,explanation:"Poor concentration is listed as a problem that can affect students' learning."},
  {id:23,type:"vocabulary",skill:"Vocabulary in Context",question:"To “track improvements” means to—",options:["observe and record changes over time","hide problems from the principal","stop using checklists completely","sell fruit only once a term"],correctAnswer:0,explanation:"The class agreed to watch changes for a month after solutions began."},
  {id:24,type:"vocabulary",skill:"Vocabulary in Context",question:"In the campaign passage, “reliable” information is information that is—",options:["trustworthy and likely to be correct","funny but untrue","kept secret from families","written without checking facts"],correctAnswer:0,explanation:"The campaign succeeded because it shared dependable public health information."},
  {id:25,type:"vocabulary",skill:"Vocabulary in Context",question:"In the school passage, “practical” solutions are solutions that are—",options:["useful and possible to do","beautiful but impossible","unrelated to the problem","meant only for adults"],correctAnswer:0,explanation:"The pupils suggested useful actions such as refilling soap and adding water access."},
  {id:26,type:"grammar",skill:"Subject-Verb Agreement",question:"Which sentence is written correctly?",options:["The health aide explains the checklist clearly.","The health aide explain the checklist clearly.","The health aide explaining the checklist clearly.","The health aide were explain the checklist clearly."],correctAnswer:0,explanation:"The singular subject health aide takes the verb explains."},
  {id:27,type:"grammar",skill:"Verb Tense",question:"Which sentence uses past tense correctly?",options:["Yesterday, the students cleaned the containers behind the stall.","Yesterday, the students clean the containers behind the stall.","Yesterday, the students will clean the containers behind the stall.","Yesterday, the students cleaning the containers behind the stall."],correctAnswer:0,explanation:"Cleaned correctly shows an action completed yesterday."},
  {id:28,type:"grammar",skill:"Pronouns",question:"Choose the sentence with the correct pronoun.",options:["Mr. Powell gave Shanice and me the posters.","Mr. Powell gave Shanice and I the posters.","Me and Shanice gave he the posters.","Mr. Powell gave I and Shanice the posters."],correctAnswer:0,explanation:"Me is the correct object pronoun after gave."},
  {id:29,type:"grammar",skill:"Punctuation",question:"Which sentence is punctuated correctly?",options:["Before the clean-up began, families gathered near the market clock.","Before the clean-up began families, gathered near the market clock.","Before, the clean-up began families gathered near the market clock.","Before the clean-up began families gathered, near the market clock."],correctAnswer:0,explanation:"A comma belongs after the introductory phrase."},
  {id:30,type:"grammar",skill:"Quotation Marks",question:"Which sentence uses quotation marks correctly?",options:["“Cover the drum tightly,” said Mr. Powell.","Cover the drum tightly, “said Mr. Powell.”","“Cover the drum tightly, said Mr. Powell.","Cover the drum tightly,” said Mr. Powell."],correctAnswer:0,explanation:"The exact spoken words are enclosed in quotation marks."},
  {id:31,type:"grammar",skill:"Conjunctions",question:"Which conjunction best completes the sentence?\nThe team carried gloves ___ they wanted to remove containers safely.",options:["because","although","unless","but"],correctAnswer:0,explanation:"Because gives the reason for carrying gloves."},
  {id:32,type:"grammar",skill:"Transitions",question:"Which transition best shows a result?\nThe soap container was empty. ___, the class asked for refills.",options:["As a result","For example","Meanwhile","In contrast"],correctAnswer:0,explanation:"As a result signals what happened because of the empty soap container."},
  {id:33,type:"grammar",skill:"Apostrophes",question:"Which sentence uses an apostrophe correctly?",options:["The nurse’s advice helped the pupils plan their project.","The nurses advice helped the pupil’s plan their project.","The nurse’s advice helped the pupils’ plan their project’s.","The nurses’ advice helped the pupil plan’s their project."],correctAnswer:0,explanation:"Nurse’s shows that the advice belonged to one nurse."},
  {id:34,type:"grammar",skill:"Sentence Combining",question:"Which choice best combines the sentences?\nThe rain filled the tyres. Mosquitoes bred in the still water.",options:["After the rain filled the tyres, mosquitoes bred in the still water.","The rain filled the tyres mosquitoes bred in the still water.","Mosquitoes bred. The rain tyres in water.","Because still water and the rain filled."],correctAnswer:0,explanation:"After combines the two related events clearly and correctly."},
  {id:35,type:"grammar",skill:"Complete Sentences",question:"Which choice is a complete sentence?",options:["The students prepared a checklist for Saturday’s clean-up.","Because the students prepared a checklist.","A checklist for Saturday’s clean-up.","Preparing a checklist near the market."],correctAnswer:0,explanation:"It has a subject, a verb, and a complete thought."},
  {id:36,type:"writing",skill:"Informational Topic Sentence",question:"Which sentence best begins an informational paragraph about healthy living at school?",options:["Students can improve school health by drinking water, washing hands, and choosing balanced meals.","Drinking enough water can help pupils stay alert during the school day.","Hand-washing is one habit that can reduce the spread of germs at school.","Balanced meals can give pupils energy for lessons and activities."],correctAnswer:0,explanation:"It clearly introduces specific healthy living actions."},
  {id:37,type:"writing",skill:"Organisation",question:"Which order best organises a public health notice about mosquitoes?",options:["State the risk, explain where mosquitoes breed, then list prevention steps.","List prevention steps, explain where mosquitoes breed, then describe the health risk.","Explain where mosquitoes breed, list prevention steps, then introduce the health risk at the end.","State the risk, list prevention steps, then explain where mosquitoes breed."],correctAnswer:0,explanation:"A strong notice moves from problem to explanation to action."},
  {id:38,type:"writing",skill:"Supporting Details",question:"Which detail best supports a paragraph about hygiene?",options:["Washing hands for twenty seconds before eating can reduce the spread of germs.","The school placed hand-washing reminders near areas used by pupils.","Health workers encourage families to practise clean habits every day.","Pupils discussed hand-washing during the school health project."],correctAnswer:0,explanation:"The detail directly explains why hand-washing matters."},
  {id:39,type:"writing",skill:"Revision",question:"Which revision makes this sentence stronger?\nPeople should be healthy.",options:["Families can build healthy habits by covering water drums, washing hands, and choosing water instead of soda.","Families can improve their health by making better choices every day.","People should practise healthy habits at home and in their communities.","Families can make several changes that may help everyone stay healthier."],correctAnswer:0,explanation:"The revision gives specific actions connected to community health."},
  {id:40,type:"writing",skill:"Public Awareness",question:"Which slogan best fits a campaign about preventing mosquitoes?",options:["Tip It, Cover It, Clear It: Stop Mosquitoes Before They Breed","Keep Your Community Safer from Mosquitoes","Prevent Mosquitoes by Checking Water Around Your Home","Healthy Communities Work Together Against Mosquitoes"],correctAnswer:0,explanation:"The slogan gives short, memorable prevention actions from the campaign."},
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

export default function G5LaModerate8MockTest() {
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
    ? g5LaModerate8Questions
    : g5LaModerate8Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 8",
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
      ? prepareAssessment(g5LaModerate8Questions)
      : preparePreview(g5LaModerate8Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 8
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
              <p className="text-slate-600">Language Arts Moderate 8</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 8</h1>
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
