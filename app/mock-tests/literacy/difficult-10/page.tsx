"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveStudentTestResult } from "@/lib/student-test-results";
import { prepareAssessment, preparePreview } from "@/lib/assessment-engine";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
  BookOpen,
  RotateCcw,
  Home,
  Lock,
  Crown,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const FREE_QUESTION_LIMIT = 5;

interface Question {
  id: number;
  type: "reading" | "vocabulary" | "grammar" | "writing";
  skill: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/* ============================================================
   DIFFICULT 10  ·  Passage 1: The King's Library
                    Passage 2: The Future of Clean Energy
   ============================================================ */

const P1 = `The door to the King’s Library had been locked for twenty years. Kofi stood beside his aunt, Miss Lorna, as she turned the rusted key. The heavy wooden door swung open, releasing a smell of old paper, dust, and polished wood.

Inside, the room was enormous. Shelves reached from floor to ceiling, packed with hundreds of books, ledgers, and rolled-up maps. Sunlight filtered through a single window, lighting up dancing particles of dust. Kofi felt a mixture of awe and doubt. He was only eleven. What could he possibly do in a place like this?

"We need to find the 1898 Land Agreement," Miss Lorna said, pulling a list from her bag. "The community council has been searching for it for months, and time is running out. Without it, we cannot prove we own the field where they want to build the health centre. The land could be taken away."

Kofi looked at the towering shelves. "How will we ever find one paper in all of this?"

"We read," Miss Lorna said simply. She pointed to a small desk in the corner where a leather-bound catalog sat. "The original owner, Judge Sterling, catalogued every item in this room. If we read his system, we can find anything."

Kofi sat down and opened the catalog. The pages were yellowed but perfectly legible. The entries were organised by year, then by topic. Kofi turned to the section marked 1898 and ran his finger down the page. His heart sank. There were dozens of entries for that year—letters, receipts, maps—but no Land Agreement.

"It is not listed under 1898," Kofi said.

Miss Lorna frowned. "Are you sure?"

Kofi checked again. Then he noticed something. Next to one entry, dated 1899, Judge Sterling had written a small note in the margin: "See correspondence filed under Land Dispute, 1895–1898."

"Why would an 1899 letter mention a land dispute from 1895?" Kofi wondered.

Miss Lorna leaned over his shoulder. "Because the dispute was not settled in 1898. It probably carried over. He might have filed the agreement with the earlier papers."

Kofi flipped back to the 1895 section. There, between two thick ledgers, was a folder labelled "Land Dispute—Eastern Boundary." Inside was a single sheet of paper with an official seal. It was the 1898 Land Agreement.

Miss Lorna held the paper carefully, a smile spreading across her face. "You did it, Kofi."

"I just read the note," Kofi said.

Miss Lorna shook her head. "You did something very special. You paid attention to a small detail that most people would skip over. You did not just look for the answer where you expected it. You followed the evidence, even when it led you in a different direction."

As they left the library, Kofi looked back at the shelves. He used to think libraries were just places to store old books. Now he understood. A library was a place where careful readers could solve real problems. The answers were always there, hidden between the shelves, waiting for someone patient enough to look.`;

const P2 = `For most of human history, people burned wood or coal to create energy. Today, we know that burning these fuels releases gases that warm the planet and pollute the air. To protect the environment, scientists and engineers are turning to clean energy—power sources that do not produce harmful emissions.

Solar energy is one of the fastest-growing clean sources. Solar panels capture sunlight and turn it into electricity. The technology has become much cheaper over the past twenty years, making it more accessible to ordinary families. They work well in sunny places and can be installed on rooftops, meaning families and schools can generate their own power. However, solar panels only produce electricity when the sun is shining. At night or during cloudy days, they stop working. This means communities that rely on solar power must have a way to store energy for later use, usually using large batteries, which can be expensive.

Wind energy uses large turbines with long blades to capture the energy of moving air. When the wind blows, the blades spin and generate electricity. Wind farms can be built on land or out at sea. Offshore wind farms, built in the ocean, tend to be more efficient because ocean winds are stronger and more constant. Like solar power, wind power is clean and renewable, meaning it will never run out. But it has a similar limitation: if the wind stops blowing, the turbines stop turning. Also, some people feel that wind farms take up too much land or change the look of the countryside.

Hydroelectric power generates electricity by using the force of flowing water, usually from a river that has been dammed. Water rushes through the dam and spins turbines inside. Hydroelectric power is very reliable because rivers flow day and night, unlike sunlight or wind, which come and go. Countries like Jamaica already use small hydroelectric plants in the mountains. However, building large dams can flood valleys and change the habitats of fish and other wildlife. Droughts can also reduce the water flow, making the system less effective.

Geothermal energy taps into the natural heat deep underground. This heat comes from the slow breakdown of radioactive elements in the earth's core. Water is pumped into the earth, where it is heated by hot rocks, and then brought back up as steam to spin turbines. This source is extremely reliable because the earth's heat is always present. But it only works well in places where the underground heat is close enough to the surface to reach easily.

Another promising source is wave or tidal energy, which uses the constant movement of ocean waves to generate power. This could be very useful for island nations like Jamaica, surrounded by water. However, the technology is still new and can be difficult to maintain in salty, stormy ocean conditions.

The smartest approach to clean energy is not to choose just one source. Scientists call this an energy mix. Different places have different strengths. A sunny, windy island might combine solar and wind power. A mountainous region might rely on hydroelectric energy. The key challenge for scientists today is improving energy storage—developing better, cheaper batteries so that the power generated on sunny or windy days can be saved for when it is needed most. Clean energy is not just about technology. It is about matching the right solution to the right place and planning carefully for the future.`;

const g5LaDiff10Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhy did Miss Lorna and Kofi go to the King's Library?`,
    options: [
      "To return a book that Kofi had borrowed",
      "To find a document proving the community owned a piece of land",
      "To clean and organise the old shelves",
      "To sell the old books to a museum"
    ],
    correctAnswer: 1,
    explanation: `Miss Lorna explicitly states they need the 1898 Land Agreement to prove the community owns the field for the health centre.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhy did Kofi's heart sink when he looked at the 1898 section of the catalog?`,
    options: [
      "He realised the catalog was written in a language he did not understand.",
      "He found the document but it was torn in half.",
      "There were dozens of entries for that year, and none of them was the Land Agreement.",
      "Miss Lorna told him they were running out of time."
    ],
    correctAnswer: 2,
    explanation: `The passage states there were "dozens of entries for that year—letters, receipts, maps—but no Land Agreement," which caused his disappointment.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhy did Judge Sterling most likely write the note in the 1899 margin?`,
    options: [
      "He wanted to hide the Land Agreement so no one could find it.",
      "He had forgotten where he filed the papers and was reminding himself.",
      "The dispute continued past 1898, so he connected the later letter to the earlier papers.",
      "He did not have enough space in the 1898 section of the catalog."
    ],
    correctAnswer: 2,
    explanation: `Miss Lorna infers that because the dispute was not settled in 1898, it carried over, leading Judge Sterling to cross-reference the 1899 letter with the older files.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat is the most important idea about learning that the author wants to share?`,
    options: [
      "Libraries are only useful for historians and judges.",
      "Young children should not be allowed in old buildings.",
      "Having the right answer is more important than the process of finding it.",
      "Careful reading and attention to small details can solve real-world problems."
    ],
    correctAnswer: 3,
    explanation: `The story demonstrates that Kofi solved a major community problem not by luck, but by carefully reading and following a small, easily overlooked clue.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.\n\n${P1}\n\nBased on the story, how will Kofi most likely react the next time he faces a difficult research task?`,
    options: [
      "He will look beyond the obvious place and pay close attention to small clues.",
      "He will give up quickly if the answer is not in the first place he looks.",
      "He will ask an adult to do all the reading for him.",
      "He will guess the answer instead of looking for evidence."
    ],
    correctAnswer: 0,
    explanation: `Kofi learned that the answer is not always where you expect it and that small details matter, so he would likely apply this patient, observant approach again.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.\n\n${P1}\n\nHow do Kofi's and Miss Lorna's reactions to finding the document differ?`,
    options: [
      "Both of them shout with excitement and call the newspaper.",
      "Miss Lorna is relieved and praises him, while Kofi feels his effort was nothing special.",
      "Kofi is proud, while Miss Lorna thinks the document is unimportant.",
      "Miss Lorna wants to leave immediately, but Kofi wants to keep searching."
    ],
    correctAnswer: 1,
    explanation: `Miss Lorna smiles and tells Kofi he did "something very special," while Kofi downplays his role, saying he "just read the note."`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat can the reader conclude about the way the library was organised?`,
    options: [
      "It was organised poorly because the document was not where it belonged.",
      "It was organised alphabetically by the authors' last names.",
      "It was organised logically, but finding information required careful reading of cross-references.",
      "It was organised by the colour of the book covers."
    ],
    correctAnswer: 2,
    explanation: `The catalog was organized by year and topic, a logical system, but finding the specific document required reading a margin note and cross-referencing another section.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.\n\n${P1}\n\nMiss Lorna says Kofi did "something very special" because he`,
    options: [
      "opened the catalog to the exact right page on his first try",
      "was the youngest person ever allowed inside the King's Library",
      "memorised the entire catalog so he would not have to read it again",
      "followed a small, overlooked clue instead of giving up when the answer was not where he expected it"
    ],
    correctAnswer: 3,
    explanation: `Miss Lorna specifically praises him for paying attention to a small detail and following the evidence in an unexpected direction.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat would most likely have happened if the Land Agreement had NOT been found?`,
    options: [
      "The land would likely have been taken away, preventing the health centre from being built.",
      "The community would have built the health centre anyway without it.",
      "Judge Sterling would have returned to rewrite the document.",
      "Miss Lorna would have been arrested for losing the paper."
    ],
    correctAnswer: 0,
    explanation: `Miss Lorna stated that without the document, "we cannot prove we own the field" and "the land could be taken away," implying the health centre could not be built there.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Point of View",
    question: `Read the passage then answer the question.\n\n${P1}\n\nThe story is told from Kofi's perspective. How does this affect what the reader learns?`,
    options: [
      "We only know what Kofi thinks and feels, which helps us understand his growth.",
      "We learn Miss Lorna's secret thoughts about the community council.",
      "We get a report from Judge Sterling about why he wrote the catalog.",
      "We see the events from the perspective of the land developers."
    ],
    correctAnswer: 0,
    explanation: `Because the story is told from Kofi's point of view, we experience his initial doubt, his discovery process, and his changing understanding of libraries.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Synthesis",
    question: `Read the passages then answer the question.\n\n${P1}\n\n${P2}\n\nBoth passages suggest that`,
    options: [
      "old ways of doing things are always better than new technology",
      "solving complex problems requires matching the right approach to the specific situation",
      "only experts can make important decisions",
      "reading books is no longer useful in the modern world"
    ],
    correctAnswer: 1,
    explanation: `Kofi matched his reading strategy to the library's catalog system, while Passage 2 explains that clean energy requires matching the right source to local conditions.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.\n\n${P2}\n\nThe author supports the idea that solar and wind have similar limitations by pointing out that`,
    options: [
      "both require building large dams that flood valleys",
      "both were invented by the same person",
      "both stop producing power when the natural resource they depend on is unavailable",
      "both are too expensive for any country to afford"
    ],
    correctAnswer: 2,
    explanation: `The passage explicitly notes that solar stops working at night and wind stops when the air is still, showing they both depend on variable natural resources.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.\n\n${P2}\n\nWhat can the reader conclude about the author's view of building large hydroelectric dams?`,
    options: [
      "They are the only energy source worth investing in.",
      "They do not produce enough electricity to be useful.",
      "They are completely harmful and should never be built.",
      "They are reliable but come with environmental trade-offs that must be considered."
    ],
    correctAnswer: 3,
    explanation: `The author notes hydroelectric power is reliable but immediately points out that large dams can flood valleys and harm wildlife, showing a balanced view.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.\n\n${P2}\n\nIf a small island has very little wind but strong ocean waves and sunshine, which energy mix would the author most likely recommend?`,
    options: [
      "Relying entirely on geothermal energy",
      "Combining solar power with wave or tidal energy",
      "Using only large hydroelectric dams",
      "Burning coal because it is more reliable"
    ],
    correctAnswer: 1,
    explanation: `The author emphasizes an "energy mix" based on local strengths. For a sunny, wave-rich island with little wind, solar and wave energy fit the conditions perfectly.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.\n\n${P2}\n\nHow does the passage contrast hydroelectric power with solar and wind power?`,
    options: [
      "Hydroelectric is described as more reliable because water flows constantly, while solar and wind depend on weather conditions.",
      "Hydroelectric is described as much newer technology than solar and wind.",
      "Solar and wind are said to be cheaper, while hydroelectric is too expensive.",
      "Hydroelectric is shown to pollute the air, while solar and wind do not."
    ],
    correctAnswer: 0,
    explanation: `The passage states that hydroelectric is "very reliable because rivers flow day and night," explicitly contrasting it with sunlight and wind, which "come and go."`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is the closest synonym for "enormous" as used in Passage 1?`,
    options: [
      "tiny",
      "very large",
      "empty",
      "modern"
    ],
    correctAnswer: 1,
    explanation: `"Enormous" means very large in size. "Very large" is the closest synonym.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word means the OPPOSITE of "doubt" as used in Passage 1?`,
    options: [
      "uncertainty",
      "confusion",
      "confidence",
      "sadness"
    ],
    correctAnswer: 2,
    explanation: `"Doubt" means feeling unsure. "Confidence" means feeling sure, making it the opposite.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The word "renewable" in Passage 2 contains the prefix "re-." What does "renewable" mean?`,
    options: [
      "able to be made new again",
      "not able to be used",
      "made of wood",
      "very expensive"
    ],
    correctAnswer: 0,
    explanation: `"Re-" means again, and "new" means fresh. Renewable energy comes from sources that naturally replenish, or make themselves new again.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The suffix "-able" means "capable of." If something is "reliable," it is`,
    options: [
      "full of reliances",
      "lacking reliability",
      "in the process of relying",
      "capable of being depended on"
    ],
    correctAnswer: 3,
    explanation: `"Reli" comes from rely, and "-able" means capable of. So reliable means capable of being depended on.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Word Meaning",
    question: "What does the phrase \"trade-offs\" mean?",
    options: [
      "things that are traded between countries",
      "tools used by engineers to measure wind",
      "the cost of building a factory",
      "exchanges where you give up one thing to gain another"
    ],
    correctAnswer: 3,
    explanation: `In the context of energy, trade-offs refer to accepting a downside (like cost or land use) to gain a benefit (like clean power).`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: "Which meaning of \"seal\" matches its meaning in Passage 1?",
    options: [
      "The official stamp that made the document legal.",
      "A marine animal that lives in the ocean.",
      "A type of waterproof paint.",
      "A sticky substance used to close envelopes."
    ],
    correctAnswer: 0,
    explanation: `Passage 1 mentions "an official seal," which refers to a stamp used to authenticate documents, matching option A.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Catalog is to library as index is to`,
    options: [
      "library",
      "book",
      "dictionary",
      "map"
    ],
    correctAnswer: 1,
    explanation: `A catalog helps people locate materials in a library, just as an index helps readers locate information in a book.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase could best replace "taps into" in Passage 2 without changing the meaning?`,
    options: [
      "avoids completely",
      "makes use of",
      "destroys carefully",
      "ignores entirely"
    ],
    correctAnswer: 1,
    explanation: `"Taps into" means to access or make use of a resource, which matches "makes use of."`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `Which meaning best fits the word "emissions" as used in Passage 2?`,
    options: [
      "types of solar panels",
      "substances released into the air, often as pollution",
      "feelings of excitement",
      "permissions given by the government"
    ],
    correctAnswer: 1,
    explanation: `In the context of burning fuels and clean energy, emissions refer to gases or substances released into the atmosphere.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: `Choose the best word to complete the sentence: "Judge Sterling ______ the important papers in a folder labelled 'Land Dispute.'"`,
    options: [
      "folded",
      "copied",
      "signed",
      "filed"
    ],
    correctAnswer: 3,
    explanation: `"Filed" means stored in an organised way, usually in a folder or cabinet, which fits the context perfectly.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence uses the pronoun correctly?`,
    options: [
      "Him and Miss Lorna went to the library.",
      "Miss Lorna and me searched the shelves.",
      "The catalog, which was written by Judge Sterling, helped them find the document.",
      "Her gave the paper to the council."
    ],
    correctAnswer: 2,
    explanation: `"Which" correctly introduces a relative clause referring to "catalog." The other options incorrectly use object pronouns ("Him," "me," "Her") as subjects.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "The pages of the catalog were yellowed but legible.",
      "The pages of the catalog was yellowed but legible.",
      "The pages of the catalog has yellowed but legible.",
      "The pages of the catalog were yellowed but was legible."
    ],
    correctAnswer: 0,
    explanation: `The subject "pages" is plural, so it requires the plural verb "were." "Legible" correctly shares the plural subject.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Kofi opened the catalog and finds the note.",
      "Kofi opens the catalog and found the note.",
      "Kofi opened the catalog and found the note.",
      "Kofi will open the catalog and found the note."
    ],
    correctAnswer: 2,
    explanation: `Both actions happened in the past, so "opened" and "found" are both past tense and consistent.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After they found the document they left the library.",
      "After, they found the document, they left the library.",
      "After they found, the document they left the library.",
      "After they found the document, they left the library."
    ],
    correctAnswer: 3,
    explanation: `A comma is required after the introductory dependent clause "After they found the document" to separate it from the main clause.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      "\"You did it, Kofi,\" Miss Lorna said.",
      "\"You did it,\" Kofi,\" Miss Lorna said.",
      "\"You did it\", Miss Lorna said.",
      "You did it,\" Miss Lorna said.\""
    ],
    correctAnswer: 0,
    explanation: `The spoken words are correctly enclosed in quotation marks, and the commas are correctly placed around the name and before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: `Which sentence uses parallel structure?`,
    options: [
      "Solar panels capturing sunlight, wind turbines spin in the breeze, and hydroelectric dams use flowing water.",
      "Solar panels capture sunlight, to spin in the breeze, and hydroelectric dams use flowing water.",
      "Solar panels capture sunlight, wind turbines spin in the breeze, and using flowing water.",
      "Solar panels capture sunlight, wind turbines spin in the breeze, and hydroelectric dams use flowing water."
    ],
    correctAnswer: 3,
    explanation: `All three parts use the exact same pattern: noun + present tense verb + object. This creates a smooth, parallel structure.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which choice correctly repairs the run-on sentence?`,
    options: [
      "Geothermal energy is reliable it works day and night.",
      "Geothermal energy is reliable, and it works day and night.",
      "Geothermal energy is reliable, it works day and night.",
      "Geothermal energy being reliable and it works day and night."
    ],
    correctAnswer: 1,
    explanation: `Using a comma and the coordinating conjunction "and" correctly joins the two independent clauses.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice correctly combines the ideas using a semicolon and a conjunctive adverb to show contrast?",
    options: [
      "Solar power is clean it only works when the sun shines.",
      "Solar power is clean, but it only works when the sun shines.",
      "Although solar power is clean, but it only works when the sun shines.",
      "Solar power is clean; however, it only works when the sun shines."
    ],
    correctAnswer: 3,
    explanation: `A semicolon followed by "however" correctly joins two independent clauses to show a contrast between the benefit and the limitation.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "Solar panels are expensive; _____, the price has decreased over time."`,
    options: [
      "therefore",
      "however",
      "similarly",
      "instead"
    ],
    correctAnswer: 1,
    explanation: `"However" shows a contrast: even though panels are expensive, the price has gone down, which is unexpected.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: `Which word choice is most precise? "The engineer _____ a new design for the wind turbine."`,
    options: [
      "drew",
      "wrote",
      "designed",
      "sang"
    ],
    correctAnswer: 2,
    explanation: `"Designed" is the precise term for planning and creating the structure or function of a machine like a turbine.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which of the following would be the strongest introduction for an essay about clean energy?`,
    options: [
      "As the world faces the growing challenges of climate change, shifting to clean energy sources has become one of the most important tasks of our time.",
      "Clean energy technologies can reduce some forms of pollution while providing electricity from renewable sources.",
      "Countries are considering several energy sources as they try to meet growing electricity needs with less environmental damage.",
      "Solar, wind, hydroelectric, geothermal, and tidal power each offer possible alternatives to fossil fuels."
    ],
    correctAnswer: 0,
    explanation: `A strong introduction hooks the reader and states a clear, specific main idea. Option D provides context and sets up the essay's argument.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which sentence provides the best supporting detail for the topic sentence "Solar energy can benefit ordinary families"?`,
    options: [
      "Solar panels can be placed on rooftops to generate electricity for homes.",
      "Large solar farms can supply electricity to thousands of buildings through the power grid.",
      "Solar-powered calculators use small cells to operate without replaceable batteries.",
      "Some remote facilities use solar panels where connecting to the national grid is difficult."
    ],
    correctAnswer: 0,
    explanation: `Option A directly supports the topic sentence by explaining a specific way families benefit—by generating their own power via rooftop panels.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: "Which transition word best fills the blank in this sentence? \"Solar panels cannot generate electricity after sunset; _____, wind turbines can still provide power at night when the wind blows.\"",
    options: [
      "however",
      "therefore",
      "similarly",
      "for example"
    ],
    correctAnswer: 0,
    explanation: `"Meanwhile" shows that something is happening at the same time—solar works during the day while wind works at night.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Read the paragraph below. Which sentence should be removed because it does not belong?\n\n(1) Clean energy helps protect the environment. (2) Solar and wind power do not release harmful gases into the air. (3) Large renewable-energy projects may compete with farming or conservation for the use of limited land. (4) By switching to these sources, we can reduce pollution and slow down climate change.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 4",
      "Sentence 3"
    ],
    correctAnswer: 3,
    explanation: `Sentence 3 is about pineapples and agriculture, which has nothing to do with the topic of clean energy and the environment.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which of the following would be the most effective concluding sentence for an essay about clean energy?`,
    options: [
      "By investing thoughtfully in several renewable sources, societies can build a cleaner, more resilient energy future.",
      "Clean-energy projects can create jobs while reducing some forms of environmental damage.",
      "Solar and wind power will continue to improve as engineers develop more efficient technology.",
      "Communities that understand the strengths and limits of each energy source can make better local choices."
    ],
    correctAnswer: 0,
    explanation: `A strong conclusion restates the main idea in a fresh, memorable way. Option B ties back to the essay's examples using parallel structure for impact.`
  }
];

const SECTION_CONFIG = [
  {
    type: "reading" as const,
    label: "Reading Comprehension",
    note: "main idea, details, inference, purpose, point of view, evidence",
  },
  {
    type: "vocabulary" as const,
    label: "Vocabulary & Word Study",
    note: "meaning in context, synonyms, antonyms, connotation, precise word choice",
  },
  {
    type: "grammar" as const,
    label: "Grammar & Language Use",
    note: "agreement, tense, punctuation, pronouns, sentence structure, transitions",
  },
  {
    type: "writing" as const,
    label: "Writing Skills",
    note: "topic sentences, support, organization, transitions, revision",
  },
];

export default function G5LaDiff10MockTest() {
  const { isPremium, user } = useAuth();
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>(
    [],
  );
  const hasSavedResult = useRef(false);

  const sourceQuestions = isPremium
    ? g5LaDiff10Questions
    : g5LaDiff10Questions.slice(0, FREE_QUESTION_LIMIT);
  const availableQuestions =
    randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions;
  const totalQuestions = availableQuestions.length;

  useEffect(() => {
    if (answers.length !== totalQuestions)
      setAnswers(new Array(totalQuestions).fill(null));
  }, [totalQuestions, answers.length]);

  useEffect(() => {
    setCurrentQuestion((prev) =>
      Math.min(prev, Math.max(totalQuestions - 1, 0)),
    );
  }, [totalQuestions]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!started || showResults) return;
    const t = setInterval(
      () =>
        setTimeLeft((p) => {
          if (p <= 1) {
            setShowResults(true);
            return 0;
          }
          return p - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [started, showResults]);

  const handleAnswer = (idx: number) => {
    const a = [...answers];
    a[currentQuestion] = idx;
    setAnswers(a);
  };

  const calcScore = () =>
    answers.reduce<number>(
      (c, a, i) =>
        i < totalQuestions && a === availableQuestions[i].correctAnswer
          ? c + 1
          : c,
      0,
    );
  const scorePct = () => Math.round((calcScore() / totalQuestions) * 100);

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return;

    hasSavedResult.current = true;
    const completedAtIso = new Date().toISOString();
    void saveStudentTestResult({
      parentId: user.id,
      studentName: user?.childName ?? "Student",
      grade: "grade5",
      subject: "Literacy",
      testName: "Difficult 10",
      difficulty: "Difficult",
      score: calcScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: completedAtIso,
    }).catch(() => {
      hasSavedResult.current = false;
    });
  }, [showResults, user?.id, user?.childName, totalQuestions, answers]);

  const getGrade = () => {
    const p = scorePct();
    if (p >= 85) return { grade: "Excellent", color: "text-green-600" };
    if (p >= 70) return { grade: "Good", color: "text-blue-600" };
    if (p >= 50) return { grade: "Fair", color: "text-amber-600" };
    return { grade: "Needs Improvement", color: "text-red-600" };
  };

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type);
    const correct = sq.filter((q) => {
      const i = availableQuestions.findIndex((x) => x.id === q.id);
      return answers[i] === q.correctAnswer;
    }).length;
    const total = sq.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const rating =
      pct >= 85
        ? "Excellent"
        : pct >= 70
          ? "Good"
          : pct >= 50
            ? "Fair"
            : "Needs Improvement";
    const color =
      pct >= 85
        ? "text-green-600"
        : pct >= 70
          ? "text-blue-600"
          : pct >= 50
            ? "text-amber-600"
            : "text-red-600";
    return { correct, total, percentage: pct, rating, ratingColor: color };
  };

  const startTest = () => {
    const preparedQuestions = isPremium
      ? prepareAssessment(g5LaDiff10Questions)
      : preparePreview(g5LaDiff10Questions, FREE_QUESTION_LIMIT);
    setRandomizedQuestions(preparedQuestions);
    setAnswers(new Array(preparedQuestions.length).fill(null));
    setCurrentQuestion(0);
    setTimeLeft(60 * 60);
    setShowResults(false);
    hasSavedResult.current = false;
    setStarted(true);
  };

  const resetTest = () => {
    setStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setRandomizedQuestions([]);
    setAnswers(new Array(sourceQuestions.length).fill(null));
    setTimeLeft(60 * 60);
    hasSavedResult.current = false;
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const q = availableQuestions[currentQuestion];
  const answeredCount = answers.filter((a) => a !== null).length;

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-xl border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Preview Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">
                You completed the free preview for this test. Upgrade to Premium
                to unlock all 40 questions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link href="/mock-tests/language-arts">
                  <Button variant="outline">Back to Language Arts Tests</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  const secLabel = (t: Question["type"]) =>
    t === "reading"
      ? "Reading Comprehension"
      : t === "vocabulary"
        ? "Vocabulary & Word Study"
        : t === "grammar"
          ? "Grammar & Language Use"
          : "Writing Skills";
  const secColor = (t: Question["type"]) =>
    t === "reading"
      ? "bg-blue-50 text-blue-700"
      : t === "vocabulary"
        ? "bg-purple-50 text-purple-700"
        : t === "grammar"
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700";

  if (!started)
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Link href="/mock-tests/language-arts">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Language Arts Mock Tests
            </Button>
          </Link>
          <Card className="mx-auto max-w-3xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <BookOpen className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Language Arts Difficult 10
              </CardTitle>
              <p className="text-slate-600">
                Grade 5 PEP Language Arts · Difficult Level
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Free Preview Mode
                      </p>
                      <p className="text-sm text-amber-700">
                        Try {FREE_QUESTION_LIMIT} questions free. Upgrade to
                        unlock all 40.
                      </p>
                      <Link href="/pricing" className="mt-3 inline-block">
                        <Button className="bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-slate-800">
                  Test Overview
                </h3>
                <p className="text-slate-700">
                  This Grade 5 Language Arts test covers reading comprehension,
                  vocabulary in context, grammar and language use, and writing
                  skills — all aligned to the NSC curriculum.
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 p-4">
                <h3 className="mb-2 font-semibold text-sky-800">
                  21st-Century Skills
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>
                    Critical Thinking: analysing texts and evaluating language
                    choices
                  </li>
                  <li>
                    Communication: understanding how language works in context
                  </li>
                  <li>
                    Creativity: recognising and applying effective writing
                    techniques
                  </li>
                  <li>
                    Collaboration: understanding how writers address their
                    audience
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {totalQuestions}
                  </p>
                  <p className="text-sm text-slate-600">
                    Questions {!isPremium && "(Preview)"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">60</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>
              <Button
                onClick={startTest}
                className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );

  if (showResults) {
    const sc = calcScore();
    const pct = scorePct();
    const { grade, color } = getGrade();
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-blue-600" />
              <CardTitle className="text-2xl text-blue-800">
                Language Arts Test Completed
              </CardTitle>
              <p className="text-slate-600">Language Arts Difficult 10</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-blue-600">
                  {sc}/{totalQuestions}
                </p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-3xl font-bold text-blue-600">{pct}%</p>
                  <p className="text-sm text-slate-600">Score</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className={cn("text-2xl font-bold", color)}>{grade}</p>
                  <p className="text-sm text-slate-600">Performance</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
              {!isPremium && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">
                    You completed the free preview.
                  </p>
                  <p className="text-sm text-amber-700">
                    Upgrade to unlock all 40 questions.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-block">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => {
                  const st = getSectionStats(s.type);
                  return (
                    <div
                      key={s.type}
                      className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                    >
                      <p className="font-semibold text-blue-800">{s.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          {st.correct}/{st.total} correct
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            st.ratingColor,
                          )}
                        >
                          {st.rating}
                        </span>
                      </div>
                      <Progress value={st.percentage} className="h-2 mt-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        {st.percentage}%
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "rounded-lg border-2 p-4",
                        correct
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {correct ? (
                          <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">
                            Q{i + 1} ·{" "}
                            <span className="text-blue-700">{q.skill}</span>
                          </p>
                          <p className="mt-1 text-slate-700 text-sm">
                            {q.question}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Your answer:{" "}
                            <span
                              className={
                                correct
                                  ? "text-green-700 font-medium"
                                  : "text-red-700 font-medium"
                              }
                            >
                              {answers[i] !== null
                                ? q.options[answers[i]!]
                                : "Not answered"}
                            </span>
                          </p>
                          <p className="text-sm text-green-700">
                            Correct: {q.options[q.correctAnswer]}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            Explanation: {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save Report
                </Button>
                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Link href="/mock-tests/language-arts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Language Arts Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <header className="bg-blue-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/mock-tests/language-arts"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold">Language Arts Difficult 10</h1>
              <p className="text-blue-100 text-xs">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
              timeLeft <= 300 ? "bg-red-500" : "bg-green-600",
            )}
          >
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Progress: {answeredCount}/{totalQuestions} answered
            </span>
            <span className="text-xs text-slate-400">
              Grade 5 · Difficult
            </span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className="h-2"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {availableQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={cn(
                  "h-7 w-7 rounded-full text-xs font-medium transition-colors",
                  answers[i] !== null
                    ? "bg-blue-600 text-white"
                    : i === currentQuestion
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                secColor(q.type),
              )}
            >
              {secLabel(q.type)}
            </span>
            <span className="text-sm text-slate-500">{q.skill}</span>
          </div>
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                {q.question}
              </p>
            </CardContent>
          </Card>
          <div className="space-y-3 mb-8">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "w-full text-left rounded-lg border-2 p-4 transition-all",
                  answers[currentQuestion] === i
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50",
                )}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + i)})
                </span>{" "}
                {opt}
              </button>
            ))}
          </div>
          {!isPremium && currentQuestion === FREE_QUESTION_LIMIT - 1 && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <Lock className="mx-auto mb-2 h-6 w-6 text-amber-600" />
              <p className="font-semibold text-amber-800">
                This is your last free question
              </p>
              <p className="text-sm text-amber-700">
                Upgrade to unlock all 40 questions
              </p>
              <Link href="/pricing" className="mt-3 inline-block">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((p) => p + 1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
