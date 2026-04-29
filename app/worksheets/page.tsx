"use client"

import { Header } from "@/components/header"
import { ColorBar } from "@/components/color-bar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Printer,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Lock,
  Crown,
  CheckCircle2,
  RefreshCw,
  Clock3,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

type WorksheetSheet = {
  title: string
  level: "Easy" | "Medium" | "Hard"
  pages: number
}

type WorksheetSubject = {
  subject: "Language Arts" | "Mathematics" | "Science" | "Social Studies"
  icon: typeof BookOpen
  color: string
  sheets: WorksheetSheet[]
}

const worksheets: WorksheetSubject[] = [
  {
    subject: "Language Arts",
    icon: BookOpen,
    color: "bg-blue-500",
    sheets: [
      { title: "Reading Comprehension - The Jamaican Market", level: "Easy", pages: 2 },
      { title: "Vocabulary Building - Synonyms & Antonyms", level: "Medium", pages: 2 },
      { title: "Grammar Practice - Subject-Verb Agreement", level: "Medium", pages: 3 },
      { title: "Writing Practice - Narrative Prompts", level: "Hard", pages: 2 },
      { title: "Parts of Speech Review", level: "Easy", pages: 2 },
    ],
  },
  {
    subject: "Mathematics",
    icon: Calculator,
    color: "bg-orange-500",
    sheets: [
      { title: "Number Operations - BODMAS Practice", level: "Medium", pages: 3 },
      { title: "Fractions & Decimals Workbook", level: "Hard", pages: 4 },
      { title: "Measurement Conversions", level: "Medium", pages: 2 },
      { title: "Geometry - Area & Perimeter", level: "Medium", pages: 3 },
      { title: "Word Problems Practice", level: "Hard", pages: 3 },
    ],
  },
  {
    subject: "Science",
    icon: FlaskConical,
    color: "bg-green-500",
    sheets: [
      { title: "Living Things - Food Chains & Webs", level: "Easy", pages: 2 },
      { title: "States of Matter Worksheet", level: "Medium", pages: 2 },
      { title: "Energy & Forces Review", level: "Medium", pages: 3 },
      { title: "Human Body Systems", level: "Hard", pages: 3 },
      { title: "The Water Cycle", level: "Easy", pages: 2 },
    ],
  },
  {
    subject: "Social Studies",
    icon: Globe,
    color: "bg-purple-500",
    sheets: [
      { title: "Jamaica's 14 Parishes Map Activity", level: "Easy", pages: 2 },
      { title: "National Heroes of Jamaica", level: "Medium", pages: 3 },
      { title: "Government & Civics Review", level: "Hard", pages: 2 },
      { title: "Caribbean History Timeline", level: "Medium", pages: 3 },
      { title: "Jamaican Culture & Traditions", level: "Easy", pages: 2 },
    ],
  },
]

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function getWorksheetBody(subject: WorksheetSubject["subject"], sheet: WorksheetSheet) {
  if (subject === "Language Arts" && sheet.title.includes("Jamaican Market")) {
    return `
      <h2>Reading Passage</h2>
      <p>
        On Saturday morning, Marsha went with her grandmother to Coronation Market in Kingston.
        The market was full of colour and sound. Vendors called out their prices, customers moved
        from stall to stall, and the smell of ripe fruit filled the air. Marsha saw piles of yellow
        bananas, red tomatoes, green callaloo, and bright orange carrots.
      </p>
      <p>
        Her grandmother explained that many farmers travel from the countryside very early to sell
        their produce. “The market helps families earn a living,” she said. Marsha watched as one
        woman carefully arranged mangoes into neat rows to attract customers.
      </p>
      <p>
        Before leaving, Marsha helped to choose vegetables for dinner. She realised that the market
        was not only a place to shop, but also an important part of Jamaican life and culture.
      </p>

      <h2>Questions</h2>
      <ol>
        <li>Where did Marsha go on Saturday morning?</li>
        <li>Write two details that show the market was busy and lively.</li>
        <li>Why did Marsha's grandmother say the market is important?</li>
        <li>What lesson did Marsha learn before leaving?</li>
        <li>Circle the word that best describes the market: quiet / colourful / empty</li>
      </ol>

      <h2>Vocabulary</h2>
      <p>Write the meaning of these words as used in the passage: <strong>vendors</strong>, <strong>produce</strong>, <strong>culture</strong>.</p>
    `
  }

  if (subject === "Language Arts" && sheet.title.includes("Synonyms")) {
    return `
      <h2>Part A: Synonyms</h2>
      <ol>
        <li>Write a synonym for: happy</li>
        <li>Write a synonym for: big</li>
        <li>Write a synonym for: quick</li>
        <li>Write a synonym for: careful</li>
        <li>Write a synonym for: beautiful</li>
      </ol>

      <h2>Part B: Antonyms</h2>
      <ol>
        <li>Write an antonym for: early</li>
        <li>Write an antonym for: strong</li>
        <li>Write an antonym for: noisy</li>
        <li>Write an antonym for: generous</li>
        <li>Write an antonym for: ancient</li>
      </ol>

      <h2>Challenge</h2>
      <p>Use any two synonyms and any two antonyms from above in four complete sentences.</p>
    `
  }

  if (subject === "Language Arts" && sheet.title.includes("Subject-Verb")) {
    return `
      <h2>Choose the correct verb</h2>
      <ol>
        <li>The boy (run / runs) to school every morning.</li>
        <li>The girls (plays / play) netball after class.</li>
        <li>My teacher (explain / explains) the lesson clearly.</li>
        <li>The dogs (barks / bark) loudly at night.</li>
        <li>Each student (has / have) a notebook.</li>
      </ol>

      <h2>Rewrite correctly</h2>
      <ol>
        <li>The children was excited.</li>
        <li>My friend like mangoes.</li>
        <li>The birds sings sweetly.</li>
      </ol>

      <h2>Extension</h2>
      <p>Write five original sentences showing correct subject-verb agreement.</p>
    `
  }

  if (subject === "Language Arts" && sheet.title.includes("Narrative Prompts")) {
    return `
      <h2>Write a Story</h2>
      <p>Choose <strong>one</strong> prompt and write a well-organised story.</p>
      <ol>
        <li>The day I found something unexpected on my way home.</li>
        <li>A visit to a place in Jamaica I will never forget.</li>
        <li>The storm that changed our plans.</li>
      </ol>

      <h2>Checklist</h2>
      <ul>
        <li>Use a clear beginning, middle, and ending.</li>
        <li>Include characters, setting, and events.</li>
        <li>Use interesting vocabulary.</li>
        <li>Check punctuation and spelling.</li>
      </ul>
    `
  }

  if (subject === "Language Arts" && sheet.title.includes("Parts of Speech")) {
    return `
      <h2>Identify the Part of Speech</h2>
      <p>Underline each word and label it as noun, verb, adjective, or adverb.</p>
      <ol>
        <li>The energetic boy ran quickly.</li>
        <li>My blue bag is on the chair.</li>
        <li>The teacher spoke softly.</li>
        <li>Jamaica has beautiful beaches.</li>
      </ol>

      <h2>Write Your Own</h2>
      <p>Write:</p>
      <ul>
        <li>3 nouns</li>
        <li>3 verbs</li>
        <li>3 adjectives</li>
        <li>3 adverbs</li>
      </ul>
    `
  }

  if (subject === "Mathematics" && sheet.title.includes("BODMAS")) {
    return `
      <h2>Solve using BODMAS</h2>
      <ol>
        <li>8 + 6 × 3</li>
        <li>(12 - 4) × 5</li>
        <li>24 ÷ 3 + 7</li>
        <li>18 - (2 + 4)</li>
        <li>6 × (5 + 3) - 4</li>
        <li>30 ÷ (2 × 3)</li>
      </ol>

      <h2>Word Problem</h2>
      <p>A shop sells 4 packs of pencils with 6 pencils in each pack. Then 5 more pencils are added. How many pencils are there in all?</p>
    `
  }

  if (subject === "Mathematics" && sheet.title.includes("Fractions & Decimals")) {
    return `
      <h2>Fractions</h2>
      <ol>
        <li>Shade 3/4 of a rectangle.</li>
        <li>Write an equivalent fraction for 1/2.</li>
        <li>Add: 1/4 + 2/4</li>
        <li>Subtract: 5/8 - 2/8</li>
      </ol>

      <h2>Decimals</h2>
      <ol>
        <li>Write 3/10 as a decimal.</li>
        <li>Write 0.7 as a fraction.</li>
        <li>Add: 2.4 + 1.3</li>
        <li>Subtract: 5.0 - 2.6</li>
      </ol>
    `
  }

  if (subject === "Mathematics" && sheet.title.includes("Measurement")) {
    return `
      <h2>Convert the units</h2>
      <ol>
        <li>200 cm = ____ m</li>
        <li>3 kg = ____ g</li>
        <li>2 L = ____ mL</li>
        <li>1500 m = ____ km and ____ m</li>
      </ol>

      <h2>Word Problem</h2>
      <p>A bottle holds 2 litres of juice. How many millilitres is that?</p>
    `
  }

  if (subject === "Mathematics" && sheet.title.includes("Geometry")) {
    return `
      <h2>Area and Perimeter</h2>
      <ol>
        <li>A rectangle is 8 cm long and 3 cm wide. Find the perimeter.</li>
        <li>A square has sides of 6 cm. Find the area.</li>
        <li>A rectangle is 10 cm by 4 cm. Find the area.</li>
      </ol>

      <h2>Draw and Label</h2>
      <p>Draw one rectangle and one square. Label the sides and calculate the area and perimeter of each.</p>
    `
  }

  if (subject === "Mathematics" && sheet.title.includes("Word Problems")) {
    return `
      <h2>Solve the problems</h2>
      <ol>
        <li>A farmer picked 48 mangoes and packed them equally into 6 baskets. How many went into each basket?</li>
        <li>A bus carried 36 passengers. At the next stop, 9 got off and 5 got on. How many passengers are on the bus now?</li>
        <li>A shop sold 7 boxes of chalk with 12 pieces in each box. How many pieces of chalk were sold?</li>
      </ol>
    `
  }

  if (subject === "Science" && sheet.title.includes("Food Chains")) {
    return `
      <h2>Complete the food chains</h2>
      <ol>
        <li>Grass → Goat → ______</li>
        <li>Leaves → Caterpillar → Bird → ______</li>
      </ol>

      <h2>Answer the questions</h2>
      <ol>
        <li>What is a producer?</li>
        <li>What is a consumer?</li>
        <li>Why are plants important in a food chain?</li>
      </ol>
    `
  }

  if (subject === "Science" && sheet.title.includes("States of Matter")) {
    return `
      <h2>Fill in the blanks</h2>
      <ol>
        <li>A solid has a fixed ______.</li>
        <li>A liquid takes the shape of its ______.</li>
        <li>A gas spreads out to fill the available ______.</li>
      </ol>

      <h2>Sort the items</h2>
      <p>Classify these as solid, liquid, or gas: water, steam, ice, juice, oxygen.</p>
    `
  }

  if (subject === "Science" && sheet.title.includes("Energy & Forces")) {
    return `
      <h2>Multiple choice</h2>
      <ol>
        <li>Which force pulls objects toward Earth? ______</li>
        <li>Name one form of energy used in homes. ______</li>
      </ol>

      <h2>Short response</h2>
      <p>Explain the difference between a push and a pull. Give one example of each.</p>
    `
  }

  if (subject === "Science" && sheet.title.includes("Human Body")) {
    return `
      <h2>Label and explain</h2>
      <ol>
        <li>Name the system that helps us breathe.</li>
        <li>Name the system that pumps blood around the body.</li>
        <li>Why is the digestive system important?</li>
      </ol>

      <h2>Healthy habits</h2>
      <p>Write four habits that help to keep the body healthy.</p>
    `
  }

  if (subject === "Science" && sheet.title.includes("Water Cycle")) {
    return `
      <h2>Order the stages</h2>
      <p>Put these in the correct order: condensation, evaporation, precipitation, collection.</p>

      <h2>Explain</h2>
      <ol>
        <li>What happens during evaporation?</li>
        <li>What happens during condensation?</li>
        <li>Why is the water cycle important?</li>
      </ol>
    `
  }

  if (subject === "Social Studies" && sheet.title.includes("14 Parishes")) {
    return `
      <h2>Map Activity</h2>
      <ol>
        <li>Name Jamaica's capital city.</li>
        <li>List any five parishes in Jamaica.</li>
        <li>Which parish do you live in?</li>
      </ol>

      <h2>Challenge</h2>
      <p>Colour a map of Jamaica and label all 14 parishes.</p>
    `
  }

  if (subject === "Social Studies" && sheet.title.includes("National Heroes")) {
    return `
      <h2>Research and recall</h2>
      <ol>
        <li>Name three National Heroes of Jamaica.</li>
        <li>Choose one hero and write two important facts about him or her.</li>
        <li>Why do Jamaicans honour National Heroes?</li>
      </ol>
    `
  }

  if (subject === "Social Studies" && sheet.title.includes("Government")) {
    return `
      <h2>Civics review</h2>
      <ol>
        <li>Who is the head of government in Jamaica?</li>
        <li>What is the role of laws in a country?</li>
        <li>Name one responsibility of a citizen.</li>
      </ol>

      <h2>Scenario</h2>
      <p>Write two ways students can show good citizenship at school.</p>
    `
  }

  if (subject === "Social Studies" && sheet.title.includes("History Timeline")) {
    return `
      <h2>Timeline task</h2>
      <ol>
        <li>Place these in order: Emancipation, Independence, arrival of the Spanish, arrival of the British.</li>
        <li>In what year did Jamaica gain Independence?</li>
      </ol>

      <h2>Short response</h2>
      <p>Why is it important to learn about Caribbean history?</p>
    `
  }

  if (subject === "Social Studies" && sheet.title.includes("Culture & Traditions")) {
    return `
      <h2>Culture and traditions</h2>
      <ol>
        <li>Name two Jamaican foods that are part of our culture.</li>
        <li>Name two Jamaican festivals or celebrations.</li>
        <li>How do traditions help to keep culture alive?</li>
      </ol>

      <h2>Your response</h2>
      <p>Write a short paragraph about one Jamaican tradition you enjoy.</p>
    `
  }

  return `
    <h2>Worksheet Tasks</h2>
    <ol>
      <li>Read the title carefully and explain what this worksheet is about.</li>
      <li>Write three facts you already know about this topic.</li>
      <li>Complete five practice questions related to the topic.</li>
      <li>Write one paragraph explaining what you learned.</li>
    </ol>
  `
}

function buildPrintHtml(subject: WorksheetSubject["subject"], sheet: WorksheetSheet) {
  const body = getWorksheetBody(subject, sheet)
  const today = new Date().toLocaleDateString()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(sheet.title)}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1e293b;
            margin: 0;
            line-height: 1.5;
          }

          .header {
            border-bottom: 3px solid #0d4a5f;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }

          .brand {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #0d4a5f;
            margin-bottom: 8px;
          }

          .title {
            font-size: 26px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px 0;
          }

          .subtitle {
            font-size: 14px;
            color: #475569;
            margin: 0;
          }

          .meta {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .meta-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 12px;
            min-height: 28px;
          }

          h2 {
            color: #0d4a5f;
            margin-top: 24px;
            margin-bottom: 8px;
            font-size: 18px;
          }

          p, li {
            font-size: 14px;
          }

          ol, ul {
            padding-left: 20px;
          }

          .footer-note {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #cbd5e1;
            font-size: 12px;
            color: #64748b;
          }

          .answer-space {
            border-bottom: 1px solid #cbd5e1;
            height: 26px;
            margin: 10px 0;
          }

          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Grade 5 PEP • Printable Worksheet</div>
          <h1 class="title">${escapeHtml(sheet.title)}</h1>
          <p class="subtitle">${escapeHtml(subject)} • ${escapeHtml(sheet.level)} • ${sheet.pages} page(s)</p>
        </div>

        <div class="meta">
          <div class="meta-box"><strong>Name:</strong> ____________________________________</div>
          <div class="meta-box"><strong>Date:</strong> ${escapeHtml(today)}</div>
        </div>

        ${body}

        <h2>Working Space</h2>
        <div class="answer-space"></div>
        <div class="answer-space"></div>
        <div class="answer-space"></div>
        <div class="answer-space"></div>

        <div class="footer-note">
          Prepared for Grade 5 PEP practice. Print, complete neatly, and review your answers carefully.
        </div>
      </body>
    </html>
  `
}

export default function WorksheetsPage() {
  const { isPremium, activeSubscription, refreshUser } = useAuth()

  const hasPendingAccess = activeSubscription?.status === "pending"
  const hasActiveAccess = isPremium

  const handlePrint = (subject: WorksheetSubject["subject"], sheet: WorksheetSheet) => {
    if (!hasActiveAccess) {
      alert("Premium access is required to download and print worksheets.")
      return
    }

    const printWindow = window.open("", "_blank", "width=900,height=700")

    if (!printWindow) {
      alert("Please allow pop-ups in your browser to print worksheets.")
      return
    }

    printWindow.document.open()
    printWindow.document.write(buildPrintHtml(subject, sheet))
    printWindow.document.close()

    printWindow.focus()

    const runPrint = () => {
      printWindow.print()
    }

    if (printWindow.document.readyState === "complete") {
      runPrint()
    } else {
      printWindow.onload = runPrint
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="bg-[#0d4a5f] text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#f59e0b] flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Printable Worksheets</h1>
                <p className="text-teal-200">Practice offline with these worksheets</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {!hasActiveAccess && !hasPendingAccess && (
            <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0d9488]/10 border-2 border-[#f59e0b] rounded-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f]">Premium Feature</h3>
                  <p className="text-gray-600">
                    Printable worksheets are available for approved premium members.
                    Upgrade your access to unlock downloads and printing.
                  </p>
                </div>

                <Link href="/pricing">
                  <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!hasActiveAccess && hasPendingAccess && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Clock3 className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f]">Payment Pending Verification</h3>
                  <p className="text-gray-700">
                    Your payment has been submitted and is awaiting admin approval.
                    Once approved, printable worksheets will unlock automatically.
                  </p>
                </div>

                <Button
                  onClick={() => void refreshUser()}
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Access
                </Button>
              </div>
            </div>
          )}

          {hasActiveAccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f]">Premium Access Active</h3>
                  <p className="text-gray-700">
                    Your printable worksheets are unlocked. You can now open and print
                    the worksheets below.
                  </p>
                </div>

                <Badge className="bg-green-600 text-white px-3 py-1">
                  Active
                </Badge>
              </div>
            </div>
          )}

          <Card className="mb-8 border-2 border-[#0d9488]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Printer className="w-8 h-8 text-[#0d9488] flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Practice Anytime, Anywhere</h2>
                  <p className="text-gray-600">
                    These printable worksheets allow you to practice without a computer.
                    Print them out and work through the exercises at your own pace.
                    Great for homework, revision, or extra practice before the PEP examination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {worksheets.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center`}>
                    <subject.icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">{subject.subject}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subject.sheets.map((sheet, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge
                            variant="outline"
                            className={`
                              ${sheet.level === "Easy" ? "text-green-600 border-green-300" : ""}
                              ${sheet.level === "Medium" ? "text-orange-600 border-orange-300" : ""}
                              ${sheet.level === "Hard" ? "text-red-600 border-red-300" : ""}
                            `}
                          >
                            {sheet.level}
                          </Badge>
                          <span className="text-xs text-gray-500">{sheet.pages} pages</span>
                        </div>

                        <h3 className="font-semibold text-[#1e3a5f] mb-3 text-sm">
                          {sheet.title}
                        </h3>

                        <Button
                          onClick={() => handlePrint(subject.subject, sheet)}
                          variant="outline"
                          size="sm"
                          disabled={!hasActiveAccess}
                          className={`w-full ${!hasActiveAccess ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          {hasActiveAccess ? (
                            <Printer className="w-4 h-4 mr-2" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          {hasActiveAccess ? "Print Worksheet" : "Premium Only"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ColorBar />
      </main>

      <Footer />
    </div>
  )
}
