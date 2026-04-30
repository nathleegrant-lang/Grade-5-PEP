"use client"

import { useState, useEffect, useCallback } from "react"
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
    id: 1,
    type: "history",
    skill: "Recall",
    question: `Jamaica's national fruit is the:`,
    options: [
      "Mango",
      "Banana",
      "Ackee",
      "Pineapple",
    ],
    correctAnswer: 2,
    explanation: `The ackee (originally from West Africa) is Jamaica's national fruit and forms half of the national dish — ackee and saltfish.`
  },
  {
    id: 2,
    type: "history",
    skill: "Cause & Effect",
    question: `WHY did formerly enslaved people NOT receive land after emancipation in 1838?`,
    options: [
      "They all chose to continue living on plantations",
      "Land was given but refused",
      "Plantations were privately owned — the British government compensated the enslavers (not the enslaved) and made no provision for land redistribution, leaving the formerly enslaved landless and dependent",
      "Land was not important to Jamaicans",
    ],
    correctAnswer: 2,
    explanation: `Emancipation without land reform left the formerly enslaved economically vulnerable. Compensation went to the enslavers; the enslaved received freedom but no resources — perpetuating dependence on plantation wages.`
  },
  {
    id: 3,
    type: "history",
    skill: "Cause & Effect",
    question: `What was the DIRECT EFFECT of the abolition of the slave trade in 1807 (not slavery itself)?`,
    options: [
      "All enslaved people were freed",
      "Planters freed their enslaved workers voluntarily",
      "No new enslaved Africans could be brought to Jamaica, but those already enslaved remained so — sometimes under harsher conditions as planters could no longer replace those who died",
      "The plantation system ended immediately",
    ],
    correctAnswer: 2,
    explanation: `The 1807 Act stopped the transatlantic trade but not slavery itself. Those already enslaved remained so, and planters — unable to replace workers — sometimes intensified exploitation.`
  },
  {
    id: 4,
    type: "history",
    skill: "Analysis",
    question: `What made the Maroons' guerrilla warfare effective against British forces?`,
    options: [
      "Superior weapons",
      "Professional military training",
      "Superior knowledge of Jamaica's mountain terrain — they used narrow passes, thick forest, and the Blue Mountains to defeat much larger, better-equipped British forces",
      "They had more soldiers",
    ],
    correctAnswer: 2,
    explanation: `The Maroons compensated for smaller numbers and fewer weapons with tactical brilliance: using terrain knowledge, ambush, and mobility that the British couldn't match in unfamiliar mountains.`
  },
  {
    id: 5,
    type: "history",
    skill: "Analysis",
    question: `How did INDENTURED LABOURERS from India contribute to modern Jamaican culture?`,
    options: [
      "They had no cultural impact",
      "They returned home completely",
      "They brought curry, roti, and other foods; Hindi and Bhojpuri words entered Jamaican Creole; Hindu festivals like Diwali became part of Jamaican life; their descendants are part of 'Out of Many, One People'",
      "Indian culture and Jamaican culture remain completely separate",
    ],
    correctAnswer: 2,
    explanation: `The East Indian community profoundly enriched Jamaican culture: curry goat is a staple, roti is widely eaten, Diwali is celebrated, and Hindi loanwords appear in Jamaican Creole — genuine cultural fusion.`
  },
  {
    id: 6,
    type: "history",
    skill: "Significance",
    question: `Why is 1494 (Columbus's arrival in Jamaica) considered a TURNING POINT?`,
    options: [
      "Because Columbus was a great explorer",
      "Because it led to the discovery of gold",
      "It marks the beginning of European colonisation — initiating the chain of events: Taino devastation, Spanish settlement, British conquest, slavery, and emancipation — that created modern Jamaica",
      "Because the Taino began farming in 1494",
    ],
    correctAnswer: 2,
    explanation: `1494 is a hinge year — before it, Jamaica was a Taino society of approximately 60,000 people; after it, a chain of colonisation and exploitation transformed the island into the Jamaica we know today.`
  },
  {
    id: 7,
    type: "history",
    skill: "Source Analysis",
    question: `A student finds an 1800s church mission report describing enslaved Jamaicans as 'grateful for Christian civilisation.' This source is MOST useful for:`,
    options: [
      "Learning how enslaved Jamaicans truly felt",
      "Proving that enslaved people were happy",
      "Understanding the ideology of the missionaries who wrote it — their belief in 'civilising' colonised peoples, which justified the colonial project",
      "As a factual account of enslaved life",
    ],
    correctAnswer: 2,
    explanation: `Source analysis: the mission report tells us about the missionaries' ideology and self-justification, not the enslaved people's views. Using it to understand missionary ideology (not enslaved experience) is the appropriate application.`
  },
  {
    id: 8,
    type: "history",
    skill: "Evaluating Legacy",
    question: `A student argues that 'Jamaica's Coat of Arms proves colonialism left positive things.' A more nuanced historian would say:`,
    options: [
      "The student is completely correct",
      "Everything colonial must be rejected",
      "The Coat of Arms reflects complex history — the Taino figures represent pre-colonial heritage; the colonial-era design reflects Jamaica choosing which symbols to retain in building national identity. Retaining colonial symbols doesn't mean endorsing colonialism",
      "Colonial symbols have no meaning today",
    ],
    correctAnswer: 2,
    explanation: `Nuanced heritage analysis: post-colonial societies choose which historical symbols to retain, adapt, or reject in building national identity. The Coat of Arms is a conscious selection, not passive acceptance of colonialism.`
  },
  {
    id: 9,
    type: "history",
    skill: "Contrafactual",
    question: `If Jamaica had REMAINED in the Federation of the West Indies in 1962, what is MOST LIKELY to have been different?`,
    options: [
      "Nothing — federation or independence, outcomes are the same",
      "Jamaica would have become richer",
      "Jamaica would not have had full control over its own economic, education, and social policies — national development priorities would have needed negotiation within the federation rather than being set independently",
      "Jamaica would have become a US territory",
    ],
    correctAnswer: 2,
    explanation: `Independence gave Jamaica full sovereignty — the power to set its own policies. Remaining in the federation would have required ongoing negotiation of competing interests among member states, limiting Jamaica's ability to prioritise its own needs.`
  },
  {
    id: 10,
    type: "history",
    skill: "Recall",
    question: `In which year was the Slavery Abolition Act passed by the British Parliament?`,
    options: [
      "1807",
      "1820",
      "1833",
      "1838",
    ],
    correctAnswer: 2,
    explanation: `The Slavery Abolition Act was passed in 1833, taking effect on August 1, 1834. Full freedom came with the end of Apprenticeship on August 1, 1838.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Policy Reasoning",
    question: `A government invests heavily in roads connecting rural parishes to Kingston. What development argument supports this?`,
    options: [
      "Roads are always a waste of money",
      "Only Kingston needs investment",
      "Better connectivity allows rural communities to access markets, education, healthcare, and employment — breaking the cycle of isolation that compounds rural poverty and inequality",
      "Roads always cause deforestation",
    ],
    correctAnswer: 2,
    explanation: `Transport infrastructure is a development multiplier: connectivity allows rural communities to participate in the wider economy — selling produce, accessing services, and attracting investment. It addresses spatial inequality directly.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Caribbean Analysis",
    question: `Why are SMALL ISLAND DEVELOPING STATES (SIDS) like Jamaica particularly VULNERABLE to climate change?`,
    options: [
      "Small islands are always poor",
      "Climate change only affects large countries",
      "Limited land area, high coastal population exposure, dependence on imports (affected by global disruption), vulnerability to hurricanes, and limited financial capacity to adapt — all these factors compound for small islands",
      "Islands are protected by the sea from climate effects",
    ],
    correctAnswer: 2,
    explanation: `SIDS face a perfect storm of vulnerability: small land area means sea level rise is proportionally devastating; coastal exposure is total; limited GDP constrains adaptation investment; and economic structure (tourism, agriculture) is highly climate-sensitive.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Synthesis",
    question: `WHY do geographers argue that studying environmental geography is ESSENTIAL for understanding Jamaica's economic development?`,
    options: [
      "Geography has nothing to do with economics",
      "Environment only matters for nature tourism",
      "Jamaica's key economic sectors — tourism (beaches, climate), agriculture (soils, rainfall), fisheries (marine ecosystem), water supply (watersheds), and energy (solar, wind potential) — are all fundamentally shaped by its physical geography. You cannot understand the economy without the environment",
      "Geography only matters for map reading",
    ],
    correctAnswer: 2,
    explanation: `Environmental geography is economic geography in Jamaica's case: beaches drive tourism, watersheds drive water supply, soils drive agriculture, marine ecosystems drive fisheries. The economy is built on its physical geography — understanding one requires the other.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Recall",
    question: `Which parish is known as Jamaica's 'Garden Parish' for its agricultural productivity?`,
    options: [
      "Manchester",
      "St. Thomas",
      "St. Elizabeth",
      "Westmoreland",
    ],
    correctAnswer: 2,
    explanation: `St. Elizabeth in southwest Jamaica is Jamaica's most productive agricultural parish, known for its fertile soils and the Black River irrigation system.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Recall",
    question: `What type of rock makes up most of the COCKPIT COUNTRY in central Jamaica?`,
    options: [
      "Granite",
      "Sandstone",
      "Volcanic rock",
      "Limestone (karst)",
    ],
    correctAnswer: 3,
    explanation: `The Cockpit Country is composed of karst limestone — porous rock that dissolves in rainwater, creating the unique cone hills and underground cave systems.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Recall",
    question: `The BLACK RIVER is notable because it is:`,
    options: [
      "Jamaica's longest river",
      "Jamaica's highest river",
      "The only navigable river in Jamaica",
      "Jamaica's fastest-flowing river",
    ],
    correctAnswer: 2,
    explanation: `The Black River in St. Elizabeth is Jamaica's most navigable river, flowing through the Black River Morass (wetland) — Jamaica's largest wetland.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Map Skills",
    question: `A map scale of 1:50,000 means that 1 cm on the map equals how many metres in reality?`,
    options: [
      "50 metres",
      "500 metres",
      "5,000 metres",
      "500,000 metres",
    ],
    correctAnswer: 1,
    explanation: `1:50,000 means 1 unit on the map = 50,000 units in reality. 1 cm = 50,000 cm = 500 metres (0.5 km).`
  },
  {
    id: 18,
    type: "geography",
    skill: "Cause & Effect",
    question: `A mining company removes bauxite from a hillside, removing all trees and vegetation. What combination of problems is MOST LIKELY to follow?`,
    options: [
      "Better soil quality and more rainfall",
      "No consequences",
      "Soil erosion (exposed soil washed away), increased flooding downstream (no forest to absorb rain), loss of biodiversity, and degradation of the watershed supplying water to nearby communities",
      "Only the mining area is affected",
    ],
    correctAnswer: 2,
    explanation: `Deforestation for mining causes cascading environmental problems: erosion, flooding, biodiversity loss, and watershed degradation — each consequence amplifying the others.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Spatial Analysis",
    question: `Jamaica's south coast (e.g., Clarendon) is generally DRIER than the north coast (e.g., Portland). What SPECIFIC geographic feature creates this difference?`,
    options: [
      "The south coast is farther from the sea",
      "The north coast has more rivers",
      "The Blue Mountains act as a barrier — trade winds drop rain on the windward (north) slopes; the leeward (south) side is in a rain shadow and receives much less rainfall",
      "The south coast is at lower elevation",
    ],
    correctAnswer: 2,
    explanation: `The Blue Mountains create a pronounced rain shadow. Moist trade winds release rain on north-facing slopes (Portland receives over 5,000 mm/year) while the south sits in the dry leeward zone.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environmental Analysis",
    question: `Mangrove forests along Jamaica's coast are being cleared for resort development. WHY should this concern a range of people beyond just environmentalists?`,
    options: [
      "Only environmentalists should care",
      "Mangroves are ugly and unimportant",
      "Mangroves protect coastlines from storm surge (protecting resorts themselves), provide nursery habitat for fish (affecting fishing communities), filter coastal water (affecting tourism and health), and store carbon — their loss harms multiple sectors beyond the development site",
      "Mangroves only affect marine biologists",
    ],
    correctAnswer: 2,
    explanation: `Mangrove valuation shows how ecosystem services benefit multiple stakeholders: coastal protection, fisheries, water quality, and climate regulation. Clearing them for resorts may destroy the very conditions that make the location attractive.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Rights vs Duties",
    question: `A student says: 'I have the right to free speech, so I can say anything I want.' What is MISSING from this understanding?`,
    options: [
      "Nothing — free speech is absolute",
      "The student should not speak publicly",
      "Rights come with responsibilities — freedom of speech does not protect deliberate lies that harm others, incitement to violence, or speech that violates others' rights. Rights exist within a framework of mutual respect",
      "Students should not discuss rights",
    ],
    correctAnswer: 2,
    explanation: `Rights literacy requires understanding limits as well as entitlements. Free speech is broad but not absolute — defamation, incitement, and hate speech are recognised limits that protect others' equally valid rights.`
  },
  {
    id: 22,
    type: "civics",
    skill: "CARICOM",
    question: `CARICOM member states cooperate on DISASTER RESPONSE. Why is this more effective than individual response?`,
    options: [
      "Individual states always respond faster",
      "CARICOM has no disaster response role",
      "Small island states individually have limited resources — sharing personnel, equipment, expertise, and early warning systems through CDEMA (Caribbean Disaster Emergency Management Agency) allows faster, better-resourced response than any single state could mount alone",
      "Only large countries need disaster cooperation",
    ],
    correctAnswer: 2,
    explanation: `Regional cooperation pools resources that individual small states cannot maintain: specialised equipment, trained personnel, and coordinated logistics. The 2004 Grenada hurricane response and COVID-19 coordination demonstrated this value.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Constitutional Analysis",
    question: `The Prime Minister of Jamaica can be removed from office if:`,
    options: [
      "The Governor General decides to remove them",
      "The Prime Minister loses a vote of no confidence in the House of Representatives",
      "The Supreme Court dismisses them",
      "The Senate votes to remove them",
    ],
    correctAnswer: 1,
    explanation: `If the Prime Minister loses the confidence of the House of Representatives (through a vote of no confidence), they must resign or advise the Governor General to dissolve Parliament and call new elections.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Civic Education",
    question: `A student attends a town hall meeting, asks questions about a proposed development, and signs a petition against it. This demonstrates:`,
    options: [
      "Illegal behaviour",
      "Wasting time",
      "Active, informed citizenship — using legitimate civic channels to participate in decisions that affect the community",
      "Only adults should attend town halls",
    ],
    correctAnswer: 2,
    explanation: `This is precisely what active citizenship looks like: attending public meetings, asking questions, and using petition rights — all legitimate democratic tools for community participation.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Policy Analysis",
    question: `WHY might freedom of the press SOMETIMES conflict with national security interests?`,
    options: [
      "It never conflicts",
      "National security always overrides press freedom",
      "Journalists investigating corruption, arms deals, or intelligence activities may expose information governments claim is sensitive — the question of which interest (public's right to know vs state security) should prevail involves genuine competing values with no simple answer",
      "Press freedom is absolute",
    ],
    correctAnswer: 2,
    explanation: `Press freedom and state security are legitimate values that genuinely conflict: the public's right to know about government activity vs the government's duty to protect sensitive information. Courts must balance these competing claims case by case.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Evaluating Institutions",
    question: `Why might some Jamaicans argue that Jamaica should REPLACE the Privy Council (UK) with the Caribbean Court of Justice as its final court of appeal?`,
    options: [
      "Privy Council costs are too high",
      "The UK is too far away geographically",
      "Using the Caribbean Court of Justice as the final court would replace the colonial-era connection to British justice with a regionally owned institution that may better understand Caribbean law, culture, and circumstances",
      "The Privy Council makes wrong decisions",
    ],
    correctAnswer: 2,
    explanation: `The CCJ debate is about judicial sovereignty and cultural competence: having the Caribbean's highest court in the Caribbean, staffed by Caribbean-trained jurists who understand regional context, is the sovereignty argument. Jamaica has not yet made this change.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Recall",
    question: `How many members does Jamaica's SENATE have?`,
    options: [
      "13",
      "15",
      "21",
      "30",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's Senate has 21 members: 13 appointed by the Prime Minister and 8 by the Leader of the Opposition.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Recall",
    question: `What is CARICOM?`,
    options: [
      "A Caribbean sports federation",
      "A type of Caribbean currency",
      "The Caribbean Community and Common Market — an organisation of Caribbean nations promoting economic integration and cooperation",
      "A Caribbean military alliance",
    ],
    correctAnswer: 2,
    explanation: `CARICOM (Caribbean Community and Common Market) was established in 1973 to promote regional economic integration, cooperation, and shared services among Caribbean nations.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Recall",
    question: `Which institution in Jamaica MAKES the laws?`,
    options: [
      "The Judiciary",
      "The Cabinet",
      "Parliament (the Legislature)",
      "The Governor General alone",
    ],
    correctAnswer: 2,
    explanation: `Parliament — comprising the Senate and House of Representatives — is Jamaica's law-making body (the Legislature).`
  },
  {
    id: 30,
    type: "civics",
    skill: "Application",
    question: `A citizen is denied employment because of her race. Which right is violated?`,
    options: [
      "The right to property",
      "The right to vote",
      "The right to non-discrimination and equal treatment under the law",
      "The right to privacy",
    ],
    correctAnswer: 2,
    explanation: `Racial discrimination in employment violates the constitutional right to equality and non-discrimination — a fundamental protection in Jamaica's Charter of Fundamental Rights and Freedoms.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Reasoning",
    question: `Jamaica earns US$3.5 billion from tourism annually. Why might only US$1.5 billion of this truly benefit the Jamaican economy?`,
    options: [
      "Tourism money always stays in Jamaica",
      "The government takes half in taxes",
      "Economic leakage: profits sent abroad by foreign hotel owners, wages paid to foreign staff, imported food and supplies, and savings by foreign investors all leave Jamaica — reducing the net economic benefit",
      "Tourism only benefits Kingston",
    ],
    correctAnswer: 2,
    explanation: `The gap between gross and net tourism earnings is 'leakage' — money that leaves Jamaica through foreign ownership, imported content, and repatriated profits. Building local supply chains and Jamaican ownership reduces leakage.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A young Jamaican creates a mobile app that helps farmers sell directly to consumers. What type of economic impact does this have?`,
    options: [
      "Only the creator benefits",
      "This reduces economic activity",
      "It creates multiple benefits: farmers earn more (cut out middlemen), consumers may pay less, the creator earns revenue, and the app creates new economic linkages between producers and consumers — tech entrepreneurship can reshape value chains",
      "Apps have no economic impact",
    ],
    correctAnswer: 2,
    explanation: `Platform entrepreneurship can restructure value chains: connecting farmers directly to consumers eliminates intermediary costs, increasing farmer income and potentially reducing consumer prices, while creating a new business at the intersection.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Development Analysis",
    question: `Jamaica's GDP grows by 2% but the economy's INCOME DISTRIBUTION worsens (the rich get richer, the poor get poorer). What does this reveal about GDP as a development measure?`,
    options: [
      "GDP growth always benefits everyone",
      "2% growth is too low to matter",
      "GDP measures aggregate output, not distribution — a country can grow economically while inequality worsens. Genuine development requires measuring not just how much is produced but how it is distributed",
      "GDP is the only measure that matters",
    ],
    correctAnswer: 2,
    explanation: `GDP growth ≠ development if all gains go to the wealthy. Inclusive growth — reaching all income groups — requires tracking distribution (Gini coefficient), poverty rates, and access to services alongside GDP.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Environmental Economics",
    question: `A fishing community overfishes a reef and catches fall to zero within three years. This is an example of:`,
    options: [
      "Successful commercial fishing",
      "Good economic management",
      "The tragedy of the commons — when a shared resource is exploited without collective management, individual rational decisions lead to collective ruin as the resource is depleted beyond recovery",
      "Government mismanagement only",
    ],
    correctAnswer: 2,
    explanation: `The tragedy of the commons: each fisher rationally maximises their catch, but collectively they deplete the reef. Without collective management (catch limits, closed seasons), individual rationality produces collective disaster.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Policy Evaluation",
    question: `Jamaica's government provides FREE primary education. What economic JUSTIFICATION supports this policy?`,
    options: [
      "Education is too expensive for government",
      "Free education creates market distortions",
      "Education has positive externalities — a more educated workforce raises productivity, reduces crime, improves health outcomes, and enables economic development. Markets would underprovide education without government support because individuals cannot capture all the social benefits",
      "Only private education produces quality",
    ],
    correctAnswer: 2,
    explanation: `Public economics: education has large positive externalities (benefits to society beyond the individual). Because individuals cannot capture all these benefits, private markets underprovide education. Government provision corrects this market failure.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Synthesis",
    question: `Why is FINANCIAL INCLUSION — ensuring all Jamaicans have access to banking, savings, and credit — important for reducing poverty?`,
    options: [
      "Banking is only for businesses",
      "Poor people don't need banking",
      "Without banking, the poor cannot save safely, cannot access credit to invest in businesses or emergencies, cannot receive payments electronically, and are vulnerable to loss. Financial inclusion enables the poor to build, protect, and grow their resources — a foundation for escaping poverty",
      "Only large banks can reduce poverty",
    ],
    correctAnswer: 2,
    explanation: `Financial exclusion traps people in poverty: no safe savings means consumption of assets in crises; no credit means inability to invest in productive activities; no insurance means vulnerability to shocks. Financial inclusion is a poverty-reduction multiplier.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Recall",
    question: `What is an ENTREPRENEUR?`,
    options: [
      "An employee who works for a large company",
      "A government official who manages the economy",
      "A person who organises resources, takes risks, and starts a new business",
      "A person who only invests in stocks",
    ],
    correctAnswer: 2,
    explanation: `An entrepreneur organises the factors of production (land, labour, capital), accepts financial risk, and launches a new business in pursuit of profit and opportunity.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Recall",
    question: `What are Jamaica's THREE main economic sectors?`,
    options: [
      "Tourism, finance, and construction",
      "Agriculture, manufacturing, and services",
      "Primary (mining/farming), secondary (manufacturing), and tertiary (services)",
      "Export, import, and banking",
    ],
    correctAnswer: 2,
    explanation: `All economies are analysed across three sectors: primary (extracting natural resources), secondary (manufacturing/processing), and tertiary (services like tourism, education, healthcare).`
  },
  {
    id: 39,
    type: "economics",
    skill: "Recall",
    question: `What does the BANK OF JAMAICA regulate?`,
    options: [
      "Schools and universities",
      "Roads and infrastructure",
      "The banking and financial sector, monetary policy, and currency",
      "The police and defence forces",
    ],
    correctAnswer: 2,
    explanation: `The Bank of Jamaica (BOJ) is the central bank: it issues currency, sets monetary policy, manages foreign exchange reserves, and supervises commercial banks and financial institutions.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Application",
    question: `A student calculates that starting a small business requires $200,000 investment but will generate $50,000 profit per year. How many years before she recoups her investment?`,
    options: [
      "2 years",
      "4 years",
      "5 years",
      "10 years",
    ],
    correctAnswer: 1,
    explanation: `$200,000 investment ÷ $50,000 annual profit = 4 years to recoup the initial investment.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "recall, cause & effect, significance, critical evaluation across all levels" },
  { type: "geography" as const, label: "Geography & Environment",     note: "map skills, spatial reasoning, environmental analysis, decision-making" },
  { type: "civics" as const,    label: "Civics & Government",         note: "rights, duties, constitutional knowledge, democratic principles" },
  { type: "economics" as const, label: "Economics & Community",       note: "economic concepts, reasoning, trade-offs, community development" },
]

export default function G5SsMix6MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsMix6Questions : g5SsMix6Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

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
  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

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
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60)
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
            <Button onClick={() => setStarted(true)} className="w-full bg-green-700 py-6 text-lg hover:bg-green-800">Start Test</Button>
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
              ? <Button onClick={() => setShowResults(true)} className="bg-green-700 hover:bg-green-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
