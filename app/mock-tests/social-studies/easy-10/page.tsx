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

const g5SsEasy10Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cultural Heritage",
    question: `The GOLD on Jamaica's flag represents:`,
    options: [
      "Money and wealth",
      "The sunshine and the island's natural wealth",
      "The Royal Crown",
      "Bauxite and mineral resources",
    ],
    correctAnswer: 1,
    explanation: `Gold (yellow) on Jamaica's flag represents the sunshine and the natural wealth of Jamaica.`
  },
  {
    id: 2,
    type: "history",
    skill: "National Heroes",
    question: `Which of Jamaica's National Heroes was a lawyer by profession?`,
    options: [
      "Sam Sharpe",
      "Paul Bogle",
      "Norman Manley",
      "Marcus Garvey",
    ],
    correctAnswer: 2,
    explanation: `Norman Washington Manley was a Rhodes Scholar and distinguished barrister (lawyer) who became one of the leading advocates of Jamaica's independence.`
  },
  {
    id: 3,
    type: "history",
    skill: "Colonial History",
    question: `The Spanish town of NEW SEVILLE was built near:`,
    options: [
      "Morant Bay",
      "St. Ann's Bay",
      "Kingston",
      "Montego Bay",
    ],
    correctAnswer: 1,
    explanation: `New Seville (Seville Nueva) was the first Spanish capital of Jamaica, built near St. Ann's Bay on the north coast around 1509.`
  },
  {
    id: 4,
    type: "history",
    skill: "Cultural Heritage",
    question: `POCOMANIA (Pukkumina) is a Jamaican:`,
    options: [
      "Musical instrument",
      "Syncretic religion blending African spiritual traditions with Christian elements",
      "Political party",
      "Dance style from Europe",
    ],
    correctAnswer: 1,
    explanation: `Pocomania (Pukkumina) is an Afro-Jamaican religion that blends African spiritual practices with Christian elements — part of Jamaica's rich religious and cultural heritage.`
  },
  {
    id: 5,
    type: "history",
    skill: "First Peoples",
    question: `What happened to the Taino population after European contact?`,
    options: [
      "They assimilated fully into Spanish culture",
      "The population grew significantly",
      "The population was devastated by disease, violence, and forced labour",
      "They migrated to other Caribbean islands",
    ],
    correctAnswer: 2,
    explanation: `The Taino population was catastrophically reduced after 1494 — disease, violence, and forced labour nearly wiped them out within 50 years of European contact.`
  },
  {
    id: 6,
    type: "history",
    skill: "National Heroes",
    question: `Marcus Garvey was born in which Jamaican parish?`,
    options: [
      "Kingston",
      "St. Ann",
      "St. James",
      "Manchester",
    ],
    correctAnswer: 1,
    explanation: `Marcus Mosiah Garvey was born on August 17, 1887, in St. Ann's Bay, St. Ann — the same parish where Christopher Columbus first landed.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Diwali festival is celebrated in Jamaica by members of which community?`,
    options: [
      "African Jamaicans",
      "East Indian Jamaicans",
      "Chinese Jamaicans",
      "Maroon communities",
    ],
    correctAnswer: 1,
    explanation: `Diwali (the Hindu festival of lights) is celebrated by Jamaicans of East Indian descent, reflecting the cultural heritage of the indentured labourers brought from India.`
  },
  {
    id: 8,
    type: "history",
    skill: "Colonial History",
    question: `'GREAT HOUSE' on a colonial plantation was:`,
    options: [
      "The home of the enslaved labourers",
      "A community meeting hall",
      "The main residence of the plantation owner",
      "A church building",
    ],
    correctAnswer: 2,
    explanation: `The Great House was the main residence of the plantation owner — typically a large, elegant house built on high ground overlooking the plantation.`
  },
  {
    id: 9,
    type: "history",
    skill: "Independence",
    question: `What was significant about the 1944 general election in Jamaica?`,
    options: [
      "It was the first election after independence",
      "It was the first election under Universal Adult Suffrage — all adults could vote for the first time",
      "It was the first CARICOM election",
      "It was won by Norman Manley",
    ],
    correctAnswer: 1,
    explanation: `The 1944 general election was the first held under Universal Adult Suffrage in Jamaica — all adult citizens, regardless of gender, property, or literacy, could vote.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `The term 'NINE NIGHT' in Jamaican culture refers to:`,
    options: [
      "A nine-day national festival",
      "A traditional ceremony held for nine nights after a person's death to celebrate their life and ease their passing",
      "A type of traditional dance",
      "A harvest festival lasting nine nights",
    ],
    correctAnswer: 1,
    explanation: `'Nine Night' (also called 'Dead Yard') is a Jamaican African-rooted tradition — gathering for nine nights following a death to celebrate the deceased's life with food, music, storytelling, and prayer.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `The JOHN CROW MOUNTAINS are located in which part of Jamaica?`,
    options: [
      "West",
      "Central",
      "Northeast",
      "South",
    ],
    correctAnswer: 2,
    explanation: `The John Crow Mountains are located in northeastern Jamaica, in Portland parish, adjacent to the Blue Mountains.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is known for its limestone caves, underground rivers, and unique biodiversity?`,
    options: [
      "Trelawny",
      "Manchester",
      "St. Thomas",
      "Kingston",
    ],
    correctAnswer: 0,
    explanation: `Trelawny parish is home to the Windsor Great Cave and other limestone cave systems, supporting unique biodiversity including rare bat species.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `On a weather map, what do ISOBARS show?`,
    options: [
      "Temperature differences",
      "Lines of equal atmospheric pressure",
      "Wind direction only",
      "Rainfall amounts",
    ],
    correctAnswer: 1,
    explanation: `Isobars on a weather map connect places of equal atmospheric pressure — the spacing of isobars indicates wind speed (closely spaced = strong winds).`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environment",
    question: `What is BIODIVERSITY?`,
    options: [
      "The variety of crops grown on a farm",
      "The variety of plant and animal life in a particular habitat or on Earth",
      "The number of people in an area",
      "The minerals found in soil",
    ],
    correctAnswer: 1,
    explanation: `Biodiversity refers to the variety of life — all the different species of plants, animals, fungi, and microorganisms in a given area. Jamaica is one of the world's most biodiverse islands.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Physical Features",
    question: `What is a REEF?`,
    options: [
      "An underwater mountain",
      "A ridge of rock, coral, or sand near the water surface",
      "A type of river delta",
      "A coastal cliffside",
    ],
    correctAnswer: 1,
    explanation: `A reef is a ridge of rock, coral, or sand near or at the water surface. Coral reefs are the most ecologically important, supporting 25% of all marine species.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is the MOST POPULATED in Jamaica (outside Kingston)?`,
    options: [
      "Westmoreland",
      "Manchester",
      "St. Andrew",
      "Portland",
    ],
    correctAnswer: 2,
    explanation: `St. Andrew, surrounding Kingston, is the most populous parish in Jamaica — effectively part of the capital's metropolitan area.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate",
    question: `What causes HURRICANES?`,
    options: [
      "Cold air from the north",
      "Warm ocean water evaporating and powering rotating storm systems in tropical regions",
      "Earthquakes under the sea",
      "Seasonal dust from the Sahara",
    ],
    correctAnswer: 1,
    explanation: `Hurricanes form over warm tropical ocean water (26°C or higher) — the warm water evaporates, rises, and forms the powerful rotating wind system.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Resources",
    question: `Which Jamaican natural resource is used to make ALUMINIUM?`,
    options: [
      "Limestone",
      "Petroleum",
      "Bauxite",
      "Gypsum",
    ],
    correctAnswer: 2,
    explanation: `Bauxite is refined into alumina and then smelted into aluminium — Jamaica is one of the world's largest producers of bauxite.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What makes JAMAICA's coastline varied?`,
    options: [
      "It is entirely sandy",
      "It has a mix of sandy beaches, rocky cliffs, mangroves, coral reefs, and bays — offering diverse ecosystems",
      "It is mostly cliff faces",
      "It is flat all the way around",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's coastline is richly diverse — sandy beaches (north coast), rocky bluffs, mangrove swamps (south coast), and coral reefs — each supporting different ecosystems and human uses.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `HISPANIOLA is the island shared by which TWO countries?`,
    options: [
      "Jamaica and Cuba",
      "Haiti and the Dominican Republic",
      "Puerto Rico and Cuba",
      "Trinidad and Barbados",
    ],
    correctAnswer: 1,
    explanation: `Hispaniola is the second-largest Caribbean island, shared between Haiti (west) and the Dominican Republic (east).`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `What is the KEY DIFFERENCE between a right and a privilege?`,
    options: [
      "There is no difference",
      "A right is guaranteed to all citizens regardless of merit; a privilege is something granted under specific conditions",
      "A privilege is more important than a right",
      "Only rights appear in the Constitution",
    ],
    correctAnswer: 1,
    explanation: `Rights are universal entitlements guaranteed by law — privileges are conditional and can be withdrawn. Rights cannot be taken without due process.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Government",
    question: `What is DEVOLUTION of power?`,
    options: [
      "Transferring power from local to central government",
      "Transferring certain powers from the national government to local or regional bodies",
      "Taking power away from all elected officials",
      "A type of military takeover",
    ],
    correctAnswer: 1,
    explanation: `Devolution transfers powers from the central government to local bodies — in Jamaica, giving Parish Councils more authority over local matters is an example.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Parliament",
    question: `What is a COMMITTEE in Parliament?`,
    options: [
      "A full parliamentary session",
      "A smaller group of MPs set up to examine specific issues in detail — like finance, public accounts, or specific ministries",
      "A type of Senate vote",
      "The Cabinet meeting",
    ],
    correctAnswer: 1,
    explanation: `Parliamentary committees are small groups of MPs that examine legislation, investigate issues, and scrutinise government departments in more depth than is possible in full Parliament.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Process",
    question: `What is CONSTITUENCY BOUNDARY DELIMITATION?`,
    options: [
      "The process of electing an MP",
      "The process of drawing or redrawing the boundaries of electoral constituencies to reflect population changes",
      "A type of voter registration",
      "A method of counting votes",
    ],
    correctAnswer: 1,
    explanation: `Constituency boundary delimitation is carried out periodically to ensure that constituencies have roughly equal populations — maintaining the principle of equal representation.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `The CARICOM SINGLE MARKET (CSM) allows:`,
    options: [
      "Only goods to move freely between member states",
      "Citizens, goods, services, and capital to move freely across CARICOM member states",
      "Only students to travel freely",
      "Trade only with non-CARICOM countries",
    ],
    correctAnswer: 1,
    explanation: `The CARICOM Single Market allows free movement of goods, services, capital, and skilled workers — creating a larger regional economic space for Caribbean countries.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `What does it mean to 'EXERCISE YOUR RIGHTS'?`,
    options: [
      "Physically exercising to maintain health",
      "Actively using and claiming the rights you are entitled to under the law",
      "Ignoring the rights of others",
      "Following government instructions only",
    ],
    correctAnswer: 1,
    explanation: `Exercising your rights means actively claiming and using the freedoms and protections you are entitled to — voting, speaking freely, seeking justice — not just passively knowing they exist.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `What is the ROLE of a CITIZEN in a democracy?`,
    options: [
      "To obey the government in all things",
      "To passively enjoy government services",
      "To participate actively — voting, staying informed, contributing to civic life, and holding government accountable",
      "To ignore government activities",
    ],
    correctAnswer: 2,
    explanation: `In a democracy, an active citizen goes beyond obeying laws — participating in elections, engaging with issues, holding officials accountable, and contributing to community life.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `The INFORMATION ACCESS to government records is known as:`,
    options: [
      "Government secrecy",
      "Freedom of Information — citizens' right to access public government documents",
      "A court order only",
      "A privilege granted to journalists only",
    ],
    correctAnswer: 1,
    explanation: `Freedom of Information laws give citizens the right to request and receive government documents — promoting transparency and accountability in democratic governance.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `What is NATURAL JUSTICE?`,
    options: [
      "The law of nature",
      "The basic principles that everyone is entitled to — a fair hearing before a decision is made and that no one should be a judge in their own case",
      "A type of environmental law",
      "Rules about natural resources",
    ],
    correctAnswer: 1,
    explanation: `Natural justice comprises two basic principles: the right to a fair hearing (audi alteram partem) and the rule against bias (nemo judex in causa sua) — fundamental to any fair legal system.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `The RIGHT TO PROPERTY means:`,
    options: [
      "Citizens can own anything they find",
      "Every person has the right to own property, and that property cannot be taken without lawful compensation",
      "Property rights apply only to land",
      "Only businesses have property rights",
    ],
    correctAnswer: 1,
    explanation: `The right to property protects citizens' ownership of possessions and land — the state may only acquire property for public purposes and must pay fair compensation.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `Which of the following BEST illustrates the LINK between primary and secondary economic activities?`,
    options: [
      "A teacher educating students",
      "A fisherman selling fish at the market",
      "Sugarcane grown in a field (primary) is processed into rum at a distillery (secondary)",
      "A hotel employing tour guides",
    ],
    correctAnswer: 2,
    explanation: `Primary activities produce raw materials; secondary activities process them. Sugarcane (grown = primary) → rum (manufactured = secondary) perfectly illustrates this chain.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `What is FAIR TRADE?`,
    options: [
      "A free market with no rules",
      "A system that ensures producers (especially in developing countries) receive fair prices and working conditions for their goods",
      "A type of local market only",
      "A trade between Caribbean countries only",
    ],
    correctAnswer: 1,
    explanation: `Fair Trade is a trading partnership that ensures farmers and workers in developing countries receive fair prices, safe working conditions, and community investment — particularly for exports like coffee, cocoa, and bananas.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What is the ROLE of the JAMAICA PROMOTIONS CORPORATION (JAMPRO)?`,
    options: [
      "To manage Jamaican prisons",
      "To promote Jamaica as a destination for foreign direct investment and business development",
      "To manage the National Water Commission",
      "To promote tourism only",
    ],
    correctAnswer: 1,
    explanation: `JAMPRO promotes trade and investment — attracting foreign businesses to invest in Jamaica, and helping Jamaican businesses access export markets.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `What is the SIGNIFICANCE of the MINISTRY OF HEALTH in Jamaica?`,
    options: [
      "It manages education",
      "It is responsible for the health of the Jamaican population — from primary care to hospitals, disease prevention, and health promotion",
      "It manages the police force",
      "It runs public parks",
    ],
    correctAnswer: 1,
    explanation: `The Ministry of Health and Wellness oversees Jamaica's entire public health system — hospitals, health centres, maternal health, disease control, and national health promotion programmes.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism",
    question: `What is a TOURISM MASTER PLAN?`,
    options: [
      "A guide for tourist attractions only",
      "A comprehensive strategic plan guiding the long-term development of Jamaica's tourism industry — balancing economic goals with sustainability",
      "A map for tourists",
      "A hotel development plan",
    ],
    correctAnswer: 1,
    explanation: `A Tourism Master Plan is a strategic blueprint for developing the tourism industry — setting targets, identifying infrastructure needs, and ensuring sustainable, equitable development.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `What is MICROFINANCE?`,
    options: [
      "Large loans from big banks",
      "Financial services (small loans, savings, insurance) provided to low-income individuals or small businesses who cannot access traditional banking",
      "A type of government pension",
      "Investing in large companies",
    ],
    correctAnswer: 1,
    explanation: `Microfinance provides financial services to people excluded from the formal banking system — small loans (microcredit) can help entrepreneurs start or grow businesses.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `What is the DIFFERENCE between a PROFIT and a REVENUE?`,
    options: [
      "They are the same thing",
      "Revenue is the total income from sales; profit is what remains after all costs are deducted",
      "Profit is the total income; revenue is what is left after costs",
      "Only profit matters in business",
    ],
    correctAnswer: 1,
    explanation: `Revenue is total income from sales. Profit = Revenue minus all costs (wages, raw materials, overheads). A business can have high revenue but low or even negative profit.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Interdependence",
    question: `What is the IMPACT of a rising US dollar on Jamaica?`,
    options: [
      "No impact",
      "Imports become cheaper for Jamaica",
      "Imports become more expensive (since most are priced in US dollars), and Jamaicans working abroad may send home more value",
      "The Jamaican economy always benefits",
    ],
    correctAnswer: 2,
    explanation: `A stronger US dollar makes imported goods more expensive for Jamaica (which imports much of what it uses) but can mean Jamaicans abroad send home more Jamaican dollars' worth.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `What is ENVIRONMENTAL VALUATION?`,
    options: [
      "Placing a monetary value on the services provided by natural ecosystems to help decision-makers understand the economic cost of environmental degradation",
      "A type of land registration",
      "An environmental inspection programme",
      "A type of tourism pricing",
    ],
    correctAnswer: 0,
    explanation: `Environmental valuation assigns economic values to ecosystem services (clean water, carbon storage, biodiversity) — helping policymakers make decisions that account for environmental costs and benefits.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `What does 'COMMUNITY-BASED TOURISM' mean?`,
    options: [
      "Tourism managed entirely by large hotel chains",
      "Tourism in which local communities play a central role in managing and benefiting from tourism activities in their area",
      "Tourism that takes place outside cities",
      "Tourism that involves farm visits only",
    ],
    correctAnswer: 1,
    explanation: `Community-based tourism involves local people managing tourism activities — guiding, hosting, and benefiting directly — ensuring tourism revenue stays within the community.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy10Questions : g5SsEasy10Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Social Studies",
        testName: "Easy 10",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 10</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 10</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 10</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
