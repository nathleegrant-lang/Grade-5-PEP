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

const g5SsMod5Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Cause & Effect",
    question: `Why did Marcus Garvey leave Jamaica and spend most of his career abroad?`,
    options: [
      "He was exiled by the Jamaican government",
      "He preferred colder climates",
      "Jamaica's small size limited the reach of his message — he needed the large Black communities of New York, London, and elsewhere to build a global movement",
      "He was born abroad",
    ],
    correctAnswer: 2,
    explanation: `Garvey recognised that building a global Pan-African movement required bases in the diaspora — New York's Harlem offered a large Black community, major newspapers, and international connections.`
  },
  {
    id: 2,
    type: "history",
    skill: "Significance",
    question: `Why is August 1, 1838 considered MORE SIGNIFICANT than August 1, 1834?`,
    options: [
      "They are equally significant",
      "1834 was actually more important",
      "1834 marked technical emancipation but with a forced 'apprenticeship' period. August 1, 1838 was true freedom — when the apprenticeship ended and enslaved people could finally live and move freely",
      "There is no difference between the two dates",
    ],
    correctAnswer: 2,
    explanation: `Apprenticeship (1834-1838) was slavery by another name — former enslaved people had to continue working for their enslavers unpaid. Only in 1838 did genuine freedom begin.`
  },
  {
    id: 3,
    type: "history",
    skill: "Comparing",
    question: `How did FEMALE ENSLAVED PEOPLE experience slavery DIFFERENTLY from males?`,
    options: [
      "There was no difference",
      "Women had it better than men",
      "Women faced all the same hardships as men PLUS additional exploitation — sexual violence, forced childbearing to 'produce' more enslaved people, and the particular trauma of having children who could be sold away",
      "Women were treated better than men",
    ],
    correctAnswer: 2,
    explanation: `Enslaved women faced gendered forms of oppression on top of the general brutality — sexual exploitation, forced reproduction to increase the enslaver's 'property,' and the anguish of seeing children sold.`
  },
  {
    id: 4,
    type: "history",
    skill: "Impact of Heritage",
    question: `How does JAMAICAN CUISINE reflect the island's diverse cultural heritage?`,
    options: [
      "Jamaican food comes only from Africa",
      "Jamaican food was entirely created by the British",
      "Ackee (West Africa), curry goat (India), bammy (Taino), jerk (Maroon), and bread (European) — Jamaican food is a living archive of the island's cultural encounters",
      "Jamaican cuisine has no African roots",
    ],
    correctAnswer: 2,
    explanation: `Every dish on a Jamaican table is a history lesson — the ingredients and techniques trace the routes of colonialism, the slave trade, indentureship, and indigenous culture.`
  },
  {
    id: 5,
    type: "history",
    skill: "Historical Significance",
    question: `Why is the year 1494 (Columbus's arrival) a TURNING POINT in Jamaican history?`,
    options: [
      "Because the Taino started farming in 1494",
      "Because Jamaica became British in 1494",
      "It marks the beginning of European colonisation — setting off a chain of events (Spanish settlement, Taino genocide, British conquest, slavery, emancipation) that shaped modern Jamaica",
      "Because Jamaica was discovered by Jamaicans in 1494",
    ],
    correctAnswer: 2,
    explanation: `1494 is a hinge year — before it, Jamaica was a flourishing Taino society; after it, everything changed: indigenous collapse, colonisation, the slave trade, and the creation of modern Jamaica.`
  },
  {
    id: 6,
    type: "history",
    skill: "Cultural Analysis",
    question: `How does the MAROON COMMUNITY of Moore Town preserve Jamaica's African heritage TODAY?`,
    options: [
      "Maroons no longer exist",
      "Maroon communities have completely assimilated",
      "Moore Town Maroons maintain their own governance (the Colonel and council), traditional ceremonies (Kromanti ceremonies), music (Abeng), and distinct identity — a living link to African resistance",
      "Maroons speak only English today",
    ],
    correctAnswer: 2,
    explanation: `Maroon communities are living repositories of African cultural survival — their governance, music, ceremonies, and identity represent continuous resistance to cultural erasure across centuries.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cause & Effect",
    question: `What was the LONG-TERM EFFECT of the plantation economy's dependence on sugar on modern Jamaica?`,
    options: [
      "It made Jamaica very wealthy for all Jamaicans",
      "It had no long-term effects",
      "Jamaica was left with a distorted economy dependent on a few export crops, significant inequality in land ownership, and limited industrialisation — legacies that still challenge development",
      "It created a diversified, resilient economy",
    ],
    correctAnswer: 2,
    explanation: `The plantation legacy — monoculture, concentrated land ownership, absent industrialisation — created structural weaknesses in Jamaica's economy that persist to this day.`
  },
  {
    id: 8,
    type: "history",
    skill: "Historical Comparison",
    question: `How was PAUL BOGLE's rebellion DIFFERENT from GEORGE WILLIAM GORDON's political activism?`,
    options: [
      "They were identical in approach",
      "Bogle used political channels while Gordon used physical force",
      "Bogle led direct armed action (the Morant Bay march and uprising), while Gordon used legislative and public advocacy — different methods both aimed at justice for the poor",
      "Gordon was more violent than Bogle",
    ],
    correctAnswer: 2,
    explanation: `The contrast between Bogle (physical uprising) and Gordon (political advocacy) shows how the same cause — justice for poor Jamaicans — was pursued through different means by different people.`
  },
  {
    id: 9,
    type: "history",
    skill: "Legacy",
    question: `Why do Jamaicans celebrate their NATIONAL HEROES rather than colonial figures?`,
    options: [
      "Because colonial figures are unknown",
      "Because Jamaicans are required to by law",
      "Celebrating National Heroes reflects Jamaica's post-colonial identity — honouring those who fought FOR Jamaican people rather than those who exploited them",
      "Colonial figures have no statues",
    ],
    correctAnswer: 2,
    explanation: `National hero celebrations are an act of historical reclamation — choosing to honour resisters and builders of independence rather than those who profited from colonialism.`
  },
  {
    id: 10,
    type: "history",
    skill: "Analysis",
    question: `What does it MEAN that Jamaica has ONLY ONE female National Hero?`,
    options: [
      "That Jamaican women have not contributed to history",
      "That only Nanny deserved the honour",
      "It reflects both the genuine exceptional nature of Nanny's achievement AND historical patterns of overlooking women's contributions — a subject of ongoing discussion in Jamaica",
      "That all seven National Heroes are famous internationally",
    ],
    correctAnswer: 2,
    explanation: `The absence of women beyond Nanny raises important questions about whose contributions are recognised and who gets written into history — a living debate about how Jamaica remembers its past.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Map Skills",
    question: `A school is west of a health centre. In which direction would a student travel from the school to the health centre?`,
    options: [
      "West",
      "East",
      "North",
      "South",
    ],
    correctAnswer: 1,
    explanation: `If the school is west of the health centre, the health centre lies east of the school.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Relief and Maps",
    question: `On a contour map, lines are very close together on one hillside. What does this usually indicate?`,
    options: [
      "A steep slope",
      "A completely flat area",
      "A coral reef",
      "A parish boundary",
    ],
    correctAnswer: 0,
    explanation: `Closely spaced contour lines indicate that elevation changes quickly over a short horizontal distance, so the slope is steep.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Settlement",
    question: `Why might a town grow near a major road junction?`,
    options: [
      "The location can make movement of people and goods easier, encouraging homes and businesses to develop nearby.",
      "The junction usually reduces traffic on nearby roads, making the area less attractive to businesses.",
      "The junction guarantees that public services will be built before new residents arrive.",
      "The junction makes nearby farmland more productive because more vehicles pass through the area.",
    ],
    correctAnswer: 0,
    explanation: `Transport links often encourage settlement and business because people and goods can move more easily.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environmental Management",
    question: `Residents notice dead fish downstream from a waste-disposal site. What should be investigated FIRST?`,
    options: [
      "Whether waste is entering the river",
      "The colour of nearby roofs",
      "The age of the oldest resident",
      "The number of buses in the parish",
    ],
    correctAnswer: 0,
    explanation: `The location and dead fish suggest possible water pollution, so checking whether waste is entering the river is directly relevant evidence.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Conservation",
    question: `A hillside farm is losing soil during heavy rain. Which change could BEST reduce erosion?`,
    options: [
      "Plant ground cover and use contour farming",
      "Clear all vegetation between crops",
      "Plough straight down steep slopes",
      "Leave the soil bare after harvesting",
    ],
    correctAnswer: 0,
    explanation: `Vegetation and contour farming slow runoff and help keep soil on the slope.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Human and Physical Features",
    question: `Which pair contains one physical feature and one human-made feature?`,
    options: [
      "Mountain and highway",
      "School and bridge",
      "River and valley",
      "Harbour wall and market",
    ],
    correctAnswer: 0,
    explanation: `A mountain is a natural physical feature, while a highway is built by people.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate and Agriculture",
    question: `A farmer changes from a water-demanding crop to a more drought-tolerant crop after several dry seasons. What is the farmer doing?`,
    options: [
      "Adapting production to environmental conditions",
      "Increasing farm output by using more water each year",
      "Changing from agriculture to a different economic sector",
      "Moving production to another parish without changing the crop",
    ],
    correctAnswer: 0,
    explanation: `The farmer is adjusting agricultural choices to suit changing water conditions.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Coastal Geography",
    question: `Which area is MOST exposed to storm surge during a hurricane?`,
    options: [
      "A low-lying coastal settlement",
      "A high inland ridge",
      "A mountain community far from the sea",
      "A hilltop above the coast",
    ],
    correctAnswer: 0,
    explanation: `Storm surge is abnormal seawater pushed onto land, so low-lying coastal areas face the greatest direct exposure.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Population",
    question: `A census shows that a town's population has grown rapidly. Which additional information would BEST help planners decide whether another school is needed?`,
    options: [
      "The number and ages of children living in the area",
      "The total number of adults travelling through the town each day",
      "The number of houses constructed in the town during the previous year",
      "The average distance residents travel to the nearest hospital",
    ],
    correctAnswer: 0,
    explanation: `School planning depends strongly on how many school-age children live in the area.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environment and Tourism",
    question: `A nature attraction is becoming damaged because too many visitors leave marked trails. Which action is MOST appropriate?`,
    options: [
      "Use clearly marked trails, visitor limits where necessary, and conservation rules.",
      "Close the attraction temporarily and remove visitor facilities so people cannot enter.",
      "Allow visitors to choose their own routes but add more warning signs in damaged areas.",
      "Build additional attractions inside fragile areas so visitors spread out more widely.",
    ],
    correctAnswer: 0,
    explanation: `Managed access can protect the environment while allowing responsible tourism to continue.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Government",
    question: `Which branch of government interprets and applies the law in court cases?`,
    options: [
      "Judiciary",
      "Legislature",
      "Cabinet only",
      "Municipal market committee",
    ],
    correctAnswer: 0,
    explanation: `Courts form the Judiciary and decide cases according to law.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Parliament",
    question: `Why are both the House of Representatives and Senate involved in making many national laws?`,
    options: [
      "Bills normally pass through parliamentary stages in both Houses before becoming law, subject to constitutional requirements.",
      "Both Houses represent voters in exactly the same way, so each House repeats the other's vote.",
      "The Senate considers only financial matters, while the House handles all other proposed laws.",
      "Both Houses must approve bills because courts are unable to review laws once they are passed.",
    ],
    correctAnswer: 0,
    explanation: `Jamaica has a bicameral Parliament, so legislation normally passes through both Houses as part of the law-making process.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Local Government",
    question: `Residents want repairs to a local market and improved garbage collection. Which body should they most directly approach about these local services?`,
    options: [
      "Municipal Corporation/local authority",
      "The ministry responsible for local government, because it directly repairs every market and collects garbage in each community",
      "The Member of Parliament, because MPs manage local markets and garbage collection through Parliament",
      "The National Solid Waste Management Authority alone, because both market repairs and garbage collection fall entirely under it",
    ],
    correctAnswer: 0,
    explanation: `Municipal Corporations/local authorities have responsibility for many local facilities and services.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Rights",
    question: `Which situation BEST demonstrates freedom of expression being exercised responsibly?`,
    options: [
      "A student respectfully presents an opinion without threatening others.",
      "A person damages property to silence another speaker.",
      "A group prevents anyone with a different view from speaking.",
      "Someone knowingly spreads a harmful false accusation.",
    ],
    correctAnswer: 0,
    explanation: `Freedom of expression protects lawful communication of ideas while operating alongside the rights and safety of others.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Citizenship",
    question: `Why is paying attention to official hurricane warnings a civic responsibility as well as a personal safety choice?`,
    options: [
      "Following reliable warnings can protect households and can also reduce avoidable risks for emergency workers and communities.",
      "Following official warnings transfers all safety responsibility from households to emergency agencies.",
      "Following warnings is mainly necessary after an evacuation order has already been issued.",
      "Official warnings are mainly intended to protect public buildings rather than individual households.",
    ],
    correctAnswer: 0,
    explanation: `Responsible behaviour during emergencies can protect both individuals and the wider community.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Representation",
    question: `A Member of Parliament receives complaints from constituents about a national policy. What is one appropriate action?`,
    options: [
      "Raise constituents' concerns through parliamentary or appropriate government channels.",
      "Direct a court to overturn the policy whenever constituents disagree with it.",
      "Promise that every complaint will be solved without using parliamentary or government processes.",
      "Order a Municipal Corporation to change any national policy affecting the constituency.",
    ],
    correctAnswer: 0,
    explanation: `Representatives can communicate constituent concerns and raise issues through democratic institutions.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Rule of Law",
    question: `Two people accused of the same offence are treated differently only because one is wealthy. Which principle is MOST directly being violated?`,
    options: [
      "Equality before the law",
      "Presumption of innocence",
      "Freedom of expression",
      "Separation of powers",
    ],
    correctAnswer: 0,
    explanation: `Equality before the law requires that legal rules be applied fairly rather than according to wealth or status.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Democratic Participation",
    question: `Which action gives citizens a lawful way to influence public decisions between elections?`,
    options: [
      "Attend consultations, submit petitions, or contact elected representatives about the issue.",
      "Join a political party and assume its leaders must accept every suggestion members make.",
      "Avoid elections but require public officials to follow private instructions from individual citizens.",
      "Use public meetings to prevent people with opposing views from speaking.",
    ],
    correctAnswer: 0,
    explanation: `Democratic participation includes peaceful and lawful ways of expressing views and influencing decision-makers.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Regional Cooperation",
    question: `Why might CARICOM countries cooperate on disaster preparedness?`,
    options: [
      "Several countries face similar hazards, so sharing information, expertise, and emergency resources can strengthen preparedness.",
      "Regional planning means individual countries no longer need their own disaster-preparedness arrangements.",
      "Cooperation works best when every country uses exactly the same emergency plan regardless of local conditions.",
      "Regional cooperation reduces the need for national weather services and emergency-management agencies.",
    ],
    correctAnswer: 0,
    explanation: `Regional cooperation can improve forecasting, preparedness, emergency support, and recovery when several countries face similar hazards.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Accountability",
    question: `A government project costs far more than planned. Why should records of the spending be reviewed?`,
    options: [
      "Public money should be accounted for so officials can show how it was used and why costs changed.",
      "Overspending should be accepted automatically if the project was eventually completed.",
      "Financial records matter only when citizens already have evidence that a crime occurred.",
      "A project manager's explanation is enough even when no records of the additional spending are available.",
    ],
    correctAnswer: 0,
    explanation: `Reviewing expenditure supports accountability and helps determine how public resources were used.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Household Decisions",
    question: `A family has limited money after paying rent and utilities. Which purchase should usually receive priority?`,
    options: [
      "Necessary food and medicine",
      "A second television",
      "Decorative lights",
      "A new game when an older one works",
    ],
    correctAnswer: 0,
    explanation: `With limited income, essential needs generally take priority over optional wants.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Factors Affecting Production",
    question: `A farmer has land and seeds but no reliable way to transport crops to market. What problem is MOST likely?`,
    options: [
      "Produce may spoil or reach fewer buyers.",
      "Crops will automatically grow faster.",
      "Transport no longer affects selling.",
      "The farm becomes a bank.",
    ],
    correctAnswer: 0,
    explanation: `Transport is important in moving goods from producers to markets before they spoil or lose value.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Saving",
    question: `Why is saving a small amount regularly often more effective than waiting to save one large amount someday?`,
    options: [
      "Regular saving builds the fund gradually and makes saving part of a planned routine.",
      "Regular saving is useful mainly because small deposits always earn more interest than larger ones.",
      "Waiting for one large amount is usually better because it avoids making a monthly saving plan.",
      "Regular saving is useful only when a person has no other expenses to meet.",
    ],
    correctAnswer: 0,
    explanation: `Consistent saving helps a person make progress toward a goal over time.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Imports and Exports",
    question: `A Jamaican hotel imports furniture but buys food from local farmers. Which statement is correct?`,
    options: [
      "The hotel participates in international trade and also creates local economic linkages.",
      "The hotel participates only in international trade because tourism itself is an export service.",
      "The hotel participates only in the local economy because the imported furniture is used in Jamaica.",
      "The food purchased locally becomes an import because the hotel serves international visitors.",
    ],
    correctAnswer: 0,
    explanation: `Buying furniture from abroad is importing, while buying from nearby farmers supports local producers.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Demand",
    question: `A concert causes many visitors to arrive in a town for one weekend. Which business might experience a temporary increase in demand?`,
    options: [
      "Local restaurants and transport services",
      "A closed mine with no customers",
      "A farm that sells nothing locally or to visitors",
      "An abandoned building",
    ],
    correctAnswer: 0,
    explanation: `More visitors can temporarily increase demand for services such as food, transport, and accommodation.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Cooperation in Business",
    question: `Several small farmers form a cooperative to buy fertiliser in larger quantities. What is one possible advantage?`,
    options: [
      "They may obtain better prices or share some costs.",
      "The cooperative guarantees every harvest succeeds.",
      "Members no longer make any decisions.",
      "Farming becomes tax-free.",
    ],
    correctAnswer: 0,
    explanation: `Working together can increase buying power and allow members to share costs or services.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Budgeting",
    question: `A community group receives J$200,000 for a project. Why should it keep records of every purchase?`,
    options: [
      "To compare actual spending with the budget and account clearly for how the project's money was used",
      "To prove that every planned expense was paid at exactly the amount originally estimated",
      "To show that the group should spend the full grant before the project ends",
      "To avoid changing the budget even when an unexpected but necessary cost appears",
    ],
    correctAnswer: 0,
    explanation: `Good records allow the group to track spending, stay within its plan, and account for funds.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Economic and Environmental Decisions",
    question: `A business proposal could create jobs but destroy a wetland used as a fish nursery. What should decision-makers do?`,
    options: [
      "Consider both the possible economic benefits and the environmental and livelihood costs before deciding.",
      "Approve the proposal whenever the number of new jobs is greater than the number of fishers affected.",
      "Reject the proposal immediately because any environmental effect makes development unacceptable.",
      "Consider only the wetland because possible economic benefits should never influence a community decision.",
    ],
    correctAnswer: 0,
    explanation: `Responsible decisions consider benefits and costs, including effects on ecosystems and livelihoods.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Community Economics",
    question: `A damaged bridge prevents farmers from reaching the market easily. Why can repairing it support the local economy?`,
    options: [
      "It can improve the movement of people and goods between producers and markets.",
      "It can automatically increase the price farmers receive for every crop sold.",
      "It can reduce production costs even when transport time and vehicle expenses do not change.",
      "It can guarantee that every farmer will sell all produce taken to market.",
    ],
    correctAnswer: 0,
    explanation: `Transport infrastructure can lower barriers to moving goods and reaching customers.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Household Planning",
    question: `A household's electricity bill rises sharply. What is the BEST first budgeting response?`,
    options: [
      "Review electricity use and other expenses, then identify realistic ways to reduce costs.",
      "Reduce every spending category by the same amount without checking which expenses are essential.",
      "Use savings to pay the higher bill each month without investigating why electricity use increased.",
      "Borrow enough to cover several future bills before comparing usage or reviewing the household budget.",
    ],
    correctAnswer: 0,
    explanation: `Reviewing actual spending and usage helps the household understand the problem and make informed adjustments.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "cause & effect, significance, comparing eras, cultural analysis, historical thinking" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial relationships, environmental cause & effect, land use decisions" },
  { type: "civics" as const,    label: "Civics & Government",         note: "applying civic knowledge, evaluating rights vs duties, government function, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic reasoning, decision-making, community development, trade-offs" },
]

export default function G5SsMod5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMod5Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMod5Questions)
      : prepareSocialStudiesPreview(g5SsMod5Questions, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 5",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Moderate 5</CardTitle>
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
              <p className="text-slate-600">Social Studies Moderate 5</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Moderate 5</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
