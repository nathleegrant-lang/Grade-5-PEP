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

const g5SsDiff6Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Evidence from Artefacts",
    "question": "Archaeologists find cassava griddles, shell hooks and canoe pieces at a Taíno site. Which conclusion uses all three findings?",
    "options": [
      "The community relied mainly on European food, because cassava tools and shell hooks were imported after contact.",
      "The community cultivated cassava, caught marine food, and used canoes for water travel.",
      "The site specialized only in canoe building, because canoe pieces explain the other artefacts found there.",
      "Every family performed identical work, because three kinds of artefact establish how labour was divided."
    ],
    "correctAnswer": 1,
    "explanation": "The griddles support cassava preparation, hooks support fishing and canoe pieces support water travel, so the combined evidence points to several connected activities."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Comparing Colonial Accounts",
    "question": "A Spanish report praises a new settlement, while a Taíno account describes lost land and forced work. What is the strongest use of both sources?",
    "options": [
      "Prefer the Spanish report because official authors had no reason to emphasize the settlement’s successes.",
      "Prefer the Taíno account because experiencing harm guarantees complete knowledge of every settlement decision.",
      "Compare authorship and purpose, using both accounts to examine different experiences and checking their claims against other evidence.",
      "Treat every claim as equally accurate because averaging conflicting viewpoints removes bias."
    ],
    "correctAnswer": 2,
    "explanation": "The sources represent different positions and purposes. Comparing them can reveal both colonial aims and the effects experienced by Taíno people."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Chronology and Consequence",
    "question": "Put these developments in order: English capture of Jamaica, Baptist War, full freedom, Independence. Which sequence is correct?",
    "options": [
      "Baptist War → English capture → full freedom → Independence",
      "English capture → Baptist War → full freedom → Independence",
      "English capture → full freedom → Baptist War → Independence",
      "Baptist War → full freedom → English capture → Independence"
    ],
    "correctAnswer": 1,
    "explanation": "England captured Jamaica in 1655; the Baptist War occurred in 1831–1832; full freedom came in 1838; and Independence came in 1962."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Cause and Evidence",
    "question": "Planning notes and messages made before the Baptist War describe coordinated action and demands for freedom. Which additional evidence would most directly strengthen the conclusion that the uprising was planned rather than accidental?",
    "options": [
      "A plantation photograph made long after the uprising, because buildings establish whether resistance was planned.",
      "A list of parishes used after Independence, because later boundaries explain the uprising’s organization.",
      "A weather report from the following year, because rainfall shows whether the disturbance was sudden.",
      "Meeting testimony, communications, or records showing organized resistance and demands before the uprising."
    ],
    "correctAnswer": 3,
    "explanation": "Further pre-uprising evidence of meetings, communication, organization, or demands would directly strengthen the conclusion that the resistance was planned rather than accidental."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Emancipation Stages",
    "question": "Why do historians use both 1834 and 1838 when explaining emancipation in Jamaica?",
    "options": [
      "1834 brought full freedom, while 1838 began a new compulsory labour arrangement called Apprenticeship.",
      "1834 established Jamaica’s Independence, while 1838 widened voting rights to all adults.",
      "Slavery was abolished in 1834 with Apprenticeship as a transitional system; full freedom followed in 1838.",
      "The two dates are competing estimates for one event, so historians select whichever source appears earlier."
    ],
    "correctAnswer": 2,
    "explanation": "Slavery formally ended in 1834, but Apprenticeship continued until full freedom in 1838. Both dates are needed to explain the stages."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Competing Causes",
    "question": "Two explanations of Morant Bay focus on Paul Bogle's leadership and on wider land, poverty and justice grievances. Which conclusion is best?",
    "options": [
      "Paul Bogle’s leadership fully explains the event, so land, poverty, and justice concerns add no useful evidence.",
      "Wider grievances fully explain the event, so leadership and organized action should be excluded from the account.",
      "The explanations cannot be combined because historical events must have either individual or social causes.",
      "Bogle’s leadership helped organize action within wider grievances concerning land, poverty, and justice."
    ],
    "correctAnswer": 3,
    "explanation": "Paul Bogle's leadership and the wider grievances are complementary evidence: leadership shaped the protest, while existing conditions help explain why people joined."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Heroic Contribution",
    "question": "A display includes Nanny's resistance, Garvey's political ideas and Bustamante's labour leadership. What common conclusion is supported?",
    "options": [
      "The three figures are honoured because each held the same political office and used similar methods.",
      "Service to Jamaica can involve different forms of resistance, political leadership, and labour action in different periods.",
      "Political advocacy is the main form of national service, making resistance and labour leadership less significant.",
      "National recognition depends mainly on leading the largest group rather than the purpose or impact of service."
    ],
    "correctAnswer": 1,
    "explanation": "The examples show different forms of national contribution—resistance, political organization and labour leadership—across different periods."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Interpreting Labour Evidence",
    "question": "Wage records show very low pay in 1938, newspapers report protests, and later records show stronger unions. Which link is best supported?",
    "options": [
      "Stronger unions caused the earlier low wages, which then produced protests against the organizations workers had formed.",
      "The protests removed the need for continuing labour organization because the 1938 demands were settled immediately.",
      "Low wages contributed to protest, and the unrest helped encourage stronger labour organization afterward.",
      "Low pay proves every worker joined the same union and supported identical political responses."
    ],
    "correctAnswer": 2,
    "explanation": "The evidence supports a sequence in which hardship contributed to protest and the unrest encouraged stronger labour and political organization."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Suffrage and Independence",
    "question": "A timeline marks Universal Adult Suffrage in 1944 and Independence in 1962. What distinction should accompany it?",
    "options": [
      "Universal Adult Suffrage established Jamaica as sovereign, while Independence merely expanded the number of voters.",
      "Suffrage widened electoral participation in 1944; Independence changed Jamaica’s political status in 1962.",
      "Independence introduced adult voting for the first time, while suffrage ended British colonial government.",
      "Both events produced the same constitutional change but are listed separately because different leaders announced them."
    ],
    "correctAnswer": 1,
    "explanation": "Universal Adult Suffrage greatly widened voting rights, while Independence established Jamaica as an independent country. They were related but distinct developments."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Evaluating Memorial Evidence",
    "question": "A monument names one leader, but letters and meeting records identify many community participants. How should a museum use this evidence?",
    "options": [
      "Remove the named leader because evidence of wider participation makes individual leadership historically irrelevant.",
      "Keep only the monument’s account because a public memorial is more authoritative than letters or meeting records.",
      "Explain the leader’s particular contribution while also presenting evidence of the community participants and their roles.",
      "Describe every participant as performing the leader’s role because collective action means responsibilities were identical."
    ],
    "correctAnswer": 2,
    "explanation": "The evidence supports recognizing the leader while also showing that many people contributed in different ways."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Scale and Hazard",
    "question": "On a map, 1 cm represents 4 km. Route A is 5 cm and crosses a landslide zone; Route B is 6 cm and avoids it. Which decision uses both facts?",
    "options": [
      "Take Route A because saving 4 km outweighs a mapped landslide warning during every journey.",
      "Take Route B because any route measuring 6 cm is safer than every route measuring 5 cm.",
      "Take Route B: it is 24 km rather than 20 km, but it avoids the identified landslide zone.",
      "Take Route A and assess the landslide after travelling through it, because map warnings cannot guide advance decisions."
    ],
    "correctAnswer": 2,
    "explanation": "Route A is 20 km and Route B is 24 km. Route B is longer, but avoiding the known landslide zone makes it the stronger safety decision."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Direction and Relief",
    "question": "A river begins in mountains north-east of a town and reaches the sea south-west of it. In which general direction does the river flow?",
    "options": [
      "North-east, because the river begins in that direction from the town.",
      "North-west, because mountain rivers flow west while moving away from higher land.",
      "South-east, because reaching the sea requires reversing only the northward part of the starting direction.",
      "South-west, because the river travels from the mountains north-east of town toward the sea south-west of town."
    ],
    "correctAnswer": 3,
    "explanation": "The river moves from its source north-east of the town toward the sea south-west of the town, so its general flow is south-west."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Watershed Evidence",
    "question": "After hillside trees are removed, a river becomes muddier during rain. Which investigation best tests whether clearing contributed?",
    "options": [
      "Measure sediment once after a dry week, because a single clear reading establishes conditions during rain.",
      "Compare clearing dates, rainfall, and repeated sediment readings before and after tree removal while checking other changes.",
      "Compare the river with traffic in another watershed, because vehicle counts measure the effect of hillside vegetation.",
      "Ask whether residents prefer clear water, because preference establishes what caused the increased mud."
    ],
    "correctAnswer": 1,
    "explanation": "Comparing the timing of clearing, rainfall and sediment provides evidence for whether runoff from the cleared hillside increased river mud."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Rainfall Explanation",
    "question": "Two farms are at similar elevations, but the windward farm receives more rain. Which explanation best fits the evidence?",
    "options": [
      "The windward farm receives more rain because being nearer the Moon increases the pull on clouds.",
      "The leeward farm receives less rain because that side cannot receive rainfall during any season.",
      "Moist air rises over the windward slope, cools, and condenses, producing more rainfall there.",
      "The farms’ similar elevation proves air movement cannot contribute to their different rainfall totals."
    ],
    "correctAnswer": 2,
    "explanation": "Moist air forced upward on a windward slope cools and condenses, producing more relief rainfall before the air descends on the leeward side."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Hurricane Risk",
    "question": "A community is outside the forecast eye path but lies beside a river and below steep slopes. Which warning is most justified?",
    "options": [
      "The community is safe because locations outside the forecast eye path cannot receive dangerous rainfall.",
      "Heavy rainfall may still trigger river flooding and slope failure even when the hurricane’s eye passes elsewhere.",
      "Only storm surge matters because inland river and slope hazards occur solely within the eye.",
      "Drought preparation is the main need because hurricanes outside the eye path reduce rainfall near rivers."
    ],
    "correctAnswer": 1,
    "explanation": "Hurricane hazards extend beyond the eye. Heavy rainfall can raise rivers and destabilize steep slopes even away from the centre."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Storm-Surge Decision",
    "question": "High tide is expected near the time of a hurricane's closest approach. Why should a low coastal community treat this as added risk?",
    "options": [
      "High tide weakens storm-driven water because the rising sea moves in the opposite direction from surge.",
      "High tide prevents strong winds from reaching low coastal land by covering the shoreline first.",
      "Storm surge occurs only in upland rivers, so coastal tide timing does not affect flooding.",
      "High tide raises the starting water level, so storm-driven water can produce deeper and farther-reaching coastal flooding."
    ],
    "correctAnswer": 3,
    "explanation": "A high tide raises the normal sea level, so storm-driven water can push farther inland and produce deeper flooding."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Mangrove Trade-off",
    "question": "A proposal would clear mangroves for shops beside a fishing village. Which plan best weighs livelihoods and coastal protection?",
    "options": [
      "Clear the mangroves because immediate shop income provides greater protection than coastal vegetation.",
      "Reject every coastal business because livelihoods and mangrove protection cannot operate within one plan.",
      "Protect important mangroves and locate suitable development on less sensitive land after comparing access and risk.",
      "Let each builder identify valuable mangroves independently, because separate decisions produce consistent coastal protection."
    ],
    "correctAnswer": 2,
    "explanation": "Protecting important mangroves supports fish habitat and coastal protection, while locating development elsewhere allows economic activity with less damage."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Reef Evidence",
    "question": "A reef survey records broken coral near anchor sites but healthier coral near moorings. What action follows most directly from the evidence?",
    "options": [
      "Require more anchoring at already damaged sites so pressure is concentrated away from healthy coral.",
      "Install and require properly placed moorings in vulnerable reef areas to reduce repeated anchor damage.",
      "Close inland farms first because distant land activity is the most direct evidence supplied by the anchor-site survey.",
      "Continue anchoring until every site is surveyed, because the healthier mooring areas do not support a management decision."
    ],
    "correctAnswer": 1,
    "explanation": "The contrast between anchor sites and mooring sites directly supports using moorings to reduce further anchor damage."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Climate and Weather",
    "question": "Thirty-year records show rising average temperature, but one month was unusually cool. Which conclusion is sound?",
    "options": [
      "The unusually cool month disproves the thirty-year pattern because recent observations always replace older averages.",
      "The thirty-year record should omit every cool month because a warming trend requires each month to be warmer.",
      "A single cool month describes short-term variation, while the thirty-year record can still show a long-term trend.",
      "The average means each new month must exceed the previous month, so one decrease makes the record invalid."
    ],
    "correctAnswer": 2,
    "explanation": "One cool month is short-term weather evidence; it does not cancel a trend calculated from many years of observations."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Population and Water Data",
    "question": "Population rises by 20%, water demand by 25%, and supply capacity by 5%. What is the clearest planning concern?",
    "options": [
      "Supply capacity is growing fastest because any increase in infrastructure exceeds population growth.",
      "Population growth will reduce demand because more users cause each household to consume less automatically.",
      "The figures prove excess water because capacity and demand both increased during the period.",
      "Demand is rising much faster than capacity, so conservation, leakage reduction, or added supply may be needed."
    ],
    "correctAnswer": 3,
    "explanation": "Demand is rising much faster than supply capacity, creating a likely shortfall unless use is reduced or supply is expanded."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Parliamentary Evidence",
    "question": "A bill is debated in the House and Senate before being presented for formal approval. What does this show?",
    "options": [
      "The House alone makes national laws because Senate consideration is optional whenever a bill is debated publicly.",
      "Municipal Corporations make national laws, while the House and Senate approve only local-service plans.",
      "National law-making includes consideration through both parliamentary chambers before formal constitutional steps.",
      "Courts draft and debate bills first, after which Parliament decides whether to hear the individual case."
    ],
    "correctAnswer": 2,
    "explanation": "Jamaica's Parliament includes the House of Representatives and Senate; consideration through the chambers forms part of national law-making."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "A report claims the Governor-General may replace elected policy whenever preferred. Which correction is strongest?",
    "options": [
      "The Governor-General may replace elected policy whenever a different decision appears more suitable.",
      "The office performs formal constitutional duties within Jamaica’s elected and parliamentary system rather than independently directing policy.",
      "The office directs every ministry while elected ministers carry out ceremonial functions assigned by Parliament.",
      "The office replaces courts on constitutional questions because formal approval includes deciding legal disputes."
    ],
    "correctAnswer": 1,
    "explanation": "The Governor-General has constitutionally defined formal duties within Jamaica's system; the office does not freely replace elected-government policy."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Judicial Independence",
    "question": "A crowd demands a verdict before witnesses are heard. What response best protects justice?",
    "options": [
      "The court should follow the largest crowd because public agreement supplies stronger evidence than individual witnesses.",
      "Parliament should debate the facts and select a verdict because elected bodies represent the public.",
      "The accused should select the verdict after hearing the witnesses because personal liberty includes deciding the case.",
      "The court should assess witnesses and other evidence under the law without improper political or crowd pressure."
    ],
    "correctAnswer": 3,
    "explanation": "Judicial independence requires courts to decide cases using evidence and law, rather than pressure from crowds or political bodies."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Local Authority Decision",
    "question": "Residents report a blocked local drain and damaged parochial road. Why is the Municipal Corporation an appropriate first contact?",
    "options": [
      "The Municipal Corporation is appropriate because it determines Jamaica’s national monetary policy and funds every road directly.",
      "It is appropriate because it decides criminal appeals involving damage to local roads and drains.",
      "It manages many local infrastructure and service responsibilities, including local roads and drainage matters.",
      "It is appropriate because CARICOM assigns treaty and regional-transport negotiations to each local authority."
    ],
    "correctAnswer": 2,
    "explanation": "Municipal Corporations are local authorities responsible for many local services, including local infrastructure such as roads and drains."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Rights and Safety",
    "question": "Officials temporarily restrict entry to an unstable coastal cliff after heavy rain. Which test best evaluates the restriction?",
    "options": [
      "Whether most residents approve the restriction, because majority support is sufficient even if no safety risk exists.",
      "Whether it addresses a genuine safety risk, is fairly applied, and remains only as broad and long as necessary.",
      "Whether officials can maintain it without explaining the hazard, because temporary restrictions need no reason.",
      "Whether it stops residents discussing the cliff, because limiting information is the most direct way to prevent entry."
    ],
    "correctAnswer": 1,
    "explanation": "A safety restriction should address a genuine risk, be fair and remain only as long as necessary rather than remove rights without limits."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Responsible Participation",
    "question": "Residents want a safer crossing near a school. Which sequence shows responsible civic action?",
    "options": [
      "Block traffic first so officials experience the danger, then gather evidence after a crossing is promised.",
      "Consult only residents supporting one design so the proposal presents a clear community position.",
      "Submit anonymous claims without verification because officials should investigate every rumour before residents collect evidence.",
      "Document the hazard, consult affected people, submit a lawful proposal, and follow up through responsible channels."
    ],
    "correctAnswer": 3,
    "explanation": "Responsible participation uses evidence and consultation, follows lawful processes and includes monitoring the response."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Public Evidence",
    "question": "A survey receives 500 identical online entries and 60 verified responses from local households. What should decision-makers do?",
    "options": [
      "Count every entry because a larger online total is more representative even when submissions may be duplicated.",
      "Use only the 60 household responses because verified evidence makes all online participation irrelevant.",
      "Check for duplication and eligibility, then weigh verified, relevant evidence rather than treating raw totals as decisive.",
      "Discard every online response because digital participation cannot provide legitimate evidence for a local decision."
    ],
    "correctAnswer": 2,
    "explanation": "Verification helps distinguish genuine participation from duplication, while relevant evidence matters alongside the number of responses."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "CARICOM Movement",
    "question": "A qualified worker may use a CARICOM arrangement but still must present approved documents. What principle does this illustrate?",
    "options": [
      "Regional arrangements remove national procedures once a worker qualifies in any CARICOM member state.",
      "Regional opportunities operate through eligibility rules, approved categories, documents, and applicable national procedures.",
      "Municipal Corporations issue all regional employment qualifications because local authorities manage worker movement.",
      "Regional cooperation prevents destination governments from checking qualifications after a person enters the country."
    ],
    "correctAnswer": 1,
    "explanation": "Regional movement arrangements apply to eligible persons and still involve required documentation and administrative procedures."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Accountability Evidence",
    "question": "A public project costs J$3 million more than approved. Which evidence is most important for accountability?",
    "options": [
      "The original budget alone, because approved figures show actual spending even when the final cost differs.",
      "A photograph of the finished project, because visible completion proves that every additional expense was authorized.",
      "A public speech supporting the project, because popularity provides evidence that the extra cost was necessary.",
      "Itemised actual spending, approved variations, invoices, and authorized reasons explaining the J$3 million difference."
    ],
    "correctAnswer": 3,
    "explanation": "Accountability requires records showing what was spent and why actual costs differed from the authorised budget."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Majority and Safety",
    "question": "Most residents choose a playground site, but engineers find unstable ground there. What should officials explain?",
    "options": [
      "Follow the majority preference because voting changes the ground risk by establishing public acceptance of it.",
      "Ignore the preference because engineering evidence means residents should have no role in choosing alternatives.",
      "Explain the unstable-ground evidence, its safety consequences, and how the public preference will be reconsidered alongside safer alternatives.",
      "Conceal the risk and quietly choose another site because explaining a conflict between evidence and preference reduces trust."
    ],
    "correctAnswer": 2,
    "explanation": "Public preference matters, but officials also have a responsibility to protect safety using reliable evidence about the site."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Revenue and Profit",
    "question": "A shop's sales revenue rises from J$80,000 to J$95,000, while costs rise from J$60,000 to J$82,000. What happened to profit?",
    "options": [
      "Profit rose from J$20,000 to J$23,000 because the J$15,000 revenue increase should be added to the original profit.",
      "Profit stayed at J$20,000 because both sales revenue and costs increased during the period.",
      "Profit became J$177,000 because the final revenue and cost totals should be added.",
      "Profit fell from J$20,000 to J$13,000 because costs increased by more than sales revenue."
    ],
    "correctAnswer": 3,
    "explanation": "Profit was J$20,000 before and J$13,000 after. Revenue rose, but costs rose by more, so profit fell."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Demand Evidence",
    "question": "Ticket price falls and attendance rises, but a popular performer was also announced. What conclusion is most careful?",
    "options": [
      "The price reduction alone caused the increase because attendance always responds only to ticket price.",
      "The performer alone caused the increase because entertainment demand cannot also respond to price.",
      "Both changes could have influenced attendance, so comparison with other events or periods is needed to separate their effects.",
      "Neither change can be examined because two simultaneous influences make attendance evidence unusable."
    ],
    "correctAnswer": 2,
    "explanation": "Because price and the performer changed, either or both could have influenced attendance; the evidence does not isolate one cause."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Import Decision",
    "question": "A juice maker compares cheaper imported fruit with reliable local fruit that supports nearby farms. Which evaluation is strongest?",
    "options": [
      "Choose imported fruit because the lowest purchase price necessarily produces the lowest total cost and most reliable supply.",
      "Compare usable quality, reliability, transport and total cost, along with effects on nearby suppliers, before choosing.",
      "Choose local fruit without checking price or availability because support for local farms outweighs every production requirement.",
      "Stop producing juice because any choice involving economic and community trade-offs is too uncertain to evaluate."
    ],
    "correctAnswer": 1,
    "explanation": "A sound decision weighs several relevant factors rather than using price or origin alone."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Tax and Service",
    "question": "Residents ask why taxes are needed for a public clinic. Which explanation is best supported?",
    "options": [
      "Taxes are needed because collecting shared revenue removes the need to monitor clinic spending or service quality.",
      "Only people treated during one month should fund the clinic because public services benefit no one outside current users.",
      "A public clinic can operate without paid workers, equipment, maintenance, or supplies once government owns the building.",
      "Shared tax revenue helps fund staff, equipment, supplies, and maintenance for a service available to the wider public."
    ],
    "correctAnswer": 3,
    "explanation": "Taxes pool resources to provide and maintain public services whose costs cannot be met by a single household."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Trade-off",
    "question": "A festival raises local sales but produces extra waste. Which plan keeps the benefit while addressing the cost?",
    "options": [
      "Cancel the festival permanently because commercial activity and responsible waste management cannot coexist.",
      "Continue without changes because additional sales compensate the community for every environmental cost.",
      "Provide adequate collection, enforce disposal rules, assign responsibilities, and review results while retaining useful festival activity.",
      "Move the waste outside the festival district because transferring the cost preserves both sales and environmental quality."
    ],
    "correctAnswer": 2,
    "explanation": "Waste controls and monitoring can preserve economic activity while reducing costs imposed on residents and the environment."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Cooperative Decision",
    "question": "A cooperative considers a loan for equipment that may cut costs. What should members compare before borrowing?",
    "options": [
      "Compare the loan amount with last year’s rainfall because weather data determine whether repayment is affordable.",
      "Compare expected cost savings and additional sales with total repayment, fees, uncertainty, and the cooperative’s ability to pay.",
      "Use one confident member’s opinion because shared borrowing removes the need for estimates or risk analysis.",
      "Choose the newest equipment because improved technology guarantees savings greater than every loan cost."
    ],
    "correctAnswer": 1,
    "explanation": "Members need realistic estimates of benefits and sales compared with repayment obligations and the risk that results may be lower than expected."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Budget Trade-off",
    "question": "A family has J$50,000 after rent. Food and transport require J$38,000, a phone costs J$18,000, and saving is planned. What is the strongest decision?",
    "options": [
      "Buy the phone first because a durable item provides more future value than current food and transport needs.",
      "Divide the J$50,000 equally among all categories because equal amounts produce the fairest household budget.",
      "Borrow for food, transport, the phone, and saving because credit prevents priorities from competing.",
      "Pay the J$38,000 food and transport needs, then allocate the J$12,000 remainder between saving and affordable wants."
    ],
    "correctAnswer": 3,
    "explanation": "Food and transport are needs. After paying J$38,000, the J$12,000 remainder cannot cover the phone and saving, so priorities must be set."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Credit Comparison",
    "question": "An appliance costs J$40,000 cash or twelve payments of J$4,000. What evidence should guide the choice?",
    "options": [
      "Choose instalments because each J$4,000 payment is lower than J$40,000, regardless of the final total.",
      "The instalments total J$48,000, so compare the extra J$8,000 and repayment risk with the benefit of obtaining the appliance now.",
      "Choose cash because money paid immediately has no opportunity cost or effect on other household needs.",
      "Treat both as J$40,000 because monthly payments stop affecting total cost once the appliance is received."
    ],
    "correctAnswer": 1,
    "explanation": "The instalments total J$48,000, which is J$8,000 more than cash. The household should weigh that extra cost against timing and affordability."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Community Cost",
    "question": "A quarry creates jobs but dust increases cleaning and health costs nearby. Why is job income not the complete result?",
    "options": [
      "Count job income only because employment benefits automatically cancel health and cleaning costs paid by others.",
      "Exclude cleaning and health costs because they occur outside the quarry’s own financial accounts.",
      "Include job and business benefits alongside dust-related health, cleaning, and other costs borne by nearby residents.",
      "Use the quarry’s selling price as the complete result because community effects cannot be included in economic decisions."
    ],
    "correctAnswer": 2,
    "explanation": "A complete evaluation includes benefits to workers and costs borne by residents, not just the quarry's private income."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Enterprise Evidence",
    "question": "Two products receive praise. Product A also has repeated paid orders; Product B has compliments but loses money in test sales. Which has stronger evidence of viability?",
    "options": [
      "Product B, because verbal praise provides stronger evidence of demand than purchases and costs.",
      "Product A, because repeated paid orders and positive financial results provide stronger viability evidence than compliments with losses.",
      "Both products, because customer response matters but financial results do not affect whether an enterprise can continue.",
      "Product B, because losses during test sales prove customers will return often enough to make later production profitable."
    ],
    "correctAnswer": 1,
    "explanation": "Repeated paid orders provide direct evidence of demand, while test-sale losses show that Product B's praise has not yet produced a viable result."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff6MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff6Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff6Questions)
      : prepareSocialStudiesPreview(g5SsDiff6Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 6",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 6</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 6</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 6</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
