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

const g5SsEasy4Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Colonial History",
    question: `What was the name of the system used to transport enslaved Africans to the Caribbean?`,
    options: [
      "The Gold Route",
      "The Spice Trade",
      "The Triangular Trade",
      "The Atlantic Exchange",
    ],
    correctAnswer: 2,
    explanation: `The Triangular Trade was the three-part trade route: manufactured goods from Europe to Africa, enslaved Africans to the Americas, and raw materials (sugar, tobacco) back to Europe.`
  },
  {
    id: 2,
    type: "history",
    skill: "National Heroes",
    question: `Which National Hero was a planter and politician who was elected to the Jamaican legislature?`,
    options: [
      "Paul Bogle",
      "Sam Sharpe",
      "George William Gordon",
      "Marcus Garvey",
    ],
    correctAnswer: 2,
    explanation: `George William Gordon was a mixed-race planter and politician, elected to represent the people of St. Thomas, who championed the poor and was executed after the Morant Bay Rebellion.`
  },
  {
    id: 3,
    type: "history",
    skill: "Independence",
    question: `Who was Jamaica's FIRST Prime Minister after independence?`,
    options: [
      "Norman Manley",
      "Donald Sangster",
      "Alexander Bustamante",
      "Hugh Shearer",
    ],
    correctAnswer: 2,
    explanation: `Sir Alexander Bustamante became Jamaica's first Prime Minister when Jamaica gained independence on August 6, 1962.`
  },
  {
    id: 4,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Jonkanoo festival originates from:`,
    options: [
      "European Christmas traditions",
      "African cultural traditions brought by enslaved people",
      "Spanish colonialism",
      "The Taino people",
    ],
    correctAnswer: 1,
    explanation: `Jonkanoo (John Canoe) is a uniquely Caribbean/Jamaican folk tradition with roots in West African cultural celebrations, adapted by enslaved Africans in Jamaica.`
  },
  {
    id: 5,
    type: "history",
    skill: "First Peoples",
    question: `The Taino people grew which crop as their MAIN food staple?`,
    options: [
      "Rice",
      "Corn (maize) and cassava",
      "Wheat",
      "Sugar",
    ],
    correctAnswer: 1,
    explanation: `Cassava and corn (maize) were the main food crops of the Taino people. Cassava was particularly important and is still eaten in Jamaica today.`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `The Maroons were:`,
    options: [
      "Spanish soldiers who remained after Britain's conquest",
      "Escaped enslaved Africans who formed free communities and resisted British rule",
      "British soldiers stationed in Jamaica",
      "Indigenous Taino people",
    ],
    correctAnswer: 1,
    explanation: `Maroons were formerly enslaved Africans who escaped the plantations, formed their own independent communities, and waged guerrilla warfare against the British.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural History",
    question: `The 'Blue and John Crow Mountains' is significant because it is:`,
    options: [
      "The oldest mountain range in the Caribbean",
      "A UNESCO World Heritage Site with deep historical, cultural, and ecological significance",
      "The only mountain range in Jamaica",
      "Jamaica's largest parish",
    ],
    correctAnswer: 1,
    explanation: `The Blue and John Crow Mountains were designated a UNESCO World Heritage Site in 2015, recognised for their biodiversity and importance as a refuge for Maroons.`
  },
  {
    id: 8,
    type: "history",
    skill: "National Heroes",
    question: `Which National Hero's image appears on Jamaican currency and postage stamps?`,
    options: [
      "Only Sam Sharpe",
      "Only Marcus Garvey",
      "All seven National Heroes are honoured on currency and/or stamps",
      "Only Nanny",
    ],
    correctAnswer: 2,
    explanation: `All seven of Jamaica's National Heroes appear on Jamaican banknotes and/or stamps, recognising their contributions to the nation.`
  },
  {
    id: 9,
    type: "history",
    skill: "Colonial History",
    question: `The 'Baptist War' of 1831 got its name because:`,
    options: [
      "Baptist missionaries organised the rebellion",
      "Sam Sharpe and many other leaders were Baptist deacons or members",
      "The British Baptists supported the rebellion",
      "It occurred near a Baptist church",
    ],
    correctAnswer: 1,
    explanation: `The rebellion is called the 'Baptist War' because its leader, Sam Sharpe, and many of its participants were members of Baptist churches — they used church networks to organise.`
  },
  {
    id: 10,
    type: "history",
    skill: "Cultural Heritage",
    question: `What does the Jamaican national motto 'Out of Many, One People' represent?`,
    options: [
      "Jamaica's many languages",
      "The unity of Jamaica's diverse ethnic groups into one nation",
      "Jamaica's many parishes",
      "The seven National Heroes",
    ],
    correctAnswer: 1,
    explanation: `The motto reflects Jamaica's diverse ethnic heritage — African, European, East Indian, Chinese, and others — united as one Jamaican people.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `What is the name of the flat, fertile plain in southern Jamaica?`,
    options: [
      "The Blue Mountains",
      "The Liguanea Plain",
      "The Cockpit Country",
      "The John Crow Mountains",
    ],
    correctAnswer: 1,
    explanation: `The Liguanea Plain is the flat, fertile area surrounding Kingston, formed by alluvial deposits from the Blue Mountains.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Physical Features",
    question: `The Cockpit Country is BEST described as:`,
    options: [
      "A flat agricultural plain",
      "A coastal wetland",
      "A distinctive limestone landscape with cone-shaped hills and deep valleys",
      "A series of sandy beaches",
    ],
    correctAnswer: 2,
    explanation: `The Cockpit Country in central Jamaica is a unique karst limestone landscape — one of the most rugged and biodiverse regions in the Western Hemisphere.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is Jamaica's SMALLEST by area?`,
    options: [
      "Kingston",
      "St. Andrew",
      "Hanover",
      "Portland",
    ],
    correctAnswer: 0,
    explanation: `Kingston is Jamaica's smallest parish by area but contains the capital city and is the most densely populated.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Maps",
    question: `On a map, a CONTOUR LINE shows:`,
    options: [
      "The borders between parishes",
      "Lines of equal elevation above sea level",
      "The course of rivers",
      "Roads and highways",
    ],
    correctAnswer: 1,
    explanation: `Contour lines connect points of equal elevation, helping map readers visualise the shape and height of landforms.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Environment",
    question: `What is DEFORESTATION?`,
    options: [
      "Planting new trees",
      "The removal of forests to use the land for other purposes",
      "A type of hurricane",
      "The flooding of river valleys",
    ],
    correctAnswer: 1,
    explanation: `Deforestation is the large-scale removal of trees and forests, often for agriculture, logging, or urban development — causing soil erosion, biodiversity loss, and climate change.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Physical Features",
    question: `Jamaica's BLUE MOUNTAINS are known for:`,
    options: [
      "Producing sugar",
      "Being the flattest area in Jamaica",
      "Their high elevation, cool temperatures, and famous coffee production",
      "Their large bauxite deposits",
    ],
    correctAnswer: 2,
    explanation: `The Blue Mountains are Jamaica's highest range, home to cooler temperatures, rich biodiversity, and the world-famous Blue Mountain Coffee.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Caribbean",
    question: `Which of the following is a BENEFIT of being part of the Caribbean Sea region?`,
    options: [
      "Exposure to harsh winter weather",
      "Access to the Atlantic coast of North America",
      "A warm climate and sea that supports tourism, fishing, and marine ecosystems",
      "Distance from trade routes",
    ],
    correctAnswer: 2,
    explanation: `The Caribbean Sea provides warm temperatures for tourism, rich fishing grounds, and diverse marine ecosystems — all economic and environmental benefits.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Physical Features",
    question: `What is a DELTA in geography?`,
    options: [
      "A mountain peak",
      "A type of lake",
      "A triangular deposit of sediment formed at a river's mouth",
      "A large plateau",
    ],
    correctAnswer: 2,
    explanation: `A delta is a landform built up by sediment deposited where a river flows into a larger body of water, often forming a triangular shape.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Climate",
    question: `The NORTHEAST TRADE WINDS affect Jamaica by:`,
    options: [
      "Bringing cold weather",
      "Providing cooling breezes and contributing to the island's rainfall pattern",
      "Causing severe earthquakes",
      "Creating tornadoes",
    ],
    correctAnswer: 1,
    explanation: `The northeast trade winds bring moisture and cooling breezes to Jamaica, contributing to rainfall — particularly on the northeast coast — and moderating temperatures.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Parishes",
    question: `Which Jamaican parish is known for its limestone caves, including the Green Grotto Caves?`,
    options: [
      "St. Thomas",
      "St. Ann",
      "Westmoreland",
      "St. Mary",
    ],
    correctAnswer: 1,
    explanation: `St. Ann parish on the north coast is home to numerous limestone caves including the Green Grotto Caves, a popular tourist attraction.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `Which branch of government MAKES the laws in Jamaica?`,
    options: [
      "The Judiciary",
      "The Cabinet",
      "The Legislature (Parliament)",
      "The Governor General",
    ],
    correctAnswer: 2,
    explanation: `The Legislature — Parliament, comprising the Senate and House of Representatives — is responsible for making, amending, and repealing laws.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Rights",
    question: `What does 'FREEDOM OF ASSEMBLY' mean?`,
    options: [
      "The right to build public buildings",
      "The right to gather peacefully in groups or form organisations",
      "The right to assemble furniture",
      "The right to enter any building",
    ],
    correctAnswer: 1,
    explanation: `Freedom of assembly is the right to meet peacefully with others, form organisations, and hold public gatherings — a fundamental democratic right.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Electoral Process",
    question: `What is a GENERAL ELECTION?`,
    options: [
      "An election for a specific local position",
      "A national election where all constituencies elect representatives to Parliament",
      "An election held every month",
      "A CARICOM vote",
    ],
    correctAnswer: 1,
    explanation: `A general election is a nationwide vote in which all constituencies elect their representatives to the House of Representatives.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Government",
    question: `The JUDICIARY in Jamaica includes:`,
    options: [
      "Parliament and the Cabinet",
      "The Senate and House of Representatives",
      "Courts of law, including the Supreme Court and Court of Appeal",
      "The Governor General and Prime Minister",
    ],
    correctAnswer: 2,
    explanation: `The Judiciary comprises the court system: the Privy Council (highest), Court of Appeal, Supreme Court, Resident Magistrate's Court, and other courts.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `CARICOM promotes which of the following among member states?`,
    options: [
      "Military alliances",
      "Economic integration, free trade, and cooperation on education and health",
      "Border closures",
      "Using a single currency immediately",
    ],
    correctAnswer: 1,
    explanation: `CARICOM's main goals include economic integration, free movement of goods and people, and cooperation in education, health, and security.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `The right NOT to be tortured or treated inhumanely is called:`,
    options: [
      "The right to education",
      "The right to life and personal liberty",
      "The right against cruel, inhuman, or degrading treatment",
      "Freedom of speech",
    ],
    correctAnswer: 2,
    explanation: `The right against cruel, inhuman, or degrading treatment is enshrined in Jamaica's Constitution and international human rights law.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `Which of the following is a RESPONSIBILITY of students in their school community?`,
    options: [
      "Breaking school rules to test authority",
      "Respecting teachers and fellow students and following school rules",
      "Only attending school when they want to",
      "Deciding which subjects are taught",
    ],
    correctAnswer: 1,
    explanation: `Students have responsibilities in school — respecting others, following rules, attending regularly, and contributing positively to the school community.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `The OPPOSITION in Jamaica refers to:`,
    options: [
      "A group that wants to abolish the government",
      "Political parties not currently in government, who hold the government accountable",
      "A type of legal protest",
      "The Senate",
    ],
    correctAnswer: 1,
    explanation: `The Opposition comprises the political parties that are not in government. They scrutinise government decisions and hold them accountable in Parliament.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `A person who BREAKS the law may face:`,
    options: [
      "A reward from the government",
      "Nothing — laws are optional",
      "Legal consequences such as fines, community service, or imprisonment",
      "Only a warning",
    ],
    correctAnswer: 2,
    explanation: `Breaking the law has legal consequences, determined by the courts. These can include fines, community service, imprisonment, or other penalties depending on the offence.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Electoral Process",
    question: `Who is eligible to be elected as a Member of Parliament in Jamaica?`,
    options: [
      "Any Jamaican citizen, regardless of age",
      "A Jamaican citizen aged 21 or over who meets constitutional requirements",
      "Only university-educated citizens",
      "Only citizens who have lived abroad",
    ],
    correctAnswer: 1,
    explanation: `To be eligible for Parliament, a candidate must be a Jamaican citizen, at least 21 years old, registered to vote, and meet other constitutional criteria.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `Which of the following is a PRIMARY economic activity?`,
    options: [
      "Running a hotel",
      "Teaching swimming",
      "Fishing in the sea",
      "Repairing boats",
    ],
    correctAnswer: 2,
    explanation: `Fishing is a primary activity — it extracts a natural resource (fish) directly from the natural environment.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `What does 'SUBSISTENCE FARMING' mean?`,
    options: [
      "Farming on very large plantations for export",
      "Growing just enough food for the farmer's family with little or no surplus for sale",
      "Using chemicals to grow crops faster",
      "Farming with modern machinery only",
    ],
    correctAnswer: 1,
    explanation: `Subsistence farming produces food primarily for the farmer's own consumption — with little or nothing left over to sell. It contrasts with commercial farming.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Tourism",
    question: `What is an ECOTOURIST?`,
    options: [
      "A tourist who only travels by bus",
      "A tourist interested in experiencing natural environments responsibly and sustainably",
      "A tourist who travels only to cities",
      "A tourist on a cruise ship",
    ],
    correctAnswer: 1,
    explanation: `An ecotourist travels to natural areas, appreciates the environment, and contributes to conservation — a form of responsible, sustainable tourism.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `What is the role of the JAMAICA NATIONAL HERITAGE TRUST?`,
    options: [
      "Collecting taxes",
      "Providing police services",
      "Identifying, preserving, and promoting Jamaica's national heritage sites",
      "Running schools and hospitals",
    ],
    correctAnswer: 2,
    explanation: `The Jamaica National Heritage Trust (JNHT) is responsible for identifying, preserving, and promoting Jamaica's built and natural heritage.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Trade",
    question: `What is a TRADE DEFICIT?`,
    options: [
      "When a country exports more than it imports",
      "When a country imports more than it exports",
      "When a country has no trade with other nations",
      "When exports and imports are exactly equal",
    ],
    correctAnswer: 1,
    explanation: `A trade deficit occurs when the value of a country's imports exceeds the value of its exports — the country is spending more on goods from abroad than it earns from selling abroad.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `What does GDP (Gross Domestic Product) measure?`,
    options: [
      "The total population of a country",
      "The total value of all goods and services produced in a country in a year",
      "The amount of money a country imports",
      "The number of businesses in a country",
    ],
    correctAnswer: 1,
    explanation: `GDP is the standard measure of a country's economic output — the total monetary value of all goods and services produced within its borders in a given year.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A MARKET VENDOR who grows her own vegetables and sells them at the local market is involved in:`,
    options: [
      "Only primary activities",
      "Only tertiary activities",
      "Both primary activities (growing) and tertiary activities (selling a service to buyers)",
      "Only secondary activities",
    ],
    correctAnswer: 2,
    explanation: `This vendor engages in primary activity (growing vegetables) and tertiary activity (selling directly to customers at the market).`
  },
  {
    id: 38,
    type: "economics",
    skill: "Production",
    question: `What does CAPITAL mean in the factors of production?`,
    options: [
      "Land used for farming",
      "The work done by people",
      "Money, tools, machinery, and equipment used in production",
      "The skill of organising a business",
    ],
    correctAnswer: 2,
    explanation: `Capital refers to the man-made tools, equipment, machinery, and money used in the production of goods and services.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `Jamaica's forests are a natural resource that provide:`,
    options: [
      "Bauxite for export",
      "Timber, watershed protection, and habitat for wildlife",
      "Petroleum for electricity",
      "Sand for beaches only",
    ],
    correctAnswer: 1,
    explanation: `Forests provide timber (wood), protect watersheds (filtering and maintaining water supplies), support biodiversity, and help prevent soil erosion.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community Development",
    question: `What does SUSTAINABLE DEVELOPMENT mean?`,
    options: [
      "Development that uses resources as quickly as possible",
      "Development that meets present needs without compromising the ability of future generations to meet their needs",
      "Development that only benefits rich countries",
      "Development that ignores the environment",
    ],
    correctAnswer: 1,
    explanation: `Sustainable development balances economic growth with environmental protection and social wellbeing — ensuring future generations inherit a healthy planet and economy.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy4Questions : g5SsEasy4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 4",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 4</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 4</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 4</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
