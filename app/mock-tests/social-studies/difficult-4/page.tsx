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

const g5SsDiff4Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Competing Historical Claims",
    "question": "Four students explain why Taíno communities often settled near rivers and coasts. Which claim best combines resource and transport evidence?",
    "options": [
      "Waterways supported food, fresh water and canoe travel.",
      "Rivers existed mainly to mark future parish borders.",
      "Coasts prevented communities from growing cassava.",
      "Canoes became more important during later colonial trade."
    ],
    "correctAnswer": 0,
    "explanation": "Rivers and coasts supported drinking water, fishing, farming locations and canoe movement; the alternatives conflict with chronology or evidence."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Evaluating Colonial Explanations",
    "question": "Why did English records become more common after 1655? Which explanation is strongest?",
    "options": [
      "Spanish officials adopted English law before conquest.",
      "Independence required English records in 1655.",
      "English conquest changed colonial government and record-keeping.",
      "Emancipation transferred records to England."
    ],
    "correctAnswer": 2,
    "explanation": "England captured Jamaica in 1655 and established its own colonial administration, making English government records more common."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Explaining Resistance",
    "question": "A speaker says the Baptist War was simply an accidental disturbance. Which evidence most strongly challenges that explanation?",
    "options": [
      "A single weather report from the same period",
      "A modern map of Jamaican tourist sites",
      "A list of governors after Independence",
      "Coordinated resistance across plantations"
    ],
    "correctAnswer": 3,
    "explanation": "Evidence of organisation and coordination supports deliberate resistance rather than an accidental disturbance."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Competing Emancipation Claims",
    "question": "Which statement best resolves the disagreement “freedom came in 1834” versus “freedom came in 1838”?",
    "options": [
      "Full freedom came in 1834, while Apprenticeship began for the first time in 1838.",
      "Apprenticeship delayed full freedom until 1838.",
      "1834 ended Apprenticeship and 1838 began slavery.",
      "The dates describe laws passed by separate colonial assemblies."
    ],
    "correctAnswer": 1,
    "explanation": "The two dates describe stages: legal emancipation in 1834 followed by Apprenticeship until full freedom in 1838."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Morant Bay Interpretation",
    "question": "One account blames only individual anger for Morant Bay; another cites poverty, land and unequal justice. Which is better supported by wider evidence?",
    "options": [
      "The second, because documented grievances help explain collective protest.",
      "The first, because personal anger was the main recorded complaint.",
      "The first, because land and justice were settled in 1865.",
      "Neither, because surviving records describe events rather than causes."
    ],
    "correctAnswer": 0,
    "explanation": "Evidence of long-standing grievances provides a broader explanation for why many people supported protest."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Assessing Heroic Contribution",
    "question": "A committee wants to honour only military resistance as national service. Which response best applies Jamaica's hero tradition?",
    "options": [
      "Holding elected office is the clearest form of national service.",
      "Public recognition is enough to qualify a person as a National Hero.",
      "National service also includes political, labour and freedom leadership.",
      "Historical contribution depends on present popularity."
    ],
    "correctAnswer": 2,
    "explanation": "Jamaica's National Heroes represent varied contributions, including resistance, emancipation, labour and nation-building."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "1938 Explanations",
    "question": "Which explanation best accounts for widespread labour unrest in 1938?",
    "options": [
      "Universal Adult Suffrage gave workers a direct way to resolve their grievances.",
      "Independence caused workers to oppose colonial Spain.",
      "CARICOM required workers to strike across Jamaica.",
      "Economic hardship and poor working conditions encouraged organised protest."
    ],
    "correctAnswer": 3,
    "explanation": "Low wages, unemployment and harsh conditions contributed to unrest and demands for reform."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Suffrage Reasoning",
    "question": "A student argues that Universal Adult Suffrage made Jamaica independent in 1944. What is the best correction?",
    "options": [
      "It ended slavery, while voting remained restricted.",
      "It widened voting, while colonial status continued until 1962.",
      "It created the Senate before any elections existed.",
      "It transferred Jamaica back to Spanish government."
    ],
    "correctAnswer": 1,
    "explanation": "Adult suffrage expanded electoral participation in 1944; Independence was a separate constitutional change in 1962."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Independence Debate",
    "question": "Which evidence best answers the claim that Independence meant Jamaica could no longer cooperate internationally?",
    "options": [
      "Jamaica retained voluntary regional and Commonwealth relationships.",
      "Independence limited Jamaica to short-term international agreements.",
      "CARICOM dissolved when Jamaica became independent.",
      "The national flag became the main symbol used in foreign relations."
    ],
    "correctAnswer": 0,
    "explanation": "Sovereignty allows Jamaica to choose international cooperation; Independence did not require isolation."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Historical Accountability",
    "question": "A heritage board must choose between a dramatic legend and a less dramatic account supported by records. Which choice is responsible?",
    "options": [
      "Choose the legend because visitors may prefer it.",
      "Combine both without explaining their different evidence.",
      "Use the supported account and clearly label uncertain traditions.",
      "Remove all history because sources sometimes disagree."
    ],
    "correctAnswer": 2,
    "explanation": "Responsible public history distinguishes documented evidence from tradition and openly identifies uncertainty."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Competing Map Interpretations",
    "question": "A road appears short on one map and long on another. Which explanation should planners test first?",
    "options": [
      "The road physically changes whenever it is printed.",
      "North may have moved between the two maps.",
      "Distance cannot be represented on a map.",
      "Different scales or route segments"
    ],
    "correctAnswer": 3,
    "explanation": "Scale and route coverage can change the mapped length without changing the actual road."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Rainfall Explanations",
    "question": "A windward slope is wetter than a leeward slope. Which explanation best fits relief rainfall?",
    "options": [
      "Mountains manufacture water inside their rocks.",
      "Moist air rises, cools and rains before descending drier.",
      "Leeward areas are usually farther from the moisture-bearing winds.",
      "Windward slopes receive rain because they face north."
    ],
    "correctAnswer": 1,
    "explanation": "Moist air loses water as it rises and cools, leaving descending air drier on the sheltered side."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Watershed Dispute",
    "question": "Residents blame a muddy river only on rain; farmers blame hillside clearing. Which investigation best separates the explanations?",
    "options": [
      "Compare rainfall, clearing dates and sediment over time.",
      "Measure river colour once during the dry season.",
      "Count houses far outside the watershed.",
      "Interview people living nearest to the cleared hillsides."
    ],
    "correctAnswer": 0,
    "explanation": "Time-linked rainfall, land-cover and sediment data can show whether clearing adds erosion beyond normal rain effects."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Hurricane Risk Explanation",
    "question": "A family far from the eye thinks it faces no danger. Which explanation best corrects that view?",
    "options": [
      "The eye contains the strongest winds and heaviest rain.",
      "Distance from the eye greatly reduces flood and landslide risk.",
      "Hazards such as rain, flooding, wind and surge extend beyond the eye.",
      "Warnings are most useful where the centre is expected to make landfall."
    ],
    "correctAnswer": 2,
    "explanation": "A hurricane's damaging winds, rain bands, floods and surge can affect a wide area outside the eye."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Mangrove Decision",
    "question": "Fishers and builders disagree over clearing mangroves. Which proposal best considers both livelihoods and protection?",
    "options": [
      "Clear selected mangroves because new buildings provide local employment.",
      "Restrict fishing and coastal construction in the proposed development area.",
      "Let each person clear any area without shared rules.",
      "Protect key mangroves and locate suitable development away from vital habitat."
    ],
    "correctAnswer": 3,
    "explanation": "Planning can protect nursery habitat and shoreline functions while directing development to safer, less damaging sites."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Explanation",
    "question": "One planner says a cheap floodplain is automatically the best housing site. Which competing explanation is stronger?",
    "options": [
      "A low purchase price leaves enough money to manage flood risks.",
      "Future flood and safety costs may outweigh the lower price.",
      "Good road access can make drainage improvements affordable.",
      "Housing demand makes elevation irrelevant."
    ],
    "correctAnswer": 1,
    "explanation": "A complete cost comparison includes future hazard exposure, infrastructure needs and human safety."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Pollution Responsibility",
    "question": "A factory and a market sit beside a polluted stream. Which civic-minded investigation is fairest?",
    "options": [
      "Test water above and below both sites at comparable times.",
      "Blame the larger business without sampling.",
      "Close the market because it has more customers.",
      "Accept both owners' claims without evidence."
    ],
    "correctAnswer": 0,
    "explanation": "Comparable sampling can help identify where pollution enters and supports fair, evidence-based enforcement."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Conservation Conflict",
    "question": "Residents want reef protection; tour operators fear losing income. Which policy best addresses both concerns?",
    "options": [
      "Permit anchors everywhere during busy months.",
      "Close coastal businesses beside the most visited reef areas.",
      "Use zones, moorings and monitored visitor limits.",
      "Protect reef areas that have the lowest current visitor use."
    ],
    "correctAnswer": 2,
    "explanation": "Targeted controls can reduce damage while allowing carefully managed tourism in suitable areas."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Climate Explanation",
    "question": "One unusually cool month is used to deny a long-term temperature rise. What is wrong with that reasoning?",
    "options": [
      "A rising climate trend should produce warmer conditions in most months.",
      "Climate records should exclude cool observations.",
      "Temperature and rainfall are exactly the same measure.",
      "One weather event cannot overturn a multi-year climate trend."
    ],
    "correctAnswer": 3,
    "explanation": "Climate trends are evaluated over long periods and may still contain short cool intervals."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Community Hazard Choice",
    "question": "A community can fund warning sirens or one additional shelter. Which information would BEST show which safety gap is greater?",
    "options": [
      "The cost and installation time for each project",
      "Shelter capacity, the number of exposed residents and how many people current warnings reach",
      "How many residents say they prefer warning sirens or a shelter",
      "The age of the existing shelter and the number of past storms residents remember"
    ],
    "correctAnswer": 1,
    "explanation": "Shelter capacity, population exposure and warning coverage directly show whether the larger unmet need is safe shelter space or the ability to warn people in time."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Legislative Disagreement",
    "question": "A group wants a national law changed. Another tells them to ask a parish market manager. Which route fits the issue?",
    "options": [
      "Petition representatives and participate lawfully in Parliament.",
      "Ask the market manager to amend national legislation.",
      "Demand that a judge write a new law outside a case.",
      "Treat the law as unchangeable and avoid participation."
    ],
    "correctAnswer": 0,
    "explanation": "National legislation belongs to Parliament's law-making sphere, although citizens may advocate change lawfully."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "A speaker claims the Governor-General personally creates government policy without constitutional limits. Which response is sound?",
    "options": [
      "The office directs Parliament and reviews decisions made by the courts.",
      "The office manages all parish drains and markets.",
      "The Governor-General performs formal constitutional duties within Jamaica's system of elected government.",
      "The office is a private business with no public duties."
    ],
    "correctAnswer": 2,
    "explanation": "The Governor-General performs constitutionally defined duties within Jamaica's system of government; the office does not have unlimited personal authority to create government policy."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Court Independence",
    "question": "A popular petition demands a guilty verdict before evidence is heard. What should the court do?",
    "options": [
      "Follow the petition because popularity determines guilt.",
      "Ask Parliament to decide the individual case.",
      "Cancel the hearing and publish no reasons.",
      "Apply law and evidence independently despite public pressure."
    ],
    "correctAnswer": 3,
    "explanation": "A fair court must assess the case through lawful procedure and evidence, not pressure."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Local Authority Application",
    "question": "Residents need repairs to a parochial road and nearby drain. Which explanation best supports contacting the Municipal Corporation?",
    "options": [
      "Municipal Corporations set national monetary policy.",
      "Local infrastructure commonly managed by local authorities",
      "Local authorities decide appeals from the Supreme Court.",
      "Municipal Corporations represent Jamaica in regional negotiations."
    ],
    "correctAnswer": 1,
    "explanation": "Jamaica's Municipal Corporations manage many local roads, drains and related facilities."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Balancing Rights",
    "question": "A meeting organiser wants only supporters to speak about a public plan. Which procedure is fairer?",
    "options": [
      "Apply equal contribution rules to differing views.",
      "Allow supporters unlimited time and silence others.",
      "Publish opponents' private addresses.",
      "Cancel the meeting to avoid disagreement."
    ],
    "correctAnswer": 0,
    "explanation": "Fair participation uses consistent rules and permits respectful, relevant disagreement."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Civic Evidence",
    "question": "Officials say a park is unused; residents say it is crowded. Which evidence should guide the decision?",
    "options": [
      "One official's memory from a rainy morning",
      "One resident's estimate from a holiday",
      "Repeated counts at varied days and times plus user feedback",
      "The number of trees without any usage data"
    ],
    "correctAnswer": 2,
    "explanation": "Repeated observations and feedback across representative times provide stronger evidence than isolated impressions."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Public Accountability",
    "question": "A contractor finishes a public project late and over budget. Which response best supports accountability without assuming wrongdoing?",
    "options": [
      "Declare fraud before examining any record.",
      "Ignore all differences from the contract.",
      "Delete the original schedule and budget.",
      "Request records, reasons and authorised changes."
    ],
    "correctAnswer": 3,
    "explanation": "Evidence should establish what changed, why, and whether changes were properly authorised."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Regional and National Roles",
    "question": "A CARICOM agreement concerns eligible skilled movement, but a worker also needs national documents. What principle applies?",
    "options": [
      "CARICOM agreements replace national rules for eligible workers.",
      "Regional arrangements retain national administrative requirements.",
      "A parish council issues all regional skills approvals.",
      "Regional cooperation prevents document checks."
    ],
    "correctAnswer": 1,
    "explanation": "Regional frameworks and national procedures work together; applicable documents and eligibility still matter."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Majority and Safety",
    "question": "Most survey respondents want a playground on unstable land. What should officials explain?",
    "options": [
      "Balance majority preference with public-safety evidence.",
      "A majority vote changes the physical stability of land.",
      "Engineering evidence should be considered after the survey result.",
      "Officials should hide the hazard to preserve support."
    ],
    "correctAnswer": 0,
    "explanation": "Democratic input is important but does not remove legal and safety responsibilities."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Resolving Public Disputes",
    "question": "Two vendors claim the same market space. Which local response is most defensible?",
    "options": [
      "Give the space to the louder vendor.",
      "Remove both without checking any record.",
      "Check records, hear both vendors and apply one rule.",
      "Change the rule secretly after deciding."
    ],
    "correctAnswer": 2,
    "explanation": "Consistent rules, records and an opportunity to be heard support a fair decision."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Competing Cost Explanations",
    "question": "A shop's sales rise but profit falls. Which explanation should be investigated first?",
    "options": [
      "Higher sales generally produce higher profit when prices stay steady.",
      "Profit and revenue are identical totals.",
      "The shop must have stopped selling goods.",
      "Costs may have risen faster than sales revenue."
    ],
    "correctAnswer": 3,
    "explanation": "Profit depends on revenue minus costs, so rising sales do not guarantee rising profit."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Demand Explanation",
    "question": "A concert price falls and ticket sales rise. Which conclusion is most careful?",
    "options": [
      "The price change suggests that buyers had more income to spend.",
      "The lower price may have led buyers to purchase more tickets, but other changes should also be checked.",
      "Demand is usually too stable to respond quickly to a price change.",
      "More sales prove the concert's costs fell."
    ],
    "correctAnswer": 1,
    "explanation": "More ticket sales after a price cut are consistent with buyers purchasing more at the lower price, but other influences should still be checked before claiming that price was the only cause."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Import Decision",
    "question": "A producer can use cheaper imported fruit or costlier local fruit. Which evaluation is most complete?",
    "options": [
      "Compare quality, reliability, total cost and effects on local suppliers.",
      "Choose imports because their lower price gives the clearest saving.",
      "Choose local fruit without checking quality or supply.",
      "Stop production because choices create trade-offs."
    ],
    "correctAnswer": 0,
    "explanation": "A sound sourcing decision considers several costs, benefits and risks rather than one label."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Tax Fairness Discussion",
    "question": "Residents disagree about funding a public clinic. Which explanation supports taxation most directly?",
    "options": [
      "Taxes make medical workers unnecessary.",
      "A clinic has no equipment or maintenance costs.",
      "Shared revenue can fund services that benefit many people.",
      "People who use public clinics most often should provide the clinic's tax revenue."
    ],
    "correctAnswer": 2,
    "explanation": "Public revenue helps pay for shared staff, buildings, supplies and services."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Costs and Benefits",
    "question": "A cruise stop increases sales but also waste. Which decision is best?",
    "options": [
      "Reduce tourism because visitor activity creates additional waste.",
      "Ignore waste because sales increased.",
      "Move waste to another community without treatment.",
      "Keep the economic opportunity while requiring adequate waste management."
    ],
    "correctAnswer": 3,
    "explanation": "The goal is to retain benefits while preventing or managing costs imposed on the community."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Cooperative Governance",
    "question": "A cooperative leader refuses to show members the accounts. Which response best protects the cooperative?",
    "options": [
      "Trust the leader because records create conflict.",
      "Require transparent records and agreed oversight.",
      "Divide money before checking obligations.",
      "End member voting to speed decisions."
    ],
    "correctAnswer": 1,
    "explanation": "Shared enterprises require accountable records and governance so members can verify decisions."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Saving Versus Debt",
    "question": "A household can save for a non-urgent appliance or buy immediately on costly credit. Which comparison is strongest?",
    "options": [
      "Saving avoids interest and reduces financial pressure.",
      "Credit has no cost when the item is wanted.",
      "Saving may allow the household to buy when the appliance is discounted.",
      "Borrowing can preserve cash for other household expenses."
    ],
    "correctAnswer": 0,
    "explanation": "The decision balances timing against interest and repayment pressure; for a non-urgent purchase, saving may reduce total cost."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Budget Priorities",
    "question": "A budget cannot cover rent, food, entertainment and a new phone. Which explanation best applies needs and wants?",
    "options": [
      "Entertainment becomes essential when money is short.",
      "Divide the available money evenly among the four categories.",
      "Housing and food before optional purchases.",
      "The phone removes the need to budget."
    ],
    "correctAnswer": 2,
    "explanation": "A constrained budget first protects essential needs, then considers lower-priority wants."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Environmental Costs",
    "question": "A quarry creates jobs but increases dust near homes. Which proposal best handles the competing effects?",
    "options": [
      "Count jobs but exclude health and cleaning costs.",
      "Pause the quarry until evidence shows that nearby dust levels are safe.",
      "Allow dust until residents move away.",
      "Require dust controls, monitoring and safeguards."
    ],
    "correctAnswer": 3,
    "explanation": "A balanced decision values employment while requiring the business to reduce and monitor harmful effects."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Enterprise Claims",
    "question": "Two sellers claim their new product will succeed. Seller A has repeated customer orders; Seller B has only personal confidence. Which has stronger evidence?",
    "options": [
      "Seller B, because confidence shows commitment to the product.",
      "Seller A, because actual orders demonstrate demand more directly.",
      "Both, because evidence is unnecessary for enterprise.",
      "Seller B, because no records means no risk."
    ],
    "correctAnswer": 1,
    "explanation": "Repeated orders provide observable demand evidence; confidence alone does not show customers will buy."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff4Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff4Questions)
      : prepareSocialStudiesPreview(g5SsDiff4Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 4",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 4</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 4</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 4</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
