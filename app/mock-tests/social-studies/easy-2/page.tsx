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

const g5SsEasy2Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `Norman Manley founded which political party in Jamaica?`,
    options: [
      "JLP",
      "PNP",
      "UNIA",
      "NWU",
    ],
    correctAnswer: 1,
    explanation: `Norman Washington Manley founded the People's National Party (PNP) in 1938, advocating for workers' rights and self-government.`
  },
  {
    id: 2,
    type: "history",
    skill: "National Heroes",
    question: `Alexander Bustamante founded which political party?`,
    options: [
      "PNP",
      "NWU",
      "JLP",
      "BITU",
    ],
    correctAnswer: 2,
    explanation: `Sir Alexander Bustamante founded the Jamaica Labour Party (JLP) in 1943, after earlier founding the Bustamante Industrial Trade Union (BITU).`
  },
  {
    id: 3,
    type: "history",
    skill: "Colonial History",
    question: `Britain captured Jamaica from Spain in which year?`,
    options: [
      "1492",
      "1655",
      "1838",
      "1962",
    ],
    correctAnswer: 1,
    explanation: `Britain captured Jamaica from Spain in 1655. The British ruled Jamaica until independence in 1962.`
  },
  {
    id: 4,
    type: "history",
    skill: "National Heroes",
    question: `George William Gordon was a National Hero known for:`,
    options: [
      "Leading the Maroons",
      "His music and poetry",
      "Advocating for the rights of the poor and speaking out against injustice before and during the Morant Bay Rebellion",
      "Founding a political party",
    ],
    correctAnswer: 2,
    explanation: `George William Gordon was a planter and politician who championed the rights of poor Jamaicans and was executed after the Morant Bay Rebellion.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cultural Heritage",
    question: `Jamaica's Independence Day is celebrated on:`,
    options: [
      "August 1",
      "October 11",
      "August 6",
      "March 1",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's Independence Day is celebrated on August 6, the date independence was granted in 1962.`
  },
  {
    id: 6,
    type: "history",
    skill: "First Peoples",
    question: `The Taino people called Jamaica:`,
    options: [
      "Santiago",
      "Xaymaca",
      "Kingston",
      "Jamaica",
    ],
    correctAnswer: 1,
    explanation: `The Taino called the island 'Xaymaca,' meaning 'Land of Wood and Water,' which eventually became 'Jamaica.'`
  },
  {
    id: 7,
    type: "history",
    skill: "National Heroes",
    question: `Nanny of the Maroons was famous for:`,
    options: [
      "Writing the Jamaican constitution",
      "Leading the Maroons in resisting British forces and never surrendering",
      "Organising the Morant Bay Rebellion",
      "Founding the PNP",
    ],
    correctAnswer: 1,
    explanation: `Queen Nanny led the Windward Maroons in guerrilla warfare against the British in the early 18th century. She is celebrated as a symbol of freedom and resistance.`
  },
  {
    id: 8,
    type: "history",
    skill: "Cultural Heritage",
    question: `Heritage Week in Jamaica is celebrated in:`,
    options: [
      "March",
      "August",
      "October",
      "December",
    ],
    correctAnswer: 2,
    explanation: `Heritage Week is celebrated annually in October, culminating in National Heroes Day, honouring Jamaica's cultural identity and history.`
  },
  {
    id: 9,
    type: "history",
    skill: "Colonial History",
    question: `What system of free labour replaced slavery after emancipation in 1834?`,
    options: [
      "Indentureship",
      "Apprenticeship",
      "Sharecropping",
      "Bonded labour",
    ],
    correctAnswer: 1,
    explanation: `The Apprenticeship system (1834–1838) required formerly enslaved people to continue working for their former enslavers for a transition period before full freedom.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `Which of Jamaica's National Heroes is featured on the $1,000 banknote?`,
    options: [
      "Paul Bogle",
      "Norman Manley",
      "Marcus Garvey",
      "Nanny of the Maroons",
    ],
    correctAnswer: 3,
    explanation: `Nanny of the Maroons appears on the Jamaican $1,000 banknote.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Counties",
    question: `Jamaica is divided into three counties. Which of the following is NOT one of them?`,
    options: [
      "Cornwall",
      "Middlesex",
      "Surrey",
      "Kent",
    ],
    correctAnswer: 3,
    explanation: `Jamaica's three counties are Cornwall (west), Middlesex (central), and Surrey (east). Kent is not a Jamaican county.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is home to Jamaica's capital city, Kingston?`,
    options: [
      "St. Andrew",
      "Kingston",
      "St. Thomas",
      "St. Catherine",
    ],
    correctAnswer: 1,
    explanation: `Kingston is its own parish — the Kingston Corporate Area (KCA) includes Kingston and is adjacent to St. Andrew.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Physical Features",
    question: `What is the name of the longest river in Jamaica?`,
    options: [
      "Black River",
      "Rio Cobre",
      "Great River",
      "Rio Minho",
    ],
    correctAnswer: 3,
    explanation: `The Rio Minho is the longest river in Jamaica, flowing approximately 92 km through the parishes of Manchester and Clarendon.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Maps",
    question: `What does a compass ROSE on a map show?`,
    options: [
      "The scale of the map",
      "The legend of the map",
      "The four cardinal directions (N, S, E, W)",
      "The type of land",
    ],
    correctAnswer: 2,
    explanation: `A compass rose shows the four cardinal directions (North, South, East, West) and often the intermediate directions.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Climate",
    question: `Which season brings the MOST rainfall to Jamaica?`,
    options: [
      "December to February",
      "March to April",
      "May to November",
      "January to March",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's wet season runs from May to November, coinciding with the Atlantic hurricane season.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Natural Disasters",
    question: `Which type of natural disaster is MOST common in Jamaica and can cause widespread damage?`,
    options: [
      "Tornadoes",
      "Earthquakes",
      "Hurricanes",
      "Tsunamis",
    ],
    correctAnswer: 2,
    explanation: `Hurricanes are the most frequent natural disaster threat to Jamaica, occurring during the Atlantic hurricane season (June–November).`
  },
  {
    id: 17,
    type: "geography",
    skill: "Physical Features",
    question: `What is a 'watershed' in geography?`,
    options: [
      "A shed near a river",
      "An area where water collects and drains into a river or lake",
      "A type of dam",
      "A water tower",
    ],
    correctAnswer: 1,
    explanation: `A watershed is the area of land from which all rainfall drains into a particular river, lake, or other body of water.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Caribbean",
    question: `Which country is Jamaica's NEAREST Caribbean neighbour?`,
    options: [
      "Cuba",
      "Haiti",
      "Puerto Rico",
      "Trinidad",
    ],
    correctAnswer: 0,
    explanation: `Cuba lies to the north of Jamaica and is its nearest Caribbean neighbour, approximately 145 km away.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Land Use",
    question: `Which type of land use covers the MOST area in Jamaica?`,
    options: [
      "Urban settlements",
      "Agriculture and forestry",
      "Mining",
      "Tourism infrastructure",
    ],
    correctAnswer: 1,
    explanation: `Agriculture and forestry (including forest reserves) cover the largest proportion of Jamaica's land area.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Physical Features",
    question: `Which of the following is a COASTAL landform found in Jamaica?`,
    options: [
      "Delta",
      "Plateau",
      "Bay",
      "Mountain range",
    ],
    correctAnswer: 2,
    explanation: `A bay is a coastal landform — an inlet of water with land on three sides. Jamaica has several bays, including Kingston Harbour (one of the world's largest natural harbours).`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `The Constitution of Jamaica is BEST described as:`,
    options: [
      "A map of Jamaica",
      "A list of tax rules",
      "The supreme law of Jamaica that outlines the rights of citizens and the structure of government",
      "A trade agreement",
    ],
    correctAnswer: 2,
    explanation: `The Constitution is Jamaica's supreme law — it establishes the system of government, protects fundamental rights, and cannot be easily changed.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Parliament",
    question: `Members of the House of Representatives are:`,
    options: [
      "Appointed by the Governor General",
      "Appointed by the Prime Minister",
      "Elected by the Jamaican people",
      "Selected by the political parties only",
    ],
    correctAnswer: 2,
    explanation: `Members of Parliament (MPs) in the House of Representatives are elected by the public in general elections held at least every five years.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Parliament",
    question: `Members of the Senate are:`,
    options: [
      "Elected in general elections",
      "Appointed — 13 by the Prime Minister and 8 by the Leader of the Opposition",
      "Chosen by the public in a special vote",
      "Automatically appointed based on education",
    ],
    correctAnswer: 1,
    explanation: `The 21 senators are all appointed: 13 by the Prime Minister and 8 by the Leader of the Opposition, on the advice of the Governor General.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Rights",
    question: `Which of the following is a RIGHT of every Jamaican citizen?`,
    options: [
      "Paying taxes",
      "Attending school only if you choose",
      "Freedom of religion",
      "Breaking unfair laws",
    ],
    correctAnswer: 2,
    explanation: `Freedom of religion (the right to practise one's faith without interference) is a fundamental right guaranteed by Jamaica's Constitution.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Government",
    question: `The Cabinet in Jamaica is responsible for:`,
    options: [
      "Making laws in Parliament",
      "Running the daily affairs of government and implementing policy",
      "Judging court cases",
      "Collecting taxes",
    ],
    correctAnswer: 1,
    explanation: `The Cabinet, led by the Prime Minister and comprising ministers, is responsible for the day-to-day running of government and policy decisions.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Electoral Process",
    question: `A general election in Jamaica must be held at LEAST every:`,
    options: [
      "Three years",
      "Four years",
      "Five years",
      "Six years",
    ],
    correctAnswer: 2,
    explanation: `Under Jamaica's Constitution, a general election must be held at least every five years.`
  },
  {
    id: 27,
    type: "civics",
    skill: "CARICOM",
    question: `In which year was CARICOM established?`,
    options: [
      "1958",
      "1962",
      "1973",
      "1980",
    ],
    correctAnswer: 2,
    explanation: `CARICOM was established on August 1, 1973, when the Treaty of Chaguaramas was signed in Trinidad and Tobago.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Community",
    question: `A Parish Council is an example of:`,
    options: [
      "National government",
      "Regional government",
      "Local government",
      "Federal government",
    ],
    correctAnswer: 2,
    explanation: `Parish Councils are local government bodies in Jamaica, responsible for managing roads, markets, public spaces, and local services.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rights",
    question: `The DUTY to attend school up to a certain age is an example of:`,
    options: [
      "A right",
      "A privilege",
      "A compulsory civic duty",
      "A personal choice only",
    ],
    correctAnswer: 2,
    explanation: `Compulsory school attendance is a civic duty — parents and guardians are legally obliged to ensure children attend school.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rule of Law",
    question: `Which institution in Jamaica interprets and applies the law?`,
    options: [
      "Parliament",
      "The Cabinet",
      "The Judiciary (Courts)",
      "The Governor General",
    ],
    correctAnswer: 2,
    explanation: `The Judiciary — comprising the Supreme Court, Court of Appeal, and other courts — interprets the law and applies it to specific cases.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `Which of the following is a TERTIARY (service) economic activity?`,
    options: [
      "Growing bananas",
      "Mining bauxite",
      "Cutting timber",
      "Teaching in a school",
    ],
    correctAnswer: 3,
    explanation: `Tertiary activities are service industries. Teaching is a service — the teacher provides a service rather than producing a physical good.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Tourism",
    question: `Tourism is MOST important to Jamaica because it:`,
    options: [
      "Is Jamaica's oldest industry",
      "Brings in foreign exchange and provides employment",
      "Grows food for Jamaicans",
      "Is Jamaica's only export",
    ],
    correctAnswer: 1,
    explanation: `Tourism is a major earner of foreign exchange for Jamaica and one of the country's largest employers.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `When Jamaica sends coffee to other countries, it is:`,
    options: [
      "Importing",
      "Bartering",
      "Exporting",
      "Donating",
    ],
    correctAnswer: 2,
    explanation: `Exporting means selling goods to other countries. Jamaica exports coffee, sugar, bauxite, and other products.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `Which community service is responsible for maintaining law and order?`,
    options: [
      "Fire Brigade",
      "Jamaica Constabulary Force (Police)",
      "Customs",
      "Tax Authority",
    ],
    correctAnswer: 1,
    explanation: `The Jamaica Constabulary Force (JCF) is the national police service responsible for law enforcement and maintaining order.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Production",
    question: `What does the word 'enterprise' mean in the factors of production?`,
    options: [
      "Money used in business",
      "The land used for farming",
      "The organisational skill of putting land, labour, and capital together to produce goods or services",
      "The work done by employees",
    ],
    correctAnswer: 2,
    explanation: `Enterprise (or entrepreneurship) is the fourth factor of production — the skill of organising the other three factors to create a business.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Agriculture",
    question: `Which of the following is a CASH CROP — grown mainly for sale?`,
    options: [
      "Ground provisions grown for the family",
      "Yam grown for personal use",
      "Sugarcane grown on large plantations",
      "Vegetables grown in a kitchen garden",
    ],
    correctAnswer: 2,
    explanation: `Sugarcane is a classic cash crop — grown commercially on large plantations primarily for sale and export.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Banking",
    question: `A BANK is a financial institution that:`,
    options: [
      "Sells goods and services",
      "Lends and saves money, and provides financial services",
      "Makes laws about money",
      "Prints Jamaican dollars",
    ],
    correctAnswer: 1,
    explanation: `Banks are financial institutions that accept deposits, provide loans, and offer financial services to individuals and businesses.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Interdependence",
    question: `When different regions or countries depend on each other for goods and services, this is called:`,
    options: [
      "Trade",
      "Monopoly",
      "Interdependence",
      "Competition",
    ],
    correctAnswer: 2,
    explanation: `Interdependence means that countries or communities rely on each other — producing what they do best and trading for what they need.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `Which of Jamaica's natural resources is used to generate electricity at the Wigton Wind Farm?`,
    options: [
      "Bauxite",
      "Wind",
      "Solar energy",
      "Water",
    ],
    correctAnswer: 1,
    explanation: `The Wigton Wind Farm in Manchester uses wind energy to generate electricity, making it Jamaica's largest wind energy facility.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Economic Systems",
    question: `When a person exchanges goods for other goods WITHOUT using money, this is called:`,
    options: [
      "Trading",
      "Importing",
      "Bartering",
      "Investing",
    ],
    correctAnswer: 2,
    explanation: `Bartering is the direct exchange of goods or services without using money — one of the earliest forms of trade.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy2Questions : g5SsEasy2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 2</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 2</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 2</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
