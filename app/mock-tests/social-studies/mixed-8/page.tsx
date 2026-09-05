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

const g5SsMix8Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Historical Sources",
    "question": "Which source is a primary source for studying Jamaica's Independence celebrations in August 1962?",
    "options": [
      "A school textbook chapter written in 2025 about Caribbean independence",
      "A newspaper photograph taken during the 1962 celebrations",
      "A recent website summarising several books about Independence",
      "A documentary produced decades later using narrated reconstructions"
    ],
    "correctAnswer": 1,
    "explanation": "A photograph taken during the 1962 celebrations was created at the time being studied, making it a primary historical source."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Taíno Adaptation",
    "question": "Taíno settlements were often located near fertile land and water. Which explanation best connects those locations to daily life?",
    "options": [
      "They supported farming, fishing, drinking-water access and canoe travel.",
      "They prevented communities from growing cassava or travelling by canoe.",
      "They allowed settlements to avoid using nearby natural resources.",
      "They show that farming and fishing began only after European arrival."
    ],
    "correctAnswer": 0,
    "explanation": "Fertile land supported cultivation, while nearby water provided food, drinking water and routes for canoe travel."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Colonial Chronology",
    "question": "A building contains Spanish foundations beneath later English walls. Which historical explanation best fits this evidence?",
    "options": [
      "English settlement ended before Spain first reached Jamaica.",
      "The structure proves that Spanish and English rule began in the same year.",
      "The site was used during Spanish rule and altered after English control began.",
      "The foundations were built after Jamaica gained Independence in 1962."
    ],
    "correctAnswer": 2,
    "explanation": "Spanish foundations beneath later English construction suggest that the site existed during Spanish rule and was changed after England captured Jamaica."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Cause and Consequence",
    "question": "Why did news of the Baptist War matter to people debating slavery in Britain?",
    "options": [
      "It showed large-scale resistance to slavery and increased pressure for change.",
      "It showed that enslaved people wished to extend Apprenticeship indefinitely.",
      "It proved that colonial slavery had already ended peacefully before the uprising.",
      "It persuaded Britain to return Jamaica immediately to Spanish government."
    ],
    "correctAnswer": 0,
    "explanation": "The uprising demonstrated the strength of resistance to slavery and added urgency to the British debate about abolition."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Emancipation Timeline",
    "question": "A record states that a formerly enslaved worker entered Apprenticeship in 1834 and became fully free four years later. Which year completed this change?",
    "options": [
      "1831",
      "1834",
      "1838",
      "1865"
    ],
    "correctAnswer": 2,
    "explanation": "Apprenticeship began after abolition in 1834 and ended in 1838, when full freedom came to the formerly enslaved population."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Historical Perspective",
    "question": "One 1865 report calls the Morant Bay protesters dangerous, while residents' petitions describe poverty and injustice. What does the contrast reveal?",
    "options": [
      "The reports must concern different islands because their descriptions differ.",
      "People's positions and experiences can shape how they describe the same conflict.",
      "Residents' petitions cannot be evidence because they express grievances.",
      "Official reports are automatically complete because officials produced them."
    ],
    "correctAnswer": 1,
    "explanation": "Officials and protesting residents experienced the conflict differently, so their positions could influence what each account emphasized."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "1938 Labour Unrest",
    "question": "Records from 1938 show strikes, wage complaints and demands for improved working conditions. Which interpretation is best supported?",
    "options": [
      "Workers were organizing around economic and social grievances.",
      "Workers were campaigning to restore Spanish colonial rule.",
      "Workers opposed the creation of organizations representing labour.",
      "Workers believed that wages and conditions required no change."
    ],
    "correctAnswer": 0,
    "explanation": "Strikes and complaints about wages and working conditions support the conclusion that workers organized around economic and social grievances."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Democratic Development",
    "question": "Before 1944, property and income rules limited many adults' voting rights. Which result followed Universal Adult Suffrage?",
    "options": [
      "Voting became restricted to people who owned the largest properties.",
      "Parish officials received the power to choose all national representatives.",
      "National elections ended because a wider electorate was difficult to organize.",
      "Adult participation expanded because the former property and income barriers were removed."
    ],
    "correctAnswer": 3,
    "explanation": "Universal Adult Suffrage removed former property and income restrictions and greatly widened adult participation in elections."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Independence Evidence",
    "question": "A 1962 government document begins referring to Jamaica as an independent state responsible for its own affairs. What change does the document record?",
    "options": [
      "The transfer from Spanish rule to English rule",
      "The end of Apprenticeship after abolition",
      "The achievement of national Independence",
      "The introduction of Universal Adult Suffrage"
    ],
    "correctAnswer": 2,
    "explanation": "In 1962 Jamaica became an independent nation with responsibility for governing its own national affairs."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Heritage Decisions",
    "question": "A historic market building is damaged but can be repaired. Which plan best balances heritage preservation and present community use?",
    "options": [
      "Document important features, repair the structure safely and adapt it for continued community use.",
      "Remove all original features before specialists can record or assess them.",
      "Leave the unsafe damage untouched because preservation prevents repairs.",
      "Rebuild it as an unrelated structure without recording its history."
    ],
    "correctAnswer": 0,
    "explanation": "Careful documentation and safe repair can preserve significant features while allowing the historic building to remain useful."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Grid References",
    "question": "A map grid labels columns A–D and rows 1–4. A fire station is in column C, row 2. Which grid reference identifies it?",
    "options": [
      "A3",
      "B2",
      "C2",
      "C4"
    ],
    "correctAnswer": 2,
    "explanation": "Grid references combine the column letter and row number, so column C and row 2 give C2."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Elevation and Relief",
    "question": "A road map shows Route P climbing from 100 metres to 700 metres, while Route Q stays between 100 and 200 metres. Which route crosses steeper or higher land?",
    "options": [
      "Route P, because its elevation increases much more",
      "Route Q, because a smaller elevation range always means higher land",
      "Both routes, because every mapped road has the same elevation",
      "Neither route, because elevation cannot describe land height"
    ],
    "correctAnswer": 0,
    "explanation": "Route P rises by about 600 metres, while Route Q changes far less, so Route P crosses higher and likely steeper land."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Data",
    "question": "A station records 60 mm of rain on Monday, 25 mm on Tuesday and 15 mm on Wednesday. What percentage of the three-day total fell on Monday?",
    "options": [
      "25%",
      "40%",
      "60%",
      "75%"
    ],
    "correctAnswer": 2,
    "explanation": "The three-day total is 100 mm. Monday's 60 mm is therefore 60% of the total."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Hurricane Risk",
    "question": "Community X is coastal with strong shelters but high storm-surge exposure. Community Y is inland with weaker roofs and landslide-prone slopes. What is the best planning conclusion?",
    "options": [
      "Prioritize Community X's surge plan and postpone action on Community Y's weak roofs and slopes.",
      "Prioritize Community Y's roofs and slopes and assume Community X's shelters remove surge exposure.",
      "Give both communities one general supply plan without addressing their different local hazards.",
      "Each community needs a plan matched to its particular exposure and building weaknesses."
    ],
    "correctAnswer": 3,
    "explanation": "Risk depends on several local factors. Community X must address storm surge, while Community Y must address weak roofs and landslide exposure."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Mangrove Evidence",
    "question": "Students want to test whether a mangrove restoration project is helping a shoreline. Which evidence should they compare over time?",
    "options": [
      "Shoreline erosion, mangrove growth and the presence of young fish",
      "Mangrove height during one visit without a baseline or shoreline measurements",
      "Fish counts from one day without recording habitat or comparing later observations",
      "Residents' opinions about the project without physical shoreline or habitat evidence"
    ],
    "correctAnswer": 0,
    "explanation": "Changes in erosion, mangrove growth and nursery habitat directly indicate whether restoration is improving shoreline protection and coastal ecology."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Watershed Decisions",
    "question": "A town plans a car park near a stream in its watershed. Which design would best reduce polluted runoff entering the water?",
    "options": [
      "Slope the entire paved surface directly toward the stream.",
      "Remove streamside plants so runoff reaches the water faster.",
      "Use drainage controls and vegetated areas that slow and filter runoff.",
      "Store waste beside storm drains for collection after heavy rain."
    ],
    "correctAnswer": 2,
    "explanation": "Drainage controls and vegetation can slow runoff, trap some pollutants and reduce the amount flowing directly into the stream."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Settlement Access",
    "question": "A new health centre must serve three villages. Which location would generally provide the best access?",
    "options": [
      "A central site connected to all three villages by reliable roads",
      "A site beside one village that requires long unreliable journeys from the other two",
      "A central riverbank site whose access road regularly closes during floods",
      "A low-cost hillside site that needs a steep new road before patients can reach it"
    ],
    "correctAnswer": 0,
    "explanation": "A central location with reliable road links reduces travel barriers and makes the health centre more accessible to residents of all three villages."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Land-Use Evidence",
    "question": "A proposal would place houses on former farmland. Which information is most useful before deciding whether the change is suitable?",
    "options": [
      "Approve the change from housing demand alone without examining safety, services or food production",
      "Soil and flood conditions, food-production value, service access and housing need",
      "Reject the change from the word farmland alone without measuring its present agricultural value",
      "Choose from land price alone without checking flood conditions, services or community needs"
    ],
    "correctAnswer": 1,
    "explanation": "A sound land-use decision compares physical safety, the land's agricultural value, access to services and the need for housing."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Weather and Climate",
    "question": "Which observation describes weather rather than climate?",
    "options": [
      "A district usually has a dry season during part of the year.",
      "Mountain areas generally receive more rainfall than nearby lowlands.",
      "Average temperatures were calculated from thirty years of records.",
      "Heavy rain and strong winds occurred in the district this afternoon."
    ],
    "correctAnswer": 3,
    "explanation": "Weather describes short-term atmospheric conditions, such as the rain and wind experienced during one afternoon."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Hazard Data",
    "question": "Flood records show that Road A closed in four of the last five major storms, while Road B closed once. What is the strongest conclusion for emergency planning?",
    "options": [
      "Road A has shown a higher closure risk and needs an alternative-route plan.",
      "Road B can never close during a future storm because it closed only once.",
      "Both roads will close in every storm because each has closed before.",
      "Past closure records have no value when planners compare route reliability."
    ],
    "correctAnswer": 0,
    "explanation": "Road A's repeated closures indicate a higher observed risk, so planners should prepare a reliable alternative while continuing to monitor conditions."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Representation",
    "question": "Residents send their Member of Parliament evidence that a proposed national policy would affect local farmers. What representative function are the residents asking the MP to perform?",
    "options": [
      "Raise constituents' evidence and concerns during national decision-making",
      "Decide court cases involving every farmer in the constituency",
      "Directly manage all local markets without any municipal involvement",
      "Replace the voters' views with instructions from a private company"
    ],
    "correctAnswer": 0,
    "explanation": "Members of Parliament represent constituents and can bring their evidence and concerns into national debate and decision-making."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "House and Senate",
    "question": "Which statement correctly distinguishes Jamaica's House of Representatives from its Senate?",
    "options": [
      "House members are elected, while Senators are formally appointed under constitutional arrangements.",
      "Senators are elected by parish councils, while House members inherit their seats.",
      "House members decide court verdicts, while Senators command the police.",
      "Senators manage local drains, while House members issue building permits."
    ],
    "correctAnswer": 0,
    "explanation": "Members of the House of Representatives are elected. Senators are formally appointed by the Governor-General on constitutionally specified advice."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Municipal Services",
    "question": "A Municipal Corporation publishes a schedule for clearing local drains. How can residents most usefully support accountability?",
    "options": [
      "Compare the published schedule with completed work and report documented gaps.",
      "Assume every drain was cleared without observing or recording the work.",
      "Change the schedule privately and present it as the official public record.",
      "Ask Parliament to decide the daily route of each drain-cleaning crew."
    ],
    "correctAnswer": 0,
    "explanation": "Comparing promised work with documented results gives residents relevant evidence for asking the local authority to account for performance."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "Why does the Governor-General normally act within constitutional rules and established advice rather than setting personal government policy?",
    "options": [
      "The office performs defined formal duties within Jamaica's parliamentary democracy.",
      "The office is a political party that campaigns for a majority in the House.",
      "The office is a local authority responsible for parish roads and markets.",
      "The office is a court that determines guilt in criminal trials."
    ],
    "correctAnswer": 0,
    "explanation": "The Governor-General carries out constitutionally defined formal functions within Jamaica's system of elected parliamentary government."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Evidence and Justice",
    "question": "A widely shared rumour accuses someone of an offence, but verified evidence points elsewhere. What should a court rely on?",
    "options": [
      "The number of times the rumour was repeated online",
      "The popularity of the person who first shared the accusation",
      "Relevant law and reliable evidence tested through the legal process",
      "The preferred result of whichever group gathers outside the court"
    ],
    "correctAnswer": 2,
    "explanation": "Courts should determine cases through applicable law and reliable evidence, not popularity or repetition of an unverified claim."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Rights and Public Safety",
    "question": "A peaceful march is planned, but its route would block the only entrance to a hospital. Which response best balances rights and safety?",
    "options": [
      "Ban all peaceful marches because public expression and safety cannot coexist.",
      "Allow the route unchanged because emergency access should not affect planning.",
      "Work with organizers on a route that protects expression and keeps hospital access open.",
      "Close the hospital during the march so the original route needs no adjustment."
    ],
    "correctAnswer": 2,
    "explanation": "Changing the route can preserve peaceful expression while protecting essential emergency access to the hospital."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Lawful Advocacy",
    "question": "A youth group wants safer pedestrian crossings. Which plan is most likely to influence officials lawfully and effectively?",
    "options": [
      "Collect traffic observations, propose locations and present the evidence through public channels.",
      "Damage road signs so officials are forced to replace the entire road system.",
      "Publish invented crash figures because accurate evidence may take time to collect.",
      "Prevent emergency vehicles from using the road until a crossing is promised."
    ],
    "correctAnswer": 0,
    "explanation": "Accurate observations and a practical proposal give officials useful evidence while allowing the youth group to participate lawfully."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Procurement Accountability",
    "question": "A public body receives three bids to repair a community building. Which practice best supports a fair, accountable choice?",
    "options": [
      "Choose a bidder secretly because a senior official knows the owner.",
      "Use stated criteria, record the comparison and disclose the authorized decision.",
      "Select the highest price without checking quality, safety or experience.",
      "Destroy the unsuccessful bids so the decision cannot be reviewed."
    ],
    "correctAnswer": 1,
    "explanation": "Using stated criteria and keeping a reviewable record supports fairness, transparency and accountability in the use of public funds."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "CARICOM and CSME",
    "question": "Which statement describes CARICOM cooperation without overstating what membership guarantees?",
    "options": [
      "Member states cooperate in areas such as trade and services under agreed regional arrangements.",
      "Every CARICOM citizen may enter any occupation anywhere without meeting applicable requirements.",
      "CARICOM automatically replaces each member state's national laws and institutions.",
      "Membership requires each state to use identical taxes, wages and public budgets."
    ],
    "correctAnswer": 0,
    "explanation": "CARICOM supports cooperation and regional arrangements, but movement and economic participation remain subject to agreed categories, procedures and applicable requirements."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Public Decision Evidence",
    "question": "A council receives competing claims about whether a new bus stop is accessible to elderly passengers and persons with disabilities. What should it do first?",
    "options": [
      "Inspect the site with affected users and compare measurements, safety and travel evidence.",
      "Inspect the site without affected users and consider only the appearance of the shelter.",
      "Survey frequent adult passengers but exclude people who report mobility or access barriers.",
      "Compare construction prices without examining pathways, crossings, safety or travel needs."
    ],
    "correctAnswer": 0,
    "explanation": "A site inspection with affected users and relevant measurements gives the council direct evidence about accessibility and safety."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Needs, Wants and Choices",
    "question": "A household's water bill is due, a broken pipe is wasting water, and a family member wants new headphones. Which choice should receive priority?",
    "options": [
      "Buy the headphones before paying for water or stopping the leak.",
      "Pay the water bill and repair the leak before purchasing the headphones.",
      "Ignore the bill because household services do not affect family needs.",
      "Leave the pipe broken so the family can compare another month's bill."
    ],
    "correctAnswer": 1,
    "explanation": "Reliable water service and repairing a costly leak address urgent household needs before spending on new headphones."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budget Interpretation",
    "question": "A family budgets $12,000 for food, $5,000 for transport and $3,000 for savings from income of $22,000. How much remains for other expenses?",
    "options": [
      "$2,000, because the three planned amounts total $20,000",
      "$3,000, because the savings amount is always the balance",
      "$5,000, because transport should be counted twice",
      "$20,000, because planned spending is the same as money remaining"
    ],
    "correctAnswer": 0,
    "explanation": "Food, transport and savings total $20,000. Subtracting this from $22,000 leaves $2,000 for other expenses."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Scarcity and Choice",
    "question": "A community has one vacant building and must choose between a homework centre and a small health clinic. Which economic problem does this decision illustrate?",
    "options": [
      "Unlimited resources, because one building can meet every use at the same time",
      "Inflation, because choosing a service automatically raises all community prices",
      "Scarcity, because a limited resource cannot satisfy both proposed uses fully",
      "Exporting, because community buildings are goods sold to other countries"
    ],
    "correctAnswer": 2,
    "explanation": "The community has a limited resource—the single building—and competing uses, so it must make a choice under scarcity."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Imports, Exports and Production",
    "question": "A Jamaican juice producer imports bottles, buys local fruit and exports finished juice. Which change would most directly reduce spending on imported inputs?",
    "options": [
      "Find a reliable Jamaican supplier able to produce suitable bottles competitively.",
      "Stop buying local fruit and import all ingredients as well as bottles.",
      "Sell less finished juice abroad while importing the same number of bottles.",
      "Rename the imported bottles without changing where they are produced."
    ],
    "correctAnswer": 0,
    "explanation": "Sourcing suitable bottles competitively from a Jamaican producer would replace an imported input with local production."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Supply Data",
    "question": "At the same price, a market received 500 eggs last week and 350 eggs this week after farms lost hens. Demand stayed similar. Which change is most likely?",
    "options": [
      "Unsold eggs increase because the supply rose by 150.",
      "Eggs become easier to obtain because farms produced more.",
      "Prices face downward pressure because buyers have more eggs to choose from.",
      "Shortages or upward price pressure may occur because supply fell by 150."
    ],
    "correctAnswer": 3,
    "explanation": "Supply fell from 500 to 350 eggs while demand remained similar, so shortages or upward pressure on prices may result."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Taxes and Trade-offs",
    "question": "Tax revenue can repair either four small roads or one severely damaged bridge this month. What information is most useful before choosing?",
    "options": [
      "Repair the four roads because the larger project count is enough evidence by itself",
      "Safety risks, number of users, urgency, costs and available alternatives",
      "Repair the bridge because severe damage matters without comparing users, cost or alternatives",
      "Divide funds evenly even if neither the roads nor bridge can then be made safe"
    ],
    "correctAnswer": 1,
    "explanation": "A responsible public-spending choice compares safety, urgency, users, cost and alternatives rather than irrelevant preferences."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism Income",
    "question": "Visitors spend $500,000 at a community event, but many supplies are imported and several businesses are owned elsewhere. What should be investigated to estimate local benefit?",
    "options": [
      "Only the total visitor spending, because all of it necessarily remains locally",
      "The amount paid to local workers and suppliers and the amount leaving the community",
      "Only the number of visitors, without examining where their spending goes",
      "The weather after the event, without reviewing any financial records"
    ],
    "correctAnswer": 1,
    "explanation": "Local benefit depends on how much spending reaches local workers and suppliers compared with how much leaves through outside ownership and imported inputs."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Cooperative Decisions",
    "question": "Fishers form a cooperative to buy an ice machine. Which rule would best protect members and the shared equipment?",
    "options": [
      "Allow one member to control the machine without records or agreed access.",
      "Charge members different unexplained fees each time they use it.",
      "Agree on contributions, maintenance, access and transparent financial records.",
      "Use all maintenance money for unrelated purchases before repairs are needed."
    ],
    "correctAnswer": 2,
    "explanation": "Clear rules for contributions, maintenance, access and records help members manage shared cooperative property fairly and sustainably."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Saving and Interest",
    "question": "A savings account contains $20,000 and earns 5% simple interest for one year. How much interest is earned?",
    "options": [
      "$100",
      "$500",
      "$1,000",
      "$5,000"
    ],
    "correctAnswer": 2,
    "explanation": "Five percent of $20,000 is 0.05 × $20,000, which equals $1,000 in interest for the year."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Small-Business Evidence",
    "question": "A bakery's sales increased after it extended opening hours and began advertising. What is the most careful conclusion?",
    "options": [
      "Advertising alone caused the increase because opening hours cannot affect sales.",
      "Longer hours alone caused the increase because advertisements never influence buyers.",
      "The increase proves that every future change will raise sales by the same amount.",
      "Both changes may have contributed, so separate evidence is needed to estimate each effect."
    ],
    "correctAnswer": 3,
    "explanation": "Because opening hours and advertising changed together, either or both may have affected sales; more evidence is needed to separate their effects."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix8Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix8Questions)
      : prepareSocialStudiesPreview(g5SsMix8Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 8",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 8</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 8</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 8</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
