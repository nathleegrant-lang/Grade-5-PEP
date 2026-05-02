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
  FlaskConical, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "living" | "physical" | "earth" | "technology"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5ScDiff3Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Critical Analysis of Data",
    question: `A study reports that students who eat breakfast perform better academically. A critical reader identifies that the study did not measure: socioeconomic status (wealthy families eat breakfast more reliably). What is the MAIN limitation?`,
    options: [
      "Sample size is irrelevant",
      "The study is completely valid",
      "Confounding variable: socioeconomic status correlates with BOTH breakfast eating AND academic performance. The apparent breakfast-performance link may actually reflect wealth — wealthier students eat breakfast AND go to better schools with more resources",
      "Breakfast and performance are definitely unrelated",
    ],
    correctAnswer: 2,
    explanation: `Confounding variables are variables that correlate with both the independent variable (breakfast) and the dependent variable (performance), creating a spurious association. Without controlling for socioeconomic status, the study cannot establish that breakfast CAUSES better performance.`
  },
  {
    id: 2,
    type: "living",
    skill: "Evaluating Ethical Dilemma",
    question: `Scientists can now edit the DNA of human embryos using CRISPR technology to eliminate genetic diseases. Which concern about this technology is MOST scientifically JUSTIFIED?`,
    options: [
      "It is against tradition",
      "It will make people live too long",
      "Off-target edits (unintended DNA changes in other locations) could introduce new genetic problems; germline edits are heritable (passed to all future offspring), making any errors permanent in a lineage; long-term effects are unknown",
      "CRISPR is completely safe and has no risks",
    ],
    correctAnswer: 2,
    explanation: `CRISPR risks are real: off-target edits can introduce unwanted mutations; germline editing affects all future generations of the edited lineage; we don't know the long-term effects of permanently altering the human genome. These are legitimate scientific concerns beyond just ethics.`
  },
  {
    id: 3,
    type: "living",
    skill: "Multi-Step Reasoning — Genetics",
    question: `A woman with type O blood and a man with type AB blood have children. Which blood type is IMPOSSIBLE for their children to have?`,
    options: [
      "Type A",
      "Type B",
      "Type AB — type O is genotype ii; type AB is genotype IAIB. Children receive one allele from each parent: from the mother they always get i; from the father they get either IA or IB. So children are IAi (type A) or IBi (type B) — never IAIB",
      "Type O",
    ],
    correctAnswer: 2,
    explanation: `Blood type genetics: Type O = ii (only recessive i alleles); Type AB = IAIB. Mother can only pass i; father can pass IA or IB. Possible children: IAi (Type A) or IBi (Type B). AB (IAIB) requires IA from one parent AND IB from the other — the mother cannot supply either dominant allele. Type O (ii) requires i from both parents — the father cannot supply i. So AB and O are both impossible.`
  },
  {
    id: 4,
    type: "living",
    skill: "Synthesis — Systems Thinking",
    question: `WHY does removing a KEYSTONE SPECIES from an ecosystem cause disproportionately large effects compared to removing a non-keystone species of similar abundance?`,
    options: [
      "Keystone species are always the largest animals",
      "Keystone species taste better to predators",
      "Keystone species play unique ecological roles — through predation, habitat creation, or other functions — that regulate entire communities. Their removal triggers cascading effects that restructure the ecosystem more than their population size would predict",
      "Keystone species always live at the top of food chains",
    ],
    correctAnswer: 2,
    explanation: `A keystone species (like sea otters controlling sea urchins that would otherwise overgraze kelp forests) exerts disproportionate ecosystem influence relative to its biomass. Its unique functional role — not its abundance — determines its ecological impact. This concept was established by Robert Paine's starfish experiments.`
  },
  {
    id: 5,
    type: "living",
    skill: "Evaluating Scientific Claims",
    question: `A pharmaceutical company publishes a study showing their drug reduces cancer tumour size by 40% — but does NOT publish two earlier studies where the drug had no effect. This practice is called:`,
    options: [
      "Scientific consensus",
      "Reproducibility",
      "Publication bias / selective reporting — publishing only positive results creates a misleading impression of a drug's efficacy. This is a serious form of scientific misconduct that distorts the evidence base",
      "Peer review",
    ],
    correctAnswer: 2,
    explanation: `Publication bias and selective reporting inflate the apparent effectiveness of interventions. If 3 studies are done and only 1 is published (the positive one), meta-analyses overestimate effectiveness. Mandatory trial registration and reporting of all results are reforms that address this.`
  },
  {
    id: 6,
    type: "living",
    skill: "Multi-Step Reasoning — Ecology",
    question: `A simple food web: phytoplankton → zooplankton → small fish → tuna → humans. Using the 10% energy transfer rule, if phytoplankton fix 10,000 kJ, how much energy is available to humans?`,
    options: [
      "10,000 kJ",
      "1,000 kJ",
      "10 kJ — each transfer loses 90%: phytoplankton→zooplankton: 1,000kJ; zooplankton→small fish: 100kJ; small fish→tuna: 10kJ; tuna→humans: 1kJ. Four transfers from phytoplankton to humans leaves 1 kJ",
      "1 kJ",
    ],
    correctAnswer: 3,
    explanation: `The 10% rule applied over 4 trophic steps: 10,000 × 0.1 × 0.1 × 0.1 × 0.1 = 1 kJ. This is why long food chains are energy-inefficient and why producing meat (multiple trophic steps above plants) requires much more land and energy than plant-based food.`
  },
  {
    id: 7,
    type: "living",
    skill: "Critical Analysis — Evolution",
    question: `A student argues: 'Evolution cannot be true because we have never seen one species change into another species in a lifetime.' Why is this argument FLAWED?`,
    options: [
      "The student is correct",
      "Evolution is just a theory anyway",
      "Evolution occurs over thousands to millions of generations — expecting to observe species formation in a human lifetime ignores timescale. Speciation IS observed in bacteria (rapid generations), some plants, and in carefully documented long-term studies. The argument misunderstands what evolution predicts",
      "Evolution has been disproven",
    ],
    correctAnswer: 2,
    explanation: `This is a common misunderstanding of evolutionary timescale. Macroevolution (species formation) requires many thousands of generations. However, evolution IS observed at the micro-scale (antibiotic resistance, beak size changes in Darwin's finches over decades, ring species, and documented speciation in plants through polyploidy).`
  },
  {
    id: 8,
    type: "living",
    skill: "Evaluating Biological Systems",
    question: `The HUMAN BODY regulates its temperature through multiple overlapping mechanisms. WHY is having MULTIPLE OVERLAPPING systems important, rather than just one?`,
    options: [
      "Multiple systems are less efficient",
      "Only one system is ever active",
      "Redundancy and robustness: if one mechanism fails, others compensate. Overlapping systems respond to different triggers and intensities — sweating, shivering, blood vessel dilation/constriction, behavioural changes all respond at different thresholds. No single failure causes complete loss of temperature control",
      "Multiple systems cancel each other out",
    ],
    correctAnswer: 2,
    explanation: `Biological systems critical for survival are typically multiply redundant. Temperature regulation fails if sweat glands stop working (heat stroke risk), but shivering, vasoconstriction, and behavioural thermoregulation still operate. Redundancy is a design principle evolved to prevent catastrophic failure of critical functions.`
  },
  {
    id: 9,
    type: "living",
    skill: "Evaluating Evidence",
    question: `A scientist claims she has discovered a new antibiotic by showing that it kills bacteria in a lab dish. A critical scientist asks: 'Does this prove the drug is safe and effective for humans?' The BEST response is:`,
    options: [
      "Yes — if it kills bacteria in a dish it will work in humans",
      "Lab results are all that matter",
      "No — lab results are preliminary. The drug must be tested for toxicity (safety), ability to reach the infection site in the body, dosing, and effectiveness in animal models and human clinical trials before it can be used",
      "Lab tests are more reliable than human trials",
    ],
    correctAnswer: 2,
    explanation: `The gap between in-vitro (lab) and in-vivo (living organism) testing is fundamental. A substance may kill bacteria in a dish but be toxic to human cells, fail to reach infection sites, or be inactivated by body chemistry. Multiple testing phases are required.`
  },
  {
    id: 10,
    type: "living",
    skill: "Synthesis — Ecology and Evolution",
    question: `An island is colonised by a single finch species. Over 10,000 years, 15 different finch species with different bill shapes emerge. This process is called:`,
    options: [
      "Extinction",
      "Genetic drift only",
      "Adaptive radiation — a single ancestral species diversifies into multiple species, each adapted to a different ecological niche (food source, habitat), driven by natural selection",
      "Migration of different species to the island",
    ],
    correctAnswer: 2,
    explanation: `Adaptive radiation occurs when one species colonises an environment with multiple unfilled niches and diversifies. Each population adapts to a specific resource (different seeds, insects, fruits) through natural selection, eventually becoming reproductively isolated distinct species — exactly what Darwin observed in the Galapagos.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Multi-Step Reasoning — Circuits",
    question: `A circuit has a 12V battery and three resistors in PARALLEL: 4Ω, 6Ω, and 12Ω. What is the TOTAL current drawn from the battery?`,
    options: [
      "1 A",
      "7 A",
      "6 A — In parallel, each resistor has the full 12V across it. I₁=12/4=3A, I₂=12/6=2A, I₃=12/12=1A. Total current = 3+2+1 = 6A",
      "2 A",
    ],
    correctAnswer: 2,
    explanation: `Parallel circuits: each branch has the full battery voltage. Current through each: I = V/R. I₁ = 12/4 = 3A; I₂ = 12/6 = 2A; I₃ = 12/12 = 1A. Total current (from battery) = 3 + 2 + 1 = 6A. This is a key property of parallel circuits — total current increases as more branches are added.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Evaluating Physics Claims",
    question: `A student claims: 'If I push a stationary box and it doesn't move, I am applying no force.' Evaluate this claim using Newton's Laws.`,
    options: [
      "The student is correct",
      "The student is almost correct",
      "The claim is WRONG. A force is being applied (you feel the effort). However, static friction from the floor is equal and opposite — the NET force is zero. Zero acceleration (box doesn't move) means zero NET force, NOT zero applied force. Newton's First Law: unbalanced forces cause acceleration; balanced forces produce no motion change",
      "Newton's Laws don't apply to stationary objects",
    ],
    correctAnswer: 2,
    explanation: `This is a common misconception: zero acceleration ≠ zero forces. It means zero NET force. The push force and friction force are both real — they are equal and opposite, producing zero resultant. Understanding the distinction between individual forces and net force is fundamental to Newton's Laws.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Critical Analysis — Thermodynamics",
    question: `WHY does a REFRIGERATOR produce HEAT at its back while COOLING inside? Doesn't this seem contradictory?`,
    options: [
      "Refrigerators cannot produce heat",
      "The heat is produced randomly",
      "It is not contradictory — a refrigerator is a heat pump that moves thermal energy from inside (cooling it) to outside (the room). It TRANSFERS heat from a cold region to a hot region using electrical work, making the back warm. It doesn't create cold; it removes heat",
      "Refrigerators cool and heat simultaneously by magic",
    ],
    correctAnswer: 2,
    explanation: `Thermodynamic principle: refrigerators work by using a refrigerant that absorbs heat inside the fridge (evaporating at low pressure) and releases it outside (condensing at high pressure). This is the heat pump cycle — electrical energy drives the pump that moves heat against the temperature gradient (from cold to hot), warming the room slightly while cooling the inside.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Multi-Step Calculation — Waves",
    question: `Sound travels at 340 m/s in air. A person claps near a cliff and hears the echo 1.5 seconds later. How far away is the cliff?`,
    options: [
      "510 m",
      "340 m",
      "255 m — Sound travels to cliff AND back. Total distance = speed × time = 340 × 1.5 = 510 m. One-way distance = 510/2 = 255 m",
      "170 m",
    ],
    correctAnswer: 2,
    explanation: `Echo distance calculation: the sound travels to the cliff and back = double the distance. Total distance = v × t = 340 m/s × 1.5 s = 510 m. One-way distance (to cliff) = 510/2 = 255 m. This same principle is used in sonar and echolocation.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Evaluating Physical Concepts",
    question: `A student says: 'Energy is lost when we use it.' Evaluate this statement using the Law of Conservation of Energy.`,
    options: [
      "The student is completely correct",
      "Energy literally disappears when used",
      "The statement is IMPRECISE. Energy is never lost — it is CONVERTED to less useful forms (usually heat). A light bulb converts electrical energy to light AND heat — the total energy input equals the total energy output in all forms. 'Lost' energy is energy converted to heat that dissipates and becomes unusable, but it still exists",
      "Energy is created by power stations",
    ],
    correctAnswer: 2,
    explanation: `Conservation of energy is absolute: energy cannot be created or destroyed. What we call 'losing' energy is converting it to thermal energy that disperses and cannot be recovered as useful work. The First Law of Thermodynamics: total energy in = total energy out. The Second Law explains why some conversions are irreversible.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Multi-Step Calculation — Forces",
    question: `A child of mass 30 kg sits on one end of a see-saw, 2 m from the fulcrum. An adult of mass 60 kg must sit at what distance from the fulcrum on the other side for balance?`,
    options: [
      "4 m",
      "2 m",
      "1 m — Principle of Moments: clockwise moment = anticlockwise moment. 30kg × 10 × 2m = 60kg × 10 × d. 600 = 600d. d = 1 m",
      "0.5 m",
    ],
    correctAnswer: 2,
    explanation: `Principle of Moments: moment = force × perpendicular distance. For balance: moment₁ = moment₂. W₁d₁ = W₂d₂. (30×10)×2 = (60×10)×d. 600 = 600d. d = 1m. The heavier adult must sit closer to the fulcrum (1m vs the child's 2m) to produce equal turning moments.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Synthesis — Energy Systems",
    question: `A country decides to switch from coal power to 100% solar power. Identify the MOST COMPLEX technical challenge this creates, beyond simply installing solar panels.`,
    options: [
      "Solar panels are expensive",
      "Solar panels need cleaning",
      "Energy storage and grid management: solar generates electricity only when the sun shines, but demand is 24/7 (including at night and in cloudy weather). The country needs enormous energy storage (batteries, pumped hydro) and smart grid management to match intermittent supply with constant demand",
      "Solar panels don't generate enough power",
    ],
    correctAnswer: 2,
    explanation: `Intermittency is the fundamental challenge of renewable energy transition. Solar power is variable — grid operators must balance supply and demand second-by-second. Without storage, surplus power is wasted and deficit periods require backup. Battery technology at grid scale, pumped hydro storage, and smart demand management are all required.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Critical Analysis — Materials Science",
    question: `Engineers designing helmets to protect the brain want to minimise the force of impact transferred to the head. Using physics, explain why helmets are PADDED with soft foam rather than made of hard material alone.`,
    options: [
      "Foam is cheaper than hard materials",
      "Hard helmets would be too heavy",
      "Foam extends the time of impact — by Newton's Second Law and impulse-momentum theorem: Force × time = change in momentum. The momentum change is fixed (by the crash). Extending the collision time reduces the force. Foam compresses slowly, lengthening contact time and reducing peak force on the brain",
      "Foam absorbs the energy so it disappears",
    ],
    correctAnswer: 2,
    explanation: `Impulse-momentum theorem: impulse = force × time = change in momentum. Since momentum change is fixed (by crash speed), extending the collision time (soft padding crushes slowly) reduces the force. Hard-only helmets stop the head in milliseconds (very short time → very large force). Foam padding extends this over milliseconds → much lower force transmitted to the brain.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Multi-Step Calculation — Energy",
    question: `A 2 kg ball is dropped from a height of 20 m. What is its speed just before it hits the ground? (Use g = 10 m/s²)`,
    options: [
      "10 m/s",
      "15 m/s",
      "20 m/s — using conservation of energy: PE lost = KE gained: mgh = ½mv². g and h cancel: v = √(2gh) = √(2×10×20) = √400 = 20 m/s",
      "40 m/s",
    ],
    correctAnswer: 2,
    explanation: `Conservation of energy: potential energy (mgh) converts entirely to kinetic energy (½mv²) in free fall. v = √(2gh) = √(2 × 10 m/s² × 20 m) = √400 = 20 m/s. Note: the mass cancels out — all objects (ignoring air resistance) reach the same speed when dropped from the same height.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Evaluating Competing Explanations",
    question: `Two students explain why ships made of steel float despite steel being denser than water. Student A says: 'The ship is hollow and contains air.' Student B says: 'The ship displaces water equal to its weight.' Which explanation is MORE COMPLETE?`,
    options: [
      "Student A is completely correct",
      "Student B is completely correct",
      "Student B is more scientifically complete — Archimedes' Principle states a floating object displaces water equal to its own weight. The hollow hull enables this by giving the ship enough total volume to displace sufficient water. Student A's air explanation is a mechanism; Student B's is the fundamental principle",
      "Neither is correct",
    ],
    correctAnswer: 1,
    explanation: `Student B invokes Archimedes' Principle — the fundamental law. Student A identifies why steel can float (hollow hull increases volume → more water displaced) but this is a mechanism that enables the principle, not the explanation itself. A complete answer would combine both: the hull creates enough volume to displace water equal to the ship's weight.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Synthesis — Earth Systems",
    question: `Describe how the CARBON CYCLE connects the ATMOSPHERE, BIOSPHERE, HYDROSPHERE, and LITHOSPHERE.`,
    options: [
      "Carbon only exists in the atmosphere",
      "Carbon cycles only between plants and animals",
      "CO2 in atmosphere → absorbed by plants (photosynthesis, biosphere) → returns via respiration, decomposition, or burning (back to atmosphere); dissolved in ocean (hydrosphere) where marine organisms incorporate into shells (CaCO3) → shells sink and compress into limestone (lithosphere) → limestone weathered or subducted and heated → CO2 released by volcanism (back to atmosphere). All four spheres are connected",
      "Carbon only cycles between ocean and atmosphere",
    ],
    correctAnswer: 2,
    explanation: `The carbon cycle crosses Earth's major systems: atmospheric CO2 ↔ biosphere (photosynthesis/respiration); atmospheric CO2 ↔ hydrosphere (ocean dissolution/outgassing); biosphere → lithosphere (dead organisms → fossil fuels/carbonate rocks over geological time); lithosphere → atmosphere (volcanism releases stored CO2). Human fossil fuel burning shortcuts the geological cycle, releasing ancient carbon rapidly.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Critical Analysis — Plate Tectonics",
    question: `Alfred Wegener proposed continental drift in 1912 but was largely rejected by the scientific community until the 1960s. What is the MAIN SCIENTIFIC REASON his theory was initially rejected?`,
    options: [
      "Scientists were jealous of his idea",
      "The continents look too different to have been connected",
      "Wegener could not explain the MECHANISM — he proposed that continents move but could not identify a driving force. Without a mechanism (plate tectonics and mantle convection, discovered through ocean floor mapping in the 1950s-60s), scientists rationally required more evidence. The theory was vindicated once sea-floor spreading and mantle convection were understood",
      "Continental drift is still unproven",
    ],
    correctAnswer: 2,
    explanation: `Philosophy of science: scientific theories must explain HOW as well as what. Wegener's observations (fossil matches, coastline fits, glacial evidence across continents) were compelling but required a credible mechanism. When ocean floor spreading was discovered (1950s-60s), providing the mechanism (mantle convection driving plate movement), the theory became accepted almost immediately.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Evaluating Climate Data",
    question: `A graph shows that global average temperature has increased 1.1°C since 1880. A student argues this is insignificant because '1.1°C is barely noticeable.' Evaluate this argument.`,
    options: [
      "The student is correct",
      "Temperature measurement is imprecise",
      "The argument fundamentally misunderstands GLOBAL averages and SYSTEM sensitivity. 1.1°C global average represents enormous total heat content increase (Earth is huge); small average changes produce large changes at extremes (more intense heatwaves, heavier rainfall); ice ages were only 4-7°C cooler than today globally — so 1.1°C is highly significant at planetary scale",
      "Only 5°C changes matter for climate",
    ],
    correctAnswer: 2,
    explanation: `Scale matters in climate: the planet's thermal mass is enormous — 1.1°C average represents a massive total energy increase. More importantly, distributions shift: an average shift of 1.1°C means many more days above extreme thresholds. The Last Glacial Maximum (when ice sheets covered much of North America) was only 4-7°C cooler globally. 1.1°C is substantial by any planetary measure.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Multi-Step Analysis — Hydrology",
    question: `During a drought, a farmer notes that his well (tapping an unconfined aquifer) drops by 10 metres. His neighbour's artesian well (tapping a confined aquifer) maintains its pressure. Explain the DIFFERENCE between the two well types.`,
    options: [
      "All wells work the same way",
      "Artesian wells are deeper",
      "An unconfined aquifer is directly recharged from the surface — drought reduces recharge, lowering the water table and well level. A confined (artesian) aquifer is trapped between impermeable layers and is recharged from distant areas (often mountains). Its pressure comes from the weight of water in its recharge zone — drought in this area doesn't immediately affect confined aquifer pressure",
      "Artesian wells are never affected by drought",
    ],
    correctAnswer: 2,
    explanation: `Aquifer types differ in recharge and pressure mechanisms. Unconfined aquifers are directly connected to surface recharge — drought immediately lowers the water table. Confined (artesian) aquifers are sealed between impermeable layers; their pressure is hydrostatic (from distant recharge areas at higher elevation) — local drought doesn't immediately affect them, though prolonged regional drought eventually does.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Synthesis — Astronomy",
    question: `WHY does the MOON appear to change size (larger near the horizon than overhead)? Is this a real physical change?`,
    options: [
      "The Moon is actually larger near the horizon",
      "Earth's atmosphere magnifies the Moon",
      "This is an optical illusion — the Moon Illusion. The Moon does not physically change size. Near the horizon, the brain compares the Moon to familiar objects (trees, buildings) and interprets it as larger. Overhead, with no reference objects, it seems smaller. Angular size measurements confirm the Moon subtends almost identical angles at both positions",
      "Atmospheric refraction enlarges the Moon",
    ],
    correctAnswer: 2,
    explanation: `The Moon Illusion is one of the oldest known optical illusions. The Moon's angular diameter is actually slightly smaller near the horizon (the observer is slightly further from the Moon when it's on the horizon vs overhead). The perceived enlargement is cognitive — the brain uses contextual cues (terrestrial objects) to judge size, overriding the actual angular measurement.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Critical Analysis — Natural Disasters",
    question: `An engineer proposes building a sea wall around a coastal Jamaican town to protect it from hurricane storm surges. A coastal geologist objects. WHY might the geologist's objection be scientifically valid?`,
    options: [
      "Sea walls always work perfectly",
      "Geologists oppose all engineering",
      "Sea walls often accelerate erosion of adjacent beaches (by changing wave energy patterns), destroy coastal habitats (mangroves and reefs that provide natural surge protection), may be overtopped by extreme events anyway, and create a false sense of security. Nature-based solutions (restoring mangroves and reefs) may provide better long-term surge protection while maintaining ecosystem services",
      "Storm surges are too small to matter",
    ],
    correctAnswer: 2,
    explanation: `Coastal management tradeoffs: hard engineering (sea walls) can solve the immediate problem but create others — accelerated erosion at the wall's ends, loss of natural protective ecosystems, high maintenance costs, and complete failure if overtopped. Ecological approaches (restoring mangroves, which absorb wave energy, and coral reefs, which reduce wave height) are increasingly favoured as more resilient and cheaper long-term solutions.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Evaluating Earth Science Data",
    question: `Ice cores drilled from Antarctic ice contain tiny air bubbles from ancient atmosphere. Scientists measure CO2 concentrations in these bubbles and find they correlate closely with temperature proxies over 800,000 years. WHY does this evidence support the greenhouse gas explanation of current warming?`,
    options: [
      "Ice core data is unreliable",
      "CO2 and temperature correlating proves nothing",
      "The correlation between CO2 and temperature over 800,000 years provides a long baseline showing this relationship predates human activity — CO2 and temperature have always risen and fallen together. Combined with the fact that current CO2 levels are 50% HIGHER than any previous natural maximum in the ice core record, the data strongly supports CO2 as a significant driver of current warming",
      "Temperature always leads CO2 changes",
    ],
    correctAnswer: 2,
    explanation: `Ice core interpretation: the 800,000-year CO2-temperature correlation shows the greenhouse effect is a consistent Earth system relationship, not a coincidence. Current CO2 levels (~420 ppm) are 50% above any previous natural maximum in the record (~280 ppm). This combination — known mechanism, long correlation baseline, unprecedented CO2 levels — builds a compelling evidential case.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Multi-Step Analysis — Geology",
    question: `A geologist finds a layer of iridium (a rare element on Earth but common in meteorites) at the same geological layer worldwide that marks the mass extinction of the dinosaurs 66 million years ago. WHY is this evidence significant?`,
    options: [
      "Iridium is common in all rocks",
      "This is just a coincidence",
      "Iridium's rarity in Earth's crust but abundance in meteorites suggests an extraterrestrial source. Its presence in a thin global layer at exactly the K-Pg boundary (dinosaur extinction event) strongly supports the asteroid impact hypothesis — a massive impact vaporised meteoritic material that settled globally as the iridium layer. The simultaneity of extinction and iridium deposition globally is key",
      "Dinosaurs were killed by iridium poisoning",
    ],
    correctAnswer: 2,
    explanation: `The Alvarez hypothesis (1980): the global iridium anomaly at the K-Pg boundary is strong physical evidence for a massive asteroid impact. Iridium is rare in Earth's crust (siderophile, concentrated in the core) but common in certain meteorite types. Global simultaneous deposition of an iridium layer at the exact level of a mass extinction is best explained by a large meteorite impact vaporising upon striking Earth.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Multi-Step Analysis — Climate",
    question: `A climate scientist says: 'The Earth has had ice ages before — so current climate change is just natural.' Identify what is MISSING from this argument.`,
    options: [
      "The argument is completely valid",
      "Historical climate change disproves human influence",
      "The argument ignores RATE and CAUSE. Past ice ages occurred over tens of thousands of years driven by orbital changes. Current warming is occurring over decades — 100-200 times faster. And the current warming's isotopic signature of carbon matches fossil fuel burning, not volcanic or orbital causes. The rate and attribution evidence are what the argument omits",
      "Ice ages and climate change are unrelated",
    ],
    correctAnswer: 2,
    explanation: `Scientific reasoning about climate: yes, Earth has experienced natural climate change. But rate matters (current change is orders of magnitude faster than natural cycles), and attribution matters (isotopic analysis of atmospheric CO2 fingerprints it as fossil fuel combustion). The argument commits the logical fallacy of ignoring contrary evidence.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Evaluating Evidence",
    question: `Scientists use MULTIPLE INDEPENDENT LINES OF EVIDENCE to conclude that Earth is approximately 4.6 billion years old. WHY is convergent evidence from multiple methods (radiometric dating, meteorite analysis, lunar samples, stellar evolution models) more convincing than any single method?`,
    options: [
      "Multiple methods create confusion",
      "One perfect method is always better",
      "If multiple completely independent techniques all converge on the same answer, the probability that they are ALL wrong in the same direction is extremely small. Convergent evidence from independent methods is a hallmark of robust scientific conclusions",
      "Scientists just agree to avoid argument",
    ],
    correctAnswer: 2,
    explanation: `Convergent evidence is the gold standard of science: when radiometric dating of Earth rocks, meteorite analysis, lunar samples, and models of solar evolution all independently give ~4.6 billion years, the consistency strongly supports the conclusion. One method might have systematic errors; the probability that ALL independent methods share the same error is vanishingly small.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Evaluating Technology",
    question: `Discuss the MOST SIGNIFICANT unintended consequence of widespread SMARTPHONE USE on human behaviour, citing a specific scientific concern.`,
    options: [
      "Smartphones only have positive effects",
      "Smartphones have no measurable effects on behaviour",
      "Displaced sleep: smartphones in bedrooms delay sleep onset through blue light exposure (suppressing melatonin), social media stimulation, and notification anxiety. Adolescents especially show chronic sleep deprivation linked to smartphone use — with downstream effects on memory consolidation, mood regulation, immune function, and academic performance. This is the most well-evidenced adverse impact",
      "Only social media companies study smartphone effects",
    ],
    correctAnswer: 2,
    explanation: `Sleep disruption is the most consistently evidenced smartphone health concern: blue light (400-490nm wavelength) from screens suppresses melatonin production, delaying the sleep signal. Social comparison and notification-checking create physiological arousal incompatible with sleep onset. Adolescent sleep has declined measurably since smartphone adoption. Sleep is critical for memory, mood, immune function, and hormonal regulation — making this a serious public health concern.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Critical Analysis — Research Methods",
    question: `A study claims: 'Students who use educational technology (EdTech) score 15% higher on tests.' A critical researcher asks five questions. Which question MOST fundamentally challenges the causal claim?`,
    options: [
      "Was the technology expensive?",
      "How many schools participated?",
      "Were students RANDOMLY assigned to EdTech or traditional instruction? — Without randomisation, schools or students choosing EdTech may differ systematically from those who don't (self-selection bias). Higher-achieving students or better-funded schools may adopt EdTech first — explaining higher scores without EdTech causing the improvement",
      "Did the technology company like the results?",
    ],
    correctAnswer: 2,
    explanation: `Causal inference requires ruling out alternative explanations. The most fundamental threat is self-selection bias: if students or schools choose to use EdTech, they likely differ from non-users in many ways (motivation, resources, school quality). Without random assignment, we cannot know if EdTech causes higher scores or if higher-scoring students use EdTech. Randomised Controlled Trials are the gold standard for causal claims.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Synthesis — Biotechnology",
    question: `CRISPR-Cas9 gene editing can make precise cuts in DNA. A scientist wants to use it to eliminate a genetic disease from a patient's somatic cells (non-reproductive cells). A second scientist wants to apply it to a human embryo's germline (reproductive cells). Explain the KEY DIFFERENCE in implications.`,
    options: [
      "Both applications are identical",
      "Only germline editing should be allowed",
      "Somatic cell editing affects only the treated patient — any effects (intended or unintended) are limited to that individual and die with them. Germline editing changes the DNA of every cell in the resulting person AND is inherited by all their offspring — any off-target mutations become permanent additions to the human gene pool. The irreversibility and heritability of germline editing create qualitatively different ethical and safety implications",
      "Somatic editing is more dangerous",
    ],
    correctAnswer: 2,
    explanation: `Somatic vs germline editing distinction: somatic edits are contained and reversible in principle (they cannot pass to offspring). Germline edits propagate through generations — all descendants carry both intended edits and any off-target errors. We cannot yet reliably detect all off-target effects, and long-term consequences across generations are unknown. This is why germline editing faces far more ethical and regulatory scrutiny.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Evaluating Scientific Consensus",
    question: `A journalist writes: 'Scientists DISAGREE about climate change — so we should wait for more evidence before acting.' Evaluate this claim.`,
    options: [
      "The journalist is correct",
      "Scientists are divided",
      "The claim misrepresents the scientific consensus. 97%+ of climate scientists agree that current warming is primarily human-caused. SOME uncertainty exists about precise impacts and timescales — this is normal in science. But decision-making under uncertainty is the norm: we act on incomplete information constantly. The cost of acting on correct information is lower than the cost of inaction on correct information",
      "Only politicians know if climate change is real",
    ],
    correctAnswer: 2,
    explanation: `Scientific consensus vs. uncertainty: 97%+ agreement on attribution (human causes) is overwhelming scientific consensus. Scientists DO discuss uncertainties about regional impacts, tipping points, and feedback strengths — this is science working normally, not evidence of fundamental disagreement. Using internal scientific discussion to claim complete disagreement is a well-documented misinformation tactic called 'manufactured doubt.'`
  },
  {
    id: 35,
    type: "technology",
    skill: "Designing Research — Ethics",
    question: `Scientists want to test whether a new HIV vaccine works in humans. Discuss the KEY ethical considerations that must be addressed before conducting human trials.`,
    options: [
      "Just test it immediately — it's urgent",
      "Only the scientists' opinions matter",
      "Informed consent (participants must understand risks and benefits); equipoise (genuine uncertainty about whether vaccine is better — if it clearly works, withholding it from the control group is unethical); risk minimisation (early phase trials test safety in small groups); independent ethics committee review; right to withdraw; monitoring for harm and stopping if harm occurs; fairness in subject selection (not exploiting vulnerable populations)",
      "Ethics only apply after results are known",
    ],
    correctAnswer: 2,
    explanation: `Research ethics framework (Helsinki Declaration): informed consent (voluntary, comprehending risks); equipoise (genuine uncertainty — if one treatment is clearly better, a trial is unethical); independent review (ethics committees provide oversight); proportionality (benefits must outweigh risks); protection of vulnerable populations; right to withdraw without penalty; and stopping rules if harm emerges.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Evaluating Environmental Technology",
    question: `Jamaica is considering either: (A) a large-scale centralised solar farm that feeds the national grid, or (B) distributed rooftop solar on homes and businesses. Compare the ADVANTAGES of each approach.`,
    options: [
      "Option A is always better",
      "Option B is always better",
      "(A) Centralised: economies of scale (cheaper per kW), easier grid management, faster deployment at scale, less aesthetic impact on buildings. (B) Distributed: reduces transmission losses, more resilient (no single point of failure), democratises energy production, reduces demand on grid infrastructure, allows communities to become energy self-sufficient. Optimal solution likely combines both — centralised for baseload, distributed for demand-side management",
      "Only one solar approach can work",
    ],
    correctAnswer: 2,
    explanation: `Energy system design involves trade-offs. Centralised systems achieve economies of scale and simplified management but create single-point failure risks and transmission losses. Distributed systems are resilient and democratic but costlier per unit and harder to manage. Modern energy systems combine both approaches — utility-scale generation for baseload with distributed generation reducing peak demand and improving local resilience.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Critical Analysis — AI Ethics",
    question: `An AI system trained on historical medical data is found to be significantly less accurate at diagnosing disease in dark-skinned patients than light-skinned ones. WHY does this occur, and what does it reveal about AI systems?`,
    options: [
      "AI systems are always unbiased",
      "This is a software error easily fixed",
      "The AI learned patterns from historical data that was overwhelmingly from lighter-skinned patients (because darker-skinned patients were historically underrepresented in medical datasets). The AI encodes the BIASES of its training data — it reproduces historical healthcare inequalities. This reveals that AI is not objective; it amplifies whatever biases exist in the data it learned from",
      "Dark skin is medically different so this is expected",
    ],
    correctAnswer: 2,
    explanation: `AI bias through data: machine learning models identify patterns in training data. If training data is biased (underrepresentation of certain groups), the model learns biased patterns. In medicine, historical exclusion of certain populations from research produces less accurate models for those populations. AI systems do not eliminate human bias — they automate and scale it, making it more systematic and harder to detect.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Evaluating Scientific Credibility",
    question: `You encounter a website claiming: 'Scientists have discovered that eating chocolate daily prevents all types of cancer.' What questions should you ask to critically evaluate this claim?`,
    options: [
      "Nothing — websites are reliable",
      "Only question if the website looks unprofessional",
      "Is this peer-reviewed in a reputable journal? What type of study (randomised trial vs observational)? What was the sample size and duration? Is there a plausible biological mechanism? Who funded the research? Has it been replicated? What does the broader scientific consensus say? What is the effect size (how large is the benefit)?",
      "Only a doctor can evaluate health claims",
    ],
    correctAnswer: 2,
    explanation: `Critical evaluation of health claims requires assessing: study type (RCT > cohort > case study), peer review status (not press releases), funding (conflicts of interest), sample adequacy, replication (single studies are never definitive), biological plausibility, effect size (statistical vs practical significance), and whether the claim matches scientific consensus. Extraordinary claims require extraordinary evidence.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Evaluating Scientific Ethics",
    question: `A pharmaceutical company funds a study that finds their drug is effective. An independent study finds it is not. Which study should be given MORE SCIENTIFIC WEIGHT, and why?`,
    options: [
      "The company study is more professional",
      "Both should be ignored",
      "The independent study should generally be given MORE weight. Company-funded research has a financial conflict of interest — studies funded by companies with a stake in positive outcomes are statistically more likely to show positive results (funding bias). Independent peer-reviewed research without financial interest is more credible, though quality of methodology must also be assessed",
      "The study with more patients is always correct",
    ],
    correctAnswer: 2,
    explanation: `Funding bias is well-documented: systematic reviews show industry-funded trials are significantly more likely to report positive outcomes than independently funded trials of the same drugs. Conflict of interest doesn't mean the company study is wrong, but it is grounds for additional scepticism and requires independent replication before accepting the conclusion.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Designing Research",
    question: `A student wants to test whether a new fertiliser improves crop yield. Design a VALID experimental study, identifying: IV, DV, controls, sample size considerations, and how to reduce bias.`,
    options: [
      "Just grow one plant with fertiliser and check",
      "Design experiments instinctively — no formal structure needed",
      "IV: fertiliser (presence/absence, possibly concentration). DV: crop yield (mass of produce per plant). Controls: same soil type, seed variety, watering, light, temperature, pot size. Sample: 20+ plants per group (for statistical reliability). Bias reduction: randomised allocation of plants to groups, blind measurement (measurer doesn't know which group each plant is in), pre-registration of expected outcomes",
      "Only one variable matters in any experiment",
    ],
    correctAnswer: 2,
    explanation: `Experimental design elements: IV (what is changed), DV (what is measured), controls (everything else kept constant — a fair test). Adequate sample size reduces random variation. Randomisation prevents systematic differences between groups. Blinding prevents unconscious bias in measurement. Pre-registration prevents outcome switching after seeing data.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "evaluating biological evidence, synthesising ecology, multi-step reasoning about life processes" },
  { type: "physical" as const,   label: "Physical Science",         note: "multi-step calculations, evaluating competing physics explanations, complex energy analysis" },
  { type: "earth" as const,      label: "Earth Science",            note: "interpreting complex Earth systems, evaluating climate evidence, multi-factor environmental analysis" },
  { type: "technology" as const, label: "Science & Technology",     note: "evaluating scientific claims, designing research, ethical reasoning about technology" },
]

export default function G5ScDiff3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScDiff3Questions : g5ScDiff3Questions.slice(0, FREE_QUESTION_LIMIT)
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
        subject: "Science",
        testName: "Difficult 3",
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
    t === "living" ? "Living Things" : t === "physical" ? "Physical Science"
    : t === "earth" ? "Earth Science" : "Science & Technology"
  const secColor = (t: Question["type"]) =>
    t === "living" ? "bg-green-50 text-green-800" : t === "physical" ? "bg-blue-50 text-blue-800"
    : t === "earth" ? "bg-amber-50 text-amber-800" : "bg-purple-50 text-purple-800"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/science"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Science Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 text-center">
            <FlaskConical className="mx-auto mb-4 h-14 w-14 text-purple-700" />
            <CardTitle className="text-2xl text-purple-800">Science Difficult 3</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Difficult Level</p>
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
              <p className="text-slate-700">This test requires critical evaluation of scientific claims, multi-step calculations, synthesis across scientific disciplines, and analysis of complex experimental data — the highest NSC Grade 5 Science standard.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-sm font-semibold text-green-800">Living Things</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-sm font-semibold text-blue-800">Physical Science</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-sm font-semibold text-amber-800">Earth Science</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-sm font-semibold text-purple-800">Science & Technology</p><p className="text-xs text-slate-600">10 Questions</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-purple-700">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-purple-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-purple-700 py-6 text-lg hover:bg-purple-800">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-purple-700" />
              <CardTitle className="text-2xl text-purple-800">Science Test Completed</CardTitle>
              <p className="text-slate-600">Science Difficult 3</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-purple-700">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-purple-700">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade to access all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <p className="font-semibold text-purple-800">{s.label}</p>
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
                <p className="text-slate-700">Difficult Science requires connecting knowledge across topics, evaluating evidence critically, and reasoning through multi-step problems. For each question you found challenging, trace the reasoning in the explanation — this is how scientists think.</p>
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-purple-700">{q.skill}</span></p>
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
                <Button onClick={() => window.print()} className="flex-1 bg-purple-700 hover:bg-purple-800"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/science" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Science Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      <Header />
      <header className="bg-purple-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/science" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <FlaskConical className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Science Difficult 3</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-purple-600")}>
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
          <Card className="mb-6 border-purple-100">
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
                      answers[currentQuestion] === idx ? "border-purple-700 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50/50")}>
                    <span className="font-medium text-purple-800 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={handleSubmit} className="bg-purple-700 hover:bg-purple-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-purple-700 hover:bg-purple-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-purple-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-purple-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-purple-700 text-white"
                      : answers[idx] !== null ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-700" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-100" /><span>Answered</span></div>
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
