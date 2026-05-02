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

const g5ScEasy7Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `The process by which POLLEN is transferred from the male to the female part of a flower is called:`,
    options: [
      "Germination",
      "Photosynthesis",
      "Pollination",
      "Transpiration",
    ],
    correctAnswer: 2,
    explanation: `Pollination is the transfer of pollen from the anther (male) to the stigma (female) of a flower — the first step in sexual reproduction in flowering plants.`
  },
  {
    id: 2,
    type: "living",
    skill: "Classification",
    question: `Which of the following is a FISH?`,
    options: [
      "Whale",
      "Dolphin",
      "Shark",
      "Seal",
    ],
    correctAnswer: 2,
    explanation: `Sharks are fish — cold-blooded, gill-breathing vertebrates with scales. Whales, dolphins, and seals are all mammals (warm-blooded, lung-breathing, produce milk).`
  },
  {
    id: 3,
    type: "living",
    skill: "Food Chains",
    question: `In the food chain: algae → shrimp → small fish → large fish, the SMALL FISH is a:`,
    options: [
      "Producer",
      "Primary consumer",
      "Secondary consumer",
      "Tertiary consumer",
    ],
    correctAnswer: 2,
    explanation: `The small fish eats the shrimp (primary consumer), which ate the algae (producer). So the small fish is a secondary consumer — the third link in the chain.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The SMALL INTESTINE is responsible for:`,
    options: [
      "Storing food",
      "Producing bile",
      "Absorbing most of the nutrients from digested food into the bloodstream",
      "Removing water from waste",
    ],
    correctAnswer: 2,
    explanation: `The small intestine is where most digestion is completed and where nutrients (glucose, amino acids, fatty acids) are absorbed into the blood through its highly folded, villi-covered wall.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A cactus has SPINES instead of leaves. This adaptation helps because:`,
    options: [
      "Spines produce more food than leaves",
      "Spines attract insects",
      "Spines reduce water loss (large leaves would lose too much water) and protect the plant from animals",
      "Spines help the cactus reproduce",
    ],
    correctAnswer: 2,
    explanation: `Cactus spines are modified leaves — by reducing leaf surface area dramatically, the plant loses far less water through transpiration. They also deter herbivores from eating the water-storing stem.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `Which of the following correctly describes the role of a DECOMPOSER?`,
    options: [
      "It eats only plants",
      "It produces its own food",
      "It breaks down dead organisms and waste, returning nutrients to the soil",
      "It eats other animals",
    ],
    correctAnswer: 2,
    explanation: `Decomposers (bacteria, fungi) are nature's recyclers — they break down dead organic matter and release nutrients back into the soil and water, where producers can reuse them.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `Which of the following shows INCOMPLETE metamorphosis?`,
    options: [
      "Butterfly: egg → larva → pupa → adult",
      "Mosquito: egg → larva → pupa → adult",
      "Grasshopper: egg → nymph → adult",
      "Frog: egg → tadpole → froglet → adult",
    ],
    correctAnswer: 2,
    explanation: `Incomplete (partial) metamorphosis has only three stages: egg → nymph (looks like a small adult) → adult. No pupal stage. Grasshoppers, cockroaches, and dragonflies undergo incomplete metamorphosis.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `The PHLOEM vessels in a plant transport:`,
    options: [
      "Water from roots to leaves",
      "Glucose produced in leaves to the rest of the plant",
      "Oxygen produced in leaves",
      "Minerals from soil to roots",
    ],
    correctAnswer: 1,
    explanation: `Phloem transports dissolved sugars (glucose) made in the leaves by photosynthesis to other parts of the plant — roots, fruits, and growing tissue that need energy.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `Which kingdom includes organisms that are mainly decomposers and obtain nutrients by absorption?`,
    options: [
      "Animalia",
      "Plantae",
      "Fungi",
      "Protista",
    ],
    correctAnswer: 2,
    explanation: `Fungi (mushrooms, moulds, yeasts) are decomposers that cannot make their own food — they secrete enzymes to break down organic matter externally and absorb the nutrients.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The CEREBRUM in the brain is responsible for:`,
    options: [
      "Controlling heartbeat",
      "Regulating breathing only",
      "Higher brain functions: thinking, memory, language, consciousness, and voluntary movement",
      "Balance and coordination only",
    ],
    correctAnswer: 2,
    explanation: `The cerebrum is the largest part of the brain — it controls all conscious activities: thought, memory, decision-making, language, sensory processing, and voluntary movement.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `Ice, water, and water vapour are all examples of:`,
    options: [
      "Different substances",
      "Three different chemical compounds",
      "The same substance (H2O) in three different states of matter",
      "Mixtures of different gases",
    ],
    correctAnswer: 2,
    explanation: `Water can exist as solid (ice), liquid (water), and gas (water vapour/steam) — all the same H2O molecule in three different states, depending on temperature and pressure.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Forces",
    question: `When you push a shopping trolley, the force you apply is called the:`,
    options: [
      "Reaction force",
      "Applied force or push force",
      "Gravity",
      "Normal force",
    ],
    correctAnswer: 1,
    explanation: `An applied force is a deliberate push or pull exerted on an object. The push on a shopping trolley is the applied force that causes it to accelerate in the direction of the push.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Energy",
    question: `CHEMICAL ENERGY is stored in:`,
    options: [
      "Moving objects",
      "The sun's radiation",
      "Food, fuels, and batteries — released through chemical reactions like burning or respiration",
      "Compressed springs",
    ],
    correctAnswer: 2,
    explanation: `Chemical energy is stored in the bonds between atoms in molecules. It is released during chemical reactions: burning fuel, a battery driving a circuit, or the body breaking down food.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Electricity",
    question: `The unit of ELECTRICAL POWER is the:`,
    options: [
      "Volt",
      "Ampere",
      "Watt",
      "Newton",
    ],
    correctAnswer: 2,
    explanation: `Watt (W) is the unit of power — the rate at which energy is used or produced. Power = Voltage × Current. A 60W bulb uses 60 joules of electrical energy per second.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Light",
    question: `A SHADOW is formed when:`,
    options: [
      "Light passes through a transparent object",
      "Light is reflected off a shiny surface",
      "An opaque object blocks light — the blocked region receives no light and appears dark",
      "Light is refracted through water",
    ],
    correctAnswer: 2,
    explanation: `Shadows form when opaque objects block light — the area behind the object receives no direct light. The shadow's shape and size depend on the object's shape and the position of the light source.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Sound",
    question: `An ECHO is caused by:`,
    options: [
      "Sound being absorbed by soft surfaces",
      "Sound accelerating in certain materials",
      "The reflection of sound off a hard surface — the original sound returns to the listener after bouncing off the surface",
      "Sound changing pitch",
    ],
    correctAnswer: 2,
    explanation: `An echo is the reflection of sound waves off hard, flat surfaces (like cliffs, walls, large buildings). The original sound reaches the listener twice — directly and after reflection.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Magnetism",
    question: `What happens when you bring two NORTH POLES of magnets together?`,
    options: [
      "They attract each other",
      "They have no effect",
      "They repel each other — like poles always repel",
      "They cancel out completely",
    ],
    correctAnswer: 2,
    explanation: `Magnetic poles follow the rule: like poles repel, unlike (opposite) poles attract. Two north poles brought together experience a repelling force.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Forces",
    question: `UPTHRUST (buoyancy) is a force that acts on objects in a fluid. It acts:`,
    options: [
      "Downward — in the same direction as gravity",
      "Horizontally",
      "Upward — opposing gravity and enabling floating",
      "Only on metal objects",
    ],
    correctAnswer: 2,
    explanation: `Upthrust (buoyancy force) is the upward force exerted by a fluid on an object submerged in it. If upthrust equals or exceeds weight, the object floats; if less than weight, the object sinks.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Energy",
    question: `A HYDROELECTRIC POWER PLANT generates electricity by using:`,
    options: [
      "Solar panels",
      "Wind turbines",
      "Flowing water to spin turbines — converting kinetic energy of water into electrical energy",
      "Burning coal",
    ],
    correctAnswer: 2,
    explanation: `Hydroelectric plants use the kinetic energy of flowing or falling water to spin turbines connected to generators, converting mechanical energy into electrical energy — a renewable energy source.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `The MECHANICAL ADVANTAGE of a simple machine means it allows you to:`,
    options: [
      "Do less work overall",
      "Do work without any effort",
      "Use a smaller force to move a larger load (at the cost of moving over a greater distance)",
      "Do work faster always",
    ],
    correctAnswer: 2,
    explanation: `Mechanical advantage is the ratio of the load force to the effort force. A machine with MA > 1 lets you use less force to move a greater load — but you must apply that force over a greater distance.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `Which weather instrument measures RAINFALL?`,
    options: [
      "Thermometer",
      "Barometer",
      "Rain gauge",
      "Anemometer",
    ],
    correctAnswer: 2,
    explanation: `A rain gauge (pluviometer) collects and measures the depth of rainfall in a specific period. Simple gauges are cylinders with a measuring scale.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `Why does VENUS appear brighter than any star in the night sky?`,
    options: [
      "Venus produces more light than stars",
      "Venus is closer to Earth and reflects sunlight very effectively from its thick cloud cover",
      "Venus is the largest planet",
      "Venus has its own light source",
    ],
    correctAnswer: 1,
    explanation: `Venus is extremely bright because: it is relatively close to Earth; its thick clouds of sulphuric acid reflect approximately 70% of sunlight (highest albedo of any planet); and it appears close to the Sun in the sky.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `MARBLE is formed from LIMESTONE by:`,
    options: [
      "Cooling of lava",
      "Compression of sediment",
      "Heat and pressure transforming limestone (a sedimentary rock) into marble (a metamorphic rock)",
      "Erosion by water",
    ],
    correctAnswer: 2,
    explanation: `Marble is a classic metamorphic rock — formed when limestone (sedimentary, composed of calcium carbonate) is subjected to intense heat and pressure deep in the crust, recrystallising the calcite.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Water Cycle",
    question: `The WATER CYCLE is powered mainly by energy from:`,
    options: [
      "The Moon",
      "Earth's internal heat",
      "The Sun — its heat drives evaporation, which is the engine of the whole cycle",
      "Rainfall",
    ],
    correctAnswer: 2,
    explanation: `Solar energy drives the water cycle by powering evaporation — lifting water from oceans, lakes, and land into the atmosphere. Without solar energy, the cycle would stop.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Soil",
    question: `Which type of soil DRAINS water most quickly but holds nutrients POORLY?`,
    options: [
      "Clay soil",
      "Loam soil",
      "Sandy soil",
      "Silty soil",
    ],
    correctAnswer: 2,
    explanation: `Sandy soil has large particles with large spaces between them — water drains quickly but nutrients leach out easily. Clay has tiny particles that hold water and nutrients but drain poorly. Loam is the balanced ideal.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `The THREE R's of environmental conservation are:`,
    options: [
      "Read, Write, Recycle",
      "Reduce, Reuse, Recycle",
      "Replace, Renew, Refuse",
      "Remove, Replenish, Restore",
    ],
    correctAnswer: 1,
    explanation: `Reduce (use less), Reuse (use items multiple times), and Recycle (convert waste into new materials) are the three core strategies for reducing environmental impact and conserving resources.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `The process by which TECTONIC PLATES move apart and new ocean floor is created is called:`,
    options: [
      "Subduction",
      "Collision",
      "Volcanic eruption",
      "Sea-floor spreading",
    ],
    correctAnswer: 3,
    explanation: `Sea-floor spreading occurs at divergent plate boundaries (mid-ocean ridges) — plates pull apart, magma wells up, and new oceanic crust solidifies. This drives plate movement across the globe.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `During a FULL MOON, the Moon is:`,
    options: [
      "Between Earth and the Sun",
      "On the opposite side of Earth from the Sun — the entire face visible from Earth is fully illuminated by sunlight",
      "In Earth's shadow",
      "At its closest point to Earth",
    ],
    correctAnswer: 1,
    explanation: `A full moon occurs when Earth is between the Sun and Moon — the Sun fully illuminates the side of the Moon facing Earth. We see a complete bright disc.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `Earth's atmosphere protects life by:`,
    options: [
      "Creating hurricanes",
      "Producing ocean currents",
      "Absorbing harmful UV radiation (ozone layer), regulating temperature (greenhouse effect), and burning up meteors",
      "Only supplying oxygen",
    ],
    correctAnswer: 2,
    explanation: `The atmosphere has multiple protective functions: the ozone layer blocks harmful UV; greenhouse gases maintain life-sustaining temperatures; the atmosphere's friction burns up most meteors before they reach the surface.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `Which is a VOLCANIC HAZARD (danger from a volcano)?`,
    options: [
      "Flooding from heavy rain",
      "An earthquake under the sea",
      "Lava flows, ash fall, pyroclastic flows, and toxic gases emitted during eruption",
      "Strong winds from a cyclone",
    ],
    correctAnswer: 2,
    explanation: `Active volcanoes pose multiple hazards: molten lava burns and buries; volcanic ash can suffocate, collapse roofs, and disrupt aviation; pyroclastic flows are superheated gas and debris; toxic gases (SO2, CO2) are deadly.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `When a scientist FORMULATES a hypothesis, they should base it on:`,
    options: [
      "Personal feelings and preferences",
      "Random guesses",
      "Prior knowledge, observations, and logical reasoning — an educated prediction based on existing scientific understanding",
      "What they want to be true",
    ],
    correctAnswer: 2,
    explanation: `A hypothesis is an educated, evidence-based prediction — not a random guess. Good hypotheses are grounded in existing knowledge, follow logically from observations, and are testable through experimentation.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `The INTERNET OF THINGS (IoT) refers to:`,
    options: [
      "The network of human scientists",
      "Physical devices connected to the internet that collect and exchange data — smart appliances, sensors, wearables, that can be remotely monitored and controlled",
      "Only computers and phones",
      "Television programmes about technology",
    ],
    correctAnswer: 1,
    explanation: `IoT describes the growing network of physical objects ('things') embedded with sensors and internet connectivity — smart fridges, fitness trackers, weather sensors, traffic lights — enabling data collection and automated responses.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The ENDOCRINE SYSTEM controls body functions through:`,
    options: [
      "Electrical signals along nerves",
      "Physical exercise",
      "Chemical messengers (hormones) produced by glands and transported in the blood to target organs — regulating growth, metabolism, reproduction, and stress response",
      "Dietary nutrients only",
    ],
    correctAnswer: 2,
    explanation: `The endocrine system uses hormones as chemical messengers: insulin (blood sugar), adrenaline (stress response), growth hormone (development), oestrogen and testosterone (reproduction) — all carried by blood to their target organs.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `The GREENHOUSE EFFECT is NATURAL and NECESSARY because:`,
    options: [
      "It is caused by human activity",
      "It has no positive function",
      "Without any greenhouse effect, Earth would be too cold for life — greenhouse gases maintain temperatures that make life possible. The problem is ENHANCED greenhouse effect from excess human emissions",
      "It makes summers warmer",
    ],
    correctAnswer: 2,
    explanation: `The natural greenhouse effect keeps Earth approximately 33°C warmer than it would otherwise be — without it, Earth's average temperature would be -18°C and life as we know it couldn't exist. The problem is the enhanced effect from increasing human emissions.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `A student tests a hypothesis about plant growth. Her results do NOT support the hypothesis. She should:`,
    options: [
      "Ignore the results",
      "Change the data to fit the hypothesis",
      "Report the unsupported results honestly — negative results are valid science that may lead to revised understanding",
      "Repeat the experiment until the hypothesis is supported",
    ],
    correctAnswer: 2,
    explanation: `Scientific integrity requires reporting results honestly, even when they contradict the hypothesis. Negative results eliminate incorrect explanations and often lead to more accurate hypotheses. Fabricating or hiding data is scientific fraud.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `MRI (Magnetic Resonance Imaging) uses which principle?`,
    options: [
      "X-ray radiation",
      "Sound waves only",
      "Powerful magnetic fields and radio waves to create detailed images of soft tissues inside the body — particularly useful for brain, spinal cord, and joint imaging",
      "Visible light only",
    ],
    correctAnswer: 2,
    explanation: `MRI uses strong magnetic fields to align protons in body tissue, then radio waves to disrupt this alignment — measuring how protons return to alignment generates signals used to create detailed 3D images of soft tissue without radiation.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `Type 2 DIABETES is a disease where the body cannot properly regulate BLOOD GLUCOSE. Risk factors include:`,
    options: [
      "Being very active",
      "Eating mostly vegetables",
      "Poor diet (high sugar/refined carbohydrates), physical inactivity, and obesity — all manageable through lifestyle changes",
      "Only genetic inheritance",
    ],
    correctAnswer: 2,
    explanation: `Type 2 diabetes risk is strongly linked to modifiable lifestyle factors: unhealthy diet, physical inactivity, and obesity impair insulin sensitivity. Lifestyle changes (diet, exercise, weight loss) can prevent or manage the condition.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `NOISE POLLUTION can cause:`,
    options: [
      "Improved hearing",
      "Better sleep quality",
      "Hearing damage, stress, sleep disruption, and cardiovascular problems — prolonged exposure to loud noise has serious health consequences",
      "No health effects",
    ],
    correctAnswer: 2,
    explanation: `Noise pollution from traffic, industry, and recreational sources causes: hearing loss (from prolonged exposure above 85 dB), sleep disruption, increased stress hormones (cortisol), cardiovascular strain, and reduced concentration.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `In science, the word LAW (as in Newton's Laws of Motion) means:`,
    options: [
      "A rule that can be broken under special circumstances",
      "A court regulation that scientists must obey",
      "A description of a pattern observed in nature that is consistent and universal — what ALWAYS happens under specific conditions (unlike a theory, which explains WHY)",
      "A hypothesis that most scientists agree with",
    ],
    correctAnswer: 2,
    explanation: `A scientific law describes a consistent, universal pattern (e.g., objects accelerate when net force is applied). A theory explains WHY (e.g., Newton's theory of gravity explains WHY they accelerate). Laws describe; theories explain.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `ARTIFICIAL INTELLIGENCE (AI) refers to:`,
    options: [
      "Robots that look human",
      "Computers that can only do one task",
      "Computer systems that can perform tasks that typically require human intelligence — like pattern recognition, language processing, decision-making, and learning from data",
      "Only self-driving cars",
    ],
    correctAnswer: 2,
    explanation: `AI is the simulation of human cognitive processes by computer systems — learning (machine learning), reasoning, problem-solving, and perception. Applications range from voice assistants and medical diagnosis to climate modelling and financial systems.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy7MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy7Questions : g5ScEasy7Questions.slice(0, FREE_QUESTION_LIMIT)
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
        testName: "Easy 7",
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 7</CardTitle>
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
              <p className="text-slate-600">Science Easy 7</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 7</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
