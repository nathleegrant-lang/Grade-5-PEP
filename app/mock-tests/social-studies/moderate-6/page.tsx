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

const g5SsMod6Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Historical Evidence",
    question: `A historian finds a letter written by a Jamaican worker during the 1938 labour unrest. Why is the letter useful?`,
    options: [
      "It gives first-hand evidence of one worker's experiences and views.",
      "It tells historians everything that happened across Jamaica.",
      "It is automatically more accurate than every later source.",
      "It proves every worker had exactly the same experience.",
    ],
    correctAnswer: 0,
    explanation: `A letter written at the time can provide first-hand evidence, but historians should still compare it with other sources.`
  },
  {
    id: 2,
    type: "history",
    skill: "Chronology",
    question: `Which sequence places these events in the correct order?`,
    options: [
      "Morant Bay Rebellion → Baptist War → 1938 labour unrest → Independence",
      "Baptist War → Morant Bay Rebellion → 1938 labour unrest → Independence",
      "1938 labour unrest → Baptist War → Independence → Morant Bay Rebellion",
      "Baptist War → Independence → Morant Bay Rebellion → 1938 labour unrest",
    ],
    correctAnswer: 1,
    explanation: `The Baptist War occurred in 1831–32, Morant Bay in 1865, labour unrest in 1938, and Independence in 1962.`
  },
  {
    id: 3,
    type: "history",
    skill: "Emancipation",
    question: `Why did the end of Apprenticeship in 1838 matter to formerly enslaved Jamaicans?`,
    options: [
      "It ended Apprenticeship and brought full freedom.",
      "It ended colonial rule and established Jamaica as a sovereign state.",
      "It widened voting rights for qualified Jamaican adults.",
      "It created a regional organisation for Caribbean cooperation.",
    ],
    correctAnswer: 0,
    explanation: `Apprenticeship followed legal abolition in 1834 and ended in 1838, when full freedom came.`
  },
  {
    id: 4,
    type: "history",
    skill: "Cause and Effect",
    question: `Which change followed the 1938 labour unrest and helped widen political participation in Jamaica?`,
    options: [
      "The creation of CARICOM in 1973",
      "The abolition of Parliament",
      "The end of all trade with Britain",
      "Universal Adult Suffrage in 1944",
    ],
    correctAnswer: 3,
    explanation: `The labour unrest helped build pressure for political reform, including Universal Adult Suffrage in 1944.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is the Morant Bay Rebellion important in Jamaica's history?`,
    options: [
      "It immediately ended plantation slavery during the rebellion.",
      "It exposed social injustice and was followed by major changes in colonial government.",
      "It established the political parties that later contested national elections.",
      "It transferred responsibility for Jamaica from Britain to CARICOM.",
    ],
    correctAnswer: 1,
    explanation: `The rebellion highlighted deep grievances over poverty, justice and political power and was followed by major changes in colonial rule.`
  },
  {
    id: 6,
    type: "history",
    skill: "Heritage Preservation",
    question: `A community records oral histories from older residents about traditional celebrations. What is the MAIN heritage benefit?`,
    options: [
      "It ensures later generations practise each celebration in exactly the same form.",
      "It preserves personal memories and knowledge that might otherwise be lost.",
      "It establishes that each remembered detail is accurate without comparison.",
      "It gives a complete account that makes other historical sources unnecessary.",
    ],
    correctAnswer: 1,
    explanation: `Recording oral histories helps preserve memories and experiences that may not exist in written records.`
  },
  {
    id: 7,
    type: "history",
    skill: "Comparing Leaders",
    question: `A class compares the work of Norman Manley and Alexander Bustamante. Which conclusion identifies an important contribution they shared?`,
    options: [
      "Both supported greater self-government and wider political participation.",
      "Both organised Maroon resistance against British forces in the eighteenth century.",
      "Both served as colonial governors appointed to administer Jamaica.",
      "Both campaigned against extending voting rights to Jamaican adults.",
    ],
    correctAnswer: 0,
    explanation: `Both men played major roles in Jamaica's twentieth-century political development despite leading different political movements.`
  },
  {
    id: 8,
    type: "history",
    skill: "Source Reliability",
    question: `Two accounts describe the same protest differently. What should a careful student do?`,
    options: [
      "Accept the account written closest to the protest without further comparison.",
      "Compare each account’s creator, date, purpose and supporting evidence.",
      "Combine the accounts as if every detail in both must be equally reliable.",
      "Select the account with the strongest language because it shows greater confidence.",
    ],
    correctAnswer: 1,
    explanation: `Comparing origin, purpose and evidence helps a student judge why accounts may differ.`
  },
  {
    id: 9,
    type: "history",
    skill: "Cultural Change",
    question: `Which example BEST shows how history can influence Jamaican culture today?`,
    options: [
      "National observances can connect Emancipation history with cultural identity today.",
      "Family traditions across Jamaica developed in the same way from Emancipation.",
      "Modern customs are fixed by history and cannot respond to later influences.",
      "Museum displays are the main place where culture can continue after Emancipation.",
    ],
    correctAnswer: 0,
    explanation: `Public remembrance can connect past struggles and achievements with present cultural identity.`
  },
  {
    id: 10,
    type: "history",
    skill: "Migration",
    question: `A Jamaican moved to Britain in the 1950s because jobs were being advertised there and employment at home was limited. Which explanation BEST fits the decision?`,
    options: [
      "Limited opportunity at home was the main influence, while overseas jobs played little part.",
      "Overseas job advertisements were the main influence, while conditions at home played little part.",
      "Limited opportunity at home and advertised employment abroad both influenced the decision.",
      "The move was mainly cultural because economic conditions did not affect migration.",
    ],
    correctAnswer: 2,
    explanation: `Limited opportunity can push a person away while employment elsewhere can pull the person toward another country.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Scale",
    question: `On a map, 2 cm represents 8 km. Two places are 5 cm apart. What is their actual distance?`,
    options: [
      "40 km",
      "10 km",
      "20 km",
      "32 km",
    ],
    correctAnswer: 2,
    explanation: `One centimetre represents 4 km, so 5 cm represents 20 km.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Direction",
    question: `A clinic is southeast of a school. In which direction is the school from the clinic?`,
    options: [
      "Southwest",
      "Southeast",
      "Northeast",
      "Northwest",
    ],
    correctAnswer: 3,
    explanation: `Northwest is the opposite direction from southeast.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Watersheds",
    question: `Why can removing forest from steep mountain slopes affect communities downstream?`,
    options: [
      "It can increase runoff, erosion and sediment carried into rivers.",
      "It can reduce runoff because bare slopes absorb more rainfall than forest soil.",
      "It can improve downstream water quality by moving loose soil into rivers.",
      "It can reduce erosion because fewer roots remain to disturb the steep soil.",
    ],
    correctAnswer: 0,
    explanation: `Tree roots and vegetation help hold soil and slow runoff, so clearing steep slopes can increase erosion.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Human Geography",
    question: `A new highway greatly shortens travel time to a rural community. Which change is MOST likely over time?`,
    options: [
      "The community may lose businesses because shorter travel times reduce access to markets.",
      "Businesses and settlement may grow because access to jobs, services and markets improves.",
      "Farming may end because highways prevent produce from reaching nearby towns.",
      "Rainfall may change because faster road travel alters the local climate.",
    ],
    correctAnswer: 1,
    explanation: `Improved transport can increase access to markets, jobs and services and may encourage development.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Mangroves",
    question: `Fishers support protecting a mangrove area. Which reason BEST explains their interest?`,
    options: [
      "Mangrove roots provide nursery habitat for many young marine animals.",
      "Mangrove roots deepen every harbour and create new fishing grounds offshore.",
      "Mangroves provide the same habitat as coral reefs, making reef protection less important.",
      "Mangroves support adult fish mainly by preventing them from moving into open water.",
    ],
    correctAnswer: 0,
    explanation: `Mangroves provide important nursery habitat and can therefore support nearby fisheries.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Hurricane Planning",
    question: `A coastal community lies in a storm-surge zone. Which planning decision BEST reduces risk?`,
    options: [
      "Place shelters close to the shoreline so residents can observe changing sea conditions.",
      "Identify evacuation routes to safer higher ground before hurricane season.",
      "Delay evacuation planning until officials know which homes have begun to flood.",
      "Direct residents along the shortest roads even when those roads cross low-lying areas.",
    ],
    correctAnswer: 1,
    explanation: `Planning safe evacuation routes before a storm helps people move away from storm-surge danger.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Land Use",
    question: `A town wants to build houses on land that floods almost every rainy season. What information is MOST important before approval?`,
    options: [
      "The style and cost of roofing preferred by likely home buyers",
      "The site’s flood history, drainage capacity and elevation",
      "The distance from the site to shops that sell household furniture",
      "The number of recreational facilities planned for the development",
    ],
    correctAnswer: 1,
    explanation: `Flood history and site conditions help planners judge risk to people and property.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Caribbean Geography",
    question: `Why can hurricanes affect several Caribbean countries during one season?`,
    options: [
      "Caribbean islands lie within the same hurricane-prone region and storms cross borders.",
      "Caribbean islands have matching daily weather, so hazards develop at the same time.",
      "Hurricanes develop mainly over islands and then move between neighbouring land areas.",
      "National boundaries direct storms along routes that pass through several countries.",
    ],
    correctAnswer: 0,
    explanation: `Storm systems move across the wider Caribbean region and are not stopped by political borders.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Population",
    question: `A parish has more people moving into its main town. Which service may need to expand if the trend continues?`,
    options: [
      "Schools, transport and waste-collection capacity",
      "Offshore fishing facilities and marine navigation charts",
      "Historic monuments and exhibits about earlier settlement",
      "Boundary markers showing the legal limits of the parish",
    ],
    correctAnswer: 0,
    explanation: `Population growth can increase demand for public services and infrastructure.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Conservation Evidence",
    question: `Students want to know whether a beach clean-up programme is working. Which evidence is BEST?`,
    options: [
      "Compare litter counts from the same beach sections before and after clean-ups.",
      "Compare attendance at clean-ups without measuring litter remaining on the beach.",
      "Compare photographs taken at different beaches after each clean-up event.",
      "Compare the number of activities offered to volunteers during the programme.",
    ],
    correctAnswer: 0,
    explanation: `Repeated comparable litter counts provide evidence of whether litter levels are changing.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Parliament",
    question: `Why are proposed laws debated in Parliament?`,
    options: [
      "So representatives can examine effects, raise concerns and consider changes.",
      "So representatives can transfer the final decision to a court before voting.",
      "So ministers can present proposals without questions from other representatives.",
      "So each proposal can take effect while Parliament is still debating its details.",
    ],
    correctAnswer: 0,
    explanation: `Parliamentary debate allows proposed laws to be examined before final decisions are made.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Local Government",
    question: `A public market has broken drains and overflowing garbage. Which body should residents MOST directly contact about these local services?`,
    options: [
      "The Municipal Corporation/local authority, which manages many local markets and waste services",
      "The Caribbean Examinations Council, which administers regional examinations and qualifications",
      "The CARICOM Secretariat, which supports the work of the Caribbean Community",
      "A foreign embassy, which represents another country and assists its citizens",
    ],
    correctAnswer: 0,
    explanation: `Municipal Corporations/local authorities manage many local facilities and services.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Rights and Responsibilities",
    question: `A student speaks at a peaceful community meeting. Which action BEST shows responsible use of freedom of expression?`,
    options: [
      "Publish unverified accusations when they support the speaker’s main argument.",
      "Damage meeting property to demonstrate the strength of the speaker’s concern.",
      "Present views respectfully while recognising other people’s right to speak.",
      "Present views forcefully enough to prevent opposing speakers from being heard.",
    ],
    correctAnswer: 2,
    explanation: `Rights are exercised within the law and alongside respect for the rights and safety of others.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Courts",
    question: `Why should judges decide cases based on law and evidence rather than instructions from political leaders?`,
    options: [
      "To let judges create election procedures while deciding unrelated cases",
      "To permit courts to set aside laws whenever political leaders request it",
      "To transfer Parliament’s law-making responsibility to individual judges",
      "To support judicial independence and decisions based on law and evidence",
    ],
    correctAnswer: 3,
    explanation: `Judicial independence helps courts decide cases fairly according to law and evidence.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Voting",
    question: `At a polling station, each voter marks a ballot where other people cannot see the choice. Why is this arrangement important?`,
    options: [
      "It protects the privacy of a voter's choice.",
      "It allows people to vote more than once.",
      "It lets candidates count their own votes.",
      "It removes the need for election officials.",
    ],
    correctAnswer: 0,
    explanation: `Ballot secrecy helps voters make choices without improper pressure over how they voted.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Accountability",
    question: `Residents ask to see how funds for a community project were spent. Which principle are they supporting?`,
    options: [
      "Regional cooperation between Caribbean states",
      "Accountability for public spending",
      "Judicial independence in deciding court cases",
      "Freedom of expression during public debate",
    ],
    correctAnswer: 1,
    explanation: `Accountability requires public bodies to explain and take responsibility for the use of public resources.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Citizenship",
    question: `Residents discover a blocked drain before the rainy season. Which response BEST demonstrates active citizenship?`,
    options: [
      "Report the blocked drain and join a lawful community clean-up.",
      "Report the drain but avoid lawful community efforts addressing the same problem.",
      "Clear the drain by damaging nearby public property without contacting the authority.",
      "Prevent neighbours from joining the clean-up because one group reported the problem.",
    ],
    correctAnswer: 0,
    explanation: `Active citizenship includes lawful participation in solving community problems.`
  },
  {
    id: 28,
    type: "civics",
    skill: "CARICOM Cooperation",
    question: `Jamaica and other Caribbean countries share disaster information and emergency supplies after a hurricane. What does this show?`,
    options: [
      "Private ownership",
      "Colonial government",
      "Individual taxation",
      "Regional cooperation",
    ],
    correctAnswer: 3,
    explanation: `Sharing resources and information to address a common regional challenge is regional cooperation.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Governor-General",
    question: `Which statement accurately describes the Governor-General's constitutional role in Jamaica?`,
    options: [
      "The Governor-General represents the monarch and performs constitutional functions.",
      "The Governor-General is elected to lead the majority party as Prime Minister.",
      "The Governor-General directs parliamentary debate as the leader of a political party.",
      "The Governor-General manages local services through each Municipal Corporation.",
    ],
    correctAnswer: 0,
    explanation: `Jamaica's Governor-General represents the monarch and performs constitutional duties.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Public Consultation",
    question: `A Municipal Corporation asks residents to comment before redesigning a town market. Why can this improve the decision?`,
    options: [
      "Residents can provide evidence about local needs before the design is finalised.",
      "Residents can replace the elected council and make the final decision themselves.",
      "Residents can require every suggestion at the consultation to be adopted.",
      "Residents can use attendance at the meeting to become councillors for the project.",
    ],
    correctAnswer: 0,
    explanation: `Consultation can give decision-makers evidence about the needs of people who use the facility.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Opportunity Cost",
    question: `A family can afford either a refrigerator repair or a weekend trip, but not both. The refrigerator is needed to keep food safely. What is the most sensible choice?`,
    options: [
      "Spend on both without checking available money.",
      "Ignore the decision until the refrigerator stops completely.",
      "Repair the refrigerator and give up the trip for now.",
      "Take the trip and allow food to spoil.",
    ],
    correctAnswer: 2,
    explanation: `Limited resources require choices, and an important household need should usually take priority over a want.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Supply",
    question: `Heavy rain damages much of a tomato crop while demand stays high. What may happen to tomato prices?`,
    options: [
      "Prices may rise because fewer tomatoes are available for buyers.",
      "Prices may fall because crop damage increases the quantity available for sale.",
      "Prices may remain fixed because a supply change cannot influence market prices.",
      "Prices may become irrelevant because demand ends when part of a crop is damaged.",
    ],
    correctAnswer: 0,
    explanation: `A lower supply with similar demand can place upward pressure on prices.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Tourism Linkages",
    question: `A guesthouse buys breakfast foods from nearby farmers. How can this support the community economy?`,
    options: [
      "Local purchasing can direct some tourism income to nearby producers.",
      "Local purchasing can reduce farmers’ income because the guesthouse buys their produce.",
      "Local purchasing makes the farmers employees of the guesthouse after each sale.",
      "Local purchasing becomes an import when the food is served to overseas visitors.",
    ],
    correctAnswer: 0,
    explanation: `Local purchasing links tourism spending to farmers and other businesses in the community.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Taxes",
    question: `Which is a likely use of government tax revenue?`,
    options: [
      "Helping fund shared roads, schools, health services and public safety",
      "Providing the same guaranteed profit to businesses in every economic sector",
      "Making household incomes equal by replacing wages with public payments",
      "Paying exclusively for services used by the individual who paid each tax",
    ],
    correctAnswer: 0,
    explanation: `Taxes help finance public services and infrastructure.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Credit Union",
    question: `A family is comparing places where it could save regularly and possibly apply for a future loan. Why might it consider a credit union?`,
    options: [
      "It accepts member savings and may provide loans and other financial services.",
      "It issues Jamaica’s notes and coins while also holding members’ personal savings.",
      "It removes the need for members to budget because savings are protected from expenses.",
      "It guarantees members a fixed level of wealth after they make regular deposits.",
    ],
    correctAnswer: 0,
    explanation: `Credit unions are member-based financial institutions offering savings and other services.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Trade",
    question: `A Jamaican company sells pepper sauce to a supermarket in Barbados. For Jamaica, the pepper sauce is:`,
    options: [
      "an import",
      "a tax",
      "a loan",
      "an export",
    ],
    correctAnswer: 3,
    explanation: `A product made in Jamaica and sold abroad is an export.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Environmental Cost",
    question: `A factory's waste reduces fish in a river used by local fishers. What is one economic effect on the community?`,
    options: [
      "Fishers may lose part of their income.",
      "The river automatically becomes cleaner.",
      "Fishing costs disappear.",
      "Every resident gains a new job.",
    ],
    correctAnswer: 0,
    explanation: `Environmental damage can also create economic losses for people whose livelihoods depend on the resource.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Budgeting",
    question: `A youth-club committee is planning an event with J$60,000. What should it do before approving purchases?`,
    options: [
      "Borrow additional money before checking whether the original funds are sufficient.",
      "List expected costs and allocate the available money before purchases begin.",
      "Purchase the most expensive item first and plan remaining costs afterward.",
      "Estimate costs but avoid keeping receipts once the event has been completed.",
    ],
    correctAnswer: 1,
    explanation: `Preparing expected costs before spending helps the club allocate its limited event funds deliberately.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Saving",
    question: `Why is an emergency savings fund useful?`,
    options: [
      "It helps meet unexpected expenses without immediately relying on new debt.",
      "It replaces regular income whenever a household’s planned expenses increase.",
      "It provides money for optional purchases before essential bills are considered.",
      "It removes the need to budget for predictable expenses during the year.",
    ],
    correctAnswer: 0,
    explanation: `Emergency savings provide a financial cushion when unexpected costs arise.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Small Business",
    question: `A fruit vendor notices that many customers ask for cut fruit at lunchtime. What is the BEST business response before investing heavily?`,
    options: [
      "Test a small quantity, record demand and use the evidence before expanding.",
      "Borrow enough to expand immediately, then check whether lunchtime sales increase.",
      "Prepare a large quantity because customer requests guarantee continuing demand.",
      "Stop recording sales and judge success from the amount prepared each day.",
    ],
    correctAnswer: 0,
    explanation: `Testing the idea on a small scale provides evidence before the vendor commits more resources.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod6Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod6Questions)
      : prepareSocialStudiesPreview(g5SsMod6Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 6",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 6</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 6</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 6</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
