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
   DIFFICULT 9  ·  Passage 1: The Great Bamboo Bridge
                   Passage 2: Hurricanes: More Than Wind
   ============================================================ */

const P1 = `The river had risen again overnight, swirling brown and fast over the old crossing stones. Anika stood at the bank with her younger brother, Devon, and a handful of other children from the village. The crossing stones, which were usually just below the surface, had completely vanished underwater.

"We can't get to school," Devon said, kicking a pebble into the muddy water. "Mama said we have to turn back."

Anika stared across the river. The school was only a hundred metres away on the other side, but the water was deep and the current was strong. Nobody in the village could swim well enough to cross safely.

For three days, the children had missed school because of the flooding. The rainy season had come early and heavy this year. Anika knew that if they missed much more time, they would fall behind, especially since exams were approaching.

That evening, Anika sat on her porch, thinking. She remembered seeing a documentary about engineers building bridges in other countries. They used local materials—bamboo, rope, and stones. Bamboo grew thick along the riverbank near their house. It was strong, flexible, and grew back quickly after being cut.

The next morning, Anika went to see Mr. Lindo, the village elder and a skilled carpenter. She explained her idea: a simple bamboo footbridge, just wide enough for people to walk across, anchored firmly to the trees on both banks.

Mr. Lindo looked at her for a long moment. "It is a good thought," he said slowly. "But a bridge must hold weight. It must not sway too much. Have you thought about how to make it stable?"

Anika had. She had sketched a design on a piece of paper the night before. "We can tie the bamboo poles together in triangles," she said, showing him the drawing. "Triangles are the strongest shape. And we can anchor the base with heavy stones so the river can't push it over."

Mr. Lindo studied the sketch. A small smile crossed his face. "You have the mind of an engineer," he said. "I will help you, but you must lead the project. You must organise the work and tell the others what to do."

Over the next week, Anika led a team of six villagers, including Devon and two of her classmates. They cut mature bamboo poles, stripped the branches, and lashed them tightly together with thick vine rope. Mr. Lindo showed them how to tie the knots, but Anika decided where each piece went. When they lifted the first section into place, it wobbled dangerously. Some of the children wanted to give up.

"It needs cross-bracing," Anika said firmly, refusing to be discouraged. She tied diagonal pieces between the main poles to stop the swaying. When they tested it again, the structure held firm.

When the bridge was finished, the whole village came to see. It was not fancy—it was rough and simple—but it was solid. Anika was the first to walk across. The bamboo flexed slightly under her weight but did not buckle. Halfway across, she stopped and looked down at the rushing water below. She was doing it. She was crossing the river that had kept her trapped for days.

Devon ran across behind her, laughing. By the next morning, every child in the village used the bridge to get to school.

Mr. Lindo told the community, "This bridge was built because one young person saw a problem and refused to accept that nothing could be done."`;

const P2 = `When people hear the word "hurricane," they usually picture fierce winds bending palm trees and ripping off roofs. Wind is certainly the most visible part of a hurricane, but it is far from the most dangerous. Scientists who study these powerful storms warn that the greatest threats often come from water, not air.

A hurricane is a massive rotating storm that forms over warm ocean waters. As it moves, it gathers strength from the heat of the sea. But when it reaches land, it brings more than just powerful gusts. It carries a wall of water called a storm surge. A storm surge happens when the strong winds push the ocean water toward the shore, piling it up higher than normal tides. This wall of water can be several metres tall and can sweep inland, destroying homes, washing away roads, and pushing boats far onto land.

In addition to storm surge, hurricanes drop enormous amounts of rain. A single hurricane can release billions of litres of water in just a few hours. When this heavy rain falls on already saturated ground, the water has nowhere to go. Rivers overflow their banks, and low-lying areas fill with floodwater. In many cases, flooding causes more damage than the wind itself, reaching places that the strongest gusts never touch.

Understanding these hidden dangers is the first step toward staying safe. That is why meteorologists spend so much time tracking hurricanes and issuing warnings. They use satellites, weather balloons, and computer models to predict where a storm will go and how strong it will be. However, all the technology in the world only helps if people know what to do with the information.

Preparedness means having a plan before a storm arrives. Families in hurricane-prone areas should know their evacuation routes—the safest paths away from the coast and out of flood zones. They should also have emergency kits packed with drinking water, non-perishable food, a flashlight, batteries, and a first-aid kit. Because power outages are common during hurricanes, having a battery-powered radio is essential for receiving updates when the electricity goes out.

Building codes also play a major role in safety. In places like Jamaica, engineers design buildings to withstand high winds. Roofs are secured with special straps, and windows are often covered with shutters or reinforced glass. However, protecting a community is not just about strong buildings. It is about strong communication, making sure every person knows when to leave and where to go.

At the centre of a hurricane is the eye, a strangely calm area where the wind drops and the sky clears. Many people mistakenly think the storm is over when the eye passes, but the dangerous winds return quickly from the opposite direction. Knowing this fact has saved many lives.

Scientists are also studying how climate change might affect hurricanes. Warmer ocean temperatures give storms more energy, which could mean stronger winds and heavier rainfall in the future. Sea levels are also rising, which means storm surges start from a higher point and can reach further inland than they did decades ago. While we cannot stop hurricanes from forming, understanding the science behind them gives communities the power to prepare, adapt, and protect lives. A hurricane is more than wind—it is a system of water, wind, and weather that demands respect and readiness.`;

const g5LaDiff9Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat problem did the children face at the beginning of the story?`,
    options: [
      "The school had closed down permanently.",
      "The crossing stones were underwater, making it impossible to reach school.",
      "They did not have enough bamboo to build anything.",
      "Mr. Lindo refused to help them cross the river."
    ],
    correctAnswer: 1,
    explanation: `The passage states that the crossing stones had "completely vanished underwater" and that Anika realized nobody could swim well enough to cross safely.`
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhy did Anika decide to use bamboo for the bridge?`,
    options: [
      "She had seen it used in a documentary and knew it was strong and locally available.",
      "It was the only material the village had ever used for building.",
      "Mr. Lindo told her it was the only material that would not rot in water.",
      "It was the cheapest material she could buy at the market."
    ],
    correctAnswer: 0,
    explanation: `Anika remembered a documentary about engineers using bamboo and noted that it "grew thick along the riverbank," making it a practical, local choice.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhen the first section of the bridge wobbled, some children wanted to give up. What does Anika's response reveal about her?`,
    options: [
      "She was frustrated that they were not working as fast as she wanted.",
      "She panicked and asked Mr. Lindo to fix the problem for her.",
      "She stayed calm, identified the structural issue, and applied a solution.",
      "She realized her design was completely wrong and started over."
    ],
    correctAnswer: 2,
    explanation: `Anika "firmly" stated that the bridge needed cross-bracing and tied diagonal pieces to fix the swaying, showing problem-solving under pressure.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat is the central theme of this story?`,
    options: [
      "Only professional engineers can solve difficult problems.",
      "Young people can lead meaningful change when they combine knowledge with perseverance.",
      "Bamboo is the best building material in the world.",
      "Communities should always wait for the government to solve their problems."
    ],
    correctAnswer: 1,
    explanation: `The story highlights Anika using her knowledge, leading her community, and persisting through a setback to solve a real problem.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.\n\n${P1}\n\nBased on the story, how will Anika most likely react to future challenges in her community?`,
    options: [
      "She will ignore them because she has already done her part.",
      "She will immediately ask Mr. Lindo to take charge of the situation.",
      "She will look for practical solutions and try to organise others to help.",
      "She will move to a different village to avoid problems."
    ],
    correctAnswer: 2,
    explanation: `Anika's actions in the story—observing a problem, researching a solution, and organizing a team—suggest she would repeat this approach.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.\n\n${P1}\n\nHow is Anika's approach to the problem different from Devon's?`,
    options: [
      "Devon wants to build a boat, but Anika wants to build a bridge.",
      "Devon complains and accepts the situation, while Anika analyses it and seeks a solution.",
      "Anika wants to swim across, but Devon wants to wait.",
      "Devon tries to solve the problem alone, while Anika wants to involve the whole village."
    ],
    correctAnswer: 1,
    explanation: `Devon kicks a pebble and repeats that they have to turn back, while Anika studies the river, remembers a documentary, and develops a plan.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.\n\n${P1}\n\nWhat can the reader conclude about Mr. Lindo?`,
    options: [
      "He respects Anika's intelligence and wants her to develop leadership skills.",
      "He is too old to do any physical work but gives good advice.",
      "He does not believe the bridge will work but helps anyway to be polite.",
      "He is angry that a child is telling him what to do."
    ],
    correctAnswer: 0,
    explanation: `By telling Anika she must "lead the project" and "tell the others what to do," he actively helps her grow into a leadership role.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.\n\n${P2}\n\nAccording to the passage, what is a storm surge?`,
    options: [
      "A sudden increase in wind speed during a hurricane.",
      "The heavy rainfall that falls in the centre of the storm.",
      "A type of emergency radio used to warn people about floods.",
      "A wall of ocean water pushed toward the shore by hurricane winds."
    ],
    correctAnswer: 3,
    explanation: `The passage defines a storm surge as a wall of water "pushed toward the shore, piling it up higher than normal tides" by the strong winds.`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.\n\n${P2}\n\nThe author supports the claim that "the greatest threats often come from water" by pointing out that`,
    options: [
      "wind speeds are actually decreasing during modern hurricanes",
      "satellites can only track water, not wind",
      "storm surges and inland flooding cause damage that reaches places winds do not",
      "most people do not own rain jackets or boots"
    ],
    correctAnswer: 2,
    explanation: `The author explains that flooding "causes more damage than the wind itself, reaching places that the strongest gusts never touch."`
  },
  {
    id: 10,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.\n\n${P2}\n\nWhy does the author include information about the "eye" of the hurricane?`,
    options: [
      "To warn readers about a dangerous misconception that could cost lives",
      "To explain why hurricanes have such beautiful names",
      "To prove that the centre of a storm is the safest place to be",
      "To describe what hurricanes look like from space"
    ],
    correctAnswer: 0,
    explanation: `The author explains that people mistakenly think the storm is over during the eye, but dangerous winds return quickly. This warning serves a vital safety purpose.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.\n\n${P2}\n\nHow does the passage contrast wind damage with water damage?`,
    options: [
      "It states that wind damage is quick, while water damage is slow.",
      "It explains that wind damage only affects coastal areas, while water affects everywhere.",
      "It argues that scientists do not know very much about water damage yet.",
      "It explains that wind is the most visible threat, but water from surges and rain often causes more widespread destruction."
    ],
    correctAnswer: 3,
    explanation: `The author explicitly contrasts the "visible" wind with the "hidden" water dangers, noting that water damage is often more severe and far-reaching.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.\n\n${P2}\n\nWhat can the reader conclude about emergency kits?`,
    options: [
      "They are only necessary for people who live right on the beach.",
      "They are a practical way to stay safe when power and supplies are cut off during a storm.",
      "They are too expensive for most families to afford.",
      "They are mainly used by meteorologists to track storms."
    ],
    correctAnswer: 1,
    explanation: `The passage lists specific items for the kit and explains they are essential because "power outages are common," showing their practical safety value.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.\n\n${P2}\n\nIf ocean temperatures continue to rise, what does the passage suggest will happen to future hurricanes?`,
    options: [
      "They will likely have more energy, potentially leading to stronger winds and heavier rain.",
      "They will become weaker and easier to predict.",
      "They will move faster but drop less rain.",
      "They will only form during the winter months."
    ],
    correctAnswer: 0,
    explanation: `The passage states that warmer temperatures "give storms more energy, which could mean stronger winds and heavier rainfall in the future."`
  },
  {
    id: 14,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.\n\n${P2}\n\nThe author mentions building codes and roof straps to`,
    options: [
      "show that preparation involves both personal planning and community engineering",
      "argue that new buildings are too expensive for most people",
      "prove that old buildings are much safer than new ones",
      "explain how to build a house out of bamboo"
    ],
    correctAnswer: 0,
    explanation: `Building codes represent a community-level engineering preparation that works alongside personal kits and evacuation plans.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passages then answer the question.\n\n${P1}\n\n${P2}\n\nBoth passages suggest that`,
    options: [
      "natural problems cannot be solved without expensive technology",
      "understanding a challenge is the first step toward overcoming it",
      "only adults should be responsible for keeping communities safe",
      "waiting for problems to go away is the safest strategy"
    ],
    correctAnswer: 1,
    explanation: `Anika studies the river and engineering principles before building, while the passage on hurricanes states that "understanding these hidden dangers is the first step toward staying safe."`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is the closest synonym for "stable" as used in Passage 1?`,
    options: [
      "shaky",
      "firm",
      "tiny",
      "broken"
    ],
    correctAnswer: 1,
    explanation: `"Stable" means steady and not likely to change or fall. "Firm" is the closest synonym among the choices.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word means the OPPOSITE of "saturated" as used in the phrase "already saturated ground"?`,
    options: [
      "dry",
      "wet",
      "muddy",
      "frozen"
    ],
    correctAnswer: 0,
    explanation: `"Saturated" means completely soaked with water. "Dry" is the exact opposite.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The word "non-perishable" contains the prefix "non-." What does "non-perishable food" mean?`,
    options: [
      "Food that cooks very quickly",
      "Food that spoils easily if left out",
      "Food that does not spoil quickly and can be stored for a long time",
      "Food that must be kept in a freezer"
    ],
    correctAnswer: 2,
    explanation: `The prefix "non-" means "not." Perishable means likely to decay. So non-perishable food does not decay quickly.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The suffix "-able" means "capable of." If something is "flexible," it is`,
    options: [
      "capable of bending without breaking",
      "capable of holding a lot of weight",
      "capable of floating on water",
      "capable of growing very tall"
    ],
    correctAnswer: 0,
    explanation: `"Flex" means to bend. Adding "-able" creates "flexible," meaning capable of bending.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In Passage 1, Mr. Lindo said Anika had "the mind of an engineer." What does this phrase suggest?`,
    options: [
      "She was very good at fixing clocks and radios.",
      "She thought carefully about how to design and build structures to solve problems.",
      "She knew exactly how to drive a tractor.",
      "She was the smartest student in her mathematics class."
    ],
    correctAnswer: 1,
    explanation: `Anika sketched a design, calculated stability using triangles, and directed the construction—classic engineering thinking.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses the word "storm" in the same way as it is used in Passage 2?`,
    options: [
      "The teacher was greeted by a storm of questions from the students.",
      "A massive storm formed over the warm Atlantic waters.",
      "Please do not storm out of the room when you are angry.",
      "The army decided to storm the castle at dawn."
    ],
    correctAnswer: 1,
    explanation: `Passage 2 uses "storm" to mean a severe weather event. Option B is the only one that uses it this way.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Anchor is to ship as foundation is to`,
    options: [
      "river",
      "building",
      "bridge",
      "bamboo"
    ],
    correctAnswer: 1,
    explanation: `An anchor keeps a ship in place, just as a foundation keeps a building stable and secure.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase could best replace "evacuation routes" without changing the meaning?`,
    options: [
      "paths used for daily travel to work or school",
      "roads that are closed for repairs during the rainy season",
      "hiking trails used by tourists on holiday",
      "safe paths away from dangerous areas during an emergency"
    ],
    correctAnswer: 3,
    explanation: `Evacuation routes are specifically designed paths for people to leave danger zones safely during emergencies.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `Which meaning best fits the word "meteorologists"?`,
    options: [
      "People who study rocks and minerals",
      "People who build strong structures to withstand wind",
      "People who study the atmosphere and predict the weather",
      "People who rescue animals during natural disasters"
    ],
    correctAnswer: 2,
    explanation: `Meteorologists are scientists who study the atmosphere, weather, and climate, and who issue forecasts.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: `Choose the best word to complete the sentence: "Anika had to ______ the bamboo poles tightly together with vine rope."`,
    options: [
      "paint",
      "eat",
      "read",
      "lash"
    ],
    correctAnswer: 3,
    explanation: `"Lash" means to tie something tightly with a rope or cord, which fits the action of binding bamboo poles.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Relative Pronouns",
    question: `Which sentence uses the pronoun correctly?`,
    options: [
      "Him and Anika built the bamboo bridge.",
      "Anika and me carried the heavy poles to the riverbank.",
      "The hurricane destroyed the roof, which was made of zinc.",
      "Mr. Lindo gave the instructions to she and her brother."
    ],
    correctAnswer: 2,
    explanation: `“Which” correctly introduces a relative clause referring to “roof”. The other choices misuse personal-pronoun case—for example, subject positions require “he/I”, while the object of “to” requires “her”.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "The heavy rain from the hurricane cause the river to overflow.",
      "The heavy rain from the hurricane causes the river to overflow.",
      "The heavy rain from the hurricane causing the river to overflow.",
      "The heavy rain from the hurricane have caused the river to overflow."
    ],
    correctAnswer: 1,
    explanation: `The subject "rain" is singular, so it requires the singular verb "causes" without an -s ending on the main verb.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Anika sketched the design and built the bridge the next week.",
      "Anika sketched the design and builds the bridge the next week.",
      "Anika sketches the design and built the bridge the next week.",
      "Anika will sketch the design and built the bridge the next week."
    ],
    correctAnswer: 0,
    explanation: `Both actions happened in the past, so "sketched" and "built" are both in the past tense and consistent.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "When the hurricane hit the power went out immediately.",
      "When the hurricane hit, the power went out immediately.",
      "When, the hurricane hit the power went out immediately.",
      "When the hurricane hit the power, went out immediately."
    ],
    correctAnswer: 1,
    explanation: `A comma is needed after the introductory dependent clause "When the hurricane hit" to separate it from the main clause.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      `"This bridge was built because one young person saw a problem Mr. Lindo said."`,
      `This bridge was built because one young person saw a problem," Mr. Lindo said.`,
      `"This bridge was built because one young person saw a problem," Mr. Lindo said.`,
      `"This bridge was built because one young person saw a problem." Mr. Lindo said.`
    ],
    correctAnswer: 2,
    explanation: `The spoken words are fully enclosed in quotation marks, with the comma placed inside the closing quotation marks before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: `Which sentence uses parallel structure?`,
    options: [
      "Anika cut the bamboo, tied the poles, and tested the bridge.",
      "Anika cutting the bamboo, tying the poles, and testing the bridge.",
      "Anika cut the bamboo, to tie the poles, and testing the bridge.",
      "Anika cut the bamboo, tied the poles, and she tested the bridge."
    ],
    correctAnswer: 0,
    explanation: `The three actions use the exact same past-tense verb form: cut, tied, and tested. This creates a smooth, parallel structure.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which choice correctly repairs the run-on sentence?`,
    options: [
      "Storm surges are dangerous they can sweep inland.",
      "Storm surges are dangerous, and they can sweep inland.",
      "Storm surges are dangerous, they can sweep inland.",
      "Storm surges being dangerous and they can sweep inland."
    ],
    correctAnswer: 1,
    explanation: `Using a comma and the coordinating conjunction "and" correctly joins the two independent clauses.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which choice best combines the ideas? "The river was flooded. The children could not cross."`,
    options: [
      "Because the river was flooded, the children could not cross.",
      "The river was flooded, the children could not cross.",
      "The river was flooded but the children could not cross.",
      "Because the river was flooded, but the children could not cross."
    ],
    correctAnswer: 0,
    explanation: `"Because" is a subordinating conjunction that correctly shows the cause-and-effect relationship between the two ideas.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "The winds were strong; _____, the flooding caused the most damage."`,
    options: [
      "similarly",
      "therefore",
      "for example",
      "however"
    ],
    correctAnswer: 3,
    explanation: `"However" shows a contrast. The reader expects wind to be the main threat, but the sentence reveals water was actually worse.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: `Which word choice is most precise? "The meteorologist used satellites to ______ the path of the hurricane."`,
    options: [
      "see",
      "guess",
      "track",
      "draw"
    ],
    correctAnswer: 2,
    explanation: `"Track" is the precise scientific term for monitoring the movement and path of a storm over time.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which of the following would be the strongest introduction for a paragraph about hurricane preparedness?`,
    options: [
      "While we cannot stop hurricanes from forming, careful preparation can mean the difference between danger and safety.",
      "Hurricanes can damage homes and communities when strong winds, rain, and flooding reach populated areas.",
      "Families can reduce hurricane risks by understanding warnings and preparing before dangerous weather arrives.",
      "Hurricane preparedness includes several decisions that households should make before a storm approaches."
    ],
    correctAnswer: 0,
    explanation: `A strong introduction states a clear main idea. Option B uses a contrast to hook the reader and sets up the paragraph's focus on preparation.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which sentence provides the best supporting detail for the topic sentence "Building with strong materials saves lives during hurricanes"?`,
    options: [
      "Roofs secured with straps are less likely to blow away during high winds.",
      "Concrete walls can resist some forms of storm damage better than weak, poorly maintained walls.",
      "Homes built on safer sites may face less exposure to floodwater during severe storms.",
      "Builders can inspect older houses for weak points before hurricane season begins."
    ],
    correctAnswer: 0,
    explanation: `A good supporting detail directly proves the topic sentence. Option A gives a specific example of how strong materials (straps) protect a building feature (roofs) during the storm.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition word best fills the blank in this sentence? "Anika used local bamboo for the bridge; _____, she made sure the design included cross-bracing for stability."`,
    options: [
      "however",
      "because",
      "additionally",
      "although"
    ],
    correctAnswer: 2,
    explanation: `"Additionally" is used to add another related point or feature to a list, showing that the cross-bracing was an extra smart design choice.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Read the paragraph below. Which sentence should be removed because it does not belong?\n\n(1) Preparing for a hurricane requires careful planning. (2) Families should pack an emergency kit with water, food, and a radio. (3) Some community centres keep lists of residents who may need help during an emergency. (4) Knowing your evacuation route is also essential for a safe escape.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 4",
      "Sentence 3"
    ],
    correctAnswer: 3,
    explanation: `Sentence 3 is about mangoes and agriculture, which has nothing to do with the topic of preparing for a hurricane.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which of the following would be the most effective concluding sentence for an essay about community problem-solving?`,
    options: [
      "Whether building a footbridge over a flooded river or reinforcing homes against a storm, communities thrive when people combine knowledge, teamwork, and determination.",
      "Communities solve difficult problems more effectively when people contribute different skills and work toward a shared goal.",
      "Both bridge building and hurricane preparation show that practical knowledge can reduce the effects of dangerous conditions.",
      "Successful community projects often begin when people recognise a problem and decide to act before it becomes worse."
    ],
    correctAnswer: 0,
    explanation: `A strong conclusion leaves a lasting impression by restating the main idea in a fresh way. Option D ties back to the essay's examples using parallel structure for impact.`
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

export default function G5LaDiff9MockTest() {
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
    ? g5LaDiff9Questions
    : g5LaDiff9Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 9",
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
      ? prepareAssessment(g5LaDiff9Questions)
      : preparePreview(g5LaDiff9Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Difficult 9
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
              <p className="text-slate-600">Language Arts Difficult 9</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 9</h1>
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
