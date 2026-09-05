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

const g5SsMix10Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Using Historical Evidence",
    "question": "At one Taíno site, objects from deeper soil layers are older than objects nearer the surface. Why should archaeologists record the layer where each object is found?",
    "options": [
      "The layers help show the likely sequence of activities and changes at the site.",
      "The deepest object must have been the most valuable possession in the community.",
      "Objects found near each other must all have belonged to the same person.",
      "The surface layer proves how every Taíno community lived throughout Jamaica."
    ],
    "correctAnswer": 0,
    "explanation": "Recording soil layers helps archaeologists place finds in a likely time sequence and study how activity at a site changed."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Chronology",
    "question": "Which sequence places these events from earliest to latest: English capture of Jamaica, Baptist War, full freedom, Morant Bay Rebellion?",
    "options": [
      "Baptist War, English capture, full freedom, Morant Bay Rebellion",
      "English capture, full freedom, Baptist War, Morant Bay Rebellion",
      "English capture, Baptist War, full freedom, Morant Bay Rebellion",
      "Full freedom, Baptist War, English capture, Morant Bay Rebellion"
    ],
    "correctAnswer": 2,
    "explanation": "England captured Jamaica in 1655, the Baptist War occurred in 1831–1832, full freedom came in 1838, and the Morant Bay Rebellion occurred in 1865."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Cause and Consequence",
    "question": "Records show that new laws and stricter controls followed the Baptist War, while emancipation legislation followed soon afterward. What is the most careful conclusion?",
    "options": [
      "The uprising had no effect because some controls became stricter immediately afterward.",
      "The uprising alone ended Apprenticeship in 1838 without any other influences.",
      "The uprising affected colonial decisions, although change involved several events and pressures.",
      "The uprising occurred after full freedom and therefore could not influence emancipation."
    ],
    "correctAnswer": 2,
    "explanation": "The records suggest that the Baptist War influenced colonial responses and the movement toward emancipation, but they do not show that it was the only cause of change."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Change over Time",
    "question": "Ama was placed under Apprenticeship in 1834 and became fully free in 1838. Which change would she most directly have experienced in 1838?",
    "options": [
      "She no longer had to provide compulsory labour under the Apprenticeship system.",
      "She gained the right to vote under Universal Adult Suffrage immediately.",
      "She became independent from British colonial government immediately.",
      "She entered Apprenticeship for the first time after four years of full freedom."
    ],
    "correctAnswer": 0,
    "explanation": "The end of Apprenticeship in 1838 brought full freedom, ending the compulsory labour requirements imposed on apprentices."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Comparing Perspectives",
    "question": "One 1865 newspaper calls the Morant Bay protesters disorderly. A petition from local residents describes hardship and unfair treatment. Why should both sources be examined?",
    "options": [
      "They reveal different perspectives that can be compared with other evidence.",
      "They must contain identical facts because both were written in the same year.",
      "The newspaper automatically cancels every claim made in the petition.",
      "The petition proves that no protester committed any unlawful act."
    ],
    "correctAnswer": 0,
    "explanation": "The sources represent different viewpoints. Comparing them and checking other evidence supports a more balanced historical interpretation."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Geography in History",
    "question": "How did Jamaica's mountainous interior help some Maroon communities resist colonial forces?",
    "options": [
      "Mountain routes allowed large warships to travel directly to inland settlements.",
      "Steep, forested terrain supported concealment, movement and defensive knowledge of the land.",
      "The mountains prevented Maroons from growing food or communicating with one another.",
      "High ground removed the need for planning, scouts or cooperation."
    ],
    "correctAnswer": 1,
    "explanation": "Knowledge of steep, forested terrain helped Maroon communities move, hide and defend themselves against forces less familiar with the landscape."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Leadership and Ideas",
    "question": "Marcus Garvey encouraged people of African descent in many countries to build pride and cooperate economically. Which evidence would best show that his ideas spread internationally?",
    "options": [
      "A Jamaican newspaper reporting one local Garvey meeting",
      "Membership records and newspapers from branches in several countries",
      "A speech in which Garvey describes plans for future international branches",
      "A photograph of Garvey with visitors whose countries are not identified"
    ],
    "correctAnswer": 1,
    "explanation": "Records and publications from branches in several countries would directly demonstrate the international reach of Garvey's movement."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Interpreting Historical Data",
    "question": "A table shows low wages, rising food prices and increasing strikes in Jamaica during the late 1930s. Which explanation best connects the evidence?",
    "options": [
      "Workers protested partly because earnings were not keeping pace with living costs.",
      "Workers organized mainly because food became cheaper than wages suggested.",
      "The strikes prove that every employer paid exactly the same wage.",
      "The figures show that economic conditions played no role in the unrest."
    ],
    "correctAnswer": 0,
    "explanation": "Low wages combined with rising prices would reduce workers' ability to meet expenses, helping to explain growing labour protest."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Democratic Development",
    "question": "An election register lists 45,000 eligible voters before 1944 and a much larger adult electorate after 1944. What additional evidence would best show the effect of Universal Adult Suffrage?",
    "options": [
      "A comparison of the voting qualifications and registration totals before and after 1944",
      "A list of election-day weather conditions without voter-registration information",
      "A map of polling locations that gives no dates or eligibility rules",
      "A speech about Independence in 1962 without evidence about voting rights"
    ],
    "correctAnswer": 0,
    "explanation": "Comparing eligibility rules and registration totals would connect the removal of former property and income qualifications with the expanded electorate."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Continuity and Change",
    "question": "A museum display about 1962 includes the new national flag, records of Jamaican control over national affairs, and documents showing Parliament continued to operate. What theme links the evidence?",
    "options": [
      "Independence combined important national changes with continuity in parliamentary government.",
      "Independence changed national symbols but left responsibility for national affairs overseas.",
      "Parliament continued, so the flag and national authority could not have changed.",
      "The documents show that Jamaica returned to its government system from before 1655."
    ],
    "correctAnswer": 0,
    "explanation": "The evidence shows new national symbols and authority alongside the continuation of parliamentary government, linking change with continuity."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Scale",
    "question": "A map scale shows 1 centimetre represents 5 kilometres. A direct road is 6 centimetres, but a detour is 9 centimetres. How many extra kilometres does the detour add?",
    "options": [
      "3 kilometres",
      "15 kilometres",
      "30 kilometres",
      "45 kilometres"
    ],
    "correctAnswer": 1,
    "explanation": "The detour is 3 centimetres longer. At 5 kilometres per centimetre, it adds 15 kilometres."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Direction and Location",
    "question": "A hiker faces north, turns right, walks forward, then turns right again. Which direction is the hiker facing after the second turn?",
    "options": [
      "North, the hiker's original direction",
      "East, the direction after the first turn",
      "South, the direction after both right turns",
      "West, the direction opposite the first turn"
    ],
    "correctAnswer": 2,
    "explanation": "Turning right from north faces east; turning right again from east faces south."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Interpreting Rainfall Data",
    "question": "Rainfall totals for four months are 80 mm, 120 mm, 200 mm and 100 mm. What percentage of the 500 mm total fell in the wettest month?",
    "options": [
      "20%",
      "25%",
      "40%",
      "50%"
    ],
    "correctAnswer": 2,
    "explanation": "The wettest month had 200 mm out of 500 mm. Dividing 200 by 500 gives 40%."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Hazard Planning",
    "question": "Two communities face hurricane risk. Community A has stronger roofs but poor drainage; Community B has weaker roofs but good drainage. What does this comparison show?",
    "options": [
      "Only roof strength matters when communities prepare for hurricanes.",
      "Only drainage matters because wind cannot damage buildings.",
      "Each community has a different weakness that its preparedness plan should address.",
      "Both communities need identical plans because all hurricane risks are the same."
    ],
    "correctAnswer": 2,
    "explanation": "Community A needs to address flooding and drainage, while Community B needs stronger buildings; preparedness should respond to each location's evidence."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Watershed Management",
    "question": "Farmers upstream remove vegetation, and residents downstream notice faster runoff and muddier water. Which action addresses both observations?",
    "options": [
      "Restore vegetation and use soil-conservation methods on the upstream slopes.",
      "Deepen only the downstream wells without changing land use upstream.",
      "Build more houses beside the river to slow the water naturally.",
      "Remove remaining plants so rainfall reaches the soil more quickly."
    ],
    "correctAnswer": 0,
    "explanation": "Vegetation and soil-conservation measures reduce erosion and slow runoff, helping improve downstream water conditions."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Decisions",
    "question": "A proposed housing site is close to jobs but lies on unstable land. Another is farther away but stable and connected by a reliable bus route. What should planners do?",
    "options": [
      "Choose the closer site because travel time should outweigh every safety concern.",
      "Compare safety, transport time, building costs and access to services before deciding.",
      "Choose the farther site without checking whether the bus service meets residents' needs.",
      "Reject both sites because no settlement can involve a trade-off."
    ],
    "correctAnswer": 1,
    "explanation": "A responsible site decision weighs land stability and building safety alongside transport, cost and access to services."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Coastal Systems",
    "question": "After coral damage near a bay, fish numbers fall and waves reach the shore with greater force. Which explanation connects both changes?",
    "options": [
      "Coral reefs provide habitat and can reduce wave energy before it reaches shore.",
      "Coral reefs support fish, while only mangroves can influence the force of waves.",
      "Coral reefs reduce waves, but fish numbers depend entirely on fishing rules.",
      "Coral reefs affect water depth, while the two observed changes must have separate causes."
    ],
    "correctAnswer": 0,
    "explanation": "Healthy reefs support marine habitats and help break wave energy, so reef damage can affect both fish populations and shoreline exposure."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Transport Networks",
    "question": "A bridge closure adds 20 minutes to school buses and delays farm deliveries. Which evidence would best help officials prioritize a response?",
    "options": [
      "Repair-cost estimates and the age of the bridge, without measuring current delays",
      "Traffic counts, delay times, safety reports and the availability of other routes",
      "School-bus schedules and farm-delivery records, without evidence about safety or alternatives",
      "Safety reports and one driver's preferred route, without counting how many users are affected"
    ],
    "correctAnswer": 1,
    "explanation": "Traffic, delays, safety and alternative-route evidence show how widely the closure affects movement and how urgently action is needed."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Weather and Climate",
    "question": "One unusually cool week occurs during a generally warm year. Why does this not by itself prove that the area's climate has changed?",
    "options": [
      "Climate conclusions require patterns from records collected over many years.",
      "A single week is enough only when temperatures are lower than expected.",
      "Climate describes daily conditions, while weather describes thirty-year patterns.",
      "Unusual weather cannot occur in a place with a warm climate."
    ],
    "correctAnswer": 0,
    "explanation": "A short unusual period is weather variation; identifying climate change requires evidence from long-term patterns."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Environmental Decision-Making",
    "question": "A quarry could provide jobs and stone but may increase dust and damage a nearby stream. Which permit condition best responds to both benefits and risks?",
    "options": [
      "Approve unlimited quarrying because employment removes environmental risk.",
      "Ban every form of quarrying without examining the proposed site or safeguards.",
      "Require dust control, stream protection, monitoring and limits tied to evidence.",
      "Allow work only at night so environmental effects cannot be observed."
    ],
    "correctAnswer": 2,
    "explanation": "Evidence-based controls and monitoring can address dust and stream risks while allowing decision-makers to consider the proposed economic benefit."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliamentary Representation",
    "question": "Residents ask their MP to support a proposal, but national evidence shows that the proposal may harm another region. What is the MP's most responsible approach?",
    "options": [
      "Support the request immediately because an MP must never consider national effects.",
      "Ignore the residents because national information makes consultation unnecessary.",
      "Examine both local concerns and national evidence, then explain the position taken.",
      "Ask the Governor-General to decide how the MP must vote on the proposal."
    ],
    "correctAnswer": 2,
    "explanation": "Responsible representation considers constituents' concerns alongside wider evidence and includes accountability for the decision reached."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Local and National Government",
    "question": "A damaged community road also affects a national emergency route. Which response best recognizes the shared concern?",
    "options": [
      "The Municipal Corporation should document the local problem and coordinate with relevant national authorities.",
      "Only residents should repair it because government bodies cannot coordinate responsibilities.",
      "The Senate should send workers directly because it manages all road repairs.",
      "The court should select the contractor because judges administer public works."
    ],
    "correctAnswer": 0,
    "explanation": "The local authority can address and document local-road needs while coordinating with relevant national bodies when wider emergency access is involved."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Evaluating Public Claims",
    "question": "A proposal is discussed publicly, passed by one chamber of Parliament, and described online as already in force. What should a student verify before calling it a law?",
    "options": [
      "Whether the remaining required legislative and formal steps were completed",
      "Whether the online description received more comments than the public discussion",
      "Whether every member of the first chamber supported the proposal",
      "Whether the proposal concerns a service provided in more than one parish"
    ],
    "correctAnswer": 0,
    "explanation": "Approval at one stage does not by itself complete the legislative process, so the student should verify that all required steps occurred."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "Residents hold a peaceful meeting about water service and keep the entrance clear for emergency access. Which principle does this demonstrate?",
    "options": [
      "Exercising a right while respecting the safety and rights of others",
      "Giving up freedom of expression whenever a public service is involved",
      "Using a public meeting to replace every lawful government process",
      "Treating emergency access as less important than the meeting's message"
    ],
    "correctAnswer": 0,
    "explanation": "The residents express their concerns peacefully while meeting their responsibility not to endanger or unfairly obstruct others."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Judicial Independence",
    "question": "Before a court hearing ends, a large crowd demands one outcome while the documents presented in court point another way. What should guide the judge?",
    "options": [
      "The law and evidence properly presented in the case",
      "The size of the crowd outside the court on that day",
      "The outcome most frequently requested on social media",
      "The preference of whichever party holds more public meetings"
    ],
    "correctAnswer": 0,
    "explanation": "A fair and independent court bases its decision on the law and evidence in the case rather than public pressure."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Public Consultation",
    "question": "A consultation receives 500 identical form responses and 30 detailed local submissions. How should decision-makers use this evidence?",
    "options": [
      "Count only the detailed submissions because form responses can never express a real view.",
      "Count only the larger group and ignore every reason supplied by local residents.",
      "Consider the number, source and reasoning of responses rather than treating one measure as complete evidence.",
      "Discard all responses because different formats cannot be reviewed together."
    ],
    "correctAnswer": 2,
    "explanation": "A sound review considers participation levels, who is affected and the reasons offered, while recognizing the limits of each type of response."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "Parliament passes a bill through the required process. What best describes the Governor-General's role at the formal assent stage?",
    "options": [
      "Perform the constitutional duty connected with completing the legislative process.",
      "Rewrite the bill as a personal policy before Parliament can consider it again.",
      "Replace elected representatives and debate the bill as every constituency's MP.",
      "Direct the courts to approve the bill's future application in every case."
    ],
    "correctAnswer": 0,
    "explanation": "Formal assent is a constitutionally defined duty in the legislative process, not personal control over government policy."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Accountability",
    "question": "A public project's budget lists $12 million approved, $9 million spent and $1 million remaining. Which accountability question follows from the figures?",
    "options": [
      "How the unaccounted $2 million was used or committed",
      "Why the project did not spend the remaining $1 million immediately",
      "Whether the approved amount should be reduced to match the spending already recorded",
      "Whether the project name can be changed before the accounts are explained"
    ],
    "correctAnswer": 0,
    "explanation": "The approved amount exceeds the recorded spending plus the stated balance by $2 million, so the agency should account for that difference."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Regional Cooperation",
    "question": "Researchers in several CARICOM countries use the same method to track a crop disease. Why can the shared method improve the regional response?",
    "options": [
      "Comparable results can reveal where the disease is spreading and support coordinated action.",
      "Each country can report different measurements without explaining how they were collected.",
      "A shared method removes the need for farmers to follow national plant-health guidance.",
      "Regional tracking guarantees that weather and pests will stop affecting crops."
    ],
    "correctAnswer": 0,
    "explanation": "Using comparable observations helps countries identify regional patterns and coordinate responses to a problem that can cross borders."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Community Decision-Making",
    "question": "A youth centre has funds for either a larger sports area or improved access for persons with disabilities. Which process is fairest?",
    "options": [
      "Let the first group at the meeting decide before hearing other users.",
      "Compare needs, legal and safety duties, costs and possible phased solutions.",
      "Choose the cheaper proposal without checking who would be excluded.",
      "Delay the decision permanently because competing needs cannot be compared."
    ],
    "correctAnswer": 1,
    "explanation": "A fair process considers users' needs, inclusion and safety obligations, costs and whether the improvements can be phased."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Opportunity Cost",
    "question": "A school can use $60,000 to repair its water tank or buy new stage curtains. Choosing the tank means giving up the curtains. What is the opportunity cost?",
    "options": [
      "The benefit the school expects from repairing the water tank",
      "The money remaining after the full $60,000 has been committed",
      "The benefit of the new stage curtains that are not purchased",
      "The cost of every project the school may consider in later years"
    ],
    "correctAnswer": 2,
    "explanation": "Opportunity cost is the next-best alternative given up, which in this choice is purchasing the new stage curtains."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budgeting",
    "question": "A family earns $80,000 and plans to save 15%. After saving, it pays $46,000 in regular expenses. How much remains for other needs?",
    "options": [
      "$12,000",
      "$18,000",
      "$22,000",
      "$34,000"
    ],
    "correctAnswer": 2,
    "explanation": "Fifteen percent of $80,000 is $12,000. After saving that amount and paying $46,000, the family has $22,000 remaining."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Supply and Demand",
    "question": "Demand for tomatoes rises after a festival is announced, but recent flooding has reduced the harvest. What price pressure is most likely if other conditions remain similar?",
    "options": [
      "Prices may rise because demand increased while available supply decreased.",
      "Prices must fall because festivals always reduce the number of buyers.",
      "Prices cannot change when demand and supply change at the same time.",
      "Prices will equal farmers' rainfall totals rather than market conditions."
    ],
    "correctAnswer": 0,
    "explanation": "More demand combined with reduced supply generally creates upward pressure on price when other conditions remain similar."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Profit Comparison",
    "question": "A vendor earns $28,000 from sales and pays $19,000 in costs one week. The next week sales are $32,000 and costs are $25,000. Which week has the greater profit?",
    "options": [
      "Week one, by $2,000",
      "Week one, by $9,000",
      "Week two, by $2,000",
      "Week two, by $7,000"
    ],
    "correctAnswer": 0,
    "explanation": "Week one profit is $9,000 and week two profit is $7,000, so week one is greater by $2,000."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Imports and Local Production",
    "question": "A restaurant replaces some imported herbs with suitable herbs grown by nearby farmers. What is one likely local economic effect?",
    "options": [
      "More of the restaurant's spending may become income for local producers.",
      "The herbs stop being goods because they were produced within Jamaica.",
      "The restaurant can no longer buy any imported item for its other needs.",
      "Local farmers lose every market when a restaurant buys their produce."
    ],
    "correctAnswer": 0,
    "explanation": "Buying suitable locally grown herbs directs part of the restaurant's spending to nearby producers and supports local income."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Taxation and Services",
    "question": "A community requests better garbage collection but also argues that no one should contribute through taxes or service charges. What trade-off should be recognized?",
    "options": [
      "Reliable public services require resources, so funding choices affect what can be provided.",
      "Reliable collection depends mainly on household sorting, so public funding is a separate issue.",
      "Service charges should cover private waste only, while taxes should fund unrelated services.",
      "The community can request more collections first and decide how to fund them after service expands."
    ],
    "correctAnswer": 0,
    "explanation": "Garbage collection requires workers, vehicles, fuel and management, so communities and government must consider how services are funded."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism Linkages",
    "question": "A hotel buys fruit locally but imports most furniture and supplies. Which change would most directly strengthen its linkage with local producers?",
    "options": [
      "Identify reliable Jamaican suppliers that can meet suitable quality, quantity and price needs.",
      "Stop buying local fruit so all purchases follow the same import process.",
      "Advertise the hotel overseas without reviewing where its supplies are purchased.",
      "Reduce guest numbers without discussing production needs with local businesses."
    ],
    "correctAnswer": 0,
    "explanation": "Building dependable purchasing relationships with capable Jamaican suppliers would direct more hotel spending into local production."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Credit Decisions",
    "question": "A credit union member can place savings in Account A with easier access or Account B with a higher return but a withdrawal restriction. What should guide the choice?",
    "options": [
      "The member's goal, need for access, expected return and withdrawal conditions",
      "The higher return alone, because access to emergency savings has no value",
      "The easier access alone, without comparing the returns or saving goal",
      "The account name, because conditions and financial needs should not affect the choice"
    ],
    "correctAnswer": 0,
    "explanation": "The suitable account depends on the saver’s purpose and need for access as well as the return and withdrawal conditions."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Cooperative Enterprise",
    "question": "Fishers form a cooperative to share cold-storage costs and market their catch together. Which result would best show that the arrangement is working?",
    "options": [
      "Members reduce spoilage and reach buyers while accounting clearly for shared costs.",
      "Members reach more buyers, but storage losses and unrecorded shared costs continue to increase.",
      "Members reduce spoilage, but each still pays the full storage cost without sharing facilities.",
      "Members receive identical payments even when their catch, quality and agreed contributions differ."
    ],
    "correctAnswer": 0,
    "explanation": "Reduced spoilage, improved market access and transparent sharing of costs would demonstrate practical benefits from cooperation."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Evaluating Economic Choices",
    "question": "A town considers a weekend market that may create income but will require sanitation, traffic control and security. Which plan best evaluates the proposal?",
    "options": [
      "Estimate likely sales only, since public-service costs are unrelated to the market.",
      "Reject the market because every new activity creates some public cost.",
      "Compare expected local benefits, operating costs, public-service needs and ways to manage impacts.",
      "Approve it permanently after one busy weekend without collecting further evidence."
    ],
    "correctAnswer": 2,
    "explanation": "A balanced evaluation compares economic opportunities with operating and public-service costs and considers practical ways to manage the effects."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix10Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix10Questions)
      : prepareSocialStudiesPreview(g5SsMix10Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 10",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 10</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 10</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 10</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
