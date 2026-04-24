import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ColorBar } from "@/components/color-bar"
import { MockTest, MockTestQuestion } from "@/components/mock-test"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const languageArtsQuestions: MockTestQuestion[] = [
  // Reading Comprehension - Performance Task
  {
    id: 1,
    type: "multiple-choice",
    question: "Based on the passage, what is the MAIN reason Marcus wanted to save the old mango tree?",
    context: `Read the following passage and answer the questions that follow.

The Old Mango Tree

Marcus walked slowly around the old mango tree in his grandmother's yard. The tree had been there for as long as anyone could remember. Its trunk was thick and gnarled, its branches spread wide like welcoming arms.

"They want to cut it down," his grandmother said sadly, joining him under the shade. "The new road needs to pass through here."

Marcus placed his hand on the rough bark. He remembered the summers spent climbing its branches, the sweet mangoes they picked each July, and the stories his grandmother told him while they sat beneath its leaves.

"There must be another way," Marcus said firmly. "This tree is part of our family."

That evening, Marcus wrote a letter to the town council. He explained how the tree was over one hundred years old and held memories for three generations of his family. He suggested the road could curve slightly to spare the tree.

To everyone's surprise, the council agreed. They redesigned the road, and the old mango tree still stands today, a living monument to one boy's determination to preserve his heritage.`,
    options: [
      "He wanted to sell the mangoes from the tree",
      "The tree held precious family memories and heritage",
      "He was afraid of the road construction workers",
      "His grandmother forced him to write the letter"
    ],
    correctAnswer: 1,
    explanation: "The passage clearly shows that Marcus valued the tree because of the memories it held - climbing its branches, picking mangoes, and hearing his grandmother's stories. He called it 'part of our family' and wrote about 'three generations' of memories.",
    points: 2
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "What does the word 'gnarled' MOST LIKELY mean as used in the passage?",
    context: `"Its trunk was thick and gnarled, its branches spread wide like welcoming arms."`,
    options: [
      "Smooth and polished",
      "Twisted and knotted with age",
      "Painted and decorated",
      "Thin and fragile"
    ],
    correctAnswer: 1,
    explanation: "Context clues tell us the tree is very old ('over one hundred years old'). 'Gnarled' describes something twisted and knotted, which is common in old trees. It contrasts with 'thick' to give a picture of an aged, weathered trunk.",
    points: 2
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "Which of the following BEST describes the theme of the passage?",
    options: [
      "Trees are more important than roads",
      "One person can make a difference when they stand up for what they believe in",
      "Grandmothers always know best",
      "Writing letters is the best way to solve problems"
    ],
    correctAnswer: 1,
    explanation: "The theme centers on Marcus taking action to protect something important. His determination and initiative led to a positive outcome, showing that one person's voice can create change.",
    points: 2
  },
  {
    id: 4,
    type: "performance-task",
    question: "Write a short paragraph (4-5 sentences) explaining what you would do if something important in YOUR community was about to be destroyed. Use examples from the passage to support your ideas.",
    correctAnswer: "A good response would: 1) State what action they would take (like Marcus writing a letter), 2) Explain why preserving community heritage is important, 3) Reference how Marcus's determination worked, 4) Show understanding that speaking up can make a difference.",
    explanation: "This performance task assesses your ability to connect the passage to real-life situations and express your ideas clearly in writing.",
    points: 4
  },
  // Grammar and Mechanics
  {
    id: 5,
    type: "multiple-choice",
    question: "Choose the sentence that uses the correct subject-verb agreement.",
    options: [
      "The group of students were excited about the field trip.",
      "The group of students was excited about the field trip.",
      "The group of students are excited about the field trip.",
      "The group of students be excited about the field trip."
    ],
    correctAnswer: 1,
    explanation: "When the subject is a collective noun like 'group,' the verb should be singular ('was') because the group acts as one unit. 'The group...was excited' is correct.",
    points: 2
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "Which sentence contains a SIMILE?",
    options: [
      "The thunder roared across the sky.",
      "Her smile was as bright as the morning sun.",
      "The wind whispered through the trees.",
      "Time is a thief that steals our youth."
    ],
    correctAnswer: 1,
    explanation: "A simile compares two things using 'like' or 'as.' 'Her smile was as bright as the morning sun' uses 'as...as' to compare her smile to the sun. The other options are metaphors or personification.",
    points: 2
  },
  {
    id: 7,
    type: "multiple-choice",
    question: "Identify the CORRECT use of punctuation in dialogue.",
    options: [
      "\"I love Jamaica\" said Maria \"it's so beautiful.\"",
      "\"I love Jamaica,\" said Maria, \"it's so beautiful.\"",
      "\"I love Jamaica\", said Maria, \"it's so beautiful\".",
      "\"I love Jamaica\" Said Maria \"It's so beautiful.\""
    ],
    correctAnswer: 1,
    explanation: "Correct dialogue punctuation requires: comma inside the quotation marks before the dialogue tag, lowercase 'said,' comma after the tag, and proper capitalization. Option B follows all these rules.",
    points: 2
  },
  {
    id: 8,
    type: "multiple-choice",
    question: "Which word BEST completes this sentence? 'The scientist made an important _______ that changed how we understand earthquakes.'",
    options: [
      "discover",
      "discovered",
      "discovery",
      "discovering"
    ],
    correctAnswer: 2,
    explanation: "'Discovery' is the noun form needed here because it follows the article 'an' and the adjective 'important.' We need a noun to complete the phrase 'an important _______.'",
    points: 2
  },
  // Vocabulary
  {
    id: 9,
    type: "multiple-choice",
    question: "What is the meaning of the prefix 'un-' in the word 'uncomfortable'?",
    options: [
      "Very",
      "Not",
      "Again",
      "Before"
    ],
    correctAnswer: 1,
    explanation: "The prefix 'un-' means 'not' or 'opposite of.' So 'uncomfortable' means 'not comfortable.' Other examples include unhappy (not happy) and unable (not able).",
    points: 2
  },
  {
    id: 10,
    type: "multiple-choice",
    question: "Choose the word that is an ANTONYM of 'ancient.'",
    options: [
      "Old",
      "Historic",
      "Modern",
      "Antique"
    ],
    correctAnswer: 2,
    explanation: "An antonym is a word with the opposite meaning. 'Ancient' means very old, so 'modern' (new, current) is its antonym. The other options are synonyms (similar meanings) of ancient.",
    points: 2
  },
  // Writing - Performance Task
  {
    id: 11,
    type: "performance-task",
    question: "Read the two sources below and write a short essay (6-8 sentences) comparing how BOTH sources show the importance of protecting Jamaica's environment.\n\nSource 1: 'Jamaica's Blue Mountains are home to over 500 species of plants found nowhere else on Earth. Deforestation threatens these unique species.'\n\nSource 2: 'The coral reefs along Jamaica's coast protect our beaches from storms and provide homes for countless fish that Jamaican fishermen depend on for their livelihood.'",
    correctAnswer: "A strong response would: 1) Introduce the topic of environmental protection, 2) Explain how Source 1 shows importance through unique plant species, 3) Explain how Source 2 shows importance through coastal protection and fishing, 4) Compare both sources, 5) Conclude with why protecting both ecosystems matters to Jamaica.",
    explanation: "This performance task assesses your ability to read multiple sources, identify key information, compare ideas, and write a coherent essay with an introduction and conclusion.",
    points: 6
  },
  {
    id: 12,
    type: "multiple-choice",
    question: "In a persuasive essay, what is the purpose of a 'counterargument'?",
    options: [
      "To confuse the reader about your position",
      "To show you understand the opposing view and can respond to it",
      "To change your opinion halfway through",
      "To make your essay longer"
    ],
    correctAnswer: 1,
    explanation: "A counterargument acknowledges the opposing view and then explains why your position is still stronger. This shows critical thinking and makes your argument more convincing.",
    points: 2
  },
  // Comprehension - Inference
  {
    id: 13,
    type: "multiple-choice",
    question: "Read this sentence: 'Keisha stared at the blank page, chewing her pencil, as the clock ticked loudly.' What can you INFER about Keisha?",
    options: [
      "She is hungry and wants lunch",
      "She is struggling to write or think of ideas",
      "She is excited about her assignment",
      "She enjoys the sound of clocks"
    ],
    correctAnswer: 1,
    explanation: "The details suggest Keisha is having difficulty: staring at a 'blank page' (no ideas yet), 'chewing her pencil' (a nervous habit), and the 'clock ticked loudly' (time pressure). These all indicate she's struggling with her writing.",
    points: 2
  },
  {
    id: 14,
    type: "multiple-choice",
    question: "Which sentence shows the correct use of 'their,' 'there,' and 'they're'?",
    options: [
      "Their going to put they're books over there.",
      "They're going to put their books over there.",
      "There going to put their books over they're.",
      "They're going to put there books over their."
    ],
    correctAnswer: 1,
    explanation: "'They're' = they are (they are going), 'their' = possession (their books belong to them), 'there' = place (over there, a location). Option B uses all three correctly.",
    points: 2
  },
  {
    id: 15,
    type: "multiple-choice",
    question: "What type of sentence is this? 'After the rain stopped, the children ran outside to play in the puddles.'",
    options: [
      "Simple sentence",
      "Compound sentence",
      "Complex sentence",
      "Compound-complex sentence"
    ],
    correctAnswer: 2,
    explanation: "This is a complex sentence because it has one independent clause ('the children ran outside to play in the puddles') and one dependent clause ('After the rain stopped'). The dependent clause cannot stand alone as a sentence.",
    points: 2
  }
]

export default function LanguageArtsMockTestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/language-arts" 
            className="inline-flex items-center text-[#0d9488] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Language Arts
          </Link>

          <MockTest
            title="Language Arts Mock PEP Test"
            subject="Language Arts"
            description="This mock test simulates the Grade 5 PEP Language Arts assessment. It includes reading comprehension passages, grammar questions, vocabulary, and performance tasks that require written responses. Answer all questions to the best of your ability."
            timeLimit={45}
            questions={languageArtsQuestions}
            passingScore={60}
          />
        </div>
      </main>

      <ColorBar />
      <Footer />
    </div>
  )
}
