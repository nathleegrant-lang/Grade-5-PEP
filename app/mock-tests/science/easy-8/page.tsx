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

const g5ScEasy8Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Plants",
    question: `Which of the following is needed for SEED GERMINATION?`,
    options: [
      "Fertiliser, salt water, and light",
      "Water, warmth, and oxygen",
      "Soil, insects, and fertiliser",
      "Light, cold temperature, and salt",
    ],
    correctAnswer: 1,
    explanation: `Seeds need water (to activate enzymes), warmth (for chemical reactions), and oxygen (for aerobic respiration to power growth) to germinate. Light is not essential at the germination stage.`
  },
  {
    id: 2,
    type: "living",
    skill: "Food Chains",
    question: `Which of the following is a CARNIVORE?`,
    options: [
      "Cow",
      "Elephant",
      "Eagle",
      "Goat",
    ],
    correctAnswer: 2,
    explanation: `Carnivores eat only other animals. Eagles prey on fish, small mammals, and birds — they are carnivores. Cows, elephants, and goats eat plants (herbivores).`
  },
  {
    id: 3,
    type: "living",
    skill: "Classification",
    question: `Which of the following animals is an ARACHNID?`,
    options: [
      "Ant",
      "Mosquito",
      "Spider",
      "Centipede",
    ],
    correctAnswer: 2,
    explanation: `Arachnids have eight legs and two main body parts. Spiders are arachnids. Ants and mosquitoes are insects (six legs); centipedes are myriapods.`
  },
  {
    id: 4,
    type: "living",
    skill: "Human Body",
    question: `The HEART beats approximately how many times per minute in a healthy resting adult?`,
    options: [
      "10–20 times",
      "30–40 times",
      "60–100 times",
      "150–200 times",
    ],
    correctAnswer: 2,
    explanation: `A healthy adult heart beats approximately 60–100 times per minute at rest, pumping blood continuously through approximately 100,000 km of blood vessels.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A duck's WATERPROOF feathers are an adaptation that helps by:`,
    options: [
      "Keeping the duck cool in summer",
      "Reducing flight speed",
      "Preventing water from soaking in and weighing the duck down — allowing it to remain buoyant",
      "Attracting a mate",
    ],
    correctAnswer: 2,
    explanation: `Ducks preen their feathers with oil from a gland near their tail. This oily coating repels water (waterproofing), keeping feathers dry and the bird buoyant and insulated.`
  },
  {
    id: 6,
    type: "living",
    skill: "Ecosystems",
    question: `An organism that both eats plants and animals is called an:`,
    options: [
      "Herbivore",
      "Carnivore",
      "Omnivore",
      "Decomposer",
    ],
    correctAnswer: 2,
    explanation: `Omnivores eat both plants and animals — examples include humans, bears, pigs, and crows. This flexibility gives them access to a wide range of food sources.`
  },
  {
    id: 7,
    type: "living",
    skill: "Life Cycles",
    question: `Which stage in a butterfly's life cycle causes the MOST damage to crops?`,
    options: [
      "Egg",
      "Pupa",
      "Larva (caterpillar)",
      "Adult butterfly",
    ],
    correctAnswer: 2,
    explanation: `Caterpillars (larvae) are voracious feeders — eating leaves and crops to fuel their rapid growth. Adult butterflies feed mostly on nectar and do minimal crop damage.`
  },
  {
    id: 8,
    type: "living",
    skill: "Plants",
    question: `The function of PETALS in flowers is primarily to:`,
    options: [
      "Produce pollen",
      "Absorb water",
      "Attract pollinators (insects and birds) with colour and scent",
      "Store food",
    ],
    correctAnswer: 2,
    explanation: `Bright, often scented petals attract pollinators — insects, birds, and bats that will transfer pollen between flowers, enabling fertilisation and seed production.`
  },
  {
    id: 9,
    type: "living",
    skill: "Classification",
    question: `Which of the following is classified as a MAMMAL?`,
    options: [
      "Frog",
      "Turtle",
      "Bat",
      "Iguana",
    ],
    correctAnswer: 2,
    explanation: `Bats are the only mammals capable of true flight. Despite their wings, they are mammals: warm-blooded, covered in fur, give birth to live young, and nurse them with milk.`
  },
  {
    id: 10,
    type: "living",
    skill: "Human Body",
    question: `The DIAPHRAGM is a dome-shaped muscle that controls:`,
    options: [
      "Digestion",
      "Heart rate",
      "Breathing — contracting to draw air into the lungs and relaxing to push it out",
      "Blood pressure",
    ],
    correctAnswer: 2,
    explanation: `The diaphragm is the primary breathing muscle. When it contracts, it flattens and increases chest volume (air enters); when it relaxes, the chest volume decreases (air leaves).`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `In a SOLID, how are the particles arranged compared to a GAS?`,
    options: [
      "Randomly and far apart",
      "In layers only",
      "Tightly packed together in an ordered arrangement, with fixed positions",
      "In clusters floating freely",
    ],
    correctAnswer: 2,
    explanation: `Solid particles are closely packed in regular, ordered arrangements, held together by strong intermolecular forces. They vibrate in place but cannot move freely — giving solids their fixed shape.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Changes of State",
    question: `What happens to a substance's MASS when it changes state (e.g., ice melts to water)?`,
    options: [
      "Mass increases as it melts",
      "Mass decreases as it melts",
      "Mass stays the same — change of state only rearranges particles, it does not create or destroy matter",
      "Mass depends on the substance",
    ],
    correctAnswer: 2,
    explanation: `Conservation of mass: the mass of a substance is unchanged during a change of state. Melting, boiling, condensing, and freezing only change particle arrangement, not the amount of matter.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Forces",
    question: `Which of these is an example of a CONTACT force?`,
    options: [
      "Gravity",
      "Magnetism (acting at a distance)",
      "The push from a hand on a door",
      "Static electricity attracting paper",
    ],
    correctAnswer: 2,
    explanation: `Contact forces require physical contact between objects. Pushing a door involves direct contact. Gravity, magnetism, and static electricity are non-contact forces — they act at a distance.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Energy",
    question: `A STRETCHED RUBBER BAND has which type of potential energy?`,
    options: [
      "Gravitational potential energy",
      "Chemical potential energy",
      "Elastic potential energy — stored in the deformation of the band",
      "Nuclear energy",
    ],
    correctAnswer: 2,
    explanation: `Elastic potential energy is stored in deformed elastic materials (stretched or compressed springs, rubber bands, compressed air). When released, it converts to kinetic energy.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Electricity",
    question: `The VOLTAGE of a battery tells us:`,
    options: [
      "How long the battery will last",
      "The colour of the battery",
      "The electrical pressure (energy per unit charge) it provides to drive current through a circuit",
      "How many bulbs it can light",
    ],
    correctAnswer: 2,
    explanation: `Voltage (measured in Volts) is the electrical 'pressure' that drives current through a circuit. A higher voltage drives more current through the same resistance.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Light",
    question: `Which type of surface SCATTERS reflected light in all directions (diffuse reflection)?`,
    options: [
      "A mirror",
      "Polished metal",
      "A rough or matte surface — like paper, walls, or unpolished wood",
      "A window pane",
    ],
    correctAnswer: 2,
    explanation: `Rough surfaces cause diffuse reflection — incoming light reflects at many different angles because of microscopic surface irregularities. This is why we can see non-shiny objects from any angle.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Sound",
    question: `Sound waves are LONGITUDINAL waves. This means:`,
    options: [
      "They travel sideways like water waves",
      "The particles vibrate perpendicular to the direction of travel",
      "The particles vibrate parallel to the direction the wave travels — creating compressions and rarefactions",
      "They travel in circles",
    ],
    correctAnswer: 2,
    explanation: `In longitudinal waves, particle oscillation is parallel to (in the same direction as) wave propagation. Sound creates alternating compressions (high pressure) and rarefactions (low pressure) in the medium.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Magnetism",
    question: `A temporary magnet that is ONLY magnetic when electric current flows through it is called a(n):`,
    options: [
      "Permanent magnet",
      "Bar magnet",
      "Electromagnet",
      "Horseshoe magnet",
    ],
    correctAnswer: 2,
    explanation: `An electromagnet is made by wrapping a coil of wire around an iron core and passing current through it. It is magnetic while current flows and loses magnetism when the current stops.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Forces",
    question: `The PRINCIPLE OF MOMENTS states that for a balanced lever:`,
    options: [
      "All forces must point upward",
      "The fulcrum must be at the centre",
      "The sum of clockwise moments equals the sum of anticlockwise moments about the pivot",
      "There can be only one load",
    ],
    correctAnswer: 2,
    explanation: `The Principle of Moments: for a lever or see-saw in equilibrium, the total clockwise turning effect (moment) equals the total anticlockwise moment. Moment = force × perpendicular distance from pivot.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Simple Machines",
    question: `Scissors are an example of which type of simple machine?`,
    options: [
      "A lever with two blades",
      "A wedge only",
      "A combination of two levers joined at a fulcrum (pivot)",
      "An inclined plane",
    ],
    correctAnswer: 2,
    explanation: `Scissors are compound tools combining two class-1 levers joined at the fulcrum (the rivet). Force applied to the handles amplifies the cutting force at the blades.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Weather",
    question: `Clouds are formed when:`,
    options: [
      "Rainwater dries up",
      "Wind blows dust into the air",
      "Water vapour in the atmosphere cools and condenses around tiny dust particles to form tiny water droplets or ice crystals",
      "The sun heats the ground",
    ],
    correctAnswer: 2,
    explanation: `Cloud formation: warm moist air rises, cools with altitude, and when it reaches the dew point, water vapour condenses on tiny particles (dust, pollen, sea salt) to form the tiny droplets that make up clouds.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Solar System",
    question: `The ASTEROID BELT is located between:`,
    options: [
      "Earth and Mars",
      "Mars and Jupiter",
      "Jupiter and Saturn",
      "Saturn and Uranus",
    ],
    correctAnswer: 1,
    explanation: `The asteroid belt is a region of space between Mars and Jupiter containing millions of rocky objects (asteroids). It may represent material that failed to form a planet due to Jupiter's gravity.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Rocks",
    question: `Which rock type is most likely to contain FOSSILS?`,
    options: [
      "Granite (igneous)",
      "Marble (metamorphic)",
      "Basalt (igneous)",
      "Limestone (sedimentary)",
    ],
    correctAnswer: 3,
    explanation: `Fossils form when organisms are buried in sediment that hardens into sedimentary rock. Limestone often contains abundant marine fossils (shells, corals). The high heat/pressure of igneous and metamorphic formation destroys fossils.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Water Cycle",
    question: `RUNOFF in the water cycle refers to:`,
    options: [
      "Water that evaporates from roads",
      "Rain that falls directly into the ocean",
      "Water that flows across the surface of the land into streams and rivers",
      "Water that soaks into the ground",
    ],
    correctAnswer: 2,
    explanation: `Surface runoff is precipitation that flows over land into streams and rivers. The amount depends on rainfall intensity, soil saturation, and land cover (forests reduce runoff; paved surfaces increase it).`
  },
  {
    id: 25,
    type: "earth",
    skill: "Soil",
    question: `OVERGRAZING of land causes:`,
    options: [
      "Improved soil quality",
      "Better crop growth",
      "Vegetation removal and soil compaction — leading to erosion, reduced fertility, and eventually desertification",
      "No harm to soil",
    ],
    correctAnswer: 2,
    explanation: `Overgrazing removes vegetation that protects and enriches soil. Hooves compact soil (reducing infiltration), and exposed soil erodes rapidly. The result is degraded, less productive land.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Natural Resources",
    question: `Which of the following is an example of CONSERVATION?`,
    options: [
      "Using as much electricity as possible",
      "Cutting down all trees for profit",
      "Switching off lights when leaving a room and recycling paper",
      "Buying more than you need",
    ],
    correctAnswer: 2,
    explanation: `Conservation means using resources carefully and efficiently — reducing waste, reusing items, recycling materials, and protecting natural environments. Simple actions like switching off lights conserve electrical energy.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Earth's Structure",
    question: `Where do MOST EARTHQUAKES AND VOLCANOES occur?`,
    options: [
      "Randomly anywhere on Earth",
      "Only in cold climates",
      "At the boundaries of tectonic plates — where plates collide, separate, or slide past each other",
      "Only in the tropics",
    ],
    correctAnswer: 2,
    explanation: `The vast majority of earthquakes and volcanoes are concentrated at tectonic plate boundaries — particularly the 'Ring of Fire' around the Pacific. Jamaica is near the boundary between the Caribbean and North American plates.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Moon",
    question: `A LUNAR ECLIPSE occurs when:`,
    options: [
      "The Moon passes between Earth and the Sun",
      "Clouds cover the Moon",
      "Earth passes between the Sun and Moon — Earth's shadow falls on the Moon, making it appear dark red",
      "The Moon moves too far from Earth",
    ],
    correctAnswer: 2,
    explanation: `During a lunar eclipse, Earth is between the Sun and Moon — Earth's shadow falls on the Moon. Some red-orange sunlight refracted through Earth's atmosphere reaches the Moon, giving it a reddish glow ('blood moon').`
  },
  {
    id: 29,
    type: "earth",
    skill: "Atmosphere",
    question: `NITROGEN is the most abundant gas in Earth's atmosphere. It makes up approximately:`,
    options: [
      "21% of the atmosphere",
      "50% of the atmosphere",
      "78% of the atmosphere",
      "99% of the atmosphere",
    ],
    correctAnswer: 2,
    explanation: `Nitrogen (N2) makes up approximately 78% of Earth's atmosphere. Oxygen is about 21%. Nitrogen is relatively inert and is essential for plant growth (in fixed forms like nitrates).`
  },
  {
    id: 30,
    type: "earth",
    skill: "Natural Disasters",
    question: `The RICHTER SCALE measures:`,
    options: [
      "The height of ocean waves",
      "Rainfall intensity",
      "The magnitude (energy released) of an earthquake",
      "Wind speed during hurricanes",
    ],
    correctAnswer: 2,
    explanation: `The Richter scale (and the more modern moment magnitude scale) measures the energy released by an earthquake. A magnitude 6.0 earthquake releases approximately 31 times more energy than a 5.0.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `A student observes that plants near a window grow faster. She wants to test whether LIGHT INTENSITY affects growth. What is the BEST hypothesis?`,
    options: [
      "Plants grow because they want to",
      "All plants grow at the same rate",
      "If light intensity increases, plant growth rate will increase — more light provides more energy for photosynthesis, supporting faster growth",
      "Plants grow faster in the dark",
    ],
    correctAnswer: 2,
    explanation: `This hypothesis is based on understanding (more light = more photosynthesis energy), is specific (light intensity), is measurable (growth rate), and is testable. It follows the established relationship between light and photosynthesis.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Technology",
    question: `SOLAR PANELS convert light energy into electricity through the:`,
    options: [
      "Combustion process",
      "Condensation process",
      "Photovoltaic effect — when photons strike semiconductor material, they release electrons that create an electric current",
      "Magnetic induction process",
    ],
    correctAnswer: 2,
    explanation: `The photovoltaic effect (discovered 1839, by Becquerel) occurs when photons knock electrons loose in semiconductor materials (typically silicon). These free electrons create an electric current when channelled through a circuit.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Health",
    question: `The RESPIRATORY SYSTEM and CIRCULATORY SYSTEM work together to:`,
    options: [
      "Digest food and absorb nutrients",
      "Control body temperature",
      "Deliver oxygen to all body cells and remove carbon dioxide — the lungs add O2 to blood; the heart pumps oxygenated blood to cells; cells use O2 and produce CO2; blood carries CO2 back to lungs",
      "Produce hormones",
    ],
    correctAnswer: 2,
    explanation: `These two systems are intimately linked: lungs oxygenate blood and remove CO2; heart circulates that blood to every cell; cells exchange gases with blood. Disruption of either system affects the other immediately.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Environment",
    question: `ACID RAIN harms FORESTS by:`,
    options: [
      "Making trees grow faster",
      "Providing extra minerals",
      "Acidifying soil (dissolving essential nutrients), damaging leaf surfaces, and killing microorganisms in soil that trees depend on — weakening and eventually killing trees",
      "Only harming aquatic ecosystems",
    ],
    correctAnswer: 2,
    explanation: `Acid rain damages forests through multiple pathways: soil acidification leaches calcium and magnesium (essential nutrients), aluminium becomes soluble in acid soil and is toxic to roots, leaves are directly damaged, and soil microbiomes are disrupted.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Scientific Method",
    question: `If the results of an experiment are RELIABLE, it means:`,
    options: [
      "The experiment proved the hypothesis",
      "The results are exactly what was expected",
      "The same results are obtained when the experiment is repeated — consistency indicates the findings are not due to chance or error",
      "The results are the most important ever collected",
    ],
    correctAnswer: 2,
    explanation: `Reliability is the repeatability of results. If the same experiment consistently produces the same results (by the same or different researchers), the findings are reliable — they reflect a real phenomenon, not a chance occurrence.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Technology",
    question: `THE DEVELOPMENT OF VACCINES against diseases like smallpox has:`,
    options: [
      "Had no significant impact",
      "Made diseases more common",
      "Saved hundreds of millions of lives — smallpox was eradicated globally in 1980, and many other deadly diseases have been dramatically reduced through vaccination campaigns",
      "Only helped wealthy countries",
    ],
    correctAnswer: 2,
    explanation: `Vaccines are among history's most impactful public health technologies. Smallpox killed over 300 million people in the 20th century before vaccination eradicated it. Polio, measles, and other deadly diseases have been dramatically reduced by vaccination.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Health",
    question: `SLEEP is important for health because:`,
    options: [
      "It is simply a habit with no biological function",
      "It wastes time",
      "During sleep, the body repairs tissues, consolidates memories, regulates hormones, strengthens the immune system, and restores mental function — essential for physical and cognitive health",
      "Only young children need adequate sleep",
    ],
    correctAnswer: 2,
    explanation: `Sleep is biologically essential: tissue repair and growth hormone release peak during deep sleep; memory consolidation (transferring short-term to long-term memory) occurs during REM sleep; immune function, metabolism, and mood are all impaired by insufficient sleep.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environment",
    question: `PLASTIC POLLUTION is a serious environmental problem because:`,
    options: [
      "Plastics decompose very quickly",
      "Plastic is food for marine animals",
      "Most plastics do not biodegrade — they persist in the environment for hundreds of years, fragmenting into microplastics that enter food chains, harm wildlife, and contaminate water and soil",
      "Plastic only affects land ecosystems",
    ],
    correctAnswer: 2,
    explanation: `Plastic pollution is a global crisis: most plastics resist biodegradation; they accumulate in oceans, break down into harmful microplastics ingested by marine organisms, and contaminate food chains (including human food). An estimated 8 million tonnes enter oceans annually.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Scientific Method",
    question: `A GOOD SCIENTIFIC QUESTION must be:`,
    options: [
      "Opinion-based and personal",
      "Already answered in textbooks",
      "Testable through observation or experiment and specific enough to design a clear investigation",
      "Very simple with an obvious answer",
    ],
    correctAnswer: 2,
    explanation: `Good scientific questions are testable (investigations can be designed to answer them), specific (clear enough to control variables), and novel (adding to knowledge). 'Does music affect plant growth?' is testable; 'Is music nice?' is not.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Technology",
    question: `ROBOTICS technology is used in which of the following applications?`,
    options: [
      "Only in science fiction",
      "Only for entertainment",
      "Manufacturing (car assembly), surgery (robotic-assisted surgery), exploration (Mars rovers), agriculture (crop monitoring), and dangerous environments (nuclear cleanup)",
      "Only in wealthy countries",
    ],
    correctAnswer: 2,
    explanation: `Robots perform tasks across many domains: manufacturing (precision, speed), surgery (minimally invasive procedures), space/ocean exploration (where humans cannot safely go), agriculture (precision farming), and hazardous environments.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "plants, animals, ecosystems, classification, cells, adaptation, human body" },
  { type: "physical" as const,   label: "Physical Science",         note: "forces, energy, light, sound, electricity, magnetism, matter & states" },
  { type: "earth" as const,      label: "Earth Science",            note: "weather, climate, rocks, soil, solar system, natural resources, Earth's structure" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, technology in society, health, environment, innovations" },
]

export default function G5ScEasy8MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScEasy8Questions : g5ScEasy8Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Easy 8</CardTitle>
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
              <p className="text-slate-600">Science Easy 8</p>
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
            <div><h1 className="text-lg font-bold">Science Easy 8</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
