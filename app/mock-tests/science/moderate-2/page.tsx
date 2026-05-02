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

const g5ScMod2Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Applying Nutrition",
    question: `A growing child eats mostly rice and bread and very little protein. What health problem is she MOST at risk for?`,
    options: [
      "Obesity from too many carbohydrates",
      "Diabetes from excess sugar",
      "Protein-deficiency disease (like Kwashiorkor) — insufficient protein impairs growth, muscle development, and immune function",
      "She will grow faster than normal",
    ],
    correctAnswer: 2,
    explanation: `Protein is essential for growth, muscle building, enzyme production, and immune function. Children with protein-deficient diets develop kwashiorkor — characterised by stunted growth, muscle wasting, and oedema (fluid retention).`
  },
  {
    id: 2,
    type: "living",
    skill: "Cause & Effect",
    question: `When a large predator (like a shark) is removed from a marine ecosystem, what typically happens?`,
    options: [
      "The ecosystem improves",
      "Nothing significant changes",
      "The prey of the predator (like medium-sized fish) increases dramatically, which then over-predates smaller fish and invertebrates — a trophic cascade affecting the whole ecosystem",
      "Smaller fish immediately go extinct",
    ],
    correctAnswer: 2,
    explanation: `Top predators regulate populations below them. Remove them and prey species overpopulate, overconsuming their own food sources. This 'trophic cascade' restructures the entire ecosystem through the food web.`
  },
  {
    id: 3,
    type: "living",
    skill: "Data Interpretation",
    question: `Two groups of plants grow in identical conditions except Group A receives plain water and Group B receives water with added fertiliser. After 4 weeks, Group B is significantly taller. What can be concluded?`,
    options: [
      "Water is not needed for plant growth",
      "The result was due to chance",
      "The added nutrients in fertiliser promoted faster growth — supporting that nutrients are a limiting factor for plant growth in this experiment",
      "Light caused the difference",
    ],
    correctAnswer: 2,
    explanation: `The only difference between groups was the fertiliser — so any difference in growth is attributable to the fertiliser's nutrients. This is a valid conclusion from a controlled experiment.`
  },
  {
    id: 4,
    type: "living",
    skill: "Applying Genetics",
    question: `WHY do siblings from the same parents look different from each other?`,
    options: [
      "Parents' genes change between children",
      "Siblings are actually unrelated",
      "During reproduction, genes from each parent are randomly combined — each child inherits a different mix of parental alleles, producing different combinations of traits",
      "Parents choose different genes for each child",
    ],
    correctAnswer: 2,
    explanation: `Sexual reproduction produces genetic variation: each gamete (sperm or egg) is genetically unique through meiosis (crossing over and independent assortment). Each sibling receives a different random combination of parental alleles.`
  },
  {
    id: 5,
    type: "living",
    skill: "Applying Adaptation",
    question: `A bird species in Jamaica has a bill (beak) shaped like a long, thin tube. What type of food is it MOST LIKELY adapted to eat?`,
    options: [
      "Hard seeds",
      "Small insects in tree bark",
      "Nectar from deep tubular flowers — a long thin bill can reach where other birds cannot",
      "Large fruits",
    ],
    correctAnswer: 2,
    explanation: `Bill shape is a key adaptation for food type: long thin bills probe tubular flowers for nectar (like hummingbirds); thick conical bills crack seeds; pointed bills catch insects. Bill shape and food source coevolve.`
  },
  {
    id: 6,
    type: "living",
    skill: "Cause & Effect",
    question: `A student adds a small piece of ripe banana to a sealed jar containing yeast and sugar. A balloon attached to the jar inflates slowly over 24 hours. WHY?`,
    options: [
      "Banana gas filled the balloon",
      "The yeast ate the balloon",
      "Yeast ferment the sugar (and are stimulated by compounds in the banana), producing CO2 as a byproduct — the gas inflates the balloon",
      "The jar was leaking air",
    ],
    correctAnswer: 2,
    explanation: `Yeast fermentation: yeast break down sugar anaerobically, producing ethanol and CO2. The CO2 gas is trapped in the jar and inflates the balloon. Banana contains compounds that activate yeast more quickly.`
  },
  {
    id: 7,
    type: "living",
    skill: "Interpreting Ecosystem Data",
    question: `A graph shows that when rabbit populations increase, fox populations increase 6 months later. When rabbit populations decline, fox populations decline 6 months later. What relationship does this show?`,
    options: [
      "Foxes and rabbits live in different ecosystems",
      "Rabbit population determines food availability for foxes — when prey is abundant, predator populations grow; when prey declines, predators decline from food scarcity",
      "Rabbits cause foxes to hibernate",
      "The populations are unrelated",
    ],
    correctAnswer: 1,
    explanation: `This is the classic predator-prey population cycle. Fox (predator) populations track rabbit (prey) populations with a time lag — it takes time for more food to translate into more foxes (reproduction), so the peak follows prey by months.`
  },
  {
    id: 8,
    type: "living",
    skill: "Applying Human Biology",
    question: `Blood glucose rises after eating a meal. Which sequence of events CORRECTLY describes the body's response?`,
    options: [
      "Blood glucose rising causes diabetes immediately",
      "The body does nothing — blood glucose naturally stays high",
      "The pancreas detects high blood glucose → releases insulin → insulin signals cells to absorb glucose from blood → blood glucose returns to normal",
      "The liver releases more glucose into the blood",
    ],
    correctAnswer: 2,
    explanation: `This is normal blood glucose regulation: after eating, glucose enters the blood; the pancreas releases insulin; insulin acts as a 'key' that allows body cells to absorb glucose; blood glucose falls back to normal range.`
  },
  {
    id: 9,
    type: "living",
    skill: "Cause & Effect",
    question: `What would happen to a plant if its STOMATA were permanently closed?`,
    options: [
      "It would grow faster",
      "Nothing would change",
      "It would die: CO2 cannot enter for photosynthesis, and excess water vapour cannot exit — photosynthesis stops and the plant overheats",
      "It would produce more oxygen",
    ],
    correctAnswer: 2,
    explanation: `Stomata regulate gas exchange (CO2 in, O2 and water vapour out) and transpiration. Permanently closed = no CO2 for photosynthesis (starvation), no water vapour exit (overheating), and no water flow from roots (wilting). Death follows.`
  },
  {
    id: 10,
    type: "living",
    skill: "Applying Classification",
    question: `A student finds an organism that: has a hard exoskeleton, six legs, three body segments (head, thorax, abdomen), and compound eyes. Which group does it belong to?`,
    options: [
      "Arachnids (spiders)",
      "Myriapods (centipedes)",
      "Insects — six legs and three body segments are the defining characteristics",
      "Crustaceans (crabs)",
    ],
    correctAnswer: 2,
    explanation: `The diagnostic features of insects are: six legs, three body segments (head-thorax-abdomen), and compound eyes. Eight legs = arachnid; many legs = myriapod; ten legs = decapod crustacean.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Applying Forces",
    question: `A ball is kicked horizontally from a cliff. At the moment it leaves the cliff, which statement is TRUE?`,
    options: [
      "It has no horizontal velocity",
      "Gravity immediately stops the ball",
      "It has horizontal velocity (from the kick) AND immediately begins to accelerate downward due to gravity — the two motions are independent and combine to produce a curved path",
      "Gravity only acts when the ball touches the ground",
    ],
    correctAnswer: 2,
    explanation: `Projectile motion: horizontal and vertical motions are independent. The ball retains its horizontal velocity (no horizontal force, ignoring air resistance) while gravity simultaneously accelerates it downward. The combination produces a parabolic path.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Applying Energy",
    question: `A battery-powered torch converts energy in this sequence:`,
    options: [
      "Light energy → chemical energy → heat",
      "Mechanical energy → electrical energy → light",
      "Chemical energy (battery) → electrical energy (current) → light and heat energy (bulb)",
      "Nuclear energy → electrical energy → light",
    ],
    correctAnswer: 2,
    explanation: `Energy transformation chain in a torch: stored chemical energy in the battery → electrical energy (current flows through the circuit) → light energy + heat energy in the bulb. All energy is conserved but distributed between light (useful output) and heat (wasted output).`
  },
  {
    id: 13,
    type: "physical",
    skill: "Applying Chemistry",
    question: `When IRON RUSTS, it undergoes an OXIDATION reaction. Which conditions accelerate rusting?`,
    options: [
      "Only very hot temperatures",
      "Only salty water",
      "Water AND oxygen are both required — salt water accelerates rusting by increasing electrical conductivity; warm temperatures increase reaction rate",
      "Only the absence of paint",
    ],
    correctAnswer: 2,
    explanation: `Rusting requires both water and oxygen — it's an electrochemical process. Salt increases ionic conductivity of the water electrolyte, accelerating the reaction. Heat increases reaction rate. All three factors accelerate corrosion.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Applying Electricity",
    question: `A household circuit is protected by a fuse. The fuse 'blows' when the current exceeds a safe level. WHY is this protection important?`,
    options: [
      "It saves electricity",
      "Fuses reduce voltage",
      "Too much current causes excessive heating in wires — potentially starting fires. The fuse melts and breaks the circuit before the wiring overheats, protecting the building",
      "Fuses improve the quality of electricity",
    ],
    correctAnswer: 2,
    explanation: `Circuit protection: excessive current causes resistive heating (P = I²R). If wires overheat, insulation melts, creating fire hazards. A fuse is a deliberately weak link — it melts at safe-but-exceeded current, breaking the circuit before wiring overheats.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Data Interpretation",
    question: `A student measures the weight of the same object on Earth (60N), on the Moon (10N), and in space far from any planet (0N). What can be concluded?`,
    options: [
      "The object's mass changes in different locations",
      "Weight is the same everywhere",
      "Weight depends on gravitational field strength — it is greatest where gravity is strongest (Earth) and zero in deep space. Mass (the amount of matter) stays constant",
      "The measurements are incorrect",
    ],
    correctAnswer: 2,
    explanation: `This confirms the weight-mass distinction: weight = mass × gravitational field strength (W=mg). On Earth (g=10 m/s²), Moon (g=1.6 m/s²), and deep space (g≈0), the same mass produces different weights. Mass is invariant; weight depends on location.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Applying Waves",
    question: `A singer hits a very high-pitched note that shatters a glass. What property of the sound wave causes this?`,
    options: [
      "The loudness alone",
      "The colour of sound",
      "The frequency of the sound matches the natural resonant frequency of the glass — resonance causes the glass to vibrate with increasing amplitude until it shatters",
      "The speed of sound through glass",
    ],
    correctAnswer: 2,
    explanation: `Resonance: every object has natural frequencies at which it vibrates most easily. If a sound wave's frequency matches the glass's resonant frequency, the glass absorbs energy efficiently and vibrates with growing amplitude — eventually beyond its elastic limit.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Applying Thermodynamics",
    question: `THERMAL EXPANSION explains why gaps are left between railway tracks. WHY are gaps necessary?`,
    options: [
      "To make tracks cheaper to build",
      "For water drainage",
      "Metal expands when heated — on hot days, track sections expand lengthwise. Without gaps, expanding tracks would buckle and warp, derailing trains",
      "Gaps reduce noise from trains",
    ],
    correctAnswer: 2,
    explanation: `Thermal expansion: metals expand when heated. Railway tracks can be exposed to temperature ranges from -5°C to 45°C. Without expansion gaps, the increased length of hot tracks has nowhere to go — they buckle outward, creating dangerous kinks.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Applying Forces",
    question: `A parachutist jumps from a plane. Initially they accelerate downward. Eventually they reach TERMINAL VELOCITY and fall at constant speed. WHY?`,
    options: [
      "Gravity gets weaker the longer they fall",
      "Their weight decreases over time",
      "As speed increases, air resistance increases until it EQUALS the parachutist's weight — net force becomes zero and constant velocity (terminal velocity) is reached",
      "The parachute creates more gravity",
    ],
    correctAnswer: 2,
    explanation: `Terminal velocity: as falling speed increases, air resistance (proportional to speed²) increases. When air resistance equals gravitational force (weight), net force = 0. By Newton's First Law, constant velocity follows. Opening the parachute increases area → more air resistance → lower terminal velocity.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Applying Physics",
    question: `A student uses a pulley to lift a 100N load, applying a force of only 25N. The rope must be pulled:`,
    options: [
      "25 m to raise load 1 m",
      "0.25 m to raise load 1 m",
      "4 m to raise load 1 m — the work done by the effort equals the work done on the load (conservation of energy): 25N × 4m = 100N × 1m",
      "The same distance as the load is raised",
    ],
    correctAnswer: 2,
    explanation: `Conservation of energy in simple machines: work input = work output (ignoring friction). Work = Force × distance. 25N × d = 100N × 1m → d = 4m. The smaller force is applied over 4× the distance — trading distance for force.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Applying Optics",
    question: `A DIVERGING (concave) lens causes light rays to spread apart. This lens is used in:`,
    options: [
      "Magnifying glasses",
      "Refracting telescopes",
      "Spectacles for short-sighted (myopic) people — whose eyes converge light too soon, forming images in front of the retina. A diverging lens spreads light first so it converges at the correct position on the retina",
      "Microscope objective lenses",
    ],
    correctAnswer: 2,
    explanation: `Short-sightedness (myopia) occurs because the eyeball is too long or the cornea too curved — parallel light converges before reaching the retina. A diverging (concave) lens spreads rays slightly, so the eye's converging system places the image correctly on the retina.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Applying Climate Science",
    question: `WHY is the AMAZON RAINFOREST described as 'the lungs of the Earth'?`,
    options: [
      "It produces oxygen equal to all other forests combined",
      "Rainforests make a sound like breathing",
      "The Amazon absorbs enormous quantities of CO2 and produces oxygen through photosynthesis by its billions of trees — it significantly influences global atmospheric composition and climate regulation",
      "It is the largest forest in South America",
    ],
    correctAnswer: 2,
    explanation: `The Amazon metaphor: like lungs, the Amazon exchanges gases with the atmosphere at massive scale — absorbing CO2 (global greenhouse gas reduction) and releasing O2 (global oxygen contribution) and water vapour (influencing global rainfall patterns). Deforestation threatens this global service.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Applying Soil Science",
    question: `A farmer notices that after heavy rain, his fields are covered in a light brown layer of muddy water. His neighbour's forest field has clear, fast-draining water. WHY?`,
    options: [
      "Farmland absorbs more rain",
      "Forest soil is waterproof",
      "The farmer's exposed soil is eroded and suspended in runoff; the forest's root systems, leaf litter, and complex soil structure absorb rainfall, prevent erosion, and filter water — producing clear, filtered water",
      "The difference is only aesthetic",
    ],
    correctAnswer: 2,
    explanation: `Forests prevent erosion and filter water: root systems bind soil, canopy intercepts and slows rainfall, and forest floor absorbs water slowly. Bare farm soil has no such protection — rainfall dislodges and carries soil particles, producing the muddy runoff.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Data Interpretation",
    question: `A seismologist records an earthquake's P-waves arriving at three different stations at different times. She uses these times to determine the epicentre is 200 km away. What technique does she use?`,
    options: [
      "She uses the loudness of the waves",
      "She measures the temperature",
      "Triangulation using the travel time of seismic waves from multiple stations — the distance from each station is calculated from wave travel time, and the intersection of three circles reveals the epicentre",
      "She uses a single station",
    ],
    correctAnswer: 2,
    explanation: `Seismic triangulation: seismic waves travel at known speeds through Earth. Time delay from earthquake to each seismograph station determines distance. Drawing circles of those distances around three stations — the epicentre is where all three circles intersect.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Applying Astronomy",
    question: `WHY do we see the SAME FACE of the Moon from Earth?`,
    options: [
      "The Moon doesn't rotate at all",
      "Earth's gravity has stopped the Moon",
      "The Moon's rotation period exactly equals its orbital period — it rotates once per orbit (tidal locking). This means the same hemisphere always faces Earth; the far side (never seen from Earth) was not photographed until 1959",
      "The Moon is tidally locked only in summer",
    ],
    correctAnswer: 2,
    explanation: `Tidal locking: Earth's gravity over billions of years slowed the Moon's rotation until its spin period = orbital period (both ≈27.3 days). The result: the near side always faces Earth, the far side always faces away — we only ever see one hemisphere.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Applying Earth Science",
    question: `A student observes that the Sun is directly overhead at noon in Jamaica on June 21 (Summer Solstice). This is because:`,
    options: [
      "Jamaica is the closest country to the sun",
      "The sun moves to Jamaica in June",
      "Earth's axial tilt means the Northern Hemisphere (including Jamaica's latitude near the Tropic of Cancer) tilts toward the sun in June — the sun appears highest in the sky and is directly overhead at the tropics",
      "The sun's orbit changes seasonally",
    ],
    correctAnswer: 2,
    explanation: `Summer Solstice in the Northern Hemisphere: Earth's axis tilts toward the sun, so the sun appears at its highest point in the sky for northern latitudes. At the Tropic of Cancer (23.5°N), the sun is directly overhead — Jamaica at ≈18°N is close enough to experience near-overhead sun.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Applying Oceanography",
    question: `The GULF STREAM carries warm tropical water northward along the US east coast and across the Atlantic to northwest Europe. If the Gulf Stream were to weaken, what would happen to European climates?`,
    options: [
      "European summers would become hotter",
      "No significant change would occur",
      "Northwest European countries would experience much colder winters — currently they are much warmer than their latitude would suggest due to the heat transported by the Gulf Stream",
      "European rainfall would increase",
    ],
    correctAnswer: 2,
    explanation: `The Gulf Stream moderates western European climate: London (51°N) has mild winters compared to Moscow (56°N) or Montreal (45°N) at comparable latitudes. This warmth comes from Gulf Stream heat transport. If it weakened, Europe would experience much colder winters — a consequence that climate change could trigger by disrupting thermohaline circulation.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Applying Environmental Science",
    question: `WHY are WETLANDS (marshes, swamps) called 'nature's kidneys'?`,
    options: [
      "Wetlands produce urine",
      "Wetlands filter oxygen",
      "Wetlands filter water — pollutants, excess nutrients, and sediments are absorbed and broken down as water passes through the wetland system, cleaning it before it enters rivers or groundwater. Like kidneys, they remove waste from what flows through them",
      "Wetlands are shaped like kidneys",
    ],
    correctAnswer: 2,
    explanation: `The kidney metaphor captures the wetland's water-filtering function: as water moves slowly through wetland plants and sediments, nitrogen, phosphorus, heavy metals, and pathogens are absorbed, bound, or degraded — producing cleaner water that enters rivers or recharges groundwater.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Cause & Effect",
    question: `A region that normally receives reliable seasonal rain suddenly experiences three years of drought. List the LIKELY CASCADING EFFECTS.`,
    options: [
      "Only agriculture is affected",
      "Droughts have minimal long-term effects",
      "Agriculture fails → food prices rise → food insecurity → economic stress → vegetation dies → soil exposed → increased erosion → rivers run lower → freshwater shortages → health problems from water stress. Drought cascades through all environmental and human systems",
      "Only rivers are affected",
    ],
    correctAnswer: 2,
    explanation: `Drought impacts cascade across interconnected systems: agriculture → food security → economy; vegetation loss → soil erosion → river systems; freshwater shortage → public health. Understanding these cascades is essential to climate resilience planning.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Data Interpretation",
    question: `In a chemistry experiment, a student collects the gas produced when hydrochloric acid is added to marble chips (calcium carbonate) and measures volume over time. The reaction slows and eventually stops. WHY?`,
    options: [
      "The flask is too small",
      "The acid gets cold",
      "The marble chips (calcium carbonate) are the limiting reactant and are eventually consumed — when one reactant runs out, the reaction stops",
      "The student turned off the heat",
    ],
    correctAnswer: 2,
    explanation: `Reaction rates and limiting reactants: the reaction continues as long as both reactants are present. When marble chips are fully dissolved (limiting reactant exhausted), no more CO2 is produced. The rate also slows as the reactant concentration decreases.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Applying Geology",
    question: `A geologist finds alternating layers of dark basalt and lighter sedimentary rock on the ocean floor, with the basalt layers becoming OLDER further from a central ridge. This evidence supports:`,
    options: [
      "A stationary ocean floor",
      "Ocean floors being made only of sediment",
      "Sea-floor spreading — new ocean floor is created at mid-ocean ridges as magma wells up; older rock moves outward as spreading continues, creating the age pattern the geologist observed",
      "Random deposition of basalt",
    ],
    correctAnswer: 2,
    explanation: `Sea-floor spreading evidence: new basalt is continuously formed at mid-ocean ridges (where plates separate); it is dated by magnetic reversals preserved in the rock and found to be progressively older away from the ridge — direct evidence of plate tectonics.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student investigates whether fertiliser affects plant height. She grows 10 plants with fertiliser and 10 without. After 4 weeks: fertiliser group average = 25 cm; no fertiliser = 16 cm. She concludes fertiliser causes taller plants. Is this conclusion VALID?`,
    options: [
      "No — you need 1,000 plants",
      "No — you need 100 plants in each group",
      "The conclusion is reasonably supported: same conditions except fertiliser (fair test), multiple plants per group (reduces individual variation), and a clear difference (25 vs 16 cm, approximately 56% taller). The conclusion is valid given this experimental design",
      "The conclusion is invalid because plants vary",
    ],
    correctAnswer: 2,
    explanation: `Valid experimental conclusions require: fair test (one variable changed), sufficient sample size (10 per group is reasonable), and meaningful difference. This experiment meets these criteria — the conclusion that fertiliser increased growth is supported by the data.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Evaluating Health Technology",
    question: `MRI SCANS are preferred over X-RAYS for imaging soft tissue (like brain tumours) because:`,
    options: [
      "MRI is always faster than X-ray",
      "X-rays are too expensive",
      "MRI uses magnetic fields and radio waves (no ionising radiation) and produces detailed images of soft tissue with high contrast — X-rays use ionising radiation and show bones clearly but soft tissue poorly",
      "MRI is available everywhere X-rays are",
    ],
    correctAnswer: 2,
    explanation: `MRI vs X-ray: X-rays are absorbed differentially by dense tissue (bone shows well; soft tissue is invisible). MRI uses nuclear magnetic resonance — it detects differences in water content and tissue types, producing excellent soft-tissue contrast with no ionising radiation risk.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Applying Environmental Science",
    question: `A community group tests water quality from three sources: tap water pH=7.2, nearby river pH=6.1, and groundwater from a flooded mine pH=3.5. Which source is SAFEST for drinking?`,
    options: [
      "The groundwater — it has been underground",
      "The river — natural water is best",
      "The tap water — pH 7.2 is within the safe range (6.5-8.5) for drinking. The river (6.1) is moderately acidic; the mine water (3.5) is dangerously acidic and likely contaminated with heavy metals from mineral dissolution",
      "All sources are equally safe",
    ],
    correctAnswer: 0,
    explanation: `pH 7.2 is within the WHO safe range for drinking water (6.5-8.5). River water at pH 6.1 may indicate mild acid rain or organic acids — borderline but concerning. Mine water at pH 3.5 is very acidic — acid mine drainage contains dissolved heavy metals (iron, arsenic, lead) and is toxic.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student tests whether caffeine affects reaction time. She tests 5 students before and after drinking coffee, recording the time to click a button when a light flashes. Her results show faster reaction times after coffee. What LIMITATION does her study have?`,
    options: [
      "5 students is too many",
      "The light was too bright",
      "The sample size (5) is small — results may not be representative; there is no control group (students not drinking coffee); the students know they drank coffee (expectation effect may improve performance independent of caffeine",
      "Her equipment was incorrect",
    ],
    correctAnswer: 2,
    explanation: `Study limitations: small sample (5 students — large random variation is likely); no control group (no way to know if improvement would have occurred without coffee); lack of blinding (students knowing they drank coffee could improve performance through expectation alone — the placebo effect).`
  },
  {
    id: 35,
    type: "technology",
    skill: "Applying Technology",
    question: `ARTIFICIAL INTELLIGENCE is now used to DIAGNOSE MEDICAL CONDITIONS from images (X-rays, scans). What is a POTENTIAL CONCERN with this application?`,
    options: [
      "AI diagnoses are always wrong",
      "There are no concerns with AI diagnosis",
      "AI may miss unusual cases it wasn't trained on; algorithmic biases may affect accuracy across different patient populations; accountability is unclear when AI makes an error; and over-reliance may reduce clinical skill in doctors",
      "AI is always better than humans",
    ],
    correctAnswer: 2,
    explanation: `AI diagnostic concerns are real: training data determines performance (if underrepresented groups are in training data, accuracy varies by population); unusual presentations may not match patterns; when AI errs, accountability is unclear; and clinical deskilling (over-reliance) is a genuine risk.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Applying Environmental Technology",
    question: `Jamaica is developing more WIND FARMS to generate electricity. Which location assessment factors are MOST important?`,
    options: [
      "Wind farms should be built near schools",
      "Wind farms should be built underground",
      "Average wind speed and consistency (higher = more power), environmental impact assessment (bird migration routes, noise, visual impact), grid connectivity, and land tenure/community consent — multiple factors must be assessed simultaneously",
      "Only the cost of the turbines matters",
    ],
    correctAnswer: 2,
    explanation: `Wind farm siting is a multi-criteria problem: wind resource is the primary technical factor; environmental impact (birds, bats, noise, landscape) must be assessed; grid connection determines transmission costs; community and landowner engagement is essential for social licence. All must be satisfied.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Applying Health Science",
    question: `ANTIBIOTIC RESISTANCE is one of the greatest global health threats. Which action MOST DIRECTLY contributes to resistance?`,
    options: [
      "Taking the full course of antibiotics as prescribed",
      "Using antibiotics only when prescribed by a doctor",
      "Stopping antibiotic treatment early when you feel better — surviving bacteria are those most resistant to the antibiotic; stopping early leaves these to multiply and develop full resistance",
      "Washing hands frequently",
    ],
    correctAnswer: 2,
    explanation: `Early termination of antibiotic courses is a key driver of resistance: when you feel better, most susceptible bacteria are dead, but a small number of more resistant bacteria remain. Stopping treatment allows these to survive and reproduce, creating a more resistant population in your body and potentially spreading resistant strains to others.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Applying Data Analysis",
    question: `In a scientific study, the control group shows a 30% improvement in symptoms. The treatment group shows a 50% improvement. A newspaper reports the treatment as '50% effective.' Why is this report misleading?`,
    options: [
      "50% is an accurate description of effectiveness",
      "Newspapers always report science accurately",
      "The TRUE effect of the treatment is only 20% (50% − 30%) — the 30% improvement in the control group is the placebo/natural improvement. Reporting only the treatment group's improvement ignores what would have happened without treatment",
      "Control groups are irrelevant",
    ],
    correctAnswer: 2,
    explanation: `Without subtracting placebo/control group improvement, the treatment's ACTUAL benefit is overstated. The treatment provides 20% additional improvement above what would occur naturally or through placebo effect — a significant difference from the headline '50% effective.'`
  },
  {
    id: 39,
    type: "technology",
    skill: "Evaluating Technology",
    question: `GENETIC MODIFICATION of crops is controversial. Which argument FOR GM crops is scientifically STRONGEST?`,
    options: [
      "GM crops look more attractive",
      "GM companies always benefit communities",
      "Specific genetic modifications can provide concrete benefits: drought-resistant varieties reduce water use; pest-resistant varieties reduce pesticide use; nutritionally enhanced varieties (like Golden Rice with Vitamin A) address deficiency diseases — specific modifications with documented benefits",
      "GM crops always outperform conventional crops",
    ],
    correctAnswer: 2,
    explanation: `The pro-GM scientific case is most compelling when specific, targeted modifications address specific problems with documented evidence: drought resistance reduces water consumption; pest resistance reduces pesticide environmental impact; vitamin fortification addresses measurable nutritional deficits. The key is evaluating specific modifications on their evidence, not GM technology in general.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student wants to test whether MUSIC TEMPO affects heart rate. Design the key elements of a FAIR TEST.`,
    options: [
      "Play random music and measure random things",
      "Only use one type of music",
      "Independent variable: music tempo (slow vs fast). Dependent variable: heart rate (beats per minute). Controls: same students tested for each, same listening volume, same time of day, same physical activity levels before testing. Multiple trials per student for reliability",
      "Only measure heart rate once",
    ],
    correctAnswer: 2,
    explanation: `Fair test design: identify the one variable to change (IV: tempo), what to measure (DV: heart rate), and what to keep constant (controls: all other factors). Multiple trials increase reliability. This design allows the conclusion to isolate tempo as the cause of any heart rate change.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "applying biology concepts, cause & effect in ecosystems, interpreting life processes" },
  { type: "physical" as const,   label: "Physical Science",         note: "applying physics and chemistry, interpreting data, problem-solving with forces and energy" },
  { type: "earth" as const,      label: "Earth Science",            note: "explaining earth processes, environmental cause & effect, interpreting weather and climate data" },
  { type: "technology" as const, label: "Science & Technology",     note: "applying scientific method, evaluating technology, health reasoning, environmental problem-solving" },
]

export default function G5ScMod2MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMod2Questions : g5ScMod2Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Moderate 2",
        difficulty: "Moderate",
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
            <CardTitle className="text-2xl text-purple-800">Science Moderate 2</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Moderate Level</p>
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
            <div className="rounded-lg border border-purple-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Moderate Level Focus</h3>
              <p className="text-slate-700">This test requires applying scientific concepts — explaining cause and effect, interpreting data and observations, reasoning about processes, and connecting ideas across topics.</p>
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
              <p className="text-slate-600">Science Moderate 2</p>
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
            <div><h1 className="text-lg font-bold">Science Moderate 2</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
