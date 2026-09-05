import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { ProgressProvider } from "@/contexts/progress-context"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Grade 6 PEP Ready - Jamaica Primary Exit Profile Preparation",
  description:
    "Complete interactive preparation for Grade 6 students sitting Jamaica's Primary Exit Profile examinations, including Mathematics, Language Arts, Science, Social Studies, performance tasks, mock examinations, and ability-test practice.",
  keywords: [
    "PEP",
    "Grade 6",
    "Jamaica",
    "Primary Exit Profile",
    "Ability Test",
    "Mental Ability",
    "Mathematics",
    "Language Arts",
    "Science",
    "Social Studies",
    "Performance Tasks",
    "Mock Examinations",
    "Secondary School Placement",
  ],
}

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <AuthProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
