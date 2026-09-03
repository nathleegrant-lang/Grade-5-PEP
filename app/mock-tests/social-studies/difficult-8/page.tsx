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

const g5SsDiff8Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Timeline Evidence",
    "question": "A chart gives 1834: Apprenticeship begins, 1838: full freedom, 1944: Universal Adult Suffrage, 1962: Independence. Which interval was shortest?",
    "options": [
      "1838 to 1944, because the largest year numbers create the shortest interval.",
      "1944 to 1962, because Independence followed suffrage without another listed event.",
      "1834 to 1838, because the interval between Apprenticeship and full freedom was four years.",
      "1834 to 1962, because it contains all four developments on the timeline."
    ],
    "correctAnswer": 2,
    "explanation": "The interval from 1834 to 1838 was four years, shorter than the other intervals."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Source Interpretation",
    "question": "A plantation record lists work completed, while a worker’s account describes punishment and resistance. Why compare both?",
    "options": [
      "Use the plantation record as the complete account because records of work cannot reflect an owner’s purpose.",
      "Compare the record’s work data with the worker’s experience, while considering why each source was created.",
      "Use the worker’s account alone because personal experience automatically explains the entire plantation system.",
      "Treat the sources as equally complete and combine their claims without checking agreements or conflicts."
    ],
    "correctAnswer": 1,
    "explanation": "The records were created for different purposes and viewpoints; comparison gives a fuller, more critical picture."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Cause and Evidence",
    "question": "After the Baptist War, British debates about slavery intensified. Which conclusion uses the evidence most carefully?",
    "options": [
      "The Baptist War ended slavery immediately, so later debates merely recorded a change already completed.",
      "British debates caused the Baptist War, because political discussion always occurs before resistance.",
      "The rebellion was unrelated to abolition because freedom did not arrive on the same day.",
      "The rebellion added pressure for abolition, but its influence should be considered alongside other campaigns and forces."
    ],
    "correctAnswer": 3,
    "explanation": "The Baptist War strengthened pressure for abolition, but abolition resulted from several connected forces and did not occur immediately."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Map and History",
    "question": "A map marks Spanish Town inland and Port Royal on the coast. Which historical activity would Port Royal’s location most directly support?",
    "options": [
      "Mountain farming, because an inland position can be inferred whenever a place appears near a harbour.",
      "Shipping, defence, and overseas trade, because Port Royal’s coastal harbour position supported maritime activity.",
      "Mining, because coastal forts were generally built where valuable ores were extracted.",
      "Land-border trade, because Port Royal connected Jamaica by road to neighbouring countries."
    ],
    "correctAnswer": 1,
    "explanation": "Port Royal’s coastal location near Kingston Harbour supported shipping, defence, and maritime trade."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Comparing Evidence",
    "question": "Two population tables for the same year disagree slightly. What should a historian do first?",
    "options": [
      "Use the larger total because a higher figure is more likely to include everyone who was counted.",
      "Average the totals immediately because disagreement proves both tables are equally reliable.",
      "Check each table’s date, definitions, coverage, and method before deciding how the figures can be compared.",
      "Reject both totals because numerical sources cannot provide reliable evidence about past populations."
    ],
    "correctAnswer": 2,
    "explanation": "Differences may come from methods or dates, so source information should be checked before the figures are used."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Chronology and Change",
    "question": "Which event most directly created a wider electorate before Jamaica achieved Independence?",
    "options": [
      "Universal Adult Suffrage in 1944, because it widened voting rights before Independence.",
      "The Morant Bay Rebellion in 1865, because it immediately gave every adult the vote.",
      "The English capture in 1655, because British rule began with universal elections.",
      "The Baptist War in 1831–32, because it created Jamaica’s independent Parliament."
    ],
    "correctAnswer": 0,
    "explanation": "Universal Adult Suffrage expanded voting rights in 1944, before Independence in 1962."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Evaluating Memorials",
    "question": "A monument praises a leader but gives no dates or sources. What additional evidence would best help evaluate its account?",
    "options": [
      "The monument’s size and building material, because a larger memorial provides more reliable historical evidence.",
      "A count of present-day visitors, because popularity confirms the accuracy of every claim displayed.",
      "The wording on nearby monuments, because memorials created for similar purposes verify one another.",
      "Contemporary records and later research that can confirm, contextualize, or challenge claims about the leader."
    ],
    "correctAnswer": 3,
    "explanation": "Records and research can confirm, add context to, or challenge claims made by a commemorative monument."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Historical Decision",
    "question": "A museum can display either one official speech or the speech beside letters from ordinary people. Which choice better supports historical reasoning?",
    "options": [
      "Display only the official speech because government sources describe ordinary people’s reactions without bias.",
      "Display only the letters because personal accounts represent everyone who lived through the event.",
      "Display both, explain their origins, and invite comparison between official aims and individual experiences.",
      "Display neither because evidence from different viewpoints cannot be used in the same historical account."
    ],
    "correctAnswer": 2,
    "explanation": "Placing different sources together allows visitors to compare viewpoints and evidence."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Data Interpretation",
    "question": "A table shows protest attendance rising for three months, but it gives no reasons. Which claim is supported?",
    "options": [
      "One leader caused the increase, because attendance cannot rise without a single organizer.",
      "Attendance increased across the three months, but the table alone does not establish the reasons or results.",
      "The protest achieved its goals, because increasing participation always produces policy change.",
      "Support became universal, because a rising total proves that every group joined the protest."
    ],
    "correctAnswer": 1,
    "explanation": "The figures support a trend in attendance, not conclusions about cause, results, or universal support."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Fact and Opinion",
    "question": "Which statement is an interpretation rather than a directly checkable date?",
    "options": [
      "“Universal Adult Suffrage began in 1944,” because any statement containing a date is an interpretation.",
      "“Jamaica became independent in 1962,” because independence can only be discussed as an opinion.",
      "“The Morant Bay Rebellion occurred in 1865,” because names of events cannot be checked in records.",
      "“The 1938 labour unrest was a major turning point,” because judging significance interprets evidence about change."
    ],
    "correctAnswer": 3,
    "explanation": "Calling an event a major turning point is an interpretation supported by evidence; the other statements give dates."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Map Scale",
    "question": "A map scale is 1 cm = 8 km. A route has two segments measuring 3 cm and 2.5 cm. What is the total real distance?",
    "options": [
      "20 km, because only the 2.5 cm segment should be converted using the scale.",
      "40 km, because the two segments should be rounded to five centimetres before conversion.",
      "44 km, because the segments total 5.5 cm and each centimetre represents 8 km.",
      "88 km, because both the map distance and scale should be doubled before multiplying."
    ],
    "correctAnswer": 2,
    "explanation": "The map distance is 5.5 cm; 5.5 × 8 = 44 km."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Direction",
    "question": "A river flows south from the hills, then turns east to the sea. A village lies north of the bend. In which direction is the bend from the village?",
    "options": [
      "North, because the bend lies below the village only when the map is turned upside down.",
      "South, because a place north of the bend must look south to locate the bend.",
      "East, because the river turns east after reaching the bend.",
      "South-east, because the river’s later direction determines the bend’s position from the village."
    ],
    "correctAnswer": 1,
    "explanation": "If the village is north of the bend, the bend is south of the village."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Data",
    "question": "Monthly rainfall is A: 120 mm, B: 200 mm, C: 80 mm. How much more rain did B receive than A and C combined?",
    "options": [
      "40 mm, because Town B’s rainfall exceeds Town A by 80 mm and Town C should be halved.",
      "80 mm, because Town C’s rainfall should be subtracted from Town B without including Town A.",
      "200 mm, because Town A and Town C should be added but not compared with Town B.",
      "0 mm, because Town A and Town C total 200 mm, exactly equal to Town B."
    ],
    "correctAnswer": 3,
    "explanation": "A and C total 200 mm, equal to B, so B received 0 mm more."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Map Symbols",
    "question": "A map shows a hospital symbol beside a main road but across a river from most homes. What additional map feature matters most for emergency access?",
    "options": [
      "Contour spacing, because steepness alone determines whether residents can cross the river to reach care.",
      "Bridge or safe-crossing locations, because the river may block access despite the hospital being beside a main road.",
      "Prevailing-wind arrows, because wind direction identifies the quickest road route across a river.",
      "Parish-boundary labels, because emergency access changes when a hospital and homes are in different districts."
    ],
    "correctAnswer": 1,
    "explanation": "A bridge or safe crossing determines whether residents can reach the hospital across the river."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Settlement Planning",
    "question": "Site X is flat and near water but floods often. Site Y is higher and safer but lacks a road. What is the best planning conclusion?",
    "options": [
      "Choose Site A because proximity to work makes recurring flood risk less important than travel time.",
      "Choose Site B because safer land means road access and service costs no longer require investigation.",
      "Compare Site A’s flood-mitigation costs with Site B’s road-access costs and the long-term safety of each.",
      "Reject both sites because a settlement cannot be planned where either transport or hazard improvements are needed."
    ],
    "correctAnswer": 2,
    "explanation": "The decision requires comparing hazard risk with the cost and feasibility of providing access."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Hazard Data",
    "question": "Community records show most storm injuries occur after people enter floodwater. Which action is most directly supported?",
    "options": [
      "Increase rainfall measurements after storms, because knowing the total prevents residents from entering floodwater.",
      "Move clinics nearer the flood zone, because shorter treatment time addresses the main cause of injuries.",
      "Deepen every drain without studying routes, because drainage alone guarantees safe pedestrian movement.",
      "Warn people against entering floodwater and provide accessible safe routes, crossings, or shelters."
    ],
    "correctAnswer": 3,
    "explanation": "The injury pattern directly supports preventing entry into floodwater and improving safe movement."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Coastal Protection",
    "question": "A proposal combines mangrove restoration with buildings set farther from shore. Why can the combination be stronger than either action alone?",
    "options": [
      "Restore mangroves alone, because a natural buffer makes building location and evacuation planning unnecessary.",
      "Restore mangroves and place buildings farther from the shore, combining a natural buffer with reduced exposure.",
      "Move buildings inland alone, because coastal ecosystems do not affect waves, sediment, or habitat.",
      "Build closer to the shore behind a narrow mangrove strip, because shorter evacuation routes reduce storm exposure."
    ],
    "correctAnswer": 1,
    "explanation": "Setbacks reduce exposure and mangroves can lessen wave effects; neither guarantees complete safety."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Watershed Decision",
    "question": "Farmers need hillside crops, but soil is washing into a river. Which plan best addresses both needs?",
    "options": [
      "Clear narrow channels straight downhill so runoff leaves farms quickly, even if it carries more soil to the river.",
      "Stop all hillside farming, because no soil-protection method can support crops on sloping land.",
      "Use contour planting and vegetated strips to slow runoff and retain soil while suitable fields remain productive.",
      "Plant only at the foot of the slope, because erosion begins after runoff has already reached the river."
    ],
    "correctAnswer": 2,
    "explanation": "Contour planting and vegetated strips reduce runoff and soil loss while allowing farming to continue."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Population Data",
    "question": "Two towns have 10,000 people. Town A covers 5 km²; Town B covers 20 km². Which has higher population density?",
    "options": [
      "Town B, because its larger area means the same population is concentrated more densely.",
      "Both towns, because equal populations always produce equal density regardless of land area.",
      "Density cannot be compared because the populations are equal and only one calculation is needed.",
      "Town A, because 10,000 people across 5 km² is 2,000 per km², greater than Town B’s 500."
    ],
    "correctAnswer": 3,
    "explanation": "Town A has 2,000 people per km², while Town B has 500 per km²."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Environmental Evidence",
    "question": "Fish catches fall after muddy runoff repeatedly covers a reef. Which investigation best tests a connection?",
    "options": [
      "Compare boat colours and crew sizes before and after rain, because fishing effort alone reveals reef damage.",
      "Compare runoff, reef condition, and fish catches across heavy-rain and drier periods while checking other influences.",
      "Compare parish boundaries with fish names, because location labels establish why catches changed.",
      "Compare only catch prices before and after rain, because prices directly measure sediment covering coral."
    ],
    "correctAnswer": 1,
    "explanation": "Linked observations of runoff, reef condition, and catches can test whether the changes occur together."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Using Public Data",
    "question": "A council publishes costs for three road projects. What should residents examine before supporting one?",
    "options": [
      "Choose the project serving the most people, even if its safety benefit is small and its total cost is unknown.",
      "Choose the least expensive project, because cost alone provides a fair measure of community priority.",
      "Choose the road with the highest reported danger, without comparing whether another project could reduce more risk.",
      "Compare need, safety improvement, full cost, users served, and feasible alternatives before supporting a project."
    ],
    "correctAnswer": 3,
    "explanation": "Relevant evidence includes need, benefit, cost, and reach, not presentation features."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Representation Data",
    "question": "A survey includes 90 adults but only 10 young people for a youth-centre decision. What weakness should be considered?",
    "options": [
      "The survey is reliable because 100 responses are enough even when the group most affected is scarcely represented.",
      "Young people’s views may be under-represented, so the sample should include more of the intended users.",
      "Adult responses should be discarded because only young people may express a view about public spending.",
      "The survey proves that adults oppose the centre, because they form the largest group of respondents."
    ],
    "correctAnswer": 1,
    "explanation": "Because the decision concerns a youth centre, the small youth sample may not represent those most affected."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Lawful Participation",
    "question": "Residents find that a proposed dump may affect a stream. Which action combines evidence and lawful participation?",
    "options": [
      "Post unverified claims about the dump so officials must respond before checking whether the stream is at risk.",
      "Block access to the proposed site, because preventing work is the quickest form of lawful consultation.",
      "Document the possible stream effects and present the evidence through consultation or to the responsible authority.",
      "Wait until pollution occurs, because residents cannot raise an environmental concern before damage is confirmed."
    ],
    "correctAnswer": 2,
    "explanation": "Documented evidence presented through lawful channels supports informed participation without creating harm."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Parliament and Evidence",
    "question": "A bill is debated after a committee receives public submissions. What benefit can the submissions provide?",
    "options": [
      "The submissions decide the bill automatically when most writers recommend the same outcome.",
      "They supply evidence and viewpoints that legislators can evaluate alongside other information during debate.",
      "They replace parliamentary debate because a committee has already heard members of the public.",
      "They allow each writer to amend the bill directly without a vote by either chamber of Parliament."
    ],
    "correctAnswer": 1,
    "explanation": "Submissions can inform legislators, but Parliament retains responsibility for debate and decisions."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Court Reasoning",
    "question": "Two witnesses give different accounts. What should a court do?",
    "options": [
      "Choose the account offered by the witness with the strongest community reputation.",
      "Give both accounts equal weight even if physical evidence supports only one of them.",
      "Ask an elected official which witness should be believed before applying the relevant law.",
      "Test each account against other evidence, consider reliability, and apply the law independently."
    ],
    "correctAnswer": 3,
    "explanation": "Fair decision-making requires evaluating evidence and applying law independently."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Rights Evidence",
    "question": "A school limits a meeting because an unsafe crowd blocks exits. Which question best tests whether the limit is reasonable?",
    "options": [
      "Whether most students support the meeting’s topic, because popular expression receives stronger protection than unpopular expression.",
      "Whether the rule ended the meeting permanently, because a temporary safety restriction can never be reasonable.",
      "Whether blocked exits created a real risk, the rule was applied fairly, and safer opportunities to meet remained available.",
      "Whether school leaders agreed with the speakers, because safety rules may properly depend on the viewpoint expressed."
    ],
    "correctAnswer": 2,
    "explanation": "A reasonable limit should address a real safety concern, be fairly applied, and avoid restricting more expression than necessary."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Accountability",
    "question": "A local project costs more than planned. Which evidence would best support accountability?",
    "options": [
      "The final project photograph and opening-day attendance, because completion alone explains every additional cost.",
      "The approved budget and changes, invoices, authorization records, and reasons for the cost overrun.",
      "Statements from workers without financial records, because personal accounts replace the need to examine spending.",
      "The original budget only, because later authorized changes should not be included when reviewing the final cost."
    ],
    "correctAnswer": 1,
    "explanation": "Budget records, invoices, and documented reasons allow the spending to be examined."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "Constitutional Roles",
    "question": "An infographic says the Governor-General “runs all ministries.” Which correction is most accurate?",
    "options": [
      "The Governor-General supervises ministries directly but normally allows ministers to make minor daily decisions.",
      "The Governor-General and Prime Minister share equal personal power to direct every ministry programme.",
      "The Senate directs ministries because senators are appointed rather than elected by constituencies.",
      "Elected ministers direct government policy and ministries; the Governor-General performs formal constitutional duties."
    ],
    "correctAnswer": 3,
    "explanation": "Government policy and ministries are led by elected officials, while the Governor-General has formal constitutional functions."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Regional Decisions",
    "question": "A worker asks whether CSME means anyone can take any job in any member state. What is the careful answer?",
    "options": [
      "Anyone may take any job after entering another member state, because regional movement removes qualification rules.",
      "Only tourists benefit from regional movement, because employment remains excluded from CARICOM cooperation.",
      "Opportunities operate through agreed categories and still require relevant qualifications and national procedures.",
      "Every member state must use identical employment laws, because CSME replaces national administrative systems."
    ],
    "correctAnswer": 2,
    "explanation": "Regional arrangements create opportunities but still involve agreed eligibility, qualifications, and procedures."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Community Priorities",
    "question": "Data show one district has no safe water point while another requests decorative lights. Which priority is better supported?",
    "options": [
      "Divide the money equally between water and lights, even if neither amount is sufficient to complete a useful project.",
      "Prioritize safe water access because the evidence identifies an urgent basic need, while planning later improvements where possible.",
      "Install decorative lights first because visible improvements demonstrate that every district receives equal treatment.",
      "Delay both projects until the communities agree unanimously about which service should be treated as essential."
    ],
    "correctAnswer": 1,
    "explanation": "Safe water is an urgent basic need, so the evidence supports addressing it before a less essential improvement."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Budget Data",
    "question": "A household earns $80,000, spends $56,000 on needs and $12,000 on wants. If it saves the rest, how much is saved?",
    "options": [
      "$24,000, because only essential spending should be subtracted before calculating savings.",
      "$68,000, because needs and wants should be added to find the amount saved.",
      "$12,000, because $80,000 minus $56,000 in needs and $12,000 in wants leaves $12,000.",
      "$8,000, because the two spending amounts should first be subtracted from each other."
    ],
    "correctAnswer": 2,
    "explanation": "$80,000 − $56,000 − $12,000 = $12,000."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Percentage Reasoning",
    "question": "A shop reduces a $4,000 item by 10%. What is the sale price?",
    "options": [
      "$3,960, because ten percent should be taken from the first two digits of the original price only.",
      "$3,600, because ten percent is $400 and the discount is subtracted from $4,000.",
      "$4,400, because a discount is added to the marked price before the item is sold.",
      "$400, because the amount of the discount is the same as the final sale price."
    ],
    "correctAnswer": 1,
    "explanation": "Ten percent of $4,000 is $400; subtracting gives $3,600."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Comparing Plans",
    "question": "Plan A costs $2,000 monthly plus $500 usage. Plan B costs $2,800 with no usage fee. Which is cheaper for that month?",
    "options": [
      "Plan B is cheaper by $200 because its total should be compared only with Plan A’s monthly charge.",
      "Both plans cost $2,800 because Plan A’s usage fee replaces rather than adds to its monthly charge.",
      "Plan B is cheaper by $300 because $2,000 plus $500 is greater than $2,800.",
      "Plan A is cheaper by $300 because its $2,500 total is below Plan B’s $2,800 charge."
    ],
    "correctAnswer": 3,
    "explanation": "Plan A totals $2,500, which is $300 less than Plan B."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Market Data",
    "question": "At $300, 40 baskets sell; at $250, 60 sell. Which conclusion is supported?",
    "options": [
      "The lower price caused all of the increase, because no other condition can affect sales when a price changes.",
      "More baskets sold at the lower price, but other changes should be checked before treating price as the only cause.",
      "Demand was lower at $250, because a greater number of sales means fewer buyers still wanted baskets.",
      "Supply was unchanged on both days, because the table reports prices and sales rather than production."
    ],
    "correctAnswer": 1,
    "explanation": "The sales pattern is consistent with greater quantity demanded at a lower price, but other changing factors should be checked."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Trade Decision",
    "question": "A bakery can use imported fruit at $900 per box or local fruit at $850 with similar quality. What should it compare beyond price?",
    "options": [
      "Choose the imported fruit because the higher price proves it has better quality and more reliable delivery.",
      "Choose the local fruit because its lower price makes quality, quantity, and delivery conditions irrelevant.",
      "Choose whichever supplier is nearer, because transport distance alone determines the bakery’s full cost.",
      "Compare quality, usable quantity, reliability, transport, and effects on local producers in addition to price."
    ],
    "correctAnswer": 3,
    "explanation": "A sound purchasing decision compares total costs, reliability, quality, and wider effects."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tax Data",
    "question": "A tax raises $5 million. A clinic upgrade costs $3 million and road repairs cost $2 million. What does the calculation show?",
    "options": [
      "The clinic alone would use all $5 million because health services must be funded before road repairs.",
      "The two projects would require $10 million because each stated cost should be counted twice.",
      "The listed $3 million and $2 million projects total $5 million, so the revenue could cover both if no other costs apply.",
      "The revenue cannot support both because tax money may fund only one kind of public service at a time."
    ],
    "correctAnswer": 2,
    "explanation": "The projects total $5 million, equal to the stated revenue, though actual planning may include other costs."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Tourism Data",
    "question": "Visitor spending rises, but beach-cleaning costs rise faster. Which response uses both facts?",
    "options": [
      "Continue current tourism practices because higher visitor spending will eventually pay for beach cleaning without planning.",
      "Preserve useful tourism activity while using fair charges, budgets, and stronger waste systems to manage rising costs.",
      "End tourism immediately because environmental and employment benefits cannot be considered in the same decision.",
      "Reduce beach cleaning so its cost remains below visitor spending, even if waste accumulates near the shore."
    ],
    "correctAnswer": 1,
    "explanation": "The response should preserve benefits while addressing the growing environmental cost."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Savings Data",
    "question": "A saver deposits $20,000. One account earns $800 with $100 fees; another earns $650 with no fees. Which has the higher net gain?",
    "options": [
      "The second account, because receiving no fees means the full $650 is greater than the first account’s $800.",
      "The first account by $150, because fees should be subtracted from the second account rather than the first.",
      "Both accounts, because interest and fees must be ignored when comparing the original $20,000 deposit.",
      "The first account by $50, because it nets $700 after fees while the second account nets $650."
    ],
    "correctAnswer": 3,
    "explanation": "The first nets $700 and the second $650, so the first is higher by $50."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Cooperative Data",
    "question": "Five farmers each pay $4,000 for transport. Shared transport costs $15,000. How much do they save together?",
    "options": [
      "$1,000, because the $5,000 difference should be divided among the five farmers before reporting group savings.",
      "$5,000, because separate transport totals $20,000 and shared transport costs $15,000.",
      "$15,000, because the shared transport price is the amount saved from separate arrangements.",
      "$20,000, because adding five individual payments gives the saving rather than the original cost."
    ],
    "correctAnswer": 1,
    "explanation": "Separate transport totals $20,000; shared transport saves $5,000."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Opportunity Cost",
    "question": "A council spends its only $2 million on a market roof instead of a playground. What is the opportunity cost?",
    "options": [
      "The $2 million spent on the market roof, because opportunity cost is always the price of the chosen project.",
      "All future playground spending, because choosing the roof prevents the council from ever building a playground.",
      "The benefits of the playground—the next-best alternative surrendered when the funds were used for the roof.",
      "The number of vendors using the market, because users determine what the council gave up."
    ],
    "correctAnswer": 2,
    "explanation": "Opportunity cost is the value of the next-best alternative forgone—in this case, the playground benefits."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff8MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff8Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff8Questions)
      : prepareSocialStudiesPreview(g5SsDiff8Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 8",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 8</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 8</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 8</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
