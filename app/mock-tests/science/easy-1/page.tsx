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

const g5ScEasy1Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Characteristics of Life",
    question: `Which of the following is NOT a characteristic shared by all living things?`,
    options: [
      "Ability to grow",
      "Ability to reproduce",
      "Ability to move from place to place",
      "Ability to respond to the environment",
    ],
    correctAnswer: 2,
    explanation: `All living things grow, reproduce, and respond to their environment. However, not all living things move from place to place — plants do not locomote, yet they are alive.`
  },
  {
    id: 2,
    type: "living",
    skill: "Classification",
    question: `Plants and animals are grouped into large categories called:`,
    options: [
      "Habitats",
      "Kingdoms",
      "Ecosystems",
      "Biomes",
    ],
    correctAnswer: 1,
    explanation: `Living things are organised into kingdoms — the broadest category in biological classification. Animals, plants, fungi, and bacteria are examples of kingdoms.`
  },
  {
    id: 3,
    type: "living",
    skill: "Plants",
    question: `The green substance in plant leaves that captures sunlight for photosynthesis is called:`,
    options: [
      "Starch",
      "Chlorophyll",
      "Glucose",
      "Oxygen",
    ],
    correctAnswer: 1,
    explanation: `Chlorophyll is the green pigment in plant leaves (and other parts) that absorbs sunlight — the energy source that drives photosynthesis.`
  },
  {
    id: 4,
    type: "living",
    skill: "Photosynthesis",
    question: `During photosynthesis, plants take in carbon dioxide and water and produce:`,
    options: [
      "Oxygen and glucose",
      "Nitrogen and starch",
      "Carbon dioxide and water",
      "Protein and fat",
    ],
    correctAnswer: 0,
    explanation: `Photosynthesis: CO2 + H2O + sunlight → glucose (food) + O2. Plants produce oxygen as a byproduct and glucose as their food.`
  },
  {
    id: 5,
    type: "living",
    skill: "Food Chains",
    question: `In the food chain: grass → grasshopper → frog → snake, the grass is the:`,
    options: [
      "Consumer",
      "Predator",
      "Producer",
      "Decomposer",
    ],
    correctAnswer: 2,
    explanation: `Plants are producers — they make their own food through photosynthesis. All other organisms in a food chain are consumers.`
  },
  {
    id: 6,
    type: "living",
    skill: "Animal Classification",
    question: `Which of the following animals is a MAMMAL?`,
    options: [
      "Crocodile",
      "Parrot",
      "Bat",
      "Lizard",
    ],
    correctAnswer: 2,
    explanation: `Mammals are warm-blooded vertebrates that have hair/fur and feed their young with milk. A bat is the only mammal listed — despite having wings, it is not a bird.`
  },
  {
    id: 7,
    type: "living",
    skill: "Human Body",
    question: `The HEART is part of which body system?`,
    options: [
      "Digestive system",
      "Respiratory system",
      "Circulatory system",
      "Skeletal system",
    ],
    correctAnswer: 2,
    explanation: `The heart is the central organ of the circulatory system — it pumps blood throughout the body, delivering oxygen and nutrients to cells.`
  },
  {
    id: 8,
    type: "living",
    skill: "Adaptations",
    question: `A cactus plant stores water in its thick stem. This is an example of an adaptation to which environment?`,
    options: [
      "Rainforest",
      "Arctic tundra",
      "Desert",
      "Ocean",
    ],
    correctAnswer: 2,
    explanation: `Cacti are adapted for arid (dry) desert environments — thick, water-storing stems, waxy coatings to reduce water loss, and spines instead of leaves all help them survive with very little water.`
  },
  {
    id: 9,
    type: "living",
    skill: "Ecosystems",
    question: `A pond, with its fish, plants, frogs, and insects, is an example of:`,
    options: [
      "A habitat",
      "A food chain",
      "An ecosystem",
      "A biome",
    ],
    correctAnswer: 2,
    explanation: `An ecosystem is a community of living organisms interacting with each other AND their non-living environment (water, sunlight, nutrients). A pond ecosystem includes all the plants, animals, and the water itself.`
  },
  {
    id: 10,
    type: "living",
    skill: "Cells",
    question: `The smallest unit of life is the:`,
    options: [
      "Organ",
      "Tissue",
      "Cell",
      "Organism",
    ],
    correctAnswer: 2,
    explanation: `Cells are the basic building blocks of all living things — the smallest unit that can carry out all the functions of life.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `The three states of matter are:`,
    options: [
      "Solid, liquid, gas",
      "Solid, liquid, plasma",
      "Liquid, gas, air",
      "Hard, soft, flowing",
    ],
    correctAnswer: 0,
    explanation: `The three common states of matter are solid (fixed shape and volume), liquid (fixed volume, takes the shape of its container), and gas (no fixed shape or volume).`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `When a solid is HEATED and becomes a liquid, this change is called:`,
    options: [
      "Evaporation",
      "Condensation",
      "Melting",
      "Freezing",
    ],
    correctAnswer: 2,
    explanation: `Melting is the change of state from solid to liquid when a substance is heated above its melting point. The reverse (liquid to solid) is freezing.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `A FORCE is BEST described as:`,
    options: [
      "Only a push",
      "Only a pull",
      "A push or pull that can change an object's motion, speed, or shape",
      "The weight of an object",
    ],
    correctAnswer: 2,
    explanation: `Forces are pushes or pulls. They can make objects start moving, stop moving, speed up, slow down, or change direction.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Gravity",
    question: `Gravity is a force that:`,
    options: [
      "Pushes objects away from each other",
      "Only exists on Earth",
      "Attracts objects with mass towards each other — pulling us towards Earth and keeping planets in orbit",
      "Only works on heavy objects",
    ],
    correctAnswer: 2,
    explanation: `Gravity is the attractive force between any two objects with mass. Earth's gravity pulls everything towards its centre — giving objects weight and keeping us on the ground.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Energy",
    question: `Which of the following is an example of LIGHT ENERGY?`,
    options: [
      "A moving car",
      "A piece of coal",
      "The sun shining",
      "A stretched rubber band",
    ],
    correctAnswer: 2,
    explanation: `The sun produces light energy — electromagnetic radiation that travels as waves and enables plants to photosynthesise, allows us to see, and warms the Earth.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Electricity",
    question: `Which of the following materials conducts ELECTRICITY?`,
    options: [
      "Wood",
      "Rubber",
      "Copper wire",
      "Plastic",
    ],
    correctAnswer: 2,
    explanation: `Copper is an excellent conductor of electricity — its structure allows electrons to flow freely. Wood, rubber, and plastic are insulators that do not conduct electricity.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `Sound travels as:`,
    options: [
      "Light waves",
      "Magnetic waves",
      "Vibrations (mechanical waves) that need a medium (solid, liquid, or gas) to travel through",
      "Radio waves",
    ],
    correctAnswer: 2,
    explanation: `Sound is produced by vibration and travels as mechanical waves through matter (solids, liquids, gases). It cannot travel through a vacuum because there are no particles to vibrate.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Light",
    question: `The bending of light as it passes from one medium to another (e.g., air to water) is called:`,
    options: [
      "Reflection",
      "Refraction",
      "Absorption",
      "Diffraction",
    ],
    correctAnswer: 1,
    explanation: `Refraction is the bending of light when it changes speed as it passes between different transparent media (air to water, air to glass). This is why a straw appears bent in a glass of water.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Magnetism",
    question: `A MAGNET attracts which of the following materials?`,
    options: [
      "Wood",
      "Aluminium",
      "Iron (and other ferromagnetic metals like steel, nickel, cobalt)",
      "Copper",
    ],
    correctAnswer: 2,
    explanation: `Magnets attract ferromagnetic materials — primarily iron, steel, nickel, and cobalt. They do not attract non-ferrous metals like copper and aluminium, or non-metals like wood.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A LEVER is a simple machine. Which of the following is an example of a lever?`,
    options: [
      "A wheel and axle",
      "A pulley",
      "A seesaw",
      "A screw",
    ],
    correctAnswer: 2,
    explanation: `A seesaw is a classic lever — a rigid bar (the plank) that pivots on a fulcrum (the central support), allowing a force applied at one end to lift a load at the other.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather vs Climate",
    question: `The difference between WEATHER and CLIMATE is:`,
    options: [
      "They mean the same thing",
      "Weather is long-term; climate is short-term",
      "Weather is the day-to-day atmospheric conditions; climate is the long-term average weather pattern over 30+ years",
      "Climate only refers to rainfall",
    ],
    correctAnswer: 2,
    explanation: `Weather describes current atmospheric conditions (today's rain); climate describes the long-term average (Jamaica's climate is tropical — warm and wet). 'Climate is what you expect; weather is what you get.'`
  },
  {
    id: 22,
    type: "earth",
    skill: "Water Cycle",
    question: `In the water cycle, EVAPORATION is when:`,
    options: [
      "Rainwater soaks into the ground",
      "Water vapour condenses to form clouds",
      "Liquid water absorbs heat energy and becomes water vapour",
      "Ice melts to liquid water",
    ],
    correctAnswer: 2,
    explanation: `Evaporation is the conversion of liquid water to water vapour using heat energy from the sun. It is the primary process by which water enters the atmosphere.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Solar System",
    question: `How many planets are in our Solar System?`,
    options: [
      "Seven",
      "Eight",
      "Nine",
      "Ten",
    ],
    correctAnswer: 1,
    explanation: `There are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto was reclassified as a dwarf planet in 2006.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Earth's Structure",
    question: `The outermost layer of the Earth is called the:`,
    options: [
      "Mantle",
      "Inner core",
      "Outer core",
      "Crust",
    ],
    correctAnswer: 3,
    explanation: `The Earth's crust is the outermost, thinnest layer — the solid surface on which we live. It includes the ocean floor and continents.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Rocks",
    question: `The THREE main types of rocks are:`,
    options: [
      "Hard, soft, and medium rocks",
      "Igneous, metamorphic, and sedimentary",
      "Volcanic, river, and sea rocks",
      "Black, grey, and white rocks",
    ],
    correctAnswer: 1,
    explanation: `Rocks are classified by how they form: igneous (from cooled magma/lava), sedimentary (from compressed sediment layers), and metamorphic (from rocks changed by heat and pressure).`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `A RENEWABLE natural resource is one that:`,
    options: [
      "Cannot be replaced once used",
      "Takes millions of years to form",
      "Can be replaced or replenished naturally within a human timescale",
      "Is found only underground",
    ],
    correctAnswer: 2,
    explanation: `Renewable resources replenish naturally: solar, wind, water (hydro), forests (if managed), and tides. Non-renewable resources (coal, oil, gas, bauxite) cannot be replaced on human timescales.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Soil",
    question: `Soil is important for life because:`,
    options: [
      "It is very heavy",
      "It is hard and durable",
      "It contains the nutrients, water, and physical support that plants need to grow — forming the foundation of most terrestrial food chains",
      "It is non-living and irrelevant to biology",
    ],
    correctAnswer: 2,
    explanation: `Soil is a living system of minerals, organic matter, air, water, and billions of microorganisms. Plants grow in it, drawing nutrients and water — making it the foundation of most terrestrial ecosystems.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `The Moon's PHASES are caused by:`,
    options: [
      "The Earth's shadow falling on the Moon",
      "The Moon emitting its own light",
      "The changing angle from which we see the sunlit portion of the Moon as it orbits Earth",
      "Clouds covering the Moon",
    ],
    correctAnswer: 2,
    explanation: `The Moon does not emit its own light — it reflects sunlight. As it orbits Earth, we see different proportions of its lit half, producing the cycle of phases (new, crescent, quarter, gibbous, full).`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `The layer of the atmosphere closest to Earth's surface is the:`,
    options: [
      "Stratosphere",
      "Mesosphere",
      "Thermosphere",
      "Troposphere",
    ],
    correctAnswer: 3,
    explanation: `The troposphere is the lowest layer of the atmosphere (0–12 km) — it contains most of the atmosphere's mass and all weather. Above it: stratosphere (ozone layer), mesosphere, thermosphere.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `Which natural disaster is MOST common in Jamaica?`,
    options: [
      "Earthquakes",
      "Tornadoes",
      "Hurricanes",
      "Volcanic eruptions",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is in the Atlantic hurricane belt. Hurricanes (tropical cyclones) are the most frequent natural disaster threat, occurring during the June-November Atlantic hurricane season.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `The FIRST step in the scientific method is:`,
    options: [
      "Conducting an experiment",
      "Drawing a conclusion",
      "Identifying a problem or asking a question",
      "Writing a hypothesis",
    ],
    correctAnswer: 2,
    explanation: `The scientific method begins with observation and identifying a question or problem to investigate. Everything else — hypothesis, experiment, results, conclusion — follows from the initial question.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Scientific Method",
    question: `A HYPOTHESIS is BEST described as:`,
    options: [
      "A proven scientific fact",
      "A final conclusion",
      "A testable, educated prediction or explanation for an observation that can be tested through experiment",
      "A measurement taken in a lab",
    ],
    correctAnswer: 2,
    explanation: `A hypothesis is a testable prediction — an educated guess based on prior knowledge that can be supported or refuted through experimentation. It must be falsifiable.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Technology",
    question: `Technology is BEST described as:`,
    options: [
      "Only computers and phones",
      "The application of scientific knowledge to solve practical problems or create useful tools and systems",
      "Only machinery and engines",
      "Scientific theories that are not yet proven",
    ],
    correctAnswer: 1,
    explanation: `Technology is the practical application of scientific knowledge — any tool, process, or system developed to meet a human need or solve a problem. From a stick used to dig to artificial intelligence, all are technology.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Health",
    question: `Vaccines protect people from disease by:`,
    options: [
      "Killing all bacteria in the body",
      "Making people temporarily sick",
      "Introducing a weakened or inactive pathogen (or its parts) to stimulate the immune system to produce antibodies without causing the disease",
      "Providing vitamin supplements",
    ],
    correctAnswer: 2,
    explanation: `Vaccines train the immune system to recognise and fight specific pathogens. When vaccinated, the body produces antibodies — so if exposed to the real pathogen later, it can mount a rapid, effective defence.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Environment",
    question: `Which human activity MOST contributes to GLOBAL WARMING?`,
    options: [
      "Farming vegetables",
      "Watching television",
      "Burning fossil fuels (coal, oil, gas) releasing CO2 — the primary greenhouse gas driving climate change",
      "Recycling paper",
    ],
    correctAnswer: 2,
    explanation: `The combustion of fossil fuels (for energy, transport, industry) is the largest source of anthropogenic CO2 emissions — the primary driver of current global warming and climate change.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Scientific Method",
    question: `In an experiment, the VARIABLE that is deliberately CHANGED by the scientist is called the:`,
    options: [
      "Controlled variable",
      "Dependent variable",
      "Independent variable",
      "Fixed variable",
    ],
    correctAnswer: 2,
    explanation: `The independent variable is deliberately changed to test its effect. The dependent variable is what changes in response. Controlled variables are kept the same to ensure a fair test.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Technology in Society",
    question: `The INTERNET has changed daily life by:`,
    options: [
      "Making it impossible to communicate",
      "Reducing access to information",
      "Connecting people globally, providing instant access to vast amounts of information, enabling commerce, education, and communication at unprecedented scale",
      "Only benefiting wealthy countries",
    ],
    correctAnswer: 2,
    explanation: `The internet has transformed communication, commerce, education, and social interaction — connecting billions of people and creating new possibilities for accessing information, economic participation, and global collaboration.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Health",
    question: `Regular PHYSICAL EXERCISE is important for health because:`,
    options: [
      "It has no significant health benefits",
      "It only builds muscles",
      "It strengthens the heart, lungs, muscles, and bones; improves mental health; helps maintain healthy weight; and reduces risk of chronic diseases like diabetes and hypertension",
      "It only benefits athletes",
    ],
    correctAnswer: 2,
    explanation: `Exercise has multiple, well-documented health benefits: cardiovascular fitness, healthy weight, strong bones and muscles, improved mental health (reducing anxiety and depression), and lower risk of non-communicable diseases.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Environment",
    question: `RECYCLING is beneficial because:`,
    options: [
      "It uses more energy than making new products",
      "It creates more waste",
      "It reduces the demand for new raw materials, decreases energy use, and reduces waste going to landfills — conserving resources and reducing environmental impact",
      "It only benefits paper products",
    ],
    correctAnswer: 2,
    explanation: `Recycling conserves resources (less mining, logging, or extraction needed), saves energy (making products from recycled materials often uses less energy than from raw materials), and reduces landfill waste.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Scientific Method",
    question: `In an experiment, a CONTROL GROUP is:`,
    options: [
      "The group that receives the experimental treatment",
      "The group measuring the variables",
      "The group that does NOT receive the treatment being tested — providing a baseline for comparison",
      "The group of scientists conducting the experiment",
    ],
    correctAnswer: 2,
    explanation: `The control group receives no treatment (or a standard treatment) — it is the baseline for comparison. Without a control, scientists cannot determine whether any observed changes are due to the experimental treatment or other factors.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy1Questions : g5ScEasy1Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 1",
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 1</CardTitle>
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
              <p className="text-slate-600">Science Easy 1</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 1</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
