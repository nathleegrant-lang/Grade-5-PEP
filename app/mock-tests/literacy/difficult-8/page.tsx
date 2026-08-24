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
   DIFFICULT 8  ·  Passage 1: Water Conservation
                   Passage 2: Community Resource Management
   ============================================================ */

const P1 = `Marcus and his cousin Zara stood at the edge of the limestone hill in St. Ann, staring at the faded piece of paper in Marcus's hand. It was a map, drawn by their grandfather thirty years ago, showing a path to a cave he had discovered as a boy. The ink had smudged in places, and one entire corner was torn away, taking a section of the trail with it.

"We'll never find it," Zara said, squinting at the paper. "Half the directions are missing."

Marcus folded the map carefully and put it in his pocket. "Grandpa didn't draw this for fun. He marked landmarks—specific trees and rock shapes. If we follow the ones we can read, we can figure out the rest."

For the next hour, they climbed through the bush. The first landmark, a mahogany tree split by lightning, was exactly where the map said it would be. Zara's confidence grew a little. The second landmark, a flat rock shaped like a turtle, was harder to spot, but Marcus found it hiding under a tangle of wild coffee vines.

Then they hit the torn section. The map showed a fork in the path, but the tear removed the mark telling them which way to go. One path sloped upward toward a ridge covered in guinea grass. The other dipped down into a shady hollow thick with ferns and fern allies.

Zara wanted to take the upper path. "It makes more sense," she argued, wiping sweat from her forehead. "Caves are usually higher up in limestone hills. Everyone knows that."

Marcus knelt and looked at the ground. "Maybe. But look at these rocks." He pointed to small, smooth stones scattered along the lower path. "Grandpa was a geologist. He would have noticed limestone gravel like this. It usually means water has washed it out from somewhere nearby—like a cave opening."

Zara studied the stones, then looked back at the upper path, which was dry and bare. She bit her lip, thinking. "You might be right," she admitted. "But what if you're wrong? We've been walking for a long time, and it's getting hot."

"If we go up and it's a dead end, we come back down and try the other way. We don't quit just because the map isn't perfect," Marcus said firmly.

They took the lower path. It was narrow and damp, and they had to push through thick ferns that brushed their arms. Just as Zara was about to suggest turning back, the ground beneath them sloped sharply downward, and the ferns parted to reveal a dark, cool opening in the rock. A faint breeze blew from inside, carrying the smell of damp earth and old rain.

They stood at the entrance, breathless. It was not a grand cavern, but it was a cave, exactly as their grandfather had described it. Inside, they could see stalactites hanging from the ceiling like frozen stone fountains.

Marcus smiled and looked at Zara. "We didn't have the whole map," he said. "But we had enough clues to think our way through."

Zara nodded, catching her breath. "Grandpa would have liked that. He always said the best tool you can carry is a good question."`;

const P2 = `If you have ever walked along the coast of Jamaica, you have probably seen mangroves. They are the short, leafy trees that grow right at the edge of the sea, their roots twisted and tangled together like a giant net. To some people, they might look like messy, unimportant bushes. But scientists call mangroves "guardians of the coast," and for good reason.

Mangroves have a remarkable ability: they can live in saltwater, which would quickly kill most other plants. They do this through special roots called pneumatophores. These roots stick up out of the mud like tiny snorkels, allowing the tree to take in oxygen even when the tide covers the ground. At the same time, their thick, waxy leaves filter out the salt, sometimes pushing tiny salt crystals out through their surfaces so the plant does not become poisoned.

Beyond surviving in salty conditions, mangroves do extraordinary work for the environment. Their tangled root systems act as a massive natural barrier. When hurricanes bring powerful waves crashing toward the shore, the roots catch and absorb the energy of the water. This protects the land behind them from serious flooding and erosion. Without mangroves, coastal villages and farmland would face much greater damage during storm season.

Mangroves also serve as underwater nurseries for ocean life. The maze of roots provides a safe hiding place for young fish, shrimp, and crabs. These small creatures grow strong in the calm, shady waters among the roots before swimming out to coral reefs or the open sea. In fact, a large percentage of the fish that Jamaicans catch and eat begin their lives sheltered by mangrove forests. If the mangroves disappear, the fish populations would drop significantly.

Additionally, mangroves store huge amounts of carbon in their muddy soil—far more than most rainforests do. Carbon is a gas that contributes to climate change, so keeping mangrove forests healthy is one of the most effective natural ways to fight global warming.

Despite all of these benefits, mangroves are disappearing around the world. In many coastal areas, they are cleared to make room for hotels, resorts, and shrimp farms. People sometimes see them as swampy wastelands that attract mosquitoes, not understanding what is lost when the trees are removed.

Conservationists are working hard to protect remaining mangrove forests. Some countries have passed strict laws to make it illegal to cut down mangroves. In Jamaica, community groups and students regularly plant new mangrove seedlings along shorelines that have been damaged. It takes years for a mangrove forest to grow back to full strength, but the effort is considered worthwhile because of everything these quiet trees provide.

Understanding mangroves helps us see that nature is not just a collection of separate plants and animals. Everything is connected, and sometimes the most important living things are the ones working quietly in the background.`;

const g5LaDiff8Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P1}

What was the first landmark Marcus and Zara found?`,
    options: [
      "A flat rock shaped like a turtle",
      "A mahogany tree split by lightning",
      "A dark opening in the rock",
      "A tangle of wild coffee vines"
    ],
    correctAnswer: 1,
    explanation: `The passage states that "the first landmark, a mahogany tree split by lightning, was exactly where the map said it would be."`
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

Why did Marcus put the map in his pocket instead of giving up when Zara complained?`,
    options: [
      "He believed the remaining clues were enough to guide them if they thought carefully.",
      "He was frustrated that the map was torn and didn't want to look at it anymore.",
      "He knew exactly where the cave was and no longer needed the map.",
      "He wanted to hide the map so Zara would stop complaining about it."
    ],
    correctAnswer: 0,
    explanation: `Marcus says, "If we follow the ones we can read, we can figure out the rest." This shows he believed the visible landmarks were sufficient to complete the journey.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

When Zara said, "Caves are usually higher up in limestone hills. Everyone knows that," she was mostly relying on`,
    options: [
      "what her grandfather had specifically told her about this cave",
      "careful observation of the landscape around her",
      "a general assumption rather than proof specific to their situation",
      "scientific evidence she had read in a textbook"
    ],
    correctAnswer: 2,
    explanation: `Zara uses a general rule ("Everyone knows that") instead of looking at the specific evidence right in front of her, like the limestone gravel Marcus pointed out.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

${P1}

What is the most important idea the author wants to share through this story?`,
    options: [
      "Having a perfect plan is less important than being able to think through problems.",
      "Old maps are unreliable and should never be used for exploring.",
      "It is too dangerous to explore the Jamaican countryside without an adult.",
      "Geologists are the only people who can successfully find caves."
    ],
    correctAnswer: 0,
    explanation: `Even though the map was torn, Marcus and Zara succeeded by observing their surroundings and reasoning through the missing information. This highlights the value of critical thinking.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.

${P1}

Based on the story, what would Marcus and Zara most likely do if they found another torn map in the future?`,
    options: [
      "Throw it away immediately",
      "Give it to a professional explorer to solve",
      "Copy the map and sell it to a museum",
      "Study the visible clues and try to reason out the missing parts"
    ],
    correctAnswer: 3,
    explanation: `Their success in this story was built on studying visible clues and reasoning out the rest. It is logical to predict they would use the same successful strategy again.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P1}

How do Marcus's and Zara's approaches to the fork in the path differ?`,
    options: [
      "Marcus relies on specific evidence in the environment, while Zara relies on a general rule.",
      "Zara wants to observe the ground, while Marcus wants to guess randomly.",
      "Both of them want to go back home, but neither wants to admit it.",
      "Marcus wants to split up to search both paths, but Zara wants to stay together."
    ],
    correctAnswer: 0,
    explanation: `Marcus looks at the limestone gravel on the ground as specific evidence. Zara relies on the general idea that caves are usually higher up.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P1}

What can the reader conclude about Marcus and Zara's grandfather?`,
    options: [
      "He was careless and often lost his belongings in the bush.",
      "He valued observation, reasoning, and curiosity about the natural world.",
      "He never actually found the cave himself but just drew a picture of it.",
      "He wanted to keep the cave a secret from his family forever."
    ],
    correctAnswer: 1,
    explanation: `He drew a detailed map with specific landmarks and was a geologist who noticed things like limestone gravel. The story shows he passed down a legacy of curiosity and observation.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P2}

According to the passage, how do mangrove leaves handle the salt from seawater?`,
    options: [
      "They absorb it and store it in the trunk for later use.",
      "They drop all their leaves whenever salt touches them.",
      "They filter it out and sometimes push salt crystals out through their surfaces.",
      "They use the salt to make their roots grow taller and stronger."
    ],
    correctAnswer: 2,
    explanation: `The passage explains that mangrove leaves "filter out the salt, sometimes pushing tiny salt crystals out through their surfaces."`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P2}

The author supports the idea that mangroves protect the coast by pointing out that`,
    options: [
      "hotels are often built where mangroves used to be",
      "mangroves are the tallest and strongest trees in the Caribbean",
      "their tangled roots absorb the energy of hurricane waves",
      "mangroves attract mosquitoes that keep tourists away"
    ],
    correctAnswer: 2,
    explanation: `The author states that "when hurricanes bring powerful waves crashing toward the shore, the roots catch and absorb the energy of the water." This is the direct evidence provided.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

${P2}

Why does the author mention that mangroves store more carbon than rainforests?`,
    options: [
      "To show that rainforests are not important for the environment",
      "To encourage people to cut down rainforests and replace them with mangroves",
      "To explain exactly how carbon is created deep in the ocean",
      "To persuade readers that protecting mangroves is a powerful way to fight climate change"
    ],
    correctAnswer: 3,
    explanation: `By comparing mangroves to rainforests and mentioning their role in storing carbon, the author emphasizes how crucial they are in the fight against global warming.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P2}

How are the roles of mangrove roots described differently in the passage?`,
    options: [
      "They act only as snorkels for oxygen and serve no other purpose.",
      "They look like a net on the surface but act as a protective barrier and nursery underwater.",
      "They are described as dangerous obstacles for fish and crabs.",
      "They are only useful during the dry season when the tide is out."
    ],
    correctAnswer: 1,
    explanation: `The passage compares their appearance ("like a giant net") to their actual functions: absorbing wave energy (barrier) and hiding young sea creatures (nursery).`
  },
  {
    id: 12,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P2}

What can the reader conclude about the people who clear mangroves for hotels?`,
    options: [
      "They likely do not understand the full environmental benefits the trees provide.",
      "They have studied mangroves carefully and decided they are completely useless.",
      "They are trying to help local fish populations grow much faster.",
      "They know that mangroves contribute heavily to climate change."
    ],
    correctAnswer: 0,
    explanation: `The passage states people see them as "swampy wastelands... not understanding what is lost when the trees are removed." This implies a lack of awareness about their true value.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.

${P2}

If a coastal community stops protecting its mangroves, what is the most likely long-term result according to the passage?`,
    options: [
      "The coastline will become more protected from storms over time.",
      "Fish populations in the area will likely decrease, and the coast will be more vulnerable to storms.",
      "The mangroves will grow back much faster on their own without human interference.",
      "Hurricanes will stop happening in that region entirely."
    ],
    correctAnswer: 1,
    explanation: `The passage states that without mangroves, coastal villages face greater storm damage and that fish populations would drop significantly if mangroves disappear.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P2}

The author includes the detail about community groups planting seedlings to`,
    options: [
      "prove that mangroves grow better in cities than in rural areas",
      "argue that passing laws is the only way to protect the environment",
      "explain the correct process for starting a successful shrimp farm",
      "show that people are taking action to restore the damage caused by clearing mangroves"
    ],
    correctAnswer: 3,
    explanation: `This detail follows the section on mangroves being cleared. It shows a practical, positive response to the problem of destruction, highlighting conservation efforts.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passages then answer the question.

${P1}

${P2}

Both passages suggest that`,
    options: [
      "looking closely at small details can lead to a better understanding of a larger situation",
      "it is always better to work alone than in a group",
      "older people always know more than younger people do",
      "exploring nature is too dangerous for students to attempt"
    ],
    correctAnswer: 0,
    explanation: `Marcus looks at small stones to understand the landscape, and understanding mangroves helps us see how nature is connected. Both emphasize careful observation for bigger insights.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is the closest synonym for "extraordinary" as used in Passage 2?`,
    options: [
      "unusual",
      "ordinary",
      "dangerous",
      "tiny"
    ],
    correctAnswer: 0,
    explanation: `"Extraordinary" means something out of the ordinary or highly remarkable, making "unusual" the closest synonym.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word means the OPPOSITE of "bare" as used in the sentence "the upper path, which was dry and bare"?`,
    options: [
      "exposed",
      "empty",
      "smooth",
      "covered"
    ],
    correctAnswer: 3,
    explanation: `"Bare" means lacking vegetation or covering. "Covered" is the opposite, meaning something is hidden or protected by a layer.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The word "underwater" begins with the prefix "under-." What does "underwater nurseries" mean?`,
    options: [
      "nurseries that are built above the surface of the water",
      "nurseries that have no water at all",
      "nurseries that are located beneath the surface of the water",
      "nurseries that are only used during the winter"
    ],
    correctAnswer: 2,
    explanation: `The prefix "under-" means below or beneath. "Underwater" means beneath the surface of the water.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The suffix "-ist" means "one who." In Passage 1, a "geologist" is`,
    options: [
      "a person who studies rocks and the Earth's physical structure",
      "a person who draws maps for a living",
      "a person who plants trees along the coast",
      "a person who catches fish to sell at the market"
    ],
    correctAnswer: 0,
    explanation: `"Geo" relates to the earth, and "-ist" means one who studies. A geologist is a scientist who studies the Earth and rocks.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In Passage 2, mangroves are described as "guardians of the coast." What does this phrase suggest?`,
    options: [
      "The trees provide a natural defense that protects the shoreline from harm.",
      "The trees hire security guards to patrol the beach.",
      "The trees are the only plants allowed to grow near the ocean.",
      "The trees are dangerous and should be avoided by swimmers."
    ],
    correctAnswer: 0,
    explanation: `A guardian is someone or something that protects. The passage goes on to explain how mangroves protect the land from waves and flooding.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: "Which sentence uses \"pool\" to mean a small body of standing water?",
    options: [
      "Marcus shot the ball into the pool table pocket.",
      "A small pool of water collected in the hollow among the roots.",
      "The workers decided to pool their money to buy supplies.",
      "The group formed a pool of experts to advise the government."
    ],
    correctAnswer: 1,
    explanation: `In the context of mangroves, a "pool" refers to a small body of standing water, which matches option B. The other options use "pool" in game, collective, or resource contexts.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Root is to tree as foundation is to`,
    options: [
      "roof",
      "soil",
      "building",
      "seed"
    ],
    correctAnswer: 2,
    explanation: `Roots anchor a tree and provide it with a base, just as a foundation anchors a building and provides it with a base.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase could best replace "bush" in "they climbed through the bush" without changing the meaning?`,
    options: [
      "a wide-open sandy beach",
      "a dense area of wild plants and trees",
      "a crowded city street",
      "a deep, fast-moving river"
    ],
    correctAnswer: 1,
    explanation: `In Caribbean English, "bush" commonly refers to wild, uncultivated land covered in thick vegetation.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `Which meaning best fits the word "vulnerable" as it relates to a coast without mangroves?`,
    options: [
      "very famous or well-known",
      "difficult to see or find",
      "open to harm or damage",
      "extremely large in size"
    ],
    correctAnswer: 2,
    explanation: `Without mangroves to act as a barrier, the coast is "open to harm or damage" from storms and flooding.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: `Choose the best word to complete the sentence: "Marcus had to ______ his way through the thick ferns to reach the cave entrance."`,
    options: [
      "paint",
      "fly",
      "push",
      "sleep"
    ],
    correctAnswer: 2,
    explanation: `Ferns are physical obstacles. "Push" implies using physical force to move through them, which fits the context perfectly.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Pronouns",
    question: "Which sentence uses the relative pronoun correctly?",
    options: [
      "The mangroves protected the coast during the storm, which reduced the force of the waves.",
      "The mangroves protected the coast during the storm, who reduced the force of the waves.",
      "The mangroves protected the coast during the storm, whom reduced the force of the waves.",
      "The mangroves protected the coast during the storm, whose reduced the force of the waves."
    ],
    correctAnswer: 0,
    explanation: `"Which" correctly refers to the entire preceding clause (the mangroves protecting the coast). The other options incorrectly use object pronouns ("Him," "her," "Me") as subjects.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "The tangled roots of the mangroves acts as a natural barrier.",
      "The tangled roots of the mangroves act as a natural barrier.",
      "The tangled roots of the mangroves acting as a natural barrier.",
      "The tangled roots of the mangroves has acted as a natural barrier."
    ],
    correctAnswer: 1,
    explanation: `The subject "roots" is plural, so it requires the plural verb "act" without an -s ending.`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Marcus folded the map and puts it in his pocket.",
      "Marcus folds the map and put it in his pocket.",
      "Marcus folded the map and put it in his pocket.",
      "Marcus will fold the map and put it in his pocket."
    ],
    correctAnswer: 2,
    explanation: `Both actions happened in the past, so "folded" and "put" are both past tense and consistent.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After they pushed through the ferns the cave entrance appeared.",
      "After they pushed through the ferns, the cave entrance appeared.",
      "After, they pushed through the ferns the cave entrance appeared.",
      "After they pushed, through the ferns the cave entrance appeared."
    ],
    correctAnswer: 1,
    explanation: `A comma is needed after the introductory dependent clause "After they pushed through the ferns" to separate it from the main clause.`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      `"The best tool you can carry is a good question Zara said."`,
      `The best tool you can carry is a good question," Zara said.`,
      `"The best tool you can carry is a good question" Zara said.`,
      `"The best tool you can carry is a good question," Zara said.`
    ],
    correctAnswer: 3,
    explanation: `The spoken words are fully enclosed in quotation marks, with the comma placed inside the closing quotation marks before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: `Which sentence uses parallel structure?`,
    options: [
      "Mangroves protect the coast, filtering saltwater, and they provide shelter for fish.",
      "Mangroves protect the coast, filter saltwater, and provide shelter for fish.",
      "Mangroves protecting the coast, filtered saltwater, and providing shelter for fish.",
      "Mangroves protect the coast, to filter saltwater, and providing shelter for fish."
    ],
    correctAnswer: 1,
    explanation: `The three actions use the exact same verb form: protect, filter, and provide. This creates a smooth, parallel structure.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which choice correctly repairs the run-on sentence?`,
    options: [
      "Mangroves store carbon they fight climate change.",
      "Mangroves store carbon, they fight climate change.",
      "Mangroves store carbon, so they help fight climate change.",
      "Mangroves storing carbon and they fight climate change."
    ],
    correctAnswer: 2,
    explanation: `Using a comma and the coordinating conjunction "so" correctly joins the two independent clauses by showing cause and effect.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which choice best combines the ideas? "The map was torn. Marcus still used it."`,
    options: [
      "Although the map was torn, Marcus still used it.",
      "The map was torn, Marcus still used it.",
      "Torn map but Marcus still used it.",
      "Although the map was torn, but Marcus still used it."
    ],
    correctAnswer: 0,
    explanation: `"Although" is a subordinating conjunction that correctly shows the contrast between the torn map and Marcus using it, without creating a run-on or a double conjunction error.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "Mangroves are often cleared for buildings; _____, this destroys important fish habitats."`,
    options: [
      "therefore",
      "however",
      "for example",
      "meanwhile"
    ],
    correctAnswer: 0,
    explanation: `"Therefore" shows a cause-and-effect relationship: because mangroves are cleared, the result is the destruction of fish habitats.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: `Which word choice is most precise? "The mangrove roots ______ the energy of the hurricane waves."`,
    options: [
      "did",
      "made",
      "absorbed",
      "got"
    ],
    correctAnswer: 2,
    explanation: `"Absorbed" is the precise scientific term for taking in energy, which accurately describes how the roots deal with the wave energy.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which of the following would be the strongest introduction for a paragraph about why mangroves should be protected?`,
    options: [
      "Mangroves are unusual coastal forests that support wildlife and influence the environments around them.",
      "Protecting mangroves matters because these forests provide several benefits to coastal communities and marine life.",
      "Along tropical coastlines, mangroves perform important environmental functions that are often overlooked.",
      "Mangroves may look like ordinary bushes, but they are powerful protectors of our coastlines, our fish populations, and our climate."
    ],
    correctAnswer: 3,
    explanation: `A strong introduction grabs attention and states a clear, specific main idea. Option D uses a contrast to hook the reader and lists the specific points the paragraph will cover.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which sentence provides the best supporting detail for the topic sentence "Mangrove forests are essential for healthy oceans"?`,
    options: [
      "Mangrove roots slow moving water and trap sediment along the shoreline.",
      "Young fish and crabs shelter in the roots until they are large enough to survive in the open sea.",
      "Mangrove forests store large amounts of carbon in their soil and plant material.",
      "Dense mangrove roots can reduce the force of waves before they reach inland areas."
    ],
    correctAnswer: 1,
    explanation: `A good supporting detail directly proves the topic sentence. Option B explains exactly how mangroves help ocean life by acting as a nursery for young marine animals.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition word best fills the blank in this sentence? "Mangroves absorb storm waves; _____, they also provide a home for marine life."`,
    options: [
      "however",
      "although",
      "instead",
      "furthermore"
    ],
    correctAnswer: 3,
    explanation: `"Furthermore" is used to add another supporting point to a list. It correctly shows that providing a home for marine life is an additional benefit.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Read the paragraph below. Which sentence should be removed because it does not belong?

(1) Mangroves play a vital role in protecting coastal areas from hurricane damage. (2) Their dense root systems slow down incoming waves and prevent erosion. (3) Coastal communities may also plant other salt-tolerant trees near roads and public spaces. (4) Without these trees, storm surges would cause much more flooding inland.`,
    options: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 4",
      "Sentence 3"
    ],
    correctAnswer: 3,
    explanation: `Sentence 3 is about pineapples and agriculture, which has nothing to do with the topic of mangroves protecting coastlines from hurricanes.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which of the following would be the most effective concluding sentence for an essay about exploring nature?`,
    options: [
      "Exploring natural places can help people notice details they might otherwise overlook and ask better questions about the world.",
      "Caves, forests, wetlands, and other natural places can all teach visitors something about how environments work.",
      "Whether following a faded map to a hidden cave or examining roots in a coastal swamp, exploring nature teaches us to look closely, think carefully, and appreciate the world around us.",
      "Careful exploration can turn an ordinary outdoor experience into an opportunity to learn about nature and its patterns."
    ],
    correctAnswer: 2,
    explanation: `A strong conclusion leaves a lasting impression by restating the main idea in a fresh, memorable way. Option C ties back to the essay's examples and uses parallel structure for impact.`
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

export default function G5LaDiff8MockTest() {
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
    ? g5LaDiff8Questions
    : g5LaDiff8Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 8",
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
      ? prepareAssessment(g5LaDiff8Questions)
      : preparePreview(g5LaDiff8Questions, FREE_QUESTION_LIMIT);
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
                Language Arts Difficult 8
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
              <p className="text-slate-600">Language Arts Difficult 8</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 8</h1>
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
            <span>
              {Math.round((answeredCount / totalQuestions) * 100)}% complete
            </span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className="h-2"
          />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!isPremium && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Free Preview: {FREE_QUESTION_LIMIT} of 40 questions
              </p>
              <p className="text-sm text-amber-700">
                Upgrade to Premium to access the full test.
              </p>
            </div>
          )}
          <Card className="mb-6 border-blue-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {q.skill}
                </span>
                <span className="text-xs uppercase tracking-wide opacity-70">
                  {secLabel(q.type)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">
                {q.question}
              </p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
                    )}
                  >
                    <span className="font-medium text-blue-700 mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((p) => Math.max(p - 1, 0))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Flag className="h-4 w-4 mr-2" />
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion((p) => Math.min(p + 1, totalQuestions - 1))
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
          <Card className="border-blue-100">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-blue-700">
                Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(Math.max(idx, 0), totalQuestions - 1),
                      )
                    }
                    className={cn(
                      "w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx
                        ? "bg-blue-600 text-white"
                        : answers[idx] !== null
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-600" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-100" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
