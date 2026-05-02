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

const g5SsMix1Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Recall",
    question: `Which of Jamaica's seven National Heroes was a trade union leader AND the country's first Prime Minister?`,
    options: [
      "Norman Manley",
      "Paul Bogle",
      "Alexander Bustamante",
      "Marcus Garvey",
    ],
    correctAnswer: 2,
    explanation: `Sir Alexander Bustamante founded the BITU trade union, the JLP political party, and served as Jamaica's first Prime Minister after independence in 1962.`
  },
  {
    id: 2,
    type: "history",
    skill: "Recall",
    question: `What year did Jamaica gain independence?`,
    options: [
      "1938",
      "1944",
      "1962",
      "1974",
    ],
    correctAnswer: 2,
    explanation: `Jamaica gained independence from Britain on August 6, 1962.`
  },
  {
    id: 3,
    type: "history",
    skill: "Cause & Effect",
    question: `WHY did Paul Bogle march to Morant Bay courthouse in 1865?`,
    options: [
      "To celebrate a harvest festival",
      "To meet the British governor",
      "To protest poverty, unjust courts, and colonial indifference to the suffering of poor Jamaicans",
      "To pay taxes",
    ],
    correctAnswer: 2,
    explanation: `The Morant Bay Rebellion grew from the desperate conditions of rural Jamaicans — unfair courts, poverty, and a colonial government that ignored their grievances.`
  },
  {
    id: 4,
    type: "history",
    skill: "Analysis",
    question: `What does the Jamaican national motto 'Out of Many, One People' reflect?`,
    options: [
      "Jamaica has only one ethnic group",
      "Jamaica has many languages",
      "Jamaica's history of diverse peoples — African, European, East Indian, Chinese, and Taino — united as one nation",
      "Jamaica has many political parties",
    ],
    correctAnswer: 2,
    explanation: `The motto celebrates Jamaica's multicultural heritage, uniting people of diverse origins under a single national identity.`
  },
  {
    id: 5,
    type: "history",
    skill: "Cause & Effect",
    question: `How did the Baptist War of 1831 lead to emancipation?`,
    options: [
      "It caused Britain to increase slavery",
      "It had no effect",
      "The scale and violence of the rebellion shocked the British Parliament and strengthened the abolitionist cause, leading to emancipation within three years",
      "It ended slavery immediately on Christmas Day",
    ],
    correctAnswer: 2,
    explanation: `The Christmas Rebellion of 1831, the largest slave uprising in Jamaican history, accelerated the British Parliament's move to pass the Slavery Abolition Act in 1833.`
  },
  {
    id: 6,
    type: "history",
    skill: "Significance",
    question: `Why is August 1, 1838 considered MORE significant than August 1, 1834?`,
    options: [
      "There is no difference",
      "1834 was more important",
      "In 1834, slavery technically ended but an Apprenticeship system forced the formerly enslaved to continue working unpaid. August 1, 1838 ended Apprenticeship — giving genuine freedom",
      "The date is symbolic only",
    ],
    correctAnswer: 2,
    explanation: `The Apprenticeship system was slavery by another name. Full, unqualified freedom only came on August 1, 1838, making it the true date of emancipation.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Analysis",
    question: `How does reggae music connect to Jamaica's long history of resistance?`,
    options: [
      "Reggae has no social message",
      "Reggae began in Britain",
      "Reggae evolved from Jamaica's tradition of using music as protest and spiritual expression — from work songs under slavery through ska and rocksteady to Bob Marley's global message of justice",
      "Reggae is only about love songs",
    ],
    correctAnswer: 2,
    explanation: `Jamaican music has always carried social commentary — from enslaved people's work songs to the conscious lyrics of reggae. It is a continuous tradition of using art as resistance.`
  },
  {
    id: 8,
    type: "history",
    skill: "Recall",
    question: `What does 'Xaymaca' — the Taino name for Jamaica — mean?`,
    options: [
      "Land of Many Rivers",
      "Land of Wood and Water",
      "Island of the Sun",
      "Land of Beautiful People",
    ],
    correctAnswer: 1,
    explanation: `The Taino called the island 'Xaymaca,' meaning 'Land of Wood and Water,' reflecting its lush forests and many rivers.`
  },
  {
    id: 9,
    type: "history",
    skill: "Evaluating Sources",
    question: `A colonial newspaper from 1865 describes Paul Bogle as a 'dangerous agitator.' Why should a student treat this with caution?`,
    options: [
      "Newspapers always tell the truth",
      "Colonial newspapers were always accurate",
      "This description reflects the perspective of those whose authority Bogle was challenging — colonial sources are likely to be biased against those who resisted the system",
      "Paul Bogle was actually dangerous",
    ],
    correctAnswer: 1,
    explanation: `Primary sources must be evaluated for bias. A colonial newspaper represented colonial interests — it would naturally portray those who challenged colonial authority negatively.`
  },
  {
    id: 10,
    type: "history",
    skill: "Synthesis",
    question: `What do ALL SEVEN Jamaican National Heroes share in common?`,
    options: [
      "They were all from Kingston",
      "They all lived in the 20th century",
      "They all made extraordinary sacrifices to advance the rights, dignity, and freedom of Jamaican people",
      "They all led armed rebellions",
    ],
    correctAnswer: 2,
    explanation: `Despite different backgrounds, eras, and methods, all seven National Heroes made exceptional sacrifices in pursuit of justice and self-determination for the Jamaican people.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Recall",
    question: `What is the name of Jamaica's highest mountain?`,
    options: [
      "John Crow Peak",
      "Blue Mountain Peak",
      "Santa Cruz Peak",
      "Dry Harbour Peak",
    ],
    correctAnswer: 1,
    explanation: `Blue Mountain Peak, at approximately 2,256 metres above sea level, is Jamaica's highest point.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Recall",
    question: `How many parishes does Jamaica have?`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is divided into 14 parishes across three counties: Cornwall, Middlesex, and Surrey.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Map Skills",
    question: `A map has a scale of 1:100,000. Two towns are 5 cm apart on the map. The actual distance between them is:`,
    options: [
      "5 km",
      "500 m",
      "10 km",
      "50 km",
    ],
    correctAnswer: 0,
    explanation: `1:100,000 means 1 cm = 100,000 cm = 1 km. So 5 cm = 5 km.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Cause & Effect",
    question: `Why does the NORTH COAST of Jamaica receive more rainfall than the south coast?`,
    options: [
      "The north coast is higher in elevation",
      "The north coast is farther from Kingston",
      "Moisture-bearing northeast trade winds rise over the mountains and release rain on the windward north side — the south is in a rain shadow",
      "The north coast has more rivers",
    ],
    correctAnswer: 2,
    explanation: `The Blue Mountains intercept trade winds. As moist air rises and cools, it rains on the north (windward) side. The south (leeward) side is drier — a classic rain shadow.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Environmental Reasoning",
    question: `A community deforests a hillside to grow crops. What is the MOST LIKELY immediate consequence?`,
    options: [
      "Better crop yields for decades",
      "More rainfall in the area",
      "Soil erosion — rain washes exposed topsoil downhill, reducing soil quality and increasing flooding downstream",
      "The land becomes more fertile",
    ],
    correctAnswer: 2,
    explanation: `Forests protect soil. Without tree roots and canopy, rainfall washes topsoil away — a rapid and damaging consequence of hillside deforestation.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Spatial Analysis",
    question: `Why are most of Jamaica's large towns and cities located on the coast or in valleys?`,
    options: [
      "The interior is too cold",
      "The government chose these locations",
      "Coastal and valley areas offer flat land, access to water, and historically provided harbour access for trade — natural advantages that favoured settlement",
      "Mountains are more interesting to live in",
    ],
    correctAnswer: 2,
    explanation: `Settlement follows geographic logic: flat land for building, rivers for water, and harbours for trade. Jamaica's urban centres reflect centuries of geographic decision-making.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Caribbean",
    question: `Which of the following is NOT part of the Greater Antilles?`,
    options: [
      "Cuba",
      "Barbados",
      "Jamaica",
      "Puerto Rico",
    ],
    correctAnswer: 1,
    explanation: `Barbados is part of the Lesser Antilles. The Greater Antilles consists of the four large islands: Cuba, Hispaniola, Jamaica, and Puerto Rico.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Environmental Analysis",
    question: `How does DEFORESTATION of Jamaica's watersheds threaten Kingston's water supply?`,
    options: [
      "Deforestation has no effect on cities",
      "Kingston gets water from desalination only",
      "Blue Mountain forests generate and filter the rivers that supply Kingston — removing forests reduces water quality and quantity, directly threatening the city's water supply",
      "Only mining affects water supply",
    ],
    correctAnswer: 2,
    explanation: `Watershed interdependence: urban water depends on rural forest health. Deforesting the mountains that generate Kingston's rivers is deforesting Kingston's water supply.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Sustainability",
    question: `A fishing community uses large-scale nets to catch 60% more fish than last year. Why is this a concern for the LONG TERM?`,
    options: [
      "More fish is always better",
      "Fish populations are unlimited",
      "Overfishing depletes populations faster than they can reproduce — this year's bonus becomes next year's collapse. Sustainable fishing limits catches to what the population can naturally replenish",
      "The government should give the community larger nets",
    ],
    correctAnswer: 2,
    explanation: `Overfishing is a classic sustainability problem. Short-term gain through over-extraction destroys the resource base. Sustainable yields are those that can be maintained indefinitely.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Policy Analysis",
    question: `Jamaica designates a forest area as a National Park. Local farmers must move. What is the MOST complete evaluation of this policy?`,
    options: [
      "Farmers are always wrong",
      "National Parks never help anyone",
      "The policy protects vital biodiversity and water resources (long-term public benefit) but causes real hardship for the displaced farmers. Best practice includes community consultation, co-management, and alternative livelihood support — conservation and human welfare need not be opposed",
      "Environmental protection always outweighs community needs",
    ],
    correctAnswer: 2,
    explanation: `Effective conservation policy integrates community welfare with environmental goals — displacing communities without alternatives creates both injustice and often undermines conservation.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Recall",
    question: `Who is the HEAD OF GOVERNMENT in Jamaica?`,
    options: [
      "The Governor General",
      "The President",
      "The Prime Minister",
      "The Chief Justice",
    ],
    correctAnswer: 2,
    explanation: `The Prime Minister leads the government, heads the Cabinet, and is accountable to Parliament.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Recall",
    question: `At what age can Jamaican citizens vote?`,
    options: [
      "16",
      "18",
      "21",
      "25",
    ],
    correctAnswer: 1,
    explanation: `Jamaican citizens can vote from age 18, provided they are registered on the electoral roll.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Application",
    question: `A street in your community floods every time it rains. Which level of government should you contact?`,
    options: [
      "The Governor General",
      "The Prime Minister",
      "Your Parish Council — responsible for local drainage and roads",
      "The Supreme Court",
    ],
    correctAnswer: 2,
    explanation: `Parish Councils manage local infrastructure including roads, drains, and markets. Local problems go to local government.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Applying Rights",
    question: `A citizen is arrested and held in police custody for 5 days without charge. Which right has been violated?`,
    options: [
      "The right to work",
      "The right to vote",
      "The right to liberty — citizens cannot be detained indefinitely without being charged and brought before a court",
      "The right to education",
    ],
    correctAnswer: 2,
    explanation: `The right to personal liberty protects against arbitrary detention. Citizens must be charged and brought before a court within a reasonable time — habeas corpus is the legal protection.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Government Function",
    question: `Why is the SEPARATION OF POWERS among the Legislature, Executive, and Judiciary important?`,
    options: [
      "It makes government faster",
      "It creates more jobs",
      "It prevents any single branch from becoming too powerful — each checks and balances the others, protecting citizens from abuse of authority",
      "It is a tradition with no practical purpose",
    ],
    correctAnswer: 2,
    explanation: `Separation of powers is democracy's internal safeguard. The Legislature makes laws, the Executive implements them, the Judiciary interprets them — no branch can dominate the others.`
  },
  {
    id: 26,
    type: "civics",
    skill: "CARICOM",
    question: `How does CARICOM membership BENEFIT Jamaican skilled graduates?`,
    options: [
      "They get free university education",
      "No benefit — CARICOM is only for trade",
      "Under the CARICOM Single Market, graduates in designated occupations can work in other member states without work permits — accessing a larger regional job market",
      "They automatically get foreign citizenship",
    ],
    correctAnswer: 2,
    explanation: `The CSME allows free movement of skilled persons — a Jamaican engineer, nurse, or teacher can work in Barbados, Trinidad, or Guyana without complex immigration procedures.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Rights Analysis",
    question: `A newspaper publishes false information that damages a citizen's reputation. Which rights are in conflict?`,
    options: [
      "Right to vote vs right to work",
      "Right to education vs right to health",
      "Freedom of the press vs the individual's right not to be harmed by deliberate falsehoods",
      "Right to property vs right to liberty",
    ],
    correctAnswer: 2,
    explanation: `Freedom of expression is not unlimited. Publishing deliberate falsehoods that harm others is defamation — the individual's right to reputation places a legal limit on press freedom.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Constitutional Analysis",
    question: `A government passes a law removing citizens' right to vote in elections. What should happen?`,
    options: [
      "Citizens must accept it",
      "The Governor General signs it immediately",
      "The Supreme Court can strike it down as unconstitutional — fundamental rights cannot be removed by Parliament without breaching the Constitution",
      "Nothing — Parliament is supreme",
    ],
    correctAnswer: 2,
    explanation: `Constitutional supremacy: the right to vote is a fundamental right protected by the Constitution. The Supreme Court's power of judicial review allows it to invalidate laws that violate constitutional rights — even acts of Parliament.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Evaluating Democracy",
    question: `A country holds elections every five years, but opposition parties are regularly harassed and there is no independent judiciary. Is this a genuine democracy?`,
    options: [
      "Yes — elections are what matter",
      "Elections are irrelevant",
      "No — genuine democracy requires free elections AND an independent judiciary, free press, opposition rights, and constitutional protections of fundamental rights",
      "Only Western countries have genuine democracy",
    ],
    correctAnswer: 2,
    explanation: `Democracy is an ecosystem, not just elections. Without judicial independence, press freedom, and opposition rights, elections may be held regularly while power remains unaccountable.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Civic Responsibility",
    question: `A student wants to make her community safer. Which action BEST demonstrates active citizenship?`,
    options: [
      "Waiting for the government to solve all problems",
      "Complaining privately to friends",
      "Organising a community meeting, identifying safety issues, partnering with the Parish Council, and leading a neighbourhood watch initiative",
      "Only voting in elections",
    ],
    correctAnswer: 2,
    explanation: `Active citizenship goes beyond voting — it involves identifying problems, organising collective responses, engaging with institutions, and taking initiative to improve community conditions.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Recall",
    question: `What does GDP measure?`,
    options: [
      "The total population of a country",
      "The total value of imports",
      "The total value of all goods and services produced in a country in a year",
      "The national debt",
    ],
    correctAnswer: 2,
    explanation: `GDP (Gross Domestic Product) is the standard measure of a country's economic output — the monetary value of all production within its borders in a year.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Recall",
    question: `When a country EXPORTS goods, it:`,
    options: [
      "Buys goods from other countries",
      "Borrows money from other nations",
      "Sells goods to other countries",
      "Receives foreign aid",
    ],
    correctAnswer: 2,
    explanation: `Exporting means selling goods produced domestically to buyers in other countries — the opposite of importing.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Application",
    question: `A Jamaican farmer can plant sugar cane OR vegetables on the same land. The income he gives up by choosing vegetables is called:`,
    options: [
      "His profit",
      "His savings",
      "His opportunity cost",
      "His tax obligation",
    ],
    correctAnswer: 2,
    explanation: `Opportunity cost is the value of the next-best alternative forgone. By choosing vegetables, the farmer gives up the income he could have earned from sugar cane.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Cause & Effect",
    question: `When the price of mango RISES significantly in August, farmers will MOST LIKELY:`,
    options: [
      "Grow fewer mangoes next season",
      "Immediately stop growing mangoes",
      "Plant more mango trees — higher prices signal greater profitability and incentivise increased production",
      "Buy more mangoes from other farmers",
    ],
    correctAnswer: 1,
    explanation: `Higher prices signal profit opportunity. Rational farmers respond by increasing production of the more profitable crop — basic supply and demand.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Tourism Analysis",
    question: `A hotel in Jamaica earns $2 million but much of this money leaves the country. What is this economic concept called?`,
    options: [
      "Trade surplus",
      "Inflation",
      "Economic leakage — when tourism revenue leaves through foreign ownership, imported goods, and repatriated profits",
      "Remittances",
    ],
    correctAnswer: 2,
    explanation: `Tourism leakage is a critical concept: gross revenue overstates net benefit. Foreign-owned hotels, imported food, and foreign staff mean a large proportion of tourism earnings never circulates in the Jamaican economy.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Community Services",
    question: `Which organisation in Jamaica is responsible for managing the country's monetary policy and regulating banks?`,
    options: [
      "The Ministry of Finance",
      "The NWC",
      "The Bank of Jamaica",
      "The JCF",
    ],
    correctAnswer: 2,
    explanation: `The Bank of Jamaica (BOJ) is the central bank — it sets monetary policy, issues currency, manages foreign reserves, and supervises the financial sector.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Trade Analysis",
    question: `Jamaica has a persistent TRADE DEFICIT. What does this mean?`,
    options: [
      "Jamaica exports more than it imports",
      "Jamaica's economy is growing strongly",
      "Jamaica imports more goods and services than it exports — spending more foreign exchange than it earns from sales abroad",
      "Jamaica has no international trade",
    ],
    correctAnswer: 2,
    explanation: `A trade deficit occurs when import spending exceeds export earnings. Jamaica must use foreign reserves or borrow to finance the gap — creating downward pressure on the currency.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Development Reasoning",
    question: `The government must choose: build a resort road OR repair rural primary schools. Which framework BEST guides this decision?`,
    options: [
      "Always choose tourism first",
      "Always choose education first",
      "Systematic cost-benefit analysis: the school repairs benefit thousands of children with long-term human capital returns; the road serves private investors. Equity, long-term returns, and community need should weigh alongside immediate economic return",
      "Flip a coin",
    ],
    correctAnswer: 2,
    explanation: `Public investment decisions require multi-dimensional analysis: immediate economic return, long-term development value, equity (who benefits), and community need. Education investment has proven long-term economic returns that can exceed infrastructure investment.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Sustainability",
    question: `A bauxite mine generates $80 million annually and 500 jobs. It also permanently destroys the watershed supplying water to 50,000 people. How should this be evaluated?`,
    options: [
      "Mining revenue always justifies environmental costs",
      "Environmental concerns should never limit mining",
      "The economic value of the mine must be weighed against the economic value of the watershed — clean water for 50,000 people has enormous economic value in health, agriculture, and social wellbeing. If watershed value exceeds mining value, protection is economically rational",
      "Only the government should decide",
    ],
    correctAnswer: 2,
    explanation: `Environmental economics: watershed services (clean water, flood protection, health) have calculable economic value. When this exceeds mining benefits over time, protection is both economically and ethically rational.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Financial Literacy",
    question: `A student borrows $100,000 at 10% annual interest. How much total interest will she owe after TWO years (simple interest)?`,
    options: [
      "$10,000",
      "$20,000",
      "$21,000",
      "$100,000",
    ],
    correctAnswer: 1,
    explanation: `Simple interest: $100,000 × 10% = $10,000 per year. Over two years = $20,000 total interest. (Compound interest would be $21,000 — this question uses simple interest.)`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMix1Questions : g5SsMix1Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 1",
        difficulty: "Mixed",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 1</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Mixed Level Practice</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This test blends straightforward recall, applied reasoning, and critical analysis questions across History, Geography, Civics, and Economics — giving you a comprehensive Grade 5 Social Studies challenge.</p>
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
              <p className="text-slate-600">Social Studies Mixed 1</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 1</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
