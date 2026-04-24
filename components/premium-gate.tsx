"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Crown, Sparkles } from "lucide-react"
import Link from "next/link"

interface PremiumGateProps {
  children: React.ReactNode
  feature: string
  showPreview?: boolean
  previewContent?: React.ReactNode
}

export function PremiumGate({ children, feature, showPreview = false, previewContent }: PremiumGateProps) {
  const { user, isPremium } = useAuth()
  const isLoggedIn = !!user

  if (isPremium) {
    return <>{children}</>
  }
  
  return (
    <div className="relative">
      {showPreview && previewContent && (
        <div className="opacity-50 pointer-events-none blur-sm">
          {previewContent}
        </div>
      )}
      
      <Card className="absolute inset-0 m-4 bg-white/95 backdrop-blur-sm border-2 border-[#f59e0b] flex items-center justify-center z-10">
        <CardContent className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-[#f59e0b]/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            {feature} is available for premium members only.
          </p>
          <div className="flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <Button className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full border-[#0d9488] text-[#0d9488]">
                    <Crown className="w-4 h-4 mr-2" />
                    View Premium Plans
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/pricing">
                <Button className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium - $1,000 JMD/month
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple locked banner for inline use
export function PremiumBanner({ feature }: { feature: string }) {
  const { isPremium } = useAuth()

  if (isPremium) return null
  
  return (
    <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0d9488]/10 border border-[#f59e0b]/30 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#1e3a5f]">Unlock {feature}</p>
          <p className="text-sm text-gray-600">Upgrade to premium for full access</p>
        </div>
        <Link href="/pricing">
          <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
            Upgrade
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Hook to check premium status
export function usePremium() {
  const { isPremium } = useAuth()
  return { isPremium }
}
