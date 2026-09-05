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

const g5SsMix6Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Chronology",
    "question": "A timeline marks the Baptist War in 1831–1832, full freedom in 1838, the Morant Bay Rebellion in 1865 and Independence in 1962. Which two marked events are closest together in time?",
    "options": [
      "Full freedom and the Morant Bay Rebellion",
      "The Baptist War and full freedom",
      "The Morant Bay Rebellion and Independence",
      "The Baptist War and Independence"
    ],
    "correctAnswer": 1,
    "explanation": "The Baptist War ended in 1832 and full freedom came in 1838, a gap of about six years. The gaps between the other marked events are much longer."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Evidence Interpretation",
    "question": "Archaeologists find cassava griddles, stone tools and canoe remains at a Taíno settlement. What is the best conclusion from all three findings?",
    "options": [
      "The Taíno depended entirely on imported food and tools.",
      "The settlement was used only for religious ceremonies.",
      "The Taíno processed food, made tools and travelled by water.",
      "The community began only after Europeans introduced canoes."
    ],
    "correctAnswer": 2,
    "explanation": "Cassava griddles provide evidence of food preparation, stone tools show toolmaking or daily work, and canoe remains indicate water travel."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Cause and Effect",
    "question": "Why did the Baptist War strengthen the movement to end slavery in the British colonies?",
    "options": [
      "It showed the strength of resistance and increased pressure for abolition.",
      "It immediately gave every enslaved person full freedom in 1831.",
      "It persuaded plantation owners to end all forced labour voluntarily.",
      "It caused Jamaica to become independent from Britain at once."
    ],
    "correctAnswer": 0,
    "explanation": "The scale of the uprising demonstrated strong resistance to slavery and added urgency to abolitionist arguments in Britain."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Source Evaluation",
    "question": "A plantation owner wrote that the Apprenticeship system was fair, while an apprentice described continued punishment and unpaid labour. What should a student do?",
    "options": [
      "Accept the plantation owner's account because property owners kept official records.",
      "Reject both accounts because people involved in events cannot provide evidence.",
      "Accept the apprentice's account without checking any other source.",
      "Compare both perspectives with laws, court records and other contemporary evidence."
    ],
    "correctAnswer": 3,
    "explanation": "Each writer had a different position and possible bias, so comparing both accounts with additional contemporary evidence gives a stronger conclusion."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Historical Significance",
    "question": "Why is 1838 especially important in Jamaica's emancipation history?",
    "options": [
      "It began the Baptist War across western Jamaica.",
      "It ended Apprenticeship and brought full freedom to formerly enslaved people.",
      "It introduced Universal Adult Suffrage for Jamaican voters.",
      "It marked Jamaica's first year as an independent country."
    ],
    "correctAnswer": 1,
    "explanation": "Slavery was legally abolished in 1834, but Apprenticeship continued until full freedom came on August 1, 1838."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Comparing Contributions",
    "question": "Which comparison of George William Gordon and Paul Bogle is most accurate?",
    "options": [
      "Gordon led the Morant Bay march, while Bogle argued against injustice in the Assembly.",
      "Gordon and Bogle both held the same elected office and used identical methods.",
      "Gordon challenged injustice in public life, while Bogle led the march to Morant Bay.",
      "Gordon organized the Baptist War, while Bogle campaigned for Independence."
    ],
    "correctAnswer": 2,
    "explanation": "Gordon used his public and political position to challenge injustice, while Bogle organized and led the 1865 march to Morant Bay."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Change over Time",
    "question": "What was the main democratic change created by Universal Adult Suffrage in 1944?",
    "options": [
      "Adult Jamaicans gained voting rights without property or income qualifications.",
      "Jamaica immediately ended every constitutional link with Britain.",
      "Only landowners gained the right to choose parish representatives.",
      "The Senate began to be elected directly by all adult citizens."
    ],
    "correctAnswer": 0,
    "explanation": "Universal Adult Suffrage widened voting rights to adult Jamaicans regardless of property ownership, income or social class."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Historical Inference",
    "question": "Workers in 1938 protested low wages and poor working conditions. Which later development is most closely connected to those protests?",
    "options": [
      "The strengthening of plantation rule without organized worker representation",
      "The growth of trade unions and political parties seeking social and political change",
      "The ending of voting rights so workers could not influence public decisions",
      "The replacement of wage discussions with a return to the Apprenticeship system"
    ],
    "correctAnswer": 1,
    "explanation": "The 1938 labour unrest encouraged the growth of organized trade unions and political movements seeking improved conditions and greater self-government."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Perspective",
    "question": "Two accounts describe the English capture of Jamaica in 1655. One calls it a victory; the other describes families losing homes. Why might the accounts differ?",
    "options": [
      "The account celebrating victory must be complete because winners cannot be biased.",
      "The account describing loss must be complete because suffering prevents bias.",
      "The writers may emphasize different effects because their experiences and interests differ.",
      "The two accounts must describe separate captures because their opinions are different."
    ],
    "correctAnswer": 2,
    "explanation": "People affected differently by an event may emphasize different consequences, so perspective helps explain contrasting accounts."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "National Development",
    "question": "Which evidence best shows that Independence changed Jamaica's political status in 1962?",
    "options": [
      "Jamaicans continued using English and maintaining cultural links with Britain.",
      "Jamaica gained responsibility for governing itself as an independent nation.",
      "Every law and institution from the colonial period disappeared immediately.",
      "Jamaica stopped cooperating with Britain and all other countries."
    ],
    "correctAnswer": 1,
    "explanation": "Independence meant Jamaica became responsible for its own national government, even though some institutions and international relationships continued."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Scale",
    "question": "On a map, 1 centimetre represents 8 kilometres. Two towns are 4 centimetres apart. What is their actual distance?",
    "options": [
      "12 kilometres",
      "24 kilometres",
      "32 kilometres",
      "40 kilometres"
    ],
    "correctAnswer": 2,
    "explanation": "Each centimetre represents 8 kilometres, so 4 × 8 gives an actual distance of 32 kilometres."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Direction",
    "question": "A bus travels east from Town A to Town B, then turns south to Town C. In which direction is Town C from Town A?",
    "options": [
      "North-east",
      "South-east",
      "South-west",
      "North-west"
    ],
    "correctAnswer": 1,
    "explanation": "Moving east and then south places Town C south-east of the starting point at Town A."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Data",
    "question": "A parish recorded 90 mm of rain in May, 140 mm in June and 70 mm in July. Which statement is supported by the data?",
    "options": [
      "July received twice as much rain as June.",
      "May and July together received less rain than June.",
      "June recorded the greatest rainfall of the three months.",
      "The rainfall increased in every month shown."
    ],
    "correctAnswer": 2,
    "explanation": "June's 140 mm is greater than May's 90 mm and July's 70 mm, so June had the highest recorded rainfall."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Watershed Protection",
    "question": "Farmers on steep land near a river notice more soil entering the water after heavy rain. Which action would best reduce the problem?",
    "options": [
      "Clear more vegetation so rainwater reaches the river quickly.",
      "Plant ground cover and use barriers that slow runoff on the slope.",
      "Move loose soil closer to the river before the rainy season.",
      "Deepen channels that carry soil directly downhill."
    ],
    "correctAnswer": 1,
    "explanation": "Ground cover and barriers slow runoff and hold soil in place, reducing erosion and sediment entering the river."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Hazard Planning",
    "question": "A coastal community is threatened by storm surge. Which preparation directly addresses that hazard?",
    "options": [
      "Store emergency supplies only in buildings beside the beach.",
      "Move people from low coastal areas to identified higher ground.",
      "Open windows so rising seawater can pass through houses.",
      "Wait until seawater enters roads before beginning evacuation."
    ],
    "correctAnswer": 1,
    "explanation": "Storm surge can rapidly flood low coastal land, so early evacuation to identified higher ground directly reduces danger."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Decisions",
    "question": "Site X is close to jobs but floods often. Site Y is farther from jobs but has safer land and a reliable road. What should planners compare before choosing?",
    "options": [
      "Only the distance from each site to the nearest shop",
      "Only the number of houses that can be painted quickly",
      "Travel needs, flood risk, service costs and long-term safety",
      "The names residents would prefer for the new streets"
    ],
    "correctAnswer": 2,
    "explanation": "A responsible settlement choice weighs access to work against flood exposure, infrastructure costs and long-term safety."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Mangrove Conservation",
    "question": "Why can removing mangroves make a nearby coastal community more vulnerable?",
    "options": [
      "Mangroves create hurricanes when their roots become too dense.",
      "Mangroves prevent all rainfall from reaching coastal settlements.",
      "Mangroves slow waves and hold sediment, helping protect shorelines.",
      "Mangroves move buildings away from areas affected by flooding."
    ],
    "correctAnswer": 2,
    "explanation": "Mangrove roots trap sediment and the vegetation reduces wave energy, so removing mangroves can increase erosion and coastal exposure."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Land Use",
    "question": "A community wants housing, farmland and forest protection on the same hillside. Which plan best balances these needs?",
    "options": [
      "Build throughout the steepest forested area and move farming to the riverbank.",
      "Clear the entire hillside so each activity can use any location.",
      "Place every house and farm at the hilltop regardless of slope or access.",
      "Use safer slopes for buildings, suitable land for farming and protect key forest and drainage areas."
    ],
    "correctAnswer": 3,
    "explanation": "Matching each use to suitable land while protecting forests and drainage areas balances development, farming and environmental safety."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Transport Networks",
    "question": "A bridge closure forces farmers to take a much longer route to market. What is the most likely immediate effect?",
    "options": [
      "Transport time and delivery costs are likely to increase.",
      "Farm products will automatically become imports.",
      "The distance between the farms and market will physically shrink.",
      "Rainfall near the market will stop until the bridge reopens."
    ],
    "correctAnswer": 0,
    "explanation": "A longer route generally requires more travel time and fuel, increasing the cost of getting farm goods to market."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Environmental Evidence",
    "question": "A beach becomes narrower after vegetation is removed and several storms occur. Which conclusion is most careful?",
    "options": [
      "Vegetation removal certainly caused every change observed on the beach.",
      "Storms cannot affect beach width when coastal vegetation is absent.",
      "The beach will return to its original width without any further study.",
      "Both vegetation loss and storms may have contributed, so more evidence should be examined."
    ],
    "correctAnswer": 3,
    "explanation": "The timing suggests that vegetation loss and storms may both matter, but additional observations are needed before assigning a single cause."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliament",
    "question": "Representatives debate a proposed national law, suggest changes and vote on it. Which institution is carrying out this work?",
    "options": [
      "The courts, because judges decide the wording of proposed national laws",
      "Parliament, because debating and deciding national laws is part of its work",
      "The police, because officers vote on laws before enforcing them",
      "A Municipal Corporation, because it passes every national law"
    ],
    "correctAnswer": 1,
    "explanation": "Jamaica's Parliament debates proposed national laws, considers changes and votes on whether they should be passed."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Representation",
    "question": "Residents want their concern about a proposed national law raised by someone they elected. Whom should they contact?",
    "options": [
      "Their Member of Parliament",
      "A judge hearing an unrelated case",
      "The principal of the nearest school",
      "A private business owner in the community"
    ],
    "correctAnswer": 0,
    "explanation": "A Member of Parliament represents constituents in the House of Representatives and can raise concerns about proposed national laws."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Local Government",
    "question": "A blocked community drain is causing repeated road flooding. Which public body should residents approach first about this local-service problem?",
    "options": [
      "The Senate, because it directly clears community drains",
      "The Court of Appeal, because flooding is decided by judges",
      "The Municipal Corporation/local authority responsible for local roads and drainage",
      "The Electoral Office, because drainage is part of voter registration"
    ],
    "correctAnswer": 2,
    "explanation": "Municipal Corporations are local authorities responsible for many local services, including local roads and drainage."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Judicial Independence",
    "question": "A politician publicly demands that a judge rule against a community leader before all the evidence is heard. What should the judge do?",
    "options": [
      "Follow the demand because elected officials may decide individual court cases",
      "Ask supporters of both sides to vote publicly on the court's ruling",
      "Decide independently by applying the law to the evidence presented in court",
      "Delay the case until the politician approves the evidence and final decision"
    ],
    "correctAnswer": 2,
    "explanation": "Judicial independence requires the judge to resist political pressure and decide the case by applying the law to the evidence."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "Which action best combines freedom of expression with civic responsibility?",
    "options": [
      "Posting an unverified accusation because everyone may say anything",
      "Presenting a reasoned concern without threats and checking important facts",
      "Preventing people with different views from speaking at a meeting",
      "Damaging public property to make an opinion more noticeable"
    ],
    "correctAnswer": 1,
    "explanation": "Responsible expression allows people to share views while respecting others, avoiding threats and checking important factual claims."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Governor-General",
    "question": "After the elected government completes the required process for an official appointment, the Governor-General performs the formal constitutional step. What does this example show?",
    "options": [
      "The Governor-General may replace every elected decision with a personal preference.",
      "The Governor-General leads whichever political party forms the elected government.",
      "The Governor-General carries out formal constitutional duties within the parliamentary system.",
      "The Governor-General determines election winners before votes are officially counted."
    ],
    "correctAnswer": 2,
    "explanation": "The example shows the Governor-General carrying out a formal constitutional duty within Jamaica's elected parliamentary system."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Lawful Participation",
    "question": "Residents oppose a plan to remove their community park. Which response would most effectively combine evidence and lawful participation?",
    "options": [
      "Collect information, attend consultations and submit a supported proposal to decision-makers.",
      "Spread a rumour about the planners so other residents become angry.",
      "Block emergency vehicles until officials promise to cancel the plan.",
      "Avoid the consultation because lawful processes cannot influence decisions."
    ],
    "correctAnswer": 0,
    "explanation": "Evidence, consultation and a supported proposal allow residents to participate lawfully and give decision-makers relevant information."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Accountability",
    "question": "A public official promises a project, receives public money and later refuses to explain how it was spent. Which principle is most directly involved?",
    "options": [
      "Secrecy, because public spending should never be questioned",
      "Accountability, because officials should explain decisions and use of public funds",
      "Inheritance, because public money belongs to an official's family",
      "Censorship, because residents must avoid discussing government projects"
    ],
    "correctAnswer": 1,
    "explanation": "Accountability requires public officials to answer for their decisions and explain how public resources are used."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Constitutional Government",
    "question": "Why is a constitution important to government?",
    "options": [
      "It allows officials to ignore laws during ordinary disagreements.",
      "It lists the result that every future election must produce.",
      "It replaces all courts, laws and elected representatives.",
      "It establishes key rules, institutions, powers and protections within the state."
    ],
    "correctAnswer": 3,
    "explanation": "A constitution provides fundamental rules for government, defines important institutions and powers, and protects key rights."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Community Decision-Making",
    "question": "A council has funds for either a playground upgrade or urgent repairs to a damaged community shelter. What is the fairest first step?",
    "options": [
      "Choose the project preferred by the loudest speaker without examining needs.",
      "Divide the money equally even if neither project can then be completed safely.",
      "Compare urgency, safety, costs and community evidence before deciding.",
      "Spend all the money immediately so residents cannot question the decision."
    ],
    "correctAnswer": 2,
    "explanation": "A fair public decision should compare evidence about urgency, safety, cost and community benefit before assigning limited funds."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Needs and Wants",
    "question": "A family has enough money either to repair a leaking roof or to buy a new television. Which choice best meets an urgent need?",
    "options": [
      "Buy the television because entertainment should come before home repairs.",
      "Repair the roof because safe shelter is more urgent than replacing entertainment equipment.",
      "Delay both choices until the television costs more than the roof repair.",
      "Spend half on each even if neither purchase can then be completed."
    ],
    "correctAnswer": 1,
    "explanation": "Repairing the leaking roof protects the family's shelter and safety, so it is a more urgent need than buying a new television."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budgeting",
    "question": "Andre has $2,000. He must spend $1,200 on school supplies and wants to save at least $500. What is the most he can spend on a treat?",
    "options": [
      "$800, because that is what remains after buying the supplies",
      "$500, because the saving goal can also be spent on the treat",
      "$200, because the school supplies cost four times as much",
      "$300, because $2,000 minus $1,200 minus $500 equals $300"
    ],
    "correctAnswer": 3,
    "explanation": "After spending $1,200 and setting aside $500, Andre has $300 available: $2,000 − $1,200 − $500 = $300."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Supply and Demand",
    "question": "After heavy rain damages many tomato crops, fewer tomatoes reach the market while demand stays about the same. What is the most likely short-term result?",
    "options": [
      "Tomato prices rise because the available supply has fallen while demand remains similar.",
      "Tomato prices fall because crop damage automatically increases the number for sale.",
      "Tomato prices stay fixed because supply cannot affect market prices.",
      "Tomatoes become free because shoppers still want to buy them."
    ],
    "correctAnswer": 0,
    "explanation": "When fewer tomatoes are available but demand remains similar, buyers compete for a smaller supply, so prices are likely to rise in the short term."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Imports and Exports",
    "question": "A Jamaican company sells locally produced sauces to shops in another country and buys machinery from abroad. How should these two transactions be classified?",
    "options": [
      "Both are imports because money crosses Jamaica's border in each transaction.",
      "Both are exports because a Jamaican company participates in each transaction.",
      "The sauces are exports, while the machinery is an import into Jamaica.",
      "The sauces are imports, while the machinery is an export from Jamaica."
    ],
    "correctAnswer": 2,
    "explanation": "Goods sold from Jamaica to another country are exports, while goods bought abroad and brought into Jamaica are imports."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Saving and Interest",
    "question": "Two children each receive $1,000. Kayla saves hers in an account that earns interest, while Joel keeps his at home and spends none. After one year, why might Kayla have more money?",
    "options": [
      "Her account may add interest to the amount she saved.",
      "Joel's cash may earn interest at home because he chose not to spend it.",
      "Kayla's balance grows only when she withdraws part of her original deposit.",
      "The account changes her $1,000 into a loan that she no longer owns."
    ],
    "correctAnswer": 0,
    "explanation": "Interest is money that may be added to savings according to the account's terms, so Kayla's balance may grow over time."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Taxation and Public Services",
    "question": "Why might residents support paying taxes even though taxes reduce the money they can spend privately?",
    "options": [
      "Tax payments are returned separately to each taxpayer for private shopping.",
      "Tax revenue is kept unused so public services need no spending decisions.",
      "Tax payments replace the need to plan and budget for shared services.",
      "Tax revenue helps fund shared services such as roads, schools and public health."
    ],
    "correctAnswer": 3,
    "explanation": "Taxes provide government revenue that can be used for public services and facilities shared across communities."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Cooperatives",
    "question": "Several farmers cannot individually afford a refrigerated truck. Which cooperative action would most directly help them reduce spoilage and reach buyers?",
    "options": [
      "Each farmer can rent separate transport even if the combined cost is much higher.",
      "They can delay harvesting until one farmer can afford a truck without assistance.",
      "They can pool resources to obtain and share suitable refrigerated transport.",
      "They can share advertising costs while leaving the transport problem unchanged."
    ],
    "correctAnswer": 2,
    "explanation": "By pooling resources, cooperative members can share equipment that may be too costly for one farmer and transport produce before it spoils."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Tourism and Community Economy",
    "question": "A community expects more visitors during a festival. Which plan is most likely to increase local benefits while protecting the area?",
    "options": [
      "Hire local workers, buy local supplies and budget for waste collection and site care.",
      "Hire most workers from elsewhere and choose imported supplies without comparing local offers.",
      "Use all available space for vendors without budgeting for waste collection or site repairs.",
      "Spend the festival budget on advertising while leaving local facilities and waste services unfunded."
    ],
    "correctAnswer": 0,
    "explanation": "Using local workers and suppliers keeps more spending in the community, while waste collection and site care help protect the attraction."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Profit and Costs",
    "question": "A student sells 20 fruit cups for $250 each. Ingredients and containers cost $3,600 altogether. What profit does the student make?",
    "options": [
      "$1,400, because revenue is $5,000 and costs are $3,600",
      "$1,600, because the cost should be subtracted from $5,200",
      "$3,600, because all production costs become profit after the sale",
      "$5,000, because total revenue and profit are always the same"
    ],
    "correctAnswer": 0,
    "explanation": "Revenue is 20 × $250 = $5,000. Profit is revenue minus cost, so $5,000 − $3,600 = $1,400."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Economic Decision-Making",
    "question": "A school can buy cheaper imported desks now or slightly more expensive locally made desks that can be repaired nearby. What information would best support a careful decision?",
    "options": [
      "Choose by purchase price and colour without estimating how long the desks may last",
      "Choose by where the desks were made without comparing cost, strength or repair needs",
      "Compare purchase price and durability but leave repair access and local effects unexamined",
      "Purchase price, expected durability, repair costs and how each choice affects the local economy"
    ],
    "correctAnswer": 3,
    "explanation": "A careful choice compares immediate price with durability and repair costs, while also considering the wider effect of spending on the local economy."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix6Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix6Questions)
      : prepareSocialStudiesPreview(g5SsMix6Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 6",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 6</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 6</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 6</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
