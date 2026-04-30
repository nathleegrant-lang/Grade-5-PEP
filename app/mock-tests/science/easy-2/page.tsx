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

const g5ScEasy2Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `Which part of a plant absorbs water and minerals from the soil?`,
    options: [
      "Leaves",
      "Stem",
      "Roots",
      "Flowers",
    ],
    correctAnswer: 2,
    explanation: `Roots absorb water and minerals from the soil and anchor the plant. They also store food in some plants.`
  },
  {
    id: 2,
    type: "living",
    skill: "Photosynthesis",
    question: `Photosynthesis takes place MAINLY in which part of the plant?`,
    options: [
      "The roots",
      "The stem",
      "The leaves",
      "The flowers",
    ],
    correctAnswer: 2,
    explanation: `Leaves are the main site of photosynthesis — their broad, flat surface maximises sunlight capture, and they contain chlorophyll-rich cells.`
  },
  {
    id: 3,
    type: "living",
    skill: "Food Chains",
    question: `A food chain always begins with a:`,
    options: [
      "Consumer",
      "Herbivore",
      "Producer (a plant)",
      "Carnivore",
    ],
    correctAnswer: 2,
    explanation: `All food chains start with a producer — a plant or other organism that makes its own food through photosynthesis, providing energy for the entire chain.`
  },
  {
    id: 4,
    type: "living",
    skill: "Animal Classification",
    question: `A frog is classified as an AMPHIBIAN because it:`,
    options: [
      "Lives only in water",
      "Has scales",
      "Can live both in water and on land, and lays eggs in water",
      "Is warm-blooded",
    ],
    correctAnswer: 2,
    explanation: `Amphibians are vertebrates that typically live in water as young (breathing through gills) and on land as adults (breathing with lungs). Most lay eggs in water.`
  },
  {
    id: 5,
    type: "living",
    skill: "Human Body",
    question: `The LUNGS are part of which body system?`,
    options: [
      "Digestive system",
      "Circulatory system",
      "Skeletal system",
      "Respiratory system",
    ],
    correctAnswer: 3,
    explanation: `The lungs are the main organs of the respiratory system — they allow oxygen from the air to enter the blood and carbon dioxide to be exhaled.`
  },
  {
    id: 6,
    type: "living",
    skill: "Habitats",
    question: `The place where an organism naturally lives is called its:`,
    options: [
      "Ecosystem",
      "Habitat",
      "Biome",
      "Community",
    ],
    correctAnswer: 1,
    explanation: `A habitat is the specific environment where an organism lives and finds everything it needs: food, water, shelter, and space.`
  },
  {
    id: 7,
    type: "living",
    skill: "Classification",
    question: `Which of the following is an INVERTEBRATE?`,
    options: [
      "Dog",
      "Parrot",
      "Butterfly",
      "Snake",
    ],
    correctAnswer: 2,
    explanation: `Invertebrates are animals without a backbone. Butterflies are insects — invertebrates. Dogs, parrots, and snakes are all vertebrates (they have backbones).`
  },
  {
    id: 8,
    type: "living",
    skill: "Adaptations",
    question: `A fish has GILLS as an adaptation for:`,
    options: [
      "Moving quickly on land",
      "Seeing in the dark",
      "Extracting oxygen from water",
      "Staying warm in cold water",
    ],
    correctAnswer: 2,
    explanation: `Gills are the respiratory organs of fish — they extract dissolved oxygen from water, allowing fish to breathe underwater.`
  },
  {
    id: 9,
    type: "living",
    skill: "Ecosystems",
    question: `DECOMPOSERS in an ecosystem break down dead organisms. This is important because:`,
    options: [
      "It removes all organisms from the ecosystem",
      "It makes the soil toxic",
      "It returns nutrients to the soil, which plants can use to grow again",
      "It removes oxygen from the air",
    ],
    correctAnswer: 2,
    explanation: `Decomposers (bacteria, fungi, worms) break down dead material and return nutrients to the soil, completing the cycle that keeps the ecosystem functioning.`
  },
  {
    id: 10,
    type: "living",
    skill: "Cells",
    question: `Plants cells have a feature animal cells do NOT have. This is the:`,
    options: [
      "Cell membrane",
      "Nucleus",
      "Cell wall",
      "Cytoplasm",
    ],
    correctAnswer: 2,
    explanation: `Plant cells have a rigid cell wall made of cellulose (outside the cell membrane) that provides structure and support. Animal cells have only a flexible cell membrane.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `When a GAS COOLS and becomes a liquid, this change of state is called:`,
    options: [
      "Melting",
      "Evaporation",
      "Freezing",
      "Condensation",
    ],
    correctAnswer: 3,
    explanation: `Condensation is the change from gas to liquid. Water vapour condensing on a cold glass, or clouds forming when moist air rises and cools, are everyday examples.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Matter",
    question: `Everything that has MASS and takes up SPACE is called:`,
    options: [
      "Energy",
      "A wave",
      "Matter",
      "A force",
    ],
    correctAnswer: 2,
    explanation: `Matter is defined as anything that has mass (amount of substance) and occupies volume (space). This includes solids, liquids, gases, and plasma.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `FRICTION is a force that:`,
    options: [
      "Helps objects move faster",
      "Acts in the direction of motion",
      "Opposes motion between surfaces in contact — producing heat and slowing moving objects",
      "Only exists on wet surfaces",
    ],
    correctAnswer: 2,
    explanation: `Friction acts between surfaces in contact, opposing relative motion. It converts kinetic energy into heat. Without friction, we couldn't walk, cars couldn't brake, and screws would loosen.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Gravity",
    question: `Weight is different from MASS because:`,
    options: [
      "They are the same thing",
      "Weight is measured in kilograms",
      "Weight is the force of gravity acting on an object's mass — it changes with gravity. Mass is the amount of matter and stays the same everywhere",
      "Mass changes with gravity",
    ],
    correctAnswer: 2,
    explanation: `Mass (kg) is the amount of matter in an object — constant everywhere. Weight (Newtons) is the gravitational force on that mass — on the Moon, you weigh less but your mass is unchanged.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Energy",
    question: `KINETIC ENERGY is the energy of:`,
    options: [
      "Stored energy in fuel",
      "An object at rest",
      "Motion — any moving object has kinetic energy proportional to its mass and speed",
      "Chemical reactions",
    ],
    correctAnswer: 2,
    explanation: `Kinetic energy is the energy of motion. Any moving object — a rolling ball, flowing water, wind — has kinetic energy. The faster the object and the greater its mass, the more kinetic energy it has.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Electricity",
    question: `In a simple electric circuit, what drives the flow of electric current?`,
    options: [
      "The light bulb",
      "The wires",
      "The battery (a source of electrical energy)",
      "The switch",
    ],
    correctAnswer: 2,
    explanation: `A battery (or other power source) provides the voltage (electrical pressure) that drives electric current through the circuit. Without a power source, no current flows.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `Which material carries sound FASTEST?`,
    options: [
      "Air",
      "Water",
      "Steel (solids generally conduct sound faster than liquids, which are faster than gases)",
      "A vacuum",
    ],
    correctAnswer: 2,
    explanation: `Sound travels through solids fastest because particles are closely packed and vibrations transmit quickly. Speed in steel ≈ 5,100 m/s; water ≈ 1,500 m/s; air ≈ 343 m/s. Sound cannot travel through vacuum.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Light",
    question: `REFLECTION of light means:`,
    options: [
      "Light bends as it passes through glass",
      "Light is absorbed by a surface",
      "Light bounces off a surface — the angle of reflection equals the angle of incidence",
      "Light is split into colours",
    ],
    correctAnswer: 2,
    explanation: `Reflection is when light bounces off a surface. Smooth, polished surfaces (mirrors) reflect light regularly (you see a clear image); rough surfaces scatter light in many directions.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Magnetism",
    question: `A compass works because:`,
    options: [
      "It has a battery inside",
      "The compass needle is glued in place",
      "Earth has a magnetic field — the magnetised needle aligns with Earth's north-south magnetic field",
      "Light guides the needle",
    ],
    correctAnswer: 2,
    explanation: `A compass needle is a tiny magnet. Earth's magnetic field exerts a force on it, causing it to align with the field and point towards magnetic north — enabling navigation.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A PULLEY system helps you lift heavy objects because:`,
    options: [
      "It reduces the mass of the object",
      "It eliminates gravity",
      "It allows you to use a smaller force over a longer distance to lift a heavier load — changing the direction or magnitude of force",
      "It requires no effort at all",
    ],
    correctAnswer: 2,
    explanation: `A pulley redirects force and can provide mechanical advantage — a block-and-tackle pulley system allows a person to lift a heavy load with a smaller force applied over a greater distance.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Water Cycle",
    question: `In the water cycle, CONDENSATION is when:`,
    options: [
      "Water soaks into the ground",
      "Water evaporates from the ocean",
      "Water vapour in the atmosphere cools and changes to tiny liquid droplets, forming clouds",
      "Ice melts to water",
    ],
    correctAnswer: 2,
    explanation: `Condensation is the change from water vapour to liquid water. When rising air cools, water vapour condenses around dust particles, forming the tiny droplets that make up clouds.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `The planet CLOSEST to the Sun is:`,
    options: [
      "Venus",
      "Earth",
      "Mercury",
      "Mars",
    ],
    correctAnswer: 2,
    explanation: `Mercury is the innermost planet — closest to the Sun. It has no atmosphere and extreme temperatures (very hot in sun, very cold in shadow).`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `IGNEOUS rocks are formed when:`,
    options: [
      "Sediment builds up in layers",
      "Existing rocks are changed by heat and pressure",
      "Magma or lava cools and solidifies",
      "River erosion shapes them",
    ],
    correctAnswer: 2,
    explanation: `Igneous rocks form from cooled magma (underground, intrusive) or lava (at the surface, extrusive). Examples: granite (intrusive) and basalt (extrusive).`
  },
  {
    id: 24,
    type: "earth",
    skill: "Water Cycle",
    question: `PRECIPITATION is water that falls from clouds to the Earth's surface. Forms of precipitation include:`,
    options: [
      "Evaporation and condensation",
      "Only rain",
      "Rain, snow, hail, and sleet",
      "Only snow in cold countries",
    ],
    correctAnswer: 2,
    explanation: `Precipitation is any form of water falling from the atmosphere: rain, drizzle, snow, sleet (part-frozen rain), and hail (ice pellets formed in thunderstorms).`
  },
  {
    id: 25,
    type: "earth",
    skill: "Earth's Structure",
    question: `The MANTLE is:`,
    options: [
      "The Earth's outermost layer",
      "A solid metal layer",
      "The layer between the crust and the core — composed of hot, semi-solid rock that moves very slowly",
      "The liquid iron core",
    ],
    correctAnswer: 2,
    explanation: `The mantle lies between the thin crust above and the iron core below. It is the largest layer — composed of mostly solid, hot rock that flows extremely slowly over millions of years (convection).`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `FOSSIL FUELS are examples of NON-RENEWABLE resources because:`,
    options: [
      "They are underground",
      "They are black",
      "They took millions of years to form from ancient organisms and cannot be replaced in any practical timeframe",
      "They can be recycled",
    ],
    correctAnswer: 2,
    explanation: `Coal, oil, and natural gas formed over hundreds of millions of years from dead organisms. Once burned, they cannot be replaced — making them non-renewable. Their use also releases greenhouse gases.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Soil",
    question: `The main layers of soil from top to bottom are:`,
    options: [
      "Sandy, rocky, clay",
      "Topsoil, subsoil, and bedrock/parent rock",
      "Wet layer, dry layer, rock layer",
      "Only one layer — soil",
    ],
    correctAnswer: 1,
    explanation: `Soil has distinct layers (horizons): topsoil (richest in organic matter, where plants grow), subsoil (less organic matter, more minerals), and bedrock/parent rock at the base.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `How long does it take the MOON to complete ONE ORBIT around Earth?`,
    options: [
      "One day",
      "One week",
      "Approximately 27-29 days (about one month)",
      "One year",
    ],
    correctAnswer: 2,
    explanation: `The Moon orbits Earth approximately every 27.3 days (sidereal period) — closely tied to the 29.5-day cycle of lunar phases. This is why 'month' derives from 'Moon.'`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `The OZONE LAYER, which protects Earth from harmful ultraviolet (UV) radiation, is found in the:`,
    options: [
      "Troposphere",
      "Stratosphere",
      "Mesosphere",
      "Thermosphere",
    ],
    correctAnswer: 1,
    explanation: `The ozone layer is concentrated in the stratosphere (about 15–35 km altitude). It absorbs most of the Sun's harmful UV-B and UV-C radiation, protecting life on Earth from genetic damage.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `An EARTHQUAKE is caused by:`,
    options: [
      "Very heavy rainfall",
      "Volcanic ash settling on land",
      "Sudden movements of tectonic plates along fault lines, releasing seismic energy",
      "Hurricanes reaching land",
    ],
    correctAnswer: 2,
    explanation: `Earthquakes occur when stress built up between tectonic plates is suddenly released, sending seismic waves through the Earth. Jamaica sits near a major fault system and is earthquake-prone.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `After conducting an experiment, a scientist ANALYSES DATA and finds results that DO NOT support their hypothesis. They should:`,
    options: [
      "Ignore the results and repeat the experiment until the hypothesis is supported",
      "Change the hypothesis without reporting the negative result",
      "Report the results honestly — negative results are valid scientific findings that help refine understanding",
      "Conclude that the experiment failed",
    ],
    correctAnswer: 2,
    explanation: `Honesty and accuracy in reporting are foundational scientific values. Negative results (hypothesis not supported) are valuable — they eliminate possibilities and guide future research. Suppressing them distorts scientific knowledge.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `Which technology has been MOST important for improving FOOD PRODUCTION globally?`,
    options: [
      "Social media",
      "The printing press",
      "Modern agricultural technologies — improved crop varieties, irrigation systems, fertilisers, and pesticides — dramatically increasing crop yields to feed a growing global population",
      "Electric vehicles",
    ],
    correctAnswer: 2,
    explanation: `The Green Revolution (1950s-70s) and ongoing agricultural technology development — high-yield crop varieties, irrigation, fertilisers, mechanisation — allowed food production to grow faster than population, preventing predicted famines.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `NON-COMMUNICABLE DISEASES (like diabetes, hypertension, and heart disease) can be prevented or managed through:`,
    options: [
      "Antibiotics only",
      "Having more surgeries",
      "Lifestyle changes: healthy diet, regular exercise, avoiding tobacco and excessive alcohol, managing stress, and regular medical check-ups",
      "Only medication",
    ],
    correctAnswer: 2,
    explanation: `NCDs are strongly linked to lifestyle factors. While genetics plays a role, risk factors like poor diet, physical inactivity, tobacco use, and excessive alcohol are modifiable — healthy lifestyle choices significantly reduce NCD risk.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `The THREE R's of sustainability in WASTE MANAGEMENT are:`,
    options: [
      "Read, Research, Report",
      "Reduce, Reuse, Recycle — reducing consumption, extending product life, and converting waste to new materials",
      "Repair, Repaint, Redesign",
      "Remove, Replace, Restore",
    ],
    correctAnswer: 1,
    explanation: `The waste hierarchy prioritises: Reduce (consume less), Reuse (extend product lifespan), Recycle (convert waste to new materials). Reduction is best as it avoids creating waste in the first place.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `The DEPENDENT VARIABLE in an experiment is:`,
    options: [
      "The variable the scientist changes",
      "The variable kept constant",
      "The variable that is MEASURED or observed — it depends on the independent variable",
      "The variable with the most measurements",
    ],
    correctAnswer: 2,
    explanation: `The dependent variable responds to (depends on) changes in the independent variable. If testing how light affects plant growth, the independent variable is light intensity; the dependent variable is plant height/growth rate.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `RENEWABLE ENERGY TECHNOLOGY includes:`,
    options: [
      "Coal-powered generators",
      "Nuclear power plants only",
      "Solar panels, wind turbines, and hydroelectric generators — all converting renewable natural energy sources into electricity",
      "Diesel generators",
    ],
    correctAnswer: 2,
    explanation: `Renewable energy technologies harness naturally replenishing energy sources: solar panels (sunlight), wind turbines (wind kinetic energy), and hydro turbines (flowing water). They generate electricity without depleting finite resources or emitting greenhouse gases.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `The IMMUNE SYSTEM protects the body from disease by:`,
    options: [
      "Digesting bacteria",
      "Pumping blood around the body",
      "Identifying and destroying pathogens (bacteria, viruses, fungi) using white blood cells, antibodies, and other mechanisms",
      "Providing oxygen to cells",
    ],
    correctAnswer: 2,
    explanation: `The immune system is the body's defence network — it identifies foreign invaders (pathogens), mounts inflammatory responses, produces specific antibodies, and retains memory of previous infections.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `BIODIVERSITY is important because:`,
    options: [
      "More species make environments look nicer",
      "Only a few key species matter",
      "A variety of species ensures ecosystems are resilient, provides medicines, food, and ecosystem services, and represents the accumulated result of billions of years of evolution",
      "Biodiversity has no practical value",
    ],
    correctAnswer: 2,
    explanation: `Biodiversity underpins ecosystem function (more species = more stable systems), provides medicines (many drugs come from wild species), food security (crop genetic diversity), and ecosystem services (pollination, water filtering, carbon storage).`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `In science, a THEORY is:`,
    options: [
      "Just a guess that has not been tested",
      "A hypothesis that was tested once",
      "A well-substantiated explanation supported by extensive evidence, repeated testing, and peer review — the highest level of scientific explanation",
      "The same as a fact",
    ],
    correctAnswer: 2,
    explanation: `A scientific theory is NOT a guess — it is the most powerful explanation science can offer, supported by overwhelming evidence from multiple lines of independent inquiry, tested repeatedly, and accepted by the scientific community.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `Which technology helps SCIENTISTS study objects too small to see with the naked eye?`,
    options: [
      "Telescope",
      "Periscope",
      "Microscope",
      "Kaleidoscope",
    ],
    correctAnswer: 2,
    explanation: `A microscope magnifies objects too small for the naked eye — allowing scientists to observe cells, microorganisms, and other tiny structures. Microscopy revolutionised biology, medicine, and materials science.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy2MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy2Questions : g5ScEasy2Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 2</CardTitle>
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
              <p className="text-slate-600">Science Easy 2</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 2</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
