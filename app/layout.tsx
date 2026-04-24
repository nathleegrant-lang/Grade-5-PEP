import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grade 5 PEP - Jamaica Primary Exit Profile Preparation',
  description: 'Interactive learning platform for Grade 5 students preparing for the Jamaica Primary Exit Profile (PEP) examination. Practice Mathematics, Language Arts, Science, and Social Studies.',
  keywords: ['PEP', 'Grade 5', 'Jamaica', 'Primary Exit Profile', 'Mathematics', 'Language Arts', 'Science', 'Social Studies', 'Education'],
}

export const viewport = {
  themeColor: '#1e3a5f',
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
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
