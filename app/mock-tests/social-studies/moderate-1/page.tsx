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

const g5SsMod1Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `What was a DIRECT CAUSE of the Morant Bay Rebellion of 1865?`,
    options: [
      "The abolition of slavery in 1838",
      "Widespread poverty, injustice, and the failure of the colonial government to address the grievances of poor Jamaicans",
      "The arrival of indentured labourers from India",
      "Marcus Garvey's speech at Morant Bay",
    ],
    correctAnswer: 1,
    explanation: `The rebellion grew from the desperate conditions of the rural poor — unemployment, unfair courts, and colonial indifference to suffering made uprising inevitable.`
  },
  {
    id: 2,
    type: "history",
    skill: "Historical Significance",
    question: `WHY was Sam Sharpe's Baptist War of 1831 historically significant?`,
    options: [
      "It immediately ended slavery",
      "It had no impact on British policy",
      "It was the largest slave uprising in Jamaican history and accelerated the British Parliament's move to abolish slavery",
      "It created the Maroon communities",
    ],
    correctAnswer: 2,
    explanation: `The scale and violence of the 1831 rebellion shocked Britain and strengthened the abolitionists' case. Emancipation followed within three years.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing Eras",
    question: `What was the KEY DIFFERENCE between the roles of the Taino and the enslaved Africans in Jamaica's economy?`,
    options: [
      "There was no difference",
      "The Taino chose to leave; enslaved Africans were forced to stay",
      "The Taino were free people using the land for their own survival; enslaved Africans were forced to produce wealth for European colonists",
      "Enslaved Africans arrived voluntarily",
    ],
    correctAnswer: 2,
    explanation: `This comparison highlights the fundamental difference between indigenous self-sufficiency and the coercive plantation system that replaced it.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact of Colonialism",
    question: `HOW did the Spanish conquest affect the Taino population?`,
    options: [
      "The Taino population grew under Spanish rule",
      "The Taino and Spanish lived peacefully together",
      "The Taino population was devastated by disease, violence, and forced labour — nearly wiped out within 50 years",
      "The Taino successfully resisted and maintained their independence",
    ],
    correctAnswer: 2,
    explanation: `European diseases (against which the Taino had no immunity), direct violence, and forced labour led to the near-total collapse of the Taino population.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Thinking",
    question: `Why do historians describe Emancipation Day (August 1, 1838) as the END of one struggle and the BEGINNING of another?`,
    options: [
      "Because the British left Jamaica that day",
      "Because slavery ended but formerly enslaved people faced new forms of exploitation, poverty, and discrimination",
      "Because a new war began in 1838",
      "Because the Maroons were freed on that day",
    ],
    correctAnswer: 1,
    explanation: `Emancipation ended legal slavery but did not provide land, resources, or equality. The struggles for land, wages, and dignity continued — with the Morant Bay Rebellion just 27 years later.`
  },
  {
    id: 6,
    type: "history",
    skill: "Legacy",
    question: `In what way did Marcus Garvey's ideas INFLUENCE movements beyond his lifetime?`,
    options: [
      "His ideas had no lasting impact",
      "He only influenced Jamaicans",
      "His message of Black pride and self-reliance inspired the Civil Rights Movement in America, Caribbean independence movements, and the Rastafari faith",
      "He influenced only the UNIA organisation",
    ],
    correctAnswer: 2,
    explanation: `Garvey's ideas planted seeds that flowered in movements across the diaspora — Malcolm X credited him, Caribbean nationalists drew on him, and Rastafarians revere him as a prophet.`
  },
  {
    id: 7,
    type: "history",
    skill: "Evaluating Sources",
    question: `A student reads a colonial newspaper from 1865 describing Paul Bogle as a 'dangerous agitator.' Why should this description be treated with CAUTION?`,
    options: [
      "Newspapers always tell the truth",
      "The newspaper was written from the perspective of the colonial authorities who Bogle was challenging — their account is likely biased",
      "Paul Bogle was dangerous",
      "Newspapers never described historical events",
    ],
    correctAnswer: 1,
    explanation: `Historical sources must be evaluated for bias. A colonial newspaper representing the interests of the ruling class would naturally portray those challenging it negatively.`
  },
  {
    id: 8,
    type: "history",
    skill: "Comparing Heroes",
    question: `What do ALL SEVEN Jamaican National Heroes have in common?`,
    options: [
      "They were all born in Kingston",
      "They all lived in the 20th century",
      "They were all male",
      "They all made extraordinary sacrifices for the rights, dignity, and freedom of Jamaican people",
    ],
    correctAnswer: 3,
    explanation: `Despite their different backgrounds, eras, and methods, all seven National Heroes demonstrated exceptional courage and sacrifice in pursuit of justice and freedom for Jamaica.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Change",
    question: `How did the arrival of INDENTURED LABOURERS from India and China after 1838 CHANGE Jamaican society?`,
    options: [
      "It made Jamaica more homogeneous",
      "It had no cultural impact",
      "It added new cultural elements — foods, festivals, religions, and traditions — enriching Jamaica's diverse society",
      "It reduced cultural diversity",
    ],
    correctAnswer: 2,
    explanation: `Indian and Chinese communities brought their own cultural practices — curry, Diwali, Chinese New Year, new crops — adding to the multicultural tapestry reflected in 'Out of Many, One People.'`
  },
  {
    id: 10,
    type: "history",
    skill: "Historical Significance",
    question: `WHY did Jamaica leave the Federation of the West Indies in 1961?`,
    options: [
      "Jamaica was forced to leave",
      "Jamaicans voted in a referendum to leave, believing independent development would benefit Jamaica more than federation",
      "Britain expelled Jamaica",
      "The federation was dissolved by Britain",
    ],
    correctAnswer: 1,
    explanation: `Jamaicans voted 54% to 54% to leave in a 1961 referendum. Critics of federation feared a unequal burden — paying for poorer islands — while independence offered full self-determination.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Skills",
    question: `A map shows a scale of 1:50,000. If two towns are 6 cm apart on the map, what is the REAL distance?`,
    options: [
      "6 km",
      "3 km",
      "30 km",
      "300 km",
    ],
    correctAnswer: 1,
    explanation: `1:50,000 means 1 cm on the map = 50,000 cm (0.5 km) in reality. 6 cm × 0.5 km = 3 km.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Cause & Effect",
    question: `Why does the NORTH COAST of Jamaica receive MORE rainfall than the south coast?`,
    options: [
      "The south coast has more rivers",
      "The north coast is closer to the sea",
      "Moisture-laden northeast trade winds rise over the mountains, cool, and release rain on the north (windward) side — the south is in a rain shadow",
      "The north coast is at higher elevation",
    ],
    correctAnswer: 2,
    explanation: `This is the classic rain shadow effect: wet, windward north coast vs drier, leeward south coast — caused by the Blue Mountains intercepting moisture from trade winds.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Environmental Cause & Effect",
    question: `What is the MOST LIKELY effect of clearing forests on a hillside in Jamaica?`,
    options: [
      "Better air quality",
      "Increased rainfall",
      "Soil erosion, reduced water retention, and flooding — since tree roots no longer bind the soil or absorb rainfall",
      "Improved agricultural productivity for generations",
    ],
    correctAnswer: 2,
    explanation: `Trees protect soil — their roots hold it, their canopy slows rainfall impact. Remove them and rain washes topsoil away, rivers flood, and the land quickly loses productivity.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Spatial Relationships",
    question: `A student notices that MOST of Jamaica's large towns and cities are located on the coast or in valleys. What GEOGRAPHICAL REASON explains this pattern?`,
    options: [
      "Coastal areas are more interesting",
      "The government chose these locations randomly",
      "Coastal and valley locations offer flat land, access to water, and historically offered harbour access for trade — natural advantages that attracted settlement",
      "Mountains are too cold for towns",
    ],
    correctAnswer: 2,
    explanation: `Settlement patterns follow geographical logic — flat land for building, rivers for water, and harbours for trade. Jamaica's towns follow exactly this pattern.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Environmental Decision-Making",
    question: `A community wants to grow crops on a steep hillside. What environmental CONCERN should they have?`,
    options: [
      "Steep hillsides are always the best for farming",
      "Steep hillside farming always increases yields",
      "Farming on steep slopes without terracing causes severe soil erosion — rain washes the topsoil downhill, reducing fertility and causing downstream flooding",
      "There are no concerns with hillside farming",
    ],
    correctAnswer: 2,
    explanation: `Slope agriculture requires careful management (terracing, contour planting) to prevent erosion. Without it, the topsoil — the productive layer — washes away within years.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Land Use",
    question: `WHY is ST. ELIZABETH known as Jamaica's 'breadbasket'?`,
    options: [
      "It has the most bakeries",
      "It is the flattest parish",
      "Its fertile soils, favourable rainfall patterns, and irrigation from rivers make it Jamaica's most productive agricultural parish",
      "It has the largest population",
    ],
    correctAnswer: 2,
    explanation: `St. Elizabeth's combination of fertile soils, the Black River irrigation system, and favourable growing conditions make it Jamaica's leading producer of fruits and vegetables.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Map Analysis",
    question: `On a topographic map, CLOSELY SPACED contour lines indicate:`,
    options: [
      "Flat, gently sloping land",
      "Very steep terrain",
      "A valley",
      "A water body",
    ],
    correctAnswer: 1,
    explanation: `The closer contour lines are, the more rapidly the elevation changes over a short distance — indicating steep terrain. Widely spaced contours show gentle slopes.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Environmental Impact",
    question: `How does CORAL REEF BLEACHING affect Jamaica's fishing communities?`,
    options: [
      "It improves fish catches",
      "It has no effect on fish",
      "Bleaching kills the reef ecosystem — fish lose habitat and breeding grounds, reducing catches and threatening the livelihoods of fishing families",
      "Bleaching only affects tourism",
    ],
    correctAnswer: 2,
    explanation: `Coral reefs are 'nurseries of the sea' — they support 25% of marine species. When reefs die, fish populations collapse, devastating fishing communities who depend on healthy reefs.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Spatial Analysis",
    question: `Jamaica's KINGSTON HARBOUR is one of the world's largest natural harbours. How has this geographical feature influenced Kingston's development?`,
    options: [
      "The harbour had no influence on Kingston",
      "It made Kingston difficult to develop",
      "It made Kingston the natural centre for commerce and shipping — the harbour's size and depth allowed large vessels to dock, driving the city's growth as Jamaica's commercial and political capital",
      "The harbour is only used by fishing boats",
    ],
    correctAnswer: 2,
    explanation: `Kingston's harbour was its reason for becoming capital — deep water for large ships, a protected bay, and a central location on the south coast made it the logical hub for trade and governance.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Climate & Human Activity",
    question: `Why do farmers in Jamaica's INTERIOR PARISHES often use IRRIGATION?`,
    options: [
      "Interior parishes receive too much rain",
      "Irrigation is always needed in tropical climates",
      "The mountainous interior and southern parishes can be significantly drier (rain shadow effect) — irrigation compensates for lower rainfall to enable crop production",
      "Interior farming does not need water",
    ],
    correctAnswer: 2,
    explanation: `Irrigation in interior and southern Jamaica compensates for the rain shadow effect. Parishes like Clarendon and St. Elizabeth use irrigation schemes (like the Black River) for sugar and vegetable production.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Applying Civic Knowledge",
    question: `A student wants to report a pothole on her street. Which level of government should she contact?`,
    options: [
      "The Governor General",
      "The Prime Minister's office",
      "The Parish Council — which is responsible for local road maintenance",
      "The Senate",
    ],
    correctAnswer: 2,
    explanation: `Parish Councils manage local infrastructure including roads, drains, and public spaces. Local problems go to local government.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Evaluating Rights vs Duties",
    question: `A citizen refuses to pay taxes, arguing that it is his money. Which principle does this violate?`,
    options: [
      "The rule of law",
      "Freedom of movement",
      "The duty of citizens to contribute financially to the services that benefit everyone in society",
      "Freedom of religion",
    ],
    correctAnswer: 2,
    explanation: `Paying taxes is a civic duty — the collective funding of shared services like education, healthcare, and security. Refusing undermines the social contract.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government Function",
    question: `Why is the SEPARATION OF POWERS important in a democracy?`,
    options: [
      "It makes government more expensive",
      "It slows down decision-making unnecessarily",
      "It prevents any single branch from becoming too powerful — each branch checks and balances the others, protecting citizens from abuse of power",
      "It creates confusion in the system",
    ],
    correctAnswer: 2,
    explanation: `Without separation of powers, one branch could dominate all others. The three branches — Legislature (laws), Executive (governs), Judiciary (interprets) — check each other, preventing tyranny.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Applying Knowledge",
    question: `A new law is proposed in Parliament. What is the CORRECT SEQUENCE of events?`,
    options: [
      "Governor General signs it; Parliament debates it",
      "It becomes law immediately when proposed",
      "It is introduced, debated, possibly amended, voted on in both houses, and then given royal assent by the Governor General",
      "Citizens vote on every new law",
    ],
    correctAnswer: 2,
    explanation: `Laws follow a formal process: introduced as a 'Bill,' debated in the House, passed to the Senate, and after both houses agree, the Governor General gives assent — it then becomes law.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Rights & Responsibilities",
    question: `A newspaper publishes a false story that damages someone's reputation. Which right and responsibility are in CONFLICT?`,
    options: [
      "Freedom of movement vs the duty to pay taxes",
      "Freedom of speech vs the responsibility not to harm others through falsehood",
      "The right to education vs the duty to attend school",
      "Freedom of religion vs the duty to vote",
    ],
    correctAnswer: 1,
    explanation: `Freedom of expression is not absolute — it comes with the responsibility not to publish deliberate falsehoods that harm others. This is the basis of defamation law.`
  },
  {
    id: 26,
    type: "civics",
    skill: "CARICOM Analysis",
    question: `WHY would a Jamaican student BENEFIT from the CARICOM Single Market and Economy (CSME)?`,
    options: [
      "They can attend any Caribbean university for free",
      "They would not benefit",
      "As a skilled graduate, they could potentially work in any CARICOM member state without needing a work permit — accessing a larger regional job market",
      "They get discounts on travel within CARICOM",
    ],
    correctAnswer: 2,
    explanation: `The CSME allows free movement of skilled workers across member states — a university graduate could work in Barbados, Trinidad, or Guyana without complex visa or work permit applications.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Government Decision-Making",
    question: `The Prime Minister announces a new national hospital. Under which branch of government is this decision made?`,
    options: [
      "Judicial — the courts decide",
      "Legislative — Parliament votes on it",
      "Executive — the Cabinet and Prime Minister make policy decisions",
      "The Governor General decides alone",
    ],
    correctAnswer: 2,
    explanation: `Building a hospital is an Executive (policy implementation) decision — the Cabinet decides priorities and implementation. Parliament may approve the budget, but the decision is executive.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Evaluating Civic Behaviour",
    question: `Which of the following BEST demonstrates responsible citizenship?`,
    options: [
      "Voting only when you feel like it",
      "Ignoring community meetings",
      "Attending community meetings, voting in elections, obeying laws, and speaking up when something is wrong",
      "Paying taxes only when reminded",
    ],
    correctAnswer: 2,
    explanation: `Active, responsible citizenship goes beyond minimum compliance — it involves engagement with community, democratic participation, and civic voice.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rule of Law",
    question: `A government minister is caught misusing public funds. Under the rule of law, what should happen?`,
    options: [
      "Ministers are above the law",
      "The Prime Minister decides privately",
      "The minister should face the same legal process as any citizen — investigated, charged if evidence warrants, and tried in court",
      "The governor general pardons all ministers",
    ],
    correctAnswer: 2,
    explanation: `The rule of law applies equally to everyone — no one is above it, including ministers. Equal application of law is the foundation of democratic governance.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Constitutional Analysis",
    question: `WHY does Jamaica's Constitution require a TWO-THIRDS MAJORITY to change it?`,
    options: [
      "To make Parliament meetings longer",
      "Because two-thirds is a random requirement",
      "To prevent hasty or politically motivated changes to the supreme law — requiring broad consensus ensures only widely supported changes are made",
      "Because the Governor General demanded it",
    ],
    correctAnswer: 2,
    explanation: `A supermajority requirement ensures constitutional changes reflect genuine national consensus — not just a slim political majority's preferences. It protects fundamental rights from easy erosion.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Reasoning",
    question: `A Jamaican farmer can either sell sugar cane to the factory OR use the land to grow vegetables. This decision is an example of:`,
    options: [
      "A trade-off — the farmer must give up one option to pursue another",
      "An import decision",
      "A government subsidy",
      "A CARICOM agreement",
    ],
    correctAnswer: 0,
    explanation: `Economic decisions always involve trade-offs — choosing to do X means forgoing Y. The farmer's opportunity cost of growing vegetables is the income from sugar cane.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Supply & Demand",
    question: `When the price of tomatoes rises sharply in Jamaica, farmers MOST LIKELY will:`,
    options: [
      "Grow fewer tomatoes",
      "Grow more tomatoes — higher prices incentivise increased production",
      "Buy more tomatoes",
      "Leave farming",
    ],
    correctAnswer: 1,
    explanation: `Higher prices signal greater profitability — rational farmers respond by increasing production of the more profitable crop, which over time tends to bring prices back down (supply increases).`
  },
  {
    id: 33,
    type: "economics",
    skill: "Impact of Tourism",
    question: `A new resort opens in a coastal community. Which community member is MOST DIRECTLY economically affected?`,
    options: [
      "A farmer in the interior",
      "A teacher in Kingston",
      "A food vendor, taxi driver, and craft seller near the resort",
      "A government minister",
    ],
    correctAnswer: 2,
    explanation: `Tourism creates direct economic activity around the resort — local food vendors, transport providers, craft sellers, and tour guides are the most immediate economic beneficiaries.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Trade-offs",
    question: `Jamaica imports more than it exports, creating a trade deficit. What is the MOST LIKELY CONSEQUENCE?`,
    options: [
      "Jamaica becomes richer",
      "The Jamaican dollar tends to strengthen",
      "Jamaica must use its foreign exchange reserves to pay for excess imports — putting pressure on the currency and potentially leading to currency depreciation",
      "Trade deficits always benefit small countries",
    ],
    correctAnswer: 2,
    explanation: `A persistent trade deficit drains foreign exchange — Jamaica must use reserves or borrow to pay for imports that exceed export earnings, creating downward pressure on the dollar.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Economic Reasoning",
    question: `A student wins $50,000 in a school competition. She must choose between: buying a new phone OR depositing the money in a credit union. What is her OPPORTUNITY COST if she buys the phone?`,
    options: [
      "The $50,000 itself",
      "The interest and savings she would have earned by depositing it",
      "The cost of the phone",
      "There is no opportunity cost",
    ],
    correctAnswer: 1,
    explanation: `Opportunity cost is what you give up by choosing one option. By buying the phone, she forgoes the interest/dividends the money would have earned and the security of savings.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Community Development",
    question: `A community installs solar panels for the village primary school. This is MOST LIKELY funded by:`,
    options: [
      "The school's own profits",
      "A combination of government grants, NGO support, and community fundraising",
      "Only the Ministry of Education",
      "Only private corporations",
    ],
    correctAnswer: 2,
    explanation: `Community-scale renewable energy projects in Jamaica are typically financed through combinations of government grants, international NGOs, development banks, and local fundraising — rarely through a single source.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A young Jamaican starts a business making natural soaps from local herbs. Her BIGGEST advantage over imported soaps is:`,
    options: [
      "Her soap is always cheaper",
      "She uses imported ingredients",
      "Using local ingredients reduces costs, allows her to market authenticity and uniqueness, and keeps money circulating within the Jamaican economy",
      "She has no advantages",
    ],
    correctAnswer: 2,
    explanation: `Local sourcing reduces import costs, enables a unique authenticity story ('made in Jamaica, from Jamaican ingredients'), and builds supply chains that benefit other local producers.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Cause & Effect",
    question: `When Jamaica's economy GROWS (GDP increases), which of the following is MOST LIKELY to happen?`,
    options: [
      "Unemployment rises",
      "Government tax revenues fall",
      "More people are employed and government tax revenues increase, allowing more spending on public services",
      "Tourism automatically decreases",
    ],
    correctAnswer: 2,
    explanation: `Economic growth typically increases employment (more businesses need workers) and tax revenue (more income and sales to tax) — enabling government to invest more in services.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Financial Literacy",
    question: `A student borrows $5,000 at 15% annual interest. How much interest does she owe after one year?`,
    options: [
      "$500",
      "$650",
      "$750",
      "$5,750",
    ],
    correctAnswer: 2,
    explanation: `15% of $5,000 = $750. She owes $750 in interest after one year (and still owes the $5,000 principal — total repayment = $5,750).`
  },
  {
    id: 40,
    type: "economics",
    skill: "Economic Reasoning",
    question: `Jamaica earns significant foreign exchange from REMITTANCES. What RISK does heavy dependence on remittances create?`,
    options: [
      "No risk — remittances are always reliable",
      "Remittances always increase",
      "If economic conditions worsen in the countries where the diaspora lives (like a recession in the UK or USA), remittance flows may fall — leaving families and the economy vulnerable",
      "Remittances only benefit the government",
    ],
    correctAnswer: 2,
    explanation: `Remittance dependence creates vulnerability — when the US or UK economies slow, unemployment rises in the diaspora and money sent home declines. External economic shocks flow directly into Jamaican households.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMod1Questions : g5SsMod1Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 1",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 1</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 1</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 1</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
