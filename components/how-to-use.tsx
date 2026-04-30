import { Card, CardContent } from "@/components/ui/card"

const steps = [
  { number: 1, text: "Choose a subject" },
  { number: 2, text: "Review a topic" },
  { number: 3, text: "Complete practice activities" },
  { number: 4, text: "Try a mock test" },
]

export function HowToUse() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-[#1e3a5f] text-center">
        How to Use This Site
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => (
          <Card key={step.number} className="border border-gray-200">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-sm font-bold mx-auto mb-2">
                {step.number}
              </div>
              <p className="text-gray-600 text-xs leading-tight">
                {step.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
