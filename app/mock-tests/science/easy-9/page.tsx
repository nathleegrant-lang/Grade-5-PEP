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

const g5ScEasy9Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `During PHOTOSYNTHESIS, plants release which gas as a byproduct?`,
    options: [
      "Carbon dioxide",
      "Nitrogen",
      "Water vapour",
      "Oxygen",
    ],
    correctAnswer: 3,
    explanation: `Photosynthesis produces oxygen as a byproduct when water molecules are split. This is the source of the oxygen in Earth's atmosphere that living organisms breathe.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Chains",
    question: `An animal that ONLY eats other animals is called a:`,
    options: [
      "Herbivore",
      "Omnivore",
      "Carnivore",
      "Producer",
    ],
    correctAnswer: 2,
    explanation: `Carnivores eat only animal matter. Examples include lions, eagles, sharks, and wolves — they obtain energy by consuming other animals.`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `Which of the following is an example of a VERTEBRATE animal?`,
    options: [
      "Earthworm",
      "Butterfly",
      "Snail",
      "Parrot",
    ],
    correctAnswer: 3,
    explanation: `Vertebrates have a backbone (spinal column). Parrots are birds — vertebrates. Earthworms, butterflies, and snails are all invertebrates (no backbone).`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `ARTERIES carry blood that is:`,
    options: [
      "Used, oxygen-depleted blood back to the heart",
      "Only blood to the lungs",
      "Oxygen-rich blood AWAY from the heart to the body's tissues",
      "Blood with no oxygen at all",
    ],
    correctAnswer: 2,
    explanation: `Arteries (except the pulmonary artery) carry oxygenated blood away from the heart to the body. Veins (except pulmonary veins) return deoxygenated blood back to the heart.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A hummingbird has a LONG, THIN BEAK adapted for:`,
    options: [
      "Cracking hard seeds",
      "Catching insects in flight",
      "Reaching nectar deep inside tubular flowers",
      "Filtering water",
    ],
    correctAnswer: 2,
    explanation: `Hummingbirds' long, slender beaks and long tongues are perfectly shaped for probing tubular flowers to reach the nectar within — a co-evolution between flower and bird.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `The role of the SUN in a food chain is to:`,
    options: [
      "Eat the producers",
      "Be the final consumer",
      "Provide the energy that producers capture through photosynthesis, powering the entire food chain",
      "Decompose dead organisms",
    ],
    correctAnswer: 2,
    explanation: `All energy in a food chain originates from the sun. Producers capture this solar energy through photosynthesis, and it passes (with losses) up the food chain to consumers.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `Which of the following organisms undergoes COMPLETE metamorphosis?`,
    options: [
      "Grasshopper",
      "Cockroach",
      "Dragonfly nymph",
      "Mosquito",
    ],
    correctAnswer: 3,
    explanation: `Mosquitoes undergo complete metamorphosis: egg → larva (wriggler, aquatic) → pupa (tumbler) → adult. All four stages are present. Grasshoppers and cockroaches undergo incomplete metamorphosis.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `The process by which a plant's stem grows TOWARDS light is called:`,
    options: [
      "Geotropism",
      "Phototropism",
      "Hydrotropism",
      "Thigmotropism",
    ],
    correctAnswer: 1,
    explanation: `Phototropism is growth in response to light. Plant stems grow towards the light source (positive phototropism) — maximising light exposure for photosynthesis.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `How are PLANTS different from FUNGI?`,
    options: [
      "Plants are smaller",
      "Plants cannot reproduce",
      "Plants make their own food through photosynthesis; fungi cannot make food and must absorb nutrients from organic matter",
      "Fungi are green and plants are not",
    ],
    correctAnswer: 2,
    explanation: `The fundamental difference is nutrition: plants are autotrophs (make their own food using sunlight); fungi are heterotrophs that absorb nutrients by breaking down organic matter — they are entirely different kingdoms.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The function of BLOOD in the circulatory system is to:`,
    options: [
      "Produce oxygen",
      "Digest food",
      "Transport oxygen, nutrients, hormones, and waste products throughout the body",
      "Control temperature only",
    ],
    correctAnswer: 2,
    explanation: `Blood is the body's transport medium — red blood cells carry oxygen; plasma carries dissolved nutrients, hormones, CO2, and waste products; white blood cells provide immunity.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `When WATER EVAPORATES from a puddle, it becomes:`,
    options: [
      "Ice",
      "A solid",
      "Water vapour (a gas) — liquid water molecules gain enough energy to escape into the air",
      "A different substance",
    ],
    correctAnswer: 2,
    explanation: `Evaporation is the change of liquid water to water vapour (gas). Individual water molecules at the surface gain enough kinetic energy to break free and enter the air.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `BOILING and EVAPORATION are both processes that convert liquid to gas. What is the KEY DIFFERENCE?`,
    options: [
      "There is no difference",
      "Boiling is slower than evaporation",
      "Boiling occurs throughout the liquid at the boiling point (100°C for water); evaporation occurs only at the surface at any temperature",
      "Evaporation only happens in laboratories",
    ],
    correctAnswer: 2,
    explanation: `Both convert liquid to gas, but: evaporation is a surface process at any temperature (slow); boiling is a bulk process (bubbles form throughout) that occurs specifically at the boiling point.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A car accelerates when the engine force is GREATER than friction and air resistance. According to Newton's Second Law, the car will:`,
    options: [
      "Move at constant speed",
      "Slow down",
      "Accelerate in the direction of the net force",
      "Stop immediately",
    ],
    correctAnswer: 2,
    explanation: `Newton's Second Law: net (unbalanced) force produces acceleration in the direction of that net force. If engine force > resistive forces, the net force is forward and the car accelerates.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `The LAW OF CONSERVATION OF ENERGY states that:`,
    options: [
      "Energy is destroyed when it is used",
      "Energy can be created in power stations",
      "Energy cannot be created or destroyed — it can only be converted from one form to another",
      "Some energy is permanently lost each time it is used",
    ],
    correctAnswer: 2,
    explanation: `Conservation of energy: total energy in a closed system is constant. Energy transforms between forms (kinetic, potential, thermal, electrical, etc.) but the total amount never changes.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `OHM'S LAW states the relationship between voltage (V), current (I), and resistance (R) as:`,
    options: [
      "V = I + R",
      "V = I - R",
      "V = I × R",
      "V = I ÷ R",
    ],
    correctAnswer: 2,
    explanation: `Ohm's Law: Voltage = Current × Resistance (V = IR). This fundamental law allows us to calculate any one of the three electrical quantities if we know the other two.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `A CONVEX LENS causes light rays to:`,
    options: [
      "Diverge (spread out)",
      "Travel in straight lines",
      "Converge (come together at a focal point)",
      "Reflect backwards",
    ],
    correctAnswer: 2,
    explanation: `A convex (converging) lens is thicker in the middle and bends light rays inward, causing them to converge at the focal point. Magnifying glasses, camera lenses, and the eye's lens are convex.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `The FREQUENCY of a sound wave is measured in:`,
    options: [
      "Metres per second",
      "Decibels",
      "Hertz (Hz) — the number of complete vibrations per second",
      "Newtons",
    ],
    correctAnswer: 2,
    explanation: `Frequency (Hz) measures how many complete wave cycles occur per second. High frequency = high pitch; low frequency = low pitch. Humans hear sounds from about 20 Hz to 20,000 Hz.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `Magnets are used in which of the following everyday devices?`,
    options: [
      "Plastic bags",
      "Wooden furniture",
      "Electric motors, speakers, and hard disk drives",
      "Glass windows",
    ],
    correctAnswer: 2,
    explanation: `Magnets are essential in electric motors (converting electrical to mechanical energy), loudspeakers (converting electrical to sound), and hard drives (storing data magnetically).`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `An object will remain at REST or continue moving at CONSTANT VELOCITY unless acted upon by a NET (unbalanced) force. This is:`,
    options: [
      "Newton's Second Law",
      "Newton's Third Law",
      "Newton's First Law (the Law of Inertia)",
      "Einstein's Law of Relativity",
    ],
    correctAnswer: 2,
    explanation: `Newton's First Law of Motion (Inertia): objects resist changes in their state of motion. Only an unbalanced net force can change an object's state — from rest to moving, or changing speed/direction.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A FIXED PULLEY changes the:`,
    options: [
      "Magnitude of force needed",
      "Mass of the load",
      "Direction of force — allowing you to pull down to lift a load up — but does not provide mechanical advantage",
      "Weight of the load",
    ],
    correctAnswer: 2,
    explanation: `A single fixed pulley only redirects force (you pull down, the load goes up) without reducing the force required. A movable pulley or block-and-tackle provides actual mechanical advantage.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `Which weather FRONT brings heavy rain and storms?`,
    options: [
      "A warm front only",
      "An anticyclone",
      "A cold front — cold dense air pushes under warm moist air, forcing it rapidly upward, creating clouds and heavy rainfall",
      "A stationary front only",
    ],
    correctAnswer: 2,
    explanation: `Cold fronts bring rapid, often heavy, weather — cold air pushes forcefully under warm air, lifting it rapidly. This creates tall cumulonimbus clouds associated with thunderstorms and heavy rain.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `A COMET is best described as:`,
    options: [
      "A large rocky planet",
      "A moon of Jupiter",
      "A mixture of ice, rock, and dust that orbits the Sun, developing a glowing tail as it warms near the Sun",
      "A black hole in the Solar System",
    ],
    correctAnswer: 2,
    explanation: `Comets are icy bodies that orbit the Sun in elongated elliptical orbits. When they approach the Sun, solar radiation vaporises their ice, creating a bright coma and a tail that always points away from the Sun.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `GRANITE is a coarse-grained IGNEOUS rock that formed:`,
    options: [
      "On the ocean floor",
      "At Earth's surface from lava",
      "Deep underground from slowly cooling magma — slow cooling allows large mineral crystals to form",
      "From compressed sediment",
    ],
    correctAnswer: 2,
    explanation: `Granite is intrusive igneous rock — it forms when magma cools slowly deep in the crust. The slow cooling allows large visible crystals to develop. Basalt (extrusive) forms from fast-cooling lava with tiny crystals.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Soil",
    question: `Which type of soil holds water the LONGEST?`,
    options: [
      "Sandy soil",
      "Gravel",
      "Clay soil — tiny particles with small pores trap water and drain slowly",
      "Loam soil",
    ],
    correctAnswer: 2,
    explanation: `Clay has the finest particles of any mineral soil — their tiny size creates small pores that hold water by capillary forces. Clay drains slowly, staying wet long after rain. (However, it can also become waterlogged and starve roots of oxygen.)`
  },
  {
    id: 25,
    type: "earth",
    skill: "Water Cycle",
    question: `The WATER TABLE is:`,
    options: [
      "A kitchen surface near water",
      "A table-shaped rock formation",
      "The level below the ground surface at which the soil and rock are saturated (fully soaked) with groundwater",
      "The height of ocean tides",
    ],
    correctAnswer: 2,
    explanation: `The water table is the upper surface of the zone of saturation — below this level, all pores in rock and soil are filled with water. Wells are drilled to reach below the water table to access groundwater.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `Jamaica's BAUXITE is a:`,
    options: [
      "Renewable resource",
      "Type of soil",
      "Non-renewable mineral resource — once mined, it cannot be replaced",
      "Renewable agricultural product",
    ],
    correctAnswer: 2,
    explanation: `Bauxite is a mineral (aluminium ore) that took millions of years to form. Once extracted and processed into aluminium, the bauxite deposit is gone. It is a finite, non-renewable mineral resource.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `A FAULT is:`,
    options: [
      "A mistake in geological surveying",
      "A type of igneous rock",
      "A fracture in Earth's crust along which movement occurs — causing earthquakes when stress is suddenly released",
      "A type of volcanic landform",
    ],
    correctAnswer: 2,
    explanation: `A geological fault is a planar crack in Earth's crust along which two blocks of rock can move relative to each other. When stress accumulated on a fault is suddenly released, an earthquake occurs.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The GRAVITATIONAL PULL of the Moon is weaker than Earth's because:`,
    options: [
      "The Moon is farther away",
      "The Moon is colder",
      "The Moon has less mass than Earth — gravitational attraction depends on mass",
      "The Moon orbits Earth",
    ],
    correctAnswer: 2,
    explanation: `Gravitational pull depends on mass. The Moon's mass is about 1/81st of Earth's, so its surface gravity is about 1/6th of Earth's. An astronaut weighing 600 N on Earth weighs only 100 N on the Moon.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `The OZONE LAYER is being damaged primarily by:`,
    options: [
      "Natural rainfall",
      "Oxygen in the atmosphere",
      "Chlorofluorocarbons (CFCs) — chemicals formerly used in refrigerators and aerosols that break down ozone molecules in the stratosphere",
      "Volcanic ash",
    ],
    correctAnswer: 2,
    explanation: `CFCs release chlorine atoms in the stratosphere that catalytically destroy ozone molecules (O3 → O2). International agreements (Montreal Protocol, 1987) successfully reduced CFC use, allowing the ozone layer to slowly recover.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `A STORM SURGE is:`,
    options: [
      "A sudden increase in wind speed",
      "A temporary rise in sea level produced by a hurricane's low pressure and onshore winds pushing water onto the coast — often more deadly than wind",
      "A type of river flood",
      "A submarine earthquake",
    ],
    correctAnswer: 1,
    explanation: `Storm surge is the abnormal rise of coastal water levels due to hurricane effects: the low-pressure centre allows water to rise, and onshore winds pile up water against the coastline. It can be metres above normal sea level.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `What does 'REPRODUCIBILITY' mean in science?`,
    options: [
      "An experiment that produced a famous result",
      "An experiment that can only be done once",
      "The ability of independent scientists to replicate an experiment and obtain the same (or equivalent) results — a key indicator of reliable scientific findings",
      "An experiment that proves a theory",
    ],
    correctAnswer: 2,
    explanation: `Reproducibility is the ability of independent researchers working in different settings to replicate the findings of an original study. Reproducible findings are more credible; non-reproducible results may indicate errors or contextual factors.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `TELEMEDICINE uses technology to:`,
    options: [
      "Replace all doctors",
      "Only provide entertainment",
      "Deliver healthcare consultations, diagnosis, and monitoring remotely via video, phone, or apps — expanding access to medical care in rural and underserved areas",
      "Only operate in hospitals",
    ],
    correctAnswer: 2,
    explanation: `Telemedicine allows patients to consult doctors remotely using digital communication — particularly valuable for rural communities in Jamaica where specialist services may be distant. The COVID-19 pandemic accelerated its adoption.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The NERVOUS SYSTEM controls body functions by:`,
    options: [
      "Chemical signals in the blood",
      "Physical activity",
      "Electrical and chemical signals transmitted through neurons — rapidly coordinating responses to stimuli, controlling voluntary movement, and regulating involuntary functions",
      "Movement of body fluids",
    ],
    correctAnswer: 2,
    explanation: `The nervous system uses electrochemical signals through a network of neurons: sensory neurons carry information to the brain/spinal cord; motor neurons carry instructions to muscles and organs; interneurons process information.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `COMPOSTING helps the environment by:`,
    options: [
      "Creating more waste",
      "Producing harmful gases",
      "Converting organic kitchen and garden waste into nutrient-rich compost — reducing landfill waste, cutting methane emissions from landfill, and improving soil quality",
      "Only benefiting large farms",
    ],
    correctAnswer: 2,
    explanation: `Composting converts organic waste (food scraps, garden waste) into valuable compost through decomposition. It reduces landfill (where organic matter produces methane, a potent greenhouse gas), and creates soil amendment that improves agriculture.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `Why do scientists present their research at CONFERENCES and publish in JOURNALS?`,
    options: [
      "To become famous",
      "For financial rewards only",
      "To share findings with the scientific community for critical review, replication, and building upon — advancing collective scientific knowledge",
      "To impress non-scientists",
    ],
    correctAnswer: 2,
    explanation: `Open publication and presentation are how science advances collectively. Other scientists can verify (replicate), challenge, extend, or apply published findings. Science is a collaborative enterprise — findings shared openly benefit all.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `RENEWABLE ENERGY is preferable to fossil fuels for Jamaica MAINLY because:`,
    options: [
      "Renewable energy is always the most popular",
      "Jamaica has abundant fossil fuels",
      "Renewable energy sources (solar, wind) are locally available, do not produce greenhouse gases, and reduce Jamaica's expensive oil import dependence — improving energy security and environmental outcomes",
      "Renewable energy is always cheaper",
    ],
    correctAnswer: 2,
    explanation: `Jamaica imports nearly all its oil at high cost. Renewables reduce this import bill, improve energy security (domestic generation), reduce greenhouse gas emissions, and align with international climate commitments — making them preferable on economic and environmental grounds.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `MENTAL HEALTH is important because:`,
    options: [
      "It is separate from physical health and doesn't matter as much",
      "Mental illness is rare and unimportant",
      "Mental and physical health are deeply connected — poor mental health affects physical health, work, relationships, and quality of life. Mental health conditions are common and highly treatable",
      "Mental health concerns are personal and not a public health issue",
    ],
    correctAnswer: 2,
    explanation: `Mental health is inseparable from physical health — depression and anxiety increase risk of physical illness; chronic physical illness increases mental health risk. Mental health conditions affect approximately 1 in 4 people globally and are leading causes of disability.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `SUSTAINABLE DEVELOPMENT means:`,
    options: [
      "Economic growth at any environmental cost",
      "Protecting the environment without any economic development",
      "Development that meets present needs without compromising the ability of future generations to meet their own needs — balancing economic, social, and environmental goals",
      "Development funded only by renewable energy",
    ],
    correctAnswer: 2,
    explanation: `The Brundtland Commission (1987) defined sustainable development as meeting present needs without compromising future generations' ability to meet theirs. It requires simultaneously advancing economic development, social equity, and environmental protection.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `A scientist collects DATA that contradicts their THEORY. The CORRECT response is:`,
    options: [
      "Destroy the data",
      "Ignore it — theories cannot be wrong",
      "Investigate carefully — check for errors first, and if data is sound, consider whether the theory needs revision. All theories are provisional and must be responsive to evidence",
      "Publish a refutation of the data",
    ],
    correctAnswer: 2,
    explanation: `Scientific theories must be responsive to evidence. If sound, repeated data contradicts a theory, the theory must be revised or replaced — no theory is beyond revision. This distinguishes science from dogma.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `SPACE TECHNOLOGY has benefited daily life through applications including:`,
    options: [
      "No practical benefits from space programmes",
      "Only benefits to astronauts",
      "Satellite communications (TV, internet, GPS), weather forecasting, materials innovations (memory foam, scratch-resistant lenses), and global navigation systems — all derived from space research",
      "Only military applications",
    ],
    correctAnswer: 2,
    explanation: `Space programme research has produced many 'spinoff' technologies used daily: GPS (developed for navigation satellites), satellite weather and communication systems, memory foam (developed for NASA crash protection), water filtration, and many others.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy9MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy9Questions : g5ScEasy9Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 9</CardTitle>
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
              <p className="text-slate-600">Science Easy 9</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 9</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
