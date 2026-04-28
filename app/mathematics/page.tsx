"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quiz, Question } from "@/components/quiz"
import { Calculator, Ruler, Shapes, BarChart3, ArrowLeft, Play, ClipboardCheck } from "lucide-react"
import Link from "next/link"

const topics = [
  {
    id: "numbers",
    icon: Calculator,
    title: "Number Operations",
    description: "Practice addition, subtraction, multiplication, division with whole numbers, fractions, and decimals.",
    color: "bg-[#f59e0b]",
    content: {
      overview: "Number operations are the foundation of mathematics. In Grade 5, you will work with larger numbers, learn to compute with fractions and decimals, and understand the order of operations (BODMAS).",
      keyPoints: [
        "BODMAS: Brackets, Orders (powers), Division, Multiplication, Addition, Subtraction",
        "Adding and subtracting fractions with unlike denominators",
        "Multiplying and dividing fractions",
        "Converting between fractions, decimals, and percentages",
        "Working with negative numbers on a number line"
      ],
      example: {
        title: "Order of Operations (BODMAS)",
        text: "Solve: 3 + 4 × 2\n\nStep 1: Identify operations (addition and multiplication)\nStep 2: According to BODMAS, do multiplication first: 4 × 2 = 8\nStep 3: Then do addition: 3 + 8 = 11\n\nAnswer: 11",
        questionPrompt: "Why don't we add 3 + 4 first?",
        answer: "According to BODMAS rules, multiplication comes before addition, so we must multiply 4 × 2 first before adding."
      }
    },
    questions: [
      {
        id: 1,
        question: "What is 3 + 5 × 2?",
        options: ["16", "13", "11", "10"],
        correctAnswer: 1,
        explanation: "Using BODMAS, multiply first: 5 × 2 = 10. Then add: 3 + 10 = 13."
      },
      {
        id: 2,
        question: "What is 1/4 + 2/4?",
        options: ["3/8", "3/4", "2/4", "1/2"],
        correctAnswer: 1,
        explanation: "When adding fractions with the same denominator, add the numerators: 1 + 2 = 3. The answer is 3/4."
      },
      {
        id: 3,
        question: "What is 0.5 as a fraction?",
        options: ["1/5", "1/2", "5/10", "Both B and C"],
        correctAnswer: 3,
        explanation: "0.5 = 5/10, which simplifies to 1/2. So both B and C are correct representations."
      },
      {
        id: 4,
        question: "What is 3/4 × 2?",
        options: ["3/2", "6/4", "1 1/2", "All of the above"],
        correctAnswer: 3,
        explanation: "3/4 × 2 = 6/4 = 3/2 = 1 1/2. All three expressions represent the same value."
      },
      {
        id: 5,
        question: "What is (8 + 4) ÷ 3?",
        options: ["4", "5", "6", "8"],
        correctAnswer: 0,
        explanation: "First solve the brackets: 8 + 4 = 12. Then divide: 12 ÷ 3 = 4."
      }
    ] as Question[]
  },
  {
    id: "measurement",
    icon: Ruler,
    title: "Measurement",
    description: "Learn about length, mass, capacity, time, and money through practical problem-solving.",
    color: "bg-[#0d9488]",
    content: {
      overview: "Measurement helps us describe and compare objects using standard units. In Grade 5, you will convert between different units, calculate perimeter and area, and solve practical problems involving time and money.",
      keyPoints: [
        "Length: kilometers (km), meters (m), centimeters (cm), millimeters (mm)",
        "Mass: kilograms (kg), grams (g)",
        "Capacity: liters (L), milliliters (mL)",
        "Converting between units: 1 km = 1000 m, 1 m = 100 cm, 1 kg = 1000 g, 1 L = 1000 mL",
        "Calculating elapsed time and working with the 24-hour clock"
      ],
      example: {
        title: "Converting Units",
        text: "Convert 2.5 kilometers to meters.\n\n1 kilometer = 1000 meters\n2.5 kilometers = 2.5 × 1000 = 2500 meters",
        questionPrompt: "How many centimeters are in 3 meters?",
        answer: "Since 1 meter = 100 centimeters, 3 meters = 3 × 100 = 300 centimeters."
      }
    },
    questions: [
      {
        id: 1,
        question: "How many centimeters are in 2 meters?",
        options: ["20 cm", "200 cm", "2000 cm", "0.02 cm"],
        correctAnswer: 1,
        explanation: "1 meter = 100 centimeters, so 2 meters = 2 × 100 = 200 centimeters."
      },
      {
        id: 2,
        question: "A recipe needs 500 mL of milk. How many liters is this?",
        options: ["5 L", "50 L", "0.5 L", "0.05 L"],
        correctAnswer: 2,
        explanation: "1 liter = 1000 mL, so 500 mL = 500 ÷ 1000 = 0.5 liters."
      },
      {
        id: 3,
        question: "If a movie starts at 2:45 PM and is 1 hour 30 minutes long, what time does it end?",
        options: ["3:45 PM", "4:00 PM", "4:15 PM", "4:30 PM"],
        correctAnswer: 2,
        explanation: "2:45 PM + 1 hour = 3:45 PM. 3:45 PM + 30 minutes = 4:15 PM."
      },
      {
        id: 4,
        question: "What is the perimeter of a rectangle with length 8 cm and width 5 cm?",
        options: ["13 cm", "26 cm", "40 cm", "80 cm"],
        correctAnswer: 1,
        explanation: "Perimeter = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26 cm."
      },
      {
        id: 5,
        question: "If you buy 3 items at $4.50 each and pay with a $20 bill, how much change do you get?",
        options: ["$5.50", "$6.00", "$6.50", "$7.00"],
        correctAnswer: 2,
        explanation: "Cost: 3 × $4.50 = $13.50. Change: $20.00 - $13.50 = $6.50."
      }
    ] as Question[]
  },
  {
    id: "geometry",
    icon: Shapes,
    title: "Geometry",
    description: "Explore shapes, angles, area, perimeter, and spatial reasoning activities.",
    color: "bg-[#ec4899]",
    content: {
      overview: "Geometry is the study of shapes, sizes, and positions of objects. In Grade 5, you will learn about different types of angles, calculate area and perimeter, and understand properties of 2D and 3D shapes.",
      keyPoints: [
        "Types of angles: acute (less than 90°), right (exactly 90°), obtuse (between 90° and 180°), straight (180°)",
        "Area of rectangle = length × width",
        "Area of triangle = 1/2 × base × height",
        "Properties of triangles: equilateral (all sides equal), isosceles (two sides equal), scalene (no sides equal)",
        "3D shapes: cube, rectangular prism, cylinder, cone, sphere, pyramid"
      ],
      example: {
        title: "Calculating Area",
        text: "Find the area of a rectangle with length 6 cm and width 4 cm.\n\nArea = length × width\nArea = 6 × 4 = 24 square centimeters (cm²)",
        questionPrompt: "Why is area measured in square units?",
        answer: "Area measures the space inside a 2D shape. We use square units because we're counting how many unit squares fit inside the shape."
      }
    },
    questions: [
      {
        id: 1,
        question: "What type of angle measures exactly 90 degrees?",
        options: ["Acute angle", "Right angle", "Obtuse angle", "Straight angle"],
        correctAnswer: 1,
        explanation: "A right angle measures exactly 90 degrees. It looks like the corner of a square or rectangle."
      },
      {
        id: 2,
        question: "What is the area of a rectangle with length 7 m and width 3 m?",
        options: ["10 m²", "20 m²", "21 m²", "24 m²"],
        correctAnswer: 2,
        explanation: "Area = length × width = 7 × 3 = 21 square meters (m²)."
      },
      {
        id: 3,
        question: "A triangle has sides measuring 5 cm, 5 cm, and 8 cm. What type of triangle is it?",
        options: ["Equilateral", "Isosceles", "Scalene", "Right"],
        correctAnswer: 1,
        explanation: "An isosceles triangle has two sides of equal length. This triangle has two sides of 5 cm."
      },
      {
        id: 4,
        question: "What is the area of a triangle with base 10 cm and height 6 cm?",
        options: ["16 cm²", "30 cm²", "60 cm²", "80 cm²"],
        correctAnswer: 1,
        explanation: "Area of triangle = 1/2 × base × height = 1/2 × 10 × 6 = 30 cm²."
      },
      {
        id: 5,
        question: "How many faces does a cube have?",
        options: ["4", "5", "6", "8"],
        correctAnswer: 2,
        explanation: "A cube has 6 faces. Each face is a square of equal size."
      }
    ] as Question[]
  },
  {
    id: "statistics",
    icon: BarChart3,
    title: "Statistics & Data",
    description: "Interpret graphs, charts, and tables to analyze and present data.",
    color: "bg-[#8b5cf6]",
    content: {
      overview: "Statistics helps us collect, organize, analyze, and interpret data. In Grade 5, you will learn to read and create different types of graphs, calculate mean, median, and mode, and make predictions based on data.",
      keyPoints: [
        "Mean (average): Add all values and divide by the number of values",
        "Median: The middle value when data is arranged in order",
        "Mode: The value that appears most frequently",
        "Range: The difference between the highest and lowest values",
        "Types of graphs: bar graphs, line graphs, pie charts, pictographs"
      ],
      example: {
        title: "Finding the Mean",
        text: "Find the mean of these test scores: 85, 90, 78, 92, 85\n\nStep 1: Add all scores: 85 + 90 + 78 + 92 + 85 = 430\nStep 2: Divide by the number of scores: 430 ÷ 5 = 86\n\nThe mean (average) score is 86.",
        questionPrompt: "What is the mode of these scores?",
        answer: "The mode is 85 because it appears twice, more than any other score."
      }
    },
    questions: [
      {
        id: 1,
        question: "What is the mean of 4, 8, 6, 10, and 12?",
        options: ["6", "7", "8", "10"],
        correctAnswer: 2,
        explanation: "Mean = (4 + 8 + 6 + 10 + 12) ÷ 5 = 40 ÷ 5 = 8."
      },
      {
        id: 2,
        question: "What is the median of 3, 7, 2, 9, 5?",
        options: ["2", "5", "7", "9"],
        correctAnswer: 1,
        explanation: "First arrange in order: 2, 3, 5, 7, 9. The middle value (median) is 5."
      },
      {
        id: 3,
        question: "In the data set 2, 4, 4, 6, 4, 8, what is the mode?",
        options: ["2", "4", "6", "8"],
        correctAnswer: 1,
        explanation: "The mode is 4 because it appears 3 times, more frequently than any other number."
      },
      {
        id: 4,
        question: "What is the range of 15, 22, 8, 31, 19?",
        options: ["8", "15", "23", "31"],
        correctAnswer: 2,
        explanation: "Range = highest value - lowest value = 31 - 8 = 23."
      },
      {
        id: 5,
        question: "Which type of graph is BEST for showing how something changes over time?",
        options: ["Pie chart", "Bar graph", "Line graph", "Pictograph"],
        correctAnswer: 2,
        explanation: "A line graph is best for showing changes over time because it shows trends and patterns clearly."
      }
    ] as Question[]
  }
]

export default function MathematicsPage() {
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
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
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
        <section className="bg-[#f59e0b] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Mathematics (Numeracy)
            </h1>
            <p className="text-lg text-amber-100">
              Number operations, problem solving, measurement, and geometry practice
            </p>
          </div>
        </section>

        {/* Mock Test Banner */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/mock-test/mathematics">
            <Card className="bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <ClipboardCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Take the Mock PEP Test</h3>
                    <p className="text-white/80">60 minutes | 20 questions | Test your knowledge</p>
                  </div>
                </div>
                <Button className="bg-[#0d4a5f] hover:bg-[#0a3d4e] text-white">
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
                  <Button variant="outline" className="w-full border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white">
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
