"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quiz, Question } from "@/components/quiz"
import { BookOpen, FileText, Pencil, MessageSquare, ArrowLeft, Play, ClipboardCheck } from "lucide-react"
import Link from "next/link"

const topics = [
  {
    id: "reading",
    icon: BookOpen,
    title: "Reading Comprehension",
    description: "Practice understanding and analyzing different types of texts including fiction, non-fiction, and poetry.",
    color: "bg-[#0d4a5f]",
    content: {
      overview: "Reading comprehension is the ability to understand, interpret, and analyze what you read. In Grade 5, you will work with more complex texts and learn to identify main ideas, supporting details, and make inferences.",
      keyPoints: [
        "Identify the main idea and supporting details in a passage",
        "Make inferences and draw conclusions from the text",
        "Understand vocabulary in context",
        "Distinguish between fact and opinion",
        "Identify the author's purpose and point of view"
      ],
      example: {
        title: "Reading Passage Example",
        text: "Jamaica is an island nation located in the Caribbean Sea. It is the third-largest island in the Caribbean, after Cuba and Hispaniola. Jamaica is known for its beautiful beaches, lush mountains, and vibrant culture. The Blue Mountains, located in the eastern part of the island, are famous for growing some of the best coffee in the world.",
        questionPrompt: "What is the main idea of this passage?",
        answer: "The main idea is that Jamaica is a Caribbean island known for its natural beauty and culture."
      }
    },
    questions: [
      {
        id: 1,
        question: "Read the passage: 'The hurricane season in Jamaica runs from June to November. During this time, people prepare by stocking up on supplies and securing their homes.' What can you infer from this passage?",
        options: [
          "Hurricanes are rare in Jamaica",
          "People in Jamaica take hurricane preparation seriously",
          "Hurricane season lasts all year",
          "People do not worry about hurricanes"
        ],
        correctAnswer: 1,
        explanation: "The passage mentions that people prepare by stocking up and securing homes, which shows they take preparation seriously."
      },
      {
        id: 2,
        question: "Which of the following is an example of a fact?",
        options: [
          "Mangoes are the best fruit",
          "Jamaica is located in the Caribbean Sea",
          "Everyone should visit Jamaica",
          "The beach is boring"
        ],
        correctAnswer: 1,
        explanation: "A fact is something that can be proven true. Jamaica's location in the Caribbean Sea is a verifiable fact."
      },
      {
        id: 3,
        question: "What is the author's purpose when writing instructions for a recipe?",
        options: [
          "To entertain the reader",
          "To persuade the reader",
          "To inform the reader how to make something",
          "To express feelings"
        ],
        correctAnswer: 2,
        explanation: "Recipe instructions are written to inform readers about the steps needed to prepare a dish."
      },
      {
        id: 4,
        question: "In the sentence 'The ancient castle stood majestically on the hill,' what does 'majestically' mean?",
        options: [
          "Sadly",
          "Quickly",
          "In a grand and impressive manner",
          "Quietly"
        ],
        correctAnswer: 2,
        explanation: "Majestically means in a grand, impressive, or dignified manner, fitting for describing a castle."
      },
      {
        id: 5,
        question: "What is a supporting detail?",
        options: [
          "The title of a passage",
          "Information that helps explain or prove the main idea",
          "The last sentence of a paragraph",
          "The author's name"
        ],
        correctAnswer: 1,
        explanation: "Supporting details are pieces of information that help explain, prove, or give more information about the main idea."
      }
    ] as Question[]
  },
  {
    id: "vocabulary",
    icon: FileText,
    title: "Vocabulary Building",
    description: "Learn new words, synonyms, antonyms, and context clues to expand your vocabulary.",
    color: "bg-[#0d9488]",
    content: {
      overview: "Building a strong vocabulary helps you communicate better and understand what you read. In Grade 5, you will learn about synonyms, antonyms, homonyms, prefixes, suffixes, and how to use context clues.",
      keyPoints: [
        "Synonyms are words with similar meanings (happy/joyful)",
        "Antonyms are words with opposite meanings (hot/cold)",
        "Homonyms are words that sound the same but have different meanings (there/their/they're)",
        "Prefixes are added to the beginning of words to change meaning (un-, re-, pre-)",
        "Suffixes are added to the end of words to change meaning (-ful, -less, -tion)"
      ],
      example: {
        title: "Context Clues Example",
        text: "The famished children rushed to the dinner table. They had not eaten since breakfast and were extremely hungry.",
        questionPrompt: "What does 'famished' mean based on the context?",
        answer: "Famished means very hungry. The context clue 'They had not eaten since breakfast and were extremely hungry' helps us understand this."
      }
    },
    questions: [
      {
        id: 1,
        question: "Which word is a SYNONYM for 'beautiful'?",
        options: ["Ugly", "Gorgeous", "Plain", "Simple"],
        correctAnswer: 1,
        explanation: "Gorgeous is a synonym for beautiful as both words describe something very attractive or pleasing to look at."
      },
      {
        id: 2,
        question: "Which word is an ANTONYM for 'generous'?",
        options: ["Kind", "Giving", "Selfish", "Helpful"],
        correctAnswer: 2,
        explanation: "Selfish is the opposite of generous. A generous person gives freely, while a selfish person keeps things for themselves."
      },
      {
        id: 3,
        question: "What does the prefix 'un-' mean in the word 'unhappy'?",
        options: ["Very", "Again", "Not", "Before"],
        correctAnswer: 2,
        explanation: "The prefix 'un-' means 'not'. So 'unhappy' means 'not happy'."
      },
      {
        id: 4,
        question: "In the sentence 'The cacophony of sounds in the market made it hard to hear,' what does 'cacophony' most likely mean?",
        options: ["Silence", "Harsh mixture of sounds", "Music", "Whisper"],
        correctAnswer: 1,
        explanation: "The context tells us it was 'hard to hear', suggesting cacophony means a harsh, unpleasant mixture of sounds."
      },
      {
        id: 5,
        question: "Which pair of words are HOMONYMS?",
        options: ["Big/Large", "Hot/Cold", "Write/Right", "Run/Walk"],
        correctAnswer: 2,
        explanation: "Write and Right are homonyms because they sound the same but have different spellings and meanings."
      }
    ] as Question[]
  },
  {
    id: "grammar",
    icon: Pencil,
    title: "Grammar & Mechanics",
    description: "Master parts of speech, sentence structure, punctuation, and spelling rules.",
    color: "bg-[#f59e0b]",
    content: {
      overview: "Grammar and mechanics help us write and speak correctly. Understanding parts of speech, sentence structure, and punctuation rules makes your writing clear and effective.",
      keyPoints: [
        "Parts of speech: nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions",
        "Subject-verb agreement: The subject and verb must agree in number",
        "Sentence types: declarative, interrogative, imperative, exclamatory",
        "Punctuation: periods, commas, question marks, exclamation marks, apostrophes",
        "Capitalization rules for proper nouns, beginning of sentences, and titles"
      ],
      example: {
        title: "Subject-Verb Agreement",
        text: "The children play in the park. (plural subject = plural verb)\nThe child plays in the park. (singular subject = singular verb)",
        questionPrompt: "Why do we use 'play' with 'children' but 'plays' with 'child'?",
        answer: "The verb must agree with the subject in number. 'Children' is plural, so we use 'play'. 'Child' is singular, so we use 'plays'."
      }
    },
    questions: [
      {
        id: 1,
        question: "Which sentence uses correct subject-verb agreement?",
        options: [
          "The dogs runs in the yard.",
          "The dog run in the yard.",
          "The dogs run in the yard.",
          "The dog are running."
        ],
        correctAnswer: 2,
        explanation: "'Dogs' is plural, so it needs the plural verb 'run'. 'The dogs run' shows correct subject-verb agreement."
      },
      {
        id: 2,
        question: "What type of sentence is this? 'Please close the door.'",
        options: ["Declarative", "Interrogative", "Imperative", "Exclamatory"],
        correctAnswer: 2,
        explanation: "This is an imperative sentence because it gives a command or makes a request."
      },
      {
        id: 3,
        question: "Which word in this sentence is an ADVERB? 'She sang beautifully at the concert.'",
        options: ["She", "Sang", "Beautifully", "Concert"],
        correctAnswer: 2,
        explanation: "Beautifully is an adverb because it describes HOW she sang (it modifies the verb 'sang')."
      },
      {
        id: 4,
        question: "Where should the apostrophe go in this sentence? 'The girls books are on the table.' (The books belong to multiple girls)",
        options: ["Girl's", "Girls'", "Girls's", "No apostrophe needed"],
        correctAnswer: 1,
        explanation: "When showing possession for a plural noun ending in 's', add just an apostrophe after the 's': girls'"
      },
      {
        id: 5,
        question: "Which sentence is punctuated correctly?",
        options: [
          "We bought apples oranges and bananas",
          "We bought apples, oranges, and bananas.",
          "We bought, apples oranges and bananas.",
          "We bought apples oranges, and bananas"
        ],
        correctAnswer: 1,
        explanation: "Items in a list should be separated by commas, and the sentence should end with a period."
      }
    ] as Question[]
  },
  {
    id: "writing",
    icon: MessageSquare,
    title: "Writing Skills",
    description: "Develop narrative, expository, and persuasive writing abilities with guided practice.",
    color: "bg-[#ec4899]",
    content: {
      overview: "Writing is a powerful way to express your thoughts and ideas. In Grade 5, you will learn to write different types of texts including narratives (stories), expository texts (informational), and persuasive texts (convincing).",
      keyPoints: [
        "Narrative writing tells a story with characters, setting, and plot",
        "Expository writing explains or informs about a topic",
        "Persuasive writing tries to convince the reader to agree with your opinion",
        "All writing needs a clear beginning, middle, and end",
        "Use transition words to connect ideas (first, next, however, therefore)"
      ],
      example: {
        title: "Transition Words",
        text: "First, gather all your ingredients. Next, mix the flour and sugar together. Then, add the eggs and milk. Finally, bake the mixture for 30 minutes.",
        questionPrompt: "What transition words are used in this paragraph?",
        answer: "The transition words are: First, Next, Then, and Finally. They help show the order of steps."
      }
    },
    questions: [
      {
        id: 1,
        question: "What type of writing would you use to tell a story about your summer vacation?",
        options: ["Persuasive", "Expository", "Narrative", "Informational"],
        correctAnswer: 2,
        explanation: "Narrative writing is used to tell stories about events, real or imagined, including personal experiences like a vacation."
      },
      {
        id: 2,
        question: "Which is the BEST topic sentence for a paragraph about the benefits of exercise?",
        options: [
          "I like to exercise.",
          "Exercise is good.",
          "Regular exercise provides many important health benefits for your body and mind.",
          "People exercise."
        ],
        correctAnswer: 2,
        explanation: "A good topic sentence clearly states the main idea and gives the reader an idea of what the paragraph will discuss."
      },
      {
        id: 3,
        question: "Which transition word shows CONTRAST?",
        options: ["And", "However", "Also", "First"],
        correctAnswer: 1,
        explanation: "'However' is used to show contrast or introduce an opposing idea. 'And' and 'Also' add similar ideas, and 'First' shows sequence."
      },
      {
        id: 4,
        question: "What is the purpose of a conclusion in an essay?",
        options: [
          "To introduce the topic",
          "To add new information",
          "To summarize the main points and give a final thought",
          "To list all the vocabulary words"
        ],
        correctAnswer: 2,
        explanation: "A conclusion summarizes the main points of your writing and leaves the reader with a final thought or impression."
      },
      {
        id: 5,
        question: "In persuasive writing, what should you include to make your argument stronger?",
        options: [
          "Only your opinion",
          "Reasons and evidence to support your opinion",
          "Just the topic sentence",
          "A list of characters"
        ],
        correctAnswer: 1,
        explanation: "Strong persuasive writing includes reasons and evidence (facts, examples, statistics) to support your opinion and convince the reader."
      }
    ] as Question[]
  }
]

export default function LanguageArtsPage() {
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
        <section className="bg-[#0d4a5f] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Language Arts (Literacy)
            </h1>
            <p className="text-lg text-teal-100">
              Reading comprehension, vocabulary, grammar, and writing skills practice
            </p>
          </div>
        </section>

        {/* Mock Test Banner */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/language-arts/mock-test">
            <Card className="bg-gradient-to-r from-[#0d4a5f] to-[#0d9488] text-white hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <ClipboardCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Take the Mock PEP Test</h3>
                    <p className="text-white/80">45 minutes | 15 questions | Test your knowledge</p>
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
                  <Button variant="outline" className="w-full border-[#0d4a5f] text-[#0d4a5f] hover:bg-[#0d4a5f] hover:text-white">
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
