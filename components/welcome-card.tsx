import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users } from "lucide-react"

export function WelcomeCard() {
  return (
    <div className="grid h-full gap-5">
      <Card className="border-2 border-sky-100 bg-white">
        <CardContent className="p-6 md:p-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <BookOpen className="h-6 w-6 text-blue-700" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">For Students</p>
          <h3 className="mt-2 text-xl font-bold text-[#1e3a5f]">Practise with growing independence</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Review school learning, challenge yourself across Grade 5 subjects, learn from your results and build confidence for the PEP journey.
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-sky-100 bg-white">
        <CardContent className="p-6 md:p-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
            <Users className="h-6 w-6 text-amber-700" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">For Parents</p>
          <h3 className="mt-2 text-xl font-bold text-[#1e3a5f]">Support learning and appropriate challenge</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Reinforce what your child is learning at school, encourage regular purposeful practice and use the progress information already available to support confidence and growth.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
