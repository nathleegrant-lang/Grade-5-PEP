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

const g5SsMod9Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Oral History",
    question: `An elder describes life in a Jamaican village seventy years ago. What is one strength of this oral history?`,
    options: [
      "It gives a personal account of experiences and memories from the past.",
      "It gives a complete record of how every resident experienced village life.",
      "It is more reliable than written records because the speaker remembers the events.",
      "It removes the need to compare memories with photographs, records or other accounts.",
    ],
    correctAnswer: 0,
    explanation: `Oral history can preserve first-hand memories, but it should still be compared with other evidence.`
  },
  {
    id: 2,
    type: "history",
    skill: "Chronology",
    question: `Which timeline correctly places the Baptist War, legal abolition, the end of Apprenticeship and the Morant Bay Rebellion?`,
    options: [
      "Baptist War → Morant Bay Rebellion → legal abolition → end of Apprenticeship",
      "Baptist War → legal abolition → end of Apprenticeship → Morant Bay Rebellion",
      "Legal abolition → Baptist War → Morant Bay Rebellion → end of Apprenticeship",
      "Morant Bay Rebellion → Baptist War → end of Apprenticeship → legal abolition",
    ],
    correctAnswer: 1,
    explanation: `The Baptist War was in 1831–32, legal abolition in 1834, Apprenticeship ended in 1838, and Morant Bay occurred in 1865.`
  },
  {
    id: 3,
    type: "history",
    skill: "Emancipation",
    question: `Why was Apprenticeship controversial after slavery was legally abolished?`,
    options: [
      "Apprenticeship ended plantation work but required every freed person to join the colonial government.",
      "Apprenticeship gave workers full freedom but prevented them from moving between parishes.",
      "Formerly enslaved people were still compelled to work under a system that delayed full freedom until 1838.",
      "Formerly enslaved people received immediate political equality but were required to attend school.",
    ],
    correctAnswer: 2,
    explanation: `Apprenticeship continued compulsory labour after legal abolition and ended in 1838.`
  },
  {
    id: 4,
    type: "history",
    skill: "Historical Evidence",
    question: `A newspaper from 1938 reports strikes and marches by workers. What does this evidence help show?`,
    options: [
      "Workers had already achieved all the changes they were demanding.",
      "Every employer and political leader supported the workers’ demands.",
      "The protests were mainly celebrations of Jamaican Independence.",
      "Workers were organising publicly around labour and social grievances.",
    ],
    correctAnswer: 3,
    explanation: `Reports of organised action provide evidence of worker mobilisation during the 1938 unrest.`
  },
  {
    id: 5,
    type: "history",
    skill: "Political Development",
    question: `What did Universal Adult Suffrage change in Jamaica in 1944?`,
    options: [
      "It greatly widened the number of qualified adults who could vote.",
      "It ended colonial status and established Jamaica as a sovereign state.",
      "It ended the labour system that followed legal abolition in 1834.",
      "It established a regional organisation for Caribbean cooperation.",
    ],
    correctAnswer: 0,
    explanation: `Universal Adult Suffrage widened voting rights and increased political participation.`
  },
  {
    id: 6,
    type: "history",
    skill: "Independence",
    question: `What did Jamaica’s Independence in 1962 mean?`,
    options: [
      "Jamaican adults received voting rights for the first time.",
      "Jamaica became a sovereign state rather than remaining a British colony.",
      "Jamaica ended every constitutional connection inherited from Britain on the same day.",
      "Jamaica stopped participating in international organisations and agreements.",
    ],
    correctAnswer: 1,
    explanation: `Independence ended colonial status and established Jamaica as a sovereign state.`
  },
  {
    id: 7,
    type: "history",
    skill: "Political Leadership",
    question: `What did Norman Manley and Alexander Bustamante both contribute to?`,
    options: [
      "Twentieth-century political development and movement toward self-government",
      "The military defence of Maroon communities during the eighteenth century",
      "The Spanish settlement of Jamaica and the establishment of colonial towns",
      "The organisation of the Baptist War and pressure for legal abolition",
    ],
    correctAnswer: 0,
    explanation: `Both leaders played major roles in modern Jamaican political development despite leading different political parties.`
  },
  {
    id: 8,
    type: "history",
    skill: "Cultural Heritage",
    question: `Why is preserving Maroon music, stories and ceremonies important?`,
    options: [
      "They show that Maroon culture has remained completely unchanged for centuries.",
      "They provide evidence that all Jamaican traditions developed from one source.",
      "They are important mainly because tourists need entertainment at heritage sites.",
      "They are living parts of Jamaica’s cultural heritage and historical memory.",
    ],
    correctAnswer: 3,
    explanation: `Living traditions connect communities with history and cultural identity.`
  },
  {
    id: 9,
    type: "history",
    skill: "Artefacts",
    question: `Why should a museum record where an archaeological artefact was found?`,
    options: [
      "Its location provides context that can help explain how the artefact relates to the site.",
      "Its location determines whether the artefact is more valuable than written evidence.",
      "Its location proves that every object found nearby had the same purpose.",
      "Its location tells historians exactly who made and used the artefact.",
    ],
    correctAnswer: 0,
    explanation: `Archaeological context helps historians interpret how an artefact relates to a place and other evidence.`
  },
  {
    id: 10,
    type: "history",
    skill: "Fact and Opinion",
    question: `Which statement is an opinion rather than a verifiable historical fact?`,
    options: [
      "The Morant Bay Rebellion occurred in 1865.",
      "Jamaica became independent from Britain in 1962.",
      "Sam Sharpe was Jamaica’s most inspiring National Hero.",
      "Universal Adult Suffrage was introduced in 1944.",
    ],
    correctAnswer: 2,
    explanation: `Calling one event the “most inspiring” is a judgement; the dates in the other statements can be checked against historical records.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Legends",
    question: `A map legend shows a green square for a park and a blue line for a river. What does a blue line on this map represent?`,
    options: [
      "A parish boundary",
      "A park",
      "A river",
      "A hospital",
    ],
    correctAnswer: 2,
    explanation: `The legend defines the blue line as a river.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Map Scale",
    question: `A map uses a scale of 1 cm to 5 km. Two settlements are 7 cm apart. What is the real distance?`,
    options: [
      "70 km",
      "12 km",
      "30 km",
      "35 km",
    ],
    correctAnswer: 3,
    explanation: `Seven centimetres multiplied by 5 kilometres per centimetre gives 35 kilometres.`
  },
  {
    id: 13,
    type: "geography",
    skill: "River Systems",
    question: `A factory releases waste upstream from a town. Why can the town be affected?`,
    options: [
      "River flow can carry pollution downstream toward the town.",
      "Pollution remains near the release point because river water does not transport waste.",
      "Downstream treatment prevents upstream activities from affecting water quality.",
      "Factory waste changes rainfall but does not move through the river system.",
    ],
    correctAnswer: 0,
    explanation: `Material entering a river upstream can be carried by the current toward downstream users.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Soil Conservation",
    question: `Which farming practice BEST helps reduce soil erosion on a steep slope?`,
    options: [
      "Leaving soil bare between harvest and the next planting",
      "Planting ground cover and farming along contours",
      "Removing ground cover while keeping the same contour pattern",
      "Ploughing directly downhill so water leaves the field faster",
    ],
    correctAnswer: 1,
    explanation: `Ground cover protects soil, while contour farming slows runoff moving down a slope.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Climate and Agriculture",
    question: `A farmer expects a drier-than-normal season. Which response is MOST sensible?`,
    options: [
      "Remove mulch so soil moisture evaporates more quickly after rainfall.",
      "Choose crops by market price without considering how much water they require.",
      "Use water-saving irrigation and choose crops suited to drier conditions.",
      "Apply more water before measuring available supplies or crop requirements.",
    ],
    correctAnswer: 2,
    explanation: `Efficient irrigation and suitable crops help a farmer adapt production to drier conditions.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Coastal Hazards",
    question: `Which location is MOST exposed to storm surge?`,
    options: [
      "A high inland ridge overlooking several valleys",
      "A mountain settlement far from the coastline",
      "A hilltop located above a sheltered harbour",
      "A low-lying community beside the sea",
    ],
    correctAnswer: 3,
    explanation: `Storm surge is a coastal rise in sea level, making low-lying coastal communities especially exposed.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Population Density",
    question: `Town A has 20,000 people in 10 km². Town B has 20,000 people in 40 km². Which town is more densely populated?`,
    options: [
      "Town A",
      "Town B",
      "Both towns have the same density",
      "The towns cannot be compared using area and population",
    ],
    correctAnswer: 0,
    explanation: `Town A has the same population concentrated in a smaller area.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Transport and Settlement",
    question: `A new road connects a rural area to a major town. Which change may follow?`,
    options: [
      "The road may require the parish boundary to follow its route.",
      "Improved access may encourage business and settlement near the route.",
      "Improved access may reduce movement because travel becomes more convenient.",
      "The road may change the area’s rainfall and temperature patterns.",
    ],
    correctAnswer: 1,
    explanation: `Better transport access can attract settlement and businesses by improving links to markets and services.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Caribbean Geography",
    question: `Which statement correctly describes Jamaica’s regional location?`,
    options: [
      "Jamaica is in the Pacific Ocean east of the Caribbean region.",
      "Jamaica is on the South American mainland beside the Caribbean Sea.",
      "Jamaica is in the Caribbean and forms part of the Greater Antilles.",
      "Jamaica is in the Caribbean and forms part only of the Lesser Antilles.",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is a Caribbean island and one of the islands of the Greater Antilles.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environmental Evidence",
    question: `A community plants mangroves along an eroding shoreline. Which evidence would BEST show whether the project is helping?`,
    options: [
      "Attendance totals from the ceremony that launched the planting project",
      "Counts of signs installed near the mangrove planting locations",
      "Minutes from meetings held before the first mangroves were planted",
      "Measurements of shoreline change and mangrove survival over time",
    ],
    correctAnswer: 3,
    explanation: `Repeated measurements of survival and shoreline change directly test whether the project is meeting its purpose.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Parliament",
    question: `What is one main function of Jamaica’s Parliament?`,
    options: [
      "To debate and make national laws",
      "To decide individual court cases using witness testimony",
      "To manage each public market and local minor road",
      "To administer regional secondary-school examinations",
    ],
    correctAnswer: 0,
    explanation: `Parliament debates proposed legislation and makes national laws through the constitutional law-making process.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Courts",
    question: `A citizen believes a constitutional right has been breached. Which institution can determine such a legal claim?`,
    options: [
      "The CARICOM Secretariat",
      "A court with the appropriate jurisdiction",
      "The constituency office of a Member of Parliament",
      "A Municipal Corporation meeting",
    ],
    correctAnswer: 1,
    explanation: `Courts interpret and apply the law and can determine legal claims about constitutional rights.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Local Government",
    question: `A local public market needs repairs. Which body is most directly associated with this local-government service?`,
    options: [
      "The Municipal Corporation/local authority, which manages many local facilities and services",
      "The Caribbean Examinations Council, which administers regional examinations and qualifications",
      "The Bank of Jamaica, which performs central-banking and monetary functions",
      "The CARICOM Secretariat, which supports regional Community programmes",
    ],
    correctAnswer: 0,
    explanation: `Municipal Corporations are Jamaica’s local authorities and manage many local facilities and services.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Voting",
    question: `Why should voters consider reliable information about candidates and issues?`,
    options: [
      "To select the candidate whose name appears most often in advertisements",
      "To vote according to a party colour without examining any proposal",
      "To accept one campaign message as a complete record of public performance",
      "To make informed choices instead of relying mainly on rumours",
    ],
    correctAnswer: 3,
    explanation: `Reliable information helps voters assess candidates and issues before making an informed choice.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Public Consultation",
    question: `Why might a public agency invite comments on a proposed community project?`,
    options: [
      "To learn about local needs and evidence before making a final decision",
      "To allow comments to replace every legal approval the project requires",
      "To hear only from residents who already support the proposal",
      "To promise that every suggestion will be included in the final project",
    ],
    correctAnswer: 0,
    explanation: `Consultation can provide useful local evidence while the responsible authority retains its lawful decision-making role.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Rule of Law",
    question: `Which statement BEST describes the rule of law?`,
    options: [
      "A law applies only after every person affected has agreed with it.",
      "Officials and citizens are subject to law, and government power is exercised within law.",
      "Officials may set aside a law whenever following it delays a public decision.",
      "Citizens must follow laws, but government officials are exempt while performing public duties.",
    ],
    correctAnswer: 1,
    explanation: `The rule of law requires both citizens and public officials to act within the law.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Freedom of Expression",
    question: `Which action shows responsible use of freedom of expression?`,
    options: [
      "Threatening people who disagree with a speaker at a public meeting",
      "Blocking opposing speakers so that one opinion is the only one heard",
      "Expressing a lawful opinion while respecting the rights and safety of others",
      "Publishing a claim known to be false in order to shame a neighbour",
    ],
    correctAnswer: 2,
    explanation: `Freedom of expression is exercised within the law and with respect for other people’s rights and safety.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Accountability",
    question: `Why should a public agency explain how project funds were used?`,
    options: [
      "To make the tax system simpler for every household",
      "To prove that the project achieved every intended result",
      "To replace financial records and independent audits",
      "To account for its management of public resources",
    ],
    correctAnswer: 3,
    explanation: `Public agencies should account for decisions and spending involving public resources.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Regional Cooperation",
    question: `Caribbean countries share hurricane forecasts and emergency supplies. What is the main benefit?`,
    options: [
      "They combine information and resources to address a risk shared across the region.",
      "They ensure every country must use one identical emergency plan.",
      "They remove the need for national disaster agencies and weather services.",
      "They prevent hurricanes from crossing national boundaries.",
    ],
    correctAnswer: 0,
    explanation: `Regional cooperation can strengthen preparedness by pooling information, expertise and emergency resources.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Information Literacy",
    question: `A message claims a new law has passed but gives no source. What should a responsible citizen do before sharing it?`,
    options: [
      "Judge the claim by how often it appears on social media.",
      "Verify the claim using an official or otherwise credible source.",
      "Ask one friend and treat the friend’s response as confirmation.",
      "Share the message first and correct it later if someone objects.",
    ],
    correctAnswer: 1,
    explanation: `Checking an official or credible source reduces the risk of spreading false information.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Budgeting",
    question: `After paying essential expenses, a household has J$15,000 remaining. Which plan BEST shows deliberate budgeting?`,
    options: [
      "Borrow more money so the household can avoid choosing between priorities.",
      "Leave the amount unrecorded and decide only after it has been spent.",
      "Divide the money between emergency saving and an affordable optional purchase.",
      "Spend all of it on the first optional item advertised that week.",
    ],
    correctAnswer: 2,
    explanation: `A budget deliberately assigns available money to priorities, including saving and affordable wants.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Supply and Demand",
    question: `A storm destroys much of the banana crop while demand remains similar. What may happen to banana prices?`,
    options: [
      "Prices may fall because crop damage increases the quantity supplied.",
      "Prices may stay fixed because supply cannot affect market prices.",
      "Prices may disappear because damaged crops end all demand for bananas.",
      "Prices may rise because fewer bananas are available for buyers.",
    ],
    correctAnswer: 3,
    explanation: `When supply falls while demand remains similar, competition for the smaller quantity may raise prices.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Tourism Linkages",
    question: `A hotel hires local musicians and buys crafts from nearby producers. What is one likely benefit?`,
    options: [
      "Tourism spending supports local workers and businesses beyond the hotel.",
      "The hotel replaces the musicians’ and craft producers’ independent businesses.",
      "The purchases become imports because tourists may come from other countries.",
      "Local producers lose income when a tourism business buys their goods and services.",
    ],
    correctAnswer: 0,
    explanation: `Local hiring and purchasing create linkages that spread tourism income through the community.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Imports",
    question: `A Jamaican factory buys a machine manufactured in Germany. For Jamaica, the machine is:`,
    options: [
      "a public subsidy",
      "an import",
      "an export",
      "a remittance",
    ],
    correctAnswer: 1,
    explanation: `A good brought into Jamaica after being produced abroad is an import.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Exports",
    question: `A Jamaican company sells coffee to customers overseas. For Jamaica, the coffee is:`,
    options: [
      "a household transfer",
      "a government service",
      "an export",
      "an import",
    ],
    correctAnswer: 2,
    explanation: `Coffee produced in Jamaica and sold to buyers abroad is part of Jamaica’s exports.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Credit Unions",
    question: `A credit-union member receives an approved loan. What responsibility normally follows?`,
    options: [
      "Treat the loan as a gift that does not need to be repaid.",
      "Set the repayment amount without reference to the loan agreement.",
      "Transfer the repayment responsibility to other credit-union members.",
      "Repay the loan according to the agreed terms.",
    ],
    correctAnswer: 3,
    explanation: `A borrower is responsible for repaying an approved loan according to its agreed terms.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Taxes and Services",
    question: `A government is preparing its annual plan for roads, schools and public safety. Why is tax revenue relevant to the plan?`,
    options: [
      "To help fund shared public services and infrastructure",
      "To ensure businesses and households receive the same income",
      "To replace wages earned by workers in private employment",
      "To charge each taxpayer only for services that person directly uses",
    ],
    correctAnswer: 0,
    explanation: `Tax revenue helps fund shared services and infrastructure such as roads, schools and public safety.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Community Costs",
    question: `A business pollutes nearby homes, causing residents to pay for cleaning and health care. What does this show?`,
    options: [
      "Cleaning and health expenses are part of the business’s sales revenue.",
      "Residents can bear costs created by an economic activity.",
      "The business bears every cost because it owns the production equipment.",
      "Pollution costs disappear when the business provides employment.",
    ],
    correctAnswer: 1,
    explanation: `Pollution can impose external costs on people who were not part of the business transaction.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Market Research",
    question: `Before investing heavily in a new product, what should a small business investigate?`,
    options: [
      "How much can be borrowed before estimating sales or expenses",
      "Whether one customer likes the product enough to represent the whole market",
      "Likely demand, competing prices and expected costs",
      "The owner’s preferred colour without asking possible customers",
    ],
    correctAnswer: 2,
    explanation: `Market research helps a business estimate demand, prices and costs before committing substantial resources.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Business Reserves",
    question: `Why might a cooperative retain part of its annual surplus?`,
    options: [
      "To hide its financial results from cooperative members",
      "To avoid recording how the remaining surplus is used",
      "To guarantee that future income will exceed every future expense",
      "To build a reserve for future plans or unexpected costs",
    ],
    correctAnswer: 3,
    explanation: `A reserve can help a cooperative prepare for future investment or unexpected costs.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod9Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod9Questions)
      : prepareSocialStudiesPreview(g5SsMod9Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 9",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 9</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 9</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 9</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
