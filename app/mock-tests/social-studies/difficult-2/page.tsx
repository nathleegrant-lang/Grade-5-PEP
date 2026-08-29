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

const g5SsDiff2Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Comparing Early Societies",
    "question": "One display shows Taíno villages near rivers with farming and fishing tools. Another shows Spanish settlements organised around forts and colonial rule. Which comparison is best supported?",
    "options": [
      "Both settlement systems were created after British rule began.",
      "Taíno sites served local needs; Spanish sites also served colonial control.",
      "Spanish settlers kept most Taíno political practices unchanged.",
      "Taíno villages were built mainly to control trade with Europe."
    ],
    "correctAnswer": 1,
    "explanation": "The evidence connects Taíno villages to local resources and Spanish settlements to both occupation and colonial administration."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Colonial Chronology",
    "question": "A student orders four events: Spanish rule begins, English capture, Morant Bay Rebellion, Independence. Which sequence is correct from earliest to latest?",
    "options": [
      "Spanish rule → English capture → Morant Bay Rebellion → Independence",
      "English capture → Spanish rule → Independence → Morant Bay Rebellion",
      "Morant Bay Rebellion → Spanish rule → English capture → Independence",
      "Spanish rule → Independence → English capture → Morant Bay Rebellion"
    ],
    "correctAnswer": 0,
    "explanation": "Spain colonised Jamaica before England captured it in 1655; Morant Bay occurred in 1865 and Independence in 1962."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Comparing Resistance",
    "question": "How were Maroon resistance and the Baptist War alike, even though they occurred in different periods?",
    "options": [
      "Both occurred after Jamaica gained Independence.",
      "Both were campaigns for Universal Adult Suffrage.",
      "Both challenged systems of oppression and showed organised resistance.",
      "Both were led by elected Members of Parliament."
    ],
    "correctAnswer": 2,
    "explanation": "The movements differed in setting and leadership but both involved organised resistance to oppression."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Freedom Timeline",
    "question": "Why is it inaccurate to place full freedom in 1834 without mentioning 1838?",
    "options": [
      "Slavery ended in 1838 and Apprenticeship began in 1865.",
      "Emancipation began in 1834, but Apprenticeship delayed full freedom until 1838.",
      "Full freedom came in 1834, then slavery returned for four years.",
      "Independence and Emancipation occurred together in 1838."
    ],
    "correctAnswer": 1,
    "explanation": "The 1834 change introduced Apprenticeship; the system ended in 1838, when full freedom came."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Comparing Reform Movements",
    "question": "Which comparison best distinguishes Morant Bay in 1865 from the labour unrest of 1938?",
    "options": [
      "Morant Bay challenged colonial injustice; 1938 advanced labour and political reform.",
      "Both events directly created Independence on the same day.",
      "Morant Bay concerned tourism, while 1938 concerned hurricanes.",
      "Both were elections held under Universal Adult Suffrage."
    ],
    "correctAnswer": 0,
    "explanation": "The events shared grievances about hardship and injustice but occurred in different eras and produced different reform pressures."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Heroes Across Time",
    "question": "Which pairing correctly compares the main historical settings of George William Gordon and Norman Manley?",
    "options": [
      "Gordon led the Baptist War; Manley led Maroon resistance.",
      "Both served as governors during Spanish rule.",
      "Gordon is linked to Morant Bay reform; Manley to modern political development.",
      "Gordon negotiated Independence in 1962; Manley ended Apprenticeship in 1838."
    ],
    "correctAnswer": 2,
    "explanation": "Gordon belongs to the nineteenth-century Morant Bay context, while Manley's work belongs to twentieth-century national political development."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Political Development Sequence",
    "question": "Which sequence best shows Jamaica's movement toward wider political control by its people?",
    "options": [
      "1962 Independence → 1938 labour unrest → 1944 Universal Adult Suffrage",
      "1938 labour unrest → 1944 Universal Adult Suffrage → 1962 Independence",
      "1944 Universal Adult Suffrage → 1838 full freedom → 1938 labour unrest",
      "1938 labour unrest → 1962 Independence → 1944 Universal Adult Suffrage"
    ],
    "correctAnswer": 1,
    "explanation": "Labour unrest strengthened reform pressure, adult suffrage widened voting in 1944, and Independence followed in 1962."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Fact and Opinion",
    "question": "Which comparison correctly identifies a fact and an opinion about National Heroes?",
    "options": [
      "“Sam Sharpe helped lead the Baptist War” is verifiable; “he was the bravest hero” is a judgement.",
      "Both statements are facts because they mention the same person.",
      "Both are opinions because historical sources require interpretation.",
      "The bravery statement is factual because it praises a documented leader."
    ],
    "correctAnswer": 0,
    "explanation": "Leadership in a documented event can be checked against sources; describing someone as the bravest depends on judgement."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Comparing Independence",
    "question": "How did the change in 1962 differ from the change in 1944?",
    "options": [
      "1944 ended slavery; 1962 began Apprenticeship.",
      "1944 created CARICOM; 1962 introduced the first election.",
      "1944 widened voting; 1962 established national Independence.",
      "Both dates mark exactly the same constitutional change."
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage expanded electoral participation in 1944, while Independence changed Jamaica's national political status in 1962."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Corroborating Sources",
    "question": "Two textbooks agree on an event's date but disagree about its most important cause. What comparison should a researcher make next?",
    "options": [
      "Choose the author whose book has more pages.",
      "Compare the evidence each author uses and consult additional relevant sources.",
      "Agreement on the date also confirms the more detailed explanation.",
      "Reject both accounts because historians may interpret causes differently."
    ],
    "correctAnswer": 1,
    "explanation": "Agreement on chronology does not settle interpretation; the causes must be compared using evidence and corroboration."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Comparing Map Scales",
    "question": "Map A uses 1 cm = 2 km and Map B uses 1 cm = 10 km. The same road looks longer on Map A. Why?",
    "options": [
      "Map A shows the area at a larger scale, so the road occupies more map space.",
      "The real road changes length when the map changes.",
      "Map B shows the road at one fifth of its actual distance.",
      "North points in different directions when the scale changes."
    ],
    "correctAnswer": 0,
    "explanation": "A larger-scale map shows a smaller area in more detail, so the same feature appears longer on the page."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Relief Comparison",
    "question": "Two farms receive similar total rainfall, but Farm A is on a steep slope and Farm B is on level ground. Which farm has greater erosion risk if both are bare?",
    "options": [
      "Farm B, because level land holds more water and releases it quickly.",
      "Farm A, because water can move downslope faster and carry more soil.",
      "Both have no erosion risk unless they are coastal.",
      "Farm A, because elevation prevents plants from growing anywhere."
    ],
    "correctAnswer": 1,
    "explanation": "With similar rainfall and cover, steeper relief can increase runoff speed and soil loss."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "River Chronology",
    "question": "Which sequence correctly traces rainwater through a watershed to the sea?",
    "options": [
      "River reaches coast → rain climbs mountains → streams separate into clouds",
      "Rain enters the sea → rivers flow inland → streams reach high land",
      "Rain falls on high land → runoff enters streams → streams join rivers → river reaches the coast",
      "Streams become roads → rain enters gullies → coast moves uphill"
    ],
    "correctAnswer": 2,
    "explanation": "Gravity carries runoff from higher land through connected streams and rivers toward the coast."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Comparing Hurricane Hazards",
    "question": "How does storm surge differ from river flooding during a hurricane?",
    "options": [
      "Storm surge pushes seawater ashore; river floods overflow channels.",
      "Storm surge begins on higher ground, while river flooding begins near beaches.",
      "Both terms mean wind damage to roofs.",
      "River flooding is salt water raised by ocean waves."
    ],
    "correctAnswer": 0,
    "explanation": "The hazards can occur together, but their immediate water sources and locations differ."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Coastal Protection Comparison",
    "question": "A bare beach and a mangrove-lined shore face similar waves. Which difference is most likely?",
    "options": [
      "The bare beach produces more young fish because it has no roots.",
      "The mangrove shore experiences less wave energy and offers more nursery habitat.",
      "Mangroves make incoming waves stronger before they reach shore.",
      "Both shores respond identically because vegetation cannot affect coasts."
    ],
    "correctAnswer": 1,
    "explanation": "Mangrove roots slow water and trap sediment while creating sheltered habitat for juvenile marine life."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Change",
    "question": "A village grows from 500 to 2,000 residents while its water and waste systems remain unchanged. Which comparison best predicts the result?",
    "options": [
      "Service demand falls because more people share the same system.",
      "Population growth produces enough revenue to expand services immediately.",
      "Service demand outgrows capacity, causing shortages and waste problems.",
      "The village's classification changes, so service capacity is no longer relevant."
    ],
    "correctAnswer": 2,
    "explanation": "A much larger population places greater pressure on unchanged infrastructure and service capacity."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Comparing Environmental Data",
    "question": "Beach X has litter counts of 80, 76 and 82. Beach Y has 70, 45 and 20 after prevention measures. Which conclusion is strongest?",
    "options": [
      "Beach Y declines steadily; Beach X remains fairly stable.",
      "Beach X improved more because 82 is the largest number.",
      "Both beaches reached zero litter.",
      "One count from Beach Y proves the measures work everywhere."
    ],
    "correctAnswer": 0,
    "explanation": "The repeated downward pattern at Beach Y differs from the stable high counts at Beach X, though further evidence would strengthen causation."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Land-Use Trade-offs",
    "question": "Two hillside communities need homes. Community A clears every tree; Community B preserves vegetation and builds drainage. Which has the safer plan?",
    "options": [
      "Community A, because bare slopes absorb rain more quickly.",
      "Community B, because it combines development with runoff and slope protection.",
      "Community A, because clearing improves slope stability during rain.",
      "Both plans have equal risk regardless of slope management."
    ],
    "correctAnswer": 1,
    "explanation": "Vegetation and drainage can reduce runoff and erosion, so Community B addresses a known hazard while developing."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Weather and Climate",
    "question": "Town A records one unusually cool week. Its 30-year temperature record still shows warming. Which comparison is correct?",
    "options": [
      "The cool week is more reliable than the earlier records.",
      "A week of weather is sufficient to measure climate.",
      "Short-term cool weather can occur within long-term warming.",
      "A warming trend makes a cool week inconsistent with the record."
    ],
    "correctAnswer": 2,
    "explanation": "Weather describes short periods; climate conclusions use long-term patterns that can include temporary cool conditions."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Comparing Conservation Results",
    "question": "Reef Zone A bans anchors but allows monitored swimming; Zone B has no anchor rules. After a year, A has less new coral breakage. What is the best comparison?",
    "options": [
      "Anchor controls fit the reduced damage; monitoring should continue.",
      "The swimming rules show that anchor damage is no longer important.",
      "Zone B is healthier because it has fewer rules.",
      "The result shows Zone A is protected from hurricane damage."
    ],
    "correctAnswer": 0,
    "explanation": "The difference supports the value of anchor controls, while monitoring helps account for other causes of reef change."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Comparing Parliamentary Chambers",
    "question": "Which comparison between Jamaica's House of Representatives and Senate is accurate?",
    "options": [
      "The Senate reviews legislation, while the House is outside Parliament.",
      "Both are chambers with different membership and roles.",
      "The House manages parish drains while the Senate runs markets.",
      "Both are courts that decide criminal cases."
    ],
    "correctAnswer": 1,
    "explanation": "The House and Senate are the two parliamentary chambers, with different membership arrangements and roles in reviewing legislation."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Sequence of a Bill",
    "question": "Which ordering best represents a simplified path for national legislation?",
    "options": [
      "Proposal and debate → approval through Parliament → formal assent → law takes effect as provided",
      "Formal assent → first proposal → court trial → local election",
      "Municipal approval → hurricane warning → Senate appointment → tax refund",
      "Law takes effect → Parliament considers it → proposal is written"
    ],
    "correctAnswer": 0,
    "explanation": "A proposal must be considered through the law-making process before formal assent and commencement."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "National and Local Roles",
    "question": "Which comparison best distinguishes Parliament from a Municipal Corporation?",
    "options": [
      "Parliament manages community waste while Municipal Corporations appoint national officials.",
      "Both bodies mainly carry out national legislative duties.",
      "Parliament makes national laws; a Municipal Corporation manages many local facilities and services.",
      "Municipal Corporations make Jamaica's Constitution without Parliament."
    ],
    "correctAnswer": 2,
    "explanation": "Parliament has national legislative functions, while local authorities handle many parish-level facilities and services."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Courts and Parliament",
    "question": "A court interprets a law in a case, while Parliament debates changing that law. Why are these actions different?",
    "options": [
      "Courts and Parliament are two names for the same institution.",
      "Courts interpret law independently; Parliament makes legislation.",
      "Parliament may decide cases when legislation is disputed.",
      "Courts may rewrite legislation while interpreting a case."
    ],
    "correctAnswer": 1,
    "explanation": "The separation of functions supports lawful government: courts adjudicate cases and Parliament legislates."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights Comparison",
    "question": "Two students criticise a policy. One presents evidence peacefully; the other threatens people who disagree. Which student acts consistently with rights and responsibilities?",
    "options": [
      "The peaceful student respects expression, safety and others' rights.",
      "The threatening student, because force can make criticism more effective.",
      "Both, because responsibilities apply mainly to officials.",
      "Neither, because citizens should avoid criticism when a policy is lawful."
    ],
    "correctAnswer": 0,
    "explanation": "Freedom of expression is exercised alongside responsibility for lawful, non-violent conduct and respect for others."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Participation Over Time",
    "question": "Which sequence shows responsible participation from identifying a problem to checking results?",
    "options": [
      "Spread a rumour → damage property → hide records → demand praise",
      "Choose a solution → refuse evidence → exclude residents → end review",
      "Gather evidence → consult affected people → submit a lawful proposal → monitor the response",
      "Monitor results → invent a problem → avoid consultation → erase the proposal"
    ],
    "correctAnswer": 2,
    "explanation": "Responsible action begins with evidence and consultation, proceeds lawfully and includes follow-up."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Comparing Accountability",
    "question": "Agency A publishes a budget and receipts. Agency B publishes only a claim that money was well spent. Which is more accountable?",
    "options": [
      "Agency B, because fewer details prevent questions.",
      "Agency A, because records allow the public to compare plans with actual spending.",
      "Both are equally transparent without supporting records.",
      "Agency B, because public money does not require explanation."
    ],
    "correctAnswer": 1,
    "explanation": "Accountability depends on evidence that permits spending to be checked, not merely an unsupported assurance."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "CARICOM and CSME",
    "question": "Which comparison is most accurate?",
    "options": [
      "CARICOM is the community; CSME covers defined economic arrangements.",
      "The CSME is a Jamaican Municipal Corporation.",
      "CARICOM is a court that replaces national courts.",
      "Both terms mean unrestricted worldwide migration."
    ],
    "correctAnswer": 0,
    "explanation": "CARICOM is the regional organisation, while CSME arrangements address defined areas such as goods, services, business establishment and eligible skilled movement."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Public Priorities",
    "question": "Town A chooses a project after publishing evidence; Town B chooses privately without criteria. Which process better supports public trust?",
    "options": [
      "Town B's secrecy protects officials from pressure and therefore supports fairness.",
      "Town B's process, because publishing evidence delays decisions.",
      "Town A's process, because transparent criteria can be examined and challenged.",
      "Both, because trust depends on project results rather than stated reasons."
    ],
    "correctAnswer": 2,
    "explanation": "Transparent evidence and criteria allow citizens to understand decisions and hold officials accountable."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Conflict Resolution Sequence",
    "question": "Neighbouring groups dispute access to a field. What should come before enforcement of an agreed schedule?",
    "options": [
      "Punish both groups before learning what happened.",
      "Hear both groups, confirm the rules and record a fair agreement.",
      "Allow one group to destroy the other's equipment.",
      "Suspend the existing rules until one group gains control."
    ],
    "correctAnswer": 1,
    "explanation": "Understanding the facts and rules and recording an agreement creates a fair basis for later compliance."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Comparing Opportunity Costs",
    "question": "Kim uses J$2,000 for school supplies instead of a concert. Andre uses J$2,000 for medicine instead of shoes. What is true in both cases?",
    "options": [
      "Each gives up the next-best use of the same money.",
      "Neither faces scarcity because both spent money.",
      "Their opportunity costs must have equal personal value.",
      "The purchased item is the opportunity cost."
    ],
    "correctAnswer": 0,
    "explanation": "The concert and shoes are the forgone alternatives; opportunity cost arises because resources are limited."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Price Change Comparison",
    "question": "Supply falls for mangoes while demand stays steady; supply rises for bananas while demand stays steady. Which comparison is most likely?",
    "options": [
      "Both prices must rise because demand is unchanged.",
      "Mango prices fall and banana prices rise for the same reason.",
      "Mango prices face upward pressure; banana prices face downward pressure.",
      "Supply changes cannot affect prices."
    ],
    "correctAnswer": 2,
    "explanation": "With similar demand, scarcity tends to raise price while greater availability tends to lower it."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Production Sequence",
    "question": "Which sequence correctly follows a small cassava business from input to sale?",
    "options": [
      "Sell to customers → grow cassava instantly → calculate yesterday's costs → import demand",
      "Buy cassava and packaging → process the product → transport it → sell to customers",
      "Transport an empty package → collect taxes → create rainfall → set wages",
      "Advertise a sold-out item → ignore inputs → stop production → increase supply"
    ],
    "correctAnswer": 1,
    "explanation": "Inputs are obtained and transformed before the product is transported and sold."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Imports and Exports",
    "question": "A bakery imports wheat but exports packaged biscuits. Which comparison is correct?",
    "options": [
      "Wheat enters Jamaica as an input; biscuits leave Jamaica as a finished export.",
      "Both wheat and biscuits are exports because the bakery uses them.",
      "Imports leave the country and exports enter it.",
      "Trade direction depends mainly on who packaged the product."
    ],
    "correctAnswer": 0,
    "explanation": "Imports are brought into the country, while exports are sold abroad; one business may use an import to create an export."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Public and Private Benefits",
    "question": "A tax-funded drainage project protects homes and shops. How does its benefit differ from buying a private umbrella?",
    "options": [
      "The umbrella is a national public service.",
      "The drainage project mainly benefits the workers paid to build it.",
      "Drains provide shared benefits; an umbrella mainly benefits its buyer.",
      "Both purchases must be funded through national taxes."
    ],
    "correctAnswer": 2,
    "explanation": "Public infrastructure can protect many people and properties, while a privately purchased item primarily serves its owner."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tourism Comparison",
    "question": "Resort A imports most supplies; Resort B buys from local farms and craft producers. With similar visitor spending, which creates stronger local linkages?",
    "options": [
      "Resort A, because imported supplies create more demand for local farms.",
      "Resort B, because more spending reaches connected local producers.",
      "Both create identical local supply effects.",
      "Resort A, because local purchases prevent tourism income."
    ],
    "correctAnswer": 1,
    "explanation": "Buying locally circulates more tourism spending through domestic farms, crafts and related employment."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Cooperative Chronology",
    "question": "Which sequence best supports a successful shared farming cooperative?",
    "options": [
      "Agree on rules → record contributions → purchase shared equipment → report costs and benefits",
      "Buy equipment secretly → create rules later → hide costs → divide benefits unfairly",
      "Divide profits before producing anything → avoid records → borrow without agreement",
      "Purchase equipment first → appoint one owner → estimate harvests → divide returns"
    ],
    "correctAnswer": 0,
    "explanation": "Clear rules and records should precede major shared spending and support fair reporting afterward."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Saving Comparison",
    "question": "Family A saves before spending on wants; Family B saves only if money remains. Which is more likely to build a regular emergency fund?",
    "options": [
      "Family B, because optional spending usually leaves a dependable surplus.",
      "Both must save the same amount regardless of income.",
      "Family A, because saving is treated as a planned priority.",
      "Family B, because emergency saving can follow planned wants."
    ],
    "correctAnswer": 2,
    "explanation": "Planning a realistic saving amount first makes saving more consistent than relying on an uncertain remainder."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Budget Sequence",
    "question": "A budget predicts a shortfall. Which order is most responsible?",
    "options": [
      "Borrow immediately → ignore interest → add wants → stop recording",
      "Confirm income and essential costs → reduce lower priorities → set a workable plan → monitor results",
      "Spend first → estimate income later → hide bills → repeat the shortfall",
      "Remove essential costs from the budget → declare a surplus → avoid monitoring"
    ],
    "correctAnswer": 1,
    "explanation": "Accurate figures and priority adjustments should come before spending, followed by review of actual results."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Comparing Business Evidence",
    "question": "Shop A expands after one busy hour. Shop B expands after several weeks of sales and cost records. Which choice has stronger evidence?",
    "options": [
      "Shop B's choice, because it compares repeated demand with full costs over time.",
      "Shop A's choice, because one busy hour is enough to predict demand.",
      "Both choices use identical evidence.",
      "Shop A's choice, because costs are irrelevant when demand rises."
    ],
    "correctAnswer": 0,
    "explanation": "Repeated sales and cost evidence provide a stronger basis for expansion than a single unusually busy period."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff2Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff2Questions)
      : prepareSocialStudiesPreview(g5SsDiff2Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 2",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 2</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 2</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 2</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
