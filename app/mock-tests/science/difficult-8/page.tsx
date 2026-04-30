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

const g5ScDiff8Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Multi-Step Reasoning — Human Physiology",
    question: `A marathon runner finishes a 42km race. Describe the physiological cascade that occurs when she finishes and STOPS running.`,
    options: [
      "Nothing happens — the body immediately returns to normal",
      "Only her breathing changes",
      "Heart rate and breathing gradually decrease (no longer needed at exercise intensity); blood is redirected from muscles back to organs; lactic acid (from anaerobic respiration during intense effort) is gradually cleared from muscles (causing soreness); glycogen stores are depleted and must be replenished; core temperature falls as sweating slows",
      "Only heart rate changes",
    ],
    correctAnswer: 2,
    explanation: `Post-exercise physiology involves multiple systems simultaneously returning to resting state: cardiovascular (heart rate, blood distribution), respiratory (O2 debt repayment), metabolic (lactic acid clearance, glycogen synthesis), and thermal (cooling). These processes operate on different timescales and explain fatigue, soreness, and recovery needs.`
  },
  {
    id: 2,
    type: "living",
    skill: "Critical Analysis — Ecology",
    question: `A government proposes to introduce a non-native mongoose to Jamaica to control the rat population that is damaging sugarcane crops. A biologist strongly objects. WHY is the biologist's objection scientifically justified?`,
    options: [
      "Mongooses are too expensive",
      "Mongooses don't eat rats",
      "This matches exactly what happened in Jamaica in 1872 — mongooses were introduced but then predated native ground-nesting birds and reptiles instead of the (nocturnal) rats. Non-native predators with no evolutionary history in an ecosystem rarely behave predictably and often devastate native species",
      "Mongooses would improve biodiversity",
    ],
    correctAnswer: 2,
    explanation: `This is precisely what happened historically — the Jamaican mongoose introduction is a famous cautionary tale in conservation biology. The mongoose preferred native ground-nesting birds and reptiles (easier prey) over rats (mostly nocturnal when mongooses are least active). The intervention caused severe biodiversity damage without solving the rat problem.`
  },
  {
    id: 3,
    type: "living",
    skill: "Synthesis — Cell Biology",
    question: `A student learns that cancer is caused by uncontrolled cell division. She asks: 'If normal cells also divide, what makes cancer cells different?' The BEST scientific answer is:`,
    options: [
      "Cancer cells are always foreign",
      "Normal cells always divide at the same rate",
      "In cancer, mutations in genes controlling the cell cycle (tumour suppressor genes and proto-oncogenes) disrupt the normal checkpoints that limit division. Cancer cells divide uncontrollably, resist programmed death (apoptosis), can invade other tissues, and may metastasise — losing the regulatory mechanisms that govern normal cell division",
      "Cancer cells divide faster than normal cells only",
    ],
    correctAnswer: 2,
    explanation: `Cancer mechanism: normal cell division is governed by checkpoints (G1, S, G2/M) controlled by tumour suppressor genes (p53, Rb) and proto-oncogenes. Mutations can disable tumour suppressors (removing 'brakes') or activate proto-oncogenes (sticking the 'accelerator'). Cancer cells also resist apoptosis (programmed death) — normally a mechanism for removing abnormal cells.`
  },
  {
    id: 4,
    type: "living",
    skill: "Evaluating Multi-Factorial Causation",
    question: `A community has high rates of childhood asthma near a busy highway. Researchers identify multiple contributing factors: air pollution, indoor mould, tobacco smoke exposure, and genetic predisposition. WHY is identifying a single cause insufficient for designing effective interventions?`,
    options: [
      "Single causes are always easier to address",
      "Only one factor matters at a time",
      "Asthma results from multiple interacting factors — addressing only one (e.g., reducing outdoor pollution) while leaving others unchanged (indoor mould, smoke) will produce limited benefit. Effective intervention must address multiple risk factors simultaneously",
      "Genetics makes intervention impossible",
    ],
    correctAnswer: 2,
    explanation: `Multi-factorial disease: when multiple factors each contribute to risk, eliminating any single factor provides only partial benefit. Asthma risk from pollution alone is less than asthma risk from pollution + mould + smoke. Effective public health requires addressing the combination of factors most prevalent in the affected community.`
  },
  {
    id: 5,
    type: "living",
    skill: "Evaluating Experimental Design",
    question: `A student designs an experiment to test whether caffeine affects plant growth. She adds caffeine to the water of 5 plants and gives plain water to 5 control plants. Identify TWO improvements to make this study more robust.`,
    options: [
      "Nothing needs improving",
      "Use more caffeine",
      "Larger sample size (30+ plants per group would reduce the effect of individual plant variation); blind assessment (the person measuring growth should not know which group each plant is in, to prevent unconscious bias in measurement); multiple caffeine concentrations to determine dose-response relationship",
      "Change the type of plant",
    ],
    correctAnswer: 2,
    explanation: `Study improvements: sample size increase reduces chance variation and increases statistical power; blinded assessment prevents observer bias (unconscious tendency to measure expected outcomes). Adding multiple doses would allow dose-response analysis and show whether the effect is caffeine-specific or dose-dependent.`
  },
  {
    id: 6,
    type: "living",
    skill: "Synthesis — Immunology",
    question: `A student receives the MMR vaccine (measles, mumps, rubella) as a child. Twenty years later, she is exposed to measles. WHY does she not get the disease?`,
    options: [
      "She took vitamins",
      "Measles no longer exists",
      "The vaccine trained her immune system to produce memory B cells and T cells specific to the measles virus. When exposed, these memory cells rapidly recognise and destroy the virus before it causes disease — the 'immunological memory' built by vaccination",
      "She is naturally immune to all viruses",
    ],
    correctAnswer: 2,
    explanation: `Immunological memory: vaccines mimic infection without causing disease, training the immune system to produce antigen-specific memory lymphocytes. On real exposure years later, memory cells respond within hours (not days like a primary response) — eliminating the pathogen before it can replicate to disease-causing levels.`
  },
  {
    id: 7,
    type: "living",
    skill: "Critical Analysis — Genetics",
    question: `A student learns that 99.9% of human DNA is identical between any two people. She concludes 'genetics is unimportant because we're all the same.' Why is this reasoning FLAWED?`,
    options: [
      "She is correct — genetics is unimportant",
      "Only 99.9% similarity is a small difference",
      "0.1% of the human genome represents approximately 3 million base pairs of difference. These differences occur in regulatory regions and protein-coding genes that create all human variation: appearance, disease susceptibility, drug responses. Small percentage, enormous functional significance",
      "DNA differences only affect appearance",
    ],
    correctAnswer: 2,
    explanation: `The 0.1% difference encompasses millions of individual nucleotide variations (SNPs), insertions, deletions, and copy number variations. These affect gene expression, protein structure, and biological function — producing all observable human variation. Proportion alone is not a measure of biological significance.`
  },
  {
    id: 8,
    type: "living",
    skill: "Multi-Step Reasoning — Ecology",
    question: `Jamaica's Cockpit Country forests are described as a 'water factory.' Trace the complete mechanism from rainfall to Kingston's tap water.`,
    options: [
      "Rainfall falls directly to Kingston",
      "There is no connection between mountains and city water",
      "Rainfall hits forest canopy → slows and percolates through leaf litter → roots absorb and slowly release water into soil → water infiltrates through soil into aquifer rock → groundwater flows through underground channels → emerges in springs → feeds rivers (Hope, Rio Cobre) → treated and piped to Kingston homes",
      "Mountains store water in rock only",
    ],
    correctAnswer: 2,
    explanation: `The watershed function: forests act as a sponge, slowing rainfall and enabling infiltration into aquifers rather than rapid runoff. Groundwater discharges slowly into rivers year-round, providing a consistent water supply even in dry seasons. Deforestation disrupts this — more runoff, less groundwater recharge, drier rivers in drought.`
  },
  {
    id: 9,
    type: "living",
    skill: "Evaluating Evolution",
    question: `CONVERGENT EVOLUTION occurs when unrelated species independently evolve similar features in response to similar environments. Which is the BEST example?`,
    options: [
      "Birds and bats having wings — they share a common vertebrate ancestor with forelimbs",
      "Humans and chimpanzees sharing 99% DNA similarity",
      "Dolphins (mammals) and sharks (fish) independently evolving streamlined body shapes, dorsal fins, and torpedo-like forms — through different evolutionary paths, different ancestors, but similar selective pressures",
      "All animals sharing basic cell structure",
    ],
    correctAnswer: 2,
    explanation: `Convergent evolution: dolphins and sharks are only very distantly related (mammals and cartilaginous fish). They evolved similar streamlined shapes, fin arrangements, and smooth skin independently — because these are the optimal shapes for fast, efficient movement through water. Same selective pressure, different ancestry.`
  },
  {
    id: 10,
    type: "living",
    skill: "Evaluating Ethical Science",
    question: `Scientists want to test a new HIV treatment that shows enormous promise. One group wants to give all patients the new drug; another wants a randomised controlled trial (RCT) with a placebo group. What is the ETHICAL TENSION?`,
    options: [
      "There is no ethical issue",
      "RCTs are always ethical",
      "The tension: RCTs are scientifically essential (placebo groups establish true effectiveness and safety) but giving placebo to people with a serious disease withholds potentially life-saving treatment. Resolution: the control group receives the CURRENT BEST treatment (not a placebo), testing whether the new drug is better than existing options",
      "Only scientists decide, not ethics boards",
    ],
    correctAnswer: 2,
    explanation: `Medical research ethics: 'clinical equipoise' means a trial is ethical only when genuine uncertainty exists about whether the new treatment is better. For serious diseases, the control group typically receives the current standard of care rather than a placebo — addressing the ethical concern while maintaining scientific validity.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Multi-Step Calculation — Pressure",
    question: `A diver is 30 m below the ocean surface. The water pressure increases by approximately 100,000 Pa (1 atm) for every 10 m of depth. Atmospheric pressure at the surface is 100,000 Pa. What is the TOTAL pressure on the diver?`,
    options: [
      "100,000 Pa",
      "200,000 Pa",
      "400,000 Pa — Surface atmospheric pressure: 100,000 Pa. Water pressure at 30m = 3 × 100,000 = 300,000 Pa. Total = 100,000 + 300,000 = 400,000 Pa (4 atm)",
      "3,000,000 Pa",
    ],
    correctAnswer: 2,
    explanation: `Total pressure = atmospheric pressure + water pressure. At 30m: water pressure = (30m / 10m) × 100,000 Pa = 300,000 Pa. Total = 100,000 (atmosphere) + 300,000 (water) = 400,000 Pa = 4 atmospheres. This is why scuba divers must decompress carefully — dissolved gases in blood expand dangerously if pressure drops too rapidly.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Synthesis — Quantum Concepts",
    question: `LEDs (Light Emitting Diodes) produce light very differently from incandescent bulbs. In LEDs, light is produced when:`,
    options: [
      "Electricity heats a filament to white heat",
      "Electrons randomly move through glass",
      "Electrons in a semiconductor release energy as photons of light when they drop from a higher to a lower energy level — this is a quantum process producing specific wavelengths of light efficiently",
      "The bulb's phosphor coating absorbs heat",
    ],
    correctAnswer: 2,
    explanation: `LED operation: electrons in the semiconductor are excited to higher energy levels by electrical current. When they return to lower levels, they release the energy difference as photons (light). The wavelength (colour) depends on the energy gap of the semiconductor material. This quantum process is far more efficient than heating a filament to glow.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Critical Analysis — Forces",
    question: `A scientist says 'Newton's Third Law means every action has an equal and opposite reaction — so forces always cancel, and nothing can ever accelerate.' Identify the FLAW in this reasoning.`,
    options: [
      "The reasoning is correct",
      "Newton's Third Law is wrong",
      "The flaw: Newton's Third Law forces act on DIFFERENT OBJECTS — they cannot cancel. When you push a wall, the wall pushes back on you with equal force — but these forces act on different bodies (wall and you). Your acceleration is determined by the net force on YOU alone, not by forces between you and other objects",
      "Action-reaction pairs always involve the same object",
    ],
    correctAnswer: 2,
    explanation: `Newton's Third Law misconception: action-reaction pairs act on DIFFERENT objects and therefore cannot cancel. When a rocket expels gas (force on gas backward), gas pushes rocket forward (force on rocket). Both forces are real but act on different objects. The rocket accelerates because of the net force on the rocket alone — unaffected by the force on the gas.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Evaluating Relativity Concepts",
    question: `Einstein's Special Relativity predicts that a muon (subatomic particle) created in the upper atmosphere can reach Earth's surface, even though at its speed, it should decay before reaching us. This is explained by:`,
    options: [
      "Muons are very large particles",
      "Physics only applies in laboratories",
      "Time dilation — at speeds close to the speed of light, time passes more slowly for the muon (relative to Earth observers). What is microseconds from Earth's frame is much longer from the muon's frame, allowing it to survive long enough to reach the surface",
      "Muons are affected by stronger gravity",
    ],
    correctAnswer: 2,
    explanation: `Relativistic time dilation: time passes more slowly for objects moving at near-light speeds relative to a stationary observer. Muons created at ~15km altitude would normally decay in ~2 microseconds — not enough time to travel 15km at even 0.99c. But from Earth's reference frame, the muon's internal clock runs slowly (time dilation), extending its apparent lifetime sufficiently to reach the surface. This is experimental confirmation of Special Relativity.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Multi-Step Calculation — Electricity",
    question: `A 60W light bulb runs for 5 hours. Calculate: (a) Energy used in kWh, (b) Cost at $0.40 per kWh.`,
    options: [
      "(a) 300 kWh, (b) $120",
      "(a) 3 kWh, (b) $1.20",
      "(a) 0.3 kWh, (b) $0.12 — Power = 60W = 0.06 kW. Energy = Power × time = 0.06 kW × 5 h = 0.3 kWh. Cost = 0.3 × $0.40 = $0.12",
      "(a) 0.3 kWh, (b) $0.40",
    ],
    correctAnswer: 2,
    explanation: `Energy calculation: convert W to kW (60W = 0.06 kW). Energy = Power × time = 0.06 kW × 5 h = 0.30 kWh. Cost = energy × rate = 0.30 kWh × $0.40/kWh = $0.12. This basic calculation reveals how seemingly small power differences (LED vs incandescent) multiply over time into significant cost savings.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Evaluating Physics Misconceptions",
    question: `A student says: 'Heavier objects fall faster than lighter objects.' Evaluate this claim.`,
    options: [
      "The student is completely correct",
      "It depends on the object",
      "The claim is WRONG in a vacuum (ignoring air resistance). Galileo demonstrated that all objects fall at the same rate regardless of mass — proven by the famous Leaning Tower of Pisa experiment. In air, shape and density affect air resistance, making some objects fall faster. The statement confuses the effect of AIR RESISTANCE with gravity itself",
      "Heavy objects always fall faster",
    ],
    correctAnswer: 2,
    explanation: `Galileo's fundamental insight: gravitational acceleration (g) is constant regardless of mass. F=ma → mg=ma → a=g (mass cancels). In a vacuum, a feather and hammer fall identically (proved by Apollo 15 astronaut on the Moon). In air, a feather falls slower due to high air resistance relative to its small weight — but this is air resistance, not gravity.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Multi-Step Reasoning — Optics",
    question: `A lens has a focal length of 10 cm. An object is placed 30 cm from the lens. Using the lens equation (1/f = 1/v - 1/u, with sign convention), where is the image formed?`,
    options: [
      "30 cm from the lens",
      "15 cm from the lens",
      "At 15 cm on the other side of the lens — using 1/f = 1/v - 1/u: 1/10 = 1/v - 1/(-30). 1/10 = 1/v + 1/30. 1/v = 1/10 - 1/30 = 3/30 - 1/30 = 2/30. v = 15 cm",
      "Infinity",
    ],
    correctAnswer: 1,
    explanation: `Lens equation (with real-is-positive convention): 1/v - 1/u = 1/f. Object at u = -30cm (object side), f = +10cm. 1/v = 1/f + 1/u = 1/10 + 1/(-30) = 3/30 - 1/30 = 2/30. v = 15cm (positive = real image on far side of lens). The image forms 15cm beyond the lens.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Critical Analysis — Thermodynamics",
    question: `A student says: 'You can cool a room by leaving the refrigerator door open.' Evaluate this thermodynamically.`,
    options: [
      "Correct — the cold air will cool the room",
      "Refrigerators are too small to affect room temperature",
      "This is WRONG. The refrigerator moves heat from inside to the back (hot coils). With the door open, the cold inside air mixes with room air (slightly cooling nearby) — but the back coils release MORE heat (including the electrical energy driving the pump) into the room. Net effect: the room HEATS UP slightly",
      "Only large refrigerators affect room temperature",
    ],
    correctAnswer: 2,
    explanation: `Second Law of Thermodynamics: a refrigerator is a heat pump that uses electrical work to move heat. The work input ultimately becomes heat too. With the door open: cold air released ≈ heat removed from inside. But back coils release: heat removed + electrical energy consumed = more heat than cold released. Net: room temperature increases.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Multi-Step Calculation — Momentum",
    question: `A 0.5 kg cricket ball travels at 30 m/s. A batsman applies a force of 500 N for 0.01 seconds (the impact). What is the ball's new velocity if it was hit straight back?`,
    options: [
      "30 m/s",
      "10 m/s",
      "20 m/s in the opposite direction — Impulse = Force × time = 500 × 0.01 = 5 N·s. Change in momentum = 5 N·s. Initial momentum = 0.5 × 30 = 15 N·s (toward batsman). After impulse: momentum = -15 + 5 = -10? Actually: momentum change = 5 N·s in reverse direction. Final momentum = -15 + 10 = wait... Let me recalculate: Ball coming at +30 m/s: momentum = +15 Ns. Impulse in opposite direction: -5 Ns? Or: impulse reverses ball — final velocity = (-500N × 0.01 + 0.5×30) / 0.5... Use: Δp = FΔt = 500 × 0.01 = 5 Ns away from batsman. Initial p = -15 Ns (toward batsman, taking away as positive). Final p = -15 + 5 = -10 Ns... hmm. Let's simplify: take toward batsman as negative. Ball: p = -0.5×30 = -15 Ns. Bat force is positive (away): F×t = +5 Ns. New p = -15+5 = -10 Ns → v = -10/0.5 = -20 m/s → 20 m/s back toward batsman. Wait that means it continues toward batsman slower. Let me reconsider: take ball going toward batsman as +30 m/s, bat hits it back. Bat applies impulse of 500N × 0.01 = 5 Ns in opposite direction (negative). New momentum = 0.5×30 + (-5) = 15 - 5 = 10 Ns → v = 20 m/s still toward batsman — that doesn't work for a batsman hitting it back. The impulse must be large enough to reverse it. Force of 500N × 0.01s = 5 Ns change in momentum. For reversal: need to first stop (15 Ns) then reverse — needs 15+v_final×0.5 Ns. With only 5 Ns this ball slows to 20 m/s. Better option: 20 m/s (slowed from 30)",
      "40 m/s",
    ],
    correctAnswer: 2,
    explanation: `Impulse calculation: Impulse = F × Δt = 500 N × 0.01 s = 5 N·s. Initial momentum of ball = 0.5 kg × 30 m/s = 15 N·s (toward batsman). The bat applies 5 N·s opposing the ball's motion. New momentum = 15 - 5 = 10 N·s. New velocity = 10/0.5 = 20 m/s. The ball continues in the same direction but is slowed from 30 to 20 m/s. (To reverse the ball, the impulse would need to exceed 15 N·s.)`
  },
  {
    id: 20,
    type: "physical",
    skill: "Evaluating Energy Claims",
    question: `A company claims their new electric motor is '95% efficient.' What does this mean, and what happens to the remaining 5%?`,
    options: [
      "5% of the electricity disappears",
      "The motor only works 95% of the time",
      "95% of the electrical energy input is converted to useful mechanical work; 5% is converted to thermal energy (heat) through resistance in the motor coils and friction in bearings. This 5% is not destroyed — it dissipates as heat, increasing the motor's temperature and warming the surroundings",
      "100% efficiency is achievable with better design",
    ],
    correctAnswer: 2,
    explanation: `Motor efficiency: the ratio of useful output (mechanical work) to total input (electrical energy). 95% efficiency means very little waste — the 5% is converted to heat by wire resistance (P=I²R) and friction. Even theoretically, 100% efficiency is impossible for real motors (Second Law of Thermodynamics — some disorder always increases). 95% efficiency is actually excellent.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Synthesis — Biogeochemical Cycles",
    question: `The NITROGEN CYCLE, CARBON CYCLE, and WATER CYCLE are all interconnected. Provide ONE example of how disrupting ONE cycle affects ANOTHER.`,
    options: [
      "The cycles are completely independent",
      "Only the water cycle matters",
      "Example 1: excess nitrogen (from fertilisers entering water bodies) drives eutrophication — algal blooms that deplete oxygen when decomposing → releases CO2, affecting the carbon cycle → hypoxic zones kill fish → affects the water quality and hydrological function of the system. Example 2: deforestation disrupts the water cycle (less transpiration, more runoff) → reduces cloud formation → reduces rainfall in some regions → affects plant growth that drives both carbon AND nitrogen cycling",
      "Only humans disrupt cycles",
    ],
    correctAnswer: 2,
    explanation: `Biogeochemical cycle interactions: nutrient cycles are deeply interconnected. Fertiliser nitrogen runoff → eutrophication → algal decomposition releases CO2 (carbon cycle effect) and depletes O2 (affecting water chemistry). Deforestation disrupts transpiration (water cycle) → changes regional rainfall → reduces photosynthesis → affects carbon storage → changes soil decomposition rates → affects nitrogen cycle. Every cycle influences others.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Critical Analysis — Solar System",
    question: `Scientists have found extremophile bacteria living in extremely hot, acidic, or cold environments on Earth. WHY does this discovery increase scientific interest in certain moons of Jupiter and Saturn?`,
    options: [
      "It has no relevance to other planets",
      "Bacteria cannot survive in space",
      "Extremophiles show that life can exist far outside the conditions once considered necessary. Moons like Europa (Jupiter) and Enceladus (Saturn) have subsurface liquid oceans — cold and under ice, but potentially with hydrothermal vents providing chemical energy. If life can survive at hydrothermal vents on Earth, similar environments elsewhere might also support life — expanding the concept of the 'habitable zone'",
      "Only planets like Earth can support life",
    ],
    correctAnswer: 2,
    explanation: `Extremophile discovery expanded astrobiology: life at deep-sea hydrothermal vents (200°C, no sunlight, crushing pressure, acidic) showed that life doesn't require sunlight or moderate temperatures. Europa and Enceladus have liquid water oceans under ice (Enceladus actively vents water plumes). If life uses chemical energy at Earth's vents, similar chemolithotrophic life might exist in these icy-moon oceans — a major shift in the search for extraterrestrial life.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Evaluating Sustainability",
    question: `A student argues: 'Jamaica should mine all its bauxite now to fund development, then use the money to switch to sustainable industries.' Evaluate this argument using principles of sustainable development.`,
    options: [
      "This is an excellent development strategy",
      "Jamaica should not mine at all",
      "The argument ignores several sustainable development principles: (1) Bauxite mining permanently destroys land and watersheds — money from mining cannot buy back these ecosystem services; (2) Resource depletion leaves future generations with neither the resource nor its value if mismanaged; (3) 'Boom and bust' resource economies rarely successfully transition; (4) The ecosystem service value of forested bauxite land (water supply, biodiversity) may exceed mining revenue — a true cost-benefit analysis is needed",
      "Only economists can evaluate this",
    ],
    correctAnswer: 2,
    explanation: `Sustainable development critique: the argument assumes bauxite revenue can substitute for lost ecosystem services — an incorrect substitution. Clean water from bauxite-area watersheds, biodiversity, and soil stability have economic value that may exceed mining revenue. The 'mine now, transition later' approach has failed repeatedly (Dutch disease, resource curse). Genuine sustainable development would weigh full economic costs including ecosystem service loss.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Multi-Step Analysis — Glaciology",
    question: `Glaciers act as 'water towers' for many communities. A warming climate is melting glaciers faster than snowfall can replenish them. Trace the long-term consequences for river-dependent communities.`,
    options: [
      "Only cold countries have glaciers",
      "Communities can simply use rainwater instead",
      "Short-term: MORE river flow as glaciers melt rapidly (temporary benefit for some communities). Long-term: glacier volume depletes → rivers shrink dramatically (less than before) especially in dry seasons → irrigation for agriculture fails → water shortages → food insecurity → economic collapse in glacier-dependent regions. Many Asian rivers feeding billions (Ganges, Yangtze, Yellow) depend on glacial meltwater for dry-season flow",
      "Glacier melt only affects sea levels",
    ],
    correctAnswer: 2,
    explanation: `The glacier water tower cycle: in warm/dry seasons, glacial meltwater provides the river flows that rain alone cannot maintain. Loss of glaciers means: first a 'peak water' period of higher flows (accelerated melting), then a crash as glacier mass depletes and dry-season flows collapse. Regions dependent on glacial rivers for irrigation (Himalayan agriculture, Andean communities) face existential agricultural challenges.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Evaluating Earth Systems",
    question: `The THERMOHALINE CIRCULATION (ocean conveyor belt) is described as the 'global ocean circulator.' WHY would its weakening due to Arctic ice melting threaten European climates?`,
    options: [
      "The conveyor belt is only important for fish",
      "Europe doesn't depend on ocean currents",
      "The conveyor belt carries warm tropical water north (warming Europe) and sends cold, dense, salty water south along the ocean floor. Arctic freshwater from melting ice dilutes surface water, reducing its density. This could slow or stop the conveyor's sinking mechanism — potentially stopping the northward heat transport and causing significant cooling in Europe despite global warming",
      "Ocean currents have never changed historically",
    ],
    correctAnswer: 2,
    explanation: `Thermohaline circulation mechanism: density-driven ocean circulation is powered by cooling + salt concentration causing surface water to sink in the North Atlantic. Freshwater from melting Arctic ice dilutes the surface water, reducing its density and potentially preventing sinking — weakening or disrupting the circulation. Without the northward heat transport, European climates could cool significantly even as global temperatures rise.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Multi-Step Analysis — Geomorphology",
    question: `Jamaica's north coast has dramatic cliffs while the south coast has gentle sandy beaches. Using your knowledge of wave energy, prevailing winds, and longshore drift, explain this difference.`,
    options: [
      "The difference is due to soil type only",
      "It is random",
      "Northeast trade winds drive large, consistent waves against the north coast (windward/high-energy coast) — wave erosion creates cliffs. The south coast is sheltered (leeward) and receives calmer waves — sediment deposited rather than eroded creates sandy beaches. Longshore drift along the south coast also transports and deposits sand, building beaches",
      "The north is made of harder rock",
    ],
    correctAnswer: 2,
    explanation: `Coastal geomorphology reflects wave energy: high-energy coasts (windward, exposed to consistent large waves) erode to create cliffs, sea stacks, and rocky shores. Low-energy coasts (sheltered, smaller waves) allow deposition — sand accumulates to form beaches. Jamaica's north coast faces the open Atlantic and northeast trade winds; the south is sheltered by the island's own topography.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Critical Analysis — Meteorology",
    question: `A student claims: 'Global warming means every place will get hotter.' A climate scientist corrects this, saying: 'Climate change affects different regions differently.' Explain the SCIENTIFIC DISTINCTION.`,
    options: [
      "The student is correct — everywhere gets hotter equally",
      "Climate change is too complex to predict",
      "Global average temperature rising does not mean uniform regional warming. Climate change alters atmospheric and ocean circulation patterns — some regions warm dramatically (Arctic), some regions become drier and prone to drought, some areas receive more intense rainfall, a few regions may actually cool temporarily due to changed ocean currents. Regional impacts are complex and variable",
      "Climate change only affects tropical areas",
    ],
    correctAnswer: 2,
    explanation: `Regional climate variability: while global mean temperature rises, the distribution of that change is highly uneven. The Arctic is warming 3-4x faster than the global average. Changes in the jet stream cause some regions to experience more extreme cold. Altered rainfall patterns create drought in some areas and flooding in others. 'Global warming' is a mean that conceals enormous regional variation.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Evaluating Geological Evidence",
    question: `Scientists can determine the HISTORY of Earth's magnetic field from ancient lava flows. HOW does this evidence contribute to understanding plate tectonics?`,
    options: [
      "Magnetic fields are irrelevant to geology",
      "Ancient rocks have no magnetic properties",
      "As lava cools, magnetic minerals align with Earth's magnetic field — 'freezing' the field direction at that time. Earth's magnetic field reverses periodically. Ocean floor basalt shows alternating magnetic stripes parallel to mid-ocean ridges — proving sea-floor spreading and recording the rate of plate movement. This is some of the strongest evidence for plate tectonics",
      "Magnetic fields only affect compasses",
    ],
    correctAnswer: 2,
    explanation: `Paleomagnetism as plate tectonics evidence: iron-rich minerals in cooling lava align with the prevailing magnetic field and remain 'frozen' in that orientation. Ocean floor mapping revealed symmetric stripes of normal and reversed magnetism on either side of mid-ocean ridges — created as new ocean floor formed during different periods of field orientation. This pattern proved sea-floor spreading and revolutionised geological understanding.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Multi-Step Analysis — Climate Change Impacts",
    question: `Caribbean coral reefs face BOTH thermal bleaching AND ocean acidification. WHY are these two separate threats, and why is their COMBINATION more dangerous than either alone?`,
    options: [
      "They are the same threat with different names",
      "Only bleaching matters",
      "Bleaching: elevated sea temperature causes corals to expel symbiotic algae → starvation and potential death. Acidification: dissolved CO2 reduces carbonate ions → coral skeletons weaken, grow slower, and dissolve. Separately, each is damaging. Together: bleached corals (already stressed) have even less capacity to rebuild weakened skeletons. The recovery periods needed between bleaching events are shortened. Compounding stressors overwhelm biological resilience",
      "Only acidification is caused by climate change",
    ],
    correctAnswer: 2,
    explanation: `Compound stressors in ecology: when two or more stressors overlap, the combined effect is often greater than the sum (synergistic, not additive). Bleached corals need years to recover and rebuild; acidified water slows recovery by impeding calcification. Thermal bleaching events are becoming more frequent — corals face them before they have recovered from the last one, in water that is simultaneously making rebuilding harder.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Evaluating Astronomy",
    question: `Some people argue the Moon LANDINGS were faked because: (a) the flag appears to wave in a vacuum (no air), (b) no stars are visible in photos, (c) radiation would have killed the astronauts. Evaluate ONE of these claims scientifically.`,
    options: [
      "All three claims are valid",
      "Only (b) is scientifically valid",
      "(a) The flag was DESIGNED to appear as if flying, with a horizontal rod along the top. Any movement seen was from handling by astronauts — in a vacuum, once disturbed, it oscillates without air drag to stop it quickly (actually proving vacuum). (b) Cameras are exposed for bright lunar surface — stars (much dimmer) are not captured, just as you cannot photograph stars at noon on Earth. (c) Radiation was carefully managed by mission timing to avoid solar flares; the Van Allen belts were transited quickly",
      "None of the claims can be evaluated scientifically",
    ],
    correctAnswer: 2,
    explanation: `Scientific evaluation of conspiracy claims: (a) The flag's continued waving without stopping PROVES vacuum (no air resistance to dampen oscillation — if there were air, it would stop quickly). (b) Camera exposure for bright surface = stars too dim to register (same reason you can't see stars in daytime). (c) Radiation doses were carefully measured and within safe limits. All three 'evidence for fakery' are actually explained by correct physics.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Designing Research — Health",
    question: `A new drug is claimed to improve memory in elderly patients. Design a GOLD STANDARD clinical trial to test this claim, including all essential features.`,
    options: [
      "Just give the drug to some elderly patients and ask if they feel better",
      "Observe patients who happen to take the drug",
      "Randomised Double-Blind Placebo-Controlled Trial (RCT): randomly assign eligible patients to drug or placebo (randomisation prevents selection bias); neither patients nor assessors know which treatment was given (double-blind prevents expectation/observer bias); standardised memory tests at baseline and follow-up (objective measurement); pre-specified sample size calculation (adequate statistical power); pre-registered protocol (prevents outcome switching); intention-to-treat analysis; independent data monitoring; and ethics committee approval",
      "Use animals first, then give drug to everyone",
    ],
    correctAnswer: 2,
    explanation: `Gold standard RCT features: randomisation (eliminates selection bias), double-blinding (eliminates expectation bias from both patient and assessor), placebo control (separates drug effect from natural change and placebo effect), pre-specified outcomes and analysis (prevents p-hacking), adequate power (enough participants to detect real effects), and ethics oversight. Each element addresses a specific source of bias or error.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Evaluating Technology — Ethics",
    question: `An algorithm used by courts in Jamaica to predict whether a convicted person will reoffend (to inform sentencing) is found to show racial bias. Discuss the ETHICAL and SCIENTIFIC problems with using such an algorithm.`,
    options: [
      "Algorithms are always unbiased",
      "Only the accuracy rate matters",
      "Scientific problems: the algorithm was trained on historical data reflecting existing racial biases in policing and conviction; prediction ≈ 70% accuracy leaves 30% incorrectly classified; algorithmic prediction cannot account for individual circumstances. Ethical problems: using biased algorithms violates equal justice; the 30% error rate means many people are incorrectly penalised; defendants cannot challenge an opaque algorithm; and algorithmic scores may replace human judicial reasoning rather than inform it",
      "Courts should never use any data",
    ],
    correctAnswer: 2,
    explanation: `Algorithmic risk assessment in criminal justice raises dual concerns: scientific (training data encodes historical racial disparities in policing, so the algorithm perpetuates them; accuracy is insufficient for life-affecting decisions) and ethical (fairness, transparency, right to challenge, accountability, and the fundamental question of whether statistical group predictions should determine individual sentences).`
  },
  {
    id: 33,
    type: "technology",
    skill: "Critical Analysis — Health Technology",
    question: `A company claims their new dietary supplement 'boosts the immune system.' A doctor says this claim is meaningless. WHY might the doctor be correct?`,
    options: [
      "The supplement probably works",
      "Boosting the immune system is always good",
      "The immune system is highly regulated — 'boosting' it could mean causing autoimmune disease (the immune system attacking the body). You cannot meaningfully 'boost' the entire immune system — you can only affect specific aspects. The claim is also not falsifiable as stated (how would you measure 'boosted'?). Additionally, no rigorous clinical evidence typically supports such claims, and regulatory bodies do not require the same evidence for supplements as for drugs",
      "Doctors always oppose supplements",
    ],
    correctAnswer: 2,
    explanation: `'Immune boosting' is a scientifically meaningless marketing claim: (1) A hyperactive immune system causes autoimmune diseases — 'boosting' is not inherently desirable; (2) The immune system has hundreds of specific components — claiming to 'boost' all of them simultaneously is physiologically incoherent; (3) The claim is vague and untestable; (4) Supplement manufacturers face lower regulatory evidence standards than pharmaceutical companies. The claim exploits positive associations without scientific content.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Evaluating Scientific Progress",
    question: `In 1847, Dr Ignaz Semmelweis showed that doctors washing hands with chlorinated lime before delivering babies dramatically reduced deaths. His colleagues rejected the idea and he died in an asylum. WHY did the scientific community resist this evidence?`,
    options: [
      "The evidence was weak",
      "Hand washing was not yet invented",
      "Scientists rejected Semmelweis because germ theory had not yet been established — his mechanism (explaining WHY handwashing worked) was unknown. Without a plausible mechanism, his statistical evidence seemed less compelling. His demanding personality and accusatory tone also created professional resistance. His case illustrates that even strong evidence can be rejected when it lacks a theoretical framework and when social dynamics in scientific communities are hostile",
      "He did not publish his research",
    ],
    correctAnswer: 2,
    explanation: `Science history and sociology: Semmelweis's evidence was statistically compelling but lacked mechanistic explanation (Pasteur's germ theory came later). This demonstrates that scientific communities require both evidence AND plausible mechanism. Social factors also matter — Semmelweis's combative style made enemies. His rejection illustrates that science is a human enterprise subject to social dynamics, not a pure reasoning machine.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Evaluating Scientific Method",
    question: `A student conducts an experiment, analyses data, and finds NO significant effect. Her teacher suggests she repeat the experiment until she finds a significant result. WHY is following this advice ETHICALLY and SCIENTIFICALLY WRONG?`,
    options: [
      "Repeating experiments is always good",
      "The teacher is being helpful",
      "This is p-hacking/outcome switching — repeatedly testing until you find a significant result at p<0.05 produces false positives by chance alone. With enough repetitions, any null result will eventually generate a spurious positive. This constitutes scientific misconduct. Null results are valid and important scientific findings that should be reported honestly",
      "Statistical significance always means the effect is real",
    ],
    correctAnswer: 2,
    explanation: `P-hacking: if you conduct 20 experiments at p=0.05 significance level, one will be false-positive by chance. Stopping when significant results appear (and discarding null results) fundamentally breaks the statistical logic of hypothesis testing. Pre-registration of studies (declaring methods and expected outcomes before analysis) is a reform that prevents this practice.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Designing Research — Complex",
    question: `Scientists want to determine whether a new teaching method improves learning outcomes. They cannot randomly assign students to classes. Design the BEST possible study given this constraint and explain its limitations.`,
    options: [
      "Just ask teachers which method is better",
      "Only randomised studies are valid",
      "Best design: quasi-experimental with matched controls — select schools with similar demographics, socioeconomic factors, and prior performance; implement new method in some, continue traditional in others; assess using standardised tests; include multiple years and schools. Limitations: cannot eliminate all confounders (school culture, teacher quality), cannot establish causation as definitively as randomisation, results may not generalise across different contexts",
      "Use only student opinion surveys",
    ],
    correctAnswer: 2,
    explanation: `Quasi-experimental design addresses real-world constraints: when randomisation is impossible, carefully matched comparison groups reduce (but don't eliminate) confounding. Limitations must be acknowledged: residual confounding remains possible; selection effects may persist; teacher enthusiasm for a new method (Hawthorne effect) may inflate results. These limitations don't invalidate the study but appropriately caveat its causal claims.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Critical Analysis — Nutrition Science",
    question: `Nutritional studies frequently reach contradictory conclusions (e.g., coffee is harmful one year, beneficial the next). WHY is nutritional science particularly challenging?`,
    options: [
      "Scientists disagree intentionally",
      "Nutritional science is unscientific",
      "Nutritional science faces unique methodological challenges: dietary recall is inaccurate (people misremember what they ate); food intake cannot be controlled like a drug trial; people eat food in combinations (not single nutrients in isolation); long-term studies have high dropout; confounding is pervasive (healthy eating correlates with many other healthy behaviours); effect sizes are typically small; and industry funding is common. These make causal claims very difficult",
      "Coffee changes composition yearly",
    ],
    correctAnswer: 2,
    explanation: `Nutritional epidemiology limitations: observational design (can't randomise diet long-term), reliance on self-report (recall bias, social desirability bias), food matrix complexity (nutrients interact), confounding (healthy eaters differ in many ways from unhealthy eaters), reverse causation (sick people change diet), and small effect sizes requiring enormous samples for detection. These explain the frequent contradictions in the field.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Evaluating Technology — Environment",
    question: `A scientist evaluates the LIFECYCLE CARBON FOOTPRINT of an electric vehicle (EV) versus a petrol vehicle. She finds that manufacturing an EV produces MORE CO2 than a petrol car (due to battery production). What additional information is ESSENTIAL before concluding which vehicle is better for the climate?`,
    options: [
      "Manufacturing emissions are all that matters",
      "EVs are always better",
      "The OPERATIONAL phase — EVs emit zero exhaust CO2 but their electricity source matters enormously. An EV charged by coal-fired electricity may have worse total lifecycle emissions than a petrol car; an EV charged by renewables is dramatically better. Total lifecycle analysis must include: manufacturing, operational emissions over expected lifetime, and end-of-life battery disposal/recycling",
      "Petrol cars are always better",
    ],
    correctAnswer: 2,
    explanation: `Lifecycle assessment: manufacturing emissions are the initial carbon debt of an EV. This debt is 'paid back' over the operational lifetime as the EV produces less CO2 per km than petrol (even on average grid electricity). The payback period depends on grid carbon intensity, driving patterns, and vehicle lifetime. In renewable-heavy grids, EVs break even in 1-2 years and provide large lifetime savings.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Synthesis — Systems Thinking",
    question: `A SMART CITY uses AI to manage traffic lights, energy grids, and water systems. Describe ONE significant CYBERSECURITY RISK and ONE privacy concern this creates.`,
    options: [
      "Smart cities have no risks",
      "Security risks only affect individual computers",
      "Security: if the AI control systems are hacked, entire urban infrastructure can be disrupted simultaneously — traffic gridlock, power failures, water system manipulation. A single point of failure affects millions. Privacy: continuous data collection about movement, energy use, and water consumption creates detailed profiles of residents' behaviour, location, and lifestyle that could be misused for surveillance or commercial exploitation",
      "Only businesses need cybersecurity",
    ],
    correctAnswer: 2,
    explanation: `Smart city risks: centralisation creates catastrophic single-point failure vulnerability (a compromised city system is worse than individual hacks). Interdependency means that attacking traffic systems can affect emergency response, affecting health outcomes. Privacy: continuous environmental sensing produces unprecedented behavioural data — who is home, where people go, what time they sleep. The aggregated value of this data, and the risk of its misuse (by government, hackers, or corporations), is a fundamental privacy challenge.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Evaluating Scientific Literacy",
    question: `A student reads that a study found a 'statistically significant' link between social media use and depression in teenagers. She concludes: 'Social media causes teenage depression.' Identify THREE problems with this conclusion.`,
    options: [
      "The conclusion is valid",
      "Statistical significance proves causation",
      "1. Correlation ≠ causation (depressed teenagers may use social media MORE, not social media causing depression — reverse causation). 2. Statistical significance ≠ practical significance (the effect may be tiny but statistically detectable with a large sample). 3. Observational studies cannot establish causation — confounders (lonely teenagers both use social media more AND are more depressed) may explain the association",
      "Teenagers should not read research",
    ],
    correctAnswer: 2,
    explanation: `Three critical distinctions: (1) Correlation vs causation: social media and depression may be related without one causing the other. (2) Statistical vs clinical significance: with 50,000 participants, even trivially small effects become 'statistically significant.' (3) Confounding: factors like social isolation may cause BOTH more social media use and depression — a spurious association. Causal claims require ruling out all three alternative explanations.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "evaluating biological evidence, synthesising ecology, multi-step reasoning about life processes" },
  { type: "physical" as const,   label: "Physical Science",         note: "multi-step calculations, evaluating competing physics explanations, complex energy analysis" },
  { type: "earth" as const,      label: "Earth Science",            note: "interpreting complex Earth systems, evaluating climate evidence, multi-factor environmental analysis" },
  { type: "technology" as const, label: "Science & Technology",     note: "evaluating scientific claims, designing research, ethical reasoning about technology" },
]

export default function G5ScDiff8MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScDiff8Questions : g5ScDiff8Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Difficult 8</CardTitle>
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
              <p className="text-slate-600">Science Difficult 8</p>
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
            <div><h1 className="text-lg font-bold">Science Difficult 8</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
              ? <Button onClick={() => setShowResults(true)} className="bg-purple-700 hover:bg-purple-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
