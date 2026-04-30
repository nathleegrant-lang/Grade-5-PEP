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

const g5ScEasy4Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `What is the main function of FLOWERS in a plant?`,
    options: [
      "To make food through photosynthesis",
      "To absorb water from the soil",
      "To reproduce — flowers contain the reproductive organs of a plant",
      "To store water and nutrients",
    ],
    correctAnswer: 2,
    explanation: `Flowers are the reproductive organs of flowering plants — they contain structures for producing pollen (male) and eggs (female), enabling seed production and reproduction.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Webs",
    question: `In a food web, energy flows FROM:`,
    options: [
      "Consumers to producers",
      "Predators to prey",
      "The sun through producers to consumers",
      "Decomposers to producers",
    ],
    correctAnswer: 2,
    explanation: `Energy enters ecosystems from the sun, is captured by producers (plants) through photosynthesis, and passes to consumers when they eat plants or other animals.`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `Which of these animals is a BIRD?`,
    options: [
      "Bat",
      "Butterfly",
      "Eagle",
      "Dolphin",
    ],
    correctAnswer: 2,
    explanation: `Birds are warm-blooded vertebrates with feathers, wings, and a beak. Eagles are birds. Bats are mammals, butterflies are insects, and dolphins are mammals.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The BRAIN is part of which body system?`,
    options: [
      "Circulatory system",
      "Digestive system",
      "Nervous system",
      "Respiratory system",
    ],
    correctAnswer: 2,
    explanation: `The brain is the central organ of the nervous system — it receives and processes information from the senses and coordinates the body's responses.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A chameleon can change colour. This adaptation is useful for:`,
    options: [
      "Producing food",
      "Keeping warm",
      "Camouflage — blending into surroundings to avoid predators or approach prey",
      "Growing quickly",
    ],
    correctAnswer: 2,
    explanation: `Chameleons change colour primarily for camouflage and communication. Blending with their background helps them avoid predators and ambush prey.`
  },
  {
    id: 6,
    type: "living",
    skill: "Life Cycles",
    question: `The stages of a butterfly's life cycle in the correct order are:`,
    options: [
      "Egg → adult → larva → pupa",
      "Egg → pupa → larva → adult",
      "Egg → larva (caterpillar) → pupa (chrysalis) → adult (butterfly)",
      "Larva → egg → pupa → adult",
    ],
    correctAnswer: 2,
    explanation: `Butterflies undergo complete metamorphosis: egg → larva (caterpillar) → pupa (chrysalis) → adult butterfly. This four-stage cycle is called holometabolism.`
  },
  {
    id: 7,
    type: "living",
    skill: "Ecosystems",
    question: `A FOOD WEB is more realistic than a food chain because:`,
    options: [
      "It is easier to draw",
      "It shows only one feeding relationship",
      "It shows the complex, interconnected feeding relationships between MANY species in an ecosystem",
      "It shows how plants make food",
    ],
    correctAnswer: 2,
    explanation: `Real ecosystems involve many species with multiple feeding relationships. A food web shows this complexity — most organisms eat and are eaten by several species, not just one.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `Water moves from roots to leaves through the stem in tubes called:`,
    options: [
      "Arteries",
      "Veins",
      "Stomata",
      "Xylem vessels",
    ],
    correctAnswer: 3,
    explanation: `Xylem vessels are tube-like structures in plant stems that transport water and dissolved minerals from roots up to leaves.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `Which organism is a FUNGUS?`,
    options: [
      "Seaweed",
      "Mushroom",
      "Moss",
      "Fern",
    ],
    correctAnswer: 1,
    explanation: `Mushrooms are fungi — they are not plants (they cannot make their own food) or animals. Fungi absorb nutrients from organic matter.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The skeleton provides which function for the human body?`,
    options: [
      "Produces blood cells, provides structure, and protects vital organs",
      "Only provides support",
      "Only protects organs",
      "Only enables movement",
    ],
    correctAnswer: 0,
    explanation: `The skeleton has multiple functions: structure/support, protection of vital organs (skull protects brain, ribs protect lungs/heart), blood cell production in bone marrow, and as a lever system for movement.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `In which state of matter do particles have the MOST energy and move fastest?`,
    options: [
      "Solid",
      "Liquid",
      "Gas",
      "Plasma",
    ],
    correctAnswer: 2,
    explanation: `Gas particles have the highest energy — they move rapidly and randomly in all directions. As a substance is heated, particles gain energy: solid melts to liquid, liquid evaporates to gas.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `What is EVAPORATION?`,
    options: [
      "Liquid turning to solid",
      "Gas turning to liquid",
      "Liquid turning to gas, usually at the surface of a liquid at temperatures below boiling point",
      "Solid turning directly to gas",
    ],
    correctAnswer: 2,
    explanation: `Evaporation is the slow change from liquid to gas at the liquid's surface, occurring at all temperatures (not just at boiling point). Puddles evaporate; sweat cools your skin by evaporation.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A force can be measured using a:`,
    options: [
      "Thermometer",
      "Ruler",
      "Force meter (Newton meter or spring balance)",
      "Beaker",
    ],
    correctAnswer: 2,
    explanation: `Forces are measured in Newtons (N) using a force meter (spring balance or Newton meter) — a spring stretches in proportion to the force applied.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `When you rub your hands together, FRICTION converts kinetic energy into:`,
    options: [
      "Light energy",
      "Electrical energy",
      "Heat (thermal) energy",
      "Sound energy only",
    ],
    correctAnswer: 2,
    explanation: `Friction between surfaces converts mechanical/kinetic energy into thermal energy (heat). Rubbing hands together, braking a bicycle, and striking a match all demonstrate this conversion.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `In a SERIES circuit, if one bulb breaks:`,
    options: [
      "Only that bulb goes out",
      "The other bulbs get brighter",
      "All bulbs in the circuit go out — there is only one path for current, so breaking it stops all current flow",
      "The battery works harder",
    ],
    correctAnswer: 2,
    explanation: `In a series circuit, all components share the same single current path. If one component fails (breaks the circuit), no current can flow through any component.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `The PRIMARY COLOURS of LIGHT are:`,
    options: [
      "Red, yellow, blue",
      "Red, green, blue",
      "Red, white, blue",
      "Orange, green, purple",
    ],
    correctAnswer: 1,
    explanation: `The primary colours of light are red, green, and blue (RGB). When mixed together equally, they produce white light. This is additive colour mixing (different from paint/pigment).`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `Why can sound NOT travel through outer space (a vacuum)?`,
    options: [
      "Space is too cold",
      "Sound travels only in light",
      "Sound requires particles to vibrate — in a vacuum there are no particles to carry the vibrations",
      "Space has too much gravity",
    ],
    correctAnswer: 2,
    explanation: `Sound is a mechanical wave requiring a physical medium (particles) to travel. In a vacuum, there are no molecules to vibrate, so sound cannot propagate. This is why space is silent.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `Which of the following is TRUE about magnetic poles?`,
    options: [
      "Like poles attract each other",
      "Opposite poles repel each other",
      "Like poles repel each other and opposite poles attract each other",
      "All magnets have only one pole",
    ],
    correctAnswer: 2,
    explanation: `The fundamental rule of magnetism: north poles repel other north poles; south poles repel south poles; north and south poles attract each other.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `The unit of FORCE in the International System (SI) is the:`,
    options: [
      "Kilogram",
      "Metre",
      "Newton",
      "Joule",
    ],
    correctAnswer: 2,
    explanation: `The Newton (N) is the SI unit of force, named after Sir Isaac Newton. 1 Newton is the force needed to accelerate a 1 kg mass at 1 m/s².`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A WHEEL AND AXLE is a simple machine found in:`,
    options: [
      "A knife",
      "A ramp",
      "A steering wheel of a car",
      "A pulley",
    ],
    correctAnswer: 2,
    explanation: `A wheel and axle consists of a large wheel attached to a smaller axle. Applying force to the wheel provides mechanical advantage at the axle — found in steering wheels, door handles, and taps.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `HUMIDITY measures:`,
    options: [
      "The speed of wind",
      "The amount of rainfall",
      "The amount of water vapour in the air",
      "The temperature of the air",
    ],
    correctAnswer: 2,
    explanation: `Humidity is the measure of water vapour content in the air. High humidity (like in tropical Jamaica) makes the air feel heavy and moist and affects comfort, weather, and evaporation rates.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `The EARTH takes how long to orbit the SUN?`,
    options: [
      "One day",
      "One month",
      "One year (approximately 365.25 days)",
      "Ten years",
    ],
    correctAnswer: 2,
    explanation: `Earth completes one orbit around the Sun in approximately 365.25 days — one year. The extra 0.25 days accumulate into a leap year every four years.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `METAMORPHIC rocks are formed when:`,
    options: [
      "Magma cools slowly underground",
      "Sediment layers are compressed",
      "Pre-existing rocks are changed by intense heat and pressure deep in the Earth's crust",
      "Rivers deposit mineral particles",
    ],
    correctAnswer: 2,
    explanation: `Metamorphic rocks form when existing rocks (igneous, sedimentary, or other metamorphic) are subjected to extreme heat and pressure deep in the crust, changing their mineral composition and texture.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Water Cycle",
    question: `TRANSPIRATION in the water cycle is when:`,
    options: [
      "Rivers overflow their banks",
      "Water evaporates from the ocean",
      "Plants release water vapour through their leaves into the atmosphere",
      "Clouds release rain",
    ],
    correctAnswer: 2,
    explanation: `Transpiration is the release of water vapour from plant leaves through stomata. Combined with evaporation, it is called evapotranspiration — a major source of atmospheric moisture, especially in forested areas.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Soil",
    question: `EROSION of soil is caused by:`,
    options: [
      "Too much fertiliser",
      "Good farming practices",
      "Wind and water wearing away and carrying off topsoil — especially when land is left bare",
      "Planting too many trees",
    ],
    correctAnswer: 2,
    explanation: `Soil erosion occurs when wind or water removes topsoil. It is accelerated by deforestation, poor agricultural practices, and leaving soil bare. Erosion destroys agricultural productivity and causes flooding.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `Which of the following is an example of a NON-RENEWABLE resource?`,
    options: [
      "Wind",
      "Sunlight",
      "Coal",
      "Water (from rivers)",
    ],
    correctAnswer: 2,
    explanation: `Coal is a fossil fuel — formed over millions of years from ancient vegetation. Once extracted and burned, it cannot be replaced on any practical timescale. It is non-renewable.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `Tectonic plates are:`,
    options: [
      "Mountains on the ocean floor",
      "Ocean currents",
      "Large sections of Earth's crust and upper mantle that move slowly over the surface, causing earthquakes, volcanoes, and mountain formation",
      "Layers of the atmosphere",
    ],
    correctAnswer: 2,
    explanation: `Tectonic plates are massive sections of Earth's lithosphere (crust + upper mantle). Their slow movement (centimetres per year) causes earthquakes, volcanoes, and the formation of mountain ranges.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The PERIOD of the Moon refers to:`,
    options: [
      "The Moon's temperature",
      "The Moon's distance from Earth",
      "The time it takes the Moon to complete one orbit around Earth (approximately 27-29 days)",
      "The Moon's size",
    ],
    correctAnswer: 2,
    explanation: `The Moon's orbital period is approximately 27.3 days (sidereal) — the time for one complete orbit around Earth. This is the basis of the calendar month.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `CARBON DIOXIDE (CO2) in the atmosphere is increasing primarily because of:`,
    options: [
      "Natural volcanic eruptions",
      "Increased rainfall",
      "The burning of fossil fuels (coal, oil, gas) and deforestation — human activities adding CO2 faster than natural processes can absorb it",
      "Increased photosynthesis",
    ],
    correctAnswer: 2,
    explanation: `Human activities — especially burning fossil fuels for energy and transport, and deforestation (which removes CO2-absorbing trees) — are driving the increase in atmospheric CO2 causing climate change.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `A TSUNAMI is typically caused by:`,
    options: [
      "Heavy rainfall at sea",
      "Strong winds over the ocean",
      "An underwater earthquake, landslide, or volcanic eruption that displaces large amounts of ocean water",
      "Hurricanes at sea",
    ],
    correctAnswer: 2,
    explanation: `Tsunamis are generated when underwater geological events (earthquakes, landslides, volcanic eruptions) suddenly displace huge volumes of water, creating waves that can travel across oceans at speed.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `A scientist conducts the SAME EXPERIMENT multiple times. This practice is important because:`,
    options: [
      "It wastes resources",
      "It shows the scientist is uncertain",
      "Repeating experiments increases reliability — consistent results give greater confidence that findings are accurate rather than due to chance or error",
      "Experiments should only be done once",
    ],
    correctAnswer: 2,
    explanation: `Replication is fundamental to scientific reliability. A result that occurs consistently across repeated trials is much more trustworthy than a single trial — it demonstrates the finding is robust and not an artefact.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `ANTIBIOTICS are medicines that:`,
    options: [
      "Kill all microorganisms including beneficial ones",
      "Treat viral infections",
      "Kill or inhibit the growth of bacteria — used to treat bacterial infections. They have NO effect on viruses",
      "Cure all diseases",
    ],
    correctAnswer: 2,
    explanation: `Antibiotics specifically target bacterial cell structures (cell walls, protein synthesis, DNA). They are ineffective against viruses, which have completely different structures. Misusing antibiotics (e.g., for viral infections) contributes to antibiotic resistance.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The SKELETAL SYSTEM has which of these functions?`,
    options: [
      "Only provides shape",
      "Only enables movement",
      "Support (framework for body), protection (skull protects brain; ribcage protects heart/lungs), movement (with muscles), blood cell production (in marrow), and mineral storage (calcium)",
      "Only produces blood cells",
    ],
    correctAnswer: 2,
    explanation: `The skeleton is multifunctional: structural support, organ protection, muscle attachment for movement, blood cell production (in red bone marrow), and storage of minerals like calcium and phosphorus.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `SOLAR PANELS are beneficial for Jamaica specifically because:`,
    options: [
      "Solar panels work everywhere equally",
      "Jamaica is the only country with sun",
      "Jamaica is in the tropics with high, consistent solar radiation year-round — making solar energy particularly viable for reducing dependence on expensive imported oil",
      "Solar panels are the cheapest technology available",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's tropical location gives it one of the highest solar radiation levels in the world. This, combined with high imported oil costs, makes solar energy economically and environmentally advantageous for Jamaica specifically.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `In an experiment testing whether plants grow taller in red or blue light, the HEIGHT of the plants is the:`,
    options: [
      "Independent variable",
      "Control variable",
      "Dependent variable — it is what is measured to see the effect",
      "Hypothesis",
    ],
    correctAnswer: 2,
    explanation: `The dependent variable is measured to assess the effect of the experimental treatment. Here, the light colour is changed (independent), and plant height is measured to see what changes as a result (dependent).`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `A SATELLITE is an object that:`,
    options: [
      "Falls to the ground after launch",
      "Stays stationary on Earth",
      "Orbits a larger body (like Earth or another planet) — either natural (the Moon) or artificial (man-made for communication, navigation, weather monitoring)",
      "Only exists in science fiction",
    ],
    correctAnswer: 2,
    explanation: `Satellites orbit celestial bodies. Natural satellites (like the Moon) orbit planets. Artificial satellites serve many purposes: communication (Satellite TV, internet), GPS navigation, weather monitoring, Earth observation, and scientific research.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `ANTIBIOTIC RESISTANCE occurs when:`,
    options: [
      "Antibiotics become stronger over time",
      "Patients take too many vitamins",
      "Bacteria evolve to survive antibiotic treatment — made worse by overuse and misuse of antibiotics, which selects for resistant strains",
      "Viruses become immune to antibiotics",
    ],
    correctAnswer: 2,
    explanation: `Antibiotic resistance develops through natural selection: bacteria with mutations that help them survive antibiotics survive and reproduce, passing on resistance. Overuse and misuse of antibiotics accelerates this process, creating drug-resistant 'superbugs.'`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `Planting TREES helps the environment because:`,
    options: [
      "Trees use oxygen without producing any benefit",
      "Trees are only decorative",
      "Trees absorb CO2 (reducing greenhouse gases), release oxygen, prevent soil erosion, regulate water cycles, provide habitat, and cool urban areas — multiple environmental benefits",
      "Trees have no effect on climate",
    ],
    correctAnswer: 2,
    explanation: `Trees provide multiple ecosystem services: carbon sequestration, oxygen production, soil protection, water regulation (transpiration adds moisture to the atmosphere), biodiversity habitat, and urban cooling through shading and evapotranspiration.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `The conclusion of an experiment should:`,
    options: [
      "Always support the hypothesis",
      "Only be drawn if the hypothesis was correct",
      "Be based on the actual results obtained — stating whether the hypothesis was supported or not supported, and what the data shows",
      "Be made before the results are analysed",
    ],
    correctAnswer: 2,
    explanation: `Scientific conclusions follow from evidence — they summarise what the data shows and whether it supports the hypothesis. A well-reasoned conclusion based on unsupportive evidence is as valuable as one that confirms the hypothesis.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `ULTRASOUND technology in medicine is used to:`,
    options: [
      "Take X-ray images",
      "Perform surgery",
      "Create images of internal soft tissue using high-frequency sound waves — commonly used to monitor foetal development during pregnancy",
      "Treat cancer with radiation",
    ],
    correctAnswer: 2,
    explanation: `Ultrasound uses high-frequency sound waves that bounce off different tissues at different rates. The echoes are processed into images — particularly useful for soft tissue (like a developing foetus) that X-rays don't image well.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy4MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy4Questions : g5ScEasy4Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 4</CardTitle>
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
              <p className="text-slate-600">Science Easy 4</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 4</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
