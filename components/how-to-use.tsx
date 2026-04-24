import { Card, CardContent } from "@/components/ui/card"

const steps = [
  { number: 1, text: "Choose a subject" },
  { number: 2, text: "Review a topic" },
  { number: 3, text: "Complete practice activities" },
  { number: 4, text: "Try a mock test" },
]

export function HowToUse() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#1e3a5f] text-center">
        How to Use This Site
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <Card key={step.number} className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {step.number}
              </div>
              <p className="text-gray-600 text-sm">{step.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
