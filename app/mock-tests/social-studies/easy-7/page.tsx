"use client"

import { useState, useEffect, useCallback } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle,
  Globe, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { prepareSocialStudiesAssessment, prepareSocialStudiesPreview } from "@/lib/social-studies-assessment-engine"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "history" | "geography" | "civics" | "economics"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5SsEasy7Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `Nanny of the Maroons was known for her leadership of which group of Maroons?`,
    options: [
      "Leeward Maroons",
      "Windward Maroons",
      "Moore Town Maroons only",
      "All Maroon groups",
    ],
    correctAnswer: 1,
    explanation: `Queen Nanny led the Windward Maroons, based in the Blue Mountains (Moore Town), fighting against the British in the early 18th century.`
  },
  {
    id: 2,
    type: "history",
    skill: "Colonial History",
    question: `What was a 'plantation' in colonial Jamaica?`,
    options: [
      "A large garden for flowers",
      "A large farming estate using enslaved labour to grow cash crops like sugar",
      "A free village for formerly enslaved people",
      "A Maroon settlement",
    ],
    correctAnswer: 1,
    explanation: `A plantation was a large agricultural estate — in colonial Jamaica, primarily growing sugar, coffee, or other export crops using enslaved labour.`
  },
  {
    id: 3,
    type: "history",
    skill: "Cultural Heritage",
    question: `The 'Order of National Hero' is awarded to persons who:`,
    options: [
      "Win medals at international sporting events",
      "Have made extraordinary contributions to Jamaica's development and the welfare of its people",
      "Are born in Jamaica",
      "Serve as Prime Minister for more than 10 years",
    ],
    correctAnswer: 1,
    explanation: `The Order of National Hero is the highest honour in Jamaica, bestowed on those who have made exceptional contributions to the country's history and development.`
  },
  {
    id: 4,
    type: "history",
    skill: "First Peoples",
    question: `The Taino's main transport on water was:`,
    options: [
      "Large sailing ships",
      "Canoes carved from tree trunks",
      "Bamboo rafts",
      "Small motor boats",
    ],
    correctAnswer: 1,
    explanation: `The Taino used dugout canoes — hollowed-out tree trunks — for fishing, transportation between islands, and trade.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cultural Heritage",
    question: `Which two National Heroes appear together on Jamaica's current $500 polymer banknote?`,
    options: [
      "Marcus Garvey and George William Gordon",
      "Nanny of the Maroons and Sam Sharpe",
      "Norman Manley and Sir Alexander Bustamante",
      "Paul Bogle and Marcus Garvey",
    ],
    correctAnswer: 1,
    explanation: `Nanny of the Maroons and Sam Sharpe appear together on Jamaica's current $500 polymer banknote.`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `The Triangular Trade involved which THREE regions?`,
    options: [
      "Africa, Asia, and Europe",
      "Europe, Africa, and the Americas",
      "North America, South America, and the Caribbean",
      "Britain, France, and Spain",
    ],
    correctAnswer: 1,
    explanation: `The Triangular Trade connected Europe (manufactured goods), Africa (enslaved people), and the Americas (raw materials like sugar and tobacco).`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `Which of Jamaica's national symbols represents endurance, strength, and resilience?`,
    options: [
      "The hummingbird",
      "The Lignum Vitae tree",
      "The crocodile",
      "The mongoose",
    ],
    correctAnswer: 1,
    explanation: `The Lignum Vitae ('Wood of Life') is both the national flower and the national tree of Jamaica. The wood is extremely hard and durable, symbolising endurance.`
  },
  {
    id: 8,
    type: "history",
    skill: "Independence",
    question: `Jamaica became a member of the United Nations in:`,
    options: [
      "1945",
      "1955",
      "1962",
      "1975",
    ],
    correctAnswer: 2,
    explanation: `Jamaica joined the United Nations in 1962, the same year it gained independence, becoming a full member of the international community.`
  },
  {
    id: 9,
    type: "history",
    skill: "National Heroes",
    question: `George William Gordon was executed following which event?`,
    options: [
      "The Christmas Rebellion",
      "The Emancipation",
      "The Morant Bay Rebellion",
      "The Maroon wars",
    ],
    correctAnswer: 2,
    explanation: `Gordon was tried by a military court and executed after the Morant Bay Rebellion (1865), despite disputed evidence of his direct involvement.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `The JAMAICAN patois (Creole) language developed from:`,
    options: [
      "Pure West African languages",
      "Pure English",
      "A blend of West African languages with English and other European languages",
      "Taino language only",
    ],
    correctAnswer: 2,
    explanation: `Jamaican Patois (Creole) developed from the mixing of West African languages (brought by enslaved people) with English (the colonial language) and elements of other European languages.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `What is the longest river system in Jamaica?`,
    options: [
      "Rio Cobre",
      "Great River",
      "Rio Minho",
      "Black River",
    ],
    correctAnswer: 2,
    explanation: `The Rio Minho is Jamaica's longest river at approximately 92 km, flowing from Manchester through Clarendon to the Caribbean Sea.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Agriculture and Regions",
    question: `Which Jamaican mountain region is famous for producing Blue Mountain Coffee?`,
    options: [
      "Cockpit Country",
      "Blue Mountains",
      "Pedro Plains",
      "Dry Harbour Mountains",
    ],
    correctAnswer: 1,
    explanation: `Blue Mountain Coffee is grown in the recognised Blue Mountain region at high elevations in parts of several eastern Jamaican parishes.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `What does a TOPOGRAPHIC MAP show?`,
    options: [
      "Population distribution",
      "Rainfall patterns only",
      "The shape and elevation of land using contour lines",
      "Political boundaries only",
    ],
    correctAnswer: 2,
    explanation: `A topographic map uses contour lines to show the shape, slope, and elevation of land — giving a three-dimensional view of terrain on a flat map.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environment",
    question: `What is the importance of WETLANDS (like Jamaica's Black River Morass)?`,
    options: [
      "They are areas of wasted land",
      "They filter water, support biodiversity, protect coasts from flooding, and provide fish and wildlife habitat",
      "They are only good for tourism",
      "They produce bauxite",
    ],
    correctAnswer: 1,
    explanation: `Wetlands provide critical ecosystem services: filtering water, reducing flood risk, storing carbon, and providing habitat for diverse wildlife including birds and fish.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Physical Features",
    question: `What type of rock MOST commonly forms the Cockpit Country?`,
    options: [
      "Granite",
      "Sandstone",
      "Limestone",
      "Volcanic rock",
    ],
    correctAnswer: 2,
    explanation: `The Cockpit Country is composed of karst limestone — a porous rock that dissolves in rainwater, creating the unique cone-shaped hills and underground caves.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `Which county of Jamaica is located in the EAST?`,
    options: [
      "Cornwall",
      "Middlesex",
      "Surrey",
      "Portland",
    ],
    correctAnswer: 2,
    explanation: `Surrey County is located in eastern Jamaica, comprising the parishes of Kingston, St. Andrew, Portland, and St. Thomas.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate",
    question: `A RAIN SHADOW is an area that is:`,
    options: [
      "The wettest part of an island",
      "A sheltered area of low rainfall on the leeward (sheltered) side of mountains",
      "A tropical storm zone",
      "A cloudy region near the sea",
    ],
    correctAnswer: 1,
    explanation: `A rain shadow forms on the leeward (sheltered) side of mountains — as moist air rises and cools on the windward side (causing rain), little moisture remains for the other side, creating a drier zone.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Disasters",
    question: `What is a FAULT LINE?`,
    options: [
      "A mistake on a map",
      "A crack or fracture in the Earth's crust along which movement can occur, potentially causing earthquakes",
      "A river that has dried up",
      "A path through mountains",
    ],
    correctAnswer: 1,
    explanation: `A fault line is a fracture in the Earth's crust. Jamaica lies near the boundary of the Caribbean and North American plates, making it earthquake-prone.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What is a LAGOON?`,
    options: [
      "A type of waterfall",
      "A shallow body of water separated from the sea by a sandbar or coral reef",
      "A deep mountain lake",
      "An underwater cave",
    ],
    correctAnswer: 1,
    explanation: `A lagoon is a shallow coastal body of water separated from the open sea by a reef, sandbar, or narrow strip of land — Jamaica's Blue Lagoon in Portland is famous.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `The Lesser Antilles are a chain of islands that include:`,
    options: [
      "Jamaica, Cuba, and Haiti",
      "Small islands from the Virgin Islands to Trinidad and Tobago",
      "Puerto Rico and Hispaniola",
      "Only Barbados and St. Lucia",
    ],
    correctAnswer: 1,
    explanation: `The Lesser Antilles are the smaller island arc stretching from the Virgin Islands in the north to Trinidad in the south — including Barbados, St. Lucia, Antigua, and many others.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `What is a REFERENDUM?`,
    options: [
      "A type of court case",
      "A direct vote by the public on a specific question or proposal",
      "A committee meeting",
      "A type of petition",
    ],
    correctAnswer: 1,
    explanation: `A referendum is a direct public vote on a specific political question — citizens vote yes or no on an issue rather than choosing representatives.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Rights",
    question: `The RIGHT TO EQUALITY before the law means:`,
    options: [
      "All citizens have the same income",
      "Rich and poor, powerful and ordinary — all must be treated equally under the law",
      "Only some citizens have legal rights",
      "Laws apply differently based on social status",
    ],
    correctAnswer: 1,
    explanation: `Equality before the law means every person, regardless of race, class, gender, or status, is subject to the same laws and entitled to equal legal protection.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government",
    question: `Jamaica's PERMANENT SECRETARY is:`,
    options: [
      "The head of the judiciary",
      "The most senior civil servant in a government ministry, responsible for administration",
      "A member of the Cabinet",
      "The Governor General's assistant",
    ],
    correctAnswer: 1,
    explanation: `A Permanent Secretary is the administrative head of a government ministry — a career civil servant (not political) who ensures the ministry functions efficiently.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Process",
    question: `What is PROPORTIONAL REPRESENTATION?`,
    options: [
      "A system where the number of seats a party wins is proportional to the votes received",
      "Jamaica's current electoral system",
      "A form of local government",
      "The process of counting election votes",
    ],
    correctAnswer: 0,
    explanation: `Proportional representation is an electoral system where parties receive seats in proportion to their vote share. Jamaica uses a first-past-the-post system instead.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `Which of the following is a CARICOM body that promotes health in the Caribbean?`,
    options: [
      "CSME",
      "CARPHA (Caribbean Public Health Agency)",
      "CARICOM Sports Council",
      "Caribbean Trade Bureau",
    ],
    correctAnswer: 1,
    explanation: `CARPHA (Caribbean Public Health Agency) is CARICOM's regional health organisation, coordinating public health across member states.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `MEDIA FREEDOM in a democracy means:`,
    options: [
      "The media can publish anything without any responsibility",
      "Journalists have the right to report news and hold power to account without government censorship",
      "Only government-owned media can broadcast",
      "The media must support the government",
    ],
    correctAnswer: 1,
    explanation: `Media freedom is the right of journalists to report freely, investigate, and criticise power — essential for accountability in a democracy.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `A NEIGHBOURHOOD WATCH programme is an example of:`,
    options: [
      "Government neglecting public safety",
      "Community members taking responsibility for safety by looking out for each other",
      "Police replacing neighbourhood surveillance",
      "A type of tax collection",
    ],
    correctAnswer: 1,
    explanation: `Neighbourhood Watch involves community members monitoring their area, reporting suspicious activity, and cooperating with police — a grassroots safety strategy.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `What is the ROLE of a MEMBER OF PARLIAMENT (MP)?`,
    options: [
      "To be the head of the Judiciary",
      "To represent the interests of their constituency's voters in Parliament and hold the government accountable",
      "To manage local government services",
      "To appoint senators",
    ],
    correctAnswer: 1,
    explanation: `MPs represent their constituents in the House of Representatives — debating laws, questioning the government, and advocating for their community's needs.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `What is PRESUMPTION OF INNOCENCE?`,
    options: [
      "Everyone is considered guilty until proven innocent",
      "A person accused of a crime is considered innocent until proven guilty in a court of law",
      "Only citizens have the presumption of innocence",
      "Courts always find defendants guilty",
    ],
    correctAnswer: 1,
    explanation: `The presumption of innocence is a cornerstone of criminal justice — no one can be punished unless their guilt has been proven beyond reasonable doubt in a fair trial.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `Which of the following is a right protected by Jamaica's Charter of Fundamental Rights and Freedoms?`,
    options: [
      "The right to ignore laws you disagree with",
      "Freedom of expression",
      "The right to receive any job you choose",
      "The right to take another person's property",
    ],
    correctAnswer: 1,
    explanation: `Freedom of expression is one of the rights protected by Jamaica's Charter of Fundamental Rights and Freedoms. Rights operate within the law and do not give a person permission to violate the rights of others.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `Which activity is a SECONDARY economic activity?`,
    options: [
      "Growing sugar cane",
      "Turning sugar cane into rum at a factory",
      "Teaching pupils at a school",
      "Catching fish at sea",
    ],
    correctAnswer: 1,
    explanation: `Secondary economic activities turn raw materials into products. Making rum from sugar cane is manufacturing, so it is a secondary activity.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `What is 'AGRO-PROCESSING'?`,
    options: [
      "Only growing crops",
      "Using machinery to speed up farming",
      "The processing of agricultural products into food and other goods (e.g., turning sugar cane into rum, or fruit into juice)",
      "A type of farming equipment",
    ],
    correctAnswer: 2,
    explanation: `Agro-processing adds value to raw agricultural products — turning them into processed foods, beverages, or other goods. It bridges primary and secondary economic activities.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What is a FREE TRADE AGREEMENT?`,
    options: [
      "An agreement to give goods away for free",
      "A treaty between countries to reduce or eliminate trade barriers (like tariffs) and facilitate more open trade",
      "A ban on all foreign products",
      "A type of CARICOM law",
    ],
    correctAnswer: 1,
    explanation: `A free trade agreement (FTA) removes trade barriers between signatory countries — allowing goods and services to flow more freely, which can benefit consumers and exporters.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `What is the ROLE of the OFFICE OF THE CHILDREN'S ADVOCATE in Jamaica?`,
    options: [
      "To provide free legal services for all citizens",
      "To independently monitor, protect, and promote the rights of children in Jamaica",
      "To run the school system",
      "To provide foster care",
    ],
    correctAnswer: 1,
    explanation: `The Office of the Children's Advocate (OCA) is an independent body that investigates complaints, promotes child rights, and holds duty-bearers accountable for children's welfare.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism",
    question: `Why is HERITAGE TOURISM important?`,
    options: [
      "It only benefits museum owners",
      "It generates income while preserving cultural and historical sites and educating visitors about the past",
      "It is only for foreign tourists",
      "It replaces agriculture in rural areas",
    ],
    correctAnswer: 1,
    explanation: `Heritage tourism — visiting historical sites, cultural events, and traditional communities — generates economic benefits while giving communities an incentive to preserve their heritage.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `Why is it helpful for a family to save some of the money it receives?`,
    options: [
      "Saving guarantees that the family will become rich.",
      "Savings can help the family prepare for future needs or unexpected expenses.",
      "Saving means the family never needs a budget.",
      "Money that is saved can no longer be used in the future.",
    ],
    correctAnswer: 1,
    explanation: `Saving sets aside some money for future needs or emergencies. It is one part of responsible budgeting and does not guarantee wealth.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `What is a BUSINESS PLAN?`,
    options: [
      "A document that describes what a business sells",
      "A detailed written plan outlining a business's goals, strategies, target market, financial projections, and operational plan",
      "A list of business expenses",
      "A government application for a licence",
    ],
    correctAnswer: 1,
    explanation: `A business plan is a comprehensive document guiding a new or existing business — it maps out objectives, how to achieve them, and the financial projections, and is essential for seeking investment.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Trade",
    question: `Which example shows Jamaica IMPORTING a good?`,
    options: [
      "A Jamaican farmer sells coffee to a buyer overseas.",
      "A Jamaican business buys petroleum from another country.",
      "A craft worker sells locally made baskets to tourists in Jamaica.",
      "A Jamaican company sends rum to customers abroad.",
    ],
    correctAnswer: 1,
    explanation: `An import is a good or service bought from another country. Buying petroleum from abroad is an example of Jamaica importing a good.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `Which action BEST helps conserve a renewable natural resource?`,
    options: [
      "Cutting all the trees from a hillside at once",
      "Replanting trees after some have been harvested",
      "Using more petroleum each year",
      "Removing mangroves to create more bare coastline",
    ],
    correctAnswer: 1,
    explanation: `Trees are renewable when forests are managed responsibly. Replanting after harvesting helps the resource recover and remain available in the future.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `What is the ROLE of the CONSUMER in an economy?`,
    options: [
      "Only to produce goods",
      "To purchase goods and services — their demand drives production, influences prices, and signals what the economy should produce",
      "To set prices",
      "To manage businesses",
    ],
    correctAnswer: 1,
    explanation: `Consumers are the engine of demand — their purchasing decisions drive production, shape industries, and signal to businesses and governments what goods and services are needed.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsEasy7Questions.length : FREE_QUESTION_LIMIT

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (!started || showResults) return
    const t = setInterval(() => setTimeLeft((p) => { if (p <= 1) { setShowResults(true); return 0 } return p - 1 }), 1000)
    return () => clearInterval(t)
  }, [started, showResults])

  const handleAnswer = (idx: number) => { const a = [...answers]; a[currentQuestion] = idx; setAnswers(a) }

  const startTest = () => {
    const preparedQuestions = isPremium
      ? prepareSocialStudiesAssessment(g5SsEasy7Questions)
      : prepareSocialStudiesPreview(g5SsEasy7Questions, FREE_QUESTION_LIMIT)
    setAttemptQuestions(preparedQuestions)
    setAnswers(new Array(preparedQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    setStarted(true)
  }

  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Social Studies",
        testName: "Easy 7",
        difficulty: "Easy",
        score: calcScore(),
        totalQuestions,
        percentage: scorePct(),
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    }
  }

  const getGrade = () => {
    const p = scorePct()
    if (p >= 85) return { grade: "Excellent",         color: "text-green-600" }
    if (p >= 70) return { grade: "Good",              color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",              color: "text-amber-600" }
    return              { grade: "Needs Improvement", color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => { const i = availableQuestions.findIndex((x) => x.id === q.id); return answers[i] === q.correctAnswer }).length
    const total = sq.length
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Fair" : "Needs Improvement"
    const color  = pct >= 85 ? "text-green-600" : pct >= 70 ? "text-blue-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage: pct, rating, ratingColor: color }
  }

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setAttemptQuestions([]); setAnswers([]); setTimeLeft(60 * 60)
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) =>
    t === "history" ? "History & Heritage" : t === "geography" ? "Geography & Environment"
    : t === "civics" ? "Civics & Government" : "Economics & Community"
  const secColor = (t: Question["type"]) =>
    t === "history" ? "bg-amber-50 text-amber-800" : t === "geography" ? "bg-green-50 text-green-800"
    : t === "civics" ? "bg-blue-50 text-blue-800" : "bg-purple-50 text-purple-800"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/social-studies"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Social Studies Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 text-center">
            <Globe className="mx-auto mb-4 h-14 w-14 text-green-700" />
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 7</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Easy Level</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isPremium && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Free Preview Mode</p>
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-green-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
              <p className="text-slate-700">This Grade 5 Social Studies test covers Jamaica's history and heritage, geography and environment, civics and government, and economics and community — all aligned to the NSC curriculum and PEP assessment standards.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-sm font-semibold text-amber-800">History & Heritage</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-sm font-semibold text-green-800">Geography & Environment</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-sm font-semibold text-blue-800">Civics & Government</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-sm font-semibold text-purple-800">Economics & Community</p><p className="text-xs text-slate-600">10 Questions</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-green-700">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-green-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={startTest} className="w-full bg-green-700 py-6 text-lg hover:bg-green-800">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-700" />
              <CardTitle className="text-2xl text-green-800">Social Studies Test Completed</CardTitle>
              <p className="text-slate-600">Social Studies Easy 7</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-green-700">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-green-700">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade to access all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="font-semibold text-green-800">{s.label}</p>
                    <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span>
                      <span className={cn("text-sm font-semibold", st.ratingColor)}>{st.rating}</span>
                    </div>
                    <Progress value={st.percentage} className="h-2 mt-2" />
                    <p className="text-xs text-slate-500 mt-1">{st.percentage}%</p>
                  </div>
                )})}
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-green-700">{q.skill}</span></p>
                          <p className="mt-1 text-slate-700 text-sm">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.correctAnswer]}</p>
                          <p className="mt-1 text-sm text-slate-700">Explanation: {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-green-700 hover:bg-green-800"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/social-studies" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Social Studies Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      <Header />
      <header className="bg-green-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/social-studies" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <Globe className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Social Studies Easy 7</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-green-600")}>
            <Clock className="h-5 w-5" />{formatTime(timeLeft)}
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {answeredCount}/{totalQuestions} answered</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade to Premium for full access.</p></div>)}
          <Card className="mb-6 border-green-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">{q.skill}</span>
                <span className="text-xs uppercase tracking-wide opacity-70">{secLabel(q.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className={cn("w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx ? "border-green-700 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-green-50/50")}>
                    <span className="font-medium text-green-800 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-green-700 hover:bg-green-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-green-700 hover:bg-green-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-green-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-green-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-green-700 text-white"
                      : answers[idx] !== null ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-700" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100" /><span>Answered</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /><span>Unanswered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
