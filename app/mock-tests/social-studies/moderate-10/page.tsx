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

const g5SsMod10Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Historical Maps",
    question: `An old map shows plantations, ports and roads in colonial Jamaica. What can the map BEST help a student study?`,
    options: [
      "How land use and transport were organised at that time.",
      "How every resident felt about colonial rule at that time.",
      "What the weather was on each day shown by the map.",
      "What every plantation produced throughout the colonial period.",
    ],
    correctAnswer: 0,
    explanation: `The map can provide evidence about the arrangement of land use, transport routes and ports, but not every personal experience or daily condition.`
  },
  {
    id: 2,
    type: "history",
    skill: "Archaeological Evidence",
    question: `A Taíno site contains shell tools, pottery and food remains. What can these finds help historians infer?`,
    options: [
      "The political decisions made in Jamaica centuries afterward.",
      "Some activities, foods and technologies used by the community.",
      "The identity and private thoughts of each person at the site.",
      "The conditions at every Taíno settlement in the Caribbean.",
    ],
    correctAnswer: 1,
    explanation: `Artefacts and food remains can provide evidence about activities, diet and technology at the settlement.`
  },
  {
    id: 3,
    type: "history",
    skill: "Colonial History",
    question: `Which statement correctly compares Spanish and English colonial rule in Jamaica?`,
    options: [
      "Both countries began governing Jamaica after Emancipation in 1834.",
      "Spanish rule began after Jamaica became independent in 1962.",
      "Spain ruled first; English forces captured Jamaica from Spain in 1655.",
      "England ruled first; Spain captured Jamaica from England in 1655.",
    ],
    correctAnswer: 2,
    explanation: `Spain colonised Jamaica before English forces captured the island in 1655.`
  },
  {
    id: 4,
    type: "history",
    skill: "Chronology",
    question: `Which sequence correctly shows Jamaica’s path from the Baptist War toward full freedom?`,
    options: [
      "Legal abolition → Baptist War → full freedom → Apprenticeship",
      "Apprenticeship → Baptist War → full freedom → legal abolition",
      "Full freedom → Apprenticeship → Baptist War → legal abolition",
      "Baptist War → legal abolition → Apprenticeship → full freedom",
    ],
    correctAnswer: 3,
    explanation: `The Baptist War occurred in 1831–32, legal abolition took effect in 1834, Apprenticeship followed, and full freedom came in 1838.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why was the Baptist War significant to the movement against slavery?`,
    options: [
      "Its scale and harsh suppression strengthened abolitionist pressure in Britain.",
      "It established Jamaica as an independent country immediately after the uprising.",
      "It introduced Universal Adult Suffrage for Jamaican workers and their families.",
      "It formed the Caribbean Community to coordinate regional opposition to slavery.",
    ],
    correctAnswer: 0,
    explanation: `The scale of the uprising and its suppression added to pressure in Britain for abolition.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cause and Effect",
    question: `Which set of grievances is most closely connected with the Morant Bay Rebellion?`,
    options: [
      "Opposition to Universal Adult Suffrage and the first election held under it",
      "Poverty, unequal justice, limited access to land and weak political representation",
      "Disagreement about joining CARICOM and adopting a regional examination system",
      "Concern about tourism development and the management of coastal attractions",
    ],
    correctAnswer: 1,
    explanation: `The Morant Bay Rebellion grew from serious grievances involving poverty, justice, land and political treatment.`
  },
  {
    id: 7,
    type: "history",
    skill: "Labour History",
    question: `A report from 1938 describes workers coordinating strikes and presenting demands. What wider lesson does this evidence support?`,
    options: [
      "Workers organised mainly to celebrate Jamaica’s achievement of Independence.",
      "Workers had already received the reforms they sought before protests began.",
      "Collective action could place pressure on employers and government for reform.",
      "Collective action had little connection with later political and social changes.",
    ],
    correctAnswer: 2,
    explanation: `The unrest showed that organised workers could press for labour, social and political reform.`
  },
  {
    id: 8,
    type: "history",
    skill: "Political Development",
    question: `What was an important effect of Universal Adult Suffrage in 1944?`,
    options: [
      "It ended Jamaica’s colonial status and established national sovereignty.",
      "It replaced Parliament with a system of local Municipal Corporations.",
      "It ended Apprenticeship and brought full freedom to formerly enslaved people.",
      "It greatly widened the number of qualified adults able to vote.",
    ],
    correctAnswer: 3,
    explanation: `Universal Adult Suffrage widened the electorate and increased political participation.`
  },
  {
    id: 9,
    type: "history",
    skill: "Independence",
    question: `Which statement BEST describes Jamaica’s Independence in 1962?`,
    options: [
      "Jamaica became a sovereign state rather than remaining a British colony.",
      "Jamaican adults received voting rights for the first time in the same year.",
      "Jamaica withdrew from all regional and international relationships.",
      "Jamaica ended the Apprenticeship system that followed legal abolition.",
    ],
    correctAnswer: 0,
    explanation: `Independence ended Jamaica’s colonial status and established the country as a sovereign state.`
  },
  {
    id: 10,
    type: "history",
    skill: "Heritage Conservation",
    question: `A historic courthouse needs major repairs. Which approach BEST protects its heritage value?`,
    options: [
      "Close the building permanently without studying its history or condition.",
      "Repair it safely while documenting and preserving important historic features.",
      "Replace its historic features with modern ones without recording what was removed.",
      "Leave unsafe damage untouched because any repair would reduce its heritage value.",
    ],
    correctAnswer: 1,
    explanation: `Careful conservation protects people while retaining documented features that give a historic place significance.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Scale",
    question: `A trail map uses a scale of 1 cm to 4 km. A planned route measures 6 cm. What distance will walkers cover?`,
    options: [
      "10 km",
      "18 km",
      "24 km",
      "30 km",
    ],
    correctAnswer: 2,
    explanation: `Six centimetres multiplied by 4 kilometres per centimetre gives 24 kilometres.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Direction",
    question: `A health centre is north and east of a school. In which direction is the health centre from the school?`,
    options: [
      "Southeast",
      "Southwest",
      "Northwest",
      "Northeast",
    ],
    correctAnswer: 3,
    explanation: `A place that is both north and east of another place is northeast of it.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Interpreting Data",
    question: `A rainfall chart records 220 mm in October and 70 mm in March. Which conclusion is supported?`,
    options: [
      "The recorded rainfall was greater in October than in March.",
      "October is wetter than March in every Jamaican parish and every year.",
      "The chart proves that no rain fell during the other months of the year.",
      "The two monthly measurements establish the climate of the whole Caribbean.",
    ],
    correctAnswer: 0,
    explanation: `The chart supports a comparison of the recorded months, not a universal claim about every place or year.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Watersheds",
    question: `Why can protecting forest in a watershed benefit communities downstream?`,
    options: [
      "Watershed forests can turn polluted river water into treated drinking water.",
      "Vegetation can reduce erosion and help regulate runoff entering rivers.",
      "Forest cover can prevent all flooding regardless of rainfall or land use.",
      "Trees can stop upstream activities from affecting water quality downstream.",
    ],
    correctAnswer: 1,
    explanation: `Roots and ground cover help hold soil and slow runoff, which can reduce erosion and sediment downstream.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Mangroves",
    question: `Why are mangroves valuable along some Jamaican coastlines?`,
    options: [
      "They prevent salt water from entering coastal areas under all conditions.",
      "They replace the need to manage reefs, beaches and coastal development.",
      "They can reduce wave energy and provide nursery habitat for marine life.",
      "They create deep-water ports by removing sediment from every shoreline.",
    ],
    correctAnswer: 2,
    explanation: `Mangroves can protect shorelines and provide important habitat for young fish and other organisms.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Transport and Settlement",
    question: `A reliable bus route begins serving a community that was difficult to reach. What change may follow?`,
    options: [
      "The route may cause rainfall to decrease as more vehicles enter the area.",
      "The service may make travel to schools and markets more difficult.",
      "The parish boundary may have to move to follow the bus route.",
      "Easier access may encourage settlement and new business activity.",
    ],
    correctAnswer: 3,
    explanation: `Improved transport can increase access to jobs, schools, markets and services and may encourage development.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Hazard Preparedness",
    question: `Officials issue an evacuation order before a hurricane. What is the safest response?`,
    options: [
      "Use the recommended route to reach the designated safe place before conditions worsen.",
      "Wait beside the coast until storm surge is visible before deciding whether to move.",
      "Choose an unmarked shortcut without checking whether flooding has blocked the route.",
      "Remain in an unsafe building because evacuation shelters may be less convenient.",
    ],
    correctAnswer: 0,
    explanation: `Leaving early by the recommended route reduces exposure to worsening wind, flooding and storm surge.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Climate and Agriculture",
    question: `Which response BEST helps a farmer prepare for repeated dry periods?`,
    options: [
      "Choose crops by selling price without considering their water requirements.",
      "Use efficient irrigation and select crops suited to available water.",
      "Increase water use before measuring supply or the crops’ actual needs.",
      "Remove mulch and ground cover so moisture leaves the soil more quickly.",
    ],
    correctAnswer: 1,
    explanation: `Efficient irrigation and suitable crops help adapt farming to limited water.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Urban Flooding",
    question: `Which combination can help reduce flooding caused by heavy rain in a town?`,
    options: [
      "Direct more runoff toward low-lying homes without increasing drainage capacity.",
      "Stop measuring rainfall and rely on residents to clear floodwater afterward.",
      "Maintain drains and use green areas or surfaces that absorb more runoff.",
      "Block drains and pave remaining green areas so water moves faster across streets.",
    ],
    correctAnswer: 2,
    explanation: `Maintained drains and runoff-absorbing areas help water move or soak away more safely.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Regional Weather",
    question: `Why do Caribbean countries benefit from sharing weather information?`,
    options: [
      "Shared forecasts require every country to experience identical weather conditions.",
      "Regional information removes the need for national weather and emergency agencies.",
      "Weather cooperation can prevent tropical storms from entering the Caribbean region.",
      "Weather systems cross borders, so shared information can improve warnings and planning.",
    ],
    correctAnswer: 3,
    explanation: `Weather hazards can affect several countries, and shared information supports earlier warning and coordination.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Parliament",
    question: `A parliamentary committee discusses the likely effects of a bill and recommends amendments. What purpose of parliamentary debate does this illustrate?`,
    options: [
      "To examine likely effects, raise concerns and consider possible changes",
      "To allow courts to decide the proposal before representatives discuss it",
      "To require representatives to approve each proposal in its original form",
      "To transfer national law-making decisions to Municipal Corporations",
    ],
    correctAnswer: 0,
    explanation: `Parliamentary debate allows representatives to examine proposals before final decisions are made.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Bicameral Parliament",
    question: `What does it mean to say Jamaica has a bicameral Parliament?`,
    options: [
      "Parliament meets only twice during each term of government.",
      "Parliament consists of the House of Representatives and the Senate.",
      "Parliament divides each parish into two Municipal Corporations.",
      "Parliament gives every proposed law two different meanings.",
    ],
    correctAnswer: 1,
    explanation: `Bicameral means having two chambers: the House of Representatives and the Senate.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Local Government",
    question: `A public market and a minor local road both need attention. Which body should residents contact most directly?`,
    options: [
      "The Municipal Corporation/local authority, responsible for many local markets and minor roads",
      "The Caribbean Examinations Council, responsible for regional examinations and qualifications",
      "The Bank of Jamaica, responsible for central-banking and monetary functions",
      "The CARICOM Secretariat, responsible for supporting Caribbean Community programmes",
    ],
    correctAnswer: 2,
    explanation: `Municipal Corporations are Jamaica’s local authorities and are responsible for many local facilities and services.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Judicial Independence",
    question: `A political official privately tells a judge how a pending case should be decided. Why should the judge reject the instruction?`,
    options: [
      "To allow judges to replace elected representatives in Parliament",
      "To permit courts to ignore laws when a case attracts public attention",
      "To ensure political leaders decide which evidence the court accepts",
      "To support impartial decisions and judicial independence",
    ],
    correctAnswer: 3,
    explanation: `Judicial independence supports fair decisions based on law and evidence instead of political direction.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Fair Hearing",
    question: `Before a public employee is disciplined, the employee receives the allegation and can answer it before an independent panel. Which principle is illustrated?`,
    options: [
      "A person hears the allegation, can respond, and is judged by an impartial decision-maker.",
      "A person is punished before learning what allegation has been made.",
      "Only one side presents evidence because the complaint was made first.",
      "The decision-maker has a personal interest in the result and selects the evidence.",
    ],
    correctAnswer: 0,
    explanation: `A fair hearing includes notice, an opportunity to respond and an impartial decision-maker.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Secret Ballot",
    question: `A polling booth prevents observers from seeing how a person marks the ballot. Why does this matter?`,
    options: [
      "It replaces the need for secure counting and election officials.",
      "It protects the privacy of each voter’s choice.",
      "It allows a voter to cast several ballots without being identified.",
      "It permits candidates to inspect how named individuals voted.",
    ],
    correctAnswer: 1,
    explanation: `Ballot secrecy helps voters choose without improper pressure or retaliation.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Accountability",
    question: `A public agency publishes a project’s planned and actual costs. Which principle does this support?`,
    options: [
      "Transfer of Parliament’s duties to private businesses",
      "Removal of the need for financial records or audits",
      "Accountability for the use of public funds",
      "Secrecy about decisions made by public officials",
    ],
    correctAnswer: 2,
    explanation: `Publishing financial information helps the public examine how an agency used public resources.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Democratic Participation",
    question: `Residents oppose a proposed traffic change. Which response is lawful democratic participation?`,
    options: [
      "Damage traffic signs so the proposal cannot be introduced as planned.",
      "Prevent residents with a different view from speaking at public meetings.",
      "Order public officials to follow one resident’s instructions without consultation.",
      "Attend a consultation, submit a petition or contact an elected representative.",
    ],
    correctAnswer: 3,
    explanation: `Consultations, petitions and communication with representatives are lawful ways to participate.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Regional Cooperation",
    question: `Why might Caribbean states coordinate disaster preparation?`,
    options: [
      "Shared information, expertise and resources can strengthen responses to common hazards.",
      "Coordination means each state can close its national disaster and weather agencies.",
      "Regional planning requires identical measures regardless of local geography.",
      "Cooperation prevents hurricanes and earthquakes from affecting member states.",
    ],
    correctAnswer: 0,
    explanation: `Regional cooperation can improve preparation and response to hazards that affect several countries.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rights and Responsibilities",
    question: `Which action BEST balances the right to use a public park with responsibility for others and the environment?`,
    options: [
      "Leave waste behind because maintaining public places is solely a government duty.",
      "Use the park while following safety, noise and waste-disposal rules.",
      "Use any part of the park in any way because public access removes restrictions.",
      "Prevent other groups from using facilities when their activities are different.",
    ],
    correctAnswer: 1,
    explanation: `Public spaces can be enjoyed while users respect lawful rules, other people and the environment.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Needs and Wants",
    question: `A household has limited money for groceries. Which item is most clearly a need?`,
    options: [
      "Tickets for a weekend entertainment event",
      "A newer phone while the present one still works",
      "Basic food required for meals",
      "A second decorative lamp for a bedroom",
    ],
    correctAnswer: 2,
    explanation: `Basic food is necessary for daily living, while the other choices are optional wants in this situation.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Opportunity Cost",
    question: `A youth club chooses a shade tent instead of new footballs because it cannot afford both. What is the opportunity cost?`,
    options: [
      "The money remaining after purchasing the tent",
      "The benefits received from using both items",
      "The full price of every item considered by the club",
      "The new footballs the club gives up",
    ],
    correctAnswer: 3,
    explanation: `Opportunity cost is the next-best alternative given up when a choice is made.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Production Decisions",
    question: `A bakery cannot meet demand because its oven holds very few loaves. Which investment most directly addresses the bottleneck?`,
    options: [
      "A larger oven that can bake more loaves at one time",
      "New wall paint that makes the customer area more attractive",
      "Additional menus describing products already sold by the bakery",
      "A smaller storage shelf for ingredients used during production",
    ],
    correctAnswer: 0,
    explanation: `A larger oven directly increases capacity at the stage limiting production.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Supply and Demand",
    question: `Fishers bring a much larger catch to market while demand remains similar. What may happen?`,
    options: [
      "Demand may end because buyers cannot purchase goods in larger quantities.",
      "Sellers may lower prices because more fish are available.",
      "Sellers may raise prices because the larger catch reduces supply.",
      "Prices may remain fixed because supply does not influence markets.",
    ],
    correctAnswer: 1,
    explanation: `A larger supply with similar demand can place downward pressure on prices.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Exports",
    question: `A shipment of coffee grown in Jamaica leaves Kingston for buyers in another country. How is the coffee classified for Jamaica?`,
    options: [
      "a remittance",
      "a local-government service",
      "an export",
      "an import",
    ],
    correctAnswer: 2,
    explanation: `Sending Jamaican-grown coffee to foreign buyers is an export transaction for Jamaica.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Tourism Linkages",
    question: `A hotel hires Jamaican entertainers and buys produce from nearby farmers. What does this show?`,
    options: [
      "Tourism businesses participate only in international trade, not local activity.",
      "Local produce becomes an import when it is purchased by a hotel serving visitors.",
      "Entertainers and farmers become hotel employees whenever they complete a sale.",
      "Tourism spending can create income for other local workers and businesses.",
    ],
    correctAnswer: 3,
    explanation: `Local employment and purchasing link tourism activity to other parts of the Jamaican economy.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Cooperatives",
    question: `Several small farmers want lower input costs and stronger bargaining power when selling crops. Why might a cooperative help?`,
    options: [
      "To share some costs or services and improve their bargaining or buying power",
      "To prevent members from keeping ownership of their individual farms",
      "To guarantee that every crop will sell at the highest market price",
      "To avoid planning how shared equipment and money will be managed",
    ],
    correctAnswer: 0,
    explanation: `Cooperation can help small producers share resources and negotiate more effectively.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Budgeting",
    question: `A community group receives J$120,000 and expects necessary costs of J$102,000. What should it do with the remaining J$18,000?`,
    options: [
      "Ignore it in the financial records because it was not needed for expenses.",
      "Plan and record how the balance will support saving or another agreed priority.",
      "Spend it immediately so the final accounts show no money remaining.",
      "Divide it among organisers without approval because planned costs were covered.",
    ],
    correctAnswer: 1,
    explanation: `Careful budgeting accounts for the remaining balance and assigns it to an agreed purpose.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Economic and Environmental Decisions",
    question: `A development may create jobs but damage mangroves used as fish nursery habitat. What should decision-makers do?`,
    options: [
      "Reject it without examining whether designs could reduce environmental damage.",
      "Consider construction costs but leave environmental effects until after approval.",
      "Compare reliable evidence about both economic benefits and environmental and livelihood costs.",
      "Approve it whenever the number of proposed jobs exceeds the number of nearby fishers.",
    ],
    correctAnswer: 2,
    explanation: `A sound decision weighs economic benefits against environmental and community costs using reliable evidence.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Saving Goals",
    question: `A student wants to buy a tablet in ten months. Which plan BEST supports the goal?`,
    options: [
      "Set a target but save only after every optional purchase has been made.",
      "Borrow the full price immediately without comparing repayment costs.",
      "Save unrecorded amounts and wait until the final month to check the total.",
      "Set a target, save a planned amount regularly and check progress each month.",
    ],
    correctAnswer: 3,
    explanation: `A clear target, regular saving and progress checks make a future purchase more achievable.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod10Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod10Questions)
      : prepareSocialStudiesPreview(g5SsMod10Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 10",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 10</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 10</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 10</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
