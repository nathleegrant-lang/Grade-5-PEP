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

const g5SsDiff2Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "Critical Evaluation",
    question: `A student argues: 'The Maroon Peace Treaty of 1739 was a betrayal because Maroons agreed to return escaped slaves.' How should a historian BEST respond?`,
    options: [
      "The student is entirely wrong",
      "The student is entirely right",
      "The historian should acknowledge the moral complexity — the treaty secured Maroon freedom but at the cost of others' freedom, making it simultaneously a victory and a morally troubling compromise",
      "Historical figures cannot be judged by modern standards",
    ],
    correctAnswer: 2,
    explanation: `Historical empathy requires holding complexity: the Maroons secured survival and freedom for their community, but the clause requiring them to return escapees is genuinely troubling. Acknowledging both is more historically sophisticated than simple judgement.`
  },
  {
    id: 2,
    type: "history",
    skill: "Historical Significance — Ranking",
    question: `Which development in Jamaican history was MOST significant for the long-term wellbeing of ordinary Jamaicans?`,
    options: [
      "The Spanish founding of Santiago de la Vega",
      "The British conquest of Jamaica in 1655",
      "Universal Adult Suffrage in 1944 — giving all adults a political voice and the power to elect governments accountable to them",
      "Christopher Columbus's arrival in 1494",
    ],
    correctAnswer: 2,
    explanation: `Political representation is the foundation for all other rights — once ordinary Jamaicans could vote, they could elect governments committed to their welfare. All subsequent social progress was built on this democratic foundation.`
  },
  {
    id: 3,
    type: "history",
    skill: "Source Analysis",
    question: `Read this source: 'The Negro is inherently inferior and cannot govern himself — British rule is a civilising gift.' (Colonial official, 1900). What does this source reveal about colonial thinking?`,
    options: [
      "This shows accurate historical thinking",
      "This source is neutral and factual",
      "This source reveals the racist ideology that justified colonial rule — portraying colonised peoples as inferior to legitimise their subjugation and deny their right to self-determination",
      "This source was written by a Jamaican National Hero",
    ],
    correctAnswer: 2,
    explanation: `Primary sources from colonists reveal colonial ideology — the belief in racial hierarchy that justified empire. Analysing this rhetoric critically exposes the self-serving nature of 'civilising mission' justifications for exploitation.`
  },
  {
    id: 4,
    type: "history",
    skill: "Synthesis — Heritage",
    question: `How does the fact that Jamaica's national symbols (flag, motto, dish, bird, tree, fruit) draw from MULTIPLE cultural traditions reflect Jamaica's history?`,
    options: [
      "It shows Jamaica has no single identity",
      "It is a coincidence",
      "Each symbol traces a thread of Jamaica's layered cultural history — African, Taino, European, East Indian — the symbols together are a visual map of colonialism, resistance, and cultural fusion",
      "National symbols are chosen randomly",
    ],
    correctAnswer: 2,
    explanation: `The ackee (West Africa), the Lignum Vitae (indigenous Caribbean), 'Out of Many, One People' (multicultural history) — Jamaica's symbols consciously celebrate the diverse origins forged through centuries of contact, conflict, and creativity.`
  },
  {
    id: 5,
    type: "history",
    skill: "Evaluating Legacy",
    question: `A student argues 'colonialism left Jamaica with no benefits at all.' A more historically nuanced view would be:`,
    options: [
      "Colonialism was entirely beneficial",
      "This is completely correct",
      "Colonialism left Jamaica with deep structural damage (inequality, land concentration, extraction) while also involuntarily creating the diverse society and some of the infrastructure that modern Jamaica inherited — both the damage and the legacy are real",
      "Colonialism had no effects on Jamaica",
    ],
    correctAnswer: 2,
    explanation: `Nuanced history acknowledges that colonialism was exploitative and unjust, while also recognising that modern Jamaica — its language, some institutions, and multicultural society — emerged from that colonial encounter. Acknowledging complexity is not excusing exploitation.`
  },
  {
    id: 6,
    type: "history",
    skill: "Contrafactual Reasoning",
    question: `If Jamaica had NOT gained independence in 1962, which consequence would MOST LIKELY have followed?`,
    options: [
      "Nothing would have changed",
      "Jamaica would be richer",
      "Jamaicans would have been denied the full exercise of self-determination — unable to set their own education, economic, and social policies according to their own priorities and values",
      "Jamaica would have become a US territory",
    ],
    correctAnswer: 2,
    explanation: `Without independence, Jamaica's economy, education, and social policy would have continued to serve British imperial interests rather than Jamaican needs. The power to set national priorities is the essential benefit of sovereignty.`
  },
  {
    id: 7,
    type: "history",
    skill: "Connecting Past and Present",
    question: `How does the LEGACY OF THE PLANTATION ECONOMY continue to affect Jamaica TODAY?`,
    options: [
      "The plantation economy has no modern legacy",
      "Jamaica recovered completely from the plantation era",
      "Concentrated land ownership, wealth inequality, dependence on agricultural exports, and the social hierarchies from the plantation era continue to shape Jamaica's development challenges",
      "Jamaica's plantation era made it one of the world's wealthiest nations",
    ],
    correctAnswer: 2,
    explanation: `Historical legacies are not just past events — land ownership patterns from the plantation era, the absence of an industrial base, and social inequalities originating in slavery continue to shape Jamaica's economic and social realities.`
  },
  {
    id: 8,
    type: "history",
    skill: "Historical Empathy",
    question: `An enslaved person in 1820s Jamaica secretly teaches others to read, risking severe punishment. What does this action reveal about enslaved people?`,
    options: [
      "Enslaved people were passive victims with no agency",
      "Reading was forbidden but not important",
      "Despite systematic oppression, enslaved people exercised agency — pursuing knowledge as an act of resistance and self-determination, demonstrating remarkable courage and the human will to assert dignity",
      "This action had no significance",
    ],
    correctAnswer: 2,
    explanation: `Historical empathy requires understanding enslaved people not as passive victims but as agents — people who found ways to resist, maintain humanity, and exercise agency even under the most brutal constraints.`
  },
  {
    id: 9,
    type: "history",
    skill: "Evaluating Interpretations",
    question: `Two historians debate the Morant Bay Rebellion. Historian A calls it 'a criminal riot.' Historian B calls it 'a justified uprising.' Which statement BEST evaluates these interpretations?`,
    options: [
      "Historian A is correct because the law was broken",
      "Historian B is correct because people were poor",
      "Both interpretations reflect different values and perspectives — the event can be read as a crime against order OR as justified resistance against injustice, depending on whose interests and values the historian prioritises",
      "Neither historian is correct",
    ],
    correctAnswer: 2,
    explanation: `This is a classic example of contested historical interpretation. The same event — acts of violence against authority — can be criminal or heroic depending on whether you accept the legitimacy of the authority being challenged. Both interpretations use real evidence.`
  },
  {
    id: 10,
    type: "history",
    skill: "Synthesis",
    question: `Which of the following BEST explains why Jamaica's National Heroes come from different eras and used different methods?`,
    options: [
      "They are chosen randomly",
      "Jamaica ran out of heroes in one era",
      "Freedom and justice require ongoing effort across different historical moments — each hero responded to the specific form of oppression dominant in their time, from slavery to colonialism to independence",
      "Heroes are chosen based on their military victories alone",
    ],
    correctAnswer: 2,
    explanation: `From Nanny (resistance to slavery) through Bogle (colonial injustice) to Manley and Bustamante (independence) — each National Hero represents a different phase of the same long struggle for dignity and self-determination.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Data Interpretation",
    question: `A climate table shows that Morant Bay receives 1,800 mm of rain annually while Portmore receives only 800 mm. Both are in southeastern Jamaica. What geographic factor MOST explains this difference?`,
    options: [
      "Portmore is in a different country",
      "Morant Bay has a larger population",
      "Morant Bay is on the wetter, northeastern-facing slopes exposed to trade winds; Portmore is on the drier, leeward southern plain — a localised rain shadow effect within the same region",
      "The two towns have different soils",
    ],
    correctAnswer: 2,
    explanation: `Micro-scale rain shadow effects operate even within small areas. Morant Bay faces the moisture-bearing trade winds; Portmore is shielded by terrain. This is the same rain shadow principle applied at local scale.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Sustainability Analysis",
    question: `A fishing village catches 50% more fish than last year because they use new large-scale nets. Why might this be a problem in the LONG TERM?`,
    options: [
      "More fish is always better",
      "Fishing cannot be over-done",
      "Overfishing depletes fish populations faster than they can reproduce — next year's catch will likely fall sharply, threatening the long-term viability of the fishery and the community's livelihood",
      "Large nets are too expensive",
    ],
    correctAnswer: 2,
    explanation: `This is a classic tragedy of the commons / sustainability problem. Short-term gain from overfishing destroys the resource base that future catches depend on. Sustainable fishing limits catches to what the population can replenish.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Complex Spatial Reasoning",
    question: `A new expressway is planned to connect Kingston to Montego Bay through the interior. List THREE likely consequences — both positive and negative.`,
    options: [
      "Only positive consequences are possible",
      "Only negative consequences occur",
      "Positive: faster travel time, more accessible interior communities, economic development along the route. Negative: environmental disruption to interior ecosystems, displacement of communities along the route, potential acceleration of deforestation as the interior becomes more accessible",
      "Roads have no consequences",
    ],
    correctAnswer: 2,
    explanation: `Infrastructure planning requires multi-dimensional consequence analysis. Major roads generate economic benefits (connectivity, development) AND environmental/social costs (ecosystem disruption, displacement, deforestation pressure). Both must be considered.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Environmental Interdependence",
    question: `How does the HEALTH of Jamaica's Blue Mountain forests affect communities in Kingston?`,
    options: [
      "There is no relationship between mountains and cities",
      "Mountain forests only benefit mountain communities",
      "Blue Mountain forests are the primary watershed for Kingston's water supply — forest degradation through deforestation reduces water quality and quantity, directly affecting millions of urban residents who depend on mountain rivers",
      "Only bauxite mining affects Kingston's water",
    ],
    correctAnswer: 2,
    explanation: `This question tests understanding of watershed interdependence: urban water supply depends on rural/mountain forest health. Environmental problems in the mountains translate into water crises in the city — urban and rural environments are deeply connected.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Policy Evaluation",
    question: `Jamaica's government designates large areas of the Blue Mountains as a National Park. Some farmers in the area object. Which analysis BEST addresses both perspectives?`,
    options: [
      "Farmers are always wrong",
      "National Parks never help anyone",
      "Farmers' livelihoods and land access are legitimate concerns — but the Park protects biodiversity, water supply, and heritage that benefit all Jamaicans. The best policy would include farmers in park management and provide alternative income, rather than treating conservation and community welfare as opposites",
      "Conservation is always more important than farming",
    ],
    correctAnswer: 2,
    explanation: `Effective conservation policy requires community co-management — farmers as stewards rather than obstacles. Excluding communities creates conflict and often undermines conservation. The most sophisticated analysis sees human welfare and environmental protection as mutually reinforcing, not opposed.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Map Skills — Complex",
    question: `A map shows Jamaica's land use. The NORTH COAST shows resort hotels; the SOUTH shows agriculture and port facilities; the INTERIOR shows forests and mining. What does this pattern reveal about Jamaica's economy?`,
    options: [
      "Land use is random",
      "All areas are used for the same purpose",
      "The pattern reflects Jamaica's major economic sectors: tourism concentrated on the scenic north coast (beaches, clear water), agriculture and trade on the productive south plain and ports, and natural resource extraction in the interior — economic geography follows environmental assets",
      "The south coast is more beautiful than the north",
    ],
    correctAnswer: 2,
    explanation: `Economic geography maps onto environmental geography: tourism follows beach and scenery (north coast), agriculture follows fertile soils (south plain), mining follows mineral deposits (interior). Understanding this spatial logic is key to economic geography.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Climate Change Impact",
    question: `Scientists predict that Jamaica's sea levels will rise 30 cm by 2050. Which communities face the GREATEST risk?`,
    options: [
      "Only communities far from the coast",
      "All Jamaican communities equally",
      "Low-lying coastal communities — including parts of Kingston, Portmore, and tourist areas on the north coast — face the greatest risk of flooding, saltwater intrusion into freshwater sources, and loss of beaches",
      "Inland mountain communities",
    ],
    correctAnswer: 2,
    explanation: `Differential vulnerability is key: not all communities face equal climate risk. Low-lying coastal communities (Portmore, beach resorts, Kingston Harbour area) face flooding and saltwater intrusion. Mapping vulnerability by elevation and proximity to coast reveals who is most at risk.`
  },
  {
    id: 18,
    type: "geography",
    skill: "Synthesis — Human Geography",
    question: `Why do geographers say 'geography shapes history, and history shapes geography'?`,
    options: [
      "Geography and history are completely unrelated",
      "Only history shapes geography",
      "Physical geography (mountains, harbours, rivers) shaped where people settled, what they farmed, and what routes they took — creating history. Then human history (deforestation, cities, dams) reshaped the physical landscape — both forces constantly act on each other",
      "Geography is more important than history",
    ],
    correctAnswer: 2,
    explanation: `The human-environment interaction works in both directions: the Blue Mountains shaped Maroon history (providing refuge), and Maroon settlement shaped those mountains (burning, farming, path creation). Kingston's harbour shaped its role as capital; being capital shaped how the harbour was developed.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Multi-Factor Analysis",
    question: `A student is asked to explain why Kingston is Jamaica's largest and most important city. Which answer is MOST complete?`,
    options: [
      "Because it was chosen randomly",
      "Because it has the best weather",
      "Kingston's natural harbour (one of the world's largest), flat coastal land, central location on the south coast, and its designation as capital all combined to concentrate commerce, government, and population — multiple geographical and historical factors reinforced each other",
      "Because it is the smallest parish",
    ],
    correctAnswer: 2,
    explanation: `Urban primacy results from multiple reinforcing advantages: natural harbour for trade, flat land for development, capital status attracting government functions. Understanding settlement requires multi-factor analysis, not a single cause.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Environmental Trade-offs",
    question: `A government must decide whether to build a bauxite mine or protect a forested watershed. What is the MOST complete analysis of this decision?`,
    options: [
      "Always mine bauxite — it generates revenue",
      "Always protect the forest — mining is wrong",
      "This requires weighing short-term economic gain (mining revenue, jobs) against long-term environmental costs (watershed destruction, biodiversity loss, community water supply). The decision depends on whether the economic benefit outweighs the ecological cost AND whether the community can develop alternative income",
      "Mining always benefits communities",
    ],
    correctAnswer: 2,
    explanation: `Environmental decision-making requires systematic cost-benefit analysis across economic, ecological, and social dimensions — considering who benefits, who bears costs, and over what timeframe.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Rights Conflicts",
    question: `A journalist publishes confidential government documents exposing corruption. The government seeks to prosecute her for breaking state secrecy laws. Which competing rights and values are in conflict?`,
    options: [
      "Only the government's rights matter",
      "This is a simple case with an obvious answer",
      "Freedom of the press and the public's right to know about government corruption vs the government's right to protect official information and maintain state security — a genuine tension between democratic accountability and institutional confidentiality",
      "Journalists should never publish government documents",
    ],
    correctAnswer: 2,
    explanation: `This is a real constitutional dilemma with legitimate arguments on both sides. Press freedom and public accountability argue for publication; state security and rule of law argue against. Courts must balance these competing values.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Policy Reasoning",
    question: `A government wants to reduce crime. It debates two approaches: (A) increase police powers, even if some civil liberties are limited, or (B) invest in education and community development. Which consideration is MOST important?`,
    options: [
      "Only approach A is correct",
      "Only approach B is correct",
      "The most effective approach probably combines both — addressing immediate security while also addressing root causes. However, approach A carries risks to civil liberties that must be carefully managed and monitored, while approach B's benefits take longer to materialise",
      "Crime cannot be reduced",
    ],
    correctAnswer: 2,
    explanation: `Criminal justice policy requires multi-dimensional thinking: security measures provide short-term safety; social investment addresses root causes. Critically, security measures that undermine civil liberties create their own injustices — the most nuanced answer recognises the need for balance and oversight.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Constitutional Rights — Application",
    question: `A school bans Muslim students from wearing hijabs on school grounds, citing uniform policy. Which constitutional rights may be violated?`,
    options: [
      "Schools have absolute authority over uniform policy",
      "The school is correct because rules apply to everyone",
      "The right to freedom of religion and the right to non-discrimination — a blanket ban may infringe students' right to practise their faith without reasonable justification. Courts would likely require the school to demonstrate why accommodation is impossible",
      "Religious clothing has no legal protection",
    ],
    correctAnswer: 2,
    explanation: `This applies constitutional rights to a real scenario. Freedom of religion protects the right to manifest faith through dress. The test is whether the restriction is 'reasonably justifiable' — courts would ask whether accommodation is possible and whether the restriction is proportionate.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Democratic Theory",
    question: `Why might a democracy with FREE and FAIR ELECTIONS still fail to protect the rights of minorities?`,
    options: [
      "Democracies always protect minorities",
      "Minorities should not have special rights",
      "A majority can vote to restrict minority rights — 'tyranny of the majority.' This is why constitutions entrench fundamental rights that cannot be removed by simple majority vote — protecting minorities from democratic oppression",
      "Elections are the only measure of democracy",
    ],
    correctAnswer: 2,
    explanation: `This is a fundamental problem in democratic theory: majority rule without minority protections can become oppressive. Constitutional rights exist precisely to shield individuals and minorities from majority power — democracy requires both elections AND rights protection.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Government Accountability",
    question: `The Auditor General's report reveals a government ministry wasted $50 million. What SEQUENCE of events should follow in a functioning democracy?`,
    options: [
      "Nothing — the government decides what to do",
      "The Prime Minister apologises and the matter ends",
      "The report is laid in Parliament; the Public Accounts Committee investigates; the minister and officials are questioned; where crimes are found, the Director of Public Prosecutions considers charges; corrective measures are implemented — multiple accountability mechanisms activate",
      "The Auditor General fires the minister",
    ],
    correctAnswer: 2,
    explanation: `Democratic accountability requires multiple mechanisms working together: the Auditor General reports, Parliament scrutinises, prosecution considers charges, and administration reforms. No single institution handles it alone — the system of checks provides accountability.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Evaluating Civic Behaviour",
    question: `A student says: 'I don't vote because one vote doesn't matter.' Evaluate this argument.`,
    options: [
      "The student is completely correct",
      "Voting never changes anything",
      "While a single vote rarely decides an election, collective non-participation by those who feel this way can determine outcomes. Civic participation has cumulative effects; abstaining is also a choice with consequences — it cedes political influence to those who do vote",
      "Every single vote has always decided an election",
    ],
    correctAnswer: 2,
    explanation: `The 'my vote doesn't matter' fallacy ignores collective action: everyone reasoning this way produces mass abstention that genuinely affects outcomes. Civic participation is inherently collective — individual choices aggregate into social outcomes.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Constitutional Significance",
    question: `A critic argues 'the Governor General is pointless — they just perform ceremonies.' Why is this argument incomplete?`,
    options: [
      "The Governor General has no real function",
      "The critic is completely correct",
      "The Governor General performs vital constitutional functions: formally appointing the Prime Minister, granting assent to laws, and serving as a constitutional safeguard if a government acts unconstitutionally — the ceremonial role obscures real constitutional significance",
      "The Governor General runs the country",
    ],
    correctAnswer: 2,
    explanation: `Constitutional roles often appear ceremonial but retain real significance in exceptional circumstances. The Governor General's power to withhold assent or act in constitutional crises provides a backstop against executive overreach — rarely exercised but constitutionally essential.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Rule of Law — Application",
    question: `A wealthy businessman is caught committing a serious crime. He offers to donate $10 million to a hospital if charges are dropped. What principle is violated if the authorities accept?`,
    options: [
      "The rule of law — no one may buy their way out of legal accountability regardless of wealth or social status",
      "Freedom of contract",
      "The right to privacy",
      "The principle of free market economics",
    ],
    correctAnswer: 0,
    explanation: `The rule of law's most fundamental meaning: equality before the law regardless of wealth, power, or status. Allowing the wealthy to buy freedom from accountability destroys the legal equality on which democratic society rests.`
  },
  {
    id: 29,
    type: "civics",
    skill: "Constitutional Analysis",
    question: `A government passes a law that takes away citizens' right to free speech. Which institution has the power to strike down this law?`,
    options: [
      "The Prime Minister can reverse it",
      "The Governor General reverses all bad laws",
      "The Supreme Court — which can rule the law unconstitutional if it violates the Charter of Fundamental Rights and Freedoms",
      "Parliament can re-vote on it",
    ],
    correctAnswer: 2,
    explanation: `Judicial review is the Supreme Court's power to invalidate laws that violate the Constitution. This is the fundamental mechanism protecting rights even from elected governments — the Constitution limits what Parliament can do.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Evaluating Democratic Principles",
    question: `A political party wins 60% of parliamentary seats with only 40% of the popular vote. This is possible under Jamaica's first-past-the-post electoral system. Which democratic PRINCIPLE does this tension highlight?`,
    options: [
      "There is no tension — 60% seats is fair",
      "Only constituency results matter",
      "The tension between proportional representation of popular votes and the winner-takes-all constituency system — first-past-the-post can produce parliaments that don't reflect the full distribution of voters' preferences",
      "Only the losing party objects to this",
    ],
    correctAnswer: 2,
    explanation: `First-past-the-post can produce seat/vote share mismatches — a party winning narrow victories in many constituencies can win far more seats than its national vote share suggests. This is a genuine democratic trade-off between geographic representation and proportional representation.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Sustainability Analysis",
    question: `A bauxite company argues its mining creates 1,000 jobs and $50 million in tax revenue for Jamaica. An environmental group argues mining destroys watersheds permanently. Which FRAMEWORK best resolves this debate?`,
    options: [
      "Jobs always matter more than environment",
      "Environment always matters more than jobs",
      "True cost-benefit analysis must include: the economic value of the watershed's ecosystem services (water supply, flood protection) over its lifetime vs. the jobs and revenue over the mine's lifetime. If watershed value exceeds mining value, protection is economically rational, not just environmentally romantic",
      "Only the government can decide",
    ],
    correctAnswer: 2,
    explanation: `Environmental economics frames this as a genuine economic comparison: ecosystem services (clean water for millions, flood protection, fisheries) have economic value that can be estimated. When this exceeds mining benefits, environmental protection is economically rational. This dissolves the false economy-vs-environment binary.`
  },
  {
    id: 32,
    type: "economics",
    skill: "International Economics",
    question: `Jamaica's tourism industry earns US$3 billion annually but much of this 'leaks' out of the economy. Explain what leakage means and how it REDUCES the benefit to Jamaicans.`,
    options: [
      "Leakage means tourists steal from Jamaica",
      "All tourism revenue stays in Jamaica",
      "Leakage occurs when tourism revenue leaves Jamaica through: profits remitted by foreign hotel owners, imported food and supplies used by resorts, foreign staff employed by hotels, and savings by foreign investors. Every dollar that leaks out is a dollar that doesn't circulate in Jamaica's economy",
      "Leakage only affects the government",
    ],
    correctAnswer: 2,
    explanation: `Tourism leakage is a key concept in development economics: gross tourism revenue substantially overstates net benefit. Building local supply chains, Jamaican ownership of hotels, and employing local staff all reduce leakage and increase the share of tourism revenue that stays in and circulates through the local economy.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Evaluating Economic Development",
    question: `GDP growth of 3% in Jamaica is reported. Which question MOST helps determine whether this growth improved Jamaicans' lives?`,
    options: [
      "Was 3% the highest growth in the Caribbean?",
      "How does 3% compare to last year?",
      "How was the growth distributed — did it reach the poor and middle class, or mainly benefit wealthy businesses and foreign investors? What happened to employment, wages, and public services?",
      "Did growth occur in the tourism sector?",
    ],
    correctAnswer: 2,
    explanation: `GDP growth is an aggregate measure — it says nothing about distribution. Inclusive growth that raises wages and funds public services differs fundamentally from growth that enriches a small elite while leaving most Jamaicans behind. Asking about distribution is the essential critical question.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Financial Literacy — Complex",
    question: `A Jamaican student takes a $500,000 student loan at 8% annual interest. She can either repay it over 5 years or 10 years. What is the TRADE-OFF?`,
    options: [
      "Longer repayment is always better",
      "Shorter repayment is always better",
      "Shorter repayment (5 years) means higher monthly payments but LESS total interest paid; longer repayment (10 years) means lower monthly payments but MORE total interest paid over the full period — the trade-off is monthly cash flow vs total cost",
      "Interest rate is the only factor that matters",
    ],
    correctAnswer: 2,
    explanation: `Loan repayment trade-offs: term length affects both monthly payments and total interest cost. Understanding this trade-off — monthly affordability vs total cost — is essential financial literacy for anyone considering student loans or mortgages.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Entrepreneurship — Analysis",
    question: `A Jamaican entrepreneur wants to start a business. She is choosing between: (A) a franchise of an existing foreign brand, or (B) creating a new Jamaican brand. What are the KEY TRADE-OFFS?`,
    options: [
      "Franchises are always better",
      "New brands are always better",
      "Franchise: lower risk (proven model, brand recognition), but fees reduce profit and rules limit creativity. New brand: higher risk (unknown), but full creative control, all profits stay local, and success creates a Jamaican asset. The right choice depends on her risk tolerance, capital, and long-term goals",
      "There are no trade-offs",
    ],
    correctAnswer: 2,
    explanation: `This is an entrepreneurship decision analysis: franchises reduce risk but share value; new brands are riskier but create independent wealth and Jamaican cultural capital. Understanding these trade-offs — not just choosing one option — is the goal.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Development Economics",
    question: `Why do economists argue that INVESTING IN EARLY CHILDHOOD EDUCATION has better economic returns than many other investments?`,
    options: [
      "Early education is cheap to provide",
      "Children are less important than adults",
      "Research consistently shows that investment in early childhood (0-5 years) generates the highest returns in human capital — a more skilled, healthier, more productive workforce — with dollar-for-dollar returns estimated at 7-12 times the investment through lifetime earnings and reduced social costs",
      "Education only benefits individuals, not the economy",
    ],
    correctAnswer: 2,
    explanation: `The economics of early childhood investment: James Heckman's research shows early childhood is when human capital is most efficiently built. Prevention is cheaper than remediation — investing early reduces later costs in remedial education, healthcare, and the justice system.`
  },
  {
    id: 37,
    type: "economics",
    skill: "Market Failure",
    question: `Why might PRIVATE BUSINESSES fail to provide clean water to all rural Jamaicans, even if it were profitable?`,
    options: [
      "Private businesses can always provide water",
      "Governments should never provide water",
      "Private businesses pursue profit — rural communities with low incomes may not generate sufficient profit to justify investment in remote areas. Water is also a public good (essential for life) with significant externalities. Market failure in essential services justifies government provision or regulation",
      "Water should only be provided by businesses",
    ],
    correctAnswer: 2,
    explanation: `Market failure analysis: private markets may not provide essential services to poor or remote communities because profitability is insufficient. Water's public good character (essential for life, cannot be substituted) and the negative externalities of its absence (disease, economic loss) justify government intervention.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Policy Consequences",
    question: `Jamaica reduces its import tariffs on foreign agricultural products as part of a trade agreement. What are the LIKELY consequences for Jamaican farmers?`,
    options: [
      "All farmers benefit immediately",
      "Tariff reduction always helps developing countries",
      "Local farmers face cheaper foreign competition — many may not survive unless they can reduce costs or find niche markets. Consumers benefit from lower food prices, but farm employment and food security may suffer — the trade-off between consumer benefit and producer protection is a genuine policy dilemma",
      "Trade agreements have no consequences for farmers",
    ],
    correctAnswer: 2,
    explanation: `Trade liberalisation creates winners (consumers, export industries) and losers (import-competing local producers). Jamaican farmers facing cheap imports from subsidised US or European agriculture is a real challenge — managing this transition requires adjustment support, not just trade liberalisation alone.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Policy Evaluation",
    question: `The Jamaican government offers tax breaks to foreign hotel chains to invest in tourism. A critic argues this 'gives away Jamaica's natural resources for little benefit.' Which analysis is MOST complete?`,
    options: [
      "Tax breaks are always good policy",
      "Critics are always wrong about tax policy",
      "Tax breaks attract investment and create jobs (benefit), but tax revenue forgone cannot fund schools and hospitals (cost). The key question is whether tourism jobs, training, and infrastructure created outweigh the tax revenue lost — policy should include requirements for local employment and supply chain linkages",
      "Foreign investment is always harmful",
    ],
    correctAnswer: 2,
    explanation: `This is a classic cost-benefit policy analysis. Tax incentives have real benefits (investment, jobs) and real costs (forgone revenue, profit repatriation). The most sophisticated analysis asks whether the deal is structured to maximise local benefit — not just whether foreign investment is good or bad in principle.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Economic Reasoning — Trade-off",
    question: `Jamaica's government must allocate a limited budget. It can fund: (A) a new highway to a tourist resort, or (B) repairs to primary schools in rural areas. Which allocation framework BEST guides this decision?`,
    options: [
      "Always choose tourism infrastructure",
      "Always choose education",
      "The decision requires cost-benefit analysis: the highway may generate more tourism revenue but benefits the private sector; school repairs directly benefit thousands of children and have long-term economic returns through human capital development. Equity, long-term development, and community need should weigh alongside immediate economic return",
      "Flip a coin — both are equally important",
    ],
    correctAnswer: 2,
    explanation: `Public investment decisions require analysis across multiple dimensions: immediate economic return, long-term development value, equity (who benefits), and community need. Education investment has proven long-term economic returns through human capital — not just immediate GDP impact.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsDiff2Questions : g5SsDiff2Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Social Studies",
        testName: "Difficult 2",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 2</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 2</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 2</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
