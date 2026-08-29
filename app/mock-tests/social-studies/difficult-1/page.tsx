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

const g5SsDiff1Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Using Archaeological Evidence",
    "question": "Archaeologists find Taíno farming tools beside cassava remains but no written account. Which conclusion is best supported by both pieces of evidence?",
    "options": [
      "Cassava was the settlement's most important crop.",
      "Taíno communities used farming tools to grow cassava.",
      "The tools show farming was more common than fishing.",
      "Cassava was brought to Jamaica after the English arrived."
    ],
    "correctAnswer": 1,
    "explanation": "The tools and plant remains together support the conclusion that Taíno communities cultivated cassava; they do not prove an exclusive diet or a later origin."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Colonial Change",
    "question": "A 1655 map labels Spanish settlements, while a 1670 record lists English laws and land grants. What change best explains the difference?",
    "options": [
      "English rule replaced Spanish colonial government.",
      "Taíno leaders regained control of Jamaica.",
      "Jamaica became independent between the two dates.",
      "African slavery ended before the second record."
    ],
    "correctAnswer": 0,
    "explanation": "England captured Jamaica from Spain in 1655, so later English laws and land grants reflect a change in colonial control."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Cause and Consequence",
    "question": "A timeline shows the Baptist War in 1831–1832, followed by stronger abolition debate in Britain and the 1833 Emancipation Act. What is the strongest explanation?",
    "options": [
      "The uprising immediately made Jamaica independent.",
      "The rebellion caused Apprenticeship to begin before Emancipation.",
      "The uprising strengthened pressure to abolish slavery.",
      "The protest ended all plantation work throughout the Caribbean."
    ],
    "correctAnswer": 2,
    "explanation": "The Baptist War demonstrated resistance to slavery and strengthened abolition pressure; it did not itself produce immediate independence or freedom."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Emancipation Chronology",
    "question": "An apprentice in 1837 still had to work without full freedom, but a worker in August 1838 did not. Which event caused that change?",
    "options": [
      "The Morant Bay Rebellion began.",
      "Apprenticeship ended, bringing full freedom.",
      "Universal Adult Suffrage was introduced.",
      "Jamaica joined CARICOM."
    ],
    "correctAnswer": 1,
    "explanation": "Emancipation in 1834 was followed by Apprenticeship. Full freedom came when Apprenticeship ended in 1838."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Evaluating Historical Causes",
    "question": "Two accounts of Morant Bay mention poverty and unequal access to land and justice. One also describes the march led by Paul Bogle. Which conclusion uses both cause and event evidence?",
    "options": [
      "Deep grievances led to protest and harsh suppression.",
      "The protest was mainly a response to hurricane damage.",
      "The march ended colonial rule in 1865.",
      "Paul Bogle was protesting Jamaica's Independence."
    ],
    "correctAnswer": 0,
    "explanation": "The accounts connect grievances over land, poverty and justice to the protest, followed by harsh colonial suppression."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "National Heroes",
    "question": "A student claims Nanny and Sam Sharpe contributed in exactly the same way. Which evidence best corrects the claim?",
    "options": [
      "Both served as Prime Minister after Independence.",
      "Nanny led the 1938 labour unrest, while Sharpe won Universal Adult Suffrage.",
      "Nanny led Maroon resistance; Sharpe helped lead the Baptist War.",
      "Both wrote Jamaica's Constitution in 1962."
    ],
    "correctAnswer": 2,
    "explanation": "Both resisted oppression, but their periods and forms of leadership differed: Nanny led Maroon resistance and Sharpe helped organise the Baptist War."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Labour Reform",
    "question": "Reports from 1938 describe low wages, unemployment and worker protests. Later records show new unions and political organisations. What cause-and-effect link is best supported?",
    "options": [
      "The protests caused slavery to be abolished.",
      "Poor conditions encouraged organised reform movements.",
      "Trade unions ended the need for elections.",
      "Workers demanded that Jamaica return to Spanish rule."
    ],
    "correctAnswer": 1,
    "explanation": "The 1938 unrest grew from harsh social and economic conditions and helped stimulate labour organisation and political reform."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Political Participation",
    "question": "A chart shows that before 1944 voting was restricted, while after 1944 most adults could vote. What was the main effect of Universal Adult Suffrage?",
    "options": [
      "It greatly widened participation in elections.",
      "It made Jamaica independent immediately.",
      "It replaced Parliament with Municipal Corporations.",
      "It restored voting mainly to property owners."
    ],
    "correctAnswer": 0,
    "explanation": "Universal Adult Suffrage widened the electorate so most adults could participate, although Jamaica remained a colony until 1962."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Independence Evidence",
    "question": "A 1962 newspaper reports a new national flag and the end of colonial government, but also notes that Jamaica remained in the Commonwealth. Which conclusion is most accurate?",
    "options": [
      "Jamaica stopped governing itself and became a colony again.",
      "Jamaica became independent while remaining in the Commonwealth.",
      "Independence removed all links with other countries.",
      "The Commonwealth became Jamaica's Parliament."
    ],
    "correctAnswer": 1,
    "explanation": "Independence ended colonial rule; Commonwealth membership did not cancel Jamaica's national sovereignty."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Source Reliability",
    "question": "A museum label and an undated social-media post disagree about a rebellion. What should a careful student do first?",
    "options": [
      "Choose the shorter account because it is easier to read.",
      "Accept the social-media post because it is newer.",
      "Check origin, purpose and evidence against reliable sources.",
      "Combine both claims without checking whether either is supported."
    ],
    "correctAnswer": 2,
    "explanation": "Reliability is judged by origin, purpose and supporting evidence, then strengthened through comparison with other credible sources."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Evidence",
    "question": "A map scale says 1 cm represents 5 km. Route A to the shelter measures 4 cm and crosses a flooded bridge. Route B measures 5 cm and avoids flooded areas. Which plan uses both distance and hazard evidence?",
    "options": [
      "Choose Route A because 20 km is shorter even though the bridge is flooded.",
      "Choose Route B only because 25 km is longer, since longer routes are always safer.",
      "Choose Route B because it is 25 km but avoids the flooded bridge.",
      "Choose Route A because the bridge condition can be checked after reaching it."
    ],
    "correctAnswer": 2,
    "explanation": "Route A is 20 km and Route B is 25 km. Although Route B is 5 km longer, it avoids the known flooded bridge, so it uses both the distance calculation and the hazard evidence."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Relief and Rainfall",
    "question": "Moist air rises over Jamaica's mountains, and one slope receives more rain than the sheltered side. What explains this pattern?",
    "options": [
      "Rising air rains windward and descends drier leeward.",
      "Mountains divert most rain clouds around Jamaica.",
      "The leeward slope receives more rain because it is lower.",
      "Rainfall depends mainly on where rivers begin."
    ],
    "correctAnswer": 0,
    "explanation": "Relief causes moist air to rise, cool and condense on the windward side, creating a rain-shadow effect on the leeward side."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Watershed Cause and Effect",
    "question": "Trees are removed from steep land above a river. After heavy rain, the river becomes muddy and floods faster. Which chain best explains the evidence?",
    "options": [
      "Fewer trees cause the river to flow uphill.",
      "Less vegetation increases rapid runoff and soil erosion.",
      "Deforestation prevents rain from reaching the soil.",
      "Muddy water proves that the coast moved inland."
    ],
    "correctAnswer": 1,
    "explanation": "Roots and plant cover slow runoff and hold soil. Removing them increases erosion and rapid flow into the watershed."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Hurricane Preparedness",
    "question": "A coastal school is outside the wind-damage zone on one map but inside the storm-surge zone on another. What should planners conclude?",
    "options": [
      "The wind map is enough to classify the school as safe.",
      "Storm surge is less relevant than wind for a coastal school.",
      "Storm surge may still require the school's evacuation.",
      "Both maps should be ignored because they show different hazards."
    ],
    "correctAnswer": 2,
    "explanation": "Hurricanes create several hazards. Low wind exposure does not remove flood risk from storm surge."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Mangrove Systems",
    "question": "After mangroves are cleared, residents record greater shoreline erosion and fewer young fish. Which explanation connects both results?",
    "options": [
      "Mangroves reduce erosion and shelter young marine life.",
      "Mangroves create hurricanes and drive fish offshore.",
      "Mangrove roots block most seawater and therefore reduce erosion.",
      "Young fish depend mainly on leaves falling from mangrove branches."
    ],
    "correctAnswer": 0,
    "explanation": "Mangroves protect shorelines by reducing wave energy and their roots shelter juvenile marine animals."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Decisions",
    "question": "A proposed housing site is near jobs and roads but lies on a floodplain with poor drainage. Which evidence should carry greatest weight before approval?",
    "options": [
      "Access to jobs should outweigh the floodplain evidence.",
      "Assess flood history, drainage, elevation and safe-building needs.",
      "Floodplain evidence can be assessed after the first houses are built.",
      "Good road access will allow floodwater to drain effectively."
    ],
    "correctAnswer": 1,
    "explanation": "A sound location decision weighs accessibility against hazard exposure and whether risks can be safely managed."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Using Environmental Data",
    "question": "Students count plastic items on the same beach sections before and after weekly clean-ups. Counts fall, then rise after a holiday. What is the best inference?",
    "options": [
      "The holiday permanently solved the litter problem.",
      "The beach has no connection to human activity.",
      "Clean-ups helped temporarily; waste prevention is also needed.",
      "One low count proves clean-ups are unnecessary."
    ],
    "correctAnswer": 2,
    "explanation": "Repeated counts show a temporary clean-up effect and renewed litter, supporting both removal and prevention measures."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Conservation Choices",
    "question": "A reef area supports fishing and tourism but shows coral damage from anchors. Which response best addresses cause and livelihood?",
    "options": [
      "Use moorings, protected zones and regulated access.",
      "Ban anchoring but allow unlimited visitor access throughout every reef zone.",
      "Allow anchoring mainly in the busiest reef areas so fishing can continue elsewhere.",
      "Close the entire reef to fishing and tourism without first identifying the most vulnerable areas."
    ],
    "correctAnswer": 0,
    "explanation": "Moorings directly reduce anchor damage, while protected zones and regulated access can protect vulnerable coral without unnecessarily ending fishing and tourism throughout the area."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Climate Data",
    "question": "Rainfall totals vary greatly across five years, but temperatures rise in four of them. Why should a student avoid claiming that one wet year disproves a warming pattern?",
    "options": [
      "Rainfall and temperature should move in the same direction each year.",
      "One wet year and a long-term temperature trend measure different patterns.",
      "The wet year is stronger evidence than the four warmer years.",
      "The most recent month is enough to decide the climate pattern."
    ],
    "correctAnswer": 1,
    "explanation": "Weather variables can differ, and long-term climate patterns require several years of relevant data rather than one unusual year."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Resource Management",
    "question": "A community can pave a hillside road quickly or first build drains and retaining structures. Heavy-rain records show repeated landslides. Which choice best uses the evidence?",
    "options": [
      "Pave first because the smoother surface will reduce runoff.",
      "Rely on warning signs instead of changing the slope.",
      "Control runoff and stabilise the slope before paving.",
      "Ignore rainfall records because roads and slopes are unrelated."
    ],
    "correctAnswer": 2,
    "explanation": "Drainage and slope stability address the documented cause of landslide risk; paving alone may worsen runoff."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliamentary Evidence",
    "question": "A bill passes the House of Representatives but has not completed the Senate stage or received formal assent. What can a student conclude?",
    "options": [
      "The bill is already a court judgment.",
      "The proposal has not completed the law-making process.",
      "House approval completes the main stage, so the remaining steps are optional.",
      "The Municipal Corporation must now appoint senators."
    ],
    "correctAnswer": 1,
    "explanation": "Passing one parliamentary chamber does not by itself complete all stages required before a bill becomes law."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "A report says the Governor-General formally appoints a Prime Minister who commands majority support in the House. Which principle does this show?",
    "options": [
      "Formal duties operate alongside elected parliamentary government.",
      "The Governor-General may choose a Prime Minister without considering House support.",
      "The Senate chooses the House members who form government.",
      "Municipal Corporations control national executive appointments."
    ],
    "correctAnswer": 0,
    "explanation": "The Governor-General performs constitutional functions within a system shaped by elections and parliamentary support."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Judicial Independence",
    "question": "A minister publicly demands that a judge decide a case for the government. Why is that demand harmful?",
    "options": [
      "Judges should follow whichever side has more supporters.",
      "Ministers may draft court decisions when government is involved.",
      "Courts must follow law and evidence without political direction.",
      "Independent courts prevent citizens from presenting evidence."
    ],
    "correctAnswer": 2,
    "explanation": "Judicial independence protects fair decisions based on law and evidence rather than political pressure."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Local Government",
    "question": "Residents document blocked drains and unsafe conditions at a parish market. Which first contact best matches the services involved?",
    "options": [
      "The Municipal Corporation/local authority",
      "The Bank of Jamaica, which manages monetary policy",
      "CARICOM, which coordinates regional cooperation",
      "The Senate alone, which manages each parish market"
    ],
    "correctAnswer": 0,
    "explanation": "Municipal Corporations are Jamaica's local authorities and manage many local facilities and services, including drains and markets."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "Residents have the right to express concern about a waste site. Which action best combines that right with civic responsibility?",
    "options": [
      "Damage equipment so officials must listen.",
      "Present evidence peacefully and respect others' rights.",
      "Publish private information about workers.",
      "Prevent anyone with a different view from speaking."
    ],
    "correctAnswer": 1,
    "explanation": "Responsible civic participation uses lawful, peaceful methods and respects the rights of others while presenting evidence."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Public Participation",
    "question": "A council presents two park designs before making a final choice. Why can public consultation improve the decision?",
    "options": [
      "Consultation ensures each neighbourhood receives its preferred design.",
      "Public views should outweigh safety and budget evidence.",
      "Residents contribute evidence about needs, access and effects.",
      "Participation should be limited to residents who support one design."
    ],
    "correctAnswer": 2,
    "explanation": "Consultation can add local evidence, but decision-makers must still consider law, safety and available resources."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Accountability",
    "question": "An agency reports that a road project cost more than planned but gives no receipts or explanation. What accountability step is most useful?",
    "options": [
      "Require records of approved spending, costs and changes.",
      "Treat the extra cost as reasonable because the road was completed.",
      "Delete the original budget so no comparison can be made.",
      "Judge the project mainly by its finished appearance."
    ],
    "correctAnswer": 0,
    "explanation": "Accountability requires transparent records that allow planned and actual spending to be compared and explained."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Regional Cooperation",
    "question": "A qualified Jamaican worker asks whether CSME arrangements may support work in participating CARICOM states. What evidence is most relevant?",
    "options": [
      "A parish market licence from any Municipal Corporation",
      "The applicable CSME skills rules and required documents",
      "A Jamaican weather forecast",
      "The worker's preferred holiday destination"
    ],
    "correctAnswer": 1,
    "explanation": "CSME movement depends on the applicable regional regime and evidence that the person meets its requirements."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Public Decision-Making",
    "question": "A community wants a clinic, a bridge and a sports field, but funds cover only one project. What should officials do first?",
    "options": [
      "Choose the project proposed by the largest meeting group.",
      "Promise all three without identifying funding.",
      "Compare urgency, people affected, safety and cost.",
      "Ignore evidence and choose by lottery."
    ],
    "correctAnswer": 2,
    "explanation": "Fair public prioritisation compares needs, impacts, safety and cost before limited funds are committed."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Resolving Conflict",
    "question": "Two neighbourhood groups disagree about evening use of a community centre. Which process is most likely to produce a fair solution?",
    "options": [
      "Hear both groups, apply rules and agree on a schedule.",
      "Allow the larger group to exclude everyone else permanently.",
      "Close the centre without hearing either group.",
      "Let each group secretly change the schedule."
    ],
    "correctAnswer": 0,
    "explanation": "A fair resolution considers both sides, follows rules and uses evidence to reach a practical arrangement."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Opportunity Cost",
    "question": "A school can use a grant for a library roof or new sports uniforms. The roof leaks onto books during rain. What is the opportunity cost of repairing the roof?",
    "options": [
      "The rain that already fell",
      "The uniforms not purchased",
      "The books damaged if the roof remains unrepaired",
      "The workers' travel route"
    ],
    "correctAnswer": 1,
    "explanation": "Opportunity cost is the next-best alternative given up when limited resources are used for the roof."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Supply and Demand",
    "question": "A disease reduces the local tomato crop while demand remains similar. Which outcome is most likely first?",
    "options": [
      "Tomato prices rise because fewer are available.",
      "Prices fall because scarcity increases supply.",
      "Demand falls because the crop disease affects supply.",
      "Farmers shift resources from other crops into tomatoes immediately."
    ],
    "correctAnswer": 0,
    "explanation": "With lower supply and similar demand, buyers compete for fewer tomatoes, creating upward pressure on price."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Trade Reasoning",
    "question": "A Jamaican processor imports packaging but exports bottled sauce. If packaging costs rise, what two-part effect is most plausible?",
    "options": [
      "Imported packaging makes the finished sauce an import.",
      "The sauce can no longer be made from Jamaican ingredients.",
      "Higher packaging costs may reduce export profit or raise price.",
      "Higher packaging costs lead to higher profit if price is unchanged."
    ],
    "correctAnswer": 2,
    "explanation": "Imported packaging is a production input, so a higher cost can affect the final price or the producer's profit."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Taxation and Services",
    "question": "Residents demand better drains but also argue that no one should contribute taxes or fees. What economic connection is missing?",
    "options": [
      "Shared services require public revenue.",
      "Taxes mainly support private advertising rather than drains.",
      "Drain maintenance creates money without resources.",
      "Public services have no labour or material costs."
    ],
    "correctAnswer": 0,
    "explanation": "Roads, drains, schools and other shared services require funding for workers, materials and maintenance."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Linkages",
    "question": "A hotel buys food from nearby farmers and hires local guides. Which evidence best shows a wider community benefit?",
    "options": [
      "Most tourism benefits go to airlines rather than local suppliers.",
      "Tourism spending supports connected local businesses and workers.",
      "Local purchases make farming support unnecessary.",
      "Tourism spending remains concentrated within the hotel."
    ],
    "correctAnswer": 1,
    "explanation": "Tourism can create linkages when visitor spending supports local suppliers, services and employment."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Cooperatives",
    "question": "Small farmers cannot individually afford refrigerated storage. Why might a cooperative help?",
    "options": [
      "Membership alone provides storage without investment costs.",
      "Shared ownership reduces the need for operating rules and records.",
      "Members pool resources for shared storage under agreed rules.",
      "Each farmer must stop making personal decisions."
    ],
    "correctAnswer": 2,
    "explanation": "Cooperation can make a costly shared service affordable, provided members use clear rules and accountable records."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Saving Decisions",
    "question": "A family has irregular income and frequent emergency borrowing. Which change most directly builds resilience?",
    "options": [
      "Save during stronger-income weeks for emergencies.",
      "Use strong-income surpluses to upgrade regular spending.",
      "Borrow more whenever income rises.",
      "Treat wants as fixed bills."
    ],
    "correctAnswer": 0,
    "explanation": "Regular saving during stronger weeks builds a buffer that can reduce reliance on debt during emergencies."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Budget Evidence",
    "question": "A household budget shows spending exceeds income by J$4,000. Which response uses the evidence best?",
    "options": [
      "Treat the shortfall as temporary because it is recorded in a budget.",
      "Reduce flexible expenses before adding commitments.",
      "Raise optional expenses while keeping essential spending unchanged.",
      "Count borrowed money as permanent income."
    ],
    "correctAnswer": 1,
    "explanation": "A projected shortfall requires reducing or postponing lower-priority expenses or finding sustainable income before new commitments."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Costs and Benefits",
    "question": "A factory proposal offers jobs but may pollute a river used by fishers. Which economic decision is strongest?",
    "options": [
      "Approve it because job gains are easier to measure than river costs.",
      "Reject businesses that depend on nearby natural resources.",
      "Compare jobs with prevention costs and losses to river users.",
      "Count factory income but exclude costs to other people."
    ],
    "correctAnswer": 2,
    "explanation": "Sound decisions consider benefits, external costs and whether safeguards can prevent or reduce harm."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Entrepreneurship Evidence",
    "question": "A student wants to produce 500 snacks after selling 20 in one day. What evidence-based next step reduces risk?",
    "options": [
      "Test demand, calculate full costs and expand gradually.",
      "Borrow for 500 because the first-day sales predict continuing demand.",
      "Ignore ingredient and packaging costs.",
      "Set the price after all snacks have expired."
    ],
    "correctAnswer": 0,
    "explanation": "A longer demand test and complete cost calculation provide stronger evidence before committing scarce money."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff1Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff1Questions)
      : prepareSocialStudiesPreview(g5SsDiff1Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 1",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 1</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 1</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 1</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
