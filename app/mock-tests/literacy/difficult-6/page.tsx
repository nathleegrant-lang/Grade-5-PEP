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
   DIFFICULT 6  ·  Passage 1: Water Conservation
                   Passage 2: Community Resource Management
   ============================================================ */

const d6Passage1 = `Read the passage then answer the question.

"During a long drought, the village of Clearspring received water from the public standpipe only twice a week. Many families wasted what little they collected, letting taps run and washing in more water than they needed. A retired teacher named Miss Pearl decided to change this. She measured how much water a single dripping tap lost in a day and posted the surprising figure on the community board. Then she showed neighbours simple habits: catching rainwater in clean drums, reusing dishwater on the garden, and fixing leaks at once. At first only a few families listened, but as the drums filled and gardens stayed green, more joined in. Miss Pearl reminded everyone that conserving water was not about going without; it was about respecting a precious resource and using it with care so that there would be enough for all, even in the driest weeks."`;

const d6Passage2 = `Read the passage then answer the question.

"The fishing community of Blue Harbour faced a serious problem: the fish near the shore were becoming scarce. Some fishers blamed each other, while others wanted to catch as much as possible before the fish disappeared entirely. An elder named Mr. Dawes suggested a different path. He proposed that the community agree on rules together: leaving young fish to grow, resting certain areas for part of the year, and recording each day's catch so everyone could see the results. A few fishers argued that the rules would cost them money in the short term. Yet within two seasons the fish returned in greater numbers, and every family benefited. Mr. Dawes explained that a shared resource belongs to no single person; it can only last when a community manages it together, balancing today's needs against tomorrow's survival."`;

const g5LaDifficult6Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d6Passage1}

What caused Miss Pearl to start her water campaign?`,
    options: [
      "She wanted to prove that the standpipe schedule was unfair to the village.",
      "She noticed that families were wasting the little water they collected.",
      "She saw that the leaking taps were ruining the community board.",
      "She realized her garden was the only one that stayed green."
    ],
    correctAnswer: 1,
    explanation: "Miss Pearl acted because she observed families wasting water during the drought, not for external rewards or requests."
  },
  {
    id: 2,
    type: "reading",
    skill: "Supporting Details",
    question: `${d6Passage1}

Which detail shows Miss Pearl used evidence to persuade neighbours?`,
    options: [
      "She posted a list of simple habits on the community board for everyone to read.",
      "She reminded everyone that water was a precious resource that should not be wasted.",
      "She showed neighbours how to fix leaks at once so they would not lose water.",
      "She measured a dripping tap's daily loss and posted the figure."
    ],
    correctAnswer: 3,
    explanation: "Measuring and posting a specific figure provides concrete data, which distinguishes it from general advice or reminders."
  },
  {
    id: 3,
    type: "reading",
    skill: "Inference",
    question: `${d6Passage1}

Why did more families join Miss Pearl over time?`,
    options: [
      "They were ordered by the village council to attend her meetings.",
      "They wanted to compete to see who could save the most water.",
      "They saw that her methods actually saved water without making life harder.",
      "They realised the standpipe would soon stop working entirely."
    ],
    correctAnswer: 2,
    explanation: "The passage states that as drums filled and gardens stayed green, more families joined, implying the visible results persuaded them."
  },
  {
    id: 4,
    type: "reading",
    skill: "Main Idea",
    question: `${d6Passage1}

What is the main idea of the passage?`,
    options: [
      "Simple, thoughtful habits can help a community protect a scarce resource.",
      "Building water drums is the only reliable way to survive a long drought.",
      "Retired teachers are often better at solving village problems than younger people.",
      "Villages should rely entirely on rainwater instead of waiting for standpipes."
    ],
    correctAnswer: 0,
    explanation: "The passage centres on how adopting simple, careful habits allowed the village to conserve water effectively."
  },
  {
    id: 5,
    type: "reading",
    skill: "Vocabulary in Context",
    question: `${d6Passage1}

In the passage, what does "conserving" most nearly mean?`,
    options: [
      "keeping it hidden so others cannot find it",
      "using it carefully to avoid waste",
      "adding fresh water to it to make it last longer",
      "sharing it equally among all the neighbours"
    ],
    correctAnswer: 1,
    explanation: "Miss Pearl clarifies that conserving is not about going without, but about using the resource with care to avoid waste."
  },
  {
    id: 6,
    type: "reading",
    skill: "Author's Purpose",
    question: `${d6Passage1}

Why does the author include Miss Pearl's final reminder?`,
    options: [
      "To encourage families to stop using water for their gardens.",
      "To explain the exact steps for building a rainwater drum.",
      "To show that Miss Pearl was unhappy with the community's effort.",
      "To correct the idea that saving water means going without it."
    ],
    correctAnswer: 3,
    explanation: "The reminder specifically addresses the misconception that saving water means going without, serving to clarify the concept."
  },
  {
    id: 7,
    type: "reading",
    skill: "Drawing Conclusions",
    question: `${d6Passage1}

What can you conclude about the families who fixed their leaks?`,
    options: [
      "They probably spent more money on their water bills.",
      "They found that fixing leaks was too difficult to maintain.",
      "They put Miss Pearl's advice about careful use into practice.",
      "They stopped needing to collect water from the standpipe."
    ],
    correctAnswer: 2,
    explanation: "Since fixing leaks prevents water loss, the logical conclusion is that these families retained more of the water they collected."
  },
  {
    id: 8,
    type: "reading",
    skill: "Point of View",
    question: `${d6Passage2}

How does Mr. Dawes view the fish near the shore?`,
    options: [
      "As a shared resource that requires group agreement to survive.",
      "As a private source of income that should not have any rules.",
      "As a temporary problem that will fix itself when the season changes.",
      "As a burden that the elder fishers should manage on their own."
    ],
    correctAnswer: 0,
    explanation: "Mr. Dawes explicitly states that the resource belongs to no single person and can only last when managed together."
  },
  {
    id: 9,
    type: "reading",
    skill: "Cause and Effect",
    question: `${d6Passage2}

What was the effect of the community following Mr. Dawes's rules?`,
    options: [
      "A few fishers decided to leave Blue Harbour permanently.",
      "The fish population grew because they were given time to recover.",
      "The community stopped keeping records of their daily catch.",
      "The young fish were forced to move to deeper waters."
    ],
    correctAnswer: 1,
    explanation: "The text directly states that within two seasons, the fish returned in greater numbers as a result of the rules."
  },
  {
    id: 10,
    type: "reading",
    skill: "Supporting Details",
    question: `${d6Passage2}

Which rule did Mr. Dawes propose?`,
    options: [
      "Catching fish only during the hottest months of the year.",
      "Dividing the harbour into equal sections for each family.",
      "Selling the daily catch to buyers outside the community.",
      "Leaving the young fish alone to grow before catching them."
    ],
    correctAnswer: 3,
    explanation: "Leaving young fish to grow was one of the specific rules Mr. Dawes proposed to help the fish population recover."
  },
  {
    id: 11,
    type: "reading",
    skill: "Theme",
    question: `${d6Passage2}

Which theme is best developed in the passage?`,
    options: [
      "Individual success is much more important than group agreement.",
      "Following rules usually leads to financial loss for everyone involved.",
      "Working together to protect shared resources helps everyone in the long run.",
      "Elders are usually too old to understand modern fishing methods."
    ],
    correctAnswer: 2,
    explanation: "Mr. Dawes's closing words about balancing today's needs against tomorrow's survival directly state this theme."
  },
  {
    id: 12,
    type: "reading",
    skill: "Compare and Contrast",
    question: `${d6Passage1}

${d6Passage2}

How are Miss Pearl and Mr. Dawes alike?`,
    options: [
      "Both proved their ideas worked by letting others see the positive results.",
      "Both held official government positions in their local communities.",
      "Both started their campaigns by openly blaming their neighbours.",
      "Both believed that giving strict punishments was the best way."
    ],
    correctAnswer: 0,
    explanation: "Miss Pearl's full drums and green gardens, like Mr. Dawes's returning fish, served as visible proof that convinced others to join their efforts."
  },
  {
    id: 13,
    type: "reading",
    skill: "Prediction",
    question: `${d6Passage2}

If another resource became scarce, what would Mr. Dawes most likely suggest?`,
    options: [
      "He would suggest that each family hide its supply from the others.",
      "He would recommend setting shared rules and tracking the results.",
      "He would ask the government to send replacement supplies immediately.",
      "He would advise the community to use as much as possible before it runs out."
    ],
    correctAnswer: 1,
    explanation: "Based on his successful strategy with the fishery, Mr. Dawes would logically apply the same methods of shared rules and record-keeping."
  },
  {
    id: 14,
    type: "reading",
    skill: "Text Evidence",
    question: `${d6Passage2}

Which sentence best supports the idea that the rules helped everyone?`,
    options: [
      "At first, some fishers blamed each other for the shortage of fish.",
      "A few fishers argued that the new rules would cost them money.",
      "Mr. Dawes explained that a shared resource belongs to no single person.",
      "Within two seasons the fish returned in greater numbers, and every family benefited."
    ],
    correctAnswer: 3,
    explanation: "This sentence provides direct evidence that the rules resulted in a positive outcome for the entire community."
  },
  {
    id: 15,
    type: "reading",
    skill: "Inference",
    question: `${d6Passage2}

Why did a few fishers argue against the rules at first?`,
    options: [
      "They thought the rules would make the fish move to a different harbour.",
      "They did not trust Mr. Dawes to keep accurate records of the catch.",
      "They were afraid that catching less fish right away would leave them with less money.",
      "They simply wanted to continue blaming other fishers for the shortage."
    ],
    correctAnswer: 2,
    explanation: "The passage notes that some fishers argued the rules would cost them money in the short term, implying fear of immediate financial loss."
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Antonym",
    question: "The fish became \"scarce.\" Which word means the OPPOSITE of \"scarce\"?",
    options: ["abundant", "rare", "meagre", "insufficient"],
    correctAnswer: 0,
    explanation: "Scarce means in short supply; its opposite is abundant, meaning more than enough."
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonym",
    question: "Which word is the closest synonym for \"precious\" in \"a precious resource\"?",
    options: ["ordinary", "valuable", "harmful", "abundant"],
    correctAnswer: 1,
    explanation: "Precious means highly valued or important, making 'valuable' the closest synonym."
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Prefix",
    question: "The word \"reuse\" begins with \"re-,\" meaning \"again.\" To reuse dishwater is to —",
    options: ["throw it away after one use", "pour it down the drain quickly", "mix it with fresh water before using", "use it a second time for a different purpose"],
    correctAnswer: 3,
    explanation: "The prefix 're-' indicates repetition, so reusing water means using it again rather than discarding it."
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Suffix",
    question: "Add the suffix \"-ation\" to \"conserve\" to form a noun. The correct spelling is —",
    options: ["conserveation", "conservement", "conservation", "conservity"],
    correctAnswer: 2,
    explanation: "When adding '-ation' to 'conserve', the 'e' is dropped to form the correctly spelled noun 'conservation'."
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Context Clues",
    question: "\"Resting certain areas for part of the year\" let the fish recover. Here \"resting\" most nearly means —",
    options: ["leaving them alone so they can recover", "planting new fish in them immediately", "dividing them equally among the fishers", "closing them permanently to all boats"],
    correctAnswer: 0,
    explanation: "The context clue 'let the fish recover' shows that resting means leaving the areas alone temporarily."
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: "Which sentence uses \"run\" in the same way as \"letting taps run\"?",
    options: [
      "The young athlete will run the final race on Friday.",
      "We should not let the water run while we wash the dishes.",
      "He plans to run a small business in the town.",
      "The local train does not run on public holidays."
    ],
    correctAnswer: 1,
    explanation: "In both the passage and the correct option, 'run' means to flow continuously, unlike running a race or a business."
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Word Relationships",
    question: "Drought is to water as famine is to —",
    options: ["soil", "medicine", "shelter", "food"],
    correctAnswer: 3,
    explanation: "A drought is a severe shortage of water; a famine is a severe shortage of food."
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Replacing a Word",
    question: "Which word could best replace \"manages\" in \"a community manages it together\"?",
    options: ["exhausts", "abandons", "supervises", "conceals"],
    correctAnswer: 2,
    explanation: "To manage a resource is to supervise or look after it carefully, which matches the context of the passage."
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Academic Vocabulary",
    question: "Which meaning best fits the academic word \"resource\"?",
    options: [
      "a supply of materials that can be drawn upon",
      "an argument that is used to settle a dispute",
      "a careful plan developed by a group of leaders",
      "a strict punishment given for breaking a rule"
    ],
    correctAnswer: 0,
    explanation: "In the context of water and fish, a resource is a stock or supply of materials that can be drawn on when needed."
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Choosing the Best Word",
    question: "Choose the best word: \"To protect the fish, the community had to _____ today's needs against tomorrow's survival.\"",
    options: ["dismiss", "weigh", "multiply", "separate"],
    correctAnswer: 1,
    explanation: "To 'weigh' one thing against another means to carefully compare their importance, which fits the context of balancing needs."
  },
  {
    id: 26,
    type: "grammar",
    skill: "Run-on Correction",
    question: "Which choice corrects the run-on sentence?",
    options: [
      "The taps leaked Miss Pearl showing families how to fix them.",
      "Because the taps leaked, therefore Miss Pearl showed families how to fix them.",
      "The taps leaked, Miss Pearl showed families how to fix them.",
      "The taps leaked, so Miss Pearl showed families how to fix them."
    ],
    correctAnswer: 3,
    explanation: "Using a comma and the coordinating conjunction 'so' correctly joins two independent clauses without creating a run-on."
  },
  {
    id: 27,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Which sentence is written correctly?",
    options: [
      "The community of fishers share the same harbour.",
      "The community of fishers have shared the same harbour.",
      "The community of fishers shares the same harbour.",
      "The community of fishers has sharing the same harbour."
    ],
    correctAnswer: 2,
    explanation: "The subject 'community' is singular, so it requires the singular verb 'shares', regardless of the plural phrase in between."
  },
  {
    id: 28,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence keeps the tense consistent?",
    options: [
      "Miss Pearl measured the leak and posted the figure.",
      "Miss Pearl had measured the leak and posts the figure.",
      "Miss Pearl measured the leak and has posting the figure.",
      "Miss Pearl measures the leak and had posted the figure."
    ],
    correctAnswer: 0,
    explanation: "Both verbs are in the simple past tense, ensuring the sentence remains consistent in its timeline."
  },
  {
    id: 29,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "Mr. Dawes asked the fishers and we to follow the rules.",
      "Mr. Dawes asked the fishers and us to follow the rules.",
      "Mr. Dawes asked the fishers and they to follow the rules.",
      "Mr. Dawes asked the fishers and ourselves to follow the rules."
    ],
    correctAnswer: 1,
    explanation: "The pronoun follows the action verb 'asked' and acts as an object, making the object pronoun 'us' the correct choice."
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence is punctuated correctly?",
    options: [
      "During the drought the standpipe, ran only twice a week.",
      "During the drought, the standpipe, ran only twice a week.",
      "During, the drought the standpipe ran only twice a week.",
      "During the drought, the standpipe ran only twice a week."
    ],
    correctAnswer: 3,
    explanation: "A comma should follow the introductory prepositional phrase 'During the drought' to separate it from the main clause."
  },
  {
    id: 31,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence uses quotation marks correctly?",
    options: [
      "\"A shared resource belongs to no single person Mr. Dawes said.\"",
      "A shared resource belongs to no single person,\" Mr. Dawes said.",
      "\"A shared resource belongs to no single person,\" Mr. Dawes said.",
      "\"A shared resource belongs to no single person\" Mr. Dawes said."
    ],
    correctAnswer: 2,
    explanation: "The spoken words are fully enclosed in quotation marks, with the comma correctly placed inside the closing quotation mark."
  },
  {
    id: 32,
    type: "grammar",
    skill: "Parallel Structure",
    question: "Which sentence uses parallel structure?",
    options: [
      "They caught rainwater, reused dishwater, and fixed leaks.",
      "They caught rainwater, reusing dishwater, and fixed leaks.",
      "They caught rainwater, reused dishwater, and the fixing of leaks.",
      "To catch rainwater, reusing dishwater, and fixing leaks."
    ],
    correctAnswer: 0,
    explanation: "The three items in the list follow the exact same grammatical pattern: past tense verb + direct object."
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Combining",
    question: "Which choice best combines the two sentences?",
    options: [
      "The fish were scarce, the community agreed on new rules.",
      "Because the fish were scarce, the community agreed on new rules.",
      "The fish were scarce, and agreeing on new rules.",
      "Since the fish were scarce, therefore the community agreed on new rules."
    ],
    correctAnswer: 1,
    explanation: "Using 'Because' clearly establishes the cause-and-effect relationship between the two ideas in one grammatically correct sentence."
  },
  {
    id: 34,
    type: "grammar",
    skill: "Transitions",
    question: "Which transition best completes the sentence? \"The rules cost money at first; _____, the fish soon returned.\"",
    options: ["therefore", "for example", "next", "however"],
    correctAnswer: 3,
    explanation: "'However' is used to show a contrast between the initial negative cost and the eventual positive outcome."
  },
  {
    id: 35,
    type: "grammar",
    skill: "Word Choice",
    question: "Which word choice is most precise? \"Miss Pearl _____ how much water a dripping tap lost.\"",
    options: ["guessed", "noticed", "measured", "imagined"],
    correctAnswer: 2,
    explanation: "'Measured' implies using a tool to find an exact amount, which is much more precise than guessing or noticing."
  },
  {
    id: 36,
    type: "writing",
    skill: "Best Introduction",
    question: "Which sentence is the best introduction for an essay about protecting shared resources?",
    options: [
      "When communities face shortages, working together to manage shared resources can ensure survival for everyone.",
      "Water and fish are just two of the important things that people use in their daily lives.",
      "This essay is going to talk about two different places and explain exactly what happened there.",
      "There are many small villages and busy harbours located all across the country."
    ],
    correctAnswer: 0,
    explanation: "A strong introduction clearly states the essay's main idea or thesis, which the first option does effectively."
  },
  {
    id: 37,
    type: "writing",
    skill: "Strongest Supporting Detail",
    question: "Which detail best supports the claim that managing the fishery worked?",
    options: [
      "At first, some fishers blamed each other before the new rules were introduced.",
      "Within two seasons, the fish returned in greater numbers, proving the plan worked.",
      "Mr. Dawes was highly respected as an elder in the Blue Harbour community.",
      "A few fishers initially worried that the new rules would end up costing them money."
    ],
    correctAnswer: 1,
    explanation: "Providing the concrete result of the plan directly supports the claim that the management strategy was successful."
  },
  {
    id: 38,
    type: "writing",
    skill: "Best Transition",
    question: "\"Few families listened at first. _____ many joined as the drums filled.\" Which transition fits best?",
    options: ["However,", "In contrast,", "For instance,", "Gradually,"],
    correctAnswer: 3,
    explanation: "'Gradually' indicates a slow change over time, which perfectly matches the shift from few families listening to many joining."
  },
  {
    id: 39,
    type: "writing",
    skill: "Sentence to Remove",
    question: "These sentences appear in a report about water conservation. Which should be REMOVED?",
    options: [
      "She measured how much water a dripping tap wastes in a single day.",
      "Many families began catching rainwater in clean drums behind their homes.",
      "Miss Pearl also enjoys baking cakes for the village fair on Saturdays.",
      "Reusing dishwater helped keep the kitchen gardens green during the dry weeks."
    ],
    correctAnswer: 2,
    explanation: "Baking cakes is unrelated to the topic of water conservation and breaks the focus of the paragraph."
  },
  {
    id: 40,
    type: "writing",
    skill: "Best Conclusion",
    question: "Which sentence is the best conclusion for an essay about these two communities?",
    options: [
      "Ultimately, both communities clearly show that protecting shared resources requires close cooperation and careful planning.",
      "In conclusion, both water and fish are two very important things for people to have.",
      "To end this essay, Miss Pearl and Mr. Dawes were very good leaders in their towns.",
      "As you can clearly see, the drums filled up and the fish came back to the harbour."
    ],
    correctAnswer: 0,
    explanation: "A strong conclusion synthesizes the main points into a broader takeaway, which the first option accomplishes."
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

export default function G5LaDifficult6MockTest() {
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
    ? g5LaDifficult6Questions
    : g5LaDifficult6Questions.slice(0, FREE_QUESTION_LIMIT);
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
      testName: "Difficult 6",
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
                Language Arts Difficult 6
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
              <p className="text-slate-600">Language Arts Difficult 6</p>
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
              <h1 className="text-lg font-bold">Language Arts Difficult 6</h1>
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
