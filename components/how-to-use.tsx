import { Card, CardContent } from "@/components/ui/card"

const steps = [
  { number: 1, text: "Choose a subject" },
  { number: 2, text: "Review a topic" },
  { number: 3, text: "Complete practice activities" },
  { number: 4, text: "Try a mock test" },
]

export function HowToUse() {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5">
        <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">
          How to Use This Site
        </h3>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {step.number}
              </div>
              <p className="text-gray-600 text-sm leading-snug pt-0.5">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
