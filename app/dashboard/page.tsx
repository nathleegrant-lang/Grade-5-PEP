"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { 
  BookOpen, Calculator, Microscope, Globe, 
  Crown, Clock, Award, Target, TrendingUp,
  FileText, PenTool, ClipboardCheck
} from "lucide-react"

const subjects = [
  { name: "Language Arts", href: "/language-arts", icon: BookOpen, color: "bg-blue-500", progress: 65 },
  { name: "Mathematics", href: "/mathematics", icon: Calculator, color: "bg-amber-500", progress: 45 },
  { name: "Science", href: "/science", icon: Microscope, color: "bg-green-500", progress: 30 },
  { name: "Social Studies", href: "/social-studies", icon: Globe, color: "bg-purple-500", progress: 55 },
]

const quickActions = [
  { name: "Mock Exams", href: "/full-mock-exam", icon: ClipboardCheck, color: "bg-[#0d9488]" },
  { name: "Writing Practice", href: "/writing-practice", icon: PenTool, color: "bg-[#f59e0b]" },
  { name: "Worksheets", href: "/worksheets", icon: FileText, color: "bg-[#6366f1]" },
]

export default function DashboardPage() {
  const { user, isLoading, isPremium } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
              Welcome back, {user.childName}!
            </h1>
            <p className="text-gray-600">Ready to continue your PEP preparation?</p>
          </div>

          {/* Subscription Status */}
          {!isPremium && (
            <Card className="mb-8 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown className="w-10 h-10" />
                  <div>
                    <h3 className="text-xl font-bold">Upgrade to Premium</h3>
                    <p className="text-white/80">Get unlimited access to all features and mock exams</p>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="bg-white text-[#f59e0b] hover:bg-gray-100">
                    View Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isPremium && user.subscription && (
            <Card className="mb-8 bg-gradient-to-r from-[#0d9488] to-[#059669] text-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown className="w-10 h-10" />
                  <div>
                    <h3 className="text-xl font-bold">Premium Member</h3>
                    <p className="text-white/80">
                      Your {user.subscription.planId} subscription is active until{" "}
                      {new Date(user.subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">Full Access</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subject Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subjects.map((subject) => (
                    <Link key={subject.name} href={subject.href}>
                      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center`}>
                          <subject.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-[#1e3a5f]">{subject.name}</h3>
                            <span className="text-sm text-gray-500">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                      <Link key={action.name} href={action.href}>
                        <div className={`${action.color} text-white p-4 rounded-xl text-center hover:opacity-90 transition-opacity cursor-pointer`}>
                          <action.icon className="w-8 h-8 mx-auto mb-2" />
                          <p className="font-semibold">{action.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f]">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-[#1e3a5f]">12</p>
                      <p className="text-sm text-gray-500">Quizzes Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Award className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-[#1e3a5f]">78%</p>
                      <p className="text-sm text-gray-500">Average Score</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <Clock className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-[#1e3a5f]">5.2 hrs</p>
                      <p className="text-sm text-gray-500">Study Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f]">Recommended</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/mathematics" className="block">
                    <div className="p-3 border rounded-lg hover:border-[#0d9488] transition-colors">
                      <p className="font-semibold text-[#1e3a5f]">Practice Fractions</p>
                      <p className="text-sm text-gray-500">Improve your Math score</p>
                    </div>
                  </Link>
                  <Link href="/language-arts/mock-test" className="block">
                    <div className="p-3 border rounded-lg hover:border-[#0d9488] transition-colors">
                      <p className="font-semibold text-[#1e3a5f]">Language Arts Mock</p>
                      <p className="text-sm text-gray-500">Test your reading skills</p>
                    </div>
                  </Link>
                  <Link href="/writing-practice" className="block">
                    <div className="p-3 border rounded-lg hover:border-[#0d9488] transition-colors">
                      <p className="font-semibold text-[#1e3a5f]">Writing Task</p>
                      <p className="text-sm text-gray-500">Practice narrative writing</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
