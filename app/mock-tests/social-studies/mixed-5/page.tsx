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

const g5SsMix5Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Taíno Communities",
    "question": "Why did many Taíno communities settle near coasts and rivers?",
    "options": [
      "Waterways supported food gathering, farming and travel.",
      "Mountain peaks were the only safe places to build homes.",
      "Spanish laws required every village to face the sea.",
      "Rivers prevented communities from growing crops."
    ],
    "correctAnswer": 0,
    "explanation": "Coasts and rivers provided water, fish, fertile areas and routes for canoe travel."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Colonial Chronology",
    "question": "Which event occurred first?",
    "options": [
      "Jamaica gained Independence",
      "Universal Adult Suffrage began",
      "The English captured Jamaica",
      "The Morant Bay Rebellion occurred"
    ],
    "correctAnswer": 2,
    "explanation": "The English captured Jamaica in 1655, before Morant Bay in 1865, suffrage in 1944 and Independence in 1962."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Evidence and Perspective",
    "question": "Two accounts describe emancipation: a planter complains about labour costs, while a freed worker describes choosing an employer. What do the accounts show together?",
    "options": [
      "Emancipation affected groups differently and changed labour relationships.",
      "Only the planter's account can be historically useful.",
      "Freedom immediately removed every economic difficulty.",
      "The worker and planter experienced identical changes."
    ],
    "correctAnswer": 0,
    "explanation": "The accounts reflect different positions but together show that emancipation changed work, choice and costs."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Apprenticeship",
    "question": "Why was Apprenticeship criticized after slavery was abolished in 1834?",
    "options": [
      "It transferred national political control from Britain to an independent Jamaican government.",
      "It extended voting rights to all adults regardless of wealth and property ownership.",
      "It removed every plantation and ended agricultural employment within one year.",
      "It required formerly enslaved people to continue compulsory labour for former owners."
    ],
    "correctAnswer": 3,
    "explanation": "Apprenticeship continued compulsory labour and restricted freedom until the system ended in 1838."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Baptist War",
    "question": "Who is most closely associated with leading the Baptist War?",
    "options": [
      "Sam Sharpe",
      "Paul Bogle",
      "Marcus Garvey",
      "Norman Manley"
    ],
    "correctAnswer": 0,
    "explanation": "Sam Sharpe helped organize the 1831–1832 resistance known as the Baptist War."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Cause and Consequence",
    "question": "What connection links the 1938 labour unrest with later political change?",
    "options": [
      "The protests restored Spanish rule and ended British control of Jamaica.",
      "The unrest stopped elections and weakened every form of worker organization.",
      "Workers demanded a return to plantation slavery and compulsory labour.",
      "The protests exposed poor conditions and strengthened labour and political organization."
    ],
    "correctAnswer": 3,
    "explanation": "The protests highlighted hardship and encouraged stronger trade-union and political movements."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Historical Significance",
    "question": "Why is 1944 important in Jamaica's democratic history?",
    "options": [
      "It ended Apprenticeship and brought full freedom after slavery.",
      "It marked Jamaica's achievement of national Independence from Britain.",
      "It introduced Universal Adult Suffrage and widened participation in elections.",
      "It began English colonial rule after the capture of Jamaica."
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage in 1944 allowed a much broader adult population to vote."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "National Identity",
    "question": "Which statement best explains the national motto 'Out of Many, One People'?",
    "options": [
      "Jamaicans share one ancestry and one cultural tradition.",
      "Different cultural influences have contributed to a shared Jamaican nation.",
      "Only the largest cultural group shapes national identity.",
      "The motto refers only to Jamaica's fourteen parishes."
    ],
    "correctAnswer": 1,
    "explanation": "The motto recognizes Jamaica's varied cultural origins and a shared national identity."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Corroborating Evidence",
    "question": "An oral account says villagers secretly supplied food to freedom fighters. What would best corroborate it?",
    "options": [
      "A present-day hotel menu that lists foods sold in another parish",
      "A rainfall map produced long after the freedom fighters were active",
      "A school timetable that contains no reference to supplies or resistance",
      "Independent testimony or records showing unusual food deliveries at the same time"
    ],
    "correctAnswer": 3,
    "explanation": "Independent testimony or contemporary supply records could support the oral account's specific claim."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Comparative Change",
    "question": "Which comparison between 1838 and 1962 is most accurate?",
    "options": [
      "Both dates refer to changes in voting qualifications for adult citizens.",
      "Both dates mark the transfer of Jamaica from Spanish to English control.",
      "Full freedom came in 1962, while national Independence occurred in 1838.",
      "Full freedom from slavery came in 1838, while national Independence came in 1962."
    ],
    "correctAnswer": 3,
    "explanation": "The dates mark different freedoms: full emancipation in 1838 and national Independence in 1962."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Cardinal Direction",
    "question": "If Port B lies directly south of Port A, in which direction is Port A from Port B?",
    "options": [
      "North",
      "East",
      "South",
      "West"
    ],
    "correctAnswer": 0,
    "explanation": "If B is south of A, then A is north of B."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Using Scale",
    "question": "On a map, 2 cm represents 12 km. What distance does 5 cm represent?",
    "options": [
      "24 km",
      "30 km",
      "36 km",
      "60 km"
    ],
    "correctAnswer": 1,
    "explanation": "Each centimetre represents 6 km, so 5 cm represents 30 km."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Contour Evidence",
    "question": "Closely spaced contour lines usually indicate what kind of slope?",
    "options": [
      "A steep slope",
      "A completely flat plain",
      "A coral reef",
      "A parish boundary"
    ],
    "correctAnswer": 0,
    "explanation": "Close contour lines show that elevation changes quickly over a short horizontal distance."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Weather and Climate",
    "question": "Which record is most useful for describing a location's climate?",
    "options": [
      "A photograph showing clouds above the location on one afternoon",
      "A resident's prediction of the weather expected during one weekend",
      "Rainfall and temperature patterns measured at the location over many years",
      "The temperature recorded at noon on the hottest day of one month"
    ],
    "correctAnswer": 2,
    "explanation": "Climate describes long-term patterns, so observations collected over many years are most useful."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Data Interpretation",
    "question": "Monthly rainfall was 60 mm in April, 110 mm in May and 90 mm in June. Which statement is correct?",
    "options": [
      "April was wetter than both May and June.",
      "May had 20 mm more rain than June.",
      "June had twice April's rainfall.",
      "The three-month total was 200 mm."
    ],
    "correctAnswer": 1,
    "explanation": "May's 110 mm was 20 mm greater than June's 90 mm."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Storm Surge",
    "question": "Why should people near a low-lying coast move inland or to higher ground when storm surge is expected?",
    "options": [
      "Strong winds cause all rivers to disappear.",
      "Sea water may be pushed onto land and flood coastal areas.",
      "Higher ground guarantees that no hazard can occur.",
      "Storm surge affects only boats already at sea."
    ],
    "correctAnswer": 1,
    "explanation": "Storm winds and pressure can drive sea water inland, creating dangerous coastal flooding."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Land Use Decisions",
    "question": "A farmer wants to clear a steep slope beside a river. Which plan best protects soil and water?",
    "options": [
      "Remove all vegetation and plough straight downhill.",
      "Use contour planting, maintain vegetation buffers and limit exposed soil.",
      "Pave the riverbank so rainfall runs into the river faster.",
      "Burn crop remains before every heavy rain."
    ],
    "correctAnswer": 1,
    "explanation": "Contour methods, plant cover and river buffers slow runoff, reduce erosion and protect water quality."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Coral Reefs",
    "question": "What is one important benefit of healthy coral reefs?",
    "options": [
      "They reduce wave energy and provide habitat for marine life.",
      "They prevent all beach erosion under every condition.",
      "They supply fresh water directly to coastal homes.",
      "They make hurricane forecasting unnecessary."
    ],
    "correctAnswer": 0,
    "explanation": "Coral reefs support marine ecosystems and can reduce some incoming wave energy."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Transport Planning",
    "question": "A mountain community needs a new road. Which evidence should planners consider together?",
    "options": [
      "Select the shortest straight route without examining slopes, settlements or cost.",
      "Count vehicles owned by one family and use that result as the full travel-needs study.",
      "Choose sign colours before deciding whether the proposed route is safe to construct.",
      "Compare slope stability, travel needs, construction cost and environmental effects."
    ],
    "correctAnswer": 3,
    "explanation": "Safe and useful road planning requires physical, social, financial and environmental evidence."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Hazard Comparison",
    "question": "Community X floods often but has strong shelters; Community Y rarely floods but has weak buildings. What is the best conclusion?",
    "options": [
      "X has no risk because shelters remove the flood hazard.",
      "Y must be safer because floods happen less often.",
      "Risk depends on both hazard exposure and the ability to withstand and respond.",
      "Both communities have identical risk because each has one weakness."
    ],
    "correctAnswer": 2,
    "explanation": "Risk reflects the likelihood of a hazard and community vulnerability and preparedness, so both sets of evidence matter."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Branches of Government",
    "question": "Which institution interprets and applies law when deciding cases?",
    "options": [
      "Parliament, which debates and passes legislation",
      "The courts, which apply law and evidence in cases",
      "The Cabinet, which directs government policy and administration",
      "A Municipal Corporation, which manages specified local services"
    ],
    "correctAnswer": 1,
    "explanation": "Courts hear cases and apply the law to the evidence presented."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Senate",
    "question": "How are Jamaica's 21 Senators formally appointed?",
    "options": [
      "All 21 are elected directly by voters in fourteen separate parish contests.",
      "Municipal Corporations appoint one Senator for each parish and seven additional members.",
      "The Chief Justice chooses all Senators independently after a general election.",
      "The Governor-General appoints 13 on the Prime Minister's advice and 8 on the Opposition Leader's advice."
    ],
    "correctAnswer": 3,
    "explanation": "The Governor-General formally appoints 13 Senators on the Prime Minister's advice and 8 on the Opposition Leader's advice."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "A new Prime Minister and Senators must be formally appointed after an election. Which statement best describes the Governor-General's part?",
    "options": [
      "The Governor-General selects personal favourites and directs their government policies.",
      "The Governor-General replaces Parliament by debating and passing the government's laws.",
      "The Governor-General performs formal constitutional duties within Jamaica's elected parliamentary system.",
      "The Governor-General directly manages the daily work of every Municipal Corporation."
    ],
    "correctAnswer": 2,
    "explanation": "The Governor-General carries out constitutionally defined formal duties within Jamaica's elected and parliamentary system."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Responsibilities",
    "question": "Which action is a civic responsibility?",
    "options": [
      "Obeying lawful rules and respecting other people's rights",
      "Demanding public services while damaging them",
      "Spreading an unverified emergency rumour",
      "Preventing other citizens from voting"
    ],
    "correctAnswer": 0,
    "explanation": "Responsible citizenship includes obeying lawful rules and respecting the rights and safety of others."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Local Services",
    "question": "A blocked community drain is causing street flooding. Which public body should residents contact first?",
    "options": [
      "The National Works Agency, which manages roads in the national network",
      "The Municipal Corporation/local authority, which manages many local drainage concerns",
      "The disaster-management agency, which coordinates preparedness and emergency response",
      "The Member of Parliament's office, which represents constituents in national matters"
    ],
    "correctAnswer": 1,
    "explanation": "Municipal Corporations manage many local drainage and road concerns."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Fair Process",
    "question": "A school council must choose between two projects. What is the fairest method?",
    "options": [
      "Let the chairperson choose secretly.",
      "Compare needs and costs, hear students' views and explain the decision.",
      "Select the project proposed by the oldest student without evidence.",
      "Promise both projects although funds cover only one."
    ],
    "correctAnswer": 1,
    "explanation": "Fair decision-making uses relevant evidence, consultation and transparent reasons."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "CARICOM",
    "question": "What is one purpose of CARICOM?",
    "options": [
      "To coordinate only sporting events between member states",
      "To replace each member state's elected government and national laws",
      "To require identical economic policies regardless of national circumstances",
      "To support regional cooperation, integration and development among member states"
    ],
    "correctAnswer": 3,
    "explanation": "CARICOM supports cooperation, integration and development while member states retain their governments."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Rights in Conflict",
    "question": "A loud event is planned beside a hospital at midnight. What is the best civic response?",
    "options": [
      "Ignore patients because entertainment rights have no limits.",
      "Ban every future community event regardless of location.",
      "Adjust the time or location to respect expression and patients' health and rest.",
      "Allow only hospital workers to attend the event."
    ],
    "correctAnswer": 2,
    "explanation": "Rights should be exercised responsibly; changing time or place can allow expression while reducing harm to patients."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Public Accountability",
    "question": "A public agency reports that a project is complete, but residents provide photographs showing unfinished work. What should happen next?",
    "options": [
      "Ignore the photographs because official claims cannot be questioned.",
      "Verify the evidence, inspect the project and explain how public funds were used.",
      "Delete the project records to avoid disagreement.",
      "Pay for the unfinished work a second time without investigation."
    ],
    "correctAnswer": 1,
    "explanation": "Independent verification and transparent financial reporting support accountability."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Community Action",
    "question": "Young people want a safer pedestrian crossing near school. Which plan is most effective?",
    "options": [
      "Paint an unofficial crossing without permission, measurements or safety review.",
      "Block the road during an emergency so officials must respond immediately.",
      "Wait until a serious collision occurs before collecting information about the risk.",
      "Collect traffic evidence, consult road users and submit a safety proposal to the responsible authorities."
    ],
    "correctAnswer": 3,
    "explanation": "Evidence and lawful engagement with responsible authorities give the proposal a sound safety basis."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Goods and Services",
    "question": "Which is a service?",
    "options": [
      "A bakery producing loaves of bread for sale to customers",
      "A furniture workshop making school desks for classrooms",
      "A mechanic diagnosing and repairing a customer's bus",
      "A farmer packaging coffee beans harvested for the market"
    ],
    "correctAnswer": 2,
    "explanation": "Repair work is an activity performed for a customer, so it is a service."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Income and Spending",
    "question": "A household earns J$75,000 and spends J$68,000. What amount remains before other commitments?",
    "options": [
      "J$5,000",
      "J$7,000",
      "J$8,000",
      "J$13,000"
    ],
    "correctAnswer": 1,
    "explanation": "Subtracting J$68,000 from J$75,000 leaves J$7,000."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Price Signals",
    "question": "The price of ripe plantains rises after supply falls. How might farmers respond over time?",
    "options": [
      "Some may increase production if the higher expected return justifies the cost.",
      "All farmers must stop producing plantains immediately.",
      "Higher prices prove that demand has disappeared.",
      "Farmers can increase supply without land, labour or time."
    ],
    "correctAnswer": 0,
    "explanation": "A higher expected return can encourage production, but farmers must still consider resources, costs and growing time."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Taxes",
    "question": "Residents ask government to repair public clinics and roads. Which statement explains why tax revenue matters to that request?",
    "options": [
      "Tax collection guarantees that every household will receive exactly the same income.",
      "Taxes prevent citizens from saving money for their own future needs.",
      "Tax payments make imported equipment free for every public project.",
      "Government uses approved public revenue to finance services, workers and infrastructure."
    ],
    "correctAnswer": 3,
    "explanation": "Tax revenue helps government finance shared services and approved public programmes such as clinics and roads."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Trade",
    "question": "A Jamaican bakery imports wheat but sells patties locally. Which statement is correct?",
    "options": [
      "Imported wheat is an input used to produce a local good.",
      "The patties are exports because wheat came from overseas.",
      "Importing wheat removes every local job from production.",
      "The bakery provides only a service and produces no good."
    ],
    "correctAnswer": 0,
    "explanation": "The wheat is imported, while the patties are locally produced goods using that input."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Percentage Reasoning",
    "question": "A school club has J$6,000. It spends 30% on materials and saves the rest for an event. How much is saved?",
    "options": [
      "J$1,800, because that is the amount spent on materials",
      "J$3,600, because 60% of the budget remains after spending",
      "J$4,200, because 70% remains after 30% is spent",
      "J$5,700, because only J$300 is removed from the budget"
    ],
    "correctAnswer": 2,
    "explanation": "Thirty percent of J$6,000 is J$1,800, leaving 70%, or J$4,200, for the event."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Credit Unions",
    "question": "How can a credit union support members?",
    "options": [
      "By paying every member the same return even when investments perform differently",
      "By issuing Jamaica's currency and setting national monetary policy",
      "By converting each member's loan into a grant that never requires repayment",
      "By accepting member savings and offering financial services under agreed rules"
    ],
    "correctAnswer": 3,
    "explanation": "Credit unions are member-based institutions that support saving and offer financial services according to their rules."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Entrepreneurship",
    "question": "Before producing 300 craft items, what should a new seller do?",
    "options": [
      "Test demand and calculate production and selling costs",
      "Assume compliments guarantee 300 paid orders",
      "Ignore transport and packaging costs",
      "Borrow the maximum amount available immediately"
    ],
    "correctAnswer": 0,
    "explanation": "Testing demand and calculating full costs reduces the risk of producing more than customers will buy profitably."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Community Trade-offs",
    "question": "A market creates jobs but produces waste near a river. What is the strongest decision?",
    "options": [
      "Count the jobs and ignore every environmental cost.",
      "Close all markets because economic activity always causes harm.",
      "Compare benefits and costs and require workable waste controls.",
      "Allow pollution until residents can prove every illness came from it."
    ],
    "correctAnswer": 2,
    "explanation": "A sound decision considers employment and community costs while requiring practical measures to prevent pollution."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Two-Step Saving",
    "question": "A family saves 10% of J$80,000 income, then uses J$3,000 of the savings for an emergency. How much saved money remains?",
    "options": [
      "J$3,000",
      "J$5,000",
      "J$8,000",
      "J$11,000"
    ],
    "correctAnswer": 1,
    "explanation": "Ten percent of J$80,000 is J$8,000; after using J$3,000, J$5,000 remains."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix5Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix5Questions)
      : prepareSocialStudiesPreview(g5SsMix5Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 5",
        difficulty: "Mixed",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 5</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Mixed Level Practice</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This test blends straightforward recall, applied reasoning, and critical analysis questions across History, Geography, Civics, and Economics — giving you a comprehensive Grade 5 Social Studies challenge.</p>
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
              <p className="text-slate-600">Social Studies Mixed 5</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 5</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
