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

const g5SsDiff3Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Interpreting Settlement Data",
    "question": "A table lists artefacts from Site A: cassava griddles, shell tools and canoe fragments. Site B has iron shackles, sugar equipment and European coins. Which decision about museum labels best fits the data?",
    "options": [
      "Label both sites as twentieth-century factories.",
      "Label Site A as an Independence celebration and Site B as a Maroon treaty site.",
      "Label both sites as evidence of Universal Adult Suffrage.",
      "Label Site A as Taíno life and Site B as plantation-era colonial life."
    ],
    "correctAnswer": 3,
    "explanation": "The artefact groups point to Taíno food and marine activity at Site A and slavery-era plantation production and colonial trade at Site B."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Timeline Interpretation",
    "question": "A timeline has blank X between 1834 Emancipation and 1865 Morant Bay. Which entry belongs at X and helps explain why 1834 did not mean immediate full freedom?",
    "options": [
      "1655 — England captured Jamaica",
      "1838 — Apprenticeship ended",
      "1944 — Universal Adult Suffrage began",
      "1962 — Jamaica became independent"
    ],
    "correctAnswer": 1,
    "explanation": "The missing date is 1838, when Apprenticeship ended; the other dates fall outside the interval."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Reading Population Records",
    "question": "A plantation record shows 300 enslaved workers in 1830, 300 apprentices in 1835 and 300 free workers in 1839. Which interpretation uses status and chronology correctly?",
    "options": [
      "Legal status changed across abolition, Apprenticeship and full freedom.",
      "The unchanged number proves slavery continued legally after 1838.",
      "The record shows all workers became independent voters in 1835.",
      "The figures prove no social change occurred."
    ],
    "correctAnswer": 0,
    "explanation": "Equal totals do not mean equal legal status; the categories follow the transition from slavery to Apprenticeship and then freedom."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Using Cause-and-Effect Charts",
    "question": "A chart links poor wages and unemployment to protests in 1938, then links the protests to unions and political organisation. Which arrow should be added last?",
    "options": [
      "Return to Spanish colonial rule",
      "Beginning of the Baptist War",
      "Pressure for self-government",
      "End of Taíno settlement"
    ],
    "correctAnswer": 2,
    "explanation": "The 1938 unrest strengthened labour and political organisation, contributing to wider participation and self-government."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Map and Resistance",
    "question": "A map marks Maroon communities in mountainous interiors and plantations on lower land. Which decision about a heritage trail best uses the map and history?",
    "options": [
      "Place most Maroon sites on coastal plantation routes.",
      "Explain that mountains made resistance impossible.",
      "Use modern parish capitals because present roads are easier to follow.",
      "Include mountain routes and explain their defensive value."
    ],
    "correctAnswer": 3,
    "explanation": "Mountain terrain aided Maroon movement and defence, so the trail should connect geography with historical resistance."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Evaluating Survey Data",
    "question": "Students survey 100 people: 70 recognise Marcus Garvey, 45 recognise Nanny and 20 recognise George William Gordon. What can they responsibly decide?",
    "options": [
      "Rank historical importance exactly by the survey percentages.",
      "Teach more about less-recognised heroes, noting the survey's limit.",
      "Remove Marcus Garvey from lessons because he is already known.",
      "Conclude that the 20 respondents are historically incorrect."
    ],
    "correctAnswer": 1,
    "explanation": "Recognition data can guide education, but popularity in one survey is not a measure of a hero's contribution."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Chronology Decision",
    "question": "A class exhibition has panels dated 1865, 1944, 1938 and 1962. Which order best helps visitors follow political development?",
    "options": [
      "1865 → 1938 → 1944 → 1962",
      "1938 → 1865 → 1962 → 1944",
      "1944 → 1938 → 1865 → 1962",
      "1962 → 1944 → 1938 → 1865"
    ],
    "correctAnswer": 0,
    "explanation": "Chronological presentation places Morant Bay first, followed by labour unrest, adult suffrage and Independence."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Interpreting Election Data",
    "question": "A graph shows a sharp increase in eligible voters in 1944 but no change in Jamaica's colonial status until 1962. Which caption is accurate?",
    "options": [
      "Independence occurred eighteen years before voting widened.",
      "The graph proves elections ended in 1944.",
      "Voting participation widened before national Independence was achieved.",
      "Adult suffrage and Independence were the same event."
    ],
    "correctAnswer": 2,
    "explanation": "The data separate two developments: a wider electorate in 1944 and Independence in 1962."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Source-Set Decision",
    "question": "A student has a diary written during 1865, a textbook published later and an undated online comment. Which plan best supports a Morant Bay investigation?",
    "options": [
      "Use the online comment first because it gives the clearest summary.",
      "Treat the diary as fully neutral because it is old.",
      "Exclude the textbook because it was not written during 1865.",
      "Use the diary and textbook, assess the undated online comment cautiously, and verify useful claims against further evidence."
    ],
    "correctAnswer": 3,
    "explanation": "The diary and textbook have different strengths and limitations, while an undated online comment has weak source information. A careful investigation evaluates each source and checks important claims against further evidence."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Evidence Classification",
    "question": "Four cards read: “Independence Day was 6 August 1962”; “Independence was Jamaica's greatest achievement”; a 1962 photograph; and a modern poem. Which card is clearly an opinion?",
    "options": [
      "“Independence Day was 6 August 1962.”",
      "“Independence was Jamaica's greatest achievement.”",
      "The dated 1962 photograph",
      "The modern poem as an artefact created after Independence"
    ],
    "correctAnswer": 1,
    "explanation": "Calling something the greatest is a judgement; the date and existence of the sources can be verified."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Grid References",
    "question": "On a grid map, the clinic is at B2, the shelter at E2 and a flooded river blocks columns C–D along row 2. Which route decision is safest?",
    "options": [
      "Choose a detour shown on higher ground instead of travelling directly along row 2.",
      "Travel straight through C2 because it is the shortest line.",
      "Treat the grid letters as more reliable than the flood symbol.",
      "Move south without checking any road or relief information."
    ],
    "correctAnswer": 0,
    "explanation": "A grid gives location, but a safe decision must also use the flood and relief symbols."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Rainfall Table",
    "question": "Parish Area A records 280, 310 and 295 mm in three months; Area B records 90, 85 and 100 mm. Which farming decision is best supported?",
    "options": [
      "Build flood barriers in Area B solely because it is drier.",
      "Assume Area A's high totals make dry-month planning unnecessary.",
      "Plan for greater water storage or drought-tolerant crops in Area B.",
      "Use identical water plans because both areas are in Jamaica."
    ],
    "correctAnswer": 2,
    "explanation": "Area B is consistently much drier in the table, supporting water-conservation planning."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Contour Interpretation",
    "question": "Contour lines are very close beside Road X and widely spaced beside Road Y. Both lead to the same community. Which route is generally easier for heavy vehicles?",
    "options": [
      "Road X, because close contours show flat land.",
      "Both, because contour spacing gives population rather than relief.",
      "Road X, because a steeper route shortens travel time.",
      "Road Y, because widely spaced contours indicate a gentler slope."
    ],
    "correctAnswer": 3,
    "explanation": "Close contours indicate steep relief; wider spacing indicates a gentler gradient."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Watershed Data",
    "question": "After hillside clearing, runoff time falls from 40 minutes to 18 minutes and river sediment doubles. Which action best responds to both changes?",
    "options": [
      "Deepen the river without addressing hillside erosion.",
      "Restore vegetation and add runoff controls on the cleared slope.",
      "Remove remaining vegetation to make runoff even faster.",
      "Measure air temperature before linking runoff to sediment."
    ],
    "correctAnswer": 1,
    "explanation": "Vegetation and runoff controls can slow water movement and reduce soil entering the river."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Storm-Surge Map",
    "question": "Three proposed shelters are shown: A is 2 m above sea level near the shore, B is 8 m high beside a river, and C is 30 m high with two access roads. Which is the strongest initial choice for coastal evacuation?",
    "options": [
      "Shelter A because it is closest to the sea.",
      "Shelter B because its higher elevation offsets the river risk.",
      "Any site, because elevation does not affect storm-surge exposure.",
      "Shelter C, after confirming its buildings and access roads are safe."
    ],
    "correctAnswer": 3,
    "explanation": "C has the greatest elevation and alternative access, though structural and route safety still need confirmation."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Coastal Change Graph",
    "question": "A graph shows shoreline retreat slowing after mangrove restoration, while a nearby cleared shore retreats faster. What decision is best supported?",
    "options": [
      "Continue restoration and monitoring while controlling activities that damage mangroves.",
      "Clear the restored mangroves because slower retreat shows the project has completed its purpose.",
      "Conclude that mangrove restoration controls the main causes of coastal change.",
      "Stop collecting data because the trend is already clear."
    ],
    "correctAnswer": 0,
    "explanation": "The comparison supports restoration as one protective measure, while monitoring and damage prevention remain necessary."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Settlement-Service Data",
    "question": "A town's population rises 30%, waste collection rises 5% and illegal dumping complaints rise 40%. Which plan addresses the clearest mismatch?",
    "options": [
      "Reduce collection because complaints increased.",
      "Build housing without reviewing any service demand.",
      "Increase waste capacity and prevention as population grows.",
      "Treat dumping complaints as proof that population fell."
    ],
    "correctAnswer": 2,
    "explanation": "Waste service capacity grew far more slowly than population and complaints, indicating a need for service and prevention improvements."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Pollution Sampling",
    "question": "Upstream water samples contain little plastic; samples below a busy market contain much more. What should investigators do before blaming the market?",
    "options": [
      "Declare the market guilty from one sample.",
      "Repeat comparable sampling and inspect other sources.",
      "Sample upstream again because it provides the cleaner comparison point.",
      "Ignore location and test water colour once."
    ],
    "correctAnswer": 1,
    "explanation": "The pattern suggests a possible source, but repeated controlled sampling and checking alternatives strengthen the conclusion."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Land-Use Decision Matrix",
    "question": "A site scores: jobs access 9/10, flood safety 2/10, drainage 3/10 and transport 8/10. What is the best decision?",
    "options": [
      "Approve immediately because the average score is above five.",
      "Reject all future development anywhere in the parish.",
      "Ignore safety scores because access scores are higher.",
      "Investigate whether flood and drainage risks can be corrected."
    ],
    "correctAnswer": 3,
    "explanation": "Strong access does not cancel serious hazard weaknesses; approval requires evidence that risks can be acceptably managed."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Weather Data",
    "question": "Wind speeds rise, pressure falls and official hurricane warnings strengthen. Which household decision best uses the combined trend?",
    "options": [
      "Prepare promptly and follow official evacuation instructions.",
      "Wait for visible roof damage before preparing.",
      "Use falling pressure as evidence that the storm vanished.",
      "Travel to the coast to compare wave heights personally."
    ],
    "correctAnswer": 0,
    "explanation": "The combined indicators and official warnings show increasing risk, so timely preparation is appropriate."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Reading Parliamentary Records",
    "question": "A record shows a bill approved by the House, amended by the Senate and returned for further consideration. What should a civics student conclude?",
    "options": [
      "The Senate has acted as a criminal court.",
      "The bill became law once the Senate proposed an amendment.",
      "The proposal is still moving through the legislative process.",
      "The Municipal Corporation must decide the national bill."
    ],
    "correctAnswer": 2,
    "explanation": "Amendment and return show continuing parliamentary consideration rather than a completed law."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Institutional Decision Chart",
    "question": "A chart lists: national law, parish market, court appeal and monetary policy. Which body should be matched to parish market management?",
    "options": [
      "The Court of Appeal",
      "The Bank of Jamaica",
      "The Senate acting alone",
      "The local authority"
    ],
    "correctAnswer": 3,
    "explanation": "Municipal Corporations are local authorities responsible for many local facilities, including markets."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Court Data",
    "question": "A table shows that a judge ruled for government in some cases and against it in others, each with written legal reasons. What principle does the pattern support?",
    "options": [
      "Courts should follow law and evidence, not government loyalty.",
      "Courts should rule against government when independence is questioned.",
      "Written reasons prove Parliament controlled each decision.",
      "Judges should decide by opinion polls."
    ],
    "correctAnswer": 0,
    "explanation": "Different outcomes with stated legal reasons are consistent with independent adjudication."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Rights Scenario Matrix",
    "question": "Four protest plans are rated for legality, safety, evidence and respect for others. Plan A scores high in legality, safety and respect but low in evidence. Plan B scores high in evidence and respect but low in safety. Plan C scores high in all four. Plan D scores high in safety and evidence but low in legality. Which plan best balances the full set of criteria?",
    "options": [
      "Plan A, because legality and safety matter more than evidence.",
      "Plan B, because strong evidence can compensate for poor safety.",
      "Plan C, because it satisfies all four criteria.",
      "Plan D, because strong evidence can compensate for low legality."
    ],
    "correctAnswer": 2,
    "explanation": "Plan C is the only plan that performs strongly on legality, safety, evidence and respect for others, so it best satisfies the complete set of responsible-participation criteria."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Public-Consultation Data",
    "question": "A consultation receives 500 responses, but 450 come from one neighbourhood while five others are barely represented. What should officials do?",
    "options": [
      "Count the 500 as perfectly representative without checking origin.",
      "Seek input from underrepresented areas before deciding.",
      "Discard responses from the large neighbourhood to equalise the totals.",
      "Ask officials to supply the missing community perspectives."
    ],
    "correctAnswer": 1,
    "explanation": "A large total can still be unrepresentative; broader participation improves the evidence base."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Budget Records",
    "question": "A project budget lists J$8 million approved, J$10 million spent and no explanation for the difference. Which information should be requested first?",
    "options": [
      "A contractor's summary stating that the completed project appears successful",
      "The original approved budget without records showing what was actually spent",
      "A report describing the project's outputs and how many residents now use them",
      "Itemised records and authorised reasons for the J$2 million variance"
    ],
    "correctAnswer": 3,
    "explanation": "Accountability requires evidence explaining the difference between authorised and actual expenditure."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Service-Complaint Data",
    "question": "Drain complaints sent to the local authority remain unresolved, and residents have dates and photographs. What is the strongest next civic step?",
    "options": [
      "Submit the record formally and request a tracked response.",
      "Destroy the drain to attract attention.",
      "Send the complaint to an unrelated regional body.",
      "Publish workers' private information."
    ],
    "correctAnswer": 0,
    "explanation": "A documented, lawful escalation uses evidence and preserves accountability without harming people or property."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "CARICOM Data Interpretation",
    "question": "A chart lists movement of goods, services, capital, business establishment and eligible skilled nationals. Which heading best fits?",
    "options": [
      "Functions of a Jamaican parish court",
      "Services managed by one Municipal Corporation",
      "Core areas of the CARICOM Single Market and Economy",
      "Stages of a national hurricane warning"
    ],
    "correctAnswer": 2,
    "explanation": "These areas correspond to key CSME economic-integration arrangements."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Voting Data",
    "question": "Youth survey results show 80% want a park, but engineering data show the only proposed site is unsafe. What should decision-makers do?",
    "options": [
      "Build on the site because majority preference should outweigh technical advice.",
      "Seek a safe site or revised design.",
      "Set aside the survey without explaining the safety concern.",
      "Cancel the park proposal without searching for another site."
    ],
    "correctAnswer": 1,
    "explanation": "Public views matter, but lawful and safe decisions must combine preferences with technical evidence."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Evaluating Outcomes",
    "question": "A new market rule aimed to reduce waste. Waste falls 25%, vendor costs rise 3% and complaints fall. What is the best review decision?",
    "options": [
      "End evaluation because the waste reduction establishes success.",
      "Reverse the rule because any increase in vendor cost outweighs the waste reduction.",
      "Attribute the community's other changes to the market rule.",
      "Monitor whether environmental benefits justify manageable costs."
    ],
    "correctAnswer": 3,
    "explanation": "The data show benefits and costs; continued evidence is needed to judge effectiveness and fairness."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Opportunity-Cost Table",
    "question": "A youth club can fund one project: computer repair benefits 30 students; sports gear benefits 20; a trip benefits 10; decorations benefit 50 briefly. Which decision needs more than the highest number?",
    "options": [
      "Compare duration, urgency and value of benefits before choosing.",
      "Choose decorations because the largest number should decide.",
      "Choose the trip because travel offers the broadest educational value.",
      "Split the money equally even if no project can be completed."
    ],
    "correctAnswer": 0,
    "explanation": "Counts matter, but a sound choice also weighs need, lasting benefit and feasibility."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Demand Data",
    "question": "A shop's price stays fixed while weekly demand rises from 40 to 90 units and stock remains 50. What decision is most sensible?",
    "options": [
      "Reduce stock because demand increased.",
      "Assume demand will remain exactly 90 forever.",
      "Review supply capacity and costs before increasing stock.",
      "Stop recording sales because the trend is clear."
    ],
    "correctAnswer": 2,
    "explanation": "Demand now exceeds stock, but expansion should still consider costs and whether the trend continues."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Import-Cost Calculation",
    "question": "Imported packaging rises from J$20 to J$30 per bottle while every other cost stays J$70. What is the new total cost per bottle?",
    "options": [
      "J$80",
      "J$90",
      "J$120",
      "J$100"
    ],
    "correctAnswer": 3,
    "explanation": "The new total is J$30 packaging plus J$70 other costs, which equals J$100."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Export Decision Data",
    "question": "A producer can sell locally for J$500 with J$50 transport or export for J$650 with J$220 transport. Ignoring other differences, which gives the higher amount after transport?",
    "options": [
      "Export, because J$650 is larger before costs.",
      "Local sale: J$450 remains.",
      "Both leave J$600 after transport.",
      "Export, with J$870 remaining."
    ],
    "correctAnswer": 1,
    "explanation": "Subtracting transport gives J$450 locally and J$430 for export, so the lower headline price yields the higher remainder."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tax Allocation",
    "question": "A chart shows J$40 of every J$100 for education, J$25 for health, J$20 for roads and J$15 for safety. How much of J$1,000 follows the same share for health?",
    "options": [
      "J$250",
      "J$25",
      "J$400",
      "J$150"
    ],
    "correctAnswer": 0,
    "explanation": "Health receives 25%, and 25% of J$1,000 is J$250."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tourism Data",
    "question": "Visitor numbers rise 20%, but local craft sales fall 10%. What is the most useful next investigation?",
    "options": [
      "Assume higher visitor totals should raise craft sales at the same rate.",
      "Ban visitors until craft sales rise.",
      "Check visitor preferences and local sellers' access.",
      "Ignore sales because visitor totals are enough."
    ],
    "correctAnswer": 2,
    "explanation": "The opposite trends require evidence about spending patterns, access and product demand."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Cooperative Accounts",
    "question": "A cooperative collects J$120,000, spends J$75,000 on equipment and J$15,000 on maintenance. What balance should records show before other obligations?",
    "options": [
      "J$45,000",
      "J$60,000",
      "J$210,000",
      "J$30,000"
    ],
    "correctAnswer": 3,
    "explanation": "J$120,000 minus J$75,000 and J$15,000 leaves J$30,000."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Savings Graph",
    "question": "A student saves J$500, J$700, J$300 and J$900 over four months. What is the average monthly saving?",
    "options": [
      "J$500",
      "J$600",
      "J$700",
      "J$2,400"
    ],
    "correctAnswer": 1,
    "explanation": "Total saving is J$2,400; dividing by four months gives J$600."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Budget Variance",
    "question": "A family budgets J$12,000 for food but spends J$14,500. Which entry accurately records the variance?",
    "options": [
      "J$2,500 over budget",
      "J$2,500 under budget",
      "J$26,500 over budget",
      "No variance because food is essential"
    ],
    "correctAnswer": 0,
    "explanation": "Actual spending exceeded the plan by J$14,500 − J$12,000 = J$2,500."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Business Decision Matrix",
    "question": "Product A earns J$80 per unit with demand for 20; Product B earns J$50 with demand for 50. Capacity allows only one product. Which has higher possible total earnings?",
    "options": [
      "Product A, because J$80 is the higher unit amount.",
      "Both earn J$4,000.",
      "Product B: J$2,500 total.",
      "Product A, with J$100 total."
    ],
    "correctAnswer": 2,
    "explanation": "Multiplying unit earnings by likely sales gives J$1,600 for A and J$2,500 for B."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff3Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff3Questions)
      : prepareSocialStudiesPreview(g5SsDiff3Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 3",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 3</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 3</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 3</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
