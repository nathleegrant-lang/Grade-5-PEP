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

const g5ScEasy10Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `Which part of a plant produces SEEDS?`,
    options: [
      "Roots",
      "Leaves",
      "Stem",
      "Flower (ovary)",
    ],
    correctAnswer: 3,
    explanation: `Seeds develop inside the ovary of a flower after fertilisation. The ovary wall develops into the fruit, and the fertilised ovules become seeds.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Chains",
    question: `In the food chain: leaves → caterpillar → bird → cat, how many consumers are there?`,
    options: [
      "One",
      "Two",
      "Three",
      "Four",
    ],
    correctAnswer: 2,
    explanation: `Consumers are organisms that eat other organisms. Caterpillar (eats leaves), bird (eats caterpillar), and cat (eats bird) — three consumers. The leaves are the producer.`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `A JELLYFISH is classified as an invertebrate because:`,
    options: [
      "It lives in the sea",
      "It has no shell",
      "It has no backbone — it has no rigid internal skeletal structure",
      "It is transparent",
    ],
    correctAnswer: 2,
    explanation: `Invertebrates are animals without a backbone. Jellyfish have no hard skeletal structures at all — they are soft-bodied marine invertebrates.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `Which organ produces BILE to help digest fats?`,
    options: [
      "Stomach",
      "Pancreas",
      "Liver",
      "Kidney",
    ],
    correctAnswer: 2,
    explanation: `The liver produces bile — a green fluid stored in the gall bladder and released into the small intestine. Bile emulsifies fats, breaking them into smaller droplets for easier digestion.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A porcupine's SHARP QUILLS are an adaptation used for:`,
    options: [
      "Building nests",
      "Finding food",
      "Defence — deterring predators from attacking",
      "Attracting mates",
    ],
    correctAnswer: 2,
    explanation: `Porcupine quills are modified hairs — sharp, barbed defensive structures that lodge painfully in the skin of any predator that tries to bite. They are a powerful deterrent.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `Which of the following describes an example of COMPETITION in an ecosystem?`,
    options: [
      "A bee feeding on a flower",
      "A lion hunting a zebra",
      "Two plants competing for the same patch of sunlight and water",
      "A decomposer breaking down a dead tree",
    ],
    correctAnswer: 2,
    explanation: `Competition occurs when two or more organisms seek the same limited resource. Two plants growing close together competing for light and water is a classic example.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `In which stage of a butterfly's life cycle is the insect enclosed in a CHRYSALIS?`,
    options: [
      "Egg",
      "Larva",
      "Pupa",
      "Adult",
    ],
    correctAnswer: 2,
    explanation: `During the pupal stage, the butterfly larva encloses itself in a chrysalis — a protective casing inside which the dramatic transformation (metamorphosis) from caterpillar to butterfly occurs.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `ROOT HAIRS increase the plant's ability to absorb water and minerals by:`,
    options: [
      "Making roots grow deeper",
      "Changing the colour of roots",
      "Greatly increasing the surface area of the root in contact with the soil",
      "Making roots stronger",
    ],
    correctAnswer: 2,
    explanation: `Root hairs are tiny extensions of root cells that dramatically increase the total surface area in contact with soil water — a key adaptation for efficient absorption.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `Which of the following correctly groups living things from BROADEST to MOST SPECIFIC?`,
    options: [
      "Species, genus, family, order, class, phylum, kingdom",
      "Kingdom, phylum, class, order, family, genus, species",
      "Species, family, kingdom, class, phylum",
      "Genus, species, kingdom, phylum, class",
    ],
    correctAnswer: 1,
    explanation: `The hierarchy of biological classification from broadest to narrowest is: Kingdom → Phylum → Class → Order → Family → Genus → Species. (Mnemonic: King Philip Came Over For Good Soup)`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The function of WHITE BLOOD CELLS is to:`,
    options: [
      "Carry oxygen around the body",
      "Help blood to clot",
      "Fight infection by destroying pathogens (bacteria, viruses)",
      "Transport carbon dioxide",
    ],
    correctAnswer: 2,
    explanation: `White blood cells (leucocytes) are the immune system's soldiers — they identify and destroy pathogens, produce antibodies, and coordinate immune responses to protect the body from infection.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `Which state of matter has particles that are CLOSEST together?`,
    options: [
      "Gas",
      "Liquid",
      "Solid",
      "Plasma",
    ],
    correctAnswer: 2,
    explanation: `Solid particles are closest together — densely packed in regular arrangements. Liquid particles are close but can move; gas particles are far apart with little interaction.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `The process of a GAS changing DIRECTLY to a SOLID without passing through the liquid state is called:`,
    options: [
      "Condensation",
      "Freezing",
      "Deposition (or desublimation) — the reverse of sublimation",
      "Crystallisation",
    ],
    correctAnswer: 2,
    explanation: `Deposition is the reverse of sublimation: a gas converts directly to a solid. Frost forming on cold surfaces (water vapour → ice crystals) is the most familiar example.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A balanced (equal on all sides) pressure of water acts on a submerged object. The NET upward force is called:`,
    options: [
      "Gravity",
      "Friction",
      "Buoyancy (upthrust) — the net upward pressure force of the fluid on the submerged object",
      "Tension",
    ],
    correctAnswer: 2,
    explanation: `Buoyancy arises because fluid pressure increases with depth — the upward pressure on the bottom of a submerged object is greater than the downward pressure on the top, producing a net upward force.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `Which energy transformation occurs in a SOLAR PANEL?`,
    options: [
      "Chemical energy to electrical",
      "Kinetic energy to thermal",
      "Light (radiant) energy to electrical energy",
      "Nuclear energy to light",
    ],
    correctAnswer: 2,
    explanation: `Photovoltaic solar panels convert light energy directly into electrical energy using the photovoltaic effect — when photons hit semiconductor materials, they release electrons that form a current.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `The RESISTANCE in a circuit opposes the flow of electric current. Resistance is measured in:`,
    options: [
      "Volts",
      "Amperes",
      "Watts",
      "Ohms (Ω)",
    ],
    correctAnswer: 3,
    explanation: `Resistance (measured in Ohms, Ω) is the opposition to electric current flow in a conductor. Higher resistance = less current for the same voltage (Ohm's Law: V = IR).`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `Transparent, translucent, and opaque are terms that describe how materials interact with:`,
    options: [
      "Sound",
      "Electricity",
      "Light — transparent allows all light through (glass); translucent allows some (frosted glass); opaque allows none (wood)",
      "Heat",
    ],
    correctAnswer: 2,
    explanation: `These terms classify materials by their interaction with light. Understanding transparency, translucency, and opacity helps explain shadow formation, visibility, and light management.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `The DECIBEL (dB) scale measures:`,
    options: [
      "The frequency (pitch) of sound",
      "The speed of sound",
      "The intensity (loudness) of sound",
      "The wavelength of sound",
    ],
    correctAnswer: 2,
    explanation: `Decibels measure sound intensity (loudness). Normal conversation ≈ 60 dB; a jet engine ≈ 140 dB. Sounds above 85 dB can damage hearing over prolonged exposure.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `Magnetic field lines near a bar magnet run from:`,
    options: [
      "South pole to north pole (outside the magnet)",
      "North pole to south pole (outside the magnet)",
      "Randomly in all directions",
      "Only through the magnet internally",
    ],
    correctAnswer: 1,
    explanation: `By convention, magnetic field lines emerge from the NORTH pole and curve around to re-enter the SOUTH pole (outside the magnet). They show the direction a north pole would move.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `If you drop a feather and a hammer in a VACUUM (no air), they:`,
    options: [
      "The hammer falls faster",
      "The feather falls faster",
      "Both fall at the same rate — without air resistance, gravity accelerates all objects equally regardless of mass",
      "Neither falls in a vacuum",
    ],
    correctAnswer: 2,
    explanation: `In a vacuum, there is no air resistance. Gravity acts on all objects equally (same gravitational acceleration). Without air resistance, a feather and hammer fall identically — as famously demonstrated on the Moon.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `The six types of simple machines are: lever, wheel and axle, pulley, inclined plane, wedge, and:`,
    options: [
      "Scissors",
      "Motor",
      "Screw",
      "Gear",
    ],
    correctAnswer: 2,
    explanation: `The six classical simple machines are: lever, wheel and axle, pulley, inclined plane, wedge, and screw. All complex machines are combinations of these six fundamental types.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `Which cloud type is associated with THUNDERSTORMS?`,
    options: [
      "Cumulus",
      "Stratus",
      "Cirrus",
      "Cumulonimbus",
    ],
    correctAnswer: 3,
    explanation: `Cumulonimbus ('thunder cloud') is the tall, anvil-shaped cloud associated with thunderstorms, heavy rain, lightning, and sometimes hail. It can extend from near the ground to the tropopause.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `Which planet has the MOST PROMINENT RING SYSTEM visible from Earth?`,
    options: [
      "Jupiter",
      "Uranus",
      "Saturn",
      "Neptune",
    ],
    correctAnswer: 2,
    explanation: `Saturn's rings are the most spectacular and easily observed from Earth — they are composed of ice and rock particles ranging from tiny to house-sized, extending hundreds of thousands of km from the planet.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `The CARBON CYCLE involves rocks because:`,
    options: [
      "Only living things are in the carbon cycle",
      "Rocks have no carbon",
      "Carbon is stored in carbonate rocks (like limestone) for millions of years — volcanic activity releases it; weathering absorbs it — connecting the rock cycle to the carbon cycle",
      "Carbon only exists in the atmosphere",
    ],
    correctAnswer: 2,
    explanation: `Limestone (calcium carbonate) is a major long-term carbon store. Volcanic activity releases CO2 from carbonate rocks; weathering of silicate rocks absorbs CO2. This geological carbon cycle operates over millions of years.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Soil",
    question: `The RATE OF SOIL FORMATION is important because:`,
    options: [
      "Soil forms very quickly and is easily replaced",
      "Soil has unlimited supply",
      "Soil forms extremely slowly (hundreds to thousands of years per centimetre) — making it a practically non-renewable resource that must be protected from erosion",
      "Soil is not important for farming",
    ],
    correctAnswer: 2,
    explanation: `Soil formation is extremely slow — 1 cm of topsoil can take 100-1,000 years to form. Once eroded or degraded, soil cannot practically be replaced. This makes soil conservation critical for long-term food security.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Water Cycle",
    question: `Describe the COMPLETE WATER CYCLE in the correct order:`,
    options: [
      "Precipitation → Condensation → Evaporation → Collection",
      "Evaporation → Transpiration → Condensation → Precipitation → Collection/Runoff → Infiltration → Evaporation again",
      "Collection → Condensation → Evaporation → Precipitation",
      "Condensation → Evaporation → Precipitation → Transpiration",
    ],
    correctAnswer: 1,
    explanation: `The water cycle: solar energy evaporates water (and plants transpire) → water vapour rises and cools → condensation forms clouds → precipitation falls → water collects in oceans/rivers or infiltrates soil → cycle repeats.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `DEFORESTATION contributes to climate change because:`,
    options: [
      "Forests cool the air with shade",
      "Cut trees produce more oxygen when dead",
      "Trees absorb and store CO2 — removing forests releases stored carbon AND eliminates future carbon absorption, increasing atmospheric greenhouse gases",
      "Forests are not connected to climate",
    ],
    correctAnswer: 2,
    explanation: `Forests are major carbon sinks — absorbing CO2 through photosynthesis and storing it in wood and soil. Deforestation releases this stored carbon (especially when trees are burned) and removes future absorption capacity.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `The process of CONVECTION in the Earth's MANTLE causes:`,
    options: [
      "Rainfall patterns",
      "Ocean currents only",
      "The movement of tectonic plates — heat from Earth's core drives convection currents in the semi-solid mantle, which drag the overlying tectonic plates",
      "Volcanic eruptions only",
    ],
    correctAnswer: 2,
    explanation: `Convection in the mantle: heat from Earth's core warms the lower mantle; hot rock rises, cools, and sinks in huge convection cells. These currents exert drag on the tectonic plates above, driving plate movement and all associated geological activity.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The NEAR SIDE of the Moon always faces Earth because:`,
    options: [
      "The Moon does not rotate",
      "The Moon rotates on its axis once in exactly the same time it takes to orbit Earth — so the same side always faces us (tidal locking)",
      "Earth's gravity holds the Moon still",
      "The Sun lights only one side of the Moon",
    ],
    correctAnswer: 1,
    explanation: `Tidal locking: Earth's gravity over billions of years slowed the Moon's rotation until its rotation period exactly matched its orbital period. The result is that the same hemisphere always faces Earth — we never see the far side from Earth.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `GLOBAL WARMING is primarily caused by:`,
    options: [
      "Increased solar output",
      "The hole in the ozone layer",
      "Increased greenhouse gas emissions (especially CO2) from human activities — burning fossil fuels, deforestation — causing the atmosphere to trap more heat",
      "Natural climate variation only",
    ],
    correctAnswer: 2,
    explanation: `The scientific consensus: global warming since the industrial revolution is primarily caused by human emissions of greenhouse gases, especially CO2 from fossil fuel combustion. These increase the greenhouse effect, raising global average temperatures.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `Which Jamaican agency is responsible for monitoring weather and issuing hurricane warnings?`,
    options: [
      "The Jamaica Constabulary Force",
      "The Jamaica National Heritage Trust",
      "The Meteorological Service of Jamaica (Met Service)",
      "The Ministry of Health",
    ],
    correctAnswer: 2,
    explanation: `The Meteorological Service of Jamaica (Met Service) monitors atmospheric conditions, forecasts weather, and issues hurricane watches and warnings — a critical public safety service during hurricane season.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `What is the difference between OBSERVATION and INFERENCE?`,
    options: [
      "They are identical processes",
      "Observation is less valuable than inference",
      "Observation is directly perceiving (seeing, measuring) what is happening; inference is interpreting or explaining what observations mean — drawing conclusions based on evidence",
      "Inference requires laboratory equipment",
    ],
    correctAnswer: 2,
    explanation: `Observations are direct: 'The sky is dark and wind is increasing.' Inferences interpret observations: 'A storm is approaching.' Good science distinguishes clearly between what is directly observed and what is concluded from those observations.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `ARTIFICIAL INTELLIGENCE is transforming medicine by:`,
    options: [
      "Replacing all doctors",
      "Only reducing hospital costs",
      "Improving diagnosis accuracy (pattern recognition in scans), drug discovery, personalised treatment, and patient monitoring — augmenting rather than replacing human medical expertise",
      "Only working in wealthy hospitals",
    ],
    correctAnswer: 2,
    explanation: `AI in medicine: algorithms can diagnose from medical images (X-rays, MRI) with accuracy matching or exceeding specialists; AI accelerates drug discovery; personalised medicine algorithms suggest tailored treatments; wearables provide continuous monitoring.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `VACCINATION PROGRAMMES help communities achieve which important outcome?`,
    options: [
      "Individual protection only",
      "Reduced vaccine costs",
      "Herd immunity — protecting even those who cannot be vaccinated by ensuring the pathogen cannot find enough susceptible hosts to spread",
      "Complete elimination of all disease",
    ],
    correctAnswer: 2,
    explanation: `Community vaccination programmes aim for sufficient coverage (typically 70-95% depending on the disease's transmissibility) to achieve herd immunity — breaking disease transmission chains and protecting vulnerable unvaccinated individuals.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `OCEAN ACIDIFICATION occurs when:`,
    options: [
      "Oceans become less salty",
      "Marine animals produce excess acid",
      "The ocean absorbs excess CO2 from the atmosphere, forming carbonic acid — lowering the pH of seawater and threatening marine organisms that depend on carbonate for shells and skeletons",
      "Volcanic eruptions heat the ocean",
    ],
    correctAnswer: 2,
    explanation: `As atmospheric CO2 increases, oceans absorb approximately 30% of it. Dissolved CO2 reacts with water to form carbonic acid, lowering ocean pH. This 'ocean acidification' weakens and dissolves shells and skeletons of corals, molluscs, and many marine organisms.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `Why is it important for scientists to COMMUNICATE their findings?`,
    options: [
      "It is only required by universities",
      "Science should be kept secret",
      "Sharing findings allows other scientists to verify, replicate, challenge, and build upon them — advancing collective knowledge and enabling applications of scientific discoveries",
      "Only published findings count as science",
    ],
    correctAnswer: 2,
    explanation: `Scientific communication is essential to progress: peer review catches errors; replication confirms or challenges findings; building on others' work accelerates discovery; public communication enables informed policy and public understanding.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `3D PRINTING (additive manufacturing) technology has applications in:`,
    options: [
      "Only making plastic toys",
      "Only in jewellery making",
      "Medicine (custom prosthetics, implants, drug delivery devices), construction, food production, aerospace, and education — making customised manufacturing accessible",
      "Only in wealthy countries",
    ],
    correctAnswer: 2,
    explanation: `3D printing has transformed manufacturing across sectors: medical (custom prosthetics, patient-specific implants), construction (concrete printing), aerospace (complex parts), food (personalised nutrition), and education (physical models of concepts).`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `DIABETES TYPE 1 differs from TYPE 2 in that:`,
    options: [
      "Type 1 is less serious",
      "Type 2 requires insulin injections",
      "Type 1 is an autoimmune condition (the body destroys its own insulin-producing cells) requiring insulin therapy; Type 2 is primarily a lifestyle-related condition involving insulin resistance often manageable through diet and exercise",
      "They are the same disease",
    ],
    correctAnswer: 2,
    explanation: `Type 1 is autoimmune — the immune system destroys pancreatic beta cells; without any insulin production, daily insulin therapy is essential. Type 2 involves insulin resistance and relative insufficiency — often manageable with lifestyle, and sometimes oral medication, before insulin is needed.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `INTEGRATED PEST MANAGEMENT (IPM) is a farming approach that:`,
    options: [
      "Only uses chemical pesticides",
      "Never uses any pest control",
      "Combines multiple strategies (biological control, crop rotation, resistant varieties, physical barriers, and minimal targeted pesticide use) to manage pests with minimum environmental impact",
      "Only uses organic methods",
    ],
    correctAnswer: 2,
    explanation: `IPM minimises pesticide use by combining multiple tactics: introducing natural predators (biological control), rotating crops to break pest cycles, selecting resistant varieties, and using pesticides only when necessary and in targeted ways.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `A student proposes: 'I think plants grow faster when I talk to them because they like company.' What makes this a POOR scientific hypothesis?`,
    options: [
      "The student is not a scientist",
      "Plants cannot grow",
      "The hypothesis is not falsifiable — 'liking company' is not measurable or testable; a scientific hypothesis must be testable through observable, measurable evidence",
      "The student did not use proper scientific language",
    ],
    correctAnswer: 2,
    explanation: `Good hypotheses must be falsifiable and testable. 'Plants like company' is not measurable — it cannot be tested or disproved. A testable version: 'Plants exposed to sound vibrations at 65 dB will grow faster than those in silence' — specific, measurable, testable.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `RENEWABLE ENERGY STORAGE is a technology challenge because:`,
    options: [
      "Renewable energy is unlimited and needs no storage",
      "Batteries are simple and already perfect",
      "Solar and wind energy are intermittent (sun doesn't always shine, wind doesn't always blow) — developing affordable, high-capacity storage (batteries, pumped hydro, hydrogen) is essential for reliable renewable electricity",
      "Renewable energy doesn't need to be stored",
    ],
    correctAnswer: 2,
    explanation: `Intermittency is renewable energy's main challenge: solar and wind produce electricity variably. Grid stability requires matching supply to demand continuously — hence the critical need for storage technologies (batteries, pumped hydro, compressed air, green hydrogen) that store energy when production exceeds demand.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy10MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy10Questions : g5ScEasy10Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 10",
        difficulty: "Easy",
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 10</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Easy Level</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
              <p className="text-slate-700">This Grade 5 Science test covers Living Things, Physical Science, Earth Science, and Science & Technology — all aligned to the NSC curriculum and PEP assessment standards.</p>
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
              <p className="text-slate-600">Science Easy 10</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 10</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
