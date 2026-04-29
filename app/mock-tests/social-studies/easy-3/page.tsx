"use client"

import { useState, useEffect, useCallback } from "react"
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

const g5SsEasy3Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `Who among Jamaica's National Heroes advocated for 'Africa for the Africans'?`,
    options: [
      "Paul Bogle",
      "Marcus Garvey",
      "Norman Manley",
      "Sam Sharpe",
    ],
    correctAnswer: 1,
    explanation: `Marcus Garvey's Pan-Africanism movement included the slogan 'Africa for the Africans, at Home and Abroad,' promoting African unity and pride.`
  },
  {
    id: 2,
    type: "history",
    skill: "Colonial History",
    question: `What was the name of the Spanish settlement that is now Spanish Town?`,
    options: [
      "Santiago de la Vega",
      "Seville",
      "New Seville",
      "Santo Domingo",
    ],
    correctAnswer: 0,
    explanation: `The Spanish founded Santiago de la Vega, which later became Spanish Town and served as Jamaica's capital until 1872.`
  },
  {
    id: 3,
    type: "history",
    skill: "National Heroes",
    question: `Sam Sharpe was a leader of:`,
    options: [
      "The Maroon communities",
      "The Baptist War (Christmas Rebellion) of 1831",
      "The Morant Bay Rebellion",
      "The independence movement",
    ],
    correctAnswer: 1,
    explanation: `Sam Sharpe organised the Christmas Rebellion (also called the Baptist War) of 1831–32, the largest slave uprising in Jamaican history.`
  },
  {
    id: 4,
    type: "history",
    skill: "First Peoples",
    question: `The Taino people were skilled at:`,
    options: [
      "Metal smelting",
      "Large-scale cattle farming",
      "Farming, fishing, and crafts such as pottery and weaving",
      "Building large stone cities",
    ],
    correctAnswer: 2,
    explanation: `The Taino were skilled farmers (growing cassava, sweet potatoes, corn), fishers, and craftspeople who made pottery, hammocks, and canoes.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Jamaican flag features which THREE colours?`,
    options: [
      "Red, white, and blue",
      "Black, green, and gold",
      "Green, white, and yellow",
      "Blue, gold, and black",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's flag features black (hardships faced), green (agriculture and hope), and gold (sunshine and natural resources).`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `African people were brought to Jamaica primarily to work as:`,
    options: [
      "Free settlers",
      "Indentured labourers",
      "Enslaved people on plantations",
      "Skilled craftsmen",
    ],
    correctAnswer: 2,
    explanation: `Africans were forcibly brought to Jamaica as enslaved people, primarily to work on sugar and other plantation crops for the benefit of British colonists.`
  },
  {
    id: 7,
    type: "history",
    skill: "National Heroes",
    question: `Which National Hero was also a Baptist deacon and used the church to organise resistance?`,
    options: [
      "Paul Bogle",
      "Sam Sharpe",
      "George William Gordon",
      "Norman Manley",
    ],
    correctAnswer: 1,
    explanation: `Sam Sharpe was a Baptist deacon who used his position to spread the message of freedom and organise the 1831 Christmas Rebellion.`
  },
  {
    id: 8,
    type: "history",
    skill: "Cultural Heritage",
    question: `National Heroes Day is celebrated on:`,
    options: [
      "The first Monday in August",
      "The third Monday in October",
      "October 11",
      "November 6",
    ],
    correctAnswer: 1,
    explanation: `National Heroes Day is observed on the third Monday in October, during Heritage Month, to honour Jamaica's seven National Heroes.`
  },
  {
    id: 9,
    type: "history",
    skill: "Independence",
    question: `Before independence, Jamaica was a colony of:`,
    options: [
      "Spain",
      "France",
      "Britain",
      "Portugal",
    ],
    correctAnswer: 2,
    explanation: `Jamaica was a British colony from 1655 until independence in 1962.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Jamaican national bird is the:`,
    options: [
      "Hummingbird",
      "Pelican",
      "Doctor Bird (Red-billed Streamertail)",
      "Parrot",
    ],
    correctAnswer: 2,
    explanation: `The Doctor Bird (Red-billed Streamertail hummingbird) is Jamaica's national bird, found only in Jamaica.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `Kingston Harbour is notable because it is:`,
    options: [
      "The longest harbour in the Caribbean",
      "One of the largest natural harbours in the world",
      "The shallowest harbour in Jamaica",
      "Only used by fishing boats",
    ],
    correctAnswer: 1,
    explanation: `Kingston Harbour is one of the largest natural harbours in the Western Hemisphere, a key factor in Kingston becoming Jamaica's capital and commercial centre.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is known as the 'breadbasket of Jamaica' due to its fertile farmland?`,
    options: [
      "St. Elizabeth",
      "Westmoreland",
      "Clarendon",
      "Manchester",
    ],
    correctAnswer: 0,
    explanation: `St. Elizabeth, in southwest Jamaica, is known as Jamaica's 'breadbasket' — it is the most important agricultural parish, producing vegetables and ground provisions.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `What is the purpose of a MAP SCALE?`,
    options: [
      "To show which way is north",
      "To show the colours used on the map",
      "To help measure real distances from map distances",
      "To show the map's title",
    ],
    correctAnswer: 2,
    explanation: `A map scale shows the relationship between distance on the map and actual distance on the ground, allowing users to calculate real distances.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Natural Disasters",
    question: `What should a community do to PREPARE for a hurricane?`,
    options: [
      "Nothing — hurricanes cannot be predicted",
      "Board up windows, stock emergency supplies, and know evacuation routes",
      "Move to higher ground and stop farming",
      "Wait for the government to act",
    ],
    correctAnswer: 1,
    explanation: `Hurricane preparedness includes securing structures, stocking emergency supplies (water, food, medicines), and knowing evacuation procedures.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Climate",
    question: `Which factor MOST influences Jamaica's climate?`,
    options: [
      "Its distance from the United States",
      "Its tropical location, elevation, and trade winds",
      "Its large population",
      "Its mineral deposits",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's tropical location near the equator, varied elevations (cooler in mountains), and the northeast trade winds all significantly influence its climate.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `What is the name of the parish that contains Jamaica's largest city by population?`,
    options: [
      "Kingston",
      "St. Andrew",
      "St. Catherine",
      "Clarendon",
    ],
    correctAnswer: 1,
    explanation: `St. Andrew surrounds Kingston and, combined with it (the Kingston Corporate Area), forms Jamaica's most populous urban region.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Physical Features",
    question: `Which term describes a narrow strip of land connecting two larger land areas?`,
    options: [
      "Peninsula",
      "Isthmus",
      "Cape",
      "Archipelago",
    ],
    correctAnswer: 1,
    explanation: `An isthmus is a narrow strip of land connecting two larger areas. The Isthmus of Panama is a famous example.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Environment",
    question: `Which activity MOST threatens Jamaica's coral reefs?`,
    options: [
      "Fishing with nets",
      "Snorkelling",
      "Sewage pollution and rising ocean temperatures",
      "Building roads inland",
    ],
    correctAnswer: 2,
    explanation: `Coral reefs are threatened by water pollution (sewage, agricultural runoff), rising ocean temperatures (climate change), and overfishing.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `A PENINSULA is:`,
    options: [
      "A hill surrounded by water on three sides",
      "A piece of land surrounded by water on three sides but connected to the mainland",
      "An island completely surrounded by water",
      "A body of water surrounded by land",
    ],
    correctAnswer: 1,
    explanation: `A peninsula is a piece of land projecting into water, surrounded on three sides by water but connected to the mainland on one side.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `The Caribbean Sea is part of which larger ocean?`,
    options: [
      "Indian Ocean",
      "Pacific Ocean",
      "Atlantic Ocean",
      "Arctic Ocean",
    ],
    correctAnswer: 2,
    explanation: `The Caribbean Sea is part of the Atlantic Ocean basin, located between North and South America.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `The PREAMBLE of Jamaica's Constitution states:`,
    options: [
      "The tax laws of Jamaica",
      "The fundamental rights and freedoms of Jamaican citizens",
      "The trading rules of CARICOM",
      "The boundaries of Jamaica's parishes",
    ],
    correctAnswer: 1,
    explanation: `The preamble outlines the fundamental rights of Jamaicans, including political freedoms, the rule of law, and social equality.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Government",
    question: `The Attorney General of Jamaica is responsible for:`,
    options: [
      "Collecting taxes",
      "Making laws",
      "Providing legal advice to the government",
      "Leading the police force",
    ],
    correctAnswer: 2,
    explanation: `The Attorney General is the government's chief legal adviser, responsible for providing legal opinions to the Cabinet and representing the government in legal matters.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Parliament",
    question: `How many members are in the Jamaican Senate?`,
    options: [
      "13",
      "21",
      "30",
      "63",
    ],
    correctAnswer: 1,
    explanation: `The Jamaican Senate has 21 members: 13 appointed by the Prime Minister and 8 by the Leader of the Opposition.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Rights",
    question: `The right to a FAIR TRIAL means:`,
    options: [
      "Anyone can be jailed without reason",
      "Citizens can be held in prison indefinitely",
      "Every person accused of a crime has the right to be heard before an impartial court",
      "The government decides who is guilty",
    ],
    correctAnswer: 2,
    explanation: `The right to a fair trial is a fundamental legal right — everyone must be presumed innocent until proven guilty in an impartial court.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Government",
    question: `Jamaica operates under which system of government?`,
    options: [
      "Dictatorship",
      "Monarchy",
      "Parliamentary Democracy",
      "Republic",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is a parliamentary democracy — citizens elect representatives to Parliament, which forms the government led by the Prime Minister.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Electoral Process",
    question: `What is a CONSTITUENCY in Jamaica?`,
    options: [
      "A religious area",
      "A geographical area that elects one Member of Parliament",
      "A type of local government",
      "A CARICOM member state",
    ],
    correctAnswer: 1,
    explanation: `A constituency is a defined electoral district from which one Member of Parliament (MP) is elected to represent its people in the House of Representatives.`
  },
  {
    id: 27,
    type: "civics",
    skill: "CARICOM",
    question: `What is the headquarters of CARICOM?`,
    options: [
      "Bridgetown, Barbados",
      "Port of Spain, Trinidad",
      "Georgetown, Guyana",
      "Kingston, Jamaica",
    ],
    correctAnswer: 2,
    explanation: `CARICOM's headquarters (Secretariat) is located in Georgetown, Guyana.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Citizenship",
    question: `A person born in Jamaica to Jamaican parents is a citizen by:`,
    options: [
      "Registration",
      "Naturalisation",
      "Birth",
      "Application",
    ],
    correctAnswer: 2,
    explanation: `A person born in Jamaica to at least one Jamaican parent is a citizen by birth — this is the most direct form of citizenship.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Community",
    question: `Which organisation in Jamaica provides voluntary community service?`,
    options: [
      "Jamaica Defence Force",
      "The Judiciary",
      "Community Development Committee (CDC)",
      "The Cabinet",
    ],
    correctAnswer: 2,
    explanation: `Community Development Committees (CDCs) are voluntary organisations in local communities that identify needs and coordinate development activities.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `Which of the following BEST describes a citizen's DUTY?`,
    options: [
      "A privilege enjoyed without responsibility",
      "Something the government cannot ask you to do",
      "An obligation required of citizens for the functioning of a healthy society",
      "A right given only to some citizens",
    ],
    correctAnswer: 2,
    explanation: `A duty is a moral or legal obligation — something citizens are expected to do for the benefit of society, such as voting, obeying laws, and paying taxes.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `SECONDARY economic activities involve:`,
    options: [
      "Growing crops and mining",
      "Providing services like healthcare",
      "Using raw materials to make products (manufacturing)",
      "Fishing and logging",
    ],
    correctAnswer: 2,
    explanation: `Secondary activities transform raw materials into manufactured goods — e.g., turning sugarcane (primary) into refined sugar or rum (secondary).`
  },
  {
    id: 32,
    type: "economics",
    skill: "Tourism",
    question: `A TOURIST is BEST described as a person who:`,
    options: [
      "Works in another country permanently",
      "Visits a place for recreation, business, or culture for less than a year without intending to stay",
      "Migrates to another country for employment",
      "Sends remittances home",
    ],
    correctAnswer: 1,
    explanation: `A tourist is a temporary visitor who travels for leisure, business, or cultural purposes — distinct from a migrant or permanent resident.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Agriculture",
    question: `Which of the following is Jamaica's main EXPORT crop?`,
    options: [
      "Rice",
      "Sugar",
      "Corn",
      "Wheat",
    ],
    correctAnswer: 1,
    explanation: `Sugar has been Jamaica's most significant export crop historically, though coffee, bananas, and other products are also exported.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `Which service provides HEALTHCARE to Jamaican communities?`,
    options: [
      "Police",
      "Schools",
      "Health Centres and Hospitals",
      "Fire Brigade",
    ],
    correctAnswer: 2,
    explanation: `Health centres and hospitals provide medical care, preventive health services, and emergency treatment to communities across Jamaica.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Money",
    question: `What is the PURPOSE of money in an economy?`,
    options: [
      "To make trade more complicated",
      "To replace all natural resources",
      "To serve as a medium of exchange, making buying and selling easier",
      "To pay government workers only",
    ],
    correctAnswer: 2,
    explanation: `Money serves as a medium of exchange — it makes trade easier than bartering, allows for savings, and provides a common measure of value.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Production",
    question: `Which factor of production is LAND?`,
    options: [
      "The money invested in a business",
      "The work done by people",
      "Natural resources such as soil, water, forests, and minerals",
      "The organisation of resources",
    ],
    correctAnswer: 2,
    explanation: `In economics, 'land' refers to all natural resources — not just soil, but also water, minerals, forests, and other gifts of nature.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Trade",
    question: `What is FOREIGN EXCHANGE?`,
    options: [
      "The money earned from selling abroad that can be used to buy imported goods",
      "A type of classroom programme",
      "A market where fruit is sold",
      "A government office",
    ],
    correctAnswer: 0,
    explanation: `Foreign exchange is the currency earned from exports and tourism that can be used to pay for imports and other international transactions.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Entrepreneurship",
    question: `Which of the following BEST shows entrepreneurial behaviour?`,
    options: [
      "Working for a large company for many years",
      "Starting a small bakery using a new recipe to fill a gap in the market",
      "Spending all savings on personal luxuries",
      "Following all existing business traditions",
    ],
    correctAnswer: 1,
    explanation: `Entrepreneurship involves identifying a gap in the market, taking a calculated risk, and creating a new business — the bakery example demonstrates this.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Interdependence",
    question: `Jamaica imports petroleum (oil) from other countries because:`,
    options: [
      "Jamaica does not need oil",
      "Jamaica has no natural oil reserves",
      "It is cheaper to import than to find local alternatives",
      "The government prefers foreign products",
    ],
    correctAnswer: 1,
    explanation: `Jamaica has no commercially viable petroleum reserves and must import oil to meet its energy needs — an example of economic interdependence.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community Development",
    question: `What is the PURPOSE of a CREDIT UNION?`,
    options: [
      "To sell goods to community members",
      "To lend money to members at reasonable rates and encourage savings",
      "To collect taxes for the government",
      "To build roads in the community",
    ],
    correctAnswer: 1,
    explanation: `Credit unions are member-owned financial cooperatives that provide savings and loan services to members, often at better rates than commercial banks.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy3Questions : g5SsEasy3Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

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

  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

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
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60)
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 3</CardTitle>
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
            <Button onClick={() => setStarted(true)} className="w-full bg-green-700 py-6 text-lg hover:bg-green-800">Start Test</Button>
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
              <p className="text-slate-600">Social Studies Easy 3</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 3</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
              ? <Button onClick={() => setShowResults(true)} className="bg-green-700 hover:bg-green-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
