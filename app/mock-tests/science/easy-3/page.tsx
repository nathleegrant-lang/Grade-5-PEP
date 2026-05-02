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

const g5ScEasy3Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `Which process do plants use to make their own food?`,
    options: [
      "Respiration",
      "Fermentation",
      "Photosynthesis",
      "Digestion",
    ],
    correctAnswer: 2,
    explanation: `Photosynthesis is the process by which plants use sunlight, carbon dioxide, and water to produce glucose (food) and oxygen.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Chains",
    question: `An organism that eats ONLY plants is called a:`,
    options: [
      "Carnivore",
      "Omnivore",
      "Herbivore",
      "Decomposer",
    ],
    correctAnswer: 2,
    explanation: `Herbivores eat only plants. Carnivores eat only animals. Omnivores eat both plants and animals.`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `Which of the following is a REPTILE?`,
    options: [
      "Frog",
      "Dolphin",
      "Crocodile",
      "Eagle",
    ],
    correctAnswer: 2,
    explanation: `Reptiles are cold-blooded vertebrates with scales. Crocodiles are reptiles. Frogs are amphibians, dolphins are mammals, and eagles are birds.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The STOMACH is part of which body system?`,
    options: [
      "Respiratory system",
      "Circulatory system",
      "Digestive system",
      "Nervous system",
    ],
    correctAnswer: 2,
    explanation: `The stomach is part of the digestive system — it receives food from the oesophagus, breaks it down with acid and enzymes, and passes it to the small intestine.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A polar bear has thick white fur. The WHITE colour is an adaptation that helps the bear:`,
    options: [
      "Stay cool in summer",
      "Camouflage in snowy environments to hunt prey and avoid detection",
      "Attract a mate",
      "Grow faster",
    ],
    correctAnswer: 1,
    explanation: `Polar bear fur is white for camouflage — blending into snow and ice helps them stalk prey (seals) and avoid detection in the Arctic environment.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `Which of the following is a NON-LIVING (abiotic) part of an ecosystem?`,
    options: [
      "A fish",
      "Sunlight",
      "A water plant",
      "A frog",
    ],
    correctAnswer: 1,
    explanation: `Abiotic factors are non-living components of an ecosystem: sunlight, water, soil, air temperature, and minerals. Biotic factors are living organisms.`
  },
  {
    id: 7,
    type: "living",
    skill: "Plants",
    question: `The process by which plants release water vapour through their leaves is called:`,
    options: [
      "Photosynthesis",
      "Transpiration",
      "Respiration",
      "Germination",
    ],
    correctAnswer: 1,
    explanation: `Transpiration is the evaporation of water from plant leaves through tiny pores (stomata). It drives the upward movement of water and nutrients from roots through the stem.`
  },
  {
    id: 8,
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
    explanation: `All insects have exactly six legs — this is one of the defining characteristics of the insect class. Spiders have eight legs (they are arachnids, not insects).`
  },
  {
    id: 9,
    type: "living",
    skill: "Human Body",
    question: `Bones and muscles work together as part of the:`,
    options: [
      "Digestive system",
      "Musculoskeletal system",
      "Circulatory system",
      "Nervous system",
    ],
    correctAnswer: 1,
    explanation: `The musculoskeletal system includes bones (skeleton) and muscles working together to provide support, movement, and protection of organs.`
  },
  {
    id: 10,
    type: "living",
    skill: "Cells",
    question: `Which part of the cell controls all the cell's activities (the 'brain' of the cell)?`,
    options: [
      "Cell wall",
      "Cytoplasm",
      "Cell membrane",
      "Nucleus",
    ],
    correctAnswer: 3,
    explanation: `The nucleus contains the cell's DNA — the genetic instructions that control all cellular activities, from growth to reproduction to response to the environment.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `Which property of a GAS is different from a SOLID or LIQUID?`,
    options: [
      "It has mass",
      "It has particles",
      "It has no definite shape or volume — it expands to fill any container",
      "It responds to gravity",
    ],
    correctAnswer: 2,
    explanation: `Gases have no fixed shape or volume — their particles are far apart, move freely, and fill whatever container they are in. Solids have fixed shape and volume; liquids have fixed volume but conform to their container's shape.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `What happens to the TEMPERATURE of water as it BOILS (changes from liquid to gas)?`,
    options: [
      "It continues to rise above 100°C",
      "It falls",
      "It stays at 100°C (at standard pressure) until all the water has evaporated",
      "It varies randomly",
    ],
    correctAnswer: 2,
    explanation: `During a change of state, temperature remains constant (at the boiling or melting point) until the state change is complete — the energy added is used to break intermolecular bonds, not to raise temperature.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A book rests on a table. Which force prevents it from falling through the table?`,
    options: [
      "Gravity",
      "Friction",
      "The normal (contact) force — the table pushes upward on the book with equal force to gravity",
      "Magnetism",
    ],
    correctAnswer: 2,
    explanation: `Newton's Third Law: the table exerts an upward normal (contact) force on the book equal and opposite to the book's weight (gravitational force). These forces balance and the book stays still.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `POTENTIAL ENERGY is the energy an object has due to its:`,
    options: [
      "Speed",
      "Temperature",
      "Position or stored condition (a ball held high up has gravitational potential energy)",
      "Colour",
    ],
    correctAnswer: 2,
    explanation: `Gravitational potential energy is stored energy due to height. A ball held high has more potential energy than one on the ground — when dropped, it converts to kinetic energy.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `A material that does NOT allow electricity to flow through it is called an:`,
    options: [
      "Conductor",
      "Semiconductor",
      "Resistor",
      "Insulator",
    ],
    correctAnswer: 3,
    explanation: `Insulators prevent the flow of electric current. Rubber, plastic, wood, and glass are insulators — used to coat wires and prevent electric shocks.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `When white light passes through a PRISM, it separates into:`,
    options: [
      "Two colours only",
      "A single colour",
      "The colours of the rainbow (spectrum): red, orange, yellow, green, blue, indigo, violet",
      "Random colours",
    ],
    correctAnswer: 2,
    explanation: `A prism refracts (bends) white light, and because different colours bend by different amounts, they separate into the visible spectrum (ROYGBIV). This shows white light is composed of all colours.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `The PITCH of a sound refers to:`,
    options: [
      "How loud it is",
      "How far it travels",
      "How high or low it sounds — determined by the frequency of vibration",
      "The quality of the sound",
    ],
    correctAnswer: 2,
    explanation: `Pitch is the perceived frequency of sound. High-frequency vibrations produce high-pitched sounds (a whistle); low-frequency vibrations produce low-pitched sounds (a drum).`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `The region around a magnet where magnetic forces can be felt is called the:`,
    options: [
      "Magnetic pole",
      "Electric field",
      "Magnetic field",
      "Force zone",
    ],
    correctAnswer: 2,
    explanation: `The magnetic field is the region of space around a magnet where magnetic forces act. Its strength and direction can be mapped using iron filings or a compass.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `Which of these is an example of BALANCED FORCES acting on an object?`,
    options: [
      "A ball rolling and speeding up",
      "A rocket launching upward",
      "A car stationary on a flat road — gravity pulling down balanced by the road pushing up",
      "A ball changing direction",
    ],
    correctAnswer: 2,
    explanation: `Balanced forces produce no change in motion (Newton's First Law). A stationary car has gravity balanced by the normal force — the net force is zero.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `An INCLINED PLANE is a simple machine. Which of these is an example?`,
    options: [
      "A flagpole",
      "A wheelbarrow",
      "A ramp used to load boxes onto a truck",
      "A see-saw",
    ],
    correctAnswer: 2,
    explanation: `An inclined plane (ramp) makes it easier to raise a load by spreading the lifting effort over a longer distance — reducing the force needed at any given point.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `What instrument is used to measure AIR TEMPERATURE?`,
    options: [
      "Barometer",
      "Hygrometer",
      "Thermometer",
      "Anemometer",
    ],
    correctAnswer: 2,
    explanation: `A thermometer measures temperature using the expansion of mercury or alcohol in a calibrated tube, or electronically. The Celsius scale is standard in Jamaica.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `The LARGEST planet in our Solar System is:`,
    options: [
      "Earth",
      "Saturn",
      "Jupiter",
      "Neptune",
    ],
    correctAnswer: 2,
    explanation: `Jupiter is the Solar System's largest planet — so massive that all other planets combined could fit inside it. It is a gas giant with 95 known moons, including the four Galilean moons.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `SEDIMENTARY rocks often contain FOSSILS because:`,
    options: [
      "Fossils grow inside rocks",
      "Heat and pressure create fossils",
      "They form from layers of sediment that can trap and preserve the remains of organisms over time",
      "Fossils form only in igneous rocks",
    ],
    correctAnswer: 2,
    explanation: `Sedimentary rocks form when layers of sediment (sand, mud, shells) are compressed over time. Organisms buried in these layers can be preserved as fossils — making sedimentary rocks the primary source of fossil evidence.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Soil",
    question: `HUMUS in soil is:`,
    options: [
      "Clay minerals",
      "Small rock fragments",
      "Decomposed organic matter (from dead plants and animals) — it gives topsoil its dark colour and rich nutrients",
      "Sand particles",
    ],
    correctAnswer: 2,
    explanation: `Humus is the dark, organic component of topsoil — formed by the decomposition of plant and animal material. It enriches soil with nutrients, improves structure, and retains moisture.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Water Cycle",
    question: `When GROUNDWATER slowly emerges from underground to form a stream, this is called:`,
    options: [
      "Condensation",
      "Evaporation",
      "A spring",
      "Precipitation",
    ],
    correctAnswer: 2,
    explanation: `Springs occur where groundwater (water stored in underground aquifers) naturally emerges at the surface — often at hillsides or valley floors where aquifer rocks meet the surface.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Earth's Structure",
    question: `The hottest part of the Earth is its:`,
    options: [
      "Crust",
      "Mantle",
      "Inner core — a solid ball of mostly iron and nickel at temperatures around 5,000-6,000°C",
      "Outer core",
    ],
    correctAnswer: 2,
    explanation: `The inner core is Earth's hottest region — a solid ball of iron and nickel at approximately 5,000-6,000°C (as hot as the Sun's surface). It is solid because of extreme pressure despite the temperature.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Natural Resources",
    question: `The SUN is Jamaica's most abundant RENEWABLE energy source because:`,
    options: [
      "It is the nearest star",
      "Solar panels are cheap",
      "Jamaica is in the tropics — it receives strong, consistent sunlight year-round, making solar energy highly viable",
      "The government requires solar energy use",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's tropical location means it receives intense solar radiation year-round — making solar energy one of its most promising renewable energy options for reducing oil import dependence.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The GRAVITATIONAL PULL of the Moon causes:`,
    options: [
      "Rainfall",
      "Earthquakes",
      "Ocean tides — the Moon's gravity pulls on Earth's oceans, causing the water to bulge towards (and away from) the Moon as Earth rotates",
      "Volcanic eruptions",
    ],
    correctAnswer: 2,
    explanation: `The Moon's gravity creates tidal forces that pull Earth's ocean water toward the Moon (and on the opposite side due to inertia). As Earth rotates, these bulges produce the regular cycle of high and low tides.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `The GREENHOUSE EFFECT is when:`,
    options: [
      "The Earth's atmosphere heats up from inside",
      "Plants heat up greenhouses",
      "Certain gases in the atmosphere trap outgoing heat radiation from Earth, warming the planet",
      "UV radiation directly heats the ground",
    ],
    correctAnswer: 2,
    explanation: `The greenhouse effect: solar radiation passes through the atmosphere to warm Earth's surface. The surface radiates heat back, but greenhouse gases (CO2, water vapour, methane) absorb and re-emit it, warming the lower atmosphere.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `Which is the BEST preparation for a hurricane in Jamaica?`,
    options: [
      "Wait to see if it is serious before acting",
      "Stock emergency supplies, secure windows and doors, know evacuation routes, and monitor official weather updates",
      "Move all furniture outdoors",
      "Only prepare if the hurricane is a Category 5",
    ],
    correctAnswer: 0,
    explanation: `Hurricane preparedness is best done BEFORE the storm. Waiting until the last moment is dangerous — early preparation (supplies, securing property, knowing evacuation routes) saves lives.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `Which of the following is an example of a QUANTITATIVE observation?`,
    options: [
      "The solution turned blue",
      "The plant looked healthy",
      "The temperature rose by 5°C — a numerical measurement",
      "The liquid smelled sour",
    ],
    correctAnswer: 2,
    explanation: `Quantitative observations involve numerical measurements (how much, how many, how fast). Qualitative observations describe qualities (colour, smell, texture). Both are valid, but quantitative data is more precise.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `PASTEURISATION is a technology used to make food SAFER. It works by:`,
    options: [
      "Adding preservatives to food",
      "Freezing food completely",
      "Heating food to a specific temperature to kill harmful bacteria",
      "Drying food completely",
    ],
    correctAnswer: 2,
    explanation: `Pasteurisation (named after Louis Pasteur) uses controlled heating to kill pathogenic bacteria in food and drink without significantly changing quality. It is used for milk, juice, and many other products.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The main function of the DIGESTIVE SYSTEM is to:`,
    options: [
      "Pump blood around the body",
      "Filter waste from the blood",
      "Break down food into nutrients small enough for the body to absorb into the bloodstream",
      "Control the body's temperature",
    ],
    correctAnswer: 2,
    explanation: `The digestive system mechanically and chemically breaks down food into small molecules (nutrients) that can be absorbed through the gut wall into the bloodstream and used by cells for energy, growth, and repair.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `DEFORESTATION contributes to GLOBAL WARMING because:`,
    options: [
      "Forests produce carbon dioxide",
      "Trees block sunlight from reaching Earth",
      "Forests absorb and store carbon dioxide — removing them releases stored carbon AND reduces future CO2 absorption, increasing atmospheric greenhouse gases",
      "Forests cool the ground too much",
    ],
    correctAnswer: 2,
    explanation: `Forests are major carbon sinks. Deforestation is a double blow to the climate: stored carbon is released (especially when trees are burned), and the capacity to absorb future CO2 emissions is lost.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `PEER REVIEW in science means that:`,
    options: [
      "Scientists only share results with their friends",
      "One scientist checks another scientist's work for personal reasons",
      "Independent scientists critically evaluate research methods, data, and conclusions before publication, ensuring quality and accuracy",
      "Scientists vote on which results to believe",
    ],
    correctAnswer: 2,
    explanation: `Peer review is the quality control mechanism of science — before publication, research is independently evaluated by other experts in the field for methodological soundness, logical consistency, and the validity of conclusions.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `X-RAYS are used in medicine to:`,
    options: [
      "Give patients energy",
      "Treat infections",
      "Produce images of bones and dense internal structures, enabling doctors to diagnose fractures, disease, and other conditions without surgery",
      "Perform surgery directly",
    ],
    correctAnswer: 2,
    explanation: `X-rays are high-energy electromagnetic radiation that pass through soft tissue but are absorbed by dense structures like bone. This differential absorption creates shadow images that reveal internal structures.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `WHY is washing hands with soap important?`,
    options: [
      "It makes hands look cleaner",
      "Soap is pleasant smelling",
      "Soap breaks down the fat membranes of viruses and bacteria, physically removing them from hands — preventing transmission of disease",
      "Water alone is equally effective",
    ],
    correctAnswer: 2,
    explanation: `Soap is uniquely effective because its molecules have water-attracting and fat-attracting ends — they break apart lipid (fat) membranes of pathogens and allow them to be washed away. Simple handwashing prevents many infectious diseases.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `CLIMATE CHANGE is causing CORAL REEFS to die because:`,
    options: [
      "Cold water is harmful to coral",
      "Coral reefs are very fragile to anything",
      "Rising ocean temperatures cause coral bleaching — corals expel the algae that give them colour and nutrients — and ocean acidification (from dissolved CO2) weakens coral skeletons",
      "Human activity has no effect on coral",
    ],
    correctAnswer: 2,
    explanation: `Climate change threatens reefs through two mechanisms: warming causes bleaching (corals expel symbiotic algae and starve); ocean acidification from dissolved CO2 reduces carbonate ions needed for coral skeleton formation.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `A scientist tests whether a new fertiliser increases crop yield. She grows 50 plants with the fertiliser and 50 without. The group WITHOUT fertiliser is the:`,
    options: [
      "Independent variable",
      "Dependent variable",
      "Control group — providing a baseline for comparison to determine if the fertiliser made a difference",
      "Experimental group",
    ],
    correctAnswer: 2,
    explanation: `The control group (no fertiliser) is the baseline — it shows what happens without the treatment. Comparing the experimental group (fertiliser) to the control group reveals whether the fertiliser caused any change in yield.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `GPS (Global Positioning System) technology uses:`,
    options: [
      "Radio towers on land",
      "Underwater cables",
      "A network of satellites orbiting Earth that calculate precise location by triangulating signals from multiple satellites",
      "Telescopes on the ground",
    ],
    correctAnswer: 2,
    explanation: `GPS uses a constellation of 24+ satellites in medium Earth orbit. Receivers calculate their position by measuring the time delay of signals from at least four satellites — allowing pinpoint location accuracy worldwide.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy3MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy3Questions : g5ScEasy3Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 3",
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 3</CardTitle>
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
              <p className="text-slate-600">Science Easy 3</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 3</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
