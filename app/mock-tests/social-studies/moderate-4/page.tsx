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

const g5SsMod4Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `Why did LARGE NUMBERS of Jamaicans migrate to Britain in the 1950s and 1960s?`,
    options: [
      "Britain forced Jamaicans to migrate",
      "Jamaicans were fleeing political persecution",
      "Britain actively recruited Caribbean workers to fill post-war labour shortages — Jamaicans went seeking economic opportunity and better living conditions",
      "Jamaicans were expelled from their own country",
    ],
    correctAnswer: 2,
    explanation: `The 1948 British Nationality Act gave Commonwealth citizens the right to live in Britain. With Britain rebuilding after WWII and Jamaica offering limited opportunities, tens of thousands made the 'Windrush' journey.`
  },
  {
    id: 2,
    type: "history",
    skill: "Analysis",
    question: `What does the PHRASE 'freedom is not free' mean in the context of Jamaica's independence struggle?`,
    options: [
      "Freedom is expensive to buy",
      "Freedom was purchased from Britain",
      "Freedom was won through the sacrifices and sustained activism of leaders like Manley, Bustamante, and workers who organised, marched, and demanded rights over decades",
      "Freedom was given freely by Britain",
    ],
    correctAnswer: 2,
    explanation: `Independence was not granted out of generosity — it was the result of decades of organised political activism, strikes, civil disobedience, and persistent pressure from Jamaican leaders and ordinary people.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing",
    question: `How was Norman Manley's vision for Jamaica SIMILAR to and DIFFERENT from Marcus Garvey's?`,
    options: [
      "They were completely identical",
      "Manley wanted colonialism; Garvey wanted independence",
      "Both wanted dignity and justice for Black people, but Manley focused on building an independent Jamaican nation-state while Garvey focused on Pan-African unity and return to Africa",
      "Neither cared about ordinary Jamaicans",
    ],
    correctAnswer: 2,
    explanation: `Both started from the same desire — dignity and self-determination for Black people. But Manley's nationalism was rooted in Jamaica, while Garvey's vision was transnational and ultimately Africa-centred.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact",
    question: `How did the 1938 LABOUR UNREST across Jamaica contribute to political change?`,
    options: [
      "It caused Britain to increase control",
      "It had no political impact",
      "The strikes and labour unrest demonstrated the power of organised workers and led directly to political reforms — including the introduction of Universal Adult Suffrage in 1944",
      "It ended Bustamante's career",
    ],
    correctAnswer: 2,
    explanation: `The 1938 uprisings — led by Bustamante and others — showed that ordinary workers could force political change. Britain responded with the Moyne Commission and eventual democratic reforms.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is George William Gordon recognised as a National Hero despite not leading a direct rebellion?`,
    options: [
      "He did lead a rebellion",
      "He was the richest Jamaican of his time",
      "He used his position as a legislator to advocate powerfully for the poor and was martyred by the colonial authorities — his execution without fair trial made him a symbol of colonial injustice",
      "He was a friend of Paul Bogle's",
    ],
    correctAnswer: 2,
    explanation: `Gordon's heroism lay in using political power to advocate for the powerless — and in his unjust execution. The colonial government's haste to make an example of him exposed the brutality of the system he opposed.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cultural Continuity",
    question: `How does JONKANOO (John Canoe) demonstrate CULTURAL RESILIENCE?`,
    options: [
      "Jonkanoo was created by the British",
      "It has no African roots",
      "Jonkanoo preserved West African masquerade traditions under slavery — enslaved people maintained cultural identity through this festival even when denied almost everything else",
      "Jonkanoo was only created after emancipation",
    ],
    correctAnswer: 2,
    explanation: `Enslaved Africans maintained cultural identity through disguise — the masquerade tradition allowed African spiritual and communal practices to survive under the watchful eye of enslavers.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cause & Effect",
    question: `What was a DIRECT CONSEQUENCE of Jamaica leaving the Federation of the West Indies in 1961?`,
    options: [
      "Jamaica rejoined the federation in 1965",
      "Nothing changed",
      "Independence — without the federation framework, Jamaica proceeded directly to full independence in 1962",
      "Jamaica became a British Crown Colony again",
    ],
    correctAnswer: 2,
    explanation: `When Jamaica voted to leave the federation in 1961, the path to independence opened. Jamaica became independent on August 6, 1962 — one of the first Caribbean nations to do so.`
  },
  {
    id: 8,
    type: "history",
    skill: "Evaluating Evidence",
    question: `A tourist brochure from the 1950s describes Jamaica as 'a happy, peaceful tropical paradise.' Why is this description MISLEADING?`,
    options: [
      "Tourist brochures are always accurate",
      "Jamaica was peaceful in the 1950s",
      "It omits the deep poverty, inequality, and political activism of the period — it presents only what would attract wealthy tourists, erasing the lived reality of most Jamaicans",
      "It accurately describes Jamaica's geography",
    ],
    correctAnswer: 2,
    explanation: `Tourism promotion always selects positive aspects. In reality, the 1950s saw significant labour unrest, poverty, and political agitation that formed the backdrop to independence.`
  },
  {
    id: 9,
    type: "history",
    skill: "Legacy of Slavery",
    question: `What does the concept of 'REPARATIONS' mean in the context of the history of slavery?`,
    options: [
      "Repairing broken buildings",
      "Returning enslaved people to Africa",
      "Compensation or amends paid by countries and institutions that benefited from slavery to the descendants of those who were enslaved",
      "A type of trade agreement",
    ],
    correctAnswer: 2,
    explanation: `Reparations debates centre on whether those who profited from slavery (European governments, companies, institutions) owe compensation to descendants of the enslaved — addressing historical injustice.`
  },
  {
    id: 10,
    type: "history",
    skill: "Historical Thinking",
    question: `A historian says 'there are always multiple perspectives on historical events.' How does this apply to the Morant Bay Rebellion?`,
    options: [
      "Historical events have only one true interpretation",
      "The colonial government's account is the only valid one",
      "The rebellion can be seen as criminal violence (from the colonial perspective) or as legitimate protest against injustice (from the perspective of poor Jamaicans) — both perspectives use the same events but interpret them very differently",
      "Paul Bogle's perspective is the only valid one",
    ],
    correctAnswer: 2,
    explanation: `Multiperspectivity is fundamental to historical thinking. The Morant Bay Rebellion looks radically different depending on whose interests and values frame the analysis.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Skills",
    question: `A map scale shows that 1 cm represents 5 km. Two towns are 4 cm apart on the map. About how far apart are they in reality?`,
    options: [
      "9 km",
      "20 km",
      "25 km",
      "40 km",
    ],
    correctAnswer: 1,
    explanation: `Four centimetres multiplied by 5 kilometres per centimetre gives a real distance of about 20 kilometres.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Settlement",
    question: `Why are many settlements found near major roads?`,
    options: [
      "Roads can make travel, trade, and access to services easier.",
      "Roads prevent every type of natural hazard.",
      "People living near roads never need other transport.",
      "Major roads always have the coolest climate.",
    ],
    correctAnswer: 0,
    explanation: `Access to transport can help residents reach jobs, markets, schools, health services, and other communities.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Watersheds",
    question: `A community removes much of the forest from steep slopes above its river. Which problem is MOST likely after heavy rain?`,
    options: [
      "Less soil is washed into the river.",
      "More runoff and soil erosion may occur.",
      "The river immediately becomes salt water.",
      "Rainfall stops falling on the slope.",
    ],
    correctAnswer: 1,
    explanation: `Vegetation slows runoff and holds soil. Removing it from steep slopes can increase erosion and sediment entering rivers.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Coastal Environment",
    question: `Why should a community avoid removing all the mangroves along an exposed coastline?`,
    options: [
      "Mangroves can reduce wave energy and provide important habitat for young marine animals.",
      "Mangroves are useful mainly because their roots create new sandy beaches for recreation.",
      "Mangroves protect coasts by preventing salt water from ever moving inland during storms.",
      "Mangroves grow naturally near the sea, so damaged areas usually recover without protection.",
    ],
    correctAnswer: 0,
    explanation: `Mangroves help protect shorelines and also provide valuable habitat, especially for young fish and other organisms.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Population Distribution",
    question: `A parish map shows many people living near the coast and far fewer in the mountainous interior. What does the map show?`,
    options: [
      "Population is spread almost evenly between the coast and the mountainous interior.",
      "Population is concentrated more heavily in coastal areas.",
      "Population is concentrated mainly in the mountainous interior.",
      "The map shows that settlement is scattered evenly throughout the parish.",
    ],
    correctAnswer: 1,
    explanation: `The map indicates a spatial pattern: a larger share of the population is clustered near the coast.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Climate",
    question: `Two farming communities grow the same crop, but one receives much less rainfall. Which factor should that community consider MOST carefully?`,
    options: [
      "Water supply and irrigation needs",
      "The colour of nearby houses",
      "The parish motto",
      "The number of road signs",
    ],
    correctAnswer: 0,
    explanation: `Lower rainfall can limit crop growth, so farmers need to plan how water will be supplied and conserved.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Environmental Evidence",
    question: `Students want to know whether littering near a stream is decreasing. Which evidence would be MOST useful?`,
    options: [
      "The number and type of litter items counted at the same locations over several weeks",
      "The number of students who report that the stream appears cleaner each week",
      "Photographs taken from different locations each time the class visits the stream",
      "The amount of rainfall recorded in the parish during the same period",
    ],
    correctAnswer: 0,
    explanation: `Repeated counts from the same locations allow the students to compare changes in litter over time.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Human Geography",
    question: `A town grows quickly but roads and drainage are not improved. Which problem could result?`,
    options: [
      "Greater traffic congestion and flooding",
      "Fewer people using roads",
      "Automatic improvement in every public service",
      "Lower rainfall throughout the parish",
    ],
    correctAnswer: 0,
    explanation: `Rapid growth can place pressure on transport and drainage infrastructure if services do not expand with the population.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Land Use",
    question: `A flat area beside a river floods almost every year. Which use requires the MOST careful planning?`,
    options: [
      "Building a new housing development",
      "Marking a nature trail",
      "Planting flood-tolerant vegetation",
      "Monitoring river levels",
    ],
    correctAnswer: 0,
    explanation: `Permanent housing in a frequently flooded area can place people and property at risk, so flood hazard must be considered before building.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Natural Hazards",
    question: `A hurricane watch is issued for Jamaica. Which community action is BEST before conditions worsen?`,
    options: [
      "Check emergency supplies and follow official weather information.",
      "Wait until flooding begins before making any preparation.",
      "Ignore evacuation advice unless neighbours leave first.",
      "Remove storm shutters to improve ventilation.",
    ],
    correctAnswer: 0,
    explanation: `Preparing supplies and following official information helps households respond early and safely to changing hurricane conditions.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Parliament",
    question: `Why does Parliament debate proposed laws before they are passed?`,
    options: [
      "To allow representatives to examine, question, and suggest changes to proposed laws",
      "To allow courts to decide whether each proposal should become law before Parliament votes",
      "To allow citizens to vote directly on every proposed law before it reaches Parliament",
      "To allow ministers to describe proposals without questions from other representatives",
    ],
    correctAnswer: 0,
    explanation: `Debate lets legislators examine proposals, raise concerns, and consider changes before a final decision.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Local Government",
    question: `Residents report an overflowing local market drain. Which public body would normally be most directly involved in addressing this local-service issue?`,
    options: [
      "The Municipal Corporation/local authority",
      "CARICOM",
      "The Senate of another country",
      "The Caribbean Examinations Council",
    ],
    correctAnswer: 0,
    explanation: `Municipal Corporations/local authorities handle many local services and facilities within their areas.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Rights and Responsibilities",
    question: `A citizen has the right to express an opinion at a peaceful meeting. Which responsibility should accompany that right?`,
    options: [
      "Respect the law and the rights and safety of others.",
      "Prevent everyone with a different opinion from speaking.",
      "Damage property if the meeting becomes frustrating.",
      "Ignore lawful safety instructions.",
    ],
    correctAnswer: 0,
    explanation: `Rights are exercised within the law and alongside responsibilities to respect other people's rights and public safety.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Rule of Law",
    question: `Why is it important that public officials must obey the law?`,
    options: [
      "It supports the principle that the law applies to everyone.",
      "It allows officials to change laws whenever they wish.",
      "It means courts are no longer needed.",
      "It guarantees every government decision is popular.",
    ],
    correctAnswer: 0,
    explanation: `The rule of law means that citizens and public officials are all subject to the law.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Elections",
    question: `Why is a secret ballot important in an election?`,
    options: [
      "It helps voters make choices without others knowing how they voted.",
      "It prevents election officials from counting votes.",
      "It allows one voter to vote for several people.",
      "It removes the need for registered candidates.",
    ],
    correctAnswer: 0,
    explanation: `A secret ballot protects voter privacy and reduces pressure or intimidation over a person's choice.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Government Accountability",
    question: `A community asks a government agency to explain how money for a project was spent. Which democratic principle are residents promoting?`,
    options: [
      "Accountability",
      "Hereditary rule",
      "Censorship",
      "Colonialism",
    ],
    correctAnswer: 0,
    explanation: `Accountability means public bodies and officials should be able to explain and take responsibility for their decisions and use of public resources.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Citizenship",
    question: `Which action BEST shows active citizenship?`,
    options: [
      "Joining a lawful community clean-up and reporting a blocked drain",
      "Ignoring every community problem because government alone must act",
      "Damaging a public facility to attract attention",
      "Spreading an unverified rumour about a neighbour",
    ],
    correctAnswer: 0,
    explanation: `Active citizenship includes lawful participation and constructive action to improve one's community.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Regional Cooperation",
    question: `Several Caribbean countries share hurricane information and emergency supplies after a major storm. What does this BEST demonstrate?`,
    options: [
      "Regional cooperation",
      "Colonial rule",
      "Private ownership",
      "Individual taxation",
    ],
    correctAnswer: 0,
    explanation: `Countries cooperating across borders to respond to a shared problem is an example of regional cooperation.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Separation of Powers",
    question: `Why should courts be able to decide cases without being told what verdict to give by political leaders?`,
    options: [
      "Judicial independence supports fair application of the law.",
      "Courts should make all laws instead of Parliament.",
      "Judges should run political parties.",
      "Courts should decide who may vote in every election.",
    ],
    correctAnswer: 0,
    explanation: `Judicial independence helps courts make decisions according to law and evidence rather than political instructions.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Public Participation",
    question: `A Municipal Corporation invites residents to comment on plans for a new market. Why is this useful?`,
    options: [
      "Residents can provide information about local needs and concerns before the plan is finalised.",
      "Residents can replace elected officials and make the final decision on the market themselves.",
      "Residents can decide how all Municipal Corporation funds must be spent during the year.",
      "Residents can require the Corporation to accept every suggestion made at the consultation.",
    ],
    correctAnswer: 0,
    explanation: `Public consultation can help decision-makers understand local needs and concerns before completing a plan.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Opportunity Cost",
    question: `A school club has enough money for either new sports equipment or a shade tent, but not both. Choosing the shade tent means:`,
    options: [
      "The sports equipment is the opportunity given up when the club chooses the shade tent.",
      "The money paid for the shade tent is the opportunity cost of choosing it.",
      "The benefits of both the tent and sports equipment together are the opportunity cost.",
      "The cash remaining after purchasing the shade tent is the opportunity cost.",
    ],
    correctAnswer: 0,
    explanation: `When resources are limited, choosing one option means giving up another possible use of those resources.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Local Production",
    question: `A restaurant buys eggs from a nearby farmer. Which local economic effect is MOST direct?`,
    options: [
      "The farmer earns income by supplying a nearby business with eggs.",
      "The restaurant reduces demand for locally produced food by purchasing nearby eggs.",
      "The farmer becomes an employee of the restaurant after completing the sale.",
      "The purchase becomes an import because the eggs are transported to another business.",
    ],
    correctAnswer: 0,
    explanation: `The purchase creates income for a local producer and links one local business to another.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Consumer Decisions",
    question: `Two shops sell the same school bag. One costs J$4,500 and the other J$3,900 with the same warranty. What should a careful consumer do?`,
    options: [
      "Compare price, quality, and warranty before buying.",
      "Always choose the most expensive item.",
      "Ignore whether the bag is suitable.",
      "Buy both because comparison is unnecessary.",
    ],
    correctAnswer: 0,
    explanation: `Consumers make better decisions when they compare important features and cost instead of relying on price alone.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Employment",
    question: `A new agro-processing factory opens near several farming communities. Which effect is MOST likely?`,
    options: [
      "It may create jobs and provide a new market for some crops grown by nearby farmers.",
      "It may reduce local farm sales because agro-processing factories do not use nearby crops.",
      "It can create jobs only when all of the raw materials used by the factory are imported.",
      "It will cause farmers to stop producing because the factory will compete with their farms.",
    ],
    correctAnswer: 0,
    explanation: `Processing businesses can employ workers and purchase agricultural products from nearby farmers.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Budgeting",
    question: `A youth club has J$30,000 for a community event. Which action BEST demonstrates budgeting?`,
    options: [
      "Estimate costs for the venue, supplies, and activities before spending.",
      "Spend the full amount on the first item offered.",
      "Avoid recording any purchases.",
      "Borrow additional money before calculating the event's cost.",
    ],
    correctAnswer: 0,
    explanation: `A budget plans how limited money will be allocated among expected expenses.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Public Services",
    question: `Why might a community support using some tax revenue to repair a damaged public road?`,
    options: [
      "The road is shared infrastructure used by residents, businesses, schools, and emergency services.",
      "The road is used by private vehicles, so public funds should not normally be spent on it.",
      "Road repairs help transport but have little connection to businesses or emergency services.",
      "A public road should be repaired only if every resident agrees that it is the top priority.",
    ],
    correctAnswer: 0,
    explanation: `Public roads support travel, business, emergency services, and access to schools and workplaces, so maintenance can benefit the wider community.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Trade",
    question: `Jamaica imports machinery that local firms use to produce goods. Which statement BEST describes this trade?`,
    options: [
      "Imports can include useful equipment that supports local production.",
      "Every import reduces production in Jamaica.",
      "Imported machinery can never be used by Jamaican workers.",
      "Trade occurs only when finished food is sold overseas.",
    ],
    correctAnswer: 0,
    explanation: `Countries import many kinds of goods, including machinery and equipment that local businesses can use to produce other goods and services.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Saving",
    question: `Why might a household keep an emergency savings fund?`,
    options: [
      "To help meet an unexpected expense without immediately depending on new borrowing",
      "To earn enough interest to guarantee the household can pay for every future emergency",
      "To avoid including unexpected expenses when the household prepares a budget",
      "To replace insurance and other forms of planning for financial risks",
    ],
    correctAnswer: 0,
    explanation: `Emergency savings can provide money for unexpected needs and reduce the need to borrow immediately.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Community Resources",
    question: `A popular beach attracts visitors but litter is increasing. Which response BEST balances economic and environmental needs?`,
    options: [
      "Improve waste collection and enforce anti-litter rules while keeping the beach responsibly open.",
      "Reduce waste collection and sharply restrict visitors so the beach can recover naturally.",
      "Keep the beach open but allow each tourism business to decide whether litter rules apply.",
      "Close tourism businesses during busy periods even if improved waste management could solve the problem.",
    ],
    correctAnswer: 0,
    explanation: `Managing waste protects the resource that residents, visitors, and businesses depend on without unnecessarily ending economic activity.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Economic Decision-Making",
    question: `A cooperative earns a surplus after paying its costs. Members want both future security and better equipment. Which plan is MOST balanced?`,
    options: [
      "Save part of the surplus and use part for agreed improvements.",
      "Spend the entire surplus immediately on decorations.",
      "Distribute every dollar and keep no reserve.",
      "Borrow more money before deciding what equipment is needed.",
    ],
    correctAnswer: 0,
    explanation: `Dividing the surplus between reserves and useful investment balances future security with current improvement.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod4Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod4Questions)
      : prepareSocialStudiesPreview(g5SsMod4Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 4",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 4</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 4</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 4</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
