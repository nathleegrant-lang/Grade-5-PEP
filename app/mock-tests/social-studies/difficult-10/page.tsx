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

const g5SsDiff10Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Synthesis of Evidence",
    "question": "A diary describes fear during the Morant Bay events; a court record lists charges; a textbook explains causes. How should all three be used?",
    "options": [
      "Use the diary to explain the event because personal fear reveals both the legal charges and wider causes.",
      "Use the court record as the complete account because official charges establish what every participant experienced.",
      "Compare the diary’s experience, the court record’s official evidence, and the textbook’s interpretation while checking each source’s limits.",
      "Combine the three accounts without identifying their origins because agreement matters more than source purpose."
    ],
    "correctAnswer": 2,
    "explanation": "The sources provide different evidence and viewpoints; comparison and source criticism produce the strongest account."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Chronology and Cause",
    "question": "Why does placing the Baptist War before abolition and Apprenticeship improve an explanation?",
    "options": [
      "It proves the Baptist War occurred after Apprenticeship and directly ended every labour restriction.",
      "It shows resistance preceded abolition and helps explain pressure for change, while the 1834–1838 sequence shows freedom came in stages.",
      "It shows abolition caused the Baptist War because an earlier event always causes the event placed after it.",
      "It proves the Baptist War was the only cause of abolition because it appears closest to abolition on the timeline."
    ],
    "correctAnswer": 1,
    "explanation": "Correct chronology supports cause-and-effect reasoning while recognizing that abolition and full freedom were not one immediate step."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Comparing Change",
    "question": "Which comparison best links 1944 suffrage and 1962 Independence?",
    "options": [
      "Independence widened the electorate in 1944, and suffrage later established sovereign government in 1962.",
      "Both developments ended colonial slavery, but suffrage applied only to workers while Independence applied to landowners.",
      "Suffrage and Independence were identical changes because both involved Jamaicans participating in public affairs.",
      "Universal Adult Suffrage widened electoral participation before Independence established Jamaica as a sovereign state."
    ],
    "correctAnswer": 3,
    "explanation": "The events represent different stages: wider electoral participation in 1944 and national Independence in 1962."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Evidence and Claims",
    "question": "A chart shows wages rose after 1938, but prices also rose. What additional calculation helps judge whether workers were better off?",
    "options": [
      "Add the wage and price increases, because a larger combined percentage shows workers could purchase more.",
      "Compare only the final wage with the original wage, because price changes do not affect what earnings can buy.",
      "Compare the percentage growth in wages with the percentage rise in living costs to judge changes in purchasing power.",
      "Subtract the final price index from the number of workers, because employment determines the real value of wages."
    ],
    "correctAnswer": 2,
    "explanation": "Purchasing power depends on both earnings and prices, so their rates of change should be compared."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Historical Perspective",
    "question": "Why might an official and a protester describe the same march differently?",
    "options": [
      "One account must be false because people observing the same march should record identical details and judgments.",
      "Different roles and purposes shape what each person notices, so both accounts should be tested against other evidence.",
      "The official’s account should be accepted because authority removes personal perspective from historical records.",
      "The protester’s account should replace all official evidence because direct participation guarantees a complete view."
    ],
    "correctAnswer": 1,
    "explanation": "Perspective affects emphasis, so historians compare accounts with other evidence rather than accepting or rejecting them automatically."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Heritage Decision",
    "question": "A historic building is unsafe but important. Which plan combines heritage and public safety?",
    "options": [
      "Open the building while repairs are discussed because heritage importance makes a safety assessment unnecessary.",
      "Demolish it immediately and collect memories afterward because public safety prevents prior documentation.",
      "Close it permanently without investigating repair because preservation and safe use cannot occur together.",
      "Document its significance, assess structural risk, and compare repair or safe adaptation options before deciding."
    ],
    "correctAnswer": 3,
    "explanation": "Assessment and careful adaptation can protect people while preserving significant heritage where feasible."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Multiple Evidence",
    "question": "Oral history gives a date that conflicts with a newspaper. What should a student conclude?",
    "options": [
      "Prefer the newspaper automatically because printed evidence is always more accurate than remembered experience.",
      "Prefer the oral account automatically because family memory preserves dates more carefully than contemporary records.",
      "Record the conflict and check additional dated records, provenance, and context before reaching a conclusion.",
      "Average the two dates because a middle year fairly represents disagreement between historical sources."
    ],
    "correctAnswer": 2,
    "explanation": "Conflicting evidence should be documented and investigated using further reliable sources."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "National Heroes",
    "question": "Which reasoning best explains studying both Nanny and George William Gordon?",
    "options": [
      "They led the same uprising together, showing how one event combined military and parliamentary leadership.",
      "Their leadership in different periods shows varied forms of resistance and action for freedom and justice.",
      "Both served as prime minister, showing how elected office was the main path used by every National Hero.",
      "Their actions occurred under Spanish rule, showing how colonial conditions remained unchanged for centuries."
    ],
    "correctAnswer": 1,
    "explanation": "Comparing leaders across periods broadens understanding of resistance, leadership, and social change."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Evaluating Causation",
    "question": "A student says one speech caused Independence. What is the best revision?",
    "options": [
      "Accept the claim because a memorable speech can independently produce national change without organizations or negotiation.",
      "Reject the speech as evidence because words cannot influence political movements or public opinion.",
      "Treat every organization and leader as equally influential because multi-cause explanations do not require evidence.",
      "Treat the speech as one possible contribution and examine organizations, elections, negotiations, and wider movements as additional causes."
    ],
    "correctAnswer": 3,
    "explanation": "Major political change normally develops through several connected actors and events."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Fact and Interpretation",
    "question": "Which evidence would best support calling 1938 a turning point?",
    "options": [
      "A large “1938” heading in a museum, because visual emphasis establishes that an event changed later history.",
      "One participant’s statement calling 1938 important, because eyewitness status proves long-term significance.",
      "Evidence of changes in labour organization, political participation, and reforms across the periods before and after 1938.",
      "A map of protest sites, because geographic spread alone proves that all later political changes resulted from the unrest."
    ],
    "correctAnswer": 2,
    "explanation": "Evidence of significant change across the period supports an interpretation of a turning point."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Scale and Cost",
    "question": "A road is 6 cm on a map where 1 cm = 4 km. Repairs cost $2 million per kilometre. What estimated total cost follows?",
    "options": [
      "$12 million, because the six-centimetre map length should be multiplied by the repair rate without converting distance.",
      "$24 million, because the real distance is 24 km but the $2 million rate should be counted once for every two kilometres.",
      "$96 million, because both the scale value and repair rate should be multiplied twice.",
      "$48 million, because 6 cm represents 24 km and 24 kilometres at $2 million each cost $48 million."
    ],
    "correctAnswer": 3,
    "explanation": "The road is 24 km; 24 × $2 million = $48 million."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Direction and Hazard",
    "question": "A storm moves west. Community B lies west of Community A. What should A avoid concluding?",
    "options": [
      "Community B will certainly have greater damage because its western location is sufficient to predict the storm’s full impact.",
      "That B must suffer more damage; direction matters, but storm changes, exposure, buildings, and preparation also affect impact.",
      "Community A can stop preparing because the westward movement places it completely outside every possible hazard.",
      "Both communities must experience equal damage because they are affected by the same named storm."
    ],
    "correctAnswer": 1,
    "explanation": "Direction alone does not determine damage; storm changes and local vulnerability also matter."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall and Capacity",
    "question": "A town receives 150 mm rain. Drains handle 100 mm-equivalent runoff before overflow. What combined response is best?",
    "options": [
      "Deepen drains only, because rainfall volume cannot be influenced by surfaces, vegetation, or runoff controls.",
      "Increase paved surfaces so water reaches drains faster, because faster runoff prevents drainage capacity from being exceeded.",
      "Increase drainage capacity while using vegetation and suitable surfaces to reduce how quickly runoff reaches the system.",
      "Store excess water in streets behind blocked outlets, because temporary street flooding protects buildings downstream."
    ],
    "correctAnswer": 2,
    "explanation": "Both drainage capacity and runoff generation affect flooding, so the response should address both."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Settlement Synthesis",
    "question": "A new housing site is near work, on steep land, and far from water service. What should planners do?",
    "options": [
      "Approve the site because access to work outweighs slope and service constraints in every settlement decision.",
      "Compare employment access with slope stability, water-service costs, transport, and safer design or location alternatives.",
      "Reject the site because no safe construction or infrastructure improvement is possible on any sloping land.",
      "Approve after adding water storage, because supplying water automatically resolves slope and transport risks."
    ],
    "correctAnswer": 1,
    "explanation": "A responsible decision combines access, hazard, and infrastructure evidence."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Coastal Economy",
    "question": "A reef supports fishing, tourism, and storm protection. Which policy reflects all three roles?",
    "options": [
      "Protect tourism access but permit damaging fishing methods because visitor income has the widest community benefit.",
      "Protect fishing access but remove reef-use limits because catches recover automatically when tourism grows.",
      "Close the reef to every activity permanently because livelihoods and coastal protection cannot be considered together.",
      "Limit damaging activity, monitor reef condition, and support fishing and tourism practices that preserve the reef’s protective role."
    ],
    "correctAnswer": 3,
    "explanation": "Conservation protects ecological services and the livelihoods that depend on them."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Watershed Data",
    "question": "Upstream forest cover falls 20%, river mud rises, and reservoir capacity drops. Which link should be tested?",
    "options": [
      "Whether lower reservoir capacity caused farmers to clear trees upstream, because the downstream effect must occur first.",
      "Whether the parish boundary shifted uphill, causing soil to travel farther through the watershed.",
      "Whether reduced forest cover increased erosion and sediment carried into the river and reservoir.",
      "Whether reservoir water changed the map scale used to calculate the reported forest-cover percentage."
    ],
    "correctAnswer": 2,
    "explanation": "Loss of cover can increase erosion and sediment reaching rivers and reservoirs."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Evacuation Decision",
    "question": "Route A is shorter but crosses a flood-prone bridge; Route B is longer and remains open. Which plan is strongest?",
    "options": [
      "Use Route A because a shorter distance always outweighs a flood-prone bridge during an emergency.",
      "Use reliable Route B during flood risk while monitoring conditions and improving Route A for suitable future use.",
      "Use Route B in every condition and permanently abandon Route A without assessing whether its bridge can be improved.",
      "Delay route selection until evacuation begins because reliability cannot be evaluated from hazard and access evidence."
    ],
    "correctAnswer": 1,
    "explanation": "Reliability and safety can outweigh distance during evacuation, while longer-term improvements may retain options."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Population and Services",
    "question": "Population grows 15% while clinic capacity grows 5%. What pressure is likely?",
    "options": [
      "Clinic pressure should fall because a five-percent capacity increase offsets any population growth.",
      "Capacity and population have increased, so service pressure must remain exactly unchanged.",
      "Clinic demand should increase by exactly ten patients because 15 minus 5 equals 10.",
      "Demand is likely to grow faster than capacity because population rose 15% while clinic capacity rose only 5%."
    ],
    "correctAnswer": 3,
    "explanation": "The population increase exceeds the capacity increase, creating likely service pressure."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Environmental Trade-off",
    "question": "A quarry supplies jobs and stone but creates dust and runoff. What condition best supports approval?",
    "options": [
      "Approve because employment and stone supply outweigh any dust or runoff effect documented after work begins.",
      "Require evidence-based dust and runoff controls, monitoring, restoration, and enforcement sufficient to manage identified risks.",
      "Reject every quarry because economic benefit and environmental protection cannot be evaluated together.",
      "Approve if the company promises care, because a verbal commitment provides stronger protection than measurable conditions."
    ],
    "correctAnswer": 1,
    "explanation": "Economic benefits should be weighed against risks using enforceable mitigation and monitoring."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Data Reliability",
    "question": "Three rainfall gauges show 90, 94, and 210 mm; the last gauge was damaged. What should analysts do?",
    "options": [
      "Use 210 mm because an extreme value is more informative than two similar readings.",
      "Average all three readings without noting damage because averaging automatically corrects equipment errors.",
      "Inspect the damaged gauge and corroborate the unusual reading before including or rejecting it.",
      "Discard the 90 and 94 mm readings because similarity suggests that both working gauges copied one another."
    ],
    "correctAnswer": 2,
    "explanation": "An unusual reading from damaged equipment needs verification rather than automatic acceptance."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Evidence and Authority",
    "question": "Residents ask Parliament to repair one local drain. What response best combines civic knowledge and action?",
    "options": [
      "Parliament should supervise the drain crew because national representatives are responsible for every publicly funded task.",
      "The Municipal Corporation should pass a national drainage law, while Parliament schedules the local repair.",
      "Residents should report the local-service problem to the Municipal Corporation while asking national representatives about wider policy or funding.",
      "A court should order daily maintenance first, because courts normally manage local services when responsibilities overlap."
    ],
    "correctAnswer": 2,
    "explanation": "Local authorities manage many local services, while national representatives can address wider policy and resources."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Rights and Safety",
    "question": "A public meeting becomes overcrowded. Which response best protects participation and safety?",
    "options": [
      "Admit everyone despite blocked exits because participation rights prevent temporary safety controls.",
      "Pause entry, apply neutral safety limits, and offer another safe space, time, or way to participate.",
      "Exclude only people criticizing the organizers, because fewer opposing views will reduce crowding.",
      "Cancel all future public meetings because one overcrowding incident proves participation cannot be managed safely."
    ],
    "correctAnswer": 1,
    "explanation": "Neutral safety measures and alternatives protect both physical safety and fair participation."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Accountability Chain",
    "question": "A ministry funds a local project that the Municipal Corporation delivers. Who should explain problems?",
    "options": [
      "The ministry alone should explain every problem because providing funds transfers all local operational responsibility to it.",
      "The Municipal Corporation alone should explain every problem because accepting funds removes the ministry’s duty to account for allocation.",
      "Neither body can be held accountable because shared responsibility prevents records from identifying separate decisions.",
      "Each body should account for the funds, approvals, decisions, and work falling within its own role."
    ],
    "correctAnswer": 3,
    "explanation": "Shared projects require clear records and accountability from each responsible institution."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Parliamentary Reasoning",
    "question": "A bill addresses a problem but creates an unintended burden. What should legislators do?",
    "options": [
      "Pass the bill unchanged because addressing the original problem is more important than evidence of unintended effects.",
      "Reject the bill permanently because one unintended burden proves that no amendment can improve it.",
      "Examine evidence, compare benefits and burdens, and debate amendments that address the problem with fewer harmful effects.",
      "Ask the affected group to enact its preferred amendment directly without parliamentary consideration."
    ],
    "correctAnswer": 2,
    "explanation": "Legislative scrutiny allows evidence-based amendments and consideration of consequences."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Court and Rights",
    "question": "Why can an unpopular court decision still support democracy?",
    "options": [
      "An unpopular ruling supports democracy only when opinion polls later show that most citizens changed their minds.",
      "Independent courts strengthen democracy by applying law and protecting rights even when a lawful result is unpopular.",
      "Courts should follow majority opinion because democratic decisions must always reflect the most popular immediate outcome.",
      "Judges should transfer unpopular cases to Parliament because elected officials are better placed to decide individual disputes."
    ],
    "correctAnswer": 1,
    "explanation": "Judicial independence and lawful reasoning matter even when outcomes are unpopular."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Information Synthesis",
    "question": "An official statement, budget table, and residents’ photos describe a project. What should a watchdog compare?",
    "options": [
      "Use the official statement alone because government publication makes spending and completion evidence unnecessary.",
      "Use residents’ photographs alone because visible work establishes the approved budget and every payment date.",
      "Compare the budget with the promise but exclude photographs because observations cannot contribute to financial accountability.",
      "Compare promises, authorized spending, dates, completed work, and each source’s reliability to identify agreements or gaps."
    ],
    "correctAnswer": 3,
    "explanation": "Comparing commitments, money, observable results, and source quality supports accountability."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Representation Trade-off",
    "question": "A representative’s constituency views are divided. What is the most responsible approach?",
    "options": [
      "Follow the largest group automatically because representation means reproducing the majority view without examining evidence.",
      "Promise each group its preferred outcome because accountability requires representatives to satisfy incompatible demands.",
      "Hear competing evidence, make a reasoned decision within the representative’s role, and explain it publicly.",
      "Delay the decision until every resident agrees because legitimate representation requires unanimous constituency support."
    ],
    "correctAnswer": 2,
    "explanation": "Representation requires listening, judgment, reasons, and accountability, not automatic unanimity."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Regional and National Rules",
    "question": "A qualified worker seeks a CSME opportunity. What two things should be checked?",
    "options": [
      "Only regional eligibility matters because CSME arrangements automatically replace destination-country procedures.",
      "Check both the worker’s regional eligibility and the qualifications, documents, and procedures required for the opportunity.",
      "Only the destination country’s visitor rules matter because employment movement is treated exactly like tourism.",
      "No checks are needed because qualification in one member state guarantees entry into every occupation in another."
    ],
    "correctAnswer": 1,
    "explanation": "Regional arrangements and applicable national procedures both matter."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Community Evidence",
    "question": "A playground is proposed on land used for flood storage. What should consultation include?",
    "options": [
      "Build the playground because children’s need for recreation necessarily outweighs flood-management evidence.",
      "Preserve the flood-storage land without examining alternatives because any existing environmental use can never be changed.",
      "Divide the site between both uses without technical study because equal land allocation resolves competing needs.",
      "Compare recreation needs, flood evidence, alternative sites, costs, and engineering advice before deciding."
    ],
    "correctAnswer": 3,
    "explanation": "The decision must combine community benefit with hazard evidence and alternatives."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Policy Evaluation",
    "question": "A new waste rule begins. Which evidence best measures success?",
    "options": [
      "Count posters and launch attendance because public awareness alone establishes whether waste volumes changed.",
      "Compare illegal dumping only, because compliance, cost, and waste totals do not affect policy success.",
      "Compare waste volumes, dumping, costs, compliance, and community feedback before and after the rule.",
      "Use the official prediction as the final measure because evaluation after implementation may unfairly contradict the policy goal."
    ],
    "correctAnswer": 2,
    "explanation": "Multiple before-and-after measures assess environmental, financial, and public effects."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Two-step Budget",
    "question": "Income is $100,000. Needs use 65%, savings 15%, and the rest is for wants. How much is available for wants?",
    "options": [
      "$15,000, because the savings percentage is the amount remaining after needs and wants.",
      "$35,000, because the 15% saved should be added to the 20% available for wants.",
      "$80,000, because needs and savings together determine the amount available for wants.",
      "$20,000, because needs and savings use 80%, leaving 20% of $100,000 for wants."
    ],
    "correctAnswer": 3,
    "explanation": "Needs and savings use 80%, leaving 20% of $100,000, or $20,000."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Unit Cost and Quality",
    "question": "Brand A costs $900 for 3 units; Brand B costs $1,100 for 5 units but one unit is usually damaged. Which comparison is needed?",
    "options": [
      "Choose Brand A because its $900 package price is lower, without calculating the cost per usable unit.",
      "Compare the cost per usable unit and reliability, because Brand B’s damaged unit changes its effective value.",
      "Choose Brand B because five listed units always provide better value than three, even when one is unusable.",
      "Treat both brands as equal because damage affects quality but cannot affect an economic comparison."
    ],
    "correctAnswer": 1,
    "explanation": "The effective cost depends on how many usable units the buyer receives."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Supply Decision",
    "question": "A drought cuts yam supply while a festival raises demand. What combined effect is most likely?",
    "options": [
      "Price pressure should fall because reduced supply and increased demand offset one another.",
      "Price should remain unchanged because the supply loss concerns producers while festival demand concerns consumers.",
      "Price is likely to face stronger upward pressure because supply falls while demand rises.",
      "Price must double because two separate changes affect the market in the same direction."
    ],
    "correctAnswer": 2,
    "explanation": "Reduced supply and increased demand both tend to push price upward."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Import and Exchange",
    "question": "An importer’s overseas price stays the same, but it takes more Jamaican dollars to pay it. What is the likely local effect?",
    "options": [
      "The local price should remain unchanged because only the overseas price affects an importer’s cost.",
      "The importer’s Jamaican-dollar cost may rise and some of that increase may be passed to buyers.",
      "The imported item becomes cheaper because using more Jamaican dollars increases the quantity purchased.",
      "Local transport costs disappear because the exchange-rate change applies only before the goods enter Jamaica."
    ],
    "correctAnswer": 1,
    "explanation": "Paying more Jamaican dollars raises the importer’s cost even when the foreign price is unchanged."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Synthesis",
    "question": "Visitor numbers rise, local jobs grow, and water shortages worsen. What policy is most balanced?",
    "options": [
      "Continue expanding tourism without water planning because additional jobs compensate residents for shortages.",
      "Restrict household water first because visitor spending makes hotel demand the highest economic priority.",
      "End tourism immediately because employment and water security cannot be supported in the same policy.",
      "Use part of tourism revenue to improve water efficiency and capacity while managing growth and protecting residents’ access."
    ],
    "correctAnswer": 3,
    "explanation": "Using economic gains to manage resource pressure can protect residents and the industry."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tax and Opportunity Cost",
    "question": "A $6 million revenue fund pays $4 million for clinic repairs. What is the opportunity cost of using the remaining $2 million for a road?",
    "options": [
      "The $4 million already spent on clinic repairs, because the chosen road makes past spending the next-best alternative.",
      "The road’s $2 million price, because opportunity cost is the amount paid for the selected project.",
      "The value of the best alternative use of the remaining $2 million that is forgone when the road is selected.",
      "All future tax revenue, because committing the remaining fund prevents the government from collecting more money."
    ],
    "correctAnswer": 2,
    "explanation": "Opportunity cost concerns the next-best alternative forgone when the remaining funds are committed."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Cooperative Calculation",
    "question": "Four fishers spend $8,000 each on ice. A shared system costs $24,000 plus $4,000 maintenance. What is the group saving?",
    "options": [
      "$1,000, because maintenance should be divided among four fishers before comparing the two totals.",
      "$4,000, because separate ice costs total $32,000 while the shared system and maintenance total $28,000.",
      "$8,000, because the group saving equals one fisher’s original individual expense.",
      "$28,000, because the final shared cost is the amount saved rather than the amount paid."
    ],
    "correctAnswer": 1,
    "explanation": "Separate costs total $32,000; shared costs total $28,000, saving $4,000."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Credit Decision",
    "question": "Loan A has lower monthly payments but lasts longer and costs more overall. What should a borrower compare?",
    "options": [
      "Choose the lower monthly payment because present affordability is the only cost relevant to borrowing.",
      "Choose the shorter loan because repayment duration alone determines whether a borrower can meet each instalment.",
      "Average the monthly payment and total repayment because combining them produces one comparable price.",
      "Compare current affordability, total repayment, fees, duration, and the risk of being unable to pay over time."
    ],
    "correctAnswer": 3,
    "explanation": "A responsible credit choice considers both current affordability and total long-term cost and risk."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Community Enterprise",
    "question": "A market upgrade increases sales but raises rents for vendors. What evidence should guide adjustments?",
    "options": [
      "Use sales growth alone because increased market activity proves that higher rent is affordable to every vendor.",
      "Compare sales, vendor income, rent burden, maintenance costs, customer access, and effects on different vendors.",
      "Reduce every rent to its former level because maintenance costs cannot justify any change after an upgrade.",
      "Keep every new rent because a completed public improvement automatically distributes benefits fairly."
    ],
    "correctAnswer": 1,
    "explanation": "The decision should assess benefits, costs, distributional effects, and sustainability."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Evaluating a Programme",
    "question": "A saving campaign raises account openings by 30%, but many accounts become inactive. What is the careful conclusion?",
    "options": [
      "The campaign completely succeeded because a 30% rise in opened accounts proves lasting saving habits.",
      "The campaign failed because inactive accounts show that no participant benefited from opening an account.",
      "Initial participation increased, but account activity and saving over time are needed to judge lasting success.",
      "Every account holder increased wealth by 30%, because account openings and savings growth are the same measure."
    ],
    "correctAnswer": 2,
    "explanation": "Account openings show initial uptake, while activity data are needed to judge lasting behaviour."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff10Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff10Questions)
      : prepareSocialStudiesPreview(g5SsDiff10Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 10",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 10</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 10</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 10</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
