"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, TrendingUp } from "lucide-react"

interface SubjectProgress {
  subject: string
  topicsCompleted: number
  totalTopics: number
  quizzesTaken: number
  averageScore: number
  mockTestScore: number | null
}

const initialProgress: SubjectProgress[] = [
  { subject: "Language Arts", topicsCompleted: 0, totalTopics: 4, quizzesTaken: 0, averageScore: 0, mockTestScore: null },
  { subject: "Mathematics", topicsCompleted: 0, totalTopics: 4, quizzesTaken: 0, averageScore: 0, mockTestScore: null },
  { subject: "Science", topicsCompleted: 0, totalTopics: 4, quizzesTaken: 0, averageScore: 0, mockTestScore: null },
  { subject: "Social Studies", topicsCompleted: 0, totalTopics: 4, quizzesTaken: 0, averageScore: 0, mockTestScore: null },
]

export function ProgressTracker() {
  const [progress, setProgress] = useState<SubjectProgress[]>(initialProgress)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("grade5-pep-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
    
    const savedPoints = localStorage.getItem("grade5-pep-points")
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints))
    }
  }, [])

  const overallProgress = progress.reduce((acc, curr) => {
    return acc + (curr.topicsCompleted / curr.totalTopics) * 25
  }, 0)

  const totalQuizzes = progress.reduce((acc, curr) => acc + curr.quizzesTaken, 0)
  const averageAllScores = progress.filter(p => p.quizzesTaken > 0).length > 0
    ? progress.reduce((acc, curr) => acc + curr.averageScore, 0) / progress.filter(p => p.quizzesTaken > 0).length
    : 0

  const getLevel = (points: number) => {
    if (points >= 1000) return { level: "PEP Champion", color: "text-yellow-500" }
    if (points >= 500) return { level: "Star Learner", color: "text-purple-500" }
    if (points >= 200) return { level: "Rising Star", color: "text-blue-500" }
    if (points >= 50) return { level: "Explorer", color: "text-green-500" }
    return { level: "Beginner", color: "text-gray-500" }
  }

  const levelInfo = getLevel(totalPoints)

  return (
    <Card className="border-2 border-[#0d9488]">
      <CardHeader className="bg-gradient-to-r from-[#0d4a5f] to-[#0d9488] text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          My Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Level and Points */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ea580c] flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Level</p>
              <p className={`font-bold text-lg ${levelInfo.color}`}>{levelInfo.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Points</p>
            <p className="font-bold text-2xl text-[#f59e0b]">{totalPoints}</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-[#1e3a5f]">Overall Progress</span>
            <span className="text-[#0d9488] font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Target className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{totalQuizzes}</p>
            <p className="text-xs text-gray-600">Quizzes Taken</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{Math.round(averageAllScores)}%</p>
            <p className="text-xs text-gray-600">Avg Score</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold text-purple-600">
              {progress.filter(p => p.mockTestScore !== null && p.mockTestScore >= 60).length}
            </p>
            <p className="text-xs text-gray-600">Tests Passed</p>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[#1e3a5f]">Subject Progress</h4>
          {progress.map((subj) => (
            <div key={subj.subject} className="flex items-center gap-3">
              <div className="w-28 text-sm text-gray-600">{subj.subject}</div>
              <div className="flex-1">
                <Progress 
                  value={(subj.topicsCompleted / subj.totalTopics) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="w-12 text-right text-sm font-medium text-[#0d9488]">
                {subj.topicsCompleted}/{subj.totalTopics}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Utility functions to update progress (can be called from quiz/test components)
export function updateQuizProgress(subject: string, score: number) {
  if (typeof window === "undefined") return
  
  const savedProgress = localStorage.getItem("grade5-pep-progress")
  const progress: SubjectProgress[] = savedProgress ? JSON.parse(savedProgress) : initialProgress
  
  const subjectIndex = progress.findIndex(p => p.subject === subject)
  if (subjectIndex !== -1) {
    const current = progress[subjectIndex]
    const newQuizCount = current.quizzesTaken + 1
    const newAverage = ((current.averageScore * current.quizzesTaken) + score) / newQuizCount
    progress[subjectIndex] = {
      ...current,
      quizzesTaken: newQuizCount,
      averageScore: newAverage,
    }
    localStorage.setItem("grade5-pep-progress", JSON.stringify(progress))
  }
  
  // Add points
  const points = Math.round(score / 10)
  const currentPoints = parseInt(localStorage.getItem("grade5-pep-points") || "0")
  localStorage.setItem("grade5-pep-points", String(currentPoints + points))
}

export function updateTopicProgress(subject: string) {
  if (typeof window === "undefined") return
  
  const savedProgress = localStorage.getItem("grade5-pep-progress")
  const progress: SubjectProgress[] = savedProgress ? JSON.parse(savedProgress) : initialProgress
  
  const subjectIndex = progress.findIndex(p => p.subject === subject)
  if (subjectIndex !== -1 && progress[subjectIndex].topicsCompleted < progress[subjectIndex].totalTopics) {
    progress[subjectIndex].topicsCompleted += 1
    localStorage.setItem("grade5-pep-progress", JSON.stringify(progress))
  }
  
  // Add points for completing a topic
  const currentPoints = parseInt(localStorage.getItem("grade5-pep-points") || "0")
  localStorage.setItem("grade5-pep-points", String(currentPoints + 10))
}

export function updateMockTestScore(subject: string, score: number) {
  if (typeof window === "undefined") return
  
  const savedProgress = localStorage.getItem("grade5-pep-progress")
  const progress: SubjectProgress[] = savedProgress ? JSON.parse(savedProgress) : initialProgress
  
  const subjectIndex = progress.findIndex(p => p.subject === subject)
  if (subjectIndex !== -1) {
    progress[subjectIndex].mockTestScore = score
    localStorage.setItem("grade5-pep-progress", JSON.stringify(progress))
  }
  
  // Add bonus points for passing mock test
  if (score >= 60) {
    const currentPoints = parseInt(localStorage.getItem("grade5-pep-points") || "0")
    localStorage.setItem("grade5-pep-points", String(currentPoints + 50))
  }
}
