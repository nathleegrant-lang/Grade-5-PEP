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

const g5SsMod5Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `Why did Marcus Garvey leave Jamaica and spend most of his career abroad?`,
    options: [
      "He was exiled by the Jamaican government",
      "He preferred colder climates",
      "Jamaica's small size limited the reach of his message — he needed the large Black communities of New York, London, and elsewhere to build a global movement",
      "He was born abroad",
    ],
    correctAnswer: 2,
    explanation: `Garvey recognised that building a global Pan-African movement required bases in the diaspora — New York's Harlem offered a large Black community, major newspapers, and international connections.`
  },
  {
    id: 2,
    type: "history",
    skill: "Significance",
    question: `Why is August 1, 1838 considered MORE SIGNIFICANT than August 1, 1834?`,
    options: [
      "They are equally significant",
      "1834 was actually more important",
      "1834 marked technical emancipation but with a forced 'apprenticeship' period. August 1, 1838 was true freedom — when the apprenticeship ended and enslaved people could finally live and move freely",
      "There is no difference between the two dates",
    ],
    correctAnswer: 2,
    explanation: `Apprenticeship (1834-1838) was slavery by another name — former enslaved people had to continue working for their enslavers unpaid. Only in 1838 did genuine freedom begin.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing",
    question: `How did FEMALE ENSLAVED PEOPLE experience slavery DIFFERENTLY from males?`,
    options: [
      "There was no difference",
      "Women had it better than men",
      "Women faced all the same hardships as men PLUS additional exploitation — sexual violence, forced childbearing to 'produce' more enslaved people, and the particular trauma of having children who could be sold away",
      "Women were treated better than men",
    ],
    correctAnswer: 2,
    explanation: `Enslaved women faced gendered forms of oppression on top of the general brutality — sexual exploitation, forced reproduction to increase the enslaver's 'property,' and the anguish of seeing children sold.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact of Heritage",
    question: `How does JAMAICAN CUISINE reflect the island's diverse cultural heritage?`,
    options: [
      "Jamaican food comes only from Africa",
      "Jamaican food was entirely created by the British",
      "Ackee (West Africa), curry goat (India), bammy (Taino), jerk (Maroon), and bread (European) — Jamaican food is a living archive of the island's cultural encounters",
      "Jamaican cuisine has no African roots",
    ],
    correctAnswer: 2,
    explanation: `Every dish on a Jamaican table is a history lesson — the ingredients and techniques trace the routes of colonialism, the slave trade, indentureship, and indigenous culture.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is the year 1494 (Columbus's arrival) a TURNING POINT in Jamaican history?`,
    options: [
      "Because the Taino started farming in 1494",
      "Because Jamaica became British in 1494",
      "It marks the beginning of European colonisation — setting off a chain of events (Spanish settlement, Taino genocide, British conquest, slavery, emancipation) that shaped modern Jamaica",
      "Because Jamaica was discovered by Jamaicans in 1494",
    ],
    correctAnswer: 2,
    explanation: `1494 is a hinge year — before it, Jamaica was a flourishing Taino society; after it, everything changed: indigenous collapse, colonisation, the slave trade, and the creation of modern Jamaica.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cultural Analysis",
    question: `How does the MAROON COMMUNITY of Moore Town preserve Jamaica's African heritage TODAY?`,
    options: [
      "Maroons no longer exist",
      "Maroon communities have completely assimilated",
      "Moore Town Maroons maintain their own governance (the Colonel and council), traditional ceremonies (Kromanti ceremonies), music (Abeng), and distinct identity — a living link to African resistance",
      "Maroons speak only English today",
    ],
    correctAnswer: 2,
    explanation: `Maroon communities are living repositories of African cultural survival — their governance, music, ceremonies, and identity represent continuous resistance to cultural erasure across centuries.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cause & Effect",
    question: `What was the LONG-TERM EFFECT of the plantation economy's dependence on sugar on modern Jamaica?`,
    options: [
      "It made Jamaica very wealthy for all Jamaicans",
      "It had no long-term effects",
      "Jamaica was left with a distorted economy dependent on a few export crops, significant inequality in land ownership, and limited industrialisation — legacies that still challenge development",
      "It created a diversified, resilient economy",
    ],
    correctAnswer: 2,
    explanation: `The plantation legacy — monoculture, concentrated land ownership, absent industrialisation — created structural weaknesses in Jamaica's economy that persist to this day.`
  },
  {
    id: 8,
    type: "history",
    skill: "Historical Comparison",
    question: `How was PAUL BOGLE's rebellion DIFFERENT from GEORGE WILLIAM GORDON's political activism?`,
    options: [
      "They were identical in approach",
      "Bogle used political channels while Gordon used physical force",
      "Bogle led direct armed action (the Morant Bay march and uprising), while Gordon used legislative and public advocacy — different methods both aimed at justice for the poor",
      "Gordon was more violent than Bogle",
    ],
    correctAnswer: 2,
    explanation: `The contrast between Bogle (physical uprising) and Gordon (political advocacy) shows how the same cause — justice for poor Jamaicans — was pursued through different means by different people.`
  },
  {
    id: 9,
    type: "history",
    skill: "Legacy",
    question: `Why do Jamaicans celebrate their NATIONAL HEROES rather than colonial figures?`,
    options: [
      "Because colonial figures are unknown",
      "Because Jamaicans are required to by law",
      "Celebrating National Heroes reflects Jamaica's post-colonial identity — honouring those who fought FOR Jamaican people rather than those who exploited them",
      "Colonial figures have no statues",
    ],
    correctAnswer: 2,
    explanation: `National hero celebrations are an act of historical reclamation — choosing to honour resisters and builders of independence rather than those who profited from colonialism.`
  },
  {
    id: 10,
    type: "history",
    skill: "Analysis",
    question: `What does it MEAN that Jamaica has ONLY ONE female National Hero?`,
    options: [
      "That Jamaican women have not contributed to history",
      "That only Nanny deserved the honour",
      "It reflects both the genuine exceptional nature of Nanny's achievement AND historical patterns of overlooking women's contributions — a subject of ongoing discussion in Jamaica",
      "That all seven National Heroes are famous internationally",
    ],
    correctAnswer: 2,
    explanation: `The absence of women beyond Nanny raises important questions about whose contributions are recognised and who gets written into history — a living debate about how Jamaica remembers its past.`
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
    skill: "Cause & Effect",
    question: `WHY does Blue Mountain Peak have a much cooler climate than Kingston?`,
    options: [
      "Blue Mountain is farther north",
      "Kingston is at sea level and traps heat; Blue Mountain (at over 2,200 m) benefits from lower temperatures at higher elevation — approximately 6°C cooler for every 1,000 m gained",
      "Kingston is in a valley with no wind",
      "Blue Mountain faces the Atlantic ocean",
    ],
    correctAnswer: 1,
    explanation: `Temperature decreases with altitude — the lapse rate. Blue Mountain Peak at 2,256 m is dramatically cooler than sea-level Kingston, supporting coffee growing and a distinct ecosystem.`
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
    skill: "Spatial Analysis",
    question: `WHY are Jamaica's NORTHERN PARISHES (like St. Ann and Portland) more suitable for TOURISM than southern parishes like Clarendon?`,
    options: [
      "Southern parishes have better beaches",
      "Northern parishes are less populated",
      "The north coast has sandy beaches, clear water warmed by the Caribbean Sea, and scenic mountains — natural assets that attract tourists. Clarendon has fewer beach and scenic assets",
      "Southern parishes are too far from the airport",
    ],
    correctAnswer: 2,
    explanation: `Physical geography drives tourism location: the north coast's beaches, turquoise water, and mountain backdrop are the classic Caribbean tourism product. The south coast is drier and has fewer beach attractions.`
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
    skill: "Environment",
    question: `What is the RELATIONSHIP between watersheds and water supply?`,
    options: [
      "Watersheds and water supply are unrelated",
      "Polluting watersheds improves water quality",
      "Watersheds are the land areas that collect rainfall into rivers — deforesting or polluting a watershed directly reduces and degrades the water supply of communities downstream",
      "Watersheds only affect agriculture",
    ],
    correctAnswer: 2,
    explanation: `Protecting watersheds is protecting water supply — they are inseparable. Jamaica's Forest Act protects watershed forests precisely because clean, reliable water depends on healthy, forested catchment areas.`
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
    skill: "Climate Analysis",
    question: `A farming community experiences a severe drought. Which crops are they MOST LIKELY to be able to continue growing?`,
    options: [
      "Water-intensive crops like rice and watercress",
      "Crops that require frequent irrigation",
      "Drought-tolerant crops like cassava, sorghum, and certain root vegetables",
      "Crops grown only in wet regions",
    ],
    correctAnswer: 2,
    explanation: `Drought conditions call for drought-tolerant crops — those with deep roots or physiological adaptations to low water. Cassava is famously drought-resistant and is a Jamaican food staple.`
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
    skill: "Environmental Impact",
    question: `What is the RELATIONSHIP between deforestation and flooding in Jamaica?`,
    options: [
      "Deforestation reduces flooding",
      "There is no relationship",
      "Forests absorb and slow rainfall; when forests are removed, rainwater runs off quickly, overwhelming river channels and causing flooding in communities below",
      "Only coastal areas flood",
    ],
    correctAnswer: 2,
    explanation: `Trees intercept rainfall, and root systems absorb and slowly release water. Without them, heavy rain rushes directly into rivers — causing flash floods that damage communities and agriculture.`
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

export default function G5SsMod5MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMod5Questions : g5SsMod5Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 5</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 5</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 5</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
