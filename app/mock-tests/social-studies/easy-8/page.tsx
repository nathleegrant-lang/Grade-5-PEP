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

const g5SsEasy8Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Colonial History",
    question: `When did Christopher Columbus first arrive in Jamaica?`,
    options: [
      "1492",
      "1494",
      "1655",
      "1838",
    ],
    correctAnswer: 1,
    explanation: `Columbus arrived in Jamaica on his second voyage in 1494, landing at what is now called Discovery Bay in St. Ann.`
  },
  {
    id: 2,
    type: "history",
    skill: "National Heroes",
    question: `Which National Hero is associated with the motto 'One God, One Aim, One Destiny'?`,
    options: [
      "Norman Manley",
      "Paul Bogle",
      "Marcus Garvey",
      "Sam Sharpe",
    ],
    correctAnswer: 2,
    explanation: `Marcus Garvey's UNIA adopted the motto 'One God, One Aim, One Destiny,' reflecting his vision of unified Pan-African identity and purpose.`
  },
  {
    id: 3,
    type: "history",
    skill: "Cultural Heritage",
    question: `Which pair correctly matches Jamaica's national tree and national flower?`,
    options: [
      "National tree — Lignum Vitae; national flower — Blue Mahoe",
      "National tree — Blue Mahoe; national flower — Lignum Vitae",
      "National tree — Bamboo; national flower — Hibiscus",
      "National tree — Royal Palm; national flower — Bougainvillea",
    ],
    correctAnswer: 1,
    explanation: `The Blue Mahoe is Jamaica's national tree, while the Lignum Vitae is Jamaica's national flower.`
  },
  {
    id: 4,
    type: "history",
    skill: "First Peoples",
    question: `The Taino built their homes from:`,
    options: [
      "Stone and concrete",
      "Timber (wood) and palm leaves — known as bohios",
      "Mud bricks",
      "Bamboo and steel",
    ],
    correctAnswer: 1,
    explanation: `Taino homes (bohios) were built from wood frames and thatched with palm leaves — circular structures suited to the tropical climate.`
  },
  {
    id: 5,
    type: "history",
    skill: "National Heroes",
    question: `Norman Manley is remembered for campaigning for:`,
    options: [
      "Universal Adult Suffrage in 1938 and Jamaican self-government",
      "The Maroon peace treaties",
      "The Morant Bay Rebellion",
      "The slave trade",
    ],
    correctAnswer: 0,
    explanation: `Norman Manley co-led the campaign for Universal Adult Suffrage (achieved in 1944) and was a key figure in the movement toward Jamaican self-government and independence.`
  },
  {
    id: 6,
    type: "history",
    skill: "Colonial History",
    question: `Why did the British bring workers from India after emancipation?`,
    options: [
      "For political reasons",
      "To replace the labour of formerly enslaved people on the plantations",
      "To build the railway",
      "To teach on the island",
    ],
    correctAnswer: 1,
    explanation: `After emancipation in 1838, many formerly enslaved people left the plantations. The British brought indentured labourers, especially from India, to work the sugar plantations.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `What is 'Jamaican jerk' cooking?`,
    options: [
      "A cooking style using spices imported from Africa",
      "A traditional Jamaican method of seasoning and slow-cooking meat using scotch bonnet peppers and allspice — traced to Maroon traditions",
      "A cooking technique brought by East Indian indentured labourers",
      "A style of cooking introduced by the British",
    ],
    correctAnswer: 1,
    explanation: `Jerk cooking is a Jamaican tradition traced to the Maroons, who developed a method of seasoning and smoking meat (especially pork and chicken) with pimento (allspice) and scotch bonnet peppers.`
  },
  {
    id: 8,
    type: "history",
    skill: "Independence",
    question: `What was the FEDERATION OF THE WEST INDIES?`,
    options: [
      "A CARICOM predecessor — a political union of British Caribbean territories that Jamaica joined and then left in 1961",
      "A military alliance",
      "A trade organisation",
      "A sports federation",
    ],
    correctAnswer: 0,
    explanation: `The Federation of the West Indies (1958–1962) was a political union of British Caribbean territories. Jamaica voted to leave in 1961 and subsequently gained independence in 1962.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Heritage",
    question: `Jamaica's national fruit is the:`,
    options: [
      "Mango",
      "Pineapple",
      "Banana",
      "Ackee",
    ],
    correctAnswer: 3,
    explanation: `The ackee (originally from West Africa) is Jamaica's national fruit, forming half of the national dish — ackee and saltfish.`
  },
  {
    id: 10,
    type: "history",
    skill: "Jamaican History",
    question: `Which uprising led by Sam Sharpe took place in Jamaica in 1831?`,
    options: [
      "The Morant Bay Rebellion",
      "The Baptist War, also called the Christmas Rebellion",
      "The First Maroon War",
      "The Labour Rebellion of 1938",
    ],
    correctAnswer: 1,
    explanation: `Sam Sharpe helped organise the 1831 uprising commonly called the Baptist War or Christmas Rebellion, an important event in Jamaica's history before emancipation.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `Why are mountain forests and watersheds in the Blue Mountains important to Jamaica's water supply?`,
    options: [
      "They stop all hurricanes from reaching Jamaica.",
      "They receive rainfall and feed many important rivers, streams, and water supplies.",
      "They contain most of Jamaica's bauxite.",
      "They prevent water from flowing downhill.",
    ],
    correctAnswer: 1,
    explanation: `The Blue Mountains receive substantial rainfall. Their forests and watersheds help collect and release water that feeds many rivers, streams, and supplies used by communities.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `Which parish in Jamaica is home to the famous YS Falls?`,
    options: [
      "St. Ann",
      "Manchester",
      "St. Elizabeth",
      "Westmoreland",
    ],
    correctAnswer: 2,
    explanation: `YS Falls is a spectacular waterfall located on the YS Estate in St. Elizabeth parish, on Jamaica's south coast.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Maps",
    question: `What does the GRID REFERENCE system on a map allow you to do?`,
    options: [
      "Measure temperature",
      "Identify the exact location of a place using letters and numbers",
      "Find the capital city",
      "Understand the map legend",
    ],
    correctAnswer: 1,
    explanation: `A grid reference system uses letters (columns) and numbers (rows) to create a unique reference for any location on the map — helping pinpoint places precisely.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environment",
    question: `What is REFORESTATION?`,
    options: [
      "Cutting down trees",
      "Planting trees where forests have been cleared",
      "Mining in forest areas",
      "Using forests for agriculture",
    ],
    correctAnswer: 1,
    explanation: `Reforestation involves planting trees to restore forests that have been cleared — helping reduce erosion, restore watersheds, and sequester carbon.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Physical Features",
    question: `The PALISADOES, a thin strip of land near Kingston, is known as a:`,
    options: [
      "Mountain ridge",
      "Tombolo or sand spit that encloses Kingston Harbour",
      "River delta",
      "Limestone plateau",
    ],
    correctAnswer: 1,
    explanation: `The Palisadoes is a tombolo (sand spit) that separates Kingston Harbour from the open sea and connects Port Royal to the mainland.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Parishes",
    question: `Which Jamaican parish shares its name with Jamaica's capital city?`,
    options: [
      "St. Andrew",
      "Kingston",
      "St. Catherine",
      "Manchester",
    ],
    correctAnswer: 1,
    explanation: `Kingston is both the capital city and a parish — although it is actually part of the Kingston Corporate Area (KCA), sharing administrative functions with St. Andrew.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate",
    question: `What is the DIFFERENCE between WEATHER and CLIMATE?`,
    options: [
      "There is no difference",
      "Weather is the long-term pattern; climate is the daily conditions",
      "Weather is the daily atmospheric conditions; climate is the long-term average",
      "Climate only refers to temperature; weather includes all conditions",
    ],
    correctAnswer: 2,
    explanation: `Weather is the short-term state of the atmosphere on a given day (today's rain). Climate is the long-term average of weather conditions over 30 years or more.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Resources",
    question: `What are Jamaica's MARINE RESOURCES?`,
    options: [
      "Forests and farmland",
      "Fish, coral reefs, and other living and non-living resources of the sea",
      "Bauxite and limestone",
      "Rivers and waterfalls",
    ],
    correctAnswer: 1,
    explanation: `Marine resources include the living resources of the sea (fish, shellfish, coral) and non-living resources (minerals, sand) — all economically and ecologically important.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What is a WATERSHED?`,
    options: [
      "An area of land prone to flooding",
      "The area of land draining into a particular river, lake, or sea",
      "A type of reservoir",
      "A place where two rivers meet",
    ],
    correctAnswer: 1,
    explanation: `A watershed (or catchment area) is the entire area of land from which water drains into a particular river or body of water — protecting watersheds protects water supply.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `Which large body of water lies to the SOUTH of Jamaica?`,
    options: [
      "The Atlantic Ocean",
      "The Gulf of Mexico",
      "The Caribbean Sea",
      "The Pacific Ocean",
    ],
    correctAnswer: 2,
    explanation: `The Caribbean Sea lies to the south of Jamaica. The North Atlantic Ocean lies to the north.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `The CHARTER OF FUNDAMENTAL RIGHTS AND FREEDOMS was added to Jamaica's Constitution in:`,
    options: [
      "1962",
      "1975",
      "1999",
      "2011",
    ],
    correctAnswer: 3,
    explanation: `The Charter of Fundamental Rights and Freedoms was incorporated into Jamaica's Constitution in 2011, replacing and strengthening the earlier Bill of Rights.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Government",
    question: `Which level of government has national responsibility for education policy and Jamaica's public education system?`,
    options: [
      "A neighbourhood watch group",
      "The national government through the ministry responsible for education",
      "CARICOM",
      "A private tourism company",
    ],
    correctAnswer: 1,
    explanation: `Education policy and oversight of Jamaica's public education system are national-government responsibilities carried out through the government ministry responsible for education.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Parliament",
    question: `What happens during a DEBATE in Parliament?`,
    options: [
      "MPs vote in secret",
      "Members of Parliament discuss and argue for or against proposed legislation before a vote",
      "Only the Prime Minister speaks",
      "Debates are held in private",
    ],
    correctAnswer: 1,
    explanation: `Parliamentary debate is a formal discussion where MPs present arguments for or against proposed laws, challenge government policy, and represent their constituents' views.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Process",
    question: `What is the role of a RETURNING OFFICER in a Jamaican election?`,
    options: [
      "To count votes for all constituencies",
      "To officially manage the election in one constituency and declare the result",
      "To campaign for political parties",
      "To register voters nationwide",
    ],
    correctAnswer: 1,
    explanation: `A Returning Officer manages the conduct of elections in a specific constituency — overseeing the process, counting votes, and officially declaring the winner.`
  },
  {
    id: 25,
    type: "civics",
    skill: "CARICOM",
    question: `Which of the following is the HIGHEST decision-making body in CARICOM?`,
    options: [
      "The CARICOM Secretariat",
      "The Council for Finance and Planning",
      "The Conference of Heads of Government",
      "The Caribbean Court of Justice",
    ],
    correctAnswer: 2,
    explanation: `The Conference of Heads of Government is CARICOM's supreme decision-making body — it sets the direction for the organisation and its major policies.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rights",
    question: `What does SOCIAL JUSTICE mean?`,
    options: [
      "Everyone having the same amount of money",
      "A fair distribution of opportunities, rights, and resources in society so everyone can live with dignity",
      "A system where only the strongest succeed",
      "A type of government programme",
    ],
    correctAnswer: 1,
    explanation: `Social justice is the principle that everyone deserves equal rights, opportunities, and basic security — regardless of their background, race, gender, or economic status.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Community",
    question: `Why is VOLUNTEERING important in a community?`,
    options: [
      "It is not important",
      "Volunteers get paid for their work",
      "Volunteering builds community cohesion, helps those in need, and allows citizens to contribute beyond their professional roles",
      "It is only for school children",
    ],
    correctAnswer: 2,
    explanation: `Volunteering strengthens communities by providing services, building relationships, and encouraging civic participation — reflecting the principle that citizens have responsibilities beyond just obeying laws.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government",
    question: `The JAMAICA CONSTABULARY FORCE (JCF) is part of which branch of government?`,
    options: [
      "Legislative",
      "Judicial",
      "Executive",
      "Independent of government",
    ],
    correctAnswer: 2,
    explanation: `The police force falls under the Executive branch — specifically under the Ministry of National Security, responsible for law enforcement and maintaining order.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `What is JUDICIAL INDEPENDENCE?`,
    options: [
      "Judges can make any decision they like with no accountability",
      "The principle that judges must be free from political pressure and interference when making legal decisions",
      "Judges are elected by the public",
      "Courts report directly to the Prime Minister",
    ],
    correctAnswer: 1,
    explanation: `Judicial independence means courts and judges are free from political influence — they interpret the law impartially, protecting citizens' rights even from government overreach.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights",
    question: `Which education entitlement is specifically protected by Jamaica's Charter of Fundamental Rights and Freedoms?`,
    options: [
      "Free university education for every person",
      "Tuition at publicly funded pre-primary and primary schools without charge",
      "Free private secondary-school tuition for every child",
      "Free overseas study for every Jamaican student",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's Charter of Fundamental Rights and Freedoms protects the right of every child who is a citizen to publicly funded tuition at the pre-primary and primary levels.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Production",
    question: `What is PRODUCTIVITY?`,
    options: [
      "The number of workers in a factory",
      "The efficiency of production — how much output is produced per unit of input (e.g., output per worker per hour)",
      "The cost of running a business",
      "A type of agricultural practice",
    ],
    correctAnswer: 1,
    explanation: `Productivity measures how efficiently inputs (labour, capital) are converted into outputs — high productivity means more is produced with the same resources.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Training and Employment",
    question: `Which national organisation provides technical and vocational education and training for Jamaicans?`,
    options: [
      "Jamaica Tourist Board",
      "HEART/NSTA Trust",
      "Jamaica Constabulary Force",
      "National Water Commission",
    ],
    correctAnswer: 1,
    explanation: `HEART/NSTA Trust provides technical and vocational education and training that helps Jamaicans develop skills for employment and entrepreneurship.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `What is a BALANCE OF TRADE?`,
    options: [
      "The physical balance scales used in markets",
      "The difference between the value of a country's exports and imports",
      "The total amount of money in a country",
      "The number of trading partners a country has",
    ],
    correctAnswer: 1,
    explanation: `The balance of trade is the difference between export earnings and import spending. A surplus means more is exported; a deficit means more is imported.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `What is the PURPOSE of the NATIONAL INSURANCE SCHEME (NIS) in Jamaica?`,
    options: [
      "To provide free goods to all citizens",
      "To provide social security benefits (pensions, sickness benefits) to workers upon retirement or incapacity",
      "To run the police force",
      "To fund road construction",
    ],
    correctAnswer: 1,
    explanation: `The NIS is Jamaica's social security programme — workers and employers contribute, and in return receive benefits upon retirement, illness, or maternity.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism",
    question: `What is SUSTAINABLE TOURISM?`,
    options: [
      "Tourism with no rules or limits",
      "Tourism that maximises profit regardless of environmental impact",
      "Tourism that meets visitors' needs while protecting the environment, supporting local communities, and preserving cultural heritage for the future",
      "Tourism only in cities",
    ],
    correctAnswer: 2,
    explanation: `Sustainable tourism balances economic benefit with environmental protection and cultural preservation — ensuring tourism doesn't destroy the very things that attract visitors.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Money",
    question: `What is the BANK OF JAMAICA (BOJ)?`,
    options: [
      "A private commercial bank",
      "Jamaica's central bank, responsible for monetary policy, issuing currency, and regulating the banking sector",
      "A savings bank for farmers only",
      "A government ministry",
    ],
    correctAnswer: 1,
    explanation: `The Bank of Jamaica (BOJ) is the central bank — it issues Jamaican dollars, sets monetary policy, manages foreign reserves, and supervises the financial sector.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A MICRO ENTERPRISE is:`,
    options: [
      "A very large corporation",
      "A very small business — typically with fewer than 10 employees and low turnover — often owner-operated",
      "A type of government subsidy",
      "A franchise operation",
    ],
    correctAnswer: 1,
    explanation: `Micro enterprises are the smallest businesses — often home-based or with a handful of employees. They are a vital part of Jamaica's informal economy.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Interdependence",
    question: `REMITTANCES sent by the Jamaican Diaspora are important because:`,
    options: [
      "They replace all other forms of income",
      "They provide a significant source of income for Jamaican families and contribute to GDP — one of Jamaica's largest sources of foreign exchange",
      "They are only received by rich families",
      "They reduce the need for local employment",
    ],
    correctAnswer: 1,
    explanation: `Remittances (money sent home by Jamaicans living abroad) are one of Jamaica's largest sources of foreign exchange — supporting families and the broader economy.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Natural Resources",
    question: `What is RENEWABLE ENERGY?`,
    options: [
      "Energy from burning coal",
      "Energy from oil and gas",
      "Energy from natural sources that are constantly replenished — like solar, wind, and hydropower",
      "Energy generated by nuclear plants only",
    ],
    correctAnswer: 2,
    explanation: `Renewable energy comes from naturally replenishing sources — solar, wind, hydro, and geothermal. Jamaica is investing in renewables to reduce dependence on imported oil.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `A CREDIT UNION differs from a commercial bank in that:`,
    options: [
      "It offers higher interest rates on loans",
      "It is owned and governed by its members — operating for their mutual benefit rather than for shareholders' profit",
      "It only lends to businesses",
      "It is run by the government",
    ],
    correctAnswer: 1,
    explanation: `Credit unions are member-owned cooperatives — profits return to members as dividends or lower interest rates, rather than going to external shareholders.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsEasy8Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsEasy8Questions)
      : prepareSocialStudiesPreview(g5SsEasy8Questions, FREE_QUESTION_LIMIT)
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
        testName: "Easy 8",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 8</CardTitle>
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
              <p className="text-slate-600">Social Studies Easy 8</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Easy 8</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
