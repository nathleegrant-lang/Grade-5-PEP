"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quiz, Question } from "@/components/quiz"
import { Leaf, Atom, Zap, Globe2, ArrowLeft, Play, ClipboardCheck } from "lucide-react"
import Link from "next/link"

const topics = [
  {
    id: "living-things",
    icon: Leaf,
    title: "Living Things",
    description: "Explore plants, animals, ecosystems, and how living organisms interact with their environment.",
    color: "bg-[#22c55e]",
    content: {
      overview: "Living things include plants, animals, and microorganisms. In Grade 5, you will learn about the characteristics of living things, life cycles, food chains, and how organisms adapt to their environments.",
      keyPoints: [
        "Living things grow, reproduce, respond to stimuli, and need food and water",
        "Plants make their own food through photosynthesis using sunlight, water, and carbon dioxide",
        "Food chains show how energy moves from producers to consumers to decomposers",
        "Ecosystems include all living and non-living things in an area",
        "Animals adapt to their environments through physical features and behaviors"
      ],
      example: {
        title: "Food Chain Example",
        text: "Sun → Grass → Grasshopper → Frog → Snake → Hawk\n\nThe sun provides energy to grass (producer). The grasshopper (primary consumer) eats the grass. The frog (secondary consumer) eats the grasshopper. The snake (tertiary consumer) eats the frog. The hawk (apex predator) eats the snake.",
        questionPrompt: "What would happen if all the frogs disappeared?",
        answer: "If frogs disappeared, grasshopper populations would increase (no predator), and snake populations would decrease (no food). This shows how all parts of a food chain are connected."
      }
    },
    questions: [
      {
        id: 1,
        question: "Which of the following is NOT a characteristic of all living things?",
        options: ["Growth", "Reproduction", "Movement from place to place", "Response to stimuli"],
        correctAnswer: 2,
        explanation: "While many living things can move, plants and some animals (like corals) cannot move from place to place. All living things do grow, reproduce, and respond to stimuli."
      },
      {
        id: 2,
        question: "What do plants need to carry out photosynthesis?",
        options: ["Sunlight, oxygen, and soil", "Sunlight, water, and carbon dioxide", "Water, oxygen, and soil", "Sunlight, food, and water"],
        correctAnswer: 1,
        explanation: "Plants need sunlight, water, and carbon dioxide for photosynthesis. They produce oxygen and glucose (sugar) as products."
      },
      {
        id: 3,
        question: "In a food chain, what is the role of a decomposer?",
        options: ["To produce food using sunlight", "To hunt other animals", "To break down dead organisms", "To eat only plants"],
        correctAnswer: 2,
        explanation: "Decomposers like fungi and bacteria break down dead organisms and return nutrients to the soil."
      },
      {
        id: 4,
        question: "A cactus has thick stems that store water. This is an example of:",
        options: ["Migration", "Hibernation", "Adaptation", "Reproduction"],
        correctAnswer: 2,
        explanation: "This is an adaptation. The cactus has evolved thick stems to store water in dry desert environments."
      },
      {
        id: 5,
        question: "Which organism is a producer in a food chain?",
        options: ["Lion", "Grass", "Rabbit", "Mushroom"],
        correctAnswer: 1,
        explanation: "Grass is a producer because it makes its own food through photosynthesis. Lions and rabbits are consumers, and mushrooms are decomposers."
      }
    ] as Question[]
  },
  {
    id: "matter",
    icon: Atom,
    title: "Matter & Materials",
    description: "Discover the properties of matter, states of matter, and how materials change.",
    color: "bg-[#0d9488]",
    content: {
      overview: "Matter is anything that has mass and takes up space. Everything around us is made of matter. In Grade 5, you will learn about the three states of matter, physical and chemical changes, and properties of different materials.",
      keyPoints: [
        "Three states of matter: solid (definite shape and volume), liquid (definite volume, takes shape of container), gas (no definite shape or volume)",
        "Physical changes change appearance but not the substance itself (cutting, melting, freezing)",
        "Chemical changes create new substances (burning, rusting, cooking)",
        "Properties of matter: mass, volume, density, hardness, flexibility",
        "Matter can change states when heated or cooled (ice → water → steam)"
      ],
      example: {
        title: "Physical vs Chemical Change",
        text: "Physical Change: Ice melting into water\n- The water is still H₂O, just in a different form\n- Can be reversed by freezing\n\nChemical Change: Paper burning\n- Creates new substances (ash, smoke, carbon dioxide)\n- Cannot be reversed",
        questionPrompt: "Is dissolving sugar in water a physical or chemical change?",
        answer: "Dissolving sugar in water is a physical change. The sugar molecules spread out in the water but don't change into a new substance. If you evaporate the water, the sugar remains."
      }
    },
    questions: [
      {
        id: 1,
        question: "Which state of matter has no definite shape or volume?",
        options: ["Solid", "Liquid", "Gas", "All of the above"],
        correctAnswer: 2,
        explanation: "Gases have no definite shape or volume. They expand to fill their container completely."
      },
      {
        id: 2,
        question: "Which of the following is a CHEMICAL change?",
        options: ["Cutting paper", "Melting ice", "Burning wood", "Dissolving salt in water"],
        correctAnswer: 2,
        explanation: "Burning wood is a chemical change because it creates new substances (ash, smoke, gases) that cannot be changed back to wood."
      },
      {
        id: 3,
        question: "What happens to water molecules when water evaporates?",
        options: ["They get bigger", "They move faster and spread apart", "They disappear", "They stick together"],
        correctAnswer: 1,
        explanation: "When water evaporates, the molecules gain energy, move faster, and spread apart to form water vapor (gas)."
      },
      {
        id: 4,
        question: "Which property of matter describes how much space an object takes up?",
        options: ["Mass", "Density", "Volume", "Weight"],
        correctAnswer: 2,
        explanation: "Volume measures how much space an object takes up. Mass measures the amount of matter in an object."
      },
      {
        id: 5,
        question: "Iron turning into rust is an example of:",
        options: ["Evaporation", "Physical change", "Chemical change", "Condensation"],
        correctAnswer: 2,
        explanation: "Rusting is a chemical change. Iron combines with oxygen and water to form a new substance called iron oxide (rust)."
      }
    ] as Question[]
  },
  {
    id: "energy",
    icon: Zap,
    title: "Energy & Forces",
    description: "Learn about different forms of energy, simple machines, and forces in everyday life.",
    color: "bg-[#f59e0b]",
    content: {
      overview: "Energy is the ability to do work or cause change. Forces are pushes or pulls that can change the motion of objects. In Grade 5, you will learn about different forms of energy, how energy can be transformed, and how simple machines make work easier.",
      keyPoints: [
        "Forms of energy: heat, light, sound, electrical, mechanical, chemical",
        "Energy can be transformed from one form to another (electrical → light in a bulb)",
        "Forces can make objects start moving, stop, speed up, slow down, or change direction",
        "Friction is a force that opposes motion between two surfaces",
        "Simple machines: lever, pulley, wheel and axle, inclined plane, wedge, screw"
      ],
      example: {
        title: "Energy Transformation",
        text: "When you turn on a flashlight:\n\nChemical energy (in batteries)\n↓\nElectrical energy (flows through wires)\n↓\nLight energy (bulb lights up) + Heat energy (bulb gets warm)",
        questionPrompt: "What energy transformations happen when you clap your hands?",
        answer: "Chemical energy in your muscles transforms to mechanical energy (movement of hands) which transforms to sound energy (clapping noise) and heat energy (hands may feel warm)."
      }
    },
    questions: [
      {
        id: 1,
        question: "Which form of energy is stored in food?",
        options: ["Light energy", "Sound energy", "Chemical energy", "Electrical energy"],
        correctAnswer: 2,
        explanation: "Food contains chemical energy. When we eat, our bodies break down food and release this energy for our activities."
      },
      {
        id: 2,
        question: "What type of simple machine is a ramp?",
        options: ["Lever", "Pulley", "Inclined plane", "Wedge"],
        correctAnswer: 2,
        explanation: "A ramp is an inclined plane. It makes it easier to move objects to a higher level by reducing the force needed."
      },
      {
        id: 3,
        question: "Which force causes a ball rolling on grass to slow down?",
        options: ["Gravity", "Magnetism", "Friction", "Air pressure"],
        correctAnswer: 2,
        explanation: "Friction between the ball and the grass opposes the ball's motion, causing it to slow down."
      },
      {
        id: 4,
        question: "A light bulb transforms electrical energy into:",
        options: ["Light energy only", "Heat energy only", "Light and heat energy", "Sound energy"],
        correctAnswer: 2,
        explanation: "A light bulb transforms electrical energy into both light energy (the light we see) and heat energy (the bulb gets warm)."
      },
      {
        id: 5,
        question: "Which simple machine is used to lift a flag on a pole?",
        options: ["Lever", "Pulley", "Wedge", "Screw"],
        correctAnswer: 1,
        explanation: "A pulley is used to lift a flag. It changes the direction of the force, allowing you to pull down to raise the flag up."
      }
    ] as Question[]
  },
  {
    id: "earth-space",
    icon: Globe2,
    title: "Earth & Space",
    description: "Study weather patterns, the solar system, and Earth's natural resources.",
    color: "bg-[#3b82f6]",
    content: {
      overview: "Earth science helps us understand our planet and the universe beyond. In Grade 5, you will learn about the water cycle, weather and climate, the solar system, and how to protect Earth's natural resources.",
      keyPoints: [
        "The water cycle: evaporation, condensation, precipitation, collection",
        "Weather is daily conditions; climate is average weather over long periods",
        "The solar system has 8 planets orbiting the Sun",
        "Earth rotates on its axis (causes day/night) and revolves around the Sun (causes seasons)",
        "Natural resources can be renewable (water, wind) or non-renewable (oil, coal)"
      ],
      example: {
        title: "The Water Cycle",
        text: "1. Evaporation: Sun heats water in oceans, lakes, rivers → water vapor rises\n2. Condensation: Water vapor cools in atmosphere → forms clouds\n3. Precipitation: Water droplets in clouds combine → fall as rain, snow, sleet\n4. Collection: Water collects in oceans, lakes, rivers → cycle repeats",
        questionPrompt: "Where does the energy for the water cycle come from?",
        answer: "The Sun provides the energy that drives the water cycle. The Sun's heat causes water to evaporate from bodies of water."
      }
    },
    questions: [
      {
        id: 1,
        question: "What process in the water cycle turns liquid water into water vapor?",
        options: ["Condensation", "Precipitation", "Evaporation", "Collection"],
        correctAnswer: 2,
        explanation: "Evaporation is when liquid water heats up and turns into water vapor (gas) that rises into the atmosphere."
      },
      {
        id: 2,
        question: "What causes day and night on Earth?",
        options: ["Earth revolving around the Sun", "Earth rotating on its axis", "The Moon blocking the Sun", "Clouds covering the Sun"],
        correctAnswer: 1,
        explanation: "Earth rotating on its axis causes day and night. The side facing the Sun has day, while the opposite side has night."
      },
      {
        id: 3,
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mars", "Mercury", "Earth"],
        correctAnswer: 2,
        explanation: "Mercury is the closest planet to the Sun, followed by Venus, Earth, and Mars."
      },
      {
        id: 4,
        question: "Which of the following is a NON-RENEWABLE resource?",
        options: ["Solar energy", "Wind", "Coal", "Water"],
        correctAnswer: 2,
        explanation: "Coal is non-renewable because it takes millions of years to form and cannot be replaced quickly once used."
      },
      {
        id: 5,
        question: "What forms when water vapor cools and condenses in the atmosphere?",
        options: ["Rain", "Clouds", "Rivers", "Oceans"],
        correctAnswer: 1,
        explanation: "When water vapor cools in the atmosphere, it condenses to form tiny water droplets that make up clouds."
      }
    ] as Question[]
  }
]

export default function SciencePage() {
  const [selectedTopic, setSelectedTopic] = useState<typeof topics[0] | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)

  if (selectedTopic) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <section className={`${selectedTopic.color} text-white py-8 md:py-12`}>
            <div className="max-w-6xl mx-auto px-4">
              <Button
                variant="ghost"
                onClick={() => { setSelectedTopic(null); setShowQuiz(false) }}
                className="text-white hover:bg-white/20 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Topics
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <selectedTopic.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{selectedTopic.title}</h1>
                  <p className="text-white/80">{selectedTopic.description}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex gap-4 mb-8">
              <Button
                onClick={() => setShowQuiz(false)}
                variant={!showQuiz ? "default" : "outline"}
                className={!showQuiz ? "bg-[#0d4a5f]" : ""}
              >
                Learn
              </Button>
              <Button
                onClick={() => setShowQuiz(true)}
                variant={showQuiz ? "default" : "outline"}
                className={showQuiz ? "bg-[#0d9488]" : ""}
              >
                <Play className="w-4 h-4 mr-2" />
                Practice Quiz
              </Button>
            </div>

            {!showQuiz ? (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Overview</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedTopic.content.overview}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Key Points to Remember</h2>
                    <ul className="space-y-3">
                      {selectedTopic.content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#0d9488]">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-[#0d9488] mb-4">{selectedTopic.content.example.title}</h2>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-line">{selectedTopic.content.example.text}</p>
                    </div>
                    <p className="font-medium text-[#1e3a5f] mb-2">{selectedTopic.content.example.questionPrompt}</p>
                    <p className="text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                      {selectedTopic.content.example.answer}
                    </p>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={() => setShowQuiz(true)}
                    size="lg"
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-white"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Ready to Practice? Take the Quiz!
                  </Button>
                </div>
              </div>
            ) : (
              <Quiz questions={selectedTopic.questions} title={selectedTopic.title} />
            )}
          </div>

          <ColorBar />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-[#0d9488] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Science
            </h1>
            <p className="text-lg text-teal-100">
              Explore living things, matter, energy, and the environment through interactive lessons
            </p>
          </div>
        </section>

        {/* Mock Test Banner */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/science/mock-test">
            <Card className="bg-gradient-to-r from-[#0d9488] to-[#059669] text-white hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <ClipboardCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Take the Mock PEP Test</h3>
                    <p className="text-white/80">45 minutes | 20 questions | Test your knowledge</p>
                  </div>
                </div>
                <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  Start Test
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2 text-center">Choose a Topic</h2>
          <p className="text-gray-600 mb-8 text-center">Select a topic to learn and practice</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <Card 
                key={topic.id} 
                className="border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${topic.color} flex items-center justify-center mb-4`}>
                    <topic.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {topic.description}
                  </p>
                  <Button variant="outline" className="w-full border-[#0d9488] text-[#0d9488] hover:bg-[#0d9488] hover:text-white">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <ColorBar />
      </main>
      <Footer />
    </div>
  )
}
