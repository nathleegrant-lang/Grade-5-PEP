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

const g5ScEasy5Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `Which gas do plants ABSORB during photosynthesis?`,
    options: [
      "Oxygen",
      "Nitrogen",
      "Carbon dioxide",
      "Hydrogen",
    ],
    correctAnswer: 2,
    explanation: `Plants absorb carbon dioxide (CO2) from the air through tiny pores (stomata) in their leaves — one of the two raw materials needed for photosynthesis.`
  },
  {
    id: 2,
    type: "living",
    skill: "Classification",
    question: `A whale is classified as a mammal, NOT a fish, because:`,
    options: [
      "It is too large",
      "It lives in the ocean",
      "It breathes with lungs, is warm-blooded, gives birth to live young, and nurses them with milk",
      "It has a tail fin",
    ],
    correctAnswer: 2,
    explanation: `Despite living in the ocean, whales are mammals: they breathe air, are warm-blooded, give birth to live young (not eggs), and produce milk to feed their young.`
  },
  {
    id: 3,
    type: "living",
    skill: "Food Chains",
    question: `Which organism in the food chain 'grass → rabbit → fox' is the PRIMARY CONSUMER?`,
    options: [
      "Grass",
      "Fox",
      "Rabbit",
      "All three",
    ],
    correctAnswer: 2,
    explanation: `The primary consumer is the first animal in the food chain — it eats the producer (grass). The rabbit eats grass, making it the primary consumer.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The process of breaking down food into smaller molecules the body can absorb is called:`,
    options: [
      "Respiration",
      "Photosynthesis",
      "Digestion",
      "Circulation",
    ],
    correctAnswer: 2,
    explanation: `Digestion is the mechanical and chemical breakdown of food into small molecules (nutrients) that can be absorbed through the intestinal wall into the bloodstream.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A duck's WEBBED feet are adapted for:`,
    options: [
      "Running fast on land",
      "Gripping branches in trees",
      "Swimming — the webbing increases surface area for pushing through water",
      "Digging in soil",
    ],
    correctAnswer: 2,
    explanation: `Webbed feet are a swimming adaptation — the membrane between the toes acts as a paddle, increasing propulsion through water.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `PHOTOSYNTHESIS is important for all life on Earth because:`,
    options: [
      "It produces carbon dioxide",
      "It removes oxygen from the atmosphere",
      "It produces the oxygen we breathe and the glucose that forms the base of all food chains",
      "It causes rainfall",
    ],
    correctAnswer: 2,
    explanation: `Without photosynthesis, there would be no atmospheric oxygen for animals to breathe and no glucose-based organic matter for food chains. It is the foundation of almost all life.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `Which stage in a frog's life cycle breathes using GILLS?`,
    options: [
      "Adult frog",
      "Egg",
      "Tadpole",
      "Froglet",
    ],
    correctAnswer: 2,
    explanation: `Tadpoles (frog larvae) live fully in water and breathe through gills. As they develop into froglets and then adult frogs, they develop lungs for breathing on land.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `The STOMATA on leaves are used for:`,
    options: [
      "Absorbing water from the air",
      "Taking in carbon dioxide and releasing oxygen and water vapour",
      "Absorbing sunlight",
      "Producing seeds",
    ],
    correctAnswer: 1,
    explanation: `Stomata are tiny pores on leaves that allow gas exchange: CO2 in, O2 and water vapour out. They open and close to regulate water loss.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `An organism that can make its OWN food from sunlight is called an:`,
    options: [
      "Autotroph (producer)",
      "Heterotroph (consumer)",
      "Decomposer",
      "Omnivore",
    ],
    correctAnswer: 0,
    explanation: `Autotrophs (producers) make their own food using an external energy source (sunlight for plants, chemicals for some bacteria). Heterotrophs must eat other organisms for energy.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The KIDNEYS are responsible for:`,
    options: [
      "Pumping blood around the body",
      "Producing oxygen",
      "Filtering waste products from the blood and producing urine",
      "Breaking down food",
    ],
    correctAnswer: 2,
    explanation: `The kidneys are the body's filtration organs — they remove waste products (especially urea) from the blood, regulate water balance, and produce urine.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `Which statement CORRECTLY describes a SOLID?`,
    options: [
      "It flows easily",
      "It takes the shape of its container",
      "It has no definite shape",
      "It has a definite shape and volume with tightly packed particles",
    ],
    correctAnswer: 3,
    explanation: `Solids have a fixed (definite) shape and volume. Their particles are tightly packed and vibrate in fixed positions — they do not flow or change shape unless a force deforms them.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `SUBLIMATION is when a solid changes DIRECTLY to a gas WITHOUT becoming a liquid first. Which of the following is an example?`,
    options: [
      "Ice melting to water",
      "Water boiling to steam",
      "Dry ice (solid carbon dioxide) turning directly into carbon dioxide gas",
      "Frost forming on a cold surface",
    ],
    correctAnswer: 2,
    explanation: `Dry ice sublimates — solid CO2 converts directly to gas without passing through a liquid phase. Iodine crystals also sublime. Frost forming is the reverse (deposition).`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A ball thrown upward SLOWS DOWN because:`,
    options: [
      "Gravity pulls it downward (opposing its upward motion) and air resistance also acts downward",
      "The ball uses up its energy",
      "The ball gets heavier as it rises",
      "The air becomes thicker higher up",
    ],
    correctAnswer: 0,
    explanation: `Two forces oppose the ball's upward motion: gravity (always acts downward) and air resistance (acts opposite to motion — downward when ball moves up). Both decelerate the ball.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `POTENTIAL ENERGY is converted into KINETIC ENERGY when:`,
    options: [
      "A battery is charged",
      "An object at rest stays still",
      "A ball rolls down a hill — height (stored potential energy) converts to motion (kinetic energy)",
      "A light bulb glows",
    ],
    correctAnswer: 2,
    explanation: `As an object falls or rolls downhill, gravitational potential energy converts to kinetic energy. At the bottom, all potential energy has become kinetic energy (ignoring friction losses).`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `A SWITCH in a circuit is used to:`,
    options: [
      "Store electrical energy",
      "Change the type of current",
      "Complete or break the circuit — turning the flow of electricity on or off",
      "Increase the voltage",
    ],
    correctAnswer: 2,
    explanation: `A switch is a device that opens (breaks) or closes (completes) a circuit. When closed, current flows; when open, the circuit is broken and no current flows.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `Which property of light explains why we see our reflection in a mirror?`,
    options: [
      "Refraction",
      "Absorption",
      "Regular reflection — smooth mirror surfaces reflect light in a uniform direction, forming a clear image",
      "Diffraction",
    ],
    correctAnswer: 2,
    explanation: `Mirrors have very smooth surfaces that cause regular (specular) reflection — light rays reflect at the same angle they hit the surface, forming a clear, recognisable image.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `The VOLUME (loudness) of a sound depends on:`,
    options: [
      "The frequency of vibration",
      "The temperature of the air",
      "The amplitude (size) of vibration — larger vibrations produce louder sounds",
      "The direction of sound",
    ],
    correctAnswer: 2,
    explanation: `Amplitude is the distance particles are displaced when they vibrate. Large amplitude = loud sound; small amplitude = quiet sound. Frequency determines pitch, not volume.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `Magnetic compasses are useful for navigation because:`,
    options: [
      "They generate electricity",
      "They measure temperature",
      "The needle aligns with Earth's magnetic field, pointing towards magnetic north",
      "They detect nearby metal objects",
    ],
    correctAnswer: 2,
    explanation: `A compass needle is a small magnet that aligns with Earth's geomagnetic field lines, pointing toward magnetic north — allowing navigators to determine direction reliably.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `When two teams pull on opposite ends of a rope in a tug of war and neither moves, the forces are:`,
    options: [
      "Unbalanced",
      "Equal and balanced — net force is zero",
      "Only one team is applying force",
      "Magnetic",
    ],
    correctAnswer: 1,
    explanation: `Balanced forces produce no change in motion. If neither team moves, the forces are equal and opposite — the net force is zero (Newton's First Law).`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A SCREW is a simple machine that is essentially:`,
    options: [
      "A lever wrapped around a cylinder",
      "An inclined plane wrapped around a cylinder",
      "A wheel and axle with grooves",
      "A wedge with a handle",
    ],
    correctAnswer: 1,
    explanation: `A screw is an inclined plane (ramp) wrapped in a spiral around a cylinder. The spiral thread converts rotational force (turning) into linear force (moving the screw into wood).`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `A BAROMETER measures:`,
    options: [
      "Rainfall",
      "Wind speed",
      "Air (atmospheric) pressure",
      "Temperature",
    ],
    correctAnswer: 2,
    explanation: `A barometer measures atmospheric (air) pressure. Falling pressure often indicates approaching bad weather; rising pressure indicates improving weather — making barometers useful for forecasting.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `Why does EARTH have SEASONS?`,
    options: [
      "Earth moves closer to and farther from the Sun",
      "The Sun produces more heat in summer",
      "Earth's axis is tilted — as Earth orbits the Sun, different hemispheres are tilted towards or away from the Sun, receiving more or less intense sunlight",
      "The Moon causes seasons",
    ],
    correctAnswer: 2,
    explanation: `Earth's 23.5° axial tilt means that as it orbits the Sun, the Northern Hemisphere tilts toward the Sun (summer) or away (winter). Jamaica is near the equator, so seasons are less pronounced — wet and dry rather than summer/winter.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `The ROCK CYCLE describes how:`,
    options: [
      "Fossils are formed",
      "Rivers shape the landscape",
      "Rocks continuously change from one type to another through processes like melting, cooling, erosion, and pressure over millions of years",
      "Soil is created from air",
    ],
    correctAnswer: 2,
    explanation: `The rock cycle shows the continuous transformation of rocks: igneous rocks can be eroded to form sedimentary rocks; heat and pressure can create metamorphic rocks; melting produces magma for new igneous rocks.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Soil",
    question: `Good quality agricultural soil (LOAM) contains:`,
    options: [
      "Only sand",
      "Only clay",
      "A balanced mix of sand, silt, clay, and humus — providing good drainage, water retention, and nutrients",
      "Only rocks",
    ],
    correctAnswer: 2,
    explanation: `Loam is the ideal agricultural soil — a balanced mixture of sand (drainage), silt (nutrients and water retention), clay (structure and nutrients), and humus (organic matter and nutrients).`
  },
  {
    id: 25,
    type: "earth",
    skill: "Water Cycle",
    question: `The WATER CYCLE is important because:`,
    options: [
      "It changes the composition of water",
      "Water only exists in one place",
      "It continuously recycles Earth's water — moving it between oceans, atmosphere, land, and living things, making fresh water available across the planet",
      "It is only important in dry countries",
    ],
    correctAnswer: 2,
    explanation: `The water cycle is Earth's natural water recycling system. Without it, fresh water would remain fixed — the cycle replenishes rivers, groundwater, and soil moisture, sustaining all life.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `Which of the following describes SUSTAINABLE USE of a natural resource?`,
    options: [
      "Using as much as possible as quickly as possible",
      "Leaving all resources untouched",
      "Using resources at a rate that allows natural replenishment, so future generations can also use them",
      "Only using foreign resources",
    ],
    correctAnswer: 2,
    explanation: `Sustainable use means not depleting a resource faster than it can regenerate. For fisheries, harvesting sustainably means the fish population can replenish itself. For forests, it means replanting as fast as cutting.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `Most VOLCANOES are found:`,
    options: [
      "Randomly distributed across the Earth",
      "Only in tropical regions",
      "Near the boundaries of tectonic plates — where plates collide or pull apart, allowing magma to reach the surface",
      "Only in the ocean",
    ],
    correctAnswer: 2,
    explanation: `Volcanic activity is concentrated at tectonic plate boundaries: at divergent boundaries (plates pulling apart), at convergent boundaries (one plate subducting under another), and at hot spots. The 'Ring of Fire' around the Pacific is an example.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The MOON does not have its own light. It is visible because:`,
    options: [
      "The Moon generates light from its core",
      "Moonlight is reflected sunlight",
      "Moonlight is ultraviolet radiation",
      "The Moon absorbs daylight and releases it at night",
    ],
    correctAnswer: 1,
    explanation: `The Moon is visible because it reflects sunlight toward Earth. The side facing the Sun is lit; the side facing away is dark. As the Moon orbits, we see different amounts of the lit half — creating phases.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `The main GAS in Earth's atmosphere is:`,
    options: [
      "Oxygen",
      "Carbon dioxide",
      "Nitrogen (approximately 78%)",
      "Argon",
    ],
    correctAnswer: 2,
    explanation: `Earth's atmosphere is composed of approximately 78% nitrogen, 21% oxygen, 0.9% argon, 0.04% carbon dioxide, and trace amounts of other gases. Nitrogen is the most abundant but largely inert.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `Which early warning system helps REDUCE the damage from hurricanes?`,
    options: [
      "None — hurricanes cannot be predicted",
      "Only building stronger houses",
      "Meteorological services (like Jamaica's Meteorological Service) that track hurricanes days in advance, giving communities time to prepare and evacuate",
      "Planting more trees",
    ],
    correctAnswer: 2,
    explanation: `Modern meteorological monitoring satellites can track hurricanes days before they arrive, providing warning time for preparation and evacuation. Early warning systems dramatically reduce hurricane death tolls.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `What is the PURPOSE of a FAIR TEST in an experiment?`,
    options: [
      "To make the experiment easier",
      "To ensure the results support the hypothesis",
      "To ensure that only the independent variable changes, while all other variables are controlled — allowing any observed effect to be attributed to the independent variable alone",
      "To make experiments shorter",
    ],
    correctAnswer: 2,
    explanation: `A fair test controls all variables except the one being tested (the independent variable). This ensures any change in the dependent variable can only be caused by the independent variable — not by other uncontrolled factors.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `The PRINTING PRESS (invented by Gutenberg, c. 1440) was a significant technological advance because:`,
    options: [
      "It made paper cheaper",
      "It enabled mass production of books and documents — spreading literacy, education, and the sharing of ideas across Europe and beyond",
      "It only helped scientists",
      "It replaced all handwriting",
    ],
    correctAnswer: 1,
    explanation: `The printing press revolutionised information spread: books became affordable for ordinary people, literacy grew, new ideas (including scientific ones) spread rapidly, contributing to the Renaissance, Reformation, and Scientific Revolution.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `Drinking UNCLEAN WATER can cause:`,
    options: [
      "Better hydration",
      "No health effects",
      "Diseases like cholera, typhoid, and dysentery — waterborne illnesses caused by bacteria and parasites in contaminated water",
      "Only stomach discomfort",
    ],
    correctAnswer: 2,
    explanation: `Contaminated water is a leading cause of infectious disease globally. Waterborne pathogens (Vibrio cholerae causing cholera, Salmonella typhi causing typhoid, Entamoeba causing dysentery) are transmitted through water contaminated by human faeces.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `LAND POLLUTION is caused by:`,
    options: [
      "Natural processes only",
      "Rainfall",
      "The improper disposal of solid waste — littering, illegal dumping, and improper landfill management — contaminating soil and water with chemicals, plastics, and hazardous materials",
      "Only industrial chemicals",
    ],
    correctAnswer: 2,
    explanation: `Land pollution results from solid waste disposal problems: plastics, chemicals, and hazardous waste contaminate soil and leach into groundwater. It harms ecosystems, agriculture, and human health.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `A scientist says: 'My results are VALID.' This means:`,
    options: [
      "The results are the same as the hypothesis",
      "The results are exactly what the teacher expected",
      "The experiment measured what it was designed to measure using appropriate methods — and the results accurately reflect the phenomenon being studied",
      "The scientist is very confident",
    ],
    correctAnswer: 2,
    explanation: `Validity in science means the experiment actually measures what it claims to measure, using sound methodology. Results can be valid even if they don't support the hypothesis — validity is about measurement quality, not outcome.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `NANOTECHNOLOGY involves working with matter at the scale of:`,
    options: [
      "Millimetres (mm)",
      "Centimetres (cm)",
      "Nanometres (billionths of a metre) — at the scale of individual atoms and molecules",
      "Kilometres (km)",
    ],
    correctAnswer: 2,
    explanation: `Nanotechnology operates at 1-100 nanometres — where a human hair is about 80,000 nm wide. At this scale, material properties often differ dramatically from bulk behaviour, enabling new applications in medicine, electronics, and materials.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `A BALANCED DIET should include all of the following EXCEPT:`,
    options: [
      "Carbohydrates for energy",
      "Proteins for growth and repair",
      "Large amounts of saturated fat and refined sugar daily",
      "Vitamins and minerals for body functions",
    ],
    correctAnswer: 2,
    explanation: `A balanced diet includes carbohydrates (energy), proteins (growth/repair), healthy fats (cell function), fibre (digestion), vitamins, minerals, and water. Large amounts of saturated fat and refined sugar are harmful and should be limited.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `AIR POLLUTION can cause which health problem?`,
    options: [
      "Improved lung function",
      "Stronger immune systems",
      "Respiratory diseases (asthma, bronchitis, lung cancer) — fine particulates and toxic gases damage lung tissue",
      "Better athletic performance",
    ],
    correctAnswer: 2,
    explanation: `Air pollution — particularly fine particles (PM2.5), ozone, nitrogen dioxide, and sulphur dioxide — causes and aggravates respiratory diseases, cardiovascular disease, and lung cancer. It is a major global health risk.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `In science, EVIDENCE is important because:`,
    options: [
      "Scientists need to fill reports",
      "Evidence makes experiments longer",
      "Scientific claims must be based on observations and measurements — not opinion or authority alone — making science self-correcting and reliable",
      "All evidence is equally valuable",
    ],
    correctAnswer: 2,
    explanation: `Evidence-based science is self-correcting: claims supported by strong, reproducible evidence persist; those that fail evidential scrutiny are revised or rejected. This distinguishes science from belief or opinion.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `COMMUNICATION TECHNOLOGY (from writing to the internet) has most importantly allowed:`,
    options: [
      "Faster physical transport",
      "Longer working hours",
      "The storage, transmission, and sharing of ideas and information across time and space — accelerating human progress and enabling global coordination",
      "Only entertainment",
    ],
    correctAnswer: 2,
    explanation: `Communication technology is the multiplier of all other progress — it allows knowledge to be preserved, shared, and built upon by others. Each advance (writing, printing, telegraph, internet) has accelerated the rate of human development.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy5MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy5Questions : g5ScEasy5Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 5",
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 5</CardTitle>
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
              <p className="text-slate-600">Science Easy 5</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 5</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
