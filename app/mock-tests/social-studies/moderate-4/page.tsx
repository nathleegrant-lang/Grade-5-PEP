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

const g5SsMod4Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `Why did LARGE NUMBERS of Jamaicans migrate to Britain in the 1950s and 1960s?`,
    options: [
      "Britain forced Jamaicans to migrate",
      "Jamaicans were fleeing political persecution",
      "Britain actively recruited Caribbean workers to fill post-war labour shortages — Jamaicans went seeking economic opportunity and better living conditions",
      "Jamaicans were expelled from their own country",
    ],
    correctAnswer: 2,
    explanation: `The 1948 British Nationality Act gave Commonwealth citizens the right to live in Britain. With Britain rebuilding after WWII and Jamaica offering limited opportunities, tens of thousands made the 'Windrush' journey.`
  },
  {
    id: 2,
    type: "history",
    skill: "Analysis",
    question: `What does the PHRASE 'freedom is not free' mean in the context of Jamaica's independence struggle?`,
    options: [
      "Freedom is expensive to buy",
      "Freedom was purchased from Britain",
      "Freedom was won through the sacrifices and sustained activism of leaders like Manley, Bustamante, and workers who organised, marched, and demanded rights over decades",
      "Freedom was given freely by Britain",
    ],
    correctAnswer: 2,
    explanation: `Independence was not granted out of generosity — it was the result of decades of organised political activism, strikes, civil disobedience, and persistent pressure from Jamaican leaders and ordinary people.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing",
    question: `How was Norman Manley's vision for Jamaica SIMILAR to and DIFFERENT from Marcus Garvey's?`,
    options: [
      "They were completely identical",
      "Manley wanted colonialism; Garvey wanted independence",
      "Both wanted dignity and justice for Black people, but Manley focused on building an independent Jamaican nation-state while Garvey focused on Pan-African unity and return to Africa",
      "Neither cared about ordinary Jamaicans",
    ],
    correctAnswer: 2,
    explanation: `Both started from the same desire — dignity and self-determination for Black people. But Manley's nationalism was rooted in Jamaica, while Garvey's vision was transnational and ultimately Africa-centred.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact",
    question: `How did the 1938 LABOUR UNREST across Jamaica contribute to political change?`,
    options: [
      "It caused Britain to increase control",
      "It had no political impact",
      "The strikes and labour unrest demonstrated the power of organised workers and led directly to political reforms — including the introduction of Universal Adult Suffrage in 1944",
      "It ended Bustamante's career",
    ],
    correctAnswer: 2,
    explanation: `The 1938 uprisings — led by Bustamante and others — showed that ordinary workers could force political change. Britain responded with the Moyne Commission and eventual democratic reforms.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is George William Gordon recognised as a National Hero despite not leading a direct rebellion?`,
    options: [
      "He did lead a rebellion",
      "He was the richest Jamaican of his time",
      "He used his position as a legislator to advocate powerfully for the poor and was martyred by the colonial authorities — his execution without fair trial made him a symbol of colonial injustice",
      "He was a friend of Paul Bogle's",
    ],
    correctAnswer: 1,
    explanation: `Gordon's heroism lay in using political power to advocate for the powerless — and in his unjust execution. The colonial government's haste to make an example of him exposed the brutality of the system he opposed.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cultural Continuity",
    question: `How does JONKANOO (John Canoe) demonstrate CULTURAL RESILIENCE?`,
    options: [
      "Jonkanoo was created by the British",
      "It has no African roots",
      "Jonkanoo preserved West African masquerade traditions under slavery — enslaved people maintained cultural identity through this festival even when denied almost everything else",
      "Jonkanoo was only created after emancipation",
    ],
    correctAnswer: 2,
    explanation: `Enslaved Africans maintained cultural identity through disguise — the masquerade tradition allowed African spiritual and communal practices to survive under the watchful eye of enslavers.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cause & Effect",
    question: `What was a DIRECT CONSEQUENCE of Jamaica leaving the Federation of the West Indies in 1961?`,
    options: [
      "Jamaica rejoined the federation in 1965",
      "Nothing changed",
      "Independence — without the federation framework, Jamaica proceeded directly to full independence in 1962",
      "Jamaica became a British Crown Colony again",
    ],
    correctAnswer: 2,
    explanation: `When Jamaica voted to leave the federation in 1961, the path to independence opened. Jamaica became independent on August 6, 1962 — one of the first Caribbean nations to do so.`
  },
  {
    id: 8,
    type: "history",
    skill: "Evaluating Evidence",
    question: `A tourist brochure from the 1950s describes Jamaica as 'a happy, peaceful tropical paradise.' Why is this description MISLEADING?`,
    options: [
      "Tourist brochures are always accurate",
      "Jamaica was peaceful in the 1950s",
      "It omits the deep poverty, inequality, and political activism of the period — it presents only what would attract wealthy tourists, erasing the lived reality of most Jamaicans",
      "It accurately describes Jamaica's geography",
    ],
    correctAnswer: 2,
    explanation: `Tourism promotion always selects positive aspects. In reality, the 1950s saw significant labour unrest, poverty, and political agitation that formed the backdrop to independence.`
  },
  {
    id: 9,
    type: "history",
    skill: "Legacy of Slavery",
    question: `What does the concept of 'REPARATIONS' mean in the context of the history of slavery?`,
    options: [
      "Repairing broken buildings",
      "Returning enslaved people to Africa",
      "Compensation or amends paid by countries and institutions that benefited from slavery to the descendants of those who were enslaved",
      "A type of trade agreement",
    ],
    correctAnswer: 2,
    explanation: `Reparations debates centre on whether those who profited from slavery (European governments, companies, institutions) owe compensation to descendants of the enslaved — addressing historical injustice.`
  },
  {
    id: 10,
    type: "history",
    skill: "Historical Thinking",
    question: `A historian says 'there are always multiple perspectives on historical events.' How does this apply to the Morant Bay Rebellion?`,
    options: [
      "Historical events have only one true interpretation",
      "The colonial government's account is the only valid one",
      "The rebellion can be seen as criminal violence (from the colonial perspective) or as legitimate protest against injustice (from the perspective of poor Jamaicans) — both perspectives use the same events but interpret them very differently",
      "Paul Bogle's perspective is the only valid one",
    ],
    correctAnswer: 2,
    explanation: `Multiperspectivity is fundamental to historical thinking. The Morant Bay Rebellion looks radically different depending on whose interests and values frame the analysis.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Skills",
    question: `A student measures 4 cm on a map with a scale of 1:25,000. The actual distance is:`,
    options: [
      "4 km",
      "1 km",
      "10 km",
      "25 km",
    ],
    correctAnswer: 1,
    explanation: `1:25,000 means 1 cm = 25,000 cm = 0.25 km. 4 cm × 0.25 km = 1 km.`
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
    skill: "Environmental Reasoning",
    question: `A town's river is polluted by a factory upstream. What is the MOST IMMEDIATE impact on the town?`,
    options: [
      "Improved water quality",
      "No impact — rivers clean themselves quickly",
      "The town's water supply and aquatic life are threatened — residents may face health risks and fish populations decline",
      "The factory gains more customers",
    ],
    correctAnswer: 2,
    explanation: `Upstream pollution flows downstream — communities below a polluting factory face contaminated water for drinking, bathing, and irrigation, plus the loss of fish from the river.`
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
    skill: "Land Use Decision",
    question: `A community debates whether to develop a mangrove area as a resort or protect it. WHY should they consider protecting the mangroves?`,
    options: [
      "Mangroves are ugly and useless",
      "Resorts are always better",
      "Mangroves provide coastal protection from storms, habitat for juvenile fish (supporting fisheries), water filtration, and carbon storage — their ecosystem services may outweigh short-term resort revenue",
      "Mangroves prevent tourism",
    ],
    correctAnswer: 2,
    explanation: `Mangrove valuation is a classic cost-benefit dilemma. Their ecosystem services — storm surge protection alone can save millions in infrastructure — often exceed the one-time benefit of development.`
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
    skill: "Map Skills",
    question: `On a map, what information does the LEGEND (key) provide that a compass rose does NOT?`,
    options: [
      "Direction",
      "Scale",
      "The meaning of symbols and colours used on the map",
      "The map's publication date",
    ],
    correctAnswer: 2,
    explanation: `The compass rose shows direction; the legend explains what every symbol, colour, and line means. Both are essential, but they provide completely different types of information.`
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
    skill: "Caribbean Geography",
    question: `Jamaica, Cuba, Haiti, and Puerto Rico are all part of the GREATER ANTILLES. What do they have in common that distinguishes them from the LESSER ANTILLES?`,
    options: [
      "They are all British colonies",
      "They all speak Spanish",
      "They are significantly larger islands than those of the Lesser Antilles",
      "They are all closer to South America",
    ],
    correctAnswer: 2,
    explanation: `The Greater Antilles are distinguished by their size — these four large islands contain the majority of the Caribbean's land area and population.`
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
    skill: "Applying Civic Knowledge",
    question: `A citizen believes her human rights have been violated by the government. Which institution can she approach?`,
    options: [
      "Her parish councillor",
      "The Parliament",
      "The Supreme Court — which can hear cases involving breaches of constitutional rights",
      "The Cabinet",
    ],
    correctAnswer: 2,
    explanation: `The Supreme Court has original jurisdiction to hear cases about violations of constitutional rights — citizens can petition directly when fundamental rights are at stake.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Evaluating Rights",
    question: `Freedom of speech DOES NOT protect which of the following?`,
    options: [
      "Criticising government policy",
      "Peaceful protest against unfair laws",
      "Deliberately inciting violence against a group of people",
      "Reporting on government corruption",
    ],
    correctAnswer: 2,
    explanation: `Freedom of speech protects robust political debate and criticism, but not speech that directly incites violence, hatred, or harm to others — the law sets limits to protect others' safety and dignity.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government Function",
    question: `Why does Jamaica need BOTH a House of Representatives AND a Senate?`,
    options: [
      "It creates extra jobs",
      "The Senate is unnecessary",
      "The House (elected) represents the people; the Senate (appointed) acts as a revising chamber — providing a second check on legislation before it becomes law",
      "The Constitution randomly requires two houses",
    ],
    correctAnswer: 2,
    explanation: `Bicameral parliament provides an extra layer of scrutiny — bills pass through both chambers, and the Senate can send legislation back for revision, reducing the chance of rushed or poorly considered laws.`
  },
  {
    id: 24,
    type: "civics",
    skill: "CARICOM",
    question: `A hurricane devastates a small CARICOM member state. How would CARICOM membership help?`,
    options: [
      "CARICOM provides direct financial aid to all members",
      "CARICOM has no disaster response role",
      "CARICOM has mechanisms for regional disaster response and can coordinate assistance from member states — pooling resources that small states couldn't access alone",
      "CARICOM only deals with trade",
    ],
    correctAnswer: 2,
    explanation: `CARICOM's disaster management framework (CDEMA) coordinates regional disaster response — small island states benefit from collective resources and expertise they couldn't maintain individually.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Rights vs Responsibilities",
    question: `A neighbour plays very loud music late at night. Which rights are in conflict?`,
    options: [
      "The right to education vs the right to rest",
      "The neighbour's freedom of expression vs other residents' right to peaceful enjoyment of their property and adequate rest",
      "The right to vote vs the duty to pay taxes",
      "Freedom of religion vs freedom of movement",
    ],
    correctAnswer: 1,
    explanation: `Rights frequently conflict — freedom of expression (playing music) vs the right to peaceful enjoyment and adequate rest. Law and community norms mediate between competing valid claims.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Electoral Analysis",
    question: `WHY is voter registration important in a democracy?`,
    options: [
      "Only registered voters pay taxes",
      "It is an optional civic activity",
      "Voter registration ensures only eligible citizens participate in elections — maintaining the integrity of the democratic process",
      "Registration automatically makes you a Member of Parliament",
    ],
    correctAnswer: 2,
    explanation: `Voter registration is the gateway to democratic participation — ensuring votes are cast only by eligible citizens and that election results genuinely reflect the preferences of the electorate.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Constitutional Rights",
    question: `The RIGHT TO SILENCE means a person arrested cannot be COMPELLED to:`,
    options: [
      "Speak to their lawyer",
      "Appear in court",
      "Testify against themselves — they can remain silent without it being treated as evidence of guilt",
      "Pay their legal fees",
    ],
    correctAnswer: 2,
    explanation: `The right to silence (sometimes called the right against self-incrimination) protects suspects from being forced to provide evidence against themselves — a cornerstone of fair criminal procedure.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Government Accountability",
    question: `The OFFICE OF THE PUBLIC DEFENDER in Jamaica receives complaints about:`,
    options: [
      "Tax payment disputes",
      "Parliamentary procedures",
      "Actions by government agencies and officials that may be unfair, discriminatory, or an abuse of authority",
      "Commercial disputes between businesses",
    ],
    correctAnswer: 2,
    explanation: `The Public Defender (similar to an ombudsman) investigates complaints about government conduct — providing citizens with an independent avenue to challenge unfair administrative action.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Democracy",
    question: `What makes an election DEMOCRATIC?`,
    options: [
      "Any election is democratic by definition",
      "One party always winning",
      "Free and fair elections with universal suffrage, secret ballots, multiple candidates, and results that are accepted and respected",
      "Only rich countries have democratic elections",
    ],
    correctAnswer: 2,
    explanation: `Democratic elections require: free choice, universal eligibility to vote, secret ballots, competing candidates, transparent counting, and peaceful transfer of power — all are necessary.`
  },
  {
    id: 30,
    type: "civics",
    skill: "CARICOM Benefits",
    question: `How does CARICOM's CARIBBEAN EXAMINATIONS COUNCIL (CXC/CSEC) benefit Jamaican students?`,
    options: [
      "It only benefits Barbadian students",
      "CXC has nothing to do with CARICOM",
      "CXC provides regionally recognised qualifications that Jamaican graduates can use across CARICOM member states — a single exam system serving multiple countries",
      "CXC is a Jamaican government organisation",
    ],
    correctAnswer: 2,
    explanation: `CXC's CSEC qualifications are recognised across the Caribbean — a Jamaican student's passes are accepted in Trinidad, Barbados, or Guyana, facilitating regional mobility.`
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

export default function G5SsMod4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMod4Questions : g5SsMod4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 4",
        difficulty: "Moderate",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 4</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 4</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 4</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
