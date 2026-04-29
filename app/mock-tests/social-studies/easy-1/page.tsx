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
  Globe, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "history" | "geography" | "civics" | "economics"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5SsEasy1Questions: Question[] = [
  {
    id: 1,
    type: "history",
    skill: "National Heroes",
    question: `How many National Heroes does Jamaica have?`,
    options: [
      "Five",
      "Six",
      "Seven",
      "Eight",
    ],
    correctAnswer: 2,
    explanation: `Jamaica has seven National Heroes: Nanny, Sam Sharpe, Paul Bogle, George William Gordon, Marcus Garvey, Norman Manley, and Alexander Bustamante.`
  },
  {
    id: 2,
    type: "history",
    skill: "National Heroes",
    question: `Who was the only female National Hero of Jamaica?`,
    options: [
      "Queen Nanny",
      "Harriet Tubman",
      "Mary Seacole",
      "Louisa Bennett",
    ],
    correctAnswer: 0,
    explanation: `Queen Nanny (Nanny of the Maroons) is Jamaica's only female National Hero, celebrated for leading resistance against the British.`
  },
  {
    id: 3,
    type: "history",
    skill: "Emancipation",
    question: `In which year did slavery officially end in Jamaica?`,
    options: [
      "1808",
      "1834",
      "1838",
      "1865",
    ],
    correctAnswer: 2,
    explanation: `Full emancipation came on August 1, 1838, when the period of apprenticeship ended. August 1 is celebrated as Emancipation Day.`
  },
  {
    id: 4,
    type: "history",
    skill: "Independence",
    question: `In which year did Jamaica gain independence from Britain?`,
    options: [
      "1958",
      "1960",
      "1962",
      "1966",
    ],
    correctAnswer: 2,
    explanation: `Jamaica gained independence on August 6, 1962. Independence Day is celebrated annually on the first Monday in August.`
  },
  {
    id: 5,
    type: "history",
    skill: "Colonial History",
    question: `Which European country first colonised Jamaica?`,
    options: [
      "Britain",
      "France",
      "Portugal",
      "Spain",
    ],
    correctAnswer: 3,
    explanation: `Spain colonised Jamaica in 1494 after Christopher Columbus arrived. The Spanish called it 'Santiago de la Vega.'`
  },
  {
    id: 6,
    type: "history",
    skill: "National Heroes",
    question: `Paul Bogle is best remembered for:`,
    options: [
      "Writing Jamaica's constitution",
      "Leading the Morant Bay Rebellion in 1865",
      "Founding the UNIA",
      "Commanding the Maroons",
    ],
    correctAnswer: 1,
    explanation: `Paul Bogle led the Morant Bay Rebellion on October 11, 1865, protesting poverty and injustice in colonial Jamaica.`
  },
  {
    id: 7,
    type: "history",
    skill: "Cultural Heritage",
    question: `On which date is Jamaica's Emancipation Day celebrated?`,
    options: [
      "August 6",
      "October 18",
      "August 1",
      "May 23",
    ],
    correctAnswer: 2,
    explanation: `Emancipation Day is celebrated on August 1, marking the end of slavery in Jamaica in 1838.`
  },
  {
    id: 8,
    type: "history",
    skill: "First Peoples",
    question: `What was the name of the first people to live in Jamaica?`,
    options: [
      "Arawaks",
      "Aztecs",
      "Mayas",
      "Caribs",
    ],
    correctAnswer: 0,
    explanation: `The Taino, also known as Arawaks, were the indigenous people of Jamaica, arriving about 2,500 years ago from South America.`
  },
  {
    id: 9,
    type: "history",
    skill: "National Heroes",
    question: `Marcus Garvey founded which international organisation?`,
    options: [
      "CARICOM",
      "UNIA",
      "PNP",
      "JLP",
    ],
    correctAnswer: 1,
    explanation: `Marcus Garvey founded the Universal Negro Improvement Association (UNIA) in 1914 to champion the rights of Black people worldwide.`
  },
  {
    id: 10,
    type: "history",
    skill: "Independence",
    question: `Jamaica's national motto is:`,
    options: [
      "Land of Wood and Water",
      "Out of Many, One People",
      "One God, One Aim, One Destiny",
      "Unity is Strength",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's national motto is 'Out of Many, One People,' reflecting the country's diverse ethnic heritage.`
  },
  {
    id: 11,
    type: "geography",
    skill: "Physical Features",
    question: `What is the name of Jamaica's highest mountain?`,
    options: [
      "John Crow Mountains",
      "Santa Cruz Mountains",
      "Blue Mountain Peak",
      "Dry Harbour Mountains",
    ],
    correctAnswer: 2,
    explanation: `Blue Mountain Peak, at approximately 2,256 metres above sea level, is the highest point in Jamaica.`
  },
  {
    id: 12,
    type: "geography",
    skill: "Parishes",
    question: `How many parishes does Jamaica have?`,
    options: [
      "10",
      "12",
      "14",
      "16",
    ],
    correctAnswer: 2,
    explanation: `Jamaica has 14 parishes, divided into three counties: Cornwall, Middlesex, and Surrey.`
  },
  {
    id: 13,
    type: "geography",
    skill: "Capital City",
    question: `What is the capital city of Jamaica?`,
    options: [
      "Montego Bay",
      "Spanish Town",
      "Kingston",
      "Portmore",
    ],
    correctAnswer: 2,
    explanation: `Kingston is Jamaica's capital and largest city, located on the southeastern coast of the island.`
  },
  {
    id: 14,
    type: "geography",
    skill: "Physical Features",
    question: `What are the two main seas that border Jamaica?`,
    options: [
      "Pacific Ocean and Atlantic Ocean",
      "Caribbean Sea and Atlantic Ocean",
      "Indian Ocean and Caribbean Sea",
      "Gulf of Mexico and Caribbean Sea",
    ],
    correctAnswer: 1,
    explanation: `Jamaica is bordered by the Caribbean Sea to the south and the North Atlantic Ocean to the north.`
  },
  {
    id: 15,
    type: "geography",
    skill: "Maps",
    question: `A map's LEGEND (or KEY) is used to:`,
    options: [
      "Show the direction north",
      "Explain the symbols and colours used on the map",
      "Measure distances on a map",
      "Show the title of the map",
    ],
    correctAnswer: 1,
    explanation: `The legend or key explains what the symbols, colours, and lines on a map represent.`
  },
  {
    id: 16,
    type: "geography",
    skill: "Climate",
    question: `Jamaica's climate is BEST described as:`,
    options: [
      "Cold and snowy",
      "Tropical — warm throughout the year",
      "Desert — hot and dry",
      "Temperate — four clear seasons",
    ],
    correctAnswer: 1,
    explanation: `Jamaica has a tropical climate — warm temperatures throughout the year, moderated by trade winds, with a wet season from May to November.`
  },
  {
    id: 17,
    type: "geography",
    skill: "Parishes",
    question: `Which parish is the largest in Jamaica?`,
    options: [
      "Kingston",
      "St. Andrew",
      "St. Ann",
      "Westmoreland",
    ],
    correctAnswer: 2,
    explanation: `St. Ann is the largest parish in Jamaica by area, located on the north coast and known as the 'Garden Parish.'`
  },
  {
    id: 18,
    type: "geography",
    skill: "Natural Resources",
    question: `Which mineral is mined in Jamaica and is a major export?`,
    options: [
      "Gold",
      "Iron ore",
      "Bauxite",
      "Diamonds",
    ],
    correctAnswer: 2,
    explanation: `Bauxite (aluminium ore) is Jamaica's most important mineral resource and one of its largest exports.`
  },
  {
    id: 19,
    type: "geography",
    skill: "Physical Features",
    question: `What type of landform covers much of Jamaica's interior?`,
    options: [
      "Plains",
      "Deserts",
      "Mountains and hills",
      "Plateaus only",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's interior is largely mountainous, dominated by the Blue Mountains in the east and other hill ranges across the island.`
  },
  {
    id: 20,
    type: "geography",
    skill: "Caribbean",
    question: `Jamaica is located in which region of the world?`,
    options: [
      "Central America",
      "The Pacific",
      "The Caribbean",
      "South America",
    ],
    correctAnswer: 2,
    explanation: `Jamaica is an island nation in the Caribbean Sea, part of the Greater Antilles island group.`
  },
  {
    id: 21,
    type: "civics",
    skill: "Constitution",
    question: `In which year was Jamaica's Constitution adopted?`,
    options: [
      "1938",
      "1944",
      "1962",
      "1975",
    ],
    correctAnswer: 2,
    explanation: `Jamaica adopted its Constitution on independence in 1962. It is the supreme law of the land.`
  },
  {
    id: 22,
    type: "civics",
    skill: "Government",
    question: `Who is the HEAD OF STATE of Jamaica?`,
    options: [
      "The Prime Minister",
      "The President",
      "The Governor General",
      "The Chief Justice",
    ],
    correctAnswer: 2,
    explanation: `The Governor General is Jamaica's head of state, representing the British monarch and performing ceremonial duties.`
  },
  {
    id: 23,
    type: "civics",
    skill: "Government",
    question: `Who is the HEAD OF GOVERNMENT of Jamaica?`,
    options: [
      "The Governor General",
      "The Prime Minister",
      "The President",
      "The Chief Justice",
    ],
    correctAnswer: 1,
    explanation: `The Prime Minister is the head of government, responsible for running the country and leading the Cabinet.`
  },
  {
    id: 24,
    type: "civics",
    skill: "Parliament",
    question: `Jamaica's Parliament has TWO houses. They are the:`,
    options: [
      "Cabinet and Senate",
      "House of Representatives and Senate",
      "Senate and the Judiciary",
      "House of Representatives and the Cabinet",
    ],
    correctAnswer: 1,
    explanation: `Jamaica's Parliament consists of the elected House of Representatives and the appointed Senate.`
  },
  {
    id: 25,
    type: "civics",
    skill: "Rights",
    question: `Which of the following is a RESPONSIBILITY of a Jamaican citizen?`,
    options: [
      "Voting in all elections",
      "Obeying the laws of Jamaica",
      "Collecting taxes",
      "Making new laws",
    ],
    correctAnswer: 1,
    explanation: `Obeying the laws of Jamaica is a responsibility of every citizen. Voting is a right, and making laws is a parliamentary function.`
  },
  {
    id: 26,
    type: "civics",
    skill: "Government",
    question: `Which level of government is responsible for managing parishes?`,
    options: [
      "National government",
      "Regional government",
      "Local government (Parish Councils)",
      "CARICOM",
    ],
    correctAnswer: 2,
    explanation: `Parish Councils are the local government bodies responsible for managing services and development within each of Jamaica's 14 parishes.`
  },
  {
    id: 27,
    type: "civics",
    skill: "Electoral Process",
    question: `At what age can Jamaican citizens VOTE in elections?`,
    options: [
      "16",
      "18",
      "21",
      "25",
    ],
    correctAnswer: 1,
    explanation: `Jamaican citizens can vote from the age of 18, provided they are registered on the electoral roll.`
  },
  {
    id: 28,
    type: "civics",
    skill: "Rights",
    question: `Freedom of speech is an example of a:`,
    options: [
      "Responsibility",
      "Law",
      "Duty",
      "Right",
    ],
    correctAnswer: 3,
    explanation: `Freedom of speech is a fundamental RIGHT guaranteed by Jamaica's Constitution — citizens are entitled to express their opinions.`
  },
  {
    id: 29,
    type: "civics",
    skill: "CARICOM",
    question: `What does CARICOM stand for?`,
    options: [
      "Caribbean Community",
      "Caribbean Common Market",
      "Caribbean Community and Common Market",
      "Caribbean Association and Common Market",
    ],
    correctAnswer: 2,
    explanation: `CARICOM stands for Caribbean Community and Common Market, an organisation of Caribbean nations promoting economic integration and cooperation.`
  },
  {
    id: 30,
    type: "civics",
    skill: "Rule of Law",
    question: `The principle that everyone — including the government — must obey the law is called:`,
    options: [
      "Democracy",
      "Rule of Law",
      "Sovereignty",
      "Constitutionalism",
    ],
    correctAnswer: 1,
    explanation: `The Rule of Law means that no one is above the law, and all citizens and institutions must operate within the law.`
  },
  {
    id: 31,
    type: "economics",
    skill: "Economic Activities",
    question: `Which of the following is a PRIMARY economic activity?`,
    options: [
      "Manufacturing furniture",
      "Selling goods in a shop",
      "Farming sugar cane",
      "Teaching in a school",
    ],
    correctAnswer: 2,
    explanation: `Primary activities involve extracting natural resources. Farming sugar cane extracts/grows a natural product directly from the land.`
  },
  {
    id: 32,
    type: "economics",
    skill: "Agriculture",
    question: `Which crop is Jamaica's most famous export and is grown in the Blue Mountains?`,
    options: [
      "Sugarcane",
      "Cocoa",
      "Coffee",
      "Banana",
    ],
    correctAnswer: 2,
    explanation: `Jamaican Blue Mountain Coffee is one of the world's most prized coffees and is Jamaica's most famous agricultural export.`
  },
  {
    id: 33,
    type: "economics",
    skill: "Trade",
    question: `When a country buys goods from another country, this is called:`,
    options: [
      "Exporting",
      "Importing",
      "Bartering",
      "Investing",
    ],
    correctAnswer: 1,
    explanation: `Importing means bringing goods in from another country. Exporting means sending goods out to other countries.`
  },
  {
    id: 34,
    type: "economics",
    skill: "Community Services",
    question: `Which community service is responsible for putting out fires and rescuing people?`,
    options: [
      "The police force",
      "The fire brigade",
      "The army",
      "The coast guard",
    ],
    correctAnswer: 1,
    explanation: `The fire brigade (Jamaica Fire Brigade) is responsible for firefighting, rescue operations, and fire prevention.`
  },
  {
    id: 35,
    type: "economics",
    skill: "Entrepreneurship",
    question: `A person who starts and runs their own business is called an:`,
    options: [
      "Employee",
      "Employer",
      "Entrepreneur",
      "Economist",
    ],
    correctAnswer: 2,
    explanation: `An entrepreneur is someone who organises, launches, and manages a new business, accepting the risk in hopes of making a profit.`
  },
  {
    id: 36,
    type: "economics",
    skill: "Factors of Production",
    question: `Land, labour, capital, and enterprise are called the:`,
    options: [
      "Trade routes",
      "National resources",
      "Factors of production",
      "Economic systems",
    ],
    correctAnswer: 2,
    explanation: `The four factors of production are land (natural resources), labour (human work), capital (tools/money), and enterprise (organisation).`
  },
  {
    id: 37,
    type: "economics",
    skill: "Agriculture",
    question: `Which type of farming involves growing crops or raising animals for sale?`,
    options: [
      "Subsistence farming",
      "Commercial farming",
      "Organic farming",
      "Shifting cultivation",
    ],
    correctAnswer: 1,
    explanation: `Commercial farming is done with the aim of selling produce for profit — in contrast to subsistence farming, which is for personal/family use.`
  },
  {
    id: 38,
    type: "economics",
    skill: "Money",
    question: `What is the name of Jamaica's currency?`,
    options: [
      "Dollar",
      "Pound",
      "Jamaican Dollar",
      "Peso",
    ],
    correctAnswer: 2,
    explanation: `The Jamaican Dollar (JMD) is Jamaica's official currency.`
  },
  {
    id: 39,
    type: "economics",
    skill: "Trade",
    question: `Which organisation manages international trade rules globally?`,
    options: [
      "CARICOM",
      "IMF",
      "WTO",
      "UNESCO",
    ],
    correctAnswer: 2,
    explanation: `The World Trade Organisation (WTO) sets and enforces the rules that govern international trade between countries.`
  },
  {
    id: 40,
    type: "economics",
    skill: "Community",
    question: `Which of the following is an example of a community NEED rather than a WANT?`,
    options: [
      "A new video game",
      "A family vacation",
      "Clean drinking water",
      "A wide-screen television",
    ],
    correctAnswer: 2,
    explanation: `Clean drinking water is a basic need — essential for survival. The others are wants — things people desire but can live without.`
  }
]

const SECTION_CONFIG = [
  { type: "history" as const,   label: "History & Heritage",         note: "National Heroes, colonial era, independence, cultural heritage, Taino & African roots" },
  { type: "geography" as const, label: "Geography & Environment",     note: "physical features, maps, climate, natural resources, parishes, Caribbean" },
  { type: "civics" as const,    label: "Civics & Government",         note: "constitution, parliament, rights, citizenship, rule of law, CARICOM" },
  { type: "economics" as const, label: "Economics & Community",       note: "production, trade, agriculture, community services, entrepreneurship, interdependence" },
]

export default function G5SsEasy1MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5SsEasy1Questions : g5SsEasy1Questions.slice(0, FREE_QUESTION_LIMIT)
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
    t === "history" ? "History & Heritage" : t === "geography" ? "Geography & Environment"
    : t === "civics" ? "Civics & Government" : "Economics & Community"
  const secColor = (t: Question["type"]) =>
    t === "history" ? "bg-amber-50 text-amber-800" : t === "geography" ? "bg-green-50 text-green-800"
    : t === "civics" ? "bg-blue-50 text-blue-800" : "bg-purple-50 text-purple-800"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/social-studies"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Social Studies Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 text-center">
            <Globe className="mx-auto mb-4 h-14 w-14 text-green-700" />
            <CardTitle className="text-2xl text-green-800">Social Studies Easy 1</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Social Studies · Easy Level</p>
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
            <div className="rounded-lg border border-green-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Test Overview</h3>
              <p className="text-slate-700">This Grade 5 Social Studies test covers Jamaica's history and heritage, geography and environment, civics and government, and economics and community — all aligned to the NSC curriculum and PEP assessment standards.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-sm font-semibold text-amber-800">History & Heritage</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-sm font-semibold text-green-800">Geography & Environment</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-sm font-semibold text-blue-800">Civics & Government</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-sm font-semibold text-purple-800">Economics & Community</p><p className="text-xs text-slate-600">10 Questions</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-green-700">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-green-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-green-700 py-6 text-lg hover:bg-green-800">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-700" />
              <CardTitle className="text-2xl text-green-800">Social Studies Test Completed</CardTitle>
              <p className="text-slate-600">Social Studies Easy 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-green-700">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-green-700">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade to access all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="font-semibold text-green-800">{s.label}</p>
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
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-green-700">{q.skill}</span></p>
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
                <Button onClick={() => window.print()} className="flex-1 bg-green-700 hover:bg-green-800"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/social-studies" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Social Studies Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      <Header />
      <header className="bg-green-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/social-studies" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <Globe className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Social Studies Easy 1</h1><p className="text-green-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-green-600")}>
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
          <Card className="mb-6 border-green-100">
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
                      answers[currentQuestion] === idx ? "border-green-700 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-green-50/50")}>
                    <span className="font-medium text-green-800 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={() => setShowResults(true)} className="bg-green-700 hover:bg-green-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-green-700 hover:bg-green-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-green-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-green-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-green-700 text-white"
                      : answers[idx] !== null ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-700" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100" /><span>Answered</span></div>
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
