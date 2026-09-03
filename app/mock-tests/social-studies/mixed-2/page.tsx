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

const g5SsMix2Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Recall",
    "question": "Which National Hero founded the Universal Negro Improvement Association (UNIA)?",
    "options": [
      "Norman Manley",
      "Paul Bogle",
      "Sam Sharpe",
      "Marcus Garvey"
    ],
    "correctAnswer": 3,
    "explanation": "Marcus Mosiah Garvey founded the UNIA in 1914, championing Black pride, Pan-Africanism, and self-reliance for Black people globally."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Recall",
    "question": "Who was the ONLY FEMALE National Hero of Jamaica?",
    "options": [
      "Mary Seacole",
      "Nanny of the Maroons",
      "Louise Bennett",
      "Millicent Fawcett"
    ],
    "correctAnswer": 1,
    "explanation": "Queen Nanny led the Windward Maroons in guerrilla resistance against the British in the early 18th century and is Jamaica's only female National Hero."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Recall",
    "question": "The Taino people called Jamaica 'Xaymaca.' What does this name mean?",
    "options": [
      "Island of Sunshine",
      "Land of Wood and Water",
      "Place of Many Fruits",
      "Home of the Strong"
    ],
    "correctAnswer": 1,
    "explanation": "Xaymaca means 'Land of Wood and Water,' describing Jamaica's lush forests and abundant rivers — a Taino description of their island home."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Analysis",
    "question": "HOW did the Triangular Trade connect Europe, Africa, and the Americas?",
    "options": [
      "Europe sent enslaved people to Africa; Africa sent goods to the Americas",
      "It was a shipping route with no fixed direction",
      "Europe sent manufactured goods to Africa; Africa supplied enslaved people to the Americas; the Americas sent raw materials (sugar, tobacco) back to Europe",
      "The Americas traded directly with Europe only"
    ],
    "correctAnswer": 2,
    "explanation": "The Triangular Trade was a three-cornered system: goods from Europe traded for enslaved people in Africa; enslaved Africans sent to the Americas; raw materials produced by their unpaid labour sent back to Europe."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Cause & Effect",
    "question": "WHY did thousands of Jamaicans migrate to Britain in the 1950s and 1960s?",
    "options": [
      "Britain expelled Jamaicans from Jamaica",
      "Jamaicans were fleeing natural disasters",
      "Britain actively recruited Caribbean workers to fill post-war labour shortages — Jamaicans went seeking economic opportunity and better living standards",
      "Jamaicans were required to migrate by law"
    ],
    "correctAnswer": 2,
    "explanation": "The 1948 British Nationality Act gave Commonwealth citizens the right to live in Britain. With Jamaica offering limited post-war opportunities and Britain recruiting workers, the Windrush generation made the journey."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Cultural Analysis",
    "question": "How does the JONKANOO festival demonstrate cultural resilience?",
    "options": [
      "Jonkanoo was created by the British",
      "It has no African roots",
      "Jonkanoo preserved West African masquerade traditions under slavery — enslaved people maintained cultural identity through this festival even when denied almost everything else",
      "Jonkanoo was created after emancipation"
    ],
    "correctAnswer": 2,
    "explanation": "Cultural resilience: enslaved Africans found ways to maintain community and cultural expression. Jonkanoo preserved African spiritual and artistic traditions under the eyes of enslavers, surviving into the modern era."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Significance",
    "question": "Why is 1944 — the year of Universal Adult Suffrage — a landmark in Jamaican history?",
    "options": [
      "Jamaica gained independence in 1944",
      "1944 was when slavery ended",
      "For the first time, ALL adults could vote regardless of property, literacy, or gender — ordinary Jamaicans gained real political power for the first time",
      "1944 is not particularly significant"
    ],
    "correctAnswer": 2,
    "explanation": "Before 1944, voting was limited by property and literacy requirements that excluded most Jamaicans. Universal suffrage democratised politics and gave ordinary people the power to elect governments accountable to them."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Evaluating Sources",
    "question": "A planter's diary from 1825 says his enslaved workers are 'happy and content.' Why should a historian be deeply sceptical?",
    "options": [
      "Planters were always honest",
      "Diaries are the most reliable sources",
      "The planter had every incentive to believe or claim his workers were content — enslaved people could not safely express dissatisfaction. This diary reflects the planter's self-image, not the enslaved people's reality",
      "Planters knew their workers best"
    ],
    "correctAnswer": 2,
    "explanation": "Source evaluation: the power relationship made honest expression impossible for enslaved people. The planter's account tells us about his self-perception or public image, not the lived experience of the enslaved."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Synthesis",
    "question": "What connects the MAROON WAR, the BAPTIST WAR, and the MORANT BAY REBELLION?",
    "options": [
      "They were all defeated with no consequences",
      "They were all in the same year",
      "All three were organised acts of resistance against oppression — demonstrating that Jamaicans consistently refused to accept injustice passively across different eras and circumstances",
      "They were all led by the same leader"
    ],
    "correctAnswer": 2,
    "explanation": "A thread of resistance runs through Jamaican history: different eras, different methods, different leaders — but the same refusal to accept oppression. This continuity of resistance is central to Jamaican identity."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Legacy",
    "question": "How does Jamaica's PLANTATION LEGACY continue to shape the country TODAY?",
    "options": [
      "The plantation era ended completely in 1838",
      "Jamaica has fully overcome its colonial past",
      "Concentrated land ownership, wealth inequality, dependence on agricultural and tourism exports, and limited industrial development all trace directly to the plantation economy — legacies that still challenge Jamaica's development",
      "The plantation era made Jamaica one of the world's wealthiest nations"
    ],
    "correctAnswer": 2,
    "explanation": "Historical legacies are not just past events — land ownership patterns, export dependence, and social inequalities rooted in slavery continue to shape Jamaica's economic and social landscape."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Recall",
    "question": "Which county is located in WESTERN Jamaica?",
    "options": [
      "Surrey",
      "Middlesex",
      "Cornwall",
      "Portland"
    ],
    "correctAnswer": 2,
    "explanation": "Cornwall is the westernmost county, containing parishes including Westmoreland, St. James (Montego Bay), Hanover, and Trelawny."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Recall",
    "question": "What is the CAPITAL CITY of Jamaica?",
    "options": [
      "Montego Bay",
      "Spanish Town",
      "Portmore",
      "Kingston"
    ],
    "correctAnswer": 3,
    "explanation": "Kingston is Jamaica's capital and largest city, located on the southeastern coast."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Map Skills",
    "question": "On a topographic map, CLOSELY SPACED contour lines indicate:",
    "options": [
      "Very flat terrain",
      "A river valley",
      "Very steep terrain where elevation changes rapidly over a short distance",
      "An urban area"
    ],
    "correctAnswer": 2,
    "explanation": "The spacing of contour lines indicates slope steepness. Close together = steep; far apart = gentle slope."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Cause & Effect",
    "question": "A town's main river is polluted by a factory located upstream. What is the MOST IMMEDIATE impact on the town?",
    "options": [
      "The river becomes cleaner downstream",
      "No impact — rivers clean themselves",
      "The town's water supply is threatened — contaminated water can cause health problems for residents and kill fish that fishing families depend on",
      "Only the factory is affected"
    ],
    "correctAnswer": 2,
    "explanation": "Upstream pollution flows downstream. Communities below a polluting source face contaminated water for drinking, bathing, irrigation, and fishing — immediate and serious consequences."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Environmental Analysis",
    "question": "WHY is the COCKPIT COUNTRY in central Jamaica important to protect?",
    "options": [
      "It has no significance",
      "It is the flattest area of Jamaica",
      "It is a unique limestone (karst) landscape with extraordinary biodiversity, underground rivers, Maroon heritage, and watersheds that supply water to surrounding communities",
      "It is where most Jamaicans live"
    ],
    "correctAnswer": 2,
    "explanation": "The Cockpit Country is ecologically, culturally, and hydrologically vital — its unique geology supports endemic species, its forests generate water, and its valleys sheltered the Maroons. It is internationally recognised as a priority for protection."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Spatial Reasoning",
    "question": "WHY do MOST of Jamaica's tourist resorts cluster along the NORTH COAST?",
    "options": [
      "North coast is closer to the USA",
      "North coast has a cooler climate",
      "The north coast has sandy beaches, clear turquoise water, and scenic mountain backdrops — natural assets that make it the classic Caribbean tourism product",
      "North coast has better roads"
    ],
    "correctAnswer": 2,
    "explanation": "Tourism geography follows physical geography: beaches, clear water, and scenic landscapes drive resort location. The north coast's natural assets make it Jamaica's prime tourism zone."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Caribbean",
    "question": "Which country is Jamaica's NEAREST neighbour?",
    "options": [
      "Haiti",
      "Puerto Rico",
      "Trinidad",
      "Cuba"
    ],
    "correctAnswer": 3,
    "explanation": "Cuba lies approximately 145 km north of Jamaica — its nearest Caribbean neighbour."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Environmental Impact",
    "question": "Rising sea levels threaten Jamaica's coastlines. Which communities face the GREATEST risk?",
    "options": [
      "Mountain communities",
      "All communities equally",
      "Low-lying coastal communities — like parts of Portmore and Kingston — face the greatest risk of flooding, saltwater intrusion, and loss of beaches",
      "Only tourist resorts are threatened"
    ],
    "correctAnswer": 2,
    "explanation": "Differential vulnerability: sea level rise hits hardest where land is lowest. Portmore, parts of Kingston, and beach resort areas face the most serious threats from flooding and saltwater intrusion."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Policy Analysis",
    "question": "A government considers building a major dam on Jamaica's Black River. What factors should it MOST carefully consider?",
    "options": [
      "Only the cost of construction",
      "Only the amount of electricity generated",
      "The economic benefits (hydropower, water supply, flood control) weighed against the costs: flooding of upstream communities and farmland, disruption of the river ecosystem, and effects on the Black River Morass wetland downstream",
      "Only the views of the construction company"
    ],
    "correctAnswer": 2,
    "explanation": "Dam decision-making requires holistic cost-benefit analysis: power generation and water supply benefits must be weighed against community displacement, ecological disruption, and downstream environmental effects."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Synthesis",
    "question": "A geographer says 'geography shapes history, and history shapes geography.' Give the BEST example of this from Jamaica.",
    "options": [
      "Geography and history are separate",
      "Only history matters in Jamaica",
      "The Blue Mountains provided refuge for Maroon communities (geography shaped history); the Maroons' farming, paths, and land use changed the mountain landscape over centuries (history reshaped geography) — both forces act on each other",
      "Geography never changes"
    ],
    "correctAnswer": 2,
    "explanation": "Human-environment interaction is bidirectional. The Blue Mountains determined Maroon survival strategies (geography shaped history), and Maroon occupation over centuries changed vegetation, paths, and land use (history shaped geography)."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Recall",
    "question": "Jamaica's Parliament consists of which TWO houses?",
    "options": [
      "The Cabinet and Senate",
      "The House of Representatives and Senate",
      "The Senate and Judiciary",
      "The House of Representatives and Cabinet"
    ],
    "correctAnswer": 1,
    "explanation": "Jamaica's Parliament has two chambers: the elected House of Representatives and the appointed Senate."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Recall",
    "question": "What document is the SUPREME LAW of Jamaica?",
    "options": [
      "The Manifesto of the ruling party",
      "The Electoral Act",
      "Jamaica's Constitution",
      "The Order of National Hero Act"
    ],
    "correctAnswer": 2,
    "explanation": "The Constitution is Jamaica's supreme law — all other laws must conform to it, and it cannot be easily changed."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Application",
    "question": "Members of the Senate are appointed rather than elected. Who appoints them?",
    "options": [
      "The Governor General alone",
      "Jamaican citizens in a special vote",
      "The Governor-General formally appoints all 21: 13 on the advice of the Prime Minister and 8 on the advice of the Leader of the Opposition",
      "The Chief Justice"
    ],
    "correctAnswer": 2,
    "explanation": "All 21 Senators are formally appointed by the Governor-General: 13 on the advice of the Prime Minister and 8 on the advice of the Leader of the Opposition."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Rights Application",
    "question": "A school refuses to teach a student because her family follows a different religion. Which right is violated?",
    "options": [
      "The right to work",
      "The right to freedom of movement",
      "The right to education combined with freedom of religion — access to education cannot be withheld on religious grounds",
      "The right to property"
    ],
    "correctAnswer": 2,
    "explanation": "Both freedom of religion and the right to education are protected rights. Discriminating in education access based on religion violates both."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Government Analysis",
    "question": "WHY does Jamaica's Auditor General prepare annual reports?",
    "options": [
      "To embarrass the government",
      "For historical records only",
      "To independently assess whether government agencies use public funds legally, efficiently, and for intended purposes — a key accountability mechanism",
      "To set the government's budget"
    ],
    "correctAnswer": 2,
    "explanation": "The Auditor General provides independent financial oversight of government spending, identifying waste, irregularities, or misuse of public funds and reporting to Parliament."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "CARICOM Analysis",
    "question": "The CARICOM Single Market allows Jamaicans to work in other member states. Which condition applies to this right?",
    "options": [
      "All Jamaicans can work anywhere in CARICOM",
      "Only Jamaican citizens under 30 can migrate",
      "This right primarily applies to University graduates and workers in designated skilled occupations — not all workers have automatic freedom of movement",
      "Only Jamaicans with university degrees from abroad"
    ],
    "correctAnswer": 2,
    "explanation": "CARICOM's free movement of persons initially covers specific skilled categories — university graduates, media workers, sports persons, artists, musicians, and others. It does not yet cover all workers equally."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Rights Analysis",
    "question": "A student argues: 'My rights end where your rights begin.' What does this mean?",
    "options": [
      "Rights are limitless",
      "Only one person can have rights at a time",
      "Rights are not absolute — exercising your rights must not infringe the equally valid rights of others. Rights exist within a framework of mutual respect and legal limits",
      "Governments set all limits on rights"
    ],
    "correctAnswer": 2,
    "explanation": "Rights are relational — freedom of speech doesn't entitle you to defame; freedom of movement doesn't entitle you to trespass. The concept of rights includes corresponding limits that protect others' rights."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Constitutional Analysis",
    "question": "A government uses an 'emergency' to suspend elections for two years. What principle does this violate?",
    "options": [
      "It violates the right to work",
      "It is a reasonable emergency measure",
      "It violates the constitutional requirement for regular elections and the democratic principle that governments derive their authority from the consent of the governed",
      "Only the UN can object to this"
    ],
    "correctAnswer": 2,
    "explanation": "Suspending elections undermines the foundation of democracy — governments govern by consent, expressed through regular elections. No emergency justifies indefinite denial of the public's right to choose their government."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Civic Reasoning",
    "question": "Why might CIVIC EDUCATION in schools be important for Jamaica's democracy?",
    "options": [
      "It is a waste of school time",
      "Children are not citizens",
      "Informed citizens who understand their rights, duties, and how government works are better equipped to participate, hold government accountable, and defend democratic institutions — democracy requires an engaged citizenry",
      "Only adults need to know about democracy"
    ],
    "correctAnswer": 2,
    "explanation": "Democratic health depends on informed participation. Civic education builds the knowledge and skills for active citizenship — understanding rights, how to vote, and how to engage with institutions — which sustains democracy across generations."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Rule of Law",
    "question": "WHY is it important that EVERYONE — including the Prime Minister — must obey the law?",
    "options": [
      "Leaders should be above the law for efficiency",
      "Only ordinary citizens need to follow laws",
      "The rule of law applies equally to all — if leaders are above the law, citizens lose protection against state abuse and the entire concept of equal justice becomes meaningless",
      "Only the Constitution applies to the Prime Minister"
    ],
    "correctAnswer": 2,
    "explanation": "The rule of law's power lies in its universality — when leaders are exempt, law becomes a tool of the powerful rather than a protection for all. Equal accountability, including of leaders, is essential to democratic legitimacy."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Recall",
    "question": "Which sector of the economy involves MAKING goods from raw materials?",
    "options": [
      "Primary",
      "Tertiary",
      "Secondary (manufacturing)",
      "Quaternary"
    ],
    "correctAnswer": 2,
    "explanation": "Secondary activities transform raw materials into manufactured products — refining bauxite into alumina, milling sugar, or producing rum are examples."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Recall",
    "question": "What is SUBSISTENCE FARMING?",
    "options": [
      "Farming for large-scale export",
      "Farming using modern machinery only",
      "Growing just enough food for the farmer's own family with little or no surplus to sell",
      "Farming with chemical fertilisers"
    ],
    "correctAnswer": 2,
    "explanation": "Subsistence farming produces food primarily for personal/family consumption — contrasted with commercial farming where the goal is selling for profit."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Application",
    "question": "A student wins $50,000. She deposits it in a credit union at 6% annual interest. How much interest will she earn after ONE YEAR?",
    "options": [
      "$3,000",
      "$6,000",
      "$300",
      "$30,000"
    ],
    "correctAnswer": 0,
    "explanation": "6% of $50,000 = $3,000 interest earned after one year."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Supply & Demand",
    "question": "During the October school holiday, hotel prices in Montego Bay RISE significantly. The BEST explanation is:",
    "options": [
      "Hotels are greedier in October",
      "The government raises prices in holidays",
      "Demand increases during the holiday as more tourists want to visit — higher demand with the same supply of rooms pushes prices up",
      "Hotels close some rooms in October"
    ],
    "correctAnswer": 2,
    "explanation": "Basic demand and supply: when demand rises (holiday season) and supply stays fixed (same number of hotel rooms), prices rise. This is the market's mechanism for allocating scarce resources."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Economic Reasoning",
    "question": "A Jamaican entrepreneur starts a local food brand using only Jamaican ingredients. What is the ECONOMIC BENEFIT beyond her own profit?",
    "options": [
      "No additional benefit",
      "Only she benefits",
      "She creates local farm employment, keeps supply-chain spending within Jamaica, reduces import costs for ingredients, and builds a Jamaican brand asset — money circulates locally rather than leaking out",
      "Only the government benefits from local businesses"
    ],
    "correctAnswer": 2,
    "explanation": "Local businesses create economic multiplier effects: they purchase locally (supporting farmers), employ locally (creating wages), and build local economic capacity — money circulates rather than leaking to foreign suppliers."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Interdependence",
    "question": "Jamaica imports nearly all its petroleum. What RISK does this create?",
    "options": [
      "No risk — imports are always reliable",
      "Jamaica has plenty of oil",
      "Jamaica is highly vulnerable to global oil price shocks — when oil prices rise internationally, electricity, transport, and manufacturing costs all increase, affecting the entire economy",
      "Only the government is affected"
    ],
    "correctAnswer": 2,
    "explanation": "Energy import dependence creates structural economic vulnerability. Every sector that uses energy (all of them) is exposed to global price volatility — a major reason Jamaica invests in renewables."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Community Development",
    "question": "A credit union lends money to community members at lower rates than commercial banks. Why can it afford to do this?",
    "options": [
      "It borrows at lower rates from government",
      "Credit unions operate at a loss",
      "As a member-owned cooperative, profits return to members as lower interest rates or dividends rather than going to external shareholders — the cooperative structure creates member benefit",
      "Credit unions use cheaper staff"
    ],
    "correctAnswer": 2,
    "explanation": "Cooperative economics: member-ownership means profits stay within the member community. Without external shareholders demanding returns, credit unions can offer better terms to borrowing members."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Policy Evaluation",
    "question": "Jamaica reduces tariffs on imported chicken as part of a trade deal. Who BENEFITS and who may be HARMED?",
    "options": [
      "Everyone benefits equally",
      "Only the government benefits",
      "Consumers benefit from cheaper chicken; local poultry farmers face cheaper competition and may lose market share — the trade-off between consumer benefit and producer protection is real",
      "Only foreign companies benefit"
    ],
    "correctAnswer": 2,
    "explanation": "Trade liberalisation creates winners and losers. Lower tariffs on imported chicken benefit consumers (lower prices) but harm local producers who cannot compete with cheaper (often subsidised) imports."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Fiscal Reasoning",
    "question": "Jamaica has high national debt. When significant tax revenue goes to debt interest payments, which citizens are MOST AFFECTED?",
    "options": [
      "Only wealthy citizens",
      "All citizens equally",
      "Citizens who depend most on public services — healthcare, education, roads — bear the greatest cost when debt interest crowds out government spending",
      "Only the government is affected"
    ],
    "correctAnswer": 2,
    "explanation": "Debt service crowds out public spending. The citizens most affected are those most dependent on government services — typically lower-income Jamaicans who cannot privately purchase the education, healthcare, and infrastructure the government would otherwise provide."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Sustainable Development",
    "question": "Which BEST describes SUSTAINABLE DEVELOPMENT?",
    "options": [
      "Development that maximises economic growth regardless of cost",
      "Development that only protects the environment",
      "Development that meets present economic, social, and environmental needs without compromising the ability of future generations to meet theirs",
      "Development funded by foreign aid only"
    ],
    "correctAnswer": 2,
    "explanation": "Sustainable development balances three pillars simultaneously: economic growth, social equity, and environmental protection. Compromising any one undermines the others — all three must advance together."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsMix2Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsMix2Questions)
      : prepareSocialStudiesPreview(g5SsMix2Questions, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 2",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Mixed 2</CardTitle>
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
              <p className="text-slate-600">Social Studies Mixed 2</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Mixed 2</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
