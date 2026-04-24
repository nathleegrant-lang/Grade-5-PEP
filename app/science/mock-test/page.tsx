import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ColorBar } from "@/components/color-bar"
import { MockTest, MockTestQuestion } from "@/components/mock-test"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const scienceQuestions: MockTestQuestion[] = [
  // Living Things
  {
    id: 1,
    type: "multiple-choice",
    question: "In a food chain: Grass → Grasshopper → Frog → Snake → Hawk. Which organism is the secondary consumer?",
    options: [
      "Grass",
      "Grasshopper",
      "Frog",
      "Snake"
    ],
    correctAnswer: 2,
    explanation: "The secondary consumer is the organism that eats the primary consumer. The grasshopper (primary consumer) eats grass, and the frog eats the grasshopper, making the frog the secondary consumer.",
    points: 2
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "Which of the following is an example of a behavioural adaptation?",
    options: [
      "A cactus having thick stems to store water",
      "Birds migrating south for winter",
      "A polar bear having thick fur",
      "Fish having gills to breathe underwater"
    ],
    correctAnswer: 1,
    explanation: "Behavioural adaptations are actions animals take to survive. Migration is a behaviour birds do to find warmer climates and food. The other options are physical/structural adaptations.",
    points: 2
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "What is the process by which plants make their own food using sunlight called?",
    options: [
      "Respiration",
      "Digestion",
      "Photosynthesis",
      "Transpiration"
    ],
    correctAnswer: 2,
    explanation: "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose (food) and oxygen. It happens mainly in the leaves.",
    points: 2
  },
  {
    id: 4,
    type: "performance-task",
    question: "A scientist studied a pond ecosystem and found these organisms: algae, small fish, water beetles, herons, and tadpoles.\n\n(a) Arrange these organisms in a food chain, starting with the producer.\n(b) Explain what would happen to the ecosystem if all the small fish died from pollution.\n(c) Identify ONE producer and ONE consumer from the list.",
    correctAnswer: "(a) Algae → Tadpoles/Water beetles → Small fish → Herons. (b) If small fish died, herons would lose their food source and might die or move away. Tadpoles/beetles might increase in number without fish eating them. (c) Producer: Algae (makes its own food). Consumer: Any of the animals (they eat other organisms).",
    explanation: "This task tests your understanding of food chains, ecosystem relationships, and the impact of environmental changes on living things.",
    points: 6
  },
  // Matter and Materials
  {
    id: 5,
    type: "multiple-choice",
    question: "Which of the following is a CHEMICAL change?",
    options: [
      "Melting ice cream",
      "Cutting paper",
      "Burning wood",
      "Dissolving sugar in water"
    ],
    correctAnswer: 2,
    explanation: "Burning wood is a chemical change because new substances (ash, smoke, carbon dioxide) are formed and the change cannot be reversed. The other options are physical changes.",
    points: 2
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "What happens to the particles in a solid when it is heated and becomes a liquid?",
    options: [
      "The particles stop moving",
      "The particles move faster and spread apart",
      "The particles get smaller",
      "The particles stick closer together"
    ],
    correctAnswer: 1,
    explanation: "When heated, particles gain energy and move faster. This causes them to spread apart, changing the solid into a liquid. The particles themselves don't change size.",
    points: 2
  },
  {
    id: 7,
    type: "multiple-choice",
    question: "Which property of matter describes how much space an object takes up?",
    options: [
      "Mass",
      "Weight",
      "Volume",
      "Density"
    ],
    correctAnswer: 2,
    explanation: "Volume is the amount of space an object occupies. Mass is how much matter is in an object. Weight is the force of gravity on an object. Density is mass divided by volume.",
    points: 2
  },
  {
    id: 8,
    type: "multiple-choice",
    question: "What is the process called when a liquid changes directly into a gas?",
    options: [
      "Condensation",
      "Evaporation",
      "Freezing",
      "Sublimation"
    ],
    correctAnswer: 1,
    explanation: "Evaporation is when a liquid changes into a gas, usually when heated. Condensation is the opposite (gas to liquid). Sublimation is when a solid changes directly to gas.",
    points: 2
  },
  // Energy and Forces
  {
    id: 9,
    type: "multiple-choice",
    question: "Which simple machine is a ramp an example of?",
    options: [
      "Lever",
      "Pulley",
      "Inclined plane",
      "Wheel and axle"
    ],
    correctAnswer: 2,
    explanation: "A ramp is an inclined plane - a flat surface set at an angle. It makes it easier to move heavy objects up by spreading the work over a longer distance.",
    points: 2
  },
  {
    id: 10,
    type: "multiple-choice",
    question: "What type of energy does a moving bicycle have?",
    options: [
      "Potential energy",
      "Chemical energy",
      "Kinetic energy",
      "Thermal energy"
    ],
    correctAnswer: 2,
    explanation: "Kinetic energy is the energy of motion. Any moving object has kinetic energy. A bicycle at rest would have potential energy, but when moving, it has kinetic energy.",
    points: 2
  },
  {
    id: 11,
    type: "multiple-choice",
    question: "A student pushes a heavy box across the floor. Why does the box eventually stop moving?",
    options: [
      "The box runs out of energy",
      "Friction between the box and floor slows it down",
      "Gravity pulls the box down",
      "The air pushes the box backward"
    ],
    correctAnswer: 1,
    explanation: "Friction is a force that opposes motion between surfaces in contact. The friction between the box and floor acts against the motion, eventually stopping the box.",
    points: 2
  },
  {
    id: 12,
    type: "performance-task",
    question: "Look at this energy transformation: A solar panel on a roof collects sunlight and powers a fan that cools a room.\n\n(a) Identify the types of energy involved in this transformation.\n(b) Write out the energy transformation chain.\n(c) Explain why solar panels are considered a renewable energy source.",
    correctAnswer: "(a) Light/solar energy, electrical energy, kinetic/mechanical energy (and some sound/heat). (b) Light energy → Electrical energy → Kinetic energy. (c) Solar energy is renewable because the sun continuously provides energy and won't run out in our lifetime, unlike fossil fuels.",
    explanation: "This task tests your understanding of energy transformations and renewable versus non-renewable energy sources.",
    points: 6
  },
  // Earth and Space
  {
    id: 13,
    type: "multiple-choice",
    question: "What causes day and night on Earth?",
    options: [
      "The Earth revolving around the Sun",
      "The Earth rotating on its axis",
      "The Moon blocking the Sun",
      "The Sun moving around the Earth"
    ],
    correctAnswer: 1,
    explanation: "Day and night are caused by Earth's rotation on its axis. As Earth rotates, different parts face the Sun (day) or face away (night). One full rotation takes 24 hours.",
    points: 2
  },
  {
    id: 14,
    type: "multiple-choice",
    question: "Which of these correctly shows the order of planets from the Sun?",
    options: [
      "Mercury, Mars, Venus, Earth",
      "Mercury, Venus, Earth, Mars",
      "Venus, Mercury, Earth, Mars",
      "Earth, Venus, Mars, Mercury"
    ],
    correctAnswer: 1,
    explanation: "The correct order of the first four planets from the Sun is: Mercury (closest), Venus, Earth, Mars. A helpful phrase: 'My Very Eager Mother Just Served Us Nachos.'",
    points: 2
  },
  {
    id: 15,
    type: "multiple-choice",
    question: "In the water cycle, what is the process called when water vapour in clouds turns back into liquid water?",
    options: [
      "Evaporation",
      "Precipitation",
      "Condensation",
      "Collection"
    ],
    correctAnswer: 2,
    explanation: "Condensation is when water vapour cools and changes back into liquid water droplets, forming clouds. Precipitation is when water falls from clouds as rain, snow, etc.",
    points: 2
  },
  {
    id: 16,
    type: "multiple-choice",
    question: "What type of rock is formed when volcanic lava cools and hardens?",
    options: [
      "Sedimentary rock",
      "Metamorphic rock",
      "Igneous rock",
      "Limestone"
    ],
    correctAnswer: 2,
    explanation: "Igneous rock forms when molten rock (magma or lava) cools and solidifies. Examples include basalt and granite. Sedimentary forms from layers of sediment, and metamorphic from heat and pressure on existing rock.",
    points: 2
  },
  // Human Body
  {
    id: 17,
    type: "multiple-choice",
    question: "Which organ system is responsible for breaking down food into nutrients the body can use?",
    options: [
      "Respiratory system",
      "Circulatory system",
      "Digestive system",
      "Nervous system"
    ],
    correctAnswer: 2,
    explanation: "The digestive system breaks down food into nutrients. It includes the mouth, oesophagus, stomach, and intestines. The respiratory system handles breathing, and the circulatory system moves blood.",
    points: 2
  },
  {
    id: 18,
    type: "multiple-choice",
    question: "What is the main function of white blood cells?",
    options: [
      "To carry oxygen around the body",
      "To fight infections and diseases",
      "To help blood clot",
      "To carry nutrients to cells"
    ],
    correctAnswer: 1,
    explanation: "White blood cells are part of the immune system and fight infections by attacking bacteria, viruses, and other harmful invaders. Red blood cells carry oxygen.",
    points: 2
  },
  {
    id: 19,
    type: "multiple-choice",
    question: "Which gas do we breathe in that our body needs to survive?",
    options: [
      "Carbon dioxide",
      "Nitrogen",
      "Oxygen",
      "Hydrogen"
    ],
    correctAnswer: 2,
    explanation: "We breathe in oxygen, which our cells need to release energy from food. We breathe out carbon dioxide as a waste product. Air is mostly nitrogen, but we don't use it directly.",
    points: 2
  },
  {
    id: 20,
    type: "performance-task",
    question: "A student conducted an experiment to see how exercise affects heart rate. Here are the results:\n\n- Resting heart rate: 72 beats per minute\n- After 2 minutes of jogging: 110 beats per minute\n- After 5 minutes of rest: 80 beats per minute\n\n(a) Describe the pattern you observe in the data.\n(b) Explain why the heart rate increased during exercise.\n(c) Suggest one way to make this experiment more reliable.",
    correctAnswer: "(a) The heart rate increased during exercise and then decreased during rest, but didn't fully return to the original resting rate after 5 minutes. (b) During exercise, muscles need more oxygen and energy. The heart beats faster to pump more blood carrying oxygen to the muscles. (c) Repeat the experiment multiple times and calculate an average, use multiple students, or measure heart rate at more time intervals.",
    explanation: "This task tests your ability to analyze data, explain scientific concepts, and understand how to improve experimental methods.",
    points: 6
  }
]

export default function ScienceMockTestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/science" 
            className="inline-flex items-center text-[#0d9488] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Science
          </Link>

          <MockTest
            title="Science Mock PEP Test"
            subject="Science"
            description="This mock test covers the Grade 5 Science curriculum including living things, matter and materials, energy and forces, Earth and space, and the human body. Performance tasks require detailed explanations showing your scientific thinking."
            timeLimit={45}
            questions={scienceQuestions}
            passingScore={60}
          />
        </div>
      </main>

      <ColorBar />
      <Footer />
    </div>
  )
}
