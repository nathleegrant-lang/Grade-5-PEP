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

const tourismPassage = `Read the passage then answer the question.

"On a bright Thursday morning, Grade 5 pupils from Seaview Primary visited Devon House in Kingston as part of Tourism Awareness Week. Their teacher, Miss Campbell, asked them to notice why visitors from Jamaica and overseas enjoy the landmark. At the entrance, a guide named Mr. Lewis welcomed the class and explained that Devon House was built by Jamaica's first black millionaire, George Stiebel. He said the great house, gardens, craft shops, and famous ice-cream store all help tell a story about Jamaican history and hospitality.

The pupils watched a group of visitors taking photographs beside the fountain. Some visitors asked about the wooden shutters, wide verandas, and old furniture inside the house. Mr. Lewis reminded the class that tourism is not only about beaches. It also includes heritage sites, food, music, stories, and friendly service. He explained that each visitor supports the economy when money is spent on tickets, meals, souvenirs, or transport.

Near the craft courtyard, an artisan showed the pupils handmade straw baskets and carved key rings. Tiana noticed that the artisan spoke proudly about using local materials. Before leaving, the class discussed one problem: too many careless visitors could damage historic objects or leave litter in the gardens. They suggested clear signs, guided tours, and student volunteers to help protect the attraction. Miss Campbell told them that responsible tourism means welcoming visitors while preserving the places that make Jamaica special."`;

const culturePassage = `Read the passage then answer the question.

"Every August, the people of Cedar Valley prepare for Heritage Day at the community centre. The festival began when elders became worried that children knew more about foreign television shows than about local songs, Anansi stories, and traditional foods. This year, Mrs. Reid, the librarian, invited Grade 5 students to help preserve the celebration by interviewing older residents and creating display cards.

Malik interviewed Grandpa Joseph, who demonstrated how he used to make a bamboo fife for village gatherings. Asha spoke with Miss Pearl, a retired dressmaker who still sews bandana skirts for folk dances. The students learned that cultural preservation does not mean locking the past away. It means keeping useful traditions alive so that young people understand where they come from.

On the morning of Heritage Day, rain threatened to spoil the outdoor booths. Instead of cancelling, the planning team moved the craft tables under the veranda and placed the drummers inside the hall. Visitors followed arrows made by the students to see pottery, old photographs, story posters, and a tasting table with sweet potato pudding. During the closing ceremony, Mrs. Reid thanked the artisans, cooks, musicians, and students. She reminded everyone that a community loses part of its identity when important customs are forgotten. Malik felt proud because his display card about the bamboo fife helped younger children ask questions. The festival showed that preserving culture takes planning, respect, and people willing to share authentic knowledge."`;

const g5LaModerate10Questions: Question[] = [
  {id:1,type:"reading",skill:"Main Idea",question:`${tourismPassage}\n\nWhat is the main idea of the passage?`,options:["A class learns that Jamaican tourism includes heritage, hospitality, and protecting special places.","A class visits Devon House only to buy ice cream before returning to school.","A guide explains why tourists should visit beaches instead of historic landmarks.","An artisan teaches pupils that souvenirs are more important than history."],correctAnswer:0,explanation:"The whole passage shows pupils learning how Devon House connects tourism, history, the economy, and preservation."},
  {id:2,type:"reading",skill:"Text Evidence",question:`${tourismPassage}\n\nWhich detail best shows that Devon House is a heritage attraction?`,options:["Mr. Lewis explained that it was built by George Stiebel and contains historic features.","The class arrived on a bright Thursday morning during Tourism Awareness Week.","Visitors took photographs beside the fountain near the entrance.","The pupils saw key rings for sale in the craft courtyard."],correctAnswer:0,explanation:"The reference to George Stiebel and the old house features directly proves its heritage value."},
  {id:3,type:"reading",skill:"Cause and Effect",question:`${tourismPassage}\n\nAccording to Mr. Lewis, how can visitors help Jamaica's economy?`,options:["They spend money on tickets, meals, souvenirs, or transport.","They stand beside the fountain to take photographs.","They ask pupils to complete their schoolwork for them.","They replace guided tours with careless walking."],correctAnswer:0,explanation:"Mr. Lewis says visitor spending on services and goods supports the economy."},
  {id:4,type:"reading",skill:"Inference",question:`${tourismPassage}\n\nWhat can be inferred about Tiana when she notices the artisan's pride in local materials?`,options:["She understands that handmade items can reflect Jamaican identity.","She thinks imported materials are always better than local ones.","She wants the class to leave the craft courtyard immediately.","She believes the artisan dislikes explaining his work."],correctAnswer:0,explanation:"Tiana's observation shows she is connecting the craft to local culture and pride."},
  {id:5,type:"reading",skill:"Author's Purpose",question:`${tourismPassage}\n\nWhy does the author include the problem of careless visitors?`,options:["To show that tourism must be managed so attractions are protected.","To prove that no visitors should be allowed at Devon House.","To explain why the class should avoid all historic buildings.","To show that gardens are less important than shops."],correctAnswer:0,explanation:"The problem leads to solutions such as signs, tours, and volunteers, emphasizing responsible tourism."},
  {id:6,type:"reading",skill:"Vocabulary in Context",question:`${tourismPassage}\n\nIn the passage, what does “hospitality” mean?`,options:["friendly and helpful treatment of guests or visitors","a wooden shutter used to cool an old house","a ticket booth at the entrance of a landmark","money spent only on transportation"],correctAnswer:0,explanation:"Mr. Lewis connects hospitality with friendly service offered to visitors."},
  {id:7,type:"reading",skill:"Supporting Details",question:`${tourismPassage}\n\nWhich solution did the pupils suggest for protecting Devon House?`,options:["Use clear signs, guided tours, and student volunteers.","Close the craft courtyard and remove all visitors.","Replace the gardens with a larger parking area.","Stop teaching students about George Stiebel."],correctAnswer:0,explanation:"The final paragraph lists those solutions after the class discusses possible damage and litter."},
  {id:8,type:"reading",skill:"Sequence",question:`${culturePassage}\n\nWhat happened after rain threatened the outdoor booths on Heritage Day?`,options:["The planning team moved craft tables under the veranda and drummers inside the hall.","Mrs. Reid cancelled all interviews with older residents.","Malik stopped working on his bamboo fife display card.","Visitors were told to return the following August."],correctAnswer:0,explanation:"After the rain threat, the team adjusted the festival layout instead of cancelling."},
  {id:9,type:"reading",skill:"Theme",question:`${culturePassage}\n\nWhich lesson best fits the passage?`,options:["Culture survives when people plan carefully and share traditions respectfully.","Old customs should be hidden so children focus only on new things.","Festivals are successful only when the weather is perfect.","Students cannot help adults preserve community traditions."],correctAnswer:0,explanation:"The festival succeeds because elders, artisans, students, and planners share authentic knowledge."},
  {id:10,type:"reading",skill:"Point of View",question:`${culturePassage}\n\nWhich statement best shows Mrs. Reid's point of view?`,options:["Important customs should be remembered because they help shape community identity.","Children should learn only from foreign television programmes.","Rain makes cultural events impossible to continue.","Display cards are not useful at a community festival."],correctAnswer:0,explanation:"Mrs. Reid says a community loses part of its identity when customs are forgotten."},
  {id:11,type:"reading",skill:"Supporting Details",question:`${culturePassage}\n\nWhat did Malik learn from Grandpa Joseph?`,options:["How a bamboo fife was made for village gatherings","How to sew bandana skirts for folk dances","How to bake sweet potato pudding for visitors","How to draw arrows for the tasting table"],correctAnswer:0,explanation:"Malik interviewed Grandpa Joseph, who demonstrated making a bamboo fife."},
  {id:12,type:"reading",skill:"Inference",question:`${culturePassage}\n\nWhy did Malik feel proud at the end of the festival?`,options:["His display card encouraged younger children to ask about the bamboo fife.","He won a prize for cancelling the outdoor booths.","He proved that children dislike Anansi stories.","His interview stopped the drummers from performing."],correctAnswer:0,explanation:"Malik's work helped younger children become curious, so he felt his contribution mattered."},
  {id:13,type:"reading",skill:"Author's Purpose",question:`${culturePassage}\n\nWhy does the author mention Anansi stories, bandana skirts, pottery, and sweet potato pudding?`,options:["To give examples of traditions and cultural items being preserved","To list items that visitors were not allowed to see","To show that the festival had no organised activities","To explain why the community centre closed early"],correctAnswer:0,explanation:"These examples help readers understand the kinds of Jamaican culture shared at Heritage Day."},
  {id:14,type:"reading",skill:"Cause and Effect",question:`${culturePassage}\n\nWhy did Heritage Day begin?`,options:["Elders worried that children were forgetting local songs, stories, and foods.","Mrs. Reid wanted to replace the library with a craft shop.","The students asked to stop interviewing older residents.","Visitors complained that the community had too many customs."],correctAnswer:0,explanation:"The first paragraph explains that elders started the festival because children knew too little about local traditions."},
  {id:15,type:"reading",skill:"Vocabulary in Context",question:`${culturePassage}\n\nIn the passage, what does “authentic” mean?`,options:["real and true to the culture being shared","newly invented without any connection to history","copied quickly from a foreign television show","kept secret so no one can learn it"],correctAnswer:0,explanation:"The passage connects authentic knowledge with traditions shared by elders and skilled community members."},
  {id:16,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, “heritage” most nearly means—",options:["history, customs, and valued things passed down from the past","a bus route used by visitors to reach Kingston","a modern shop that sells imported snacks","a rule that prevents students from asking questions"],correctAnswer:0,explanation:"Devon House is presented as a heritage site because it tells an important story from Jamaica's past."},
  {id:17,type:"vocabulary",skill:"Vocabulary in Context",question:"In the culture passage, to “preserve” means to—",options:["protect and keep something important for the future","throw something away because it is old","change a tradition until no one recognises it","hide information from younger children"],correctAnswer:0,explanation:"The students help preserve Heritage Day by recording and sharing traditions."},
  {id:18,type:"vocabulary",skill:"Vocabulary in Context",question:"In the culture passage, a “tradition” is—",options:["a custom or practice passed from one generation to another","a weather report about rain on festival morning","a ticket used to enter a great house","a mistake printed on a display card"],correctAnswer:0,explanation:"Songs, stories, foods, music, and crafts in the passage are traditions passed down over time."},
  {id:19,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, an “attraction” is—",options:["a place or activity that visitors want to see or experience","a warning sign that tells pupils to leave quickly","a school exercise about punctuation marks","a private object that no visitor may view"],correctAnswer:0,explanation:"Devon House is called an attraction because visitors come to experience its history, shops, and gardens."},
  {id:20,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, a “visitor” is—",options:["a person who comes to see a place for a time","a person who owns every landmark in Kingston","a student who never leaves the classroom","a guide who refuses to speak to guests"],correctAnswer:0,explanation:"The visitors at Devon House take photographs and ask questions during their visit."},
  {id:21,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, a “landmark” is—",options:["an important and easily recognised place","a small error in a visitor brochure","a meal served only during rain","a tool for carving wooden key rings"],correctAnswer:0,explanation:"Devon House is described as a landmark because it is a well-known historic place in Kingston."},
  {id:22,type:"vocabulary",skill:"Vocabulary in Context",question:"In the culture passage, a “festival” is—",options:["a special event with activities that celebrate something","a private interview that no one may attend","a single object locked inside a library cupboard","a problem caused by rainy weather only"],correctAnswer:0,explanation:"Heritage Day includes booths, music, food, displays, and a ceremony, making it a festival."},
  {id:23,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, an “artisan” is—",options:["a skilled person who makes things by hand","a tourist who buys every souvenir in a shop","a driver who takes pupils back to school","a person who repairs only old verandas"],correctAnswer:0,explanation:"The artisan shows handmade baskets and carved key rings."},
  {id:24,type:"vocabulary",skill:"Vocabulary in Context",question:"In the tourism passage, “economy” means—",options:["the system of money, jobs, buying, and selling in a place","the number of photographs visitors take at a fountain","the exact route from Seaview Primary to Devon House","the colour chosen for shutters on a great house"],correctAnswer:0,explanation:"Visitor spending on tickets, meals, souvenirs, and transport supports money and jobs in Jamaica."},
  {id:25,type:"vocabulary",skill:"Word Meaning",question:"To restore a damaged old photograph would mean to—",options:["repair it so it is closer to its original condition","hide it because it shows people from the past","sell it before anyone can study it","rename it without looking at its details"],correctAnswer:0,explanation:"Restore means repair or bring back; this fits cultural preservation work with old photographs."},
  {id:26,type:"grammar",skill:"Subject-Verb Agreement",question:"Which sentence is written correctly?",options:["The guide explains the landmark's history to the visitors.","The guide explain the landmark's history to the visitors.","The guide explaining the landmark's history to the visitors.","The guide were explain the landmark's history to the visitors."],correctAnswer:0,explanation:"The singular subject guide needs the verb explains."},
  {id:27,type:"grammar",skill:"Verb Tense",question:"Which sentence uses past tense correctly?",options:["Yesterday, the students interviewed the elders for Heritage Day.","Yesterday, the students interview the elders for Heritage Day.","Yesterday, the students will interview the elders for Heritage Day.","Yesterday, the students interviewing the elders for Heritage Day."],correctAnswer:0,explanation:"Interviewed correctly shows an action completed yesterday."},
  {id:28,type:"grammar",skill:"Pronouns",question:"Choose the sentence with the correct pronoun.",options:["Mrs. Reid gave Asha and me display cards.","Mrs. Reid gave Asha and I display cards.","Mrs. Reid gave she and me display cards.","Mrs. Reid gave I and Asha display cards."],correctAnswer:0,explanation:"Me is the correct object pronoun after gave."},
  {id:29,type:"grammar",skill:"Punctuation",question:"Which sentence is punctuated correctly?",options:["After the tour ended, Tiana thanked the artisan.","After the tour ended Tiana, thanked the artisan.","After, the tour ended Tiana thanked the artisan.","After the tour, ended Tiana thanked the artisan."],correctAnswer:0,explanation:"A comma should follow the introductory phrase After the tour ended."},
  {id:30,type:"grammar",skill:"Quotation Marks",question:"Which sentence uses quotation marks correctly?",options:["“Please protect the gardens,” Mr. Lewis told the visitors.","Please protect the gardens, “Mr. Lewis told the visitors.”","“Please protect the gardens, Mr. Lewis told the visitors.","Please protect the gardens,” Mr. Lewis told the visitors."],correctAnswer:0,explanation:"The exact spoken words are enclosed in quotation marks, and the comma is inside the closing quotation mark."},
  {id:31,type:"grammar",skill:"Conjunctions",question:"Which conjunction best completes the sentence?\nThe rain began, ___ the planning team moved the booths under the veranda.",options:["so","although","unless","but"],correctAnswer:0,explanation:"So shows the result of the rain beginning."},
  {id:32,type:"grammar",skill:"Transitions",question:"Which transition best completes the sentence?\nFirst, visitors toured the great house. ___, they visited the craft courtyard.",options:["Next","However","In contrast","For this reason only"],correctAnswer:0,explanation:"Next shows the following event in a sequence."},
  {id:33,type:"grammar",skill:"Apostrophes",question:"Which sentence uses an apostrophe correctly?",options:["Jamaica's landmarks attract many visitors each year.","Jamaicas landmarks attract many visitors each year.","Jamaicas' landmark's attract many visitors each year.","Jamaica's landmark's attract many visitor's each year."],correctAnswer:0,explanation:"Jamaica's correctly shows that the landmarks belong to or are connected with Jamaica."},
  {id:34,type:"grammar",skill:"Sentence Combining",question:"Which choice best combines the sentences?\nThe festival celebrates culture. It teaches children about heritage.",options:["The festival celebrates culture and teaches children about heritage.","The festival celebrates culture it teaches children about heritage.","Teaching children, the festival culture about heritage.","Because the festival celebrates culture and."],correctAnswer:0,explanation:"The conjunction and combines two related ideas into a complete sentence."},
  {id:35,type:"grammar",skill:"Fragments and Complete Sentences",question:"Which choice is a complete sentence, not a fragment?",options:["The students created display cards for the festival.","Because the students created display cards.","Under the veranda beside the craft tables.","Preserving songs, stories, and foods."],correctAnswer:0,explanation:"It has a subject, a verb, and a complete thought."},
  {id:36,type:"writing",skill:"Tourism Brochure Writing",question:"Which sentence would be the best opening for a tourism brochure about Devon House?",options:["Visit Devon House to explore Jamaican history, beautiful gardens, local craft, and warm hospitality.","Devon House is a historic Kingston landmark with gardens, shops, and spaces that visitors can explore.","Visitors to Devon House can learn about its history and walk through the surrounding grounds.","Devon House offers visitors information about Jamaican history along with craft and food experiences."],correctAnswer:0,explanation:"A brochure opening should attract visitors and name specific appealing features."},
  {id:37,type:"writing",skill:"Festival Announcement",question:"Which detail should be included in an announcement for Heritage Day?",options:["The date, location, main activities, and why families should attend","The date, location, and names of several festival activities","The location, main activities, and a description of the cultural displays","The date, start time, and reason Heritage Day is being celebrated"],correctAnswer:0,explanation:"An announcement must give practical visitor information and a reason to come."},
  {id:38,type:"writing",skill:"Persuasive Writing",question:"Which sentence best supports an argument that Jamaican landmarks should be protected?",options:["Landmarks teach visitors and students about the people, stories, and achievements that shaped Jamaica.","Historic landmarks attract visitors who are interested in Jamaican culture.","Many landmarks contain old buildings, objects, and displays from the past.","Protecting landmarks allows communities to continue using important historic places."],correctAnswer:0,explanation:"This sentence gives a clear reason connected to education and national heritage."},
  {id:39,type:"writing",skill:"Organisation",question:"Which order best organises an informational paragraph about responsible tourism?",options:["Explain what responsible tourism means, give examples of respectful visitor behaviour, then describe how it protects attractions.","Give examples of respectful visitor behaviour, define responsible tourism, then describe how attractions are protected.","Explain how attractions are protected, define responsible tourism, then give visitor examples.","Define responsible tourism, describe how it protects attractions, then give examples of respectful visitor behaviour."],correctAnswer:0,explanation:"The strongest order defines the topic, gives examples, and explains the importance."},
  {id:40,type:"writing",skill:"Revision",question:"Which revision makes this sentence stronger for a cultural festival report?\nThe event was nice and had things.",options:["The Heritage Day festival featured drumming, pottery displays, Anansi stories, and traditional foods that helped children learn about their culture.","Heritage Day included several traditional activities that helped pupils learn more about Jamaican culture.","The festival had music, food, stories, and craft displays for families and children.","Heritage Day was an enjoyable cultural event with many activities for visitors."],correctAnswer:0,explanation:"The revision uses precise details from a cultural festival and explains why the event mattered."},
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

export default function G5LaModerate10MockTest() {
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
    ? g5LaModerate10Questions
    : g5LaModerate10Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Moderate 10",
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
      ? prepareAssessment(g5LaModerate10Questions)
      : preparePreview(g5LaModerate10Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Moderate 10
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
              <p className="text-slate-600">Language Arts Moderate 10</p>
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
              <h1 className="text-lg font-bold">Language Arts Moderate 10</h1>
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
