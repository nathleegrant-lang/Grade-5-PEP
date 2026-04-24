"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, Crown, Zap, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    priceJMD: "",
    period: "",
    description: "Get started with basic learning",
    icon: Zap,
    color: "bg-gray-500",
    paypalAmount: 0,
    features: [
      "Access to all topic lessons",
      "1 quiz per topic",
      "Limited mock test questions",
      "Basic progress tracking",
    ],
    notIncluded: [
      "Full mock exams",
      "Printable worksheets",
      "Writing practice with rubrics",
      "Certificates",
      "Priority support",
    ],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$1,000 JMD",
    priceJMD: "~$6.50 USD",
    period: "/month",
    description: "Full access for one month",
    icon: Star,
    color: "bg-[#0d9488]",
    paypalAmount: 6.50,
    features: [
      "Everything in Free, plus:",
      "Unlimited quizzes",
      "Full mock exams with analytics",
      "Printable worksheets (PDF)",
      "Writing practice with rubrics",
      "Detailed progress reports",
      "Achievement certificates",
    ],
    notIncluded: [],
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$10,000 JMD",
    priceJMD: "~$65 USD",
    period: "/year",
    description: "Best value - 2 months FREE!",
    icon: Crown,
    color: "bg-[#f59e0b]",
    paypalAmount: 65,
    features: [
      "Everything in Monthly, plus:",
      "2 months FREE (save $2,000 JMD)",
      "Family account (up to 3 children)",
      "Exclusive bonus content",
      "Priority email support",
      "Early access to new features",
      "Downloadable study guides",
    ],
    notIncluded: [],
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async (plan: typeof plans[0]) => {
    if (!user) {
      // Redirect to register if not logged in
      router.push("/register?redirect=pricing")
      return
    }

    if (plan.id === "free") {
      router.push("/register")
      return
    }

    setLoadingPlan(plan.id)
    setError(null)

    try {
      // Create PayPal order
      const createResponse = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      })

      const createData = await createResponse.json()

      if (createData.error) {
        throw new Error(createData.error)
      }

      // Open PayPal popup for payment approval
      const paypalWindow = window.open(
        `https://www.paypal.com/checkoutnow?token=${createData.orderID}`,
        "PayPal",
        "width=500,height=700,scrollbars=yes"
      )

      // Poll for window close and check payment status
      const checkPayment = setInterval(async () => {
        if (paypalWindow?.closed) {
          clearInterval(checkPayment)
          
          // Capture the payment
          const captureResponse = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              orderID: createData.orderID, 
              plan: plan.id,
              userEmail: user.email 
            }),
          })

          const captureData = await captureResponse.json()

          if (captureData.success) {
            // Server already updated subscription in database, just refresh local user state
            await refreshUser()

            // Redirect to success page
            router.push("/payment-success")
          } else {
            setError("Payment was not completed. Please try again.")
          }
          
          setLoadingPlan(null)
        }
      }, 1000)

    } catch (err) {
      console.error("Payment error:", err)
      setError("An error occurred. Please try again or contact support.")
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#0d4a5f] to-[#0d9488] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Invest in Your Child&apos;s Success
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Unlock full access to all PEP preparation materials and give your child the best chance to excel
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 pt-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {!user && (
          <div className="max-w-6xl mx-auto px-4 pt-8">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
              Please <a href="/login" className="underline font-semibold">sign in</a> or <a href="/register" className="underline font-semibold">create an account</a> first to purchase a subscription.
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative ${plan.popular ? "border-2 border-[#0d9488] shadow-xl scale-105" : "border border-gray-200"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-[#0d9488] text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`w-14 h-14 ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-[#1e3a5f]">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-[#1e3a5f]">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                      {plan.priceJMD && (
                        <p className="text-sm text-gray-500 mt-1">{plan.priceJMD}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 opacity-50">
                          <span className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0 text-center">-</span>
                          <span className="text-gray-500 text-sm line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${plan.id === "free" 
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                        : plan.popular 
                          ? "bg-[#0d9488] hover:bg-[#0d7a6f]" 
                          : "bg-[#1e3a5f] hover:bg-[#15304d]"
                      }`}
                      onClick={() => handlePayment(plan)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : plan.id === "free" ? (
                        "Get Started Free"
                      ) : (
                        "Pay with PayPal"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Info */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-[#0d9488] bg-teal-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">
                  Secure Payment with PayPal
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Pay with any NCB, Scotiabank, or JMMB Visa/Mastercard
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    No PayPal account needed - pay as guest
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Instant account activation after payment
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    7-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1e3a5f] text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  How do I pay from Jamaica?
                </h3>
                <p className="text-gray-600">
                  You can pay using any Visa or MasterCard debit/credit card through PayPal. 
                  NCB, Scotiabank, JMMB, and other Jamaican bank cards are accepted. You don&apos;t need a PayPal account.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  How long does activation take?
                </h3>
                <p className="text-gray-600">
                  Your account is activated instantly after successful payment. You can start using all premium features right away!
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  Can I cancel my subscription?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel anytime. Your access will continue until the end of your billing period.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee if you&apos;re not satisfied with the premium features.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  How many children can use one account?
                </h3>
                <p className="text-gray-600">
                  Monthly plans are for 1 child. Yearly plans include a Family Account for up to 3 children.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#0d4a5f] to-[#0d9488] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
            <p className="mb-6 text-white/90">
              We&apos;re here to help! Reach out to us for any questions about subscriptions or payment.
            </p>
            <Button 
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white"
              onClick={() => window.location.href = "mailto:grade5pep@gmail.com"}
            >
              Contact Us
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
