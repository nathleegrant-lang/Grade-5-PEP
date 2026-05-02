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

const g5SsEasy9Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cultural Heritage",
    question: `What does the Jamaican flag represent with its BLACK colour?`,
    options: [
      "The sea",
      "The land",
      "The hardships faced and overcome by the Jamaican people",
      "Slavery and colonial rule only",
    ],
    correctAnswer: 2,
    explanation: `Black on the Jamaican flag represents the hardships — past and present — that the Jamaican people have faced and overcome.`
  },
  {
    id: 2,
    type: "history",
    skill: "Colonial History",
    question: `The system of 'INDENTURESHIP' used after emancipation was similar to slavery because:`,
    options: [
      "Workers were paid a high salary",
      "Workers were brought to a foreign land and bound by contracts that severely limited their freedom",
      "Workers could leave at any time",
      "Workers owned land after their contract",
    ],
    correctAnswer: 1,
    explanation: `Indentured labourers were contractually bound to work for a specific employer for 5-10 years, with little freedom to change employers or leave — sharing features with earlier bondage.`
  },
  {
    id: 3,
    type: "history",
    skill: "National Heroes",
    question: `Alexander Bustamante served as Prime Minister from:`,
    options: [
      "1938 to 1944",
      "1944 to 1955",
      "1962 to 1967",
      "1967 to 1972",
    ],
    correctAnswer: 2,
    explanation: `Bustamante served as Jamaica's first Prime Minister from independence in 1962 until 1967, when his party lost the general election.`
  },
  {
    id: 4,
    type: "history",
    skill: "First Peoples",
    question: `The Taino people had a CHIEF or leader known as a:`,
    options: [
      "Shaman",
      "Cacique",
      "Chief Maroon",
      "Buccanner",
    ],
    correctAnswer: 1,
    explanation: `Taino societies were organised into villages led by a cacique (chief) — usually male, though some female caciques (cacicas) are recorded.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cultural Heritage",
    question: `Jamaica's COAT OF ARMS features which animal?`,
    options: [
      "A hummingbird",
      "Two crocodiles supporting a shield",
      "A lion and a unicorn",
      "A Doctor Bird",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's Coat of Arms features two Taino figures — one male and one female — flanking a shield with a crocodile, topped by a Jamaican Crocodile on a helmet.`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `What was the role of an 'OVERSEER' on a colonial plantation?`,
    options: [
      "The owner of the plantation",
      "A formerly enslaved person who worked freely",
      "A person hired to manage and supervise the work of enslaved people",
      "A colonial government official",
    ],
    correctAnswer: 2,
    explanation: `An overseer was employed by the plantation owner to supervise and enforce the labour of enslaved people — they held considerable power and were often feared.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `The GREEN on Jamaica's flag represents:`,
    options: [
      "Hope and Jamaica's lush agricultural heritage",
      "The sea",
      "The British connection",
      "The Maroon communities",
    ],
    correctAnswer: 0,
    explanation: `Green represents both the island's lush vegetation and its agricultural heritage, as well as the hope of the Jamaican people.`
  },
  {
    id: 8,
    type: "history",
    skill: "National Heroes",
    question: `Paul Bogle's home parish, St. Thomas, is known for which important historical town?`,
    options: [
      "Montego Bay",
      "Morant Bay",
      "Black River",
      "May Pen",
    ],
    correctAnswer: 1,
    explanation: `Morant Bay, in St. Thomas, was the site of the Morant Bay Rebellion courthouse. It is historically significant as the centre of the 1865 uprising.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Heritage",
    question: `The Jamaican Diaspora refers to:`,
    options: [
      "People who have never left Jamaica",
      "Jamaicans and people of Jamaican descent living outside Jamaica",
      "Tourists visiting Jamaica",
      "Jamaican politicians living abroad",
    ],
    correctAnswer: 1,
    explanation: `The Jamaican Diaspora consists of Jamaicans and their descendants living abroad — particularly in the UK, USA, and Canada — who maintain cultural and economic ties to Jamaica.`
  },
  {
    id: 10,
    type: "history",
    skill: "Colonial History",
    question: `In what way did the Roman Catholic Church support colonialism in the Caribbean?`,
    options: [
      "The Church actively fought against slavery from the start",
      "The Church blessed colonial conquest and sometimes used enslaved labour in missions",
      "The Church had no presence in the Caribbean",
      "The Church funded the independence movements",
    ],
    correctAnswer: 1,
    explanation: `The Roman Catholic Church initially blessed and supported Spanish colonial expansion in the Caribbean, though some clergy (like Bartolomé de las Casas) later protested the treatment of indigenous peoples.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `The PORT ROYAL area of Jamaica is historically significant because:`,
    options: [
      "It is Jamaica's highest point",
      "It was a prosperous pirate town that sank into the sea after an earthquake in 1692",
      "It is the location of the main airport",
      "It is Jamaica's oldest parish",
    ],
    correctAnswer: 1,
    explanation: `Port Royal was once one of the most prosperous cities in the Caribbean — known as a pirate haven — before it was largely destroyed by an earthquake and tsunami in 1692.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is known for sugar production and has the town of May Pen as its capital?`,
    options: [
      "Manchester",
      "Clarendon",
      "St. Catherine",
      "St. Elizabeth",
    ],
    correctAnswer: 1,
    explanation: `Clarendon is a major sugar-producing parish in central Jamaica, with May Pen as its capital and the Monymusk Sugar Factory as a key employer.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `What is the DIFFERENCE between a MAP and a GLOBE?`,
    options: [
      "They are exactly the same",
      "A globe is a three-dimensional model of the Earth; a map is a flat, two-dimensional representation",
      "A globe is made of paper; a map is made of plastic",
      "A globe only shows land; a map shows everything",
    ],
    correctAnswer: 1,
    explanation: `A globe is a three-dimensional spherical model — more accurate for showing shapes and distances globally. A map is a flat projection that introduces some distortion.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environment",
    question: `What is a NATIONAL PARK?`,
    options: [
      "An urban recreation area",
      "A protected area of land managed for conservation, wildlife, and often public enjoyment",
      "A park for cars",
      "A farming reserve",
    ],
    correctAnswer: 1,
    explanation: `A national park is a protected area designated to preserve natural landscapes, biodiversity, and cultural heritage — Jamaica's Blue and John Crow Mountains National Park is an example.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Physical Features",
    question: `A SWAMP is:`,
    options: [
      "A dry, rocky area",
      "A type of flat desert",
      "A wetland area with standing water and vegetation",
      "A mountain valley",
    ],
    correctAnswer: 2,
    explanation: `A swamp is a wetland characterised by standing water and trees or shrubs — Jamaica has swamps along its south coast, including the Black River Morass.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `Which county contains Jamaica's 'Garden Parish' — known for its rich agriculture?`,
    options: [
      "Surrey",
      "Cornwall",
      "Middlesex",
      "Trelawny",
    ],
    correctAnswer: 1,
    explanation: `St. Elizabeth, known as the 'Garden Parish' for its rich agricultural output, is located in Cornwall County in western Jamaica.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate",
    question: `What is a DROUGHT?`,
    options: [
      "A heavy period of flooding",
      "A prolonged period of below-average rainfall leading to water shortages",
      "A tropical storm",
      "An unusually cold period",
    ],
    correctAnswer: 1,
    explanation: `A drought is a sustained period of significantly below-average precipitation — in Jamaica, droughts can severely affect water supplies, agriculture, and communities.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Resources",
    question: `Which of the following is a RENEWABLE natural resource?`,
    options: [
      "Petroleum",
      "Bauxite",
      "Limestone",
      "Solar energy",
    ],
    correctAnswer: 3,
    explanation: `Solar energy is renewable — it is constantly replenished by the sun and will not run out. Petroleum and bauxite are non-renewable (finite supplies).`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What is the SPANISH TOWN SQUARE notable for?`,
    options: [
      "Being the largest market in Jamaica",
      "Containing some of the finest Georgian architecture in the Western Hemisphere, reflecting Jamaica's colonial history",
      "Being the site of the Morant Bay Rebellion",
      "Being Jamaica's most modern shopping centre",
    ],
    correctAnswer: 1,
    explanation: `Spanish Town Square contains important colonial-era Georgian buildings including the Cathedral, Rodney Memorial, and old King's House — a major heritage site.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `The SARGASSO SEA is unusual because it is a sea:`,
    options: [
      "With no water",
      "Defined by ocean currents rather than land boundaries",
      "Covered entirely by coral reefs",
      "Known for constant storms",
    ],
    correctAnswer: 1,
    explanation: `The Sargasso Sea, in the North Atlantic near the Caribbean, is unique — it has no land borders and is defined by four surrounding ocean currents. It is known for floating Sargassum seaweed.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `The CONSTITUTION can ONLY be changed by:`,
    options: [
      "The Prime Minister alone",
      "A simple majority vote in Parliament",
      "A two-thirds majority in both houses of Parliament, and sometimes by referendum",
      "The Governor General's approval alone",
    ],
    correctAnswer: 2,
    explanation: `Changing Jamaica's Constitution requires a two-thirds majority in both the Senate and House of Representatives — and some changes require a referendum — making it difficult to alter the supreme law casually.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Rights",
    question: `The RIGHT TO PEACEFUL PROTEST means:`,
    options: [
      "Citizens can riot whenever they disagree with the government",
      "Citizens have the right to assemble peacefully and express dissent without fear of illegal arrest",
      "Violence is acceptable in protests",
      "The government can ban all protests",
    ],
    correctAnswer: 1,
    explanation: `The right to peaceful protest is protected — citizens can march, picket, and demonstrate to express grievances, provided they remain peaceful and within the law.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government",
    question: `The CABINET in Jamaica consists of:`,
    options: [
      "The Governor General and all judges",
      "The Prime Minister and senior ministers responsible for running government departments",
      "All Members of Parliament",
      "The Senate only",
    ],
    correctAnswer: 1,
    explanation: `The Cabinet is the executive decision-making body — the Prime Minister and appointed ministers who collectively run the government departments and implement policy.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Process",
    question: `CAMPAIGN FINANCING in elections refers to:`,
    options: [
      "The cost of printing election posters only",
      "The money raised and spent by political parties and candidates to run their election campaigns",
      "The government's election budget only",
      "Foreign donations to Jamaican parties",
    ],
    correctAnswer: 1,
    explanation: `Campaign financing covers all funds raised and spent during election campaigns — transparency in campaign finance is important to prevent corruption and undue influence.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `The CARIBBEAN COURT OF JUSTICE (CCJ) serves as:`,
    options: [
      "A sports court",
      "Jamaica's highest court",
      "An original jurisdiction court for CARICOM trade matters and an appellate court for Caribbean states that have adopted it",
      "A human rights tribunal only",
    ],
    correctAnswer: 2,
    explanation: `The CCJ has two functions: an original jurisdiction for CARICOM treaty matters and, for countries that have adopted it (e.g., Barbados), an appellate court replacing the Privy Council.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `What is a HUMAN RIGHTS VIOLATION?`,
    options: [
      "Breaking any law",
      "An action by a government or person that denies someone their fundamental rights and freedoms",
      "A minor disagreement between citizens",
      "A road traffic offence",
    ],
    correctAnswer: 1,
    explanation: `A human rights violation occurs when someone is denied their fundamental rights — torture, unlawful imprisonment, discrimination, and denial of education are examples.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `The NATIONAL VOLUNTEERS ACT in Jamaica provides the legal framework for:`,
    options: [
      "Paying volunteers",
      "Recognising, supporting, and promoting volunteering as a contribution to national development",
      "Requiring all citizens to volunteer",
      "Taxing volunteer organisations",
    ],
    correctAnswer: 1,
    explanation: `The National Volunteers Act formalises and promotes voluntary service as an important contribution to Jamaica's social and economic development.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `What does the phrase 'GOVERNMENT ACCOUNTABILITY' mean?`,
    options: [
      "The government can do whatever it wants",
      "The government must explain and justify its decisions to Parliament and the public",
      "Only the opposition can question the government",
      "Accountability applies only to financial matters",
    ],
    correctAnswer: 1,
    explanation: `Government accountability means elected and appointed officials must answer for their decisions and actions — to Parliament, the courts, and ultimately to the people who elected them.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `What is a STATUTE?`,
    options: [
      "A physical statue of a national hero",
      "A written law passed by Parliament",
      "A type of court decision",
      "An unwritten custom",
    ],
    correctAnswer: 1,
    explanation: `A statute is a formal written law enacted by Parliament — the primary source of law in Jamaica's legal system.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `The right against DOUBLE JEOPARDY means:`,
    options: [
      "Citizens can be tried for the same crime more than once",
      "A person cannot be tried twice for the same crime after being acquitted (found not guilty)",
      "Citizens face twice the penalties for serious crimes",
      "Judges can retry cases they disagree with",
    ],
    correctAnswer: 1,
    explanation: `Double jeopardy protection means once a person is found not guilty of a crime, they cannot be tried for that same crime again — protecting against government harassment through repeated prosecutions.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `TOURISM is classified as which type of economic activity?`,
    options: [
      "Primary",
      "Secondary",
      "Tertiary",
      "Quaternary",
    ],
    correctAnswer: 2,
    explanation: `Tourism is a tertiary (service) activity — it provides services (accommodation, tours, entertainment) rather than producing physical goods.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `What is the IMPORTANCE of the FISHING industry to Jamaica?`,
    options: [
      "It employs no one significantly",
      "It provides food security, employment for coastal communities, and contributes to export earnings",
      "It is only a recreational activity",
      "It has no economic significance",
    ],
    correctAnswer: 1,
    explanation: `Fishing is economically and nutritionally important — providing protein to Jamaicans, employment to coastal communities, and contributing to foreign exchange earnings through fish exports.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What is an EXPORT PROCESSING ZONE (EPZ)?`,
    options: [
      "A national park",
      "A designated area where companies can manufacture goods for export with tax advantages and reduced regulation",
      "A free market for locally made goods",
      "A harbour area only",
    ],
    correctAnswer: 1,
    explanation: `An EPZ (like the Kingston Free Zone) is a specially designated area where companies manufacture for export, benefiting from tax breaks and streamlined regulations to attract investment.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `What is the ROLE of the CONSUMERS AFFAIRS COMMISSION (CAC)?`,
    options: [
      "To manufacture consumer goods",
      "To protect consumers' rights — investigating complaints, ensuring fair trading, and providing consumer education",
      "To run shops and markets",
      "To collect market taxes",
    ],
    correctAnswer: 1,
    explanation: `The Consumers Affairs Commission protects buyers' rights — investigating complaints about faulty goods, misleading advertising, and unfair pricing, and educating consumers about their rights.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism",
    question: `What is a 'STOPOVER TOURIST'?`,
    options: [
      "A tourist who only stays at the airport",
      "A tourist who stays in Jamaica for at least one night, spending money on accommodation, food, and activities",
      "A day-tripper from a cruise ship",
      "A tourist who visits multiple countries",
    ],
    correctAnswer: 1,
    explanation: `A stopover tourist (also called a 'stay-over' tourist) remains in Jamaica for at least one night, spending significantly more than a day-tripper and contributing more to the local economy.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `What is the MEANING of 'BUDGET' in a household or government context?`,
    options: [
      "A type of expensive car",
      "A plan for how available income will be allocated — balancing income against planned spending",
      "A type of savings account",
      "A list of things to buy",
    ],
    correctAnswer: 1,
    explanation: `A budget is a financial plan — listing expected income and planned expenditure, helping to ensure that spending does not exceed income.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `What is SOCIAL ENTREPRENEURSHIP?`,
    options: [
      "A business that only makes profit",
      "Starting a business in a social media app",
      "A business model that seeks to generate profit while also addressing a social problem or community need",
      "A type of government charity",
    ],
    correctAnswer: 2,
    explanation: `Social entrepreneurs run businesses designed to create both social impact and financial sustainability — for example, a company that employs people with disabilities or provides affordable solar energy to rural communities.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Interdependence",
    question: `What is BILATERAL TRADE?`,
    options: [
      "Trade within a single country",
      "Trade involving only one product",
      "Trade between two countries — each buying from and selling to the other",
      "Trade between three or more countries",
    ],
    correctAnswer: 2,
    explanation: `Bilateral trade is trade between two specific countries — Jamaica and the USA, for example, engage in bilateral trade when each buys and sells goods to the other.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `Jamaica's BEACHES are considered a natural resource because:`,
    options: [
      "Beaches are only sand — not resources",
      "They support tourism (a major industry), fishing, and recreation — contributing significantly to the economy and quality of life",
      "Beaches are owned by the government only",
      "Beaches have no economic value",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's beaches are economically vital natural resources — they attract tourists, support fishing communities, and provide recreational spaces essential to the island's cultural identity.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `What does CORPORATE SOCIAL RESPONSIBILITY (CSR) mean?`,
    options: [
      "A company's responsibility to its shareholders only",
      "A company's duty to profit regardless of social impact",
      "The expectation that businesses will contribute positively to society — beyond just making profit — through ethical practices and community investment",
      "A tax that businesses pay",
    ],
    correctAnswer: 2,
    explanation: `CSR means businesses recognise their social obligations — to employees, communities, and the environment — and invest in these areas beyond their legal minimum requirements.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy9Questions : g5SsEasy9Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 9",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 9</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 9</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 9</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
