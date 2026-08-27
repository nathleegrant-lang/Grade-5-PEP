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

const g5SsMod7Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Using Sources",
    question: `Two sources give different descriptions of the same historical protest. What should a student do FIRST?`,
    options: [
      "Compare each source’s creator, date, purpose and supporting evidence.",
      "Prefer the source produced earlier because its timing settles every disagreement.",
      "Prefer the source with more detail without checking where that detail came from.",
      "Combine both descriptions as if conflicting details must be equally accurate.",
    ],
    correctAnswer: 0,
    explanation: `Comparing authorship, date, purpose and evidence helps explain why historical accounts may differ.`
  },
  {
    id: 2,
    type: "history",
    skill: "Chronology",
    question: `Which sequence is correct from earliest to latest?`,
    options: [
      "English capture → Spanish settlement → Independence → Emancipation",
      "Spanish settlement → English capture → Emancipation → Independence",
      "Emancipation → Spanish settlement → Independence → English capture",
      "Spanish settlement → Independence → English capture → Emancipation",
    ],
    correctAnswer: 1,
    explanation: `Spanish settlement came before English capture in 1655, Emancipation in the nineteenth century and Independence in 1962.`
  },
  {
    id: 3,
    type: "history",
    skill: "Baptist War",
    question: `Why was the Baptist War important to the movement toward emancipation?`,
    options: [
      "It immediately ended colonial government and established an independent Jamaica.",
      "Its scale and suppression strengthened pressure in Britain for abolition.",
      "It created elected local authorities to manage services in Jamaican communities.",
      "It ended plantation agriculture by requiring estates to release all cultivated land.",
    ],
    correctAnswer: 2,
    explanation: `The scale of the Baptist War and its harsh suppression strengthened abolitionist pressure in Britain.`
  },
  {
    id: 4,
    type: "history",
    skill: "Historical Evidence",
    question: `A petition from 1865 complains that poor Jamaicans lacked land and fair treatment. What does it help explain?`,
    options: [
      "It gives evidence of grievances involving land, justice and treatment around Morant Bay.",
      "It explains the regional negotiations that later led Jamaica to join CARICOM.",
      "It records environmental conditions that caused hurricanes to affect St Thomas.",
      "It describes the tourism policies used to create employment after Independence.",
    ],
    correctAnswer: 3,
    explanation: `The petition provides evidence of grievances involving land, justice and treatment around the time of Morant Bay.`
  },
  {
    id: 5,
    type: "history",
    skill: "Maroon Heritage",
    question: `Which action BEST preserves living Maroon heritage?`,
    options: [
      "Record and teach traditional music, stories and ceremonies within the community.",
      "Move ceremonies away from the community so their meaning can be decided by visitors.",
      "Replace oral traditions with one written account and discontinue community performances.",
      "Preserve instruments in displays while ending the music and ceremonies connected with them.",
    ],
    correctAnswer: 0,
    explanation: `Teaching and practising music, stories and ceremonies helps living heritage continue within the community.`
  },
  {
    id: 6,
    type: "history",
    skill: "Labour History",
    question: `What did the 1938 labour unrest demonstrate about organised workers?`,
    options: [
      "Organised action could pressure employers and government to consider reform.",
      "Organised action showed that workers preferred existing conditions to labour reform.",
      "The unrest showed that Jamaica had already achieved Independence before 1938.",
      "The protests showed that political participation had little connection with worker concerns.",
    ],
    correctAnswer: 1,
    explanation: `The 1938 unrest showed that organised workers could press employers and government for reform.`
  },
  {
    id: 7,
    type: "history",
    skill: "Political Development",
    question: `Which statement correctly distinguishes two Jamaican political milestones?`,
    options: [
      "Voting rights widened in 1944; colonial status ended with Independence in 1962.",
      "Independence came in 1944; voting rights first widened after colonial rule ended.",
      "Both milestones occurred in 1962 as part of the same constitutional event.",
      "Voting rights widened when CARICOM was established, while Independence came later.",
    ],
    correctAnswer: 2,
    explanation: `Universal Adult Suffrage widened voting rights in 1944, while Independence ended colonial status in 1962.`
  },
  {
    id: 8,
    type: "history",
    skill: "National Heroes",
    question: `Which evidence would BEST support recognising a person as a National Hero?`,
    options: [
      "Strong historical evidence of sustained service to freedom, justice or nation-building",
      "Evidence that the person attracted the largest audiences during one public event",
      "Evidence that the person accumulated greater personal wealth than contemporaries",
      "Frequent mention of the person in advertisements and popular entertainment",
    ],
    correctAnswer: 3,
    explanation: `National Hero recognition should rest on well-supported contributions to freedom, justice or nation-building.`
  },
  {
    id: 9,
    type: "history",
    skill: "Heritage Conservation",
    question: `Why might a community preserve an old courthouse linked to an important historical event?`,
    options: [
      "It preserves physical evidence and supports learning about the community’s past.",
      "It ensures every story associated with the building is historically accurate.",
      "It prevents the community from constructing modern buildings in other locations.",
      "It preserves history mainly by converting the courthouse into a commercial attraction.",
    ],
    correctAnswer: 0,
    explanation: `A historic courthouse can preserve physical evidence and provide a place for learning about community history.`
  },
  {
    id: 10,
    type: "history",
    skill: "Migration and Remittances",
    question: `A Jamaican working abroad regularly sends part of her earnings home. What is this money called?`,
    options: [
      "A tariff",
      "A remittance",
      "A subsidy",
      "A tax refund",
    ],
    correctAnswer: 1,
    explanation: `Money sent home by a person working abroad is a remittance.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Grids",
    question: `A map grid shows the library at square C4 and the clinic at C6. What information can the grid references help a user do?`,
    options: [
      "Predict election results.",
      "Identify historical dates.",
      "Locate features on the map.",
      "Measure rainfall.",
    ],
    correctAnswer: 2,
    explanation: `Grid references provide a systematic way to locate features on a map.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Direction",
    question: `The market is northeast of the bus park. In which direction is the bus park from the market?`,
    options: [
      "Southeast",
      "Northwest",
      "Northeast",
      "Southwest",
    ],
    correctAnswer: 3,
    explanation: `Southwest is the opposite direction from northeast.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Rainfall Data",
    question: `Village A records 85 mm of rain and Village B records 30 mm during the same month. What can be concluded from these measurements?`,
    options: [
      "Village A received more rainfall that month.",
      "Village A is always wetter every year.",
      "Village B had no rain.",
      "Both villages have identical climates.",
    ],
    correctAnswer: 0,
    explanation: `The measurements show that Village A received more rain in that month, but do not prove a permanent climate pattern.`
  },
  {
    id: 14,
    type: "geography",
    skill: "River Pollution",
    question: `A chemical spill occurs upstream from a fishing village. Why should the village be warned quickly?`,
    options: [
      "Downstream water cannot be affected by upstream activities.",
      "River flow can carry pollution downstream.",
      "Pollution always moves uphill.",
      "Factories stop rivers from flowing.",
    ],
    correctAnswer: 1,
    explanation: `River flow can transport a pollutant from an upstream spill toward downstream users.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Coral Reefs",
    question: `Why might fishers support rules against anchoring boats on coral reefs?`,
    options: [
      "Anchors can damage reef structures that provide habitat for marine life.",
      "Anchors can improve reefs by breaking coral into space for new boat routes.",
      "Anchoring can protect fish because damaged coral releases more food into the water.",
      "Anchoring affects beaches but has little connection with coral habitat or fisheries.",
    ],
    correctAnswer: 2,
    explanation: `Anchors can break or damage coral structures that provide habitat for marine life.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Transport and Access",
    question: `A rural settlement gains a regular bus service to the nearest town. Which benefit is MOST direct?`,
    options: [
      "Residents may reach jobs, schools and markets more easily.",
      "Residents may have less access because regular transport reduces travel choices.",
      "Farmers may stop production because buses connect the settlement with a town.",
      "The parish boundary may move because the route crosses several communities.",
    ],
    correctAnswer: 3,
    explanation: `A regular bus service can improve direct access to schools, employment, markets and services.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Drought Adaptation",
    question: `A farmer facing repeated dry periods installs drip irrigation. What problem is the farmer trying to reduce?`,
    options: [
      "Water waste",
      "Earthquake risk",
      "Coastal erosion",
      "Traffic congestion",
    ],
    correctAnswer: 0,
    explanation: `Drip irrigation delivers water efficiently and can reduce water waste during dry periods.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Hurricane Shelters",
    question: `Which is the BEST location for a hurricane shelter?`,
    options: [
      "A sound accessible site outside known flood and storm-surge danger",
      "A coastal site near residents even though it lies within the storm-surge zone",
      "A strong building in a floodplain where rising water may block all access roads",
      "A remote hilltop outside flood danger but without a safe route for residents",
    ],
    correctAnswer: 1,
    explanation: `A shelter should be structurally sound, accessible and outside known flood and storm-surge danger.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Caribbean Geography",
    question: `Jamaica belongs to which major Caribbean island group?`,
    options: [
      "Bahamas",
      "Windward Islands only",
      "Greater Antilles",
      "Lesser Antilles",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is one of the islands of the Greater Antilles.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Urban Drainage",
    question: `A town floods after short periods of heavy rain because drains are blocked. Which action most directly addresses the problem?`,
    options: [
      "Remove every road sign.",
      "Build houses inside drains.",
      "Stop collecting rainfall information.",
      "Clear and maintain drainage channels.",
    ],
    correctAnswer: 3,
    explanation: `Clearing and maintaining blocked drains directly improves the movement of storm water.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Parliament",
    question: `A diagram of Jamaica’s Parliament has one box for the House of Representatives and another for the Senate. What relationship should the diagram show?`,
    options: [
      "They are Parliament’s two Houses and both take part in national law-making.",
      "The House makes national laws while the Senate manages courts and trials.",
      "The Senate makes laws while the House operates Municipal Corporations.",
      "They are separate local authorities responsible for different parish services.",
    ],
    correctAnswer: 0,
    explanation: `The House of Representatives and Senate are the two Houses involved in Jamaica’s parliamentary law-making process.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Local Government",
    question: `Streetlights in a local community have been broken for months. Which action is MOST appropriate?`,
    options: [
      "Report the streetlights through the responsible local authority or service channel.",
      "Report them to the regional body that administers school examinations.",
      "Ask the CARICOM Secretariat to arrange repairs to the community infrastructure.",
      "Remove the remaining lights so that every street is affected in the same way.",
    ],
    correctAnswer: 1,
    explanation: `Streetlight problems should be reported through the responsible local authority or service channel.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Freedom of Expression",
    question: `A peaceful newspaper criticises a government policy. Which right is most directly involved?`,
    options: [
      "Right to ignore court orders",
      "Right to prevent elections",
      "Freedom of expression",
      "Right to own every public building",
    ],
    correctAnswer: 2,
    explanation: `Peaceful criticism of government policy is an exercise of freedom of expression within the law.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Judicial Impartiality",
    question: `Why should a judge not have a personal financial interest in a case being heard?`,
    options: [
      "Judges should own every business involved.",
      "Personal interests always improve evidence.",
      "Courts do not require fairness.",
      "It could undermine impartial decision-making.",
    ],
    correctAnswer: 3,
    explanation: `A financial interest could bias a judge or create a reasonable concern that the decision is not impartial.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Information Literacy",
    question: `Before sharing a claim about an election, what should a responsible citizen do?`,
    options: [
      "Check reliable official or credible sources.",
      "Forward it immediately.",
      "Change the claim to make it more dramatic.",
      "Assume any popular message is true.",
    ],
    correctAnswer: 0,
    explanation: `Checking official or otherwise credible sources reduces the risk of spreading false election information.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Public Accountability",
    question: `Why should public agencies keep records of money spent on projects?`,
    options: [
      "To account for how public money was planned, spent and recorded",
      "To keep project spending private until every activity has been completed",
      "To avoid preparing a budget because receipts provide all necessary planning",
      "To guarantee that each public project will cost the same amount",
    ],
    correctAnswer: 1,
    explanation: `Spending records help public agencies account for how public money was used.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Democratic Participation",
    question: `Residents disagree about where a playground should be built. What is the MOST democratic response?`,
    options: [
      "Hold a lawful consultation and consider evidence about community needs.",
      "Let the resident living closest to both sites make the final decision privately.",
      "Allow supporters of one site to speak while excluding residents who disagree.",
      "Begin work at both sites before comparing safety, access and community evidence.",
    ],
    correctAnswer: 2,
    explanation: `Consultation allows different views and evidence to be considered through a lawful democratic process.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Regional Education",
    question: `Caribbean countries agree to recognise a regional examination qualification. What benefit can this provide?`,
    options: [
      "Qualifications can be understood and recognised across participating countries.",
      "Regional recognition means each student receives a passing grade in every country.",
      "Participating countries close national schools and transfer teaching to CARICOM.",
      "Regional recognition turns the examining body into a university for all students.",
    ],
    correctAnswer: 3,
    explanation: `Regional recognition makes qualifications easier to understand and use across participating countries.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Rights and Responsibilities",
    question: `Which action is both a right and responsibility issue?`,
    options: [
      "Use the space while respecting rules that protect other users and facilities.",
      "Use the space without restriction because public ownership removes user responsibilities.",
      "Exclude neighbours from the facilities when their activities differ from one’s own.",
      "Ignore safety rules when following them would make an activity less convenient.",
    ],
    correctAnswer: 0,
    explanation: `People may use public spaces while also following rules that protect other users and the facilities.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rule of Law",
    question: `What does the rule of law require?`,
    options: [
      "Laws apply after each affected person has individually agreed to them.",
      "Government officials and citizens are subject to law.",
      "Government officials may disregard laws when carrying out public duties.",
      "Citizens are subject to law, while elected officials follow political instructions.",
    ],
    correctAnswer: 1,
    explanation: `The rule of law means that citizens and government officials are subject to law.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Consumer Decisions",
    question: `Two shops sell the same school calculator with the same warranty. Shop A charges J$3,200 and Shop B charges J$2,850. What should a careful buyer do?`,
    options: [
      "Ignore both price and warranty and choose whichever shop is closer.",
      "Choose Shop A because its higher price may mean the calculator is better.",
      "Confirm the products and warranties are the same, then compare the total prices.",
      "Choose Shop B without checking whether its warranty and model are the same.",
    ],
    correctAnswer: 2,
    explanation: `A careful buyer checks that the products and warranties are comparable before using price to decide which offers better value.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Seasonal Demand",
    question: `A school reopens after the holiday and many families need uniforms at the same time. What is a sensible response by a uniform shop?`,
    options: [
      "Order mainly items that sold well during periods when schools were closed.",
      "Wait until popular sizes are sold out before deciding whether demand increased.",
      "Keep its normal stock because school reopening should not affect demand.",
      "Use past sales to stock more of the uniform items usually needed at reopening.",
    ],
    correctAnswer: 3,
    explanation: `Past sales and expected seasonal demand can help a shop prepare suitable stock before the busy reopening period.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Production",
    question: `A small company buys local guavas and turns them into bottled jam. Which type of economic activity is this?`,
    options: [
      "Secondary production because raw agricultural produce is changed into a new product.",
      "Tertiary activity because the company provides only a service to guava farmers.",
      "Importing because the company purchases fruit before producing the jam.",
      "Primary production because the company harvests a natural resource directly.",
    ],
    correctAnswer: 0,
    explanation: `Turning raw agricultural produce into jam is secondary production because a raw material is processed into a new product.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Trade",
    question: `A Jamaican business buys machinery made in another country for use in its factory. For Jamaica, the machinery is:`,
    options: [
      "an export",
      "an import",
      "a remittance",
      "a subsidy",
    ],
    correctAnswer: 1,
    explanation: `A good bought from another country for use in Jamaica is an import.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Budgeting",
    question: `A family has enough money for rent, food, utilities and one optional activity. Which plan BEST shows careful budgeting?`,
    options: [
      "Divide the money equally among every expense even though some needs cost more than others.",
      "Borrow for one essential expense so that more of the current income can be used for entertainment.",
      "Pay the essential expenses first, then check whether the optional activity fits the remaining money.",
      "Pay for the optional activity first, then reduce whichever essential expense is easiest to postpone.",
    ],
    correctAnswer: 2,
    explanation: `A sensible budget gives priority to essential needs before optional wants and then uses the remaining money deliberately.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Cooperation in Business",
    question: `Several farmers hire one truck together to carry produce to market. What is one likely advantage?`,
    options: [
      "They can transport produce together, although each farmer must still pay the full cost of a separate truck.",
      "They can avoid planning collection times because shared transport removes the need for coordination.",
      "They can depend on the shared truck to ensure that every item reaches a buyer.",
      "They can share the transport cost instead of each farmer hiring a separate vehicle.",
    ],
    correctAnswer: 3,
    explanation: `Sharing transport can lower the cost to each farmer because several producers divide one transport expense.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Public Revenue",
    question: `Why do governments collect taxes?`,
    options: [
      "To help fund public services and infrastructure used by communities.",
      "To provide the same amount of spending money to every household.",
      "To replace the income earned by businesses and workers.",
      "To pay only for services used directly by the person who paid the tax.",
    ],
    correctAnswer: 0,
    explanation: `Tax revenue helps governments pay for shared services and infrastructure such as roads, schools, health services and public safety.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Tourism and Employment",
    question: `A new eco-attraction opens near a rural community. Which is a possible economic benefit?`,
    options: [
      "It may increase local spending only if every worker and visitor comes from outside Jamaica.",
      "It may create jobs at the attraction and increase demand for nearby transport, food and other services.",
      "It may create jobs at the attraction but reduce demand for every other local business.",
      "It may bring visitors while leaving employment and local business activity unchanged.",
    ],
    correctAnswer: 1,
    explanation: `Tourism can create direct employment and can also support nearby businesses that supply goods and services.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Economic and Environmental Decisions",
    question: `A quarry could create jobs but may affect a nearby water source. What should planners do before deciding?`,
    options: [
      "Estimate the number of jobs and approve the quarry if employment would increase.",
      "Protect the water source by rejecting the quarry without examining whether impacts can be reduced.",
      "Compare employment and other economic benefits with evidence about water-supply and environmental risks.",
      "Compare construction costs but leave water quality for the community to assess after operations begin.",
    ],
    correctAnswer: 2,
    explanation: `A balanced decision considers economic benefits together with reliable evidence about environmental and community costs.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Saving Goals",
    question: `Andre wants to buy a bicycle in eight months. Which plan BEST supports his goal?`,
    options: [
      "Set a target but save only in months when none of his other wants require money.",
      "Buy the bicycle immediately with borrowed money before comparing the cost of borrowing.",
      "Save irregular amounts without recording whether the total is moving toward the target.",
      "Set a target, save a planned amount regularly and check his progress toward the bicycle.",
    ],
    correctAnswer: 3,
    explanation: `A clear target, regular saving and progress checks make a future purchase goal more achievable.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod7Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod7Questions)
      : prepareSocialStudiesPreview(g5SsMod7Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 7",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 7</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 7</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 7</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
