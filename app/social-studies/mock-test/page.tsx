import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ColorBar } from "@/components/color-bar"
import { MockTest, MockTestQuestion } from "@/components/mock-test"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const socialStudiesQuestions: MockTestQuestion[] = [
  // Geography of Jamaica
  {
    id: 1,
    type: "multiple-choice",
    question: "How many parishes are there in Jamaica?",
    options: [
      "12",
      "13",
      "14",
      "15"
    ],
    correctAnswer: 2,
    explanation: "Jamaica has 14 parishes: Kingston, St. Andrew, St. Thomas, Portland, St. Mary, St. Ann, Trelawny, St. James, Hanover, Westmoreland, St. Elizabeth, Manchester, Clarendon, and St. Catherine.",
    points: 2
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "Which parish is known as the 'Garden Parish' of Jamaica?",
    options: [
      "St. Ann",
      "Portland",
      "St. Mary",
      "St. Elizabeth"
    ],
    correctAnswer: 0,
    explanation: "St. Ann is called the 'Garden Parish' because of its lush vegetation, beautiful gardens, and natural attractions like Dunn's River Falls and the Green Grotto Caves.",
    points: 2
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "What is the highest mountain peak in Jamaica?",
    options: [
      "John Crow Peak",
      "Blue Mountain Peak",
      "Catherine's Peak",
      "Don Figuerero Mountains"
    ],
    correctAnswer: 1,
    explanation: "Blue Mountain Peak is the highest point in Jamaica at 2,256 metres (7,402 feet). It is located in the Blue Mountains in eastern Jamaica.",
    points: 2
  },
  {
    id: 4,
    type: "performance-task",
    question: "Look at the map description: Jamaica is located in the Caribbean Sea, south of Cuba and west of Hispaniola. It has mountains in the east and plains in the south.\n\n(a) Name ONE economic activity that takes place in the mountainous regions.\n(b) Name ONE economic activity that takes place in the plains/coastal regions.\n(c) Explain how Jamaica's location in the Caribbean affects its climate.",
    correctAnswer: "(a) Mountainous regions: Coffee farming (Blue Mountain Coffee), tourism (hiking), forestry. (b) Plains/coastal regions: Sugar cane farming, bauxite mining, fishing, tourism (beaches). (c) Jamaica's Caribbean location gives it a tropical climate - warm temperatures year-round, wet and dry seasons, and exposure to hurricanes during hurricane season (June-November).",
    explanation: "This task tests your understanding of Jamaica's geography and how physical features influence economic activities and climate.",
    points: 6
  },
  // Caribbean History
  {
    id: 5,
    type: "multiple-choice",
    question: "Who were the first people to live in Jamaica before European arrival?",
    options: [
      "The Caribs",
      "The Taino (Arawaks)",
      "The Aztecs",
      "The Maroons"
    ],
    correctAnswer: 1,
    explanation: "The Taino (also called Arawaks) were the indigenous people of Jamaica. They called the island 'Xaymaca' meaning 'Land of Wood and Water.' Christopher Columbus arrived in 1494.",
    points: 2
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "In what year did Jamaica gain independence from Britain?",
    options: [
      "1834",
      "1938",
      "1962",
      "1976"
    ],
    correctAnswer: 2,
    explanation: "Jamaica gained independence on August 6, 1962. This is why Independence Day is celebrated on the first Monday in August each year.",
    points: 2
  },
  {
    id: 7,
    type: "multiple-choice",
    question: "Which National Hero is known for leading the Morant Bay Rebellion in 1865?",
    options: [
      "Marcus Garvey",
      "Paul Bogle",
      "Nanny of the Maroons",
      "Sam Sharpe"
    ],
    correctAnswer: 1,
    explanation: "Paul Bogle was a Baptist deacon who led the Morant Bay Rebellion in 1865, protesting against injustice and poor conditions for Black Jamaicans after emancipation.",
    points: 2
  },
  {
    id: 8,
    type: "multiple-choice",
    question: "When was slavery abolished in the British Caribbean?",
    options: [
      "1807",
      "1834",
      "1865",
      "1962"
    ],
    correctAnswer: 1,
    explanation: "Slavery was abolished in British colonies on August 1, 1834. This is celebrated as Emancipation Day. However, there was an apprenticeship period until 1838 before full freedom.",
    points: 2
  },
  // Government and Civics
  {
    id: 9,
    type: "multiple-choice",
    question: "What are the three branches of Jamaica's government?",
    options: [
      "Parliament, Senate, Cabinet",
      "Executive, Legislative, Judicial",
      "Prime Minister, Governor-General, Chief Justice",
      "House of Representatives, Senate, Courts"
    ],
    correctAnswer: 1,
    explanation: "Jamaica's government has three branches: Executive (enforces laws - led by Prime Minister), Legislative (makes laws - Parliament), and Judicial (interprets laws - courts).",
    points: 2
  },
  {
    id: 10,
    type: "multiple-choice",
    question: "Who is the head of state in Jamaica?",
    options: [
      "The Prime Minister",
      "The Governor-General",
      "The King/Queen of Britain",
      "The Chief Justice"
    ],
    correctAnswer: 2,
    explanation: "As a constitutional monarchy, Jamaica's head of state is the British monarch (currently King Charles III). The Governor-General represents the monarch in Jamaica. The Prime Minister is the head of government.",
    points: 2
  },
  {
    id: 11,
    type: "multiple-choice",
    question: "What is the minimum voting age in Jamaica?",
    options: [
      "16 years",
      "18 years",
      "21 years",
      "25 years"
    ],
    correctAnswer: 1,
    explanation: "In Jamaica, citizens must be at least 18 years old to vote in elections. This is the same voting age in most democratic countries.",
    points: 2
  },
  {
    id: 12,
    type: "performance-task",
    question: "Read this scenario: A new law is being proposed to build a factory in a community. Some residents want jobs, others worry about pollution.\n\n(a) Explain how this law would move through Jamaica's Parliament.\n(b) Name ONE right that citizens have to express their opinion on this matter.\n(c) Describe ONE responsibility citizens have in a democracy like Jamaica.",
    correctAnswer: "(a) The law (bill) would be introduced in Parliament, debated in the House of Representatives, then the Senate. If both houses approve, it goes to the Governor-General for Royal Assent to become law. (b) Freedom of speech/expression, right to peaceful protest, right to petition government. (c) Responsibilities include: voting, obeying laws, paying taxes, serving on jury duty, staying informed about issues.",
    explanation: "This task tests your understanding of how democracy works, including the lawmaking process and citizens' rights and responsibilities.",
    points: 6
  },
  // Culture and Heritage
  {
    id: 13,
    type: "multiple-choice",
    question: "What is Jamaica's national dish?",
    options: [
      "Jerk Chicken",
      "Rice and Peas",
      "Ackee and Saltfish",
      "Curry Goat"
    ],
    correctAnswer: 2,
    explanation: "Ackee and Saltfish is Jamaica's national dish. Ackee is a fruit that was brought from West Africa, and it's cooked with salted codfish, onions, tomatoes, and peppers.",
    points: 2
  },
  {
    id: 14,
    type: "multiple-choice",
    question: "Which music genre originated in Jamaica in the 1960s?",
    options: [
      "Jazz",
      "Reggae",
      "Calypso",
      "Hip Hop"
    ],
    correctAnswer: 1,
    explanation: "Reggae music originated in Jamaica in the late 1960s. Bob Marley is the most famous reggae artist. Reggae evolved from earlier Jamaican music styles like ska and rocksteady.",
    points: 2
  },
  {
    id: 15,
    type: "multiple-choice",
    question: "What are the colours of the Jamaican flag and what do they represent?",
    options: [
      "Red, white, blue - blood, peace, sky",
      "Black, green, gold - hardships, agriculture, sunshine",
      "Green, yellow, red - land, sun, blood",
      "Blue, white, gold - sea, peace, beaches"
    ],
    correctAnswer: 1,
    explanation: "Jamaica's flag has black, green, and gold. Black represents the strength and creativity of the people, green represents hope and agricultural resources, and gold represents natural wealth and sunshine.",
    points: 2
  },
  {
    id: 16,
    type: "multiple-choice",
    question: "What is the motto of Jamaica?",
    options: [
      "One Love, One Heart",
      "Out of Many, One People",
      "Jamaica, Land We Love",
      "Proud and Free"
    ],
    correctAnswer: 1,
    explanation: "'Out of Many, One People' is Jamaica's national motto. It reflects the country's diverse heritage - people of African, European, Chinese, Indian, and Middle Eastern descent living together as one nation.",
    points: 2
  },
  // CARICOM and Caribbean Relations
  {
    id: 17,
    type: "multiple-choice",
    question: "What does CARICOM stand for?",
    options: [
      "Caribbean Common Market",
      "Caribbean Community",
      "Caribbean Commercial Union",
      "Caribbean Council of Ministers"
    ],
    correctAnswer: 1,
    explanation: "CARICOM stands for Caribbean Community. It was established in 1973 to promote economic integration and cooperation among Caribbean countries.",
    points: 2
  },
  {
    id: 18,
    type: "multiple-choice",
    question: "Which of these is a benefit of CARICOM membership for Jamaica?",
    options: [
      "Free movement of people and goods between member countries",
      "Jamaica gets to rule other Caribbean islands",
      "Other countries must speak Jamaican Patois",
      "Jamaica doesn't have to follow any laws"
    ],
    correctAnswer: 0,
    explanation: "CARICOM allows for free movement of certain categories of people (like university graduates and skilled workers) and reduced trade barriers between member countries.",
    points: 2
  },
  // Environment and Sustainability
  {
    id: 19,
    type: "multiple-choice",
    question: "Which of the following is a major environmental challenge facing Jamaica?",
    options: [
      "Snow storms",
      "Earthquakes only",
      "Deforestation and coastal erosion",
      "Volcanoes"
    ],
    correctAnswer: 2,
    explanation: "Major environmental challenges in Jamaica include deforestation (cutting down trees), coastal erosion (wearing away of beaches), water pollution, and the effects of climate change like stronger hurricanes.",
    points: 2
  },
  {
    id: 20,
    type: "performance-task",
    question: "Jamaica celebrates many national holidays and observances.\n\n(a) Name TWO national holidays celebrated in Jamaica and explain what each one commemorates.\n(b) Describe how celebrating national holidays helps build national identity.\n(c) Suggest ONE way young people can participate in celebrating Jamaica's heritage.",
    correctAnswer: "(a) Examples: Independence Day (August 6) - celebrates Jamaica becoming independent from Britain in 1962. Emancipation Day (August 1) - commemorates the end of slavery in 1834. National Heroes Day (third Monday in October) - honours Jamaica's seven National Heroes. (b) National holidays remind us of our shared history, unite people of different backgrounds, and teach younger generations about important events and values. (c) Young people can: learn about Jamaican history, participate in Independence Day activities, learn traditional songs/dances, visit heritage sites, speak with elders about the past.",
    explanation: "This task tests your knowledge of Jamaican national observances and understanding of how culture and celebrations contribute to national identity.",
    points: 6
  }
]

export default function SocialStudiesMockTestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/social-studies" 
            className="inline-flex items-center text-[#0d9488] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Social Studies
          </Link>

          <MockTest
            title="Social Studies Mock PEP Test"
            subject="Social Studies"
            description="This mock test covers the Grade 5 Social Studies curriculum including Jamaica's geography, Caribbean history, government and civics, culture and heritage, and regional organizations like CARICOM. Performance tasks require thoughtful written responses."
            timeLimit={45}
            questions={socialStudiesQuestions}
            passingScore={60}
          />
        </div>
      </main>

      <ColorBar />
      <Footer />
    </div>
  )
}
