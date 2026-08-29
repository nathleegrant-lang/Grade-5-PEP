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

const g5SsDiff5Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Synthesising Taíno Evidence",
    "question": "A coastal site contains cassava griddles, fish bones and canoe fragments. A second source describes exchange between communities. Which synthesis best connects subsistence and movement?",
    "options": [
      "Taíno people depended on imported food and avoided travel between settlements.",
      "The artefacts suggest that Spanish forts directed Taíno food production.",
      "The evidence suggests that Taíno coastal communities shared one large settlement.",
      "Taíno people combined farming and fishing with canoe travel that supported exchange."
    ],
    "correctAnswer": 3,
    "explanation": "The artefacts show varied food production, while canoe evidence and the second source support movement and exchange."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Colonial Cause and Continuity",
    "question": "Spanish rule ended after the English capture, yet plantation labour exploitation expanded later. Which conclusion combines change and continuity?",
    "options": [
      "English capture ended plantation production and created immediate freedom.",
      "Colonial rulers changed, but control of land and coerced labour remained central to exploitation.",
      "Spanish legal practices remained the main system until Independence in 1962.",
      "The change of rulers reduced inequality throughout colonial society."
    ],
    "correctAnswer": 1,
    "explanation": "Government changed from Spanish to English rule, while colonial control and labour exploitation continued in altered forms."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Resistance and Abolition",
    "question": "A British reader sees reports of the Baptist War and evidence of harsh punishment. How could both kinds of evidence strengthen abolition arguments?",
    "options": [
      "They showed both enslaved people's resistance and the violence required to maintain slavery.",
      "They showed that slavery had already ended before the uprising.",
      "They proved that resistance focused mainly on voting rights.",
      "They showed that plantation owners supported immediate Independence."
    ],
    "correctAnswer": 0,
    "explanation": "Resistance demonstrated opposition to slavery, while severe punishment exposed the coercion sustaining the system."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Freedom and Citizenship",
    "question": "Why must a timeline include both 1838 full freedom and 1944 Universal Adult Suffrage?",
    "options": [
      "Voting rights developed soon after Apprenticeship ended.",
      "Full freedom and broad voting rights were both completed after the first 1944 election.",
      "Freedom and broad voting rights developed at different stages.",
      "Both dates describe the same labour contract change."
    ],
    "correctAnswer": 2,
    "explanation": "The end of Apprenticeship established full freedom, while broad electoral participation developed much later."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Morant Bay Evidence Chain",
    "question": "Records show land grievances, unequal justice, a protest march and severe suppression. Which explanation connects the full chain?",
    "options": [
      "The protest march produced the main grievances after the authorities began suppressing the crowd.",
      "Severe suppression began before residents organised a public protest over land and justice concerns.",
      "The records describe the 1938 labour unrest rather than Morant Bay.",
      "Long-standing grievances contributed to protest, and colonial authorities responded with force."
    ],
    "correctAnswer": 3,
    "explanation": "The evidence supports a sequence from grievances to organised protest and then harsh colonial response."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Heroes and Nation-Building",
    "question": "A student groups Nanny, Bogle, Garvey and Manley under one heading. Which heading recognises their differences without erasing a shared contribution?",
    "options": [
      "Military commanders who fought in the same uprising",
      "Leadership in struggles for freedom, justice and nation-building",
      "Prime Ministers elected after Independence",
      "Writers who produced the same political programme"
    ],
    "correctAnswer": 1,
    "explanation": "Their periods and methods differed, but each contributed to resistance, justice, political consciousness or national development."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "From Labour to Politics",
    "question": "Which two-step link best explains why 1938 is important to later self-government?",
    "options": [
      "Worker protest strengthened unions and parties, which widened organised pressure for political reform.",
      "Worker protest ended elections, which reduced political participation.",
      "Higher wages created Spanish rule, which delayed political reform.",
      "The unrest established CARICOM, which immediately granted Independence."
    ],
    "correctAnswer": 0,
    "explanation": "The unrest helped organise labour and political movements that pressed for broader representation and self-government."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Suffrage and Independence",
    "question": "A country may hold broad elections yet still be a colony. How does Jamaica's chronology demonstrate this?",
    "options": [
      "Independence arrived in 1944, while adult suffrage followed in 1962.",
      "Both changes occurred in 1838 after Apprenticeship.",
      "Adult suffrage in 1944; Independence in 1962.",
      "Colonial rule ended before the 1938 labour unrest."
    ],
    "correctAnswer": 2,
    "explanation": "Jamaica widened voting under colonial rule in 1944 and became independent eighteen years later."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Evaluating Independence Sources",
    "question": "A 1962 speech celebrates freedom; an economic report warns of continuing challenges. Which synthesis is most balanced?",
    "options": [
      "The speech proves the report must be false.",
      "The report proves Independence caused no meaningful change.",
      "Both sources show Jamaica remained legally colonised.",
      "Independence changed political status, not every social or economic condition."
    ],
    "correctAnswer": 3,
    "explanation": "Political sovereignty was a major change, while development challenges could continue after Independence."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Public Memory",
    "question": "A monument highlights one leader while community records show many contributors. What should a revised display do?",
    "options": [
      "Replace individual names with a description of the whole community.",
      "Retain the leader's role; add evidence of wider participation and experiences.",
      "Ignore community records because monuments cannot be revised.",
      "Present all contributors as having performed identical roles."
    ],
    "correctAnswer": 1,
    "explanation": "Strong public history can recognise leadership and also explain the broader participation supported by evidence."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Scale and Hazard Synthesis",
    "question": "A 15 km evacuation route is shorter than a 22 km route, but the shorter route crosses two flood-prone gullies. Which choice combines scale and hazard evidence?",
    "options": [
      "Prefer the longer route if current assessments confirm it avoids the dangerous crossings.",
      "Choose the 15 km route because distance is the most reliable map evidence.",
      "Choose either route without checking rainfall or road conditions.",
      "Remain in a storm-surge zone because both routes require travel."
    ],
    "correctAnswer": 0,
    "explanation": "Route length matters, but avoiding documented hazards can make a longer route safer."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Relief, Farming and Erosion",
    "question": "A steep farm has heavy rainfall and bare soil. Which two actions best address the combined risk?",
    "options": [
      "Increase downslope ploughing and remove remaining roots.",
      "Build houses in drainage channels and pave the entire field.",
      "Use contour-based soil protection and restore vegetation cover.",
      "Reduce rainfall measurements and deepen the nearest beach."
    ],
    "correctAnswer": 2,
    "explanation": "Steepness, rainfall and bare soil increase runoff; contour practices and vegetation help slow water and retain soil."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Watershed and Coast",
    "question": "Hillside erosion increases river sediment, and coral near the river mouth becomes covered. Which conclusion connects inland and coastal systems?",
    "options": [
      "Coral sediment travels uphill and causes hillside clearing.",
      "River mouths prevent land use from affecting coastal water.",
      "Fishing and boating are the main activities affecting coral near a river mouth.",
      "Poor watershed management can damage downstream rivers and marine habitats."
    ],
    "correctAnswer": 3,
    "explanation": "Eroded soil moves through the watershed to the coast, where sediment can harm coral."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Hurricane Decision Chain",
    "question": "Forecast confidence rises, shelters open and coastal water is already entering roads. What should a low-lying household do?",
    "options": [
      "Wait until several roads flood so the household can confirm the risk.",
      "Follow early evacuation guidance using the safe route.",
      "Move closer to the coast to observe conditions.",
      "Ignore shelter information because wind has not peaked."
    ],
    "correctAnswer": 1,
    "explanation": "Increasing forecast confidence, open shelters and early flooding together support prompt evacuation before routes worsen."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Mangroves and Livelihoods",
    "question": "A restored mangrove area shows less erosion and more juvenile fish after three years. Which policy best uses both findings?",
    "options": [
      "Protect restoration while allowing non-damaging regulated activities.",
      "Clear the area now that fish numbers increased.",
      "Restrict livelihoods near the restored mangrove area throughout the parish.",
      "Replace mangroves with a concrete wall and remove monitoring."
    ],
    "correctAnswer": 0,
    "explanation": "The findings show shoreline and fishery benefits, supporting continued protection with compatible use."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Population and Services",
    "question": "Population rises 25%, water demand rises 30% and supply capacity rises 5%. What two-step problem is most likely?",
    "options": [
      "Supply exceeds demand, producing unused water.",
      "Population growth may reduce average household water use enough to close the gap.",
      "Demand exceeds capacity unless supply or conservation improves.",
      "Capacity growth removes the need for conservation."
    ],
    "correctAnswer": 2,
    "explanation": "Demand is increasing far faster than capacity, so shortages become more likely without intervention."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Pollution Evidence Chain",
    "question": "Litter is low upstream, high below a market and lower again after new bins and collection. Which conclusion is strongest?",
    "options": [
      "The upstream site was the main source of the litter counted downstream.",
      "Bins increased litter because the final count was not zero.",
      "This river pattern shows that markets are a major source of litter in Jamaica.",
      "The market was the likely source; better waste management reduced leakage."
    ],
    "correctAnswer": 3,
    "explanation": "Location and before-after evidence connect the market area and waste measures to the observed change, while not proving universality."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Conservation and Equity",
    "question": "A protected area improves reefs but blocks a traditional landing site. What revision best combines conservation and fair access?",
    "options": [
      "Remove all protection because one group is inconvenienced.",
      "Protect sensitive reef zones and provide a safe landing alternative.",
      "Keep the rule secret so users cannot object.",
      "Allow landing directly on the most fragile coral."
    ],
    "correctAnswer": 1,
    "explanation": "The revision preserves ecological goals while addressing a genuine access need through consultation and safer location."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Climate and Planning",
    "question": "Thirty-year records show hotter average conditions and less predictable rainfall. Which farm plan addresses both patterns?",
    "options": [
      "Heat-suitable crops, soil cover and flexible water storage",
      "Plant a single water-demanding crop and reduce shade to increase sunlight.",
      "Plan each season mainly from the most recent weather pattern.",
      "Drain stored water before each dry period."
    ],
    "correctAnswer": 0,
    "explanation": "Crop choice, soil protection and water storage together respond to heat and rainfall uncertainty."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Development Synthesis",
    "question": "A proposed hotel brings jobs but sits near mangroves and a storm-surge zone. What decision process is strongest?",
    "options": [
      "Approve immediately because jobs remove physical risk.",
      "Reject all hotels without reviewing any site evidence.",
      "Assess hazards and environment, then redesign or relocate.",
      "Clear mangroves first so the assessment is easier."
    ],
    "correctAnswer": 2,
    "explanation": "The proposal requires combined evaluation of economic benefit, ecosystem effects and human safety before approval."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Law-Making and Participation",
    "question": "Citizens want a national bill changed before passage. Which two actions best fit Jamaica's democratic process?",
    "options": [
      "Order a court to rewrite the proposal without a case.",
      "Ask one Municipal Corporation to enact the national bill.",
      "Threaten senators so debate ends quickly.",
      "Present evidence to representatives through lawful consultation."
    ],
    "correctAnswer": 3,
    "explanation": "Citizens can advocate and provide evidence while Parliament carries out the national legislative process."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Constitutional Synthesis",
    "question": "Why can elected leadership and the Governor-General both have roles in forming government?",
    "options": [
      "The Governor-General is selected through the constituency election process.",
      "Jamaica combines electoral outcomes with formal constitutional procedures.",
      "Elections are advisory and have no constitutional effect.",
      "Municipal councillors appoint the national Cabinet alone."
    ],
    "correctAnswer": 1,
    "explanation": "Elections determine parliamentary support, while the Governor-General performs formal duties within the constitutional system."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Courts and Rights",
    "question": "A citizen challenges an official decision in court. Which principle combines individual rights and institutional responsibility?",
    "options": [
      "Courts should independently review the case using law, procedure and evidence.",
      "Officials should decide whether their own action was lawful.",
      "Public popularity should replace the hearing.",
      "Parliament should determine guilt in the individual case."
    ],
    "correctAnswer": 0,
    "explanation": "Independent judicial review provides a lawful way to test official action and protect rights."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Local Service Accountability",
    "question": "A drain remains blocked after repeated reports. Which sequence is most responsible?",
    "options": [
      "Damage the drain, accuse workers publicly and discard records.",
      "Contact an unrelated court before notifying local services.",
      "Document reports and effects, use formal escalation, then monitor the recorded response.",
      "Wait silently, then claim no reporting system existed."
    ],
    "correctAnswer": 2,
    "explanation": "Evidence, lawful escalation and follow-up strengthen accountability for a local service problem."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights and Emergency Rules",
    "question": "An evacuation order limits access to a dangerous coast. Which explanation best balances rights and public safety?",
    "options": [
      "A safety restriction suspends the affected rights for as long as officials choose.",
      "Citizens may ignore any rule they dislike.",
      "Officials need not provide reasons or consistent treatment.",
      "Temporary restrictions may protect life if applied fairly."
    ],
    "correctAnswer": 3,
    "explanation": "Emergency measures can protect the public while remaining lawful, proportionate, explained and fairly applied."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Representative Evidence",
    "question": "A councillor receives 300 identical online responses and 30 detailed submissions from affected residents. What should happen next?",
    "options": [
      "Ignore the detailed submissions because 30 is smaller.",
      "Verify participation and evidence rather than count responses alone.",
      "Count each online response as a separate resident unless duplication is reported.",
      "Give the longest submission the greatest weight in measuring public opinion."
    ],
    "correctAnswer": 1,
    "explanation": "Numbers matter, but identity, representation, relevance and evidence also affect the quality of consultation."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Accountability and Fairness",
    "question": "An audit finds missing receipts but does not prove theft. What response combines accountability and due process?",
    "options": [
      "Secure records, investigate impartially and allow responses.",
      "Announce guilt immediately and end the investigation.",
      "Ignore missing records because theft is unproven.",
      "Destroy remaining documents to protect privacy."
    ],
    "correctAnswer": 0,
    "explanation": "Missing documentation requires investigation, but fair procedure avoids declaring wrongdoing before evidence is assessed."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Regional Problem-Solving",
    "question": "A hurricane damages several CARICOM states and disrupts trade. Why can regional cooperation help twice?",
    "options": [
      "CARICOM can temporarily direct national agencies during a regional emergency.",
      "Regional action can reduce the damage caused by future hurricanes.",
      "Coordinate emergency support and restore essential-goods movement.",
      "Trade rules make emergency planning unnecessary."
    ],
    "correctAnswer": 2,
    "explanation": "Cooperation can address the immediate disaster and the regional movement of needed supplies."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Public Budget Synthesis",
    "question": "A clinic is urgent but costs more than available funds. Which plan best combines need and fiscal responsibility?",
    "options": [
      "Promise immediate completion without a funding source.",
      "Hide the cost so urgency appears affordable.",
      "Fund it by pausing lower-priority services until the clinic is complete.",
      "Publish the evidence, phase or revise the project and identify lawful funding."
    ],
    "correctAnswer": 3,
    "explanation": "The plan recognises urgency while requiring transparent scope and sustainable funding."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Civic Conflict and Evidence",
    "question": "Two communities claim the same water source during drought. What decision process is most defensible?",
    "options": [
      "Give all water to the community that complains first.",
      "Measure need, hear both communities and monitor a sharing plan.",
      "Let each group take water without measurement.",
      "Close the source and provide no alternative."
    ],
    "correctAnswer": 1,
    "explanation": "Evidence about supply and need, fair participation and monitoring support a workable resolution."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Scarcity and Public Choice",
    "question": "A parish can repair one bridge or two minor roads. The bridge closure blocks hospital access. Which analysis is strongest?",
    "options": [
      "Prioritise the bridge if hospital access outweighs the roads' benefit.",
      "Choose the two roads because completing more projects benefits more residents.",
      "Choose the cheapest project without considering consequences.",
      "Divide the funds so no project can be completed."
    ],
    "correctAnswer": 0,
    "explanation": "Scarcity requires comparing urgency, number affected and consequences, not simply counting projects."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Supply Chain Reasoning",
    "question": "A storm damages farms and blocks transport routes. Why might food prices rise for two reasons?",
    "options": [
      "Demand disappears and transport becomes free.",
      "Imports and exports become the same activity.",
      "Less food is produced and less of what remains can reach markets.",
      "Sellers can protect profit by raising prices above their added costs."
    ],
    "correctAnswer": 2,
    "explanation": "The storm can reduce farm supply and disrupt distribution, creating scarcity at markets."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Trade and Value Added",
    "question": "Jamaica exports raw fruit and also processed jam. Why might processing create additional economic value?",
    "options": [
      "Processing changes an export into an import.",
      "Jam requires no workers, equipment or packaging.",
      "Raw fruit has no economic value before processing.",
      "Processing adds labour and inputs to create a higher-value good."
    ],
    "correctAnswer": 3,
    "explanation": "Turning fruit into jam adds labour, skills, packaging and production, which can increase the product's value."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Tax and Accountability",
    "question": "Citizens pay taxes and a school roof is repaired. What second step supports trust in the public benefit?",
    "options": [
      "Assume the roof is sound because taxes were collected.",
      "Publish authorised costs, completed work and inspection results.",
      "Keep spending secret to prevent disagreement.",
      "Measure public trust through visible improvements to the building."
    ],
    "correctAnswer": 1,
    "explanation": "Transparent records connect public revenue to verified work and permit accountability."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Resilience",
    "question": "A community depends heavily on visitors, then a hurricane stops tourism. Which earlier strategy would have reduced income risk?",
    "options": [
      "Develop other local products and skills alongside tourism.",
      "Use the tourism earnings to expand visitor entertainment.",
      "Give tourism businesses priority over other local enterprises.",
      "Plan on visitor numbers returning quickly after disruptions."
    ],
    "correctAnswer": 0,
    "explanation": "Diversifying income sources reduces dependence on one industry when shocks interrupt tourism."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Cooperative Decision",
    "question": "A cooperative can borrow for equipment that cuts costs, but sales are uncertain. What two checks should members make?",
    "options": [
      "Approve the loan because lower equipment costs should attract customers.",
      "Avoid borrowing because uncertain sales make repayment too risky.",
      "Estimate realistic savings and sales, then compare them with repayment obligations.",
      "Let one member borrow without cooperative records."
    ],
    "correctAnswer": 2,
    "explanation": "Members should test whether expected benefits can cover repayments under realistic sales conditions."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Emergency Fund Reasoning",
    "question": "A family saves monthly but uses the fund for frequent wants. Why does the fund fail during emergencies?",
    "options": [
      "Monthly saving can make optional purchases seem easier to afford.",
      "Emergency funds are more useful for businesses than households.",
      "The family's income must be exactly the same each month.",
      "Withdrawal rules fail to protect emergency savings."
    ],
    "correctAnswer": 3,
    "explanation": "An emergency fund needs a defined purpose and disciplined withdrawals as well as regular contributions."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Budget and Opportunity Cost",
    "question": "A student increases transport spending, leaving less for lunch and saving. What should the revised budget show?",
    "options": [
      "Show the higher transport total without changing the other categories.",
      "The new transport need and the lunch or saving amount that must be adjusted.",
      "The original totals even though they no longer balance.",
      "Extra income that has not been earned."
    ],
    "correctAnswer": 1,
    "explanation": "A balanced revision records both the increased expense and the alternative reduced or funded elsewhere."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Environmental External Cost",
    "question": "A business earns profit but sends waste into a river used downstream. Why is private profit not the full economic result?",
    "options": [
      "Downstream health, fishing and cleaning losses are costs imposed on others.",
      "River users share indirectly in the jobs and income created by the business.",
      "Pollution has no economic effect outside the factory.",
      "The selling price is the clearest measure of the business's community effect."
    ],
    "correctAnswer": 0,
    "explanation": "The business's accounts may omit external costs borne by other people and activities."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Enterprise Synthesis",
    "question": "A new snack has strong survey interest but a test sale loses money. What is the best next decision?",
    "options": [
      "Expand production because strong survey interest suggests future profit.",
      "Stop recording costs and rely on customer compliments.",
      "Review price and costs, then test a revised small batch.",
      "Borrow for a factory before changing the product."
    ],
    "correctAnswer": 2,
    "explanation": "The evidence shows possible demand but an unsustainable result, so a revised small test is safer than immediate expansion."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff5Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff5Questions)
      : prepareSocialStudiesPreview(g5SsDiff5Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 5",
        difficulty: "Difficult",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 5</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Difficult Level</p>
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
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-800">Difficult Level Focus</h3>
              <p className="text-slate-700">This test requires critical thinking, synthesis across topics, evaluation of competing perspectives, and multi-step reasoning — the highest NSC Grade 5 Social Studies standard. Each question demands analysis, not just recall.</p>
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
              <p className="text-slate-600">Social Studies Difficult 5</p>
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
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">Teacher-Style Feedback</h3>
                <p className="text-slate-700">Difficult Social Studies questions require you to think beyond facts — connecting causes to effects, evaluating evidence, and understanding why historical and civic decisions matter today. Review each explanation carefully.</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 5</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
