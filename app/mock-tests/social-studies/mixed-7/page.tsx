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

const g5SsMix7Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Taíno Heritage",
    "question": "A museum display includes a cassava griddle, a model canoe and a drawing of a conuco. What do these objects together help visitors understand about Taíno life?",
    "options": [
      "They show how the Taíno prepared food, travelled and organized farming.",
      "They prove that the Taíno depended entirely on goods imported from Europe.",
      "They show that the Taíno used factories to produce metal farming machines.",
      "They prove that every Taíno community followed one occupation only."
    ],
    "correctAnswer": 0,
    "explanation": "Cassava griddles relate to food preparation, canoes to water travel and conucos to organized cultivation, so the display reveals several parts of Taíno life."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Colonial Change",
    "question": "After England captured Jamaica from Spain in 1655, which evidence would best show that colonial control had changed?",
    "options": [
      "Spanish officials continued governing the island under the same laws and institutions.",
      "English authorities established their own administration and expanded English settlement.",
      "Taíno communities regained full control of the island's colonial government.",
      "Jamaica immediately became independent and elected its own national government."
    ],
    "correctAnswer": 1,
    "explanation": "The establishment of English administration and settlement is direct evidence that political control passed from Spain to England after 1655."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Source Comparison",
    "question": "An 1835 official report praises Apprenticeship, but workers' complaints describe forced labour and punishment. Which conclusion is best supported?",
    "options": [
      "The official report must be rejected because government records contain no useful evidence.",
      "The complaints must describe every apprentice's experience in exactly the same way.",
      "The sources present different perspectives and should be checked with additional evidence.",
      "The disagreement proves that Apprenticeship had already ended before either source was written."
    ],
    "correctAnswer": 2,
    "explanation": "The sources reflect different positions and experiences. Comparing them with laws, court records and other accounts would support a more reliable conclusion."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Labour Movement",
    "question": "Why are Alexander Bustamante and Norman Manley both connected to changes that followed Jamaica's 1938 labour unrest?",
    "options": [
      "They commanded opposing European armies during the capture of Jamaica.",
      "They negotiated the end of Apprenticeship immediately after the Baptist War.",
      "They served together as leaders of the Morant Bay protest in 1865.",
      "They helped develop labour or political organizations during a period of growing demands for reform."
    ],
    "correctAnswer": 3,
    "explanation": "Bustamante and Manley became important leaders in the labour and political movements that developed as Jamaicans pressed for reform after the 1938 unrest."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Historical Evidence",
    "question": "A student claims that unfair access to justice contributed to the Morant Bay protest. Which evidence would most directly support the claim?",
    "options": [
      "Records showing that poor residents raised complaints about courts, land and unequal treatment",
      "Trade records listing the value of crops exported from Jamaica in the years around 1865",
      "Church records listing attendance without describing residents' treatment by courts or officials",
      "Military records describing troops sent after the protest without recording the earlier complaints"
    ],
    "correctAnswer": 0,
    "explanation": "Contemporary complaints about courts, land and unequal treatment directly support a claim that injustice helped cause the Morant Bay protest."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Universal Adult Suffrage",
    "question": "Which change occurred when Jamaica introduced Universal Adult Suffrage in 1944?",
    "options": [
      "Jamaica ended the Apprenticeship system and granted full freedom.",
      "A much wider adult population gained the right to vote in national elections.",
      "Jamaica ended all constitutional links with Britain and became independent.",
      "Municipal Corporations replaced Parliament as the national law-making body."
    ],
    "correctAnswer": 1,
    "explanation": "Universal Adult Suffrage greatly widened electoral participation by giving voting rights to Jamaica's adult population without the former property and income restrictions."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Chronology and Change",
    "question": "A historian studies 1838, 1944 and 1962. Which statement correctly connects the three milestones?",
    "options": [
      "They mark, in order, Independence, full freedom and expanded voting rights.",
      "They mark three stages of the same uprising led by one historical figure.",
      "They mark full freedom, expanded adult voting rights and national Independence.",
      "They mark the beginning, middle and end of the Apprenticeship system."
    ],
    "correctAnswer": 2,
    "explanation": "Full freedom came in 1838, Universal Adult Suffrage expanded voting rights in 1944, and Jamaica gained Independence in 1962."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Marcus Garvey",
    "question": "A newspaper from another country reports that people there joined an organization founded by Marcus Garvey. What does this evidence most strongly suggest?",
    "options": [
      "Garvey's work influenced people beyond Jamaica through an international movement.",
      "Garvey served as Governor-General in each country where the report appeared.",
      "Garvey's organization was limited to one Jamaican parish and had no overseas members.",
      "Garvey organized the Baptist War before international newspapers existed."
    ],
    "correctAnswer": 0,
    "explanation": "Evidence of overseas membership supports the conclusion that Garvey's movement reached and influenced people internationally."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Independence",
    "question": "Which responsibility became Jamaica's own as an independent nation in 1962?",
    "options": [
      "Managing Spain's remaining colonies in the Caribbean",
      "Returning national elections to control by plantation owners",
      "Ending the Atlantic slave trade for the first time",
      "Governing the country through its own national institutions"
    ],
    "correctAnswer": 3,
    "explanation": "Independence meant that Jamaica assumed responsibility for governing itself through its own national institutions."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Preserving Heritage",
    "question": "Elders remember different details about an old community celebration. What is the best way for students to create a reliable history of it?",
    "options": [
      "Choose the most entertaining memory and present it as the only possible account.",
      "Combine interviews with photographs, programmes and other records, noting where accounts differ.",
      "Ignore all oral accounts because spoken memories cannot contribute historical evidence.",
      "Rewrite each account so every elder appears to remember precisely the same details."
    ],
    "correctAnswer": 1,
    "explanation": "Comparing oral accounts with photographs and written records helps students confirm details while honestly recording differences in memory."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Scale",
    "question": "A map scale shows that 2 centimetres represent 10 kilometres. A road measures 7 centimetres on the map. What is its actual length?",
    "options": [
      "19 kilometres, because 7 and 2 should be added to 10",
      "28 kilometres, because the map distance should be multiplied by 4",
      "35 kilometres, because each centimetre represents 5 kilometres",
      "70 kilometres, because 7 should be multiplied directly by 10"
    ],
    "correctAnswer": 2,
    "explanation": "If 2 centimetres represent 10 kilometres, then 1 centimetre represents 5 kilometres. Therefore, 7 centimetres represent 35 kilometres."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Map Symbols",
    "question": "A map legend shows a blue line for a river and a broken black line for a footpath. What does the legend allow a reader to do?",
    "options": [
      "Identify which mapped features the different lines represent",
      "Calculate the population of every settlement without data",
      "Determine the age of each road from its colour alone",
      "Predict the next day's weather from the map title"
    ],
    "correctAnswer": 0,
    "explanation": "A map legend explains the meaning of symbols, colours and lines, allowing readers to identify mapped features."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Interpretation",
    "question": "District P received 120 mm of rain and District Q received 75 mm in the same month. What can be concluded from these figures alone?",
    "options": [
      "District P has a wetter climate in every month of the year.",
      "District Q cannot experience flooding because its total was lower.",
      "District P received 45 mm more rain than District Q that month.",
      "District Q received 45 percent less rain than District P."
    ],
    "correctAnswer": 2,
    "explanation": "The figures show only that District P received 45 mm more rainfall than District Q during that month; they do not establish year-round climate or flood risk."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Evacuation Planning",
    "question": "Two hurricane evacuation routes lead uphill. Route A is shorter but crosses a bridge that often floods. Route B is longer but remains open in heavy rain. Which plan is safest?",
    "options": [
      "Use Route A because distance is the only factor that affects evacuation safety.",
      "Use Route B when flooding threatens and communicate the safer route before the storm.",
      "Wait until the bridge floods before deciding whether residents should leave.",
      "Divide residents randomly between both routes without checking conditions."
    ],
    "correctAnswer": 1,
    "explanation": "A reliable route is more important than the shortest route during flooding. Residents should receive the safer plan before dangerous conditions arrive."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Watersheds",
    "question": "Trees are removed near the upper part of a watershed. Which downstream change is most likely after heavy rain?",
    "options": [
      "Less runoff reaches streams because bare soil stores all rainfall.",
      "River water becomes salty because trees create fresh water.",
      "All downstream flooding ends because slopes lose vegetation.",
      "More soil and faster runoff may enter streams and increase flood risk."
    ],
    "correctAnswer": 3,
    "explanation": "Tree roots and ground cover help hold soil and slow runoff. Removing them can increase erosion, stream sediment and downstream flood risk."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Direction",
    "question": "On a map with north at the top, a clinic symbol is below and to the left of a market symbol. Where is the clinic in relation to the market?",
    "options": [
      "South-west",
      "North-west",
      "South-east",
      "North-east"
    ],
    "correctAnswer": 0,
    "explanation": "On a north-up map, below means south and left means west, so the clinic is south-west of the market."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Land-Use Planning",
    "question": "A growing town needs homes and wants to protect a nearby river used for drinking water. Which zoning choice best addresses both needs?",
    "options": [
      "Build homes along the riverbank and remove vegetation to create more lots.",
      "Allow factories beside the river and place housing downstream from their waste outlets.",
      "Use suitable land for housing while maintaining a protected vegetated buffer beside the river.",
      "Ban housing throughout the town even on safe land with existing services."
    ],
    "correctAnswer": 2,
    "explanation": "Housing can be placed on suitable serviced land while a vegetated river buffer helps filter runoff and protect the community's water source."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Coastal Evidence",
    "question": "Reef damage, fewer fish and increased wave action are observed near a coast. Which investigation would best help planners understand the connection?",
    "options": [
      "Compare reef condition, fish habitats and wave measurements over time and at less-damaged sites.",
      "Measure waves at the damaged site on one calm day without examining reef or fish evidence.",
      "Compare fish numbers over time without recording reef condition or changes in wave action.",
      "Collect residents' observations without comparing them with physical measurements or other sites."
    ],
    "correctAnswer": 0,
    "explanation": "Comparing reef, habitat and wave evidence across time and locations can reveal whether reef damage is associated with ecological and coastal changes."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Transport and Location",
    "question": "A produce market is moved closer to farms and a major road. Which result is most likely for farmers selling fresh crops?",
    "options": [
      "Their crops will require longer journeys before reaching buyers.",
      "Their transport time and spoilage risk may decrease.",
      "Their farms will automatically receive more rainfall.",
      "Their produce will become imported goods at the market."
    ],
    "correctAnswer": 1,
    "explanation": "A market near farms and a major road can shorten travel, helping fresh crops reach buyers sooner and reducing spoilage risk."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Resource Conservation",
    "question": "A hotel wants to reduce pressure on the community's water supply during dry months. Which action would help most directly?",
    "options": [
      "Water lawns at midday so more water evaporates before reaching roots.",
      "Replace low-flow fixtures with taps that use more water per minute.",
      "Ignore leaking pipes until the rainy season returns.",
      "Repair leaks, install water-saving fixtures and collect rainwater where suitable."
    ],
    "correctAnswer": 3,
    "explanation": "Repairing leaks and using efficient fixtures reduces waste, while suitable rainwater collection can reduce demand on the community supply."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliamentary Structure",
    "question": "A news report says that a bill passed the House of Representatives and will next be considered by the Senate. What does this show about Jamaica's Parliament?",
    "options": [
      "Parliament has two chambers that both take part in considering legislation.",
      "The Senate is a court that retries cases decided by the House.",
      "The House manages parish drains before sending the work to the Senate.",
      "Parliament meets only when a bill has already become law."
    ],
    "correctAnswer": 0,
    "explanation": "Jamaica's Parliament includes the House of Representatives and the Senate, and both chambers participate in considering legislation."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "Students are allowed to express views about a school rule. Which action uses that right responsibly?",
    "options": [
      "Interrupt every class until the rule changes.",
      "Post an unverified accusation about a teacher.",
      "Present reasons respectfully and listen to other viewpoints.",
      "Prevent students with different opinions from speaking."
    ],
    "correctAnswer": 2,
    "explanation": "Responsible expression involves giving reasons respectfully, considering accurate information and allowing others to express their views."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Local Government",
    "question": "Residents want information about planned repairs to a local market operated by their municipality. Which action is most appropriate?",
    "options": [
      "Ask their Member of Parliament to arrange a national debate on each repair date.",
      "Contact the Municipal Corporation/local authority for the plan and relevant public information.",
      "Ask the Ministry of Education to treat the municipal market as a school facility.",
      "Ask the courts to issue the repair schedule before contacting the market's local authority."
    ],
    "correctAnswer": 1,
    "explanation": "The Municipal Corporation is the local authority responsible for many municipal facilities and is the appropriate body to contact about its market repair plans."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Making Laws",
    "question": "Why is public discussion of a proposed law useful before a final decision is made?",
    "options": [
      "It allows citizens and groups to provide information and explain possible effects.",
      "It guarantees that every person will agree with the final law.",
      "It transfers the final law-making vote from Parliament to social media users.",
      "It prevents representatives from changing a proposal after hearing evidence."
    ],
    "correctAnswer": 0,
    "explanation": "Public discussion can provide lawmakers with evidence and different perspectives about how a proposal may affect people."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Courts and Fairness",
    "question": "Two witnesses give conflicting accounts in court. What should guide the court's decision?",
    "options": [
      "Which witness has more supporters waiting outside",
      "Which account appeared first on social media",
      "Which political group prefers a particular result",
      "The law and the reliability of all evidence presented"
    ],
    "correctAnswer": 3,
    "explanation": "A court should apply the law and assess the reliability of the evidence rather than follow popularity, politics or social media timing."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Governor-General",
    "question": "Parliament passes a bill through the required stages and it is presented for formal assent. Which office performs this constitutional duty?",
    "options": [
      "The Mayor of the parish where Parliament meets",
      "The Chief Justice acting as leader of the Cabinet",
      "The Governor-General acting in the constitutional role of the office",
      "The Leader of the Opposition acting without any formal process"
    ],
    "correctAnswer": 2,
    "explanation": "Giving formal assent to bills is one of the constitutional duties performed by Jamaica's Governor-General."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "CARICOM Cooperation",
    "question": "Jamaica and another CARICOM country coordinate hurricane supplies and share emergency information. Which CARICOM purpose does this best illustrate?",
    "options": [
      "Regional cooperation in responding to shared challenges",
      "Regional coordination of trade rules for goods entering the common market",
      "Regional support for cultural exchanges among students and artists",
      "Regional arrangements that allow eligible skilled people to seek approved opportunities"
    ],
    "correctAnswer": 0,
    "explanation": "Sharing information and coordinating supplies illustrate regional cooperation among CARICOM members facing a common challenge."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Public Accountability",
    "question": "A community project finishes under budget. What should officials do with the remaining public money?",
    "options": [
      "Divide it privately among the project workers as a reward.",
      "Hide it so residents cannot ask how the budget was managed.",
      "Spend it quickly on an unrelated item without approval or records.",
      "Record it accurately and follow lawful budget procedures for any further use."
    ],
    "correctAnswer": 3,
    "explanation": "Public money must be recorded and managed through lawful, transparent procedures even when a project costs less than expected."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Rule of Law",
    "question": "A government officer receives a traffic ticket for breaking the same rule as other drivers. Which principle is illustrated if the law is applied fairly?",
    "options": [
      "Public officials may choose which laws apply to them.",
      "The rule of law applies to officials as well as other people.",
      "Traffic laws apply only when an elected official approves each ticket.",
      "Government employment automatically removes personal responsibility."
    ],
    "correctAnswer": 1,
    "explanation": "The rule of law means that laws apply to everyone, including people who hold public office."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Community Evidence",
    "question": "A survey about community services was answered mostly by adults from one neighbourhood. What should the council do before treating it as the view of the whole community?",
    "options": [
      "Use the result immediately because the number of neighbourhoods represented does not matter.",
      "Discard all surveys because residents cannot provide useful evidence about services.",
      "Seek responses from other neighbourhoods and age groups before drawing a broad conclusion.",
      "Count each response twice so the original survey appears more representative."
    ],
    "correctAnswer": 2,
    "explanation": "A survey dominated by one neighbourhood and age group may not represent the whole community, so the council should seek broader participation before concluding."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Producers and Consumers",
    "question": "At a school fair, Maya makes bookmarks and later buys juice from another stall. Which statement correctly describes her roles?",
    "options": [
      "She is a consumer in both actions because all fair activities involve spending.",
      "She is a producer when making bookmarks and a consumer when buying juice.",
      "She is a producer when buying juice and a consumer when making bookmarks.",
      "She has no economic role because the activities occur at a school."
    ],
    "correctAnswer": 1,
    "explanation": "Maya is a producer when she creates bookmarks for others and a consumer when she buys juice to use."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budgeting with Percentages",
    "question": "A club receives $10,000. It budgets 40% for equipment and $3,500 for transport. How much remains for other expenses?",
    "options": [
      "$2,500, after subtracting $4,000 and $3,500 from the total",
      "$3,500, because transport and the remaining amount must be equal",
      "$4,000, because the equipment percentage is the amount left over",
      "$6,500, because only transport should be subtracted from the budget"
    ],
    "correctAnswer": 0,
    "explanation": "Forty percent of $10,000 is $4,000. After equipment and transport, $10,000 − $4,000 − $3,500 leaves $2,500."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Opportunity Cost",
    "question": "A youth club uses its only Saturday to paint the community centre instead of holding a fundraising sale. What is the opportunity cost of its choice?",
    "options": [
      "The paint already placed on the community-centre walls",
      "The number of members who attended on Saturday",
      "The fundraising sale and income the club gave up",
      "The next Saturday on the calendar"
    ],
    "correctAnswer": 2,
    "explanation": "Opportunity cost is the next-best alternative given up. Here, the club gives up holding the sale and earning its possible income."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Tourism Linkages",
    "question": "A guesthouse begins buying produce from nearby farmers and hiring local guides. What is the most likely community benefit?",
    "options": [
      "More tourism spending can reach local workers and businesses.",
      "The guesthouse keeps more spending inside the business instead of paying suppliers.",
      "The community becomes more dependent on imported produce and overseas guides.",
      "Local income falls because hiring nearby workers sends wages out of the area."
    ],
    "correctAnswer": 0,
    "explanation": "Purchasing from nearby farmers and hiring local guides connects tourism spending to local incomes and businesses."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Demand and Price",
    "question": "Demand for concert tickets increases greatly, but the number of seats stays fixed. What is most likely if the organizer allows prices to change?",
    "options": [
      "Prices fall because more buyers always reduce competition for seats.",
      "Prices rise because more buyers are competing for the same number of seats.",
      "Prices become unrelated to demand whenever seats are limited.",
      "Prices become zero because the organizer cannot create more seats."
    ],
    "correctAnswer": 1,
    "explanation": "When demand increases while the number of available seats stays fixed, greater competition among buyers can push prices upward."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Trade Decisions",
    "question": "A shop can import a product for $600 or buy a similar locally made product for $650. What should it examine besides the purchase price?",
    "options": [
      "Delivery time, quality, reliability and effects on local producers",
      "Delivery time alone, without checking whether the product is reliable",
      "Whether it is locally made, without comparing quality or delivery",
      "Packaging appearance and shelf position, without checking performance"
    ],
    "correctAnswer": 0,
    "explanation": "A sound trade decision considers quality, delivery, reliability and wider effects as well as the initial price."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Credit Unions",
    "question": "Members regularly save in a credit union, and eligible members may borrow under agreed terms. Which idea does this arrangement illustrate?",
    "options": [
      "Members combine financial resources to provide shared saving and lending services.",
      "Each member's savings must be spent before another member can make a deposit.",
      "Loans become gifts because members belong to the same financial institution.",
      "Borrowing removes the responsibility to repay according to agreed terms."
    ],
    "correctAnswer": 0,
    "explanation": "A credit union is a member-owned cooperative financial institution that pools resources to offer services such as saving and lending."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Public Revenue",
    "question": "A government collects less tax revenue than expected while the cost of public services rises. Which response shows careful budgeting?",
    "options": [
      "Continue every planned expense unchanged and assume the revenue gap will disappear.",
      "Reduce each service by the same amount without comparing urgency or impact.",
      "Borrow the full shortfall without examining repayment costs in future budgets.",
      "Review priorities, costs and available revenue before adjusting the spending plan."
    ],
    "correctAnswer": 3,
    "explanation": "When revenue and costs change, responsible budgeting requires reviewing priorities and available resources before making spending decisions."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Distribution and Calculation",
    "question": "A farming group harvests 600 kilograms of sweet potatoes. It keeps 15% for members and divides the rest equally among three market stalls. How many kilograms does each stall receive?",
    "options": [
      "170 kilograms, because 90 kilograms are kept and 510 are divided by 3",
      "180 kilograms, because the 15% kept should be divided among the stalls",
      "200 kilograms, because the full harvest should be divided before anything is kept",
      "510 kilograms, because the amount remaining should go to each stall"
    ],
    "correctAnswer": 0,
    "explanation": "Fifteen percent of 600 kilograms is 90 kilograms. That leaves 510 kilograms, and 510 ÷ 3 gives 170 kilograms for each stall."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Household Decision-Making",
    "question": "Efficient lights cost $6,000 and are expected to save $1,500 per year. A refrigerator repair costs $9,000 and is expected to save $3,000 per year. Which recovers its cost sooner?",
    "options": [
      "The lights, because $6,000 is the smaller starting cost",
      "Both take four years because both reduce electricity use",
      "The refrigerator repair, because $9,000 ÷ $3,000 is 3 years rather than 4 years",
      "Neither can recover its cost because savings cannot be compared with spending"
    ],
    "correctAnswer": 2,
    "explanation": "The lights take $6,000 ÷ $1,500 = 4 years to recover their cost, while the refrigerator repair takes $9,000 ÷ $3,000 = 3 years."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix7Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix7Questions)
      : prepareSocialStudiesPreview(g5SsMix7Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 7",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 7</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 7</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 7</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
