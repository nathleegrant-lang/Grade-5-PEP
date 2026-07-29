"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle,
  BookOpen, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "reading" | "vocabulary" | "grammar" | "writing"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const P1 = "For years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out."

const g5LaMix6Questions: Question[] = [
  {
    id: 1,
    type: "reading",
    skill: "Main Idea",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhat is the passage mainly about?",
    options: [
      "How a community transformed an unused bus into a travelling library",
      "Why Bellview residents stopped reading books",
      "How to repair the roof of a community centre",
      "Why tablets should replace printed books"
    ],
    correctAnswer: 0,
    explanation: "The passage focuses on the planning, challenges, and success of the Bellview Book Bus."
  },
  {
    id: 2,
    type: "reading",
    skill: "Problem and Solution",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhat problem first encouraged Mrs. Campbell to suggest the Book Bus?",
    options: [
      "The community had too many buses.",
      "The library was crowded, leaking, and difficult for some children to reach.",
      "The artists refused to paint the library.",
      "Adults wanted to close the community centre."
    ],
    correctAnswer: 1,
    explanation: "The existing library had limited space, a leaking roof, and was hard for hill residents to access."
  },
  {
    id: 3,
    type: "reading",
    skill: "Detail",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhat was the purpose of the solar panel?",
    options: [
      "To make the bus travel faster",
      "To keep the books dry",
      "To power lights and two tablets",
      "To signal when the bus arrived"
    ],
    correctAnswer: 2,
    explanation: "The passage states that the solar panel would power lights and two tablets."
  },
  {
    id: 4,
    type: "reading",
    skill: "Inference",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhy did Mrs. Campbell present a careful plan?",
    options: [
      "She wanted to hide the cost of the project.",
      "She did not trust the residents.",
      "She planned to sell the bus later.",
      "She needed others to see that the ambitious idea could work."
    ],
    correctAnswer: 3,
    explanation: "A detailed plan would help the community understand and support a difficult project."
  },
  {
    id: 5,
    type: "reading",
    skill: "Sequence",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhich event happened first?",
    options: [
      "Mrs. Campbell proposed converting an unused minibus.",
      "Children borrowed books from the bus.",
      "A shopkeeper stored reserved books.",
      "Library membership doubled."
    ],
    correctAnswer: 0,
    explanation: "The proposal came before fundraising, launch, adaptations, and the rise in membership."
  },
  {
    id: 6,
    type: "reading",
    skill: "Cause and Effect",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhy did volunteers sort the donated books?",
    options: [
      "They wanted to count every page.",
      "Some books were damaged or unsuitable for the children’s reading levels.",
      "The bus had no shelves.",
      "The mechanic asked them to remove all books."
    ],
    correctAnswer: 1,
    explanation: "Sorting ensured that only useful and appropriate books were placed on the bus."
  },
  {
    id: 7,
    type: "reading",
    skill: "Author's Purpose",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhy does the author mention adults using the Book Bus?",
    options: [
      "To show that adults borrowed more books than children",
      "To explain why children were turned away",
      "To show that the service met several community needs",
      "To prove that adults cannot use technology"
    ],
    correctAnswer: 2,
    explanation: "The detail shows that the bus supported learning, employment needs, and access to online services."
  },
  {
    id: 8,
    type: "reading",
    skill: "Problem Solving",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nHow did the organisers respond when the Cedar Hill road became unsafe?",
    options: [
      "They sold the bus.",
      "They stopped serving all four communities.",
      "They waited until the next school year.",
      "They changed the schedule and created a safer collection point."
    ],
    correctAnswer: 3,
    explanation: "They adapted the service instead of abandoning the community."
  },
  {
    id: 9,
    type: "reading",
    skill: "Vocabulary in Context",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nIn the second paragraph, what does “ambitious” most nearly mean?",
    options: [
      "Difficult but worth attempting",
      "Quiet and ordinary",
      "Careless and confusing",
      "Already completed"
    ],
    correctAnswer: 0,
    explanation: "The project required effort and planning, so “ambitious” means challenging but worthwhile."
  },
  {
    id: 10,
    type: "reading",
    skill: "Character Trait",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhich word best describes Mrs. Campbell?",
    options: [
      "Impatient",
      "Resourceful",
      "Secretive",
      "Unreliable"
    ],
    correctAnswer: 1,
    explanation: "She found a practical new use for an available bus instead of simply waiting for a new building."
  },
  {
    id: 11,
    type: "reading",
    skill: "Evidence",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhich detail best shows that the community cooperated?",
    options: [
      "The roof leaked during rain.",
      "The road to Cedar Hill was narrow.",
      "Different people offered skills, money, books, and time.",
      "The bus visited four communities."
    ],
    correctAnswer: 2,
    explanation: "The mechanic, artists, students, association, librarian, and shopkeeper all contributed."
  },
  {
    id: 12,
    type: "reading",
    skill: "Theme",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhich lesson is best supported by the passage?",
    options: [
      "Old buildings should always be abandoned.",
      "Technology is more valuable than books.",
      "Only trained workers can improve a community.",
      "Creative cooperation can help people overcome limited resources."
    ],
    correctAnswer: 3,
    explanation: "The Book Bus succeeded because people combined ideas, skills, and existing resources."
  },
  {
    id: 13,
    type: "reading",
    skill: "Text Structure",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nHow is most of the passage organised?",
    options: [
      "It presents a problem, describes a solution, and explains the results.",
      "It compares two famous libraries.",
      "It gives instructions in numbered steps.",
      "It lists unrelated facts about buses."
    ],
    correctAnswer: 0,
    explanation: "The passage moves from access problems to the Book Bus solution, its challenges, and its outcomes."
  },
  {
    id: 14,
    type: "reading",
    skill: "Reference",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nIn the final paragraph, what does “it” refer to in “it had shown what a community could accomplish”?",
    options: [
      "The school year",
      "The Book Bus project",
      "The permanent library",
      "The leaking roof"
    ],
    correctAnswer: 1,
    explanation: "The pronoun refers to the Book Bus project."
  },
  {
    id: 15,
    type: "reading",
    skill: "Conclusion",
    question: "Read the passage then answer the question.\n\nFor years, residents of Bellview depended on a small library housed in two rooms beside the community centre. The shelves were crowded, and many children who lived in the surrounding hills could not visit regularly because transportation was costly. When the library’s roof began leaking, some residents feared that the service would close altogether.\n\nMrs. Campbell, the librarian, proposed a different solution. Instead of waiting until a new building could be funded, she suggested converting an unused minibus into a travelling library. The idea sounded ambitious, but she presented a careful plan. The bus would visit four communities each week, carry books for different age groups, and include a small solar panel to power lights and two tablets.\n\nThe citizens’ association agreed to lead a fundraising drive. A mechanic offered to inspect the bus, local artists volunteered to paint it, and secondary-school students collected gently used books. Not every donation was useful. Some books were badly damaged or far beyond the reading level of the children, so volunteers sorted each item before placing it on the shelves.\n\nAfter three months of work, the Bellview Book Bus made its first journey. At the first stop, children lined up before the doors opened. They borrowed storybooks, used the tablets to research homework, and listened as Mrs. Campbell read aloud. Adults also came to complete online forms and ask for help writing job applications.\n\nThe project soon faced a problem. During heavy rain, the narrow road to Cedar Hill became unsafe. Rather than cancel the service permanently, the organisers changed the schedule and arranged a collection point at the foot of the hill. A shopkeeper kept a locked box where reserved books could be collected and returned.\n\nBy the end of the school year, library membership had more than doubled. The Book Bus had not replaced the need for a permanent library, but it had shown what a community could accomplish by using the resources already available. More importantly, it brought books, technology, and practical assistance closer to people who had previously been left out.\n\nWhich conclusion can be drawn from the passage?",
    options: [
      "The Book Bus solved every library problem permanently.",
      "The bus was useful only during good weather.",
      "Flexible planning helped the service continue when difficulties arose.",
      "The community no longer needed a permanent library."
    ],
    correctAnswer: 2,
    explanation: "The organisers adjusted the schedule and collection method when the road became unsafe."
  },
  {
    id: 16,
    type: "vocabulary",
    skill: "Meaning in Context",
    question: "The volunteers examined the books carefully before adding them to the shelves. What does “examined” mean?",
    options: [
      "Ignored",
      "Purchased",
      "Decorated",
      "Inspected closely"
    ],
    correctAnswer: 3,
    explanation: "To examine something is to inspect it carefully."
  },
  {
    id: 17,
    type: "vocabulary",
    skill: "Synonym",
    question: "Which word is closest in meaning to “assist”?",
    options: [
      "Help",
      "Delay",
      "Hide",
      "Refuse"
    ],
    correctAnswer: 0,
    explanation: "Assist means help."
  },
  {
    id: 18,
    type: "vocabulary",
    skill: "Antonym",
    question: "Which word is the opposite of “permanent”?",
    options: [
      "Reliable",
      "Temporary",
      "Expensive",
      "Useful"
    ],
    correctAnswer: 1,
    explanation: "Permanent means lasting; temporary means not lasting."
  },
  {
    id: 19,
    type: "vocabulary",
    skill: "Prefix",
    question: "What does the prefix “re-” mean in the word “repaint”?",
    options: [
      "Without",
      "Against",
      "Again",
      "Before"
    ],
    correctAnswer: 2,
    explanation: "The prefix re- means again."
  },
  {
    id: 20,
    type: "vocabulary",
    skill: "Suffix",
    question: "Which word means “a person who teaches”?",
    options: [
      "Teaching",
      "Teachable",
      "Taught",
      "Teacher"
    ],
    correctAnswer: 3,
    explanation: "The suffix -er can identify a person who performs an action."
  },
  {
    id: 21,
    type: "vocabulary",
    skill: "Multiple Meaning",
    question: "In which sentence does “light” mean not heavy?",
    options: [
      "The light suitcase was easy to lift.",
      "Please turn on the light.",
      "Morning light entered the room.",
      "The candle gave a soft light."
    ],
    correctAnswer: 0,
    explanation: "Here, light describes low weight."
  },
  {
    id: 22,
    type: "vocabulary",
    skill: "Homophone",
    question: "Choose the correct word: The children returned ___ books on Friday.",
    options: [
      "there",
      "their",
      "they're",
      "thier"
    ],
    correctAnswer: 1,
    explanation: "Their shows ownership."
  },
  {
    id: 23,
    type: "vocabulary",
    skill: "Context Clue",
    question: "The road was hazardous, so the driver avoided it during the storm. What does “hazardous” mean?",
    options: [
      "Popular",
      "Narrow",
      "Dangerous",
      "Distant"
    ],
    correctAnswer: 2,
    explanation: "The decision to avoid the road during a storm shows it was dangerous."
  },
  {
    id: 24,
    type: "vocabulary",
    skill: "Word Relationship",
    question: "Book is to read as music is to ___ .",
    options: [
      "draw",
      "write",
      "count",
      "listen"
    ],
    correctAnswer: 3,
    explanation: "Books are read; music is listened to."
  },
  {
    id: 25,
    type: "vocabulary",
    skill: "Precise Word",
    question: "Which word best completes the sentence? The mechanic made a ___ inspection of the bus before approving it.",
    options: [
      "thorough",
      "tiny",
      "sleepy",
      "accidental"
    ],
    correctAnswer: 0,
    explanation: "A thorough inspection is complete and careful."
  },
  {
    id: 26,
    type: "grammar",
    skill: "Subject-Verb Agreement",
    question: "Choose the sentence with correct subject-verb agreement.",
    options: [
      "The volunteers sorts the books.",
      "The librarian visits four communities each week.",
      "The children enjoys the story.",
      "The tablets needs charging."
    ],
    correctAnswer: 1,
    explanation: "The singular subject “librarian” correctly takes “visits.”"
  },
  {
    id: 27,
    type: "grammar",
    skill: "Verb Tense",
    question: "Which sentence is written in the past tense?",
    options: [
      "The bus visits Cedar Hill.",
      "The children will borrow books.",
      "The artists painted the bus.",
      "Mrs. Campbell reads aloud."
    ],
    correctAnswer: 2,
    explanation: "Painted is a past-tense verb."
  },
  {
    id: 28,
    type: "grammar",
    skill: "Pronouns",
    question: "Choose the correct pronoun: Mrs. Campbell and Mr. Brown said that ___ would organise the books.",
    options: [
      "her",
      "him",
      "us",
      "they"
    ],
    correctAnswer: 3,
    explanation: "They correctly refers to two people."
  },
  {
    id: 29,
    type: "grammar",
    skill: "Capitalisation",
    question: "Which sentence is capitalised correctly?",
    options: [
      "The Bellview Book Bus visited Cedar Hill on Monday.",
      "The bellview book bus visited cedar hill on Monday.",
      "The Bellview book bus visited Cedar hill on monday.",
      "The bellview Book Bus visited Cedar Hill on monday."
    ],
    correctAnswer: 0,
    explanation: "Proper names and days of the week require capital letters."
  },
  {
    id: 30,
    type: "grammar",
    skill: "Punctuation",
    question: "Which sentence uses the apostrophe correctly?",
    options: [
      "The childrens books were arranged by level.",
      "The children's books were arranged by level.",
      "The childrens' book's were arranged by level.",
      "The childrens book's were arranged by level."
    ],
    correctAnswer: 1,
    explanation: "Children is already plural, so the possessive form is children’s."
  },
  {
    id: 31,
    type: "grammar",
    skill: "Conjunctions",
    question: "Choose the best conjunction: The road was unsafe, ___ the organisers changed the schedule.",
    options: [
      "although",
      "unless",
      "so",
      "while"
    ],
    correctAnswer: 2,
    explanation: "So correctly shows the result of the unsafe road."
  },
  {
    id: 32,
    type: "grammar",
    skill: "Adjectives and Adverbs",
    question: "Which sentence uses the adverb correctly?",
    options: [
      "The bus made a safely journey.",
      "The careful driver drove the bus cautious.",
      "The children were quietly and patient.",
      "The driver moved carefully along the narrow road."
    ],
    correctAnswer: 3,
    explanation: "Carefully correctly describes how the driver moved."
  },
  {
    id: 33,
    type: "grammar",
    skill: "Sentence Type",
    question: "Which is a compound sentence?",
    options: [
      "The bus arrived, and the children formed a line.",
      "Because the bus arrived.",
      "The brightly painted bus.",
      "Waiting beside the community centre."
    ],
    correctAnswer: 0,
    explanation: "It contains two independent clauses joined by “and.”"
  },
  {
    id: 34,
    type: "grammar",
    skill: "Quotation Marks",
    question: "Which sentence is punctuated correctly?",
    options: [
      "Mrs. Campbell said \"Please return the books on Friday\".",
      "Mrs. Campbell said, \"Please return the books on Friday.\"",
      "Mrs. Campbell said \"Please return the books on Friday.\"",
      "Mrs. Campbell said, Please return the books on Friday."
    ],
    correctAnswer: 1,
    explanation: "A comma introduces the quotation, and the period goes inside the quotation marks."
  },
  {
    id: 35,
    type: "grammar",
    skill: "Complete Sentence",
    question: "Which group of words is a complete sentence?",
    options: [
      "After the heavy rain.",
      "Travelling through four communities.",
      "The shopkeeper stored the reserved books safely.",
      "Because the road was narrow."
    ],
    correctAnswer: 2,
    explanation: "It has a subject and a complete predicate."
  },
  {
    id: 36,
    type: "writing",
    skill: "Topic Sentence",
    question: "Which is the best topic sentence for a paragraph about the benefits of a mobile library?",
    options: [
      "The bus is blue and yellow.",
      "Some roads are narrow.",
      "Books have many pages.",
      "A mobile library can bring learning resources closer to people who live far away."
    ],
    correctAnswer: 3,
    explanation: "It clearly introduces the paragraph’s main idea."
  },
  {
    id: 37,
    type: "writing",
    skill: "Supporting Detail",
    question: "Which detail best supports the topic sentence “The Book Bus served people of different ages”?",
    options: [
      "Children borrowed stories while adults received help with forms and job applications.",
      "The bus had four tyres.",
      "The library roof leaked.",
      "The artists used bright paint."
    ],
    correctAnswer: 0,
    explanation: "The detail directly shows services for both children and adults."
  },
  {
    id: 38,
    type: "writing",
    skill: "Sequence Words",
    question: "Which sentence uses sequence words most effectively?",
    options: [
      "The volunteers worked and worked.",
      "First they sorted the books; next they labelled the shelves; finally they loaded the bus.",
      "The bus was useful because it was useful.",
      "Books, tablets, lights, and roads."
    ],
    correctAnswer: 1,
    explanation: "The sequence words clearly order the actions."
  },
  {
    id: 39,
    type: "writing",
    skill: "Concluding Sentence",
    question: "Which is the best concluding sentence for a paragraph explaining how teamwork created the Book Bus?",
    options: [
      "The bus had windows.",
      "Some volunteers wore gloves.",
      "Together, the residents turned a difficult problem into a service that benefited the whole community.",
      "The road was wet."
    ],
    correctAnswer: 2,
    explanation: "It sums up the main point and gives closure."
  },
  {
    id: 40,
    type: "writing",
    skill: "Revision",
    question: "Which revision makes the sentence most precise? Original: “The people did things to help the bus.”",
    options: [
      "The people were there.",
      "The bus got help.",
      "Many things happened.",
      "Residents raised funds, repaired the bus, painted it, and donated suitable books."
    ],
    correctAnswer: 3,
    explanation: "The revision replaces vague language with specific actions."
  }
]

export default function G5LaMix6MockTest() {
  const { isPremium, user } = useAuth()
  const sourceQuestions = isPremium ? g5LaMix6Questions : g5LaMix6Questions.slice(0, FREE_QUESTION_LIMIT)
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(sourceQuestions.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const hasSavedResult = useRef(false)

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const shuffleAnswerOptions = (questions: Question[]): Question[] => {
    return shuffleArray(questions).map((question) => {
      const optionPairs = question.options.map((option, index) => ({ option, isCorrect: index === question.correctAnswer }))
      const shuffledPairs = shuffleArray(optionPairs)
      return {
        ...question,
        options: shuffledPairs.map((pair) => pair.option),
        correctAnswer: shuffledPairs.findIndex((pair) => pair.isCorrect),
      }
    })
  }

  const availableQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : sourceQuestions
  const totalQuestions = availableQuestions.length

  const calculateScore = useCallback(() => {
    let score = 0
    availableQuestions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++ })
    return score
  }, [availableQuestions, answers])

  const scorePct = useCallback(() => Math.round((calculateScore() / totalQuestions) * 100), [calculateScore, totalQuestions])

  useEffect(() => {
    if (!started || showResults || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [started, showResults, timeLeft])

  useEffect(() => {
    if (started && timeLeft === 0 && !showResults) setShowResults(true)
  }, [started, timeLeft, showResults])

  useEffect(() => {
    if (!showResults || !user?.id || hasSavedResult.current) return
    hasSavedResult.current = true
    saveStudentTestResult({
      studentId: user.id,
      studentName: user.childName || "Student",
      subject: "Literacy",
      testName: "Mixed 6",
      score: calculateScore(),
      totalQuestions,
      percentage: scorePct(),
      completedAt: new Date().toISOString(),
      answers: availableQuestions.map((q, i) => ({
        questionId: q.id,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[i] === q.correctAnswer,
      })),
    }).catch(() => {
      hasSavedResult.current = false
    })
  }, [showResults, user?.id, user?.childName, totalQuestions, answers])

  const startTest = () => {
    const shuffledQuestions = shuffleAnswerOptions(sourceQuestions)
    setRandomizedQuestions(shuffledQuestions)
    setAnswers(new Array(shuffledQuestions.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setShowResults(false)
    hasSavedResult.current = false
    setStarted(true)
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

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
    setStarted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setRandomizedQuestions([])
    setAnswers(new Array(sourceQuestions.length).fill(null))
    setTimeLeft(60 * 60)
    hasSavedResult.current = false
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) =>
    t === "reading" ? "Reading Comprehension" : t === "vocabulary" ? "Vocabulary & Word Study"
    : t === "grammar" ? "Grammar & Language Use" : "Writing Skills"
  const secColor = (t: Question["type"]) =>
    t === "reading" ? "bg-blue-50 text-blue-700" : t === "vocabulary" ? "bg-purple-50 text-purple-700"
    : t === "grammar" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/language-arts"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Language Arts Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 text-center">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-blue-600" />
            <CardTitle className="text-2xl text-blue-800">Language Arts Mixed 6</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Language Arts · Mixed Level Practice</p>
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{sourceQuestions.length}</p><p className="text-sm text-slate-600">Questions</p></div>
              <div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
              <div className="rounded-lg bg-purple-50 p-4 text-center"><p className="text-2xl font-bold text-purple-700">4</p><p className="text-sm text-slate-600">Sections</p></div>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold text-slate-800">Test Sections</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>📖 Reading Comprehension — 15</p><p>🔤 Vocabulary & Word Study — 10</p>
                <p>✏️ Grammar & Language Use — 10</p><p>📝 Writing Skills — 5</p>
              </div>
            </div>
            <Button onClick={startTest} className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700">Start Mixed 6</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const grade = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl shadow-xl">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto mb-3 h-16 w-16 text-green-500" />
              <CardTitle className="text-3xl">Test Complete!</CardTitle>
              <p className="text-slate-600">Language Arts Mixed 6</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center"><p className="text-6xl font-bold text-blue-600">{scorePct()}%</p><p className={cn("mt-2 text-2xl font-semibold", grade.color)}>{grade.grade}</p><p className="text-slate-600">{calculateScore()} out of {totalQuestions} correct</p></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(["reading", "vocabulary", "grammar", "writing"] as Question["type"][]).map((t) => { const s = getSectionStats(t); return <div key={t} className="rounded-lg border p-4 text-center"><p className="font-semibold">{secLabel(t)}</p><p className="mt-2 text-2xl font-bold">{s.correct}/{s.total}</p><p className={cn("text-sm", s.ratingColor)}>{s.percentage}% · {s.rating}</p></div> })}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Review Your Answers</h3>
                {availableQuestions.map((question, index) => {
                  const correct = answers[index] === question.correctAnswer
                  return (
                    <div key={question.id} className={cn("rounded-lg border-l-4 p-4", correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")}>
                      <div className="flex gap-3">{correct ? <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" /> : <XCircle className="mt-0.5 h-5 w-5 text-red-600" />}<div className="flex-1"><p className="font-medium">Question {index + 1}: {question.question.split("\n\n").pop()}</p><p className="mt-2 text-sm">Your answer: {answers[index] !== null ? question.options[answers[index]!] : "Not answered"}</p>{!correct && <p className="text-sm font-medium text-green-700">Correct answer: {question.options[question.correctAnswer]}</p>}<p className="mt-2 text-sm text-slate-600">{question.explanation}</p></div></div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetTest}><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print Results</Button>
                <Link href="/mock-tests/language-arts"><Button variant="outline"><Home className="mr-2 h-4 w-4" />More Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 bg-blue-700 text-white shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3"><BookOpen className="h-6 w-6" /><div><h1 className="text-lg font-bold">Language Arts Mixed 6</h1><p className="text-blue-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div></div>
          <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-lg", timeLeft < 300 ? "bg-red-500" : "bg-blue-800")}><Clock className="h-5 w-5" />{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
        </div>
        <Progress value={(answeredCount / totalQuestions) * 100} className="h-1 rounded-none" />
      </div>

      <main className="container mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_260px]">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3"><span className={cn("rounded-full px-3 py-1 text-xs font-semibold", secColor(q.type))}>{secLabel(q.type)} · {q.skill}</span><Button variant="ghost" size="sm" onClick={() => setFlaggedQuestions((prev) => { const next = new Set(prev); next.has(currentQuestion) ? next.delete(currentQuestion) : next.add(currentQuestion); return next })}><Flag className={cn("mr-2 h-4 w-4", flaggedQuestions.has(currentQuestion) && "fill-amber-400 text-amber-500")} />{flaggedQuestions.has(currentQuestion) ? "Flagged" : "Flag"}</Button></div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line text-base leading-7 text-slate-800">{q.question}</div>
            <div className="mt-6 space-y-3">
              {q.options.map((option, index) => (
                <button key={index} onClick={() => setAnswers((prev) => { const next = [...prev]; next[currentQuestion] = index; return next })} className={cn("flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition", answers[currentQuestion] === index ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300")}>
                  <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold", answers[currentQuestion] === index ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300")}>{String.fromCharCode(65 + index)}</span><span>{option}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((q) => q - 1)}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
              {currentQuestion < totalQuestions - 1 ? <Button onClick={() => setCurrentQuestion((q) => q + 1)}>Next<ChevronRight className="ml-2 h-4 w-4" /></Button> : <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Submit Test</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle className="text-base">Question Navigator</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {availableQuestions.map((_, index) => <button key={index} onClick={() => setCurrentQuestion(index)} className={cn("relative h-9 rounded-md border text-sm font-medium", currentQuestion === index ? "border-blue-600 bg-blue-600 text-white" : answers[index] !== null ? "border-green-300 bg-green-100 text-green-800" : "border-slate-200 bg-white", flaggedQuestions.has(index) && "ring-2 ring-amber-400")} >{index + 1}</button>)}
            </div>
            <div className="mt-5 space-y-2 text-xs text-slate-600"><p><span className="mr-2 inline-block h-3 w-3 rounded bg-green-100 ring-1 ring-green-300" />Answered</p><p><span className="mr-2 inline-block h-3 w-3 rounded bg-white ring-1 ring-slate-300" />Not answered</p><p><span className="mr-2 inline-block h-3 w-3 rounded bg-white ring-2 ring-amber-400" />Flagged</p></div>
            <Button onClick={handleSubmit} className="mt-6 w-full bg-green-600 hover:bg-green-700">Submit Test</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
