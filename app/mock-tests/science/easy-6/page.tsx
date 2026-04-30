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

const g5ScEasy6Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `A plant without CHLOROPHYLL would NOT be able to:`,
    options: [
      "Absorb water",
      "Grow roots",
      "Carry out photosynthesis to produce food",
      "Produce seeds",
    ],
    correctAnswer: 2,
    explanation: `Without chlorophyll, a plant cannot capture sunlight energy needed for photosynthesis. It could not produce its own food and would not survive as a green plant.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Chains",
    question: `What happens to a food chain if the PRODUCERS are removed?`,
    options: [
      "Only the top predators are affected",
      "Nothing changes",
      "The entire food chain collapses — without plants producing food, all consumers lose their energy source",
      "Only herbivores are affected",
    ],
    correctAnswer: 2,
    explanation: `Producers are the foundation of all food chains. Remove them and every consumer — herbivores, carnivores, and omnivores — loses its energy source. The entire chain fails.`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `Which of the following animals is COLD-BLOODED?`,
    options: [
      "Lion",
      "Dolphin",
      "Eagle",
      "Iguana",
    ],
    correctAnswer: 3,
    explanation: `Cold-blooded (ectothermic) animals cannot regulate their body temperature internally — they rely on external heat. Iguanas (reptiles) are cold-blooded. The others are mammals or birds, which are warm-blooded.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The SKIN is the body's LARGEST organ. Its functions include:`,
    options: [
      "Only keeping us warm",
      "Only producing vitamin D",
      "Protection (barrier against infection and UV), temperature regulation, sensation, and vitamin D production",
      "Only sensation",
    ],
    correctAnswer: 2,
    explanation: `Skin has multiple vital functions: it is the body's first line of defence against pathogens and UV radiation, helps regulate temperature through sweating and blood flow, contains sensory receptors, and produces vitamin D when exposed to sunlight.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `Long, sharp claws in an eagle are an adaptation for:`,
    options: [
      "Building nests",
      "Swimming",
      "Catching and gripping prey (fish, small animals)",
      "Climbing trees",
    ],
    correctAnswer: 2,
    explanation: `Eagles' talons (sharp curved claws) are highly adapted for catching, gripping, and carrying prey — they can exert enormous gripping force to secure struggling animals.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `What is a FOOD WEB?`,
    options: [
      "A single chain of organisms eating one another",
      "A spider's web used to catch food",
      "A network of interconnected food chains showing complex feeding relationships in an ecosystem",
      "A diagram of how plants photosynthesise",
    ],
    correctAnswer: 2,
    explanation: `A food web shows the multiple, interconnected feeding relationships in an ecosystem — more realistic than a simple food chain because most animals eat more than one type of food.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `GERMINATION is the process by which:`,
    options: [
      "A plant produces flowers",
      "A seed begins to grow and sprout into a new plant",
      "A plant releases pollen",
      "Leaves fall in autumn",
    ],
    correctAnswer: 1,
    explanation: `Germination is the process of a seed sprouting — given the right conditions (water, warmth, oxygen), the seed absorbs water, breaks dormancy, and the embryo grows into a seedling.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `The main function of FRUITS in plants is to:`,
    options: [
      "Feed animals",
      "Protect the plant from insects",
      "Contain and disperse seeds — often attracting animals to eat them and spread seeds elsewhere",
      "Carry out photosynthesis",
    ],
    correctAnswer: 2,
    explanation: `Fruits develop from fertilised flowers and contain seeds. Their role is seed dispersal — many are eaten by animals, who deposit the seeds (undigested) far from the parent plant.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `How are VIRUSES different from bacteria?`,
    options: [
      "Viruses are larger than bacteria",
      "Viruses are living organisms; bacteria are not",
      "Viruses are not considered living — they cannot reproduce without a host cell. Bacteria are living single-celled organisms",
      "There is no difference",
    ],
    correctAnswer: 2,
    explanation: `Viruses are non-cellular particles that can only replicate inside host cells. They lack the machinery to reproduce independently, placing them outside the conventional definition of life.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `Which organ produces INSULIN to regulate blood sugar levels?`,
    options: [
      "Liver",
      "Stomach",
      "Pancreas",
      "Kidney",
    ],
    correctAnswer: 2,
    explanation: `The pancreas produces insulin — a hormone that signals cells to absorb glucose from the blood, lowering blood sugar levels. Diabetes occurs when this system fails.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `When a liquid FREEZES, its particles:`,
    options: [
      "Gain energy and move faster",
      "Become gases",
      "Lose energy, move slower, and settle into fixed positions — forming a rigid solid",
      "Disappear completely",
    ],
    correctAnswer: 2,
    explanation: `Freezing occurs when a liquid loses thermal energy. As particles slow down, intermolecular forces hold them in fixed positions — producing a solid with a definite shape.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `CONDENSATION is the process by which:`,
    options: [
      "Water boils",
      "Ice melts",
      "Water vapour in the air cools and changes to liquid water — seen on cold glasses and windows",
      "Gas turns to solid directly",
    ],
    correctAnswer: 2,
    explanation: `Condensation occurs when water vapour (gas) cools below the dew point — water molecules lose energy and bond together into liquid droplets. Morning dew and fog are everyday examples.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `AIR RESISTANCE is a type of friction that acts on:`,
    options: [
      "Only boats in water",
      "Objects moving through air — opposing their motion and limiting their speed",
      "Only falling objects",
      "Objects at rest",
    ],
    correctAnswer: 1,
    explanation: `Air resistance (drag) is the friction force exerted by air on objects moving through it. It opposes motion — the faster an object moves, the greater the air resistance.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `SOLAR ENERGY is an example of:`,
    options: [
      "Chemical energy",
      "Nuclear energy stored in uranium",
      "Radiant (light) energy from the sun — which can be converted to electricity using solar panels",
      "Kinetic energy",
    ],
    correctAnswer: 2,
    explanation: `Solar energy is radiant electromagnetic energy from the sun. Solar panels (photovoltaic cells) convert this light energy directly into electrical energy through the photovoltaic effect.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `A PARALLEL circuit is different from a series circuit because:`,
    options: [
      "Parallel has only one path",
      "Parallel has no battery",
      "In a parallel circuit, components have separate branches — if one fails, others continue to work because current can take alternative paths",
      "Parallel uses less electricity",
    ],
    correctAnswer: 2,
    explanation: `Parallel circuits provide multiple paths for current. If one branch breaks (one bulb goes out), current continues flowing through the other branches — unlike series circuits where all components fail.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `We are able to SEE objects because:`,
    options: [
      "Our eyes produce light",
      "Objects generate their own light",
      "Light from a source bounces off objects and enters our eyes — our eyes detect the reflected light",
      "Objects vibrate and send signals to our brain",
    ],
    correctAnswer: 2,
    explanation: `Vision works because: a light source emits light → light reflects off objects → reflected light enters our eyes → the eye forms an image → the brain interprets it. Without light (or in complete darkness), we cannot see.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `Sound travels FASTER through solids than through air because:`,
    options: [
      "Solids are louder",
      "Sound does not travel through air",
      "In solids, particles are more closely packed and transmit vibrations more efficiently — so sound moves faster",
      "Solids are heavier",
    ],
    correctAnswer: 2,
    explanation: `Sound speed depends on how tightly packed and how strongly bonded the medium's particles are. In solids, closely bonded particles transmit vibrations very efficiently — so sound travels fastest through solids.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `What are the TWO POLES of a magnet called?`,
    options: [
      "East and West",
      "Positive and Negative",
      "North and South",
      "Magnetic and Electric",
    ],
    correctAnswer: 2,
    explanation: `Every magnet has two poles: a north pole and a south pole. Magnetic field lines run from the north pole out around to the south pole.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Energy",
    question: `When we EAT FOOD, the chemical energy in food is converted inside our bodies into:`,
    options: [
      "Solar energy",
      "Nuclear energy",
      "Kinetic energy (movement) and thermal energy (body heat) — plus other forms needed for body functions",
      "Only heat",
    ],
    correctAnswer: 2,
    explanation: `Food contains chemical energy. During cellular respiration, cells break down glucose, converting its chemical energy into ATP (usable energy) for movement, heat production, growth, and all biological processes.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `A WEDGE is a simple machine used to:`,
    options: [
      "Pull objects up",
      "Redirect force",
      "Split, cut, or separate materials — it converts a force applied to its blunt end into forces perpendicular to its faces",
      "Store energy",
    ],
    correctAnswer: 2,
    explanation: `A wedge (like an axe blade or knife) converts a downward force into horizontal forces that split or cut — amplifying the effect of the applied force over a smaller area (high pressure).`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `An ANEMOMETER measures:`,
    options: [
      "Temperature",
      "Rainfall",
      "Wind speed",
      "Air pressure",
    ],
    correctAnswer: 2,
    explanation: `An anemometer measures wind speed — typically consisting of cups that spin in the wind, with the rotation speed indicating wind velocity.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `Which of the following is NOT a planet in our Solar System?`,
    options: [
      "Mars",
      "Jupiter",
      "The Moon",
      "Saturn",
    ],
    correctAnswer: 2,
    explanation: `The Moon is Earth's natural satellite, not a planet. It orbits Earth, not the Sun directly (though it does orbit the Sun indirectly as part of the Earth-Moon system).`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `Which of these is a SEDIMENTARY rock?`,
    options: [
      "Granite",
      "Basalt",
      "Marble",
      "Sandstone",
    ],
    correctAnswer: 3,
    explanation: `Sandstone is a sedimentary rock — formed from compressed layers of sand grains. Granite and basalt are igneous; marble is metamorphic.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Water Cycle",
    question: `INFILTRATION in the water cycle is when:`,
    options: [
      "Water evaporates from soil",
      "Rain falls from clouds",
      "Water soaks into the ground and replenishes groundwater and aquifers",
      "Ice forms on mountains",
    ],
    correctAnswer: 2,
    explanation: `Infiltration is the process by which water on the surface (from rain or snowmelt) soaks into the soil. Some percolates down to recharge underground aquifers — the source of well and spring water.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Soil",
    question: `Earthworms are important for soil because:`,
    options: [
      "They eat all the soil",
      "They make soil toxic",
      "They break down organic matter, aerate soil (making tunnels), and improve soil structure — making them vital decomposers and soil engineers",
      "They only live in wet soil",
    ],
    correctAnswer: 2,
    explanation: `Earthworms are essential soil engineers: they break down organic matter (speeding decomposition and nutrient release), tunnel through soil (improving aeration and drainage), and mix soil layers.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `WIND ENERGY is renewable because:`,
    options: [
      "Wind turbines never break down",
      "Wind is free",
      "The wind is produced continuously by atmospheric processes driven by solar energy — it will not run out",
      "Wind is found everywhere at all times",
    ],
    correctAnswer: 2,
    explanation: `Wind energy is renewable because wind is generated continuously by differential heating of Earth's atmosphere by the sun — a process that will continue as long as the sun shines.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `Earth's OUTER CORE is composed mainly of:`,
    options: [
      "Solid granite",
      "Molten silicon",
      "Liquid iron and nickel — kept in liquid state by heat from the inner core",
      "Compressed oxygen",
    ],
    correctAnswer: 2,
    explanation: `Earth's outer core is a layer of liquid iron and nickel surrounding the solid inner core. Movements in this liquid metal generate Earth's magnetic field through a dynamo effect.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `A SOLAR ECLIPSE occurs when:`,
    options: [
      "Earth passes between the Sun and Moon",
      "The Moon passes between Earth and the Sun, blocking sunlight from reaching Earth",
      "The Moon's shadow passes over the Sun",
      "Earth blocks the Moon from the Sun",
    ],
    correctAnswer: 1,
    explanation: `During a solar eclipse, the Moon aligns between Earth and the Sun — the Moon's shadow falls on part of Earth. The Moon's disc perfectly covers the Sun's disc (as seen from Earth) during a total solar eclipse.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `ACID RAIN is caused by:`,
    options: [
      "Natural rainfall being slightly acidic",
      "The cooling of clouds",
      "Sulphur dioxide and nitrogen oxides (from burning fossil fuels) dissolving in rain to form sulphuric and nitric acids",
      "Volcanic ash falling into clouds",
    ],
    correctAnswer: 2,
    explanation: `When fossil fuels burn, they release SO2 and NOx into the atmosphere. These dissolve in atmospheric water to form sulphuric and nitric acids — falling as acid rain that damages forests, soils, and aquatic ecosystems.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `FLOODING in Jamaica is most often caused by:`,
    options: [
      "Volcanoes erupting",
      "Earthquakes splitting the land",
      "Heavy rainfall (especially during hurricane season) overwhelming rivers and drainage systems, often worsened by deforestation",
      "Only coastal storms",
    ],
    correctAnswer: 2,
    explanation: `Flooding in Jamaica typically follows heavy rainfall — rivers overflow and urban drainage is overwhelmed. Deforestation worsens flooding by removing the forest cover that slows runoff and absorbs rainfall.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `A student conducts an experiment but does not write down her results. This is a problem because:`,
    options: [
      "It saves time",
      "Results are not important",
      "Without recorded data, results cannot be analysed, verified, or shared — the experiment's findings cannot contribute to scientific knowledge",
      "Teachers will not mind",
    ],
    correctAnswer: 2,
    explanation: `Recording data is essential to the scientific process: without it, results cannot be analysed, patterns cannot be identified, and other scientists cannot verify or build upon the work. Undocumented science is lost science.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `A MICROSCOPE can be used to observe which of the following?`,
    options: [
      "Stars and galaxies",
      "Objects too small for the naked eye — cells, bacteria, blood cells, microorganisms",
      "The surface of the Moon",
      "Weather patterns",
    ],
    correctAnswer: 1,
    explanation: `Microscopes magnify tiny objects — from cells (10-100 micrometres) to bacteria (1-10 micrometres) to subcellular structures. They revolutionised biology and medicine by making the invisible world visible.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The PRIMARY purpose of the RESPIRATORY SYSTEM is:`,
    options: [
      "Digesting food",
      "Pumping blood",
      "Exchanging gases — taking oxygen into the body from inhaled air and removing carbon dioxide through exhalation",
      "Filtering blood",
    ],
    correctAnswer: 2,
    explanation: `The respiratory system facilitates gas exchange: oxygen from inhaled air crosses the thin alveolar walls into the bloodstream; carbon dioxide from the blood crosses back into the alveoli to be exhaled.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `WATER POLLUTION can affect human health by:`,
    options: [
      "Making water taste better",
      "Improving fish populations",
      "Causing diseases when contaminated water is drunk, used for bathing, or comes into contact with food — pollutants and pathogens can harm the liver, kidneys, nervous system, and cause infection",
      "No significant health effects",
    ],
    correctAnswer: 2,
    explanation: `Water pollutants affect health depending on type: biological pollutants (bacteria, viruses) cause infectious diseases; chemical pollutants (heavy metals, pesticides) cause poisoning and organ damage; nutrient pollution causes algal blooms that deplete oxygen.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `A GRAPH is useful in science because:`,
    options: [
      "It makes reports look more professional",
      "Graphs are required by teachers",
      "It visually displays patterns, trends, and relationships in data that might not be obvious from a table of numbers",
      "Graphs are easier to make than tables",
    ],
    correctAnswer: 2,
    explanation: `Graphs transform numerical data into visual form — making trends, patterns, correlations, and outliers immediately apparent. Bar graphs compare categories; line graphs show change over time; scatter plots reveal relationships between variables.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `BIOTECHNOLOGY includes which of the following?`,
    options: [
      "Building bridges",
      "Only computer technology",
      "Using biological systems or organisms to create products — including medicines (insulin from bacteria), crop varieties (GM crops), and treatments (vaccines and antibiotics)",
      "Only agricultural machinery",
    ],
    correctAnswer: 2,
    explanation: `Biotechnology harnesses living systems: producing insulin using genetically modified bacteria, developing vaccines, creating drought-resistant crop varieties, and producing biofuels are all biotechnology applications.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `IMMUNISATION (vaccination) helps communities by creating:`,
    options: [
      "Drug resistance",
      "Herd immunity — when enough people in a population are immune, diseases cannot spread easily even to unvaccinated individuals",
      "Individual immunity only",
      "Problems with the immune system",
    ],
    correctAnswer: 1,
    explanation: `Herd immunity protects even those who cannot be vaccinated (infants, immunocompromised people) — when the majority is immune, the pathogen cannot find enough susceptible hosts to maintain a chain of transmission.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `OZONE LAYER DEPLETION is dangerous because:`,
    options: [
      "The ozone layer keeps Earth warm",
      "Ozone is a greenhouse gas",
      "The ozone layer absorbs harmful UV-B radiation — its depletion allows more UV to reach Earth's surface, increasing skin cancer, cataracts, and damage to marine ecosystems",
      "Ozone depletion cools the Earth",
    ],
    correctAnswer: 2,
    explanation: `The stratospheric ozone layer is Earth's UV shield. When it thins (especially over polar regions), more UV-B radiation reaches the surface — causing skin cancer, eye damage (cataracts), and harm to marine ecosystems (phytoplankton are UV-sensitive).`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `ACCURACY in measurement means:`,
    options: [
      "Taking many measurements",
      "Using an expensive instrument",
      "The measurement is close to the true value of what is being measured",
      "The same measurement is repeated consistently",
    ],
    correctAnswer: 2,
    explanation: `Accuracy is closeness to the true value; precision is consistency of repeated measurements. A measurement can be precise (consistent) but inaccurate (consistently wrong). Both accuracy and precision are important in scientific measurement.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `Which technology allows people in remote Jamaican communities to access EDUCATION without travelling?`,
    options: [
      "Fax machines",
      "Postal services",
      "Online learning platforms and educational apps — delivered via internet and mobile devices",
      "Radio only",
    ],
    correctAnswer: 2,
    explanation: `Digital technology has democratised education: internet connectivity and mobile devices allow students in remote areas to access quality educational content, video lessons, and interactive learning resources previously only available in urban centres.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy6MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy6Questions : g5ScEasy6Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 6</CardTitle>
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
              <p className="text-slate-600">Science Easy 6</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 6</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
