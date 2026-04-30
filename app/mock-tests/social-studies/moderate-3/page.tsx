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

const g5SsMod3Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `WHY did the Maroons develop their unique guerrilla fighting style?`,
    options: [
      "They had superior weapons to the British",
      "They were professionally trained soldiers",
      "As escaped enslaved people in Jamaica's mountains, they had to compensate for smaller numbers and fewer weapons by using terrain, surprise, and speed rather than conventional warfare",
      "They were taught by foreign mercenaries",
    ],
    correctAnswer: 2,
    explanation: `Guerrilla tactics were born of necessity — outnumbered and outgunned, the Maroons' knowledge of the Blue Mountains gave them a decisive advantage British forces could not overcome.`
  },
  {
    id: 2,
    type: "history",
    skill: "Significance",
    question: `Why was the PEACE TREATY between the British and the Maroons (1739/1740) significant AND controversial?`,
    options: [
      "It had no significance",
      "It was simply a military defeat",
      "It granted Maroons freedom and land — a significant recognition of their power — but controversially required them to return escaped enslaved people to planters",
      "It ended all conflict in Jamaica permanently",
    ],
    correctAnswer: 2,
    explanation: `The treaty was groundbreaking (recognising Maroon freedom) but morally troubling — Maroons became enforcers of the plantation system they had escaped, a legacy still debated today.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing",
    question: `How did the roles of BAPTISTS and ANGLICANS differ in Jamaica's struggle for freedom?`,
    options: [
      "Both equally supported slavery",
      "Both equally opposed slavery",
      "Baptist missionaries (like those who supported Sam Sharpe) were more likely to sympathise with the enslaved — the Anglican Church was closely tied to the planter elite",
      "There was no religious role in the freedom struggle",
    ],
    correctAnswer: 2,
    explanation: `The Baptist church drew enslaved people into its community and some ministers challenged slavery; the established Anglican church was intertwined with colonial power and generally supported planter interests.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact of Independence",
    question: `HOW did independence in 1962 change daily life for ordinary Jamaicans?`,
    options: [
      "Nothing changed for ordinary people",
      "Jamaicans received new political rights — citizenship, the right to a Jamaican passport, and a government responsible to Jamaican voters rather than British interests",
      "Only politicians benefited from independence",
      "Independence made Jamaica poorer immediately",
    ],
    correctAnswer: 1,
    explanation: `Independence transferred sovereignty — Jamaicans gained full citizenship, national symbols (flag, anthem, passport), and a government elected by and accountable to them rather than to Britain.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Evidence",
    question: `A student finds a DIARY written by an enslaved person in 1820s Jamaica. Why is this source particularly VALUABLE to historians?`,
    options: [
      "Diaries are always accurate",
      "It was written by someone with authority",
      "It provides a first-person perspective on the lived experience of slavery from those who experienced it — a perspective rarely preserved in official records",
      "It describes plantation output data",
    ],
    correctAnswer: 2,
    explanation: `Diaries and personal accounts from enslaved people are rare and precious — most historical records were written by enslavers or colonial officials. A first-person enslaved account offers an irreplaceable perspective.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cultural Analysis",
    question: `How does REGGAE MUSIC connect to Jamaica's history of struggle and resistance?`,
    options: [
      "Reggae has no social message",
      "Reggae was created purely for entertainment",
      "Reggae evolved from Jamaica's tradition of using music as a vehicle for protest and spiritual expression — artists like Bob Marley made global audiences aware of Jamaican history and struggle for justice",
      "Reggae began in Britain",
    ],
    correctAnswer: 2,
    explanation: `Reggae's roots lie in the mento, ska, and rocksteady traditions that reflected social conditions. Bob Marley's international success brought Jamaica's history of colonialism and resistance to a global audience.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cause & Effect",
    question: `WHAT was the long-term effect of the plantation economy on Jamaica's social structure?`,
    options: [
      "It created a perfectly equal society",
      "It had no lasting social effects",
      "It created a deeply unequal society with racial hierarchies — a legacy that shaped land ownership, wealth distribution, and social mobility long after emancipation",
      "It gave equal land to all Jamaicans",
    ],
    correctAnswer: 2,
    explanation: `The plantation economy concentrated land and wealth among a small European elite. These inequalities persisted after emancipation — most formerly enslaved people had no land, capital, or political power.`
  },
  {
    id: 8,
    type: "history",
    skill: "Comparing Leaders",
    question: `How did Marcus Garvey's approach to Black liberation DIFFER from Norman Manley's?`,
    options: [
      "Their approaches were identical",
      "Both focused only on Jamaica",
      "Garvey advocated Pan-Africanism and the return to Africa; Manley focused on building a just, independent Jamaican state — both aimed at dignity but through very different visions",
      "Both only worked with international organisations",
    ],
    correctAnswer: 2,
    explanation: `Garvey's vision was global and diasporic — Black people returning to and rebuilding Africa. Manley's was national — building a free, equal Jamaica. Both were responses to colonialism but with fundamentally different frameworks.`
  },
  {
    id: 9,
    type: "history",
    skill: "Historical Thinking",
    question: `Why might ARCHAEOLOGICAL EVIDENCE about the Taino tell us things that WRITTEN RECORDS cannot?`,
    options: [
      "Archaeological evidence is always wrong",
      "Written records are always more accurate",
      "Archaeological artefacts (pottery, tools, middens) reveal everyday life — diet, tools, settlement patterns — while written records from the period were written by Europeans with biases and agendas",
      "Written records are more comprehensive",
    ],
    correctAnswer: 2,
    explanation: `Archaeology gives direct physical evidence of how people actually lived. European written accounts of the Taino were often filtered through colonial prejudice and misunderstanding — artefacts speak more honestly.`
  },
  {
    id: 10,
    type: "history",
    skill: "Legacy",
    question: `How does Jamaica's COAT OF ARMS reflect its history?`,
    options: [
      "It only shows modern Jamaica",
      "It has no historical references",
      "It features Taino figures (first inhabitants), a crocodile, and a helmet — representing Jamaica's layered history of indigenous, colonial, and post-colonial identity",
      "It features only colonial British symbols",
    ],
    correctAnswer: 2,
    explanation: `The Coat of Arms is a visual historical narrative — Taino figures acknowledge the first people, the shield with crocodile represents the island's nature, and the national motto reflects the diverse population that emerged from Jamaica's history.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Spatial Relationships",
    question: `A farmer in St. Thomas notices that rains fall heavily on the western slopes of the mountains but rarely on the eastern slopes. This is BEST explained by:`,
    options: [
      "The eastern slopes are higher",
      "The western slopes are closer to a river",
      "The windward (western) slopes face moisture-bearing trade winds and receive heavy rain; the leeward (eastern) side is in a rain shadow",
      "The eastern slopes are deforested",
    ],
    correctAnswer: 2,
    explanation: `Local rain shadow effects exist within ranges — the windward side faces prevailing moist winds; the leeward side is sheltered and drier. Even within a parish, rainfall varies dramatically.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Map Reading",
    question: `A road map uses RED for major highways and BLUE for rivers. A student sees a thick blue line. What does it represent?`,
    options: [
      "A major highway",
      "A town boundary",
      "A river or water body",
      "A parish border",
    ],
    correctAnswer: 2,
    explanation: `In standard map conventions, blue represents water. The thick blue line represents a significant river or water body. Always check the legend, but blue for water is a nearly universal map convention.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Environmental Decision",
    question: `A community votes to build a dam on a local river. What is a POTENTIAL NEGATIVE CONSEQUENCE?`,
    options: [
      "Cheaper electricity for all",
      "Better road access",
      "Flooding of upstream communities and farmland, disruption of fish migration, and loss of river habitat downstream",
      "Improved water quality",
    ],
    correctAnswer: 2,
    explanation: `Dams create reservoirs that flood land upstream, disrupt aquatic ecosystems, and change water flow downstream — community and ecological costs that must be weighed against benefits.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Settlement Patterns",
    question: `WHY do most of Jamaica's population centres follow a COASTAL DISTRIBUTION?`,
    options: [
      "Coastal areas are mandated by law for settlement",
      "The interior is too cold",
      "Coastal areas historically offered ports for trade, flat land, fishing resources, and access to water — giving them natural advantages for settlement",
      "The mountains are entirely uninhabitable",
    ],
    correctAnswer: 2,
    explanation: `Settlement is shaped by resource access — historically, coasts offered harbour trade, flat building land, fish, and water. Jamaica's coastal urban centres (Kingston, Montego Bay, Ocho Rios) reflect this pattern.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Environmental Impact",
    question: `A student observes that rivers near cities run brown after heavy rain. What MOST LIKELY causes this?`,
    options: [
      "Brown water is natural in cities",
      "Rainfall makes rivers cleaner",
      "Soil erosion and runoff carry sediment, pollutants, and sewage from urban areas into rivers — a major source of river pollution in Jamaica",
      "Brown colour comes from minerals in the water",
    ],
    correctAnswer: 2,
    explanation: `Urban runoff is a major pollution source — rain washes construction sediment, oil, waste, and sewage from urban surfaces directly into rivers, reducing water quality and harming aquatic life.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Caribbean Analysis",
    question: `Small island states like Jamaica are described as 'SIDS' — Small Island Developing States. WHY does being a SIDS create special challenges?`,
    options: [
      "Small islands are always poor",
      "Island location creates no specific challenges",
      "Limited land, vulnerability to hurricanes, dependence on imports, and exposure to rising sea levels create unique development challenges not faced by larger, more resourced nations",
      "SIDS have more opportunities than large nations",
    ],
    correctAnswer: 2,
    explanation: `SIDS face a unique set of vulnerabilities: geographic isolation, small economies, exposure to natural disasters, and high import dependence — recognised internationally through special development frameworks.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Land Use",
    question: `The COCKPIT COUNTRY in Jamaica is largely UNDEVELOPED. WHY is this both a challenge and an opportunity?`,
    options: [
      "Undeveloped land is always worthless",
      "Development is always better",
      "Its rugged limestone terrain makes development costly (challenge), but its biodiversity, water-generating forests, and Maroon heritage make it invaluable for conservation and heritage tourism (opportunity)",
      "It has no significance",
    ],
    correctAnswer: 2,
    explanation: `The Cockpit Country presents a classic conservation dilemma — difficult to develop but ecologically and culturally priceless. Its protection is internationally recognised as essential.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Map Interpretation",
    question: `A population map shows MORE people per square kilometre in the KINGSTON METROPOLITAN AREA than anywhere else in Jamaica. What GEOGRAPHICAL factors explain this?`,
    options: [
      "Kingston has the best weather",
      "Kingston is the smallest parish",
      "Kingston offers more employment (commerce, government, manufacturing), better services (hospitals, universities), and has Jamaica's main port — creating a pull for internal migration",
      "Kingston was randomly chosen as the capital",
    ],
    correctAnswer: 2,
    explanation: `Urban primacy (one dominant city) is typical of small island economies — Kingston concentrates opportunity, drawing migration and becoming far more densely populated than rural areas.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Environmental Sustainability",
    question: `WHY should Jamaica invest in RENEWABLE ENERGY?`,
    options: [
      "Renewable energy is always free",
      "Renewable energy produces more pollution",
      "Jamaica imports nearly all its oil at high cost — renewable energy (solar, wind) would reduce import costs, lower electricity prices, create jobs, and reduce carbon emissions",
      "Renewable energy cannot work in the Caribbean",
    ],
    correctAnswer: 2,
    explanation: `Energy imports consume a significant share of Jamaica's foreign exchange. Renewables would reduce this drain, lower consumer prices, and support Jamaica's commitment to sustainable development.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Climate Change",
    question: `How might RISING SEA LEVELS specifically threaten Jamaica?`,
    options: [
      "Rising seas would improve beaches",
      "Jamaica is not at risk from sea level rise",
      "Low-lying coastal communities, beaches, agricultural land, and infrastructure (like the Palisadoes) could be flooded — threatening hundreds of thousands of Jamaicans who live near the coast",
      "Only Pacific islands are threatened by sea levels",
    ],
    correctAnswer: 2,
    explanation: `With significant populations in low-lying coastal areas, Jamaica faces real risks from sea level rise — including loss of beaches (a tourism asset), flooding of communities, and saltwater intrusion into freshwater supplies.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Applying Knowledge",
    question: `A constituency has elected its MP. What is that MP's PRIMARY duty?`,
    options: [
      "To work only for their political party",
      "To serve the Prime Minister's interests",
      "To represent the interests of ALL constituents — not just those who voted for them — in Parliament",
      "To attend only party meetings",
    ],
    correctAnswer: 2,
    explanation: `An MP represents all residents of their constituency — including those who voted against them. Once elected, they are accountable to all constituents, not just party supporters.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Rights Analysis",
    question: `WHY is the RIGHT TO A FAIR TRIAL particularly important for minorities and marginalised groups?`,
    options: [
      "It only applies to wealthy citizens",
      "Minorities do not need special protection",
      "Without fair trial guarantees, historically marginalised groups face greater risk of unjust treatment — procedural protections are essential safeguards against systemic bias",
      "Fair trials are only important for serious crimes",
    ],
    correctAnswer: 2,
    explanation: `The right to a fair trial is especially vital for those with less social and economic power — history shows that without such guarantees, systemic injustice falls hardest on the most vulnerable.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government Function",
    question: `WHY does the Jamaican government COLLECT TAXES?`,
    options: [
      "Because all governments do so arbitrarily",
      "To punish successful businesses",
      "To fund the public services — education, healthcare, security, roads, and social welfare — that citizens need and use collectively",
      "To give politicians personal income",
    ],
    correctAnswer: 2,
    explanation: `Taxation funds the collective services that individuals and communities cannot provide for themselves — it is the practical mechanism for sharing the costs of shared benefits.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Civic Participation",
    question: `A community group successfully campaigns to fix their flooded road. What does this demonstrate?`,
    options: [
      "That government always ignores communities",
      "That only government action matters",
      "That organised citizen action can hold government accountable and drive positive change — civic participation works",
      "That communities should replace government",
    ],
    correctAnswer: 2,
    explanation: `This demonstrates the power of organised civic engagement — citizens who organise, document problems, and advocate collectively are more effective than individuals acting alone.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Constitutional Significance",
    question: `WHY is the Jamaican Constitution described as the SUPREME LAW?`,
    options: [
      "Because it was written first",
      "Because the Governor General says so",
      "Because ALL other laws must conform to it — any law that contradicts the Constitution can be struck down by the courts",
      "Because it is the longest document",
    ],
    correctAnswer: 2,
    explanation: `Supremacy means the constitution trumps all other laws — Parliament cannot pass a law that violates constitutional rights, and courts can strike down such laws.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rule of Law",
    question: `WHY is JUDICIAL INDEPENDENCE vital in Jamaica's democratic system?`,
    options: [
      "Judges should do what the government says",
      "Judicial independence is not important",
      "Independent judges can make decisions based on law and evidence alone — without political pressure — protecting citizens' rights even from government overreach",
      "Judges should be elected by voters",
    ],
    correctAnswer: 2,
    explanation: `If judges could be pressured by politicians, those in power could manipulate court outcomes — independent courts protect all citizens, especially those challenging powerful interests.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Rights Application",
    question: `A school refuses to admit a student because of her religion. Which right has been violated?`,
    options: [
      "The right to free speech",
      "The right to peaceful assembly",
      "The right to freedom of religion and non-discrimination in access to education",
      "The right to work",
    ],
    correctAnswer: 2,
    explanation: `Refusing education access based on religion violates both freedom of religion (the right to practise one's faith without disadvantage) and the right to education without discrimination.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government Transparency",
    question: `WHY is FREEDOM OF INFORMATION important in a democracy?`,
    options: [
      "Citizens don't need government information",
      "It makes government more secretive",
      "Allowing citizens to access government records enables them to hold officials accountable, identify corruption, and make informed decisions — transparency is essential to accountability",
      "Only journalists need government information",
    ],
    correctAnswer: 2,
    explanation: `Freedom of information empowers citizens — when government operates in the open, it is harder to hide waste, corruption, or abuse. Informed citizens are the foundation of accountability.`
  },
  {
    id: 29,
    type: "civics",
    skill: "CARICOM",
    question: `CARICOM member states cooperate on HEALTH because:`,
    options: [
      "Health has nothing to do with CARICOM",
      "Individual countries can manage all health issues alone",
      "Small island states face shared health threats (like pandemics, non-communicable diseases) that are more effectively addressed collectively — pooling resources and expertise",
      "CARICOM requires all members to have the same health system",
    ],
    correctAnswer: 2,
    explanation: `Collective action is more effective for many health challenges — coordinating pandemic responses, sharing medical expertise, and jointly negotiating drug prices are all more effective regionally.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Electoral Process",
    question: `WHY is the SECRET BALLOT important in democratic elections?`,
    options: [
      "It slows down the voting process",
      "Voters should declare their choices publicly",
      "It protects voters from pressure, intimidation, or retaliation — ensuring their vote truly reflects their free choice without fear",
      "Secret ballots are less accurate",
    ],
    correctAnswer: 2,
    explanation: `Secret ballots prevent employers, landlords, or political operatives from pressuring or punishing voters based on their choice — they are fundamental to genuinely free elections.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Production Decisions",
    question: `A manufacturing company in Jamaica decides to AUTOMATE part of its production line. What is a LIKELY NEGATIVE consequence?`,
    options: [
      "The company becomes less productive",
      "The company loses all its customers",
      "Some workers may lose their jobs as machines replace human labour — the short-term cost for workers, even if long-term productivity gains benefit the company",
      "Automation always improves wages for all workers",
    ],
    correctAnswer: 2,
    explanation: `Automation creates a productivity paradox — it can reduce costs and increase output for the company, but displace the workers whose tasks are now performed by machines.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Market Analysis",
    question: `During the August mango season, mango prices FALL significantly in Jamaican markets. WHY?`,
    options: [
      "Jamaicans suddenly dislike mangoes in August",
      "The government lowers mango prices by law",
      "Seasonal abundance — supply increases dramatically during harvest season — drives prices down as more mangoes compete for buyers",
      "Mango importation increases in August",
    ],
    correctAnswer: 2,
    explanation: `Basic supply and demand: when the mango harvest floods the market, supply outstrips demand, forcing prices down. After the season, supply drops and prices recover.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Tourism Economics",
    question: `A hotel in Jamaica earns $1 million in revenue. Why might only a fraction of this stay in the Jamaican economy?`,
    options: [
      "Because Jamaica taxes hotels heavily",
      "Because tourists bring all their own food",
      "Many hotels are foreign-owned and import food, furniture, and supplies — profits and spending 'leak' out of the economy to foreign owners and suppliers",
      "All tourism revenue stays in Jamaica",
    ],
    correctAnswer: 2,
    explanation: `Economic leakage is a major issue in Caribbean tourism — foreign ownership means profits leave; imported food and goods reduce local economic benefit. Building linkages to local suppliers is key.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Fiscal Policy",
    question: `The Jamaican government REDUCES income tax. What is the MOST LIKELY SHORT-TERM effect?`,
    options: [
      "Citizens immediately have less money",
      "Government revenue rises automatically",
      "Citizens have more disposable income — potentially stimulating consumer spending and economic growth",
      "Unemployment rises immediately",
    ],
    correctAnswer: 2,
    explanation: `A tax cut leaves more money in citizens' pockets — if they spend it on local goods and services, this can stimulate economic activity. However, it may also reduce government revenue.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Agricultural Economics",
    question: `WHY do some Jamaican farmers prefer to grow YAMS for the local market rather than BANANAS for export?`,
    options: [
      "Yams taste better than bananas",
      "Local markets are more profitable for large quantities",
      "Yams avoid the price volatility and strict quality standards of export markets — local market selling may be more predictable and require less compliance investment",
      "Bananas are harder to grow",
    ],
    correctAnswer: 2,
    explanation: `Export markets (especially for bananas) are subject to strict EU or US grading standards and volatile world prices. Local market crops can be sold across a wider range of qualities and offer more price stability.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Community Economics",
    question: `A COOPERATIVE BANK charges its members 12% interest on loans while a commercial bank charges 24%. WHY might a small business owner choose the co-op?`,
    options: [
      "Commercial banks are safer",
      "Co-ops always have more money to lend",
      "The cooperative's lower interest rate means the business owner pays less for the same loan — reducing costs and making the business more financially viable",
      "Co-ops are only for farmers",
    ],
    correctAnswer: 2,
    explanation: `Lower interest rates are a direct financial advantage — the co-op's member-ownership model means profits go back to members as lower rates rather than to external shareholders.`
  },
  {
    id: 37,
    type: "economics",
    skill: "International Trade",
    question: `Jamaica benefits from preferential trade agreements with the USA and EU. WHY would losing these agreements hurt Jamaican exporters?`,
    options: [
      "Because Jamaica doesn't export to the USA or EU",
      "Preferential access has no value",
      "Jamaican products would face higher tariffs in those markets, making them more expensive and less competitive compared to products from countries with better trade access",
      "Trade agreements only help large countries",
    ],
    correctAnswer: 2,
    explanation: `Preferential access allows Jamaican products (like coffee and sugar) to enter major markets at lower or zero tariffs — losing this advantage would make Jamaican exports pricier and less competitive internationally.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Environmental Economics",
    question: `A sugar factory pollutes a river used by fishing communities downstream. Who BEARS the ECONOMIC COST of this pollution?`,
    options: [
      "The factory alone pays",
      "Nobody bears a cost",
      "The fishing communities — who lose income from reduced fish catches — and the public, who may face health costs and water treatment expenses",
      "The government pays all costs automatically",
    ],
    correctAnswer: 2,
    explanation: `Environmental economics calls these 'negative externalities' — costs borne by third parties who had no part in creating the pollution. The factory gains from avoiding waste treatment; communities lose.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Economic Planning",
    question: `A student studying economics learns that Jamaica has a SMALL, OPEN ECONOMY. What does this mean?`,
    options: [
      "Jamaica's economy is closed to trade",
      "Jamaica only trades within CARICOM",
      "Jamaica's economy is highly dependent on international trade — external factors like global oil prices, interest rates, and demand for tourism heavily influence Jamaica's economic performance",
      "Jamaica is too poor to trade internationally",
    ],
    correctAnswer: 2,
    explanation: `A small, open economy is significantly influenced by external factors. Jamaica imports most of its fuel, food, and manufactured goods — making it vulnerable to global price changes.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Financial Decision",
    question: `A Jamaican family earns $100,000 per month and spends $95,000. They are:`,
    options: [
      "In serious debt",
      "Breaking even",
      "Saving $5,000 per month — living within their means and building financial security",
      "Spending irresponsibly",
    ],
    correctAnswer: 2,
    explanation: `Income ($100,000) minus expenditure ($95,000) = $5,000 saved. This family is living within its means and building savings — an example of positive financial management.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMod3Questions : g5SsMod3Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 3</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Moderate Level</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Moderate Level Focus</h3>
              <p className="text-slate-700">This test requires applying Social Studies knowledge — understanding cause and effect, interpreting maps and data, comparing historical events, evaluating civic choices, and reasoning about economic decisions.</p>
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
              <p className="text-slate-600">Social Studies Moderate 3</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 3</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
