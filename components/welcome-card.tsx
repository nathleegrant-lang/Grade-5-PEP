import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WelcomeCard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="h-full overflow-hidden border border-sky-100 bg-sky-50/45 shadow-sm">
        <div className="relative h-56 w-full overflow-hidden">
          <Image src="/images/grade5-student-practice.jpg" alt="Grade 5 learner practising independently with a laptop and notebook" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <CardContent className="p-7 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">For Students</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1e3a5f]">Practise with growing independence</h3>
          <p className="mt-3 leading-relaxed text-gray-600">Review what you are learning at school, challenge yourself across Grade 5 subjects, learn from your results and build confidence for the PEP journey.</p>
          <Link href="/mock-tests" className="mt-5 inline-block"><Button className="bg-blue-700 text-white hover:bg-blue-800">Start Practice</Button></Link>
        </CardContent>
      </Card>

      <Card className="h-full overflow-hidden border border-amber-100 bg-amber-50/45 shadow-sm">
        <div className="relative h-56 w-full overflow-hidden">
          <Image src="/images/grade5-parent-support.jpg" alt="Parent supporting a Grade 5 learner who is actively working on a laptop" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <CardContent className="p-7 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">For Parents</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1e3a5f]">Support learning and appropriate challenge</h3>
          <p className="mt-3 leading-relaxed text-gray-600">Strengthen what your child is learning at school, encourage regular purposeful practice and use the progress information already available to support confidence and growth.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard"><Button className="bg-amber-500 text-[#102f57] hover:bg-amber-600">View Dashboard</Button></Link><Link href="/pricing"><Button variant="outline" className="bg-white">View Pricing</Button></Link></div>
        </CardContent>
      </Card>
    </div>
  )
}
