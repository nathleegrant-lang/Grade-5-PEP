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

const g5SsDiff3Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Source Bias",
    question: `A planter's diary from 1830 describes his enslaved workers as 'content and well cared for.' Why should a historian treat this source with deep scepticism?`,
    options: [
      "Planters were always honest",
      "Diaries are always accurate",
      "The planter had every incentive to believe — or pretend — his workers were content. The diary reflects his self-image, not the enslaved people's reality. The very system prevented the enslaved from safely expressing discontent",
      "Planters were experts on the people they enslaved",
    ],
    correctAnswer: 2,
    explanation: `This is a critical source analysis question: the diary tells us about the planter's self-perception or public performance, not the enslaved people's inner lives. Comparing this with accounts from the enslaved people themselves reveals the distortion.`
  },
  {
    id: 2,
    type: "history",
    skill: "Historical Change",
    question: `How did Jamaica's ECONOMY change between the early 18th century (sugar dominance) and the late 20th century (tourism dominance)?`,
    options: [
      "The economy never changed significantly",
      "Sugar remains Jamaica's largest industry",
      "The economy shifted from a plantation-based monoculture (sugar for export) to a service-based economy (tourism as the major earner) — both involve dependence on a single dominant sector and foreign demand, creating similar structural vulnerabilities",
      "Jamaica became fully self-sufficient in the 20th century",
    ],
    correctAnswer: 2,
    explanation: `This synthesis question draws a structural comparison: both sugar and tourism represent dependence on a dominant external-facing sector. The economic logic (vulnerability to external demand, limited local ownership, leakage) repeats across different eras.`
  },
  {
    id: 3,
    type: "history",
    skill: "Historical Empathy — Complexity",
    question: `A formerly enslaved woman, newly free in 1838, faces choices: stay on the plantation for wages, seek land in the hills, or migrate to town. What factors would MOST influence her decision?`,
    options: [
      "She would immediately become wealthy",
      "She would return to Africa",
      "Access to land, family ties, skills, the wage offered, and safety — complex practical considerations, not just the desire for freedom, would shape her realistic options in a society that still concentrated land and power in planter hands",
      "She had unlimited choices",
    ],
    correctAnswer: 2,
    explanation: `Historical empathy requires understanding constraints. Freedom in 1838 was real but limited — land was concentrated, wages were low, and discrimination continued. Real choices were shaped by resources, family, and the practical landscape of a post-emancipation society that retained plantation-era power structures.`
  },
  {
    id: 4,
    type: "history",
    skill: "Synthesis — Cultural Heritage",
    question: `How do the MAROON communities today represent BOTH continuity AND change from their origins?`,
    options: [
      "Maroons have not changed at all",
      "Maroons have completely lost their heritage",
      "Continuity: they maintain their distinct governance, ceremonies (Kromanti), and identity. Change: they engage with the modern Jamaican state, tourism economy, and the world in ways their founders could not have imagined — heritage and adaptation coexist",
      "Maroons are only relevant to historians",
    ],
    correctAnswer: 2,
    explanation: `The Maroon example is a study in living heritage — traditions sustained and adapted over centuries. Their governance structure and ceremonies are continuous; their economic and political engagement with modern Jamaica represents change. Both are real.`
  },
  {
    id: 5,
    type: "history",
    skill: "Evaluating Evidence",
    question: `A student finds THREE sources about the 1865 Morant Bay Rebellion: a colonial government report, a Baptist missionary's diary, and an oral account from a descendant of participants. Which approach is BEST?`,
    options: [
      "Use only the official colonial report",
      "Ignore all three — they are all biased",
      "Use all three critically — each perspective reveals different aspects of the event. The colonial report shows official justifications, the missionary adds a different outside view, and the oral tradition preserves community memory that official records excluded",
      "Use only the most recent source",
    ],
    correctAnswer: 2,
    explanation: `Historical methodology: triangulating multiple sources — including official records, outsider accounts, and community memory — gives a richer, more complete picture than relying on any single source. Each contributes something the others cannot.`
  },
  {
    id: 6,
    type: "history",
    skill: "Contested Heritage",
    question: `Some Jamaicans argue that streets and buildings named after colonial figures should be renamed. Others argue that changing names erases history. Which is the MOST nuanced position?`,
    options: [
      "All colonial names should remain",
      "All colonial names should be removed immediately",
      "Both perspectives raise valid concerns — renaming can honour those previously excluded while preserving history through museums, plaques, and education. Renaming is not erasing; it is re-prioritising whose story dominates public space",
      "Historical names cannot be changed",
    ],
    correctAnswer: 2,
    explanation: `Heritage debates are not binary. Physical renaming reclaims public space for those previously excluded, while educational contexts can preserve knowledge of colonial history. The most nuanced position acknowledges both the symbolic power of naming and the imperative to include all of a community's history.`
  },
  {
    id: 7,
    type: "history",
    skill: "Multi-Perspective Analysis",
    question: `The 1807 Abolition of the Slave Trade is celebrated as a humanitarian achievement. Which perspective COMPLICATES this narrative?`,
    options: [
      "No perspective complicates it",
      "All enslaved people were freed in 1807",
      "Planters continued to exploit those already enslaved — sometimes more harshly — since they could no longer import replacements. The 1807 Act benefited the British moral reputation while leaving the institution of slavery intact",
      "Britain immediately lost all profits from slavery",
    ],
    correctAnswer: 2,
    explanation: `The abolition of the TRADE (not slavery itself) is a case study in partial reform — Britain gained moral credit while maintaining the economic system. Enslaved people saw no benefit until 1834/1838.`
  },
  {
    id: 8,
    type: "history",
    skill: "Evaluating Historical Claims",
    question: `A textbook states 'Columbus discovered Jamaica.' Which critique of this claim is MOST valid?`,
    options: [
      "The claim is accurate",
      "Columbus was the first human to see Jamaica",
      "The word 'discovered' is Eurocentric — Columbus arrived on an island already inhabited by the Taino people. 'Discovery' implies the island had no prior existence, erasing thousands of years of Taino history",
      "Columbus should not be studied",
    ],
    correctAnswer: 2,
    explanation: `Language shapes historical understanding. 'Discovered' implies prior non-existence, erasing the Taino. More accurate language — 'Columbus made contact with' or 'arrived at' — acknowledges the pre-existing inhabitants.`
  },
  {
    id: 9,
    type: "history",
    skill: "Synthesis — Resistance",
    question: `What do Nanny, Sam Sharpe, and Paul Bogle have in common that makes them ALL National Heroes?`,
    options: [
      "They all used identical methods",
      "They were all from Kingston",
      "They all led armed resistance against Britain",
      "They all sacrificed their lives or safety in active, organised resistance against injustice — each in their own way and era, refusing to accept oppression passively",
    ],
    correctAnswer: 3,
    explanation: `While their contexts and methods differed, all three actively organised resistance — Nanny through guerrilla warfare, Sharpe through rebellion, Bogle through protest — and paid with their lives. Active resistance to injustice is their shared defining quality.`
  },
  {
    id: 10,
    type: "history",
    skill: "Evaluating Significance",
    question: `Which change was MORE significant for ordinary Jamaicans: emancipation in 1838 OR Universal Adult Suffrage in 1944? Give the BEST reasoned answer.`,
    options: [
      "They are equally significant",
      "Emancipation was clearly more important",
      "Emancipation ended the worst form of oppression but left people without land, political voice, or economic power. Universal Adult Suffrage gave ordinary people a democratic tool to change their conditions — arguably the more practically transformative change in the long run",
      "Universal Adult Suffrage was clearly more important",
    ],
    correctAnswer: 2,
    explanation: `This is a genuine historical debate. Emancipation ended slavery's horror but left structural injustice intact. Universal suffrage gave people a mechanism to address those injustices — democratic power to demand better. Recognising both as significant while analysing the practical impact of suffrage is the most nuanced answer.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Complex Cause & Effect",
    question: `Jamaica experiences a year with NO HURRICANES. Unexpectedly, this causes problems for some farmers. Why?`,
    options: [
      "Farmers always need hurricanes",
      "No hurricanes means perfect farming conditions",
      "Some farmers rely on hurricane season rainfall — if the season is hurricane-free, it often means below-average rainfall overall, causing drought stress for rain-dependent crops",
      "Farmers prefer hurricanes to calm weather",
    ],
    correctAnswer: 2,
    explanation: `This counter-intuitive question tests understanding of Jamaica's rainfall system: hurricane seasons with no storms can mean below-average total rainfall, causing drought. The expectation that 'no hurricane = good for farmers' misunderstands climate patterns.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Evaluating Solutions",
    question: `A student suggests Jamaica should simply 'stop using oil and only use renewables immediately.' Why is this proposal too simplistic?`,
    options: [
      "It is completely achievable immediately",
      "Oil is not important",
      "Transitioning from oil to renewables requires significant investment in generation infrastructure, storage, and grid upgrades; existing vehicles and equipment run on fossil fuels; skills and supply chains need development — a rapid transition without support would cause economic disruption",
      "Jamaica should just import renewable energy",
    ],
    correctAnswer: 2,
    explanation: `Energy transition analysis requires understanding of infrastructure, economics, and timing. Renewable energy is the right long-term direction, but transition requires planning, investment, and a managed timeline — not an overnight switch that would disrupt the economy.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Integrated Analysis",
    question: `A student maps POVERTY RATES, EDUCATIONAL ATTAINMENT, HEALTH OUTCOMES, and DISTANCE FROM SERVICES for Jamaica's parishes and finds they all show the same geographic pattern. What does this reveal?`,
    options: [
      "Coincidence — the maps are unrelated",
      "Geography only affects one development indicator",
      "These overlapping patterns reveal spatial inequality: the same areas face compounding disadvantages across multiple dimensions — poor access to services (healthcare, education) compounds poverty, which limits health, education, and economic opportunity in a reinforcing cycle",
      "Development is equally distributed",
    ],
    correctAnswer: 2,
    explanation: `Overlapping disadvantage maps reveal the compound nature of spatial inequality — not just economic poverty but educational, health, and infrastructure deprivation reinforce each other in the same geographic areas. This is how geographic inequality becomes self-perpetuating.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environmental History",
    question: `Jamaica's mangrove forests have declined by over 30% since 1960. Which COMBINATION of factors BEST explains this?`,
    options: [
      "Mangroves naturally disappeared",
      "Climate change alone caused this",
      "Urban and coastal development, shrimp farming, pollution, and climate change (sea level rise, storm damage) have combined to destroy mangroves — multiple simultaneous pressures overwhelmed the ecosystem's resilience",
      "Only tourism destroyed mangroves",
    ],
    correctAnswer: 2,
    explanation: `Environmental decline is rarely mono-causal. Mangrove loss reflects multiple simultaneous pressures: development physically removes them, pollution degrades water quality, climate change brings sea level rise and stronger storms, and aquaculture replaces them — each factor amplifies the others.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Synthesis — Geography and Society",
    question: `Why do geographers argue that UNDERSTANDING GEOGRAPHY is essential for making GOOD DECISIONS in any field?`,
    options: [
      "Geography is only about maps",
      "Geography only matters for travel",
      "Every decision — urban planning, agriculture, health service delivery, disaster response, economic development — happens in a specific place with specific physical and human characteristics. Ignoring geography means ignoring the context in which decisions play out",
      "Geography is less important than economics",
    ],
    correctAnswer: 2,
    explanation: `Geography provides the spatial context for all human activity. A hospital built without knowledge of catchment population geography serves poorly; a development plan that ignores terrain and watershed risks causes disaster. Geographic literacy is practical decision-making literacy.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Critical Thinking",
    question: `A student reads that Jamaica has the same GDP per capita as some African countries. The student concludes they are 'equally developed.' Why is this conclusion FLAWED?`,
    options: [
      "GDP per capita is the only measure of development",
      "The student is correct",
      "GDP measures average income but ignores distribution (inequality), access to services (health, education), environmental quality, and human wellbeing. Two countries with similar GDPs can have very different qualities of life depending on how wealth is distributed and what services exist",
      "GDP is always the best measure",
    ],
    correctAnswer: 2,
    explanation: `This tests understanding of development measurement. GDP per capita is a blunt instrument: a country where most income goes to a few wealthy people can have the same average as one where wealth is broadly distributed. Genuine development requires examining health, education, inequality, and environmental quality alongside income.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Critical Analysis",
    question: `Jamaica has beautiful beaches, mountains, and a warm climate. Despite this, it still faces significant development challenges. What does this tell us about the relationship between NATURAL RESOURCES and ECONOMIC DEVELOPMENT?`,
    options: [
      "Natural resources automatically create wealth",
      "Beautiful scenery is enough for development",
      "Natural advantages are necessary but not sufficient for development — how resources are managed, owned, and distributed matters enormously. Jamaica's colonial history concentrated resource benefits among a small elite, limiting broader development despite environmental wealth",
      "Jamaica is too small to develop",
    ],
    correctAnswer: 2,
    explanation: `This question challenges the 'resource curse' and 'natural advantage' narratives. Jamaica has significant natural assets, yet structural inequalities, historical legacies, and governance challenges mean these assets have not translated into broad-based prosperity. Development requires institutions, equity, and governance — not just resources.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Environmental Policy",
    question: `A coastal community proposes to dump waste in the sea to save money on waste management. A geographer would identify which consequences?`,
    options: [
      "Sea dumping has no consequences",
      "Only the dumping area is affected",
      "Marine pollution kills coral reefs and fish, harming fishing livelihoods and tourism; currents spread pollutants along the coast; health risks arise from seafood contaminated by waste — the 'out of sight' solution creates widespread, long-term harm",
      "Only tourists are affected",
    ],
    correctAnswer: 2,
    explanation: `Environmental consequence mapping: marine waste pollution is far from 'out of sight out of mind' — it kills productive ecosystems, spreads through currents, contaminates food chains, and harms the industries Jamaica depends on. Understanding interconnected consequences is key.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Spatial Inequality",
    question: `Two parishes — Kingston and Portland — have very different levels of development. Kingston has more hospitals, schools, and roads. What GEOGRAPHIC and HISTORICAL factors explain this?`,
    options: [
      "The difference is purely the result of natural resources",
      "Portland has better natural conditions",
      "Kingston's status as capital concentrated government investment in infrastructure; its commercial importance attracted private investment. Portland's remoteness (mountains, poor road access) limited connectivity and investment. Historical capital status compounds over time",
      "The parishes chose different development paths",
    ],
    correctAnswer: 2,
    explanation: `Spatial inequality in Jamaica reflects historical investment patterns: capital cities attract compounding advantages — government buildings, universities, hospitals, transport hubs — while remote areas face compounding disadvantages. Geography (remoteness, terrain) interacts with history (investment decisions) to create persistent inequality.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environmental Ethics",
    question: `A mining company wants to extract bauxite from an area that is also a community's water source. Which principle should guide the government's decision?`,
    options: [
      "Mining companies always have the right to mine",
      "Communities have no say in mining decisions",
      "The precautionary principle: when an activity threatens the environment on which communities depend, the burden of proof falls on the mining company to demonstrate safety — communities' right to clean water and a healthy environment takes precedence over corporate profit",
      "Economic growth always justifies environmental sacrifice",
    ],
    correctAnswer: 2,
    explanation: `Environmental ethics and international law increasingly apply the precautionary principle: where serious environmental harm is possible, governments should act to prevent it even before full scientific certainty. Community rights to water and environment create strong grounds for caution.`
  },
  {
    id: 21,
    type: "civics",
    skill: "CARICOM — Critical Analysis",
    question: `A student argues: 'CARICOM is useless — Caribbean countries should each act alone.' A more nuanced counter-argument is:`,
    options: [
      "The student is completely correct",
      "CARICOM is perfect and has no weaknesses",
      "Small island states individually have minimal leverage in global trade negotiations, limited resources for disaster response, and small markets — CARICOM gives collective strength that individual members lack. While CARICOM has limitations, collective action is essential for small states navigating a global system designed for large nations",
      "Caribbean countries are too different to cooperate",
    ],
    correctAnswer: 2,
    explanation: `This tests understanding of why small states benefit from regional cooperation: collective negotiating power, pooled resources, shared services. Acknowledging CARICOM's real limitations while explaining its essential value is the most nuanced answer.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Policy Analysis — Human Rights",
    question: `Jamaica's constitution protects the right to education. Despite this, some children still do not attend school regularly. What does this reveal about the relationship between rights and reality?`,
    options: [
      "Constitutional rights automatically guarantee outcomes",
      "If children miss school, they have no rights",
      "Constitutional rights establish entitlements, but realising them requires resources, enforcement, and social conditions — a right written in a constitution doesn't automatically translate into lived reality without investment, monitoring, and addressing the barriers (poverty, distance, disability) that prevent access",
      "Rights only matter for adults",
    ],
    correctAnswer: 2,
    explanation: `This is a sophisticated civic question: the gap between constitutional rights and lived experience is one of the central challenges of governance. Rights must be actively realised through policy, resources, and enforcement — not just declared.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Media and Democracy",
    question: `A politician pressures a radio station to stop broadcasting criticism of their government. Which democratic institution should respond, and how?`,
    options: [
      "This is acceptable — politicians should control media",
      "Only the opposition can respond",
      "The Broadcasting Commission should investigate any interference with editorial independence; the judiciary should protect press freedom; Parliament should scrutinise the politician's conduct; civil society should publicise the pressure — multiple democratic institutions must defend press freedom collectively",
      "Media stations have no rights",
    ],
    correctAnswer: 2,
    explanation: `Press freedom is defended by multiple institutions simultaneously: regulatory bodies (Broadcasting Commission), courts, Parliament, and civil society all play roles. Understanding the multi-institutional nature of rights defence is essential civic knowledge.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Electoral Integrity",
    question: `Which combination of conditions is MOST essential for a genuinely free and fair election?`,
    options: [
      "A large number of candidates",
      "High voter turnout alone",
      "Universal suffrage, secret ballot, independent election management, multiple parties, freedom of campaign, transparent counting, and peaceful acceptance of results — all conditions must be met simultaneously",
      "Only the final vote count matters",
    ],
    correctAnswer: 2,
    explanation: `Electoral integrity requires a complete set of conditions simultaneously: any one missing element can compromise the election. Understanding this as a system — not a checklist — is essential to evaluating democratic quality.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Applying Rights — Complex",
    question: `A government builds a highway that requires demolishing 200 homes. How should this situation be handled according to democratic and legal principles?`,
    options: [
      "Governments can demolish homes without process",
      "Homeowners have no rights when governments need land",
      "Homeowners have constitutional property rights — the government must follow compulsory acquisition procedures, provide fair compensation, give adequate notice, and ensure alternative housing. The process must be lawful, fair, and respectful of affected residents' rights",
      "Only the government's need matters",
    ],
    correctAnswer: 2,
    explanation: `Compulsory acquisition (eminent domain) is a real power governments have, but it must be exercised within constitutional and legal constraints: due process, fair compensation, lawful procedure, and genuine necessity. Constitutional property rights protect citizens even when government needs override individual preferences.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Civic Courage",
    question: `A student witnesses a teacher accepting a bribe from a parent for a better grade. The student is afraid to report it. What principles are in conflict, and what should guide the decision?`,
    options: [
      "The student should stay out of it",
      "Fear always justifies inaction",
      "Civic courage and the duty to uphold institutional integrity (reporting wrongdoing) conflict with personal fear of retaliation. Principles guiding the decision: the harm done to students who earned grades fairly, the damage to the school's integrity, and the availability of confidential reporting channels reduce the personal risk",
      "Only adults have civic duties",
    ],
    correctAnswer: 2,
    explanation: `This question applies civic principles to a personal situation: the student faces a tension between safety and integrity. The most sophisticated response acknowledges the real fear while explaining the civic duty to report wrongdoing and identifying mechanisms (anonymous reporting) that can reduce personal risk.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Evaluating Democratic Health",
    question: `A country holds elections every five years, but has no free press, opposition parties are harassed, and the judiciary does as the government says. Is this a genuine democracy?`,
    options: [
      "Yes — elections are what matter",
      "Elections are irrelevant",
      "No — genuine democracy requires free elections AND an independent judiciary, free press, opposition rights, and constitutional protections. Elections alone, without these conditions, produce 'electoral authoritarianism,' not real democracy",
      "Only wealthy countries can have democracy",
    ],
    correctAnswer: 2,
    explanation: `Democracy requires a full ecosystem: elections, press freedom, judicial independence, opposition rights, civil liberties. Without these, elections can be held regularly while power remains unaccountable. This is a critical distinction for understanding democratic quality.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Rights Hierarchy",
    question: `A government argues that economic development requires limiting some civil liberties temporarily. Which principle should guide this claim?`,
    options: [
      "Economic development always justifies limiting rights",
      "Civil liberties cannot ever be limited under any circumstances",
      "This claim should be scrutinised extremely carefully — history shows that 'temporary' rights limitations often become permanent; rights are most vulnerable during emergencies. Any limitation must be strictly necessary, proportionate, and subject to judicial oversight",
      "Development always matters more than rights",
    ],
    correctAnswer: 2,
    explanation: `This is a critical civil liberties question: governments frequently use development or security justifications to limit rights. Democratic safeguards — necessity, proportionality, judicial oversight, time limits — exist precisely to prevent 'temporary' limitations from becoming permanent.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Constitutional Complexity",
    question: `The Jamaica Constitution says Parliament is supreme (can make any law) BUT ALSO that the Constitution protects fundamental rights. How are these RECONCILED?`,
    options: [
      "They cannot be reconciled — there is a contradiction",
      "Parliament simply ignores the Constitution",
      "Parliament's supremacy is limited by the Constitution itself — Parliament cannot pass laws that violate the Charter of Fundamental Rights. The Constitution is the supreme law, and judicial review ensures Parliament operates within constitutional limits",
      "The Governor General decides which wins",
    ],
    correctAnswer: 2,
    explanation: `This is a sophisticated constitutional question: parliamentary sovereignty in Jamaica is limited sovereignty — Parliament operates within constitutional constraints, and courts enforce those constraints. The Constitution's supremacy over ordinary legislation is the key.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Civic Responsibility and Corruption",
    question: `A government official accepts a bribe to approve a construction project. Beyond the legal violation, what SOCIAL HARMS does corruption cause?`,
    options: [
      "Corruption only harms the person who paid the bribe",
      "Corruption is a personal matter",
      "Corruption undermines public trust in institutions, diverts public resources from services (schools, hospitals, roads) to private gain, creates an uneven playing field that disadvantages honest businesses, and weakens the rule of law that democracy depends on",
      "Corruption is only a financial crime",
    ],
    correctAnswer: 2,
    explanation: `Corruption's social harms extend far beyond any single transaction: it erodes institutional legitimacy, distorts public spending, discourages investment, creates systemic unfairness, and undermines the rule of law. Understanding its systemic nature is key.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Sustainable Development",
    question: `A SWOT analysis of Jamaica's agriculture sector identifies: strengths (fertile soils, good climate, unique products like Blue Mountain Coffee), weaknesses (small farms, limited capital, aging farmers), opportunities (organic/premium markets, agro-tourism), threats (climate change, imported food competition). Which strategy is MOST promising?`,
    options: [
      "Jamaica should abandon agriculture entirely",
      "Jamaica should only grow food for export",
      "Jamaica should focus on high-value niche products (organic, premium, heritage varieties) that can compete on quality rather than price, combine with agro-tourism for additional income, and address weaknesses through farmer cooperatives and credit access",
      "Jamaica should produce only for the domestic market",
    ],
    correctAnswer: 2,
    explanation: `SWOT-based strategy: Jamaica cannot compete on price with large, subsidised foreign producers. Leveraging strengths (unique climate, products) to access premium markets, addressing weaknesses through cooperation, and capitalising on opportunities (organic demand, agro-tourism) is the coherent strategic response.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Economic Justice",
    question: `Why do development economists argue that REDUCING INEQUALITY is not just a moral goal but also an ECONOMIC one?`,
    options: [
      "Inequality only matters morally",
      "High inequality helps economic growth",
      "High inequality: reduces consumer spending (poor people have less to spend), limits social mobility (talent goes undeveloped), increases social costs (crime, health), reduces political stability, and undermines trust that economies need to function. More equal economies tend to have stronger domestic demand and more stable growth",
      "Inequality is a natural economic outcome with no consequences",
    ],
    correctAnswer: 2,
    explanation: `The economics of inequality: beyond fairness arguments, high inequality has concrete economic costs — reduced consumer demand, wasted human capital, higher social expenditures, and political instability that discourages investment. Reducing inequality can be pro-growth, not just pro-justice.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Evaluating Policy",
    question: `Jamaica raises the minimum wage significantly. Businesses argue this will cause unemployment; workers argue it is essential for dignity. Which analysis is MOST accurate?`,
    options: [
      "Minimum wages always destroy jobs",
      "Minimum wages never affect employment",
      "The evidence is mixed: moderate minimum wage increases can improve worker welfare without significant job losses, especially when the economy is near full employment. Very large increases in labour-intensive industries may reduce employment. The effect depends on the industry, the size of the increase, and overall economic conditions",
      "Minimum wages are always good for everyone",
    ],
    correctAnswer: 2,
    explanation: `Minimum wage economics: the simple 'price floor = unemployment' model is too simplistic. Real evidence shows moderate increases have modest employment effects, while substantial increases in already-stressed industries can reduce employment. Context — industry structure, demand elasticity, economic conditions — determines the outcome.`
  },
  {
    id: 34,
    type: "economics",
    skill: "International Development",
    question: `Why might FOREIGN AID sometimes create DEPENDENCY rather than development?`,
    options: [
      "Foreign aid always creates development",
      "Dependency is impossible with aid",
      "Aid that substitutes for domestic revenue (reducing tax effort), creates demand for foreign goods (rather than local production), builds institutions that serve donor rather than local priorities, or lacks coordination with local plans can undermine local capacity rather than build it",
      "Aid only helps rich countries",
    ],
    correctAnswer: 2,
    explanation: `The aid effectiveness debate: aid is most effective when it builds local capacity and systems rather than substituting for them. When aid creates dependency by replacing what domestic institutions should provide, or when aid-funded projects cannot be sustained locally after donor withdrawal, development is undermined.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Synthesis",
    question: `Explain why SUSTAINABLE DEVELOPMENT requires balancing THREE dimensions simultaneously, and why focussing on only one creates problems.`,
    options: [
      "Sustainable development only requires economic growth",
      "Environment is the only dimension that matters",
      "Economic development creates wealth and employment; social development ensures benefits reach all citizens equitably; environmental sustainability ensures resources remain for future generations. Focussing only on economy without environment depletes future resources; without equity, growth doesn't reach the poor; without economy, neither environment nor social goals can be funded",
      "Social goals are irrelevant to development",
    ],
    correctAnswer: 2,
    explanation: `The three pillars of sustainable development are interdependent: economic growth without environmental protection destroys the resource base; without social equity, growth creates inequality and instability; without economic growth, neither social services nor environmental protection can be funded. All three must be advanced simultaneously.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Financial Systems",
    question: `Why do economists argue that FINANCIAL INCLUSION (giving everyone access to banking, credit, and insurance) is important for development?`,
    options: [
      "Only wealthy people need banking",
      "Banking is a luxury, not a necessity",
      "Financial inclusion enables: the poor to save safely (preventing loss), small businesses to access credit (enabling growth), families to protect against shocks (insurance), and governments to deliver payments efficiently. Exclusion from financial systems traps people in cycles of poverty and vulnerability",
      "Only large businesses benefit from finance",
    ],
    correctAnswer: 2,
    explanation: `Financial inclusion is a development multiplier: access to savings protects against shocks, credit enables investment and growth, insurance manages risk, and electronic payments reduce transaction costs. Excluding poor people from financial systems perpetuates poverty by preventing them from managing, protecting, and building their resources.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Cost-Benefit Analysis",
    question: `A town builds a new community centre at a cost of $50 million. It provides jobs, meeting space, and youth programmes. How would you determine if this was a GOOD INVESTMENT of public funds?`,
    options: [
      "$50 million is always too much to spend on a community",
      "Public spending is never a good investment",
      "By comparing total quantified benefits (jobs created, crime reduction, health outcomes, youth development, community cohesion) over the centre's lifetime against the $50 million cost — if lifetime benefits exceed cost, the investment was efficient",
      "Only the government decides if investments are good",
    ],
    correctAnswer: 2,
    explanation: `Public sector cost-benefit analysis requires identifying and quantifying all benefits (direct and indirect) and comparing them to costs over the facility's lifetime. Non-financial benefits like crime reduction and health improvement have economic values that can be estimated.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Entrepreneurship — Risk",
    question: `A Jamaican entrepreneur borrows $1 million to open a restaurant. After one year, revenue covers costs but makes no profit. Should he close?`,
    options: [
      "Always close if there is no profit",
      "Always stay open regardless",
      "Not necessarily — the decision requires analysing trends (is revenue growing?), the loan repayment schedule (is debt manageable?), break-even analysis (how many more customers to profitability?), and alternative opportunities. Year one losses are normal for many businesses if the trajectory is positive",
      "Only the bank should decide",
    ],
    correctAnswer: 2,
    explanation: `Business decision-making under uncertainty: year-one performance must be interpreted in context — trajectory, debt serviceability, and market potential all matter. Closing too soon vs continuing unsustainably both have costs. Systematic analysis, not panic or stubbornness, should guide the decision.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Development Challenges",
    question: `Jamaica has high YOUTH UNEMPLOYMENT despite economic growth. Which analysis BEST explains this paradox?`,
    options: [
      "Economic growth always reduces youth unemployment",
      "Youth unemployment is always the same as general unemployment",
      "Growth in sectors that require skilled workers or capital (like high-end tourism) may not create jobs for young people without matching skills. The mismatch between the economy's demand for skills and young people's available skills — a structural mismatch — explains why growth and youth unemployment can coexist",
      "The government is incompetent",
    ],
    correctAnswer: 2,
    explanation: `Structural unemployment — a mismatch between available skills and labour market demand — is a key development challenge. Economic growth that doesn't match young people's skills and education creates this paradox. Solutions require both skills training and economic diversification into sectors with entry-level opportunities.`
  },
  {
    id: 40,
    type: "economics",
    skill: "International Finance",
    question: `Jamaica has significant national DEBT. When the government uses tax revenue to pay debt interest, which citizens are MOST affected?`,
    options: [
      "Only wealthy citizens pay debt costs",
      "Debt interest has no effect on citizens",
      "The payment of debt interest reduces the government budget available for schools, hospitals, and infrastructure — ordinary citizens who depend most on public services bear the heaviest indirect cost of high debt through reduced service quality and quantity",
      "Only foreign citizens are affected",
    ],
    correctAnswer: 2,
    explanation: `Debt's opportunity cost is the public spending it crowds out. When significant tax revenue goes to debt interest, less funds public services — the most dependent on those services (lower-income citizens) bear the greatest burden of high debt, even though they typically did not benefit from the spending that created it.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff3MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsDiff3Questions : g5SsDiff3Questions.slice(0, FREE_QUESTION_LIMIT)
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
