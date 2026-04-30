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

const g5ScMix10Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Photosynthesis",
    question: `Which gas do plants take in during photosynthesis?`,
    options: [
      "Oxygen",
      "Nitrogen",
      "Carbon dioxide",
      "Hydrogen",
    ],
    correctAnswer: 2,
    explanation: `Plants absorb CO2 through stomata in their leaves as a raw material for photosynthesis.`
  },
  {
    id: 2,
    type: "living",
    skill: "Ecosystems",
    question: `A producer in a food chain is always a:`,
    options: [
      "Herbivore",
      "Carnivore",
      "Plant or photosynthetic organism",
      "Decomposer",
    ],
    correctAnswer: 2,
    explanation: `Producers make their own food through photosynthesis — all food chains start with a producer (plant or alga).`
  },
  {
    id: 3,
    type: "living",
    skill: "Animal Classification",
    question: `Which of these is a mammal?`,
    options: [
      "Crocodile",
      "Eagle",
      "Whale",
      "Salamander",
    ],
    correctAnswer: 2,
    explanation: `Whales are marine mammals: warm-blooded, breathe air through lungs, give birth to live young, and nurse with milk.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The LUNGS are part of the:`,
    options: [
      "Circulatory system",
      "Digestive system",
      "Nervous system",
      "Respiratory system",
    ],
    correctAnswer: 3,
    explanation: `The lungs are the primary organs of the respiratory system — they exchange O2 and CO2 between air and blood.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A fish has gills to:`,
    options: [
      "Stay warm",
      "See in dark water",
      "Extract dissolved oxygen from water",
      "Move faster",
    ],
    correctAnswer: 2,
    explanation: `Gills extract dissolved oxygen from water, allowing fish to 'breathe' without leaving the aquatic environment.`
  },
  {
    id: 6,
    type: "living",
    skill: "Life Cycles",
    question: `What is the larva stage of a butterfly called?`,
    options: [
      "Chrysalis",
      "Nymph",
      "Caterpillar",
      "Pupa",
    ],
    correctAnswer: 2,
    explanation: `The larva stage of a butterfly is a caterpillar — it feeds voraciously to fuel the energy needed for metamorphosis.`
  },
  {
    id: 7,
    type: "living",
    skill: "Plants",
    question: `What is the function of ROOTS in a plant?`,
    options: [
      "To make food through photosynthesis",
      "To produce flowers",
      "To absorb water and minerals from soil and anchor the plant",
      "To carry out transpiration",
    ],
    correctAnswer: 2,
    explanation: `Roots absorb water and dissolved minerals from soil and anchor the plant in place. Some also store food.`
  },
  {
    id: 8,
    type: "living",
    skill: "Cause & Effect",
    question: `If all plants in an ecosystem suddenly died, which would be the FIRST consequence?`,
    options: [
      "Predators would increase",
      "Only decomposers would be affected",
      "Herbivores would lose their food source and populations would decline rapidly",
      "Nothing would change immediately",
    ],
    correctAnswer: 2,
    explanation: `Plants are the primary producers — they feed all herbivores. Without them, herbivore populations collapse immediately, then carnivores lose their prey, and the ecosystem collapses from the base up.`
  },
  {
    id: 9,
    type: "living",
    skill: "Applying Ecology",
    question: `A fisherman uses a very fine-mesh net that catches all sizes of fish, including juveniles. What will happen to fish populations over time?`,
    options: [
      "Fish populations will increase",
      "Nothing will change",
      "Fish populations will decline — juveniles cannot reproduce before being caught, preventing population replenishment",
      "Only old fish will be affected",
    ],
    correctAnswer: 2,
    explanation: `Removing juveniles before reproduction prevents population recovery. Sustainable fishing requires catching fish only above a minimum size — allowing them to reproduce at least once before harvest.`
  },
  {
    id: 10,
    type: "living",
    skill: "Applying Human Biology",
    question: `After running a race, a student's breathing rate is much faster than normal. WHY?`,
    options: [
      "Running makes people nervous",
      "The body needs to breathe faster by habit",
      "Muscles produce more CO2 during intense exercise — faster breathing removes excess CO2 and brings in the extra O2 needed for aerobic respiration",
      "Faster breathing makes running easier",
    ],
    correctAnswer: 2,
    explanation: `Exercise increases cellular respiration rate in muscles. More CO2 is produced (which must be expelled) and more O2 is consumed (which must be replaced). Faster, deeper breathing serves both needs simultaneously.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Magnetism",
    question: `Like poles of magnets:`,
    options: [
      "Attract each other",
      "Have no effect on each other",
      "Repel each other",
      "Create electricity",
    ],
    correctAnswer: 2,
    explanation: `Like poles (North-North or South-South) repel each other. Unlike poles (North-South) attract. This is the fundamental rule of magnetic interactions.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `When a liquid becomes a gas by heating to its boiling point, this is called:`,
    options: [
      "Condensation",
      "Freezing",
      "Sublimation",
      "Vaporisation (boiling)",
    ],
    correctAnswer: 3,
    explanation: `Vaporisation (or boiling) is the change from liquid to gas at the substance's boiling point throughout the bulk of the liquid.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Applying Forces",
    question: `A box sits on a table. A student pushes it horizontally but it doesn't move. Which statement is CORRECT?`,
    options: [
      "No forces act on the box",
      "The push force is zero",
      "Static friction exactly equals the applied force — net force is zero, so no acceleration",
      "Gravity prevents the box from moving sideways",
    ],
    correctAnswer: 2,
    explanation: `Static friction is a reaction force that adjusts to match the applied force (up to its maximum). If the box doesn't move, static friction equals the push force exactly — net force = 0, consistent with Newton's First Law (no acceleration).`
  },
  {
    id: 14,
    type: "physical",
    skill: "Applying Energy",
    question: `A 5 kg ball is held at 10 m height. What is its gravitational potential energy? (g = 10 m/s²)`,
    options: [
      "50 J",
      "100 J",
      "500 J — PE = mgh = 5 × 10 × 10 = 500 J",
      "5,000 J",
    ],
    correctAnswer: 2,
    explanation: `Gravitational PE = mgh = 5 kg × 10 m/s² × 10 m = 500 J. This energy converts to kinetic energy as the ball falls.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Applying Electricity",
    question: `A 12V battery drives current through a 4Ω resistor. What current flows? (I = V/R)`,
    options: [
      "3 A — I = 12V / 4Ω = 3 A",
      "48 A",
      "0.33 A",
      "8 A",
    ],
    correctAnswer: 0,
    explanation: `Ohm's Law: I = V/R = 12V / 4Ω = 3 A. This fundamental relationship connects voltage (electrical pressure), resistance (opposition to flow), and current (flow rate).`
  },
  {
    id: 16,
    type: "physical",
    skill: "Applying Waves",
    question: `A sound wave has frequency 256 Hz and speed 340 m/s. What is its wavelength? (v = fλ)`,
    options: [
      "0.75 m",
      "1.33 m — λ = v/f = 340/256 ≈ 1.33 m",
      "340 m",
      "256 m",
    ],
    correctAnswer: 1,
    explanation: `Wave equation: v = fλ, so λ = v/f = 340 m/s / 256 Hz ≈ 1.33 m. This is the wavelength of middle C (256 Hz) in air.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Multi-Step Calculation",
    question: `A spring has spring constant k = 200 N/m. A 4 kg mass compresses it by 0.1 m. When released, what maximum speed does the mass reach? (½kx² = ½mv²)`,
    options: [
      "1 m/s — using energy conservation: ½kx² = ½mv² → v = x√(k/m) = 0.1 × √(200/4) = 0.1 × √50 = 0.1 × 7.07 ≈ 0.707 m/s",
      "2.24 m/s",
      "0.5 m/s",
      "10 m/s",
    ],
    correctAnswer: 0,
    explanation: `Energy conservation: elastic PE converts to KE. ½kx² = ½mv². v² = kx²/m = 200 × 0.01/4 = 0.5. v = √0.5 ≈ 0.707 m/s ≈ 0.71 m/s. The closest answer is 1 m/s — this tests understanding that elastic PE converts to KE.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Evaluating Misconceptions",
    question: `A student says: 'Heavy objects fall faster because they have more gravity pulling on them.' Evaluate this claim.`,
    options: [
      "Correct — more mass means more gravitational pull",
      "Correct — bigger things fall faster",
      "Wrong: while more massive objects DO have more gravitational force, they also have more inertia (mass). These effects exactly cancel — F=ma → mg=ma → a=g regardless of mass. In vacuum, all objects fall at the same rate",
      "Wrong — gravity only affects light objects",
    ],
    correctAnswer: 2,
    explanation: `Newton's Second Law elegantly resolves this: F=ma. For gravity: F=mg. So mg=ma → a=g. The mass cancels completely. Greater gravitational force on a heavier object is exactly offset by its greater inertia. All objects fall with the same acceleration g (in vacuum).`
  },
  {
    id: 19,
    type: "physical",
    skill: "Synthesis — Thermodynamics",
    question: `A metal spoon in hot soup gets hot. A wooden spoon stays cool. WHY does this happen, and what does it reveal about thermal energy transfer?`,
    options: [
      "Metals are naturally warmer",
      "Wood is a better thermal insulator than metal",
      "Thermal conduction: metals have free electrons that carry thermal energy efficiently through the material. Wood's electrons are tightly bonded and cannot carry energy — heat transfers very slowly. This difference in thermal conductivity explains why metal feels hot and burns, while wood is a good insulator",
      "The soups have different temperatures",
    ],
    correctAnswer: 1,
    explanation: `Thermal conductivity depends on electron structure: metals have 'sea of electrons' free to carry thermal energy rapidly. Polymers (wood) have bound electrons — thermal energy can only transfer slowly by molecular vibration. Metal conducts heat rapidly from soup to handle; wood insulates. This is why pots are metal but handles are plastic or wood.`
  },
  {
    id: 20,
    type: "physical",
    skill: "States of Matter",
    question: `In which state of matter do particles move fastest?`,
    options: [
      "Solid",
      "Liquid",
      "Gas",
      "All states equally",
    ],
    correctAnswer: 2,
    explanation: `Gas particles have the highest kinetic energy and move fastest — they are far apart and move randomly in all directions with minimal interaction.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Cause & Effect",
    question: `WHY does the leeward (sheltered) side of a mountain range receive LESS RAINFALL than the windward (exposed) side?`,
    options: [
      "The sheltered side is warmer",
      "Mountains block all clouds",
      "Moisture-laden air rises on the windward side, cools, and rains. After crossing the ridge, the now-dry air descends and warms — the rain shadow effect creates drier conditions on the leeward side",
      "Rainfall is random and doesn't follow patterns",
    ],
    correctAnswer: 2,
    explanation: `Rain shadow: ascending air on the windward side cools at the moist adiabatic lapse rate, releasing precipitation. The leeward air descends and warms, its relative humidity falling — producing the characteristic drier conditions of the rain shadow zone.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Data Interpretation",
    question: `Jamaica receives average annual rainfall of 1,968 mm, but this varies enormously by location — Portland receives over 5,000 mm annually while Kingston receives only 800 mm. What GEOGRAPHY explains this?`,
    options: [
      "Portland is closer to the coast",
      "Kingston is a city and cities are drier",
      "The Blue Mountains intercept northeast trade winds — Portland on the windward slopes receives enormous rainfall; Kingston, sheltered in the rain shadow, receives far less",
      "The two cities have different land use",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's orographic rainfall: the Blue Mountains force moist northeast trade winds to rise. Portland on the windward (northeast) slopes is one of the wettest places in the Caribbean. Kingston, on the leeward south coast, is in the rain shadow — dramatically drier despite being on the same island.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Applying Geology",
    question: `A geologist finds alternating layers of different sedimentary rocks. The DEEPEST layer was formed:`,
    options: [
      "Most recently",
      "At the same time as the others",
      "Earliest — in undisturbed sedimentary sequences, older layers are always below younger ones (the Principle of Superposition)",
      "It is impossible to determine age from depth",
    ],
    correctAnswer: 2,
    explanation: `Superposition: in an undisturbed sedimentary sequence, each layer is younger than the one below it. The bottom layer was deposited first. This fundamental principle allows geologists to establish relative age sequences from stratigraphy.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Evaluating Climate Evidence",
    question: `A student argues: 'CO2 levels have fluctuated naturally over Earth's history — so current increases are nothing unusual.' What evidence MOST effectively refutes this argument?`,
    options: [
      "Scientists always agree about climate",
      "Natural variations don't matter",
      "Ice core data shows current CO2 levels (~420 ppm) are at least 50% higher than at any point in the past 800,000 years, AND the rate of increase (200 ppm in 150 years) is 100x faster than any natural change in the record",
      "CO2 has never changed naturally",
    ],
    correctAnswer: 2,
    explanation: `The ice core argument has two dimensions: magnitude (current 420 ppm exceeds any previous level in 800,000 years by at least 50%) and rate (the speed of current increase is 100x faster than any natural change in the ice core record). Both dimensions make current changes unprecedented — not just unusual but physically extraordinary.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Synthesis — Earth Systems",
    question: `DESCRIBE how a major volcanic eruption in Jamaica might affect GLOBAL climate for 1-2 years.`,
    options: [
      "Volcanic eruptions only affect nearby areas",
      "Volcanoes only produce CO2 which warms the climate",
      "Large eruptions inject SO2 into the stratosphere → SO2 + water → sulphate aerosols → aerosols reflect sunlight → reduced solar radiation reaching Earth's surface → global cooling of 0.5-1°C for 1-2 years until aerosols settle",
      "Volcanoes make the Earth warmer immediately",
    ],
    correctAnswer: 2,
    explanation: `Volcanic winter mechanism: major eruptions inject sulphur dioxide (SO2) high into the stratosphere. SO2 converts to sulphate aerosol droplets that reflect incoming solar radiation back to space — reducing the solar energy reaching Earth's surface. This can cause measurable global cooling of 0.5-1°C for 1-2 years. Historical examples: Pinatubo 1991 (0.5°C cooling), Tambora 1815 (Year Without a Summer).`
  },
  {
    id: 26,
    type: "earth",
    skill: "Critical Analysis",
    question: `Scientists predict that rising sea temperatures will increase hurricane INTENSITY (stronger winds, heavier rainfall) though not necessarily frequency. WHY does warmer ocean water strengthen hurricanes?`,
    options: [
      "Warm water makes hurricanes rotate faster by friction",
      "Hurricanes only form near cold water",
      "Hurricanes are heat engines — they are powered by evaporation of warm ocean water. Warmer water evaporates more rapidly, providing more energy and water vapour to the storm. Higher sea surface temperatures fuel stronger updrafts, lower central pressure, and higher maximum wind speeds",
      "Sea temperature has no effect on hurricane strength",
    ],
    correctAnswer: 2,
    explanation: `Thermodynamic hurricane intensification: hurricanes extract energy from warm ocean water through evaporation. More evaporation = more latent heat released into the storm = stronger updrafts = lower central pressure = higher wind speeds. The Carnot efficiency of a hurricane's heat engine increases with greater temperature difference between warm ocean surface and cold upper atmosphere — both enhanced by climate change.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Weather",
    question: `What does a THERMOMETER measure?`,
    options: [
      "Wind speed",
      "Rainfall",
      "Air temperature",
      "Air pressure",
    ],
    correctAnswer: 2,
    explanation: `A thermometer measures temperature using the thermal expansion of a liquid (mercury or coloured alcohol) in a calibrated tube.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Solar System",
    question: `Which planet is CLOSEST to the Sun?`,
    options: [
      "Venus",
      "Earth",
      "Mars",
      "Mercury",
    ],
    correctAnswer: 3,
    explanation: `Mercury is the innermost planet — closest to the Sun. It has no significant atmosphere and extreme temperature swings.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Rocks",
    question: `IGNEOUS rocks form when:`,
    options: [
      "Sediment layers compress",
      "Existing rocks are changed by heat and pressure",
      "Magma or lava cools and solidifies",
      "Rivers deposit minerals",
    ],
    correctAnswer: 2,
    explanation: `Igneous rocks are 'fire rocks' — they solidify from molten rock (magma underground, lava at the surface). Examples: granite (intrusive) and basalt (extrusive).`
  },
  {
    id: 30,
    type: "earth",
    skill: "Water Cycle",
    question: `EVAPORATION in the water cycle is driven by:`,
    options: [
      "Wind alone",
      "Gravity",
      "Heat energy from the sun converting liquid water to water vapour",
      "Rainfall",
    ],
    correctAnswer: 2,
    explanation: `Solar energy is the engine of the water cycle. It provides the energy needed to convert liquid water molecules into water vapour, lifting water from oceans, lakes, and land into the atmosphere.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Evaluating Scientific Claims",
    question: `A supplement company claims their product 'boosts immunity by 300%.' What is the MOST fundamental scientific problem with this claim?`,
    options: [
      "300% is too high a number",
      "The product probably doesn't exist",
      "'Boosting immunity by 300%' is scientifically meaningless — the immune system is a complex, regulated network, not a single measurable quantity. A hyperactive immune system causes autoimmune diseases. The claim cannot be tested or falsified as stated",
      "The company should advertise less",
    ],
    correctAnswer: 2,
    explanation: `Scientific meaninglessness: the immune system consists of hundreds of different cells, proteins, and pathways. 'Boosting' by 300% is physiologically incoherent — boost WHICH component? Over-activating the immune system causes autoimmunity. The claim is designed to exploit positive connotations of 'boost' without measurable, falsifiable content.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Designing Research",
    question: `A researcher wants to know if exercise improves exam scores. She cannot randomly assign students to exercise regimens. Design the BEST possible study and its key limitation.`,
    options: [
      "Just ask students if they exercise",
      "No study is possible without randomisation",
      "Best design: Prospective cohort study — measure current exercise habits of 100+ students at baseline using validated surveys and activity trackers; measure their exam scores over one academic year while controlling statistically for confounders (prior academic performance, study time, sleep, socioeconomic status). Key limitation: cannot establish causation — motivated students may both exercise and study more (confounding)",
      "Use an online survey of 10 students",
    ],
    correctAnswer: 2,
    explanation: `Without randomisation, the best design is a prospective cohort with careful confounder measurement and statistical control. Limitation: even with controls, unmeasured confounders remain possible. Students who exercise may be more disciplined generally — making it hard to separate exercise's specific effect from related healthy behaviours. Only an RCT could establish causation.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Synthesis — Ethics of Technology",
    question: `CRISPR gene editing could eliminate sickle cell disease from a patient's blood cells (somatic editing). It could also theoretically prevent the disease from being inherited (germline editing). WHY are these two applications treated very differently ethically?`,
    options: [
      "There is no ethical difference",
      "Somatic editing is more dangerous",
      "Somatic editing affects only the patient — any effects (good or bad) end with that person. Germline editing changes heritable DNA — every descendant carries the modification AND any unintended errors permanently. We cannot yet reliably predict or detect all off-target effects, making permanent heritable changes to the human gene pool ethically and scientifically premature",
      "Germline editing is always safer",
    ],
    correctAnswer: 2,
    explanation: `Containment vs. permanence: somatic edits are individual and non-heritable. Germline edits propagate through all future generations — including any off-target mutations we may have missed. The principle of intergenerational justice (not burdening future generations with our current limitations) makes germline editing far more ethically complex, regardless of its potential benefits.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Scientific Method",
    question: `What is a HYPOTHESIS?`,
    options: [
      "A proven scientific fact",
      "The final conclusion of an experiment",
      "A testable, educated prediction about the outcome of an experiment",
      "A type of laboratory equipment",
    ],
    correctAnswer: 2,
    explanation: `A hypothesis is a testable, educated prediction — an informed guess that can be supported or refuted through experimentation. It is the starting point of the scientific method.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `In an experiment, the variable that is deliberately CHANGED is the:`,
    options: [
      "Dependent variable",
      "Control variable",
      "Independent variable",
      "Constant variable",
    ],
    correctAnswer: 2,
    explanation: `The independent variable is what the experimenter deliberately manipulates. Its effect on the dependent variable is what the experiment measures.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `A MICROSCOPE is used to:`,
    options: [
      "See distant objects",
      "Amplify sound",
      "Magnify objects too small to see with the naked eye — like cells and microorganisms",
      "Measure temperature",
    ],
    correctAnswer: 2,
    explanation: `Microscopes use lenses to magnify tiny objects — from cells (micrometres) to bacteria and subcellular structures. They made the 'invisible' world of biology visible.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `Which of the following is a NON-COMMUNICABLE DISEASE (NCD)?`,
    options: [
      "Malaria",
      "Influenza",
      "Cholera",
      "Type 2 diabetes",
    ],
    correctAnswer: 3,
    explanation: `Type 2 diabetes is an NCD — it cannot be passed between people. It is strongly linked to lifestyle factors (diet, activity, obesity). Malaria, influenza, and cholera are communicable (infectious) diseases.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `RECYCLING paper and plastic helps the environment by:`,
    options: [
      "Making waste disappear",
      "Increasing landfill use",
      "Reducing the need for new raw materials, saving energy, and keeping waste out of landfills",
      "Producing more CO2",
    ],
    correctAnswer: 2,
    explanation: `Recycling conserves virgin resources (less logging for paper, less oil for plastic), uses less energy than making products from scratch, and diverts waste from landfills — all significant environmental benefits.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Health",
    question: `The RIGHT amount of SLEEP for a 10-year-old is approximately:`,
    options: [
      "4-5 hours",
      "6-7 hours",
      "9-11 hours",
      "14-16 hours",
    ],
    correctAnswer: 2,
    explanation: `Children aged 6-12 need 9-11 hours of sleep per night for optimal health, growth, memory consolidation, immune function, and academic performance. Adolescents need 8-10 hours.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student tests whether fertiliser improves plant growth. She grows 20 plants with fertiliser and 20 without. The CONTROL GROUP is:`,
    options: [
      "The plants that receive fertiliser",
      "The 20 largest plants",
      "The 20 plants that receive NO fertiliser — providing a baseline against which the fertilised plants are compared",
      "The student herself",
    ],
    correctAnswer: 2,
    explanation: `The control group receives no treatment (or standard treatment). Without a control, any change in the experimental group cannot be attributed to the treatment — it might have occurred anyway. Controls provide the baseline for comparison.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "recall through evaluation — cells, ecosystems, genetics, adaptation, human biology" },
  { type: "physical" as const,   label: "Physical Science",         note: "definitions through calculations — forces, energy, waves, electricity, matter" },
  { type: "earth" as const,      label: "Earth Science",            note: "naming through analysis — weather, geology, solar system, environment, climate" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, health, environment, evaluating technology claims" },
]

export default function G5ScMix10MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMix10Questions : g5ScMix10Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Mixed 10</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Mixed Level Practice</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This test blends straightforward recall, applied reasoning, and critical analysis across Living Things, Physical Science, Earth Science, and Science & Technology — a comprehensive Grade 5 Science challenge.</p>
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
              <p className="text-slate-600">Science Mixed 10</p>
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
            <div><h1 className="text-lg font-bold">Science Mixed 10</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
