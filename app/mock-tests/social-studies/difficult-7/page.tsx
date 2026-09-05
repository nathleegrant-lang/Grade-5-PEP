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

const g5SsDiff7Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Chronology and Evidence",
    "question": "A timeline lists Spanish settlement, the English capture of Jamaica, Emancipation, and Independence. Which comparison best explains why the English capture belongs before Emancipation?",
    "options": [
      "It belongs after Emancipation because British rule began only when slavery ended.",
      "It belongs before Emancipation because the capture began the period of British rule in which slavery was later abolished.",
      "It belongs beside Independence because both events transferred government directly to Jamaicans.",
      "It belongs before Spanish settlement because England controlled Jamaica before Spain did."
    ],
    "correctAnswer": 1,
    "explanation": "The English captured Jamaica in 1655, beginning British rule. Emancipation came much later in 1838, so the capture belongs earlier on the timeline."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Cause and Consequence",
    "question": "Two accounts describe the decline of the Taíno population. One stresses warfare; the other stresses disease and forced labour. What is the strongest conclusion?",
    "options": [
      "The warfare account should replace the other account because political events are more reliable than social evidence.",
      "The accounts cannot both contribute because each historical change must have one main cause.",
      "The different evidence suggests that disease, violence, and forced labour may have worked together in the decline.",
      "The disease account should be accepted alone because illnesses always affect every community in the same way."
    ],
    "correctAnswer": 2,
    "explanation": "Historical changes often have several causes. Comparing the accounts supports a conclusion that warfare, disease, and forced labour all contributed."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Comparing Periods",
    "question": "Which change most clearly distinguishes Apprenticeship from full Emancipation in Jamaica?",
    "options": [
      "Apprenticeship continued compulsory labour under restrictions, whereas full Emancipation ended that transitional system.",
      "Apprenticeship introduced voting rights, whereas full Emancipation created Jamaica’s Parliament.",
      "Apprenticeship ended British rule, whereas full Emancipation restored colonial government.",
      "Apprenticeship applied only to plantation owners, whereas full Emancipation applied only to workers in towns."
    ],
    "correctAnswer": 0,
    "explanation": "During Apprenticeship, formerly enslaved people remained under labour restrictions. Full Emancipation in 1838 ended that system."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Using Sources",
    "question": "A newspaper printed in 1938 reports workers demanding better wages. A later textbook explains several causes of the labour unrest. How should a student use them?",
    "options": [
      "Treat both as eyewitness reports because any source discussing 1938 was necessarily written during the unrest.",
      "Use the later textbook only, since a source written afterward automatically includes every important viewpoint.",
      "Use the newspaper for contemporary reporting and the textbook for a later synthesis, while checking the evidence and limits of each.",
      "Use the newspaper only, since being closer in time makes a source complete and free from bias."
    ],
    "correctAnswer": 2,
    "explanation": "The newspaper is contemporary evidence, while the textbook can combine and interpret several sources. Their different purposes make comparison useful."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Chronology",
    "question": "Which sequence correctly places these developments from earliest to latest?",
    "options": [
      "Morant Bay Rebellion → Baptist War → 1938 labour unrest → Independence",
      "Baptist War → Morant Bay Rebellion → 1938 labour unrest → Independence",
      "Baptist War → 1938 labour unrest → Morant Bay Rebellion → Independence",
      "Morant Bay Rebellion → 1938 labour unrest → Baptist War → Independence"
    ],
    "correctAnswer": 1,
    "explanation": "The Baptist War occurred in 1831–32, Morant Bay in 1865, the labour unrest in 1938, and Independence in 1962."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Comparing Leadership",
    "question": "Sam Sharpe and Paul Bogle lived in different periods. Which comparison is best supported by their actions?",
    "options": [
      "Both challenged injustice, but Sharpe is associated with the Baptist War and Bogle with the Morant Bay Rebellion.",
      "Both challenged injustice through the same rebellion, although Bogle acted several decades before Sharpe.",
      "Both led electoral campaigns after Universal Adult Suffrage, but they represented different political parties.",
      "Both negotiated Jamaica’s Independence, although Sharpe focused on labour and Bogle on constitutional reform."
    ],
    "correctAnswer": 0,
    "explanation": "Both men resisted injustice, but their actions belong to different events: Sharpe to the Baptist War and Bogle to the Morant Bay Rebellion."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Change over Time",
    "question": "Why is Universal Adult Suffrage in 1944 an important step to place before Independence in 1962?",
    "options": [
      "It transferred Jamaica from Spanish to British rule and allowed the first colonial election to occur.",
      "It completed Jamaica’s Independence and then allowed political parties to begin campaigning.",
      "It widened voting rights and strengthened Jamaicans’ participation in representative government before Independence.",
      "It ended Apprenticeship and immediately gave every adult the right to hold a seat in Parliament."
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage widened participation in elections in 1944. This helped develop self-government before Independence in 1962."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Evaluating Claims",
    "question": "A poster says, “Independence changed every part of Jamaican life immediately.” Which evidence would best challenge that claim?",
    "options": [
      "Records showing that important institutions and social conditions changed at different rates after 1962.",
      "A programme listing the events held during Jamaica’s first Independence celebrations.",
      "A photograph showing a large crowd attending the Independence ceremony in Kingston.",
      "A list identifying the flag, anthem, and other national symbols associated with Independence."
    ],
    "correctAnswer": 0,
    "explanation": "Evidence of gradual change would challenge the absolute word “every” and the claim that all change was immediate."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Historical Comparison",
    "question": "Which comparison best explains why both the Baptist War and Morant Bay Rebellion are studied?",
    "options": [
      "They are studied because each immediately ended the injustice its participants opposed.",
      "They show demands for justice in different periods and help explain later political and social change.",
      "They are studied as two names for the same uprising led by the same group of people.",
      "They show that organized resistance began only after Jamaica achieved Independence."
    ],
    "correctAnswer": 1,
    "explanation": "The events occurred in different periods but both reveal struggles over injustice and are important to understanding later developments."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Evidence and Interpretation",
    "question": "A family story says an ancestor voted in Jamaica in 1930. What should a student do before using this as evidence about Universal Adult Suffrage?",
    "options": [
      "Accept the date because an account passed through a family is more accurate than an official record.",
      "Reject the story because oral evidence cannot contribute to historical investigation.",
      "Change the reported year to 1944 so the account agrees with the introduction of Universal Adult Suffrage.",
      "Compare the family account with voting laws and electoral records showing who could vote in 1930."
    ],
    "correctAnswer": 3,
    "explanation": "Oral history can be valuable, but the claim should be checked against voting records and the 1944 introduction of Universal Adult Suffrage."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Comparison",
    "question": "Map A shows steep slopes and short rivers; Map B shows flatter land and wider floodplains. Which comparison best predicts flood behaviour?",
    "options": [
      "Map A is more likely to flood widely because steep slopes always hold river water in one place.",
      "Both maps predict identical flooding because slope and floodplain width do not affect water movement.",
      "Map B may experience water spreading across a wider low-lying floodplain, while Map A may have faster runoff from steep slopes.",
      "Map B is less likely to flood because flatter land always carries water away more quickly."
    ],
    "correctAnswer": 2,
    "explanation": "On flatter floodplains, overflowing water can spread across a broad low-lying area. Steep slopes affect runoff but do not prevent flooding."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Scale and Distance",
    "question": "On one map, 1 cm represents 5 km. A road measures 7 cm. A second route is listed as 30 km. Which is shorter and by how much?",
    "options": [
      "The mapped road is shorter by 5 km because seven map units represent 25 km.",
      "Both routes are 30 km because the map distance must equal the listed distance.",
      "The listed route is shorter by 12 km because 30 minus 7 equals 23 km.",
      "The listed route is shorter by 5 km because the mapped road represents 35 km."
    ],
    "correctAnswer": 3,
    "explanation": "The mapped road is 7 × 5 = 35 km. The 30 km route is therefore shorter by 5 km."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Comparison",
    "question": "Town P records 180 mm of rain and Town Q records 90 mm in the same month. Which statement is justified?",
    "options": [
      "Town P probably has twice as many rivers because it recorded twice the rainfall.",
      "Town P recorded twice Town Q’s rainfall that month, but the figures alone do not establish flooding or location.",
      "Town Q must lie on the drier side of Jamaica because its total was exactly half of Town P’s.",
      "Town P was certain to flood because any monthly total above 100 mm causes flooding."
    ],
    "correctAnswer": 1,
    "explanation": "Because 180 is twice 90, the rainfall comparison is justified. The data alone do not prove location, river number, or flooding."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Settlement Decisions",
    "question": "Two sites are considered for homes. Site A is near jobs but lies on a floodplain; Site B is farther from jobs but on safer, serviced land. What is the best comparison?",
    "options": [
      "Site A should be chosen because shorter travel to jobs outweighs any flood exposure or service concern.",
      "Site B should be chosen because higher safety means transport distance and cost no longer matter.",
      "Site B reduces flood exposure and already has services, but planners should also assess transport access to jobs.",
      "The sites should be treated as equal because employment access and hazard exposure cannot be compared."
    ],
    "correctAnswer": 2,
    "explanation": "A sound decision compares safety, services, and access. Site B may reduce flood exposure, but its distance from jobs still matters."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Coastal Change",
    "question": "A beach becomes narrower after mangroves near a river mouth are removed. Which explanation should be investigated first?",
    "options": [
      "The river probably carried no sediment after mangroves were removed, causing the sea to become permanently deeper.",
      "Mangrove removal may have reduced wave protection and sediment trapping, contributing to beach erosion alongside other possible causes.",
      "The narrower beach shows that rainfall stopped reaching the river mouth after the vegetation was cleared.",
      "Mangroves likely caused the erosion before removal, because their roots prevented sand from moving along the coast."
    ],
    "correctAnswer": 1,
    "explanation": "Mangroves can reduce wave energy and trap sediment. Their removal may contribute to erosion, although other evidence should also be checked."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Hazard Comparison",
    "question": "Why might the same hurricane cause different damage in two communities?",
    "options": [
      "The community nearer the hurricane centre must have more damage, regardless of buildings or preparation.",
      "Population size alone determines damage because larger communities always contain weaker buildings.",
      "Both communities should receive equal damage if the storm’s wind speed is the same at each location.",
      "Differences in exposure, building strength, landform, and preparation can produce different damage from the same hurricane."
    ],
    "correctAnswer": 3,
    "explanation": "Hazard impact depends on both the storm and community conditions such as exposure, buildings, and preparation."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Direction and Route",
    "question": "A clinic is east of a school. A shelter is north of the clinic. In which general direction is the shelter from the school?",
    "options": [
      "The shelter is north-east because the route moves east from the school and then north from the clinic.",
      "The shelter is north-west because every northward turn reverses the earlier eastward movement.",
      "The shelter is south-east because the clinic lies east of the school and the shelter is beyond the clinic.",
      "The shelter is directly north because the eastward part of a two-stage route does not affect final direction."
    ],
    "correctAnswer": 0,
    "explanation": "Travelling east from the school and then north places the shelter north-east of the school."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Watershed Reasoning",
    "question": "Community A protects trees in the upper watershed; Community B clears similar slopes. After heavy rain, what comparison is most reasonable?",
    "options": [
      "Community B may have less erosion because cleared slopes allow rainwater to soak in without obstruction.",
      "Community A may have slower runoff and less soil loss because protected vegetation intercepts rain and holds soil.",
      "Both communities should have identical runoff because they receive the same heavy rainfall.",
      "Community A cannot flood because tree protection removes all watershed hazards."
    ],
    "correctAnswer": 1,
    "explanation": "Vegetation can slow runoff and hold soil, so protected slopes may experience less erosion and rapid runoff. It does not remove all flood risk."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Interpreting Data",
    "question": "A parish’s population grows while the amount of serviced housing changes little. Which pressure is most likely to increase first?",
    "options": [
      "Pressure on serviced housing may fall because population growth automatically produces new homes.",
      "The parish boundary is likely to expand so that population density remains unchanged.",
      "Demand for housing, water, transport, and related services is likely to rise faster than supply.",
      "Demand for services should remain stable because only the amount of housing—not population—affects it."
    ],
    "correctAnswer": 2,
    "explanation": "More people competing for nearly the same amount of serviced housing increases demand for housing and services."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Comparing Conservation Choices",
    "question": "A fishing community considers a closed season or allowing unlimited catch. Which evidence best supports the closed season?",
    "options": [
      "A map showing where fishing boats usually operate, without catch or breeding data.",
      "Records showing that fish prices rise during months when fewer boats leave shore.",
      "Interviews showing that some fishers prefer shorter trips during rough weather.",
      "Population records showing that protecting breeding periods helps enough young fish survive to replace catches."
    ],
    "correctAnswer": 3,
    "explanation": "Evidence about breeding and population replacement directly supports a temporary closed season as a conservation measure."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Comparing Institutions",
    "question": "A blocked local road and a proposed national law are discussed. Which comparison assigns responsibility most appropriately?",
    "options": [
      "Parliament should direct the local work crew, while the Municipal Corporation decides whether the national bill becomes law.",
      "The Municipal Corporation may handle the blocked local road, while Parliament considers and passes national legislation.",
      "The court should repair the road first, then advise Parliament which national policy to adopt.",
      "Both matters belong mainly to the Municipal Corporation because national laws begin as local service decisions."
    ],
    "correctAnswer": 1,
    "explanation": "Municipal Corporations handle many local services, while Parliament debates and passes national legislation."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Rights and Responsibilities",
    "question": "Two students compare free expression and responsible citizenship. Which statement best connects them?",
    "options": [
      "Citizens may speak only when their views agree with most people, because disagreement removes the right to expression.",
      "Responsible citizenship means avoiding criticism of public decisions even when concerns are supported by evidence.",
      "People may express and challenge ideas while respecting others’ rights, truthful standards, and lawful limits.",
      "Free expression protects every claim from correction, so responsibility applies only after a statement is published."
    ],
    "correctAnswer": 2,
    "explanation": "Rights and responsibilities work together. Expression is protected, while respect for others and lawful limits still matter."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Evidence in Decision-making",
    "question": "A council must choose between two park plans. Which process provides the strongest evidence of accountability?",
    "options": [
      "Select the plan preferred by most council members, then release the evaluation criteria only if residents object.",
      "Hold a consultation but keep costs and reasons private so the final choice cannot be influenced.",
      "Publish both plans and let the number of online reactions determine the decision without further review.",
      "Publish criteria and costs, hear affected residents, record the decision, and explain how the evidence guided it."
    ],
    "correctAnswer": 3,
    "explanation": "Transparent criteria, consultation, a record, and reasons allow the public to understand and evaluate the decision."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Court Independence",
    "question": "Why is it important that a court decide a case using law and evidence rather than instructions from a politician?",
    "options": [
      "It allows courts to replace Parliament whenever judges believe a proposed law is unwise.",
      "It protects fair hearings and judicial independence by requiring decisions based on law and evidence rather than political instruction.",
      "It guarantees that each side will receive the outcome it wants if its evidence is presented clearly.",
      "It permits judges to ignore enacted laws whenever a politician has commented publicly on the case."
    ],
    "correctAnswer": 1,
    "explanation": "Judicial independence helps courts apply law and evidence fairly without improper political direction."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Representation",
    "question": "A representative promised to consult residents but votes without hearing them. What is the strongest civic response?",
    "options": [
      "Organize a disruptive action that prevents the representative from meeting anyone until the vote is reversed.",
      "Wait for the next election because citizens have no lawful way to question a representative’s decision before then.",
      "Request the reasons, present residents’ evidence, and use meetings, petitions, or other lawful channels to seek accountability.",
      "Publish an unverified accusation so public pressure develops before the representative can explain the decision."
    ],
    "correctAnswer": 2,
    "explanation": "Lawful participation and requests for accountability allow citizens to question decisions while respecting democratic processes."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Parliamentary Comparison",
    "question": "A class chart shows constituency elections for House members and constitutional appointments for senators. What conclusion should students draw about the two chambers?",
    "options": [
      "Both chambers consist of members elected directly by constituencies, but the Senate has fewer constituencies.",
      "The House considers national bills, while the Senate deals only with local roads and community services.",
      "Senators alone form Parliament because members of the House work only within their constituencies.",
      "Both chambers form part of Parliament, but House members are elected and senators are appointed under constitutional arrangements."
    ],
    "correctAnswer": 3,
    "explanation": "Jamaica’s Parliament includes the House and Senate. Members of the House are elected, while senators are appointed under constitutional arrangements."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "Which statement best compares elected government and the Governor-General?",
    "options": [
      "The Governor-General independently chooses government policy whenever elected leaders disagree among themselves.",
      "Elected leaders direct policy, while the Governor-General performs formal constitutional duties within Jamaica’s parliamentary system.",
      "The elected government and Governor-General possess identical personal authority to replace any parliamentary decision.",
      "Elected representatives advise on ceremonies, while the Governor-General directs ministries and public programmes."
    ],
    "correctAnswer": 1,
    "explanation": "Policy is led by the elected government. The Governor-General carries out formal constitutional functions rather than exercising unlimited personal policy power."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Evaluating Information",
    "question": "A viral post claims a new law has passed, but it gives no source. What should a responsible citizen compare first?",
    "options": [
      "Compare the post with other unsourced messages to see whether the claim has been repeated frequently.",
      "Compare the wording with the reader’s own opinion to decide whether the new law would be desirable.",
      "Check an official publication, parliamentary record, or reliable report confirming whether the law completed the required process.",
      "Check whether the post includes photographs of government buildings, since these establish that its legal claim is accurate."
    ],
    "correctAnswer": 2,
    "explanation": "Checking an official or reliable source is the best way to verify whether a law was actually passed."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Local Participation",
    "question": "Two neighbourhoods want a safer crossing. One collects traffic evidence and submits a proposal; the other blocks the road without permission. Which approach is stronger?",
    "options": [
      "The roadblock is stronger because creating immediate attention is more important than safety or lawful procedure.",
      "Both approaches are equally strong because evidence and permission matter only after officials reject a request.",
      "Neither approach can influence the issue because residents have no role in identifying local traffic dangers.",
      "The documented lawful proposal is stronger because officials can assess the hazard without the residents creating another traffic risk."
    ],
    "correctAnswer": 3,
    "explanation": "A lawful proposal supported by evidence helps officials assess the need while avoiding the new danger created by an unauthorized roadblock."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Regional Cooperation",
    "question": "Which comparison best describes CARICOM cooperation?",
    "options": [
      "CARICOM replaces national governments for regional matters, so member states no longer make their own decisions in those areas.",
      "CARICOM members cooperate on agreed regional goals while remaining sovereign states with their own governments and laws.",
      "CARICOM cooperation gives every citizen an unconditional right to take any job in any member state without procedures.",
      "CARICOM is mainly a single national parliament whose laws automatically replace each member country’s legislation."
    ],
    "correctAnswer": 1,
    "explanation": "CARICOM supports regional cooperation, but member states retain their own governments and laws."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Chronology in a Budget",
    "question": "A family receives income, pays essential bills, saves a planned amount, and then considers entertainment. Why is this order sensible?",
    "options": [
      "It ensures entertainment spending is always larger than the amount saved.",
      "It prevents prices from changing after the family has planned its spending.",
      "It protects essential expenses and planned saving before money is committed to optional entertainment.",
      "It guarantees that the family will have income left even if essential bills cost more than expected."
    ],
    "correctAnswer": 2,
    "explanation": "Paying needs and planned saving first reduces the risk that optional spending will leave essential expenses unpaid."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Price Comparison",
    "question": "A 1 kg package costs $600 and a 2 kg package costs $1,050. Which is the better value per kilogram?",
    "options": [
      "The 1 kg package, because its total price is $450 less even though its cost per kilogram is higher.",
      "The packages have equal value because doubling $600 gives approximately the price of the larger package.",
      "The 1 kg package, because comparing package totals is more useful than calculating a unit price.",
      "The 2 kg package, because $1,050 divided by 2 is $525 per kilogram, below $600 per kilogram."
    ],
    "correctAnswer": 3,
    "explanation": "The 2 kg package costs $1,050 ÷ 2 = $525 per kilogram, which is less than $600 per kilogram."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Supply and Demand",
    "question": "Two weeks have equal demand for tomatoes, but storm damage reduces supply in week two. What price change is most likely, other things equal?",
    "options": [
      "Prices may fall because storm damage leaves sellers with more tomatoes than buyers want.",
      "Prices may rise because the same demand is competing for a smaller supply of tomatoes.",
      "Prices should remain fixed because demand is equal in both weeks even though supply changes.",
      "Prices may rise only if sellers can prove that every tomato was damaged by the storm."
    ],
    "correctAnswer": 1,
    "explanation": "With demand unchanged and fewer tomatoes available, buyers compete for a smaller supply, creating upward pressure on price."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Comparing Payment Choices",
    "question": "A buyer can pay $12,000 now or twelve monthly payments of $1,100. Which comparison is correct before considering other fees?",
    "options": [
      "The monthly plan totals $12,100, so it costs $100 more than paying now.",
      "Paying now costs $1,200 more because the twelve payments are spread across a year.",
      "The monthly plan totals $13,200, making it $1,200 more than the immediate payment before other fees.",
      "The two choices have the same total because each monthly payment is less than the immediate price."
    ],
    "correctAnswer": 2,
    "explanation": "Twelve payments of $1,100 total $13,200. This is $1,200 more than $12,000."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Imports and Exports",
    "question": "A Jamaican business imports packaging but exports sauces. Which change could raise its costs while also making export earnings more important?",
    "options": [
      "Cheaper imported packaging and weaker overseas demand would raise both costs and export earnings.",
      "Dearer imported packaging and falling overseas sauce sales would raise costs while making exports more profitable.",
      "Stable packaging costs and stronger local sauce demand would make overseas earnings more important to the business.",
      "Dearer imported packaging would raise production costs, while strong overseas sauce demand would keep export earnings important."
    ],
    "correctAnswer": 3,
    "explanation": "More expensive imported packaging raises production costs, while strong overseas demand keeps export income important."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tax and Services",
    "question": "Two proposals are compared: reduce all taxes immediately or maintain revenue for clinics and roads while reviewing waste. Why is the second a more complete economic choice?",
    "options": [
      "It removes the cost of taxation while preserving the same level of public services without another source of revenue.",
      "It treats every clinic and road project as equally valuable without reviewing spending or community need.",
      "It weighs the burden placed on taxpayers against the services revenue supports and also examines whether money is wasted.",
      "It assumes that maintaining current tax revenue is preferable even if evidence later shows that services receive no benefit."
    ],
    "correctAnswer": 2,
    "explanation": "A complete comparison considers both what taxes cost people and what shared services the revenue supports."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism Trade-offs",
    "question": "A town gains tourism jobs but produces more waste near the beach. Which response best compares economic and environmental needs?",
    "options": [
      "Reduce waste rules so tourism businesses can expand, then repair the beach only if visitor numbers fall.",
      "Strengthen waste management and visitor rules while retaining tourism activity that supports jobs and income.",
      "Close all tourism businesses immediately, since economic benefits cannot coexist with environmental protection.",
      "Move beach waste to a neighbouring community so the tourism jobs and local shoreline are both protected."
    ],
    "correctAnswer": 1,
    "explanation": "Improved waste systems and sensible rules can protect the resource on which tourism and community well-being depend."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Cooperative Decisions",
    "question": "Why might farmers compare forming a cooperative with selling alone?",
    "options": [
      "A cooperative removes the need for farmers to agree on contributions because all costs are paid by government.",
      "Selling alone guarantees higher earnings because each farmer can avoid every shared marketing responsibility.",
      "A cooperative guarantees the highest market price, while selling alone guarantees the lowest transport cost.",
      "A cooperative may support shared buying or marketing, but members must compare benefits with rules, costs, and responsibilities."
    ],
    "correctAnswer": 3,
    "explanation": "Cooperatives can create benefits through shared action, but they also require coordination and agreed responsibilities."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Saving Choices",
    "question": "Account A pays no interest but has no fees. Account B pays $600 interest but charges $200 in fees. Which gives the better return for the period?",
    "options": [
      "Account A, because avoiding a $200 fee produces a larger return than earning $600 interest.",
      "Both accounts, because the interest and fee in Account B cancel each other completely.",
      "Account B, because $600 interest minus $200 fees gives a $400 net gain compared with no gain in Account A.",
      "Account B, because its return is the full $600 and fees do not affect the amount earned."
    ],
    "correctAnswer": 2,
    "explanation": "Account B provides $600 − $200 = $400 net gain, while Account A provides no gain."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Comparing Community Choices",
    "question": "A community has funds for either a market roof used daily or decorations for one festival. Which evidence would best guide the choice?",
    "options": [
      "Choose the market roof because an everyday use automatically makes any project worthwhile regardless of cost or safety.",
      "Compare users served, safety, long-term benefits, total costs, and feasible alternatives for both proposals.",
      "Choose the festival decorations because a shorter project creates benefits sooner than permanent infrastructure.",
      "Divide the funds equally even if the reduced amounts cannot complete either the roof or the festival plan."
    ],
    "correctAnswer": 1,
    "explanation": "A responsible choice compares needs, benefits, costs, safety, and alternatives rather than irrelevant features."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff7Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff7Questions)
      : prepareSocialStudiesPreview(g5SsDiff7Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 7",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 7</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 7</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 7</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
