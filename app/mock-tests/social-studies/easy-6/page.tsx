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

const g5SsEasy6Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `Alexander Bustamante is remembered as:`,
    options: [
      "A Jamaican poet",
      "The founder of the Bustamante Industrial Trade Union and Jamaica's first Prime Minister",
      "A leader of the Morant Bay Rebellion",
      "A Maroon chief",
    ],
    correctAnswer: 1,
    explanation: `Sir Alexander Bustamante founded the BITU (Jamaica's first major trade union), championed workers' rights, founded the JLP, and served as Jamaica's first Prime Minister.`
  },
  {
    id: 2,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Rastafari movement began in Jamaica in which decade?`,
    options: [
      "1910s",
      "1920s",
      "1930s",
      "1950s",
    ],
    correctAnswer: 2,
    explanation: `Rastafari emerged in Jamaica in the 1930s, inspired by Marcus Garvey's teachings and the coronation of Haile Selassie I of Ethiopia.`
  },
  {
    id: 3,
    type: "history",
    skill: "Colonial History",
    question: `The Spanish introduced which animals to Jamaica that the Maroons later used?`,
    options: [
      "Donkeys and mules",
      "Pigs, cattle, and horses",
      "Goats and sheep only",
      "Chickens only",
    ],
    correctAnswer: 1,
    explanation: `The Spanish introduced pigs, cattle, and horses to Jamaica. The Maroons used these animals for food and transportation in their mountain communities.`
  },
  {
    id: 4,
    type: "history",
    skill: "National Heroes",
    question: `Paul Bogle's rebellion took place in which parish?`,
    options: [
      "Kingston",
      "St. Thomas",
      "St. Ann",
      "Portland",
    ],
    correctAnswer: 1,
    explanation: `The Morant Bay Rebellion (October 1865) took place in St. Thomas — specifically at the Morant Bay courthouse.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cultural Heritage",
    question: `Which annual festival celebrates Jamaica's African heritage with traditional music, dance, and food?`,
    options: [
      "Carnival",
      "Independence celebrations",
      "Accompong Maroon Festival",
      "National Heroes Day parade",
    ],
    correctAnswer: 2,
    explanation: `The Accompong Maroon Festival, held on January 6, celebrates the Maroon culture and heritage in St. Elizabeth, Jamaica.`
  },
  {
    id: 6,
    type: "history",
    skill: "First Peoples",
    question: `What is cassava, grown by the Taino people?`,
    options: [
      "A type of fish",
      "A root vegetable used to make bammy and other foods",
      "A tropical fruit",
      "A medicinal plant only",
    ],
    correctAnswer: 1,
    explanation: `Cassava is a starchy root vegetable (also called yuca) that was a Taino staple. Bammy (a flatbread) is still made from cassava today.`
  },
  {
    id: 7,
    type: "history",
    skill: "Colonial History",
    question: `The ABOLITION OF THE SLAVE TRADE (1807) meant:`,
    options: [
      "Slavery in Jamaica ended immediately",
      "No new enslaved people could be brought across the Atlantic, though slavery itself continued",
      "All enslaved people were freed",
      "Britain paid reparations immediately",
    ],
    correctAnswer: 1,
    explanation: `The 1807 Abolition of the Slave Trade Act made it illegal to trade in enslaved people across the Atlantic, but slavery itself in British colonies continued until 1834.`
  },
  {
    id: 8,
    type: "history",
    skill: "Electoral History",
    question: `What important voting change was introduced in Jamaica in 1944?`,
    options: [
      "Only landowners were allowed to vote.",
      "Universal Adult Suffrage gave all qualified adults the right to vote.",
      "Jamaica became independent from Britain.",
      "CARICOM was established.",
    ],
    correctAnswer: 1,
    explanation: `Universal Adult Suffrage was introduced in Jamaica in 1944, greatly widening the right to vote and allowing qualified adults to take part in elections regardless of property ownership.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Heritage",
    question: `'Bob Marley' is internationally associated with which music genre?`,
    options: [
      "Ska",
      "Mento",
      "Reggae",
      "Dancehall",
    ],
    correctAnswer: 2,
    explanation: `Bob Marley and the Wailers popularised reggae music worldwide, making it a global symbol of Jamaica and a vehicle for messages of peace and resistance.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `What is the significance of August 6 in Jamaica?`,
    options: [
      "Emancipation Day",
      "National Heroes Day",
      "Independence Day",
      "Heritage Day",
    ],
    correctAnswer: 2,
    explanation: `August 6 is Jamaica's Independence Day, marking the date in 1962 when Jamaica became an independent nation.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `What is the name of the flat, coastal area on Jamaica's south coast near Kingston?`,
    options: [
      "The Liguanea Plain",
      "The Palisadoes",
      "The Cockpit Country",
      "The Blue Mountains",
    ],
    correctAnswer: 1,
    explanation: `The Palisadoes is a long sand spit on Jamaica's south coast that encloses Kingston Harbour and is home to Norman Manley International Airport.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is home to Dunn's River Falls?`,
    options: [
      "St. Mary",
      "St. Ann",
      "Portland",
      "Trelawny",
    ],
    correctAnswer: 1,
    explanation: `Dunn's River Falls is located in St. Ann parish near Ocho Rios and is one of Jamaica's most visited natural attractions.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `On a political map, what do BOUNDARY LINES show?`,
    options: [
      "The height of mountains",
      "The course of rivers",
      "The borders between countries, regions, or parishes",
      "The location of major roads",
    ],
    correctAnswer: 2,
    explanation: `Boundary lines on political maps show the divisions between countries, states, provinces, or (in Jamaica) parishes.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environment",
    question: `What is SOIL EROSION?`,
    options: [
      "The improvement of soil quality",
      "The washing or blowing away of topsoil from the land",
      "The mixing of different soil types",
      "Adding minerals to soil",
    ],
    correctAnswer: 1,
    explanation: `Soil erosion is the removal of topsoil by wind or water — often caused by deforestation, poor agricultural practices, or heavy rainfall on exposed slopes.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Physical Features",
    question: `A CORAL REEF is found:`,
    options: [
      "On mountain peaks",
      "In deep ocean trenches",
      "In shallow, warm coastal waters",
      "In freshwater rivers",
    ],
    correctAnswer: 2,
    explanation: `Coral reefs grow in shallow, warm, clear ocean waters — Jamaica has extensive reef systems along its coastline, particularly on the north coast.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is known as the 'Queen of the Parishes' and is famous for tourist resorts?`,
    options: [
      "Kingston",
      "Westmoreland",
      "St. James",
      "St. Ann",
    ],
    correctAnswer: 2,
    explanation: `St. James is known as the 'Queen of the Parishes,' home to Montego Bay with its international airport and numerous resort hotels.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Maps",
    question: `What is a PHYSICAL MAP?`,
    options: [
      "A map showing political boundaries only",
      "A map showing natural features like mountains, rivers, and valleys",
      "A map showing only roads and highways",
      "A map of a school building",
    ],
    correctAnswer: 1,
    explanation: `A physical map shows the Earth's natural features — landforms, elevation, rivers, mountains, and other geographical elements.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Climate",
    question: `What is HUMIDITY?`,
    options: [
      "The temperature of the air",
      "The amount of water vapour in the air",
      "The speed of the wind",
      "The amount of rainfall",
    ],
    correctAnswer: 1,
    explanation: `Humidity measures the amount of water vapour in the air — high humidity (common in Jamaica) makes the air feel moist and can make heat feel more intense.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What is a GORGE?`,
    options: [
      "A type of bridge",
      "A narrow, deep valley with steep rocky walls, formed by river erosion",
      "A type of coastal bay",
      "A flat agricultural plain",
    ],
    correctAnswer: 1,
    explanation: `A gorge is a deep, narrow valley with steep sides, carved by a river cutting through rock over thousands of years. Jamaica's Roaring River is an example.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `The Greater Antilles include:`,
    options: [
      "Only Jamaica",
      "The four large islands: Cuba, Hispaniola, Jamaica, and Puerto Rico",
      "All Caribbean islands",
      "Only Trinidad and Jamaica",
    ],
    correctAnswer: 1,
    explanation: `The Greater Antilles are the four large islands of the Caribbean: Cuba, Hispaniola (Haiti/Dominican Republic), Jamaica, and Puerto Rico.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Government",
    question: `Who officially OPENS each new session of Parliament in Jamaica?`,
    options: [
      "The Prime Minister",
      "The Speaker of the House",
      "The Governor General",
      "The Chief Justice",
    ],
    correctAnswer: 2,
    explanation: `The Governor General formally opens each new session of Parliament with a Throne Speech, outlining the government's legislative agenda.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Parliament",
    question: `The SPEAKER of the House of Representatives:`,
    options: [
      "Makes laws independently",
      "Chairs and maintains order in debates in the House of Representatives",
      "Represents Jamaica at CARICOM",
      "Is appointed by the Senate",
    ],
    correctAnswer: 1,
    explanation: `The Speaker presides over debates in the House of Representatives, ensuring order and fair procedure during parliamentary sessions.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Rights",
    question: `The RIGHT TO LIFE in Jamaica means:`,
    options: [
      "Citizens can do anything they wish",
      "Every person's life is protected by law and cannot be taken arbitrarily",
      "Only citizens who pay taxes have this right",
      "It is not guaranteed by law",
    ],
    correctAnswer: 1,
    explanation: `The right to life is the most fundamental right — it means the state (and others) cannot arbitrarily take a person's life. It underpins all other rights.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Government",
    question: `The DIRECTOR OF PUBLIC PROSECUTIONS (DPP) in Jamaica is responsible for:`,
    options: [
      "Running elections",
      "Deciding whether to prosecute criminal cases on behalf of the state",
      "Making economic policy",
      "Managing the national budget",
    ],
    correctAnswer: 1,
    explanation: `The DPP decides whether evidence is sufficient to bring criminal charges — an independent officer of the law who protects citizens from unjust prosecution.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Electoral Process",
    question: `What is a MANIFESTO in Jamaican politics?`,
    options: [
      "A type of legal document",
      "A document or document section that cannot be changed",
      "A political party's published plan and promises for what it will do if elected",
      "A court order",
    ],
    correctAnswer: 2,
    explanation: `A political manifesto is a public declaration of a party's intentions, policies, and promises — voters use manifestos to compare parties before an election.`
  },
  {
    id: 26,
    type: "civics",
    skill: "CARICOM",
    question: `What is the CSME — Caribbean Single Market and Economy?`,
    options: [
      "A Caribbean sports competition",
      "A CARICOM arrangement that supports regional trade, services, capital, and the movement of eligible skilled CARICOM nationals under agreed rules",
      "A banking system only",
      "A Caribbean environmental programme",
    ],
    correctAnswer: 1,
    explanation: `The CSME promotes regional economic integration. It supports the movement of goods, services and capital and provides for the movement of eligible skilled CARICOM nationals and other approved categories under agreed rules; it does not give every person an unrestricted right to work anywhere in CARICOM.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Rights",
    question: `The right to PRIVACY in Jamaica means:`,
    options: [
      "Citizens can access anyone's personal information",
      "Every person has the right to have personal information and private life protected from unreasonable interference",
      "Only wealthy citizens have privacy rights",
      "Privacy is not protected under Jamaican law",
    ],
    correctAnswer: 1,
    explanation: `The right to privacy protects citizens from unreasonable surveillance, disclosure of personal information, or intrusion into their private lives.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Community",
    question: `A SCHOOL BOARD in Jamaica is responsible for:`,
    options: [
      "Teaching children",
      "Making national education policy",
      "Governing and overseeing the management of an individual school",
      "Employing all teachers nationally",
    ],
    correctAnswer: 2,
    explanation: `A school board governs and oversees the management of an individual school — monitoring performance, managing resources, and working with the principal.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Government",
    question: `The AUDITOR GENERAL in Jamaica:`,
    options: [
      "Manages the police force",
      "Independently examines and reports on the government's use of public funds",
      "Sets interest rates",
      "Creates the national budget",
    ],
    correctAnswer: 1,
    explanation: `The Auditor General independently audits public accounts — checking that government money is spent legally, efficiently, and for its intended purpose.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rule of Law",
    question: `What is HABEAS CORPUS?`,
    options: [
      "A type of election",
      "The legal right of a person to challenge unlawful detention — requiring authorities to bring them before a court",
      "A government ministry",
      "A type of prison",
    ],
    correctAnswer: 1,
    explanation: `Habeas corpus ('you shall have the body') is the legal protection against unlawful detention — if imprisoned without lawful reason, a person can petition the court for release.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Production",
    question: `What is AUTOMATION in production?`,
    options: [
      "Workers doing everything by hand",
      "The use of machines and technology to perform tasks that humans previously did",
      "A type of agricultural method",
      "A way of selling goods",
    ],
    correctAnswer: 1,
    explanation: `Automation uses machines, robots, and technology to perform production tasks — increasing efficiency and output but sometimes reducing the need for human labour.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `Which Jamaican organisation provides farmers with agricultural extension services, training, and technical advice?`,
    options: [
      "Jamaica Constabulary Force (JCF)",
      "Rural Agricultural Development Authority (RADA)",
      "National Water Commission (NWC)",
      "Jamaica Tourist Board (JTB)",
    ],
    correctAnswer: 1,
    explanation: `The Rural Agricultural Development Authority (RADA) supports farmers through agricultural extension services, technical advice, training, and programmes that help improve farm production.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What is a TARIFF?`,
    options: [
      "A type of transport route",
      "A tax placed on imported goods to protect local industries or generate government revenue",
      "A list of government services",
      "A trade agreement",
    ],
    correctAnswer: 1,
    explanation: `A tariff is a tax on imported goods — it makes foreign products more expensive, potentially protecting domestic industries and generating government income.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `Which of the following is a PRIVATE sector service?`,
    options: [
      "Police force",
      "Public hospitals",
      "A private doctor's clinic",
      "National Water Commission",
    ],
    correctAnswer: 2,
    explanation: `Private sector services are provided by non-government businesses for profit. A private clinic is run by a private owner, unlike public hospitals funded by the government.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism",
    question: `What is CRUISE SHIP TOURISM?`,
    options: [
      "A type of hotel-based tourism",
      "Tourists who visit ports from large ships, spending only a few hours ashore",
      "Tourism by small fishing boats",
      "Tourism that focuses on nature only",
    ],
    correctAnswer: 1,
    explanation: `Cruise tourism brings visitors by ship — they arrive at a port, explore briefly, and depart. Critics note that cruise tourists spend less in the local economy than hotel-based tourists.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `What is an INTEREST RATE?`,
    options: [
      "The price of goods in a market",
      "The percentage charged for borrowing money or earned on savings",
      "A tax on financial transactions",
      "The exchange rate between currencies",
    ],
    correctAnswer: 1,
    explanation: `Interest rate is the cost of borrowing money (charged by lenders) or the reward for saving (paid by banks) — expressed as a percentage of the loan or deposit.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A FRANCHISE is:`,
    options: [
      "A type of personal loan",
      "A business arrangement where a franchisor grants the right to use their brand and systems to a franchisee",
      "A type of farmer's cooperative",
      "A government grant for businesses",
    ],
    correctAnswer: 1,
    explanation: `A franchise allows an entrepreneur to use an established brand and business model (e.g., KFC or Burger King) in exchange for fees — reducing the risk of starting from scratch.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Interdependence",
    question: `Jamaica DEPENDS on imported petroleum primarily because:`,
    options: [
      "Petroleum is cheaper than local alternatives",
      "Jamaica has no commercially viable oil deposits and must import to meet its energy needs",
      "The government prefers foreign products",
      "Petroleum is only available in cold countries",
    ],
    correctAnswer: 1,
    explanation: `Jamaica has no commercial petroleum reserves and imports all its oil — an example of economic interdependence. This also makes Jamaica vulnerable to rising global oil prices.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `What is the DIFFERENCE between renewable and non-renewable resources?`,
    options: [
      "There is no difference",
      "Renewable resources can replenish naturally over time; non-renewable resources cannot",
      "Non-renewable resources are more valuable",
      "Renewable resources are only found in rivers",
    ],
    correctAnswer: 1,
    explanation: `Renewable resources (like forests, water, wind, solar) replenish naturally. Non-renewable resources (like oil, bauxite, coal) take millions of years to form and cannot be practically replaced once used.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `What is a MARKET?`,
    options: [
      "A government building only",
      "A place or system where buyers and sellers exchange goods and services",
      "Only a physical outdoor space",
      "A type of government department",
    ],
    correctAnswer: 1,
    explanation: `A market is any arrangement — physical or digital — where buyers and sellers meet to exchange goods and services. Markets can be local (a Saturday market) or global (the stock market).`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsEasy6Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsEasy6Questions)
      : prepareSocialStudiesPreview(g5SsEasy6Questions, FREE_QUESTION_LIMIT)
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
        testName: "Easy 6",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 6</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 6</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 6</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
