"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveStudentTestResult } from "@/lib/student-test-results";
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
   DIFFICULT 7  ·  Passage 1: Water Conservation
                   Passage 2: Community Resource Management
   ============================================================ */

const P1 = `Tanya climbed the steep path to her grandmother's garden every Saturday morning. The garden sat at the top of a small hill overlooking the village, and from up there, Tanya could see the rooftops of nearly every house. Her grandmother, Ma Bell, had tended this garden for over forty years.

"This garden has taught me more than any school," Ma Bell would say as she handed Tanya a watering can. "You just have to know how to listen."

Tanya never quite understood what her grandmother meant by that. Plants did not talk. But she loved being in the garden anyway. She loved the smell of fresh basil, the bright yellow of the sunflowers, and the way the morning light made everything look like it was glowing.

One Saturday, Tanya arrived to find Ma Bell sitting on an old wooden bench, staring at a patch of bare soil where a large mango tree had stood for as long as Tanya could remember.

"What happened to the mango tree?" Tanya asked, her eyes wide.

"It fell in the storm last night," Ma Bell said quietly. "Fifty years it stood there. My father planted it when I was just about your age."

Tanya looked at the empty space. She felt a heaviness in her chest that she could not explain. It was not just a tree. It was where she had eaten her first mango, where she had hidden during games of hide-and-seek, where Ma Bell had told her stories about the old days.

"Are you going to plant another one?" Tanya asked.

Ma Bell was quiet for a long time. "I have been thinking about that," she said finally. "A new tree would not be the same. But the soil is still good. The roots that remain in the ground will help something new grow stronger than if it had started from nothing."

Over the next few weeks, Tanya watched as her grandmother cleared the space, turned the soil, and planted a small guava sapling. Ma Bell did not rush. She watered it gently, added compost around its base, and placed small stones around it to protect it from the wind.

"Will it grow as tall as the mango tree?" Tanya asked one afternoon.

"Maybe not," Ma Bell said. "But it will grow its own way, and it will give us something sweet. That is what matters."

Tanya thought about this for a moment. She realized then what her grandmother had always meant about listening to the garden. It was not about hearing words. It was about paying attention—to what the soil needed, to what the plants were telling you by how they grew, and to the fact that even when something ends, the ground is still there, ready for something new.

That evening, Tanya walked home slowly. She looked at the hilltop garden from the road below and smiled. The guava sapling was small, but in the golden light of sunset, it looked full of promise.`;

const P2 = `Close your eyes for a moment and listen. What do you hear? You might notice the hum of a fan, the bark of a dog, or the chatter of people outside. Sound is everywhere, but most of us rarely stop to think about how it works.

Sound travels in waves, much like the ripples that spread out when you drop a stone into a pond. When something vibrates, it pushes and pulls on the air around it, creating invisible waves that move outward in all directions. These waves enter our ears and cause tiny parts inside to vibrate as well. Our brain then turns those vibrations into the sounds we recognize—a bell ringing, a voice calling, rain falling on a roof.

Interestingly, sound needs something to travel through. It moves fastest through solids, slower through liquids, and slowest through gases like air. In the empty space between stars, where there is no air, no liquid, and no solid, sound cannot travel at all. That is why outer space is completely silent.

The speed of sound is not the same everywhere on Earth either. On a warm day, sound travels faster than on a cold day because the air molecules are moving more quickly and can pass the vibrations along more efficiently. This is why you can sometimes hear sounds more clearly at night when the air near the ground is cooler than the air above it—the sound waves bend downward and stay close to the ground instead of spreading upward into the sky.

Scientists who study sound are called acousticians, and their work is more important than you might think. They design concert halls so that every seat gets clear, rich sound. They create quieter airplane engines. They even help architects design school classrooms where students can hear the teacher without straining.

Some animals have remarkable abilities when it comes to sound. Bats use a process called echolocation. They send out high-pitched squeaks that bounce off objects and return to their ears. By listening to how long it takes for the sound to come back and how it has changed, bats can "see" their surroundings in complete darkness. Dolphins use a similar method underwater.

Understanding sound helps us appreciate the world more deeply. The next time you hear a bird singing or a river flowing, remember that what you are experiencing is a wave of energy, travelling through the air, finding its way to you.`;

const g5LaDiff7Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P1}

What did Tanya notice when she first looked at the garden from the road below on the last evening?`,
    options: [
      "The guava sapling looked full of promise in the sunset light",
      "The mango tree had grown back overnight",
      "Ma Bell was still working in the garden",
      "The other plants had begun to wilt without the mango tree"
    ],
    correctAnswer: 0,
    explanation: `The last paragraph states that Tanya "looked at the hilltop garden from the road below and smiled" and that "the guava sapling was small, but in the golden light of sunset, it looked full of promise."`
  },
  {
    id: 2,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

When Ma Bell said, "You just have to know how to listen," she most likely meant that`,
    options: [
      "Tanya needed to hear the plants speaking to her",
      "the garden made loud noises that most people ignored",
      "a person must observe carefully and pay close attention to what the garden shows",
      "gardeners should play music for their plants to help them grow"
    ],
    correctAnswer: 2,
    explanation: `At the end of the story, Tanya realizes that "listening" to the garden means "paying attention—to what the soil needed, to what the plants were telling you by how they grew." It is about careful observation, not literal hearing.`
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `Read the passage then answer the question.

${P1}

Why did Tanya feel "a heaviness in her chest" when she saw the empty space?`,
    options: [
      "She was angry that no one had warned her about the storm",
      "She had strong emotional memories connected to the mango tree",
      "She was worried about how much it would cost to replace the tree",
      "She realized she would have to do all the gardening herself"
    ],
    correctAnswer: 1,
    explanation: `The passage explains that the mango tree was where Tanya ate her first mango, played hide-and-seek, and heard her grandmother's stories. These personal memories explain the emotional weight she felt at its loss.`
  },
  {
    id: 4,
    type: "reading",
    skill: "Theme",
    question: `Read the passage then answer the question.

${P1}

What is the most important lesson Tanya learns by the end of the story?`,
    options: [
      "That mango trees are better than guava trees",
      "That storms always destroy things people love",
      "That gardens require too much hard work",
      "That endings can create the conditions for new beginnings"
    ],
    correctAnswer: 3,
    explanation: `Ma Bell explains that the old roots will help something new "grow stronger," and Tanya realizes that "even when something ends, the ground is still there, ready for something new." This is the central theme of the story.`
  },
  {
    id: 5,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.

${P1}

Based on the story, what will most likely happen in the months after the planting of the guava sapling?`,
    options: [
      "Tanya will continue visiting the garden and watching the sapling grow",
      "Ma Bell will decide to move to a different village",
      "Tanya will lose interest in gardening and stop visiting",
      "The guava sapling will be blown down by another storm"
    ],
    correctAnswer: 0,
    explanation: `Tanya has visited the garden every Saturday for a long time, and the story shows her growing appreciation for it. There is no evidence in the story to support the other predictions.`
  },
  {
    id: 6,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P1}

How is Ma Bell's approach to replacing the mango tree different from what a person might expect?`,
    options: [
      "She uses expensive tools and chemicals to make plants grow fast",
      "She hires workers to do all the physical labour for her",
      "She is patient and works with the natural conditions rather than rushing",
      "She only grows one type of plant at a time"
    ],
    correctAnswer: 2,
    explanation: `Ma Bell says "A new tree would not be the same" but then carefully prepares the soil and plants a guava sapling without rushing. She works with what the ground provides rather than trying to force a quick replacement.`
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P1}

What can the reader conclude about Ma Bell's character?`,
    options: [
      "She is stubborn and refuses to change her ways",
      "She is wise and finds meaning in the process of growth",
      "She is careless and does not take care of her garden",
      "She is unhappy and wishes she lived somewhere else"
    ],
    correctAnswer: 1,
    explanation: `Ma Bell has tended the garden for over forty years, speaks thoughtfully about what the garden has taught her, and handles the loss of the mango tree with grace and purpose. These details show a character who is wise and reflective.`
  },
  {
    id: 8,
    type: "reading",
    skill: "Detail",
    question: `Read the passage then answer the question.

${P2}

According to the passage, why does sound travel faster on a warm day?`,
    options: [
      "Warm air is heavier and pushes the sound waves harder",
      "Warm air creates more vibrations in the ground",
      "Warm air makes sounds louder so they seem to travel faster",
      "Warm air molecules move more quickly and pass vibrations along more efficiently"
    ],
    correctAnswer: 3,
    explanation: `The passage states that "on a warm day, sound travels faster than on a cold day because the air molecules are moving more quickly and can pass the vibrations along more efficiently."`
  },
  {
    id: 9,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P2}

Based on the passage, which of the following best explains why outer space is silent?`,
    options: [
      "There is no medium such as air, liquid, or solid for sound waves to travel through",
      "The stars are too far apart for any sound to reach from one to another",
      "The temperature in space is too cold for vibrations to occur",
      "There is too much light in space for sound waves to form properly"
    ],
    correctAnswer: 0,
    explanation: `The passage explains that "sound needs something to travel through" and that in the empty space between stars, "there is no air, no liquid, and no solid," so sound cannot travel at all.`
  },
  {
    id: 10,
    type: "reading",
    skill: "Author's Purpose",
    question: `Read the passage then answer the question.

${P2}

Which of the following best describes the author's purpose in this passage?`,
    options: [
      "To persuade readers to become scientists who study sound",
      "To entertain readers with funny stories about animals and sound",
      "To inform readers about how sound works and why it matters in everyday life",
      "To argue that humans do not appreciate sound enough"
    ],
    correctAnswer: 2,
    explanation: `The passage explains how sound travels, why space is silent, how temperature affects sound speed, what acousticians do, and how animals use sound. These are all informative details presented to help readers understand a scientific topic.`
  },
  {
    id: 11,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passage then answer the question.

${P2}

How are bats and dolphins similar in the way they use sound?`,
    options: [
      "Both make sounds that can be heard clearly by humans",
      "Both send out sounds and use the returning echoes to understand their surroundings",
      "Both only use sound during the daytime",
      "Both live in places where sound travels faster than in air"
    ],
    correctAnswer: 1,
    explanation: `The passage states that bats send out high-pitched squeaks that bounce off objects and return, and that "dolphins use a similar method underwater." Both use echoes to sense their environment.`
  },
  {
    id: 12,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `Read the passage then answer the question.

${P2}

What can the reader conclude from the information about acousticians?`,
    options: [
      "Most acousticians work in outer space",
      "Acousticians only study how animals hear sounds",
      "Acousticians are not very important to modern life",
      "Understanding sound helps solve practical problems in buildings and technology"
    ],
    correctAnswer: 3,
    explanation: `The passage gives examples of acousticians designing concert halls, creating quieter engines, and helping with classroom design. These examples show that their knowledge of sound solves real-world problems.`
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `Read the passage then answer the question.

${P2}

If a student were reading this passage and wanted to learn more, which topic would be most closely related?`,
    options: [
      "How different materials affect the way sound travels",
      "How to grow plants in a silent environment",
      "The history of mango trees in the Caribbean",
      "How to paint pictures of outer space"
    ],
    correctAnswer: 0,
    explanation: `The passage explains that sound travels at different speeds through solids, liquids, and gases. Learning more about how specific materials affect sound would be a natural extension of this topic.`
  },
  {
    id: 14,
    type: "reading",
    skill: "Evaluating Evidence",
    question: `Read the passage then answer the question.

${P2}

The author includes the detail about sound bending downward at night to`,
    options: [
      "show that sound is dangerous at night",
      "prove that cold air is heavier than warm air",
      "help readers understand a real-world effect they might have noticed themselves",
      "argue that people should only go outside during the day"
    ],
    correctAnswer: 2,
    explanation: `The author uses this detail to connect the science of sound to something readers may have experienced—hearing sounds more clearly at night. It makes the information more relatable and practical.`
  },
  {
    id: 15,
    type: "reading",
    skill: "Compare and Contrast",
    question: `Read the passages then answer the question.

${P1}

${P2}

Both passages include the idea that`,
    options: [
      "people should spend more time outdoors",
      "paying close attention to the world around us leads to deeper understanding",
      "older people know more about science than young people",
      "nature is always beautiful and never causes harm"
    ],
    correctAnswer: 1,
    explanation: `In Passage 1, Tanya learns that "listening" to the garden means paying close attention to how things grow and change. In Passage 2, the author encourages readers to notice and think about the sounds around them. Both passages show that careful attention leads to greater understanding.`
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Synonym",
    question: `Which word is the closest synonym for "remarkable" as used in Passage 2?`,
    options: [
      "ordinary",
      "noteworthy",
      "hidden",
      "dangerous"
    ],
    correctAnswer: 1,
    explanation: `"Remarkable" means unusual or worthy of attention, so "noteworthy" is the closest synonym.`
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Antonym",
    question: `Which word means the OPPOSITE of "gently" in the sentence "She watered it gently"?`,
    options: [
      "carefully",
      "quietly",
      "roughly",
      "slowly"
    ],
    correctAnswer: 2,
    explanation: `"Gently" means with care and little force; "roughly" expresses the opposite idea.`
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: `The word "invisible" begins with the prefix "in-," meaning "not." What does "invisible waves" mean?`,
    options: [
      "waves that cannot be seen",
      "waves that cannot move",
      "waves that cannot be heard",
      "waves that cannot change"
    ],
    correctAnswer: 0,
    explanation: `The prefix "in-" means "not," so invisible waves are waves that cannot be seen.`
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: `The suffix "-tion" changes "vibrate" into "vibration." What does "vibration" name?`,
    options: [
      "a person who studies sound",
      "the act or result of moving back and forth",
      "a place where sound is recorded",
      "a tool used to measure temperature"
    ],
    correctAnswer: 1,
    explanation: `"Vibration" is the noun naming the act or result of vibrating—moving back and forth rapidly.`
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: `In Passage 1, the guava sapling looked "full of promise." What does that phrase suggest?`,
    options: [
      "It was likely to grow into something valuable.",
      "It had already grown taller than the mango tree.",
      "It needed to be moved to another garden.",
      "It would produce fruit the following morning."
    ],
    correctAnswer: 0,
    explanation: `"Full of promise" suggests strong future potential, not that growth or fruit had already appeared.`
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: `Which sentence uses "wave" in the same way as Passage 2?`,
    options: [
      "Tanya gave Ma Bell a wave before leaving.",
      "A sound wave carried the music across the room.",
      "A large wave washed over the fishing boat.",
      "The flag began to wave in the strong wind."
    ],
    correctAnswer: 1,
    explanation: `Passage 2 uses "wave" to mean a travelling disturbance that carries energy, as in a sound wave.`
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: `Root is to plant as foundation is to —`,
    options: [
      "building",
      "river",
      "cloud",
      "sound"
    ],
    correctAnswer: 0,
    explanation: `Roots support a plant just as a foundation supports a building.`
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: `Which phrase could best replace "tended this garden" without changing the meaning?`,
    options: [
      "looked after this garden",
      "walked past this garden",
      "measured this garden",
      "sold this garden"
    ],
    correctAnswer: 0,
    explanation: `To tend a garden is to care for or look after it.`
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: `Which meaning best fits the academic word "efficiently"?`,
    options: [
      "in a way that works well without wasting effort",
      "in a way that creates the greatest amount of noise",
      "in a way that takes longer than necessary",
      "in a way that hides the final result"
    ],
    correctAnswer: 0,
    explanation: `"Efficiently" means working well while avoiding wasted time, energy, or effort.`
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: `Choose the best word: "Because the old tree had fallen, Ma Bell had to _____ the garden's changing conditions."`,
    options: [
      "ignore",
      "adapt to",
      "complain about",
      "escape from"
    ],
    correctAnswer: 1,
    explanation: `Ma Bell adjusted her actions to the new situation, so "adapt to" fits best.`
  },
  {
    id: 26,
    type: "grammar",
    skill: "Pronouns",
    question: `Which sentence uses the pronoun correctly?`,
    options: [
      "Tanya and me carried the watering cans.",
      "Tanya and I carried the watering cans.",
      "Me and Tanya carried the watering cans.",
      "Tanya and myself carried the watering cans."
    ],
    correctAnswer: 1,
    explanation: `The pronoun is part of the subject, so the subject form "I" is correct.`
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: `Which sentence is written correctly?`,
    options: [
      "The movement of the sound waves cause the tiny parts to vibrate.",
      "The movement of the sound waves causes the tiny parts to vibrate.",
      "The movement of the sound waves causing the tiny parts to vibrate.",
      "The movement of the sound waves have caused the tiny parts to vibrate."
    ],
    correctAnswer: 1,
    explanation: `The subject "movement" is singular, so it takes the singular verb "causes."`
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: `Which sentence keeps the verb tense consistent?`,
    options: [
      "Ma Bell cleared the soil and plants a guava sapling.",
      "Ma Bell clears the soil and planted a guava sapling.",
      "Ma Bell cleared the soil and planted a guava sapling.",
      "Ma Bell will clear the soil and planted a guava sapling."
    ],
    correctAnswer: 2,
    explanation: `Both actions occurred in the past, so "cleared" and "planted" are consistent.`
  },
  {
    id: 29,
    type: "grammar",
    skill: "Punctuation",
    question: `Which sentence is punctuated correctly?`,
    options: [
      "After the storm ended Tanya climbed the hill.",
      "After the storm ended, Tanya climbed the hill.",
      "After, the storm ended Tanya climbed the hill.",
      "After the storm, ended Tanya climbed the hill."
    ],
    correctAnswer: 1,
    explanation: `A comma follows the introductory clause "After the storm ended."`
  },
  {
    id: 30,
    type: "grammar",
    skill: "Quotation Marks",
    question: `Which sentence uses quotation marks correctly?`,
    options: [
      `"The garden has taught me more than any school," Ma Bell said.`,
      `"The garden has taught me more than any school Ma Bell said."`,
      `The garden has taught me more than any school," Ma Bell said.`,
      `"The garden has taught me more than any school" Ma Bell said.`
    ],
    correctAnswer: 0,
    explanation: `The spoken words are enclosed in quotation marks, with the comma inside the closing mark before the speaker tag.`
  },
  {
    id: 31,
    type: "grammar",
    skill: "Parallel Structure",
    question: `Which sentence uses parallel structure?`,
    options: [
      "Ma Bell cleared the soil, adding compost, and the sapling was watered.",
      "Ma Bell cleared the soil, added compost, and watered the sapling.",
      "Ma Bell was clearing the soil, compost, and watered the sapling.",
      "Ma Bell cleared, to add compost, and watering the sapling."
    ],
    correctAnswer: 1,
    explanation: `The three actions use the same past-tense pattern: cleared, added, and watered.`
  },
  {
    id: 32,
    type: "grammar",
    skill: "Run-on Correction",
    question: `Which choice correctly repairs the run-on sentence?`,
    options: [
      "Sound needs a medium it cannot travel through empty space.",
      "Sound needs a medium, it cannot travel through empty space.",
      "Sound needs a medium, so it cannot travel through empty space.",
      "Sound needing a medium and cannot travel through empty space."
    ],
    correctAnswer: 2,
    explanation: `A comma plus "so" correctly joins the cause and result.`
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: `Which choice best combines the ideas? "The mango tree fell. The soil remained useful."`,
    options: [
      "Although the mango tree fell, the soil remained useful.",
      "The mango tree fell, the soil remained useful.",
      "Falling mango tree but the soil remained useful.",
      "Although the mango tree fell, but the soil remained useful."
    ],
    correctAnswer: 0,
    explanation: `"Although" clearly joins the contrasting ideas in one correct sentence.`
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: `Which transition best completes the sentence? "The mango tree was gone; _____, the garden could still support new life."`,
    options: [
      "therefore",
      "however",
      "for example",
      "meanwhile"
    ],
    correctAnswer: 1,
    explanation: `"However" shows the contrast between the tree's loss and the garden's continued potential.`
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: `Which word choice is most precise? "Acousticians _____ concert halls so sound reaches every seat clearly."`,
    options: [
      "do",
      "make",
      "design",
      "handle"
    ],
    correctAnswer: 2,
    explanation: `"Design" precisely describes planning a concert hall for a particular purpose.`
  },
  {
    id: 36,
    type: "writing",
    skill: "Strong Introduction",
    question: `Which of the following would be the strongest introduction for a paragraph about the importance of school gardens?`,
    options: [
      "School gardens are nice to look at.",
      "I like gardens because they have flowers.",
      "This paragraph is about school gardens and why they matter.",
      "School gardens do more than grow plants—they grow young minds, teaching students patience, responsibility, and an appreciation for nature."
    ],
    correctAnswer: 3,
    explanation: `A strong introduction should grab the reader's attention and clearly state the main idea. Option D uses a clever comparison, lists specific benefits, and sets up what the paragraph will discuss. The other options are too vague or weak.`
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: `Which sentence provides the best supporting detail for the topic sentence "Gardening teaches students responsibility"?`,
    options: [
      "When students must water plants regularly and pull weeds on schedule, they learn that living things depend on consistent care.",
      "Gardening is a fun activity that many students enjoy.",
      "Schools should have more gardens because they look attractive.",
      "Some students do not like getting their hands dirty."
    ],
    correctAnswer: 0,
    explanation: `A good supporting detail should directly prove or explain the topic sentence. Option A gives a specific example of how gardening teaches responsibility—by requiring regular, consistent care of living things. The other options do not support the topic sentence.`
  },
  {
    id: 38,
    type: "writing",
    skill: "Transitions",
    question: `Which transition word best fills the blank in this sentence? "Working in a garden can be tiring; _____, the rewards make the effort worthwhile."`,
    options: [
      "therefore",
      "similarly",
      "however",
      "because"
    ],
    correctAnswer: 2,
    explanation: `"However" shows a contrast between two ideas. The first part says gardening is tiring, and the second part says the rewards make it worthwhile. These ideas contrast with each other, so "however" is the best transition.`
  },
  {
    id: 39,
    type: "writing",
    skill: "Relevance",
    question: `Read the paragraph below. Which sentence should be removed because it does not belong?

(1) School gardens provide students with hands-on learning experiences. (2) Students can observe how seeds sprout and grow into mature plants. (3) Mathematics lessons can also take place in the classroom using textbooks. (4) In addition, students learn about nutrition by growing their own vegetables.`,
    options: [
      "Sentence 1",
      "Sentence 3",
      "Sentence 2",
      "Sentence 4"
    ],
    correctAnswer: 1,
    explanation: `Sentence 3 is about mathematics lessons in a classroom using textbooks, which does not relate to the topic of school gardens. All the other sentences focus on the benefits and learning experiences that school gardens provide.`
  },
  {
    id: 40,
    type: "writing",
    skill: "Strong Conclusion",
    question: `Which of the following would be the most effective concluding sentence for an essay about the benefits of reading?`,
    options: [
      "Reading is something people do.",
      "Those are some good things about reading.",
      "In conclusion, I have told you about reading.",
      "Whether exploring distant lands through a novel or discovering new facts in an article, reading opens doors to a lifetime of learning and imagination."
    ],
    correctAnswer: 3,
    explanation: `A strong conclusion restates the main idea in a fresh way and leaves the reader with a memorable thought. Option D does this by using vivid imagery and connecting back to the essay's theme. The other options are weak, vague, or simply announce that the essay is ending.`
  }
];

const shuffleAnswerOptions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const optionsWithOriginalIndex = question.options.map((option, index) => ({
      option,
      index,
    }));

    for (let i = optionsWithOriginalIndex.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [
        optionsWithOriginalIndex[j],
        optionsWithOriginalIndex[i],
      ];
    }

    const correctAnswer = optionsWithOriginalIndex.findIndex(
      (item) => item.index === question.correctAnswer,
    );

    return {
      ...question,
      options: optionsWithOriginalIndex.map((item) => item.option),
      correctAnswer,
    };
  });
};

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

export default function G5LaDiff7MockTest() {
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
    ? g5LaDiff7Questions
    : g5LaDiff7Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 7",
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
    const shuffledQuestions = shuffleAnswerOptions(sourceQuestions);
    setRandomizedQuestions(shuffledQuestions);
    setAnswers(new Array(shuffledQuestions.length).fill(null));
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
                Language Arts Difficult 7
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
              <p className="text-slate-600">Language Arts Difficult 7</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 7</h1>
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
