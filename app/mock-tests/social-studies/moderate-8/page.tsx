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

const g5SsMod8Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Historical Evidence",
    question: `A photograph taken during the 1938 labour unrest shows workers gathered outside a factory. What can the photograph BEST provide?`,
    options: [
      "Evidence about people, place and conditions at one moment during the unrest.",
      "Evidence proving that the same workers took part in every protest across Jamaica.",
      "A complete explanation of the economic and political causes of the labour unrest.",
      "A complete record of what workers and employers thought about every issue.",
    ],
    correctAnswer: 0,
    explanation: `The photograph is direct visual evidence of one moment, but other sources are needed to explain the full event and different viewpoints.`
  },
  {
    id: 2,
    type: "history",
    skill: "Archaeological Evidence",
    question: `Archaeologists find pottery fragments and stone tools at a Taíno site. What can these artefacts help historians learn?`,
    options: [
      "The precise weather conditions on each day when the settlement was occupied.",
      "Some activities, technologies and ways of life used by people at the settlement.",
      "The exact thoughts and names of every person who lived at the settlement.",
      "The complete history of every Taíno settlement elsewhere in the Caribbean.",
    ],
    correctAnswer: 1,
    explanation: `Artefacts can provide evidence about everyday activities and technology, but they cannot reveal every personal or historical detail.`
  },
  {
    id: 3,
    type: "history",
    skill: "Colonial History",
    question: `What major change occurred in Jamaica in 1655?`,
    options: [
      "Apprenticeship ended and full freedom came.",
      "Universal Adult Suffrage was introduced.",
      "English forces captured Jamaica from Spain.",
      "Jamaica gained independence from Britain.",
    ],
    correctAnswer: 2,
    explanation: `English forces captured Jamaica from Spain in 1655, beginning the period of British colonial rule.`
  },
  {
    id: 4,
    type: "history",
    skill: "Emancipation",
    question: `Which statement correctly distinguishes 1834 from 1838 in Jamaica?`,
    options: [
      "Full freedom came in 1834; Apprenticeship was introduced for the first time in 1838.",
      "Jamaica became independent in 1834; representative government began in 1838.",
      "Universal Adult Suffrage began in 1834; the first general election followed in 1838.",
      "Slavery was legally abolished in 1834; Apprenticeship ended and full freedom came in 1838.",
    ],
    correctAnswer: 3,
    explanation: `Legal abolition in 1834 was followed by Apprenticeship, which ended in 1838.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is Paul Bogle remembered as an important figure in Jamaican history?`,
    options: [
      "He led protest connected to serious grievances about poverty, justice and political treatment.",
      "He led negotiations that resulted directly in Jamaica's Independence in 1962.",
      "He organised the 1938 labour movement and introduced Universal Adult Suffrage.",
      "He represented Jamaica at the meeting that established CARICOM in 1973.",
    ],
    correctAnswer: 0,
    explanation: `Bogle's leadership at Morant Bay became a powerful symbol of resistance to injustice in colonial Jamaica.`
  },
  {
    id: 6,
    type: "history",
    skill: "Political Advocacy",
    question: `Why is George William Gordon associated with the struggle for justice in colonial Jamaica?`,
    options: [
      "He became Jamaica’s first Prime Minister when colonial government ended.",
      "He advocated publicly for poorer Jamaicans and was unjustly executed after Morant Bay.",
      "He organised the Baptist War and negotiated directly for legal abolition.",
      "He commanded the Windward Maroons and negotiated their treaty with Britain.",
    ],
    correctAnswer: 1,
    explanation: `Gordon advocated for poorer Jamaicans, and his execution after Morant Bay became an example of colonial injustice.`
  },
  {
    id: 7,
    type: "history",
    skill: "National Heroes",
    question: `Which uprising is most closely associated with Sam Sharpe?`,
    options: [
      "The labour unrest that spread across Jamaica in 1938",
      "The Maroon resistance led from the mountains",
      "The Baptist War, also called the Christmas Rebellion",
      "The Morant Bay Rebellion led from St Thomas",
    ],
    correctAnswer: 2,
    explanation: `Sam Sharpe helped organise the 1831 uprising known as the Baptist War or Christmas Rebellion.`
  },
  {
    id: 8,
    type: "history",
    skill: "Resistance",
    question: `Why is Nanny of the Maroons recognised as a National Hero?`,
    options: [
      "She led Jamaica's campaign for Universal Adult Suffrage during the twentieth century.",
      "She served in Parliament and helped establish Jamaica's modern political parties.",
      "She organised workers during the 1938 labour unrest.",
      "She provided leadership in Maroon resistance and helped defend the freedom of her people.",
    ],
    correctAnswer: 3,
    explanation: `Nanny is remembered for leadership and resistance by the Windward Maroons against British colonial forces.`
  },
  {
    id: 9,
    type: "history",
    skill: "National Identity",
    question: `Why can national symbols be important to a country?`,
    options: [
      "They can express shared history and values without suggesting that citizens are identical.",
      "They establish that citizens share the same family history and cultural traditions.",
      "They provide a complete national history without support from other sources.",
      "They identify government property but have little connection with national identity.",
    ],
    correctAnswer: 0,
    explanation: `National symbols can express important aspects of a country's identity without suggesting that all citizens are identical.`
  },
  {
    id: 10,
    type: "history",
    skill: "Evaluating Sources",
    question: `A textbook and an old newspaper disagree about why an event happened. What is the BEST response?`,
    options: [
      "Reject both sources because disagreement means neither can contain useful evidence.",
      "Compare the evidence, date, purpose and perspective of both sources before deciding.",
      "Use the newspaper because a source written earlier must contain the complete explanation.",
      "Use the textbook because a source written later must always be more accurate.",
    ],
    correctAnswer: 1,
    explanation: `Sources can differ because of evidence, purpose and perspective, so careful comparison is needed.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Scale",
    question: `A delivery map uses a scale of 1 cm to 6 km. The route between two depots measures 3 cm. How long is the actual route?`,
    options: [
      "36 km",
      "9 km",
      "18 km",
      "24 km",
    ],
    correctAnswer: 2,
    explanation: `Three centimetres multiplied by 6 kilometres per centimetre gives 18 kilometres.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Direction",
    question: `A farm is northeast of a village. In which direction is the village from the farm?`,
    options: [
      "Northwest",
      "Northeast",
      "Southeast",
      "Southwest",
    ],
    correctAnswer: 3,
    explanation: `Southwest is opposite northeast.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Relief",
    question: `What do closely spaced contour lines usually show on a map?`,
    options: [
      "A steep slope",
      "A broad flat plain",
      "A political boundary",
      "A coastal reef",
    ],
    correctAnswer: 0,
    explanation: `Closely spaced contours show that elevation changes rapidly over a short horizontal distance.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Water Resources",
    question: `A community is planning for a dry season. Which information would be MOST useful?`,
    options: [
      "Recent tourism-arrival and hotel-occupancy records",
      "Recent rainfall, river-flow and reservoir-level records",
      "Recent population and school-attendance records",
      "Recent road-traffic and vehicle-registration records",
    ],
    correctAnswer: 1,
    explanation: `Rainfall and water-level information provides direct evidence about available water and changing conditions.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Wetlands",
    question: `A wetland is drained to build houses. Which risk should planners consider carefully?`,
    options: [
      "Lower rainfall because buildings prevent clouds from forming over the area.",
      "Greater river depth because drainage creates new permanent water storage.",
      "Loss of habitat and greater flood risk because the wetland stores less water.",
      "Reduced road traffic because houses are built closer to one another.",
    ],
    correctAnswer: 2,
    explanation: `Wetlands provide habitat and can store water, so removing them may increase flood and ecosystem risks.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Tourism and Environment",
    question: `A coastal hotel produces more waste than the local system can handle. What is the BEST response?`,
    options: [
      "Increase visitor numbers first and plan additional waste handling only after pollution is observed.",
      "Reduce waste collection near the hotel so other communities receive more collection services.",
      "Move the waste to an undeveloped coastal area where fewer people will see it.",
      "Improve waste management so tourism can continue without damaging the coastal environment.",
    ],
    correctAnswer: 3,
    explanation: `Responsible tourism requires managing waste so economic activity does not damage the environment on which communities and visitors depend.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Urbanisation",
    question: `A town's population grows quickly. Which pressure is MOST likely if services do not expand?`,
    options: [
      "Greater demand for housing, transport, water and waste collection",
      "Lower demand for housing because population growth reduces settlement",
      "Less traffic because growing towns require fewer transport services",
      "Reduced waste because larger populations use fewer goods and services",
    ],
    correctAnswer: 0,
    explanation: `Rapid urban growth can increase demand for infrastructure and public services.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Hazards",
    question: `A hurricane evacuation map shows one route crossing a flood-prone bridge and another route leading inland on higher ground. Which route is safer during storm-surge risk?`,
    options: [
      "The bridge route because routes nearest the coast are safest during surge.",
      "The higher inland route, once officials confirm that it is open and safe.",
      "The bridge route because it is shorter even though floodwater may cover it.",
      "Either route because storm surge does not affect transport routes.",
    ],
    correctAnswer: 1,
    explanation: `A safe evacuation route should move people away from low-lying storm-surge areas while following official guidance.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Agriculture and Environment",
    question: `A farmer must choose which crop is best suited to a field. Which information is MOST useful?`,
    options: [
      "The parish motto and national symbols",
      "The number of classrooms in the nearest school",
      "Rainfall, soil, elevation and available water",
      "Nearby shop opening times and road names",
    ],
    correctAnswer: 2,
    explanation: `Crop suitability depends strongly on environmental conditions such as rainfall, soil, elevation and water availability.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Coastal Conservation",
    question: `A beach is losing sand rapidly. Which response is MOST responsible?`,
    options: [
      "Move sand from another public beach before investigating why erosion is occurring.",
      "Remove remaining coastal vegetation so waves can reach the beach more easily.",
      "Build new structures on the most eroded area before monitoring further change.",
      "Investigate the causes and select suitable coastal-management measures based on evidence.",
    ],
    correctAnswer: 3,
    explanation: `Coastal management should begin with evidence about the causes and avoid actions that may worsen erosion.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Branches of Government",
    question: `Which statement correctly compares Parliament and the courts?`,
    options: [
      "Parliament makes laws, while courts interpret and apply laws in cases.",
      "Courts make national laws, while Parliament decides individual court cases.",
      "Parliament and the courts perform the same constitutional role.",
      "Municipal Corporations make national laws, while courts approve local budgets.",
    ],
    correctAnswer: 0,
    explanation: `Parliament is part of the law-making process, while courts apply and interpret laws in legal cases.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Local Government",
    question: `Residents want repairs to a local market roof and drains. Which body should they most directly approach?`,
    options: [
      "The Municipal Corporation/local authority, responsible for many local facilities and services",
      "The Caribbean Examinations Council, responsible for regional examinations and qualifications",
      "The Bank of Jamaica, responsible for the country’s central banking and monetary functions",
      "The CARICOM Secretariat, which supports the work of the Caribbean Community",
    ],
    correctAnswer: 1,
    explanation: `Municipal Corporations/local authorities are responsible for many local facilities and services.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Democratic Participation",
    question: `Which action is an example of lawful democratic participation?`,
    options: [
      "Attend a peaceful public meeting and present a view to decision-makers.",
      "Prevent residents with competing proposals from entering the meeting.",
      "Damage a public office to compel officials to discuss the proposal.",
      "Threaten election workers until they agree to reconsider the decision.",
    ],
    correctAnswer: 2,
    explanation: `Peaceful participation is a lawful way for citizens to express views and influence public decisions.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Fair Hearing",
    question: `Which action BEST demonstrates a fair hearing?`,
    options: [
      "Explain the allegation after punishment has already been decided.",
      "Allow only the person making the accusation to present evidence.",
      "Use a decision-maker who has already publicly chosen one side.",
      "Explain the allegation, allow a response and use an impartial decision-maker.",
    ],
    correctAnswer: 3,
    explanation: `A fair process requires notice of the case, an opportunity to respond and impartial decision-making.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Elections",
    question: `A polling place provides screens so voters can mark ballots privately. Which democratic safeguard do the screens support?`,
    options: [
      "It protects the privacy of each voter's choice.",
      "It allows election workers to decide which votes remain private.",
      "It prevents candidates from knowing the total number of votes cast.",
      "It replaces the need for rules governing how elections are conducted.",
    ],
    correctAnswer: 0,
    explanation: `Ballot secrecy protects voter privacy and helps reduce improper pressure over how a person votes.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Accountability",
    question: `A ministry publishes a report showing how project funds were spent. Which principle does this support?`,
    options: [
      "Regional integration",
      "Accountability",
      "Representation",
      "Judicial independence",
    ],
    correctAnswer: 1,
    explanation: `Providing information about the use of public funds supports accountability.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Rights",
    question: `Which statement about freedom of expression is MOST accurate?`,
    options: [
      "Only elected officials have freedom of expression when discussing public issues.",
      "Freedom of expression means other people must agree with the view expressed.",
      "People may express views lawfully, but the right operates alongside laws and the rights of others.",
      "People may express any statement in any way because the right has no lawful limits.",
    ],
    correctAnswer: 2,
    explanation: `Freedom of expression is protected, but rights operate within the law and alongside the rights of others.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Regional Cooperation",
    question: `Why might Caribbean countries cooperate on health, education or disaster preparedness?`,
    options: [
      "Cooperation transfers responsibility for every national service to one regional government.",
      "Cooperation requires every Caribbean country to use identical laws and programmes.",
      "Cooperation matters only when countries face problems outside the Caribbean.",
      "Shared challenges can be addressed through pooled knowledge, planning and resources.",
    ],
    correctAnswer: 3,
    explanation: `Regional cooperation can improve planning, knowledge-sharing and response when countries face related challenges.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Petitions",
    question: `Why might residents submit a petition to a public authority?`,
    options: [
      "To present a concern or request and show support for asking the authority to act.",
      "To replace the authority's legal decision-making process with the petition result.",
      "To require a court to decide the issue without hearing evidence.",
      "To make the requested change become law as soon as signatures are collected.",
    ],
    correctAnswer: 0,
    explanation: `A petition is a lawful way to present concerns or requests to decision-makers.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Representation",
    question: `A representative must decide whether to support a community proposal. What should the representative consider?`,
    options: [
      "The view of the first constituent who contacts the representative",
      "The quality of the proposal’s advertising and the popularity of its slogan",
      "Evidence, public needs, legal duties and the views of constituents",
      "The personal benefit that the representative expects to receive",
    ],
    correctAnswer: 1,
    explanation: `Responsible representation requires consideration of evidence, public needs, lawful duties and constituent concerns.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Household Decisions",
    question: `A family has limited money and must choose between repairing the refrigerator and buying a new television. The refrigerator is needed to keep food safe. Which choice is more sensible?`,
    options: [
      "Buy both immediately and decide later how to cover the resulting shortage.",
      "Postpone both purchases even though food is being lost because of the refrigerator.",
      "Repair the refrigerator first because it meets an important household need.",
      "Buy the television first because entertainment is useful after work and school.",
    ],
    correctAnswer: 2,
    explanation: `When money is limited, an essential household need should usually receive priority over an optional want.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Supply and Demand",
    question: `A disease reduces the number of eggs supplied to market while demand stays similar. What may happen to egg prices?`,
    options: [
      "Prices may fall because fewer eggs always cause buyers to demand more.",
      "Prices should remain unchanged because supply does not affect markets.",
      "Prices must become zero because the disease has reduced production.",
      "Prices may rise because fewer eggs are available to meet similar demand.",
    ],
    correctAnswer: 3,
    explanation: `Reduced supply with similar demand can place upward pressure on prices.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Local Economic Linkages",
    question: `A resort buys fruit from farmers in nearby communities. What is one likely benefit?`,
    options: [
      "Local farmers may earn income from supplying goods used by the resort.",
      "Local farmers may lose their local customers because all produce must go to the resort.",
      "The resort may stop employing workers because it now buys food locally.",
      "The purchase turns the farmers into employees of the tourism ministry.",
    ],
    correctAnswer: 0,
    explanation: `Buying locally can spread tourism spending to farmers and other nearby businesses.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Public Spending",
    question: `Why might government spend money repairing a major public road?`,
    options: [
      "A repaired road ensures that transport costs become the same for every traveller.",
      "The road supports movement to jobs, markets, schools, health services and other activities.",
      "The road mainly benefits the contractor, so public use is not an important consideration.",
      "Road repairs remove the need to maintain other forms of public infrastructure.",
    ],
    correctAnswer: 1,
    explanation: `Transport infrastructure supports many public and economic activities.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Financial Institutions",
    question: `Which service might a credit union provide to its members?`,
    options: [
      "Passport and visa processing",
      "National tax collection",
      "Savings accounts and loans",
      "National currency printing",
    ],
    correctAnswer: 2,
    explanation: `Credit unions are member-based financial institutions that commonly provide savings and loan services.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Trade",
    question: `A Jamaican company sells rum to a buyer in Canada. For Jamaica, the rum is:`,
    options: [
      "A Jamaican import purchased from an overseas producer",
      "A remittance sent by a worker to relatives in Jamaica",
      "A subsidy paid to reduce a producer’s operating cost",
      "A Jamaican export sold to an overseas buyer",
    ],
    correctAnswer: 3,
    explanation: `A good produced in Jamaica and sold abroad is an export.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Budgeting",
    question: `What is the MAIN purpose of a household budget?`,
    options: [
      "To plan how income will be used for expenses, saving and other priorities",
      "To record spending only after all available income has already been used",
      "To increase household income by listing every expense in one place",
      "To remove the need to choose between competing household priorities",
    ],
    correctAnswer: 0,
    explanation: `A budget helps a household plan how limited income will be allocated.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Community Costs",
    question: `A factory pollutes a river used by fishers and nearby families. Which cost may fall on the wider community?`,
    options: [
      "The business cost of replacing furniture in its administrative office",
      "The factory’s contractual wage payments to its production employees",
      "Reduced fish catches and poorer water for people using the river",
      "The factory’s sales income from goods produced before the pollution",
    ],
    correctAnswer: 1,
    explanation: `Pollution can create economic and environmental costs for people who did not cause it.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Cooperatives",
    question: `Why might small farmers form a cooperative to purchase supplies?`,
    options: [
      "They may remove the need for individual farms to plan how supplies will be used.",
      "They may transfer ownership of all farms to whichever member buys the supplies.",
      "They may combine buying power and share some purchasing or transport costs.",
      "They may avoid comparing prices because cooperative purchases use a fixed national price.",
    ],
    correctAnswer: 2,
    explanation: `Working together can strengthen buying power and allow members to share some costs or services.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Saving",
    question: `A household keeps an emergency savings fund. What is its MAIN purpose?`,
    options: [
      "To replace money normally used for regular monthly expenses",
      "To provide extra money that should be spent whenever income increases",
      "To avoid planning for costs that the household can already predict",
      "To help meet unexpected expenses without immediately depending on new borrowing",
    ],
    correctAnswer: 3,
    explanation: `Emergency savings cushion a household against unplanned costs and can reduce the need for immediate borrowing.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod8Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod8Questions)
      : prepareSocialStudiesPreview(g5SsMod8Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 8",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 8</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 8</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 8</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
