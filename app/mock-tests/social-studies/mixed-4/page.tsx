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

const g5SsMix4Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Taíno Heritage",
    "question": "Which evidence most directly shows that Taíno people farmed cassava in Jamaica?",
    "options": [
      "Stone beads found near a river",
      "Clay griddles used to bake cassava bread",
      "Shell ornaments worn at ceremonies",
      "Canoe pieces found beside the coast"
    ],
    "correctAnswer": 1,
    "explanation": "Cassava was processed and baked on clay griddles, so the griddles directly support cassava farming and food preparation."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Using Historical Evidence",
    "question": "A Spanish record says a village was peaceful, while Taíno artefacts show defensive tools. What is the best conclusion?",
    "options": [
      "The written record must be false because artefacts are always accurate.",
      "The village was always at war because defensive tools were found.",
      "Both sources should be compared because each may reveal a different part of village life.",
      "Neither source can provide useful evidence about the village."
    ],
    "correctAnswer": 2,
    "explanation": "Written accounts and artefacts provide different evidence, so comparing them supports a more careful conclusion than accepting either alone."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Chronology and Change",
    "question": "A timeline card shows 1655, 1831, 1838 and 1962. Which matching of events to dates is correct?",
    "options": [
      "1655—Baptist War; 1831—English capture; 1838—Independence; 1962—full freedom",
      "1655—English capture; 1831—Baptist War; 1838—full freedom; 1962—Independence",
      "1655—full freedom; 1831—Independence; 1838—Baptist War; 1962—English capture",
      "1655—Independence; 1831—full freedom; 1838—English capture; 1962—Baptist War"
    ],
    "correctAnswer": 1,
    "explanation": "The dates match the English capture in 1655, Baptist War in 1831, full freedom in 1838 and Independence in 1962."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Cause and Effect",
    "question": "Why did the Baptist War strengthen the movement toward ending slavery?",
    "options": [
      "It showed that enslaved people accepted plantation rule peacefully.",
      "It demonstrated determined resistance and exposed the cost of maintaining slavery.",
      "It immediately gave every Jamaican the right to vote.",
      "It transferred Jamaica from British to Spanish control."
    ],
    "correctAnswer": 1,
    "explanation": "The uprising demonstrated strong resistance to slavery and helped convince more people that the system could not continue."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Emancipation",
    "question": "What happened in Jamaica in 1838?",
    "options": [
      "Apprenticeship began for formerly enslaved people.",
      "Jamaica became independent from Britain.",
      "Full freedom replaced the Apprenticeship system.",
      "Universal Adult Suffrage was introduced."
    ],
    "correctAnswer": 2,
    "explanation": "The Apprenticeship period ended in 1838, bringing full freedom to formerly enslaved people."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Comparing Leadership",
    "question": "How were Nanny of the Maroons and Paul Bogle alike?",
    "options": [
      "Both resisted systems they believed were unjust.",
      "Both served as Prime Minister after Independence.",
      "Both led the 1938 labour protests.",
      "Both negotiated Jamaica's Independence in 1962."
    ],
    "correctAnswer": 0,
    "explanation": "Nanny resisted enslavement and colonial forces, while Bogle challenged injustice after emancipation; both organized resistance."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Morant Bay Evidence",
    "question": "A historian wants to understand why people joined the Morant Bay protest. Which source would be most useful?",
    "options": [
      "A tourist advertisement describing present-day attractions in Morant Bay",
      "A national weather summary published decades after the protest",
      "A modern map showing the current streets around the courthouse",
      "Petitions and testimony from the period describing land, poverty and justice concerns"
    ],
    "correctAnswer": 3,
    "explanation": "Petitions and testimony from the period can reveal the grievances that motivated participants."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "National Heroes",
    "question": "Which National Hero is closely associated with the 1865 Morant Bay Rebellion?",
    "options": [
      "Marcus Garvey, associated with Black self-reliance and African unity",
      "Norman Manley, associated with self-government and national politics",
      "Alexander Bustamante, associated with labour and party organization",
      "George William Gordon, associated with the grievances surrounding Morant Bay"
    ],
    "correctAnswer": 3,
    "explanation": "George William Gordon was connected with the political grievances surrounding Morant Bay and was executed after the rebellion."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Evaluating Sources",
    "question": "A newspaper owned by planters calls the 1938 workers 'ungrateful troublemakers.' Which response best evaluates the claim?",
    "options": [
      "Accept it because newspapers never express an owner's interests.",
      "Reject every newspaper report from 1938 without reading it.",
      "Compare it with workers' testimony, wage records and reports from other observers.",
      "Use it as proof that working conditions were fair."
    ],
    "correctAnswer": 2,
    "explanation": "The paper may reflect planter interests, so comparison with workers' accounts and employment evidence is needed."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Independence",
    "question": "Why was 1962 a major turning point for Jamaica?",
    "options": [
      "Jamaica began choosing its own national government as an independent country.",
      "Slavery ended and Apprenticeship began in the same year.",
      "All Caribbean territories formed one country under Jamaica.",
      "The first Taíno communities arrived after Independence."
    ],
    "correctAnswer": 0,
    "explanation": "Independence gave Jamaica authority to govern itself and make national decisions rather than remain a British colony."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Symbols",
    "question": "What does a map key help a reader understand?",
    "options": [
      "The age of every settlement shown",
      "The meaning of symbols and colours on the map",
      "The exact weather expected next month",
      "The opinions of the mapmaker"
    ],
    "correctAnswer": 1,
    "explanation": "A map key explains what the map's symbols, lines and colours represent."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Scale",
    "question": "A map scale shows 1 cm = 5 km. Two towns are 4 cm apart. What is their mapped ground distance?",
    "options": [
      "9 km",
      "15 km",
      "20 km",
      "25 km"
    ],
    "correctAnswer": 2,
    "explanation": "Four centimetres multiplied by 5 kilometres per centimetre gives 20 kilometres."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Direction",
    "question": "A rescue team travels east from a school and then north to a shelter. In which general direction is the shelter from the school?",
    "options": [
      "South-east, because the second part of the route reverses the first",
      "North-west, because travelling north changes east into west",
      "South-west, because both movements lead away from north-east",
      "North-east, because the route combines movement north and east"
    ],
    "correctAnswer": 3,
    "explanation": "Travelling east and then north places the shelter north-east of the starting point."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Parishes",
    "question": "Which feature separates one parish from another on a political map?",
    "options": [
      "A contour interval",
      "A parish boundary",
      "A rainfall symbol",
      "A scale statement"
    ],
    "correctAnswer": 1,
    "explanation": "Political maps use boundary lines to show where one parish ends and another begins."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Rainfall Data",
    "question": "A town recorded 40 mm, 75 mm and 55 mm of rain over three days. What was the total?",
    "options": [
      "130 mm",
      "150 mm",
      "160 mm",
      "170 mm"
    ],
    "correctAnswer": 3,
    "explanation": "Adding 40, 75 and 55 gives a three-day total of 170 millimetres."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Hazard Planning",
    "question": "Two communities face a hurricane. One has cleared drains and opened shelters; the other has not. What conclusion is best supported?",
    "options": [
      "The prepared community cannot experience any damage.",
      "Preparation can reduce risk, although storm strength and local conditions still matter.",
      "Both communities must suffer equal damage because the same storm approaches.",
      "Drain clearing matters only after the hurricane has passed."
    ],
    "correctAnswer": 1,
    "explanation": "Preparedness can reduce flooding and improve safety, but it cannot remove every risk created by a hurricane."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Watersheds",
    "question": "Why can cutting trees on steep upper slopes increase flooding downstream?",
    "options": [
      "Fewer roots and leaves slow less water, so runoff reaches streams faster.",
      "Tree removal causes rivers to flow uphill toward the slopes.",
      "Bare soil absorbs all rainfall before it reaches a river.",
      "Downstream flooding is unrelated to land use upstream."
    ],
    "correctAnswer": 0,
    "explanation": "Vegetation intercepts rain and roots help water enter soil; removing it can increase rapid runoff and erosion."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Coastal Protection",
    "question": "How do mangroves help coastal communities?",
    "options": [
      "They redirect all hurricanes away from populated coastlines.",
      "They convert salt water into a dependable public drinking supply.",
      "They remove the need for coastal planning, shelters and building rules.",
      "They reduce some wave energy, trap sediment and provide habitat for coastal wildlife."
    ],
    "correctAnswer": 3,
    "explanation": "Mangrove roots and vegetation can reduce wave energy, trap sediment and support coastal wildlife."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Settlement Decisions",
    "question": "A proposed housing site is close to jobs but lies in a floodplain. What should planners do before approving it?",
    "options": [
      "Approve it because travel time is the only planning concern.",
      "Reject every site near employment without further study.",
      "Compare flood evidence, mitigation costs, access and alternative sites.",
      "Assume a new road will remove the flood hazard."
    ],
    "correctAnswer": 2,
    "explanation": "A sound decision weighs access benefits against flood exposure, mitigation feasibility and safer alternatives."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Environmental Evidence",
    "question": "Fish numbers fall after hillside clearing and muddy runoff enters a bay. Which investigation best tests a connection?",
    "options": [
      "Compare water clarity and fish numbers before and after the clearing, including a similar bay without hillside clearing.",
      "Survey traffic near the bay and use vehicle totals as the main evidence about muddy runoff.",
      "Ask one fisher to decide whether hillside farming caused every change in the bay.",
      "Measure tree height on the cleared slope without collecting water or fish information."
    ],
    "correctAnswer": 0,
    "explanation": "Before-and-after water and fish evidence, compared with unaffected areas, can test whether runoff is linked to the decline."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliament",
    "question": "Residents want a proposed national law debated and changed. Which institution has the central role in considering and passing that law?",
    "options": [
      "The courts, because deciding individual cases includes passing national laws",
      "A Municipal Corporation, because every national law is a local by-law",
      "The Electoral Commission, because organizing elections includes writing legislation",
      "Parliament, because it debates and passes national legislation through its constitutional process"
    ],
    "correctAnswer": 3,
    "explanation": "Parliament is the national legislature responsible for debating and passing laws."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Representation",
    "question": "Residents tell their Member of Parliament that a national programme is not reaching their area. What should the representative do?",
    "options": [
      "Raise the concern through appropriate government and parliamentary channels.",
      "Personally decide the court case that created the problem.",
      "Order the Municipal Corporation to ignore its legal duties.",
      "Promise immediate results without checking the evidence."
    ],
    "correctAnswer": 0,
    "explanation": "A representative should investigate constituents' concerns and raise them through lawful governmental channels."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Checks and Balance",
    "question": "Why should courts be able to decide cases without political instructions?",
    "options": [
      "So judges can create any law they personally prefer",
      "So legal decisions can be based on law and evidence",
      "So Parliament never needs to make laws",
      "So citizens lose the right to question decisions"
    ],
    "correctAnswer": 1,
    "explanation": "Judicial independence supports fair decisions based on law and evidence rather than political pressure."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Local Government",
    "question": "Which body is responsible for many local roads and drains?",
    "options": [
      "The National Works Agency, which manages the national road network",
      "The disaster-management agency, which coordinates emergency preparedness",
      "The Ministry of Finance, which manages national public-finance policy",
      "The Municipal Corporation/local authority, which maintains many local roads and drains"
    ],
    "correctAnswer": 3,
    "explanation": "Municipal Corporations are Jamaica's local authorities and manage many local services, including roads and drainage."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "A student claims that freedom of expression permits spreading a known false emergency warning. What is the best response?",
    "options": [
      "Rights may be exercised without considering harm to anyone.",
      "The warning is acceptable if many people repeat it.",
      "Rights carry responsibilities, including avoiding deliberate harm and misinformation.",
      "Only adults have responsibilities when speaking publicly."
    ],
    "correctAnswer": 2,
    "explanation": "Freedom of expression is important, but citizens also have responsibilities not to deliberately endanger others with false information."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Lawful Participation",
    "question": "Residents oppose a proposed quarry. Which action is the strongest lawful response?",
    "options": [
      "Damage quarry equipment before consultation so officials notice the opposition.",
      "Threaten neighbours who support the quarry to reduce support for the proposal.",
      "Block emergency vehicles until authorities promise to reject the project.",
      "Gather evidence, attend consultations and submit objections through the lawful process."
    ],
    "correctAnswer": 3,
    "explanation": "Evidence, consultation and lawful objections allow residents to influence decisions without violating others' rights."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Voting",
    "question": "What does Universal Adult Suffrage mean?",
    "options": [
      "Adults may vote only when they own land or other property.",
      "Local leaders may choose which adults participate in each election.",
      "Adult citizens who meet legal requirements may vote regardless of wealth or property.",
      "Each voter must support the party that currently forms the government."
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage widened voting rights to adult citizens rather than limiting them by property or wealth."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Accountability",
    "question": "A councillor approves a contract for a close relative without declaring the relationship. What principle is most at risk?",
    "options": [
      "Freedom of movement, because the contract affects travel between parishes",
      "Religious freedom, because family relationships determine forms of worship",
      "Disaster preparedness, because contracts are mainly emergency-response tools",
      "Public accountability, because an undeclared family interest may improperly influence the decision"
    ],
    "correctAnswer": 3,
    "explanation": "Public officials should disclose conflicts and make decisions transparently so private relationships do not improperly influence public spending."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Civic Evidence",
    "question": "A petition has many signatures, but a survey shows most affected residents were never consulted. What is the fairest next step?",
    "options": [
      "Treat the petition as complete proof because signature totals settle every issue.",
      "Ignore the petition because surveys are always more reliable.",
      "Verify the signatures and gather views from the wider affected community before deciding.",
      "Allow only officials to express an opinion."
    ],
    "correctAnswer": 2,
    "explanation": "Both the petition and the missing voices matter; verification and wider consultation provide stronger evidence for a fair decision."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "CARICOM Cooperation",
    "question": "Why might Caribbean countries coordinate hurricane response through CARICOM?",
    "options": [
      "Each country acts separately and exchanges information only after the emergency.",
      "One affected country directs the emergency agencies of all other member states.",
      "Member states coordinate information, expertise and resources through regional cooperation.",
      "Private tourism firms replace public emergency agencies throughout the region."
    ],
    "correctAnswer": 2,
    "explanation": "Regional cooperation can help members share expertise, supplies and information when disasters affect several countries."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Needs and Wants",
    "question": "Which purchase is most clearly a household need?",
    "options": [
      "A second video-game controller",
      "Medicine prescribed for a sick child",
      "Designer shoes replacing usable shoes",
      "Decorations for a party"
    ],
    "correctAnswer": 1,
    "explanation": "Required medicine protects health and is a need, while the other choices are discretionary wants."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budgeting",
    "question": "A family earns J$90,000 and plans J$96,000 in expenses. What should it do first?",
    "options": [
      "Add more optional spending before reviewing the total.",
      "Borrow automatically without checking expenses.",
      "Review lower-priority costs and reduce the J$6,000 shortfall.",
      "Record J$96,000 as income so the budget balances."
    ],
    "correctAnswer": 2,
    "explanation": "The plan exceeds income by J$6,000, so expenses or sustainable income must be adjusted before commitments are made."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Opportunity Cost",
    "question": "A community spends its only grant on repairing a clinic roof instead of resurfacing a playfield. What is the opportunity cost?",
    "options": [
      "The clinic roof that the community selected and repaired with the grant",
      "The rainwater that entered the clinic before repairs were completed",
      "The application process used to request the community grant",
      "The playfield resurfacing that could not be funded after the roof was chosen"
    ],
    "correctAnswer": 3,
    "explanation": "Opportunity cost is the next-best alternative forgone—in this case, resurfacing the playfield."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Imports and Exports",
    "question": "Bananas grown in Jamaica and sold overseas are what to Jamaica?",
    "options": [
      "Imports",
      "Taxes",
      "Exports",
      "Savings"
    ],
    "correctAnswer": 2,
    "explanation": "Goods produced locally and sold to another country are exports."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Supply and Demand",
    "question": "A hurricane damages much of the local cabbage crop while demand stays similar. What is most likely?",
    "options": [
      "Prices rise because fewer cabbages are available.",
      "Prices fall because damage increases supply.",
      "Demand automatically becomes zero.",
      "Cabbages become an imported service."
    ],
    "correctAnswer": 0,
    "explanation": "With lower supply and similar demand, buyers compete for fewer cabbages, placing upward pressure on price."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Two-Step Budgeting",
    "question": "A student has J$2,000, spends J$1,200 on supplies and saves half of the remainder. How much is saved?",
    "options": [
      "J$400",
      "J$600",
      "J$800",
      "J$1,000"
    ],
    "correctAnswer": 0,
    "explanation": "After spending J$1,200, J$800 remains; half of J$800 is J$400."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism Linkages",
    "question": "A hotel buys vegetables locally and recommends community tours. What is a likely benefit?",
    "options": [
      "Visitor spending reaches farmers, guides and other local businesses.",
      "The hotel no longer needs workers or supplies.",
      "Tourists stop using every imported product.",
      "Local farms become part of the hotel property."
    ],
    "correctAnswer": 0,
    "explanation": "Local purchasing and referrals spread tourism income through connected businesses and workers."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Saving",
    "question": "Why might a family maintain an emergency fund?",
    "options": [
      "It ensures that household income will remain unchanged throughout the year.",
      "It removes the need to insure against any serious risk that a family faces.",
      "It makes unexpected expenses disappear before the family must pay them.",
      "It provides a buffer that can reduce costly borrowing when an emergency occurs."
    ],
    "correctAnswer": 3,
    "explanation": "Emergency savings provide a financial buffer and can reduce reliance on debt when unexpected costs arise."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Cooperatives",
    "question": "Several fishers jointly buy cold storage that none could afford alone. What advantage are they using?",
    "options": [
      "Pooling resources for a shared service",
      "Avoiding all rules and record keeping",
      "Guaranteeing that fish prices always rise",
      "Eliminating every personal business decision"
    ],
    "correctAnswer": 0,
    "explanation": "A cooperative can pool members' resources to obtain useful equipment or services that are too costly individually."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Evaluating Enterprise",
    "question": "A snack seller has strong sales but discovers that each snack costs more to produce than its selling price. What is the best next step?",
    "options": [
      "Produce a larger quantity immediately because high sales prove that each item earns profit.",
      "Exclude transport and packaging so the recorded production cost becomes lower.",
      "Borrow enough to continue selling at the same price despite losing money on each item.",
      "Calculate every major cost and revise the price or production plan before expanding."
    ],
    "correctAnswer": 3,
    "explanation": "Demand matters, but the seller must also cover full costs; revising price or production before expansion reduces the risk of larger losses."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix4Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix4Questions)
      : prepareSocialStudiesPreview(g5SsMix4Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 4",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 4</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 4</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 4</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
