"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quiz, Question } from "@/components/quiz"
import { MapPin, Users, Building, Scale, ArrowLeft, Play, ClipboardCheck } from "lucide-react"
import Link from "next/link"

const topics = [
  {
    id: "geography",
    icon: MapPin,
    title: "Geography of Jamaica",
    description: "Learn about Jamaica's parishes, physical features, climate, and natural resources.",
    color: "bg-[#6366f1]",
    content: {
      overview: "Jamaica is an island nation in the Caribbean Sea, located south of Cuba. It is the third-largest island in the Caribbean. Understanding Jamaica's geography helps us appreciate its natural beauty and resources.",
      keyPoints: [
        "Jamaica has 14 parishes: Kingston, St. Andrew, St. Thomas, Portland, St. Mary, St. Ann, Trelawny, St. James, Hanover, Westmoreland, St. Elizabeth, Manchester, Clarendon, St. Catherine",
        "The Blue Mountains in eastern Jamaica contain the highest peak, Blue Mountain Peak (2,256 m)",
        "Jamaica has a tropical climate with a wet season (May-November) and dry season (December-April)",
        "Major rivers include the Black River, Rio Grande, and Martha Brae",
        "Natural resources include bauxite, limestone, gypsum, and agricultural land"
      ],
      example: {
        title: "The Parishes of Jamaica",
        text: "Jamaica is divided into 14 parishes, grouped into 3 counties:\n\nSurrey (East): Kingston, St. Andrew, St. Thomas, Portland\nMiddlesex (Central): St. Mary, St. Ann, Clarendon, St. Catherine, Manchester\nCornwall (West): Trelawny, St. James, Hanover, Westmoreland, St. Elizabeth",
        questionPrompt: "Which county contains the capital city, Kingston?",
        answer: "Kingston is located in Surrey county, in the eastern part of Jamaica. Kingston is Jamaica's capital and largest city."
      }
    },
    questions: [
      {
        id: 1,
        question: "How many parishes does Jamaica have?",
        options: ["10", "12", "14", "16"],
        correctAnswer: 2,
        explanation: "Jamaica has 14 parishes, which are administrative divisions similar to states or provinces."
      },
      {
        id: 2,
        question: "What is the highest mountain peak in Jamaica?",
        options: ["Mount Diablo", "Blue Mountain Peak", "John Crow Peak", "Catherine's Peak"],
        correctAnswer: 1,
        explanation: "Blue Mountain Peak, located in the Blue Mountains of eastern Jamaica, is the highest point at 2,256 meters."
      },
      {
        id: 3,
        question: "Which sea surrounds Jamaica?",
        options: ["Atlantic Ocean", "Pacific Ocean", "Caribbean Sea", "Gulf of Mexico"],
        correctAnswer: 2,
        explanation: "Jamaica is surrounded by the Caribbean Sea. It is located about 145 km south of Cuba."
      },
      {
        id: 4,
        question: "What is Jamaica's main mineral resource used for making aluminum?",
        options: ["Gold", "Silver", "Bauxite", "Copper"],
        correctAnswer: 2,
        explanation: "Bauxite is Jamaica's most important mineral resource. Jamaica is one of the world's leading producers of bauxite, which is used to make aluminum."
      },
      {
        id: 5,
        question: "Which parish is home to Jamaica's famous Dunn's River Falls?",
        options: ["St. James", "St. Ann", "Portland", "St. Mary"],
        correctAnswer: 1,
        explanation: "Dunn's River Falls is located in St. Ann parish, near Ocho Rios. It is one of Jamaica's most popular tourist attractions."
      }
    ] as Question[]
  },
  {
    id: "history",
    icon: Users,
    title: "Caribbean History",
    description: "Explore the history of Jamaica and the Caribbean from indigenous peoples to independence.",
    color: "bg-[#ef4444]",
    content: {
      overview: "Jamaica has a rich history that spans thousands of years, from the indigenous Taino people to British colonial rule and independence. Understanding this history helps us appreciate Jamaica's diverse cultural heritage.",
      keyPoints: [
        "The Taino (Arawak) people were the first inhabitants of Jamaica, arriving around 600 AD",
        "Christopher Columbus arrived in Jamaica in 1494; Spain ruled until 1655",
        "The British captured Jamaica in 1655 and established sugar plantations using enslaved Africans",
        "Emancipation (freedom from slavery) was granted on August 1, 1838",
        "Jamaica gained independence from Britain on August 6, 1962"
      ],
      example: {
        title: "National Heroes of Jamaica",
        text: "Jamaica has seven National Heroes who made significant contributions to the nation:\n\n1. Nanny of the Maroons - Led resistance against British\n2. Sam Sharpe - Led 1831 Christmas Rebellion\n3. Paul Bogle - Led Morant Bay Rebellion\n4. George William Gordon - Politician and activist\n5. Marcus Garvey - Pan-African leader\n6. Alexander Bustamante - First Prime Minister\n7. Norman Manley - Founded PNP, led independence movement",
        questionPrompt: "Why is August 1st celebrated as Emancipation Day?",
        answer: "August 1, 1838 marks the day when full freedom was granted to all enslaved people in Jamaica and other British colonies. It is a national holiday celebrating freedom."
      }
    },
    questions: [
      {
        id: 1,
        question: "Who were the first people to live in Jamaica?",
        options: ["The Spanish", "The British", "The Taino (Arawak)", "The Africans"],
        correctAnswer: 2,
        explanation: "The Taino (also called Arawak) were the indigenous people of Jamaica who lived there for hundreds of years before Europeans arrived."
      },
      {
        id: 2,
        question: "In what year did Jamaica gain independence from Britain?",
        options: ["1838", "1944", "1962", "1980"],
        correctAnswer: 2,
        explanation: "Jamaica gained independence on August 6, 1962, after over 300 years of British colonial rule."
      },
      {
        id: 3,
        question: "Which National Hero is known for leading the Maroons against the British?",
        options: ["Marcus Garvey", "Nanny of the Maroons", "Sam Sharpe", "Paul Bogle"],
        correctAnswer: 1,
        explanation: "Nanny of the Maroons was a powerful leader who helped free enslaved Africans and fought against British forces in the 18th century."
      },
      {
        id: 4,
        question: "What is celebrated on August 1st in Jamaica?",
        options: ["Independence Day", "Labour Day", "Emancipation Day", "Heroes Day"],
        correctAnswer: 2,
        explanation: "Emancipation Day on August 1st commemorates the day in 1838 when enslaved people in Jamaica and other British colonies were freed."
      },
      {
        id: 5,
        question: "Who was Jamaica's first Prime Minister after independence?",
        options: ["Norman Manley", "Alexander Bustamante", "Michael Manley", "Edward Seaga"],
        correctAnswer: 1,
        explanation: "Sir Alexander Bustamante became Jamaica's first Prime Minister when the country gained independence in 1962."
      }
    ] as Question[]
  },
  {
    id: "government",
    icon: Building,
    title: "Government & Civics",
    description: "Understand Jamaica's government structure, national symbols, and civic responsibilities.",
    color: "bg-[#0d4a5f]",
    content: {
      overview: "Jamaica is a constitutional monarchy and parliamentary democracy. Understanding how our government works helps us become responsible citizens who can participate in building a better nation.",
      keyPoints: [
        "Jamaica has three branches of government: Executive, Legislative, and Judicial",
        "The Prime Minister is the head of government; the King/Queen of England is the head of state, represented by the Governor-General",
        "Parliament consists of the Senate (21 appointed members) and House of Representatives (63 elected members)",
        "National symbols include the flag (black, green, gold), national flower (Lignum Vitae), national bird (Doctor Bird)",
        "Citizens have rights (vote, education, freedom of speech) and responsibilities (obey laws, pay taxes, serve jury duty)"
      ],
      example: {
        title: "The Jamaica Flag",
        text: "The Jamaican flag has three colors:\n\n- BLACK: Represents the strength and creativity of the people, and the hardships overcome\n- GREEN: Represents hope and agricultural resources\n- GOLD (Yellow): Represents natural wealth and sunshine\n\nThe flag's design features a diagonal cross (saltire) that divides the flag into four triangles.",
        questionPrompt: "What do the colors of the Jamaican flag represent?",
        answer: "Black represents the strength of the people, Green represents hope and agriculture, and Gold represents the natural wealth and sunshine of Jamaica."
      }
    },
    questions: [
      {
        id: 1,
        question: "Who is the head of government in Jamaica?",
        options: ["The King", "The President", "The Prime Minister", "The Governor-General"],
        correctAnswer: 2,
        explanation: "The Prime Minister is the head of government in Jamaica and leads the Cabinet. The Prime Minister is usually the leader of the political party with the most seats in Parliament."
      },
      {
        id: 2,
        question: "What are the three branches of Jamaica's government?",
        options: ["King, Prime Minister, Parliament", "Executive, Legislative, Judicial", "Senate, House, Cabinet", "Federal, State, Local"],
        correctAnswer: 1,
        explanation: "Jamaica has three branches: Executive (Prime Minister and Cabinet), Legislative (Parliament), and Judicial (Courts)."
      },
      {
        id: 3,
        question: "What is Jamaica's national bird?",
        options: ["Parrot", "Doctor Bird", "Eagle", "Pelican"],
        correctAnswer: 1,
        explanation: "The Doctor Bird (also called the Swallow-tailed Hummingbird) is Jamaica's national bird, found only in Jamaica."
      },
      {
        id: 4,
        question: "What does the GREEN color on Jamaica's flag represent?",
        options: ["The sea", "Hope and agriculture", "The mountains", "Freedom"],
        correctAnswer: 1,
        explanation: "The green on Jamaica's flag represents hope for the future and the agricultural resources of the land."
      },
      {
        id: 5,
        question: "At what age can Jamaican citizens vote in elections?",
        options: ["16 years", "18 years", "21 years", "25 years"],
        correctAnswer: 1,
        explanation: "In Jamaica, citizens who are 18 years and older have the right to vote in national and local elections."
      }
    ] as Question[]
  },
  {
    id: "culture",
    icon: Scale,
    title: "Culture & Heritage",
    description: "Celebrate Jamaica's rich cultural heritage, traditions, and contributions to the world.",
    color: "bg-[#ec4899]",
    content: {
      overview: "Jamaica has a vibrant culture that blends African, European, Asian, and indigenous influences. Our music, food, art, and traditions have influenced people around the world.",
      keyPoints: [
        "Reggae music originated in Jamaica in the 1960s; Bob Marley is its most famous ambassador",
        "Traditional Jamaican foods include ackee and saltfish (national dish), jerk chicken, rice and peas, and patties",
        "Jamaican Patois is a Creole language blending English with West African languages",
        "Jamaica has produced world-famous athletes, including Usain Bolt, the fastest man in history",
        "Important festivals include Carnival, Jamaica Festival, and Independence Day celebrations"
      ],
      example: {
        title: "Ackee and Saltfish - National Dish",
        text: "Ackee and Saltfish is Jamaica's national dish. Here's what you should know:\n\n- Ackee is a fruit that was brought to Jamaica from West Africa\n- It must be prepared properly as unripe ackee is poisonous\n- Saltfish (dried, salted cod) was brought by European traders\n- Together they represent Jamaica's African and European heritage\n- Usually served with breadfruit, dumplings, or fried plantains",
        questionPrompt: "Why is ackee and saltfish significant to Jamaica's culture?",
        answer: "Ackee and saltfish represents Jamaica's diverse heritage - ackee from Africa and saltfish from European trade. It shows how different cultures blended to create something uniquely Jamaican."
      }
    },
    questions: [
      {
        id: 1,
        question: "What type of music originated in Jamaica in the 1960s?",
        options: ["Jazz", "Reggae", "Calypso", "Salsa"],
        correctAnswer: 1,
        explanation: "Reggae music originated in Jamaica in the late 1960s. It evolved from earlier Jamaican music styles like ska and rocksteady."
      },
      {
        id: 2,
        question: "What is Jamaica's national dish?",
        options: ["Jerk Chicken", "Rice and Peas", "Ackee and Saltfish", "Curry Goat"],
        correctAnswer: 2,
        explanation: "Ackee and Saltfish is Jamaica's national dish, combining the ackee fruit with salted codfish."
      },
      {
        id: 3,
        question: "Which Jamaican is known as the fastest man in history?",
        options: ["Asafa Powell", "Yohan Blake", "Usain Bolt", "Shelly-Ann Fraser-Pryce"],
        correctAnswer: 2,
        explanation: "Usain Bolt holds world records in the 100m and 200m sprints and is widely considered the greatest sprinter of all time."
      },
      {
        id: 4,
        question: "Which famous reggae artist is known as the 'King of Reggae'?",
        options: ["Peter Tosh", "Bob Marley", "Jimmy Cliff", "Toots Hibbert"],
        correctAnswer: 1,
        explanation: "Bob Marley is known as the King of Reggae. His music spread reggae worldwide and carried messages of peace, love, and social justice."
      },
      {
        id: 5,
        question: "What is Jamaican Patois?",
        options: ["A traditional dance", "A type of food", "A Creole language", "A musical instrument"],
        correctAnswer: 2,
        explanation: "Jamaican Patois (or Patwa) is a Creole language that developed from English mixed with West African languages. It is widely spoken in Jamaica alongside Standard English."
      }
    ] as Question[]
  }
]

export default function SocialStudiesPage() {
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
        <section className="bg-[#6366f1] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Social Studies
            </h1>
            <p className="text-lg text-indigo-200">
              Learn about Jamaica, Caribbean history, geography, and civic responsibilities
            </p>
          </div>
        </section>

        {/* Mock Test Banner */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/social-studies/mock-test">
            <Card className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:shadow-xl transition-all cursor-pointer">
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
                  <Button variant="outline" className="w-full border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white">
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
