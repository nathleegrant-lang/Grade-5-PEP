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

const g5SsDiff9Questions: Question[] = [
  {
    "id": 1,
    "type": "history",
    "skill": "Civic Evidence in History",
    "question": "A petition and an official report describe the same 1865 protest differently. What is the best first step?",
    "options": [
      "Prefer the official report because a government source necessarily represents every participant’s experience.",
      "Prefer the petition because people requesting change cannot select or emphasize evidence strategically.",
      "Compare each source’s author, purpose, evidence, and omissions before deciding how the accounts relate.",
      "Combine both accounts as equally complete because disagreement disappears when sources describe the same event."
    ],
    "correctAnswer": 2,
    "explanation": "Source origin, purpose, and evidence help explain differing accounts and support careful comparison."
  },
  {
    "id": 2,
    "type": "history",
    "skill": "Cause and Effect",
    "question": "Which evidence best supports the claim that the 1938 unrest influenced later political change?",
    "options": [
      "A weather report from 1938 showing that several protest days were dry enough for outdoor gatherings.",
      "Records connecting workers’ demands with later labour organizations, political activity, or reforms.",
      "A later list of businesses showing that Jamaica’s economy continued to change after the unrest.",
      "A map identifying communities where protests occurred without showing political or labour consequences."
    ],
    "correctAnswer": 1,
    "explanation": "Evidence connecting demands, organizations, and reforms directly supports the claimed influence."
  },
  {
    "id": 3,
    "type": "history",
    "skill": "Historical Accountability",
    "question": "A heritage board must correct an exhibit with the wrong Emancipation date. What should it do?",
    "options": [
      "Keep the original display but add a note that visitors may choose whichever date they believe.",
      "Replace the incorrect date with an approximate decade so the exhibit cannot be challenged again.",
      "Remove the entire Emancipation exhibit because correcting one error would weaken public trust.",
      "Verify the date with reliable records, correct the exhibit, and explain transparently why it changed."
    ],
    "correctAnswer": 3,
    "explanation": "Transparent correction based on reliable evidence protects accuracy and public trust."
  },
  {
    "id": 4,
    "type": "history",
    "skill": "Comparing Claims",
    "question": "One speaker says Independence ended all British connections; another says it gave Jamaica sovereign government while some institutions continued. Which is more accurate?",
    "options": [
      "The first claim is more accurate because Independence immediately ended every constitutional and cultural connection with Britain.",
      "Both claims are equally accurate because sovereign government and complete separation mean precisely the same thing.",
      "The second is more accurate: Jamaica gained sovereign government, while some historical and institutional connections continued.",
      "Neither claim is accurate because Jamaica received full Independence before the twentieth century."
    ],
    "correctAnswer": 2,
    "explanation": "Independence established sovereign government, but historical and institutional connections did not all disappear."
  },
  {
    "id": 5,
    "type": "history",
    "skill": "Chronology",
    "question": "Which event occurred after full Emancipation but before Universal Adult Suffrage?",
    "options": [
      "The Baptist War, because it occurred after full Emancipation but before the expansion of voting rights.",
      "The Morant Bay Rebellion, because it occurred in 1865 between full freedom in 1838 and suffrage in 1944.",
      "The English capture, because British rule began after Emancipation and ended before Universal Adult Suffrage.",
      "Independence, because it occurred between Emancipation and the introduction of Universal Adult Suffrage."
    ],
    "correctAnswer": 1,
    "explanation": "The Morant Bay Rebellion occurred in 1865, between 1838 Emancipation and 1944 suffrage."
  },
  {
    "id": 6,
    "type": "history",
    "skill": "Evidence Quality",
    "question": "Which source would best verify who could vote in Jamaica in 1940?",
    "options": [
      "A fictional story written recently but set in Jamaica during the 1940 election campaign.",
      "An undated family account describing a relative who believed adults should have voting rights.",
      "A tourist brochure summarizing Jamaica’s political history without citing eligibility rules.",
      "Contemporary voting laws, registration requirements, and electoral records showing eligibility in 1940."
    ],
    "correctAnswer": 3,
    "explanation": "Contemporary legal and electoral records directly address voting eligibility in 1940."
  },
  {
    "id": 7,
    "type": "history",
    "skill": "Multiple Causes",
    "question": "Why should an account of Taíno population decline consider disease, violence, and forced labour together?",
    "options": [
      "Select the cause mentioned in the earliest source, because historical explanations should identify one first cause.",
      "Treat all three causes as equal without checking evidence, because multiple-cause accounts do not require comparison.",
      "Examine evidence for how disease, violence, and forced labour interacted instead of forcing the decline into one cause.",
      "Use disease alone because population decline caused by illness cannot also be influenced by social conditions."
    ],
    "correctAnswer": 2,
    "explanation": "Considering interacting causes produces a fuller explanation while still requiring evidence for each."
  },
  {
    "id": 8,
    "type": "history",
    "skill": "Public Memory",
    "question": "Residents disagree about naming a park for a historical figure. Which process is most responsible?",
    "options": [
      "Choose the name supported by the largest group immediately, because public popularity supplies sufficient historical evidence.",
      "Publish criteria, review the figure’s record, hear differing views, and explain the final decision.",
      "Avoid historical evidence so present-day community preferences remain the only basis for the decision.",
      "Keep the discussion private until a name is installed, because consultation makes heritage decisions less efficient."
    ],
    "correctAnswer": 1,
    "explanation": "Evidence, consultation, criteria, and reasons make a public-memory decision more accountable."
  },
  {
    "id": 9,
    "type": "history",
    "skill": "Interpreting Change",
    "question": "A table shows school enrolment rising after a reform. What additional evidence is needed before saying the reform caused all the increase?",
    "options": [
      "The reform caused all the growth because an increase after an event always proves that event was the sole cause.",
      "The reform had no effect because enrolment may also be influenced by population and household conditions.",
      "The increase should be divided evenly among every possible cause without collecting further evidence.",
      "Other changes in population, school access, costs, or policy during the same period should be examined."
    ],
    "correctAnswer": 3,
    "explanation": "Other factors may also have changed, so they must be examined before making a complete causal claim."
  },
  {
    "id": 10,
    "type": "history",
    "skill": "Rights over Time",
    "question": "Which comparison best shows change in political participation from 1940 to 1945?",
    "options": [
      "Voting eligibility was narrower after 1944 because Universal Adult Suffrage reduced the number of qualified electors.",
      "Jamaica became independent between 1940 and 1945, creating the first opportunity for adults to vote.",
      "Voting participation could involve a much wider adult electorate after Universal Adult Suffrage began in 1944.",
      "The voting rules remained unchanged because political participation widened only after Independence in 1962."
    ],
    "correctAnswer": 2,
    "explanation": "Universal Adult Suffrage widened voting rights in 1944, so participation was broader by 1945."
  },
  {
    "id": 11,
    "type": "geography",
    "skill": "Community Hazard Evidence",
    "question": "Flood maps and residents’ reports disagree about one lane. What should planners do?",
    "options": [
      "Use the flood map alone because mapped hazard boundaries cannot differ from residents’ experience.",
      "Compare elevations, drainage, dated flood records, field observations, and residents’ accounts before revising the risk judgment.",
      "Use residents’ memories alone because experience always identifies the exact depth and boundary of past flooding.",
      "Place the lane halfway between the two conclusions because averaging opinions resolves conflicting geographical evidence."
    ],
    "correctAnswer": 1,
    "explanation": "Combining mapped data, physical checks, and experience provides stronger hazard evidence."
  },
  {
    "id": 12,
    "type": "geography",
    "skill": "Multi-factor Location",
    "question": "A shelter is strong but difficult to reach when a river rises. What improvement should receive priority?",
    "options": [
      "Strengthen the existing shelter further, because building strength is the only factor that affects emergency usefulness.",
      "Add more supplies at the existing site, because residents can collect them after crossing the flooded river.",
      "Improve signs leading to the shelter, even if the signs direct residents through the same unsafe crossing.",
      "Provide a safe all-weather access route or an additional suitable shelter for residents cut off by the river."
    ],
    "correctAnswer": 3,
    "explanation": "A shelter cannot serve residents who cannot reach it, so safe access or another site is essential."
  },
  {
    "id": 13,
    "type": "geography",
    "skill": "Rainfall Decisions",
    "question": "Rainfall rises, drains clog, and flooding increases. Which plan addresses more than one cause?",
    "options": [
      "Install larger rain gauges and continue current waste practices, because better measurement reduces the water entering drains.",
      "Clear drains once after the wet season, because rainfall and waste do not interact with repeated flooding.",
      "Maintain drains, reduce dumped waste, protect waterways, and improve warnings to address several contributing factors.",
      "Build higher walls around selected homes, because containing water at individual properties solves the community drainage problem."
    ],
    "correctAnswer": 2,
    "explanation": "The plan addresses drainage, waste, waterways, and preparedness rather than a single factor."
  },
  {
    "id": 14,
    "type": "geography",
    "skill": "Settlement Trade-offs",
    "question": "A hillside project offers jobs but would remove trees above homes. Which evidence matters most?",
    "options": [
      "Approve the project because immediate jobs outweigh uncertain environmental effects on nearby homes.",
      "Compare job benefits with slope stability, runoff, tree loss, and safer designs before deciding.",
      "Reject the project because any removal of hillside trees makes development impossible under all conditions.",
      "Approve only if residents accept the risk, because public agreement replaces the need for technical evidence."
    ],
    "correctAnswer": 1,
    "explanation": "The decision should compare economic benefits with hazard risk and feasible alternatives."
  },
  {
    "id": 15,
    "type": "geography",
    "skill": "Coastal Decisions",
    "question": "Fishers want boat access; residents want mangrove protection. Which compromise is strongest?",
    "options": [
      "Remove the mangroves nearest the shore so every boat can choose its own route without disturbing other areas.",
      "Ban all boat access permanently because fishing and mangrove protection cannot operate in the same coastal area.",
      "Build several channels through nursery areas so traffic is spread evenly across the mangrove habitat.",
      "Design one controlled access channel while protecting and restoring the wider mangrove area and monitoring effects."
    ],
    "correctAnswer": 3,
    "explanation": "Limited, planned access can support livelihoods while retaining most coastal protection and habitat."
  },
  {
    "id": 16,
    "type": "geography",
    "skill": "Map Evidence",
    "question": "Two routes are equal in distance, but one crosses steep contours and a river. Which is likely easier for an evacuation bus?",
    "options": [
      "Use the shorter route because equal distance data make slope and river crossings irrelevant to evacuation time.",
      "Use the steep route because closely spaced contours indicate a more direct and therefore safer road.",
      "Prefer the gentler route with a verified safe crossing, since terrain and bridge access matter as well as distance.",
      "Treat both routes as equally accessible until an evacuation begins, because map evidence cannot guide advance planning."
    ],
    "correctAnswer": 2,
    "explanation": "Slope and safe crossings matter as well as distance for vehicle access."
  },
  {
    "id": 17,
    "type": "geography",
    "skill": "Environmental Accountability",
    "question": "A factory reports clean water, but downstream tests show pollution. What should authorities do?",
    "options": [
      "Accept the factory report because the organization being investigated has the most direct knowledge of its own discharge.",
      "Check sampling methods, conduct independent repeat tests, inspect possible sources, and apply the relevant rules to verified findings.",
      "Use the downstream result alone to identify the factory as the source without checking other discharges or test reliability.",
      "Average the clean and polluted results and take no action unless the combined figure appears unsafe."
    ],
    "correctAnswer": 1,
    "explanation": "Independent verification and investigation are necessary before accountable enforcement decisions."
  },
  {
    "id": 18,
    "type": "geography",
    "skill": "Resource Allocation",
    "question": "Only one community can receive a drainage upgrade first. Which evidence supports a fair priority?",
    "options": [
      "Prioritize the community with the greatest population, even if flood depth and damage there are low.",
      "Prioritize the community reporting the most recent flood, without comparing earlier frequency or people at risk.",
      "Share the available funds equally even if neither community would receive a functioning drainage improvement.",
      "Compare flood frequency, severity, vulnerable residents, damage, and existing drainage capacity using published criteria."
    ],
    "correctAnswer": 3,
    "explanation": "Risk, need, and existing capacity are relevant criteria for a fair decision."
  },
  {
    "id": 19,
    "type": "geography",
    "skill": "Watershed Cooperation",
    "question": "Upstream clearing harms downstream water. What shared response is most effective?",
    "options": [
      "Downstream residents should build barriers without addressing upstream clearing, because each community controls only its own water.",
      "Upstream residents should protect slopes only after downstream water becomes unusable, because monitoring before harm is unnecessary.",
      "Both communities should agree on slope protection, water monitoring, responsibilities, and responses when standards are not met.",
      "The communities should redraw their boundary along the river so erosion and water-quality duties no longer overlap."
    ],
    "correctAnswer": 2,
    "explanation": "Watersheds connect communities, so coordinated protection and monitoring address the shared cause."
  },
  {
    "id": 20,
    "type": "geography",
    "skill": "Data Limits",
    "question": "A single dry month follows a conservation project. What can planners conclude?",
    "options": [
      "The project ended dry-season shortages because any improvement followed by one dry month proves permanent success.",
      "One month cannot establish the project’s effect; planners need longer rainfall, storage, and water-use records for comparison.",
      "The project caused the low rainfall, because conservation changes how much rain reaches the entire community.",
      "The project failed because a successful conservation measure should produce a wet month immediately after completion."
    ],
    "correctAnswer": 1,
    "explanation": "A longer record is needed to separate project effects from normal rainfall variation."
  },
  {
    "id": 21,
    "type": "civics",
    "skill": "Representation and Evidence",
    "question": "A representative says residents support a plan but provides no record. What evidence would best support the claim?",
    "options": [
      "A private conversation with one supporter, because informal agreement is sufficient evidence of constituency opinion.",
      "The representative’s election result, because winning an earlier election proves support for every later proposal.",
      "Published survey methods and results, meeting records, and documented submissions showing whose views were heard.",
      "A campaign advertisement repeating the claim, because public repetition confirms that consultation occurred."
    ],
    "correctAnswer": 2,
    "explanation": "Documented consultation provides evidence of residents’ views."
  },
  {
    "id": 22,
    "type": "civics",
    "skill": "Accountability",
    "question": "A Municipal Corporation changes a project after bids are received. What should it publish?",
    "options": [
      "Publish only the new completion date, because residents need the result but not the reasons or financial changes.",
      "Publish the authorized change, reasons, revised cost, relevant procurement records, and effects on delivery.",
      "Keep the change confidential because public projects become private once a contractor has been selected.",
      "Publish every employee’s personal details, because accountability requires disclosure unrelated to the decision."
    ],
    "correctAnswer": 1,
    "explanation": "Public reasons and financial records allow lawful decisions involving public funds to be examined."
  },
  {
    "id": 23,
    "type": "civics",
    "skill": "Lawful Dissent",
    "question": "Citizens oppose a bill. Which action is lawful and evidence-based?",
    "options": [
      "Prevent supporters from entering Parliament so legislators must hear the opposing position first.",
      "Publish invented examples of harm because persuasive evidence is more useful than verified evidence.",
      "Threaten to remove representatives from office immediately unless they withdraw the bill before debate.",
      "Submit evidence, petition representatives, join consultations, and demonstrate peacefully within lawful requirements."
    ],
    "correctAnswer": 3,
    "explanation": "Peaceful, truthful participation allows citizens to influence debate lawfully."
  },
  {
    "id": 24,
    "type": "civics",
    "skill": "Judicial Independence",
    "question": "A minister publicly demands a particular verdict. What principle is at risk?",
    "options": [
      "Parliament’s power to decide court verdicts whenever elected leaders believe a case is important.",
      "The court’s duty to follow the minister’s instruction unless both sides formally object.",
      "Judicial independence—the requirement that courts decide through law and evidence without improper political pressure.",
      "Freedom of expression—the minister’s ability to determine a verdict by stating a public preference."
    ],
    "correctAnswer": 2,
    "explanation": "Judicial independence requires courts to decide using law and evidence, not political demands."
  },
  {
    "id": 25,
    "type": "civics",
    "skill": "Public Information",
    "question": "An agency refuses to explain a service delay. Which response best promotes accountability?",
    "options": [
      "Publish an accusation about individual employees before establishing why the service was delayed.",
      "Request reasons, expected timelines, and remedies through applicable complaint or information channels.",
      "Occupy the office until service resumes, because disruption creates an automatic right to internal records.",
      "Assume corruption and demand criminal punishment before obtaining evidence about the delay."
    ],
    "correctAnswer": 1,
    "explanation": "Lawful information and complaint channels seek evidence and remedies without causing harm."
  },
  {
    "id": 26,
    "type": "civics",
    "skill": "Competing Rights",
    "question": "A march and emergency vehicles need the same road. What arrangement best respects both needs?",
    "options": [
      "Give emergency vehicles priority by permanently prohibiting future marches on every public road.",
      "Allow the march to block the entire route because freedom of expression outweighs all emergency access.",
      "Move the march without consulting organizers, even if the new location prevents the intended audience from seeing it.",
      "Agree on timing and routing that preserves emergency access while allowing peaceful public expression."
    ],
    "correctAnswer": 3,
    "explanation": "Planning can protect expression while preserving urgent public safety access."
  },
  {
    "id": 27,
    "type": "civics",
    "skill": "Evaluating Promises",
    "question": "A candidate promises a service outside the office’s authority. What should voters check?",
    "options": [
      "Whether the promise is popular, because strong support gives an office authority it does not normally possess.",
      "Whether a similar promise was made elsewhere, because repetition makes a proposal legally achievable.",
      "What the office is legally responsible for, what resources it controls, and what cooperation delivery would require.",
      "How confidently the candidate speaks, because confidence demonstrates knowledge of institutional authority."
    ],
    "correctAnswer": 2,
    "explanation": "Knowing the office’s authority helps voters judge whether a promise is realistic and accountable."
  },
  {
    "id": 28,
    "type": "civics",
    "skill": "CARICOM Evidence",
    "question": "A post claims CSME allows every person to work in every job without conditions. What is the best response?",
    "options": [
      "Accept the post because CSME removes qualification and administrative requirements for employment movement.",
      "Check official CARICOM and national information about eligible categories, qualifications, documents, and procedures.",
      "Reject the post by assuming that CSME creates no employment opportunities of any kind.",
      "Compare the post only with travel advertisements, because visitor-entry information determines employment rights."
    ],
    "correctAnswer": 1,
    "explanation": "Official information is needed because movement rights operate through agreed categories and procedures."
  },
  {
    "id": 29,
    "type": "civics",
    "skill": "Community Decisions",
    "question": "A youth centre and clinic roof compete for funds. Which decision process is strongest?",
    "options": [
      "Fund the youth centre because serving young people automatically outweighs every health and safety consideration.",
      "Repair the clinic roof because an existing building must always be funded before any new community service.",
      "Split the funds evenly even if neither reduced allocation can produce a safe, usable result.",
      "Compare urgency, safety, users affected, costs, alternatives, and public evidence before selecting or sequencing projects."
    ],
    "correctAnswer": 3,
    "explanation": "A multi-factor, transparent comparison supports a responsible public choice."
  },
  {
    "id": 30,
    "type": "civics",
    "skill": "Monitoring Results",
    "question": "A new crossing is installed. What evidence should be collected to assess it?",
    "options": [
      "Count opening-day visitors, because attendance establishes whether traffic remained safe throughout later use.",
      "Measure only vehicle speed after installation, because crossing use and near misses do not affect safety.",
      "Compare speeds, crashes or near misses, and safe crossing behaviour before and after installation.",
      "Ask drivers whether they noticed the crossing, because opinions alone measure its effect on pedestrians."
    ],
    "correctAnswer": 2,
    "explanation": "Before-and-after safety and usage data directly assess whether the crossing works."
  },
  {
    "id": 31,
    "type": "economics",
    "skill": "Public Budget Choice",
    "question": "A council can repair two small roads or start one costly building. Which evidence is essential?",
    "options": [
      "Choose the least costly proposal because a lower price is sufficient evidence of greater public benefit.",
      "Compare urgency, safety, users served, complete costs, maintenance, and what alternative spending would be forgone.",
      "Repair both small roads because completing more projects is always better than completing one larger project.",
      "Begin the building because long construction periods prove that a project provides more lasting value."
    ],
    "correctAnswer": 1,
    "explanation": "Public choices require comparing needs, reach, total costs, and future obligations."
  },
  {
    "id": 32,
    "type": "economics",
    "skill": "Household Trade-off",
    "question": "A family’s income falls 10% while rent stays fixed. What first adjustment is most sensible?",
    "options": [
      "Reduce essential spending and maintain every want, because fixed rent leaves needs as the only adjustable category.",
      "Borrow enough to preserve the old budget, because a temporary loan prevents reduced income from affecting future spending.",
      "Continue the original plan until income recovers, because changing a budget after income falls creates inaccurate records.",
      "Recalculate the budget, protect essential commitments, and reduce or delay lower-priority spending."
    ],
    "correctAnswer": 3,
    "explanation": "Updating the budget helps the family protect essentials and respond to reduced income."
  },
  {
    "id": 33,
    "type": "economics",
    "skill": "Market Evidence",
    "question": "A seller raises price and sales fall, but a competitor also opens. What is the careful conclusion?",
    "options": [
      "The price increase caused the full decline because sales can have only one explanation during a given period.",
      "The competitor caused the full decline because buyer choice matters more than the seller’s changed price.",
      "Both the higher price and new competitor are plausible influences that should be examined with additional evidence.",
      "Neither factor can be considered because two simultaneous changes make sales evidence unusable."
    ],
    "correctAnswer": 2,
    "explanation": "Two relevant changes occurred, so both should be examined before assigning cause."
  },
  {
    "id": 34,
    "type": "economics",
    "skill": "Import Decision",
    "question": "Imported equipment is cheaper to buy but costly to repair locally. Which comparison is best?",
    "options": [
      "Choose the imported equipment because a lower purchase price necessarily produces the lowest lifetime cost.",
      "Compare purchase, shipping, energy, reliability, parts, repair, and expected useful life before deciding.",
      "Choose local equipment because repair access makes purchase price and performance irrelevant.",
      "Average the two purchase prices because future repair costs cannot be included in an economic comparison."
    ],
    "correctAnswer": 1,
    "explanation": "Total-cost comparison includes purchase and future operating and repair expenses."
  },
  {
    "id": 35,
    "type": "economics",
    "skill": "Tourism Accountability",
    "question": "A tourism fee is promised for beach care. What proves accountability?",
    "options": [
      "Publish visitor numbers because more visitors prove that fee revenue was spent on beach care.",
      "Publish photographs of the beach because visible conditions replace the need for financial records.",
      "Publish fee revenue only because the amount collected determines whether environmental work succeeded.",
      "Publish revenue, authorized spending, completed work, and measured beach conditions so funds and results can be traced."
    ],
    "correctAnswer": 3,
    "explanation": "Financial records and results show whether the fee was used for its stated purpose."
  },
  {
    "id": 36,
    "type": "economics",
    "skill": "Tax Trade-off",
    "question": "Why might citizens support a tax while questioning its use?",
    "options": [
      "Citizens may question the tax only if they oppose every public service financed from the revenue.",
      "Supporting a tax means accepting any use of the money because payment ends the need for accountability.",
      "Citizens can value shared services while still demanding transparent, efficient, and evidence-based spending.",
      "Citizens should support a tax only when it guarantees that every taxpayer receives an identical personal benefit."
    ],
    "correctAnswer": 2,
    "explanation": "Citizens can recognize the need for revenue and still hold government accountable for how it is spent."
  },
  {
    "id": 37,
    "type": "economics",
    "skill": "Cooperative Governance",
    "question": "A cooperative earns a surplus. Which process is fairest?",
    "options": [
      "Divide the surplus equally immediately, even if the cooperative’s approved rules require reserves or reinvestment.",
      "Disclose the accounts and apply the cooperative’s agreed decision rules so members authorize lawful uses.",
      "Allow the longest-serving member to decide privately because experience replaces the need for financial disclosure.",
      "Use the surplus for expansion before informing members, because business growth benefits everyone automatically."
    ],
    "correctAnswer": 1,
    "explanation": "Transparent accounts and agreed democratic rules support fair cooperative decisions."
  },
  {
    "id": 38,
    "type": "economics",
    "skill": "Saving and Risk",
    "question": "A high-return offer provides no documents and demands immediate cash. What should a saver do?",
    "options": [
      "Invest immediately because a higher promised return compensates for missing documents and urgent payment demands.",
      "Reject every investment with a high return, because return alone proves that an offer is dishonest.",
      "Borrow additional money so the possible return is large enough to cover any risk or hidden charge.",
      "Pause and verify the provider, written terms, fees, regulation, and comparable alternatives before committing money."
    ],
    "correctAnswer": 3,
    "explanation": "Verification and comparison protect savers from unclear or fraudulent offers."
  },
  {
    "id": 39,
    "type": "economics",
    "skill": "Community Enterprise",
    "question": "A recycling business creates jobs but trucks disturb residents. Which plan best balances interests?",
    "options": [
      "Permit unrestricted truck hours because employment benefits make noise and traffic effects economically irrelevant.",
      "Close the business because community disturbance and useful recycling cannot be addressed in the same plan.",
      "Set routes and operating hours, monitor effects, and retain the jobs and recycling service if controls work.",
      "Move the disturbance to another residential area, because spreading costs makes the enterprise fairer."
    ],
    "correctAnswer": 2,
    "explanation": "Operational limits can reduce harm while preserving employment and recycling benefits."
  },
  {
    "id": 40,
    "type": "economics",
    "skill": "Evaluating Outcomes",
    "question": "A training programme reports 100 graduates but no employment data. What can be concluded?",
    "options": [
      "The programme succeeded because completing training guarantees employment and higher wages for every graduate.",
      "The completion total is known, but employment, job retention, and earnings require additional follow-up evidence.",
      "The programme failed because a report without employment data proves that no graduate obtained work.",
      "The programme’s employment rate is 100%, because each graduate completed the requirement needed for a job."
    ],
    "correctAnswer": 1,
    "explanation": "The report measures completion only; employment and wage results need separate evidence."
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",     note: "critical evaluation of sources, synthesis across eras, contested interpretations, historical empathy" },
  { type: "geography" as const, label: "Geography & Environment", note: "complex spatial reasoning, multi-factor analysis, environmental trade-offs, data interpretation" },
  { type: "civics" as const,    label: "Civics & Government",     note: "constitutional analysis, evaluating democratic principles, rights conflicts, policy reasoning" },
  { type: "economics" as const, label: "Economics & Community",   note: "economic analysis, policy evaluation, cost-benefit reasoning, sustainable development" },
]

export default function G5SsDiff9MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)
  const [attemptQuestions, setAttemptQuestions] = useState<Question[]>([])

  const availableQuestions = attemptQuestions
  const totalQuestions = started ? availableQuestions.length : isPremium ? g5SsDiff9Questions.length : FREE_QUESTION_LIMIT

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
      ? prepareSocialStudiesAssessment(g5SsDiff9Questions)
      : prepareSocialStudiesPreview(g5SsDiff9Questions, FREE_QUESTION_LIMIT)
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
        testName: "Difficult 9",
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
            <CardTitle className="text-2xl text-green-800">Social Studies Difficult 9</CardTitle>
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
              <p className="text-slate-600">Social Studies Difficult 9</p>
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
            <div><h1 className="text-lg font-bold">Social Studies Difficult 9</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
