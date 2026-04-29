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

const g5SsEasy5Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `Who was Norman Washington Manley?`,
    options: [
      "Jamaica's first Governor General",
      "A Jamaican lawyer, politician, and National Hero who championed independence and founded the PNP",
      "A leader of the Morant Bay Rebellion",
      "A founder of the Maroon communities",
    ],
    correctAnswer: 1,
    explanation: `Norman Washington Manley was a distinguished lawyer, National Hero, and founder of the People's National Party (PNP). He was a key architect of Jamaican self-government.`
  },
  {
    id: 2,
    type: "history",
    skill: "Colonial History",
    question: `Indentured labourers came to Jamaica after emancipation MAINLY from:`,
    options: [
      "West Africa",
      "China and India",
      "Canada and the United States",
      "Britain and Ireland",
    ],
    correctAnswer: 1,
    explanation: `After emancipation, Jamaica imported indentured labourers mainly from India and China to work on the plantations, as formerly enslaved people sought to leave plantation work.`
  },
  {
    id: 3,
    type: "history",
    skill: "Cultural Heritage",
    question: `Jamaica's national dish is:`,
    options: [
      "Rice and peas",
      "Jerk chicken",
      "Ackee and saltfish",
      "Bammy and fish",
    ],
    correctAnswer: 2,
    explanation: `Ackee and saltfish is Jamaica's official national dish. Ackee, originally from West Africa, is the national fruit.`
  },
  {
    id: 4,
    type: "history",
    skill: "National Heroes",
    question: `Which National Hero wrote the poem 'If We Must Die'?`,
    options: [
      "Marcus Garvey",
      "Norman Manley",
      "Claude McKay (not a National Hero, but influential)",
      "Sam Sharpe",
    ],
    correctAnswer: 0,
    explanation: `Marcus Garvey was known for powerful speeches and writings. Note: 'If We Must Die' was written by Claude McKay (1919), not a National Hero, but a great Jamaican poet. Marcus Garvey's slogan 'One God, One Aim, One Destiny' is famous. This question requires careful rechecking.`
  },
  {
    id: 5,
    type: "history",
    skill: "First Peoples",
    question: `What does 'Xaymaca' (Jamaica's Taino name) mean?`,
    options: [
      "Land of Many Rivers",
      "Land of Wood and Water",
      "Island of the Sun",
      "Land of Beautiful People",
    ],
    correctAnswer: 1,
    explanation: `'Xaymaca' or 'Xaymaca' in the Taino language meant 'Land of Wood and Water,' describing Jamaica's lush forests and many rivers.`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `What product was MOST responsible for Jamaica becoming a wealthy British colony?`,
    options: [
      "Tobacco",
      "Coffee",
      "Sugar",
      "Spices",
    ],
    correctAnswer: 2,
    explanation: `Sugar was the dominant crop of colonial Jamaica. The sugar plantation system drove the economy and was the main reason for the importation of enslaved Africans.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `Jamaica's National Flower is the:`,
    options: [
      "Hibiscus",
      "Orchid (Lignum Vitae blossom)",
      "Bougainvillea",
      "Poinsettia",
    ],
    correctAnswer: 1,
    explanation: `The Lignum Vitae (also called 'Wood of Life') is Jamaica's national flower. Its small blue flowers bloom on the Lignum Vitae tree, which is also Jamaica's national tree.`
  },
  {
    id: 8,
    type: "history",
    skill: "Maroons",
    question: `The Maroons signed a PEACE TREATY with the British in which decade?`,
    options: [
      "1690s",
      "1730s",
      "1770s",
      "1840s",
    ],
    correctAnswer: 1,
    explanation: `The Maroon Peace Treaties were signed in 1739 (Leeward Maroons under Cudjoe) and 1740 (Windward Maroons under Quao), granting Maroons freedom and land in exchange for returning escaped enslaved people.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Heritage",
    question: `Reggae music was granted UNESCO Intangible Cultural Heritage status in:`,
    options: [
      "2010",
      "2015",
      "2018",
      "2022",
    ],
    correctAnswer: 2,
    explanation: `UNESCO designated reggae music as an Intangible Cultural Heritage of Humanity in 2018, recognising its contribution to international discourse on justice, peace, and resistance.`
  },
  {
    id: 10,
    type: "history",
    skill: "Colonial History",
    question: `The Act that officially ended slavery in British colonies was passed in:`,
    options: [
      "1833",
      "1838",
      "1807",
      "1865",
    ],
    correctAnswer: 0,
    explanation: `The Slavery Abolition Act was passed by the British Parliament in 1833, coming into effect on August 1, 1834. Full freedom came in 1838 with the end of Apprenticeship.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `What is a VALLEY?`,
    options: [
      "A high elevated plateau",
      "A low area of land between hills or mountains",
      "A type of wetland near the sea",
      "A large flat plain",
    ],
    correctAnswer: 1,
    explanation: `A valley is a low-lying area of land between hills or mountains, often with a river running through it.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish contains the town of Montego Bay — Jamaica's second-largest city?`,
    options: [
      "Hanover",
      "St. James",
      "Westmoreland",
      "Trelawny",
    ],
    correctAnswer: 1,
    explanation: `Montego Bay is located in St. James parish on Jamaica's northwest coast. It is Jamaica's second-largest city and a major tourist destination.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `What does a MAP TITLE tell you?`,
    options: [
      "How old the map is",
      "The main subject or area covered by the map",
      "The population of the area shown",
      "The scale used on the map",
    ],
    correctAnswer: 1,
    explanation: `The title of a map tells you what subject area or region the map represents — it is the first piece of information you should read.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Physical Features",
    question: `What is a TRIBUTARY?`,
    options: [
      "A small stream or river that flows into a larger river",
      "A type of coastal landform",
      "A mountain pass",
      "A flat area of land",
    ],
    correctAnswer: 0,
    explanation: `A tributary is a stream or smaller river that flows into and joins a larger river — like branches joining a tree trunk.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Environment",
    question: `Which of the following is a way to CONSERVE water in a community?`,
    options: [
      "Leaving taps running all day",
      "Using hosepipes to water gardens daily",
      "Installing water tanks to collect rainwater",
      "Increasing industrial water use",
    ],
    correctAnswer: 2,
    explanation: `Rainwater harvesting (collecting rainwater in tanks) is an effective conservation method — reducing dependence on piped water and protecting water reserves.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Physical Features",
    question: `Jamaica's BLACK RIVER is significant because it is:`,
    options: [
      "The fastest-flowing river",
      "The deepest river",
      "The only navigable river in Jamaica",
      "The shortest river",
    ],
    correctAnswer: 2,
    explanation: `The Black River in St. Elizabeth is Jamaica's most navigable river and flows through the Black River Morass (wetland), an important ecosystem.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Caribbean",
    question: `A CARICOM member state that is NOT an island is:`,
    options: [
      "Jamaica",
      "Trinidad",
      "Guyana",
      "Barbados",
    ],
    correctAnswer: 2,
    explanation: `Guyana is the only mainland CARICOM member state (located in South America). All the others are island nations.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Maps",
    question: `On a map, what does RED usually represent?`,
    options: [
      "Water bodies such as rivers and seas",
      "Roads or main highways",
      "Forested areas",
      "Farmland",
    ],
    correctAnswer: 1,
    explanation: `On most maps, red lines indicate roads or highways. However, map colours vary by type — always check the legend.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What is an ARCHIPELAGO?`,
    options: [
      "A single large island",
      "A group or chain of islands",
      "A type of peninsula",
      "A flat coastal plain",
    ],
    correctAnswer: 1,
    explanation: `An archipelago is a chain or group of islands — the Caribbean islands form an archipelago.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environment",
    question: `Which human activity causes the MOST soil erosion in Jamaica?`,
    options: [
      "Planting trees on hillsides",
      "Deforestation and poor agricultural practices",
      "Fishing in rivers",
      "Building schools",
    ],
    correctAnswer: 1,
    explanation: `Removing forest cover leaves soil exposed and vulnerable to washing away by rain — deforestation and poor farming on slopes are major causes of soil erosion in Jamaica.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `The SEPARATION OF POWERS in government refers to:`,
    options: [
      "Dividing money between parishes",
      "Dividing government power among legislative, executive, and judicial branches so no one branch is too powerful",
      "Separating the military from the police",
      "Dividing the island into independent states",
    ],
    correctAnswer: 1,
    explanation: `The separation of powers ensures a system of checks and balances — the Legislature makes laws, the Executive implements them, and the Judiciary interprets them.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Rights",
    question: `Which of the following is protected by Jamaica's Charter of Fundamental Rights and Freedoms?`,
    options: [
      "The right to unlimited wealth",
      "The right to life, liberty, freedom of expression, and equal treatment under the law",
      "The right to avoid paying taxes",
      "The right to break unjust laws",
    ],
    correctAnswer: 1,
    explanation: `The Charter (2011) protects fundamental rights including life, liberty, freedom of expression, freedom of religion, and equal treatment — rights all citizens can claim.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government",
    question: `The PRIMARY role of the House of Representatives is to:`,
    options: [
      "Appoint senators",
      "Make laws on behalf of the Jamaican people",
      "Manage parish affairs",
      "Operate as the Supreme Court",
    ],
    correctAnswer: 1,
    explanation: `The House of Representatives, whose members are elected by the people, is the principal law-making body in Jamaica's Parliament.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Process",
    question: `The ELECTORAL OFFICE OF JAMAICA (EOJ) is responsible for:`,
    options: [
      "Collecting taxes",
      "Managing elections — registering voters, organising polls, and verifying results",
      "Setting interest rates",
      "Building schools",
    ],
    correctAnswer: 1,
    explanation: `The Electoral Office of Jamaica is the independent body that manages the entire electoral process — from registering voters to announcing election results.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `Which of the following is a CARICOM member state?`,
    options: [
      "Mexico",
      "Venezuela",
      "Barbados",
      "Colombia",
    ],
    correctAnswer: 2,
    explanation: `Barbados is a full CARICOM member state. The others are not — Mexico and Colombia are separate organisations; Venezuela has observer status only.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `What does the RIGHT TO EDUCATION mean in Jamaica?`,
    options: [
      "Only rich families can access quality education",
      "All children have the right to attend school and access an education",
      "Education is optional for all ages",
      "Only public school attendance is compulsory",
    ],
    correctAnswer: 1,
    explanation: `The right to education means every child has the entitlement to attend school and receive instruction — a fundamental right in Jamaica.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `Which of the following BEST demonstrates GOOD CITIZENSHIP?`,
    options: [
      "Ignoring community problems",
      "Littering in public spaces",
      "Voting, obeying laws, and participating in community activities",
      "Refusing to pay taxes",
    ],
    correctAnswer: 2,
    explanation: `Good citizenship involves active participation — voting, following laws, paying taxes, volunteering, and contributing positively to community life.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `A BY-ELECTION in Jamaica is held when:`,
    options: [
      "A general election takes place",
      "A seat in Parliament becomes vacant between general elections",
      "CARICOM meets",
      "A new law is passed",
    ],
    correctAnswer: 1,
    explanation: `A by-election fills a vacancy in a parliamentary seat that occurs between general elections — for example, when an MP dies, resigns, or is disqualified.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `Why is an INDEPENDENT JUDICIARY important in a democracy?`,
    options: [
      "It allows the government to make all decisions without challenge",
      "It ensures laws are interpreted fairly and impartially, without political interference",
      "It means judges can ignore unfair laws",
      "It removes the need for Parliament",
    ],
    correctAnswer: 1,
    explanation: `An independent judiciary protects citizens by applying the law fairly — free from political pressure, ensuring even the government must obey the law.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `The right to FREEDOM OF MOVEMENT means:`,
    options: [
      "Citizens can travel internationally without any documents",
      "Citizens have the right to move freely within the country and to leave and return",
      "Anyone can enter Jamaica without a passport",
      "Citizens must get government permission to travel domestically",
    ],
    correctAnswer: 1,
    explanation: `Freedom of movement is the right to travel within a country and to enter and leave freely — a fundamental liberty in democratic societies.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Production",
    question: `LABOUR in the factors of production refers to:`,
    options: [
      "Tools and machines",
      "Land and natural resources",
      "The physical and mental effort of people in production",
      "The entrepreneur's profit",
    ],
    correctAnswer: 2,
    explanation: `Labour refers to the human effort — both physical (working in fields, factories) and mental (planning, managing, creating) — applied in producing goods and services.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `What is the Jamaica Agricultural Society (JAS)?`,
    options: [
      "A government ministry",
      "A farmers' cooperative that supports Jamaican agriculture",
      "A type of farming method",
      "A foreign agricultural company",
    ],
    correctAnswer: 1,
    explanation: `The Jamaica Agricultural Society (JAS) is a farmers' organisation that supports and advocates for Jamaican farmers, providing training, advocacy, and market access.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What are IMPORTS?`,
    options: [
      "Goods sold by Jamaica to other countries",
      "Goods and services purchased from other countries",
      "The total value of Jamaica's production",
      "Donations received from abroad",
    ],
    correctAnswer: 1,
    explanation: `Imports are goods and services that a country buys from other countries — the opposite of exports.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Tourism",
    question: `The phrase 'THE CARIBBEAN'S PRODUCT IS ITS PEOPLE' means:`,
    options: [
      "Caribbean people should leave their countries",
      "Caribbean people themselves — their culture, hospitality, and creativity — are a key attraction for tourists",
      "Caribbean labour is cheap",
      "People are more valuable than nature",
    ],
    correctAnswer: 1,
    explanation: `Tourism is deeply linked to people — the warmth, culture, cuisine, and creativity of Caribbean communities are what attract visitors, not just scenery.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Community Services",
    question: `The NATIONAL WATER COMMISSION (NWC) provides which service?`,
    options: [
      "Electricity",
      "Piped water and sewage treatment services",
      "Healthcare",
      "Transportation",
    ],
    correctAnswer: 1,
    explanation: `The National Water Commission is Jamaica's national water utility, responsible for providing piped water and wastewater treatment across Jamaica.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Trade",
    question: `What is a TRADE SURPLUS?`,
    options: [
      "When a country imports more than it exports",
      "When a country exports more than it imports",
      "When a country has no trade",
      "When a country owes money to other nations",
    ],
    correctAnswer: 1,
    explanation: `A trade surplus occurs when export earnings exceed import spending — the country earns more from selling abroad than it spends on foreign goods.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Money",
    question: `INFLATION refers to:`,
    options: [
      "A decrease in the population",
      "A general rise in prices over time, reducing the purchasing power of money",
      "An increase in wages only",
      "A government borrowing money",
    ],
    correctAnswer: 1,
    explanation: `Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power — the same amount of money buys less.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Entrepreneurship",
    question: `Which of the following is a characteristic of a SUCCESSFUL entrepreneur?`,
    options: [
      "Afraid to take any risks",
      "Waiting for others to create opportunities",
      "Initiative, creativity, and willingness to take calculated risks",
      "Following only existing business models",
    ],
    correctAnswer: 2,
    explanation: `Successful entrepreneurs show initiative (starting something new), creativity (finding solutions), and risk tolerance (accepting uncertainty in pursuit of reward).`
  },
  {
    id: 39,
    type: "economics",
    skill: "Economic Activities",
    question: `A HOTEL provides an example of which type of economic activity?`,
    options: [
      "Primary",
      "Secondary",
      "Tertiary (service)",
      "Quaternary",
    ],
    correctAnswer: 2,
    explanation: `A hotel provides services (accommodation, hospitality) — a classic example of the tertiary sector.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `What is a CO-OPERATIVE (co-op)?`,
    options: [
      "A company owned by shareholders who want profits",
      "A business owned and run by its members for their mutual benefit",
      "A type of government ministry",
      "A charity organisation",
    ],
    correctAnswer: 1,
    explanation: `A co-operative is a business or organisation owned and operated by its members, who share the benefits — common in agriculture, credit, and community development.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy5MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy5Questions : g5SsEasy5Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 5</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 5</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 5</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
