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

const g5SsMix9Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "National Heroes",
    "question": "Which achievement is most closely associated with Nanny of the Maroons?",
    "options": [
      "Leading Maroon resistance and helping preserve freedom in the mountains",
      "Founding the Universal Negro Improvement Association in 1914",
      "Leading the 1865 march from Stony Gut to Morant Bay",
      "Serving as Jamaica's first Prime Minister after Independence"
    ],
    "correctAnswer": 0,
    "explanation": "Nanny is honoured for leadership of the Windward Maroons and resistance that helped defend Maroon freedom."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Timeline Calculation",
    "question": "Approximately how many years passed between full freedom in 1838 and the Morant Bay Rebellion in 1865?",
    "options": [
      "17 years",
      "27 years",
      "37 years",
      "127 years"
    ],
    "correctAnswer": 1,
    "explanation": "Subtracting 1838 from 1865 gives 27 years between full freedom and the Morant Bay Rebellion."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Corroborating Evidence",
    "question": "An old diary says a harbour became busier after a new trade route opened. Which evidence would best help confirm the claim?",
    "options": [
      "Shipping records showing changes in the number of vessels and cargo handled",
      "Merchants' letters describing expectations before the route opened but giving no later traffic totals",
      "A map showing the harbour and route but giving no dates or amounts of trade",
      "A later visitor's account describing busy streets without identifying harbour activity"
    ],
    "correctAnswer": 0,
    "explanation": "Shipping records provide independent evidence about vessel and cargo activity and can be compared with the diary's claim."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Colonial Transition",
    "question": "A land record uses Spanish names in an early entry and English legal terms in entries made after 1655. What is the strongest inference?",
    "options": [
      "The document records evidence of the transition from Spanish to English colonial control.",
      "The English entries prove that Jamaica gained Independence during the 1600s.",
      "The Spanish entries were written after English rule had permanently ended.",
      "The language change proves that every resident immediately stopped speaking Spanish."
    ],
    "correctAnswer": 0,
    "explanation": "The change from Spanish naming to English legal language after 1655 is evidence of the shift in colonial administration."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Baptist War Sources",
    "question": "A planter's letter blames the Baptist War on a few troublemakers. Testimony from several participants describes meetings and demands for freedom. How should a historian use these sources?",
    "options": [
      "Accept the planter's letter alone because property ownership removes bias.",
      "Accept the participants' testimony alone because agreement guarantees complete accuracy.",
      "Compare both accounts and test their claims against further contemporary evidence.",
      "Discard both accounts because sources from opposing perspectives cannot be studied together."
    ],
    "correctAnswer": 2,
    "explanation": "Both sources may contain useful evidence and particular viewpoints, so their claims should be compared and checked against additional contemporary records."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Emancipation Experience",
    "question": "A person was legally freed from slavery in 1834 but required to continue working under Apprenticeship. Which statement best describes the person's position in 1836?",
    "options": [
      "The person lived under Apprenticeship before full freedom arrived in 1838.",
      "The person had already gained the complete freedom later marked in 1838.",
      "The person remained legally enslaved because abolition did not occur in 1834.",
      "The person was voting under Universal Adult Suffrage introduced in 1944."
    ],
    "correctAnswer": 0,
    "explanation": "Slavery was abolished in 1834, but Apprenticeship continued until 1838, so an apprentice in 1836 had not yet received full freedom."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Morant Bay Cause and Effect",
    "question": "Complaints about poverty, land access and justice were repeatedly ignored before the Morant Bay protest. Which lesson about cause and effect is best supported?",
    "options": [
      "Long-standing unresolved grievances can contribute to protest and conflict.",
      "A protest proves that every complaint made beforehand was identical.",
      "Ignoring grievances guarantees that communities will remain peaceful.",
      "Land and justice concerns cannot influence political events."
    ],
    "correctAnswer": 0,
    "explanation": "The evidence supports a link between unresolved social and economic grievances and the growth of protest in 1865."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Labour Reform",
    "question": "After the 1938 labour unrest, membership in trade unions grew and political organizations gained support. What change does this pattern indicate?",
    "options": [
      "Workers became less interested in organized representation after the protests.",
      "Organized labour and political participation became stronger forces for reform.",
      "Jamaica returned to Spanish administration to settle wage disagreements.",
      "Voting rights were permanently removed from working adults."
    ],
    "correctAnswer": 1,
    "explanation": "Growth in unions and political organizations indicates that collective representation became increasingly important in demands for reform."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Voting Participation",
    "question": "A chart shows that many more adults could register for Jamaica's 1944 election than for an earlier election. Which development best explains the increase?",
    "options": [
      "The ending of full freedom and return to Apprenticeship",
      "The transfer of Jamaica from English rule to Spanish rule",
      "The introduction of Universal Adult Suffrage",
      "The replacement of Parliament by Municipal Corporations"
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage removed former property and income restrictions, greatly expanding the adult population eligible to vote."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Continuity and Change",
    "question": "Which statement best describes both change and continuity when Jamaica became independent in 1962?",
    "options": [
      "Jamaica gained national self-government while retaining some parliamentary institutions and traditions.",
      "Jamaica remained a colony and gained no responsibility for national affairs.",
      "Every earlier institution disappeared and was replaced on Independence Day.",
      "Independence restored the system of Spanish colonial administration."
    ],
    "correctAnswer": 0,
    "explanation": "Independence transferred responsibility for national government to Jamaica, while some established parliamentary institutions and traditions continued."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Route Distance",
    "question": "A map scale is 1 cm to 6 km. Route A measures 5 cm and Route B measures 7 cm. How much longer is Route B?",
    "options": [
      "2 kilometres",
      "10 kilometres",
      "12 kilometres",
      "42 kilometres"
    ],
    "correctAnswer": 2,
    "explanation": "The routes differ by 2 centimetres on the map. At 6 kilometres per centimetre, Route B is 12 kilometres longer."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Compass Direction",
    "question": "A fishing boat travels south from a harbour and then the same distance west. In which general direction is it from the harbour?",
    "options": [
      "North-east",
      "North-west",
      "South-east",
      "South-west"
    ],
    "correctAnswer": 3,
    "explanation": "Moving south and then west places the boat south-west of the harbour."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Population Evidence",
    "question": "Village P's population rose from 800 to 1,000 while Village Q's remained at 900. Which statement is supported?",
    "options": [
      "Village P increased by 200 and now has 100 more people than Village Q.",
      "Village Q increased by 100 and now has more people than Village P.",
      "Both villages increased by the same number of residents.",
      "Village P lost 200 residents while Village Q gained 900."
    ],
    "correctAnswer": 0,
    "explanation": "Village P gained 200 residents and reached 1,000, which is 100 more than Village Q's unchanged population of 900."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Storm-Surge Planning",
    "question": "A coastal shelter is strong but lies inside the storm-surge evacuation zone. What is the most important planning response?",
    "options": [
      "Use it because building strength removes the danger from rising coastal water.",
      "Identify an accessible shelter outside the surge zone and plan transport to it.",
      "Wait for water to enter the shelter before announcing another location.",
      "Move supplies there because a full building is harder for water to affect."
    ],
    "correctAnswer": 1,
    "explanation": "A strong building can still be unsafe in a storm-surge zone, so planners need an accessible shelter outside the exposed area."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "River Monitoring",
    "question": "Students observe muddy river water after hillside clearing. Which monitoring plan would best test whether erosion is increasing?",
    "options": [
      "Compare water clarity and sediment after rain before and after clearing and at an uncleared site.",
      "Record river colour once during dry weather and make a permanent conclusion.",
      "Count hillside houses without measuring rainfall, runoff or river sediment.",
      "Interview one passer-by without collecting observations from the river."
    ],
    "correctAnswer": 0,
    "explanation": "Repeated measurements before and after clearing, together with an uncleared comparison site, provide stronger evidence about erosion."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Settlement Patterns",
    "question": "Several settlements developed along a flat valley containing a river and main road. Which explanation is most reasonable?",
    "options": [
      "The valley offered water, easier building land and transport access.",
      "The valley prevented travel, farming and access to water.",
      "Settlers chose it because steep slopes make every journey shorter.",
      "Road and river access have no influence on settlement location."
    ],
    "correctAnswer": 0,
    "explanation": "Flat land, water and transport routes can support farming, construction, movement and trade, attracting settlement."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Coastal Trade-offs",
    "question": "A community proposes a seawall to protect one beach. Which question should be investigated before construction?",
    "options": [
      "Whether the wall may change erosion or wave effects along neighbouring shores",
      "Whether the wall can be built quickly enough to protect this beach before the next high tide",
      "Whether the protected beach will receive more visitors after the wall is completed",
      "Whether residents near this beach prefer a wall to restoring coastal vegetation"
    ],
    "correctAnswer": 0,
    "explanation": "Coastal structures can alter wave action and sediment movement, so effects on neighbouring shorelines should be investigated."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Land Capability",
    "question": "A steep hillside has thin soil, while a nearby gentle slope has deeper soil. Which land use is generally more suitable?",
    "options": [
      "Intensive cultivation on the steep thin soil without erosion controls",
      "Buildings on the steepest land because foundations need the least support there",
      "Cultivation on suitable gentler land while protecting the steeper slope",
      "Removing vegetation from both slopes before assessing soil or runoff"
    ],
    "correctAnswer": 2,
    "explanation": "Gentler land with deeper soil is generally more suitable for cultivation, while protecting steep slopes reduces erosion risk."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Climate Data",
    "question": "Why are thirty years of temperature and rainfall records more useful for describing climate than observations from one week?",
    "options": [
      "Long records reveal usual patterns and variations over many seasons.",
      "One week contains every weather condition a place can experience.",
      "Climate describes only the most recent day of atmospheric conditions.",
      "Long-term records remove all differences between places."
    ],
    "correctAnswer": 0,
    "explanation": "Climate concerns long-term patterns, so records covering many years and seasons are more representative than a single week."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Environmental Decisions",
    "question": "A wetland reduces flooding and provides wildlife habitat, but a proposal would fill it for parking. Which evidence should decision-makers weigh?",
    "options": [
      "Parking demand only, because flood control and habitat have no community value",
      "Wetland flood-storage and habitat value, parking need, alternatives and long-term costs",
      "The proposed car-park name without examining either site's function",
      "Wildlife counts only, without considering flooding, access or alternative parking"
    ],
    "correctAnswer": 1,
    "explanation": "A careful decision compares the wetland's environmental services with parking needs, possible alternatives and long-term community costs."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Constituency Representation",
    "question": "An MP receives different views from farmers, shopkeepers and students about a proposed law. What should the MP do as a representative?",
    "options": [
      "Consider the evidence and explain the constituency's concerns during parliamentary work.",
      "Listen only to the group that donated the most money to a private event.",
      "Transfer the final parliamentary vote to whichever group is largest locally.",
      "Ignore local views because representation ends immediately after an election."
    ],
    "correctAnswer": 0,
    "explanation": "Representation involves considering constituents' evidence and concerns while carrying out parliamentary responsibilities and explaining decisions."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Parliamentary Committees",
    "question": "A parliamentary committee invites specialists and members of the public to comment on a bill. What is the main value of this step?",
    "options": [
      "It allows evidence and possible effects to be examined before final decisions.",
      "It allows witnesses to replace Parliament and enact the bill themselves.",
      "It guarantees that no member may suggest changes after the hearing.",
      "It turns the committee into a court deciding criminal guilt."
    ],
    "correctAnswer": 0,
    "explanation": "Committee review can gather evidence, expertise and public perspectives to inform Parliament's consideration of proposed legislation."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Local and National Roles",
    "question": "Which pairing assigns each concern to the more appropriate first point of contact?",
    "options": [
      "Blocked local drain—Municipal Corporation; proposed national law—Member of Parliament",
      "Blocked local drain—Member of Parliament; proposed national law—Municipal Corporation",
      "Blocked local drain—national ministry; proposed national law—community association",
      "Blocked local drain—court office; proposed national law—local market committee"
    ],
    "correctAnswer": 0,
    "explanation": "Municipal Corporations manage many local services such as drainage, while MPs represent constituents in national parliamentary matters."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Judicial Fairness",
    "question": "A judge has a close financial connection to one side in a case. Which action best protects confidence in a fair hearing?",
    "options": [
      "Inform only the connected party, then continue hearing the case without a public record.",
      "Disclose the conflict and follow the proper process for stepping aside where required.",
      "Ask another court employee to review the connection, but keep sole control of the final decision.",
      "Continue with the case if both sides promise not to mention the financial connection."
    ],
    "correctAnswer": 1,
    "explanation": "Disclosing a conflict and following rules about stepping aside protects impartiality and public confidence in the court."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Public Information",
    "question": "Residents receive two different figures for the cost of a public project. What is the most responsible next step?",
    "options": [
      "Share the larger figure as fact because it attracts more attention.",
      "Assume both figures are correct without checking what each includes.",
      "Request the authorized records and compare dates, items and totals.",
      "Delete both figures so no one can discuss public spending."
    ],
    "correctAnswer": 2,
    "explanation": "Checking authorized records and comparing what each figure covers helps residents evaluate the discrepancy accurately."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Emergency Rules and Rights",
    "question": "During a dangerous chemical spill, officials temporarily close a road. Which evidence would best show that the restriction is responsible?",
    "options": [
      "The closure addresses a documented safety risk, is reviewed and lasts no longer than necessary.",
      "The closure has no stated safety purpose and cannot be questioned or reviewed.",
      "The closure continues after the danger ends because reopening requires planning.",
      "The closure applies differently according to residents' political opinions."
    ],
    "correctAnswer": 0,
    "explanation": "A temporary restriction should address a genuine risk, be proportionate and reviewed, and end when it is no longer necessary."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Governor-General",
    "question": "Which activity is an example of the Governor-General's formal constitutional role rather than personal policy-making?",
    "options": [
      "Giving formal assent to a bill adopted through Parliament",
      "Writing a political party's election manifesto",
      "Choosing the budget of each Municipal Corporation personally",
      "Directing judges how to decide individual cases"
    ],
    "correctAnswer": 0,
    "explanation": "Giving formal assent to legislation passed through Parliament is one of the Governor-General's constitutional duties."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Community Oversight",
    "question": "A notice promises ten streetlights, but residents observe that only six were installed. Which evidence should they present when seeking an explanation?",
    "options": [
      "The notice, dated photographs or locations, and a clear count of completed work",
      "A recent photograph of six lights without the notice showing how many were promised",
      "The notice and a neighbour's estimate made without checking each installation location",
      "A petition requesting more lights without evidence about the ten already promised"
    ],
    "correctAnswer": 0,
    "explanation": "The official notice and documented observations directly compare the public promise with the work residents can verify."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Regional Citizenship",
    "question": "A Jamaican applies for an approved opportunity under a CARICOM arrangement. Which expectation is most accurate?",
    "options": [
      "Membership removes every application, qualification and immigration requirement.",
      "The person should follow the arrangement's eligibility, documentation and national procedures.",
      "The person automatically becomes a citizen of every CARICOM member state.",
      "The person may ignore the laws of the receiving country while participating."
    ],
    "correctAnswer": 1,
    "explanation": "CARICOM arrangements can create regional opportunities, but applicants must meet applicable eligibility, documentation and national procedures."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Participation and Compromise",
    "question": "Two groups want to use the community hall at the same time. Which solution best demonstrates fair civic problem-solving?",
    "options": [
      "Give permanent priority to the group whose leader speaks most loudly.",
      "Cancel both activities without asking whether the schedule can change.",
      "Compare needs and agree on a workable schedule or shared arrangement.",
      "Allow one group to lock the hall before the other group arrives."
    ],
    "correctAnswer": 2,
    "explanation": "Fair problem-solving involves hearing both groups, comparing needs and seeking a practical schedule or shared arrangement."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Business Costs",
    "question": "A small bakery pays the same monthly rent but buys more flour when it produces more bread. Which statement is correct?",
    "options": [
      "Rent is a fixed cost for the month, while flour cost varies with production.",
      "Flour is fixed because every loaf uses ingredients, while rent varies per loaf.",
      "Both costs vary only when the bakery changes its selling price.",
      "Neither rent nor flour affects the bakery's production decisions."
    ],
    "correctAnswer": 0,
    "explanation": "Monthly rent remains the same within the example, while the amount spent on flour changes as the bakery produces more or less bread."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Budget Percentages",
    "question": "A community group has $40,000. It spends 25% on materials and $18,000 on labour. How much remains?",
    "options": [
      "$10,000",
      "$12,000",
      "$18,000",
      "$22,000"
    ],
    "correctAnswer": 1,
    "explanation": "Twenty-five percent of $40,000 is $10,000. After subtracting $10,000 and $18,000, the group has $12,000 remaining."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Production Evidence",
    "question": "A farmer tests two plots. Plot A produces 80 kg using $4,000 of inputs; Plot B produces 90 kg using $6,000. What should the farmer compare before expanding?",
    "options": [
      "Output, input cost, selling price and whether the results can be repeated",
      "Output and selling price only, without checking whether higher input costs reduce the gain",
      "Input cost and plot size only, without estimating income from the harvest",
      "The first trial's profit only, without checking whether weather or soil made the result unusual"
    ],
    "correctAnswer": 0,
    "explanation": "A decision about expansion should consider both output and costs, expected selling prices and whether the trial results are reliable."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Exports and Income",
    "question": "A Jamaican craft business begins selling products to customers overseas. Which transaction brings export income into Jamaica?",
    "options": [
      "The overseas customers pay the Jamaican business for crafts sent abroad.",
      "The business buys imported tools from an overseas supplier.",
      "The business pays shipping charges to a foreign company.",
      "The owner buys an overseas product for personal use."
    ],
    "correctAnswer": 0,
    "explanation": "Selling Jamaican products to overseas customers is an export and brings payment for those goods into the Jamaican business."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Consumer Response",
    "question": "The price of one brand of cereal rises while a similar brand's price stays the same. What might price-conscious shoppers do?",
    "options": [
      "Buy more of the higher-priced brand because price increases remove alternatives.",
      "Switch to the similar lower-priced brand if it meets their needs.",
      "Stop comparing products because similar goods cannot compete.",
      "Require both companies to produce exactly the same quantity."
    ],
    "correctAnswer": 1,
    "explanation": "When similar substitutes are available, price-conscious consumers may switch toward the option that offers a lower price and meets their needs."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tax Revenue",
    "question": "Which example best shows tax revenue providing a shared public benefit?",
    "options": [
      "A private shopper uses personal savings to buy shoes.",
      "A business owner keeps sales income for household spending.",
      "Government funds repairs to a public health clinic used by the community.",
      "A visitor buys a meal from a privately owned restaurant."
    ],
    "correctAnswer": 2,
    "explanation": "Using public revenue to repair a community health clinic provides a service that can benefit many members of the public."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism and Local Spending",
    "question": "A visitor pays a local guide, who then buys lunch from a nearby cook. What does this sequence illustrate?",
    "options": [
      "Tourism spending can circulate through more than one local business.",
      "The guide's spending changes the visitor's payment into an import.",
      "Local purchases prevent the cook from earning income.",
      "Money can benefit only the first person who receives it."
    ],
    "correctAnswer": 0,
    "explanation": "The visitor's payment becomes income for the guide, and part of it then becomes income for the cook, circulating locally."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Cooperative Purchasing",
    "question": "Six shopkeepers each need delivery boxes. Why might buying the boxes together through a cooperative arrangement lower their cost?",
    "options": [
      "A larger combined order may qualify for a lower price per box.",
      "A combined order may spread the same delivery charge across fewer boxes for each shopkeeper.",
      "The supplier may charge the same total while allowing each shopkeeper to delay payment.",
      "Buying together may reduce the number of separate orders without changing the price per box."
    ],
    "correctAnswer": 0,
    "explanation": "Combining orders can give members greater buying power and may reduce the price charged for each box."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Saving Goals",
    "question": "Leah wants to save $9,000 in six months and has already saved $3,000. If she saves equal amounts each month, how much more must she save monthly?",
    "options": [
      "$500",
      "$1,000",
      "$1,500",
      "$2,000"
    ],
    "correctAnswer": 1,
    "explanation": "Leah needs $6,000 more. Dividing $6,000 by six months gives a monthly saving of $1,000."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Community Economic Choices",
    "question": "A town can repair a market roof now or keep paying for temporary coverings after each storm. Which comparison best supports a long-term decision?",
    "options": [
      "Compare repair cost, repeated temporary costs, safety and expected useful life.",
      "Choose temporary coverings because each single payment appears smaller.",
      "Choose the roof repair without checking its quality, price or expected life.",
      "Ignore storm damage because future costs should not affect today's choice."
    ],
    "correctAnswer": 0,
    "explanation": "A long-term decision should compare the full repair cost and benefits with repeated temporary costs, safety and durability."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix9Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix9Questions)
      : prepareSocialStudiesPreview(g5SsMix9Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 9",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 9</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 9</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 9</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
