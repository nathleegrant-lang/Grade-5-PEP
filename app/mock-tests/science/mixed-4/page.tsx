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

const g5ScMix4Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Applying Genetics",
    question: `Two parents with brown eyes have a child with blue eyes. This demonstrates:`,
    options: [
      "A genetic mutation",
      "Brown eyes are recessive",
      "Each parent carried a recessive blue-eye allele — the child received the recessive allele from both parents, expressing the blue phenotype",
      "This is impossible",
    ],
    correctAnswer: 2,
    explanation: `Brown eyes (dominant) can mask a hidden recessive blue allele. When two carriers mate, 25% of children statistically receive the recessive allele from both parents and express the recessive trait (blue eyes).`
  },
  {
    id: 2,
    type: "living",
    skill: "Data Interpretation",
    question: `A student grows plants in three soil types. After 4 weeks: sand (8 cm), clay (5 cm), loam (15 cm). What does this tell us?`,
    options: [
      "All soils are equally good",
      "Sand is best for plants",
      "Loam supports the most growth, probably because it balances water retention, drainage, and nutrient availability — all factors limiting growth in the other soil types",
      "Clay is worst because of its colour",
    ],
    correctAnswer: 2,
    explanation: `Loam's balanced composition — sand for drainage, clay for water/nutrient retention, and humus for organic matter — makes it optimal for plant growth. Sandy soil drains too fast; clay becomes waterlogged and compacted.`
  },
  {
    id: 3,
    type: "living",
    skill: "Evaluating Evidence",
    question: `A study finds that students who sleep more score higher on tests. A critic says: 'Maybe high-achieving students happen to sleep more — not that sleep improves achievement.' This describes:`,
    options: [
      "An invalid concern",
      "A confounding variable concern — reverse causation or a third factor may explain the correlation without sleep CAUSING better performance",
      "Proof that sleep is unimportant",
      "A correct interpretation of the study",
    ],
    correctAnswer: 1,
    explanation: `This is a classic causal inference problem: correlation (sleep and performance are associated) does not prove causation. Reverse causation (good students sleep more) or a third factor (parental involvement improves both sleep habits and academic support) could explain the relationship without sleep being the cause.`
  },
  {
    id: 4,
    type: "living",
    skill: "Synthesis — Ecology",
    question: `Using the 10% energy transfer rule: if grass provides 100,000 kJ, how much energy is available to a hawk that eats rabbits (which eat grass)?`,
    options: [
      "10,000 kJ",
      "1,000 kJ",
      "100 kJ — grass→rabbit: 10,000 kJ (10%); rabbit→hawk: 1,000 kJ (10%)",
      "10 kJ",
    ],
    correctAnswer: 1,
    explanation: `Two transfers from grass: Grass (100,000) → Rabbit (10,000, at 10%) → Hawk (1,000, at 10%). The hawk receives 1,000 kJ — just 1% of the original grass energy. This explains why food chains are rarely longer than 4-5 links.`
  },
  {
    id: 5,
    type: "living",
    skill: "Critical Analysis",
    question: `Why does the existence of antibiotic-resistant bacteria PROVE that evolution by natural selection is occurring RIGHT NOW?`,
    options: [
      "It proves bacteria planned to become resistant",
      "Antibiotic resistance disproves natural selection",
      "Bacteria with random mutations that help them survive antibiotics survive and reproduce, passing on their resistance genes. Susceptible bacteria die. Resistant strains increase in frequency — this IS natural selection in real time, observable in a human lifetime",
      "Bacteria learned to resist antibiotics",
    ],
    correctAnswer: 2,
    explanation: `Antibiotic resistance is textbook natural selection operating in real time: random mutations exist (genetic variation); antibiotics create selective pressure (environmental pressure); resistant variants survive and reproduce (differential reproduction); resistance genes spread (inheritance). The entire mechanism of evolution is visible in years rather than millennia.`
  },
  {
    id: 6,
    type: "living",
    skill: "Cells",
    question: `What is the basic unit of all living things?`,
    options: [
      "Tissue",
      "Organ",
      "Cell",
      "Organism",
    ],
    correctAnswer: 2,
    explanation: `The cell is the fundamental building block of all life — the smallest unit capable of carrying out life functions.`
  },
  {
    id: 7,
    type: "living",
    skill: "Classification",
    question: `How many legs does an insect have?`,
    options: [
      "Four",
      "Six",
      "Eight",
      "Ten",
    ],
    correctAnswer: 1,
    explanation: `All insects have exactly six legs — one of their defining characteristics. Spiders (eight legs) are arachnids, not insects.`
  },
  {
    id: 8,
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
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 15,
    type: "physical",
    skill: "Forces",
    question: `What is the SI unit of FORCE?`,
    options: [
      "Kilogram",
      "Metre",
      "Newton",
      "Joule",
    ],
    correctAnswer: 2,
    explanation: `The Newton (N) is the SI unit of force, defined as the force needed to accelerate a 1 kg mass at 1 m/s².`
  },
  {
    id: 16,
    type: "physical",
    skill: "Electricity",
    question: `Which material is the BEST conductor of electricity?`,
    options: [
      "Wood",
      "Rubber",
      "Plastic",
      "Copper",
    ],
    correctAnswer: 3,
    explanation: `Copper is one of the best electrical conductors — its free electrons carry current efficiently. This is why electrical wiring is predominantly copper.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Energy",
    question: `Kinetic energy is the energy of:`,
    options: [
      "Position",
      "Chemical bonds",
      "Motion",
      "Heat storage",
    ],
    correctAnswer: 2,
    explanation: `Kinetic energy is energy associated with motion. Any moving object has kinetic energy — KE = ½mv².`
  },
  {
    id: 18,
    type: "physical",
    skill: "Light",
    question: `The bending of light when it passes from one medium to another is called:`,
    options: [
      "Reflection",
      "Diffraction",
      "Refraction",
      "Absorption",
    ],
    correctAnswer: 2,
    explanation: `Refraction occurs when light changes speed at the boundary between two transparent media, causing it to bend. This is why a straw appears bent in water.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Sound",
    question: `Sound cannot travel through:`,
    options: [
      "Steel",
      "Water",
      "A vacuum",
      "Air",
    ],
    correctAnswer: 2,
    explanation: `Sound is a mechanical wave requiring particles to vibrate. A vacuum has no particles — so sound cannot travel through it.`
  },
  {
    id: 20,
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
    id: 21,
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
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
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
    id: 26,
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
    id: 27,
    type: "earth",
    skill: "Natural Resources",
    question: `Which of the following is a RENEWABLE resource?`,
    options: [
      "Coal",
      "Petroleum",
      "Iron ore",
      "Sunlight",
    ],
    correctAnswer: 3,
    explanation: `Sunlight is renewed continuously by the sun — it is inexhaustible on human timescales. Coal, petroleum, and iron ore are non-renewable (formed over millions of years).`
  },
  {
    id: 28,
    type: "earth",
    skill: "Atmosphere",
    question: `The gas that makes up approximately 78% of Earth's atmosphere is:`,
    options: [
      "Oxygen",
      "Carbon dioxide",
      "Nitrogen",
      "Argon",
    ],
    correctAnswer: 2,
    explanation: `Nitrogen (N2) is the most abundant atmospheric gas at ~78%. Oxygen is ~21%. Despite its abundance, nitrogen is relatively chemically inert in the atmosphere.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Moon",
    question: `The Moon orbits Earth approximately every:`,
    options: [
      "24 hours",
      "7 days",
      "27-29 days",
      "365 days",
    ],
    correctAnswer: 2,
    explanation: `The Moon's orbital period is approximately 27.3 days (sidereal) — so close to one month that 'month' derives from 'moon.'`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `What is a HURRICANE?`,
    options: [
      "A small tropical rainstorm",
      "An earthquake at sea",
      "A large rotating tropical cyclone with winds exceeding 119 km/h, powered by warm ocean water",
      "A type of volcano",
    ],
    correctAnswer: 2,
    explanation: `Hurricanes (tropical cyclones) are massive rotating storms fed by warm ocean water. They produce destructive winds, heavy rainfall, and storm surges — the primary natural disaster threat to Jamaica.`
  },
  {
    id: 31,
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
    id: 32,
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
    id: 33,
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
    id: 34,
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
    id: 35,
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
    id: 36,
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
    id: 37,
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
    id: 38,
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
  },
  {
    id: 39,
    type: "technology",
    skill: "Applying Health Science",
    question: `Vaccines reduce disease in a community even for people who are NOT vaccinated. This is because:`,
    options: [
      "Vaccines spread through the air",
      "Unvaccinated people take medicine instead",
      "When enough people are immune (herd immunity threshold), the disease cannot find enough susceptible hosts to spread — protecting those who cannot be vaccinated",
      "Vaccinated people share their immunity directly",
    ],
    correctAnswer: 2,
    explanation: `Herd immunity: when a sufficient proportion of a population is immune, transmission chains break — the pathogen cannot efficiently spread. This indirectly protects unvaccinated individuals (infants, immunocompromised) who cannot be safely vaccinated.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Applying Environmental Science",
    question: `Jamaica has replaced traditional incandescent bulbs with LED bulbs in schools. If a school uses 100 bulbs for 10 hours per day, and incandescent bulbs use 60W while LEDs use 10W, how much energy is saved daily?`,
    options: [
      "5 kWh",
      "30 kWh",
      "50 kWh — Incandescent: 100 × 60W × 10h = 60,000 Wh = 60 kWh. LED: 100 × 10W × 10h = 10,000 Wh = 10 kWh. Saving = 60-10 = 50 kWh per day",
      "60 kWh",
    ],
    correctAnswer: 2,
    explanation: `Energy = Power × time × number of devices. Incandescent: 100 × 0.06 kW × 10h = 60 kWh. LED: 100 × 0.01 kW × 10h = 10 kWh. Daily saving = 50 kWh — 83% energy reduction. At scale, this translates to significant cost savings and CO2 reduction.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "recall through evaluation — cells, ecosystems, genetics, adaptation, human biology" },
  { type: "physical" as const,   label: "Physical Science",         note: "definitions through calculations — forces, energy, waves, electricity, matter" },
  { type: "earth" as const,      label: "Earth Science",            note: "naming through analysis — weather, geology, solar system, environment, climate" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, health, environment, evaluating technology claims" },
]

export default function G5ScMix4MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMix4Questions : g5ScMix4Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Mixed 4",
        difficulty: "Mixed",
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
            <CardTitle className="text-2xl text-purple-800">Science Mixed 4</CardTitle>
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
              <p className="text-slate-600">Science Mixed 4</p>
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
            <div><h1 className="text-lg font-bold">Science Mixed 4</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
