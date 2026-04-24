import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ColorBar } from "@/components/color-bar"
import { MockTest, MockTestQuestion } from "@/components/mock-test"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const mathematicsQuestions: MockTestQuestion[] = [
  // Number Operations
  {
    id: 1,
    type: "multiple-choice",
    question: "Calculate: 48 ÷ 6 + 3 × 5 - 2",
    options: [
      "19",
      "21",
      "23",
      "25"
    ],
    correctAnswer: 1,
    explanation: "Using BODMAS: First division: 48 ÷ 6 = 8. Then multiplication: 3 × 5 = 15. Then addition and subtraction from left to right: 8 + 15 - 2 = 23 - 2 = 21.",
    points: 2
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "What is 3/4 + 2/5? Express your answer in simplest form.",
    options: [
      "5/9",
      "23/20",
      "1 3/20",
      "5/20"
    ],
    correctAnswer: 2,
    explanation: "Find the LCD (20): 3/4 = 15/20 and 2/5 = 8/20. Add: 15/20 + 8/20 = 23/20 = 1 3/20 (one and three twentieths).",
    points: 2
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "A baker has 156 cupcakes. She puts them equally into 12 boxes. How many cupcakes are in each box?",
    options: [
      "11",
      "12",
      "13",
      "14"
    ],
    correctAnswer: 2,
    explanation: "Divide the total cupcakes by the number of boxes: 156 ÷ 12 = 13 cupcakes per box.",
    points: 2
  },
  {
    id: 4,
    type: "performance-task",
    question: "Marcus has $500 to spend on school supplies. He buys 3 notebooks at $45 each, 2 pens at $15 each, and a backpack for $175. Show your working to find: (a) How much did he spend in total? (b) How much money does he have left?",
    correctAnswer: "(a) Notebooks: 3 × $45 = $135, Pens: 2 × $15 = $30, Backpack: $175. Total spent: $135 + $30 + $175 = $340. (b) Money left: $500 - $340 = $160.",
    explanation: "This problem tests your ability to work with multiple operations and show your mathematical reasoning step by step.",
    points: 4
  },
  // Fractions and Decimals
  {
    id: 5,
    type: "multiple-choice",
    question: "Convert 0.65 to a fraction in simplest form.",
    options: [
      "65/10",
      "65/100",
      "13/20",
      "6/5"
    ],
    correctAnswer: 2,
    explanation: "0.65 = 65/100. To simplify, find the GCF of 65 and 100, which is 5. Divide both by 5: 65÷5 = 13, 100÷5 = 20. So 0.65 = 13/20.",
    points: 2
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "Keisha ate 2/5 of a pizza. What percentage of the pizza did she eat?",
    options: [
      "20%",
      "25%",
      "40%",
      "45%"
    ],
    correctAnswer: 2,
    explanation: "To convert 2/5 to a percentage: 2 ÷ 5 = 0.4. Then multiply by 100: 0.4 × 100 = 40%.",
    points: 2
  },
  // Measurement
  {
    id: 7,
    type: "multiple-choice",
    question: "A rectangle has a length of 12 cm and a width of 8 cm. What is its perimeter?",
    options: [
      "20 cm",
      "40 cm",
      "96 cm",
      "32 cm"
    ],
    correctAnswer: 1,
    explanation: "Perimeter of a rectangle = 2 × (length + width) = 2 × (12 + 8) = 2 × 20 = 40 cm.",
    points: 2
  },
  {
    id: 8,
    type: "multiple-choice",
    question: "Convert 2.5 kilometres to metres.",
    options: [
      "25 m",
      "250 m",
      "2,500 m",
      "25,000 m"
    ],
    correctAnswer: 2,
    explanation: "1 kilometre = 1,000 metres. So 2.5 km = 2.5 × 1,000 = 2,500 metres.",
    points: 2
  },
  {
    id: 9,
    type: "multiple-choice",
    question: "What is the area of a square with sides of 9 cm?",
    options: [
      "36 cm²",
      "81 cm²",
      "18 cm²",
      "72 cm²"
    ],
    correctAnswer: 1,
    explanation: "Area of a square = side × side = 9 × 9 = 81 cm².",
    points: 2
  },
  // Performance Task - Real World Problem
  {
    id: 10,
    type: "performance-task",
    question: "The Grade 5 class is planning a field trip. There are 84 students going. Each bus can carry 28 students. Bus rental costs $4,500 per bus. Lunch costs $350 per student.\n\nCalculate:\n(a) How many buses are needed?\n(b) What is the total cost for buses?\n(c) What is the total cost for lunch?\n(d) What is the total cost for the entire trip?",
    correctAnswer: "(a) Buses needed: 84 ÷ 28 = 3 buses. (b) Bus cost: 3 × $4,500 = $13,500. (c) Lunch cost: 84 × $350 = $29,400. (d) Total cost: $13,500 + $29,400 = $42,900.",
    explanation: "This performance task tests your ability to solve multi-step real-world problems involving division and multiplication with money.",
    points: 6
  },
  // Geometry
  {
    id: 11,
    type: "multiple-choice",
    question: "What is the sum of angles in a triangle?",
    options: [
      "90°",
      "180°",
      "270°",
      "360°"
    ],
    correctAnswer: 1,
    explanation: "The sum of all interior angles in any triangle is always 180 degrees. This is a fundamental rule in geometry.",
    points: 2
  },
  {
    id: 12,
    type: "multiple-choice",
    question: "A triangle has angles of 45° and 90°. What is the measure of the third angle?",
    options: [
      "45°",
      "55°",
      "90°",
      "135°"
    ],
    correctAnswer: 0,
    explanation: "The sum of angles in a triangle = 180°. Third angle = 180° - 45° - 90° = 45°. This is a right isosceles triangle.",
    points: 2
  },
  {
    id: 13,
    type: "multiple-choice",
    question: "Which shape has exactly 4 equal sides and 4 right angles?",
    options: [
      "Rectangle",
      "Rhombus",
      "Square",
      "Parallelogram"
    ],
    correctAnswer: 2,
    explanation: "A square has 4 equal sides AND 4 right angles (90° each). A rectangle has 4 right angles but not necessarily equal sides. A rhombus has 4 equal sides but not necessarily right angles.",
    points: 2
  },
  // Statistics
  {
    id: 14,
    type: "multiple-choice",
    question: "Find the mean of these test scores: 75, 82, 90, 68, 85",
    options: [
      "78",
      "80",
      "82",
      "85"
    ],
    correctAnswer: 1,
    explanation: "Mean = sum of all values ÷ number of values. Sum = 75 + 82 + 90 + 68 + 85 = 400. Mean = 400 ÷ 5 = 80.",
    points: 2
  },
  {
    id: 15,
    type: "multiple-choice",
    question: "In the data set: 12, 15, 15, 18, 20, 15, 22, what is the mode?",
    options: [
      "12",
      "15",
      "17",
      "18"
    ],
    correctAnswer: 1,
    explanation: "The mode is the value that appears most frequently. In this set, 15 appears three times, more than any other number.",
    points: 2
  },
  // Word Problems
  {
    id: 16,
    type: "multiple-choice",
    question: "A shop sells mangoes at $35 for 5. How much would 12 mangoes cost?",
    options: [
      "$70",
      "$84",
      "$90",
      "$105"
    ],
    correctAnswer: 1,
    explanation: "First find the cost of one mango: $35 ÷ 5 = $7. Then multiply by 12: $7 × 12 = $84.",
    points: 2
  },
  {
    id: 17,
    type: "multiple-choice",
    question: "A train departs at 9:45 AM and arrives at 2:15 PM. How long is the journey?",
    options: [
      "4 hours 30 minutes",
      "4 hours 45 minutes",
      "5 hours 30 minutes",
      "5 hours 15 minutes"
    ],
    correctAnswer: 0,
    explanation: "From 9:45 AM to 2:15 PM: 9:45 to 10:00 = 15 mins, 10:00 to 2:00 = 4 hours, 2:00 to 2:15 = 15 mins. Total = 4 hours 30 minutes.",
    points: 2
  },
  // Ratio and Proportion
  {
    id: 18,
    type: "multiple-choice",
    question: "The ratio of boys to girls in a class is 3:5. If there are 24 students in total, how many are girls?",
    options: [
      "9",
      "12",
      "15",
      "18"
    ],
    correctAnswer: 2,
    explanation: "Total parts = 3 + 5 = 8. Each part = 24 ÷ 8 = 3 students. Girls = 5 parts = 5 × 3 = 15 girls.",
    points: 2
  },
  {
    id: 19,
    type: "multiple-choice",
    question: "What is 25% of 240?",
    options: [
      "40",
      "50",
      "60",
      "70"
    ],
    correctAnswer: 2,
    explanation: "25% = 25/100 = 1/4. So 25% of 240 = 240 ÷ 4 = 60. Or: 0.25 × 240 = 60.",
    points: 2
  },
  {
    id: 20,
    type: "performance-task",
    question: "A farmer has a rectangular field that is 45 metres long and 30 metres wide. He wants to:\n(a) Build a fence around the entire field. Fencing costs $125 per metre.\n(b) Plant grass that costs $8 per square metre.\n\nCalculate the total cost for both the fencing AND the grass.",
    correctAnswer: "(a) Perimeter = 2 × (45 + 30) = 2 × 75 = 150 metres. Fence cost = 150 × $125 = $18,750. (b) Area = 45 × 30 = 1,350 m². Grass cost = 1,350 × $8 = $10,800. Total cost = $18,750 + $10,800 = $29,550.",
    explanation: "This problem combines perimeter (for fencing around the edge) and area (for grass covering the surface) calculations with money.",
    points: 6
  }
]

export default function MathematicsMockTestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/mathematics" 
            className="inline-flex items-center text-[#0d9488] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mathematics
          </Link>

          <MockTest
            title="Mathematics Mock PEP Test"
            subject="Mathematics"
            description="This mock test simulates the Grade 5 PEP Mathematics assessment. It covers number operations, fractions, decimals, measurement, geometry, statistics, and word problems. Performance tasks require you to show your working and explain your reasoning."
            timeLimit={60}
            questions={mathematicsQuestions}
            passingScore={60}
          />
        </div>
      </main>

      <ColorBar />
      <Footer />
    </div>
  )
}
